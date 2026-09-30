## 4. Cockpit behaviour

### 4.1 States, with copy

The shell, PageHeader (H1 and static meta) and Baseline render at once; only data regions wait (F-QA-007). Skeletons appear after 200 ms and have no shimmer (overlay §13).

| State | Trigger | What the operator sees | Copy |
|---|---|---|---|
| **Loading** | First paint | New call card as the "Cockpit Ready card" skeleton (form layout); Calls column list skeleton; transcript empty state immediately (it needs no data). Both actions `aria-disabled` | Footer reason: "Checking readiness…" |
| **First use: no flows** | Workspace has no flow | Flow field replaced by a compact EmptyState; both actions disabled | "No flows yet. Create one to test it here." link **New flow** (template gallery). Reason: "Create a flow first." |
| **First use: setup incomplete** | Setup track not finished | Readiness rows show exactly what blocks phone calls; `Talk in browser` works as soon as a flow exists | Summary: "Phone calls blocked · 2 things to fix". Rows: "Wallet is ₹0. Top up to place phone calls." · "Verify a caller ID before placing phone calls." plus the sidebar setup card "Finish setup · 3 of 5" |
| **No leads** | Leads is empty | Contact listbox shows a compact empty line; typing a number still works | "No leads yet. **Import leads…**" |
| **Ready** | All checks pass | Summary collapsed | "All 5 checks pass" · kind line · enabled primary |
| **Advisory** | e.g. flow untested, recently called | Rows expanded; primary enabled | "Live v7 hasn't been tested since it was published. Talk in browser first." |
| **Blocked** | Any blocking check | Primary `aria-disabled`, reason inline and in the tooltip; `Talk in browser` unaffected unless its own checks block | "Wallet is ₹0. Top up to place phone calls." · "Outside calling hours. Opens 10 am IST." · "This number is on the DND list." · "Draft v8 can only call your own number. **Use Live v7** or **Call my phone**." |
| **Partial** | One readiness source fails | That row reads unknown; phone calls blocked until it resolves | "Couldn't check the wallet. **Retry**" · reason "Can't confirm your balance yet." |
| **Flows failed to load** | Flow list request fails | FlowSwitcher error state | "Couldn't load flows. **Retry**" (the Refresh-flows spinner that did nothing offline is gone, F-UX-019) |
| **Page error** | Cockpit data fails entirely | `PageError` inside the shell | Title "Cockpit couldn't load." Body "No calls were placed. This is a problem on our side or with your connection." Actions **Retry** · Go to Call reports |
| **Offline, idle** | `offline` event | ConnectionBar; every network action `aria-disabled` | "You're offline." |
| **Offline, during a phone call** | Network drops while a Real or Test call is live | The call continues on the phone line. TranscriptFeed "Reconnecting" notice; timer keeps running from the server start time | Card notice (warning, section scope): "You're offline. The call continues on the phone line. The transcript catches up when you reconnect." |
| **Offline, during a Browser test or Take over** | Your audio leg drops | Call moves to Failed | "Your connection dropped, so the browser test ended." / "Your connection dropped. Vaani is back on the call." |
| **Microphone blocked** | Permission denied or no device | `Talk in browser` and `Take over` disabled with reasons; an `info` IconButton opens steps | "Microphone blocked. Allow it in your browser's site settings, then **Retry**." · "No microphone found. Connect one, then **Retry**." |
| **Role can't call** | Permission | Primary hidden; `Talk in browser` stays if allowed | Readiness row: "Your role can't place phone calls. Ask an admin." |
| **Placing** | Place call pressed | Gate primary busy | "Placing call…" |
| **Dialling / Ringing** | Server events | CallHeader, stepper, TopBar chip, Baseline, nav badge | "Dialling…" · "Ringing… 00:07" |
| **Stuck** | No event for 60 s | Warning text in CallHeader | "No update for 60 s · **Check status**" |
| **Live** | Answered | Full card, transcript streaming | "Live 02:14" |
| **Taken over** | Take over | Row 2 tag "You're talking"; agent paused | "Vaani is paused. **Hand back to Vaani**" |
| **Transferring** | Transfer… confirmed | Pending tag | "Transferring to Rep 2…" → "Transferred to Rep 2" / "Transfer didn't connect. Vaani is back on the call." |
| **No answer, Busy, Voicemail** | Terminal | Terminal CallStateTag replaces the remaining steps | "No answer after 30 s." · "Busy." · "Reached voicemail. No message was left." (only if true) |
| **Failed** | Terminal | Danger CallStateTag + reason | "Call failed. Couldn't reach the phone line. You were not charged." (only when confirmed) · **Try again…** |
| **Wrap-up** | Real call ended | WrapUpForm | "Summarising…" → "Summary ready" |
| **Saved** | Wrap-up saved | Toast; card returns to New call or the next call | "Saved to Lead 1042 · **Open lead**" |
| **Test ended** | Test ended | Compact ended block | "Test ended · 01:12 · not counted in reports" |
| **Default changed** | Make default | Success toast with Undo | "Default flow updated · used by Cockpit, Meetings and Leads · **Undo**" |
| **Wallet low or empty** | Server state | WalletNotice (page) + Baseline segment amber + readiness row | "**Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. **Top up**" |

### 4.2 Interactions

- **Choosing a target.** Selecting a lead fills Lead details and re-runs readiness (DND, recently called). Choosing "My phone" switches the kind to Test call. Clearing the Contact returns the primary to "Place call…" with its reason. Arriving from Leads (`?new=1&lead=`) or Call reports ("Call again…") pre-fills the card and focuses the primary, never the gate.
- **Changing the flow** re-validates the kind (Draft + lead blocks) and the language list; the voice resets only if the flow does not allow it ("Vaani isn't available for this flow. Choose a voice.").
- **Talk in browser** asks for the microphone on the click (never on page load), then starts the Browser test directly (no gate: it rings nobody). If the product owner decides Browser tests are billed, it gets the same gate with the Browser test title (§8 Q2).
- **Place call.** Primary or `C` → gate → `Place call` or `⌘/Ctrl+Enter`. The server re-checks readiness; if something changed since the gate opened, the gate shows the new blocking row instead of calling.
- **Supervising.** Selecting another live call in the Calls column swaps the card and transcript (`?call=`); the previous call keeps running.
- **Leaving during a live call.** In-app navigation is allowed (the call runs server-side; the TopBar chip, Baseline and nav badge lead back). During a Browser test or Take over, your audio would stop, so a ConfirmDialog asks: "Leave the Cockpit? Your browser test ends when you leave." · Stay · Leave and end test. `beforeunload` is registered only while your microphone is in use.
- **Only one microphone session per tab.** Starting Talk in browser during a Take over is disabled: "You're already talking on Lead 1042."

### 4.3 Keyboard

Single-key shortcuts follow the account's "Single-key shortcuts" switch and are ignored while typing (overlay §19).

| Key | Where | Does |
|---|---|---|
| `/` | Cockpit, outside text fields | Focus the Contact field (the New call item is selected first) |
| `C` | Cockpit, outside text fields | Open the Call gate if the card is complete; otherwise focus the first field that needs attention and show its message. **Never dials** |
| `⌘/Ctrl+Enter` | Inside the Call gate | Place call (or Schedule call) |
| `Esc` | Gate, popovers, sheets | Close and return focus to the trigger |
| `M` | During a Browser test or Take over | Mute or unmute your microphone (announced: "Microphone muted") |
| `F6` / `Shift+F6` | Cockpit | Move focus between regions: header → Calls → card → transcript |
| `↑` `↓` `Home` `End` `Enter` | Calls column | Move and open |
| `End` / `Home` | Transcript | Jump to the latest turn and re-pin / to the first turn |
| `⌘/Ctrl+F` | Focus inside the transcript | Search the transcript |
| `?` | Anywhere | Shortcut sheet |

No shortcut ends, takes over or transfers a call in v1 (§8 Q4). Every shortcut has a visible button; keycaps appear only in tooltips and the `?` sheet.

### 4.4 Microcopy: before → after

| Before | After |
|---|---|
| AGENT COCKPIT · Agent View · Agent · Dashboard | Cockpit |
| IDLE · SESSION: IDLE · STANDBY · Awaiting connection… | (no idle state words) "No calls in progress" in the header meta; the transcript empty state "The transcript appears here once a call connects." |
| LAT: 0ms · SYS: ONLINE 22ms · RGN: Mumbai-1 | (nothing idle) "Line · Good · 180 ms" during a call |
| CONNECT | Talk in browser |
| Test Call | Call my phone… / Call Lead 1042… / Call +91 98765 43210… |
| +91... (placeholder as label) | Label "Contact", hint "Search leads by name or number, or type a number." |
| FLOW: [flow name] (v2) · 9115a2 (10 px mono, truncated) | Flow: Site-visit qualifier `Live v7` (FlowSwitcher, no hashes) |
| Vaani / Vikash (bare toggle) | Voice: Vaani · Hindi + English ▶ · "For this call only · Make default" |
| CUSTOMER INTEL | Lead details |
| SENTIMENT POSITIVE 72/100 · 3 PREV. CALLS (before any call) | Last call · 21 Sep · Callback (only if it exists) |
| EMAIL / COMPANY / LOCATION (demo seeds) | Only real fields, "from Leads", or "Not captured" |
| SAVE CONTEXT · Context Saved | Edit for this call… · Use for this call · Also save to Lead 1042 · Saved 11:24 am / Couldn't save · Retry |
| Enter a valid phone number (8-15 digits)… (in the transcript) | "Enter a 10-digit mobile number, like 98765 43210." (under the field) |
| TRANSCRIPT FEED · 0 entries | Transcript |
| Wallet empty — top up now to keep calls flowing. | Wallet is ₹0. Phone calls are paused. Browser tests and free meeting minutes still work. Top up |

### 4.5 Accessibility

- **Landmarks and headings.** One `h1` "Cockpit". Regions are `section`s labelled by `h2`: "Calls", "New call" or "Call with Lead 1042", "Transcript" (or "Previous calls with Lead 1042"). Blocks inside the card use `h3`. The skip link targets `main`.
- **Labels.** Every control sits in a `Field` with a visible `label` (F-A11Y-003). Placeholders are examples only (F-A11Y-020). PhoneInput carries the hidden "Indian number, +91" description.
- **Disabled means focusable.** Blocked buttons use `aria-disabled` with `aria-describedby` pointing at the visible reason (core §1.6); they remain in the tab order so the reason can be heard.
- **Kind in the name.** The primary's accessible name is its label ("Call Lead 1042…"); its description adds the kind line ("Real call. Billed at ₹0.04 per second."). The TopBar call chip's name includes the kind ("Live test call, 1 minute 12 seconds").
- **Announcements** (shell announcer, polite): call state changes debounced 500 ms ("Dialling", "Call live", "Call ended. Wrap-up"); final transcript turns at most one per 2 s, switchable; LineQuality drops and recoveries; readiness changes that flip the primary ("Phone calls blocked. Wallet is ₹0."). Never timers, cost or wallet decrements. Failures that stop the task (Placing failed, Couldn't save outcome) use `role="alert"` via InlineError.
- **Focus management.** Gate confirm → focus to the call card heading. Operator presses End call → focus to the Wrap-up heading. A call that ends on the other side does **not** move focus; it is announced. Closing any popover returns focus to its trigger.
- **Contrast and type.** All text pairs come from tokens proven ≥ 4.5:1 in both themes (contrast-report); nothing below 12 px; the timer is `num-20` tabular (Hanken); the primary label is white on Neel (7.68 / 6.21:1).
- **Targets.** 24×24 minimum, 44×44 on touch; End call sits at least `space-16` from routine controls.
- **Motion.** Only the LiveDot (live) and LevelMeter or VoicePicker meters (real audio); both static under reduced motion, where the words carry the state.
- **Language.** `lang` on every turn and example; `translate="no"` on lead, flow and voice names.
- **Forced colours.** State tags keep word and icon; LiveDot, meters and talk-strip swatches carry `data-mark`; the selected call item carries `aria-current`.

### 4.6 Responsive rules (summary)

| | ≥1440 | 1280–1439 | 1024–1279 | 768–1023 | 320–767 |
|---|---|---|---|---|---|
| Calls | Column 240 | CallSwitcher in header | CallSwitcher in header | TopBar chip → sheet | TopBar chip → sheet |
| Card | 400 column | 400 column | 400 column | Full pane, max 640 | Full width |
| Transcript | Rest | Rest | Rest (≥ 568) | Tab "Transcript" | Below the sticky call header |
| Call controls | Card footer | Card footer | Card footer | Sticky bottom bar | Sticky 44 px bar above the bottom nav; Transfer… in `⋯` |
| Gate | Popover 400 | Popover 400 | Popover 400 | Popover 400 if the whole gate fits, else bottom sheet (G §1.3) | Bottom sheet |
| Lead details | Inline | Inline | Inline | Inline | Disclosure |
| Voice and language | Inline | Inline | Inline | Inline, one row | Disclosure → bottom sheet |

### 4.7 Telemetry hooks (optional, privacy-safe)

Session replay and autocapture are **off** on `/dashboard` and `/rep-console` (F-UX-045). Events carry ids and enums only: never names, numbers, notes or transcript text.

| Event | Properties | Question it answers |
|---|---|---|
| `cockpit_card_ready` | `blocking_checks[]`, `advisory_checks[]`, `ms_to_ready` | What stops people calling? |
| `call_gate_opened` / `_confirmed` / `_cancelled` | `kind`, `flow_revision`, `checks_state`, `had_schedule_choice` | Does the gate cost too much time? Where do people back out? |
| `browser_test_started` | `flow_revision`, `mic_permission` | Are flows tested before real calls? |
| `call_state_changed` | `kind`, `from`, `to`, `ms_in_state` | Time to live; failure rates by stage |
| `take_over_used` / `transfer_used` | `ms_into_call`, `step_phase` | Where does the agent need help? |
| `wrap_up_saved` | `ms_to_save`, `outcome_changed_from_flow` | Is wrap-up fast; are flow outcomes right? |
| `make_default_clicked` | `field` (flow, voice) | Do people want sticky defaults? |
| `mic_permission_denied` | `surface` | How often browser audio is blocked |

### 4.8 Acceptance criteria (Cockpit)

- [ ] The nav, H1, phone bar, ⌘K and `<title>` all say "Cockpit"; `<title>` becomes "Live call · Cockpit · Vaani Labs" only while a call is shown.
- [ ] No element on the page animates while idle; with reduced motion on, nothing animates during a call either.
- [ ] The New call card's primary names its target ("Call Lead 1042…", "Call my phone…"); with no target it reads "Place call…" and is `aria-disabled` with "Choose a lead or enter a number."
- [ ] Pressing the primary or `C` never creates a call request; only `Place call` (or `⌘/Ctrl+Enter`) inside the gate does, with an idempotency key; a double press creates one call.
- [ ] Typing "abc" or "12345" into Contact shows the PhoneInput error under the field on blur, and the primary stays disabled with that reason.
- [ ] With the wallet at ₹0, the primary is `aria-disabled` with "Wallet is ₹0. Top up to place phone calls.", `Top up` opens `/billing?topup=1`, and `Talk in browser` still works (if Browser tests are free).
- [ ] Choosing a Draft flow and a lead blocks the call with "Draft v8 can only call your own number."; the server rejects the same combination with 422.
- [ ] Changing flow, voice or language sends no profile write; the picks survive reload via the URL; "Make default" writes once and shows the toast with Undo.
- [ ] Lead details never show a field absent from the lead record; missing flow fields read "Not captured"; no sentiment or call count appears for a lead without calls.
- [ ] "Use and save to lead" shows "Saved hh:mm am" only after a 2xx and "Couldn't save · Retry" after a failure (tested with a blocked request).
- [ ] At 1024×768, 1100×700 and 720×450 no control overlaps another, every control is reachable by scrolling, and the card footer stays visible (F-VIS-007, F-RWD-002).
- [ ] At 390 px the Contact, Flow, readiness and both actions are visible without opening anything; nothing scrolls sideways at 320.
- [ ] Every control has a programmatic label; axe reports no `label`, `color-contrast` or `aria-*` violations in idle, gate, live, wrap-up and error states, in both themes.
- [ ] A screen reader hears "Dialling", "Call live", "Call ended. Wrap-up" once each, final turns at most every 2 s, and never the timer or cost.
- [ ] Every Browser test produces exactly one conversation in Call reports, tagged Test (contract test with the backend, F-QA-006).
- [ ] A call with no server event for 60 s shows "No update for 60 s · Check status"; a stale queued call never shows a running timer.
- [ ] Session replay scripts do not load on `/dashboard`.
