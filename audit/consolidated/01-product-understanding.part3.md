#### C. Build

| Route / sub-view | Purpose | Key components | Key actions | Notable states |
|---|---|---|---|---|
| **`/flow-builder`**, "Flow Builder" | A React Flow node-graph editor for the call script. Every flow runs from **Start Call** to **End Call**. | **Header:** a flow switcher pill and a status chip ("Up to date").<br><br>**Toolbar:** AI draft, Settings, Undo/Redo, Copy/Paste, Validate (shield), Preview AI script (eye), Full-screen (F), Shortcuts (?), More (…), Private, Destructive actions (trash), **Save** (Ctrl+S), **ACTIVATE** ("Activate this flow for all your calls").<br><br>**Left:** the node palette.<br><br>**Canvas:** a "● FLOW VALIDATED" badge, the minimap, and "Editing <label>".<br><br>**Right:** a 320 px property panel. | Open or switch flows. Add, connect, configure and delete nodes. Validate. Preview. Save. Activate. Export or import JSON. | <ul><li>Auto-loads the flow the Cockpit has selected: 26 nodes and 27 links, with 15 speak, 1 question, 3 condition, 3 knowledge, 1 transfer, 1 WhatsApp, plus start and end.</li><li>Fires `PUT /api/flows/<id>` on open with no user action (FLOW-CONFIG-02, UX-AUDIT-01).</li><li>Every edit autosaves into that same record, so there is no draft/live split (FLOW-CONFIG-01).</li><li>The status chip misreports save state (FLOW-CONFIG-03).</li><li>The badge is static (UX-AUDIT-03, FLOW-CONFIG-04).</li><li>There is no Live marker (FLOW-CONFIG-07).</li></ul> |
| ↳ "All flows" modal (switcher) | Choose a flow | Search ("Search 16 flows…"). Columns NAME, CATEGORY (Custom / Scheduling / General), LAST EDITED, OPEN. Pagination. | Open | <ul><li>3 pairs of identical names.</li><li>"(v2)/(v3)/(v6)" copies are separate, unlinked flows.</li><li>AI-draft names end in a literal "...".</li><li>No Active, visibility or current-row marker, no row actions, and an unclear sort order (FLOW-CONFIG-06, UX-AUDIT-06).</li></ul> |
| ↳ Palette "Add steps" | Choose node types | "Start here" (8), "Recently used", Conversation (Speak, Question, Branch, Human Handoff, Verify Customer), Actions (Book Meeting, WhatsApp), Knowledge & CRM (Knowledge Query, FAQ, CRM Lookup), search, a "+ 10" count pill | Click to add | <ul><li>New nodes drop at the viewport centre, stacked and unconnected (FLOW-CONFIG-05).</li><li>7 of 13 tile labels are truncated (FLOW-CONFIG-24).</li><li>Each type goes by 3–4 names across palette, canvas, panel and toast (FLOW-CONFIG-13).</li></ul> |
| ↳ Node types (property panel) | Configure one step | See the node reference table below. | Edit. Changes apply live and autosave. Delete Node. | <ul><li>Most fields are not validated (FLOW-CONFIG-17).</li><li>No variable picker (FLOW-CONFIG-12).</li><li>Outcomes are positional: bottom handle for YES/TRUE, right handle for NO/FALSE (FLOW-CONFIG-11).</li><li>The raw node ID and position are shown (FLOW-CONFIG-14).</li><li>A dominant red "Delete Node" button (FLOW-CONFIG-15).</li></ul> |
| ↳ Validate panel | Structural check | "N FLOW VALIDATION ERRORS", each with a **Jump** button | Jump to node | <ul><li>Checks connectivity only.</li><li>The saved flow has 2 errors, and the product's own default template has 1.</li><li>ACTIVATE stays enabled regardless.</li></ul> |
| ↳ Flow settings drawer | Per-flow identity and security | Name, Description, **Soul.md** (6,000-character persona prompt), Consented voice verification (speech window, score thresholds, fallbacks, fraud action, sensitive-action list) | Edit (autosaves) | <ul><li>A blank name is accepted (FLOW-CONFIG-09).</li><li>No language, voice, calling hours, retries or visibility settings (FLOW-CONFIG-20).</li></ul> |
| ↳ AI draft drawer | Generate a flow from a prompt | A single-line prompt (≤500 characters) and Generate (up to 90 s) | Generate | Replaces the canvas "as a private draft" with no choice of replacing versus creating a new flow (FLOW-CONFIG-19). |
| ↳ More (…) menu | Flow lifecycle | Export JSON, Import JSON, **New flow**, **Reset to default** | New flow instantly swaps in the default 8-node template | <ul><li>No name, template choice or confirmation.</li><li>The template fails validation.</li><li>The template's script preview says "Duration: undefined minutes" (FLOW-CONFIG-08).</li></ul> |
| ↳ Preview AI script / Shortcuts / Full-screen | Inspect, get help, focus | A generated system prompt in a scroll box. The shortcut list. A full-screen canvas. | Close, F, Esc | Preview is the only "test" inside the builder (FLOW-CONFIG-10). Full-screen has no visible exit (FLOW-CONFIG-22). |
| **`/knowledge?page=1&size=20`**. Rail: "Knowledge". H1: "AGENT KNOWLEDGE". | The RAG knowledge base the voice agent draws on | <ul><li>3 info cards (file count, supported types, "Embeddings → RAG").</li><li>**Upload Knowledge** with 4 modes: Upload Files, Paste Text, Website URL, CSV Data.</li><li>A file table (FILE, SIZE, UPDATED, ACTIONS: Embed and Delete) with pagination.</li><li>**Test Knowledge Search**.</li><li>A "How Knowledge Integration Works" card.</li><li>Review proposals and Refresh.</li></ul> | Upload & Embed, Save & Embed, Fetch & Embed, re-embed, delete, run a test search | <ul><li>5 files, shown under storage-key names with no index status (EXPLORE-DATA-19, UX-AUDIT-23).</li><li>The search error renders off-screen (EXPLORE-DATA-18).</li><li>Copy names the embedding model and pgvector (UX-AUDIT-10).</li></ul> |
| ↳ `/knowledge/proposals` | Review knowledge the AI has proposed (probably fed by "Learn from this call", *inferred*) | none rendered | none | Redirects to `/dashboard` immediately with no message. It is probably role-gated for "member" accounts *(inferred)* (EXPLORE-DATA-02). |

**Node reference (Flow Builder property panel).** Palette name → default canvas label.

| Node | Fields (defaults) | Outcomes |
|---|---|---|
| Start / End (fixed) | Label only. Cannot be deleted. | 1 out / none. End has no disposition, closing line or post-call action. |
| Speak → "New Speak Node" | Message, with helper text "Use {{lead_name}} and {{company_name}}" | 1 out |
| Question → "New Question" | Question text | YES (bottom) / NO (right). No "unclear" path and no answer capture. |
| Branch → "Condition Check" | A free-text natural-language condition | TRUE / FALSE |
| Knowledge Query → "Knowledge Lookup" | Knowledge file (optional; "All knowledge documents" or one file), search hint | 1 out |
| CRM Lookup → "Live Lookup" | Connector (empty: "create one in Integrations → Live Lookup"), lookup-by field | 1 out, even though the node has "no_match" behaviour |
| Book Meeting → "Schedule" | Prompt, duration (30m), type (Phone call), free-text slots, confirmation email **on**, WhatsApp reminder off, **Google Calendar on** | 1 out |
| WhatsApp → "Send WhatsApp" | Template (Visit Confirmation, No-Answer Follow-up, Custom), attachment (none, "User's Brochure (auto)", Custom URL) | 1 out |
| Human Handoff → "Transfer Call" | Transfer number (E.164, or "leave blank to use context") | 1 out, with no failed or no-answer path |
| Verify Customer | Question, source, field, match mode, attempts (2) | VERIFIED / FAILED |
| FAQ | Linked file or owned Q&A entries | 1 out |

#### D. Review

| Route / sub-view | Purpose | Key components | Key actions | Notable states |
|---|---|---|---|---|
| **`/call-reports`**. H1: "Call Reports". Mobile: "Reports". | Audit calls one by one | <ul><li>Header: "121 calls" pill, Refresh, Export CSV.</li><li>KPI cards: Total, Avg duration (90s), Positive, Negative.</li><li>Search across transcripts and summaries.</li><li>Sentiment chips: All / Positive / Negative / Neutral.</li><li>A 17-column `<table>`: Type, To, Started, Duration, Status, Sentiment, Summary, then **10 dynamic extracted-flow-field columns**, then row actions.</li></ul> | Search, filter, sort, open a row, Re-analyze, export | <ul><li>Only 50 of 121 rows render, with no pager (EXPLORE-DATA-04).</li><li>KPIs and the pill ignore filters.</li><li>Rows can't be reached by keyboard (UX-AUDIT-09).</li><li>Every call is typed "BROWSER" and appears as a pair of rows.</li></ul> |
| ↳ Call detail panel (373 px) | Everything about one call | Call details (dialed number, status, duration, type, truncated Call ID), Key elements extracted, Analysis (sentiment, satisfaction, summary), Topics, AI suggestions, Flow Builder fields, Re-analyze Transcript, **Learn from this call**, Recording, Transcript (n turns), Export This Call | Re-analyze, learn, export | <ul><li>The transcript comes last, in a nested scroller.</li><li>"Flow Builder fields: not collected" contradicts the extracted answers shown above it.</li><li>The panel stays open after its row is filtered out (EXPLORE-DATA-23).</li></ul> |
| **`/analytics`**, "ANALYTICS" ("the dispatch from your line") | An editorial report on how the line is performing | Header: Updated time, Refresh, CSV, Export PDF. Sections §01–§08 (see the list below this table). | Change range (7D/30D/90D), expand a step, show intent examples, expand a recent call, Refresh, export | <ul><li>The range toggle changes §03 and §05 only (EXPLORE-DATA-10).</li><li>The drop-off bars have no fill (EXPLORE-DATA-05).</li><li>The number card sends users to Billing, which cannot allocate numbers (EXPLORE-DATA-21, UX-AUDIT-27).</li><li>§06 and §08 show zeros that contradict §07 (EXPLORE-DATA-20).</li><li>Avg duration disagrees with Call Reports (EXPLORE-DATA-17).</li></ul> |

**Analytics sections:**

- **§01 Identity:** operator card, plan "—", role, and the allocated number, which shows as PENDING.
- **§02 Headline:** 121 total calls, 24 this week, average 1m 18s, 158 minutes.
- **§03 Sentiment:** a stacked-area chart with week-over-week chips.
- **§04 Flow:** step drop-off for one flow, based on 38 calls.
- **§05 Intents:** 9 clusters, with examples and a refresh.
- **§06 Phone:** number calls, hour of day, recent callers.
- **§07 Recent:** the last 10 calls, each expandable, with an "Open report ›" link.
- **§08 Recordings:** none.

#### E. Money

| Route / sub-view | Purpose | Key components | Key actions | Notable states |
|---|---|---|---|---|
| **`/billing`**, "BILLING" | A prepaid INR wallet | <ul><li>Wallet balance and transaction count.</li><li>**UPI Autopay**: a Razorpay mandate with auto top-up of ₹500, "Enable UPI Auto-Debit", and status (INACTIVE, shown twice), last charged, mandate confirmed.</li><li>**Manual top-up**: presets ₹100 / ₹500 / ₹1000, an amount field, "Pay with UPI".</li><li>Billing history.</li></ul> | Top up, enable autopay | <ul><li>₹0.00, 0 transactions, autopay inactive.</li><li>No rates, usage, invoices, GST or number rental (EXPLORE-DATA-22, UX-AUDIT-08).</li><li>Amounts are not validated (0, −50 and 9,999,999 are all accepted).</li><li>"use Pricing" points to something that doesn't exist.</li><li>The wallet banner still shows on this page.</li><li>A ₹0.00 placeholder appears before the real data loads.</li></ul> |
| ↳ Settings › **Meetings Billing** (an in-page tab with no URL) | Plans for meeting minutes | <ul><li>Usage "29 / 30 min", "then ₹2.40/min", current plan "Pay as you go".</li><li>4 plan cards, including ₹499/mo and ₹1,999/mo.</li><li>A 6-month usage chart.</li><li>"Open wallet → /billing".</li></ul> | Upgrade (not clicked) | <ul><li>The only place billing and plans connect.</li><li>The cards are cramped, and the PAYG copy contradicts itself.</li><li>The chart has no bars (EXPLORE-SETTINGS-10).</li></ul> |
