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
