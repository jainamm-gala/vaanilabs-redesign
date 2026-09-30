
### F-VIS-028 — Dark theme is the more coherent theme, but the primary turns violet, some elements stay unthemed and a few pairs still fail AA
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-20, A11Y-AUTO-20
- **Pages:** all app pages in dark (`html.dark`); measured on /dashboard, /analytics, /leads, /flow-builder, /call-reports, /meeting-agent
- **Evidence:**
  - **Healthier baseline.** Surfaces are #0C0D12 / #14161D / #1A1D26, and muted #7B8196 is 5.01:1 on the background. Dark /dashboard has 7 failing text groups against 26 in light. Per page, 7–19% of measured text fails in dark against 31–78% in light (F-VIS-003).
  - **Pairs that still fail on dark /dashboard:**

    | Pair | Ratio |
    |---|---|
    | Muted #7B8196 on card #1A1D26 | 4.35:1 |
    | "Top up" #E8EAF2 on #7C6BF5 | 3.31:1 |
    | White on #7C6BF5 (marketing "Get started" / "Start free") | 3.98:1 |
    | "Enable autopay" #7C6BF5 on #1C1B34 | 4.20:1 |
    | "Save Context" #7C6BF5 on #181826 | 4.40:1 |
    | "STANDBY" #6C5ED4 (86%) on #0C0D12 | 3.86:1 |
    | Placeholders #3B404B on #111419 | 1.78:1 |

  - **The hue changes.** `--saffron` goes from blue #2F5FE0 to violet #7C6BF5, and `--peacock` from teal #0E9488 to cyan #38C6E0 (root cause in F-VIS-004).
  - **Unthemed pieces.** The Flow Builder edge label ("Not Interested") stays a white box in dark. The Analytics serif "not allocated yet" is low contrast.
  - **The defaults disagree.** The app defaults to light, while marketing `/` is `html.dark`. The theme toggle's labelling is covered in F-VIS-032.
- **Screenshots:** audit/screenshots/va-visual-audit/dark_dashboard.png, audit/screenshots/va-visual-audit/dark_analytics.png, audit/screenshots/va-visual-audit/dark_flow-builder.png, audit/screenshots/va-visual-audit/dark_meeting-agent.png, audit/screenshots/va-a11y-auto/dashboard-dark.png
- **Recommendation:**
  - Keep dark mode and use its neutral ramp as the reference when retuning light (F-VIS-003).
  - Use one primary hue in both themes (F-VIS-004). Set `--primary-foreground` per theme so every filled button reaches 4.5:1: near-black on the dark 400 step (black on #7C6BF5 is 5.28:1), or white on the 600 step (#6D5AE6, 4.93:1).
  - Raise dark `--text-muted` to about #8A90A5 (about 5.3:1 on #1A1D26, computed). Give placeholders a token of at least 4.5:1.
  - Drive React Flow edge labels, minimap and chart marks from tokens (`--surface`, `--text-primary`), not literals.
  - Add a dark-theme pass to the contrast and visual-regression suite. Offer Light / Dark / System, defaulting to System (see F-VIS-021 for the `dark:` variant).

### F-VIS-029 — Agent Cockpit: a 320px decorative ring dominates while the real controls are small
- **Severity:** low · **Confidence:** single-agent (the EXPLORE-CORE page notes describe the same composition)
- **Source findings:** VISUAL-AUDIT-21
- **Pages:** /dashboard
- **Evidence:**
  - **The ring leads the page.** An animated ring of about 320px (a 312px element with a dashed spinner) holds the centre, labelled "STANDBY" in 14px #8FA9ED on #F3F5FA (2.12:1).
  - **The controls sit small beneath it.** The Vaani/Vikash toggle is 38px tall (Vikash is #7A8397 on #F7F8FB, 3.58:1). Below it are a 38px phone input, an 87x58 Test Call and CONNECT (F-VIS-030).
  - **Customer Intel** is six boxed mono fields pre-filled with sample-style values. Where that data comes from is covered in the UX section.
  - **Transcript panel:** an empty white column with "Awaiting connection..." at 2.4:1.
  - **Telemetry strip:** "LAT: 0ms · SESSION: IDLE" in 10px mono.
  - **Motion:** the ring, STANDBY and "breathe" animations keep running under `prefers-reduced-motion` (A11Y-MANUAL-19, accessibility section).
  - **Side effects:** the fixed-height ring causes the CONNECT collision at 1024–1279px (F-VIS-007). At 1920 the centre column is about 1,150px of empty grid (F-VIS-034).
- **Screenshots:** audit/screenshots/va-visual-audit/dashboard.png, audit/screenshots/va-verify-visual-audit/standby_zoom.png, audit/screenshots/va-explore-core/crop_cockpit_controls.png
- **Recommendation:**
  - Lead with a "Start a test call" card containing:
    - flow and voice pickers;
    - a number field;
    - one primary "Call in browser" and one secondary "Call a phone", each with a one-line explanation and its cost.
  - Shrink the ring to a status indicator of about 120px with a text status (Idle / Connecting / Live 00:42) in text-primary, inside an `aria-live="polite"` region. Animate it only while a call is live, and never under reduced motion.
  - Show Customer Intel as a compact read-only summary with an "Edit" action.
  - Use the shared `EmptyState` for the transcript ("Start a call to see the live transcript here").
  - Move the telemetry into a 12px status popover.

### F-VIS-030 — Test Call and CONNECT: states are hard to tell apart and the labels are low contrast
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** QA-A-20, A11Y-MANUAL-26
- **Pages:** /dashboard
- **Evidence:**
  - **Test Call:**
    - It is JetBrains Mono 14px teal #0E9488 on a 20% teal tint. Enabled, that is 2.95:1. Disabled differs only by `opacity:.5` (1.64:1).
    - The enabled state keeps `cursor: default`.
    - The label wraps to 2 lines in an 87x58 box next to a 38px input.
    - It enables on any text: `disabled = calling || !value.trim()`. Validation is covered in the UX section (QA-A-08, EXPLORE-CORE-13).
  - **CONNECT:**
    - Black 14px system-sans text on #2F5FE0.
    - A11Y-MANUAL-26 estimated about 4.15:1. Computed-colour measurements by three other agents give 3.83:1; white would be 5.48:1.
    - The global primary-foreground fix belongs to the accessibility section (VISUAL-AUDIT-03, DESIGN-SYSTEM-01).
  - **The two call actions share nothing.** They differ in family (mono vs system sans), height and colour, and nothing says which one dials a phone.
- **Screenshots:** audit/screenshots/va-explore-core/cockpit_phone_filled.png, audit/screenshots/va-qa-a/dash_phone_123_testcall_enabled.png, audit/screenshots/va-visual-audit/dashboard_connect_zoom.png, audit/screenshots/va-verify-a11y-auto/connect-btn.png
- **Recommendation:**
  - **Test Call:** `Button variant="secondary" size="md"`: 36px, `white-space: nowrap`, sentence case "Test call", `cursor: pointer`, text-primary on white with a #CBD3E1 border.
  - **Disabled state:** a shared disabled token (a `--surface-light` fill, muted text, `cursor: not-allowed`) plus helper text giving the reason ("Enter a valid phone number"). Stay disabled until the number is valid.
  - **CONNECT:** `--primary-foreground: #fff` (5.48:1), relabelled "Call in browser" with a mic icon.
  - Put both actions in one row at the same height.

### F-VIS-031 — Icons: Lucide is the norm, but letter glyphs, emoji, a solid sort triangle and misleading ↗ icons break it
- **Severity:** low · **Confidence:** multi-agent (DESIGN-SYSTEM measured Lucide coverage; PUBLIC-SITE also noted the emoji)
- **Source findings:** VISUAL-AUDIT-22
- **Pages:** /leads, /call-reports, /settings, /meeting-agent, marketing `/`
- **Evidence:**
  - **Lucide coverage:** Leads 84/84 SVGs, Call Reports 266/266, Analytics 75/78. There are 22 rendered icon sizes (mostly 20, 16, 14, 12, 11, 10, 9 and 8px).
  - **Exceptions:**

    | Where | Exception |
    |---|---|
    | Leads source chips | Letter glyphs: "F FACEBOOK", "IG INSTAGRAM", "G GOOGLE", "{} API", "✎ MANUAL", "◎ DEMO" |
    | Call Reports | A solid blue ▼ sort triangle ("Started ▼") |
    | Settings sub-nav | ↗ external-link icons on 14 of 17 items, all of which open in the same tab |
    | Meeting Agent | An unlabelled red filled square as "stop" |
    | Marketing | Emoji on the industry tabs (🛍 🏦 🩺 🏢 🛡 🎓), flow examples (📦 ↩️ 💸) and security features (🎯 🔐 🌐) |

  - Duplicate icons in the Settings sub-nav are covered in F-VIS-032.
- **Screenshots:** audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-visual-audit/call-reports.png, audit/screenshots/va-visual-audit/settings.png, audit/screenshots/va-visual-audit/meeting-agent.png, audit/screenshots/va-visual-audit/home_full.png
- **Recommendation:**
  - **Library and sizes:** Lucide only in the app, at 16 / 20 / 24px with a 1.75px stroke (tokens `--icon-sm/md/lg`).
  - **Sort:** `ArrowUp` / `ArrowDown` / `ChevronsUpDown` inside the header button, with `aria-sort` on the `<th>`.
  - **Sources:** brand SVGs (simple-icons) for Facebook, Instagram and Google, and Lucide icons for API, Manual and Demo.
  - **Links:** use `ExternalLink` only for off-site targets.
  - **Stop:** a labelled destructive button ("End room") with a Lucide icon.
  - **Marketing:** replace emoji with duotone Lucide icons in the brand tint.

### F-VIS-032 — Sidebar and Settings sub-nav polish: stray "Collapse [" glyph, a theme toggle whose icon and label disagree, duplicate icons, no grouping
- **Severity:** low · **Confidence:** multi-agent (the same observations appear in EXPLORE-CORE-19, VISUAL-AUDIT-14 and RESPONSIVE-A-15)
- **Source findings:** EXPLORE-SETTINGS-25, VISUAL-AUDIT-20 (toggle sub-point)
- **Pages:** global rail (expanded and collapsed), /settings sub-nav
- **Evidence:**
  - **"Collapse [".** The `[` is a lone grey bracket at 60% alpha, an unexplained shortcut hint.
  - **Theme toggle:**
    - In light, the expanded rail shows a sun icon labelled "DARK": the label names the action while the icon shows the current state.
    - In dark it shows a moon with the tooltip "Light mode".
    - It is the only rail control with a custom tooltip; nav items have only a native `title`.
  - **Duplicate icons.** Calendly and Integrations share the plug icon, and Calling number and Security use near-identical shields.
  - **No grouping.** The rail is a flat list of 12 items and the Settings sub-nav a flat list of 17. Expanded, the rail and sub-nav take 464px before any content.
- **Screenshots:** audit/screenshots/va-explore-settings/c19_sidebar_expanded.png, audit/screenshots/va-explore-core/sidebar_expanded_footer.png, audit/screenshots/va-explore-core/crop_sidebar_footer.png, audit/screenshots/va-visual-audit/sidebar_expanded.png, audit/screenshots/va-visual-audit/dark_dashboard.png
- **Recommendation:**
  - **Shortcut hints:** render them with the shared `Kbd` ("Collapse sidebar [") and only under `(hover: hover) and (pointer: fine)`, or drop them.
  - **Theme control:** a "Theme: Light / Dark / System" menu with radio semantics in an account menu. If it stays a toggle, label the action and show the target icon ("Switch to dark" with a moon), with `aria-pressed`.
  - **Icons:** one distinct icon per destination (for example `CalendarClock` for Calendly, `Plug` for Integrations, `Phone` for Calling number, `ShieldCheck` for Security).
  - **Grouping:** group the rail and the sub-nav. The IA proposal is in the UX/IA section.

### F-VIS-033 — Tablet (768–1023px): the expanded sidebar pushes content to 528px instead of overlaying it
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-A-15
- **Pages:** app shell at 768–1023px (all app pages)
- **Evidence:**
  - At 768, "Expand sidebar" widens the rail to 240px and pushes `main` to 528px (left = 240), with no scrim.
  - Every page then reflows: the wallet banner wraps to 2 lines and the Billing cards compress.
  - Collapsed, the rail has no labels and 36x36 icons.
  - Labels read "Agent View" and "Meet Agent", while the H1s and the mobile bar ("Agent") use other names (F-VIS-005).
- **Screenshots:** audit/screenshots/va-responsive-a/billing_768_sidebar_expanded.png
- **Recommendation:**
  - Below 1024px, open the expanded nav as an overlay drawer: `position: fixed`, 280px wide, with a scrim, a focus trap, and closing on Esc and on route change. The content width stays the same.
  - Keep the collapsed 72px rail with the portal tooltip (F-VIS-015).
  - Drive all labels from one nav config (F-VIS-005).

### F-VIS-034 — No shared content container: widths range from 512px to full-bleed, forms stretch to 1,300px at 1920, and headers don't line up with content
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-A-17, RESPONSIVE-B-21, VISUAL-AUDIT-13 (layout and scrollbar-shift sub-points)
- **Pages:** /meeting-agent, /assistant, /dashboard, /leads, /knowledge, /settings, /personal-agents
- **Evidence:**
  - **Containers at 1440:**
    - Full-bleed: Dashboard, Leads, Call Reports, Flow Builder, Analytics and Meeting Agent.
    - About 1,150px centred: Billing, Knowledge.
    - About 1,120px, left-biased: Personal Agents (x≈191–1,311).
    - 640px: Rep Console.
    - 576px inside a 1,140px pane: Settings Profile.
    - 512px: Organization.
  - **At 1920:**

    | Page | Measurement |
    |---|---|
    | Meeting Agent | The "Meeting Title" input and Session Mode control are 1,125px wide |
    | Assistant | The composer is about 1,278px wide (x 149–1,427) |
    | Dashboard | The centre column is about 1,150px of mostly empty grid around the 312px orb |
    | Leads | Name at x 188, status and call at x≈1,800–1,885 |
    | Knowledge | Header actions at x 1,620–1,895; content ends at 1,566 |
    | Settings | Save Changes at x 1,755–1,895; the form ends at 1,390, with a 520px gap between sub-nav and form |

  - **Personal Agents:**
    - The document scrolls 42px for no reason (942 vs 900).
    - The scrollbar gutter shifts the wallet-banner buttons about 10px left compared with other pages (Top up at x=1,205 vs 1,215).
    - A missing space reads "goalinstead" (JSX whitespace; the copy is tracked as RESPONSIVE-A-18).
- **Screenshots:** audit/screenshots/va-responsive-a/meeting-agent_1920.png, audit/screenshots/va-responsive-a/assistant_1920.png, audit/screenshots/va-responsive-a/dashboard_1920.png, audit/screenshots/va-responsive-b/leads_1920.png, audit/screenshots/va-responsive-b/knowledge_1920.png, audit/screenshots/va-responsive-b/settings_1920.png, audit/screenshots/va-visual-audit/personal-agents.png
- **Recommendation:**
  - **`PageContainer`**, applied to both `PageHeader` and content, with three widths:
    - `data`: max 1,440px (tables, dashboards);
    - `form`: max 720–880px (settings, create forms);
    - `reading`: about 820px (the Assistant thread and composer).
  - Full-bleed only for the Flow Builder canvas and the live console. Left-align with a 32px gutter (24px at ≤1279, 16px at ≤767).
  - Set `html { scrollbar-gutter: stable; }` app-wide, and remove whatever adds Personal Agents' extra 42px.
  - **Settings:** move Save into a sticky footer attached to the form.
  - **Leads at wide widths:** add columns (F-VIS-009) or use a list with a detail pane.
  - **Copy:** add `{' '}` after the inline `<span>`.

### F-VIS-035 — Ad-hoc breakpoints alongside Tailwind's
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-18
- **Pages:** global CSS
- **Evidence:**
  - The compiled CSS uses Tailwind's 40/48/64/80/96rem breakpoints (151/104/44/12 variant rules reported).
  - It also has raw media queries at 420, 640, 720, 760, 767 (max), 1079 (max) and 1080px.
  - The layout switches seen elsewhere (Dashboard at 1024 and 1280; the bottom bar at ≤767) therefore come from two systems.
- **Screenshots:** —
- **Recommendation:**
  - Define 5 named breakpoints as `@theme` tokens (`--breakpoint-sm` … `--breakpoint-2xl`) and replace raw media queries with Tailwind variants, or with `@media (width >= theme(--breakpoint-md))`.
  - Use container queries (`@container`) for panels whose width depends on their parent: Customer Intel, the Embed preview (F-VIS-013), the Flow inspector.
  - Lint against raw px media queries.

### F-VIS-036 — Dead or misleading design scaffolding: an unapplied `.type-floor`, an unused type scale and fonts, and token names that don't match their colours
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** DESIGN-SYSTEM-22, QA-A-21
- **Pages:** global CSS / tokens; visible on /dashboard (Save Context, Refresh flows)
- **Evidence:**
  - **`.type-floor`** forces `text-[7..12px]` and `text-xs` to 13px `!important`, but no element carries it.
  - **Unused type scale.** Tailwind's `text-xs`…`text-7xl` is defined, but the app uses arbitrary `text-[7px]`–`text-[13px]` (52 compiled sizes, F-VIS-002).
  - **Unused fonts.** 139 `@font-face` rules. Registered but not seen in the app: Inter (as `--font-matter`, 35 faces), Rajdhani, Geist, Geist Mono and DM Sans. Syne is used only for the wordmark, and the Devanagari faces were not seen.
  - **Names that don't match colours:**
    - `--saffron` is blue #2F5FE0 in light and violet #7C6BF5 in dark.
    - `--peacock` is teal in light and cyan in dark.
    - The tenant config declares `accent: "#FF9933"` (saffron), and a second white-label tenant exists.
    - `text-saffron`, `border-saffron` and `hover:text-saffron` render blue, as do `.btn-saffron` and `.link-saffron`.
  - **Inverted names:**
    - `--border-light` #CBD3E1 is darker than `--border-color` #E1E6EF in light.
    - `--saffron-dim` is darker in light (#1E48B8) but lighter in dark (#9A8CFF).
- **Screenshots:** —
- **Recommendation:**
  - **Rename semantically with a codemod,** keeping aliases for one release:
    - `--saffron` → `--primary`;
    - `--saffron-dim` → `--primary-strong` (the higher-contrast variant in each theme);
    - `--peacock` → `--accent`;
    - `--border-color` / `--border-light` → `--border-subtle` / `--border-strong`.
  - **Tenants:** document the tenant-to-token mapping. Tenant config sets `--primary` etc. under a `[data-tenant]` scope.
  - **`.type-floor`:** apply it on the app root as a stop-gap (F-VIS-002), then delete it once no arbitrary sizes remain.
  - **Cleanup:** delete unused next/font registrations, and point the Tailwind type scale at the new tokens.

### F-VIS-037 — Flow pickers list duplicate flow names
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** QA-B-30
- **Pages:** /leads (lead-drawer FLOW select and bulk-call bar), /dashboard (flow selector)
- **Evidence:**
  - The lead drawer's FLOW select and the bulk-call bar list the same names twice (a real-estate "(v2)" flow, the airport support flow and the demo flow each appear twice).
  - "Generated: … (v2)" is truncated.
  - The Dashboard selector tells flows apart only by a 6-character hash suffix, and its 150px width cuts names mid-word (F-VIS-013).
- **Screenshots:** audit/screenshots/va-qa-b/leads-drawer.png, audit/screenshots/va-qa-b/leads-kbd-a.png
- **Recommendation:**
  - Use one shared `FlowSelect` combobox on the Dashboard, the lead drawer and the bulk bar:
    - each option shows name, version, "edited 3d ago" and an Active badge;
    - versions are grouped under their flow;
    - it is searchable, at least 260px wide, and shows the full name on hover.
  - Enforce unique names at creation and duplication (for example "Copy of X (2)").

