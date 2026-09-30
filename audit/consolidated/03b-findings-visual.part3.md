
### F-VIS-018 — 12 input styles (21–43px tall, mono vs sans, 4 radii, 4 fills)
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-14
- **Pages:** /dashboard, /leads, /billing, /knowledge, /settings, /meeting-agent, /assistant, /call-reports
- **Evidence:**

  | Style | Metrics | Where |
  |---|---|---|
  | `.input-vani` | 43px, system font 14px, r8, white/85 | Settings, Call Reports search, Leads search |
  | Mono 12px on #EEF1F7 | 34px, r6 | Billing, Knowledge, Settings |
  | Mono 12px | 30px | Dashboard intel fields |
  | Mono 10px | 21px | Dashboard flow select |
  | Mono 10px uppercase pill selects | 25px | Leads filters |
  | Mono 14px | 42px | Meeting Agent |
  | Hanken 13px | 42px | Assistant composer |

  The `.input-vani:focus` ring is 2px at 14% alpha, so it is barely visible (the focus token is covered in the accessibility section, DESIGN-SYSTEM-12).
- **Screenshots:** audit/screenshots/va-design-system/dashboard.png, audit/screenshots/va-design-system/settings.png, audit/screenshots/va-design-system/meeting-agent.png
- **Recommendation:**
  - Build `Input`, `Select`, `Textarea` and `SearchField` primitives:
    - sizes 32, 36 and 40px;
    - sans text (mono only for code and API-key values);
    - one fill (`--surface`) and one border token;
    - focus, error, disabled and read-only states, with a 2px solid focus ring at 3:1 or better.
  - Give them `leadingIcon` and `trailingIcon` slots that pad the text automatically (this fixes F-VIS-019).
  - Use 16px text at 767px and below.

### F-VIS-019 — The Change Email "@" icon overlaps the input text
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** EXPLORE-SETTINGS-20
- **Pages:** /settings/change-email
- **Evidence:** the "@" icon spans x=565–579, but the input text starts at x=567 (padding-left 14px). The placeholder therefore renders as "@ew-address@company.com".
- **Screenshots:** audit/screenshots/va-explore-settings/c13_change_email.png, audit/screenshots/va-explore-settings/c23_change_email_input.png
- **Recommendation:**
  - Set `padding-left: 36px` when an input has a leading icon (icon at left 12px), or remove the icon, since the label already says "New email".
  - Long term, use the Input `leadingIcon` slot from F-VIS-018.

### F-VIS-020 — Raw colours bypass the token layer: 45 hex literals, 18 Tailwind hue families, 4 different error reds
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-10
- **Pages:** global CSS / all app pages
- **Evidence:**
  - **Hex literals:** 45 distinct values in the compiled utilities, for example `#8b5cf6` ×50, `#a78bfa` ×11, `#0ea5e9`, `#2dd4bf`, `#0078d4`, `#f43f5e`, `#fbbf24`, `#fb923c`.
  - **Raw palettes:** `@theme` emits 18 raw hue families (red through zinc), and they are used directly in markup.
  - **Arbitrary classes:** on Call Reports, 929 of 10,510 class tokens are arbitrary values.
  - **Four error reds:**

    | Red | Where | Contrast |
    |---|---|---|
    | Token #D0463A | — | — |
    | Tailwind red-500 #FB2C36 | Rep Console "Could not connect" | 3.27:1 |
    | `rgba(239,68,68,…)` | `.btn-danger` hover, input error ring | — |
    | #D76A60 | Settings "Delete Account" | 3.25:1 |

  - **Success glow:** `rgba(34,197,94,.5)` instead of the token #178A55.
  - **Rendered totals:** 24 text colours, 62 backgrounds and 42 border colours.
- **Screenshots:** —
- **Recommendation:**
  - Define about 12 semantic background/foreground pairs, and derive tints with `color-mix(in oklab, var(--danger) 10%, transparent)`.
  - In Tailwind v4, reset the raw palette (`@theme { --color-*: initial; … }`) and declare only the semantic colours.
  - Add a lint rule rejecting `bg-[#…]`, `text-[#…]` and `border-[#…]`.
  - Migrate the 45 literals, starting with Meeting Agent's #8B5CF6 and the four reds.

### F-VIS-021 — The `dark:` variant follows the OS setting while the app theme uses a `.dark` class (inferred risk)
- **Severity:** medium · **Confidence:** single-agent (inferred; no affected screen was observed)
- **Source findings:** DESIGN-SYSTEM-11
- **Pages:** global CSS
- **Evidence:**
  - 21 rules are compiled inside `@media (prefers-color-scheme: dark)`, which is Tailwind v4's default. Examples: `dark:bg-slate-900`, `dark:text-red-300`, `dark:border-amber-800`, `dark:hover:bg-slate-800`.
  - The in-app toggle only sets `html.dark` and `localStorage["vv:theme"]`.
  - A user with a dark OS and a light app theme (or the reverse) would get mismatched panels.
  - Not seen rendered on Settings or Leads, so the exact affected screens are unknown.
- **Screenshots:** —
- **Recommendation:**
  - Add `@custom-variant dark (&:where(.dark, .dark *));` to the Tailwind entry CSS.
  - Prefer token swaps over `dark:` utilities.
  - Add an e2e check that emulates OS dark with the app on light, and the reverse.

### F-VIS-022 — Decorative textures (grid, noise, dot grid, hatch, HUD brackets) sit behind data
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** DESIGN-SYSTEM-16
- **Pages:** /leads, /dashboard, /analytics, /settings/activity; the noise overlay is on every app page
- **Evidence:**
  - An SVG noise overlay (`.noise-overlay`, fixed, z-index 9999, opacity .02) covers every app page (also EXPLORE-CORE-27).
  - A 1px 8%-black grid (`--grid-line-color #00000014`) sits behind Dashboard, Leads and Analytics.
  - Analytics adds a dot grid, hatch fills and `.hud-bracket` corners, and Settings › Activity sits on grid paper.
  - The grid shows through the semi-transparent Leads rows (F-VIS-009).
- **Screenshots:** audit/screenshots/va-design-system/leads.png, audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-visual-audit/analytics.png
- **Recommendation:**
  - Put a solid `--surface` behind tables, forms and dense data.
  - Limit textures to marketing, hero and empty-state illustrations.
  - Remove the noise overlay from the app, or scope it to marketing. This also removes the z-index 9999 layer.

### F-VIS-023 — Empty, loading and not-found states have no shared pattern (7 empty-state styles; loaders drop the app shell)
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-17, EXPLORE-SETTINGS-22
- **Pages:** /assistant, /dashboard, /personal-agents, /billing, /analytics, /settings/organization, /api-keys, /leads, /rep-console, any 404
- **Evidence:**
  - **Seven empty-state styles:**

    | Page | Empty state |
    |---|---|
    | Assistant | Icon tile, H2 and suggestion chips |
    | Dashboard transcript | "Awaiting connection..." in mono grey at 2.4:1 |
    | Personal Agents | One sentence and a link |
    | Billing | A bordered mono box: "No transactions yet." |
    | Analytics | Tracked "NO DATA" plus a serif-italic line |
    | Settings › Organization | A dashed box with a shield icon |
    | API Keys | A plain mono line |

  - **Loaders:**
    - A sans spinner with "Loading..." on Leads.
    - A mono "Loading…" on Settings sub-pages.
    - A boxed "Requesting softphone credentials…" on Rep Console.
  - **Shell drops out:**
    - `/settings/organization` first paints a full-screen "Loading…" with no rail.
    - The 404 page has no shell and reads "STATUS: DISCONNECTED".
  - Related performance and routing issues (EXPLORE-CORE-18, QA-A-12, QA-B-23) are covered in other sections.
- **Screenshots:** audit/screenshots/va-explore-settings/c4_organization.png, audit/screenshots/va-explore-settings/c14_docs_embed_404.png, audit/screenshots/va-visual-audit/assistant.png, audit/screenshots/va-visual-audit/billing.png, audit/screenshots/va-visual-audit/settings_organization.png
- **Recommendation:**
  - **`EmptyState`:** a 24px icon, a 16/600 title, a 14px body and at most one primary action, with separate "no data" and "no match" variants.
  - **Loading:** per-region `Skeleton`s plus a `PageLoader` inside the persistent shell. The (app) route-group `layout.tsx` keeps the rail and top bar mounted.
  - **Not found:** an authenticated `not-found.tsx` inside the app layout, with plain copy and a "Go to dashboard" action.

### F-VIS-024 — Date, time and duration formats vary across and within pages
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** QA-B-20, EXPLORE-DATA-06 (formats sub-point)
- **Pages:** /analytics, /call-reports, /leads (list and drawer), /knowledge, /settings/data-export, /meeting-agent
- **Evidence:**
  - **Dates:**

    | Format | Where |
    |---|---|
    | "23 Sept, 06:13" (24h, no year) | Analytics Recent, Call Reports |
    | "28 Aug, 11:45 pm" (12h, lower case) | Lead drawer |
    | "21/09/2026, 16:19:12" | Knowledge, Data Export |
    | "11 Aug 2026" | Identity, lead drawer |
    | "23 Sept 2026" | Meeting Agent |
    | "28d ago" | Leads list |

  - **Durations for the same kind of value:** "1m 18s" / "1m 27s" (Analytics), "0:11" / "1:27" (Call Reports table), "11s" / "87s" (call detail panel), "90s" (Call Reports KPI).
  - The 1m 18s vs 90s average mismatch is a data issue (EXPLORE-DATA-17, other section).
- **Screenshots:** —
- **Recommendation:**
  - Create `lib/format.ts` with:
    - `formatDateTime`: `Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })`;
    - `formatRelative`: relative under 7 days, with the absolute value in a tooltip;
    - `formatDuration`: always "1m 18s", with `tabular-nums`.
  - Add a lint rule banning direct `toLocaleString` / `toLocaleDateString` in components.

### F-VIS-025 — Public site, login and app are three separate visual systems
- **Severity:** medium · **Confidence:** partially-verified (the verifier checked the home and login themes)
- **Source findings:** DESIGN-SYSTEM-21, UX-AUDIT-30, VISUAL-AUDIT-23 (login sub-point); related PUBLIC-SITE-06 (public-site section)
- **Pages:** `/`, `/pricing`, `/docs`, `/login`, the app
- **Evidence:**
  - **Three looks (verifier-checked):**
    - Marketing is `html.dark` with Hanken and violet #7C6BF5 CTAs.
    - `/login` is light (#F4F6FA), mostly JetBrains Mono, with a blue Sign In.
    - The app is light and blue, with mixed dialects (F-VIS-001).
  - **Login card:** four families on one card (Syne wordmark, Sora heading, JetBrains Mono subtitle and labels, system-sans buttons and inputs).
  - **Public pages differ from each other:**
    - Three headers: Home has the full nav; Pricing has a logo and "Email us"; Docs has "Back to Home" with the logo on the right.
    - Home uses 25 font sizes, including half-pixels (11.5–17.5px), and 15 radii.
    - Pricing is mono-heavy (62 of 119 text nodes).
  - **CTAs:** "Start free" is white on #7C6BF5 at 3.98:1, while the Pricing CTA is black on violet.
- **Screenshots:** audit/screenshots/va-design-system/home.png, audit/screenshots/va-design-system/pricing.png, audit/screenshots/va-design-system/docs.png, audit/screenshots/va-verify-visual-audit/login.png, audit/screenshots/va-verify-visual-audit/home.png
- **Recommendation:**
  - **Shared foundations:** one package (tokens, type, Button) consumed by both the marketing and app builds.
  - **Auth pages:** render `/login` and `/signup` in Hanken with the app's tokens and the unified primary, in one family.
  - **Marketing:** may stay dark as an expressive theme, but built from the same tokens and hue (F-VIS-004), with one marketing header and footer.

### F-VIS-026 — The marketing hero reads as a generic AI template and has polish defects
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** DESIGN-RESEARCH-12, VISUAL-AUDIT-23
- **Pages:** `/`
- **Evidence:**
  - **Template tells:** gradient headline text; a glowing orb with animated waves; an eyebrow with a status dot, a middle dot and very wide tracking; about 36 words of subtext; a four-pill trust strip inside the hero; violet CTAs unlike the app's blue.
  - **Strengths:** the H1 (Hanken 72/600, −1.8px), the 16px-radius dark cards and the product mocks are cohesive.
  - **Defects:**
    - 12px white text on #7C6BF5 chips ("English", "E-commerce") is 3.98:1.
    - The "GET STARTED" eyebrow's decorative dash sits about 360px left of its centred label.
    - Scroll-reveal sections stay invisible until intersected, leaving blank bands of about 700px and 1,100px in full-page captures and share previews.
- **Screenshots:** audit/screenshots/scout_home.png, audit/screenshots/va-visual-audit/home.png, audit/screenshots/va-visual-audit/home_full.png, audit/screenshots/va-visual-audit/home_gap1.png, audit/screenshots/va-visual-audit/home_gap2.png
- **Recommendation:**
  - **Hero content:**
    - A 2-line solid-ink headline, with the gradient on at most one word.
    - 20 words of subtext or fewer, and two CTAs.
    - A real product visual (a live transcript or the flow canvas) instead of the orb.
    - Move the trust pills to the next section, and keep eyebrow tracking at 0.1em or less.
  - **Chips:** a #6D5AE6 fill (4.93:1) or dark text.
  - **Eyebrow:** align the rule with its label.
  - **Reveal animations:** make them progressive. Content is visible by default and animates only under `@media (prefers-reduced-motion: no-preference)` once JS has loaded.

### F-VIS-027 — Call Reports: dash-filled flow-field columns and uppercase pill noise
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-24, DESIGN-RESEARCH-10 (related table-width issue: EXPLORE-DATA-04, other section)
- **Pages:** /call-reports
- **Evidence:**
  - Every flow field ("Confirm Interest", "Condition Check", "Condition…") gets its own column, so the table scrolls horizontally. Most cells are "—" at 1.75–1.81:1 (muted at 50% alpha, 381–498 instances).
  - Every row carries three uppercase pills (BROWSER, COMPLETED, NEUTRAL).
  - Summaries truncate at 2 lines in a 190px column.
- **Screenshots:** audit/screenshots/va-visual-audit/call-reports.png, audit/screenshots/va-verify-visual-audit/call-reports_table.png, audit/screenshots/va-explore-data/r2_callreports_hscroll.png
- **Recommendation:**
  - **Flow fields:** collapse them into one "Captured" chips column or an expandable row detail, with a column picker. Hide columns that are empty on the page.
  - **Status:** one Outcome cell (icon plus sentence-case text), with the channel shown as a small muted icon.
  - **Empty cells:** blank or a solid-token "—" (no alpha).
  - **Summary:** a column of at least 320px, with the full text on hover or open.
  - **Layout:** a sticky first column.
