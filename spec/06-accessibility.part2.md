
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
