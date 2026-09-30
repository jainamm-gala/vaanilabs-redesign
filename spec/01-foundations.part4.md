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
