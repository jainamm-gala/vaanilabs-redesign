
### 1.3 Containers per breakpoint

| Container | Variants | Desktop ≥1440 · Laptop 1280–1439 · Laptop-S 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|
| **Popover gate** (O §5, `Popover variant="gate"`, width `--size-popover-gate` 400) | CallGate, AddAgentGate | Anchored to its trigger: `top-end` from footers and the BulkBar, `bottom-start` from toolbars and rows; offset `--space-4`, collision padding `--space-8`, flips and shifts, never covers its trigger. Modal focus trap, no scrim | Anchored **if the whole gate fits** above or below the anchor within `100svh − 2 × --space-8`; otherwise the phone bottom sheet (G7) | **Bottom sheet**: full width, top corners `--radius-12`, `--e3`, scrim, `max-height: calc(100svh − var(--space-40))`, sticky header, sticky footer with the primary above `env(safe-area-inset-bottom)`, 44 px controls |
| **Sheet gate** (O §4, `Sheet variant="gate"`, `--size-sheet-gate` 640) | PublishGate, money gates, form gates (Start a meeting, New task), ConflictSheet | From the right, modal, with scrim | Modal, full height, width `min(var(--size-sheet-gate), 100%)` | **Full screen**: sticky 56 px header (title and close, or "‹ Back" inside a multi-step body), sticky footer above the safe area, 44 px buttons, the primary on its own full-width row when both labels don't fit |
| **Inline** | GateChecklist in a card or section (CK New call card, Rep console, MP Personal agents readiness), ApprovalCard | In flow; no container of its own | same | same; action links become 44 px rows |
| **Page** | SetupTrack (SH §13) | In the 720 px main column | Full width minus the page margin | Full width; every step action full width at 44 px |

The popover's body scrolls internally (`max-height` = available space minus `--space-8`, `overscroll-behavior: contain`) while its header and footer stay put, so the primary is never scrolled out of view. A gate never opens inside a Dialog and never stacks on another gate (§4.6).

### 1.4 Copy grammar

| Slot | Grammar | Examples |
|---|---|---|
| Title | Verb + object (+ count), sentence case, **no "?"**, names in `translate="no"` | "Call Lead 1042" · "Call 9 leads" · "Call your phone" · "Publish v8" · "Roll back to v7" · "Add Vikash to Weekly demo" · "Top up wallet" · "Switch to Starter" · "Start a meeting" · "New task" |
| Consequence sentence | What confirming does, and that nothing happens before | "Nothing dials until you start." · "Your phone rings when you start. Not counted in reports." · "Callers hear v8 only after you publish." · "Agent time is charged only while the agent is in the room." · "Nothing is charged until you approve in your UPI app." |
| Freshness | "Checked just now", then "Checked {n} min ago · **Recheck**" once the token expires (§4.3) | — |
| Primary | Verb + count or object. Never "OK", "Confirm", "Yes", "Submit" | "Place call" · "Start 9 calls" · "Schedule 9 calls" · "Publish v8" · "Publish with 1 warning" · "Publish without testing" · "Roll back to v7" · "Add agent" · "Pay ₹590 via UPI" · "Pay ₹499 and switch" · "Create room" · "Start task" |
| Busy | The verb in progress, ending in "…" | "Placing call…" · "Starting…" · "Publishing…" · "Adding…" · "Creating room…" |
| Why-text | The first blocking sentence, else the consequence after confirming | "Calls can't start outside calling hours." · "Fix 2 errors to publish." · "Confirm 1 warning to publish." · "Callers hear v8 from the next call." |
| Cancel | Always "Cancel" (tertiary) | — |

Never in a gate: "Are you sure?", a bare "OK", a primary without the count when a count exists, "≈" or a single rupee figure for an estimate, "free" unless the server says so, vendor names, uppercase labels.

---

## 2. Checks: `GateCheckRow` and `GateChecklist`

### 2.1 The check-kind enum (`lib/gate.ts`)

One enum for every gate, every inline readiness list and the setup track. The server sends the kind; the client never upgrades or downgrades it.

| Kind | Mark (20 px tile, `--radius-4`, glyph `--icon-sm` 14, stroke per F §12) | Sentence | Stops the primary? | Action (at most one) | Group label in a gate |
|---|---|---|---|---|---|
| `pass` | `check` in `--success-text` on `--success-soft` | `--text` | No | Optional quiet link ("Change", "Open") | Must pass |
| `blocking` | `x` in `--danger-text` on `--danger-soft` | `--text`; the sentence names the condition, the action names the fix | **Yes.** Primary `aria-disabled`; the first blocking sentence becomes the why-text (`--danger-text`) | **Required**: "Top up", "Verify a number", "Schedule", "Go to step", "Ask an admin" | Must pass (sorted first) |
| `adjusted` | `minus` in `--warning-text` on `--warning-soft` | `--text` + meta saying what was done ("Skipped to avoid a repeat call") | No. The scope changed: count and cost are recomputed | "Include" when allowed; "View" or none otherwise | Adjusted |
| `advisory` | `info` in `--text-2` on `--surface-2`; with `severity="warning"`: `triangle-alert` in `--warning-text` on `--warning-soft` | `--text` | No, **unless** it carries a required `ack` that is not ticked | Optional; or an `ack` Checkbox ("Publish with this warning") | Good to know |
| `checking` | Spinner sm in a 2 px `--accent-mark` ring (the StageProgress "current" mark, O §14.3) | `--text-2` ("Checking the DND registry…") | Yes: primary `aria-disabled` "Checking…" | none | Its own group |
| `unknown` | `circle-help` in `--warning-text` on `--warning-soft` | `--text` ("Couldn't check calling hours.") | **Yes**, treated as blocking | **Required**: Retry | Must pass |

Rules:
1. **Colour is state, and every mark has a word** (D P2). Each row's sentence starts with a visually hidden kind word ("Passed:", "Blocking:", "Adjusted:", "Note:", "Warning:", "Checking:", "Couldn't check:"), so the kind never depends on colour or glyph (F-A11Y-019).
2. **Red means "you must fix this before confirming"**; amber means "we changed something, or this is risky"; neutral means "worth knowing". Nothing in a gate is green except passed checks.
3. **A blocking row always has its fix.** Where the user can't fix it (role), the action is "Ask an admin" (copies a request) and the sentence names who can help.
4. **Adjusted rows never hide people silently.** Each states the count and the reason; its group expands (`aria-expanded`) to list up to 5 members, each with its own Include, then "and 7 more".
5. **Include is refused where it would break a rule**: already in a scheduled batch (it would dial twice), marked Do not call, or no valid number. DND is includable only for leads with recorded consent (open question, L §15).

### 2.2 `GateCheckRow` anatomy and tokens

| Part | Tokens |
|---|---|
| Row | `<li>`, grid `var(--space-20) minmax(0,1fr) auto`, column gap `--space-10`, padding-block `--space-6`, `align-items: start`; min height `calc(var(--space-20) + 2 * var(--space-6))` (32) |
| Mark | 20 × 20, `--radius-4`, glyph 14, `aria-hidden="true"`, `data-mark` (forced colours) |
| Sentence | `--type-data-13` `--text`; numbers tabular; names `translate="no"`; phone numbers as `PhoneText` (masked) |
| Meta (optional) | Second line, `--type-meta-12` `--text-3`: proof or detail ("Test call on this version today, 11:02 am", "Opens 10 am IST tomorrow") |
| Action (optional) | Right column, `--type-label-13` `--accent-text`, `white-space: nowrap`, hit area ≥ `--size-hit-min` (44 on touch). `<a href>` when it navigates (Phone setup), `<button>` when it acts in the gate (Include, Retry, Schedule, Recheck). Accessible name carries the object: "Include 2 leads called in the last 24 h" |
| Ack (advisory warnings) | A Checkbox (C §6.1) under the sentence, in the text column: "Publish with this warning". Optional `reasonOptions` reveal a Select "Reason" when ticked (FD §5.2 "Publish without testing") |
| Members (adjusted) | Disclosure "Show 2 leads" (`button`, `aria-expanded`); nested `<ul>` indented to the text column, 32 px rows: name · masked phone · Include |
| Sub-rows (blocking with parts) | Nested `<ul>` indented to the text column, one per item ("#5 Ask about budget: 'No reply' isn't connected. · Go to step"); more than 5 collapse behind "Show all 12" |

Dark theme: every soft tint and its text pair are the dark tokens (≥ 5.47:1, F §3.4). **Forced colours:** marks keep a `CanvasText` 1 px border and glyph; the checking ring uses `Highlight`; the row never relies on the tint.

### 2.3 `GateChecklist`

`<section aria-labelledby>` with a heading, a summary `StatusText` and one `<ul role="list">` per group.

| Context | Heading | Groups |
|---|---|---|
| Inside a gate | none of its own (the gate's `h2` names it); group labels in `--type-label-12` `--text-3`: **Must pass** · **Adjusted** · **Good to know**; the summary sits right-aligned on the first label's line | Must pass (blocking and unknown first, then checking, then pass, in catalogue order) · Adjusted · Good to know. Empty groups don't render |
| Inline (card, section) | `h3` `--type-title-14` ("Readiness", "Before your agent can work", "Before you start") with the summary under it | One list, ordered blocking · unknown · checking · adjusted · advisory · pass |
| Page (setup track) | The page `h1` and the progress line (§5.3) | One ordered list of steps |

**Summary line** (`StatusText` md, O §11, `role="status"`):

| Situation | Tone | Grammar | Examples |
|---|---|---|---|
| Every row passes | success | "Ready" or "All {n} checks pass" | "All 5 checks pass" · "Ready to publish" |
| Passes, with adjusted or advisory rows | success | "Ready · {n} thing(s) to know" | "Ready · 1 thing to know" · "9 calls ready · 3 leads skipped" |
| Unticked required acks | warning | "Ready · {n} warning(s) to confirm" | "Ready · 1 warning to confirm" |
| Any blocking row | danger | "{What} blocked · {n} thing(s) to fix", or the variant's noun | "Phone calls blocked · 1 thing to fix" · "2 errors block publishing" |
| Any unknown row, nothing blocking | warning | "Couldn't finish the checks · Retry" | — |
| In flight | progress | "Checking…" after `--timing-skeleton-delay` (200 ms) | "Checking 12 leads…" |

**Collapse** (`collapse` prop; G11):

| Value | Where | Behaviour |
|---|---|---|
| `none` | **Every gate** | Every row renders |
| `passing` | Inline lists that sit above a gate (CK New call card, Rep console) | Blocking, unknown, checking, adjusted and advisory rows render; passing rows sit behind "Show all {n} checks" (`button`, `aria-expanded`, remembered per user). Rendering the Cockpit mock proved this necessary: five green rows buried the one that mattered and the card overflowed 1440×900 (CK §1.3) |
| `all-pass` | Page-level readiness (MP §2.6) | When every row passes, the list collapses to one success line with a link ("Ready · +91 80 •••• 2210 · confirmations on WhatsApp · **Agent settings**"); it re-expands by itself when a row stops passing and announces that once |

**Loading:** rows render as `checking` with their names when the catalogue is known ("Checking wallet…"), else three skeleton rows (O §13). A `pass` is never shown before the server answers (D P1).

### 2.4 ARIA and announcements

- The summary is the only live part (`role="status"`, polite). It announces **once per settled change**, throttled by `--timing-announce-throttle` with `dedupeKey` = the gate id: "9 calls ready. 3 leads skipped." · "Phone calls blocked. Outside calling hours." · "Fix 2 errors to publish." Individual rows are never announced as they arrive.
- Rows are a plain list; marks are `aria-hidden`; the hidden kind word carries the state.
- The primary points `aria-describedby` at the why-text, so a focused, `aria-disabled` primary reads "Start 3 calls, dimmed. Calls can't start outside calling hours."
- An action that changes the scope (Include, Change settings) moves no focus; the summary announces the new count.
