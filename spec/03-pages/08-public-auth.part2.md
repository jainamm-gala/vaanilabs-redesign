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
