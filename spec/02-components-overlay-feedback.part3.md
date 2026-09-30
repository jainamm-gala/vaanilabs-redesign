
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
