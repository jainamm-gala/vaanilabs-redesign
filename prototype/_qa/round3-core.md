# QA round 3: core pages

Pages: `index.html` (Home), `404.html`, `cockpit.html`, `rep-console.html`, `components.html`.
Date: 27 Sep 2026. Tool: Playwright (Chromium), one isolated cookie-less context per run, pages opened over `file://`.
Screenshots: `_shots/qa-r3-core/` (76 files).

Every bug below was reproduced in the browser this round. Round-2 IDs keep their numbers. New bugs are numbered `R3C-nn`.

## Scope and method

- **Widths:**
  - Desktop contexts: 1440×900, 1280×800 and 1024×768.
  - Touch contexts (`isMobile`, `hasTouch`, coarse pointer): 768×1024, 390×844 and 360×780.
  - The CDP-only override from the task template left the layout at 768 while the screenshot was 360 wide, so every touch width uses its own context.
- **Checks at each width:**
  - Screenshot, looked at.
  - Overflow check.
  - Text under 12 px.
  - Visible navigation.
  - Touch probe: each control under 44 px is scrolled to the centre, then `elementFromPoint` is probed 21 px from its centre, so `::after` hit areas count. Prototype-states chrome is excluded.
- **axe-core 4.10.2** (`preload: false`). The first run without it logged CORS errors for axe's own stylesheet fetches; those were not page errors. States run:
  - Cockpit, light: idle, supervising, browser test.
  - Cockpit, dark: lead chosen, Call gate open, wrap-up, page error.
  - Cockpit: `?` shortcuts sheet and ⌘K palette.
  - Rep console: offline and on call (light); ringing, wrap-up save-fail and connect-failed (dark).
  - Home: default and Call gate (light); first-run with wallet ₹0, Top-up sheet and `setup=done` (dark).
  - 404: all four routes, light and dark alternating.
  - Gallery: light and dark (6.0 s and 7.7 s).
- **Keyboard walkthroughs:**
  - Cockpit:
    - Skip link, `/`, the Contact combobox and `C`.
    - The gate: Tab trap, Esc, Ctrl+Enter and focus to the call heading.
    - End call, then focus to Wrap-up; wrap-up save-fail and Retry.
    - F6 and Shift+F6; Calls column ↑ ↓ Home End Enter.
    - Pause, and Cancel… (ConfirmDialog).
    - Take over, `M`, Hand back; Transfer…
    - Edit for this call with Save to lead.
    - Schedule in the gate.
  - Rep console:
    - Go available, ring, Decline.
    - Ctrl+Enter, `H`, `H`, `M`.
  - Home: tab order, Call gate, Invite dialog, Top-up sheet.
  - 404: Search → palette, SessionExpired dialog, Retry.
  - Gallery: dirty dialog with discard, drawer, popover, menu, automatic and manual tabs, toast.
  - Shell: 768 NavSheet, CallSwitcher chip, phone More sheet, theme switch persisting across pages.
- **Live regions:** a MutationObserver logged every text change inside `role=status|alert|log` and `aria-live` during calls. Accessible names were confirmed through CDP `Accessibility.getPartialAXTree`.
- **Prototype states:**
  - Cockpit: all 42 links.
  - Rep console: 9 states.
  - Home: 14 links.
  - 404: all 5.
- **Reduced motion:** `document.getAnimations()`.

## Metrics

| Page | axe violations | Console errors | Overflow at 1440 / 1280 / 1024 / 768 / 390 / 360 | Text < 12 px | Touch targets < 44 px |
|---|---|---|---|---|---|
| index.html | 0 in all 5 runs | 0 (14 states) | 0 at every width | none | none |
| 404.html | 0 in all 4 routes, light and dark | 0 | 0 at every width | none | none |
| cockpit.html | 0 in 7 page states. `?` sheet: 1 serious `aria-prohibited-attr` (**R3C-02**, shared) | 0 (42 states plus every walkthrough) | 0 at every width, also gate, live and details at 390 | none | `a.turn-step` 80×16 in the live transcript (**R3C-06**) |
| rep-console.html | 0 except ringing: 1 serious `aria-prohibited-attr` (**R3C-02**) | 0 | 0 at every width | none | Audio devices and Transcript summaries 358×32 (**R2C-03**); `.lq` 101×24; `.turn-step` 16 px tall (**R3C-06**) |
| components.html | 0 / 0 | 0 | 0; the section nav scrolls inside its own container | none | not measured (gallery) |

**Other checks:**
- **Reduced motion.** No animation runs on any of these:
  - Cockpit idle.
  - Cockpit while supervising a live call (the LiveDot pulses only on your own call).
  - Rep console ringing and Home waiting, with reduced motion on.
- **Navigation is reachable at every width:**
  - Sidebar at 1440 and 1280.
  - Rail at 1024.
  - Hamburger NavSheet at 768. Focus goes into the sheet, and Esc returns it to "Open navigation".
  - Bottom bar plus More sheet at 390 and 360.
- **Theme:** Dark from the More sheet sets `data-theme="dark"` and persists to Rep console.

## Round-2 bugs: verification

| ID | Result | Evidence |
|---|---|---|
| **R2C-01** | **Fixed** | See the three runs below |
| R2C-02 | Still open | `activeElement` is `BODY` after Schedule |
| R2C-03 | Still open | 32 px at 768, 390 and 360; also the "Transcript · 5 turns" summary on call |
| R2C-04 | Still open | 404, Cockpit and Rep console show "2 live", "18 due", "3 to review", "2 calls in progress" beside "Finish setup 4 of 5" (`404-1440.png`); Home does not |
| R2C-05 | Still open | Four different facts for Priya Nair |
| R2C-06 | Still open | CDP name: "Personal agents , 1 tasks waiting for you to confirm" |
| R2C-07 | Still open | `div.ierr[role=alert]` in `#ck-gate` plus the shell `sr-only[role=alert]` carry the same sentence |
| R2C-08 | Still open | Gate controls are only "Cancel · Place call" at 1440 and at 390 (sheet) |
| R2C-09 | Still open | Ctrl+K "call 4821", Enter: `leads.html?lead=lead_1042` with the toast "On a call now. Open it in Cockpit." |
| R2C-10 | Still open | Card: "Outside calling hours. Opens 10 am IST tomorrow. Calling hours on Sundays: 11 am to 5 pm IST" at 11:24 am Sunday |
| R2C-11 | Still open | `?demo=missed` "at 11:40 am"; `?demo=net-drop` "at 11:42 am" |
| R2C-12 | Still open | `.ck-error` still has `<a class="btn btn--primary" href="cockpit.html">Retry</a>`, a filled secondary, and no Copy (`ck-page-error.png`) |
| R2C-13 | Still open | Straight apostrophes remain; examples below |
| R2C-14 | Still open | 390 on call shows three timers (`rc-390-oncall.png`) |
| R2C-15 | Still open | Voice row 48 px vs Language 44 px at top 428 (768 touch) |
| R2C-16 | Still open | At 360 and 390 "Panes" sits at (230, 58) and its control at (16, 96); class lists still break at hyphens (`components-360.png`) |

**R2C-01 evidence.** `#ck-cs` has no `role` and no live ancestor. The live-region log for each run:
- `?demo=run&lead=lead_1050`: "Dialling", "Ringing", "Call live", then transcript turns at least 3 s apart.
- `?call=call_live02`: only "Call live".
- `?demo=run-test`: "Dialling", "Ringing", "Call live".

No timer is announced and no state word is repeated.

**R2C-05 detail.** The four facts for Priya Nair:
- Cockpit Lead details: "Last call 20 Sep 2026 · Call later".
- Cockpit Previous calls: "Callback · 4m 0s · 4 days ago".
- The gate: "Callback due today, 4:00 pm".
- Leads: "Callback overdue · was due yesterday 6:00 pm" and "heard on the call on 26 Sep".

**R2C-13 examples:**
- Rep console: "don't", "you're", "flow's".
- Cockpit: "Cockpit couldn't load.", "Priya didn't say anything…", "28 calls won't be placed.", "Couldn't save the outcome."

No round-1 fix has regressed. Rechecked in passing:
- R1C-02, R1C-03 and R1C-05.
- R1C-07: Shift+Tab wraps inside the gate.
- R1C-16: the Cancel-batch dialog opens on "Keep batch" and Esc returns focus to "Cancel…".

## New bugs (most severe first)

### R3C-01 · MAJOR · cockpit · content · Calls that never connected are charged, and Failed contradicts itself
**Repro:**
1. Open `cockpit.html?demo=failed&lead=lead_1050`.
2. Wait for the call to reach Failed (about 2 s).

The Wrap-up line says "Couldn't reach the phone line. You were not charged." The Cost row under it says "₹0.10 · ₹0.04/s" (`ck-failed.png`). Other states show the same:
- `demo=busy`: "₹0.18".
- `demo=no-answer`: "₹0.36".
- A ringing call (`?call=call_live02`): "₹0.37 so far", climbing every second. It was "₹2.84 so far" while stuck ringing.

The cost is `C.elapsed(c) * CK.RATE` from the dial time (`pages/cockpit-callcard.js:70`, `pages/cockpit-call.js:180`).

**Expected:** Only connected seconds are billed. A call that is Failed, Busy, No answer or still ringing shows no running cost. The Failed copy "You were not charged" (CK §4.1) must match the Cost row.

**Fix:** Compute cost from `c.stateTimes.live` (answer) to the end. For terminal states that never connected, render "₹0 · not billed". Do not tick `[data-ck-cost]` before Live.

### R3C-02 · MAJOR · shared · accessibility · The Enter keycap uses `aria-label` on `<kbd>` (axe serious)
**Repro:**
1. Run axe on `rep-console.html?demo=ringing`. It reports `aria-prohibited-attr` (serious) on `kbd[aria-label="Enter"]`: the "Answer with Ctrl ↵" hint.
2. On `cockpit.html`, press `?`. The same violation is reported in the shortcuts sheet ("Confirm the Call gate Ctrl ↵").

`aria-label` is not allowed on an element with no role, so the key name is dropped. A screen reader hears "Answer with Ctrl" and nothing more.

**Expected:** Zero `aria-*` violations in the ringing state (CK §4.8 and §5.12), and the keycap is read as "Enter".

**Fix:** In `assets/shell.js:207`, render `<kbd class="kbd"><span class="sr-only">Enter</span>` followed by the icon with `aria-hidden="true"`. Or give the `<kbd>` `role="img"` with the label.

### R3C-03 · MINOR · cockpit · spec-fidelity · A stuck call still shows a running timer and cost
**Repro:** Open `cockpit.html?call=call_live02&demo=stuck` and read the page twice, 2.2 s apart (`ck-stuck.png`). The header does show "No update for 60 s · Check status", and the header timer is gone. But three things keep ticking:
- The state tag: "Ringing… 01:04" becomes "Ringing… 01:07".
- The Calls column item: "01:08 · No update for 60 s" becomes "01:11".
- Cost: "₹2.73 so far" becomes "₹2.84".

**Expected:** "Never a frozen timer" is replaced by the warning; a stale call never shows a running timer (CK §1.2, §4.8).

**Fix:**
- In `pages/cockpit-callcard.js:16` (`stateTag`), drop the `cs-t` timer when `c.stale`.
- Do the same for the list item time in `pages/cockpit-feed.js`.
- Stop the cost tick for stale calls.

### R3C-04 · MINOR · cockpit · content · "No answer after 30 s." after 7 s of ringing
**Repro:** Open `cockpit.html?demo=no-answer&lead=lead_1050` and wait about 10 s. The stepper reads "Ringing 00:02 · No answer 00:09", the header timer "00:09", and the reason "No answer after 30 s." (`ck-no-answer.png`).

**Expected:** The reason matches the time shown.

**Fix:** In `pages/cockpit-call.js:102`, either queue the terminal event 30 s after ringing starts, or build the sentence from the actual ring time.

### R3C-05 · MINOR · rep-console · spec-fidelity · Baseline drops "You" while the rep is on a call
**Repro:** Open `rep-console.html?demo=oncall` (or `demo=hold`) at 1440.
- The Baseline reads "… Wallet ₹2,340.50 · about 16 h of calls | 1 call in progress", with no "● On call 03:41 · Aarav Mehta" segment.
- The Activity count already subtracts the rep's call (it is 2 when Available), so that call is now in no segment.
- On Cockpit your own call shows "● On call 00:07 · Priya Nair" (`ck-live-1440.png`).

**Expected:** Segment 5 "during your own call: ● On call 02:14 · Lead 1042" (03-pages/00 §5.2).

**Fix:** In `pages/rep-console.js:129`, use `V.baseline.set(p === 'available' ? 'rep' : on ? 'oncall' : null)`.

### R3C-06 · MINOR · shared · accessibility · LineQuality buttons and transcript "Step ·" links are under 44 px on touch
**Repro:**
- `rep-console.html?demo=oncall` at 390 (touch): `button.lq` "Your connection quality…" and "Phone line quality…" are 101×24. Probes 21 px above and below miss them.
- The same page and `cockpit.html?call=call_live01` at 390: `a.turn-step` "Open step: Greeting" is 80×16 and "Open step: Ask about a site visit" is 144×16.

The coarse-pointer hit-area rule in `assets/components.css` (about line 151) covers `.kv dd a[href]` and unclassed links, but not `.lq` (min-height `--size-hit-min`, 24) or `.turn-step`.

**Expected:** 44×44 on touch (06-accessibility; CK §4.5 "Targets").

**Fix:** Add `.lq` and `.turn-step` to the `@media (pointer: coarse)` `::after` hit-area rule, with `position: relative`.

### R3C-07 · MINOR · cockpit · accessibility · Re-rendering the card drops keyboard focus to `<body>`
**Repro A:**
1. Open `cockpit.html?new=1&lead=lead_1050`.
2. Choose Edit for this call…, type in City, check "Also save to Priya Nair" (Space), then activate "Use and save to lead".

Focus moves to `#ck-ld-edit` and then, about 900 ms later, to `BODY`, because the save result re-renders the block. This happens:
- on success ("Saved 11:24 am");
- on failure (`&demo=lead-save-fail`, "Couldn't save · Retry");
- again after Enter on that Retry chip.

**Repro B:**
1. Open `cockpit.html?demo=transfer-fail&lead=lead_1050`.
2. Transfer…, then Transfer.

Focus goes to `#ck-cc-transfer` and 2 ms later to `BODY`: the focusout event has `relatedTarget: null`, because the card re-renders for "Transferring…".

**Expected:** Focus stays on a logical control after a re-render (WCAG 2.4.3; CK §4.5 "Closing any popover returns focus to its trigger").

**Fix:** In `renderLead()` (`pages/cockpit-newcall.js` about line 189) and in the card re-render for transfer state (`pages/cockpit-callcard.js` about line 267), save `document.activeElement.id` before replacing the HTML and focus the new element with that id afterwards. This is the same family as R2C-02.

### R3C-08 · MINOR · cockpit · accessibility · Wrap-up "Retry" re-fires the failure alert as "Couldn't save the outcome. Saving…"
**Repro:**
1. Open `cockpit.html?demo=wrapup,save-fail&lead=lead_1050` and choose Save. You get `div.ierr[role=alert]` "Couldn't save the outcome. Retry".
2. Activate Retry.

The button is inside the alert, and its label changes to "Saving…" with `aria-busy`. The live log records a second alert, "Couldn't save the outcome. Saving…". Rep console removes the InlineError on retry and does not have this problem.

**Expected:** The failure is announced once. Progress is not announced as part of an alert.

**Fix:** In the Cockpit wrap-up, remove the InlineError when Retry starts (as `pages/rep-console.js` does), or keep the Retry button outside the `role=alert` element.

### R3C-09 · MINOR · rep-console · spec-fidelity · Ringing removes "Go offline" and moves focus on its own
**Repro:**
1. Open `rep-console.html` and press Enter on "Go available". Focus stays on `#rc-go`, now "Go offline".
2. Wait for the transfer to ring (about 7 s).

A focusin event moves focus to `H2#rc-soft-h` "Softphone". The visible buttons are only Answer, Decline and "Show all 5 checks"; Go offline is gone (`rc-ring-after-go.png`).

**Expected:**
- "Focus does not move on its own" when a transfer rings (CK §5.12).
- The ring can be stopped with Go offline (§5.7), and wireframe E keeps "Go offline" under the incoming card.

**Fix:** In `pages/rep-console-view.js`, keep the availability line and Go offline rendered below the IncomingCallCard while ringing, so the focused button survives. Do not call `set(…, 'rc-soft-h')` on ring.

### R3C-10 · MINOR · cockpit · content · After Take over the flow keeps running and the operator's speech never appears
**Repro:** Open `cockpit.html?demo=takeover&lead=lead_1050` and wait 15 s. After the "You took over · Vaani is paused" row, the transcript adds:
- "Caller: Price kya hai?…"
- "Knowledge lookup · price-sheet.pdf · 2 passages"
- "Caller: Haan, Saturday morning theek rahega."
- "Moved to step 4 · Book site visit"

Captured so far goes to 2 of 3, while the card says "Vaani is paused" and "You're talking". No "You" turn is shown (`ck-takeover-6s.png`), so the caller answers questions nobody asked. Rep console shows the rep's turns as "You".

**Expected:**
- While taken over, the agent does not look up knowledge or advance steps.
- The operator's turns appear as "You" (CK §4.1 "Taken over").

**Fix:** In the demo script (`pages/cockpit-call.js`), skip agent, knowledge and step events while `c.takenOver`, and insert "You" turns, reusing the Rep console turn builder.

### R3C-11 · MINOR · cockpit · content · "Role can't place phone calls" still shows the billed kind line
**Repro:** Open `cockpit.html?new=1&lead=lead_1050&demo=role`. The primary is correctly hidden and readiness says "Your role can't place phone calls. Ask an admin." But the footer still reads "Real call to Priya Nair · billed at ₹0.04/s" above a lone "Talk in browser" (`ck-role.png`).

**Expected:** The kind line describes the action that can run ("Browser test · free"), or is hidden with the primary (CK §4.1 "Role can't call").

**Fix:** In `pages/cockpit-newcall.js` (footer, about line 241), hide `#ck-kind` when the primary is hidden, or switch it to the browser-test kind.

## Round-2 bugs still open (reproduced this round; original IDs and fixes stand)

The round-2 report has the full repro and fix for each one. Only the re-check is summarised here.

| ID | Sev | Page | Re-check (27 Sep, round 3) |
|---|---|---|---|
| R2C-02 | minor | cockpit | `?new=1&lead=lead_1050&demo=after-hours`: open the gate, focus "Schedule" and press Enter. `activeElement` is `BODY`, and the next Tab lands on Close. `pages/cockpit-gate.js:129` `G.schedule` still only re-renders |
| R2C-03 | minor | rep-console | `.rc-details > summary` is 32 px tall at 768, 390 and 360 (`pages/rep-console.css:36`, `min-height: var(--space-32)`). The on-call "Transcript · 5 turns" summary uses the same class and fails too |
| R2C-04 | minor | shared | `404.html` and `cockpit.html` show "Cockpit ● 2 live", "Knowledge 3 to review", "Leads 18 due" and "2 calls in progress" beside "Finish setup 4 of 5 · Next: call yourself". `index.html` shows none of them |
| R2C-05 | minor | shared | Priya Nair: "Last call 20 Sep 2026 · Call later" · "Callback · 4 days ago" · "Callback due today, 4:00 pm" · Leads "Callback overdue · was due yesterday 6:00 pm". `pages/leads-data.js:91` is unchanged |
| R2C-06 | minor | shared | CDP accessible name: "Personal agents , 1 tasks waiting for you to confirm". `count()` at `assets/shell.js:125` is unchanged |
| R2C-07 | minor | cockpit | `demo=gate-fail`: `div.ierr[role=alert]` in `#ck-gate` plus the shell `div.sr-only[role=alert]` carry the same sentence. `V.announce(g.error, {politeness:'assertive'})` is still at `pages/cockpit-gate.js:110` |
| R2C-08 | minor | index | Home Call gate at 1440 (popover) and 390 (sheet): the only controls are Cancel and Place call; no Close. `index.html:86` is unchanged |
| R2C-09 | minor | shared | Ctrl+K "call 4821", Enter: lands on `leads.html?lead=lead_1042` with the toast "On a call now. Open it in Cockpit.", and no gate |
| R2C-10 | minor | cockpit | `demo=after-hours` card and gate: "Outside calling hours. Opens 10 am IST tomorrow." with "Calling hours on Sundays: 11 am to 5 pm IST", at 11:24 am Sunday |
| R2C-11 | minor | rep-console | `demo=missed` "You missed a transfer at 11:40 am"; `demo=net-drop` "set offline at 11:42 am". Now is 11:24 am |
| R2C-12 | minor | cockpit | `demo=page-error`: Retry is still `<a href="cockpit.html">`, the secondary is a filled `.btn`, and Details has no Copy or time |
| R2C-13 | minor | cockpit, rep-console | Straight apostrophes in rendered UI: "don't", "you're", "flow's" (Rep console); "couldn't", "didn't", "won't" (Cockpit) |
| R2C-14 | minor | rep-console | 390 `demo=oncall`: TopBar "Live 03:42", tag "Live 03:42" and timer "03:42" (`rc-390-oncall.png`) |
| R2C-15 | minor | cockpit | 768 touch: `.ck-voice-row` is 48 px and `#ck-lang` 44 px, both at top 428. Their text sizes also differ, 12/14 px vs 16 px (`cockpit-768.png`) |
| R2C-16 | minor | components | 360 and 390: the "Panes" label ends row 1 and its control starts row 2. ".btn · … · --" / "link" and "02-" / "components-overlay-feedback" still break at hyphens (`components-360.png`) |

## Notes (not filed as bugs)

- **Cockpit `<title>` during a call.** The prototype uses the state word: "Dialling · Cockpit", "Live call · Cockpit", "Wrap-up · Cockpit", "Call failed · Cockpit". The specs disagree with each other:
  - CK §4.8: "Live call · Cockpit · Vaani Labs" only while a call is shown.
  - 03-pages/00 §4.4: "On call · Cockpit · Vaani Labs".

  Neither ticks per second. Needs a spec-owner decision.
- **Home after setup.** `?setup=done` adds Next steps, Today and Wallet above the five setup checks. This answers open question 6 (`pages/index-overview.js` header). The spec (§13.5) keeps only the checks, but they are still present. Documented deviation, not filed.
- **SessionExpired closes on Esc.** Esc returns focus to the trigger. The spec is silent; confirm whether the dialog should be dismissible.
- **Cockpit supervising.** Supervising another call shows no pulse, and your own call pulses only without reduced motion. Both correct.
- **Gallery dirty dialog.**
  - Esc shows the inline discard state with focus on Keep editing.
  - A second Esc keeps editing and focuses the field.
  - Discard closes and returns focus to "New lead…".

  All as in overlay §2.5.
- **Touch runs.** Use a context per size with `isMobile` and `hasTouch`. The CDP-only override in the task template does not re-lay out the page after navigation.
