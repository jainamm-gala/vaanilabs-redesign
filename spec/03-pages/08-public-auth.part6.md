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
