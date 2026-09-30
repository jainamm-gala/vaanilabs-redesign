# QA round 1: core pages

Pages: `index.html` (Home), `404.html`, `cockpit.html`, `rep-console.html`, `components.html`.
Date: 27 Sep 2026. Tool: Playwright (Chromium). Each run used an isolated, cookie-less context opened over `file://`.
Screenshots: `_shots/qa-r1-core/`.

Every bug below was reproduced at least twice. When a stack trace is quoted, it was captured from `pageerror`.

## Scope and method

- **Widths:** 1440×900, 1280×800, 1024×768, 768×1024 (touch, coarse pointer), 390×844 and 360×780 (mobile emulation), and 320×640.
- **Short laptops:** 1280×609, 1366×657, 1100×700 and 720×450.
- **Themes:** light and dark, from `prefers-color-scheme` and from the gallery Theme switch.
- **Reduced motion:** checked with `document.getAnimations()`.
- **Checks at each size:** overflow, text under 12 px, and touch hit areas. Hit areas were measured by probing with `elementFromPoint`, so `::after` hit extensions count.
- **axe-core 4.10.2:** default load of all five pages in both themes. Also these states:
  - Cockpit Call gate open (light).
  - Cockpit Wrap-up (dark).
  - Rep console ringing at 390 (dark).
  - Home "Failed steps" at 390 (dark).
  - 404 variants: record, forbidden and error.
- **Keyboard walkthroughs:**
  - Home: skip link, the track, Call gate, Top-up sheet, Invite dialog.
  - Cockpit: `/`, the Contact combobox, `C`, gate with Ctrl+Enter, call, End call, wrap-up, save; also the Calls list roving focus, FlowSwitcher, F6 and the `?` sheet.
  - Rep console: Go available, ringing, Ctrl+Enter, M, H, End call, wrap-up, Save and go available; also the ⋯ menu.
  - Shell: Ctrl+K palette, tablet NavSheet, phone More sheet and Sign out confirmation.
  - Gallery overlays: dialog, confirm, sheet, popover, menu, `?` sheet and toasts; also tabs.
- **Prototype states:**
  - Home: all 14.
  - Cockpit: all 42 (New call and Call gate states for readiness copy and disabled reasons; call states with a 9 s wait for terminal outcomes).
  - Rep console: all 25.
  - 404: all 5.

## Metrics

| Page | axe (light / dark) | Console errors on load | Runtime JS errors | Horizontal overflow (1440, 1280, 1024, 768, 390, 360, 320) | Text < 12 px |
|---|---|---|---|---|---|
| index.html | 0 / 0 (also 0 in "Failed steps" at 390 dark) | 0 | 0 on the page. The shared palette error in R1C-01 fires here | 0 at every width | none |
| 404.html | 0 / 0 (record, forbidden and error variants: 0) | 0 | palette (R1C-01), from the Search button | 0 at every width | none |
| cockpit.html | 0 / 0 (gate open: 0; wrap-up dark: 0) | 0 | **R1C-02** End call crash; palette (R1C-01) | 0 at every width, including 720×450 | none |
| rep-console.html | 0 / 0 (ringing at 390 dark: 0) | 0 | 0 | 0 at every width | none |
| components.html | 0 (a full-page run took 6.3 s) | 0 | palette (R1C-01), from Ctrl+K | 0. The table overflows only inside its own scroll container | none |

**Other checks:**
- Reduced motion: no running animations on Cockpit during a live call, on Rep console on call, on Home, or on idle Cockpit.
- One visible `nav[aria-label=Main]` at every width.
- The first Tab lands on the skip link. Enter moves focus to `<main>` and leaves the URL unchanged.

## Bugs (most severe first)

### R1C-01 · BLOCKER · shared (`assets/shell.js`) · Command palette can't open any result

**Repro:**
1. On `index.html`, press Ctrl+K and type "Leads".
2. Press Enter, or click the row.

Nothing happens and the console logs `Uncaught TypeError: Cannot read properties of undefined (reading 'getAttribute') at perform (assets/shell.js:902)`. The same happens from Cockpit, 404 → Search and the gallery. Typing "call 4821" and pressing Enter does not open the Call gate. Search ranking itself is correct: "DID" puts Phone setup first, "dashboard" returns Cockpit, "recharge" puts Top up… first.

**Expected:** Enter or click performs the row (03-pages/00 §8.6).

**Fix:** In `perform(i)`, `$` is `querySelector` (it returns one element), so `$('.pal-row', state.list)[i]` is `undefined`. Use `$$('.pal-row', state.list)[i]`.

Screenshot: `palette-call4821.png`.

### R1C-02 · BLOCKER · cockpit · Ending a real call in its first ~20 s crashes the wrap-up

**Repro:**
1. Open `cockpit.html?new=1&lead=lead_1050`.
2. Choose Call Priya Nair… and then Place call.
3. Wait about 8 s, then click End call. `?demo=run&lead=lead_1050` reproduces it too.

The console logs `TypeError: Cannot read properties of undefined (reading '1')`, from `sel (pages/cockpit-callcard.js:79)` ← `wrapHtml (:91)` ← `C.end (cockpit-call.js:187)`. The announcer says "Call ended. Wrap-up", but the card stays frozen on "Live 00:08" with End call still visible. The `<title>` stays "Live call…" and the Baseline still shows "On call 00:08".

**Cause:** `C.end` sets `c.outcome = 'Talked'` when the flow is before step 4 and nothing was captured. 'Talked' is not in `OUT` or `MAP`, so `opts.filter(…)[0][1]` throws.

**Expected:** Wrap-up renders and focus goes to the Wrap-up heading (CK §3.6, §4.1, §4.5).

**Fix:** Add 'Talked' to `OUT`, mapped to `contacted` in `MAP`, or choose another default. Also make `sel()` fall back to `opts[0]` when the value isn't found.

Screenshot: `cockpit-endcall-crash.png`.

### R1C-03 · MAJOR · cockpit · Changing the Wrap-up Outcome moves keyboard focus to the H1

**Repro:**
1. Open `cockpit.html?demo=wrapup&lead=lead_1050`.
2. Focus Outcome and press Enter.
3. Press ArrowDown, then Enter.

`document.activeElement` becomes `H1#page-title`. Choosing with the mouse does the same. Notes text survives. Lead status keeps focus correctly.

**Expected:** Focus returns to the Outcome trigger `#ck-w-out` (WCAG 2.4.3; a Select returns focus to its trigger).

**Fix:** After the section re-renders in `cockpit-callcard.js`, restore focus to `#ck-w-out`. Better: update Lead status and the Callback date and time fields in place instead of re-rendering.

### R1C-04 · MAJOR · rep-console · Running timers sit inside `role="status"` and are announced every second

**Repro:**
1. Open `rep-console.html?demo=ringing`.
2. Watch `.rc-inc-top > span[role=status]`, which reads "Ringing… 00:00", then "…00:01".
3. Answer the call. `.call-head-row > span[role=status]` reads "Live 01:04", "Live 01:05", then "On hold 00:00".

The polite region re-announces on every tick. The ringing announcement is also doubled: the assertive "Incoming call from …" plus the polite tag. LineQuality "Reconnecting… 4 s" is in `role=status` too.

**Expected:** Timers are never announced (CK §4.5, §5.10; gate §4.7). State words are announced once, on change.

**Fix:** In `rep-console-view.js` lines 74, 97, 107, 113 and 119, remove `role="status"` from the tag wrappers, or keep the Timer outside the live region. Announce the state word through `V.announce` when it changes.

### R1C-05 · MAJOR · rep-console · Go available loses keyboard focus

**Repro:**
1. On `rep-console.html`, Tab to Go available and press Enter.
2. During "Connecting…" (about 1.4 s), `activeElement` is `BODY`.
3. Focus then jumps to the H2 "Softphone" instead of Go offline.

The busy button is rendered without `id="rc-go"`, so focus can't be restored. Go offline → Go available restores focus correctly.

**Expected:** The same button keeps focus while it reads "Connecting…" (`aria-busy`), then focus lands on Go offline (CK §5.3).

**Fix:** Keep `id="rc-go"` on the busy and Go offline variants, and re-focus `#rc-go` after every render.

### R1C-06 · MAJOR · shared (`assets/components.css`) · Link buttons and small icon buttons are under 44 px on touch

Hit areas measured at 390 with a touch device (and at 768 with a coarse pointer):

| Page | Control | Hit area |
|---|---|---|
| Home | "Talk in browser instead" | 293×20 |
| Home | "Invite teammates…" | 108×20 |
| Home | "Setup guide", "Talk to us" | 20 tall |
| Cockpit | "Use my phone · +91 ••••••3012" | 190×16 |
| Cockpit | "Open in flow" | 67×16 |
| Cockpit | "Show all 4 checks" | 112×20 |
| Cockpit | Call gate sheet × | 36×36 |
| Rep console | "Turn on" | 44×22 |
| Rep console | "Show all 4 checks" | 20 tall |

**Cause:** `.btn::after` and `.ibtn::after` compute their inset from `--btn-h-md`, which is 44 on coarse pointers. `.btn--link` (height auto) and `.ibtn--sm` (36) therefore get `inset: 0` and no extension.

**Expected:** 44×44 on touch (06-accessibility §15; CK §4.5).

**Fix:** Under `@media (pointer: coarse)`:
- `.ibtn--sm::after { inset: calc((var(--btn-h-sm) - var(--hit)) / 2); }`
- `.btn--link::after { inset: calc((1lh - var(--hit)) / 2) calc(var(--space-4) * -1); }`, or give link buttons `min-height: var(--hit)` with `inline-flex` alignment.

### R1C-07 · MINOR · shared (`assets/shell.js`) · Shift+Tab from the initially focused title leaves a modal

**Repro:**
1. On `index.html`, choose Call my number…. The gate opens with focus on `H2#hcg-t`.
2. Press Shift+Tab. `activeElement` becomes `BODY`, outside the `aria-modal` gate.

The same happens in every overlay that opens on its title: the Cockpit gate, the Top-up sheet and the lead sheet. Tab and Shift+Tab between controls wrap correctly.

**Expected:** Tab is trapped (gate §4.5), so focus wraps to the last control.

**Fix:** In the trap (around shell.js:299): `if (e.shiftKey && (a === first || f.indexOf(a) < 0)) { e.preventDefault(); lastEl.focus(); }`.

### R1C-08 · MINOR · cockpit · CallSwitcher count disagrees with the rest of the page

**Repro:** Open `cockpit.html` below 1440.

The switcher says "Calls · 1 live". On the same screen the nav badge says "2 live" ("2 live calls"), the header meta says "2 calls in progress", and the list group says "Live now 2". The data is one live call and one ringing call.

**Fix:** Derive every count from one selector. Either count ringing calls as live everywhere, or use "Calls · 2 in progress".

Screenshot: `cockpit-1280-switcher.png`.

### R1C-09 · MINOR · shared (`assets/shell.js`) · The Baseline Activity segment counts your own call

**Repro:** Open `cockpit.html?demo=run&lead=lead_1050` and wait 7 s. The band reads "3 calls in progress" and also "● On call 00:08 · Priya Nair".

**Expected:** Segment 4 counts only the workspace's other calls; yours is segment 5 (03-pages/00 §5.2).

**Fix:** In the shell `activity` segment, use `n = liveCalls - (facts.call ? 1 : 0)`.

Screenshot: `cockpit-live.png`.

### R1C-10 · MINOR · shared (`assets/shell.js`) · The Baseline ignores offline

**Repro:**
1. On `cockpit.html`, take the context offline and fire the `offline` event. The ConnectionBar appears.
2. The band still reads "Wallet ₹2,340.50 · about 16 h of calls", "Verified" and "2 calls in progress", with no timestamp.

`index.html?demo=offline` shows the same.

**Expected:** Offline: "Values stay, and the wallet segment appends · as of 11:42 am" (§5.5).

**Fix:** In `offline()`, re-render the wallet segment with `· as of {time}`, and do the same for the BaselineChip and BaselineList. Restore the plain segment on `online`.

### R1C-11 · MINOR · cockpit · Two offline bars, and batch actions stay enabled offline

**Repro:** On `cockpit.html`, go offline with a real `offline` event.
- The shell ConnectionBar shows "You're offline. Showing data from 11:24 am."
- Below it, the page notice repeats "You're offline. Showing data from 11:24 am. Calls that are already live continue on the phone line."
- The batch Pause and Cancel… buttons stay enabled.

`?demo=offline` shows only the page bar, because the shell never sees an `offline` event.

**Expected:** One page notice at a time. Every network action is `aria-disabled` while offline (CK §4.1).

**Fix:** In `cockpit.js:20`, when the shell `.cbar` exists, append the "already live" sentence to it instead of rendering a second bar. Set `aria-disabled` and a reason on the batch actions while offline.

Screenshot: `cockpit-offline-event.png`.

### R1C-12 · MINOR · index · Demo states contradict setup

**Repro:** Open `index.html?setup=incomplete&demo=new&wallet=empty` ("New workspace · 0 of 5": no live flow, no number, ₹0). The nav still shows:
- "Cockpit ● 2 live"
- "Assistant 1 waiting"
- "Flows 1 draft"
- "Personal agents 1 to confirm"

In the default 4-of-5 state the first call ("Call yourself") isn't done, yet there are 2 calls in progress and 1,284 leads imported.

**Expected:** No false "live" (F-UX-006).

**Fix:** In the `index.js` scenario setup for `new` and `first-run`, set `DATA.state.liveCalls` and the related badges to 0, then call `V.shell.render()`.

Screenshot: `index-st-new.png`.

### R1C-13 · MINOR · index · Two runways for the same ₹500

**Repro:** Open the first-run state. The Add money step says "₹500 covers about 3 h 28 min". The Top-up sheet opened from it says "Adds about 3 h 25 min", and so do the new balance and the toast.

**Fix:** In `index.js:37`, format the step copy with `Vaani.fmt.runway` (formatRunway floors to 5 min).

Screenshots: `index-firstrun.png`, `index-topup1.png`.

### R1C-14 · MINOR · index · "Talk to us" goes to the setup guide

Both Help links point to `https://help.vaanilabs.example/setup` (the `ext()` helper in `index.js:195` hard-codes one URL).

**Fix:** Give Talk to us its own contact URL or `mailto:`.

### R1C-15 · MINOR · cockpit · Talk ratio says "Caller 100%" before anyone speaks

**Repro:** Place a call. Between Live 00:00 and 00:05 the card reads "Agent 0% · Caller 100% · 0 interruptions".

**Cause:** In `cockpit-callcard.js:174`, `sum = ag + ca || 1` makes `ap` 0.

**Fix:** When no speech has happened, show "No speech yet" or hide the legend.

### R1C-16 · MINOR · cockpit · The Cancel-batch confirmation has "Cancel" and "Cancel batch" side by side

**Repro:** Calls column → Weekend follow-ups → Cancel…. The dialog shows "Cancel ‘Weekend follow-ups’? 28 calls won't be placed…" with the buttons **Cancel** and **Cancel batch**.

**Fix:** In `cockpit-feed.js:219`, pass `cancelLabel: 'Keep batch'`, like Agents' "Keep task".

### R1C-17 · MINOR · cockpit and rep-console · Focus rings on programmatic focus targets

These headings draw a 2 px ring when they receive programmatic focus:
- The Cockpit gate title "Call Priya Nair", after `C` on desktop and after a tap on the phone sheet.
- The live call heading "Priya Nair".
- The Rep console headings.

Home's gate title correctly draws none.

**Expected:** Programmatic targets carry `data-focus-target` and draw no outline (06-accessibility §6, focus table).

**Fix:** Add `data-focus-target` to `#ck-gate-t`, `#ck-call-h`, `#ck-wrap-h`, `#rc-soft-h`, `#rc-call-h` and `#rc-wrap-h`.

Screenshots: `cockpit-gate.png`, `cockpit-390-gate.png`, `run390.png`.

### R1C-18 · MINOR · cockpit and rep-console · Tablet and phone call navigation differs from the spec

- **Cockpit, 768 and below:** the Calls list is a header CallSwitcher button. On phones the header then takes a meta row plus a switcher row, about 100 px. CK §2.4 and §4.6 put it in the TopBar call chip, which opens a sheet.
- **Rep console during a call, at 768 and 390:** the TopBar has no call chip. The CK §5.5 phone wireframe shows `[(•) Live 03:41]`.

**Fix:**
- Cockpit: move the switcher trigger into the TopBar chip below 1024.
- Rep console: feed `Vaani.baseline.facts({ call })` or `DATA.state.myCall` so the shell renders the chip.

Screenshots: `cockpit-390.png`, `rep-390-oncall.png`.

### R1C-19 · MINOR · cockpit · Phone layout spacing

- **At 390 and 360 when idle:** there is a double hairline under the "Voice and language" row. The `.ck-disc` bottom border and the `.ck-ready` top border sit 16 px apart with nothing between them.
- **At 390 during a call:** there is an empty gap of about 200 px between "Call details" and "Transcript".

**Fix:** In `pages/cockpit.css`, drop one of the two borders. Let the phone transcript follow the header without the flex-fill gap.

Screenshots: `cockpit-390.png`, `run390.png`.

### R1C-20 · MINOR · cockpit · Page error title and alignment

**Repro:** `cockpit.html?demo=page-error`.
- The title stays "Cockpit · Vaani Labs". §15.1 gives "Couldn't load · Cockpit · Vaani Labs".
- The PageError is centred vertically in the pane. The same pattern on `404.html` sits at the top with 48 px padding (§15.2), so the two error surfaces look different.

**Fix:** Set the title and top-align the block.

Screenshots: `cockpit-page-error.png`, `404-error.png`.

### R1C-21 · MINOR · rep-console · The Ringing nav badge uses the green live dot

While ringing, the nav shows a green "● Ringing".

**Expected:** Ringing uses the pending tone with a `phone-call` icon, as the card's own tag does (CK §5.3). The presence badge lists only Available and On call.

**Fix:** In the `repPresence` NAV badge, give ringing the pending tone, or show no badge while ringing.

Screenshot: `rep-ringing.png`.

### R1C-22 · MINOR · index · A nearly empty strip on short laptops

**Repro:** Open Home at 1280×609 or 1366×657. A 56 px `.home-ph` band carries only the ₹2,340 BaselineChip above the H1, which pushes the current step below the fold on the most common office laptop.

**Fix:** Put the chip in the intro row beside the H1, or make the strip 32 px.

Screenshot: `index-1280x609.png`.

### R1C-23 · MINOR · cockpit · The phone Call gate "To" row wraps awkwardly

**Repro:** At 390, the To value "Priya Nair · +91 ••••••3307 · Hinglish" wraps so that "· Hinglish" starts a new line with its separator.

**Fix:** Keep the separator with the following token (`white-space: nowrap` on each "· item" span), or drop the language to its own line.

Screenshot: `cockpit-390-gate.png`.

## Verified working (no action)

**Home:**
- The current step has exactly one primary in every state.
- "Your workspace is live" appears only after all five steps pass. Completing the flow shows the toast "Setup complete…", moves focus to the heading and changes the Baseline to Live and Ready.
- Loading, error, offline (actions `aria-disabled` with a tooltip), member, waiting and failed states render as specified.
- Invite dialog: validation, the dirty discard state on Esc (Keep editing is focused, a second Esc keeps editing), and "Send 2 invites".
- Top-up sheet: an invalid amount shows an error on blur; the UPI step; Simulate confirmation marks Add money done, announces "Add money: done. 3 of 5." and moves focus to the next step.
- Phone rows collapse with `aria-expanded`.

**404:** NotFound, the Leads record, Forbidden (Knowledge › Proposals) and PageError titles and H1s are correct. The nav current item is correct, and no item is current on an unknown route.

**Cockpit:**
- Every readiness state has correct copy and a disabled reason. When the role can't call, the primary is hidden.
- "12345" shows the PhoneInput error on blur. A typed number is never put in the URL. The flow choice is written to the URL.
- The gate opens on `C`, focuses its title, and Ctrl+Enter places the call.
- Announcements are "Dialling", "Ringing", "Call live" and "Call ended. Wrap-up", once each.
- Terminal outcomes and Test ended render. Wrap-up save shows the toast "Saved to Priya Nair · Open lead" and moves focus to the New call heading.
- The Calls list uses roving focus. F6 moves through the regions. Pause and Cancel… work.
- The tablet Call and Transcript `radiogroup` works.

**Rep console:**
- All 25 states render with no JS errors. `<title>` follows presence.
- Ctrl+Enter answers without moving focus. M and H toggle `aria-pressed` with Unmute and Resume.
- Wrap-up blocks transfers. Save and go available works.
- On the phone, Answer and Decline and Mute and End call sit in a sticky bar above the bottom nav. The phone Notice shows when available.

**Shell:**
- The tablet NavSheet is modal over the content, and Esc returns focus to the menu button.
- The phone More sheet contains Rep console and Sign out…, and Sign out asks for confirmation.
- The `?` sheet opens and closes.

**Gallery:** Overlays open, trap focus, close on Esc and return focus. Toasts have `role=status`. Tabs use manual activation with arrow keys, Home and End. The theme switch persists.

## Not covered this round

- Real network assertions ("no call request before confirm"), because the prototype has no requests.
- Screen-reader speech. Live regions were checked through DOM mutations only.
- Forced-colours mode.
- The 844×390 landscape phone.
