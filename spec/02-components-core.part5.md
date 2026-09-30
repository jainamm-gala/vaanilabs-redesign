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
