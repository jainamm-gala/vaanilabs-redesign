# Vaani Labs (vaanilabs.in): inventory of the current design language

**Role:** Design-System Specialist (agent `va-design-system`)
**Date:** 2026-09-26
**Target:** https://vaanilabs.in (live production, signed-in customer account; light theme by default in the app)
**Browser status:** OK. No logout happened. All work ran in a private, network-guarded window. It was closed at the end.
**Screenshots:** `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-design-system/`

> Privacy: this report contains no lead or customer names, phone numbers or emails. Some screenshots on local disk show masked phone numbers and demo lead data.

---

## 1. Method

For every main page (desktop 1440x900, light theme unless stated), in-page scripts collected these data:

1. **Computed-style inventory of every visible element.** This covers font-family (first family and full stack, classified as mono / sans / serif), font-size, line-height, weight, letter-spacing, text-transform, font-style, text colour, background colour and background-image, per-side border width and colour, border-radius, box-shadow, per-side padding and margin, flex/grid gap, transition, backdrop-filter, z-index, and the rendered size of every top-level `<svg>`.
2. **Component signatures.** Every `button`, `[role=button]` and `a[role=button]` was grouped by a signature: height, padding, radius, bg, fg, border, family, size, weight, tracking and case. Inputs (`input`/`textarea`/`select`) and "badge-like" elements (≤30px tall, ≤13px text, with a fill or border and a radius) were grouped the same way.
3. **Framework detection.** The scripts scanned class names (Tailwind utility patterns, arbitrary `[...]` values), `data-radix-*` / `data-state` / `data-slot` / sonner / cmdk attributes, React Flow classes, `_next/` scripts and next/font `__variable_*` classes.
4. **CSS token extraction.** All `document.styleSheets` were walked (2 same-origin sheets, 3,595 rules). The scan recorded every custom property per selector (`:root`, `:root.dark`, Tailwind `@theme`, `.docs-api`), every non-utility component class, keyframes, media queries, and the font-size and hex literals inside compiled utilities.
5. **Fonts.** `document.fonts` was listed, together with the next/font variables on `<body>`.
6. **Contrast scan (WCAG 2.x).** For every text-bearing element in the first ~3 viewport heights, the effective background was built by alpha-compositing ancestor backgrounds (gradients and images are ignored), and text alpha and ancestor opacity were composited over it. The scan counts elements below 4.5:1, or below 3:1 for large text.
   - Known false positive: the collapsed-sidebar status labels ("SYS: ONLINE", "LAT") are faded to opacity 0 and show up as "1.00:1" (4 per page, 20 on Meeting Agent). The adjusted figures below subtract them.
   - Home-page gradient text is also a false positive.
7. **Visual verification.** Every page was screenshotted and viewed. The dark theme was toggled in the sandboxed tab. One 390px mobile check was made, plus a focus-order (Tab) probe and a sidebar hover.

Pages covered (app): `/dashboard`, `/assistant`, `/analytics`, `/leads`, `/flow-builder`, `/meeting-agent`, `/personal-agents`, `/rep-console` (brief visit), `/call-reports`, `/billing`, `/knowledge`, `/settings` (Profile).
Pages covered (public): `/`, `/pricing`, `/docs`.
Not covered: `/login`, `/signup` (not visited while signed in, to avoid disturbing the session), other settings sub-pages, other legal/marketing pages.

Guard artefacts (not product bugs): posthog was blocked, so console `ERR_BLOCKED_BY_CLIENT` messages appeared. No UI save or submit was attempted.

---

## 2. Stack and framework detection

| Item | Finding | Evidence |
|---|---|---|
| Framework | **Next.js** (App Router likely) | 5 `/_next/static/...` scripts. next/font `__variable_*` classes on `<body>`. 2 CSS chunks `/_next/static/css/da9d1f5ed8ad3f6e.css` (163 rules) and `60577ff11a6a93f6.css` (426 top-level rules). |
| CSS | **Tailwind CSS v4** | `@layer properties, theme, base, utilities`. 71 `@property` rules. Colours emitted as `oklab()/oklch()` (colour-mix opacity modifiers). About 2,433 utility rules. 1,243 of 1,419 class tokens on the dashboard are Tailwind-like. Arbitrary values are everywhere (`text-[9px]`, `rounded-[9px]`, `bg-[#8b5cf6]`, `w-[72px]` ...). On Call Reports, 929 of 10,510 class tokens are arbitrary. |
| Component library | **None (no shadcn/Radix/Headless UI)** | 0 `data-radix-*`, 0 `data-state`, 0 `data-slot`, 0 sonner, 0 cmdk on every page scanned. |
| Canvas | **React Flow / xyflow** on Flow Builder | `.react-flow.flow-builder-canvas.light` with background, minimap and controls. Attribution is hidden. 26 nodes of 8 types (start, speak, question, whatsapp, end, condition, transfer, knowledge_lookup). Handles are 12px circles, edges are 1px `#2f5fe0`. |
| Charts | No chart library detected | 0 `.recharts-wrapper`. Sparklines are small custom SVGs (80x32). |
| Icons | **lucide-react** (single library) | The `lucide` class is on nearly all SVGs (e.g. leads 84/84, call reports 266/266, analytics 75/78). The rest are the logo and custom SVGs. |
| Custom CSS layer | 202 non-utility classes | `.btn-saffron/.btn-outline/.btn-danger`, `.input-vani`, `.glass/.glass-card/.glass-light`, `.bento-card`, `.badge-xs`, `.hud-bracket`, `.glow-*`, `.link-saffron`, `.font-editorial/.font-accent/.font-devanagari`, `.type-floor`, `.dashboard-root`, `.section-numeral`, `.pull-quote`, `.prose-editorial`, about 90 BEM `docs-*` classes, and landing `vlp-*` classes. |
| Keyframes | 36 | breathe, scanline, flicker, ticker, mandala-spin(-reverse), compliance-fluctuate, fade-in, fadeInUp, fadeIn, slideDown, slideUp, gentlePulse, sphereBreath, sphereGlow, waveform-bar, float-in-nav, scaleReveal, marquee(-reverse), shimmer, countPop, orbit-spin, soundPulse, typewriter-caret, mandala-drift, ticker-step, flap-in, ring-pulse, vlpRise, vlpFloat, vlpEq, and spin/ping/pulse/bounce. |
| Theme switch | Class-based `html.dark` with `localStorage["vv:theme"]` | Toggling did not change `document.cookie`. |

---

## 3. Declared tokens (CSS custom properties)

### 3.1 App theme tokens: `:root` (light) vs `:root.dark` (32 each)

| Token | Light | Dark | Note |
|---|---|---|---|
| `--background` | `#f4f6fa` | `#0c0d12` | |
| `--foreground` / `--text-primary` | `#111725` | `#e8eaf2` | |
| `--text-secondary` | `#3e475a` | `#a6abbd` | |
| `--text-muted` | `#7a8397` | `#7b8196` | **Fails AA on light surfaces (3.52–3.80:1)** |
| `--saffron` (primary) | **`#2f5fe0` (blue)** | **`#7c6bf5` (violet)** | The name says saffron, the value is blue or violet. The hue changes between themes. |
| `--saffron-dim` | `#1e48b8` | `#9a8cff` | "dim" is darker in light but lighter in dark |
| `--saffron-glow / -strong / -subtle` | `#2f63e057 / 80 / 24` | `#7c6bf580 / b3 / 33` | |
| `--peacock` (accent) | `#0e9488` (teal) | `#38c6e0` (cyan) | Hue changes between themes |
| `--peacock-dim` | `#0b756b` | `#22a8c4` | |
| `--peacock-glow*` | `#0e948852/80/24` | `#38c6e080/b3/33` | |
| `--surface` | `#fff` | `#14161d` | |
| `--surface-light` | `#eef1f7` | `#1a1d26` | |
| `--surface-hover` | `#e4e9f2` | `#232733` | |
| `--border-color` | `#e1e6ef` | `#282c38` | Dominant border (892 border sides) |
| `--border-light` | `#cbd3e1` | `#3a3f4f` | "light" is darker than "border-color" in the light theme |
| `--sentiment-positive` | `#178a55` | `#3fb984` | |
| `--sentiment-neutral` | `#b5820e` | `#e0b341` | |
| `--sentiment-negative` | `#d0463a` | `#f0685e` | |
| `--glass-bg / -strong / -subtle` | `#ffffffb8 / d9 / 8c` | `#14161db3 / d1 / #1a1d2680` | |
| `--code-bg / --code-border` | `#0000000a / 0f` | `#ffffff0d / 0f` | |
| `--grid-line-color / --dot-grid-color / --noise-opacity` | `#00000014 / 0f / .02` | `#2a2a2a4d / #ffffff0d / .03` | |
| `--scrollbar-thumb-hover` | `#00000038` | `#fff3` | |

A separate **docs palette** (`.docs-api`, 9 vars) is pure neutral and dark only: `--docs-bg #050505`, `--docs-paper #0d0d0d`, `--docs-ink #ededed`, `--docs-ink-soft #a1a1a1`, `--docs-ink-faint #666`, `--docs-rule #1d1d1d`, `--docs-rule-strong #2a2a2a`, `--docs-code-bg #0a0a0a`, `--docs-code-rule #1a1a1a`.

### 3.2 Tailwind `@theme` (151 vars)

- **Fonts:** `--font-sans = var(--font-hanken), var(--font-dm-sans), var(--font-geist-sans), system-ui`. `--font-mono = var(--font-jetbrains), var(--font-geist-mono)`. `--font-display = var(--font-sora)`.
- **Type scale:** Tailwind defaults `text-xs 12` to `text-7xl 72`. The app mostly bypasses them with arbitrary `text-[7px]` to `text-[13px]`. The compiled CSS has **52 distinct font-size values** in utilities, including 7px, 8px, 9px, 10px, 10.5px, 12.5px, 13.5px, 14.5px, 17.5px, 1.05rem, 1.7rem, 1.9rem, 2.6rem, 3.2rem, 3.6rem, 4.4rem, 6.5rem, 120px, 160px and 200px.
- **Radius:** `sm .25rem, md .375rem, lg .5rem, xl .75rem, 2xl 1rem, 3xl 1.5rem`, plus arbitrary `1.35rem`, `3px` and `9px`.
- **Shadow:** only `drop-shadow-lg`. **There are no elevation tokens.**
- **Colour:** 18 raw Tailwind hue families are emitted, which means they are used directly in markup: red, orange, amber, yellow, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, zinc.
- **Hex literals:** **45 distinct hex literals** appear inside compiled utilities. The most frequent are `#8b5cf6` ×50, `#a78bfa` ×11, `#0ea5e9`, `#2dd4bf`, `#0a0a0a`, `#a855f7`, `#06070b`, `#34d399`, `#0078d4`, `#3b82f6`, `#06b6d4`, `#14b8a6`, `#22c55e`, `#38bdf8`, `#60a5fa`, `#94a3b8`, `#6366f1`, `#ec8a3d`, `#f43f5e`, `#f59e0b`, `#f472b6`, `#f97316`, `#fb923c`, `#fb7185`, `#fbbf24`, `#7c3aed`, `#7c4ef3` ...

### 3.3 Web fonts (next/font): 12 families, 139 `@font-face` rules

Registered on `<body>`:

- `--font-hanken` (Hanken Grotesk 400–700)
- `--font-dm-sans` (DM Sans, variable)
- `--font-geist-sans` (Geist, variable)
- `--font-geist-mono`
- `--font-jetbrains` (JetBrains Mono, variable)
- `--font-sora` (Sora 400–700)
- `--font-syne` (Syne 400–800)
- `--font-rajdhani` (Rajdhani 400–700)
- `--font-matter`, which is **Inter** 400–800 in 35 faces (the name does not match the font)
- `--font-instrument` (Instrument Serif 400 and italic)
- `--font-noto-deva` (Noto Serif Devanagari 400–700)
- `--font-tiro-deva` (Tiro Devanagari Hindi 400 and italic)

**Actually rendered in the app:**

- JetBrains Mono
- Hanken Grotesk
- Sora
- Instrument Serif (Analytics only)
- The OS system font. Computed as `ui-sans-serif`, which becomes Segoe UI on Windows. See finding 07.

Syne appears once on marketing. DM Sans, Geist, Geist Mono, Inter, Rajdhani and both Devanagari families were not seen on the pages scanned.

### 3.4 Component classes worth knowing (definitions read from CSS)

| Class | Definition (abridged) | Problem |
|---|---|---|
| `.btn-saffron` | `background: var(--saffron); color: rgb(0,0,0); font-weight:600; font-family: var(--font-sans); border-radius:8px; padding:9px 18px; font-size:14px; transition:.2s`. Hover: glow plus translateY(-1px). Disabled: opacity .5. Mobile: min-height 44px. | Black text on blue is 3.83:1. No `:focus-visible`. The font resolves to the system font. |
| `.btn-outline` | `color: var(--text-primary); border:1px solid var(--border-light); radius 8; padding 9px 18px; 14px/500`. Hover: border and text become saffron. | No focus style |
| `.btn-danger` | `background: var(--sentiment-negative); color:#fff; ...`. Hover shadow `rgba(239,68,68,.5)` (red-500, not the token). | |
| `.input-vani` | `bg var(--glass-bg-strong); border 1px var(--border-color); radius 8; padding 10px 14px; 14px`. Focus: `border-color: var(--saffron); box-shadow: 0 0 0 2px var(--saffron-glow-subtle)` (a 14% alpha ring). Error: `rgba(239,68,68,.2)` ring. | Focus ring is very faint |
| `.glass-card` | `bg var(--glass-bg-strong); border 1px var(--border-color); radius 16px` | |
| `.bento-card` | `bg var(--glass-bg); border; radius 20px; transition .4s cubic-bezier(.16,1,.3,1)`. Hover: `border rgba(124,107,245,.2)`, shadow `0 20px 60px rgba(0,0,0,.4)`. | Hard-coded dark violet |
| `.badge-xs` | `font-size: 11px !important; line-height 1.3` | |
| `.type-floor` | Forces `text-[7..12px]` and `text-xs` to `13px !important` | **Exists, but no element on the dashboard carries `.type-floor`, so the floor is not applied.** |
| `.link-saffron` | `color var(--saffron); border-bottom 1px rgba(124,107,245,.4)` | Underline is violet while the text is blue in light mode |
| `.hud-bracket` | 12px corner brackets in `var(--saffron)` at 60% | Used on Analytics cards |
| `.font-editorial` | `var(--font-instrument), "EB Garamond", Georgia, serif` | Analytics kickers |
| `.dashboard-root` | `font-size:14px; line-height:1.55` | |

---

## 4. De-facto tokens: what actually renders (12 app pages, light theme)

Counts are text nodes (typography) or element sides (spacing and borders), summed across the 12 authenticated pages.

### 4.1 Distinct values per property (app, light)

| Property | Distinct values | Healthy target |
|---|---|---|
| Font families rendered | **5** (JetBrains Mono, Hanken Grotesk, Sora, Instrument Serif, system `ui-sans-serif`) | 2 (sans + mono) |
| Font families loaded or registered | **12** (139 @font-face) | 2–3 |
| Font sizes rendered | **16** (8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 27.2, 30, 30.4, 32 px) | 7–8 |
| Font sizes in compiled CSS | **52** | ≤10 |
| Line-heights | **32** | 6–8 |
| Font weights | 4 (500 ×1527, 700 ×150, 600 ×124, 800 ×11) | 3 |
| Letter-spacing | **30** (−0.8 to +4px) | 3–4 |
| Type "styles" (kind × size × weight × tracking × case × italic) | **84** | ~12 |
| Text colours (incl. alpha) | **24** | 6–8 |
| Background colours (incl. alpha) | **62** | ~12 |
| Border colours (incl. alpha) | **42** | 3–4 |
| Border widths | 2 (0.8px = 1 CSS px at DPR 1.25, and 1.6px = 2px) | 2 |
| Border radii | **12** (3, 4, 6, 8, 9, 10, 12, 16, 20, 100%, full, left-flat pill) | 5–6 |
| Box-shadows | 8 (mostly glows; no elevation scale) | 3–4 |
| Padding values | **19** (2, 4, 6, 8, **9**, 10, 12, 14, 16, **18**, 20, 24, 28, 32, 36, 40, 48, 80, 96) | 4px grid |
| Gap values | 9 (1, 2, 4, 6, 8, 10, 12, 16, 24) | 6–7 |
| Icon sizes | **22** (mostly 20, 16, 14, 12, 11, 10, 9, 8) | 3–4 (16/20/24) |
| z-index values | 10 (0, 1, 2, 4, 5, 10, 20, 30, 50, 9999) | 5 named layers |
| Transitions | 8 (0.15s and 0.2s standard, 0.4s spring, 0.7s ...) | 3 |
| **Button styles** | **80** distinct signatures across the app (5–36 per page; Flow Builder alone has 36) | ~10 (5 variants × 2–3 sizes) |
| **Input styles** | **12** | 2–3 |
| **Badge and chip styles** | **20** | ~6 |

### 4.2 Font-size distribution (app, 1,812 text nodes)

| Size | Nodes | Typical use |
|---|---|---|
| 8px | 29 | Leads "Source: manual" badges (mono 8px bold uppercase), Analytics micro-labels |
| 9px | 109 | Mono uppercase field labels (Dashboard "CUSTOMER NAME", Analytics KPI labels) |
| 10px | 236 | Mono body text, table meta, filter chips |
| 11px | 281 | Call Reports status badges, sidebar, captions |
| 12px | 175 | Mono body (Meeting Agent, Billing, Knowledge) |
| 13px | 815 | Call Reports body (Hanken), Assistant |
| 14px | 105 | Buttons and card titles |
| 15px | 1 | Analytics H1 |
| 16px | 14 | Analytics serif kickers, Call Reports stats |
| 18px | 18 | H1 on 5 pages, H2 on 3 pages |
| 20px | 10 | H1 on 4 pages |
| 24px | 5 | Rep console H1, balances |
| 27.2px / 30.4px | 8 / 4 | Analytics H2 and KPI numerals (fluid calc) |
| 30px / 32px | 1 / 1 | Personal Agents H1 / Analytics serif |

**36% of all text nodes are below 12px. 7.6% are 8–9px.**

### 4.3 Colour roles actually used (hex after compositing to sRGB)

- **Text**
  - `#7a8397` muted: 338 plus 499 at 50% alpha
  - `#3e475a` secondary: 344
  - `#111725` primary: 197
  - `#0e9488` peacock: 102, plus 46 at 80% alpha
  - `#2f5fe0` saffron: 92
  - `#178a55` positive: 88
  - `#b5820e`: 27
  - `#d0463a`: 18
  - `#000000` (text on primary buttons): 12
- **Off-token text:**
  - `#8b5cf6`: Meeting Agent
  - `#a78bfa`: call-reports badge, Meeting Agent
  - `#fbbf24` and `#fb923c`: Flow node titles
  - `#fb2c36`: Rep Console, Tailwind red-500
  - `#f472b6`
  - `#a2a8b6` and `#a1a7b5`: helper text at low alpha
- **Backgrounds:** 62 distinct values. Most are alpha tints of brand and sentiment colours at 5, 10, 15 and 20%. Also:
  - `#1a192b` ×42: Flow Builder minimap, dark in light mode
  - `#3bc4e2 @10%` ×24: the dark-theme peacock used on light Analytics
  - `#000 @10%` / `@20%` and `#fff @2%`: dark-theme utilities leaking into light mode
- **Borders:**
  - `#e1e6ef` ×892 (token)
  - `#ffffff` ×216 (flow node rims)
  - `#e1e6ee @60%` ×178
  - `#0f9487 @40%` ×172
  - `#cbd3e1` ×156
  - plus 37 more alpha variants
  - `#ffffff @10%` / `@6%`: invisible in light mode

### 4.4 Radius distribution

| Radius | Count | Where |
|---|---|---|
| 8px | 336 | Default buttons, inputs, cards |
| full (`calc(infinity)`) | 327 | Pills and badges |
| 6px | 195 | Small buttons, table actions |
| 4px | 74 | Kbd chips, pagination |
| 100% | 54 | Flow handles, avatars |
| 12px | 43 | Cards (Knowledge, Call Reports) |
| 16px | 36 | glass-card, Flow panels, Analytics cards |
| 3px | 25 | Leads row checkboxes |
| 9px | 12 | Sidebar logo tile (`rounded-[9px]`) |
| 20px | 4 | bento-card / Analytics |
| 10px | 1 | |

### 4.5 Spacing

- **Padding:** 12px ×2339, 16px ×2048, 8px ×549, 2px ×408, 4px ×374, 10px ×230, 24px ×192, 14px ×105, 6px ×68, 20px ×47, 9px ×22, 18px ×22 ...
  - The off-grid 9 and 18px come from `.btn-saffron` / `.btn-outline` (`9px 18px`).
- **Gap:** 4px ×286, 6px ×181, 8px ×175, 12px ×130, 16px ×51.
- 12, 16, 8 and 4 dominate. A 4px grid is **mostly** followed.

---

## 5. Page-by-page language

| Page | Families (text nodes) | Distinct sizes | Distinct button styles | H1 treatment | Light contrast fails* |
|---|---|---|---|---|---|
| Dashboard "Agent Cockpit" | mono 27 / sans 12 | 6 (9–18) | 9 | Sora 18/700, +0.9px, literal UPPERCASE "AGENT COCKPIT" | 25/35 (71%) |
| Assistant | sans 20 (Hanken + system) | 6 | 7 | Sora 20/700, −0.5px, sentence case | 5/16 (31%) |
| Analytics | **mono 172 / sans 33 / serif-italic 15** | **14** (8–32) | 9 | Sora 15/700, +2.7px, CSS uppercase. Serif-italic kicker 11px. H2s Sora 27.2/800. "§ 01" numerals | 82/133 (62%) |
| Leads | mono 158 / sans 69 | 7 (8–20) | 12 | Sora 20/700, **+4px**, CSS uppercase | 127/223 (57%) |
| Flow Builder | mono 52 / sans 48 | 7 | **36** | Sora 18/700, +0.45px, title case, with a mono uppercase subtitle | 34/96 (35%) |
| Meeting Agent | **mono 55 / sans 8** | 6 | 11 | **JetBrains Mono 20/600**, violet "— Vikash" | 38/61 (62%) |
| Personal Agents | sans 22 / mono 4 | 6 | 5 | **Sora 30/700**, −0.75px, hero-style, centred max-width layout, no header bar | 8/22 (36%) |
| Rep Console | mono 12 / sans 8 | 5 | 5 | **JetBrains Mono 24/500** | 10/16 (63%) |
| Call Reports | **sans 936 (Hanken), 0 mono** | 6 | 9 | Sora 20/700, −0.5px, plus count pill | 565/722 (78%) |
| Billing | mono 16 / sans 17 | 6 | 7 | Sora 18/700, +0.9px, literal "BILLING" | 12/29 (41%) |
| Knowledge | mono 58 / sans 17 | 6 | 11 | Sora 18/700, +0.9px, literal "AGENT KNOWLEDGE" | 32/71 (45%) |
| Settings | sans 30 / mono 23 | 6 | 8 | Sora 18/700, +0.9px, literal "SETTINGS" | 31/49 (63%) |

\* Fails / measured text nodes, with the collapsed-sidebar status false positives removed.
**Total light mode: 969 of 1,473 measured text nodes fail AA (66%). Without Call Reports: 404 of 751 (54%).**
**The same pages in dark mode:** Dashboard 7/36 (19%), Billing 2/30 (7%), Personal Agents 2/23 (9%).

So there are **four visual dialects** inside one app:

1. **"Terminal/HUD" dialect.** JetBrains Mono 9–12px, UPPERCASE, wide tracking (0.225–4px), hairline borders, glows, grid and noise backgrounds, HUD brackets. Used on Dashboard, Leads, Meeting Agent, Knowledge, Billing, Rep Console and Flow Builder panels.
2. **"Editorial" dialect.** Instrument Serif italic kickers, "§ 01" numerals, Sora 27px/800 section heads, hatch patterns. Analytics only.
3. **"Plain SaaS" dialect.** Hanken Grotesk 13px, sentence case, soft pills. Used on Assistant and Call Reports, and on Call Reports it comes with the only use of the shared React `<Button>`.
4. **"Violet product" dialect.** Tailwind violet-500 `#8b5cf6` primary with white text and square segmented control. Meeting Agent only.

Personal Agents adds a fifth, marketing-like hero layout.

---

## 6. Components that exist today (standardisation candidates)

| Component | Current implementations observed | Recommendation |
|---|---|---|
| **Button** | (a) React `<Button>` (CVA-like): `inline-flex items-center justify-center gap-2 rounded-lg font-sans transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-saffron/60 disabled:opacity-50 ... bg-saffron text-black font-semibold h-8 px-3 text-[13px]`. Only 2 of 103 buttons on Call Reports use it; 0 on Leads and Knowledge. (b) CSS `.btn-saffron/.btn-outline/.btn-danger` on Billing, Knowledge, Settings and Dashboard. (c) Bespoke Tailwind strings everywhere else. **80 styles in total.** Primary heights: 24, 28, 32, 33, 37, 39, 40, 43 and 44px. | Keep (a) as the single source. Variants: primary, secondary/outline, ghost, destructive, link. Sizes sm 32 / md 36 / lg 40 (44 on touch). Replace (b) and (c). |
| **"Refresh" action** | 6 renderings. Analytics: Sora 10/700 +2px UPPER, 29h, r6. Leads: Mono 10/500 +0.5px UPPER, 29h, r8. Call Reports: Hanken 13/500, 32h, r8. Billing and Knowledge: `.btn-outline` 14px, 38h. Meeting: Mono 12, 24h, borderless. Personal Agents: Mono 11 +1.1px UPPER, 35h, border white/10 (invisible). | A single `Button variant=secondary size=sm` with a RefreshCw icon |
| **Icon button** | 36x36 r8 (sidebar footer), 32x32 r6 (Leads call), 24x24 r6 (Call Reports row actions ×50), 34h r0 (React Flow controls), 22x22 r4 (banner dismiss) | IconButton sizes 28 / 32 / 36 with a required `aria-label` |
| **Input** | 12 styles. `.input-vani` (43h, 14px system font, r8, white/85): Settings, Call Reports search, Leads search. Mono 12px 34h r6 `#eef1f7`: Billing, Knowledge, Settings. Mono 12px 30h: Dashboard intel fields. Mono 10px 21h: Dashboard flow select. Mono 14px 42h: Meeting Agent. Hanken 13px 42h: Assistant composer. Pill filters 25h mono 10px UPPER: Leads. | Input / Select / Textarea / SearchField with heights 32/36/40, one font (sans), and a visible 2px focus ring |
| **Badge / Status pill** | 20 styles. Leads status "new": mono 9px +0.225px UPPER, teal/10 fill + teal/30 border, 20h. Leads source: mono **8px** bold UPPER, 16h. Analytics "completed": mono 9px +1.8px UPPER, outline only. Call Reports "COMPLETED": Hanken 11px +0.275px UPPER, green/10 fill, no border, 18h. Billing "Inactive": mono 10px UPPER outline pill. Flow counters: mono 9px r4. Kbd hints: mono 9px r4. | `Badge tone={neutral, info, success, warning, danger, brand} variant={soft, outline}`, 12px min, 20/24h, one casing rule. Separate `Kbd` component. |
| **Card / Panel** | glass-card r16; bento-card r20; Knowledge white r12 (pad 20 or 24); Call Reports stats r12 surface-light/40; Dashboard panels r8; Flow panels r16 with shadow `0 14px 40px rgba(0,0,0,.22)`; Personal Agents `bg-black/20` cards. | Card with 2 elevations and 1 radius (12), padding 16/24 |
| **Page header** | 63px sticky bar, pad-x 24, white/80, bottom border (most pages). Personal Agents has no bar. Analytics has an editorial bar. H1 comes in 7 different treatments (section 5). | A `PageHeader` component (icon + title + description + actions) with one title style |
| **Segmented control / tabs** | Dashboard voice toggle (Vaani/Vikash, 38h mono 14); Analytics range 7d/30d/90d (24h mono 10 UPPER); Call Reports sentiment filter (28h Hanken 13 capitalize pills); Leads status/source chip filters (25h mono 10 UPPER pills); Meeting Agent session mode (32h square, violet fill); Knowledge source tabs (30h mono 12 r8). | One SegmentedControl plus one FilterChip |
| **Table** | Leads (custom rows with avatars), Call Reports (horizontally scrolling table; header Hanken 13, body 13), Knowledge files (mono 12). The page grid background shows through the Leads rows. | DataTable with density options, sticky header and solid row bg |
| **Empty state** | Personal Agents (centred text + link), Billing ("No transactions yet." mono 12 in a bordered box), Transcript feed ("Awaiting connection..." mono, 1.77:1 in dark), Assistant (icon + heading + chips). | EmptyState component |
| **Banner** | Wallet banner. `#2f5fe0` tint bg. "Top up" button `bg-saffron text-ink` at 24h (3.27:1). "Enable autopay" outline at 4.12:1. | Alert/Banner with tone tokens |
| **Nav** | Desktop: 72px icon-only rail with 44x44 items, `title` tooltips only, active item = 3px left bar + tint, no `aria-current`. Mobile: bottom tab bar with 7 labelled items (Assistant, Agent, Leads, Reports, Billing, Knowledge, **Exit**). | NavItem with a visible label or a proper Tooltip, `aria-current="page"`, and one label source |

---

## 7. Findings

### DESIGN-SYSTEM-01: Primary buttons render black (or ink) text on the blue primary (3.27–3.83:1) [HIGH, accessibility]

- **Evidence:** `.btn-saffron { background: var(--saffron); color: rgb(0,0,0) }`. The bespoke `bg-saffron text-black` and `bg-saffron text-ink` classes do the same. `--saffron` is `#2f5fe0` in light mode.
  - Measured `#000000 on #2f5fe0 = 3.83:1` for: CONNECT (Dashboard), New Lead (Leads), New task (Personal Agents), Export CSV (Call Reports), Save (Flow Builder), Enable UPI Auto-Debit, ₹500 and Pay with UPI (Billing), Upload & Embed and Search (Knowledge), Save Changes (Settings).
  - "Top up" in the global banner is `#111725 on #2f5fe0 = 3.27:1`.
  - In dark mode `--saffron` is `#7c6bf5`, where black gives 5.28:1. The on-colour was tuned for the old dark or orange brand and never re-tokenised.
  - See `zoom-primary-buttons-callreports.png`, `billing.png`, `leads.png`.
- **Recommendation:** Add `--primary-foreground` per theme. In light mode use `#ffffff` on `#2f5fe0` (about 5.5:1). Remove `color:#000` from `.btn-saffron` and remove `text-black` / `text-ink` from primary buttons.

### DESIGN-SYSTEM-02: Muted text token and tiny type fail WCAG AA across the light app (66% of measured text) [HIGH, accessibility]

- **Evidence:** `--text-muted #7a8397` gives 3.52:1 on `#f4f6fa` and 3.80:1 on `#fff`. It is the most common text colour on Analytics (85 nodes) and Leads (98 nodes). The Call Reports empty-cell text at muted/50 is 1.75:1 (×381).
  - Status badges on Call Reports: BROWSER `#3aa79e on #e9f1f4` 2.56:1 (×38), NEUTRAL 2.83:1, COMPLETED 3.57:1, NEGATIVE 3.67:1.
  - Leads "new" badge: 3.08:1 (×25).
  - Meeting helper text `#a2a8b6` on white: 2.38:1.
  - 36% of text nodes are under 12px, and 138 nodes are 8–9px mono uppercase.
  - Per-page fail rates: 31–78% (section 5). Total 969/1,473.
- **Recommendation:** Muted text at about `#5b6478` (≈5.5:1 on `#f4f6fa`). Minimum text size 12px, with 11px allowed only for uppercase badges at 600 weight. Apply the existing `.type-floor` logic globally. Badge foreground should use the `-dim` shades (`#0b756b`, `#1e48b8`) on 10% tints.

### DESIGN-SYSTEM-03: Brand primary is blue in the light app, violet in the dark app and on marketing, and Meeting Agent hard-codes its own violet [HIGH, consistency]

- **Evidence:**
  - `--saffron` is `#2f5fe0` in light and `#7c6bf5` in dark. `--peacock` is `#0e9488` in light and `#38c6e0` in dark.
  - Marketing (`/`, `/pricing`, `/docs`) is forced dark with a `#7c6bf5` → `#38c6e0` gradient.
  - Meeting Agent uses `bg-[#8b5cf6]`, `hover:bg-[#7c3aed]`, `text-[#a78bfa]`, `border-[#8b5cf6]/50`, `ring-[#8b5cf6]/20` (13 classes), with white text at 4.23:1.
  - The token names ("saffron", "peacock") describe neither value.
  - Component classes hard-code the dark violet `rgba(124,107,245,…)`: `.bento-card` hover, `.link-saffron` underline, `.section-numeral`, and the dashboard radial gradient.
  - See `meeting-agent.png`, `dark-dashboard.png`, `home.png`.
- **Recommendation:** Pick one brand hue and keep it in both themes (adjust lightness only). Rename tokens semantically: `--primary`, `--accent`, `--success`, `--warning`, `--danger`. Remove per-feature brand colours.

### DESIGN-SYSTEM-04: Three parallel button systems and 80 distinct button styles; "Refresh" alone has 6 designs [HIGH, design-system]

- **Evidence:**
  - The React `<Button>` with `focus-visible:ring-saffron/60` is used on 2 of 103 buttons, on Call Reports only.
  - `.btn-saffron/.btn-outline/.btn-danger` are used on Billing, Knowledge, Settings and Dashboard.
  - All other buttons are bespoke strings: Leads 0/49 shared, Knowledge 0/13.
  - Distinct button signatures per page: Flow Builder 36, Leads 12, Knowledge 11, Meeting 11, Analytics 9, Dashboard 9, Call Reports 9, Settings 8, Assistant 7, Billing 7, Personal Agents 5, Rep Console 5.
  - Primary button heights: 24, 28, 32, 33, 37, 39, 40, 43, 44px.
  - Casing varies: "NEW LEAD" and "NEW TASK" are Sora bold uppercase with tracking; "Export CSV" and "Save Changes" are sentence case; "CONNECT" is literal uppercase in the system font.
- **Recommendation:** Adopt the existing React Button as the only primitive (variants and sizes as in section 6), with a codemod to replace `.btn-*` and the bespoke strings, and a lint rule that forbids raw `<button className=…>` outside `ui/`.

### DESIGN-SYSTEM-05: Typography sprawl (5 families rendered, 12 registered, 16 sizes, 30 trackings, 84 type styles) with mono as the default body face on data pages [HIGH, visual]

- **Evidence:** Rendered families are JetBrains Mono, Hanken Grotesk, Sora, Instrument Serif and the system font.
  - Mono share of text: Analytics 172/220, Leads 158/227, Meeting 55/63, Knowledge 58/75, Dashboard 27/39. Assistant and Call Reports use no mono at all.
  - Letter-spacing ranges from −0.8px to +4px (Leads H1 +4px, Analytics micro-labels +1.8, +2.25, +2.5, +3, +4px).
  - There are 32 line-heights.
  - 12 families and 139 @font-face rules are registered (Inter as `--font-matter`, Syne, Rajdhani, Geist, Geist Mono, DM Sans, 2 Devanagari faces). Only 4 web fonts were seen rendering in the app.
- **Recommendation:**
  - Two families. Hanken Grotesk (or one chosen sans) for UI and body; JetBrains Mono only for code, IDs, timers and numbers (tabular).
  - Sora only if a separate display face is really wanted.
  - Type scale 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 with fixed line-heights.
  - Tracking tokens: tight −0.01em, normal, caps +0.06em.
  - Drop unused font registrations. Keep the Devanagari families only where Hindi text renders.

### DESIGN-SYSTEM-06: Page titles use 7 different treatments across 12 pages [MEDIUM, visual]

- **Evidence:**
  - Sora 18/700 +0.9px literal uppercase: Dashboard, Billing, Knowledge, Settings.
  - Sora 20/700 −0.5px sentence case: Assistant, Call Reports.
  - Sora 20/700 +4px CSS uppercase: Leads.
  - Sora 15/700 +2.7px uppercase with a serif-italic subtitle: Analytics.
  - Sora 18/700 +0.45px title case with a mono uppercase subtitle: Flow Builder.
  - JetBrains Mono 20/600: Meeting Agent. JetBrains Mono 24/500: Rep Console.
  - Sora 30/700 hero with a mono eyebrow and no header bar: Personal Agents.
  - Sizes: 15, 18, 20, 24 and 30px. Four case styles. Uppercase is sometimes CSS and sometimes literal text.
- **Recommendation:** A `PageHeader` component: 20px/600 sentence case, optional 13–14px description, right-aligned actions, 64px bar. Remove literal uppercase strings.

### DESIGN-SYSTEM-07: The base font silently falls back to the OS system font (inferred mechanism) [MEDIUM, visual]

- **Evidence:** `body` computes to `ui-sans-serif, system-ui, sans-serif, …`. The next/font variables (`--font-hanken`, etc.) are declared on `<body>` classes, but Tailwind's `--default-font-family` / `--font-sans` reference them at `:root`/`html`, where they are undefined. As a result:
  - Every element without an explicit font utility, and every element styled by `.btn-saffron`, `.btn-outline` or `.input-vani`, computes to `ui-sans-serif` (Segoe UI on Windows, SF on macOS). Examples: CONNECT, Pay with UPI, Save Changes, the Settings, Call Reports and Leads search inputs, sidebar controls, and Assistant body copy.
  - Elements with the `font-sans` utility (for example the React Button) compute to Hanken Grotesk.
  - Counts per page of `ui-sans-serif` text nodes: Personal Agents 15, Call Reports 12, Assistant 10, Knowledge 7, Flow 6, Billing 6.
- **Recommendation:** Put the next/font `variable` classes on `<html>` (or define the font variables on `:root`) so that `--default-font-family` resolves. Then verify that `getComputedStyle(document.body).fontFamily` starts with Hanken.

### DESIGN-SYSTEM-08: Toggling the colour theme fires `PUT /api/flows/{id}` on Dashboard and Flow Builder [HIGH, functional-bug]

- **Evidence (observed under the audit's network guard; the request was blocked):**
  - On Flow Builder, idle for 6s: 0 writes. Clicking "Switch to dark mode" → `PUT https://vaanilabs.in/api/flows/f9b04a18-…` within 1.5s.
  - The same PUT was seen after toggling on Dashboard.
  - No write on Billing or Personal Agents.
  - The theme is only `html.dark` plus `localStorage["vv:theme"]`, and cookies were unchanged.
  - Inferred: the flow canvas re-serialises theme-dependent node styles, or an effect saves on re-render.
- **Recommendation:** Decouple presentation state from flow persistence. Never persist on theme or viewport changes. Keep node colours as semantic types resolved by CSS, not stored hex. Add a regression test asserting that no mutating requests follow a theme toggle.

### DESIGN-SYSTEM-09: Dark-first styling leaks into the light theme and produces invisible or illegible elements [HIGH, visual]

- **Evidence:**
  - Personal Agents example cards use `rounded-lg border border-white/[0.06] bg-black/20`, rendering grey cards with `#7a8397` text on `#c3c5c8` at 2.20:1. The surrounding container border is `border-white/10`, which is invisible. Compare `personal-agents.png` with `dark-personal.png`.
  - Flow Builder node titles use amber-400 `#fbbf24` on `#eef1f7` (1.48:1) and orange-400 `#fb923c` (2.00:1). They read fine only in dark mode (`dark-flow-builder.png`).
  - The Flow Builder minimap is a dark `#1a192b` block in light mode.
  - Analytics uses the dark-theme cyan `rgba(56,198,224,.1)` ×24.
  - Light contrast fail rates are 31–78% per page, versus 7–19% for the same pages in dark mode.
- **Recommendation:** Treat light mode as a first-class theme. Every colour comes from a semantic token with values for both themes. Ban `white/…`, `black/…` and raw palette utilities in app code with a lint rule. Add visual-regression snapshots for both themes.

### DESIGN-SYSTEM-10: Raw colours bypass the token layer (45 hex literals, 18 Tailwind hue families, 4 different "error reds") [MEDIUM, design-system]

- **Evidence:**
  - Compiled utilities contain 45 distinct hex literals (for example `#8b5cf6` ×50, `#a78bfa`, `#0ea5e9`, `#2dd4bf`, `#0078d4`, `#f43f5e`, `#fbbf24`, `#fb923c` …).
  - The `@theme` emits red, orange, amber, yellow, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate and zinc.
  - Error red appears as the token `#d0463a`, Tailwind red-500 `#fb2c36` (Rep Console "Could not connect", 3.27:1), `rgba(239,68,68,…)` (btn-danger hover and input error ring), and `#d76a60` (Settings "Delete Account", 3.25:1).
  - The success glow is `rgba(34,197,94,.5)` (green-500), not the token `#178a55`.
  - Rendered: 24 text colours, 62 backgrounds, 42 border colours.
- **Recommendation:** Semantic palette of about 12 background/foreground pairs, with tints generated from tokens via `color-mix`. Remove the raw palette from `@theme` and enforce it with a Tailwind config or lint rule.

### DESIGN-SYSTEM-11: The `dark:` variant follows the OS setting, while the app theme follows a class (inferred risk) [MEDIUM, design-system]

- **Evidence:** 21 rules (`dark:bg-slate-900`, `dark:text-red-300`, `dark:border-amber-800`, `dark:hover:bg-slate-800` …) are compiled inside `@media (prefers-color-scheme: dark)`. That is Tailwind v4's default. The in-app toggle only sets `html.dark` and swaps CSS variables. A user whose OS is dark but whose app theme is light, or the reverse, gets mismatched panels. Not seen rendered on Settings or Leads, so the exact affected screens are unknown.
- **Recommendation:** Add `@custom-variant dark (&:where(.dark, .dark *));` to the Tailwind entry file. Prefer token swaps over `dark:` utilities.

### DESIGN-SYSTEM-12: No focus-ring token; most controls rely on the browser default or have none [MEDIUM, accessibility]

- **Evidence:**
  - Sidebar links show the browser default `outline: auto ~1px` (`focus-state-sample.png`).
  - 0/49 buttons on Leads and 0/13 on Knowledge carry any `focus`/`focus-visible` class. `.btn-saffron` and `.btn-outline` define no `:focus-visible`.
  - The `.input-vani:focus` ring is `0 0 0 2px #2f63e024` (14% alpha, far below 3:1).
  - Only the React Button has `focus-visible:ring-2 ring-saffron/60`.
  - The sidebar Tab order alternates between links and unlabelled focusable `DIV`s.
- **Recommendation:** A global `:focus-visible` token (2px solid `--ring`, 2px offset, ≥3:1 against adjacent colours) in the base layer, and remove the extra tab stops.

### DESIGN-SYSTEM-13: 20 badge and chip styles; the same status looks different on different pages [MEDIUM, consistency]

- **Evidence:** "completed" on Analytics is mono 9px +1.8px uppercase outline-only. "COMPLETED" on Call Reports is Hanken 11px +0.275px uppercase soft-filled with no border.
  - Leads source badge: mono 8px bold uppercase, 16px tall.
  - Leads status: mono 9px teal soft plus border.
  - Billing "Inactive": mono 10px outline pill.
  - Badge heights: 16, 18, 20, 21, 24, 25px.
  - Sentiment appears as a coloured word (Dashboard "POSITIVE"), a pill (Call Reports) and a "pp" chip (Analytics).
- **Recommendation:** A `Badge` component (tone × soft/outline, 20/24px, 12px 600, one casing) and a `StatusBadge` mapping from domain status to tone.

### DESIGN-SYSTEM-14: 12 input styles (heights 21–43px, mono vs sans, 4 radii, 4 fills) [MEDIUM, consistency]

- **Evidence:** See the Input row of the component table (section 6).
  - Dashboard flow select: 21px, mono 10px.
  - Leads filter selects: 25px pills, mono 10px uppercase.
  - Billing, Knowledge and Settings: 34px mono 12px on `#eef1f7`.
  - Settings, Call Reports and Leads search: 43px `.input-vani`, system 14px.
  - Meeting Agent: 42px mono 14px.
  - Assistant composer: 42px Hanken 13px.
- **Recommendation:** Input / Select / Textarea with sizes 32/36/40, sans text (mono only for code or API-key values), one fill (surface) and one border token, plus focus, error, disabled and read-only states.

### DESIGN-SYSTEM-15: Radius and elevation are unsystematic (12 radii, no shadow scale, z-index up to 9999) [MEDIUM, visual]

- **Evidence:**
  - Radii: 3, 4, 6, 8, 9, 10, 12, 16, 20px, 100% and full.
  - Card containers use 8, 12, 16 and 20px (Dashboard panels 8, Knowledge 12, glass-card 16, bento-card 20).
  - The only theme shadow is `drop-shadow-lg`. The rendered shadows are ad-hoc glows (`0 0 10px rgba(47,99,224,.34)`, `0 0 10px rgba(34,197,94,.5)`) and two flow-panel shadows (`0 14px 40px rgba(0,0,0,.22)`, `0 18px 55px rgba(0,0,0,.26)`).
  - z-index values: 0, 1, 2, 4, 5, 10, 20, 30, 50, 9999.
- **Recommendation:** Radius scale xs 4 / sm 6 / md 8 / lg 12 / xl 16 / full. Elevation tokens 0–3. Named z-layers: base, sticky, dropdown, overlay, modal, toast.

### DESIGN-SYSTEM-16: Decorative textures sit behind data (grid, noise, dot grid, hatch, HUD brackets) [MEDIUM, visual]

- **Evidence:**
  - An SVG noise overlay is on every app page.
  - A 1px 8%-black grid is on Dashboard, Leads and Analytics.
  - Analytics adds a dot grid, hatch backgrounds and `.hud-bracket` corners.
  - The grid lines show through the semi-transparent Leads table rows (`leads.png`, vertical lines crossing the rows).
- **Recommendation:** Solid `--surface` behind tables, forms and dense data. Keep textures for marketing, hero and empty states.

### DESIGN-SYSTEM-17: 36 keyframe animations with reduced-motion support only on landing classes [LOW, accessibility]

- **Evidence:** Keyframes include breathe, scanline, flicker, orbit-spin, sphereGlow, soundPulse, shimmer, marquee, ticker … The only `@media (prefers-reduced-motion: reduce)` block (3 rules) covers `.vlp-*` landing classes. The Dashboard standby orb animates continuously.
- **Recommendation:** Motion tokens (duration 120/200/320ms; standard and emphasised easing). A global reduced-motion rule that stops infinite and decorative animations.

### DESIGN-SYSTEM-18: Ad-hoc breakpoints alongside Tailwind's [LOW, design-system]

- **Evidence:** Media queries include the Tailwind 40/48/64/80/96rem breakpoints (sm/md/lg/xl/2xl: 151/104/44/12 variant rules) and also 420px, 640px, 720px, 760px, 767px (max), 1079px (max) and 1080px.
- **Recommendation:** Standardise on 5 named breakpoints and container queries for panels.

### DESIGN-SYSTEM-19: The same destination has different names in the rail, mobile tabs and page titles [LOW, content-copy]

- **Evidence:**
  - Rail `title="Agent View"`, mobile tab "Agent", H1 "AGENT COCKPIT".
  - Rail "Meet Agent", H1 "Meeting Agent — Vikash".
  - "Call Reports" becomes "Reports" in mobile tabs.
  - "Knowledge" becomes the H1 "AGENT KNOWLEDGE".
  - Sign Out is labelled "Exit" as a primary mobile tab (`mobile-analytics.png`).
- **Recommendation:** A single nav config that drives the rail tooltip, mobile label, H1 and document title.

### DESIGN-SYSTEM-20: Icon-only rail with native `title` tooltips only and no `aria-current` [LOW, accessibility]

- **Evidence:** 13 rail links are 44x44 with a `title` attribute and no `aria-label` / `aria-current`. Hovering shows no custom tooltip (`sidebar-hover-tooltip.png`). The active state is a 3px left bar plus a tint.
- **Recommendation:** A Tooltip component (delay 300ms, 12px), `aria-current="page"`, and an option to expand with labels. The expand toggle exists but is hidden in the footer.

### DESIGN-SYSTEM-21: Public site and app are two unrelated systems, and the public pages differ from each other [MEDIUM, consistency]

- **Evidence:**
  - Marketing is forced dark and violet. The app defaults to light and blue.
  - Three different public headers: Home has the full nav plus a "Dashboard" CTA; Pricing has logo plus "Email us"; Docs has "Back to Home" with the logo on the right.
  - Home uses Hanken with 25 font sizes, including half-pixels (11.5, 12.5, 13.5, 14.5, 15.5, 17.5), and 15 radii. Pricing and Docs are mono-heavy (Pricing 62/119 mono).
  - The primary CTA "Start free" is white on `#7c6bf5` at 3.98:1, and the Pricing CTA is black on violet.
  - See `home.png`, `pricing.png`, `docs.png`.
- **Recommendation:** Shared foundations (tokens, type, buttons) across marketing and app. One marketing header and footer. Theme choice should be expressive but built from the same tokens.

### DESIGN-SYSTEM-22: Dead or unused design scaffolding [LOW, design-system]

- **Evidence:**
  - `.type-floor` (a 13px minimum text override) is defined but not applied.
  - The Tailwind `text-xs`…`text-7xl` scale is defined, but the app uses arbitrary `text-[7px]`–`text-[13px]`.
  - Inter is registered as `--font-matter` in 35 faces, and Rajdhani, Syne, Geist, DM Sans and Geist Mono are registered without being seen in the app.
  - `--border-light` is darker than `--border-color` in light mode (confusing naming).
  - `--saffron-dim` is darker in light but lighter in dark.
- **Recommendation:** Delete or repurpose these during token migration, and document intent (for example `--border-subtle` / `--border-strong`).

---

## 8. Proposed baseline token set (derived from what already dominates)

| Group | Proposal (keep what works) |
|---|---|
| Colour, neutrals (light) | bg `#f4f6fa`, surface `#ffffff`, surface-2 `#eef1f7`, border `#e1e6ef`, border-strong `#cbd3e1`, text `#111725`, text-2 `#3e475a`, text-muted `≈#5b6478` (was `#7a8397`) |
| Colour, brand | primary: one hue (blue `#2f5fe0` in light with a lighter blue in dark, or violet everywhere), primary-fg `#fff` in light; accent teal `#0e9488` / `#0b756b` for text |
| Colour, status | success `#178a55`, warning `#b5820e` (text `#8a6309`), danger `#d0463a` (text `#b23a2f`), info = primary; soft bg = token at 10% |
| Type | Sans: Hanken Grotesk 12/13/14/16/18/20/24/30. Mono: JetBrains Mono 12/13 for data and IDs. Weights 400/500/600. Tracking tight, normal, caps +0.06em |
| Space | 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48 |
| Radius | 4 / 6 / 8 / 12 / 16 / full |
| Elevation | 0 none; 1 `0 1px 2px rgb(17 23 37 / .06)`; 2 `0 8px 24px rgb(17 23 37 / .10)`; 3 overlay `0 18px 55px rgb(0 0 0 / .26)` |
| Focus | 2px solid primary, 2px offset |
| Motion | 120 / 200 / 320ms; `cubic-bezier(.4,0,.2,1)` (already the most common); reduced-motion global |
| Icons | lucide at 16 / 20 (sidebar 20), 1.75px stroke |

---

## 9. Strengths worth preserving

- There is a real semantic token layer (32 CSS variables with complete light/dark pairs), a strong seed for the new system.
- Modern stack (Next.js + Tailwind v4 `@theme`), so tokens can be formalised without rewrites.
- One icon library (lucide) used consistently, with 20px nav icons.
- Dominant values already converge: border `#e1e6ef` (892 sides), radius 8px (336), padding 12/16/8/4, 0.15–0.2s standard easing.
- Dark mode is carefully tuned (7–19% contrast failures vs 31–78% in light).
- A proper React `<Button>` with variants and a focus-visible ring already exists (Call Reports) and can become the single primitive.
- `.input-vani` already models focus and error states. `.btn-*` define disabled states and 44px touch height on mobile.
- The Analytics editorial layout ("§ 01", serif kicker) is distinctive and internally coherent. It could become a reserved "report" style.
- Consistent masking of phone numbers (`+91••••••XXXX`) is a good data-display pattern to formalise.
- The mobile bottom tab bar has text labels.
- The `.type-floor` utility shows the team already recognised the small-text issue.

---

## 10. Open questions

1. Which brand hue is canonical: blue (light app) or violet (marketing, dark app, Meeting Agent)?
2. Is the mono "terminal" voice a deliberate brand trait? If so, restrict it to data (numbers, IDs, timers) rather than body copy.
3. Where are the `dark:` (OS-media) utilities used? They were not found on Settings or Leads.
4. What does `PUT /api/flows/{id}` send on a theme toggle? The payload was not captured, because the guard aborted the request before the body was inspected. Is it a full flow overwrite?
5. Are the Devanagari fonts needed for Hindi UI or transcripts, and on which screens?
6. Do the login and sign-up screens (not audited here) follow the marketing (dark) or the app (light) language?
