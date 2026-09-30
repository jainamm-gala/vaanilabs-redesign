# Responsive Audit A: Vaani Labs app (Agent Cockpit, Assistant, Flow Builder, Meeting Agent, Personal Agents, Billing)

Auditor: va-responsive-a. Date: 2026-09-26. Target: live production app at https://vaanilabs.in (signed-in customer account, wallet at Rs 0).
Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-responsive-a/` (65 files, named `<page>_<width>.png`, plus `_full`, `_rooms`, `_scrolled` and interaction variants).

The session stayed signed in for the whole run. No LOGGED_OUT state occurred, and no credentials were typed at any point.

---

## 1. Method

- **Browser:** a private window driven through Playwright, with a read-only network guard. Every non-GET request was aborted, along with websockets, posthog and razorpay. Nothing was saved, published, activated, paid or sent.
- **Widths:**
  - Desktop, at 1920x1080, 1440x900, 1280x800 and 1024x768. These used a normal desktop user agent, no touch and classic Windows scrollbars.
  - Tablet at 768x1024 and mobile at 390x844 and 360x780. These used CDP touch emulation (`pointer: coarse` confirmed true), an Android Chrome user agent and `Emulation.setScrollbarsHidden` to get overlay-style scrollbars. The page was reloaded after emulation was set, so UA and touch detection ran at load.
  - Extra probes: 1366x768, 1280x720 and 1100x700, plus width sweeps (1440 down to 320) to find exact breakpoints.
- **Caveat:** Playwright's own emulation session overrides a second CDP `setDeviceMetricsOverride`. As a result, DPR stayed 1 and the `mobile: true` flag (viewport-meta scaling, text autosizing) could not be applied. Layout widths are exact, because the page has `width=device-width, initial-scale=1`, so CSS breakpoints behave as on a device. Screenshots are 1x.
- **Probe script, run per page x width:**
  - Document `scrollWidth` vs `innerWidth`.
  - Every element whose rect runs past `innerWidth + 1` (or left of `-1`), reduced to overflow roots, plus the nearest clipping ancestor.
  - Text clipped horizontally (`scrollWidth > clientWidth`) or vertically (`overflow:hidden`, line-clamp).
  - Pairwise overlap of visible interactive elements and headings, flagged when the intersection is over 20% of the smaller element.
  - Interactive elements under 44x44.
  - Fixed and sticky elements with their viewport coverage.
  - Nav and aside visibility and in-view link counts.
  - Wallet banner height and line count.
  - Text nodes under 12px.
  - Inner scroll containers.
- **Visual review:** I opened and read every screenshot. Visual judgements in this report come from those screenshots.

---

## 2. App shell breakpoints (applies to all six pages)

| Viewport | Navigation | Notes |
|---|---|---|
| >= 768px wide | Fixed 72px icon rail (`aside.fixed.left-0.top-0.z-50`). It has a scrollable `nav` with 12 icon links and a footer: status dot, latency, Sign Out, theme, Expand. | Labels are only in hover tooltips, and those are clipped (see RESPONSIVE-A-06). The "Expand sidebar" button pushes content by 240px and adds no overlay. |
| <= 767px wide | The rail is `display:none`. A fixed bottom tab bar (`nav.fixed.bottom-0`, 56px, z-50) shows 7 items: Assistant, Agent, Leads, Reports, Billing, Knowledge, Exit. | Items are 51x55px with 11px labels. Six destinations are missing (RESPONSIVE-A-01). |

How many rail items are fully visible depends on viewport **height**, because the footer cluster takes about 250px. Item pitch is 48px, measured as `nav` clientHeight vs scrollHeight (572px):

| Viewport height | nav visible height | Items fully visible (of 12) | Hidden without scrolling the rail |
|---|---|---|---|
| 1080 | 728-738 | 12 | none |
| 1024 (tablet portrait) | 682 | 12 | none |
| 900 (1440x900) | 548 | 11 | Settings |
| 800 (1280x800) | 448 | 9 | Billing, Knowledge, Settings |
| 768 (1024x768) | 416 | 8 | Call Reports (partly), Billing, Knowledge, Settings. On /billing the *active* item is out of view. |
| 720 (1280x720) | ~368 | 7 | Call Reports, Billing, Knowledge, Settings, and Rep Console partly |

---

## 3. Page x width matrix (summary)

Key: OK = no defect found; the other entries name the defect. "Doc overflow" was **false on every page at every width**: document `scrollWidth == innerWidth` everywhere. All horizontal overflow is inside inner scroll containers.

| Page | 1920 | 1440 | 1280 | 1024 | 768 (touch) | 390 (touch) | 360 (touch) |
|---|---|---|---|---|---|---|---|
| /dashboard | Very wide empty center; "Test Call" wraps | Settings hidden in rail; "Test Call" wraps | 3-col; flow name cut without ellipsis | **CONNECT overlaps Transcript panel; orb clipped** (at <= 768 tall) | **Customer Intel panel gone**; SESSION hidden | Intel, flow selector, LAT and SESSION all hidden; banner 2 lines | Banner 3 lines (77px) |
| /assistant | Composer 1278px wide | OK | OK | Plan panel stacks under composer | OK | Chat area 345px; chips cut; placeholder clipped | Chat area **241px**; chips cut |
| /flow-builder | Palette labels truncated | Same | Same; after a resize, graph not re-fitted | Canvas 41%; 3/26 nodes in view after resize | **ACTIVATE clipped off-screen**; canvas 40% | Mobile layout OK; badge over Start node; controls over nodes | Canvas 334x396; 8 nodes in view |
| /meeting-agent | Form inputs 1125px wide | OK | OK | OK (single column starts < 1024) | OK; room buttons 32px tall | **Content 99px wider than screen**: CTA, segmented control and room controls cut or overlapping | Same, 105px overflow |
| /personal-agents | OK (centred) | OK | OK | OK | NEW TASK wraps to 2 lines | **Header squeezed; NEW TASK off-screen** | Same |
| /billing | OK | OK | OK (active rail item hidden at 768 tall) | OK | OK | OK (best mobile page) | OK |

---

## 4. Findings

### RESPONSIVE-A-01: Mobile bottom bar reaches only 6 of 12 destinations, with no "More" menu. Settings, Flow Builder, Meeting Agent, Personal Agents, Analytics and Rep Console are unreachable. **Critical**

- **Width:** every width <= 767px (tested at 767, 640, 390, 360).
- **Evidence:**
  - At <= 767 the rail (`aside.fixed`, 16 links) is `display:none`.
  - The only navigation is `nav.fixed.bottom-0` (y=788 at 390x844, 56px tall) with 7 items, measured as w x h:

    | Item | Size |
    |---|---|
    | Assistant (/assistant) | 51x55 |
    | Agent (/dashboard) | 51x55 |
    | Leads (/leads) | 51x55 |
    | Reports (/call-reports) | 51x55 |
    | Billing (/billing) | 51x55 |
    | Knowledge (/knowledge) | 55x55 |
    | Exit (button, sign-out) | 51x55 |
  - No hamburger, menu or "more" button exists: the probe searched aria-label and title for /menu|navigation|sidebar|drawer|expand/ and found none.
  - On /billing at 360 the full set of visible `a[href]` was the 6 tab routes plus two in-page anchors (`/settings#wallet`, `/settings#autopay`).
  - So on a phone there is no navigation path to /analytics, /flow-builder, /meeting-agent, /personal-agents, /rep-console or /settings (profile, calling number, API keys and so on).
  - Yet /flow-builder, /meeting-agent and /personal-agents all render mobile layouts when opened by URL, so the product half-supports them.
- **Screenshots:** `dashboard_390.png`, `dashboard_360.png`, `billing_390.png`.
- **Recommendation:** Replace "Exit" with a "More" tab that opens a bottom sheet listing all 12 destinations, grouped the same way as the desktop rail, with Sign out last and separated. Alternatively, add a header hamburger that opens the full rail as a drawer. Keep the five most-used tabs; the analytics data suggests Assistant, Agent, Leads, Reports, More.

### RESPONSIVE-A-02: Meeting Agent content is wider than the screen below 513px, so the primary CTA, form controls and room controls are cut off or overlapping. **High**

- **Width:** breaks at <= 512px viewport, measured by sweep:
  - At 500 the scroller has sw=cw=500.
  - At 480, sw=489 > cw=480.
  - From 390 to 320 the main column is fixed at **465px**. Content overflows by 99px at 390, 105px at 375 and 129px at 360.
- **Evidence:**
  - `div.lg:col-span-2.space-y-6` holds l=24 and r=489 at 390px. The scroller `div.flex-1.overflow-y-auto.p-6.md:p-8` has scrollWidth 489 vs clientWidth 390, so content scrolls sideways inside the page.
  - Cause: past-meeting rows use `white-space:nowrap` meeting URLs (274px each) and titles (202px) with no `min-w-0` or truncation, which sets the column's min-content width. The active-room URL *is* truncated (78px with ellipsis), but past-meeting URLs are not.
- **Visible consequences at 390 and 360:**
  - The Session Mode segmented control's "Conversation flow" half is cut off.
  - The "Open meeting" and "Encrypted meeting" descriptions are cut mid-sentence.
  - The Conversation Flow label is cut.
  - The right edge of **Create Room** is cut.
  - The "Refresh" link is off-screen.
  - In the Active Rooms card, the Agent button overlaps the "Open" and "1 participant" metadata. Intel is partially visible and Record plus the red stop/delete button are off-screen.
  - Past-meeting dates are cut off.
  - The page title wraps to 3 lines ("Meeting / Agent — / Vikash") because the icon and the "Free minutes" pill share its row.
- **Screenshots:** `meeting-agent_390.png`, `meeting-agent_390_rooms.png`, `meeting-agent_360.png`, `meeting-agent_360_rooms.png`.
- **Recommendation:**
  - Add `min-width:0` to the flex and grid children.
  - Truncate every meeting URL (`truncate` plus copy button), or wrap them with `overflow-wrap:anywhere`.
  - Stack room metadata above the room action buttons below 640px, and turn the buttons into a full-width 2x2 grid of 44px buttons, with the destructive stop button separated.
  - Move the "Free minutes" pill below the title on mobile.

### RESPONSIVE-A-03: Personal Agents header never wraps, so "New task", the page's only primary CTA, is pushed off-screen on phones. **High**

- **Width:**
  - The NEW TASK button wraps to two lines (50px tall) from 768 down.
  - Its right edge passes the viewport below ~440px: right=438 at 440, then off-screen at 414, 390 and 360.
  - `main.overflow-y-auto` gets sideways scroll (sw 438 vs cw 390 or 360).
- **Evidence:**
  - At 390 the title and description column is squeezed to about 120px wide, so the h1 breaks as "Personal / Agents" and the description wraps one or two words per line (about 14 lines).
  - SETTINGS (105x35) and REFRESH (98x35) sit in the middle.
  - Only the "+" of the blue NEW TASK button is visible at the right edge (x 362-390).
- **Screenshots:** `personal-agents_390.png`, `personal-agents_360.png`, `personal-agents_768.png`.
- **Recommendation:**
  - Make the header `flex-wrap`, or stack it below 768px, with actions on their own row.
  - On mobile, make "New task" a full-width button or a floating action button above the bottom bar.
  - Keep the button label on one line (`white-space:nowrap`) and let the container wrap instead.

### RESPONSIVE-A-04: Agent Cockpit drops Customer Intel below 1024px, and the flow selector, latency and session status below 768px, with no way to reveal them. **High**

- **Width:**
  - The Customer Intel panel is visible at 1024 but absent at 1023 (sweep).
  - The header `FLOW: [selector]`, `LAT:` and `SESSION:` items disappear at <= 767. The tablet at 768 keeps FLOW and LAT but drops SESSION.
- **Evidence:**
  - At 768 the page shows only the orb, Vaani/Vikash toggle, phone input, Test Call, CONNECT and Transcript Feed. The probe found 13 interactive elements in main; none belong to customer name, phone, email, company, location, language, sentiment, duration, previous calls or Save Context.
  - At 390, the full set of 15 interactive elements is: 3 in the banner, Vaani, Vikash, phone input, Test Call, CONNECT and the 7 bottom-bar items. No toggle, tab or drawer exposes the intel.
  - An operator on a tablet or phone can therefore place a call without seeing which flow is selected or which customer context is loaded.
- **Screenshots:** `dashboard_768.png`, `dashboard_390.png`, `dashboard_360.png`, `dashboard_1024.png`.
- **Recommendation:**
  - Below 1024, turn Customer Intel into a collapsible section or a "Customer" tab (Call / Customer / Transcript segmented tabs work well on phones).
  - Always show the selected flow as a compact chip next to the title, tappable to change it, at every width.
  - Keep a one-word session state (IDLE or LIVE) visible on mobile.

### RESPONSIVE-A-05: Agent Cockpit 1024-1279 layout: CONNECT sits on top of the Transcript Feed panel and the orb is clipped when the window is 768px tall or less. **High**

- **Width:**
  - Two-column mode exists from 1024 to 1279 (three columns from 1280, sweep-verified).
  - The overlap appears at 1024x768 and at 1100x700. At 1100x800 there is no overlap.
- **Evidence:**
  - At 1024x768, CONNECT (126x39) is at y=514, drawn over the "TRANSCRIPT FEED" header row, which starts about y=515. The phone input and Test Call straddle the panel's top border, and the orb's top is cut off by the page header.
  - At 1100x700: transcript header at y=458, CONNECT at y=480-519, fully inside the transcript panel.
  - The centre stack (orb 312px + STANDBY + toggle + input + CONNECT) has a fixed height, and the transcript panel takes a fixed share of the column, so they collide.
- **Screenshots:** `dashboard_1024.png`, `dashboard_1100x700.png`.
- **Recommendation:**
  - Make the centre column a flex column where the orb scales (`height: clamp(160px, 30vh, 312px)`) and the transcript panel is `flex:1; min-height:0` below the controls.
  - Never position the controls absolutely over sibling panels.
  - Alternatively, put the transcript in a right column from 1024 and move Customer Intel into a tab.

### RESPONSIVE-A-06: Rail hover labels are 100% clipped, and the tooltips add a stray horizontal scrollbar to the rail at every desktop width. **High**

- **Width:** all widths >= 768. The scrollbar is visible on Windows, in the 1920/1440/1280/1024 screenshots.
- **Evidence:**
  - Each rail link contains an absolutely positioned tooltip div (e.g. "Analytics", 79x34, opacity 0 until hover).
  - The containing `nav` has `overflow-x:auto; overflow-y:auto`.
  - On hover at 1440 the tooltip reaches opacity 1 at x=64, but the nav's right edge is x=63, so 0 of 79px (0%) is visible. The hover screenshot shows no label.
  - The only label users get is the native `title` attribute, which appears after a delay; there is no `aria-label`.
  - The hidden tooltips also widen the nav's scrollable area (scrollWidth 175 vs clientWidth 44), so Windows draws a horizontal scrollbar with arrow buttons inside the 72px rail. It appears at about y=825 at 1920, y=640 at 1440, y=545 at 1280 and y=513 at 1024.
  - On touch tablets (768-1023) there is no hover at all, so icon-only navigation has no labels.
- **Screenshots:** `sidebar_hover_tooltip_1440.png`, `dashboard_1920.png`, `dashboard_1440.png`, `assistant_1920.png`.
- **Recommendation:**
  - Render tooltips in a portal (or with `position:fixed`) outside the scroll container, and set `overflow-x:hidden` on the nav.
  - Add `aria-label` to each icon link.
  - Show text labels by default at >= 1280 (a 200-240px labelled sidebar). On touch tablets, either show labels under the icons (56-72px rail with 10-11px captions, like the mobile bar) or make "Expand" an overlay drawer.

### RESPONSIVE-A-07: Rail items fall below the fold on common laptop heights (Settings hidden at 1440x900; Billing, Knowledge and Settings hidden at 1280x800). **Medium**

- **Width:** see the table in section 2. The rail nav scrolls at every viewport height below about 1000px.
- **Evidence:**
  - nav clientHeight / scrollHeight: 548/572 at 900 tall, 448/572 at 800, 416/572 at 768.
  - At 1024x768 the active item on /billing (credit-card icon) is scrolled out of view, so the user loses "you are here" feedback.
  - The footer cluster uses about 250px: status dot, latency text, Sign Out, theme, Expand, each on its own row.
- **Screenshots:** `dashboard_1440.png`, `dashboard_1280.png`, `billing_1024.png`, `dashboard_1280x720.png`.
- **Recommendation:**
  - Compress the footer. Put the status dot and latency in one row or behind a single status icon, and move Sign out and theme into an avatar menu.
  - Reduce item pitch to 40-44px below 800px height.
  - Auto-scroll the active item into view on load.

### RESPONSIVE-A-08: Flow Builder toolbar clips ACTIVATE (and nearly Save) on tablet widths 768-876px. **High**

- **Width:** ACTIVATE's right edge is fixed at x=876 for every width from 1000 down to 768, because the toolbar row switches to icon-only at <= 1000. The button is fully visible at >= 877px and clipped at 860, 800 and 768. Below 768 the mobile toolbar shows it again.
- **Evidence:**
  - At 768 the toolbar `div.flex.items-center.gap-1.5` runs from 88 to 876 inside a parent with overflow hidden.
  - ACTIVATE (105px) is entirely invisible. Save (83px) ends at 763, flush with the edge.
  - AI draft and Settings drop their text labels at <= 1000 (39x40 icon buttons).
- **Screenshots:** `flow-builder_768.png`.
- **Recommendation:** Let the toolbar wrap to a second row, or move secondary icons (copy, paste, validate, preview, fullscreen, shortcuts) into the "…" overflow menu at < 1024, which the mobile layout already does. Pin Save and ACTIVATE to the right with `flex-shrink:0`.

### RESPONSIVE-A-09: Flow Builder canvas gets under half the screen on tablet and small laptop, and does not re-fit after a resize. **Medium**

- **Canvas share of viewport** (canvas size, nodes in view out of 26):

  | Viewport | Canvas share | Canvas size | Nodes in view |
  |---|---|---|---|
  | 1920x1080 | 65% | 1522x887 | 12 |
  | 1440x900 | 52% | 1042x651 | 8 |
  | 1280x800 | 47% | 882x551 | 5 |
  | 1024x768 | 41% | 626x519 | 3, after resizing from 1920 |
  | 768x1024 | 40% | 402x786 | 15, on direct load |
  | 390x844 | 53% | 365x478 | 12 |
  | 360x780 | 47% | 334x396 | 8 |

- **Tablet:** at 768 the fixed 256px palette plus the 72px rail leave a 402px-wide canvas. The palette has a collapse button ("Collapse node palette"), but it starts expanded.
- **After a resize:** React Flow does not call `fitView` when the container resizes. Loading at 1920 and then shrinking to 1024 left the graph anchored at x=792+, so only 3 nodes were partly in view and the canvas looked empty apart from the minimap (`flow-builder_1024.png`). Loading directly at 1024 fits 12 of 26 nodes at scale 0.58 (`flow-builder_1024_directload.png`).
- **Mobile (< 768)** is a real adaptation, which is good: the palette becomes a horizontal chip strip ("+ ADD", Speak, Question, Knowledge Query …) and the toolbar collapses to "…". Remaining issues:
  - The "FLOW VALIDATED" badge overlaps the Start Call node at 390 and 360.
  - The zoom/fit/lock controls (34x34, under 44px) overlay nodes.
  - A synthesized one-finger touch drag on empty canvas did **not** pan: the viewport transform was unchanged at `translate(-20px, 19px) scale(0.55)`. This is inferred from CDP touch events and needs verification on a real device.
  - Tapping a node selected it and opened a node inspector covering x=60-378, about 82% of the width, with a large red "Delete Node" button (`flow-builder_390_tapnode.png`).
  - The "…" menu lists AI draft, Flow settings, Undo, Redo, Copy, Paste, Validate, Preview, Full-screen, Shortcuts, Export JSON, Import JSON, New flow and Reset. Items are about 34px tall, and Mac "⌘Z/⌘C" hints appear on a touch Android device.
- **Recommendation:**
  - Start the palette collapsed at < 1280 and call `fitView` on container resize.
  - Enable touch panning (`panOnDrag`) and pinch-zoom explicitly.
  - Move the validation badge into the canvas header.
  - Hide keyboard hints on `pointer:coarse` devices.
  - Make the node inspector a bottom sheet with Delete in a secondary position.

### RESPONSIVE-A-10: Opening Flow Builder sends a write (`PUT /api/flows/<id>`) with no user edit, and the status still reads "Up to date" when that write fails. **High**

This is an incidental finding, not layout.

- **Evidence:**
  - Loading /flow-builder at a fixed 1024x768, with no interaction, produced a `PUT https://vaanilabs.in/api/flows/<flow-id>` about 3 seconds after nodes rendered. It was blocked by our guard.
  - It recurred on every load at every width, and once after tapping (selecting) a node on mobile.
  - Resizing the window did not trigger it.
  - After the PUT was aborted, the save-status pill still read **"Up to date"**. This was observed under simulated network failure.
- **Recommendation:**
  - Do not autosave on load or selection. Only persist on real graph or content changes, compared by diff or hash.
  - When a save fails, show "Not saved — retry" rather than "Up to date".
  - The flow-canvas specialists should confirm what payload is sent.

### RESPONSIVE-A-11: Assistant on phones leaves 241-345px for the conversation. **Medium**

- **Width:** 390x844 and 360x780. At 768 and 1024 the Plan & Actions panel stacks under the composer. At 1280 and above it is a right column.
- **Evidence:**
  - The chat scroller `div.flex-1.space-y-3.overflow-y-auto` is 345px tall at 390x844 and **241px** at 360x780. The stack around it:
    - wallet banner (58/77px)
    - page header with "New chat" and "Voice" (about 130px)
    - composer
    - the permanently visible Plan & Actions card (about 150px)
    - the bottom bar (56px)
  - Suggestion chips are cut by the scroller edge: at 360 the "Build a sales call flow" chip is sliced in half.
  - The composer placeholder ("Ask me to build a flow, summarize calls, add leads, place a call…") wraps to 2-3 lines inside a 42px-tall field and is clipped.
  - The subtitle is truncated with an ellipsis (331px text in 296-326px).
  - A real on-screen keyboard would shrink the chat area further (inferred).
- **Screenshots:** `assistant_390.png`, `assistant_360.png`.
- **Recommendation:**
  - On < 768, collapse Plan & Actions into a toggle ("Plan · 0 steps"), hide the page subtitle, and put New chat and Voice in the header as icon buttons.
  - Use a short placeholder ("Ask Vaani…"), an auto-growing textarea and a sticky composer.

### RESPONSIVE-A-12: Wallet banner grows to 3-4 lines on phones, its buttons wrap, and Dismiss is a 22px target next to "Enable autopay". **Medium**

- **Height by width:**

  | Viewport | Banner height | Lines |
  |---|---|---|
  | >= 441 | 42px | 1 |
  | 390-440 | 58px | 2 |
  | 360-375 | 77px | 3 |
  | 320 | 97px | 4 |

- **Evidence:**
  - At 390 and 360, "Top up" (44x40) wraps as "Top / up" and "Enable autopay" (70x42) as "Enable / autopay".
  - Dismiss is 22x22 and sits 7px from "Enable autopay" (x=345 vs x=352 at 390), so a mis-tap on Dismiss can land on the payment control.
  - The banner is also shown on /billing itself, where it duplicates the page.
  - Its behaviour differs by page. On Dashboard, Assistant, Flow Builder, Meeting Agent and Billing it stays pinned above a scrolling region. On Personal Agents it sits inside `main.overflow-y-auto` and scrolls away.
  - At 768 with the sidebar expanded (content 528px) it also wraps to 2 lines.
- **Screenshots:** `dashboard_390.png`, `dashboard_360.png`, `billing_390.png`, `billing_768_sidebar_expanded.png`.
- **Recommendation:**
  - On < 640, use a one-line banner ("Wallet empty · Top up") with a single CTA and a 44x44 dismiss hit area, at least 8px from the CTA.
  - Suppress the banner on /billing.
  - Use the same pinned or scrolling behaviour on every page.

### RESPONSIVE-A-13: Many touch targets are under 44x44 on phones and tablets. **Medium**

- **Counts at 390** (small / total interactive):

  | Page | Small / total |
  |---|---|
  | Dashboard | 6/15 |
  | Assistant | 12/19 |
  | Flow Builder | 20/49 |
  | Meeting Agent | 27/40 |
  | Personal Agents | 5/13 |
  | Billing | 8/18 |

  At 768 (touch): Dashboard 13/26, Assistant 16/28, Flow Builder 36/82, Meeting Agent 35/51, Billing 15/27.
- **Worst offenders:**
  - Meeting Agent: "Copy URL" 15x15, "2 joinees ▸" 82x16, "Refresh" 84x24, room buttons Agent/Intel/Record 70-76x32, and "Delete room" 32x32 directly beside Record.
  - Wallet Dismiss 22x22.
  - Assistant: New chat 102x32 and Voice 80x32; suggestion chips 34px tall.
  - Flow Builder: zoom controls 34x34, palette chips 36px tall, Private toggle 30x40, Start/End nodes 26px tall, overflow-menu items about 34px.
  - Billing: amount chips Rs 100/500/1000 at 32-34px tall; inputs 34px tall.
  - Dashboard: Vaani/Vikash toggle 38px tall, phone input 38px.
  - Rail icons 36x36 at tablet widths.
- **Recommendation:**
  - Adopt a 44px minimum hit area on `pointer:coarse`, using padding or `::after` hit-slop to keep the visual size.
  - Separate destructive controls (Delete room, Delete node, Reset) from neighbouring actions by at least 8px, or move them into an overflow menu with confirmation.

### RESPONSIVE-A-14: "Exit" (sign out) is a primary bottom-tab item packed against "Knowledge". **Medium**

- **Width:** <= 767.
- **Evidence:** The Exit button is 51x55 with 0px gap to Knowledge (55x55) and no `aria-label` (the visible text is "Exit"). A thumb reaching for Knowledge can sign the user out. I did not tap it (prohibited), so whether it asks for confirmation is unverified.
- **Recommendation:** Move sign-out into the "More" or profile sheet from RESPONSIVE-A-01, label it "Sign out", and confirm before signing out.

### RESPONSIVE-A-15: Tablet 768-1023 has neither a labelled nav nor an overlay drawer. **Low**

- **Evidence:**
  - At 768, "Expand sidebar" widens the rail to 240px and *pushes* content to 528px (main left = 240) with no backdrop.
  - Every page then reflows: the banner wraps to 2 lines and the Billing cards compress.
  - Expanded labels read "Agent View" and "Meet Agent", while the pages call themselves "AGENT COCKPIT" and "Meeting Agent — Vikash", and the mobile bar calls the dashboard "Agent".
  - The collapse control shows a stray "[" shortcut hint ("Collapse [").
- **Screenshots:** `billing_768_sidebar_expanded.png`.
- **Recommendation:** Below 1024, open the expanded sidebar as an overlay drawer with a scrim and close it on navigation. Use one consistent name per destination across rail, drawer, bottom bar and page title.

### RESPONSIVE-A-16: Text is truncated or wrapped with no way to see the full value. **Low**

- **Flow Builder palette labels** are truncated at **every** width:
  - At 1920 there are 64px label slots: "Knowledge Query" (101px) shows as "Knowle…"; CRM Lookup, Book Meeting, WhatsApp, Human Handoff and Verify Customer are also cut.
  - At 768 the slots shrink to 48px.
  - Node bodies use a 3-line clamp. That is intentional, but there is no hover or expand.
- **Dashboard flow selector:** a 150px select shows the flow name cut mid-word with no ellipsis, at 768-1920.
- **Dashboard "Test Call"** wraps to 2 lines at every width, including 1920.
- **Meeting URLs** are ellipsized to 78px at 390.
- **Recommendation:** Give palette tiles 2-line labels or a single-column list with full names. Add `text-overflow:ellipsis` and a `title` to the flow selector. Use `white-space:nowrap` with a min-width on "Test Call".

### RESPONSIVE-A-17: No max-width on wide screens, so forms and composers stretch to 1100-1300px. **Low**

- **Evidence at 1920:**
  - Meeting Agent: the "Meeting Title" input and Session Mode control are 1125px wide.
  - Assistant: the composer input is about 1278px wide (x 149-1427).
  - Dashboard: the centre column is about 1150px of mostly empty grid around a 312px orb.
  - Personal Agents already caps content (about 1120px centred), which is good.
- **Recommendation:** Cap reading and form content at 720-880px, and chat at about 820px. Use the extra width for the agent card or plan panel rather than stretching inputs.

### RESPONSIVE-A-18: Copy typo on Personal Agents. **Low**

- "A Personal Agent is a voice agent you hand a **goalinstead** of a script": a space is missing after the bold "goal", at all widths.
- **Recommendation:** Add the space; check for missing whitespace around inline `<strong>` elements.

---

## 5. Per-page detail

### /dashboard (Agent Cockpit)
- **Breakpoints (sweep):**
  - >= 1280: three columns (Customer Intel 320px | orb and controls | Transcript Feed).
  - 1024-1279: two columns (Intel | orb above transcript).
  - 768-1023: no Intel; orb above transcript.
  - <= 767: bottom bar; header shows only "AGENT COCKPIT", IDLE and the 00:00 timer.
- **Doc overflow:** none at any width.
- **Internal scroll:** Intel scroller at 1024x768 (630/736).
- **Text under 12px:** 23 nodes at desktop (SYS: ONLINE, LAT, RGN, the user email, latency, all 11px mono) and 10 on mobile (the bottom-bar labels).
- **Fixed elements:** `div.noise-overlay` covers 100% of the viewport at z-index 9999 but has `pointer-events:none`, so it does not block interaction.
- **Load:** the first load at 1920 showed a full-screen "Loading…" spinner for over 3 seconds (`dashboard_1920.png` in the first pass). The flow selector renders as an empty 18px box until flows load.
- **Mobile orb:** at 390 the dashed ring was caught mid-animation looking irregular. This is cosmetic.

### /assistant
- **Layout:** two columns (chat | Plan & Actions about 380px) at 1280 and above. At 1024 and below, Plan & Actions stacks under the composer (154px tall at 1024). Somewhere between 1025 and 1279 the layout switches; I did not bisect it.
- **Mobile:** header actions drop below the title (New chat and Voice at 32px tall). See RESPONSIVE-A-11.
- **Overflow:** none at document level. The probe's "overlaps" between chips and the composer at 390/360 are chips clipped by the scroller, which is visually confirmed as cut-off chips.

### /flow-builder
- **Layout by width:**
  - >= 1024: labelled toolbar ("AI draft", "Settings"), with a palette of about 276px.
  - 768-1000: icon-only AI and Settings, ACTIVATE clipped below 877 (RESPONSIVE-A-08), palette 256px.
  - <= 767: dedicated mobile layout (chip strip, "…" menu, Save and ACTIVATE visible, flow selector next to the title). The minimap is hidden on mobile.
- **Text under 12px:** 61-62 nodes (palette 10-11px mono, node bodies).
- **Node overlap:** the "Knowledge Lookup" node overlaps the "Confirm Interest" node at every width (76x62px intersection at 1440). That is graph layout, not responsive.
- **Writes:** see RESPONSIVE-A-10 for the background PUT.
- **Discarded state:** all local interactions (menu open, node tap) were discarded by navigating away. No Save or ACTIVATE was clicked.

### /meeting-agent
- **Layout:** >= 1024 two columns (form and rooms | Vikash agent card and Agent Operations). < 1024 single column, with the agent card after Active Rooms and Past Meetings. The page is long: the scroller is 2903px at 768.
- **Mobile:** broken below 513px (RESPONSIVE-A-02).
- **Room controls:** at 768 and 1024, Agent/Intel/Record are 70-76x32, with the destructive stop button (32x32, red outline) adjacent.

### /personal-agents
- **Layout:** centred max-width layout at >= 1024 (good).
- **Tablet:** NEW TASK wraps to 2 lines at <= 768.
- **Mobile:** header broken below about 440px (RESPONSIVE-A-03).
- **Bottom bar:** `main` has `padding-bottom:64px`, so the last element ("New task" link, bottom 750) clears the bottom bar (top 788). This is good.

### /billing
- **Status:** best responsive page. No overflow at any width, and at 390 it is a clean single column with a full-width primary button on each card.
- **Minor:**
  - Amount chips and inputs are 32-34px tall.
  - The Balance and Transactions cards take a full row each on mobile (about 110px each) and could sit side by side.
  - The redundant wallet banner shows on this page.
  - At 1024x768 the active Billing rail icon is scrolled out of view (RESPONSIVE-A-07).

---

## 6. Strengths to preserve
- No document-level horizontal scroll on any of the 6 pages at any tested width (42 page x width combinations). Overflow is always confined to inner scrollers.
- There is a genuine mobile shell: a bottom tab bar with icons **and** text labels, 51x55 targets, and content padded (64px) so nothing hides behind it.
- Flow Builder has a thoughtful mobile mode:
  - The palette becomes a scrollable chip strip.
  - The toolbar collapses into a well-grouped, labelled "…" menu.
  - Save and ACTIVATE stay visible.
  - Tapping a node opens an inspector.
- Billing reflows cleanly from 1920 to 360.
- Assistant stacks the Plan panel sensibly at <= 1024.
- The Agent Cockpit centre column (orb, agent toggle, input, CONNECT) centres well on phones.
- The viewport meta is correct (`width=device-width, initial-scale=1`). The decorative noise overlay uses `pointer-events:none`.

## 7. Open questions
- **Canvas touch:** touch pan and pinch on the Flow Builder canvas need checking on a real phone or iPad, because CDP-synthesized touch did not pan.
- **Exit:** does "Exit" in the mobile bar ask for confirmation? It was not tested because sign-out is prohibited in this audit.
- **Desktop-only pages:** are Flow Builder, Meeting Agent, Personal Agents, Rep Console, Analytics and Settings intentionally desktop-only on phones? If so, the product should say so. At present they are simply unreachable.
- **iOS Safari:** safe-area insets on the fixed bottom bar and `100vh` app-shell heights (the dashboard uses a full-height layout) were not tested. Also untested: what happens when the on-screen keyboard opens on the Assistant composer and the dashboard phone input.
- **Real devices:** DPR 2-3 rendering and the `mobile:true` viewport flag could not be applied (see Method). Re-run a spot check on a real device before sign-off.
