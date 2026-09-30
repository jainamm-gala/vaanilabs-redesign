## 2. Buttons

### 2.1 Button

**Purpose.** Start an action on this page: save, publish, open a gate, place a call, export. Navigation between pages uses a link (`<a>`, or `Button asChild` wrapping `next/link`), styled as a button only when it is the region's call to action.

**Use when** the user commits or starts something. **Don't use** for a persistent on/off setting (Switch), for choosing one of a few modes (SegmentedControl), for filters (FilterToken), or for navigation inside running text (link).

**Anatomy.** `container` · `leadingIcon` (optional) · `label` · `trailingIcon` (optional; only `chevron-down` for menus) · `spinner` (busy only; takes the leading-icon slot) · external `reason` (disabled only, §1.6).

**Variants.** At most **one primary per region** (a page header, a dialog footer, a card, the bulk bar); if a region seems to need two, one of them is secondary (F-UX-021, F-UX-047, F-FLOW-018).

| Variant | Use | Default | Hover | Pressed | Contrast (label on fill, L / D) |
|---|---|---|---|---|---|
| `primary` | The one committing action in a region: `Publish v8…`, `New lead`, `Place call…`, `Pay ₹500 via UPI` | bg `--accent`, label `--on-accent`, border 1 px `--accent` | bg `--accent-hover` | bg `--accent-press` | 7.68 / 6.21; hover 9.33 / 5.37; pressed 10.82 / 7.68 |
| `secondary` | Everything else a user commits to: `Import…`, `Test`, `Talk in browser` | bg `--surface`, label `--text`, border 1 px `--border-strong`, shadow `--e1` | bg `--surface-2` | bg `--surface-3` | 17.93 / 15.03 |
| `tertiary` (ghost) | Low-emphasis actions in toolbars and footers: `Export`, `Columns`, `Clear`, `Cancel` in a dialog or a gate (G §1.1: the one primary stays the only filled button) | bg transparent, label `--text-2`, border transparent | bg `--surface-2`, label `--text` | bg `--surface-3` | 8.76 / 9.20 |
| `destructive` | Delete, remove, end, revoke. Outline by default | bg `--surface`, label `--danger-text`, border 1 px `--danger-border` | bg `--danger-soft` | bg `--danger-soft`, border `--danger-text` | 6.57 on surface, 5.75 on soft (L) · 7.52, 6.87 (D) |
| `destructive` + `emphasis="solid"` | **Only** the confirming button inside a confirmation dialog ("Delete flow") | bg `--danger`, label `--on-danger` | bg `--danger-text` | bg `--danger-text` | 5.92 / 7.50 |
| `link` | An inline action inside text or a status sentence: `Top up`, `Make default`, `Compare with live`, `Retry` | text `--accent-text`, no box, underline offset 3 px | `--link-hover`, underline | `--link-hover` | 7.68 / 7.57 |

*Destructive hover:* in dark, `--danger-text` equals `--danger`, so the solid destructive hover uses its own token, `--danger-hover` (light `red-700` `#B42318`, dark `red-200` `#F7B2AB`; label 6.57 / 10.17:1), in `tokens.json` 1.1.0 and `check-contrast.mjs` (foundations §18).

**Sizes** (heights from §1.3; icons at `--icon-stroke` 1.5 px):

| Size | Height S · C · T | Padding-inline | With leading icon (start side) | Gap | Type | Icon | Radius |
|---|---|---|---|---|---|---|---|
| `sm` | `--btn-h-sm` 28 · 24 · 36 (44 hit) | `--btn-px-sm` 10 (12 touch) | `--space-8` | `--space-inline-sm` 6 | `label-13` | `--icon-sm` 14 | `--radius-6` |
| `md` | `--btn-h-md` 32 · 28 · 44 | `--btn-px-md` 12 (16 touch) | `--space-10` | 6 | `label-13` (`button-14` on touch) | `--icon-md` 16 | `--radius-6` |
| `lg` | `--btn-h-lg` 40 · 40 · 44 | `--btn-px-lg` 16 | `--space-12` | `--space-8` | `button-14` | `--icon-md` 16 | `--radius-6` |

Always `white-space: nowrap` (labels never wrap: F-VIS-013, F-VIS-030); `display: inline-flex; align-items: center; justify-content: center`. Radius is never full (D §5). No uppercase, no letter-spacing, no mono (F-VIS-006: "NEW LEAD" in tracked caps, "CONNECT" in the system font).

**States.**

| State | Rule |
|---|---|
| Hover | Fill change per the table; fine pointers only. Cursor `pointer` |
| Pressed | Per the table; no scale, no translate (today's `.btn-saffron` lifts 1 px and glows: removed) |
| Focus-visible | 2 px `--focus` outline, 2 px offset. On a primary, the offset keeps the ring on the plane, not on the fill (F §13) |
| Disabled | bg `--surface-2`, label `--text-dis`, border `--border`, no shadow, `cursor: not-allowed`, and a visible reason (§1.6). Applies to every variant, so disabled never looks like a tinted enabled button (F-VIS-030) |
| Loading | Label switches to its progress form ("Publish v8…" → "Publishing…", "Save" → "Saving…"); `min-inline-size` locked to the width before loading, so nothing shifts; `aria-busy="true"` and `aria-disabled="true"`; repeated activation ignored (no double submit; calls and top-ups also send an idempotency key, D §6.3). After 200 ms a 14 px spinner replaces the leading icon (§1.7). Fill stays the variant's default |
| Success | Buttons do not turn green. Success is reported next to the action ("Saved 11:24 am") or by a toast that names the object |

**Behaviour and keyboard.** `Enter` and `Space` activate (native `<button>`). The default `type` is `button`, never an implicit `submit` (today's chips are `type="submit"`, F-A11Y-016); a form's submit is explicit `type="submit"`. No single-key shortcut ever activates a billable or destructive button; `C` opens the Call gate and `⌘/Ctrl+Enter` confirms inside it (D §P3, F-A11Y-004). A shortcut, when a button has one, appears in its tooltip as a `Kbd`, never in the label (D §P5).

**ARIA.** Native `<button>`. The accessible name starts with the visible label (label-in-name, F-A11Y-030): "Save context", not "Save customer context — agent will use this data". Menu triggers add `aria-haspopup="menu"` and `aria-expanded`. Per-row buttons add the row's primary text to their name through a visually hidden suffix, never a row number: "Download CSV for the call at 10:42 am" (F-A11Y-024). Icons inside labelled buttons are `aria-hidden`.

**Responsive.**

| Width | Behaviour |
|---|---|
| ≥ 1440 · 1024–1439 | Intrinsic width. Page header: up to three actions, at most one primary, right-aligned (D §6.1). Dialog and sheet footers right-aligned: tertiary or secondary `Cancel`, then the primary last |
| 768–1023 | Same, but a header with more than two actions keeps the primary and moves the rest into a `⋯` overflow menu, so nothing is clipped (F-RWD-003, F-RWD-007) |
| < 768 | Touch height 44. Page headers show only the primary (icon + short label if needed, e.g. `New`) and `⋯`. Forms and sheets put their actions in a sticky bottom bar (`--size-bottombar` 56 + `env(safe-area-inset-bottom)`): two buttons share the width 1:1 (secondary first, primary last); a third goes to `⋯`. A label that does not fit uses `labelShort` ("Call 2 leads…" → "Call 2…"), never a wrap (F-RWD-008, F-RWD-013) |

**Motion.** `background-color`, `border-color`, `color` over `--dur-fast` `--ease-standard`. Spinner per §1.7. Nothing else moves.

**Copy.** Verb + object in sentence case, 1 to 3 words plus a count or amount when it helps: `Call 2 leads…`, `Pay ₹500 via UPI` (F-QA-021), `Top up`, `Place call…`, `Talk in browser`, `Test call`, `Save changes`, `Delete flow…`. Not "Submit", "Continue", "OK", "CONNECT", "ACTIVATE" or "Recharge" (D §4.3). The label names what happens, including cost when money moves.

**Do / don't.**

| Do | Don't |
|---|---|
| `Publish v8…` in Neel, `Test` secondary, `⋯` tertiary, in one 48 px header row | Save (blue) and ACTIVATE (green, glowing) side by side as two primaries (F-FLOW-018) |
| `Delete lead…` in the overflow menu, then a dialog whose solid red button says "Delete lead" | A full-width DELETE LEAD under Call Now (F-UX-035) |
| A disabled `Start 3 calls` next to "Calls can't start outside calling hours. Opens 10 am IST." | A disabled button at 50 % opacity with no reason (F-VIS-030) |
| `Talk in browser` and `Place call…` at the same height, side by side, each saying what it does | "CONNECT" and a teal two-line "Test / Call" that look unrelated (F-UX-026) |

**Resolves:** F-VIS-006, F-VIS-016 (button sizes), F-VIS-030, F-A11Y-009, F-A11Y-006 (buttons), F-A11Y-016 (`type`), F-A11Y-030, F-UX-021 (competing primaries), F-UX-026, F-UX-035, F-UX-047, F-FLOW-018, F-FLOW-019, F-RWD-003, F-RWD-007, F-RWD-008.

**React.**

```tsx
// components/ui/button.tsx: native <button> + Radix Slot + cva. The only button in the app.
type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'link'; // default 'secondary'
  emphasis?: 'outline' | 'solid';   // destructive only; 'solid' is allowed only inside <ConfirmDialog> (lint)
  size?: 'sm' | 'md' | 'lg';        // default 'md'
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;        // chevron-down for menu triggers only
  isLoading?: boolean;
  loadingLabel?: string;            // "Publishing…"; defaults to the label
  disabledReason?: string;          // renders aria-disabled + a described-by reason (inline or tooltip)
  reasonPlacement?: 'inline' | 'tooltip';
  labelShort?: string;              // < 768 only
  fullWidth?: boolean;              // phone sticky bars and auth forms
  asChild?: boolean;                // render a next/link with button styling (navigation CTAs)
};
```

- `disabled` is not exposed: callers pass `disabledReason` (§1.6). A lint rule flags `aria-disabled` without a reason.
- Classes (md primary): `inline-flex items-center justify-center gap-1.5 h-(--btn-h-md) px-(--btn-px-md) rounded-control text-label-13 whitespace-nowrap bg-accent text-on-accent border border-accent hover:bg-accent-hover active:bg-accent-press aria-disabled:bg-surface-2 aria-disabled:text-fg-dis transition-colors duration-(--dur-fast) ease-standard` (Tailwind v4's `hover:` already applies only under `(hover: hover)`).
- A codemod moves `.btn-saffron`, `.btn-outline`, `.btn-danger` and the bespoke strings onto `<Button>` (D §8, F-VIS-006).

### 2.2 IconButton

**Purpose.** A compact action whose icon is unambiguous in context: close, overflow `⋯`, undo, redo, pager arrows, copy, show password, remove a file. **Don't use** when the icon needs its tooltip to be understood (the flow toolbar's shield and eye, F-FLOW-018): give it a text label at ≥ 1280.

**Anatomy.** Square container (width = height) · icon · tooltip (always) · optional `Kbd` in the tooltip.

**Sizes.** `sm` 28 · 24 · 36 (44 hit), icon 14 or 16; `md` 32 · 28 · 44, icon 16; `lg` 40 · 40 · 44, icon 20 (`--icon-lg`, top-bar and bottom-bar actions). Variants: `tertiary` (default) and `secondary`; `destructive` icon-only is not allowed in rows (put Delete in the `⋯` menu, F-UX-035, F-UX-038).

**States.** As Button. Toggle icon buttons (show password, mute, full-screen) set `aria-pressed` and swap the icon to show the *current* state, with the tooltip naming the action ("Show password" / "Hide password"; F-VIS-032 found a sun icon labelled "DARK").

**ARIA.** `aria-label` is required (TypeScript makes `label` mandatory) and equals the tooltip text. The tooltip is the overlay group's Tooltip (shown after `--timing-tooltip-delay` 300 ms on hover and immediately on focus), never a `title` attribute (F-A11Y-017, F-A11Y-024). At < 640 px a button that had a text label keeps its accessible name (`sr-only`, never `hidden sm:inline`, F-A11Y-024).

**React.** `<IconButton icon={X} label="Close" size="sm" shortcut={['Escape']} />`; `label` is typed `string` and required.

### 2.3 SplitButton

**Purpose.** One default action plus a short menu of alternatives of the same verb: `Export` ▾ (CSV, XLSX), `Place call…` ▾ (Schedule call…). **Don't use** to hide unrelated actions (use `⋯`), for destructive alternates, or for Publish (one path, one gate).

**Anatomy.** `action` (a Button) · 1 px divider (`--border-strong` on secondary, `--accent-hover` on primary) · `menuTrigger` (an icon-only button with `chevron-down`, width = height) · `menu` (overlay group). Outer corners `--radius-6`, inner corners 0.

**Behaviour.** Two tab stops. The trigger opens the menu with `Enter`, `Space` or `↓`; the menu lists the default action first with a check. Name: "More export options" (`aria-haspopup="menu"`, `aria-expanded`). Primary split buttons count toward the one-primary rule. On phones the split collapses into one button that opens an action sheet.

**React.** `<SplitButton variant="secondary" label="Export" onAction={exportCsv} menuLabel="More export options" items={[{ id: 'xlsx', label: 'Export XLSX' }]} />`.

### 2.4 ButtonGroup

**Purpose.** Related commands that belong together: undo/redo, zoom out/fit/in, pager previous/next, a toolbar cluster.

**Variants.** `attached` (shared border, inner radius 0, 1 px `--border-strong` dividers; for undo/redo and zoom) and `spaced` (gap `--space-inline-md` 8 between buttons, `--space-inline-lg` 12 between groups). Destructive buttons never join an attached group.

**ARIA.** `role="group"` with `aria-label` ("History"). A dense row of icon buttons that behaves as one widget (the Flow Designer tool rail) is `role="toolbar"` with a roving tabindex: one tab stop, `←`/`→` (or `↑`/`↓` for a vertical rail) move, `Home`/`End` jump (F-A11Y-011).

### 2.5 Link button

Inline actions in sentences and status lines: "Wallet is ₹0. **Top up** to place calls." Use `<a href>` when it navigates (so Cmd/Ctrl-click and middle-click work) and `<button>` when it acts. Style: inherits the surrounding type role; `--accent-text`; underline on hover and focus (always underlined inside paragraphs); `text-underline-offset: 3px` (`base.css`); hit area padded to `--hit`. Every "Top up" link goes to `/billing?topup=1`, never Profile (F-UX-002). No ↗ icon on same-tab links; `external-link` only for off-site links (F-A11Y-030, F-VIS-031).

### 2.6 RefreshButton (recipe)

Six Refresh designs with three behaviours exist today (F-VIS-006). One recipe:
- `Button variant="tertiary" size="sm" leadingIcon={RefreshCw}` labelled "Refresh" (icon-only with tooltip where space is tight).
- **Busy:** label "Refreshing…", `aria-busy`, spinner after 200 ms (§1.7), repeated clicks ignored.
- **Success:** a quiet meta line beside it, "Updated 11:24 am" (`meta-12`, `--text-3`, a `<time>`), never a toast.
- **Failure:** keep the last good data and show "Couldn't refresh · **Retry** · Updated 11:02 am" inline, `role="status"` (F-UX-019). No raw error text; details sit behind "Details".
