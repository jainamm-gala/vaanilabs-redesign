# Vaani Labs prototype: integration notes

What changed when the parallel page builds were brought together (27 Sep 2026). The page builders' shared requests were read one by one: the ones that fix a real inconsistency or remove duplicated page code were implemented in `assets/*`, and the page-local copies were then deleted. Everything else is listed at the end with the reason it was left.

Checks after integration:

- `node _tools/check-tokens.mjs`: 150 files, 0 problems.
- `node _tools/check-links.mjs` (new): 18 pages and 115 scripts, about 695 local references, 0 broken.
- Every page loaded at 1440×900 and 390×844 (plus agents `?view=personal-agents`): no console errors or warnings, and no horizontal page scroll.
- Screenshots are in `_shots/int-*.png`.

## 1. Shared layer (`assets/*`)

### shell.js: navigation and chrome

- **Rep console route.** The NAV entry and the Baseline "Available for transfers" segment now point at `rep-console.html`. `cockpit.html?view=rep-console` still redirects there, so old links keep working.
- **Nav badges come from `DATA.state`**, so they show on every page:
  - Assistant: `assistantWaiting`, "n waiting".
  - Rep console: `repPresence`, the presence badge (Available, Ringing, On call).
  - A page changes the number and calls `Vaani.shell.render()`. Assistant and Rep console no longer replace `nav.badge` at runtime.
- **One Baseline for every page.** The copy module was rebuilt around dynamic segments:
  - While setup is incomplete (the default demo), the flow and line segments read "Published v7" and "Verified" on every page, never "Live" or "Ready" (03-pages/00 §5.5). Home no longer uses a private `data-baseline="home"`, so the band is byte-identical across pages in the same state. `?setup=done`, or `Vaani.baseline.facts({ setupComplete: true })` (used by Home when all five steps finish), shows the live band.
  - New shared segments: `line-none` ("No calling number · calls can’t be placed · Finish setup (n of 5)", read from the live setup count) and `line-verifying`.
  - `Vaani.baseline.facts({ liveCalls, batch: { placed, total }, call: { id, kind, timer, name } })` feeds the Activity, Batch and You segments. Before this, their counts were computed once when the shell loaded, and "you-call" hard-coded the first lead.
  - Wallet segments are computed from the balance of the state in force (`data.js` `wallet.states`, or a confirmed top-up) with `fmt.runway`. They were fixed strings before.
  - The `rep` state keeps the Activity segment, in spec order.
- **`Vaani.wallet.set({ balance, state, runway })` / `.get()` / `.clear()`.** One call updates the Baseline wallet segment, the TopBar chip, the BaselineChip and the Billing nav badge. `Vaani.walletState()` honours it.
- **TopBar call chip.** The accessible name states the kind ("Live test call, 01:12"), from `DATA.state.myCall.kind`.
- **Skip link.** It moves focus to `#main` without changing `location.hash`. On Billing and Settings, which route on the hash, the old skip link used to switch Billing to its Wallet tab.
- **Offline ConnectionBar.** It uses the demo clock, not the machine clock.
- **Pages without the app shell.** A root marked `[data-inert-root]` is made inert behind modals (used by the auth pages). `body[data-palette]` gives a shell-less page Ctrl/⌘ K and `?` (used by the component gallery).

### shell.js: command palette

- **Continue setup.** While setup is incomplete, "Continue setup: <next step>…" is the first suggested action on every route (§8.3). Items can carry an `id`, and a page item with the same id replaces the shared one. Home does this with `continue-setup` to run the step in place. The 404 page's copy of this action was removed.
- **Empty query.** It shows 4 suggested actions (§8.5): rank-top and page actions first, then New lead, New flow, Import leads and Top up.
- **Typed queries.** Groups are ordered by their best match; on a tie, Actions come before Go to. "setup" puts Continue setup first, "recharge" puts Top up first, and "DID" puts Settings › Phone setup first. To make that last one work, "DID" and "phone setup" were removed from the Settings destination keywords; the Phone setup item carries them, as §8.3 lists.
- **New items and groups:**
  - "Density: Standard" and "Density: Compact", when the page has a density control.
  - A **Prototype pages** group (Component gallery, Sign in, Create account, Reset password, Page not found), so every page is reachable from the palette.
  - Offline, record groups are replaced by "Offline. Records can’t be searched."
- **`Vaani.commandPalette.addGroup(key, label, after)`.** The Assistant uses it for its "Assistant chats" group.
- **Invite teammates.** It opens `settings.html#organization?invite=1`, from both the palette and the workspace menu, which opens the Invite dialog.

### shell.js: shortcuts

- **Ctrl/⌘ chords on buttons.** They now reach the registry when focus is on a button, so Ctrl/⌘+Enter confirms a gate from anywhere inside it.
- **Physical-key matching.** Shift+digit and Alt+. / Alt+, match by physical key (`e.code`). `shift+1` and `alt+.` work on every layout and with macOS Option. The Flow Designer's `alt+≥` / `alt+≤` workaround registrations were removed.
- **Shift+F6.** It is its own chord ("Previous region"). Any page `f6` handler also answers Shift+F6, since those handlers read `e.shiftKey`, unless the page registers its own `shift+f6`. Shift+F-keys are no longer treated as single-key shortcuts.
- **`/` is shared.** It focuses the visible `[data-page-search]`, including a field a page renders after load. Settings' and Agents' own `/` registrations were removed; Agents' search fields got `data-page-search`.
- **`hidden` option.** It keeps a row out of the `?` sheet. The sidebar key `[` is hidden in focus mode (Flow Designer).

### shell.js: overlays and widgets

- **Discard state.** It sets the footer's own nodes aside instead of re-serialising them, so listeners bound to footer buttons survive "Keep editing". `data-keep-label` / `data-discard-label` rename the buttons; the OneTimeSecret now reads "Keep open · Close" as specced. The same guard works for sheets: `Vaani.drawer.open(el, { dirty: fn, discard: '…' })` or `data-dirty="true"` shows the inline discard state in `.sheet-foot`.
- **`Vaani.dialog.confirm`** gained `cancelLabel`, `bodyClass`, impact rows with `html`, and `typedConfirm.label / numeric / inputClass`. Tier 3 gets a close button. Enter in the typed field confirms once it matches, and activating the disabled primary announces why. `bodyHtml` renders in a `<div>` instead of a `<p>`.
- **Reopen race.** Reopening a dialog or sheet while its close animation is still running now finishes that close first. Before, a sheet closed and reopened within 160 ms left a scrim with no sheet (Call reports), and an overlay sheet disappeared.
- **Anchored popovers** expose `entry.reposition()` for content that grows after opening.
- **`main [data-drawer-top]`** gives an overlay sheet its top edge on pages without a `.ph`.
- **`Vaani.saveState`.** The "saved" tooltip is opt-in. It used to talk about drafts and publishing on pages that have neither.
- **`Vaani.slider.set(el, value, announce)`.** Used for a Slider paired with a NumberInput.
- **`Vaani.ui.turn(turn, { who: 'You' })`** overrides the speaker label. Speaker `'guest'` uses the caller lane with the participant's name.
- **`Vaani.fmt.runway`** follows formatRunway (05-knowledge-billing §3): under a minute, about N min, 1–10 h floored to 5 min, whole hours to 99 h, then floored to 10 h.

### Status map (`Vaani.STATUS`)

- **Changed wording:**
  - `plan.stopped`: "Stopped".
  - `integration.attention`: "Reconnect needed" (06-settings §7.4).
  - `webhook.healthy`: "Active" (§7.9).
  - `webhook.paused`: now an outline tag.
- **New domains:**
  - `delivery`: 200 OK · `{n}` · Timed out.
  - `apiKey`: active · "Revoked {v}".
  - `number`: ready · pending · none.

### icons.js

- **Added:** flask-conical, grid-3x3, bell, map, network, unlink, braces, send, move, lock-open, corner-down-right, panel-right, file-up, thumbs-down, layout-list, user-round, shield, building-2, code-xml, megaphone, disc, languages, sheet, text, rows-3, layout-grid.
- **Static markup.** A static `<i data-icon>` now works for all of them. Before, runtime registration came after hydration, which is why Rep console and Assistant used JS placeholders.

### components.css

- `.status--wrap` (icon plus one sentence that wraps beside it) and `.status-t` (the text part of an inline StatusText).
- `.tb-count--static`.
- `.gate-close`: a close slot inside `.gate-head`, laid out as a two-column grid only when present.
- `.gate-scope > span` uses flex-basis 0, so a long settings summary keeps Change on its row.
- `.smark--num`.
- `.input.field--short` and `.input.field--medium`.
- `.field-error .btn--link` keeps the error colour.
- `button.topbar-back` reset.
- `.bulk.is-leaving` exit animation.
- Busy buttons keep their variant fill even when also `aria-disabled`.
- `.dt` sticky header styling applies to `thead th` only; row headers and `tfoot` read as cells. No page renders either today, so nothing moved.
- `.node-var` uses `--variable-bg` / `--variable-fg` (FD1 §5.1).
- `.voice-compact` flexes only its label, so the avatar and level meter keep their size.

### data.js

- **Call counts.** `counts.calls`, `callsNeedReview` and `callViews` now match the Call reports ledger: 2,579 calls, 9 need review, and view counts taken from `VaaniCallReports.viewCounts`. They used to say 121 and 3. The Assistant suggestion now reads "9 calls need review", like Call reports.
- **Masking and key prefix.** Transaction UPI IDs are masked (`a•••••@okbank`), and the API key prefix is `vv_live_` as specced.
- **Setup data.** The setup "verify" step links to `settings.html#phone/caller-id`. The "money" proof reads "about 13 h of calls", from the new formatRunway.

### base.css

Unchanged. Wrapping the `ul[class], ol[class]` reset in `:where()` was measured on every page: it would move the sidebar nav lists by 8 px, and also change legends, Cockpit and Rep console step lists, Analytics example lists and Settings attention lists. The rule stays as it is, and `_foundation-notes.md` §7 now documents it: write `ul.my-list` for page lists.

## 2. Page code (duplicates removed, behaviour kept)

| Page | Change |
|---|---|
| Home | Baseline segments are shared (removed the runtime `SEG` registrations and `data-baseline="home"`). The top-up confirmation calls `Vaani.wallet.set`. The palette item carries `id: 'continue-setup'`. UPI steps use `.smark--num`. Verify links go to `#phone/caller-id`. |
| 404 | Its palette "Continue setup" copy was removed (now shared). |
| Cockpit | Local icon registrations removed. `C.chrome` uses `Vaani.baseline.facts` and `DATA.state.myCall.kind`; the Baseline segments and chip label it used to patch are gone. The gate's global Ctrl/⌘+Enter listener became a registry shortcut. The gate calls `entry.reposition()`. "You" in test-call transcripts comes from `ui.turn({ who })`. `.ck-why` uses `.status--wrap`, and its page CSS and the `.ck-voice-row` flex override were deleted. `?test=` opens a test call to yourself. |
| Rep console | Local icons and the `data-rc-icon` placeholder were removed. The presence badge comes from the NAV config through `DATA.state.repPresence`. Its global keydown listener became `V.shortcuts.register('mod+enter', …)`. Transcript "You" comes from `ui.turn({ who })`. `.rc-why` uses `.status--wrap`. When not available it uses the default Baseline, so the Activity segment stays. |
| Flow Designer | Local icon block removed. `.fd-var` became the shared `.node-var`. The alt-key workaround registrations were removed. The saved tooltip is passed explicitly. It accepts `?version=` (alias of `?v=`; the live version opens the flow itself, and `?node=` wins) and `?test=` (opens the Test panel). |
| Leads | The Call gate head uses `.gate-close`; `.leads-gate-top` and the `.leads-gscope` override were deleted. The gate calls `entry.reposition()`. A running batch shows "Batch · n of m placed" in the Baseline, and a single call adds one to "calls in progress". The Verify fix links to `#phone/caller-id`. |
| Call reports / Analytics | Local flask icon removed. Analytics' "Pending" number tag comes from the status map. |
| Knowledge | The toolbar count uses `.tb-count--static`. Kind icons are the spec's `sheet` and `text`. |
| Billing | `B.runway` delegates to `Vaani.fmt.runway`. Confirmed top-ups, pending payments and first use go through `Vaani.wallet.set`; it no longer patches `Vaani.shell.SEG` or replaces `Vaani.walletState`. Gate close buttons use `.gate-close`; `.bill-gate-x` and `.bill-gate-head` were deleted. The money input uses `.field--short`; `.bill-money` was deleted. |
| Settings | Local icon block removed. `ui.confirm` delegates to `Vaani.dialog.confirm`. The API key rate slider uses `Vaani.slider.set`. Delivery and revoked-key tags come from the status map. The `/` registration was removed (shared). The OneTimeSecret uses "Keep open · Close". |
| Assistant | The icon block and the `data-as-icon` / `fixIcons` placeholders were removed. The nav badge and the "Stopped" word are shared. Recent chats are in an "Assistant chats" palette group. The gate calls `entry.reposition()`. Its F6 handler answers Shift+F6 through the shared twin. |
| Agents | `openGateSheet` uses the drawer's shared discard guard (local `discardState` removed). Cancel task uses `Vaani.dialog.confirm({ cancelLabel: 'Keep task' })` instead of a hand-built alertdialog. `.ag-st-t` became `.status-t`. Meeting turns use speaker `'guest'`, with no class rewriting. Recording uses the `disc` icon. Search fields carry `data-page-search`, and both local `/` registrations were removed. |
| Auth | `.auth-page` carries `data-inert-root`, so the shell makes it inert behind any modal. The manual `inert` toggling in `auth.js` was removed. |
| Component gallery | `data-palette` enables Ctrl/⌘ K and `?`, which the intro text already promised. A new "Open the app" link goes to Home. Baseline examples render the healthy fixture. |

## 3. Shell consistency

All 13 destinations render the same sidebar, rail, nav sheet, bottom bar and More sheet from `Vaani.NAV`: the same labels, icons, groups and badges, with the current item resolved from the file and `?view=`. The account menu (Theme, Motion, single-key switch) and the More sheet (Theme, Motion) carry the theme toggle on every app page.

Every app page loads the template's `<head>` verbatim: THEME_BOOT, fonts, the three shared stylesheets and the three deferred scripts in order. Titles follow "[Record · ]Label · Vaani Labs".

The sign-in pages are intentionally shell-less (public routes), and they omit only the Indic font subset. The gallery is a reference page with its own header.

## 4. Tools

`_tools/check-links.mjs` (Node, no dependencies) checks three things:

- Every `href`, `src`, `srcset`, `data-back-href`, `xlink:href` and `poster` in every page resolves to a file.
- Same-page `#id` targets exist, or are hash routes the page knows.
- Every quoted `<page>.html…` reference in `assets/*.js`, `pages/*.js` and inline scripts names an existing page.

Links into routed pages must name a known route: `settings.html#<page>` (read from `pages/settings-data.js`), `billing.html#<tab>` (from `pages/billing.js`), and `?view=` for Agents and Knowledge. `--verbose` lists runtime-only fragments, such as the `#vl-mark` sprite that shell.js injects. The script exits 1 on any broken link.

## 5. Shared requests not done (and why)

- **App-wide TopUpSheet mounted by the shell.** Home and Billing each still own a sheet; Billing's depends on its reconciled ledger. Moving it needs a shared money-gate module. Every "Top up" without a page handler still opens `billing.html?topup=1`.
- **Promoting page-built components into components.css.** This covers:
  - Flow Designer: header, ToolRail, PromptField, Outline, Problems and Test panels.
  - Settings: nav, section, IntegrationRow, CodeBlock, DangerZone.
  - Knowledge and Billing: Meter, RetrievalResult, UpiPayment, PlanCard.
  - Agents: RoomCard, AutonomyRow.
  - Auth: AuthLayout, OAuthButton, OneTimeCodeInput.
  - Analytics chart renderer.

  Each is a rename across page CSS and JS templates that has to be verified visually. They work as page-prefixed recipes built from tokens; promote them one at a time with gallery entries.
- **Table widget upgrades.** Delegated sort, late-rendered rows, inactive-row controls at `tabindex -1`, PgUp/PgDn, Ctrl+A and Esc to clear. Leads, Knowledge and Billing implement these locally. Moving them into `V.table` would fire alongside the page handlers, so it needs each page migrated in the same change.
- **Pinned-column focus ring (Leads).** It needs a per-cell inset ring that coexists with the selected-row bar. Leads pins only when the table overflows sideways.
- **Tablet "‹ Settings" in the TopBar.** 06-settings §3.5 conflicts with 03-pages/00 (menu button at tablet). Settings keeps its page-header back link.
- **H1 hand-off hook for the Flow Designer.** Its 48 px header works with `data-topbar-title`.
- **Shell-owned chip slot for pages without a `.ph`.** Home's `.home-ph` strip works.
- **Disclosure-row primitive.** Home, Cockpit and Rep console variants differ in layout.
- **Other skipped component variants:** ApprovalCard (`.gate--card` without clipping), IconButton primary, blocked StageProgress mark, two-line sheet title, fixed two-column `.kv`, horizontal StageProgress, ListRow selected state, Toolbar fold order, BulkBar roving keys.
- **Shared parameters and domains:** shared `?role=member`, a TimeField component, knowledge "progress" tone, source brand SVG set, VersionChip helper, room LiveDot pulse, and the palette's "Ask the Assistant: {query}", "Searching records…" and "Couldn't search records" states.
- **Data gaps:** `data.js` knowledge titles and passages, a knowledge-lookup step in flows[0], sample graphs for other flows, the `kind` field on test calls, and lead ids above 1,284 (Call reports links to `lead_2000+`). Pages keep their own reconciled data files.
