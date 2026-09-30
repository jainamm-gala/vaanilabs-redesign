<!-- Assembled from 02-components-core.part1.md, 02-components-core.part2.md, 02-components-core.part3.md, 02-components-core.part4.md, 02-components-core.part5.md, 02-components-core.part6.md, 02-components-core.part7.md, 02-components-core.part8.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 02 · Components: core controls (Sutradhar)

**Status:** final for v1 · **Date:** 2026-09-26 · **Group:** core (buttons, fields, pickers, choice controls, upload, keycaps, form rules)
**Builds on:** `spec/00-design-direction.md` (the direction, cited as *D §n*) and `spec/01-foundations.md` (every value, cited as *F §n*). Every size, colour, radius, duration and z-layer below is a token from `spec/tokens/tokens.css`. Nothing here introduces a raw colour or an ad-hoc size.
**Evidence:** finding ids (F-VIS-…, F-A11Y-…, F-UX-…, F-QA-…, F-FLOW-…, F-RWD-…) refer to `audit/consolidated/`.

| Deliverable | Path |
|---|---|
| This spec | `spec/02-components-core.md`, assembled from `02-components-core.part1-8.md` (edit the parts, then re-assemble) |
| Gallery (every component in its states, light and dark side by side) | `spec/components/core.html` (links `../tokens/tokens.css` and `../tokens/base.css`); renders `core-light-dark.png`, `core-mobile.png` |

**Contents**
1. Shared rules for every core control (this part)
2. Button, IconButton, SplitButton, ButtonGroup, link button, RefreshButton (part 2)
3. Field anatomy; text, password, number and search inputs; textarea (part 3)
4. Phone (+91) and currency (INR) inputs (part 4)
5. Select, Combobox, FlowSwitcher, MultiSelect (part 5)
6. Checkbox, Radio and RadioCard, Switch, SegmentedControl and VoiceChoice, Slider (part 6)
7. Date and time pickers, FileUpload and Dropzone, Kbd (part 7)
8. Form layout and validation timing; traceability; build order; open questions (part 8)

Out of scope here and specified by the other component groups: Tooltip, Popover, Menu, Dialog, Sheet and Toast (overlays); Tag, LanguageMark, PhoneText and the call-state chip (display); DataTable, FilterToken and the bulk bar (data); Gate (`02-components-gate.md`), Baseline and the shell; flow nodes and the prompt editor (Flow Designer). Where a core control needs one of them, this spec names the dependency and the contract.

---

## 1. Shared rules for every core control

### 1.1 What the audit found, and the one-line fix

| Today (evidence) | Core rule that replaces it |
|---|---|
| 3 button systems, 80 button styles, 18 heights from 22 to 58 px, black text on blue at 3.83:1 (F-VIS-006, F-VIS-016, F-A11Y-009) | One `Button` with 5 variants and 3 sizes whose heights come from the density tokens; white `--on-accent` label (7.68 / 6.21:1) |
| 12 input styles, 21–43 px tall, mono and sans, 4 radii, 4 fills, an icon overlapping the text (F-VIS-018, F-VIS-019) | One field box: `--surface`, 1 px `--control`, radius 6, sans text, adornment slots that pad the text automatically |
| Placeholders as the only label, at 1.56–1.78:1; unlabelled checkboxes, selects and file inputs (F-A11Y-003, F-A11Y-020) | `Field` always renders a real `<label for>`; placeholders are optional examples in `--text-3` (≥ 4.70:1) |
| Focus missing on checkboxes, selects and the password toggle; a 14 % alpha halo on inputs (F-A11Y-006) | The global 2 px `--focus` outline with a 2 px offset, drawn on the visible part of every control |
| Forms accept "abc" as a phone number, 0 and −50 as a top-up, "not-a-url" as a webhook; values silently clamped (F-UX-025, F-QA-021, F-FLOW-015) | Shared validators and one validation-timing rule (part 8); input is never rewritten silently |
| Toggles, chips and segmented modes with no state semantics (F-A11Y-016) | Radio semantics for single choice, `aria-pressed` for independent toggles, `aria-checked` for switches |
| Disabled controls that differ only by 50 % opacity and never say why (F-VIS-030, F-UX-026) | Disabled uses `--surface-2` / `--text-dis` and always carries a visible reason (§1.6) |
| A single `c` key places a billable call; shortcut hints printed into labels (F-A11Y-004, F-VIS-032) | No billable action on a bare key; keycaps only in tooltips, menus, the `?` sheet and the search hint (`Kbd`, part 7) |

### 1.2 Primitive layer: Radix first, React Aria only where Radix has nothing

The audit detected no primitive library (`audit/raw/design-system.md` §2). The overlay group (`spec/02-components-overlay-feedback.md` §1) adopts **Radix primitives as shadcn/ui source-copied components, plus `cmdk` for the command palette**. Core follows the same base, so every popover, dialog, menu and tooltip in the product runs on **one focus manager**. Radix has no number, date, time, calendar or drop-zone primitives, so core fills exactly those gaps with **overlay-free** React Aria Components (RAC), always rendered inside Radix overlays, never with RAC's own `Popover` or `Modal`.

| Control | Primitive | Why |
|---|---|---|
| Button, IconButton, SplitButton | native `<button>` + Radix `Slot` (`asChild`) + `class-variance-authority` | Today's React Button is already CVA-like (`audit/raw/design-system.md` §6); `Slot` lets a `next/link` wear button styling |
| Label, Field | Radix `Label` + our `Field` context | Ids, `aria-describedby`, `aria-invalid` wired once |
| Checkbox, RadioGroup, Switch | `@radix-ui/react-checkbox`, `-radio-group`, `-switch` | Real roles, `aria-checked` (incl. `mixed`), roving focus in radio groups |
| SegmentedControl | `@radix-ui/react-toggle-group` | `type="single"`: radio semantics with roving focus; `type="multiple"`: `aria-pressed` |
| Slider | `@radix-ui/react-slider` | `role="slider"` per thumb, keyboard steps, two-thumb ranges |
| Select | `@radix-ui/react-select` | Listbox semantics, typeahead, collision-aware positioning |
| Combobox, FlowSwitcher | Radix `Popover` + `cmdk` | The same list engine as the Search-or-jump palette, so filtering, groups and scoring behave identically |
| MultiSelect | Radix `Popover` + RAC `ListBox` (`selectionMode="multiple"`) | cmdk marks the *highlighted* item with `aria-selected`, so it cannot express several selected values; RAC's standalone ListBox can (`aria-multiselectable`) |
| NumberInput, CurrencyInput | RAC `NumberField` | en-IN parsing and lakh grouping (₹1,00,000); Radix has no number field |
| DateField, TimeField, Calendar, RangeCalendar | RAC + `@internationalized/date`, inside a Radix `Popover` | Typed segments, en-IN order, IST time zones; a calendar-only picker cannot be typed into |
| Dropzone | RAC `DropZone` + `FileTrigger` | Drop announcements and a keyboard-reachable trigger |

Rules:
- **Own the source.** Wrap each primitive once in `components/ui/<name>.tsx` with our classes. App code imports only `components/ui`, never `@radix-ui/*`, `cmdk` or `react-aria-components` directly. An ESLint rule rejects raw `<button className=…>`, `<input className=…>` and `<select>` outside `components/ui/` (F-VIS-006).
- **State selectors.** Radix exposes `data-state` (`checked`, `unchecked`, `indeterminate`, `on`, `off`, `open`, `closed`), `data-disabled` and `data-highlighted`; RAC pieces expose `data-focus-visible`, `data-invalid`, `data-selected`. Hover uses `:hover` inside `@media (hover: hover) and (pointer: fine)`, pressed uses `:active`, focus uses `:focus-visible` (or `:has(:focus-visible)` on a field box), so hover never sticks on touch.
- **Supporting libraries:** `libphonenumber-js` with `min` metadata (phone parse and format, about 80 KB), `react-hook-form` + `zod` + `@hookform/resolvers` (form state and the shared schemas, F-QA-021).
- **Tailwind:** utilities come from `spec/tokens/tailwind.theme.css`: `h-control`, `h-control-sm`, `rounded-control`, `text-label-13`, `bg-accent`, `border-control`, `shadow-e1`, `duration-(--dur-fast)`, `ease-standard`. No arbitrary values (F-VIS-020).

### 1.3 Component token layer

Components read foundation tokens directly. Where a role name helps, `components/ui/core.css` declares aliases, **only as `var()` of foundation tokens, and on `:root, [data-density]`** so they re-resolve inside a compact or touch region (a custom property that references another is resolved where it is declared; aliasing `--control-h` on `:root` alone would freeze the root density into every compact table).

```css
:root, [data-density] {
  /* heights: Standard · Compact · Touch */
  --btn-h-sm: var(--control-h-sm);                    /* 28 · 24 · 36 (44 hit) */
  --btn-h-md: var(--control-h);                       /* 32 · 28 · 44 */
  --btn-h-lg: max(var(--space-40), var(--control-h)); /* 40 · 40 · 44 */
  --field-h: var(--control-h);                        /* 32 · 28 · 44 */
  --field-h-sm: var(--control-h-sm);                  /* 28 · 24 · 36 (44 hit) */
  --field-h-lg: max(var(--space-40), var(--control-h)); /* 40 · 40 · 44 */
  --btn-px-sm: var(--space-10);
  --btn-px-md: var(--space-12);
  --btn-px-lg: var(--space-16);
  --field-px: var(--space-10);
  --btn-font-md: var(--type-label-13);
  --hit: var(--size-hit-min);                         /* 24 */
  /* --field-w-short (180), --field-w-medium (320) and --popover-w-list (400) are tokens.css tokens since 1.1.0
     (component.form, registered in 01-foundations §18); this layer no longer declares them. */
}
@media (pointer: coarse), (max-width: 767.98px) {
  :root, [data-density] {
    --btn-px-sm: var(--space-12);
    --btn-px-md: var(--space-16);
    --field-px: var(--space-12);
    --btn-font-md: var(--type-button-14);
    --hit: var(--size-hit-touch);                     /* 44 */
  }
}
```

`--field-w-short`, `--field-w-medium` and `--popover-w-list` are named tokens in `tokens.json` 1.1.0 (`component.form`; 01-foundations §18); pages and components use the same names. The rest of this block (`--btn-*`, `--field-h*`, `--field-px`, `--hit`) is a component-local layer of `var()` pointers to density tokens, listed in foundations §18.3.

### 1.4 Sizing across density and breakpoints

Density is set by the surface, never by the component (F §14). A button or field placed in a Compact table toolbar becomes 28 px; the same component in a dialog is 32 px; on touch everything is 44 px. Forms, dialogs, sheets, gates and the inspector always use Standard.

| Size | Standard (default) | Compact (`data-density="compact"`) | Touch (`pointer: coarse` or < 768) | Where |
|---|---|---|---|---|
| `sm` | 28 | 24 | 36 visible, 44 hit | Table row actions, toolbars, the bulk bar, the pager, inspector section headers |
| `md` | 32 | 28 | 44 | The default: page headers, forms, dialogs, gates, cards |
| `lg` | 40 | 40 | 44 | Auth, the setup track, the top-up sheet, marketing, the phone sticky action bar |

| Breakpoint | What changes for core controls |
|---|---|
| Desktop ≥ 1440 · Laptop 1024–1439 | Standard or Compact by surface. Popovers anchor to their trigger. Hover styles apply under `(hover: hover) and (pointer: fine)` only |
| Tablet 768–1023 | Same heights unless the pointer is coarse (landscape tablets get Touch automatically). Popovers still anchor; sheets are full height (shell spec) |
| Phone 320–767 | Touch density: 44 px controls, 16 px field text (`--field-font`, no iOS focus zoom, F-UX-025, F-RWD-018), 44 px hit areas. Every listbox popover becomes a bottom sheet with 48 px rows (`--row-h`). Form actions move to a sticky bottom bar. Nothing scrolls sideways at 320 |

**Hit areas.** Every interactive target is at least `--hit` (24 px; 44 px on touch), padded with an absolutely positioned `::after` so the visual can stay small: `inset: min(0px, calc((var(--btn-h-sm) - var(--hit)) / 2))` (F-A11Y-023). Destructive controls sit at least `--space-8` from routine ones or live in an overflow menu (F §14, F-UX-035).

### 1.5 The state model

Every core control implements these states in this order of precedence. Selectors follow §1.2 (CSS pseudo-classes, Radix `data-state`, RAC `data-*`); the gallery uses `.is-*` classes to freeze a state for review.

| State | Trigger | Visual rule (details per component) | Semantics |
|---|---|---|---|
| Default | | Tokens per variant | |
| Hover | `:hover`, fine pointers only | Fill change only (`--surface-2`, `--accent-hover`); **never a lift or shadow change** (F §8) | none |
| Pressed | `:active` | One step deeper (`--surface-3`, `--accent-press`); no scale | none |
| Focus-visible | `:focus-visible` (`:has(:focus-visible)` on field boxes) | `outline: var(--focus-width) solid var(--focus); outline-offset: var(--focus-offset)` on the **visible** box (the checkbox square, the switch track, the field box), never on a 1×1 hidden input (F-A11Y-006) | Real focus |
| Selected / checked | `[data-state="checked"|"on"]`, `aria-checked`, `aria-pressed`, `aria-selected` | Selection treatment (F §13): `--accent-soft` fill + 1 px `--accent-mark` border, or the checked fill `--accent` + `--accent-mark` border. Always a non-colour cue as well (check glyph, raised key, dot) | `aria-checked` / `aria-selected` / `aria-pressed` |
| Invalid | `[aria-invalid="true"]` | 1 px `--danger-border`, error text with an icon (§ part 3). The focus ring stays `--focus`: focus is focus | `aria-invalid`, `aria-describedby` → message |
| Read-only | `[readonly]`, `[aria-readonly="true"]` | `--surface-2` fill, `--border` hairline, `--text` value; focusable and copyable | `readonly` / `aria-readonly` |
| Disabled | `[data-disabled]`, `:disabled`, `[aria-disabled="true"]` | `--surface-2` fill, `--border` or `--border-strong` edge, `--text-dis` text, no shadow, `cursor: not-allowed`. **Never `opacity`** (F §10) | See §1.6 |
| Loading / busy | component state | Label switches to its "…" form; width locked; spinner after 200 ms (§1.7) | `aria-busy="true"`, activation ignored |

When focus and selection both apply, both show (F §13, F-A11Y-007).

### 1.6 Disabled always says why

A disabled control with no reason is a dead end (F-VIS-030, F-UX-026, D §4.2 rule 4). Two forms, one rule:

1. **Unavailable because of something outside the control** (wallet ₹0, no permission, outside calling hours, rate-limited, publish blocked by errors): render the control with `aria-disabled="true"` instead of the `disabled` attribute, so it stays focusable; ignore activation; point `aria-describedby` at a visible reason. The reason is inline text next to or under the control when there is room ("Wallet is ₹0. **Top up** to place calls."), otherwise the control's tooltip shows it on hover and focus. Examples: "Fix 2 errors to publish" (D §6.5), "Available again in 3 h" (F-UX-047), "Only admins can change this. Ask an admin."
2. **Not applicable in the current state of the same form** (a dependent field whose parent is off): use native `disabled` and keep the reason in the field's hint ("Turn on Autopay to set a threshold").

Field errors are **not** a reason to disable a submit button; they are reported on submit (part 8, rule V6).

### 1.7 Motion for core controls

| What | Token | Property |
|---|---|---|
| Hover, press, colour, border and check changes | `--dur-fast` (90 ms) + `--ease-standard` | `background-color`, `border-color`, `color`, `opacity` (list them; never `transition: all`, F §11) |
| Popover and listbox open | `--dur-base` (140 ms), rise `--shift-popover` (4 px) | `opacity`, `transform` |
| Popover close, every exit | `--dur-fast` | `opacity` |
| Bottom-sheet listbox on phones | `--dur-slow` (200 ms) | `transform` from the bottom edge |
| Switch thumb | `--dur-fast` | `transform: translateX()`; instant (`transition: none`) under reduced motion |
| Busy spinner | one turn per `--dur-spin` (800 ms), linear; only while a user-started request is in flight | `transform: rotate()` |

**The busy spinner is one of the bounded loops in F §11** (accepted 2026-09-27, with 07-motion MD5 and MD6): it appears only after `--timing-skeleton-delay` (200 ms) of a request the user started, stays at least `--timing-skeleton-min` (400 ms) once shown, stops the moment the request settles, and freezes under reduced motion or the in-app Motion preference (`--dur-spin` becomes 0 and `base.css` caps iterations at 1), where the "…" label and `aria-busy` carry the state alone.

Nothing in the core group animates on idle, lifts on hover, bounces, scales or glows.

### 1.8 Forced colours and theming

- Components add nothing theme-specific: the same tokens resolve per `data-theme` (F §1.2). No `dark:` utilities in `components/ui`.
- Forced colours (`base.css`): focus stays a 2 px `Highlight` outline; anything carrying `aria-selected`, `aria-current` or `data-selected` gets a 4 px `Highlight` bar on its inline-start edge (never an outline, so selection never looks like focus; F §13). Our wrappers add `data-selected` to the selected segment, option and calendar day (Radix uses `data-state`, which forced-colours rules cannot target generically), so they are covered. Checkbox, radio and switch marks carry `data-mark` so their fill survives as `CanvasText` (an unchecked radio or an off switch thumb carries `data-mark="hollow"`: a `Canvas` fill with a `CanvasText` ring). Box-shadow rings are never the only indicator of anything.
- Native `<input>`, `<textarea>` and our field boxes set `color-scheme` through the theme, so autofill, carets and scrollbars follow the theme. Autofill keeps our fill: `input:autofill { box-shadow: 0 0 0 100vmax var(--surface) inset; -webkit-text-fill-color: var(--text); }` (the inset shadow is the documented workaround for the browser's forced autofill colour, not a decorative shadow).

### 1.9 Copy rules shared by every control

- **Sentence case** in labels, options, buttons and helper text; no literal capitals and no `text-transform` (D §4.2).
- **Buttons are verb + object**; a trailing "…" means another step follows ("Publish v8…", "Call 2 leads…", "Import…").
- **Labels are nouns** ("Phone number", "Top-up amount"), never instructions or placeholders.
- **Placeholders** are optional examples ending in "…" ("Search name, phone or city…"). A format example that must stay visible goes in the hint, not the placeholder.
- **Errors** say what is wrong and how to fix it in one sentence, starting with a verb: "Enter a 10-digit mobile number, like 98765 43210." Never "Invalid input", "Error:", "Oops" or "Please".
- **No em-dash separators** (use a full stop, colon or middle dot) and no exclamation marks (D §4.2 rule 7).
- **Numbers:** en-IN grouping, a non-breaking space before units (`6 s`, `10 MB`), `tabular-nums` on every changing number.
- **Names** of flows, leads and brands carry `translate="no"`.

### 1.10 Two global prerequisites found while rendering the gallery

1. **The root font size stays at the browser default** (fixed in `base.css`, 2026-09-27). `base.css` used to set `html { font: var(--type-body-14); }`, which made the root 14 px and rendered every rem token at 87.5 % (`meta-12` at 10.5 px, `label-13` 11.4 px, `title-20` 17.5 px). It now keeps `html { font-size: 100%; }` and sets `font` on `body`; the gallery override is removed, and CI check CT-03 asserts `html` = 16 px and `meta-12` = 12 px (F §15.5).
2. **`box-sizing: border-box` everywhere** (Tailwind's preflight already does this). Every height in this spec is the outer height including the 1 px border; with `content-box` a 32 px button measures 34 px and a 320 px field overflows its column.

---

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

---

## 3. Field anatomy and text inputs

### 3.1 Field (the wrapper every input uses)

**Purpose.** Give every control a programmatic label, a hint, an error and, when needed, a character count, wired identically everywhere. Today 7 of 8 Cockpit controls, all 8 New-lead inputs and every login field lack a label (F-A11Y-003); placeholders stand in at 1.56–1.78:1 (F-A11Y-020).

**Anatomy** (top to bottom, one column, no card around it: F-VIS-016 found three concentric outlines per field):

| Part | Spec |
|---|---|
| `label` | `<label for>`; `label-13` (13/20/500) in `--text`. Sentence-case noun. Always visible; never replaced by a placeholder |
| `optional` marker | "(optional)" after the label in `data-13` (13/20/400) `--text-3`. See the required rule below |
| `control` | The input box (§3.2) or a choice control. Gap label → control: `--space-label-gap` (6) |
| `hint` | `meta-12` (12/16/400) `--text-3`, under the control, gap 6. One short line: the format or the consequence ("10-digit mobile, like 98765 43210", "Callers hear this before the first question") |
| `error` | Replaces the hint while the field is invalid: `circle-alert` at `--icon-sm` (14) + message in `meta-12` `--danger-text` (6.57 / 7.52:1 on surface). The message includes the fix, so the hint is not needed alongside it |
| `count` | Right end of the hint row: "1,240 of 6,000", `meta-12` `--text-3`, `tabular-nums`; `--warning-text` from 90 %; `--danger-text` and the field invalid when over |
| `description` (rare) | For a field that needs a sentence of context before input (Agent instructions), `meta-12` `--text-3` between label and control. Use sparingly; the hint below is the default |

**Required and optional.** One rule for the whole app: **unmarked fields are required; optional fields say "(optional)"**, and required controls carry `required` / `aria-required="true"`. A form with more than three fields and any optional field adds one line under its title: "All fields are required unless marked optional." This is the inverse of the audit's "(required)" suggestion (F-A11Y-003) because most Vaani forms are mostly required, so marking the minority is quieter and still meets 3.3.2; the programmatic `required` is kept either way. No asterisks.

**Wiring.** `id` from `useId`. The control's `aria-describedby` lists, in order: error (when invalid) or hint, then count. `aria-invalid="true"` while invalid. `autocomplete`, `name`, `type` and `inputmode` are props of the input, never defaulted to `off` (F-A11Y-025). Group labels use `<fieldset>`/`<legend>` (checkbox and radio groups, date and time pairs).

**Layout.** Fields stack at `--space-field-gap` (16); groups at `--space-group-gap` (24); sections at `--space-section-gap` (40) with a `title-16` heading. Full width of the form column (max `--size-container-form` 720) unless the content is short: codes and counts use `--field-w-short` (180), phone, amount and dates use `--field-w-medium` (320) so the width hints at the expected length. Two fields share a row only when they are one idea (City + State, Date + Time) and only at ≥ 768 px container width; they stack below. Details in part 8.

**React.**

```tsx
<Field label="Phone number" hint="10-digit mobile, like 98765 43210" error={errors.phone?.message}
       optional={false} count={undefined}>
  <PhoneInput name="phone" autoComplete="tel-national" />
</Field>
// With react-hook-form: <FormField control={form.control} name="phone" label=… render={({ field }) => <PhoneInput {...field} />} />
```

`Field` renders Radix `Label`, the hint and the error, and passes `id`, `aria-describedby`, `aria-invalid` and `required` to its child through context, so a bare `<Input>` outside a `Field` is a lint error.

### 3.2 TextInput (the field box)

**Purpose.** Single-line free text: names, emails, URLs, subdomains, flow names. Specialised inputs below reuse this box.

**Anatomy.** `box` (the bordered container, `position: relative`) · `leading` slot (icon or prefix text) · `input` · `trailing` slot (clear button, unit, suffix text, `Kbd`, password toggle, async status).

| Property | Value |
|---|---|
| Height | `sm` `--field-h-sm` 28 · 24 · 36 (44 hit) (toolbars on data surfaces only) · **`md` `--field-h` 32 · 28 · 44 (default)** · `lg` `--field-h-lg` 40 · 40 · 44 (auth, setup, top-up) |
| Fill · border · radius | `--surface` · 1 px `--control` (≥ 3.06:1 on every plane, F §3.4) · `--radius-6` |
| Text | `font-size: var(--field-font)` with the `body-14` line height: 14 px on desktop, **16 px on touch and phones** (no iOS zoom). Sans, `--text`. Never mono, except API-key and id values (F-VIS-018) |
| Padding-inline | `--field-px` 10 (12 touch). With a leading icon: icon at `--field-px`, text starts at `calc(var(--field-px) + var(--icon-md) + var(--space-8))` = 34 px, so an icon can never overlap text (F-VIS-019) |
| Adornments | Icons `--icon-md` 16 in `--text-3`; prefix and suffix text `data-13` `--text-2`; a prefix that is a separate segment (+91) gets a 1 px `--border` divider |
| Placeholder | `--text-3` (5.62 / 5.88:1), optional, an example ending in "…" |

**States.**

| State | Rule |
|---|---|
| Hover (fine pointer) | Border `--text-3` |
| Focus-visible | Global outline on the **box**: `box:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px }`. Border unchanged. Text inputs match `:focus-visible` on click too, which is intended: typing needs a visible target |
| Invalid | Border `--danger-border`; the error line replaces the hint. Focused and invalid: red border plus the blue focus ring |
| Disabled | Fill `--surface-2`, border `--border-strong`, text and placeholder `--text-dis`, `cursor: not-allowed`; the reason in the hint (§1.6) |
| Read-only | Fill `--surface-2`, border `--border`, text `--text`; focusable, selectable; optional trailing Copy icon button |
| Async check | Hint becomes "Checking availability…", then "Available" (`--text-2` with a check icon) or the error. No spinner inside the box, no green border (P2) |
| Autofilled | Keeps `--surface` via the inset rule in §1.8 |

**Behaviour.** Never block typing or paste (WIG F2); trim leading and trailing spaces on blur, not while typing; `spellcheck="false"` on emails, URLs, ids and subdomains; `enterkeyhint` set (`next`, `done`, `search`, `send`). Enter in a single-field form submits it. A clear button appears only on search and filter inputs.

**Common configurations.**

| Field | Attributes |
|---|---|
| Email | `type="email" autocomplete="email" spellcheck="false"`; validated as "name@domain.tld" on blur: "Enter an email address, like name@company.com." |
| URL (webhook, website) | `type="url" inputmode="url" spellcheck="false"`; `new URL()` + `https:` required: "Enter a full URL starting with https://." (F-QA-021) |
| Flow name, meeting title | Required, trimmed, unique per workspace (409 from the server maps to "A flow called 'Site-visit qualifier' already exists. Choose another name."); an empty title never falls back to the placeholder or to an identical default (F-FLOW-015, F-UX-037) |
| Subdomain | Suffix `.vaanilabs.in` as trailing text; async availability check on blur |

**Responsive.** Full width of its column at every breakpoint. Below 768 it becomes 44 px tall with 16 px text; the column is the whole screen minus `--page-margin` (16). Adornment icons stay 16 px.

**Resolves:** F-VIS-018, F-VIS-019, F-A11Y-006 (inputs), F-A11Y-020, F-UX-025, F-RWD-018, F-FLOW-015 (names), F-UX-037 (titles).

**React.** `<TextInput leadingIcon={Mail} trailing={<span>.vaanilabs.in</span>} size="md" />` inside a `Field`. A native `<input>` inside a `div` (the box); the box styles itself with `:has(input:focus-visible)`, `:has([aria-invalid="true"])` and `:has(input:disabled)`.

### 3.3 PasswordInput

**Purpose.** Sign-in, sign-up, password change. **Anatomy:** TextInput + trailing show/hide toggle + (sign-up only) a live rules list + Caps Lock notice.

| Part | Spec |
|---|---|
| Input | `type="password"`; `autocomplete="current-password"` (sign-in) or `"new-password"` (sign-up, change). Paste allowed. **No placeholder** (today's "••••••••" looks like a saved password, F-A11Y-025) |
| Toggle | A tertiary IconButton in the trailing slot, square and 6 px shorter than the field (26 px standard, 38 touch), inset so it sits 3 px from the box edge, radius `--radius-4`; its hit area is the full field height (≥ 24; 44 on touch). `eye` / `eye-off` at 16. `aria-label="Show password"` / `"Hide password"`, `aria-pressed`, `aria-controls` → input. Its focus ring uses `--focus-offset-inset` (−2 px) so it draws inside the box. Toggling keeps focus and caret position |
| Rules (new passwords) | A list under the field, one line per rule from the auth service ("At least 10 characters", "Not a common password"), each with `check` in `--success-text` or `circle` in `--text-3` plus the words "met" / "not yet" for screen readers; updated live while typing (the one place live feedback beats blur, because it helps rather than scolds). Announced only on submit failure |
| Caps Lock | "Caps Lock is on" in the hint row (`meta-12` `--text-2`) while `getModifierState('CapsLock')` is true during focus |

**Resolves:** F-A11Y-025, F-QA-030, F-A11Y-006 (toggle focus), F-A11Y-023 (16 px toggle).

**React.** `<PasswordInput purpose="sign-in" | "new" rules={serverRules} />`.

### 3.4 NumberInput

**Purpose.** Bounded integers and decimals: retries ("1–5 attempts"), silence timeout, slide count, per-minute rate limits, thresholds. Money uses CurrencyInput (part 4); phone numbers are not numbers.

**Anatomy.** TextInput box · value · optional unit suffix (`s`, `min`, `/ min`, `%`) in `--text-2` · optional attached stepper (two `sm` tertiary icon buttons, `minus` and `plus`, sharing the box edge with a 1 px `--border` divider) · hint stating the range.

**Behaviour.**
- RAC `NumberField`: a text input with `inputmode="numeric"` (or `"decimal"` when `step` < 1) that RAC exposes as a spinbutton (`aria-valuenow`, `-min`, `-max`) where the platform supports it; locale `en-IN` grouping; `↑`/`↓` step, `PageUp`/`PageDown` step × 10, `Home`/`End` min/max. Wheel scrolling never changes the value.
- **The range is always visible** in the hint ("1 to 5 attempts") (F-FLOW-015).
- Out-of-range or non-numeric input stays as typed and shows the error on blur: "Enter a number from 1 to 5." **Never clamp or rewrite silently** (today 0 becomes 1 and 999 is accepted: F-QA-021, F-FLOW-015). Stepper buttons stop at the bounds and show their disabled state.
- In the flow inspector an invalid value is kept in the field but not committed to the graph; the validator reports the step as invalid until it is fixed (F-FLOW-015).

**Sizes.** Width `--field-w-short` (180) by default. **Responsive:** the stepper buttons become 44 px square on touch.

**React.** `<NumberInput minValue={1} maxValue={5} step={1} unit="attempts" showStepper />`.

### 3.5 SearchInput

**Purpose.** Page-level search on Leads, Call reports, Knowledge and Flows, and the search box inside listbox popovers. **Don't use** for the global Search-or-jump (`⌘K`, shell spec).

**Anatomy.** Box · leading `search` icon (16, `--text-3`) · input (`type="search"`, `enterkeyhint="search"`) · trailing: `Kbd` hint "/" **or** clear button (`x`, `sm` tertiary IconButton "Clear search") · visually hidden `<label>` when no visible label ("Search leads"; F-A11Y-003 found Knowledge and Call reports search unlabelled).

| Property | Value |
|---|---|
| Width | ≥ 1024: `--size-menu-max` (320) in a toolbar; 768–1023: flexible (`flex: 1 1 auto`), never below 180 (`--size-menu-min`); **< 768: its own full-width row** above filters (F-RWD-009 measured 52 px at 360) |
| Kbd hint | "/" in a 20 px keycap; shown only when the field is empty and unfocused, the pointer is fine, and single-key shortcuts are on. Hidden on touch |
| Placeholder | What it searches: "Search name, phone or city…", "Search transcripts and summaries…". Short enough not to truncate at 320 |

**Behaviour.**
- `/` focuses the page search from anywhere except inside another field; `aria-keyshortcuts="/"` on the input. The shortcut is off when the user turns single-key shortcuts off (F-A11Y-004), and then the hint disappears.
- Typing queries the **server** (Call reports search covered only 50 loaded rows, F-QA-005), debounced by `--timing-validate-debounce` (300 ms); the query lives in the URL (`?q=`) so reload, Back and deep links keep it (F-UX-031, F-QA-016).
- `Esc` clears a non-empty query; a second `Esc` blurs. The clear button returns focus to the input.
- Result counts are announced politely once the results settle, throttled to `--timing-announce-throttle` (2 s): "24 leads match".
- While results load, the results region shows its skeleton after 200 ms; the input shows no spinner.

**ARIA.** Wrap page search in `<form role="search">` (a landmark); the input is `type="search"` with its label. Inside a popover the search input drives a listbox with `aria-controls` and `aria-activedescendant` (part 5).

**Resolves:** F-RWD-009, F-A11Y-003 (search), F-A11Y-004 (hint and shortcut scope), F-VIS-032 (hint rendering), F-QA-005 (server search), F-UX-031.

**React.** `<SearchInput label="Search leads" shortcut="/" value={q} onChange={setQ} />`.

### 3.6 Textarea

**Purpose.** Multi-line text: a task goal, notes, a meeting brief, agent instructions, the Assistant composer. Prompt fields that support `{{variables}}` use the Flow Designer's PromptField, which is this component plus a variable picker (`{{` opens a combobox of known variables; unknown ones are flagged: F-FLOW-028).

| Property | Value |
|---|---|
| Box | As TextInput: `--surface`, 1 px `--control`, `--radius-6`; padding `--space-8` block, `--field-px` inline |
| Text | `body-14` (16 on touch), line height 20 (24 on touch) |
| Height | `rows` default 3; grows with content (`field-sizing: content`, JS fallback) to `maxRows` (default 12), then scrolls inside. Never a fixed tiny box whose placeholder is clipped (F-RWD-015) |
| Resize | `resize: vertical` on desktop only when not auto-growing |
| Count | When there is a limit: "1,240 of 6,000" in the hint row. Typing past the limit is allowed; the field turns invalid ("Shorten this by 120 characters.") so pasting a long text is never truncated silently. Count changes are announced only when crossing 90 % and 100 %, not per keystroke |

**Composer mode** (Assistant): one row, grows to 5 rows; `Enter` sends and `Shift+Enter` adds a line on fine pointers, with the hint "Enter to send · Shift+Enter for a new line" shown once (WIG F8); on touch, `Enter` adds a line and the Send button sends. Placeholder "Ask Vaani…" (F-RWD-015). The Send button is an IconButton `arrow-up` labelled "Send"; the composer stays above the on-screen keyboard (`visualViewport`).

**Validation.** A required goal or brief cannot be only spaces: "Describe the goal in a sentence." on submit (F-UX-039, F-UX-037). Esc inside a dialog with a dirty textarea asks "Discard draft?" (F-UX-025).

**Resolves:** F-A11Y-003 (GOAL textarea, composer), F-UX-039, F-RWD-015, F-FLOW-028 (via PromptField).

**React.** `<Textarea rows={3} maxRows={12} maxLength={6000} countMode="soft" />`; `<Composer onSend={…} />` is a separate wrapper.

---

## 4. Indian inputs: phone and money

### 4.1 PhoneInput (+91)

**Purpose.** Enter a number that the product will call, verify, message or store: a lead's phone, "Call yourself", the Cockpit's Ready-to-call contact, a transfer target, the caller ID being verified, a profile phone. Today every one of these accepts "abc", validates only after the click, or reports the error 450 px away (F-QA-020, F-QA-021, F-UX-025, F-FLOW-015).

**Use when** the value is a phone number. **Don't use** for displaying a stored number (use the display group's `PhoneText`, masked `+91 •••••• 4821` in Hanken with tabular figures, data-nav §5.8), or for an inbound number the workspace owns (that is chosen from a Select of provisioned numbers).

**Anatomy.**

| Part | Spec |
|---|---|
| `prefix` | A segment inside the box: "+91" in `data-13` `--text-2`, padded `--field-px`, separated from the number by a 1 px `--border` divider. Static (not focusable) by default. With `allowInternational`, it becomes a compact trigger ("IN +91 ▾", no flags or emoji) that opens a searchable country list (Combobox, part 5) with India pinned first |
| `input` | The national number. Sans `body-14` (16 on touch) with `tabular-nums`; never mono (mono is for masked display only, F §2.3) |
| `trailing` | Optional: a clear button on the Cockpit contact field; an async status word ("Already a lead · Open") |
| `hint` | "10-digit mobile, like 98765 43210" (the example lives here, not in a placeholder) |

Box, height, border and states are TextInput's (part 3). Width `--field-w-medium` (320).

**Behaviour.**

| Situation | What happens |
|---|---|
| Typing | Digits, spaces, hyphens, dots and brackets are accepted as typed; nothing is inserted under the caret. Letters are kept (never block typing) and flagged on blur |
| Paste | Any common format is accepted and normalised: `+91 98765 43210`, `+919876543210`, `09876543210`, `91-98765-43210`, `(098765) 43210`. A leading `+91`, `91` (12 digits) or `0` (11 digits) moves into the prefix, so the field never shows "+91 +91" |
| Blur | Parse with `libphonenumber-js` (region `IN`). Valid: display grouped as `98765 43210` (mobiles 5-5; landlines by STD code, `80 4567 2210`). Invalid: keep the text as typed and show the error |
| Value | The form value is E.164 (`+919876543210`), never the display string. Empty stays empty (not "+91") |
| Type rules | `kind="mobile"` (OTP, WhatsApp, "Call yourself"): 10 digits starting 6–9. `kind="any"` (lead phone, transfer target): any valid Indian number. `allowInternational` only where a foreign number is legitimate (transfer to an overseas office) |
| Async checks | Lead forms check duplicates on blur: hint "This number is already a lead. **Open lead**" (link), without revealing the other lead's name to users who cannot see it. Verify flows send the code only after the number is valid |

**Error copy.** "Enter a 10-digit mobile number, like 98765 43210." · "Enter a phone number with its STD code, like 80 4567 2210." · "This number has 9 digits. Mobile numbers have 10." (a specific count beats a generic message) · for international: "Enter the number with its country code, like +971 50 123 4567."

**Masking and permissions.** Users who may not see full numbers never get an editable phone field: they see `PhoneText` masked (`+91 •••••• 4821`) in a read-only field with the hint "Only admins can see full numbers." Editing an existing number shows it unmasked only to users with that permission.

**States.** TextInput's, plus: *verifying* (hint "Sending code…" then the OTP field appears below; the phone field becomes read-only with a "Change number" link); *verified* (read-only, hint "Verified 21 Sep 2026" with a `check` icon in `--success-text`; green is allowed because verification is a real, computed state, P2).

**ARIA.** `type="tel" inputmode="tel"`, `autocomplete="tel-national"` when the prefix is static (the browser fills the national part) or `"tel"` with the international picker; `aria-describedby` → hint or error. The static prefix is part of the visible label context; the label reads "Phone number" and the input's description includes "Indian number, +91" (visually hidden) so screen-reader users know not to type the code.

**Responsive.** ≥ 768: 320 wide. < 768: full width, 44 tall, 16 px text; the prefix stays inside the box. The phone keypad opens (`inputmode="tel"`).

**Cockpit Ready-to-call** (D §6.2): the contact field is a Combobox that searches leads by name or number; typing digits switches it to a PhoneInput value. `Place call…` (primary) opens the Call gate; an invalid number shows the field error on click and focuses the field; it never dials.

**Resolves:** F-UX-025, F-QA-020, F-QA-021 (phone), F-FLOW-015 (transfer "abc"), F-UX-012 (profile phone, E.164 with +91 default), F-UX-026 (unlabelled tel field).

**React.**

```tsx
type PhoneInputProps = {
  value: string | null;            // E.164 or null
  onChange: (e164: string | null, meta: { valid: boolean; display: string }) => void;
  kind?: 'mobile' | 'any';         // default 'any'
  allowInternational?: boolean;    // default false (static +91)
  defaultRegion?: 'IN';
  onDuplicateCheck?: (e164: string) => Promise<{ exists: boolean; href?: string }>;
} & Omit<TextInputProps, 'value' | 'onChange' | 'type'>;
// zod: phoneIN = z.string().refine(v => isValidPhoneNumber(v, 'IN'), 'Enter a 10-digit mobile number, like 98765 43210.')
```

### 4.2 CurrencyInput (INR)

**Purpose.** Enter rupees: wallet top-up, autopay amount and threshold, a spend or call cap, a price in a flow variable. Today the top-up takes 0, −50 and 9,99,99,999, rewrites 0 to 1, and is labelled only by the placeholder "Top-up ₹" (F-UX-021, F-QA-021, F-A11Y-020).

**Anatomy.**

| Part | Spec |
|---|---|
| `label` | A noun: "Top-up amount", "Top up when the balance falls below" |
| `prefix` | "₹" inside the box in `data-13` `--text-2`, `aria-hidden`; the rupee renders from the "Vaani Rupee" face through `--font-sans` (F §2.1) |
| `input` | Sans `body-14` (16 on touch), `tabular-nums`, right-aligned only inside tables; left-aligned in forms |
| `hint` | The bounds, always: "Minimum ₹100 · maximum ₹1,00,000" (F-QA-021). For top-ups, a second line computed from the real rate: "Adds about 3 h 20 min of calls" (D §6.6) |
| `presets` (optional) | A SegmentedControl (single choice, part 6) above the input: `₹100` `₹500` `₹1,000`, labelled "Choose an amount" |

Box and states are TextInput's; width `--field-w-medium` (320); `lg` height inside the Top-up sheet.

**Behaviour.**
- **Integers by default** (top-ups and caps): `inputmode="numeric"`. `allowDecimals` (prices, rates) switches to `inputmode="decimal"` with 2 places.
- **Parsing** strips `₹`, `Rs`, `INR`, spaces and commas, so "Rs 1,000" and "1000" are the same value. Formatting to en-IN grouping (`1,00,000`) happens **on blur**, never under the caret.
- **Validation on blur and on submit:** "Enter an amount from ₹100 to ₹1,00,000." for out-of-range, "Enter the amount in whole rupees." for decimals where not allowed, "Enter an amount, like 500." for non-numbers. Values are **never clamped or rewritten** (F-QA-021).
- **Presets and the input stay in sync:** choosing `₹500` fills 500; typing 500 selects the `₹500` preset; typing 750 clears the preset selection.
- **The action names the amount:** "Pay ₹500 via UPI" updates as the value changes; while the value is empty or invalid it reads "Pay via UPI" and clicking it shows the field error and focuses the field (F-QA-021, F-UX-021). Only this button is filled in the Top-up sheet; Autopay is a separate secondary card (F-UX-021).
- **Money is shown, not guessed:** no "≈ ₹11" false precision (D §7 item 19); cost lines use ranges from the real rate.

**Display rules** (for the value echoes around the field): balances with 2 decimals (`₹2,340.50`), amounts entered with 0 (`₹500`), en-IN grouping, the full figure in forms, never `₹85 L` short forms in an input (F §2.5).

**ARIA.** The label includes the currency for screen readers through a visually hidden suffix ("Top-up amount, in rupees"); presets are a `radiogroup`; the computed runway line is `aria-live="polite"`, updated at most every `--timing-announce-throttle` (2 s).

**Responsive.** ≥ 768: presets and input on one row when the container is ≥ 560 px, else presets above. < 768: presets as a full-width 3-up segmented row (44 px), the input full width below, the Pay button in the sticky sheet footer, full width.

**Resolves:** F-UX-021, F-QA-021 (amounts), F-A11Y-020 (placeholder-only label), F-A11Y-016 (preset chips without `aria-pressed`).

**React.**

```tsx
type CurrencyInputProps = {
  value: number | null;               // rupees; paise only with allowDecimals
  onChange: (v: number | null) => void;
  minValue?: number; maxValue?: number;
  allowDecimals?: boolean;            // default false
  presets?: number[];                 // [100, 500, 1000]
  runway?: (amount: number) => string | null; // "Adds about 3 h 20 min of calls"
} & FieldProps;
// Built on RAC NumberField, locale 'en-IN', formatOptions { style: 'decimal', maximumFractionDigits: allowDecimals ? 2 : 0 }.
// The ₹ is the separate aria-hidden prefix, so the input never shows it twice.
```

---

## 5. Choosing from a list

**Which one?**

| Situation | Component |
|---|---|
| 2–5 short, mutually exclusive options that should all be visible | SegmentedControl or RadioGroup (part 6) |
| Up to about 10 known options, one choice | **Select** |
| Many options, or options the user finds by typing (languages, countries, team members, caller IDs) | **Combobox** |
| Choosing or switching a flow (16+ similarly named flows with versions and live state) | **FlowSwitcher** |
| Several choices from a list (languages, outcomes, tags, assignees) | **MultiSelect** |
| Commands, not values (Export, Duplicate, Delete) | Menu (overlay group) |

### 5.1 Listbox popover (shared by every list control)

| Part | Spec |
|---|---|
| Surface | `--surface-raised`, 1 px `--border-overlay`, `--radius-6`, `--e2`, padding `--space-4`, `z-index: var(--z-popover)` (above modals, so a select inside a gate works, F §9) |
| Width | At least the trigger's width; from `--size-menu-min` (180) to `--size-menu-max` (320); FlowSwitcher and date ranges use `--popover-w-list` (400). Max height: the space to the viewport edge minus `--space-16`, capped at 360 px of options (9 rows), then the list scrolls with `overscroll-behavior: contain` |
| Option row | Min height `--control-h` (32 · 28 · 44); padding-inline `--space-8`; radius `--radius-2` (concentric: 6 outer − 4 padding); label `data-13` `--text`; optional leading icon 16 `--text-2`; optional description on a second line `meta-12` `--text-3` |
| Highlighted (keyboard or pointer) | Fill `--surface-2`. Virtual focus from `aria-activedescendant`, so it is drawn as a fill, not an outline |
| Selected | `check` icon 16 in `--accent-text` at the row's end and label weight 500. Non-colour cue: the check. Highlighted and selected: both |
| Disabled option | Label `--text-dis`; the description says why ("No calling number yet"); still reachable with arrows, not selectable |
| Section header | `label-12` `--text-3`, sentence case, padding `--space-8` inline, `--space-8` top, `--space-4` bottom; sections separated by a 1 px `--border` rule |
| Empty | One line in `data-13` `--text-2`: "No flows match 'kisan'." plus a `link` "Clear search" |
| Loading | Three skeleton rows (`--skeleton`, static, no shimmer) after 200 ms, inside a fixed min-height so the popover does not jump from 280 to 690 px (F-UX-005) |
| Error | "Couldn't load flows. **Retry**" in `data-13`, never an empty list |
| Motion | Open: opacity + 4 px rise (`--shift-popover`) over `--dur-base`; close: opacity over `--dur-fast` |
| Phone (< 768) | The popover becomes a bottom sheet (overlay group) with a title, the search field on top when there is one, 48 px rows (`--row-h`), and a Done button for multi-select. Opening it does not auto-focus the search on phones unless the control is search-first (Combobox, FlowSwitcher) |

Keyboard (all list controls): `↑`/`↓` move, `Home`/`End` first/last, `PageUp`/`PageDown` by 8, typeahead on the first letters (Select), `Enter` chooses, `Esc` closes and returns focus to the trigger, `Tab` closes and moves on (choosing nothing new).

### 5.2 Select

**Purpose.** Pick one value from a short, known list: Language (Auto, Hindi, English, Hinglish…), Status, Direction, Voice when space is tight, "Go to [step ▾]" on every answer in the flow inspector (D §6.5).

**Anatomy.** `trigger` (a field box, §3.2): selected value (truncated with an ellipsis and the full value in a tooltip, F-VIS-013) or the placeholder "Choose…" in `--text-3` · `chevron-down` 16 `--text-3` at the end · `popover` (§5.1).

**Sizes.** Trigger heights as TextInput (`sm` in toolbars, `md` default, `lg` in auth/setup). Minimum trigger width 180 (`--size-menu-min`); a Select never shrinks to 150 px and cuts names mid-word again (F-VIS-013, F-VIS-037).

**States.** Trigger: TextInput's states (hover border `--text-3`, focus outline on the box, invalid, disabled with reason, read-only). Open: the trigger keeps its focus ring while the popover is open only when focus returns to it; `aria-expanded="true"`.

**Behaviour.** Click, `Enter`, `Space`, `↓` or `↑` open the list with the current value highlighted. Typing a letter while the trigger is focused and closed selects the next match (typeahead) without opening. Choosing closes the list and keeps focus on the trigger. Changing a Select never writes an account default or saves remotely by itself; if a choice is persisted, the surrounding form saves it, or the control says so ("Used for this call only · **Make default**", F-UX-014).

**ARIA.** Radix `Select` (wrapped; the option description and disabled reason are our additions): trigger `button` (`role="combobox"` in Radix's implementation) with `aria-haspopup="listbox"`, labelled by the Field label plus the value; `listbox` with `option`s and `aria-selected`. Never a `title`-only name (F-A11Y-003 found `select-name` and `label-title-only` violations). The old native selects' `outline: none` goes (F-A11Y-006).

**Responsive.** Popover ≥ 768; bottom sheet < 768 (§5.1). **Native `<select>` is allowed only** in server-rendered static pages without JS (marketing forms), styled with `color-scheme` so it follows the theme (WIG F6).

**Resolves:** F-A11Y-003 (selects), F-A11Y-006 (select focus), F-VIS-013, F-VIS-018, F-UX-014.

**React.** `<Select label="Language" items={languages} selectedKey={lang} onSelectionChange={setLang} placeholder="Choose…" />`; items `{ id, label, description?, icon?, disabledReason? }`.

### 5.3 Combobox

**Purpose.** One value from a long or searchable list: country code, language (22 options), a lead in the Cockpit contact field, a team member, a caller ID, "Connect to…" (`C`) in the Flow Designer.

**Anatomy.** Field box with the input (type to filter) · trailing `chevrons-up-down` IconButton "Show all options" (opens without typing) · popover listbox (§5.1) with matched text in weight 600 (never colour). `allowsCustomValue` only where free text is valid (tags); otherwise leaving the field with unmatched text restores the last valid value and shows "Choose a language from the list." on submit.

**Behaviour.** Opens on typing or `↓`; filters by "contains", accent- and case-insensitive; Hinglish and Devanagari aliases match ("hindi", "हिन्दी"). `Enter` chooses the highlighted option; `Esc` closes, a second `Esc` clears the text. Remote lists debounce by 300 ms and show the loading rows.

**ARIA.** Radix `Popover` anchored to the field + `cmdk` list: `input role="combobox"` with `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`. cmdk marks the highlighted option with `aria-selected`, so the committed value is carried by the input's text and a visually hidden "(current)" on its option. Results count announced politely ("12 languages").

**React.** `<Combobox label="Transfer to" items={people} allowsCustomValue={false} onInputChange={search} />`.

### 5.4 FlowSwitcher (FlowSelect)

**Purpose.** Choose a flow wherever one is chosen: the Flow Designer header (switch the open flow), Cockpit Ready-to-call (which flow the call runs), the lead sheet and bulk bar ("Assign flow"), Meeting ("Uses flow"), Call reports filters. Today the same 16 flows appear as duplicates, with 6-character hash suffixes in a 150 px, 10 px mono select, and the live flow is described four ways and never named (F-VIS-037, F-UX-005, F-FLOW-012, F-FLOW-014, F-UX-037).

**Modes.**

| `purpose` | Lists | Draft-only flows | Choosing |
|---|---|---|---|
| `switch` (Flow Designer) | Every flow the user can open | Selectable | Navigates to `/flows/{id}`; flushes a pending draft save first; **opening never writes** (F-FLOW-002) |
| `assign` (lead, bulk, meeting, batch) | Every flow | Disabled, with "Not published yet. Publish it to use it for calls." | Sets the form value; the page decides when to save |
| `call` (Cockpit) | Every flow | Selectable **for test calls only**: the option reads "Draft · test calls only" and the Call gate enforces it | Session-only; "Make default" is a separate link (F-UX-014) |

**Trigger.** A field-box button, min width 240 (F-UX-005): flow name (`data-13`/500, **middle truncation** so a disambiguating end survives: "Site-visit qual…(v2)", full name in a tooltip, F-FLOW-012) · state tag (`Live v7` success tag or `Draft` neutral tag, from the display group) · `chevrons-up-down`. In the Flow Designer header the trigger is borderless (a breadcrumb segment) at `sm` height.

**Popover** (`--popover-w-list`, 400 px):

| Region | Spec |
|---|---|
| Search | SearchInput `sm` at the top, placeholder "Search flows by name or number…"; autofocused (search-first) |
| Section "Open now" (switch mode) | The current flow, with a `check` |
| Section "Live" | Flows with a live revision, sorted by last edited, newest first |
| Section "Not published" | Draft-only flows, same sort |
| "Show archived (3)" | A tertiary row that reveals archived flows; hidden by default |
| Footer | Tertiary `New flow…` (opens the template gallery, D §6.5) and a link "All flows" (the Flows page). "Reset to default" never lives here (F-UX-005) |

**Option anatomy** (two lines, min height 48: padding `--space-6` block):
- Line 1: name (`data-13`/500, `translate="no"`, middle-truncated) · on the right, the tags `Live v7` (success) and/or `Draft · 3 changes` (neutral) or `AI draft` (neutral).
- Line 2 (`meta-12` `--text-3`): "Edited 3 days ago · 14 steps · Inbound +91 80 •••• 2210" (where it answers a number) or "· Outbound batch" (where it is used). The number is `PhoneText` (masked, tabular figures; data-nav §5.8).
- If two flows still share a display name (legacy data before unique names ship), line 2 starts with the short id `flow_7c21` in `mono-12`, never a bare hash (F-FLOW-012, F-VIS-037).

**Behaviour.** Keyboard per §5.1, with search-first typing. Matches name, id, version ("v7") and number suffix. Up to 200 flows render in a virtualised list. The popover remembers nothing between opens except the "Show archived" choice for the session.

**ARIA.** Trigger: `button` with `aria-haspopup="dialog"` (the popover holds a search field and a listbox) and the name "Flow: Site-visit qualifier, live version 7. Change flow". Inside: SearchInput with `aria-controls` → `listbox`; sections are `role="group"` labelled by their headers; each option's second line is its `aria-describedby`; disabled options expose the reason.

**Responsive.** ≥ 768: popover, 400 px, anchored below the trigger (flipping above when needed). 768–1023 in the Flow Designer's review mode: same. < 768: full-height sheet titled "Choose a flow" with the search on top and 56 px two-line rows.

**Resolves:** F-VIS-037, F-UX-005, F-FLOW-012, F-FLOW-014 (live marker, resolved per trigger), F-UX-014, F-UX-037 (meeting flow named), F-FLOW-002 (switching writes nothing).

**React.**

```tsx
type FlowSwitcherProps = {
  purpose: 'switch' | 'assign' | 'call';
  value: FlowId | null;
  onChange: (id: FlowId) => void;      // switch mode: router.push handled by the caller after flushing saves
  flows: FlowSummary[];                // { id, name, shortId, live?: { version, since, usedBy: string[] }, draft?: { changes }, isAiDraft, stepCount, editedAt, archived }
  isLoading?: boolean; error?: string; onRetry?: () => void;
  onCreate?: () => void;               // "New flow…"
};
// Radix Popover + cmdk (Command, Command.Input, Command.List, Command.Group per section, Command.Item) – the same engine as the
// Search-or-jump palette (overlay spec). shouldFilter={false} when flows are searched on the server; virtualise past 200 items.
```

### 5.5 MultiSelect

**Purpose.** Several values from one list: Leads filter "Language: Hindi, English" (the FilterToken in the data group opens this list), Knowledge tags, notification recipients, a batch's allowed languages. Today multi-choice chips have no state semantics and overflow off-screen (F-A11Y-016, F-RWD-012).

**Anatomy.**
- **Trigger in a form:** a field box that shows the chosen values as removable tokens (the display group's Tag, 20 px, radius 4, with an `x` IconButton "Remove Hindi") wrapping onto at most 2 lines, then "+ 4 more"; an empty trigger shows "Choose languages…" in `--text-3`; `chevrons-up-down` at the end.
- **Trigger as a filter:** the FilterToken (`Language  Hindi, English  ×`) from the data group.
- **List:** listbox popover (§5.1) with a 16 px checkbox visual at the start of each option (the Checkbox box, part 6, drawn `aria-hidden` because the option itself carries the state); a SearchInput on top when there are more than 8 options; a footer with "Select all (12)" and "Clear" (tertiary `sm`), and a count "2 selected".

**Behaviour.** `Space` or `Enter` toggles the highlighted option and keeps the list open; `Esc` or clicking outside closes. In the form trigger, `Backspace` in an empty trigger does nothing destructive (removing values is explicit through each token's `x`). An optional `maxSelected` shows "2 of 3 chosen" and disables the rest with that reason. Filters apply as the user toggles and write to the URL; form values save with the form.

**ARIA.** A standalone RAC `ListBox` (`selectionMode="multiple"`) inside a Radix `Popover`, filtered by the SearchInput above it: `aria-multiselectable="true"`, each option `aria-selected`; the trigger's name includes the summary ("Languages: Hindi, English"). Token remove buttons are real buttons with specific names.

**Responsive.** Tokens wrap inside the field at every width; on phones the list is a sheet with a Done button and 48 px rows; the checkbox visual stays 16 px inside a 44 px row.

**Resolves:** F-A11Y-016 (multi-choice state), F-RWD-012 (filters overflow: one list instead of chip rows), F-A11Y-003.

**React.** `<MultiSelect label="Languages" items={langs} selectedKeys={set} onSelectionChange={setSet} maxSelected={undefined} />`.

---

## 6. Choice controls

All four share the selected treatment for their mark: fill `--accent`, 1 px `--accent-mark` border, glyph `--on-accent`. In light `--accent-mark` equals `--accent`, so the border is invisible; in dark it draws a light Neel (`neel-400`) edge around the deeper `neel-600` fill, which lifts the checked mark to ≥ 3:1 against the dark planes (the fill alone is 2.9:1, F §3.2). The glyph on the fill is 7.68 / 6.21:1. Marks carry `data-mark` for forced colours.

### 6.1 Checkbox

**Purpose.** An independent yes/no that takes effect when the form is saved (a consent, a scope, "Include called-today leads"), row selection in tables, and multiple choice in a group. **Don't use** for a setting that applies immediately (Switch) or for one-of-many (Radio).

**Anatomy.** `box` · `glyph` (`check`, or `minus` when indeterminate) · `label` · optional `description` · group `legend`, `hint` and `error`.

| Part | Spec |
|---|---|
| Box | 16 × 16 (`--space-16`), `--radius-4`, 1 px `--control` on `--surface` (3.66 / 3.71:1; ≥ 3.06 on every plane including selected rows) |
| Glyph | Lucide `check` / `minus` at `--icon-xs` (12), stroke `--icon-stroke`, `--on-accent` |
| Label | `body-14` `--text` in forms; `data-13` in dense lists; gap to the box `--space-8`; the whole label is clickable |
| Description | `meta-12` `--text-3`, aligned with the label text |
| Hit area | Box + label; at least 24 × 24 (`::after`), 44 on touch (F-A11Y-023) |

**States.**

| State | Box | Label |
|---|---|---|
| Unchecked | `--surface`, border `--control` | `--text` |
| Hover (fine pointer) | border `--text-3` | |
| Pressed | fill `--surface-3` | |
| Checked / indeterminate | fill `--accent`, border `--accent-mark`, glyph `--on-accent`; hover fill `--accent-hover`, pressed `--accent-press` | |
| Focus-visible | 2 px `--focus` outline, 2 px offset **on the box** (F-A11Y-006: today the focus goes to a 1 × 1 hidden input and nothing shows) | |
| Invalid (a required consent) | border `--danger-border`; group error under the legend | |
| Disabled | fill `--surface-2`, border `--border-strong`, glyph `--text-dis` | `--text-dis` + the reason in the description |
| Read-only | as disabled, but the label stays `--text` | |

**Behaviour.** `Space` toggles; `Tab` moves between checkboxes (each is a stop). Clicking the label toggles. Indeterminate is visual only (a parent whose children are mixed); activating it checks all. Checking is instant: no animation beyond the `--dur-fast` colour change.

**Group.** `<fieldset>` + `<legend>` (`label-13`), options stacked with `--space-8` (touch: 44 px rows, no extra gap); horizontal only for ≤ 3 short options. Group error sits under the legend so it is read before the options.

**Table selection** (with the data group): the header checkbox is tri-state, named "Select all 50 on this page"; each row checkbox is named "Select" plus the row's primary text (on Leads, the lead's name), never a row number and never unnamed (F-A11Y-003 found 25 unnamed checkboxes). Hit area 24 minimum (F §14).

**ARIA.** Radix `Checkbox`: a `button role="checkbox"` that *is* the visible box, so `:focus-visible` lands on the square itself (never a 1 × 1 hidden input); `data-state` and `aria-checked` are `checked`, `unchecked` or `indeterminate` / `mixed`; the label is a Radix `Label`; `aria-describedby` → description or error.

**Responsive.** Same box at every width; rows grow to 44 px on touch; long labels wrap under themselves (not under the box).

**Resolves:** F-A11Y-006 (checkbox focus), F-A11Y-003 (unnamed checkboxes), F-A11Y-023.

**React.** `<Checkbox isIndeterminate={…} description="…">Include leads called today</Checkbox>`; `<CheckboxGroup label="Scopes" …>`.

### 6.2 Radio and RadioCard

**Purpose.** One choice from 2–6 options that should all be visible, with their consequences: autopay mode, meeting privacy, export format, "When a lead was called today: Skip / Include". **Round is intended:** the circle is how people recognise "one of many". This adds radios to F §6's full-radius list (open question 4).

**Radio anatomy.** `circle` 16 × 16, `--radius-full`, 1 px `--control` on `--surface` · checked: fill `--accent`, 1 px `--accent-mark`, inner dot 6 px (`--space-6`) `--on-accent` · label and description as Checkbox. States mirror Checkbox (hover border `--text-3`; focus outline on the circle, offset 2; disabled `--surface-2` / `--border-strong` with the reason).

**RadioCard.** For choices that need a sentence each (Meeting privacy "Open meeting" / "Encrypted meeting", the Call gate's "Place now" / "Schedule", VoiceChoice below):

| Part | Spec |
|---|---|
| Card | `--surface`, 1 px `--border-strong`, `--radius-8`, padding `--space-12` block × `--space-16` inline; the radio circle at the start; title `title-14`; description `meta-12` `--text-3` (never 2.2:1 grey on grey, F-UX-039) |
| Hover | fill `--surface-2` |
| Selected | selection treatment: fill `--accent-soft`, 1 px `--accent-mark` border, the radio checked. Text stays `--text` / `--text-3` (≥ 4.69:1 on the soft fill) |
| Focus-visible | outline on the card, offset 2 |
| Disabled | fill `--surface-2`, text `--text-dis`, the reason as the description |
| Layout | Cards in a row at ≥ 768 when there are 2–3 (equal widths, `--space-12` gap); stacked below 768 or when there are more |

**Behaviour.** One tab stop for the group (the checked option, or the first); `↑`/`↓`/`←`/`→` move **and select** (standard radio behaviour); `Space` selects the focused option. A radio group always has a checked value unless the question genuinely has no default; then it has none, and submit reports "Choose who can join."

**ARIA.** Radix `RadioGroup`: `role="radiogroup"` with its label; each item `role="radio"` with `aria-checked` and roving focus. RadioCard wraps the whole card in the `RadioGroup.Item`. Encryption-style choices say the consequence in the description ("Guests enter a key before joining. You'll get the key after creating the room.", F-UX-037).

**Resolves:** F-A11Y-016 (Meeting privacy, session mode without radio semantics), F-UX-037.

**React.** `<RadioGroup label="Who can join" orientation="horizontal" variant="card" items={[{ id, title, description, disabledReason }]} />`.

### 6.3 Switch

**Purpose.** A setting that **applies immediately** when flipped: notification toggles, "Show test calls", "Keyboard shortcuts", "Minimap". **Don't use** inside a form that has a Save button (Checkbox), for a two-way mode choice (SegmentedControl), or for anything that bills or goes live (a Button through a gate: Autopay needs a mandate, so it is a button, not a switch).

**Anatomy.** `track` 32 × 20 (`--space-32` × `--space-20`), `--radius-full` (allowed, F §6) · `thumb` 16 × 16 (`--space-16`), inset `--space-2`, travel 12 px · `label` · optional `description` · status line (saving, error).

| State | Track | Thumb |
|---|---|---|
| Off | fill `--control` (≥ 3.06:1 on every plane, F §3.4) | `--on-accent` (white, both themes) at the start |
| On | fill `--accent`, 1 px `--accent-mark` border | `--on-accent` at the end |
| Hover (fine pointer) | off: `--text-3`; on: `--accent-hover` | |
| Focus-visible | outline on the track, offset 2 | |
| Disabled | fill `--surface-3`, border `--border-strong` | `--surface` · label `--text-dis` + reason |
| Saving | the new position shows immediately (optimistic); `aria-busy`; status line "Saving…" in `meta-12` `--text-3` | |
| Saved | status line "Saved" for the toast duration, or a "Saved" toast for settings pages (F-UX-012) | |
| Failed | the switch returns to its previous position and the status line reads "Couldn't save. **Retry**" in `--danger-text`, `role="status"` (F-UX-014: today it reverts silently after reload) | |

**Layout.** Settings rows: label (`body-14` `--text`) and description (`meta-12` `--text-3`) on the left, the switch at the row's end, row height ≥ 40 (48 on touch), rows divided by 1 px `--border`. The label says what it controls ("Keyboard shortcuts"), not the state or an action ("Enable…"); the role announces on/off. No "ON"/"OFF" text.

**Motion.** Thumb `transform: translateX()` over `--dur-fast` `--ease-standard`; track colour over `--dur-fast`; instant under reduced motion.

**ARIA.** Radix `Switch`: `button role="switch"` with `aria-checked` (the track is the button, so focus lands on it); label linked with Radix `Label`. The theme control is **not** a switch: it is a System / Light / Dark radio menu in the account menu (F-VIS-032).

**Resolves:** F-UX-012 (switches autosave with feedback and rollback), F-UX-014, F-VIS-032, F-A11Y-016.

**React.** `<Switch isSelected={on} onChange={save} description="…" status={saveState} onRetry={retry}>Show test calls</Switch>`.

### 6.4 SegmentedControl (toggle group)

**Purpose.** Switch between 2–5 short, mutually exclusive modes or views **in place**: density Standard/Compact, Analytics range 7 days / 30 days / 90 days, Meeting session mode Presentation / Conversation flow, amount presets, voice Vaani / Vikash when space is tight. **Don't use** for page navigation (Tabs, data group), more than 5 options (Select), or options that need a sentence each (RadioCard). A multi-toggle variant (independent on/off buttons in one strip, `aria-pressed`) exists for toolbars ("Agent · Intel · Record" panels).

**Anatomy.** `track` (`--surface-2` fill, 1 px `--border`, `--radius-6`, padding `--space-2`, gap `--space-2`) · `items` (text, optional 14 px icon) · optional `description` under the control that changes with the selection (session mode).

| Property | Value |
|---|---|
| Track height | `md` = `--control-h` (32 · 28 · 44), so it aligns with buttons and fields; `sm` = `--control-h-sm` |
| Item height | `calc(track − 2 × --space-2 − 2 × --bw-hairline)`: 26 (md), 22 (sm), 38 (touch) |
| Item padding · type | `--space-10` inline · `label-13` (`label-12` for `sm`) · `--text-2` |
| Item radius | `--radius-4` (concentric with the 6 px track) |
| Selected item | fill `--surface`, 1 px `--control` border (≥ 3:1, so the chosen key is identifiable without colour), `--e1` in light, label `--text` |
| Hover (unselected) | label `--text`, fill `--surface-3` |
| Focus-visible | outline on the item, offset 2 |
| Disabled item | label `--text-dis`, reason in the tooltip |
| Widths | Intrinsic by default; `fullWidth` gives equal columns (phones, preset amounts) |

**Behaviour.** Single-select is a radio group: one tab stop; arrow keys move and select; the selection is immediate (it is a view change, not a commit). A range or view choice lives in the URL (`?range=30d`) and the page labels its scope ("Last 30 days"), so it is clear which sections it changes (F-UX-036). Changing a segment never writes an account default (F-UX-014).

**ARIA.** Radix `ToggleGroup` `type="single"` (items `role="radio"` + `aria-checked`, roving focus; the wrapper adds `data-selected` for forced colours and ignores the empty value Radix emits when the active item is clicked again, so there is always a selection); the multi-toggle strip uses `type="multiple"` (buttons with `aria-pressed`) (F-A11Y-016).

**Responsive.** Items never truncate. A container query switches the control when it no longer fits: 2–3 options become full-width equal columns; if a label would still wrap (Meeting's "Presentation (generate or show a deck)"), the control renders as a stacked RadioGroup instead (F-RWD-006). On touch, items are 38 px inside a 44 px track and each item's hit area is the full track height (F-A11Y-023: today's 36 × 24 period toggle).

**Resolves:** F-A11Y-016, F-UX-036, F-RWD-006, F-VIS-016 (square 0-radius segments), F-A11Y-023.

**React.** `<SegmentedControl label="Range" items={[{ id: '7d', label: '7 days' }, …]} selectedKey={range} onSelectionChange={setRange} size="sm" />`; `<ToggleStrip label="Panels" items={…} selectedKeys={…} />` for the multi variant.

**VoiceChoice (recipe).** The Cockpit's voice picker (D §6.2) is a RadioCard group of two, not a bare "Vaani | Vikash" toggle: each card has the 32 px voice tile (`--size-avatar-voice`, the ink tile with the initial), the name (`title-14`), "Female · warm · Hindi + English" (`meta-12` `--text-3`) and a `sm` tertiary IconButton "Hear Vaani" (`play` / `square`, `aria-pressed` while playing; one preview plays at a time). Under the group: "Used for this call only · **Make default**" (F-UX-014). In tight spots (the lead sheet) it collapses to a SegmentedControl with the descriptor as the description line.

### 6.5 Slider

**Purpose.** A bounded value where the approximate position matters and the range is small: an API key's rate limit (1–600, recommended 60), silence before "No reply" (2–15 s), voice-verification thresholds in Flow settings. **Always pair** it with a NumberInput when exact values matter (ranges over 20 steps). **Don't use** for money, phone numbers or anything with legal or billing weight.

**Anatomy.** `label row` (label + the current value as an `<output>` at the row's end: "60 / min", `data-13` `tabular-nums`) · `track` · `range` (filled part) · `thumb` · optional `marks` (a recommended value) · `hint` (what the value means: "Requests above this get HTTP 429.").

| Part | Spec |
|---|---|
| Track | 4 px (`--space-4`) tall, `--radius-2`, `--surface-3` |
| Range | `--accent-mark` (≥ 7.5:1: the fill carries the value) |
| Thumb | 16 × 16, `--radius-4` (a machined key, not a pill), fill `--surface`, 1 px `--control`, `--e1`; hover border `--text-3`; dragging border `--accent-mark`; focus outline on the thumb, offset 2; hit area 24 (44 touch) |
| Mark | a 2 × 8 px tick (`--bw-strong` × `--space-8`) in `--control` under the track, labelled below in `meta-12` `--text-3` ("Recommended 60") |
| Disabled | range `--control`, thumb `--surface-2` with `--border-strong`, labels `--text-dis`, reason in the hint |

**Behaviour.** `←`/`↓` minus a step, `→`/`↑` plus a step, `PageUp`/`PageDown` ± 10 steps, `Home`/`End` min/max; clicking the track moves the thumb there. The paired NumberInput and the slider stay in sync; out-of-range typed values show the NumberInput error rather than snapping. A two-thumb range variant (interest score 40–80) names its thumbs "Minimum" and "Maximum" and never lets them cross.

**ARIA.** Radix `Slider`: `role="slider"` per thumb with `aria-valuemin/max/now`; the wrapper passes `aria-valuetext` ("60 requests per minute") and the Field label (or "Minimum" / "Maximum") to each `Slider.Thumb`.

**Motion.** None: the thumb follows the pointer; keyboard steps are instant.

**Responsive.** Full width of the field column at every breakpoint; the paired NumberInput sits to the right at ≥ 480 and below on phones; thumbs keep a 44 px hit area on touch.

**Resolves:** F-FLOW-032 (thresholds shown without meaning: the hint and value text explain them); keeps the API-key slider's recommended value that the audit lists as a strength.

**React.** `<Slider label="Rate limit" minValue={1} maxValue={600} step={1} marks={[{ value: 60, label: 'Recommended 60' }]} formatValue={v => `${v} / min`} pairedInput />`.

---

## 7. Dates, files and keys

### 7.1 Date and time pickers

**Where they are used.** A callback time on wrap-up ("Call later"), a lead's follow-up date, scheduling a batch from the Call gate ("Schedule"), calling hours per weekday (Phone setup and Flow settings), date-range filters (Call reports, Analytics, Activity, Invoices), meeting times.

**Rules shared by all of them** (D §4.2 rule 6, F §2.5, F-VIS-024):
- Display: `21 Sep 2026`, `Today 10:42 am`, 12-hour time with lowercase am/pm (en-IN's own format), `tabular-nums`.
- **Time zone:** scheduling and calling hours are in the workspace zone (IST by default) and **say so** in the field ("10:00 am IST"). If the browser's zone differs, the hint adds the local time once: "6:30 am in your time zone". Values are stored as zoned date-times (`@internationalized/date` `ZonedDateTime`), never naive strings.
- Typing always works: every date and time is a segmented field (`dd` / `mm` / `yyyy`, `hh` : `mm` `am`) that accepts digits and arrow keys; the calendar is a helper, not the only way in.
- After a date is committed, the hint echoes it in words ("Sunday, 21 Sep 2026") so the day-month order is never ambiguous.
- Allowed ranges are stated, not discovered: "Only the next 30 days can be scheduled." Unavailable days are shown and explained, not hidden.

**DateField / DatePicker.**

| Part | Spec |
|---|---|
| Field | The field box (§3.2), width `--field-w-medium` (320). Segments `dd`, `mm`, `yyyy` in en-IN order; placeholders `--text-3`; the focused segment gets fill `--accent-soft` and text `--accent-soft-text` (segments are cells, not the whole field, so the field box also shows the focus outline) |
| Calendar button | `sm` tertiary IconButton `calendar` inside the trailing slot, "Choose date", `--focus-offset-inset` |
| Popover | §5.1 surface, padding `--space-12`. Header: month and year in `title-14` ("September 2026") and `chevron-left` / `chevron-right` IconButtons ("Previous month", "Next month") |
| Weekday row | `label-12` `--text-3`, two letters ("Su Mo Tu…"); the first day follows the locale (Sunday for en-IN) |
| Day cell | 32 × 32 (`--space-32`; 44 on touch), `--radius-4`, `data-13` `tabular-nums` `--text` |
| Today | 1 px `--control` ring and weight 600 (no dot) |
| Hover | fill `--surface-2` |
| Selected | selection treatment: fill `--accent-soft`, 1 px `--accent-mark`, text `--accent-soft-text` weight 600 (not a second primary fill) |
| In range (range picker) | fill `--accent-soft`, no border; start and end cells carry the border |
| Unavailable | `--text-dis` with a line-through for past days in scheduling; focusable, not selectable, announced "unavailable" |
| Outside month | not rendered (blank cells), so no grey noise |
| Footer | the range rule or time-zone note in `meta-12` `--text-3` |

Keyboard in the grid: arrows by day and week, `PageUp`/`PageDown` by month, `Shift+PageUp`/`PageDown` by year, `Home`/`End` week start and end, `Enter` selects and closes, `Esc` closes without change.

**TimeField.** Segments `hh` : `mm` `am/pm` + trailing "IST" in `data-13` `--text-2`. Minutes step by 15 for scheduling (`↑`/`↓` on the minute segment), by 1 elsewhere. Width `--field-w-short` (180). Typing "1030p" fills 10 : 30 pm.

**Quick picks** (callbacks and schedules): a row of `sm` secondary buttons above the fields, each a computed time in words: "In 1 hour" · "Tomorrow 10 am" · "Monday 10 am". Choosing one fills date and time; the fields remain editable. Quick picks respect calling hours ("Tomorrow 10 am" is offered only if 10 am is inside them).

**DateRangePicker** (filters). Trigger: a `sm` secondary button showing the applied range ("1–26 Sep 2026", "Last 30 days"), `calendar` icon. Popover (`--popover-w-list` 400, or 2 months side by side at ≥ 1024 with width `--size-dialog-md` 560): presets list on the left (Today · Yesterday · Last 7 days · Last 30 days · This month · Last month · Custom), the calendar on the right. A preset applies immediately and closes; a custom range applies on the second click; `Esc` cancels. The range lives in the URL and the page labels each section's scope (F-UX-036). Ranges use an en dash ("1–26 Sep"), never an em dash.

**CallingHours (recipe).** Seven rows (Mon–Sun): day label, a Switch "Open" and two TimeFields "from" and "to", with the zone in the section title ("Calling hours · IST"). Validation: "to" after "from" ("End after the start time."), overlapping breaks flagged. Used by the Call gate's blocking check "Outside calling hours. Opens 10 am IST." (D §P3, F-UX-013).

**States.** Field states as TextInput. Invalid dates ("31 / 02") keep the segments and show "Enter a real date." on blur. Disabled with reason, read-only (shows the formatted date text, not segments).

**ARIA.** RAC `DateField` / `TimeField` (a `group` of `spinbutton` segments labelled by the Field label) and RAC `Calendar` / `RangeCalendar` (a `grid` with `aria-selected` cells and a live heading for the visible month), rendered inside a Radix `Popover` opened by the labelled calendar button. RAC's own `DatePicker` popover is not used, so overlays keep one focus manager (§1.2).

**Responsive.** ≥ 1024: popover calendar (two months for ranges). 768–1023: one month. < 768: the calendar opens in a bottom sheet with 44 px cells and full-width presets; segments stay typeable with the numeric keypad (`inputmode="numeric"`).

**Motion.** Popover per §5.1. Month changes are instant (no slide).

**Resolves:** F-VIS-024 (one date and time grammar), F-UX-036 (range scope, URL), F-UX-013 (calling hours visible where calls start), F-UX-042 (Activity shows the applied range).

**React.** `<DatePicker label="Call back on" granularity="day" minValue={today('Asia/Kolkata')} />`, `<TimeField label="At" timeZone="Asia/Kolkata" minuteStep={15} />`, `<DateRangePicker label="Date" presets={defaultPresets} value={range} onChange={setRange} />`.

### 7.2 FileUpload and Dropzone

**Purpose.** Add files: knowledge documents, a leads CSV or XLSX, a WhatsApp brochure, a meeting deck, Assistant attachments. Today it is the native "Choose file / No file chosen" at every width, unlabelled, accepting a `.txt` as a CSV (F-QA-022, F-UX-033, F-RWD-016, F-A11Y-003).

**Variants.** `dropzone` (multiple files, Knowledge and Import) and `single` (one file in a form: brochure, deck).

**Dropzone anatomy.**

| Part | Spec |
|---|---|
| Zone | `--surface-2` fill, **solid** 1 px `--border-strong` (a dashed line means only the canvas fallback path, F §7), `--radius-8`, padding `--space-24`, centred content |
| Icon | `upload` at `--icon-lg` (20) in `--text-3` |
| Line 1 | "Drag files here or" + `sm` secondary button **Choose files** (`data-13` `--text`). On touch: only the button, "Choose files" (F-RWD-016) |
| Line 2 | The contract, `meta-12` `--text-3`: "PDF, DOCX, TXT or CSV · up to 10 MB each · up to 20 files" |
| File list | Below the zone; rows of: `file-text` 16 · name (`data-13`, `translate="no"`, middle-truncated with a tooltip) · size (`meta-12` `tabular-nums`, "2.4 MB") · status · remove IconButton `x` ("Remove price-sheet.pdf") |

**States.**

| State | Treatment |
|---|---|
| Hover (fine pointer) | border `--control` |
| Drag over (valid target) | fill `--accent-soft`, 1 px `--accent-mark` border, line 1 becomes "Drop to upload" |
| Disabled | fill `--surface-2`, border `--border`, text `--text-dis`, the reason: "20 of 20 files. Remove one to add more." |
| File: ready | "Ready" `--text-3` |
| File: uploading | "Uploading… 60%" plus a 2 px progress bar (`--bw-strong`) in `--accent-mark` on `--surface-3`, grown with `transform: scaleX()` |
| File: processing | the next computed state in words ("Indexing…" for knowledge, D §6.6) |
| File: done | "Uploaded" or "Indexed · 42 passages" with `check` in `--success-text` |
| File: rejected | the row stays, in `--danger-text`, with the reason and the fix: "Not a CSV or XLSX file. Choose another file." · "Larger than 10 MB. Compress it or split it." Nothing is dropped silently |
| File: failed | "Couldn't upload · **Retry**" |

**Behaviour.**
- Types are checked **on selection and on drop** by extension and MIME type (`accept=".csv,text/csv,…"`), then size; each rejected file gets its own row and reason (F-QA-022).
- A leads CSV is parsed client-side (first 20 rows) and opens the Import mapping preview (data group) with the `phone` column required, a row count and per-row problems before anything is imported (F-QA-022, D §6.3).
- Uploads start on add (knowledge) or on submit (forms), per surface; the zone accepts more files while others upload.
- Paste of files into a focused composer is supported (Assistant).
- Helper copy uses plain words ("Extra columns are saved as custom fields"), never internals (`metadata.extra`, F-QA-022, F-UX-016).

**Single variant.** A row inside a Field: `sm` secondary "Choose file" + the chosen file as "brochure.pdf · 1.2 MB · **Replace** · **Remove**" (links); empty state text "No file chosen" in `--text-3`. Deck upload sits inside Meeting's Presentation mode ("Attach deck (PPTX or PDF)", F-UX-037).

**ARIA.** RAC `DropZone` + `FileTrigger`: the zone is not a tab stop; the **Choose files** button is (drag is an enhancement, the button is the address, D §P5). The hidden `input type="file"` is labelled by the Field label (F-A11Y-003). Status changes per file are announced politely ("price-sheet.pdf uploaded"); rejections are announced once as a summary ("2 files weren't added. See the list.").

**Responsive.** Full width of its column; zone padding `--space-16` on phones; file rows become two lines (name / size · status) with the remove button kept at 44 px.

**Motion.** Drag-over colour over `--dur-fast`; progress bar `transform` over `--dur-base`. No bouncing icons.

**Resolves:** F-QA-022, F-UX-033 (one upload, CSV guidance), F-RWD-016, F-A11Y-003 (file inputs), F-UX-037 (deck attach).

**React.** `<Dropzone label="Knowledge files" accept={['application/pdf', '.docx', 'text/plain', 'text/csv']} maxSize={10 * MB} maxFiles={20} onFiles={add} files={files} onRemove={remove} onRetry={retry} />`; `<FileField label="Brochure" accept={['application/pdf']} />`.

### 7.3 Kbd (keyboard shortcut hint)

**Purpose.** Show a shortcut where people look for one: in tooltips, menu rows, the `?` shortcut sheet and the search field's "/" hint. **Never** inside a button label and never as a permanent strip (D §P5, D §7 item 16).

**Anatomy.** One keycap per key: min width `--size-keycap` (20), height 20, padding-inline `--space-4`, 1 px `--border-strong` (no thicker bottom edge: 2 px lines are reserved for focus, selection and the active tab, F §7), `--radius-4`, fill `--surface`, text `mono-12` weight 500 in `--text-2`. Keys in a chord sit `--space-2` apart; a sequence reads "G then L" with "then" in `meta-12` `--text-3`.

| Context | Treatment |
|---|---|
| On a surface (menus, the `?` sheet, search hint) | As above |
| Inside a tooltip (`data-surface="inverse"`) | fill transparent, border `--text-3` (which the inverse scope remaps to `--text-inverse-2`), text `--text` (remapped to `--text-inverse`) |
| Menu row | right-aligned in the row, `--text-3` border |

**Platform-aware modifiers** (F-FLOW-024 showed Mac keys on Windows): on macOS, Lucide `command`, `option`, `arrow-big-up` (Shift), `chevron-up` (Control) icons at `--icon-xs` (12), each with `aria-label`; on Windows and Linux the words "Ctrl", "Alt", "Shift". Enter is `corner-down-left` with "Enter" as its label. Letters are shown uppercase ("K"), as keycaps are the one allowed uppercase besides acronyms (D §4.2).

**Visibility.** Hidden on touch (`(hover: none)`, `(pointer: coarse)`). When the user turns single-key shortcuts off (Account menu and Settings, F-A11Y-004), every single-key hint disappears and those keys stop working; modifier shortcuts remain. The rail's stray "Collapse [" glyph becomes a tooltip "Collapse sidebar" + `Kbd` "[" (F-VIS-032).

**ARIA.** Each key is a `<kbd>` inside an outer `<kbd>`; icon keys carry `aria-label`, so the whole reads "Control K" / "Command K". The control the shortcut triggers declares `aria-keyshortcuts="Control+K"` (or `Meta+K` on macOS); hints are decorative repeats of that and may be `aria-hidden` inside tooltips that already contain the name.

**Resolves:** F-A11Y-004 (hints follow the on/off preference), F-VIS-032, F-FLOW-024, D §P5.

**React.** `<Kbd keys={['mod', 'K']} />` where `mod` resolves to Command or Ctrl; `<Kbd keys={['G']} then={['L']} />`; `useShortcutsEnabled()` gates single-key hints.

---

## 8. Forms: layout and validation timing

### 8.1 Form layout

| Rule | Spec |
|---|---|
| Column | One column. Pages cap at `--size-container-form` (720), aligned with the page header (F-VIS-034: forms stretched to 1,300 px at 1920). Dialogs use `--size-dialog-sm` / `-md` (400 / 560); the inspector is 320 |
| Order | Labels above controls. Settings rows with a Switch are the one exception (label left, switch right) |
| Spacing | Fields `--space-field-gap` 16 · groups `--space-group-gap` 24 · sections `--space-section-gap` 40, each section with a `title-16` heading and an optional one-line description in `--text-3` |
| Pairs | Two fields share a row only when they are one idea (City + State, Date + Time, From + To) and the container is ≥ 560 px; otherwise they stack |
| Widths | Full column width, except short content: codes and counts `--field-w-short` (180), phone, amount and dates `--field-w-medium` (320) |
| No cards around fields | A form section is a heading and fields on the page surface, not a card with a title followed by a card per field (F-VIS-016, D §P7) |
| Dialog and sheet actions | Footer right-aligned: `Cancel` (tertiary) then the primary, last. Destructive confirmations: `Cancel` then the solid destructive button |
| Page forms (Settings) | No header Save. A **save bar** appears at the bottom of the form column only when the form is dirty: "Unsaved changes · **Discard** · **Save changes**" (sticky, `--surface-raised`, 1 px `--border-overlay`, `--e3`, `--radius-8`, `z-index: var(--z-float)`). It covers every field on the page (F-UX-012) |
| Phones (< 768) | Full-width fields; actions in a sticky bottom bar (56 + safe area) with secondary and primary sharing the width; the save bar docks there too |
| Autosave surfaces | Switch-driven settings and the Flow Designer draft save immediately with a visible status (Switch §6.3; the flow save chip in the Flow spec). They never show a Save button (D §8) |

### 8.2 Validation timing (the one rule)

The audit asks for one rule for the whole app (F-UX-025). This is it:

| # | Rule |
|---|---|
| V1 | **While typing, no new errors appear.** Three exceptions help rather than scold: the character count, the new-password rules list, and a field that already shows an error, which re-validates on each change (debounced by `--timing-validate-debounce`, 300 ms) so the error disappears the moment it is fixed |
| V2 | **On blur,** a field the user has changed is validated for format ("abc" in a phone field). An empty required field is **not** flagged on blur, so tabbing through a form never paints it red |
| V3 | **On submit,** every field is validated. Nothing is sent while any field is invalid |
| V4 | **Focus after a failed submit:** forms with 3 or fewer fields focus the first invalid field (its error is read through `aria-describedby`). Longer forms show an **error summary** at the top of the form ("Fix 2 fields to continue", `--danger-soft` notice with links to each field) and move focus to it; each link focuses its field (WIG F4) |
| V5 | **Async checks** (duplicate phone, subdomain, unique flow name) run on blur and then debounced while typing; the hint shows "Checking…". Submit waits for a pending check (the button shows its loading state) instead of failing |
| V6 | **The primary button stays enabled** while the form has field errors: errors are reported on submit (V3, V4). It is disabled, with a visible reason (§1.6), only for conditions outside the form: no permission, wallet ₹0, rate-limited, publish blocked by flow errors, nothing to save (the save bar is then simply absent) |
| V7 | **Server errors** (422) map to the same field messages; anything else becomes one form-level inline error with Retry, placed above the actions, `role="alert"`, with raw details behind "Details" (F-UX-019) |
| V8 | **Never rewrite input silently.** Trim on blur; format phone and money on blur, visibly; never clamp numbers; never coerce 0 into 1 (F-QA-021, F-FLOW-015) |
| V9 | **Never block typing or paste** (WIG F2); `maxLength` is soft (Textarea §3.6) |
| V10 | **Dirty state is protected:** route changes and `beforeunload` ask before discarding a dirty form; `Esc` on a dirty dialog asks "Discard changes?" (F-UX-012, F-UX-025, WIG F5) |
| V11 | **Submission is single:** the submit button enters its loading state; calls, test calls and top-ups send an idempotency key (WIG F3, D §6.3) |
| V12 | **Success is quiet and specific:** "Saved 11:24 am" next to the action or the save bar, or a toast naming the object when the page changes ("Lead added"). No exclamation marks (D §4.2) |

**Shared schemas** (`lib/validation.ts`, zod), used by the client and mirrored by the server so messages match:

| Schema | Rule | Message |
|---|---|---|
| `phoneIN` | `libphonenumber-js` valid for `IN`; `mobile` variant 10 digits starting 6–9 | "Enter a 10-digit mobile number, like 98765 43210." |
| `email` | RFC-lite, trimmed, lower-cased domain | "Enter an email address, like name@company.com." |
| `httpsUrl` | `new URL()`, `https:` | "Enter a full URL starting with https://." |
| `inr(min, max)` | integer rupees within bounds | "Enter an amount from ₹100 to ₹1,00,000." |
| `intRange(min, max, unit)` | integer within bounds | "Enter a number from 1 to 5." |
| `requiredText(noun)` | non-empty after trim | "Enter a flow name." / "Describe the goal in a sentence." |
| `uniqueName` | server 409 | "A flow called '…' already exists. Choose another name." |
| `file(types, maxSize)` | extension + MIME + size | "Not a CSV or XLSX file. Choose another file." |

**Resolves:** F-UX-025, F-QA-021, F-QA-020, F-QA-030, F-UX-012, F-UX-019, F-FLOW-015, F-VIS-034, F-UX-037, F-UX-039.

---

## 9. Traceability: finding → component

| Finding | Where it is fixed |
|---|---|
| F-VIS-006 (80 button styles, 3 systems, 6 Refresh designs) | Button §2.1, RefreshButton §2.6, the ESLint rule §1.2 |
| F-VIS-013 (truncated labels) | Button `nowrap`, Select min width and tooltip §5.2, FlowSwitcher middle truncation §5.4 |
| F-VIS-016 (button sizes, radii, box-in-box fields, 0-radius segments) | §1.4 sizes, Field anatomy §3.1, SegmentedControl §6.4 |
| F-VIS-018, F-VIS-019 (12 input styles, overlapping icon) | TextInput §3.2 |
| F-VIS-024 (date formats) | Dates §7.1 |
| F-VIS-030 (Test call / CONNECT states) | Button states §2.1, disabled-with-reason §1.6 |
| F-VIS-032 ("Collapse [", theme toggle) | Kbd §7.3, Switch §6.3, IconButton toggles §2.2 |
| F-VIS-034 (form widths) | Form layout §8.1 |
| F-VIS-037, F-UX-005, F-FLOW-012, F-FLOW-014 (duplicate flow names, no live marker) | FlowSwitcher §5.4 |
| F-A11Y-003 (no programmatic labels) | Field §3.1, SearchInput §3.5, Select §5.2, Checkbox §6.1, FileUpload §7.2 |
| F-A11Y-004 (single-key shortcuts, `c` calls) | Button behaviour §2.1, SearchInput §3.5, Kbd §7.3 |
| F-A11Y-006 (focus missing on checkboxes, selects, password toggle, inputs) | §1.5, TextInput §3.2, PasswordInput §3.3, Select §5.2, Checkbox §6.1 |
| F-A11Y-009 (black on blue) | Button primary `--on-accent` §2.1 |
| F-A11Y-016 (toggle states visual only) | Radio §6.2, SegmentedControl §6.4, Switch §6.3, MultiSelect §5.5, CurrencyInput presets §4.2 |
| F-A11Y-020 (placeholders) | Field §3.1, TextInput §3.2 |
| F-A11Y-023 (targets) | Hit areas §1.4, Checkbox §6.1, SegmentedControl §6.4 |
| F-A11Y-024, F-A11Y-030 (icon-only names, label-in-name) | IconButton §2.2, Button ARIA §2.1 |
| F-A11Y-025, F-QA-030 (login) | PasswordInput §3.3, validation §8.2 |
| F-UX-012 (Settings Save always on) | Save bar §8.1, Switch §6.3 |
| F-UX-014 (pickers silently save defaults) | Select §5.2, FlowSwitcher `call` mode §5.4, VoiceChoice §6.4, Switch §6.3 |
| F-UX-019 (silent, raw failures) | RefreshButton §2.6, V7 §8.2, listbox error state §5.1 |
| F-UX-021, F-QA-021 (amounts, competing primaries) | CurrencyInput §4.2, one primary per region §2.1 |
| F-UX-025, F-QA-020 (invalid input accepted, errors far away) | PhoneInput §4.1, validation §8.2 |
| F-UX-026 (Test call vs CONNECT) | Button copy and states §2.1, PhoneInput Cockpit note §4.1 |
| F-UX-035, F-FLOW-019 (destructive placement) | Destructive variant §2.1, IconButton rule §2.2, SplitButton §2.3 |
| F-UX-036 (range scope) | SegmentedControl §6.4, DateRangePicker §7.1 |
| F-UX-037, F-UX-039 (meeting title, empty goal, deck) | TextInput §3.2, Textarea §3.6, FileUpload single §7.2, RadioCard §6.2 |
| F-UX-047 (two equal primaries) | One primary per region §2.1, disabled-with-reason §1.6 |
| F-QA-022 (import accepts any file) | FileUpload §7.2 |
| F-FLOW-015 (invalid values applied) | NumberInput §3.4, TextInput names §3.2, V8 §8.2 |
| F-FLOW-018 (two primaries in the flow toolbar) | Button variants §2.1 |
| F-FLOW-024 (wrong platform keys) | Kbd §7.3 |
| F-FLOW-028 (variables) | Textarea → PromptField §3.6 |
| F-FLOW-032 (thresholds unexplained) | Slider §6.5 |
| F-RWD-003, F-RWD-007, F-RWD-008, F-RWD-013 (clipped actions) | Button responsive §2.1 |
| F-RWD-006 (session-mode switch cut off) | SegmentedControl responsive §6.4 |
| F-RWD-009 (search 52 px wide) | SearchInput §3.5 |
| F-RWD-012 (filter chips overflow) | MultiSelect §5.5 |
| F-RWD-015 (composer) | Textarea composer §3.6 |
| F-RWD-016 (native file input) | FileUpload §7.2 |
| F-RWD-018 (14 px inputs) | TextInput 16 px on touch §3.2 |

## 10. Build order and QA

**Build order** (after `tokens.css` and `base.css`; matches D §8): `Button` + `IconButton` → `Field` + `TextInput` → `Checkbox`, `Radio`, `Switch` → `SegmentedControl` → `Select` + listbox popover → `Kbd` → `PhoneInput`, `CurrencyInput`, `NumberInput`, `SearchInput`, `PasswordInput`, `Textarea` → `Combobox`, `MultiSelect` → `FlowSwitcher` → `DatePicker`, `TimeField`, `DateRangePicker` → `Dropzone` → `SplitButton`, `ButtonGroup`, `RefreshButton`. Codemods then move `.btn-*`, `.input-vani` and bespoke controls onto them, page by page in the traffic order of F §15.6.

**Definition of done for each component:**
1. Every state in this spec exists in a Storybook story (or the gallery) in both themes, including focus-visible and disabled-with-reason.
2. Visual snapshots in light and dark, and of the focused state (F §15.5).
3. axe passes in both themes; `jsx-a11y` passes (`label-has-associated-control`, `control-has-associated-label`).
4. Keyboard walkthrough recorded against the table in this spec; screen-reader names checked in the accessibility tree.
5. Touch check at 390 × 844: 44 px targets, 16 px field text, no sideways scroll at 320.
6. Forced-colours check (Windows high contrast): focus, checked marks and the selected segment still visible.
7. No raw colour, no arbitrary value, no `transition-all`, no `outline-none` without replacement (lint).

## 11. Open questions for the owner

1. **Primitive mix.** Core follows the overlay group's Radix (shadcn source) + `cmdk` base and adds overlay-free React Aria Components only for NumberField, DateField, TimeField, Calendar, the multi-select ListBox and DropZone (§1.2). Confirm the extra dependency (`react-aria-components` + `@internationalized/date`, tree-shaken to those pieces), or accept weaker hand-built date and number fields.
2. **Busy spinner.** Closed: accepted into F §11 as a bounded loop (`--dur-spin` 800 ms, only while a user-started request is in flight, frozen under reduced motion).
3. **`--danger-hover` token.** Closed: in `tokens.json` 1.1.0 (`component.button`) and `check-contrast.mjs` (foundations §18).
4. **Round radios.** Add radio circles to F §6's full-radius list (avatars, live dot, switches, capsule ends).
5. **Required marking.** This spec marks optional fields and leaves required ones unmarked (§3.1), the inverse of the audit's "(required)" suggestion. Confirm.
6. **Workspace time zone.** Is IST fixed for every workspace, or can an enterprise workspace choose another zone for calling hours? The date components support either.
7. **Password policy.** The rules list renders whatever the auth service enforces; the minimum length and breach check need a product decision.
8. **Root font size.** Closed: `base.css` keeps `html` at 100 % and sets `font` on `body`; the specimens were re-rendered and CT-03 asserts it (§1.10).
