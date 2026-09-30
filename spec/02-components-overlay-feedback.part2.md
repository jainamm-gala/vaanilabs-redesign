## 2. Dialog

**Purpose.** A short, modal task that must finish or be cancelled before returning to the page: create a small record, confirm, rename, choose a template, show the shortcut sheet.
**Use when** the task has ≤ 6 fields or one decision and does not need the page behind it. **Don't use** for editing records (Sheet), for billable actions (Gate), for anything that changes while a call is live, or for "Are you sure you want to save?".

### 2.1 Anatomy

1. **Scrim**: flat `--scrim`, `--z-scrim`.
2. **Container**: §1.2; `max-height: calc(100dvh - 2 * var(--space-64))`, flex column.
3. **Header**: title (`--type-title-16`, `--text`, `text-wrap: balance`), optional description (`--type-body-14`, `--text-2`, max `--size-measure`), close IconButton top right. Padding `--space-20 --space-20 --space-12`. No icon tile, no mono kicker (today's "ONE AT A TIME — FOR BULK, USE CSV" kicker is retired).
4. **Body**: the only scroller; padding `0 var(--space-20) var(--space-20)`; fields at `--space-field-gap`.
5. **Footer**: §1.2 footer. Left: optional **why-text** (`--type-meta-12`, `--text-3`; `--danger-text` when it explains a block). Right: secondary then primary.

### 2.2 Variants and sizes

| Size | Width token | For |
|---|---|---|
| `sm` | `--size-dialog-sm` (400) | ConfirmDialog, SessionExpired, Rename |
| `md` | `--size-dialog-md` (560) | New lead, New webhook, Import step 1 (file), Flow settings |
| `lg` | `--size-dialog-lg` (720) | Import mapping preview (F-QA-022), keyboard shortcut sheet in two columns (F-FLOW-024) |

### 2.3 States

| State | Treatment |
|---|---|
| Default | As anatomy. Primary enabled; validation shows on blur and on submit (Field spec). |
| Submitting | Primary shows Spinner md + the verb in progress ("Creating lead…"); both buttons `aria-disabled`; Esc and outside click are ignored until settled; `aria-busy="true"` on the body. |
| Submit failed | Danger **Notice** at the top of the body, `role="alert"`, focus moves to it: "Couldn't create the lead. The phone number is already in Leads. Open existing lead". Field errors stay on their fields. |
| Dirty + close attempt | Footer swaps to the **inline discard state** (§2.5). |
| Disabled primary | Never silently: the why-text says what is missing ("Add a phone number to create the lead"). The button uses `aria-disabled` and stays focusable (Button spec). |

### 2.4 Behaviour, keyboard, ARIA

- Enter submits when focus is in a single-line field; ⌘/Ctrl+Enter submits from a textarea. Esc = Cancel. Tab order: header → body → footer (secondary, primary) → close.
- `role="dialog"` `aria-modal="true"` `aria-labelledby={titleId}` `aria-describedby={descriptionId}` (omit when there is no description). The close button is named. The title is an `h2`.
- The shortcut sheet (`?`) is a lg Dialog, portaled to `<body>` (it was clipped inside the canvas, F-A11Y-027, F-FLOW-024), grouped Edit / Select / Navigate / View, with platform-correct modifier icons and only shortcuts that work.

### 2.5 Inline discard state (no stacked modal)

When a dirty dialog is dismissed (Esc, outside click, ×), the footer changes in place: why-text "Discard this lead? What you typed will be lost." · **Keep editing** (secondary, focused) · **Discard** (danger outline). Esc again = Keep editing. This replaces the audited behaviour where Esc threw away typed input (F-A11Y-005).

### 2.6 Responsive

See §1.7. Phone full-screen dialogs: a sticky header of `--size-header` (56) with the title left and the close button top right (the same place as on desktop). Footer sticky with `padding-bottom: calc(var(--space-12) + env(safe-area-inset-bottom))`; buttons `--control-h` (44 on touch), side by side when both labels fit, otherwise stacked with the primary on top.

### 2.7 Copy

Title = the task in sentence case ("New lead", "Rename flow"), not "Create a new lead record". Primary = verb + object ("Create lead"). Secondary = "Cancel". Placeholders are examples ending in "…" (never labels). No em-dashes.

### 2.8 Do / don't

| Do | Don't |
|---|---|
| Labels above fields, sentence case, 13/500 | Mono uppercase labels, blurred page behind (current New lead) |
| Return focus to "New lead" after closing | Drop focus to `<body>` after Esc (F-A11Y-005) |
| One primary in the footer | Two filled buttons side by side (F-UX-047) |

### 2.9 React

```tsx
interface DialogProps {
  open: boolean; onOpenChange(open: boolean): void;
  size?: 'sm' | 'md' | 'lg';                 // default 'md'
  title: string; description?: React.ReactNode;
  dirty?: boolean;                            // enables the inline discard state
  discardLabel?: string;                      // "Discard this lead?"
  returnFocusTo?: React.RefObject<HTMLElement>;
  busy?: boolean;                             // blocks dismissal while submitting
  children: React.ReactNode;                  // <DialogBody/> and <DialogFooter why=… />
}
```

Built on `Dialog.Root/Portal/Overlay/Content` with `onEscapeKeyDown` and `onPointerDownOutside` routed through the dirty guard; `onCloseAutoFocus` applies `returnFocusTo`. Phone variants are the same component with a `data-layout="sheet|fullscreen"` attribute set from `useBreakpoint()`.

**Resolves:** F-A11Y-005, F-A11Y-027, F-FLOW-024, F-UX-047, F-VIS-022 (blurred backdrop).

---

## 3. Confirmation and destructive actions

### 3.1 Match the guard to the risk

| Tier | When | Pattern | Examples in Vaani |
|---|---|---|---|
| **0 · None** | Routine, instantly visible, trivially redone | Just do it | Change a filter, sort, collapse a frame, toggle density, **End call** (urgent and expected; direction §6.2) |
| **1 · Undo** | Reversible (server soft-deletes for at least the toast's lifetime) | Act at once + **Undo toast** | Delete a step or connection, delete a lead, delete a note, remove a lead from a batch, archive a room |
| **2 · Confirm** | Recoverable but costly to redo, or affects others | **ConfirmDialog** naming the object and the consequence | Discard unsaved changes · Discard draft changes (replaces "Reset to default", F-FLOW-019) · Replace the draft with an AI draft (F-FLOW-031) · Restore v5 as draft · Delete room (F-UX-038) · Revoke an API key · Delete a webhook · Cancel a scheduled batch · Turn off autopay · Sign out… (F-UX-029) · Delete a knowledge file used by a flow |
| **3 · Typed** | Irreversible, or a large blast radius | **ConfirmDialog with typed confirmation** | Delete a flow that is live or attached to a number or batch (type the flow name) · Delete the workspace or account (keeps today's typed-email pattern and 7-day grace, a strength) · Bulk delete more than 50 leads (type the count) · Release an inbound number (type its last 4 digits) |
| **4 · Gate** | Bills money, dials people or goes live | **Call gate / Publish gate / money and form gates** (`02-components-gate.md`) | Place call, Call n leads, Publish v8, Top up, Assistant steps with side effects (autonomy levels, F-UX-022) |

A backend that cannot soft-delete moves an action from tier 1 to tier 2; it never drops to tier 0. No setting, admin or otherwise, skips tier 3 or 4 (P3).

### 3.2 Anatomy (ConfirmDialog)

A `sm` Dialog with `role="alertdialog"`.
1. **Title as a question naming the object:** "Delete 'Site-visit qualifier'?" (`--type-title-16`; the object name in quotes, `translate="no"`).
2. **Consequence** (`--type-body-14`, `--text-2`): what is removed, what is kept, whether it can be undone. "It stops answering +91 80 •••• 2210 and is removed from 1 scheduled batch. Call reports for its 121 calls are kept. This can't be undone."
3. **Impact list** (optional, tier 3): up to 4 rows, `--type-data-13`, each with a Lucide icon at `--icon-md` in `--text-3` (phone-incoming, list, users).
4. **Typed field** (tier 3): label "Type **Site-visit qualifier** to confirm" (label-13; the target in `--fw-semibold`), a standard input, `autocomplete="off"`, `spellcheck="false"`, paste allowed (never block paste). Match = trimmed, Unicode NFC, case-insensitive.
5. **Footer:** why-text while unmatched ("Type the flow name to delete it") · **Cancel** (ghost) · **confirm** button.

### 3.3 Buttons and colour

- Destructive confirm: the Button spec's **danger** variant, which is an **outline** everywhere including here (`--surface` fill, `--danger-text` label and icon, 1 px `--danger-border`, hover `--danger-soft`). There is no filled red in the product: red stays calm and the dialog's question carries the weight (01-foundations §15.4). The label is verb + object: "Delete flow", "Revoke key", never "Yes" or "OK".
- Non-destructive confirm (Restore as draft, Replace draft): the **primary** Neel button.
- Order: Cancel then confirm, right-aligned. Destructive dialogs focus **Cancel** on open; typed dialogs focus the input.

### 3.4 States

| State | Treatment |
|---|---|
| Unmatched (tier 3) | Confirm `aria-disabled="true"`, `--text-dis` label, `--border` edge; why-text visible and linked by `aria-describedby`. |
| Matched | Confirm enables; the why-text clears. No green tick (no false reassurance). |
| Working | Confirm shows Spinner + "Deleting…"; dialog cannot be dismissed. |
| Failed | Danger Notice in the body with `role="alert"`, the dialog stays open, confirm relabels to "Try again". |
| Done | Dialog closes, focus goes to `returnFocusTo` (the next row or the list heading), a toast states the result ("Deleted 'Site-visit qualifier'"). Tier 2 deletes add Undo when the backend allows. |

### 3.5 Where destructive actions live (F-UX-035, F-FLOW-019, F-UX-032, F-UX-033)

- In the **overflow menu (⋯)**, last group, after a separator, in `--danger-text`, label ending in "…" when a dialog follows ("Delete lead…").
- Or in a **Danger zone** section at the end of a Settings page (bordered `--border`, heading "Danger zone", each action with its consequence sentence).
- **Never** full-width, never directly under Call, never the heaviest element in a panel (the red "Delete Node" slab becomes a "Delete step" item in the inspector's ⋯ menu, backed by Undo), and at least `--space-8` from any routine control on touch.

### 3.6 Copy

"Delete 'Polite close' and its 2 connections?" · "Discard draft changes? Your draft goes back to Live v7. The 3 changes since then are removed." · "Sign out of Vaani Labs? Unsaved edits on this device are kept for 7 days." Never "Are you sure?", never "Oops", never exclamation marks.

### 3.7 React

```tsx
interface ConfirmOptions {
  title: string;                       // "Delete 'Site-visit qualifier'?"
  body: React.ReactNode;               // consequence sentence(s)
  impact?: { icon: LucideIcon; text: string }[];
  confirmLabel: string;                // "Delete flow"
  tone?: 'danger' | 'default';         // danger → outline danger button, focus Cancel
  typedConfirm?: { value: string; label?: string; hint?: string };  // tier 3
  onConfirm(): Promise<void>;          // rejects → inline error, dialog stays
  returnFocusTo?: HTMLElement | null;
}
const confirm = useConfirm();          // returns Promise<boolean>
await confirm({ title, body, confirmLabel: 'Delete flow', tone: 'danger', typedConfirm: { value: flow.name } });
```

Built on `@radix-ui/react-alert-dialog` (`AlertDialog.Cancel` receives initial focus). One `<ConfirmProvider>` in the AppShell renders a single instance, which enforces "one modal at a time".

**Resolves:** F-FLOW-001 (Backspace delete now Undo), F-FLOW-019, F-FLOW-031, F-UX-035, F-UX-032, F-UX-033, F-UX-038, F-UX-029, F-UX-022 (with `02-components-gate.md` §5.7).
