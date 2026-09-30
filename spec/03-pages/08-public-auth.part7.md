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
