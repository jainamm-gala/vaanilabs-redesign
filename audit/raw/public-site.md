# Vaani Labs: public site and auth audit (signed out)

**Agent:** va-public-site ("Public site & auth auditor, signed out")
**Target:** https://vaanilabs.in (live production). No source code was available.
**Date:** 2026-09-26
**Browser status:** OK for the whole session. There was no logout and no guard timeout. No visible Cloudflare or bot-check challenge appeared. Cloudflare did set a `cf_clearance` cookie silently in the cookie-less context. That usually comes from a non-interactive check. I did not interact with any challenge.
**Screenshots:** `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-public-site/`. No earlier partial draft of this report or folder existed, so everything below comes from this session.

---

## 1. Context and method

- **Isolation.** I worked in a brand-new, cookie-less browser context in its own window, which is what a first-time visitor sees. The signed-in session was never touched. A read-only network guard was active: every non-GET request was aborted, and so were PostHog, OAuth, Razorpay and all websockets. Popups were closed.
- **Pages covered at 1440×900.**
  - Marketing and support: `/` (every section, nav, CTAs, footer, light/dark toggle, "Talk to the agent"), `/pricing`, `/enterprise`, `/security`, `/docs`, `/docs/integrations`, `/docs/api`, `/docs/api/billing`, `/contact`, `/build.html`, `/changelog`, `/about`, `/status`, `/careers`, `/blog`, `/cookies` (text only), and a bogus 404 path.
  - Auth: `/login` (sign-in mode, Magic Link, sign-up toggle), `/signup`, `/forgot-password`.
  - Status check only (via GET fetch): `/privacy`, `/terms`, `/refund-policy`, `/robots.txt`, `/sitemap.xml`, `/api-keys`, `/docs/samples`, `/openapi/v1/vaanivoice.yaml`.
- **Mobile at 390×844.** Home (including the hamburger menu), `/login` and `/pricing`.
- **Evidence gathered:** accessibility snapshots, computed styles, DOM metrics, Navigation/Paint/LCP/CLS performance entries, cookies, console errors, and screenshots that I viewed myself.
- **Validation tests.** I used only empty values and `not-an-email`. No well-formed login, sign-up, reset, contact, pilot or build-my-agent submission was made. While I tested, no auth or form request left the page.
- **Performance caveat.** Numbers come from a lab harness shared with several other agents running at the same time. Treat them as relative, not as field data.
- **Contrast.** Ratios were computed with the WCAG 2.x relative-luminance formula from computed colours. Where a background is semi-transparent, I composited it over the page background.

---

## 2. Executive summary

- **The home page is visually strong.** It has a polished dark hero, an excellent interactive "Hear it work" call demo, India-specific industry use cases and a candid security block.
- **Almost everything behind the home page undermines it:**
  1. **Credibility.** `/about` contains what looks like placeholder or unverifiable content: a named-bank pilot, "$12M Series A", "SOC 2 Type II Certified" and a six-person team that does not match the real founders on `/contact`. `/security` says the company has *not* completed an external audit and SOC 2 is still at readiness stage. The changelog, docs and build page make further, different compliance claims.
  2. **Broken sign-up funnel.** Every "Get started" and "Start free" CTA points to `/signup`, which server-redirects to `/login` in **sign-in** mode ("Welcome Back"). The sign-up switch is a 12px grey mono text button. Once found, sign-up says "Register for early access (admin approval required)". That contradicts "Free tier · No credit card · build your first agent in minutes".
  3. **Pricing is incoherent.** `/pricing` has no prices and no site nav. It is an 18-field "paid pilot" intake form, "sales-led", with an "Email us" address on a third-party domain. Meanwhile `/docs/api/billing` publishes per-second INR prices with "no plans".
  4. **The brand is fragmented.** I counted at least 8 different header treatments, at least 6 font families, violet vs blue primary colours depending on page and theme, dark vs light defaults, and five names for the company or product (Vaani Labs, VaaniLabs, VaaniVoice, VV API, StarVox Labs).
  5. **Claims contradict each other.** Languages are given as 40+, 12+, 10+, "all 22 scheduled" and "every Indian language". Latency is "sub-second" or "sub-200ms". Meetings run on "Zoom/Meet/Teams" or "LiveKit/Daily". OAuth is "Google + Microsoft" or "Google + Meta".
- **Auth screens** are clean but generic. They switch to a light, blue theme that does not match the dark, violet marketing page you arrive from. They also have label, autocomplete and validation-consistency problems.
- **Mobile at 390px** has no horizontal overflow. Only small issues remain: 14px inputs, clipped flow demo, a menu that does not close on Esc, and no nav on `/pricing`.

---

## 3. Page inventory (measured)

| URL | `<title>` | Header variant | Default theme | Fonts seen | `<main>` | DCL / FCP (ms) | Doc height (px) |
|---|---|---|---|---|---|---|---|
| `/` | "Vaani Labs - The Voice AI that speaks India" (generic) | A: full marketing nav (7 links + theme + Log in + Get started) | dark (`html.dark`), violet `#7C6BF5` | Hanken Grotesk, Syne, JetBrains Mono, Sora, system ui-sans | yes | cold 7572 / 3392; warm 1079 / 2184 | 6140 (mobile 9914) |
| `/pricing` | generic | B: logo + "Email us" (mailto, third-party domain). **No nav** | dark | Sora headings, **JetBrains Mono body** | **no** (and no `<nav>`) | 3633 / 2644 | 3789 (mobile 6792) |
| `/enterprise` | "Enterprise Adoption Readiness \| VaaniLabs" | C: own nav (Pilot, Security, API, "Scope pilot") | dark | Sora, JetBrains Mono body, system | yes | 3467 / 3636 | 6361 |
| `/security` | "Security Practices — Vaani Labs" | D: "Back to Home" left + logo tile right | dark | JetBrains Mono body, Sora | no | 990 / 1760 | 4953 |
| `/docs` | generic | D | dark | JetBrains Mono, Sora | no | 1514 / 2244 | 1964 |
| `/docs/integrations` | "Integrations · Vaani Labs Docs" | E: "BACK TO DOCS" (letter-spaced) + centred "INTEGRATIONS · V1" + logo; duplicate "Back to Docs" link | dark | JetBrains Mono, Sora | no | n/a | 2147 |
| `/docs/api` | "Vaani Labs API — Reference" | F: **white strip** "BACK TO DOCS" above a black page, then second header "Vaani Labs \| PUBLIC API · V1" + breadcrumb + blue "GET A KEY" | light shell + forced-dark content | system sans 64/800, **Instrument Serif italic** 22px lead, JetBrains Mono | yes | 1259 | 4375 |
| `/contact` | generic | G: logo + **duplicate "VaaniLabs" wordmark** + "Back to home" right | dark | Hanken, Sora, JetBrains Mono | yes | n/a | 1745 |
| `/build.html` | "Build My Agent" | H: separate static site nav (How it works, Security, Contact, Build your own, ☀, "Sign in", "Get started" → `/login`) with a different logo mark and "VaaniLabs" wordmark | dark | Hanken, **Bricolage Grotesque** | no | 1985 | 1166 |
| `/changelog` | generic | D | dark | JetBrains Mono, Sora | no | n/a | 1717 |
| `/about` | generic | D | dark | JetBrains Mono, Sora | no | n/a | 2838 |
| `/status` | generic | D | dark | JetBrains Mono, Sora | no | n/a | 1776 |
| 404 | generic | none | **light**, blue `#2F5FE0` | Sora, JetBrains Mono | n/a | n/a | 900 |
| `/login`, sign-up mode | generic | I: centred card, "Back to home" above the logo | **light**, blue | Sora, JetBrains Mono, system | n/a | 892 / 1308 | 900 |
| `/forgot-password` | generic | J: logo, "§ ACCOUNT / RECOVERY" card | light, blue | Sora, JetBrains Mono | n/a | n/a | 900 |

- **Console on every Next.js page:** `Minified React error #418` (hydration mismatch). There is also a CSP violation blocking `/cdn-cgi/scripts/.../email-decode.min.js`, and on `/build.html` a CSP block of the Cloudflare Insights beacon.
- **Robots and sitemap:** `/robots.txt` → 404 and `/sitemap.xml` → 404.
- **Legal pages:** `/privacy`, `/terms`, `/refund-policy` and `/cookies` → 200, with their own titles ("… — VaaniLabs").

---

## 4. Page-by-page observations

### 4.1 Home (`/`)

Screenshots: `home_top.png`, `home_full_part0..3.png`, `home_light.png`, `home_light_mid.png`, `home_talk_to_agent.png`, `home_focus_nav.png`.

**Nav**
- Links: Product (`/#capabilities`), Enterprise, Pricing, Docs, Integrations (`/docs/integrations`), Contact, "Build your own" (cyan, `/build.html`), theme button, Log in, and "Get started" (violet pill → `/signup`).
- Nav links are 13px/500 in `#A6ABBD` on `#0C0D12` (8.49:1).
- "Get started" is 12px text, 34px tall, white on `#7C6BF5`, which is **3.98:1** and fails AA for text this size.
- **"Product" is a dead anchor.** `#capabilities` does not exist. Clicking it changes the URL to `/#capabilities` and leaves the page at scrollY 0.

**Hero**
- Eyebrow pill "● LIVE · AGENTS ANSWERING IN 40+ LANGUAGES" is very widely letter-spaced.
- H1 "Voice AI agents that / handle every call." is Hanken Grotesk 72px/600, −1.8px tracking, with a violet→cyan gradient on line 2.
- Sub-copy is 17.5px `#A6ABBD`: "…run your calls, meetings, and support in 40+ languages — natural, sub-second, and enterprise-grade. Deploy to the phone, the browser, or WhatsApp…".
- CTAs: "Start free →" (primary) and "▷ Talk to the agent" (ghost).
- Proof pills: a rotating "Speaking {language}" pill, "Sub-second response", "Enterprise grade security", "40+ languages". During the session the rotating pill showed **Arabic, Indonesian (Bahasa), German, Spanish and Hindi**. For a brand whose `<title>` is "The Voice AI that speaks India", the hero never mentions India.
- **"Talk to the agent" does not start a conversation.** It only scrolls to the pre-recorded demo section ("Hear it work"). The final CTA copy says "Talk to it live right here", but there is no live widget on the page. The real live demo is `/build.html`, labelled only "Build your own".

**"Hear it work"**
- Industry chips (E-commerce, Lending & Collections, Healthcare, Real Estate, Insurance, Education), scenario chips (Order tracking, Return, Refund) and a language toggle (English / हिंदी).
- A transcript card with action chips ("✓ Order found · #ORD-48213", "✓ Tracking link sent · WhatsApp"), "▶ Play call" and a sound toggle, labelled "Real recorded call — turn sound on and press play".
- This is the strongest content on the site.
- Minor: feature icons are emoji (🎯 🔐 🌐). The left column is vertically centred against a taller right column, which leaves a large empty area top-left at 1440px.

**Analytics teaser**
- A mock dashboard labelled "Sample dashboard · illustrative data" is fine.
- In the "3m41s" stat the "m" unit glyph visually collides with the digits.
- "Explore analytics →" goes to an absolute `https://vaanilabs.in/signup`, which lands on sign-in (see §6).

**Flow builder teaser**
- Basic / In-depth toggle and an animated node graph. "Open Flow Builder →" also goes to `/signup`.

**Industries carousel**
- "Built for how India does business / One agent. Every industry's hardest calls." has six cards in the pattern "The problem → Vaani … → ✓ outcome".
- The content is concrete and India-specific (DPD, EMI, RBI data-residency, COD).
- The fourth card is hard-cropped at the container edge. There is no fade or peek treatment.

**Channels**
- Phone / WhatsApp / Browser & meetings, again with emoji-style icons.
- Copy claims "drop the agent into Zoom, Meet, and Teams". The pricing and docs pages say LiveKit / Daily rooms.

**Testimonials**
- Three quotes with initials avatars ("Priya M., dental group, Pune", and so on) and green outcome chips.
- There are no photos, logos, company names or links, so none of them can be verified.
- The role text wraps awkwardly ("Founder · NBFC, / Ahmedabad") because the outcome chip squeezes it.

**Security block**
- "Security that holds up to procurement." with the honest line "SOC 2 Type II readiness is in progress."
- Six line-icon cards and "Read the full security overview →".
- This section uses a narrower container (x≈180–1260) than the rest of the page (x≈154–1286), and a second eyebrow style with a leading hairline rule and about 4px tracking.

**Final CTA**
- "Put a voice agent on every call this week." with Start free / Talk to sales (`/contact`) / View pricing, and "Free tier · No credit card to start · Cancel anytime".

**Footer**
- Logo, tagline "…Built for Indian enterprises.", and "Talk to Sales ↗", which goes to an **external booking site**, whereas "Talk to sales" in the CTA goes to `/contact`.
- `support@vaanilabs.in`, "BKC, Mumbai 400051".
- Four columns: product, company, resources, legal. In the DOM the headings are lowercase, uppercased by CSS.
- "Features" → `/#features` and "Demo" → `/#demo` are **dead anchors** (neither id exists).
- Careers is a "Coming Soon" placeholder.
- Social links: Twitter, LinkedIn, GitHub.
- "● All Systems Operational" appears on every page. I infer it is static.

**Theme toggle**
- The page loads dark (`html.dark`), but the toggle shows a sun icon and `aria-label="Switch to dark mode"`.
- The **first click does nothing visible**: `html` stays `.dark` and only the label flips. The second click switches to light.
- This is consistent with the React #418 hydration mismatch.
- There is no theme toggle on mobile: the button renders at 0×0 and is not in the menu.
- `document.cookie` did not change when toggling.

**Light mode**
- The primary colour changes from violet `#7C6BF5` to blue `#2F5FE0`.
- **When the page is scrolled, the nav background becomes `oklab(0 0 0 / .8)` (≈`#313132`) while nav links stay `#3E475A`. That is 1.39:1, so the links and the dark "VAANI" wordmark practically disappear** (`home_light_mid.png`).
- In the hero, the decorative wave line crosses the "Speaking German" pill and reads like strikethrough. Only the first proof pill keeps its border.

**Headings and landmarks**
- H1 → H2 → **H4** (no H3) for feature, industry, channel and footer headings.

**Meta**
- `meta description`: "…fluent in 12+ Indian languages. Sub-200ms latency…". That contradicts the hero's "40+ languages … sub-second".
- `og:image` points to `https://www.vaanilabs.in/...`.

**Performance**
- Cold first visit: TTFB 536ms, FCP 3392ms, DCL 7572ms, LCP 9976ms.
- Warm reload: TTFB 455ms, DCL 1079ms, FCP 2184ms, load 2233ms, **LCP 3416ms**. The LCP element is the hero gradient `<span>` inside `h1.vlp-display.vlp-rise.vlp-d2`, which uses a delayed entrance animation.
- 61 resources, about 1.0 MB transferred, 16 JS chunks, **20 font files** (the largest woff2 is 125 KB).
- CLS measured after a scroll-through was **0.175** ("needs improvement").

**Privacy**
- On the very first page view with no interaction, a PostHog cookie `ph_phc_…_posthog` (365-day expiry) is set on `.vaanilabs.in`.
- No consent banner or opt-out control appears anywhere. The Cookie Policy calls this "one optional analytics tag that respects Do-Not-Track".

### 4.2 Pricing (`/pricing`)

Screenshots: `pricing_full_part0..2.png`, `m_pricing_top.png`.

- **There are no prices.** It opens with "ENTERPRISE PILOT / Launch a paid pilot with the full Vaani Labs platform", then "Public pricing stays sales-led so the pilot scope matches your use case instead of forcing a generic tier".
- Three mono "step" cards (11px JetBrains Mono).
- **"Start a pilot" form with 18 controls.** Full name*, Company, Work email*, Phone, Sector, Expected monthly volume, Primary use case, 5 channel checkboxes, CRM/helpdesk stack, Preferred timeline, Deployment preference, Procurement stage, Target rollout date (a free-text box, not a date input), Compliance requirements and Anything else.
  - Every text field uses its **placeholder as the only label**. There are no `<label>`s and no `autocomplete`.
  - Selects show bold white default text while inputs show grey placeholders, so they look inconsistent.
- The primary "Email us" and the in-form "Email …" link go to a founder's personal address **on a third-party domain (`advisio.in`)**, not `vaanilabs.in`.
- "Six reusable vertical pilots": each card repeats a "SUCCESS STORY" label over generic aspiration copy. There are no stories.
- "Trust, ROI, and technical proof in one package" includes internal items ("Audit-chain and operational checklist", "Meeting-agent setup and LiveKit notes").
- **"Every plan includes"** appears although there are no plans. It includes jargon ("Voice agents (textvoice + voicebot)", "Meeting agents (Vikash)") and "12+ Indian languages with sub-200ms turn latency".
- **Header B has no site navigation at all**: only the logo and "Email us". On mobile there is no menu. The page is 6,792px long.
- Typography: H1 Sora 36/700. All body copy is **JetBrains Mono 14px**, and the 3-step cards are **11px mono**. Long centred mono paragraphs (8 lines on mobile) are hard to read.
- **Contradictions:** the home page promises "Free tier · No credit card", and `/docs/api/billing` says "Vaani Labs is prepaid… no monthly minimums, no plans" with public per-second prices: textvoice and voicebot 4 paise/s, meeting-agent 8 paise/s, meeting 1 paise/s. The page also says "Per-second billing", yet voice "round[s] up to whole billable minutes".

### 4.3 Enterprise (`/enterprise`)

Screenshots: `enterprise_full_part0..2.png`.

- Own nav (Pilot → `/pricing`, Security, API) plus "Scope pilot". This is the third navigation system.
- H1 "Move from impressive demo to approved enterprise rollout." **The product is called "VaaniVoice"** in the lead paragraph.
- Vanity stats: "6 Readiness controls / 4 Pilot-ready / 6 Vertical packs".
- An orange-and-teal "mandala" badge illustration uses a palette that appears nowhere else in the brand.
- **Much of the copy reads like an internal sales runbook:**
  - "The matrix separates capabilities… **so sales does not over-promise**"
  - "Super-admin gate for global operations"
  - "S3 private object storage"
  - "use concierge setup for custom connector secrets **until automated vaulting is enabled**"
  - "Create one customer org… **instead of shared demo credentials**"
  - "keep security questions attached to the lead record"
- Raw paths appear as list items ("/security", "/docs/integrations").
- The three "Proof package" cards each contain an **icon-only link with no accessible name** (to `/security`, `/pricing` and `/docs/api`).
- Body copy is JetBrains Mono throughout.

### 4.4 Security (`/security`)

Screenshots: `security_part0.png`, `security_part_end.png`.

- Long-form, honest, specific and well structured. There is a §01–§13 table of contents in a sticky right rail.
- Content covers AWS ap-south-1, Supabase Postgres with RLS, S3 pre-signed URLs, TLS 1.2+/1.3, AES-256, HMAC-SHA256 webhook signatures with a 5-minute replay window, rate limiting, incident response (72h notification), sub-processors, a compliance roadmap and "Audit history: …have not yet completed an external security audit."
- This is the site's best trust asset.

**Issues:**
- Long prose is set in **JetBrains Mono**, which hurts readability.
- Typo **"ap-south-1 forcall recordings"**: a missing space next to the `<code>` element.
- Over-disclosure of implementation details that help nobody but an attacker: table name `rate_limit_buckets`, "application server holds an anon key", "public-pitch landing" endpoint.
- "Last updated · April 25, 2026" (5 months old).
- "Two-factor authentication via TOTP is on the roadmap for Q3 2026". Q3 ends in 4 days from the audit date.
- Says OAuth is "Google and Microsoft". The login page offers **Google and Meta**.
- Header is `X-VaaniVoice-Signature` (a third product name).
- No `<main>` landmark.

### 4.5 Docs hub (`/docs`), Integrations (`/docs/integrations`) and API (`/docs/api`)

Screenshots: `docs_top.png`, `docs_integrations_top.png`, `docs_api_top.png`, `docs_api_billing.png`.

**`/docs`**
- Seven cards that all look identical (same border, same hover affordance), but **"Quick Start", "Voice Agents" and "Integrations" are not links** (`cursor:auto`, no anchor). Only API Reference, Agent Ecosystem, Security & Compliance and Enterprise Adoption navigate.
- Quick Start says "Create an account and **get approved**" and "Configure your **Twilio** number". Home says "Bring your own numbers & carriers, or use ours".
- "Security & Compliance: Understand our security practices and **compliance certifications**… SOC 2 compliance overview". There are no certifications (per `/security`).

**`/docs/integrations`**
- The top-nav "Integrations" label points here, but the page is about **developer-agent integrations** (MCP server, Claude Skill, OpenAPI 3.1, Node/Python SDKs, all named `vaanivoice`). It is not about the CRM integrations (Salesforce, HubSpot) that the docs card lists and that a buyer expects from "Integrations".
- Duplicate "Back to Docs" links.
- H2 text glued to the glyph: "§What you get, in one paragraph."
- "Mint an API key" points to `https://www.vaanilabs.in/api-keys`. That is a `www` host, and `/api-keys` redirects signed-out users to `/login?next=/api-keys`.

**`/docs/api`**
- A completely different design language: heavy system-sans 64/800 H1, **Instrument Serif italic** 22px lead, blue accent, "VV API" italic logotype, "वाणी — voice that ships."
- A **white 40px strip** ("BACK TO DOCS", body `#F4F6FA`) sits above a black page, which looks like a theme leak.
- "GET A KEY" is blue `#2F5FE0`. Its computed text colour is black, which gives 3.83:1 (the design-system audit reports the same for `.btn-saffron`).
- Copy says "No SDK to install". `/docs/integrations` sells "Language SDKs".
- Price "4paise / sec" is missing a space.

**`/docs/api/billing`**
- Public price table, plus internal phrasing ("env-tunable per-minute sell rate", "write a row to api_usage", "GPU LLM").

### 4.6 Contact (`/contact`)

Screenshot: `contact_full.png`.

- Header G shows the "VAANI LABS" logo lockup **and** a second "VaaniLabs" wordmark side by side (duplicate brand).
- H1 "Bring us your hardest calls." There are two founder cards with real photos, roles, hours (Mon–Fri 11:00–19:00 IST), "Book a meeting →" (external booking), email and LinkedIn. **The founder emails are on `starvoxlabs.io`.** "General enquiries: support@vaanilabs.in."
- "Or send us a note" form (4 fields) uses placeholders as labels ("Your name", "you@company.com", …), with no `autocomplete`.
- Across the site I found **contact addresses on 3 domains**: vaanilabs.in, starvoxlabs.io and advisio.in. There are also two different "Talk to sales" destinations.

### 4.7 Build your own (`/build.html`)

Screenshots: `build_top.png`, `build_lower.png`, `build_nav_zoom.png`.

- A separate static page with its own nav ("How it works" → `/#how` is dead, "Sign in" rather than "Log in", "Get started" → `/login` rather than `/signup`), a different V mark without the app tile, a "VaaniLabs" wordmark and the Bricolage Grotesque font.
- **The best conversion concept on the site.** "Don't read about our voice AI. Talk to it." Three steps (Your scenario → We build it → Talk to it). Scenario select, a **22-option Indian-language select**, voice (Vaani/Vikash), company, "trickiest moment", mobile, email with "Send code" OTP, a consent checkbox that names "VaaniLabs (StarVox Labs)", and trust ticks ("Data stays in India · Consent-based · DPDP · You own the flow").

**Issues:**
- Nav "Get started" text is `#8B90A6` on a `#6D5EFC→#574AF0` gradient: **1.43–1.82:1**. It looks disabled.
- The language select truncates to "Hindi + English (Hinglish" (208px wide with 38px right padding).
- The two-line label "How did you hear about us? (optional)" pushes its input about 19px below the "Mobile number" input.
- Claims "10+ Indian languages" and "**DPDP + RBI compliant by default**", which is a compliance claim `/security` does not make.
- Not tested: the actual build or OTP flow, since it needs a real phone and email.

### 4.8 Changelog (`/changelog`)

Screenshot: `changelog_top.png`.

- Five versions from v2.0.0 (Dec 1, 2025) to **v2.0.4 (Feb 15, 2026, "Latest")**, so the latest entry is **7 months stale**. The product has since shipped Meeting Agent, Personal Agents, Knowledge, Rep Console and more (per the orchestrator).
- **Internal security-relevant fixes are published:** "Fixed RLS policy recursion issue on profiles table", "Fixed calls RLS for service role access", "Resolved campaign read permissions for call engine".
- v2.0.0 claims "**SOC 2 Type II compliant architecture**".
- v2.0.2 confirms "Admin panel — user management with **approve/reject workflow**", which explains the sign-up gating.
- Versions are not headings (flat text).

### 4.9 About (`/about`)

Screenshots: `about_part0.png`, `about_values_team.png`, `about_part1.png`.

- "Founded in 2024… we power voice AI for **some of India's largest enterprises**, handling **millions of calls** across 12+ Indian languages with sub-200ms response times."
- Timeline:
  - 2024 Founded in Mumbai
  - 2024 **First enterprise pilot with HDFC Bank**
  - 2025 **Series A funding — $12M raised**
  - 2025 12+ languages
  - 2025 **1M+ calls processed**
  - 2026 **SOC 2 Type II Certified**
- Values include "supporting **all 22 scheduled languages**" and "Our AI speaks **every Indian language**".
- **Team: six people with initials-only avatars, no photos or links.** None of them is either of the two founders shown with photos on `/contact`. The same six names are the authors of the `/blog` posts.
- Taken together, this strongly suggests template or placeholder content. It directly contradicts `/security` ("have not yet completed an external security audit"; SOC 2 "observation window starting Q4 2026") and the home page ("SOC 2 Type II readiness is in progress"). *Whether the funding and bank claims are true cannot be verified from the site; the contradiction and the team mismatch are what I observed.*
- Scroll-reveal animation leaves about 1,000px of blank dark space in full-page captures and prints until the user scrolls.

### 4.10 Status (`/status`) and footer status

Screenshot: `status_full.png`.

- "All Systems Operational — Last checked: 26/9/2026, 5:36:39 pm IST", which was the client clock at load time.
- Eight services with fixed round uptimes (99.99%, 99.95% …). The last incident is Feb 12, 2026.
- Service names expose vendors ("Telephony (Twilio)", "Authentication (Supabase)").
- *Inferred:* the page is static rather than backed by monitoring. The footer's green "All Systems Operational" on every page has the same problem. If it is static, it will be wrong exactly when it matters.

### 4.11 Careers and Blog

- `/careers`: "Coming Soon — We are preparing our careers page", yet it is linked in the footer.
- `/blog`: five posts (Dec 2025–Feb 2026) by the About-page team names, including "based on data from 500+ companies". **The five "Read more" elements are plain `<span>`s**, so no post can be opened.

### 4.12 404

Screenshot: `404.png`.

- HTTP 404 status is correct.
- **Light theme with blue primary**, while the public pages default to dark.
- Copy: "SIGNAL LOST / Page Not Found / The neural pathway you're looking for doesn't exist or has been relocated to a different sector." plus "ERR: 0x404 • NODE: MUMBAI-1 • STATUS: DISCONNECTED".
- Actions are only "Return Home" and "Go Back". There is no nav, no search, and no links to Docs, Pricing or Contact. The title is generic.

---

## 5. Brand and app consistency

| Dimension | Observed values |
|---|---|
| Company / product name | "Vaani Labs" (footer ©, most pages), "VaaniLabs" (titles of enterprise/legal, contact wordmark, build page), "**VaaniVoice**" (enterprise lead, `X-VaaniVoice-Signature`, `vaanivoice-mcp`, `vaanivoice.yaml`, `vv_live_` keys), "**VV API**" (docs/api), "**StarVox Labs**" (consent text; founder email domain), plus a pricing contact on `advisio.in` |
| Logo | App-tile V + "VAANI / LABS" lockup (most pages); tile + lockup + extra "VaaniLabs" (contact); plain V mark + "VaaniLabs" (build.html); text "Vaani Labs" + "VV API" italic (docs/api); tile only on the right (security/docs/changelog/about/status) |
| Primary colour | Violet `#7C6BF5` (dark pages); blue `#2F5FE0` (login, forgot-password, 404, docs/api, light home). The design-system audit shows the token is named `--saffron` but is blue in light mode and violet in dark mode. Accent is cyan `#38C6E0` in dark and teal `#0E9488` in light. Orange/teal illustrations on /enterprise. |
| Default theme | Dark: home, pricing, enterprise, security, docs, contact, build, changelog, about, status. **Light: login, sign-up, forgot-password, 404, docs/api shell.** Per other agents' reports the signed-in app renders light. So the visitor goes dark marketing (violet) → light auth (blue) → light app (blue), and the brand colour changes at the first click on "Get started". |
| Type families on public pages | Hanken Grotesk (home body), Sora (display on most secondary pages), Syne (once on home), JetBrains Mono (body copy on pricing, enterprise, security, docs, changelog, about, status; labels everywhere), Instrument Serif italic (docs/api lead), Bricolage Grotesque (build.html), system ui-sans (docs/api H1). **7 families.** The home page alone loads 20 font files. |
| Headers | At least 8 variants (A–J in §3). Only the home page has the complete marketing nav. |
| Voice / tone | Warm, benefit-led (home) · procurement/runbook jargon (pricing, enterprise) · candid engineering (security) · sci-fi "neural platform" (login footer "Neural Platform v2.0.4 — Enterprise Security Enabled", 404 "neural pathway… sector") |

**Does the app feel like the same brand?** Only partly. The home page, security and docs share the dark, violet, mono-label "terminal" idiom that the design-system audit also found in the app (JetBrains Mono uppercase labels, Sora headings). But auth and the app default to light and blue, and the most-seen marketing surface uses Hanken Grotesk with a violet gradient that the app never uses. A visitor experiences a colour and theme switch at exactly the moment of commitment (sign-up / sign-in).

---

## 6. Auth flow

Screenshots: `login_default.png`, `login_invalid_email.png`, `login_magic_link.png`, `login_signup_toggle.png`, `signup_route.png`, `forgot_password.png`, `forgot_password_invalid.png`, `m_login.png`.

### 6.1 `/signup`

- **The server redirects `/signup` → `/login`** (redirect chain `signup → login`), and the page renders **sign-in mode** ("Welcome Back / Sign in to access your dashboard").
- Every acquisition CTA points to `/signup`:
  - Header "Get started"
  - Hero "Start free"
  - Final "Start free"
  - "Explore analytics →"
  - "Open Flow Builder →"
  - forgot-password "Create an account"
- So new users arrive at a returning-user screen. The only path to sign-up is the text button "Don't have an account? Sign up": 12px JetBrains Mono, `#7A8397` on white (**3.8:1**), a 216×16px target, at the bottom of the card.
- The URL does not change when toggling modes, so the modes can't be deep-linked.

### 6.2 `/login`, sign-in mode

- A centred white card on a light grid background. "← Back to home" (mono) and the logo sit above the card.
- H2 "Welcome Back". **There is no H1.**
- "Continue with Google" and "Continue with Meta" are links to `/api/auth/oauth/{google|facebook}?next=/dashboard`. They were not clicked.
- "— OR —", then the EMAIL and PASSWORD fields, "Forgot your password?", the blue "Sign In →" button, the outline "✉ Sign in with Magic Link" button, the sign-up toggle, and the footer "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled".

**Accessibility and autofill**
- `<label>`s exist visually ("Email", "Password"), but `label.htmlFor=""` and the inputs have no `id`. **They are not associated**, so the accessible names are the placeholders "you@company.com" and "••••••••".
- Email has no `autocomplete`. **The password has `autocomplete="off"`** in both sign-in and sign-up. It should be `current-password` / `new-password`, otherwise password managers and passkey upgrade paths are discouraged.
- The password placeholder "••••••••" looks like a pre-filled saved password.
- The show-password button is **16×16px**, below the 24×24 WCAG 2.2 target minimum.

**Validation, sign-in button**
- Empty or `not-an-email` input: the browser's native bubble only ("Please fill in this field", "Please include an '@'…").
- The field gets no invalid styling (the border stays the focus blue `#2F5FE0`), there is no inline text, and there is no `aria-live`.
- No network request was sent.

**Validation, Magic Link button**
- This is a direct-send action, not a mode switch.
- With the email empty, a custom red banner "Please enter a valid email" appears **below the password field**. It is far from the email field, not linked with `aria-describedby`, not `role=alert`, and it shifts the layout by about 29px.
- So there are two different validation patterns on one form. With a valid email this button would immediately send a link. I did not test that.

### 6.3 Sign-up mode (via the toggle)

- H2 "Create Account" and subtitle "**Register for early access (admin approval required)**".
- Same Google/Meta buttons (still `next=/dashboard`).
- Fields: FULL NAME (placeholder "Priya Sharma"), EMAIL, **PHONE (WITH COUNTRY CODE)** (required, with no explanation of why), PASSWORD (no rules shown, no `minlength`, `autocomplete=off`), then "Create Account →" and "Already have an account? Sign in".
- **There is no Terms or Privacy acknowledgement**, and no "what happens next" (approval time, email).
- Validation is native only: empty gives "Please fill in this field", `not-an-email` gives the '@' message.

### 6.4 `/forgot-password`

- Logo, and a card headed "§ ACCOUNT / RECOVERY" (tracked mono).
- H1 "Forgot your / password?" with a blue second line.
- Copy: "…tied to your **Vaani Labsaccount**" (missing space). "…one-time link… valid for 60 minutes."
- EMAIL is a proper label with `autocomplete="email"`, which is better than the login page.
- **The envelope icon overlaps the text**: icon at x=545–559px, text starts at x=547px (`padding-left:14px`).
- Links: "← Sign in" and "Create an account", which goes to `/signup` and bounces to sign-in.
- Validation is native only.

### 6.5 Trust framing on auth

- There is no link to Privacy or Terms on any auth screen.
- "Enterprise Security Enabled" is a meaningless claim that also exposes the build version.
- The "Back to home" link is small mono grey text at the top. The escape route is fine but low contrast.

---

## 7. Mobile (390×844)

Screenshots: `m_home_top.png`, `m_home_menu.png`, `m_home_full_grid.png`, `m_login.png`, `m_pricing_top.png`.

- **Home.** No horizontal page overflow (`scrollWidth` equals `clientWidth`).
  - H1 is 41.6px. The hero stacks well. The Start free and Talk to the agent buttons are full width and about 49px tall.
  - The hamburger (40×40) opens a clean card menu with rows about 49px tall, Log in, and Get started.
  - **The menu does not close on Esc** (`aria-label` stays "Close menu").
  - There is no theme toggle on mobile.
  - The flow-builder demo nodes are clipped at the right edge (node right 382px vs viewport 380px) and the "Book callback" branch is off-screen.
  - The analytics mock leaves "Avg time" alone on its own row.
  - The page is 9,914px long (about 11.7 screens). The six security cards stack one per row.
  - Industry and channel chips are 28–32px tall. That is OK, but "English"/"हिंदी" are 62×28 and 47×28.
- **Login.** Fits without scrolling (844px). Inputs are **14px**, so iOS Safari will zoom on focus. The footer wraps to two lines.
- **Pricing.** No nav or menu at all on mobile. It is a long mono page (6,792px), inputs are 14px, and the 8-line centred lead is monospace.

---

## 8. Findings

Severity: critical = blocks a core task, data loss or serious barrier; high = major friction or clearly unprofessional; medium = noticeable; low = polish.

### PUBLIC-SITE-01 · Critical · trust-safety · `/about` (also `/blog`)
**The About page appears to contain placeholder or unverifiable company claims, and they contradict the site's own security page.**
- **Evidence:**
  - The timeline claims "First enterprise pilot with HDFC Bank" (a named real bank), "Series A funding — $12M raised", "1M+ calls processed" and "2026 SOC 2 Type II Certified". The story says "we power voice AI for some of India's largest enterprises, handling millions of calls".
  - The team section lists six people with initials-only avatars. None of them is either founder shown with a photo on `/contact`. The same six names author all `/blog` posts.
  - `/security` §13 says "have not yet completed an external security audit", and §11 says SOC 2 is at "readiness… observation window starting Q4 2026". The home page says "SOC 2 Type II readiness is in progress".
  - Screenshots: `about_part0.png`, `about_values_team.png`.
- **Recommendation:**
  1. Unpublish or rewrite `/about` immediately with verifiable facts only: real founders (reuse the `/contact` photos and bios), the actual founding date and entity (clarify the Vaani Labs Pvt. Ltd. and StarVox Labs relationship), and real milestones.
  2. Remove named-customer, funding and certification claims unless they are documented and approved (a customer logo needs written permission).
  3. Replace blog bylines with real authors or remove the posts.
  4. Add a content-governance check so claims about certification, customers and funding are reviewed by someone accountable before they ship.

### PUBLIC-SITE-02 · High · trust-safety · `/changelog`, `/docs`, `/build.html`, `/about` vs `/security`
**Compliance and certification claims contradict each other across the site.**
- **Evidence:**
  - Changelog v2.0.0: "SOC 2 Type II compliant architecture".
  - `/docs`: "Understand our security practices and compliance certifications… SOC 2 compliance overview".
  - `/build.html`: "DPDP + RBI compliant by default".
  - `/about`: "SOC 2 Type II Certified".
  - `/security`: no external audit yet, SOC 2 readiness, observation window Q4 2026.
  - Home: "readiness is in progress".
  - `/security` also says OAuth is via "Google and Microsoft" while `/login` offers Google and Meta.
  - It says "TOTP… on the roadmap for Q3 2026"; Q3 ends 30 Sept 2026. "Last updated · April 25, 2026".
- **Recommendation:**
  1. Make `/security` the single source of truth. Every other page should link to it rather than restate compliance.
  2. Use one approved phrase everywhere, for example "SOC 2 Type II in progress (observation window Q4 2026)".
  3. Replace "compliant by default" with specific controls ("data stored in India (AWS Mumbai)", "consent captured before calls").
  4. Update the TOTP roadmap date and the OAuth provider list, and refresh "Last updated".

### PUBLIC-SITE-03 · High · ux · `/signup`, all "Get started" / "Start free" CTAs
**The sign-up route drops new users onto the sign-in screen.**
- **Evidence:**
  - `GET /signup` redirects to `/login` (chain `signup→login`) and renders "Welcome Back / Sign in to access your dashboard".
  - Affected CTAs: header "Get started", hero "Start free", final "Start free", "Explore analytics →", "Open Flow Builder →", and forgot-password "Create an account". `/build.html` "Get started" goes straight to `/login`.
  - The only way to sign-up mode is a 12px mono grey text button (`#7A8397` on white, 3.8:1, 216×16px) at the bottom of the card.
  - Screenshots: `signup_route.png`, `login_default.png`.
- **Recommendation:**
  1. Serve a real `/signup` route (or `/login?mode=signup`) that opens in "Create account" mode.
  2. Make the mode switch a visible segmented control or tab ("Sign in | Create account") at the top of the card, with the URL reflecting the mode.
  3. Preserve `next` and campaign parameters through the switch.

### PUBLIC-SITE-04 · High · content-copy · `/`, `/login` sign-up mode, `/pricing`, `/docs`
**Access and pricing promises contradict each other across the funnel.**
- **Evidence:**
  - Home: "Start free and build your first agent in minutes" and "Free tier · No credit card to start · Cancel anytime".
  - Sign-up: "Register for early access (admin approval required)".
  - `/docs` Quick Start: "Create an account and get approved".
  - `/pricing`: "Launch a paid pilot… Public pricing stays sales-led".
  - `/docs/api/billing`: "prepaid… no monthly minimums, no plans" with public per-second prices (4/4/8/1 paise per second).
  - The signed-in app has a prepaid INR wallet (orchestrator context).
- **Recommendation:**
  1. Decide the actual go-to-market and say it consistently.
  2. If self-serve pay-as-you-go exists, publish it on `/pricing`: per-minute INR rates, the wallet top-up model, any free credit, and an Enterprise pilot tier beside it.
  3. If access is approval-gated, replace "Start free" with "Request access" and state the approval SLA on the CTA and in the sign-up confirmation.
  4. Remove "Free tier / Cancel anytime" unless both are true.

### PUBLIC-SITE-05 · High · ia-navigation · `/pricing`
**The Pricing page has no prices, no site navigation, and routes enquiries to a third-party domain.**
- **Evidence:**
  - The header has only the logo and "Email us" (`mailto:` on `advisio.in`). There is no `<nav>`, no `<main>`, and no menu on mobile.
  - The content is an 18-control enterprise intake form.
  - "Every plan includes" appears with no plans. Six "SUCCESS STORY" labels sit over generic aspiration text.
  - Body copy is JetBrains Mono 14px, and the step cards are 11px mono.
  - Screenshots: `pricing_full_part0.png`, `pricing_full_part1.png`, `m_pricing_top.png`.
- **Recommendation:**
  1. Rebuild `/pricing` on the shared marketing layout (full header and footer).
  2. Show the self-serve rates from `/docs/api/billing` in plain language (₹ per minute, wallet, autopay), plus an Enterprise column with "Talk to sales".
  3. Add a comparison and FAQ.
  4. Move the long pilot-scoping form to `/enterprise` or a "Request pilot" modal, and cut it to 5–6 fields.
  5. Use `sales@vaanilabs.in`.

### PUBLIC-SITE-06 · High · consistency · all public pages
**Brand identity is fragmented: at least 8 header variants, 7 type families, two primary colours, two default themes and five names.**
- **Evidence** (full table in §3 and §5):
  - Header variants: home full nav; pricing logo + Email us; enterprise's own nav; "Back to Home" + logo-right (security, docs, changelog, about, status); contact with a duplicate "VaaniLabs" wordmark; docs/integrations "BACK TO DOCS"; docs/api with a white strip over a black page; build.html static nav using "Sign in" and "Get started"→`/login`.
  - Fonts: Hanken, Sora, Syne, JetBrains Mono, Instrument Serif, Bricolage Grotesque, system.
  - Primary colour: violet `#7C6BF5` on dark pages vs blue `#2F5FE0` on auth, 404 and docs/api. The token is named "saffron".
  - Names: Vaani Labs, VaaniLabs, VaaniVoice, VV API, StarVox Labs.
  - Screenshots: `pricing_full_part0.png`, `enterprise_full_part0.png`, `security_part0.png`, `contact_full.png`, `docs_integrations_top.png`, `docs_api_top.png`, `build_top.png`, `login_default.png`, `404.png`.
- **Recommendation:**
  1. Define one marketing shell (header, footer, container 1200px, 16/24px gutters) and use it on every public page. Docs may add a left rail inside the same shell.
  2. Pick one brand name ("Vaani Labs"), one logo lockup, one primary hue in both themes (if violet, make light-mode primary a darker violet, not blue), one default theme for marketing and auth, and at most 3 type families: display, text sans, and mono for code or data only.
  3. Put `/build.html` inside the app shell.

### PUBLIC-SITE-07 · High · content-copy · `/`, meta, `/pricing`, `/about`, `/build.html`, `/docs`
**Core product claims conflict: languages, latency, meeting platforms, auth providers and telephony.**
- **Evidence:**
  - Languages: "40+" (home hero and pills), "12+ Indian" (meta description, pricing, about, changelog, blog), "10+ Indian" (build.html), "all 22 scheduled languages" and "every Indian language" (about). Build.html's select lists 22 options.
  - Latency: "sub-second" (home) vs "sub-200ms" (meta, pricing, about).
  - Meetings: "Zoom, Meet, and Teams" (home) vs "LiveKit / Daily rooms" (pricing, docs).
  - OAuth: "Google and Microsoft" (/security) vs Google + Meta (/login).
  - Telephony: "Bring your own numbers & carriers, or use ours" (home) vs "Configure your Twilio number" (docs).
  - The hero's rotating language pill shows Arabic, Indonesian, German and Spanish, although the brand title is "The Voice AI that speaks India".
- **Recommendation:**
  1. Create a single "claims sheet" (language count split into Indian and total, measured latency with its definition, supported meeting platforms, channels, auth providers) and reference it from every page.
  2. Lead the hero with India: rotate Indian languages first (हिंदी, தமிழ், తెలుగు, मराठी…) and state "22 Indian languages + 20 global" if that is true.

### PUBLIC-SITE-08 · High · accessibility · `/` (light mode)
**In light mode the scrolled nav becomes near-black while links stay dark grey, so navigation disappears.**
- **Evidence:**
  - After scrolling, the nav background is `oklab(0 0 0/.8)` (≈`#313132` over `#F4F6FA`) and links are `#3E475A`: **1.39:1**. The "VAANI" wordmark (dark) also vanishes. Only "Build your own" and "Get started" remain legible.
  - Screenshot: `home_light_mid.png`.
- **Recommendation:** Give the scrolled nav a theme-aware surface: `rgba(244,246,250,.85)` + blur in light, `rgba(12,13,18,.8)` in dark. Or switch link colours with the surface. Add a visual-regression test for both themes at scroll positions.

### PUBLIC-SITE-09 · Medium · functional-bug · `/` (all Next.js pages)
**The theme toggle starts out of sync (first click does nothing), and every page throws React hydration error #418.**
- **Evidence:**
  - On load `html.dark` is set, but the toggle shows a sun icon with `aria-label="Switch to dark mode"`.
  - Click 1: `html` stays `.dark` and the label flips to "Switch to light mode". Click 2: light mode.
  - `pageerror: Minified React error #418` appears on /, pricing, enterprise, security, docs, contact, changelog, about and status.
  - The toggle is 0×0 on mobile, with no alternative in the menu.
- **Recommendation:**
  1. Read the theme before hydration (inline script plus a `suppressHydrationWarning`-safe pattern such as next-themes) so SSR and client state match.
  2. Fix the #418 mismatches.
  3. Add the theme control to the mobile menu, or follow `prefers-color-scheme`.

### PUBLIC-SITE-10 · Medium · functional-bug · `/`, footer, `/docs`, `/blog`, `/build.html`
**Dead links and fake affordances across marketing and docs.**
- **Evidence:**
  - Nav "Product" → `/#capabilities`, footer "Features" → `/#features`, footer "Demo" → `/#demo`, build.html "How it works" → `/#how`. None of these ids exist; clicking "Product" leaves scrollY at 0.
  - `/docs` "Quick Start", "Voice Agents" and "Integrations" cards look identical to linked cards but are not links.
  - `/blog` has five "Read more" plain `<span>`s, so no post opens.
  - Footer "Careers" is "Coming Soon".
- **Recommendation:**
  1. Add the section ids (or point the links at real pages).
  2. Make every docs card a link or visually mark "coming soon".
  3. Link blog posts, or hide the blog until real posts exist.
  4. Remove Careers from the footer until it has content.
  5. Add a link checker to CI.

### PUBLIC-SITE-11 · Medium · content-copy · `/enterprise`, `/docs/api/billing`
**Buyer-facing pages contain internal runbook language and leak implementation details.**
- **Evidence:**
  - "so sales does not over-promise"; "Super-admin gate for global operations"; "until automated vaulting is enabled"; "instead of shared demo credentials"; "keep security questions attached to the lead record"; raw "/security" and "/docs/integrations" as list items.
  - The product is called "VaaniVoice".
  - Billing docs: "env-tunable per-minute sell rate", "write a row to api_usage", "GPU LLM".
  - Three icon-only "Proof package" links have no accessible name.
- **Recommendation:**
  1. Rewrite for the buyer: outcomes, the process, and what they receive.
  2. Move internal checklists to the sales playbook.
  3. Replace raw paths with descriptive link text.
  4. Give icon links `aria-label`s.

### PUBLIC-SITE-12 · Medium · trust-safety · `/changelog`, `/status`, footer, `/security`
**Trust surfaces are stale, look static, and over-disclose.**
- **Evidence:**
  - The changelog's latest entry is Feb 15, 2026 (7 months old). It publishes "Fixed RLS policy recursion issue on profiles table", "Fixed calls RLS for service role access" and "Resolved campaign read permissions for call engine".
  - `/status` shows "Last checked" as the client's current time, fixed uptimes (99.99%…), and the last incident on Feb 12, 2026. *Inferred:* it is static.
  - The footer shows "All Systems Operational" on every page.
  - `/security` names the table `rate_limit_buckets` and says "application server holds an anon key".
- **Recommendation:**
  1. Keep the changelog current and customer-facing ("Improved access controls"), with no table or policy names.
  2. Back `/status` with real monitoring (a hosted status page) or remove it, and fetch the footer status from it.
  3. Trim internal identifiers from `/security`.

### PUBLIC-SITE-13 · Medium · accessibility · `/login` (sign-in and sign-up)
**Auth fields are not programmatically labelled, autofill is disabled, and there is no H1.**
- **Evidence:**
  - `label.htmlFor=""` and the inputs have no `id`, so the accessible names are "you@company.com" and "••••••••".
  - The password has `autocomplete="off"` in both modes; email has no autocomplete.
  - The heading is H2 "Welcome Back" or "Create Account", with no H1.
  - The show-password button is 16×16px.
  - The sign-up toggle is 12px `#7A8397` on white (3.8:1).
  - The "••••••••" placeholder mimics a saved password.
  - By contrast, `/forgot-password` does label its field and sets `autocomplete=email`.
- **Recommendation:**
  1. Associate labels via `for`/`id`.
  2. Set `autocomplete="email"` / `current-password` / `new-password` / `name` / `tel`.
  3. Make the card title an H1.
  4. Use a 40×40 show-password target with an `aria-pressed` state.
  5. Remove the dot placeholder.
  6. Raise helper-link contrast to at least 4.5:1.

### PUBLIC-SITE-14 · Medium · ux · `/login`
**Validation is inconsistent and inaccessible, and sign-up hides key expectations.**
- **Evidence:**
  - "Sign In" relies only on native browser bubbles, with no invalid styling (the border stays blue) and no `aria-live`.
  - "Sign in with Magic Link" shows a custom banner "Please enter a valid email" below the password field, not tied to the email field, not `role=alert`, and it shifts layout by about 29px.
  - Magic Link is a direct-send button sitting next to a password field.
  - Sign-up requires a phone number with no reason given, shows no password rules, has no Terms/Privacy acknowledgement, and gives no approval expectations.
  - Screenshots: `login_invalid_email.png`, `login_magic_link.png`, `login_signup_toggle.png`.
- **Recommendation:**
  1. Use one inline error pattern under each field (red border plus message linked with `aria-describedby`, and a summary in `aria-live`).
  2. Make Magic Link a mode ("Email me a link instead") that hides the password field.
  3. In sign-up, explain why the phone is needed (OTP or test calls), show password rules, add "By creating an account you agree to Terms & Privacy", and state "We review requests within X hours".

### PUBLIC-SITE-15 · Medium · visual · `/forgot-password`, `/security`, `/docs/api`, `/docs/integrations`, `/contact`
**Visible rendering bugs and copy typos.**
- **Evidence:**
  - Forgot-password: the envelope icon (x 545–559) overlaps the input text (starts at x 547, `padding-left:14px`).
  - Typos: "Vaani Labsaccount", "ap-south-1 forcall recordings", "4paise / sec", H2 "§What you get…".
  - Contact header shows the logo lockup plus a duplicate "VaaniLabs" wordmark.
  - Home analytics mock: the "3m41s" unit overlaps the digits.
  - Screenshots: `forgot_password.png`, `security_part0.png`, `contact_full.png`.
- **Recommendation:** Set `padding-left` to about 40px for inputs with a leading icon, fix the spacing around inline `<code>`, and run a copy QA pass. Keep one logo lockup.

### PUBLIC-SITE-16 · Medium · accessibility · `/`, `/build.html`
**Primary CTAs fail contrast.**
- **Evidence:**
  - Home "Get started", "Start free" and "Talk to sales" primaries are white on `#7C6BF5` (3.98:1) at 12–15px.
  - build.html nav "Get started" is `#8B90A6` on a `#6D5EFC→#574AF0` gradient (1.43–1.82:1, looks disabled).
  - docs/api "GET A KEY" computes black on `#2F5FE0` (3.83:1).
- **Recommendation:** Darken the violet to about `#6A58F0` or darker (so white text reaches at least 4.5:1), or use a 16px+/700 label. Fix the build.html nav rule so it doesn't override button text colour. Standardise on white text for blue buttons (5.48:1).

### PUBLIC-SITE-17 · Medium · performance · `/`
**Hero LCP is delayed by entrance animation and a heavy font payload.**
- **Evidence:**
  - Warm load: TTFB 455ms, FCP 2184ms, **LCP 3416ms** (element: hero gradient span in `h1.vlp-rise.vlp-d2`), load 2233ms, 61 requests, about 1.0 MB, **20 font files** (the largest woff2 is 125 KB), 16 JS chunks.
  - Cold first visit under test contention: FCP 3392ms, DCL 7572ms, LCP 9976ms.
  - CLS 0.175 after a scroll-through.
  - `/pricing` and `/enterprise` FCP were 2.6–3.6s. `/login` FCP was 1.3s.
- **Recommendation:**
  1. Render the H1 visible at first paint (animate only opacity from about 0.9 or use transform without delay), and preload the one display font.
  2. Subset and cut font families (7 → 3) and weights.
  3. Reserve space for animated and rotating elements to reduce CLS.
  4. Track Core Web Vitals in the field.

### PUBLIC-SITE-18 · Medium · accessibility · site-wide
**Generic page titles, missing landmarks, and missing robots/sitemap.**
- **Evidence:**
  - Identical `<title>` "Vaani Labs - The Voice AI that speaks India" on /, pricing, docs, contact, changelog, about, status, login, forgot-password and 404.
  - No `<main>` on pricing, security, docs, docs/integrations, changelog, about, status or build.html. No `<nav>` on pricing.
  - Home skips from H2 to H4.
  - `/robots.txt` and `/sitemap.xml` return 404.
  - The meta description contradicts the hero (12+ vs 40+). `og:image` and the API base URL use `www.` while the site is served on the bare domain.
- **Recommendation:** Give every page a unique title ("Pricing · Vaani Labs"), use the shared layout with `<header><nav><main><footer>`, fix the heading order, publish robots and sitemap, align the meta description with the claims sheet, and pick one canonical host.

### PUBLIC-SITE-19 · Medium · trust-safety · site-wide
**The analytics cookie is set before any consent, although policy calls it optional.**
- **Evidence:**
  - On the first page view with no interaction, `ph_phc_…_posthog` (365-day expiry, `.vaanilabs.in`) is set.
  - No consent banner or opt-out control was seen on any page.
  - `/cookies` says "one optional analytics tag that respects Do-Not-Track".
  - CSP also blocks Cloudflare's email-decode script (every page) and the Insights beacon (build.html), which produces console errors.
- **Recommendation:**
  1. Either run PostHog cookieless (memory persistence) until consent, or add a lightweight consent control with accept, decline and a link to the cookie policy (DPDP and GDPR-friendly).
  2. Disable Cloudflare email obfuscation or allow it in the CSP.

### PUBLIC-SITE-20 · Medium · content-copy · `/`
**Social proof is unverifiable, and the "Talk to the agent" CTA over-promises.**
- **Evidence:**
  - Testimonials use a first name plus initial, initials avatars, and no company, logo, photo or link. There are no customer logos anywhere on the site.
  - Hero "▷ Talk to the agent" just scrolls to a pre-recorded playback. The final CTA says "Talk to it live right here", but there is no live widget. The live experience is `/build.html`, labelled "Build your own".
  - Screenshot: `home_talk_to_agent.png`.
- **Recommendation:**
  1. Use real, permissioned proof: logo strip, named quotes with photo and company, one short case study with numbers.
  2. Rename the hero secondary CTA "▷ Hear a real call", or embed the live browser agent.
  3. Make `/build.html` the prominent "Try it live" path in the nav and hero.

### PUBLIC-SITE-21 · Medium · trust-safety · `/contact`, `/pricing`, footer
**Contact channels are fragmented across three domains and two booking paths.**
- **Evidence:**
  - Addresses: `support@vaanilabs.in`, `security@vaanilabs.in`, founder addresses on `starvoxlabs.io`, and the pricing enquiry on `advisio.in`.
  - Footer "Talk to Sales ↗" opens an external booking site; home "Talk to sales" opens `/contact`.
  - The consent text names "VaaniLabs (StarVox Labs)".
- **Recommendation:**
  1. Route all sales contact through `sales@vaanilabs.in` and one booking link.
  2. Explain the legal entity once (footer "Vaani Labs is a product of StarVox Labs Pvt. Ltd."), if that is the case.
  3. Keep founder addresses on the brand domain.

### PUBLIC-SITE-22 · Medium · accessibility · `/pricing`, `/contact`
**Lead forms use placeholders as their only labels.**
- **Evidence:**
  - Pricing: 14 text inputs and textareas with no `<label>` (only placeholders such as "Full name *" and "Target rollout date"). The three selects rely on `aria-label`. There are no `autocomplete` attributes, and the date is free text.
  - Contact: 4 placeholder-only fields.
- **Recommendation:** Use visible persistent labels, `autocomplete` (name, email, organization, tel), a date input for the rollout date, and cut the pricing form to the essentials.

### PUBLIC-SITE-23 · Low · content-copy · 404, `/login` footer
**Gimmicky sci-fi copy, an off-theme 404, and a meaningless security badge.**
- **Evidence:**
  - 404 is light and blue while the other public pages are dark. Copy: "The neural pathway you're looking for… different sector", "ERR: 0x404 • NODE: MUMBAI-1 • STATUS: DISCONNECTED". The only actions are Return Home and Go Back, with no nav or search.
  - The login footer reads "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled".
  - Screenshots: `404.png`, `login_default.png`.
- **Recommendation:**
  1. Use a plain, helpful 404 in the marketing shell with links to Home, Docs, Pricing and Contact, and a search box.
  2. Replace the login footer with "Privacy · Terms · Security" links.

### PUBLIC-SITE-24 · Low · responsive · `/` and `/login` at 390px
**Small mobile issues.**
- **Evidence:**
  - Inputs are 14px on login and pricing, so iOS zooms on focus.
  - The flow demo nodes are clipped at the right edge (382 vs 380px) and the branch is off-screen.
  - The mobile menu does not close on Esc.
  - There is no theme toggle on mobile.
  - Home is 9,914px tall (about 11.7 screens).
  - The analytics mock leaves one stat card alone on its row.
- **Recommendation:** Use 16px inputs on mobile, a scaled or vertical flow demo, Esc-to-close with focus return, a 2-column security grid or accordion on mobile, and a trimmed section count.

### PUBLIC-SITE-25 · Low · visual · `/`
**Home polish inconsistencies.**
- **Evidence:**
  - Emoji icons (🎯🔐🌐, 🛍🏦🩺…) mixed with line icons in the security section.
  - Two eyebrow styles: about 1.2px tracking vs about 4px with a leading rule ("ENTERPRISE-GRADE SECURITY", "GET STARTED").
  - Container widths vary (154–1286 vs 180–1260).
  - The carousel's fourth card is hard-cropped.
  - Testimonial roles wrap awkwardly.
  - Footer headings are lowercase in the DOM.
  - In light mode the wave line strikes through the "Speaking …" pill.
- **Recommendation:** Adopt one icon set (the line icons already used in the security section), one eyebrow style token, one container width, a fade-mask for the carousel peek, and room for role text above the outcome chip.

---

## 9. Strengths worth preserving

1. **Home hero.** Clear, confident headline ("Voice AI agents that handle every call.") with strong hierarchy (72/600, −1.8px), restrained gradient accent, a single clear primary CTA, and a clean dark aesthetic.
2. **"Hear it work" demo.** Industry × scenario × language (English/Hindi) switcher, a real-sounding transcript with action chips ("Order found", "Tracking link sent · WhatsApp"), and a play control. Show-don't-tell at its best; keep it as the centrepiece.
3. **India-specific use-case cards.** "The problem → how Vaani handles it → ✓ outcome", with domain vocabulary (EMI, DPD, COD, RBI data residency, admissions season).
4. **`/security` content.** Candid, specific and structured (TOC, §-numbered). "We will tell you when something is shipped versus planned" is the right tone for procurement; make it the single compliance source.
5. **`/contact`.** Real founder photos, roles, hours, direct booking. Humanising and credible.
6. **`/build.html` concept.** "Don't read about our voice AI. Talk to it." A three-step build of a personal demo agent, 22 Indian-language options, an explicit consent checkbox, and "Data stays in India". The strongest conversion idea on the site; promote it.
7. **Developer docs.** `/docs/api` has clear structure (Start here / Surfaces / Integrate), per-surface pricing, 402 `insufficient_balance` semantics and code samples. The MCP, OpenAPI and SDK ecosystem is a differentiator.
8. **Auth basics.** Google, Meta, email/password and magic link. Forgot-password has a proper label, `autocomplete=email` and a stated 60-minute expiry. No request is sent on invalid input.
9. **Mobile.** No horizontal overflow at 390px. The hamburger menu is clean with 49px rows. The hero stacks well.
10. **Final CTA triad** (Start free / Talk to sales / View pricing) with a reassurance line. The pattern is right; only the promises need to be true.

---

## 10. Open questions for the product team

1. Are the `/about` claims (named bank pilot, $12M Series A, SOC 2 certified, the six-person team) real? If not, who owns taking them down?
2. Is sign-up really gated by admin approval? If yes, what is the target approval time, and should CTAs read "Request access"?
3. What is the public pricing model: self-serve prepaid wallet (per-minute INR), sales-led pilot, or both? What is the per-minute voice call rate?
4. What is the legal and brand relationship between Vaani Labs Pvt. Ltd., VaaniLabs, VaaniVoice and StarVox Labs? Which domain should customer-facing email use?
5. Should marketing, auth and app share one default theme? Which primary hue is the brand: violet `#7C6BF5` or blue `#2F5FE0` (the token is named "saffron")?
6. Is `/status` backed by real monitoring? Is the footer "All Systems Operational" live?
7. Which meeting platforms are supported today (Zoom/Meet/Teams vs LiveKit/Daily), and which OAuth providers (Meta vs Microsoft)?
8. Not tested: the `/build.html` OTP and live-call flow, the OAuth flows, and any real submission. They need real contact details or would create accounts.

---

## 11. Screenshot index

All paths are under `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-public-site/`.

| Area | Files |
|---|---|
| Home | `home_top.png`, `home_full.png` (+`home_full_part0..3.png`), `home_after_toggle.png`, `home_light.png`, `home_light_mid.png`, `home_light_nav_scrolled.png`, `home_talk_to_agent.png`, `home_focus_nav.png` |
| Pricing | `pricing_full.png` (+`_part0..2`), `m_pricing_top.png` |
| Enterprise | `enterprise_full.png` (+`_part0..2`) |
| Security | `security_full.png`, `security_part0.png`, `security_part_end.png` |
| Docs | `docs_top.png`, `docs_integrations_top.png`, `docs_api_top.png`, `docs_api_billing.png` |
| Contact | `contact_full.png` |
| Build | `build_top.png`, `build_lower.png`, `build_nav_zoom.png` |
| Changelog | `changelog_top.png` |
| About | `about_full.png`, `about_part0.png`, `about_part1.png`, `about_values_team.png` |
| Status and 404 | `status_full.png`, `404.png` |
| Careers and blog | `careers_top.png`, `blog_top.png` |
| Auth | `login_default.png`, `login_empty_submit.png`, `login_invalid_email.png`, `login_magic_link.png`, `login_signup_toggle.png`, `signup_route.png`, `forgot_password.png`, `forgot_password_invalid.png` |
| Mobile | `m_home_top.png`, `m_home_menu.png`, `m_home_full.png`, `m_home_full_grid.png`, `m_login.png` |
