## 6. Backend dependencies and interim behaviour

The truthful UI depends on these. Until each ships, its UI element is **hidden, not simulated** (direction §8).

| # | Dependency | Used by | Interim until it ships |
|---|---|---|---|
| B1 | Call events stream (state changes with server timestamps, call id returned on create, idempotency key honoured) | CallHeader, Calls column, chips, Baseline | Poll `GET /api/calls/{id}` every 2 s while a call is shown; never show Dialling before the id exists |
| B2 | One conversation per Browser test; `is_test` and `kind` on every call (F-QA-006) | Kind tags, Call reports exclusion | Browser tests show "2 legs · counted once" in Call reports; the Cockpit hides Recent test items rather than listing both legs |
| B3 | Readiness endpoint (§1.3) with wallet runway, caller ID state, calling hours (IST), DND, recently called, role | GateChecklist, Call gate | Wallet and caller ID from existing endpoints; calling hours, DND and recently called rows are **omitted** (not shown as passing), and one advisory row says so (G §6.3) |
| B4 | Per-second rate and median duration per flow | Cost line, runway | "Rate ₹0.04/s" only (direction §8) |
| B5 | Per-turn timestamps and language; step id per turn | TalkStrip, turn language marks, step links, Now in the flow | TalkStrip hidden; one language mark per call in the feed header; Now in the flow hidden |
| B6 | Capture fields per flow and live captured values | Captured so far, Lead details "fields this flow uses" | Section hidden |
| B7 | Session-only call overrides (flow, voice, language, lead variables) on the create-call request | New call card | Required: without it the pickers must keep writing the profile, so ship it before the card (F-UX-014) |
| B8 | Lead association by normalised E.164 at call creation; reaper for stuck calls (F-QA-037) | Previous calls, Recent, Timed out | Previous calls hidden for typed numbers; stuck calls show "No update since…" |
| B9 | Take over, Transfer, Hold, Keypad capabilities per call | CallControls | Absent controls |
| B10 | Presence API: explicit set and clear, heartbeat, server timeout, one owner per rep; call channel config readable by members | Rep console | Rep console blocks `Go available` with "Presence isn't available yet." rather than registering presence on load |
| B11 | Flow "tested" facts per revision | Readiness flow row, FlowSwitcher meta | Row reads "Live v7" without the tested clause |
| B12 | Wrap-up endpoint (outcome, lead status, callback, notes) | WrapUpForm | Outcome saved through the existing lead update; callback field hidden |

---

## 7. New components needed

The Gate components (`GateChecklist`, `GateCheckRow`, `CallGate` single and batch) are specified in `spec/02-components-gate.md` (G); these pages only configure them (§1.3, §3.4, §5.6). Every component uses existing tokens only; the three this area added are in §7.14 and registered in 01-foundations §18.

### 7.1 `ReadyToCallCard` (composition)
The New call card of §3.3: Contact, Lead details, Flow, Voice, Language, GateChecklist, kind line, sticky footer. Container queries: at ≥560 px card width Voice and Language share a row and the footer buttons are 1:1. Loading uses the overlay "Cockpit Ready card" skeleton.
```tsx
<ReadyToCallCard value={{ target, leadId, flowId, voiceId, lang, overrides }} onChange={setUrlState}
  readiness={readiness /* §1.3 rows */} onTalkInBrowser={startBrowserTest} onOpenGate={openGate} />
```

### 7.2 `GateChecklist`, `GateCheckRow` and `CallGate`
Specified in `spec/02-components-gate.md` (§2 checks, §5.1 CallGate, §7 React), which replaced the contract that used to live here. Cockpit usage:
```tsx
<GateChecklist context="inline" collapse="passing" heading="Readiness" noun="Phone calls" checks={readiness.checks} />
<CallGate mode="single" kind="real" settings="readonly" choice="when-needed" entry="cockpit"
  target={{ leadId, e164 }} flow={{ id, revision: 'live', version: 7 }} voiceId="vaani" lang="auto" />
```

### 7.3 `ContactField` (recipe of `Combobox` + `PhoneInput`)
Core §4.1 names the behaviour; this is its contract. One input: text searches leads (debounced 300 ms, server), digits switch the value to a PhoneInput E.164 value. Groups "You", "Leads", "Number". The selected value renders as a chip-free text value "Lead 1042 · +91 •••••• 4821" with a Clear IconButton. Value: `{ kind: 'self' | 'lead' | 'number', leadId?, e164 }`. Masked numbers only; a typed number is shown as typed. `aria-describedby` → hint or error; results count announced.

### 7.4 `CallsColumn`, `CallListItem`, `BatchItem`, `CallSwitcher`
§3.2 anatomy. `CallsColumn` is a `nav`-like region but not a landmark (`section aria-labelledby`), with a roving-tabindex list. `CallSwitcher` = secondary Button + Popover (≥768) or bottom sheet (<768) rendering the same `CallsColumn` content at 320 px. Items subscribe to B1 for timers (one shared 1 s ticker; timers render from server start times, so switching never resets them).

### 7.5 `CallKindTag` (and the kind line)
`Tag tone="outline"` with an icon: `monitor` "Browser test", `flask-conical` "Test call". Real calls render no tag (the absence is deliberate; the gate title and button name carry it). The kind line is a `StatusText size="sm"` built by `describeCallKind(kind, target, rate)` in `lib/calls.ts`, the single source for the sentence used by the card, the gate subtitle and the primary's `aria-describedby`.

### 7.6 `NowInFlow`
Row: phase glyph tile 24 (foundations §12) · two lines (`meta-12` "Now in {flow} v{n} · step {i} of {total}", `title-14` step name) · link "Open in flow". Updates only on step change (not announced). Hidden without B5.

### 7.7 `CallControls` (with `MuteToggle`, `HoldToggle`, `KeypadPopover`)
A sticky footer bar (`surface`, top hairline, padding `space-12 space-20`, flex, gap `space-inline-md`), End call pushed right with `margin-left:auto` and at least `space-16` from routine controls. Variants: `agent` (Take over, Transfer…, End call), `browser-test` (Mute, End test), `takeover` (Hand back to Vaani, Mute, Transfer…, End call), `rep` (Mute, Hold, Keypad, Transfer…, End call). Toggles are `Button variant="secondary"` with `aria-pressed` and state-named labels ("Mute" / "Unmute", "Hold" / "Resume"). `KeypadPopover`: 3×4 grid of 44 px keys (`mono-13` digits with letters in `meta-12`), sends DTMF on press, echoes digits in a read-only field. Below 768 the bar keeps two primary controls and moves the rest to `⋯`.

### 7.8 `TransferPicker`
`Popover variant="combobox"` from "Transfer…": sections "Available reps" (from presence; name, AvailabilityTag) and "Phone number" (PhoneInput `allowInternational`); primary "Transfer" (busy "Transferring…"); a note when the target is a phone number: "Transfers to a phone are billed at ₹0.04/s." Empty reps: "No reps are available. Transfer to a number instead."

### 7.9 `MicCheck` and `LevelMeter`

`LevelMeter` is the product's one audio meter, owned by `07-motion` §12.5 and named in the Flow Designer registry (FD1 §20.1); it was called MicMeter here. This section keeps only the Cockpit's use of it.
`LevelMeter`: 4 bars (`space-2` wide, gap `space-2`, heights 4/8/12/16, radius-2, `accent-mark` when active, `border-strong` idle), driven by a real `AnalyserNode` at ≤ 15 fps; static under reduced motion (shows a single level). `role="meter"` with `aria-valuenow` rounded to 10 % steps, `aria-label="Microphone level"`, never live-announced. `MicCheck`: Microphone and Speaker `Select`s (from `enumerateDevices`, labels need permission; before that: "Allow the microphone to see device names"), the meter, "Play test sound", and the result line "We can hear you" only after real input above the noise floor.

### 7.10 `WrapUpForm`
§3.6 and §5.6. Variants `cockpit` ("Save and next" / "Save") and `rep` ("Save and go available" / "Save and go offline"). Form rules from core §8 (validation on submit, UnsavedChangesBar not used: the form has its own footer). Outcome options come from the flow's Outcome steps plus the call results.

### 7.11 `AvailabilityControl` and `AvailabilityTag`
`AvailabilityTag`: Tag `lg` with the words and tones of §5.3; `role="status"` wrapper. `AvailabilityControl`: tag + sentence (`body-14` `text-2`) + one button, driven by a `usePresenceMachine()` reducer (states of §5.3, events: goAvailable, connected, presenceConfirmed, failed(stage), goOffline, ring, answer, decline, missed, ended, wrapUpSaved, heartbeatLost, otherTabClaimed).

### 7.12 `IncomingCallCard`
§5.6 anatomy on `surface`, 1 px `warning-border` (the pending state's border, ≥ 3:1) and radius-8 inside the softphone column; padding `space-16`. The ringing state never animates the card (no pulse, no shake); the ring is audio.

### 7.13 `NavBadge kind="presence"`
Extends data-nav §1.5: "Available" (static LiveDot + `success-text`), "On call" (pulsing LiveDot while on a call), nothing when offline. Accessible name "Rep console, available". One badge per item still applies.

### 7.14 Tokens (registered in 01-foundations §18)

Registered in 01-foundations §18 and emitted by `tokens.json` 1.1.0: `--size-softphone` (400 px, the Rep console column), `--timing-state-announce` (500 ms, the call-state debounce, data-nav §12.1) and `--timing-call-stale` (60 s, the "No update for 60 s" rule). Use the names; no literals in `announce()` or `lib/calls.ts`.

---

## 8. Open questions for the product owner

1. **Route.** Keep `/dashboard` with a `/cockpit` alias (proposed for v1), or move to `/cockpit` with a permanent redirect?
2. **Are Browser tests billed?** Proposed: free, which keeps `Talk in browser` gate-free and usable at ₹0 (as the WalletNotice copy promises). If billed, they get the Call gate with the Browser test title and a cost line.
3. **Who sees "Live now"?** Proposed: everyone sees the calls they could open in Call reports; admins see all. Is there a supervisor role?
4. **End-call shortcut.** None in v1 (browser shortcut conflicts, accidental hang-ups). Revisit with operators.
5. **Telephony capabilities.** Which of Take over, Transfer, Hold and Keypad exist today? Hidden until confirmed (B9).
6. **Calling hours for Test calls to your own number.** Proposed: not applied.
7. **Compliance copy.** Exact DND scope (promotional vs service calls), TRAI calling windows, and the recording disclosure sentence.
8. **"Tested today".** Proposed: a Browser test or Test call on this revision that reached Live and lasted at least 10 s, today in IST.
9. **Browser transfer bridge.** Call channel copy says it hasn't shipped (F-UX-015). If it hasn't, should the Rep console be hidden from the nav or shown blocked?
10. **Presence timing.** Heartbeat 20 s and server timeout 45 s proposed; ring timeout 20 s.
11. **Auto-offline after 2 missed transfers.** Proposed on, per workspace setting.
12. **Draft test calls to teammates.** May a Draft call a teammate's verified number (kind Test call), or only your own?
13. **Cockpit default flow.** Where is it set: the Publish gate's "Where it goes live" (direction §6.5), Flows, or Settings?

---

## 9. Traceability

| Finding | Section |
|---|---|
| F-UX-003 | D7, §3.3 (Lead details), §3.3.1, §4.4 |
| F-UX-005, F-FLOW-012, F-FLOW-014, F-VIS-037, F-VIS-013 | §3.3 Flow |
| F-UX-006 | §1.3, §4.1 first use |
| F-UX-013, F-A11Y-004 | D3, §1.3, §3.4, §4.3 |
| F-UX-014 | D6, §1.5, §3.3, §4.1 default changed, B7 |
| F-UX-015 | §5.2, §5.7 routing blocked, §8 Q9 |
| F-UX-016 | §5.9 (room ids under Details) |
| F-UX-017, F-A11Y-013 | §1.4, §5.2 |
| F-UX-018 | D9, §2.2, §5.2 |
| F-UX-019, F-VIS-020 | §4.1 partial and flows failed, §5.7 connection failed |
| F-UX-023 | D8, §5 |
| F-UX-026, F-VIS-030, F-A11Y-009 | D2, §3.3 footer, §4.4 |
| F-UX-028, F-UX-002, F-RWD-013, F-A11Y-015 | §3.1 notices, §4.1 wallet |
| F-UX-030, F-QA-007 | §4.1 loading, §5.7 loading |
| F-UX-034, F-QA-018 | §1.4 forbidden routes |
| F-UX-045 | §4.7, §4.8 |
| F-VIS-001, F-VIS-002, F-VIS-016, F-VIS-022, F-QA-038 | §3.3 (one level of containment, type roles), §5.2 |
| F-VIS-007, F-RWD-002 | D5, §2.4, §4.6, §4.8 |
| F-VIS-023, F-A11Y-019 | §3.7 empty state |
| F-VIS-029, F-A11Y-022 | D10, §4.5 motion |
| F-VIS-034 | §2.4 fixed columns, §3.7 previous calls |
| F-RWD-001 | §1.4, §5.2 |
| F-A11Y-003, F-A11Y-006, F-A11Y-020 | §3.3, §4.5 labels |
| F-A11Y-014 | §1.2, §4.5, §5.10 |
| F-A11Y-016 | VoicePicker radiogroup (§3.3), toggles with `aria-pressed` (§7.7) |
| F-A11Y-023 | §4.5 targets, §5.10 |
| F-QA-006 | §1.1, B2, §4.8 |
| F-QA-020, F-QA-021, F-UX-025 | §3.3 Contact, §3.3.1, §4.8 |
| F-QA-037 | §1.2 stuck, B8 |
