
### F-QA-006 — Browser test calls are stored as two call records (inbound and outbound legs), inflating counts
- **Severity:** high · **Confidence:** verified
- **Source findings:** QA-B-04
- **Pages:** /analytics (§07 Recent, §02 Headline), /call-reports
- **Evidence:**
  - Analytics §07 "Recent — the latest ten" shows 5 INBOUND/OUTBOUND pairs.
    - Each pair has the same start minute and durations 1 s apart: 11s/10s, 1m 27s/1m 26s, 11s/10s, 41s/40s, 1m 42s/1m 41s.
    - The inbound row shows no numbers ("— → —").
    - Sentiment sometimes differs within a pair (mixed vs negative).
  - Across all 121 records in `/api/calls?limit=200`:
    - 54 are inbound/browser, 56 are outbound/manual/browser, and 11 are vobiz.
    - 41 are same-minute inbound+outbound pairs (19 of them in the latest 50), with starts 69 ms to 3.3 s apart.
    - Transcript word overlap within a pair is 0.89–0.96 for several long calls, so each pair is one conversation recorded twice.
  - Call Reports labels both legs "BROWSER".
  - About a third of all call records (roughly 41 of 121) are duplicate legs. That inflates "Total calls 121", "This week 24", minutes, averages and sentiment counts.
  - **Not verified:** whether billing is also doubled.
- **Screenshots:** audit/screenshots/va-verify-qa-b/analytics-recent.png, audit/screenshots/va-qa-b/analytics-s4.png, audit/screenshots/va-qa-b/callreports-1.png, audit/screenshots/va-ux-audit/crop_callreports_paired_rows.png
- **Recommendation:**
  1. **Model a call as one conversation with legs.** Add a `conversation_id` (or `parent_call_id`) and write both browser legs under it.
  2. **Count at the conversation level.** Analytics, Call Reports and Leads should count, time, score sentiment for and list conversations. Run sentiment once per conversation.
  3. **Show one row per conversation**, with a "2 legs" disclosure in Call Details.
  4. **Backfill existing records** by pairing inbound/browser with outbound/manual rows whose start is within 5 s and whose transcripts overlap by at least 0.8.
  5. **Confirm billing:** the wallet must be debited per conversation, not per leg.
  6. **Add a contract test:** one browser test call produces exactly one conversation.

---

### F-QA-007 — Hard loads block on a full-screen loader until `/api/auth/me` returns; a slow auth call sends the user to a bare /login; offline navigation dead-ends
- **Severity:** high · **Confidence:** multi-agent (the /login redirect was seen in two agents' first runs and not reproduced in this run)
- **Source findings:** EXPLORE-CORE-18, QA-A-12, VISUAL-AUDIT-18
- **Pages:** all authenticated routes (measured on /dashboard, /meeting-agent, /leads, /settings/organization)
- **Evidence:**
  - **Every hard navigation** shows only a centred "Loading…" spinner, with no sidebar, header or skeleton, until `/api/auth/me` resolves.
    - First H1 appeared at 2.4–5.0 s: 2.6 s on /dashboard and 4.9 s on /meeting-agent, with DOMContentLoaded at 0.8–2.3 s.
    - Under a 600 ms RTT / 200 KB/s throttle, /dashboard showed the blank loader for **10.2 s**.
    - The visual agent captured /dashboard at 1366×768 at 3.5 s with no sidebar, header or Customer Intel. /settings/organization at 2.8 s showed only "BACK TO SETTINGS" and "Loading…".
  - **Every page load** calls `/api/auth/me`, `/api/orgs?include=membership`, `/api/onboarding/state` and `/api/billing/wallet`. The Cockpit fetches the wallet 4 times. The sidebar prefetches 24 RSC payloads (12 routes × 2 hashes).
  - **Sidebar (client-side) navigation** takes 0.8–1.2 s with the old page still shown and no progress indicator.
  - **Auth timeout.** In an earlier run, two `/api/auth/me` calls failed after about 10 s (status 0).
    - The tab went blank, then redirected to a bare `/login`: no `?next=`, no "session expired" message, while the `sb-*` cookies were still present.
    - Several tabs went to /login at once.
    - UX-audit's first run saw the same blank-then-/login redirect.
  - **Offline.** Client-side navigation while offline logs "Failed to fetch RSC payload … Falling back to browser navigation" and lands on Chrome's `chrome-error://chromewebdata/` page. The app shell is lost, and there is no retry.
  - Absolute timings are inflated by a shared lab browser. The pattern (shell rendered after data) is consistent across three agents.
- **Screenshots:** audit/screenshots/va-qa-a/throttle_dashboard_2500ms.png, audit/screenshots/va-qa-a/throttle_dashboard_5000ms.png, audit/screenshots/va-qa-a/throttle_dashboard_h1.png, audit/screenshots/va-explore-core/dashboard_blank_while_auth_me_pending.png, audit/screenshots/va-explore-core/spa_transition_250ms.png, audit/screenshots/va-visual-audit/dashboard_1366x768.png, audit/screenshots/va-visual-audit/leads_1366x768.png, audit/screenshots/va-ux-audit/00_redirected_to_login.png, audit/screenshots/va-qa-a/offline_spa_nav_analytics.png, audit/screenshots/va-qa-a/offline_reload_dashboard.png
- **Recommendation:**
  1. **Render the shell immediately.** Put the sidebar, top bar and banner slot in the `(dashboard)/layout` so they render from the server or the first client paint and never unmount between routes. Gate only page data on `/api/auth/me`, and show per-region skeletons.
  2. **Redirect only on an explicit 401.** On a timeout, network error or 5xx, show an inline "Reconnecting…" bar with Retry. When a redirect is required, use `/login?next=<path>&reason=expired`.
  3. **Single-flight the token refresh** across tabs with `navigator.locks` or `BroadcastChannel`, so one slow refresh does not log out every tab.
  4. **Cache `/auth/me`, orgs, onboarding state and the wallet** in a shared query cache (for example React Query with a `staleTime` of 60 s), and dedupe the four wallet calls.
  5. **Add a top progress bar** for route transitions. Limit `<Link>` prefetch to hover/viewport (`prefetch={false}` on the rail).
  6. **Handle offline.** Listen to `online`/`offline`, show a global "You're offline" banner, and cancel client navigation instead of falling back to a hard navigation.
  7. **Track** time-to-shell and time-to-first-H1 in RUM, with a budget of shell at 1 s or less and H1 at 2.5 s or less on 4G.

---

### F-QA-008 — The Embed page's code snippets display corrupted highlighter markup
- **Severity:** high · **Confidence:** multi-agent (QA-B-08 reports the same issue)
- **Source findings:** EXPLORE-SETTINGS-04
- **Pages:** /api-keys/embed (Settings › Embed)
- **Evidence:**
  - The first rendered line of snippet §01 is `<"vv-attr">class="vv-tag">div "vv-attr">id="vaani-voice"></"vv-attr">class="vv-tag">div>`. The innerHTML contains nested `<span <span="" class="&lt;span">`: the highlighter re-highlights the `<span class="vv-attr">` markup it injected itself.
  - The `//` in `https://…` is styled as a comment, splitting the URL.
  - All 4 snippets are affected.
  - **What COPY puts on the clipboard (the agents disagree):**
    - EXPLORE-SETTINGS intercepted the clipboard and found clean code, so what users read differs from what they paste.
    - QA-B's clipboard read-back was empty, so it could not confirm the payload.
  - The live-preview cards are about 180 px wide, and their text is clipped at the top.
  - This is the page developers use to integrate the widget, so garbled code undermines trust in the whole developer surface.
- **Screenshots:** audit/screenshots/va-explore-settings/c9_embed_snippet.png, audit/screenshots/va-explore-settings/api_keys_embed.png, audit/screenshots/va-qa-b/embed-snippet.png, audit/screenshots/va-verify-qa-b/embed-snippet.png
- **Recommendation:**
  1. **Replace the regex highlighter.** Tokenise the raw snippet once with Shiki or Prism at build time, or with `highlight.js` on an HTML-escaped string, and render its output. Never feed highlighted HTML back into the highlighter.
  2. **Copy the raw source string** (`navigator.clipboard.writeText(snippet.raw)`), not DOM text.
  3. **Add a test** asserting that `pre.textContent === snippet.raw` for every snippet, plus a visual snapshot.
  4. **Widen the preview cards** to at least 280 px and remove the top clipping.

---

### F-QA-009 — Compliance and certification claims contradict each other across the public site
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-02
- **Pages:** /changelog, /docs, /build.html, /about vs /security and /
- **Evidence:** every quote was re-checked live.
  - **What other pages claim:**
    - /changelog v2.0.0: "SOC 2 Type II compliant architecture".
    - /docs card: "Understand our security practices and compliance certifications." with a bullet "SOC 2 compliance overview".
    - /build.html badge: "DPDP + RBI / COMPLIANT BY DEFAULT".
    - /about: "2026 SOC 2 Type II Certified" (F-QA-001).
  - **What /security says:** no external audit yet; SOC 2 is at readiness, with the observation window starting Q4 2026. The home page says "readiness is in progress".
  - **Other contradictions:**
    - /security says "OAuth via Google and Microsoft for workspace SSO". /login offers only "Continue with Google" (`/api/auth/oauth/google`) and "Continue with Meta" (`/api/auth/oauth/facebook`).
    - /security says "TOTP is on the roadmap for Q3 2026". Q3 ended 4 days after the audit date.
    - /security shows "Last updated · April 25, 2026", five months stale.
- **Screenshots:** audit/screenshots/va-public-site/changelog_top.png, audit/screenshots/va-public-site/docs_top.png, audit/screenshots/va-public-site/build_top.png, audit/screenshots/va-public-site/security_part0.png, audit/screenshots/va-public-site/security_part_end.png, audit/screenshots/va-verify-public-site/changelog_top.png
- **Recommendation:**
  1. Make /security the single source of truth for compliance status. Other pages link to it and do not restate it.
  2. Use one approved phrase site-wide, for example "SOC 2 Type II: readiness in progress (observation window from Q4 2026)".
  3. Replace "compliant by default" with specific controls: "Data stored in India (AWS Mumbai)", "Consent captured before outbound calls".
  4. Edit the old changelog entry to "Architecture designed for SOC 2 controls".
  5. Correct the OAuth provider list (Google, Meta), move the TOTP date, and bump "Last updated".
  6. Add the compliance phrases to a CI copy-lint deny-list ("certified", "compliant") that fails outside /security.

---

### F-QA-010 — /signup redirects new users to the sign-in screen, and every "Get started" / "Start free" CTA lands there
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-03
- **Pages:** /signup, /login, /forgot-password, /build.html; all acquisition CTAs on /
- **Evidence:**
  - In a fresh cookie-less context, `GET /signup` redirects to `/login` (chain `/signup → /login`, final status 200). The page renders H2 "Welcome Back / Sign in to access your dashboard", with no H1.
  - **CTAs that point at /signup:**
    - home header "Get started";
    - both "Start free" buttons;
    - "Explore analytics →" and "Open Flow Builder →" (absolute `https://vaanilabs.in/signup`);
    - "Create an account" on /forgot-password.
  - /build.html "Get started" goes straight to `/login`.
  - **The only switch to sign-up** is the BUTTON "Don't have an account? Sign up".
    - Size and type: 216×16 px, 12 px JetBrains Mono.
    - Contrast: `rgb(122,131,151)` on a card of `rgba(255,255,255,.85)`, 3.80:1.
    - Position: y≈738, at the bottom of the card.
  - After clicking the switch, the H2 becomes "Create Account", but the URL stays `/login`, so the mode cannot be linked or tracked.
  - Rated high rather than critical because sign-up is still reachable.
- **Screenshots:** audit/screenshots/va-public-site/signup_route.png, audit/screenshots/va-public-site/login_default.png, audit/screenshots/va-public-site/login_signup_toggle.png, audit/screenshots/va-verify-public-site/signup_route.png, audit/screenshots/va-verify-public-site/signup_toggled.png
- **Recommendation:**
  1. Serve `/signup` as its own route (or `/login?mode=signup`) that opens in "Create account" mode, with an H1.
  2. Replace the footer text link with a segmented control at the top of the card ("Sign in | Create account", at least 40 px tall, 4.5:1 contrast) that updates the URL.
  3. Preserve `next` and UTM parameters across the switch and through OAuth.
  4. Point /build.html "Get started" at /signup.
  5. Add a synthetic check that `/signup` renders the sign-up form, not a redirect.

---

### F-QA-011 — Access and pricing promises contradict each other across the funnel
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-04
- **Pages:** /, /login (sign-up mode), /pricing, /docs, /docs/api/billing, /changelog
- **Evidence:** all quotes were verified live.
  - Home: "Start free and build your first agent in minutes…" and "Free tier · No credit card to start · Cancel anytime".
  - Sign-up mode: "Register for early access (admin approval required)". Changelog v2.0.2 mentions an "approve/reject workflow".
  - /docs Quick Start: "Create an account and get approved".
  - /pricing: "Launch a paid pilot…" and "Public pricing stays sales-led".
  - /docs/api/billing:
    - "Vaani Labs is prepaid… no monthly minimums, no plans";
    - public rates of textvoice 4, voicebot 4, meeting-agent 8 and meeting 1 paise/sec;
    - its H1 is "Per-second billing", yet it says "Voice surfaces round up to whole billable minutes" (`bill_paise = ceil(seconds/60) * sell_rate_per_minute`).
  - The signed-in app uses a prepaid INR wallet.
  - So a visitor is promised free self-serve, then meets approval gating, then a sales-led paid pilot, then a public prepaid price list.
- **Screenshots:** audit/screenshots/va-public-site/home_full_part3.png, audit/screenshots/va-public-site/login_signup_toggle.png, audit/screenshots/va-public-site/pricing_full_part0.png, audit/screenshots/va-public-site/docs_api_billing.png, audit/screenshots/va-verify-public-site/login_signup_mode.png
- **Recommendation:**
  1. Decide the go-to-market model and write one sentence for it that every surface reuses.
  2. **If access is approval-gated:** rename CTAs "Request access", state the review SLA on the CTA and on the post-sign-up screen, and remove "Free tier / No credit card / Cancel anytime".
  3. **If self-serve prepaid exists:** publish the per-minute INR rates, the wallet top-up model and any free credit on /pricing, beside an Enterprise pilot column.
  4. **Fix the billing unit contradiction:** either bill per second, or retitle the page "Per-minute billing, rounded up".

---

### F-QA-012 — /pricing has no prices, no header navigation, and sends enquiries to a third-party email domain
- **Severity:** high · **Confidence:** partially-verified (core claims confirmed; the form-size and "no navigation" sub-claims were corrected)
- **Source findings:** PUBLIC-SITE-05
- **Pages:** /pricing (desktop and 390 px)
- **Evidence:**
  - **Structure:** 0 `<nav>` and 0 `<main>`. The header holds only the logo and "Email us", a `mailto:` on the third-party domain advisio.in; the in-form email link uses the same domain. The booking link goes to an external site. The page does have a full `<footer>` with about 24 site links, so what is missing is header navigation, not all navigation.
  - **No prices:** no currency amount (₹, INR, paise) appears anywhere. The page still says "Every plan includes" with no plans, and "SUCCESS STORY" appears 6 times over generic aspiration copy.
  - **The form** is a 19-control "Start a pilot" intake (the report said 18).
    - 11 text inputs and textareas use their placeholder as the only label.
    - The 3 selects have `aria-label` and the 5 checkboxes have labels.
    - The target rollout date is free text, and there is no `autocomplete`.
  - **Typography:** body copy is JetBrains Mono 14 px, and the step cards are 11 px mono.
  - **Mobile:** at 390 px the page is 6,792 px tall, with only the logo and "Email us" in the top bar and no menu.
- **Screenshots:** audit/screenshots/va-public-site/pricing_full_part0.png, audit/screenshots/va-public-site/pricing_full_part1.png, audit/screenshots/va-public-site/pricing_full_part2.png, audit/screenshots/va-public-site/m_pricing_top.png, audit/screenshots/va-verify-public-site/pricing_top.png, audit/screenshots/va-verify-public-site/m_pricing_top.png
- **Recommendation:**
  1. Rebuild /pricing on the shared marketing layout, with the full header, mobile menu, `<main>` and footer.
  2. Lead with rates in plain language (₹/min per surface, prepaid wallet, autopay, any free credit), plus an "Enterprise pilot — Talk to sales" column, a comparison table and an FAQ.
  3. Move the pilot-scoping form to /enterprise, or to a "Request pilot" modal cut to 5–6 fields (name, work email, company, volume, use case, timeline). Give each field a visible label and `autocomplete`.
  4. Route all enquiries to a single sales address on vaanilabs.in.
  5. Remove the "SUCCESS STORY" labels until real case studies exist.

---

### F-QA-013 — Brand identity is fragmented across public and auth pages: 8+ header variants, 7 type families, two primary colours, two default themes and five names
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-06
- **Pages:** all public pages and auth (/, /pricing, /enterprise, /security, /docs, /docs/integrations, /docs/api, /contact, /build.html, /login, /forgot-password, 404)
- **Evidence:** every sub-claim the verifier spot-checked was accurate.
  - **Headers:** at least 8 variants.
    - Only home has the full marketing nav.
    - /enterprise has its own nav (Pilot, Security, API, "Scope pilot").
    - /docs/api has a white 40 px "BACK TO DOCS" strip (body `#F4F6FA`) above a black page, a "VV API" logotype and a blue "GET A KEY" `rgb(47,95,224)`.
    - /build.html has a separate static nav where "Sign in" and "Get started" both go to /login.
    - /contact shows "VAANI LABS" plus a duplicate "VaaniLabs" wordmark.
  - **Type families (7):** Hanken Grotesk, Sora, Syne, JetBrains Mono (body copy on 7 pages), Instrument Serif italic, Bricolage Grotesque and system ui-sans. Home alone loads 20 font files.
  - **Primary colour and theme:**
    - Violet `#7C6BF5` (`rgb(124,107,245)`) on dark marketing pages.
    - Blue `#2F5FE0` on /login, /forgot-password, 404, /docs/api and light home. The token is named `--saffron`.
    - Marketing defaults to dark; auth, 404 and the app default to light. A visitor changes theme and brand hue at the moment they click "Get started".
  - **Names:** Vaani Labs, VaaniLabs, VaaniVoice (/enterprise lead, `X-VaaniVoice-Signature`), VV API, and StarVox Labs (consent text, founder email domain).
- **Screenshots:** audit/screenshots/va-public-site/enterprise_full_part0.png, audit/screenshots/va-public-site/contact_full.png, audit/screenshots/va-public-site/docs_api_top.png, audit/screenshots/va-public-site/build_top.png, audit/screenshots/va-public-site/login_default.png, audit/screenshots/va-public-site/404.png, audit/screenshots/va-verify-public-site/docs_api_top.png
- **Recommendation:**
  1. **One marketing shell.** Build a single `MarketingLayout` (header with the full nav and mobile menu, 1200 px container, 16/24 px gutters, footer) and use it on every public page. Docs may add a left rail inside the same shell.
  2. **One identity:** one brand name ("Vaani Labs"), one logo lockup, and one default theme for marketing and auth.
  3. **One primary hue** in both themes. If violet, use a darker violet for light-mode primary, not blue. Rename the token to `--color-primary`.
  4. **At most 3 type families:** display, text sans, and mono for code and data only.
  5. **Fold /build.html** into the shell as a Next.js route.
  6. **Name the legal entity once** in the footer.
