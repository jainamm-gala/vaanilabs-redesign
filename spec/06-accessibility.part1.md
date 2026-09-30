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
