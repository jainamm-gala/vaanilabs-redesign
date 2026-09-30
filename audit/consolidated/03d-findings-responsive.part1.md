## 3D. Findings — Responsive behaviour

**Test conditions.** Pages were measured at 1920x1080, 1440x900, 1280x800 and 1024x768 (desktop, mouse), 768x1024 (tablet, touch), and 390x844 and 360x780 (phone, touch). Width sweeps down to 320px pinned exact break widths (RESPONSIVE-A, RESPONSIVE-B). Two extra checks: a 720x450 approximation of 200% zoom on a 1440x900 screen (A11Y-MANUAL), and 390x844 checks of the marketing site (PUBLIC-SITE). Screenshots are 1x. Where a finding says iOS zoom-on-focus, safe-area overlap or touch-pan behaviour, that was inferred and not tested on a real device.

**What already works.**
- No app page overflows at document level at any tested width: `documentElement.scrollWidth == innerWidth` in more than 42 page x width combinations.
- The shell has one clean `md` (768) breakpoint.
- /billing and /login reflow cleanly from 1920 down to 360.
- Flow Builder has a real phone mode.
- The Leads drawer becomes a full-screen panel on phones.

Every overflow we found sits inside an inner `overflow-y-auto` scroller. That is why several controls below are technically "reachable by panning sideways" but are effectively invisible on touch devices, where scrollbars are hidden overlays.

### Page x breakpoint matrix

Key:
- **OK:** no defect recorded.
- **minor:** a cosmetic defect or reduced efficiency; the task still completes normally.
- **broken:** a primary control, data column, panel or destination is cut off, overlapped or removed, or can only be reached by panning sideways inside an inner scroller or by typing a URL.

| Page | 1920 | 1440 | 1280 | 1024 | 768 | 390 | 360 | Findings |
|---|---|---|---|---|---|---|---|---|
| App shell (rail / bottom bar) | minor | minor | **broken**¹ | **broken**¹ | minor | **broken** | **broken** | F-RWD-001, F-RWD-005 |
| Wallet banner (all app pages) | OK | OK | OK | OK | OK | minor | minor | F-RWD-013 |
| /dashboard (Agent Cockpit) | minor | minor | minor | **broken**¹ | **broken** | **broken** | **broken** | F-RWD-002 |
| /assistant | minor | OK | OK | OK | OK | minor | minor | F-RWD-015 |
| /flow-builder | minor | minor | minor | minor | **broken** | minor | minor | F-RWD-003, F-RWD-014 |
| /meeting-agent | minor | OK | OK | OK | minor | **broken** | **broken** | F-RWD-006 |
| /personal-agents | OK | OK | OK | OK | minor | **broken** | **broken** | F-RWD-007 |
| /billing | OK | OK | OK | OK | OK | OK | OK | banner only |
| /analytics | OK | OK | OK | minor | minor | **broken** | **broken** | F-RWD-008 |
| /leads | minor | minor | minor | minor | minor | **broken** | **broken** | F-RWD-011, F-RWD-012 |
| /call-reports | minor | minor | minor | minor | minor | **broken** | **broken** | F-RWD-004, F-RWD-009, F-RWD-010 |
| /knowledge | minor | OK | OK | minor | **broken** | **broken** | **broken** | F-RWD-016 |
| /settings | minor | OK | OK | minor | OK | **broken**² | **broken**² | F-RWD-001 |
| /login (signed out) | OK | OK | OK | OK | OK | minor | minor | F-RWD-018 |
| / (marketing home) | OK | OK | OK | minor | **broken** | minor | minor | F-RWD-017, F-RWD-018 |
| /onboarding | — | minor | — | — | — | — | — | F-RWD-019 |

¹ Depends on viewport height. The 1280 and 1024 columns were tested at 1280x800 and 1024x768. At 768px tall or less, the rail hides Billing, Knowledge and Settings, and the Cockpit's centre stack collides with the Transcript panel. At 1440x900 only Settings is cut, and only by half.
² Settings cannot be reached from the phone navigation at all. Its sub-nav also becomes a 2,300px horizontal strip (RESPONSIVE-B-13, reported in another section).
"—" means not tested. /rep-console was not included in the breakpoint sweeps.

**Recurring causes.** Fixing each cause once fixes several findings.
1. **Flex rows that do not wrap and lack `min-width:0`, inside inner scrollers.** Affects the Meeting Agent column (F-RWD-006), Personal Agents header (F-RWD-007), Analytics header (F-RWD-008), Knowledge header (F-RWD-016) and Flow Builder toolbar (F-RWD-003).
2. **Content hidden at a breakpoint (`hidden md:*` / `hidden lg:*`) with nothing to replace it.** Affects Cockpit Customer Intel, flow and session status (F-RWD-002), Leads Status and Interest (F-RWD-011), and the phone navigation destinations (F-RWD-001).
3. **`h-screen` shells where the title, KPIs and filters never scroll away**, leaving a small inner data window. Affects Call Reports (F-RWD-004), Assistant (F-RWD-015) and the Cockpit on short viewports (F-RWD-002).
4. **Layout decided once at load instead of reacting to resize.** Affects the Flow Builder toolbar mode and React Flow `fitView` (F-RWD-003, F-RWD-014).

---

### F-RWD-001 — Phone and 200%-zoom navigation reaches only 6 of 12 sections, and sign-out ("Exit") takes a primary tab
- **Severity:** high · **Confidence:** verified
- **Source findings:** EXPLORE-CORE-06, EXPLORE-SETTINGS-08, A11Y-MANUAL-12 (navigation part), EXPLORE-DATA-16 (navigation part), A11Y-AUTO-23
- **Pages:** every authenticated route at 767px wide or less (tested at 390, 360 and 320), and at 720x450 (200% zoom of 1440x900)
- **Evidence:**
  - At 767px and below, the 72px rail (`aside.fixed`) is `display:none`. The only navigation left is `nav.fixed.bottom-0` (56px tall, z-50), with 7 items of 51–56x55px and 11px labels:
    - Assistant
    - Agent (/dashboard)
    - Leads
    - Reports (/call-reports)
    - Billing
    - Knowledge
    - Exit (the sign-out submit button)
  - Nothing on the page links to /analytics, /flow-builder, /meeting-agent, /personal-agents, /rep-console or /settings.
  - There is no hamburger or "More" control. A search of aria-label and title for menu, navigation, drawer or expand found nothing.
  - The verifier re-checked at 720x450: the only visible nav links are the same 6 routes plus Exit.
  - Settings (profile, calling number, API keys, security, delete account) can therefore only be reached by typing its URL. /api-keys has no back link on phones.
  - Exit sits 0px from Knowledge and has no aria-label. No confirmation step was observed (the button was not clicked).
  - No tab has `aria-current`. On /analytics or /settings, no tab is highlighted at all.
  - The bar has no `env(safe-area-inset-bottom)` padding.
  - At 720x450, the banner (42px) and the bar (56px) together take 98 of 450px, which is 22% of the height.
  - The same defect is recorded as RESPONSIVE-A-01 and RESPONSIVE-B-01. Both responsive auditors rated it critical. It is reported in the navigation section.
- **Screenshots:** audit/screenshots/va-responsive-a/dashboard_390.png, audit/screenshots/va-responsive-a/billing_390.png, audit/screenshots/va-responsive-b/analytics_390.png, audit/screenshots/va-responsive-b/settings_390.png, audit/screenshots/va-explore-core/dashboard_mobile.png, audit/screenshots/va-explore-settings/c21_mobile_settings.png, audit/screenshots/va-a11y-auto/reflow320-dashboard.png, audit/screenshots/va-a11y-auto/mobile390-leads.png, audit/screenshots/va-verify-a11y-manual/72-zoom200-dashboard.png
- **Recommendation:**
  - Replace the 7-item bar with 4 primary tabs (Agent, Leads, Reports, Assistant) plus a "More" tab.
  - "More" opens a full-height bottom sheet that lists every other destination, grouped as in the desktop rail: Knowledge, Billing, Analytics, Flow Builder, Meeting Agent, Personal Agents, Rep Console and Settings.
  - End the sheet with an account block that holds "Sign out", visually separated and behind a confirm dialog.
  - Set `aria-current="page"` on the active tab, and highlight "More" when the current route lives inside it.
  - Label the landmark (`aria-label="Primary"`) and add `padding-bottom: env(safe-area-inset-bottom)`.
  - Render sheets and drawers above the bar (z-index above 50).
  - If some sections are meant to be desktop-only, still list them in the sheet with a "Best on desktop" note instead of hiding them.

### F-RWD-002 — Agent Cockpit removes Customer Intel, flow and session status at narrower widths, and its fixed-height stack overlaps controls on short viewports with no way to scroll
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-12 (Cockpit part), RESPONSIVE-A-04, EXPLORE-CORE-22, EXPLORE-CORE-06 (Cockpit part)
- **Pages:** /dashboard
- **Evidence:**
  - **Panels removed (verified):**
    - The Customer Intel panel shows at 1024x768 and is gone at 1023. No toggle, tab or drawer brings it back.
    - SESSION status also disappears below 1024.
    - The FLOW label and selector show at 768 and are gone at 767.
    - At 390 the header shows only IDLE and 00:00. The only controls are Vaani, Vikash, the phone input, Test Call and CONNECT, so an operator can place a call without seeing which flow or customer context is loaded.
    - At 720x450 the Intel text is still in the DOM but hidden.
  - **Collisions on short viewports:**
    - At 1024x768, CONNECT (126x39, y≈493–531) straddles the Transcript Feed header (y≈513–515), and the page header clips the top of the orb.
    - At 1100x700, CONNECT (y 480–519) sits entirely inside the transcript panel, whose header is at y=458. At 1100x800 nothing overlaps.
    - At 720x450 (verified): the Transcript Feed overlaps the phone field and Test Call, and CONNECT covers "Awaiting connection…".
    - At 720x450, `main` has scrollHeight = clientHeight = 450 and the document is 450px, so the overlapped controls cannot be scrolled clear. This fails WCAG 1.4.10 (Reflow).
  - **Cause:** the centre stack has a fixed height (312px orb, STANDBY, toggle, input, CONNECT), and the transcript panel takes a fixed share, all inside a non-scrolling `h-screen` shell. The collision is also recorded as RESPONSIVE-A-05 in another section.
  - **Severity basis:** A11Y-MANUAL-12 was verified as high because of the overlap under zoom. The panel-removal part (RESPONSIVE-A-04) was verified but lowered to medium on its own, because calling still works.
- **Screenshots:** audit/screenshots/va-verify-a11y-manual/72-zoom200-dashboard.png, audit/screenshots/va-explore-core/dashboard_1024x768.png, audit/screenshots/va-responsive-a/dashboard_1100x700.png, audit/screenshots/va-verify-responsive-a/dashboard_768.png, audit/screenshots/va-verify-responsive-a/dashboard_767.png, audit/screenshots/va-verify-responsive-a/dashboard_390.png
- **Recommendation:**
  - Rebuild the centre column as a flex column (`display:flex; flex-direction:column`):
    - size the orb with `height: clamp(120px, 30vh, 312px)`;
    - keep the controls in normal flow;
    - give the transcript `flex:1; min-height:0; overflow-y:auto`.
  - Give `main` `overflow-y:auto`, so a short viewport scrolls instead of overlapping.
  - Below 1024, show Call, Customer and Transcript as segmented tabs, or make Customer a collapsible section. Keep the Intel form mounted; never remove it.
  - At every width, show the selected flow as a compact tappable chip next to the title, plus a one-word session state (IDLE or LIVE).
  - Add 720x450, 1024x768 and 320x640 to visual regression tests.

### F-RWD-003 — Flow Builder toolbar clips ACTIVATE off-screen between 768 and 877px, and nothing else reaches it
- **Severity:** high · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-08
- **Pages:** /flow-builder
- **Evidence:**
  - Between 1000 and 768px wide, the toolbar keeps a fixed geometry. At every width in that range, Save sits at x=680–763 and ACTIVATE at x=771–876.
  - The clipping ancestor `div.flex.min-h-0.flex-1.flex-col.overflow-hidden` has `overflow-x:hidden` (scrollWidth 804 vs clientWidth 728 at 800), so the user cannot scroll to the button.
  - ACTIVATE is fully visible at 878px and wider, partly clipped at 860, and fully hidden at 800 and 768 (verified).
  - At 1000px and below, AI draft and Settings shrink to 39x40 icon buttons.
  - The "More actions" menu holds only Export JSON, Import JSON, New flow and Reset to default. It has no Activate.
  - The affected range covers common iPad portrait widths: 768, 810, 820 and 834.
  - Verifier side note: after a live resize to 767, the phone toolbar did not appear, and ACTIVATE (x 699–804) stayed clipped. The phone layout only applies on a fresh load.
- **Screenshots:** audit/screenshots/va-verify-responsive-a/flow-builder_768.png, audit/screenshots/va-verify-responsive-a/flow-builder_860.png, audit/screenshots/va-verify-responsive-a/flow-builder_800_moremenu.png, audit/screenshots/va-responsive-a/flow-builder_768.png
- **Recommendation:**
  - Put Save and ACTIVATE in their own right-aligned group with `flex-shrink:0` (e.g. `ml-auto shrink-0`).
  - Let the left group shrink (`min-width:0; overflow:hidden`), or move copy, paste, validate, preview, full-screen and shortcuts into the "…" menu below 1024. The phone layout already does this.
  - Add Activate and Save to the overflow menu as a fallback.
  - Drive the switch between desktop, tablet and phone toolbars from CSS breakpoints or a `matchMedia` change listener, not a check at load.

### F-RWD-004 — Call Reports leaves a 255–337px strip for data on phones, and call details open inside that strip
- **Severity:** high · **Confidence:** verified
- **Source findings:** RESPONSIVE-B-06
- **Pages:** /call-reports
- **Evidence:**
  - The title, Refresh/Export CSV, the four KPI cards (2x2), the search and the sentiment filters all sit outside the table's scroller and never scroll away. At 360x780 they take about 460px.
  - Table viewport (verified): top at 443px with clientHeight 337 at 390x844, and top at 461px with clientHeight 255 at 360x780.
  - Rows are 63px tall, so about 3 are visible at a time.
  - Tapping a row at 360 opens the `w-full sm:w-96 … overflow-y-auto` details pane in the same slot: top 461, height 255, `position:static`, scrollHeight 1027.
  - That pane holds Call Details, Analysis, Recording and Transcript, so the transcript is read through a 255px window.
  - A sweep at 800px viewport height gives a 491px data window at 768 wide and above, but only 283px at 560 and below.
  - On desktop the same pane is a sensible 384px right-hand column.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/callreports_360.png, audit/screenshots/va-verify-responsive-b/callreports_360_detail.png, audit/screenshots/va-responsive-b/callreports_390.png, audit/screenshots/va-responsive-b/callreports_360_detail_scrolled.png
- **Recommendation:**
  - Below 768, make the page one scroller: the header and KPIs scroll away, and only search and filters stay `position:sticky`.
  - Collapse the KPIs into one summary row that scrolls horizontally.
  - Open call details as a full-screen sheet (`fixed inset-0`, above the tab bar) with its own header, a close button and sticky Recording controls.
  - Reuse the Leads drawer for this; it already goes full-screen at 390.

### F-RWD-005 — Desktop rail hides Billing, Knowledge and Settings at common laptop heights, and draws a stray horizontal scrollbar
- **Severity:** high · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-04
- **Pages:** every authenticated route at 768px wide or more, when the viewport is under about 925px tall
- **Evidence:**
  - The rail `nav` content is 572px tall (12 items at a 48px pitch), and a stacked footer (status dot, latency, Sign Out, theme, Expand) reserves about 250px.
  - Visible nav height (clientHeight) by viewport:

    | Viewport | clientHeight | What is hidden |
    |---|---|---|
    | 1440x900 | 548px | Settings half cut |
    | 1280x800 | 448px | Billing, Knowledge, Settings |
    | 1366x768 and 1024x768 | 416px (156px overflow) | Call Reports partly; Billing, Knowledge, Settings |
    | 1280x720 | ≈368px | 5 of 12 items (only 7 fully visible) |
    | 844x390 (landscape phone) | 38px | everything except Assistant |

  - Expanding the rail to 240px at 1024x768 still leaves Settings below the fold.
  - On /billing at 1024x768, the active item is scrolled out of view.
  - The nav is `overflow:auto` on both axes. Its clipped hover tooltips give it scrollWidth 175 against clientWidth 44, so Windows draws a ◀▶ scrollbar over the lower icons at every desktop width.
  - Three agents measured the same numbers. The issue is also recorded as RESPONSIVE-A-07 and RESPONSIVE-B-02 (height) and as RESPONSIVE-A-06 and RESPONSIVE-B-03 (tooltips and scrollbar), in the navigation section.
- **Screenshots:** audit/screenshots/va-explore-core/live_dashboard.png, audit/screenshots/va-explore-core/dashboard_1366x768.png, audit/screenshots/va-explore-core/dashboard_1024x768.png, audit/screenshots/va-responsive-b/analytics_1280.png, audit/screenshots/va-responsive-b/sidebar_expanded_1024.png, audit/screenshots/va-responsive-b/leads_landscape_844x390.png, audit/screenshots/va-responsive-a/billing_1024.png
- **Recommendation:**
  - Collapse the footer into one avatar/account button whose menu holds status, latency, theme and sign-out. This frees about 200px.
  - Reduce the item pitch to 40px under `(max-height: 800px)`.
  - Set `overflow-x:hidden` on the nav and render tooltips in a portal, so they no longer widen it.
  - After load, call `scrollIntoView({block:'nearest'})` on the active item.
  - Make sure all 12 items fit at 680px of viewport height; test at 1366x768 and 1280x720.
  - Below about 600px of height, use the phone bottom-bar and "More" pattern even when the width is 768 or more.
