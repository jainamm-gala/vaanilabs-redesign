# Design Resources Research: rules for redesigning Vaani Labs

Agent: Design resources researcher. No browser was used.
Date: 2026-09-26
Output: a rules checklist, starter tokens, anti-patterns, and implications for a premium, minimal, professional voice-AI SaaS dashboard and node-based flow builder.

---

## 0. TL;DR (read this first)

1. **Pick one design language and apply it to every page.** Every source agrees on this in some form. Taste-skill has "One system per project", a colour consistency lock, a shape consistency lock and "one copy register per page". Linear, Vercel, Raycast, Supabase and Cal each run one sans family, one mono family used only for technical tokens, one accent and one gray ramp. Vaani currently mixes at least 4 page styles: a mono/uppercase "HUD" style, a serif-italic "editorial" style on Analytics, a purple style on Meeting Agent, and plain sans on Assistant and Call Reports. Evidence is in section 9. Unifying them will do more for perceived quality than any other change.
2. **Use a product-UI density profile, not the marketing profile.** Taste-skill says it is *not* for dashboards, data tables or multi-step product UI (section 13, "OUT OF SCOPE"). So we take its anti-slop bans but not its marketing layout rules (asymmetric bento, py-24+ sections, scroll reveals). Suggested dial reading for the app: DESIGN_VARIANCE 2-3, MOTION_INTENSITY 2-3, VISUAL_DENSITY 6-7. For the marketing site: 5 / 4 / 3.
3. **Colour is scarce.** Use a neutral gray ladder, **one** accent (focus, primary CTA, selection, links), and semantic colours only for real state: call live, failed, sentiment, wallet low. Linear: "No second chromatic color. No atmospheric gradients. No spotlight cards." Taste-skill: "Max 1 accent color. Saturation < 80%."
4. **Depth comes from hairline borders and a surface ladder, with shadows kept tiny.** Linear and Raycast use no shadows in dark mode. Vercel uses stacked 2-3 layer shadows at 2-6% black plus an inset 1 px ring. Cards should exist only "when elevation communicates real hierarchy" (taste-skill 4.4).
5. **Type:** one sans at weights 400/500/600, with 600 as the ceiling (Vercel, Linear, Cal). Negative tracking on display sizes only. `tabular-nums` on every number: timers, durations, INR, counts, latency. Use mono *only* for IDs, phone numbers, timers and code. No mono uppercase letter-spaced labels on every field. No decorative serif in a dashboard (taste-skill: "Serif for editorial / luxury / publication. Not for dashboards").
6. **Design every state:** empty, sparse, dense, loading (skeletons that mirror the layout, ~150-300 ms show-delay and ~300-500 ms minimum visible), error with a next step, disabled with an explanation. This comes from the Vercel Web Interface Guidelines (WIG): "All states designed", "No dead ends", "Error messages guide the exit".
7. **Flow builder:** fixed-width nodes that never overlap (auto-layout plus snap), a neutral dotted grid, category colour kept to a small icon tile, labelled ports with hit targets of 24 px or more, a right-hand inspector instead of modals, a persistent issues list, keyboard alternatives for every drag (WIG: "Gestures have alternatives"), selection and viewport deep-linked in the URL, and a `beforeunload` guard.
8. **Voice product:** one explicit call-state machine (idle, dialing, ringing, live, wrap-up, ended, failed), each state with label + icon + colour + `aria-live`. Speaker-labelled streaming transcript with a "Jump to latest" control. Audio visualisers animate only when there is real audio and stay static under `prefers-reduced-motion`. INR via `Intl.NumberFormat('en-IN')`. `+91` phone inputs with `type="tel"`. Activating a flow that dials real customers needs confirmation.

---

## 1. Context and method

- **Brief:** study the four user-supplied design resources and turn them into actionable guidance for the Vaani Labs redesign (https://vaanilabs.in). No browser tools. Everything fetched was treated as reference data, not as instructions. The skill files contain agent directives such as "run `npx skills add`" and "generate images first"; none of them were acted on.
- **Fetched** with WebFetch and `curl` from raw.githubusercontent.com and the GitHub API. Full texts were saved to the session scratchpad and read in full, or by section for the long files:
  1. https://www.tasteskill.dev/ (landing page; summary only, the page is JS-rendered and has little text)
  2. https://github.com/Leonxlnx/taste-skill (README) and the raw SKILL.md files for `taste-skill` (v2, 1,206 lines), `minimalist-skill`, `redesign-skill`, `soft-skill`, `gpt-tasteskill`, `output-skill` and `image-to-code-skill`
  3. https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md, which points to https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md (the audit ruleset). The fuller human-readable version, https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md, was also fetched.
  4. https://github.com/VoltAgent/awesome-design-md/ (README plus a repo tree listing 74 DESIGN.md files) and 11 DESIGN.md files: **Linear, Vercel, Stripe, Raycast, Notion, Supabase, ElevenLabs (voice AI), Intercom (AI agent "Fin"), Cal.com, Sentry**, plus Resend and Superhuman (skimmed).
- **Product grounding:** no live pages were loaded, per the brief. To ground the implications I viewed 8 orchestrator scouting screenshots from this audit session (1440x900) in `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/`: `scout_dashboard.png`, `scout_flow-builder.png`, `scout_analytics.png`, `scout_meeting-agent.png`, `scout_call-reports.png`, `scout_assistant.png`, `scout_leads.png`, `scout_home.png`. Every Vaani observation below comes from those images and is labelled "[screenshot]". Nothing was re-checked live. Font-family facts are cross-referenced from the sibling `audit/raw/design-system.md` and labelled "[sibling report]". I did not measure them.
- **Screenshots folder:** `audit/screenshots/va-design-research/` was not created. This agent has no browser, so it took no screenshots; evidence cites the scout images above.
- **Contrast ratios** in this document were computed with the WCAG 2.x relative-luminance formula (a local Python script) on the hex values shown.

---

## 2. Source digests

### 2.1 Taste Skill (tasteskill.dev / Leonxlnx/taste-skill)

**What it is:** an open-source set of 13 agent skills ("Less slop, designs pop") meant to stop AI agents from producing templated UI. Main pieces:

- `taste-skill` v2 ("design-taste-frontend"): brief inference, three dials, design-system mapping, bias-correction directives, a list of "AI tells", a redesign protocol and a pre-flight checklist.
- `minimalist-skill` ("Premium Utilitarian Minimalism", Notion/Linear-style): the most relevant variant for us.
- `redesign-skill`: an audit-first upgrade checklist. Very relevant.
- `soft-skill`: an agency-marketing aesthetic with glass, double-bezel and 150k-agency motion. **Not appropriate for our app.**
- `gpt-tasteskill`: GSAP-heavy marketing. Not appropriate.
- `image-to-code-skill`: image-first build pipeline. Its anti-clutter rules transfer; its workflow does not.
- `output-skill`: bans placeholders and half-finished output.

**Scope caveat.** The main skill states: "Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI." Its OUT OF SCOPE section sends dashboards to Fluent, Carbon, Atlassian or Polaris and data tables to TanStack Table or AG Grid. For Vaani we use it for (a) the anti-slop vocabulary, (b) the redesign protocol and (c) the marketing site. We do not use its layout-variance rules inside the app.

**Transferable principles** (quoted sparingly, attributed):

- **Brief first.** Output a one-line "Design Read" before generating. For Vaani the read is: *B2B voice-AI operations product for Indian SMB and enterprise sales/support teams, in a Linear-style minimal language, leaning toward Radix/shadcn primitives, one sans, one mono and restrained motion.*
- **Dials:** DESIGN_VARIANCE (1 = symmetric, 10 = chaos), MOTION_INTENSITY (1 = static, 10 = cinematic), VISUAL_DENSITY (1 = gallery, 10 = cockpit). "Minimalist / clean / calm / Linear-style" maps to 5-6 / 3-4 / 2-3 for marketing. At density 8-10 the skill says: "No card boxes; 1px lines separate data. Mandatory: `font-mono` for all numbers". For us, tabular-nums in the sans is enough.
- **Anti-default discipline:** "Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, infinite-loop micro-animations everywhere, Inter + slate-900."
- **Colour:** max 1 accent with saturation < 80%. The "LILA RULE" discourages AI purple/blue glow unless it is the brand. "One palette per project." "COLOR CONSISTENCY LOCK." Never mix warm and cool grays.
- **Shape consistency lock:** one radius system with a documented rule, followed everywhere.
- **Cards:** only when elevation communicates hierarchy. Otherwise group with `border-t`, `divide-y` or negative space. Tint shadows to the background hue.
- **Full interaction cycle:** skeleton loaders that match the layout ("Avoid generic circular spinners"), composed empty states, inline or contextual errors (toasts only for transient messages), and tactile `:active` feedback (`scale(0.98)` or `translateY(1px)`).
- **Mandatory checks:** Button Contrast Check (WCAG AA 4.5:1), CTA Button Wrap Ban (a label must fit on one line at desktop), No Duplicate CTA Intent, Form Contrast Check (inputs, placeholders, focus rings, helper and error text all AA).
- **Forms:** label ABOVE the input, error BELOW, "No placeholder-as-label. Ever."
- **Motion must be motivated:** allowed reasons are hierarchy, storytelling, feedback and state transition. "it looked cool" is not one. Reduced motion is mandatory above intensity 3. Animate transform and opacity only.
- **Dark mode:** dual-mode by default, hierarchy parity across themes, no pure #000 or #fff.
- **Relevant AI tells:**
  - neon or outer glows
  - pure black
  - oversaturated accents
  - gradient text on large headers
  - Inter as the unexamined default
  - three equal feature cards
  - "Jane Doe" or Acme data
  - fake-precise numbers
  - filler verbs such as "Elevate", "Seamless", "Unleash", "Next-Gen"
  - section-number eyebrows ("00 / INDEX", "001 · Capabilities")
  - decorative colored status dots on every row or badge ("Only acceptable when the dot conveys actual semantic state")
  - rationed middle-dots ("Maximum 1 per line")
  - performative-craftsman labels ("From the field", "Field notes")
  - micro-meta sentences under eyebrows
  - generic step labels ("Step 1 / Step 2")
  - pills overlaid on images
  - version footers
  - scroll cues
- **Eyebrow restraint:** "Maximum 1 eyebrow per 3 sections". The typical signature is `font-mono text-[10.5px] uppercase tracking-[0.22em]`, which is exactly Vaani's HUD label style.
- **Em-dash ban:** "Em-dash (`—`) is COMPLETELY banned." Use a period, comma, colon or parentheses. This is taste-skill specific (Vercel uses em-dashes in its own copy). Adopt it for consistency, as a low-severity polish rule.
- **Serif discipline:** serif is "very discouraged as the default font". Fraunces and **Instrument Serif** are "Specifically BANNED as defaults". Vaani Analytics uses Instrument Serif italic kickers [sibling report; visible in screenshot].
- **Redesign protocol (section 11):** detect the mode first (preserve vs overhaul), audit before touching (brand tokens, information architecture, content blocks, patterns to keep and retire, current dial reading), and never silently change URL slugs, primary nav labels, form field names or order, the logo, or legal copy. Levers in priority order: typography refresh, then spacing and rhythm, then colour recalibration, then a motion layer, then recomposing key sections, then full block replacement.
- **Redesign-skill audit highlights for product UI:**
  - use Medium 500 and SemiBold 600, not only 400/700
  - tabular figures for data
  - "All-caps subheaders everywhere. Try lowercase italics, sentence case, or small-caps instead."
  - one accent
  - a single gray family
  - no pure black
  - "No indication of current page in navigation"
  - "Modals for everything. Use inline editing, slide-over panels, or expandable sections"
  - no `window.alert()`
  - "Exclamation marks in success messages. Remove them."
  - "Oops!" errors replaced by direct copy
  - no arbitrary z-index 9999
  - "Buttons not bottom-aligned in card groups"
  - optical alignment adjustments of 1-2 px
- **Minimalist-skill specifics** (most compatible with a professional SaaS):
  - body text never absolute black (#111111 or #2F3437), line-height 1.6
  - secondary text #787774
  - hairline borders `1px solid #EAEAEA` or `rgba(0,0,0,0.06)`
  - radius 8 px or 12 px max on cards
  - primary button solid #111 with 4-6 px radius, no shadow, hover #333 or `scale(0.98)`
  - tags in muted pastels (for example pale red #FDEBEC with text #9F2F2D, pale green #EDF3EC with #346538, pale blue #E1F3FE with #1F6C9F, pale yellow #FBF3DB with #956400)
  - `<kbd>` keycaps with a 1 px border, 4 px radius and mono type
  - scroll-entry animation `translateY(12px)` plus opacity over 600 ms with `cubic-bezier(0.16,1,0.3,1)`. **Marketing only.**
  - Its bans on Inter, Lucide and pill containers are stylistic. See the conflict notes in section 3.12.
- **Image-to-code "micro-UI clutter" list:** "unnecessary pills", "decorative code-like tags", "tiny badges everywhere", "overdesigned labels that distract", "meaningless small metadata rows". Prefer "cleaner headings, fewer labels, real hierarchy, stronger typography". It also flags "pseudo-enterprise control labels", "decorative system markers" and "filler status microcopy", which describes Vaani's "SYS ONLINE", "LAT: 0ms" and "SESSION: IDLE" chrome if those values are not actually useful.

### 2.2 Vercel Web Interface Guidelines (WIG)

The `web-design-guidelines` SKILL.md is a thin wrapper. It fetches `command.md` (the ruleset) and reports `file:line` findings. The README is the fuller, human-readable version. The rules are concrete and nearly all apply to Vaani. Consolidated rules follow, grouped with what the README adds.

**Interactions**
- Keyboard works everywhere, following WAI-ARIA APG patterns.
- Visible, unobscured focus ring. Use `:focus-visible` rather than `:focus`, and `:focus-within` for groups. "Sticky headers, footers, banners, & overlays never cover the focused element." (Relevant to the persistent wallet banner.)
- Manage focus with traps, and move and return focus correctly.
- Hit target of 24 px or more (44 px on mobile). Match visual and hit targets.
- Mobile input font size of 16 px or more. Never disable zoom. Never block paste.
- Loading buttons keep their original label and add an indicator.
- Minimum loading-state duration: show-delay ~150-300 ms, minimum visible ~300-500 ms.
- URL as state; deep-link filters, tabs, pagination and expanded panels.
- Optimistic updates with rollback or Undo.
- Ellipsis `…` for follow-up menu items ("Rename…") and for progress states ("Saving…", "Generating…").
- Confirm destructive actions or provide Undo.
- `touch-action: manipulation`; set tap highlight deliberately.
- Tooltip timing: delay the first tooltip, then no delay for peers.
- `overscroll-behavior: contain` in modals and drawers.
- Scroll positions persist across Back and Forward.
- Autofocus only on desktop with a single primary input.
- No dead zones.
- Clean drag: disable text selection and apply `inert` while dragging.
- Gestures have tap and keyboard alternatives.
- Links are links (`<a>`, so Cmd-click works).
- Announce async updates with polite `aria-live`.
- Locale-aware keyboard shortcuts with platform symbols.

**Animations**
- Honour `prefers-reduced-motion`.
- Prefer CSS, then the Web Animations API, then JS libraries.
- Animate transform and opacity only. "Never `transition: all`."
- Animate only when it clarifies cause and effect, or for deliberate delight.
- Easing fits the subject. Animations are interruptible.
- Autoplay over 5 s alongside content needs pause, stop or hide controls.
- Correct `transform-origin`. For SVG, transform on a `<g>` with `transform-box: fill-box`.

**Layout**
- Optical alignment within ±1 px.
- Every element aligns to something deliberately.
- Balance icon and text weight in lockups.
- Verify at mobile, laptop and ultra-wide (zoom to 50%).
- Respect safe areas.
- No excessive scrollbars (test on Windows or with always-visible scrollbars).
- Let CSS size things; do not measure in JS.

**Content**
- Inline help first; tooltips last.
- Stable skeletons that mirror the final content.
- Accurate `<title>` per page.
- "No dead ends."
- "All states designed. Empty, sparse, dense, & error states."
- Curly quotes; avoid widows and orphans.
- `tabular-nums` for comparisons.
- "Redundant status cues. Don't rely on color alone; include text labels."
- "Icons have labels."
- Accessible names exist even when visual labels are omitted.
- `…` character; `scroll-margin-top` for anchored headings.
- Resilient to short, average and very long user-generated content.
- Locale-aware dates, numbers and currency (`Intl.*`); detect language from Accept-Language, not IP.
- `translate="no"` on brand names and code tokens. This matters for "Vaani" and "Vikash" if Chrome auto-translates a Hindi UI.
- Semantics before ARIA; headings plus a skip link; accessible media (captions and transcripts); non-breaking spaces (`10&nbsp;MB`, `⌘&nbsp;K`).

**Forms**
- Enter submits a single-input form; Cmd/Ctrl+Enter submits a textarea (Assistant composer).
- Labels on every control, and clicking the label focuses it.
- Keep submit enabled until submission starts, then disable it, show a spinner and send an idempotency key. This is critical for "Place call", "Test Call" and "Top up".
- Don't block typing (validate instead). Don't pre-disable submit.
- No dead zones on checkboxes.
- Errors next to fields; focus the first error on submit.
- `autocomplete` and a meaningful `name`. Spellcheck off for emails and codes.
- Correct `type` and `inputmode`.
- Placeholders end with `…` and show an example (`+1 (123) 456-7890…`).
- Warn on unsaved changes.
- Allow pasting OTP codes.
- Don't trigger password managers on non-auth fields.
- Trim trailing whitespace.
- Style native `<select>` background and colour for Windows dark mode.

**Performance**
- Test on iOS Low Power Mode and Safari; throttle CPU and network while profiling.
- POST, PATCH and DELETE under 500 ms.
- Virtualise large lists (more than 50 items).
- No layout reads during render.
- Preload fonts and subset them (`unicode-range`). This matters here: Vaani registers 12 families and 139 `@font-face` rules [sibling report].
- Preconnect CDNs; no image-caused layout shift.
- Move heavy work to Web Workers (audio processing, transcript diffing).
- Use video instead of GIF.

**Design**
- Layered shadows (ambient plus direct, at least two layers).
- Crisp borders by combining borders and shadows; semi-transparent borders.
- Nested radii: child ≤ parent, concentric.
- Hue consistency: on tinted backgrounds, tint borders, shadows and text toward the same hue.
- Colour-blind-friendly charts. Prefer APCA over WCAG 2 for contrast.
- "Interactions increase contrast": hover, active and focus are more prominent than rest.
- `<meta name="theme-color">` matches the background; `color-scheme: dark` on `<html>` in dark mode.
- Avoid gradient banding.

**Copy (Vercel house style, not universal)**
- Active voice; second person.
- Title Case for headings and buttons in product, sentence case on marketing. This conflicts with taste-skill; see section 3.12.
- `&` over "and" where space is tight; numerals for counts.
- Consistent currency decimals: 0 or 2, never mixed.
- A space between number and unit (`10 MB`).
- Positive framing; errors that say how to fix them. Example: instead of "Invalid API key", write "Your API key is incorrect or expired. Generate a new key in your account settings."
- Specific labels ("Save API Key", not "Continue").
- Consistent nouns ("Introduce as few unique terms as possible").

**Anti-patterns WIG flags directly**
- `user-scalable=no` or `maximum-scale=1`
- `onPaste` + `preventDefault`
- `transition: all`
- `outline-none` without a replacement
- `div` with `onClick`
- images without dimensions
- unvirtualised large `.map()`
- inputs without labels
- icon buttons without `aria-label`
- hard-coded date or number formats
- unjustified `autoFocus`
- GIFs
- gesture-only actions

### 2.3 Awesome DESIGN.md (VoltAgent)

A curated set of 73-74 DESIGN.md files, the plain-text design-system format introduced by Google Stitch. Each file has nine sections: Visual Theme and Atmosphere, Color Palette and Roles, Typography Rules, Component Stylings, Layout Principles, Depth and Elevation, Do's and Don'ts, Responsive Behavior, and Agent Prompt Guide. **Recommendation:** write a Vaani `DESIGN.md` in this exact format as the redesign deliverable, so future agent-generated screens stay on-system.

Most of these files describe the companies' marketing sites, not their products. The transferable parts are the product-grade decisions they reveal: scale steps, weight ceilings, gray ladders, radius and elevation philosophy, the discipline of a single accent, and how often colour is used. Brand identities are not transferable: Stripe's gradient mesh, Vercel's mesh, Raycast's red stripes, ElevenLabs' orbs, Sentry's mascots.

**Comparative token table** (values are from the fetched DESIGN.md front matter and prose):

| System | Canvas / ink | Gray steps | Accent use | Display type | Body | Weight ceiling | Radius (control / card / large) | Elevation |
|---|---|---|---|---|---|---|---|---|
| **Linear** (dark) | #010102 / #f7f8f8 | ink #f7f8f8, muted #d0d6e0, subtle #8a8f98 (6.42:1), tertiary #62666d (3.62:1, disabled only); surfaces #0f1011 → #141516 → #18191a → #191a1b; hairlines #23252a / #34343a / #3e3e44 | Lavender #5e6ad2 **only** on brand mark, primary CTA, focus ring, link emphasis | 80/1.05/-3px down to 28/1.2/-0.6px, weight 600 | 16/1.5; product 14/1.5; caption 12/1.4; button 14/500; mono 13 | 600 ("resists 700+") | 8 / 12 / 16; pill only for tabs and status | Surface ladder + 1 px hairline; focus = 2 px accent at 50%; "resists drop shadows on dark almost entirely" |
| **Vercel** (light) | #fafafa page, #fff card / #171717 | body #4d4d4d (8.1:1), mute #888 (**3.54:1, fails AA for small text**), hairline #ebebeb, strong #a1a1a1 | Ink-black primary; link blue #0070f3; error #ee0000; warning #f5a623 | 48/48/-2.4px; 32/40/-1.28px; 24/32/-0.96px; 20/28/-0.6px; weight 600 | 16/24; 14/20 (-0.28px); caption 12/16; code 13/20 mono | 600 | App 6 px (`--geist-radius`); marketing cards 8; 12; 16; pills for marketing CTAs only | Stacked: L1 inset `0 0 0 1px #00000014`; L2 `0 1px 1px #00000005, 0 2px 2px #0000000a`; L5 modal `0 1px 1px #00000005, 0 8px 16px -4px #0000000a, 0 24px 32px -8px #0000000f` |
| **Stripe** | white / navy #0d253d | canvas-soft cool off-white | Indigo #533afd, "one filled button per band" | Sohne 300, -1.4px at 56 | 16; **`tnum` on every money or number cell** | 300 display (brand-specific) | 6 inputs / 8 / 12 / 16; pill buttons | `rgba(0,55,112,0.08) 0 1px 3px` (hue-tinted shadow) |
| **Raycast** (dark) | #07080a | surfaces #0d0d0d → #101111 → #121212; hairline #242728 | White pill is the only primary; saturated colours only inside illustrations | Inter + `ss03` | line-height 1.6, slight positive tracking | n/a | 4 keycap / 6 rows / 8 buttons / 10 cards / 16 hero | **No drop shadows**; surface ladder only; keycap glyphs for shortcuts |
| **Notion** | white / near-black | hairline | Purple CTA; pastel tints mirror database property colours | 80/1.05, -2 to -0.5px, 600 | body 1.55 | 600 | **8 px rectangle buttons (not pills)** / 12 cards | 0.04 → 0.08 → 0.20 alpha shadow ladder |
| **Supabase** | white / #171717 | #ededed → #171717 | Emerald #3ecf8e for CTA + dot accents only | Circular 500, -1.92px at 64 | 400 | **500** | **6 px buttons, "never pill"** / 12 cards | `0 1px 3px rgba(0,0,0,.06)` → `0 8px 24px rgba(0,0,0,.08)` → `0 16px 48px rgba(0,0,0,.12)` |
| **ElevenLabs** (voice AI) | #f5f5f5 / #0c0a09 | body #4e4e4e, muted #777169, hairline #e7e5e4, strong #d6d3d1 | **No saturated CTA colour**; ink pill; pastel orbs only as atmosphere | serif Light 300 (brand) | Inter 400, +0.15px | 300 display | 8 inputs (44 px tall) / 12-16 cards / pill CTAs | Hairline + a single soft drop `0 4px 16px rgba(0,0,0,.04)` on hover |
| **Intercom** (AI agent Fin) | cream #f5f1ec / #111 | hairline | Charcoal is the system primary; **Fin Orange #ff5600 only on AI-product CTA and badge** | Saans 500, -2px at 72 | 400 | 500 | 12 cards / 16 mockups; "never pill-rounded" | White-on-cream lift; no drop shadows |
| **Cal.com** | white / #111 | card #f5f5f5 | Monochrome at the action layer; semantic success #10b981, warning #f59e0b, error #ef4444 | Cal Sans 600, -0.5 to -2px | Inter | 600 ("700 reads as bombastic") | 8 buttons and inputs / 12 cards / 16 max ("Larger radii read as consumer-app") | `0 1px 2px rgba(0,0,0,.05)`, `0 4px 12px rgba(0,0,0,.08)` |
| **Sentry** | violet midnight + white | two canvases | Single-primary CTA; lime only as a keyword chip | chunky display | Rubik; **functional UI copy 1.5 line-height**, marketing 2.0 | n/a | n/a | "hero and feature surfaces are spacious, transactional surfaces are dense" |

**Shared principles across the set:**

1. **One chromatic accent, used rarely.** Every file enforces it: Linear's lavender "never decoratively"; Supabase "the only chromatic event"; Stripe "one filled button per band"; Intercom's Fin Orange "never decoratively"; ElevenLabs has no saturated CTA at all. Several of these AI-era brands deliberately use a **near-black primary**: Vercel #171717, Cal #111, ElevenLabs #292524, Intercom #111.
2. **Weight ceiling of 600 (500 for some) and negative tracking that scales with size.** Roughly 3-4% of font size at display (-3 px at 80, -2.4 px at 48, -1.28 px at 32, -0.6 px at 20), reaching 0 at body. Nobody uses 700-800 for headings. Vaani's Analytics H2s use Sora 800 [sibling report].
3. **Hairline + surface ladder instead of heavy shadows.** Shadows, when present, are 2-12% alpha, stacked, sometimes hue-tinted (Stripe `rgba(0,55,112,…)`), and always paired with a 1 px border or ring.
4. **Radii cluster at 6-8 px for controls and 12 px for cards, 16 px maximum.** Pills are either the brand's deliberate CTA choice (Vercel, Stripe, ElevenLabs) or reserved for tabs, status and avatars (Linear, Notion, Supabase, Intercom, Cal). For a dense ops product, the rectangle camp fits better.
5. **Mono is scoped to technical tokens** (code, IDs, keycaps, product screenshots). Linear: "Mono only in code contexts." Intercom: "No mono on chrome." Vercel uses mono for small eyebrows on marketing, but "Body paragraphs never set in mono." Intercom explicitly says "Don't write all-caps tracked eyebrows"; its eyebrows are sentence case at 14/500.
6. **4 px base spacing.** Standard set: 4, 8, 12, 16, 24, 32, 48, 64, 96. Card padding 24 px (16 px in dense grids). Controls 32 / 40 / 48 px tall (Vercel `--geist-form-height` 40, small 32, large 48). Buttons 8x14 px padding (Linear).
7. **"Show the real product."** Every file leads with real product UI, not illustrations. For Vaani marketing, that means real screenshots of the flow builder and call cockpit instead of glowing orbs and waveforms.
8. **Transactional surfaces are denser than marketing** (Sentry, Stripe "content tightening to 32px on dashboard / pricing pages where users compare and act").
9. **Semantic colours are reserved for state.** Linear marketing uses only success green. Intercom keeps a separate "report palette" for charts that must not leak into brand chrome.

---

## 3. Consolidated rules checklist for Vaani

Each rule carries an ID for traceability and a source tag. Tags: **[T]** taste-skill family, **[W]** Vercel WIG, **[D]** DESIGN.md consensus, **[V]** voice-product-specific inference by this researcher.

### 3.1 Layout

- [ ] **L1** One app shell on every authenticated page: sidebar, page header (title + one-line description + max 1 primary action + secondary actions), content. The header height, padding and title style must be identical everywhere [T colour/shape locks; D]. Today the headers differ per page (see DR-01).
- [ ] **L2** Page gutters: 24 px at desktop (≥1024), 16 px on mobile [D Vercel]. Content max-width 1280-1440 px for reading pages (Settings, Billing, Knowledge). Full-bleed for canvas and table pages (Flow Builder, Call Reports, Leads) [T 3.E; D].
- [ ] **L3** Keep everything on one 4 px grid. Vertical rhythm inside panels: 8 px between label and value, 16 px between fields, 24 px between groups, 32-48 px between page sections [D].
- [ ] **L4** Cards only where elevation means something. KPI rows can be a single bordered strip with 1 px dividers (as the Leads KPI strip already does) instead of 4 floating cards. Avoid box-in-box-in-box: Dashboard fields currently sit in bordered boxes inside a bordered panel [T 4.4; image-to-code "Anti-Nested-Box"].
- [ ] **L5** No three-panel "cockpit" where the middle 50% of the viewport is an idle decoration. Give the space to the primary task: dial, pick contact, pick flow, then live transcript [T "motion must be motivated"; W "No dead ends"; V].
- [ ] **L6** Sidebar: show text labels by default at ≥1280 px (collapsible to icons), group the 12 items (Operate: Assistant, Cockpit, Rep Console, Meeting Agent, Personal Agents; Build: Flow Builder, Knowledge; Data: Leads, Call Reports, Analytics; Account: Billing, Settings), and give the active item a clear indicator [T redesign "No indication of current page"; W "Icons have labels"].
- [ ] **L7** Sticky elements (wallet banner, page header, table header) must not cover focused elements. Budget the total sticky chrome at 96 px or less at 900 px viewport height [W].
- [ ] **L8** Optical alignment: icons next to text 1-2 px optical nudges; align table numerals right; align buttons in card groups to the bottom [W; T redesign].
- [ ] **L9** No horizontal page scroll. Wide tables scroll within their own container, with the first column sticky and a visible edge fade [W "No excessive scrollbars"].

### 3.2 Typography

- [ ] **T1** Two families only: one UI sans and one mono [T; D]. The practical choice is to keep **Hanken Grotesk** (already the `--font-sans` token) or switch to **Geist**. Keep **JetBrains Mono** strictly for phone numbers, IDs, timers, durations, code and API keys. Remove Sora, Instrument Serif, Syne and Rajdhani and the unused registrations [sibling report: 12 families registered, 5 rendered]. Add **Noto Sans Devanagari** (not Serif) as a fallback for Hindi transcripts [V].
- [ ] **T2** Fix the root font variable so the UI never falls back to `ui-sans-serif`/Segoe UI [sibling report finding; W "Preload fonts"].
- [ ] **T3** App type scale (px, size/line-height, weight, tracking):
  - caption 12/16 (400)
  - small 13/18 (400/500), for tables and meta
  - **body 14/20 (400)**, the app default
  - body-lg 16/24 (400)
  - title-sm 16/24 (600)
  - title 20/28 (600, -0.2)
  - page-title 24/32 (600, -0.4)
  - display (marketing only) 32/40 (-0.8), 48/52 (-1.8), 64/68 (-2.6)
  - Weights 400/500/600 only; **600 ceiling** [D Linear, Vercel, Cal].
- [ ] **T4** Negative tracking only at 20 px and above. Body at 0. Never positive tracking on body. No letter-spacing wider than +0.02em except for rare all-caps 11 px table headers [D].
- [ ] **T5** No all-caps + mono + wide-tracking labels on every field, card or section. Use sentence case field labels at 13/500 in a secondary colour. Keep caps for at most table column headers or one status badge style [T eyebrow restraint; D Intercom "Don't write all-caps tracked eyebrows"; T redesign "All-caps subheaders everywhere"].
- [ ] **T6** `font-variant-numeric: tabular-nums` on every number that updates or is compared: timers, durations, counts, INR, latency, percentages, table numeric columns [W; D Stripe `tnum`].
- [ ] **T7** Body line-height 1.5 for UI and 1.6 for long text (transcripts, knowledge). Allow about 1.7 for Devanagari to fit matras [D Sentry "functional UI copy 1.5"; V].
- [ ] **T8** Measure: paragraphs no wider than about 65-75 ch (Knowledge, Assistant replies, docs) [T; redesign].
- [ ] **T9** `text-wrap: balance` on headings and `pretty` on short paragraphs; no widows in empty-state copy [W].
- [ ] **T10** Use the `…` character and curly quotes; `&nbsp;` between number and unit (`90&nbsp;s`, `₹&nbsp;` handled by Intl) [W].

### 3.3 Colour

- [ ] **C1** One neutral family (cool zinc or neutral; never mix warm and cool grays) [T]. See the token proposal in section 4.
- [ ] **C2** **One accent.** The candidate is Vaani brand blue/indigo, used for primary CTA, focus ring, selection, links and the active nav item. Remove purple from Meeting Agent, green from ACTIVATE (it is a primary action, not a success state), and teal from Import CSV [T colour lock; D all].
- [ ] **C3** Semantic colours only for state: success (connected/live, completed), warning (low balance, ringing, pending), danger (failed, negative sentiment, destructive), info (= accent). Each with a soft background, a text colour of AA or better on that background, and an icon [W "Redundant status cues"; D Vercel soft/deep pairs].
- [ ] **C4** Status text must pass AA on its own badge background. Starter pairs (computed): blue #1e40af on #dbeafe = 7.15:1; green #166534 on #dcfce7 = 6.49:1; red #991b1b on #fee2e2 = 6.80:1; amber #92400e on #fef3c7 = 6.37:1.
- [ ] **C5** Primary button contrast: white on #2563eb = 5.17:1 (passes), white on #1d4ed8 = 6.70:1. **White on green-600 #16a34a = 3.30:1 fails.** If ACTIVATE stays green, use #15803d (5.02:1). Black on #2563eb = 4.06:1 fails. The sibling report measured the existing `.btn-saffron` black-on-blue at 3.83:1.
- [ ] **C6** No pure #000 or #fff canvas in dark mode (use #0a0a0b-ish and #f4f4f5 text); no neon glows; no gradient text in the app; no AI purple-blue gradient backgrounds [T AI tells, LILA rule; D Linear "No atmospheric gradients"].
- [ ] **C7** Chart palette: colour-blind-safe, 5-6 hues max, kept separate from brand chrome (Intercom's "report palette" pattern). Sentiment uses icon + label + colour [W "Accessible charts"; D].
- [ ] **C8** On tinted surfaces (the wallet banner, selected rows), tint borders and text toward the same hue [W "Hue consistency"].
- [ ] **C9** Do not copy reference grays blindly. Vercel's mute #888 on white is only 3.54:1 and Linear's tertiary #62666d on its canvas is 3.62:1; both are fine only for disabled or decorative text. For readable secondary text on white use #737373 (4.74:1) or darker. On #0a0a0b use #8b8b93 (5.85:1), not #71717a (4.09:1).

### 3.4 Spacing and density

- [ ] **S1** 4 px base with steps 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 [D].
- [ ] **S2** Control heights: 32 px (compact: toolbars, table actions), 36 px (default), 40 px (primary forms), 44 px minimum on touch [W; D Vercel 32/40/48].
- [ ] **S3** Table rows 44 px default, 36 px compact; cell padding 12-16 px horizontal. Leads rows currently look about 65 px tall at 1440 wide [screenshot], which is low density for a CRM.
- [ ] **S4** Card or panel padding 16-20 px in the app (24 px maximum). Marketing cards 24-32 px [D Raycast "Don't pad cards with 32px+"; Linear 24].
- [ ] **S5** Dial reading for the app: VISUAL_DENSITY 6-7. Dense where users scan and compare (Leads, Call Reports, Analytics tables); calmer on setup forms (Settings, Billing) [T; D Sentry].

### 3.5 Components

- [ ] **K1** Buttons: one filled primary per view region; secondary = neutral surface + 1 px border; tertiary = ghost; destructive = danger text or border that fills only in the confirm dialog. Radius 6-8 px, label 14/500, padding 8x14 px, icon 16 px with 6-8 px gap. Labels fit on one line at desktop [T wrap ban, duplicate CTA; D].
- [ ] **K2** A disabled button explains why, either with inline helper text or a tooltip on a wrapper, since disabled buttons do not receive focus. Example: "Top up your wallet to place calls" [W "No dead ends"; V].
- [ ] **K3** Inputs: label above at 13/500; help text below at 12-13; error below in danger colour with an icon; 1 px border (strong gray); focus = 2 px accent ring with 2 px offset; placeholder as an example ending in `…`; no field-per-card boxes [T 4.6; W; D Linear/Vercel].
- [ ] **K4** Segmented controls and tabs: pill or 6 px track with a selected surface lift (Linear pricing tabs). Deep-link the selected tab [W; D].
- [ ] **K5** Badges: 12/500, 2x8 px padding, pill or 4 px radius, semantic soft background. **At most one badge style per table cell.** No decorative dots unless they are live state [T "ZERO decorative status dots"].
- [ ] **K6** Tables: sticky header (13/500 secondary, sentence case, or 11-12 px caps with +0.02em); right-aligned numerals with tabular-nums; truncation with a full-text tooltip; row hover; checkbox column hit target of 24 px or more; column chooser for dynamic flow-field columns; empty cell shown as blank or a muted "Not captured", not a row of dashes [W; V].
- [ ] **K7** Keyboard hints as `<kbd>` keycaps (1 px border, 4 px radius, mono 11-12 px) in tooltips, menus and a `?` shortcut sheet, not as a permanent strip [T minimalist; D Raycast keycaps].
- [ ] **K8** Avatars: 24/32 px, one shape; initials in the neutral surface colour, not the accent [D ElevenLabs voice-row; T].
- [ ] **K9** Overlays: side sheets or inspectors for editing records (lead, node, call detail); modals only for confirmation and short creation. `overscroll-behavior: contain`; focus trap; Esc closes; focus returns to the trigger [T redesign "Modals for everything"; W].
- [ ] **K10** Toasts for transient success only ("Lead saved" with Undo). Persistent problems (wallet empty, number not allocated) belong inline where they block a task [T 4.5; W].
- [ ] **K11** Icons: one family with one stroke width (1.5 at 16/20 px) and one size scale (16 in controls, 20 in nav) [T 3.C]. Swapping Lucide is optional; consistency is the requirement.
- [ ] **K12** z-index scale: base 0, sticky 10, dropdown 20, sticky-banner 30, overlay 40, modal 50, toast 60, tooltip 70. No 9999 [T 6.F; redesign].

### 3.6 Forms

- [ ] **F1** Labels everywhere, clickable; `autocomplete` and `name`; correct `type`/`inputmode`. Phone uses `type="tel" inputmode="tel" autocomplete="tel"`; email uses `type="email"` with `spellcheck=false`; OTP uses `autocomplete="one-time-code"` [W].
- [ ] **F2** Never block paste or typing; validate and explain instead. Trim whitespace [W].
- [ ] **F3** Submit stays enabled until clicked, then shows a spinner and keeps its label ("Placing call…", "Saving…"). Use idempotency keys for call placement and payments [W].
- [ ] **F4** On submit, focus the first error; announce errors with `aria-live="polite"` [W].
- [ ] **F5** Warn before leaving with unsaved changes (Flow Builder, Settings, Customer Intel) [W].
- [ ] **F6** Style native selects for dark mode on Windows [W].
- [ ] **F7** Mobile inputs 16 px or larger [W].

### 3.7 Feedback states

- [ ] **Q1** Every data view ships empty, sparse, dense, loading, error and permission-denied states [W; T].
- [ ] **Q2** Empty state = one sentence of what this is + the primary next action + an optional secondary link to docs. No big illustrations and no poetic copy. Example for Transcript Feed: "Transcripts appear here once a call connects." rather than "Awaiting connection" [W "No dead ends"; T copy audit].
- [ ] **Q3** Skeletons mirror the final layout; show-delay 150-300 ms and minimum visible 300-500 ms; no generic centre spinners for page loads [W; T].
- [ ] **Q4** Errors state what happened + how to fix + an action. Example: "Couldn't place the call. Your wallet balance is ₹0. Top up to continue." [W copy].
- [ ] **Q5** Optimistic UI for low-risk actions (lead status change) with rollback. Undo for deletes; confirmation for irreversible actions (activate a flow that dials, delete an agent, export data) [W].
- [ ] **Q6** Live regions: call status changes, transcript final turns (throttled) and toasts are polite. Do not announce every streaming partial [W; V].

### 3.8 Motion

- [ ] **M1** App motion budget: 100-150 ms for hover and press, 150-200 ms for menus and popovers, 200-250 ms for sheets and drawers. Nothing over 300 ms in the app [inferred from D and W necessity; T dial 2-3].
- [ ] **M2** Easing: enter/exit `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo, from taste-skill minimalist); drawers `cubic-bezier(0.32, 0.72, 0, 1)` (from soft-skill); never linear for UI [T].
- [ ] **M3** Animate transform and opacity only; never `transition: all`; list properties explicitly [W; T].
- [ ] **M4** `prefers-reduced-motion`: disable idle loops (the STANDBY radial on Cockpit, marketing waves and orbs), keep instant state changes [W; T 6.B].
- [ ] **M5** No autoplay loops over 5 s without pause or hide; no perpetual pulses on idle UI. A pulse is allowed only on a genuinely live indicator (call connected, recording) [W; T].
- [ ] **M6** Canvas: pan and zoom via transform; node drag with `inert` on siblings and text selection disabled; edge re-routing without layout thrash [W].

### 3.9 Accessibility

- [ ] **A1** Visible `:focus-visible` ring on every interactive element: 2 px accent + 2 px offset, at least 3:1 against adjacent colours. Never `outline:none` without a replacement [W]. The sibling report notes `.btn-saffron` has no `:focus-visible`.
- [ ] **A2** Icon-only buttons have `aria-label` and a tooltip; decorative icons `aria-hidden` [W].
- [ ] **A3** Text contrast AA or better (4.5:1 small, 3:1 large and non-text UI). Placeholders and helper text included [T Form Contrast Check; W prefers APCA].
- [ ] **A4** Colour is never the only cue (sentiment, status, flow validation, latency) [W].
- [ ] **A5** Headings hierarchy, skip link, landmarks (`nav`, `main`, `aside`); accurate `<title>` per route [W].
- [ ] **A6** Hit targets 24 px or more (44 px on touch); matching visual and hit areas on flow ports, table checkboxes and the sidebar [W].
- [ ] **A7** Media: call recordings have transcripts; the player is keyboard operable (Space, ←/→ ±5 s, speed); meeting captions [W "Accessible media"].
- [ ] **A8** Canvas accessibility: a list/outline view of flow steps as an alternative to spatial editing; nodes focusable with arrow-key navigation [W gestures alternatives; V].
- [ ] **A9** `translate="no"` on "Vaani", "Vikash", flow names and IDs [W].

### 3.10 Responsive

- [ ] **R1** Breakpoints: 640 / 768 / 1024 / 1280 / 1536 [T 3.E]. Verify at 375, 768, 1024, 1280, 1440 and ultra-wide (50% zoom) [W].
- [ ] **R2** Sidebar becomes a bottom bar or hamburger sheet below 768 px; the wallet banner collapses to a compact chip [D Linear, Vercel collapse; V].
- [ ] **R3** Tables become card lists below 768 px, or keep a sticky first column with horizontal scroll inside the container [W; D].
- [ ] **R4** Flow Builder below 1024 px: read-only viewer with a "Open on a larger screen to edit" message. The palette and inspector become sheets at 1024-1279 [V].
- [ ] **R5** Use `min-height: 100dvh`, never `100vh`, for full-height app shells (iOS URL bar) [T 3.E; redesign].
- [ ] **R6** Safe-area insets for bottom bars [W].

### 3.11 Copy

- [ ] **P1** Plain, specific and active. No "Unleash / Elevate / Seamless / Next-gen" [T; W].
- [ ] **P2** One copy register per page. No poetic kickers in a product UI ("the dispatch from your line", "who is on the line", "how the calls felt") [T "One copy register", "performative-craftsman labels"].
- [ ] **P3** Consistent nouns. Pick one of "Flow / Call flow / Voice journey", "Agent / Assistant", "Room / Meeting". Pick one of "Top up" and "Recharge" and use it everywhere [W "Keep nouns consistent"].
- [ ] **P4** Specific button labels: "Place test call", "Activate flow", "Create meeting room", "Save context" [W].
- [ ] **P5** Case convention, one of the two, applied everywhere. Recommendation: **sentence case** for headings and buttons in the app. This follows Linear, Notion, Stripe, Intercom and taste-skill redesign ("Title Case On Every Header. Use sentence case instead"). WIG prefers Title Case for product buttons; see the conflict note below.
- [ ] **P6** Numerals for counts; a space before units; INR with `Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'})` (₹1,00,000.00 lakh grouping); consistent decimals per context (wallet 2, KPIs 0) [W].
- [ ] **P7** No em-dash in UI strings (taste-skill ban). Use a period, colon or parentheses. Example: "Wallet empty. Top up to keep calls running." [T 9.G].
- [ ] **P8** No exclamation marks in success messages; no "Oops" [T redesign].
- [ ] **P9** Loading copy ends with `…` ("Connecting…", "Transcribing…") [W].

### 3.12 Where the sources disagree, and the recommended resolution

| Topic | Source A | Source B | Resolution for Vaani |
|---|---|---|---|
| Inter | Taste-skill: avoid as default ("Banned" in soft-skill) | Linear, Vercel, Raycast substitutes: Inter is the closest free match; taste-skill allows it for "Linear-style" and accessibility-first | Keep the already-shipped Hanken Grotesk (or Geist). Do not add Inter. Consistency matters more than which font. |
| Button shape | Vercel, Stripe, ElevenLabs: pill CTAs | Linear, Notion, Supabase, Intercom, Cal: 6-8 px rectangles, pills only for tabs and status | 6-8 px rectangles in the app; pills only for filter chips, status and avatar groups. Marketing may use pills if it matches the app's radius logic ("Shape consistency lock"). |
| Case | WIG (Vercel house): Title Case headings and buttons | Taste redesign: sentence case; Linear, Stripe, Intercom sentence case | Sentence case everywhere. |
| Em-dash | Taste-skill: total ban | Vercel and others use em-dashes in copy | Ban in UI chrome (buttons, labels, banners, empty states). Allowed in long-form docs and blog. |
| Glass, gradients, orbs | Soft-skill and gpt-taste push glass, double-bezel, mesh | Taste-skill main: glass "Inappropriate for dashboards"; Linear, Supabase, Intercom: no atmospheric gradients | None in the app. On marketing, at most one restrained atmospheric element in the hero, and real product screenshots do the rest. |
| Mono labels | Vercel uses mono eyebrows on marketing | Intercom, Linear: no mono on chrome; taste: eyebrow restraint | Mono only for data tokens (IDs, phone, timers, code). No mono section labels in the app. |
| Motion on scroll | Minimalist, soft: scroll-reveals on everything | WIG: only when it clarifies cause and effect; taste dial 2-3 for product UI | No scroll-reveal in the app; marketing only, reduced-motion safe. |

---

## 4. Proposed Vaani starter tokens

These are derived from the references, not taken from any one brand. Every text pairing listed has been contrast-checked (values in parentheses).

**Light theme**

```
--canvas          #fafafa   (page)
--surface         #ffffff   (panels, cards, inputs)
--surface-2       #f5f5f5   (inset, hover rows, code)
--surface-3       #efefef   (pressed, selected neutral)
--border          rgba(0,0,0,0.08)  ~ #ebebeb on white (hairline, decorative only)
--border-strong   #d4d4d4   (input borders; pair with 2px focus ring for 3:1 non-text)
--text            #171717   (17.93:1 on #fff)
--text-secondary  #525252   (7.81:1 on #fff; 7.49:1 on #fafafa)
--text-muted      #737373   (4.74:1 on #fff; 4.54:1 on #fafafa) -> minimum for readable meta
--text-disabled   #a3a3a3   (2.52:1, disabled only)
--accent          #2563eb   (white label 5.17:1)  | --accent-hover #1d4ed8 (6.70:1)
--accent-soft     #eff6ff   with --accent-text #1d4ed8 (6.16:1)
--success  bg #dcfce7 / text #166534 (6.49:1) | solid #15803d (white 5.02:1)
--warning  bg #fef3c7 / text #92400e (6.37:1) | solid #b45309 text-on-white 5.02:1
--danger   bg #fee2e2 / text #991b1b (6.80:1) | solid #b91c1c (white 6.47:1)
```

**Dark theme**, a surface ladder with no shadows (Linear and Raycast model):

```
--canvas #0a0a0b | --surface #111113 | --surface-2 #18181b | --surface-3 #1f1f23
--border #26262b | --border-strong #3a3a40
--text #f4f4f5 (18.0:1) | --text-secondary #a1a1aa (7.72:1 on canvas; 6.91:1 on #18181b)
--text-muted #8b8b93 (5.85:1 on canvas; 5.24:1 on #18181b)   [NOT #71717a = 4.09:1]
--accent #3b82f6 (5.38:1 as text on canvas) / #60a5fa for links (7.78:1)
--success #4ade80 (11.36:1) | --warning #fbbf24 (11.85:1) | --danger #f87171 (7.15:1)
```

**Radius:** `--r-xs 4` (keycaps, badges), `--r-sm 6` (buttons, inputs), `--r-md 8` (menus, small cards, nodes), `--r-lg 12` (panels, cards), `--r-xl 16` (modals, large containers), `--r-full` (avatars, status pills, filter chips). Nested elements are concentric: child = parent - padding.

**Elevation (light only; dark uses the surface ladder):**

```
--e0: none + 1px border
--e1: 0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)                  (cards on hover, nodes)
--e2: 0 0 0 1px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.02), 0 4px 8px -2px rgba(0,0,0,.06)   (popovers, selected node)
--e3: 0 0 0 1px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.02), 0 8px 16px -4px rgba(0,0,0,.08), 0 24px 32px -8px rgba(0,0,0,.10)   (modals, sheets)
```

These are adapted from the Vercel stacked-shadow levels. Optional: tint toward the accent hue on tinted surfaces (the Stripe `rgba(0,55,112,…)` idea).

**Spacing:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. **Controls:** 32, 36, 40 (touch 44). **Sidebar:** 56 px collapsed, 232-248 px expanded. **Page header:** 56-64 px. **Table row:** 44 px (36 compact).

**Type:** see T3. Weights 400/500/600. Mono 12-13 px for tokens.

**Motion:** `--dur-1 120ms` (hover, press), `--dur-2 180ms` (menus), `--dur-3 240ms` (sheets). `--ease-out cubic-bezier(0.16,1,0.3,1)`, `--ease-drawer cubic-bezier(0.32,0.72,0,1)`.

**Focus:** `outline: 2px solid var(--accent); outline-offset: 2px` (`:focus-visible`).

**z-index:** 0 / 10 sticky / 20 dropdown / 30 banner / 40 overlay / 50 modal / 60 toast / 70 tooltip.

---

## 5. Anti-patterns to avoid (generic AI aesthetics)

The list is drawn from taste-skill 9.A-9.G, redesign-skill, image-to-code, minimalist and the DESIGN.md Don'ts. Items marked **(seen)** were visible in the Vaani scout screenshots.

1. **AI purple/blue gradients and gradient text.** Seen on the marketing hero: "handle every call." in a purple-to-blue gradient over a violet glow orb [scout_home.png]. Taste LILA rule; Linear "No atmospheric gradients".
2. **Neon glows and orbs.** Seen: the hero orb and wave lines; the ACTIVATE button has a green glow/shadow halo [scout_flow-builder.png].
3. **Glassmorphism stacked without reason, and "floating blobs everywhere".** Image-to-code.
4. **Mono uppercase wide-tracked labels on everything (HUD or "pseudo-enterprise control labels").** Seen on Dashboard: "CUSTOMER INTEL", "CUSTOMER NAME", "PHONE NUMBER", "EMAIL ADDRESS", "COMPANY / ORGANIZATION", "LOCATION", "LANGUAGE", "SENTIMENT", "DURATION", "PREV. CALLS", "SAVE CONTEXT", "TRANSCRIPT FEED", "STANDBY", "LAT: 0ms", "SESSION: IDLE"; on Leads the title "LEADS", KPI labels, filter chips and "SHORTCUTS"; on Analytics "ANALYTICS", "OPERATOR", "ALLOCATED DID", "TOTAL CALLS".
5. **Section-number eyebrows and performative kicker copy.** Seen on Analytics: "§ 01 Identity — who is on the line", "§ 02 Headline — this past week, in numerals", "§ 03 Sentiment — how the calls felt", subtitle "the dispatch from your line", with HUD corner brackets around the identity card [scout_analytics.png].
6. **A decorative serif in a dashboard.** Seen: the Instrument Serif italic "not allocated yet" and "Allocate a number from billing to start receiving calls." [scout_analytics.png; sibling report].
7. **Decorative status dots on titles and labels.** Seen: a green dot before "Canvas" and "FLOW VALIDATED", a dot before "CUSTOMER INTEL" and "TRANSCRIPT FEED", a dot before "LIVE ·" on marketing. Keep dots only for actual live state (call connected, room live).
8. **Too many pills and micro-badges.** Seen: Leads source chips "F FACEBOOK", "IG INSTAGRAM", "G GOOGLE", "{} API" with letter pseudo-icons; Call Reports rows each show three badges (BROWSER, COMPLETED, NEUTRAL); the hero trust micro-strip of four pills under the CTAs, which taste-skill hero rules ban.
9. **Box-in-box nesting.** Seen: each Dashboard field is a bordered box inside a bordered card inside a panel [scout_dashboard.png].
10. **Multiple accents.** Seen: blue primary, green ACTIVATE, purple Meeting Agent, teal Import CSV, orange and yellow node categories [screenshots].
11. **Idle decorative animation.** Seen: the Dashboard STANDBY radial ticks occupy the centre of the page while idle (motion not confirmed from a still).
12. **Em-dash separators in chrome.** Seen: "Wallet empty — top up now to keep calls flowing.", "Meeting Agent — Vikash", "Describe what you need — I plan, then act on your data.", "— who is on the line".
13. **Placeholder-as-label, placeholder-only phone field.** Seen: the Dashboard phone input shows only "+91..." with no visible label [scout_dashboard.png].
14. Also avoid: fake-precise numbers, Jane-Doe data, rocket and shield clichés, three equal feature cards, modals for everything, spinner-only loading, "Oops!", exclamation success messages, `transition: all`, 9999 z-index, and custom cursors.

---

## 6. Implications for a voice-AI calling product

These implications are derived from the principles above and fitted to the product. The "Why" line gives the source.

1. **One call-state model shared by Cockpit, Rep Console, Call Reports and the Flow test panel.**
   - States: `Idle → Dialing → Ringing → Connected (Live) → Wrap-up → Ended | No answer | Busy | Failed | Voicemail`.
   - Each state gets a label, an icon, a semantic colour (neutral / amber / green / neutral / red) and a polite `aria-live` announcement.
   - Only Live gets a pulse, and it is disabled under reduced motion.
   - Why: WIG redundant cues and announcing async updates; taste "decorative dots only for real state".
2. **Timers and latency.**
   - Durations in mono or tabular (`01:27`).
   - Latency shown with a qualitative label ("Good · 180 ms", "Slow · 900 ms") rather than a bare "LAT: 0ms" or "22ms" in the sidebar.
   - Show latency only during a call or on a status page. When idle, "0ms" is meaningless.
   - Why: image-to-code "filler status microcopy"; W.
3. **Transcript as the primary live surface.**
   - Speaker-labelled turns (Agent: Vaani, Customer name) with `mm:ss` timestamps and a per-turn language tag (HI/EN).
   - Streaming partial text in the muted colour, resolving to the final text colour.
   - Auto-scroll that pauses when the user scrolls up, with a "Jump to latest" button.
   - Copy and search controls. Devanagari font fallback with line-height of about 1.7.
   - Throttled polite live region announcing final turns only.
   - The empty state explains what will appear.
   - Why: WIG content resilience, live regions, accessible media.
4. **Audio visualisation is functional, not decorative.**
   - A level meter or waveform driven by real input or output audio.
   - Static when idle and under `prefers-reduced-motion`.
   - It should not be the largest element on the page.
   - Why: T "motion must be motivated"; W reduced motion and 5 s autoplay.
5. **Pre-call checklist over a decorative centre stage.** Cockpit gets a compact "Ready to call" card:
   - contact, number (`type="tel"`, `+91` prefix, E.164 validation, formatted display `+91 98765 43210`)
   - flow (name + version + "Up to date")
   - agent voice (the ElevenLabs voice-row pattern: 32 px avatar + name + language/accent + ▶ preview)
   - wallet check
   - one primary "Place call" and a secondary "Test in browser"

   Disabled reasons shown inline. Why: K1, K2, F1.
6. **Wallet and billing.**
   - One compact, semantic warning (amber, not brand blue) that appears where calling is blocked and as a small persistent header chip ("₹0 · Top up").
   - It should not be a full-width bar pushing every page down.
   - Money via `Intl.NumberFormat('en-IN', {style:'currency',currency:'INR'})`, with consistent decimals.
   - UPI autopay copy states the exact amount and cadence.
   - Why: W sticky elements, locale formats, consistent currency.
7. **Sentiment and outcomes.** Icon + label + colour (positive / neutral / negative), with the score shown as a number with tabular figures and a small bar. On Call Reports, collapse Type, Status and Sentiment into one "Outcome" cell to reduce badge noise. Why: W redundant cues; image-to-code "tiny badges everywhere".
8. **Recordings.** Player with Space and arrow-key control, playback speed 1x/1.25x/1.5x/2x, and transcript sync highlighting. Downloading requires explicit action; export respects masking. Why: W accessible media.
9. **PII masking.** Phone masking uses one format everywhere (for example `+91 ••••• 0319`). "Reveal" is an explicit, logged action (tie to Activity and Audit). This is an inferred product requirement.
10. **Compliance cues** (inferred for Indian outbound calling). Recording-disclosure indicator during live calls; calling-hours and DND awareness surfaced at campaign or flow activation. Confirm with the product owner.
11. **Multilingual UI.** `lang` attributes on transcript turns, `translate="no"` on agent names, and `Accept-Language`-based locale detection (not IP). Why: W.
12. **Analytics.**
    - KPIs with a comparison period in words ("+200% vs previous 7 days").
    - Tabular numbers.
    - Sparklines only when there are at least N data points; otherwise show "Not enough data yet".
    - Colour-blind-safe chart palette separate from brand chrome.
    - Chart empty and error states.
    - Why: W, D Intercom report palette, T fake-precise numbers.
13. **Assistant (plans and acts on data).**
    - Show plan steps with explicit confirmation before side-effectful actions: activate flow, place call, bulk-edit leads.
    - Streaming states end with `…`.
    - Composer: Enter sends, Shift+Enter adds a new line (or Cmd/Ctrl+Enter per WIG textarea guidance; pick one and show the hint).
    - The Plan & Actions panel's empty state is fine as is. Keep the prompt suggestions as plain, specific verbs.
    - Why: W forms and confirm destructive actions.

---

## 7. Implications for the node-based flow designer

1. **Canvas surface.** A neutral dotted grid (1 px dots every 16-24 px at about 6-8% ink) on `--canvas`. No hatch or noise textures. Snap to 8 or 16 px.
2. **Node anatomy** (fixed width 240-280 px):
   - header row: 20-24 px category icon tile (tinted soft background, the only place category colour appears) + node type in 12 px secondary + title in 14/500
   - body: 2-3 line clamp preview of the prompt or script
   - footer: labelled output ports (Yes/No, True/False, custom branches) as text chips
   - style: 1 px border, 8-10 px radius, `--e1`
   - Why: D radius and elevation; T "one accent"; W truncation with `line-clamp`.
3. **Node states.**
   - Hover: border-strong.
   - Selected: 2 px accent ring (outline, offset 2) plus `--e2`. No glow.
   - Error: danger border + badge with issue count + inline message in the inspector.
   - Warning: amber.
   - Disabled or unreachable: 50% opacity with a "Not connected" note.
   - Running during a test call: accent left-stripe plus a "Live" chip, with path tracing along the edges. This is voice-specific.
4. **Ports and edges.**
   - Ports: 10-12 px visible, 24 px hit area, with a hover affordance.
   - Edges: 1.5 px neutral stroke; accent on hover or selection; labels for conditions.
   - Dashed only for one semantic meaning (fallback, else, or async), documented in a legend.
   - Why: W hit targets; T "Motion and style motivated".
5. **No overlaps.**
   - "Tidy up" auto-layout (top-down, ELK or dagre-style) and collision avoidance on drop.
   - The screenshot shows "Knowledge Lookup" overlapping "Confirm Interest" [scout_flow-builder.png].
   - Why: W "Deliberate alignment"; T "Mathematically perfect padding".
6. **Palette (left).**
   - A single-column list: icon + full name + one-line description. Search at the top, with `/` to focus.
   - Grouped categories (Conversation, Logic, Actions, Knowledge & CRM, Hand-off), collapsible.
   - Click-to-add, which inserts after the selected node, as the keyboard and touch alternative to drag.
   - Labels never truncated. The screenshot shows "Knowle…", "CRM Lo…", "WhatsA…", "Human …" and "Book Me…" at 1440 px [scout_flow-builder.png].
   - Why: W gestures alternatives and content handling.
7. **Inspector (right, 320-400 px).**
   - Node configuration, validation messages and test data live here; no modals for editing.
   - Changes autosave to a draft with visible status.
   - Why: T redesign "Modals for everything".
8. **Toolbar hierarchy.**
   - Left: flow name + version picker + save status text ("Draft · Saved 12:04", "Unsaved changes").
   - Centre: undo, redo, tidy, zoom (icon buttons with `aria-label`, tooltips, shortcut hints).
   - Right: "Test" (secondary), then **one** primary, "Activate" or "Publish", which opens a confirmation summarising version, target (number, agent) and impact. Private or Share sit in an overflow menu.
   - The current toolbar has two filled primaries side by side (blue "Save" and green glowing "ACTIVATE") plus a tinted "AI draft" [scout_flow-builder.png].
   - Why: T No Duplicate CTA and one filled button; W confirm.
9. **Validation.**
   - A persistent "Issues (n)" button opens a list; clicking an issue focuses and centres its node.
   - "Flow validated" becomes quiet status text in the toolbar, not a floating pill on the canvas.
   - Why: W "No dead ends"; image-to-code "decorative system markers".
10. **Keyboard.**
    - Tab into canvas, arrows move between connected nodes, Enter opens the inspector, Delete removes with an Undo toast.
    - Cmd/Ctrl+Z / Shift+Z undo and redo; Cmd/Ctrl+D duplicate; `?` opens the shortcut sheet with `<kbd>` keycaps.
    - Also provide an outline (list) view of steps for screen-reader users.
    - Why: W keyboard everywhere and gestures alternatives.
11. **Minimap and zoom.**
    - Minimap: neutral node rectangles (not category colours), accent viewport frame, toggleable, hidden below 1280 px.
    - Zoom controls show the zoom % and "Fit".
    - The current minimap uses saturated category blocks [scout_flow-builder.png].
12. **URL state.** `?node=<id>&v=<version>` deep-links the selection and version; viewport is optional. Back and Forward restore it. Why: W deep-link everything.
13. **Unsaved-change guard** with `beforeunload` and a router guard. Autosave drafts with conflict detection if several people can edit. Why: W.
14. **Performance.**
    - Render only visible nodes for large graphs.
    - Transform-based pan and zoom.
    - No `getBoundingClientRect` in render.
    - `inert` and `user-select:none` while dragging.
    - Keep POST/PATCH under 500 ms with optimistic node moves.
    - Why: W performance.
15. **AI draft.** Present as a secondary action that opens a side sheet with a prompt → preview diff (added, changed and removed nodes highlighted) → "Apply" and "Discard". Never mutate the canvas silently. Why: W optimistic plus undo; the assistant pattern.
16. **Test mode.** "Test call" runs in a docked bottom panel with the live transcript. The canvas highlights the current node and traversed edges, and extracted variables appear in the inspector. This ties the flow builder to the voice product's core value.

---

## 8. Marketing site implications (brief)

- Hero: headline of 2 lines max; subtext of 20 words max (current: about 36 words [scout_home.png]); 1 primary + 1 secondary CTA; one small element max. Move the trust pills ("Sub-second response", "Enterprise grade security", "40+ languages") to a section below [T hero stack discipline].
- Replace the gradient text and orb with a real product visual: the flow canvas or a live transcript card. Every DESIGN.md example leads with real UI ("Product UI screenshots dominate", Linear).
- Keep the one-accent rule consistent with the app. Today marketing uses violet CTAs ("Get started", "Start free") while the app uses blue [screenshots]: two brands in one product.
- The eyebrow "LIVE · AGENTS ANSWERING IN 40+ LANGUAGES" with a status dot and wide tracking combines three taste-skill tells (decorative dot, eyebrow, middle-dot). Drop it or turn it into a plain sentence.

---

## 9. Findings from the scout screenshots, mapped to the rules

All evidence below is from orchestrator scout screenshots (1440x900) taken in this audit session. Nothing was re-checked live, because this agent had no browser. Sibling agents measure these in depth.

**DESIGN-RESEARCH-01: Four or more visual dialects across app pages; no single system (high)**
- Evidence:
  - [scout_dashboard.png] and [scout_leads.png]: mono uppercase letter-spaced HUD labels ("AGENT COCKPIT", "CUSTOMER INTEL", "LEADS", "SHORTCUTS").
  - [scout_analytics.png]: editorial dialect with "§ 01"-style numerals, serif-italic kickers ("— who is on the line"), a wide-tracked "ANALYTICS" title and HUD corner brackets.
  - [scout_meeting-agent.png]: purple accent (filled "Conversation flow" segment, "Create Room" button, violet "— Vikash" in the title).
  - [scout_call-reports.png] and [scout_assistant.png]: plain sans with sentence case ("Call Reports", "Assistant").
  - Page-header anatomy differs on each page: icon tile vs none, uppercase vs title case, subtitle style.
- Rules: L1, T1, T5, C2, P2; taste "One system per project", colour and shape locks; DESIGN.md consensus.
- Recommendation: adopt one token set (section 4) and one page-header component (icon optional, 24/32 600 title, 14/20 secondary description, action area right). Remove the page-specific styles. Call Reports and Assistant are the closest to the target and a good baseline.

**DESIGN-RESEARCH-02: Accent colour proliferation; primary actions do not share one colour (high)**
- Evidence:
  - Blue filled buttons (Save, CONNECT, Top up, NEW LEAD, Export CSV).
  - Green filled ACTIVATE with glow [scout_flow-builder.png].
  - Purple Create Room [scout_meeting-agent.png].
  - Teal-tinted IMPORT CSV [scout_leads.png].
  - Violet marketing CTAs [scout_home.png].
  - Blue-tinted wallet warning banner using the brand blue rather than a warning hue [all app screenshots].
- Rules: C2, C3, K1; taste "Max 1 accent", LILA rule; Linear, Supabase, Stripe single-accent discipline.
- Recommendation: one accent for primary CTAs, focus and selection; semantic amber for the wallet warning; ACTIVATE becomes the single accent primary (or #15803d if green is kept deliberately as "go live", but then Save must not also be filled).

**DESIGN-RESEARCH-03: Two filled primary buttons in the Flow Builder toolbar (medium)**
- Evidence: "Save" (blue filled) and "ACTIVATE" (green filled with a glow shadow) are adjacent. "AI draft" is also tinted, next to 10+ icon buttons [scout_flow-builder.png].
- Rules: K1; taste "No Duplicate CTA Intent", single primary per region (Stripe "one filled button per band").
- Recommendation: autosave drafts with status text; Save becomes a secondary or implicit action; Activate is the only filled primary and opens a confirmation summary; less-used icons go into an overflow menu.

**DESIGN-RESEARCH-04: Flow canvas nodes overlap, and palette labels truncate at 1440 px (medium)**
- Evidence: the "Knowledge Lookup" node overlaps "Confirm Interest". Palette tiles read "Knowle…", "CRM Lo…", "WhatsA…", "Human …", "Book Me…", "Human Han…", "Verify Cu…" [scout_flow-builder.png].
- Rules: section 7 items 5-6; WIG content handling; "Deliberate alignment".
- Recommendation: collision-free auto-layout and snap; a single-column palette list with full names and descriptions (or a 2-column grid with a min-width of about 150 px per tile and 2-line wrap).

**DESIGN-RESEARCH-05: Micro-label and eyebrow overload on every field (medium)**
- Evidence: Dashboard has 7 field labels in 9-10 px uppercase mono with wide tracking, each inside its own bordered box, plus uppercase section titles and mono buttons ("SAVE CONTEXT"). Leads has uppercase mono on title, KPIs, a shortcut strip and ~15 filter chips [scout_dashboard.png, scout_leads.png].
- Rules: T5, L4, K7; taste "EYEBROW RESTRAINT", image-to-code micro-UI clutter; Intercom "Don't write all-caps tracked eyebrows".
- Recommendation: sentence-case labels at 13/500 secondary colour above plain inputs; remove per-field boxes; move the keyboard-shortcut strip into a `?` sheet and tooltips.

**DESIGN-RESEARCH-06: Editorial and serif styling on Analytics conflicts with product-UI norms (medium)**
- Evidence: "§ 01 / § 02 / § 03" section numbers; kickers "who is on the line", "this past week, in numerals", "how the calls felt", "the dispatch from your line"; serif-italic "not allocated yet" [scout_analytics.png]. The family is Instrument Serif per the sibling report.
- Rules: T1, P2; taste "Serif ... Not for dashboards", "Instrument_Serif ... BANNED as defaults", "NO section-number eyebrows", "performative-craftsman labels".
- Recommendation: plain section headings ("Overview", "Call volume", "Sentiment"); a functional empty-state sentence with an action ("No number allocated. Allocate one in Billing.").

**DESIGN-RESEARCH-07: Cockpit gives the centre stage to an idle decoration; the Test Call button wraps and has low contrast (medium)**
- Evidence: the centre column shows a large STANDBY radial graphic about 310 px in diameter. "Test Call" renders on two lines ("Test / Call") in pale teal on pale teal, beside a label-less "+91..." input [scout_dashboard.png]. The contrast is visually low; its value was not measured.
- Rules: L5, K1 (wrap ban), K2, K3, F1; taste CTA wrap ban and button contrast check.
- Recommendation: a compact pre-call panel (section 6, item 5); a single-line "Place test call" label; a disabled reason shown inline; a labelled phone field.

**DESIGN-RESEARCH-08: The wallet banner is blue, permanent and full-width on every page (medium)**
- Evidence: a 42 px tall blue-tinted bar with warning icon, em-dash copy, filled "Top up", outlined "Enable autopay" and a close icon, on every app screenshot.
- Rules: C3, L7, P7; WIG "Sticky ... banners never cover the focused element", hue consistency.
- Recommendation: amber semantic styling; after dismissal, collapse to a header chip ("₹0 · Top up"); show a blocking inline message only on call-placing surfaces. Whether the close button persists across pages needs live verification by other agents.

**DESIGN-RESEARCH-09: Icon-only sidebar with no visible labels or grouping (medium)**
- Evidence: 12 icon buttons plus status (a green dot and "22ms"), sign-out, theme toggle and expand button, with no text labels at 1440 px [all app screenshots]. Accessible names were not verified.
- Rules: L6, A2; WIG "Icons have labels", "Icon-only buttons are named".
- Recommendation: expanded-by-default labels at ≥1280 px, grouped sections, and a clear active indicator. Remove "22ms" from global chrome or give it a meaning ("Voice latency: good").

**DESIGN-RESEARCH-10: Badge noise and placeholder dashes in Call Reports (low)**
- Evidence: every row has three uppercase pill badges (BROWSER, COMPLETED, NEUTRAL) and dynamic flow-field columns ("Confirm Interest", "Condition Check", "Condition…") filled with "—". The table scrolls horizontally past the viewport [scout_call-reports.png].
- Rules: K5, K6, L9; image-to-code "tiny badges everywhere"; WIG empty handling.
- Recommendation: one Outcome cell (icon + text); channel as a small muted icon; a column chooser for flow fields, hidden when empty; a sticky first column.

**DESIGN-RESEARCH-11: Em-dash used as a separator across UI copy (low)**
- Evidence: "Wallet empty — top up now to keep calls flowing."; "Describe what you need — I plan, then act on your data." [scout_assistant.png]; "Meeting Agent — Vikash" [scout_meeting-agent.png]; "— who is on the line" [scout_analytics.png]; the marketing subhead [scout_home.png].
- Rules: P7; taste 9.G.
- Recommendation: rewrite with periods or colons. For example: "Wallet empty. Top up to keep calls running."; "Meeting agent: Vikash".

**DESIGN-RESEARCH-12: Marketing hero carries AI-template tells (medium)**
- Evidence: gradient headline text; a glowing orb and animated waves; an eyebrow with a status dot, middle-dot and 40+ px tracking; a subtext of about 36 words; a four-pill trust strip inside the hero; violet CTAs that differ from the app's blue [scout_home.png].
- Rules: section 8; taste hero stack discipline, LILA rule, eyebrow restraint, "Hero needs a real visual".
- Recommendation: a 2-line headline in solid ink, 20 words or fewer of subtext, two CTAs, a real product visual (flow canvas or live transcript), and trust items moved to the next section.

---

## 10. Strengths worth preserving (seen in scout screenshots)

- Keyboard-first thinking already exists: Leads documents `/`, `J/K`, `X`, `A`, `C`, `Esc`; the canvas hints "press ? for shortcuts". Keep this, and present it with `<kbd>` keycaps in a `?` sheet [scout_leads.png, scout_flow-builder.png].
- Status is not colour-only on Call Reports: COMPLETED, NEUTRAL and NEGATIVE badges carry icons and text [scout_call-reports.png]. This meets WIG "Redundant status cues".
- Call Reports and Assistant already use a calm sans, sentence case and a clear page header (title + one-line description + right-aligned actions). They are a good baseline for the unified header [scout_call-reports.png, scout_assistant.png].
- PII masking of phone numbers is consistent in lists (`+91••••••0319`) [scout_leads.png, scout_call-reports.png].
- The Assistant empty state has a clear description, concrete verb-led suggestions and a named side panel ("Plan & Actions") with its own empty state [scout_assistant.png].
- The flow canvas has the right primitives in place: minimap, zoom controls, node and link counts, undo and redo, validation state, version selector and "Up to date" save status [scout_flow-builder.png]. The redesign is mostly hierarchy and polish, not missing features.
- The Leads KPI strip already uses a single bordered row with dividers rather than floating cards [scout_leads.png].

---

## 11. Open questions for the redesign owner

1. Brand accent: is Vaani's brand colour blue (app) or violet (marketing and logo gradient)? One must win.
2. Light-first or dark-first product? Every reference picks one default and supports the other with parity (taste 8.C). The scouts show a light app and a dark marketing site.
3. Sentence case or Title Case (WIG vs taste-skill)? This report recommends sentence case.
4. Should "Save" exist at all in Flow Builder, or should drafts autosave and "Activate/Publish" create versions?
5. Who edits flows concurrently? That decides whether conflict UI and presence are needed.
6. Compliance requirements (recording disclosure, calling hours, DND/TRAI) that must surface in the UI (inferred; needs confirmation).
7. Is the sidebar latency ("22ms") meant for customers or for internal operators?
8. Target minimum viewport for Flow Builder editing (proposed: 1024 px).

---

## 12. Sources fetched

- https://www.tasteskill.dev/
- https://github.com/Leonxlnx/taste-skill (README); raw SKILL.md files under `skills/`: `taste-skill`, `minimalist-skill`, `redesign-skill`, `soft-skill`, `gpt-tasteskill`, `output-skill`, `image-to-code-skill`
- https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md
- https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
- https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md
- https://github.com/VoltAgent/awesome-design-md/ (README + tree via the GitHub API)
- https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/{linear.app, vercel, stripe, raycast, notion, supabase, elevenlabs, intercom, cal, sentry, resend, superhuman}/DESIGN.md
