<!-- Assembled from 08-public-auth.part1.md, 08-public-auth.part2.md, 08-public-auth.part3.md, 08-public-auth.part4.md, 08-public-auth.part5.md, 08-public-auth.part6.md, 08-public-auth.part7.md, 08-public-auth.part8.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

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

---

## 3. Routes, config and dependencies

### 3.1 Public routes (marketing shell)

| Route | H1 | `<title>` | Change |
|---|---|---|---|
| `/` | "Phone agents that speak your customers' language." | Vaani Labs · The voice AI that speaks India | §5 |
| `/pricing` | Pricing | Pricing · Vaani Labs | §7 |
| `/try` (308 from `/build.html`) | Try it live | Try it live · Vaani Labs | §6 (PA14) |
| `/enterprise` | Enterprise pilots | Enterprise · Vaani Labs | §6 |
| `/security` | Security | Security · Vaani Labs | §6: the single source for compliance status |
| `/docs`, `/docs/*` | the doc's title | `{title} · Docs · Vaani Labs` | §6: the same shell plus a left rail |
| `/contact`, `/about`, `/changelog`, `/status`, `/privacy`, `/terms`, `/refund-policy`, `/cookies` | the page name | `{name} · Vaani Labs` | §6 |
| any unknown route, signed out | Page not found | Page not found · Vaani Labs | §13 |

`/blog` and `/careers` are hidden from navigation until they have real content (F-QA-027). `/robots.txt` and `/sitemap.xml` are generated from this table (they return 404 today, audit 1.3 H).

### 3.2 Auth routes (bare shell)

These are added to the **bare** mode list in 00-app-shell-ia §3.2, which today lists only `/login`, `/signup`, `/signup/workspace`, `/signup/pending` and `/forgot-password`.

| Route | Purpose | H1 | `<title>` | Query |
|---|---|---|---|---|
| `/login` | Sign in with a password, Google or Facebook | Sign in | Sign in · Vaani Labs | `next`, `reason`, `method=link` |
| `/login?method=link` | Ask for a sign-in link | Sign in with an email link | Sign in · Vaani Labs | `next` |
| `/login/check-email` | Link sent; enter the code instead | Check your email | Check your email · Vaani Labs | none |
| `/login/code` | Two-factor code (TOTP), when the account has it on | Enter your code | Two-factor code · Vaani Labs | none |
| `/auth/link?token=` | Magic-link landing | none (transient) | Signing in · Vaani Labs | token |
| `/auth/callback/<provider>` | OAuth return | none (transient) | Signing in · Vaani Labs | provider params |
| `/signup` | Create an account, or request access | Create your account · or · Request access | Create account · Vaani Labs | `next`, `utm_*` |
| `/signup/confirm` | A new account through Google or Facebook: confirm and accept the terms | Create your Vaani Labs account | Create account · Vaani Labs | none |
| `/signup/verify` | Confirm the email address (link or code) | Confirm your email | Confirm your email · Vaani Labs | none |
| `/auth/verify?token=` | Verification landing | none (transient) | Confirming · Vaani Labs | token |
| `/signup/workspace`, `/signup/pending` | Owned by 00-app-shell-ia §12.2 | | | |
| `/forgot-password` | Ask for a reset link | Reset your password | Reset password · Vaani Labs | none |
| `/reset-password?token=` | Set a new password | Set a new password | Set a new password · Vaani Labs | token |
| `/invite/<token>` | Accept a workspace invite | Join Sample Realty | Join Sample Realty · Vaani Labs | none |

**URL rules.**
- **No email address or personal data in any URL** (safety rule; F-UX-045). Prefill between pages uses `sessionStorage` (`vaani:auth-email`), which is cleared on successful sign-in.
- **Tokens are single-use and short-lived.** The landing route exchanges the token server-side, then calls `history.replaceState` to drop it. Token routes send `Referrer-Policy: no-referrer` and `Cache-Control: no-store`.
- **`next`** is accepted only as a same-origin path starting with a single `/` and matching an app route. Anything else is dropped silently (no open redirect). It survives:
  - the Sign in ↔ Create account links;
  - the magic link (stored with the token);
  - OAuth (inside the `state` nonce);
  - email verification and workspace creation.

  It is finally resolved by the landing logic (00-app-shell-ia §2.5).
- **`utm_*` and the referrer** are captured on the first public page view into `sessionStorage` (not a cookie). They are sent once with the sign-up request as `attribution` and never appear on auth URLs after that.
- **`reason`** takes one of `expired`, `signed-out`, `password-changed`, `link-expired`, `link-used`, `oauth-cancelled`, `oauth-failed`, `approved`, `verified` (copy in §8.7). An unknown value is ignored.
- **Signed-in visits** to `/login` or `/signup` show the SignedInPanel (§4.2), never a silent redirect (PA10).

### 3.3 The claims sheet and access mode (`content/claims.ts`)

One typed file feeds every public page, the auth pages, the transactional email and `/security`. Values below are placeholders that the owner must confirm (§19). Each entry carries `owner` and `verifiedOn`, and CI fails when `verifiedOn` is older than 90 days.

```ts
export const claims = {
  brand:   { name: 'Vaani Labs', agent: 'Vaani', legalLine: 'Vaani Labs is a product of <legal entity>.' },  // Q6
  access:  { mode: 'self-serve' as 'self-serve' | 'approval',                                      // Q1
             reviewTime: null as string | null,            // 'within one working day' only if it is the real SLA
             cardAtSignup: false, freeAllowance: null as string | null },                          // Q2
  languages: { featured: ['Hindi', 'English', 'Hinglish', 'Tamil', 'Telugu', 'Marathi', 'Bengali'],
               indianCount: null as number | null, totalCount: null as number | null },            // Q3
  latency:  { text: null as string | null, definition: 'median time from the caller finishing to Vaani starting to speak' },
  channels: ['Phone', 'WhatsApp', 'Browser', 'Meetings'], meetingPlatforms: ['Vaani meeting rooms'], // Q3
  auth:     { providers: ['google', 'facebook'] as const, magicLink: true, twoStep: 'totp' },     // Q4
  compliance: { soc2: 'SOC 2 Type II: readiness in progress (observation window from Q4 2026)',
                residency: 'Data stored in India (AWS Mumbai)' },
  contact:  { sales: 'sales@vaanilabs.in', support: 'support@vaanilabs.in', booking: '<one booking link>',
              hours: 'Mon to Fri, 11 am to 7 pm IST', address: 'Mumbai' },                        // Q6
  status:   { live: false },   // true only when /status is fed by monitoring (F-QA-029)
} as const;
```

| Mode | Header and hero CTA | `/signup` H1 · button | After sign-up | Reassurance line (only if true) |
|---|---|---|---|---|
| `self-serve` | **Get started** | Create your account · **Create account** | Verify, then `/signup/workspace`, then `/home` | "Prepaid in rupees · no card to sign up" |
| `approval` | **Request access** | Request access · **Request access** | Verify, then `/signup/pending`; the approval email opens `/login?reason=approved` | "We review requests {reviewTime}" |

"Start free", "Free tier" and "Cancel anytime" render only when `access.freeAllowance` is set, and then they name the allowance ("Includes 30 free meeting minutes a month"). **Copy lint** (CI, over `content/`, `app/(marketing)` and email templates):
- fails on "certified", "compliant", "SOC 2 compliant", "guarantee", "every Indian language", "Neural", "VaaniVoice", "Vani Voice", "VV API", "Recharge", "Oops" and an exclamation mark in UI strings;
- fails on the em-dash used as a separator;
- fails on the regexes `[a-z][A-Z]` (joins such as "Labsaccount") and `\d(paise|ms|s)\b` without a space;
- `/security` and `/privacy` are allow-listed for the compliance words.

### 3.4 Dependencies and interim behaviour

Until each backend item ships, its UI state is **hidden, not simulated** (direction §8).

| # | Needs | Used by | Interim |
|---|---|---|---|
| A1 | `/signup` served as a route; the create-account API with `attribution` and `mode` | §9 | None. This is the F-QA-010 fix and it blocks launch. |
| A2 | A verification email carrying both a link and a 6-digit code | §9.3 | Link only; the code field is not rendered |
| A3 | A magic link with a code; expiry from config (proposed 15 min) | §8.3 | Link only; the expiry sentence uses the real value |
| A4 | OAuth `state` that carries `next`, `attribution` and intent (sign in or sign up); a provider list from config | §8.4 | The provider list comes from the claims sheet. `next` falls back to the landing route, never a hard-coded `/dashboard`. |
| A5 | A session endpoint returning name, masked email and workspace | SignedInPanel §4.2 | The panel shows name only |
| A6 | 429 responses with `Retry-After` on sign-in, reset, link and code | §8.7 | A generic "Too many attempts. Try again in a minute." |
| A7 | TOTP challenge and recovery codes (Settings supports TOTP today) | §8.5 | Already live; the page must exist from day one |
| A8 | Invite tokens with inviter, workspace, role and email | §11 | none |
| A9 | Pending-approval state and the approval email (approval mode only) | §12 | none |
| A10 | Public rates endpoint (the Billing spec's BL1, served without auth, cached) | §5, §7 | Values from the claims sheet with "Rates as of {date}" |
| A11 | A pilot-request endpoint delivering to the one sales address | §7.6 | A `mailto:` of the sales address with the fields listed |
| A12 | A monitoring-backed status feed | footer §4.1 | The footer shows a plain "Status" link and no state |

---

## 4. Shared frames

### 4.1 MarketingLayout (every public page)

**Anatomy and landmarks** (DOM order equals focus order): SkipLink "Skip to main content" · `<header>` holding MarketingHeader and `<nav aria-label="Main">` · `<main id="main" tabindex="-1">` · `<footer>` holding MarketingFooter · ConsentBar (§4.4) · Toast viewport. Every public page has exactly one H1, inside `main` (F-A11Y-026).

**Grid.** The container is `--size-container-page` (1280) centred, with `--page-margin` 24 / 24 / 16 and `--grid-columns` 12 / 8 / 4. Section padding-block is `--space-80` at ≥1024, `--space-64` at 768–1023 and `--space-48` below 768. There are no decorative section backgrounds. Product surfaces (the player, the flow strip, tables) sit on `--surface` with a 1 px `--border` and `--radius-8`, over the `--bg` page. One container width everywhere (F-QA-040).

**Type.**
- **Hero H1:** `display-56` at ≥1280, 48/52 at 768–1279, 40/44 below 768. The 1024–1279 step borrows the tablet size so the two-column hero keeps its H1 to two lines.
- **Section H2:** `display-40` (32/40 on phones).
- **H3:** `title-24` (20/28 on phones), or `title-16` inside cards.
- **Body:** `lead-16` for lead paragraphs and `body-16` for body copy.
- **Mono** is used only for tokens inside product fragments (masked numbers, timecodes).
- **No eyebrows**, no tracked caps and no § numerals (F-VIS-001, F-VIS-010).

**MarketingHeader** (height `--size-header` 56):
- **Surface:** solid `--surface` with a 1 px `--border` bottom, sticky at `--z-sticky`. No alpha and no blur, so link contrast holds in both themes at any scroll position (F-A11Y-021).
- **Left:** the Lockup, a V tile (`--ink-tile` / `--ink-tile-fg`, 24 px, `--radius-6`) plus "Vaani Labs" in `title-16`. It links to `/` with the name "Vaani Labs home".
- **Nav links** (`label-13`, `--text-2`; hover `--text`): **Try it live · Pricing · Enterprise · Security · Docs**. The current page gets `--text`, a 2 px `--accent-mark` underline and `aria-current="page"`. "Product", `#capabilities` and "Build your own" in cyan are retired.
- **Right:** ThemeMenu (§4.3), **Sign in** (Button tertiary md) and the access CTA (Button primary md: **Get started** or **Request access**). For a signed-in visitor these two become **Open app** (primary), which goes to the landing route (PA10).
- **Wrapping:** every label is `white-space: nowrap`. A CI check asserts `scrollWidth <= innerWidth` at 768, 834, 1024 and 1280 (F-RWD-017).

```
≥1280  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
       │ [V] Vaani Labs    Try it live  Pricing  Enterprise  Security  Docs        ◐ Sign in [Get started] │ 56
       └─────────────────────────────────────────────────────────────────────────────────────────────┘
1024–  ┌──────────────────────────────────────────────────────────────────────────────┐
1279   │ [V] Vaani Labs  Try it live  Pricing  Enterprise  Security  Docs  ◐ Sign in [Get started] │  same row; gaps 16
       └──────────────────────────────────────────────────────────────────────────────┘
768–   ┌──────────────────────────────────────────────────────────┐
1023   │ [V] Vaani Labs                      Sign in [Get started] ≡ │  menu button 32 (44 on touch)
       └──────────────────────────────────────────────────────────┘
<768   ┌──────────────────────────────────┐
       │ [V] Vaani Labs      [Get started] ≡ │  CTA size sm (36 visible, 44 hit); menu 44; below 360 the wordmark hides
       └──────────────────────────────────┘
```

**MobileMenu** (768–1023 and below 768). A modal `Sheet` opened by the IconButton "Menu" (`menu` / `x`, `aria-expanded`, `aria-controls`). It is 320 px from the right on tablets and full screen on phones, over a flat `--scrim`. Contents:
- the five links as 48 px rows;
- a hairline;
- "Theme" as a full-width SegmentedControl (System · Light · Dark);
- a hairline;
- **Sign in** (secondary lg, full width) and the access CTA (primary lg, full width). A signed-in visitor sees **Open app** only.

Behaviour: Esc and the close button return focus to the menu button, and focus is trapped while it is open (O §1.3; F-RWD-018 found a menu that ignored Esc). Choosing a link closes the sheet.

**MarketingFooter** is the **marketing echo of the Baseline**: the band uses the Baseline tokens (`--bl-bg`, text `--bl-text`, headings and hover `--bl-strong`, separators `--bl-sep`, focus `--bl-focus`), so the public site ends on the same ink band the app keeps under every screen (direction §3.1). Contrast is 11.36 / 7.47:1.

| Column (`label-13` `--bl-strong` heading, real case, no CSS uppercase) | Links (`data-13`, 32 px rows; 44 on touch) |
|---|---|
| Product | Try it live · Pricing · Docs · Changelog |
| Company | About · Contact · Careers (only while hiring) |
| Trust | Security · Status · Privacy · Terms · Refund policy · Cookie settings |
| Talk to us | `sales@…` · `support@…` (from the claims sheet) · Book a call (the one booking link; `external-link` icon because it leaves the site) · Mumbai |

The bottom row holds the V tile, "© 2026 Vaani Labs. {legalLine}" (`meta-12`) and social links (brand SVGs, named). When `status.live` is true it adds a StatusText ("All systems normal · checked 2 min ago", or the real incident). Otherwise nothing claims health (F-QA-029). The footer is 4 columns at ≥1024, 2 at 480–1023 and 1 below 480.

**States:** signed in (Open app) · offline (the static page still renders; each form shows the InlineError "Can't reach Vaani Labs. Check your connection." with Retry) · no JavaScript (all content and links render; the menu button falls back to the footer's links, and the footer is reached with the skip link's sibling "Skip to site links").

### 4.2 AuthLayout (bare shell for every auth route)

One centred column, no navigation, the same tokens and type as the app (F-VIS-025, F-QA-039). **No grid texture, glow or gradient behind the card.** The grid background is retired (direction §7.1–2).

| Part | Tokens |
|---|---|
| Page | `--bg`; `min-height: 100dvh`; the stack is centred vertically with `padding-block: var(--space-48)` |
| Lockup | V tile 24 plus "Vaani Labs" (`title-16`), linking to `/` ("Vaani Labs home"). It replaces "← Back to home", which duplicated the logo link |
| Panel (≥768) | `--surface`, 1 px `--border`, `--radius-12`, `--e0`, padding `--space-32`; the column inside is `--size-container-narrow` (400), so the panel is 464 wide. `--space-24` below the lockup |
| Panel (<768) | No panel: the page becomes `--surface`, the column fills `100% − 2 × --page-margin`, and the lockup sits top-left at 16 / 24 |
| H1 | `title-24` (20/28 below 768), `text-wrap: balance`; one line of `body-14` `--text-2` under it holding the cross-link ("New to Vaani Labs? **Create an account**") |
| Reason notice | `Notice` scope `inline`, directly under the H1 line (§8.7) |
| OAuth block | OAuthButtons (§18) stacked, `--space-8` apart, then the "or" divider (`meta-12` `--text-3` between hairlines, `--space-20` above and below) |
| Fields | `Field` + `TextInput` / `PasswordInput` size **lg** (40; 44 and 16 px text on touch), `--space-field-gap` 16 apart (C §1.4, §3) |
| Actions | Primary `Button` lg `fullWidth`, `--space-24` below the last field; one link-button below it at `--space-16` |
| Form error | `InlineError` directly above the primary button, `role="alert"` (C §8.2 V7) |
| Footer | `<nav aria-label="Legal">` under the panel at `--space-24`: **Privacy · Terms · Security · Status** (`meta-12` `--text-2`, underline on hover, each ≥ 24 px tall). It replaces "Neural Platform v2.0.4 — Enterprise Security Enabled" (F-QA-039) |
| Aside (`/signup` only, ≥1024) | 320 wide (`--size-inspector`), `--space-40` gap, top-aligned, unboxed on `--bg`: "What happens next" (§9.2) |

```
Desktop ≥1024 (1440×900)                               Phone (390×844)
                  [V] Vaani Labs                        ┌──────────────────────────┐
          ┌──────────────── 464 ────────────────┐       │ [V] Vaani Labs           │
          │ Sign in                    title-24  │       │                          │
          │ New to Vaani Labs? Create an account │       │ Sign in         title-20 │
          │ [G  Continue with Google          ]  │       │ New to Vaani Labs?       │
          │ [f  Continue with Facebook        ]  │       │ Create an account        │
          │ ─────────────── or ───────────────   │       │ [G Continue with Google] │ 44
          │ Email                                │       │ [f Continue with Facebook│
          │ [ name@company.com…             ]  40│       │ ────────── or ────────── │
          │ Password          Forgot password?   │       │ Email                    │
          │ [                             (eye)] │       │ [                      ] │ 44, 16 px
          │ [             Sign in             ]  │       │ Password  Forgot password?│
          │ Email me a sign-in link instead      │       │ [                  (eye)] │
          └──────────────────────────────────────┘       │ [        Sign in       ] │
            Privacy · Terms · Security · Status          │ Email me a sign-in link  │
                                                        │ instead                  │
Tablet 768–1023: identical panel, centred.              │ Privacy · Terms ·        │
                                                        │ Security · Status        │
                                                        └──────────────────────────┘
```

**SignedInPanel.** It replaces the form when a session exists on `/login` or `/signup`:
- `Avatar` (initials) plus the name (`title-14`) and a meta line in `meta-12` `--text-3`: "a•••@company.com · Sample Realty".
- Primary **Continue to Vaani Labs**, which goes to `next` or the landing route.
- Tertiary **Use a different account**, which signs out and reloads the same URL.
- On `/signup` the H1 reads "You already have an account".

**Keyboard and focus:**
- Tab order: lockup, the reason Notice's action (if any), the cross-link, OAuth buttons, fields, the primary, the secondary link, then the footer links.
- Autofocus goes to the first empty field **only** on fine pointers at ≥1024 with no reason Notice shown, so phones never pop the keyboard unasked.
- Enter submits.
- After a failed submit, focus goes to the first invalid field (C §8.2 V4; auth forms have three fields or fewer).

---

### 4.3 Theme on public and auth pages

- The same `THEME_BOOT` inline script as the app (foundations §15.3) runs before paint on every public and auth page. It reads `vaani:theme` and sets `data-theme` plus `data-theme-choice` (system | light | dark) on `<html>`. It is the only theme mechanism, and `suppressHydrationWarning` sits on `<html>` only.
- **ThemeMenu** is an IconButton tertiary md, labelled "Theme: System" (the current choice is in the name). It opens a `Menu` with radio items **System · Light · Dark**.
  - All three icons (`monitor`, `sun`, `moon`) are in the markup, and CSS shows the one matching `html[data-theme-choice]`. The server and client markup are therefore identical, which removes the #418 mismatch and the dead first click (F-QA-026).
- Phones get the SegmentedControl in the MobileMenu. Auth pages have no theme control; they follow the stored choice.
- `<meta name="theme-color">` follows `--bg`. Changing theme sends no network request.

### 4.4 Consent (ConsentBar)

A non-modal panel, shown on the first visit to any public or auth page, that never blocks the page (F-QA-033, F-UX-045).

| Part | Spec |
|---|---|
| Container | `--surface-raised`, 1 px `--border-overlay`, `--e3`, `--radius-8`, padding `--space-16`; bottom-left at `--page-margin`, max width `--size-toast` (400) at ≥768; full width above `env(safe-area-inset-bottom)` on phones; `--z-toast` |
| Copy | `label-13` "Allow analytics?" then `body-14` `--text-2`: "We use one analytics tool to see which pages help. It stays off unless you allow it." plus a link to the **Cookie policy** |
| Actions | **Allow** and **Decline**: two secondary Buttons of equal size and weight (no dark pattern), `--space-8` apart |
| ARIA | `role="region"` `aria-label="Analytics choice"`; it does not take focus; it sits after `main` in the DOM; `scroll-padding-bottom` equals its height so it never covers a focused element |

Rules:
- Before a choice: only cookieless, anonymous page counts (`persistence: 'memory'`, no autocapture, no replay).
- Do Not Track or Global Privacy Control means Decline, and the bar is not shown.
- The choice is kept for 12 months in the strictly necessary first-party cookie `vaani_consent`. The footer's "Cookie settings" reopens the bar.
- Session replay never loads on public or auth routes, whatever the choice.
- In-app analytics is governed by workspace settings (outside this spec).

---

## 5. Marketing home (`/`)

### 5.1 Purpose and jobs to be done

**Primary job.** *When I run calls for an Indian business, I want to see within a minute that Vaani can hold a real call in my customers' language and that I control what it says, so I can decide to try it.*

| # | Visitor | Job | Where |
|---|---|---|---|
| H1 | SMB founder or ops lead (the main buyer) | Hear a real call, understand the model, start | Hero player → Get started or Try it live |
| H2 | Enterprise buyer | Check control, security and a pilot path | "Nothing goes live by accident", Security, Pricing › Enterprise pilot |
| H3 | Developer | Find the API and docs | Header Docs, footer |
| H4 | Returning customer | Get into the app | Sign in, or Open app when signed in |

**Not this page's job:** long-form security (that is `/security`), price negotiation (that is `/pricing`) or a live conversation (that is `/try`, which needs consent and a phone number).

**Success signals** (§5.12): the share of visits that press Play; CTA click-through by location; `/try` starts; sign-ups per 100 visits; LCP and CLS at the 75th percentile.

### 5.2 Findings addressed

- **F-VIS-026:** the template-like hero is replaced.
- **F-QA-034:** "Talk to the agent" over-promised; unverifiable testimonials are removed.
- **F-QA-025:** the hero never mentioned India, and the language counts disagreed.
- **F-QA-027:** dead anchors.
- **F-QA-032:** a slow LCP and a heavy font payload.
- **F-QA-040:** emoji icons, two eyebrow styles, a cropped carousel.
- **F-A11Y-029:** unfocusable scroll regions and a CTA at 3.98:1.
- **F-A11Y-021:** the scrolled light nav at 1.39:1.
- **F-A11Y-026:** H2 to H4 jumps.
- **F-RWD-018:** a clipped flow demo and a home 11.7 screens long.

Strengths kept (audit §4, PUBLIC-SITE §9):
- the "Hear it work" industry × scenario × English/हिंदी demo;
- the India-specific use-case cards (EMI, DPD, COD, admissions);
- the candid security section;
- the final CTA triad.

### 5.3 Information hierarchy

1. **The H1 and its one-line promise.** A solid ink H1 on its own row, two lines at most from 768 up (a 28ch measure). The tagline's idea ("speaks India") is carried by the words and the transcript, not by a gradient.
2. **The proof: a real recorded call.** A Devanagari turn beside an English one, each line tied to the flow step that produced it, and the outcome it wrote ("Visit booked"). This is the product's own TurnRow, not an illustration.
3. **The two actions:** **Get started** (or Request access) and **Try it live**.
4. Then, in order: key facts, how flows are built, control and safety, industries, channels, security, pricing, the final CTA.

### 5.4 Section plan

Every section has an `id`, and every nav, footer or legacy anchor resolves to one (F-QA-027). Legacy hashes map client-side: `#capabilities` → `#flows`, `#features` → `#control`, `#demo` → `#top`, `#how` → `#flows`.

| # | `id` | Heading (H2 unless noted) | Content | Components |
|---|---|---|---|---|
| 1 | `top` | H1 "Phone agents that speak your customers' language." | Sub: "Vaani calls leads, answers inbound calls and books visits in Hindi, English, Hinglish and more. You design every step." (19 words). CTAs. A reassurance line from the claims sheet. The **DemoPlayer**. | Button lg (primary, secondary), DemoPlayer (§18) |
| 2 | `facts` | none: a `<ul aria-label="Key facts">` | Four facts from `claims.ts`, each a 16 px Lucide icon + `label-13` + `meta-12`: "Hindi, English, Hinglish and {n} more" (`languages`) · "{residency}" (`map-pin`) · "Prepaid in rupees, per-second rates" (`wallet`) · "Nothing goes live until you publish" (`workflow`). At ≥1024 they sit as a vertical list under the CTAs in the hero's copy column, filling the space beside the player; below 1024 they follow the hero (2 × 2 on tablets, a list on phones). Hairlines between items; no pills. | — |
| 3 | `flows` | "Design every step of the call." | Left: the **TemplateStrip** "Site visit" (Trigger · Inbound call → Logic · Ask about a site visit, with answer rows "Yes · haan, zaroor" / "Later · baad mein" / "No reply · after 6 s" → Action · Book site visit → Outcome · Visit booked). Right: three points (Trigger, Logic, Action, Outcome; answers in Hinglish; test on your own phone before customers hear it) and the link "Try a flow live". | TemplateStrip (§18), static, 12 px floor |
| 4 | `control` | "Nothing goes live by accident." | Three `Card plain`s, each with one real UI fragment: **Publish on purpose** (VersionChip "Draft · 3 changes" next to StatusTag "Live v7"; "Callers hear v7 until you publish."); **Checked before every call** (the Call gate cost line "2 calls · about 1 to 2 min each · ₹5 to ₹10" with calling hours in IST and DND); **Every call on the record** (StatusTag "Visit booked", the AI summary's first line, LanguageMarks). | Card, VersionChip, StatusTag, LanguageMark |
| 5 | `industries` | "Built for the calls Indian businesses make." | Six `Card plain`s in a **grid** (no carousel): Lending and collections (EMI and DPD reminders), Real estate (site visits), E-commerce (COD confirmation, order status), Healthcare (appointments after hours), Education (admissions season), Insurance (renewals). Each has a `Tag` with the industry, a `title-16` problem, "With Vaani:" in `body-14` `--text-2`, and a result line with a `check` icon in `--text-3`. The result line is not green: it is a claim, not a state (P2). | Card, Tag |
| 6 | `channels` | "One agent wherever customers reach you." | Three columns from `claims.channels`: Phone (`phone`), WhatsApp (`message-circle`), Browser and meetings (`monitor`). Meeting platforms are named only from the claims sheet (F-QA-025). | — |
| 7 | `security` | "Security you can check." | Two columns: a lead sentence plus the link "Read the security overview" (to `/security`); four facts from the claims sheet, including the exact SOC 2 phrase. Nothing here says "certified". | — |
| 8 | `pricing` | "Prepaid. Pay for call time." | A compact RatesTable (3 rows) from the public rates endpoint, "Rates as of {date}" and the link "See pricing". | RatesTable (§7.5) |
| 9 | `start` | "Put your first call flow live." (`display-40`) | Access CTA (primary) · **Talk to sales** (secondary) · "See pricing" (link) · the reassurance line | Button |

**Testimonials and logos.** The testimonials section is omitted until there are quotes with written permission: a name, role, company and photo. When they exist, add one row of two or three quotes after section 5, plus one case study with numbers. Initials-only avatars are not allowed, and neither are customer logos without written permission (F-QA-034, F-QA-001).

### 5.5 Layout and wireframes

```
Desktop ≥1280 (1440×900): the H1 has its own row (max 28ch, so two lines at 56 px); below it the grid is
5fr / 7fr, gap 64. Above the fold: H1, sub, CTAs, key facts and the whole player (rendered: 08-public-auth-marketing.png)
┌ MarketingHeader 56 ──────────────────────────────────────────────────────────────────────────────┐
├──────────────────────────────────────────────────────────────────────────────────────────────────┤ 64
│  Phone agents that speak                                                   (display-56, ink,      │
│  your customers' language.                                                  2 lines, max 28ch)    │
│                                                                                              32   │
│  Vaani calls leads, answers inbound  ┌ DemoPlayer (surface · border · radius-8) ───────────────────┐ │
│  calls and books visits in Hindi,    │ Recorded call · Real estate · Site visit   ✓ Visit booked   │ │
│  English, Hinglish and more. You     │ अ Hindi · A English      Recorded with a test customer…     │ │
│  design every step.  (lead-16)       │ [▶ Play]  00:14 ━━━━━━○────────────────── 01:52              │ │
│                                      ├──────────────────────────────────────────────────────────────┤ │
│  [ Get started ] [ Try it live ]     │ 00:00 │ Vaani  A   Step · Greet                              │ │
│  Prepaid in rupees · no card to      │       │ Hello, this is Vaani from Sample Realty…             │ │
│  sign up (meta-12, text-3)           │ 00:06 │ Caller  अ                          (surface-2)       │ │
│                                      │       │ हाँ, बोलिए।                     (read-15-deva)        │ │
│  ─────────────────────────────────   │ 00:11 │ Vaani  अA  Step · Ask about a site visit  (active)   │ │
│  ⌘ Hindi, English, Hinglish          │       │ Is weekend site visit ke liye free hain?             │ │
│    and more Indian languages         │ 00:19 │ Caller  अA                                           │ │
│  ⌖ Data stored in India · AWS Mumbai │       ↳ Moved to step · Book site visit     (system row)   │ │
│  ▭ Prepaid in rupees · per-second    │ [ Show full transcript ]                                     │ │
│  ⧉ Nothing goes live by accident     ├──────────────────────────────────────────────────────────────┤ │
│    (key facts, a vertical list)      │ Industry [Real estate ▾]   Call [Site visit ▾]   [अ Hindi|A English] │
│                                      └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (sections 3 to 9 in the 1280 container; industries 3 × 2; channels 3 columns; security 2 columns)   │
└ MarketingFooter: ink Baseline band, 4 columns ────────────────────────────────────────────────────┘

Laptop 1024–1279: the same arrangement at 1fr / 1fr, gap 40; H1 48/52 (still two lines in 976 px); the player
shows three turns before "Show full transcript"; key facts stay in the copy column; industries 3 × 2.

Tablet 768–1023                                      Phone 320–767 (390 shown)
┌ [V] Vaani Labs         Sign in [Get started] ≡ ┐    ┌ [V] Vaani Labs  [Get started] ≡ ┐
│ Phone agents that speak your customers'         │    │ Phone agents that speak your     │
│ language.                         (48/52)       │    │ customers' language.   (40/44)   │
│ Vaani calls leads, answers inbound calls…       │    │ Vaani calls leads, answers…      │
│ [Get started] [Try it live]                     │    │ [        Get started        ] 44 │
│ ┌ DemoPlayer, full width ────────────────────┐  │    │ [        Try it live        ] 44 │
│ │ header · controls · 3 turns · selectors    │  │    │ ┌ DemoPlayer ───────────────────┐│
│ └────────────────────────────────────────────┘  │    │ │ Real estate · Site visit      ││
│ facts 2 × 2 · industries 2 × 3 · channels 3     │    │ │ [▶ Play] 00:14 ━━○──── 01:52 ││
└─────────────────────────────────────────────────┘    │ │ 3 turns                       ││
                                                       │ │ [ Show full transcript ]      ││
                                                       │ │ Industry [▾]  Call [▾]        ││
                                                       │ └───────────────────────────────┘│
                                                       │ facts as a list; industries: 3   │
                                                       │ cards + "Show 3 more industries" │
                                                       └──────────────────────────────────┘
```

**Phone budget:** at 390 × 844 the home is at most six screens (about 5,000 px), against 9,914 px today (F-RWD-018). This is reached with a disclosure on the transcript and the industries, the flow strip turned vertical (Trigger at the top, answer rows stacked, nothing clipped at 320), and channels and security as short lists. **No nested scroll regions:** the transcript expands in the page (F-A11Y-029).

### 5.6 Components and configuration

- **Buttons:** hero CTAs are `size="lg"` (40; 44 on touch). Primary is the access CTA, secondary is **Try it live**. One filled Neel button per region (direction §3.1).
- **DemoPlayer** (new composite, §18) is built from:
  - `RecordingPlayer` (N §12.5) with `preload="none"` and no autoplay;
  - `TranscriptFeed mode="review"` with `TurnRow`s whose timecodes are seek buttons;
  - `LanguageMark` in the header;
  - `StatusTag` for the outcome;
  - `Select` for industry and scenario;
  - `SegmentedControl` for the recording's language when both exist.

  The active turn follows the audio with TurnRow's `active` treatment. The recordings are real calls recorded with a test customer and shared with permission; the header says so in `meta-12` (§19 Q7). Nothing is synthesised to look live.
- **TemplateStrip** reuses the Flow Designer template gallery's mini strip (direction §6.5). Shapes carry the phase: capsule Trigger, rectangle Logic with answer rows, rectangle Action, capsule Outcome in the soft colour of the state it writes. Text is never below 12 px.
- **Card** `plain` (N §4.3) for control, industries and channels. There is no hover lift, and cards that are not links look static.
- **RatesTable** compact (§7.5).

### 5.7 States

| State | What shows |
|---|---|
| First paint, no JS | The H1, text, CTAs and a server-rendered transcript (TurnRows) with a native `<audio controls>` fallback. Nothing is hidden waiting for script. |
| Audio loading | Play shows the Button loading state ("Loading…", Spinner after 200 ms); the transcript stays readable |
| Audio failed | InlineError inside the player: "Couldn't load the recording. The transcript is below." · Retry |
| A language not recorded for a scenario | That segment is disabled with the reason "Hindi recording not available for this call" (C §1.6) |
| Playing | Only the progress and the active turn change. When the user scrolls away, the active turn does not force-scroll the page. |
| Reduced motion | No smooth scrolling; the active-turn highlight still changes, because it is state |
| Signed in | Header and hero CTAs read **Open app** |
| `approval` mode | CTAs read **Request access**; the reassurance reads "We review requests {reviewTime}" or is omitted |
| Claims not yet confirmed | That fact or line is not rendered (P1). Nothing shows a placeholder number. |

### 5.8 Interactions and keyboard

- **Play:** Enter or Space. **Seek:** the RecordingPlayer slider (← and → move ±5 s; Home and End).
- A TurnRow's timecode is a button labelled "Play from 00:06".
- **Show full transcript** is a disclosure button with `aria-expanded`, and focus stays on it.
- Selects follow C §5.2. Changing the industry or scenario stops playback and announces "Real estate, site visit call loaded".
- There is no hover-only content.

### 5.9 Performance budget (F-QA-032)

| Metric | Budget (75th percentile, 4G, mid-range Android) | How |
|---|---|---|
| LCP | ≤ 2.5 s | The H1 is the LCP element and is visible at first paint: no entrance animation, no opacity-from-0 |
| CLS | ≤ 0.1 | The player reserves its height; fonts use the size-matched fallback; no late banners (ConsentBar overlays and does not push) |
| INP | ≤ 200 ms | The player hydrates on idle or on first interaction |
| Font files | ≤ 4 (20 today) | Hanken variable Latin (preloaded), the Vaani Rupee glyph, Noto Sans Devanagari by `unicode-range` (requested only when the Devanagari turn renders), JetBrains Mono not preloaded |
| JS on `/` | ≤ 150 KB gzip | No animation library; no carousel |

The `og:image` is a real render of the player; the canonical host is chosen once (F-QA-025 noted `www` vs apex).

### 5.10 Microcopy (home)

| Before | After |
|---|---|
| "● LIVE · AGENTS ANSWERING IN 40+ LANGUAGES" | removed (a decorative dot, tracked caps and an unverified count) |
| "Voice AI agents that / handle every call." (gradient line 2) | "Phone agents that speak your customers' language." (solid ink) |
| ~36-word sub with "40+ languages — natural, sub-second, and enterprise-grade" | "Vaani calls leads, answers inbound calls and books visits in Hindi, English, Hinglish and more. You design every step." |
| "Start free →" · "▷ Talk to the agent" | "Get started" (or "Request access") · "Try it live" |
| "Free tier · No credit card to start · Cancel anytime" | Rendered from the claims sheet, only if true |
| "Speaking Spanish Español" rotating pill | removed; the languages are in the facts row |
| "Talk to it live right here" | "Try it live" (a link to `/try`) |
| Emoji icons 🎯 🔐 🌐 | Lucide icons at 1.5 px |
| "Explore analytics →" · "Open Flow Builder →" (to `/signup`) | "See call reports in the product" is removed; "Try a flow live" goes to `/try` |
| "SOC 2 Type II readiness is in progress." | the claims phrase: "SOC 2 Type II: readiness in progress (observation window from Q4 2026)" |
| Footer "● All Systems Operational" | removed unless fed by monitoring |

### 5.11 Accessibility

- **Landmarks and headings:** header, nav, main and footer; one H1; section H2s; card H3s; no skipped levels (F-A11Y-026).
- **The player** is a `region` named "Recorded call: Real estate, site visit". The transcript is an `<ol>`, and each TurnRow sets `lang` (`hi`, `hi-Latn`, `en-IN`). The Devanagari turn uses `read-15-deva`. The recording has no autoplay, and the transcript is its text alternative.
- **Focus:** every control is reachable; no scroll region needs focus (F-A11Y-029); focus rings use `--focus` at a 2 px offset.
- **Contrast:** all token pairs pass (foundations §3.8), including the footer band.
- **Zoom:** at 320 CSS px and at 200%, nothing scrolls sideways and the header keeps the menu and the CTA.

### 5.12 Telemetry

Events are sent only after Allow; otherwise only anonymous page counts (§4.4).

| Event | Properties |
|---|---|
| `cta_click` | `cta` (get_started, request_access, try_live, talk_to_sales, see_pricing, open_app, sign_in), `location` (header, menu, hero, final, pricing_teaser), `accessMode` |
| `demo_play` | `industry`, `scenario`, `language` |
| `demo_progress` | `quartile` (25, 50, 75, 100) |
| `demo_transcript_expand` · `demo_seek` | `industry`, `scenario` |
| `web_vitals` | `lcp`, `cls`, `inp`, `route` |

### 5.13 Acceptance criteria (home)

- [ ] The H1 renders at first paint with no animation and takes at most two lines at 768, 1024, 1280 and 1440; lab LCP ≤ 2.5 s and CLS ≤ 0.1 on the mobile profile.
- [ ] At most 4 font files load on `/`; `getComputedStyle(document.body).fontFamily` starts with Hanken Grotesk.
- [ ] No gradient, glow, orb, blur, noise, emoji, eyebrow, pill tag or scroll-reveal exists on the page (visual snapshot plus CSS lint).
- [ ] The hero and the final CTA each have exactly one filled Neel button; the header has one.
- [ ] Every anchor in the nav, the footer and the legacy map resolves to an element (CI crawl).
- [ ] The demo plays only on a user action; its transcript is readable with JavaScript off.
- [ ] At 390 × 844 the page is ≤ 5,100 px tall; at 320 nothing scrolls sideways; no element has its own scroll region.
- [ ] Every number, language count, provider and compliance phrase comes from `claims.ts`; the copy lint passes.
- [ ] Playwright: no `pageerror` (including React #418) on any public route; the first ThemeMenu choice changes the theme.
- [ ] axe: zero serious or critical issues in light and dark.

---

## 6. The rest of the public site (brand consistency, high level)

Each page moves onto MarketingLayout, Hanken body copy, tokens and the claims sheet. Content rewrites belong to the content owner; the design rules below are required.

| Page | Keep | Change |
|---|---|---|
| `/try` (from `/build.html`, PA14) | The three-step "Your scenario → We build it → Talk to it" idea; the 22-language choice; the explicit, unticked consent box | MarketingLayout; the language choice becomes a Combobox with LanguageMarks, at least 320 wide (no "Hindi + English (Hinglish" truncation); mobile and code use PhoneInput `kind="mobile"` and OneTimeCodeInput (§18); "DPDP + RBI compliant by default" becomes the claims sheet's specific controls; the gradient nav CTA at 1.43:1 goes; "Get started" goes to `/signup` |
| `/security` | The candid content, the table of contents, "shipped versus planned" | Hanken prose (no mono paragraphs); internal identifiers removed (table names, "anon key"); typos fixed; OAuth list and TOTP status from the claims sheet; "Last updated" from the CMS; a `main` landmark. **The only page that states compliance status** (F-QA-009). |
| `/enterprise` | The pilot offer: a setup week, a 2–4 week managed pilot, a closeout report | Rewritten for buyers (outcomes, process, deliverables, security posture linked to `/security`); raw paths become descriptive links; icon-only links get names; "VaaniVoice" becomes Vaani Labs; the orange-teal mandala badge goes; the primary is **Request a pilot…** (the §7.6 dialog) |
| `/docs`, `/docs/*` | The API structure, per-surface pricing, 402 semantics, MCP / OpenAPI / SDKs | The same shell with a left rail; `/docs/api`'s own look (Instrument Serif, the "VV API" logotype, the white strip) is retired; every card is a link or visibly "Coming soon" with no hover; "4paise / sec" is rendered from the rates endpoint; one billing-unit sentence shared with Billing › Plans (F-QA-011) |
| `/about` | Real founders (reuse `/contact`'s photos and bios) | Unpublished, or cut to verifiable facts with an owner in the claims sheet. No named customer, funding or certification without documentation (F-QA-001). |
| `/contact` | Founder cards, hours, booking | One sales address and one booking link; the note form uses Field with labels and `autocomplete`; one wordmark |
| `/changelog` | Dated releases | Customer-facing wording (no RLS or table names); versions as H2s; kept current |
| `/status` | — | Fed by monitoring or removed; vendor names removed ("Telephony", "Sign-in") |
| `/blog`, `/careers` | — | Hidden from navigation until real; blog posts link to real pages |
| Legal pages | Content | Hanken body, `main`, a real "Last updated" date |

---

## 7. Pricing (`/pricing`)

### 7.1 Purpose and jobs to be done

**Primary job.** *When I am deciding whether Vaani fits my budget, I want to see what a call costs and estimate my month, so I can start on my own or ask for a pilot.*

| # | Visitor | Job | Where |
|---|---|---|---|
| P1 | SMB owner | See the phone-call rate, estimate the month, start | Rates, Estimate, Get started |
| P2 | Enterprise buyer | Ask for a scoped pilot without filling in 19 fields | Enterprise pilot → Request a pilot… |
| P3 | Finance | Understand the billing unit, GST, refunds and what happens at ₹0 | Rates notes, Questions |

### 7.2 Findings addressed

- **F-QA-012:** no prices, no header navigation, 19 controls with placeholder labels, mono body copy, a third-party email address.
- **F-QA-011:** "per-second" alongside "rounded up to minutes"; free tier vs pilot vs prepaid.
- **F-QA-035:** two sales paths and three email domains.
- **F-A11Y-020 and F-A11Y-003:** placeholder-only labels.
- **F-A11Y-026:** no `main` and no `nav`.
- **F-RWD-018:** 6,792 px on a phone, with 14 px inputs.
- **F-QA-013:** a mono page with a Sora H1.

### 7.3 Information hierarchy

1. **The phone-call rate** (the first row of Rates, `num-20`).
2. **The estimate** for the visitor's own numbers.
3. **The two paths:** the access CTA (primary, in the site header and at the foot of the estimator) and **Talk to sales** (secondary, under the lead). The page head adds no second Neel button, so the screen never reads blue.
4. Then, in order: meeting-minute plans, the enterprise pilot, questions.

### 7.4 Layout and wireframes

```
Desktop ≥1280 (1440): container 1280; Rates 7 cols + Estimate 5 cols, gap 40
┌ MarketingHeader (Pricing is current: text + 2 px accent-mark underline) ──────────────────────────┐
├───────────────────────────────────────────────────────────────────────────────────────────────────┤ 80
│ Pricing                                                        (H1 display-40)                    │
│ Top up a wallet in rupees with UPI. Calls are charged per second of talk time.   (lead-16)       │
│ [ Talk to sales ]   (secondary; the header carries Get started, the estimator its own)            │
│                                                                                                   │
│ Rates (H2 title-24)                                      ┌ Estimate your month (H2 title-16) ─────┐│
│ ┌ table: surface · border · radius-8 ─────────────────┐  │ Product      [ Phone calls         ▾] ││
│ │ Product              Rate      Per minute  Billing   │  │ Calls a month [ 1,000              ] ││
│ │ Phone calls          ₹0.04/s   ₹2.40       Per second│  │ Average call length [ 2    ] min     ││
│ │ Browser and API voice₹0.04/s   ₹2.40       Per second│  │ ─────────────────────────────────── ││
│ │ Meeting agent        ₹0.08/s   ₹4.80       Per second│  │ About ₹4,800 a month      (num-28)   ││
│ │ Meeting rooms        ₹0.01/s   ₹0.60       after 30  │  │ 2,000 min of phone calls at ₹0.04/s. ││
│ │                                            free min  │  │ Real cost depends on call length.    ││
│ └──────────────────────────────────────────────────────┘  │ [ Get started ]                       ││
│ Prices exclude GST. Rates as of 1 Sep 2026.               └───────────────────────────────────────┘│
│ Top-ups from ₹100 to ₹1,00,000 with any UPI app.                                                   │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Meeting minutes (H2)  For the meeting agent. Phone calls are always pay as you go.                │
│ [PlanCard Pay as you go] [PlanCard Starter ₹499/month] [PlanCard …] [PlanCard …]                  │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Enterprise pilot (H2)                                                                             │
│ 1  Setup week: demo account, your flow, scripts and integrations       [ Request a pilot… ]        │
│ 2  Two to four weeks of managed calls with a weekly review             Book a call (external)     │
│ 3  Closeout report: transcripts, recordings, results, a recommendation                            │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Questions (H2), a 720 column of disclosures                                                        │
└ MarketingFooter ──────────────────────────────────────────────────────────────────────────────────┘

Laptop 1024–1279: the same two columns (7 / 5), plans 4 across at ≥1280 and 2 × 2 below it.
Tablet 768–1023: Rates at full width, then Estimate as a Card below it; plans 2 × 2; the pilot steps
above its buttons.
Phone (390): each rate is a two-line list row ("Phone calls" · "₹0.04/s · ₹2.40 a minute · per second").
Estimate fields stack at full width with 16 px text; plans stack; the pilot buttons are full width, 44 px.
Target ≤ 4 screens at 390 × 844 (6,792 px today).
```

### 7.5 Components and configuration

**RatesTable** is a `DataTable` (N §7) with `density="standard"`, no pager, no selection and no row actions. It is `<table>` with `<caption>` "Rates" and these columns:
- **Product** (`data-13`, 500);
- **Rate** (`num-20` in the first row only, `data-13` in the others, right-aligned, tabular);
- **Per minute** (right-aligned);
- **Billing unit** (`data-13` `--text-2`).

Data comes from the public rates endpoint (A10), **the same source as Billing › Plans** (05-knowledge-billing §2.10). The billing-unit sentence is shared word for word by the lead line, the FAQ, the docs and Billing (F-QA-011). The values shown here (₹0.04/s and so on) are the public API docs' figures, used as examples until the endpoint answers. Under the table, in `meta-12` `--text-3`: "Prices exclude GST." (only if true), "Rates as of {date}", and the top-up bounds from BL3 ("₹100 to ₹1,00,000").

**Estimator** is a `Card plain`, sticky at `top: calc(var(--size-header) + var(--space-24))` from 1024 up:
- **Fields:**
  - `Select` "Product" (default: phone calls);
  - `NumberInput` "Calls a month": 1 to 10,00,000, en-IN grouping, hint "Up to 10,00,000";
  - `NumberInput` "Average call length": 0.5 to 30, step 0.5, unit "min".

  Both NumberInputs keep invalid input as typed and show the error on blur ("Enter a number from 1 to 10,00,000."). Nothing is clamped (C §3.4, V8).
- **Result** (`role="status"`, polite, announced only after typing settles, throttled by `--timing-announce-throttle`):
  - "About ₹4,800 a month" in `num-28`;
  - the working in `body-14` `--text-2`: "2,000 min of phone calls at ₹0.04/s.";
  - "Real cost depends on how long calls last."
  - If the unit is per minute, rounded up: "Each call is rounded up to the next minute", and the maths uses `ceil(length)`.
  - The number is rounded to the nearest ₹100 **for display only**, with the exact value in the tooltip.
- **Action:** the access CTA (primary). No email is asked for to see a number.

**PlanCards** use the recipe of Billing §2.10 (name, who it is for, price as `num-20` + "/ month", included minutes, up to 3 points). On `/pricing` the cards have no buttons. One line follows them: "Choose a plan in Billing after you sign up." (§19 Q5). The Pay as you go card reads "₹0 / month · 30 free minutes each month, then ₹2.40/min" (the same string as the app).

**Enterprise pilot** is an ordered list of three steps (20 px number marks as in StageProgress "to do", `title-14` plus `body-14`), then **Request a pilot…** (secondary Button lg) and **Book a call** (link; `external-link` because it leaves the site). The CTAs in the header stay the only primary.

### 7.6 Request a pilot (Dialog md; full screen on phones)

Six fields in place of nineteen (F-QA-012). Each is a `Field` with a visible label and `autocomplete`:

| Field | Control | Rule and copy |
|---|---|---|
| Full name | TextInput `autocomplete="name"` | "Enter your name." |
| Work email | TextInput `type="email"` `autocomplete="email"` | "Enter a work email, like name@company.com." |
| Company | TextInput `autocomplete="organization"` | "Enter your company's name." |
| Calls a month | Select: Under 1,000 · 1,000 to 10,000 · 10,000 to 1,00,000 · Over 1,00,000 | "Choose a range." |
| What should the agent do first? | Select: Qualify leads · Reminders and collections · Answer inbound calls · Book appointments · Something else | "Choose one." |
| When do you want to start? (optional) | Select: This month · In the next 3 months · Just exploring | — |

- **Footer:** Cancel (tertiary) and **Send request** (primary). Under the fields, in `meta-12` `--text-3`: "We use these details only to reply to you. **Privacy policy**" and "We reply by email {reviewTime}." (only if the SLA is real).
- **Validation:** C §8.2. On submit, the first invalid field is focused; the form has more than three fields, so an error summary shows at the top.
- **Success:** the dialog body is replaced (O §2): a `check` in `--success-text`, the title "Request sent", "We'll reply to a•••@company.com. You can close this window." and Close. There is also a success toast when the dialog closes.
- **Failure:** an InlineError above the actions: "Couldn't send your request. Try again, or email sales@vaanilabs.in." with Retry. The typed values are kept.
- **Routing:** the request goes to the one sales address (A11). Nothing links to another domain (F-QA-035).

### 7.7 Questions (a disclosure list)

Radix `Collapsible` items in a 720 column. Each question is a button with `aria-expanded` (`title-16`), and the answer is in `body-14`. **A question whose answer the claims sheet cannot back is omitted, never guessed.**

| Question | Answer source |
|---|---|
| How am I charged? | The billing-unit sentence (A10) |
| What happens when my wallet reaches ₹0? | "Phone calls pause. Browser tests and free meeting minutes still work. Top up with UPI to continue." (the WalletNotice Empty copy, O §10.2) |
| Can I top up automatically? | Autopay by UPI mandate, "top up ₹X when the balance falls below ₹Y" (Billing §2.8) |
| Do I get GST invoices? | Billing › Invoices, per financial year (Billing §2.11) |
| Do Hindi and English calls cost the same? | The rates endpoint (only if rates do not vary by language) |
| Do I need my own phone number? | The claims sheet (Q3) |
| Can I get a refund? | Link to the refund policy |

### 7.8 States

| State | Treatment |
|---|---|
| Rates loading (client refresh only; the page is server-rendered) | The table keeps its header; the rows are static skeletons after 200 ms; the estimator result shows "–" (never ₹0) |
| Rates failed and no cached copy | SectionError "Couldn't load current rates. Retry". The estimator is hidden, and so is every CTA that quotes a price |
| Rates from the cache | "Rates as of 1 Sep 2026" stays visible, with no warning if the cache is under 24 h old |
| Estimator input invalid | A field error on blur; the result keeps the last valid estimate with "Fix the highlighted field to update" |
| `approval` mode | CTAs read **Request access**; the lead sentence adds "Accounts are reviewed before first use." |
| Signed in | The header CTA is **Open app**; the estimator CTA is **See your rates in Billing** (`/billing/plans`) |
| No JavaScript | Rates, plans, pilot steps and questions render (questions open by default); the estimator is replaced by "The estimate needs JavaScript. Rates are above."; **Request a pilot…** becomes a link to `/enterprise#pilot` with the same form as a page |

### 7.9 Microcopy (pricing)

| Before | After |
|---|---|
| "ENTERPRISE PILOT / Launch a paid pilot with the full Vaani Labs platform" | "Pricing" · "Top up a wallet in rupees with UPI. Calls are charged per second of talk time." |
| "Public pricing stays sales-led so the pilot scope matches your use case…" | removed |
| "Every plan includes" (there were no plans) | removed |
| "SUCCESS STORY" (×6) over generic copy | removed until real case studies exist |
| "Email us" / "Email krishal@advisio.in" | **Talk to sales** (sales@vaanilabs.in) · Book a call |
| "Start a pilot" with 19 placeholder-labelled controls | "Request a pilot…" with 6 labelled fields |
| "Target rollout date" (a free-text box) | "When do you want to start?" (a Select) |
| "Voice agents (textvoice + voicebot)", "Meeting agents (Vikash)" | "Phone calls", "Browser and API voice", "Meeting agent", "Meeting rooms" |
| "4paise / sec" | "₹0.04/s" from `lib/format.ts` |

### 7.10 Accessibility

- `main` and `nav` are present; the H1 is "Pricing"; the H2s are Rates, Estimate your month, Meeting minutes, Enterprise pilot and Questions.
- The rates are a real `<table>` with a caption and `scope="col"` headers; numbers are right-aligned and tabular.
- The estimator result is a polite `status`. The dialog follows O §1.3 (focus to the first field, trapped, returned to **Request a pilot…**).
- Touch inputs are 16 px (F-RWD-018).

### 7.11 Telemetry

`pricing_estimate` {`product`, `callsBand`, `lengthBand`}: bands only, never raw numbers typed by the visitor · `pilot_request_open` {`location`} · `pilot_request_submitted` {`volumeBand`, `useCase`, `timeline`} · `pilot_request_failed` {`code`} · `faq_open` {`id`} · `cta_click` (§5.12). Nothing here is sent before Allow.

### 7.12 Acceptance criteria (pricing)

- [ ] Every rate on `/pricing` equals Billing › Plans for a new workspace (the same endpoint; a contract test).
- [ ] The billing-unit sentence is byte-identical on `/pricing`, `/docs/api/billing` and Billing › Plans.
- [ ] The estimator equals `calls × length × 60 × rate` (or the per-minute formula) in unit tests; the display rounds, the tooltip shows the exact value, and input is never clamped.
- [ ] The pilot request has 6 fields, all with visible labels and `autocomplete`; an empty submit focuses the error summary; a 500 keeps the values and shows Retry; success replaces the dialog body.
- [ ] No link or `mailto:` on the page points to a domain other than `vaanilabs.in`, except the one booking link.
- [ ] The page has header navigation, `main` and a footer; at 390 × 844 it is ≤ 3,400 px tall; inputs are 16 px on touch.
- [ ] None of "SUCCESS STORY", "Every plan includes", mono body copy or 11 px text is present.

---

## 8. Sign in (`/login`)

### 8.1 Purpose and jobs to be done

**Primary job.** *When I come back to Vaani Labs, I want to get into my workspace with the method I used last time, in as few steps as possible, and land where I was going.*

**Secondary jobs:** recover when something is wrong (a forgotten password, an expired link, the wrong account); understand why I was sent here (session expired, signed out, password changed).

### 8.2 Findings addressed

F-QA-010 (the link to create an account) · F-QA-030 (two validation patterns, magic link as a send button) · F-A11Y-025 (autofill blocked, a 16 px toggle, the dotted placeholder) · F-A11Y-003 (unassociated labels) · F-A11Y-006 (no focus on the toggle) · F-A11Y-023 (16–17 px tall links) · F-A11Y-026 (no H1, no landmarks) · F-QA-039 ("Enterprise Security Enabled") · F-QA-007 (bare `/login` with no `next` or reason) · F-VIS-001 and F-VIS-025 (four families on one card) · F-RWD-018 (14 px inputs) · F-QA-009 and F-QA-025 (provider list).

### 8.3 Information hierarchy

1. **H1 "Sign in"**, and directly under it the **reason** for being here, if there is one ("Your session expired…").
2. **The method used last time.** The order stays fixed so the layout never jumps. The last-used method carries `Tag outline "Last used"`, read from `localStorage['vaani:last-auth-method']`, which is not personal data.
3. **Email and password**, then **Sign in**.
4. The alternatives: "Forgot password?" and "Email me a sign-in link instead".
5. The cross-link "New to Vaani Labs? **Create an account**". It sits in the H1 line, so it is found early, but it is visually quiet.

### 8.4 Layout

The frame is AuthLayout (§4.2), and the desktop and phone wireframes there show this page. The variants below show only the panel.

```
Password mode, after a failed submit            Email-link mode (?method=link)          Check your email
┌ Sign in ──────────────────────────────┐   ┌ Sign in with an email link ───────┐   ┌ Check your email ─────────────────┐
│ New to Vaani Labs? Create an account  │   │ No password needed. We'll email   │   │ We sent a sign-in link to          │
│ [G Continue with Google   Last used]  │   │ you a link and a 6-digit code.    │   │ a.rao@company.com. It works for    │
│ [f Continue with Facebook          ]  │   │ [G Continue with Google        ]  │   │ 15 minutes.                        │
│ ─────────────── or ───────────────    │   │ [f Continue with Facebook      ]  │   │ Or enter the code from the email   │
│ Email                                 │   │ ──────────── or ────────────      │   │ [ 4 8 2 0 1 7              ] mono  │
│ [ a.rao@company.com               ]   │   │ Email                             │   │ We'll check it as soon as you      │
│ Password                              │   │ [ a.rao@company.com           ]   │   │ enter 6 digits.                    │
│ [                          (eye) ]◄red│   │ [      Email me a link        ]   │   │ [          Sign in             ]   │
│ Forgot password?                      │   │ Sign in with a password instead   │   │ Resend email in 0:24               │
│ ⓘ That email and password don't match.│   └───────────────────────────────────┘   │ Use a different email              │
│   If you signed up with Google or     │                                           │ Can't find it? Check spam, or      │
│   Facebook, use that button instead.  │                                           │ search your inbox for Vaani Labs.  │
│ [            Sign in             ]    │                                           └────────────────────────────────────┘
│ Email me a sign-in link instead       │
└───────────────────────────────────────┘
```

At every breakpoint the panel is the same 400 column (§4.2). Phones drop the panel frame and use 44 px controls with 16 px text. Laptop and desktop are identical, and nothing about this page changes between 1024 and 1920.

### 8.5 Components and configuration

| Part | Component and config |
|---|---|
| Cross-link | `body-14` `--text-2`, then Link button **Create an account** (`/signup`, carrying `next`). In approval mode: "Need access? **Request access**". The hit area is ≥ 24 px. |
| Reason | `Notice` inline (table §8.7) |
| OAuth | `OAuthButton` × n (§18), in the order of `claims.auth.providers`. Each is `Button asChild` wrapping an `<a>` to `/api/auth/oauth/<provider>?intent=login` (it navigates), secondary, lg, full width, with a 16 px brand mark in the leading slot. Label "Continue with Google" / "Continue with Facebook". Brand SVGs are the product's only non-token colours (lint allow-list `components/brand/*`). |
| Divider | "or": `meta-12` `--text-3` between `--border` hairlines, `aria-hidden` (the headings already structure the page) |
| Email | `Field` "Email" + `TextInput` lg: `type="email"`, `autocomplete="username"`, `inputmode="email"`, `autocapitalize="none"`, `spellcheck="false"`, `enterkeyhint="next"`. **No placeholder.** Prefilled from `sessionStorage['vaani:auth-email']` when coming from another auth page. |
| Password | `Field` "Password" + `PasswordInput` `purpose="sign-in"` (C §3.3): `autocomplete="current-password"`, no placeholder, the 26 px show/hide toggle with an inset focus ring, the Caps Lock notice. Paste allowed. |
| Forgot password | Link button **Forgot password?** directly **under** the password field (so Tab goes email → password → toggle → link), `label-13`, ≥ 24 px tall, to `/forgot-password` (the email carried via sessionStorage) |
| Form error | `InlineError` above the primary (§8.7) |
| Primary | `Button` primary lg `fullWidth` **Sign in**; loading "Signing in…" (C §2.1) |
| Mode switch | Link button **Email me a sign-in link instead**: `pushState` to `?method=link`, focus moves to the new H1. In link mode: **Sign in with a password instead**. |
| Link mode | H1 "Sign in with an email link"; sub "No password needed. We'll email you a link and a 6-digit code."; Email field (`autocomplete="email"`); primary **Email me a link** (loading "Sending…") |
| Check email | `/login/check-email`: H1 "Check your email"; the address the visitor typed (they typed it, so it is shown in full); `OneTimeCodeInput` (§18) labelled "Or enter the code from the email"; primary **Sign in**; `ResendLink` "Resend email", disabled for 30 s with "Resend in 0:24" (the countdown is not announced); link **Use a different email**; hint "Can't find it? Check spam, or search your inbox for Vaani Labs." |
| Two-factor code | `/login/code`: H1 "Enter your code"; "Open your authenticator app and enter the 6-digit code for Vaani Labs."; `OneTimeCodeInput`; `Checkbox` "Trust this browser for 30 days" (only if supported, §19 Q8); primary **Verify**; links **Use a recovery code instead** (swaps to a TextInput "Recovery code", hint "Like 4F7K-9Q2M") and **Sign in as someone else** |

**Magic-link landing** (`/auth/link?token=…`): the token is exchanged server-side. The page renders nothing for 200 ms, then "Signing you in…" in `title-16` `--text-2` (never a lone spinner).

| Result | Goes to |
|---|---|
| Success | `next`, or the landing route |
| Expired | `/login?method=link&reason=link-expired` |
| Already used | `…&reason=link-used` |
| A different person is signed in on this browser | SignedInPanel with **Continue as Anika R.** and **Sign in as a•••@company.com instead** (the latter signs out, then uses the token) |

**OAuth round trip.**
1. The click puts the button in its loading state ("Opening Google…"). The other buttons become `aria-disabled` with the reason "Waiting for Google".
2. The server stores `{ next, attribution, intent }` against a `state` nonce. `next` is never hard-coded to `/dashboard` (A4).
3. `/auth/callback/<provider>` behaves like the link landing ("Signing you in…" after 200 ms).
4. Outcomes:

| Outcome | Result |
|---|---|
| Linked account | `next` or the landing route |
| Two-factor on | `/login/code` |
| No account yet | `/signup/confirm` (§9.4) |
| An account exists with this email and a password, but is not linked | `/login?reason=oauth-link`: "An account for a•••@company.com already exists. Sign in with your password once to connect Google." After that sign-in, the provider is linked and a toast in the app says "Google connected. You can use it to sign in." |
| Cancelled | `reason=oauth-cancelled` |
| Provider error | `reason=oauth-failed` |
| Pending approval | `/signup/pending` |
| Account turned off | `/login` with the danger Notice |

### 8.6 Interactions and keyboard

- Tab order follows §4.2. **Enter** submits from any field.
- Autofocus goes to Email only on fine pointers at ≥1024 with no reason Notice shown. When the email is prefilled, it goes to Password.
- After a failed submit:
  - format errors focus the first invalid field (C §8.2 V4; this form has three fields or fewer);
  - a credentials error clears the password field, keeps the email, focuses Password and raises the InlineError (`role="alert"`).
- Submission is single (C §8.2 V11): fields become read-only while signing in, and repeated Enter is ignored.
- **OneTimeCodeInput:** digits only, and paste accepts "482 017", "482-017" or the whole email line. It checks the code as soon as six digits are entered or pasted; the hint says so beforehand, which meets WCAG 3.2.2. It shows "Checking code…" (polite) meanwhile. Enter and the button also submit.
- Esc does nothing on these pages (there is nothing to close). There are no single-key shortcuts.

### 8.7 States and copy

**Reasons on arrival** (`Notice` inline under the H1, `role="status"`; read in order after the H1, never assertive):

| `reason` | Tone | Copy |
|---|---|---|
| `expired` | info | **Your session expired.** Sign in again to go back to where you were. (with `next`) |
| `signed-out` | neutral | **You're signed out.** |
| `password-changed` | success | **Password changed.** Sign in with your new password. Other devices were signed out. (only if the user chose that, §10) |
| `link-expired` | warning | **That sign-in link has expired.** Links work for 15 minutes. Send a new one below. (link mode) |
| `link-used` | warning | **That sign-in link was already used.** Send a new one below. |
| `oauth-cancelled` | neutral | **Google sign-in was cancelled.** Choose another way to sign in. |
| `oauth-failed` | danger | **Couldn't sign in with Google.** Try again, or use your email. |
| `oauth-link` | info | **An account for a•••@company.com already exists.** Sign in with your password once to connect Google. |
| `approved` | success | **Your access is approved.** Sign in to create your workspace. (approval mode) |
| `verified` | success | **Email confirmed.** Sign in to continue. |

**After submit:**

| Situation | Pattern | Copy |
|---|---|---|
| Empty fields | Field errors, first one focused | "Enter your email." · "Enter your password." |
| Email not an address (on blur) | Field error | "Enter an email address, like name@company.com." |
| Wrong email or password (never reveals whether the account exists) | InlineError `role="alert"` above the button | "That email and password don't match. If you signed up with Google or Facebook, use that button instead." plus the link **Reset your password** |
| Too many attempts (429, `Retry-After`) | InlineError; the primary is `aria-disabled` with the reason | "Too many attempts. Try again in 30 s." (the countdown updates silently) |
| Email not confirmed | Navigate | `/signup/verify` with the H1 "Confirm your email" |
| Pending approval | Navigate | `/signup/pending` (00-app-shell-ia §12.2) |
| Account turned off | Notice danger at the top | "**This account is turned off.** Contact support@vaanilabs.in to turn it back on." |
| Offline | Primary `aria-disabled` | "You're offline. Connect to sign in." |
| Network failure or timeout | InlineError | "Can't reach Vaani Labs. Check your connection." · Retry |
| 5xx | InlineError | "Something went wrong on our side. Try again in a minute." · Details (error id) |
| Wrong two-factor code | Field error | "That code didn't work. Codes change every 30 seconds, so use the newest one." |
| Wrong email code | Field error | "That code didn't work. Check the latest email from Vaani Labs." |
| Code expired | Field error plus ResendLink enabled | "That code has expired. Send a new email." |
| Link email sent | Navigate to Check email | (no toast) |
| Resend | StatusText under the button | "Sent again at 11:42 am." |
| Signing in | Primary loading | "Signing in…" |
| Success | Navigate to `next` or the landing route | No toast: the app's first paint is the confirmation |
| Already signed in | SignedInPanel (§4.2) | "You're signed in as Anika R." · **Continue to Vaani Labs** · Use a different account |

### 8.8 Microcopy (sign in)

| Before | After |
|---|---|
| H2 "Welcome Back" · "Sign in to access your dashboard" (mono) | H1 "Sign in" · "New to Vaani Labs? Create an account" |
| "← Back to home" (mono) | The Vaani Labs lockup links home |
| "EMAIL" · "PASSWORD" (tracked mono caps) | "Email" · "Password" |
| Placeholders "you@company.com" · "••••••••" | none (C §3.3) |
| "Forgot your password?" (12 px mono, 16 px tall) | "Forgot password?" (13 px, ≥ 24 px target) |
| "Sign In →" | "Sign in" |
| "✉ Sign in with Magic Link" (sends at once) | "Email me a sign-in link instead" (switches mode) |
| "Please enter a valid email" (a red banner under the password) | "Enter an email address, like name@company.com." (under Email) |
| Browser bubbles "Please fill in this field" | "Enter your email." / "Enter your password." |
| "Continue with Meta" | "Continue with Facebook" (Q4) |
| "Don't have an account? Sign up" (12 px grey mono at the foot) | "New to Vaani Labs? Create an account" (under the H1) |
| "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled" | Privacy · Terms · Security · Status |

### 8.9 Accessibility

- One H1 inside `main`, and legal links in `<nav aria-label="Legal">` (F-A11Y-026).
- Every input has a `<label for>`. Errors are linked by `aria-describedby` with `aria-invalid` (F-A11Y-003, F-A11Y-025).
- `autocomplete` is `username`, `current-password` or `one-time-code`. Paste is never blocked, and a password manager or a magic link is always possible, with no cognitive test (WCAG 3.3.8).
- The toggle has a visible ring, `aria-pressed` and `aria-controls` (F-A11Y-006). Every target is ≥ 24 px, or 44 px on touch (F-A11Y-023).
- The reason Notice is `role="status"`; form failures are `role="alert"`; countdowns are silent.
- The OAuth buttons are links named by their visible text, including "Last used" when shown.
- Everything passes in both themes and in forced colours: the Notice gets a visible 1 px border, and the buttons keep `ButtonBorder`.

### 8.10 Responsive

| Width | Behaviour |
|---|---|
| ≥ 1024 | Panel 464, centred; autofocus on fine pointers only |
| 768–1023 | The same panel; touch density on coarse pointers (44 px, 16 px text) |
| 320–767 | No panel frame; full width minus 16 px margins; 44 px controls and 16 px text (no iOS zoom, F-RWD-018); `enterkeyhint` set; the focused field scrolls above the keyboard (`visualViewport`) |
| Landscape phone (short) | The stack scrolls; no fixed elements cover fields |

### 8.11 Telemetry

`auth_view` {`page`: login | link | check_email | code, `reason`} · `login_method_click` {`method`} · `login_submitted` {`method`} · `login_failed` {`method`, `code`: credentials | rate_limited | network | server | unverified | pending | disabled | code_invalid} · `magic_link_requested` · `magic_link_opened` {`sameBrowser`} · `code_submitted` {`kind`: email | totp | recovery, `result`} · `oauth_start` {`provider`, `intent`} · `oauth_return` {`provider`, `result`} · `login_success` {`method`, `msOnPage`}. These are server-side counts; no email, name or token appears in any payload, and the marketing analytics rules of §4.4 do not apply.

### 8.12 Acceptance criteria (sign in)

- [ ] `/login` has exactly one H1, "Sign in", inside `main`; every input has an associated label; axe finds no serious or critical issue in light or dark.
- [ ] Chrome, Safari and one password manager fill both fields (`username` + `current-password`); paste works in every field.
- [ ] An empty submit shows "Enter your email." and "Enter your password." under the fields, focuses Email, and no native bubble appears (`noValidate`).
- [ ] Wrong credentials give the same InlineError for an unknown email and for a wrong password (response timing within 100 ms of each other, server test).
- [ ] The password toggle shows a 2 px focus ring, has `aria-pressed`, keeps the caret, and its hit area is ≥ 24 × 24 (44 on touch).
- [ ] "Email me a sign-in link instead" sets `?method=link`, hides Password, and the browser Back button restores password mode.
- [ ] The email for a sign-in link contains a button and a 6-digit code; entering the code on Check your email signs in without opening the link.
- [ ] Google sign-in started at `/login?next=/leads?view=due` ends on `/leads?view=due`. A sign-up through OAuth keeps the UTM captured on the first page view (integration test).
- [ ] `/login?reason=expired&next=/flows/123` shows the info Notice and returns to `/flows/123` after sign-in.
- [ ] None of "Welcome Back", "Magic Link", "Neural", "v2.0.4" or "Enterprise Security Enabled" appears in any auth page or email.
- [ ] At 390 × 844, inputs render at 16 px and every target is ≥ 44 px; at 320 nothing scrolls sideways.
- [ ] A signed-in visitor sees the SignedInPanel; `/login` never redirects without a click.

---

## 9. Create account (`/signup`), confirm email, OAuth sign-up

### 9.1 Purpose and jobs to be done

**Primary job.** *When I decide to try Vaani, I want to create an account in under a minute without being asked for things I don't understand yet, and know exactly what happens next.*

**Success signals:** sign-up completion (view to confirmed email); median time from the "Get started" click to Home (budget ≤ 90 s for email sign-up); the share of sign-ups confirmed by code versus link; drop-off per step.

### 9.2 Findings addressed

F-QA-010 (the route redirected to sign-in) · F-QA-011 (free tier vs approval) · F-QA-030 (unexplained phone, no password rules, no Terms, no expectations) · F-A11Y-025 (`autocomplete="off"`) · F-A11Y-003 · F-A11Y-026 · F-UX-001 (a workspace is created at sign-up, so invites never dead-end) · F-VIS-025.

### 9.3 Information hierarchy and layout

1. H1 **Create your account** (approval mode: **Request access**) and the cross-link "Already have an account? **Sign in**".
2. OAuth, then name, work email and password with its live rules.
3. **Create account**, and under it the Terms sentence.
4. The aside (≥1024) **What happens next**. Below 1024 it becomes one `meta-12` line under the Terms sentence: "Next: confirm your email, then name your workspace."

```
Desktop and laptop ≥1024: panel 464 + aside 320, gap 40, the pair centred
            [V] Vaani Labs
┌ Create your account ─────────────────────────┐   What happens next               (title-16)
│ Already have an account? Sign in              │   ① Confirm your email
│ [G  Continue with Google                  ]   │     We send a link and a code.
│ [f  Continue with Facebook                ]   │   ② Name your workspace
│ By continuing, you agree to the Terms and the │     Teammates, numbers and billing live
│ Privacy policy.                     meta-12   │     there. You'll be its admin.
│ ─────────────────── or ───────────────────    │   ③ Get your first call live
│ Full name                                     │     Publish a flow, verify your number,
│ [ Anika Rao                               ]   │     add money and call yourself. Home
│ Work email                                    │     walks you through it.
│ [ a.rao@company.com                       ]   │   ────────────────────────────────
│ Password                                      │   Prepaid in rupees, per-second rates.
│ [ ••••••••••••                     (eye)  ]   │   See pricing
│ ✓ At least 10 characters                      │   Data stored in India (AWS Mumbai)
│ ○ Not a commonly used password                │
│ [            Create account             ]     │
│ By creating an account, you agree to the      │
│ Terms and the Privacy policy.                 │
└───────────────────────────────────────────────┘
   Privacy · Terms · Security · Status

Approval mode: H1 "Request access"; a Company field after Work email; primary "Request access";
step ② of the aside reads "We review your request · {reviewTime}. We email you when it's approved."
Tablet 768–1023: the panel only, centred; the aside collapses into the one-line "Next:" sentence.
Phone: no panel frame, full width, 44 px controls and 16 px text; the rules list stays visible under
Password while typing.
```

### 9.4 Components and configuration

| Part | Config |
|---|---|
| OAuth | `OAuthButton`s with `intent=signup` (§8.5), followed by the Terms sentence, because choosing a provider creates the account after the confirm screen |
| Full name | `Field` "Full name" + TextInput lg, `autocomplete="name"`, 2 to 80 characters. "Enter your name." |
| Work email | `Field` "Work email" + TextInput lg, `type="email"`, `autocomplete="email"`, `spellcheck="false"`. "Enter an email address, like name@company.com." Personal addresses are accepted. **No "already registered" check** (it would reveal who has an account; see §9.7). |
| Company (approval only) | TextInput lg `autocomplete="organization"`. "Enter your company's name." |
| Password | `PasswordInput purpose="new"` (C §3.3): `autocomplete="new-password"`, no placeholder, the live rules list from the auth service. Example rules: "At least 10 characters" · "Not a commonly used password" · "Different from your email" (§19 Q9). Paste allowed; no confirm field, because show/hide does that job. |
| Phone | **Not asked** (PA7). Home's "Call yourself" step verifies a mobile number when it is needed. |
| Primary | **Create account**, loading "Creating account…" (approval: **Request access** / "Sending request…") |
| Terms | `meta-12` `--text-3`: "By creating an account, you agree to the **Terms** and the **Privacy policy**." Links open in the same tab and carry the form state in `sessionStorage` (except the password) so Back restores it. |
| Aside | `title-16` H2 "What happens next"; an `<ol>` of three steps with 20 px number marks (the StageProgress "to do" mark, O §14.3), `title-14` titles, `body-14` `--text-2`; a hairline; two facts from the claims sheet with a "See pricing" link |

### 9.5 Confirm your email (`/signup/verify`)

- **H1** "Confirm your email". Body: "We sent a link and a 6-digit code to **a.rao@company.com**. Open the link on any device, or enter the code here."
- **`OneTimeCodeInput`** labelled "Code from the email", then the primary **Confirm**.
- **ResendLink** "Resend email" (30 s cooldown), and "Wrong address? **Change email**". This opens an inline TextInput with the button **Send to this address**; it updates the unconfirmed account and sends a new code, with no trip back to the form.
- **The page advances by itself** when the link is opened in another tab of the same browser. It listens on `BroadcastChannel('vaani-auth')` and polls every 5 s while visible. It then announces "Email confirmed." politely and continues.
- **Confirming** leads to `/signup/workspace` (self-serve) or `/signup/pending` (approval). Workspace creation is 00-app-shell-ia §12.2 and is not redefined here.
- **The link opened in a browser with no session** leads to `/login?reason=verified`. After sign-in, the landing logic resumes at `/signup/workspace` (§12.2).
- **OAuth sign-ups skip this page**: the provider has already verified the address.

### 9.6 OAuth sign-up confirm (`/signup/confirm`)

This page appears when a provider returns an address with no Vaani Labs account (whether it started from `/signup` or `/login`):
- **H1** "Create your Vaani Labs account". Body: "You're signing up as **Anika Rao** (a.rao@gmail.com) with Google."
- The Terms sentence.
- Primary **Create account** (approval mode: a Company field, then **Request access**).
- Tertiary **Use a different account**, which returns to `/signup`.

Nothing else is asked. The name can be changed later in Settings › Profile.

### 9.7 States and copy

| Situation | Pattern | Copy |
|---|---|---|
| Empty fields on submit | Field errors; the first one is focused | "Enter your name." · "Enter your email." · "Create a password." |
| A password rule not met on submit | Field error naming the rule; the rules list is announced once | "Your password needs at least 10 characters." |
| The address already has an account | **Same path as a new sign-up** (verify page). The email tells the owner: "You already have a Vaani Labs account. Sign in, or reset your password." | (no on-page difference, so no enumeration) |
| Wrong or expired code | Field error | "That code didn't work. Check the latest email from Vaani Labs." · "That code has expired. Send a new email." |
| Too many attempts | InlineError; the primary is `aria-disabled` with the reason | "Too many attempts. Try again in 30 s." |
| Network, 5xx, offline | As in §8.7 | the same sentences |
| Already signed in | SignedInPanel | "You already have an account" · **Continue to Vaani Labs** · Use a different account |
| Success (email) | Navigate to `/signup/verify` | none |
| Success (OAuth, self-serve) | Navigate to `/signup/workspace` | none |
| Success (approval) | Navigate to `/signup/pending`, after verification | 00-app-shell-ia §12.2 copy |

### 9.8 Microcopy (create account)

| Before | After |
|---|---|
| `/signup` → "Welcome Back / Sign in to access your dashboard" | "Create your account" (its own route) |
| "Create Account" · "Register for early access (admin approval required)" | Self-serve: "Create your account". Approval: "Request access", with the review time in the aside and on the pending page. |
| "FULL NAME" · placeholder "Priya Sharma" | "Full name" (no placeholder) |
| "PHONE (WITH COUNTRY CODE)" · "+919876543210" | removed (PA7) |
| "PASSWORD" with "••••••••" and no rules | "Password" with live rules |
| "Create Account →" | "Create account" |
| "Already have an account? Sign in" (12 px mono at the foot) | "Already have an account? Sign in" under the H1, 14 px, ≥ 24 px target |
| no Terms or Privacy mention | "By creating an account, you agree to the Terms and the Privacy policy." |

### 9.9 Accessibility and responsive

- One H1; labelled fields; `autocomplete` `name`, `email`, `new-password`, `one-time-code`.
- The rules list is a `<ul>` whose items say "met" or "not yet" in visually hidden text. It updates silently while typing and is announced only on a failed submit (C §3.3).
- The aside is an `<aside aria-labelledby>` placed after the form in the DOM.
- Phones: 44 px controls, 16 px text, no panel frame. At 200% zoom the aside drops under the form instead of squeezing it.

### 9.10 Telemetry

`signup_view` {`accessMode`, `hasNext`} · `signup_method_click` {`method`} · `signup_submitted` {`method`} · `signup_failed` {`code`} · `verification_sent` · `verification_resent` · `email_verified` {`via`: link | code, `crossDevice`, `msSinceSignup`} · `signup_confirm_view` {`provider`} · `signup_completed` {`method`, `msSinceCtaClick`}. First-touch `attribution` goes with the account record, not with these events.

### 9.11 Acceptance criteria (create account)

- [ ] `GET /signup` returns 200 and renders the H1 "Create your account" (or "Request access"), never a redirect. A synthetic check runs it every hour (F-QA-010).
- [ ] Every "Get started", "Request access" and "Create an account" link on public and auth pages and in email points at `/signup` (CI crawl), and `/try` does too.
- [ ] The form has name, email and password (plus company in approval mode), and no phone field.
- [ ] Password rules update as you type; submitting with an unmet rule names that rule under the field.
- [ ] The Terms sentence is visible before any account is created, by email or by OAuth.
- [ ] A sign-up with an address that already has an account shows the same verify page, and the owner receives the "You already have an account" email.
- [ ] The code from the email confirms the account on the page; opening the link in another tab advances this tab within 5 s.
- [ ] `utm_source` captured on the landing page is stored on the new account, with no UTM left in any auth URL.
- [ ] "Free tier", "No card" and "Start free" never render when the claims sheet does not back them.

---

## 10. Forgot and reset password

**Job.** *When I can't remember my password, I want to set a new one from my email and get back in, without being told whether some other address has an account.*

**Findings:** F-QA-031 (the envelope icon overlapped the text; the "Vaani Labsaccount" typo) · F-QA-030 · F-A11Y-025 · F-UX-044 (no sign-out-everywhere) · F-QA-010 ("Create an account" looped to sign-in) · F-VIS-001 (a "§ ACCOUNT / RECOVERY" tracked-mono kicker and a blue second line on the H1).

### 10.1 `/forgot-password`

```
┌ Reset your password ─────────────────────────┐       Sent (same URL; the H1 changes; focus moves to it)
│ Enter the email you use for Vaani Labs.      │       ┌ Check your email ─────────────────────────┐
│ We'll send a link to set a new password.     │       │ If an account exists for a.rao@company.com,│
│ It works for 60 minutes.                     │       │ a reset link is on its way. It works for   │
│ Email                                        │       │ 60 minutes.                                │
│ [ a.rao@company.com                      ]   │       │ Signed up with Google or Facebook? You     │
│ [          Send reset link             ]     │       │ don't need a password. Use that button on  │
│ Back to sign in                              │       │ the sign-in page.                          │
└──────────────────────────────────────────────┘       │ Resend email in 0:24                       │
                                                       │ Use a different email · Back to sign in    │
                                                       └────────────────────────────────────────────┘
```

- **Field:** Email, `autocomplete="email"`, prefilled from `sessionStorage`. **No leading icon.** Wherever a leading icon is used, TextInput pads the text to 34 px, so an icon can never overlap it (C §3.2; F-QA-031).
- **Primary:** **Send reset link**, loading "Sending…".
- **The response is identical** whether or not the address has an account (no enumeration).
- The expiry ("60 minutes") comes from config and is never hard-coded twice.
- **Errors:** the field error "Enter an email address, like name@company.com."; 429, network and 5xx as in §8.7.

### 10.2 `/reset-password?token=…`

| Token | H1 | Body | Actions |
|---|---|---|---|
| Valid | Set a new password | "For a.rao@company.com." | The email as a read-only TextInput with `autocomplete="username"` (so the password manager saves the right entry) · `PasswordInput purpose="new"` with rules · `Checkbox` **Sign out of other devices** (checked by default; F-UX-044) · primary **Save new password** ("Saving…") |
| Expired | This link has expired | "Reset links work for 60 minutes." | Primary **Send a new link** (`/forgot-password`, email carried) · "Back to sign in" |
| Already used | This link was already used | "Your password may already be changed." | Primary **Sign in** · "Send a new link" |
| Invalid | This link doesn't work | "It may be incomplete. Copy the whole link from the email, or send a new one." | Primary **Send a new link** |

- **Success** leads to `/login?reason=password-changed`. The "Other devices were signed out." sentence appears only when the box was ticked. Two-factor sign-in, if on, still applies.
- The account also receives the "Your Vaani Labs password was changed" email (§12.4).

### 10.3 Microcopy (recovery)

| Before | After |
|---|---|
| "§ ACCOUNT / RECOVERY" (tracked mono kicker) | removed |
| "Forgot your / password?" (blue second line) | "Reset your password" (one ink H1) |
| "…tied to your Vaani Labsaccount. … — valid for 60 minutes." | "Enter the email you use for Vaani Labs. We'll send a link to set a new password. It works for 60 minutes." |
| "Send reset link →" | "Send reset link" |
| "← Sign in" · "Create an account" (looped to sign-in) | "Back to sign in" (and `/signup` now works, for anyone who follows the sign-in page's cross-link) |
| "Vaani Labs / Account Recovery" footer | Privacy · Terms · Security · Status |

### 10.4 Acceptance criteria (recovery)

- [ ] `/forgot-password` returns the same page, status and timing (within 100 ms) for known and unknown addresses.
- [ ] No leading icon overlaps text at any width (visual snapshot at 320, 390 and 1440).
- [ ] The reset token is removed from the address bar after load (`replaceState`), and the page sends `Referrer-Policy: no-referrer`.
- [ ] Saving with "Sign out of other devices" ticked ends every other session (integration test); unticked, it does not.
- [ ] Expired, used and invalid tokens each show their own H1 and a working **Send a new link**.
- [ ] The copy lint finds no word joins ("Labsaccount") in any auth template.

---

## 11. Accept an invite (`/invite/<token>`)

**Job.** *When a teammate invites me, I want to join their workspace with the right account in one step.* 00-app-shell-ia §12.3 sends invitees to the landing route afterwards (Home while the workspace's setup is incomplete, else Cockpit). This section owns the page itself.

| Situation | H1 | Body | Actions |
|---|---|---|---|
| Signed out, no account | Join Sample Realty | "Anika R. invited you as a Member. You'll join with a.rao@company.com." | The email as a read-only TextInput with `autocomplete="username"` · Full name · Password (`new`, with rules) · OAuthButtons with `intent=invite` · the Terms sentence · primary **Join Sample Realty** |
| Signed out, an account exists for the address | Join Sample Realty | "Sign in as a.rao@company.com to join." | Primary **Sign in to join** (`/login?next=/invite/<token>`) |
| Signed in as the invited address | Join Sample Realty | "You'll join as a Member." | Primary **Join Sample Realty** · tertiary **Not now** |
| Signed in as someone else | This invite is for another account | "It was sent to a•••@company.com. You're signed in as b•••@other.com." | Primary **Sign out and continue** · tertiary **Stay signed in** |
| The provider returns a different address | (as the first row) | Warning Notice: "This invite is for a•••@company.com. Continue with the Google account that uses that address, or set a password below." | as the first row |
| Expired | This invite has expired | "Invites work for 7 days. Ask Anika R. to send a new one." | Primary **Go to Vaani Labs** (`/login`) |
| Withdrawn | This invite was withdrawn | "Ask your workspace admin if you still need access." | **Go to Vaani Labs** |
| Already accepted | You're already in Sample Realty | none | Primary **Open Sample Realty** (the landing route) |

**Rules:**
- The address is confirmed by the token, so there is no confirm-email step.
- On success, the app shows the toast "You joined Sample Realty." on first paint.
- The inviter's name and the workspace name are the only personal data on the page. The invitee's address is shown masked except to its owner.
- **Acceptance:** each row above renders from a seeded token state (Playwright); a wrong-address OAuth never joins the workspace; the email field cannot be edited.

---

## 12. The hand-off into the app

### 12.1 Paths from the first click to the first screen

```
Self-serve, email
  CTA "Get started" ─► /signup ─► /signup/verify ─► /signup/workspace ─────────────► /home  "Get your first call live · 0 of 5"
  (next, utm kept)     create      link or code      (00-app-shell-ia §12.2)          (00-app-shell-ia §13)

Self-serve, Google or Facebook
  CTA ─► /signup ─► provider ─► /auth/callback ─► /signup/confirm ─► /signup/workspace ─► /home

Approval mode
  CTA "Request access" ─► /signup ─► /signup/verify ─► /signup/pending ══ approval email ══►
      /login?reason=approved ─► /signup/workspace ─► /home

Invited teammate
  invite email ─► /invite/<token> ─► name + password, or a provider ─► landing route (Home or Cockpit)

Returning user
  /login ─► (/login/code if two-factor is on) ─► next, or the landing route
```

### 12.2 Rules

1. **Every step is its own URL with an H1**, so each can be bookmarked, measured and resumed. Once the workspace exists, `/home` replaces the history entry, and Back does not reopen the workspace form.
2. **Resume where you left off.** The server keeps `account.stage`: `needs_verification`, `needs_workspace`, `pending` or `active`. The landing logic of 00-app-shell-ia §2.5 gains two lines, ahead of the existing ones:
   ```
   if account.stage === 'needs_verification' → /signup/verify
   if account.stage === 'needs_workspace'    → /signup/workspace
   if account.stage === 'pending'            → /signup/pending
   ```
3. **`next` for new workspaces.** `next` is honoured for returning users and invites. A brand-new workspace always lands on **Home**, because every other page would be empty or blocked there. A `next` that was carried is kept in the setup track as "Continue to {page}" once Home loads.
4. **No false "live".** No step says "You're live", and there is no tour and no confetti. The workspace is created with the user as Admin (F-UX-001); Home counts 0 of 5, and only its completion says "Your workspace is live." (00-app-shell-ia §13.5; F-UX-006).
5. **`/try` hand-off** (§19 Q10). If the visitor built a demo agent on `/try` and the backend can import it, Home's "Publish a flow" row offers **Use the flow from your demo** as a draft. It must still be published through the Publish gate. The demo never becomes live silently.
6. **Theme and attribution carry over.** The `vaani:theme` choice made on the marketing site applies in the app. First-touch attribution is stored on the account once and never shown to the user.
7. **Speed budget.** From the CTA click to Home, the median is ≤ 90 s for email sign-up and ≤ 45 s for OAuth, measured by `signup_completed.msSinceCtaClick`.

### 12.3 Retired: `/onboarding`

`/onboarding` 308-redirects to `/home` (00-app-shell-ia §2.4). Its content is replaced:

| Before | After |
|---|---|
| The stepper PROFILE · SUBDOMAIN · FLOW · TEST CALL · DONE | Profile fields → `/signup` (name) and Settings › Profile; subdomain → `/signup/workspace`; flow, test call and the rest → Home's five checks |
| "You're *live.*" · "FIRST RUN COMPLETE" · "three doors" | "Get your first call live · 0 of 5"; "Your workspace is live." only after all five pass |
| "Go to dashboard" | none; Home is the first screen, and "Go to Cockpit" appears when setup completes |

### 12.4 Transactional email

- **Sender:** `Vaani Labs <no-reply@vaanilabs.in>`, Reply-To `support@vaanilabs.in`.
- **Layout:** one purpose per email; a 560 px single column on white; the V tile as a 24 px PNG with `alt="Vaani Labs"`; Hanken Grotesk with the Arial fallback; one "bulletproof" Neel button (white on `#2B45C2`, 7.68:1, 44 px tall); the code in a monospace stack at 24 px with `aria-label` reading the digits separately.
- **Every email carries:**
  - the expiry sentence;
  - "Didn't ask for this? You can ignore this email.", where that applies;
  - a footer with the legal line and address.
- **Not allowed:** tracking pixels and link rewriting in transactional mail.
- A plain-text part mirrors the HTML, with the code on its own line.

| Email | Subject | Body (one sentence of purpose) | Button | Code | Expiry |
|---|---|---|---|---|---|
| Confirm email | Confirm your email for Vaani Labs | "Use the button or the code to confirm a.rao@company.com." | Confirm email | 6 digits | 30 min (§19 Q11) |
| Sign-in link | Your Vaani Labs sign-in link | "Use the button or the code to sign in." | Sign in | 6 digits | 15 min |
| Reset password | Reset your Vaani Labs password | "Use the button to set a new password." | Set a new password | none | 60 min |
| Password changed | Your Vaani Labs password was changed | "If this wasn't you, reset your password now and tell us at support@vaanilabs.in." | Reset password | none | none |
| Existing account (sign-up attempt) | You already have a Vaani Labs account | "Someone tried to create an account with this address. If it was you, sign in or reset your password." | Sign in | none | none |
| Invite | Anika R. invited you to Sample Realty on Vaani Labs | "Join Sample Realty as a Member." | Join Sample Realty | none | 7 days |
| Request received (approval) | We've received your request | "We review requests {reviewTime}. We'll email you when it's approved." | none | none | none |
| Access approved (approval) | Your Vaani Labs access is approved | "Sign in to create your workspace." | Sign in (`/login?reason=approved`) | none | none |

Subjects and bodies follow direction §4: sentence case, no exclamation marks, no "Oops", and "Vaani Labs" spelled one way.

---

## 13. Signed-out 404 and auth-level errors

### 13.1 Not found (signed out)

Unknown routes for signed-out visitors render **inside MarketingLayout** with HTTP 404 and `noindex`. The signed-in 404 lives in the app shell (00-app-shell-ia §15). The two are chosen by session, never by guessing.

```
┌ MarketingHeader ─────────────────────────────────────────────────────────────┐
│                                                                              │
│                                 ⌕ (search-x, 20)                             │
│                              Page not found        (H1 title-24)             │
│                        The link may be old, or the page moved.               │
│                  [ Go to the home page ]   Pricing · Docs · Contact          │
│                                                                              │
└ MarketingFooter ─────────────────────────────────────────────────────────────┘
```

- EmptyState anatomy (O §15.2): the icon has no tile; the actions are a primary Button (the home page) and three links.
- If the path looks like an app route (`/leads…`, `/flows…`, `/settings…`), the primary becomes **Sign in** with `next` set to that path. After sign-in the user lands on the app's own 404 or on the page itself.
- `<title>` is "Page not found · Vaani Labs".
- **Retired:** "SIGNAL LOST", "The neural pathway… relocated to a different sector", "ERR: 0x404 • NODE: MUMBAI-1 • STATUS: DISCONNECTED", "Return Home" (F-QA-039, F-QA-017).

### 13.2 Auth-level failures (all auth routes)

| Case | Surface | Copy |
|---|---|---|
| The auth service is down (5xx on every call) | InlineError on the form | "Sign-in isn't working right now. Your data is safe. Try again in a few minutes." · Status ↗ (only if `status.live`) |
| Cookies blocked (the session cannot be set) | Warning Notice under the H1 | "Your browser is blocking the cookies Vaani Labs needs to keep you signed in. Allow cookies for vaanilabs.in and try again." |
| Old browser without `fetch` or modules | A server-rendered notice | "This browser isn't supported. Use a recent Chrome, Edge, Firefox or Safari." |
| Clock skew makes codes fail | After two failed two-factor codes | Field hint: "Codes depend on your device's clock. Check that it's set automatically." |
| Session expired while on an auth page | none: auth pages need no session | |

---

## 14. Microcopy: vocabulary and global strings

Per-page before → after tables: home §5.10, pricing §7.9, sign in §8.8, create account §9.8, recovery §10.3, onboarding §12.3.

**One word per concept** (extends direction §4.3):

| Concept | Use | Retire |
|---|---|---|
| Getting in | **Sign in** (header link, H1, button) · **Sign out…** (app) | Log in, Login, Sign In →, Welcome Back |
| Getting an account | **Create account** (button) · **Create your account** (H1) · **Request access** (approval mode) · **Get started** (marketing CTA) | Sign up, Register, Create Account →, early access |
| Passwordless | **Email link**, "Email me a sign-in link" | Magic Link |
| Second factor | **Two-factor code** (matches Settings › Security) | 2FA in user-facing copy, OTP (except as a technical term in docs) |
| The team space | **Workspace** | org, organisation (except "Organization and team" in Settings) |
| The address | **Email**, **Work email** | e-mail, EMAIL |
| Contact | **Talk to sales** (opens Request a pilot) · **Book a call** (the one booking link) | Email us, Talk to Sales ↗, Scope pilot |
| The live demo | **Try it live** (`/try`) | Build your own, Talk to the agent, Talk to it live right here |

**Global strings:**

| Where | Before | After |
|---|---|---|
| `<title>` on every public page | "Vaani Labs - The Voice AI that speaks India" | per page (§3.1); the home keeps "Vaani Labs · The voice AI that speaks India" |
| Brand names | VaaniLabs · VaaniVoice · VV API · Vani Voice · StarVox Labs in consent text | "Vaani Labs"; the legal entity once, in the footer (§19 Q6) |
| Header CTAs | "Log in" · violet pill "Get started" · cyan "Build your own" | "Sign in" · Neel "Get started" (or "Request access") · "Try it live" |
| Footer | "● All Systems Operational" (static) · lowercase headings uppercased by CSS · "Talk to Sales ↗" | nothing unless monitored · real-case headings · "Book a call" with `external-link` |
| Separators and arrows | em-dashes, typed "→", "↗" on same-tab links | " · " or a full stop; Lucide `arrow-right` only where an icon helps; `external-link` only for off-site links |
| Error tone | "Please…", "Oops", "Invalid input", browser bubbles | a verb-first sentence with the fix: "Enter an email address, like name@company.com." |

---

## 15. Accessibility summary (every public and auth page)

| Area | Rule | Findings |
|---|---|---|
| Structure | `header` / `nav` / `main` / `footer` on public pages; `main` plus a legal `nav` on auth pages; one H1; no skipped heading levels; `lang="en"` on `<html>` and `lang` on every Hindi or Hinglish fragment | F-A11Y-026 |
| Labels and input purpose | `Field` everywhere; `autocomplete` of `username`, `email`, `name`, `organization`, `current-password`, `new-password` or `one-time-code`; no placeholder standing in for a label | F-A11Y-003, F-A11Y-020, F-A11Y-025 |
| Accessible authentication (WCAG 3.3.8) | Paste always works; password managers are supported; an email link and a code are offered; no puzzle or CAPTCHA in v1 (if bot protection is added, it must be invisible or have an accessible alternative) | F-A11Y-025 |
| Errors | Under the field with `aria-describedby` and `aria-invalid`; form failures are `role="alert"`; arrival reasons are `role="status"`; never native bubbles | F-QA-030 |
| Focus | The global 2 px `--focus` outline with a 2 px offset; the password toggle rings inside the field; focus is never lost when modes switch (it moves to the new H1) | F-A11Y-006 |
| Targets | ≥ 24 px, or 44 px on touch, for links in text rows, the password toggle, resend and footer links | F-A11Y-023 |
| Contrast | Only token pairs (foundations §3.8): Neel buttons 7.68 / 6.21:1, text-3 ≥ 4.70:1, the footer band 11.36 / 7.47:1; no alpha on text; a solid header in both themes | F-A11Y-009, F-A11Y-021, F-A11Y-029 |
| Motion | No entrance, scroll or idle animation; the demo's active-turn change is state; reduced motion removes smooth scrolling | F-A11Y-022, F-QA-032 |
| Time limits (WCAG 2.2.1) | Expiring links and codes always offer "Send a new one"; countdowns are informative and never announced | |
| Reflow and zoom | No horizontal scroll at 320 CSS px or at 400% on a 1280 desktop; the aside drops below the form; the header keeps the menu and the CTA | F-RWD-017, F-RWD-018 |
| Forced colours | Notices and panels get visible borders; OAuth buttons keep `ButtonBorder`; focus is `Highlight` | foundations §13 |
| Screen-reader walkthroughs before release | NVDA with Chrome on `/login` → `/login/code`, and on `/signup` → `/signup/verify`; VoiceOver on iOS for the same two paths and the home player | |

---

## 16. Telemetry: the funnel and the governance

**The funnel dashboard** (one chart, counted per day):

`cta_click(get_started | request_access)` → `signup_view` → `signup_submitted` → `email_verified` → `workspace_created` (00-app-shell-ia §13.9) → `setup_step_completed` × 5 → `setup_completed` → `first_customer_call`

It is broken down by `accessMode`, `method` (email, google, facebook) and first-touch `attribution.source`.

**Governance:**
- Marketing events are sent only after **Allow** (§4.4). Before that there are only anonymous page counts.
- Auth events are first-party server-side counters, keyed to the account only after it exists.
- **No** email, name, phone, token, typed search or estimator value in any payload. Estimator inputs are sent as bands.
- Session replay never runs on public or auth routes (F-UX-045).
- RUM budgets are tracked per route: `/` LCP ≤ 2.5 s and CLS ≤ 0.1; `/login` and `/signup` LCP ≤ 1.8 s. Alerts fire at the 75th percentile.

---

## 17. Cross-cutting acceptance criteria

- [ ] Every public route renders the same MarketingHeader and MarketingFooter (a crawl compares their DOM signature) with header, nav, main and footer landmarks.
- [ ] Every public and auth page loads at most three type families plus the rupee glyph, and no colour outside the tokens except the brand SVGs in `components/brand/` (CSS scan: no `#7C6BF5`, `#38C6E0` or `#2F5FE0`).
- [ ] The theme follows the system by default. A choice made on the marketing site persists into `/login` and the app. Changing the theme sends no request.
- [ ] Playwright smoke across every public and auth route: no `pageerror` (including React #418), no failed first-party request, no horizontal scroll at 320, 768, 834, 1024 and 1280.
- [ ] axe finds zero serious or critical issues on every public and auth route in light and dark; a keyboard-only walkthrough reaches every control in visual order.
- [ ] No analytics cookie exists before **Allow**; with DNT or GPC on, the ConsentBar never shows and nothing is set (network and cookie log test).
- [ ] The copy lint passes, and every `claims.ts` entry has an owner and a `verifiedOn` date within 90 days.
- [ ] A link crawl finds no `/signup` → `/login` redirect, no dead anchor, no link to `advisio.in` or `starvoxlabs.io`, and exactly one booking domain.
- [ ] Visual regression snapshots at 320, 390, 768, 1024, 1280 and 1440 in both themes for the home hero, pricing, sign in (default, error), create account, check email, two-factor code, reset (valid, expired) and the 404.
- [ ] No auth route shows a full-screen spinner; transient routes show "Signing you in…" only after 200 ms.

---

## 18. New components needed

| Component | Why the existing set does not cover it | Spec |
|---|---|---|
| `MarketingLayout` (`MarketingHeader`, `MobileMenu`, `MarketingFooter`) | The AppShell (N §1) serves signed-in routes; the public frame had eight variants | §4.1. Built from Button, IconButton, Sheet, Menu and SegmentedControl; the footer uses the Baseline tokens |
| `AuthLayout` and `SignedInPanel` | 00-app-shell-ia §3.2 names the bare mode but no component | §4.2 |
| `ThemeMenu` | A Menu with radio items whose icon is chosen by CSS from `data-theme-choice`, so server and client markup match | §4.3 |
| `ConsentBar` | Nothing exists | §4.4 |
| `OAuthButton` | Button's `leadingIcon` accepts Lucide icons only; provider marks are full-colour brand assets with their own rules | Props `provider`, `intent` (login, signup, invite), `next`, `lastUsed`. It renders `Button asChild` around an `<a>` (secondary, lg, full width), a 16 px brand mark, the label "Continue with {Provider}", loading "Opening {Provider}…", and `Tag outline "Last used"` when true |
| `OneTimeCodeInput` | Core has no code input; needed for email codes, two-factor, `/try` and phone verification on Home | **One** `<input>` (not six boxes, which break paste and screen readers): `inputmode="numeric"`, `autocomplete="one-time-code"`, `mono-20` digits, width `--field-w-short` (180). Paste strips spaces and hyphens. It checks at 6 digits, and the hint says so first. Field states and errors per C §3. A `recovery` variant accepts letters and hyphens |
| `ResendLink` | A countdown recipe | Link Button, `aria-disabled` with the reason "Available in 24 s"; visible "Resend email in 0:24"; silent countdown; after sending, StatusText "Sent again at 11:42 am." |
| `DemoPlayer` | A marketing composite | §5.6: RecordingPlayer + TranscriptFeed (review) + Select + SegmentedControl + StatusTag |
| `TemplateStrip` | Use the Flow Designer's template mini strip (direction §6.5) if its spec defines it; otherwise this minimal one | Four phase silhouettes with answer rows; the 12 px floor; `role="img"` whose name lists the steps ("Trigger: inbound call. Logic: ask about a site visit, answers Yes, Later, No reply. Action: book site visit. Outcome: visit booked.") |
| `RatesTable` | A shared configuration | §7.5: DataTable without pager or selection; ListRow on phones; shared with Billing › Plans "Your rates" |
| `CostEstimator` | A new calculation card | §7.5 |
| `PilotRequestDialog` | A Dialog md configuration | §7.6 |

**Icon additions** (Lucide, 1.5 px): `monitor`, `sun`, `moon`, `eye`, `eye-off`, `mail`, `map-pin`, `languages`, `message-circle`. **Brand marks** (`components/brand/`, the only raw colours allowed by lint): Google, Facebook, LinkedIn, GitHub.

**Tokens** (registered in 01-foundations §18, emitted by `tokens.json` 1.1.0; interim `calc()` values retired):
- `--size-auth-panel`: 464 px (container-narrow + 2 × 32).
- `--type-display-48`: 48/52, 600, −0.03 em, the named tablet step of `display-56`, used at 768–1279 (§4.1).
- `--section-pad-y`: 80 / 64 / 48 px at ≥1024 / 768–1023 / <768 (responsive in `tokens.css`).

**Cross-spec notes:**
- **00-app-shell-ia §3.2:** add `/login/check-email`, `/login/code`, `/signup/confirm`, `/signup/verify`, `/reset-password`, `/invite/<token>` and the transient `/auth/*` routes to the bare list.
- **00-app-shell-ia §2.5:** add the `account.stage` lines (§12.2).
- **05-knowledge-billing:** the rates endpoint gets a public, cached read (A10).

---

## 19. Open questions for the product owner

1. **Access model.** Self-serve prepaid, or approval-gated early access? And what is the real review time? This decides every CTA label and the pending screen (F-QA-011).
2. **Free allowance.** Is there any free credit for phone calls, or only the 30 free meeting minutes? Can people sign up without a card? "Start free" and "No card" render only if yes.
3. **Claims.** Which Indian languages are supported (names, and the count to show)? What is the latency figure and how is it measured? Which meeting platforms are supported today? Can customers bring their own numbers? What is the data-residency wording?
4. **OAuth.** Keep Facebook login for a B2B product? If so, is the label "Continue with Facebook" (checked against Meta's current brand guidance)? Is Microsoft planned (`/security` says so)?
5. **Meeting plans.** Are PlanCards shown publicly, and chosen only after sign-up?
6. **Entity and addresses.** Is the relationship between Vaani Labs and StarVox Labs as the footer line should state? Confirm the one sales address, the one booking link, and moving founder addresses to the brand domain (F-QA-035).
7. **Demo recordings.** Were the hero recordings made with test customers who gave permission? Otherwise re-record before launch.
8. **"Trust this browser for 30 days"** on two-factor: does the auth provider support it?
9. **Password policy.** Minimum length and a breach check (C §11 Q7).
10. **`/try` → workspace.** Can the demo agent be imported as a draft flow after sign-up (§12.2 rule 5)?
11. **Expiries.** Email confirmation 30 min, email link 15 min, reset 60 min (today), invite 7 days. Confirm them.
12. **Hindi marketing pages.** The chrome is English in v1 (direction §4.5). Is a Hindi home planned, and who translates the claims?
13. **Hosting.** Will the marketing site move into the same Next.js app, so tokens, fonts and the theme script are shared, or stay a separate build that imports `tokens.css`?
14. **Consent copy.** A DPDP review of the ConsentBar wording, and whether first-touch attribution kept in `sessionStorage` needs consent.

---

## 20. Traceability

| Finding | Where it is resolved |
|---|---|
| F-QA-001 (critical) | §3.3 claims sheet and copy lint; §6 `/about` |
| F-QA-007 (auth part) | §3.2 `next` and `reason`; §8.7 `expired` |
| F-QA-009 | §3.3; §5.4 section 7; §6 `/security` |
| F-QA-010 | §1 PA5; §9; §12.1; §9.11 synthetic check |
| F-QA-011 | §1 PA3; §3.3 access mode; §7 billing-unit sentence |
| F-QA-012 | §7 |
| F-QA-013 | §1 PA1–PA2; §4.1; §6; §17 |
| F-QA-025 | §3.3; §5.10; §8.5 providers |
| F-QA-026 | §4.3 |
| F-QA-027 | §5.4 ids and legacy map; §6; §17 crawl |
| F-QA-028 | §6 `/enterprise`, `/docs` |
| F-QA-029 | §4.1 footer status; §6 `/changelog`, `/status` |
| F-QA-030 | §1 PA6–PA8, PA13; §8; §9 |
| F-QA-031 | §10.1; §3.3 copy lint |
| F-QA-032 | §1 PA12; §5.9 |
| F-QA-033 | §1 PA11; §4.4 |
| F-QA-034 | §5.4 hero and testimonials rule; §6 `/try` |
| F-QA-035 | §3.3 contact; §7.6 routing |
| F-QA-039 | §4.2 footer; §13.1 |
| F-QA-040 | §4.1 one container; §5.4 grid; §5.10 icons |
| F-VIS-001, F-VIS-025 | §4; §8.8; §10.3 |
| F-VIS-004, F-VIS-008 | §1 PA1; §4.1; §5.13 |
| F-VIS-026 | §5.3–5.5 |
| F-A11Y-003, F-A11Y-020 | §7.6; §8.5; §9.4; §15 |
| F-A11Y-006, F-A11Y-023, F-A11Y-025 | §8.5; §8.9; §15 |
| F-A11Y-009, F-A11Y-021, F-A11Y-029 | §4.1; §5.11; §15 |
| F-A11Y-026 | §4.1; §4.2; §15 |
| F-RWD-017, F-RWD-018 | §4.1; §5.5; §7.4; §8.10 |
| F-RWD-019, F-UX-006 | §12.3 |
| F-UX-001 | §12.2 rule 4 (with 00-app-shell-ia §12.2) |
| F-UX-029 | §1 PA10; §13.1 |
| F-UX-043 | §14 |
| F-UX-044 | §10.2 "Sign out of other devices" |
| F-UX-045 | §4.4; §16 |
