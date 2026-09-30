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
