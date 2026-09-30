
### F-UX-027 — Settings navigation: 17 flat items, 14 marked as external links, sub-pages that leave the shell, and up to four back links per page
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-SETTINGS-05, UX-AUDIT-20, VISUAL-AUDIT-19, QA-B-29, EXPLORE-SETTINGS-15, RESPONSIVE-B-13
- **Pages:** /settings, /settings/*, /api-keys, /api-keys/embed, /webhooks
- **Evidence:**
  - The sub-nav is 191 px wide, with 12 px text at 3.52:1 and no `aria-current`. It lists 17 items with no groups.
  - Three items (Profile, Meetings Billing, Docs) are `<button>` panels that don't change the URL. A refresh or a shared link always lands on Profile.
  - The other 14 items are full page navigations that drop the sub-nav. Each carries a 10 px ↗ external-link glyph, but nothing opens a new tab: no link has `target`, and no popups opened all session.
  - Three of these pages sit outside `/settings` (`/api-keys`, `/api-keys/embed`, `/webhooks`). They have no back link and no active rail item.
  - Back controls are duplicated. The "BACK TO SETTINGS" bar alone costs 42 px of height.

    | Page | Back controls |
    |---|---|
    | Notifications | 4: the "BACK TO SETTINGS" bar, "← Settings", a "§ SETTINGS / NOTIFICATIONS" breadcrumb, and "back to settings" inside a card |
    | Change Email, Security | 3 |
    | Integrations | 2 identical links |
    | Calling number, Calendly, Call channel | 2 |

  - Delete Account is an ordinary item in the main list. Casing drifts between items ("Call channel" vs "Activity & Audit").
  - On phones the sub-nav becomes a horizontal strip 2,300 px wide that shows about 2.5 of the 17 items, including Delete Account, with no scroll cue. `/api-keys` has no way back.
  - EXPLORE-SETTINGS-05 rated this high; four other agents rated it medium or low. It stays medium because every page can still be reached.
- **Screenshots:** va-ux-audit/crop_settings_nav_external_icons.png, va-explore-settings/c1_settings_profile.png, va-explore-settings/c4_notifications.png, va-explore-settings/c8_api_keys.png, va-visual-audit/settings_api-keys.png, va-responsive-b/settings_390.png, va-responsive-b/settings_apikeys_390.png
- **Recommendation:**
  - Build one persistent Settings layout. Make every item a nested route (`/settings/<group>/<page>`), keep the sub-nav visible on every page, and mark the current item with `aria-current="page"`.
  - Group the sub-nav:
    - Account: Profile, Email & sign-in, Security, Notifications
    - Organization: General, Members
    - Telephony: Calling numbers, Call routing
    - Integrations
    - Developers: API keys, Webhooks, Embed
    - Data & privacy: Activity, Export, and Delete account last, in danger styling
  - Move Meetings Billing to /billing (F-UX-021).
  - Use ↗ only for truly external docs, and open those in a new tab.
  - Remove the back bars and keep at most one breadcrumb in the page header.
  - Redirect `/api-keys`, `/api-keys/embed` and `/webhooks` to `/settings/developers/*`.
  - On phones, make `/settings` an index list that opens each page with a single back header.

### F-UX-028 — The wallet banner doesn't say what is blocked, dominates every page including Billing, and its dismissal lasts one tab
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-20, UX-AUDIT-28, VISUAL-AUDIT-15, DESIGN-RESEARCH-08, RESPONSIVE-B-18
- **Pages:** all authenticated pages except /rep-console, including /billing
- **Evidence:**
  - **Copy:** "Wallet empty — top up now to keep calls flowing." It shows no balance and doesn't say what is affected. On the same screens CONNECT stays enabled and Meeting Agent shows "Free minutes: 29 / 30".
  - **Look:**
    - A 42 px full-width bar in a light brand-blue tint (≈`#DDE3F7`) instead of a warning colour.
    - Its filled "Top up" (`#111725` on `#2F5FE0`, 3.27:1) is the first primary button the eye meets on every page.
    - On /billing it duplicates the page's own two CTAs.
  - **Behaviour:**
    - It uses `role="alert"`, so it is announced again on every navigation.
    - It renders about 2.7 s after DOMContentLoaded and pushes content down 42 px.
    - Dismiss writes `sessionStorage["vv:walletAlert:dismiss:zero"]`, so the banner returns in every new tab or window.
  - **Phones:** it grows to 58 px at 390 px width and 77 px at 360. With the sticky header (up to 69 px) and the tab bar (56 px), fixed chrome takes about 200 of 780 px, and about 330 px on Leads with its sticky filters.
  - Its CTAs lead to the wrong page (F-UX-002).
- **Screenshots:** va-explore-core/live_dashboard.png, va-explore-core/crop_banner_buttons.png, va-explore-settings/c20_billing.png, va-visual-audit/billing.png, va-responsive-b/analytics_360.png, va-responsive-b/leads_390_scrolled.png
- **Recommendation:**
  - State the balance and the impact: "Wallet ₹0 · Outbound phone calls are paused. Browser tests and 29 free meeting minutes still work."
  - Persist dismissal per user for 24 h, in `localStorage` or server-side. After dismissal, collapse the banner to a compact header chip, "₹0 · Top up". Show a blocking inline message only on screens that place calls.
  - Use the warning style: amber tint and a text-link CTA.
  - Switch to `role="status"` (polite).
  - Reserve the banner's slot or render it server-side, so it doesn't shift the layout.
  - Hide it on /billing.
  - On phones, render it as a one-line pill and let page headers collapse on scroll.

### F-UX-029 — Global chrome shows no account identity, sign-out is unguarded and named three ways, and the logo and 404 page send signed-in users to the marketing site
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-19, A11Y-MANUAL-25, RESPONSIVE-A-14, QA-A-10, QA-B-23
- **Pages:** global rail, mobile bottom bar, logo link, not-found page
- **Evidence:**
  - Neither rail state shows an avatar, name, org, plan or org switcher. The user's email and "RGN: Mumbai-1" exist only as hidden DOM text.
  - Sign out on desktop is an icon button with `title="Sign Out"`, no aria-label, `type=submit` and no confirmation. It comes right after the nav in the tab order, directly above the theme toggle.
  - On phones it is "Exit": a 51×55 primary tab, 0 px from Knowledge, with no aria-label.
  - The theme tile reads "DARK" next to a sun icon, and "Collapse [" shows a bare shortcut glyph.
  - Ctrl+K and ? open nothing. There is no global search, command palette or shortcut sheet.
  - The in-app logo (`href="/"`) leaves the app for the marketing homepage, which has no sidebar. Reproduced from /dashboard and /flow-builder.
  - Unknown app routes such as `/leads/xyz` render a 404 page without the app shell ("SIGNAL LOST … STATUS: DISCONNECTED"). Its "Return Home" button also goes to the marketing site.
- **Screenshots:** va-explore-core/sidebar_expanded_footer.png, va-explore-core/crop_sidebar_footer.png, va-explore-core/dashboard_mobile.png, va-responsive-a/dashboard_390.png, va-qa-a/logo_click_landing.png, va-qa-b/docs-flows-404.png
- **Recommendation:**
  - Pin an account menu to the bottom of the rail. It holds the avatar, name, org and role, plan and balance, a theme toggle labelled "Switch to dark", Help & docs, and "Sign out". Separate Sign out from the other items, and ask for confirmation or offer a 5 s undo.
  - On phones, move sign-out into the "More" sheet (F-UX-008).
  - Add a Ctrl+K palette for navigation, flows, leads and calls, and a "?" sheet listing shortcuts.
  - Point the in-app logo to the app home with `aria-label="Vaani Labs home"`, and put "Back to website" in the account menu.
  - For signed-in users, render not-found inside the app shell with plain copy, a "Go to dashboard" link and search. Drop "STATUS: DISCONNECTED".

### F-UX-030 — Loading shows no app shell, displays zeros as data, and route changes give no feedback
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** UX-AUDIT-17, QA-B-12
- **Pages:** all hard navigations; /call-reports, /leads, /analytics, /billing
- **Evidence:**
  - Every hard load shows a full-screen, centred "Loading…" spinner with no rail or header until `/api/auth/me` resolves. It was seen at 0.7 s on Billing, and on a cold /leads load it lasted about 12 s with throttling at 800 ms and 120 KB/s.
  - False zeros appear while data loads:
    - Call Reports shows "0 calls · Total Calls 0 · Avg Duration 0s" until data arrives, about 4.5 s after the click.
    - Leads shows "0 SHOWN · 0 TOTAL · Open pipeline 0".
    - Intents shows "0 CALLS ANALYSED".
    - The Analytics DID card first flashes the wrong copy (F-UX-015).
  - During client-side navigation the URL and rail highlight change at once, but the old page stays on screen with no progress indicator. This lasts 0.8–1.2 s normally and longer under throttling.
  - Without throttling, the Analytics KPI cards stayed as "• • •" for 10.4 s on a first visit and 3.2 s on a warm one.
  - In a first run, an expired session showed a blank page, then a bare `/login` with no `?next=` and no reason.
  - The verifier could not reproduce Billing's "₹0.00 auto top-up" flash (see the appendix).
- **Screenshots:** va-ux-audit/20_billing_t0700ms.png, va-qa-b/throttle-callreports-1500ms.png, va-qa-b/throttle-leads-early.png, va-qa-b/analytics-1.png, va-explore-core/spa_transition_250ms.png, va-ux-audit/00_redirected_to_login.png
- **Recommendation:**
  - Keep the shell (rail, header and banner slot) mounted in the layout, and show a skeleton in each region. After the first paint, never show a full-screen spinner.
  - Show unknown values as skeletons or "—", never 0. Hold each KPI card until its query resolves.
  - Add a top progress bar for route changes. Split the slow Analytics queries so the fast cards render first.
  - When auth fails, redirect within 1 s to `/login?next=<path>&reason=expired` and show "Your session expired".

### F-UX-031 — Filters, open records and the open flow aren't in the URL, so deep links, reload and Back fail; counts use different scopes on different pages
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-11, QA-B-10, QA-A-11, UX-AUDIT-09
- **Pages:** /leads, /call-reports, /analytics, /flow-builder, /settings
- **Evidence:**
  - **Leads:** after choosing CONTACTED + FACEBOOK, the URL stays `/leads?page=1&size=50`. The subtitle reads "0 SHOWN · 0 TOTAL", though the total should stay 24. The chips have no `aria-pressed` and no counts.
  - **Call records:** Analytics › Recent › "OPEN REPORT" goes to `/call-reports?id=<uuid>`. No panel opens and no row is highlighted, even though the call is among the 50 loaded rows (reproduced by click and by direct load). Opening a call panel or a lead drawer never changes the URL.
  - **Flow Builder:** switching flows leaves the URL at `/flow-builder`. Reload always reopens the same default flow and writes to it (F-UX-024), and Back doesn't move between flows.
  - **Analytics and Settings:** the Analytics range toggle and Settings' in-page tabs (Profile, Meetings Billing, Docs) aren't in the URL and reset on reload.
  - **Count scopes disagree:** Leads KPIs recompute for the active filter. On Call Reports, a search returning 13 rows still shows the "121 calls" pill and KPIs of Total 121 and Avg 90s (verified under UX-AUDIT-09).
- **Screenshots:** va-explore-data/r2_leads_filter_two.png, va-qa-b/callreports-deeplink-id.png, va-qa-b/analytics-open-report.png, va-verify-ux-audit/17_call_reports_search.png
- **Recommendation:**
  - Sync filters, search, sort, page and range to query params (e.g. `/leads?status=contacted&source=facebook`) and restore them on load. Use `replaceState` while typing and `pushState` for discrete filter changes.
  - Give records their own routes: `/call-reports/:id`, `/leads/:id` and `/flow-builder/:flowId`. Honour them even when the record is outside the loaded page.
  - When a filter is active, show "13 of 121 calls" and "0 of 24 leads". Label KPI scope the same way on both pages ("in view" vs "all time").
  - Build chips as a radio group or as `aria-pressed` toggles, and show a count on each.

### F-UX-032 — The lead drawer loses its header, clips its bottom, puts Delete under Call, and shows month-old "QUEUED" calls
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-09, UX-AUDIT-22
- **Pages:** /leads (row drawer, bulk bar)
- **Evidence:**
  - **Layout:**
    - The drawer is an `<aside>` about 440 px wide, sticky at top 42 px with a height of 900 px inside an 858 px viewport. Its bottom 42 px are always cut off, and DELETE LEAD ends at y=926.
    - When the list scrolls, the lead's name slides under the sticky filter bar.
    - It has no dialog role or accessible name, and Esc doesn't close it.
  - **Delete placement:** DELETE LEAD is a full-width 391×33 button with 10 px red text on a 5% red tint. It sits directly under Call Now / WA, just below the fold at 900 px. Its confirmation was not tested.
  - **Stale call data:** call history reads "VOBIZ · QUEUED · 28 Aug, 11:45 pm", a call still queued a month later and labelled with the carrier's name. The drawer shows "CALLS 1", while the Cockpit shows "3 PREV. CALLS" for the same lead.
  - **Labels and defaults:**
    - "WA" is cryptic; only its title says "Send WhatsApp".
    - The flow select lists 16 flows with duplicate names and no versions (F-UX-005).
    - Voice defaults to VIKASH here and in the bulk bar, but to VAANI in the Cockpit.
  - **Selection bug:** clicking the first row's checkbox scrolled the table, so the next click checked the wrong rows (7 and 8 instead of 1 and 2).
- **Screenshots:** va-explore-data/r2_leads_row_click.png, va-explore-data/r2_leads_drawer_bottom.png, va-explore-data/r2_leads_drawer_scrolled.png, va-ux-audit/34_lead_panel_actions.png, va-ux-audit/33_lead_panel_bottom.png, va-verify-ux-audit/03_lead_panel.png
- **Recommendation:**
  - Make the drawer full height with its own scroll area:
    - a sticky header with name, status and a close ×
    - a sticky footer with Call and WhatsApp
    - `role="dialog"` with `aria-labelledby`, Esc to close, and a `/leads/:id` URL
  - Move "Delete lead" into a "…" menu, behind a confirmation dialog that names the lead or an undo toast.
  - Expire queued or in-progress calls after a timeout and show "Not placed · Retry". Label the channel ("Phone call") rather than the carrier, and count calls from one source everywhere.
  - Spell out "WhatsApp".
  - Set one default voice in Settings and show it the same way everywhere.
  - Stop the table from scrolling when a checkbox is clicked (no scroll-into-view on focus).
