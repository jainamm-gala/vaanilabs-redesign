
---

## 21. Testing: automated, keyboard, screen reader and manual

### 21.1 Automated (CI)

| Id | What | Tool and scope | Pass rule |
|---|---|---|---|
| AX-01 | axe on every route | Playwright + `@axe-core/playwright`, tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `region`, `landmark-unique`, `landmark-one-main`, `page-has-heading-one`, `heading-order`, `scrollable-region-focusable`, `skip-link`; light and dark; 1440, 1024, 768, 390 | 0 violations; every `incomplete` reviewed (contrast incompletes are settled by CT-02) |
| AX-02 | axe with each overlay open | the §20.E overlay list | 0 violations; `aria-dialog-name`, `button-name` pass |
| AX-03 | axe on every non-default state | empty, filtered, loading, error, offline, no permission, not found, view-only | 0 violations |
| CT-01 | Token contrast | `node design/check-contrast.mjs` (396 pairs; tenants too) | exit 0 |
| CT-02 | Rendered text contrast | the audit's compositing scanner (alpha and ancestor opacity resolved) on every route, both themes; the Flow Designer fixture has an unreachable step and phase emphasis on | 0 text nodes under 4.5:1; 0 UI boundaries under 3:1; 0 text nodes under an ancestor with `opacity` < 1 (except `data-drag-ghost`) |
| CT-03 | Type floor | `getComputedStyle` scan; `html` font size; canvas at zoom 0.25, 0.5, 0.75, 1 | `html` = 16 px; 0 text nodes under 12 px |
| LN-01 | JSX lint | `eslint-plugin-jsx-a11y`: `label-has-associated-control`, `control-has-associated-label`, `interactive-supports-focus`, `click-events-have-key-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions`, `tabindex-no-positive`, `anchor-is-valid`, `aria-props`, `aria-role`, `role-has-required-aria-props`, `no-redundant-roles`, `media-has-caption`, `no-access-key` | 0 errors |
| LN-02 | House lint | no `title` as the only name; no `outline-none` without a `focus-visible` replacement (allowlist: `data-focus-target`); no `hidden sm:inline` on labels; `role="alert"` only on Toast (error), InlineError, SaveState (error); no `keydown` listener outside ShortcutProvider; no raw `<input>`/`<select>` outside `components/ui`; no `transition-all`; no alpha on text colours; banned strings ("click here", "green handle", "bottom handle", "Oops") | 0 errors |
| LR-01 | Announcer behaviour | unit + e2e spy on both regions | dedupe and throttle hold; §12.2 "never" list produces 0 messages; a 3-minute scripted call yields one message per state change and ≤ 1 turn per 2 s |
| LR-02 | Persistent conditions | DOM check on load of every route | no `role="alert"` present at load; WalletNotice `role="status"` |
| TS-01 | Target sizes | hit-rectangle scan including `::after` | ≥ 24 × 24 or a listed exception; ≥ 44 × 44 under touch emulation (390 × 844 and 1024 × 690) for the §15.2 touch column |
| VR-01 | Focus appearance | visual snapshots of §7.1's rows, light and dark | reviewed baseline; any diff needs sign-off |
| VR-02 | Forced colours | Chromium `forcedColors: 'active'`; fixtures: a focused row, a selected row, a focused + selected row, the current nav item with and without focus, a selected and a focused step, free (hollow) and connected sockets | focus is a 2 px outline all round and selection a 4 px inline-start bar, never the same treatment; free and connected sockets differ; tags, fallback edge and Baseline visible |
| VR-03 | Reduced motion, both sources | `reducedMotion: 'reduce'`; then no media emulation and `data-motion="reduce"` set by the Motion setting | no transform animation; live dot still; trace skipped; the two runs' snapshots are identical |
| VR-04 | Reflow and zoom | 320 × 640, 390 × 844, 720 × 450, 844 × 390, 1280 × 720 | `scrollWidth === innerWidth`; no two interactive rects overlap; focused element never under sticky chrome |
| VR-05 | Text spacing | inject line-height 1.5, letter 0.12 em, word 0.16 em, paragraph 2 em | no clipped text (`scrollHeight ≤ clientHeight` on text boxes) |

**Keyboard e2e (Playwright, with a guard that fails the test on any pointer event):**

| Id | Script |
|---|---|
| KB-01 | Fresh load: Tab → skip link visible; Enter → `main` focused; Tab → first header control. Count stops across the sidebar = 1 per control |
| KB-02 | Navigate by keyboard to each destination: `document.title` matches S §4.4; `activeElement` is the H1; no duplicate titles across the crawl |
| KB-03 | For each overlay in §20.E: open by keyboard, Tab cycles inside, background inert, Esc closes, `activeElement` is the trigger (never `BODY`); dirty dialog shows the discard state |
| KB-04 | Every menu: first item focused on open; arrows, Home, End, typeahead; Esc returns focus; Tab closes |
| KB-05 | Leads: Tab into the table, ↓ × 3, Enter → sheet heading focused, Esc → row 4 focused; `C` opens the Call gate and **no call request is sent**; turn shortcuts off → `c` does nothing; Enter on a focused New lead button opens New lead (not a row) |
| KB-06 | Call reports: Tab to row 3, Enter, move into the transcript, ↑/↓ by turn, Enter on a timecode seeks, Esc → row 3 focused |
| KB-07 | Flow: keyboard-only build of Trigger → Question (2 answers) → Speak → Outcome; label every step; connect every answer with `C` and with Go to; test in text; publish via ⌘/Ctrl+Enter; roll back |
| KB-08 | Flow: Tab enters at the first Trigger; tab order equals call order on the reference flows; one Shift+Tab leaves the canvas; Alt+Arrow moves the focused step 16 px; Alt+. focuses the next issue's step; Space then Shift+Space on another step leaves two selected |
| KB-09 | Outline: tree keys; Connect to… from an answer row; Delete then ⌘/Ctrl+Z restores and refocuses |
| KB-10 | Palette: ⌘/Ctrl+K from inside a text field opens it; ↓ Enter navigates; Esc returns focus to the field |
| KB-11 | `?` opens a dialog with focus inside; the switch turns off every §8.2 key and hides their keycaps; state persists after reload |
| KB-12 | With a row highlighted, Enter or Space on any focused button runs that button only |
| KB-13 | Recording player: slider keys; Space inside the player toggles play; Space on the page scrolls as normal |
| KB-14 | Forms: empty submit on a ≤ 3-field form focuses the first invalid field; on a longer form focuses the error summary whose links focus each field |

### 21.2 Screen-reader scripts (manual, per release on changed areas; full pass quarterly)

| Id | Journey | NVDA + Chrome | VoiceOver + Safari | TalkBack + Chrome |
|---|---|---|---|---|
| SR-01 | Structure: headings list, landmarks list, form fields list on every route | ✓ | ✓ | spot |
| SR-02 | Browser test call: hear Dialling, Call live, final turns in the right voice, Call ended; nothing else | ✓ | ✓ | ✓ |
| SR-03 | Find a call, open it, read the summary, play from a timecode, return to the list | ✓ | ✓ | ✓ |
| SR-04 | Build and publish a 3-step flow on the canvas, then review it in the Outline; no ids read | ✓ | ✓ | Outline only |
| SR-05 | Filter leads, select two, open the Call gate, hear readiness, cancel; repeat with shortcuts off using Call… | ✓ | ✓ | ✓ (Select mode) |
| SR-06 | Top up ₹500: sheet, amount, runway, pay handoff, pending state | ✓ | ✓ | ✓ |
| SR-07 | Sign in with a password manager; with an email link; with a pasted code | ✓ | ✓ | ✓ |

Record for each: what was announced, anything missing or doubled, and the fix ticket. JAWS + Chrome runs SR-01, SR-03 and SR-05 before an ACR is published.

### 21.3 Other manual checks

| Id | Check |
|---|---|
| MN-01 | Speech input (Voice Access, Voice Control, Dragon): "Click Place call", "Click Save and next", "Click Top up", "Show numbers" then pick a socket; paste and password managers on every auth field |
| MN-02 | A real Windows Contrast theme (Night sky, Desert): focus, selection, sockets, edges, tags, the Baseline and the live dot remain visible |
| MN-03 | 200 % and 400 % zoom, 150 % browser text size, OS reduced motion and the in-app Motion setting, on every destination |
| MN-04 | Real devices: an Android mid-range phone with TalkBack, an iPhone with VoiceOver, an iPad with a keyboard (coarse pointer + keys); pinch and pan alternatives; the Rep console ring can be muted; no audio autoplays |
| MN-05 | Hindi voices: Devanagari turns and examples switch to a Hindi voice on NVDA (eSpeak NG or OneCore) and VoiceOver; record how `hi-Latn` Hinglish is read |
| MN-06 | Switch access on the Call gate, Leads selection and the Outline: no single scan step can dial, publish or delete |

### 21.4 Severity and release gating

| Severity | Definition | Release |
|---|---|---|
| Blocker | A core job cannot be done by keyboard or screen reader (open a call, edit a flow, place a call through the gate, top up, sign in); a stray input can dial, bill, publish or delete; focus is lost to `<body>` in a core flow | Blocks release |
| High | Any WCAG A/AA failure on a core route (Cockpit, Leads, Call reports, Flows, Billing, auth) | Blocks release |
| Medium | A/AA failure on a secondary route, or a core-route issue with a documented workaround | Fix within the next release |
| Low | Best practice (announcement wording, heading polish) | Backlog |

---

## 22. Definition of done

**A component is done when:** it uses the focus ring on its visible box; every state has a non-colour cue; its roles, names and states follow §9–§10; its keyboard map is in the `?` registry if it has keys; its hit area meets §15; it has light, dark, forced-colours, reduced-motion and focused snapshots; axe passes on every gallery state; every new colour pair is in `check-contrast.mjs`.

**A page is done when:** it has one H1, correct landmarks and a unique title; every action works by keyboard with focus visible and never lost; all its announcements match §12.2 and nothing else is announced; its states (loading, empty, filtered, error, offline, no permission) pass AX-03; it reflows at 320 and at 200 % zoom; its SR script (§21.2) was run on the change; its acceptance criteria in the page spec and in §19–§20 are ticked.

**The product may claim WCAG 2.2 AA when:** every route is done, no blocker or high is open, SR-01 to SR-07 pass on NVDA, VoiceOver and TalkBack, and the ACR is written from §5 and §21 results.

---

## 23. New components needed

| Component | Why | Contract |
|---|---|---|
| `ShortcutProvider` + `useShortcut` | One registry for scopes, the single-key switch, IME and target guards, `aria-keyshortcuts` and the `?` sheet (§8.4) | `useShortcut({ key, scope, singleKey, label, run })`; `useShortcutsEnabled()` (C §7.3) reads it |
| `SkipLinks` | The shell's one link and the Flow Designer's two (§6.4) | `<SkipLinks targets={[{ href: '#canvas', label: 'Skip to canvas' }, …]} />` |
| `LiveRegion` pair + `announce()` | Polite and assertive regions mounted empty, modal mirrors, `lang`, dedupe and throttle (§12.1); extends O's live-region file | `announce(text, { politeness, dedupeKey, throttleMs, lang })` |
| `useRouteFocus` | Title from the nav config, focus to the H1, fallback announcement when a sheet keeps focus (§7.3) | called once in the AppShell layout |
| `SpokenValue` + `VisuallyHidden` | Display and spoken forms of durations, money, versions and masked phones (§10.4) | `<SpokenValue display="2m 31s" spoken="2 minutes 31 seconds" />`; `lib/format.ts` returns both |
| `.hit` utility | `::after` hit-slop to `--hit` (§15.1) | class on any small control |
| `MoveMode` (canvas; named in the FD1 §20.1 registry) | Single-pointer and keyboard positioning of steps without dragging (§16); Alt+Arrow is the direct nudge | step menu "Move step"; `M`¹; Enter places, Esc restores; one undo step |
| `PanelSplitter` | Resizable inspector, Outline and Test panel with presets and keys (§16) | `role="separator"`, `aria-valuenow/min/max`, arrows, Home/End, preset menu |
| `MotionSetting` | In-app reduced motion for machines where the OS setting is locked (§14.3) | Account menu radio items Match system · Reduce motion → `localStorage['vaani:motion']` and `data-motion="reduce"` on `<html>`, set before paint by `THEME_BOOT` (F §15.3); CSS from `tokens.css` and `base.css`, JS through `useReducedMotion()` (07-motion MD4, §13) |
| `a11y-test-kit` (dev only) | Shared Playwright helpers for §21 | `expectFocusReturned`, `tabUntil`, `failOnPointer`, `spyAnnouncements`, `scanHitRects`, `scanTextContrast` |

---

## 24. Reconciliations with other specs

| # | Where | Conflict | Resolution (owner to update) |
|---|---|---|---|
| R1 | O §4.5 vs N §12.4 | O says the transcript uses `role="log"`; N says it must not | **N wins** (§12.3). O §4.5 to remove `role="log"` |
| R2 | N §7.12 vs O §16.3 | First-load table error is `role="alert"` in N, `role="status"` in O | `role="status"` on load, `role="alert"` after a user Retry fails. N §7.12 to update |
| R3 | F-A11Y-003 vs C §3.1 | Audit suggested a visible "(required)"; C marks "(optional)" | C kept; `required` / `aria-required` either way; 3.3.2 met |
| R4 | F-A11Y-003 vs 1.3.5 scope | Audit suggested `name`, `tel`, `email` tokens on New lead and Customer Intel | Those fields describe someone else: `autocomplete="off"` with namespaced names (§11.3) |
| R5 | F-A11Y-001 | Audit suggested `Ctrl+Shift+C` for connect | Scoped, switchable `C` plus visible Connect to… in the step menu, Go to selects and the Outline |
| R6 | D §5, F §11, N §5.4 | "The live dot pulses while a call is live" | Pulse 3 cycles per entry into Live on the focal CallHeader only, then steady (2.2.2, §14.2). **Done:** D §5 and §7, F §11 and N §0.4, §5.4 amended |
| R7 | F §11 vs C §1.7 | Spinner loop not in the perpetual-motion list | Accepted as essential while a user-started request runs (§14.1). **Done:** F §11 lists it; `--dur-spin` 800 ms everywhere (C §1.7 no longer uses `--dur-pulse`) |
| R8 | `base.css` | `html { font }` re-bases rem to 14 px (N §0.6, C §1.10) | **Done:** moved to `body`, `html` at 100 %, per-mock overrides removed, CT-03 in CI (§18) |
| R9 | S §3.1, PA layouts | `<html lang="en">` | `lang="en-IN"` (§17) |
| R10 | N §12.4 keyboard | Only Home and End defined for the feed | One tab stop, roving turns, ↑/↓ by turn, Tab into a turn's links (§9.9) |
| R11 | S §3.8, O §19 | F6 cycles regions | On the last region the browser's F6 passes through (§6.4) |
| R12 | FD1, FD2, M §0 Q5 | React Flow's arrow-key nudge conflicts with graph navigation; Alt+↑/↓ meant both "next issue" and "move"; Space meant "select only" in FD1 and "toggle" here; the shell's `[` collided with compare mode | Arrows navigate; Alt+Arrow moves (with `M` Move mode as the announced path); issues are Alt+. / Alt+,; Space selects only, Shift+Space toggles; `[` is off in focus mode. §9.6 is the only canvas map; lint LN-03 guards it |
| R15 | FD1 §16.1, R §10.11 | `role="application"` on the canvas (always, or while focused) | No `role="application"` anywhere (§6.1); FD1 and R updated |
| R13 | N §1.2 account menu | No Motion item | Add **Motion: Match system · Reduce motion** (§14.3, 07-motion MD4), the one label everywhere; the attribute is `data-motion="reduce"`, the only value. **Done:** N §1.2 and §1.8, S §9.2 and §9.4, and D §6.1 list it; `THEME_BOOT` applies it before paint (F §15.3) |
| R14 | F-A11Y-008, F-A11Y-020 values | Audit proposed `#5B6478` and `#646D80` | Foundations' `--text-3` `#5F6878` serves both (≥ 4.70:1 on every plane) |

---

## 25. Open questions for the product owner

1. **Live-dot pulse.** Confirm the 3-cycle bound (R6). The alternative is an always-available pause control on every live dot, which is heavier.
2. **Meetings media.** Does Meetings render live meeting audio or video in the browser? If yes, the live transcript must be offered as captions (1.2.4); if it only produces notes afterwards, 1.2.4 does not apply.
3. **Bot protection on sign-up.** Which provider? It must be non-cognitive (3.3.8).
4. **Session lifetime.** If sessions end in under 20 hours, add a warning 2 minutes before expiry with "Stay signed in" (2.2.1).
5. **Shortcut remapping.** Not in v1 (2.1.4 is met by off + scoping). Add if users ask.
6. **Accessibility statement.** Publish `/accessibility` with the conformance status, known issues, the Hinglish voice note (MN-05) and a contact with a response time, once §22 passes.
7. **Hindi chrome (v2).** `<html lang="hi">` with English terms tagged `lang="en"`; line heights per F §17 question 3.
8. **Assistive-technology licences.** A JAWS licence and one Android and one iOS test device for QA.
