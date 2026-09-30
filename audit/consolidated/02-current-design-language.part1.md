## 2. Current design language (as-is)

**Scope and sources.** This section only describes what ships today. The problems it causes are listed in section 3B (visual) and in the accessibility and functional sections.
- `raw/design-system.md` provides a computed-style inventory of 12 authenticated pages plus `/`, `/pricing` and `/docs`, at 1440x900 in the light theme unless stated. It covers every visible element and all 3,595 CSS rules.
- `raw/visual-audit.md` covers 14 authenticated routes, including `/settings/organization` and `/api-keys`, plus the signed-out `/login` and `/`.
- The notes on modals, drawers and toasts come from `raw/a11y-manual.md`, `raw/explore-data.md`, `raw/explore-settings.md`, `raw/flow-canvas.md`, `raw/flow-config.md`, `raw/ux-audit.md` and `raw/qa-a.md`.
- Screenshots are in `audit/screenshots/va-design-system/` and `audit/screenshots/va-visual-audit/`.

**In one paragraph.** A real token layer exists: 32 semantic CSS variables with complete light and dark pairs, on Tailwind v4, with a consistent neutral ramp. Markup mostly bypasses it through arbitrary values (`text-[9px]`, `rounded-[9px]`, `bg-[#8b5cf6]`) and raw Tailwind palette classes. As a result the light app renders 5 font families, 16 font sizes, 30 letter-spacings, 24 text colours, 62 background colours, 42 border colours, 12 radii, 80 button styles, 12 input styles and 20 badge styles. Visually the app splits into four or five dialects. The public site is a separate system: dark, violet and set in Hanken Grotesk.

### 2.1 Stack, libraries and infrastructure

| Layer | In use today | Evidence |
|---|---|---|
| Framework | **Next.js**, probably App Router | 5 `/_next/static/...` scripts. next/font `__variable_*` classes on `<body>`. 2 CSS chunks (163 and 426 top-level rules). |
| Styling | **Tailwind CSS v4** | `@layer properties, theme, base, utilities`, 71 `@property` rules, colours emitted as `oklab()/oklch()` via `color-mix`, about 2,433 utility rules. 1,243 of 1,419 class tokens on Dashboard are utility-like. 929 of 10,510 class tokens on Call Reports are arbitrary `[...]` values. |
| Component primitives | **None.** No shadcn, Radix, Headless UI, sonner or cmdk. | 0 `data-radix-*`, 0 `data-state`, 0 `data-slot` on every page. Dialogs, drawers, tabs and tooltips are hand-rolled. The only shared primitive is a CVA-style React `<Button>`. |
| Custom CSS layer | 202 non-utility classes | `.btn-saffron`, `.btn-outline`, `.btn-danger`, `.input-vani`, `.glass`, `.glass-card`, `.glass-light`, `.bento-card`, `.badge-xs`, `.hud-bracket`, `.glow-*`, `.link-saffron`, `.font-editorial`, `.font-accent`, `.font-devanagari`, `.type-floor`, `.dashboard-root`, `.section-numeral`, `.pull-quote`, `.prose-editorial`. Also about 90 BEM `docs-*` classes and the landing-page `vlp-*` classes. |
| Canvas | **React Flow / xyflow** (Flow Builder only) | `.react-flow.flow-builder-canvas.light` with background, minimap and controls. Attribution is hidden. 8 node types (start, speak, question, whatsapp, end, condition, transfer, knowledge_lookup). Handles are 12px circles. Edges are 1px `#2f5fe0`. |
| Charts | No library | 0 `.recharts-wrapper`. Charts are hand-built SVG and DOM: 80x32 sparklines, the sentiment stacked area, the hour-of-day cell grid and the intent bars. |
| Icons | **lucide-react** only | `lucide` class on 84/84 SVGs on Leads, 266/266 on Call Reports and 75/78 on Analytics. Outline style, about 1.5px stroke. The only non-Lucide icons are the logo and a few custom SVGs. |
| Fonts | next/font | 12 families, 139 `@font-face` rules (see 2.3.2) |
| Motion | 36 `@keyframes` | breathe, scanline, flicker, ticker, mandala-spin, orbit-spin, sphereBreath, sphereGlow, soundPulse, waveform-bar, shimmer, marquee, typewriter-caret, ring-pulse, the `vlp*` set, spin/ping/pulse/bounce and more. The only `prefers-reduced-motion` block (3 rules) covers `.vlp-*`. |
| Theme switch | Class-based `html.dark` plus `localStorage["vv:theme"]` | No cookie is set. Tailwind `dark:` utilities (21 rules) compile under `@media (prefers-color-scheme: dark)` instead (see 2.6). |
| Breakpoints | Tailwind sm/md/lg/xl/2xl (40/48/64/80/96rem) plus ad-hoc ones | Ad-hoc: 420, 640, 720, 760, 767 (max), 1079 (max) and 1080px |

### 2.2 Declared tokens (what the CSS says)

#### 2.2.1 App theme variables: `:root` vs `:root.dark` (32 each)

| Current name | Light | Dark | Role it actually plays |
|---|---|---|---|
| `--background` | `#f4f6fa` | `#0c0d12` | Page background |
| `--surface` / `--surface-light` / `--surface-hover` | `#fff` / `#eef1f7` / `#e4e9f2` | `#14161d` / `#1a1d26` / `#232733` | Card, inset and hover surfaces |
| `--foreground` = `--text-primary` | `#111725` | `#e8eaf2` | Primary text |
| `--text-secondary` | `#3e475a` | `#a6abbd` | Secondary text |
| `--text-muted` | `#7a8397` | `#7b8196` | Muted text. About 3.5–3.8:1 in light, 4.35–5.0:1 in dark. |
| `--saffron` | **`#2f5fe0` (blue)** | **`#7c6bf5` (violet)** | Brand primary. The name is a leftover from a saffron theme, and the hue changes with the theme. |
| `--saffron-dim` | `#1e48b8` | `#9a8cff` | Pressed/emphasis. Darker in light, lighter in dark. |
| `--saffron-glow` / `-strong` / `-subtle` | `#2f63e0` at 34/50/14% | `#7c6bf5` at 50/70/20% | Glows and focus ring |
| `--peacock` / `--peacock-dim` | `#0e9488` / `#0b756b` (teal) | `#38c6e0` / `#22a8c4` (cyan) | Secondary accent. The hue changes with the theme. |
| `--peacock-glow*` | `#0e9488` at 32/50/14% | `#38c6e0` at 50/70/20% | |
| `--border-color` | `#e1e6ef` | `#282c38` | Default hairline (892 rendered sides) |
| `--border-light` | `#cbd3e1` | `#3a3f4f` | Stronger border. In light it is darker than `--border-color`, despite the name. |
| `--sentiment-positive` / `-neutral` / `-negative` | `#178a55` / `#b5820e` / `#d0463a` | `#3fb984` / `#e0b341` / `#f0685e` | The **only semantic status set**. It doubles as success / warning / danger. |
| `--glass-bg` / `-strong` / `-subtle` | white at 72/85/55% | `#14161d` at 70/82%, `#1a1d26` at 50% | Translucent panels and inputs |
| `--code-bg` / `--code-border` | black at 4/6% | white at 5/6% | Code blocks |
| `--grid-line-color` / `--dot-grid-color` / `--noise-opacity` | black 8% / black 6% / .02 | `#2a2a2a` 30% / white 5% / .03 | Background textures |
| `--scrollbar-thumb-hover` | black 22% | white 20% | |

There are no `--primary-foreground`, `--ring`, `--warning`, `--info`, elevation or z-index variables.

A separate **docs palette** (`.docs-api`, 9 variables) is neutral and dark only: `--docs-bg #050505`, `--docs-paper #0d0d0d`, `--docs-ink #ededed`, `--docs-ink-soft #a1a1a1`, `--docs-ink-faint #666`, `--docs-rule #1d1d1d`, `--docs-rule-strong #2a2a2a`, `--docs-code-bg #0a0a0a` and `--docs-code-rule #1a1a1a`.

#### 2.2.2 Tailwind `@theme` (151 variables)

- **Fonts:** `--font-sans: var(--font-hanken), var(--font-dm-sans), var(--font-geist-sans), system-ui`. `--font-mono: var(--font-jetbrains), var(--font-geist-mono)`. `--font-display: var(--font-sora)`.
- **Type scale:** Tailwind defaults from `text-xs` (12) to `text-7xl` (72). The app mostly ignores them and uses arbitrary `text-[7px]` to `text-[13px]`. **52 distinct font-size values** exist in the compiled utilities, including 7, 8, 9, 10, 10.5, 12.5, 13.5, 14.5 and 17.5px, 1.05rem, 1.7rem, 1.9rem, 2.6rem, 3.2rem, 3.6rem, 4.4rem, 6.5rem, 120px, 160px and 200px.
- **Radius:** `sm .25rem`, `md .375rem`, `lg .5rem`, `xl .75rem`, `2xl 1rem`, `3xl 1.5rem`, plus arbitrary `1.35rem`, `3px` and `9px`.
- **Shadow:** only `drop-shadow-lg`. There is no elevation scale.
- **Colour:** 18 raw hue families are emitted, which means they are used directly in markup: red, orange, amber, yellow, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate and zinc. There are also **45 distinct hex literals** in arbitrary utilities. The most frequent is `#8b5cf6` ×50, then `#a78bfa` ×11, followed by `#0ea5e9`, `#2dd4bf`, `#0a0a0a`, `#a855f7`, `#06070b`, `#34d399`, `#0078d4`, `#3b82f6`, `#f43f5e`, `#f59e0b`, `#fbbf24`, `#fb923c`, `#7c3aed` and others.

#### 2.2.3 Component classes (definitions read from CSS)

| Class | Definition (abridged) | Where it renders |
|---|---|---|
| `.btn-saffron` | `bg var(--saffron); color rgb(0,0,0); 600; var(--font-sans); radius 8; padding 9px 18px; 14px; .2s`. Hover adds a glow and `translateY(-1px)`. Disabled uses opacity .5. Mobile sets `min-height 44px`. No `:focus-visible`. | Primary actions on Dashboard, Billing, Knowledge, Settings |
| `.btn-outline` | `color text-primary; 1px border-light; radius 8; 9px 18px; 14px/500`. Hover turns the border and text saffron. | Billing, Knowledge, Settings |
| `.btn-danger` | `bg sentiment-negative; #fff`. The hover shadow uses Tailwind red-500 `rgba(239,68,68,.5)`, not the token. | Destructive actions |
| `.input-vani` | `bg glass-bg-strong; 1px border-color; radius 8; 10px 14px; 14px`. Focus: saffron border plus a `0 0 0 2px` ring at 14% alpha. Error: `rgba(239,68,68,.2)` ring. | Settings, Call Reports search, Leads search |
| `.glass-card` / `.bento-card` | radius 16 / radius 20. The bento hover uses a hard-coded violet border `rgba(124,107,245,.2)` and `0 20px 60px rgba(0,0,0,.4)`. | Cards, Analytics |
| `.badge-xs` | `11px !important; lh 1.3` | Small badges |
| `.type-floor` | Forces `text-[7..12px]` and `text-xs` up to `13px !important` | **Defined but applied to no element** |
| `.link-saffron` | Saffron text with a violet `rgba(124,107,245,.4)` bottom border (blue text over a violet underline in light) | Inline links |
| `.hud-bracket` / `.section-numeral` / `.font-editorial` | 12px saffron corner brackets at 60%; "§ 01" numerals; `Instrument Serif, EB Garamond, Georgia, serif` | Analytics only |
| `.dashboard-root` | `14px / 1.55` | App root |

### 2.3 De-facto tokens: what actually renders

Counts are summed across the 12 authenticated pages in the light theme. Typography counts are text nodes (1,812 in total). Spacing and border counts are element sides.

#### 2.3.1 Distinct values per property

| Property | Distinct values | Dominant values |
|---|---|---|
| Font families rendered / registered | **5** / **12** (139 `@font-face`) | JetBrains Mono, Hanken Grotesk, Sora |
| Font sizes rendered / in compiled CSS | **16** / **52** | 13px (815), 11px (281), 10px (236) |
| Line-heights | **32** | |
| Font weights | 4 | 500 ×1,527, 700 ×150, 600 ×124, 800 ×11 |
| Letter-spacing | **30** (−0.8px to +4px) | |
| Type styles (family × size × weight × tracking × case × italic) | **84** | |
| Text colours (including alpha) | **24** | `#3e475a`, `#7a8397`, `#111725` |
| Background colours (including alpha) | **62** | `#f4f6fa`, `#fff`, `#eef1f7` plus 5–20% tints |
| Border colours (including alpha) | **42** | `#e1e6ef` ×892 |
| Border widths | 2 | 1px, 2px (measured as 0.8 and 1.6px at DPR 1.25) |
| Border radii | **12** | 8px ×336, full ×327, 6px ×195 |
| Box-shadows | 8 | Glows only, no elevation |
| Padding values | **19** | 12 ×2,339, 16 ×2,048, 8 ×549 |
| Gap values | 9 | 4 ×286, 6 ×181, 8 ×175 |
| Icon sizes | **22** | 20, 16, 14, 12 |
| z-index values | 10 | 0, 1, 2, 4, 5, 10, 20, 30, 50, 9999 |
| Transitions | 8 | .15s and .2s `cubic-bezier(.4,0,.2,1)` |
| Button styles | **80** | See 2.4 |
| Input styles | **12** | See 2.4 |
| Badge and chip styles | **20** | See 2.4 |

#### 2.3.2 Font families: registered, loaded and rendered

| Family | Status | Where it renders today |
|---|---|---|
| **JetBrains Mono** (variable, 100–800) | Rendered and dominant | Body text, labels, inputs and table meta on Dashboard, Leads, Analytics, Flow Builder (node bodies), Meeting Agent (100%, including the H1), Rep Console (including the H1), Billing, Knowledge, Settings and Login. Usually set at 8–12px, uppercase, with wide tracking. |
| **Hanken Grotesk** | Rendered. Weights 400–700 are registered, but `document.fonts` showed only 500 loaded in the app. | The whole of Call Reports (936 nodes, the only app page in this face), the sidebar labels and footer, the React `<Button>` (via `font-sans`), and the body and H1 (72/600, −1.8px) on the marketing home page |
| **Sora** (600/700 loaded, 400–700 registered) | Rendered | H1 on 10 of the 12 main pages. Analytics H2s at 27.2px/**800**, a weight that is not registered, so it is presumably synthesised. Uppercase toolbar buttons ("NEW LEAD", "NEW TASK", Analytics Refresh at 10/700). |
| **Instrument Serif** (400 italic) | Rendered on Analytics only | Section taglines, kickers, and the 30px italic "not allocated yet" |
| **System `ui-sans-serif`** (Segoe UI on Windows, SF on macOS) | Rendered by accident | Every element without a font utility, plus everything styled by `.btn-*` and `.input-vani`. Dominant on Assistant and Personal Agents. Also used by buttons and inputs on Billing, Settings and Login. |
| Syne | Wordmark only | Login and marketing (5 characters) |
| DM Sans, Geist, Geist Mono, Inter (registered as `--font-matter`, 35 faces), Rajdhani, Noto Serif Devanagari, Tiro Devanagari Hindi | Registered but not seen on any page scanned | None |

Why the fallback happens (inferred): next/font puts its `--font-*` variables on `<body>` classes. Tailwind resolves `--font-sans` and `--default-font-family` at `:root`/`html`, where those variables are not defined, so `body` computes to `ui-sans-serif, system-ui, …`.

#### 2.3.3 Type scale with counts (1,812 text nodes)

| Size | Nodes | Typical use today |
|---|---|---|
| 8px | 29 | Leads "Source" badges (mono, bold, uppercase), Analytics micro-labels |
| 9px | 109 | Mono uppercase field labels (Dashboard intel fields, Analytics KPI labels), Kbd hints. The most common size on Dashboard. |
| 10px | 236 | Mono body text, table meta, filter chips, toolbar buttons, telemetry strip |
| 11px | 281 | Call Reports status badges, sidebar, captions, Flow node bodies |
| 12px | 175 | Mono body on Meeting Agent, Billing, Knowledge; mono inputs |
| 13px | 815 | Call Reports body (Hanken), Assistant, React `<Button>` |
| 14px | 105 | `.btn-*` buttons, `.input-vani`, card titles |
| 15px | 1 | Analytics H1 |
| 16px | 14 | Analytics serif kickers, Call Reports stats |
| 18px | 18 | H1 on 5 pages, H2 on 3 pages |
| 20px | 10 | H1 on 4 pages |
| 24px | 5 | Rep Console H1, balances |
| 27.2 / 30.4px | 8 / 4 | Analytics H2s and KPI numerals (fluid `calc`) |
| 30 / 32px | 1 / 1 | Personal Agents H1 / Analytics serif display |

- 36% of text nodes are below 12px, and 7.6% are 8–9px.
- Uppercase is heavy on the data pages: Analytics has 84 uppercase elements (76 of them mono) and Leads has 111. Uppercase is produced both by CSS `text-transform` and by literal capitals in the strings ("AGENT COCKPIT", "BILLING").
- Letter-spacing runs from −0.8px (tight headings) to +4px (Leads H1, Analytics "UPDATED" stamp). Analytics micro-labels alone use +1.8, +2.25, +2.5, +3 and +4px.

#### 2.3.4 Colour roles in use (light theme, sRGB after compositing)

| Role | Value | Rendered count | Contrast (from sources) |
|---|---|---|---|
| Text primary | `#111725` | 197 | ≈17.9:1 on white (computed) |
| Text secondary | `#3e475a` | 344 | 9.32:1 on white |
| Text muted | `#7a8397` | 338 solid, plus 499 at 50% alpha | 3.80:1 on white, 3.52:1 on `#f4f6fa`, 3.36:1 on `#eef1f7`. About 1.75–1.81:1 at 50% alpha. |
| Accent (peacock/teal) | `#0e9488` | 102, plus 46 at 80% | 3.74:1 on white |
| Primary (saffron/blue) | `#2f5fe0` | 92 as text; the fill of every primary button | White on it would be 5.48:1 |
| Positive / neutral / negative | `#178a55` / `#b5820e` / `#d0463a` | 88 / 27 / 18 | 4.37 / 3.41 / 4.55:1 on white |
| On-primary text | `#000000` (and `#111725` on the banner "Top up") | 12 | 3.83:1 (3.27:1 for `#111725`) |
| Off-token text | `#8b5cf6` and `#a78bfa` (Meeting Agent, one Call Reports badge), `#fbbf24` and `#fb923c` (Flow node titles), `#f472b6`, `#fb2c36` (Rep Console error, red-500), `#a2a8b6` / `#a1a7b5` (low-alpha helper text) | | Flow node text 1.48–2.72:1 |

- **Semantic colour today.** The sentiment trio is the only status palette, so "neutral" mustard doubles as warning and info is implicitly the primary. Error red renders four ways: `#d0463a` (token), `#fb2c36` (Rep Console "Could not connect"), `rgba(239,68,68,…)` (`.btn-danger` hover and the input error ring) and `#d76a60` (Settings "Delete Account"). The success glow is green-500 `rgba(34,197,94,.5)`, not the token.
- **Accent usage.**
  - Blue is used for filled primaries, links, the non-link durations in the Analytics Recent table, and half of the Analytics KPIs.
  - Teal is used for secondary CTAs ("IMPORT CSV", "Test Call", "Re-analyze", "Embed") and the other half of the KPIs.
  - Green (with a glow) is used for "ACTIVATE" only.
  - Violet `#8b5cf6` is Meeting Agent's own primary, in both themes.
  - Flow node categories use Tailwind-400 amber, orange, violet and pink as *text*.
  - Call Reports KPIs are blue, teal, green and red.
- **Backgrounds (62).**
  - Surfaces: `#f4f6fa` (page), `#fff` (card), `#eef1f7` (inset/card, also at 50% and 40%).
  - Tints: brand and sentiment colours at 5, 10, 15 and 20%.
  - Wallet banner: about `#dde3f7`.
  - Dark-theme values leaking into light: `#1a192b` ×42 (Flow minimap), `#3bc4e2` at 10% ×24 (Analytics hour grid), black at 10/20% (Personal Agents cards), white at 2%.
- **Borders (42).**
  - `#e1e6ef` ×892 (token)
  - `#ffffff` ×216 (Flow node rims)
  - `#e1e6ee` at 60% ×178
  - `#0f9487` at 40% ×172
  - `#cbd3e1` ×156
  - 37 more alpha variants, including white at 10% and 6%, which are invisible on light surfaces

#### 2.3.5 Radius distribution

| Radius | Count | Where |
|---|---|---|
| 8px | 336 | Default buttons, inputs, Dashboard panels |
| full (`calc(infinity)`) | 327 | Pills, badges, filter chips |
| 6px | 195 | Small buttons, table actions, mono inputs |
| 4px | 74 | Kbd chips, pagination, Flow counters |
| 100% | 54 | Flow handles, avatars |
| 12px | 43 | Cards on Knowledge and Call Reports; ACTIVATE |
| 16px | 36 | `.glass-card`, Flow panels, Analytics cards, marketing cards |
| 3px | 25 | Leads row checkboxes |
| 9px | 12 | Sidebar logo tile (`rounded-[9px]`) |
| 20px | 4 | `.bento-card` (Analytics) |
| 10px | 1 | |
| 0 | — | Meeting Agent segmented control and React Flow controls (visual audit) |

Card containers alone use 8, 12, 16 and 20px. The marketing home page uses 15 different radii.

#### 2.3.6 Shadows and elevation (8 values, no scale)

- Cards are flat: a hairline border and no shadow.
- The rendered shadows are:
  - glows: primary `0 0 10px rgba(47,99,224,.34)`; the 20px primary hover glow with a −1px lift; success `0 0 10px rgba(34,197,94,.5)` on ACTIVATE
  - two Flow panel shadows: `0 14px 40px rgba(0,0,0,.22)` and `0 18px 55px rgba(0,0,0,.26)`
  - the `.bento-card` hover: `0 20px 60px rgba(0,0,0,.4)`
  - the `.input-vani` focus ring: `0 0 0 2px #2f63e024`
- Overlays (modals, drawers) rely on a blur or translucent veil rather than elevation.
- z-index goes up to 9999, with no named layers.

#### 2.3.7 Spacing

- **Padding (19 values):** 12 ×2,339, 16 ×2,048, 8 ×549, 2 ×408, 4 ×374, 10 ×230, 24 ×192, 14 ×105, 6 ×68, 20 ×47, 9 ×22, 18 ×22, and 28, 32, 36, 40, 48, 80, 96. The off-grid 9 and 18px come from the `.btn-*` padding (`9px 18px`).
- **Gap (9 values):** 4 ×286, 6 ×181, 8 ×175, 12 ×130, 16 ×51, plus 1, 2, 10 and 24.
- A 4px grid is mostly followed. 12, 16, 8 and 4 dominate.
- **Page gutter:** the header bar has 24px horizontal padding.
- **Content widths** vary by page: full-bleed, about 1150, about 1120, 640, 576 and 512px (see 2.5).

