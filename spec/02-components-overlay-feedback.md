<!-- Assembled from 02-components-overlay-feedback.part1.md, 02-components-overlay-feedback.part2.md, 02-components-overlay-feedback.part3.md, 02-components-overlay-feedback.part4.md, 02-components-overlay-feedback.part5.md, 02-components-overlay-feedback.part6.md, 02-components-overlay-feedback.part7.md, 02-components-overlay-feedback.part8.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 02 · Components: overlay and feedback

**Status:** v1 for build · **Date:** 2026-09-26 · **Follows:** `spec/00-design-direction.md` (Sutradhar) and `spec/01-foundations.md`.
**Token rule:** every value below is a token from `spec/tokens/tokens.css` (or `calc()` of tokens). No hex, no ad-hoc px. Component tokens this spec needed are registered in 01-foundations §18 and emitted by `tokens.json` 1.1.0 (§21); build with the names.
**Evidence:** finding ids (F-UX-…, F-A11Y-…) refer to `audit/consolidated/`.

| Deliverable | Path |
|---|---|
| This spec (assembled from `.part1`–`.part8`) | `spec/02-components-overlay-feedback.md` |
| Gallery (every component and state, light and dark side by side, plus 320 px phone frames and live demos) | `spec/components/overlay.html` |
| Renders | `spec/components/overlay-light.png`, `overlay-dark.png`, `overlay-mobile.png` |

**Components in this group:** Dialog · ConfirmDialog (with typed confirmation) · Sheet · Popover · Tooltip · Menu and ContextMenu · CommandPalette · Toast · Notice (incl. WalletNotice and ConnectionBar) · StatusText and InlineError · Spinner · Skeleton · Progress (RouteProgress, ProgressBar, StageProgress) · EmptyState · error states (PageError, NotFound, Forbidden, SectionError, SessionExpired) · success states · SaveState, VersionChip and UnsavedChangesBar · `announce()`.

**Referenced, specified elsewhere:** Button, IconButton, Field, Tag, Kbd (keycap), Tabs, Gate content (`spec/02-components-gate.md`: Call gate, Publish gate, setup track, money and form gates, GateChecklist), Baseline, AppShell. This group supplies the **containers and feedback** those components sit in.

---

## 0. Five rules for this group

1. **Report only what is proven (P1).** No "Up to date" that cannot fail, no "Context Saved" before the server answers, no "You're live" before checks pass (F-FLOW-003, F-QA-002, F-QA-020, F-UX-006). A loading value is a skeleton, never `0` (F-UX-030).
2. **Use the lightest container that works.** Undo beats a dialog; a sheet beats a modal for records; a notice where it blocks beats a global banner (direction anti-patterns 17, 18; F-UX-028).
3. **One focus contract.** Every overlay moves focus in, traps it if modal, closes on Esc and returns focus to its trigger. Focus never lands on `<body>` (F-A11Y-005, F-A11Y-015, F-A11Y-027).
4. **Portal everything that floats.** Nothing is clipped by a card, the canvas or the rail (F-VIS-014, F-VIS-015, F-A11Y-027). Named z-layers only; `z-index: 9999` is banned (F-VIS-016, F-QA-038).
5. **Quiet by default.** Static skeletons, motion ≤ 200 ms, polite announcements of state changes only (F-A11Y-014, F-A11Y-022).

---

## 1. Shared overlay contract

### 1.1 Choosing a container

| The user needs to… | Use | Not |
|---|---|---|
| Edit or read a record while keeping the list in view (lead, call, knowledge file, flow step) | **Sheet** (record 440, detail 560) or the Flow **inspector** | A centred modal (F-UX-010, F-UX-032) |
| Create something small (≤ 6 fields): New lead, New webhook, Rename flow | **Dialog** md | A full page, or a sheet |
| Confirm a consequential action | **Undo toast** if reversible, else **ConfirmDialog** (§3) | `window.confirm()`, or no guard (F-FLOW-001) |
| Place a billable call, spend money or go live | **Gate**: Call gate popover, Publish gate sheet, money and form gate sheets (content in `02-components-gate.md`) | A ConfirmDialog, or nothing (F-UX-013) |
| Pick one action from several | **Menu** | A row of equal buttons (F-UX-035) |
| Set a filter, date range or "Go to step" anchored to a control | **Popover** | A dialog |
| Learn what an icon button does, or read a truncated value | **Tooltip** | `title` only (F-A11Y-024, F-VIS-013) |
| Jump anywhere or run a command | **CommandPalette** (⌘K / Ctrl+K) | A permanent shortcut strip |
| Learn the outcome of an action whose effect is off-screen | **Toast** | A notice that never goes away |
| Know about a condition that affects this page or section | **Notice** (inline, section or page) | A global banner (F-UX-028) |
| Know the network is gone | **ConnectionBar** (the only app-wide bar) | Silent failure (F-QA-007) |

### 1.2 Surfaces, layers and sizes

| Container | Fill | Edge | Shadow | Radius | z | Width |
|---|---|---|---|---|---|---|
| Dialog, ConfirmDialog, CommandPalette | `--surface-overlay` | 1 px `--border-overlay` | `--e3` | `--radius-12` | `--z-modal` over `--scrim` at `--z-scrim` | `--size-dialog-sm` 400 · `-md` 560 · `-lg` 720 |
| Sheet (modal, or overlaying content) | `--surface-overlay` | 1 px `--border-overlay` on the inner edge | `--e3` | `--radius-12` on the inner corners only; 0 when full-height at a viewport edge | `--z-modal` (modal) · `--z-overlay` (non-modal overlay) | `--size-sheet-record` 440 · `-detail` 560 · `-gate` 640 |
| Sheet (docked ≥ 1440) and Flow inspector | `--surface` | 1 px `--border` | `--e0` | 0 | `--z-base` (part of layout) | 440 / 560 · inspector `--size-inspector` 320 → `--size-inspector-max` 480 |
| Popover | `--surface-raised` (`--surface-overlay` for the `gate` variant) | 1 px `--border-overlay` | `--e2` (**`--e3`** for the `gate` variant: every gate container shares one elevation, G §1.2) | `--radius-8` (`--radius-12` for the `gate` variant) | `--z-popover` | content; `--size-menu-min` 180 to `--size-popover-gate` 400 |
| Menu, ContextMenu | `--surface-raised` | 1 px `--border-overlay` | `--e2` | `--radius-6`; items `--radius-2` (concentric) | `--z-popover` | `--size-menu-min` 180 to `--size-menu-max` 320 |
| Tooltip | `--surface-inverse`, `data-surface="inverse"` | none | `--e0` | `--radius-6` | `--z-tooltip` | `max-content`, capped at `--size-tooltip-max` 280 |
| Toast | `--surface-inverse`, `data-surface="inverse"` | none | `--e3` | `--radius-8` | `--z-toast` | `--size-toast` 400 |

Dark theme: the fill stays `--surface`/`--surface-raised`/`--surface-overlay` (graphite-900) and the `--border-overlay` ring plus the deep ring-free shadow separates the overlay. The scrim is flat `--scrim`: **no blur, no glass** (the current New lead modal blurs the page; F-VIS-022).

**Inner spacing** (all containers): header and body padding `--space-panel-pad-lg` (20) in dialogs, gates and detail sheets; `--space-panel-pad` (16) in record sheets, the inspector and popovers. Gap between fields `--space-field-gap`; between groups `--space-group-gap`. Footers: padding `--space-12` `--space-20`, fill `--surface-2`, 1 px `--border` top edge, actions right-aligned with `--space-inline-md` between them. Overlays always render at Standard density (`data-density="standard"`); the touch media query still lifts controls to 44 px.

### 1.3 Focus contract

| Moment | Rule |
|---|---|
| Open | Move focus in. Target, in order: the element marked `data-autofocus` (the first field of a create form; the typed-confirm input), else Cancel in a destructive ConfirmDialog, else the title (`tabindex="-1"`) for read-mostly content (sheets, long dialogs). Never the close button by default. |
| While open (modal) | Trap Tab and Shift+Tab. Everything outside is `inert` (Radix sets `aria-hidden` and pointer-events; add `inert` on `#app-root` for older assistive tech). Scroll is locked on `<body>`; `scrollbar-gutter: stable` (base.css) prevents the width jump. Internal scrollers set `overscroll-behavior: contain`. |
| While open (non-modal) | No trap. Esc closes. **F6** cycles focus between the page region and the open sheet or inspector. |
| Close | Return focus to the trigger. If the trigger no longer exists (the row was deleted, the step removed), focus the `returnFocusTo` fallback: the next row, the list heading or the page H1. **Never `<body>`.** |
| Sticky chrome | Focused elements inside a sheet never sit under its sticky header or footer: scroll containers set `scroll-padding-top` and `-bottom` to the header and footer heights. |

### 1.4 Dismissal contract

| Input | Modal dialog / sheet | Non-modal sheet | Popover, Menu | Tooltip |
|---|---|---|---|---|
| Esc | Closes (guarded if dirty) | Closes | Closes, focus to trigger | Hides, focus stays |
| Outside click | Closes unless dirty (then the inline discard state, §2.5) | Does not close (the page stays interactive) | Closes | n/a |
| Browser Back | Closes the overlay if it pushed a URL (`?lead=`, `?call=`, `?confirm` is never in the URL) | Closes | n/a | n/a |
| Close button | Always present on dialogs and sheets: IconButton 32 (`--control-h`), `aria-label="Close"` or "Close call details", hit area ≥ `--size-hit-min` (≥ `--size-hit-touch` on touch) | Same | n/a | n/a |

### 1.5 Motion

Only `transform` and `opacity` animate, listed explicitly (never `transition: all`). Enter uses the listed duration; every exit is `--dur-fast`. One easing: `--ease-standard`.

| Container | Enter | Reduced motion |
|---|---|---|
| Scrim | opacity 0 → 1, `--dur-slow` | same (fade is state) |
| Dialog, palette | opacity + `translateY(var(--shift-dialog))` → 0, `--dur-slow` | fade only (`--shift-dialog` is 0) |
| Sheet | `translateX(100%)` → 0 from its edge (bottom sheets `translateY(100%)`), `--dur-slow` | fade only: the component swaps the slide for opacity under `prefers-reduced-motion` |
| Popover, Menu | opacity + `translateY(var(--shift-popover))` away from the anchor side, `--dur-base` | fade only |
| Tooltip | opacity, `--dur-base` after `--timing-tooltip-delay` | same |
| Toast | opacity + `translateY(var(--shift-toast))`, `--dur-slow` | fade only |

### 1.6 Portals and stacking

- Every floating element renders in a portal on `<body>` (Radix `Portal`). Menus, selects and popovers opened inside a dialog or gate sit above it (`--z-popover` 60 > `--z-modal` 50), which is why "Go to [step]" works inside the Publish gate.
- **One modal at a time.** A dialog never opens another dialog. Discard confirmation is an inline state of the same dialog (§2.5); multi-step work replaces the dialog's body.
- **Toasts during a modal.** A modal hides the rest of the page from assistive tech, including the toast region. So feedback about the modal's own action appears inside the modal, and background toasts queue until it closes (errors are also shown inline).

### 1.7 Responsive mapping

| Container | ≥ 1440 desktop | 1280–1439 laptop | 1024–1279 laptop | 768–1023 tablet | 320–767 phone |
|---|---|---|---|---|---|
| Dialog sm | Centred, top `--space-64` | same | same | Centred, top `--space-40` | **Bottom sheet**, full width, top corners `--radius-12` |
| Dialog md / lg | Centred | same | same | Centred, width `min(size, 100% − 2 × --page-margin)` | **Full screen**, sticky header and footer |
| Record / detail sheet | **Docked** beside content | Overlay, non-modal, right | Overlay, non-modal, right | Modal, full height, width `min(--size-sheet-detail, 100%)` | Modal, full screen, above the bottom bar |
| Gate sheet (Publish, money and form gates; G §1.3) | Modal, right, 640 | same | same | Modal, full height | Full screen |
| Gate popover (Call gate, Add agent; G §1.3) | Anchored, 400 | same | same | Anchored if the whole gate fits, else bottom sheet | **Bottom sheet**, primary sticky above the safe area |
| Inspector (flow) | Docked 320–480 | Docked | Overlays the canvas from the right, pans the selection into view | Read-only sheet (Review mode) | Read-only full screen |
| Popover | Anchored | same | same | Anchored if it fits, else bottom sheet | **Bottom sheet** |
| Menu | Anchored | same | same | Anchored | Anchored if ≤ 5 items and no danger item; else **action sheet** |
| Tooltip | Hover and focus | same | same | Focus only on touch; never the only source | Not shown on touch; content must exist elsewhere |
| Palette | Centred, md | same | same | Centred | Full screen |
| Toast | Bottom right above the Baseline | same | same | Bottom right | Bottom, full width, above the bottom bar |

Phone overlays pad their last row with `env(safe-area-inset-bottom)` and sit above the bottom bar (`--z-modal` > `--z-chrome`), which fixes the lead drawer hiding under the tab bar (F-A11Y-005).

### 1.8 Announcements

One polite live region lives in the AppShell, fed by `announce(message, { politeness, dedupeKey })`. It throttles by `--timing-announce-throttle` per `dedupeKey` and drops repeats. Assertive is reserved for failures the user caused and must act on (a save that failed, a call that was rejected). Timers, wallet decrements, cost-so-far and routine saves are never announced (direction §8).

### 1.9 Stack and primitives

Detected stack: Next.js, Tailwind v4 `@theme`, `lucide-react`, **no primitive library** (`audit/raw/design-system.md` §2). Adopt **Radix primitives** (as shadcn/ui source-copied components, restyled to our tokens through the bridge in `01-foundations` §15.4, with shadcn's `--accent` clash scoped away):

| Component | Primitive | Why this one |
|---|---|---|
| Dialog, ConfirmDialog, Sheet | `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog` | Focus trap, `aria-modal`, return focus, portal. The app's Flow Settings dialog already behaves this way (strength, 00-summary §4). |
| Popover | `@radix-ui/react-popover` | Collision flip and shift, `modal` switch for the Call gate |
| Tooltip | `@radix-ui/react-tooltip` | Delay groups, Esc, hoverable content (WCAG 1.4.13) |
| Menu, ContextMenu | `@radix-ui/react-dropdown-menu`, `@radix-ui/react-context-menu` | Roving focus, typeahead, submenus (F-A11Y-011) |
| CommandPalette | `cmdk` inside Radix Dialog | Combobox semantics, filtering, groups |
| Toast | `@radix-ui/react-toast` (not Sonner) | Per-toast politeness (`type="foreground"` = assertive for errors), F8 hotkey, swipe, pause on hover and focus |

Files: `components/ui/overlay/{dialog,confirm-dialog,sheet,popover,tooltip,menu,command-palette}.tsx` and `components/ui/feedback/{toast,notice,wallet-notice,connection-bar,status-text,inline-error,spinner,skeleton,progress,empty-state,error-state,save-state,live-region}.tsx`. Tailwind classes use the foundations vocabulary: `bg-surface shadow-e3 rounded-dialog border-line-overlay z-(--z-modal) duration-(--dur-slow) ease-standard`.

---

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

---

## 4. Sheet (drawers and side sheets)

**Purpose.** Show or edit one record beside the list it came from, or host a long decision (Publish gate) without leaving the page.
**Use for:** the lead sheet, the call detail sheet, knowledge file details, webhook details, the Flow inspector, the Publish gate, the Top-up sheet, the conflict sheet (409). **Don't use** for short creation (Dialog) or navigation (the nav sheet and the phone More sheet belong to the AppShell spec).

### 4.1 Variants

| Variant | Width | Modality | Content |
|---|---|---|---|
| `record` | `--size-sheet-record` 440 | Non-modal ≥ 1024, modal below | Lead (Overview · Calls · Notes), knowledge file, webhook, personal-agent task |
| `detail` | `--size-sheet-detail` 560 | Non-modal ≥ 1024, modal below | Call detail (Summary · Transcript · Data), meeting outputs |
| `gate` | `--size-sheet-gate` 640 | Always modal, with scrim | Publish gate, money gates (Top up, Plan change, Autopay), form gates (Start a meeting, New task), conflict review. Content, elevation (`--e3`) and breakpoints: `02-components-gate.md` §1 |
| `inspector` | `--size-inspector` 320, resizable to `--size-inspector-max` 480 | Docked region; overlay at 1024–1279 | Flow step configuration: Configure · Test data · Issues |

### 4.2 Anatomy

1. **Header** (sticky, min-height `--size-header` 56, padding `--space-panel-pad` (record, inspector) or `--space-panel-pad-lg` (detail, gate), bottom hairline `--border`):
   - title `--type-title-16`, one line, truncated with a Tooltip carrying the full value (F-VIS-013);
   - meta line `--type-meta-12` `--text-3` ("Lead · added 21 Sep 2026", "Today 10:42 am · 2:14 · Flow v7"); `2 legs` disclosed on calls where it applies (F-QA-006);
   - actions (IconButtons 32, `--space-inline-xs` apart): **Previous / Next record** (`chevron-up` / `chevron-down`, labelled "Previous lead" / "Next lead", keycaps J and K in their tooltips), **Copy link**, **Open full page** (optional), **⋯** overflow (danger items last, §3.5), **Close** (always last, far right).
2. **Tabs** (optional, `--size-view-tabs` 40, Tabs spec; selected tab in the URL: `?lead=123&tab=calls`).
3. **Body**: the **only** scroll container (no nested scrollers; the transcript no longer scrolls inside a 384 px box, F-UX-010). Padding as the header. `overscroll-behavior: contain`.
4. **Footer** (optional, sticky): the record's everyday actions ("Call…", "WhatsApp…"), padding `--space-12` `--space-16`, `--surface` fill, top hairline. **Never** a destructive action (F-UX-032).
5. **Resize handle** (inspector only): a 1 px `--border` line with a `--size-hit-min` hit strip, `role="separator"` `aria-orientation="vertical"` `aria-valuemin=320 aria-valuemax=480 aria-valuenow`, arrow keys move it by `--space-16`, Home / End jump to the limits. Width is remembered per user.

### 4.3 States

| State | Treatment |
|---|---|
| Loading | Header renders with the title if known (from the row), else a title skeleton; body shows the **sheet skeleton** (§13). Tabs are real. |
| Loaded | As anatomy. |
| Section failed | A SectionError inside the affected tab (§16); the rest of the sheet works. |
| Record gone | Body: EmptyState compact "This lead was deleted, or you no longer have access." + Close. Never a blank panel. |
| Not in current results | When filters change and the open record drops out, the sheet stays open with a neutral Notice "Not in the current results. Clear filters" (the record still exists; closing it silently is disorienting) (F-UX-010). |
| Dirty (notes, inspector fields) | Inspector fields autosave to the flow draft (SaveState §18). Sheet forms that need an explicit Save show the UnsavedChangesBar inside the sheet footer, and closing uses the inline discard pattern (§2.5) in the footer. |
| Deleted step (inspector) | The inspector closes, the header's "Editing …" state clears, and the Undo toast appears (F-FLOW-025). |

### 4.4 Behaviour and keyboard

- **Opening:** Enter or click on a row's primary cell (a real `<button>` or link in the row, F-A11Y-010, F-A11Y-002), `Enter` on a focused flow step (inspector). The URL gains `?lead=` / `?call=` so reload, Back and shared links work (F-UX-031, F-QA-016).
- **Focus on open:** non-modal sheets move focus to the sheet title (`tabindex="-1"`); modal sheets follow §1.3. The inspector does **not** steal focus from the canvas when opened by selection; `Enter` on the step moves focus into it.
- **Record switching:** with focus in the table, J / K move the row and the sheet follows; inside the sheet, the header's Previous / Next do the same. The polite region announces "Lead 4 of 24" (debounced).
- **F6** moves focus between the page and the sheet. **Esc** closes and returns focus to the originating row's button (or its neighbour if it was deleted).
- Opening a record while another sheet is dirty asks first (inline discard state in that sheet's footer).

### 4.5 ARIA

- Modal: `role="dialog"` `aria-modal="true"` `aria-labelledby`.
- Non-modal record or detail sheet: `role="dialog"` without `aria-modal`, `aria-labelledby` (F-A11Y-010 recommendation).
- Inspector: `<aside aria-labelledby="inspector-title">` (a permanent layout region, not a dialog).
- The transcript inside uses `role="log"` (TurnRow spec). The recording scrubber is `role="slider"` (Call reports spec).

### 4.6 Responsive

See §1.7. Specifics:
- **≥ 1440 docked:** the sheet takes a grid column beside the table; the table keeps at least 8 visible columns because Call reports anchors ≤ 9 columns (direction §6.4).
- **1024–1439 overlay:** anchored to the right edge under the page header, full remaining height, `--e3`, no scrim; the table behind stays interactive.
- **768–1023:** modal with scrim, 100% height, width `min(var(--size-sheet-detail), 100%)` (F-VIS-033 no longer pushes content).
- **< 768:** full screen, header 56 with Back arrow ("Back to Call reports") replacing Close, sticky footer above the safe area; the phone bottom bar is hidden while it is open (F-RWD-004, F-A11Y-005 phone overlap).
- **Flow inspector at 1024–1279** overlays the canvas from the right and pans the selected step into the visible area (F-FLOW-022); below 1024 it is read-only (Review mode).

### 4.7 Motion

Slide from the edge (`translateX(100%)` → 0) over `--dur-slow`; exit `--dur-fast`; fade only under reduced motion. Docked sheets appear without a slide (the layout changes in one frame) so the table does not animate its width.

### 4.8 Copy

Title = the record's name as the user knows it ("Lead 1042 · Pune" in the gallery; real names in product) or the call's lead + time. Meta uses the date grammar (`Today 10:42 am`). Close is "Close lead" / "Close call details" for screen readers.

### 4.9 Do / don't

| Do | Don't |
|---|---|
| One scroll container; transcript as its own tab | 2,504 px of content in a 601 px scroller with a nested 384 px transcript (F-UX-010) |
| Full height with its own sticky header | Sticky at `top: 42px` with its bottom 42 px cut off (F-UX-032) |
| "Delete lead…" in ⋯ | DELETE LEAD under Call Now |
| Inspector "Done" closes and returns to the step | A red full-width "Delete Node" slab as the last tab stop (F-FLOW-019) |

### 4.10 React

```tsx
interface SheetProps {
  open: boolean; onOpenChange(open: boolean): void;
  variant: 'record' | 'detail' | 'gate' | 'inspector';
  title: string; meta?: React.ReactNode;
  mode?: 'auto' | 'docked' | 'overlay' | 'modal';   // 'auto' resolves from breakpoint + variant
  nav?: { onPrev?(): void; onNext?(): void; label: string };  // "lead"
  actions?: React.ReactNode;                        // Copy link, ⋯ menu
  tabs?: { value: string; label: string }[]; tab?: string; onTabChange?(v: string): void;
  footer?: React.ReactNode;
  status?: 'loading' | 'ready' | 'missing' | 'error';
  returnFocusTo?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}
```

Modal and overlay modes use `@radix-ui/react-dialog` (`modal={mode === 'modal'}`); docked mode renders the same header, body and footer parts without the Dialog root, inside the page grid. URL sync is a hook (`useRecordParam('lead')`), not part of the component.

**Resolves:** F-UX-010, F-UX-032, F-A11Y-002, F-A11Y-010, F-A11Y-005 (phone overlap), F-RWD-004, F-FLOW-022, F-FLOW-025, F-VIS-033, F-UX-031 (with the page specs).

---

## 5. Popover

**Purpose.** A small, anchored, non-modal panel for a task tied to one control: the Filter builder, a date range, "Go to [step]", Columns, an info explainer with a link, and the **Call gate** (the one modal popover).
**Don't use** for plain labels (Tooltip), for lists of actions (Menu), or for more than about 8 controls (Dialog or Sheet).

### 5.1 Anatomy and sizes

- **Trigger**: a Button or IconButton with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
- **Content**: §1.2 popover surface; padding `--space-panel-pad`; width from content between `--size-menu-min` and `--size-popover-gate`; `max-height` = available space minus `--space-8`, internal scroll.
- **Header** (optional): `--type-title-14` + close IconButton 28 (`--control-h-sm`) for popovers with forms.
- **Footer** (optional): like the dialog footer (`--surface-2`, top hairline), e.g. "Clear · Apply" in the Filter builder.
- **Placement**: default `bottom-start`, offset `--space-4`, collision padding `--space-8`, flips and shifts, never covers its trigger. No arrow (machined, not speech-bubble).

| Variant | Width | Notes |
|---|---|---|
| `default` | content, 180–400 | Filter builder, Columns, date range |
| `info` | `--size-tooltip-max` 280 | Explains a metric in 1–3 sentences with an optional "Learn more" link; opened by an `info` IconButton (not hover) so it can hold a link |
| `combobox` | the trigger's width, at least `--size-menu-min`, at most `--size-menu-max` | "Go to [step ▾]" and "Connect to…" searchable listboxes (Select/Combobox spec defines the list) |
| `gate` | `--size-popover-gate` 400, `--radius-12`, `--e3`, `--surface-overlay` | Call gate, Add agent gate; `modal` (focus trapped, no scrim); content, states and breakpoints in `02-components-gate.md` |

### 5.2 States

Closed · open · loading (a Spinner row "Loading flows…" after `--timing-skeleton-delay`) · empty (compact EmptyState line) · error (InlineError with Retry) · applying (footer primary with Spinner).

### 5.3 Behaviour, keyboard, ARIA

- Click, Enter or Space toggles. Focus moves to the first interactive element (or the content, `tabindex="-1"`, for info popovers).
- Esc closes and returns focus to the trigger. Outside click closes. Tab past the last element closes and continues (non-modal); the gate variant traps.
- Content `role="dialog"` with `aria-labelledby` (header) or `aria-label`.
- A popover never opens a second popover; nested choices use a Menu submenu or a Select inside.

### 5.4 Responsive

≥ 768: anchored (the `gate` variant at 768–1023 only when the whole gate fits above or below its anchor, else a bottom sheet; G §1.3). Below 768: a **bottom sheet** (full width, top corners `--radius-12`, `--e3`, scrim, 44 px rows) with the header's title and a Done button; the Call gate becomes a full-width bottom sheet with its start button sticky above the safe area.

### 5.5 Motion

Fade + `--shift-popover` from the anchor side over `--dur-base`; exit `--dur-fast`.

### 5.6 Do / don't

| Do | Don't |
|---|---|
| Filter builder in a popover that adds 6 px filter tokens | Rows of pill chips that overflow at 1024 (F-RWD-012) |
| Info IconButton opening an info popover with a link | A hover tooltip holding a link it cannot reach |

### 5.7 React

```tsx
interface PopoverProps {
  trigger: React.ReactElement; open?: boolean; onOpenChange?(o: boolean): void;
  variant?: 'default' | 'info' | 'combobox' | 'gate';
  title?: string; footer?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left'; align?: 'start' | 'center' | 'end';
  modal?: boolean;              // forced true for 'gate'
  children: React.ReactNode;
}
```

`@radix-ui/react-popover` with `sideOffset` = 4 (`--space-4`) and `collisionPadding` = 8 (`--space-8`); the numbers are read from the token file at build time (`tokens.json`), not typed by hand.

**Resolves:** F-RWD-012 (filters), F-UX-013 (container for the Call gate), F-A11Y-016 (expansion state via `aria-expanded`).

---

## 6. Tooltip

**Purpose.** Name an icon-only control, show its shortcut, reveal a truncated value, or add one short hint. It is supplementary: the accessible name lives on the control (`aria-label`), and nothing essential is only in a tooltip, because touch users never see it.

### 6.1 Anatomy and values

| Part | Value |
|---|---|
| Surface | `--surface-inverse` with `data-surface="inverse"` (text tokens remap: `--text` → `--text-inverse`) |
| Text | `--type-meta-12`, `--text` (inverse), sentence case, no trailing full stop for single phrases |
| Keycap | Kbd at `--size-keycap` 20, `--type-mono-12` 500, `--radius-4`, 1 px `--text-3` (inverse) edge, `--space-inline-sm` after the label: "Next lead J" |
| Padding | `--space-4` `--space-8` (one line = 24 px) |
| Width | `width: max-content; max-width: var(--size-tooltip-max)` (280). Wraps only past 280, so the one-word-per-line tooltip is impossible (F-VIS-014) |
| Radius / shadow | `--radius-6` / none |
| Offset | `--space-4` from the trigger; collision padding `--space-8` |
| Layer | `--z-tooltip` in a portal: never clipped by a card or the rail (F-VIS-014, F-VIS-015, F-UX-007) |

### 6.2 Variants

- **label**: the icon button's name, identical to its `aria-label`, plus an optional keycap. Rail items at 1024–1279 show their label to the **right** (`side="right"`).
- **hint**: a short description of an enabled control ("Tidy arranges steps left to right. One undo step.").
- **overflow**: the full text of a truncated value. Rendered only when the element is actually truncated (`scrollWidth > clientWidth`), and only on focusable elements.
- **reason**: why a control is disabled. The control uses `aria-disabled="true"` (focusable) and `aria-describedby` to the reason; the tooltip shows the same sentence on hover and focus. On touch the reason is also shown as helper text, never tooltip-only.

### 6.3 Behaviour and keyboard

- Opens after `--timing-tooltip-delay` (300 ms) on hover, **immediately on keyboard focus**; moving between adjacent triggers within 300 ms skips the delay (Radix `skipDelayDuration`).
- Stays open while the pointer moves onto it (hoverable), closes on Esc without moving focus (dismissible), and stays until the pointer or focus leaves (persistent): WCAG 1.4.13.
- Never contains links, buttons or form controls (use an info Popover).
- Hidden while any menu or popover of the same trigger is open.

### 6.4 ARIA

- `role="tooltip"`. For **label** tooltips whose text equals the `aria-label`, do not also set `aria-describedby` (avoids a double announcement); the wrapper takes `labelOnly`. Hint, overflow and reason tooltips are referenced by `aria-describedby`.
- `title` attributes are removed wherever a Tooltip exists (F-A11Y-017, F-A11Y-024).

### 6.5 Responsive

Pointer devices: hover and focus. Touch (`pointer: coarse`): tooltips do not open on tap (a tap activates the control); icon-only controls on touch have visible labels where space allows (bottom bar, More sheet), and truncated values wrap to two lines on phones instead of truncating.

### 6.6 Motion

Opacity only, `--dur-base` in, `--dur-fast` out. No shift.

### 6.7 Do / don't

| Do | Don't |
|---|---|
| "Undo" + ⌘ Z keycap in a tooltip | "Undo ⌘Z" printed in the button label (anti-pattern 16) |
| Full intent name on a truncated Analytics label | "Real Estate In…" with no way to read it (F-VIS-013) |
| Rail label to the right, portaled | A clipped hover label inside the rail's overflow (F-VIS-015) |

### 6.8 React

```tsx
interface TooltipProps {
  content: React.ReactNode;       // plain text; no interactive children
  kbd?: string[];                 // ['mod', 'Z'] → platform-aware keycaps
  kind?: 'label' | 'hint' | 'overflow' | 'reason';
  side?: 'top' | 'right' | 'bottom' | 'left';   // default 'top'; rail uses 'right'
  children: React.ReactElement;   // the trigger; must be focusable
}
<TooltipProvider delayDuration={300} skipDelayDuration={300}>  {/* values from tokens.json */}
```

`OverflowTooltip` wraps a text node, measures truncation with a `ResizeObserver`, and renders the Tooltip only when needed. `DisabledReason` pairs `aria-disabled`, `aria-describedby` and the reason tooltip in one component so a disabled control can never ship without its reason.

**Resolves:** F-VIS-014, F-VIS-015, F-VIS-013, F-UX-007, F-A11Y-017, F-A11Y-024, anti-pattern 16 (keycaps in labels).

---

## 7. Menu and ContextMenu

**Purpose.** A list of actions or options opened from a trigger (⋯ overflow, "Draft · 3 changes ▾", the account menu, sort, density, Columns) or from a right-click / context key on a row or flow step.
**Use when** there are 3 or more actions, or when actions are rare, secondary or destructive. **Don't use** for navigation between pages (sidebar), for choosing a value in a form (Select), or for one or two actions (show them as buttons).

### 7.1 Anatomy and values

| Part | Value |
|---|---|
| Content | §1.2 menu surface; padding `--space-4`; min `--size-menu-min` 180, max `--size-menu-max` 320; `max-height` = available − `--space-8`, internal scroll |
| Item | height `--control-h` (32; 44 on touch); padding `0 var(--space-8)`; gap `--space-inline-md`; radius `--radius-2`; label `--type-data-13` `--text`; leading icon `--icon-md` in `--text-2` (all items in a menu have an icon, or none do) |
| Item description | optional second line `--type-meta-12` `--text-3` (the item grows to fit): "Callers keep hearing v7" |
| Trailing slot | Kbd keycap (`--size-keycap`), a `chevron-right` for submenus, or a value ("Standard") in `--text-3` |
| Check column | `check` `--icon-md` in `--accent-text` for checkbox and radio items; the column is reserved in the whole menu when any item is checkable |
| Group label | `--type-label-12` `--text-3`, sentence case, padding `--space-6 var(--space-8) var(--space-2)` |
| Separator | 1 px `--border`, margin `--space-4` 0 |
| Danger item | label and icon `--danger-text`; highlight `--danger-soft`; always the last group after a separator; "…" when a dialog follows |
| Disabled item | label `--text-dis`, and a description line with the reason in `--text-3` ("Admins only", "Publish v8 first") |

### 7.2 Types

- **Action menu** (⋯): Flow header: Duplicate · Export JSON · Import JSON… · Share… | Discard draft changes… | Delete flow…. Lead sheet: Copy link · Add to batch… | Delete lead….
- **Selection menu** (radio items): sort, density (Standard / Compact), theme (System / Light / Dark).
- **Checkbox menu**: Columns, Show test calls.
- **Submenu**: "Set status ▸" in the bulk bar and row menu; opens on → / hover after `--timing-tooltip-delay`.
- **ContextMenu**: right-click, Shift+F10 or the context key on a focused table row or flow step. It mirrors that element's visible ⋯ menu exactly: every context action also has a visible address (P5).
- **Account menu** (AppShell spec owns placement): profile, theme, shortcuts on/off, `Sign out…` last after a separator.

### 7.3 States

| State | Treatment |
|---|---|
| Item default | transparent |
| Highlighted (pointer or keyboard) | `--surface-2` fill (danger: `--danger-soft`) |
| Keyboard focus | the highlight **plus** a 2 px `--focus` outline at `--focus-offset-inset`, so focus stays an outline (base.css rule) |
| Pressed | `--surface-3` for `--dur-fast` |
| Checked | check icon in the check column; `aria-checked="true"` |
| Disabled | as §7.1; focusable, `aria-disabled="true"`, selecting does nothing; the reason is read with it |
| Loading (async items) | one row with Spinner sm + "Loading versions…" after `--timing-skeleton-delay` |

### 7.4 Keyboard

| Key | Action |
|---|---|
| Enter, Space, ↓ on trigger | Open, focus the first enabled item |
| ↑ on trigger | Open, focus the last item |
| ↑ ↓ | Move (wraps); Home / End first / last |
| Type a letter | Typeahead to the next matching item |
| → / ← | Open / close a submenu |
| Enter, Space | Activate (checkbox and radio items stay open) |
| Esc | Close, focus returns to the trigger (the Flow ⋯ menu left focus in place and needed about 47 Tab presses, F-A11Y-011) |
| Tab | Close and move on |
| Shift+F10, context key | Open the ContextMenu on the focused row or step |

### 7.5 ARIA

Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. Content `role="menu"` labelled by the trigger. Items `menuitem`, `menuitemcheckbox`, `menuitemradio` with `aria-checked`; groups `role="group"` with `aria-labelledby`; separators `role="separator"`. Keycaps are `aria-hidden` and the shortcut is exposed with `aria-keyshortcuts`.

### 7.6 Responsive

≥ 768: anchored (`bottom-end` for ⋯). Below 768: anchored if ≤ 5 items and no danger item; otherwise an **action sheet**: bottom sheet, 44 px rows, group labels kept, danger group last, a Cancel row at the bottom above the safe area. Submenus become a pushed second list with a Back row. ContextMenu does not exist on touch (long-press is not used); the visible ⋯ covers it.

### 7.7 Motion

Fade + `--shift-popover` over `--dur-base`; submenus fade only; exit `--dur-fast`.

### 7.8 Copy

Items are verbs or verb phrases in sentence case ("Export JSON", "Discard draft changes…"). No "Reset to default" (it did not say what it resets, F-FLOW-019). Keycaps only in menus, tooltips, the palette and the `?` sheet.

### 7.9 Do / don't

| Do | Don't |
|---|---|
| Danger group last, separated, red text | "Reset to default" styled like Export JSON, one row below New flow (F-FLOW-019, F-UX-035) |
| Disabled item with "Admins only" | A hidden entry that silently redirects when clicked (F-UX-034) |
| Row ⋯ holding Re-analyse call and Download | 50 repeated Re-analyze and Download CSV buttons (F-UX-046) |

### 7.10 React

```tsx
type MenuEntry =
  | { type: 'item'; label: string; icon?: LucideIcon; kbd?: string[]; description?: string;
      danger?: boolean; disabledReason?: string; onSelect(): void }
  | { type: 'checkbox'; label: string; checked: boolean; onCheckedChange(v: boolean): void }
  | { type: 'radio-group'; label?: string; value: string; options: { value: string; label: string }[]; onValueChange(v: string): void }
  | { type: 'submenu'; label: string; icon?: LucideIcon; entries: MenuEntry[] }
  | { type: 'separator' } | { type: 'label'; label: string };
interface MenuProps { trigger: React.ReactElement; entries: MenuEntry[]; align?: 'start' | 'end'; }
interface ContextMenuProps { entries: MenuEntry[]; children: React.ReactElement; }  // same entries as the ⋯ menu
```

`@radix-ui/react-dropdown-menu` and `-context-menu`. Disabled-with-reason items are **not** Radix `disabled` (that removes them from keyboard reach): they set `aria-disabled`, call `event.preventDefault()` in `onSelect`, and render the reason. The entries array is shared by the ⋯ menu, the ContextMenu and the phone action sheet, so all three always match.

**Resolves:** F-A11Y-011, F-FLOW-019, F-UX-035, F-UX-046, F-UX-034 (disabled with reason), F-A11Y-016 (checked state exposed).

---

## 8. CommandPalette ("Search or jump")

**Purpose.** One keyboard-first place to jump to any destination or record and to start common actions. It is the "Search or jump (⌘K)" entry under the workspace switcher and the Baseline's "Search" (direction §6.1). Today Ctrl+K opens nothing (F-UX-029).
**Scope:** the 12 destinations (from the one nav config), flows, leads, calls, knowledge files, Settings pages, and a short list of actions. It is quiet: no animation flourishes, no "AI" answer box (direction: "⌘K showmanship" stays out).

### 8.1 Anatomy and values

1. **Container**: Dialog `md` (`--size-dialog-md` 560), top `--space-64` (≥ 1024) or `--space-40` (tablet), §1.2 surface. Not vertically centred, so it never jumps as results change.
2. **Input row**: `search` icon `--icon-md` `--text-3`, input `--type-body-16` (no border; the row has a bottom hairline), clear IconButton when not empty, padding `--space-12` `--space-16` (48 px row). Placeholder "Search leads, calls, flows or jump to…".
3. **Results**: a listbox; `max-height: calc(var(--row-h) * 9)` then scroll. Groups in fixed order: **Recent** (empty query only, last 5 opened records) · **Go to** · **Flows** · **Leads** · **Calls** · **Knowledge** · **Settings** · **Actions** · **Help**. Each group shows at most 5 rows plus "Show all 23 leads matching 'site'" which opens that page with `?q=`.
4. **Row**: height `--row-h` (40; 48 touch); padding `0 var(--space-12)`; icon `--icon-md` `--text-2` (the destination's nav icon, or the record type's icon); title `--type-data-13` `--text` with the matched substring at `--fw-semibold` (no colour highlight); meta `--type-meta-12` `--text-3` after the title (masked phone in `--type-mono-12`); trailing hint "Open" / "Jump" in `--text-3`, or a keycap for actions that have a shortcut.
5. **Group label**: `--type-label-12` `--text-3`, padding `--space-8 var(--space-12) var(--space-4)`.
6. **Footer**: `--surface-2`, top hairline, padding `--space-8` `--space-12`, `--type-meta-12` `--text-3`: "↑ ↓ to move · Enter to open · Esc to close" with keycaps. It is the only persistent hint strip in the product, and it lives inside a transient overlay.

**Row meta examples** (formats come from `lib/format.ts`): Flow "Site-visit qualifier · Live v7 · Draft, 3 changes"; Lead "Lead 1042 · +91 •••• 4821 · Interested"; Call "Today 10:42 am · 2:14 · Interested"; Knowledge "price-sheet.pdf · Indexed"; Action "Import leads…".

### 8.2 States

| State | Treatment |
|---|---|
| Empty query | Recent + Go to + 4 suggested actions (New lead, New flow, Import leads…, Top up…) |
| Typing | Destinations and actions filter locally and instantly; records query the server after a 300 ms pause (`--timing-validate-debounce`, the one input debounce; foundations §18) |
| Searching | Local groups stay; a row "Searching records…" with Spinner sm appears after `--timing-skeleton-delay` |
| Active row | `--surface-2` fill plus a 2 px inset `--accent-mark` bar on the left (the selected-row language), `aria-selected="true"` |
| No results | "No matches for 'xyz'." and "Search covers lead names and numbers, call transcripts, flows and files." No illustration |
| Record search failed | Local results remain; a row "Couldn't search records. Retry" (InlineError compact) |
| Offline | Local destinations and actions work; record groups show "Offline. Records can't be searched." |
| Permission | Items the role cannot use are listed disabled with a reason ("Admins only") only when typed for exactly; otherwise hidden |

### 8.3 Actions and safety

- Actions that change nothing risky run at once: switch theme, toggle density, turn single-key shortcuts off, open the `?` sheet.
- Actions that create or cost end in "…" and **open their own UI**: "New lead…" opens the dialog, "Top up…" opens the Top-up sheet, "Call Lead 1042…" opens the **Call gate**, "Publish v8…" opens the **Publish gate**. The palette never dials, bills or publishes by itself (P3).
- Destructive actions are not in the palette.

### 8.4 Keyboard

| Key | Action |
|---|---|
| ⌘K / Ctrl+K | Open from anywhere, including text fields; again closes |
| ↑ ↓ | Move the active row (wraps); Home / End in the list with ⌘ / Ctrl |
| Enter | Open or run the active row, close the palette |
| ⌘/Ctrl+Enter | Open a record in its sheet without leaving the current page (where the page supports it) |
| Esc | Clear the query if there is one, else close; focus returns to the trigger or the previously focused element |
| Tab | Stays inside (trapped); moves to the clear button and back |

`/` stays the page-level search on Leads and Call reports; it does not open the palette.

### 8.5 ARIA

Dialog `aria-label="Search or jump"`. Input `role="combobox"` `aria-expanded="true"` `aria-controls={listboxId}` `aria-activedescendant={activeRowId}` `aria-autocomplete="list"`. Listbox with `role="group"` per section `aria-labelledby` its label; rows `role="option"`. The polite region announces the result count after typing settles ("12 results", "No results"), throttled by `--timing-announce-throttle`.

### 8.6 Responsive

| Width | Behaviour |
|---|---|
| ≥ 1024 | Centred `md`, top `--space-64` |
| 768–1023 | Centred `md`, top `--space-40`; opened from the top bar's search icon |
| < 768 | Full screen: input row at the top with a text "Cancel" button, 48 px rows, footer hints hidden, results above the keyboard (`100dvh`, `interactive-widget=resizes-content`) |

### 8.7 Motion

Scrim fade and the dialog's `--shift-dialog` rise over `--dur-slow`; result changes are instant (no list animation).

### 8.8 Do / don't

| Do | Don't |
|---|---|
| "Call Lead 1042…" opens the Call gate | A palette action that places a call |
| Names from the one nav config ("Call reports", never "Reports" or "CALL REPORTS") | A fourth set of destination names (F-UX-017) |
| Masked phone numbers in rows | Full numbers in results |

### 8.9 React

```tsx
interface PaletteItem {
  id: string; group: 'recent' | 'goto' | 'flows' | 'leads' | 'calls' | 'knowledge' | 'settings' | 'actions' | 'help';
  title: string; meta?: string; icon: LucideIcon; kbd?: string[];
  keywords?: string[];                       // synonyms: "wallet" → Billing, "DID" → Phone setup
  perform(ctx: { openSheet: boolean }): void; // navigation or opening a dialog, gate or sheet
  disabledReason?: string;
}
interface CommandPaletteProps {
  open: boolean; onOpenChange(o: boolean): void;
  staticItems: PaletteItem[];                 // destinations + actions, from the nav config
  searchRecords(q: string, signal: AbortSignal): Promise<PaletteItem[]>;
}
```

`cmdk` (`Command`, `Command.Input`, `Command.List`, `Command.Group`, `Command.Item`) inside the shared Dialog. `shouldFilter={false}` for server groups; local groups filter with cmdk's scorer plus `keywords`. Requests use `AbortController` so stale results never replace newer ones. A global `useHotkey('mod+k')` mounts in the AppShell. Recent items are a per-user convenience (local storage is acceptable).

**Resolves:** F-UX-029 (no palette), F-UX-017 (one name per destination), F-UX-015 (synonyms such as DID → Phone setup), F-RWD-001 (on phones every destination is also searchable).

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

---

## 12. Spinner

**Purpose.** Say "this specific thing is working right now" for waits under about 5 s: a button that submitted, a save chip, a Retry, a row that is refreshing.
**Never** for page or region loads (Skeleton), never full-screen (F-QA-007, F-UX-030), never on its own for more than 1 s without a word, never decorative. Today's Cockpit "STANDBY" ring and dashed idle icons are not spinners and are removed (F-VIS-029, F-FLOW-003).

### 12.1 Values

| Size | Token | Where |
|---|---|---|
| `sm` | `--icon-sm` 14 | Save chip, StatusText sm, palette rows, menus |
| `md` | `--icon-md` 16 | Buttons (replaces the leading icon), toasts, list rows |
| `lg` | `--icon-lg` 20 | A region's inline "Loading…" when a skeleton cannot mirror the layout (rare) |

- Glyph: Lucide `loader-circle` (a 3/4 arc), stroke `--icon-stroke`, `currentColor` (inherits the text colour of its context, so it is `--on-accent` inside a primary button).
- Rotation: linear, one turn per `--dur-spin` (800 ms). A spinner exists only while a user-started request is in flight (foundations §11).
- **The one sanctioned loop besides the live dot and audio meters:** a spinner is bound to a real in-flight request and unmounts the moment it settles, so it is never idle motion. Under reduced motion it is a static arc (base.css caps iterations) and the adjacent word carries the state.
- Delay: inside a clicked button it appears at once (it confirms the click); everywhere else only after `--timing-skeleton-delay`.
- ARIA: the SVG is `aria-hidden`; the text ("Saving…") or `aria-busy="true"` on the region carries meaning. A button that is working keeps its accessible name and adds `aria-busy="true"`.

```tsx
<Spinner size="sm" | "md" | "lg" />   // decorative only; pair it with text
```

**Resolves:** F-QA-007, F-UX-030 (no full-screen spinner), F-A11Y-022 (loops stop under reduced motion), F-FLOW-003 (the dashed idle icon).

---

## 13. Skeleton

**Purpose.** Hold the shape of content that is loading so the page does not jump, and never show `0` or placeholder copy as if it were data (F-UX-030, F-FLOW-037, F-UX-015).

### 13.1 Rules

- **The shell never loads.** Sidebar or rail, page header (H1 and static meta), view tabs, toolbar and Baseline render immediately from the layout. Only data regions skeletonise (F-QA-007).
- **Static fill** `--skeleton` (`--surface-3`), radius `--radius-2` for text bars, the real element's radius for blocks. **No shimmer, no pulse** (anti-pattern 4).
- Appears after `--timing-skeleton-delay` (200 ms); once shown, stays at least `--timing-skeleton-min` (400 ms) so it does not flicker.
- Text bars sit centred in the line box of the text they stand for:

| Stands for | Line box | Bar height |
|---|---|---|
| `meta-12`, `label-12` | 16 | `--space-8` |
| `data-13`, `label-13`, `body-14` | 20 | `--space-10` |
| `title-16`, `body-16` | 24 | `--space-12` |
| `title-20` | 28 | `--space-16` |
| `num-28` | 32 | `--space-20` |

- Bar widths vary deterministically per row (72%, 48%, 64%, 56%, …) so the block reads as text, not stripes.
- **Never fake data:** chart skeletons show empty axes and gridlines, not invented bars or curves; a KPI keeps its label and skeletons only its number (P1).
- ARIA: the region gets `aria-busy="true"` and one visually hidden polite line ("Loading leads…"). Skeleton shapes are `aria-hidden`.

### 13.2 Layouts

| Layout | Shape |
|---|---|
| **Table** (Leads, Call reports, Knowledge, Invoices) | Real sticky header with real column names; rows at `--row-h` filling the viewport; checkbox column a 16 px (`--icon-md`) block at `--radius-4`; key column bar at ~60%; numeric columns right-aligned short bars; tag columns a `--size-tag` tall block at `--radius-4`; pager text "Loading…" (no fake "0 of 0") |
| **List item** (phone Leads and Call reports) | `--row-h` 48 rows: line 1 bar 55% + tag block right; line 2 bar 70% `--space-8` tall |
| **KPI tile** | Real label; number block `--space-20` × 40%; delta hidden |
| **Sheet** | Header title bar + meta bar; real tabs; three field rows (label bar 30% over a value bar 60%) and one paragraph of 3 bars |
| **Transcript** (turn rows) | Mono gutter block `--space-40` wide; speaker bar `--space-10` × 20%; two `read-15` bars; caller turns on `--surface-2` like real turns |
| **Flow canvas** (F-FLOW-037) | Real header with the flow name if known; SaveState and VersionChip hidden; canvas dot grid; four static silhouettes in `--skeleton`: a Trigger capsule, a Logic rectangle with two answer-row bands, an Action rectangle, an Outcome capsule; no edges, no text; editing and autosave stay off until the flow has hydrated (F-FLOW-002) |
| **Form** (Settings) | Label bar `--space-10` × 20% over a `--control-h` block at `--radius-6`, repeated at `--space-field-gap` |
| **Chart** | Axis line and 4 gridlines in `--chart-grid`; no bars |
| **Cockpit Ready card** | Form layout inside the card; the Place call button renders disabled with "Checking readiness…" |

### 13.3 React

```tsx
<Skeleton.Line role="data-13" width="64%" />     // role picks the bar height from the table above
<Skeleton.Block width="var(--icon-md)" height="var(--icon-md)" radius="var(--radius-4)" />
<TableSkeleton columns={columns} rows="fill" />  // columns carry align + kind (text | number | tag | check)
<ListSkeleton />  <KpiSkeleton label="Calls" />  <SheetSkeleton />  <TranscriptSkeleton />
<CanvasSkeleton />  <FormSkeleton fields={5} />  <ChartSkeleton />
const show = useDelayedFlag(isLoading, { delay: 200, minVisible: 400 });   // numbers from tokens.json
```

In the App Router each data region is a Suspense boundary with its skeleton as the fallback; `app/(app)/layout.tsx` keeps the shell mounted across routes.

**Resolves:** F-UX-030, F-QA-007, F-VIS-023, F-FLOW-037, F-UX-036 (loading "0 calls analysed"), F-UX-015 (DID card flash).

---

## 14. Progress

### 14.1 RouteProgress

A 2 px (`--space-2`) bar across the top of the main column, fill `--accent-mark`, no track. It appears only if a client navigation takes longer than `--timing-skeleton-delay`, advances in steps toward 90% (never loops), completes to 100% and fades over `--dur-fast`. `aria-hidden`: the route change itself is announced by updating `<title>` and the polite region ("Leads") (F-A11Y-013). Reduced motion: it appears without advancing and disappears on completion. Fixes the 0.8–1.2 s of silence after a sidebar click (F-UX-030, F-QA-007).

### 14.2 ProgressBar

| Part | Value |
|---|---|
| Label row | label `--type-label-13` `--text` left; value `--type-meta-12` `--text-3` right, tabular ("42% · 3.1 of 7.4 MB") |
| Track | height `--space-4`, `--radius-2`, `--surface-3` |
| Fill | `--accent-mark` (01-foundations §3.2: non-text Neel indicators); animated by `transform: scaleX()` over `--dur-base` |
| Error | fill `--danger`, value text "Failed" in `--danger-text`, then InlineError below |
| Complete | the bar is replaced by success StatusText ("Indexed · 42 passages") |

**Determinate** whenever a measure exists (bytes, rows, stages). **Indeterminate** only when none exists and the wait is expected under about 10 s: a 30% segment travels the track once per `--dur-pulse` while the request is in flight; under reduced motion the segment is static and the label says "Working…". Anything longer uses **StageProgress**.

ARIA: `role="progressbar"`, `aria-label` (or `aria-labelledby` the label), `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow` (omitted when indeterminate), `aria-valuetext` ("42%, 3.1 of 7.4 MB"). Announce start, completion and failure only; intermediate values at most at 25/50/75% and never more often than `--timing-announce-throttle`.

### 14.3 StageProgress

For long jobs with named phases. It reuses the setup-track checklist visuals (`02-components-gate.md` §5.3): a 20 px status mark per stage (done: `check` on `--success-soft`; current: Spinner sm with a 2 px `--accent-mark` ring; to do: 1.5 px `--control` ring; failed: `x` on `--danger-soft`), the stage name in `--type-data-13`, and a meta line. Overall text: "Step 2 of 3". Cancel is always available while running.

| Job | Stages |
|---|---|
| AI draft ("Describe it", up to 90 s; F-FLOW-031) | Reading your description · Drafting steps · Checking the flow. Ends on the diff (Apply to draft · Discard); never replaces the canvas silently |
| Knowledge file (F-UX-033) | Uploading (bytes, determinate) · Reading · Indexing (passages). Ends "Indexed · 42 passages" or "Couldn't index · Retry" |
| Import leads (F-QA-022) | Checking file · Mapping columns (a real step with the preview) · Importing (rows, determinate). Ends "1,212 imported · 28 skipped · Download skipped rows" |
| Data export | Preparing archive · Ready (link expires in 1 h) |

### 14.4 Upload and embed rows (Knowledge)

A list row per file: type icon, **original file name** (not the storage key), size, a StatusText md, a ProgressBar while uploading, and one action: Cancel (while uploading), Retry (failed), or ⋯ (done; Delete lives there). Multiple files show an aggregate line above the list: "3 of 5 uploaded · 2 indexing". Leaving the page keeps uploads running with a progress toast.

```tsx
<ProgressBar label="price-sheet.pdf" value={42} valueText="42% · 3.1 of 7.4 MB" tone="default" | "danger" />
<ProgressBar label="Checking file" indeterminate />
<StageProgress stages={[{ id, label, meta?, state: 'done' | 'current' | 'todo' | 'failed' }]} onCancel={…} />
<RouteProgress />   // once in the AppShell; listens to router events
```

**Resolves:** F-UX-030, F-QA-007, F-A11Y-013, F-UX-033, F-QA-022, F-FLOW-031, F-UX-047 (export states).

---

## 15. Empty states

**Purpose.** Say what will appear here and offer the one next step. Today there are seven styles, from "Awaiting connection…" in 2.4:1 mono to a dashed shield box (F-VIS-023).

### 15.1 Variants

| Variant | When | Content | Action |
|---|---|---|---|
| **First use** | Nothing exists yet | What will appear and why it matters, in one sentence | One primary (Import leads…, New flow) + optional docs link |
| **No results** | A search matched nothing | Echo the query: "No calls match 'site visit'." + what search covers | Clear search |
| **Filtered empty** | Filters exclude everything | The filters in words: "No calls match Negative sentiment in the last 7 days." + "121 calls are hidden by filters." | Clear filters |
| **All done** | A queue is empty because work is finished | "No callbacks due today." | Optional "View upcoming" |
| **Not yet available** | Data exists but is not computed | "Sentiment appears after a call is analysed." / "Recording since 20 Sep 2026. Nothing recorded in this range." (F-UX-042) | none, or the step that unlocks it |
| **Compact** | Inside a sheet tab, popover, inspector, menu or small card | One `--type-data-13` `--text-3` line, left-aligned, no icon | Inline link at most |

Search and filtered copy never uses first-use copy (Call reports said "Calls appear here once your agents start dialing" to an account with 121 calls, F-UX-046).

### 15.2 Anatomy and values (region variants)

- **Icon** (optional): one Lucide glyph at `--icon-lg` 20 in `--text-3`, no tile, no colour. First use: the destination's nav icon; no results: `search-x`; filtered: `filter`; all done: `check`.
- **Title**: `--type-title-16` `--text` (`--type-title-14` in cards under 320 px tall), `text-wrap: balance`.
- **Body**: `--type-body-14` `--text-2`, max `--size-container-narrow` (400), `text-wrap: pretty`.
- **Actions**: one primary or one secondary Button, plus one link; `--space-inline-md` apart.
- **Layout**: centred block, `padding-top: var(--space-48)`, gap `--space-8` (title → body) and `--space-16` (body → actions). In tables it sits inside `<tbody><tr><td colspan>` so the header stays and the table semantics survive.
- **Illustration policy: none.** No illustrations, mascots, emoji, 3D, tinted icon tiles, dashed boxes or decorative Devanagari in the product (direction §3.2, anti-patterns 11 and 12). The largest graphic is a 20 px icon. Marketing may use real product surfaces, never art.

### 15.3 Copy by surface

| Surface | First use | Action |
|---|---|---|
| Leads | Leads you add or import appear here. | Import leads… · New lead |
| Call reports | Calls appear here after your agent places or answers one. | Place a test call… |
| Cockpit transcript | The transcript appears here once a call connects. | none |
| Flows | Start from a template or describe the call you want. | New flow (template gallery) |
| Knowledge | Add documents your agent can quote on calls. | Upload files |
| Meetings | Meetings you start appear here with notes and a summary. | Start a meeting |
| Billing › Invoices | Invoices appear here after your first top-up. | Top up |
| Settings › API keys | Create a key to call the Vaani API from your systems. | Create key… |

### 15.4 ARIA and behaviour

Result counts update the polite region ("No results"). The empty state is not a live region itself. The action takes focus only if the user's own action (clearing a list) produced the empty state.

```tsx
interface EmptyStateProps {
  variant: 'first-use' | 'no-results' | 'filtered' | 'done' | 'not-yet' | 'compact';
  icon?: LucideIcon; title?: string; children?: React.ReactNode;   // body
  query?: string; filtersSummary?: string; hiddenCount?: number;
  action?: { label: string; onClick?(): void; href?: string; variant?: 'primary' | 'secondary' };
  link?: { label: string; href: string };
}
```

**Resolves:** F-VIS-023, F-UX-046, F-UX-042, F-UX-030 (no false zeros), F-A11Y-019 (the 1.77:1 "Awaiting connection…").

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

---

## 19. Keyboard summary (for the `?` sheet)

| Key | Where | Does |
|---|---|---|
| ⌘K / Ctrl+K | Anywhere | Search or jump (CommandPalette) |
| ? | Anywhere outside a text field | Keyboard shortcuts sheet (Dialog lg) |
| Esc | Any overlay | Close the top-most overlay; in the palette, clear the query first |
| F6 | Page with an open sheet or inspector | Move focus between the page and the sheet |
| F8 | Anywhere | Go to notifications (newest toast) |
| ⌘/Ctrl+Z | Outside text fields | Undo (the newest undo toast, or the Flow history) |
| ⌘/Ctrl+S | Inside a form with changes | Save (UnsavedChangesBar) |
| J / K | Table with an open sheet | Next / previous record; the sheet follows |
| Shift+F10, context key | Focused row or flow step | Open its context menu |
| Enter | Dialog single-line field | Submit; ⌘/Ctrl+Enter from a textarea |

Single-key shortcuts (J, K, ?, and the Flow Designer's A, C, O, V) can be turned off from the account menu and the palette (F-A11Y-004). No single key ever places a call: C opens the Call gate, and Start needs ⌘/Ctrl+Enter.

---

## 20. Build order and tests

1. `announce()` + LiveRegion, `<Toaster/>`, Dialog, ConfirmDialog (everything else depends on them).
2. Tooltip (+ `DisabledReason`, `OverflowTooltip`), Menu / ContextMenu, Popover.
3. Sheet (record, detail, gate, inspector), then CommandPalette.
4. Notice, WalletNotice, ConnectionBar, StatusText, InlineError.
5. Spinner, Skeleton layouts, RouteProgress, ProgressBar, StageProgress.
6. EmptyState, PageError, NotFound, Forbidden, SectionError, SessionExpired.
7. SaveState + `useSaveMachine`, VersionChip, UnsavedChangesBar + `useUnsavedChangesGuard`.

**Tests that lock the audit fixes in:**
- Playwright: every dialog and sheet → open with the keyboard, Tab cycles inside, Esc closes, `document.activeElement` is the trigger (never `BODY`) (F-A11Y-005, F-A11Y-027).
- axe on each gallery state in both themes; the contrast script covers every new pair (none are new: all pairs used here exist in `contrast-report.md`).
- Save machine unit tests: hydration and `fitView` do not mark dirty; a blocked PUT ends in `error`, never `saved` (F-QA-002); a navigation 0.4 s after an edit flushes the save (F-FLOW-003).
- Link check: every "Top up" resolves to the Top-up sheet; no in-app href points at a missing anchor (F-UX-002).
- Visual snapshots: toasts, notices and the save chip at 320, 768, 1024, 1440 in both themes; reduced-motion snapshots show static spinners and no slides.
- Lint: no `role="alert"` on components other than Toast (error), InlineError and SaveState (error); no `z-index` literals; no `transition: all`.

---

## 21. Tokens and open questions

**Token requests:** registered in 01-foundations §18 and emitted by `tokens.json` 1.1.0: `--dur-spin` (800 ms), `--timing-skeleton-min` (400 ms) and `--size-palette-list` (`calc(var(--row-h) * 9)`) are accepted; `--timing-debounce` is merged into `--timing-validate-debounce` (300 ms), the one input debounce, so palette search and autosave use that name. Use the token names; the interim `calc()` values are retired.

**Open questions for the product owner**

1. **Wallet "low" threshold.** Proposed: runway under 60 min of calls at the workspace's median rate, editable in Billing › Autopay. Needs the per-second rate and median duration endpoints (direction §8 items 6).
2. **Soft-delete windows.** Tier 1 (Undo) needs the backend to keep deleted leads, steps, notes and rooms for at least the toast's lifetime. If it cannot, those actions move to tier 2 (ConfirmDialog).
3. **Busy loops.** Closed: direction §5 and foundations §11 now say it. Spinners and the indeterminate bar loop only while a user-started request is in flight; the live dot pulses 3 cycles on the focal call only.
4. **Request access.** Forbidden pages offer "Request access" only if an endpoint exists that notifies admins; otherwise "Copy request link".
5. **Session re-auth in place.** SessionExpired sends the user to `/login?next=`. A re-auth popup that keeps the page alive would preserve more work; it depends on the auth provider.
6. **Notification inbox.** Out of scope for v1: toasts are transient, the Baseline and notices carry state. If an inbox is added (for batch results and teammate activity), it is a popover from the account area built on §5.
7. **Offline edits.** The ConnectionBar copy promises that flow edits stay on the device. That needs a local draft queue (IndexedDB) for the Flow Designer; other surfaces say "Changes can't be saved until you reconnect."

---

## 22. Traceability

| Finding | Severity | Resolved by |
|---|---|---|
| F-FLOW-001 | critical | Undo toast for step delete (§9); Draft vs Live (§18.2); tier model (§3) |
| F-A11Y-002 | critical | Detail sheet opened by keyboard, focus in and back, deep link (§4) |
| F-A11Y-005 | high | Dialog focus contract, named close, inline discard, phone sheets above the bar (§1.3, §2) |
| F-QA-002, F-UX-024 | high | SaveState machine; hydration never writes (§18.1) |
| F-FLOW-003 | high | Five-plus-two save states, flush on exit, error toast (§18.1, §9) |
| F-FLOW-005 | high | Undo bound to the history stack (§18.1) |
| F-UX-002, F-QA-004 | high | Every Top up opens the Top-up sheet (§10.2) |
| F-UX-006 | high | Success only when proven; setup rows (§17) |
| F-UX-010 | high | Detail sheet 560 with tabs and one scroller (§4) |
| F-UX-012 | high | UnsavedChangesBar, guard, switches autosave (§18.3) |
| F-QA-007 | high | Shell never unmounts, skeletons, RouteProgress, ConnectionBar, SessionExpired (§13, §14, §10.3, §16) |
| F-RWD-004 | high | Full-screen call detail on phones (§4.6) |
| F-UX-013 | medium | Tier 4 routes billable actions to gates; palette never dials (§3.1, §8.3) |
| F-A11Y-004 | high | Single-key shortcuts can be turned off; C opens the Call gate, never dials (§19) |
| F-UX-022 | medium | Assistant side-effect steps are tier 4 (approval by autonomy level) (§3.1) |
| F-A11Y-011 | medium | Menu keyboard model (§7.4) |
| F-A11Y-013 | medium | Route announcement with RouteProgress (§14.1) |
| F-A11Y-014 | medium | LiveRegion + toasts with politeness (§1.8, §9) |
| F-A11Y-015 | medium | WalletNotice `role="status"`, focus to H1 on dismiss (§10.1–10.2) |
| F-A11Y-016 | medium | `aria-expanded`, `aria-checked` in menus and popovers (§5, §7) |
| F-A11Y-017, F-A11Y-024 | medium | Tooltip replaces `title`; `aria-label` on every icon button (§6) |
| F-A11Y-019 | medium | Status words and ≥ 5.47:1 tints (§10, §11) |
| F-A11Y-022 | medium | Motion table; static skeletons; spinners stop under reduced motion (§1.5, §12, §13) |
| F-A11Y-027, F-FLOW-024 | medium | Shortcut sheet as a portaled lg Dialog (§2.4) |
| F-A11Y-010 | medium | Lead sheet semantics and focus (§4.4–4.5) |
| F-FLOW-019, F-UX-035 | medium | Danger group in menus, Danger zone, typed confirm for live flows (§3.5, §7) |
| F-FLOW-025 | medium | Inspector closes on delete, Undo toast (§4.3, §9) |
| F-FLOW-031 | medium | AI draft as StageProgress + diff; Replace draft is tier 2 (§14.3, §3.1) |
| F-FLOW-022 | medium | Inspector overlay at 1024–1279 (§4.6) |
| F-FLOW-034 | low | No banner in the builder; status stays visible (§10.2, §18) |
| F-FLOW-037 | low | Canvas skeleton; editing off until hydrated (§13.2) |
| F-UX-014 | medium | "Default updated" success toast (§9.2) |
| F-UX-019, F-UX-023, F-UX-036 | medium | InlineError with Details, SectionError with last good data (§11.2, §16) |
| F-UX-028, F-RWD-013, F-QA-036 | medium / low | Wallet signal ladder (§10.2) |
| F-UX-029 | medium | CommandPalette, Sign out… confirm, in-shell 404 (§8, §3.1, §16) |
| F-UX-030, F-VIS-023 | medium | Skeleton layouts, EmptyState variants, error levels (§13, §15, §16) |
| F-UX-032 | medium | Lead sheet: full height, sticky header and footer, Delete in ⋯ (§4) |
| F-UX-033 | medium | Upload rows with status and stage progress (§14.4) |
| F-UX-034, F-QA-018 | medium | Forbidden in shell, disabled with reason (§16.1) |
| F-UX-042 | medium | "Not yet available" empty variant (§15.1) |
| F-UX-046 | low | Separate no-results and filtered copy; row ⋯ menu (§15.1, §7) |
| F-UX-047 | low | One primary; export stages (§2.8, §14.3) |
| F-QA-017, F-QA-039 | medium / low | NotFound inside the shell (§16.1) |
| F-QA-020 | medium | Save result proven; StatusText (§17, §11) |
| F-QA-022 | medium | Import StageProgress with mapping step (§14.3) |
| F-VIS-013, F-VIS-014, F-VIS-015, F-UX-007 | medium | Tooltip sizing, portal, overflow variant, rail side (§6) |
| F-VIS-016, F-QA-038 | medium / low | Named z-layers only (§1.2) |
| F-VIS-022 | medium | Flat scrim, no blur (§1.2) |
| F-VIS-029 | low | No decorative ring; Spinner rules (§12) |
