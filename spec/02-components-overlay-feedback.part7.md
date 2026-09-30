
---

## 16. Error states

Every error says what happened, what it means and what to do, in that order, with a working action. Raw text goes under Details (§11.2). The shell never disappears.

### 16.1 Levels

| Level | Component | When | Anatomy |
|---|---|---|---|
| **Page** | `PageError` | The route's data failed entirely (route `error.tsx` boundary) | Inside the shell. The page H1 stays the page name. Block like an empty state: `circle-alert` in `--danger-text` (the icon only), title "Call reports couldn't load.", body "Your calls are safe. This is a problem on our side or with your connection.", actions **Retry** (primary) + "Go to Cockpit", Details with the error id (support reference) |
| **Not found** | `NotFound` | Unknown route or deleted record URL | Inside the shell (the off-shell "SIGNAL LOST · STATUS: DISCONNECTED" page is retired, F-QA-017, F-QA-039, F-UX-029). `<title>` "Page not found · Vaani Labs". Title "This page doesn't exist." Body "The link may be old, or the item was deleted." Actions: Go to Cockpit · Search (opens the palette) |
| **Permission** | `Forbidden` | The role cannot use a route or action (403) | Inside the shell, no redirect (the Knowledge proposals link silently landed on the live-call Cockpit, F-UX-034, F-QA-018). `lock` icon in `--text-3`. Title "Only organization admins can review proposals." Body names who can help: "Ask an admin (2 in this workspace) to change your role or review them for you." Action: "Copy request link" or "Request access" when that endpoint exists; secondary "Go back". Entry points for gated features are either hidden or shown disabled with "Admins only" |
| **Section** | `SectionError` | One region failed (a KPI card, the Intents panel, a sheet tab) | **With last good data:** keep it and add warning StatusText "Couldn't refresh · Retry · Updated 4:42 pm". **Without data:** a compact InlineError in the region ("Couldn't load intents. Retry"). Never an empty state for a failed request (F-UX-019) |
| **Inline** | `InlineError` | A control's action failed | §11.2 |
| **Offline** | ConnectionBar + stale StatusText | Network gone | §10.3; regions show "Showing data from 11:42 am"; network actions carry "You're offline" |
| **Service degraded** | `SectionError` variant `degraded` | A dependency failed: intent clustering, telephony, payments | Plain copy + the last good result: "Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. Retry" (F-UX-036). Never "LLM call failed" |
| **Session expired** | `SessionExpired` dialog (sm) | A 401 on a background request | "Your session expired. Sign in again to keep working. Edits on this page stay on this device." Action "Sign in" → `/login?next=<path>&reason=expired`. Redirect only on an explicit 401, never on a timeout (F-QA-007) |
| **Rate limited** | InlineError | 429 | "Too many attempts. Try again in 30 s." The countdown text updates each second and is not announced |

### 16.2 Error copy map (lib/errors.ts)

| Cause | Sentence | Action |
|---|---|---|
| Network / timeout | Can't reach Vaani Labs. Check your connection. | Retry |
| 5xx | Something went wrong on our side. Your data is safe. | Retry |
| 404 record | This {lead} was deleted, or the link is wrong. | Go to {Leads} |
| 403 | Only {role} can {action}. | Request access / Go back |
| 409 flow | This flow was changed in another tab or by a teammate. | Review changes (conflict sheet) |
| 422 validation | Field-level messages; the form Notice lists how many ("2 fields need attention") | Focus the first field |
| 402 / wallet | Wallet is ₹0. Top up to place calls. | Top up |
| Telephony | Couldn't reach the phone line. The call was not placed and you were not charged. | Retry (through the Call gate) |
| Payment | UPI payment didn't complete. You were not charged. | Try again |

Only claim "not charged" when the server confirms it (P1).

### 16.3 ARIA and focus

PageError, NotFound and Forbidden move focus to the H1 on route entry (like every route change) and set `<title>`. SectionError uses `role="status"` on load and `role="alert"` after a user-initiated Retry fails.

```tsx
<PageError error={e} onRetry={reset} />      // Next.js error.tsx boundary
<NotFound />  <Forbidden role="Organization admin" action="review proposals" adminCount={2} />
<SectionError lastUpdated={date} onRetry={refetch} variant="refresh" | "empty" | "degraded" details={raw} />
<SessionExpired open={…} next={pathname} />
```

**Resolves:** F-UX-019, F-UX-023, F-UX-034, F-QA-018, F-UX-036, F-QA-017, F-QA-039, F-UX-029, F-QA-007, F-UX-030.

---

## 17. Success states

Success is **proven** before it is shown (P1): a 2xx for saves, the payment provider's confirmation for money, a validated revision for Publish, all setup checks for "Live". The current product shows "Context Saved" for 2 s regardless of the result (F-QA-020), "Up to date" after failed saves (F-QA-002) and "You're live" at ₹0 (F-UX-006).

| Where | Pattern | Example |
|---|---|---|
| In place | StatusText success, or the element's new state | "Saved 11:24 am" · "Indexed · 42 passages" · the Live chip moving from v7 to v8 |
| Off-screen effect | Success toast | "Default flow updated · used by Cockpit, Meetings and Leads" |
| Going live | Publish toast + VersionChip | "v8 is live on 1 number and 1 batch · Roll back to v7…" |
| Money | Toast only after confirmation, with runway | "₹500 added. Wallet ₹540.10 · about 3 h of calls." Before confirmation: info Notice "Payment pending" |
| Multi-step job | StageProgress end state | "1,212 imported · 28 skipped · Download skipped rows" |
| Setup | The setup-track row turns done with a `check` (`02-components-gate.md` §5.3); "Live" only when all five pass | "Finish setup · 4 of 5" |

Rules: success colour appears only on the icon and status text, never as a green banner; no confetti, no celebratory motion, no exclamation marks; buttons return to their idle label (no "✓ Saved" morph) and the status element reports the result.

**Resolves:** F-QA-020, F-QA-002, F-UX-006, F-UX-014.

---

## 18. Save state and version state

### 18.1 SaveState (the save chip)

Lives in the Flow header (48 px) next to the VersionChip, in sheets with autosaving fields, and in the Cockpit's context panel. Today "Up to date" is permanent, failures are silent and a quick exit loses the last edit (F-FLOW-003, F-QA-002, F-UX-024).

**Values:** height `--size-chip` 24; padding `0 var(--space-8)`; `--radius-4`; `--type-label-12`; icon `--icon-sm` with `--space-inline-sm` gap; time in a `<time>` with tabular figures.

| State | Label | Icon | Colours | Announce |
|---|---|---|---|---|
| `saved` | Saved 11:24 am | `check` | quiet: no fill, no border, `--text-3`; icon `--success-text` | no (only after a recovery: "Saved") |
| `dirty` | Unsaved changes | `circle-dot` | neutral chip: `--surface` fill, 1 px `--border-strong`, `--text-2` | no |
| `saving` | Saving… | Spinner sm | quiet, `--text-2`; shown only if the save takes longer than `--timing-skeleton-delay`, otherwise `dirty` goes straight to `saved` | no |
| `error` | Couldn't save · Retry | `circle-alert` | `--danger-soft` / `--danger-text`; the chip is a button that retries; persistent until a save succeeds | **assertive**, once; plus an error toast on the first failure |
| `new` | Not saved yet | `circle-dot` | neutral | no |
| `offline` | Offline · 3 edits on this device | `cloud-off` | `--warning-soft` / `--warning-text` | polite, once |
| `conflict` | Changed elsewhere · Review | `triangle-alert` | `--warning-soft` / `--warning-text`; opens the conflict sheet (409, direction §6.5) | assertive, once |
| `device` (interim I1 only) | Saved on this device 11:24 am | `hard-drive` | quiet, like `saved`: `--text-3`, icon `--success-text`; tooltip "Your edits are kept in this browser until you publish. Callers hear the saved flow." | no |
| `volatile` (interim I1, storage unavailable) | Not saved · this tab only | `circle-alert` | `--danger-soft` / `--danger-text`, persistent; tooltip "This browser won't keep your edits. Publish them, or they are lost when this tab closes." | assertive, once |

Tooltip on `saved`: "All changes are saved to the draft. Callers hear Live v7 until you publish." The chip never reads "Up to date".

**Machine rules (implementation contract):**
- The dirty flag is set only by user edits. Hydration, `fitView`, node dimension measurement, selection, viewport and theme changes never mark dirty and never write (F-FLOW-002, DESIGN-SYSTEM-08).
- Autosave writes to the **draft** revision with `If-Match`; one request in flight; edits during a save queue behind it. Retries: 3 with backoff, then `error`.
- Pending saves flush on in-app navigation, `visibilitychange` → hidden and `pagehide` with `fetch(…, { keepalive: true })`. `beforeunload` is registered only while `dirty`, `saving`, `error`, `offline` or `volatile`.
- **Interim I1** (Flow Designer part 2 §4.9, the only interim before revisions ship): autosave writes to IndexedDB, not the network, and the machine reports `device`; if IndexedDB throws it reports `volatile`. The first network write is the Publish gate's.
- Undo and Redo are bound to the history stack lengths; Undo is disabled with nothing to undo (F-FLOW-005).

### 18.2 VersionChip (Draft vs Live)

| Chip | Treatment | Opens |
|---|---|---|
| `Draft · 3 changes ▾` | **Neutral** (never amber): `--surface` fill, 1 px `--border-strong`, `--text-2`, `--type-label-12`, `--size-chip` tall, `chevron-down` `--icon-sm` | Version menu: Compare with live · Version history · Discard draft changes… (tier 2) |
| `Live v7` | `--success-soft` fill, `--success-text`, a **static** `--size-live-dot` dot in `--live` (`data-mark`); the dot pulses only during a live call, never here | Version history |
| `Not live yet` | neutral, `--text-3` | Publish explainer |
| Clean draft | the Draft chip is hidden; only `Live v7` shows | |
| `device` (interim I1) | `Draft on this device · 3 changes ▾`: neutral, the same treatment as `Draft`; the Live chip beside it reads `Saved flow` (neutral, no dot, no version claimed) | Version menu: Compare with the saved flow · What changed · Discard my draft… |

The live note ("Live v7 answers +91 80 •••• 2210 since 12 Sep. Callers hear v7 until you publish.") sits in the phase-ruler row (Flow Designer spec). **Until the revisions backend ships**, the chips use the `device` variants above and the live note reads "Edits stay on this device until you publish. Callers hear the saved flow." (direction §8; Flow Designer part 2 §4.9). The Draft chip is never hidden while edits exist.

### 18.3 UnsavedChangesBar (forms with an explicit Save)

Settings and other forms keep one save model: a section-scoped bar that appears only when the form is dirty (F-UX-012). It replaces the always-enabled header "Save Changes".

- Sticky at the bottom of the form column (`--size-container-form`), `bottom: calc(var(--size-baseline) + var(--space-16))`; `--surface-overlay`, 1 px `--border-overlay`, `--radius-8`, `--e3`; padding `--space-8 var(--space-8) var(--space-8) var(--space-16)`.
- Left: StatusText "Unsaved changes · 2 fields". Right: **Discard** (ghost) and **Save** (primary; Spinner + "Saving…" while working).
- Enter animation: `--shift-toast` rise over `--dur-slow`; exit `--dur-fast`.
- ⌘/Ctrl+S saves while focus is in the form. After saving, the bar leaves and the section heading shows StatusText "Saved 11:24 am" for `--timing-toast`.
- Leaving with changes (sub-nav click, route change, tab close) opens a ConfirmDialog: "Discard changes to Profile?" · Keep editing · Discard (F-UX-012).
- `role="region"` `aria-label="Unsaved changes"`; its appearance is announced once, politely.
- Phone: full width above the bottom bar, 44 px buttons.
- **Switches** autosave instead: the switch flips at once, StatusText sm "Saved" appears beside it for `--timing-toast`, and on failure the switch reverts with "Couldn't save. Retry" (F-UX-012).

### 18.4 React

```tsx
type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error' | 'new' | 'offline' | 'conflict' | 'device' | 'volatile';
interface SaveStateProps { status: SaveStatus; savedAt?: Date; pendingEdits?: number; onRetry?(): void; onReview?(): void; }
interface VersionChipProps { live?: { version: number; since: Date } | null; draftChanges?: number; variant?: 'revision' | 'device'; onOpenMenu?(): void; }
interface UnsavedChangesBarProps { dirtyCount: number; saving?: boolean; onSave(): Promise<void>; onDiscard(): void; label?: string; }
const save = useSaveMachine({ save: (draft, etag) => api.putDraft(id, draft, etag), debounceMs: 300 });
useUnsavedChangesGuard(isDirty, { title: 'Discard changes to Profile?' });   // router + beforeunload
```

`useSaveMachine` is a small reducer (or XState machine) exposing `status`, `savedAt`, `markDirty()`, `flush()` and `retry()`; the chip is a pure view of it, which is what makes "Up to date while failing" impossible.

**Resolves:** F-FLOW-003, F-QA-002, F-UX-024, F-FLOW-002, F-FLOW-005, F-FLOW-034 (status always visible because the designer has no full-screen mode; Flow Designer part 1 §3.1), F-UX-012, F-QA-020, F-UX-005 and F-FLOW-014 (what is live).
