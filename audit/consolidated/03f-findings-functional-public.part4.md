
### F-QA-026 — The public theme toggle starts out of sync (the first click does nothing), and React hydration error #418 fires on every Next.js page
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-09
- **Pages:** /, /pricing, /enterprise, /security, /docs, /contact, /changelog, /about, /status
- **Evidence:**
  - **Out-of-sync toggle.**
    - On load `html.dark` is set, but the toggle shows a sun icon with `aria-label="Switch to dark mode"`.
    - Click 1: `html` stays `.dark` and only the label flips to "Switch to light mode".
    - Click 2: the page switches to light.
  - **Hydration error.** `pageerror: Minified React error #418` (hydration mismatch) is logged on all nine listed pages.
  - **Mobile.** At 390 px the toggle renders at 0×0 and is not in the menu, so mobile users cannot change the theme.
  - No cookie changes when toggling. The theme is client-only, which is consistent with the SSR/client mismatch.
- **Screenshots:** audit/screenshots/va-public-site/home_top.png, audit/screenshots/va-public-site/home_after_toggle.png
- **Recommendation:**
  - Resolve the theme before hydration with an inline `<head>` script that sets `html.class` from storage or `prefers-color-scheme` (the next-themes pattern), and render the icon from the same source. Use `suppressHydrationWarning` only on `<html>`.
  - Run the dev build and fix every #418 mismatch it names: theme icon, dates, random pills.
  - Add the theme control to the mobile menu.
  - Add a CI check that fails on any console `pageerror` in Playwright smoke tests.

---

### F-QA-027 — Dead anchors and fake affordances on marketing and docs pages
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-10
- **Pages:** / (nav, footer), /build.html, /docs, /blog, /careers
- **Evidence:**
  - **Dead anchors.** Nav "Product" → `/#capabilities`, footer "Features" → `/#features`, footer "Demo" → `/#demo`, and /build.html "How it works" → `/#how`. None of these ids exist; clicking "Product" changes the URL and leaves scrollY at 0.
  - **Cards that look like links but aren't.** On /docs, "Quick Start", "Voice Agents" and "Integrations" look identical to the linked cards (same border and hover) but are not links (`cursor:auto`, no anchor).
  - **Blog.** The five "Read more" elements are plain `<span>`s, so no post can be opened.
  - **Careers.** The footer links to a "Coming Soon" placeholder.
- **Screenshots:** audit/screenshots/va-public-site/home_top.png, audit/screenshots/va-public-site/docs_top.png, audit/screenshots/va-public-site/blog_top.png, audit/screenshots/va-public-site/careers_top.png, audit/screenshots/va-public-site/build_top.png
- **Recommendation:**
  - Add `id="capabilities|features|demo|how"` to the matching sections, or repoint the links to real pages.
  - Make every docs card an `<a>`, or visibly mark it "Coming soon" with no hover lift.
  - Link each blog post to a real page, or hide /blog until posts exist.
  - Remove Careers from the footer until it has content.
  - Add a CI link and anchor checker, for example a Playwright crawl asserting that `document.getElementById(hash)` exists.

---

### F-QA-028 — Buyer-facing Enterprise and billing pages read like internal runbooks and leak implementation details
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-11
- **Pages:** /enterprise, /docs/api/billing
- **Evidence:**
  - **/enterprise copy.**
    - "The matrix separates capabilities… so sales does not over-promise".
    - "Super-admin gate for global operations".
    - "S3 private object storage".
    - "…until automated vaulting is enabled".
    - "…instead of shared demo credentials".
    - "keep security questions attached to the lead record".
  - **/enterprise structure.** Raw paths ("/security", "/docs/integrations") appear as list items. The product is called "VaaniVoice". Three icon-only "Proof package" links (to /security, /pricing and /docs/api) have no accessible name.
  - **/docs/api/billing** uses internal phrasing: "env-tunable per-minute sell rate", "write a row to api_usage", "GPU LLM".
- **Screenshots:** audit/screenshots/va-public-site/enterprise_full_part0.png, audit/screenshots/va-public-site/enterprise_full_part1.png, audit/screenshots/va-public-site/enterprise_full_part2.png, audit/screenshots/va-public-site/docs_api_billing.png
- **Recommendation:**
  - Rewrite /enterprise for the buyer: outcomes, pilot process, deliverables, timeline and security posture (linking to /security). Move internal checklists to the sales playbook.
  - Replace raw paths with descriptive link text.
  - Give the icon links `aria-label`s, or add visible text.
  - Rewrite the billing docs as "Rates are per minute, rounded up; usage appears in your dashboard".

---

### F-QA-029 — Trust surfaces are stale, appear static, and over-disclose internals
- **Severity:** medium · **Confidence:** single-agent (the in-app status widget has the same "always healthy" problem, reported as QA-A-02 elsewhere)
- **Source findings:** PUBLIC-SITE-12
- **Pages:** /changelog, /status, footer (all pages), /security
- **Evidence:**
  - **Changelog.** The latest entry is v2.0.4 on Feb 15, 2026, 7 months stale, although Meeting Agent, Personal Agents, Knowledge and Rep Console have shipped since. It publishes security-relevant internals: "Fixed RLS policy recursion issue on profiles table", "Fixed calls RLS for service role access", "Resolved campaign read permissions for call engine".
  - **/status.**
    - "Last checked" equals the visitor's own clock at load.
    - All 8 services show fixed round uptimes (99.99%, 99.95%…).
    - The last incident is Feb 12, 2026.
    - Service names expose vendors ("Telephony (Twilio)", "Authentication (Supabase)").
    - The page is inferred to be static.
  - **Footer.** A green "All Systems Operational" appears on every page.
  - **/security** names the table `rate_limit_buckets` and says the "application server holds an anon key".
- **Screenshots:** audit/screenshots/va-public-site/changelog_top.png, audit/screenshots/va-public-site/status_full.png, audit/screenshots/va-public-site/security_part0.png
- **Recommendation:**
  - Back /status with real monitoring (a hosted status page fed by health checks), or remove it. Have the footer fetch its state from the same source, or drop the footer badge.
  - Keep the changelog current and customer-facing ("Improved access controls"), with no table or policy names.
  - Trim internal identifiers from /security. Keep the controls and remove the implementation names.

---

### F-QA-030 — Login validation is inconsistent and inaccessible, and sign-up hides key expectations
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-14
- **Pages:** /login (sign-in and sign-up modes)
- **Evidence:**
  - **Sign In** relies only on native browser bubbles ("Please fill in this field", "Please include an '@'"). The border stays focus-blue `#2F5FE0` with no invalid styling, and there is no `aria-live`.
  - **Sign in with Magic Link:**
    - it is a direct-send button, not a mode switch;
    - with an empty email it shows a custom red banner "Please enter a valid email" below the password field;
    - the banner is not linked to the email field and is not `role=alert`;
    - it shifts the layout by about 29 px.
    - So there are two validation patterns on one form.
  - **Sign-up mode:**
    - it requires "PHONE (WITH COUNTRY CODE)" with no reason given;
    - it shows no password rules and has no `minlength`;
    - there is no Terms/Privacy acknowledgement;
    - it gives no approval expectations, although the copy says "admin approval required".
  - No auth screen links to Privacy or Terms.
- **Screenshots:** audit/screenshots/va-public-site/login_invalid_email.png, audit/screenshots/va-public-site/login_magic_link.png, audit/screenshots/va-public-site/login_signup_toggle.png, audit/screenshots/va-public-site/login_empty_submit.png
- **Recommendation:**
  - Use one inline error pattern: red border, a message under the field linked with `aria-describedby`, and `aria-invalid`, plus an `aria-live="polite"` summary. Use `noValidate` and custom messages.
  - Make Magic Link a mode ("Email me a sign-in link instead") that hides the password field.
  - In sign-up:
    - explain the phone requirement ("for OTP and test calls");
    - show password rules live;
    - add "By creating an account you agree to the Terms and Privacy Policy" with links;
    - state "We review requests within N hours" on the form and on the confirmation screen.

---

### F-QA-031 — Visible rendering bugs and copy typos on public and auth pages
- **Severity:** medium · **Confidence:** single-agent (EXPLORE-SETTINGS-20 found the same icon-overlap bug on Change Email in the app)
- **Source findings:** PUBLIC-SITE-15
- **Pages:** /forgot-password, /security, /docs/api, /docs/integrations, /contact, /
- **Evidence:**
  - **Icon overlap.** On /forgot-password the envelope icon (x 545–559) overlaps the input text, which starts at x 547 (`padding-left:14px`).
  - **Typos:** "Vaani Labsaccount" (/forgot-password), "ap-south-1 forcall recordings" (/security, a missing space next to `<code>`), "4paise / sec" (/docs/api), and H2 "§What you get, in one paragraph." (/docs/integrations).
  - **Duplicate wordmark.** The /contact header shows the logo lockup and a second "VaaniLabs" wordmark.
  - **Overlapping unit.** In the home analytics mock, the "m" in "3m41s" collides with the digits.
- **Screenshots:** audit/screenshots/va-public-site/forgot_password.png, audit/screenshots/va-public-site/security_part0.png, audit/screenshots/va-public-site/contact_full.png, audit/screenshots/va-public-site/docs_integrations_top.png, audit/screenshots/va-verify-public-site/contact_top.png
- **Recommendation:**
  - Give the shared input-with-leading-icon component `padding-left: 40px` (icon 16 px, inset 12 px). It is used on /forgot-password and Change Email.
  - Wrap inline `<code>` with explicit spaces.
  - Keep one logo lockup.
  - Use `font-variant-numeric: tabular-nums` and a thin space for units.
  - Run a copy QA pass with a spell and spacing linter (e.g. `cspell` plus a regex for `[a-z][A-Z]` joins).

---

### F-QA-032 — Home hero LCP is delayed by an entrance animation and a heavy font payload
- **Severity:** medium · **Confidence:** single-agent (lab numbers from a shared, contended browser)
- **Source findings:** PUBLIC-SITE-17
- **Pages:** /
- **Evidence:**
  - **Warm load:**
    - TTFB 455 ms, FCP 2,184 ms, load 2,233 ms, LCP **3,416 ms**.
    - The LCP element is the hero gradient `<span>` in `h1.vlp-display.vlp-rise.vlp-d2`, which has a delayed entrance animation.
  - **Cold load:** FCP 3,392 ms, DCL 7,572 ms, LCP 9,976 ms.
  - **Payload:** 61 requests, about 1.0 MB, 16 JS chunks and **20 font files** (the largest woff2 is 125 KB).
  - **Layout shift:** CLS 0.175 after a scroll-through ("needs improvement").
  - **Other pages:** /pricing and /enterprise FCP 2.6–3.6 s; /login FCP 1.3 s.
- **Screenshots:** audit/screenshots/va-public-site/home_top.png
- **Recommendation:**
  - Render the H1 fully visible at first paint. Animate only `transform`, or `opacity` from about 0.9, with no delay, so it counts as an LCP candidate immediately.
  - `preload` the single display font and subset to Latin plus Devanagari.
  - Cut families from 7 to 3 and weights to at most 4 (see F-QA-013).
  - Reserve space for the rotating language pill and animated demos to bring CLS below 0.1.
  - Add field Core Web Vitals (`web-vitals` into PostHog) with a budget of LCP at 2.5 s or less and CLS at 0.1 or less.

---

### F-QA-033 — A 365-day analytics cookie is set before any consent, although the policy calls it optional
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-19
- **Pages:** all public pages (policy at /cookies)
- **Evidence:**
  - On the very first page view, with no interaction, the PostHog cookie `ph_phc_…_posthog` is set on `.vaanilabs.in` with a 365-day expiry.
  - There is no consent banner or opt-out control on any page.
  - /cookies describes "one optional analytics tag that respects Do-Not-Track".
  - The CSP also blocks Cloudflare's `email-decode.min.js` on every page, and the Insights beacon on /build.html, which produces console errors.
- **Screenshots:** —
- **Recommendation:**
  - Start PostHog with `persistence: 'memory'` (cookieless) and `opt_out_capturing_by_default`, and honour `navigator.doNotTrack`.
  - Add a lightweight consent control (Accept / Decline / policy link) that switches to cookie persistence only on Accept. This aligns with DPDP and GDPR.
  - Disable Cloudflare email obfuscation, or allow its script in the CSP.

---

### F-QA-034 — Home social proof is unverifiable, and "Talk to the agent" over-promises
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-20
- **Pages:** /
- **Evidence:**
  - **Testimonials.** The three testimonials use a first name plus initial, an initials avatar and a city, with no company, logo, photo or link. There are no customer logos anywhere on the site.
  - **"Talk to the agent".**
    - The hero button "▷ Talk to the agent" only scrolls to the pre-recorded "Hear it work" playback.
    - The final CTA says "Talk to it live right here", but there is no live widget on the page.
    - The real live demo is /build.html, which is labelled only "Build your own".
- **Screenshots:** audit/screenshots/va-public-site/home_talk_to_agent.png, audit/screenshots/va-public-site/home_full_part2.png
- **Recommendation:**
  - Replace the testimonials with permissioned proof: a logo strip, named quotes with photo and company, and one short case study with numbers. Otherwise remove them.
  - Rename the hero secondary CTA "▷ Hear a real call", or embed the live browser agent.
  - Promote /build.html as "Try it live" in the nav and hero.

---

### F-QA-035 — Contact channels are split across three email domains and two sales-booking paths
- **Severity:** medium · **Confidence:** single-agent (PUBLIC-SITE-05 and -06 corroborate the domain spread)
- **Source findings:** PUBLIC-SITE-21
- **Pages:** /contact, /pricing, footer, /build.html
- **Evidence:**
  - **Email domains in use:**
    - general and security contacts on vaanilabs.in;
    - founder addresses on starvoxlabs.io (/contact);
    - the pricing "Email us" and in-form contact on advisio.in.
  - **Two sales destinations.** Footer "Talk to Sales ↗" opens an external booking site, while home "Talk to sales" opens /contact.
  - **Legal entity.** The /build.html consent text names "VaaniLabs (StarVox Labs)", and nothing on the site explains that relationship.
- **Screenshots:** audit/screenshots/va-public-site/contact_full.png, audit/screenshots/va-public-site/pricing_full_part0.png, audit/screenshots/va-public-site/build_lower.png
- **Recommendation:**
  - Route all sales contact through one address on vaanilabs.in and one booking link, used by every "Talk to sales" CTA.
  - Move founder addresses to the brand domain.
  - State the legal entity once in the footer ("Vaani Labs is a product of StarVox Labs Pvt. Ltd."), if that is accurate.
