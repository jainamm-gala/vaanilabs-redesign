## 3. Cockpit regions and components (with configuration)

### 3.1 Page frame

| Region | Component (spec) | Configuration |
|---|---|---|
| Header | `PageHeader variant="page"` (data-nav §2) | H1 "Cockpit" (`title-20`, `tabindex="-1"`). Meta (computed, `data-13` `text-3`): "No calls in progress" · "1 live call · 2 up next" · "Checking calls…" (skeleton bar while loading, never "0 calls"). Actions only while a call is shown in the card: `CallSwitcher` (below 1440) and `Button variant="secondary" leadingIcon={Plus}` "New call" |
| Page notices | `WalletNotice page="cockpit"` (overlay §10.2), `ConnectionBar` (overlay §10.3) | One line under the header; at most one page notice (most severe first). No notice for setup: the readiness checklist carries it |
| Body | CSS grid | ≥1440: `grid-template-columns: var(--size-cockpit-calls) var(--size-cockpit-card) minmax(0,1fr)`; 1024–1439: `var(--size-cockpit-card) minmax(0,1fr)`; below 1024: one column. Gap 0; columns separated by 1 px `border` hairlines on `surface`; the body fills `100dvh` minus chrome, and each column is `display:flex; flex-direction:column; min-height:0` with its own `overflow-y:auto` |
| Baseline | Baseline (direction §6.1) | Segments: call in progress with its timer (links to `?call=`), live flow and version, inbound number readiness, wallet with runway, calls in progress. The call segment names the kind for tests ("On test call 01:12") |
| Nav badge | `NavBadge kind="live"` on Cockpit (data-nav §1.5) | "2 live", pulsing LiveDot while at least one call is live; nothing when idle |

### 3.2 Calls column (≥1440) and CallSwitcher (below 1440)

New component **CallsColumn** (§7.4). 240 px, `bg` plane (it is navigation-like), right hairline.

| Part | Spec |
|---|---|
| "New call" item | First row, 40 px, `plus` 16 + "New call" `label-13`. Selected when the card shows the New call form (`?new=1` or no `?call`) |
| Group headers | `label-12` `text-3` sentence case with a CountBadge: "Live now 1", "Up next · Scheduled", "Recent". Headings are `h2` visually styled as group labels |
| Call item (`CallListItem`) | 2 lines, min height 48, padding `space-8 space-12`, radius-6. Line 1: name (`data-13`/500, `translate="no"`, ellipsis) + right-aligned `Timer` (`meta-12` tabular, live) or time (recent). Line 2 (`meta-12` `text-3`): state word with its icon (CallStateTag `default` for live and ringing; the StatusTag call result for recent) · flow and version · a `Tag outline` "Test" for Browser tests and Test calls · `phone-incoming` icon for inbound. Hover `surface-2`; selected = selection treatment (accent-soft + 2 px inset `accent-mark` bar) with `aria-current="true"` |
| Batch item (`BatchItem`) | Name (`data-13`/500), "2 of 48" (`meta-12`, tabular), "Next · 11:30 am" (no lead name if the viewer cannot see it), then `Button size="sm" variant="secondary"` "Pause" and `variant="tertiary"` "Cancel…" (ConfirmDialog tier 2: "Cancel 'Weekend follow-ups'? 46 calls won't be placed. Calls already placed stay in Call reports.") |
| Empty groups | Compact EmptyState lines: "No calls live." · "Nothing scheduled." · "No calls yet today." |
| Scope | Live now lists every live call in the workspace that the viewer can open in Call reports (supervisors see all, §8 Q3). Recent lists today's calls started from this workspace, newest first, 20 max, then "Open Call reports" |
| Keyboard | One tab stop for the list (roving tabindex): ↑/↓ move, Home/End jump, Enter opens the item (`?call=`). Pause and Cancel are reached with Tab from a focused batch item |

**CallSwitcher** (§7.4): `Button variant="secondary"` "Calls · 1 live" + `chevron-down`, `aria-haspopup="dialog"`, opening `Popover variant="default"` at 320 px with the same content. Tablet and phone: the TopBar call chip opens it as a bottom sheet when more than one call is live; with one call the chip links straight to it.

### 3.3 The New call card (`ReadyToCallCard`, §7.1)

A `section` on `surface` filling the card column (no outer border inside the column; one level of containment), padding `space-panel-pad-lg` (20). Heading `h2` "New call" (`title-16`), not "Ready to call": the card must not claim readiness it hasn't proven (P1). Form spacing: `space-field-gap` between fields, `space-group-gap` between groups. Standard density always (forms, P4); Touch on coarse pointers.

| # | Field | Component | Configuration and copy |
|---|---|---|---|
| 1 | **Contact** | `ContactField` recipe (§7.3): `Combobox` + `PhoneInput` (core §4.1, §5.3) | Label "Contact". Hint "Search leads by name or number, or type a number." Placeholder "Name or number…". Listbox groups: **You** ("My phone · +91 •••••• 4821 · Verified", or "Add your number in Profile to test on your phone" when none is verified); **Leads** (two-line options: name + StatusTag / masked number · city · LanguageMark); **Number** (typing 10 digits offers "Call +91 98765 43210", with "Already a lead · Open" when it matches one). Clear button `x` resets the target. Validation per PhoneInput ("Enter a 10-digit mobile number, like 98765 43210."). Optional for `Talk in browser` |
| 2 | **Lead details** (only with a lead) | `KeyValueList variant="inline"` (data-nav §8) with an `h3` "Lead details" and a link `Open lead` (lead sheet in Leads, new tab) | Rows: Status (StatusTag), City (source "from Leads"), Language (LanguageMark), Last call ("21 Sep · Callback", or "No calls yet"), then **the fields this flow uses** (its lead variables), each with its value or "Not captured". Never email, company or sentiment unless the lead record has them. Link `Edit for this call…` (§3.3.1) |
| 3 | **Flow** | `FlowSwitcher purpose="call"` (core §5.4) | Label "Flow". Default: the Cockpit default flow, marked with a `Tag outline` "Cockpit default" in its option. Drafts read "Draft · test calls only". Under it (`meta-12`): "Tested today 10:12 am · **Open in flow**" or "Not tested since publish · **Open in flow**". "Make default" appears as a link only when the pick differs from the default |
| 4 | **Voice** | `VoicePicker variant="compact"` (data-nav §12.3) | Label "Voice". Options from the flow's allowed voices; preview in the flow's language. Helper "For this call only · **Make default**". Unavailable voices show their reason |
| 5 | **Language** | `Select` (core §5.2) | Label "Language". Options from the flow: "Auto · Hindi + English" (default), "Hindi", "English", "Hinglish" with LanguageMarks. Hint "Auto follows the caller." At ≥560 px card width Voice and Language share a row |
| 6 | **Readiness** | `GateChecklist` (G §2, `context="inline"`, `collapse="passing"`) | `h3` "Readiness" + summary StatusText; rows per §1.3 for the current kind; blocking and advisory rows shown, passing rows behind "Show all 5 checks" |
| 7 | **Kind line** | `StatusText size="sm"` + `CallKindTag` (§7.5) | §1.1 rule 3. `aria-live` off (it is re-read with the button's description) |
| 8 | **Footer** | Sticky card footer: `surface`, top hairline, padding `space-12 space-20`, `display:flex; gap: space-inline-md` | `Button variant="secondary" leadingIcon={Mic}` "Talk in browser" · `Button variant="primary" leadingIcon={Phone}` with the kind label: "Call Lead 1042…", "Call +91 98765 43210…", "Call my phone…", or "Place call…" with no target (reason "Choose a lead or enter a number."). Each button's `disabledReason` comes from the blocking checks, shown inline under the footer (`meta-12` `warning-text` with `triangle-alert`), and in the tooltip |

Both buttons are `md` (32 px; 44 on touch), same height, never wrapping (`labelShort` below 768). The secondary's helper, in its tooltip and `aria-describedby`: "Uses your microphone. Nobody else is called."

#### 3.3.1 Edit for this call (replaces SAVE CONTEXT)

`Edit for this call…` expands an inline form in place of the Lead details list (no dialog). Fields: the flow's lead variables as `TextInput`s with their labels ("City", "Budget"). Footer: `Checkbox` "Also save to Lead 1042" (unchecked by default) · `Button variant="secondary"` "Use for this call" (label becomes "Use and save to lead" when checked) · `Button variant="tertiary"` "Cancel". Result: the list returns with the edited values marked "for this call" (`meta-12` `text-3`), and, when saving to the lead, a `SaveState` beside the heading: "Saving…" → "Saved 11:24 am" on 2xx, or "Couldn't save · Retry" (never a fixed "Context Saved", F-QA-020). Leaving with unsaved edits uses `useUnsavedChangesGuard` (digest F5).

### 3.4 The Call gate (`CallGate mode="single"`, G §5.1)

The gate's frame, check kinds, cost line, states, keys, gate token, idempotency key and containers are specified in `spec/02-components-gate.md`. This section configures it for the Cockpit.

```
Call Lead 1042                                             [x]
Their phone rings when you place the call. · Checked just now
--------------------------------------------------------------
To        Lead 1042 · +91 •••••• 4821 · Hindi
Flow      Site-visit qualifier  [Live v7] · tested today
Voice     Vaani · Hindi + English
Caller ID +91 80 •••• 2210
--------------------------------------------------------------
Must pass                                  Ready · 1 thing to know
v  Within calling hours · 10 am to 7 pm IST
v  Not on the DND list
v  Wallet ₹2,340.50 · about 16 h of calls
Good to know
i  Called 22 h ago · Callback due today
--------------------------------------------------------------
1 call · about 1 to 2 min · ₹2 to ₹5
The agent says the call is recorded at the start.
--------------------------------------------------------------
                                      [Cancel] [Place call]
```

| Setting | Cockpit value |
|---|---|
| Opened by | The card's primary (`Call Lead 1042…`, `Call my phone…`) and `C` (§4.3). Never by a single key or click on its own |
| Container | Popover gate anchored above the card footer (G §1.3): `--size-popover-gate` 400, `--radius-12`, `--e3`; a bottom sheet below 768, and at 768–1023 when it doesn't fit |
| Header | Per kind (G §5.1): "Call Lead 1042" · "Call +91 98765 43210" · "Call your phone" with `CallKindTag` Test call |
| Scope | `settings="readonly"`: the choices were made on the card (To, Flow, Voice, Caller ID). No Change link; editing happens on the card |
| Checks | The rows of §1.3 for the kind, re-run on open, `collapse="none"` (every row renders) |
| Choice | `choice="when-needed"`: only when a Real call is outside calling hours: Place now (disabled, "Outside calling hours") · Schedule for 10 am IST. The primary becomes "Schedule call"; the call appears in Up next |
| Cost line | `range` (G §3.2); interim "Rate ₹0.04/s" (direction §8) |
| Compliance note (Cockpit addition) | Under the cost line, `meta-12` `text-3`: the recording disclosure sentence when recording is on (exact wording §8 Q7) |
| Primary | "Place call" / "Schedule call"; busy "Placing call…" |
| Done | The card switches to the call (`?call=<id>`); focus moves to the call card's heading (the trigger no longer exists); announce "Dialling" |
| Failed | G §4.1 with "Couldn't reach the phone line. The call was not placed and you were not charged." (the last clause only when the server confirms it) |

### 3.5 The call card (a live or recent call)

A `section` labelled by its `h2` (visually the lead name inside CallHeader; `aria-label` "Call with Lead 1042"). Blocks are separated by `border` hairlines, each padded `space-16 space-20`.

| Block | Component | Configuration |
|---|---|---|
| Header | `CallHeader` (data-nav §12.1) | Row 1: CallStateTag (with time in state) · "Outbound · Site-visit qualifier v7" · `Timer` in `num-20`. Row 2: Person avatar 32, lead name `title-14`, `PhoneText`, then `CallKindTag` for tests or `Tag outline` "Recording · disclosed 00:01" when recording. Row 3: CallStepper. Stale rule §1.2 |
| Talk | `TalkStrip` (data-nav §12.5, live variant) | Only when per-turn timing streams; heading `h3` "Talk" with "Agent above · caller below"; legend "Agent 58% · Caller 42% · 1 interruption". `role="img"` with that sentence as its label, updated at most every 10 s. Hidden otherwise (P1) |
| Now in the flow | `NowInFlow` (§7.6) | Phase glyph tile (foundations §12) · "Now in Site-visit qualifier v7 · step 3 of 8" (`meta-12`) · step name (`title-14`) · link "Open in flow" (opens the Flow Designer at that step in a new tab; visually hidden "(opens in a new tab)") |
| Facts | `KeyValueList variant="inline"` | Voice ("Vaani · Hindi + English"), Line (`LineQuality` with `showKey={false}`), Cost ("₹5.36 so far · ₹0.04/s", tabular, never announced), Caller ID |
| Captured so far | `KeyValueList variant="rows"` | `h3` "Captured so far" + "2 of 3". Values from the flow's capture fields; pending rows "Waiting for an answer…" (`text-3`) |
| Lead details | Radix `Collapsible`, closed by default | "Lead details · 4 from Leads" → the same list as the New call card |
| Controls | `CallControls` (§7.7), sticky card footer | Phone call (Real or Test): `Button variant="secondary" leadingIcon={Headphones}` "Take over" (toggle, `aria-pressed`; asks for the microphone on first use) · `Button variant="secondary" leadingIcon={PhoneForwarded}` "Transfer…" (opens `TransferPicker`, §7.8) · `Button variant="destructive" leadingIcon={PhoneOff}` "End call" pushed right (`margin-left:auto`, ≥ `space-16` from the others). **No confirmation on End call** (direction §6.2). While taken over: "Hand back to Vaani" replaces Take over, and a `MuteToggle` ("Mute" / "Unmute", `aria-pressed`) appears. Controls a role or the backend doesn't support are hidden, not disabled (P1) |

**Browser test variant.** Row 2 shows VoiceTile "Vaani" + "You're the caller" + `CallKindTag` "Browser test"; a `LevelMeter` (§7.9) shows your input level from real audio; LineQuality lists one leg, "Your connection". Controls: `MuteToggle` · `Button variant="destructive"` "End test". A Transfer step reached in a test appears as a system TurnRow with what actually happened ("Transfer to a person · not placed in browser tests").

### 3.6 Wrap-up and ended calls

After a Real call ends, the card becomes **Wrap-up** (CallStateTag "Wrap-up"; the CallStepper completes). Component **WrapUpForm** (§7.10):

| Part | Spec |
|---|---|
| Summary | StatusText: "Summarising…" (progress) → "Summary ready" with the first two sentences and "Open call report"; or "Summary unavailable for this call." |
| Outcome | `Select` label "Outcome", pre-filled from the flow's Outcome step ("Visit booked · from the flow"), else from the call result ("Not reached") |
| Lead status | `Select` label "Lead status", pre-filled from the outcome mapping ("Interested") |
| Callback | `DateField` + `TimeField` (core §7.1) "Call back on", shown when the outcome is Callback; IST stated in the label |
| Notes | `Textarea` label "Notes" (optional) |
| Actions | `Button variant="primary"` "Save and next" when Up next has a call for this operator, else "Save" · `Button variant="tertiary"` "Skip" (leaves the lead unchanged; logged). Saving: "Saving…" then a toast "Saved to Lead 1042 · Open lead"; failure keeps the form with InlineError "Couldn't save the outcome. Retry" |

Terminal results without a conversation (No answer, Busy, Voicemail, Failed) use the same form with Outcome pre-set and add `Button variant="secondary"` "Try again…" (reopens the Call gate). Test calls and Browser tests show no form: "Test ended · 01:12 · not counted in reports" with "Open call report" and `Talk in browser` / `Call my phone…` again.

### 3.7 Transcript column

| State | Content |
|---|---|
| Live or recent call selected | `TranscriptFeed mode="live"` (data-nav §12.4) with `callLanguages`, `perTurnLanguage`, follow mode, "Jump to latest · n new", throttled announcements; after the call, the footer "Call ended · 02:31 · Summary ready" links to the call report |
| New call, lead chosen, lead has calls | `h2` "Previous calls with Lead 1042" + `Timeline` (data-nav §10) of the last 3 calls: when, duration, result, first line of the summary, "Open call report". Then "All calls in Call reports" |
| New call, nothing to show | `EmptyState variant="first-use"` without an icon: "The transcript appears here once a call connects." (overlay §15.3); body "Calls from this page appear in Call reports when they end." |
