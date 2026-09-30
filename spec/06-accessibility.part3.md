
---

## 6. Landmarks, headings, titles and the skip link

### 6.1 Landmarks per shell mode

DOM order equals focus order (S §3.1). Only one navigation is rendered per width class, so there is never a duplicate landmark (F-A11Y-017).

| Region | Standard mode (every destination) | Focus mode (Flow Designer, `/flows/<id>`) | Bare mode (auth) | Public site |
|---|---|---|---|---|
| Skip link | "Skip to main content" | "Skip to canvas" and "Skip to Outline" (two links, stacked when focused) | "Skip to main content" | "Skip to main content" |
| Navigation | `<nav aria-label="Main">`: Sidebar, Rail, TopBar + NavSheet, or TopBar + BottomBar + MoreSheet | Rail (forced at ≥ 1024) | none | `<header>` + `<nav aria-label="Main">` |
| Main | `<main id="main" tabindex="-1">` | `<main id="main" tabindex="-1">` holding the flow header, phase ruler, tool rail, canvas, inspector and Problems bar | `<main>` holding the 400 px card | `<main id="main" tabindex="-1">` |
| Sub-navigation | Settings: `<nav aria-label="Settings sections">`; Billing tabs: `<nav aria-label="Billing sections">` | — | — | Footer: `<nav aria-label="Site links">` |
| Complementary | Docked record sheet ≥ 1440: `role="dialog"` (non-modal) labelled by its title (O §4.5) | Inspector: `<aside aria-labelledby>`; Outline and Variables: `<aside aria-labelledby>` | — | — |
| Status band | Baseline: `role="region" aria-label="Workspace status"` | none (merged into the flow header) | — | — |
| Notifications | Toast viewport `role="region" aria-label="Notifications"` | same | same | same |
| Announcer | One visually hidden `role="status"` | same | same | same |
| Footer | none (no `contentinfo` in the app) | none | none | `<footer>` |

**Inside the Flow Designer's `main`:** the flow header is a plain grouping (no `role` on `<header>`: axe `aria-allowed-role` failed there, F-A11Y-026) with the flow name as the `h1` inside the breadcrumb; the tool rail is `role="toolbar" aria-label="Flow tools" aria-orientation="vertical"` (one tab stop, ↑/↓ move); the canvas is a `<section aria-labelledby>` with a visually hidden `h2` "Canvas"; the Problems bar is `role="region" aria-label="Problems"`. **No `role="application"` anywhere**: it switches off screen-reader browse commands, and every canvas behaviour is achievable with standard roles (§9.6).

### 6.2 Headings

| Level | Style | Used for |
|---|---|---|
| `h1` | `title-20` (≥ 1024), `title-16` in the TopBar (< 1024) | Exactly one per route: the destination label from `lib/nav.ts`, or the record or flow name on record routes. Focus target on route change (`tabindex="-1"`) |
| `h2` | `title-16` | Page sections, panel titles (was "CUSTOMER INTEL", "TRANSCRIPT FEED"), sheet, dialog and gate titles, the Outline and inspector titles |
| `h3` | `title-14` | Sub-sections, card titles, gate checklists, Overview groups inside a sheet |
| visually hidden `h2` | `.sr-only` | Regions with no visible title that a screen-reader user navigates to: "Canvas", "Filters", "Results" |

Rules: no skipped levels; no heading used for styling (the user's own name on Analytics is text, not an `h3`); no text styled as a heading without being one (F-A11Y-026, F-A11Y-030); dialog titles are `h2` even though the dialog is outside `main`.

**Heading outlines of the core routes** (the test SR-01 walks each with the screen reader's heading list):

| Route | Outline |
|---|---|
| Cockpit (live) | h1 Cockpit · h2 Calls · h2 Call with Lead 1042 (card) · h3 Captured so far · h2 Transcript |
| Leads | h1 Leads · h2 Filters (hidden) · h2 Results (hidden, the table caption states the sort) · sheet: h2 Lead 1042 · h3 Overview · h3 Calls · h3 Notes |
| Call reports | h1 Call reports · h2 Results (hidden) · sheet: h2 Call on 21 Sep, 10:42 am · h3 Summary · h3 Transcript |
| Flow Designer | h1 Site-visit qualifier · h2 Canvas (hidden) · h2 Outline · h2 Ask about a site visit (inspector) · h2 Problems |
| Billing | h1 Billing · h2 Wallet · h2 Autopay · Top-up sheet: h2 Top up |
| Settings › Phone setup | h1 Phone setup · h2 Inbound number · h2 Caller ID · h2 Transfer · h2 Test call |
| Sign in | h1 Sign in to Vaani Labs |
| Marketing home | h1 (hero) · h2 per section · h3 per card; no H2 → H4 jumps (F-A11Y-026) |

### 6.3 Page titles

The pattern and the full table live in S §4.4: `[state · ][record · ]Label · Vaani Labs`, built from `lib/nav.ts`, never typed by a page. Accessibility requirements on top:

- **Unique per route and per open record;** a crawl in KB-02 fails on any duplicate.
- **State prefixes only for states that need the user's attention in another tab:** "On call", "Incoming call", "Couldn't save". Never a ticking timer, a balance or a count that changes every second (it would re-announce in some screen readers' tab lists).
- **No phone numbers** in any title. Lead names may appear (they help the user) but telemetry uses the route template only (S §4.4).
- **Overlays never change the title.** Route-level sheets (`?lead=`) do, because they are addressable.

### 6.4 Skip links and bypass

| Part | Spec |
|---|---|
| Position in DOM | The first focusable element of `<body>` on every route, before the navigation |
| Hidden state | `.sr-only` until focused (never `display: none`, which removes it from the tab order) |
| Focused state | `position: fixed; top: var(--space-8); left: var(--space-8)`; `z-index: var(--z-skiplink)`; `--surface` fill; 1 px `--border-overlay`; `--e2`; `--radius-6`; padding `--space-8 var(--space-12)`; `label-13` `--text`; the standard focus outline. Height ≥ `--size-hit-min` (24), 44 on touch |
| Target | `<main id="main" tabindex="-1">`; on activation focus moves to `main`, so the next Tab reaches the first control of the page header |
| Flow Designer | Two links: "Skip to canvas" (focuses the canvas's active step, or the first Trigger) and "Skip to Outline" (opens the Outline if closed and focuses its active row) |
| Focus ring on targets | Non-interactive programmatic targets (`main`, the H1, sheet titles) carry `data-focus-target` and draw no outline: they are not controls (2.4.7 applies to components). This is the only allowed `outline: none`, and the lint allowlist names it |

**Other bypass mechanisms:** landmarks (§6.1); F6 cycles navigation → main → the open sheet or inspector → the Baseline; in the designer F6 cycles header → canvas → inspector → Problems bar. On the last region F6 is not prevented, so the browser's own F6 (address bar) still works.

---

## 7. Focus: visible, managed, never obscured

### 7.1 The focus indicator

One rule in `base.css`: `:focus-visible { outline: var(--focus-width) solid var(--focus); outline-offset: var(--focus-offset); }`, 2 px at a 2 px offset. `--focus` is `#2B45C2` light and `#8FA3FF` dark, ≥ 6.43 / 6.15:1 against every plane, selected row, soft tint, canvas and frame (F §3.4). It is always an `outline` (it survives forced colours), never a `box-shadow` ring.

| Where | Ring drawn on | Offset | Colour token |
|---|---|---|---|
| Button, IconButton, link, tab, chip, menu trigger | The element | `--focus-offset` (2) | `--focus` |
| Text field, select, combobox, textarea | The field box via `:has(:focus-visible)` (C §1.5) | 2 | `--focus` |
| Checkbox, radio, switch | The visible box, circle or track, never the 1 × 1 hidden input (F-A11Y-006) | 2 | `--focus` |
| Segmented item, radio card | The item | 2 | `--focus` |
| Nav item, table row, list row, option, tree item | Inside the element (scroll containers never clip it) | `--focus-offset-inset` (−2) | `--focus` |
| Canvas step | The step silhouette, clearing its border and the selection ring | `--focus-offset-node` (3) | `--focus` |
| Socket (answer output) | A 24 px circle around the 10 px socket | 2 | `--focus` |
| Connection (edge) | The edge label chip; the path thickens to 3 px (`--edge-active`) | 2 | `--focus` |
| Toast and tooltip actions | The action | 2 | `--focus-inverse` (inverse plane) |
| Baseline links | The segment | 2 | `--bl-focus` |
| Recording scrubber | The playhead handle | 2 | `--focus` |

Visual-regression snapshots cover the focused state of every row in this table in both themes (VR-01). Forced colours map the ring to `Highlight` (`base.css`).

### 7.2 Focus is not selection

| State | Treatment | Semantics |
|---|---|---|
| Focused | Outline only | real focus |
| Selected (rows) | `--accent-soft` fill + 2 px inset `--accent-mark` bar on the first cell | `aria-selected="true"` |
| Selected (steps, cards) | `--accent-soft` header fill + 1 px `--accent-mark` border (+ 1 px inner ring on steps), `--e2` | `aria-selected` on the Outline row; the step's name gains "selected" |
| Current (nav, open record) | Raised key (nav) or hover fill + inset bar (open row) | `aria-current="page"` / `"true"` |
| Focused and selected | Both treatments at once | both |

The same treatment is used whether the selection came from a mouse, a key or the Outline (today only a mouse click produced a visible selection, F-A11Y-007). The mock renders all five states in both themes (`06-accessibility.html` §2).

### 7.3 Focus order and focus management

DOM order equals visual order at every width (1.3.2, 2.4.3). Layout changes use CSS order only when the DOM order still makes sense; grid `order` that reverses reading order is banned. Where focus goes:

| Moment | Focus goes to | Announced |
|---|---|---|
| Fresh load | Nowhere; the first Tab reaches the skip link | the `<title>` (browser) |
| Client route change | The page `h1` (`tabindex="-1"`) | the H1 text (screen reader reads the focused heading) |
| Route change while a non-modal sheet keeps focus | Stays in the sheet | "Leads loaded" via the announcer |
| Dialog, gate, palette, NavSheet, MoreSheet open | `data-autofocus` element, else Cancel (destructive), else the title (O §1.3) | the dialog name |
| Non-modal sheet open | The sheet title | the title |
| Any overlay closes | Its trigger; if the trigger is gone, `returnFocusTo`: the next row, the list heading, or the H1. **Never `<body>`** | — |
| Step or row deleted | The next step in graph order or the next row; else the previous; else the list heading | "Deleted Polite close. Press Control Z to undo." |
| Undo | The restored item | "Restored Polite close" |
| Form submit fails | ≤ 3 fields: the first invalid field; more: the error summary (C §8.2 V4) | the error text |
| Call gate confirmed (Leads) | The trigger, or the table's active row if the trigger left | "9 calls scheduled" |
| Call gate confirmed (Cockpit) | The call card heading | "Dialling" |
| Operator ends a call | The Wrap-up heading | "Call ended. Wrap-up" |
| The other side ends the call | Does not move | "Call ended" |
| Publish succeeds | Stays on the (now disabled) Publish button, whose reason reads "Nothing to publish" | "v8 is live on 1 number and 1 batch" |
| Notice dismissed | The page H1 (page scope) or section heading | — |
| Toast dismissed with Esc | Where focus was before F8 | — |
| Session expired | The SessionExpired dialog's primary ("Sign in") | the dialog |

### 7.4 Focus not obscured (2.4.11)

| Sticky or floating element | Height | Rule that keeps focus visible |
|---|---|---|
| Sticky table header | 32 | The table scroller sets `scroll-padding-top: var(--size-table-head)`; rows set `scroll-margin-top` to the same |
| Pager + BulkBar | 40 + bar + 12 | `scroll-padding-bottom: calc(var(--size-pager) + var(--control-h) + var(--space-24))` on the table scroller |
| Baseline | 28 | `main` sets `scroll-padding-bottom: var(--size-baseline)` |
| Phone TopBar and BottomBar | 52 · 56 + safe area | `scroll-padding-top: var(--size-topbar)`; `scroll-padding-bottom: calc(var(--size-bottombar) + env(safe-area-inset-bottom))` |
| Sheet header and footer | 56 · 56 | The sheet body sets `scroll-padding-block` to both (O §1.3) |
| Toasts | up to 3 × 64 | The viewport sits above the Baseline or bottom bar; if the focused element's rect intersects a toast, the stack shifts up by the overlap (O §9.3) |
| UnsavedChangesBar | 56 | Adds its height to `scroll-padding-bottom` while shown |
| Canvas overlays (zoom controls, minimap, Problems bar, docked inspector) | — | Focusing a step pans it into the free canvas area with a 48 px margin from every overlay; the minimap hides while a step under it has focus |
| Phone on-screen keyboard | varies | `interactive-widget=resizes-content` and `100dvh`, so the focused field stays above the keyboard (R §6) |

---

## 8. The keyboard model and single-key shortcuts

### 8.1 Four layers, in order of precedence

1. **Native Tab order.** Every control is reachable with Tab and Shift+Tab. No positive `tabindex` (0 today, keep it so).
2. **Widget keys.** Inside a composite widget (grid, tree, listbox, menu, tabs, radio group, toolbar, the canvas, the scrubber) arrow keys, Home, End and typeahead move within it; the widget is one tab stop with a roving `tabindex` (or `aria-activedescendant` for the palette and comboboxes). §9 lists every map.
3. **Scoped single-key shortcuts.** Letters and symbols that work only while focus is inside their widget or page and outside any field (§8.2). All obey the switch (§8.3).
4. **Global modifier shortcuts.** ⌘K / Ctrl+K, F6, F8, ⌘/Ctrl+Z, ⌘/Ctrl+S in forms, ⌘/Ctrl+Enter in gates and textareas. They work everywhere except where the browser or screen reader owns the key (§8.5).

### 8.2 The single-key registry (WCAG 2.1.4)

2.1.4 covers any shortcut made only of character keys, **including Shift + a letter and `?`** (Shift + /). Every entry below is registered through one `ShortcutProvider` (§8.4), so the switch reaches all of them.

| Key | Scope (active only when…) | Does | Never |
|---|---|---|---|
| `?` | anywhere, focus not in a field | Opens the Keyboard shortcuts dialog | — |
| `[` | shell, focus not in a field, button or link; **not registered in focus mode** (the Flow Designer) | Collapses the sidebar (≥ 1280) or opens the rail overlay (1024–1279) | — |
| `/` | Leads, Call reports, Flows list, Knowledge, Settings search | Focuses the page search | open the palette |
| `J` / `K` | a table body or its open sheet has focus | Next / previous row; the sheet follows | move a visual-only highlight (F-A11Y-004) |
| `X` | table body | Toggles the focused row's selection | — |
| `C` | table body | Opens the **Call gate** for the selection or focused row | dial (A2) |
| `C` | canvas step or socket, Outline row, inspector answer | Opens **Connect to…** | — |
| `A` | canvas step, Outline row | Adds a step after, connected (palette popover) | — |
| `N` | Leads page | Opens New lead | — |
| `O` · `V` · `T` | Flow Designer | Outline · Variables · Test panel | — |
| `M` | canvas step (scope `canvas`) | Move mode (§9.6, §16.1) | move without Enter to place |
| `+` · `−` | canvas | Zoom in · zoom out (browser zoom keys are ⌘/Ctrl + and never taken) | — |
| `Shift+1` · `Shift+2` · `Shift+0` | canvas | Fit flow · fit selection · 100 % | — |
| `]` · `[` | Flow Designer compare mode | Next · previous change | — |
| `Shift+D` | a data surface | Standard / Compact density | — |
| `M` · `H` | during your own browser call or take-over | Mute / hold (announced) | end the call |
| `Space` · `K` | recording player, focus inside it but not on a button | Play / pause | take Space from the page |

**Modifier shortcuts in the same registry** (not single keys, so the switch leaves them on; listed here so the lint and the `?` sheet see them): Alt+Arrow and Alt+Shift+Arrow (move, canvas, Outline and lists) · Alt+. and Alt+, (next and previous issue, Flow Designer) · Alt+Delete (delete and reconnect, canvas) · ⌘/Ctrl+D, C, X, V, G and Shift+G (canvas).

**Removed:** the bare `A` "select all" on Leads (now `Ctrl/⌘+A` inside the table), `c` dialling, the window-level handler that hijacked Enter on buttons, and "F" full screen (the designer is already in focus mode). No single key publishes, rolls back, deletes without Undo, dials, bills or signs out.

### 8.3 The switch

- **Where:** the account menu ("Keyboard shortcuts" › switch "Single-key shortcuts", default on), the top of the `?` dialog with the note "Turn off if you use speech input or a switch device.", and the palette action "Turn off single-key shortcuts".
- **Stored** server-side as a user preference (local storage fallback, wrapped in try/catch), so it follows the user to every device.
- **When off:** every §8.2 key is inert; keycaps disappear from tooltips, menus and the `?` sheet (single-key rows show "Off"); `aria-keyshortcuts` is removed from the controls; each command stays reachable through its visible control, the row or step context menu (Shift+F10) and the palette (A1).
- **Remapping** is not offered in v1: 2.1.4 is met by turning off plus focus scoping. Revisit if research asks for it (§25).

### 8.4 The handler contract

One listener at `document` level, registered once in the AppShell; components declare shortcuts, they never add their own `window` listeners (lint LN-02 rejects `addEventListener('keydown'` outside `ShortcutProvider`).

```ts
// lib/shortcuts.ts (sketch)
type Scope = 'global' | 'page' | 'table' | 'canvas' | 'outline' | 'player' | 'call';
interface Shortcut { key: string; scope: Scope; singleKey: boolean; run(e: KeyboardEvent): void; label: string }

function shouldIgnore(e: KeyboardEvent, s: Shortcut, enabled: boolean): boolean {
  if (e.defaultPrevented || e.isComposing || e.keyCode === 229) return true;   // IME: Hindi transliteration, Devanagari keyboards
  if (s.singleKey && (!enabled || e.repeat)) return true;                      // the switch; held keys never repeat an action
  const t = e.target as HTMLElement;
  if (t.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="combobox"], [role="textbox"]'))
    return s.singleKey || !['mod+k', 'escape'].includes(s.key);                 // typing always wins
  if ((e.key === 'Enter' || e.key === ' ') && t.closest('button, a, [role="button"], [role="link"], summary'))
    return true;                                                                  // native activation wins (F-A11Y-004)
  return !scopeContains(s.scope, document.activeElement);                       // scoped keys need focus inside their widget
}
```

- Scope is resolved from the focused element's nearest `data-shortcut-scope`, so a letter pressed on a filter chip never moves the table (the audit saw `j` move rows from a chip).
- A shortcut that opens something registers the opener as the return-focus target.
- `aria-keyshortcuts` on the control mirrors the registry (C §7.3); the `?` sheet is generated from the registry, so it never lists a shortcut that does not exist (F-FLOW-024).
- **No double bindings (lint LN-03):** a unit test walks the registry and fails the build when one key (after platform normalisation) is bound twice within one context, where a context is the set of scopes that can be active together for one focused element (for example `global` + `page` + `canvas`). This is what caught Alt+↑/↓ meaning both "next issue" and "move", and the shell's `[` colliding with compare mode's `[`.

### 8.5 Keys the product never takes

| Key | Owner | Rule |
|---|---|---|
| Tab, Shift+Tab | browser | Never intercepted except inside a modal trap |
| Enter, Space on native controls | browser | Never intercepted |
| Insert, Caps Lock (+ letters), Ctrl+Alt+arrows, Ctrl+Option (VO) | screen readers | Never bound |
| Ctrl/⌘+L, T, W, N, R, P, +, −, 0 | browser | Never bound (zoom must always work) |
| Ctrl/⌘+F | browser | Bound to Find only while focus is in the Flow Designer or the transcript panel; everywhere else the browser's find works |
| F6 | browser | Region cycling; on the last region the event is not prevented, so the browser's F6 still reaches the address bar |
| Alt + a letter | Windows menus and some screen readers | Not bound. Alt + arrows (move and reorder), Alt + . and Alt + , (next and previous issue in the Flow Designer) and Alt+Delete only |

### 8.6 Screen-reader modes

Composite widgets carry roles that switch screen readers into focus (forms) mode by themselves: `grid`, `tree`, `listbox`, `menu`, `tablist`, `radiogroup`, `toolbar`, `slider`. Content between them stays in browse mode, so headings and landmarks keep working. Canvas steps are `role="group"` with `aria-roledescription="step"` inside a roving tab stop; screen-reader users who prefer a document model use the Outline (`tree`), which is complete (FD §16.1).
