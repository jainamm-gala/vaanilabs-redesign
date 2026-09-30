# QA Agent B: interactive functional testing (vaanilabs.in)

Agent: `va-qa-b` · Date: 26 Sept 2026 · Viewport 1440x900 (desktop) plus CDP throttling and offline emulation · Browser status at the end: **signed in the whole time (no LOGGED_OUT)**; own tab closed at the end.

Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-qa-b/` (referenced below as `va-qa-b/<file>`).

> Note on the user's relayed question ("the session expires mid-run… should I provide something so you can log in each time?"): during this run the session stayed valid for every call (about 60 browser calls over roughly 1.5 h), so no re-login was needed. Please do **not** share a password or credentials. I am not allowed to type passwords into login forms, and a shared password would also give full access to a production account with real customer data. What works: sign in once yourself in the automation browser profile and keep it open. The harness preamble already turns the `sb-access/refresh-token` session cookies into 12-hour persistent cookies. Most "signed out" events in this audit came from a browser reset after a hung tool call, not from token expiry, so keeping calls short (as this run did) matters more than credentials.

---

## 1. Scope and method

Brief: every safe interactive control on **/analytics, /leads, /call-reports, /knowledge, /billing, /settings (all 17 sub-sections)**, plus global behaviours (404, deep links, back/forward, reload persistence, pagination edges, empty states, zero-result filter combos, sorting, sticky headers, row click, date/number formats, loading under throttling, offline, console errors, 4xx/5xx).

Method:
- A private window was driven only through `browser_run_code_unsafe` with the read-only network guard. All POST/PUT/PATCH/DELETE requests, websockets, downloads, razorpay and posthog were blocked.
- A `response` listener recorded every `/api/*` call and every 4xx/5xx response. A `requestfailed` listener recorded aborted requests. Console errors and page errors were collected per page.
- Each bug was reproduced at least twice, in a separate call or with a second input. Items reproduced only once are marked "inferred" or were dropped. One candidate was dropped because it did not reproduce: the lead drawer not closing on Esc (it closed on the second try).
- Nothing was saved, submitted, uploaded, imported, exported, called, paid or deleted. "Observed under simulated network failure" marks behaviour that only appears because our guard blocked the write.
- Privacy: no person names, phone numbers or emails are copied here. Leads and calls are referred to generically.

Network health summary: on every page tested, all first-party GETs returned **200**. The only real 4xx/5xx responses were:
- `404 /docs/embed`, `404 /docs/webhooks`, `404 /docs/flows` (prefetched by the Settings > Docs tab; see QA-B-07).
- `403 /api/knowledge/proposals` "Organization admin access required" (see QA-B-09).
- `/api/analytics/intents?window=90d` returns **200** but carries a `warning: "Intent clustering temporarily unavailable (LLM call failed)."` (see QA-B-11).
- No page errors (uncaught JS exceptions) were recorded on any tested page. The only console errors were resource failures: our blocked posthog calls, the 404 docs prefetches, and the offline tests.

---

## 2. Findings (ranked)

### QA-B-01 · Call Reports shows only the latest 50 of 121 calls, with no pagination. Search, sort and filter only cover those 50 · critical · functional-bug
- Evidence:
  - `/api/calls` returns `{total:121}` with 50 rows. The table renders 50 `tbody tr`.
  - Scrolling the table container (`div.flex-1.overflow-auto`) to the bottom loads nothing more. There is no Next, Load more or page control.
  - Reproduced on 3 loads: first visit, after reload, and the `?id=` deep link.
  - Sorting "Started ▲" puts **3 Sept** at the top. Older calls exist (a lead's call history shows 28 Aug, and the Analytics 90D chart shows activity from late Aug), so the sort covers only the loaded page.
  - Search makes no API request (client-side over 50 rows only).
  - Result: 71 calls (59%) cannot be reached from the UI.
- Screens: `va-qa-b/callreports-1.png`, `callreports-bottom.png`, `callreports-scrolled.png`.
- Recommendation:
  - Add server-side pagination like Leads (page, size, "1–50 of 121") or cursor-based "Load more".
  - Run search, sentiment filter and sort on the server so they cover all calls.
  - Keep page, size, query and filter in the URL.

### QA-B-02 · The global "Wallet empty" banner CTAs lead nowhere · high · functional-bug
- Evidence:
  - The banner is on every app page, and the wallet is Rs 0, so calls are blocked. "Top up" links to `/settings#wallet` and "Enable autopay" links to `/settings#autopay`.
  - Both land on **Profile Settings**. The page has no element `#wallet` or `#autopay`, and no wallet or autopay content (the text search found none).
  - Reproduced for both hashes.
  - The real top-up and autopay UI lives at `/billing`.
- Screens: `va-qa-b/settings-hash-wallet.png`, `settings-profile-bottom.png`.
- Recommendation:
  - Point the CTAs to `/billing#top-up` and `/billing#autopay`, with matching anchors that scroll to and focus the controls.
  - Better: open the top-up sheet in place.
  - Add a regression test that every banner and CTA href resolves to an existing anchor.

### QA-B-03 · Call Reports KPI cards mix scopes and disagree with Analytics · high · functional-bug
- Evidence:
  - "Total Calls 121" comes from the server total.
  - "Avg Duration 90s", "Positive 4" and "Negative 10" match exactly the aggregates of the 50 loaded rows. The recomputed average of 50 rows is 90 s; sentiment counts are neutral 26, negative 10, mixed 3, null 7, positive 4.
  - Analytics shows "AVG DURATION 1m 18s" (78 s) for the same account.
  - On Analytics, "TOTAL CALLS 121" sits under the header "Headline — this past week, in numerals", but it is an all-time figure.
- Screens: `va-qa-b/callreports-1.png`, `analytics-full.png`.
- Recommendation: compute every KPI server-side over one clearly labelled window. Show that window ("All time", "Last 30 days") on each card, and use the same metric definitions on Analytics and Call Reports.

### QA-B-04 · Browser test calls are logged as two calls each, inflating counts (partly inferred) · high · functional-bug
- Evidence:
  - Analytics "Recent — the latest ten" shows 5 pairs. Each pair has an INBOUND row with the same start minute (`— → —`, no numbers) and an OUTBOUND row, with durations 1 s apart (11s/10s, 1m 27s/1m 26s, …). Sentiment sometimes differs within a pair (mixed vs negative).
  - In `/api/calls`, 19 of the 23 distinct start-minutes among the latest 50 calls are exactly one `inbound/browser` plus one `outbound/manual` pair.
  - Call Reports labels both legs "BROWSER".
  - Inferred: "121 calls", "This week 24", minutes and sentiment are roughly double-counted for browser test calls.
- Screens: `va-qa-b/analytics-s4.png`, `callreports-1.png`.
- Recommendation: model a call as one record with legs. Count and bill conversations, not legs, and show one row per call with the legs available as detail.

### QA-B-05 · Leads "N total" and the KPI strip count the current page or filter, not the pipeline · high · functional-bug
- Evidence:
  - With per-page 20, page 2 shows "4 SHOWN · 4 TOTAL", Open pipeline 4, New 4 (100%). `/api/leads?limit=20&offset=20` returns `total: 24`.
  - Status filter "Converted" or search "zzqqxx" shows "0 SHOWN · 0 TOTAL" with Open pipeline 0, New 0, Interested+ 0.
  - Reproduced on page 2 and on the two filters.
- Screens: `va-qa-b/leads-page2-size20.png`, `leads-filter-converted.png`, `leads-search-empty.png`.
- Recommendation: use the API `total` for "total" ("4 shown of 24"). Compute KPI tiles from an org-level aggregate endpoint, or label them "in this view".

### QA-B-06 · Leads URL state is write-only: deep links, filters and back/forward are not honoured · high · functional-bug
- Evidence:
  - `/leads?page=2&size=20` and `/leads?page=2&size=50` both get rewritten to `?page=1&size=50` and fetch `limit=50&offset=0`. Frame navigation log: `…page=2&size=20 → …page=1&size=50`.
  - Search text and status filter are never written to the URL. After reload, "Converted" is lost.
  - Page and size changes use `replaceState`. After page 1 → page 2, pressing Back left Leads entirely and went to the previous route.
  - Reproduced with 2 deep links and 1 reload.
- Recommendation:
  - Treat the URL as the source of truth: read page, size, q, status, source, lang and outcome on mount.
  - Clamp out-of-range pages with a visible note.
  - Use `pushState` for page changes so Back steps through pages.

### QA-B-07 · Settings > Docs: 3 of 5 documentation links return 404 · high · functional-bug
- Evidence:
  - `/docs/api` returns 200 and `/docs/integrations` returns 200.
  - `/docs/embed`, `/docs/webhooks` and `/docs/flows` return **404**. This was seen in three ways: Next prefetch (console errors on opening the tab), `fetch`, and direct navigation, which shows the "404 SIGNAL LOST" page.
  - The same tab calls the product "Vani Voice", while elsewhere it is "Vaani Labs" or "VaaniVoice".
- Screens: `va-qa-b/settings-docs.png`, `docs-flows-404.png`.
- Recommendation: fix or redirect the three routes (for example `/docs/embed` → `/api-keys/embed`, which does exist). Add link checking to CI, and settle on one product name.

### QA-B-08 · Embed Handbook code snippets render corrupted markup · high · content-copy
- Evidence:
  - The `<pre>` textContent of snippet §01 begins `<"vv-attr">class="vv-tag">div "vv-attr">id="vaani-voice"></"vv-attr">class="vv-tag">div>`. The syntax highlighter re-highlights its own injected `<span class="vv-attr">` markup.
  - `https://www…` is split: after `https:` the rest is styled as a `//` comment.
  - Seen in all snippets (checked in 2 `pre` blocks) and visually.
  - "COPY" changes to "COPIED". The clipboard read-back returned an empty string, so the copied content is **unverified**.
  - The live-preview cards are about 180 px wide, and their text is clipped at the top ("voicebot").
- Screen: `va-qa-b/embed-snippet.png`.
- Recommendation:
  - Escape the source once, then tokenize in a single pass with a real highlighter (Shiki or Prism).
  - Make COPY use the raw snippet string, not the DOM text.
  - Add a visual test.

### QA-B-09 · "Review proposals" is shown to a member, then silently redirects to the Agent Cockpit · medium · ia-navigation
- Evidence:
  - The Knowledge header link goes to `/knowledge/proposals`. The browser lands on `/dashboard` ("AGENT COCKPIT", with the live CONNECT and Test Call controls) with no message.
  - `/api/knowledge/proposals` returns 403 "Organization admin access required". The Analytics identity shows Role "member".
  - Reproduced by clicking the link and by direct navigation.
- Screen: `va-qa-b/knowledge-proposals-click.png`.
- Recommendation: hide the entry for non-admins, or show it disabled with an "Admins only" tooltip. For gated routes, render a 403 page that explains the permission, instead of redirecting to a page with live-call controls.

### QA-B-10 · Deep links to a specific record don't open it (Open Report, call details, lead drawer) · medium · ia-navigation
- Evidence:
  - Analytics > Recent > expand a row > "OPEN REPORT" goes to `/call-reports?id=<uuid>`. The call is among the 50 loaded rows, but no detail panel opens and no row is highlighted. Reproduced by clicking and by direct navigation with a 5.5 s wait.
  - Opening a Call Details panel or a lead drawer never changes the URL, so neither can be shared or bookmarked.
- Screen: `va-qa-b/callreports-deeplink-id.png`.
- Recommendation: honour `?id=` (fetch the call even when it is outside the current page), open the panel and scroll to the row. Mirror the open drawer or panel in the URL (`/leads/:id`, `/call-reports/:id`).

### QA-B-11 · Intents: raw LLM error shown to users, and a stale cache with a "next refresh" in the past · medium · content-copy
- Evidence:
  - 90D shows the banner "Intent analysis unavailable — Intent clustering temporarily unavailable (LLM call failed)." The API returns `clusters:[]` with that warning. Reproduced in the UI and via fetch.
  - 30D shows "last computed 21 Sept, 16:31, next 21 Sept, 17:01" while today is 26 Sept (`next_refresh_at` is 5 days in the past). 7D is fresh.
  - While loading, the card shows "WINDOW 30D · 0 CALLS ANALYSED" plus "LOADING", i.e. a false zero.
  - Range toggles are not stored in the URL and reset to 30D on reload.
- Screens: `va-qa-b/analytics-s3.png`, `analytics-1.png`.
- Recommendation:
  - Show a human message ("Intent insights are temporarily unavailable — last good analysis from 21 Sept") with a retry.
  - Fix the scheduler so stale windows recompute.
  - Hide counts until they are loaded.
  - Keep the range in the URL.

### QA-B-12 · Loading states show false zeros and give no route-transition feedback · medium · ux
- Evidence (repro 1, client-side navigation to Call Reports at 1500 ms latency and 40 KB/s):
  - At 1.5 s the URL and the sidebar highlight have already switched, but the previous page (Leads) is still shown with no progress indicator.
  - DOM text then read "Call Reports · 0 calls · Total Calls 0 · Avg Duration 0s · Positive 0 · Negative 0" until data arrived about 4.5 s after the click.
- Evidence (repro 2, cold `/leads` at 800 ms and 120 KB/s):
  - A full-screen centred spinner "Loading…" (no shell or skeleton) until about 12 s.
  - Then "0 SHOWN · 0 TOTAL · Open pipeline 0 · New 0 · Interested+ 0", then real data at about 14 s.
- Analytics KPI cards stayed as skeleton dots for **10.4 s** on first visit and 3.2 s on a warm visit (no throttling).
- Screens: `va-qa-b/throttle-callreports-1500ms.png`, `throttle-leads-early.png`, `analytics-1.png`.
- Recommendation:
  - Render the app shell immediately.
  - Use skeletons (never "0") for unknown values.
  - Add a top progress bar for route transitions.
  - Split the Analytics overview so the fastest cards render first.

### QA-B-13 · Offline: the app drops to Chrome's dinosaur page, and Refresh fails silently · medium · ux
- Evidence:
  - With CDP offline, clicking a sidebar link logs "Failed to fetch RSC payload … Falling back to browser navigation" and loads `chrome-error://chromewebdata/` (ERR_INTERNET_DISCONNECTED). The whole app shell is lost.
  - On Call Reports while offline, "Refresh" produced no toast, no inline error and no offline badge. The stale data stayed, which is good, but nothing told the user the refresh failed.
  - After reconnecting, the Chrome error page auto-reloaded to `/knowledge` ("Loading…").
  - The sidebar "SYS ONLINE / Nms" indicator gives no offline signal.
- Screens: `va-qa-b/offline-nav-knowledge.png`, `offline-callreports-refresh.png`, `offline-restored.png`.
- Recommendation:
  - Listen to `online`/`offline` events.
  - Block client navigation while offline, with a toast: "You're offline — showing cached data".
  - Show fetch failures inline with a Retry.
  - Wire the sidebar status dot to real connectivity.

### QA-B-14 · Client-side validation is missing or inconsistent across forms · medium · functional-bug
- Evidence (all reproduced with at least 2 inputs; nothing submitted):
  - **New Lead:** phone `type=tel` accepts "abx" (validity.valid = true). Only email gets the browser bubble "Please include an '@'…". No inline errors and no `aria-invalid`.
  - **Profile:** phone accepts "abx". "Save Changes" is always enabled.
  - **Settings > Calling number:** "Send code" (sends an SMS) becomes enabled for "abx", "12" and "+91 00000 00000".
  - **Change Email:** "Send confirmation links" is enabled while the field holds "not-an-email" (validity false).
  - **Knowledge > Website URL:** "Fetch & Embed" is enabled with "not-a-url" (validity false, "Please enter a URL.").
  - **Billing top-up:** typing 0 or -50 is silently rewritten to **1**. 99,999,999 is accepted. 10.555 is invalid for step=1, but "Pay with UPI" stays enabled. There are no min/max hints or inline messages. The auto top-up field also clamps 0 to 1.
- Screens: `va-qa-b/leads-newlead-fake.png`, `settings-calling-number-fake.png`, `settings-change-email-fake.png`, `knowledge-url-tab.png`, `billing-topup-invalid.png`.
- Recommendation:
  - Build one shared validation layer (e.g. zod plus a form library) with E.164 phone validation, URL/email checks and min/max amounts (for example ₹100–₹1,00,000).
  - Show inline errors under fields with `aria-invalid`/`aria-describedby`.
  - Disable the primary action until the form is valid.
  - Never silently rewrite user input.

### QA-B-15 · Import CSV accepts any file with no pre-check or preview · medium · functional-bug
- Evidence:
  - Selecting `notes.txt` (wrong type) shows the file name and enables "Verify & import".
  - A CSV without a `phone` column behaves the same way, even though the dialog says "PHONE COLUMN REQUIRED".
  - No parse, preview or column mapping happens client-side. Reproduced twice with the .txt file.
  - The copy exposes internals: "Canonical columns … Extras you add are folded into metadata.extra."
- Screens: `va-qa-b/leads-importcsv-open.png`, `leads-import-txt.png`, `leads-import-nophone.png`, `leads-import-txt-repro.png`.
- Recommendation:
  - Validate the extension and MIME type on selection and on drop.
  - Parse the first rows client-side and show a preview table with column mapping and a row count.
  - Flag missing or invalid phones per row before enabling import.
  - Rewrite the helper copy ("Extra columns are saved as custom fields").

### QA-B-16 · Leads modals lack dialog semantics, a focus trap and labels, and Esc or a backdrop click discards input · medium · accessibility
- Evidence:
  - The New Lead and Import leads modals have no `role="dialog"`/`aria-modal`. `[role=dialog]` count = 0.
  - Focus is not trapped. After Cancel and Create lead, Tab moves to BODY and then the sidebar links behind the overlay.
  - New Lead inputs have no `<label for>`, `aria-label`, name or id ("NAME *" is plain text).
  - Placeholders use realistic example data ("Priya Sharma", "+91 98765 43210") in #7A8397 on white, about 3.8:1. They read like prefilled values.
  - Esc and a backdrop click both close New Lead. Reopening shows empty fields, so typed data is lost with no confirmation.
  - The lead drawer and the Call Details panel also lack dialog or complementary semantics.
- Screens: `va-qa-b/leads-newlead-open.png`, `leads-newlead-fake.png`.
- Recommendation: use one accessible Dialog primitive (Radix or Headless UI) with a focus trap, focus return, labelled title and associated labels. Confirm before discarding a dirty form, and use neutral placeholders ("Full name").

### QA-B-17 · Unsaved-changes handling is inconsistent, and Profile edits are lost silently · medium · ux
- Evidence:
  - On Profile, "Save Changes" is enabled before any edit and stays enabled.
  - After typing into Full name and Phone, clicking the "Organization" sub-nav navigated away with no prompt. No beforeunload or in-app dialog fired. The edits were discarded.
  - Call channel, by contrast, keeps "Save preference" disabled until something changes.
  - Notifications says "Changes save automatically" (a third pattern).
- Screens: `va-qa-b/settings-profile-dirty.png`, `settings-call-channel.png`, `settings-notifications.png`.
- Recommendation: pick one settings save model (explicit save with dirty tracking, a sticky "Unsaved changes" bar and a leave-guard, or autosave with a visible "Saved" state) and apply it to every sub-page.

### QA-B-18 · The Activity & Audit ledger is empty for an active account · medium · trust-safety
- Evidence:
  - `/settings/activity` shows "Nothing in this slice yet." for ALL and AUTH.
  - `/api/account/audit-log?limit=50` returns `rows: []` (and `action_bucket=auth` also returns empty).
  - The account has existed since 11 Aug, last signed in 26 Sept, has 5 knowledge uploads and a data export on 21 Sept.
  - The page promises "Every security-relevant event on your account… append-only ledger".
- Screens: `va-qa-b/settings-activity.png`, `settings-activity-daterange.png`.
- Recommendation: verify event emission for sign-in, export, upload and settings changes. Inferred: events are not being recorded. If collection only started recently, say so ("Recording since …").

### QA-B-19 · Internal and developer notes leak into user-facing copy and tooltips · medium · content-copy
- Evidence (observed text, paraphrased where long):
  - Leads language filter accessible name: "…Reads metadata.extra.language until a schema column lands."
  - Leads outcome filter: "…full-list join is a backend TODO."
  - Integrations: "Meta surfaces still create a stub row until app-review credentials are ready", "Two-way sync deferred to a follow-up", "create your own org from /admin/organizations".
  - Call channel: offers "Browser softphone" and "Auto", then states that they "fall back to PSTN until the in-browser softphone bridge ships", while a Rep Console softphone exists.
  - Knowledge: "Gemini text-embedding-004 (768-dimensional vectors)… pgvector".
  - Lead drawer: provider name "VOBIZ".
  - Knowledge files are listed by storage key with epoch prefixes (`1789987752864-…pdf`).
- Recommendation: run a copy pass. Move implementation detail to docs, rename provider badges ("Phone"), strip storage prefixes from file names, and hide or disable options that don't work yet with a "Coming soon" tag.

### QA-B-20 · Date, time and duration formats vary across pages · medium · consistency
- Evidence:
  - Analytics recent and Call Reports: "23 Sept, 06:13" (24 h, no year).
  - Lead drawer call history: "28 Aug, 11:45 pm" (12 h, lowercase).
  - Knowledge table and Data Export: "21/09/2026, 16:19:12" (DD/MM/YYYY with seconds).
  - Identity and lead drawer: "11 Aug 2026" / "Added 28 Aug 2026". Leads list: "28d ago".
  - Durations: "1m 18s" and "11s" (Analytics), "0:11" (Call Reports table) next to "11s" (Call Details panel of the same call), and "90s" (Call Reports KPI).
- Recommendation: create one `formatDateTime`/`formatDuration` utility (en-IN, IST, e.g. "23 Sep 2026, 06:13" and "1m 18s"). Show relative time with an absolute tooltip, and use the same format on every surface.

### QA-B-21 · Single-key "c" call shortcut and a one-click bulk "CALL 24" on real leads (inferred risk; not exercised) · medium · trust-safety
- Evidence:
  - The shortcut legend reads "c call". "a" selected all 24 leads, which showed a floating bar: "24 SELECTED · VIKASH/VAANI · AUTO-DETECT · DEFAULT FLOW · [CALL 24]".
  - No modifier key is needed, and the wallet is empty. Neither "c" nor CALL 24 was pressed, so whether a confirmation step exists is **unverified**.
  - The row focus from j/k is visual only: `document.activeElement` stays BODY and no `aria-selected` is set.
- Screens: `va-qa-b/leads-kbd-x.png`, `leads-kbd-a.png`.
- Recommendation: require a confirmation step showing the count and estimated cost for any outbound call, especially bulk calls. Move calling to a modified shortcut (Shift+C), disable it when the wallet is empty, and expose keyboard focus via roving tabindex.

### QA-B-22 · Every page has the same document title · low · accessibility
- Evidence: the title is "Vaani Labs - The Voice AI that speaks India" on Analytics, Leads, Call Reports, Settings sub-pages and the 404 page. Browser tabs and history entries cannot be told apart, and screen readers get no page-change cue.
- Recommendation: use per-route titles, e.g. "Leads · Vaani Labs" and "Page not found · Vaani Labs".

### QA-B-23 · The 404 page drops the app shell and sends signed-in users to the marketing site · low · ux
- Evidence:
  - `/this-does-not-exist` correctly returns status 404 with `noindex`, which is good.
  - But there is no sidebar. "Return Home" goes to `/`, the marketing homepage, even when signed in.
  - The footer reads "STATUS: DISCONNECTED", which suggests an outage.
  - The "404" glyphs have a clipped colour band at the top. Other unknown app routes (`/leads/xyz`, `/settings/nope`, `/call-reports/abc`) also return 404.
- Screen: `va-qa-b/docs-flows-404.png`.
- Recommendation: render the 404 inside the app shell for authenticated users. Offer "Go to Dashboard" and search, and drop the alarming status line.

### QA-B-24 · The wallet banner arrives late and shifts the page · low · performance
- Evidence: the banner appears about 2.9 s after navigation, once `/api/billing/wallet` resolves, and pushes all content down by the banner height (about 42 px). CLS measured 0.028 on Analytics, and the shift is visible when comparing `analytics-1.png` (no banner) with `analytics-full.png`.
- Recommendation: reserve the banner slot, or render it server-side from the session. Keep it out of the content flow (overlay or sticky), or show it only on money-relevant pages after first dismissal.

### QA-B-25 · Call Reports table details: missing "mixed" filter, wrong empty-state copy, duplicate headers · low · ux
- Evidence:
  - The sentiment chips are All, Positive, Negative, Neutral. There is no "Mixed" chip, although 3 of 50 calls are mixed, and 7 have no sentiment.
  - A zero-result search shows "No call records match the current search or filters. Calls appear here once your agents start dialing." The second sentence is wrong for a 121-call account.
  - Four columns are headed "Condition Check" with no disambiguation.
  - Sorting Duration ascending puts "—" (null) rows first. Headers are clickable but have no `aria-sort`.
  - Row actions "Re-analyze" and "Download CSV" sit on every row.
  - Sticky header works (thead `position: sticky`; the header stayed at y = 299 after a 1500 px scroll).
- Screens: `va-qa-b/callreports-search-empty.png`, `callreports-combo.png`.
- Recommendation: add Mixed and Unscored chips, split the empty-state copy (filtered vs truly empty, with a "Clear filters" button), label flow-field columns by node id or step number, sort nulls last, and add `aria-sort`.

### QA-B-26 · Knowledge: search error shown in the wrong card; CSV tab identical to Upload · low · ux
- Evidence:
  - Observed under simulated network failure: "Search failed — check network connection" appeared inside the **Upload Knowledge** card, about 500 px above the Test Knowledge Search box that triggered it.
  - The "CSV Data" tab shows the same native "Choose file · No file chosen" and "Upload & Embed" controls as "Upload Files".
  - The native unstyled file input clashes with the rest of the UI.
  - The list has no embedding-status column (every row offers "Embed").
- Screen: `va-qa-b/knowledge-search-blocked.png`.
- Recommendation: scope errors to their component. Give CSV its own guidance (column picker) or merge it into Upload. Add a status column (Embedded, Pending, Failed) and style the drop zone.

### QA-B-27 · Stale call statuses, and calls not linked to leads (partly inferred) · low · functional-bug
- Evidence:
  - Among the latest 50 calls, 4 are `queued` and 3 `in_progress`, all from days ago.
  - One lead's drawer shows "CALLS 1" with a single "QUEUED 28 Aug, 11:45 pm" entry a month old.
  - Analytics Recent shows many later outbound calls to the same masked number. Inferred: dashboard and browser calls are not attached to the lead record, so lead status stays "New" and Interest stays "—".
- Recommendation: add a reaper job that expires queued and in-progress calls and shows "Failed to connect". Match calls to leads by normalised phone number and update the lead timeline and status.

### QA-B-28 · Billing copy contradicts itself; amount chips give no feedback · low · content-copy
- Evidence:
  - The Manual Top-up card says "For automatic mandate-based recharge, use Pricing." The UPI Autopay card sits on the same page directly above it.
  - Meetings Billing labels "Pay as you go" as "Free · Unlimited included · then ₹2.40/min" while also saying "30 free min / month".
  - The ₹100, ₹500 and ₹1000 chips set the field but show no selected state (`aria-pressed` null).
  - "Pay with UPI" doesn't show the amount.
  - Billing inputs are labelled only by placeholder ("Top-up ₹", "Auto top-up ₹"), which makes two spinbuttons ambiguous: `getByRole('spinbutton', {name:'Top-up ₹'})` matched both.
- Recommendation: remove the Pricing reference, fix the PAYG copy, show the selected chip, label the CTA "Pay ₹500 via UPI", and add visible labels.

### QA-B-29 · Settings navigation mixes in-page tabs, separate routes and leaving the Settings shell · low · ia-navigation
- Evidence:
  - Profile, Meetings Billing and Docs are buttons with no URL (not deep-linkable).
  - Organization, Notifications, Calling number and similar are routes with a "BACK TO SETTINGS" link. Integrations shows it twice ("BACK TO SETTINGS" and "Back to Settings").
  - API Keys (`/api-keys`), Embed (`/api-keys/embed`) and Webhooks (`/webhooks`) leave Settings entirely, with no back link and no settings sub-nav.
  - Most sub-nav items carry an external-link icon even though they are internal.
  - Organization says "…or create your own org below", but only "Browse organizations" is below.
- Recommendation: make every sub-section a route under `/settings/*` rendered inside one persistent two-column Settings layout. Drop the external-link icons for internal pages and fix the Organization copy.

### QA-B-30 · Flow pickers list duplicate names · low · consistency
- Evidence: in the lead drawer "FLOW" select and the bulk-call bar, the same flow names appear twice (e.g. a real-estate flow "(v2)" twice, the airport support flow twice, the demo flow twice), and "Generated: … (v2)" is truncated. The Dashboard selector disambiguates only with a 6-character hash suffix.
- Recommendation: show the version, last-edited date and active badge; group by flow with versions nested; prevent duplicate names at creation.

---

## 3. Page-by-page notes (everything observed)

### /analytics
- Sections: §01 Identity (operator card and "ALLOCATED DID · PENDING · not allocated yet"), §02 Headline (4 KPI cards with sparklines and deltas: +200%, +70%, +2533%), §03 Sentiment (7D/30D/90D segmented control with `aria-pressed` and a tooltip such as "Last 90 days — currently selected. Bucket size: 1 day."), §04 Flow drop-off (expandable steps showing "RECENT CAPTURED VALUES"), §05 Intents, §06 Phone (DID "—", calls on line 0, empty hour-of-day heat strip, "No callers yet — share your number"), §07 Recent (10 rows that expand inline to Summary and Transcript preview plus "OPEN REPORT"), §08 Recordings ("No call recordings yet").
- The page is a fixed-height shell with an inner scroller (`div.relative.flex.flex-1.min-h-0.flex-col.overflow-y-auto`, scrollHeight 4446). A `fullPage` screenshot captures only the viewport. Print or "Export PDF" may be affected (inferred).
- The header "UPDATED 17:27", REFRESH, CSV and EXPORT PDF have aria-labels. Downloads were not tested.
- The range toggle (7D/90D) also re-fetches intents for the same window. On 7D, the WoW shift reads "not enough data".
- Flow drop-off: "38 CALLS ANALYSED". Step 01 shows "9 reached · 88.9% drop"; steps 02–07 show "1 reached · 0.0% drop" with repeated names (3× "Condition Check", 3× "Knowledge Lookup"). Legend: "colour warms with drop-off — peacock to red".
- No console errors. All 10 analytics API calls returned 200.

### /leads
- Header "LEADS · 24 SHOWN · 24 TOTAL"; Refresh, Export, Import CSV, New Lead. KPI strip: Open pipeline, New, Interested+, Avg interest. A shortcuts legend is always visible.
- The search is server-side (`/api/leads?search=`) and applied on fill. Esc cleared the query (focus stayed in the input). The "/" shortcut is advertised.
- Filters: status chips (All … Lost), source chips, and language and outcome selects. The empty state has an icon, "No leads match." and "Try clearing a filter, or import a CSV…". A small "CLEAR" link sits near the counter; there is no CTA inside the empty state.
- The list is div-based with vertical grid lines drawn through empty space. Columns: Lead, Status, Interest, Call. No sortable columns. The Interest column shows only "—".
- Region values are inconsistently cased ("Maharashtra" / "maharashtra"); this is data, but normalise on import.
- Row click opens a right-hand drawer that pushes the list: status badges, "Added 28 Aug 2026", Interest "—", CALLS 1, OUTBOUND CONFIG (voice VIKASH/VAANI, language, flow select), Call Now, "WA", CALL HISTORY, DELETE LEAD. None of these were clicked.
- Pagination: Prev/Next and "Page 1 of 1 · 1–24 of 24 leads"; per page 20/50/100/200. With 20 per page, Next worked (`offset=20`).

### /call-reports
- Plain sans visual language: "Call Reports · 121 calls" pill, subtitle, Refresh, Export CSV, 4 KPI cards, search "Search transcripts, summaries…", sentiment chips.
- Wide table with horizontal scroll (Type, To, Started ▼, Duration, Status, Sentiment, Summary, then about 10 flow-field columns, then row actions).
- Row click opens a "CALL DETAILS" right panel: dialed number, status, duration "11s", type, truncated call ID with no copy button, analysis (sentiment and satisfaction), summary, "FLOW BUILDER FIELDS" (not collected), "Re-analyze Transcript".
- Reload clears the search ("Hindi") and the chip filter (Positive).

### /knowledge
- "AGENT KNOWLEDGE" header with "Review proposals" (see QA-B-09) and Refresh. Stat cards: Knowledge files 5, Supported docs, AI Integration.
- Upload tabs: Upload Files, Paste Text (title max 100; body without maxlength), Website URL, CSV Data.
- The files table has pagination (20 per page). The deep link `?page=2&size=20` is clamped to page 1, which is acceptable with 5 files, but silent.
- "Test Knowledge Search" is a POST (blocked by the guard; see QA-B-26). A "How Knowledge Integration Works" explainer follows.

### /billing
- "BILLING" with Refresh. Wallet balance ₹0.00, Transactions 0.
- UPI Autopay card: "Inactive", "Auto top-up ₹" 500, "Enable UPI Auto-Debit", status lines.
- Manual top-up: chips ₹100/₹500/₹1000, amount field, "Pay with UPI".
- Billing history: "No transactions yet." Nothing was clicked except the chips and fields (see QA-B-14 and QA-B-28).

### /settings (17 sub-sections)
- **Profile:** identity card (status APPROVED), Full name, Phone, Subdomain (LIVE, with Edit), WhatsApp brochure (native file input with Upload disabled), Google account ("NOT CONNECTED"), Microsoft account. The global "Save Changes" sits in the header.
- **Organization:** non-admin message plus "Browse organizations".
- **Notifications:** email toggles (Call summaries, Low balance, Security alerts, Product updates). WhatsApp is LOCKED ("No number on file"). RESET TO DEFAULTS is disabled. Autosave, so it was not toggled.
- **Call channel:** radio group (PSTN, Browser softphone, Auto) with proper labels, a disabled "Save preference" and a "Heads up" note (QA-B-19).
- **Calling number:** 3-step verification (Owned, Compliance, Authorized) and "Send code" (QA-B-14).
- **Calendly:** "Connect Calendly" (OAuth, not clicked).
- **Security:** 2FA DISABLED with "Enable" (TOTP only).
- **Activity & Audit:** empty (QA-B-18). Filters: ALL, AUTH, ACCOUNT, FLOWS, API, BILLING, ADMIN, SECURITY, INTEGRATIONS, ORGS, KNOWLEDGE BASE, AGENTS, plus a DATE RANGE (FROM/TO) popover.
- **API Keys (`/api-keys`):** name, 4 scope checkboxes, rate-limit slider (1–600, recommended 60), "Mint key" (not clicked), "No keys yet".
- **Embed (`/api-keys/embed`):** editorial "VOL. I — ISSUE 04 / EMBED HANDBOOK" styling (QA-B-08).
- **Webhooks (`/webhooks`):** empty state plus signature docs ("X-VaaniVoice-Signature: sha256=<hex>").
- **Integrations:** Instagram, Facebook, WhatsApp, HubSpot and Salesforce, all "Connect …" buttons disabled for a non-admin. The explanation sits at the bottom of the page, far from the buttons.
- **Meetings Billing (in-page):** 29/30 free minutes left, plan cards (PAYG, Starter ₹499, Team ₹1,999, Business ₹5,999) and a 6-month usage bar.
- **Data Export:** most recent export READY (21/09/2026), "Request a new export" (not clicked).
- **Change Email:** current and new address fields; button enables on any input (QA-B-14).
- **Docs:** 5 links, 3 broken (QA-B-07).
- **Delete Account:** a well-designed guard (explains what is deleted and kept, 7-day reversibility, type-your-email confirmation, disabled "DELETE MY ACCOUNT"). One unlabeled icon-only button (empty text) is present.

### Global
- Back and forward across Billing → Leads → Call Reports → back → back → forward restored the correct pages and headings.
- Client-side navigation is fast (under 2.5 s including data at normal speed).
- The sidebar nav has no `aria-current` on the active item (covered by a11y agents).
- Dismissing the wallet banner persists across navigation within the session.
- 404 handling: see QA-B-23.

---

## 4. Strengths worth preserving
- Delete Account flow: clear consequences, reversible window, typed-email confirmation, destructive button disabled until confirmed.
- Real HTTP 404 status with `noindex` for unknown routes.
- Sticky table header on Call Reports; inline row expansion on Analytics "Recent" with summary, transcript preview and a link to the full report.
- Leads keyboard model (/ search, j/k, x, a, Esc) with an always-visible legend. Esc clears search and selection. The bulk bar shows the count.
- Empty states exist (Leads "No leads match.", Recordings "No call recordings yet", Webhooks "No webhooks yet") and are friendly in tone.
- The Analytics range control uses `aria-pressed` and a descriptive tooltip. The Call channel radio group has proper labels.
- Data Export page: status, size, timestamps and link-expiry explanation are transparent.
- Webhook signature documentation and the "plaintext shown once" API-key messaging are good developer UX.
- No uncaught JS exceptions on any tested page. All data GETs returned 200 on normal network.
- Destructive and billing actions consistently live behind explicit buttons; nothing auto-triggered writes during browsing (the guard recorded zero unexpected blocked writes).

## 5. Open questions
1. Does "c" or the bulk "CALL 24" show a confirmation before dialling? (Not exercised for safety.)
2. Are browser test calls billed per leg (two legs per conversation)?
3. Is the audit ledger expected to be empty for member-role accounts?
4. Does the Embed COPY button copy the clean snippet or the corrupted DOM text? (Clipboard read-back was empty.)
5. Should Call Reports KPIs cover all time or the loaded window? Which window is the Analytics "Headline"?

## 6. Artefacts
Screenshots (46) in `audit/screenshots/va-qa-b/`, including: analytics-1/full/s2–s5/flowstep-click/recent-row-click/sent-7d/sent-90d/open-report; leads-1/search-empty/filter-converted/page2-size20/page1-size20/deeplink-*/kbd-j/x/a/newlead-open/newlead-fake/importcsv-open/import-txt/import-nophone/import-txt-repro/drawer; callreports-1/scrolled/bottom/search-empty/combo/rowclick/deeplink-id; knowledge-1/url-tab/paste-tab/search-blocked/deeplink-p2/proposals/proposals-click; billing-1/topup-invalid; settings-hash-wallet/profile-bottom/profile-dirty/organization/notifications/call-channel/calling-number/calling-number-fake/calendly/security/activity/activity-daterange/api-keys/embed/webhooks/integrations/meetings-billing/docs/data-export/change-email/change-email-fake/delete; embed-snippet; docs-flows-404; throttle-callreports-1500ms/4500ms/7500ms; throttle-leads-early/late; offline-nav-knowledge/offline-refresh/offline-restored/offline-callreports-refresh.

Side effect to note: to test the Embed COPY button, `clipboard-read`/`clipboard-write` permissions were granted to the shared browser context for https://vaanilabs.in. They were not revoked, because `clearPermissions()` would also clear permissions other agents may rely on.
