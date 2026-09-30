# QA round 2: core pages

Pages: `index.html` (Home), `404.html`, `cockpit.html`, `rep-console.html`, `components.html`.
Date: 27 Sep 2026. Tool: Playwright (Chromium), one isolated cookie-less context per run, opened over `file://`.
Screenshots: `_shots/qa-r2-core/` (67 files).

Every bug below was reproduced at least twice. Round-1 IDs keep their numbers. New bugs are `R2C-nn`.

## Scope and method

- **Widths:** 1440×900, 1280×800 and 1024×768 (desktop), 768×1024 (touch, coarse pointer), 390×844 and 360×780 (mobile emulation). Short laptops: 1280×609 and 1366×657.
- **Checks at each width:** full-page screenshot (looked at), overflow check, text under 12 px, visible navigation. On touch widths, hit areas were probed with `elementFromPoint` 21 px from the centre, so `::after` extensions count.
- **axe-core 4.10.2** (`preload: false`):
  - Default load of all five pages, light and dark.
  - Cockpit Call gate open (dark).
  - Rep console on call (light) and wrap-up (dark).
  - Home `setup=done` and `demo=new` (dark).
- **Keyboard walkthroughs:**
  - Home: skip link, Call gate trap, Esc, Top-up sheet and Invite dialog.
  - Cockpit: `/`, Contact combobox, `C`, Ctrl+Enter, Tab to End call, wrap-up Outcome select, Cancel-batch dialog, gate Schedule choice.
  - Rep console: Go available, Ctrl+Enter answer, `M`, `H`, End call, Save and go available.
  - Shell: 768 NavSheet, CallSwitcher chip, Ctrl+K palette.
  - Gallery: dialog with discard confirm, drawer, popover, automatic and manual tabs, toasts.
- **Live regions:** a MutationObserver logged every text change inside `role=status|alert` and `aria-live` regions during calls.
- **Prototype states:** Cockpit 34 states, Rep console 19, Home 11, 404 all 5.
- **Reduced motion:** `document.getAnimations()`.

## Metrics

| Page | axe light / dark | Console errors (load and every state run) | Horizontal overflow at 1440 / 1280 / 1024 / 768 / 390 / 360 | Text < 12 px | Touch targets < 44 px |
|---|---|---|---|---|---|
| index.html | 0 / 0 (`setup=done` dark 0, `demo=new` dark 0) | 0 | 0 at every width | none | none |
| 404.html | 0 / 0 | 0 | 0 at every width | none | none |
| cockpit.html | 0 / 0 (gate open dark 0) | 0. End call at 8 s now works | 0 at every width, also gate, live and wrap-up at 360 | none | none |
| rep-console.html | 0 (on call) / 0 (wrap-up) | 0 | 0 at every width | none | Audio devices summary, 358×32 (**R2C-03**) |
| components.html | 0 / 0 (each run about 7.5 s) | 0 | 0; the table and section nav scroll inside their own containers | none | not measured (gallery) |

**Other checks:**
- At 768 the "−15" `scrollWidth` result is only the vertical scrollbar; nothing overflows.
- Reduced motion: no animations run on Rep console ringing, Home waiting, Cockpit live or Rep console available.
- Without reduced motion, only the Home waiting spinners run.
- Navigation is reachable at every width:
  - Sidebar at 1440 and 1280.
  - Rail at 1024.
  - Hamburger NavSheet at 768.
  - Bottom bar plus More at 390 and 360.

## Round-1 bugs: verification

All 17 listed bugs are fixed.

| ID | Result | Evidence |
|---|---|---|
| R1C-02 | Fixed | `?demo=run&lead=lead_1050`, End call at 00:08: Wrap-up renders, Outcome "Talked" / Contacted, focus on `H3#ck-wrap-h`, title "Wrap-up · Cockpit", no errors. `ck-endcall-1440.png` |
| R1C-03 | Fixed | Outcome select, Enter, ArrowDown, Enter: focus returns to `#ck-w-out`. Mouse pick "Callback" does the same; Callback date and time appear |
| R1C-04 | Fixed on Rep console | Ringing, answer and hold log only "Incoming call…", "Call live with Aarav Mehta.", "Caller on hold", "Call resumed". No timers. Cockpit still has it: **R2C-01** |
| R1C-05 | Fixed | `#rc-go` keeps focus: Go available, then Connecting… (`aria-busy`), then Go offline, and back |
| R1C-08 | Fixed | 1280: switcher "Calls · 2 live", nav "2 live", header "2 live calls" |
| R1C-09 | Fixed | During own call: Baseline "2 calls in progress · On call 00:05 · Priya Nair", header "3 live calls" |
| R1C-11 | Fixed | Real `offline` event: one bar with the "already live" sentence; Pause and Cancel… have `aria-disabled` plus a tooltip reason, and re-enable online. `ck-offline.png` |
| R1C-12 | Fixed on Home | `demo=new` and `first-run`: no live, waiting, draft or confirm badges. Other pages still differ: **R2C-04** |
| R1C-13 | Fixed | Step copy, sheet and new balance all say "about 3 h 25 min" |
| R1C-14 | Fixed | "Talk to us" is `mailto:` with an sr-only hint (see Notes) |
| R1C-15 | Fixed | 00:00–00:05 legend reads "No speech yet" |
| R1C-16 | Fixed | Buttons are "Keep batch" / "Cancel batch"; focus starts on Keep batch; Esc returns to "Cancel…" |
| R1C-19 | Fixed | 390 idle: one divider. 390 live: transcript directly under Call details. `ck-390-idle.png`, `ck-390-live.png` |
| R1C-20 | Fixed | Title "Couldn't load · Cockpit · Vaani Labs"; block top-aligned with 48 px padding. The pattern still differs from 404: **R2C-12** |
| R1C-21 | Fixed | Nav reads "Rep console ☎ Ringing" in the pending tone. `rc-ringing.png` |
| R1C-22 | Fixed | 1280×609 and 1366×657: ₹2,340 chip beside the H1; "Call my number…" above the fold |
| R1C-23 | Fixed | The "To" value breaks only after a separator. At 360 the gate stacks label over value |

Also re-checked in passing, all fixed:
- R1C-01: the palette performs rows.
- R1C-06: link buttons reach 44 px on touch.
- R1C-07: Shift+Tab from the gate title wraps to Place call.
- R1C-18: TopBar chip "Live 03:42" on Rep console 390, and the Cockpit switcher is in the TopBar chip at 768 and below.

## New bugs (most severe first)

### R2C-01 · MAJOR · cockpit · accessibility · Call-state tag with a running timer sits in `role="status"`
**Repro:**
1. Open `cockpit.html?demo=run&lead=lead_1050`.
2. Log live-region changes.

`span#ck-cs.ck-cs[role=status]` in `.call-head-row` changes every second:
- "Dialling… 00:00", "00:01", "00:02"
- "Ringing… 00:00", "00:01", "00:02"

The shell announcer also says "Dialling", "Ringing" and "Call live", so each state word is announced twice.

Supervising a ringing call (`?call=call_live02`) announces "Ringing… 00:04, 00:05, 00:06…" until it connects. `?demo=run-test` behaves the same. This is the Cockpit twin of R1C-04.

**Expected:** Timers are never announced, and each state word is announced once (CK §4.5).

**Fix:** In `pages/cockpit-callcard.js:47`, drop `role="status"` from `#ck-cs` and keep the state words on `V.announce`, as Rep console now does.

### R2C-02 · MINOR · cockpit · accessibility · "Schedule" in the Call gate drops focus to `<body>`
**Repro:**
1. Open `cockpit.html?new=1&lead=lead_1050&demo=after-hours`.
2. Press Enter on "Call Priya Nair…".
3. Tab to the calling-hours row's "Schedule" and press Enter.

`document.activeElement` is `BODY`, outside the `aria-modal` gate. The next Tab recovers to Close. Clicking with the mouse loses focus the same way.

**Expected:** Focus lands on the now-checked "Schedule for 10 am IST" radio, or on the primary "Schedule call" (WCAG 2.4.3; gate §4.5).

**Fix:** In `pages/cockpit-gate.js:129`, `G.schedule` should focus the checked choice after `rerender()`.

### R2C-03 · MINOR · rep-console · accessibility · Audio devices summary is 32 px tall on touch
**Repro:** Open `rep-console.html` at 390 (touch) or 768 (coarse pointer). Probes 21 px above and below the "Audio devices · Default devices" summary hit `DETAILS.rc-details` and `.rc-details-body`, not the summary. Its box is 358×32.

**Expected:** 44 px on touch (CK §4.5; 06-accessibility).

**Fix:** In `pages/rep-console.css:36`, `.rc-details > summary { min-height: var(--space-32) }` should use the hit token (44) under `(pointer: coarse)`.

### R2C-04 · MINOR · shared · content · The default workspace contradicts itself between Home and every other page
**Repro:**
1. Open `index.html`. The state is setup 4 of 5 and "Call yourself" is not done. There is no Cockpit badge, no "calls in progress", Leads has no "18 due" and Knowledge has no "3 to review".
2. Click Cockpit. The same workspace now shows:
   - "Cockpit ● 2 live", "Leads 18 due" and "Knowledge 3 to review".
   - Baseline "2 calls in progress".
   - Eight completed customer calls in Recent.
   - The sidebar card still says "Finish setup 4 of 5 · Next: call yourself".

Rep console, 404 and the gallery match Cockpit.

**Expected:** One coherent default (F-UX-006: no activity before setup allows calls).

**Fix:** The rule lives only in `pages/index.js:275` (`quietWorkspace`). Do one of these:
- Move it to `assets/shell.js` or `assets/data.js` so every page applies it while `!V.setupComplete()`.
- Make the prototype's default workspace setup-complete on non-Home pages.

### R2C-05 · MINOR · shared · content · Priya Nair (lead_1050, the running example) has three different last calls
**Repro:** With `cockpit.html?new=1&lead=lead_1050`, compare:
- Lead details: "Last call 20 Sep 2026 · Call later".
- Previous calls: "Callback · 4m 0s · 4 days ago".
- The gate: "Callback due today, 4:00 pm".
- `leads.html`: "Call later · Yesterday", with the callback set for yesterday at 6 pm.

**Expected:** One record everywhere.

**Fix:** `pages/leads-data.js:91` patches `list[1].lastCall` and `callbackAt` for Leads only, and `assets/data.js` randomises `daysAgo`. Move the lead_1050 patch into `assets/data.js`, and build Cockpit's "Previous calls" from that same `lastCall`.

### R2C-06 · MINOR · shared · accessibility · Nav badge screen-reader text is not pluralised
**Repro:** On any page, the Personal agents link's accessible name is "Personal agents 1 to confirm, **1 tasks** waiting for you to confirm".

`count()` in `assets/shell.js:125` appends one fixed phrase. The same helper would also produce:
- "1 proposals to review"
- "1 callbacks due today"
- "3 flow with unpublished changes"

**Fix:** Pass singular and plural phrases, for example `count(n, word, srOne, srMany)`.

### R2C-07 · MINOR · cockpit · accessibility · Call gate failure is announced twice
**Repro:** Open `cockpit.html?new=1&lead=lead_1050&demo=gate-fail`, then Call Priya Nair… and Place call. Two alerts carry the same sentence:
- The InlineError `div.ierr[role=alert]` inserted in `.gate-body`.
- `V.announce(g.error, { politeness: 'assertive' })` at `pages/cockpit-gate.js:110`, through the assertive `role=alert` region.

Focus then moves to Retry. (`leads-gate.js:155` does the same.)

**Expected:** One announcement (CK §4.5: failures use `role=alert` via InlineError).

**Fix:** Drop the extra `V.announce`.

### R2C-08 · MINOR · index · spec-fidelity · Home Call gate has no Close button
**Repro:** On `index.html`, choose Call my number…. Neither the popover at 1440 nor the bottom sheet at 390 has a close control. Tab cycles only Cancel ↔ Place call. The Cockpit gate has a Close ×.

**Expected:** The gate header has a Close IconButton, `aria-label="Close"`: 28 px in popovers, 32 px in sheets (gate §1, header row).

**Fix:** Add it to `#home-call-gate .gate-head` (`index.html:86`) and wire it in `pages/index-overlays.js`. Screenshots: `home-gate-esc.png`, `home-390-gate.png`.

### R2C-09 · MINOR · shared · interaction · Palette "Call Aarav Mehta…" promises the Call gate for a lead already on a call
**Repro:**
1. On `cockpit.html`, press Ctrl+K and type "call 4821".
2. The row reads "Call Aarav Mehta… · +91 •••••• 4821 · opens the Call gate". Press Enter.

You land on `leads.html?lead=lead_1042` with the lead sheet open and the toast "On a call now. Open it in Cockpit." No gate opens, and you are sent back to the page you came from. `palette-call4821.png`

**Expected:** Enter opens the Call gate (03-pages/00 acceptance). Either:
- Open the gate showing the blocking row, as `cockpit.html?new=1&lead=lead_1042` does.
- Label the row "On a call now · Open in Cockpit" and select that call.

**Fix:** In `assets/shell.js:931`, check live calls before building the verb row. From Cockpit, target `cockpit.html?new=1&lead=…` instead of Leads.

### R2C-10 · MINOR · cockpit · content · The "Outside calling hours" demo contradicts the stated hours
**Repro:** Open `cockpit.html?new=1&lead=lead_1050&demo=after-hours`. The card and gate say "Outside calling hours. Opens 10 am IST tomorrow." with the sub-line "Calling hours on Sundays: 11 am to 5 pm IST". The prototype clock is Sun 27 Sep, 11:24 am, which is inside those hours. The default gate says "Inside calling hours · open until 5 pm IST".

**Fix:** In `pages/cockpit-core.js:107/138`, give the after-hours demo a clock after 5 pm, or hours that exclude 11:24 am.

### R2C-11 · MINOR · rep-console · content · Demo timestamps are in the future
**Repro:**
- `rep-console.html?demo=missed`: "You missed a transfer at 11:40 am".
- `?demo=net-drop`: "You were set offline at 11:42 am because the connection dropped".

"Now" is 11:24 am on every page (Baseline "as of 11:24 am"; Home "Updated 11:24 am").

**Fix:** In `pages/rep-console.js:303/311`, derive the time from the demo clock, or use 11:20 am and 11:22 am.

### R2C-12 · MINOR · cockpit · spec-fidelity · The Cockpit PageError is not the shared PageError
**Repro:** Compare `cockpit.html?demo=page-error` with `404.html?demo=error`. On Cockpit:
- Retry is `<a class="btn btn--primary" href="cockpit.html">`: a link that reloads the whole page, with no refresh icon.
- The secondary is a filled secondary button, where 404 uses tertiary.
- Details has no Copy for the error id and no time.

**Expected:** One pattern (03-pages/00 §15.1–15.3):
- "Retry refetches without a reload".
- Details shows the error id with Copy.

**Fix:** Render it through the same helper as `pages/404.js`, and make Retry a button that re-runs the load in place (`pages/cockpit.js:156`).

### R2C-13 · MINOR · cockpit, rep-console · content · Straight apostrophes in UI copy
**Repro:** Cockpit and Rep console use straight apostrophes, while Home and 404 use curly ones:
- Cockpit: "Cockpit couldn't load.", "Couldn't reach the phone line…" and the title "Couldn't load · Cockpit".
- Rep console: "Transferred calls don't ring here while you're offline."
- Home and 404: "Call reports couldn’t load.", "don’t".

The same gate error is straight in `cockpit-gate.js` and curly in `leads-gate.js`.

**Expected:** Real characters (01-foundations, glyph table: “ ” ’).

**Fix:** Replace `'` with `’` in the UI strings of `pages/cockpit*.js` and `pages/rep-console*.js` (about 80 occurrences), and in the matching `assets/shell.js` strings.

### R2C-14 · MINOR · rep-console · spec-fidelity · The phone call header shows the timer three times
**Repro:** Open `rep-console.html?demo=oncall` at 390. The time appears in three places:
- The TopBar chip "Live 03:42".
- The card tag "Live 03:42".
- The `num` timer "03:42" on the same row.

Cockpit's phone header shows only a "Live" tag plus the timer. `rc-390-oncall.png`

**Expected:** Phone wireframe CK §5.5: "Live · Transferred     03:41" (the tag has no timer).

**Fix:** Below 768, drop the timer from the availability tag, or everywhere to match Cockpit (`pages/rep-console-view.js`).

### R2C-15 · MINOR · cockpit · visual · At 768 the Voice picker and Language select are different heights side by side
**Repro:** Open `cockpit.html` at 768 (touch). `.voice-compact.ck-voice-row` is 48 px tall and `#ck-lang` is 44 px, both at top 428, so their bottoms are 4 px apart. `cockpit-768.png`

**Fix:** In `pages/cockpit.css`, give the voice row the field height token on touch, or stretch both cells.

### R2C-16 · MINOR · components · visual · Gallery header wraps badly at 360 and 390
**Repro:** Open `components.html` at 360:
- The "Panes" label ends row 1 (top 58, left 230) and its segmented control starts row 2 (top 96, left 16).
- Class lists and spec names break at hyphens: "--" / "link", "02-" / "components-data-nav", "03-" / "pages/00…".

`components-360.png`

**Fix:**
- Wrap each label with its control in one `nowrap` group.
- Put `white-space: nowrap` on each class and file token.

## Notes (not filed as bugs)

- **Esc on a gate with a tooltip showing:** When "Place call" has keyboard focus, its tooltip is showing and the first Esc only hides the tooltip. The second Esc closes the gate. This is WCAG 1.4.13-conformant.
- **Toggle labels:** Mute/Unmute and Hold/Resume change their labels *and* use `aria-pressed`. The spec asks for exactly this (CK §7.7, line 828). It is flagged for the spec owners, because APG advises a fixed label for pressed toggles.
- **Support address:** "Talk to us" mails `support@vaanilabs.in`, a real-looking production address, while "Setup guide" uses `help.vaanilabs.example`. Confirm with the Vaani team, or use a `.example` placeholder.
- **Talk ratio:** "Agent 100% · Caller 0%" appears as soon as the agent greets. That is correct, since only the agent has spoken.
