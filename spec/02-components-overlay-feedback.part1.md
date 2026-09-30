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

