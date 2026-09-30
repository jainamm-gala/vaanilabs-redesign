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
