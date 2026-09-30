## 3B. Findings — Visual design, consistency & design system

**Scope.** This section merges 66 source findings from 13 agent reports into 37 findings: 3 high, 23 medium and 11 low. None of the owned findings was refuted. Where the adversarial verifier changed a severity or corrected a detail, the finding says so, and the appendix lists every correction.

The pages were measured at 1440x900 in the light theme unless stated. Contrast ratios are WCAG 2.x values computed from computed styles, or from pixels where alpha was involved.

**Covered in other sections (cross-referenced here, not repeated):**
- Primary-button text contrast (black on #2F5FE0, 3.83:1): VISUAL-AUDIT-03, DESIGN-SYSTEM-01, A11Y-AUTO-03.
- The muted text token #7A8397: A11Y-AUTO-02, EXPLORE-DATA-14, VISUAL-AUDIT-06.
- The missing focus-ring token: DESIGN-SYSTEM-12.
- Sidebar IA and rail clipping: VISUAL-AUDIT-05, RESPONSIVE-A-06.
- Flow node-title contrast: FLOW-CANVAS-06.
- Public-site brand fragmentation: PUBLIC-SITE-06.

**What to keep.**
- The neutral ramp (#111725 / #3E475A on #F4F6FA / #EEF1F7 / white, with #E1E6EF borders).
- Lucide as the single icon library.
- The 32 light/dark CSS variable pairs.
- The dark theme.
- The existing React `<Button>`, which has variants and a focus-visible ring.
- The calm sans treatment on Call Reports and Assistant, which is the closest thing to a target baseline.

---

### F-VIS-001 — No single visual language: five co-existing dialects across app, login and marketing
- **Severity:** high (the verifier kept VISUAL-AUDIT-01 at high; it rated the overlapping UX-AUDIT-12 medium as "cosmetic") · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-01, UX-AUDIT-12, EXPLORE-CORE-17, EXPLORE-DATA-06, DESIGN-RESEARCH-01
- **Pages:** all authenticated pages; `/`, `/login`
- **Evidence:**
  - **Dominant family by visible characters in `<main>` (verifier re-count):**
    - JetBrains Mono leads on Dashboard (226), Leads (943), Billing (358), Knowledge (1,427) and Meeting Agent (1,560 of 1,628).
    - The system `ui-sans-serif` leads on Assistant (480) and Personal Agents (1,075).
    - Hanken Grotesk leads on Call Reports (14,759), the only app page in the brand sans.
    - Analytics mixes Mono 1,265, Instrument Serif italic 409 and Sora 250.
    - Marketing `/` is `html.dark`, Hanken 6,527, with violet #7C6BF5 CTAs.
    - `/login` is light (#F4F6FA), mostly Mono (176), with a blue Sign In.
  - **The five dialects:**
    1. "Terminal/HUD": mono 9–12px uppercase with 0.2–4px tracking, grid backgrounds and glows.
    2. "Editorial": Analytics, with § numerals, serif-italic kickers and 27px/800 H2s.
    3. "Violet product": Meeting Agent, all mono, hard-coded #8B5CF6.
    4. "Plain SaaS": Assistant and Call Reports.
    5. Dark marketing.
  - **Sibling settings pages differ.** Call channel is JetBrains Mono for both title and body; the adjacent Calling number page is Sora sans with a stepper.
  - **Filled primaries use four hues.** Save and NEW LEAD are blue, ACTIVATE is green, Create Room is rgb(139,92,246), and Import CSV / Test Call use a teal tint.
- **Screenshots:** audit/screenshots/va-visual-audit/assistant.png, audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-visual-audit/analytics.png, audit/screenshots/va-visual-audit/meeting-agent.png, audit/screenshots/va-visual-audit/call-reports.png, audit/screenshots/va-verify-ux-audit/25_call_channel.png, audit/screenshots/va-verify-ux-audit/26_calling_number.png
- **Recommendation:**
  - Adopt one system and migrate page by page, starting from the Call Reports and Assistant treatment.
  - **Type:**
    - Hanken Grotesk for all UI and body text.
    - JetBrains Mono only for tabular numerals (`font-variant-numeric: tabular-nums`), IDs, timers, API keys and code.
    - Sora only as an optional display face on marketing. Remove Instrument Serif from the app.
  - **Colour:** one primary hue in both themes (F-VIS-004).
  - **Headers:** one `PageHeader` (F-VIS-005).
  - **Order of work:**
    1. Tokens (colour, type, radius and elevation).
    2. Primitives (Button, Input, Badge, Card, EmptyState).
    3. Page conversion, in order of traffic: Dashboard, Leads, Analytics, Meeting Agent, Settings.
  - **Guard against regressions:** add a Playwright visual-regression snapshot per page in both themes.

### F-VIS-002 — Typography has no scale: 16 rendered sizes, 30 trackings, 84 text styles, 36% of text under 12px
- **Severity:** high · **Confidence:** partially-verified (the verifier confirmed the loaded families: Sora 600/700, Hanken 500 only, JetBrains Mono 100–800)
- **Source findings:** DESIGN-SYSTEM-05, A11Y-AUTO-17, DESIGN-RESEARCH-05
- **Pages:** all app pages; worst on /analytics, /leads and /dashboard
- **Evidence:**
  - **Families:** 5 rendered (JetBrains Mono, Hanken, Sora, Instrument Serif, system sans) and 12 registered, with 139 `@font-face` rules.
  - **Scale sprawl:**
    - 16 rendered sizes (8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 27.2, 30, 30.4 and 32px).
    - 52 distinct font-size values in the compiled CSS, including 7, 10.5, 12.5 and 13.5px.
    - 32 line-heights and 30 letter-spacings, from −0.8 to +4px.
    - 84 distinct type styles in all.
  - **Tiny text:**
    - 36% of 1,812 text nodes are below 12px, and 7.6% are 8–9px.
    - Analytics: 139 of 242 nodes are under 12px (57 at 9px, 5 at 8px).
    - Leads: 166 of 240 are under 12px (46 at 9px, 24 at 8px).
    - Much of this is uppercase mono tracked 1.8–4px.
  - **Units:** sizes are arbitrary px utilities (`text-[9px]`, `text-[10px]`), so they ignore the user's browser font-size setting (inferred from the class names).
  - **Label overload:**
    - Dashboard has 7 field labels in 9–10px uppercase mono, each in its own bordered box.
    - Leads uses uppercase mono for the title, the KPIs, the shortcut strip and about 15 filter chips.
- **Screenshots:** audit/screenshots/va-a11y-auto/analytics.png, audit/screenshots/va-a11y-auto/leads.png, audit/screenshots/scout_dashboard.png, audit/screenshots/va-visual-audit/crops/analytics_full_0.png
- **Recommendation:**
  - **Define type tokens in the Tailwind v4 `@theme`, in rem:**
    - Sizes 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30, with fixed line-heights 16 / 18 / 20 / 24 / 26 / 28 / 32 / 38.
    - Weights 400, 500 and 600.
    - Tracking: tight −0.01em, normal 0, caps +0.06em.
  - **Floor:** 12px minimum. Allow 11px only for 600-weight all-caps badges.
  - **Labels:** sentence-case 12–13/500 in text-secondary, placed above plain inputs (no per-field box). Use at most one eyebrow per section.
  - **Enforcement:**
    - Apply the existing `.type-floor` class on the app root as a stop-gap (F-VIS-036).
    - Add a lint rule rejecting `text-[Npx]` arbitrary values.
  - **Fonts:**
    - Load Hanken 400–700.
    - Delete unused registrations: Inter as `--font-matter`, Rajdhani, Geist, Geist Mono and DM Sans. Keep Syne only for the wordmark, and the Devanagari faces only where Hindi renders.
  - **Muted colour:** fix it together with this change (see the accessibility section, A11Y-AUTO-02).

### F-VIS-003 — Dark-first styling leaks into the light theme: grey cards at 2.2:1, 1.48:1 node titles, invisible borders, a dark minimap
- **Severity:** high · **Confidence:** partially-verified (the verifier re-measured the node-title ratios; two agents measured the Personal Agents cards)
- **Source findings:** DESIGN-SYSTEM-09, A11Y-AUTO-22, VISUAL-AUDIT-13 (grey-card sub-point)
- **Pages:** /personal-agents, /flow-builder, /analytics (the pattern is global)
- **Evidence:**
  - **Personal Agents example cards:**
    - They use `border-white/[0.06] bg-black/20`, which renders as grey #C3C5C8.
    - #7A8397 11px text on that grey is 2.19–2.20:1, so the cards look disabled.
    - The container border `border-white/10` is invisible in light mode.
  - **Flow Builder node titles on #EEF1F7** (Tailwind-400 hues used as text):
    - Condition #FBBF24: 1.48:1.
    - Knowledge Lookup #FB923C: 2.00:1.
    - Transfer #F472B6: 2.34:1.
    - Confirm Interest teal: 3.31:1.
  - **Other leaks:**
    - The minimap is a dark #1A192B block (×42 backgrounds). Its `rgba(0,0,0,.38)` mask reads as a solid grey slab in light mode.
    - Analytics uses the dark-theme cyan `rgba(56,198,224,.1)` ×24.
    - `#fff @6–10%` borders and `#000 @10–20%` fills appear throughout.
  - **Light vs dark failure rates** (share of measured text failing AA):

    | Page | Light | Dark |
    |---|---|---|
    | Dashboard | 25/35 | 7/36 |
    | Pages overall | 31–78% | 7–19% |
- **Screenshots:** audit/screenshots/va-design-system/personal-agents.png, audit/screenshots/va-design-system/dark-personal.png, audit/screenshots/va-verify-visual-audit/flow-builder_nodes_zoom.png, audit/screenshots/va-design-system/dark-flow-builder.png, audit/screenshots/va-visual-audit/flow-builder_minimap_zoom.png, audit/screenshots/va-a11y-auto/personal-agents.png
- **Recommendation:**
  - Treat light mode as first-class. Every colour comes from a semantic token with both light and dark values.
  - **Lint rule:** ban `white/*`, `black/*` and raw palette utilities (`amber-400`, `bg-[#…]`) in app code.
  - **Fixes:**
    - Personal Agents cards: `bg-surface border border-border` (white, #E1E6EF).
    - Node titles: text-primary ink, with the category hue on the icon tile or a left accent bar (details in FLOW-CANVAS-06).
    - Minimap: mask `rgba(0,0,0,.08)` in light mode, with node colours taken from tokens.
  - **Guard:** add visual-regression snapshots of Flow Builder, Personal Agents and Analytics in both themes.

### F-VIS-004 — The brand primary changes hue by theme and by feature; accent colours sprawl without meaning
- **Severity:** medium (the verifier lowered VISUAL-AUDIT-04 from high; DESIGN-SYSTEM-03 and DESIGN-RESEARCH-02 had rated it high) · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-04, DESIGN-SYSTEM-03, DESIGN-RESEARCH-02
- **Pages:** global; /meeting-agent, /leads, /analytics, /flow-builder, marketing `/`
- **Evidence:**
  - **The primary changes hue.** The CONNECT background is #2F5FE0 in light and #7C6BF5 after the dark toggle (verifier). `--peacock` is teal #0E9488 in light and cyan #38C6E0 in dark. Marketing uses a #7C6BF5 → #38C6E0 gradient.
  - **Meeting Agent hard-codes its own violet.**
    - #8B5CF6 appears in 13 classes (`bg-[#8b5cf6]`, `hover:bg-[#7c3aed]`, `text-[#a78bfa]`, `ring-[#8b5cf6]/20`) for Create Room, the segmented control and Generate PPT.
    - White text on it is 4.23:1.
  - **Component classes hard-code the dark violet** `rgba(124,107,245,…)`: the `.bento-card` hover, the `.link-saffron` underline (a violet underline under blue text in light mode), `.section-numeral` and the dashboard radial gradient.
  - **Accents carry no meaning.**
    - Import CSV is teal #0E9488 next to the blue New Lead.
    - The Analytics KPIs alternate blue/teal/blue/teal (121, 24, 1m 18s, 158).
    - ACTIVATE is green #178A55 with white text and a 12px radius; Save is blue with black text and an 8px radius.
    - The wallet warning banner uses the brand blue, not a warning hue.
- **Screenshots:** audit/screenshots/va-visual-audit/meeting-agent.png, audit/screenshots/va-visual-audit/dark_meeting-agent.png, audit/screenshots/va-design-system/dark-dashboard.png, audit/screenshots/va-design-system/home.png, audit/screenshots/scout_leads.png, audit/screenshots/scout_flow-builder.png
- **Recommendation:**
  - **Pick one brand hue** (open question: blue or violet) and generate a 50–900 ramp.
    - Light mode uses the 600 step with `--primary-foreground: #fff`. Examples: blue #2F5FE0 with white is 5.48:1; violet #6D5AE6 with white is 4.93:1.
    - Dark mode uses the 400–500 step of the same hue.
  - **Semantic tokens:** `--primary`, `--primary-foreground`, `--accent`, `--success` #127A4B, `--warning` #9A6B00, `--danger` #D0463A, and `--info` equal to primary.
  - **Remove per-feature colours:** replace Meeting Agent's #8B5CF6 and the `rgba(124,107,245)` literals with tokens.
  - **Usage rules:**
    - KPI numerals use text-primary; colour goes on deltas only.
    - One filled primary per region: Activate is primary, Save is secondary.
    - The wallet banner uses the warning tone.
  - The verifier notes that the Call Reports green/red KPIs are meaningful (positive/negative); keep that pattern.

### F-VIS-005 — No shared page header or page template: 13+ H1 treatments, 6+ Settings templates, mismatched nav names
- **Severity:** medium (the verifier lowered VISUAL-AUDIT-02 from high because it shares a root cause with F-VIS-001 and blocks no task; EXPLORE-SETTINGS-09 had rated it high) · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-02, DESIGN-SYSTEM-06, EXPLORE-SETTINGS-09, EXPLORE-CORE-26
- **Pages:** all app pages; all /settings/* pages, /api-keys, /api-keys/embed, /webhooks
- **Evidence:**
  - **H1s (verifier-measured):**

    | Page | Size/weight | Family / tracking / case |
    |---|---|---|
    | Analytics | 15/700 | Sora, +2.7px, uppercase |
    | Leads | 20 | +4px, uppercase |
    | Agent Cockpit, Billing, Agent Knowledge, Settings | 18/700 | +0.9px, literal uppercase |
    | Personal Agents | 30/700 | −0.75px |
    | Meeting Agent | 20/600 | JetBrains Mono |
    | Assistant, Call Reports | 20/700 | −0.5px |
    | Rep Console | 24/500 | Mono |
    | Flow Builder | 18/700 | +0.45px, with a mono uppercase subtitle |

  - **Settings sub-pages use at least 6 templates:**

    | Page | H1 | Content column (x / width) |
    |---|---|---|
    | Profile | Sora 18 uppercase | 575 / 576 |
    | Organization | Mono 24 | 500 / 512 |
    | Call channel | Mono 24 | 436 / 640 |
    | Calling number | Sora 20 with icon tile and pill buttons | 420 / 670 |
    | Security | Sora 30 | 391 / 720 |
    | Activity | Sora 36 on grid paper | 207 / 1,088 |
    | API Keys | Sora 24 | 260 / 992 |
    | Embed | Sora 70.4 "magazine" | — |
    | Integrations | system sans 24 | — |

    Buttons alternate between pills and 6–8px rectangles.
  - **Container widths vary:**
    - Full-bleed: Dashboard, Leads, Call Reports, Analytics, Meeting Agent.
    - About 1,150px centred: Billing, Knowledge.
    - 640px: Rep Console.
    - 576px inside a 1,140px pane: Settings Profile.
  - **Nav titles do not match H1s:** "Agent View" leads to "AGENT COCKPIT", "Meet Agent" to "Meeting Agent — Vikash", and "Knowledge" to "AGENT KNOWLEDGE".
  - **/settings/personal-agent** has both "← BACK TO SETTINGS" and "← Settings", and no rail item is active.
- **Screenshots:** audit/screenshots/va-explore-settings/c5_call_channel.png, audit/screenshots/va-explore-settings/c6_calling_number.png, audit/screenshots/va-explore-settings/c7_security.png, audit/screenshots/va-explore-settings/c7_activity.png, audit/screenshots/va-explore-settings/api_keys.png, audit/screenshots/va-explore-settings/c9_embed_snippet.png, audit/screenshots/va-visual-audit/settings_organization.png, audit/screenshots/va-explore-core/settings_personal_agent.png
- **Recommendation:**
  - **`PageHeader` component:**
    - 64px bar.
    - Title in Hanken 24/32, weight 600, sentence case, no tracking.
    - Optional 14px text-secondary description.
    - Right-aligned actions, at most one primary.
    - Optional tab row.
    - Remove literal uppercase strings.
  - **`SettingsPage` template:**
    - A persistent grouped sub-nav plus a content column with a fixed left inset and max-width 720px.
    - At most one breadcrumb.
    - Settings stays active in the rail for /settings/*, /api-keys and /webhooks.
  - **Naming:** one nav config drives the rail label, mobile label, H1 and `<title>`.
  - **Containers:** see F-VIS-034.

### F-VIS-006 — Three parallel button systems and 80 button styles; "Refresh" has 6 designs and 3 behaviours
- **Severity:** medium (DESIGN-SYSTEM-04 rated it high; lowered in line with the verifier's rating of the same Refresh and button evidence in UX-AUDIT-12) · **Confidence:** partially-verified
- **Source findings:** DESIGN-SYSTEM-04, QA-A-15, UX-AUDIT-12 (Refresh sub-point)
- **Pages:** all app pages
- **Evidence:**
  - **Three systems:**
    - The React `<Button>` (CVA-style, with a focus-visible ring) is used on 2 of 103 buttons, on Call Reports only.
    - The `.btn-saffron`, `.btn-outline` and `.btn-danger` classes appear on Billing, Knowledge, Settings and Dashboard.
    - Everything else is bespoke: Leads uses the shared component on 0 of 49 buttons, Knowledge on 0 of 13.
  - **Distinct button signatures per page:** Flow Builder 36, Leads 12, Knowledge 11, Meeting 11, Analytics 9, Dashboard 9, Call Reports 9, Settings 8, Assistant 7, Billing 7, Personal Agents 5, Rep Console 5.
  - **Primary buttons:**
    - Heights: 24, 28, 32, 33, 37, 39, 40, 43 and 44px.
    - Case: "NEW LEAD" is Sora bold uppercase and tracked; "Export CSV" is sentence case; "CONNECT" is literal uppercase in the system font.
  - **"Refresh" has 6 designs** (the verifier confirmed the variants):

    | Page | Design |
    |---|---|
    | Analytics | Sora 10/700 uppercase, 29px |
    | Leads | Mono 10 uppercase, 29px |
    | Call Reports | Hanken 13, 32px |
    | Billing, Knowledge | `.btn-outline` 14px, 38px |
    | Meeting Agent | Mono 12, borderless, 24px |
    | Personal Agents | Mono 11 uppercase with an invisible `white/10` border |

  - **"Refresh" behaves 3 ways:**
    - The Cockpit icon (14x14) spins.
    - Meeting Agent's Refresh neither spins nor disables, and refetches 5 endpoints.
    - Personal Agents' REFRESH doesn't spin.
    - None of them reports success or failure.
- **Screenshots:** audit/screenshots/va-design-system/zoom-primary-buttons-callreports.png, audit/screenshots/va-design-system/billing.png, audit/screenshots/va-design-system/leads.png
- **Recommendation:**
  - **One primitive.** Make the existing React Button the only one.
    - Variants: primary, secondary, ghost, destructive, link.
    - Sizes: sm 32, md 36, lg 40 (44 under `pointer: coarse`).
    - `white-space: nowrap`, sentence case, and padding on the 4px grid (8/16px instead of the current 9/18).
  - **IconButton** at 28/32/36px with a required `aria-label`.
  - **Migration:**
    - A codemod to replace `.btn-*` and the bespoke strings.
    - An ESLint rule rejecting raw `<button className=…>` outside `components/ui/`.
  - **`RefreshButton`:**
    - RefreshCw icon.
    - `aria-busy`, spinning and disabled while busy.
    - An "Updated hh:mm" stamp on success.
    - An inline error with Retry on failure.

### F-VIS-007 — Agent Cockpit at 1024–1279px: CONNECT is drawn over the Transcript Feed and the orb is clipped
- **Severity:** medium (the verifier lowered it from high: CONNECT stays on top and clickable, so it is a visual collision, not a blocker) · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-05 (the same defect is also recorded as F-RWD-002 in the responsive section, via EXPLORE-CORE-22)
- **Pages:** /dashboard
- **Evidence:**
  - **Overlap positions:**

    | Viewport | CONNECT (y) | Transcript panel | Result |
    |---|---|---|---|
    | 1024x768 | 514–553 | "TRANSCRIPT FEED" header row at 514–554 | Drawn over the header. The phone input and Test Call straddle the panel's top border, and the page header cuts off the top of the orb. |
    | 1100x700 | 480–519 | header at 458 | Fully inside the panel; `elementFromPoint` confirms CONNECT is on top. |
    | 1100x800 | 530–569 | card starts at 545 | Still straddles the border. |
    | 1440x900 | — | — | No overlap. |

    At 1100x800 the original report said there was no overlap; the verifier found that wrong.
  - **Cause:** the centre stack (312px orb, STANDBY, toggle, input, CONNECT) has a fixed height, and the transcript takes a fixed share of the column.
- **Screenshots:** audit/screenshots/va-verify-responsive-a/dashboard_1024x768.png, audit/screenshots/va-verify-responsive-a/dashboard_1100x700.png, audit/screenshots/va-verify-responsive-a/dashboard_1100x800.png
- **Recommendation:**
  - Make the centre column a flex column:
    - orb `height: clamp(160px, 30vh, 312px)`;
    - controls in normal flow;
    - transcript `flex: 1; min-height: 0` with its own scroll.
  - Never position controls absolutely over sibling panels.
  - Alternative: from 1024px, put the transcript in a right column and move Customer Intel into a tab.
  - Add viewport tests at 1024x768, 1100x700, 1100x800 and 1280x720.
