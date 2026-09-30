
### 2.5 Competing visual styles, page by page

#### 2.5.1 The dialects

| # | Dialect | Signature traits | Where |
|---|---|---|---|
| 1 | **Terminal / HUD** | JetBrains Mono as the body face at 8–12px; uppercase labels tracked +0.2 to +4px; hairline borders; glows; grid and noise textures; literal-uppercase Sora H1 | Dashboard, Leads, Knowledge, Billing, Settings, Rep Console, Flow Builder panels, Login card |
| 2 | **Editorial** | "§ 0N" section numerals; Instrument Serif italic taglines; Sora 27.2/800 H2s under a 15px H1; hatch fills, dot grid and HUD corner brackets | Analytics only, layered on top of dialect 1 |
| 3 | **Plain SaaS** | Sans type at 13–14px; sentence or title case; soft pills; a calm hierarchy. Call Reports uses Hanken and the React `<Button>`. Assistant uses the system sans. | Call Reports, Assistant |
| 4 | **Violet product** | 100% mono including the H1; a hard-coded violet `#8b5cf6` primary with white text in both themes; a square (r0) segmented control | Meeting Agent only |
| 5 | **Marketing hero inside the app** | A 30px Sora H1 with a tracked mono eyebrow; no header bar; a centred container; dark-first `black/20` cards | Personal Agents |
| — | **Public site** | Forced dark; Hanken Grotesk; a violet `#7c6bf5` to cyan `#38c6e0` gradient; 16px-radius dark cards; `vlp-*` motion. Docs uses its own neutral dark `docs-*` system. | `/`, `/pricing`, `/docs` |

#### 2.5.2 Authenticated pages

In the Families column, "nodes" counts text nodes (design-system audit) and "chars" counts rendered characters (visual audit).

| Page | Dialect | Families | Sizes | Button styles | H1 treatment | Layout |
|---|---|---|---|---|---|---|
| Dashboard ("Agent Cockpit") | 1 | Nodes: mono 27 / sans 12. Chars: mono 230, system 75, Hanken 57, Sora 42. | 6 (9–18px) | 9 | Sora 18/700, +0.9px, literal "AGENT COCKPIT", "IDLE" pill, mono telemetry strip | Full-bleed. A 320px animated ring sits in the centre. Customer Intel is a panel, then a field card, then an input. Grid texture. |
| Assistant | 3 (system sans) | Nodes: sans 20. Chars: system 480, Hanken 70, Sora 45. | 6 | 7 | Sora 20/700, −0.5px, title case, with an icon and a sans subtitle | Chat layout. Empty state with suggestion chips. |
| Analytics | 2 over 1 | Nodes: mono 172 / sans 33 / serif italic 15. Chars: mono 1,312, serif 419, Sora 250. | **14** (8–32px) | 9 | Sora **15**/700, +2.7px, uppercase, with a serif-italic tagline and an "UPDATED" stamp tracked 4px. The H2s are 27.2/800. | 3,898px inner scroller, content x≈143–1358. Section 01 is "Identity". KPIs start at y≈570. |
| Leads | 1 | Nodes: mono 158 / sans 69. Chars: mono 948, Sora 344. | 7 (8–20px) | 12 | Sora 20/700, **+4px**, CSS uppercase, with a mono count line | Full-bleed. About 400px of chrome sits above the first row: banner, header, KPI strip, shortcuts bar, search and two chip rows. A teal secondary sits next to the blue primary. |
| Flow Builder | 1 plus canvas | Nodes: mono 52 / sans 48. Chars: mono 2,325, Sora 482. | 7 | **36** | Sora 18/700, +0.45px, title case, with the mono uppercase subtitle "VOICE JOURNEY WORKSPACE" | Full-bleed canvas under a two-row, roughly 180px header. The blue Save and the green ACTIVATE are styled differently. |
| Meeting Agent | 4 | Nodes: mono 55 / sans 8. Chars: mono 1,023 (sidebar only in Hanken). | 6 | 11 | **JetBrains Mono 20/600**, title case, violet persona suffix | Full-bleed, x≈104–1397. The right rail shows backend port, env-var and GPU status text. |
| Personal Agents | 5 | Nodes: sans 22 / mono 4. Chars: system 1,078. | 6 | 5 | **Sora 30/700**, −0.75px, with the mono eyebrow "AUTONOMOUS TASKS" tracked 3px. No header bar. | Centred about 1120px, left-biased (x≈191–1311). Grey example cards. A 42px phantom document scroll. |
| Rep Console | 1 | Nodes: mono 12 / sans 8. Chars: mono 274. | 5 | 5 | **JetBrains Mono 24/500**, −0.6px, sentence case, "← Dashboard" back link | A 640px column. The only page without the wallet banner. |
| Call Reports | 3 (Hanken) | Nodes: **Hanken 936, 0 mono**. Chars: Hanken 14,818. | 6 | 9 | Sora 20/700, −0.5px, title case, with a count pill and a sans subtitle | Full-bleed. A horizontally scrolling table. The only page that uses the React `<Button>`. |
| Billing | 1 | Nodes: mono 16 / sans 17. Chars: mono 365, system 108, Sora 77. | 6 | 7 | Sora 18/700, +0.9px, literal "BILLING", with an icon | Centred about 1150px (x≈176–1326). Uses `.btn-*`. The banner repeats the page's own CTAs. |
| Knowledge | 1 | Nodes: mono 58 / sans 17. Chars: mono 1,436. | 6 | 11 | Sora 18/700, +0.9px, literal "AGENT KNOWLEDGE" | Centred about 1150px. White r12 cards. A native file input. |
| Settings (Profile) | 1 (mixed) | Nodes: sans 30 / mono 23. Chars: mono 768, Sora 205, system 86. | 6 | 8 | Sora 18/700, +0.9px, literal "SETTINGS", with a global "Save Changes" in the header | A 576px form column inside a 1140px pane. A 17-item sub-nav. |
| Settings › Organization | 1 | Mono-led | — | — | JetBrains Mono 24, title case | A "BACK TO SETTINGS" bar with no sub-nav. A 512px column. A dashed empty state. |
| API Keys | 1 | Mono-led | — | — | Sora 24/700 with the mono eyebrow "PUBLIC API" and an icon | Standalone layout outside the settings shell |

**Page titles.** Across the 12 main pages there are **7 H1 treatments**, at sizes 15, 18, 20, 24 and 30px, in two families and four case styles. Uppercase comes sometimes from CSS and sometimes from literal text. Counting the sub-pages and the header extras, the visual audit finds 13.

**Content widths** are full-bleed, about 1150, about 1120, 640, 576 and 512px. No single max-width is shared.

#### 2.5.3 Signed-out and public pages

- **Login:** a centred card that combines four families: the Syne wordmark, a Sora heading, a JetBrains Mono subtitle and labels, and system-sans inputs and buttons. The "Sign In" button uses the app's black-on-blue primary. The footer reads "Neural Platform v2.0.4 — Enterprise Security Enabled".
- **Home `/`:**
  - Type: Hanken at 6,310 characters; H1 72/600 at −1.8px; violet-to-cyan gradient text.
  - Surfaces: 16px dark cards and polished product mocks.
  - Scale: 25 font sizes, including half-pixels (11.5 to 17.5), and 15 radii.
  - Details: emoji as icons on the industry tabs; scroll-reveal sections that stay blank until intersected; white-on-`#7c6bf5` chips and a "Start free" CTA.
  - Header: full nav plus a "Dashboard" CTA.
- **Pricing:** mono-heavy (62 of 119 text nodes). The CTA is black on violet. The header has the logo plus "Email us".
- **Docs:** the dark-only `.docs-api` neutral palette with about 90 BEM `docs-*` classes, mono-heavy. The header has "Back to Home" with the logo on the right.

### 2.6 Dark mode: current state

- **Mechanism.**
  - The theme toggle sits in the sidebar footer. It shows a sun in light and a moon in dark, with the custom tooltip "Light mode".
  - It sets `html.dark` plus `localStorage["vv:theme"]` and nothing else.
  - There are only two states; there is no "System" option.
  - The app defaults to light. `/`, `/pricing` and `/docs` are forced dark.
- **Token coverage is complete.** All 32 app variables have dark values. The docs palette is dark only.
  - The dark neutral ramp: background `#0c0d12`; surfaces `#14161d`, `#1a1d26` and `#232733`; borders `#282c38` and `#3a3f4f`; text `#e8eaf2`, `#a6abbd` and `#7b8196`.
  - Muted text reaches 5.01:1 on the background and 4.35:1 on cards.
- **The brand hue shifts with the theme.**
  - Primary: blue `#2f5fe0` to violet `#7c6bf5`. Black button text there measures 5.28:1.
  - Accent: teal `#0e9488` to cyan `#38c6e0`.
  - Sentiment colours are lightened.
  - Meeting Agent's `#8b5cf6` does not change.
- **Dark reads more coherently than light.** Measured AA text failures, dark vs light:
  - Dashboard: 19% vs 71%
  - Billing: 7% vs 41%
  - Personal Agents: 9% vs 36%
  - Across the light app overall: 66% (969 of 1,473 text nodes)
- **Much of the UI was authored dark-first.** These pieces render correctly only in dark:
  - `white/…` and `black/…` utilities (Personal Agents cards, `border-white/10`)
  - Tailwind-400 node text colours on Flow Builder
  - the `#1a192b` minimap
  - the cyan hour-grid tint on Analytics
  - the violet hard-coded in `.bento-card`, `.link-saffron`, `.section-numeral` and the dashboard radial gradient
- **Unthemed in dark:**
  - the Flow edge-label box stays white
  - the Analytics serif "not allocated yet" stays low contrast
  - the transcript "Awaiting connection..." measures 1.77:1
- **Two dark switches coexist.** 21 `dark:` utility rules (`dark:bg-slate-900`, `dark:text-red-300` and others) compile under `@media (prefers-color-scheme: dark)`, so they follow the OS, not the in-app class. No affected screen has been confirmed yet.
- **Side effect of the toggle.** On Dashboard and Flow Builder the toggle is followed by a `PUT /api/flows/{id}`. This is reported under the functional findings.
- **Screenshots:**
  - visual audit: `dark_dashboard`, `dark_analytics`, `dark_leads`, `dark_flow-builder`, `dark_call-reports`, `dark_meeting-agent`
  - design-system audit: `dark-dashboard`, `dark-billing`, `dark-flow-builder`, `dark-personal`

### 2.7 What already works and should be preserved

1. **The semantic token layer.** It has 32 variables with complete light and dark pairs, on Tailwind v4 `@theme`. Tokens can be renamed and formalised without a rewrite.
2. **The neutral ramp.**
   - Text: `#111725` / `#3e475a`
   - Surfaces: `#f4f6fa` / `#eef1f7` / `#fff`
   - Borders: `#e1e6ef` (892 sides) and `#cbd3e1` as the strong border
   - The dark ramp is the more finished of the two and is a good reference.
3. **Values that already converge:**
   - radius 8px (336 uses)
   - padding 12/16/8/4 on a mostly respected 4px grid
   - 1px hairlines
   - .15–.2s transitions with `cubic-bezier(.4,0,.2,1)`
4. **Icons.** Lucide is the only icon library, with a consistent outline stroke and 20px nav icons.
5. **Seeds for primitives.**
   - The CVA-style React `<Button>` already has variants, a `focus-visible` ring and a disabled state.
   - `.input-vani` already models focus and error states.
   - `.btn-*` already define disabled states and a 44px mobile touch height.
6. **Call Reports and Assistant** show the right direction for app pages: sans type, title case, calm hierarchy and one clear primary action.
7. **Navigation that works:**
   - the expanded 240px sidebar, where labels fit and nothing clips
   - the mobile bottom tab bar, which has text labels
8. **Dark mode** is thorough and tuned.
9. **The marketing type system** (Hanken, 72/600 display, 16px cards, product mocks) is coherent and is the natural source for the app's sans.
10. **Consistent hover feedback** on primary buttons: a glow and a −1px lift.
11. **Phone masking.** `+91••••••XXXX` is used throughout and is worth formalising as a display pattern.
12. **Well-built pieces to reuse as patterns:**
    - Flow Builder affordances: validation badge, node and link counts, undo/redo, zoom, minimap in dark, `role=status` announcements, a labelled shortcuts dialog, and the searchable, paginated "ALL FLOWS" picker
    - The New Lead modal: visible labels, required markers, autofocus and Esc
    - The Import dialog: two steps, limits stated up front, and a CTA disabled until a file is chosen
    - Login's order: OAuth, then email and password, then magic link
13. **Groundwork already exists.** `.type-floor` shows the team already recognised the small-text problem, and its logic can be reused. The Analytics editorial layout is internally coherent. The design-system agent would keep it as a reserved "report" style. The visual audit would remove it from the app. That choice is left to the redesign direction.

### 2.8 Measurement notes (how the two sources reconcile)

- **H1 treatments:** 7 vs 13. The design-system audit groups the 12 main pages by size, weight, tracking and case. The visual audit adds Settings › Organization and API Keys and separates treatments by their extras. Both counts are right at their own granularity.
- **Family mix:** text nodes vs characters. Settings is sans-majority by nodes (30 vs 23) but mono-majority by characters (768), because mono carries the long body strings.
- **Hanken weights:** 400–700 are registered in CSS, but only 500 appeared in `document.fonts` as loaded, because browsers fetch only the faces a page uses.
- **Buttons:** 80 counts full style signatures; 18 counts heights alone.
- **Radii:** 12 values (design-system); the visual audit adds 0 (Meeting Agent segmented control).
- **Contrast samples:**
  - The placeholder dashes measure 1.75:1 ×381 (computed styles) vs 1.81:1 ×498 (sampled pixels).
  - Flow node text measures 1.48 and 2.00:1 against `#eef1f7` vs 1.67, 2.26, 2.72 and 2.65:1 against the node surface.
- **Borders:** all measurements were taken at DPR 1.25, so a 0.8px border is 1 CSS px.
- **Not covered by these two sources:**
  - `/signup`
  - most Settings sub-pages
  - `/login` in the signed-in comparison
  - mobile and tablet, beyond one 390px check (see the responsive sections)
