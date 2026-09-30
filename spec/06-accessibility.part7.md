
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
