
---

## 7. Menu and ContextMenu

**Purpose.** A list of actions or options opened from a trigger (⋯ overflow, "Draft · 3 changes ▾", the account menu, sort, density, Columns) or from a right-click / context key on a row or flow step.
**Use when** there are 3 or more actions, or when actions are rare, secondary or destructive. **Don't use** for navigation between pages (sidebar), for choosing a value in a form (Select), or for one or two actions (show them as buttons).

### 7.1 Anatomy and values

| Part | Value |
|---|---|
| Content | §1.2 menu surface; padding `--space-4`; min `--size-menu-min` 180, max `--size-menu-max` 320; `max-height` = available − `--space-8`, internal scroll |
| Item | height `--control-h` (32; 44 on touch); padding `0 var(--space-8)`; gap `--space-inline-md`; radius `--radius-2`; label `--type-data-13` `--text`; leading icon `--icon-md` in `--text-2` (all items in a menu have an icon, or none do) |
| Item description | optional second line `--type-meta-12` `--text-3` (the item grows to fit): "Callers keep hearing v7" |
| Trailing slot | Kbd keycap (`--size-keycap`), a `chevron-right` for submenus, or a value ("Standard") in `--text-3` |
| Check column | `check` `--icon-md` in `--accent-text` for checkbox and radio items; the column is reserved in the whole menu when any item is checkable |
| Group label | `--type-label-12` `--text-3`, sentence case, padding `--space-6 var(--space-8) var(--space-2)` |
| Separator | 1 px `--border`, margin `--space-4` 0 |
| Danger item | label and icon `--danger-text`; highlight `--danger-soft`; always the last group after a separator; "…" when a dialog follows |
| Disabled item | label `--text-dis`, and a description line with the reason in `--text-3` ("Admins only", "Publish v8 first") |

### 7.2 Types

- **Action menu** (⋯): Flow header: Duplicate · Export JSON · Import JSON… · Share… | Discard draft changes… | Delete flow…. Lead sheet: Copy link · Add to batch… | Delete lead….
- **Selection menu** (radio items): sort, density (Standard / Compact), theme (System / Light / Dark).
- **Checkbox menu**: Columns, Show test calls.
- **Submenu**: "Set status ▸" in the bulk bar and row menu; opens on → / hover after `--timing-tooltip-delay`.
- **ContextMenu**: right-click, Shift+F10 or the context key on a focused table row or flow step. It mirrors that element's visible ⋯ menu exactly: every context action also has a visible address (P5).
- **Account menu** (AppShell spec owns placement): profile, theme, shortcuts on/off, `Sign out…` last after a separator.

### 7.3 States

| State | Treatment |
|---|---|
| Item default | transparent |
| Highlighted (pointer or keyboard) | `--surface-2` fill (danger: `--danger-soft`) |
| Keyboard focus | the highlight **plus** a 2 px `--focus` outline at `--focus-offset-inset`, so focus stays an outline (base.css rule) |
| Pressed | `--surface-3` for `--dur-fast` |
| Checked | check icon in the check column; `aria-checked="true"` |
| Disabled | as §7.1; focusable, `aria-disabled="true"`, selecting does nothing; the reason is read with it |
| Loading (async items) | one row with Spinner sm + "Loading versions…" after `--timing-skeleton-delay` |

### 7.4 Keyboard

| Key | Action |
|---|---|
| Enter, Space, ↓ on trigger | Open, focus the first enabled item |
| ↑ on trigger | Open, focus the last item |
| ↑ ↓ | Move (wraps); Home / End first / last |
| Type a letter | Typeahead to the next matching item |
| → / ← | Open / close a submenu |
| Enter, Space | Activate (checkbox and radio items stay open) |
| Esc | Close, focus returns to the trigger (the Flow ⋯ menu left focus in place and needed about 47 Tab presses, F-A11Y-011) |
| Tab | Close and move on |
| Shift+F10, context key | Open the ContextMenu on the focused row or step |

### 7.5 ARIA

Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. Content `role="menu"` labelled by the trigger. Items `menuitem`, `menuitemcheckbox`, `menuitemradio` with `aria-checked`; groups `role="group"` with `aria-labelledby`; separators `role="separator"`. Keycaps are `aria-hidden` and the shortcut is exposed with `aria-keyshortcuts`.

### 7.6 Responsive

≥ 768: anchored (`bottom-end` for ⋯). Below 768: anchored if ≤ 5 items and no danger item; otherwise an **action sheet**: bottom sheet, 44 px rows, group labels kept, danger group last, a Cancel row at the bottom above the safe area. Submenus become a pushed second list with a Back row. ContextMenu does not exist on touch (long-press is not used); the visible ⋯ covers it.

### 7.7 Motion

Fade + `--shift-popover` over `--dur-base`; submenus fade only; exit `--dur-fast`.

### 7.8 Copy

Items are verbs or verb phrases in sentence case ("Export JSON", "Discard draft changes…"). No "Reset to default" (it did not say what it resets, F-FLOW-019). Keycaps only in menus, tooltips, the palette and the `?` sheet.

### 7.9 Do / don't

| Do | Don't |
|---|---|
| Danger group last, separated, red text | "Reset to default" styled like Export JSON, one row below New flow (F-FLOW-019, F-UX-035) |
| Disabled item with "Admins only" | A hidden entry that silently redirects when clicked (F-UX-034) |
| Row ⋯ holding Re-analyse call and Download | 50 repeated Re-analyze and Download CSV buttons (F-UX-046) |

### 7.10 React

```tsx
type MenuEntry =
  | { type: 'item'; label: string; icon?: LucideIcon; kbd?: string[]; description?: string;
      danger?: boolean; disabledReason?: string; onSelect(): void }
  | { type: 'checkbox'; label: string; checked: boolean; onCheckedChange(v: boolean): void }
  | { type: 'radio-group'; label?: string; value: string; options: { value: string; label: string }[]; onValueChange(v: string): void }
  | { type: 'submenu'; label: string; icon?: LucideIcon; entries: MenuEntry[] }
  | { type: 'separator' } | { type: 'label'; label: string };
interface MenuProps { trigger: React.ReactElement; entries: MenuEntry[]; align?: 'start' | 'end'; }
interface ContextMenuProps { entries: MenuEntry[]; children: React.ReactElement; }  // same entries as the ⋯ menu
```

`@radix-ui/react-dropdown-menu` and `-context-menu`. Disabled-with-reason items are **not** Radix `disabled` (that removes them from keyboard reach): they set `aria-disabled`, call `event.preventDefault()` in `onSelect`, and render the reason. The entries array is shared by the ⋯ menu, the ContextMenu and the phone action sheet, so all three always match.

**Resolves:** F-A11Y-011, F-FLOW-019, F-UX-035, F-UX-046, F-UX-034 (disabled with reason), F-A11Y-016 (checked state exposed).

---

## 8. CommandPalette ("Search or jump")

**Purpose.** One keyboard-first place to jump to any destination or record and to start common actions. It is the "Search or jump (⌘K)" entry under the workspace switcher and the Baseline's "Search" (direction §6.1). Today Ctrl+K opens nothing (F-UX-029).
**Scope:** the 12 destinations (from the one nav config), flows, leads, calls, knowledge files, Settings pages, and a short list of actions. It is quiet: no animation flourishes, no "AI" answer box (direction: "⌘K showmanship" stays out).

### 8.1 Anatomy and values

1. **Container**: Dialog `md` (`--size-dialog-md` 560), top `--space-64` (≥ 1024) or `--space-40` (tablet), §1.2 surface. Not vertically centred, so it never jumps as results change.
2. **Input row**: `search` icon `--icon-md` `--text-3`, input `--type-body-16` (no border; the row has a bottom hairline), clear IconButton when not empty, padding `--space-12` `--space-16` (48 px row). Placeholder "Search leads, calls, flows or jump to…".
3. **Results**: a listbox; `max-height: calc(var(--row-h) * 9)` then scroll. Groups in fixed order: **Recent** (empty query only, last 5 opened records) · **Go to** · **Flows** · **Leads** · **Calls** · **Knowledge** · **Settings** · **Actions** · **Help**. Each group shows at most 5 rows plus "Show all 23 leads matching 'site'" which opens that page with `?q=`.
4. **Row**: height `--row-h` (40; 48 touch); padding `0 var(--space-12)`; icon `--icon-md` `--text-2` (the destination's nav icon, or the record type's icon); title `--type-data-13` `--text` with the matched substring at `--fw-semibold` (no colour highlight); meta `--type-meta-12` `--text-3` after the title (masked phone in `--type-mono-12`); trailing hint "Open" / "Jump" in `--text-3`, or a keycap for actions that have a shortcut.
5. **Group label**: `--type-label-12` `--text-3`, padding `--space-8 var(--space-12) var(--space-4)`.
6. **Footer**: `--surface-2`, top hairline, padding `--space-8` `--space-12`, `--type-meta-12` `--text-3`: "↑ ↓ to move · Enter to open · Esc to close" with keycaps. It is the only persistent hint strip in the product, and it lives inside a transient overlay.

**Row meta examples** (formats come from `lib/format.ts`): Flow "Site-visit qualifier · Live v7 · Draft, 3 changes"; Lead "Lead 1042 · +91 •••• 4821 · Interested"; Call "Today 10:42 am · 2:14 · Interested"; Knowledge "price-sheet.pdf · Indexed"; Action "Import leads…".

### 8.2 States

| State | Treatment |
|---|---|
| Empty query | Recent + Go to + 4 suggested actions (New lead, New flow, Import leads…, Top up…) |
| Typing | Destinations and actions filter locally and instantly; records query the server after a 300 ms pause (`--timing-validate-debounce`, the one input debounce; foundations §18) |
| Searching | Local groups stay; a row "Searching records…" with Spinner sm appears after `--timing-skeleton-delay` |
| Active row | `--surface-2` fill plus a 2 px inset `--accent-mark` bar on the left (the selected-row language), `aria-selected="true"` |
| No results | "No matches for 'xyz'." and "Search covers lead names and numbers, call transcripts, flows and files." No illustration |
| Record search failed | Local results remain; a row "Couldn't search records. Retry" (InlineError compact) |
| Offline | Local destinations and actions work; record groups show "Offline. Records can't be searched." |
| Permission | Items the role cannot use are listed disabled with a reason ("Admins only") only when typed for exactly; otherwise hidden |

### 8.3 Actions and safety

- Actions that change nothing risky run at once: switch theme, toggle density, turn single-key shortcuts off, open the `?` sheet.
- Actions that create or cost end in "…" and **open their own UI**: "New lead…" opens the dialog, "Top up…" opens the Top-up sheet, "Call Lead 1042…" opens the **Call gate**, "Publish v8…" opens the **Publish gate**. The palette never dials, bills or publishes by itself (P3).
- Destructive actions are not in the palette.

### 8.4 Keyboard

| Key | Action |
|---|---|
| ⌘K / Ctrl+K | Open from anywhere, including text fields; again closes |
| ↑ ↓ | Move the active row (wraps); Home / End in the list with ⌘ / Ctrl |
| Enter | Open or run the active row, close the palette |
| ⌘/Ctrl+Enter | Open a record in its sheet without leaving the current page (where the page supports it) |
| Esc | Clear the query if there is one, else close; focus returns to the trigger or the previously focused element |
| Tab | Stays inside (trapped); moves to the clear button and back |

`/` stays the page-level search on Leads and Call reports; it does not open the palette.

### 8.5 ARIA

Dialog `aria-label="Search or jump"`. Input `role="combobox"` `aria-expanded="true"` `aria-controls={listboxId}` `aria-activedescendant={activeRowId}` `aria-autocomplete="list"`. Listbox with `role="group"` per section `aria-labelledby` its label; rows `role="option"`. The polite region announces the result count after typing settles ("12 results", "No results"), throttled by `--timing-announce-throttle`.

### 8.6 Responsive

| Width | Behaviour |
|---|---|
| ≥ 1024 | Centred `md`, top `--space-64` |
| 768–1023 | Centred `md`, top `--space-40`; opened from the top bar's search icon |
| < 768 | Full screen: input row at the top with a text "Cancel" button, 48 px rows, footer hints hidden, results above the keyboard (`100dvh`, `interactive-widget=resizes-content`) |

### 8.7 Motion

Scrim fade and the dialog's `--shift-dialog` rise over `--dur-slow`; result changes are instant (no list animation).

### 8.8 Do / don't

| Do | Don't |
|---|---|
| "Call Lead 1042…" opens the Call gate | A palette action that places a call |
| Names from the one nav config ("Call reports", never "Reports" or "CALL REPORTS") | A fourth set of destination names (F-UX-017) |
| Masked phone numbers in rows | Full numbers in results |

### 8.9 React

```tsx
interface PaletteItem {
  id: string; group: 'recent' | 'goto' | 'flows' | 'leads' | 'calls' | 'knowledge' | 'settings' | 'actions' | 'help';
  title: string; meta?: string; icon: LucideIcon; kbd?: string[];
  keywords?: string[];                       // synonyms: "wallet" → Billing, "DID" → Phone setup
  perform(ctx: { openSheet: boolean }): void; // navigation or opening a dialog, gate or sheet
  disabledReason?: string;
}
interface CommandPaletteProps {
  open: boolean; onOpenChange(o: boolean): void;
  staticItems: PaletteItem[];                 // destinations + actions, from the nav config
  searchRecords(q: string, signal: AbortSignal): Promise<PaletteItem[]>;
}
```

`cmdk` (`Command`, `Command.Input`, `Command.List`, `Command.Group`, `Command.Item`) inside the shared Dialog. `shouldFilter={false}` for server groups; local groups filter with cmdk's scorer plus `keywords`. Requests use `AbortController` so stale results never replace newer ones. A global `useHotkey('mod+k')` mounts in the AppShell. Recent items are a per-user convenience (local storage is acceptable).

**Resolves:** F-UX-029 (no palette), F-UX-017 (one name per destination), F-UX-015 (synonyms such as DID → Phone setup), F-RWD-001 (on phones every destination is also searchable).
