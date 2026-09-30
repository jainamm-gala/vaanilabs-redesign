
### F-QA-014 — Call Reports KPI cards mix the server total with aggregates of 50 rows, and disagree with Analytics
- **Severity:** medium (reported as high; the verifier lowered it because it shares F-QA-005's root cause) · **Confidence:** verified
- **Source findings:** QA-B-03
- **Pages:** /call-reports, /analytics
- **Evidence:**
  - **Call Reports cards.** "Total Calls 121" is the server total. "Avg Duration 90s", "Negative 10" and "Positive 4" are computed from the 50 loaded rows only (recomputed average 90.38 s).
  - **Recomputed over all 121 calls** (`?limit=200`):
    - average 78.26 s, negative 15, positive 4, total 9,469 s;
    - these match Analytics' AVG DURATION "1m 18s" and TOTAL MINUTES 158.
  - So the Call Reports "Negative" figure (10 vs 15) and "Avg Duration" are wrong for the stated 121-call scope.
  - **Analytics labelling.** Analytics shows "TOTAL CALLS 121" (all time) under the header "Headline — this past week, in numerals".
  - Both pages also count duplicate legs (F-QA-006).
- **Screenshots:** audit/screenshots/va-verify-qa-b/analytics-headline.png, audit/screenshots/va-verify-qa-b/callreports-top.png, audit/screenshots/va-qa-b/callreports-1.png, audit/screenshots/va-qa-b/analytics-full.png
- **Recommendation:**
  - Serve KPIs from one server aggregate endpoint, for example `/api/calls/stats?from=&to=`, used by both pages, with shared metric definitions.
  - Print the window on every card ("All time", "Last 7 days").
  - Retitle the Analytics headline, or make its numbers actually weekly.
  - When a filter is active, label the cards "in this view".

---

### F-QA-015 — The Leads "N total" count and KPI strip describe the current page, not the pipeline
- **Severity:** medium (reported as high; the verifier lowered it) · **Confidence:** verified
- **Source findings:** QA-B-05
- **Pages:** /leads
- **Evidence:**
  - At 20 per page, page 2 shows "4 SHOWN · 4 TOTAL" and OPEN PIPELINE 4 / NEW 4 (100%).
  - On the same screen the footer reads "Page 2 of 2 · 21–24 of 24 leads", and `/api/leads?limit=20&offset=20` returns `total: 24`.
  - Page 1 at size 20 shows 20 in the KPI strip, not 24.
  - So "TOTAL" and the KPIs are scoped to the page and contradict the footer.
  - Zeros under a status filter (e.g. Converted) are arguably correct for that filter. The page-2 case is the real bug.
- **Screenshots:** audit/screenshots/va-verify-qa-b/leads-page2-size20.png, audit/screenshots/va-verify-qa-b/leads-filter-converted.png, audit/screenshots/va-qa-b/leads-page2-size20.png
- **Recommendation:**
  - Use the API `total` in the header ("4 shown of 24").
  - Compute Open pipeline / New / Interested+ / Avg interest from an org-level aggregate (`/api/leads/stats`) that respects filters but not pagination.
  - When a filter is active, label the tiles "in this filter".

---

### F-QA-016 — Leads URL state is write-only: deep links reset, filters are lost on reload, and Back skips pagination
- **Severity:** medium (reported as high; the verifier lowered it because there is no data impact) · **Confidence:** verified
- **Source findings:** QA-B-06
- **Pages:** /leads
- **Evidence:**
  - Navigating to `/leads?page=2&size=20` produced the frame log `…page=2&size=20 → …page=1&size=50`, fetched `limit=50&offset=0`, showed "Page 1 of 1", and reset the size select to 50.
  - Clicking the CONTACTED chip fetched `?status=contacted`, but the URL stayed `?page=1&size=50`. Search and status are never written to the URL, so a reload loses "Converted".
  - Page and size changes use `replaceState`: `history.length` stayed at 8 across a size change and Next. Back from page 2 went straight to the previous route (/billing).
- **Screenshots:** audit/screenshots/va-qa-b/leads-deeplink-p2s20.png, audit/screenshots/va-qa-b/leads-deeplink-p2s50.png, audit/screenshots/va-qa-b/leads-filter-converted.png
- **Recommendation:**
  - Make the URL the source of truth: on mount, parse `page`, `size`, `q`, `status`, `source`, `lang` and `outcome`, and derive the fetch from them.
  - Clamp out-of-range pages with a visible note ("Page 5 doesn't exist — showing page 2").
  - Use `pushState` (`router.push`) for page and filter changes, and `replaceState` only for keystroke-level search debouncing.
  - Apply the same pattern to Call Reports (F-QA-005) and the Analytics range toggle.

---

### F-QA-017 — 3 of 5 Settings › Docs links are 404s and land on an off-shell "SIGNAL LOST / STATUS: DISCONNECTED" page
- **Severity:** medium (reported as high by both agents; the verifier lowered it because equivalent content exists elsewhere) · **Confidence:** verified
- **Source findings:** QA-B-07, EXPLORE-SETTINGS-03
- **Pages:** /settings (Docs tab) → /docs/embed, /docs/webhooks, /docs/flows
- **Evidence:**
  - Status codes: `/docs/api` 200, `/docs/integrations` 200, `/docs/embed` 404, `/docs/webhooks` 404, `/docs/flows` 404.
  - The 404s show up three ways: Next prefetch (3 console errors on every /settings load), `fetch`, and direct navigation.
  - The 404 page has no app rail. It uses light sci-fi copy ("404 SIGNAL LOST", "STATUS: DISCONNECTED"), which suggests an outage.
  - The tab copy calls the product "Vani Voice", a fourth spelling.
  - Equivalent content exists at `/api-keys/embed` and `/webhooks`.
- **Screenshots:** audit/screenshots/va-verify-qa-b/settings-docs.png, audit/screenshots/va-verify-qa-b/docs-flows-404.png, audit/screenshots/va-explore-settings/c14_docs_embed_404.png, audit/screenshots/va-explore-settings/c3_docs.png
- **Recommendation:**
  - Repoint the links: "Embed Guide" → `/api-keys/embed`, "Webhook Events" → `/webhooks` (or a `/docs/api#webhooks` section), and "Flow Builder Guide" → a real page, or remove it.
  - Add 308 redirects for the three dead paths.
  - Render authenticated 404s inside the app shell with plain copy and links to Dashboard, Settings and Docs.
  - Add a CI link checker (e.g. `lychee` or a Playwright crawl) over in-app and docs links.
  - Fix the "Vani Voice" spelling.

---

### F-QA-018 — "Review proposals" is shown to a member and silently redirects to the Agent Cockpit
- **Severity:** medium (EXPLORE-DATA-02 rated it high; QA-B-09 rated it medium after finding the 403 cause; consolidated to medium because this is permission gating reported badly, not a broken feature) · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-02 (QA-B-09 reports the same issue)
- **Pages:** /knowledge → /knowledge/proposals → /dashboard
- **Evidence:**
  - The /knowledge header link `href="/knowledge/proposals"` produces the navigation log `/knowledge/proposals → /dashboard`, on both click and direct load.
  - There is no toast and no explanation.
  - `/api/knowledge/proposals` returns 403 "Organization admin access required", and the account's role is "member".
  - The user lands on "AGENT COCKPIT", which has live CONNECT and Test Call controls.
- **Screenshots:** audit/screenshots/va-explore-data/r2_knowledge_proposals_click.png, audit/screenshots/va-qa-b/knowledge-proposals-click.png, audit/screenshots/va-qa-b/knowledge-proposals.png
- **Recommendation:**
  - Hide the entry for non-admins, or render it disabled with an "Admins only" tooltip.
  - On gated routes, render an in-shell 403 page ("You need organization admin access to review proposals — ask an admin") instead of redirecting to a page with live-call controls.
  - For admins, show a count badge ("3 proposals").

---

### F-QA-019 — Analytics §04 Flow drop-off bars render with no fill, and step names are ambiguous
- **Severity:** medium (EXPLORE-DATA-05 rated it high; consolidated to medium because the reached and drop % figures are still shown as text) · **Confidence:** single-agent (QA-B and responsive-b corroborate the naming problem)
- **Source findings:** EXPLORE-DATA-05
- **Pages:** /analytics §04 Flow
- **Evidence:**
  - Each step row has a single 1105×8 px bar track with `background: transparent` and no fill child, including the step "9 reached · 88.9% drop".
  - The legend "colour warms with drop-off — peacock to red" describes colours that never appear.
  - Six of seven steps are named "Condition Check" (×3) or "Knowledge Lookup" (×3), each "1 reached · 0.0% drop".
  - The section always shows "38 CALLS ANALYSED". The 7D/30D/90D control does not change it.
  - At 390 px the step names truncate to about 9 characters ("Condition…").
- **Screenshots:** audit/screenshots/va-explore-data/analytics_flow_bar_zoom.png, audit/screenshots/va-explore-data/analytics_flow_step_click.png, audit/screenshots/va-qa-b/analytics-flowstep-click.png
- **Recommendation:**
  - Render a real funnel: fill width = `reached / calls_entering_flow`, with a dropped segment coloured on the documented scale. Make sure the fill element is emitted when the value is greater than 0.
  - Label each step with node label plus step number ("03 · Condition Check — budget?"), and link it to that node in Flow Builder.
  - Scope the section to the page's date range, or say "All time".

---

### F-QA-020 — Test Call validates the number only after the click and reports the error in the Transcript Feed; Save Context always says "Context Saved"
- **Severity:** medium · **Confidence:** multi-agent (UX-audit saw Test Call enabled for "abc" and "12345")
- **Source findings:** QA-A-08
- **Pages:** /dashboard (Agent Cockpit)
- **Evidence:**
  - Test Call becomes enabled for "123", "abc", "not-a-number" and "+91 00000". The phone field is `type=tel` with maxLength 20, no pattern and no label; `validity.valid=true`, and there is no `aria-invalid` or inline message.
  - From the bundle: the 8–15 digit check runs only on click, and its error ("Enter a valid phone number (8-15 digits)…") is written into the Transcript Feed about 450 px to the right.
  - The client does no wallet or caller-ID check, although the wallet is ₹0 and the DID is "PENDING".
  - From the bundle: Save Context runs `save?.(); setSaved(true); setTimeout(...,2000)` without awaiting, so "Context Saved" shows for 2 s whether or not the save succeeded. This is the same false-success pattern as F-QA-002.
- **Screenshots:** audit/screenshots/va-qa-a/dash_phone_123_testcall_enabled.png, audit/screenshots/va-ux-audit/11_cockpit_tel_12345.png
- **Recommendation:**
  - Validate inline as the user types (E.164 with a visible +91 default, via `libphonenumber-js`), and keep Test Call disabled until the number is valid.
  - Put the error under the field with `aria-describedby`.
  - Pre-flight before dialling: if wallet = 0 or the caller-ID is unverified, disable the button with a reason and a link to /billing or Calling number.
  - Make Save Context async: `Saving… → Saved` on 2xx, or `Couldn't save — Retry` on error.

---

### F-QA-021 — Client-side validation is missing or inconsistent across forms (phone, URL, email, top-up amount)
- **Severity:** medium · **Confidence:** multi-agent (QA-B, explore-data, UX-audit, explore-settings)
- **Source findings:** QA-B-14
- **Pages:** /leads (New Lead), /settings (Profile), /settings/calling-number, /settings/change-email, /knowledge (Website URL tab), /billing, /webhooks
- **Evidence:** nothing was submitted.
  - **New Lead:** the phone field accepts "abx" (`validity.valid=true`). Only email gets the native "Please include an '@'" bubble. There are no inline errors and no `aria-invalid`.
  - **Profile:** the phone field accepts "abx", and "Save Changes" is always enabled.
  - **Calling number:** "Send code" (which sends an SMS) enables for "abx", "12" and "+91 00000 00000".
  - **Change Email:** "Send confirmation links" is enabled with "not-an-email" (`validity` false).
  - **Knowledge › Website URL:** "Fetch & Embed" is enabled with "not-a-url" (`validity` false).
  - **Webhooks:** "Create webhook" is enabled with "not-a-url".
  - **Billing top-up:**
    - 0 and −50 are silently rewritten to 1.
    - 99,999,999 and 999,999,999 are accepted.
    - 10.555 is invalid for `step=1`, but "Pay with UPI" stays enabled.
    - There is no min/max hint.
    - The auto top-up field also clamps 0 to 1.
- **Screenshots:** audit/screenshots/va-qa-b/leads-newlead-fake.png, audit/screenshots/va-qa-b/settings-calling-number-fake.png, audit/screenshots/va-qa-b/settings-change-email-fake.png, audit/screenshots/va-qa-b/knowledge-url-tab.png, audit/screenshots/va-qa-b/billing-topup-invalid.png, audit/screenshots/va-ux-audit/22_billing_topup_9999999.png, audit/screenshots/va-explore-data/r2_billing_topup_validation.png, audit/screenshots/va-explore-settings/c11_webhook_invalid.png
- **Recommendation:**
  - Build one shared form layer (zod schemas plus react-hook-form) with:
    - E.164 phone;
    - `new URL()` for URLs;
    - an RFC-lite email check;
    - integer INR amounts with explicit bounds, e.g. ₹100–₹1,00,000, shown as a hint.
  - Show inline errors under fields with `aria-invalid` and `aria-describedby`.
  - Disable primary actions until the form is valid and dirty.
  - Never silently rewrite user input.
  - Show the amount on the CTA ("Pay ₹500 via UPI").

---

### F-QA-022 — Import CSV accepts any file with no type check, column check or preview
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** QA-B-15
- **Pages:** /leads (Import CSV dialog)
- **Evidence:**
  - Selecting `notes.txt` shows the file name and enables "Verify & import". Reproduced twice.
  - A CSV without a `phone` column behaves the same way, although the dialog says "PHONE COLUMN REQUIRED".
  - No parse, preview or column mapping happens client-side.
  - The helper copy exposes internals: "Extras you add are folded into metadata.extra."
- **Screenshots:** audit/screenshots/va-qa-b/leads-importcsv-open.png, audit/screenshots/va-qa-b/leads-import-txt.png, audit/screenshots/va-qa-b/leads-import-nophone.png, audit/screenshots/va-qa-b/leads-import-txt-repro.png
- **Recommendation:**
  - Set `accept=".csv,text/csv"` and check extension and MIME type on selection and on drop.
  - Parse the first 20 rows client-side (Papa Parse), then show:
    - a preview table;
    - column mapping with `phone` required;
    - the row count;
    - per-row flags for missing or invalid phones and duplicates.
  - Enable import only when at least one valid row exists.
  - Rewrite the helper copy as "Extra columns are saved as custom fields".

---

### F-QA-023 — Activity & Audit shows zero events for an active account, and "Suspicious activity?" links back to Profile
- **Severity:** medium · **Confidence:** multi-agent (QA-B-18 reports the same issue)
- **Source findings:** EXPLORE-SETTINGS-19
- **Pages:** /settings/activity
- **Evidence:**
  - The ALL and AUTH filters both show "Nothing in this slice yet."
  - `/api/account/audit-log?limit=50` returns `rows: []`, and so does `action_bucket=auth`.
  - The account has existed since 11 Aug and has sign-ins, 5 knowledge uploads, a data export on 21 Sept, flows and calls.
  - The page promises "Every security-relevant event on your account… append-only ledger".
  - "Suspicious activity?" goes to /settings (Profile), not to Security.
  - Whether logging is missing, or scoped to admins, is inferred. The UI gives no explanation.
- **Screenshots:** audit/screenshots/va-explore-settings/c7_activity.png, audit/screenshots/va-qa-b/settings-activity.png, audit/screenshots/va-qa-b/settings-activity-daterange.png
- **Recommendation:**
  - Verify that events are emitted for sign-in, sign-out, export, upload, flow save/activate, API key, webhook and settings changes, with a server-side integration test per event type.
  - If collection started recently, say "Recording since dd Mmm yyyy". Show the date range currently applied.
  - Point "Suspicious activity?" to Security (active sessions, sign out everywhere, reset password, enable 2FA).

---

### F-QA-024 — The meeting room lifecycle is inconsistent: a room is "live" for 82 h with STALE 0, appears as both active and past, and past meetings have no outputs
- **Severity:** medium · **Confidence:** multi-agent (the visual agent saw the same 82 h "LIVE" row and the unlabelled red stop control)
- **Source findings:** EXPLORE-CORE-11
- **Pages:** /meeting-agent
- **Evidence:**
  - One room shows "live 82h 31m" (82h 49m in the visual agent's capture) with STALE 0 and AGENTS 1/3.
  - The same room appears in both ACTIVE ROOMS and PAST MEETINGS.
  - The quota shows only 60 s used this month.
  - Past meetings offer no summary, recording or action items, although the persona advertises "Meeting intelligence" and "Action item capture".
  - "Delete room" is an icon-only red square next to "Record", with no label.
- **Screenshots:** audit/screenshots/va-explore-core/meeting_agent.png, audit/screenshots/va-explore-core/meeting_agent_2.png, audit/screenshots/va-ux-audit/crop_meeting_active_room.png, audit/screenshots/va-visual-audit/meeting-agent.png
- **Recommendation:**
  - Add a server reaper that ends rooms idle for N minutes or with no participants, and mark rooms `stale` after, for example, 30 min without media.
  - Make ACTIVE and PAST mutually exclusive by status.
  - Give each past meeting "Summary · Recording · Action items" links, or an explicit "No recording" state.
  - Give Delete a text label ("End room" or "Delete"), a confirmation dialog and an overflow-menu position.

---

### F-QA-025 — Core product claims conflict across public pages (Indian-language count; OAuth providers)
- **Severity:** medium (reported as high; the verifier lowered it because several of the pairs are compatible) · **Confidence:** partially-verified
- **Source findings:** PUBLIC-SITE-07
- **Pages:** /, meta description, /pricing, /about, /build.html, /docs, /security, /login
- **Evidence:** every quote was verified.
  - **Real conflicts:**
    - Indian languages are given as "10+" (/build.html), "12+" (meta, /pricing, /about, changelog, blog), "all 22 scheduled languages" and "every Indian language" (/about). The /build.html select lists 22 options.
    - OAuth is "Google and Microsoft" on /security, but Google and Meta on /login (also in F-QA-009).
  - **Not contradictions:** the verifier found these pairs compatible — 40+ total vs 12+ Indian; "sub-200ms" vs "sub-second"; LiveKit/Daily rooms vs Zoom/Meet/Teams; BYO carriers vs "Configure your Twilio number".
  - **Weak sub-claim:** the hero pill does include Hindi, and home says "Hindi, English, Tamil and 40+ more" further down, so the report's "never mentions India" framing is weak.
- **Screenshots:** audit/screenshots/va-public-site/home_top.png, audit/screenshots/va-public-site/about_part0.png, audit/screenshots/va-public-site/build_top.png, audit/screenshots/va-verify-public-site/home_top.png
- **Recommendation:**
  - Keep a single "claims sheet" in the CMS or repo, holding:
    - Indian language count and total language count;
    - measured latency with its definition (p50 turn latency);
    - meeting platforms;
    - channels;
    - auth providers.
  - Render these values from that sheet rather than hard-coding them per page.
  - Lead the hero rotation with Indian languages.
