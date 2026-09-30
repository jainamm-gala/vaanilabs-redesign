# Explorer A: core calling surfaces (Vaani Labs, https://vaanilabs.in)

Agent `va-explore-core` · 2026-09-26 · main viewport 1440x900, also checked at 1366x768, 1024x768 and 390x844.

This report replaces the partial draft from the interrupted run. Every observation below comes from the live product in my own guarded browser window in this session, unless it is tagged:

- **[PRIOR RUN]**: observed live in the interrupted earlier run of this same audit and not reproduced this session.
- **[INFERRED]**: my reasoning, not something I directly saw.

Screenshots are in `audit/screenshots/va-explore-core/`. They are referenced by file name.

---

## 0. Context, method and limits

**Method.** I used one private Playwright window with the read-only network guard: every POST/PUT/PATCH/DELETE, WebSocket, PostHog, OAuth and presence call was aborted in my tab. For each page I did the following:

- Took an ARIA snapshot.
- Took screenshots and viewed every one.
- Read computed styles (font, size, colour, letter-spacing, bounding boxes).
- Checked Resource Timing for `/api/*` calls and their durations.
- Ran safe interactions: hover, expand/collapse, theme toggle, typing throw-away values ("abc", "9876"), opening panels and cancelling, switching the Cockpit flow selector and then switching it back.
- Measured contrast with the WCAG 2.x formula from computed colours.

**Guard artefacts.** These are not product bugs. Any "failed save" is described only as "observed under simulated network failure".

**Not clicked, per the safety rules:** CONNECT, Test Call, Save Context, Create Room, Agent/Intel/Record/Delete room, Start Task, the Voice button, suggestion chips, Send, Top up / autopay payments, and anything in Rep Console.

**Session.** I stayed signed in for the whole session. `/api/auth/me` took 0.4–1.9 s per hard navigation. Nothing logged me out. In the previous run, the whole shared browser was sent to `/login` after `/api/auth/me` timed out twice at 10 s [PRIOR RUN] (see EXPLORE-CORE-18).

**A note on the user's question about staying signed in.** The agents must never be given a password, OTP or magic-link to type in. Entering credentials is outside what the agents may do, even when offered. The safe pattern:

1. The user signs in once, by hand, in the shared browser.
2. The run keeps that session alive: the preamble already extends the `sb-*` session cookies to 12 h.
3. If a logout still happens, agents stop and report instead of trying to sign in again.

The mid-run logouts seen in this audit look [INFERRED] like browser resets and concurrent token refreshes. Handing over credentials would not fix those. The product-side part is covered in EXPLORE-CORE-18.

---

## 1. What the product is, who it is for

- **Positioning.** The positioning line is "The Voice AI that speaks India". It is a self-serve SaaS for Indian SMB and mid-market teams. It offers phone voice agents that follow visual call flows, plus a browser meeting agent, autonomous "personal agents", a chat copilot, a leads list, call reports and analytics. Billing is a prepaid INR wallet with UPI autopay. Meeting minutes are pay-as-you-go at 240 paise/min (Rs 2.40/min), with 30 free minutes (`/api/billing/meeting-quota`: `free_quota_sec 1800`, `free_used_sec 60`, `tier "payg"`).
- **Apparent users [INFERRED from the data in the account].** The org's flows cover:
  - real-estate lead qualification
  - tele-calling scripts
  - appointment scheduling
  - airport passenger support
  - mutual-fund calling

  The buyer is a founder or ops lead. Day-to-day users are:
  - a "builder" who writes flows and uploads knowledge
  - sales or support staff who test calls and read reports
  - human reps who take transferred calls

  Personal Agents also lists consumer-style capabilities: "Homework Analysis", "Stock Research" and "Stock Trade (live) — coming soon". That pulls the positioning towards a personal assistant (see EXPLORE-CORE-15).
- **Product layers as the UI presents them:**

  | Layer | Surfaces |
  |---|---|
  | Build | Flow Builder, Knowledge, Assistant ("build & activate call flows") |
  | Configure | Settings (Call channel, Calling number, Calendly, Integrations, Webhooks, API keys, Embed, Personal Agent), Billing |
  | Run | Agent Cockpit (`/dashboard`), Leads (per-row call), Personal Agents, Meeting Agent, Rep Console |
  | Review | Call Reports, Analytics |

- **Five kinds of AI actor share the word "agent" or a persona name:**
  1. The phone voice agent, with voices "Vaani" and "Vikash" chosen on the Cockpit.
  2. The meeting agent "Vikash" ("Male Indian (Hindi)", "AI Product Expert").
  3. Personal Agents ("works … on its assigned number").
  4. The Assistant ("I plan, then act on your data").
  5. The Assistant's own "Voice" mode, which connects to the "vaani" agent. This is from the handler source: `et.connect(void 0,"vaani")`.

  "Vaani" is also the brand.

---

## 2. Global app chrome [LIVE]

### 2.1 Sidebar, collapsed (default)

- `aside` is 72 px wide, `position: fixed` and `z-50`. The class list is `hidden … md:flex`, so it is hidden below 768 px.
- The logo link (`/`, img alt "VAANI logo") sits at the top.
- `nav` holds 12 links on a 48 px pitch. Each link is 44x44, starting at y = 92:

| # | Accessible name (from `title`) | Route | Glyph |
|---|---|---|---|
| 1 | Assistant | /assistant | sparkles |
| 2 | **Agent View** | /dashboard | 2x2 grid |
| 3 | Analytics | /analytics | bar chart |
| 4 | Leads | /leads | two people |
| 5 | Flow Builder | /flow-builder | git-branch |
| 6 | **Meet Agent** | /meeting-agent | monitor |
| 7 | Personal Agents | /personal-agents | robot |
| 8 | Rep Console | /rep-console | headset |
| 9 | Call Reports | /call-reports | document |
| 10 | Billing | /billing | card |
| 11 | Knowledge | /knowledge | open book |
| 12 | Settings | /settings | gear |

- **Labels and tooltips.** The links have no `aria-label`. Their names come only from the `title` attribute, so the only tooltip is the browser's native one, shown after a delay. Hovering showed a light hover tile and no custom tooltip (`sidebar_hover_flowbuilder.png`). The theme toggle does have a custom styled tooltip ("Light mode", see `dashboard_dark.png`), so tooltip treatment is inconsistent within the same rail.
- **Overflow.**
  - At 1440x900: nav `scrollHeight 572` / `clientHeight 548`, and **`scrollWidth 175` / `clientWidth 44`**, with `overflow: auto` on both axes. A vertical scrollbar thumb and a **horizontal scrollbar with ◀ ▶ arrows** draw inside the 72 px rail over the half-hidden Settings icon (`live_dashboard.png`, left edge, y ≈ 630–650).
  - At 1366x768 and 1024x768: the overflow is **156 px**. Billing, Knowledge and Settings are fully hidden. Settings' visible height is −102 px (`dashboard_1366x768.png`).
- **Keyboard.**
  - Each nav item has **two tab stops**: the `<a>` and an inner `DIV tabindex="0"` (`class="flex h-11 w-11 …"`). Getting past the nav takes 24+ Tab presses.
  - There is no skip link.
  - The focus ring is the browser default (`outline: auto 0.8px`) (`focus_state_nav.png`).
- **Footer (collapsed).**
  - A green dot with no label.
  - Latency such as "12ms" (11 px Hanken Grotesk `#3E475A`, 9.3:1).
  - A Sign-out icon button (`title="Sign Out"`, no aria-label).
  - A theme toggle (aria-label "Switch to dark mode").
  - Expand ("Expand sidebar", with the title hint "Expand sidebar · [").

  The accessibility tree also contains hidden text "SYS: ONLINE LAT: 10ms RGN: Mumbai-1 <user email>". That text is not visible in either sidebar state. The email element sits at x = 78, outside the 72 px rail.
- **No identity.** No user avatar, name, org name ("starvox labs") or org switcher is visible anywhere in the chrome.

### 2.2 Sidebar, expanded (`sidebar_expanded.png`, `sidebar_expanded_footer.png`)

- Clicking **Expand sidebar**, or pressing **`[`**, widens the rail to **240 px**. It pushes `main` to x = 240 rather than overlaying it. The state is stored in `localStorage["vv:sidebar:collapsed"]`.
- Labels are Hanken Grotesk 13 px in `#7A8397` on white (**3.80:1, fails AA**). The active item is blue on `#E6ECFB` with a 3 px left bar.
- There are no groups or separators. All 12 items fit (nav 607 px).
- The footer shows:
  - "SYS:ONLINE" (green `#178A55`, 11 px, 4.37:1) and "10ms".
  - "Sign out", plain text with an icon.
  - A "DARK" tile with a sun icon. The label names the action while the icon shows the current state.
  - A "Collapse [" button. The `[` is a lone grey bracket (`oklab … /0.6`), an unexplained keyboard hint.

  RGN and the email are still not shown.

### 2.3 Wallet banner (`live_dashboard.png`)

- It is `role="alert"`, full width at the top of `main`, 42 px high, with the text "Wallet empty — top up now to keep calls flowing."
- **"Top up"** is `<a href="/settings#wallet">`: 12 px/600, `#111725` on `#2F5FE0` = **3.27:1**.
- **"Enable autopay"** is `<a href="/settings#autopay">`: `#2F5FE0` on `#D7DFF7` = 4.12:1.
- **Both links land on Settings → Profile Settings.** No element on that page has `id="wallet"` or `id="autopay"`, and the wallet lives on `/billing` (`topup_link_target.png`). This breaks the main money CTA.
- **Dismiss** (aria-label "Dismiss") writes `sessionStorage["vv:walletAlert:dismiss:zero"]`. The banner comes back in every new tab and window.
- The banner never shows the balance or says what is blocked. On the same pages, CONNECT stays enabled and Meeting Agent shows "Free minutes: 29 / 30".

### 2.4 Theme

- The toggle sets `<html class="dark">` and `localStorage["vv:theme"]="dark"`. No cookie changed (only the PostHog cookie value updates).
- In dark mode the primary changes from blue `#2F5FE0` to **violet `#7C6BF5`** (`dashboard_dark.png`). That makes violet the Meeting Agent accent in light mode and the global primary in dark mode.
- CONNECT keeps black text (on violet it is 5.28:1, which passes). [INFERRED] The "black text on primary" in light mode comes from a primary-foreground token tuned for the dark theme.
- I toggled back to light afterwards.

### 2.5 Other global behaviour

- **No command palette or global search.** Ctrl+K opened nothing. Shift+? opened no shortcuts dialog.
- **Document title.** Every route has the same title, "Vaani Labs - The Voice AI that speaks India".
- **Loading.**
  - Every hard navigation shows a full-screen centred spinner with "Loading…" and no app shell until `/api/auth/me` resolves (`assistant.png` captured mid-load; `live_dashboard.png` first attempt). Time to the first `main h1`: **2.6 s** for `/dashboard` and **4.9 s** for `/meeting-agent` (domcontentloaded at 0.8–2.3 s).
  - Client-side navigation from the sidebar takes 0.8–1.2 s to the new H1. The old page stays on screen with no progress indicator (`spa_transition_250ms.png`).
- **Every page load calls** `/api/auth/me`, `/api/orgs?include=membership`, `/api/onboarding/state` and `/api/billing/wallet`. The Cockpit calls the wallet endpoint four times.
- **Onboarding.**
  - `/api/onboarding/state` returns `{current_step:5, completed_steps:[1,2,3,5], completed_at:"2026-09-03…"}`.
  - `/onboarding` still renders a "first run" completion screen (`onboarding.png`). The stepper shows PROFILE, SUBDOMAIN, FLOW and TEST CALL all ticked, and DONE, with "You're live." in serif italic. **Step 4 (Test call) is not in `completed_steps`, yet the UI ticks it.**
  - The screen offers "three doors": Flow Builder, Call Reports and Analytics, plus "Go to dashboard".
  - No checklist or setup progress shows anywhere else in the app, even though wallet = Rs 0 and no calling number is assigned.
  - The onboarding page has a horizontal scrollbar at 1440 px.
- **Analytics SDK.** PostHog (`posthog-recorder.js` session replay, `dead-clicks-autocapture.js`, `web-vitals.js`, `/flags`) loads on authenticated pages that show lead names, phone numbers and transcripts.
- **Decorative overlay.** `body > .noise-overlay` is `position: fixed`, `z-index: 9999`, `opacity: 0.02`, `pointer-events: none`, with an SVG-noise background, and sits over all app UI.

### 2.6 Mobile chrome (390x844) (`dashboard_mobile.png`)

- The side rail is hidden. A **bottom tab bar** appears with **Assistant, Agent, Leads, Reports, Billing, Knowledge, Exit**.
- **"Exit" is a Sign-out button** placed as a primary tab. It has no aria-label, and a mis-tap signs the user out.
- **Six of 12 destinations have no mobile route:** Analytics, Flow Builder, Meeting Agent, Personal Agents, Rep Console and **Settings**. There is no "More" menu.
- The same Cockpit page gets its **fourth name** here: "Agent".

---

## 3. Page by page

### 3.1 `/dashboard`: "AGENT COCKPIT" (`live_dashboard.png`)

**Purpose.** A single-session test and operations console. You pick a flow and a voice, then talk to the agent in the browser (CONNECT) or have it dial a number (Test Call), and watch the live transcript beside customer context. It is the default route and the "Go to dashboard" target, but it is not a dashboard: there are no KPIs, no recent activity and no setup status.

**Header** (y 42–95):

- H1 "AGENT COCKPIT" in **Sora 18 px/700**, letter-spacing 0.9 px, `#111725`.
- An "IDLE" pill with a crossed-signal icon.
- Right-aligned mono microtext: clock "00:00", "LAT: 0ms", "FLOW:" and a **`<select title="Select flow">`**. The select is 150 px wide in 10 px JetBrains Mono and shows "Client A Realty (v2) · f", so it is truncated.
- A "Refresh flows" icon button (title only).
- "SESSION: IDLE". The idle state is therefore shown twice.

**Flow selector contents.** There are **16 flows**:

- The same names repeat and are told apart only by 6-character hash suffixes: "Client A Realty (v2) · 9115a2" / "· f9b04a"; "Airport Passenger Support Flow · 47e314" / "· 4133c2"; "Client D Demo · 4b7b3c" / "· 14521c".
- Versions sit side by side: "Appointment Scheduling (v3)" and "Appointment Scheduling"; "Client B developers (v6)" and "Client B developers".
- Two are AI drafts: "Generated: Client B developers … (v2)".
- Nothing shows which flow is active, published or draft, and there is no "Edit in Flow Builder" link.

**Choosing a flow saves it straight away.** Changing the select fires **`PATCH /api/auth/profile`**. So does clicking **Vaani/Vikash** (one PATCH per click). This is the same profile value the Meeting Agent later shows as "Active flow (from profile)". There is no confirmation and no "Saved" feedback. Observed under simulated network failure: the selection stays changed with no error toast, so the UI silently diverges from the server (`cockpit_flow_switched.png`, `cockpit_vikash_selected.png`).

**Left column, "CUSTOMER INTEL"** (x 73–390, scrolls on its own):

- **Six fields:** Customer name, Phone (masked `+91••••••NNNN`), Email, Company / Organization, Location, Language ("HINDI / EN").
- **Labels:** 9–10 px JetBrains Mono uppercase `#7A8397`.
- **Sentiment card:** "POSITIVE", a bar at 72 on a 0–100 scale.
- **Tiles:** "00:00 DURATION" and "3 PREV. CALLS".
- **"SAVE CONTEXT"** (title "Save customer context — agent will use this data").

**Where the Customer Intel data comes from [LIVE].** The page calls `/api/leads?limit=1`. The card's **name matches that lead** (the most recent lead, a real person). The **email, company and location values are not in the lead record at all**: the lead's `email` is empty. They are demo placeholders (a "techcorp" address and company, a Bengaluru location) shown as if they were the customer's data. Sentiment 72 / "3 prev. calls" appear while the session is IDLE and are [INFERRED] placeholders too. SAVE CONTEXT would feed these values to the agent for a real call.

**Centre ("stage"):**

- A decorative ring/orb about 320 px across with a dashed spinner and the label "STANDBY" (14 px, blue-grey).
- Voice toggle **Vaani** (pressed: `#2F5FE0` on a 20 % blue tint, 4.11:1) and **Vikash** (`#7A8397` on `#F7F8FB`, 3.58:1). Selecting Vikash recolours it violet. There is no description, sample or preview of either voice.
- Phone input: `type="tel"`, placeholder "+91...".
- **Test Call**, in JetBrains Mono 14 px teal:
  - It is disabled only while the input is empty. **Typing "abc" enables it**, so there is no client validation of the number format.
  - Enabled it is `#0E9488` on a 20 % teal tint = **2.95:1**, which looks almost the same as disabled.
  - The label wraps to two lines in an 87x58 px button.
  - No reason is given for the disabled state, and there is no cost or prerequisite note.

  (`cockpit_phone_filled.png`)
- **CONNECT**: primary `#2F5FE0` with **black text (`rgb(0,0,0)`) = 3.83:1**, 14 px system sans. There is no hint that it uses the microphone or what it costs.

**Right column, "TRANSCRIPT FEED":** "0 entries" and an empty state "Awaiting connection..." (12 px mono `#7A8397`).

**Fonts on this one page:**

| Font | Used for |
|---|---|
| Sora | H1 |
| JetBrains Mono | fields, labels, select, Test Call, Save Context, voices |
| Hanken Grotesk | sidebar |
| `ui-sans-serif` system stack | body, CONNECT, Top up |

**Responsive:**

- **1366x768:** fits, but SAVE CONTEXT drops below the Intel column's fold.
- **1024x768:** the layout stacks the transcript under the stage. **CONNECT (y ≈ 493–531) overlaps the Transcript Feed panel's top border (y ≈ 513)**, the orb is clipped at the top (`dashboard_1024x768.png`), and the Cockpit keeps working.
- **390 px:** Customer Intel (width 0) and the flow selector (width 0) are hidden. Mobile users cannot see or choose which flow they are testing (`dashboard_mobile.png`).

**States seen:** idle/standby; loading (a full-screen spinner); Test Call disabled when empty and enabled with any text; dark mode. Not seen: connecting, in call, ended, error.

**How it connects to other pages:**

- FLOW select → the profile's active flow → Meeting Agent's "Active flow (from profile)" [LIVE, same PATCH target]. There is no deep link to Flow Builder.
- Customer Intel ← the latest lead in Leads. There is no lead picker.
- The transcript feed and Call Reports have no visible link.
- Rep Console's back link is labelled "Dashboard". The page itself is named "Agent View" (nav), "AGENT COCKPIT" (H1) and "Agent" (mobile tab).

### 3.2 `/assistant`: "Assistant" (`assistant.png`)

**Purpose.** A chat copilot that "plans, then acts on your data". Its empty state promises: build & activate call flows, analyze a document into a flow, manage leads, place a call, search your knowledge base, and summarize your calls.

**Layout:**

- **Header:** a sparkles icon, H1 "Assistant" (Sora 20 px/700), and the subtitle "Describe what you need — I plan, then act on your data." On the right, "+ New chat" and "Voice" (title "Talk to the assistant"). Voice's click handler immediately connects a voice session to the "vaani" agent, or disconnects it if one is already running. It has no confirmation or mic-permission explainer. Not clicked.
- **Centre empty state:** an icon tile, H2 "What can I do for you?", an intro paragraph (13 px `#7A8397` = 3.52:1 on `#F4F6FA`), and four chips (13 px `#3E475A` on `#EEF1F7`):
  - "Build a sales call flow and activate it"
  - "Summarize my last 10 calls"
  - "Show my call analytics summary"
  - "Analyze this PDF → build a flow from it"
- **Composer:**
  - Attach button (title "Attach a file (pdf, txt, csv, xlsx, docx, json) — or drag it here").
  - A `<textarea>` with **no label or aria-label** (placeholder only: "Ask me to build a flow, summarize calls, add leads, place a call…", `#7A8397`).
  - A Send button (title only). It is disabled when empty and enabled after typing (checked with "test", then cleared).
- **Right panel "Plan & Actions":** the empty state "The plan and each action appear here live as I work."

**Persistence.** Conversation history lives in **`localStorage["vaani_assistant_chat"]`** (currently `[]`). History is per browser, not per account: it is lost on another device, a cleared browser or a teammate's machine, and there is no history list.

**Guardrails.** Nothing visible shows the approval mode, cost, recipients, or which flow would be activated. The first chip bundles "build **and activate**".

**Strength.** This is the clearest, most approachable page: plain-language capability statement, concrete starters, and a separate plan panel.

### 3.3 `/meeting-agent`: "Meeting Agent — Vikash" (`meeting_agent.png`, `_2`, `_3`, `_presentation_mode`, `_joinees`)

**Purpose.** Create a Vaani-hosted video room (`meet.vaanilabs.in/xxx-xxxx-xxx`) that the AI persona "Vikash" joins. The agent either follows a conversation flow or presents a deck. The page also shows active rooms, past meetings, agent-operations telemetry and a standalone PPT generator.

**Layout** (a single scroll container, `div.flex-1.overflow-y-auto`, 1853 px tall):

1. **Header.**
   - H1 "Meeting Agent — Vikash", with "— Vikash" in violet `#8B5CF6`. Everything is JetBrains Mono, so this page is mono throughout.
   - Subtitle "Deploy AI agent to video calls".
   - A pill **"Free minutes: 29 / 30"** that links to `/settings#meetings-billing`. It uses the same anchor pattern as the broken wallet links; the target was not verified.
2. **CREATE MEETING ROOM:**
   - Meeting Title, pre-filled "Product Demo with Vikash" (a value, not a placeholder). **Clearing it leaves "Create Room" enabled**, so there is no client validation.
   - Session Mode, a segmented control:
     - "Presentation (generate/show PPT)". Its hint: "The agent presents a deck — generating slides live **(present_topic)** or showing an attached one. No flow is run." There is **no attach or deck control** in this mode, and the flow select disappears.
     - "Conversation flow". Hint: "The agent follows the selected conversation flow."
   - Meeting Privacy, two cards:
     - "Open meeting — Anyone with the meeting link can join. Media uses TLS transport."
     - "Encrypted meeting — Guests must enter the private key in the browser before joining." This is selected by default. Nothing explains who receives the key or how.
   - "Conversation Flow (agent will follow this flow)": a select with "Active flow (from profile)" plus the same 16 flows **without the hash suffixes**. There are three pairs of identical labels: "Client A Realty (v2)", "Airport Passenger Support Flow" and "Client D Demo".
   - A full-width violet **Create Room** (white on `#8B5CF6` = 4.23:1).
3. **ACTIVE ROOMS (1)** with Refresh. One room card shows:
   - "ACTIVE", "1 participant", "Open".
   - The room ID in mono (a 22-character token).
   - The meet URL with Copy URL, and "2 joinees ▸". This expands to "Guest · <name>" rows with timestamps.
   - Buttons: **Agent** (title "Add AI agent to room"), **Intel** ("Meeting intelligence"), **Record** ("Start recording"), and an **icon-only red square titled "Delete room"** placed where a "stop" control would normally be.
4. **PAST MEETINGS (5):**
   - The list includes the **currently active room** (same URL, 23 Sept).
   - It includes QA artefacts: "**ZZ Mobile QA Room 22Sep**" and "**E2E Test Room 21Sep**".
   - Each row has only a URL, Copy URL and joinee count. There is no summary, recording, transcript or action items, even though the persona card lists "Meeting intelligence" and "Action item capture".
5. **Right column:**
   - Persona card: "Vikash — AI Meeting Agent", VOICE "Male Indian (Hindi)", ROLE "AI Product Expert", CAPABILITIES (Screen sharing, Product presentation, Meeting intelligence, Action item capture, Knowledge base access, Q&A).
   - **AGENT OPERATIONS:** AGENTS 1/3, SLOTS 2, STALE 0, RECORDING 0, and a room row with a "live" pill, **"82h 31m"** and "deck".
   - **GPU SERVER STATUS — Online.**
   - **BACKEND — "Meeting agent runs on port 8090" / "NEXT_PUBLIC_MEET_AGENT_URL".** This is internal engineering information shown to a customer.
6. **GENERATE PPT** (full width, at the bottom):
   - The text reads "Describe a deck and we'll generate 3 variants live. This is independent of meetings — **no LiveKit**, no in-meeting agent, no screen share required. Keep a variant, then download it as PPTX."
   - A textarea, "Slides per deck" (spinbutton, 5), and **Generate PPT** (disabled until there is text).

**Data consistency.**

- The room has been "live" for 82 h 31 m, yet STALE shows 0.
- The quota API reports only 60 s used this month. [INFERRED] The "live" timer measures an agent-less room that never closed. The metric is misleading either way.

**Mobile (390 px).** The page is **not in the mobile tab bar**. By URL, the scroll container overflows horizontally: "Conversation flow" and the privacy card text are clipped, and a horizontal scrollbar appears (`meeting_agent_mobile.png`).

**Connections:**

- The flow ← the profile's active flow, which the Cockpit writes.
- "Free minutes" → Settings Meetings Billing.
- The persona "Vikash" is also a Cockpit voice.
- Personal Agents has a "Video Meeting" capability that "delegates to the meeting agent".

### 3.4 `/personal-agents`: "Personal Agents" (`personal_agents.png`, `personal_agents_new_task.png`)

**Purpose.** Goal-based autonomous tasks: "Give your agent open-ended goals. It works persistently on its assigned number and contacts you to confirm anything irreversible. Tasks survive restarts — state lives in the task row."

**Layout:**

- A centred column (x ≈ 196–1316).
- Eyebrow "AUTONOMOUS TASKS": 10 px, **letter-spacing 2.5 px**, `#7A8397`.
- H1 "Personal Agents" in large Sora (~30 px).
- Header actions:
  - "SETTINGS", a link to `/settings/personal-agent`.
  - "REFRESH".
  - **"+ NEW TASK"**: Sora 11 px, 1.1 px tracking, **black on `#2F5FE0` = 3.83:1**.
- **"WHAT'S THIS FOR?"**
  - A paragraph with the typo "**goalinstead**" (missing space after the bold word).
  - Three cards: "Outbound follow-ups", "Multi-step errands", "Standing jobs". They are flat grey `#C3C5C8`, with titles at 10.35:1 and **descriptions `#7A8397` = 2.20:1**. They are **not interactive** (`cursor: auto`, no role, no handler) but look like disabled buttons.
  - A 12 px hint: "Use this when a job needs several steps or its own phone line — for a single scripted call flow, use the Flow Builder instead."
- Empty state: "No tasks yet. Click New task to give your agent a goal." (`/api/personal-agents/tasks?page=1&size=20`).

**New task** opens an inline panel below the cards, not a modal:

- **"NEW AGENT TASK"**.
- **GOAL**: a textarea with **no programmatic label**. The visual label is 10 px with 2.5 px tracking, 3.8:1. Placeholder: "e.g. Research the top 3 CRM vendors … and call me when it's ready."
- **CAPABILITY HINT (OPTIONAL)**: a select with 14 options: Let the agent decide, Web Research, News Digest, PDF Read, PDF Generate, Spreadsheet Read, Spreadsheet Generate, Presentation Generate, Document Draft, **Homework Analysis**, Appointment / Scheduling, Knowledge Base Lookup, Video Meeting, **Stock Research**.
- **START TASK is enabled while the goal is empty.**
- CANCEL.
- The "No tasks yet…" empty-state line stays visible under the open form.
- The form has no fields for contacts or leads, phone number, deadline or schedule, or a spend limit.

**`/settings/personal-agent`** (`settings_personal_agent.png`):

- **ASSIGNED NUMBER:** "No number assigned yet. Provisioning is admin-assigned — contact your administrator to get a number for your personal agent." This prerequisite blocks the page's core promise, and **it is not shown on /personal-agents**.
- **CONTACT PREFERENCE:** Call, WhatsApp (selected) or Email.
- **CAPABILITY AUTONOMY:** each capability has Auto / Confirm / Confirm + 2FA, including "**Stock Trade (live) — LOCKED** … coming soon. Pinned at Confirm + 2FA."
- SAVE SETTINGS.
- Two back links: a top bar "← BACK TO SETTINGS" and a breadcrumb "← Settings".
- No sidebar item is highlighted, because Settings is clipped off the rail.

### 3.5 `/rep-console` (single brief visit, `rep_console.png`)

- The back link "← Dashboard".
- H1 "Rep console" in mono sentence case.
- Description: "Browser softphone. Keep this tab open to take transferred calls without picking up your phone. Calls only land here when your Settings → Call channel is set to **Browser** or **Auto**."
- **Simply opening the page** fetches `/api/rep-softphone/token`, fires **POST `/api/profile/presence`** and opens a LiveKit WebSocket (`wss://vaanilabs.in/livekit/rtc/v1?access_token=…`). All of these were blocked by the guard. Visiting the page therefore marks the rep present, with no explicit "Go available" step.
- Observed under simulated network failure:
  - A pink error box: "**Could not connect** — could not establish signal connection: Websocket got closed during a (re)connection attempt:". This is the raw LiveKit SDK message, and there is no Retry button.
  - The status card reads "Offline", "Room: rep-<UUID>", "No active call", with Mute and End call disabled.
  - Meanwhile the global sidebar still shows the green "online" dot.
- The page doesn't show the current Call channel value or link to it.

---

## 4. Primary user journeys (reconstructed)

### J1. First run, then "You're live"

`/signup` → `/onboarding` (Profile → Subdomain → Flow → Test call → Done) → "Go to dashboard" (Cockpit).

**Breaks:**

- The completion screen claims "You're live." It ticks Test Call even though `completed_steps` lacks step 4.
- The account has Rs 0 wallet and no calling number.
- Onboarding never covers wallet, number (DID), knowledge or leads.
- After onboarding, no checklist exists. `/api/onboarding/state` is fetched on every page and never surfaced.

### J2. Set up an AI calling campaign (knowledge → flow → leads → call → reports)

Knowledge (upload/embed) → Flow Builder (build, validate, ACTIVATE) → prerequisites spread elsewhere (wallet on /billing, calling number under Settings → Calling number, call channel under Settings → Call channel) → Leads (call icon per row; shortcuts X / A / C) → Call Reports / Analytics.

**Breaks:**

- No page lists the prerequisites or deep-links them. The wallet banner's own links go to the wrong page (EXPLORE-CORE-01).
- There are three sources of truth for "which flow runs": Flow Builder ACTIVATE, the Cockpit FLOW select (which writes the profile), and Meeting Agent's "Active flow (from profile)".
- [INFERRED] There is no campaign object (schedule, pacing, retries, flow assignment), so bulk calling is "select all + C" in Leads.
- Duplicate flow names make choosing the right flow error-prone.

### J3. Run a test call (Cockpit)

`/dashboard` → pick FLOW (which silently saves to the profile) → pick voice (also saves) → CONNECT (browser mic) **or** enter a number → Test Call → watch the transcript → SAVE CONTEXT.

**Breaks:**

- Two call buttons with no explanation of the difference or the cost.
- Test Call accepts any text and looks disabled when it is enabled.
- Customer Intel is pre-filled with the latest real lead's name plus fake email, company and city, and a pre-call sentiment.
- There is no voice preview.
- The flow is truncated, has no edit link, and is hidden on mobile.

### J4. Deploy a meeting agent

`/meeting-agent` → title → mode → privacy → flow → Create Room → copy URL → Agent (add AI) / Intel / Record → … → Delete room.

**Breaks:**

- Presentation mode promises an "attached" deck but has no attach control. The generator is a separate section at the bottom.
- The Encrypted mode key handoff is unexplained.
- Past meetings have no outputs.
- A room has been "live" for 82 h with STALE 0.
- "Delete room" is an unlabelled red square next to Record.
- Internal backend and GPU panels are shown.
- There is no calendar scheduling here (Calendly and Google live in Settings).

### J5. Give a personal agent a goal

`/personal-agents` → New task → goal + capability hint → Start task → the agent works "on its assigned number" and confirms irreversible steps via WhatsApp, Call or Email (Settings → Personal Agent).

**Breaks:**

- No number is assigned, and it is admin-provisioned. That is only discoverable on the settings page.
- Start Task is enabled with an empty goal.
- The example cards look disabled and do nothing.
- There is no task preview, budget or schedule.
- The capability list mixes B2B work with homework and stocks.

### J6. Human hand-off

Flow Builder Human Handoff / Transfer Call node → Settings → Call channel = Browser/Auto → the rep keeps `/rep-console` open.

**Breaks:**

- It spans three surfaces.
- Presence is implicit on page load.
- There is no global "rep online" indicator, and the tab title is identical to every other tab.
- Raw SDK errors are shown.
- Rep Console is not reachable on mobile.

### J7. "Just ask" (Assistant)

This is the natural shortcut for less technical users. It has the same hidden prerequisites and no visible spend or activation guardrail. History is lost across devices (localStorage only).

---

## 5. Cross-page visual language (measured)

| Page | H1 text / case | H1 font | Body/control font | Primary CTA |
|---|---|---|---|---|
| Cockpit | "AGENT COCKPIT", upper | Sora 18/700, 0.9 px tracking | JetBrains Mono 9–14 px | CONNECT, blue, **black** text 3.83:1 |
| Assistant | "Assistant", title | Sora 20/700 | system sans 13 px | Send icon |
| Meeting Agent | "Meeting Agent — Vikash" | JetBrains Mono ~20, violet accent | Mono everywhere | Create Room, **violet** `#8B5CF6` |
| Personal Agents | "Personal Agents" + 2.5 px tracked eyebrow | Sora ~30 | system sans; tracked 10–11 px labels | NEW TASK, blue, black text |
| Rep console | "Rep console", sentence | Mono ~24 | Mono | none |
| Onboarding | "You're *live.*" | Sora + **serif italic** | tracked mono labels | Go to dashboard, blue, dark text |
| Sidebar | n/a | n/a | Hanken Grotesk 11–13 px | n/a |

Five typefaces or styles appear across the core surfaces: Sora, JetBrains Mono, Hanken Grotesk, the system sans stack and a serif italic.

Four primary colours are in use:

- blue `#2F5FE0`
- violet `#8B5CF6` (light) / `#7C6BF5` (dark primary)
- teal (Test Call)
- green (ACTIVATE, seen in scouting)

Button text on the primary is black or near-black in light mode.

**Shared secondary grey `#7A8397`:**

| Background | Contrast |
|---|---|
| White | 3.80:1 |
| `#F4F6FA` | 3.52:1 |
| Grey cards | 2.20:1 |

It is used for nav labels, field labels, descriptions, placeholders and empty states, so it fails AA wherever it is used for text. A proposed token, `#5B6478`, scores 5.48:1 on `#F4F6FA` and 5.93:1 on white.

---

## 6. Findings (most severe first)

### EXPLORE-CORE-01 · high · functional-bug: the wallet banner's "Top up" and "Enable autopay" go to the wrong page

- **Evidence.**
  - The links are `href="/settings#wallet"` and `/settings#autopay`.
  - Both open Settings → Profile Settings, which has no `#wallet` or `#autopay` element (`topup_link_target.png`). The wallet lives on `/billing`.
  - The banner is shown on every authenticated page while the balance is Rs 0.
- **Recommendation.**
  - Point them to `/billing#topup` and `/billing#autopay`, or open the top-up sheet in place.
  - Add a regression test that every banner CTA resolves to an element that exists.
  - Also check "Free minutes" → `/settings#meetings-billing`, which uses the same pattern.

### EXPLORE-CORE-02 · high · trust-safety: the Cockpit pre-fills a real lead's name next to fake demo email, company and city

- **Evidence.**
  - Customer Intel loads `/api/leads?limit=1`, and the name matches that lead.
  - The email, company and location values are not in the lead record (the lead's email is empty). They are demo placeholders.
  - "SENTIMENT POSITIVE 72" and "3 PREV. CALLS" show while the session is IDLE.
  - SAVE CONTEXT (title "agent will use this data") would feed this mix to the agent on a real call (`live_dashboard.png`).
- **Recommendation.**
  - Start empty ("Pick a lead or enter a number").
  - Add a lead picker.
  - Only show fields that exist on the lead, and mark their source.
  - Remove the demo seeds from production.
  - Show sentiment only after a call, labelled "Last call".
  - Rename the button "Use for this call" or "Save to lead", and say which one it does.

### EXPLORE-CORE-03 · high · ux: the Cockpit's flow and voice pickers silently save a profile setting that other surfaces also use

- **Evidence.**
  - Changing the FLOW `<select>` or clicking Vaani/Vikash fires `PATCH /api/auth/profile` straight away, once per change.
  - The Meeting Agent reads the same value as "Active flow (from profile)".
  - There is no confirmation, "saved" state, undo or explanation.
  - Under simulated network failure, the select stayed on the new value with no error, so the UI and server can diverge (`cockpit_flow_switched.png`, `cockpit_vikash_selected.png`).
- **Recommendation.**
  - Separate "flow for this test session" (local) from "default active flow" (an explicit setting with a Save and a toast).
  - Show "Active" and "Draft" badges in the picker.
  - Report save failures inline and roll back.
  - Link to "Edit in Flow Builder".

### EXPLORE-CORE-04 · high · responsive: the sidebar nav overflows on common laptop heights

- **Evidence.**
  - At 1440x900, nav `scrollHeight 572` > `clientHeight 548` and `scrollWidth 175` > `clientWidth 44`, with `overflow: auto` on both axes. Settings is half cut off, and a ◀▶ horizontal scrollbar draws over it (`live_dashboard.png`).
  - At 1366x768 and 1024x768 the overflow is 156 px. Billing, Knowledge and Settings are fully hidden (`dashboard_1366x768.png`, `dashboard_1024x768.png`).
- **Recommendation.**
  - Set `overflow-x: hidden` and remove the 175 px-wide hidden child.
  - Group items and move Settings and Billing into a pinned footer or account menu.
  - Reduce the pitch to 40 px.
  - Test down to 700 px of height.

### EXPLORE-CORE-05 · high · ia-navigation: the icon-only nav is hard to use without a mouse, and pages have several names

- **Evidence.**
  - The 12 links are named only by `title`, with no aria-label and no custom tooltip, while the theme toggle does have a custom tooltip.
  - Each item has two tab stops (a `DIV tabindex=0` inside the `<a>`). There is no skip link, and the focus ring is the default 0.8 px auto (`focus_state_nav.png`).
  - The same page is called "Agent View" (nav), "AGENT COCKPIT" (H1), "Dashboard" (Rep console back link, URL, onboarding CTA) and "Agent" (mobile tab).
  - "Meet Agent" (nav) vs "Meeting Agent" (H1).
  - There are no groups.
  - The expanded state is good (labels at 240 px, `[` shortcut) but is not the default, and its labels are `#7A8397` at 3.80:1.
- **Recommendation.**
  - Default to the expanded, grouped nav: Build / Engage / Insights / Account, with Assistant pinned.
  - Use one name per page.
  - Remove the inner tabindex.
  - Add a skip link and a 2 px `:focus-visible` ring.
  - Add aria-labels and custom tooltips on the collapsed rail.

### EXPLORE-CORE-06 · high · responsive: on mobile, half the app is unreachable and Sign out is a primary tab

- **Evidence.**
  - At 390 px the bottom bar is Assistant / Agent / Leads / Reports / Billing / Knowledge / **Exit**. Exit is a sign-out button with no aria-label.
  - Analytics, Flow Builder, Meeting Agent, Personal Agents, Rep Console and Settings have no entry point, and there is no "More" menu.
  - The Cockpit hides Customer Intel and the flow selector (width 0).
  - Meeting Agent overflows horizontally and clips content (`dashboard_mobile.png`, `meeting_agent_mobile.png`).
- **Recommendation.**
  - Use 4 tabs plus "More", a sheet listing all destinations and the account menu.
  - Move Sign out into the account sheet with a confirm.
  - Keep the flow picker visible on the Cockpit.
  - Fix the Meeting Agent's `min-width` and overflow.

### EXPLORE-CORE-07 · high · accessibility: primary buttons use black text on blue

- **Evidence.**

  | Element | Computed colours | Contrast |
  |---|---|---|
  | CONNECT | `rgb(0,0,0)` on `#2F5FE0` | 3.83:1 |
  | + NEW TASK | black on `#2F5FE0` | 3.83:1 |
  | Top up | `#111725` on `#2F5FE0` | 3.27:1 |
  | Onboarding "Go to dashboard" | dark text on blue (visually) | not measured |

  White on the same blue would be 5.48:1. [INFERRED] The primary-foreground token is shared with dark mode, where black on violet `#7C6BF5` is 5.28:1.
- **Recommendation.** Use theme-specific `--primary-foreground`: white in light mode. Add a contrast lint to the button component.

### EXPLORE-CORE-08 · high · accessibility: the secondary grey and tracked microtext fail AA across the core pages

- **Evidence.**
  - `#7A8397` is 3.80:1 on white and 3.52:1 on `#F4F6FA`. It is used for nav labels (13 px), field labels (9–10 px mono uppercase), descriptions, placeholders and "Awaiting connection...".
  - Personal Agents card descriptions are 2.20:1.
  - Test Call (enabled) is 2.95:1.
  - Eyebrows and labels are 10 px with 2.5 px letter-spacing ("AUTONOMOUS TASKS", "GOAL").
- **Recommendation.**
  - Secondary text token `#5B6478` (5.48:1 on `#F4F6FA`).
  - Minimum 12 px for labels.
  - Letter-spacing ≤ 0.08 em.
  - Never convey status only through low-contrast tint.

### EXPLORE-CORE-09 · high · ux: onboarding says "You're live" on an account that can't place calls, and no setup checklist exists afterwards

- **Evidence.**
  - `/onboarding` shows all steps ticked, including TEST CALL, and "You're *live.*" (`onboarding.png`).
  - `/api/onboarding/state` has `completed_steps [1,2,3,5]`, so step 4 is missing, yet `completed_at` is set.
  - The account has Rs 0 wallet and "No number assigned yet".
  - Onboarding does not cover wallet, number, knowledge or leads.
  - After onboarding, no page shows setup status, although every page fetches onboarding state.
- **Recommendation.**
  - Replace "You're live" with an honest readiness checklist: Flow ✓ · Test call ✗ · Calling number ✗ (contact admin / allocate) · Wallet ✗ (Top up) · Leads ✗ (Import).
  - Show it on a real Home/Overview page until complete.

### EXPLORE-CORE-10 · high · trust-safety: the Meeting Agent shows internal engineering details and QA data to customers

- **Evidence.**
  - Panels read "GPU SERVER STATUS — Online" and "BACKEND — Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL".
  - Copy mentions the internal function "(present_topic)" and the vendor "no LiveKit".
  - Past Meetings include "ZZ Mobile QA Room 22Sep" and "E2E Test Room 21Sep" (`meeting_agent_2.png`).
- **Recommendation.**
  - Move the operational panels behind an internal or admin flag.
  - Rewrite the copy in user terms.
  - Keep QA rooms out of production orgs, or let users archive them.

### EXPLORE-CORE-11 · medium · functional-bug: the meeting room lifecycle is inconsistent

- **Evidence.**
  - One room shows "live 82h 31m" with STALE 0 and AGENTS 1/3.
  - The same room appears in both ACTIVE ROOMS and PAST MEETINGS.
  - The quota shows only 60 s used this month.
  - Past meetings have no summary, recording or action items, although the persona lists "Meeting intelligence" and "Action item capture".
  - "Delete room" is an icon-only red square next to "Record".
- **Recommendation.**
  - Auto-end rooms that are idle or have no agent.
  - Mark stale rooms after N minutes.
  - Keep active and past lists separate.
  - Add "View summary / recording / action items" to past meetings.
  - Give Delete a text label and a confirm, and put it in an overflow menu.

### EXPLORE-CORE-12 · medium · ux: the flow pickers list duplicate names that can't be told apart

- **Evidence.**
  - There are 16 flows. Cockpit labels need 6-character hash suffixes (e.g. "Client A Realty (v2) · 9115a2" / "· f9b04a").
  - The Meeting Agent's select drops the suffixes, leaving 3 pairs of identical options.
  - Unversioned and versioned copies ("Appointment Scheduling" / "(v3)") and "Generated: …" drafts are mixed in.
  - The Cockpit select is 150 px wide at 10 px and truncated.
- **Recommendation.**
  - One flow-picker component with name, version, status badge (Active / Draft / AI draft) and last edited.
  - Group by status and hide archived.
  - Minimum width 240 px.
  - Add an "Open in Flow Builder" link.
  - Prompt users to rename duplicates.

### EXPLORE-CORE-13 · medium · ux: Test Call has no validation, and its states are unclear

- **Evidence.**
  - Typing "abc" enables Test Call. It is only disabled when the input is empty.
  - Enabled and disabled look almost the same (enabled 2.95:1).
  - The label wraps ("Test / Call") in an 87x58 button.
  - Nothing explains CONNECT (browser mic) vs Test Call (PSTN), or the cost with a Rs 0 wallet (`cockpit_phone_filled.png`).
- **Recommendation.**
  - Validate E.164 as the user types.
  - Present two clearly described choices: "Talk in browser (uses your mic)" and "Call a phone number · ~Rs x/min".
  - Show inline blocking reasons (No number / Wallet empty).
  - Use one primary style.

### EXPLORE-CORE-14 · medium · ux: Personal Agents hides its blocking prerequisite and doesn't validate the task form

- **Evidence.**
  - The page promises the agent works "on its assigned number". "No number assigned yet … contact your administrator" appears only on `/settings/personal-agent`.
  - START TASK is enabled with an empty goal.
  - The GOAL textarea has no programmatic label.
  - The example cards look disabled and are not clickable.
  - Typo "goalinstead".
  - Jargon: "state lives in the task row".
  - The empty-state line stays visible under the open form (`personal_agents.png`, `personal_agents_new_task.png`).
- **Recommendation.**
  - Add a prerequisites strip on the page: Number ✗ (request from admin), Contact channel: WhatsApp ✓.
  - Disable Start until there is a goal, and label the fields.
  - Turn the cards into "Start from template" buttons that pre-fill the goal.
  - Fix the copy.

### EXPLORE-CORE-15 · medium · content-copy: the capability catalogue blurs the B2B positioning

- **Evidence.**
  - The Personal Agent capabilities include "Homework Analysis", "Stock Research" and "Stock Trade (live) — LOCKED, coming soon", next to B2B items (Appointment scheduling, Knowledge base lookup).
  - The page examples are sales/ops ("chase these five overdue invoices").
- **Recommendation.**
  - Decide the audience.
  - For a B2B voice product, hide consumer or finance capabilities behind a feature flag.
  - Group the rest by job (Sales follow-up, Scheduling, Research, Documents).

### EXPLORE-CORE-16 · medium · trust-safety: the Assistant can act on the account without visible guardrails, and history stays in one browser

- **Evidence.**
  - The copy says it can "build & activate call flows … place a call". The first chip is "Build a sales call flow **and activate it**".
  - The Voice button connects a voice session on click (handler: `et.connect(void 0,"vaani")`).
  - No approval mode, cost or recipient preview is visible.
  - History is in `localStorage["vaani_assistant_chat"]` with no history list.
  - The composer textarea has no label.
- **Recommendation.**
  - Require plan approval for spend, contact or activation actions, showing the cost and the number of recipients.
  - Add an org setting "Assistant can: suggest / act with approval / act". This mirrors the good Auto/Confirm model in Personal Agent settings.
  - Store chats server-side with a history list.
  - Label the composer.
  - Rename the chip to "Draft a sales call flow".

### EXPLORE-CORE-17 · high · consistency: each core page uses its own typeface, primary colour and header pattern

- **Evidence.**
  - Measured: Sora (H1s), JetBrains Mono (Cockpit controls, all of Meeting Agent, Rep console), Hanken Grotesk (sidebar), system sans (body, buttons) and serif italic (onboarding) (see the section 5 table).
  - Primaries: blue, violet (Meeting Agent; the whole app in dark mode), teal (Test Call).
  - Title x position and case vary (AGENT COCKPIT uppercase, "Rep console" sentence case, "Meeting Agent — Vikash" mono).
- **Recommendation.**
  - One `PageHeader` component: 24 px sans title in sentence case, 14 px description, right-aligned actions.
  - One UI sans plus mono only for data (IDs, timers, numbers).
  - One primary colour in both themes.
  - Area accents only on icons.

### EXPLORE-CORE-18 · high · performance: every hard navigation shows a full-screen loader, and slow auth previously logged the whole browser out

- **Evidence.**
  - [LIVE] A hard navigation shows only a centred "Loading…" spinner with no shell until `/api/auth/me` returns. The first H1 appeared at 2.6 s (`/dashboard`) and 4.9 s (`/meeting-agent`).
  - [LIVE] Sidebar (client-side) navigation takes 0.8–1.2 s with the old page still visible and no progress indication.
  - [LIVE] The wallet is fetched 4 times per Cockpit load.
  - [PRIOR RUN] Two `/api/auth/me` calls failed after about 10 s (status 0). The tab went blank and then redirected to a bare `/login` with no `?next=` and no "session expired" message, while `sb-*` cookies were still present. Several tabs in the browser went to `/login` at the same time.
- **Recommendation.**
  - Render the app shell with skeletons straight away.
  - Only redirect on an explicit 401. On a timeout or 5xx, show "Reconnecting…" with a retry.
  - Make token refresh single-flight across tabs (`navigator.locks` or BroadcastChannel).
  - Preserve `?next=` and show a "session expired" notice.
  - Cache `/auth/me` and the wallet between routes.
  - Show a route-transition indicator.

### EXPLORE-CORE-19 · medium · ux: the global chrome has no account identity, unlabelled status, and no command palette or search

- **Evidence.**
  - No avatar, name, org or org switcher is visible in either rail state. The email and "RGN: Mumbai-1" exist only in the accessibility tree.
  - The status is a green dot plus "12ms" with no label (expanded: "SYS:ONLINE 10ms"). It stayed green while Rep Console showed "Offline".
  - Sign out sits unguarded between the nav and the theme toggle.
  - The theme tile says "DARK" with a sun icon.
  - "Collapse [" has a cryptic hint.
  - Ctrl+K and ? do nothing.
- **Recommendation.**
  - Add an account menu (avatar, name, org, plan and balance, theme, docs, sign out) at the bottom of the rail.
  - Show a labelled status ("All systems normal · 12 ms · Mumbai") linking to `/status`.
  - Add a Ctrl+K palette covering navigation, flows and leads.

### EXPLORE-CORE-20 · medium · content-copy: the wallet banner doesn't say what's blocked, and dismissing it only lasts for the tab

- **Evidence.**
  - The text "Wallet empty — top up now to keep calls flowing." shows no balance and no impact.
  - CONNECT stays enabled, and Meeting Agent shows 29/30 free minutes.
  - Dismiss is stored in `sessionStorage` (`vv:walletAlert:dismiss:zero`), so the banner reappears in every new tab.
  - It costs 42 px of height on every page.
- **Recommendation.**
  - State the balance and the concrete impact ("Outbound phone calls paused. Browser tests and 29 free meeting minutes still work").
  - Persist dismissal per user per day.
  - Show blocking reasons next to the affected actions.

### EXPLORE-CORE-21 · medium · ux: Rep Console goes online on page load and shows raw SDK errors

- **Evidence.**
  - Loading the page fires `/api/rep-softphone/token`, POST `/api/profile/presence` and a LiveKit WebSocket with no user action.
  - Under simulated network failure, the error was "could not establish signal connection: Websocket got closed during a (re)connection attempt:" with no retry, and the internal "Room: rep-<UUID>" is shown.
  - The current Call channel value is not shown or linked.
  - The page is unreachable on mobile.
- **Recommendation.**
  - Add an explicit Available / Away toggle and a mic test.
  - Use friendly error copy with Retry.
  - Show "Call channel: Browser · Change".
  - Hide IDs under "Details".
  - Add a global "Rep online" badge and a page-specific tab title.

### EXPLORE-CORE-22 · medium · responsive: at 1024 px the Cockpit's CONNECT overlaps the transcript panel

- **Evidence.** At 1024x768 the stage and transcript stack. CONNECT (y ≈ 493–531) straddles the Transcript Feed border (y ≈ 513), and the orb is clipped at the top (`dashboard_1024x768.png`).
- **Recommendation.**
  - Scale the orb with the viewport (for example `clamp(160px, 22vw, 320px)`).
  - Keep the controls in the normal flow above the transcript.
  - Test tablet widths.

### EXPLORE-CORE-23 · medium · accessibility: every route has the same document title

- **Evidence.** All app routes are titled "Vaani Labs - The Voice AI that speaks India" (WCAG 2.4.2).
- **Recommendation.** Use "<Page> · Vaani Labs", with live state for Rep Console and calls in progress.

### EXPLORE-CORE-24 · medium · trust-safety: session replay loads on pages that show personal data

- **Evidence.** PostHog `posthog-recorder.js`, `dead-clicks-autocapture.js`, `web-vitals.js` and `/flags` load on the Cockpit, Leads and Call Reports, which show names, phone numbers and transcripts.
- **Recommendation.**
  - Mask inputs and text in those containers (`ph-no-capture`) or disable replay on those routes.
  - Disclose PostHog as a processor.
  - Offer an org-level opt-out.

### EXPLORE-CORE-25 · medium · ux: Meeting Agent form validation and Presentation mode don't match what the page promises

- **Evidence.**
  - Clearing Meeting Title leaves Create Room enabled.
  - The title is a pre-filled value, not a placeholder.
  - Presentation mode says the agent can show "an attached one", but there is no attach control. PPT generation is a separate section at the page bottom.
  - The Encrypted key handoff is unexplained.
- **Recommendation.**
  - Require a title.
  - In Presentation mode, show "Attach deck" and "Generate from prompt" inline.
  - After creating an encrypted room, show a "Share key" step.

### EXPLORE-CORE-26 · low · consistency: the Personal Agent settings page has two back links and no active nav item

- **Evidence.** It has "← BACK TO SETTINGS" in a top bar and "← Settings" as a breadcrumb. No sidebar item is active (`settings_personal_agent.png`).
- **Recommendation.** Keep one breadcrumb, and highlight Settings in the nav.

### EXPLORE-CORE-27 · low · performance: a full-screen noise overlay sits at z-index 9999

- **Evidence.** `.noise-overlay` is `fixed`, `z-index: 9999`, `opacity: 0.02`, `pointer-events: none`, with an SVG noise background over the whole app.
- **Recommendation.** Drop it from the authenticated app, or limit it to marketing pages.

---

## 7. Strengths worth keeping

- **The Assistant's empty state.** It states its capabilities in plain language, offers four concrete starter prompts, and has a separate "Plan & Actions" panel that makes the agent's work visible.
- **The Personal Agent autonomy model** (Auto / Confirm / Confirm + 2FA per capability; irreversible actions default to Confirm, financial to Confirm + 2FA), plus the choice of contact channel. This is the right guardrail pattern to extend to the Assistant and the Cockpit.
- **Personal Agents explains itself** and points to Flow Builder for single scripted calls. It is the only cross-link of its kind.
- **The expanded sidebar** (240 px, clear labels, `[` shortcut, remembered state) is a good base to make the default.
- **The Cockpit's three-column model** (context | stage | live transcript) suits live call monitoring. It needs hierarchy and contrast work, not a new concept.
- **The Meeting Agent persona card** (voice, role, capabilities) is a good template for a unified "Agent profile" used across Cockpit, Meeting and Personal agents.
- **Privacy-aware masking** of phone numbers (`+91••••••NNNN`) in the Cockpit.
- **The onboarding completion screen's "three doors"** pattern. It needs honest readiness data.
- **The mobile bottom tab bar** exists. It needs a "More" menu and to move Sign out off the bar.
- **Dark mode** is complete across the core pages seen, and uses no cookies (localStorage only).

---

## 8. Open questions

1. Is Settings → Meetings Billing reachable from "Free minutes" (`/settings#meetings-billing`), or is it the same broken anchor pattern as the wallet links?
2. Does the Cockpit's profile "active flow" also drive inbound calls or Leads-initiated calls? [INFERRED yes; not verified]
3. What do the Assistant chips do: pre-fill the composer or send immediately? The handler is `()=>er(e)`, and I did not click.
4. What happens after CONNECT and Test Call (mic permission prompt, connecting and error states, cost confirmation)? Not exercised under the safety rules.
5. Why does `completed_steps` lack step 4 while the UI ticks Test Call, and is `/onboarding` linked from anywhere after first run?
6. Are the 82 h "live" rooms consuming an agent slot (AGENTS 1/3)?

---

## 9. Artefacts (`audit/screenshots/va-explore-core/`)

**Cockpit and global chrome:**

- `live_dashboard.png`
- `sidebar_hover_flowbuilder.png`
- `sidebar_expanded.png`
- `sidebar_expanded_footer.png`
- `dashboard_dark.png`
- `cockpit_phone_filled.png`
- `cockpit_vikash_selected.png`
- `cockpit_flow_switched.png`
- `focus_state_nav.png`
- `dashboard_1366x768.png`
- `dashboard_1024x768.png`
- `dashboard_mobile.png`

**Assistant:**

- `assistant.png`
- `assistant_typed.png`

**Meeting Agent:**

- `meeting_agent.png`
- `meeting_agent_2.png`
- `meeting_agent_3.png`
- `meeting_agent_presentation_mode.png`
- `meeting_agent_joinees.png`
- `meeting_agent_mobile.png`

**Personal Agents:**

- `personal_agents.png`
- `personal_agents_new_task.png`
- `settings_personal_agent.png`

**Rep Console, onboarding, wallet link and navigation:**

- `rep_console.png`
- `onboarding.png`
- `topup_link_target.png`
- `spa_transition_250ms.png`

**Earlier crops from the scout screenshots** (`crop_*.png`) remain in the folder.

**Guard log.** The blocked writes that my actions caused were:

- `PATCH /api/auth/profile` (flow select and voice toggle)
- `POST /api/profile/presence` and two LiveKit WebSockets (Rep Console load)
- PostHog

There were no popups. My browser window is closed.
