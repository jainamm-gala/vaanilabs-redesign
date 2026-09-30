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
