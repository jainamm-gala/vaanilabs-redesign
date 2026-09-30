# Vaani Labs (vaanilabs.in): Visual Design Audit

Auditor: `va-visual-audit` (Visual Design Auditor agent)
Date of session: 2026-09-26
Target: live production site https://vaanilabs.in (signed-in customer account "Ria" / org "starvox labs"; wallet Rs 0)
Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-visual-audit/` (referred to below as `SHOTS/`)

---

## 0. Session and method notes

- **Browser status:** signed in for the whole session. No logout occurred and the private window was closed at the end. The signed-out views (login, marketing home) were captured in a separate, isolated, cookie-less browser context, so the user's session was never touched.
- **About the user's question on session expiry:** nothing in this audit needed credentials. Agents must not type passwords into the production login page, and a password or token should not be handed to agents for that purpose. If sessions keep expiring mid-run, the safe options are for the user to sign in again themselves, or to lengthen the session lifetime in the product's own auth settings (for example, Supabase JWT and refresh-token expiry). Sharing a password does not solve it.
- **Guard:** every non-GET request was blocked in my tab (plus PostHog, Razorpay, websockets and presence). Failures that come from that are *not* reported as bugs; where the UI's reaction to a blocked write is described, it is labelled "observed under simulated network failure".
- **Method:** For each page I (1) navigated at 1440x900, (2) took viewport screenshots and, where the page scrolls internally, enlarged the viewport to capture the whole page, (3) ran a DOM/computed-style probe collecting font families (weighted by characters rendered), font-size and weight distribution, letter-spacing, uppercase counts, text colours, radii, borders, backgrounds, button metrics and heading metrics, and (4) looked at every screenshot myself. WCAG contrast ratios were computed from computed colours and, where alpha or blending was involved, from sampled screenshot pixels. Dark mode was toggled in my own tab only; the theme class is `html.dark`. The only JS-visible cookie is PostHog's, and the toggle itself did not change it.
- **Pages covered (authenticated):** /dashboard, /assistant, /analytics (full), /leads, /flow-builder, /meeting-agent (full), /personal-agents, /rep-console (brief, one call), /call-reports, /billing, /knowledge, /settings (Profile), /settings/organization, /api-keys. Dark mode: dashboard, analytics, leads, flow-builder, call-reports, meeting-agent. Also: expanded sidebar, keyboard focus, hover, and 1366x768.
- **Signed-out:** /login and / (marketing home, full page plus two in-viewport checks).
- Other angles (UX flows, content, functional QA, responsive) belong to other agents. I note cross-over items only when they are visually evident.

---

## 1. Executive summary

The product has a solid neutral foundation. It uses a consistent grey ramp (#111725 / #3E475A / #7A8397 on #F4F6FA / #EEF1F7 / white, with #E1E6EF borders), Lucide outline icons and a thorough dark mode. It also has a genuinely polished marketing site. But the authenticated app looks like **five products stitched together**:

1. **"Terminal" pages** (Dashboard, Leads, Flow Builder, Billing, Knowledge, Settings, Rep Console) use JetBrains Mono for body text, with 8-10px uppercase labels tracked out to 1.8-4px.
2. **"Editorial" Analytics** layers `§ 01` section markers, Instrument Serif italic taglines, corner brackets, hatch fills and a graph-paper grid on top of that terminal look. Its H2s are 27px/800 while the H1 is 15px.
3. **"Violet" Meeting Agent** is 100% JetBrains Mono, including the H1, and uses a hard-coded violet (#8B5CF6) as its primary colour in both themes.
4. **"Plain SaaS" pages** use a sans typeface: Assistant and Personal Agents render in the system `ui-sans-serif` stack, and Call Reports in Hanken Grotesk.
5. **Marketing and login** default to dark, with Hanken Grotesk and a violet-to-cyan gradient. The app defaults to light with a blue accent (#2F5FE0) in light mode, which switches to violet (#7C6BF5) in dark mode.

The things that most cheapen the look, in order:

- **(a)** Inconsistent typography and page-header patterns: 13 distinct H1 treatments.
- **(b)** Primary buttons render **black text on the brand blue** (3.83:1, failing AA). The class name `btn-saffron` shows a leftover from a saffron theme.
- **(c)** An icon-only 72px sidebar that clips its own last item (Settings) at 900px height, shows a stray horizontal scrollbar, and has no visible tooltips. At 1366x768 only 8 of 12 items are visible.
- **(d)** Tiny, low-contrast labels: 8-10px mono uppercase, with muted text #7A8397 at 3.36-3.8:1.
- **(e)** Decorative noise (grid paper behind data tables, § markers, serif italics, a large animated ring) competing with the data.
- **(f)** Accent-colour sprawl (blue, violet, teal, green and Tailwind-400 amber, orange, pink and violet node colours) with little semantic meaning.
- **(g)** Raw artefacts: native file inputs, timestamp-prefixed filenames, dev ports and env-var names on Meeting Agent, a missing space in "goalinstead", four date formats.

There is also a notable behaviour. **Flow Builder attempts a `PUT /api/flows/<id>` about 4-8s after load with no user edit**, and under simulated network failure the status still says "Up to date".

What already works and should be the base: the Call Reports / Assistant sans treatment, the expanded 240px sidebar, the neutral token ramp, the Lucide icon set, the dark theme, and the marketing site's type system.

---

## 2. Global system inventory (measured)

### 2.1 Fonts actually loaded (document.fonts, status loaded)
`Sora 600`, `Sora 700`, `Hanken Grotesk 500` (only weight 500), `JetBrains Mono 100-800` (variable), `Instrument Serif 400 italic`, plus `Syne` (wordmark on login and marketing). Body text on many pages falls back to **`ui-sans-serif`** (the Tailwind default stack, which is Segoe UI on Windows). The brand sans (Hanken Grotesk) is *not* the default body font in the app, even though it is the marketing font.

### 2.2 Font family dominance per page (characters of visible own text, top families)

| Page | Dominant | Others | Notes |
|---|---|---|---|
| /dashboard | JetBrains Mono 230 | ui-sans 75, Hanken 57 (sidebar footer only), Sora 42 | Input values also mono |
| /assistant | ui-sans 480 | Hanken 70, Sora 45 | Title case, calm |
| /analytics | JetBrains Mono 1312 | Instrument Serif 419, Sora 250, ui-sans 68, Hanken 57 | 5 families |
| /leads | JetBrains Mono 948 | Sora 344, ui-sans 68, Hanken 57 | |
| /flow-builder | JetBrains Mono 2325 | Sora 482, ui-sans 101 | Node bodies mono |
| /meeting-agent | JetBrains Mono 1023 | Hanken 57 (sidebar) | H1 is mono |
| /personal-agents | ui-sans 1078 | Hanken 57, Mono 47, Sora 23 | |
| /rep-console | JetBrains Mono 274 | ui-sans 68, Hanken 57 | H1 mono 24px/500 |
| /call-reports | **Hanken Grotesk 14818** | ui-sans 191, Sora 21 | Only app page in the brand sans |
| /billing | JetBrains Mono 365 | ui-sans 108, Sora 77 | |
| /knowledge | JetBrains Mono 1436 | ui-sans 111, Sora 84 | |
| /settings | JetBrains Mono 768 | Sora 205, ui-sans 86 | |
| /login (signed out) | JetBrains Mono 177 | ui-sans 45, Sora 35, Syne 5 | 4 families on one small card |
| / (marketing) | **Hanken Grotesk 6310** | Sora 104, Syne 5, Mono 4 | Cohesive |

### 2.3 Page header (H1) treatments: 13 variants

| Page | H1 text | Size/weight | Family | Tracking | Case | Extras |
|---|---|---|---|---|---|---|
| Dashboard | AGENT COCKPIT | 18/700 | Sora | +0.9px | UPPER | "IDLE" pill, mono telemetry strip (00:00, LAT, FLOW, SESSION) |
| Assistant | Assistant | 20/700 | Sora | -0.5px | Title | icon + subtitle (sans) |
| Analytics | ANALYTICS | **15/700** | Sora | **+2.7px** | UPPER | serif italic tagline "the dispatch from your line"; "UPDATED 16:55" tracked 4px |
| Leads | LEADS | 20/700 | Sora | **+4px** | UPPER | mono "24 SHOWN · 24 TOTAL" |
| Flow Builder | Flow Builder | 18/700 | Sora | +0.45px | Title | mono uppercase subtitle "VOICE JOURNEY WORKSPACE" |
| Meeting Agent | Meeting Agent — Vikash | 20/600 | **JetBrains Mono** | 0 | Title | violet "— Vikash" |
| Personal Agents | Personal Agents | **30/700** | Sora | -0.75px | Title | mono eyebrow "AUTONOMOUS TASKS" tracked 3px |
| Rep Console | Rep console | 24/**500** | JetBrains Mono | -0.6px | Sentence | "← Dashboard" back link, no wallet banner |
| Call Reports | Call Reports | 20/700 | Sora | -0.5px | Title | "121 calls" pill, sans subtitle |
| Billing | BILLING | 18/700 | Sora | +0.9px | UPPER | icon |
| Knowledge | AGENT KNOWLEDGE | 18/700 | Sora | +0.9px | UPPER | |
| Settings | SETTINGS | 18/700 | Sora | +0.9px | UPPER | global "Save Changes" |
| Settings › Organization | Organization | 24 | JetBrains Mono | 0 | Title | "BACK TO SETTINGS" bar, no sub-nav |
| API Keys | API Keys | 24/700 | Sora | 0 | Title | mono eyebrow "PUBLIC API" + icon |

Nav label and page title also disagree: "Agent View" vs "AGENT COCKPIT"; "Meet Agent" vs "Meeting Agent — Vikash"; "Knowledge" vs "AGENT KNOWLEDGE".

### 2.4 Content container widths (1440 viewport, sidebar 72px)
- Full-bleed (72→1440): Dashboard, Leads, Call Reports, Flow Builder, Analytics (content x≈143-1358), Meeting Agent (x≈104-1397).
- Centred about 1150px: Billing and Knowledge (x≈176-1326).
- Centred about 1120px, left-biased: Personal Agents (x≈191-1311).
- 640px column: Rep Console (x≈436-1076).
- 576px column inside a 1140px pane: Settings/Profile (x≈575-1150), leaving about 280px of empty space either side.
- 512px column: Settings/Organization.

### 2.5 Colour tokens observed (light theme)
- Text: #111725 (primary), #3E475A (secondary, 9.32:1 on white), **#7A8397 (muted, 3.80:1 on white, 3.52:1 on #F4F6FA, 3.36:1 on #EEF1F7: fails AA for text under 18px)**. The muted colour is the most frequent text colour on Analytics (85 elements) and Leads (98 elements).
- Surfaces: body #F4F6FA, card #EEF1F7 (plus 50% and 40% translucent variants), white.
- Border: #E1E6EF (0.8px hairlines), #CBD3E1.
- Accent / primary: **#2F5FE0** (blue) in light. In dark it becomes **#7C6BF5** (violet). Meeting Agent: **#8B5CF6** in both themes. Marketing: #7C6BF5 plus a gradient to cyan.
- Secondary accents: teal #0E9488 (Import CSV, Test Call, Re-analyze, analytics numbers, 3.74:1 on white), green #178A55 (ACTIVATE, success, 4.37:1), mustard #B5820E (3.41:1), red #D0463A (4.55:1), cyan rgba(56,198,224) (hour-of-day chart).
- Flow Builder node palette (Tailwind 400 series used as text colours on light surfaces): amber #FBBF24 **1.67:1**, orange #FB923C **2.26:1**, violet #A78BFA **2.72:1**, pink #F472B6 **2.65:1**.

### 2.6 Radii observed
4, 6, 8, 9, 12, 16, 20px and pill (`2.68435e+07px`, i.e. `rounded-full`), plus 0 on Meeting Agent's segmented control. Analytics alone uses pill ×43, 4px ×28, 8px ×25, 6px ×22, 16px ×9 and 20px ×4.

### 2.7 Button inventory (heights, type)
Observed button heights: 22, 24, 25, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 44, 48 and 58px. Type ranges from 10px mono uppercase with tracking (Leads and Analytics toolbars), to 12px mono (Flow Builder), 13px Hanken (Call Reports) and 14px system sans (Billing, Settings, Login). Primary filled buttons all use `rgb(47,95,224)` background with **`rgb(0,0,0)` text** (see VISUAL-AUDIT-03). Hover adds a 20px blue glow and a -1px lift, which is consistent and fine.

---

## 3. Findings

Severity: critical / high / medium / low. Each finding has evidence (measured) and a concrete recommendation.

### VISUAL-AUDIT-01: No single visual language: five co-existing styles across the app (high, consistency)
**Evidence:** See §2.2-2.4. Mono-dominant pages: Dashboard, Leads, Flow Builder, Meeting Agent, Billing, Knowledge, Settings, Rep Console. System-sans pages: Assistant, Personal Agents. Brand-sans page: Call Reports. Mono plus serif-italic editorial page: Analytics. Marketing and Login: dark, Hanken Grotesk, violet. Side by side, `SHOTS/assistant.png` vs `SHOTS/leads.png` vs `SHOTS/analytics.png` vs `SHOTS/meeting-agent.png` vs `SHOTS/call-reports.png` look like different products. Moving from the marketing site (dark, violet, Hanken) into the app (light, blue, mono) feels like changing vendors.
**Recommendation:** Adopt one type system app-wide:
- **Hanken Grotesk** (already the marketing font) as the UI and body face. Load weights 400/500/600/700; only 500 is loaded today.
- **JetBrains Mono** only for numerals in tables and KPIs (with `font-variant-numeric: tabular-nums`), IDs, phone numbers, code and keyboard hints.
- Drop Sora, or keep it only for display H1s on marketing. Drop Instrument Serif from the app entirely.
- Set `body { font-family: var(--font-sans) }` so nothing falls back to `ui-sans-serif`.

### VISUAL-AUDIT-02: 13 different page-header patterns; nav labels do not match page titles (high, consistency)
**Evidence:** §2.3 table. H1 size varies from 15 to 30px, weight 500-700, and tracking from -0.75px to +4px. Case varies too: UPPER on Dashboard, Analytics, Leads, Billing, Knowledge and Settings; Title case elsewhere. There are three different subtitle styles (mono uppercase, sans, serif italic). Eyebrows appear only on Personal Agents and API Keys. Container widths also vary (§2.4).
**Recommendation:** Build one `PageHeader` component. Use a 24px/600 Hanken H1 in sentence case with no tracking, an optional 14px secondary-colour description, right-aligned actions (max one primary), and an optional tab row. Use the same content max-width (e.g. 1280px, left-aligned with a 32px gutter) on every non-canvas page, and full-bleed only for Flow Builder and the Dashboard console. Make nav label = page title ("Agent console", "Meeting agent", "Knowledge").

### VISUAL-AUDIT-03: Primary buttons use black text on the brand blue (3.83:1) (high, accessibility / visual)
**Evidence:** Computed `color: rgb(0,0,0)` on `background: rgb(47,95,224)` for CONNECT (Dashboard, class `btn-saffron …`), NEW LEAD, NEW TASK, Save (Flow Builder), Export CSV, Enable UPI Auto-Debit, Pay with UPI, Upload & Embed, Save Changes, Upload (Settings), Sign In (Login) and the Assistant send button. Contrast is **3.83:1**, which fails WCAG AA 4.5:1 at 12-14px; white would be 5.48:1. Visible in `SHOTS/dashboard_connect_zoom.png`, `SHOTS/billing.png` and `SHOTS/login.png`. The class name `btn-saffron` and the `hover:text-saffron` utilities on the theme toggle suggest the primary token was re-pointed from saffron (where dark text was correct) to blue without updating the foreground token. In dark mode the same buttons are black on #7C6BF5 (5.28:1, which passes, but still reads muddy).
**Recommendation:** Define `--primary-foreground: #FFFFFF` and use it for every filled primary. Rename the `saffron` token to `primary`. Add a lint rule or visual test for filled buttons.

### VISUAL-AUDIT-04: Accent colour sprawl; primary hue differs by theme and page; semantic colours arbitrary (high, visual)
**Evidence:**
- Primary is blue #2F5FE0 in light, violet #7C6BF5 in dark, and violet #8B5CF6 hard-coded on Meeting Agent in both themes (`SHOTS/meeting-agent.png`, `SHOTS/dark_meeting-agent.png`, Create Room bg `rgb(139,92,246)`). Marketing is violet.
- Teal (#0E9488) is used for secondary CTAs (IMPORT CSV next to the blue NEW LEAD), Test Call, "Re-analyze", "Embed" and half the Analytics KPI numbers.
- The Analytics headline KPIs alternate blue, teal, blue, teal (121 / 24 / 1m 18s / 158) with no meaning.
- Call Reports KPIs are blue, teal, green and red.
- Flow Builder node categories use Tailwind-400 pastels as *text* on light (amber 1.67:1, orange 2.26:1, violet 2.72:1, pink 2.65:1) (`SHOTS/flow-builder.png`).
- ACTIVATE is green with a glow while Save is blue.

**Recommendation:** One brand primary for both themes. Pick violet (to match marketing) or blue, then generate a 50-900 ramp, using the 600 step on light (e.g. violet #6D5AE6, where white text is 4.93:1) and the 400-500 step on dark. Add semantic tokens: success #127A4B (5.37:1), warning #9A6B00 (4.69:1), danger #D0463A, info = primary. Neutral KPI numbers should be text-primary, with colour only for deltas. Node categories should use the icon tint only, with the text in text-primary.

### VISUAL-AUDIT-05: Icon-only sidebar clips Settings, shows a stray horizontal scrollbar, has no visible labels or tooltips, and hides 4 of 12 items at 768px height (high, ia-navigation)
**Evidence:**
- The nav is a 72px column. The `nav` element is `overflow-y:auto`, 548px tall with 572px of content at 1440x900, so the 12th item (Settings) is cut in half. On /settings the *active* item is the clipped one (`SHOTS/settings.png`, `SHOTS/sidebar_footer_zoom.png`).
- `nav.clientWidth` is 44 while `scrollWidth` is 175. The hidden text labels (opacity 0, Hanken Grotesk) overflow horizontally, so the browser draws a **horizontal scrollbar with ◂ ▸ arrows** over the Settings icon on every page. The vertical scrollbar also shows ▴ ▾ arrows.
- Hovering an item for 1.6s shows no visible tooltip; only the native `title` attribute exists (`SHOTS/dashboard_sidebar_hover.png`, `SHOTS/nav_hover_leads.png`). The footer buttons (theme toggle) do have a custom tooltip ("Light mode" in `SHOTS/dark_dashboard.png`), which is inconsistent.
- At **1366x768** (a common Indian laptop resolution) the nav is 416px tall vs 572px of content, so only **8/12** items are fully visible. Call Reports, Billing, Knowledge and Settings sit behind an inner scroll.
- The footer status ("green dot" + "12ms") is cryptic.
- The 12 items are a flat list with no grouping.
- Keyboard: moving from item 1 to item 8 took 14 Tab presses, suggesting 2 tab stops per item (inferred).

**Recommendation:**
- Default to the **expanded 240px sidebar** at widths ≥1280. It is already well designed (`SHOTS/sidebar_expanded.png`): labels fit and nothing clips.
- Group the items: *Build* (Assistant, Flow Builder, Knowledge), *Run* (Agent console, Meeting agent, Personal agents, Rep console), *Results* (Analytics, Call reports, Leads), *Account* (Billing, Settings).
- In collapsed mode, set `overflow-x:hidden` on the nav, hide scrollbars (`scrollbar-width:none` plus fades), and show a custom tooltip on hover and focus after about 300ms.
- Pin Settings to the footer. Remove the latency readout or move it into a status popover.

### VISUAL-AUDIT-06: Type scale too small; overuse of uppercase mono with wide tracking; muted text fails contrast (high, accessibility / visual)
**Evidence:**
- Analytics has 57 text elements at 9px, 51 at 10px and 5 at 8px, with letter-spacing up to 4px (1.8px ×28, 2.25px ×12, 3px ×9, 4px ×9). 84 elements are uppercase, 76 of them mono.
- Leads has 90 at 10px, 46 at 9px and 24 at 8px; 111 uppercase elements.
- Dashboard's most common size is 9px.
- Muted #7A8397 is 3.8:1 on white, 3.52:1 on the page background and 3.36:1 on cards.
- Sampled examples:
  - Dashboard "STANDBY" #8FA9ED on #F3F5FA: **2.12:1**.
  - "Awaiting connection..." #9FA7B5 on white: **2.4:1**.
  - Call Reports placeholder dashes (muted at 50% alpha): **1.81:1** (498 elements).
  - Personal Agents card subtitles: **2.2:1**.
  - Test Call (disabled) text: 1.64:1 (disabled states are exempt, but it looks broken).

**Recommendation:**
- Minimum 12px for any label and 13-14px for body/table text.
- Uppercase only for a single 11-12px eyebrow per section, with tracking ≤0.06em (about 0.7px at 12px).
- Replace muted #7A8397 with **#5B6478** (5.93:1 on white, 5.24:1 on #EEF1F7).
- Never use alpha on text colours; use solid tokens.

### VISUAL-AUDIT-07: Analytics editorial decoration hurts hierarchy (inverted H1/H2, § markers, serif italics, corner brackets, Identity first) (medium, visual)
**Evidence:** `SHOTS/analytics.png` and `SHOTS/analytics_full.png` (crops in `SHOTS/crops/analytics_full_0..3.png`). The page is 3898px tall inside an inner scroller.
- The H1 "ANALYTICS" is 15px while each section H2 ("Identity", "Headline", "Sentiment", "Flow", "Intents", "Phone", "Recent", "Recordings") is **27.2px/800**. The hierarchy is inverted.
- Each H2 carries a "§ 0N" marker (mono, tracked), an Instrument Serif italic tagline ("— who is on the line", "— this past week, in numerals") and a hairline rule.
- Cards use corner brackets and diagonal hatch fills over a graph-paper grid.
- Section 01 is **Identity** (operator name, email, plan "—", role), so KPIs start below the fold at y≈570.
- "not allocated yet" is 30px serif italic grey (3.42:1).
- Intent labels truncate to about 110px ("Appointment ...", "Airport Passe...", "Real Estate In...") while the bars take about 900px.
- The hour-of-day chart renders 24 empty cyan cells instead of an empty state.

**Recommendation:**
- Order the page: KPI row, then Sentiment trend, then Flow funnel, then Intents, then Recent calls. Move Identity and DID to Settings or Billing.
- Remove § markers, serif taglines, corner brackets and hatch. Keep the grid background off data surfaces.
- H1 24px; section titles 16-18px/600.
- Give intent labels a 200px column with wrapping or a tooltip.
- Use empty-state components for charts with no data.

### VISUAL-AUDIT-08: Semantic colour misuse in charts and deltas (medium, visual)
**Evidence:**
- Analytics "WoW SHIFT" chips: "negative +13pp" is **green**, and "neutral -25pp" is red. Colour encodes direction, not good or bad (`SHOTS/crops/analytics_full_0.png`).
- Durations in the Recent table are link-blue (#2F5FE0) but not links.
- The sentiment stacked-area uses mustard for neutral (dominant), teal for positive and red for negative. Mustard dominates, so the chart reads as a warning.

**Recommendation:** Map colours to meaning: a rise in negative sentiment is red, a rise in positive is green, neutral is grey. Reserve primary blue or violet for interactive elements. Use a neutral grey for "neutral" in the sentiment palette.

### VISUAL-AUDIT-09: Leads: 44% of the viewport is chrome before the first row; huge dead column; grid shows through rows; fake letter icons (medium, visual / density)
**Evidence:** `SHOTS/leads.png`. The first data row starts at y≈400 of 900. The stack above it is: banner 42 + header 80 + KPI strip 70 + shortcuts bar 36 + search 52 + two filter-chip rows 70 + table header 36, leaving about 7.5 rows visible. Between the name column and Status (x≈440→1160) there are about 720px of empty space. Rows are transparent over the graph-paper grid, so vertical grid lines cut through every row. Source chips use letter glyphs as icons ("F FACEBOOK", "IG INSTAGRAM", "G GOOGLE", "{} API", "✎ MANUAL", "◎ DEMO"). The avatar has a small overlapping edit/phone badge. Every row has a blue call icon button.
**Recommendation:**
- Collapse the filters into one toolbar row: search, a Status dropdown, a Source dropdown, Language and Outcome.
- Move keyboard shortcuts into a "?" popover.
- Use real columns: Name, Phone, Status, Source, Last call, Interest, Owner, and actions. The row should be solid white with a hover tint and a 48-52px height.
- Use proper brand SVGs or text only for sources.

### VISUAL-AUDIT-10: Flow Builder canvas polish: overlapping nodes, truncated palette, tiny node text, unthemed edge label, grey-slab minimap, mismatched Save/ACTIVATE (medium, flow-designer)
**Evidence:**
- On load, **"Knowledge Lookup" overlaps "Confirm Interest"** (bounding boxes intersect; `SHOTS/flow-builder_node_zoom.png`), hiding the question text.
- Palette tiles truncate: "Knowle…", "CRM Lo…", "Book Me…", "WhatsA…", "Human …", "Human Han…", "Verify Cu…". The 2-column grid sits in a 270px panel.
- The palette repeats items: the "START HERE" group duplicates Speak, Question, Branch and Human from "CONVERSATION".
- Node body text is 11px JetBrains Mono, rendered at canvas zoom below 1 (about 9px on screen). The edge label "Not Interested" is 10px in a white box, still white in dark mode (`SHOTS/dark_flow-builder.png`).
- The light-mode minimap uses mask `rgba(0,0,0,.38)` over a white panel, which reads as a solid grey slab (`SHOTS/flow-builder_minimap_zoom.png`); it looks right only in dark.
- There are 9 icon-only toolbar buttons.
- Save is blue, 8px radius, title case, black text. ACTIVATE is green, 12px radius, UPPERCASE, white text, with a green glow.
- The two-row header takes about 180px before the canvas.

**Recommendation:**
- Run auto-layout (dagre/elk) when a flow loads with overlaps.
- Use a single-column palette (icon + full label) with no duplicate groups.
- Node text 13px sans with a mono label only for type; theme the edge labels.
- Minimap mask `rgba(0,0,0,.08)` in light.
- Save as a secondary button and Activate as primary, both the same height, radius and case.
- Collapse the header to one 56px row.

### VISUAL-AUDIT-11: Flow Builder attempts to save the flow without any user edit; status still says "Up to date" when the save fails (high, functional-bug)
**Evidence:** In two separate loads of /flow-builder (light and dark), with no interaction other than the theme toggle, my tab's guard recorded **`PUT https://vaanilabs.in/api/flows/f9b04a18-…`** about 4-8s after load. Afterwards the header status pill still read **"Up to date"** and no error toast appeared (observed under simulated network failure; `SHOTS/dark_flow-builder_after_autosave.png`). The app initiated the request itself; the failure is our guard's.
**Recommendation:** Autosave only after a real user change (a dirty flag set by user actions, not by React Flow measurement or fitView). Compare a serialised hash before saving. Make the status pill reflect in-flight, failed and offline states ("Saving…", "Couldn't save, retry"). Because this is a production account, simply viewing a flow should never write it.

### VISUAL-AUDIT-12: Meeting Agent: all-mono page, off-system violet, developer internals shown to customers (medium, trust-safety / consistency)
**Evidence:** `SHOTS/meeting-agent.png` and `SHOTS/meeting-agent_full.png`.
- 100% JetBrains Mono, including the H1 (20/600) and body.
- Primary is violet #8B5CF6 (Create Room, segmented control, "— Vikash"), which differs from the app's blue and from the dark theme's #7C6BF5.
- The right rail shows "**BACKEND — Meeting agent runs on port 8090 — NEXT_PUBLIC_MEET_AGENT_URL**" and "GPU SERVER STATUS · Online".
- The active room row has an unlabeled red square stop button, and the "LIVE" operations row reads "82h 49m".
- Segmented-control radius is 0 while the rest of the page uses 8px.

**Recommendation:** Use app typography and the primary token. Remove backend, port and env-var text; show infrastructure health on /status for admins only. Label destructive controls ("End room"). Use the same card and segmented components as the rest of the app.

### VISUAL-AUDIT-13: Personal Agents: muddy grey cards, missing space, a different layout grid and a scrollbar-induced shift (medium, visual)
**Evidence:** `SHOTS/personal-agents.png`.
- The three example cards sit on 20% black (sampled rgb(195,197,200)). The subtitle #7A8397 on that grey is **2.2:1**. They look disabled or dirty.
- The copy reads "hand a **goal**instead of a script": `<span class="text-text-primary">goal</span>instead`, a JSX whitespace bug.
- The layout is centred at about 1120px with a 30px H1 heavier than any other page. The header actions ("SETTINGS", "REFRESH" as mono uppercase text buttons and a "NEW TASK" primary) float mid-right.
- The document scrolls by 42px for no reason (942 vs 900). The scrollbar gutter shifts the wallet-banner buttons about 10px left compared with other pages (Top up at x=1205 vs 1215).
- The empty state is a single centred sentence.

**Recommendation:** Use the standard card surface (white, #E1E6EF border) for the examples. Fix the whitespace (`{' '}`). Use the shared PageHeader and container. Reserve the scrollbar gutter (`scrollbar-gutter: stable`) app-wide. Use the shared EmptyState component.

### VISUAL-AUDIT-14: Raw and unfinished artefacts: native file inputs, storage filenames, mixed date formats, stray hints (medium, visual / content-copy)
**Evidence:**
- An unstyled native `<input type=file>` ("Choose file No file chosen") appears on Knowledge and in Settings › WhatsApp brochure (`SHOTS/knowledge.png`, `SHOTS/settings.png`).
- Knowledge filenames show storage prefixes ("1789987752864-…pdf").
- There are four date formats: "21/09/2026, 16:19:12" (Knowledge), "21 Sept, 22:44" (Call Reports and Analytics), "23 Sept 2026" (Meeting Agent) and "28d ago" (Leads).
- The expanded sidebar shows "Collapse [" (a bare shortcut glyph).
- The login footer reads "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled".
- The login password placeholder is "••••••••", which looks pre-filled.

**Recommendation:**
- Build a styled dropzone component ("Drop files or browse · PDF, DOCX, TXT, CSV up to N MB").
- Strip storage prefixes for display.
- Use one date utility: relative for under 7 days ("2h ago"), then "21 Sep 2026, 22:44". Use tabular numerals in tables.
- Render keyboard hints as `<kbd>` chips.
- Remove the version and marketing footer from login. Use a plain placeholder or none for the password.

### VISUAL-AUDIT-15: Persistent wallet banner dominates every page, including Billing, and competes with page CTAs (medium, visual / ux)
**Evidence:** A 42px lavender bar (rgb ~#DDE3F7) with a filled "Top up" and an outlined "Enable autopay" sits at the top of every authenticated page except Rep Console (`SHOTS/*.png`). On /billing it duplicates the page's own "Enable UPI Auto-Debit" and "Pay with UPI" CTAs (`SHOTS/billing.png`). On Flow Builder it pushes the canvas down, and its filled Top up is the first primary button the eye meets on every page.
**Recommendation:** Replace it with a compact status chip in the top bar ("Wallet ₹0 · Top up"). Escalate to a banner only at the moment of a blocked call action, and hide it on /billing. If a banner is kept, use the warning semantic (amber tint) and a text-link CTA, not a filled button.

### VISUAL-AUDIT-16: Cards, borders, radii and button sizes lack a scale; nested box-in-box on Dashboard (medium, design-system)
**Evidence:** Radii 4/6/8/9/12/16/20/pill/0 (§2.6). 18 distinct button heights (§2.7). On the Dashboard, Customer Intel nests a panel, then a field card, then an input with its own border and background: three concentric outlines per field, six fields deep (`SHOTS/dashboard.png`). "Test Call" wraps to two lines (58px) next to a 38px input (`SHOTS/dashboard_connect_zoom.png`). Card treatments vary: white with a hairline border; #EEF1F7 fill without border; translucent 50% fill; dashed border (Organization empty state); hatch plus corner brackets (Analytics).
**Recommendation:** Radius scale 6 (controls) / 10 (cards) / 16 (modals) / pill (chips only). Button sizes: sm 32, md 36, lg 44, with `white-space:nowrap`. One card style (white, 1px #E1E6EF, 10px radius, no shadow; hover shadow only for clickable cards). Form fields: label above plus input, with no wrapping card.

### VISUAL-AUDIT-17: Seven different empty-state styles and several loaders (medium, consistency)
**Evidence:**
- Assistant: icon tile, H2 and suggestion chips.
- Dashboard transcript: "Awaiting connection..." in mono grey at 2.4:1.
- Personal Agents: a plain sentence with a link.
- Billing: a bordered mono box, "No transactions yet."
- Analytics: tracked "NO DATA" plus a serif-italic line.
- Settings › Organization: a dashed box with a shield icon and an outlined button.
- API Keys: a plain mono line.

Loaders vary as well: a centred spinner with "Loading..." (sans) on Leads, a mono "Loading…" on Settings sub-pages, and "Requesting softphone credentials…" in a box on Rep Console.
**Recommendation:** One `EmptyState` (24px icon, 16/600 title, 14px body, one primary action) and one `Skeleton`/`PageLoader` pattern.

### VISUAL-AUDIT-18: The app shell (sidebar, banner, header) pops in late on hard navigation (medium, performance / visual)
**Evidence:**
- 3s after DOMContentLoaded, /meeting-agent showed a faded page with the sidebar missing (first capture, later overwritten).
- At 2.8s, /settings/organization showed only "BACK TO SETTINGS" and "Loading…", with no sidebar or banner.
- At 1366x768, /dashboard at 3.5s showed only the ring and transcript panel, with no sidebar, header or Customer Intel (`SHOTS/dashboard_1366x768.png`), and /leads at 3s showed a full-screen spinner (`SHOTS/leads_1366x768.png`).
- Once loaded, all of them render the full shell. One later navigation exceeded 15s to DOMContentLoaded.

Caveat: the browser was shared with several agents, so absolute timings may be inflated. The *pattern* (shell rendered after data, not before) is still visible.
**Recommendation:** Render the persistent shell (sidebar, top bar) in the layout so it never unmounts between routes. Show per-region skeletons instead of whole-page spinners. Avoid mount animations on the shell.

### VISUAL-AUDIT-19: Settings IA and visuals: 17 flat items, misleading external-link icons, sub-pages drop the sub-nav, global Save (medium, ia-navigation)
**Evidence:** `SHOTS/settings.png`. There are 17 sub-nav items (Profile … Delete Account), and **14 carry an ↗ external-link icon** although they navigate in the same tab to /settings/*, /api-keys or /webhooks. Those destinations drop the settings sub-nav and replace it with a "BACK TO SETTINGS" bar (`SHOTS/settings_organization.png`) or a standalone layout (`SHOTS/settings_api-keys.png`). "Save Changes" sits in the global header but only applies to the Profile form. The profile form is a 576px column inside a 1140px pane.
**Recommendation:** Group the items (Account: Profile, Security, Email; Workspace: Organization, Members, Calling number, Call channel; Developers: API keys, Webhooks, Embed; Integrations; Billing & data; Danger zone). Keep the sub-nav visible on every settings route. Remove the ↗ icons except for truly external docs. Put Save at the bottom of each form, sticky when dirty.

### VISUAL-AUDIT-20: Dark mode is more coherent than light, but the brand hue changes and some pieces are unthemed (low, visual)
**Evidence:** `SHOTS/dark_dashboard.png`, `dark_analytics.png`, `dark_leads.png`, `dark_flow-builder.png`, `dark_call-reports.png`, `dark_meeting-agent.png`. Surfaces are #0C0D12 / #14161D / #1A1D26, and muted #7B8196 reaches 5.01:1 on the background (4.35:1 on cards). Issues:
- The primary turns violet (#7C6BF5) while light is blue.
- The Flow Builder edge label stays white.
- The serif "not allocated yet" is low contrast.
- The theme toggle shows a sun in light and a moon in dark with the tooltip "Light mode", which is ambiguous.
- The app defaults to light while marketing and login marketing default to dark (home `html.dark`).

**Recommendation:** Keep dark mode and treat its neutral ramp as the reference. Unify the primary hue across themes. Theme every canvas and SVG element via tokens. Make the toggle a 3-way (Light / Dark / System) menu in the profile menu.

### VISUAL-AUDIT-21: Agent Cockpit hierarchy: a decorative ring dominates while controls are small; sample data shown in mono (low, visual)
**Evidence:** `SHOTS/dashboard.png`. A 320px animated ring with "STANDBY" (2.12:1) takes the centre. The actual controls (voice toggle, number field, Test Call, CONNECT) are small beneath it. The Customer Intel column shows six boxed fields prefilled with sample-style values in mono. The transcript panel is an empty white column with "Awaiting connection...". The telemetry strip ("LAT: 0ms · SESSION: IDLE") is 10px mono.
**Recommendation:** Lead with a clear "Start a test call" card (agent picker, number, primary CTA). Shrink the ring to a status indicator (about 120px). Show customer context as a compact read-only summary with an "Edit" affordance. Give the transcript an instructive empty state.

### VISUAL-AUDIT-22: Icon language mostly consistent (Lucide 1.5px), with exceptions (low, visual)
**Evidence:** Sidebar and most pages use Lucide outline icons, which is good. Exceptions:
- Letter glyphs as source icons (Leads).
- A solid blue ▼ sort triangle (Call Reports "Started ▼").
- Emoji as icons on the marketing industry tabs (🛍 🏦 🩺 🏢 🛡 🎓) and flow examples (📦 ↩️ 💸).
- The ↗ icons in Settings.
- A red filled square for "stop" on Meeting Agent.

**Recommendation:** Use Lucide throughout, including `ArrowDown` / `ChevronsUpDown` for sort. Use brand SVGs (simple-icons) for Facebook, Instagram and Google. Replace emoji on marketing with duotone icons in the brand tint.

### VISUAL-AUDIT-23: Marketing and login: polished, but some contrast and detail issues (low, visual)
**Evidence:** The home page (`SHOTS/home.png`, `SHOTS/home_full.png`, `SHOTS/home_gap1.png`, `SHOTS/home_gap2.png`) is cohesive: Hanken Grotesk H1 72/600 at -1.8px, violet-to-cyan gradient text, consistent 16px-radius dark cards, and good product mocks (transcript player, analytics card, flow mock). Issues:
- 12px white text on #7C6BF5 chips ("English", "E-commerce") is **3.98:1**.
- The "GET STARTED" eyebrow's decorative dash sits about 360px left of the centred label.
- Scroll-reveal sections are invisible until intersected, so a full-page capture leaves about 700px and 1100px blank bands (print and share previews will show blanks).
- Login combines four families (Syne wordmark, Sora heading, JetBrains Mono subtitle and labels, system sans buttons and inputs) on one card (`SHOTS/login.png`).

**Recommendation:** Darken chip fills to about #6D5AE6 (4.93:1) or use dark text. Align the eyebrow rule to the label. Make reveal animations progressive (content visible by default, animate with `@media (prefers-reduced-motion: no-preference)`). Use Hanken on login throughout.

### VISUAL-AUDIT-24: Call Reports: best-looking data page, but a wide table with empty columns and shouting pills (low, visual)
**Evidence:** `SHOTS/call-reports.png`. Hanken Grotesk 13px, clean. But:
- The table scrolls horizontally because every flow field ("Confirm Interest", "Condition Check", "Condition…") gets a column, and most cells are "—" at 1.81:1.
- Status and sentiment pills are UPPERCASE ("COMPLETED", "NEUTRAL").
- Summaries truncate at 2 lines in a 190px column.
- "Avg Duration 90s" here vs "1m 18s" on Analytics (a data/format inconsistency; flagged for the content/QA agents).

**Recommendation:** Collapse the flow fields into an expandable "Extracted fields" row detail or a column picker. Use sentence-case pills. Give the summary more width, with the full text on row hover or open.

---

## 4. Strengths worth preserving

1. **Neutral token ramp is consistent across pages:** text #111725 / #3E475A, surfaces #F4F6FA / #EEF1F7 / white, hairline #E1E6EF. It is a good base for a proper token system.
2. **Lucide icon set** with a consistent stroke across the sidebar and most pages.
3. **Expanded sidebar** (240px) is clean, readable and fits all 12 items without clipping (`SHOTS/sidebar_expanded.png`).
4. **Call Reports and Assistant** show the right direction for app pages: sans type, title case, calm hierarchy, clear primary action (`SHOTS/call-reports.png`, `SHOTS/assistant.png`).
5. **Dark mode** is thorough and in several places more coherent than light (`SHOTS/dark_*.png`).
6. **Marketing site** has a real type system and polished product mocks. The app should inherit its font (Hanken Grotesk) and hue (violet).
7. **Hover feedback on primary buttons** (a 20px glow and -1px lift) is consistent.
8. **Keyboard focus is visible** (default outline not suppressed). Leads offers keyboard shortcuts.
9. **Privacy-conscious masking** of phone numbers (+91••••••0319) throughout.
10. **Flow Builder** has useful affordances: validation badge, node and link counts, undo/redo, zoom controls and minimap (dark).
11. **Login** is a clear centred card with a sensible order (OAuth, then email/password, then magic link).

---

## 5. Recommended design direction (for the redesign spec)

- **Type:** Hanken Grotesk 400/500/600/700 for UI; JetBrains Mono for numerals, IDs and code only. Scale: 12 / 13 / 14 / 16 / 18 / 20 / 24 / 32. Body 14/20. Labels 12/16 in sentence case. At most one eyebrow per section, at 11-12px with 0.06em tracking.
- **Colour:** One primary hue in both themes. Violet matches the marketing site: 600 #6D5AE6 on light (white text 4.93:1), 400-500 on dark. Neutrals: text #111725 / #3E475A / #5B6478; surfaces #F6F7FA / white; border #E3E7EF. Semantic: success #127A4B, warning #9A6B00, danger #D0463A, info = primary. Data-viz palette: 6 categorical colours, validated for ≥3:1 against the surface for marks and 4.5:1 for text.
- **Shape:** radius 6 / 10 / 16 / pill; 1px borders; shadows only for overlays and clickable hover.
- **Spacing:** 4pt grid; page gutter 32; card padding 20-24; table rows 48-52.
- **Components to standardise:** AppShell (expanded nav with groups, top bar with wallet chip, user menu, theme menu), PageHeader, Toolbar/FilterBar, DataTable, KPI tile, Card, EmptyState, Skeleton, Dropzone, Button (primary / secondary / ghost / danger × sm / md / lg), Pill/Badge (sentence case), Tooltip, Kbd.
- **Remove:** § markers, serif italics, corner brackets, hatch fills, graph-paper grid behind data, decorative ring at hero size, developer and infra text, emoji icons, letter-glyph icons.

---

## 6. Open questions

1. Is the brand primary meant to be blue or violet? The code hints at a third, saffron (`btn-saffron`).
2. Is the Flow Builder save-on-load intentional (e.g. migrating a flow schema on open)? If so, it should be explicit and should not touch `updated_at`.
3. Should Analytics' "Identity" and DID blocks live on Analytics at all?
4. Is the 72px collapsed sidebar the intended default for all widths?
5. Does dismissing the wallet banner persist? Not tested; dismissal needs a real write and was out of scope.

---

## 7. Screenshot index (`SHOTS/`)

- **Light:** dashboard.png, dashboard_connect_zoom.png, dashboard_sidebar_hover.png, assistant.png, analytics.png, analytics_full.png (+ crops/analytics_full_0..3.png), leads.png, flow-builder.png, flow-builder_node_zoom.png, flow-builder_minimap_zoom.png, meeting-agent.png, meeting-agent_full.png, personal-agents.png, rep-console.png, call-reports.png, billing.png, knowledge.png, settings.png, settings_organization.png, settings_api-keys.png, sidebar_footer_zoom.png, sidebar_expanded.png, nav_hover_leads.png, focus_state_1.png, focus_state_2.png, hover_primary_billing.png.
- **1366x768:** dashboard_1366x768.png (partial shell render), leads_1366x768.png (full-screen loader).
- **Dark:** dark_dashboard.png, dark_analytics.png, dark_leads.png, dark_flow-builder.png, dark_flow-builder_after_autosave.png, dark_call-reports.png, dark_meeting-agent.png.
- **Signed-out:** login.png, home.png, home_full.png (+ crops/home_full_0..4.png), home_gap1.png, home_gap2.png.
