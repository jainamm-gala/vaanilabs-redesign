
### F-UX-041 — Profile mixes personal, org, agent-content and integration settings, and Notifications points to a WhatsApp field that doesn't exist
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-SETTINGS-18, UX-AUDIT-20
- **Pages:** /settings (Profile), /settings/notifications
- **Evidence:**
  - "Profile Settings — Update your personal information" holds four kinds of settings, all under a header "Save Changes" button that saves only name and phone (F-UX-012):
    - personal: Full Name and Phone
    - org-level: the team subdomain, which has its own Edit
    - agent content: the WhatsApp brochure, with a native file input and Upload
    - integrations: Google and Microsoft Connect
  - Integrations are split four ways:
    - Profile (Google, Microsoft)
    - Settings › Calendly
    - Settings › Integrations (Meta ×3, HubSpot, Salesforce)
    - the developer pages

    Calendly and Integrations use the same plug icon.
  - Notifications locks its WhatsApp card: "No number on file … Add a WhatsApp number first → back to settings". Profile has only a generic Phone field, and no WhatsApp number field exists anywhere.
  - Phone numbers live in three places: the Profile phone, Calling number, and the missing WhatsApp number (see F-UX-015).
- **Screenshots:** va-explore-settings/c1_settings_profile_full.png, va-explore-settings/c2_profile_scroll2.png, va-explore-settings/c4_notifications.png, va-explore-settings/c21_mobile_notifications.png
- **Recommendation:**
  - Move Subdomain to Organization › General and the brochure to Knowledge (or Agent › Assets). Put Google, Microsoft and Calendly on one Integrations page.
  - Add a "WhatsApp number" field to Profile, validated as E.164, or a "Use my phone number for WhatsApp" toggle. Deep-link the Notifications prompt to it (`/settings/profile#whatsapp`) and focus the field.

### F-UX-042 — The Activity & Audit ledger is empty for an active account
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** QA-B-18
- **Pages:** /settings/activity
- **Evidence:**
  - The page promises "Every security-relevant event on your account… append-only ledger · 365D retention". On both the All and Auth filters it shows "Nothing in this slice yet."
  - `/api/account/audit-log?limit=50` returns `rows: []`, and so does `action_bucket=auth`.
  - The account has existed since 11 Aug, signed in on 26 Sept, has 5 knowledge uploads and many flows, and requested a data export on 21 Sept.
  - "Suspicious activity?" (red outline) links to `/settings`, which opens Profile.
  - Explore-settings reported the empty ledger independently. That events are not being recorded is inferred, not observed.
- **Screenshots:** va-qa-b/settings-activity.png, va-qa-b/settings-activity-daterange.png, va-explore-settings/c7_activity.png
- **Recommendation:**
  - Verify that events are emitted for sign-in, export, uploads, flow edits and activation, API keys and settings changes. Backfill the ones that already exist, such as the 21 Sep export.
  - If collection started recently, say so ("Recording since 20 Sep 2026"). Show the date range currently applied.
  - Point "Suspicious activity?" to Security (sessions, sign out everywhere, reset password) or to a support form.

### F-UX-043 — The copy voice is inconsistent: the brand is spelled 4+ ways, Analytics uses poetic editorial kickers, and em-dashes act as separators
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-SETTINGS-12, DESIGN-RESEARCH-06, DESIGN-RESEARCH-11
- **Pages:** /settings (Docs), /api-keys/embed, /webhooks, /analytics, global banner, /assistant, /meeting-agent
- **Evidence:**
  - The brand appears in several forms:
    - "Vaani Labs" on most pages
    - "Vani Voice" in Docs ("Guides and API references for Vani Voice", "Add a Vani Voice widget")
    - "VaaniVoice" in the `X-VaaniVoice-Signature` header, the `VaaniVoice.textvoice()` global and the `example.com/vaanivoice/webhook` placeholder
    - "VAANI / LABS" in the logo
    - the `vv_live_` key prefix
  - Analytics numbers its sections "§ 01" to "§ 08" and gives them serif-italic kickers: "the dispatch from your line", "— who is on the line", "— this past week, in numerals", "— where they hang up", "— hear the line itself". The DID status "not allocated yet" is also set in serif italic. Ux-audit and explore-data flagged the same register.
  - Em-dashes are used as separators: "Wallet empty — top up now…", "Describe what you need — I plan, then act on your data.", "Meeting Agent — Vikash", "— who is on the line".
  - The visual side of the Analytics styling is covered in F-VIS-010.
- **Screenshots:** va-explore-settings/c3_docs.png, va-explore-settings/c8_embed.png, va-explore-settings/c10_webhooks.png, va-explore-data/analytics_top.png, scout_analytics.png, scout_assistant.png
- **Recommendation:**
  - Pick one product name and one developer namespace, e.g. brand "Vaani Labs" and SDK/header prefix "Vaani". Update all UI copy, and document the legacy header and global names as aliases.
  - Write a short UI copy guide:
    - Use sentence case.
    - Use plain, functional headings ("Overview", "Call volume", "Sentiment", "Intents").
    - Drop section numerals and poetic kickers.
    - Use colons or full stops instead of em-dashes, e.g. "Wallet empty. Top up to keep calls running." and "Meeting agent: Vikash".
  - Add a lint over the string files that flags banned terms and alternate brand spellings.

### F-UX-044 — "Security" offers only two-factor authentication: no password, sessions or devices, and no sign-out everywhere
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** EXPLORE-SETTINGS-14
- **Pages:** /settings/security
- **Evidence:**
  - The H1 reads "Two-factor authentication", not "Security". The page holds one card: "DISABLED — Add a second factor", with an Enable button and a note that TOTP is supported but WebAuthn and SMS are not.
  - Nowhere in Settings can a user change or set a password, see active sessions or devices, sign out other sessions, review recent sign-ins or check SSO status. Change Email, Activity and Delete are separate items.
  - The page has three back links, and the whole page scrolls even though its content is short.
- **Screenshots:** va-explore-settings/c7_security.png, va-qa-b/settings-security.png
- **Recommendation:**
  - Make Security a hub with five sections:
    - Password: change or set, including for OAuth users
    - Two-factor
    - Active sessions and devices: revoke, and "Sign out of all other sessions"
    - Recent sign-ins: link to Activity, pre-filtered
    - Email & login: absorbs Change Email
  - Make the H1 match the nav label ("Security").

### F-UX-045 — PostHog session replay and autocapture load on pages that show lead personal data
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** EXPLORE-CORE-24
- **Pages:** /dashboard, /leads, /call-reports (and every other authenticated page)
- **Evidence:**
  - `posthog-recorder.js` (session replay), `dead-clicks-autocapture.js`, `web-vitals.js` and `/flags` load on the Cockpit, Leads and Call Reports. Those pages show lead names, phone numbers (partly masked) and call transcripts.
  - The audit guard blocked PostHog, so nobody checked what replay actually records or whether it masks these fields.
  - The public-site agent found that the marketing site sets a 365-day PostHog cookie on the first page view, with no consent control.
- **Screenshots:** —
- **Recommendation:**
  - Either disable replay on routes that show lead or call content, or mask inputs and text in those containers (`ph-no-capture`, `maskAllInputs`, `maskTextSelector`). Confirm the masking with a recorded test session.
  - List PostHog as a sub-processor in the privacy policy and DPA, and offer an org-level analytics opt-out.
  - Load non-essential analytics cookies only after consent (DPDP/GDPR).

### F-UX-046 — Call Reports filter, sort and empty-state details: no "Mixed" chip, wrong empty-state copy, blanks sorted first, duplicate headers
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-24, QA-B-25
- **Pages:** /call-reports
- **Evidence:**
  - The sentiment chips are All / Positive / Negative / Neutral. There is no "Mixed" chip, although Analytics tracks mixed and 3 of the 50 loaded calls are mixed. Another 7 have no sentiment at all.
  - A search with no matches shows "No call records match the current search or filters. Calls appear here once your agents start dialing." The second sentence is meant for an empty account, not one with 121 calls.
  - Sorting by Duration ascending lists rows with no duration ("—") first. Headers can be clicked to sort but have no `aria-sort`. Four columns are all headed "Condition Check", with nothing to tell them apart.
  - Every row repeats its own Re-analyze and Download CSV buttons.
  - That the header count and KPIs ignore filters is covered in F-UX-031.
- **Screenshots:** va-explore-data/r2_callreports_search_empty.png, va-explore-data/r2_callreports_negative_sorted.png, va-qa-b/callreports-search-empty.png, va-qa-b/callreports-combo.png, va-verify-qa-b/callreports-sort-asc.png
- **Recommendation:**
  - Add "Mixed" and "Unscored" chips so the categories match Analytics.
  - Use separate copy for no matches ("No calls match 'x'. Clear filters") and for no data at all.
  - Sort blanks last, add `aria-sort`, and label flow-field columns by node, e.g. "Condition Check · step 3".
  - Move each row's Re-analyze and Download into a row "…" menu.

### F-UX-047 — Data Export has two equal primary buttons and contradictory rate-limit copy
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** EXPLORE-SETTINGS-24
- **Pages:** /settings/data-export
- **Evidence:**
  - A full-width blue "Download (.zip)" button sits next to a blue "Request a new export" button. The download is a signed link that expires in 1 h.
  - The copy says both "One export per 24 hours per account" and "Re-request anytime — the same archive will be re-signed".
  - The rest of the page is strong: it lists what the archive contains and excludes, and shows the last export's status, size and timestamps.
- **Screenshots:** va-explore-settings/c12_data_export.png, va-qa-b/settings-data-export.png
- **Recommendation:**
  - Keep Download as the only primary button. Make "Request new export" secondary, and while it is rate-limited disable it with "Available again in 3 h".
  - Reword the second line: "Link expired? Refresh to get a new download link."

### F-UX-048 — Phone layouts keep desktop-only hints and copy, and Analytics truncates names and drops columns
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-B-22, RESPONSIVE-B-23
- **Pages:** /leads, Leads Import modal, /analytics, / (marketing)
- **Evidence:**
  - On touch screens (`pointer: coarse`), Leads still shows its keyboard-shortcut legend (`/`, J/K, X, A, C, Esc), which takes 45–70 px of height.
  - The Import modal says "Drop or click to choose" on touch screens.
  - On the marketing site, the demo transcript is a 262 px scroll area nested inside the page, and the mobile menu has no theme toggle.
  - Analytics:
    - at 390 px width, flow step names are cut to about 9 characters (clientWidth 92 vs scrollWidth 184)
    - at 768, intent names are truncated ("Appointment …")
    - at 390, the Recent calls list drops the Started, Duration, End and Sentiment columns entirely
- **Screenshots:** va-responsive-b/leads_390.png, va-responsive-b/leads_390_import_modal.png, va-responsive-b/analytics_390_s2.png, va-responsive-b/analytics_390_s4.png, va-responsive-b/analytics_768_s2.png
- **Recommendation:**
  - Show shortcut hints only under `@media (hover: hover) and (pointer: fine)`, and say "Tap to choose a file" on touch screens.
  - On Analytics, let names wrap to 2 lines and move the metrics to a second line. Show Recent calls as cards: time and duration on the first line, then status and sentiment chips.
  - On phones, remove the nested transcript scroller and add the theme toggle to the mobile menu.

---

### Refuted / not reproduced

The verifier refuted none of the findings in this section. The table lists sub-claims inside verified or partially-verified findings that the verifier refuted, could not reproduce, found overstated, or could not test. Each consolidated finding above uses the verifier's corrected version.

| Source finding | Original claim | Verifier's note | Handled in |
|---|---|---|---|
| RESPONSIVE-A-01, RESPONSIVE-B-01 | Settings cannot be reached on phones | Refuted. The wallet banner's "Top up" and "Enable autopay" links (to /settings#wallet and /settings#autopay) open Settings with the full sub-nav at 390 px. This works only while the wallet is empty and the banner has not been dismissed. The other 5 sections really are unreachable. Downgraded from critical to high. | F-UX-008 |
| RESPONSIVE-B-03, RESPONSIVE-A-06, VISUAL-AUDIT-05 | The icon-only nav has "no working labels" and no visible tooltips | Overstated. All 12 links have a `title`, so the browser's native tooltip appears (headless screenshots don't capture it) and each link has an accessible name. Only the custom styled tooltip is fully clipped. | F-UX-007, F-UX-017 |
| UX-AUDIT-08 | Billing shows "Auto top-up amount ₹0.00" while loading | Not reproduced: the field was absent at 0.5 s and read ₹500.00 at 1.0 s. Whether Pay validates the amount on click was not tested, because clicking Pay was not allowed. | F-UX-021, F-UX-030 |
| UX-AUDIT-04 | Call actions have no pre-flight check at all | Only half confirmed. Nothing warns before the click. Whether a confirmation or balance check appears after the click is unverified, because no call button was clicked. | F-UX-013 |
| UX-AUDIT-14, EXPLORE-DATA-18 | The Knowledge search error appears off-screen | Overstated. At 1440×900 the message (y≈370) and the input (y≈888) are both on screen. The real problem is that the message appears in the wrong card. | F-UX-019 |
| A11Y-MANUAL-10 | 2 PUTs per load, plus a PUT on unload | 1 PUT per load across 3 loads, and no PUT on unload. It may be designed draft autosave, and the WCAG 3.3.4 framing is speculative. Downgraded to medium. | F-UX-024 |
| QA-A-05 | One chip click activates a live flow without confirmation | The chip sends immediately; confirmed. Whether the server activates the flow without a confirmation turn can't be verified without sending. | F-UX-022 |
| QA-A-07 | Offline, the app shows raw "Failed to fetch" text and SPA navigation falls through to Chrome's error page | Not re-tested (not refuted). The other failure cases were confirmed. | F-UX-019 |
| QA-B-08 | It is unverified what the Copy button copies | The verifier confirmed Copy writes the clean snippet, so only the display is broken. Downgraded from high to medium. | F-UX-020 |
