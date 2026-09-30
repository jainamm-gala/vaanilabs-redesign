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
