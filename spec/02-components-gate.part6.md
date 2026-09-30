
---

## 6. Server contract

### 6.1 Types (`lib/gate.ts`)

```ts
export type GateCheckKind = 'pass' | 'blocking' | 'advisory' | 'adjusted' | 'checking' | 'unknown';

export interface GateCheck {
  id: string;                          // stable rule id: 'wallet', 'caller_id', 'calling_hours', 'dnd', 'flow_errors', 'agent_seat', …
  kind: GateCheckKind;
  severity?: 'info' | 'warning';       // advisory only (§2.1)
  global?: boolean;                    // a global blocker (§4.4)
  sentence: string;                    // server copy: one sentence, sentence case
  meta?: string;                       // proof or detail line
  action?: GateAction;
  ack?: { label: string; required: boolean; reasonOptions?: string[] };
  members?: { total: number; items: { id: string; label: string; includable: boolean }[] }; // adjusted groups
  subRows?: { id: string; sentence: string; action?: GateAction }[];                    // e.g. one per flow error
  step?: { current?: boolean; optional?: boolean; dependsOn?: string[]; failed?: boolean }; // SetupTrack only
}

export type GateAction =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'include' | 'retry' | 'recheck' | 'schedule' | 'top_up' | 'go_to_step' | 'ask_admin'; label: string; target?: string };

export type CostEstimate =
  | { kind: 'range'; n: number; minutesLow: number; minutesHigh: number; rupeesLow: number; rupeesHigh: number; ratePerSecond: number }
  | { kind: 'capped'; maxCalls: number; rupeesLow: number; rupeesHigh: number; capRupees: number; ratePerSecond: number }
  | { kind: 'rate'; ratePerSecond: number; perMinute: number; freeMinutesLeft?: number }
  | { kind: 'quote'; rows: { label: string; paise: number; emphasis?: boolean }[]; chargePaise: number }
  | { kind: 'impact'; sentence: string; meta?: string }
  | { kind: 'rate_only'; n?: number; ratePerSecond: number };      // interim, §3.4

export interface GatePreflight {
  checks: GateCheck[];
  scope?: { requested: number; final: number; hash: string };
  cost: CostEstimate;
  wallet?: { balancePaise: number; runwaySeconds?: number };
  gateToken: string;
  expiresAt: string;                   // ISO: checkedAt + 120 s
  checkedAt: string;
}
```

`lib/gate.ts` also exports the **kind map** (kind → Lucide glyph, tint token, glyph token, hidden word), the summary grammar (`summarise(checks, noun)`), and `sortChecks()` (§2.3 order). Pages never map kinds to colours themselves.

### 6.2 Endpoints per variant

Paths already named in a page spec are kept; the rest are proposals for the backend owner.

| Variant | Inline readiness (checks only) | Preflight (returns `gateToken`) | Confirm (`Idempotency-Key` header + `gate_token`) |
|---|---|---|---|
| CallGate single | `GET /api/calls/readiness?target=&flow=&kind=` (CK §1.3) | `POST /api/calls/preflight` `{ target, flow, voice, lang, callerId, kind }` | `POST /api/calls` `{ gate_token, when }` → `{ callId }` |
| CallGate batch | — | `POST /api/calls/preflight` `{ selection, settings }` (L §3.2) | `POST /api/calls/batches` `{ gate_token, when, include: ids[] }` → `{ batchId, scheduled, skipped }` |
| PublishGate | — | `POST /api/flows/{id}/publish/preflight` `{ draftRevision }` (server rules FD4, targets FD5) | `POST /api/flows/{id}/publish` `{ gate_token, note, ackedWarnings, skipTestReason? }` with `If-Match` → `{ version, targets }` |
| AddAgentGate | — | `POST /api/meetings/{roomId}/agent/preflight` (proposed) | `POST /api/meetings/{roomId}/agent` → `{ state }` |
| Form gates | `GET /api/meetings/readiness` · `GET /api/personal-agents/readiness` | the same routes with the draft form as the body (proposed `POST`) | `POST /api/meetings` → `{ roomId }` · `POST /api/personal-agents/tasks` → `{ taskId }` |
| Money gates | — | `POST /api/billing/quote` (KB BL3) | `POST /api/billing/orders` · `/plan-changes` · `/mandates` → `{ orderId, upiIntent, expiresAt }` |
| SetupTrack | `GET /api/setup` (D §8 item 8) | — (no confirm) | — |

**Errors → gate states:** `402` → the `wallet` blocking row (§4.4) · `403` → the `role` blocking row · `409 gate_checks_changed` → **Changed**, using the fresh preflight in the body · `409` version conflict (publish) → its blocking row · `422` → the rows update · `5xx` or timeout → **Failed** with Retry (same key).

### 6.3 Until the preflight exists (D §8 item 5: hidden, not simulated)

The gate shows only the checks the server can compute today (flow live, caller ID, wallet balance, role, connection), and the cost reads "Rate ₹0.04/s". Missing checks are **never shown as passing**. Because silence could read as "checked", the gate adds one `advisory` row: "Calling hours, DND and recent calls aren't checked here yet." It disappears when the preflight ships (CK B3, L B7).

---

## 7. React

```tsx
// components/gate/gate.tsx: the frame (§1); containers come from the overlay group
interface GateProps {
  container: 'popover' | 'sheet';                 // fixed by the variant, never a page choice
  title: string;                                   // §1.4
  consequence: string;                             // the header sentence
  kindTag?: 'test' | 'browser';                    // CallKindTag
  scope?: React.ReactNode;                         // readonly KeyValueList or the editable summary
  preflight: GatePreflightState;                   // from useGatePreflight()
  choice?: React.ReactNode;                        // RadioCard pair
  note?: React.ReactNode;                          // Publish only
  primary: { label: string; busyLabel: string;
             onConfirm(ctx: { gateToken: string; idempotencyKey: string }): Promise<GateResult> };
  anchor?: React.RefObject<HTMLElement>;           // popover container
  returnFocusTo?: () => HTMLElement | null;
  onClose(reason: 'cancel' | 'escape' | 'done' | 'fix'): void;
}

<GateChecklist checks={checks} context="gate" | "inline" | "page" collapse="none" | "passing" | "all-pass"
  heading="Readiness" noun="Phone calls" onAction={(check, action) => …} onAck={(id, value, reason) => …} />
<GateCheckRow check={check} onAction onAck onInclude />
<GateCost estimate={cost} wallet={wallet} />

<CallGate mode="single" kind="real" settings="readonly" choice="when-needed" entry="cockpit"
  target={{ leadId, e164 }} flow={{ id, revision: 'live', version: 7 }} voiceId="vaani" lang="auto" callerId={cid} />
<CallGate mode="batch" settings="editable" choice="always" entry="bulk" selection={{ ids } /* or { query, total } */} />
<PublishGate mode="publish" flowId={id} draftRevision={rev} fromVersion={7} nextVersion={8} />
<AddAgentGate roomId={room.id} voice={voice} mode={room.mode} />
<SetupTrack steps={steps} doneCount={2} total={5} />

// Launch any gate from anywhere (G14). One GateHost is mounted in the AppShell, so only one gate is ever open.
const gate = useGate();
const result = await gate.open('call', { mode: 'batch', selection, settings },
  { idempotencyKey: step.key, returnFocusTo: () => reviewButton.current });
// result: { status: 'confirmed', batchId, scheduled: 10, skipped: 2 } | { status: 'cancelled' } | { status: 'blocked', blockerId }
```

- `useGatePreflight(variant, payload)` → `{ state, checks, cost, wallet, gateToken, expiresAt, recheck() }`; it debounces scope changes (300 ms), shows `checking` after 200 ms, runs the 120 s expiry timer and subscribes to wallet pushes while open.
- `useGate()` owns the idempotency key per opening, the payload kept in session storage for the Top-up round trip (§4.4 rule 6), and `returnFocusTo`.
- Files: `components/gate/{gate,gate-header,gate-footer,gate-checklist,gate-check-row,gate-cost,call-gate,publish-gate,add-agent-gate,setup-track}.tsx`, `lib/gate.ts`, `hooks/use-gate.ts`. Form and money gates live with their pages (`components/meetings/`, `components/agents/`, `components/billing/`) and compose these parts.
- Primitives: Radix Popover (`modal`) and Radix Dialog through the overlay containers (O §1.9). No other library.
- **Build order** (D §8 puts Gate fifth): after Button, Checkbox, RadioCard (C), KeyValueList and Tag (N), and Popover, Sheet, StatusText, InlineError and StageProgress (O §20 steps 1–5); before the Cockpit card, Leads calling, the Flow Designer's Publish and Home. Build `GateCheckRow` → `GateChecklist` → `GateCost` → `Gate` → `CallGate` → `PublishGate` → `SetupTrack` → the rest.

---

## 8. Accessibility summary and acceptance checks

**Roles.** Container `role="dialog"` `aria-modal="true"`, `aria-labelledby` the title, `aria-describedby` the consequence sentence. Checks are lists with a hidden kind word per row; the summary is the only live region (polite). The primary is `aria-disabled` (never `disabled`) when blocked, `aria-describedby` the why-text, `aria-keyshortcuts` the chord. Bottom sheets add a visible title and keep the close button top right. Every target ≥ 24 px (44 on touch). Satisfies WCAG 3.3.4 (financial and data) for every billable and live action (A11Y §3).

Acceptance (CI, visual regression and manual):

- [ ] Network: no request that dials, bills, publishes, creates a room or adds an agent is sent except a gate's confirm carrying `gate_token` and `Idempotency-Key`; `request_without_gate` stays 0.
- [ ] Opening any gate focuses its title (form gates: the first field); pressing Enter immediately after `C` sends nothing.
- [ ] `⌘/Ctrl+Enter` confirms when enabled; when `aria-disabled` it announces the reason and sends nothing. Enter in a gate field never confirms (the Top-up amount only moves to the UPI step).
- [ ] A double activation and a Retry each produce exactly one call, batch, version, room or order.
- [ ] With the token expired and a check changed, confirm does not proceed and the Changed notice shows.
- [ ] Wallet ₹0: every billable entry point is `aria-disabled` with the reason and opens nothing; dropping the wallet to ₹0 from another tab while a gate is open adds the blocking row at the top without closing the gate.
- [ ] Every gate container renders `--surface-overlay`, 1 px `--border-overlay`, `--e3` and `--radius-12` in both themes.
- [ ] Each check kind renders its mark and hidden word; marks survive forced colours; axe reports 0 violations in checking, ready, blocked, changed and failed states, in both themes.
- [ ] 768–1023: a CallGate that doesn't fit becomes a bottom sheet. 390 px and 320 px: popover gates are bottom sheets, sheet gates are full screen, and the primary stays visible above the safe area with no horizontal scroll.
- [ ] No gate stacks on another modal; Top up from a gate closes it, and the success toast reopens it with the payload.
- [ ] The cost line never shows "≈" or a single figure; without medians it shows the rate.

---

## 9. Do / Don't

| Do | Don't |
|---|---|
| "Call 9 leads" · "Nothing dials until you start." · Start 9 calls (⌘/Ctrl+Enter) | A single key, a single click, a voice command or a switch press that dials (F-A11Y-004, F-UX-013) |
| A blocking row with its fix: "Outside calling hours. Opens 10 am IST." · Schedule | A disabled button with no reason, or a reason only in a tooltip on touch |
| "2 leads were called in the last 24 h · Skipped · Include" | Silently calling someone twice, or silently dropping them |
| "9 calls · about 1 to 2 min each · ₹21 to ₹44" | "≈ ₹11", or no cost at all |
| The entry point `aria-disabled` with "Wallet is ₹0. Top up to place calls." | Opening a gate only to say it can't be used |
| One gate container: `--e3`, `--radius-12`, a flat scrim | A glass or blurred backdrop, a coloured header, a second modal on top |
| Publish shows its checks, where it goes live and the diff | "FLOW VALIDATED" on an invalid flow (F-FLOW-004), autosave into Live (F-FLOW-001) |
| "Test call on this version today, 11:02 am" as a proof | A "Don't ask again" or an admin skip setting |

---

## 10. Traceability

| Finding | Severity | Resolved by |
|---|---|---|
| F-UX-013 / F-A11Y-004 `c` and bulk CALL dial with no pre-flight | high | §4.2, §4.5, §5.1: every call goes through the CallGate; `C` opens it; the chord confirms |
| F-FLOW-001 edits autosave into the live flow | critical | §5.2 PublishGate is the only door to Live (with FD §4) |
| F-FLOW-004 / F-UX-004 "FLOW VALIDATED" on invalid flows | high | §5.2 errors are `blocking` rows from the shared rule set; the summary is computed |
| F-FLOW-014 "active" means different things | medium | §5.2 Where it goes live lists real targets |
| F-UX-006 "You're live" too early; F-UX-001 setup dead ends | high · critical | §5.3 SetupTrack: "Live" only when every required step passes; every step names its fix |
| F-UX-022 the Assistant activates without approval | medium | §5.7 ApprovalCard launches the gates; no mode skips them |
| F-UX-002 / F-QA-004 wallet Top up opens Profile | high | §4.4 rule 6 and §5.6: Top up opens the money gate in place |
| F-QA-021 top-up amount clamped silently | medium | §5.6 bounds are field validation with a sentence |
| F-UX-014 pickers save the account default | medium | §5.1 settings apply to this call or batch; "Make default" is separate |
| F-A11Y-019 status by colour only | medium | §2.1 rule 1: a mark and a hidden word per row |
| F-A11Y-005 / F-A11Y-014 focus and announcements | high · medium | §4.5, §2.4, §4.7 |
| F-UX-038 / F-UX-039 Meetings and Personal agents hide prerequisites | medium | §5.4, §5.5, §5.7 readiness and form gates |

---

## 11. Open questions for the product owner

1. **DND and consent.** May a lead on the DND registry be included when consent is recorded, and who may include them (CK §8 Q7, L §15)?
2. **Browser tests.** Billed or free (CK §8 Q2)? If billed, they get the CallGate with the Browser test title and a `rate` line.
3. **Batch limits.** Is there a maximum batch size or pacing the gate should state, and must very large "all matching" batches be scheduled (L §15 Q5)?
4. **Token lifetime.** Is 120 s right for busy operators, or should the gate re-check silently in the background while open?
5. **Plan changes.** Charged from the wallet or by UPI (KB §5 Q5)? The PlanChangeSheet primary and shortcut depend on it.
