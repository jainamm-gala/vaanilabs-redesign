
---

## 9. Toast

**Purpose.** Report the outcome of an action whose effect is off-screen or easy to miss, and offer the one follow-up that matters (Undo, Retry, View, Roll back to v7…). No toast container exists today, so async outcomes are silent (F-A11Y-014).
**Don't use** for blocking or persistent conditions (Notice where it blocks), for form validation (Field errors), for anything needing a decision (Dialog), or for a change the user can see in place (StatusText).

### 9.1 Anatomy and values

| Part | Value |
|---|---|
| Surface | `--surface-inverse`, `data-surface="inverse"`, `--radius-8`, `--e3`, no border |
| Size | width `min(var(--size-toast), 100vw - 2 * var(--page-margin))`; padding `--space-8 var(--space-8) var(--space-8) var(--space-12)`; min-height `--control-h` + 2 × `--space-8` |
| Icon | `--icon-md`, `currentColor` (inverse text). The **glyph** carries the kind: `check` success, `info` info, `circle-alert` error, `undo-2` undo, Spinner for progress. No state hue on the inverse plane: the word and the glyph carry it (P2) |
| Message | `--type-data-13`, `--text` (inverse); one sentence, up to two lines, then truncated with the full text in the region's accessible name |
| Action | at most one: a text button, `--type-label-13`, `--fw-semibold`, underlined (offset 3 px as in base.css), height `--control-h-sm` for the hit area, focus ring `--focus-inverse` |
| Dismiss | IconButton `--control-h-sm` (28), `x`, `aria-label="Dismiss"`, at least `--space-8` from the action |
| Progress (optional) | a 2 px (`--space-2`) ProgressBar along the bottom inside the radius, fill `--text` (inverse) at `--opacity-partial` track |

### 9.2 Kinds and timing

| Kind | Example | Stays | Announce |
|---|---|---|---|
| success | "Default flow updated · used by Cockpit, Meetings and Leads" (F-UX-014) | `--timing-toast` (6 s), paused on hover, focus and hidden tab | polite |
| info | "Export is being prepared. We'll email a link." | 6 s | polite |
| undo | "Deleted 'Polite close' and 2 connections · Undo" (F-FLOW-001, F-FLOW-025) | until dismissed or superseded (01-foundations §11) | polite |
| error | "Couldn't save. Your last 2 edits are on this device · Retry" | until dismissed or resolved | **assertive** (`role="alert"`) |
| progress | "Importing 1,240 leads… 820 done · View" → becomes success or error in place | until done, then as that kind | polite at start and end only |
| publish | "v8 is live on 1 number and 1 batch · Roll back to v7…" (direction §6.5) | 6 s, then the version menu keeps Roll back | polite |

**Coalescing:** consecutive undoable actions of the same kind merge ("Deleted 3 steps · Undo" undoes all three). An identical error does not stack; its count increments ("Couldn't refresh (3)").

### 9.3 Stack and placement

- Max **3** visible, newest at the bottom, gap `--space-8`. A 4th pushes out the oldest non-error, non-undo toast.
- Desktop and laptop: bottom right, `right: var(--page-margin)`, `bottom: calc(var(--size-baseline) + var(--space-16))` so the Baseline stays readable. Flow Designer: `bottom: calc(var(--size-problems-bar) + var(--space-16))`, right of the inspector when it is docked.
- Tablet: bottom right, `bottom: var(--space-16)`.
- Phone: full width minus `--page-margin` on each side, `bottom: calc(var(--size-bottombar) + env(safe-area-inset-bottom) + var(--space-8))`.
- `--z-toast`; a toast never covers the focused element (the region shifts up when a sticky footer or UnsavedChangesBar is present).

### 9.4 Keyboard and ARIA

- **F8** moves focus to the newest toast (listed in the `?` sheet as "Go to notifications"); Tab moves through the action and Dismiss; Esc dismisses the focused toast and returns focus to where it was.
- ⌘/Ctrl+Z triggers the newest undo toast when focus is not in an editable field (in the Flow Designer the history stack owns ⌘/Ctrl+Z and the toast mirrors it).
- The viewport is `role="region"` `aria-label="Notifications"`; each toast is `role="status"` (`aria-live="polite"`) or `role="alert"` for errors. Radix Toast: `type="background"` / `"foreground"`.
- Swipe right dismisses on touch.

### 9.5 Motion

Enter: opacity + `--shift-toast` rise over `--dur-slow`. Exit: fade `--dur-fast`. Others in the stack reposition instantly. Reduced motion: fade only.

### 9.6 Copy

Past tense for done work, present for ongoing: "Lead saved", "Importing 1,240 leads…". Name the object. No exclamation marks, no "Success!", no "Oops". Errors say what happened and the next step in one line.

### 9.7 React

```tsx
toast.success(message, { action?: { label: string; onClick(): void }, id?: string });
toast.info(message, opts);
toast.error(message, { action?: { label: 'Retry'; onClick }, id?: string });      // persistent
toast.undo(message, { onUndo(): Promise<void>, coalesceKey?: string });            // persistent
const t = toast.progress(message, { value?: number });  t.update({ value, message });  t.done('success' | 'error', message);
<Toaster />   // once in the AppShell; Radix Toast.Provider swipeDirection="right" duration={6000}
```

The `6000` is imported from `tokens.json` (`timing.toast`). While a modal is open, `toast()` calls queue and flush on close (§1.6).

**Resolves:** F-A11Y-014, F-FLOW-001, F-FLOW-025, F-FLOW-003 (first save failure), F-UX-014, F-UX-019 (background failures).

---

## 10. Notice (banners and alerts)

**Purpose.** A persistent, in-flow message about a condition that affects a field group, a section or a page, shown **where it blocks** (direction §6.1 blocking-notice rule). There are no global alert banners (anti-pattern 18) except the ConnectionBar (§10.3).

### 10.1 Anatomy, tones and values

| Part | Value |
|---|---|
| Container | `--radius-6`; padding `--space-10` `--space-12`; gap `--space-10`; 1 px **transparent** border (becomes visible in forced-colours mode) |
| Icon | `--icon-md`, the tone's text colour: `info` info, `circle-check` success, `triangle-alert` warning, `circle-alert` danger, `info` neutral |
| Text | `--type-data-13`; a **lead sentence** in `--fw-semibold` then the body in the same colour; max `--size-measure` |
| Action | at most one primary action as a link (`--fw-medium`, underlined) or a small secondary Button (`--control-h-sm`); plus at most one secondary link |
| Dismiss (optional) | IconButton `--control-h-sm`, hit `--size-hit-min` (touch `--size-hit-touch`), ≥ `--space-8` from the action |

| Tone | Fill | Text and icon | Use |
|---|---|---|---|
| neutral | `--surface-2` | `--text-2` | Context: "Editing steps needs a screen 1024 px or wider." |
| info | `--info-soft` | `--info-text` | System facts: "Scheduled for 10 am IST tomorrow." |
| success | `--success-soft` | `--success-text` | A completed setup step shown on its page |
| warning | `--warning-soft` | `--warning-text` | Advisory or blocking: low wallet, outside calling hours, template pending approval |
| danger | `--danger-soft` | `--danger-text` | Failed state that needs action: "Autopay couldn't top up." |

Every pair is ≥ 5.47:1 in both themes (01-foundations §3.4).

**Scopes:** `inline` (inside a form group or card), `section` (top of a panel), `page` (under the page header, full content width, **not sticky**, never in the Flow Designer header). A page shows at most one page notice; more conditions go into the most severe one plus "and 1 more".

**ARIA:** `role="status"` for conditions present or changing (polite; a status present at page load is not announced, which is correct). `role="alert"` only when the notice appears as the direct result of a user action that failed. Never `role="alert"` for a persistent condition (F-A11Y-015). On dismiss, focus moves to the page H1 (page scope) or the section heading.

**Dismissal memory:** per user, per condition **and state** (`wallet:low`, `wallet:empty`), for 24 h, stored server-side as a UI preference (local storage as fallback). A worse state brings it back.

### 10.2 WalletNotice: the redesigned low-balance signal

Today a 42 px blue-tinted `role="alert"` bar sits on every page including Billing, links to Profile, grows to 4 lines at 320 px, renders 3 s late and returns in every new tab (F-UX-002, F-UX-028, F-QA-004, F-RWD-013, F-QA-036, F-A11Y-015). It becomes a **signal ladder** that never permanently takes space:

| Rung | Where | Takes space? | Content |
|---|---|---|---|
| 1. Baseline wallet segment | Desktop and laptop, every page except the Flow Designer (Baseline spec) | No (the Baseline exists anyway) | `Wallet ₹2,340.50 · about 16 h of calls`; turns `--bl-warn` with a `triangle-alert` icon and a "Top up" link when low or empty |
| 2. Wallet chip | Tablet and phone top bar; Flow Designer header | No | `₹2,340` neutral; low or empty: warning chip `₹42 · 17 min` / `₹0 · Top up` |
| 3. **WalletNotice** | Page scope, only on pages whose main task spends money: Cockpit, Leads, Flows (Test call), Rep console, Personal agents. **Never** on Billing, Settings, Analytics or Knowledge | One line, in flow, dismissible | See states |
| 4. Inline reason | Every Call action and the Call gate | No | Disabled "Place call…" with the reason "Wallet is ₹0. Top up to place calls." (DisabledReason) |

**WalletNotice states**

| State (computed server-side) | Tone | Copy | Actions | Dismiss |
|---|---|---|---|---|
| Low (runway below the threshold, §21) | warning | **Wallet is low.** ₹42.10 left, about 17 min of calls. | Top up · Turn on autopay (≥ 1024 and autopay off) | 24 h, collapses into rungs 1–2 |
| Empty | warning | **Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. | Top up | 24 h; rung 4 keeps every Call action's reason, so nothing is lost |
| Autopay failed | danger | **Autopay couldn't top up.** Your UPI mandate was declined. Calls pause at ₹0. | Fix autopay | 24 h |
| Payment pending | info | **Payment pending.** Your wallet updates when UPI confirms. | none | auto-hides on confirmation (never claims money before it arrives, P1) |

- "Top up" opens the Top-up sheet in place (`?topup=1`, Billing spec). No link ever points at Profile (F-UX-002).
- The state is resolved in the server layout, so the notice is in the first paint and never shifts content (F-QA-036).
- **Phone:** one line, "Wallet ₹0 · calls paused", a 44 px "Top up" button and a 44 px Dismiss separated by `--space-8`; body copy moves into the Top-up sheet (F-RWD-013).
- Crossing into Low or Empty during a session announces once, politely ("Wallet low. About 17 min of calls left.").

### 10.3 ConnectionBar (the only app-wide bar)

| State | Tone | Copy | Actions |
|---|---|---|---|
| Offline (`offline` event, or 2 consecutive network failures) | warning | **You're offline.** Showing data from 11:42 am. Edits to this flow stay on this device until you reconnect. | none |
| Reconnecting | neutral + Spinner sm | Reconnecting… | Retry now |
| Back online | none: the bar hides and a success toast says "Back online. 2 edits saved." | | |

- Placement: top of the main column, above the page header, full width of the content column, padding `--space-6 var(--space-16)` with `--type-data-13` (32 px), 1 px `--border` bottom, `--z-sticky`. It pushes content down (a rare, real state; stability matters less than truth).
- Offline behaviour: network-bound actions get `aria-disabled` with the reason "You're offline"; client navigation to routes that are not cached is cancelled with an info toast instead of falling back to the browser error page (F-QA-007).
- Session expiry is not a bar: it is the **SessionExpired** dialog (§16).
- `role="status"`; the change to offline is announced once.

### 10.4 Do / don't

| Do | Don't |
|---|---|
| "Wallet is ₹0. Phone calls are paused." on Cockpit, with Top up | "Wallet empty — top up now to keep calls flowing." on every page (F-UX-028) |
| Amber warning tone, text-link CTA | A filled blue Top up at 3.27:1 as the first primary on every page |
| Hide on Billing | Duplicating Billing's own CTAs |

### 10.5 React

```tsx
interface NoticeProps {
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  scope?: 'inline' | 'section' | 'page';
  title: string;                         // the lead sentence
  children?: React.ReactNode;            // body
  action?: { label: string; href?: string; onClick?(): void };
  secondaryAction?: { label: string; href?: string; onClick?(): void };
  dismissKey?: string;                   // enables Dismiss + 24 h memory, e.g. 'wallet:empty'
  live?: 'status' | 'alert';             // default 'status'
}
<WalletNotice page="cockpit" />          // reads useWalletState(); renders nothing on non-spending pages
<ConnectionBar />                        // once in the AppShell; driven by useConnection()
```

**Resolves:** F-UX-002, F-UX-028, F-QA-004, F-QA-036, F-RWD-013, F-A11Y-015, F-FLOW-034 (no banner in the builder), F-QA-007 and F-UX-019 (offline), anti-pattern 18.

---

## 11. Inline status messages

### 11.1 StatusText

The status-sentence grammar in one component: `[icon] sentence · quiet meta · at most one action` (direction §4.2 rule 3).

| Size | Type | Icon | Use |
|---|---|---|---|
| `sm` | `--type-meta-12` | `--icon-sm` 14 | Under fields, in table cells, in sheet meta rows |
| `md` | `--type-data-13` | `--icon-md` 16 | Section footers, list rows (Knowledge status column) |

| Tone | Colour | Examples |
|---|---|---|
| neutral | `--text-3` | "Not captured" · "Updated 4:42 pm" |
| progress | `--text-2` + Spinner | "Indexing… 60%" · "Saving…" |
| success | `--success-text` | "Indexed · 42 passages · 2 min ago" · "Saved" |
| warning | `--warning-text` | "Stale · computed 21 Sep · Recompute" (F-UX-036) |
| danger | `--danger-text` | "Couldn't index · Retry" |

Rules: the word always carries the state (never an icon or colour alone, F-A11Y-019); the meta separator is the middle dot; times use the date grammar; `role="status"` only when the text changes while the user watches (an upload row), otherwise plain text.

### 11.2 InlineError

For a control or region that failed (not a form field; field errors belong to the Field spec). Anatomy: `circle-alert` + a plain sentence (`--danger-text`, `--type-data-13`) + **Retry** (link-style button) + a **Details** disclosure. Details (collapsed by default) shows the raw message and an error id in `--type-mono-12` on `--surface-2`, `--radius-4`, padding `--space-8`, with Copy. Raw SDK and LLM strings live only here (F-UX-019, F-UX-023, F-UX-036).

- Placement: directly under the control or at the top of the region that failed, never in another card (the Knowledge search error sat in the Upload card, F-UX-019).
- `role="alert"` when caused by a user action (Refresh, Search); `role="status"` when it is the region's initial load result.
- Focus is not moved unless the user's action caused it and the error is outside the viewport.

```tsx
interface StatusTextProps { tone?: 'neutral' | 'progress' | 'success' | 'warning' | 'danger'; size?: 'sm' | 'md';
  children: React.ReactNode; meta?: React.ReactNode; action?: { label: string; onClick(): void }; live?: boolean; }
interface InlineErrorProps { message: string; onRetry?(): void; details?: string; errorId?: string; live?: 'status' | 'alert'; }
```

**Resolves:** F-UX-019, F-UX-023, F-UX-036, F-A11Y-019, F-UX-033 (status column), F-QA-020 (Save context result).
