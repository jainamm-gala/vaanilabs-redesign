<!-- Assembled from 01-foundations.part1.md, 01-foundations.part2.md, 01-foundations.part3.md, 01-foundations.part4.md, 01-foundations.part5.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 01 · Foundations: every token value for Vaani Labs (Sutradhar)

**Status:** final for v1 · **Date:** 2026-09-26 · **Follows:** `spec/00-design-direction.md` (Sutradhar). This file fixes every value that the direction gave as an anchor; the component and page specs build on it.
**Evidence:** finding ids (F-VIS-…, F-A11Y-…) refer to `audit/consolidated/`. Measurements marked *measured* were taken for this document in a real browser against the Google Fonts builds.

| Deliverable | Path | Role |
|---|---|---|
| This document | `spec/01-foundations.md` (assembled from `01-foundations.part1-5.md`) | The rules and the reasons; §18 is the register of every token the other specs asked for |
| Canonical tokens | `spec/tokens/tokens.json` (v1.1.0) | W3C design-tokens format; **the only file you edit**. Includes `component.*` (component sizes and colours) and `interaction` (JS-only constants) |
| Generator | `spec/tokens/build-tokens.mjs` | `node build-tokens.mjs` writes the four files below. No dependencies |
| CSS variables | `spec/tokens/tokens.css` | Primitives, light and dark semantics, aliases, density, layout, motion |
| Tailwind v4 | `spec/tokens/tailwind.theme.css` | `@theme` / `@theme inline` / `@custom-variant dark` |
| Tailwind preset | `spec/tokens/tailwind.preset.js` | For Tailwind v3, or v4 via `@config` |
| Global rules | `spec/tokens/base.css` | Hand-written: fonts, focus, forced colours, reduced motion, Indic scripts |
| Migration layer | `spec/tokens/legacy-aliases.css` | Today's 32 variables mapped to the new roles for one release |
| Contrast proof | `spec/tokens/check-contrast.mjs` → `contrast-report.md` | 460 required pairs, light and dark, component colours included; exits 1 on any failure (CI) |
| Specimen | `spec/tokens/foundations.html` + `foundations-light.png`, `-dark.png`, `-mobile.png` | Every token rendered, both themes side by side |

**Workflow:** edit `tokens.json` → `node build-tokens.mjs` → `node check-contrast.mjs` (must exit 0) → commit all generated files. Never hand-edit a generated file.

---

## 0. What changed from the direction's anchor values, and why

The direction asked this document to fix the ramps and prove the contrast. Proving it moved nine values; the 2026-09-27 taste critique then re-keyed Neel (first row). Every change keeps the direction's character; none adds a hue.

| Anchor in 00-design-direction | Now | Why |
|---|---|---|
| Neel `#2B45C2` / dark `#3752DA`, `#8FA3FF`; ink Baseline (re-key, 2026-09-27, taste critique) | **Indigo-dye Neel: `#1F4A94` light fill, text and focus; `#2F62C0` dark fill; `#8DB2EE` dark text and focus; Neel-ink `#0F203D` for the Baseline (both themes) and the mark tile** | The first ramp sat at HSL ≈ 230°, about 5° from Linear's indigo, and the dark text read periwinkle: the generic AI blue-violet the brief bans. The new hue (≈ 218°) is darker and lower in chroma. White labels 8.52 / 5.79:1, dark text 8.33:1 on the surface, Baseline text 10.28 / 8.31:1; all 460 pairs pass. |
| Control border `#858D9C` (light) | **`#7E8695`** | At 2.8–2.98:1 on `surface-2`, `surface-3` and a selected row, checkboxes in hovered or selected rows failed 1.4.11. Now ≥ 3.06:1 on every light plane, selected-row hover included. |
| Control border `#666E7D` (dark) | **`#6A7281`** | Was 2.92:1 on `surface-3`. Now ≥ 3.01:1 on every dark plane. |
| Live dot `#16A34A` (light) | **`#13923F`** | Was 2.9–3.3:1 on `surface-2`, the success tag and selected rows. Now ≥ 3.58:1 everywhere it appears; still clearly "live" green. |
| Dark chart series `#8FA3FF / #3FB8A8 / #E0A94A / #F07BA3` | **`#657FF3 / #23A090 / #BC8A2E / #DD6593`** | All four sat above the dark lightness band of the dataviz validator. Light teal `#13867A` → **`#008A7A`** (chroma below the 0.10 floor read as grey). |
| "Noto Sans Devanagari size-adjusted to Hanken's x-height" | **No size-adjust (100%)** | *Measured:* the adjustment would be 92.6%. It puts 12 px bilingual answer examples at an effective 11.1 px, below the 12 px floor. At 100% the mixed Hinglish line reads balanced. |
| "Hanken is proportional by default" | **Hanken's figures are already fixed-width** | *Measured:* all ten digits advance 0.56 em with and without `tnum`, and `pnum` has no effect. The `tabular-nums` rule stays, for fallback fonts and future faces. |
| Rupee in Hanken | **"Vaani Rupee" one-glyph face** | *Measured:* Hanken has no U+20B9. Without a fix the ₹ falls through to Noto Sans Devanagari and pulls its whole Devanagari file onto every page that shows money. |
| `html.dark` class (direction §8) | **`data-theme` attribute** | One mechanism, as the direction wants, but on an attribute so light and dark can be nested (specimens, email previews, the inverse toast). `@custom-variant dark` targets it. |
| Near-duplicate neutrals (`#E9ECF1`, `#232935`, `#343B49`, `#343B47`, `#5C6370`, `#7A8292`, `#2F4ACB`) | Merged into the nearest ramp step | Pairs within about 1–2 ΔE collapsed so each graphite and Neel step has one job. No visible change. |

**Revision 1.1.0 (2026-09-27)** changed four direction anchors after critique; the token-level changes are listed in §18.

| Direction said | Now | Why |
|---|---|---|
| Mono for masked phones, timers and timecodes (direction §5) | **Hanken with `tabular-nums`**; JetBrains Mono only for ids, `{{variables}}`, code, API keys and keycaps (§2.3) | Hanken's figures are already fixed-width (row above), so mono added no alignment, only wider, darker glyphs that made lines uneven where a number sits mid-sentence ("Inbound +91 80 •••• 2210 · Ready") and gave the console feel the direction rejects |
| "Info is Neel" | **Info is graphite** (`--info-*` alias `--text-2`, `--surface-2`, `--border-strong`) | An info notice looked identical to a selection, and info tags (Scheduled, Indexing…, Publishing…) added blue to every list |
| Neel as chart series 1 and the heat ramp | **Ink series 1, teal ramp, Neel only on the highlighted datum** (§3.6) | Call reports and Analytics rendered as blue pages; "if a screen looks blue, something is misusing Neel" |
| "The only perpetual motion is the live dot" | **Bounded loops** (§11): 3 pulses on the focal CallHeader per entry into Live; a spinner or indeterminate bar only while a user-started request is in flight | WCAG 2.2.2, and one rule for every spec (07-motion MD3, MD6) |

New in this document (not anchored in the direction): the full Neel, green, amber and red ramps; `accent-mark` (Neel for non-text indicators, because the dark fill `#2F62C0` is only 3.1:1 on the dark surface); `accent-soft-hover` (a selected row's hover); `border-overlay`; frame tints; sequential and sentiment palettes; per-step label colours for sequential cells; all non-colour scales.

---

## 1. Token architecture

### 1.1 Three layers

| Layer | Example | Who uses it |
|---|---|---|
| **Primitives** | `--graphite-550`, `--neel-700`, `--amber-50`, `--ink` | Only the semantic layer. Components never reference a primitive. |
| **Semantic** (canonical) | `--text-3`, `--surface-2`, `--accent`, `--warning-soft`, `--edge`, `--bl-bg`, `--chart-2` | Components. One value per theme. |
| **Role aliases** | `--text-muted`, `--bg-subtle`, `--success-fg`, `--call-ringing-bg`, `--row-selected` | Components, where the role name reads better. Always a `var()` to a canonical token, never a value. |

The canonical names are the direction's (`--text-2`, `--text-3`, `--surface-2`, `--accent-soft`), so specs written from the direction and its specimen keep working. The brief's vocabulary exists as aliases:

| Brief term | Token | Brief term | Token |
|---|---|---|---|
| bg | `--bg` | text | `--text` |
| bg-subtle | `--bg-subtle` → `--surface-2` | text-subtle (2nd level) | `--text-subtle` → `--text-2` |
| surface | `--surface` | text-muted (3rd level) | `--text-muted` → `--text-3` |
| surface-raised | `--surface-raised` | text-inverse | `--text-inverse` |
| surface-overlay | `--surface-overlay` | focus-ring | `--focus-ring` → `--focus` |
| border / border-strong | `--border` / `--border-strong` | accent / accent-hover | `--accent` / `--accent-hover` |
| accent-subtle | `--accent-subtle` → `--accent-soft` | on-accent | `--on-accent` |
| success fg / bg / border | `--success-fg` → `--success-text`, `--success-bg` → `--success-soft`, `--success-border` | warning, danger, info | same pattern |

`--text-muted` deliberately keeps its current meaning, the third level. Today it is the failing `#7A8397` (F-A11Y-008); the one-line migration is to give it the new value, and every existing `text-text-muted` becomes AA without touching markup.

### 1.2 Theming

- **One mechanism:** `data-theme="light" | "dark"` on `<html>`, set before first paint by an inline script that resolves the user's System / Light / Dark choice and listens to `matchMedia('(prefers-color-scheme: dark)')` while on System. The `@media (prefers-color-scheme: dark)` block in `tokens.css` is only the no-JS fallback.
- **Nesting works:** `[data-theme]` can sit on any element. Aliases are re-declared on `:root, [data-theme], [data-surface]`, because a custom property that references another is resolved where it is declared.
- **Inverse planes:** content on a toast or tooltip sits inside `data-surface="inverse"`, which remaps `--text`, `--text-2`, `--text-3`, `--accent-text` and `--focus`. Components then use the ordinary tokens.
- **Theme changes never write data.** Toggling today fires `PUT /api/flows/{id}` (DESIGN-SYSTEM-08); a theme switch touches only `localStorage` and the attribute.
- **Tenants:** a white-label tenant may override only `--neel-*` primitives inside `[data-tenant="…"]`, and CI runs `check-contrast.mjs` against the tenant's values (F-VIS-036 found a second tenant config).

### 1.3 Rules that keep the system honest

1. No raw colours, no arbitrary values: lint rejects `bg-[#…]`, `text-[9px]`, `rounded-[9px]`, raw Tailwind palette classes (`amber-400`) and `white/10`-style alphas in app code (F-VIS-020, F-VIS-003).
2. **No alpha on text, ever.** Opacity is for graphics only, and never on an ancestor of text (§10): a dimmed or unreachable flow step dims its tile, sockets and connectors, not the box that holds its words. Disabled controls use `--text-dis`, not `opacity: .5`.
3. Colour is state, shape is type: green, amber and red appear only for real call or record state, always with a word and an icon (P2).
4. `font-mono` appears only inside five token components: `IdText` (call, lead and flow ids, room codes), `VariableChip` (`{{variables}}`), `Code` (code blocks, the compiled instruction), `SecretField` (API keys, webhook secrets) and `Keycap`. Phone numbers, timers, timecodes and durations are never mono: `PhoneText`, `Timer` and `Timecode` render Hanken with `tabular-nums` (§2.3).
5. Every new foreground and background pair goes into `check-contrast.mjs` before it ships.

---

## 2. Typography

### 2.1 Families, fallbacks and glyph coverage

| Token | Stack | Used for |
|---|---|---|
| `--font-sans` | `Hanken Grotesk` → `Vaani Rupee` → `Noto Sans Devanagari` → Noto Sans Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Gurmukhi, Oriya → `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif` | All UI, titles, body, marketing display |
| `--font-mono` | `JetBrains Mono` → `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`, `monospace` | Only machine tokens a person may copy or type: ids (`call_7c21e0`), `{{variables}}`, code, API keys, keycaps. **Not** phone numbers, timers, timecodes or durations (Hanken, tabular) |

One stack serves every script. Hanken comes first for Latin; the browser falls back per glyph to the right Noto face, which downloads only when that script appears (`unicode-range`). There is no separate Devanagari stack. `lang` switches line-height and tracking only (§2.6).

**Glyph coverage (measured against the Google Fonts builds):**

| Glyph | Hanken Grotesk | Decision |
|---|---|---|
| ₹ U+20B9 | missing | Self-host **"Vaani Rupee"**: a one-glyph subset of Noto Sans, variable weight 400–600, about 1 KB. Recipe in `base.css`. |
| → ← U+2192/2190 | dropped by Google's subsets (also from JetBrains Mono) | Never type arrows in UI copy. Use Lucide `arrow-right` (aria-hidden) with real words for screen readers ("If Yes, then Book site visit"). |
| · • … – — − “ ” ’ | present | Use the real characters (WIG). |
| 0–9 | fixed width by default | Keep `tabular-nums` anyway (§2.5). |
| ⌘ ⇧ ↵ | not verifiable in the build | Keycaps render modifiers as Lucide icons (`command`, `arrow-big-up`, `corner-down-left`) with `aria-label`, letters in JetBrains Mono. |

### 2.2 Loading strategy (Next.js)

- **Put the next/font variable classes on `<html>`, not `<body>`.** Today they sit on `<body>` while `--font-sans` resolves on `:root`, so every `.btn-*` and `.input-vani` renders in Segoe UI (F-VIS-008). `tokens.css` references `var(--font-hanken, "Hanken Grotesk")`, which resolves once the class is on `<html>`.
- **Hanken Grotesk:** `next/font/google`, `subsets: ['latin', 'latin-ext']`, `weight: 'variable'` (one file per subset), `display: 'swap'`, `preload: true`, `variable: '--font-hanken'`. `adjustFontFallback` stays on, so next/font generates the size-matched fallback.
- **JetBrains Mono:** weights 400 and 500, `subsets: ['latin']`, `preload: false`, `variable: '--font-jetbrains'`.
- **Noto Sans Devanagari:** `next/font/google`, `subsets: ['devanagari']`, weights 400/500/600, `preload: false`, `display: 'swap'`, `variable: '--font-noto-deva'`. No size-adjust (§0).
- **Other Indic Noto faces:** declared with `preload: false`. `unicode-range` means nothing downloads until a Tamil or Telugu glyph renders (transcripts, language marks).
- **Vaani Rupee:** `next/font/local` with `unicode-range: U+20B9`, `preload: true` (it is tiny and appears on every page through the Baseline).
- **Delete** the other registrations: Sora, Syne, Rajdhani, Inter (as `--font-matter`), DM Sans, Geist, Geist Mono, Instrument Serif, Noto Serif Devanagari, Tiro Devanagari (F-VIS-036). That takes 139 `@font-face` rules down to about 20.
- **Pages without next/font** (static marketing, emails) get `"Hanken Grotesk Fallback"` from `base.css`: Arial with `size-adjust: 101.1%`, `ascent-override: 98.9%`, `descent-override: 29.7%` (*measured*: Hanken is 1.1% wider than Arial on UI copy, with 1.00 em ascent and 0.30 em descent).
- `font-synthesis: none` on `html`: a missing weight shows as missing instead of faux bold.
- A test asserts `getComputedStyle(document.body).fontFamily` starts with Hanken (F-VIS-008).

### 2.3 The scale

Sizes are in rem, so a user's browser font size applies (F-VIS-002). Line heights are fixed. Weights are 400, 500 and 600, with 600 as the ceiling. **Nothing renders below 12 px**, including table headers, keycaps, bottom-bar labels, tags and canvas text at any zoom.

| Role token | px | Weight · tracking | The brief's role | Use |
|---|---|---|---|---|
| `display-56` | 56/60 | 600 · −0.03 em | Display (marketing) | Marketing hero only. 48/52 on tablet, 40/44 on phone |
| `display-48` | 48/52 | 600 · −0.03 em | Display (marketing, tablet) | The named tablet step, for marketing heads at 768–1279 (08-public-auth §4.1) |
| `display-40` | 40/48 | 600 · −0.025 em | Display (product) | Home "Get your first call live", marketing section heads. 32/40 on phone |
| `title-24` | 24/32 | 600 · −0.015 em | Section heading (overview pages) | Setup steps, auth H1, marketing H3. 20/28 on phone |
| `title-20` | 20/28 | 600 · −0.01 em | **Page title** | The page H1. The only H1 style in the app |
| `title-16` | 16/24 | 600 | Section heading (in a page) | H2 in a page; panel, sheet, dialog and gate titles; phone top-bar title |
| `title-14` | 14/20 | 600 | Subsection | H3, card titles, step (node) titles, transcript header, speaker names |
| `num-28` | 28/32 | 500 · −0.02 em, tabular | Numeric display | KPI numerals, wallet balance |
| `num-20` | 20/28 | 500 · −0.01 em, tabular | Numeric (compact) | KPIs on phone tiles and dense cards; **the live call timer** (`02:14`, `role="timer"`) |
| `lead-16` | 16/26 | 400 | Body large | Marketing lead paragraphs, long-form docs |
| `body-16` | 16/24 | 400 | Body (touch) | Marketing body; **every text input on touch and phone** (stops iOS focus zoom) |
| `read-15` | 15/24 | 400 | Reading | Transcript turns, Assistant replies, knowledge passages |
| `read-15-deva` | 15/26 | 400 | Reading, Devanagari | Applied automatically to Devanagari turns |
| `body-14` | 14/20 | 400 | **Body** (app default) | Descriptions, dialog body, desktop inputs |
| `button-14` | 14/20 | 500 | Button (large) | 40 and 44 px buttons |
| `label-13` | 13/20 | 500 | **Label, nav, button** | Field labels, 28 and 32 px buttons, nav items, tabs, filter tokens, the key table column |
| `data-13` | 13/20 | 400 | **Body small** | Table cells, list rows, inspector values, toolbar text (answer labels at 500) |
| `meta-12` | 12/16 | 400 | **Caption, helper** | Helper text, timestamps, pager, the Baseline, bilingual answer examples. The floor |
| `label-12` | 12/16 | 500 | Small label | Table headers, sidebar group labels, gate section labels, tags, bottom-bar labels |
| `phase-12` | 12/16 | 600 | Phase word | "Logic · Question" on steps; node issue badges |
| `mono-13` | 13/20 | 400 | **Code / mono** | Ids, `{{variables}}` in text, API keys, code blocks |
| `mono-12` | 12/16 | 400 | Mono small | Keycaps (500), ids in meta rows, `{{variable}}` chips |
| ~~`mono-20`~~ | 20/28 | 500 | *Deprecated in 1.1.0* | Still emitted so old mocks render; lint rejects new uses; removed in 2.0.0. The timer is `num-20` |

**Numbers in running text use the text role they sit in.** A masked phone is `data-13` in a table cell, `meta-12` in a meta line and `body-14` in a sentence, always with `tabular-nums` (the `PhoneText` component applies it); U+2022 • exists in Hanken, so the mask needs no second face. A timecode in a transcript gutter or a player is `meta-12` tabular; a timer inside a tag is `label-12` tabular; the live timer is `num-20`. **Reading older specs:** where a component or page spec still says `mono-13` for a phone, `mono-12` for a timecode, timer or countdown, or `mono-20` for the timer, build `data-13` / `meta-12` / `num-20` with `tabular-nums`; the components (`PhoneText`, `Timer`, `Timecode`, data-nav §5.8) own the style so pages never restate it.

**Overline:** none. Mono uppercase eyebrows and "§ 01" kickers are banned (F-VIS-001, F-VIS-010). Group labels use `label-12` in sentence case with `--text-3`.

Each role ships as four variables plus a shorthand: `--type-title-20-size`, `-lh`, `-weight`, `-tracking` and `--type-title-20` (`font: var(--type-title-20)`). In Tailwind the utility is `text-title-20`, which sets size, line height, weight and tracking.

### 2.4 Tracking, case and wrapping

- Negative tracking only at 20 px and above (the table values). Body text is 0; **no positive tracking anywhere**, so no 0.2–4 px tracked caps (F-VIS-002 found 30 trackings).
- Sentence case everywhere. Uppercase only for acronyms as written (UPI, DND, IST). Remove literal capitals from strings; never fake them with `text-transform`.
- `text-wrap: balance` on headings, `pretty` on short paragraphs. Paragraph measure is at most `--size-measure` (68ch).

### 2.5 Numbers

- `font-variant-numeric: tabular-nums` on every number that changes or is compared: timers, durations, counts, money, latency, percentages and numeric columns. Hanken is already fixed-width, but the fallbacks and any future face may not be. Note that the `font` shorthand resets `font-variant-numeric`, so declare it afterwards (`base.css` provides `.num` and applies it to `<time>`).
- Numeric table columns are right-aligned.
- **Money:** `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`, giving ₹2,34,050.00. Balances use 2 decimals, KPIs 0. In dense cells use lakh and crore short forms (₹85 L, ₹1.2 Cr); in detail views use the full figure.
- **Time:** 12-hour with lowercase am/pm, IST stated for calling hours, `mm:ss` timecodes, relative dates under 7 days with the absolute date in a tooltip (F-VIS-024). One `lib/format.ts` owns all of it.
- A non-breaking space between a number and its unit: `6 s`, `180 ms`, `10 MB`.
- **Phone numbers:** `+91` then groups of 5 + 5 for mobiles (`+91 98765 43210`) or the STD code + number for landlines (`+91 80 4123 2210`); masked as `+91 •••••• 4821` (list) or `•••• 4821` (meta), with non-breaking spaces inside so a number never wraps. Accessible name "Phone ending 4821". Hanken, `tabular-nums`, never mono.

### 2.6 Devanagari and Indic scripts

- **Where Devanagari appears:** only where the content is Hindi (or Marathi, Nepali) or where a language is named. Never as ornament.
- **`lang` on every transcript turn** and every example: `hi` for Devanagari, `hi-Latn` for Hinglish (which stays in Latin, marked "अA Hinglish"), `ta`, `te` and so on for the rest.
- **Reading text** (turn rows, Assistant replies) uses `read-15-deva` (15/26, a 1.73 ratio) so matras never collide between lines. *Measured:* Noto Sans Devanagari's matra top is 0.90 em and its lower-vowel descent 0.27 em.
- **Single-line UI text** keeps its role's line height. 13/20 and 12/16 lines fit the full Devanagari extent inside the line box (checked above), so table cells and chips do not grow.
- **Never track Indic text:** `base.css` sets `letter-spacing: 0` for every Indic `lang`, because tracking breaks the headline stroke and conjuncts. A title that contains Hindi keeps its tracking only on the Latin part.
- **Size:** Noto Sans Devanagari renders at 100% (§0). Its Latin x-height is 0.54 em against Hanken's 0.50, so Devanagari reads marginally larger, which helps matras at 12–13 px.
- `translate="no"` on lead, place, agent and brand names; ids and flow names are never auto-translated.
- **Language marks:** the language name at `data-13`, and, only in voice and language pickers and in the call-header legend, an 18 px glyph **tile** in front of it (`--size-lang-mark`, radius 4, `--surface-3` fill, **no stroke**, so it never reads as a `Kbd` keycap). Tables and lists show the name only; the bare tile with `aria-label` appears only in turn rows (data-nav §5.6).

---

## 3. Colour

Graphite chrome, one Neel accent, and green, amber and red only for real state (P2). Teal, ochre and rose exist only inside charts.

### 3.1 Graphite: the neutral ramp (0–1000)

Cool graphite continuing today's `#111725` ink (the neutral ramp the audit says to keep). The steps are uneven on purpose: each exists because a contrast threshold or a role needs it.

| Step | Hex | Light-theme job | Dark-theme job |
|---|---|---|---|
| 0 | `#FFFFFF` | surface, raised, overlay; text on ink | label on accent fills |
| 25 | `#F6F7F9` | bg, canvas | |
| 50 | `#F1F3F6` | surface-2 (inset, hover) | |
| 100 | `#E8EBF0` | surface-3 | text; inverse surface (toasts) |
| 150 | `#E3E6EC` | border (hairline) | |
| 200 | `#C9CED8` | border-strong, border-overlay; Baseline text (11.36:1 on ink) | |
| 250 | `#B3BAC6` | | text-2; Baseline text |
| 300 | `#A3AAB7` | disabled text | |
| 350 | `#8C94A2` | | text-3 (≥ 4.91:1 on every dark plane) |
| 400 | `#7E8695` | control borders (≥ 3.06:1 on every light plane); edges (both themes) | edges |
| 500 | `#6A7281` | | control borders (≥ 3.01:1 on every dark plane) |
| 550 | `#5F6878` | text-3 (≥ 4.70:1 on every light plane) | disabled text |
| 600 | `#434B5B` | text-2 | secondary text on the inverse toast |
| 650 | `#3A4250` | | border-overlay; Baseline top hairline |
| 700 | `#333A45` | Baseline separators | border-strong; Baseline separators |
| 750 | `#262B33` | | border |
| 800 | `#222730` | | surface-3; Baseline band |
| 850 | `#1A1E24` | | surface-2 |
| 900 | `#14171C` | | surface, raised, overlay |
| 950 | `#101318` | | canvas |
| 1000 | `#0D0F13` | | bg |
| `ink` | `#121722` | text, Baseline band, ink tile, inverse surface | text on light fills |

`ink` is a separate primitive: it sits at graphite-900's lightness with more blue, so it reads as ink rather than grey, and it never becomes a dark-theme surface.

### 3.2 Neel: the only accent (50–950)

One hue in both themes, **keyed to indigo dye** (OKLCH ≈ 260°, HSL ≈ 218°, about a third less chroma than a screen blue). It never turns violet or periwinkle (F-VIS-004). **Re-keyed on 2026-09-27** (direction §1.3, §5): the first ramp sat at HSL ≈ 230°, about 5° from Linear's indigo, and its dark text read periwinkle. Every step below moved to the new hue; every pair was re-proven by `check-contrast.mjs` (460 of 460 pass).

| Step | Hex | Job |
|---|---|---|
| 50 | `#EDF3FC` | Light accent-soft (the selection fill only; info is graphite since 1.1.0) |
| 75 | `#E5EDFA` | Light hover on a selected row |
| 100 | `#DAE6F8` | Light text selection |
| 200 | `#BFD3F3` | Reserve |
| 300 | `#A7C3F1` | Dark accent-soft text, dark link hover |
| 400 | `#8DB2EE` | Dark accent text, focus and marks (8.33:1 on the dark surface); focus inside the Baseline |
| 550 | `#356AC4` | Dark accent hover (white label 5.24:1, above the direction's 5:1 trap) |
| 600 | `#2F62C0` | Dark accent fill (white label 5.79:1) |
| 700 | `#1F4A94` | Light accent fill, text, focus and marks (white label 8.52:1); dark accent press |
| 800 | `#183C7A` | Light hover; light accent-soft text; Baseline separators |
| 900 | `#143368` | Light press; dark text selection |
| 925 | `#1C2739` | Dark hover on a selected row (1.1.0: lower chroma) |
| 950 | `#192231` | Dark accent-soft (1.1.0: OKLCH C 0.032, a tint rather than a navy slab) |
| ink | `#0F203D` | **Neel-ink**: the Baseline band in both themes and the mark tile (`--bl-bg`, `--mark-bg`). Indigo dye at its darkest; reads as navy, not black. White 16.22:1, Baseline text 10.28 / 8.31:1 |

**The accent budget:** on any screen, count the filled Neel elements: at most one primary button per region, plus the selection. If a screen looks blue, something is misusing it. **Neel has exactly seven jobs:** the primary fill, focus, selection (`--accent-soft` + `--accent-mark`), links, the active nav icon, the active or selected edge (`--edge-active`), and the highlighted chart datum (`--chart-highlight`). It is never info, never a chart series or heat ramp, never the talk strip, never a `{{variable}}` chip, never a compare tint, and never decoration, KPI numerals or durations (F-VIS-011).

**Why `--accent-mark` exists:** the dark fill `#2F62C0` is only 3.1:1 against the dark surface. That is fine behind a white label (the label carries the meaning), but not for a graphic that *is* the meaning. So every non-text Neel indicator uses `--accent-mark` (`#1F4A94` light / `#8DB2EE` dark, ≥ 6.9:1): selection borders and bars, the active tab underline, progress fills, the minimap viewport, the current setup step and the selected edge.

### 3.3 State and chart ramps

| Ramp | 50 | 300 | 400 | 500 | 550 | 600 | 700 | 950 |
|---|---|---|---|---|---|---|---|---|
| **green** (success, live) | `#E7F5EC` soft | `#6FD39A` dark text | `#4CC47F` dark solid, live | `#34A165` sentiment + | `#13923F` light live | `#15803D` light solid | `#11703F` light text | `#16271E` dark soft |
| **amber** (warning, pending) | `#FDF3E1` soft | `#F5B544` dark solid and text, Baseline warn | `#E29A21` | `#C8740F` | | `#B45309` light solid | `#8A4B00` light text | `#2C2312` dark soft |
| **red** (danger, failed) | `#FDECEA` soft | `#F28B82` dark solid and text | `#E5584D` | `#D63A2F` | 650: `#B03F37` dark sentiment − | `#C0271C` light solid | `#B42318` light text, sentiment − | `#2E1A1A` dark soft |

Steps 100, 200, 800 and 900 of each state ramp are listed in `tokens.json` for charts and future needs. **Chart-only hues:** teal `#008A7A` / `#23A090`, ochre `#B7791F` / `#BC8A2E`, rose `#C23F6E` / `#DD6593` (light / dark). No purple, plum or violet anywhere (anti-pattern 3).

### 3.4 Semantic colour tokens (light / dark)

Ratios are WCAG contrast from `contrast-report.md`.

**Planes and lines**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F6F7F9` | `#0D0F13` | Page background, the sidebar, around cards |
| `--surface` | `#FFFFFF` | `#14171C` | The working plane: tables, panels, forms, inputs |
| `--surface-2` (`--bg-subtle`) | `#F1F3F6` | `#1A1E24` | Hover rows, caller turns, fallback answer rows, gate footers, code |
| `--surface-3` (`--bg-muted`) | `#E8EBF0` | `#222730` | Pressed states, tracks, the tinted Action glyph tile, skeletons |
| `--surface-raised` | `#FFFFFF` | `#14171C` | Popovers, menus, nodes, the bulk bar (lifted by `--e1` / `--e2`) |
| `--surface-overlay` | `#FFFFFF` | `#14171C` | Dialogs, sheets, gates (lifted by `--e3` + `--border-overlay`) |
| `--surface-inverse` | `#121722` | `#E8EBF0` | Toasts, tooltips |
| `--border` | `#E3E6EC` | `#262B33` | Hairlines (decorative) |
| `--border-strong` | `#C9CED8` | `#333A45` | Node edges, secondary buttons, table frames, filter tokens |
| `--border-overlay` | `#C9CED8` | `#3A4250` | Edges of popovers, dialogs, sheets and gates |
| `--control` | `#7E8695` | `#6A7281` | Inputs, checkboxes, radios, the off switch track, sockets: ≥ 3.06 / 3.01:1 on every plane |

Raised and overlay planes keep the surface fill in both themes, so hovers, insets, turn rows and tags look the same on a page, in a popover and in a 560 px call-detail sheet. The lift comes from the shadow and the border (§8).

**Text**

| Token | Light | Dark | On surface (L / D) | Use |
|---|---|---|---|---|
| `--text` | `#121722` | `#E8EBF0` | 17.93 / 15.03 | Primary text and icons |
| `--text-2` (`--text-subtle`) | `#434B5B` | `#B3BAC6` | 8.76 / 9.20 | Idle nav, secondary body, non-key table cells |
| `--text-3` (`--text-muted`) | `#5F6878` | `#8C94A2` | 5.62 / 5.88 | Meta, helper text, **placeholders**, table headers, timecodes. ≥ 4.70:1 even on `surface-3` |
| `--text-dis` | `#A3AAB7` | `#5F6878` | exempt | Disabled text only, always with a reason nearby |
| `--text-inverse` / `--text-inverse-2` | `#FFFFFF` / `#C9CED8` | `#121722` / `#434B5B` | on inverse: 17.93 / 15.00 | Toast and tooltip text |

**Accent and focus**

| Token | Light | Dark | Proof (L / D) | Use |
|---|---|---|---|---|
| `--accent` | `#1F4A94` | `#2F62C0` | white 8.52 / 5.79 | Primary button fill, checked controls |
| `--accent-hover` / `--accent-press` | `#183C7A` / `#143368` | `#356AC4` / `#1F4A94` | white ≥ 5.24 | |
| `--on-accent` | `#FFFFFF` | `#FFFFFF` | | Label on accent |
| `--accent-text` (`--accent-fg`, `--link`) | `#1F4A94` | `#8DB2EE` | 8.52 / 8.33 | Links, the active nav icon |
| `--accent-soft` (`--accent-subtle`) | `#EDF3FC` | `#192231` | control on it 3.28 / 3.30 | **Selection only:** selected rows, chips and segments, the active phase segment, a selected step's header. Never an info notice (§3.4 Status), never a persistent panel-sized fill (see below) |
| `--accent-soft-hover` | `#E5EDFA` | `#1C2739` | text-3 on it 4.77 / 4.91 | Hover on a selected row |
| `--accent-soft-text` | `#183C7A` | `#A7C3F1` | 9.58 / 8.92 | Text on accent-soft (a selected chip, the active segment, a search match). `{{variable}}` chips use `--variable-*` (§3.9) |
| `--accent-mark` | `#1F4A94` | `#8DB2EE` | 8.52 / 8.33 | Non-text indicators (§3.2): selection bars, the nav thread segment, the active tab underline |
| `--focus` (`--focus-ring`) | `#1F4A94` | `#8DB2EE` | ≥ 7.13 / 6.95 on every plane | The focus outline |
| `--focus-inverse` | `#8DB2EE` | `#1F4A94` | | Focus on toasts and tooltips |
| `--bl-focus` | `#8DB2EE` | `#8DB2EE` | 7.52:1 on Neel-ink | Focus inside the Baseline |

**Where the selection tint may appear.** `--accent-soft` marks *a selected thing*: a row, a chip, a segment, a step header, a calendar day. At rest it never fills a panel, a card body, a sheet or a page region: a panel-sized area in dark `#192231` reads as a navy slab, and in both themes it would make the screen look blue. A "current" region (Home's current setup step, a playing turn) that is larger than a row uses `--surface-2` plus the 2 px `--accent-mark` inline-start bar. The one exception is transient: a drop-target overlay while files are dragged over it. The dark tint was lowered to OKLCH C 0.032 in 1.1.0 for the same reason.

**Status.** Each state has a solid (dots, borders, filled badges), a text colour, a soft tint, a border and an on-colour.

| State | Solid | Text | Soft | Text on soft (L / D) | On-solid | Means |
|---|---|---|---|---|---|---|
| success | `#15803D` / `#4CC47F` | `#11703F` / `#6FD39A` | `#E7F5EC` / `#16271E` | 5.47 / 8.53 | white / ink | Live, connected, done, positive |
| warning | `#B45309` / `#F5B544` | `#8A4B00` / `#F5B544` | `#FDF3E1` / `#2C2312` | 6.18 / 8.53 | white / ink | Pending (dialling, ringing, on hold), low balance, a warning in a flow |
| danger | `#C0271C` / `#F28B82` | `#B42318` / `#F28B82` | `#FDECEA` / `#2E1A1A` | 5.75 / 6.87 | white / ink | Failed, error, destructive, negative |
| info | `--text-2` (icon) | `--text-2` | `--surface-2`, edge `--border-strong` | 7.88 / 8.57 | | Neutral system facts and progress (Scheduled, Indexing…, Publishing…, Streaming, "No recording for this call", "Editing needs 1024 px"). **Info is graphite, not Neel:** an info notice or tag must never look like a selection. All four info tokens are role aliases, so they follow inverse planes |
| live | `#13923F` / `#4CC47F` | | | ≥ 3.58:1 on every plane | | The live dot. The only colour that pulses, and only 3 cycles per entry into Live (§11) |

`*-border` equals the solid for success, warning and danger in both themes, so a border that carries state is always ≥ 3:1 (for example a node's warning border, 5.02:1). `--info-border` is `--border-strong`: an info edge is structure, not state; the word and the `info` icon carry the meaning. Amber is never standalone text on a light plane except `--warning-text`. A state never relies on colour: every tag carries a word and an icon (F-A11Y-019).

**Baseline, canvas and utility**

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--bl-bg` | `#0F203D` | `#0F203D` | **Neel-ink in both themes** (re-keyed 2026-09-27; was ink / graphite). The only dark band in the light theme and the one place the brand colour appears at scale |
| `--bl-text` / `--bl-strong` | `#C9CED8` / `#FFFFFF` | `#B3BAC6` / `#E8EBF0` | 10.28 / 16.22:1 light, 8.31 / 13.58:1 dark |
| `--bl-sep` / `--bl-line` | `#183C7A` / `#0F203D` | `#183C7A` / `#3A4250` | Separators are a lighter Neel on the band; the hairline shows only in dark |
| `--bl-warn` | `#F5B544` | `#F5B544` | 8.94:1 on Neel-ink. The only third colour allowed in the Baseline |
| `--canvas` / `--canvas-dot` | `#F6F7F9` / ink 12% | `#101318` / `#E8EBF0` 8% | 1 px dots every 16 px, the only texture in the product |
| `--edge` / `--edge-active` | `#7E8695` / `#1F4A94` | `#7E8695` / `#8DB2EE` | edge 3.42:1 light; edge-active 7.95 / 8.63:1 on the canvas; dashed only for the fallback path |
| `--ink-tile` / `--ink-tile-fg` | `#121722` / `#FFFFFF` | `#E8EBF0` / `#121722` | Trigger glyph tile |
| `--mark-bg` / `--mark-fg` | `#0F203D` / `#FFFFFF` | `#0F203D` / `#FFFFFF` | The mark (the cord): white strands on a Neel-ink tile, 16.22:1, both themes (`spec/brand/mark.svg`) |
| `--scrim` | `rgba(18,23,34,.40)` | `rgba(0,0,0,.56)` | Flat, never blurred |
| `--text-selection` | `#DAE6F8` | `#143368` | `::selection` |

### 3.5 Call-state colours

One state machine, shared by Cockpit, Rep console, Call reports and the flow Test panel (direction §6.2). Each state has a word, an icon, a tone and an announcement.

| State | Word | Lucide icon | Tone | Tokens (fg / bg / mark) |
|---|---|---|---|---|
| Idle | Idle | `phone` | neutral | `--call-idle-*` → text-2 / surface-2 / control |
| Dialling | Dialling… | `phone-outgoing` | pending | `--call-dialling-*` → warning-text / warning-soft / warning |
| Ringing | Ringing… | `phone-call` | pending | `--call-ringing-*` → same as dialling |
| Live | Live | the live dot (pulses) | live | `--call-live-*` → success-text / success-soft / live |
| On hold | On hold | `pause` | pending | `--call-hold-*` → warning tokens |
| Wrap-up | Wrap-up | `clipboard-check` | neutral | `--call-wrapup-*` → text-2 / surface-2 / text-2 |
| Ended | Ended | `phone-off` | neutral | `--call-ended-*` → text-2 / surface-2 / control |
| No answer · Busy · Voicemail | as written | `phone-missed` · `phone-off` · `voicemail` | neutral | `--call-ended-*` |
| Failed | Failed | `circle-x` | failed | `--call-failed-*` → danger-text / danger-soft / danger |

Only the live dot moves: on the focal call's CallHeader it pulses 3 cycles each time the call enters Live, then holds still; every other live dot is static, and under reduced motion none moves (§11). State changes are announced politely, debounced; timers and cost are never announced.

### 3.6 Data visualisation

Charts get their own palette, separate from chrome, and **Neel is not a chart colour**: it appears in a chart only on the hovered, focused or selected datum (`--chart-highlight`, an alias of `--accent-mark`), the same job it has everywhere else (selection). The hue slots pass the dataviz validator's six checks (fixed order, lightness band, chroma floor ≥ 0.10, CVD separation under protanopia and deuteranopia, a normal-vision floor ≥ 15 ΔE, and marks ≥ 3:1). Slot 1 is ink: a deliberate neutral, exempt from the band and the chroma floor, and checked for separation instead.

**Categorical** (identity; fixed order, never cycled):

| Slot | Name | Light | Dark | Validator (worst adjacent) |
|---|---|---|---|---|
| `--chart-1` | Ink | `#333A45` | `#B3BAC6` | ≥ 18.3 ΔE (normal) and ≥ 11.7 (CVD) from every hue; 11.46 / 9.20:1 on `--surface`. Dark is graphite-250 because graphite-300 sits 14.5 from teal |
| `--chart-2` | Teal | `#008A7A` | `#23A090` | light: CVD ΔE 10.9 (protan), normal 18.0 |
| `--chart-3` | Ochre | `#B7791F` | `#BC8A2E` | dark: CVD ΔE 11.3 (deutan), normal 18.1 |
| `--chart-4` | Rose | `#C23F6E` | `#DD6593` | all marks ≥ 3:1 on `--surface` |
| `--chart-other` | Slate (Other) | `#8C94A2` | `#5F6878` | Always last, always labelled "Other", 2 px gap. CVD from rose 9.8 light / 7.9 dark (the 6–8 band is legal because the label and gap are mandatory); 3.06 / 3.20:1 |
| `--chart-neutral` | (alias of `--chart-1`) | | | Single-series and ranked marks: bars per period, funnel fills, bar lists, hour bars, sparklines, trend lines |
| `--chart-highlight` | (alias of `--accent-mark`) | `#1F4A94` | `#8DB2EE` | The hovered, focused or selected datum; 8.52 / 8.33:1 |

Rules: at most 4 identity series plus Other; a fifth becomes Other or small multiples. Scatter and small multiples carry at most 3 series. A legend whenever there are 2 or more series, direct labels when there are 4 or fewer. Values and labels use text tokens, never the series colour. No dual axes. Gridlines `--chart-grid`, the axis `--chart-axis`, labels `--chart-label` (`--text-3`). Charts sit on `--surface`. Nominal and single-series marks (calls per day, outcomes by count) take `--chart-neutral`; only the hovered, focused or selected period takes `--chart-highlight`, so a chart never turns a screen blue (direction §3.1: if a screen looks blue, something is misusing Neel).

**Sequential** (magnitude; one teal hue, OKLCH 186°, five OKLCH-even steps, validated as an ordinal ramp: monotone, ΔL ≥ 0.085, lightest step ≥ 2:1 on the surface). Teal, not Neel, so a heat strip never reads as a selection:

| Step | Light | Label on it | Dark | Label on it |
|---|---|---|---|---|
| `--seq-1` | `#6DC3B9` | ink | `#0E635B` | white |
| `--seq-2` | `#3CABA0` | ink | `#098077` | white |
| `--seq-3` | `#228F86` | ink | `#30A197` | ink |
| `--seq-4` | `#23716A` | white | `#6BC1B7` | ink |
| `--seq-5` | `#035750` | white | `#B0DFD9` | ink |

Each step has its label token (`--seq-n-fg`, ≥ 4.56:1). The lightest step is 2.07:1 (light) and the darkest 2.53:1 (dark) on the surface. Zero or missing values use `--seq-empty` (`--surface-2`) with a "No data" legend entry, never the lightest step.

**Talk strip** (Cockpit, Call reports, the recording player): the agent lane is `--talk-agent` (ink `#121722` / `#E8EBF0`), the caller lane `--talk-caller` (graphite `#7E8695` / `#6A7281`), both on the `--surface-2` lane track at 16.1 / 14.0:1 and 3.30 / 3.46:1. Position (agent above, caller below) and the "Agent 58% · Caller 42%" line carry identity; colour only separates.

**Sentiment** is the one chart that uses state hues, because the data is a state (F-VIS-011: neutral must be grey, not mustard). Positive `#34A165` (both themes), neutral `#7E8695` / `#6A7281`, mixed `#434B5B` / `#B3BAC6`, negative `#B42318` / `#B03F37`. Positive is deliberately lighter than negative is dark, which gives a deuteranopia ΔE of 12.9 light / 10.1 dark (the default green–red pair scored 4.8). In a stacked bar the order is positive, neutral, mixed, negative, with 2 px gaps, so green never touches red. The words and icons (`smile`, `meh`, circle-half, `frown`) are always present.

**Frame tints** (user-chosen canvas frames, the pressure valve for "we want colour back"): the five chart hues mixed at 6% (light) or 10% (dark) into the canvas, with a 30–35% edge. They carry less chroma than any status tint, so a frame never reads as a warning. Tokens: `--frame-{neel,teal,ochre,rose,slate}` and `-border`. Frame titles use `--text` (≥ 15:1).

### 3.7 Dark theme approach

- **Selected, not inverted:** every dark value is chosen and proven separately. Neel stays one hue: fill `#2F62C0` behind white, text and marks `#8DB2EE`.
- **A plane ladder plus borders:** bg `#0D0F13` → surface `#14171C` → surface-2 `#1A1E24` → surface-3 `#222730`. Overlays keep the surface fill and use `--border-overlay` plus a deep, ring-free shadow. There are no glows and no pure black (anti-pattern C6).
- **Status softs are dark tints, and status text is light** (for example `#F5B544` on `#2C2312`), so a tag never glows.
- **The selection tint is a tint:** dark `--accent-soft` is `#192231` (OKLCH C 0.032), close to the plane ladder, so a selected row reads as marked, not as a navy block (§3.4).
- **Charts** use darker, validated series (§3.6); sequential ramps flip so high values are light.

### 3.8 Contrast summary

`node spec/tokens/check-contrast.mjs` checks 460 required pairs (230 per theme): every text token on every plane, selected row, soft tint, canvas and frame; status text on its tint and on neutral planes; labels on every fill; controls, focus, marks, the live dot, edges and chart marks; and, since 1.1.0, the component colours (nav keys, the destructive hover, the QR code, the hovered edge), the talk-strip lanes, the chart highlight, the compare tints and `{{variable}}` chips. **All pass.** The tightest pairs, to watch when a value changes:

| Mode | Text (≥ 4.5) | UI (≥ 3) | Focus (≥ 3) |
|---|---|---|---|
| Light | `--seq-3-fg` on `--seq-3`, 4.56 | `--chart-other` on `--surface`, 3.06 | `--focus` on `--surface-3`, 7.13 |
| Dark | `--seq-2-fg` on `--seq-2`, 4.81 | `--sentiment-negative` on `--surface`, 3.09 | `--focus` on `--surface-3`, 6.95 |

### 3.9 Compare (diff) and `{{variable}}` tokens

Two jobs that used to borrow the selection tint now have their own role aliases, so neither can be mistaken for a selected step (all pairs in `check-contrast.mjs`):

| Token | Resolves to | Use |
|---|---|---|
| `--diff-added-bg` / `--diff-added-fg` | `--success-soft` / `--success-text` | An added step or row in Compare mode, **always with the word "Added"** (a `success` Tag) |
| `--diff-changed-bg` / `--diff-changed-bar` | `--surface-3` / `--text` (ink) | A changed step or row: the surface-3 header plus a 2 px ink inline-start bar and the word "Changed" (a `neutral` Tag) |
| `--diff-removed-bg` / `--diff-removed-fg` | `--danger-soft` / `--danger-text` | A removed step or row: the word "Removed" and a strike-through title |
| `--variable-bg` / `--variable-fg` | `--surface-3` / `--text` | `{{variable}}` chips: JetBrains Mono `mono-12`, radius 4, 15.00 / 12.54:1 |

Compare mode never uses `--accent-soft`: the selection keeps its own meaning while comparing.

The direction's CI traps hold: `--text-3` on `--surface-3` is 4.70 / 4.91, amber is never standalone text, and the dark accent hover keeps a white label at 5.37:1. No pair relies on the large-text allowance: every text pair clears 4.5:1, so type size never decides legibility. Reported but exempt: disabled text, hairlines, the canvas dot grid, and accent fills against planes (the label carries identity).

---

## 4. Space

A 4 px base (F-VIS-016 found 19 padding values including off-grid 9 and 18 px). Tokens are named by their pixel value, so `--space-16` is 16 px. In Tailwind the keys keep the framework convention (`p-4` = 16 px).

| Tokens | Values |
|---|---|
| Scale | `--space-0` · `1` (hairline offsets only) · `2` · `4` · `6` · `8` · `10` · `12` · `16` · `20` · `24` · `28` · `32` · `40` · `48` · `56` · `64` · `80` · `96` |
| Half-steps | 2, 6 and 10 exist for component internals only (≤ 12 px): icon gaps, tag padding, keycap padding |

**Roles** (use these before raw steps):

| Token | Value | Use |
|---|---|---|
| `--space-label-gap` | 6 | Label to control; control to helper text |
| `--space-inline-xs` / `-sm` / `-md` / `-lg` | 4 / 6 / 8 / 12 | Icon to text in tags / in buttons and nav / between buttons / between toolbar groups |
| `--space-field-gap` | 16 | Between fields |
| `--space-group-gap` | 24 | Between field groups and between cards |
| `--space-section-gap` | 40 | Between page sections (32–48 on marketing) |
| `--space-panel-pad` / `-lg` | 16 / 20 | Panels, cards and the inspector / dialogs, sheets and gates |
| `--space-cell-px` | 12 | Table cell padding at Standard density (the density token `--cell-px` varies it) |

Nested radii are concentric: the inner radius is the outer radius minus the padding between them, never larger.

---

## 5. Layout grid per breakpoint

Five min-width breakpoints (F-VIS-035 found raw media queries at 420, 640, 720, 760, 767, 1079 and 1080 alongside Tailwind's):

| Token | Width | Tailwind | Meaning |
|---|---|---|---|
| `--bp-sm` | 480 | `sm:` | Large phone / landscape: two-column list items, wider sheets |
| `--bp-md` | 768 | `md:` | Tablet shell |
| `--bp-lg` | 1024 | `lg:` | Laptop: rail shell; the Flow Designer allows editing |
| `--bp-xl` | 1280 | `xl:` | Labelled sidebar |
| `--bp-2xl` | 1440 | `2xl:` | Desktop: docked sheets, the Cockpit calls column |

Media queries use literal values (CSS variables cannot appear in media queries); the tokens exist for JS (`matchMedia`). Panels whose layout depends on their parent (the inspector, the Cockpit card, the Embed preview) use container queries, not viewport breakpoints. Verify at 320, 375, 390, 768, 1024, 1280, 1366×768, 1440 and 1920, with always-visible scrollbars as on Windows.

| Range | Columns | Gutter | Page margin | Shell | Max content width |
|---|---|---|---|---|---|
| **Desktop ≥ 1440** | 12 | 24 | 24 | Labelled sidebar 232; records open as a docked 440 sheet; inspectors dock at 320 | Data surfaces (tables, canvas, Cockpit) fluid; overview pages 1280; forms 720 |
| **Laptop 1280–1439** | 12 | 24 | 24 | Sidebar 232; sheets overlay the right third | Same |
| **Laptop 1024–1279** | 12 | 24 | 24 | Rail 56 with label tooltips; `[` expands it to 232 as an overlay with a scrim | Same; the Cockpit calls column becomes a header switcher |
| **Tablet 768–1023** | 8 | 16 | 24 | Top bar 52 (menu, title, call chip, wallet chip, search); nav sheet 320 (max 85vw) from the left | Single pane; sheets are 100% height, width min(560, 100%) |
| **Phone 320–767** | 4 | 12 | 16 | Top bar 52 and bottom bar 56 + `env(safe-area-inset-bottom)`: 5 items (Cockpit, Leads, Call reports, Flows, More); More is a bottom sheet listing all 12 destinations | Full width; sheets are full screen; tables become two-line list items |

`tokens.css` exposes `--page-margin`, `--grid-gutter` and `--grid-columns`, which switch at 1024 and 768.

**Containers:** `--size-container-page` 1280 (Home, Analytics, Billing, Knowledge), `--size-container-form` 720 (Settings and create forms, F-VIS-034), `--size-container-narrow` 400 (auth), `--size-measure` 68ch (paragraphs). Headers align with their content column; forms never stretch to 1,300 px at 1920. `html { scrollbar-gutter: stable }` stops the shift F-VIS-034 measured.

**Chrome sizes** (`--size-*`): header 56 · view tabs 40 · toolbar 48 · table head 32 · pager 40 · Baseline 28 · Flow header 48 · phase ruler 40 · tool rail 48 · problems bar 32 · settings sub-nav 200 · inspector 320 (max 480) · record sheet 440 · call-detail sheet 560 · Publish gate 640 · Call gate popover 400 · dialogs 400 / 560 / 720 · menus 180–320 · tooltip max 280 (F-VIS-014 found tooltips about 70 px wide) · toast 400 · Cockpit columns 240 / 400 / rest.

**Chrome budget** (direction §6.1): on 1366×768 and 1280×720 laptops, Leads shows at least 10 Standard rows. Budgets use the **inner viewport**, not the screen: those laptops give about 1366×657 and 1280×609 in maximised Chrome or Edge (`05-responsive` §2.1). The chrome is 56 + 40 + 48 + 32 + 40 + 28 = 244 px. At viewport heights of 720 px or less, `--size-baseline` becomes 0, the Baseline folds into a header chip (the BaselineChip) and the view tabs fold into a select, leaving 176 px: 12 rows at 1366×657, 10 at 1280×609. On those laptops the chip is therefore the everyday status surface, not a fallback.

Full-height shells use `100dvh`, never `100vh`.

---

## 6. Radius

"Machined, not soft." Twelve radii today (F-VIS-016); five now.

| Token | Value | Tailwind | Used for |
|---|---|---|---|
| `--radius-2` | 2 | `rounded-2` | Bars, meters, minimap blocks, chart data-ends |
| `--radius-4` | 4 | `rounded-4` / `rounded-tag` | Tags, keycaps, checkboxes, language marks |
| `--radius-6` | 6 | `rounded-6` / `rounded-control` | Buttons, inputs, menus, filter tokens, answer rows, glyph tiles, notices |
| `--radius-8` | 8 | `rounded-8` / `rounded-panel` | Panels, cards, steps (nodes), table frames, toasts, the bulk bar |
| `--radius-12` | 12 | `rounded-12` / `rounded-dialog` | Dialogs, sheets, gates |
| `--radius-full` | 9999 | `rounded-full` | **Only** avatars, the live dot, switches, and the capsule ends of Trigger and Outcome steps |

No pill buttons, pill tags or pill filter chips (anti-pattern 6).

---

## 7. Lines

| Token | Value | Use |
|---|---|---|
| `--bw-hairline` | 1 px | All structure: row dividers, panel edges, control borders, node edges |
| `--bw-strong` | 2 px | Only the active tab underline, the selected-row inset bar and stepper progress |
| `--focus-width` | 2 px | The focus outline |

A dashed line means one thing: the fallback path on the canvas (a 5/4 dash on `--edge`). There are no dashed borders on cards or empty states.

---

## 8. Elevation

Three levels (F-VIS-016: no elevation scale existed, only glows).

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--e0` | none | none | Default. Structure comes from hairlines |
| `--e1` | `0 1px 2px rgba(18,23,34,.06)` | none | Steps on the canvas, secondary buttons, the active nav key. In dark the element's own border carries it |
| `--e2` | `e1` + `0 6px 16px -4px rgba(18,23,34,.12)` | `0 8px 20px -8px rgba(0,0,0,.60)` | Popovers, menus, the selected step |
| `--e3` | `0 2px 4px rgba(18,23,34,.06), 0 20px 40px -12px rgba(18,23,34,.24)` | `0 24px 48px -16px rgba(0,0,0,.70)` | Dialogs, sheets, gates, the bulk bar, toasts |

- **Light:** soft, layered, ink-tinted shadows. **Dark:** borders do the work. Shadows are deep and ring-free, and every e2/e3 element pairs with `border: 1px solid var(--border-overlay)` (`#3A4250`) so it separates from the page.
- **No blur, no glow, no coloured shadows.** Modals sit on a flat `--scrim`.
- **No hover lift.** Hover changes the fill only (anti-pattern 4).

---

## 9. Z-index

Named layers replace 0 to 9999 (F-VIS-016).

| Token | Value | Holds |
|---|---|---|
| `--z-base` | 0 | Page content |
| `--z-raised` | 1 | The selected step over edges; the sticky first column |
| `--z-sticky` | 10 | Sticky table headers, the page header |
| `--z-chrome` | 20 | Sidebar, rail, top and bottom bars, the Baseline, canvas controls (zoom, minimap) |
| `--z-float` | 25 | The bulk bar |
| `--z-overlay` | 30 | Non-modal sheets over content (1280–1439), the rail expansion |
| `--z-scrim` | 40 | The modal scrim |
| `--z-modal` | 50 | Dialogs, modal sheets, gates |
| `--z-popover` | 60 | Menus, selects, comboboxes, the Call gate popover |
| `--z-toast` | 70 | Toasts |
| `--z-tooltip` | 80 | Tooltips |
| `--z-skiplink` | 90 | The skip link when focused |

Popovers sit above modals because menus and selects inside a dialog (Go to [step] in the Publish gate, for example) portal to `<body>`.

---

## 10. Opacity

Opacity is for **graphics only, never on an element that is an ancestor of text**, and never for text colours or disabled controls (F-A11Y-008 found text at 50% alpha failing AA). Composited over the canvas, a step body at 0.5 puts `--text-3` at 2.12:1 and at 0.4 at 1.79:1, so "dim the whole region" is not allowed: a de-emphasised region changes its **fill** (to `--surface-2`) and dims only its icons, tiles, sockets, strokes and markers. The compositing contrast scanner (06 CT-02) fails any text node under an ancestor with `opacity` < 1.

| Token | Value | Only for |
|---|---|---|
| `--opacity-dim` | 0.4 | Glyph tiles, sockets and connectors of steps outside the emphasised phase or Find result (restored on hover or focus); their text stays at full contrast on a `--surface-2` fill |
| `--opacity-partial` | 0.45 | The pending segment of the talk strip (a bar, no text) |
| `--opacity-unreachable` | 0.5 | The glyph tile, sockets and connectors of an unreachable step or a removed step in compare mode; the step keeps full-contrast text on `--surface-2` and the words "Not connected" or "Removed" |
| `--opacity-drag` | 0.6 | A drag ghost: the **one exception** to the ancestor rule. It is a transient, `aria-hidden` copy under the pointer (incidental text under WCAG 1.4.3) while the original stays at full strength; it carries `data-drag-ghost`, which the CT-02 scanner skips |

---

## 11. Motion

"A relay clicking" (direction §5). Today there are 36 keyframes and reduced motion reaches only the landing page (F-A11Y-022).

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 90 ms | Hover, press, colour changes, and every exit |
| `--dur-base` | 140 ms | Menus, popovers, tooltips, the tab indicator |
| `--dur-slow` | 200 ms | Sheets, dialogs, toasts, the rail overlay |
| `--dur-trace` | 480 ms | The one-shot test-run trace along an edge |
| `--dur-pulse` | 1600 ms | One live-dot pulse cycle; one pass of the indeterminate bar |
| `--dur-spin` | 800 ms | One spinner turn, linear |
| `--live-pulse-cycles` | 3 | Pulse cycles each time a call enters Live (focal CallHeader only); 0 under reduced motion |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | The one easing, for enter and exit (`linear` only for the spinner, the indeterminate bar and pointer-driven motion) |
| `--shift-popover` / `-dialog` / `-toast` | 4 / 8 / 8 px | Entrance offsets |
| `--shift-sheet` | 100% | A sheet slides its own width or height from its edge; 0 under reduced motion, so it fades in place |

**What moves:** only `transform` and `opacity`, listed explicitly (never `transition: all`). Popovers fade and move 4 px; dialogs fade and move 8 px; sheets slide from their edge; toasts rise 8 px. Nothing in the app runs longer than 200 ms except the one-shot trace, the bounded live pulse and busy indicators bound to a request. There is no idle animation: no rings, breathing, shimmer loops, marching ants, scroll reveals or hover lifts.

**Loops are earned and bounded** (the rule for every spec; 07-motion MD3, M5, MD6; 06-accessibility §14). Only three things may repeat, and none of them runs on an idle screen:

1. **The live dot, 3 cycles.** On the **focal call's CallHeader only**, the LiveDot pulses `--live-pulse-cycles` (3) × `--dur-pulse` = 4.8 s each time the call *enters* Live (including a return from On hold, Reconnecting or a hand-back), then holds as a solid dot. Every other live dot (the Calls column, a Leads "Last call" cell, the nav badge, the Baseline, the top-bar chip, meeting cards) is static. Under 5 s, so WCAG 2.2.2 needs no pause control; the word "Live" and the ticking timer carry the state after that.
2. **A spinner or the indeterminate bar, only while a user-started request is in flight.** It appears after `--timing-skeleton-delay` (200 ms), stays at least `--timing-skeleton-min` (400 ms) once shown, and stops the moment the request settles. Spinner: one turn per `--dur-spin` (800 ms), linear. Indeterminate bar: one pass per `--dur-pulse`. Never on idle, never for background polling.
3. **Level meters driven by real audio** (≤ 15 fps). They are real-time data, not decoration, and they stop when the audio stops.

Everything else stops. A timer ticking once a second and a playhead are state, not animation.

**Reduced motion** (`prefers-reduced-motion: reduce`, or the in-app **Motion: Reduce motion** preference, which sets `data-motion="reduce"` on `<html>` before first paint; `tokens.css` emits the same block for both):
- `tokens.css` sets every `--shift-*` to 0, `--dur-trace`, `--dur-pulse` and `--dur-spin` to 0 and `--live-pulse-cycles` to 0, so nothing travels or loops.
- `base.css` stops every keyframe loop. The live dot is still and the word "Live" carries the state; a spinner is frozen and the "…" label and `aria-busy` carry the state; meters show a static level; the test trace is skipped and the reached steps are marked.
- Opacity fades stay, at their normal short durations: they are state changes, not movement.
- Framer Motion (if used) runs inside `<MotionConfig reducedMotion="user">`; JS loops check `matchMedia`.

**Behavioural timing** (`--timing-*`): tooltip delay 300 ms; a skeleton or busy state only after 200 ms of loading (`skeleton-delay`), inside the shell, and then for at least 400 ms (`skeleton-min`); flow validation, palette record search and autosave 300 ms after the last change (`validate-debounce`, the one input debounce, F-FLOW-010); call-state announcements debounced 500 ms (`state-announce`); a call with no update for 60 s shows "No update for 60 s" (`call-stale`); the canvas re-fits 150 ms after a resize (`refit-debounce`); at most one transcript announcement per 2 s; informational toasts 6 s, paused on hover and focus. Error and Undo toasts stay until dismissed (WCAG 2.2.1). JS-only constants (drag threshold, zoom range, level-of-detail bands, frame rates) live in the `interaction` group (§18).

---

## 12. Iconography

| Token | Size | Use |
|---|---|---|
| `--icon-xs` | 12 | Inside 20 px tags only |
| `--icon-sm` | 14 | The Baseline, glyph-tile glyphs, dense chips |
| `--icon-md` | 16 | Default UI: buttons, nav, rows, inputs |
| `--icon-lg` | 20 | Phone bottom bar, top-bar actions |
| `--icon-xl` | 24 | Setup-track step icons (the largest icon in the product; no illustrations) |
| `--icon-stroke` | 1.5 px | Every icon |

- **Library:** Lucide only (`lucide-react`, already the norm on 100% of Leads and Call Reports SVGs). Props: `strokeWidth={1.5}` with `absoluteStrokeWidth`, so the line is exactly 1.5 px from 12 to 24 px. Twenty-two icon sizes today become five (F-VIS-031).
- **Colour:** `currentColor`. Icons take the text colour of their context; the active nav icon uses `--accent-text`; state icons use their state's text colour.
- **Replace** letter pseudo-icons ("F", "IG", "{}"), emoji, the solid sort triangle and same-tab ↗ icons: brand SVGs for Facebook, Instagram and Google sources; `ArrowUp`, `ArrowDown` and `ChevronsUpDown` in sortable headers; `ExternalLink` only for off-site links (F-VIS-031).
- **Accessible names:** decorative icons are `aria-hidden`; every icon-only button has an `aria-label` and a tooltip (F-A11Y-024).

**One icon per destination** (the nav config drives the sidebar, rail, bottom bar, H1 and `<title>`):

| Destination | Icon | Destination | Icon | Destination | Icon |
|---|---|---|---|---|---|
| Cockpit | `activity` | Personal agents | `list-checks` | Call reports | `file-text` |
| Assistant | `bot` | Flows | `workflow` | Analytics | `chart-column` |
| Rep console | `headphones` | Knowledge | `book-open` | Billing | `wallet` |
| Meetings | `video` | Leads | `users` | Settings | `sliders-horizontal` |

**Phase glyph tiles** (24 px tile, 14 px glyph, radius 6; they stay visible at every canvas zoom):

| Phase | Tile | Glyphs |
|---|---|---|
| Trigger | Solid `--ink-tile` with `--ink-tile-fg` | `phone-incoming`, `list`, `webhook`, `monitor` (browser test) |
| Logic | Outlined: 1 px `--control` on `--surface` | A diamond, drawn to Lucide metrics |
| Action | Tinted: `--surface-3` | The tool: `message-square` (Speak), `book-open`, `database`, `calendar-plus`, `message-circle`, `phone-forwarded` |
| Outcome | The soft tint of the state it writes (for example `--success-soft` / `--success-text`) | `flag` |

Custom glyphs (the Logic diamond and any missing tool) are drawn on Lucide's 24 px grid with round caps and joins, at the same stroke.

---

## 13. Focus

Focus and selection are different things, and when both apply both show (F-A11Y-007).

| | Spec |
|---|---|
| **Focus** | `outline: var(--focus-width) solid var(--focus); outline-offset: var(--focus-offset)`: 2 px, offset 2 px. **Always an outline, never a box-shadow** (outlines survive forced-colours mode). Set globally on `:focus-visible` in `base.css`; `outline: none` without a replacement is banned (F-A11Y-006). |
| **Contrast** | `--focus` is ≥ 6.15:1 against every plane, selected row, soft tint, canvas and frame in both themes. The offset means the ring always sits on a plane, not on the button's own fill. |
| **Canvas steps** | Offset `--focus-offset-node` (3 px) so the ring clears the step's own border and the selection ring. |
| **Rows and list items** | Offset `--focus-offset-inset` (−2 px), drawn inside, so a scroll container never clips it. |
| **Inverse planes** | `data-surface="inverse"` switches `--focus` to `--focus-inverse`; the Baseline uses `--bl-focus`. |
| **Selection** | `--accent-soft` fill plus a 1 px `--accent-mark` border (steps, cards), or a 2 px inset `--accent-mark` bar (rows). Never an outline, so it never looks like focus. |
| **Forced colours** | Focus stays a 2 px `Highlight` **outline** all round, with its offset. Selection and the current page (`aria-selected`, `aria-current`, `data-selected`) become a **4 px `Highlight` bar on the inline-start edge** (rows: on the first cell), never an outline or ring, so a focused row, a selected row and the current nav item stay distinguishable and the current page never looks focused; focused + selected shows both. (A `SelectedItem` fill was tried and rejected: Chromium's forced-colours text backplate hides `SelectedItemText`.) State marks (`data-mark`: the live dot, connected sockets, legend swatches) fill with `CanvasText`; free sockets and ports carry `data-mark="hollow"` and render as a `Canvas` fill with a 2 px `CanvasText` ring, so free versus connected survives. These rules use `!important`, the one sanctioned use: they are the accessibility layer and must beat component border and fill rules. Edges (`data-edge`) use `CanvasText` strokes. Snapshot VR-02 covers focused, selected and focused + selected (06-accessibility §21.1). |
| **Sticky chrome** | Never covers a focused element: `scroll-margin` on scroll targets equals the sticky header height. |

---

## 14. Density

A per-user setting on data surfaces only (P4). Forms, dialogs and the inspector always use Standard, and touch overrides everything.

| Mode | How it is set | Row `--row-h` | Control `--control-h` | Small control | Cell padding | Tag | Field text |
|---|---|---|---|---|---|---|---|
| **Standard** (default) | nothing, or `data-density="standard"` | 40 | 32 | 28 | 12 | 20 | 14 px |
| **Compact** | `data-density="compact"` on the data surface (Shift+D, remembered per user) | 32 | 28 | 24 | 8 | 20 | 14 px |
| **Touch** | automatic under `(pointer: coarse)` or below 768 px | 48 | 44 | 36 visible, 44 hit area | 16 | 24 | **16 px** (no iOS zoom) |

- At 1440×900, Leads shows about 16 rows in Standard and 20 in Compact.
- **Hit areas:** at least 24×24 everywhere (`--size-hit-min`, WCAG 2.5.8), 44×44 on touch (`--size-hit-touch`), padded with `::after` so a small visual can keep a large target. No layout mode shrinks a touch target: the nav's short-height mode applies only under `(pointer: fine)` (02-components-data-nav §1.2). Sockets are 10 px with a 24 px hit area clipped to their 28 px answer row. On coarse pointers the answer and result rows grow to 44 and the socket's target is the full-height end of its row, 44 × 44 at 100 % zoom. When the canvas is zoomed out, Connect to…, the Go to selects and the Outline are the equivalent 44 px paths (04-flow-designer/01 §6.1, 06-accessibility §15.1; F-A11Y-023).
- Destructive controls stay at least 8 px from routine ones, or move into an overflow menu.

---

## 15. Implementation in the detected stack

Detected: Next.js (App Router likely), Tailwind CSS v4 with `@theme`, 32 semantic CSS variables with light and dark pairs, `lucide-react`, React Flow (xyflow), and **no component primitive library** (no Radix, shadcn, sonner or cmdk; `audit/raw/design-system.md` §2).

### 15.1 Wiring (Tailwind v4, the recommended path)

```css
/* app/globals.css */
@import "tailwindcss";
@import "../design/tokens.css";          /* generated: primitives, themes, aliases, density, motion */
@import "../design/base.css";            /* global rules */
@import "../design/legacy-aliases.css";  /* ONE release only, then delete */
@import "../design/tailwind.theme.css";  /* @theme + @theme inline + @custom-variant dark */
```

- `tailwind.theme.css` resets the raw palette (`--color-*: initial`) so `bg-amber-400` or `text-violet-500` no longer exist (F-VIS-020), and sets `--spacing: 4px` so every spacing utility sits on the 4 px grid.
- Static scales (type, radius, breakpoints, easing) go into `@theme` as literals identical to `tokens.css`. Colours and shadows go into `@theme inline` as `var(--…)`, so utilities follow `data-theme` live. This split avoids the self-reference that `@theme inline { --radius-4: var(--radius-4) }` would create.
- `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` replaces Tailwind's default OS-media `dark:` variant, which today disagrees with the class-based app theme (F-VIS-021). Prefer token swaps; `dark:` should be rare.

**Tailwind v3, or v4 through `@config`:** `presets: [require('./design/tailwind.preset.js')]`. It maps the same variables; `darkMode: ['selector', '[data-theme="dark"]']`.

### 15.2 Utility vocabulary

Keys are renamed so utilities read naturally: `bg` → `page`, `text` → `fg`, `border` → `line`, `*-text` → `*-fg`, `*-border` → `*-line`.

| Want | Class | Want | Class |
|---|---|---|---|
| Page background | `bg-page` | Primary text / 2nd / 3rd | `text-fg` · `text-fg-2` · `text-fg-3` |
| Surface / inset / pressed | `bg-surface` · `bg-surface-2` · `bg-surface-3` | Hairline / strong / control | `border-line` · `border-line-strong` · `border-control` |
| Primary button | `bg-accent hover:bg-accent-hover active:bg-accent-press text-on-accent` | Link | `text-accent-fg hover:text-link-hover` |
| Selected row | `bg-row-selected`, plus the Row component's inset `--accent-mark` bar | Warning tag | `bg-warning-soft text-warning-fg` |
| Call state | `bg-call-ringing-bg text-call-ringing-fg` | Chart series 2 | `fill-chart-2` / `bg-chart-2` |
| Page H1 | `text-title-20` | Table cell / header | `text-data-13` · `text-label-12 text-fg-3` |
| Row height (density-aware) | `h-row` | Control height | `h-control` · `h-control-sm` |
| Elevation | `shadow-e1` · `shadow-e2` · `shadow-e3` | Layers | `z-chrome` · `z-modal` · `z-popover` |
| Radius | `rounded-tag` · `rounded-control` · `rounded-panel` · `rounded-dialog` | Motion | `transition-colors duration-fast ease-standard` |

Opacity modifiers on colours (`bg-accent/50`) are unsupported by design: no alpha on text or state colours.

**Tailwind v4 differences:** v4 has no theme namespace for z-index, duration or opacity, so the preset's `z-chrome`, `duration-fast` and `opacity-dim` are written `z-(--z-chrome)`, `duration-(--dur-fast)` and `opacity-(--opacity-dim)`. These are variable references, not arbitrary values, so the lint allows them. Sizing (`h-row`, `h-control`, `w-sidebar`, `size-icon`) comes from `--spacing-*` entries, and `max-w-form` / `max-w-page` from `--container-*`, both generated in `tailwind.theme.css`.

### 15.3 Fonts and theme bootstrap (`app/layout.tsx`)

```tsx
import { Hanken_Grotesk, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google';
import localFont from 'next/font/local';

const hanken = Hanken_Grotesk({ subsets: ['latin', 'latin-ext'], weight: 'variable', display: 'swap', variable: '--font-hanken' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', preload: false, variable: '--font-jetbrains' });
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari'], weight: ['400', '500', '600'], display: 'swap', preload: false, variable: '--font-noto-deva' });
const rupee = localFont({ src: './fonts/vaani-rupee.woff2', weight: '400 600', display: 'swap', declarations: [{ prop: 'unicode-range', value: 'U+20B9' }], variable: '--font-rupee' });

// Variables on <html>, not <body> (F-VIS-008). suppressHydrationWarning because the script sets data-theme first.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${mono.variable} ${deva.variable} ${rupee.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} /></head>
      <body>{children}</body>
    </html>
  );
}
```

The sans stack references each face as `var(--font-hanken, "Hanken Grotesk")`, `var(--font-rupee, "Vaani Rupee")` and `var(--font-noto-deva, "Noto Sans Devanagari")`. Under next/font the variables carry the hashed family names; on static pages the literal names apply, with "Vaani Rupee" registered by `base.css`.

`THEME_BOOT` (inline, before paint): read `localStorage['vaani:theme']` (`system` | `light` | `dark`, default `system`); resolve `system` with `matchMedia('(prefers-color-scheme: dark)')`; set `document.documentElement.dataset.theme`; while on System, listen for the media change. Also set `<meta name="theme-color">` to the resolved `--bg`. The old `vv:theme` key migrates once. The theme choice lives in the account menu (System, Light, Dark) and never triggers a network write (DESIGN-SYSTEM-08). **Motion:** read `localStorage['vaani:motion']` (`system` | `reduce`, default `system`); on `reduce` set `document.documentElement.dataset.motion = 'reduce'`, otherwise leave the attribute off so the `prefers-reduced-motion` media query decides. When the server already knows the user's saved preference, the layout renders `data-motion="reduce"` on `<html>` itself and the script leaves it alone. `tokens.css` and `base.css` treat the attribute exactly like the media query (§11). The account menu's **Motion: Match system · Reduce motion** radio items write the preference and set or remove the attribute live (07-motion MD4, 06-accessibility §14.3). Every storage read is wrapped in try/catch, so a blocked `localStorage` falls back to System and Match system.

```js
// THEME_BOOT: inlined in <head>, runs before first paint; no imports
(function () {
  var d = document.documentElement;
  var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var t = get('vaani:theme') || get('vv:theme') || 'system';            // vv:theme migrates once
  if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  d.dataset.theme = t;                                                    // then set <meta name="theme-color"> to --bg
  if (!d.dataset.motion && get('vaani:motion') === 'reduce') d.dataset.motion = 'reduce'; // the server may have set it already
})();
```

### 15.4 Component primitives and shadcn/ui

No primitive library is installed. The direction's build order puts Sheet and Dialog on Radix or React Aria. **If the team adopts shadcn/ui**, bridge its variable names to these tokens in one block, and keep our vocabulary in app code:

| shadcn variable | Maps to | Caution |
|---|---|---|
| `--background` / `--foreground` | `var(--bg)` / `var(--text)` | `--background` is also a legacy alias; the values agree |
| `--card`, `--popover` (+ `-foreground`) | `var(--surface)` / `var(--text)` | Overlays add `--e3` + `--border-overlay` |
| `--primary` / `--primary-foreground` | `var(--accent)` / `var(--on-accent)` | |
| `--secondary` (+ fg) | `var(--surface-2)` / `var(--text)` | |
| `--muted` / `--muted-foreground` | `var(--surface-2)` / `var(--text-3)` | |
| `--accent` / `--accent-foreground` | **`var(--surface-2)` / `var(--text)`** | **Name clash:** shadcn's "accent" is a hover fill, ours is Neel. The bridge must be scoped to shadcn components or renamed on install |
| `--destructive` | `var(--danger)` | Our danger button is an outline (`--danger-text`) |
| `--border` / `--input` / `--ring` | `var(--border)` / `var(--control)` / `var(--focus)` | Replace shadcn's `ring` box-shadow focus with the outline from `base.css` |
| `--radius` | `var(--radius-6)` | |

### 15.5 Lint and CI

- **Stylelint / ESLint:** no hex, `rgb()`, `hsl()` or `oklch()` literals outside `design/`; no arbitrary Tailwind values (`text-[9px]`, `bg-[#…]`, `rounded-[9px]`, `z-[9999]`); no raw palette classes; no `white/*` or `black/*`; no `opacity-*` on text; no `transition-all`; no `outline-none` without a `focus-visible:` replacement; no `font-mono`, `--font-mono` or `--type-mono-*` outside the five token components (`IdText`, `VariableChip`, `Code`, `SecretField`, `Keycap`; §1.3 rule 4), and no use of the deprecated `--type-mono-20`; no new use of a name *defined* in `legacy-aliases.css` (canonical names that the file only mentions, such as `--text-muted`, `--surface` and `--sentiment-*`, are allowed).
- **Custom properties:** every `var(--…)` in app code must name a token in `tokens.css` (the register in §18) or a documented component-local runtime variable (`--zoom`, `--table-sticky-top`, `--vl-*`, and core's `--btn-*`, `--field-h*`, `--field-px`, `--hit` layer, §18.3). This is what makes "every value is a token" and "no arbitrary values" hold together: an interim `calc()` or a literal where a registered token exists is a lint error.
- **CI:** `node design/build-tokens.mjs && git diff --exit-code` (generated files are current), then `node design/check-contrast.mjs` (exit 0), then visual snapshots of every page in both themes and of the focused states of Button, Input, Select, Checkbox and icon buttons (F-VIS-001, F-A11Y-006), then the forced-colours snapshot **VR-02** of a focused row, a selected row, a focused selected row, the current nav item and free and connected sockets (06-accessibility §21.1).
- A unit test asserts that the body font resolves to Hanken (F-VIS-008).
- **CT-03 (type floor, blocking):** `getComputedStyle(document.documentElement).fontSize === '16px'` and an element with `font: var(--type-meta-12)` computes to `12px`, on every route and in every generated specimen. `base.css` keeps `html { font-size: 100% }` and puts `font: var(--type-body-14)` on `body`: the `font` shorthand on `html` would set the root to 14 px and re-base every rem token to 87.5 % (meta-12 at 10.5 px), which is why it is asserted, not just reviewed (02-components-data-nav §0.6, 02-components-core §1.10, 06-accessibility §18).

### 15.6 Migration from today's 32 variables

1. Ship `tokens.css`, `base.css` and `legacy-aliases.css` together. Every page keeps rendering, `--text-muted` becomes AA immediately (F-A11Y-008), and "saffron" stops turning violet in dark (F-VIS-004).
2. Put the next/font variables on `<html>` and delete the unused registrations (F-VIS-008, F-VIS-036).
3. Swap the `html.dark` class and `vv:theme` for `data-theme` and `vaani:theme` in the bootstrap script. Remove the 21 OS-media `dark:` utilities (F-VIS-021).
4. Codemod the 45 hex literals, the 18 raw hue families and the four error reds onto semantic tokens, starting with Meeting Agent's `#8B5CF6` (F-VIS-020).
5. Migrate page by page in traffic order (Dashboard/Cockpit, Leads, Analytics, Meeting Agent, Settings), removing arbitrary sizes so the 12 px floor holds without `.type-floor`.
6. Delete `legacy-aliases.css`, the 36 keyframes, and the glass, grid, noise, glow and HUD classes (F-VIS-022, DESIGN-SYSTEM-17).

| Old | New role | Old | New role |
|---|---|---|---|
| `--background` | `--bg` | `--saffron` / `-dim` | `--accent` / `--accent-hover` |
| `--foreground`, `--text-primary` | `--text` | `--saffron-glow*` | transparent (glows retired); `-subtle` → `--accent-soft` |
| `--text-secondary` | `--text-2` | `--peacock*` (teal/cyan) | retired as an accent; `--accent-text` for now, review each use |
| `--text-muted` | same name, now `--text-3` | `--sentiment-positive / -neutral / -negative` | **same names, new values** (the validated CVD-safe palette in `tokens.css`, §3.6); not redefined in `legacy-aliases.css` and not linted as legacy |
| `--surface` | same name, same role | `--glass-bg*` | `--surface` / `--surface-2` (solid) |
| `--surface-light` / `--surface-hover` | `--surface-2` / `--surface-3` | `--code-bg` / `--code-border` | `--surface-2` / `--border` |
| `--border-color` / `--border-light` | `--border` / `--border-strong` | `--grid-line-color`, `--dot-grid-color`, `--noise-opacity` | transparent / 0 (textures retired) |

### 15.7 Versioning

`tokens.json` carries a semantic version in `$extensions["in.vaanilabs.meta"]` (now **1.1.0**, with a `changes` note). Adding a token is minor; changing a value that moves a contrast ratio is minor with a note in the report; renaming or removing a token is major and goes through a one-release alias; a token scheduled for removal carries `$deprecated` with the reason, is still emitted (with a comment in `tokens.css`), and lint rejects new uses (1.1.0 deprecates `mono-20`, removed in 2.0.0). The specimen (`foundations.html`) refreshes its manifest on every build, including the component tokens and interaction constants.

---

## 16. Traceability

| Finding | Resolved by |
|---|---|
| F-VIS-001 (five dialects), F-VIS-025 (three systems) | One token set for app, auth and marketing; one type system (§2) |
| F-VIS-002, F-A11Y-008 (16 sizes, 36% below 12 px, failing muted token) | 22 rem roles with a 12 px floor; `--text-3` ≥ 4.70:1 on every plane (§2.3, §3.4) |
| F-VIS-003, F-VIS-028 (dark-first leaks, unthemed pieces) | Every colour is a semantic token with both values; minimap, edges and chart marks tokenised (§3) |
| F-VIS-004, F-A11Y-009 (hue changes by theme, black on blue) | One Neel hue (indigo dye, HSL ≈ 218°); `--on-accent` white at 8.52 / 5.79:1 (§3.2) |
| F-VIS-006, F-VIS-016, F-VIS-017, F-VIS-018 (80 buttons, 12 radii, 20 badges, 12 inputs) | Control heights by density, five radii, one tag scale (§6, §14); components build on these |
| F-VIS-008 (system-font fallback) | next/font variables on `<html>`, `var(--font-hanken, …)` stack, test (§2.2) |
| F-VIS-011 (direction-coloured deltas, mustard neutral) | Sentiment palette, grey neutral, deltas coloured by desirability with ▲/▼ (§3.6) |
| F-VIS-014, F-VIS-015 (tooltips, clipped labels) | `--size-tooltip-max` 280, `--z-tooltip` above everything but the skip link |
| F-VIS-020, F-VIS-021, F-VIS-036 (raw colours, `dark:` mismatch, dead scaffolding) | Palette reset, `data-theme` variant, legacy layer and deletions (§15) |
| F-VIS-022, F-A11Y-022 (textures, idle animation) | One texture (canvas dots); motion tokens and reduced-motion policy (§11) |
| F-VIS-024 (date formats) | One `lib/format.ts` grammar (§2.5) |
| F-VIS-031, F-VIS-032 (icon breaks, duplicates) | Lucide only, five sizes, one icon per destination (§12) |
| F-VIS-034, F-VIS-035 (containers, breakpoints) | Containers and five named breakpoints (§5) |
| F-A11Y-006, F-A11Y-007 (focus missing, focus = selection) | Global outline focus; separate selection treatment, also in forced colours (SelectedItem fill vs Highlight outline, §13) |
| F-A11Y-022 (idle animation) | Bounded loops: 3 live pulses on the focal call, spinners only while a request runs, one reduced-motion block for the media query and the in-app preference (§11) |
| F-A11Y-019, F-A11Y-020 (status chips, placeholders) | Status text ≥ 5.47:1 on tints; placeholders are `--text-3` (§3.4) |
| F-A11Y-023 (targets) | 24 px minimum, 44 px touch, touch density (§14) |
| F-RWD-001, F-VIS-033 (phone nav, tablet sidebar) | Shell per breakpoint (§5) |
| F-FLOW-007, F-FLOW-008 (coloured node titles, tiny canvas text) | Ink titles, neutral glyph tiles, the 12 px floor at every zoom (§2.3, §12) |

## 17. Open questions for the product owner

1. **Rupee face licence and hosting:** Noto Sans is OFL, so the one-glyph subset can be self-hosted. Confirm the `/fonts` path and caching.
2. **Tenant theming:** which primitives a white-label tenant may override (proposed: Neel only), and whether tenants get their own contrast report in CI.
3. **Hindi UI chrome** (v2): the type scale already supports Devanagari; confirm whether Hindi chrome should use `read-15-deva` line heights in dense tables (it would add about 2 px per row).
4. **Marketing display:** the direction keeps Hanken for display up to 56/60. Confirm that no separate display face comes back for campaigns.

---

## 18. Token register

Every token another spec asked for, with exactly one name, one value and one owner. Before 1.1.0 the component, page, flow, responsive and motion specs each kept a "Token requests" section with interim `calc()` values, and about sixty names existed only in prose, so "every value is a token" and "no arbitrary values" could not both hold. They are now in `tokens.json` **v1.1.0**, emitted by `build-tokens.mjs`, and every new colour pair is in `check-contrast.mjs` (460 pairs, all pass). Those sections now point here. **A spec that needs a new token adds a row here first**, then to `tokens.json`; a name that is not in this register or in `tokens.css` fails lint (§15.5).

**Status:** *accepted* (emitted since 1.1.0) · *merged* (the request uses another token's name, which wins) · *declined* (an existing token already does the job) · *JS* (in the `interaction` group, never emitted to CSS) · *deprecated*.

### 18.1 Colour, type and motion

| Token | Value (light / dark) | Owner spec | Status |
|---|---|---|---|
| `--nav-hover-bg` | `--surface-3` / `--surface-2` (`#E8EBF0` / `#1A1E24`) | 02-components-data-nav §0.5; 03-pages/06-settings | accepted (`component.nav`) |
| `--nav-active-bg` | `--surface` / `--surface-3` (`#FFFFFF` / `#222730`); text 17.93 / 12.54, active icon 8.52 / 6.95 | same | accepted (`component.nav`) |
| `--nav-active-border` | `--border` / `--border-strong` | same | accepted (`component.nav`) |
| `--danger-hover` | red-700 `#B42318` / red-200 `#F7B2AB`; label 6.57 / 10.17 | 02-components-core §2.1, §11 | accepted (`component.button`) |
| `--qr-fg` / `--qr-bg` | ink / white in both themes (17.93:1); never inverts | 03-pages/05-knowledge-billing §3 | accepted (`component.qr`) |
| `--edge-hover` | `--text-2` in both themes; 8.18 / 9.53 on the canvas | 04-flow-designer/01 §20.2 | accepted (`component.flow-color`) |
| `--chart-neutral` | alias of `--chart-1` (ink) | 02-components-data-nav §11; 03-pages/04 | accepted (alias) |
| `--chart-highlight` | alias of `--accent-mark` | this document §3.6 | accepted (alias, new) |
| `--talk-agent` / `--talk-caller` | ink / graphite-100 · graphite-400 / graphite-500 | 02-components-data-nav §12.5 | accepted (no longer Neel and Slate) |
| `--diff-added-*`, `--diff-changed-*`, `--diff-removed-*` | §3.9 | 04-flow-designer/02 §5 (Compare) | accepted (aliases, new) |
| `--variable-bg` / `--variable-fg` | `--surface-3` / `--text` | 04-flow-designer/01 §5.1, 02 | accepted (aliases, new) |
| `--type-display-48` | 48/52 · 600 · −0.03 em | 03-pages/08-public-auth §18 | accepted (`typography.display-48`) |
| `--type-mono-20` | 20/28 · 500 mono | this document §2.3 | **deprecated**: the timer is `--type-num-20` |
| `--dur-spin` | 800 ms (0 under reduced motion) | 02-components-overlay-feedback §21; 07-motion MD6; 06-accessibility §14.1 | accepted (`duration.spin`) |
| `--live-pulse-cycles` | 3 (0 under reduced motion) | 07-motion MD3; 06-accessibility §14.2 | accepted (`component.live`) |
| `--shift-sheet` | 100 % (0 % under reduced motion) | 07-motion §2.1 | accepted (`motion-shift.sheet`) |
| `--timing-skeleton-min` | 400 ms | 02-components-overlay-feedback §21; 07-motion MD6 | accepted (`timing`) |
| `--timing-state-announce` | 500 ms | 03-pages/01-agent-cockpit §7.14; 02-components-data-nav §12.1 | accepted (`timing`) |
| `--timing-call-stale` | 60 s (`60000ms`) | 03-pages/01-agent-cockpit §7.14 | accepted (`timing`) |
| `--timing-refit-debounce` | 150 ms | 05-responsive §19 | accepted (`timing`) |
| `--timing-debounce` | – | 02-components-overlay-feedback §21 | **merged** into `--timing-validate-debounce` (300 ms), the one input debounce |
| `:root[data-motion="reduce"]` | the reduced-motion block, generated | 07-motion §18; 06-accessibility §14.3 | accepted (build output) |

### 18.2 Sizes

| Token | Value | Owner spec | Status |
|---|---|---|---|
| `--size-node-trigger` · `-logic` · `-action` · `-outcome` | 208 · 256 · 240 · 240 px | 04-flow-designer/01 §20.2 | accepted (`component.flow`) |
| `--size-answer-row` · `--size-frame-header` · `--size-note` | 28 · 32 · 220 px | same | accepted |
| `--size-minimap-w` / `-h` | 176 / 112 px | same | accepted |
| `--grid-snap` | 16 px (snap and dot spacing; JS reads this one value) | same; 07-motion §10.4 | accepted |
| `--layout-rank-gap` / `--layout-node-gap` | 128 / 24 px | same | accepted |
| `--edge-width` / `--edge-width-active` · `--edge-dash` · `--edge-radius` | 1.5 / 2 px · `5 4` · 8 px | same | accepted |
| `--size-left-panel` | 280 px: the one left-panel slot (Add step, Outline, Variables, Version history) at ≥ 1024 | 04-flow-designer/01 §3.1, §20.2; 02 §3.3, §8, §16 | accepted (`size` group), **the only name** at ≥ 1024 |
| `--size-left-panel-tablet` | 320 px: the Outline column of Review mode at 768–1023 | same; 05-responsive §19 | accepted (`size` group) |
| `--size-outline-panel` | – | 04-flow-designer/01 §3.1 | **merged** into `--size-left-panel` |
| `--size-outline` (320) | – | 05-responsive §19 | **merged** into `--size-left-panel-tablet` (320) |
| `--size-test-panel` · `--size-compare-bar` | 280 · 40 px | 04-flow-designer/02 §20 | accepted (`component.flow`) |
| `--size-scrollrow-fade` | 24 px | 05-responsive §19 | accepted (`component.data`) |
| `--size-sheet-step` | – | 05-responsive §19 | **withdrawn** by its owner: the Review step sheet is Sheet `detail` (`--size-sheet-detail`) |
| `--size-chart-sm` · `-md` · `-lg` | 160 · 200 · 240 px | 02-components-data-nav §0.5 | accepted (`component.data`) |
| `--size-sparkline-h` · `--size-stat-min` · `--size-search` · `--size-turn-gutter` | 32 · 200 · 280 · 56 px | same | accepted |
| `--size-view-summary` | 32 px (counted in the chrome budget) | 03-pages/04-call-reports-analytics §5 | accepted |
| `--field-w-short` · `--field-w-medium` · `--popover-w-list` | 180 · 320 · 400 px | 02-components-core §1.3 | accepted (`component.form`); core no longer declares them |
| `--size-palette-list` | `calc(var(--row-h) * 9)` | 02-components-overlay-feedback §21 | accepted (`component.overlay`) |
| `--size-softphone` | 400 px (equals `--size-cockpit-card`) | 03-pages/01-agent-cockpit §7.14 | accepted (`component.shell`) |
| `--size-auth-panel` · `--section-pad-y` | 464 px · 80 / 64 / 48 px at ≥ 1024 / 768–1023 / < 768 | 03-pages/08-public-auth §18 | accepted (`component.shell`, responsive) |
| `--size-assistant-plan` · `--size-assistant-column` | – | 03-pages/02-assistant §11 | **declined**: use `--size-sheet-record` (440) / `--size-inspector` (320) and `--size-container-form` (720) |

### 18.3 JS constants and names that are not tokens

**`interaction` (JS only, one name each; import from `tokens.json`):** `dragThreshold` 4 · `alignThreshold` 6 · `magnetRadius` 24 · `autopanZone` 40 · `autopanMax` 12 px per frame · `safeAreaInset` 0.1 · `zoomMin` 0.25 · `zoomMax` 2 · `lodFull` 0.75 · `lodCompact` 0.5 · `lodHysteresis` 0.03 · `meterFps` 15 · `talkStripFps` 10 · `progressThrottle` 140 ms (07-motion §18, 04-flow-designer/01 §20.2). The CSS names `--zoom-min`, `--zoom-max`, `--lod-full` and `--lod-compact` are **not** emitted: these are read by JS. 07's `snapGrid` is `--grid-snap`, not a second constant.

**Component-local runtime variables** (allowed by lint, never in `tokens.json`, always assigned from a token or a measurement):

| Name | Set by | Why it is not a token |
|---|---|---|
| `--zoom` | `useCanvasZoomVar()` on the canvas viewport | The live zoom level |
| `--table-sticky-top` | DataTable, from the measured height of the sticky header and toolbar above it | A measurement |
| `--vl-dir-x` / `-y`, `--vl-from-x` / `-y`, `--vl-rise` | 07-motion §15 keyframe parameters, per element | Set from `--shift-*` per use |
| `--btn-h-*`, `--btn-px-*`, `--btn-font-md`, `--field-h*`, `--field-px`, `--hit` | 02-components-core §1.3 component layer | `var()` pointers to density tokens (`--control-h`, `--space-*`), switched by density |

Placeholders in prose (`--type-x-size`, `--seq-n-fg`) stand for a family of registered tokens.

### 18.4 Where the requests were

The "Token requests" sections in 02-components-core (§1.3, §2.1, §11), 02-components-data-nav (§0.5, §14), 02-components-overlay-feedback (§21), 03-pages/01-agent-cockpit (§7.14), 03-pages/04-call-reports-analytics (§5), 03-pages/05-knowledge-billing (§3), 03-pages/08-public-auth (§18), 04-flow-designer/01 (§20.2), 04-flow-designer/02 (§20), 05-responsive (§19) and 07-motion-microinteractions (§2.1, §18) now say "registered in 01-foundations §18". Interim `calc()` values in those specs are retired: build with the token name.
