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
