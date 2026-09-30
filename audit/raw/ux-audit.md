# Vaani Labs (vaanilabs.in): UX audit of journeys, CTAs, feedback and states

Agent: `va-ux-audit` (UX Auditor, journeys / CTAs / feedback / states)
Date: 2026-09-26 (second, complete run; replaces the partial draft from the interrupted first run)
Scope: authenticated app at https://vaanilabs.in (not .tech), 1440×900 desktop
Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-ux-audit/`

---

## 0. Session status and method notes

- **Browser status: OK for the whole run.** My private guarded window opened `/dashboard` signed in and stayed signed in through about 45 short calls. It was never redirected to `/login`. No call timed out. I closed my window at the end.
- **What happened in the first run (for context).** On first load the session had already expired. The app showed "Loading…", then a blank page for about 5 to 7 s, then went to `/login` with no reason and no return URL (`01_dashboard.png`, `00_redirected_to_login.png`). The auth cookies (`sb-access-token`, `sb-refresh-token`) are **session cookies**, so they are lost whenever the automation browser restarts. The harness preamble now copies them into 12 h cookies. That is the likely reason this run survived. The user's question ("should I give you something so you can log in each time?") is answered in the structured summary. Short version: do not share credentials. I will not type passwords into a production site. Keep one signed-in browser profile alive instead.
- **Guard behaviour.** My tab was read-only. Every POST/PUT/DELETE, all websockets, PostHog and Razorpay were aborted. When I describe a save or search failing, it is labelled **"observed under simulated network failure"**. The failure itself is caused by our guard and is **not** a product bug. How the UI *communicates* the failure is what I evaluate.
- **Unexpected writes the guard caught** (important):
  1. `PUT /api/flows/f9b04a18-…` fired **on simply opening `/flow-builder`** with no interaction. This happened 3 times, once on every load.
  2. `PUT /api/flows/f9b04a18-…` fired again **within 700 ms of adding one node** (autosave).
  3. `POST /api/profile/presence` and a LiveKit websocket (`wss://vaanilabs.in/livekit/rtc/v1?access_token=…`) fired **on simply visiting `/rep-console`**.
  4. `POST /api/knowledge/search` fired for "Test knowledge search". This one is expected and was user-initiated.
- **Things I did not do (by rule):** click Save, ACTIVATE, CONNECT, Test Call, any call button, Create Room, Start Task, Create lead, Pay, Enable autopay/UPI, Send code, Import, Upload, Delete, or the Flow Builder trash / "Destructive actions" menu. For those I evaluated the state right before the click and what the user would face next.
- **Privacy:** lead names, phone numbers and emails are not reproduced. "Lead row 1" etc. are used instead.
- Contrast figures in §3.4 were sampled from the orchestrator's 1440×900 captures in the first run (PIL, approximate lower bounds). The colours were re-checked visually against this run's screenshots and have not changed.

---

## 1. Product context (verified live)

Vaani Labs sells AI voice agents ("Vaani", female/warm; "Vikash", male/direct) that place and receive phone calls by following node-based call flows. Around this core the app offers:

- **Agent Cockpit** (`/dashboard`): a live console for test calls.
- **Leads CRM** (`/leads`): 24 leads, all NEW. It has a bulk-call bar and a lead detail panel with outbound config.
- **Flow Builder** (`/flow-builder`): 16 flows. It autosaves, has a validator, an AI draft generator and flow settings (Name, Description, "Soul.md", Consented voice verification).
- **Call Reports** (`/call-reports`): 121 calls. It has a search, a detail side panel (analysis, flow fields, recording, transcript) and actions to re-analyse or learn from a call.
- **Analytics** (`/analytics`).
- **Meeting Agent** (`/meeting-agent`): video rooms, 29/30 free minutes, 1 active room, 5 past meetings.
- **Personal Agents** (`/personal-agents`): goal-based autonomous tasks, 0 tasks so far.
- **Rep Console** (`/rep-console`): a browser softphone.
- **Knowledge** (`/knowledge`): 5 files, with test search and proposals.
- **Billing** (`/billing`): wallet ₹0.00, UPI autopay (inactive), manual top-up.
- **Settings**: 17 items. Call channel and Calling number open as full pages.
- **Assistant** (`/assistant`): chat that "plans, then acts on your data".

Onboarding state API (`GET /api/onboarding/state`) returns: `current_step: 5, completed_steps: [1,2,3,5], skipped: false, completed_at: 2026-09-03`. So an onboarding flow exists. This org finished it with **step 4 never completed**, and nothing in the app surfaces that.

---

## 2. Method

1. Walk each of the 9 journeys in a private guarded window at 1440×900 as a returning customer. First-run was evaluated from the landing state, the onboarding API and the login capture.
2. For every step, take a screenshot, read it, and pull DOM facts: button disabled/title/aria, input value vs placeholder, label association, element sizes and positions, timing of late-rendering elements.
3. Probe client-side validation with obviously fake values ("abc", "12345", "not-an-email", "0", "-50", "9999999"), then clear.
4. Observe feedback under simulated failure (guarded writes) and note where and how the UI reports it.
5. Reuse the first run's static observations only where re-verified live. Items not re-verified are marked.

---

## 3. Cross-cutting observations

### 3.1 App shell and navigation

- **Rail**
  - The default rail is **72 px, icon-only**, with 12 items and no group headers.
  - Labels exist only as native `title` tooltips: they appear after a delay and never on keyboard focus.
  - The expand button (tooltip "Expand sidebar · [") opens a **239 px labelled rail** (`14_sidebar_expanded.png`). That version is clear and fits all 12 items plus the footer at 900 px. The collapsed default clips the 12th item (Settings) at 900 px and shows its own ◂ ▸ ▾ scroll arrows (`10_dashboard_live.png`).
- **Naming drift between nav and pages**

  | Nav label | Route | Page title |
  |---|---|---|
  | "Agent View" | `/dashboard` | "AGENT COCKPIT" |
  | "Meet Agent" | `/meeting-agent` | "Meeting Agent — Vikash" |
  | "Knowledge" | `/knowledge` | "AGENT KNOWLEDGE" |

  The mobile bottom nav (in the DOM) uses a third set of labels: "Agent", "Reports", "Exit" (= sign out).
- **Rail footer**
  - Collapsed: a green dot and "12ms".
  - Expanded: "SYS:ONLINE 13ms".
  - Hidden DOM text reads "SYS: ONLINE | LAT: 14ms | RGN: Mumbai-1" plus the signed-in email.
  - The sign-out icon (title "Sign Out") sits directly above the theme toggle, with no label in collapsed mode.
  - The dot stays **green "ONLINE" even while Rep Console reports "Offline / Could not connect"**.
- **Wallet banner**
  - "Wallet empty — top up now to keep calls flowing." is 42 px tall, uses `role=alert`, and appears on every page, including Billing.
  - It renders **about 2.7 s after DOMContentLoaded**, measured on `/flow-builder`, and pushes the page down 42 px (layout shift).
  - Its **"Top up" links to `/settings#wallet`** and **"Enable autopay" links to `/settings#autopay`**. Both land on **Settings → Profile**, which has no `#wallet`/`#autopay` element and no wallet UI (`15_settings_hash_wallet.png`).
  - Dismiss (×) is stored in `sessionStorage` (`vv:walletAlert:dismiss:zero`), so the banner returns in every new tab.
- **Hard navigations**: every full page load shows a centred spinner with "Loading…" on a blank canvas. There is no rail and no header skeleton (`20_billing_t0700ms.png`). Data then fills in progressively.
  - At 3.7 s Billing still showed "Auto top-up amount: ₹0.00". Seconds later it showed "₹500.00".
  - Zero-value defaults therefore masquerade as real data while loading.

### 3.2 Visual language (re-verified)

At least 7 page-header treatments and 3 type families are in use:

- **Uppercase geometric sans:** "AGENT COCKPIT", "BILLING", "AGENT KNOWLEDGE", "SETTINGS".
- **Extreme tracking:** "L E A D S".
- **Monospace titles:** "Meeting Agent — Vikash", "Rep console", "Call channel".
- **Sentence-case sans:** "Call Reports", "Assistant", "Your calling number", "Flow Builder".
- **Kicker + 32 px bold:** "Personal Agents".
- **Serif italic:** Analytics.

Two sibling settings pages look like different products: **Call channel** is fully monospace with a mono title, while **Calling number** is sans with a stepper (`16_settings_call_channel.png` vs `17_settings_calling_number.png`).

Filled primaries use four colours:

| Colour | Where |
|---|---|
| Blue `#2f5fe0` | most primaries |
| Green | ACTIVATE |
| Purple `#8b5cf6` | Create Room |
| Teal tint | Import CSV, Test Call |

"Refresh" appears in at least 6 styles.

### 3.3 Microcopy register (jargon observed live)

- **Ops / infrastructure terms shown to customers:**
  - "LAT: 0ms", "SESSION: IDLE", "RGN: Mumbai-1", "ALLOCATED DID"
  - "VOBIZ" (the carrier name, used as the call-history label on a lead)
  - "Slots", "Stale"
  - "GPU SERVER STATUS Online"
  - "BACKEND — Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL" (an environment variable name)
  - "(present_topic)" (a function name, in the Presentation mode helper)
  - "Soul.md" (Flow settings)
  - "chunked, embedded with Gemini", "text-embedding-004 (768-dimensional vectors)", "pgvector"
  - "Tasks survive restarts — state lives in the task row"
  - "could not establish signal connection: Websocket got closed during a (re)connection attempt:"
- **Editorial register on Analytics:** serif italic lines such as "the dispatch from your line".
- **Plain product copy:** Assistant, Personal Agents explainer, Calling number, New lead modal. These are good.

### 3.4 Contrast (sampled in the first run; unchanged visually)

The muted token `#7a8397` is used for 10–12 px labels, often mono and tracked uppercase. It reaches about 3.5–3.8:1, below the 4.5:1 AA threshold. Worse cases:

| Element | Contrast |
|---|---|
| Cockpit disabled "Test Call" | ≈1.6:1 |
| "Awaiting connection…" | ≈1.5:1 |
| Call Reports "—" cells | ≈1.45:1 |
| Meeting Agent flow hint | ≈1.8:1 |
| Meeting privacy card descriptions | ≈2.0:1 |
| Personal Agents card descriptions | ≈2.2:1 |
| Analytics tagline | ≈2.4:1 |
| "FLOW VALIDATED" pill | ≈2.5:1 |

---

## 4. Journeys (live walk-through)

Ratings: 1 = blocked or very poor, 5 = excellent.

### Journey 1: First run and orientation. Rating **2/5**

- **Landing and loading**
  - On landing a user sees a full-screen "Loading…" spinner with no shell.
  - Then comes the dense AGENT COCKPIT: three columns, mono uppercase labels, and a status line "00:00 LAT: 0ms FLOW: [Client A Realty (v2) · f] ↻ SESSION: IDLE" plus an "IDLE" pill (`10_dashboard_live.png`).
  - There is no welcome, no "what to do next", and no checklist.
- **Onboarding exists but is invisible afterwards.** The API shows step 4 was never completed, and no surface tells the user. Prerequisite state is scattered:
  - wallet ₹0 is shown only as the global banner, whose Top up CTA leads to the wrong page
  - calling number: "Allocated DID PENDING — Allocate a number from billing" appears only on Analytics, with no link (`52_analytics_did_card.png`), and Billing has no numbers
  - caller-ID verification sits in Settings → Calling number
  - call channel is in Settings, and the Profile phone is empty
- **Orientation depends on 12 unlabelled icons** in the default collapsed rail. Three "agent" concepts (Agent View, Meet Agent, Personal Agents) have similar glyphs.
- **Session expiry (first run):** a blank screen, then a silent redirect to `/login` with no `?next=`. The login page says "Welcome Back" and uses a bullet-dot password placeholder that looks pre-filled.

### Journey 2: Build or edit a call flow and put it live. Rating **2/5** (down from 3 in the static draft)

What works:

- The flow picker is an "All flows" modal with search, category, last-edited and OPEN.
- The palette has search and a "Recently used" section that appears after first use.
- Toolbar icons have good tooltips with shortcuts ("Undo (Ctrl+Z)", "Validate flow structure", "Full-screen canvas (F)").
- The **validator** lists errors with "Jump" buttons (`27_flow_validate_with_orphan.png`).
- The Flow settings drawer closes on Esc.
- "ACTIVATE" has a clear tooltip: "Activate this flow for all your calls".
- The trash icon is a "Destructive actions" menu rather than a one-click delete.

Friction, observed live:

1. **Opening the page writes to the flow.** `PUT /api/flows/{id}` fired on every load with no interaction, and **Undo is already enabled on a fresh load**. The page mutates the flow on open and saves it. The "Last edited" column then becomes meaningless: one "Client A Realty (v2)" shows "26 Sept, 16:09", i.e. today, consistent with the audit's own visits (inferred).
2. **Autosave on every edit (~<700 ms), with no failure feedback.** Adding one Speak node fired a PUT immediately. Under simulated network failure the header chip **still read "Up to date"** at 0.7 s and 3.7 s, with no toast and no retry (`25_…0700ms.png`, `26_…3700ms.png`). A user who loses connectivity believes their work is saved.
3. **Edits to the live flow are saved immediately (inferred risk).** ACTIVATE says it applies "for all your calls", but the flow is autosaved while being edited. Nothing tells the user whether half-finished edits to the active flow are already live.
4. **The "FLOW VALIDATED" pill is wrong.** On the saved flow the pill is green. Running Validate on a fresh load returns **"2 Flow Validation Errors"**: "Knowledge Lookup" is not connected to any previous step and has no outgoing connection (sibling capture `va-flow-config/14_validate_fresh.png`, and my capture after adding a node shows 4 errors). The pill also stayed green after I dropped an unconnected node.
5. **No "live" state anywhere.** The header shows only the save status. The All-flows modal (16 flows, `29_flow_picker.png`) has no Active/Live column, no duplicate/rename/delete, and no sort control. Default order is unsorted (4 Sept, 21 Sept, 15 Sept, 26 Sept, 28 Aug…).
6. **Duplicate names:** two "Client A Realty (v2)", two "Airport Passenger Support Flow", two "Client D Demo", and "Generated: Client B developers ..." (truncated with an ellipsis in the name itself). The Cockpit select disambiguates with hash suffixes ("· 9115a2" / "· f9b04a") inside a 150 px native select that shows "Client A Realty (v2) · f". The Leads bulk bar and lead panel list the duplicates **without** suffixes.
7. **Creating a new flow is hidden** in "More actions (…)". Its menu has "Export JSON / Import JSON / New flow / Reset to default" (`24b_flow_more_actions.png`), so "New flow" sits one row above the destructive "Reset to default".
8. **Adding a node from the palette drops it on top of existing nodes** (over "Confirm Interest" / "Knowledge Lookup"), unconnected (`26_…`). The default title is "New Speak Node", which already exists twice in the production flow.
9. **Two primaries side by side:** Save (blue, "Save (Ctrl+S)") and ACTIVATE (green glow). If autosave exists, Save's meaning is unclear: a version, publish, or nothing?
10. **Flow settings** (`28_flow_settings_drawer.png`) has no Save or Done button and no "saved" feedback. "Soul.md" is developer jargon for a personality prompt. The 0/6000 counter is good.

### Journey 3: Import or add leads and start calling them. Rating **3/5** (up from 2; a bulk path exists)

What works (observed live):

- **Selecting rows reveals a bulk bar** (`31_leads_two_selected.png`) with "2 SELECTED", a VIKASH/VAANI toggle, a language select (Auto-detect), a flow select ("Default flow") and a **CALL 2** primary.
- **Clicking a row opens a lead panel** (`32_…`, `34_lead_panel_actions.png`). It shows status and source, the date added, the masked phone, Interest, Calls, and "Outbound config":
  - voice cards with descriptors ("male / direct", "female / warm"): the only place personas are explained
  - Language
  - Flow ("Active flow (profile default)")
  - Call Now (primary, 258×38) and WA ("Send WhatsApp")
  - Call history
  - DELETE LEAD
- **The New lead modal** (`35_new_lead_modal.png`) has visible labels, required asterisks, example placeholders, the subtitle "One at a time — for bulk, use CSV", Cancel / Create lead, Esc to close, and autofocus on Name.

Friction:

1. **No pre-flight on any call control.** CALL 2, Call Now, the per-row phone icons (title "Call <name> (c)") and the single-key "C" shortcut are all enabled while wallet = ₹0 and the calling number is unverified or unallocated. The bulk bar shows no cost estimate, calling-hours window, retry or DND/consent note.
2. **Inconsistent defaults and unnamed flows.**
   - The bulk bar and lead panel default to **VIKASH**. The Cockpit defaults to **VAANI**.
   - The flow select reads "Default flow" (bulk bar) or "Active flow (profile default)" (panel). Neither names the actual flow.
   - The 16-option list repeats duplicate names without disambiguation.
3. **Numbers disagree between pages.** The lead panel for lead row 1 shows **CALLS 1**. The Cockpit, pre-filled with the same person, shows **"3 PREV. CALLS"**.
4. **Stale call state and jargon.** The lead's call history shows "VOBIZ · QUEUED · 28 Aug, 11:45 pm": a call still "queued" a month later, labelled with the carrier's name.
5. **Destructive action placement.** "DELETE LEAD" is a 391×33 full-width, red-text button at the bottom of the panel. At 900 px it sits at y = 893, just below the fold, under the Call Now / WA row. (Confirmation not tested.)
6. **Selecting a row can move the table.** Clicking the first checkbox scrolled the table, and the second click selected a different row than intended: rows 7 and 8 were checked instead of 1 and 2. The sticky header collapsed during the click.
7. **New lead validation.** Phone accepts "abc" as valid. Email is only checked by the browser's native bubble on submit (`validationMessage` present, no inline error). The modal has **no `role="dialog"`/`aria-modal`**. **Esc discards typed data without confirmation.**
8. **Table density** (re-verified): about 730 px of empty columns between LEAD and STATUS, and only 8 of 24 rows visible. Interest shows "—", and the INTEREST KPI shows a red "—".
9. **Import CSV** was not opened (by rule). Its tint styling sits between primary and secondary.

### Journey 4: Run a test call from the Cockpit. Rating **2/5**

- **Customer Intel is pre-filled into editable inputs**, not shown as placeholders:
  - A customer name and masked phone that match lead row 1.
  - Email, company and location that are clearly demo data and do not belong to that lead.
  - Language "HINDI / EN", sentiment "POSITIVE 72/100", "3 PREV. CALLS" and duration 00:00, all while SESSION: IDLE.
  - The 7 inputs have **no programmatic labels** (`label=null, aria-label=null`). The visible mono labels are not `<label for>`.
  - SAVE CONTEXT has the tooltip "Save customer context — agent will use this data". The agent may therefore speak to a real person using another company's demo details.
- **Two call CTAs.** "CONNECT" (filled blue, no tooltip, no explanation) and "Test Call" (teal, disabled until the "+91..." field has text; the label wraps onto 2 lines).
- **No validation on the test number.** **"Test Call" enables for "abc" and for "12345"** (`11_cockpit_tel_12345.png`). There is no format hint beyond the placeholder "+91..." and no error.
- **No pre-flight.** Wallet ₹0 and the unverified number are not mentioned near either button. The only signal is the global banner.
- **Status noise:** "IDLE" pill + "SESSION: IDLE", "LAT: 0ms", "00:00", and an unlabelled ↻ (title "Refresh flows"). The flow select is a 150 px native `<select>` truncating a 27-character name.
- **Transcript empty state:** "Awaiting connection…" at about 1.5:1 contrast, centred in a large empty column.

### Journey 5: Find a specific past call and read its transcript and outcome. Rating **3/5**

What works:

- Search "Search transcripts, summaries…" filters instantly ("language" → 13 rows).
- A good no-results state: "No calls found" with an icon and explanation (`41_…`).
- Rows open a **Call details** side panel with Status, Duration, Type, Call ID, an Analysis block (sentiment + "Satisfaction: medium" + summary), Flow Builder fields ("not collected"), Re-analyze Transcript, "Learn from this call", Recording, Transcript and "Export This Call" (`38_call_detail.png`, `40_…`).

Friction:

1. **The transcript is last in the panel.** It sits below the analysis, three action buttons and the recording block, so reading it takes about 1,500 px of scrolling in a 380 px-wide panel. For "what happened on this call?" the transcript is the core content.
2. **"Recordings" is promised in the header** ("Recordings, transcripts, sentiment & extracted flow fields"), but the opened call says "No recording is available for this call."
3. **Counters ignore the filter.** "121 calls" and "Total Calls 121 / Avg 90s / Positive 4 / Negative 10" do not change when searching. There is no "13 results" count.
4. **Stale selection.** The detail panel stays open showing a call that is no longer in the (empty) filtered result.
5. **Rows are mouse-only:** `cursor:pointer`, `tabIndex = -1`, no role/button semantics. Keyboard and screen-reader users cannot open a call.
6. **17 columns.** Seven core columns plus 10 flow-field columns, the union across all flows: "Confirm Interest", "Condition Check" ×3, "Additional Assistance", "Condition Check (Residential)", "Emergency Check", "Green & Identity" (sic), "Knowledge Lookup", "Schedule Visit". Most cells are "—".
7. **Paired rows and metric mismatch** (re-verified):
   - Each test call appears as two BROWSER rows a second apart. One has "To: —", the other the lead's masked number.
   - Avg Duration 90s here vs 1m 18s on Analytics.
   - Dialed number shows "—" in the detail panel.
8. **Few ways to narrow down:** sentiment tabs only. There is no date, flow, agent, status or direction filter.

### Journey 6: Understand spend and top up the wallet. Rating **2/5**

1. **The most visible Top up CTA is a dead end.** The banner "Top up" / "Enable autopay" (on every page) goes to Settings → Profile, which has no wallet (`15_…`). Billing is reachable only via the rail's card icon.
2. **Billing** (`19_billing.png`, `21_…`) shows ₹0.00, "Transactions 0 — All transaction history is shown below", Autopay (inactive, amount 500, Enable UPI Auto-Debit), Manual top-up (₹100 / **₹500** / ₹1000 chips, amount field, Pay with UPI) and "No transactions yet."
   - **There is no usage or spend:** no rate per minute, no cost per call, no invoices or GST, despite 121 calls.
   - Copy under Manual top-up: "For automatic mandate-based recharge, use Pricing." This points away from the Auto-debit card directly above it.
3. **No amount validation.** Pay with UPI stays enabled for 0, −50, 5 and 9,999,999. The input has `min=1` and no `max`. No min/max hint or inline error appears (`22_billing_topup_9999999.png`). The preset chip correctly deselects when a custom amount is typed.
4. **Three filled blue elements in one card** (the selected ₹500 chip, Pay with UPI, and Enable UPI Auto-Debit above), plus the banner's Top up: four competing blues.
5. **Loading shows zeros as data:** "Auto top-up amount: ₹0.00" is shown while loading, then changes to ₹500.00.
6. Meetings minutes billing is a separate plan picker in Settings (first run, not re-verified live).

### Journey 7: Deploy the Meeting Agent. Rating **3/5**

What works: one form with one primary (Create Room), a clear agent card (voice, role, capabilities), a free-minutes badge (29/30), and a mode helper that explains the difference ("No flow is run").

Friction (`42_meeting_agent.png`, `43_…`, `44_…`):

1. **The pre-filled title equals the placeholder.** The value "Product Demo with Vikash" is identical to the placeholder, and **3 of 5 past meetings are named "Product Demo with Vikash"**, which makes them indistinguishable.
2. **Create Room stays enabled with an empty title.** No validation.
3. **"Conversation Flow: Active flow (from profile)"** does not say which flow. This is the third different wording for the same concept.
4. **The active room is shown by ID** ("p8IaseuzzZcb-OEm-xmdfA"), not by its title. The same room also appears in Past Meetings under its title. "1 participant" and "2 joinees" appear in the same card.
5. **A room live for 82h 42m** is shown as "LIVE" with "STALE 0". No warning is given and minutes consumed are not shown.
6. **The red square icon button is "Delete room"** (title only). It sits in the same row as the Agent / Intel / Record toggles, at the same size.
7. **Internal infrastructure is exposed to customers:** "GPU SERVER STATUS Online", "BACKEND — Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL", and "(present_topic)".
8. Purple primary and a monospace title: a unique style on this page.

### Journey 8: Create a Personal Agent task. Rating **3/5**

What works: the best explainer in the app. It covers what it is, examples, when to use Flow Builder instead, and an empty state naming the CTA.

Friction (`45_…`, `46_personal_agents_new_task.png`):

1. **"New task" opens an inline form** at the bottom of the page, not a modal. Its fields are Goal (textarea, placeholder example) and "Capability hint (optional)". **START TASK is enabled with an empty goal.**
2. **The capability list** mixes B2B and consumer items: "Web Research, News Digest, PDF Read/Generate, Spreadsheet…, Presentation Generate, Document Draft, **Homework Analysis**, Appointment / Scheduling, Knowledge Base Lookup, Video Meeting, **Stock Research**".
3. **No prerequisites, budget or guardrails.** The copy says it "works … on its assigned number", but no number is shown, the calling number is unverified and the wallet is ₹0. There is no spend cap, call limit or schedule.
4. **Use-case cards look like disabled buttons** (grey `#c3c5c8`) and are **not clickable** (plain DIV, `cursor:auto`). They could prefill the goal.
5. **Copy:** "goalinstead" (missing space) and "state lives in the task row".

### Journey 9: Configure calling number and call channel. Rating **2/5**

- **Settings sub-nav:** 17 flat items, 14 with a ↗ glyph. The ↗ items (e.g. Call channel, Calling number) are **in-app links** that open **full pages without the settings sub-nav**. Those pages show **two back links**, "← BACK TO SETTINGS" and "← Settings" (`16_…`, `17_…`). Meetings Billing and Docs are buttons, not links.
- **Call channel** (`16_settings_call_channel.png`):
  - Three radio cards: Phone (PSTN, default), Browser softphone, Auto. "Save preference" is disabled until changed; greyed with no hint.
  - PSTN "forwards the caller to your phone number", but **the Profile phone field is empty**. This page neither shows nor links the number it will forward to.
  - A "Heads up" box says **Browser/Auto currently fall back to PSTN until the softphone bridge ships**. Yet Rep Console is in the main nav and says calls land there when the channel is Browser or Auto. Two options on this page are therefore offered but non-functional.
- **Calling number** (`17_…`, `18_…`):
  - A clean 3-step stepper (1 Owned → 2 Compliance → 3 Authorized) with plain copy ("It becomes your caller-ID once ownership, compliance, and carrier checks all pass").
  - **"Send code" enables for "abc"** and "12345". There is no inline format validation.
  - The concept ("verify your own number as caller-ID") conflicts with Analytics ("Allocated DID: PENDING — Allocate a number from billing"). Neither page links to the other.

---

## 5. Findings

Severity: critical = blocks a core task, loses data or is a serious a11y barrier; high = major friction or clearly unprofessional; medium = noticeable; low = polish.

### UX-AUDIT-01: Flow Builder writes to the flow on open, autosaves every edit, and shows "Up to date" when saves fail. **Critical**
- **Page:** /flow-builder
- **Evidence (observed):**
  - `PUT /api/flows/f9b04a18-…` fired on every page load with no interaction, 3 of 3 loads. Undo was enabled on a fresh load.
  - Adding one node fired another PUT within 700 ms.
  - Under simulated network failure the header chip stayed "Up to date" at 0.7 s and 3.7 s, with no toast, retry or unsaved marker. (`23_flow_builder.png`, `25_flow_after_add_node_0700ms.png`, `26_flow_after_add_node_3700ms.png`)
- **Inferred:** edits to the active flow may go live mid-edit, since ACTIVATE is "for all your calls" and the flow is saved continuously.
- **Recommendation:**
  - Never write on open. Normalise in memory and save only on user change.
  - Use a 3-state save chip bound to the request lifecycle: "Saving…", "Saved 16:42", "Couldn't save — Retry", with a persistent banner and `beforeunload` guard on failure.
  - Autosave into a **draft**. The live flow changes only via "Publish/Go live", which shows a diff.

### UX-AUDIT-02: The banner's "Top up" and "Enable autopay" lead to Settings → Profile, which has no wallet. **High**
- **Page:** global banner → /settings#wallet, /settings#autopay
- **Evidence (observed):** link hrefs are `/settings#wallet` and `/settings#autopay`. The destination renders "Profile Settings" and has no element with id wallet or autopay. (`15_settings_hash_wallet.png`)
- **Recommendation:**
  - Point both to `/billing` (autopay anchored to its card).
  - Have the banner state the consequence ("Calls are paused — wallet ₹0") and hide it on /billing.

### UX-AUDIT-03: A green "FLOW VALIDATED" pill is shown on a flow that fails validation. **High**
- **Page:** /flow-builder
- **Evidence (observed):**
  - The pill is green on load.
  - Clicking Validate reports "2 Flow Validation Errors" for the saved flow: an orphan "Knowledge Lookup" with no in or out edge (`va-flow-config/14_validate_fresh.png`). After I added a node it reported 4 (`27_flow_validate_with_orphan.png`).
  - The pill did not change after the edit.
- **Recommendation:**
  - Run validation continuously (debounced) and bind the pill to the result: "2 issues" in amber, clickable to open the list.
  - Block Go live on errors, or require an explicit override.

### UX-AUDIT-04: Paid, real-world call actions have no pre-flight check. **High**
- **Page:** /leads, /dashboard
- **Evidence (observed):**
  - Bulk "CALL 2", panel "Call Now", per-row phone icons, the "C" shortcut, Cockpit CONNECT, and Test Call (for any text, including "abc") are all enabled.
  - Meanwhile the wallet is ₹0.00, the caller-ID is unverified and the DID is "PENDING".
  - The bulk bar shows no cost, calling window or DND/consent note. (`31_leads_two_selected.png`, `34_lead_panel_actions.png`, `11_cockpit_tel_12345.png`)
- **Recommendation:**
  - Add a shared pre-flight component on every call control. When blocked, show why and link the fix ("Add ₹100 to call", "Verify a calling number").
  - For bulk, show a confirmation sheet with count × estimated cost vs balance, flow name, voice, number, calling hours and DND scrub.
  - Put a modifier on the call shortcut (Shift+C) or add a confirm popover.

### UX-AUDIT-05: Cockpit Customer Intel is pre-filled with mismatched values in editable, unlabelled inputs, and its counts disagree with Leads. **High**
- **Page:** /dashboard
- **Evidence (observed):**
  - While IDLE, the name and masked phone match lead row 1, but email, company and location are demo values from elsewhere. "POSITIVE 72/100" and "3 PREV. CALLS" also show.
  - That lead's panel in Leads says "CALLS 1".
  - The 7 inputs have no `<label>` or aria-label.
  - SAVE CONTEXT's tooltip says the agent will use this data. (`10_dashboard_live.png`, `32_leads_row_click.png`)
- **Recommendation:**
  - Start empty with a "Pick a lead or enter a number" combobox that loads from Leads.
  - Show the source of each value.
  - Never show sentiment or prev-calls before a call.
  - Associate labels.
  - Make "Save to lead" explicit.

### UX-AUDIT-06: There is no "what is live" state, flow names are duplicated, and flow pickers disagree. **High**
- **Page:** /flow-builder, /dashboard, /leads, /meeting-agent
- **Evidence (observed):**
  - The All-flows modal (16 flows) has no Active/Live column or sort.
  - Two "Client A Realty (v2)", two "Airport Passenger Support Flow" and two "Client D Demo" exist.
  - Cockpit options carry hash suffixes, but the Leads bulk bar and panel do not.
  - The flow is described 4 ways without naming it: "Default flow", "Active flow (profile default)", "Active flow (from profile)", and the truncated "Client A Realty (v2) · f".
  - "New flow" is hidden in "…" beside "Reset to default". (`29_flow_picker.png`, `24b_flow_more_actions.png`)
- **Recommendation:**
  - Add a single "LIVE" badge in the flow header and the flow list, with "Used by: outbound default, Meeting Agent, number X".
  - Enforce unique names or add an auto suffix.
  - Sort by last edited.
  - Use a searchable flow combobox everywhere showing "Name · v · LIVE".
  - Make "+ New flow" a visible button next to the picker.

### UX-AUDIT-07: Telephony setup is contradictory and split across pages. **High**
- **Page:** /settings/call-channel, /settings/calling-number, /settings (Profile), /analytics, /rep-console, /personal-agents
- **Evidence (observed):**
  - The PSTN default forwards to "your phone number", but the Profile phone is empty and not referenced.
  - "Heads up: Browser/Auto fall back to PSTN until the in-browser softphone bridge ships", while Rep Console is in the main nav.
  - Calling number verifies your own caller-ID. Analytics says "Allocate a number from billing" (not a link), and Billing has no numbers.
  - Personal Agents relies on "its assigned number". (`16_…`, `17_…`, `52_analytics_did_card.png`)
- **Recommendation:**
  - Create one "Phone setup" page with status for each part: Calling number (verified / allocated), Transfer destination (phone or browser, with the number shown and editable inline), and Test.
  - Hide or disable options that don't work yet, with a "coming soon" label.
  - Link every "number" mention to this page.

### UX-AUDIT-08: Spend is invisible, billing is split, and top-up amounts are not validated. **High**
- **Page:** /billing (+ Settings → Meetings Billing, marketing /pricing)
- **Evidence (observed):**
  - 121 calls but no usage, rate or invoice view.
  - "For automatic mandate-based recharge, use Pricing." sits under the Auto-debit card.
  - Pay with UPI is enabled for 0, −50, 5 and 9,999,999 (`min=1`, no max, no inline error).
  - Four filled blues are in view at once.
  - "₹0.00" autopay amount appears while loading. (`19_billing.png`, `21_billing_t3700ms.png`, `22_billing_topup_9999999.png`)
- **Recommendation:**
  - Build a Billing hub: Balance ("≈ N minutes left at ₹x/min"), Usage by product and day with cost per call (linked to Call Reports), Plans, Numbers, Invoices/GST.
  - Validate the amount inline (min/max shown).
  - Keep one primary per card.
  - Use skeletons instead of zero defaults.

### UX-AUDIT-09: Call Reports buries the transcript, misreports counts under search, and is not keyboard-operable. **High**
- **Page:** /call-reports
- **Evidence (observed):**
  - The transcript is the last block in the details panel, below analysis, 3 buttons and recording.
  - The header promises recordings, but the call has none.
  - Pill and KPIs stay at 121 while searching.
  - The panel stays open on a call that is not in the results.
  - Rows have `tabIndex = -1` and no role.
  - There are 17 columns, including 10 union flow-field columns with duplicates and the typo "Green & Identity".
  - Paired rows 1 s apart; Avg 90s vs Analytics 78s. (`37_…`, `38_…`, `40_…`, `41_…`)
- **Recommendation:**
  - Order the panel as Outcome → Transcript (with audio when available) → Extracted fields → Actions.
  - Show "13 of 121" when filtered and update KPIs to the filter.
  - Close or refresh the panel on filter change.
  - Make rows real buttons or links (deep-linkable `/call-reports/:id`).
  - Show flow-field columns only for the selected flow.
  - Merge call legs into one record.

### UX-AUDIT-10: Internal infrastructure and developer strings are shown to customers. **High**
- **Page:** /meeting-agent, /knowledge, /flow-builder, /rep-console, global footer
- **Evidence (observed):**
  - "GPU SERVER STATUS Online"
  - "BACKEND — Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL"
  - "(present_topic)"
  - "Soul.md"
  - "text-embedding-004 (768-dimensional vectors)", "pgvector"
  - the raw websocket error text
  - "RGN: Mumbai-1", "LAT"
  - "VOBIZ" as a call label (`44_meeting_env_var_leak.png`, `50_…`, `47_rep_console.png`, `34_…`)
- **Recommendation:**
  - Remove backend, port and env-var cards (move them to an internal admin page).
  - Rename to customer language: "Personality" for Soul.md, "Carrier" hidden, "Connection" for LAT.
  - Map raw errors to human messages with a Retry.

### UX-AUDIT-11: Navigation is icon-only by default, and nav names don't match page titles. **High**
- **Page:** global rail
- **Evidence (observed):**
  - The 72 px icon rail shows labels only in `title` tooltips.
  - At 900 px the Settings icon is clipped behind the rail's own scroll arrows.
  - Nav labels "Agent View" / "Meet Agent" / "Knowledge" do not match page titles "AGENT COCKPIT" / "Meeting Agent — Vikash" / "AGENT KNOWLEDGE".
  - The mobile bottom nav uses "Agent" / "Reports" / "Exit".
  - The expanded 239 px rail (with labels) is good but not the default. (`10_…`, `14_sidebar_expanded.png`)
- **Recommendation:**
  - Default to the labelled rail at ≥1280 px, with 3–4 groups.
  - Unify names (e.g. "Live console", "Meeting agent", "Knowledge") across nav, title and route.
  - Pin Settings and the user menu outside the scroll area.
  - Put sign-out in a labelled user menu.

### UX-AUDIT-12: Every page uses a different visual language. **High**
- **Page:** all
- **Evidence (observed):**
  - At least 7 header treatments and 3 type families.
  - Call channel (all mono) vs Calling number (sans) are adjacent settings pages that look like different products.
  - Four primary colours (blue, green, purple, teal).
  - Six styles of Refresh. (§3.2)
- **Recommendation:**
  - Use one PageHeader component (sentence-case title, 1-line description, at most 1 primary + 2 secondary actions).
  - Use monospace only for data.
  - Use one brand primary and one "go live" colour.
  - Use one Refresh pattern, or auto-refresh with an "Updated hh:mm" stamp.

### UX-AUDIT-13: Secondary text contrast is low, with some helper text at 1.5–2.5:1. **High**
- **Page:** all
- **Evidence:** sampled in the first run (§3.4) and visually unchanged. Muted `#7a8397` is about 3.5–3.8:1. Hints and disabled labels run 1.45–2.5:1.
- **Recommendation:** use a muted token of at least `#5b6477` (≥5.4:1 on `#f4f6fa`). Do not use tracked uppercase mono below 12 px. Give disabled controls a visible reason.

### UX-AUDIT-14: Errors are reported far from the action, or as raw exceptions, with no recovery path. **High**
- **Page:** /knowledge, /rep-console, /flow-builder
- **Evidence (observed under simulated network failure):**
  - Knowledge "Test Knowledge Search": the message "Search failed — check network connection" renders inside the **Upload card above the file table**, off-screen from the Search box the user just clicked (`50_knowledge_search_result_failure.png`).
  - Rep Console shows "Could not connect / could not establish signal connection: Websocket got closed during a (re)connection attempt:" (trailing colon), with no Retry and no guidance (`47_rep_console.png`).
  - Flow Builder shows nothing (UX-AUDIT-01).
- **Recommendation:**
  - Put errors next to the control that triggered them, with a plain message, a Retry, and (for connection issues) a status link.
  - Use one toast pattern for background failures.

### UX-AUDIT-15: Forms have almost no client-side validation, and some lack labels or dialog semantics. **Medium**
- **Page:** /dashboard, /settings/calling-number, /billing, /leads (New lead), /meeting-agent, /personal-agents
- **Evidence (observed):**
  - Test Call enables for "abc".
  - Send code enables for "abc".
  - Pay enables for 0, −50 and 9,999,999.
  - New lead phone accepts "abc"; email is only checked by the native bubble on submit; there is no `role="dialog"`; Esc discards typed input.
  - Create Room is enabled with an empty title.
  - START TASK is enabled with an empty goal.
  - Cockpit inputs are unlabelled.
- **Recommendation:**
  - Validate on blur and show inline messages ("Enter a 10-digit Indian mobile, e.g. 98765 43210").
  - Disable the primary with an explanation, or validate on click with a focus jump.
  - Use `<label for>` everywhere and dialog semantics for modals.
  - Confirm before discarding a dirty form.

### UX-AUDIT-16: Placeholder-like values are pre-filled, which produces indistinguishable records. **Medium**
- **Page:** /meeting-agent, /dashboard, /flow-builder
- **Evidence (observed):**
  - Meeting title value = placeholder = "Product Demo with Vikash", and 3 of 5 past meetings carry that exact name.
  - Default node title "New Speak Node" is already used twice.
  - Cockpit intel is pre-filled (UX-AUDIT-05). (`42_…`, `44_…`, `26_…`)
- **Recommendation:**
  - Use real placeholders (empty value), or smart defaults with a timestamp ("Meeting · 26 Sep 16:40").
  - Prompt for a name when adding nodes.
  - Warn on duplicate names.

### UX-AUDIT-17: Loading gives no app shell, and late banners shift the layout. **Medium**
- **Page:** all hard navigations
- **Evidence (observed):**
  - A full-screen "Loading…" spinner with no rail or header at 0.7 s (`20_billing_t0700ms.png`).
  - The wallet banner appears about 2.7 s after DOMContentLoaded and pushes content down 42 px.
  - Billing still shows ₹0.00 defaults at 3.7 s.
  - Session expiry (first run): a blank page, then a silent `/login` with no `next`.
- **Recommendation:**
  - Render the shell immediately with skeletons.
  - Reserve the banner slot (or render it server-side).
  - Show "—" or skeletons, never 0, while loading.
  - On auth failure redirect within 1 s to `/login?next=…&reason=expired`.

### UX-AUDIT-18: The Flow Builder toolbar has competing primaries, unclear Save semantics, and new nodes land on top of others. **Medium**
- **Page:** /flow-builder
- **Evidence (observed):**
  - Save (blue) and ACTIVATE (green glow) sit side by side, while autosave also runs.
  - The "Destructive actions" trash menu sits 8 px left of Save at the same weight.
  - Flow settings drawer has no Save or Done and no feedback.
  - A palette click drops the node on top of existing nodes, unconnected.
  - The palette truncates labels ("Knowle…", "CRM Lo…", "Book Me…", "WhatsA…", "Human …").
  - The minimap is a 200×150 dark block. (`23_…`, `26_…`, `28_…`)
- **Recommendation:**
  - One primary, "Go live…", which opens a diff and confirm sheet. Replace Save with the autosave status.
  - Move destructive actions into "…" with a typed confirm.
  - Place new nodes in empty space, connected after the selected node.
  - Use a single-column palette with full names.

### UX-AUDIT-19: Onboarding is invisible after completion, and an unfinished step is never surfaced. **Medium**
- **Page:** global
- **Evidence (observed):**
  - `/api/onboarding/state` returns `completed_steps [1,2,3,5]`, `completed_at 2026-09-03`. Step 4 was never done.
  - No checklist exists anywhere.
  - Prerequisites (wallet, number, channel, transfer phone) sit on 4+ different pages.
- **Recommendation:**
  - Add a persistent "Setup 4/6" item in the rail footer or Cockpit empty state: Verify number → Transfer destination → Pick or activate flow → Add leads → Top up → Test call.
  - Deep-link each step.
  - Show inline blockers on the pages that depend on each step.

### UX-AUDIT-20: Settings IA has a flat 17-item list, misleading ↗ glyphs, and full-page sub-settings with double back links. **Medium**
- **Page:** /settings, /settings/*
- **Evidence (observed):**
  - 14 of 17 items show ↗ but navigate in-app.
  - Sub-pages drop the settings sub-nav and show both "← BACK TO SETTINGS" and "← Settings".
  - Profile mixes personal, organisation (subdomain), WhatsApp brochure and Google/Microsoft connections under one far-away "Save Changes".
  - Delete Account sits in the main list. (`15_…`, `16_…`, `17_…`)
- **Recommendation:**
  - Group the nav (Account, Organisation, Phone setup, Integrations, Developers, Billing, Danger zone).
  - Keep the sub-nav on every settings page.
  - Use one back affordance (a breadcrumb).
  - Use ↗ only for external links.
  - Use a per-section sticky save bar that appears only when dirty.

### UX-AUDIT-21: The Meeting Agent shows rooms by ID, doesn't flag an 82 h live room, and has an icon-only Delete room among toggles. **Medium**
- **Page:** /meeting-agent
- **Evidence (observed):**
  - The active room is listed as "p8IaseuzzZcb-OEm-xmdfA" and also appears under Past Meetings by title.
  - "LIVE 82h 42m" appears with "STALE 0".
  - The red square button's only label is the title "Delete room", next to Agent / Intel / Record.
  - "1 participant" and "2 joinees" appear in the same card.
  - Create Room is enabled with an empty title. (`42_…`, `44_…`)
- **Recommendation:**
  - List rooms by title, created time and host.
  - Auto-flag rooms over N hours with minutes consumed and a labelled "End room" (with confirm).
  - Put toggles in a group with on/off state text.
  - Explain Slots/Stale or hide them.

### UX-AUDIT-22: The Leads bulk bar and lead panel use inconsistent defaults, stale call status and risky Delete placement. **Medium**
- **Page:** /leads
- **Evidence (observed):**
  - Voice defaults to VIKASH here but VAANI in the Cockpit.
  - "Default flow" is not named, and duplicate names are not disambiguated.
  - Call history reads "VOBIZ · QUEUED · 28 Aug".
  - DELETE LEAD is 391×33 full-width, at y = 893 just below the fold, directly under Call Now / WA.
  - Clicking the first checkbox scrolled the table and the next click hit a different row.
  - Table dead space is about 730 px. (`31_…`, `34_…`, `30_leads.png`)
- **Recommendation:**
  - Use one default voice, set in Settings and shown the same way everywhere.
  - Name the flow.
  - Map provider states to customer states (Queued > 1 h → "Not placed — Retry").
  - Move Delete into a "…" menu with a confirm.
  - Keep the table stable while selecting.
  - Add Source / Last call / Flow columns.

### UX-AUDIT-23: Knowledge shows raw storage file names, equal-weight Embed/Delete, and no indexing status. **Medium**
- **Page:** /knowledge
- **Evidence (observed):**
  - File names include 13-digit timestamp prefixes.
  - Every row has an "Embed" and a "Delete" button at the same size, and no column says whether the file is indexed.
  - Two of the three KPI cards hold static copy.
  - "Upload & Embed" is disabled next to a native "Choose file / No file chosen" input.
  - A "How Knowledge Integration Works" block lists pgvector and vector dimensions. (`48_knowledge.png`, `50_…`)
- **Recommendation:**
  - Show the original name, an "Indexed ✓ / Needs re-index / Failed" status, and "Used by".
  - Put Delete in an overflow menu with a confirm.
  - Use a drop zone listing types and size limit.
  - Replace the static cards with real stats.

### UX-AUDIT-24: Rep Console connects on visit and shows status that contradicts the global indicator. **Medium**
- **Page:** /rep-console
- **Evidence (observed):**
  - Visiting fires `POST /api/profile/presence` and a LiveKit websocket immediately. There is no "Go online" control.
  - Under simulated failure the page shows "Offline" and a raw error, while the rail still shows a green dot and "SYS: ONLINE".
  - Mute and End call are disabled with no explanation.
  - The internal room UUID is shown. (`47_rep_console.png`)
- **Recommendation:**
  - Add an explicit "Start taking calls" toggle (with mic check).
  - Tie the rail status to the rep's actual availability.
  - Explain disabled controls ("Available during a call").
  - Hide the UUID.

### UX-AUDIT-25: Personal Agents cards look clickable but aren't, and task creation has no validation, prerequisites or guardrails. **Medium**
- **Page:** /personal-agents
- **Evidence (observed):**
  - The use-case cards are plain DIVs with `cursor:auto` on a grey `#c3c5c8` background.
  - START TASK is enabled with an empty goal.
  - The capability list includes "Homework Analysis" and "Stock Research".
  - No number, budget or schedule fields.
  - Typo "goalinstead". (`45_…`, `46_…`)
- **Recommendation:**
  - Make the cards templates that prefill the goal.
  - Require a goal.
  - Show the assigned number and wallet status with fix links.
  - Add a spend or call cap.
  - Curate the capability list for B2B.

### UX-AUDIT-26: Destructive actions sit next to everyday actions at equal or greater prominence. **Medium**
- **Page:** /leads, /knowledge, /meeting-agent, /flow-builder, /settings, global rail
- **Evidence (observed):**
  - Full-width DELETE LEAD under Call Now.
  - Delete beside Embed on every Knowledge row.
  - Icon-only Delete room among toggles.
  - "Reset to default" directly under "New flow" in the same menu.
  - Delete Account in the main settings list.
  - An unlabelled sign-out icon above the theme toggle.
- **Recommendation:** put destructive actions in overflow menus, use typed confirmation for flow and account deletion, offer undo toasts for reversible deletes, and always label destructive buttons.

### UX-AUDIT-27: Analytics shows a dead-end DID hint and stale intent data (first run; DID re-verified live). **Medium**
- **Page:** /analytics
- **Evidence:**
  - "ALLOCATED DID · PENDING · not allocated yet · Allocate a number from billing to start receiving calls." has **no link** (re-verified; `52_analytics_did_card.png`).
  - Intent data was "last computed 21 Sept, next 21 Sept 17:01" on 26 Sept (first run, not re-verified).
- **Recommendation:** link to the phone setup page and flag stale computations with a Recompute action.

### UX-AUDIT-28: The persistent wallet banner competes with page CTAs, and dismissal lasts one tab only. **Low**
- **Page:** global
- **Evidence (observed):**
  - The banner shows on all pages, including Billing.
  - Dismissal is stored in sessionStorage (`vv:walletAlert:dismiss:zero`), so it returns in every new tab.
  - It renders late and shifts layout (see UX-AUDIT-17).
- **Recommendation:** show it only where money blocks the task, add a compact balance chip in the shell elsewhere, and persist dismissal for 24 h.

### UX-AUDIT-29: An Assistant suggestion chip suggests an irreversible action ("…and activate it"). **Low** (inferred)
- **Page:** /assistant
- **Evidence (observed):**
  - The chips are "Build a sales call flow and activate it", "Summarize my last 10 calls", "Show my call analytics summary", and "Analyze this PDF → build a flow from it".
  - Send is disabled until there is text (good).
  - Chip behaviour (insert vs send) was not tested, by rule.
- **Recommendation:** chips should insert text, not send. Pause any activate, call or spend step in "Plan & Actions" for explicit approval.

### UX-AUDIT-30: The visual language breaks between marketing, login and app. **Low** (first run)
- **Page:** / → /login → app
- **Evidence:** marketing is dark with purple CTAs; login is light with mono labels and a blue CTA; the app is mixed.
- **Recommendation:** use one brand primary across all three, with purple as an accent.

---

## 6. Journey scorecard

| # | Journey | Rating | Top friction |
|---|---|---|---|
| 1 | First run / orientation | 2 | No setup checklist (onboarding step 4 silently incomplete); icon-only rail; jargon; prerequisites on 4+ pages; silent session expiry |
| 2 | Build/edit flow → live | 2 | Writes on open; autosave failures show "Up to date"; false "FLOW VALIDATED"; no LIVE state; duplicate names; New flow hidden |
| 3 | Leads → start calling | 3 | Bulk bar exists, but no pre-flight or cost; unnamed "Default flow"; voice default differs from Cockpit; stale "QUEUED"; Delete placement |
| 4 | Test call from Cockpit | 2 | Mismatched pre-filled intel; CONNECT vs Test Call unexplained; "abc" enables Test Call; no pre-flight |
| 5 | Find a past call | 3 | Search and detail panel work; transcript buried last; counts ignore filter; rows not keyboard-operable; 17 columns; paired rows |
| 6 | Spend & top-up | 2 | Banner Top up dead-ends on Profile; no usage or spend; no amount validation; 4 competing blues |
| 7 | Meeting Agent | 3 | Placeholder-as-value title → 3 identical names; empty title allowed; room by ID; 82 h live not flagged; infra leak |
| 8 | Personal Agent task | 3 | Great explainer; Start enabled with empty goal; fake-button cards; no number, budget or guardrails |
| 9 | Calling number / channel | 2 | PSTN forwards to an unset phone; Browser/Auto offered but non-functional; DID vs caller-ID concepts unlinked; ↗ glyphs; double back links |

---

## 7. Strengths worth keeping

- **Flow validator:** a clear list of errors, each with a "Jump" button to the node. Make it the always-on source for the status pill.
- **Leads bulk bar:** select rows → voice, language, flow → CALL N. This is the right foundation for campaigns. Add the pre-flight and a cost preview.
- **Lead detail panel:** the voice cards with descriptors ("male / direct", "female / warm") are the only place personas are explained. Reuse them in the Cockpit.
- **Call details panel:** analysis summary, satisfaction, extracted fields, and a good "No calls found" empty state.
- **Calling number page:** a clean 3-step stepper (Owned → Compliance → Authorized) with plain copy. Use it as the model for setup pages.
- **New lead modal:** visible labels, required markers, example placeholders, "for bulk, use CSV", autofocus, Esc to close.
- **Personal Agents explainer:** what it is, concrete examples, when to use Flow Builder instead, and a CTA-naming empty state.
- **Assistant:** a capability sentence, 4 concrete chips, the "Plan & Actions" transparency panel, and Send disabled when empty.
- **Toolbar tooltips with shortcuts** in Flow Builder ("Undo (Ctrl+Z)", "Full-screen canvas (F)", "Keyboard shortcuts (?)").
- **Expanded rail (239 px):** labelled, fits at 900 px, and shows "SYS:ONLINE" in words. Make this the default.
- **Masked phone numbers** used consistently (+91••••••NNNN).
- **Billing:** UPI-native presets, and the preset deselects when a custom amount is typed. Autopay status fields (Last charged, Mandate confirmed).
- **Call channel:** radio cards with a description each, and Save disabled until dirty.

---

## 8. Open questions

1. What does ACTIVATE do on click: confirm, diff, or immediate? Is the active flow the one being autosaved?
2. What does the flow-open PUT change (layout normalisation, migration)? Does it bump `updated_at` for every viewer?
3. What do CONNECT and Test Call each do, and what happens with a ₹0 wallet (error, silent failure, debt)?
4. Does CALL N or Call Now show a confirmation? Does "C" call immediately?
5. Does Import CSV offer a template, mapping, dedupe and DND/consent handling?
6. Where is "your phone number" for PSTN transfer actually stored? Is it the Profile phone?
7. What was onboarding step 4, and can a user resume onboarding?
8. Are the paired Call Reports rows two legs of one call or duplicates? Which Avg Duration is correct?
9. Does Delete lead / Delete room / Knowledge Delete confirm?
10. Does "Learn from this call" write to the knowledge base or propose changes (Review proposals)?

---

## 9. Evidence index (this run, `audit/screenshots/va-ux-audit/`)

- `10_dashboard_live.png`: Cockpit idle with pre-filled intel
- `11_cockpit_tel_12345.png`, `12_cockpit_tel_10digits.png`, `13_cockpit_connect_hover.png`: Test Call enabled for invalid input; no CONNECT tooltip
- `14_sidebar_expanded.png`: labelled 239 px rail
- `15_settings_hash_wallet.png`: banner Top up lands on Profile
- `16_settings_call_channel.png`: PSTN default, "Heads up" contradiction, mono page
- `17_settings_calling_number.png`, `18_calling_number_valid_typed.png`: 3-step stepper; Send code enabled for "abc"
- `19_billing.png`, `20_billing_t0700ms.png`, `21_billing_t3700ms.png`, `22_billing_topup_9999999.png`: Billing, full-screen loader, zero defaults, no amount validation
- `23_flow_builder.png`: fresh load (PUT fired on open)
- `24b_flow_more_actions.png`: New flow hidden next to Reset to default
- `25_flow_after_add_node_0700ms.png`, `26_flow_after_add_node_3700ms.png`: autosave blocked yet "Up to date"; node dropped on top of others
- `27_flow_validate_with_orphan.png`: validator errors while pill said validated
- `28_flow_settings_drawer.png`: Flow settings (Soul.md, no save)
- `29_flow_picker.png`: All flows modal with duplicates and no LIVE column
- `30_leads.png`, `31_leads_two_selected.png`, `32_leads_row_click.png`, `34_lead_panel_actions.png`: Leads, bulk bar, lead panel, Call Now / WA / call history
- `35_new_lead_modal.png`, `36_new_lead_invalid_typed.png`: New lead modal
- `37_call_reports.png`, `38_call_detail.png`, `39_call_detail_scrolled1.png`, `40_call_detail_scrolled2.png`, `41_call_reports_no_results.png`: Call Reports and details
- `42_meeting_agent.png`, `43_meeting_presentation_mode.png`, `44_meeting_env_var_leak.png`: Meeting Agent, presentation mode, backend/env-var card, duplicate past meeting names
- `45_personal_agents.png`, `46_personal_agents_new_task.png`: Personal Agents and inline New task form
- `47_rep_console.png`: raw websocket error, Offline
- `48_knowledge.png`, `49_knowledge_search_loading.png`, `50_knowledge_search_result_failure.png`: Knowledge, search failure message placed in the upload card
- `51_assistant.png`: Assistant empty state
- `52_analytics_did_card.png`: DID pending, no link
- First-run captures: `00_redirected_to_login.png`, `01_dashboard.png`, `crop_*.png`
- Sibling capture used: `audit/screenshots/va-flow-config/14_validate_fresh.png` (2 validation errors on a fresh load)

Blocked-request log (non-analytics) for my tab:

- `PUT /api/flows/f9b04a18-…` ×4 (3 on page open, 1 after adding a node)
- `POST /api/profile/presence` and 2× LiveKit `WS` (Rep Console visit)
- `POST /api/knowledge/search` (test search)

No other writes were attempted.
