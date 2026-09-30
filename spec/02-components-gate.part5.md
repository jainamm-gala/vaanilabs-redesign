
### 5.3 `SetupTrack` (the page variant)

The Home setup track (SH §13) is a gate whose confirming action is "your workspace goes live": a checklist computed on the server where each step's fix is a whole task. It lives in the page, not in an overlay, and it has no primary of its own; the current step's button is the page's one primary.

**Steps are checks.** Each `SetupStep` has a kind from the §2.1 enum; the server sends it. Because an unmet step on a new workspace is expected rather than a failure, unmet steps are **presented** as steps (rings), not as red crosses. The red `x` is kept for a step that actually failed. The hidden kind word still names the state.

| Step state (SH §13.4) | Kind | Mark (20 px) | Row treatment | Hidden word |
|---|---|---|---|---|
| Done | `pass` | `check` on `--success-soft` | Title `--text`, proof line `--text-3`, quiet "Open" or "Change" | "Done:" |
| Current | `blocking` (unmet), `current: true` | 2 px `--accent-mark` ring with a centre dot | `--accent-soft` fill, 2 px inset `--accent-mark` bar, **primary** button | "Current step:" |
| To do | `blocking` (unmet) | 1.5 px `--control` ring | Secondary button | "To do:" |
| In progress | `checking` | Spinner sm in a 2 px `--accent-mark` ring | `StatusText` progress ("Indexing 1 file… 60%", "Payment pending · updates when UPI confirms") | "In progress:" |
| Blocked by another step | `blocking`, `dependsOn` | `lock` on `--surface-2` | Title `--text-2`; the reason names only what is missing, each a link ("Needs money in the wallet.") | "Blocked:" |
| Needs an admin | `blocking`, `role` | `lock` on `--surface-2` | No action button; "Copy request link" | "Needs an admin:" |
| Failed | `blocking`, `failed: true` | `x` on `--danger-soft` | `StatusText` danger + retry ("Didn't connect · No answer · **Try again**") | "Failed:" |
| Optional | any, `optional: true` | as its state | `Tag` "Optional" after the title; excluded from the count | — |

Rules: the **current** step is the first required step, in order, that is neither done nor waiting on someone else; a step waiting on someone else moves the current mark to the next actionable step. The progress line ("2 of 5 done", `ProgressBar`, O §14.2) counts required steps only. "Live" is said only when every required step is `pass` (F-UX-006). A step whose fix is a billable call ("Call yourself") opens the **CallGate** (§5.1); the track never dials. Loading shows six skeleton rows; nothing is shown as done or current before the server answers. Container: page (§1.3). Configuration, steps and copy: SH §13.

### 5.4 `AddAgentGate`

**Container:** popover gate, anchored to **Add agent…** in a room (MP §1.8). **Global blockers:** offline · wallet ₹0 ("Wallet is ₹0. Top up so the agent can join.") · a role that can't add the agent.

| Part | Configuration |
|---|---|
| Header | "Add Vikash to Weekly demo" · "Agent time is charged only while the agent is in the room." |
| Scope | `readonly` `KeyValueList`: Does ("Presents slides · Q3 pricing.pdf") · Voice ("Vikash · Hindi, English") |
| Checks | `agent_seat`: pass "Agent seat available · 2 of 3 free"; blocking "All 3 agent seats are in use. End another room to free one." · **Show open rooms**. `wallet`: pass with runway; advisory `warning` when low; blocking only if it drops to ₹0 while open (§4.4) |
| Consequence | `rate`: "₹0.08/s while the agent is in the room · about ₹4.80 a minute" · "Wallet ₹2,340.50 · about 8 h" |
| Primary | "Add agent" · busy "Adding…" |
| Done | The Agent row reads "Joining…", then "In the room"; focus → the Agent row; announce "Vikash joined Weekly demo." |
| Failure copy | "The agent couldn't join. You were not charged." (the last sentence only when confirmed) + Retry |

### 5.5 Form gates (`StartMeetingSheet`, `NewTaskSheet`)

**Container:** sheet gate. A form gate is a gate whose scope is a short form: the fields come first, then a `GateChecklist` headed `h3` "Before you start" / "Before it starts" (`collapse="none"`), then the consequence line, then the footer.

- **Focus** starts in the first field (`data-autofocus`, §4.5); Enter in a single-line field never submits; `⌘/Ctrl+Enter` confirms.
- **Fields never disable themselves because of a check**; the primary does, with the reason. A field that changes a check re-runs the preflight after 300 ms.
- **Dirty close** uses the inline discard state (O §2.5): "Discard this task? Your goal and limits will be lost."
- **Global blockers:** offline and role only. **Wallet ₹0 is not global here**, because not every outcome costs money: a room still opens on free minutes, and a research task needs no calls. The wallet is therefore an in-gate row whose kind depends on the choices: `blocking` when the chosen options must spend (the agent joins when the first guest arrives; the task may place calls; no free minutes left), `advisory` `severity="warning"` otherwise ("Wallet is ₹0. The agent can't join until you top up. The room still opens on free minutes.").
- **Primary:** "Create room" · "Start task" / "Schedule task"; busy "Creating room…" · "Starting…".
- **Consequence:** `rate` (Start a meeting: room time and agent time) or `capped` (New task).
- Configuration, fields and checks: MP §1.7 and §2.9.

### 5.6 Money gates (`TopUpSheet`, `PlanChangeSheet`, `AutopayGateSheet`)

**Container:** sheet gate. The consequence line is the **server quote** (`quote`, §3.1): the client never computes tax. The primary names the amount actually charged, tax included. **Global blockers:** offline · the quote is unavailable.

| | TopUpSheet (KB §2.7) | PlanChangeSheet (KB §2.10) | AutopayGateSheet (KB §2.8) |
|---|---|---|---|
| Opened by | "Top up…" anywhere and `?topup=1` on any route (mounted once in the AppShell) | "Switch to Starter…" | "Review and approve…" · "Renew mandate…" |
| Title | "Top up wallet" | "Switch to Starter" | "Set up autopay" · "Renew autopay" |
| Checks | Amount bounds are the field's own validation ("Enter an amount from ₹100 to ₹1,00,000."), not rows. Advisory row only when useful: "Autopay is off · **Set up autopay**" (runway under a day) | `wallet`: pass "Your wallet covers ₹499"; blocking "Wallet is ₹42.10. Top up at least ₹457 to switch." · Top up (closes this gate, opens the Top-up sheet, §4.4 rule 6) | `mandate`: advisory rows from the provider's rules ("Your bank tells you before each automatic debit.") |
| Consequence | Wallet credit · GST · **You pay** · New balance + runway | New plan · Price · Starts · **Charged** | Trigger · Amount · Monthly limit · Mandate valid until · Largest single debit |
| Primary | "Pay ₹590 via UPI" (Step 1; "Pay via UPI" while the amount is invalid) | "Pay ₹499 and switch" · downgrade: "Switch at the end of the period" | None in the app: approval is the UPI PIN in the user's UPI app |
| `⌘/Ctrl+Enter` | Activates Pay (G6). Nothing is charged until the UPI PIN | Activates the primary: the wallet is debited, which is why the chord (never a single key) is the only shortcut | Does nothing while waiting, because there is no in-app primary |

**Extra states** (after the primary): Preparing · Waiting (QR or UPI request, countdown) · Confirming · **Success** · Declined · Expired · No answer yet (KB §2.7). They replace the body; the header and a "‹ Change amount" back link stay. Unlike Confirming in §4.1, **Waiting may be closed**: the order continues on the server and the app shows Payment pending (O §10.2), never money it hasn't received (D P1). "You were not charged" only when the server confirms it.

### 5.7 Inline uses, and the ApprovalCard

| Use | Component | Configuration |
|---|---|---|
| Cockpit New call card (CK §3.3) | `GateChecklist collapse="passing"` from `GET /api/calls/readiness` | The card's primary follows §4.4: `aria-disabled` with the reason while any global blocker or blocking row exists; the gate re-checks on open |
| Rep console (CK §5.6) | `GateChecklist collapse="passing"` | Blocking rows disable "Go available" with the reason |
| Personal agents (MP §2.6) | `GateChecklist collapse="all-pass"` in a `section` with `h2` "Before your agent can work" | A blocked number does not disable New task; the form gate blocks only tasks that call or message |
| **ApprovalCard** (AS §10.3, MP §2.7) | A card, not a gate | See below |

**ApprovalCard** is the inline approval for Assistant and Personal-agent steps of **tiers 1 to 3** (O §3.1). It is not modal and not a gate, but it is built from the gate's parts so the two read as one family:

- the header grammar of §1.4 (verb + object + count; "Checked 12 min ago · **Recheck**");
- `GateChecklist collapse="none"` for its checks (`blocking`, `adjusted`, `advisory` only; passes are implied by the absence of rows);
- `GateCost` `impact` ("Affects 24 leads · Undo available for 24 h") or `range` for call steps;
- one primary that repeats the verb and count, `⌘/Ctrl+Enter` inside the card, the why-text rule and an idempotency key per decision (§4.3).

Container (in page flow): `--surface`, 1 px `--border-strong`, `--radius-8`, `--e1` (dark: border only), padding `--space-panel-pad`. **For tier-4 steps its primary is a launcher**: "Review and call…" opens the `CallGate` with the batch, "Review and publish…" opens the `PublishGate` with the draft, each passing the step's idempotency key (G14). Only the gate confirms; Cancel in the gate leaves the step waiting and returns focus to the launcher. Money decisions ("Approve with 2FA…") open "Confirm it's you" (ST §5) before the step runs; the Assistant never tops up or changes billing (AS §10.7).
