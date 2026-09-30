
---

## 12. Live regions and status messages (4.1.3)

### 12.1 Architecture

- **Two visually hidden regions** mounted empty in the AppShell at first paint (a region inserted together with its text is often not read): `<div role="status" aria-live="polite" aria-atomic="true">` and `<div role="alert" aria-live="assertive" aria-atomic="true">`. Both sit outside any `aria-hidden` subtree; while a modal is open, a mirror pair inside the modal is used (a modal hides the rest of the page from assistive tech, O §1.6).
- **One API:** `announce(text, { politeness = 'polite', dedupeKey, throttleMs, lang })`. It dedupes by key, throttles per key (`--timing-announce-throttle`, 2 s, unless the catalogue says otherwise), writes after a 50 ms tick, alternates between two child nodes so an identical message is read again, clears after 7 s, and wraps text in `<span lang>` when `lang` is given.
- **Components never own a live region** except the ones the catalogue names (Toast, SaveState in error, CallHeader's state wrapper, the pager range, GateChecklist summary). A lint rule allowlists `role="alert"` on Toast (error), InlineError and SaveState (error) only (O §20).
- **A status present at page load is not announced** (correct behaviour); only changes are.

### 12.2 The catalogue

| Event | Where | Politeness | Message (copy) | Timing |
|---|---|---|---|---|
| Route change | shell | focus to H1 (no announcement); announcer only when a sheet keeps focus | "Leads loaded" | once |
| Results after search or filter | tables, lists, palette | polite | "38 of 1,284 leads" · "No calls match 'visit' and 2 filters" · "12 results" | after typing settles (300 ms) |
| Selection | tables | polite | "2 leads selected" · "Selection cleared" | debounced 500 ms |
| Sort, page | tables | polite | "Sorted by Last call, newest first" · "Showing 51 to 100 of 1,284 leads" | once per change |
| Record switch | sheets | polite | "Lead 5 of 38" | debounced 500 ms |
| Call state | CallHeader, TopBar call chip | polite | "Dialling" · "Ringing" · "Call live" · "On hold" · "Call ended. Wrap-up" · "No answer" · "Call failed. Couldn't reach the phone line." | debounced 500 ms (a sub-second Dialling → Ringing flip is read once) |
| Incoming transfer | Rep console | **assertive**, once | "Incoming call from Lead 1042. Press Control Enter to answer." | never repeated while ringing |
| Final transcript turn | TranscriptFeed | polite, switchable ("Read new turns aloud", on by default) | "Caller: Saturday ho sakta hai, but morning mein." with `lang` | ≤ 1 per 2 s; several → the latest "and 1 more" |
| Line quality | LineQuality | polite | "Line quality poor. Callers may hear delays." · "Line quality good again" | on crossing a band, not per sample |
| Microphone | Browser call, take-over | polite | "Microphone muted" · "Microphone on" | once |
| Gate readiness | Call gate, Publish gate | polite (`role=status` summary) | "9 calls ready. 3 leads skipped." · "Fix 2 errors to publish." | on change |
| Calls scheduled | after Start | polite | "9 calls scheduled. Selection cleared." | once |
| Flow edit results | canvas, Outline | polite | "Added Speak after Greeting, step 3" · "Connected Yes to Book site visit" · "Deleted Polite close. Press Control Z to undo." | per action |
| Flow issue counts | designer | polite | "2 errors, 1 warning" | 1 s after editing settles, only when the count changes |
| Flow save failed | SaveState | **assertive**, once per failure streak | "Couldn't save. Your last 2 edits are on this device." | not repeated on retries |
| Back online | ConnectionBar, toast | polite | "Back online. 2 edits saved." | once |
| Offline | ConnectionBar | polite | "You're offline. Showing data from 11:42 am." | once |
| Publish | toast | polite | "v8 is live on 1 number and 1 batch" | once |
| Test run step | Flow Test panel | polite | "Reached step 4, Book site visit" · "Test finished. Ended at Visit booked." | ≤ 1 per 2 s; start and end always |
| Wallet crosses low / empty | WalletNotice, Baseline | polite, once per state | "Wallet low. About 17 minutes of calls left." · "Wallet is ₹0. Phone calls are paused." | once per crossing |
| Upload, index, import, export | Knowledge, Leads, Billing | polite | "Indexing price-sheet.pdf" → "price-sheet.pdf indexed, 42 passages" · "Importing 1,240 leads" → "1,236 leads imported. 4 rows need fixing." | start and end only |
| Action outcomes | toasts | success/info polite; error assertive | "Lead added" · "Couldn't refresh. Retry." | Radix Toast `background` / `foreground` |
| Copy to clipboard | any Copy button | polite | "Copied" | once |
| Validation after submit | forms | focus moves (§11.2) | — | — |

**Never announced:** timers and time-in-state, cost so far, wallet decrements, partial (interim) transcript turns, audio meter levels, per-keystroke validation, hover content, intermediate progress percentages, status changes of rows the user is not on, the Baseline's routine updates, autosave "Saving…" and "Saved".

### 12.3 The transcript is not `role="log"`

F-A11Y-014 suggested `role="log"`. The redesign deliberately does not use it (N §12.4): a log is an implicit polite live region, and the live transcript rewrites the partial turn many times per second, so a log would read every interim word. Instead the feed is a plain `ol` of turns, and only **final** turns go through `announce()`, throttled, with the speaker and `lang`. O §4.5 still says `role="log"`; §24 corrects it.

### 12.4 Choosing the channel

| Situation | Use | Not |
|---|---|---|
| A condition present while the page is open (wallet low, outside calling hours, template pending) | Notice `role="status"` | `role="alert"` (F-A11Y-015) |
| A change the user caused and should hear (saved, added, connected, results) | `announce()` polite, or a success Toast | an alert |
| A failure of the user's own action that stops the task | InlineError `role="alert"`, error Toast, SaveState error | a silent red border |
| Something only visible elsewhere on screen (an export ready) | Toast | a persistent banner |
| Validation on submit | Focus move (§11.2) | a live region that reads every error |

### 12.5 Announcement copy rules

State first, then the object, then what to do: "Call failed. Couldn't reach the phone line." Short (under 12 words where possible). Units spelled out ("17 minutes"). No "successfully", no exclamation marks, no emoji, no internal names. Names of leads and flows are in the message only when the user acted on them.

---

## 13. Colour and contrast (1.4.1, 1.4.3, 1.4.11)

The proof is `spec/tokens/contrast-report.md`: 396 required pairs, 198 per theme, **all pass**, generated by `check-contrast.mjs`, which exits 1 on any failure and runs in CI (CT-01). Every text pair clears 4.5:1, so type size never decides legibility; every UI boundary, state indicator and focus ring clears 3:1.

### 13.1 Rules

1. **Tokens only.** No hex, `rgb()`, `hsl()` or `oklch()` in app code; no raw Tailwind palette classes; no arbitrary colour values (F §1.3, LN-02).
2. **No alpha on text, ever.** Opacity is for graphics only and never on an ancestor of text (F §10); dimmed and unreachable flow steps dim their tiles, sockets and connectors and keep full-contrast text on `--surface-2`. Disabled text uses `--text-dis` (exempt, and always with a reason nearby).
3. **A new pair ships only after it is added to `check-contrast.mjs`.** White-label tenants may override Neel primitives only, and CI runs the script against the tenant's values (F §1.2).
4. **Colour is never alone** (1.4.1): every state has a word and an icon; links in running text are underlined; selection adds a bar, border or check; chart series have direct labels or a legend plus **View as table**; diff states carry tags and strike-through or underline.
5. **Non-text contrast** (1.4.11): inputs, checkboxes, radios, switch tracks and sockets use `--control` (≥ 3.06 light, ≥ 3.01 dark, on every plane including a hovered selected row); state borders equal their solid (≥ 3:1); edges on the canvas ≥ 3:1; chart marks ≥ 3:1 on `--surface`.
6. **Contrast is checked on rendered pages too.** The compositing scanner from the audit (it resolves alpha and ancestor opacity, which axe files as `incomplete`) runs on every route in both themes; zero text nodes may fall below 4.5:1 (CT-02). The Flow Designer fixture for CT-02 includes **an unreachable step and phase emphasis on** (steps of other phases de-emphasised) in both themes, so dimming can never reintroduce sub-AA text.

### 13.2 The audit's failures and their replacements

| Audit finding (before) | Ratio before | After | Ratio after |
|---|---|---|---|
| Muted text `#7A8397` on white / `#EEF1F7` (F-A11Y-008) | 3.80 / 3.36 | `--text-3` `#5F6878` on `--surface` / `--surface-3` | 5.62 / 4.70 |
| Black on primary blue `#2F5FE0` (F-A11Y-009) | 3.83 | `--on-accent` white on `--accent` `#2B45C2` (dark: on `#3752DA`) | 7.68 (6.21) |
| Wallet "Top up", ink on blue | 3.27 | Notice link `--warning-text` on `--warning-soft` | 6.18 |
| Placeholders `#C3C8D2` on `#F4F6FA` (F-A11Y-020) | 1.56 | Placeholder `--text-3` on `--surface` | 5.62 |
| Dark placeholders `#3B404B` on `#111419` | 1.78 | `--text-3` dark `#8C94A2` on `--surface` | 5.88 |
| Em-dash fillers at 50 % muted (F-A11Y-019) | 1.75 | Blank cell with sr-only "No value", or "–" in `--text-3` | ≥ 4.70 |
| Status chips BROWSER, NEUTRAL, COMPLETED (F-A11Y-019) | 2.56–3.57 | Status text on its soft tint | ≥ 5.47 |
| "FLOW VALIDATED", "Private" at 40 % alpha | 2.58 / 1.99 | Computed issues chip; Visibility as text | ≥ 5.47 |
| Node titles at 9.3 px rendered (F-FLOW-008) | 3.01–3.31 | `--text` titles 14/600, nothing below 12 px at any zoom | 17.93 |
| Marketing scrolled nav, light (F-A11Y-021) | 1.39 | Solid `--surface` header | ≥ 8.76 |
| Marketing violet CTA (F-A11Y-009, -029) | 3.98 | Neel primary | 7.68 |
| Focus halo 14 % alpha, `#92ABED` border (F-A11Y-006) | 1.2 / 2.11 | `--focus` outline | ≥ 6.15 |

### 13.3 Forced colours and dark theme

- Forced colours: focus stays a 2 px `Highlight` **outline** with its offset; anything with `aria-selected`, `aria-current` or `data-selected` gets a **4 px `Highlight` bar on its inline-start edge** (rows: the first cell), never an outline, so a focused row, a selected row and the current nav item stay distinct and the current page never looks focused (focused + selected shows both); state marks (`data-mark`: live dot, connected sockets, legend swatches, stepper nodes) fill with `CanvasText`, and free sockets and ports (`data-mark="hollow"`) are a `Canvas` fill with a 2 px `CanvasText` ring, so free versus connected survives; edges (`data-edge`) stroke in `CanvasText`, the fallback edge stays dashed; notices get their transparent border back; the Baseline keeps a `CanvasText` top rule (`base.css`). Tested with Chromium's forced-colours emulation (VR-02) and a real Windows Contrast theme (MN-02).
- Dark theme is not an inversion: every dark value is proven separately (F §3.7). Dark mode is a user choice (System · Light · Dark), never the only route to legibility.

---

## 14. Motion and reduced motion (2.2.2, 2.3.1, 2.3.3)

### 14.1 What may move

| Motion | Duration | Under reduced motion (the OS setting or the in-app preference, §14.3) |
|---|---|---|
| Hover, press, colour, border changes | `--dur-fast` 90 ms | kept (not movement) |
| Popovers, menus, tooltips (fade + 4 px) | `--dur-base` 140 ms | fade only (`--shift-*` become 0) |
| Dialogs, sheets, toasts, rail overlay (fade + 8 px or slide) | `--dur-slow` 200 ms | fade only |
| Test-run trace along an edge (one shot) | `--dur-trace` 480 ms | skipped; reached steps are marked instead |
| Live dot pulse | `--dur-pulse` 1,600 ms × **3 cycles** each time a call enters Live, then steady | still dot; the word "Live" carries the state |
| Audio meters (real audio only) | ≤ 15 fps | a static level, updated at most once a second |
| Busy spinner (a request the user started; essential while it runs) | appears after 200 ms, one turn per 800 ms (`--dur-spin`, O §21) | frozen; the "…" label and `aria-busy` carry it |
| Playhead (real playback) | real time | unchanged (it is state) |
| Follow-mode scroll in the transcript | `smooth` | `auto` (jump) |

Nothing else moves: no idle rings, breathing, blinking STANDBY, marching-ants edges, skeleton shimmer, scroll reveals, hover lifts or parallax (D §7). Nothing flashes (2.3.1).

### 14.2 Why the live-dot pulse is bounded

2.2.2 requires a way to pause any moving or blinking content that starts by itself, lasts more than 5 s and sits beside other content. A call is often live for minutes, and the Cockpit can show several live dots. Three pulses (4.8 s) on entering Live draw the eye to the change, then the dot holds steady. This amends F §11 and N §5.4 (§24). Audio meters are exempt as essential real-time information, and they stop when the audio stops.

### 14.3 Implementation

- **Two sources, one rule set.** Reduced motion applies when `@media (prefers-reduced-motion: reduce)` matches **or** `<html data-motion="reduce">` is set (the in-app preference below; `reduce` is the only value). `build-tokens.mjs` emits the same token block for both selectors, so `tokens.css` zeroes `--shift-popover`, `--shift-dialog`, `--shift-toast`, `--shift-sheet`, `--dur-trace`, `--dur-pulse`, `--dur-spin` and `--live-pulse-cycles` under either; `base.css` caps keyframe animations (1 ms, one iteration) and makes scrolling instant under the media query and again under `:root[data-motion="reduce"] *` (F §11, 07-motion §13.2). Tailwind's built-in `motion-reduce:` sees only the media query, so app code uses the `reduced:` custom variant, which covers both.
- **JavaScript reads one hook.** `useReducedMotion()` (07-motion §13.3) is true when either source applies and updates on change. Every JS-driven motion (canvas trace, meters, `requestAnimationFrame` loops, `scrollIntoView` behaviour, React Flow durations) reads it, never `matchMedia` alone. Framer Motion, if kept, runs inside `<MotionConfig reducedMotion={pref === 'reduce' ? 'always' : 'user'}>`.
- **An in-app setting** mirrors the OS preference for people who cannot change it (shared or managed office machines): Account menu › Motion: **Match system** · **Reduce motion** (07-motion MD4). It sets `data-motion="reduce"` on `<html>` before first paint: the server layout renders the attribute when it knows the stored preference, and otherwise `THEME_BOOT` (F §15.3) sets it from `localStorage['vaani:motion']` (`system` | `reduce`), so the first frame never slides. Match system removes the attribute and the media query decides; no option forces motion on when the OS asks for less. The `MotionSetting` component (§23) switches it live, without a reload.
- `transition: all` is banned; only `transform` and `opacity` animate (F §11).
