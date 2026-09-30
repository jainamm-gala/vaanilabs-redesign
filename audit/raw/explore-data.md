# Vaani Labs: data and management surfaces (Explorer B)

Agent: `va-explore-data`. Product: https://vaanilabs.in (live production, real customer account, org "starvox labs", role shown as **member**).
Date of session: 2026-09-26. Viewport: 1440x900 (plus 390x844 checks). Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-explore-data/` (files prefixed `r2_` come from this run; files without the prefix come from the interrupted earlier run and were re-used after checking them against the live product).

Pages in scope: **/analytics, /leads, /call-reports, /knowledge (+ /knowledge/proposals), /billing**. I also checked where the global wallet banner CTAs lead (/settings#wallet, /settings#autopay).

Privacy: this report contains no lead, customer or caller names, phone numbers or emails. Leads are called "row 1", "lead 1" and so on. Customer business and flow names are replaced with generic labels ("a real-estate flow").

---

## 0. Session and login note (reply to the user's question)

The user asked whether they should give the agents something so they can sign in again each time the session expires.

- **Please do not share a password, OTP, magic link or session token.** The agents are not allowed to type credentials into a production site like vaanilabs.in, even with the user's permission. Anything pasted into chat would also end up in logs.
- In this run the browser stayed signed in the whole time (no `LOGGED_OUT`, no auth errors). The harness preamble also extends the Supabase auth cookies on each call. The usual cause of a sign-out is the shared browser being reset, for example after a tool call that runs longer than 60 seconds. It is not normally caused by the token expiring.
- Options that keep working without anyone watching the screen:
  1. The user signs in once in the automation browser and leaves that window open. Agents never close or navigate the user's own tab.
  2. If the user owns this product, run unattended audits against a local or staging build (`localhost`, `*.test`) with a seeded test account. Agents may use test credentials from the project's seed or fixture files there, but never on production.
  3. Increase the refresh-token or session lifetime in the project's own auth settings (Supabase "JWT expiry" and refresh-token reuse) so short breaks do not expire the session. This is a change the owner makes, not the agent.

---

## 1. Method

- Worked only in a private Playwright window. A network guard blocked every non-GET request, all websockets, analytics and payment calls, and all downloads. Nothing was submitted, saved, uploaded, embedded, re-analysed, exported or dialled.
- On each page I captured structure (DOM and accessibility properties), computed styles (font family, size, colour, letter-spacing), layout metrics, and screenshots, and viewed every screenshot.
- I exercised: range toggles, row click, drawers, modals (inspect only), keyboard shortcuts (`/`, `J`, `X`, `A`, `Esc`; never `C`), filters, search (including empty results), sort, horizontal scroll, the knowledge tabs, and client-side validation with fake values ("abc", "not-an-email", 0, 999999999).
- Anything behind a blocked POST is marked **"observed under simulated network failure"**. Those failures come from our guard and are not product bugs, but I describe how the UI reports them.
- Contrast ratios were computed with the WCAG 2.x formula from computed colours.

---

## 2. Product understanding (these surfaces)

Vaani Labs sells AI voice agents ("Vaani", female/warm, and "Vikash", male/direct) that place and answer phone calls in Indian languages. Each call follows a visual **flow** built in Flow Builder. The five pages audited here are the "after the call" and "keep the lights on" side of the product.

| Page | What it is | Primary jobs | Data | Links to other pages |
|---|---|---|---|---|
| **/analytics** ("the dispatch from your line") | Long editorial report page with 8 numbered sections: §01 Identity, §02 Headline, §03 Sentiment, §04 Flow, §05 Intents, §06 Phone, §07 Recent, §08 Recordings | Check how the line is performing, why people call, where they drop out of a flow, and how calls felt | 121 lifetime calls, 24 this week, avg 1m 18s, 158 minutes; sentiment stacked area; flow step drop-off for one flow (38 calls analysed); 9 intent clusters over 97 calls (30D); recent 10 calls; recordings (none) | "Open report" in a recent row goes to Call Reports; DID card says to "allocate a number from billing" (the Billing page cannot do this, see F-21); header has CSV / Export PDF |
| **/leads** | Lightweight CRM list of people for the agent to call | Find, filter, select and call leads (single or bulk); add a lead; import a CSV/XLSX; review one lead's config and call history | 24 leads, all status NEW, source mostly Manual/Demo; KPIs Open pipeline 24, New 24 (100%), Interested+ 0, Avg interest "—" | Drawer: voice (Vikash/Vaani), language, flow (every Flow Builder flow), Call Now, WhatsApp, call history (provider + status). Bulk bar: voice, language, flow, "CALL n" |
| **/call-reports** | Call-by-call table plus a detail panel | Audit individual calls: summary, sentiment, extracted flow fields, transcript, recording; search transcripts; filter by sentiment; re-analyse; export | 121 calls, avg 90s, Positive 4, Negative 10; 50 rows rendered; 17 columns incl. 10 dynamic "extracted field" columns | Detail: Key elements extracted, Analysis (sentiment, satisfaction, topics, AI suggestions), Flow Builder fields, Re-analyze Transcript, "Learn from this call" (probably feeds Knowledge proposals, inferred), Recording, Transcript, Export This Call |
| **/knowledge** | RAG knowledge base for the voice agent | Add knowledge (file, pasted text, website URL, CSV), see files, (re)embed or delete, test retrieval, review AI-proposed knowledge | 5 files (PDF/TXT/DOCX), 2–274 KB | "Review proposals" goes to /knowledge/proposals, which redirects to /dashboard (F-02) |
| **/billing** | Prepaid INR wallet | See balance, set up UPI autopay (Razorpay mandate), manual UPI top-up, billing history | ₹0.00, 0 transactions, autopay INACTIVE, auto top-up ₹500 | Global "Wallet empty" banner on every page, whose CTAs point to /settings#wallet and /settings#autopay rather than /billing (F-01) |

Cross-page facts that matter for a redesign:
- Page chrome is shared (72px icon rail, wallet banner 42px tall, inner scroll container `div.overflow-y-auto`, so `document.scrollingElement` never scrolls). Each page's content has its own visual language (see F-06).
- The same entity is described differently on each page. A call is "INBOUND/OUTBOUND" in Analytics and "BROWSER" in Call Reports, with duration "1m 27s", "1:27" or "87s". A lead's "Interest" is empty everywhere.
- On mobile (<768px) the icon rail is replaced by a bottom tab bar with 7 items: Assistant, Agent, Leads, Reports, Billing, Knowledge, **Exit**.

---

## 3. Page-by-page observations

### 3.1 /analytics
Screenshots: `r2_analytics_top.png` (loading), `analytics_sentiment_7d.png`, `analytics_s800.png` (30D chart and flow), `analytics_sentiment_90d_chart.png`, `analytics_s1600.png` (intents), `analytics_intent_examples.png`, `analytics_s2400.png` (phone), `analytics_s3200.png` / `analytics_s3700.png` (recent, recordings), `analytics_flow_step_click.png`, `analytics_flow_bar_zoom.png`, `analytics_recent_row_click.png`, `analytics_info_tooltip.png`, `analytics_refresh_during.png`, `r2_m_analytics.png`.

- **Header** (sticky): icon tile, H1 "ANALYTICS" (Sora 15px/700, letter-spacing 2.7px, uppercase), italic serif tagline "the dispatch from your line", "UPDATED 16:34" (JetBrains Mono 10px, 3px tracking, #7A8397), buttons REFRESH / CSV / EXPORT PDF. CSV and Export PDF were not clicked.
- **Section headings** use Sora 27.2px/800 with a numbered "§ 01" mono prefix and an Instrument Serif 16px italic tagline in #7A8397 ("— who is on the line", "— this past week, in numerals", "— how the calls felt", "— where they hang up", "— why they called", "— the geography of your line", "— the latest ten", "— hear the line itself"). A 1px rule runs to the right. The page is 4,446px tall inside an 858px scroll container.
- **§01 Identity**: operator card (avatar initials, name, email, company, agent, plan "—", role "member", since date) and "ALLOCATED DID — not allocated yet" with a PENDING pill. While loading, the avatar shows "·", Agent shows "—", and the DID card reads "Inbound voice agent — callers reach your Vaani agent here." After load it changes to "Allocate a number from billing to start receiving calls." (content flash plus wrong destination, F-21).
- **§02 Headline**: 4 KPI cards (TOTAL CALLS 121 with sparkline, THIS WEEK 24 +200%, AVG DURATION 1m 18s +70%, TOTAL MINUTES 158 +2533%). Loading state is "• • •". The section tagline says "this past week", but TOTAL CALLS is lifetime (its tooltip says "Lifetime count of every call placed to…" and is clipped, F-12).
- **§03 Sentiment**: "LAST 30D" label plus a 7D / 30D / 90D segmented control (JetBrains Mono 10px; active 30D #2F5FE0 on a 10% tint). Stacked area chart (red/teal/gold/green) with y-axis "calls / day". Tick values are uneven: 7D 0/3/5/8/10, 30D 0/12/24/35, 90D 0/12/24/35/47. Only 3 x labels. There is no legend. The "WOW SHIFT" chips (positive 0pp, neutral −25pp, negative +13pp, mixed +10pp) double as the legend. At 7D the chips read "not enough data". In the 7D screenshot a "Last 7 days —" tooltip overlaps the toggle.
- The range toggle **also changes §05 Intents** (7D: "WINDOW 7D · 21 CALLS ANALYSED"; 30D: "WINDOW 30D · 97 CALLS ANALYSED"). It does **not** change §04 Flow (38 calls in every range) or §02 Headline (F-10).
- **§04 Flow**: title is a flow name with "(v2)" and "38 CALLS ANALYSED"; legend "colour warms with drop-off — peacock to red". There are 7 step rows (buttons). Step 01 "Confirm Interest QUESTION — 9 reached · 88.9% drop" (drop in red). Steps 02–07 read "Condition Check" ×3 and "Knowledge Lookup" ×3, each "1 reached · 0.0% drop". **Each row's bar is a 1105×8px track with transparent background and no fill element** (F-05). Clicking a step expands "RECENT CAPTURED VALUES" (raw caller utterances in Devanagari/Hinglish), and the hover tooltip explains the maths ("9 of 38 calls reached this step. 88.9% of those who reached it dropped off here. Click to see recent captured field values.").
- **§05 Intents**: meta line "WINDOW 30D · 97 CALLS ANALYSED", italic "last computed 21 Sept, 16:31, next 21 Sept, 17:01", and a REFRESH button (would POST; not clicked). There are 9 intent rows, each with a coloured dot, a label truncated at ~115px (F-15), a gradient bar with "28 · 28.9%" inside it, "EXAMPLES ⌄", and keyword chips. EXAMPLES expands 3 example calls with date and AI summary. Its "Hide example calls" tooltip covers the section's REFRESH button (`analytics_intent_examples.png`).
- **§06 Phone**: DID "—", CALLS ON LINE 0, UNIQUE CALLERS 0, ACTIVE SINCE —, a HOUR-OF-DAY bar strip (24 empty pale bars), and RECENT CALLERS "NO DATA — No callers yet — share your number —". §07 shows inbound calls exist, so the zeros read as a contradiction unless you know they count only DID calls (F-20).
- **§07 Recent — the latest ten**: columns FROM → TO / STARTED / DURATION / END / SENTIMENT. Rows come in pairs at the same minute, one "— → — INBOUND" and one "— → +91••••••XXXX OUTBOUND" (browser test calls logged twice, inferred). Status pill "COMPLETED" (outlined green, mono 9px). A row click expands inline: SUMMARY (italic serif), TRANSCRIPT PREVIEW (mono), and "OPEN REPORT ›".
- **§08 Recordings — LAST 20**: "private bucket — links expire in 1 hour"; "NO DATA — No call recordings yet." Footer: "VAANI ANALYTICS · MUMBAI · 2026".
- Tooltips (the "ⓘ" after each label, and header buttons) are about 70px wide and wrap one word per line. The REFRESH tooltip runs to 16 lines, and the KPI tooltip is clipped by the card (F-12).
- Mobile 390px: header actions overflow to x=543px (CSV and Export PDF are off-screen, causing sideways scroll) (F-16).

### 3.2 /leads
Screenshots: `r2_leads_top.png`, `r2_leads_bottom.png`, `r2_leads_search_empty.png`, `r2_leads_row_click.png`, `r2_leads_drawer_bottom.png`, `r2_leads_kbd_jx.png`, `r2_leads_kbd_selectall.png`, `r2_leads_newlead_modal.png`, `r2_leads_newlead_validation.png`, `r2_leads_import_csv.png`, `r2_leads_filter_contacted.png`, `r2_leads_filter_two.png`, `r2_leads_focus.png`, `r2_m_leads.png`.

- URL: `/leads?page=1&size=50`. Filters are **not** put in the URL (F-11).
- **Header**: H1 "LEADS" (uppercase, tracking 0.2em), sub "24 SHOWN · 24 TOTAL"; actions REFRESH, EXPORT, IMPORT CSV (teal outline), NEW LEAD (solid blue). EXPORT was not clicked.
- **KPI strip** (4 cells): OPEN PIPELINE 24, NEW 24 (100%), INTERESTED+ 0 (0%), AVG INTEREST "—". These **recompute for the current filter or search**. With a no-match search all go to 0 and the subtitle says "0 SHOWN · 0 TOTAL".
- **Shortcut legend** (always visible, also on mobile): `/` SEARCH · `J / K` NAV · `X` SELECT · `A` SELECT ALL · `C` CALL · `ESC` CLEAR.
- **Search**: "Search by name, phone, or email… (press / to focus)". `/` focuses it (verified). Server-side, with a "24 / 24 SHOWN" counter and "⟋ CLEAR" when active.
- **Filters**: STATUS chips ALL / NEW / CONTACTED / INTERESTED / SCHEDULED / CONVERTED / NOT INTERESTED / LOST (single-select, active = blue tint). SOURCE chips ANY / MANUAL / DEMO / FACEBOOK / INSTAGRAM / GOOGLE / API (active = teal tint). Two native selects: "Any language" (Hindi, English (IN), Tamil, Telugu, Marathi, Bengali) and "Any outcome" (Completed, Failed, No answer, Busy). **The selects' tooltips are developer notes** (F-03). Chips are `type=submit` buttons with no `aria-pressed`. There are no per-chip counts.
- **List**: div-based grid, no `<table>` or `role=row`, rows 65px tall. Cells: checkbox (no label), avatar initials with source glyph, name (Sora 15px), masked phone "+91••••••XXXX", location (mixed "Maharashtra" / "maharashtra"), "28d ago"; then STATUS pill "NEW" (9px teal on 10% tint, 3.32:1), INTEREST (empty for all 24), CALL icon button (aria-label "Call <name> (c)"). Between the lead cell (ends ~430px) and STATUS (x=1166) there is about **730px of empty space** with the page's background grid lines showing through (F-08).
- **Pagination**: "‹ PREV · Page 1 of 1 · 1–24 of 24 leads · NEXT ›" and PER PAGE 20/50/100/200. The filter bar becomes sticky when scrolling.
- **Empty (no match)**: inbox icon, "No leads match.", "Try clearing a filter, or import a CSV to seed your pipeline."
- **Row click** opens an inline right-hand `<aside>` about 440px wide (no dialog role or label). It is sticky at top 42px with height 900px inside an 858px viewport, so the bottom 42px is always clipped. Contents: status pill + source, name, "Added 28 Aug 2026", phone (link), INTEREST "—" (red dash), CALLS 1, OUTBOUND CONFIG (voice VIKASH/VAANI segmented, LANGUAGE select, FLOW select listing all 16 flows, several with **identical names**), "Call Now" (blue, 38px) + "WA" (title "Send WhatsApp"), CALL HISTORY (provider name "VOBIZ", status "QUEUED", 28 Aug 11:45 pm, a queued call a month old), DELETE LEAD (10px red text on a 5% red tint, bottom at y=926 in a 900px viewport). When the list scrolls, the drawer's header (name) goes under the sticky filter bar, so you lose which lead you are editing (F-09). Esc did not close it within 500ms.
- **Keyboard**: J/J moved a visible focus ring to row 2 and X checked it. The **bulk bar** (floating, 766px wide, bottom-centre) shows "1 SELECTED · VIKASH/VAANI · AUTO-DETECT ⌄ · DEFAULT FLOW ⌄ · × · CALL 1". `A` selected all 24 ("CALL 24"). Esc cleared the selection (0 checked). The header checkbox shows the indeterminate state correctly. **The only bulk action is calling** (F-07).
- **New lead modal** (`r2_leads_newlead_modal.png`): title "New lead", sub "ONE AT A TIME — FOR BULK, USE CSV". Fields: NAME* (placeholder "Priya Sharma"), PHONE* (type=tel, placeholder "+91 98765 43210"), EMAIL (type=email), CITY, REGION / STATE, SOURCE (Manual, Demo, Facebook, Instagram, **WhatsApp**, Google, API), STATUS (New, Contacted, Interested, Scheduled, Converted, Not interested, **no Lost**), NOTES. Buttons Cancel / Create lead. Name is focused on open and Esc closes (good). **No role=dialog or aria-modal; labels not associated with inputs; phone accepts "abc"** (validity true); email "not-an-email" invalid only via the native bubble on submit; no inline errors on blur; Create stays enabled (F-13). Not submitted.
- **Import leads dialog** (`r2_leads_import_csv.png`): "CSV / XLSX · PHONE COLUMN REQUIRED". Step 1 Template: "Canonical columns: name, phone, email. Only phone is required. Extras you add are folded into metadata.extra." with a Template.csv download (not clicked). Step 2 Upload: drop zone ".CSV · .XLSX · MAX 5 MB", accept=".csv,.xlsx,.xls". Close / Verify & import (disabled until a file is chosen). The button that opens it says "IMPORT CSV" even though XLSX is accepted.
- Mobile 390px (`r2_leads_mobile`): header actions become icon-only; KPIs 2×2; the shortcut legend still shows; chip rows scroll sideways with visible scrollbars; language/outcome selects are off-screen; the list keeps only lead + call columns (status hidden).

### 3.3 /call-reports
Screenshots: `r2_callreports_top.png`, `r2_callreports_hscroll.png`, `r2_callreports_bottom.png`, `r2_callreports_detail.png`, `r2_callreports_detail_mid.png`, `r2_callreports_detail_low.png`, `r2_callreports_negative_sorted.png`, `r2_callreports_search_empty.png`, `r2_m_callreports.png`.

- **Header** (a different style from every other page): "Call Reports" in title case, a "121 calls" pill, subtitle "Recordings, transcripts, sentiment & extracted flow fields", Refresh, Export CSV (solid blue; not clicked).
- **KPI cards**: Total Calls 121, Avg Duration **90s**, Positive 4, Negative 10. These **do not change** with filters or search, unlike Leads.
- **Search** "Search transcripts, summaries…" (full-width). "transfer" gave 3 calls. Sentiment chips: All / Positive / Negative / Neutral, with **no "Mixed"** even though Analytics tracks mixed. Negative gave 10 rows, which matches the KPI.
- **Table**: a real `<table>`, 2,617px wide inside a 1,358px scroller that is 601px tall (its own vertical scroll, sticky `thead`). Headers are Hanken Grotesk 13px #7A8397; cells system-ui 14px. Columns: Type ("BROWSER" pill for every row), To, Started ▼, Duration (m:ss), Status (COMPLETED pill), Sentiment (NEUTRAL/NEGATIVE pill with icon), Summary (2-line clamp), then **10 dynamic extracted-field columns** (Confirm Interest, Condition Check ×3, Additional Assistance, Condition Check (Residential), Emergency Check, a second custom field, Knowledge Lookup, Schedule Visit), then a row-actions column (Re-analyze, only on some rows, plus a download icon). Most extracted cells are "—". Filled cells hold raw utterances ("No", "residential", short Devanagari phrases). **No sticky first column**, so after scrolling right you cannot tell which call a cell belongs to (F-04).
- 50 rows rendered for 121 calls. **No pagination, "load more" or infinite scroll** appeared after scrolling to the bottom (F-04; inferred that 71 calls are unreachable from this table).
- **Sort**: clicking Duration sorts ascending ("Duration ▲") with null "—" rows first. No `aria-sort`.
- **Row click** opens a right panel (`w-96`, 373px) and the table shrinks to 984px. Panel content (2,504px tall, scrolling in a 601px area):
  CALL DETAILS ×; DIALED NUMBER "—"; STATUS COMPLETED; DURATION "87s" (the table says 1:27); TYPE "browser"; CALL ID "a4d6811c-0ff…" (truncated, no copy); **KEY ELEMENTS EXTRACTED** table (QUESTION / FIELD, ANSWER, TIME) where the "question" is the agent's whole utterance squeezed into about 90px (one word per line); "● = matched flow field"; **ANALYSIS** (NEGATIVE pill, "Satisfaction: low", summary paragraph); TOPICS chips; AI SUGGESTIONS bullets; **FLOW BUILDER FIELDS** "CONDITION CHECK: not collected / CONFIRM INTEREST: not collected / KNOWLEDGE LOOKUP: not collected" (contradicts the answers above); Re-analyze Transcript; Learn from this call; RECORDING "No recording is available for this call."; TRANSCRIPT "18 turns" (turn cards "ASSISTANT • 2S" / "USER • 15S", in a nested `max-h-96` 384px scroller); Export This Call. None of these actions were clicked.
- Esc does not close the panel. After a no-match search the panel **stays open** showing a call that is no longer in the results.
- **Empty (no match)**: document icon, "No calls found", "No call records match the current search or filters. Calls appear here once your agents start dialing." (the second sentence belongs to the no-data state). Export CSV becomes disabled (good).
- Row-button tooltip: "Re-run AI analysis from scratch (force=true)" (F-03).
- Mobile 390px: **the search input collapses to 54px** and its placeholder is cut to "S"; the table needs about 2,600px of sideways scrolling.

### 3.4 /knowledge
Screenshots: `r2_knowledge_top.png`, `r2_knowledge_tab_text.png`, `r2_knowledge_tab_url.png`, `r2_knowledge_tab_csv.png`, `r2_knowledge_search_result.png`, `r2_knowledge_bottom.png`, `r2_knowledge_proposals_click.png`.

- URL `/knowledge?page=1&size=20`. Header "AGENT KNOWLEDGE" (uppercase sans), buttons "Review proposals" (link to `/knowledge/proposals`) and Refresh.
- 3 info cards: KNOWLEDGE FILES 5 · SUPPORTED DOCS "PDF, CSV, TXT, DOCX, URLs, Text" · AI INTEGRATION "Embeddings → RAG-powered voice agent".
- **Upload Knowledge**: "Add knowledge from files, text, websites, or CSV data. Content is chunked, embedded with Gemini, and indexed for real-time AI retrieval." Four toggle buttons (not ARIA tabs):
  - Upload Files: native unstyled "Choose file | No file chosen" + "Upload & Embed" (disabled until a file is chosen).
  - Paste Text: "Document title (optional)" + textarea "Paste your text content here… (product info, FAQs, policies, scripts, etc.)" + "Save & Embed" (disabled when empty).
  - Website URL: type=url "https://example.com/about" + "Fetch & Embed", with helper text "The page content will be scraped, saved as text, and embedded into your knowledge base."
  - CSV Data: **looks the same as Upload Files** (native file input + "Upload & Embed"), with no CSV guidance.
  Placeholders are very light grey on a grey-filled field.
- **File table**: FILE / SIZE / UPDATED / ACTIONS. File names are **storage keys with a 13-digit epoch prefix** ("1789…-<original>.pdf", "…-pasted-text-1788515896518.txt"). Dates are "21/09/2026, 16:19:12". Every row has an "Embed" (teal outline) button and a "Delete" (grey) button. There is **no status** (embedded? chunk count? failed?). Pagination "Page 1 of 1 · 1–5 of 5 files", PER PAGE 20. Embed and Delete were not clicked.
- **Test Knowledge Search**: "Test what your AI agent would find when asked a question. Uses the same vector search as live calls." Input + blue Search. Searching sends `POST /api/knowledge/search`, which our guard blocked. Under the simulated failure, the error "Search failed — check network connection" (12px, #D0463A) was rendered **inside the Upload Knowledge card at y=60**, scrolled out of view, while the input sits at y=578, so the user sees nothing happen (F-18).
- **How Knowledge Integration Works** (green info card, mono 11px): 7 numbered steps including "Gemini text-embedding-004 (768-dimensional vectors)", "pgvector", and "only YOUR documents, never other users'".
- **Review proposals**: clicking it (SPA) and deep-linking both land on `/knowledge/proposals` and are **immediately redirected to /dashboard** with no message (F-02). The account role is "member", so the page may be admin-only (inferred).

### 3.5 /billing
Screenshots: `r2_billing_top.png`, `r2_billing_topup_validation.png`, `r2_billing_bottom.png`, `r2_m_billing.png`, `r2_settings_wallet_anchor.png`.

- Header "BILLING" + Refresh. The wallet-empty banner still shows on this page.
- Cards: WALLET BALANCE **₹0.00** · TRANSACTIONS **0** "All transaction history is shown below".
- **UPI AUTOPAY — Auto-debit wallet top-up**: "Enable once, and Razorpay UPI mandate automatically recharges your wallet." Number input (value 500, placeholder "Auto top-up ₹", no label) + "Enable UPI Auto-Debit" (solid blue). Status is shown twice: an INACTIVE pill and "Status: INACTIVE". Then "Auto top-up amount: ₹500.00 · Last charged: — · Mandate confirmed: —".
- **MANUAL TOP-UP — Recharge wallet with UPI**: "Recharge instantly using UPI. For automatic mandate-based recharge, use Pricing." ("Pricing" is plain text, and autopay is the card directly above.) Presets ₹100 / ₹500 (selected, blue) / ₹1000, number input (placeholder "Top-up ₹", no label, min 1, no max), "Pay with UPI" (solid blue). Validation: typing 0 is silently coerced to 1; 999,999,999 is accepted; Pay stays enabled; no ₹ prefix or thousands separator.
- **Billing history**: "No transactions yet."
- Missing: per-minute rates, usage or consumption (Analytics shows 158 minutes used with ₹0 and 0 transactions, unexplained), invoices or GST details, and number (DID) rental.
- Body copy is JetBrains Mono 12px (#3E475A, 9.32:1, readable but tiring); labels mono 10px blue.
- **Banner CTAs**: "Top up" goes to `/settings#wallet` and "Enable autopay" goes to `/settings#autopay`. Both land on **Profile Settings**, which has no `#wallet` or `#autopay` element (F-01).

---

## 4. Findings

Severity: critical = blocks a core task, loses data, or is a serious accessibility barrier · high = major friction or clearly unprofessional · medium = noticeable · low = polish.

### EXPLORE-DATA-01 · The wallet banner's Top up / Enable autopay go nowhere useful · high · functional-bug / ia
- **Evidence**: on every page the banner links are `Top up -> /settings#wallet` and `Enable autopay -> /settings#autopay`. Both open Settings on the Profile tab (`r2_settings_wallet_anchor.png`), and `document.getElementById('wallet')` / `('autopay')` are null. The Settings sub-nav has no Wallet item (only "Meetings Billing"). The working wallet is at /billing.
- **Impact**: the most-shown CTA in the app (the account balance is ₹0, so calls cannot run) lands on an unrelated form with a "Save Changes" button.
- **Recommendation**: point the CTAs at `/billing#topup` and `/billing#autopay`, scroll to and highlight the card, and pre-focus the amount. Consider opening top-up in a modal from any page.

### EXPLORE-DATA-02 · "Review proposals" silently redirects to the dashboard · high · functional-bug
- **Evidence**: `/knowledge` → "Review proposals" (href `/knowledge/proposals`) → navigation log `/knowledge/proposals` → `/dashboard` (`r2_knowledge_proposals_click.png`). The same happens on a direct load. There is no toast and no explanation. The account role is "member", so a role gate is possible (inferred).
- **Recommendation**: if the page is role-gated, hide or disable the button with a reason ("Only admins can review proposals"). Otherwise fix the route. Never redirect to an unrelated page without a message. Show a count badge ("3 proposals") so the entry point earns its place.

### EXPLORE-DATA-03 · Developer notes and internals shipped in the UI · high · content-copy
- **Evidence**:
  - Leads language select `title`: "Filter by lead's preferred language. Reads metadata.extra.language until a schema column lands."
  - Outcome select `title`: "Filter by most-recent call outcome. Populated as you open lead drawers; full-list join is a backend TODO."
  - Call Reports row button `title`: "Re-run AI analysis from scratch (force=true)".
  - Import dialog: "Extras you add are folded into metadata.extra."
  - Knowledge: "Gemini text-embedding-004 (768-dimensional vectors)", "pgvector".
  - Lead drawer call history shows the telephony vendor "VOBIZ".
- **Recommendation**: rewrite in user language ("Extra columns are kept as custom fields"; "Re-run analysis"). Move model and vector-store details to docs. Show the channel ("Phone call") rather than the vendor.

### EXPLORE-DATA-04 · Call Reports table: 2,617px wide, no anchor column, only 50 of 121 calls reachable · high · ux
- **Evidence**: 17 columns in a 1,358px scroller (`r2_callreports_hscroll.png`). Type/To/Started are not sticky, so extracted-field values lose their row identity. There are three columns called "Condition Check". Most extracted cells are "—", and filled ones are raw utterances ("No", "you are"). Row actions sit at x≈2,450. 50 `tbody tr` for "121 calls", with no pager or load-more after scrolling to the bottom.
- **Recommendation**: pin Started, To and Sentiment on the left and actions on the right. Collapse extracted fields into one "Captured" column (chips) with a column picker. Label duplicate fields with their node path ("Condition Check · step 3"). Add pagination or virtual scrolling with a "1–50 of 121" counter.

### EXPLORE-DATA-05 · Flow drop-off bars have no fill; step names are ambiguous · high · functional-bug / visual
- **Evidence**: each step row contains a single 1105×8px bar element with `background: transparent`, and no fill child was found (`analytics_flow_bar_zoom.png`), including "9 reached · 88.9% drop". Six of seven steps are called "Condition Check" or "Knowledge Lookup". The legend "colour warms with drop-off — peacock to red" describes colours that never appear.
- **Recommendation**: render a real funnel (reached vs dropped, with widths relative to the calls entering the flow). Show a node id or short label per step and link each step to that node in Flow Builder.

### EXPLORE-DATA-06 · Each data page uses a different visual system · high · consistency / design-system
- **Evidence**:
  - Analytics: Sora 27px/800 headings + Instrument Serif italic taglines + JetBrains Mono 9–10px uppercase labels with 2–3px tracking + "§ 0n" numbering.
  - Leads: mono, uppercase, tracked, "terminal" look.
  - Call Reports: title-case Hanken Grotesk / system-ui with no mono.
  - Knowledge and Billing: uppercase sans H1 + mono body paragraphs at 12px.
  - Dates: "23 Sept, 06:13" / "21/09/2026, 16:19:12" / "28 Aug 2026" / "28 Aug, 11:45 pm".
  - Durations: "1m 27s" (Analytics) / "1:27" (table) / "87s" (panel) / "90s" (KPI).
  - Active chip colour: blue (status) vs teal (source).
  - Three different page-header patterns.
- **Recommendation**: one type scale (a sans for UI and data, mono only for IDs and numbers), one page-header component, one KPI card, one table component, and shared formatters for dates, durations and currency.

### EXPLORE-DATA-07 · Leads bulk selection offers only one action: "CALL n" · medium · ux / trust-safety
- **Evidence**: `A` selects all 24; the floating bar shows "24 SELECTED · VIKASH | VAANI · AUTO-DETECT · DEFAULT FLOW · × · CALL 24" (`r2_leads_kbd_selectall.png`). There is no bulk status change, export, tag, assign or delete. A mass outbound dial to real customers is one click (or the `C` shortcut) away. Not clicked, so whether a confirmation step exists is unknown (inferred risk). The wallet is ₹0.
- **Recommendation**: add bulk Set status / Export / Add to campaign / Delete. Require a confirmation for any call to more than one lead, showing count, estimated cost and wallet balance (and block with a top-up prompt when the balance is ₹0). Do not bind a single-letter shortcut to a multi-call.

### EXPLORE-DATA-08 · Leads list layout wastes width and hides useful data · medium · visual / ux
- **Evidence**: the lead cell ends at about 430px and STATUS starts at 1166px, leaving about 730px of empty space with the page grid showing through (`r2_leads_top.png`). The INTEREST column is empty for all 24 rows. All 24 leads show NEW even though calls happened (a queued call and 121 calls in total). Location casing is inconsistent. Rows are 65px, so about 8 fit at 900px. The grid is div-based, with no table or row semantics.
- **Recommendation**: use a real table with columns for Last call (date + outcome), Next action, Language, Source, Owner and Status. Auto-advance status from call outcomes. Offer a compact density. Hide columns that are empty for the whole org.

### EXPLORE-DATA-09 · The lead drawer loses context and clips its bottom · medium · ux / a11y
- **Evidence**: the `<aside>` is sticky at top 42px with height 900px inside an 858px viewport, so DELETE LEAD ends at y=926. The name and header scroll under the sticky filter bar. There is no dialog role or accessible name. "WA" is cryptic (title "Send WhatsApp"). The Flow select lists duplicate flow names with no version or hash (Agent View disambiguates with "· 9115a2"). Call history shows "QUEUED" from 28 Aug. DELETE LEAD is 10px text on a 5% tint, in the same panel as Call Now. Esc did not close the drawer within 500ms.
- **Recommendation**: use a full-height drawer with its own scroll, a sticky header (name, status, close) and a sticky footer (Call, WhatsApp). Move Delete into a "…" menu with confirmation. Show flow names with version and last-edited date. Mark stale queued calls as failed or expired.

### EXPLORE-DATA-10 · The Analytics range toggle's scope is unclear · medium · ux
- **Evidence**: the 7D/30D/90D control sits inside the Sentiment card but also changes §05 Intents (21 vs 97 calls). It does not change §04 Flow (38 calls in every range) or §02 Headline ("this past week", plus a lifetime total).
- **Recommendation**: move one global range picker to the page header and have every section state its window, or give each section its own labelled control.

### EXPLORE-DATA-11 · Leads filters are not in the URL, and the counts mislead · medium · ux
- **Evidence**: after choosing CONTACTED + FACEBOOK the URL stays `/leads?page=1&size=50`. The subtitle switches to "0 SHOWN · 0 TOTAL" (the total should stay 24). The KPIs change to the filtered set on Leads but stay global on Call Reports. Chips have no `aria-pressed`.
- **Recommendation**: sync filters and search to query params. Show "0 of 24". Label KPIs as "in view" or "all". Use `aria-pressed` or a radio group for chips. Show counts on the status chips.

### EXPLORE-DATA-12 · Tooltips are about 70px wide and get clipped · medium · visual
- **Evidence**: the header REFRESH tooltip wraps to one word per line, about 16 lines (`analytics_refresh_during.png`). The TOTAL CALLS tooltip is cut off inside the card ("Lifetime count of every call placed to…", `analytics_info_tooltip.png`). The "Hide example calls" tooltip covers the Intents REFRESH button.
- **Recommendation**: use tooltips of at least 240px, rendered in a portal (not clipped), with collision detection.

### EXPLORE-DATA-13 · The New Lead modal has no accessible labels and weak validation · medium · accessibility
- **Evidence**: the container has no `role=dialog` or `aria-modal`. The 8 inputs have no `for`/`id` association, no wrapping label and no `aria-label`, so screen readers announce unnamed fields. The phone field (type=tel, no pattern) accepts "abc". Email errors appear only as the native bubble on submit, with no inline or on-blur messages. Placeholders use realistic personal values ("Priya Sharma", "+91 98765 43210") in #7A8397 and can be mistaken for prefilled data. Status options omit "Lost" (the filters have it). Source options include WhatsApp (the filters don't).
- **Recommendation**: proper dialog semantics, associated labels, E.164/Indian mobile validation with inline errors, neutral placeholders ("Full name", "10-digit mobile"), and one shared list of statuses and sources.

### EXPLORE-DATA-14 · Small, low-contrast mono labels across all 5 pages · high · accessibility
- **Evidence**: muted label #7A8397 = 3.80:1 on white and 3.52:1 on #F4F6FA, used at 9px (Leads table headers), 10px (chips, "UPDATED", range toggle) and 11px (identity labels), all with 2–3px letter-spacing. The NEW status badge (9px teal on a 10% tint) is 3.32:1. "NO DATA" (9px, 60% blue) is 2.59:1. All fail WCAG AA 4.5:1.
- **Recommendation**: minimum 12px for labels and 13–14px for data. Muted text at least #5F6B80 (≥4.5:1 on #F4F6FA). Reduce tracking to at most 0.06em. Status pills need at least 4.5:1.

### EXPLORE-DATA-15 · Intent names are truncated despite plenty of room · medium · visual
- **Evidence**: the label box is about 115px with `text-overflow: ellipsis`, while full names need 182–236px ("Appointment Scheduling", "Emergency & Medical Assistance"). There is no `title` and no tooltip, and the bar area beside it is about 900px wide.
- **Recommendation**: give labels at least 240px (or let them wrap to 2 lines), move the count and percentage outside the bar, and add a hover or tooltip with the full name.

### EXPLORE-DATA-16 · Mobile breakpoints break the data pages; mobile nav includes Exit · medium · responsive
- **Evidence** (390px):
  - Call Reports search input is 54px wide, showing only "S" of the placeholder (`r2_m_callreports.png`).
  - Analytics header actions overflow to x=543px, causing sideways scroll (`r2_m_analytics.png`).
  - Leads shows the keyboard-shortcut legend on touch, chip rows with visible scrollbars, and the language/outcome selects off-screen (`r2_m_leads.png`).
  - The bottom tab bar has 7 items including **Exit** (sign out) as a primary tab. Analytics, Flow Builder, Settings, Meet Agent, Personal Agents and Rep Console have no mobile entry point.
- **Recommendation**: stack search above the chips; turn header actions into an overflow menu; hide the shortcut legend on touch; use a filter sheet; use 4–5 tabs plus "More" (with Settings and Sign out inside More).

### EXPLORE-DATA-17 · Same metrics and entities disagree across pages · high · content-copy / trust-safety
- **Evidence**:
  - Avg duration is **1m 18s** in Analytics and **90s** in Call Reports, for the same 121 calls.
  - Call type is INBOUND/OUTBOUND in Analytics and BROWSER in Call Reports.
  - §06 Phone shows 0 calls and 0 callers while §07 lists inbound calls.
  - 158 minutes consumed, yet ₹0 balance and 0 transactions, with no explanation.
  - Duration is 1:27 in the table and 87s in the detail panel.
- **Recommendation**: one metrics service with shared definitions (mean vs median, completed-only or all), each shown with its definition in a tooltip. One enumeration for call channel and direction. A usage ledger that reconciles minutes with wallet debits or free credits.

### EXPLORE-DATA-18 · Test Knowledge Search shows its error off-screen · medium · ux
- **Evidence** (observed under simulated network failure): Search sends `POST /api/knowledge/search`. The failure message "Search failed — check network connection" (12px #D0463A) renders in the Upload card at y=60, above the viewport, while the input is at y=578. There is no inline message or toast next to the search.
- **Recommendation**: show loading, result and error states directly under the search input, and announce them with `role=status` / `aria-live`.

### EXPLORE-DATA-19 · Knowledge files show storage keys and no indexing status · medium · ux
- **Evidence**: names like "1788515896795-pasted-text-1788515896518.txt". Every row has an "Embed" action and nothing tells you whether the file is embedded, how many chunks it has, or whether it failed. The native "Choose file / No file chosen" input is unstyled. The "CSV Data" tab looks the same as "Upload Files". The mode buttons are not ARIA tabs. Dates are dd/mm/yyyy HH:MM:SS.
- **Recommendation**: show the original title (editable) and type icon, a Status column (Indexed · n chunks / Processing / Failed – retry), and "Re-index" only when needed. Use a styled dropzone, one "Upload file" mode with CSV guidance, and ARIA tabs.

### EXPLORE-DATA-20 · Analytics shows contradictory or empty data states · medium · content-copy
- **Evidence**: §06 HOUR-OF-DAY has 24 empty bars and CALLS ON LINE 0 while there are 121 calls (they count only DID calls, inferred). §08 says "No call recordings yet" while 121 calls exist. §07 lists each browser test call twice (INBOUND "— → —" and OUTBOUND). The FROM → TO column is often "— → —".
- **Recommendation**: label the scope ("Inbound calls to your number — none yet, number not allocated") with a CTA. Collapse the two legs of a call into one row. Explain why recordings are missing (recording off? browser calls not recorded?).

### EXPLORE-DATA-21 · The DID card sends users to Billing, which cannot allocate numbers · medium · ia-navigation
- **Evidence**: §01 card: "not allocated yet · PENDING — Allocate a number from billing to start receiving calls." /billing has only wallet, autopay, top-up and history. Numbers live under Settings → Calling number (from the orchestrator's scouting). During load the text first reads "Inbound voice agent — callers reach your Vaani agent here." (content flash).
- **Recommendation**: link the card directly to the number-allocation flow, and use a skeleton instead of placeholder copy while loading.

### EXPLORE-DATA-22 · Billing lacks prices, usage, labelled amount fields and a clear primary action · medium · ux
- **Evidence**: no per-minute or per-feature rates, no usage breakdown, no invoices or GST. The amount inputs have placeholder text only (no label), accept 999,999,999, and turn 0 into 1 without telling you. There are two equally strong blue primaries (Enable UPI Auto-Debit and Pay with UPI). The copy "For automatic mandate-based recharge, use Pricing" contradicts the autopay card directly above and is not a link. Status appears twice. The wallet-empty banner also shows on /billing itself.
- **Recommendation**: add a "What it costs" panel and a usage ledger with downloadable invoices. Use labelled currency inputs (₹ prefix, min/max, inline errors). Make one primary action (top up) and put autopay in a secondary card. Suppress the banner on /billing.

### EXPLORE-DATA-23 · The call detail panel is cramped, nested-scrolling and badly ordered · medium · ux
- **Evidence**: a 373px panel with 2,504px of content in a 601px scroll area. The transcript is in a nested 384px scroller at the very bottom, after analysis, AI suggestions, flow fields and action buttons. The Key-elements "question" column is about 90px, so text wraps one word per line. "FLOW BUILDER FIELDS: not collected" contradicts the captured answers shown above. The Call ID is truncated with no copy button. The close × has no accessible name. Esc does nothing. The panel stays open after its row is filtered out (`r2_callreports_search_empty.png`).
- **Recommendation**: use a wide drawer (at least 640px) or a dedicated /call-reports/:id page with tabs (Summary · Transcript + player · Extracted data · Actions). Keep one scroll. Put the recording player at the top. Close on Esc and when the row disappears. Add a Copy ID button.

### EXPLORE-DATA-24 · Call Reports filter and empty-state details · low · content-copy
- **Evidence**: the no-match copy includes "Calls appear here once your agents start dialing" even though 121 calls exist. The header "121 calls" and the KPIs ignore filters. Sorting by Duration puts null "—" rows first. There is no `aria-sort`. There is no "Mixed" sentiment chip.
- **Recommendation**: use separate copy for no-data and no-match, show "3 of 121" when filtered, put nulls last, add `aria-sort`, and align the sentiment categories with Analytics.

### EXPLORE-DATA-25 · The sentiment chart is hard to read · low · visual
- **Evidence**: tick values are uneven (0/3/5/8/10; 0/12/24/35/47), there are only 3 date labels, and there is no legend (the WoW chips double as one). In the 7D view the hover tooltip overlaps the range toggle.
- **Recommendation**: use "nice" ticks (0/5/10), add a legend with totals per sentiment, show at least 5–7 date ticks, and anchor the tooltip to the data point.

### EXPLORE-DATA-26 · The week-over-week chips colour by sign, not by meaning · medium · visual
- **Evidence**: "negative +13pp" is green rgb(23,138,85) and "neutral −25pp" is red rgb(208,70,58). A rise in negative sentiment is shown as good.
- **Recommendation**: colour by desirability (negative up = red, positive up = green, neutral grey) and add an arrow icon so colour is not the only cue.

### EXPLORE-DATA-27 · Missing semantics in list and navigation components · low · accessibility
- **Evidence**: the 25 Leads checkboxes have no accessible name. Sidebar links have `title` but no `aria-current` on the active page. The Leads grid has no table or row roles. The drawer, the call detail panel and the New Lead modal are not dialogs or labelled regions. The icon-only close buttons have no `aria-label`. Focus is the browser default only ("auto 0.8px").
- **Recommendation**: add `aria-label="Select <lead>"`, `aria-current="page"`, table semantics, labelled dialogs and regions, and a visible 2px focus ring token.

---

## 5. Strengths worth keeping

1. **Leads keyboard model**: `/` focuses search, J/K move a clear focus ring, X/A select, Esc clears. The legend is on screen and the header checkbox shows the indeterminate state correctly. Rare and valuable for high-volume operators.
2. **Phone masking by default** ("+91••••••0319") on Leads, Analytics and Call Reports. Privacy-first, which matters for Indian DPDP compliance.
3. **Import dialog**: a clear two-step layout (template, then upload), limits stated up front (CSV/XLSX, 5 MB, phone required), and a disabled CTA until a file is chosen.
4. **New Lead modal** is short, marks required fields, focuses Name on open and closes on Esc.
5. **Call Reports search** covers transcripts and summaries. The detail panel's AI summary, topics, satisfaction and "AI suggestions" are useful coaching material. Transcript turns have timestamps.
6. **Analytics explains itself**: "ⓘ" tooltips on every metric, "last computed / next" times on Intents, a flow step that expands into recent captured values, a recent row that expands inline with summary, transcript preview and "Open report", and an "UPDATED hh:mm" stamp.
7. **Empty states have copy and a next step** ("No leads match. Try clearing a filter, or import a CSV…"). Export CSV disables when there is nothing to export.
8. **Sticky table header** (Call Reports) and **sticky filter bar** (Leads).
9. Billing presets (₹100/₹500/₹1000) with a custom amount keep top-up to about 2 taps.
10. The Knowledge "How it works" card and "Test Knowledge Search" build trust in the RAG pipeline. Keep the idea but rewrite it for business users.

---

## 6. Open questions

- Is `/knowledge/proposals` role-gated (the account is "member") or broken?
- Does "CALL n" in the Leads bulk bar ask for confirmation, and does it check the wallet? (Not clicked.)
- Why are 158 minutes consumed with ₹0 balance and 0 transactions (free credits? not billed?)
- Are the 71 calls beyond the first 50 reachable in Call Reports by some control I did not find?
- Does the Leads "outcome" filter really depend on which drawers the user has opened (per its tooltip)? If so, its results are incomplete by design.
- Are browser test calls logged twice on purpose (one inbound and one outbound leg)?
- What do "Learn from this call" and intent REFRESH do? (Both POST; not clicked.)

---

## 7. Screenshot index (this agent)

`C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-explore-data/`
- Analytics: `r2_analytics_top.png`, `analytics_top.png`, `analytics_s800.png`, `analytics_s1600.png`, `analytics_s2400.png`, `analytics_s3200.png`, `analytics_s3700.png`, `analytics_sentiment_7d.png`, `analytics_sentiment_7d_chart.png`, `analytics_sentiment_30d.png`, `analytics_sentiment_90d.png`, `analytics_sentiment_90d_chart.png`, `analytics_sentiment_hover.png`, `analytics_flow_step_click.png`, `analytics_flow_bar_zoom.png`, `analytics_intent_examples.png`, `analytics_recent_row_click.png`, `analytics_info_tooltip.png`, `analytics_refresh_during.png`, `r2_m_analytics.png`
- Leads: `r2_leads_top.png`, `r2_leads_bottom.png`, `r2_leads_search_empty.png`, `r2_leads_row_click.png`, `r2_leads_drawer_bottom.png`, `r2_leads_kbd_jx.png`, `r2_leads_kbd_selectall.png`, `r2_leads_newlead_modal.png`, `r2_leads_newlead_validation.png`, `r2_leads_import_csv.png`, `r2_leads_filter_contacted.png`, `r2_leads_filter_two.png`, `r2_leads_focus.png`, `r2_m_leads.png`
- Call Reports: `r2_callreports_top.png`, `r2_callreports_hscroll.png`, `r2_callreports_bottom.png`, `r2_callreports_detail.png`, `r2_callreports_detail_mid.png`, `r2_callreports_detail_low.png`, `r2_callreports_negative_sorted.png`, `r2_callreports_search_empty.png`, `r2_m_callreports.png`
- Knowledge: `r2_knowledge_top.png`, `r2_knowledge_tab_text.png`, `r2_knowledge_tab_url.png`, `r2_knowledge_tab_csv.png`, `r2_knowledge_search_result.png`, `r2_knowledge_bottom.png`, `r2_knowledge_proposals_click.png`
- Billing and banner: `r2_billing_top.png`, `r2_billing_topup_validation.png`, `r2_billing_bottom.png`, `r2_m_billing.png`, `r2_settings_wallet_anchor.png`

Browser status at end: **ok** (signed in throughout). My window was closed at the end. The guard blocked only analytics (posthog) calls and the single intended `POST /api/knowledge/search`. No unexpected writes were attempted by harmless actions.
