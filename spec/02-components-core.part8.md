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
