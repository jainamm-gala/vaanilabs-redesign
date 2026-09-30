# 03-pages · 08 · Public site and auth

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** public-auth. This covers the marketing shell, the marketing home (structure and brand only), `/pricing`, `/login` (with magic link and the two-factor code), `/signup` and email verification, OAuth, forgot and reset password, accepting an invite, the hand-off into `/signup/workspace` and `/home`, the signed-out 404 and analytics consent.
**Follows:** `spec/00-design-direction.md` (Sutradhar: §3.1 brand carriers, §4 voice and glossary, §4.4 jargon to retire, §6.6 "Auth and 404", §7 anti-patterns), `spec/01-foundations.md` + `spec/tokens/tokens.css`, and the component specs `spec/02-components-core.md` (cited *C §n*), `spec/02-components-data-nav.md` (*N §n*) and `spec/02-components-overlay-feedback.md` (*O §n*). Components are named exactly as those specs name them. Anything they do not define is listed in §18, "New components needed".
**Siblings:** `00-app-shell-ia.md` owns the shell modes (§3.2 "bare" and "public"), landing logic (§2.5), `/signup/workspace` and `/signup/pending` (§12.2), Home and the setup track (§13) and the signed-in 404 (§15). `05-knowledge-billing.md` owns the rates endpoint and PlanCard (§2.10). This spec links to them and does not redefine them.
**Evidence:** finding ids (F-QA-…, F-VIS-…, F-A11Y-…, F-RWD-…, F-UX-…) refer to `audit/consolidated/`. Raw ids (PUBLIC-SITE-…) refer to `audit/raw/public-site.md`. Screens of today's pages are in `audit/screenshots/va-public-site/` (`login_default.png`, `login_signup_toggle.png`, `forgot_password.png`, `pricing_full_part0.png`, `home_top.png`, `m_login.png`), plus `scout_home.png` and `va-explore-core/onboarding.png`.
**Privacy:** every person, workspace, number and email address in this spec and its mock is made up ("Anika R.", "Sample Realty", `a•••@company.com`, `+91 80 •••• 2210`). No customer, lead or founder data from the audit appears here.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/08-public-auth.md`, assembled from `08-public-auth.part1.md` … `part8.md`. Edit the parts, then re-assemble. |
| Reference mock: the auth screens (sign in, errors, create account, check email, two-factor code, reset), the marketing header and hero, pricing rates and estimate, and phone frames. Light and dark are switched with `?theme=`. | `spec/03-pages/08-public-auth.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `08-public-auth-auth.png` (auth frames, 1440 wide), `08-public-auth-marketing.png` (home hero and pricing, 1440), `08-public-auth-mobile.png` (390 frames), `08-public-auth-dark.png` (auth and hero, dark) |

**Contents.**
- **Part 1:** §0 the area in brief, §1 decisions, §2 findings addressed.
- **Part 2:** §3 routes, config and dependencies; §4.1 MarketingLayout; §4.2 AuthLayout.
- **Part 3:** §4.3 theme, §4.4 consent; §5 the marketing home.
- **Part 4:** §6 the rest of the public site; §7 pricing and the pilot request.
- **Part 5:** §8 sign in: password, email link, OAuth, the two-factor code, reasons and errors.
- **Part 6:** §9 create account, confirm email and OAuth sign-up; §10 forgot and reset password.
- **Part 7:** §11 invites; §12 the hand-off into the app and transactional email; §13 the signed-out 404 and auth-level errors.
- **Part 8:** §14 vocabulary and global strings, §15 accessibility, §16 telemetry, §17 cross-cutting acceptance, §18 new components, §19 open questions, §20 traceability.

---

## 0. The area in brief

**Today.** A visitor starts on a dark, violet marketing site. Its hero pairs a gradient headline with a glowing orb and a "LIVE · AGENTS ANSWERING IN 40+ LANGUAGES" eyebrow, and its rotating language pill shows Arabic, Indonesian, German and Spanish (F-VIS-026, F-QA-025). "Start free" promises a free tier with no card (F-QA-011).

The funnel then breaks at several points:
- **Get started.** Every "Get started" goes to `/signup`, which redirects to a light, blue `/login` reading "Welcome Back" (F-QA-010).
- **Signing up.** The only way to sign up is a 12 px grey mono toggle at the bottom of the card (3.8:1). It opens "Register for early access (admin approval required)" and asks for a phone number without saying why (F-QA-030).
- **The form.** Labels are not tied to inputs, the password has `autocomplete="off"`, the show-password toggle is 16 px with no visible focus, and one form uses two different error patterns (F-A11Y-025, F-A11Y-003).
- **The footer** reads "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled" (F-QA-039).
- **Pricing.** `/pricing` has no prices and no navigation. It is an 18-field form whose contact address is on a third-party domain (F-QA-012, F-QA-035).
- **After sign-up.** The `/onboarding` wizard says "You're *live.*" on an account with ₹0 and no calling number (F-UX-006).

In total there are seven type families, two primary colours, two default themes and five product names (F-QA-013, F-VIS-025).

**After.** One brand, from the first page to the first call:
- **Brand.** One brand name ("Vaani Labs"), one hue (Neel), one type system (Hanken Grotesk, JetBrains Mono for tokens only, Noto Sans Devanagari where Hindi is spoken), and one theme rule that follows the system (direction §5, §8 decisions).
- **Home.** The hero shows a real product surface: a recorded call played as TurnRows, with a Hindi turn in Devanagari and the flow step each line came from. It replaces the orb (direction §3.1 "Marketing").
- **Pricing.** Rates come from the same endpoint as Billing. An estimator does the maths, and the enterprise pilot request is six fields.
- **Separate routes.** `/login` and `/signup` are separate routes with their own H1s (direction §6.6). Each form uses the core Field and PasswordInput, validates on the one timing rule (C §8.2), autofills, and names its providers truthfully.
- **Magic link** is a mode, not a direct-send button. The emailed link also carries a 6-digit code, so it works across devices.
- **Hand-off.** After sign-up, a new user confirms their email, creates their workspace (00-app-shell-ia §12.2) and lands on Home's setup track. Nothing says "live" until all five checks pass.

### 0.1 What changes at a glance

| Area | Today | Redesign |
|---|---|---|
| Brand | Violet `#7C6BF5` on dark marketing, blue `#2F5FE0` on light auth, token named `--saffron`; 7 families; 8+ headers; "VaaniLabs", "VaaniVoice", "VV API", "StarVox Labs" | Neel `--accent` in both themes; 3 families; one MarketingLayout; "Vaani Labs" everywhere, legal entity once in the footer |
| Theme | Marketing forced dark; auth, 404 and app light; the toggle's first click does nothing; no toggle on phones | System by default with light fallback; the same pre-paint script as the app; a System/Light/Dark menu in the header and in the phone menu |
| Home hero | Gradient text, orb, waves, tracked eyebrow, ~36-word subtext, four pills, "Talk to the agent" that only scrolls | A solid ink H1 in two lines, subtext of 20 words or fewer, "Get started" plus "Try it live", and the real recorded-call player as the visual |
| Pricing | No prices, no header nav, 19 controls, mono body, `advisio.in` email | Rates table and estimator from the rates endpoint; meeting-minute plans; a 6-field pilot request; one sales address on `vaanilabs.in` |
| `/signup` | Redirects to sign-in | Its own route: "Create your account" (or "Request access"), with a "What happens next" aside |
| Sign-in form | Placeholder-named fields, `autocomplete="off"`, native bubbles plus a stray red banner, 16 px eye toggle | Field + TextInput + PasswordInput, `username` / `current-password`, errors under the field, a 26 px toggle with a visible ring |
| Magic link | A button that sends at once, validated by a banner under the password | "Email me a sign-in link instead" switches mode; "Check your email" accepts the link or a 6-digit code |
| OAuth | Google and Meta with `next=/dashboard` hard-coded; `/security` says Microsoft | OAuthButtons drawn from the auth config; `next` and UTM survive the round trip; `/security` reads the same list |
| Footer | "Neural Platform v2.0.4 — Enterprise Security Enabled" | Privacy · Terms · Security · Status |
| Hand-off | `/onboarding`: "You're *live.*" at ₹0 | Verify email, create workspace, then Home: "Get your first call live · 0 of 5" |

---

## 1. Decisions this spec settles

| # | Question | Decision | Why |
|---|---|---|---|
| PA1 | Which brand does the public site use? | The app's: `tokens.css` and `base.css` are loaded by the marketing build too, with Neel as the only accent. Violet, cyan, gradient text, orbs and waves are retired. | F-QA-013, F-VIS-025, F-VIS-004; direction §8 "Accent … including marketing and the logo". |
| PA2 | Default theme for marketing and auth | **System**, with light as the fallback. The same `THEME_BOOT` script and `vaani:theme` key as the app, so a visitor who picks Dark keeps it after signing in. | Direction §8; F-QA-026. Two default themes are what made the brand switch at "Get started". |
| PA3 | What is the access model? | The product owner chooses (§19 Q1). This spec builds both behind one flag, `access.mode = 'self-serve' \| 'approval'`, read from the claims sheet (§3.3). The CTA label, the sign-up H1 and the pending screen change with it. Copy that is not true in the chosen mode ("Free tier", "No card", "Start free") is not rendered. | F-QA-011: the funnel made four incompatible promises. |
| PA4 | One claims source | Language names and counts, the latency definition, OAuth providers, meeting platforms, the compliance phrase, data residency, the sales address and the booking link all come from `content/claims.ts`. Pages never hard-code them. A copy lint fails on "certified" or "compliant" outside `/security`. | F-QA-001, F-QA-009, F-QA-025, F-QA-035. |
| PA5 | Are `/login` and `/signup` separate? | Yes. They are separate routes with their own H1, `<title>` and analytics. They link to each other **directly under the H1**, not at the bottom of the card. No SegmentedControl is used, because C §6.4 reserves it for in-place views, not navigation. | F-QA-010, F-A11Y-026; direction §6.6. |
| PA6 | Magic link | It is a **mode** of `/login` (`?method=link`) that hides the password field. The email carries a button **and** a 6-digit code. "Check your email" accepts the code, so a link opened on a phone can still sign in the laptop. | F-QA-030 (direct-send button, two validation patterns). |
| PA7 | Phone number at sign-up | **Not asked.** A mobile number is asked where it has a job: Home's "Call yourself" step verifies it (00-app-shell-ia §13.3). | F-QA-030 ("required, with no reason given"). |
| PA8 | Terms and privacy | One sentence under the create button: "By creating an account, you agree to the Terms and the Privacy policy." There is no pre-ticked box. The same sentence sits under the OAuth buttons on `/signup` and on the OAuth confirm screen. | F-QA-030. |
| PA9 | OAuth providers and names | Render only providers that are live in the auth config. Today that is Google and the Facebook login behind "Continue with Meta" (`/api/auth/oauth/facebook`). The label names the account people hold: "Continue with Facebook", pending a brand-guideline check (§19 Q4). Microsoft appears only when it ships, and `/security` reads the same list. | F-QA-009, F-QA-025. |
| PA10 | Signed-in visitors | Marketing header: "Sign in" and "Get started" become **Open app**, which goes to the landing route (00-app-shell-ia §2.5). `/login` and `/signup` show a SignedInPanel ("You're signed in as Anika R.") with **Continue to Vaani Labs** and "Use a different account". Neither page ever redirects silently. | F-UX-029; invite links opened while signed in as someone else. |
| PA11 | Analytics before consent | On public and auth pages, analytics is cookieless (memory persistence) until the visitor chooses **Allow analytics** in the ConsentBar. Do Not Track and Global Privacy Control count as Decline. Session replay never loads on auth pages. | F-QA-033, F-UX-045. |
| PA12 | Motion on marketing | No entrance, scroll-reveal or idle animation. The only moving thing is the demo player while its real audio plays. The H1 is visible at first paint. | F-QA-032, F-VIS-026, F-A11Y-022; direction P7. |
| PA13 | Where auth errors appear | Field errors go under the field (C §3.1). Form-level failures appear as one InlineError above the primary button (C §8.2 V7). A **reason** for being on the page (expired, signed out, link expired) is a Notice at the top of the form. Native browser bubbles are never used (`noValidate`). | F-QA-030, F-A11Y-025. |
| PA14 | `/build.html` | It moves into the marketing shell as **`/try`** ("Try it live") with a 308 redirect. It is promoted in the header and hero, and its "Get started" goes to `/signup`. | F-QA-034, F-QA-010, F-QA-013. |

---

## 2. Audit findings addressed

| Finding | Sev. | Today | What changes | § |
|---|---|---|---|---|
| F-QA-010 | high | `/signup` redirects to sign-in; the sign-up toggle is 12 px grey mono at the card's foot, and its mode is not in the URL | `/signup` renders "Create your account" with an H1; a sign-in/create link sits under each H1; `next` and UTM survive OAuth; a synthetic check guards the route | 9, 12 |
| F-QA-011 | high | Free tier, then approval-gated early access, then a sales-led pilot, then a prepaid price list | `access.mode` flag; one access sentence reused by the hero, `/signup`, `/pricing` and the pending screen; untrue promises not rendered | 1, 3.3, 7, 9 |
| F-QA-012 | high | `/pricing`: no prices, no header nav, 19 controls with placeholder labels, mono body, `advisio.in` email | Rebuilt on MarketingLayout: rates table and estimator, PlanCards, a 6-field pilot request with labels and autocomplete, one sales address | 7 |
| F-QA-013 | high | 8+ headers, 7 families, violet and blue primaries, two default themes, five names | One MarketingLayout, three families, Neel, the system theme, "Vaani Labs" | 4, 6 |
| F-QA-001 | critical | `/about` claims a named bank pilot, a $12M round and SOC 2 certification | Claims sheet, copy lint and a named publishing owner; `/about` cut to verifiable facts (content owner) | 3.3, 6 |
| F-QA-009 | high | "SOC 2 compliant", "compliant by default" vs `/security`'s "readiness in progress" | One compliance phrase from the claims sheet; `/security` is the only page that states status | 3.3, 5, 6 |
| F-QA-007 (auth part) | high | A slow auth call drops tabs on a bare `/login` with no `next` and no reason | `/login?next=…&reason=expired` shows "Your session expired…" and returns the user to `next` | 8.7 |
| F-QA-025 | medium | Languages "10+ / 12+ / 22 / 40+"; OAuth "Google and Microsoft" vs Google and Meta | Claims sheet; OAuthButtons from the auth config | 3.3, 8.4 |
| F-QA-026 | medium | Theme toggle out of sync, React #418 on every page, no toggle on phones | Pre-paint `THEME_BOOT`; ThemeMenu reads the same attribute; the theme is in the phone menu | 4.3 |
| F-QA-027 | medium | Dead anchors (`#capabilities`, `#features`, `#demo`, `#how`), non-link cards, a "Coming soon" careers link | Every anchor has a target; a CI link and anchor crawl; interactive-looking cards are links | 5, 6 |
| F-QA-028 | medium | `/enterprise` reads like a sales runbook; raw paths as link text | Rewritten for buyers (content brief); descriptive links | 6 |
| F-QA-029 | medium | Static "All Systems Operational" footer; stale changelog | The footer shows status only when it is fed by monitoring; otherwise just a "Status" link | 4.1, 6 |
| F-QA-030 | medium | Native bubbles plus a stray red banner; unexplained phone field; no password rules; no Terms; no approval expectations | One error pattern; magic link as a mode; no phone; live password rules; the Terms sentence; "What happens next" and the pending screen | 8, 9 |
| F-QA-031 | medium | The envelope icon overlaps the text; "Vaani Labsaccount"; "4paise / sec" | TextInput's leading-icon padding (C §3.2) and a copy lint for joins and unit spacing | 10, 14 |
| F-QA-032 | medium | LCP 3.4 s on a delayed-entrance H1; 20 font files; CLS 0.175 | Visible H1 at first paint; three families; reserved media boxes; budgets | 5.9 |
| F-QA-033 | medium | A 365-day analytics cookie before any consent | Cookieless until Allow; ConsentBar; DNT and GPC respected | 4.4 |
| F-QA-034 | medium | Unverifiable testimonials; "Talk to the agent" only scrolls | The real recorded call is the hero; "Try it live" → `/try`; quotes only with written permission | 5, 6 |
| F-QA-035 | medium | Contact across three domains and two sales paths | One sales address and one booking link from the claims sheet | 3.3, 7 |
| F-QA-039 | low | Sci-fi 404; "Enterprise Security Enabled" on login | A plain 404 in the marketing shell; Privacy · Terms · Security · Status | 4.2, 13 |
| F-QA-040 | low | Emoji icons, two eyebrow styles, three container widths, a cropped carousel | Lucide only, no eyebrows, one container, a grid in place of the carousel | 5 |
| F-VIS-001 | high | Five dialects; `/login` mostly mono | Hanken throughout; mono only for tokens | 4.2 |
| F-VIS-025 | medium | Public, login and app are three visual systems | One token set; AuthLayout uses the app's planes and controls | 4 |
| F-VIS-026 | medium | The hero reads as a generic AI template | Solid ink H1, ≤ 20-word subtext, a real product visual, no pills in the hero | 5 |
| F-VIS-004 | medium | The brand hue changes by theme and feature | One Neel hue in both themes | 1 |
| F-VIS-008 | medium | UI falls back to the system font | next/font variables on `<html>` in the marketing build too; a test asserts Hanken | 4 |
| F-A11Y-009 | high | Black or ink text on blue, white on violet at 3.98:1 | Primary Button with `--on-accent` (7.68 / 6.21:1) | 4, 8 |
| F-A11Y-003 | high | Login labels are not associated with their inputs | Field renders `<label for>`; placeholders are optional examples | 8, 9 |
| F-A11Y-006 | high | The password toggle has no visible focus | Core PasswordInput toggle with an inset focus ring | 8 |
| F-A11Y-025 | medium | `autocomplete` missing or `off`; 16 px toggle; dotted placeholder | `username` / `current-password` / `new-password` / `one-time-code`; 26 px toggle with a 24 px hit area; no password placeholder | 8, 9, 10 |
| F-A11Y-026 | medium | No H1 or landmarks on `/login`; no `main` on public pages; H2 to H4 jumps | H1 per page inside `main`; header/nav/main/footer on every public page; ordered headings | 4, 5 |
| F-A11Y-021 | medium | Scrolled light nav at 1.39:1 | A solid `--surface` header with no blur or alpha; both themes pass | 4.1 |
| F-A11Y-029 | medium | Unfocusable scroll regions; CTA at 3.98:1 | No nested scrollers (disclosure instead); Neel primary | 5 |
| F-A11Y-023 | medium | 16–17 px tall auth links and toggle | Every target ≥ 24 px (44 px on touch) | 8, 15 |
| F-A11Y-020 | medium | Placeholders as labels | Real labels everywhere, including the pilot form | 7, 8 |
| F-RWD-017 | medium | Marketing nav overflows at 768–840 and wraps at ≤ 1060 | Full nav from 1024; menu button plus Sign in and Get started below it; `nowrap` | 4.1 |
| F-RWD-018 | low | 14 px inputs, a clipped flow demo, a menu that ignores Esc, 11.7-screen home | 16 px inputs on touch; the menu is a modal Sheet; the home targets ≤ 6 screens at 390 | 4.1, 5 |
| F-UX-006 | high | "You're live" at ₹0 | Hand-off lands on Home's setup track; "live" only after five checks | 12 |
| F-UX-001 | critical | Organisation creation dead-ends | The workspace is created at sign-up with the user as admin (00-app-shell-ia §12.2) | 12 |
| F-UX-029 | medium | The in-app logo and the 404 send signed-in users to marketing | "Open app" on marketing for signed-in visitors; signed-out 404 in the marketing shell | 4.1, 13 |
| F-UX-043 | medium | Brand spelled 4+ ways; em-dash separators | "Vaani Labs"; a middle dot or a full stop | 14 |
| F-UX-045 | medium | Analytics and replay load on personal-data pages | No replay on auth pages; cookieless until consent | 4.4, 16 |
| F-UX-044 | medium | No sign-out-everywhere | Reset password offers "Sign out of other devices" (Settings › Security owns the session list) | 10 |
| F-RWD-019 | low | `/onboarding` scrolls sideways and cannot be found again | Replaced by Home (00-app-shell-ia §13) | 12 |
