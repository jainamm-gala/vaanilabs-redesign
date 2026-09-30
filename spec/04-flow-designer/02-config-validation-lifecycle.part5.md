
### 7.8 Speak

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Speak" + number | Required; duplicate labels warn (W05) |
| Agent says | PromptField, rows 3, soft limit 600 | empty | Required (E05 "Add what the agent says."). Hint on the count row: "About 9 s spoken" (estimated at the voice's pace). Over about 30 s: W09 "Long lines lose callers. Split this into two steps or ask a question." |
| Let the caller interrupt | Switch | On | |
| Language | Language override (§10.3) | Auto | |

Output: 1. The canvas body shows the first two lines with tokens (part 1).

### 7.9 Knowledge lookup (includes today's FAQ)

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Knowledge lookup" | Required |
| Search in | RadioGroup: All indexed sources · Chosen sources · This step's Q&A | All indexed sources | Chosen sources reveals a MultiSelect of sources, each option with its status sentence ("Indexed · 42 passages", "Indexing… 60%", "Couldn't index") from the Knowledge spec. **This step's Q&A** replaces the FAQ step: a list of Question + Answer pairs ("+ Add question") |
| Look up | SegmentedControl: What the caller asked · A set query | What the caller asked | A set query reveals a PromptField ("EMI due date for {{loan_type}}") |
| Answer style | Select: In the agent's own words · Read the passage closely | Own words | Hint for "closely": "For prices and policy wording." |
| Try a question | SearchInput `sm` + result line | | "Would answer from 3 passages · price-sheet.pdf" or "Nothing matched well enough. The call takes Not found." (Knowledge spec K2 verdict copy) |

Outputs: **Found** · **Not found** (both required, E03). Rules: no indexed source in scope, or an empty Q&A list (E13 "Nothing to search. Upload a document in Knowledge or add Q&A here."); a chosen source that was deleted (E13, Knowledge spec §1.8); a chosen source indexing or failed (W06). Storage names like `1789987752864-price.pdf` never show; sources use their titles (F-FLOW-033).

### 7.10 CRM lookup

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| (top) | IntegrationStatusRow for the connector | | |
| Label | TextInput | "CRM lookup" | Required |
| Connector | Select of connectors + "New connector…" (opens Settings › Integrations in a new tab) | none | None: E13 "Choose a connector." Disconnected: W02 |
| Find the record by | Select: Caller's phone number · A variable | Caller's phone number | A variable reveals a VariableField picker |
| Bring in | MultiSelect of the connector's fields | none | Each becomes `{{crm_<field>}}` (§8.1). Disabled until a connector is chosen: "Choose a connector first." |

Outputs: **Found** · **Not found**. Helper under Outputs: "If no record matches, the agent says so and never guesses." (replaces the `no_match` and "no embeddings" copy, F-FLOW-033).

### 7.11 Book meeting

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| (top) | IntegrationStatusRow: Google Calendar | | |
| Label | TextInput | "Book meeting" | Required |
| Agent asks | PromptField | "Which day suits you for the site visit this week?" | Required |
| Meeting type | SegmentedControl: Phone call · Video call · In person | Phone call | In person reveals Address (Textarea, 2 rows, required) |
| Length | Select: 15, 30, 45, 60, 90, 120 min | 30 min | Never undefined (fixes "Duration: undefined minutes", F-FLOW-013) |
| Offer times from | RadioGroup: Google Calendar free time · Set hours | Calendar when connected, else Set hours | Set hours reveals the CallingHours recipe ("Meeting hours · IST") plus "Earliest" (Select: Later today · Tomorrow · In 2 days). Free text slots are retired (F-FLOW-030) |
| Confirm by | Checkbox group, each disabled with its reason when unavailable: Send WhatsApp confirmation (Select template; "Needs WhatsApp. Connect it in Settings.") · Send email (needs `{{lead_email}}`: W11 "Some leads have no email. They won't get one.") · Add to Google Calendar ("Needs Google Calendar.") | WhatsApp on only if connected; others off | Defaults never assume a connection (F-FLOW-030). Checkboxes use the standard `--accent` checked fill, not amber |
| Save the booked time to | VariableField | `{{meeting_time}}` | Created automatically; renaming updates uses |

Outputs: the main output (booked) and the fallback row **Not booked** (declined, or no time suited), proposed in §25 R2. Until part 1 adopts it, Book meeting has one output and the agent's prompt handles a refusal.

### 7.12 Send WhatsApp

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| (top) | IntegrationStatusRow: WhatsApp Business | | Not connected: W02 |
| Label | TextInput | "Send WhatsApp" | Required |
| Template | Select; each option shows a StatusTag: Approved (success) · Pending (warning) · Rejected (danger, disabled with "Rejected on 20 Sep. Pick another.") | none | None: E12 "Choose a template." Pending: W01 "'visit_confirm' is pending approval. Calls continue; the message waits." |
| Preview | A read-only message card (`surface-2`, radius 8, `read-15`) with placeholders filled from Test data | | Shows exactly what the caller receives |
| Fill the template | One row per placeholder: `{{1}}` → VariableField picker | first matching variable | Unmapped: E12 "Fill {{2}} in the template." |
| Send to | Select: Caller's number · A variable | Caller's number | |
| Attachment | Select: None · A file from Assets · A link | None | Link uses `httpsUrl` (C §8.2). Files come from Settings › Workspace › Assets (Knowledge spec) |
| Tell the caller (optional) | PromptField | "I've sent the details on WhatsApp." | |

Output: 1 (sending is asynchronous; a failed send is recorded on the call report, not a branch).

### 7.13 Transfer to a person

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Transfer to a person" | Required |
| Transfer to | RadioGroup: A phone number · Rep console · A variable | Rep console when reps exist, else A phone number | Phone number: PhoneInput (C §4.1). "abc" shows "Enter a number with the country code, like +91 98765 43210." on blur; the step keeps its last valid number (E10). Rep console reveals Select of queues ("Any available rep") |
| Say before transferring | PromptField | "Connecting you to our site manager. Please hold." | Required |
| Ring for | NumberInput 10–60, unit "s" | 30 s | "10 to 60 seconds" |
| Brief the person first | Switch | On | "They hear a one-line summary before the caller joins." |

Outputs: the fallback row **Didn't connect** (no answer or busy). A transfer that connects ends the agent's part of the call and records the outcome **Transferred** (part 1 §4.3); nothing runs after it.

### 7.14 End with outcome

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Outcome | Select: Interested · Callback · Not interested · No answer · Transferred · Do not call · Failed · Ended (lead unchanged; migrated End steps) | Interested | Sets the tile's state tint (D §6.5) and the canvas status line "Lead → Interested" (plain text, part 1 §5.1) |
| Label | TextInput | the outcome name ("Visit booked" is typical) | Required |
| Set lead status to | Select from the Lead status map (N §5.3) | mapped per part 1 §4.3 (Interested → Interested, Callback → Callback due, No answer → Not reached, Transferred → Contacted, Do not call → Do not call; Failed and Ended leave it unchanged) | "Do not call" shows the consequence: "This lead won't be called again." |
| Callback time | VariableField (Callback only) | none | Missing: W10 "Callbacks need a time. Save one on an earlier question." |
| Say before ending (optional) | PromptField | "Thank you for your time. Have a good day." | |
| Add a note to the lead (optional) | PromptField, rows 2 | none | "Visit booked for {{meeting_time}}." |

No outputs. Test calls and browser tests never write lead status or notes (Cockpit §1.1 rule 5); the Test panel says so when an Outcome is reached (§13.4).

### 7.15 Unsupported step

Any stored type missing from the registry (legacy AI draft or imported JSON) renders as a neutral rectangle with an amber border and the words "Unsupported step" (part 1 draws it). Its inspector:
- Notice (warning): "This step uses a type Vaani doesn't recognise: `emergency_dispatch`. Calls can't run it. Convert it or delete it."
- Label (read-only) and the stored text, if any, shown read-only.
- **Convert to…** Select (Speak · Transfer to a person · End with outcome), keeping the label and text; one undo step.
- Rule E14 (error): "'Call ambulance' uses an unsupported type." (F-FLOW-029).

---

## 8. Variables and templating

### 8.1 Where variables come from

Variable names stay flat snake_case, as today (`{{lead_name}}`), so existing prompts keep working. Groups exist only in the picker.

| Group | Examples | Source | Available |
|---|---|---|---|
| Captured in this flow | `{{visit_intent}}`, `{{meeting_time}}`, `{{verified}}` | Save answer to (Question), Verify caller, Book meeting | After the step that captures it, on that path |
| Lead | `{{lead_name}}`, `{{lead_city}}`, `{{lead_language}}`, `{{lead_email}}`, custom lead fields | Leads (FD10) | Whole call; may be empty per lead |
| CRM | `{{crm_plan}}`, `{{crm_due_date}}` | CRM lookup "Bring in" | After that lookup's Found path |
| API input | `{{order_id}}` | API trigger inputs | Whole call when started by the API |
| Call | `{{call_direction}}`, `{{call_date}}`, `{{caller_number}}` (masked in previews) | The call | Whole call |
| Workspace | `{{company_name}}`, `{{agent_name}}` | Settings | Whole call |

### 8.2 PromptField

Every "Agent asks / says" field. It is the Textarea (C §3.6) plus variable tokens, a picker and a preview.

| Part | Spec |
|---|---|
| Input | A native `<textarea>` (keeps undo, spellcheck, IME for Devanagari and paste) with a mirrored highlight layer behind it that draws tokens; never a `contenteditable` |
| Token look | `{{lead_name}}` in `mono-12` on `surface-3`, radius 4, 1 px `border`; an unknown variable gets a 1 px `danger-border` and a wavy `danger` underline (shape plus colour) |
| Insert variable | IconButton `braces` 28 at the label row's end ("Insert variable"), opening the picker at the caret |
| Picker | Combobox listbox (C §5.3) grouped as §8.1, each option: name (`mono-12`), label ("Lead name"), source and sample ("sample: Anika"); unavailable-here options listed last, disabled with the reason ("Captured later, in Book meeting") |
| Trigger | Typing `{{` opens the picker filtered by what follows; Enter or Tab inserts `{{name}}` and closes; Esc closes and leaves the braces |
| Preview | Under the field: "Sounds like: 'Anika ji, would you like to visit the site this week?'" in `meta-12` `text-2`, with sample values from Test data; an empty variable shows its fallback or "(empty)" in `text-3`. ▶ **Hear it** (IconButton `play`) speaks the line in the flow's voice and language |
| Count | "About 9 s spoken · 142 of 600" (soft limit, C §3.6) |
| Errors | E05 empty · E11 "Unknown variable {{lead_nmae}}. Did you mean {{lead_name}}?" with a one-click fix link · W03 used before captured · W07 may be empty without a fallback |

**Fallback values** (FD10): `{{lead_name | "sir"}}` speaks "sir" when the lead has no name. The picker offers "Add a fallback" on a selected token. Hidden until the runtime supports it.

### 8.3 VariableField (Save answer to, Save the booked time to)

A TextInput with a `{{ }}` affix and a Combobox of existing captured variables. New names are validated as snake_case ("Use lowercase letters, numbers and _ only.") and unique in the flow. Renaming a captured variable asks once: "Rename {{visit_intent}} in 3 steps too?" · Rename everywhere (default) · Only here; one undo step either way.

### 8.4 The Variables panel (`V`)

The left panel (`--size-left-panel` 280, part 1 §3.1), sharing the slot with Add step, Outline and Version history. A searchable list grouped as §8.1; each row: name (`mono-13`), label, type, "Used in 3 steps" (a button that runs Find for it), "Captured by Ask about a site visit" (link to the step), and its sample value (editable; the same values as Test data). Unused captured variables show "Not used" in `text-3`. Empty: "Variables appear when a step saves an answer or a lookup brings in fields."
