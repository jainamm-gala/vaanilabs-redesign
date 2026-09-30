## 3A. Findings — Global, IA & navigation, UX & journeys, content/copy, trust

**Scope.** This section consolidates 119 raw findings on the global shell, information architecture and navigation, task journeys, content and copy, and trust and safety. After deduplication they form 48 findings: 1 critical, 11 high, 33 medium and 3 low. No finding in this section was refuted. Where the verifier could not reproduce part of a finding, or found it overstated, the details are listed in the "Refuted / not reproduced" appendix at the end of this section.

**How to read it.**
- **Severity** already includes the adversarial verifier's corrections. Where findings of different severity were merged and none was verified, the note under Evidence explains the rating chosen.
- **Confidence** has four levels:
  - `verified`: the verifier re-checked it in the live product.
  - `partially-verified`: the verifier confirmed the core claim but not every sub-claim.
  - `multi-agent`: two or more agents reported it independently, but it was not verified.
  - `single-agent`: one agent reported it and it was not verified.
- **Screenshots** are paths relative to `audit/screenshots/`.
- A raw finding that bundled several distinct problems (for example UX-AUDIT-09) is cited under each consolidated finding it feeds.
- No lead or customer names, phone numbers or emails appear here. Customer flow names are replaced with generic labels.

---

### F-UX-001 — Organization and team setup is a circular dead end, so all 5 integrations stay disabled
- **Severity:** critical · **Confidence:** multi-agent
- **Source findings:** EXPLORE-SETTINGS-02, QA-B-29
- **Pages:** /settings/organization, /admin/organizations, /settings/integrations
- **Evidence:**
  - `/settings/organization` says "You aren't an admin of any organization yet… Ask your org admin to grant you the admin role, **or create your own org below**." The only control below it is "Browse organizations →", which goes to `/admin/organizations`.
  - That page says "No organizations yet. Create one to get started." It has no create control; the only button in `main` is an unlabelled icon button. `/admin` redirects to `/dashboard`.
  - On `/settings/integrations` all 5 Connect buttons (Instagram, Facebook, WhatsApp, HubSpot, Salesforce) are disabled. The reason appears only below the fold, with the raw path "/admin/organizations" as link text, which leads back into the same dead end.
  - The account belongs to an org, with role "member" shown on Analytics. It cannot become an admin or create an org, so it cannot invite teammates or connect any integration.
  - QA-B-29 independently confirms the missing "create below" control. Not re-verified live.
- **Screenshots:** va-explore-settings/c5_organization.png, va-explore-settings/c15_admin_orgs.png, va-explore-settings/c12_integrations.png, va-explore-settings/c22_admin.png, va-qa-b/settings-organization.png, va-qa-b/settings-integrations.png
- **Recommendation:**
  - Add a primary "Create organization" action (name + subdomain) to both empty states. Alternatively, auto-create a personal org at signup with the signing-up user as its admin.
  - If creating an org is deliberately role-gated, replace the "create below" copy with "Request admin access". It should notify the org admin and show who that admin is.
  - On Integrations, show the lock reason inline on each disabled card ("Requires org admin · Request access") and use human link text.
  - Add an E2E test: a new signup must be able to reach an enabled Connect button.

### F-UX-002 — The wallet banner's "Top up" and "Enable autopay" land on Settings → Profile, which has no wallet
- **Severity:** high · **Confidence:** verified
- **Source findings:** UX-AUDIT-02
- **Pages:** global banner → /settings#wallet, /settings#autopay (also shown on /billing)
- **Evidence:**
  - The banner hrefs are `/settings#wallet` and `/settings#autopay`. Both render "Profile Settings".
  - No element has `id="wallet"` or `id="autopay"`, and no wallet, balance or autopay text appears in the settings content. The verifier confirmed this.
  - The banner shows on every authenticated page while the balance is ₹0.00, including `/billing`, which is where the real top-up and autopay controls are.
  - Hash routing itself works: Meeting Agent's "Free minutes" link to `/settings#meetings-billing` does open that tab. The two wallet anchors simply don't exist.
  - On phones the banner is also the only route into Settings (F-UX-008).
  - Five other agents reported the same bug independently: EXPLORE-CORE-01, EXPLORE-DATA-01, EXPLORE-SETTINGS-01, QA-A-03 and QA-B-02.
- **Screenshots:** va-verify-ux-audit/05_topup_dest.png, va-verify-ux-audit/02_settings_hash_wallet.png, va-ux-audit/15_settings_hash_wallet.png, va-explore-settings/c20_billing.png
- **Recommendation:**
  - Point the CTAs to `/billing#top-up` and `/billing#autopay` and add those ids. On arrival, scroll to the card, highlight it and focus the amount. Alternatively, open a top-up sheet in place.
  - For old links, add a client-side handler on `/settings` that turns `#wallet` or `#autopay` into `router.replace('/billing#…')`.
  - Hide the banner on `/billing`.
  - Add a CI check that every in-app `href="…#id"` resolves to an existing element.

### F-UX-003 — Cockpit Customer Intel pairs the latest real lead with hard-coded demo data and shows sentiment before any call
- **Severity:** high · **Confidence:** verified
- **Source findings:** UX-AUDIT-05, EXPLORE-CORE-02
- **Pages:** /dashboard
- **Evidence:**
  - The card loads `/api/leads?limit=1`. The name and masked phone (same last 4 digits) match lead row 1.
  - Email, company and location are demo seeds that are not in the lead record. The lead's email is empty, and the demo email exists nowhere in Leads.
  - While SESSION is IDLE the card shows "SENTIMENT POSITIVE 72/100" and "3 PREV. CALLS". The same lead's panel in Leads shows "CALLS 1".
  - The 6 intel inputs, the flow select and the tel field have no `label[for]`, no wrapping label, no `aria-label` and no `aria-labelledby`.
  - SAVE CONTEXT's title is "Save customer context — agent will use this data". The agent could therefore address a real person using another company's details. There is no lead picker.
- **Screenshots:** va-verify-ux-audit/01_dashboard.png, va-verify-ux-audit/03_lead_panel.png, va-ux-audit/10_dashboard_live.png, va-explore-core/live_dashboard.png
- **Recommendation:**
  - Start the card empty, with a "Pick a lead or enter a number" combobox that searches Leads.
  - Fill only the fields that exist on the lead, and show where each value came from ("from Leads").
  - Remove the demo seeds from production.
  - Show sentiment and call count only after a call, labelled "Last call" and taken from the same source Leads uses.
  - Split SAVE CONTEXT into an explicit "Use for this call" (session only) or "Save to lead" (persists).
  - Associate a label with every input.

### F-UX-004 — The green "FLOW VALIDATED" pill shows on flows that fail validation
- **Severity:** high · **Confidence:** verified
- **Source findings:** UX-AUDIT-03, QA-A-19
- **Pages:** /flow-builder
- **Evidence:**
  - On a fresh load the pill is green.
  - Clicking Validate reports "2 FLOW VALIDATION ERRORS": Knowledge Lookup has no incoming step and no outgoing connection.
  - After adding an unconnected Speak node, Validate reports 4 errors and the pill is still green (computed green at 0.7 alpha). The error panel only covers the pill temporarily.
  - The same false badge persists in full-screen mode. Full-screen has no visible exit control (only Esc or F), and the app rail and wallet banner stay on screen.
  - The pill's contrast is about 2.5:1.
- **Screenshots:** va-verify-ux-audit/07_flow_validate_fresh.png, va-verify-ux-audit/09_flow_after_add_4s.png, va-verify-ux-audit/10_flow_validate_after_add.png, va-flow-config/14_validate_fresh.png, va-ux-audit/27_flow_validate_with_orphan.png, va-qa-a/flow_fullscreen.png
- **Recommendation:**
  - Run the validator on load and again about 500 ms after each edit.
  - Bind the pill to the result:
    - green "Valid" only at 0 errors
    - an amber "N issues" button that opens the error list with Jump links
    - grey "Not validated" when the result is stale
  - Block ACTIVATE while errors > 0, or require "Activate anyway" with the list shown.
  - Add a floating "Exit full screen (Esc)" button, and hide the app chrome in full-screen.

### F-UX-005 — There is no "what is live" state, flow names are duplicated, and four pickers describe the active flow differently
- **Severity:** high · **Confidence:** verified
- **Source findings:** UX-AUDIT-06, EXPLORE-CORE-12, QA-A-17
- **Pages:** /flow-builder, /dashboard, /leads, /meeting-agent
- **Evidence:**
  - The All-flows modal (16 flows) has only NAME / CATEGORY / LAST EDITED / OPEN columns.
    - There is no Live/Active column, no sort and no marker for the flow currently open.
    - Its order is unsorted (4 Sept, 21 Sept, 15 Sept, 26 Sept, 28 Aug…).
    - While loading it shows "Page 1 of 1 · No flows" next to "Loading…", then grows from about 280 to 690 px.
  - Three flow names each appear twice: a real-estate flow "(v2)", an airport-support flow and a demo flow. Versioned and unversioned copies and "Generated: …" AI drafts are mixed in.
  - The Cockpit select is 150 px wide in 10 px mono. It separates duplicates with 6-character hash suffixes ("· 9115a2" / "· f9b04a") and truncates to "…(v2) · f". The Leads bulk bar, the lead panel and Meeting Agent list the same duplicates without suffixes.
  - The active flow is described four ways and never named: "Default flow", "Active flow (profile default)", "Active flow (from profile)", and the truncated Cockpit select.
  - "New flow" is hidden in the "…" menu (Export JSON / Import JSON / New flow / Reset to default), one row above a destructive reset.
- **Screenshots:** va-verify-ux-audit/12_flow_picker.png, va-verify-ux-audit/11_flow_more_menu.png, va-ux-audit/29_flow_picker.png, va-ux-audit/24b_flow_more_actions.png, va-qa-a/flow_switcher_open.png, va-qa-a/flow_switcher_loaded.png
- **Recommendation:**
  - Use one shared searchable FlowPicker (at least 240 px wide) everywhere.
    - Each option reads "Name · v3 · LIVE / Draft / AI draft · edited 26 Sep", grouped by status.
    - Sort by last edited, newest first, and mark the current flow.
    - While loading, show skeleton rows at a fixed minimum height.
  - Add a LIVE badge in the Flow Builder header and in the list, with "Used by: outbound default, Meeting Agent, number X".
  - Enforce unique names with an automatic " (2)" suffix and a rename prompt.
  - Replace "Default flow" copy with the actual flow name.
  - Show a visible "+ New flow" button, and move "Reset to default" into a separated danger group with a confirmation.

### F-UX-006 — Onboarding says "You're live" on an account that can't place calls, and nothing tracks setup afterwards
- **Severity:** high · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-09, UX-AUDIT-19
- **Pages:** /onboarding, global
- **Evidence:**
  - `/api/onboarding/state` returns `current_step 5, completed_steps [1,2,3,5], completed_at 2026-09-03`. Step 4 (Test call) was never completed.
  - Yet `/onboarding` ticks all five steps (PROFILE, SUBDOMAIN, FLOW, TEST CALL, DONE) and says "You're *live*."
  - At the same time:
    - the wallet is ₹0.00
    - Personal Agent settings say "No number assigned yet"
    - Analytics shows DID PENDING
    - the Profile phone is empty
  - Onboarding never covers wallet, number, knowledge or leads.
  - The state is fetched on every page load but never shown. `/onboarding` is not linked anywhere after first run, and it overflows horizontally at 1440 px (main scrollWidth 1486 vs 1358).
  - Prerequisites are spread over at least 4 pages. UX-AUDIT rates the first-run journey 2/5.
  - UX-AUDIT-19 rated this medium; it is kept high because it is the main first-run failure and it makes a false readiness claim.
- **Screenshots:** va-explore-core/onboarding.png, va-explore-settings/c14_onboarding.png
- **Recommendation:**
  - Replace "You're live" with a readiness checklist computed from real state: Flow ✓ · Test call ✗ · Calling number ✗ · Transfer destination ✗ · Wallet ✗ (Top up) · Leads ✗ (Import).
  - Keep a persistent "Setup 3/6" entry in the rail footer or on a Home page until every step is done, with each step deep-linked.
  - Show inline blockers on the pages that depend on each step.
  - Set `completed_at` only when all required steps are complete.
  - Link "Setup guide" from Help.

### F-UX-007 — The collapsed rail clips its own items and hover labels, and draws a stray scrollbar at every desktop width
- **Severity:** high · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-05, RESPONSIVE-A-06, RESPONSIVE-A-07, RESPONSIVE-B-02, RESPONSIVE-B-03, UX-AUDIT-11, EXPLORE-SETTINGS-07
- **Pages:** global rail (≥768 px)
- **Evidence:**
  - The nav has `overflow:auto` on both axes. Its scrollHeight is 572 against this visible height:

    | Viewport | Visible height | What is hidden |
    |---|---|---|
    | 1440×900 | 548 | Settings (y 620–664) is half-clipped. On /settings the active item itself sits under the scrollbar arrows. |
    | 1280×800 | 448 | Billing partly; Knowledge and Settings |
    | 1366×768 and 1024×768 | 416 | Only 8 of 12 items fully visible |
    | 844×390 | 38 | No item fully visible |
    | 1920×1080 | 728 | Nothing; all 12 items fit |

  - The expanded 240 px rail at 1024×768 still hides Knowledge and Settings (475/524).
  - Hidden labels make scrollWidth 175 against clientWidth 44, so a ◂ ▸ horizontal scrollbar is drawn inside the 72 px rail at 1920, 1440, 1280 and 1024.
  - The custom tooltip reaches opacity 1 at x 64–143, but the nav ends at x 63, so 0% of it is visible. Only the delayed native `title` shows.
  - At 1024×768 on /billing the active item is scrolled out of view.
  - Other verifiers rated subsets of this medium because items can still be reached by scrolling. It is consolidated at high following the VISUAL-AUDIT-05 verifier.
- **Screenshots:** va-verify-ux-audit/30_rail_clip.png, va-verify-visual-audit/settings_sidebar_zoom.png, va-verify-visual-audit/sidebar_1366x768.png, va-verify-responsive-a/sidebar_hover_1440.png, va-verify-responsive-b/analytics_1024x768.png, va-verify-responsive-b/analytics_844x390.png, va-verify-responsive-b/expanded_1024x768.png, va-verify-responsive-b/hover_leads_1280.png
- **Recommendation:**
  - Set `overflow-x:hidden` on the nav.
  - Render tooltips in a portal or with `position:fixed`, and show them on hover and on `:focus-visible` after about 300 ms.
  - Pin Billing, Settings and a single avatar menu (status, theme, sign-out) in a footer that does not scroll. This frees about 150 px.
  - Reduce the item pitch from 48 to 40 px below 800 px of height, and make sure all primary items fit at 680 px.
  - Scroll the active item into view on load.
  - Below about 600 px of height, switch to the bottom bar.
