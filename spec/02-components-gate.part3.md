
---

## 3. The consequence line (`GateCost`)

Every gate says what confirming costs, or, when it costs nothing, what it affects. The line never disappears: when an estimate can't be computed it shows the rate (§3.4).

### 3.1 Kinds

| Kind | Used by | Line 1 (`--type-data-13` `--text`, tabular; the amount in `--fw-medium`) | Line 2 (`--type-meta-12` `--text-3`) |
|---|---|---|---|
| `range` (calls) | CallGate, the Assistant Call step, Personal-agent call decisions | "{n} call(s) · about {lo} to {hi} min{ each} · ₹{low} to ₹{high}" | "Wallet ₹{balance} · about {runway} of calls" |
| `capped` (a task with limits) | New task | "Up to 20 calls · about 1 to 2 min each · ₹48 to ₹96 · never more than ₹200" | wallet line |
| `rate` (open-ended time) | AddAgentGate, Start a meeting, a billed Browser test | "₹0.08/s while the agent is in the room · about ₹4.80 a minute" | "Wallet ₹2,340.50 · about 8 h" (and free minutes where they apply: "29 of 30 free minutes left") |
| `quote` (money) | TopUpSheet, PlanChangeSheet, AutopayGateSheet | A `KeyValueList variant="rows"` from the **server quote**, values right-aligned: Wallet credit · GST (only when the quote has it) · **You pay** · New balance + runway | "Pay with any UPI app. Money is added when your UPI app confirms." |
| `impact` (no money) | PublishGate, ApprovalCard change and delete steps | "Callers hear v8 from the next call. Calls in progress finish on v7." · "Affects 24 leads · Undo available for 24 h" | "Publishing costs nothing." · "Runs as you · Operator" |

### 3.2 The call range (one formula, every surface)

- `lo`, `hi`: the 25th and 75th percentile durations of **connected** calls on that flow version over the last 30 days (at least 20 calls; else the flow's all-time; else the workspace's). Displayed minutes: `lo` floored (at least 1), `hi` ceiled.
- `low = floor(n × lo_seconds × rate)` and `high = ceil(n × hi_seconds × rate)` in whole rupees, so the range never understates the maximum (L §6.10).
- "each" only when n > 1. Examples at ₹0.04/s, 1 to 2 min: **1 call · about 1 to 2 min · ₹2 to ₹5**; **9 calls · about 1 to 2 min each · ₹21 to ₹44**.
- `n` is the count **after** adjustments; it updates with Include.
- If `high` exceeds the balance, the wallet check becomes `advisory` `severity="warning"`: "Wallet covers about 40 of 120 calls. Calls pause at ₹0." (Top up · Turn on autopay). It never blocks unless the wallet is ₹0 (§4.4).
- Runway is `formatRunway(balance / rate)` (KB §3), floored, always paired with the rate it used.

### 3.3 Formatting

Indian grouping (`₹1,00,000`); whole rupees for estimates, paise for balances and quotes ("₹2,340.50"); tabular numbers; the middle dot as separator; never "≈", "~" or a single figure for an estimate (D P3); never animated or counted up (N §4.8); never announced (D §8: cost and wallet decrements are silent).

### 3.4 When an estimate is unavailable (D §8 interim, hidden not simulated)

| Missing | Line 1 | Line 2 |
|---|---|---|
| Median durations (D §8 item 6) | "{n} calls · Rate ₹0.04/s" | "Wallet ₹2,340.50" (no runway) |
| Task limits (MP PA3) | "Rate ₹0.04/s · no spending limit yet" as an `advisory` `severity="warning"` row as well | wallet line |
| The quote (KB BL3) | The money gate cannot open: its entry point is `aria-disabled` "Top up isn't available right now. Try again in a minute." | — |

---

## 4. Behaviour shared by every gate

### 4.1 States

| State | Enters when | Checks | Primary | Why-text | Esc |
|---|---|---|---|---|---|
| **Checking** | Open, Recheck, any scope change | `checking` rows after `--timing-skeleton-delay` | Keeps its label (no layout jump), `aria-disabled` | "Checking…" | Closes |
| **Ready** | Preflight settled with no `blocking`, `unknown` or unticked required `ack` | As returned | Enabled | The consequence ("Calls start in order within a minute.") | Closes |
| **Needs confirmation** | Ready except a required `ack` is unticked | — | `aria-disabled` | "Confirm 1 warning to publish." | Closes |
| **Blocked** | Any `blocking` or `unknown` row | Blocking first | `aria-disabled`, still focusable | The first blocking sentence, `--danger-text` | Closes |
| **Stale** | The gate token expired (§4.3) | Unchanged; freshness "Checked 2 min ago · **Recheck**" | As before; pressing it re-checks first | unchanged | Closes |
| **Changed** | The confirm-time recheck differs from what was shown | Updated | Back to Ready or Blocked | A warning `Notice` (O §10.1, inline scope) at the top of the body: "Checks changed since you opened this. Review and start again." (verb per variant); focus moves to the summary | Closes |
| **Confirming** | Primary activated | Locked (`inert` body) | Busy label + Spinner, `aria-busy="true"`; a second press is ignored | unchanged | **Ignored**; Cancel disabled |
| **Failed** | Error response, or no response within the request timeout | Unchanged | Enabled again | `InlineError` (O §11.2) at the top of the body, `role="alert"`: the sentence from `lib/errors.ts` (O §16.2) + **Retry** (same idempotency key) + Details. "You were not charged" / "Nothing was dialled" only when the server confirms it | Closes |
| **Done** | 2xx | — | — | — | The gate closes (exit `--dur-fast`); focus and result per variant (§5) |

### 4.2 Opening

A gate opens only from: a control whose label ends in "…" ("Call Lead 1042…", "Call 9 leads…", "Publish v8…", "Add agent…", "Top up…"), `C` in Cockpit and Leads, a palette action ending in "…", a toast action ("Call 12 leads…"), or a launcher (ApprovalCard "Review and call…" / "Review and publish…"). **Opening never sends the action**; it sends the preflight. Gates are not addressable by URL (a shared link can't open a billing decision), except the money gate's `?topup=1`, which opens the sheet at the amount step where nothing is charged (KB §2.7).

### 4.3 Preflight, gate token and idempotency key

- **Preflight.** On open, on Recheck and after a scope change (debounced 300 ms), the gate calls its variant's preflight endpoint (§6) and receives `{ checks, scope, cost, gateToken, expiresAt, checkedAt }`. Inline lists outside a gate (the Cockpit card, Rep console, Personal agents) use a cheap `GET …/readiness` that returns checks only, never a token; a gate always preflights anew.
- **Gate token.** Binds what the user saw: the scope hash, the check ids and kinds, and the cost band. It lives **120 s**. After expiry the freshness line reads "Checked 2 min ago · Recheck". Pressing the primary with an expired token runs the preflight first: if checks, count and cost band are unchanged it proceeds with the new token; otherwise it enters **Changed** and does not proceed. A confirm the server rejects with `409 gate_checks_changed` (token expired or mismatched) is handled the same way, using the fresh preflight in the response. The server re-validates everything at confirm, token or not.
- **Idempotency key.** A UUID generated when the gate opens (or passed in by a launcher, such as an Assistant step or a Personal-agent decision, so a retried step can never create a second batch). Every Retry of this opening reuses it; a new opening makes a new one. Sent as the `Idempotency-Key` header with `gate_token` in the body. The same key always returns the same result (one batch, one room, one version, one payment). The client also ignores a second activation while Confirming.

### 4.4 Global blockers and the wallet ₹0 rule (one rule for every gate)

A **global blocker** is a condition, known before the gate opens, that makes every confirm from an entry point impossible and can't be fixed inside the gate. Each variant lists its own (§5); for billable calls they are: wallet ₹0, no verified caller ID, no live flow for a Real call, offline, and a role that can't place calls.

1. **Before opening, the entry point is `aria-disabled`** (focusable) with its reason (C §1.6): inline where there is room ("Wallet is ₹0. **Top up** to place calls."), else in its tooltip. Activating it (click, Enter, `C`, the palette) does **not** open the gate: it announces the reason politely and shows an info toast with the fix ("Wallet is ₹0. Top up to place calls. · **Top up**"). This is rung 4 of the wallet ladder (O §10.2).
2. **If a global blocker appears while the gate is open** (the wallet reaches ₹0 through other calls, the connection drops, the role changes), the gate stays open and gains a `blocking` row **at the top of Must pass**, with its fix ("Wallet is ₹0. Top up to place calls." · Top up). The primary becomes `aria-disabled`; the summary announces once. The gate never closes by itself and never discards the user's choices. The gate subscribes to the pushed wallet state while it is open.
3. **At confirm**, a `402` from the server renders as that same row, never as a toast only.
4. **Low is not empty.** A low wallet is never global: in the gate it is `advisory` `severity="warning"` with Top up and Turn on autopay (§3.2).
5. **Selection-dependent conditions are never global**: DND, recently called, calling hours, language, agent seats and a lead's number are in-gate rows.
6. **Top up from inside a gate** closes the gate (one modal at a time), keeps its payload (selection, settings, choice) in session storage keyed by the gate id, and opens the Top-up sheet. The Top-up success toast offers to reopen it ("**Call 12 leads…**", "**Continue starting Weekly demo**"), with the payload and a fresh preflight.

### 4.5 Keyboard and focus

| Moment | Rule |
|---|---|
| Open | Focus moves to the gate **title** (`tabindex="-1"`); the dialog is `aria-labelledby` the title and `aria-describedby` the consequence sentence. **Never the primary**, so `C` then Enter can never dial (A11Y §9.5). **Form gates** (Start a meeting, New task) focus their first field (`data-autofocus`, O §1.3) |
| Tab | Trapped, in reading order: title → scope Change → row actions, members and acks → choice → note → Cancel → primary → close |
| `⌘/Ctrl+Enter` | Anywhere in the gate, fields and the note included: activates the primary when it is enabled; when `aria-disabled`, announces the why-text and does nothing. The primary has `aria-keyshortcuts="Control+Enter"` (`Meta+Enter` on macOS) and its tooltip shows the Kbd (C §7.3; hidden on touch) |
| Enter | Activates the focused control only. **Enter in a field never submits a gate**: the primary is `type="button"` and there is no implicit form submission. One exception: Enter in the Top-up amount field goes to the UPI step, where nothing is charged (KB §2.13) |
| Esc | Closes and returns focus to the trigger (O §1.4). A dirty form gate shows the inline discard state first (O §2.5). Ignored while Confirming |
| Single keys | None inside a gate, and no preference, role or mode skips one (D P3) |
| After Cancel or Esc | Focus returns to the trigger, else the `returnFocusTo` fallback (the next row, the list heading, the page H1). Never `<body>` |
| After Done | Per variant (§5), always to something that exists: the call card heading, the trigger or the table's active row, the Flow header's version area, the room's Agent row |

### 4.6 One modal at a time

A gate never opens a second modal and never stacks on another gate. A fix that needs its own surface (Top up, Phone setup, Test now, Go to step, Show a change) closes the gate first; Top up reopens it as in §4.4. Menus, selects and comboboxes inside a gate portal above it (`--z-popover` 60 > `--z-modal` 50, O §1.6). Feedback about the gate's own action appears inside the gate; background toasts queue until it closes.

### 4.7 Announcements and motion

- Polite: the summary on each settled change (§2.4); the result after Done ("9 calls scheduled." · "Version 8 is live." · "Vikash joined Weekly demo."). Assertive: only the InlineError of a failed confirm, once.
- Never announced: timers, the cost line, wallet decrements (D §8).
- Motion: only the container (§1.2) and the primary's busy Spinner (C §2.1). Rows change in one frame, numbers change in place, nothing counts up.

### 4.8 Telemetry (ids, enums and counts only)

`gate_opened` {variant, mode, entry, requested_n} · `gate_outcome` {variant, result: `confirmed · cancelled · blocked · failed · changed`, blocking_ids, adjusted_counts, seconds_open} · `gate_blocked_entry` {variant, blocker_id} (the entry point was `aria-disabled` and activated) · `request_without_gate` (must stay 0; alert if not). Never names, numbers, amounts typed by the user, or free text.
