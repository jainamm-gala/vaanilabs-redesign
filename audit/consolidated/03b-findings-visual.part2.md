
### F-VIS-008 — The base font silently falls back to the OS system font
- **Severity:** medium · **Confidence:** partially-verified (the verifier confirmed that `body` computes to `ui-sans-serif` and that Hanken loads only at weight 500)
- **Source findings:** DESIGN-SYSTEM-07
- **Pages:** all app pages
- **Evidence:**
  - **Mechanism (inferred):**
    - `body` computes to `ui-sans-serif, system-ui, sans-serif, …`.
    - The next/font variables (`--font-hanken` etc.) are declared on `<body>` classes.
    - Tailwind's `--default-font-family` and `--font-sans` reference those variables at `:root`/`html`, where they are undefined.
  - **Affected elements:** everything without an explicit `font-sans` utility, including everything styled by `.btn-saffron`, `.btn-outline` and `.input-vani`. These render in Segoe UI on Windows and SF on macOS. Examples: CONNECT, Pay with UPI, Save Changes, the Settings / Call Reports / Leads search inputs, sidebar controls and the Assistant body copy.
  - **System-font text nodes per page:** Personal Agents 15, Call Reports 12, Assistant 10, Knowledge 7, Flow Builder 6, Billing 6.
  - Assistant and Personal Agents are dominated by the system font (480 and 1,075 characters).
- **Screenshots:** —
- **Recommendation:**
  - Move the next/font `variable` classes from `<body>` to `<html>` in the root `layout.tsx` (`<html className={`${hanken.variable} ${jetbrains.variable}`}>`), or declare the variables on `:root`.
  - Load Hanken 400–700.
  - Add a unit or e2e assertion that `getComputedStyle(document.body).fontFamily` starts with "Hanken Grotesk".

### F-VIS-009 — Leads list: 44% of the viewport is chrome, a ~730px dead column, and the Status badge sits under the Interest header
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-09, EXPLORE-DATA-08, RESPONSIVE-B-09
- **Pages:** /leads
- **Evidence:**
  - **The first data row starts at y≈400 of 900.** The stack above it:

    | Element | Height (px) |
    |---|---|
    | Wallet banner | 42 |
    | Header | 80 |
    | KPI strip | 70 |
    | Shortcuts bar | 36 |
    | Search | 52 |
    | Two chip rows | 70 |
    | Table header | 36 |

    With 65px rows, only about 7.5 rows are visible.
  - **Dead column:** the lead cell ends at x≈430–440 and STATUS starts at x≈1,160, leaving about 730px of empty space.
  - **The INTEREST column is empty for all 24 rows.**
  - **The Status badge is misaligned.** At 1280 the STATUS header spans x 1,006–1,102 and INTEREST x 1,118–1,198, but the NEW badge renders at x 1,163–1,198. The Status column therefore looks empty at every desktop and tablet width.
  - **Row styling:**
    - Rows are transparent, so the graph-paper grid's vertical lines cut through every row.
    - Source chips use letter glyphs as icons ("F FACEBOOK", "IG INSTAGRAM", "G GOOGLE", "{} API").
    - The list is built from divs, with no table or row semantics.
- **Screenshots:** audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-explore-data/r2_leads_top.png, audit/screenshots/va-ux-audit/crop_leads_deadspace.png, audit/screenshots/va-responsive-b/leads_1280.png, audit/screenshots/va-responsive-b/leads_1024_detail.png
- **Recommendation:**
  - **Table structure:**
    - Use a real `<table>`, or a CSS grid with one shared `grid-template-columns` for the header and the rows, so cells can't drift.
    - Columns: Name, Phone, Status, Source, Last call (date and outcome), Interest, Owner, actions.
    - Hide any column that is empty for the whole org.
  - **Rows:**
    - Solid `bg-surface` with a hover tint.
    - 48–52px tall by default, with a 40px compact density option.
  - **Toolbar:**
    - Collapse the filters into one row: search plus Status, Source, Language and Outcome dropdowns.
    - Move the shortcut legend into a "?" popover.
  - **Icons and testing:**
    - Use brand SVGs or plain text for sources.
    - Add a visual-regression test for header-to-cell alignment.

### F-VIS-010 — Analytics decoration inverts the hierarchy: 15px H1 vs 27px/800 H2s, § markers, serif italics, Identity first
- **Severity:** medium · **Confidence:** partially-verified (the verifier measured the 15px/700 H1 and the Instrument Serif usage)
- **Source findings:** VISUAL-AUDIT-07
- **Pages:** /analytics
- **Evidence:**
  - **Inverted hierarchy:** the H1 "ANALYTICS" is 15px/700, tracked +2.7px. The eight section H2s (Identity, Headline, Sentiment, Flow, Intents, Phone, Recent, Recordings) are 27.2px/800.
  - **Decoration on every section:**
    - Each H2 carries a mono tracked "§ 0N" marker, an Instrument Serif italic tagline ("— who is on the line") and a hairline rule.
    - Cards add `.hud-bracket` corner brackets and diagonal hatch over a graph-paper grid.
  - **Identity comes first:** §01 is Identity (operator, plan, role), so the KPIs start below the fold at y≈570. The page is a 3,898px inner scroller.
  - **Empty states:** "not allocated yet" is 30px serif italic grey at 3.42:1. The hour-of-day chart draws 24 empty cyan cells instead of an empty state.
- **Screenshots:** audit/screenshots/va-visual-audit/analytics.png, audit/screenshots/va-visual-audit/analytics_full.png, audit/screenshots/va-visual-audit/crops/analytics_full_0.png, audit/screenshots/va-verify-visual-audit/analytics.png
- **Recommendation:**
  - **Reorder:** KPI row, then Sentiment trend, then Flow funnel, then Intents, then Recent calls.
  - **Move Identity and DID** to Settings › Calling number.
  - **Remove the decoration:** § markers, serif taglines, corner brackets and hatch.
  - **Headings:** the H1 comes from the shared `PageHeader` (24/600); section titles are 16–18/600.
  - **Empty charts:** use the shared `EmptyState` (F-VIS-023).
  - If the editorial look is wanted, keep it for an exported "report" view only.

### F-VIS-011 — Chart and delta colours encode direction instead of meaning
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-26, VISUAL-AUDIT-08
- **Pages:** /analytics (§02 Headline, §03 Sentiment, §07 Recent)
- **Evidence:**
  - **Week-over-week chips are coloured by sign.** "negative +13pp" is green rgb(23,138,85), and "neutral −25pp" is red rgb(208,70,58). A rise in negative sentiment therefore reads as good.
  - **The sentiment stacked area uses mustard #B5820E for neutral.** Neutral is the dominant band, so the whole chart reads as a warning.
  - **Durations in the Recent table are link-blue #2F5FE0** but are not links.
- **Screenshots:** audit/screenshots/va-visual-audit/crops/analytics_full_0.png
- **Recommendation:**
  - **Colour by desirability.** Add a `deltaTone(metric, delta)` helper:
    - negative sentiment up → danger;
    - positive sentiment up → success;
    - neutral → a grey tone.
  - **Don't rely on colour alone (WCAG 1.4.1).** Add a ▲/▼ icon and the explicit sign.
  - **Sentiment palette:** neutral grey for neutral (marks ≥3:1 against the surface), green for positive, red for negative.
  - **Reserve primary colour for interactive text.** Show durations in text-primary with `tabular-nums`.

### F-VIS-012 — The sentiment chart distorts (4.8px labels on phones, 1.46x stretched text on desktop) and is hard to read
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-B-15, EXPLORE-DATA-25
- **Pages:** /analytics §03
- **Evidence:**
  - **Distortion.** The SVG has `viewBox 800×220` at a fixed 240px height:
    - at 390px wide it renders 325×240, with tick labels 4.8px tall;
    - at 1440 it renders 1,166×240, with 13.6px labels stretched 1.46x horizontally.
  - **Readability:**
    - Tick values are uneven (0/3/5/8/10 and 0/12/24/35/47).
    - There are only 3 date labels.
    - There is no legend; the WoW chips double as one.
    - In the 7D view the hover tooltip overlaps the range toggle.
- **Screenshots:** audit/screenshots/va-responsive-b/analytics_390_s1.png, audit/screenshots/va-responsive-b/analytics_768_s1.png, audit/screenshots/va-explore-data/analytics_sentiment_7d_chart.png, audit/screenshots/va-explore-data/analytics_sentiment_hover.png
- **Recommendation:**
  - **Sizing:**
    - Measure the container with a ResizeObserver and draw at 1:1 (viewBox equal to pixel size, no `preserveAspectRatio="none"`).
    - Render axis text in HTML/CSS or outside the scaled group, at 12px or more.
  - **Axes:**
    - Use "nice" ticks (`scale.nice()` / `ticks(5)`).
    - Show 5–7 date ticks on desktop and fewer on narrow widths.
  - **Legend and tooltip:**
    - Add a legend with the total per sentiment.
    - Anchor the tooltip to the data point with collision detection.

### F-VIS-013 — Labels are truncated or clipped with no way to read the full value
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-15, VISUAL-AUDIT-07 (intent-label sub-point), RESPONSIVE-A-16, EXPLORE-SETTINGS-21 (palette overlap: FLOW-CANVAS-23)
- **Pages:** /analytics §05, /flow-builder, /dashboard, /meeting-agent (390px), /api-keys/embed
- **Evidence:**
  - **Analytics intents:**
    - Labels sit in a box of about 115px with ellipsis ("Appointment ...", "Airport Passe...", "Real Estate In..."), but need 182–236px.
    - There is no `title` or tooltip.
    - The bar beside each label gets about 900px.
  - **Flow Builder palette labels are cut at every width.**
    - 64px slots at 1920: "Knowledge Query" (101px) shows as "Knowle…"; CRM Lookup, Book Meeting, WhatsApp, Human Handoff and Verify Customer are also cut.
    - 48px slots at 768.
  - **Dashboard:**
    - The 150px flow `<select>` cuts names mid-word with no ellipsis, from 768 to 1920px.
    - "Test Call" wraps to 2 lines at every width.
  - **Meeting URLs** are ellipsized to 78px at 390px.
  - **Embed live preview:** the column is 182px wide (x=1,104). It clips its card titles ("widget", "voicebot bubble" lose their top line), and body text wraps at about 3 words per line. The floating panel alone is 340×480.
- **Screenshots:** audit/screenshots/va-ux-audit/crop_flow_palette_truncation.png, audit/screenshots/va-responsive-a/flow-builder_1920.png, audit/screenshots/va-explore-settings/c9_embed_snippet.png, audit/screenshots/va-visual-audit/analytics_full.png
- **Recommendation:**
  - **Rule:** any text that truncates must expose its full value (a `title`, or the shared Tooltip from F-VIS-014).
  - **Intents:** a 240px label column (or a 2-line wrap), with the count and percentage outside the bar.
  - **Palette:** a single-column list with icon and full label, or 2 columns with tiles of at least 150px and a 2-line clamp.
  - **Flow select:** `min-width: 220px; text-overflow: ellipsis`, plus a `title`.
  - **Buttons:** `white-space: nowrap`.
  - **Embed preview:** stack it below the snippet under 1280px, or give it a column of at least 360px.

### F-VIS-014 — Tooltips are about 70px wide, wrap one word per line and get clipped by their cards
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** EXPLORE-DATA-12
- **Pages:** /analytics
- **Evidence:**
  - The header REFRESH tooltip wraps to one word per line, about 16 lines tall.
  - The TOTAL CALLS info tooltip is cut off inside its card ("Lifetime count of every call placed to…").
  - The "Hide example calls" tooltip covers the Intents REFRESH button.
- **Screenshots:** audit/screenshots/va-explore-data/analytics_refresh_during.png, audit/screenshots/va-explore-data/analytics_info_tooltip.png
- **Recommendation:** build one `Tooltip` primitive (Floating UI or equivalent) and reuse it for the rail labels (F-VIS-015). It should:
  - render in a portal;
  - be 160–280px wide (`min-width` / `max-width`);
  - flip and shift on collision;
  - open after a 300ms delay on hover and on focus;
  - be wired with `aria-describedby`.

### F-VIS-015 — Sidebar hover labels are clipped by the nav's overflow and cause stray scrollbars in the rail
- **Severity:** medium · **Confidence:** multi-agent (the navigation section records the same defect as RESPONSIVE-A-06 and VISUAL-AUDIT-05)
- **Source findings:** QA-A-09
- **Pages:** global chrome (72px rail), all app pages
- **Evidence:**
  - **Clipped labels.** Each nav item renders its label tooltip to the right (Flow Builder at x=64, Knowledge at x 64–154), but the `<nav>` has `overflow:auto` and a right edge at x=63. The labels are never visible: a hit-test at a label returns `ASIDE`.
  - **Stray scrollbars.** The hidden tooltips widen the nav (`scrollWidth` 175 vs `clientWidth` 44). Windows therefore draws a horizontal scrollbar with ◀ ▶ arrows inside the 72px rail, at y≈640 at 1440x900.
- **Screenshots:** audit/screenshots/va-qa-a/sidebar_hover_flowbuilder.png, audit/screenshots/va-responsive-a/sidebar_hover_tooltip_1440.png
- **Recommendation:**
  - Render rail labels through the portal Tooltip (F-VIS-014), on hover and on focus.
  - Set `overflow-x: hidden` on the nav, and use `scrollbar-width: none` with top and bottom fade masks for vertical overflow.
  - Add `aria-label` to each link and `aria-current="page"` to the active one.

### F-VIS-016 — No radius, elevation, button-size or card scale; nested box-in-box fields on the Dashboard
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-16, DESIGN-SYSTEM-15
- **Pages:** all pages; /dashboard (Customer Intel)
- **Evidence:**
  - **Radii:** 12 values in use:

    | Radius | Count |
    |---|---|
    | 8px | 336 |
    | full | 327 |
    | 6px | 195 |
    | 4px | 74 |
    | 100% | 54 |
    | 12px | 43 |
    | 16px | 36 |
    | 3px | 25 |
    | 9px | 12 |
    | 20px | 4 |
    | 10px | 1 |

    - Card containers use four different radii: Dashboard 8, Knowledge 12, glass-card 16, bento-card 20.
    - Meeting Agent's segmented control uses 0.
  - **Elevation:**
    - The only theme shadow is `drop-shadow-lg`. The rest are ad-hoc glows (`0 0 10px rgba(47,99,224,.34)`, `rgba(34,197,94,.5)`) and two flow-panel shadows.
    - z-index values: 0, 1, 2, 4, 5, 10, 20, 30, 50 and 9999.
  - **Buttons:** 18 distinct heights, from 22 to 58px.
  - **Cards:** at least 5 treatments: white with a hairline, a #EEF1F7 fill, a 50% translucent fill, a dashed border, and hatch with brackets.
  - **Nested boxes:** Customer Intel puts a panel, then a field card, then an input with its own border and background. That is 3 concentric outlines per field, across 6 fields.
- **Screenshots:** audit/screenshots/va-visual-audit/dashboard.png, audit/screenshots/va-visual-audit/dashboard_connect_zoom.png
- **Recommendation:**
  - **Radius tokens:** xs 4, sm 6, md 8 (controls), lg 12 (cards), xl 16 (modals), and full (chips only).
  - **Elevation tokens:**
    - 0: none.
    - 1: `0 1px 2px rgb(17 23 37 / .06)`.
    - 2: `0 8px 24px rgb(17 23 37 / .10)`.
    - 3 (overlay): `0 18px 55px rgb(0 0 0 / .26)`.
    - Remove the glows.
  - **Named z-layers:** base 0, sticky 10, dropdown 20, overlay 30, modal 40, toast 50.
  - **One `Card`:** white, 1px #E1E6EF, 12px radius, 16/24 padding, and a shadow only when the card is clickable.
  - **Form fields:** a label above the input, with no wrapping card.

### F-VIS-017 — 20 badge styles: the same status looks different on every page
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-13
- **Pages:** /analytics, /call-reports, /leads, /billing, /flow-builder, /dashboard
- **Evidence:**
  - **"Completed" in two styles:** Analytics uses mono 9px, +1.8px tracking, uppercase, outline only. Call Reports uses Hanken 11px uppercase with a soft fill and no border, 18px tall.
  - **Other badges:**

    | Badge | Style |
    |---|---|
    | Leads source | mono 8px bold uppercase, 16px tall |
    | Leads status | mono 9px, teal/10 fill with a teal/30 border |
    | Billing "Inactive" | mono 10px outline pill |
    | Flow counters, kbd hints | mono 9px, r4 |

  - **Badge heights:** 16, 18, 20, 21, 24 and 25px.
  - **Sentiment appears three ways:** a coloured word (Dashboard "POSITIVE"), a pill (Call Reports) and a "pp" chip (Analytics).
  - Badge contrast failures are reported in the accessibility section (A11Y-AUTO-04).
- **Screenshots:** audit/screenshots/va-design-system/call-reports.png, audit/screenshots/va-design-system/leads.png, audit/screenshots/va-design-system/analytics.png
- **Recommendation:**
  - **`Badge`:** `tone={neutral|info|success|warning|danger|brand}`, `variant={soft|outline}`, heights 20/24, 12px/600, sentence case. Soft foregrounds use the -700 shades so text reaches 4.5:1 or more.
  - **`StatusBadge`:** one module that maps each domain enum (call status, lead status, sentiment) to a tone, label and icon. Share it across Leads, Call Reports, Analytics and Billing.
  - **`Kbd`:** a separate component for keyboard hints.
