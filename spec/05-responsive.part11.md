---

## 17. Testing: viewports, devices, automation

### 17.1 Viewport set (visual regression, both themes)

Sizes are **inner viewports** (Playwright's `viewport`), not screens (§2.1). A test named after a screen runs at that screen's reference inner size.

| Inner viewport | Stands for | Why |
|---|---|---|
| 1920×969 | 1920×1080 desktop | wide desktop; containers and docked sheets |
| 1440×900 | the mocks' reference | desktop default; visual-regression baseline |
| 1536×730, 1440×789 | 1920×1080 at 125 %; 13″ MacBook | short mode with the Baseline shown |
| **1366×657**, 1366×625, **1280×609** | 1366×768 (without and with a bookmarks bar); 1280×720 | the common Indian office laptops: short **and** compact mode, BaselineChip, chrome budget (F-UX-007, F-RWD-005) |
| 1024×768, 1024×690 | Laptop-S window; iPad landscape in Safari | Cockpit collision (F-RWD-002); coarse-pointer editing |
| 960×485 | 200% of 1920×1080 | tablet shell by height; Flow Designer Review mode |
| 834×1112, 820×1106, 768×950 | iPad portrait in Safari | Flow Designer Review mode (F-RWD-003) |
| 844×340 | landscape iPhone in Safari | landscape phone (F-RWD-005, F-RWD-011) |
| 720×450 | 200% of 1440×900 (as a viewport) | F-RWD-001, F-RWD-002 |
| 390×844, 390×750, 390×664, 360×780, 375×667 | phones: the mock size, then iPhone Safari with its toolbar collapsed and shown, Android Chrome, iPhone SE | phones |
| 320×640 | 400% of 1280 | smallest supported |

Run with always-visible scrollbars (Windows) and with touch emulation for the coarse-pointer rules. Snapshots: each page's default state, one sheet open, the keyboard state (emulated) on phones, and both themes.

### 17.2 Automated checks (CI, Playwright)

1. **No sideways page scroll:** for every route × viewport, `document.documentElement.scrollWidth <= innerWidth` and every element with `overflow-x: auto|scroll` is on the allow-list (tables at ≥768, ScrollRow, canvas).
2. **Every destination reachable:** from each route at 320, 390, 720×450, 844×390 and 1024×768, every `lib/nav.ts` entry is reachable through visible controls in ≤2 activations (F-RWD-001, F-RWD-005).
3. **Primary never clipped:** the element marked `data-primary` in each header is fully inside the viewport and not covered (`elementFromPoint` at its centre returns itself) (F-RWD-003, F-RWD-007).
4. **Target size:** every focusable element's box plus hit padding is ≥24×24; under touch emulation ≥44×44 (except inline text links inside sentences, which must be ≥24 tall) (F-A11Y-023).
5. **12 px floor:** no text node renders below 12 px (`getComputedStyle`), including the canvas at its zoom (F-VIS-002, F-FLOW-008).
6. **Focus not obscured:** tabbing through each page, the focused element's rect never intersects a sticky bar's rect.
7. **No removal without replacement:** for each data page, every P1 field in the desktop table appears as text in the phone ListRow or record sheet.
8. **Live resize:** load at 1440, resize to 900, 390, 1440; assert the shell and Flow Designer modes switched and the open sheet or selected step persisted.
9. **Safe-area smoke test:** with `env()` insets emulated (for example 44 top, 34 bottom), no fixed bar's interactive child sits inside an inset.

### 17.3 Lint rules

- Media queries only at 480, 768, 1024, 1280, 1440 (min-width) and their `.98` max-width pairs, plus the height queries 480, 600, 720, 800; any other px breakpoint fails (F-VIS-035).
- `hidden md:*`, `hidden lg:*`, `md:hidden` on an element with content requires a `data-replaced-by="…"` attribute naming its replacement (rule 2 of §0).
- `100vh` without a `dvh` companion fails; `user-scalable`, `maximum-scale` fail.
- Hover-only reveals (`group-hover:opacity-100` and similar) must be paired with `focus-within` and `@media (hover: none)` visibility.

### 17.4 Real-device sign-off (R12)

Before release, on at least: an iPhone (Safari, notch, home indicator), a mid-range Android phone (Chrome), an iPad in both orientations (Safari, with and without a keyboard), and a Windows touch laptop: canvas pan and pinch, Arrange mode, tap-to-connect, iOS focus zoom on every form, the keyboard with sticky bars (Cockpit, Assistant, Top up, Settings), safe areas in both orientations, wake lock during a Browser test, the microphone after backgrounding.

### 17.5 Master acceptance checklist (cross-page)

- [ ] All §17.2 checks pass for every route at every §17.1 viewport in both themes.
- [ ] 12 of 12 destinations reachable at 320×640, 844×390 and 720×450 (F-RWD-001).
- [ ] At the inner viewports 1366×657, 1366×625 and 1280×609 (1366×768 and 1280×720 laptops) every nav item is visible without scrolling, Leads shows ≥10 Standard rows (F-RWD-005), and the BaselineChip is in the PageHeader showing the top fact: an amber segment when one exists (for example "₹0 · calls paused"), else your call, else the wallet; its popover lists every Baseline segment (shell `00` §5.4).
- [ ] At 1536×730 and 1920×969 the Baseline band is shown, not the chip.
- [ ] No page shows a wallet banner at any width; a low wallet shows in the Baseline or the TopBar chip (F-RWD-013).
- [ ] Every data page at <768 shows ListRows with ≥8 rows at 360×780 and opens records full screen with a Back link (F-RWD-004, -010, -011, -016).
- [ ] No header, toolbar or bar pushes content sideways at 320–560 (F-RWD-006, -007, -008).
- [ ] The Flow Designer passes §10.13; the Cockpit passes §11.8.
- [ ] Keycap hints never render under `(pointer: coarse)` (F-UX-048).
- [ ] Every fixed bar pads its safe-area inset; every full-height element uses `dvh`.
- [ ] Rotating any page at any step of any task loses nothing.

---

## 18. Traceability: every F-RWD finding

| Finding | Severity | Resolved by | Verified by |
|---|---|---|---|
| F-RWD-001 phone and 200% nav reach 6 of 12; Exit as a tab | high | R4; §4.1; N §1.8; `00` §3.4 | §17.2 (2), §17.5 |
| F-RWD-002 Cockpit hides context below 1024/768; fixed stack overlaps at short heights | high | §11; `01` §2.4; §3.3 one scroller | §11.8 |
| F-RWD-003 Flow Builder clips ACTIVATE at 768–877; layout set at load | high | §10.2, §10.5, §5.9 fold order, §2.4 live resolver | §10.13, §17.2 (3), (8) |
| F-RWD-004 Call reports 255–337 px data strip; details inside it | high | §3.3, §5.4, §12.11; `04` §2.11 | §12.11, §17.5 |
| F-RWD-005 rail hides items at laptop heights; stray scrollbar | high | R2; §8.2; N §1.2 short mode | §17.5 |
| F-RWD-006 Meeting Agent wider than the screen below 513 | medium | §12.5; `07` §1.16; §3.3 `overflow-x: clip`, `min-width: 0` | §12.5 |
| F-RWD-007 Personal Agents primary off-screen | medium | §5.9; §12.6; `07` §2.16 | §12.6, §17.2 (3) |
| F-RWD-008 Analytics header pans the page below 543 | medium | §5.9; §12.12; `04` §3.10 | §12.12 |
| F-RWD-009 Call reports search 52 px; pills off-screen | medium | §5.3; §12.11 | §12.11 |
| F-RWD-010 18-column table at every width | medium | §5.2; N §7.5–7.6; `04` | §17.2 (7) |
| F-RWD-011 Leads loses Status and Interest; 2–3 rows | medium | §5.2; §12.10; `03` | §12.10 |
| F-RWD-012 Leads chip rows overflow; headers scroll away | medium | §5.3, §5.8; §12.10 | §12.10 |
| F-RWD-013 wallet banner 2–4 lines; Dismiss 7 px from autopay | medium | R10; §4.3 | §17.5 |
| F-RWD-014 canvas under half the screen; no re-fit; touch pan | medium | §10 (Review mode, re-fit rule, Navigate / Arrange at ≥ 1024) | §10.13 |
| F-RWD-015 Assistant 241–345 px conversation | medium | §12.3; §7.3; `02` §5 | §12.3 |
| F-RWD-016 Knowledge hides Embed and Delete at ≤880 | medium | §5.2; §12.9; `05` §1.16 | §12.9 |
| F-RWD-017 marketing nav overflows at 768–840 | medium | §12.16; `08` §4.1 | §12.16 |
| F-RWD-018 public-site phone polish (14 px inputs, demo, menu, length) | low | §5.6, §12.15, §12.16 | §12.15, §12.16 |
| F-RWD-019 onboarding sideways scroll; not findable | low | §12.17 (→ Home) | §12.1 |

**Related findings also resolved here:** F-UX-008 (R4), F-UX-048 (§6.2, §14), F-VIS-007 (§11), F-VIS-012 (§12.12), F-VIS-013 and F-VIS-014 (§6.2), F-VIS-033 (§4.1: overlay, never push), F-VIS-035 (R1, §17.3), F-FLOW-022, F-FLOW-034 (§10.3), F-A11Y-005 (§5.4), F-A11Y-023 (§6.1), RESPONSIVE-B-13, -18, -19, -20 (§12.14, §3.4, §5.6, §4.2).

---

## 19. New components needed

Components below are not in the three component specs. Where a Flow Designer page spec later defines one first, that definition wins and this row becomes a reference.

| Component | What it is | Built from | Used by |
|---|---|---|---|
| `useViewport()` + `lib/viewport.ts` | The resolver of §2.4: width, height and pointer classes, `shellMode`, `flowMode`, `keyboardOpen` | `matchMedia` listeners, `visualViewport` | AppShell, Flow Designer, sheets, sticky bars |
| `ScrollRow` | The sanctioned horizontal scroller (§5.8): snap, edge fade, end arrows on fine pointers, keeps the selected item in view | CSS + IntersectionObserver | ViewTabs, RouteTabs, phone FilterBar, KPI strip, suggestion chips, phase ruler on phones |
| `StickyActionBar` | Bottom bar for 1–2 actions + `⋯` above the BottomBar and the keyboard, safe-area aware (C §2 names the pattern; this makes it one component) | Button, Menu | Cockpit, forms, Top up, Settings, Call gate sheet, Flow phone step sheet |
| `ResponsiveOverlay` | One wrapper that renders a Sheet as docked, overlay, modal full height or full screen per O §1.7, keeping focus and scroll when the mode changes | Radix Dialog + layout slot | Record and detail sheets, inspector, gates |
| `FoldGroup` | The header and toolbar fold order of §5.9 measured with a ResizeObserver; moves items into `⋯` in priority order | Menu | PageHeader actions, FlowHeader, FilterBar right group |
| Flow Designer components | `FlowHeader`, `PhaseRuler`, `LiveNote`, `CanvasControls` (+ `TouchModeSwitch`), `FlowCanvas` (`readOnly` below 1024), `FlowOutline` > `OutlineRow`, `StepInspector` (`presentation`), `ProblemsPanel` (`placement`), `StepPalette` | Named and owned in the **FD1 §20.1 registry**; §10.7 lists only their per-mode configuration. Retired here: `CanvasToolbar`, `OutlineItem`, `BranchRow`, `FlowMap`, `AddStepSheet` | Flow Designer |
| `WakeLock` hook | Request, release and re-request the screen wake lock around own calls | Wake Lock API | Cockpit, Rep console, Meetings room |

Tokens (registered in 01-foundations §18, in `tokens.json` 1.1.0): `--size-scrollrow-fade` 24 px (edge fade length), `--timing-refit-debounce` 150 ms. The Outline widths are the tokens `--size-left-panel` 280 and `--size-left-panel-tablet` 320 (FD1 §20.2); `--size-outline` and `--size-sheet-step` are withdrawn (the Review step sheet is Sheet `detail`).

## 20. Reconciliations with other specs

| Spec and section | Says today | Change made here | Why |
|---|---|---|---|
| D §6.5 Responsive, row 768–1023 | Review mode; editing asks for ≥ 1024 | **Adopted** (§10.2); an earlier draft of this spec proposed tablet editing and is withdrawn | R5 |
| D §8 "Minimum editing width: 1024 px" | Editing floor | Adopted; coarse pointers at ≥ 1024 edit with touch sizes and Navigate / Arrange | R5 |
| D §6.5 row < 768 | Outline, versions, text test, Publish | Adopted as FD1 §3.2's phone design; Roll back added from `⋯` | R6 |
| O §1.7 and §4.6, Inspector row | "Read-only sheet (Review mode)" at 768–1023; "read-only full screen" on phones | Adopted | R5, R6 |
| FD1 §3.1 and §16.1 (old), this spec §10.11 (old) | `role="application"` on the canvas | Removed everywhere; 06 §6.1 | 06 R15 |
| O §18, this spec §10.3 (old) | A compact or floating full-screen bar | No full-screen mode at any width (FD1 X7) | FD2 R19 |
| `00` §3.2 focus mode | Rail forced ≥1024 | Adds: in Review mode the shell TopBar stays and the 48 px Flow header sits under it (FD1 §3.2); phone keeps the TopBar with a Back link and the BottomBar | §4.1 |
| FD1 §3.2, §3.3, §3.4 | Tablet Notice worded two ways; phone chip row in a different order from the header; tablet Problems as a bar plus a bottom sheet; clean-draft reason "The draft matches Live v12" | One Notice string (§14); chip row Draft · Live · issues; Problems as a tab beside the Outline (FD2 §12.4); reason "Nothing to publish. Your draft matches Live v7." (FD2 §4.3). **Done** in FD1 | §10.5, §10.8 |
| FD2 L12, §16.1, §20, §21.3 | "The Outline is a full editor" with no width limit; 200 % of 1280 said to give Review mode; the tablet wireframe put Test and Publish in the TopBar and the Notice at the bottom | The Outline edits at ≥ 1024 and is `readOnly` below; 200 % of 1280 is 640 px, phone mode; the tablet wireframe follows FD1 §3.2. **Done** in FD2 | §10.2, §10.6 |
| 06 §19.B, 07 §10.12 width table, D §6.5 row < 768 and §8 | 06: "200 % zoom on 1280 enters Review mode", no rules for the touch-mode switch; 07: phones open "Go to [step ▾]" (an edit) and cite R §10.11 for Navigate / Arrange; D: phones get "a text test" and no pointer to one capability list | 06: zoom maps as §8.3, the read-only Outline and sheet list which keys exist below 1024, and the Navigate / Arrange `radiogroup` gets its name, announcement and keyboard parity; 07: the phone row is read-only (answers read "Goes to #4 …"), reference R §10.9; D: text and browser-voice test, the sticky bar above the BottomBar, and §10.6 named as the one capability matrix. **Done** in 06, 07 and D | §10.6, §10.9 |
| This spec §10.8 (old) | A clean draft hid Publish ("the sticky bar shows Test only"); the publish toast "stays until dismissed" | Publish stays `aria-disabled` with its reason at every width, so focus after publishing has a target (06 §7.3); the toast is O §9's `publish` kind, 6 s | §10.8 |
| D §6.1, `00` §3.5, `03` §5.0, F §5 (old) | Chrome budgets subtracted chrome from the screen height (1366×768 → 524 px of rows) | Budgets use inner viewports (1366×657, 1280×609); on those laptops the Baseline is always the BaselineChip. **Done** in D, `00`, `03` and F | §2.1, §3.4 |
| Digest R4 | Below 1024 read-only viewer | Superseded by §10 | R5 |
| F `base.css` | `html { scrollbar-gutter: stable }` | In the app shell the document never scrolls (regions do), so the rule reserves an empty 15 px strip on Windows at every width (seen while rendering both mocks). Put `scrollbar-gutter: stable` on the scrolling regions (`main`, sheet bodies, the sidebar scroll region) and keep it on `html` only for bare and public pages | F-VIS-034 intent kept |
| N §1.8 BottomBar | "Labels never wrap or truncate" | Make it explicit in code: `white-space: nowrap` on bar items (without it "Call reports" wraps to two lines at 320 once a scrollbar or larger text narrows the slot, seen in the mock) | §17.1 320 test |

## 21. Open questions for the product owner

1. **Tablet editing in v1.1.** v1 ships Review mode at 768–1023 (R5, D §6.5). If `review_edit_attempt` shows demand, is a dedicated tablet editor (full-width canvas, step sheet, Navigate / Arrange) worth a v1.1 layout?
2. **Phone quick fixes (v1.1).** Phones are read-only in v1 (R6). If incidents show a need, should v1.1 allow editing the wording of existing steps and re-pointing answers from the read-only sheet?
3. **Publishing from a phone.** Allowed for everyone who can publish, or only admins? (Proposed: same permission at every size; the gate is identical.)
4. **Web push.** Should supervisors get push notifications for live calls or failed publishes on phones? Not in v1; the TopBar chip and `<title>` carry state.
5. **Installable app (PWA).** Adding a manifest would let operators pin Vaani to a phone's home screen and would remove browser chrome (more room for the Cockpit). Proposed for v1.1 after the real-device sign-off.
6. **Landscape-phone Cockpit.** Confirm the side-by-side live layout (§11.4) with operators; the alternative is the portrait stack in landscape.
