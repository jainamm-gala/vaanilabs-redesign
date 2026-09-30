# Responsive Audit B — vaanilabs.in

Agent: `va-responsive-b` · Date: 2026-09-26 · Target: https://vaanilabs.in (live production, signed in as the customer operator of org "starvox labs")
Scope: `/analytics`, `/leads`, `/call-reports`, `/knowledge`, `/settings` (+ sub-nav and two sub-pages), signed-out `/login` (+ sign-up toggle) and marketing home `/`.
Widths: 1920, 1440, 1280, 1024 (desktop, mouse) · 768 (tablet, CDP `mobile:true` + touch) · 390 and 360 (phone, CDP `mobile:true` + touch). Extra: width sweeps (1024 → 320) to pin exact breakpoints, and one landscape-phone check (844×390).
Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-responsive-b/` (89 files, file names referenced below).

Browser status: stayed signed in for the whole run (no LOGGED_OUT). No write request was blocked by the guard during this run (every `S.blocked` flush was empty apart from PostHog analytics). No console errors other than the guard's own `ERR_BLOCKED_BY_CLIENT` for PostHog.

---

## 1. Method

* Private browser window with a read-only network guard. Desktop widths were set with `page.setViewportSize`. Tablet and phone widths used CDP `Emulation.setDeviceMetricsOverride({mobile:true})` plus `setTouchEmulationEnabled`, and the page was reloaded so load-time device checks ran again. `matchMedia('(pointer: coarse)')` returned `true` in every tablet and phone measurement.
* Signed-out pages (`/login`, `/`) were loaded in a separate, cookie-less browser context, so the user's session was not touched.
* For each page × width the script recorded:
  * `documentElement.scrollWidth` compared with `innerWidth`
  * the outermost elements that extend past the viewport and are not clipped by an in-viewport scroll container
  * inner horizontal scrollers (`scrollWidth > clientWidth` with `overflow-x: auto|scroll`)
  * `overflow:hidden` clipping
  * a histogram of computed font sizes, counting only elements with their own text nodes
  * interactive elements under 44 px and under 24 px
  * tables: column count, width and scroll wrapper
  * fixed and sticky elements, and the navigation element
  * vertical scrollers
* I viewed every screenshot myself. Where the app scrolls inside a container (all authenticated pages use an `h-screen` shell with an inner `overflow-y-auto` div), I scrolled that container and took extra screenshots.
* Width sweeps went from 1024 down to 320 in steps of 20–60 px. Each sweep resized the window without reloading and read the same metrics, which gives exact break widths.
* Interactions (all non-destructive):
  * opened and cancelled the Leads "New lead" modal
  * opened and closed the "Import leads" modal (opened by accident with a text locator; nothing was uploaded)
  * tapped a lead row to open the lead drawer, then closed it
  * tapped a call-report row to open the call-details pane
  * scrolled the settings sub-nav strip
  * expanded and collapsed the sidebar
  * hovered a sidebar icon
  * opened the marketing hamburger menu
  * switched `/login` to the sign-up view (nothing submitted)
* Measurement caveat: Playwright's screenshot call re-applies its own viewport (non-mobile). I set the Playwright viewport to the same width and height first and re-applied the CDP mobile override after each screenshot. Layout is identical, but screenshots at 768/390/360 show desktop-style (non-overlay) scrollbars. On a real touch device those scrollbars are overlay/hidden, which makes the horizontal-scroll problems below *less* discoverable, not more.

---

## 2. Global shell (applies to every authenticated page)

### 2.1 Breakpoints observed
| Width | Shell |
|---|---|
| ≥ 768 | 72 px fixed icon-only left rail (`aside.fixed.left-0.top-0`), content offset 72 px |
| ≤ 767 | Rail hidden (`display:none`), a 56 px fixed bottom tab bar (`nav.fixed.bottom-0 … md:hidden`) appears |

The switch is exactly at the Tailwind `md` boundary (767/768).

### 2.2 Mobile bottom tab bar exposes only half the product (CRITICAL)
* The bottom bar at 390 and 360 has exactly 7 items: `Assistant → /assistant`, `Agent → /dashboard`, `Leads → /leads`, `Reports → /call-reports`, `Billing → /billing`, `Knowledge → /knowledge`, `Exit → <button>` (sign-out).
* Checked on the page at 390 px: `/analytics`, `/flow-builder`, `/meeting-agent`, `/personal-agents`, `/rep-console` and `/settings` have **no visible link anywhere**. They exist only inside the hidden rail (`hidden` in the reachability map).
* A phone user who lands on Analytics (e.g. from a shared link) sees no active tab, because Analytics is not in the bar. Settings (incl. Security, API keys, Delete account) cannot be reached at all without typing the URL.
* "Exit" (sign-out) takes one of the 7 primary slots and has the same visual weight as the destinations, so an accidental tap signs the user out. I did not click it, so whether it asks for confirmation is unknown.
* The bar's items are 56×55 px (good). Labels are 11 px. There is no `aria-current` on the active item: the active state is colour plus underline only, confirmed by DOM read. The bar has `padding-bottom: 0` and no `env(safe-area-inset-bottom)`, so on iPhones with a home indicator the labels sit on the gesture area (inferred from CSS).
* Screenshots: `analytics_390.png`, `settings_390.png`, `leads_390.png`.

### 2.3 Desktop rail: items hidden by viewport *height* (HIGH)
The 12-item rail lives in `aside nav.flex.min-h-0.flex-1` with `overflow:auto`. Its content height is 572 px.

| Viewport | nav clientHeight | Hidden items |
|---|---|---|
| 1920×1080 | ≥ 572 | none (all 12 visible) |
| 1440×900 | 548 | Settings partially cut (24 px), inner scrollbar arrows appear (`analytics_1440.png`) |
| 1280×800 | 448 | Billing, Knowledge, Settings hidden (`analytics_1280.png`) |
| 1024×768 | 416 | Billing, Knowledge, Settings hidden (`analytics_1024.png`, `leads_1024.png`) |
| 768×1024 (tablet portrait) | fits | none (`analytics_768.png`) |
| 844×390 (landscape phone) | **38** | only "Assistant" fully visible; the other 11 items sit behind a 38 px-tall scroller (`leads_landscape_844x390.png`) |

Expanding the rail (240 px) at 1024×768 does not help: Settings is still below the fold (`sidebar_expanded_1024.png`). The problem is the stacked footer (status dot, latency, sign-out, theme toggle, expand button ≈ 250 px), which is always reserved.

### 2.4 Rail hover labels are clipped: icon-only nav has no working labels (HIGH)
* Each rail link contains a label tooltip `div.pointer-events-none.absolute.left-full.ml-3`. When hovered it is `opacity:1; visibility:visible` at x = 64–124.
* The parent `nav` has `overflow:auto` and ends at x = 63, so the tooltip is clipped and never seen (`sidebar_hover_tooltip_1280.png`: hovering Leads shows nothing).
* The same tooltips give the 72 px rail a horizontal overflow of `clientWidth 44 / scrollWidth 175`. This draws a spurious horizontal scrollbar (the "◂ ▬ ▸" widget under the icons) at **every** desktop width (visible in `analytics_1920.png` at y≈825, `analytics_1024.png` at y≈512).
* Result: in the collapsed default state, all 12 destinations are unlabeled icons, and some (Meeting Agent vs Rep Console vs Personal Agents) are hard to tell apart.

### 2.5 Wallet banner and fixed chrome consume the phone viewport (MEDIUM)
* Wallet banner height: 42 px at ≥ 768, **58 px** at 390 (text wraps to 2 lines, "Top up" wraps to "Top / up"), **77 px** at 360 (3 lines).
* Add the sticky page header (Analytics 69 px) and the 56 px bottom bar. At 360×780, ≈ 200 px (26 %) of the screen is permanently taken by chrome before any content.
* The banner's Dismiss button is 22×22 px at every width.

---

## 3. Page-by-page results

### 3.1 /analytics

| Width | doc overflow | Notes | Screenshot |
|---|---|---|---|
| 1920 | none | Content column capped ≈ 1216 px, centered; rail shows all 12 items | `analytics_1920.png` |
| 1440 | none | Rail: Settings cut off | `analytics_1440.png` |
| 1280 | none | Rail: 3 items hidden | `analytics_1280.png` |
| 1024 | none | KPI cards 4-up; "AVG DURATION"/"TOTAL MINUTES" labels wrap to 2 lines | `analytics_1024.png` |
| 768 | none | KPI 2×2; intent names truncated ("Appointment …", "Airport Passe…", "Emergency & …", "Technical & C…", "Event Informa…"); Recent table still shows all 5 columns | `analytics_768.png`, `_s1…_s4` |
| 390 | none at document level, **main scroller sw 543 vs cw 380** | Header actions overflow: CSV and EXPORT PDF are off-screen right; the whole content pane pans sideways | `analytics_390.png`, `_s1…_s5` |
| 360 | same, sw 543 vs cw 350 | Horizontal pan of 193 px reveals CSV/EXPORT PDF (`analytics_360_hscrolled.png`); KPI cards clip content (cw 156 / sw 160–163) | `analytics_360.png` |

* **Header overflow breakpoint (sweep):** fits at 560 (right edge 543 < 550), overflows from **≤ 552 px**. The offender is `header … div.flex.items-center.gap-2` ("UPDATED hh:mm · REFRESH · CSV · EXPORT PDF"), 357 px wide, `flex-shrink` not allowed, not wrapping. Because it sits inside the main vertical scroller, the *entire* page gets a horizontal scroll, not just the header.
* **Sentiment chart:** SVG `viewBox 0 0 800 220` is stretched to the container with a fixed height of 240 px, so it does not keep its aspect ratio:
  * At 390 the chart is 325×240, and axis tick text renders **4.8 px tall** (unreadable; `analytics_390_s1.png`).
  * At 1440 it is 1166×240, and text is 13.6 px tall but horizontally stretched 1.46×.
  * The "7D / 30D / 90D" toggle buttons are 36×24 / 44×24 / 44×24 at every width.
* **Flow drop-off list** at 390: step names truncated to ~9 characters ("Confirm I…", "Condition…", "Knowledg…"). The span has `cw 92 / sw 184`: the name is squeezed by "n reached / x% drop" metrics that never wrap (`analytics_390_s2.png`).
* **Recent calls** at 390: Started, Duration, End status and Sentiment are all dropped. Rows show only "— → +91••••0319 / INBOUND" plus a chevron, with no card substitute (`analytics_390_s4.png`), so the section loses its value on phones.
* **Font sizes (desktop):** 143 text nodes < 12 px: 8 px ×5, 9 px ×57, 10 px ×51, 11 px ×30. At 390: 120 nodes (9 px ×8, 10 px ×31, 11 px ×18). 9 px examples: KPI labels "Total calls", "This week", "Avg duration", trend chips "+200 %", the "pending" DID badge.
* Positive: identity card stacks correctly at 390, sticky header works, and the footer is not hidden by the bottom bar.

### 3.2 /leads

| Width | Notes | Screenshot |
|---|---|---|
| 1920 | List rows stretch the full 1838 px; the lead name is at x = 188 and the status badge and call button at x ≈ 1800–1885, a ~1,600 px eye-travel gap. Interest column empty. | `leads_1920.png` |
| 1440 / 1280 | Same pattern; STATUS header misaligned (see below) | `leads_1440.png`, `leads_1280.png` |
| 1024 | Source/filter row already overflows (27 px): "ANY OUTCOME" dropdown clipped, with an inner horizontal scrollbar under the chips | `leads_1024.png` |
| 768 | Both chip rows overflow (status 73 px, source 283 px); 4 KPI cards in one row; list fine | `leads_768.png` |
| 390 | Refresh/Export become 37×25 icon-only buttons; KPI grid 2×2; keyboard-shortcut legend wraps; list shows name + masked phone + call button only; first row starts at y ≈ 590 → **3 rows above the fold** | `leads_390.png` |
| 360 | Header buttons wrap to 2 rows, shortcut legend 3 lines → **1 row above the fold** (first lead at y ≈ 650 of 724 usable) | `leads_360.png` |

Breakpoints (width sweep, desktop mode):
* Source chip row overflows at **≤ 1024** (27 px at 1024, 151 at 900, 283 at 768, 549 at 390).
* Status chip row overflows at **≤ 820** (21 px at 820, 363 at 390).
* INTEREST column hidden at **≤ 767**.
* STATUS column and all status badges hidden between **640 and 600**: visible "NEW" badges drop from 25 to 1, and the remaining 1 is the filter chip.
* Refresh/Export text labels hidden **< 640** (`span.hidden.sm:inline`).

Findings:
* **Status/Interest data disappears on phones** with no card-style substitute. A rep on a phone cannot see pipeline status per lead without opening each drawer.
* **Column misalignment on desktop:** at 1280 the STATUS header cell spans x 1006–1102 and INTEREST x 1118–1198, but the "NEW" status badge renders at x 1163–1198, i.e. under INTEREST. The Status column is visually empty at 1920/1440/1280/1024/768 (`leads_1280.png`, `leads_1024_detail.png`).
* **Sticky behaviour:** the search + two chip rows (136–146 px) are sticky (`div.sticky.top-0.z-20`). The column header row (LEAD/STATUS/INTEREST/CALL) and the page header with "New lead" scroll away (`leads_1280_scrolled.png`). On 390 the sticky block plus the wallet banner cover ≈ 194 px of the 788 px above the tab bar (`leads_390_scrolled.png`).
* **Chip rows:** scroll horizontally with a visible scrollbar and no fade or arrow cue. On phones the "Any language" and "Any outcome" selects sit 540 px off-screen right in the source row.
* **Touch targets (390):** 77 of 84 interactive elements < 44 px; 26 < 24 px.
  * Status and source chips: 25 px tall, 10 px uppercase mono text.
  * Row checkboxes: visually hidden 1×1 input inside a 20×20 label.
  * Row call button: 32×32. It is the most prominent control on each row, directly next to the row's tap area, which carries a risk of accidental outbound calls from a thumb.
  * Refresh/Export icon buttons: 37×25.
  * Prev/Next pagination: 10 px text.
* **Accessibility regression < 640 px:** the icon-only Refresh and Export buttons have no `aria-label`/`title`, and their text span is `display:none`, so they have no accessible name.
* **Keyboard-shortcut legend** ("/ search · J/K nav · X select · A select all · C call · Esc clear") is still shown with `pointer: coarse`, taking 45–70 px on phones.
* **New lead modal** at 390 (`leads_390_newlead.png`): fits well (358 px card, 40–44 px inputs, Cancel/Create lead reachable, Escape closes). Inputs are **14 px**, which triggers iOS Safari zoom-on-focus (inferred). No `autocomplete` on the name/tel/email fields. The overlay has no `role="dialog"`/`aria-modal`. The Name field autofocuses, so on a phone the keyboard opens immediately and covers the lower half of a vertically centred, non-scrolling modal (inferred).
* **Import leads modal** at 390 (`leads_390_import_modal.png`): fits. Copy says "Drop or click to choose" on a touch device.
* **Lead drawer:**
  * At ≥ 1024 it is a 440 px sticky side panel and the list compresses (`leads_1280_detail.png`, `leads_1024_detail.png`). Acceptable, but at 1024 the list is ~500 px wide and still shows the misaligned Status column.
  * At 390 it becomes a full-screen panel (`fixed inset-y-0 right-0 z-40 w-full`), which is good (`leads_390_rowtap.png`).
  * The 56 px bottom bar (z-50) overlays the drawer's last 56 px and the drawer has `padding-bottom:0` (`leads_390_drawer_bottom.png`).
  * Close button is 32×32. Escape closes it after the transition.
* **Landscape phone 844×390:** header, KPIs, shortcut legend and filters fill the entire first screen; zero lead rows are visible (`leads_landscape_844x390.png`).

### 3.3 /call-reports

Uses a real `<table>`: **16 columns at 1920, 18 at ≤ 1440** (extracted flow-field columns are added after load). Width is 2337–2617 px. Wrapper `div.flex-1.overflow-auto`. `thead` is `position: sticky` (good).

| Width | Table viewport (cw × ch) | Table width | Notes | Screenshot |
|---|---|---|---|---|
| 1920 | 1838 × 771 | 2337 | Horizontal scroll even at 1920; the 10 extracted-field columns are mostly "—" | `callreports_1920.png` |
| 1440 | 1358 × 591 | 2617 | | `callreports_1440.png` |
| 1280 | 1198 × 491 | 2617 | | `callreports_1280.png` |
| 1024 | 942 × 459 | 2617 | 6.5 columns visible; horizontal scrollbar at the very bottom of the viewport | `callreports_1024.png` |
| 768 | 696 × 725 | 2617 | Type, To, Started, Duration, Status, Sentiment visible; Summary off-screen | `callreports_768.png` |
| 390 | 390 × **337** | 2337 | Only Type ("BROWSER"), To and Started visible; Status/Sentiment/Summary need horizontal scroll | `callreports_390.png` |
| 360 | 360 × **255–264** | 2617 | ~3 rows visible at a time | `callreports_360.png` |

* **No mobile layout:** no card view, no column priority, no frozen first column. The first two columns are the least informative ("BROWSER" chip for every row, then "—" or a masked number), while the columns users need (Sentiment, Summary) come 6th and 7th.
* **Fixed page chrome does not scroll away.** Title, Refresh/Export CSV, the 4 KPI cards (2×2 on phone) and the search/filter row sit above the table's own scroller: ≈ 460 px at 360×780. Only 255–337 px of the phone is available for data (sweep at height 800: 491 px ≥ 768 width → 283 px ≤ 560 width).
* **Search input collapses:** 600 px at 1024 → 344 at 768 → 224 at 560 → 94 at 430 → **54 px at 390, 52 px at 360**. At that size the placeholder shows only "S" and the input is unusable (`callreports_390.png`). At 360 the last sentiment pill ("Neutral", right edge 372) overflows the viewport by 12 px.
* **Call details on phone:** tapping a row opens the details pane (`w-full sm:w-96 … overflow-y-auto`) *inline in the 255 px table slot*, not as a sheet (`callreports_360_detail.png`, `callreports_360_detail_scrolled.png`). The transcript is read through a 255 px-tall window under ≈ 460 px of chrome. On desktop the same pane is a 384 px right column (`callreports_1280_detail.png`, fine).
* Fonts: 149–151 nodes at 11 px (headers, chips, badges); body 13 px. No text < 11 px.
* Extracted Hindi/English text in field columns is truncated at `max-w-[220px]` (e.g. cw 220 / sw 320) with no tooltip on touch.

### 3.4 /knowledge

| Width | Notes | Screenshot |
|---|---|---|
| 1920 | Content capped ≈ 1150 px, centred; page header spans full width, so "Review proposals"/"Refresh" float at x 1620–1895, 330 px right of the content edge (1566) | `knowledge_1920.png` |
| 1440 / 1280 | OK | `knowledge_1440.png`, `knowledge_1280.png` |
| 1024 | Size ("273.6 KB") and Updated dates wrap to 2 lines; filenames (raw storage keys) break at hyphens | `knowledge_1024.png` |
| 768 | **Actions column clipped**: "Embed" half visible, "Delete" hidden; table 691 px in a 597 px box | `knowledge_768.png` |
| 390 | Header title wraps to 2 lines, "Review proposals" wraps; file table 691 px in a 297–307 px box, so only the File column is visible; Size, Updated and Actions need horizontal scroll; pagination "NEXT" clipped | `knowledge_390.png`, `knowledge_390_s1.png`, `knowledge_390_s2.png` |
| 360 | Page header overflows by 28 px (`sw 388 / cw 360`): the "Refresh" button is cut at the right edge ("Refres") | `knowledge_360.png` |

* Table overflow breakpoint (sweep): fits at 900 (718/718), overflows from **≤ ~880** (860: 678/691, 768: 586/691, 390: 297/691). The table has a hard 691 px minimum.
* Native unstyled `<input type=file>` ("Choose file No file chosen") at every width.
* Test Knowledge Search: the input placeholder is truncated at 390 ("Ask a question to test kno…"); the Search button stays beside it.
* Font sizes: 40–42 nodes < 12 px (10 px card labels "KNOWLEDGE FILES", "SUPPORTED DOCS", "AI INTEGRATION").

### 3.5 /settings (and sub-navigation)

| Width | Sub-nav | Notes | Screenshot |
|---|---|---|---|
| 1920 | Vertical list, 208 px column, 17 items at 36 px each | Form column ≈ 576 px centred in a 1600 px pane: 520 px empty gap between sub-nav and form; "Save Changes" pinned far right (x 1755–1895) of the page header, away from the form | `settings_1920.png` |
| 1440 / 1280 | same | | `settings_1440.png`, `settings_1280.png` |
| 1024×768 | same | Docs and Delete Account below the fold (the list scrolls with the page) | `settings_1024.png` |
| 768 | same vertical list | Fine | `settings_768.png` |
| 390 / 360 | **Horizontal tab strip**, `nav.flex.gap-1.overflow-x-auto`, 17 tabs, **scrollWidth 2300 px** (≈ 6 screens) | 2.5 tabs visible; no fade/mask, no scroll-snap, only a thin scrollbar; the red "Delete Account" tab sits in the same strip as ordinary tabs | `settings_390.png`, `settings_360.png`, `settings_360_subnav_end.png` |

* Most sub-nav entries carry an external-link icon and navigate away to separate routes (`/settings/organization`, `/settings/notifications`, `/api-keys`, `/api-keys/embed`, `/webhooks`, …). Only Profile (and apparently Meetings Billing and Docs, which have no external icon) render inside the Settings shell.
* On phones:
  * `/settings/organization` has a sticky "← BACK TO SETTINGS" bar (good, `settings_org_390.png`).
  * `/api-keys` has **no back-to-settings link** (`settings_apikeys_390.png`). Since Settings is not in the phone tab bar either, the only way back is the browser Back button.
* Mobile Save button: 83×44 in the header, not sticky to the form. On long forms the user scrolls away from it (the page header scrolls with content inside the main scroller).
* Font sizes: 17–19 nodes < 12 px (10 px "IDENTITY/EMAIL/STATUS" labels).

### 3.6 /login (signed-out) and sign-up toggle

| Width | Notes | Screenshot |
|---|---|---|
| 1920 / 1440 / 1280 | Centred 414 px card; fine | `login_1920.png`, `login_1440.png`, `login_1280.png` |
| 1024×768 | Card nearly fills the height; "Back to home" at y = 14 and footer at y = 753 (tight but OK) | `login_1024.png` |
| 768 | Fine | `login_768.png` |
| 390 | Fine, no overflow | `login_390.png` |
| 360 | Fine; "Back to home" jammed at y = 9 | `login_360.png` |
| 390 sign-up | 874 px tall (scrolls 30 px); fine | `login_signup_390.png` |

* No overflow at any width. This is the most solid responsive page in scope.
* Issues:
  * **Inputs 14 px** (email, password, sign-up name/phone), so iOS zoom-on-focus (inferred).
  * Email has **no `autocomplete`**, password has **`autocomplete="off"`** (hurts password managers, which matters most on mobile), and sign-up name has no `autocomplete="name"`. Only the sign-up phone field has `autocomplete="tel"`.
  * The password placeholder is "••••••••", which looks like a pre-filled password.
* Small targets:
  * "Show password": 16×16
  * "Forgot your password?": 139×17, 11 px
  * "Don't have an account? Sign up" toggle: 216×16, 12 px
  * "Back to home": 105×16
  * footer: 10 px
* The sign-up toggle keeps the URL `/login` (no deep link to the sign-up state).

### 3.7 Marketing home `/` (signed-out)

| Width | Notes | Screenshot |
|---|---|---|
| 1920 | Fine; hero centred | `home_1920.png` |
| 1440 / 1280 | Fine | `home_1440.png`, `home_1280.png` |
| 1024 | Top nav crowded: "Build your own", "Log in" and "Get started" each wrap to 2 lines; nav grows 69 → 85 px | `home_1024.png` |
| 768 (tablet) | **Nav overflows the viewport:** the desktop link row (`div.hidden.md:flex`, 731 px) runs to x = 925. Theme toggle, "Log in" and "Get started" are off-screen; "Build your own" wraps to 3 lines. With `mobile:true` emulation Chrome expands the layout viewport to **834 px** (`innerWidth 834`), so the whole page renders zoomed out on an iPad-portrait-class device | `home_768.png` |
| 390 / 360 | Hamburger layout; good hero, full-width CTAs, no document overflow | `home_390.png` … `home_390_s6.png`, `home_360.png` |

* Breakpoints (sweep):
  * Nav links wrap at **≤ 1060** (fine at 1080).
  * Document overflow at **768–~840** (`scrollWidth 834` at 768 and 800, fits at 900).
  * Hamburger appears only at **≤ 767**.
* Mobile menu (`home_390_menu.png`):
  * Visually good: 7 links with arrows, Log in / Get started pair; body scroll locked.
  * **Escape does not close it** (`aria-expanded` stays `true`), and it is not a `role="dialog"`.
  * There is no theme toggle in the mobile menu. The toggle is only in the desktop bar, which is hidden ≤ 767.
* Nested scroll region in the demo call transcript (`div.cd-trans`, 262 px viewport / 343 px content) on phones: a scroll-within-scroll trap (`home_390_s1.png`).
* Industry carousel (`vds-track`) is a horizontal scroller at every width (intended; arrow buttons present).
* 50–52 nodes < 12 px (demo transcript labels 10 px, "Real recorded call" caption 11.5 px).

---

## 4. Findings (ranked)

### RESPONSIVE-B-01 — Phone navigation cannot reach 6 of 12 sections, and sign-out takes a primary tab (critical, ia-navigation)
* **Where:** all authenticated pages at ≤ 767 px.
* **Evidence:**
  * The bottom bar has 7 items (Assistant, Agent, Leads, Reports, Billing, Knowledge, Exit).
  * DOM reachability at 390: `/analytics`, `/flow-builder`, `/meeting-agent`, `/personal-agents`, `/rep-console`, `/settings` have links only in the hidden rail.
  * On `/analytics` or `/settings` no tab is active.
  * "Exit" (sign-out) sits in the 7th primary slot.
  * No `aria-current`, no safe-area padding.
* **Screenshots:** `analytics_390.png`, `settings_390.png`.
* **Recommendation:**
  * Use 4–5 primary tabs (e.g. Agent, Leads, Reports, Assistant) plus a "More" tab that opens a full-height sheet listing every remaining section, including Settings, Billing and Knowledge.
  * Move sign-out into that sheet (or Settings › Account) behind a confirmation.
  * Add `aria-current="page"`, a visible active state for sections reached via "More", and `padding-bottom: env(safe-area-inset-bottom)`.

### RESPONSIVE-B-02 — Desktop rail hides Billing/Knowledge/Settings on common laptop heights (high, ia-navigation)
* **Evidence:** nav scroller heights by viewport:
  * 548/572 at 1440×900 (Settings cut)
  * 448/572 at 1280×800 (3 items hidden)
  * 416/572 at 1024×768 (3 hidden)
  * 38/572 at 844×390 (11 hidden)
  * The expanded rail at 1024×768 still hides Settings.
* **Screenshots:** `analytics_1440.png`, `analytics_1280.png`, `analytics_1024.png`, `leads_landscape_844x390.png`, `sidebar_expanded_1024.png`.
* **Recommendation:**
  * Collapse the rail footer into one avatar/account menu (status, latency, theme, sign-out).
  * Reduce item pitch from 48 to 40 px, or group secondary items (Personal Agents, Rep Console, Meeting Agent) under a "More" or divider.
  * Guarantee all primary items fit at 680 px of height.
  * Below ~600 px of height (landscape phones), switch to the bottom-bar pattern even if width ≥ 768.

### RESPONSIVE-B-03 — Rail tooltips are clipped, so icon-only nav is unlabeled, and a spurious scrollbar appears (high, ia-navigation)
* **Evidence:**
  * Tooltip `div.pointer-events-none.absolute.left-full` is visible (opacity 1) at x 64–124, but the parent nav has `overflow:auto` and ends at x 63, so nothing is shown on hover (`sidebar_hover_tooltip_1280.png`).
  * The rail nav gets `scrollWidth 175 / clientWidth 44`, which draws a horizontal scrollbar under the icons at every desktop width (`analytics_1920.png`).
* **Recommendation:**
  * Render tooltips in a portal/popover layer (or use `position: fixed` computed from the anchor), or set `overflow-x: visible` and handle vertical overflow on an inner wrapper.
  * Show them on keyboard focus too.
  * Consider default-expanded labels at ≥ 1440.

### RESPONSIVE-B-04 — Analytics header actions push the whole page sideways at ≤ 552 px (high, responsive)
* **Evidence:**
  * The header action group "UPDATED hh:mm · REFRESH · CSV · EXPORT PDF" is a fixed 357 px, non-wrapping row inside the main scroller.
  * The scroller becomes `scrollWidth 543` vs `clientWidth 380` (390) / 350 (360), so all content pans horizontally by 153–193 px.
  * CSV and EXPORT PDF are off-screen on load.
* **Screenshots:** `analytics_390.png`, `analytics_360_hscrolled.png`.
* **Recommendation:**
  * Below `sm`, collapse the actions into an overflow "⋯" menu (Refresh stays as an icon button with `aria-label`).
  * Move "Updated hh:mm" under the title.
  * Add `min-width:0` and `flex-wrap` to the header, and `overflow-x: clip` on the page scroller as a safety net.

### RESPONSIVE-B-05 — Call Reports table has no mobile/tablet strategy (high, responsive)
* **Evidence:**
  * 16–18 columns, 2337–2617 px wide; horizontal scroll even at 1920 (1838 px viewport).
  * At 390 only Type/To/Started are visible; Sentiment and Summary are the 6th/7th columns.
  * No frozen first column.
  * The 10 extracted-field columns are mostly "—".
* **Screenshots:** `callreports_1920.png`, `callreports_1024.png`, `callreports_390.png`.
* **Recommendation:**
  * Reorder by priority: Started, Status, Sentiment, Duration, Summary, To; Type becomes an icon.
  * Collapse extracted fields into the details pane (or a "Fields" column picker, hidden by default).
  * Freeze the first column on ≥ 768.
  * At < 768 render each call as a card: time + duration + status chip, sentiment chip, and a 2-line summary.

### RESPONSIVE-B-06 — Call Reports gives phone users a 255–337 px data window, and call details open inside it (high, responsive)
* **Evidence:**
  * The title, KPI cards (2×2), search and filters sit outside the table scroller and never scroll away. At 360×780 that is ≈ 460 px, leaving a 255–264 px table viewport; 337 px at 390×844.
  * Tapping a row renders the `w-full sm:w-96` details pane in that same slot, so the transcript is read through a ~255 px window.
* **Screenshots:** `callreports_360_detail.png`, `callreports_360_detail_scrolled.png`.
* **Recommendation:**
  * On phones make the whole page one scroller (let header and KPIs scroll away, keep only search/filter sticky).
  * Collapse KPIs into a single horizontal summary row.
  * Open call details as a full-screen sheet with its own header, close control and sticky actions, as the Leads drawer already does.

### RESPONSIVE-B-07 — Call Reports search collapses to 52 px and sentiment pills overflow (high, responsive)
* **Evidence (sweep):**
  * Search width: 600 (1024) → 344 (768) → 224 (560) → 94 (430) → 54 (390) → 52 (360). The placeholder shows only "S".
  * At 360 the "Neutral" pill ends at x = 372 (> 360).
* **Screenshot:** `callreports_390.png`.
* **Recommendation:** below `sm`, stack search (full width) above the sentiment filter, and make the filter a segmented control or a horizontally scrollable chip row with a fade cue. Give the input `min-width: 12rem` and `flex: 1 1 100%` on wrap.

### RESPONSIVE-B-08 — Leads loses Status/Interest on phones and shows only 1–3 leads per screen (high, responsive)
* **Evidence:**
  * INTEREST is hidden at ≤ 767; STATUS column and badges are hidden below ~620 px (visible badges 25 → 1), with no substitute.
  * First row at y ≈ 590 (390×844, 3 rows visible) and y ≈ 650 (360×780, 1 row visible).
  * The cause is the stacked page header (buttons wrap to 2 rows at 360), 4 KPI cards (2×2), a 3-line keyboard-shortcut legend, search and 2 chip rows.
* **Screenshots:** `leads_390.png`, `leads_360.png`.
* **Recommendation:**
  * On phones keep the status chip in the row (under the name, next to the phone) and show interest as a small meter.
  * Hide the shortcut legend when `(pointer: coarse)`.
  * Collapse KPIs into one scrollable summary strip.
  * Move Refresh/Export/Import into an overflow menu so the header is one line; keep "New lead" as a FAB or header icon.

### RESPONSIVE-B-09 — Leads status badge renders under the INTEREST header (medium, visual)
* **Evidence:** at 1280 the STATUS header spans x 1006–1102 and INTEREST x 1118–1198, but the NEW badge sits at x 1163–1198. The Status column is visually empty at every desktop/tablet width.
* **Screenshots:** `leads_1280.png`, `leads_1024_detail.png`.
* **Recommendation:** render an explicit (possibly empty) cell per column, or use CSS grid with named template columns shared by the header and the rows. Add a visual regression test for column alignment.

### RESPONSIVE-B-10 — Leads filter rows overflow from 1024 px with no affordance; column headers are not sticky (medium, responsive)
* **Evidence:**
  * Source row overflow: 27 px at 1024, 151 at 900, 283 at 768, 549 at 390.
  * Status row overflow starts at 820.
  * Language/Outcome selects sit 540 px off-screen on phones.
  * Only the search/filter block is sticky (136 px); the LEAD/STATUS/INTEREST/CALL header row scrolls away.
* **Screenshots:** `leads_1024.png`, `leads_768.png`, `leads_1280_scrolled.png`.
* **Recommendation:**
  * At < 1280 move Source/Language/Outcome into a single "Filters" button with a sheet or popover, and keep Status as a segmented scroller with a fade.
  * Make the column header part of the sticky block on desktop.
  * Show an active-filter count badge.

### RESPONSIVE-B-11 — Icon-only Refresh/Export on Leads have no accessible name below 640 px (medium, accessibility)
* **Evidence:** at 390 the buttons are 37×25 with `aria-label` null and `title` null; their only text is `<span class="hidden sm:inline">Refresh|Export</span>`, which is `display:none`.
* **Recommendation:** add `aria-label` (and `title`), or use an `sr-only` span instead of `hidden`. Make the buttons ≥ 40×40 on touch.

### RESPONSIVE-B-12 — Knowledge file table hides Actions from 880 px down; header clips at 360 (medium, responsive)
* **Evidence:**
  * The table has a hard 691 px width. It overflows at ≤ ~880 px.
  * At 768 "Embed" is half visible and "Delete" hidden.
  * At 390 only the filename column is visible (297/691).
  * At 360 the page header overflows by 28 px and "Refresh" is cut.
* **Screenshots:** `knowledge_768.png`, `knowledge_390_s1.png`, `knowledge_360.png`.
* **Recommendation:**
  * Below 900 render each file as a row card: display name (strip the timestamp prefix), size · updated on line 2, and an actions menu (Embed, Delete) on the right.
  * Wrap the header actions or make them icon buttons with labels.
  * Replace the native file input with a styled drop zone that says "Choose file" on touch.

### RESPONSIVE-B-13 — Settings sub-nav becomes a 2300 px hidden-affordance strip on phones, and sub-pages strand the user (medium, ia-navigation)
* **Evidence:**
  * At ≤ 767 the 17 sub-sections become a horizontal strip, `scrollWidth 2300`, with no mask or snap. The destructive "Delete Account" tab is in the same strip.
  * `/api-keys` on a phone has no back link (Organization has one).
  * Settings itself is unreachable from the phone tab bar (see 01).
* **Screenshots:** `settings_390.png`, `settings_360_subnav_end.png`, `settings_apikeys_390.png`.
* **Recommendation:**
  * On phones make `/settings` an index list (grouped: Account, Workspace, Developer, Danger zone) that drills into each page with a consistent back header.
  * Keep the vertical list on ≥ 768.
  * Give every settings sub-route, including API Keys, Embed and Webhooks, the same shell and back affordance.

### RESPONSIVE-B-14 — Marketing nav overflows at tablet widths (768–840) and wraps at ≤ 1060 (medium, responsive)
* **Evidence:**
  * Desktop links are shown from `md` (768), but the row is 731 px wide, running to x = 925.
  * At 768 the theme toggle, Log in and Get started are off-screen, and document `scrollWidth` is 834.
  * With mobile emulation the layout viewport widens to 834 px (page zoomed out).
  * At ≤ 1060 "Build your own", "Log in" and "Get started" wrap to 2 lines (nav 85–91 px tall).
* **Screenshots:** `home_768.png`, `home_1024.png`.
* **Recommendation:** switch to the hamburger below `lg` (1024), or better below 1100. Keep Log in / Get started visible next to the hamburger on tablets. Add `whitespace-nowrap` to nav items.

### RESPONSIVE-B-15 — Sentiment chart distorts: 4.8 px labels on phones, stretched text on desktop (medium, visual)
* **Evidence:** SVG `viewBox 800×220` at fixed 240 px height. At 390 it is 325×240 and tick labels render 4.8 px tall; at 1440 it is 1166×240 and labels are 13.6 px but horizontally stretched 1.46×.
* **Screenshots:** `analytics_390_s1.png`, `analytics_768_s1.png`.
* **Recommendation:**
  * Render the chart at the measured container width (ResizeObserver) with HTML/CSS-sized tick labels (≥ 11 px), or use `preserveAspectRatio="xMidYMid meet"` and draw axis text outside the scaled group.
  * Reduce tick density on narrow widths.

### RESPONSIVE-B-16 — Pervasive sub-12 px type, unchanged on phones (medium, accessibility)
* **Evidence (text nodes < 12 px):**
  * Analytics: 143 at desktop (8 px ×5, 9 px ×57, 10 px ×51, 11 px ×30), 120 at 390 (KPI labels and trend chips 9 px).
  * Leads: 170 at desktop, 113 at 390 (KPI labels 9 px, chips 10 px).
  * Call Reports: 149–151 at 11 px.
  * Bottom tab labels: 11 px.
  * Login footnotes: 10–11 px.
  * The letter-spaced uppercase mono style makes 9–10 px even harder to read.
* **Recommendation:** set a floor of 12 px for any text (13 px for uppercase-tracked labels) and 14–16 px for body/data. Bump label sizes one step at `pointer: coarse`.

### RESPONSIVE-B-17 — Touch targets well below 44 px (medium, accessibility)
* **Evidence (390 px):**
  * Leads: 77/84 interactive < 44 px, 26 < 24 px. Chips are 25 px tall; checkbox label 20×20; call button 32×32; icon buttons 37×25.
  * Analytics period toggle: 36×24 / 44×24.
  * Wallet Dismiss: 22×22.
  * Login: Show password 16×16, Forgot password 17 px tall, Sign-up toggle 16 px tall, Back to home 16 px tall.
* **Recommendation:** at `pointer: coarse`, set a minimum hit area of 44×44 (extend with padding or `::after` for chips, checkboxes and inline links). Separate the per-row Call button from the row tap area by ≥ 8 px, or place it behind a swipe/secondary action to avoid accidental calls.

### RESPONSIVE-B-18 — Persistent chrome eats 25 %+ of phone height (medium, ux)
* **Evidence:** wallet banner 58 px (390) / 77 px (360); sticky page header up to 69 px; tab bar 56 px. That is ≈ 200 px of 780 at 360×780, and on Leads plus the 136 px sticky filter block, ≈ 330 px.
* **Screenshots:** `analytics_360.png`, `leads_390_scrolled.png`.
* **Recommendation:** on phones render the wallet warning as a one-line, dismiss-for-session pill (or fold it into the header as a badge), and let page headers collapse on scroll.

### RESPONSIVE-B-19 — Form fields trigger iOS zoom and block password managers (low, content)
* **Evidence:**
  * All inputs checked are 14 px: New lead modal, login, sign-up, search fields.
  * Login email has no `autocomplete`; password has `autocomplete="off"`; New-lead fields have no `autocomplete`/`inputmode`.
* **Recommendation:** 16 px input text at ≤ 767 px (or `font-size: max(16px, 1em)`). Use `autocomplete="email"`, `"current-password"` / `"new-password"`, `"name"`, `"tel"`, and `inputmode="tel"` on phone fields.

### RESPONSIVE-B-20 — Phone drawer and modal layering and semantics (low, accessibility)
* **Evidence:**
  * The Lead drawer (z-40, full-screen at 390) sits under the tab bar (z-50), and its last 56 px are covered (`padding-bottom:0`).
  * The drawer and the New-lead/Import overlays have no `role="dialog"`/`aria-modal`.
  * The marketing mobile menu ignores Escape (`aria-expanded` stays `true`).
* **Screenshots:** `leads_390_drawer_bottom.png`, `home_390_menu.png`.
* **Recommendation:** raise sheets above the tab bar, or hide the bar while a sheet is open. Add bottom padding of 56 px + safe-area. Use an accessible dialog primitive (focus trap, Escape, `aria-modal`, return focus).

### RESPONSIVE-B-21 — Wide-screen alignment: Leads rows stretch to 1838 px while other pages cap content but not headers (low, visual)
* **Evidence:**
  * At 1920 on Leads, the name is at x 188 and status/call at x ≈ 1800–1885.
  * On Knowledge, header actions float at x 1620–1895 while content ends at 1566.
  * On Settings, Save Changes is at x 1755–1895 while the form ends at 1390, with a 520 px gap between sub-nav and form.
* **Screenshots:** `leads_1920.png`, `knowledge_1920.png`, `settings_1920.png`.
* **Recommendation:**
  * Adopt one page container rule (e.g. max-width 1440 for data pages, 960 for forms) and apply it to both the page header and the content.
  * For Leads, use a denser multi-column row (status, interest, last call, source, city) or a max-width list with a detail pane.
  * Put the Settings Save action in a sticky footer bar attached to the form.

### RESPONSIVE-B-22 — Analytics mobile truncation and dropped columns (low, content)
* **Evidence:**
  * At 390, flow step names are truncated to ~9 characters (span cw 92 / sw 184).
  * At 768, intent names are truncated ("Appointment …").
  * At 390, the Recent calls list drops Started/Duration/End/Sentiment entirely.
* **Screenshots:** `analytics_390_s2.png`, `analytics_390_s4.png`, `analytics_768_s2.png`.
* **Recommendation:**
  * Let names wrap to 2 lines and move metrics onto a second line on phones.
  * Render Recent calls as cards: time · duration, then a status and sentiment chip row.

### RESPONSIVE-B-23 — Touch-irrelevant UI and copy on phones (low, content)
* **Evidence:**
  * The keyboard-shortcut legend (Leads) is shown with `pointer: coarse` and takes 45–70 px.
  * The Import modal says "Drop or click to choose".
  * The marketing demo transcript is a nested 262 px scroller inside the page.
  * There is no theme toggle in the mobile marketing menu.
* **Recommendation:**
  * Gate shortcut hints behind `(hover: hover) and (pointer: fine)`.
  * Use touch copy ("Tap to choose a file").
  * Let the demo transcript auto-advance or expand instead of nesting scroll.
  * Add the theme toggle to the mobile menu.

---

## 5. Exact break widths (summary)

| Component | Breaks at |
|---|---|
| App shell rail → bottom bar | ≤ 767 (bottom bar missing 6 sections) |
| Rail items hidden | viewport height < ~925 px (any width ≥ 768) |
| Analytics header actions overflow / page pans sideways | ≤ 552 |
| Analytics sentiment chart labels unreadable | ≤ ~600 (4.8 px at 390) |
| Leads source filter row overflow | ≤ 1024 |
| Leads status filter row overflow | ≤ 820 |
| Leads INTEREST column hidden | ≤ 767 |
| Leads STATUS column/badges hidden | < ~620 (between 640 and 600) |
| Leads Refresh/Export lose labels and accessible names | < 640 |
| Call Reports table horizontal scroll | every width (incl. 1920) |
| Call Reports search < 200 px | ≤ ~540 (52 px at 360) |
| Call Reports sentiment pills overflow viewport | ≤ ~372 (360) |
| Knowledge file table clips Actions | ≤ ~880 |
| Knowledge header overflows | ≤ ~388 (360) |
| Settings sub-nav becomes 2300 px strip | ≤ 767 |
| Marketing nav wraps | ≤ 1060 |
| Marketing page horizontal overflow | 768 – ~840 |
| Login | no break found 360–1920 |

---

## 6. Strengths worth preserving

* **No document-level horizontal overflow on any authenticated page at any tested width** (`documentElement.scrollWidth == innerWidth` everywhere). Overflow is always contained in an inner scroller, which is a good base to build on.
* A clean, single `md` breakpoint for the shell, and the phone tab bar targets are generous (56×55).
* Sticky patterns already exist: Call Reports `thead` is `position: sticky`, and the Leads search/filter block is sticky.
* The Leads New-lead and Import modals fit 390 px well (358 px card, 40–44 px fields, reachable actions, Escape closes).
* The lead detail becomes a full-screen panel on phones and a 440 px side panel on desktop, which is the right pattern and should be reused for Call details.
* Analytics KPI grid reflows 4 → 2×2 at 768 and the identity card stacks at 390. Content max-width on Analytics/Knowledge/Settings keeps line lengths sane at 1920.
* `/login` and sign-up are clean from 360 to 1920 with full-width 43–44 px controls.
* The marketing home phone layout is solid: 40×40 hamburger, full-width CTAs, scroll-locked menu, no overflow at 390/360.
* `/settings/organization` has a sticky "Back to settings" bar on phones, a good pattern to apply to every settings sub-route.

## 7. Open questions / not verified

* Whether the "Exit" tab (sign-out) asks for confirmation. Not clicked, for safety.
* Real iOS behaviour (zoom-on-focus with 14 px inputs, safe-area overlap of the tab bar, overlay scrollbars) is inferred from CSS; it was not tested on a device.
* The Analytics Intents section showed "LOADING / 0 calls analysed" in two phone captures but loaded (97 calls) at 768. This may be lazy loading triggered on scroll-into-view, so it was not reported as a bug.
* The wallet banner's Dismiss was not tested for persistence (it may re-appear on every page).
* Dark mode was not in scope for this pass.
