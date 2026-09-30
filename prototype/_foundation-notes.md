# Vaani Labs prototype: foundation contract

The shared layer every page of the static prototype is built on. Direction **Sutradhar** (spec/00-design-direction.md). Plain HTML, CSS and vanilla JS; no build; every page opens from `file://`.

**You may not edit anything in `assets/`, `_template.html`, `components.html` or `_tools/`.** If you need something the shared layer does not have, build it with layout-only CSS in your page file and report the gap (see section 14). Visual reference for every component in every state, light and dark: open `components.html`.

## 1. Files

| File | What it is |
|---|---|
| `assets/tokens.css` | Verbatim copy of `spec/tokens/tokens.css`. Every colour, size, radius, shadow, duration and z-index. |
| `assets/base.css` | Reset, fonts, focus rings, reduced motion, forced colours, `.type-*` roles, `.l-*` layout primitives, `.u-*` utilities. |
| `assets/components.css` | The one component layer (sections 0 to 40, index at the top of the file). Every class in it is reserved. |
| `assets/icons.js` | `window.VaaniIcon(name, size, opts)` and `<i data-icon>` hydration. About 120 Lucide-style icons, inline, no CDN. |
| `assets/data.js` | `window.VAANI_DATA`: one fictional workspace ("Sample Realty", Pune). The only data source. |
| `assets/shell.js` | `window.Vaani`: the shell chrome, overlays, toasts, palette, shortcuts, widgets, formatters, status map. |
| `_template.html` | The canonical page skeleton. Copy it for every page. |
| `components.html` + `pages/components.*` | The component gallery (also a worked example of a page file pair). |
| `_tools/check-tokens.mjs` | Token and hygiene checker. Run it before you hand in (section 15). |
| `_tools/check-links.mjs` | Link checker: every local href/src in every page, every quoted page reference in scripts, and hash/view routes into Settings, Billing, Agents and Knowledge. |

## 2. Adding a page

1. Copy `_template.html` to `<file>.html` (names in section 3). Keep the `<head>` block verbatim: the inline THEME_BOOT script, the font links, the three stylesheets in order, the three deferred scripts in order.
2. Set `<title>` to `Label · Vaani Labs` (a record page: `Record · Label · Vaani Labs`) and `<body data-page="<nav id>">`.
3. Replace the PageHeader contents (H1 = the nav label exactly, one meta line of computed facts, at most 3 actions, the primary last) and everything between `PAGE CONTENT HERE` markers.
4. Add `pages/<file>.css` (layout only) and `pages/<file>.js` (deferred, after shell.js) at the `PAGE CSS HERE` / `PAGE JS HERE` markers. Put page overlays (hidden dialogs, sheets, popovers, menus, gates) at `PAGE OVERLAYS HERE`, at the end of `<body>`.
5. Leave the empty chrome elements (`nav.sb`, `nav.rail`, `.topbar`, `.bl`, `nav.bbar`, `.toast-region`, announcer, `.portal`) in place and empty. shell.js fills them. Never hand-write nav items or Baseline text.
6. In your JS, wrap start-up code in `Vaani.ready(function () { … })` if it depends on the chrome; otherwise just run it (scripts are deferred, the DOM is parsed).
7. Check at 1440×900, 1280×800, 1024×768, 834×1112, 390×844 and 320 wide, light and dark, keyboard only. Run `node prototype/_tools/check-tokens.mjs`.

## 3. Destinations, files and URL parameters

One nav config (`Vaani.NAV`) drives the sidebar, rail, nav sheet, bottom bar, More sheet, palette "Go to" and document titles.

| `data-page` | Label | File | Group | Phone |
|---|---|---|---|---|
| `home` | Home | `index.html` | Operate | More |
| `cockpit` | Cockpit | `cockpit.html` | Operate | slot 1 |
| `assistant` | Assistant | `assistant.html` | Operate | More |
| `rep-console` | Rep console | `rep-console.html` (the old `cockpit.html?view=rep-console` redirects) | Operate | More |
| `meetings` | Meetings | `agents.html?view=meetings` | Operate | More |
| `personal-agents` | Personal agents | `agents.html?view=personal-agents` | Operate | More |
| `flows` | Flows | `flow-designer.html` | Build | slot 4 |
| `knowledge` | Knowledge | `knowledge.html` | Build | More |
| `leads` | Leads | `leads.html` | Data | slot 2 |
| `call-reports` | Call reports | `call-reports.html` | Data | slot 3 |
| `analytics` | Analytics | `analytics.html` | Data | More |
| `billing` | Billing | `billing.html` | Account | More |
| `settings` | Settings | `settings.html` | Account | More |

The current item is resolved from the exact href (file plus `?view=`), else `body[data-page]`, else the file. A page that serves two destinations (cockpit.html, agents.html) switches by `?view=` and calls `Vaani.nav.setCurrent(id)` if it changes view without reloading.

**URL parameters the shared layer understands (use them for demo states, never invent others for the same thing):**

| Parameter | Effect |
|---|---|
| `?setup=done` / `?setup=incomplete` | Hides / shows the Setup card and setup-driven chrome (remembered in localStorage). Default: setup 4 of 5. |
| `?wallet=low\|empty\|pending\|autopay-failed` | Wallet state for the chips and Baseline (`Vaani.walletState()`). Default `healthy` (₹2,340.50). |
| `?topup=1` | On billing.html, calls the handler registered with `Vaani.topUp.register(fn)` at load. |
| `?lead=<id>&gate=call` | The palette's "Call <name>…" rows go to `leads.html` with these; leads.js should open that lead and its Call gate. |
| `?call=<id>` | Palette call rows go to `call-reports.html?call=<id>`. |
| `?q=<text>` | Palette "Show all n …" rows go to the list page with the query; the list page should prefill its search. |
| `?node=<id>` | Turn "Step" links go to `flow-designer.html?node=<id>`. |

## 4. Body attributes

| Attribute | Use |
|---|---|
| `data-page="<nav id>"` | Required. |
| `data-shell="focus"` | Flow Designer: rail at every desktop width, no Baseline, a slim header. |
| `data-baseline="<state>"` | Named Baseline state: `default · activity · batch · oncall · rep · degraded · unverified · setup · home`. Or call `Vaani.baseline.set(state | [segments] | null)`. |
| `data-back-href` + `data-back-label` | Record and sub-pages: the phone and tablet TopBar shows "‹ Label" instead of the menu/title. |
| `data-topbar-title` | Only when the page has no movable H1 (rare). |
| `[data-page-search]` on one input | Registers `/` to focus it. |

## 5. Shell modes and breakpoints (05-responsive)

| Width / height | Chrome | Notes |
|---|---|---|
| ≥ 1280 | Sidebar 232, Baseline at the bottom of the content column | `[` collapses to the rail (remembered). |
| 1024–1279 | Rail 56; "Expand" opens the sidebar as an overlay | |
| < 1024, or height < 600 | TopBar 52 + NavSheet (hamburger) | The page H1 moves into the TopBar by itself; `.ph-fold` actions hide, `.ph-more` (⋯) shows. |
| < 768 | TopBar + BottomBar (Cockpit, Leads, Call reports, Flows, More) + More sheet | Dialogs become bottom sheets or full screen; menus with > 5 items or a danger item become action sheets. |
| ≥ 1024, ≤ 800 tall, fine pointer | Short mode: tighter chrome | |
| ≤ 720 tall | Baseline folds into the BaselineChip in the page header | |

CSS breakpoints: `max-width: 767.98px` (phone), `min-width: 768px`, `max-width: 1023.98px` / `min-width: 1024px` (tablet shell), `max-width: 1279.98px` / `min-width: 1280px` (rail), `min-height: 600px`, `max-height: 720px`, `max-height: 800px`; `(pointer: coarse)` for touch sizes. Record sheets dock at ≥ 1440 (decided in JS by `Vaani.drawer`). Container queries where a component needs them (`.kv`, `.tr`, `.l-cq`). JS: `Vaani.bp.shell()` returns `'sidebar' | 'rail' | 'topbar' | 'bottombar'`; `Vaani.bp.phone()`, `.desktopShell()`, `.coarse()`, `.compactHeight()`; `Vaani.on('breakpoint', fn)`.

## 6. Page archetypes (main variants)

| Archetype | Markup |
|---|---|
| Overview (Home, Cockpit cards, Analytics, Billing) | `<main class="app-main app-main--bg">` then `.l-container.l-page` with `.l-grid-*` / `.stat-grid` / `.card`s. |
| Data page (Leads, Call reports, Knowledge) | `<main class="app-main app-main--frame">`: `.ph`, optional notice, `.vtabs`, `.tb`, then one `.app-scroll` child that holds `.dt-wrap` (sticky header) and the `.pager`. |
| Form (Settings, profile) | `.l-container.l-container--form` inside a normal `.app-main`. |
| Workbench (Flow Designer, Cockpit call, Assistant) | `.app-main--frame` + your own grid of columns, each column scrolling on its own at ≥ 1024. |
| Record sheet beside a list | Wrap list + sheet in `.with-sheet`; give the sheet `data-dockable` to dock at ≥ 1440 (overlay 1024–1439, modal below). |

## 7. CSS rules for page files

- The list reset in base.css is `ul[class], ol[class] { margin: 0; padding: 0; list-style: none }` (specificity 0,1,1). A single-class page rule loses to it: write `ul.my-list` / `ol.my-steps` when a page list needs its own margin or padding. (Lowering it with `:where()` was measured at integration and moves the sidebar nav, legends and step lists, so it stays.)
- Load order: tokens → base → components → `pages/<file>.css`. Page CSS is **layout only**: grid/flex placement, gaps, widths, `position`, margins, `order`, visibility per breakpoint. Prefix page classes with the page (`.leads-…`, `.cockpit-…`).
- **Tokens only.** No hex, `rgb()`, `hsl()`, named colours, raw `px/rem/em` (media and container conditions excepted), no raw `z-index` above 3 (use `--z-*`), no `transition: all`, no `!important`, no `font-family`, no inline `style=""` lengths. Sizes are tokens or `calc()` of tokens (e.g. `calc(var(--space-40) * 7)` = 280).
- Never restyle a reserved class (anything defined in components.css or base.css). Never add gradients, glass, glow, 3D, decorative illustration or a second accent. Neel (`--accent*`) is for the one primary per region, selection, links and focus. Green, amber and red appear only as state, always with a word and an icon.
- Text floor 12 px (`--type-meta-12`/`--type-label-12`). Numbers get `.num` or `.u-num` (tabular). Phone numbers use `Vaani.ui.phoneText()` (masked, `translate="no"`). Money uses `Vaani.fmt.money()` (`₹2,340.50`, Indian grouping).

**Layout primitives (base.css).** `.l-stack` (+ `--2xs/--xs/--sm/--md/--lg/--xl` gaps), `.l-cluster` (wrapping row; `--xs/--md/--lg` gaps, `--nowrap`), `.l-split` (space-between; `--start`), `.l-spacer`, `.l-center`, `.l-container` (+ `--form`, `--narrow`, `--flush`), `.l-page` (page padding), `.l-grid`, `.l-grid-2/-3/-4` (collapse responsively), `.l-grid-auto` (auto-fit cards), `.l-span-2`, `.l-span-full`, `.l-with-aside` (form-width main + inspector-width aside, one column below 1280), `.l-pair` (two equal columns), `.l-cq` (container-type inline-size).

**Utilities.** `.u-num .u-mono .u-nowrap .u-truncate .u-wrap-anywhere .u-block .u-grow .u-shrink-0 .u-ml-auto .u-mt-4/8/16/24/40 .u-medium .u-semibold`; colour roles `.u-fg .u-fg-2 .u-fg-3 .u-fg-accent .u-fg-success .u-fg-warning .u-fg-danger .u-bg .u-surface .u-surface-2`; responsive `.u-hide-phone .u-only-phone .u-hide-below-lg .u-only-below-lg .u-hide-below-xl .u-only-below-xl .u-hide-touch`; `.sr-only`. Type roles: `.type-display-56/40` (public pages only), `.type-title-24/20/16/14`, `.type-lead-16`, `.type-read-15`, `.type-body-16/14`, `.type-data-13`, `.type-label-13/12`, `.type-meta-12`, `.type-mono-13/12`, `.type-num-28/20`.

## 8. Class naming (components.css header)

Block `.btn`, element `.btn-…` (single hyphen), modifier `.btn--primary` (one per axis). State: ARIA attributes first (`aria-current`, `aria-selected`, `aria-checked`, `aria-expanded`, `aria-disabled`, `aria-invalid`, `aria-busy`), native pseudo-classes second, `.is-*` last and only for runtime states without ARIA (`.is-open`, `.is-floating`, `.is-docked`, `.is-overlay`, `.is-sheet`, `.is-leaving`) or to freeze a state in the gallery (`.is-hover`, `.is-focus`, `.is-press`, never in pages). Disabled controls use `aria-disabled="true"` (stay focusable) plus a reason (`data-tooltip` or adjacent text), never the `disabled` attribute on actions.

## 9. Component index (see `components.html` for each one in every state)

| Component | Classes (block, main parts, modifiers) | Gallery |
|---|---|---|
| Button, IconButton, group | `.btn` `--primary --tertiary --danger --danger-solid --link --sm --lg`; busy `aria-busy="true"` + `.spinner`; `.ibtn` (`aria-label` required, `--sm --lg`); `.btn-group` | `#g-buttons` |
| Tag, StatusTag, CallStateTag, Chip, LiveDot, badge, kbd | `.tag` (tones via `Vaani.ui.statusTag`), `.cs cs--live…`, `.chip`, `.live-dot`, `.count-badge`, `.kbd`, `.kbd-set` | `#g-status` |
| LanguageMark, PhoneText | `.lm`, `.lm-g`, `.phone-text` (use the helpers) | `#g-status` |
| Field and inputs | `.form .form-section .form-actions`, `.field` (`--short --medium`) `.field-label .field-opt .field-hint(--ok) .field-error .field-count`, `.input` (`--sm --lg --readonly --invalid --disabled --multi --mono`) with `.input-prefix .input-suffix .input-affix .input-btn .input-stepper`, `.token`, `.textarea(--composer)` | `#g-fields` |
| Select, Combobox, Listbox | `button.select[data-select]` + `.listbox[role=listbox]` with `.option`; `.input[data-combobox]` + `input[role=combobox]`; `.select-native` only when a native select is required | `#g-fields` |
| Checkbox, Radio, Switch, choice cards | `input.cb`, `input.radio`, `.check(--dense) .check-text .check-desc`, `.fieldset(--row)`, `.rcards .rcard`, `button.switch[role=switch]`, `.setting-row` | `#g-choice` |
| SegmentedControl, Slider, Calendar, Upload | `.seg[role=radiogroup]` (`--sm`), `.slider[data-slider]`, `.cal`, `.dropzone`, `.file-list .file-row` | `#g-choice` |
| PageHeader, ViewTabs, PanelTabs | `.ph .ph-title .ph-meta .ph-actions .ph-fold .ph-more`, `.crumbs`; `.vtabs > .vtabs-list[role=tablist] > .vtab[role=tab]` (+ `.vtab-count`, `.vtab--add` outside the list), `.vtabs--panel` | `#g-tabs` |
| Card, StatTile, KPI strip, Sparkline | `.card` (`--flush --interactive`, `.card-head .card-title .card-meta .card-body .card-foot .card-check`), `.stat-grid .stat .stat-label .stat-value .stat-unit .stat-foot .stat-scope`, `.delta(--good --bad --flat)`, `.kstrip .kstrip-cell`, `Vaani.ui.sparkline()` | `#g-cards` |
| KeyValueList, Timeline, ListRow, Avatar | `.kv(--rows --stacked) .kv-row .kv-label .kv-src .kv-empty`, `.tl .tl-day .tl-list .tl-item .tl-node(--success…) .tl-text .tl-time .tl-detail`, `.li .li-title .li-meta .li-end`, `.av(--20 --32 --voice --ws) .av-stack` | `#g-records` |
| Toolbar, DataTable, BulkBar, Pager | `.tb` with `form.search[role=search]`, `.tb-group.tb-scroll[role=group]` (Filter, `.ftoken`, Clear), `.tb-spacer`, `.tb-count`; `.dt-wrap(--framed) > table.dt(--stack)` with `.c-sel .c-key .c-num .c-act .c-muted .c-trail`, `.th-sort`, `.row-actions`, `.meter`; `.bulk[role=toolbar]`; `.pager` | `#g-table` |
| Dialog, Confirm, Sheet, Popover, Menu, Tooltip, Toast, Palette | `.dlg(--sm --lg)` `.dlg-head .dlg-title .dlg-body .dlg-foot .dlg-why`; `.sheet(--record --detail --gate)` `.sheet-head .sheet-title .sheet-meta .sheet-actions .sheet-body .sheet-foot`; `.pop .pop-head .pop-body .pop-foot`; `.menu .menu-item(--danger) .menu-text .menu-sep .menu-group-label`; `.tooltip`; `.toast`; `.pal` | `#g-overlays` |
| Notice, StatusText, errors, loading, empty, save | `.notice(--info --success --warning --danger --neutral --multi) .notice-body .notice-title .notice-acts .notice-act`, `.cbar`, `.status(--success…)`, `.ierr`, `.details`, `.spinner`, `.sk(--title…)`, `.pbar`, `.stages .smark`, `.empty(--page --compact --danger) .empty-title .empty-actions`, `.save` (use `Vaani.saveState`), `.savebar` | `#g-feedback` |
| Gate, SetupTrack | `.gate .gate-head .gate-title .gate-group .gate-row .gate-mark--pass/--block/--adjusted/--advisory/--checking/--unknown .gate-cost .gate-foot`, `.setup-track .setup-step` | `#g-gate` |
| Voice: CallHeader, transcript, player, voices | `.call-head .call-timer .stepper .lq`, `.tr .tr-head .tr-body > ol` of `Vaani.ui.turn()` rows, `.player .talk .playhead`, `.voices .voice` | `#g-voice` |
| Charts | `.chart` via `Vaani.charts.bars(el, …)`, `.legend`, `.ctip`, `.barlist`, `.funnel`, `.heat .seq-0…5`, `.series-1…4 .series-other`, `.s-pos .s-neu .s-mix .s-neg`, `.chart-empty` | `#g-charts` |
| Shell parts | `.sb .rail .topbar .bbar .bl .nav-sheet .bsheet` (rendered by shell.js; never hand-written) | `#g-shell` |
| Flow canvas (Flow Designer) | `.canvas .node .node-* .ans .sock .edges .phase-*` (canonical section 17) | spec 04-flow-designer |

## 10. Markup patterns

```html
<!-- Dialog: hidden until opened; data-dirty="true" makes Esc/×/scrim show the inline discard state -->
<div class="dlg" id="new-lead" role="dialog" aria-modal="true" aria-labelledby="new-lead-t" data-discard="Discard this lead? What you typed will be lost." hidden>
  <div class="dlg-head"><h2 class="dlg-title" id="new-lead-t">New lead</h2><button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close"><i data-icon="x"></i></button></div>
  <div class="dlg-body">…fields…</div>
  <div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary">Create lead</button></div>
</div>
<button class="btn" type="button" data-dialog-open="new-lead">New lead…</button>

<!-- Sheet (record or gate): Vaani.drawer.open('lead-sheet') picks docked / overlay / modal by width -->
<div class="sheet sheet--record" id="lead-sheet" role="dialog" aria-labelledby="lead-sheet-t" data-dockable hidden>
  <div class="sheet-head"><div class="sheet-heading"><h2 class="sheet-title" id="lead-sheet-t">Aarav Mehta</h2><p class="sheet-meta">Lead 1042</p></div>
    <div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close lead"><i data-icon="x"></i></button></div></div>
  <div class="sheet-body">…</div><div class="sheet-foot">…</div>
</div>

<!-- Menu: trigger with aria-haspopup + aria-controls (or data-menu="id"); items are buttons or links -->
<button class="ibtn" type="button" aria-label="More actions" aria-haspopup="menu" aria-controls="row-menu" aria-expanded="false"><i data-icon="ellipsis"></i></button>
<div class="menu" id="row-menu" role="menu" aria-label="More actions" hidden>
  <button class="menu-item" role="menuitem" type="button"><i data-icon="copy"></i><span class="menu-text"><span>Duplicate</span></span></button>
  <div class="menu-sep" role="separator"></div>
  <button class="menu-item menu-item--danger" role="menuitem" type="button"><i data-icon="trash-2"></i><span class="menu-text"><span>Delete…</span></span></button>
</div>

<!-- Popover: data-popover="id"; [data-popover-close] inside closes it -->
<button class="btn" type="button" data-popover="add-filter" aria-haspopup="dialog" aria-expanded="false">Filter</button>
<div class="pop" id="add-filter" aria-labelledby="add-filter-t" hidden><div class="pop-head"><h2 class="pop-title" id="add-filter-t">Add filter</h2></div><div class="pop-body">…</div><div class="pop-foot"><button class="btn btn--sm btn--primary" type="button" data-popover-close>Show 38 leads</button></div></div>

<!-- Select (button + listbox) and combobox -->
<div class="field"><span class="field-label" id="lang-l">Language</span>
  <button type="button" class="select" data-select aria-controls="lang-lb" aria-labelledby="lang-l lang-v"><span class="select-value" id="lang-v">Hindi</span><i data-icon="chevron-down"></i></button>
  <div class="listbox" id="lang-lb" role="listbox" aria-labelledby="lang-l" hidden><div class="option" role="option" aria-selected="true" data-value="hi"><span class="option-main"><span class="option-label">Hindi</span></span></div>…</div></div>

<!-- Tabs (auto activation; add data-activation="manual" for ViewTabs), segmented, switch -->
<div class="vtabs"><div class="vtabs-list" role="tablist" aria-label="Views" data-activation="manual"><button class="vtab" role="tab" aria-selected="true" type="button">All <span class="vtab-count">1,284</span></button>…</div></div>
<div class="seg" role="radiogroup" aria-label="Range"><button type="button" role="radio" aria-checked="true" data-value="7d">7 days</button>…</div>
<button type="button" class="switch" role="switch" aria-checked="false" aria-labelledby="digest-l"><span class="switch-thumb"></span></button>

<!-- Tooltip: data-tooltip on anything focusable; IconButtons and rail items show their aria-label automatically -->
<button class="btn" type="button" aria-disabled="true" data-tooltip="Outside calling hours. Opens 10 am IST.">Start 3 calls</button>
```

Icons: write `<i data-icon="phone" data-size="sm"></i>` (sizes `xs` 12, `sm` 14, default 16, `lg` 20, `xl` 24, or the numbers; `data-label="…"` makes it a named image), or `VaaniIcon('phone', 'sm')` in JS. `VaaniIcon.names()` lists them; `VaaniIcon.hydrate(root)` after inserting HTML (or call `Vaani.initAll(root)`, which also hydrates).

## 11. JavaScript API (`window.Vaani`)

**Core.** `Vaani.ready(fn)`; `Vaani.on(evt, fn)` / `Vaani.emit(evt, detail)` (document events named `vaani:<evt>`); `Vaani.data` (= `VAANI_DATA`); `Vaani.icon(name, size, opts)`; `Vaani.initAll(root)` (hydrates icons and wires tabs, segmented controls, selects, comboboxes, sliders, tables inside `root`; call it after you inject HTML).
**Utilities.** `Vaani.util`: `esc(s)`, `$(sel, root)`, `$$(sel, root)`, `h(html)` (one element), `uid(prefix)`, `store.get/set/remove` (safe localStorage), `focusables(el)`, `byId(idOrEl)`, `visible(el)`, `isMac`.
**Format** (`Vaani.fmt`, IST, en-IN): `count(n)` 1,284 · `money(v, {whole})` ₹2,340.50 (negatives with a true minus) · `moneyShort(v)` ₹2,341 / ₹85 L / ₹1.2 Cr · `duration(sec)` 2m 31s · `timecode(sec)` 02:31 · `time(iso)` 11:24 am · `date(iso)` 27 Sep 2026 · `dateShort(iso)` 27 Sep · `weekday(iso)` · `when(iso, {time})` Today 10:42 am / Yesterday / 3 days ago · `whenAbs(iso)` · `latency(ms)` · `pct(x)` · `bytes(b)` · `runway(balance, rate)` · `callRange(n, lo, hi, rate)` "₹5 to ₹10" · `now()` (the demo clock, 27 Sep 2026 11:24 am IST; use it, never `new Date()`).
**UI helpers** (return HTML strings): `Vaani.ui.statusTag(domain, value, {v, n, size:'lg', plain})`, `Vaani.ui.callState(state, {timer, pulse})`, `Vaani.ui.langMark(code, 'name'|'full'|'compact')`, `Vaani.ui.phoneText(phone, {size:'sm'})`, `Vaani.ui.avatar(name, {size: 20|28|32, kind: 'person'|'voice'|'ws', tile, label})`, `Vaani.ui.initials(name)`, `Vaani.ui.kbd(keys)` (`'mod+k'`, `['shift','?']`), `Vaani.ui.sparkline(values)` (≥ 7 points), `Vaani.ui.turn(turn, {active, review, perTurnLanguage})` (one transcript `<li>`). `Vaani.charts.bars(el, {data: [{label, value, sub}], unit, label, format})` draws an accessible bar chart with keyboard focus and tooltip.
**Status.** `Vaani.STATUS[domain][value] = [word, icon, tone]`; `Vaani.statusDef(domain, value)`. Never type a status word by hand. `Vaani.CALL_STATE`. Domains in section 12.
**Preferences.** `Vaani.theme.get()` / `.resolved()` / `.set('light'|'dark'|'system')`; `Vaani.motion.get()` / `.set('reduce'|'system')`; `Vaani.density.get(key)` / `.set(el, 'standard'|'compact', key)` (segmented controls with `data-density-for="#table"` do this for you); `Vaani.reducedMotion()`.
**Announce.** `Vaani.announce(message, {politeness: 'assertive', dedupeKey})`: one polite live region, deduped within 2 s.
**Overlays.** `Vaani.dialog.open(idOrEl, {returnTo, onClose, tone, fallback})`, `.close(idOrEl, reason)`, `.setBusy(idOrEl, bool)`, `.confirm({title, body | bodyHtml, bodyClass, impact: [{icon, text | html}], confirmLabel, cancelLabel, tone: 'danger', typedConfirm: {value, label, hint, numeric, inputClass}, focusCancel, returnTo})` → `Promise<boolean>` (tier 3 gets a close button; Enter in the typed field confirms once it matches). `Vaani.drawer.open(idOrEl, {mode: 'auto'|'modal'|'overlay'|'docked', returnTo, onClose, dirty: fn, discard: 'sentence'})`, `.close()`, `.isOpen()`: with `dirty` (or `data-dirty="true"`) Esc, the scrim, × and Cancel show the inline discard state in `.sheet-foot`, exactly like dialogs. The discard state keeps the footer's own nodes (listeners survive "Keep editing"); `data-keep-label` / `data-discard-label` rename its two buttons. Anchored popovers return an entry with `reposition()` for content that grows after opening. Pages without `.app` mark their root `data-inert-root` so modals make it inert; `main [data-drawer-top]` gives an overlay sheet its top edge on a page without `.ph`. `Vaani.popover.open(trigger, id, {modal, placement})`, `.close(id)`, `.toggle()`. `Vaani.menu.open(trigger, id)`, `.close()`. `Vaani.tooltip.show(el)` / `.hide()`. `Vaani.overlays.stack`, `.top()`, `.closeAll()`. Every overlay: focus moves in, modal ones trap Tab and make `.app` inert, Esc closes the top-most one, focus returns to the trigger (or the page H1).
**Toast.** `Vaani.toast(message | {kind, message, action: {label, onClick}, persistent, onDismiss, value})` and `Vaani.toast.success / info / error / undo / progress / publish(message, opts)`; returns `{dismiss(), update({message, value}), done(kind, message)}`. Max 3; success/info/publish leave after 6 s (paused on hover/focus); error, undo and progress stay; toasts raised under a modal wait for it to close. `Vaani.toast.focusNewest()` (F8).
**Save state.** `Vaani.saveState.set(el, 'saved'|'dirty'|'saving'|'error'|'new'|'offline'|'conflict'|'device'|'volatile', {at, edits, tooltip, silent})`. The tooltip is opt-in (pass one; the Flow Designer passes the draft sentence). Error and conflict chips are buttons that fire `vaani:retry` / `vaani:review`.
**Shortcuts.** `Vaani.shortcuts.register(key, handler, {description, group, scope, singleKey, inFields, when, label, displayOnly, hidden: fn})` → `unregister()`. Keys: `'mod+k'`, `'?'`, `'j'`, `'f6'`, `'shift+f6'`, `'shift+1'`, `'alt+.'`, `'mod+enter'`, `'escape'` (Shift+digit and Alt+. / Alt+, match the physical key, so they work with macOS Option; Ctrl/⌘ chords reach the registry even when focus is on a button). `/` is shared: it focuses the visible `[data-page-search]`, including one a page renders later. `hidden` keeps a row out of the ? sheet (the sidebar key in focus mode); one chord per shortcut (no `g` then `c` sequences). Single keys obey the user switch (`Vaani.shortcuts.enabled()` / `.setEnabled(bool)`), never fire in fields, under a modal, or with IME composition. `scope: 'leads-table'` limits a key to focus inside `[data-shortcut-scope~="leads-table"]`. Groups shown in the ? sheet: Everywhere · Lists and tables · Records and sheets · Flow Designer · Forms. `Vaani.shortcuts.openSheet()`.
**Palette.** `Vaani.commandPalette.open()` / `.close()` / `.toggle()`; `.register([{id?, group: 'actions'|'goto'|…, title, meta, icon, keywords: [], kbd, rank: 'top', perform()}])` adds page actions (register them at load; an item with the `id` of a shared one replaces it, e.g. Home's `continue-setup`); `.addGroup(key, label, after)` adds a page-owned group (Assistant chats); `.recent()`, `.addRecent({title, meta, icon, href})` (call when a record opens). Shared content: every destination, Settings and Billing sections, the actions list (Continue setup first while setup is incomplete, Density when the page has a density control), Help, and a Prototype pages group (gallery, sign-in pages, 404). Typed queries order groups by their best match.
**Shell.** `Vaani.nav.setCurrent(id)` / `.current()`; `Vaani.baseline.set(state | segments | null)`; `Vaani.baseline.facts({ liveCalls, batch: {placed, total}, call: {id, kind: 'real'|'test'|'browser', timer, name} | null, setupComplete })` feeds the runtime words of the Activity, Batch and You segments (and the TopBar call chip's name when `DATA.state.myCall = {id, timer, kind}`); `Vaani.wallet.set({ balance, state, runway? })` / `.get()` / `.clear()` after a confirmed top-up moves the Baseline wallet segment, the TopBar chip, the BaselineChip and the Billing badge together; nav badges read `DATA.state` (`assistantWaiting`, `repPresence`, `tasksToConfirm`, …), so a page changes the number and calls `Vaani.shell.render()`; `Vaani.setTitle(record, state)` sets `document.title` ("Aarav Mehta · Leads · Vaani Labs"); `Vaani.openTopUp(source)` (goes to `billing.html?topup=1` unless a page registered `Vaani.topUp.register(fn)`); `Vaani.walletState()`; `Vaani.setupComplete()`; `Vaani.bp.*`; `Vaani.shell.toggleSidebar()`, `.openNavSheet()`, `.openMore()`, `.render()`.
**Widgets.** `Vaani.tabs.select(tab)` / `.init(root)`; `Vaani.seg.select(radio)` / `.init(root)`; `Vaani.table.init(table)` / `.syncSelection(table)`; `Vaani.slider.set(el, value, announce)` (a paired NumberInput). `Vaani.ui.turn(turn, {who: 'You'})` overrides the speaker label; speaker `'guest'` uses the caller lane with its own name. `Vaani.fmt.runway(balance, rate)` follows formatRunway (floored: under a minute · about N min · about 3 h 25 min · about 16 h · about 690 h).

**Events** (all bubble from the element unless noted): `vaani:open`, `vaani:close` {reason} on dialogs/sheets/popovers; `vaani:change` on `.seg` {value, item}, select triggers and comboboxes {value, label, option}, sliders {value}, switches {checked}; `vaani:tabchange` {tab, id, value} on the tablist; `vaani:selection` {count, rows} and `vaani:sort` {column (the th `data-col` or its text), direction} on `table.dt`; `vaani:menuselect` {item, value, checked} on a menu; `vaani:retry`, `vaani:review` on save chips. Document-level via `Vaani.on`: `ready`, `theme`, `motion`, `density`, `shortcuts`, `breakpoint`, `overlayclose`, `draweropen`, `drawerclose`.

**Declarative attributes.** `data-dialog-open="id"`, `data-dialog-close`, `data-drawer-open="id"`, `data-drawer-close`, `data-menu="id"` (or `aria-haspopup="menu"` + `aria-controls`), `data-popover="id"`, `data-popover-close`, `data-placement="bottom-end"`, `data-tooltip="…"` (+ `data-kbd="j"`, `data-tooltip-side`, `data-tooltip-overflow` for truncated text), `data-autofocus` (initial focus in an overlay), `data-cancel`, `data-dirty="true"` / `data-discard="…"` on a dialog, `data-select`, `data-combobox`, `data-slider` (+ `data-step`, `data-suffix`), `data-password-toggle`, `data-select-all` / `data-select-row` in tables, `data-activation="manual"` on a tablist, `data-density-for="#id"` on a segmented control, `data-manual` on a switch you handle yourself, `data-vaani-action="palette|shortcuts|topup|more|navsheet|expand|signout|help"`, `data-shortcut-scope`, `data-page-search`, `data-single-key` (hidden when single keys are off), `data-dockable` on a sheet.

## 12. Data (`window.VAANI_DATA`, also `Vaani.data`)

Everything is fictional (Sample Realty, Pune; people with Indian names; `@samplerealty.example` emails; phones always masked `+91 •••••• 4821`). The demo clock is **Sunday 27 Sep 2026, 11:24 am IST** (`meta.now`); use `Vaani.fmt.now()` and the `_util.ist(daysAgo, 'HH:MM')` helper, never the real date. Do not mutate shared records in ways other pages depend on; copy them if a page needs local state. Never add real customer data.

| Key | Shape (main fields) |
|---|---|
| `meta` | `now, today, tz, tzLabel, locale, currency, ratePerSec` |
| `org` | `name` "Sample Realty", `slug`, `plan`, `role`, `inboundNumber` "+91 80 •••• 2210", `callerId`, `callingHours` (Mon–Sat 10 am–7 pm, Sun 11 am–5 pm), `transferTarget`, `members[] {id, name, short, initials, role, email, lastActive, you}` |
| `user` | `name` "Anika Rao", `short` "Anika R.", `initials`, `role` "Admin", `email`, `phoneMasked`, `twoFactor`, `rep` |
| `workspaces[]` | `id, name, role, current` |
| `setup` | `completedAt` (null), `done` 4, `total` 5, `next`, `nextStepId`, `steps[] {id, title, optional, state, proof, action {label, href}}` |
| `wallet` | `balance` 2340.5, `state`, `runway`, `runwayShort`, `ratePerSec` 0.04, `lowThresholdMin`, `freeMeetingMinutes {left, of}`, `autopay {state, threshold, amount, monthlyLimit, mandateValidUntil}`, `presets` [100, 500, 1000], `min`, `max`, `states {healthy, low, empty, pending, autopay-failed}` (balance and runway per `?wallet=`) |
| `state` | badge counts: `liveCalls` 2, `upNext`, `flowsWithDrafts` 1, `callbacksDueToday` 18, `proposals` 3, `tasksToConfirm` 1, `assistantWaiting`, `numberStatus`, `myCall` |
| `counts` | page totals: `leads` 1284, `calls`, `callsNeedReview`, `flows`, `flowsLive`, `flowsDraft`, `knowledge`, `meetingsPast`, `tasks`, `leadViews`, `callViews` |
| `languages[]` | `code` (`hi`, `en`, `hi-Latn`, `mr`, `ta`, …), `name`, `glyph` (अ, A, अA, …), `lang` |
| `voices[]` | `id, name, tile, languages, style, descriptor, isDefault, available` |
| `flows[]` (16) | `id, shortId, name, language, voice, status` (`live`/`draft`/…), `live {version, since, publishedBy, usedBy[], tested}`, `draft {version, changes, editedAt, editors, saveState, savedAt}` or null, `stepCount, editedAt, usedFor, phases {trigger, logic, action, outcome}`, `validation {errors, warnings, issues[]}`, `nodes[]`, `edges[]`, `diff`, `versions[]`, `frames`. `flows[0]` is "Site-visit qualifier" (`flow_7c21`, live v7, draft v8 with 3 changes) with the full graph |
| `flows[i].nodes[]` | `id` (n1…), `no`, `phase`, `type`, `glyph`, `title`, `summary`, `meta`, `x`, `y`, `outputs[] {id, label?, target}`, plus `answers`/`results`/`writes` where the step has them |
| `flows[i].edges[]` | `id, from, port, to` |
| `templates[]` | `id, name, desc, strip` |
| `leads[]` (40 of 1,284) | `id` (`lead_1042`), `no`, `name, first, initials, city, phone {masked, short, last4}, status` (StatusTag `lead`), `interest` 0–100, `language, flowId, owner, source, unit, budget, createdAt, lastCall {outcome, at, result} or null, callbackAt, dnd, consent, notes[] {by, at, text}` |
| `leadFields[]`, `leadViews[]` | table column catalogue `{id, label, priority}`; saved views `{id, label, count}` |
| `calls[]` (60 of the total) | `id, leadId, leadName, phone, at, direction, kind, test, legs, durationSec, result` (`callResult`), `outcome` (`outcome`), `sentiment`, `flow {id, name, version, draft}`, `languages[]`, `perTurnLanguage`, `cost`, `recording {available, disclosedAtSec, offReason}`, `captured[] {key, value}`, `summary`, `topics[]`, `reviewed`, `needsReview`, `failReason`, `turns[]` |
| turn | `id, speaker` (`agent`/`caller`/`system`), `name, startMs, endMs, text, lang, final, step {label, href}, source? {kind, label}` (Hindi in Devanagari, Hinglish in Latin, English) |
| `live[]` (2) | the calls in progress: `call_live01` Aarav Mehta, live, with partial turns; `call_live02` ringing. Fields: `state, startedAt, stateTimes, flow, voice, language, lineQuality {level, rttMs}, step {label, no, of}, costSoFar, talk {agentPct, callerPct, interruptions}, captured[], turns[]` (the ringing call has no turns yet) |
| `upNext[]` | batches: `id, name, state, placed, total, flow, startedAt` |
| `knowledge[]` (14) | `id, name, type, size` (bytes), `status` (`knowledge`), `passages, updatedAt, by, usedBy[]` |
| `proposals[]` | `id, status, question, answer, source, at` |
| `transactions[]` | ledger: `id, at, kind` (`debit`, `topup` or `refund`), `label, amount` (negative = spend), `balanceAfter` |
| `invoices[]` | `id` (`INV-2026-0920`), `at, description, credit, gst, total, status` |
| `usage[]` (30 days) | `date` (YYYY-MM-DD), `calls, connected, minutes, spend, testCalls` |
| `plans[]` | `payg`, `starter` ₹499, `growth` ₹1,999: `id, name, price, period, rate, current, features[]` |
| `meetings` | `rooms[]`, `past[]` |
| `tasks[]` | personal agents: `id, goal, state` (`task`), `autonomy, decision, limits, updatedAt` |
| `assistant` | `chats[]`, `suggestions[]` |
| `settings` | `nav` (settings sub-nav groups), `integrations[]`, `apiKeys[]`, `webhooks[]`, `sessions[]`, `notifications` |
| `activity[]` | Home feed: `id, at, actor, icon, text` |

## 13. Status map domains (`Vaani.ui.statusTag(domain, value)`)

`lead`: new · contacted · callback_due · interested · not_interested · not_reached · converted · do_not_call. `callResult`: completed · no_answer · busy · voicemail · failed · timed_out. `outcome`: Visit booked · Interested · Callback · Call later · Not interested · No answer · Busy · Voicemail · Transferred · Failed · Do not call · Test call · Promise to pay · Talked. `sentiment`: positive · neutral · mixed · negative · unscored. `flow`: live · draft · not-published · publishing · save-failed · archived (`statusTag('flow', 'live', {v: 7})` gives "Live v7", `statusTag('flow', 'draft', {n: 3})` gives "Draft · 3 changes"). `validation`: ok · warning · warnings · error · errors (`{n}`). `knowledge`: indexed · queued · uploading · reading · indexing · upload_failed · failed. `autopay`, `payment`, `invoice` (paid · refunded · credit-note), `proposal`, `room`, `notes`, `plan`, `task`, `integration` (attention reads "Reconnect needed"), `webhook` (healthy reads "Active"), `delivery` (ok "200 OK" · error `{n}` · timeout "Timed out"), `apiKey` (active · revoked "Revoked {v}"), `number` (ready · pending · none), `review`; `plan` includes stopped. Call states for live calls: `Vaani.ui.callState('idle'|'dialling'|'ringing'|'live'|'hold'|'wrapup'|'ended'|'no_answer'|'busy'|'voicemail'|'failed', {timer: '02:14'})`. An unknown value logs a warning and renders a neutral tag: add missing values to your report, do not hand-write a tag.

## 14. What not to do

- Do not edit `assets/*`, `_template.html`, `components.html`, `_tools/*`. Report gaps instead (component, shell hook or token you needed and why).
- Do not restyle or re-implement a component class, write `<style>` blocks, inline colours or sizes, or add a second accent, gradients, shadows beyond the tokens, glass, glow, 3D or decorative illustration.
- Do not hand-write the sidebar, rail, top bar, bottom bar, Baseline, nav labels, status words, the wallet balance, or the palette. Do not add a wallet banner at any width (the Baseline and TopBar chip carry it; a blocking state is a page Notice).
- Do not show more than one primary button per region, more than one page Notice, or a global alert banner. No toasts for things visible in place; no confirm dialog where Undo works.
- Do not use `disabled` on actions (use `aria-disabled="true"` plus the reason), `title` as the only label, colour alone for state, text under 12 px, placeholder text as a label, or pills for tags (radius 4).
- Do not use `new Date()` for display, real names, real numbers, or data from the audit.
- Do not put anything on `window` except your page's own namespace (`window.VaaniLeads = …`) and do not attach global key listeners: use `Vaani.shortcuts.register`.
- Do not use `localStorage` directly: use `Vaani.util.store` with a `vaani:<page>:` key prefix.
- Do not move focus on page load, trap focus outside overlays, or open anything automatically except through documented URL parameters.

## 15. Checks before hand-in

1. `node prototype/_tools/check-tokens.mjs` and `node prototype/_tools/check-links.mjs` (from the repo root) exit 0. It checks links, component-class hygiene, colours, lengths, z-index, `transition: all`, `!important` and font families across every prototype HTML, CSS and JS file.
2. No console errors at 1440, 1024, 834, 390 and 320 wide, light and dark; no horizontal page scroll at 320.
3. Keyboard only: skip link first; every control reachable in reading order; overlays trap and return focus; Esc closes the top-most overlay; tables have one tab stop with arrow/J/K movement.
4. axe-core (wcag2a/aa, wcag21aa, wcag22aa, best-practice) reports nothing on the page, including with its main overlay open.
5. Reduced motion (account menu "Reduce motion", or the OS setting): nothing slides, spinners are static, live dots do not pulse.

## 16. Shared-layer decisions page builders should know

- Default demo state: setup 4 of 5 (Setup card and "Finish setup" visible), wallet healthy, 2 live calls, Flow "Site-visit qualifier" live v7 with a v8 draft. Use `?setup=done` and `?wallet=…` for other states.
- Top-up opens `billing.html?topup=1` unless the current page registered its own handler with `Vaani.topUp.register(fn)` (billing.js should, and open its top-up sheet).
- Sign out, workspace switch and external links (docs, "Back to website") are not wired in the prototype: they show a confirm or a toast.
- The Rep console lives in `rep-console.html` (`cockpit.html?view=rep-console` redirects there); Meetings and Personal agents in `agents.html?view=meetings|personal-agents`.
- While setup is incomplete the Baseline never says Live or Ready (§5.5): shell.js maps the flow and line segments to "Published v7" and "Verified" on every page. `?setup=done` (or `Vaani.baseline.facts({ setupComplete: true })`) shows the live band.
- Integration changes are listed in `_integration-notes.md`.
- Classes added to components.css at integration: `.status--wrap` (icon + one sentence that wraps beside it, e.g. the reason under a disabled button) and `.status-t` (the text part of an inline StatusText), `.tb-count--static` (a toolbar count that is not a button), `.gate-close` (the close button inside `.gate-head`), `.smark--num` (a numbered step mark), `.input.field--short` / `.input.field--medium` (widths on the input box), `button.topbar-back`, `.bulk.is-leaving`, busy buttons that keep their fill when also `aria-disabled`. `.dt` sticky header styling now applies to `thead th` only; `tbody th[scope=row]` and `tfoot` cells read as cells. `.node-var` uses `--variable-bg` / `--variable-fg`. `.voice-compact` flexes only its label.
- icons.js gained flask-conical, grid-3x3, bell, map, network, unlink, braces, send, move, lock-open, corner-down-right, panel-right, file-up, thumbs-down, layout-list, user-round, shield, building-2, code-xml, megaphone, disc, languages, sheet, text, rows-3 and layout-grid. Static `<i data-icon>` works for all of them; pages no longer register icons.
- Native `<select>` is allowed only with `.select-native` (for long plain lists on phones); everything else uses the button + listbox Select.
- Charts: `Vaani.charts.bars` is the only drawing helper; other charts are markup with the `.barlist`, `.funnel`, `.heat`, `.legend` classes. The chart palette is the spec's (Ink, Teal, Ochre, Rose, Other); do not colour series with Neel or state colours.
- Fonts load from Google Fonts; offline, the metric-matched fallbacks keep layout stable.
