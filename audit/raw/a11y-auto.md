# Vaani Labs (vaanilabs.in): automated accessibility and contrast audit

Auditor: Accessibility Auditor A (automated and contrast), agent `va-a11y-auto`
Date: 2026-09-26. Live production site https://vaanilabs.in, signed in as the real customer account. Signed-out pages were checked in an isolated, cookie-less browser context.
Browser status: OK for the whole run (no LOGGED_OUT). My tab and the isolated context were closed at the end.
Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-a11y-auto/`
Privacy: lead and customer names, phone numbers and emails are left out on purpose. Rows are referred to generically.

---

## 1. Method

| Step | What was done |
|---|---|
| Automated rules | Loaded axe-core 4.10.2 into my tab through CDP `evaluate`, which leaves the page CSP untouched. Ran it on 11 authenticated pages plus `/login` and `/` while signed out. I captured `violations` and the counts of `incomplete` (needs review). |
| Custom scanner | An in-page script covered every visible text node (up to 2,500 per page). It resolved the effective foreground colour, including alpha and ancestor opacity, and composited the background chain. Colours were converted from oklch/oklab to sRGB through a canvas. It then computed the WCAG 2.x contrast ratio and grouped results by style (colour, bg, size, weight, family, transform, tracking). The script also listed accessible names of interactive elements, controls without programmatic labels, target sizes, heading outline, landmarks, duplicate ids, `lang`, `<title>`, live regions, `prefers-reduced-motion` CSS rules and running animations (`document.getAnimations()`), and clickable elements without a role. |
| Keyboard | Tab-order walk on `/leads` (22 stops) and `/login` (9 stops) with the computed focus style at each stop. Element screenshots of focused and unfocused states on `/dashboard` and `/leads`. I tried the Leads `j` shortcut. I never pressed `c`, which is the call shortcut. |
| Motion | Re-ran `/` and `/analytics` with `emulateMedia({ reducedMotion: 'reduce' })` and counted the infinite animations still running. |
| Theme | Toggled dark mode in my sandboxed tab. `document.cookie` did not change, so the toggle writes only to localStorage. Re-ran the contrast checks on `/dashboard`. |
| Reflow | Tested at 320x800 (`/dashboard`, `/call-reports`) and 390x844 (`/leads`) for page-level horizontal scroll and landmarks. |
| Network | Every non-GET request was blocked by the harness guard. Unprompted write attempts were logged. |

Limitations:
- Default viewport was 1440x900.
- Surfaces with background images or gradients (flagged `bgImg`) were composited on their background colour only.
- No screen-reader pass. Voice/call live states (CONNECT, Test Call) were not exercised because they are prohibited.
- `/rep-console` was not audited, because it registers a live softphone.

---

## 2. Cross-page results at a glance

### 2.1 axe-core violations per page

| Page | axe violations (rule: nodes) | axe `incomplete` |
|---|---|---|
| /dashboard | color-contrast 11 (serious); label-title-only 1 (flow `<select>`) | color-contrast 26 |
| /assistant | color-contrast 5; landmark-unique 1 | color-contrast 1 |
| /analytics | color-contrast 2 | color-contrast **46** |
| /leads | **label 24 (critical: every row checkbox)**; label-title-only 2 (language/outcome selects); color-contrast 2 | color-contrast **112** |
| /flow-builder | color-contrast 9; aria-allowed-role 1 (`header`) | color-contrast 22; aria-prohibited-attr 1 |
| /meeting-agent | color-contrast **37**; **label 1 (critical)**; **select-name 1 (critical)** | color-contrast 2 |
| /personal-agents | color-contrast 8 | - |
| /call-reports | color-contrast **51**; empty-table-header 1 | color-contrast 2 |
| /billing | color-contrast 12 | - |
| /knowledge | color-contrast 31; **label 1 (critical, file input)** | - |
| /settings | color-contrast 29; **label 1 (critical, file input)**; landmark-unique 1 | - |
| /login (signed out) | color-contrast 1; region 10 (content outside landmarks) | color-contrast 14 |
| / (signed out) | color-contrast 8; heading-order 4; **scrollable-region-focusable 2 (serious)** | color-contrast 35 |

axe undercounts contrast here: most low-contrast text sits on translucent surfaces, so axe files it under `incomplete`. The custom scanner resolved those surfaces and found the counts below.

### 2.2 Custom scanner per page

"Fails" means the text is below 4.5:1, or below 3:1 for text of 24px+ or 18.66px+ bold.

| Page | Text elements failing / scanned | Text < 12px | Controls without programmatic label | Title-only names | Targets < 24px | h1 | Live regions |
|---|---|---|---|---|---|---|---|
| /dashboard | 26 / 52 (50%) | 19 | **7 / 8** | 2 | 3 | 1 | 1 (wallet `role=alert`) |
| /assistant | 5 / 33 | 1 | 1 / 1 (composer textarea) | 3 (Attach, Send, Sign Out) | 2 | 1 | 1 |
| /analytics | **124 / 242 (51%)** | **139** | 0 / 0 | 1 | 5 | 1 | 1 |
| /leads | **131 / 240 (55%)** | **166** | 1 + 24 row checkboxes | **25** (per-row call buttons) | 2 | 1 | 1 |
| /flow-builder | 20 / 68 | 34 | 0 / 1 | 1 | 2 (+54 connection handles 9x9) | 1 | 5 (good) |
| /meeting-agent | **64 / 111 (58%)** | 42 | **4 / 4** | 9 | **18** | 1 | 1 |
| /personal-agents | 8 / 39 | 10 | 0 | 1 | 2 | 1 | 1 |
| /call-reports | **730 / 949 (77%)** | 145 | 1 / 1 | **51** (per-row Download CSV) | 2 | 1 | 1 |
| /billing | 12 / 46 | 7 | **2 / 2** | 1 | 2 | 1 | 1 |
| /knowledge | 38 / 88 | 36 | 2 / 3 | 1 | 2 | 1 | 1 |
| /settings (Profile) | 32 / 66 | 13 | **3 / 3** | 1 | 2 | 1 | 1 |
| /login | 7 / 15 | 4 | **2 / 2** | 0 | 4 | **0** | 1 (empty `role=alert`) |
| / (home) | 14 / 243 | 38 | 0 | 0 | 30 | 1 | 1 (`aria-live=off`) |

Checks that were the same on every page:
- `lang="en"` on every page.
- Viewport meta is `width=device-width, initial-scale=1`, so zoom is allowed.
- 0 duplicate ids.
- 0 `<img>` without `alt`.
- 0 positive `tabindex`.
- 0 unnamed interactive elements.
- No skip link on any page.
- `<title>` is identical on all 13 pages: "Vaani Labs - The Voice AI that speaks India".

---

## 3. Contrast analysis (light theme unless noted)

### 3.1 The muted-text token is the single biggest problem

The muted grey `text-text-muted` is **#7a8397**. It is used for labels, meta text, table headers, settings nav, the mono uppercase "terminal" labels, hints and pagination. It fails AA on every light surface in the product.

| Surface | Ratio | Where seen |
|---|---|---|
| #ffffff | 3.80 | Billing meta, Knowledge descriptions, Meeting Agent labels ("Meeting Title" 12px) |
| #fdfdfe / #fdfefe | 3.74 to 3.76 | Assistant, Login subtitle, "Forgot your password?" (11px) |
| #fbfbfd | 3.69 | Analytics mono labels ("inbound", "From -> To", 8 to 9px, tracking 1.6 to 2.25px) |
| #f7f9fb | 3.60 | **Settings sub-nav links** (Organization, Notifications, and so on, 15 links, 12px Sora) |
| #f5f7fb / #f4f6fa | 3.52 to 3.55 | **Dashboard field labels** ("CUSTOMER NAME" and the rest, 9px mono uppercase), Leads phone meta (10px, 51 rows), "shortcuts" bar |
| #eef1f7 | 3.36 | Meeting Agent room meta ("1 participant", 10px), "IDLE" chip on dashboard |
| #c3c5c8 | **2.19** | Personal Agents example cards (11px): the cards look disabled |

**Fix:** darken the token to **#5f6878**. I computed the ratios: 5.6:1 on #fff, 5.2:1 on #f4f6fa and 5.0:1 on #eef1f7. That single token change would clear most of the 124 failures on Analytics, 131 on Leads and 64 on Meeting Agent.

### 3.2 Primary / accent buttons

| Element | fg / bg | Ratio | Pages |
|---|---|---|---|
| Wallet banner "Top up" (12px/600) | #111725 on #2f5fe0 | **3.26** | every authenticated page |
| Wallet banner "Enable autopay" (12px) | #2f5fe0 on #d7dff6 | 4.12 | every authenticated page |
| `.btn-saffron` primary: "Save", "Sign In", "Save Changes", "Enable UPI Auto-Debit", "New task", "Rs 500" chip | #000000 on #2f5fe0 | **3.83** | Flow Builder, Login, Settings, Billing, Personal Agents, Call Reports |
| Disabled primary ("Upload & Embed", "Upload") | #183070 on #2f5fe0 at 50% | 2.27 | Knowledge, Settings (exempt as inactive, but reads as broken) |
| Meeting Agent purple CTA/segmented "Conversation flow" | #fff on #8b5cf6 | 4.23 | Meeting Agent |
| Meeting Agent purple links, h1 accent "- Vikash" (20px) | #8b5cf6 on #eef1f7 / #f4f6fa | 3.74 / 3.91 | Meeting Agent |
| AI draft pill | #2f5fe0 on #e0e7f7 | 4.42 | Flow Builder |

**Fix:** use **white text on #2f5fe0 (5.48:1)**. Black gives 3.83:1 and ink #111725 gives 3.26:1. Use it for every primary button and the banner CTA. For the Meeting Agent purple, either adopt the brand blue or darken the purple to about #5a48d8 (6.3:1 with white; computed, needs design check).

### 3.3 Status chips, semantic colours, table fillers

| Element | fg / bg | Ratio | Count |
|---|---|---|---|
| Call Reports empty-cell em dash (13px italic, `text-text-muted/50`) | #b7bcc8 on #f4f6fa | **1.75** | **498 on one page** (+7 more at 1.98) |
| Call Reports "BROWSER" type badge (11px uppercase) | #3aa79e on #e9f1f4 | **2.56** | 46 |
| Call Reports "NEUTRAL" | #b5820e on #edeae2 | **2.83** | 26 |
| Call Reports "MIXED" | #a78bfa on #ecebf9 | **2.31** | 3 |
| Call Reports "IN PROGRESS" / Leads "NEW" (9px) | #0e9488 on #dcecee | 3.08 | 11 / 24 |
| Call Reports "COMPLETED" | #178a55 on #ddebe9 | 3.57 | 47 |
| Call Reports "NEGATIVE" | #d0463a on #f0e4e7 | 3.67 | 10 |
| Call Reports "Re-analyze" teal text button (13px) | #0e9488 on #f4f6fa | 3.46 | 43 |
| Analytics delta chips "+200%" (9px bold) | #178a55 on #e4f1ed | 3.76 | 6 |
| Analytics "0.0% drop" (11px bold) | #0e9488 on #f5f7fb | 3.49 | 6 |
| Analytics section numerals "section 01" (10px, 4px tracking, 80% alpha) | #567de5 on #f4f6fa | 3.54 | 8 |
| Analytics editorial italic subtitles ("- who is on the line", 16px Instrument Serif) | #7a8397 on #f4f6fa | 3.52 | 8 |
| Settings "Delete Account" nav (80% alpha) | #d76a60 on #f7f9fb | 3.25 | 1 |
| Knowledge "Embed" row buttons (10px) | #0e9488 on #f3faf9 | 3.54 | 5 |
| Flow Builder "FLOW VALIDATED" (10px, 70% alpha) | #59aa86 on #f4f6fa | 2.58 | 1 |
| Flow Builder "Private" toggle label (40% alpha) | #a8adb8 on #eef1f7 | 1.99 | 1 |
| Meeting Agent hint text (10px, `text-text-muted/70`) | #a2a8b6 on #fff | 2.38 | several |

Recommendations:
- Chips: use dark text on a tinted bg, and keep the colour in the bg and border only. Examples: #0f5132 on #d1e7dd, or #7a4b00 on #fff3cd.
- Empty cells: use `aria-label="No value"`, or a full-contrast "-", or leave the cell blank. Do not use a 1.75:1 glyph repeated 498 times.
- Semantic text: every green, teal, amber or red token needs a "-700" text variant that reaches at least 4.5:1 on the surfaces above.

### 3.4 Placeholder text

| Page | Placeholder | fg / bg | Ratio |
|---|---|---|---|
| /dashboard Customer Intel (6 fields, 12px) | "Enter customer name", "+91 XXXXX XXXXX" and others | #c3c8d2 on #f4f6fa | **1.56** |
| /meeting-agent title / PPT prompt (14px) | "Product Demo with Vikash" | #b4bac7 on #eef1f7 | **1.72** |
| /flow-builder node search (12px) | "Search nodes..." | #b7bcc8 on #f4f5fa | **1.75** |
| /billing amount inputs (12px) | "Top-up Rs" | #80848e on #eef1f7 | 3.31 |
| /assistant composer (13px) | "Ask me to build a flow..." | #7a8397 on #eef1f7 | 3.36 |
| /leads, /call-reports, /knowledge, /settings, /login | search / field hints | #7a8397 on #fff | 3.77 to 3.80 |

The placeholders on Dashboard, Meeting Agent, Billing and Login are also the only accessible name of their fields (section 4.2). That makes their contrast a 1.4.3 problem as well as a labelling problem.

### 3.5 Flow canvas node text

At the default fit zoom the viewport transform is `scale(0.7119)`. Node text therefore renders much smaller than its CSS size:

| Node text | fg / bg | Ratio | CSS size | Rendered size |
|---|---|---|---|---|
| "Schedule Visit" title (amber) | #b5820e on #eef1f7 | **3.01** | 13px/700 | 9.3px |
| "YES" / "NO" branch badges | #178a55 on #cee2df / #d0463a on #ead7db | 3.24 / 3.30 | 10px/600 | **7.1px** |
| "Confirm Interest" title (teal) | #0e9488 on #eef1f7 | 3.31 | 13px/700 | 9.3px |
| "Start Call" / "End Call" pills | #178a55 on #d3e6e1 / #d0463a on #efdbdd | 3.37 / 3.44 | 14px/700 | 10px |
| "Send WhatsApp..." title | #178a55 on #eef1f7 | 3.86 | 13px/700 | 9.3px |
| Node body copy (mono) | #3e475a on #eef1f7 | 8.24 (pass) | 11px | **7.8px** |
| Header count chips "26 nodes" / key-hint "5" | #7a8397 / #a1a7b5 (70%) | 3.60 / 2.33 | 10px / 9px | - |

See `flow-builder-loaded.png`.

### 3.6 Dark theme

Dashboard in dark mode (`dashboard-dark.png`) has only 7 failing text groups, against 26 in light mode, so the dark palette is healthier. These remain:
- Muted text #7b8196 on #1a1d26 is **4.35:1**, just under AA. The same pair appears on the marketing home.
- Primary "Top up" #e8eaf2 on #7c6bf5 is **3.31:1**. White on #7c6bf5 is 3.98:1 (home "Get started" / "Start free").
- "Enable autopay" #7c6bf5 on #1c1b34 is 4.20:1. "Save Context" #7c6bf5 on #181826 is 4.40:1. "STANDBY" #6c5ed4 (86%) on #0c0d12 is 3.86:1.
- Placeholders #3b404b on #111419 are **1.78:1**.
- The accent changes hue between themes: `saffron` is blue #2f5fe0 in light and purple #7c6bf5 in dark. The token name "saffron" is neither, which is a design-system smell.

### 3.7 Type scale (readability amplifier)

- Share of scanned text below 12px: Analytics 139 of 242 (57 at 9px, 5 at 8px). Leads 166 of 240 (46 at 9px, 24 at 8px). Dashboard 19 of 52 (12 at 9px).
- Much of this text is JetBrains Mono uppercase with 1.8 to 4px letter-spacing ("OPERATOR", "TOTAL CALLS", "section 01").
- At 3.5:1 contrast and 9px this is the least legible combination possible.
- Sizes are set as arbitrary px classes (`text-[9px]`, `text-[10px]`). They do not follow the user's browser default font-size, though page zoom still works. This is inferred from the class names.
- Recommendation: minimum 12px for any informative text, 11px only for all-caps labels with tracking of 0.06em or less, and rem units throughout.

---

## 4. Names, labels, roles, states

### 4.1 Sidebar and navigation (corrects an orchestrator assumption)

The icon-only sidebar links **do have accessible names**: visually hidden text plus `title`, for example link "Assistant" and link "Agent View". Remaining issues:
- **No `aria-current="page"`** on the active item. Active state is shown only by the blue left bar and tint. This is the case in the desktop sidebar and in the mobile bottom nav.
- Two to three **unnamed `<nav>`** landmarks per page. The desktop sidebar and the mobile bottom bar are both in the DOM, and Settings adds a third. axe flags `landmark-unique` on Assistant and Settings.
- "Sign Out" is named only by `title`, which is fragile.
- The mobile bottom bar shows 7 items and ends with an "Exit" button (sign-out), with no confirmation observed. I did not click it.
- The mobile bottom bar omits Analytics, Flow Builder, Meet Agent, Personal Agents, Rep Console and Settings.
- The footer status is plain text: "SYS: ONLINE LAT: 12ms RGN: Mumbai-1 <user email> 12ms". It is not a status region, and the latency text is duplicated.

### 4.2 Form controls without programmatic labels (WCAG 1.3.1, 3.3.2, 4.1.2, 2.5.3)

| Page | Controls | Current accessible name |
|---|---|---|
| /login | Email, Password | `<label>Email</label>` has an empty `for` and the inputs have no id. Name falls back to the placeholder: "you@company.com". **The password field is announced as "bullet bullet bullet..." (placeholder `••••••••`).** Email has no `autocomplete`. Password has `autocomplete="off"`. |
| /dashboard Customer Intel | Customer name, Phone, Email, Company, Location, Language, dial input | Visible uppercase labels are not associated. Names are the placeholders ("Enter customer name", "+91 XXXXX XXXXX"...), which do not match the visible label, so this also fails 2.5.3. |
| /dashboard FLOW select | `<select>` | `title` only (axe label-title-only) |
| /meeting-agent | Meeting Title, Conversation Flow `<select>`, PPT prompt textarea, slide-count number input | Labels are `<label>` elements without `for`. The select has **no name at all** (axe select-name, critical). The number input has no name (axe label, critical). |
| /settings Profile | Name, Phone, brochure file input | Placeholder only ("Your name", "+91..."). The file input has no name (axe critical). |
| /billing | Auto top-up amount, Top-up amount | Placeholder only ("Auto top-up Rs", "Top-up Rs") |
| /knowledge | file input, test-search input | none / placeholder |
| /leads | search, **24 row checkboxes** (`.peer.sr-only`), language and outcome selects | Checkboxes have no name at all (axe label, critical). Selects are named by `title`. |
| /call-reports, /assistant | search, composer textarea | placeholder only |

**Fix:** give every field `<label for>` / `id` (or `aria-labelledby` pointing to the visible label). Name each row checkbox "Select lead <row name>". Use `autocomplete="email"` and `autocomplete="current-password"` on login, and `name`/`tel`/`email`/`organization` on profile and intel fields (1.3.5).

### 4.3 State not exposed

- Meeting Agent **Session Mode** ("Presentation" / "Conversation flow") and **Meeting Privacy** ("Open meeting" / "Encrypted meeting") are plain `<button>`s with **no `aria-pressed` / `aria-checked` / radio semantics**. The selected state is shown by colour only (4.1.2, 1.3.1).
- The Dashboard Vaani/Vikash voice toggle **does** use `aria-pressed`, so the pattern already exists in the codebase.
- Leads j/k row "selection" is shown only by a faint 1px blue row border (`leads-after-j.png`). DOM focus stays on `<body>`. Rows have no role, no `tabindex`, and there is no `aria-selected` / `aria-activedescendant`, so screen-reader users get nothing.

### 4.4 Icon buttons named only by `title`

- Leads: 24 per-row call buttons named "Call <lead name> (c)" via `title`.
- Call Reports: 50 "Download CSV" buttons.
- Meeting Agent: "Copy URL" and "Delete room".
- Assistant: "Attach a file" and "Send".

These pass name computation, but `title` is not exposed on touch and is inconsistently announced. Use `aria-label`.

---

## 5. Keyboard and focus

- **No skip link on any page (2.4.1).** The first focusable element is the logo link. 12 sidebar links, 3 sidebar footer buttons and 3 banner controls come before page content.
- **Leads single-character shortcuts** (`/`, `j`, `k`, `x`, `a`, `c`, `Esc`) are active page-wide. No setting to turn them off or remap them was found on the page. **`c` places a phone call** ("C CALL" in the shortcut legend). This fails **2.1.4 Character Key Shortcuts (A)**. It is especially risky for speech-input users, where a stray "c" starts a billable real call. I did not press `c`.
- **Clickable rows not reachable by keyboard (2.1.1):**
  - Call Reports: 1 `<table>` whose 50 `<tr>` have `cursor:pointer`, but `tabindex` is absent on all 50 and there are no row links.
  - Leads: 267 elements have `cursor:pointer` with no role and `tabindex<0`, because the rows are `div[data-index]`.
  - The Call Reports table also has 18 `th` with no `scope`, no `caption`, no `aria-sort` on the sorted "Started" column (it shows only a caret), and one empty `th`.
- **Focus indicators (2.4.7 AA, 1.4.11 AA):**
  - Leads row / select-all checkboxes: the visually hidden `input.peer` gets focus, but the visible box (`span` sibling) has `box-shadow:none`, `outline:none` and an unchanged border. **There is no visible focus at all** (`leads-focus-checkbox.png`).
  - Leads language / outcome `<select>`: `outline:none`, with a border-colour change only.
  - Dashboard intel inputs: focus is a faint blue border, about 2.1:1 against #f4f6fa (estimated from `focus:border-saffron/50` and the screenshot), which is below 3:1 (`dashboard-input-focus.png` vs `dashboard-input-nofocus.png`).
  - Buttons fall back to the browser default `outline:auto`. It is visible but inconsistent: the colour varies per button (#3e475a, #0e9488, #7a8397) and it is 0.8px on some ("EXPORT").
  - Login inputs use a box-shadow ring (present).
  - Vaani/Vikash toggle: a clear 2.4px dark ring (`dashboard-toggle-focus.png`). This is good.
- **Flow canvas (2.1.1, 2.5.7 AA, 2.5.8 AA):**
  - The React Flow defaults are intact and good: nodes are `role=group`, `aria-roledescription="node"`, `tabindex=0` and have keyboard instructions via `aria-describedby`. Edges are named ("Edge from start to greet"). Controls are named (Zoom In, Zoom Out, Fit View, Toggle Interactivity). The minimap is labelled. There is an `aria-live` region.
  - However, the 54 **connection handles are 9x9px, with no role and no `tabindex`**. Creating a connection needs a pointer drag, and no single-pointer or keyboard alternative was observed (inferred; I did not test click-to-connect).
  - The canvas has no keyboard way to add a link between steps.

---

## 6. Status messages and live regions (4.1.3 AA)

- On every authenticated page the only live region is the **wallet banner, marked `role="alert"`** (assertive).
  - It is re-inserted on every page load and even after a data **Refresh** on Leads. A MutationObserver saw the banner node re-added after clicking Refresh.
  - A persistent billing nag is therefore announced assertively and repeatedly.
  - Recommendation: `role="status"` or no live role, rendered once per session.
- **Call state is not announced.** On the dashboard, "IDLE", "STANDBY", "Awaiting connection..." and "SESSION: IDLE" are all outside any live region. The Transcript Feed is not `role="log"`. When a call connects or a transcript streams in, screen-reader users get no update. This is inferred from the structure, because calls were not placed.
- No toast system was detected (no sonner, Toastify or react-hot-toast container). Refresh and other async actions give no audible confirmation.
- Flow Builder is the exception and does well: `role="status"` "Up to date", an sr-only polite status, and the React Flow assertive region.
  - **However:** about 10 seconds after opening the page, with **zero edits**, the builder sent an unprompted **`PUT /api/flows/<id>` with a 48,331-byte body**. I reproduced this twice.
  - My guard blocked the PUT, yet the status region still said **"Up to date"** 37 seconds later (observed under simulated network failure).
  - So (a) the product writes the whole flow without user intent, which risks overwriting concurrent edits and churning versions (inferred), and (b) a failed save is reported as success. That misleads every user, not just assistive-technology users.
- Login has an empty `role="alert"` ready for errors, which is good. I did not submit the form to see whether it is actually used.

---

## 7. Motion (2.2.2 A, 2.3.3 AAA)

- The authenticated app ships **one** `@media (prefers-reduced-motion: reduce)` rule. It targets marketing classes only (`.vlp-cta-primary::before, .vlp-eq-bar, .vlp-float, .vlp-reveal, .vlp-rise`).
- With reduced motion emulated, `/analytics` still ran **12 infinite animations** (`breathe`, `spin`, `ring-pulse`). The dashboard "breathe" orb and ring (4 infinite) keep pulsing. These are decorative infinite animations with no pause control.
- The marketing home honours the preference: infinite animations drop from **49 running to 4** with reduce (`ring-pulse`, `vdsblink` remain). There are 65 running animations without the preference.
- Recommendation: a global `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important } }`, plus stopping JS-driven (WAAPI) loops when `matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## 8. Structure: headings, landmarks, titles

- **Titles (2.4.2 A):** all 13 pages use the same `<title>`, "Vaani Labs - The Voice AI that speaks India". Tabs, history and screen-reader page announcements cannot tell pages apart. Use "Leads - Vaani Labs", "Call Reports - Vaani Labs" and so on.
- **h1:** exactly one per authenticated page. The styling is inconsistent: "AGENT COCKPIT", "ANALYTICS", "BILLING", "SETTINGS" and "AGENT KNOWLEDGE" are tracked uppercase, while "Call Reports" and "Personal Agents" are sentence case and "Meeting Agent - Vikash" is mono.
- Heading outlines:
  - Leads, Call Reports and Personal Agents have **only the h1**, with no headings for the KPI strip, filters or table.
  - Analytics has a good h2 per section, but the signed-in user's own name is an h3 ("3: <user name>").
  - Login has **no h1**; "Welcome Back" is an h2.
  - Home skips h2 to h4 four times (axe heading-order).
- **Landmarks:**
  - Authenticated pages have `main`, `aside`, and 2 to 3 `nav`, with `header` on most.
  - The wallet banner and its links sit inside `main`.
  - Login has **no landmarks at all** (axe `region` x10).
  - Flow Builder `header` carries a role axe does not allow (aria-allowed-role).
  - At 320px width, `main` and `aside` were not found on `/dashboard` or `/call-reports`, but they exist at 390px. This needs re-verification (possible hydration timing); treat it as an open question.
- **Reflow (1.4.10):** no page-level horizontal scroll at 320px on Dashboard or Call Reports (`scrollWidth` = 320). The filter chips scroll horizontally inside their own row (`reflow320-call-reports.png`).

---

## 9. Marketing home and login (signed out)

- Home:
  - 2 **scrollable regions not keyboard-focusable** (`.cd-trans` transcript demo, `.vds-track`), which is axe serious (2.1.1).
  - CTA white on #7c6bf5 is 3.98:1. Mono meta #7b8196 on #1a1d26 is 4.35:1.
  - The gradient-clipped headline span ("handle every call.") has transparent text, so contrast must be checked manually against the gradient ends.
  - Nav links are 20px tall; the 24px spacing exception probably applies.
  - `aria-live="off"` on the rotating language ticker, which is correct.
- Login:
  - See 4.2 for labels and autocomplete.
  - Show-password button is 16x16.
  - "Back to home" and "Forgot your password?" are 16 to 17px-tall text links.
  - "Don't have an account? Sign up" is a `type=submit` button inside the form. It toggles the mode, but as a submit button pressing it could submit the form: that is a semantics risk (inferred, not triggered).
  - Muted copy is 3.52 to 3.76:1.
  - Google and Meta are proper links.

---

## 10. Findings (mapped to WCAG 2.2)

| ID | Severity | Title | WCAG | Evidence (screenshot) |
|---|---|---|---|---|
| A11Y-AUTO-01 | critical | Form fields lack programmatic labels. Placeholder-as-name on login, dashboard intel, profile, billing and meeting; the password is named "••••••••"; 24 unnamed row checkboxes; unnamed select and number input | 1.3.1 A, 3.3.2 A, 4.1.2 A, 2.5.3 A, 1.3.5 AA | login-signedout.png, dashboard.png, leads.png, meeting-agent.png, settings.png, billing.png |
| A11Y-AUTO-02 | high | Muted text token #7a8397 fails AA on every light surface (2.19 to 3.80:1). 50 to 77% of text fails on data pages | 1.4.3 AA | analytics.png, leads.png, call-reports.png, meeting-agent.png, settings.png |
| A11Y-AUTO-03 | high | Primary buttons and the global wallet-banner CTAs fail contrast (black on #2f5fe0 3.83; Top up 3.26; Enable autopay 4.12) | 1.4.3 AA | dashboard.png, login-signedout.png, billing.png |
| A11Y-AUTO-04 | high | Status chips, semantic colour text and table fillers fail (2.31 to 3.76; 498 dashes at 1.75 on Call Reports) | 1.4.3 AA, 1.4.1 A | call-reports.png, leads.png, analytics.png |
| A11Y-AUTO-05 | high | Placeholder contrast 1.56 to 1.78:1 on dashboard intel, meeting agent and node search | 1.4.3 AA | dashboard.png, meeting-agent.png, flow-builder-loaded.png |
| A11Y-AUTO-06 | high | Leads single-key shortcuts (incl. `c` = place call) cannot be disabled; j/k selection is invisible to assistive technology | 2.1.4 A, 4.1.2 A | leads.png, leads-after-j.png |
| A11Y-AUTO-07 | high | Clickable table and list rows are not keyboard reachable (50 rows on Call Reports; div rows on Leads) and table semantics are thin | 2.1.1 A, 1.3.1 A | call-reports.png, leads.png |
| A11Y-AUTO-08 | high | Focus indicator missing (sr-only checkboxes) or below 3:1 (inputs, selects) | 2.4.7 AA, 1.4.11 AA | leads-focus-checkbox.png, dashboard-input-focus.png |
| A11Y-AUTO-09 | high | Status messages: call state and transcript not live; wallet `role=alert` re-announced on every load and refresh; no toasts | 4.1.3 AA | dashboard.png |
| A11Y-AUTO-10 | high | App ignores prefers-reduced-motion; infinite decorative animations (breathe, spin, ring-pulse) with no pause | 2.2.2 A, 2.3.3 AAA | dashboard.png, analytics.png |
| A11Y-AUTO-11 | high | Flow canvas: 9x9 handles, no keyboard or single-pointer way to connect; node text 7.1 to 10px rendered with 3.0 to 3.9:1 colours | 2.1.1 A, 2.5.7 AA, 2.5.8 AA, 1.4.3 AA | flow-builder-loaded.png |
| A11Y-AUTO-12 | medium | Flow Builder autosaves (PUT 48 KB) ~10 s after load with no edits; a failed save still shows "Up to date" | 4.1.3 AA, 3.3.1 A (trust) | flow-builder-loaded.png |
| A11Y-AUTO-13 | medium | Every page has the same `<title>` | 2.4.2 A | all |
| A11Y-AUTO-14 | medium | No skip link; unnamed duplicate navs; no aria-current on active nav item (desktop and mobile) | 2.4.1 A, 1.3.1 A, 4.1.2 A | leads-focus-tab22.png, mobile390-leads.png |
| A11Y-AUTO-15 | medium | Toggle state not exposed (Meeting Agent Session Mode and Privacy) | 4.1.2 A, 1.4.1 A | meeting-agent.png |
| A11Y-AUTO-16 | medium | Targets under 24px: Refresh flows 14x14, Copy URL 15x15, Show password 16x16, banner Dismiss 22x22 | 2.5.8 AA | dashboard.png, meeting-agent.png, login-signedout.png |
| A11Y-AUTO-17 | medium | Pervasive 8 to 10px text (57% of Analytics text < 12px), heavily tracked mono caps, px units | 1.4.4 AA (risk), 1.4.12 AA (risk) | analytics.png, leads.png |
| A11Y-AUTO-18 | medium | Heading and landmark gaps: login has no h1 and no landmarks; data pages have only an h1; home skips levels; user name as h3 | 1.3.1 A, 2.4.6 AA | login-signedout.png, home-signedout-full.png |
| A11Y-AUTO-19 | medium | Marketing home: 2 scroll regions not focusable; CTA 3.98:1; meta 4.35:1 | 2.1.1 A, 1.4.3 AA | home-signedout.png |
| A11Y-AUTO-20 | low | Dark theme residual failures (4.35 muted, 3.31 primary, 1.78 placeholders); accent hue flips blue to purple | 1.4.3 AA | dashboard-dark.png |
| A11Y-AUTO-21 | low | Names via `title` only (Sign Out, 24 call buttons, 50 Download CSV, Copy URL, Attach, Send) | 4.1.2 A (robustness) | leads.png, call-reports.png |
| A11Y-AUTO-22 | low | Personal Agents example cards rendered as grey-on-grey (2.19:1) and look disabled | 1.4.3 AA | personal-agents.png |
| A11Y-AUTO-23 | low | Mobile bottom nav: "Exit" (sign-out) is a primary tab with no aria-current; 6 sections unreachable from mobile primary nav | 2.4.3 A / UX | reflow320-dashboard.png, mobile390-leads.png |

### Recommendations, in order of leverage

1. **Tokens.**
   - Set `--text-muted` to #5f6878.
   - Put white text on primary #2f5fe0.
   - Add a "-700" text variant for green, teal, amber and red, and dark text on chip tints.
   - Set placeholders to at least 4.5:1, or keep them decorative next to a real label.
   - In dark mode, raise muted to at least #8a90a4 (verify 4.5:1 on #1a1d26) and use white on a darker purple.
2. **One `<Field>` primitive** that always renders `<label for>`, hint `aria-describedby`, error `aria-invalid` + `aria-describedby`, and an `autocomplete` prop. Adopt it on Login, Dashboard intel, Settings, Billing, Meeting Agent, Knowledge and Assistant.
3. **Focus.** A global `:focus-visible { outline: 2px solid <accent>; outline-offset: 2px }`. For `.peer` checkboxes, add `peer-focus-visible:ring-2` on the visible box. Remove `outline:none` on selects.
4. **Keyboard.**
   - Add a skip link.
   - Make table rows real links or buttons (or `tabindex=0` with Enter handling).
   - Make Leads shortcuts toggleable, active only when the list has focus, and move "call" behind a modifier or confirmation.
   - Use a roving tabindex with `aria-selected` for the j/k selection.
5. **Status.**
   - Use `role=status` for call state, and `role=log` with `aria-live=polite` for the transcript.
   - Downgrade the wallet banner from `alert` and render it once.
   - Add a polite toast region.
   - Make Flow Builder save status reflect failures ("Couldn't save - Retry"), and do not autosave without a change.
6. **Titles and landmarks.** Per-route `<title>`, `aria-current="page"`, and `aria-label` on each nav ("Primary", "Settings sections", "Mobile").
7. **Motion.** A global reduced-motion rule, and stop the infinite orb and ring loops, or add a pause.
8. **Canvas.** Handles of at least 24x24 hit area, plus a keyboard "Connect to..." action on a focused node (for example a menu listing target nodes). Keep node text at 12px or more at the default zoom, or clamp the minimum zoom for fit-view.

---

## 11. Strengths worth preserving

- `lang="en"` everywhere. Zoom is not blocked. No duplicate ids. No images missing `alt`. Decorative SVGs are `aria-hidden`. No positive tabindex.
- Sidebar icon links do have accessible names (hidden text plus title), and the Flow Builder toolbar and React Flow controls are all named.
- Exactly one h1 and one `main` on every authenticated page. Analytics has a clean h2-per-section outline.
- React Flow a11y defaults are kept: focusable nodes with instructions, named edges, labelled minimap, and live regions. The save status uses `role=status`.
- Leads pagination is a `nav` labelled "Pagination". The Dashboard voice toggle uses `aria-pressed`.
- The marketing site honours `prefers-reduced-motion` (49 to 4 infinite animations).
- No page-level horizontal scroll at 320px on the pages tested.
- The dark theme is substantially more compliant than the light theme.
- Login OAuth options are real links, and an error `role=alert` region exists.

## 12. Open questions

- Is the Flow Builder 10-second PUT a deliberate autosave? If so, does it send only when dirty, and how does it handle concurrent editors?
- Are Leads shortcuts configurable anywhere (Settings > Notifications/Profile were not exhaustively searched)?
- Which live announcements happen during an actual call (untestable here: calls are prohibited)?
- The missing `main`/`aside` at 320px needs a re-check after full hydration.
- Does the login `role=alert` actually receive error text on failure? The form was not submitted.
