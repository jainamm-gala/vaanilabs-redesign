
### F-RWD-013 — Wallet banner grows to 2–4 lines on phones, its buttons wrap, and a 22px Dismiss sits 7px from "Enable autopay"
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-A-12
- **Pages:** every authenticated route (banner), measured on /dashboard and /billing
- **Evidence:**
  - Banner height by width:

    | Width | Height | Lines |
    |---|---|---|
    | 441 and above | 42px | 1 |
    | 390–440 | 58px | 2 |
    | 360–375 | 77px | 3 |
    | 320 | 97px | 4 |

  - At 390 and 360 the button labels break across lines: "Top up" (44x40) becomes "Top / up", and "Enable autopay" (70x42) becomes "Enable / autopay".
  - Dismiss is 22x22 and sits 7px from "Enable autopay" (x=345 vs x=352 at 390). A missed tap on Dismiss can land on the payment control.
  - The banner also shows on /billing, where it repeats what the page already says.
  - It behaves differently by page. It stays pinned above the scrolling region on Dashboard, Assistant, Flow Builder, Meeting Agent and Billing, but scrolls away inside `main` on Personal Agents.
  - At 768 with the sidebar expanded (528px of content), it also wraps to 2 lines.
  - RESPONSIVE-B measured the same heights (42, 58 and 77px) and the same 22x22 Dismiss on its own pages.
  - At 360x780, the banner, the sticky page header and the tab bar together take about 200px, or 26% of the screen (RESPONSIVE-B-18, reported in another section). At 720x450, banner plus bar take 22%.
- **Screenshots:** audit/screenshots/va-responsive-a/dashboard_390.png, audit/screenshots/va-responsive-a/dashboard_360.png, audit/screenshots/va-responsive-a/billing_390.png, audit/screenshots/va-responsive-a/billing_768_sidebar_expanded.png
- **Recommendation:**
  - Below 640, show a one-line pill ("Wallet empty · Top up") with a single CTA, and leave autopay setup to /billing.
  - Give Dismiss a 44x44 hit area at least 8px from the CTA, and remember the dismissal for the session.
  - Do not show the banner on /billing.
  - Use the same pinned-or-scrolling behaviour on every page, and make the banner non-sticky when the viewport is under 600px tall.

### F-RWD-014 — Flow Builder canvas gets under half the screen on tablets and small laptops, does not re-fit after a resize, and touch pan failed in emulation
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-A-09
- **Pages:** /flow-builder
- **Evidence:**
  - Canvas share of the viewport, and how many of the 26 nodes are in view:

    | Viewport | Canvas share | Canvas size | Nodes in view |
    |---|---|---|---|
    | 1920 | 65% | 1522x887 | 12 |
    | 1440 | 52% | — | — |
    | 1280 | 47% | 882x551 | 5 |
    | 1024 | 41% | 626x519 | 3 after resizing from 1920; 12 (scale 0.58) on direct load |
    | 768 | 40% | 402x786 | — |
    | 390 | 53% | 365x478 | — |
    | 360 | 47% | 334x396 | 8 |

  - At 768 the 256px palette starts expanded.
  - React Flow does not call `fitView` when its container resizes. The verifier's side note under F-RWD-003 (the layout mode does not switch on a live resize) points the same way.
  - Phone layout problems:
    - the "FLOW VALIDATED" badge overlaps the Start Call node;
    - the 34x34 zoom controls sit on top of nodes;
    - a synthetic one-finger drag did not pan: the transform stayed at `translate(-20px, 19px) scale(0.55)`. This needs checking on a real device;
    - tapping a node opens an inspector that covers 82% of the width, with a large red Delete Node button;
    - items in the "…" menu are about 34px tall and show ⌘Z/⌘C hints on Android.
- **Screenshots:** audit/screenshots/va-responsive-a/flow-builder_1024.png, audit/screenshots/va-responsive-a/flow-builder_1024_directload.png, audit/screenshots/va-responsive-a/flow-builder_768.png, audit/screenshots/va-responsive-a/flow-builder_390.png, audit/screenshots/va-responsive-a/flow-builder_390_afterpan.png, audit/screenshots/va-responsive-a/flow-builder_390_tapnode.png, audit/screenshots/va-responsive-a/flow-builder_390_moremenu.png
- **Recommendation:**
  - Start the palette collapsed below 1280.
  - Add a debounced ResizeObserver on the canvas container that calls `fitView({padding:0.1})`.
  - Set `panOnDrag` and `zoomOnPinch` explicitly, and test on iOS and Android.
  - Move the validation badge into the canvas header.
  - Hide ⌘ hints under `pointer:coarse`.
  - On phones, open the node inspector as a bottom sheet with Delete in a secondary position.
  - Give canvas controls a 44px hit area on touch.

### F-RWD-015 — Assistant leaves only 241–345px for the conversation on phones, and clips the suggestion chips and composer placeholder
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-A-11
- **Pages:** /assistant
- **Evidence:**
  - The chat scroller (`div.flex-1.space-y-3.overflow-y-auto`) is 345px tall at 390x844 and 241px at 360x780.
  - The rest of the screen, top to bottom, goes to:
    - the wallet banner (58px at 390, 77px at 360);
    - a page header with New chat (102x32) and Voice (80x32), about 130px;
    - the composer;
    - an always-visible Plan & Actions card, about 150px;
    - the 56px tab bar.
  - At 360 the "Build a sales call flow" chip is cut in half.
  - The placeholder ("Ask me to build a flow, summarize calls, add leads, place a call…") wraps to 2–3 lines inside a 42px field and is clipped.
  - The subtitle is cut with an ellipsis (331px of text in 296–326px).
  - An on-screen keyboard would shrink the chat area further (inferred).
- **Screenshots:** audit/screenshots/va-responsive-a/assistant_390.png, audit/screenshots/va-responsive-a/assistant_360.png, audit/screenshots/va-responsive-a/assistant_360_full.png
- **Recommendation:**
  - Below 768:
    - collapse Plan & Actions into a toggle ("Plan · 0 steps") or a sheet;
    - hide the subtitle;
    - make New chat and Voice 44px icon buttons in the header.
  - Shorten the placeholder to "Ask Vaani…".
  - Use an auto-growing textarea (1 row, up to 5).
  - Keep the composer sticky and above the on-screen keyboard, using `dvh` units or `visualViewport`.
  - Put the suggestion chips in one horizontally scrolling row.

### F-RWD-016 — Knowledge file table hides Embed and Delete at 880px and below, and the header is clipped at 360
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-B-12
- **Pages:** /knowledge
- **Evidence:**
  - The file table has a hard minimum width of 691px. It fits at 900 (718/718) and overflows from about 880 down:

    | Width | Visible / table width | Effect |
    |---|---|---|
    | 860 | 678/691 | — |
    | 768 | 586/691 | "Embed" half visible, "Delete" hidden |
    | 390 | 297/691 | only the File column visible; NEXT pagination clipped |

  - At 390, Size, Updated and Actions can only be reached by scrolling sideways.
  - At 360 the page header overflows by 28px (sw 388 vs cw 360), and "Refresh" is cut to "Refres".
  - At 1024, sizes and dates wrap to 2 lines, and file names (raw storage keys) break at hyphens.
  - The file input is the browser's native, unstyled control at every width.
  - The Test Knowledge Search placeholder is cut at 390.
- **Screenshots:** audit/screenshots/va-responsive-b/knowledge_768.png, audit/screenshots/va-responsive-b/knowledge_390.png, audit/screenshots/va-responsive-b/knowledge_390_s1.png, audit/screenshots/va-responsive-b/knowledge_360.png
- **Recommendation:**
  - Below 900, render each file as a card row:
    - line 1: display name, with the timestamp prefix stripped;
    - line 2: size · updated;
    - on the right: a "⋯" actions menu with Embed and Delete, where Delete asks for confirmation.
  - As a stop-gap, make the Actions column `position:sticky; right:0`.
  - Let the header actions wrap, or turn them into icon buttons with `aria-label`s.
  - Replace the native file input with a styled drop zone that says "Choose file" on touch devices.

### F-RWD-017 — Marketing nav overflows at tablet widths (768–840) and wraps at 1060 and below
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-B-14
- **Pages:** / (signed out)
- **Evidence:**
  - The desktop link row (`div.hidden.md:flex`, 731px wide) appears from 768 up, but at 768 it runs out to x=925.
  - As a result, the theme toggle, "Log in" and "Get started" are off-screen at 768, and "Build your own" wraps to 3 lines.
  - Document scrollWidth is 834 at both 768 and 800; the page fits at 900.
  - Under mobile emulation, Chrome widens the layout viewport to 834px (innerWidth 834), so iPad-portrait-class devices render the whole page zoomed out.
  - At 1060 and below, "Build your own", "Log in" and "Get started" wrap to 2 lines, and the nav grows from 69px to 85–91px.
  - The hamburger menu only appears at 767 and below.
- **Screenshots:** audit/screenshots/va-responsive-b/home_768.png, audit/screenshots/va-responsive-b/home_1024.png
- **Recommendation:**
  - Show the hamburger below 1100px, using a custom breakpoint such as `min-[1100px]:flex` for the link row.
  - On tablets, keep "Log in" and "Get started" visible next to the hamburger.
  - Add `whitespace-nowrap` to the nav items.
  - Add an automated check that `documentElement.scrollWidth <= innerWidth` at 768, 834 and 1024.

### F-RWD-018 — Public-site phone polish: 14px inputs, clipped flow demo, menu ignores Esc, very long pages
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** PUBLIC-SITE-24
- **Pages:** /, /login, /pricing at 390px
- **Evidence:**
  - Inputs are 14px on /login and /pricing, which makes iOS Safari zoom in on focus (inferred). RESPONSIVE-B measured the same 14px on login, sign-up, New lead and search fields (RESPONSIVE-B-19, reported in another section).
  - The home flow-builder demo nodes are clipped at the right edge (node right edge 382px vs a 380px viewport), and the "Book callback" branch is off-screen.
  - The mobile menu does not close on Esc: its label stays "Close menu" and `aria-expanded` stays `true`. It is not a `role="dialog"`.
  - There is no theme toggle on mobile; the button renders at 0x0 and is not in the menu.
  - Home is 9,914px tall on mobile (about 11.7 screens).
  - /pricing is 6,792px long and has no navigation or menu at all.
  - The analytics mock leaves one stat card alone on its row.
  - The demo transcript is a nested scroller (262px viewport over 343px of content) inside the page.
- **Screenshots:** audit/screenshots/va-public-site/m_home_top.png, audit/screenshots/va-public-site/m_home_menu.png, audit/screenshots/va-public-site/m_home_full_grid.png, audit/screenshots/va-public-site/m_login.png, audit/screenshots/va-public-site/m_pricing_top.png, audit/screenshots/va-responsive-b/home_390_menu.png, audit/screenshots/va-responsive-b/home_390_s1.png
- **Recommendation:**
  - Set `font-size:16px` (or `max(16px,1em)`) on inputs at 767px and below.
  - Scale the flow demo to its container, or switch it to a vertical layout on phones.
  - Make the menu a `role="dialog"` with `aria-modal`: Esc closes it and returns focus to the hamburger, and it contains the theme toggle.
  - On mobile, collapse long home sections (accordion or 2-column grids), and let the demo transcript expand instead of scrolling inside the page.
  - Give /pricing the standard site navigation.

### F-RWD-019 — Onboarding scrolls sideways at 1440px and cannot be found again after first run
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** EXPLORE-SETTINGS-23
- **Pages:** /onboarding
- **Evidence:**
  - At 1440, `main` has scrollWidth 1486 vs clientWidth 1358. The cause is a decorative `absolute -right-32` blob, which adds a visible horizontal scrollbar.
  - No Settings or Help entry links back to /onboarding.
  - No other widths were tested.
- **Screenshots:** audit/screenshots/va-explore-settings/c14_onboarding.png
- **Recommendation:**
  - Add `overflow-x:clip` to the decorative container, or to `main`.
  - Add a "Setup guide" entry under Help (or Settings › Account) that shows the status of each step.

---

### Refuted / not reproduced

The verifier did not refute any finding in this section. For completeness, these specific claims did not reproduce and have been corrected in the findings above:

- **RESPONSIVE-B-05** (F-RWD-010):
  - Not reproduced: "16 columns at 1920 vs 18 at 1440 and below".
  - Verifier: "After loading, 1920 also has 18 columns; the lower count was a load-timing artefact."
- **RESPONSIVE-B-08** (F-RWD-011):
  - Not reproduced: "1 lead row visible at 360" and the 2-row header wrap.
  - Verifier: at 360x780, 2 rows are fully visible; the 1-row figure "come[s] from Playwright's screenshot re-layout (DPR 1, desktop scrollbars)".
- **RESPONSIVE-A-04** (F-RWD-002):
  - Not reproduced: "LAT hidden below 768".
  - Verifier: "LAT is still visible at 767x1024". The verifier also found that SESSION disappears below 1024, not only at 768.
- **RESPONSIVE-B-04** (F-RWD-008):
  - Not reproduced: breakpoint "≤ 552px".
  - Verifier: there is no overflow at 552 or 560, and 3px at 540; "The breakpoint is about 543 px".
- **A11Y-MANUAL-12** (F-RWD-002):
  - Not reproduced: "Customer Intel removed from the DOM".
  - Verifier: its text "is still in the DOM but hidden, so it is hidden rather than removed".

**Severity lowered by the verifier (all confirmed, all now medium):**
- RESPONSIVE-A-02, A-03 and B-04: the cut-off controls can be reached by scrolling sideways, and on phones the page can only be opened by URL.
- RESPONSIVE-A-04: calling still works.
- RESPONSIVE-B-05: a wide scrolling table is normal for desktop reports.
- RESPONSIVE-B-07: the input can still be typed into.
- RESPONSIVE-B-08: 2–3 rows are visible, not 1.

**Still needs a real-device check:** Flow Builder touch pan and pinch, iOS zoom-on-focus with 14px inputs, the tab bar's safe-area overlap, and on-screen keyboard behaviour in the Assistant composer and the Cockpit phone input.
