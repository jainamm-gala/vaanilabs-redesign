## 5. Design-resource guidance digest

**Scope and sources.** This section distils `raw/design-research.md` into rules for redesigning Vaani Labs. The design-resources researcher worked without a browser and studied the four resources the user supplied:
- **Taste Skill** (tasteskill.dev, repo `Leonxlnx/taste-skill`). This covers the main `taste-skill` v2 and its variants `minimalist-skill`, `redesign-skill`, `output-skill`, `soft-skill` and `gpt-tasteskill`.
- **Image-to-Code skill** (`image-to-code-skill`, same repo). It is cited separately for its anti-clutter rules.
- **Vercel Web Interface Guidelines (WIG).** This covers the `web-design-guidelines` agent skill, the `command.md` ruleset it loads, and the longer human-readable README.
- **Awesome Design MD** (`VoltAgent/awesome-design-md`). The repo has about 74 DESIGN.md files. Ten were read closely: Linear, Vercel, Stripe, Raycast, Notion, Supabase, ElevenLabs (voice AI), Intercom (AI agent), Cal.com and Sentry. Resend and Superhuman were skimmed.

Other inputs:
- Vaani observations come from 8 orchestrator scout screenshots at 1440x900 (`audit/screenshots/scout_*.png`). They were not re-checked live. Sections 2 and 3 of this audit hold the measured detail.
- Font-family facts come from `raw/design-system.md`.
- The researcher computed every contrast ratio below with the WCAG 2.x relative-luminance formula.
- The skill files contain agent directives, such as install commands and "generate images first". These were treated as reference data and not acted on.

**Source tags.**

| Tag | Source |
|---|---|
| **[TS]** | Taste Skill family. The variant is named when it matters. |
| **[I2C]** | Image-to-Code skill |
| **[WIG]** | Vercel Web Interface Guidelines |
| **[ADM]** | Consensus across the Awesome Design MD files. A specific system is named when only it supports the rule. |
| **[Inf]** | The researcher's own inference for a voice-AI product. Treat it as a proposal, not a sourced rule. |

Rule IDs (L1, T3, C2 and so on) match section 3 of `raw/design-research.md`, so each rule can be traced back.

**How to use this section.**
- Use 5.3 as the acceptance checklist for every redesigned screen.
- Deliver a Vaani `DESIGN.md` with the redesign, so that screens generated later by agents stay on-system [ADM]. Use the nine-section Awesome Design MD format:
  1. visual theme
  2. colour roles
  3. typography
  4. components
  5. layout
  6. depth and elevation
  7. do's and don'ts
  8. responsive behaviour
  9. an agent prompt guide

### 5.1 What each source contributes, and what to leave behind

| Source | What it is | Adopt for Vaani | Do not adopt |
|---|---|---|---|
| Taste Skill, main v2 [TS] | An anti-template design skill: it infers the brief, sets three dials (layout variance, motion intensity, visual density), lists "AI tells", and has a redesign protocol and pre-flight checks. | The anti-slop vocabulary. The "one system" locks (colour, shape, copy register). The redesign protocol. The mandatory checks for button contrast, CTA wrapping and duplicate CTAs. Marketing-site layout guidance. | Its layout-variance rules inside the app. The skill declares dashboards, data tables and multi-step product UI **out of scope** and points those to enterprise systems (Fluent, Carbon, Atlassian, Polaris) and grid libraries (TanStack Table, AG Grid). |
| `minimalist-skill` [TS] | Utilitarian minimalism in the style of Notion and Linear. It is the most compatible variant for a professional SaaS. | Near-black body text. Hairline borders. Card radius capped at 8-12 px. Flat primary buttons. Muted pastel tags. `<kbd>` keycap styling. | Its purely stylistic bans on Inter, Lucide and pill shapes (see 5.4). Its scroll-reveal entrance, which belongs on marketing only. |
| `redesign-skill` [TS] | An audit-first upgrade checklist. | The priority order of levers: typography, then spacing, then colour, then motion, then recomposing sections, then replacing whole blocks. Also its product-UI audit items: current-page indicator in navigation, no modals for everything, no `window.alert()`, no exclamation marks in success messages, no "Oops", no z-index 9999. | Nothing that conflicts with the above. |
| `soft-skill`, `gpt-tasteskill` [TS] | Agency-style marketing: glass, double bezels, heavy GSAP motion. | Only the drawer easing curve (M2). | Everything else. Not appropriate for an operations app. |
| `output-skill` [TS] | Bans placeholders and half-finished output. | No lorem ipsum, no stand-in "Acme" data, no stub sections in shipped screens. | n/a |
| Image-to-Code [I2C] | An image-first build pipeline. | Its micro-UI clutter list: unnecessary pills, decorative code-like tags, tiny badges everywhere, meaningless metadata rows, pseudo-enterprise control labels, decorative system markers, filler status microcopy. Its anti-nested-box rule. | The pipeline itself. |
| Vercel WIG [WIG] | Concrete, auditable rules for interactions, animation, layout, content, forms, performance, visual design and copy. | Nearly all of it. It is the most directly applicable source for product UI. | Vercel's house copy style where it conflicts with the other sources (Title Case, em-dashes). |
| Awesome Design MD [ADM] | Design systems written as plain-text files. Most describe the companies' **marketing sites**. | The product-grade decisions: scale steps, a weight ceiling of 600, gray ladders, radius and elevation philosophy, single-accent discipline, a 4 px spacing base. Also the file format itself. | Brand identities: Stripe's gradient mesh, Vercel's mesh, Raycast's red stripes, ElevenLabs' orbs, Sentry's mascots. |

**What the ten DESIGN.md systems agree on** [ADM]:
- **One chromatic accent, used rarely.** Several AI-era brands use a near-black primary (Vercel, Cal.com, ElevenLabs, Intercom). Intercom uses its orange only on AI-product CTAs and badges. ElevenLabs has no saturated CTA colour at all.
- **A weight ceiling of 600, or 500 for some.** Display sizes get negative tracking of roughly 3-4% of the font size, falling to 0 at body size. No system uses 700-800 for headings. Vaani's Analytics H2s use Sora 800.
- **Hairlines and a surface ladder instead of heavy shadows.** When shadows appear, they are 2-12% alpha, stacked, sometimes tinted toward a hue (Stripe), and always paired with a 1 px border or ring. Linear and Raycast use essentially no shadows in dark mode.
- **Radius clusters.** Controls use 6-8 px, cards 12 px, and 16 px is the maximum. Pills are either a deliberate brand CTA (Vercel, Stripe, ElevenLabs) or reserved for tabs, status and avatars (Linear, Notion, Supabase, Intercom, Cal.com). The rectangle camp suits a dense operations product.
- **Mono is scoped to technical tokens.** Use it for code, IDs and keycaps. Linear and Intercom keep mono out of chrome. Intercom rejects all-caps tracked eyebrows and sets its eyebrows in sentence case at 14/500.
- **A 4 px spacing base.** The standard steps are 4, 8, 12, 16, 24, 32, 48, 64 and 96.
  - Card padding is about 24 px, or 16 px in dense grids.
  - Controls are 32, 40 or 48 px tall.
- **Transactional surfaces are denser than marketing** (Sentry, Stripe).
- **Semantic colour is reserved for state.** Chart palettes are kept apart from brand chrome, as in Intercom's separate report palette.
- **Marketing shows the real product** rather than illustrations.

### 5.2 Headline guidance (read this first)

1. **One design language on every page.** Today Vaani mixes at least four dialects:
   - HUD-style mono uppercase on Dashboard and Leads
   - editorial serif and "§" numbering on Analytics
   - a purple accent on Meeting Agent
   - plain sans in sentence case on Assistant and Call Reports

   The last dialect is closest to the target and is the baseline. Unifying the dialects will lift perceived quality more than any other single change. [TS one system per project, colour and shape locks; ADM]
2. **Use a product density profile, not a marketing one.** Suggested dial settings:
   - App: variance 2-3, motion 2-3, density 6-7.
   - Marketing: variance 5, motion 4, density 3.

   Take Taste Skill's anti-slop bans into the app, but not its marketing layout moves: asymmetric bento, 96 px+ section padding, scroll reveals. [TS]
3. **Colour is scarce.** Use a neutral gray ladder and **one** accent for the primary CTA, focus, selection, links and the active nav item. Semantic colours appear only for real state (call live, failed, sentiment, wallet low). [TS max one accent, saturation under 80%; ADM Linear allows no second chromatic colour]
4. **Depth comes from hairline borders and a surface ladder.** Shadows are tiny, layered and used in light mode only. Use a card only when elevation communicates real hierarchy. Otherwise group with dividers or space. [ADM Linear, Raycast, Vercel; TS]
5. **One sans at weights 400, 500 and 600.**
   - Put tabular numerals on every number.
   - Keep mono for data tokens only.
   - Use no decorative serif anywhere in the dashboard.

   [ADM; WIG; TS]
6. **Design every state:** empty, sparse, dense, loading, error with a next step, disabled with a reason, and permission denied. [WIG]
7. **Flow builder essentials:**
   - fixed-width nodes that never overlap
   - a neutral grid
   - category colour confined to the icon tile
   - labelled ports with 24 px hit areas
   - a right-hand inspector instead of modals
   - a persistent issues list
   - a keyboard alternative for every drag
   - selection deep-linked in the URL
   - an unsaved-changes guard

   [WIG; ADM; Inf]
8. **Voice product essentials:**
   - one explicit call-state machine, where each state has a label, icon, colour and live-region announcement
   - a speaker-labelled streaming transcript with "Jump to latest"
   - audio visuals that move only on real audio
   - `en-IN` money formatting
   - `type="tel"` phone inputs
   - confirmation before anything that dials real customers

   [Inf; WIG]

### 5.3 Rules checklist

#### 5.3.1 Layout

- [ ] **L1 One app shell.** Every authenticated page uses the same sidebar, the same page header and a content area. The header holds the title, a one-line description, at most one primary action, and secondary actions. Its height, padding and title style are identical everywhere. [TS colour and shape locks; ADM]
- [ ] **L2 Gutters and widths.**
  - Page gutters are 24 px at 1024 px and wider, and 16 px on mobile.
  - Reading pages (Settings, Billing, Knowledge) have a max width of about 1280-1440 px.
  - Canvas and table pages (Flow Builder, Call Reports, Leads) are full-bleed.

  [ADM Vercel; TS]
- [ ] **L3 One 4 px grid.** Inside panels, the vertical rhythm is:
  - 8 px from label to value
  - 16 px between fields
  - 24 px between groups
  - 32-48 px between page sections

  [ADM]
- [ ] **L4 Cards only where elevation means something.**
  - A KPI row is a single bordered strip with 1 px dividers. The Leads KPI strip already does this.
  - No box inside a box inside a box. Dashboard fields currently sit in bordered boxes inside a bordered panel.

  [TS cards rule; I2C anti-nested-box]
- [ ] **L5 No idle centre stage.** Do not give the middle of the viewport to a decoration. Give that space to the primary task: pick contact, pick flow, dial, then the live transcript. [TS motivated design; WIG no dead ends; Inf]
- [ ] **L6 Labelled, grouped sidebar.**
  - Show text labels by default at 1280 px and wider, collapsible to icons.
  - Mark the active item clearly.
  - Group the 12 destinations:

  | Group | Destinations |
  |---|---|
  | Operate | Assistant, Cockpit, Rep Console, Meeting Agent, Personal Agents |
  | Build | Flow Builder, Knowledge |
  | Data | Leads, Call Reports, Analytics |
  | Account | Billing, Settings |

  [TS redesign: current-page indicator; WIG icons have labels]
- [ ] **L7 Sticky chrome never hides focus.** The wallet banner, page header and table header must never cover a focused element. Keep total sticky chrome at 96 px or less on a 900 px tall viewport. [WIG]
- [ ] **L8 Deliberate, optical alignment.**
  - Nudge icons 1-2 px against text where needed.
  - Right-align numeric table columns.
  - Bottom-align buttons across a group of cards.

  [WIG; TS redesign]
- [ ] **L9 No horizontal page scroll.** A wide table scrolls inside its own container, with a sticky first column and a visible edge fade. [WIG]

#### 5.3.2 Typography

- [ ] **T1 Two families only: one UI sans and one mono.**
  - Keep the shipped **Hanken Grotesk**, which is already the `--font-sans` token, or move to Geist.
  - Keep **JetBrains Mono** strictly for phone numbers, IDs, timers, durations, code and API keys.
  - Retire Sora, Instrument Serif, Syne, Rajdhani and every unused `@font-face` registration. Today 12 families are registered and 5 are rendered.
  - Add **Noto Sans Devanagari** (sans, not serif) as the fallback for Hindi transcripts.

  [TS; ADM; Inf]
- [ ] **T2 Fix the root font variable.** The UI must never fall back to the system sans. Preload and subset fonts with `unicode-range`. [WIG; design-system finding]
- [ ] **T3 App type scale** (size/line-height in px, weight, tracking):

  | Role | Spec |
  |---|---|
  | Caption | 12/16, 400 |
  | Small (tables, meta) | 13/18, 400 or 500 |
  | **Body (app default)** | **14/20, 400** |
  | Body large | 16/24, 400 |
  | Title small | 16/24, 600 |
  | Title | 20/28, 600, -0.2 |
  | Page title | 24/32, 600, -0.4 |
  | Display (marketing only) | 32/40 at -0.8; 48/52 at -1.8; 64/68 at -2.6 |

  Use weights 400, 500 and 600 only, with 600 as the ceiling. [ADM Linear, Vercel, Cal.com]
- [ ] **T4 Tracking.**
  - Negative tracking only at 20 px and above.
  - Body text stays at 0 and never gets positive tracking.
  - No letter-spacing wider than +0.02em, except rare 11 px all-caps table headers.

  [ADM]
- [ ] **T5 No mono uppercase wide-tracked labels on fields, cards and sections.**
  - Field labels are sentence case at 13/500 in the secondary colour.
  - Uppercase is allowed only for table column headers or a single badge style.

  [TS eyebrow restraint and redesign's all-caps warning; ADM Intercom; I2C pseudo-enterprise labels]
- [ ] **T6 Tabular numerals** (`font-variant-numeric: tabular-nums`) on every number that updates or is compared: timers, durations, counts, INR amounts, latency, percentages and numeric table columns. [WIG; ADM Stripe]
- [ ] **T7 Line-height.**
  - 1.5 for functional UI text.
  - 1.6 for long text (transcripts, knowledge).
  - About 1.7 for Devanagari, so vowel marks fit.

  [ADM Sentry; Inf]
- [ ] **T8 Measure.** Paragraphs are at most about 65-75 characters wide in Knowledge, Assistant replies and docs. [TS]
- [ ] **T9 Wrapping.** Use `text-wrap: balance` on headings and `pretty` on short paragraphs. No widows in empty-state copy. [WIG]
- [ ] **T10 Typographic details.**
  - Use the real ellipsis character `…` and curly quotes.
  - Put a non-breaking space between a number and its unit (`90 s`, `10 MB`).
  - Let `Intl` handle the rupee sign.

  [WIG]

#### 5.3.3 Colour

- [ ] **C1 One neutral family.** Choose either cool zinc or neutral gray, and never mix warm and cool grays. [TS]
- [ ] **C2 One accent**, likely the Vaani brand blue or indigo. It is used for:
  - the primary CTA
  - the focus ring
  - selection
  - links
  - the active nav item

  To get there:
  - Remove the purple from Meeting Agent.
  - Remove the green from ACTIVATE. It is a primary action, not a success state.
  - Remove the teal from Import CSV.

  [TS colour lock; ADM all]
- [ ] **C3 Semantic colours for state only.**

  | Semantic | Used for |
  |---|---|
  | Success | Connected or live, completed |
  | Warning | Low balance, ringing, pending |
  | Danger | Failed, negative sentiment, destructive |
  | Info | Same as the accent |

  Each state has a soft background, an AA-contrast text colour on that background, and an icon. [WIG redundant status cues; ADM Vercel]
- [ ] **C4 Badge text passes AA on its own soft background.** These starter pairs have been checked:

  | Colour | Text on background | Contrast |
  |---|---|---|
  | Blue | `#1e40af` on `#dbeafe` | 7.15:1 |
  | Green | `#166534` on `#dcfce7` | 6.49:1 |
  | Red | `#991b1b` on `#fee2e2` | 6.80:1 |
  | Amber | `#92400e` on `#fef3c7` | 6.37:1 |

  [WIG; TS form contrast check]
- [ ] **C5 Primary button contrast.**

  | Label on fill | Contrast | Result |
  |---|---|---|
  | White on `#2563eb` | 5.17:1 | Pass |
  | White on `#1d4ed8` | 6.70:1 | Pass |
  | White on green-600 `#16a34a` | 3.30:1 | **Fail** |
  | White on `#15803d` | 5.02:1 | Pass (use this if a green button is kept deliberately) |
  | Black on `#2563eb` | 4.06:1 | Fail |

  The existing `.btn-saffron` black-on-blue measured 3.83:1. [TS button contrast check]
- [ ] **C6 No AI-template chrome.**
  - No pure `#000` or `#fff` canvas in dark mode.
  - No neon glows.
  - No gradient text in the app.
  - No purple-to-blue gradient backgrounds.

  [TS AI tells and its rule against default purple/blue glow; ADM Linear no atmospheric gradients]
- [ ] **C7 Separate chart palette.** It is colour-blind-safe, uses 5-6 hues at most, and stays apart from brand chrome. Sentiment always combines an icon, a label and a colour. [WIG; ADM Intercom report palette]
- [ ] **C8 Hue consistency.** On a tinted surface, such as the wallet banner or a selected row, tint the borders and text toward the same hue. [WIG]
- [ ] **C9 Do not copy reference grays blindly.** Some reference grays are safe only for disabled or decorative text:
  - Vercel's mute gray `#888` on white is 3.54:1.
  - Linear's tertiary gray on its canvas is 3.62:1.

  Use these for readable secondary text instead:

  | Surface | Use | Avoid |
  |---|---|---|
  | White | `#737373` (4.74:1) or darker | `#888` |
  | Dark canvas `#0a0a0b` | `#8b8b93` (5.85:1) | `#71717a` (4.09:1) |

  [WIG contrast; researcher's measurements]

#### 5.3.4 Spacing and density

- [ ] **S1 Spacing scale.** 4 px base with steps 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. [ADM]
- [ ] **S2 Control heights.**

  | Height | Use |
  |---|---|
  | 32 px | Compact: toolbars, table actions |
  | 36 px | Default |
  | 40 px | Primary forms |
  | 44 px minimum | Touch |

  [WIG; ADM Vercel]
- [ ] **S3 Table rows.**
  - Rows are 44 px by default and 36 px in compact mode.
  - Horizontal cell padding is 12-16 px.
  - Leads rows are about 65 px today, which is low density for a CRM.

  [ADM; Inf]
- [ ] **S4 Panel padding.**
  - App cards and panels: 16-20 px, with 24 px as the maximum.
  - Marketing cards: 24-32 px.

  [ADM Raycast, Linear]
- [ ] **S5 Density by surface.** App density is 6-7.
  - Pages where users scan and compare are dense: Leads, Call Reports, Analytics tables.
  - Setup forms are calmer: Settings, Billing.

  [TS dials; ADM Sentry]
