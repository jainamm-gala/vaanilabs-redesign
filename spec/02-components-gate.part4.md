
---

## 5. Variants

Each variant is the frame of §1, the checks of §2, the consequence line of §3 and the behaviour of §4, plus the configuration below. Pages add only the table of their §0.3 section.

### 5.1 `CallGate` (single and batch)

**Container:** popover gate (§1.3). **Global blockers** (§4.4): offline · a role that can't place calls · wallet ₹0 · no verified caller ID · no live flow at all (for a Real call).

| | `mode="single"` | `mode="batch"` |
|---|---|---|
| Opened from | Cockpit primary and `C` (CK §3.4) · Leads row "Call…", sheet "Call…", `C` on a focused row (L §6.10) · ⌘K "Call Lead 1042…" · Home "Call my number…" (SH §13.3) · Rep console "Call back…" · an Assistant "call yourself" step | Leads BulkBar "Call {n} leads…" and `C` with a selection · the Assistant Call step "Review and call…" (AS §10.4) · a Personal-agent call decision (MP §2.7) |
| Call kinds (CK §1.1) | Test call or Real call (a Browser test only if the owner decides it is billed, CK §8 Q2) | Real call only |
| Scope | `settings="readonly"` when the choices were made before the gate (the Cockpit card, a Personal-agent task): `KeyValueList variant="inline"`: To (name, `PhoneText`, `LanguageMark` name) · Flow (name + version Tag + tested state) · Voice · Caller ID. `settings="editable"` everywhere else: one summary line "Site-visit qualifier v7 · Vaani · Auto language · Caller ID •••• 2210" + **Change**, which expands `FlowSwitcher purpose="assign"` (live flows only; "Uses each lead's flow" with its breakdown when assignments differ), `VoicePicker variant="compact"` (N §12.3), Language `Select`, Caller ID `Select`. Changes apply to this call or batch only; "Make default" is a separate link with an Undo toast (F-UX-014) | Always `editable`, except from a Personal-agent task (`readonly`: the task's settings) |
| Choice (`choice` prop) | `"when-needed"` (Cockpit: a live console calls now): shown only when a Real call is outside calling hours: **Place now** (disabled, "Outside calling hours") · **Schedule for 10 am IST** (a `TimeField` within the next opening). `"always"` (Leads, where scheduling one callback is an everyday job): the batch pair below | `"always"`: **Place now** "Calls start in order within a minute." · **Schedule…** "Pick a time inside calling hours." (DateTime limited to calling hours, IST) |
| Primary | "Place call" · "Schedule call" | "Start {n} calls" · "Schedule {n} calls" ({n} after adjustments) |
| Confirm | `POST /api/calls` | `POST /api/calls/batches` |
| Done | Cockpit: the card becomes the call (`?call=<id>`), focus → the call card heading, announce "Dialling". Elsewhere: toast "Calling Lead 1042 · **Open in Cockpit**", focus → the trigger | Selection clears; toast "Starting 9 calls · **View in Cockpit**"; the batch is in Cockpit › Up next as **Scheduled** with Pause and Cancel; focus → the trigger or the table's active row; announce "9 calls scheduled. Selection cleared." |
| Failure copy | "Couldn't reach the phone line. The call was not placed and you were not charged." (the last clause only when confirmed) | "Couldn't start the calls. Nothing was dialled." |

**Header per kind** (§1.4):

| Kind | Title | Tag | Consequence sentence |
|---|---|---|---|
| Real call, single | "Call Lead 1042" / "Call +91 98765 43210" | none (the absence is deliberate, CK §7.5) | "Their phone rings when you place the call." |
| Real call, batch | "Call 9 leads" | none | "Nothing dials until you start." |
| Test call | "Call your phone" | `CallKindTag` Test call | "Your phone rings when you place the call. Not counted in reports." |
| Browser test (only if billed) | "Talk in browser" | `CallKindTag` Browser test | "Uses your microphone. Nobody else is called." |

**The check catalogue** (one list, server ids; pages choose none of it, the server returns what applies to the kind and mode):

| id | Applies to | `pass` | `blocking` (or global, §4.4) | `adjusted` (batch) | `advisory` | Action |
|---|---|---|---|---|---|---|
| `connection` | All | (hidden) | Global: "You're offline." (the ConnectionBar owns the message) | — | — | — |
| `role` | Test, Real | (hidden) | Global: "Your role can't place phone calls. Ask an admin." | — | — | Ask an admin |
| `wallet` | Test, Real | "Wallet ₹2,340.50 · about 16 h of calls" · batch: "Wallet covers this batch" | Global at ₹0: "Wallet is ₹0. Top up to place calls." (in-gate only if it drops while open) | — | `warning`: "₹42.10 left · about 17 min of calls" · "Wallet covers about 40 of 120 calls. Calls pause at ₹0." | Top up · Turn on autopay |
| `caller_id` | Test, Real | "Caller ID +91 80 •••• 2210 verified" | Global: "Verify a caller ID before placing phone calls." (members: "Ask an admin to verify one.") | — | — | Phone setup |
| `flow_live` | Real | "Site-visit qualifier v7 is live" | Global when no flow is live: "No live flow. Publish a flow to call leads." · In-gate: "Draft v8 can only call your own number. Use Live v7 or Call my phone." · "Draft v8 has 2 errors. Fix them in the flow." | Mixed flows: "Home-loan follow-up has no live version · 1 lead skipped" | — | Open flow |
| `flow_tested` | All | The meta line of `flow_live`: "Test call on this version today, 11:02 am" | — | — | "Live v7 hasn't been tested since it was published. Talk in browser first." · batch: "No test call on v7 yet" | Talk in browser · Place a test call… |
| `calling_hours` | Real | "Inside calling hours · open until 7 pm IST" | "Outside calling hours. Opens 10 am IST." (Place now only; choosing Schedule clears it) | — | — | Schedule (switches the choice and presets the next opening) |
| `dnd` | Real, to leads | "Not on the DND list" · batch: "DND registry: 12 of 12 clear" | Single: "This number is on the DND list. It can't be called for promotions." (exact rule: CK §8 Q7) | "1 lead is on the DND registry · Skipped" | — | Include (only with recorded consent) |
| `recent_call` | Real, to leads | (hidden) | — | "2 leads were called in the last 24 h · Skipped to avoid a repeat call" | Single: "Called 22 h ago · Callback due today" (information; nothing to include) | Include (batch) |
| `already_scheduled` | Real, batch | (hidden) | — | "4 leads are already scheduled in 'Weekend follow-ups' · Skipped" | — | View in Cockpit (no Include: it would dial twice) |
| `do_not_call` | Real, to leads | (hidden) | Single: "Lead 1042 is marked Do not call." | "1 lead is marked Do not call · Skipped" | — | none |
| `number_valid` | Real | (hidden) | Single: "This number isn't valid. Check it on the lead." | "1 lead has no valid phone number · Skipped" | — | Fix (opens the lead) |
| `language` | Real | (hidden) | — | — | "2 leads prefer Tamil. Vaani speaks Hindi and English." | Choose voice · Keep |
| `all_skipped` | Batch (derived) | — | "All 3 leads were skipped. Include some, or cancel." (why-text; the primary stays `aria-disabled`) | — | — | — |

Inline readiness lists outside the gate add two rows the gate itself never needs, because they concern the browser: `microphone` (Browser test, Take over, Rep console: pass "Microphone allowed" / "Asks for your microphone when you start"; blocking "Microphone blocked. Allow it in your browser's site settings, then Retry." with an info Popover of steps) and the Rep console's `call_channel`, `speaker` and `notifications` rows (CK §5.6).

**States and copy** (the §4.1 machine with this variant's words):

| State | Copy |
|---|---|
| Checking | Summary "Checking 12 leads…" · why-text "Checking…" |
| Ready | "All 5 checks pass" · single: "Ready · 1 thing to know" · batch: "9 calls ready · 3 leads skipped" |
| Blocked | "Phone calls blocked · 1 thing to fix"; why-text = the first blocking sentence ("Calls can't start outside calling hours.") |
| Changed | "Checks changed since you opened this. Review and start again." |
| Confirming | "Placing call…" · "Starting…" |
| Estimate unavailable | "9 calls · Rate ₹0.04/s" and the balance, no runway (§3.4) |

### 5.2 `PublishGate` (publish and roll back)

**Container:** sheet gate (§1.3). **Global blockers:** offline · a role that can't publish ("Only admins can publish this flow. Ask Anika R. or Rohit S.") · nothing to publish (the entry reads "Nothing to publish", `aria-disabled`). **Opened by:** "Publish v8…" in the Flow header, the palette action, "Roll back to v7…" (`mode="rollback"`), and the Assistant's Publish step launcher. Opening flushes pending draft saves, then preflights (server validation with the shared rule ids, FD4, plus where the flow is used, FD5).

| Part | Configuration |
|---|---|
| Header | Title "Publish v8" / "Roll back to v7"; meta "Site-visit qualifier · draft from v7 · 3 changes by you and Anika R."; consequence "Callers hear v8 only after you publish." |
| Body order | **Checks** (`h3` `--type-title-14` + summary) → **Where it goes live** (`TargetList`, FD §5.3) → **Changes** (`DiffList`, FD §5.4) → **Note** (Textarea, FD §5.5). The decision first, then its blast radius, then the detail |
| Checks | The flow rule catalogue (FD §5.2) mapped to the enum: each **error** is `blocking` with one sub-row per error and "Go to step"; each **warning** is `advisory` `severity="warning"` with a required `ack` "Publish with this warning"; **Tested on this draft** is `advisory` with an `ack` "Publish without testing" whose `reasonOptions` (Wording change only · Urgent fix · Tested another way · Other) are stored on the version; draft not saved, draft changed while open, number not verified, voice and language mismatch are `blocking`; wallet and calling hours are `advisory` (publishing costs nothing, so money never blocks it); "Couldn't run the server check" is `unknown` |
| Consequence | `impact`: why-text "Callers hear v8 from the next call." and, under Where it goes live, "Calls in progress finish on v7. New calls use v8." |
| Primary | "Publish v8" · "Publish with 1 warning" · "Publish without testing" · "Roll back to v7" · busy "Publishing…" |
| Summary copy | "Ready to publish" · "Ready · 1 warning to confirm" · "2 errors block publishing" · "Checking…" |
| Changed | Server 422 found more issues: rows update, summary "The server found 1 more error", focus to the summary. 409 (Live changed while open): a blocking row "Anika R. published v8 at 11:40 am while this was open. This draft now publishes as v9. **Review changes**" |
| Done | Focus returns to the Publish button that opened the gate (the header's, or the phone sticky bar's), which stays in place as `aria-disabled` "Nothing to publish. Your draft matches Live v8." at every width, so focus never falls to `<body>` (06 §7.3, `05-responsive` §10.8); toast (O §9.2 `publish`, 6 s, Roll back then stays in the version menu) "v8 is live on 1 number and 1 batch · **Roll back to v7…**"; announce "Version 8 is live." (FD §5.7) |
| Failure copy | "Couldn't publish. Nothing changed: callers still hear v7." + Retry |
| "Go to step" / "Show" / "Test now" | Close the gate and move focus to the step, the change or the Test panel (§4.6); the note is kept for the session |
