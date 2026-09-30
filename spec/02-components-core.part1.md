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
