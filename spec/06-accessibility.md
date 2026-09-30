<!-- Assembled from 06-accessibility.part1.md, 06-accessibility.part2.md, 06-accessibility.part3.md, 06-accessibility.part4.md, 06-accessibility.part5.md, 06-accessibility.part6.md, 06-accessibility.part7.md, 06-accessibility.part8.md, 06-accessibility.part9.md, 06-accessibility.part10.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 06 · Accessibility: WCAG 2.2 AA requirements for Vaani Labs (Sutradhar)

**Status:** final for v1 · **Date:** 2026-09-27 · **Conformance target:** WCAG 2.2 Level AA on every signed-in route, the auth routes and the public site.
**Builds on:** `spec/00-design-direction.md` (D), `spec/01-foundations.md` (F), the component specs `02-components-core.md` (C), `02-components-overlay-feedback.md` (O), `02-components-data-nav.md` (N), the page specs in `spec/03-pages/`, the Flow Designer specs in `spec/04-flow-designer/` and `spec/05-responsive` (R).
**Evidence:** finding ids (F-A11Y-…, F-FLOW-…, F-RWD-…, F-UX-…, F-VIS-…, F-QA-…) refer to `audit/consolidated/`. Raw sources are `audit/raw/a11y-auto.md` (axe-core 4.10.2 plus a compositing contrast scanner) and `audit/raw/a11y-manual.md` (keyboard, focus and semantics). No screen reader was run in the audit, so every "announced" claim here is a requirement to verify, not an observation.

| Deliverable | Path | Role |
|---|---|---|
| This spec | `spec/06-accessibility.md`, assembled from `06-accessibility.part1-10.md` (edit the parts, then re-assemble) | The cross-cutting contract, the finding ledger, keyboard maps, live regions, tests |
| Reference mock | `spec/06-accessibility.html` (links `tokens/tokens.css` and `tokens/base.css`) | Landmarks and focus order of the shell at four widths, focus vs selection in both themes, the Flow Designer keyboard and screen-reader model, the call announcement timeline, target sizes |
| Renders | `spec/06-accessibility-desktop.png` (1440, full page), `-dark.png` (1440, dark theme), `-mobile.png` (390) | For review without a browser |
| Contrast proof | `spec/tokens/contrast-report.md` (396 required pairs, all pass) | Every colour rule in §13 points here |

**Contents**
0. How to use this document · 1. Conformance target, scope and support matrix · 2. Principles · 3. Finding ledger (part 1)
4. Related findings from other lenses · 5. WCAG 2.2 AA conformance matrix (part 2)
6. Landmarks, headings, titles and the skip link · 7. Focus: visible, managed, never obscured · 8. The keyboard model and single-key shortcuts (part 3)
9. Keyboard maps per complex widget (part 4)
10. Names and labels · 11. Forms, errors and authentication (part 5)
12. Live regions and status messages · 13. Colour and contrast · 14. Motion and reduced motion (part 6)
15. Target size · 16. Dragging and pointer alternatives · 17. Language of parts · 18. Resize, reflow, spacing, hover content and orientation (part 7)
19. Area specs: A app shell, B Flow Designer (part 8)
20. Area specs: C tables and record sheets, D live call and transcript, E overlays and the palette, F forms and auth, G public site (part 9)
21. Testing · 22. Definition of done · 23. New components needed · 24. Reconciliations with other specs · 25. Open questions (part 10)

---

## 0. How to use this document

**What this spec owns.** The accessibility contract that every component and page spec must satisfy: the conformance matrix (§5), the global structure, focus and keyboard rules (§6–§8), the keyboard maps of the complex widgets (§9), the live-region catalogue (§12), the colour, motion, target, dragging and language rules (§13–§18), the test plan and the definition of done (§21–§22).

**What it points to.** Component behaviour is specified once, in the component specs, and page-specific rules in each page's "Accessibility" section. This document does not restate them; it names the owner and the test that proves it. Where this spec **changes** an upstream value, §24 lists the change so the owner can update their file.

**Precedence.** If a page or component spec and this document disagree about an accessibility requirement, this document wins until the owner reconciles it. If this document and WCAG disagree, WCAG wins.

**Shorthand.** D = direction, F = foundations, C = core controls, O = overlay and feedback, N = data and navigation, S = `03-pages/00-app-shell-ia`, CK = Cockpit, L = Leads, CR = Call reports and Analytics, KB = Knowledge and Billing, ST = Settings, MP = Meetings and Personal agents, PA = public site and auth, FD = `04-flow-designer/02-config-validation-lifecycle`, FD1 = the Flow Designer canvas-and-nodes part, R = responsive. Test ids (AX-, KB-, SR-, VR-, CT-, LN-, LR-, TS-, MN-) are defined in §21.

---

## 1. Conformance target, scope and support matrix

**Target.** WCAG 2.2 Level A and AA (55 success criteria; 4.1.1 Parsing is obsolete in 2.2). The redesign also adopts four AAA criteria where they cost little and fix a real audit problem:

| AAA criterion | Adopted as | Why |
|---|---|---|
| 2.5.5 Target Size (Enhanced) | 44 × 44 on coarse pointers and below 768 px (touch density, F §14) | 77 of 84 Leads targets at 390 px were under 44 px (F-A11Y-023) |
| 2.3.3 Animation from Interactions | Every non-essential transition can be turned off (reduced motion, §14) | Today 36 keyframes ignore the preference (F-A11Y-022) |
| 2.4.13 Focus Appearance | The 2 px outline with a 2 px offset at ≥ 6.15:1 (F §13) meets it | Focus was invisible or under 3:1 (F-A11Y-006) |
| 2.2.5 Re-authenticating | Session expiry keeps page state and unsaved flow edits on the device (O §16.1) | Operators lose work on a silent sign-out today (F-QA-007) |

**In scope:** all signed-in routes (including the Rep console, which the audit could not test), the auth routes, the public site, error pages, and every state a route can be in (empty, loading, error, offline, no permission, dialogs and sheets open).
**Out of scope for v1:** third-party screens (UPI apps, OAuth providers, payment pages), transactional emails (v1.1: same rules, tested with the email preview), and the audio quality of calls themselves (not web content). The telephony audio's **text alternative** is in scope: every call has a transcript (1.2.1).

**Support matrix** (test on these; fix for all of them):

| Input or AT | Platform | Why it matters for Vaani |
|---|---|---|
| Keyboard only | Chrome, Edge, Firefox, Safari on desktop | Operators live in tables and the canvas |
| NVDA (latest) | Windows 10/11 + Chrome and Firefox | The most common free screen reader on Windows office laptops |
| JAWS (latest) | Windows + Chrome | Enterprise and BFSI buyers test with it |
| VoiceOver | macOS Safari; iOS Safari | Founders, agencies, mobile supervisors |
| TalkBack | Android Chrome on a mid-range phone | The dominant phone platform for Indian field and sales teams |
| Speech input | Voice Access (Android), Voice Control (macOS, iOS), Dragon (Windows) | "Label in name" failures break it (F-A11Y-030) |
| Switch access | iOS Switch Control, Android Switch Access | A11Y principle A4: no single stray activation may dial |
| Windows Contrast themes | Edge and Chrome, forced colours | F §13 forced-colours contract |
| Zoom and text size | 200% and 400% browser zoom; 150% browser text size | F-RWD-001 and F-RWD-002 failed at 720 × 450 |
| Hindi text-to-speech | NVDA with a Hindi voice (eSpeak NG or OneCore), VoiceOver Lekha | Devanagari turns must switch voice via `lang` (§17) |

**Conformance claim.** No conformance statement is published until §22's definition of done passes for every route. Then produce an Accessibility Conformance Report (VPAT 2.5, WCAG edition) from the §21 results; enterprise buyers ask for one.

---

## 2. Principles

Ranked; when two conflict the higher wins. Each maps to a direction principle (D §2).

| # | Principle | Means | D |
|---|---|---|---|
| A1 | **Every action has an address** | Keyboard, single pointer, touch, speech and screen reader each reach every action. Every shortcut has a visible control; every drag has a click or select path | P5 |
| A2 | **Nothing billable or live on one stray input** | No single key, single tap, voice command or switch press dials, bills, publishes or deletes. Each opens its gate; the gate confirms with a deliberate action (`⌘/Ctrl+Enter` or the labelled button) | P3 |
| A3 | **Focus is always visible, always somewhere sensible** | 2 px outline with offset on the visible part of the control; focus moves into what opens and back to what opened it; never lands on `<body>` | P5 |
| A4 | **State is words, announced only when it changes** | Every state has a word and an icon; the announcer reads changes once, politely, throttled; timers, cost and routine saves are silent | P1 |
| A5 | **Tokens carry the contrast** | No raw colours, no alpha on text, a 12 px floor at every zoom; the contrast script is the gate | P2, P4 |
| A6 | **Motion is for real live state only, and it stops** | No idle loops; the live dot pulse is bounded; reduced motion stops everything that travels | P7 |
| A7 | **Language is marked where it changes** | `lang` on every transcript turn, prompt and example; names are never translated | D §4.5 |
| A8 | **One structure everywhere** | One skip link, one `main`, one H1, one nav landmark per breakpoint, titles from the one nav config | P6 |

---

## 3. Finding ledger: every F-A11Y finding, its fix, its owner and its test

| ID | Sev | WCAG | Fix in the redesign | Specified in | Proven by |
|---|---|---|---|---|---|
| F-A11Y-001 | critical | 2.1.1 | Canvas is one tab stop with a roving tabindex in graph order; Enter opens the inspector; sockets are focusable buttons with 24 px hit areas (44 coarse); `C` or Enter on a socket opens **Connect to…**; every answer has a **Go to [step]** select; the Outline is a complete non-spatial editor | FD §16, FD1; §9.6–9.8 here | KB-07, KB-08, KB-09, SR-04 |
| F-A11Y-002 | critical | 2.1.1, 2.4.3 | Call rows are focusable `<tr>`s whose key cell is a real link; Enter opens the 560 px detail sheet, focus moves to its heading; Esc returns focus to the row; `?call=` deep link | N §7.8–7.9, CR §2.8–2.10 | KB-06, SR-03 |
| F-A11Y-003 | high | 1.3.1, 3.3.2, 4.1.2, 2.5.3, 1.3.5 | One `Field` renders `<label for>`, hint and error via `aria-describedby`, `aria-invalid`, `required`, `autocomplete`; a bare input outside `Field` is a lint error; placeholders are examples only | C §3.1, §11 here | AX-01, LN-01, MN-01 |
| F-A11Y-004 | high | 2.1.4, 4.1.2 | Single-key shortcuts are scoped to their widget, ignored in fields and on buttons, and switchable off (account menu, `?` sheet, palette); `C` opens the Call gate and never dials; Enter and Space are never intercepted on buttons; J/K move real focus | §8 here, N §7.9, L §8.1 | KB-05, KB-11, KB-12 |
| F-A11Y-005 | high | 4.1.2, 2.4.3, 2.4.11 | One Dialog and Sheet primitive (Radix): `role=dialog`, `aria-modal`, labelled, focus in, trap, `inert` background, Esc, return focus; dirty forms show an inline discard state; phone sheets sit above the bottom bar | O §1.3–1.7, §2, §4 | KB-03, AX-02 |
| F-A11Y-006 | high | 2.4.7, 1.4.11 | Global `:focus-visible` outline 2 px `--focus` (≥ 6.15:1 on every plane) with 2 px offset, on the visible box of every control; `outline: none` without a replacement is banned | F §13, `base.css`, C §1.5; §7 here | VR-01, LN-02 |
| F-A11Y-007 | high | 2.4.7, 1.4.11 | Focus = outline; selection = `--accent-soft` fill + 1 px `--accent-mark` border (steps) or 2 px inset bar (rows); both show together; same treatment for keyboard and mouse selection | F §13, D §6.5; §7.2 here | VR-01, VR-02 |
| F-A11Y-008 | high | 1.4.3, 1.4.4 | `--text-3` becomes `#5F6878` light / `#8C94A2` dark (≥ 4.70:1 on every plane); no alpha on text; 12 px floor in rem; `html` stays at 16 px | F §2.3, §3.4, N §0.6 | CT-01, CT-02, CT-03 |
| F-A11Y-009 | high | 1.4.3 | `--on-accent` white on Neel `#2B45C2` (7.68:1) / `#3752DA` (6.21:1); `saffron` renamed `accent`; Meeting violet and marketing violet retired | F §3.4, C §2.1 | CT-01, AX-01 |
| F-A11Y-010 | medium | 2.4.3, 4.1.2 | Leads is a real table (`role=grid`) with one tab stop for the body; J/K move real focus; the lead sheet takes focus and returns it | N §7.9, L §8 | KB-05 |
| F-A11Y-011 | medium | 2.1.1, 2.4.3 | Every menu is a Radix DropdownMenu: first item focused on open, arrows, typeahead, Esc returns focus, Tab closes | O §7.4 | KB-04 |
| F-A11Y-012 | medium | 2.4.1, 2.4.3 | Skip link first in the DOM; one tab stop per nav item; wallet controls leave the header path; rail focus ring drawn inset | N §1.9, S §3.1; §6 here | KB-01 |
| F-A11Y-013 | medium | 2.4.2 | `<title>` from the nav config, `[state · ][record · ]Label · Vaani Labs`; focus moves to the H1 on route change | S §4.4, N §0.7; §6.3 here | KB-02, AX-01 |
| F-A11Y-014 | medium | 4.1.3 | One announcer in the shell; the catalogue in §12 (call state, final transcript turns, counts, saves, failures) | O §1.8, N §0.7, §12.4 | LR-01, SR-02 |
| F-A11Y-015 | medium | 4.1.3, 2.4.3 | The global wallet `role=alert` is removed; WalletNotice is `role=status` on spending pages only; dismissal moves focus to the H1 and is remembered per state | O §10.2, S §6 | LR-02, KB-03 |
| F-A11Y-016 | medium | 4.1.2, 1.3.1 | Radio semantics for single choice (Radix ToggleGroup single / RadioGroup), `aria-pressed` for independent toggles, `aria-expanded` + `aria-controls` on disclosures; a non-colour selected cue | C §6.2–6.4, N §3.5 | AX-01, SR-01 |
| F-A11Y-017 | medium | 1.3.1, 4.1.2 | `aria-current="page"` in every nav; one `nav aria-label="Main"` per breakpoint; sub-navs labelled; Tooltip on hover and focus replaces `title` | N §1.9, S §3.9 | AX-01, KB-01 |
| F-A11Y-018 | medium | 1.3.1 | Tables: hidden caption stating the sort, `th scope`, `aria-sort`, a named Actions header, disambiguated dynamic columns | N §7.6, §7.14 | AX-01, SR-03 |
| F-A11Y-019 | medium | 1.4.3 | State text tokens ≥ 5.47:1 on their tints; empty cells are blank with sr-only "No value" or "–" in `--text-3`; node titles in `--text`; nothing below 12 px at any canvas zoom | F §3.4, N §5, FD1 level of detail | CT-02, CT-03 |
| F-A11Y-020 | medium | 1.4.3 | Placeholders use `--text-3` (≥ 4.70:1) and are never the only label | F §3.4, C §3.1 | CT-02 |
| F-A11Y-021 | medium | 1.4.3 | Marketing header is a solid `--surface` with no alpha or blur in both themes | PA §4.1 | VR-01, CT-02 |
| F-A11Y-022 | medium | 2.2.2 | No idle animation; reduced motion honoured app-wide from both sources, the OS setting and the in-app Motion setting (`tokens.css`, `base.css`, `useReducedMotion`); the live dot pulse is bounded to 3 cycles per state entry (§14) | F §11, §14 here | VR-03, MN-03 |
| F-A11Y-023 | medium | 2.5.8 | 24 × 24 hit areas everywhere via padding or `::after`; 44 × 44 on touch; destructive controls ≥ 8 px from routine ones or in `⋯` | F §14, C §1.4; §15 here | TS-01 |
| F-A11Y-024 | medium | 4.1.2 | `IconButton` requires `label` (TypeScript); `aria-label` equals the tooltip; labels hidden on small screens use `sr-only`, never `display:none`; per-row names include the row | C §2.2, N §7.14 | LN-02, AX-01 |
| F-A11Y-025 | medium | 1.3.5, 3.3.8, 2.4.7 | Sign-in `autocomplete="username"` + `current-password`, sign-up `new-password`, OTP `one-time-code`; paste allowed; 26 px show-password toggle with a visible ring and `aria-pressed`; no dotted placeholder; inline errors | PA §8.9, C §3.3; §11.4 here | AX-01, MN-01 |
| F-A11Y-026 | medium | 1.3.1, 2.4.6 | Login has an H1 inside `main`; panels and sheets use H2/H3; public pages share header/nav/main/footer; no skipped levels | S §3.1, PA §5.11; §6.2 here | AX-01, SR-01 |
| F-A11Y-027 | medium | 2.4.3, 2.4.11 | The `?` sheet is a portalled Dialog `lg` with focus moved in; the inspector takes focus on Enter and Esc returns it to the step | O §19, FD §16.5, S §10 | KB-11, KB-07 |
| F-A11Y-028 | medium | 2.4.3, 2.4.6, 1.1.1 | Canvas order follows the graph (depth-first from the first Trigger); connections are named from labels; the minimap is `aria-hidden` | FD §16.2, §16.5 | KB-08, SR-04 |
| F-A11Y-029 | medium | 2.1.1, 1.4.3 | No nested scroll regions on the marketing home (disclosure instead); any remaining scroller is a focusable labelled region | PA §5.8, §5.11 | AX-01 |
| F-A11Y-030 | low | 2.5.3, 1.3.1, 2.4.3 | Accessible names start with the visible text; panel titles are headings; same-tab links lose the ↗ icon; DOM order equals visual order | §10.2 here, ST §10 | MN-01, KB-01 |

All 30 findings have an owner and a test. None is left to "later".

---

## 4. Related findings from other lenses

These findings were filed under UX, visual, Flow Designer, responsive or QA, but each breaks a WCAG criterion. The fix is owned elsewhere; the test lives here.

| ID | What breaks | WCAG | Fix (owner) | Proven by |
|---|---|---|---|---|
| F-FLOW-001, F-UX-024, F-QA-002 | Edits (and opening a flow) write to the live flow; Backspace deletes connected steps with no undo; "Up to date" while saves fail | 3.3.4 Error Prevention, 4.1.3 | Draft and Live revisions, Publish gate with review, Undo toast on delete, a save chip that can fail and announces failure assertively once (FD §4–§5, O §18.1) | KB-07, LR-01 |
| F-UX-013 | Bulk CALL and the `c` key dial real leads with no pre-flight | 3.3.4 (financial), 2.1.4 | Call gate for every billable call; Start needs `⌘/Ctrl+Enter` or the labelled button (L §6, CK) | KB-05 |
| F-FLOW-006 | Canvas mouse-only, invisible focus, creation-order tab order | 2.1.1, 2.4.3, 2.4.7 | Same fix as F-A11Y-001, -007, -028 | KB-07, KB-08 |
| F-FLOW-008, F-VIS-003 | Node text at 9.3 px and 1.48–3.31:1 at fit zoom; dark minimap in light theme | 1.4.3, 1.4.4, 1.4.11 | Level of detail with a 12 px floor at every zoom; ink titles; tokenised minimap (FD1, F §2.3) | CT-02, CT-03 |
| F-FLOW-011, F-FLOW-020 | Outcome meaning carried by handle position and colour ("Green handle = VERIFIED", "connects from bottom handle"); marching-ants edges ignore reduced motion | 1.3.3 Sensory Characteristics, 1.4.1, 2.2.2 | Named answer rows with labels on the edge; instructions never refer to colour, shape or position; no animated edges at rest (FD §7.7, FD1) | SR-04, VR-03 |
| F-FLOW-024 | Documented shortcuts do not work; shortcut dialog clipped; Mac keys shown on Windows | 2.1.1, 1.4.10, 3.3.2 | `?` sheet as a portalled Dialog; platform-aware `Kbd`; only shortcuts that exist are listed (C §7.3, S §10) | KB-11 |
| F-FLOW-015, F-UX-025, F-UX-012 | Invalid values accepted and autosaved; Save covers two fields and silently discards | 3.3.1, 3.3.3, 3.3.4 | One validation rule (C §8.2 V1–V12); dirty-state guard; UnsavedChangesBar (O §18.3) | KB-14 |
| F-RWD-001, F-RWD-005 | Phone and 200 % zoom navigation reaches 6 of 12 sections; the rail hides items at laptop heights | 1.4.10 Reflow, 2.4.5 | Shell per width class; zoom maps to width classes; 12 of 12 reachable at 320 × 640 and 720 × 450 (N §1, R §2.6) | VR-04, MN-03 |
| F-RWD-002 | Cockpit's fixed-height stack overlaps controls at 720 × 450 with no way to scroll | 1.4.10, 2.4.11 | Phone Cockpit stacks the card above the transcript with a sticky 44 px action bar (CK §5, R §11) | VR-04 |
| F-RWD-003 | Publish (ACTIVATE) clipped off-screen at 768–877 px | 1.4.10, 2.1.1 | Review mode at 768–1023; Publish never clipped (FD §21.3) | VR-04 |
| F-RWD-018 | Marketing phone menu ignores Esc; 14 px inputs zoom on iOS | 2.1.1, 4.1.2 | Menu is a Dialog sheet with `aria-expanded` sync; 16 px field text on touch (PA §4, F §14) | KB-03 |
| F-VIS-002 | 16 font sizes, 36 % of text below 12 px, px units | 1.4.4 Resize Text, 1.4.12 | rem roles with a 12 px floor; `html` at 100 % (F §2.3, N §0.6) | CT-03, VR-05 |
| F-VIS-014, F-VIS-015 | Tooltips 70 px wide and clipped by cards; rail labels clipped | 1.4.13 Content on Hover or Focus, 1.4.10 | Portalled Tooltip, max 280 px, dismissable with Esc, hoverable (O §6) | KB-04, MN-03 |
| F-VIS-032 | Theme toggle whose icon and label disagree; stray "Collapse [" glyph | 2.5.3, 1.1.1 | Theme as System · Light · Dark radio items; tooltip "Collapse sidebar" with a `Kbd` (N §1.2) | MN-01 |
| F-QA-036, F-UX-028 | The wallet banner renders about 3 s late and pushes content down | 2.5.2 (mis-activation risk), 2.4.3 | Wallet state resolved in the server layout; no content shift; no global banner (O §10.2) | VR-04 |
| F-QA-007 | Slow auth drops to a bare `/login`; offline navigation dead-ends | 2.2.1 Timing Adjustable, 3.2.2 | SessionExpired dialog only on an explicit 401, `next=` preserved; ConnectionBar offline state (O §10.3, §16) | MN-04 |

---

## 5. WCAG 2.2 AA conformance matrix

One row per success criterion. "Requirement" is what the redesign must do; "Where" names the owner; tests are in §21. A criterion marked **N/A** still has its reason, so the ACR can be written from this table.

### 5.1 Perceivable

| SC | Lvl | Requirement for Vaani | Where | Test |
|---|---|---|---|---|
| 1.1.1 Non-text Content | A | Decorative icons `aria-hidden`; every icon-only control named; phase glyph tiles decorative (the phase word is text); charts `role=img` with a finding sentence plus **View as table**; masked phones read "Phone ending 4821"; language-mark glyphs hidden where the name is visible, `aria-label` where alone; the V mark "Vaani Labs" | C §2.2, N §5.6, §11.8; §10 | AX-01, SR-01 |
| 1.2.1 Audio-only (Prerecorded) | A | Every call recording has the full transcript beside it (turn rows); marketing "Hear it work" samples show their transcript | N §12.4–12.5, PA §5 | SR-03 |
| 1.2.2 Captions (Prerecorded) | A | Any product or marketing video carries captions. No video ships in v1 | PA | MN-03 |
| 1.2.3 Audio Description or Media Alternative | A | Videos, if added, get a transcript that describes the visuals | PA | — |
| 1.2.4 Captions (Live) | AA | If Meetings renders live meeting audio or video in the browser, the live transcript is offered as captions (open question §25-2) | MP | MN-04 |
| 1.2.5 Audio Description (Prerecorded) | AA | As 1.2.3 | PA | — |
| 1.3.1 Info and Relationships | A | Landmarks, one H1, H2/H3 per section; real tables with `th scope` and captions; `fieldset`/`legend` for groups; lists as `ul`/`ol`; the Outline as `tree`; answer rows inside their step's group | §6, N §7.14, FD §16.3 | AX-01, SR-01 |
| 1.3.2 Meaningful Sequence | A | DOM order equals visual order (Settings "Save" before the sub-nav and the reversed Google/Microsoft order are fixed, F-A11Y-030); portals return focus | §7.3, ST §10 | KB-01 |
| 1.3.3 Sensory Characteristics | A | No instruction relies on colour, shape, position or sound ("green handle", "bottom handle", "click the blue button" are banned strings); answers are named | FD §19, §4 above | LN-02 |
| 1.3.4 Orientation | AA | No orientation lock; the phone Cockpit, Leads and the Outline work in landscape (844 × 390) | R §2 | VR-04 |
| 1.3.5 Identify Input Purpose | AA | `autocomplete` on every personal-data field (table in §11.3) | C §3.1, PA | AX-01 |
| 1.4.1 Use of Color | A | Every state has a word and an icon; links in running text are underlined; diff states carry tags and strike-through/underline; selection has a non-colour cue (inset bar, raised key, check glyph) | F §3.4, N §5 | VR-02 |
| 1.4.2 Audio Control | A | No audio plays on load. The Rep console ring for an incoming transfer has a visible **Mute ring** control and stops on answer or decline; voice previews play only on click, one at a time, with Stop | CK §5, C §6.4 | MN-04 |
| 1.4.3 Contrast (Minimum) | AA | Every text pair ≥ 4.5:1 in both themes, including placeholders, helper text, table headers, tags and canvas text at any zoom; no alpha on text | F §3.8, §13 | CT-01, CT-02 |
| 1.4.4 Resize Text | AA | rem sizes, `html` at 100 %; 200 % zoom and 150 % browser text size lose nothing | F §2.3, R §2.6 | VR-04, MN-03 |
| 1.4.5 Images of Text | AA | None. The V mark is a logo (exempt) | D §3.1 | — |
| 1.4.10 Reflow | AA | 320 CSS px: no sideways page scroll, no overlap. Exempt 2-D content: the flow canvas (the Outline carries the same content) and data tables (pinned key column, list rows below 768) | R §2.6, §18 | VR-04 |
| 1.4.11 Non-text Contrast | AA | Control borders `--control` ≥ 3.06 / 3.01:1 on every plane; focus ≥ 6.15:1; sockets, edges, state borders, chart marks ≥ 3:1 | F §3.4, §3.8 | CT-01 |
| 1.4.12 Text Spacing | AA | Text boxes use `min-height`, never fixed heights; nothing clips with 1.5 line height, 0.12 em letters, 0.16 em words, 2 em paragraphs | R §2.6 | VR-05 |
| 1.4.13 Content on Hover or Focus | AA | Tooltips and hover cards are dismissable (Esc), hoverable and persistent; row actions revealed on hover also appear on focus; nothing essential lives only in a tooltip on touch | O §6, N §7.8 | KB-04 |

### 5.2 Operable

| SC | Lvl | Requirement for Vaani | Where | Test |
|---|---|---|---|---|
| 2.1.1 Keyboard | A | Every function by keyboard: canvas authoring, row opening, sheets, gates, player, charts, menus, file upload (Choose files), reordering (`Alt+↑/↓`) | §9 | KB-01…KB-14 |
| 2.1.2 No Keyboard Trap | A | Only modal overlays trap, and Esc always leaves them; the canvas is one stop and Tab leaves it; prompt fields never swallow Tab | O §1.3, §9.6 | KB-08 |
| 2.1.4 Character Key Shortcuts | A | Single-key shortcuts can be turned off, are active only when their widget has focus, and never fire in fields or on buttons | §8 | KB-11, KB-12 |
| 2.2.1 Timing Adjustable | A | Info toasts 6 s, paused on hover and focus, with the content still reachable (F8); error and Undo toasts persist; sessions warn before expiry if shorter than 20 h; OTP expiry offers "Send a new code" | O §9.2, PA §9 | LR-01 |
| 2.2.2 Pause, Stop, Hide | A | No idle loops; live dot pulse bounded to 3 cycles per state entry; audio meters move only with real audio (essential); spinners only while a request the user started runs | §14 | VR-03 |
| 2.3.1 Three Flashes | A | Nothing flashes | F §11 | — |
| 2.4.1 Bypass Blocks | A | Skip link, landmarks, F6 region cycling | §6.4 | KB-01 |
| 2.4.2 Page Titled | A | Unique titles from the nav config (S §4.4) | §6.3 | KB-02 |
| 2.4.3 Focus Order | A | DOM order = visual order; graph order on the canvas; focus returns to triggers (never `<body>`) | §7.3 | KB-03 |
| 2.4.4 Link Purpose (In Context) | A | Links say where they go ("Top up", "Open in flow", "Open call details, Today 10:42 am"); no "Click here" | §10 | SR-01 |
| 2.4.5 Multiple Ways | AA | Navigation, Search or jump (⌘K), breadcrumbs, deep links for records | N §1, O §8 | — |
| 2.4.6 Headings and Labels | AA | Headings name their section; labels are nouns; no ids in names | §6.2, §10 | SR-01 |
| 2.4.7 Focus Visible | AA | The global outline (F §13) | §7.1 | VR-01 |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Sticky headers, the bulk bar, toasts, the bottom bar and the Baseline never cover the focused element (`scroll-margin`, `scroll-padding`, toast offset) | §7.4 | KB-05, VR-04 |
| 2.5.1 Pointer Gestures | A | Pinch and two-finger pan on the canvas have buttons (zoom, Fit, minimap click); swipe-to-dismiss has a Dismiss button | §16 | MN-04 |
| 2.5.2 Pointer Cancellation | A | Activation on pointer up (native buttons); a connect drag released off a target cancels; no action on down-events | §16 | MN-04 |
| 2.5.3 Label in Name | A | Accessible names start with the visible label | §10.2 | MN-01 |
| 2.5.4 Motion Actuation | A | N/A: no device-motion input | — | — |
| 2.5.7 Dragging Movements | AA | Every drag has a single-pointer path (§16 inventory) | §16 | MN-04 |
| 2.5.8 Target Size (Minimum) | AA | 24 × 24 hit areas, or the spacing or equivalent-control exception (canvas sockets when zoomed out, §15.1); 44 on touch (adopted 2.5.5) | §15 | TS-01 |

### 5.3 Understandable and robust

| SC | Lvl | Requirement for Vaani | Where | Test |
|---|---|---|---|---|
| 3.1.1 Language of Page | A | `<html lang="en-IN">` (v1 chrome is English; Indian English gives correct ₹ and lakh readings where voices exist) | §17 | AX-01 |
| 3.1.2 Language of Parts | AA | `lang` on transcript turns, prompts, answer examples, language-mark glyphs; Hinglish `hi-Latn` | §17 | MN-05 |
| 3.2.1 On Focus | A | Focus never opens, navigates or saves anything; rail tooltips only describe | — | KB-01 |
| 3.2.2 On Input | A | Selects and radios change a view in place; nothing navigates or publishes on change; Switch settings autosave with a visible status (a documented pattern, not a context change) | C §6.3 | SR-01 |
| 3.2.3 Consistent Navigation | AA | One nav config, the same order at every width | N §0.7 | — |
| 3.2.4 Consistent Identification | AA | One name and one icon per destination and per action ("Place call…", "Top up", "Publish v8…") | D §4.3 | LN-02 |
| 3.2.6 Consistent Help | A | Help and docs and Keyboard shortcuts sit in the account menu on every route, "Shortcuts" in the Baseline, Contact in the public footer | S §9.2 | — |
| 3.3.1 Error Identification | A | Errors in text beside the field, `aria-invalid`, and in the Problems panel for flows | C §3.1, FD §12 | KB-14 |
| 3.3.2 Labels or Instructions | A | Visible labels; format in the hint; "(optional)" marker rule | C §3.1 | AX-01 |
| 3.3.3 Error Suggestion | AA | Every message says how to fix ("Enter a 10-digit mobile number, like 98765 43210.") | C §8.2 | KB-14 |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Calls through the Call gate; top-ups show amount and resulting runway before paying; flows go live only through the Publish gate; deletes are undoable or confirmed | D P3, O §3 | KB-05, KB-07 |
| 3.3.7 Redundant Entry | A | Values already given are carried: email across auth pages, the lead in the Call gate, the Outcome step into the wrap-up form, failed submits keep input, import mapping remembered | PA, CK §4, C §8.2 | MN-01 |
| 3.3.8 Accessible Authentication (Minimum) | AA | Paste and password managers allowed; email link and OTP (`one-time-code`) alternatives; any bot check is non-cognitive | PA §8.9 | MN-01 |
| 4.1.2 Name, Role, Value | A | Radix primitives for every widget; custom widgets (step, socket, Outline, talk strip) get roles, names and states per §9 | §9, §10 | AX-01, SR-04 |
| 4.1.3 Status Messages | AA | The announcer and the §12 catalogue | §12 | LR-01, SR-02 |

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

---

## 9. Keyboard maps per complex widget

Each map lists the keys, the roles and the one-line reason. Single-key rows (marked ¹) obey the switch (§8.3). Where a component spec already fixes the map, this section restates it only as far as needed to test it and names the owner.

### 9.1 Shell navigation (N §1.9, S §3.8)

| Widget | Keys | Roles and names |
|---|---|---|
| Skip link | Tab (first stop) · Enter | link "Skip to main content" → `main` |
| Workspace switcher | Enter / Space / ↓ opens; menu keys (§9.13) | `button aria-haspopup="menu"`, name "Workspace: Sample Realty, Admin" |
| Search or jump | Enter opens the palette; ⌘K / Ctrl+K from anywhere | `button aria-keyshortcuts="Control+K"` (Meta on macOS) |
| Sidebar items | Tab / Shift+Tab (one stop each); Enter follows. **Arrow keys are not intercepted** (it is a list of links, not a menu) | `nav aria-label="Main"` › `ul aria-labelledby={group label}` › `a aria-current="page"` on the current item; badge text in the name ("Billing, wallet low") |
| Setup card | Enter | one link "Finish setup, 3 of 5 done. Next: add money" |
| Account menu | menu keys | contains Theme (radio items), the Single-key shortcuts switch (`menuitemcheckbox`), Sign out… |
| Rail (1024–1279) | Tab through items; tooltip shows on focus immediately; `[`¹ or the expand button opens the overlay; Esc, `[`¹ or scrim click closes; focus goes to the current item on open and back to the expand button on close | expand button `aria-expanded`, `aria-keyshortcuts="["` |
| NavSheet (768–1023) | Menu button opens; focus to the current item; Tab trapped; Esc closes, focus to the menu button | `role="dialog" aria-modal="true" aria-label="Navigation"` |
| Bottom bar (< 768) | Tab through 5 items; Enter follows | `nav aria-label="Main"`; items are links, More is `button aria-haspopup="dialog" aria-expanded` |
| More sheet | Focus to the current destination (or the first row); Tab trapped; Esc closes | `role="dialog" aria-label="More"`; rows are links with `aria-current` |
| Baseline | Tab through segment links | `role="region" aria-label="Workspace status"`; full names per segment (S §5.6) |

### 9.2 Tabs, segmented controls, radio groups (N §3.4, C §6.2–6.4)

| Widget | Keys | Roles |
|---|---|---|
| ViewTabs (Leads, Call reports views) | ←/→ move focus; Home/End; **Enter or Space selects** (manual activation: selection fires a server query) | `tablist aria-label="Views"` · `tab aria-selected aria-controls` · counts in the name ("Callbacks due, 18") |
| PanelTabs (sheet tabs, inspector Configure · Test data · Issues) | ←/→ move **and** select (automatic; local content) | as above; the panel is `tabpanel` |
| RouteTabs (Billing) | Tab between links; Enter follows | `nav aria-label="Billing sections"`, `aria-current="page"` |
| SegmentedControl, VoiceChoice, session mode, sentiment and status filters (single) | one tab stop; ←/→/↑/↓ move and select; Tab leaves | `radiogroup aria-label` · `radio aria-checked`; the selected item has a non-colour cue (raised key with `--control` border) |
| Multi-select chips, panel toggles | Tab to each; Space toggles | `button aria-pressed` |
| Disclosures (New task, "2 people", Show all checks) | Enter / Space toggles | `button aria-expanded aria-controls` |

### 9.3 Data tables, bulk bar, pager, record sheet (N §7.8–7.14, L §8, CR §2.8)

| Key (focus in the table body) | Does |
|---|---|
| Tab into the table | Focuses the active row (the last focused, else the first). The body is one stop plus the active row's controls |
| ↑ / ↓ · `J` / `K`¹ | Previous / next row (real focus, roving `tabindex`) |
| Home / End · PageUp / PageDown | First / last row on the page · one screen of rows |
| Tab / Shift+Tab from a row | Through that row's controls (checkbox, key link, Call…, ⋯), then out to the BulkBar and the pager |
| Enter | Opens the record sheet (native activation wins on buttons and links) |
| Space · `X`¹ | Toggles the row's selection |
| Shift+↑ / Shift+↓ · Ctrl/⌘+A | Extends the selection · selects every row on the page |
| `C`¹ | Opens the Call gate for the selection or the focused row (never dials) |
| Esc | Closes the open sheet, else clears the selection |
| Shift+F10 / context key | Row menu (the same items as `⋯`) |
| Sheet open: `J`/`K`¹ or Previous/Next, F6, Esc | Next or previous record ("Lead 5 of 38" announced) · move between table and sheet · close and return focus to the row |

Roles: `table role="grid"` labelled by the H1, hidden caption with the sort, `aria-rowcount`, `aria-rowindex`, `aria-multiselectable`, `aria-selected`, `aria-current="true"` on the open row; the BulkBar is `role="toolbar" aria-label="2 leads selected"` with arrow keys; the pager range is `role="status"`. **Phones** use list rows (a stretched key link per `li`) and a Select mode; there is no per-row Call button, so a mis-tap never dials (N §7.13).

### 9.4 Command palette (O §8)

⌘K / Ctrl+K opens from anywhere (including fields) and closes when pressed again · type to filter · ↑/↓ move the active option (wraps) · Enter runs it and closes · ⌘/Ctrl+Enter opens a record in its sheet without leaving the page · Esc clears the query, then closes and returns focus · Tab moves between the input and Clear only. Roles: `dialog aria-label="Search or jump"` › `combobox aria-expanded aria-controls aria-activedescendant aria-autocomplete="list"` › `listbox` with a `group` per section › `option`. Result counts are announced after typing settles. **Actions that cost or go live end in "…" and open their gate; the palette never dials, bills or publishes** (A2).

### 9.5 Gates: Call gate and Publish gate

The full keyboard, focus and announcement contract for every gate (Call, Publish, Add agent, money and form gates) is `spec/02-components-gate.md` §4.5 and §8; this table is its summary for the two most used.

| | Call gate (popover, modal) | Publish gate (640 px sheet, modal) |
|---|---|---|
| Opens from | `C`¹ on a row, "Call…", the bulk bar, the palette, the Cockpit's Place call… | "Publish v8…", the palette |
| Initial focus | The gate heading (`tabindex="-1"`). **Never the Start button**, so `C` then Enter cannot dial | The sheet heading |
| Inside | Tab through checks with actions (Include, Top up, Fix), the cost line, Cancel, Start | Tab through checks ("Go to step" links), the warning acknowledgement checkbox, the diff links, "Where it goes live", the note, Cancel, Publish |
| Confirm | ⌘/Ctrl+Enter anywhere in the gate, or Enter / Space on the focused **Start n calls** button | ⌘/Ctrl+Enter or the focused **Publish v8** / **Publish with 1 warning** |
| Blocked | Start is `aria-disabled` with the reason linked by `aria-describedby` ("Outside calling hours. Opens 10 am IST.") and stays focusable | Publish is `aria-disabled` with "Fix 2 errors to publish." |
| Close | Esc or Cancel; focus returns to the trigger | Esc or Cancel; focus returns to the Publish button |
| Announced | The readiness summary when it changes ("9 calls ready. 3 leads skipped."); the result after Start | The check summary when it changes; the publish result toast |

### 9.6 Flow canvas (FD §16.5, FD1): the only canvas key map

**This table is the one canvas key map.** Flow Designer part 1 §11, part 2 §16.5 and §18, the shell's `?` sheet and `07-motion` reference it and restate no keys; every row is registered once in the `ShortcutProvider` (§8.2, §8.4), which generates the `?` sheet and `aria-keyshortcuts`. The canvas is **one tab stop** with a roving `tabindex` in **call order** (depth-first from the first Trigger, answers in listed order, unreachable steps last; F-A11Y-028). Edges are not tab stops: they are reached and edited through their source socket or answer. One meaning per key: **Alt+Arrow always moves** (here, in the Outline, and in answer, case and column lists); issues use **Alt+.** and **Alt+,**.

| Key (focus on a step) | Does |
|---|---|
| Tab / Shift+Tab | Enter the canvas at the active step (first time: the first Trigger) / leave it in one press |
| → / ← | Follow the first output to the next step / go back along the connection you arrived by (else the first incoming) |
| ↑ / ↓ | Previous / next step in the same layer; on a step with answer or result rows, ↓ moves into its sockets |
| Home / End | First Trigger / last step in call order |
| Enter · F2 | Open the inspector with focus on Label; Esc in the inspector returns to the step |
| Space · Shift+Space | **Select only this step** (like a click) · **toggle** this step in the selection (like Shift+click) |
| Ctrl/⌘+A · Esc | Select all steps, notes and frames · clear the selection (a second Esc clears phase emphasis) |
| `C`¹ · `A`¹ | Connect to… · Add a step after, already connected |
| Delete / Backspace · Alt+Delete | Delete the selection with an Undo toast (F-FLOW-001) · delete and reconnect (one input, one output only) |
| Alt+Arrow · Alt+Shift+Arrow | Move the focused or selected steps 16 px · 64 px, instant, one undo entry per second of presses, announced "Moved Book site visit" |
| `M`¹ | **Move mode** (§16.1): arrows move 16 px, Shift+arrows 64 px, Enter places, Esc restores; the announced, discoverable path, also reachable from the step menu with a click-to-place single-pointer option |
| Alt+. · Alt+, | Next / previous issue: moves focus to that step and selects it (matched by `KeyboardEvent.code` Period / Comma, so macOS Option characters don't interfere; inert inside text fields) |
| ⌘/Ctrl+D · ⌘/Ctrl+C · X · V | Duplicate · copy · cut · paste |
| ⌘/Ctrl+G · ⌘/Ctrl+Shift+G | Frame the selection · ungroup |
| ⌘/Ctrl+F · ⌘/Ctrl+Z · ⌘/Ctrl+Shift+Z (Ctrl+Y) | Find · Undo · Redo |
| `+`¹ · `−`¹ · `Shift+1`¹ · `Shift+2`¹ · `Shift+0`¹ | Zoom in · zoom out · fit flow · fit selection · 100 % |
| Shift+F10 / context key | Step menu: Open · Add step after… · Connect to… · Move step · Duplicate · Delete step · Delete and reconnect |
| `O`¹ `V`¹ `T`¹ `?`¹ · F6 | Outline · Variables · Test panel · shortcuts · cycle header → canvas → inspector → Problems bar |
| `]`¹ · `[`¹ (compare mode only) | Next · previous change; the shell's `[` sidebar key is suppressed while the designer is open (S §3.8) |

| Key (focus on a socket, reached with ↓ on a step) | Does |
|---|---|
| ↑ / ↓ | Previous / next socket; ↑ from the first returns to the step |
| Enter · Space · `C`¹ | Open **Connect to…** for this answer or result |
| → | Follow this socket's connection to its target step |
| Delete | Remove this socket's connection (Undo toast) |
| Esc | Back to the step |

**Names** (FD §16.5): a step is named by its **stable number** and title first, then its call-order position: "#9 Ask about a site visit, step 3 of 14 in call order, Logic, Question. Answers: Yes goes to Book site visit; Later goes to Schedule callback; No goes to Polite close; No reply is not connected. 1 warning." Action result sockets: "Result Found of Find the buyer's record, goes to Ask about budget"; answer sockets: "Answer Yes, goes to Book site visit. Press Enter to change." or "Answer No reply, not connected. Press Enter to connect." Outcomes end "Sets lead to Interested". **The instruction string** (the only one; one shared hidden node referenced by `aria-describedby` from the canvas section and every step): "Arrow keys follow connections. Enter opens a step. C connects, A adds a step after, Alt and arrow keys move steps. Question mark lists all shortcuts." With single-key shortcuts off it drops the letter keys. Steps are `role="group" aria-roledescription="step"`; sockets are `<button>`s; the minimap is `aria-hidden="true"`; the canvas is a `<section>` with a visually hidden `h2` "Canvas" and **no `role="application"`** (§6.1). Focusing a step pans it into view (§7.4) and never zooms.

### 9.7 Outline (FD §16.2–16.3)

`role="tree"` labelled "Flow outline, Site-visit qualifier"; rows are `treeitem`s with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded`; `aria-selected` mirrors the canvas selection. Keys: ↑/↓ rows · → expand or first child · ← collapse or parent · Home/End · typeahead · Enter opens the step in the inspector (a reference row jumps to its step) · F2 rename inline · `A`¹ add · `C`¹ Connect to… (answer rows) · Delete (Undo) · Alt+↑/↓ move within a chain (Alt+Arrow means move everywhere) · Alt+. / Alt+, next and previous issue · Shift+F10 row menu. Every edit announces its result ("Connected Yes to Book site visit").

### 9.8 Connect to…, Go to [step], inspector

- **Connect to…** is a Combobox popover (C §5.3) titled "Connect 'Yes' to…": type to filter (label, step number, synonyms) · ↑/↓ · Enter connects and closes · Esc closes; focus returns to the origin (step, socket, answer row) and the result is announced. Options are grouped by phase (`group` + label); the current target is "(current)"; "New step…" first; "Disconnect" last.
- **Go to [step ▾]** on every answer in the inspector is a Select (Radix) with the same options: Enter or ↓ opens, typeahead, Enter chooses.
- **Inspector** (`aside`): ordinary form order; PromptField never swallows Tab (Tab leaves the field; `{{` opens the variable menu, Esc closes it); Esc returns focus to the step unless a popover inside is open.

### 9.9 Transcript feed (N §12.4)

The feed is **one tab stop**: turns are focusable `li`s with a roving `tabindex` (this makes a 500-turn call cost one stop, not a thousand). ↑/↓ move between turns and read them (speaker, time, language, text) · Home / End first / latest turn (End re-pins follow mode) · Tab from a focused turn moves into its links (step, source, timecode) and then out of the feed · ⌘/Ctrl+F inside the panel opens transcript search; Enter / Shift+Enter next / previous match; Esc closes search and returns to the Search button. "Jump to latest · 2 new" is a normal button. Roles: `section aria-labelledby` › `ol aria-label="Transcript"` › `li lang="hi"` per turn. It is **not** `role="log"` (§12.3).

### 9.10 Recording player and talk strip (N §12.5)

`role="group" aria-label="Recording"`. Play / Pause, Back 5 s, Forward 5 s, speed and `⋯` are buttons. The scrubber is `role="slider"` with `aria-valuetext="00:41 of 02:31, Vaani speaking"`: ←/→ 5 s · Shift+←/→ 15 s · PageUp/PageDown 30 s · Home/End. Space or `K`¹ plays and pauses only while focus is inside the player and not on a button. Enter on a turn's timecode seeks and plays. Nothing is global.

### 9.11 Charts (N §11.8)

A static chart is one `role="img"` with a finding sentence. An interactive plot is one tab stop (`aria-roledescription="chart"`): ←/→ move between periods · Home/End · Esc hides the tooltip; a hidden polite region reads the focused period. **View as table** gives the same data as a table.

### 9.12 Pickers, upload, sliders (C §6.5, §7.1, §7.2)

Date and time fields are typed segments (↑/↓ change a segment, typing replaces it); the calendar opens with Alt+↓ and uses the grid keys (arrows by day and week, PageUp/PageDown by month). File upload is always a **Choose files** button (drop is an enhancement). Sliders: arrows, PageUp/PageDown, Home/End.

### 9.13 Menus, tooltips, toasts (O §6, §7, §9)

Menus: Enter / Space / ↓ open and focus the first item · ↑ opens at the last · ↑/↓ wrap · Home/End · typeahead · →/← submenus · Esc closes and returns focus · Tab closes and moves on. Tooltips: show on hover after 300 ms and on focus at once; Esc hides without moving focus; they never hold controls. Toasts: F8 focuses the newest; Tab reaches its action and Dismiss; Esc dismisses and returns focus.

---

## 10. Names and labels

### 10.1 Where a name comes from (in this order)

1. **Visible text** inside the control or a `<label for>` / `aria-labelledby` pointing at visible text.
2. **`aria-label`** only on icon-only controls, and it equals the tooltip text (C §2.2).
3. **Never** `title` (not exposed on touch, read inconsistently; F-A11Y-024) and never a placeholder (F-A11Y-003, F-A11Y-020).

Text hidden at small widths keeps its name: `sr-only sm:not-sr-only`, never `hidden sm:inline` (the Leads Refresh and Export buttons had **no** name at 390 px, F-A11Y-024). `IconButton` makes `label` a required prop, so an unnamed icon button does not compile.

### 10.2 Label in name (2.5.3): before → after

The accessible name **starts with** the visible words, so "Click Save context" works in Voice Control, Voice Access and Dragon (MN-01).

| Control | Before (visible / accessible name) | After (visible / accessible name) |
|---|---|---|
| Cockpit intel save | "SAVE CONTEXT" / "Save customer context — agent will use this data" | Retired with the intel panel; the wrap-up form's button is "Save and next" / "Save and next" |
| Call reports row action | "Re-analyze" / title "Re-run AI analysis from scratch" | In `⋯`: "Re-analyse call" / "Re-analyse call" (the consequence moves to the menu item's description) |
| Leads row call | icon / title "Call <name> (c)" | "Call…" / "Call… Lead 1042" (visible word first, then the record) |
| Call reports download | icon / title "Download CSV" ×50 | In `⋯`: "Download transcript" / "Download transcript, call from 10:42 am" |
| Wallet banner CTA | "Top up" / "Top up" at 3.27:1 | Notice link "Top up" / "Top up" (≥ 6.18:1) |
| Sign out | "Exit" tab / title "Sign Out" | "Sign out…" menu item / "Sign out…" |
| Dialog close | X icon / "button" (no name) | X icon / "Close" (sheets: "Close call details") |
| Flow Save and ACTIVATE | "Save" and "ACTIVATE" / same | "Publish v8…" / "Publish v8…" (no Save; autosave to draft) |
| Theme toggle | sun icon / "DARK" | Account menu › Theme › "System", "Light", "Dark" radio items |

### 10.3 Names that carry the record (per-row and per-step controls)

Repeated controls include which item they act on: "Select Lead 1042", "Select all leads on this page", "More actions for Lead 1042", "Call… Lead 1042", "Open call details, Today 10:42 am, 2 minutes 31 seconds, Interested", "Download transcript, call from 10:42 am", "Delete step Polite close…", "Play from 00:41", "Open step: Ask about a site visit", "Answer Yes, goes to Book site visit". Names never contain internal ids (`node_1785…`, F-A11Y-028) or full phone numbers.

### 10.4 How values are spoken

Abbreviations that look fine can be read wrongly ("2m" as "2 metres", "L" as a letter). `lib/format.ts` returns a display form and a spoken form; components render the display text `aria-hidden` and the spoken text `sr-only` in the same cell, so tables keep one cell per value.

| Value | Display | Spoken |
|---|---|---|
| Duration | `2m 31s` · `41s` | "2 minutes 31 seconds" · "41 seconds" |
| Latency, units | `180 ms` · `6 s` · `10 MB` | "180 milliseconds" · "6 seconds" · "10 megabytes" |
| Money, dense | `₹85 L` · `₹1.2 Cr` | "₹85 lakh" · "₹1.2 crore" (full `₹2,34,050.00` is read correctly under `lang="en-IN"`) |
| Masked phone | `+91 •••••• 4821` | "Phone ending 4821" (bullets `aria-hidden`) |
| Version | `Live v7` · `Draft · 3 changes` | "Live, version 7" · "Draft, 3 unpublished changes" |
| Outcome status line | `Lead → Interested`: plain `meta-12` text, not a tag (arrow is a Lucide icon); the same sentence on the canvas, in the Outline and in the direction | "Sets lead to Interested" |
| Timecode | `00:41` | "0:41" inside the button name "Play from 0:41" |
| Relative date | `Today 10:42 am` | same; the absolute date is in `<time datetime>` and the tooltip |
| Delta | `▲ 12%` (glyph is an icon) | "Up 12 percent, better" (the desirability word, N §4.7) |
| Keycaps | `⌘` `K` | "Command K" / "Control K" (C §7.3) |

**Separators.** The middle dot in meta rows is generated with CSS alternative text (`content: "·" / ""`) or wrapped in `aria-hidden`, so screen readers at high punctuation levels do not read "dot" between every fact.

**Decorative marks.** LiveDot, phase glyph tiles, tag icons and the language-mark glyph (when the language name is visible) are `aria-hidden`; the adjacent word carries the meaning. In transcript turn rows, where only the glyph shows, it carries `aria-label="Hindi"` and `lang` (§17).

---

## 11. Forms, errors and authentication

### 11.1 The Field contract (C §3.1), as test assertions

- Every control has a `<label for>` (or `fieldset`/`legend` for groups); a bare `<Input>` outside `Field` is a lint error.
- The hint and then the count are in `aria-describedby`; while invalid, the error replaces the hint in that list and `aria-invalid="true"` is set.
- Required fields carry `required`; optional fields say "(optional)" in the label (C §3.1 rule; §24 explains why not "(required)").
- Placeholders are examples ending in "…", never the only label, never a fake value ("••••••••" is removed from the password field).
- Field text is 16 px on touch (no iOS zoom-on-focus), 14 px on desktop.
- Nothing blocks typing or paste; nothing rewrites input silently (C §8.2 V8, V9).

### 11.2 Errors: identification, suggestion, announcement

| Moment | What the user perceives | Mechanism |
|---|---|---|
| Blur on a changed field with a format error | Red border, `circle-alert` + message under the field ("Enter a 10-digit mobile number, like 98765 43210.") | The message is referenced by `aria-describedby`; screen readers read it when focus returns. No live announcement on blur (it would interrupt the next field) |
| Typing in a field that shows an error | The error disappears as soon as it is fixed (300 ms debounce) | No announcement on fix; the field is simply valid when read |
| Submit with 1–3 fields invalid | Focus on the first invalid field | Its label, value and error are read on focus |
| Submit with more fields invalid | An error summary at the top of the form: "Fix 2 fields to continue", with a link per field | The summary receives focus (`tabindex="-1"`, a `danger` Notice, **not** `role="alert"`, so it is not read twice); each link focuses its field |
| Async check finishes while focus is still in the field | "A flow called 'Site visit' already exists. Choose another name." | Polite announcement once, plus `aria-describedby` |
| Server rejects (422) | Same field messages | As for submit |
| Server or network fails | One form-level InlineError above the actions with Retry and Details | `role="alert"` (the user's action failed) |
| Flow validation | Issues chip, step marks, Problems bar and panel with "Go to step" | Count changes announced politely, debounced 1 s after editing settles ("2 errors, 1 warning"); never per keystroke |

### 11.3 Input purpose (1.3.5)

1.3.5 applies to information **about the user**. Fields about a lead, a customer or a teammate describe someone else, so they must not receive the user's own autofill.

| Field | Attributes |
|---|---|
| Sign in: email | `type="email"` `autocomplete="username"` `inputmode="email"` `autocapitalize="none"` `spellcheck="false"` |
| Sign in: password | `type="password"` `autocomplete="current-password"`; show/hide toggle `aria-pressed`, 26 px visual with a 24 px+ hit area (PA §8) |
| Sign up: name · work email · company · phone | `name` · `email` · `organization` · `tel` with `type="tel"` `inputmode="tel"` |
| Sign up and reset: new password | `autocomplete="new-password"`; the rules list is visible and updates as you type (C §8.2 V1 exception) |
| One-time code (email link, 2FA) | one field, `autocomplete="one-time-code"` `inputmode="numeric"`; pasting a 6-digit code works; never six split boxes |
| Profile (the user) | `name`, `email`, `tel`, `organization-title` |
| Organization address | `organization`, `address-level2` (city), `address-level1` (state), `postal-code` |
| Top-up amount | `inputmode="numeric"` `autocomplete="transaction-amount"` |
| New lead, Cockpit contact, lead sheet fields | `autocomplete="off"` with a namespaced `name` (`lead_name`, `lead_phone`): **not** the user's tokens (§24) |
| Search fields | `type="search"` `autocomplete="off"` with a label (visible or `aria-label` equal to the placeholder's words without "…") |

### 11.4 Accessible authentication (3.3.8)

- Paste works in every auth field; password managers work (real `autocomplete`, stable `name`, no field renamed per render).
- Every sign-in offers a path that needs no memory test: the password manager, **Email me a link**, or a one-time code.
- No CAPTCHA puzzles, image selection, or "type the characters". If bot protection is needed, it is invisible or non-cognitive, with rate limiting as the first defence (§25).
- 2FA codes from an authenticator app accept paste; the code field says how long the code lasts ("Codes change every 30 s") and never times out the page.
- Errors are inline and specific ("That email and password don't match. Try again or email me a link."), never native browser bubbles (`noValidate`, PA §8).

### 11.5 Redundant entry (3.3.7)

| Where | What is carried so the user never re-types it |
|---|---|
| Auth pages | The email moves between sign in, sign up, link mode and reset (PA §8) |
| Call gate | The lead, flow, voice and language from the row or the Ready card |
| Wrap-up | Outcome fields pre-filled from the flow's Outcome step and captured answers |
| Import leads | The column mapping is remembered per workspace and offered next time |
| Failed submit, session expiry, offline | Form values are kept; flow edits stay on the device until they save |
| Settings | One save covers every field on the page (F-UX-012), so nothing is typed twice after a partial save |
| Top-up | The chosen amount survives a failed UPI attempt ("Try again" keeps ₹500) |

### 11.6 Error prevention for legal, financial and data actions (3.3.4)

| Action | Prevention |
|---|---|
| Place one or many calls | Call gate: checks, cost range, count after skips; confirm with ⌘/Ctrl+Enter or the labelled Start |
| Top up, set up autopay | Top-up sheet shows the amount and the resulting runway before paying; the UPI app confirms; autopay shows the mandate terms before approval |
| Put a flow live | Publish gate: validation, diff, where it goes live; roll back offered afterwards |
| Delete a step, lead, note or room | Undo toast (reversible) or ConfirmDialog naming the object and consequence (O §3) |
| Delete the account, revoke an API key | ConfirmDialog with typed confirmation; account deletion keeps its 7-day grace |
| Import leads | Mapping preview with row-level errors before anything is written |
| Bulk status change | Undo toast |

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

---

## 15. Target size (2.5.8, with 2.5.5 adopted on touch)

### 15.1 Rules

1. Every pointer target has a hit area of at least **24 × 24 CSS px** (`--size-hit-min`), or it meets the spacing exception (a 24 px circle centred on it does not touch another target or its circle), or it is a link inside a sentence (inline exception).
2. On coarse pointers and below 768 px every target is **44 × 44** (`--size-hit-touch`; touch density, F §14), and no layout mode may shrink one on touch. The nav's short-height mode is `(pointer: fine)` only (N §1.2, R §2.2), so a landscape tablet at 1024 × 768 keeps 44 px sidebar and rail items and scrolls the nav list instead. On the canvas, answer and result rows grow from 28 to 44 on coarse pointers so each socket's target is the full-height end of its row (FD1 §6.1). **One listed exception, with an equivalent:** canvas content scales with canvas zoom. Below 100 % a socket's coarse target is 44 wide by 44 × zoom tall (still ≥ 24 down to 55 %), and in the Block band sockets are stubs. The same job is always one tap away at 44 px: step `⋯` › Connect to…, the inspector's **Go to [step]** select, and the Outline. That is WCAG 2.5.8's equivalent-control exception, and TS-01 lists it. On fine pointers the same exception covers sockets below about 86 % zoom, where the 28 px row is shorter than 24.
3. A small visual keeps a large target through padding or an absolutely positioned `::after` (C §1.4): `.hit::after { content: ""; position: absolute; inset: min(0px, calc((100% - var(--hit)) / 2)); }`. Hit areas never overlap a neighbour's; where they would, the spacing grows instead.
4. Destructive controls sit at least `--space-8` from routine ones or live in `⋯` after a separator. End call is a danger outline, separated from Take over by `--space-8` and never at the same position a routine button occupies on another screen.

### 15.2 The small visuals and their targets

| Control | Visual | Hit (fine) | Hit (touch) | Audit before |
|---|---|---|---|---|
| Checkbox (rows, forms) | 16 | 24 (box + label) | 44 | 20 × 20 label, focus on a 1 × 1 input |
| Socket on a step | 10 | 24 × 24, clipped to its 28 px row (equivalent paths below ~86 % zoom, rule 2) | 44 × 44 at the row end: the answer or result row grows to 44 (FD1 §6.1); scales with zoom below 100 %, equivalents as rule 2 | 9 × 9 handle, 6.4 px at fit zoom (F-A11Y-001) |
| Connection (edge) | 1–3 px stroke | 24 px interaction width, label chip 24 tall | 44 | 1 px |
| Filter token remove "×" | 12 icon | 24 | 44 | — |
| IconButton `sm` (row actions, pager, toast and notice dismiss) | 28 | 28 | 44 | Refresh flows 14 × 14, Copy URL 15 × 15, Dismiss 22 × 22 |
| Show password toggle | 26 | 32 | 44 | 16 × 16 |
| Drag handles (answers, cases) | 16 × 24 | 24 | 44 | — |
| Scrubber handle and track | 10 handle, 6 px lanes | 24 tall track | 44 | — |
| Timecode button, step link, source link in turn rows | 12–13 px text | 24 tall (padding-block 4) | 44 row | — |
| Inline links in auth copy ("Forgot password?") | text | 24 tall (line box + padding) | 44 | 16–17 px tall (F-A11Y-023) |
| Bottom-bar item, More rows, TopBar buttons and chips | 20 icon | — | 44 × 44 minimum | Leads 77 of 84 targets under 44 at 390 |
| Segmented items | 26 | 26 (full track height) | 44 | Analytics period toggle 36 × 24 |
| Rail items (1024–1279) | 40 | 40 | 44 × 44 (`--size-hit-touch`); the item list scrolls between the pinned tile and footer when 12 don't fit (N §1.4) | 44 × 44 already |
| Sidebar nav items (≥ 1280) | icon 16 + label, full row | 32; 28 in short mode (≤ 800 tall, fine pointers only) | 44; never short mode; the list scrolls with the current item in view (N §1.2) | — |

TS-01 measures every interactive element's hit rectangle (including `::after`) on each route at 1440, at 390 with touch emulation and at **1024 × 690 with touch emulation** (a landscape tablet: short height and a coarse pointer; the Flow Designer at 100 % zoom). It fails on anything under the rule that is not listed as an inline, spacing or equivalent-control exception (the zoomed-out canvas, rule 2).

---

## 16. Dragging and pointer alternatives (2.5.7, 2.5.1, 2.5.2)

### 16.1 Every drag, and its single-pointer and keyboard paths

| Drag | Where | Single pointer, no drag | Keyboard |
|---|---|---|---|
| Move a step | Canvas | **Move mode**: step `⋯` › Move step, then click where it should go (Esc cancels); or Tidy | Alt+Arrow (16 px) · Alt+Shift+Arrow (64 px); or `M`¹ then arrows, Enter |
| Connect an answer | Canvas | Click the socket, then click the target step (click-connect; the verifier confirmed it works today); or the **Go to [step]** select | Enter / `C`¹ on the socket → Connect to… |
| Change or remove a connection | Canvas | Go to [step] select; Connect to… › Disconnect | Delete on the socket |
| Pan the canvas | Canvas | Click the minimap to jump; Fit; Find; "Go to step" in the Problems bar and Outline | Focus follows steps and pans them into view |
| Pinch or wheel zoom | Canvas | Zoom in, Zoom out and Fit buttons | the same buttons (one toolbar, arrows) |
| Box select | Canvas | Shift+click adds a step; frame menu › Select all in frame | Shift+Space toggles the focused step; Ctrl/⌘+A |
| Reorder answers, cases, columns | Inspector, Columns menu | Row menu › Move up / Move down | Alt+↑/↓ |
| Reorder steps in a chain | Outline | Row menu › Move up / Move down | Alt+↑/↓ |
| Resize the inspector, Test panel, Outline | Designer | Panel `⋯` › Width: Standard (320) · Wide (480); Test panel › Height: Compact · Half | The splitter is `role="separator"` with `aria-valuenow`, arrows 16 px, Home/End |
| Seek in a recording | Player | Click the track; Back and Forward 5 s | Slider keys |
| Drop files | Knowledge, Import leads | **Choose files** button (always present) | Enter on Choose files |
| Swipe a toast away | Toasts | Dismiss button | Esc after F8 |
| Drag a bottom sheet down | Phone sheets | Close button, scrim tap | Esc |

### 16.2 Gestures and cancellation

- **Multipoint and path gestures (2.5.1):** pinch-zoom and two-finger pan on the canvas always have the buttons above; nothing needs a path gesture. No long-press anywhere (L §8.2).
- **Pointer cancellation (2.5.2):** activation happens on pointer up (native buttons). A connect drag released anywhere but a valid target creates nothing. A step dragged by mistake is one Undo step. Calls never start on pointer down: they need the gate.
- **No press-and-hold controls:** the microphone in Talk in browser and take-over is a toggle (`M`¹, `aria-pressed`), never push-to-talk.

---

## 17. Language of parts (3.1.1, 3.1.2)

| Content | Markup | Notes |
|---|---|---|
| The page | `<html lang="en-IN">` | v1 chrome is English (D §4.5). Indian English makes supporting voices read ₹, lakh and crore correctly |
| Transcript turns | `<li lang="hi">`, `lang="hi-Latn"` (Hinglish), `ta`, `te`, `bn`, `mr`… per turn | When per-turn language does not exist, turns carry no `lang` (they inherit) and the feed header lists the call's languages once (P1: never guess) |
| Hindi reading text | `read-15-deva` (15/26) switches on `lang="hi"`, `mr`, `ne` | Matras never collide (F §2.6) |
| Prompts and "Agent asks" text | `lang` from the step's language setting ("Auto · Hindi + English" leaves it unset) | FD §10 |
| Answer examples | Each example carries its own `lang`: "haan, zaroor" `hi-Latn` · "हाँ" `hi` | The bilingual signature of the builder |
| Language marks | The glyph `<span lang="ta">த</span>` is `aria-hidden` when the name is visible; alone (turn rows) it has `aria-label="Tamil"` | The name carries the meaning (D §4.5) |
| Language pickers | Each option shows the native name with its `lang` and the English name: "हिन्दी · Hindi" | Screen readers switch voice for the native name |
| Assistant replies, knowledge passages | `lang` from the detected language when known | — |
| Announcements of final turns | `announce(text, { lang })` wraps the text in `<span lang>` | Tested with Hindi voices (MN-05) |
| Names of leads, places, agents, brands, flows | `translate="no"`, no `lang` change | Proper names are exempt from 3.1.2; `translate="no"` stops browser translation from mangling them (digest A9) |

`hi-Latn` is the correct BCP 47 tag for romanised Hindi. Screen readers pick a voice from the primary subtag (`hi`); MN-05 records which voice reads Hinglish better on NVDA, VoiceOver and TalkBack, and the Accessibility statement documents it. All supported scripts are left-to-right; if Urdu is ever added, turns carry `dir="rtl"`.

---

## 18. Resize, reflow, spacing, hover content and orientation

- **Text resize (1.4.4).** Sizes are rem and the root stays at the browser default. `base.css` keeps `html { font-size: 100% }` and sets `font` on `body` (fixed 2026-09-27; setting `font` on `html` made the root 14 px and rendered every token at 87.5 %, N §0.6, C §1.10). CT-03 asserts `html` is 16 px and `meta-12` computes to 12 px, in CI (foundations §15.5).
- **Reflow (1.4.10).** Zoom maps to width classes (R §2.6): 200 % of 1440 × 900 gets the phone shell, 400 % of 1280 gets 320 px. At 320 px no page scrolls sideways and nothing overlaps. Two-dimensional content is exempt and has a one-dimensional alternative: the flow canvas (the Outline), data tables (pinned key column with horizontal scroll at 768–1023, list rows below 768), charts (View as table). The designer switches to Review mode at 768–1023 and to the Outline below 768, so Publish is never clipped (F-RWD-003).
- **Text spacing (1.4.12).** Text containers use `min-height`, never `height`, and never clip overflow: tags, chips, bottom-bar labels, the Baseline, step titles and answer rows. Truncated text (ellipsis) is always available in full through the accessible name and a tooltip. VR-05 injects the WCAG spacing values on every route.
- **Content on hover or focus (1.4.13).** Tooltips appear on hover and focus, can be hovered, stay until the pointer or focus leaves, and close with Esc without moving focus (O §6.3). Row actions that fade in on hover also appear on focus and `:focus-within`; on touch `⋯` is always visible. Nothing essential exists only in a tooltip on touch.
- **Orientation (1.3.4).** No orientation lock. The phone Cockpit, Leads, the Outline and the Top-up sheet work in landscape at 844 × 390.

---

## 19. Area specs (1 of 2): the app shell and the Flow Designer

Each area follows the page-spec template from an accessibility point of view. Visual layout and copy are owned by the page specs; what is fixed here is structure, order, names, keys, announcements and tests. The mock (`06-accessibility.html` §1 and §3) renders both areas.

### 19.A App shell and navigation

**Job.** Get anywhere in two keystrokes, always know where you are, and hear only real changes. Owners: N §1, S §3–§10.

**Findings addressed.** F-A11Y-012 (skip link; two stops per nav item), F-A11Y-013 (one title for every route), F-A11Y-015 (wallet `role=alert` on every page), F-A11Y-017 (no `aria-current`, unlabelled navs, `title` tooltips), F-A11Y-023 (phone targets), F-A11Y-026 (landmarks), F-RWD-001 (6 of 12 sections on phones and at 200 %).

**Hierarchy for assistive tech.** 1st: the `<title>` and the skip link. 2nd: the H1 (focused on every route change). 3rd: the Main navigation with the current item marked. Last: the Baseline region and notifications.

**Layout, landmarks and Tab order** (numbers are Tab stops from a fresh load; `[ ]` = one stop):

```
Desktop ≥ 1440 (Leads as the example page)
┌ [1] Skip to main content  (visible only on focus, top-left, --z-skiplink) ─────────────────────────┐
├ nav "Main" 232 ─────────┬ main#main ───────────────────────────────────────────────────────────────┤
│ [2] Workspace ⇕         │ h1 Leads (tabindex -1)   1,284 leads · synced 11:24 am                   │
│ [3] Search or jump…     │                              [9] Export  [10] Import…  [11] New lead     │
│ Operate                 │ [12] Views tablist (1 stop, ← → move, Enter selects)                     │
│ [4] Cockpit · 2 live    │ [13] Search  [14] Filter  [15] Columns  [16] Density (radiogroup)        │
│ [5] Assistant  … one    │ [17] grid: 1 stop → active row → its controls → [18] BulkBar → [19] pager│
│     stop per item       │                                                                          │
│ [6] Finish setup 3 of 5 │                                                                          │
│ [7] Anika R. ⇕ (menu)   │                                                                          │
├─────────────────────────┴ region "Workspace status" (Baseline 28): [20] Live flow [21] Number     ┤
│                           [22] Wallet [23] Calls in progress [24] Shortcuts [25] Search            │
└ region "Notifications" (toasts, F8)  ·  status + alert (announcer, visually hidden) ─────────────────┘

Laptop 1024–1279                         Tablet 768–1023                    Phone 320–767
┌[1]Skip┬─────────────────────┐          ┌[1]Skip─────────────────────┐     ┌[1]Skip───────────────┐
│nav 56 │ main                 │          │[2]☰ h1 Leads [3]₹ [4]⌕    │     │ h1 Leads [2]₹ [3]⌕  │
│[2] ▣  │ h1 Leads             │          ├ main ──────────────────────┤     ├ main ────────────────┤
│[3] ⌕  │ …                    │          │ single pane                │     │ list rows (li + link)│
│[4] ⌁ ─┼▶ tooltip on focus:   │          │                            │     │                      │
│  …    │  "Cockpit · 2 live"  │          │ ☰ opens NavSheet (dialog,  │     ├ nav "Main" 56 + safe ┤
│[n] ⟦⟧ │ expand: aria-expanded│          │ focus → current item, Esc) │     │[n]Cockpit Leads Call │
└───────┴ Baseline ────────────┘          └────────────────────────────┘     │ reports Flows More ▲ │
                                                                             └ More: dialog, 12/12 ─┘
```

**Components.** SkipLink (§6.4), Sidebar · Rail · TopBar · NavSheet · BottomBar · MoreSheet (N §1), PageHeader (N §2), Baseline (S §5), Toaster (O §9), LiveRegion + `announce()` (§12), CommandPalette (O §8), the `?` Dialog `lg` (S §10), ShortcutProvider (§8.4).

**States** (what the user perceives, and what assistive tech gets):

| State | Visible | Assistive tech |
|---|---|---|
| Loading a route | Shell stays; RouteProgress after 200 ms; skeletons in `main` | `main aria-busy="true"`; when content lands, focus moves to the H1 |
| First use (setup incomplete) | Setup card "Finish setup · 3 of 5 · Next: add money" | One link with that full name; Home listed first in Operate |
| Error (route) | PageError inside the shell | Focus to the H1; `<title>` "Couldn't load · Call reports · Vaani Labs" |
| Offline | ConnectionBar "You're offline. Showing data from 11:42 am." | `role=status`, announced once; network actions `aria-disabled` with "You're offline" |
| No permission | Forbidden page naming who can help | Focus to the H1 "Only organization admins can review proposals." |
| Not found | NotFound inside the shell | `<title>` "Page not found · Vaani Labs"; focus to the H1 |
| Session expired | SessionExpired dialog | Focus on "Sign in"; page state and flow edits kept on the device |
| Wallet low or empty | Baseline segment turns amber; WalletNotice only on spending pages | `role=status`; one polite announcement per crossing; never `role=alert` |

**Microcopy (before → after).** "Exit" (a primary tab) → "Sign out…" (account menu, confirmed) · "SYS: ONLINE · 22ms" → removed · rail `title="Leads"` → portalled tooltip "Leads" on hover and focus · "Vaani Labs - The Voice AI that speaks India" on every route → "Leads · Vaani Labs" · "Wallet empty — top up now to keep calls flowing." → "Wallet is ₹0. Phone calls are paused." (Top up) · "Collapse [" → tooltip "Collapse sidebar" + keycap `[`.

**Responsive.** One `nav aria-label="Main"` exists at any width (the others are `display: none`). At 200 % zoom of 1440 × 900 (720 × 450) the phone shell applies and all 12 destinations stay reachable in two taps.

**Telemetry (optional, privacy-safe).** `skip_link_used`, `f6_region_cycled`, `palette_opened { via: 'key' | 'button' }`, `single_key_shortcuts_toggled { on }`, `motion_setting_changed { value }`, and an environment ping with media-query flags only (`prefers-reduced-motion`, `forced-colors`, `prefers-contrast`, width class). **Never try to detect a screen reader**, and never log titles (they can contain lead names).

**Acceptance criteria**
- [ ] The first Tab on a fresh load focuses "Skip to main content"; Enter focuses `main`; the next Tab reaches the first page-header control (KB-01).
- [ ] Every nav item is one tab stop; the nav has no focusable element without a name (AX-01, KB-01).
- [ ] Exactly one `nav[aria-label="Main"]` and one `main` in the accessibility tree at 1440, 1280, 1024, 768, 390 and 320 (AX-01).
- [ ] The current destination has `aria-current="page"` in the sidebar, rail, NavSheet, bottom bar and More sheet, including Settings sub-routes (AX-01).
- [ ] A client route change updates `<title>` per S §4.4 and moves focus to the H1 (KB-02).
- [ ] Rail tooltips appear on keyboard focus without delay and never clip (KB-01, VR-01).
- [ ] No `role="alert"` exists at page load on any route (LR-02).
- [ ] Turning single-key shortcuts off makes `[` and `?` inert and removes their keycaps (KB-11).
- [ ] At 390 × 844 with touch emulation, every shell target is ≥ 44 × 44 (TS-01).
- [ ] At 1024 × 690 with touch emulation (a landscape tablet), the nav is not in short mode: every rail item and every item of the expanded sidebar is ≥ 44 × 44, and all 12 destinations are reachable by scrolling the nav list (TS-01).

### 19.B Flow Designer

**Job.** Build, fix, test and publish a call flow without a pointer, and understand it without sight. Owners: FD1, FD §16, §20, §21.

**Findings addressed.** F-A11Y-001 (no keyboard edit or connect), F-A11Y-007 (focus and selection invisible), F-A11Y-011 (toolbar menus), F-A11Y-019 (node text contrast), F-A11Y-027 (shortcuts dialog and editor focus), F-A11Y-028 (creation-order tab order, id names, unnamed minimap), F-FLOW-001 and F-UX-024 (3.3.4), F-FLOW-008, F-FLOW-011, F-FLOW-020, F-FLOW-024, F-RWD-003.

**Hierarchy for assistive tech.** 1st: the flow name (H1) with its state ("Draft, 3 unpublished changes · Live, version 7"). 2nd: the issues chip and Publish. 3rd: the canvas (entered at the first Trigger) or, equivalently, the Outline. 4th: the inspector for the step in focus. 5th: the Problems bar.

```
Desktop ≥ 1440 (focus mode: rail nav, no Baseline)            F6 cycles: header → canvas → inspector → Problems
┌[1] Skip to canvas  [2] Skip to Outline ─────────────────────────────────────────────────────────────┐
│nav│ header: [3] Flows / h1 Site-visit qualifier ▾ [4] Draft · 3 changes ▾  Saved 11:24 am  Live v7   │
│56 │         [5] Undo [6] Redo [7] Tidy · · · [8] 1 warning [9] Test [10] Publish v8… [11] ⋯          │
│   │ phase ruler: [12] Trigger 2 → Logic 1 → Action 2 → Outcome 4 (toolbar of toggles) · [13] Compare │
│   ├ toolbar ┬ section "Canvas" (h2 hidden) ─────────────────────┬ aside "Ask about a site visit" ──┤
│   │[14] 1   │ [15] ONE tab stop, roving in call order:          │ [16] tablist Configure · Test data│
│   │ stop,   │  Trigger #1 → Logic #9 ▣ (focus + selected)        │ Label [17] · Agent asks [18]      │
│   │ ↑ ↓     │     ↓ sockets: Yes ◉ · Later · No · No reply ┄     │ Answers: Yes → Go to [19] ▾ …     │
│   │         │  → Action#3 → Outcome#4 …   minimap aria-hidden    │                                  │
│   ├─────────┴ region "Problems": [20] ⚠ 1 warning · Go to step · [21] Outline · [22] Test panel ──────┤

Laptop 1024–1279: same order; the inspector overlays the canvas from the right and pans the focused step into view.
Tablet 768–1023 (Review mode)                   Phone < 768 (Outline is the page)
┌ TopBar: ☰ · h1 · ₹ chip · Search ─────────┐   ┌ ‹ Flows · h1 Site-visit q… · ₹ ┐
├ header: Draft ▾ · Live · ⚠1 · Test · Publish · ⋯┤ │ Draft · 3 ▾ · Live v7 · ⚠1 [⋯]│
├ Notice: "Editing steps needs a screen at least  ┤ │ tree "Flow outline" (readOnly)│
│ 1024 px wide. You can review, test and publish."│ │  ◇ Ask about a site visit ⚠1  │
├ tree "Flow outline" 320 ┬ canvas (read) ──┤   │    ▾ Yes → □ Book site visit  │
│ ◖ Inbound call (readOnly)│ steps focusable │   │ [Test]  [Publish v8…] 44 px   │
│ ◇ Ask about a site visit│ Enter opens a   │   │ BottomBar (nav "Main")        │
│   ▾ Yes → □ Book visit  │ read-only sheet │   └───────────────────────────────┘
└─────────────────────────┴─────────────────┘
```

**Components.** Flow header, phase ruler, tool rail, canvas steps (Trigger, Logic with AnswerRows, Action, Outcome) and sockets (FD1); Outline (`tree`), Connect to… (Combobox), Go to [step] (Select), inspector (`aside` + PanelTabs + Field), Problems bar, Publish gate (Sheet 640), SaveState, VersionChip, `?` Dialog `lg`, Toast (Undo, publish), ShortcutProvider scopes `canvas` and `outline`.

**States**

| State | Visible | Assistive tech |
|---|---|---|
| Loading | Canvas skeleton; editing and autosave off until hydrated | `aria-busy="true"` on the canvas section; focus stays on the H1 |
| First use (blank flow) | FD1 §13.2: the Trigger connected to the Outcome, a "+" on the connection and the card "What happens when the call connects?" with Add Speak · Add Question; issues chip "No issues" | The card is in the roving order right after the Trigger; its buttons are ordinary buttons; nothing is announced as an error |
| Partial (a check can't run) | "Couldn't check Google Calendar · Retry" | Problems panel marks the rule "not checked"; Publish check row blocking with Retry |
| Save failed | Chip "Couldn't save · Retry" (red, persistent); title prefix "Couldn't save" | One assertive announcement per failure streak |
| Offline | ConnectionBar; chip "Offline · 3 edits on this device" | Announced once; Publish `aria-disabled` "You're offline" |
| Interim I1 (before revisions) | Chips "Draft on this device · 3 changes", "Saved on this device 11:24 am"; "Not saved · this tab only" when storage is blocked | The `volatile` chip is announced assertively once; the H1 state reads "Draft on this device, 3 unpublished changes" |
| View only | `View only` tag; Publish hidden; "Duplicate to edit" | Inspector fields `readonly` (focusable, copyable); step names end in "view only" |
| Success (publish) | Toast "v8 is live on 1 number and 1 batch · Roll back to v7…" (kind `publish`, 6 s; Roll back stays in the version menu, O §9) | Polite; focus returns to the Publish button, now `aria-disabled` "Nothing to publish. Your draft matches Live v8." The button is never hidden after a publish at any width (header, or the phone sticky bar), so focus never falls to `<body>` (§7.3) |

**Keys.** §9.6–§9.8. **Microcopy (before → after):** `?` sheet "Double-click to edit" → "Enter or double-click to edit" · "Edge from node_1785140237056 to node_178…" → "Ask about a site visit, answer Yes, to Book site visit" · "Green handle = VERIFIED, red handle = FAILED" → outputs "Verified · Failed · No reply", each with Go to · "YES — connects from bottom handle" → "Answer Yes · Go to [step ▾]" · palette "Add Speak node to canvas" (unconnected) → "Add Speak after Greeting" (inserted, connected, focused) · "KEYBOARD SHORTCUTS" → "Keyboard shortcuts".

**Responsive.** What each width can do is the one capability matrix, R §10.6. Editing needs ≥ 1024 CSS px. At 768–1023 (Review mode, including 200 % zoom on a 1920 screen) and below 768 (the phone Outline, including 200 % zoom on 1440 or 1280 screens), the Outline tree and the step sheet are `readOnly`: arrows, type-ahead and Enter work, editing keys (F2, A, C, Delete, Alt+↑/↓) are not bound and their menu items are not rendered, and the Notice or the sheet footer names the limit (FD §16.1, §21). Coarse pointers at ≥ 1024 get 44 px answer and result rows, so each socket's target is the 44 × 44 end of its row at 100 % zoom. Zoomed out, the same connections are made through Connect to…, Go to and the Outline (§15.1 rule 2). **Touch mode switch** (coarse pointers at ≥ 1024 only, R §10.9): a SegmentedControl, `role="radiogroup"` named "Touch mode", with radios "Navigate" (default, restored on every open) and "Arrange"; arrows move between them (§9.2); a change announces politely once ("Arrange. Drag steps to move them." / "Navigate. Drag to pan."). The switch only changes what a one-finger drag does: every keyboard path (§9.6–§9.8) works in both states, and Arrange adds no path that lacks a non-drag equivalent (Go to, Connect to…, `M` Move mode, Alt+Arrow).

**Telemetry (optional).** `flow_edit { via: 'canvas_pointer' | 'canvas_key' | 'outline' | 'inspector_goto' }`, `connect_to_opened { via }`, `outline_opened { width_class }`, `move_mode_used`. Counts only; no step text.

**Acceptance criteria**
- [ ] Keyboard only: create a flow, add Speak and Question steps, connect every answer, name them, test in text, publish through the gate and roll back, with no pointer event fired (KB-07).
- [ ] Tab enters the canvas at the first Trigger; one Shift+Tab leaves it; tab order equals graph order on the 26- and 35-step reference flows (KB-08).
- [ ] Focused, selected and focused+selected steps are distinguishable in both themes and in forced colours (VR-01, VR-02).
- [ ] No accessible name on the canvas or in the Outline contains an internal id (SR-04, automated name scan).
- [ ] Enter opens the inspector with focus on Label; Esc returns focus to the same step (KB-07).
- [ ] The `?` dialog opens with focus inside, is not clipped at 1440 × 900 or 1280 × 720, and returns focus to its opener (KB-11).
- [ ] At 100 % zoom, sockets have a ≥ 24 × 24 hit area on a fine pointer. Under touch emulation their rows are 44 tall and the hit area is ≥ 44 × 44, and adjacent rows' hit areas never overlap. At lower zooms every socket's job is reachable through Connect to…, Go to and the Outline (TS-01).
- [ ] No canvas text renders below 12 px at any zoom level (CT-03).
- [ ] With reduced motion, the test trace is skipped and reached steps are marked (VR-03).

---

## 20. Area specs (2 of 2): tables, live calls, overlays, forms and the public site

### 20.C Data tables and record sheets (Leads, Call reports, Flows list, Knowledge, Invoices)

**Job.** Scan many records, open one, act on a selection, and never dial by accident. Owners: N §7, L §8–§10, CR §2.8–2.10.
**Findings addressed.** F-A11Y-002, F-A11Y-004, F-A11Y-010, F-A11Y-014 (counts), F-A11Y-018, F-A11Y-019, F-A11Y-023, F-A11Y-024.
**Hierarchy for assistive tech.** H1 with the pipeline count → view tabs → search and filters → the table caption (what and how sorted) → the rows → the open record sheet.

```
Desktop ≥ 1440 (Call reports; the detail sheet docks at 560)
┌ main ────────────────────────────────────────────┬ dialog, non-modal: "Call on 21 Sep, 10:42 am" ─┐
│ h1 Call reports   121 calls · 3 need review       │ h2 (focus on open)       [Close call details]  │
│ tablist "Views" · search (role=search) · Filter   │ group "Recording": ▶  ↺ 5 s  ↻ 5 s  slider     │
│ table role=grid, caption "Calls, newest first"    │ h3 Summary · h3 Captured · h3 Topics           │
│  th When (aria-sort=descending, button) · Lead ·  │ h3 Transcript: ol, one tab stop, ↑ ↓ by turn   │
│  Phone · Direction · Duration · Outcome · … ·     │                                               │
│  th "Actions" (visually hidden)                   │ Esc → focus returns to the row's link          │
│  tr aria-current="true" ▌ (open) …                │ J / K¹ → next call, "Call 4 of 50" announced   │
│ pager: status "1–50 of 121 calls · tests hidden"  │                                               │
└───────────────────────────────────────────────────┴────────────────────────────────────────────────┘
Laptop 1024–1439: the sheet overlays the right third (non-modal; F6 switches). Tablet: full-height modal sheet.
Phone < 768: ul of list rows; each li has one stretched link ("Today 10:42 am, 2 minutes 31 seconds,
Interested, Lead 1042"); the sheet is a full-screen modal above the bottom bar; no per-row Call button.
```

**States (assistive-tech view).** Loading: real headers, `aria-busy="true"`, pager "Loading…". Refreshing: rows stay, "Updating…" in the pager status. Empty: "No calls yet" (`title-16`) + one sentence + one action, inside the table's single full-width cell. Filtered to nothing: announced "No calls match 'visit' and 2 filters" + Clear filters. First-load error: danger Notice `role="status"`, then `role="alert"` if a user Retry fails (§24). Stale data: warning Notice "Showing results from 11:24 am. Couldn't refresh." No permission: names the admin. Record deleted while open: "This lead was deleted." and focus to the list heading.
**Microcopy.** "0 / 0 SHOWN" → "38 of 1,284 leads" · "1 SELECTED" → "2 leads selected" · sort "▼" → a sort icon plus `aria-sort` and the caption · empty `th` → "Actions" (visually hidden) · "Condition Check" ×4 → "Condition check: Residential" · "Re-analyze" per row → `⋯` › "Re-analyse call".
**Acceptance.** KB-05 (Leads: keyboard open and return, `C` opens the gate and sends no call request, shortcuts off makes `c` inert) · KB-06 (Call reports: Tab to row 3, Enter, read the transcript, Esc, focus back on row 3) · every row control named with its record (AX-01, name scan) · the focused row is never under the sticky header or BulkBar (VR-04) · counts are announced once after typing settles (LR-01).

### 20.D Live call and transcript (Cockpit, Rep console, flow Test panel)

**Job.** Know the call's state and what was said the moment it changes, without being flooded. Owners: CK §4.3–4.5 and §5.8–5.10, N §12.
**Findings addressed.** F-A11Y-014, F-A11Y-022 (STANDBY ring, breathe), F-A11Y-008 ("Awaiting connection…" at 3.0:1), F-A11Y-003 and F-A11Y-030 (Customer Intel fields and "Save context"), F-RWD-002.
**Hierarchy for assistive tech.** The call state word → the call card heading → "Captured so far" → the transcript → the actions (Take over, Transfer…, End call).

```
Desktop ≥ 1440 (live)
main: h1 Cockpit
┌ section h2 "Calls" 240 ┬ section h2 "Call with Lead 1042" 400 ──────┬ section h2 "Transcript" ────┐
│ ul: Live now · Up next │ status wrapper (polite): "Live"   02:14      │ ol, one tab stop:           │
│ · Recent (links)       │   (timer role=timer: never announced)        │ li lang=hi-Latn  00:21 Vaani │
│                        │ ol stepper: Dialling · Ringing · Live · Wrap │ li lang=hi       00:34 Caller│
│                        │ Now in the flow: "Ask about a site visit"    │ [Jump to latest · 2 new]     │
│                        │ h3 Captured so far (dl)                      │                              │
│                        │ [Take over] [Transfer…]   8 px   [End call]  │                              │
└────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────┘
Laptop: the Calls column becomes a header switcher (a Select). Tablet: PanelTabs "Call" · "Transcript".
Phone: the card stacks above the transcript; Take over and End call sit in a sticky 44 px bar; the TopBar
call chip keeps the state visible but is silent (only one element announces each change).
```

**States.** Idle: the Ready to call card; "The transcript appears here when a call starts." as text; nothing moves. Dialling, Ringing, Live, On hold, Wrap-up, Ended, No answer, Busy, Voicemail, Failed: each a word, an icon and one polite announcement (debounced 500 ms). Placing failed (the user's action): InlineError `role="alert"` "Couldn't reach the phone line. The call was not placed and you were not charged." Transcript reconnecting: warning Notice `role="status"`. Blocked (wallet ₹0, no number, outside hours): Place call `aria-disabled` with the reason linked by `aria-describedby`. Offline: "You're offline" reason on every call action.
**Keys.** `M`¹ mute, `H`¹ hold (announced); ⌘/Ctrl+Enter answers an incoming transfer in the Rep console; **no key ends a call**, End call is a button reached with Tab and needs no confirmation (D §6.2). Transcript and player keys: §9.9–9.10.
**Microcopy.** "SESSION: IDLE", "STANDBY", "Awaiting connection…" → the Ready card and "Idle" · "CUSTOMER INTEL" → h2 "Lead" · "TRANSCRIPT FEED" → h2 "Transcript" · "CONNECT" → "Place call…" · "Test Call" → "Talk in browser".
**Acceptance.** A scripted 3-minute test call produces exactly one announcement per state change and at most one transcript announcement per 2 s, and none for timers or cost (LR-01 with a spy on both regions) · SR-02 (NVDA and VoiceOver hear Dialling, Call live, the final turns in the right voice, Call ended) · at 720 × 450 nothing overlaps and every action is reachable (VR-04) · with reduced motion the live dot is still and the word "Live" remains (VR-03).

### 20.E Overlays and the palette

**Job.** Open a focused task, finish or leave it, and land back where you were. Owners: O §1–§9.
**Findings addressed.** F-A11Y-005, F-A11Y-011, F-A11Y-015, F-A11Y-024 (unnamed close buttons), F-A11Y-027.

```
Dialog md "New lead" (desktop centred; phone full screen with sticky header and footer)
┌ h2 New lead ─────────────────────────────── [5] Close ┐   focus order: body → footer → close
│ [1] Name (data-autofocus)                              │   Tab and Shift+Tab trapped; background inert
│ [2] Phone number   hint "10-digit mobile, like …"     │   Esc on a dirty form → inline discard state:
│ … (optional) fields                                   │   "Discard this lead? What you typed will be
├ footer ────────────────── [3] Cancel  [4] Add lead ────┤   lost." [Keep editing] (focused) [Discard]
```

**Which overlays must pass KB-03** (open by keyboard, focus in, Tab cycles, Esc closes, focus returns to the trigger, never `<body>`): New lead, Import leads, New webhook, every ConfirmDialog, Keyboard shortcuts, Search or jump, Call gate, Publish gate, Top-up sheet, lead sheet, call detail sheet, NavSheet, More sheet, workspace and account menus, every `⋯` menu, Connect to…, Go to [step], SessionExpired, the marketing phone menu.
**States.** Submitting: primary shows "Adding…", `aria-busy`, activation ignored. Server error: InlineError `role="alert"` above the actions, values kept. Success: the dialog closes, focus returns to the trigger, a toast "Lead added · View" (polite). A modal open during background events queues toasts until it closes (O §1.6).
**Acceptance.** KB-03 for each overlay above; KB-04 for every menu; `landmark-unique`, `aria-dialog-name`, `button-name` pass with each open (AX-02); the persistent WalletNotice is `role="status"` (LR-02).

### 20.F Forms and authentication

**Job.** Enter and correct information once, sign in without a memory test. Owners: C §3, §8; PA §8–§9; ST §10.
**Findings addressed.** F-A11Y-003, F-A11Y-006 (toggle focus), F-A11Y-020, F-A11Y-025, F-A11Y-026 (login H1 and landmarks).

```
Sign in (bare mode; 400 px column on desktop, full width with 16 px margins on phone)
[1] Skip to main content
main
  img "Vaani Labs" (the V mark)
  h1 Sign in to Vaani Labs
  Notice role=status (only with ?reason=expired): "Your session expired. Sign in to continue."
  [2] Email      input type=email autocomplete=username
  [3] Password   input autocomplete=current-password   [4] Show password (aria-pressed, 26 visual, 32 hit)
      hint row: "Caps Lock is on" (role=status, only while true)
  [5] Forgot password?   (link, 24 px tall)
  InlineError role=alert (after a failed attempt)
  [6] Sign in (lg: 40 desktop, 44 touch)
  [7] Email me a link instead
  "New to Vaani Labs?" [8] Create account
```

**States.** Error: "That email and password don't match. Try again or email me a link." under the form, `role="alert"`, focus stays on Sign in. Rate limited: "Too many attempts. Try again in 30 s." (the countdown updates each second and is not announced). Offline: "Can't reach Vaani Labs. Check your connection." with Retry. Session expired: the Notice above, email prefilled.
**Acceptance.** Every auth field has a `<label for>` and the right `autocomplete` (AX-01, a DOM assertion per field) · paste works in every field (MN-01) · a password manager fills sign in and saves on sign-up (MN-01) · an empty submit focuses the first invalid field with its error read (KB-14) · the show-password toggle has a visible ring and `aria-pressed` (VR-01).

### 20.G Public site

**Job.** Understand the product, hear it work in English and Hindi, and start. Owner: PA §4–§7.
**Findings addressed.** F-A11Y-021, F-A11Y-026, F-A11Y-029, F-A11Y-009 (violet CTAs), F-RWD-018 (menu Esc).

```
[1] Skip to main content
header: V mark link "Vaani Labs home" · nav "Main" (links) · [Log in] · [Get started]   (solid --surface, no alpha)
   phone: [Menu] button aria-expanded → dialog sheet; Esc closes and returns focus to Menu
main: h1 (hero) · h2 per section · h3 per card (no skipped levels)
   "Hear it work": industry and scenario radiogroups, language radiogroup (English · हिन्दी lang=hi),
   Play button (aria-pressed), the sample transcript expands in the page (no nested scroll region)
footer: nav "Site links" · Contact (same place on every page: 3.2.6)
ConsentBar: region "Cookie choices"; not modal; page scroll-padding-bottom = its height while shown
```

**Acceptance.** One H1 and header/nav/main/footer on every public page; axe `heading-order`, `region`, `scrollable-region-focusable` pass (AX-01) · the header passes contrast at every scroll position in both themes (CT-02, VR-01) · no audio plays until the user presses Play, and Stop is always available (1.4.2) · the phone menu closes on Esc and keeps `aria-expanded` in sync (KB-03).

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
