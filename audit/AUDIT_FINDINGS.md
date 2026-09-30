# Vaani Labs — Live Product UI/UX Audit

**Product:** https://vaanilabs.in/ (production), signed-in web app and signed-out public site
**Date:** 2026-09-26

## Scope and method

- **Who looked.** 16 specialist agents, one lens each: exploration (explore-core, -data, -settings), Flow Designer (flow-canvas, flow-config), UX (ux-audit), visual (visual-audit, design-system), responsive (responsive-a, -b), accessibility (a11y-auto with axe-core 4.10.2, a11y-manual), functional QA (qa-a, qa-b), the signed-out public site (public-site) and design research (no browser).
- **Who checked them.** 11 adversarial verifiers re-ran the high and critical claims in the live product and corrected severities and details. Every severity in this report is after those corrections.
- **Consolidation.** Raw findings (such as EXPLORE-CORE-06) were merged into F-UX, F-VIS, F-FLOW, F-RWD, F-A11Y and F-QA findings. Each lists its source IDs, a confidence level (verified, partially-verified, multi-agent, single-agent), screenshots under `audit/screenshots/` (1,093 files) and a recommendation. Raw reports are in `audit/raw/`.
- **Read-only network guard.** Every browser aborted all POST, PUT, PATCH and DELETE requests, WebSockets, analytics, OAuth, presence and payment calls, popups and downloads. When the app tried to write (such as the Flow Builder autosave PUT), the finding says "observed under simulated network failure".
- **Touched:** navigation of every reachable route; opening dialogs, drawers and menus; typing without submitting; keyboard, axe and contrast passes; viewports from 320 to 1920 px, both themes, reduced motion, and throttled and offline network.
- **Not touched:** Save, ACTIVATE, Private, Delete and Import on flows; every call control (CONNECT, Test Call, Call Now, bulk CALL, the Leads `c` key); top-up, Pay and autopay; sign-up, OTP, OAuth and sign-out; account deletion, invites and AI-draft Generate; the Rep Console softphone.
- **Data handling.** No customer or lead names, phone numbers or emails appear; customer flows get generic labels.

## Executive summary

Vaani Labs has a capable core (a React Flow call-flow builder, a leads CRM with calling, call reports with AI summaries, analytics and a prepaid INR wallet), but the live product does not yet behave like a tool you can trust to place real, billable calls to customers. The largest risk is Flow Builder data integrity: edits autosave straight into the flow used for live calls with no draft or publish step, opening a flow writes to it, the save chip says "Up to date" when saves fail, Undo does not reverse added nodes, and a green "FLOW VALIDATED" pill shows on invalid flows while ACTIVATE stays enabled. Status surfaces claim things that are not true: onboarding says "You're live" on an account with an empty wallet and no calling number, the rail's "SYS: ONLINE" is hard-coded, and Cockpit Customer Intel pairs a real lead with demo data. Setup dead-ends in several places: org creation loops back on itself so all five integrations stay disabled, the wallet banner's Top up opens Profile, and /signup lands new users on sign-in. Reporting is unreliable in both directions, because Call Reports shows only 50 of 121 calls and each browser test call is stored as two legs, which inflates every metric. Paid actions lack guardrails: a single `c` keypress on Leads places a billable call, and bulk calling shows no pre-flight check or cost preview before the click. For accessibility, the two core jobs (editing a flow and opening a call) are mouse-only, many fields are unlabelled, and low-contrast tokens leave 50–77% of text on data pages below AA. Visually there are five competing dialects, 16 font sizes, 80 button styles and a brand hue that changes with theme and feature, and on phones or at 200% zoom the navigation reaches only half the app. On the public site, /about claims a named bank pilot, a $12M Series A and SOC 2 Type II certification, all of which /security contradicts. The foundations are sound (a semantic token layer with complete light/dark pairs, a well-labelled flow toolbar, consistent phone masking and strong Settings safety patterns), so the work is consolidation and truthful state, not a rebuild.

## Severity counts

| Section | Critical | High | Medium | Low | Findings | Refuted |
|---|---:|---:|---:|---:|---:|---:|
| 1. Product understanding | – | – | – | – | descriptive | – |
| 2. Current design language | – | – | – | – | descriptive | – |
| 3A. Global, IA & navigation, UX & journeys, copy, trust | 1 | 11 | 33 | 3 | 48 | 0 |
| 3B. Visual design, consistency & design system | 0 | 3 | 23 | 11 | 37 | 0 |
| 3C. Flow Designer | 1 | 12 | 20 | 4 | 37 | 0 |
| 3D. Responsive behaviour | 0 | 5 | 12 | 2 | 19 | 0 |
| 3E. Accessibility (WCAG 2.2) | 2 | 7 | 20 | 1 | 30 | 10* |
| 3F. Functional bugs, performance, public site & auth | 1 | 12 | 22 | 5 | 40 | 0 |
| 5. Design-resource guidance digest | – | – | – | – | guidance | – |
| **Total** | **5** | **50** | **130** | **26** | **211** | **10*** |

\* No consolidated finding was refuted in any section. 3E's 10 are sub-claims the verifier refuted, could not reproduce or corrected; the other sections list such sub-claims in their appendices without counting them.

Totals count findings per section, not unique defects: some defects are reported under more than one lens and cross-referenced (for example F-FLOW-002 / F-UX-024 / F-QA-002, F-UX-002 / F-QA-004, F-UX-008 / F-RWD-001).

## Top 15 issues

| # | ID (related) | Severity | Issue |
|---|---|---|---|
| 1 | F-FLOW-001 | critical | Edits autosave straight into the live flow with no draft or publish step, and Backspace deletes connected nodes with no confirmation or undo toast. |
| 2 | F-UX-001 | critical | Org and team setup is a circular dead end, so all 5 integrations stay disabled and teammates cannot be invited. |
| 3 | F-QA-001 | critical | /about claims a named bank pilot, a $12M Series A and "SOC 2 Type II Certified", with a team that doesn't match the founders; /security contradicts these claims. |
| 4 | F-A11Y-001 (F-FLOW-006) | critical | Flow Builder nodes cannot be opened or connected by keyboard; the 54 handles are 9x9px and can't take focus (2.1.1 A). |
| 5 | F-A11Y-002 (F-UX-009) | critical | Call Reports details and transcript open only on a mouse click; rows have no tabindex, and the panel never gets focus. |
| 6 | F-QA-002 (F-FLOW-002, F-FLOW-003, F-UX-024) | high | Flow Builder writes to a flow that was only opened, and still shows "Up to date" when a save fails. |
| 7 | F-FLOW-004 (F-UX-004) | high | "FLOW VALIDATED" shows on invalid flows, the validator checks wiring only, and ACTIVATE works with errors present. |
| 8 | F-A11Y-004 (F-UX-013) | high | Single-letter shortcuts can't be turned off; `c` on Leads places a real, billable call with no confirmation. |
| 9 | F-QA-005 (F-UX-009) | high | Call Reports shows only the latest 50 of 121 calls, with no pagination; search, sort and filter cover only those 50. |
| 10 | F-QA-006 | high | Each browser test call is stored as two records (about 41 of 121), inflating call counts, minutes and sentiment. |
| 11 | F-UX-002 (F-QA-004) | high | The wallet banner's Top up and Enable autopay open Settings › Profile, which has no wallet. |
| 12 | F-UX-006 | high | Onboarding says "You're live" on an account that can't place calls, and nothing tracks setup afterwards. |
| 13 | F-QA-010 | high | /signup redirects to sign-in, so every "Get started" / "Start free" CTA lands new users on "Welcome Back". |
| 14 | F-RWD-001 (F-UX-008) | high | Phone and 200%-zoom navigation reaches only 6 of 12 sections, and sign-out ("Exit") takes a primary tab. |
| 15 | F-A11Y-008, F-A11Y-009 (F-VIS-003) | high | Muted token #7A8397 and black text on primary blue (3.27–3.83:1) fail AA; 50–77% of text on data pages fails. |

## Contents

1. **Summary** (this part), including sections 4 and 6 so they sit next to the totals
2. **1. Product understanding**: positioning, users, product map, connections, 13 journeys, IA, funnel (1.1–1.7)
3. **2. Current design language (as-is)**: tokens, components, competing styles, dark mode (2.1–2.8)
4. **3A. Findings — Global, IA & navigation, UX & journeys, content/copy, trust**: F-UX-001 to 048
5. **3B. Findings — Visual design, consistency & design system**: F-VIS-001 to 037
6. **3C. Findings — Flow Designer**: how the builder works today, F-FLOW-001 to 037
7. **3D. Findings — Responsive behaviour**: page x breakpoint matrix, F-RWD-001 to 019
8. **3E. Findings — Accessibility (WCAG 2.2)**: axe results per page, F-A11Y-001 to 030
9. **3F. Findings — Functional bugs, performance, public site & auth**: F-QA-001 to 040
10. **4. Strengths worth preserving** (below)
11. **5. Design-resource guidance digest**: rules checklist, starter tokens, anti-patterns, open decisions (5.1–5.11)
12. **6. Coverage & limitations** (below)

Each findings section ends with its own "Refuted / not reproduced" appendix.

## 4. Strengths worth preserving

Deduplicated from all 16 auditors; claims the verifier contradicted (descriptive node aria-labels, the "Autosave failed" chip) are left out.

**Design-system foundations**
- A real semantic token layer (32 CSS variables, complete light/dark pairs) on Next.js and Tailwind v4 `@theme`, so tokens can be formalised without a rewrite.
- A consistent neutral ramp (#111725 / #3E475A on #F4F6FA / #EEF1F7 / white, #E1E6EF hairlines); common values already converge (8px radius, 4/8/12/16 padding). One icon library (Lucide).
- A React Button with variants and a focus-visible ring that can become the only button; `.input-vani` has focus and error states.
- Call Reports and Assistant (calm sans, sentence case, title + description + right-aligned actions) are the page template to copy. The marketing site's Hanken Grotesk type system is the one to adopt.
- Dark mode is the more coherent theme: 7–19% of text fails contrast in dark versus 31–78% in light.

**Flow Builder**
- React Flow base with minimap, zoom/fit/lock, box select, arrow-key nudge and protected Start/End nodes; deleting a node can be undone.
- A fully labelled toolbar (shortcut in every aria-label), palette buttons that add nodes without dragging, synonym-aware palette search and a polite live region.
- The validator's per-error Jump button, which should become the source of truth for the status pill; "Preview AI script" and helpful inspector hints.
- Flow Settings, AI draft and Preview dialogs are built correctly (dialog role, focus trap, Esc, focus return): the template for every other modal.

**Daily work and data**
- Phone numbers are masked the same way (+91••••••NNNN) across Leads, Cockpit, Call Reports and Analytics.
- The Leads keyboard model (/, J/K, X, A, Esc) has an on-screen legend. The bulk-selection bar is the right base for campaigns.
- Call Reports search covers transcripts; the detail panel has an AI summary, satisfaction, topics and a timestamped transcript; badges pair icon and text.
- Analytics explains itself (metric tooltips, computed times, expandable rows). The New lead and Import dialogs state limits, autofocus and close on Esc; empty states give a next step.
- UPI-native top-up with ₹100/500/1000 presets. The Cockpit's context | stage | transcript layout needs hierarchy work, not a rethink.

**Guardrails and trust patterns**
- Delete Account (lists what is deleted and kept, typed-email confirmation, 7-day grace), dual-confirm Change Email, and a transparent Data Export.
- API Keys scope cards with a shown-once/hash-only warning; Webhooks documents HMAC-SHA256.
- The 3-step Calling number stepper (Owned → Compliance → Authorized): the model for every setup page.
- Personal Agent autonomy levels (Auto / Confirm / Confirm + 2FA): reuse them for the Assistant and the Cockpit.
- The Assistant's empty state and the Personal Agents explainer are the most approachable pages. 14 of 17 Settings items already have URLs, so a restructure is mostly layout and redirects.

**Accessibility, engineering and responsive**
- Basics: `lang`, zoom allowed, alt on every image, one h1 and one `main` per app page; toggles expose `aria-pressed`; shortcuts are ignored while typing.
- No uncaught JS errors or 4xx/5xx on app pages in normal use; unknown routes return a real 404.
- No page scrolls sideways at document level at any tested width; a labelled mobile bottom bar; Flow Builder has a real phone mode; Billing and /login reflow cleanly from 1920 to 360.

**Public site**
- The "Hear it work" industry × scenario × English/Hindi demo and the India-specific use-case cards (EMI, DPD, COD, RBI data residency).
- A candid /security page ("no external audit yet"), the /build.html personal demo-agent concept, and well-structured /docs/api.

## 6. Coverage & limitations

- **Read-only by design.** Saves, submits, calls, payments, sign-up and sign-out were never exercised, so server-side outcomes are marked inferred: whether autosaved edits reach live calls, whether ACTIVATE validates on the server, whether two-leg calls are billed twice, whether Pay validates amounts, whether Exit confirms.
- **WebSockets blocked.** Live call audio, LiveKit meeting rooms, the Rep Console softphone and the real-time transcript were not observed working. /rep-console was left out of the accessibility pass because it registers a live softphone.
- **Browser reset.** One browser reset after a hung tool call interrupted an earlier run; its signed-out events came from the reset, not token expiry, and the work was re-run. EXPLORE-CORE-18 (slow auth dropping to a bare /login) was seen only in that run. Sections 3A–3C were resumed after a stalled writing pass and re-checked against the raw reports.
- **Failed sections: none.** All 16 auditors reported and all 9 sections were written.
- **Mobile.** Phones and tablets were tested with viewport resizing and CDP touch emulation, not real devices. iOS zoom-on-focus, safe-area overlap, the on-screen keyboard and touch pan/pinch on the canvas still need a real-device check.
- **Assistive technology.** No screen reader was run. Statements about what is announced come from the accessibility tree.
- **Account state.** One member-role account (16 flows, 24 leads, 121 calls, ₹0 wallet); admin views were not seen as an admin, and some findings depend on this state (the wallet banner shows only while the wallet is empty).
- **Not tested:** file downloads (CSV/PDF export), OAuth and OTP flows, and the /build.html live demo.
- **Open discrepancies:** 3A records the verifier confirming Embed Copy writes a clean snippet, while 3F calls it unresolved; 3D says Settings is reachable on phones only by URL, while 3A notes the wallet banner links also open it while the wallet is empty.
- **Point in time.** This is a snapshot of production on 2026-09-26.

---

## 1. Product understanding

> **Scope and sources.** This section describes the product and has no findings list. It draws on six raw reports: `explore-core`, `explore-data`, `explore-settings`, `flow-config`, `public-site` and `ux-audit`. All were captured on 2026-09-26 against production, read-only, at 1440×900, with checks at 1366×768, 1024×768 and 390×844.
>
> **Account state at audit time:**
>
> | Item | Value |
> |---|---|
> | Flows | 16 |
> | Leads | 24, all status NEW |
> | Calls | 121 |
> | Knowledge files | 5 |
> | Wallet | ₹0.00 |
> | Free meeting minutes | 29 of 30 |
> | Meeting rooms | 1 active, 5 past |
> | Personal-agent tasks | 0 |
> | Account role | "member" |
>
> **Conventions.** Anything marked *(inferred)* is the auditors' reasoning, not a direct observation. Finding IDs use the raw-report prefixes EXPLORE-CORE, EXPLORE-DATA, EXPLORE-SETTINGS, FLOW-CONFIG, PUBLIC-SITE and UX-AUDIT. Customer, lead and flow-owner business names are replaced with generic labels ("a real-estate flow").

### 1.1 What Vaani Labs is, and how it positions itself

**In one sentence:** Vaani Labs is a SaaS for Indian businesses. It runs **AI voice agents on phone calls**, and each call follows a node-based **call flow** that the customer builds visually. Around that core sit a meeting agent, autonomous "personal agents", an in-app copilot, a lightweight leads CRM, call reporting, analytics, a RAG knowledge base, a browser softphone for human hand-off, and a developer platform (API keys, embeddable widget, webhooks, MCP/SDKs). Usage is paid from a prepaid INR wallet with UPI autopay.

**Product layers.** The UI presents four layers. The rail does not group them (see 1.6).

| Layer | Job | Surfaces |
|---|---|---|
| **Build** | Define what the agent says and knows | Flow Builder (`/flow-builder`), including Flow settings with the "Soul.md" persona prompt and AI draft; Knowledge (`/knowledge`); Assistant, which can "build & activate call flows" |
| **Run / Engage** | Hold conversations | Agent Cockpit (`/dashboard`); Leads (`/leads`), with per-row and bulk calling; Meeting Agent (`/meeting-agent`); Personal Agents (`/personal-agents`); Rep Console (`/rep-console`); the embed widget and public API (outside the app UI) |
| **Review** | Understand outcomes | Call Reports (`/call-reports`), Analytics (`/analytics`) |
| **Configure / Account** | Telephony, integrations, developer access, money | Settings (17 items); Billing (`/billing`); API Keys, Embed and Webhooks (`/api-keys`, `/api-keys/embed`, `/webhooks`) |

**Five different AI actors are all called "agent" or carry a persona name.** "Vaani" is also the brand. See EXPLORE-CORE-05 and EXPLORE-SETTINGS-13.

| # | Actor | Where it lives | Persona / voice | What it does |
|---|---|---|---|---|
| 1 | Phone voice agent | Cockpit, Leads, inbound number, API "Voicebot"/"Textvoice" scopes | "Vaani" (female / warm) or "Vikash" (male / direct). The descriptors appear only in the Leads drawer. | Places and answers calls by following a flow |
| 2 | Meeting agent | `/meeting-agent`; rooms on `meet.vaanilabs.in` | "Vikash", "Male Indian (Hindi)", "AI Product Expert" | Joins a Vaani-hosted video room. It either follows a flow or presents a deck. |
| 3 | Personal Agents | `/personal-agents`, `/settings/personal-agent` | None; "works … on its assigned number" | Works on open-ended goals. Each capability has an autonomy setting: Auto / Confirm / Confirm + 2FA. |
| 4 | Assistant | `/assistant` | None | An in-app copilot: "I plan, then act on your data" |
| 5 | Assistant voice mode | "Voice" button on `/assistant` | Connects to the "vaani" agent | A voice session with the copilot |

The labels "Agent View" (the Cockpit) and "Agent Knowledge" (the RAG store) add two more uses of the word.

**Positioning as stated, and where it conflicts:**

| Dimension | What the product says | Where it conflicts | Ref |
|---|---|---|---|
| Tagline | `<title>` on every public and app page: "The Voice AI that speaks India" | The home hero, "Voice AI agents that handle every call.", never mentions India. The rotating language pill showed Arabic, Indonesian, German, Spanish and Hindi. | PUBLIC-SITE-07 |
| Languages | "40+ languages" (hero) | "12+ Indian" (meta description, pricing, about); "10+" (build page); "all 22 scheduled" (about). The build page's select has 22 options. The in-app Leads language filter has 6 (Hindi, English (IN), Tamil, Telugu, Marathi, Bengali). | PUBLIC-SITE-07 |
| Latency | "Sub-second" (hero) | "Sub-200ms" (meta, pricing, about). The app rail shows a live "12ms" latency. | PUBLIC-SITE-07 |
| Channels | Phone, WhatsApp, browser and meetings | Home says "drop the agent into Zoom, Meet, and Teams". Pricing and docs say LiveKit/Daily rooms. The app only creates `meet.vaanilabs.in` rooms. | PUBLIC-SITE-07 |
| Commercial model | Home: "Free tier · No credit card · build your first agent in minutes" | Sign-up: "Register for early access (admin approval required)". `/pricing`: a sales-led paid-pilot form with no prices. `/docs/api/billing`: prepaid, "no plans", per-second rates (4 paise/s textvoice and voicebot, 8 paise/s meeting agent, 1 paise/s meeting). In-app: an INR wallet with UPI autopay, plus meeting minutes as pay-as-you-go at ₹2.40/min after 30 free, alongside plan cards (₹499/mo, ₹1,999/mo, …). | PUBLIC-SITE-04, EXPLORE-SETTINGS-10 |
| Compliance | `/security` and home: SOC 2 Type II readiness "in progress", no external audit yet, observation window Q4 2026 | `/about`: "SOC 2 Type II Certified". Changelog: "compliant architecture". Build page: "DPDP + RBI compliant by default". | PUBLIC-SITE-01, PUBLIC-SITE-02 |
| Name | "Vaani Labs" | "VaaniLabs", "VaaniVoice" (enterprise copy, `X-VaaniVoice-Signature`, SDK/MCP package names), "VV API", "Vani Voice" (Settings › Docs), "StarVox Labs" (consent text) | PUBLIC-SITE-06, EXPLORE-SETTINGS-12 |
| Audience breadth | B2B verticals: e-commerce, lending and collections, healthcare, real estate, insurance, education | Personal Agent capabilities include "Homework Analysis", "Stock Research" and "Stock Trade (live) — coming soon", which read as consumer or retail-investor features | EXPLORE-CORE-15 |

**Net reading.** The intended positioning is India-first, B2B voice automation for SMB and mid-market teams, with an enterprise-pilot path on top.

- **The most coherent expressions of it** are the home page's "Hear it work" demo (industry × scenario × English/Hindi) and the India-specific industry cards (EMI, DPD, COD, RBI data residency).
- **The app is broader than the positioning explains.** It has five agent types plus a developer platform.
- **The commercial model is described four incompatible ways:** free tier, approval-gated early access, sales-led pilot, and prepaid pay-as-you-go.

### 1.2 Target users and jobs-to-be-done

**How users were identified.**

- *Account data (inferred from it):* flows for real-estate lead qualification, tele-calling scripts, appointment scheduling, airport passenger support and mutual-fund calling; leads sourced "Manual"/"Demo".
- *Marketing verticals:* the six industries above.
- *Enterprise signals:* `/enterprise` and `/security` are written for procurement.
- *Operator signals:* the Leads keyboard model (`/`, J/K, X, A, C), which suits people who work through lists at volume.

| Persona | Jobs-to-be-done | Primary surfaces | How well the product serves the job today |
|---|---|---|---|
| **Buyer: founder or ops lead** (Indian SMB / mid-market) | Get an agent answering or placing calls this week. Know what it costs. See ROI. | `/`, `/pricing`, `/onboarding`, `/billing`, `/analytics` | No price or usage is shown anywhere in the app (UX-AUDIT-08). Onboarding declares "You're live." on an account that cannot place calls (EXPLORE-CORE-09). |
| **Enterprise evaluator / procurement** | Scope a pilot and pass the security review | `/enterprise`, `/security`, `/pricing` pilot form, `/docs` | `/security` is candid and strong. Other pages contradict it (PUBLIC-SITE-01, PUBLIC-SITE-02). |
| **Flow builder / operator** | Script the call, teach the agent, validate, and put it live safely | `/flow-builder`, `/knowledge`, `/assistant` | Edits autosave into the flow that calls use (FLOW-CONFIG-01). There is no in-builder test (FLOW-CONFIG-10) and no visible "live" state (FLOW-CONFIG-07). |
| **Sales / tele-calling / support operator** | Load a list, then call it in the right language and voice with the right flow, and follow up | `/leads`, `/dashboard`, `/call-reports` | The bulk bar exists, but there is no pre-flight check or cost shown (UX-AUDIT-04). There is no campaign object *(inferred; `/campaigns` returns 404)*. |
| **QA / analyst / manager** | Find a call, read the transcript, and understand drop-off, intent and sentiment | `/call-reports`, `/analytics` | Search and the detail panel work, but metrics disagree between pages (EXPLORE-DATA-17) and the transcript is buried (UX-AUDIT-09). |
| **Human rep (hand-off target)** | Take transferred calls without a desk phone | `/rep-console`, `/settings/call-channel` | The rep goes online simply by visiting the page (UX-AUDIT-24). The Call channel copy says the browser bridge "hasn't shipped" (UX-AUDIT-07). Not reachable on mobile. |
| **Meeting host / presales** | Run a demo or meeting with an AI presenter and capture the outcomes | `/meeting-agent` (+ Generate PPT) | Rooms never close, and past meetings have no summary, recording or action items (EXPLORE-CORE-11). |
| **Individual delegator** | Hand off multi-step errands and follow-ups, with confirmation before irreversible steps | `/personal-agents`, `/settings/personal-agent` | Blocked by an admin-assigned number that only the settings sub-page mentions (EXPLORE-CORE-14). |
| **Developer / integrator** | Embed the voice widget, call the API, receive events | `/api-keys`, `/api-keys/embed`, `/webhooks`, `/docs/api`, `/docs/integrations` (MCP, OpenAPI, SDKs) | These are orphan pages (EXPLORE-SETTINGS-07). Snippets display corrupted (EXPLORE-SETTINGS-04). 3 of 5 in-app doc links return 404 (EXPLORE-SETTINGS-03). |
| **Org admin / platform admin** | Create the org, invite the team, connect integrations, provision numbers, approve sign-ups | `/settings/organization`, `/admin/organizations`, `/admin` | A circular dead end for this "member" account (EXPLORE-SETTINGS-02). `/admin` silently redirects to `/dashboard`. |

**The role model is invisible.** The chrome shows no avatar, name, org or role (EXPLORE-CORE-19). The role "member" appears only on Analytics §01. Pages gated by role (`/admin`, and *probably* `/knowledge/proposals`) redirect to `/dashboard` without saying why (EXPLORE-DATA-02). Several personas above therefore cannot tell which of their jobs they are allowed to do.

---

### 1.3 Product map

**How the inventory was built.** Routes come from three sources: the rail links, in-page navigation, and same-origin GET probes (`explore-settings` §3.4). Every route listed returned 200 unless noted otherwise.

**Groups:**

- A. Global chrome
- B. Engage / Run
- C. Build
- D. Review
- E. Money
- F. Settings, developer and admin
- G. Onboarding
- H. Public site and auth

**Column meanings.** "Key actions" lists what a user can do on the view. "Notable states" lists what was observed, with the finding IDs that cover it.

#### A. Global chrome (every authenticated page)

| View | Purpose | Key components | Key actions | Notable states |
|---|---|---|---|---|
| **Left rail** (desktop ≥768 px) | Primary navigation | A 72 px fixed icon rail with the logo, 12 links and a footer. The footer holds an unlabelled green status dot with latency ("12ms"), a Sign-out icon, the theme toggle and Expand. | Navigate. Expand or collapse with the button or the `[` key (stored in `localStorage["vv:sidebar:collapsed"]`). Toggle theme. Sign out. | <ul><li>Labels come only from native `title` tooltips.</li><li>Each item takes 2 tab stops, and there is no `aria-current`.</li><li>At 900 px viewport height the nav overflows (Settings is clipped, and a horizontal scrollbar appears). At 768 px viewport height, Billing, Knowledge and Settings are hidden.</li><li>No active item is highlighted on `/settings/*`, `/api-keys` or `/webhooks`.</li></ul>(EXPLORE-CORE-04, EXPLORE-CORE-05, EXPLORE-SETTINGS-07) |
| **Expanded rail** | Labelled navigation | 240 px wide. It pushes the content rather than overlaying it. Footer reads "SYS:ONLINE 10ms", "Sign out", "DARK", "Collapse [". | Same as the rail | All 12 items fit. Labels are 3.80:1 contrast. The user's identity is not shown in either state (EXPLORE-CORE-19). |
| **Wallet banner** | Warn that the balance is ₹0 | `role="alert"`, 42 px tall, text "Wallet empty — top up now to keep calls flowing." | "Top up" → `/settings#wallet`; "Enable autopay" → `/settings#autopay`; Dismiss (stored in `sessionStorage`) | <ul><li>Both links land on Settings › Profile, even when clicked on `/billing` (EXPLORE-CORE-01, EXPLORE-DATA-01, EXPLORE-SETTINGS-01, UX-AUDIT-02).</li><li>It renders about 2.7 s late and pushes the layout down (UX-AUDIT-17).</li><li>It comes back in every new tab (EXPLORE-CORE-20).</li></ul> |
| **Mobile bottom bar** (<768 px) | Primary navigation on phones | 7 tabs: Assistant, Agent, Leads, Reports, Billing, Knowledge, **Exit** | Navigate. Exit signs the user out. | Analytics, Flow Builder, Meeting Agent, Personal Agents, Rep Console and Settings have no entry point (EXPLORE-CORE-06, EXPLORE-SETTINGS-08). |
| **Auth gate / loader** | Resolve the session | A full-screen "Loading…" with no shell until `/api/auth/me` returns | none | <ul><li>The first H1 appears at 2.6 s on `/dashboard` and 4.9 s on `/meeting-agent`.</li><li>Every load calls `/api/auth/me`, `/api/orgs?include=membership`, `/api/onboarding/state` and `/api/billing/wallet`.</li><li>In the prior run, an expired session sent the user to a bare `/login` with no `next=` (EXPLORE-CORE-18).</li></ul> |
| **Theme** | Light/dark | The toggle sets `html.dark` and `localStorage["vv:theme"]` | Toggle | The app defaults to light. In dark mode the primary colour changes from blue `#2F5FE0` to violet `#7C6BF5`. |
| **Document title / search** | none | Every route has the same `<title>`. There is no command palette and no global search. | none | EXPLORE-CORE-23, EXPLORE-CORE-19 |

#### B. Engage / Run

| Route / sub-view | Purpose | Key components | Key actions | Notable states |
|---|---|---|---|---|
| **`/assistant`**, "Assistant" | A chat copilot that plans, then acts on account data | <ul><li>Header: "+ New chat" and "Voice".</li><li>Empty state: "What can I do for you?" with 4 starter chips ("Build a sales call flow and activate it", "Summarize my last 10 calls", …).</li><li>Composer: Attach (pdf, txt, csv, xlsx, docx, json), an unlabelled textarea, and Send.</li><li>A right-hand "Plan & Actions" panel.</li></ul> | Ask. Attach a file. Start a voice session (connects to the "vaani" agent). New chat. | <ul><li>Send is disabled while the composer is empty.</li><li>History is kept only in `localStorage["vaani_assistant_chat"]`.</li><li>No approval, cost or recipient guardrail is visible (EXPLORE-CORE-16, UX-AUDIT-29).</li><li>It is the clearest page in the app.</li></ul> |
| **`/dashboard`**. Rail: "Agent View". H1: "AGENT COCKPIT". Mobile: "Agent". | A single-session console for test and live calls, and the default route | <ul><li>Status line: IDLE pill, clock, "LAT", a 150 px **FLOW** select (with hash suffixes such as "· 9115a2"), Refresh flows, "SESSION: IDLE".</li><li>Left, **CUSTOMER INTEL**: 6 fields, sentiment bar, duration, previous-calls count, SAVE CONTEXT.</li><li>Centre stage: orb, voice toggle **Vaani / Vikash**, `+91…` phone input, **Test Call**, **CONNECT**.</li><li>Right, **TRANSCRIPT FEED**: "0 entries / Awaiting connection...".</li></ul> | <ul><li>Pick flow and voice. Each change fires `PATCH /api/auth/profile`.</li><li>CONNECT starts a browser-microphone session.</li><li>Test Call dials the typed number.</li><li>Save Context.</li></ul> | <ul><li>Intel is pre-filled from `/api/leads?limit=1` (a real lead's name) mixed with demo email, company and city (EXPLORE-CORE-02, UX-AUDIT-05).</li><li>The profile is written silently (EXPLORE-CORE-03).</li><li>Test Call accepts "abc" (EXPLORE-CORE-13).</li><li>Only the idle state was observed.</li><li>At 390 px the flow select and Intel column are hidden.</li><li>At 1024 px CONNECT overlaps the transcript (EXPLORE-CORE-22).</li></ul> |
| **`/leads?page=1&size=50`**, "LEADS" | A lightweight CRM list for the agent to call | <ul><li>Header: Refresh, Export, Import CSV, New lead.</li><li>KPI strip: Open pipeline, New, Interested+, Avg interest.</li><li>A keyboard legend.</li><li>Search.</li><li>Status chips (8), Source chips (7), Language and Outcome selects.</li><li>A div-grid list (checkbox, avatar, name, masked phone, location, age, status, interest, call icon) with pagination.</li></ul> | <ul><li>Search (`/`), move (J/K), select (X, A), call (C), clear (Esc).</li><li>A row opens the drawer. Selecting rows opens the bulk bar.</li><li>New lead, Import, Export.</li></ul> | <ul><li>24 leads, all NEW, Interest empty everywhere.</li><li>Filters are not kept in the URL (EXPLORE-DATA-11).</li><li>About 730 px of empty columns (EXPLORE-DATA-08).</li><li>Select-tooltips contain developer notes (EXPLORE-DATA-03).</li></ul> |
| ↳ Lead drawer (inline `aside`, ~440 px) | One lead's details and outbound configuration | <ul><li>Status/source, date added, phone, Interest, Calls count.</li><li>**OUTBOUND CONFIG**: voice VIKASH/VAANI, Language, Flow ("Active flow (profile default)" plus 16).</li><li>Call Now, "WA" (WhatsApp).</li><li>CALL HISTORY (provider name and status).</li><li>DELETE LEAD.</li></ul> | Call, WhatsApp, change config, delete | <ul><li>The bottom of the drawer is clipped, and its header scrolls under the filter bar (EXPLORE-DATA-09).</li><li>A call from a month earlier still reads "QUEUED" under the carrier name (UX-AUDIT-22).</li><li>The drawer's call count disagrees with the Cockpit's.</li></ul> |
| ↳ Bulk bar (floating) | Call many leads at once | "n SELECTED · VIKASH/VAANI · AUTO-DETECT · DEFAULT FLOW · × · CALL n" | CALL n | <ul><li>Calling is the only bulk action (EXPLORE-DATA-07).</li><li>No cost, balance, calling-hours or consent check (UX-AUDIT-04).</li></ul> |
| ↳ New lead modal | Add one lead | 8 fields: Name\*, Phone\*, Email, City, Region, Source, Status, Notes | Create lead, Cancel, Esc | <ul><li>No dialog semantics or associated labels.</li><li>Phone accepts "abc".</li><li>Esc throws away typed input (EXPLORE-DATA-13, UX-AUDIT-15).</li></ul> |
| ↳ Import leads dialog | Bulk import | Step 1: Template.csv. Step 2: drop zone (CSV/XLSX, ≤5 MB, phone column required). | Verify & import | Clear, two-step layout. The entry button says "IMPORT CSV" even though XLSX is accepted. |
| **`/meeting-agent`**. Rail: "Meet Agent". H1: "Meeting Agent — Vikash". | Create Vaani-hosted video rooms that the AI persona joins | <ul><li>**Create meeting room**: title (pre-filled), Session Mode (Presentation / Conversation flow), Privacy (Open / Encrypted, with Encrypted the default), Flow select ("Active flow (from profile)" plus 16).</li><li>**Active rooms**: URL, Copy, joinees, and buttons Agent / Intel / Record / Delete room.</li><li>**Past meetings** (5).</li><li>Persona card.</li><li>**Agent operations** (agents, slots, stale, recording).</li><li>GPU server status and a BACKEND panel.</li><li>**Generate PPT** (3 variants, downloadable as PPTX).</li></ul> | Create room. Copy URL. Add the AI agent. Intel. Record. Delete room. Generate a deck. | <ul><li>A room has shown "live" for 82 h with STALE 0.</li><li>The active room also appears under Past meetings.</li><li>Past meetings have no outputs (EXPLORE-CORE-11, UX-AUDIT-21).</li><li>Internal infrastructure is visible (port, environment-variable name, GPU) (EXPLORE-CORE-10).</li><li>Presentation mode has no way to attach a deck (EXPLORE-CORE-25).</li><li>A "Free minutes 29 / 30" pill links to `/settings#meetings-billing`.</li></ul> |
| **`/personal-agents`**, "Personal Agents" | Goal-based autonomous tasks run on the agent's own number | <ul><li>Eyebrow and H1.</li><li>SETTINGS, REFRESH, "+ NEW TASK".</li><li>"What's this for?" with 3 cards that look clickable but aren't, and a hint to use Flow Builder for single scripted calls.</li><li>Task list (`/api/personal-agents/tasks`).</li></ul> | New task opens an inline panel: **Goal** plus **Capability hint** (14 options), Start task, Cancel. | <ul><li>0 tasks.</li><li>Start task is enabled with an empty goal.</li><li>The number prerequisite is hidden (EXPLORE-CORE-14, UX-AUDIT-25).</li><li>The capability list mixes B2B and consumer items (EXPLORE-CORE-15).</li></ul> |
| ↳ `/settings/personal-agent` | Personal-agent preferences | <ul><li>**Assigned number**: "No number assigned yet … admin-assigned".</li><li>**Contact preference**: Call / WhatsApp (selected) / Email.</li><li>**Capability autonomy**: Auto / Confirm / Confirm + 2FA for each capability, with "Stock Trade (live)" locked.</li></ul> | Save settings | <ul><li>Reached only from the Personal Agents header.</li><li>Two back links, and no rail item is active (EXPLORE-CORE-26).</li><li>The autonomy model is a strength.</li></ul> |
| **`/rep-console`**, "Rep console" | A browser softphone for calls transferred to a human | "← Dashboard" back link, explanatory copy, status card (Offline / Room / No active call), Mute, End call | No explicit control. Loading the page fetches `/api/rep-softphone/token`, POSTs `/api/profile/presence` and opens a LiveKit WebSocket. | <ul><li>The rep becomes "present" just by visiting.</li><li>Under simulated failure the page shows a raw SDK error with no Retry, while the rail dot stays green (EXPLORE-CORE-21, UX-AUDIT-24).</li><li>The page doesn't show the current Call channel.</li><li>Not reachable on mobile.</li></ul> |

---

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

---

#### F. Settings, developer and admin

**The Settings shell.** `/settings` has an H1 "SETTINGS", an always-enabled global **Save Changes** button, and a 17-item sub-nav.

- **Three items are in-page tabs.** Profile, Meetings Billing and Docs switch panels without changing the URL.
- **Fourteen items are links that leave the shell.** Each carries a misleading external-link glyph (EXPLORE-SETTINGS-05).
- **Seven save models are used across Settings** (EXPLORE-SETTINGS-06).

| Route / sub-view | Purpose | Key components and actions | Notable states |
|---|---|---|---|
| Profile (in-page, the default) | Personal information | Identity card (email, status APPROVED), Full name, Phone, **Subdomain** (LIVE, Edit), **WhatsApp brochure** upload, **Google** and **Microsoft** Connect | Mixes personal, org, agent-content and integration settings (EXPLORE-SETTINGS-18). The inputs have no associated labels. Phone accepts "abc". There is no unsaved-changes guard. |
| Docs (in-page) | In-app documentation links | 5 rows: API Reference, Embed Guide, Webhook Events, Integrations Guide, Flow Builder Guide | 3 of the 5 return 404 and land on an off-shell "SIGNAL LOST" page (EXPLORE-SETTINGS-03). |
| `/settings/organization` | Org administration | An empty state: "…or create your own org below", with only "Browse organizations →" below it | A dead end (EXPLORE-SETTINGS-02). |
| `/settings/notifications` | Notification channels | Email: 4 switches that autosave. WhatsApp: LOCKED ("Add a WhatsApp number first"). | No WhatsApp-number field exists anywhere. The page has 4 back links (EXPLORE-SETTINGS-15). |
| `/settings/call-channel` | Where transferred calls ring | Radio cards: **Phone (PSTN)** (default), **Browser softphone**, **Auto**. "Save preference". | A "Heads up" box says Browser and Auto fall back to PSTN because the softphone bridge hasn't shipped, even though Rep Console exists (UX-AUDIT-07). |
| `/settings/calling-number` | Verify your own caller ID | A 3-step stepper (Owned → Compliance → Authorized), a phone input, "Send code" | A clean model. "Send code" enables for "abc". |
| `/settings/calendly` | Calendar booking integration | An OAuth explainer and "Connect Calendly" | Kept apart from Integrations. |
| `/settings/security` | Account security | Only a two-factor (TOTP) "Enable" card | No password, session or device management (EXPLORE-SETTINGS-14). |
| `/settings/activity` | Audit ledger | 13 category chips, a date range, and a TIME / EVENT / TARGET / IP / AGENT table | Empty for an active account. "Suspicious activity?" links to Profile (EXPLORE-SETTINGS-19). |
| `/settings/integrations` | Channel and CRM connectors | Instagram, Facebook, WhatsApp, HubSpot, Salesforce | All five Connect buttons are disabled because the user isn't an org admin. The reason sits below the fold. |
| `/settings/data-export` | Data portability | The most recent export (READY), Download (.zip), Request a new export (limited to 1 per 24 h) | Two equal-weight primary buttons (EXPLORE-SETTINGS-24). |
| `/settings/change-email` | Move the login address | Current email, new email, "Send confirmation links" (both addresses must confirm) | Well explained. Invalid input still enables the button, and the icon overlaps the input text. |
| `/settings/delete` | Account deletion | What is deleted and what is kept, a reason field, a typed-email confirmation, a 7-day grace period | The best-built Settings page. |
| **`/api-keys`** (outside `/settings`) | Public API keys | Name; scopes **Textvoice / Voicebot / Meeting agent / Plain meeting**; a rate-limit slider (1–600, recommended 60); "Mint key"; "Your keys" | An orphan page: no back link and no active rail item (EXPLORE-SETTINGS-07). "Shown exactly once" is stated clearly. |
| **`/api-keys/embed`** | Guide for the embeddable voice widget | A magazine-style layout (§00–§04), code snippets with Copy, a live preview | The displayed code is corrupted, but Copy copies clean code (EXPLORE-SETTINGS-04). The preview column is only 182 px wide. |
| **`/webhooks`** (+ `/webhooks/deliveries`) | Event delivery to customer systems | "+ New webhook" modal: name, HTTPS URL, and events **call.completed, call.failed, meeting.ended, lead.created, usage.charged, low_balance.warned**. Also shows how to verify signatures. | Invalid URLs are allowed. The modal has no dialog semantics. Opening deliveries without an ID shows "Webhook not found." |
| `/admin/organizations`, `/admin` | Admin area | An org list: "Create one to get started", with no create control. `/admin` redirects to `/dashboard`. | A dead end and a silent redirect. |
| In-app 404 | Unknown routes | "404 / SIGNAL LOST … STATUS: DISCONNECTED", shown outside the app shell | EXPLORE-SETTINGS-22 |

#### G. Onboarding

| Route | Purpose | Key components and actions | Notable states |
|---|---|---|---|
| `/onboarding` | First-run wizard | "VAANI LABS — first run" with a stepper: **Profile → Subdomain → Flow → Test call → Done**. Then "You're *live.*", three "doors" (Flow Builder, Call Reports, Analytics) and "Go to dashboard". | <ul><li>Still reachable after completion, but nothing links to it.</li><li>The Test call step shows as ticked, yet `/api/onboarding/state` reports `completed_steps [1,2,3,5]`.</li><li>It never covers wallet, number, knowledge or leads (EXPLORE-CORE-09, UX-AUDIT-19).</li><li>The page scrolls horizontally at 1440 px (EXPLORE-SETTINGS-23).</li></ul> |

#### H. Public site and auth (signed out)

| Route | Purpose | Key components and actions | Notable states |
|---|---|---|---|
| `/` | Marketing home | <ul><li>Nav: Product, Enterprise, Pricing, Docs, Integrations, Contact, "Build your own", theme, Log in, **Get started**.</li><li>Hero: **Start free** and **Talk to the agent**.</li><li>**"Hear it work"**: a recorded-call demo you switch by industry, scenario and English/हिंदी.</li><li>Analytics and flow-builder teasers.</li><li>Industries carousel, channels, testimonials, security block.</li><li>Final CTAs: Start free, Talk to sales, View pricing.</li><li>Footer.</li></ul> | <ul><li>Every "start" CTA goes to `/signup`.</li><li>"Talk to the agent" only scrolls to the recorded demo (PUBLIC-SITE-20).</li><li>Dead anchors: Product, Features, Demo (PUBLIC-SITE-10).</li><li>In light mode the nav disappears when scrolled (PUBLIC-SITE-08).</li><li>React hydration error #418 fires.</li><li>The theme toggle is out of sync on load (PUBLIC-SITE-09).</li></ul> |
| `/pricing` | "Enterprise pilot" intake | 3 step cards, an 18-field "Start a pilot" form, "Every plan includes" | No prices, no site nav, and an "Email us" link on a third-party domain (PUBLIC-SITE-05). |
| `/enterprise` | Pilot and readiness narrative | Its own nav (Pilot, Security, API, "Scope pilot"), readiness stats, proof-package cards | Reads like an internal runbook and calls the product "VaaniVoice" (PUBLIC-SITE-11). |
| `/security` | Security practices (§01–§13) | A sticky table of contents. Covers hosting region, row-level security, encryption, webhook signing, incident response and a compliance roadmap. | The site's best trust asset, and the most honest about compliance. |
| `/docs`, `/docs/api`, `/docs/api/billing`, `/docs/integrations`, `/docs/samples` | Developer documentation | A hub of 7 cards; the API reference; per-second prices; MCP server, Claude Skill, OpenAPI 3.1 and Node/Python SDKs | 3 of the 7 hub cards are not links. Each docs page uses a different design language (PUBLIC-SITE-06, PUBLIC-SITE-10). |
| `/contact` | Talk to people | Founder cards with meeting booking, and a 4-field form | Contact addresses span 3 domains, and there are two different "Talk to sales" destinations (PUBLIC-SITE-21). |
| `/build.html` | Self-serve live demo ("Build My Agent") | Scenario, a 22-option Indian-language select, voice (Vaani/Vikash), company, "trickiest moment", mobile, email with an OTP, a consent checkbox | A separate static site with its own nav; its "Get started" goes to `/login`. The strongest conversion idea on the site, but it is only labelled "Build your own" (PUBLIC-SITE-20). |
| `/changelog`, `/about`, `/status`, `/careers`, `/blog`, `/privacy`, `/terms`, `/refund-policy`, `/cookies` | Company and trust pages | Latest changelog entry is Feb 2026. About has a timeline and team. Status shows fixed uptime figures. | <ul><li>About contains placeholder-like claims (PUBLIC-SITE-01).</li><li>Status looks static (PUBLIC-SITE-12).</li><li>Careers says "Coming Soon".</li><li>Blog posts cannot be opened.</li><li>`/robots.txt` and `/sitemap.xml` return 404.</li></ul> |
| `/login` | Sign in, plus a sign-up toggle | **Sign-in:** Continue with Google, Continue with Meta (OAuth with `next=/dashboard`), email and password, Forgot password, **Sign in with Magic Link**.<br><br>**Sign-up (toggle):** "Create Account — Register for early access (admin approval required)", with name, email, phone and password. | <ul><li>A light, blue theme, unlike the dark violet marketing pages.</li><li>Labels aren't associated with inputs, and password has `autocomplete="off"` (PUBLIC-SITE-13).</li><li>Two different validation patterns (PUBLIC-SITE-14).</li><li>No Terms/Privacy acknowledgement.</li></ul> |
| `/signup` | Account creation | A server redirect to `/login` in **sign-in** mode | Every acquisition CTA lands on "Welcome Back" (PUBLIC-SITE-03). |
| `/forgot-password` | Password recovery | Email field and a one-time link valid for 60 minutes | Properly labelled. The icon overlaps the input text. "Create an account" loops back to sign-in. |

**Probed and not found (404).** The inventory is as notable for what is missing:

| Area | Missing routes |
|---|---|
| Hubs and objects | `/home`, `/campaigns`, `/agents`, `/contacts`, `/inbox`, `/meetings`, `/usage` |
| Help and team | `/help`, `/team`, `/settings/members`, `/settings/team` |
| Settings and billing | `/settings/wallet`, `/settings/billing`, `/profile`, `/integrations`, `/notifications` |
| Aliases | `/flows` and `/calls` (both 404 from a different handler), `/flow-designer`, `/reports` |

So the app has **no Home or overview, no campaign object, no team or members page, and no in-app help hub**.

---

### 1.4 How the pieces connect

**Six shared objects** hold the product together:

1. **Flow**: the Flow Builder record.
2. **Profile defaults**: the "active flow" and the voice, stored on the user profile.
3. **Lead**
4. **Call record**
5. **Knowledge file**
6. **Account resources**: wallet, phone numbers, org and role.

Most connections between surfaces are **implicit**. A value written on one page is read on another with no link, label or confirmation between them. The diagram below shows data and control flow as observed. Dashed notes mark inferred links.

```
                       ┌──────────────────────── KNOWLEDGE (files → embeddings, RAG) ◄─────────────┐
                       │  read by: Knowledge Query / FAQ nodes · Assistant · Meeting agent ·      │
                       │           Personal-agent "Knowledge Base Lookup"                          │
                       ▼                                                                           │
 ASSISTANT ──"build & activate"──► FLOW ◄── Flow Builder (autosave PUT on open + every edit)       │
                                    │   └─ ACTIVATE: "for all your calls"                          │
   Cockpit FLOW select + voice ─────┼── PATCH /api/auth/profile ──► PROFILE (active flow, voice)   │
                                    │                                   │                          │
        ┌───────────────────────────┼───────────────────┬───────────────┼───────────────┐          │
        ▼                           ▼                   ▼               ▼               ▼          │
  Cockpit CONNECT /          Leads Call Now /     Meeting Agent    Inbound number   Personal agent │
  Test Call                  bulk CALL n          "Active flow     (not allocated)  (own number,   │
  (intel ← latest LEAD)      ("Default flow")     (from profile)")                   not assigned) │
        │                           │                   │                                          │
        └──────────────► CALL RECORDS ◄─────────────────┘                                          │
                            ├─► Call Reports (121 calls; captured flow fields as columns)          │
                            │        └─ "Learn from this call" ┄┄► /knowledge/proposals ┄┄┄┄┄┄┄┄┄┄┄┘
                            │                                     (redirects to /dashboard)
                            ├─► Analytics (§02 KPIs · §04 flow step drop-off · §05 intents · §07 recent → "Open report")
                            ├─► Lead drawer call history (carrier status; lead status never advances)
                            └┄► WALLET debit (inferred; 158 min used vs ₹0 and 0 transactions)

 Transfer node ─► Settings › Call channel (PSTN / Browser / Auto) ─► Rep Console open in a tab
 Book Meeting node ─► Google Calendar (connected in Profile) / Calendly (own page)
 WhatsApp node ─► "User's Brochure (auto)" ← Profile brochure upload; WhatsApp connector locked (org admin only)
 CRM Lookup node ─► "Integrations → Live Lookup" connector (no such card on /settings/integrations)
```

**Connection matrix.** For each connection: how it works, whether a user can see it, and what goes wrong.

| # | From → To | Mechanism (observed) | Visible to the user? | Gap | Ref |
|---|---|---|---|---|---|
| 1 | Flow Builder → Cockpit | The Cockpit FLOW select lists all 16 flows, with 6-character hash suffixes. The builder auto-opens the flow whose ID matches the Cockpit's selection. | No | No "Edit in Flow Builder" link. No Active or Draft badge. The select is truncated at 150 px. | EXPLORE-CORE-12 |
| 2 | Cockpit → Profile → Meeting Agent and Leads | Changing the flow or voice fires `PATCH /api/auth/profile`. Meeting Agent reads it as "Active flow (from profile)". The Leads drawer reads it as "Active flow (profile default)". The bulk bar reads it as "Default flow". | No; the write is silent | The flow is never named where it is used. Save failures are not reported. Choosing a flow for a test session changes the default everywhere. | EXPLORE-CORE-03, UX-AUDIT-06 |
| 3 | ACTIVATE ↔ profile active flow | ACTIVATE says "for all your calls". The profile value is per user. | Partly | It is unclear whether the active flow belongs to the org or the user. The already-active flow has no "Live" marker. | FLOW-CONFIG-07 |
| 4 | Flow edits → live calls | Every edit autosaves (`PUT /api/flows/<id>`) into the same record the Cockpit uses | No | There is no draft/published split, so half-finished edits are probably live *(inferred)*. | FLOW-CONFIG-01, UX-AUDIT-01 |
| 5 | Flow Builder → Knowledge | Knowledge Query selects one file or all. FAQ creates a backing file on save. | One-way | File names show raw storage keys. You cannot test a node's search from the node. | FLOW-CONFIG-14 |
| 6 | Flow Builder → Integrations | See the three sub-rows below this table. | No | Dependencies are not checked or surfaced. | FLOW-CONFIG-18, EXPLORE-SETTINGS-02 |
| 7 | Flow → Rep Console | Transfer node → Settings › Call channel (Browser/Auto) → rep keeps `/rep-console` open | No | The chain spans three surfaces. The Call channel copy says the browser route hasn't shipped. PSTN forwards to a Profile phone that is empty. | UX-AUDIT-07 |
| 8 | Flow → Call Reports and Analytics | Captured node answers become dynamic columns in Call Reports (a union across all flows) and "Flow Builder fields" in the detail panel. Analytics §04 shows per-step drop-off. | Yes (data) | No link from a step back to its node. Duplicate labels ("Condition Check" ×3) cannot be told apart. | EXPLORE-DATA-04, EXPLORE-DATA-05 |
| 9 | Leads → Cockpit | Customer Intel auto-fills from `/api/leads?limit=1`, the most recent lead | No picker | A real name is mixed with demo email, company and city. Counts disagree (3 previous calls vs 1). | EXPLORE-CORE-02, UX-AUDIT-05 |
| 10 | Leads → Calls → Leads | Call Now, bulk CALL n and the `C` key use the voice, language and flow chosen. The drawer lists call history. | Partly | Lead status stays NEW after calls. A month-old call still says "QUEUED". There is no campaign object. | EXPLORE-DATA-08, UX-AUDIT-22 |
| 11 | Analytics → Call Reports | §07 row → "Open report ›" | **Yes** | One of the few explicit cross-links. | none |
| 12 | Call Reports → Knowledge | "Learn from this call" probably feeds `/knowledge/proposals` *(inferred)* | No | The proposals page redirects to `/dashboard`. | EXPLORE-DATA-02 |
| 13 | Calls → Billing | Wallet debits *(inferred)* | No | Billing shows 0 transactions against 158 minutes used, with no usage ledger. The banner's Top up goes to the wrong page. | EXPLORE-DATA-17, UX-AUDIT-08 |
| 14 | Meeting Agent → Billing | "Free minutes 29 / 30" → `/settings#meetings-billing`. Meetings Billing → "Open wallet → /billing". Pay-as-you-go minutes debit the wallet. | Partly | Money is split across three places (see 1.6). | EXPLORE-SETTINGS-10 |
| 15 | Meeting Agent ↔ Cockpit ↔ Personal Agents | The "Vikash" persona is both a Cockpit voice and the meeting agent. The Personal-agent capability "Video Meeting" delegates to the meeting agent. | No | There is no shared agent profile. Voice descriptors appear only in the Leads drawer. | EXPLORE-CORE-05 |
| 16 | Personal Agents → Telephony and Notifications | Tasks run on an admin-assigned number, and confirmations go by WhatsApp (the default), Call or Email | Only on `/settings/personal-agent` | No number is assigned. The WhatsApp number field doesn't exist, and Notifications shows WhatsApp as LOCKED. | EXPLORE-CORE-14, EXPLORE-SETTINGS-18 |
| 17 | Analytics → numbers | §01 "Allocate a number from billing" (not a link) | Text only | Billing cannot allocate numbers. There are three unlinked number concepts: allocated inbound number, verified caller ID (Settings), and personal-agent number. | EXPLORE-DATA-21, UX-AUDIT-07 |
| 18 | Assistant → everything | Can build and activate flows, analyse a document into a flow, manage leads, place calls, search knowledge, and summarise calls | Plan panel only | No approval, cost or recipient preview is visible. History is stored only in the browser. | EXPLORE-CORE-16 |
| 19 | Developer surfaces → product | API scopes map to products (Textvoice, Voicebot, Meeting agent, Plain meeting). Webhook events cover calls, meetings, leads and billing. | No | Not linked from the product pages they expose. The pages are orphans reached only via Settings. | EXPLORE-SETTINGS-07 |
| 20 | Onboarding → every page | `/api/onboarding/state` is fetched on every load | Never shown | Step 4 is incomplete but hidden. There is no setup checklist. | UX-AUDIT-19 |
| 21 | Org and role → Integrations and admin pages | The org-admin role gates the Connect buttons, proposals *(inferred)* and `/admin` | No | Org creation is a circular dead end, and gated pages redirect silently. | EXPLORE-SETTINGS-02 |

**Row 6 detail (Flow Builder → Integrations):**

- **CRM Lookup** needs an "Integrations → Live Lookup" connector. No such card exists on `/settings/integrations`.
- **Book Meeting** defaults "Add to Google Calendar" to ON. Google is connected from Profile, not from Integrations.
- **WhatsApp** attaches the Profile brochure. The WhatsApp connector's Connect button is disabled for non-admins.

**Sources of truth that conflict.** These are the root causes behind most of the journey breaks in 1.5.

| Question the user asks | Competing answers |
|---|---|
| Which flow do my calls use? | <ul><li>ACTIVATE ("for all your calls")</li><li>Cockpit FLOW select (the profile)</li><li>Meeting Agent "Active flow (from profile)"</li><li>Leads "Default flow" / "Active flow (profile default)"</li><li>The flow the builder autosaves into</li></ul> |
| Which voice is the default? | VAANI in the Cockpit; VIKASH in the Leads bulk bar and drawer |
| How long are calls? | 1m 18s (Analytics) vs 90s (Call Reports KPI); 1:27 (table) vs 87s (panel) |
| What kind of call was it? | INBOUND/OUTBOUND (Analytics) vs BROWSER (Call Reports). Each test call is logged as two rows. |
| Which phone number? | <ul><li>Profile "Phone"</li><li>Settings › Calling number (verified caller ID)</li><li>Analytics "Allocated DID" (pending)</li><li>The personal agent's "assigned number"</li><li>The Transfer node number</li><li>The Notifications WhatsApp number (no such field exists)</li></ul> |
| What have I spent, and what does it cost? | <ul><li>Billing: ₹0 and 0 transactions</li><li>Analytics: 158 minutes</li><li>Meetings Billing: ₹2.40/min after 30 free</li><li>Public API docs: 4/8/1 paise per second</li><li>`/pricing`: no prices</li></ul> |
| Am I ready to go live? | <ul><li>Onboarding: "You're live."</li><li>The wallet banner: ₹0</li><li>Personal Agents settings: "No number assigned yet"</li><li>Analytics: number PENDING</li></ul> |

---

### 1.5 Primary user journeys (as-is)

**How to read this.** Each journey is written as the steps a user takes today.

- **BREAKS** means the user is blocked, misled, or put at risk.
- **UNCLEAR** means the user has to guess.
- Ratings (1–5) come from `ux-audit` where it scored the journey.
- Steps that were not executed because of the read-only rules (Save, ACTIVATE, CONNECT, any call, Create Room, Start task, Pay) are described up to the click.

#### J1. First run and orientation (rating 2/5)

1. The visitor clicks "Start free" or "Get started" and lands on `/signup`, which redirects to `/login` in sign-in mode. **BREAKS**: a new user sees "Welcome Back" (PUBLIC-SITE-03).
2. They find the 12 px grey "Sign up" toggle and submit name, email, phone and password, or use Google or Meta OAuth. **UNCLEAR**: the form says "early access (admin approval required)", which contradicts "Free tier" (PUBLIC-SITE-04).
3. An admin approves the account. The changelog mentions an "approve/reject workflow", and Profile shows STATUS APPROVED. **UNCLEAR**: there is no stated turnaround or confirmation message *(not observable)*.
4. `/onboarding` runs Profile → Subdomain → Flow → Test call → Done, then shows "You're *live.*". **BREAKS**: Test call is ticked although the API never recorded it. The account has ₹0 and no number (EXPLORE-CORE-09).
5. "Go to dashboard" opens the Agent Cockpit: dense, idle, with no welcome and no next step. **BREAKS**: there is no setup checklist anywhere (UX-AUDIT-19).
6. The user tries to orient using 12 unlabelled rail icons, 3 of which are "agent" concepts. **UNCLEAR**: EXPLORE-CORE-05, UX-AUDIT-11.
7. They see the wallet banner and click Top up, which lands on Profile Settings. **BREAKS**: UX-AUDIT-02.

The prerequisites for going live (wallet, calling number, call channel, transfer phone) are spread across 4 or more pages that are never linked together (UX-AUDIT-07).

#### J2. Build or edit a call flow and put it live (rating 2/5)

1. Rail → Flow Builder. The builder auto-loads the profile's flow and writes to it on open. **BREAKS**: FLOW-CONFIG-02, UX-AUDIT-01.
2. The user picks a flow in "All flows". **UNCLEAR**: duplicate names, fake "(vN)" versions and no Live column (FLOW-CONFIG-06).
3. To create a flow instead, they use … → New flow, which instantly swaps in the default template, or AI draft, which replaces the canvas. **BREAKS**: no name prompt, template picker or confirmation, and the template itself is invalid (FLOW-CONFIG-08, FLOW-CONFIG-19).
4. They add nodes from the palette. **BREAKS**: new nodes stack on top of existing ones, unconnected (FLOW-CONFIG-05).
5. They configure each node in the side panel. **UNCLEAR**: no variable picker; invalid values are applied anyway (FLOW-CONFIG-12, FLOW-CONFIG-17).
6. They wire outcomes by handle position (YES at the bottom, NO on the right). **UNCLEAR**: FLOW-CONFIG-11.
7. Every edit autosaves into the same record. **BREAKS**: changes are probably live mid-edit, the chip says "Up to date" even when saves fail, and quick navigation loses the last edit (FLOW-CONFIG-01, FLOW-CONFIG-03).
8. They click Validate. **BREAKS**: the "FLOW VALIDATED" badge stays green over real errors, and validation checks connectivity only (UX-AUDIT-03, FLOW-CONFIG-04).
9. Preview AI script is the only form of test. **BREAKS**: there is no simulator or "call me with this draft" (FLOW-CONFIG-10).
10. Save and/or ACTIVATE. **UNCLEAR**: Save's purpose is unexplained when autosave already runs. ACTIVATE stays enabled with errors and looks the same on the already-active flow (FLOW-CONFIG-07).
11. To hear the flow, the user must switch to the Cockpit (J4). Nothing links the builder to the Cockpit.

#### J3. Teach the agent (Knowledge)

1. Rail → Knowledge.
2. Pick a mode (file, text, URL or CSV) and choose Upload/Save/Fetch & Embed. **UNCLEAR**: the CSV mode is identical to file upload and gives no guidance (EXPLORE-DATA-19).
3. The file appears under a storage-key name with Embed and Delete buttons. **UNCLEAR**: nothing shows whether it has been indexed.
4. Test Knowledge Search. **BREAKS**: under failure, the error renders off-screen (EXPLORE-DATA-18).
5. In Flow Builder, reference the file from a Knowledge Query or FAQ node. **UNCLEAR**: raw file names appear in the select (FLOW-CONFIG-14).
6. Later, from Call Reports, "Learn from this call" leads to Review proposals. **BREAKS**: that page silently redirects to `/dashboard` (EXPLORE-DATA-02).

#### J4. Run a test call from the Cockpit (rating 2/5)

1. `/dashboard` is the default route.
2. Pick a FLOW. **BREAKS**: this silently rewrites the profile default that Meetings and Leads use (EXPLORE-CORE-03).
3. Pick a voice (Vaani or Vikash). **UNCLEAR**: there is no preview or description, and this also saves to the profile.
4. Check Customer Intel. **BREAKS**: the latest real lead's name is shown alongside demo email, company and city, plus a pre-call sentiment (EXPLORE-CORE-02, UX-AUDIT-05).
5. Choose **CONNECT** (browser mic) or enter a number and press **Test Call** (phone). **UNCLEAR**: neither the difference nor the cost is explained. **BREAKS**: "abc" enables Test Call, and there is no check for ₹0 or an unverified number (EXPLORE-CORE-13, UX-AUDIT-04).
6. Watch the Transcript Feed. The connecting, in-call and ended states were not observed.
7. Save Context. **UNCLEAR**: it could mean "use for this call" or "save to lead".
8. Find the call afterwards in Call Reports. **UNCLEAR**: there is no link, and the call appears as two BROWSER rows (EXPLORE-DATA-20).

#### J5. Load leads and call them (the campaign substitute; rating 3/5)

1. Leads → Import CSV (template, CSV/XLSX up to 5 MB, phone required) or New lead. **BREAKS**: the phone field accepts "abc", and there are no dialog semantics (EXPLORE-DATA-13).
2. Narrow the list with search, chips and the keyboard (`/`, J/K). **UNCLEAR**: filters are not in the URL, and the counts mislead (EXPLORE-DATA-11).
3. Select rows (X, or A for all) to open the bulk bar: voice, language, "Default flow". **UNCLEAR**: the flow is not named, and duplicate flows cannot be told apart (UX-AUDIT-06).
4. Place calls with CALL n, Call Now or `C`. **BREAKS**: no pre-flight check, cost, balance, calling hours or consent/DND step, and a single key can mass-dial (UX-AUDIT-04, EXPLORE-DATA-07).
5. Follow up in the lead drawer's call history. **BREAKS**: a month-old call still reads "QUEUED", and lead status never advances from NEW (UX-AUDIT-22, EXPLORE-DATA-08).
6. Review results in Call Reports and Analytics (J6).

There is no campaign object for schedules, pacing, retries or a per-campaign flow *(inferred; `/campaigns` returns 404)*.

#### J6. Find a past call and understand performance (rating 3/5)

1. Call Reports → search transcripts or filter by sentiment.
2. Scan the 17-column table. **BREAKS**: only 50 of 121 calls can be reached, and no column stays pinned when scrolling sideways (EXPLORE-DATA-04).
3. Click a row to open the detail panel. **UNCLEAR**: the transcript comes last, recordings are promised but absent, and rows cannot be opened by keyboard (UX-AUDIT-09).
4. Re-analyze, Learn from this call, or Export.
5. Analytics for trends. **UNCLEAR**: the range toggle's scope (EXPLORE-DATA-10). **BREAKS**: the flow drop-off bars are empty (EXPLORE-DATA-05), and metrics disagree with Call Reports (EXPLORE-DATA-17).
6. Analytics §07 → "Open report" → Call Reports. This step works.

#### J7. Understand spend and top up (rating 2/5)

1. Click the banner's Top up. **BREAKS**: it lands on Profile (UX-AUDIT-02).
2. Find `/billing` through the rail card icon. **BREAKS**: at ≤900 px height the icon is clipped (EXPLORE-CORE-04).
3. Choose a preset or type an amount, then Pay with UPI. The alternative is Enable UPI Auto-Debit. **UNCLEAR**: amounts are not validated (0, −50 and 9,999,999 are accepted).
4. Look for rates, usage or invoices. **BREAKS**: none exist. Meeting plans live in Settings › Meetings Billing, and API rates exist only in the public docs (UX-AUDIT-08, EXPLORE-SETTINGS-10).

#### J8. Deploy the meeting agent (rating 3/5)

1. Rail → Meet Agent.
2. Title. **UNCLEAR**: it is pre-filled with a value that repeats across meetings, and an empty title is still allowed (UX-AUDIT-16).
3. Mode. **BREAKS**: Presentation mode promises an attached deck but has no attach control (EXPLORE-CORE-25).
4. Privacy: Encrypted is the default. **UNCLEAR**: how the key reaches guests is never explained.
5. Flow: "Active flow (from profile)". **UNCLEAR**: the flow is not named.
6. Create Room, copy the `meet.vaanilabs.in` URL, and share it.
7. Use Agent (adds the AI), Intel and Record.
8. To end, use the icon-only red "Delete room" placed among the toggles. **BREAKS**: rooms never auto-end (one has been live for 82 h with STALE 0), and delete is easy to mis-click (EXPLORE-CORE-11).
9. Look in Past meetings for outcomes. **BREAKS**: there are no summaries, recordings or action items there.
10. PPT generation is a separate section at the bottom of the page.

#### J9. Delegate a goal to a personal agent (rating 3/5)

1. Rail → Personal Agents and read the explainer (a strength).
2. New task, then enter a goal and an optional capability hint. **UNCLEAR**: Start task is enabled with an empty goal, and the example cards look clickable but aren't.
3. Start task. **BREAKS**: no number is assigned, numbers are admin-provisioned, and this is stated only on `/settings/personal-agent` (EXPLORE-CORE-14).
4. The agent asks for confirmation according to the autonomy settings, by WhatsApp (the default), Call or Email. **BREAKS**: no WhatsApp number can be entered anywhere (EXPLORE-SETTINGS-18).
5. Track progress in the task list with Refresh. There is no budget, schedule or spend cap (UX-AUDIT-25).

#### J10. Telephony setup and human hand-off (rating 2/5)

1. Settings → Calling number: verify ownership, then Compliance, then Authorized. **UNCLEAR**: "Send code" enables for "abc".
2. Analytics says "Allocate a number from billing". **BREAKS**: Billing has no numbers (EXPLORE-DATA-21).
3. Settings → Call channel: PSTN (forwards to "your phone number"), Browser or Auto. **BREAKS**: the Profile phone is empty, and the copy says Browser/Auto "fall back to PSTN" (UX-AUDIT-07).
4. Flow Builder: add a Human Handoff (Transfer) node with a number or "use context". **UNCLEAR**: there is no failed or no-answer path.
5. The rep opens `/rep-console` and becomes present on load. **BREAKS**: there is no explicit availability control, errors show raw SDK text, and the page is unavailable on mobile (UX-AUDIT-24, EXPLORE-CORE-21).

#### J11. "Just ask" the Assistant

1. `/assistant`: pick a chip or type a request, and optionally attach a file.
2. The Plan & Actions panel shows the plan, and the Assistant acts (build or activate a flow, add leads, place a call). **BREAKS**: no visible approval, cost or recipient step (EXPLORE-CORE-16). This was not exercised.
3. History stays in this browser only. It does not reach another device or a teammate.

#### J12. Developer integration

1. Settings → API Keys leaves Settings for `/api-keys`, which has no back link and no active rail item. **UNCLEAR**: EXPLORE-SETTINGS-07.
2. Name the key, choose scopes and a rate limit, then Mint key. The key is shown once, and the page says so clearly.
3. Embed: copy the snippet. **BREAKS**: the displayed code is corrupted, though Copy copies clean code (EXPLORE-SETTINGS-04).
4. Webhooks → New webhook: URL and events. **UNCLEAR**: an invalid URL is still submittable (EXPLORE-SETTINGS-17).
5. Settings › Docs. **BREAKS**: 3 of the 5 guides return 404 (EXPLORE-SETTINGS-03).

#### J13. Org, team and integrations

1. Settings → Organization says "create your own org below", but nothing is below. "Browse organizations" leads to `/admin/organizations`, which says "Create one", with no create control. **BREAKS**: a circular dead end (EXPLORE-SETTINGS-02).
2. Settings → Integrations: all 5 Connect buttons are disabled. The reason is below the fold and quotes a raw path.
3. There is no way to invite teammates: `/team` and `/settings/members` return 404.

**Journey scorecard.** Ratings are from `ux-audit`; "n/r" means the journey was not rated.

| Journey | Rating | Dominant break |
|---|---|---|
| J1 First run | 2 | "You're live." with ₹0 and no number; no checklist |
| J2 Flow → live | 2 | Autosave into the live flow; false validation badge |
| J3 Knowledge | n/r | Proposals redirect; no indexing status |
| J4 Test call | 2 | Mixed real and demo intel; silent profile write |
| J5 Leads → calls | 3 | No pre-flight or cost before mass calling |
| J6 Past calls | 3 | Metrics disagree; 71 of 121 calls unreachable *(inferred)* |
| J7 Spend | 2 | Top up dead-ends; no usage or rates |
| J8 Meetings | 3 | Rooms never end; no meeting outputs |
| J9 Personal agent | 3 | Hidden number prerequisite |
| J10 Telephony | 2 | Three unlinked number concepts; channel copy contradicts Rep Console |
| J11 Assistant | n/r | No guardrails; history only in the browser |
| J12 Developer | n/r | Orphan pages; corrupted snippets; doc 404s |
| J13 Org and team | n/r | Org creation dead end |

---

### 1.6 As-is information architecture and sidebar model

**Overall shape.** The IA has four parts:

1. **A flat list of 12 top-level destinations** in the rail.
2. **A Settings hub** with 17 items. Three open in-page, eleven open as standalone pages under `/settings/*`, and three open as standalone pages outside `/settings`.
3. **Orphan routes** that nothing in the nav points to: `/onboarding`, `/settings/personal-agent`, `/admin/organizations`, `/webhooks/deliveries`, `/knowledge/proposals`.
4. **Externally hosted meeting rooms** on `meet.vaanilabs.in`.

There is **no Home or overview page**. The default route and the "Go to dashboard" target is the Agent Cockpit, which is a single-call console rather than a dashboard. All content scrolls inside an inner container (`div.flex-1.overflow-y-auto`); the document itself never scrolls.

**Rail model, desktop.** The order below is as observed. The "implied layer" column comes from the four-layer model in 1.1.

| # | Rail label (`title`) | Route | Page H1 | Mobile tab | Implied layer |
|---|---|---|---|---|---|
| 1 | Assistant | `/assistant` | Assistant | Assistant | Cross-cutting |
| 2 | **Agent View** | `/dashboard` | **AGENT COCKPIT** | **Agent** | Run |
| 3 | Analytics | `/analytics` | ANALYTICS (15 px) + editorial H2s | none | Review |
| 4 | Leads | `/leads` | LEADS | Leads | Run |
| 5 | Flow Builder | `/flow-builder` | Flow Builder | none | Build |
| 6 | **Meet Agent** | `/meeting-agent` | **Meeting Agent — Vikash** | none | Run |
| 7 | Personal Agents | `/personal-agents` | Personal Agents | none | Run |
| 8 | Rep Console | `/rep-console` | Rep console | none | Run |
| 9 | Call Reports | `/call-reports` | Call Reports | **Reports** | Review |
| 10 | Billing | `/billing` | BILLING | Billing | Account |
| 11 | Knowledge | `/knowledge` | **AGENT KNOWLEDGE** | Knowledge | Build |
| 12 | Settings | `/settings` | SETTINGS | none | Account |
| (mobile only) | none | sign-out button | none | **Exit** | none |

**How the rail behaves:**

- **The order ignores the layers.** Build items sit at positions 5 and 11, Review at 3 and 9, and Run is spread across 2, 4 and 6–8. There are no group headers or separators (EXPLORE-CORE-05).
- **Icon-only by default.** The collapsed rail is 72 px wide. Names come only from native `title` tooltips, and those never show on keyboard focus. The expanded rail is 240 px wide with labels, toggled with the `[` key and remembered per browser. It fits all 12 items but is not the default (UX-AUDIT-11).
- **It is too tall for common screens.** On a 48 px pitch the nav overflows at 900 px of viewport height, and Settings, the most-needed utility, is the item that gets clipped (EXPLORE-CORE-04).
- **The active state is incomplete.** There is no `aria-current` anywhere. No item highlights on `/settings/*`, `/api-keys`, `/api-keys/embed` or `/webhooks` (EXPLORE-SETTINGS-07).
- **The footer is chrome with no identity.** It shows an unlabelled status dot ("SYS:ONLINE" when expanded; always green, even while Rep Console says Offline), latency, an unguarded Sign out, the theme toggle, and Collapse. There is no avatar, name, org, role, balance or help entry (EXPLORE-CORE-19).
- **Names drift.** 7 of the 12 destinations have two or more names across rail, H1, mobile tab, route and cross-links. "Agent" carries five meanings (EXPLORE-SETTINGS-13). Casing drifts too: "Call channel" beside "Change Email".
- **Mobile IA is a different, smaller product.** The 7-tab bar gives Sign out a primary slot and has no "More" menu, which leaves 6 destinations unreachable, Settings among them. The Settings sub-nav becomes a 2,300 px horizontal strip (EXPLORE-CORE-06, EXPLORE-SETTINGS-08).

**Settings sub-nav model.** There are 17 flat, ungrouped items, and they work three different ways:

| Kind | Items | Behaviour |
|---|---|---|
| In-page tab (`<button>`) | Profile, Meetings Billing, Docs | Swaps the panel. The URL stays `/settings`, so the tab cannot be deep-linked. |
| Standalone page under `/settings/*` (`<a>` with a ↗ glyph) | Organization, Notifications, Call channel, Calling number, Calendly, Security, Activity & Audit, Integrations, Data Export, Change Email, Delete Account | A full navigation that drops the sub-nav. Each page has 1–4 "back to Settings" links. |
| Standalone page outside `/settings` (`<a>` with a ↗ glyph) | API Keys (`/api-keys`), Embed (`/api-keys/embed`), Webhooks (`/webhooks`) | No back link and no active rail item: orphans. |

On top of this, Settings uses at least 6 page templates and 7 save models (EXPLORE-SETTINGS-05, EXPLORE-SETTINGS-06, EXPLORE-SETTINGS-09).

**Concepts split across the IA:**

| Concept | Where it lives today |
|---|---|
| Money | <ul><li>`/billing`: wallet, autopay, top-up</li><li>Settings › Meetings Billing: plans; no URL</li><li>The banner, which targets the non-existent `/settings#wallet` and `#autopay`</li><li>The "Pricing" that `/billing` copy refers to, which doesn't exist in the app</li><li>The public `/docs/api/billing` rates</li></ul> |
| Integrations | <ul><li>Profile: Google, Microsoft</li><li>Settings › Calendly</li><li>Settings › Integrations: Meta ×3, HubSpot, Salesforce</li><li>Developer pages: API Keys, Embed, Webhooks</li><li>The Flow node's "Integrations → Live Lookup", which is not found</li></ul> |
| Phone numbers | Profile Phone; Calling number; Analytics DID; personal-agent number; Transfer node number; the Notifications WhatsApp number, which has no field |
| "Which flow is live" | ACTIVATE; the profile (via the Cockpit); the Meeting Agent select; the Leads selects |
| Security and identity | Security (2FA only); Change Email; Activity & Audit; Delete Account; nothing for passwords or sessions |
| Docs | Settings › Docs (3 links broken); public `/docs`; the in-app Embed handbook, which Docs doesn't link to |
| Org | Settings › Organization ↔ `/admin/organizations`. Each points to the other, and neither can create an org. |

**URL-addressable state.**

- **In the URL:** pagination (`/leads?page=1&size=50`, `/knowledge?page=1&size=20`) and top-level routes.
- **Not in the URL:** the Settings in-page tabs, Leads filters and search, the open call in Call Reports, the lead drawer, and the login/sign-up mode. So none of these can be shared, bookmarked or restored after a refresh.

**Missing IA nodes.** Confirmed by the 404 probes in 1.3: Home/overview, Campaigns, Team/Members, Help/setup guide, a Usage ledger, and a global search or command palette.

### 1.7 The public-site → sign-up → app funnel

| # | Stage | Surface | What the user is promised | What actually happens | Ref |
|---|---|---|---|---|---|
| 1 | Discover | `/` (dark theme, violet primary) | "Voice AI agents that handle every call." "Start free", "build your first agent in minutes", "Free tier · No credit card". "Talk to the agent". | <ul><li>Every start CTA goes to `/signup`: header Get started, hero and final Start free, "Explore analytics →", "Open Flow Builder →".</li><li>"Talk to the agent" only scrolls to a recorded demo.</li><li>Nav "Product" is a dead anchor.</li></ul> | PUBLIC-SITE-10, PUBLIC-SITE-20 |
| 2 | Evaluate | `/pricing`, `/enterprise`, `/security`, `/docs`, `/about` | Prices, proof, compliance | <ul><li>`/pricing` has no prices and no nav: it is an 18-field pilot form.</li><li>Public per-second prices exist only in the API docs.</li><li>Compliance claims contradict each other, and `/about` looks like placeholder content.</li><li>Contact addresses span three domains.</li></ul> | PUBLIC-SITE-01, PUBLIC-SITE-02, PUBLIC-SITE-04, PUBLIC-SITE-05, PUBLIC-SITE-21 |
| 3 | Try it live (side path) | `/build.html` | "Don't read about our voice AI. Talk to it.": a personal demo agent after an email OTP | <ul><li>A separate static site, with a different logo, font and nav.</li><li>Labelled only "Build your own".</li><li>Its "Get started" goes to `/login`, not `/signup`.</li><li>The OTP flow was not tested.</li></ul> | PUBLIC-SITE-06, PUBLIC-SITE-20 |
| 4 | Sign up | `/signup` → `/login` (light theme, blue primary) | Create an account | <ul><li>Sign-in mode, "Welcome Back". A 12 px grey toggle leads to "Register for early access (admin approval required)".</li><li>Phone is required, with no reason given.</li><li>No password rules and no Terms/Privacy acknowledgement.</li><li>Labels are not associated with inputs, and password has `autocomplete="off"`.</li><li>OAuth via Google or Meta, while `/security` says Google and Microsoft.</li><li>The brand switches from dark violet to light blue at the moment of commitment.</li></ul> | PUBLIC-SITE-03, PUBLIC-SITE-13, PUBLIC-SITE-14, UX-AUDIT-30 |
| 5 | Approval | Not observable | Access | An admin approve/reject workflow exists (changelog v2.0.2), and Profile shows STATUS APPROVED. No turnaround time, pending state or email content was observed. | PUBLIC-SITE-04 |
| 6 | First login | OAuth returns to `next=/dashboard`; password or magic link | Enter the product | For signed-out deep links, `?next=` is kept (for example `/api-keys` → `/login?next=/api-keys`). A new user's first landing is probably `/onboarding` *(inferred; not observed for a fresh account)*. | none |
| 7 | Onboard | `/onboarding` | Profile → Subdomain → Flow → Test call → "You're *live.*" | Wallet, number, call channel, knowledge and leads are not covered. The completion screen ticks an unfinished step. | EXPLORE-CORE-09 |
| 8 | Activate (first real call) | `/dashboard` and `/leads` | The first call "this week" | <ul><li>₹0 wallet and no allocated or verified number.</li><li>The banner's Top up goes to Profile.</li><li>Call buttons stay enabled with no pre-flight check.</li><li>No setup checklist.</li><li>No price shown anywhere in the app.</li></ul> | UX-AUDIT-02, UX-AUDIT-04, UX-AUDIT-08, UX-AUDIT-19 |
| 9 | Return / retain | Any app route | Stay signed in | Every hard load shows a shell-less loader for 2.6–4.9 s. In the prior run, an expired session dropped the user on a bare `/login` with no `next=` and no reason. | EXPLORE-CORE-18, UX-AUDIT-17 |

**What the funnel says about the product.**

- **The acquisition story and the access model disagree.** Marketing tells a self-serve, free-tier story. In reality, access is approval-gated, and payment is either a sales-led pilot or a prepaid wallet whose rates never appear in the app. Every stage after "Discover" corrects an expectation set by the stage before it.
- **The visual identity breaks at the conversion point.** The user moves from a dark, violet marketing site to light, blue auth and app screens, then to a violet Meeting Agent and back to violet in dark mode (PUBLIC-SITE-06).
- **The strongest assets sit off the main path.** The best conversion asset (`/build.html`, live try-before-signup) and the best trust asset (`/security`) are both off the main funnel. The CTAs on it point at a route that behaves as sign-in.
- **Measurement starts before consent.** PostHog sets a 365-day cookie on the first page view, with no consent control (PUBLIC-SITE-19). In the app, session replay loads on pages that show personal data (EXPLORE-CORE-24).

---

## 2. Current design language (as-is)

**Scope and sources.** This section only describes what ships today. The problems it causes are listed in section 3B (visual) and in the accessibility and functional sections.
- `raw/design-system.md` provides a computed-style inventory of 12 authenticated pages plus `/`, `/pricing` and `/docs`, at 1440x900 in the light theme unless stated. It covers every visible element and all 3,595 CSS rules.
- `raw/visual-audit.md` covers 14 authenticated routes, including `/settings/organization` and `/api-keys`, plus the signed-out `/login` and `/`.
- The notes on modals, drawers and toasts come from `raw/a11y-manual.md`, `raw/explore-data.md`, `raw/explore-settings.md`, `raw/flow-canvas.md`, `raw/flow-config.md`, `raw/ux-audit.md` and `raw/qa-a.md`.
- Screenshots are in `audit/screenshots/va-design-system/` and `audit/screenshots/va-visual-audit/`.

**In one paragraph.** A real token layer exists: 32 semantic CSS variables with complete light and dark pairs, on Tailwind v4, with a consistent neutral ramp. Markup mostly bypasses it through arbitrary values (`text-[9px]`, `rounded-[9px]`, `bg-[#8b5cf6]`) and raw Tailwind palette classes. As a result the light app renders 5 font families, 16 font sizes, 30 letter-spacings, 24 text colours, 62 background colours, 42 border colours, 12 radii, 80 button styles, 12 input styles and 20 badge styles. Visually the app splits into four or five dialects. The public site is a separate system: dark, violet and set in Hanken Grotesk.

### 2.1 Stack, libraries and infrastructure

| Layer | In use today | Evidence |
|---|---|---|
| Framework | **Next.js**, probably App Router | 5 `/_next/static/...` scripts. next/font `__variable_*` classes on `<body>`. 2 CSS chunks (163 and 426 top-level rules). |
| Styling | **Tailwind CSS v4** | `@layer properties, theme, base, utilities`, 71 `@property` rules, colours emitted as `oklab()/oklch()` via `color-mix`, about 2,433 utility rules. 1,243 of 1,419 class tokens on Dashboard are utility-like. 929 of 10,510 class tokens on Call Reports are arbitrary `[...]` values. |
| Component primitives | **None.** No shadcn, Radix, Headless UI, sonner or cmdk. | 0 `data-radix-*`, 0 `data-state`, 0 `data-slot` on every page. Dialogs, drawers, tabs and tooltips are hand-rolled. The only shared primitive is a CVA-style React `<Button>`. |
| Custom CSS layer | 202 non-utility classes | `.btn-saffron`, `.btn-outline`, `.btn-danger`, `.input-vani`, `.glass`, `.glass-card`, `.glass-light`, `.bento-card`, `.badge-xs`, `.hud-bracket`, `.glow-*`, `.link-saffron`, `.font-editorial`, `.font-accent`, `.font-devanagari`, `.type-floor`, `.dashboard-root`, `.section-numeral`, `.pull-quote`, `.prose-editorial`. Also about 90 BEM `docs-*` classes and the landing-page `vlp-*` classes. |
| Canvas | **React Flow / xyflow** (Flow Builder only) | `.react-flow.flow-builder-canvas.light` with background, minimap and controls. Attribution is hidden. 8 node types (start, speak, question, whatsapp, end, condition, transfer, knowledge_lookup). Handles are 12px circles. Edges are 1px `#2f5fe0`. |
| Charts | No library | 0 `.recharts-wrapper`. Charts are hand-built SVG and DOM: 80x32 sparklines, the sentiment stacked area, the hour-of-day cell grid and the intent bars. |
| Icons | **lucide-react** only | `lucide` class on 84/84 SVGs on Leads, 266/266 on Call Reports and 75/78 on Analytics. Outline style, about 1.5px stroke. The only non-Lucide icons are the logo and a few custom SVGs. |
| Fonts | next/font | 12 families, 139 `@font-face` rules (see 2.3.2) |
| Motion | 36 `@keyframes` | breathe, scanline, flicker, ticker, mandala-spin, orbit-spin, sphereBreath, sphereGlow, soundPulse, waveform-bar, shimmer, marquee, typewriter-caret, ring-pulse, the `vlp*` set, spin/ping/pulse/bounce and more. The only `prefers-reduced-motion` block (3 rules) covers `.vlp-*`. |
| Theme switch | Class-based `html.dark` plus `localStorage["vv:theme"]` | No cookie is set. Tailwind `dark:` utilities (21 rules) compile under `@media (prefers-color-scheme: dark)` instead (see 2.6). |
| Breakpoints | Tailwind sm/md/lg/xl/2xl (40/48/64/80/96rem) plus ad-hoc ones | Ad-hoc: 420, 640, 720, 760, 767 (max), 1079 (max) and 1080px |

### 2.2 Declared tokens (what the CSS says)

#### 2.2.1 App theme variables: `:root` vs `:root.dark` (32 each)

| Current name | Light | Dark | Role it actually plays |
|---|---|---|---|
| `--background` | `#f4f6fa` | `#0c0d12` | Page background |
| `--surface` / `--surface-light` / `--surface-hover` | `#fff` / `#eef1f7` / `#e4e9f2` | `#14161d` / `#1a1d26` / `#232733` | Card, inset and hover surfaces |
| `--foreground` = `--text-primary` | `#111725` | `#e8eaf2` | Primary text |
| `--text-secondary` | `#3e475a` | `#a6abbd` | Secondary text |
| `--text-muted` | `#7a8397` | `#7b8196` | Muted text. About 3.5–3.8:1 in light, 4.35–5.0:1 in dark. |
| `--saffron` | **`#2f5fe0` (blue)** | **`#7c6bf5` (violet)** | Brand primary. The name is a leftover from a saffron theme, and the hue changes with the theme. |
| `--saffron-dim` | `#1e48b8` | `#9a8cff` | Pressed/emphasis. Darker in light, lighter in dark. |
| `--saffron-glow` / `-strong` / `-subtle` | `#2f63e0` at 34/50/14% | `#7c6bf5` at 50/70/20% | Glows and focus ring |
| `--peacock` / `--peacock-dim` | `#0e9488` / `#0b756b` (teal) | `#38c6e0` / `#22a8c4` (cyan) | Secondary accent. The hue changes with the theme. |
| `--peacock-glow*` | `#0e9488` at 32/50/14% | `#38c6e0` at 50/70/20% | |
| `--border-color` | `#e1e6ef` | `#282c38` | Default hairline (892 rendered sides) |
| `--border-light` | `#cbd3e1` | `#3a3f4f` | Stronger border. In light it is darker than `--border-color`, despite the name. |
| `--sentiment-positive` / `-neutral` / `-negative` | `#178a55` / `#b5820e` / `#d0463a` | `#3fb984` / `#e0b341` / `#f0685e` | The **only semantic status set**. It doubles as success / warning / danger. |
| `--glass-bg` / `-strong` / `-subtle` | white at 72/85/55% | `#14161d` at 70/82%, `#1a1d26` at 50% | Translucent panels and inputs |
| `--code-bg` / `--code-border` | black at 4/6% | white at 5/6% | Code blocks |
| `--grid-line-color` / `--dot-grid-color` / `--noise-opacity` | black 8% / black 6% / .02 | `#2a2a2a` 30% / white 5% / .03 | Background textures |
| `--scrollbar-thumb-hover` | black 22% | white 20% | |

There are no `--primary-foreground`, `--ring`, `--warning`, `--info`, elevation or z-index variables.

A separate **docs palette** (`.docs-api`, 9 variables) is neutral and dark only: `--docs-bg #050505`, `--docs-paper #0d0d0d`, `--docs-ink #ededed`, `--docs-ink-soft #a1a1a1`, `--docs-ink-faint #666`, `--docs-rule #1d1d1d`, `--docs-rule-strong #2a2a2a`, `--docs-code-bg #0a0a0a` and `--docs-code-rule #1a1a1a`.

#### 2.2.2 Tailwind `@theme` (151 variables)

- **Fonts:** `--font-sans: var(--font-hanken), var(--font-dm-sans), var(--font-geist-sans), system-ui`. `--font-mono: var(--font-jetbrains), var(--font-geist-mono)`. `--font-display: var(--font-sora)`.
- **Type scale:** Tailwind defaults from `text-xs` (12) to `text-7xl` (72). The app mostly ignores them and uses arbitrary `text-[7px]` to `text-[13px]`. **52 distinct font-size values** exist in the compiled utilities, including 7, 8, 9, 10, 10.5, 12.5, 13.5, 14.5 and 17.5px, 1.05rem, 1.7rem, 1.9rem, 2.6rem, 3.2rem, 3.6rem, 4.4rem, 6.5rem, 120px, 160px and 200px.
- **Radius:** `sm .25rem`, `md .375rem`, `lg .5rem`, `xl .75rem`, `2xl 1rem`, `3xl 1.5rem`, plus arbitrary `1.35rem`, `3px` and `9px`.
- **Shadow:** only `drop-shadow-lg`. There is no elevation scale.
- **Colour:** 18 raw hue families are emitted, which means they are used directly in markup: red, orange, amber, yellow, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate and zinc. There are also **45 distinct hex literals** in arbitrary utilities. The most frequent is `#8b5cf6` ×50, then `#a78bfa` ×11, followed by `#0ea5e9`, `#2dd4bf`, `#0a0a0a`, `#a855f7`, `#06070b`, `#34d399`, `#0078d4`, `#3b82f6`, `#f43f5e`, `#f59e0b`, `#fbbf24`, `#fb923c`, `#7c3aed` and others.

#### 2.2.3 Component classes (definitions read from CSS)

| Class | Definition (abridged) | Where it renders |
|---|---|---|
| `.btn-saffron` | `bg var(--saffron); color rgb(0,0,0); 600; var(--font-sans); radius 8; padding 9px 18px; 14px; .2s`. Hover adds a glow and `translateY(-1px)`. Disabled uses opacity .5. Mobile sets `min-height 44px`. No `:focus-visible`. | Primary actions on Dashboard, Billing, Knowledge, Settings |
| `.btn-outline` | `color text-primary; 1px border-light; radius 8; 9px 18px; 14px/500`. Hover turns the border and text saffron. | Billing, Knowledge, Settings |
| `.btn-danger` | `bg sentiment-negative; #fff`. The hover shadow uses Tailwind red-500 `rgba(239,68,68,.5)`, not the token. | Destructive actions |
| `.input-vani` | `bg glass-bg-strong; 1px border-color; radius 8; 10px 14px; 14px`. Focus: saffron border plus a `0 0 0 2px` ring at 14% alpha. Error: `rgba(239,68,68,.2)` ring. | Settings, Call Reports search, Leads search |
| `.glass-card` / `.bento-card` | radius 16 / radius 20. The bento hover uses a hard-coded violet border `rgba(124,107,245,.2)` and `0 20px 60px rgba(0,0,0,.4)`. | Cards, Analytics |
| `.badge-xs` | `11px !important; lh 1.3` | Small badges |
| `.type-floor` | Forces `text-[7..12px]` and `text-xs` up to `13px !important` | **Defined but applied to no element** |
| `.link-saffron` | Saffron text with a violet `rgba(124,107,245,.4)` bottom border (blue text over a violet underline in light) | Inline links |
| `.hud-bracket` / `.section-numeral` / `.font-editorial` | 12px saffron corner brackets at 60%; "§ 01" numerals; `Instrument Serif, EB Garamond, Georgia, serif` | Analytics only |
| `.dashboard-root` | `14px / 1.55` | App root |

### 2.3 De-facto tokens: what actually renders

Counts are summed across the 12 authenticated pages in the light theme. Typography counts are text nodes (1,812 in total). Spacing and border counts are element sides.

#### 2.3.1 Distinct values per property

| Property | Distinct values | Dominant values |
|---|---|---|
| Font families rendered / registered | **5** / **12** (139 `@font-face`) | JetBrains Mono, Hanken Grotesk, Sora |
| Font sizes rendered / in compiled CSS | **16** / **52** | 13px (815), 11px (281), 10px (236) |
| Line-heights | **32** | |
| Font weights | 4 | 500 ×1,527, 700 ×150, 600 ×124, 800 ×11 |
| Letter-spacing | **30** (−0.8px to +4px) | |
| Type styles (family × size × weight × tracking × case × italic) | **84** | |
| Text colours (including alpha) | **24** | `#3e475a`, `#7a8397`, `#111725` |
| Background colours (including alpha) | **62** | `#f4f6fa`, `#fff`, `#eef1f7` plus 5–20% tints |
| Border colours (including alpha) | **42** | `#e1e6ef` ×892 |
| Border widths | 2 | 1px, 2px (measured as 0.8 and 1.6px at DPR 1.25) |
| Border radii | **12** | 8px ×336, full ×327, 6px ×195 |
| Box-shadows | 8 | Glows only, no elevation |
| Padding values | **19** | 12 ×2,339, 16 ×2,048, 8 ×549 |
| Gap values | 9 | 4 ×286, 6 ×181, 8 ×175 |
| Icon sizes | **22** | 20, 16, 14, 12 |
| z-index values | 10 | 0, 1, 2, 4, 5, 10, 20, 30, 50, 9999 |
| Transitions | 8 | .15s and .2s `cubic-bezier(.4,0,.2,1)` |
| Button styles | **80** | See 2.4 |
| Input styles | **12** | See 2.4 |
| Badge and chip styles | **20** | See 2.4 |

#### 2.3.2 Font families: registered, loaded and rendered

| Family | Status | Where it renders today |
|---|---|---|
| **JetBrains Mono** (variable, 100–800) | Rendered and dominant | Body text, labels, inputs and table meta on Dashboard, Leads, Analytics, Flow Builder (node bodies), Meeting Agent (100%, including the H1), Rep Console (including the H1), Billing, Knowledge, Settings and Login. Usually set at 8–12px, uppercase, with wide tracking. |
| **Hanken Grotesk** | Rendered. Weights 400–700 are registered, but `document.fonts` showed only 500 loaded in the app. | The whole of Call Reports (936 nodes, the only app page in this face), the sidebar labels and footer, the React `<Button>` (via `font-sans`), and the body and H1 (72/600, −1.8px) on the marketing home page |
| **Sora** (600/700 loaded, 400–700 registered) | Rendered | H1 on 10 of the 12 main pages. Analytics H2s at 27.2px/**800**, a weight that is not registered, so it is presumably synthesised. Uppercase toolbar buttons ("NEW LEAD", "NEW TASK", Analytics Refresh at 10/700). |
| **Instrument Serif** (400 italic) | Rendered on Analytics only | Section taglines, kickers, and the 30px italic "not allocated yet" |
| **System `ui-sans-serif`** (Segoe UI on Windows, SF on macOS) | Rendered by accident | Every element without a font utility, plus everything styled by `.btn-*` and `.input-vani`. Dominant on Assistant and Personal Agents. Also used by buttons and inputs on Billing, Settings and Login. |
| Syne | Wordmark only | Login and marketing (5 characters) |
| DM Sans, Geist, Geist Mono, Inter (registered as `--font-matter`, 35 faces), Rajdhani, Noto Serif Devanagari, Tiro Devanagari Hindi | Registered but not seen on any page scanned | None |

Why the fallback happens (inferred): next/font puts its `--font-*` variables on `<body>` classes. Tailwind resolves `--font-sans` and `--default-font-family` at `:root`/`html`, where those variables are not defined, so `body` computes to `ui-sans-serif, system-ui, …`.

#### 2.3.3 Type scale with counts (1,812 text nodes)

| Size | Nodes | Typical use today |
|---|---|---|
| 8px | 29 | Leads "Source" badges (mono, bold, uppercase), Analytics micro-labels |
| 9px | 109 | Mono uppercase field labels (Dashboard intel fields, Analytics KPI labels), Kbd hints. The most common size on Dashboard. |
| 10px | 236 | Mono body text, table meta, filter chips, toolbar buttons, telemetry strip |
| 11px | 281 | Call Reports status badges, sidebar, captions, Flow node bodies |
| 12px | 175 | Mono body on Meeting Agent, Billing, Knowledge; mono inputs |
| 13px | 815 | Call Reports body (Hanken), Assistant, React `<Button>` |
| 14px | 105 | `.btn-*` buttons, `.input-vani`, card titles |
| 15px | 1 | Analytics H1 |
| 16px | 14 | Analytics serif kickers, Call Reports stats |
| 18px | 18 | H1 on 5 pages, H2 on 3 pages |
| 20px | 10 | H1 on 4 pages |
| 24px | 5 | Rep Console H1, balances |
| 27.2 / 30.4px | 8 / 4 | Analytics H2s and KPI numerals (fluid `calc`) |
| 30 / 32px | 1 / 1 | Personal Agents H1 / Analytics serif display |

- 36% of text nodes are below 12px, and 7.6% are 8–9px.
- Uppercase is heavy on the data pages: Analytics has 84 uppercase elements (76 of them mono) and Leads has 111. Uppercase is produced both by CSS `text-transform` and by literal capitals in the strings ("AGENT COCKPIT", "BILLING").
- Letter-spacing runs from −0.8px (tight headings) to +4px (Leads H1, Analytics "UPDATED" stamp). Analytics micro-labels alone use +1.8, +2.25, +2.5, +3 and +4px.

#### 2.3.4 Colour roles in use (light theme, sRGB after compositing)

| Role | Value | Rendered count | Contrast (from sources) |
|---|---|---|---|
| Text primary | `#111725` | 197 | ≈17.9:1 on white (computed) |
| Text secondary | `#3e475a` | 344 | 9.32:1 on white |
| Text muted | `#7a8397` | 338 solid, plus 499 at 50% alpha | 3.80:1 on white, 3.52:1 on `#f4f6fa`, 3.36:1 on `#eef1f7`. About 1.75–1.81:1 at 50% alpha. |
| Accent (peacock/teal) | `#0e9488` | 102, plus 46 at 80% | 3.74:1 on white |
| Primary (saffron/blue) | `#2f5fe0` | 92 as text; the fill of every primary button | White on it would be 5.48:1 |
| Positive / neutral / negative | `#178a55` / `#b5820e` / `#d0463a` | 88 / 27 / 18 | 4.37 / 3.41 / 4.55:1 on white |
| On-primary text | `#000000` (and `#111725` on the banner "Top up") | 12 | 3.83:1 (3.27:1 for `#111725`) |
| Off-token text | `#8b5cf6` and `#a78bfa` (Meeting Agent, one Call Reports badge), `#fbbf24` and `#fb923c` (Flow node titles), `#f472b6`, `#fb2c36` (Rep Console error, red-500), `#a2a8b6` / `#a1a7b5` (low-alpha helper text) | | Flow node text 1.48–2.72:1 |

- **Semantic colour today.** The sentiment trio is the only status palette, so "neutral" mustard doubles as warning and info is implicitly the primary. Error red renders four ways: `#d0463a` (token), `#fb2c36` (Rep Console "Could not connect"), `rgba(239,68,68,…)` (`.btn-danger` hover and the input error ring) and `#d76a60` (Settings "Delete Account"). The success glow is green-500 `rgba(34,197,94,.5)`, not the token.
- **Accent usage.**
  - Blue is used for filled primaries, links, the non-link durations in the Analytics Recent table, and half of the Analytics KPIs.
  - Teal is used for secondary CTAs ("IMPORT CSV", "Test Call", "Re-analyze", "Embed") and the other half of the KPIs.
  - Green (with a glow) is used for "ACTIVATE" only.
  - Violet `#8b5cf6` is Meeting Agent's own primary, in both themes.
  - Flow node categories use Tailwind-400 amber, orange, violet and pink as *text*.
  - Call Reports KPIs are blue, teal, green and red.
- **Backgrounds (62).**
  - Surfaces: `#f4f6fa` (page), `#fff` (card), `#eef1f7` (inset/card, also at 50% and 40%).
  - Tints: brand and sentiment colours at 5, 10, 15 and 20%.
  - Wallet banner: about `#dde3f7`.
  - Dark-theme values leaking into light: `#1a192b` ×42 (Flow minimap), `#3bc4e2` at 10% ×24 (Analytics hour grid), black at 10/20% (Personal Agents cards), white at 2%.
- **Borders (42).**
  - `#e1e6ef` ×892 (token)
  - `#ffffff` ×216 (Flow node rims)
  - `#e1e6ee` at 60% ×178
  - `#0f9487` at 40% ×172
  - `#cbd3e1` ×156
  - 37 more alpha variants, including white at 10% and 6%, which are invisible on light surfaces

#### 2.3.5 Radius distribution

| Radius | Count | Where |
|---|---|---|
| 8px | 336 | Default buttons, inputs, Dashboard panels |
| full (`calc(infinity)`) | 327 | Pills, badges, filter chips |
| 6px | 195 | Small buttons, table actions, mono inputs |
| 4px | 74 | Kbd chips, pagination, Flow counters |
| 100% | 54 | Flow handles, avatars |
| 12px | 43 | Cards on Knowledge and Call Reports; ACTIVATE |
| 16px | 36 | `.glass-card`, Flow panels, Analytics cards, marketing cards |
| 3px | 25 | Leads row checkboxes |
| 9px | 12 | Sidebar logo tile (`rounded-[9px]`) |
| 20px | 4 | `.bento-card` (Analytics) |
| 10px | 1 | |
| 0 | — | Meeting Agent segmented control and React Flow controls (visual audit) |

Card containers alone use 8, 12, 16 and 20px. The marketing home page uses 15 different radii.

#### 2.3.6 Shadows and elevation (8 values, no scale)

- Cards are flat: a hairline border and no shadow.
- The rendered shadows are:
  - glows: primary `0 0 10px rgba(47,99,224,.34)`; the 20px primary hover glow with a −1px lift; success `0 0 10px rgba(34,197,94,.5)` on ACTIVATE
  - two Flow panel shadows: `0 14px 40px rgba(0,0,0,.22)` and `0 18px 55px rgba(0,0,0,.26)`
  - the `.bento-card` hover: `0 20px 60px rgba(0,0,0,.4)`
  - the `.input-vani` focus ring: `0 0 0 2px #2f63e024`
- Overlays (modals, drawers) rely on a blur or translucent veil rather than elevation.
- z-index goes up to 9999, with no named layers.

#### 2.3.7 Spacing

- **Padding (19 values):** 12 ×2,339, 16 ×2,048, 8 ×549, 2 ×408, 4 ×374, 10 ×230, 24 ×192, 14 ×105, 6 ×68, 20 ×47, 9 ×22, 18 ×22, and 28, 32, 36, 40, 48, 80, 96. The off-grid 9 and 18px come from the `.btn-*` padding (`9px 18px`).
- **Gap (9 values):** 4 ×286, 6 ×181, 8 ×175, 12 ×130, 16 ×51, plus 1, 2, 10 and 24.
- A 4px grid is mostly followed. 12, 16, 8 and 4 dominate.
- **Page gutter:** the header bar has 24px horizontal padding.
- **Content widths** vary by page: full-bleed, about 1150, about 1120, 640, 576 and 512px (see 2.5).


---


#### 2.3.8 Borders, textures, icons, motion

- **Borders:** 1px hairlines are used everywhere. There are also 2px accents, a dashed border (the Settings › Organization empty state), and a 3px left bar marking the active nav item.
- **Background textures:**
  - an SVG noise overlay on every app page
  - a 1px grid at 8% black on Dashboard, Leads and Analytics, which shows through the semi-transparent Leads rows
  - a dot grid, diagonal hatch fills and `.hud-bracket` corners on Analytics
- **Icons:** 22 rendered sizes. Mostly 20 (nav), 16, 14 and 12, with others down to 8px.
- **Transitions:** .15s and .2s with the standard ease are the norm. There is also a .4s spring (`cubic-bezier(.16,1,.3,1)`) on cards and a .7s ease. Decorative infinite animations run on the Dashboard ring, which is 320px across.

### 2.4 Component inventory (current variants)

There is no component library, so each entry below lists the separate implementations that exist today. Unless stated, heights and sizes are for desktop at 1440x900.

#### Buttons: three parallel systems, 80 distinct signatures

| System | Definition | Adoption |
|---|---|---|
| (a) React `<Button>`, CVA-style | `inline-flex items-center justify-center gap-2 rounded-lg font-sans transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-saffron/60 disabled:opacity-50`. Primary: `bg-saffron text-black font-semibold h-8 px-3 text-[13px]`. | Used by 2 of 103 buttons on Call Reports. 0 on Leads and Knowledge. **It is the only button with a focus-visible ring and the only one that renders in Hanken.** |
| (b) CSS classes | `.btn-saffron`, `.btn-outline`, `.btn-danger`: 14px system font, `9px 18px`, radius 8, about 38px tall, 44px min-height on mobile | Billing, Knowledge, Settings, Dashboard |
| (c) Bespoke Tailwind strings | Everything else | Leads (0 of 49 buttons shared), Flow Builder, Analytics, Meeting Agent, Personal Agents and the others |

- **Distinct signatures per page:** Flow Builder 36, Leads 12, Knowledge 11, Meeting Agent 11, Analytics 9, Dashboard 9, Call Reports 9, Settings 8, Assistant 7, Billing 7, Personal Agents 5, Rep Console 5.
- **Heights:** 18 distinct heights: 22, 24, 25, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 44, 48 and 58px. The 58px one is "Test Call" wrapping onto two lines. Primary buttons alone come in 24, 28, 32, 33, 37, 39, 40, 43 and 44px.
- **Primary fill:** the same blue `#2f5fe0` (`--saffron`) with **black text** everywhere, except:
  - Meeting Agent: violet `#8b5cf6` with white text
  - Flow Builder ACTIVATE: green, 12px radius, uppercase, white text, green glow, next to a blue, 8px-radius, title-case Save
  - Wallet banner "Top up": `#111725` text
- **Secondary styles:** a teal outline or tint (IMPORT CSV, Test Call, Re-analyze, Embed); `.btn-outline`; mono-uppercase text buttons (Personal Agents "SETTINGS" and "REFRESH", with a `white/10` border that is invisible in light).
- **Destructive styles:** `.btn-danger` (token red); Settings "Delete Account" in `#d76a60`; Meeting Agent's unlabeled red filled square stop button.
- **Casing:** mixed. "NEW LEAD" and "NEW TASK" are Sora bold uppercase with tracking. "CONNECT" is literal uppercase in the system font. "Export CSV" and "Save Changes" are sentence or title case.
- **Hover:** consistent on primaries: a 20px blue glow and a −1px lift.
- **Disabled:** opacity .5.
- **Focus:** the browser default, or none. Only (a) has a ring.
- **"Refresh" alone has 6 designs:**
  - Analytics: Sora 10/700, +2px, uppercase, 29px, r6
  - Leads: Mono 10/500, uppercase, 29px, r8
  - Call Reports: Hanken 13/500, 32px, r8
  - Billing and Knowledge: `.btn-outline`, 14px, 38px
  - Meeting Agent: Mono 12, 24px, borderless
  - Personal Agents: Mono 11, +1.1px, uppercase, 35px, invisible border
- **Icon buttons (5 sizes):**
  - 36x36 r8 (sidebar footer)
  - 32x32 r6 (the Leads row call button, blue, on every row)
  - 24x24 r6 (Call Reports row actions ×50)
  - 34px tall r0 (React Flow controls; Flow Builder has 9 icon-only toolbar buttons)
  - 22x22 r4 (banner dismiss)

#### Form controls: 12 input styles

| Style | Spec | Where |
|---|---|---|
| `.input-vani` | 43px, 14px system font, r8, white at 85%, visible focus border plus a 14% ring | Settings, Call Reports search, Leads search |
| Mono field | 34px, mono 12px, r6, `#eef1f7` fill | Billing, Knowledge, Settings |
| Mono intel field | 30px, mono 12px, nested inside a field card inside a panel | Dashboard Customer Intel (6 fields) |
| Mono select | 21px, mono 10px | Dashboard flow select |
| Pill filter select | 25px, mono 10px, uppercase, full radius | Leads (Language, Outcome) |
| Mono input | 42px, mono 14px | Meeting Agent |
| Composer | 42px, Hanken 13px | Assistant |
| Native `<input type=file>` | Unstyled browser control reading "Choose file · No file chosen" | Knowledge upload, Settings › WhatsApp brochure |
| Styled dropzone | ".CSV · .XLSX · MAX 5 MB", two-step layout | Leads Import dialog only |
| Textarea | Goal textarea with an example placeholder; Flow settings personality prompt with a 0/6000 counter | Personal Agents "New task", Flow settings |

- Heights run from 21 to 43px, with 4 radii and 4 fills. Text is mono in some styles and sans in others.
- Labels are usually 9–10px mono uppercase above the field.
- The only coded focus and error states are `.input-vani`'s. Native browser validation bubbles are used elsewhere (New Lead email).

#### Badges, pills and chips: 20 styles

- **Leads status ("new"):** mono 9px, +0.225px, uppercase, teal at 10% fill with a teal border at 30%, 20px tall.
- **Leads source:** mono **8px** bold uppercase, 16px tall. Letter glyphs stand in for icons ("F", "IG", "G", "{}", "✎", "◎").
- **Analytics "completed":** mono 9px, +1.8px, uppercase, outline only.
- **Call Reports status and sentiment ("COMPLETED", "NEUTRAL"):** Hanken 11px, +0.275px, uppercase, 10% tint fill, no border, 18px tall.
- **Billing "Inactive":** mono 10px uppercase outline pill.
- **Dashboard "IDLE" status pill and Flow Builder "Up to date" status chip.**
- **Count pills** next to titles (Call Reports), and Flow counters (mono 9px, r4).
- **Sentiment has three renderings:** a coloured word (Dashboard "POSITIVE"), a pill (Call Reports) and a "±pp" chip (Analytics WoW shift).
- **Kbd hints:** mono 9px, r4. The Leads shortcuts bar and the expanded sidebar's "Collapse [" use bare glyphs.
- **Filter chips:**
  - Leads status (8) and source (7): 25px, mono 10px, uppercase pills
  - Call Reports sentiment (4): 28px, Hanken 13px, capitalised pills
- Selection is shown by tint only.
- Heights in use: 16, 18, 20, 21, 24 and 25px.

#### Cards, panels and KPI tiles

- **Cards and panels:**
  - `.glass-card`: r16, translucent
  - `.bento-card`: r20, violet hover
  - Knowledge cards: white, r12, padding 20 or 24
  - Call Reports stat cards: r12 on `surface-light` at 40%
  - Dashboard panels: r8, with box-in-box nesting three outlines deep
  - Flow panels: r16 with a `0 14px 40px` shadow
  - Personal Agents example cards: `bg-black/20` with a `border-white/[0.06]` edge
  - Analytics cards: hatch fill with corner brackets
  - Settings › Organization empty-state box: dashed
- **KPI tiles:**
  - Analytics: mono numerals at 30.4px, alternating blue and teal, with 80x32 sparklines
  - Call Reports: four stat cards in blue, teal, green and red
  - Leads: KPI strip about 70px tall
  - Dashboard: telemetry strip in 10px mono ("LAT", "SESSION")

#### Tables and lists

| Instance | Structure today |
|---|---|
| Leads | A custom div grid with no table or row roles. Avatar with an overlapping badge, 3px-radius checkboxes, a blue call icon button per row. Rows are transparent over the grid texture. The row stack above the first row is about 400px. j/k keyboard navigation. |
| Call Reports | A horizontally scrolling table with one column per extracted flow field (most cells "—"). Hanken 13px header and body, uppercase pills, summaries clamped to 2 lines in a 190px column, a solid ▼ sort glyph. |
| Knowledge files | Mono 12px list with storage-prefixed filenames and a "21/09/2026, 16:19:12" date format |
| Analytics "Recent" | Mono table. Durations in link blue that are not links. |
| Flow "ALL FLOWS" modal | NAME / CATEGORY / LAST EDITED / [OPEN] columns with search and pagination ("Page 1 of 1 · 1-16 of 16") |

- Four date formats are in use: "21/09/2026, 16:19:12", "21 Sept, 22:44", "23 Sept 2026" and "28d ago".
- Phone numbers are consistently masked as `+91••••••XXXX`.

#### Tabs, segmented controls and filters: 6+ unrelated implementations

- Dashboard voice-persona toggle: 38px, mono 14
- Analytics range 7d/30d/90d: 24px, mono 10 uppercase
- Call Reports sentiment filter: 28px Hanken 13 pills
- Leads status and source chips: 25px mono 10 uppercase pills
- Meeting Agent session mode: 32px, **square (r0), violet fill**
- Knowledge source tabs: 30px, mono 12, r8
- Settings sub-nav: a vertical list of 17 items, 14 of which carry an ↗ external-link icon although they navigate in the same tab. Sub-pages drop this nav in favour of a "BACK TO SETTINGS" bar.

No `role=tab` or `aria-pressed` pattern is shared.

#### Overlays: modals, dialogs, drawers, panels, toasts

| Instance | Current form |
|---|---|
| New Lead modal | Blurred page overlay. H3 title directly under the page H1. Cancel and "Create lead" buttons. Autofocuses Name, closes on Esc. No `role=dialog`, no focus trap, unnamed close button. |
| Import leads dialog | Two steps (template, then upload) with a styled dropzone. The CTA is disabled until a file is chosen. |
| New webhook modal | Light translucent veil through which the background text shows. Unnamed "×". No dialog role. |
| Flow "ALL FLOWS" picker | 896px modal with an autofocused search, a table and pagination |
| Flow keyboard shortcuts (`?`) | The only element with a proper `role=dialog aria-modal` and a label. It is 451x823, so it is clipped at the viewport bottom. Focus is not moved into it. |
| Flow "AI SCRIPT PREVIEW" | 672x428 modal with a mono scrolling text area and a full-width "Close Preview" button |
| Leads drawer | Right-hand `<aside>` with no role. Holds voice, language, flow, Call Now, WhatsApp and call history. Esc does not close it, and the bottom is clipped. |
| Call Reports "CALL DETAILS" panel | Side panel, not a dialog or region. Focus stays on `<body>`. |
| Flow node inspector and Flow settings drawer | Plain-div inspector with an uppercase H3 ("SPEAK NODE"). The settings drawer closes on Esc and has no Save or Done button. |
| Personal Agents "New task" | Inline panel below the cards, not an overlay |
| Toasts and feedback | **There is no toast system** (0 sonner). Flow Builder has a `role=status` live message ("New Speak Node added.") and an "Up to date" chip. Everywhere else, success and failure are silent or appear as distant inline text (for example, the Knowledge search error renders in the Upload card, far above the input). |
| Tooltips | Native `title` attributes on nav items. A custom tooltip exists only on the sidebar-footer theme toggle. |

#### Navigation and app shell

- **Desktop rail (default):**
  - 72px, icon-only, with 12–13 items at 44x44 in a flat, ungrouped list
  - native `title` tooltips; the active item is a 3px left bar plus a tint
  - no `aria-current`
  - hidden labels at opacity 0 overflow the rail, which draws a stray horizontal scrollbar
  - Settings is clipped at 900px height; at 1366x768 only 8 of 12 items are visible
  - footer: theme toggle, expand toggle, a status dot and a latency readout
- **Expanded rail:** 240px with labels. Everything fits.
- **Mobile:** a bottom tab bar with 7 labelled items (Assistant, Agent, Leads, Reports, Billing, Knowledge and a sign-out item labelled "Exit").
- **Page header:**
  - a 63px sticky bar with 24px side padding, white at 80% and a bottom border on most pages
  - Personal Agents has no bar; Analytics has an editorial bar
  - a global "Save Changes" sits in the header on Settings
  - nav labels, mobile labels and H1s name the same destination differently ("Agent View" / "Agent" / "AGENT COCKPIT"; "Meet Agent" / "Meeting Agent — {persona}"; "Knowledge" / "AGENT KNOWLEDGE")
- **Global wallet banner:**
  - a 42px lavender bar (about `#dde3f7`) on every authenticated page except Rep Console, including Billing
  - a filled 24px "Top up" (`#111725` on blue) and an outline "Enable autopay"
- **Public headers:** three variants.
  - Home: full nav plus a "Dashboard" CTA
  - Pricing: logo plus "Email us"
  - Docs: "Back to Home", with the logo on the right

#### Empty states and loaders

**Seven empty-state styles:**
- Assistant: icon tile, H2 and suggestion chips
- Dashboard transcript: mono "Awaiting connection..." in grey
- Personal Agents: a centred sentence and a link
- Billing: a bordered mono box, "No transactions yet."
- Analytics: tracked "NO DATA" plus a serif-italic line, and a chart of 24 empty cyan cells instead of an empty state
- Settings › Organization: a dashed box with a shield icon and an outline button
- API Keys: a plain mono line

**Loaders:**
- a full-screen centred spinner with sans "Loading..." (Leads)
- mono "Loading…" (Settings sub-pages)
- a boxed "Requesting softphone credentials…" (Rep Console)
- no skeletons anywhere
- the app shell itself can mount after the data on hard navigation

#### Flow canvas elements

- **Nodes:** 8 types. Category colour is shown as Tailwind-400 *text* (amber, orange, violet, pink). Node body text is 11px mono, which renders at about 9px on screen at the default zoom.
- **Edges and edge labels:** 1px blue edges. Edge labels are 10px text in a white box that stays white in dark mode.
- **Handles:** 12px circles.
- **Minimap:** `#1a192b` with a `rgba(0,0,0,.38)` mask, which reads as a grey slab in light.
- **Palette:**
  - a 2-column grid in a 270px panel, so labels truncate ("Knowle…", "CRM Lo…")
  - the "START HERE" group duplicates items from "CONVERSATION"
- **Header:** two rows, about 180px, with a mono uppercase subtitle.

---


### 2.5 Competing visual styles, page by page

#### 2.5.1 The dialects

| # | Dialect | Signature traits | Where |
|---|---|---|---|
| 1 | **Terminal / HUD** | JetBrains Mono as the body face at 8–12px; uppercase labels tracked +0.2 to +4px; hairline borders; glows; grid and noise textures; literal-uppercase Sora H1 | Dashboard, Leads, Knowledge, Billing, Settings, Rep Console, Flow Builder panels, Login card |
| 2 | **Editorial** | "§ 0N" section numerals; Instrument Serif italic taglines; Sora 27.2/800 H2s under a 15px H1; hatch fills, dot grid and HUD corner brackets | Analytics only, layered on top of dialect 1 |
| 3 | **Plain SaaS** | Sans type at 13–14px; sentence or title case; soft pills; a calm hierarchy. Call Reports uses Hanken and the React `<Button>`. Assistant uses the system sans. | Call Reports, Assistant |
| 4 | **Violet product** | 100% mono including the H1; a hard-coded violet `#8b5cf6` primary with white text in both themes; a square (r0) segmented control | Meeting Agent only |
| 5 | **Marketing hero inside the app** | A 30px Sora H1 with a tracked mono eyebrow; no header bar; a centred container; dark-first `black/20` cards | Personal Agents |
| — | **Public site** | Forced dark; Hanken Grotesk; a violet `#7c6bf5` to cyan `#38c6e0` gradient; 16px-radius dark cards; `vlp-*` motion. Docs uses its own neutral dark `docs-*` system. | `/`, `/pricing`, `/docs` |

#### 2.5.2 Authenticated pages

In the Families column, "nodes" counts text nodes (design-system audit) and "chars" counts rendered characters (visual audit).

| Page | Dialect | Families | Sizes | Button styles | H1 treatment | Layout |
|---|---|---|---|---|---|---|
| Dashboard ("Agent Cockpit") | 1 | Nodes: mono 27 / sans 12. Chars: mono 230, system 75, Hanken 57, Sora 42. | 6 (9–18px) | 9 | Sora 18/700, +0.9px, literal "AGENT COCKPIT", "IDLE" pill, mono telemetry strip | Full-bleed. A 320px animated ring sits in the centre. Customer Intel is a panel, then a field card, then an input. Grid texture. |
| Assistant | 3 (system sans) | Nodes: sans 20. Chars: system 480, Hanken 70, Sora 45. | 6 | 7 | Sora 20/700, −0.5px, title case, with an icon and a sans subtitle | Chat layout. Empty state with suggestion chips. |
| Analytics | 2 over 1 | Nodes: mono 172 / sans 33 / serif italic 15. Chars: mono 1,312, serif 419, Sora 250. | **14** (8–32px) | 9 | Sora **15**/700, +2.7px, uppercase, with a serif-italic tagline and an "UPDATED" stamp tracked 4px. The H2s are 27.2/800. | 3,898px inner scroller, content x≈143–1358. Section 01 is "Identity". KPIs start at y≈570. |
| Leads | 1 | Nodes: mono 158 / sans 69. Chars: mono 948, Sora 344. | 7 (8–20px) | 12 | Sora 20/700, **+4px**, CSS uppercase, with a mono count line | Full-bleed. About 400px of chrome sits above the first row: banner, header, KPI strip, shortcuts bar, search and two chip rows. A teal secondary sits next to the blue primary. |
| Flow Builder | 1 plus canvas | Nodes: mono 52 / sans 48. Chars: mono 2,325, Sora 482. | 7 | **36** | Sora 18/700, +0.45px, title case, with the mono uppercase subtitle "VOICE JOURNEY WORKSPACE" | Full-bleed canvas under a two-row, roughly 180px header. The blue Save and the green ACTIVATE are styled differently. |
| Meeting Agent | 4 | Nodes: mono 55 / sans 8. Chars: mono 1,023 (sidebar only in Hanken). | 6 | 11 | **JetBrains Mono 20/600**, title case, violet persona suffix | Full-bleed, x≈104–1397. The right rail shows backend port, env-var and GPU status text. |
| Personal Agents | 5 | Nodes: sans 22 / mono 4. Chars: system 1,078. | 6 | 5 | **Sora 30/700**, −0.75px, with the mono eyebrow "AUTONOMOUS TASKS" tracked 3px. No header bar. | Centred about 1120px, left-biased (x≈191–1311). Grey example cards. A 42px phantom document scroll. |
| Rep Console | 1 | Nodes: mono 12 / sans 8. Chars: mono 274. | 5 | 5 | **JetBrains Mono 24/500**, −0.6px, sentence case, "← Dashboard" back link | A 640px column. The only page without the wallet banner. |
| Call Reports | 3 (Hanken) | Nodes: **Hanken 936, 0 mono**. Chars: Hanken 14,818. | 6 | 9 | Sora 20/700, −0.5px, title case, with a count pill and a sans subtitle | Full-bleed. A horizontally scrolling table. The only page that uses the React `<Button>`. |
| Billing | 1 | Nodes: mono 16 / sans 17. Chars: mono 365, system 108, Sora 77. | 6 | 7 | Sora 18/700, +0.9px, literal "BILLING", with an icon | Centred about 1150px (x≈176–1326). Uses `.btn-*`. The banner repeats the page's own CTAs. |
| Knowledge | 1 | Nodes: mono 58 / sans 17. Chars: mono 1,436. | 6 | 11 | Sora 18/700, +0.9px, literal "AGENT KNOWLEDGE" | Centred about 1150px. White r12 cards. A native file input. |
| Settings (Profile) | 1 (mixed) | Nodes: sans 30 / mono 23. Chars: mono 768, Sora 205, system 86. | 6 | 8 | Sora 18/700, +0.9px, literal "SETTINGS", with a global "Save Changes" in the header | A 576px form column inside a 1140px pane. A 17-item sub-nav. |
| Settings › Organization | 1 | Mono-led | — | — | JetBrains Mono 24, title case | A "BACK TO SETTINGS" bar with no sub-nav. A 512px column. A dashed empty state. |
| API Keys | 1 | Mono-led | — | — | Sora 24/700 with the mono eyebrow "PUBLIC API" and an icon | Standalone layout outside the settings shell |

**Page titles.** Across the 12 main pages there are **7 H1 treatments**, at sizes 15, 18, 20, 24 and 30px, in two families and four case styles. Uppercase comes sometimes from CSS and sometimes from literal text. Counting the sub-pages and the header extras, the visual audit finds 13.

**Content widths** are full-bleed, about 1150, about 1120, 640, 576 and 512px. No single max-width is shared.

#### 2.5.3 Signed-out and public pages

- **Login:** a centred card that combines four families: the Syne wordmark, a Sora heading, a JetBrains Mono subtitle and labels, and system-sans inputs and buttons. The "Sign In" button uses the app's black-on-blue primary. The footer reads "Neural Platform v2.0.4 — Enterprise Security Enabled".
- **Home `/`:**
  - Type: Hanken at 6,310 characters; H1 72/600 at −1.8px; violet-to-cyan gradient text.
  - Surfaces: 16px dark cards and polished product mocks.
  - Scale: 25 font sizes, including half-pixels (11.5 to 17.5), and 15 radii.
  - Details: emoji as icons on the industry tabs; scroll-reveal sections that stay blank until intersected; white-on-`#7c6bf5` chips and a "Start free" CTA.
  - Header: full nav plus a "Dashboard" CTA.
- **Pricing:** mono-heavy (62 of 119 text nodes). The CTA is black on violet. The header has the logo plus "Email us".
- **Docs:** the dark-only `.docs-api` neutral palette with about 90 BEM `docs-*` classes, mono-heavy. The header has "Back to Home" with the logo on the right.

### 2.6 Dark mode: current state

- **Mechanism.**
  - The theme toggle sits in the sidebar footer. It shows a sun in light and a moon in dark, with the custom tooltip "Light mode".
  - It sets `html.dark` plus `localStorage["vv:theme"]` and nothing else.
  - There are only two states; there is no "System" option.
  - The app defaults to light. `/`, `/pricing` and `/docs` are forced dark.
- **Token coverage is complete.** All 32 app variables have dark values. The docs palette is dark only.
  - The dark neutral ramp: background `#0c0d12`; surfaces `#14161d`, `#1a1d26` and `#232733`; borders `#282c38` and `#3a3f4f`; text `#e8eaf2`, `#a6abbd` and `#7b8196`.
  - Muted text reaches 5.01:1 on the background and 4.35:1 on cards.
- **The brand hue shifts with the theme.**
  - Primary: blue `#2f5fe0` to violet `#7c6bf5`. Black button text there measures 5.28:1.
  - Accent: teal `#0e9488` to cyan `#38c6e0`.
  - Sentiment colours are lightened.
  - Meeting Agent's `#8b5cf6` does not change.
- **Dark reads more coherently than light.** Measured AA text failures, dark vs light:
  - Dashboard: 19% vs 71%
  - Billing: 7% vs 41%
  - Personal Agents: 9% vs 36%
  - Across the light app overall: 66% (969 of 1,473 text nodes)
- **Much of the UI was authored dark-first.** These pieces render correctly only in dark:
  - `white/…` and `black/…` utilities (Personal Agents cards, `border-white/10`)
  - Tailwind-400 node text colours on Flow Builder
  - the `#1a192b` minimap
  - the cyan hour-grid tint on Analytics
  - the violet hard-coded in `.bento-card`, `.link-saffron`, `.section-numeral` and the dashboard radial gradient
- **Unthemed in dark:**
  - the Flow edge-label box stays white
  - the Analytics serif "not allocated yet" stays low contrast
  - the transcript "Awaiting connection..." measures 1.77:1
- **Two dark switches coexist.** 21 `dark:` utility rules (`dark:bg-slate-900`, `dark:text-red-300` and others) compile under `@media (prefers-color-scheme: dark)`, so they follow the OS, not the in-app class. No affected screen has been confirmed yet.
- **Side effect of the toggle.** On Dashboard and Flow Builder the toggle is followed by a `PUT /api/flows/{id}`. This is reported under the functional findings.
- **Screenshots:**
  - visual audit: `dark_dashboard`, `dark_analytics`, `dark_leads`, `dark_flow-builder`, `dark_call-reports`, `dark_meeting-agent`
  - design-system audit: `dark-dashboard`, `dark-billing`, `dark-flow-builder`, `dark-personal`

### 2.7 What already works and should be preserved

1. **The semantic token layer.** It has 32 variables with complete light and dark pairs, on Tailwind v4 `@theme`. Tokens can be renamed and formalised without a rewrite.
2. **The neutral ramp.**
   - Text: `#111725` / `#3e475a`
   - Surfaces: `#f4f6fa` / `#eef1f7` / `#fff`
   - Borders: `#e1e6ef` (892 sides) and `#cbd3e1` as the strong border
   - The dark ramp is the more finished of the two and is a good reference.
3. **Values that already converge:**
   - radius 8px (336 uses)
   - padding 12/16/8/4 on a mostly respected 4px grid
   - 1px hairlines
   - .15–.2s transitions with `cubic-bezier(.4,0,.2,1)`
4. **Icons.** Lucide is the only icon library, with a consistent outline stroke and 20px nav icons.
5. **Seeds for primitives.**
   - The CVA-style React `<Button>` already has variants, a `focus-visible` ring and a disabled state.
   - `.input-vani` already models focus and error states.
   - `.btn-*` already define disabled states and a 44px mobile touch height.
6. **Call Reports and Assistant** show the right direction for app pages: sans type, title case, calm hierarchy and one clear primary action.
7. **Navigation that works:**
   - the expanded 240px sidebar, where labels fit and nothing clips
   - the mobile bottom tab bar, which has text labels
8. **Dark mode** is thorough and tuned.
9. **The marketing type system** (Hanken, 72/600 display, 16px cards, product mocks) is coherent and is the natural source for the app's sans.
10. **Consistent hover feedback** on primary buttons: a glow and a −1px lift.
11. **Phone masking.** `+91••••••XXXX` is used throughout and is worth formalising as a display pattern.
12. **Well-built pieces to reuse as patterns:**
    - Flow Builder affordances: validation badge, node and link counts, undo/redo, zoom, minimap in dark, `role=status` announcements, a labelled shortcuts dialog, and the searchable, paginated "ALL FLOWS" picker
    - The New Lead modal: visible labels, required markers, autofocus and Esc
    - The Import dialog: two steps, limits stated up front, and a CTA disabled until a file is chosen
    - Login's order: OAuth, then email and password, then magic link
13. **Groundwork already exists.** `.type-floor` shows the team already recognised the small-text problem, and its logic can be reused. The Analytics editorial layout is internally coherent. The design-system agent would keep it as a reserved "report" style. The visual audit would remove it from the app. That choice is left to the redesign direction.

### 2.8 Measurement notes (how the two sources reconcile)

- **H1 treatments:** 7 vs 13. The design-system audit groups the 12 main pages by size, weight, tracking and case. The visual audit adds Settings › Organization and API Keys and separates treatments by their extras. Both counts are right at their own granularity.
- **Family mix:** text nodes vs characters. Settings is sans-majority by nodes (30 vs 23) but mono-majority by characters (768), because mono carries the long body strings.
- **Hanken weights:** 400–700 are registered in CSS, but only 500 appeared in `document.fonts` as loaded, because browsers fetch only the faces a page uses.
- **Buttons:** 80 counts full style signatures; 18 counts heights alone.
- **Radii:** 12 values (design-system); the visual audit adds 0 (Meeting Agent segmented control).
- **Contrast samples:**
  - The placeholder dashes measure 1.75:1 ×381 (computed styles) vs 1.81:1 ×498 (sampled pixels).
  - Flow node text measures 1.48 and 2.00:1 against `#eef1f7` vs 1.67, 2.26, 2.72 and 2.65:1 against the node surface.
- **Borders:** all measurements were taken at DPR 1.25, so a 0.8px border is 1 CSS px.
- **Not covered by these two sources:**
  - `/signup`
  - most Settings sub-pages
  - `/login` in the signed-in comparison
  - mobile and tablet, beyond one 390px check (see the responsive sections)

---

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

---


### F-UX-008 — Phone navigation reaches only 6 of 12 sections and has no "More" menu
- **Severity:** high · **Confidence:** partially-verified
- **Source findings:** RESPONSIVE-A-01, RESPONSIVE-B-01
- **Pages:** all authenticated pages at ≤767 px
- **Evidence:**
  - At 390×844 the rail (13 links) is `display:none`. The only navigation is the bottom bar (y=788, 56 px tall): Assistant, Agent, Leads, Reports, Billing, Knowledge and **Exit** (a sign-out button).
  - There is no More, menu or drawer control. A probe for menu|navigation|sidebar|drawer|expand found nothing.
  - No visible link on any checked page reaches /analytics, /flow-builder, /meeting-agent, /personal-agents or /rep-console, even though those routes render mobile layouts when opened by URL.
  - Settings is reachable only through the wallet banner's wrong-target links (F-UX-002), and only while the balance is ₹0 and the banner has not been dismissed.
  - There is no `aria-current`. On /analytics and /settings no tab is shown as active, and the bar has no safe-area padding.
  - At 390 px the Cockpit also hides the flow selector and Customer Intel (width 0).
  - The verifier downgraded this from critical: core phone tasks (calls, leads, reports, billing) still work.
- **Screenshots:** va-verify-responsive-a/dashboard_390.png, va-verify-responsive-a/settings_390.png, va-verify-responsive-b/analytics_390.png, va-verify-responsive-b/settings_390.png, va-explore-core/dashboard_mobile.png
- **Recommendation:**
  - Use 4 tabs plus "More", for example Assistant · Agent · Leads · Reports · More.
  - "More" opens a full-height sheet that lists every destination, grouped like the desktop rail. It ends with Settings, Billing, the account and Sign out, with Sign out separated and confirmed.
  - Add `aria-current="page"`, an active state for sections opened from More, and `padding-bottom: env(safe-area-inset-bottom)`.
  - Keep the flow picker visible on the phone Cockpit.

### F-UX-009 — The Call Reports table is 2,617 px wide with 17 columns, no anchor column, only 50 of 121 calls, and mouse-only rows
- **Severity:** high · **Confidence:** verified
- **Source findings:** UX-AUDIT-09, EXPLORE-DATA-04
- **Pages:** /call-reports
- **Evidence:**
  - A 2,617 px `<table>` sits in a 1,358 px scroller that is 601 px tall and scrolls vertically on its own.
  - It has 17 data columns plus an action column:
    - 7 core columns
    - 10 extracted-field columns, the union across all flows, including 3× "Condition Check", "Condition Check (Residential)" and the typo "Green & Identity"
  - Most cells are "—", and the filled ones hold raw caller utterances.
  - Type, To and Started are not sticky, so after scrolling right a value can't be tied to its call. Row actions sit at x≈2,450.
  - Only 50 `tbody` rows render for "121 calls", with no pager, load-more or infinite scroll. QA-B-01 reports this separately as a critical functional bug.
  - Rows have `cursor:pointer`, `tabIndex -1` and no role. Their only focusable children are Re-analyze and Download CSV, so a keyboard user cannot open a call (verified).
  - The only filters are sentiment chips: there is no date, flow, agent, status or direction filter.
- **Screenshots:** va-verify-ux-audit/15_call_reports.png, va-explore-data/r2_callreports_hscroll.png, va-explore-data/r2_callreports_bottom.png, va-ux-audit/37_call_reports.png
- **Recommendation:**
  - Pin Started, Lead/To, Outcome and Sentiment on the left and the actions on the right, using `position:sticky`.
  - Collapse the extracted fields into one "Captured" chip column with a column picker. Show per-field columns only when a flow filter is applied, and label duplicates by node ("Condition Check · step 3").
  - Add server pagination or virtual scrolling with a "1–50 of 121" counter.
  - Make each row a link to `/call-reports/:id` that Enter or Space opens.
  - Add Date range, Flow, Direction and Status filters.

### F-UX-010 — The call detail panel buries the transcript at the bottom of a cramped 373 px panel with nested scrolling
- **Severity:** high · **Confidence:** verified
- **Source findings:** UX-AUDIT-09, EXPLORE-DATA-23
- **Pages:** /call-reports (detail panel)
- **Evidence:**
  - The panel is about 373 px wide (`w-96`) and holds 2,504 px of content in a 601 px scroll area.
  - Its order is: details → key elements extracted → Analysis → Topics → AI suggestions → Flow Builder fields → Re-analyze → Learn from this call → Recording → Transcript → Export. The transcript sits in a nested 384 px (`max-h-96`) scroller, and reading it takes about 1,500 px of scrolling.
  - The page header promises "Recordings, transcripts…", but the opened call says "No recording is available for this call."
  - The key-elements "question" column is about 90 px wide, so text wraps one word per line.
  - "FLOW BUILDER FIELDS: not collected" contradicts the captured answers shown above it.
  - Duration reads "87s" here and "1:27" in the table. The dialled number is "—".
  - The Call ID is truncated with no copy button, and the close × has no accessible name. Esc does nothing.
  - After a no-match search the panel stays open on a call that is no longer in the results.
- **Screenshots:** va-verify-ux-audit/16_call_detail.png, va-verify-ux-audit/18_call_reports_nomatch.png, va-explore-data/r2_callreports_detail.png, va-explore-data/r2_callreports_detail_low.png, va-ux-audit/40_call_detail_scrolled2.png
- **Recommendation:**
  - Use a `/call-reports/:id` route or a drawer at least 640 px wide, with tabs:
    - Summary: outcome, sentiment, 3-line summary
    - Transcript: with the audio player on top when a recording exists
    - Extracted data
    - Actions
  - Keep one scroll container.
  - Close on Esc and on × (`aria-label="Close call details"`). Close or re-select when the row drops out of the results.
  - Add a Copy ID button and use one duration formatter.
  - Take "not collected" and captured answers from the same source.
  - Stop promising recordings in the header when recording is off.

### F-UX-011 — The same metrics and call types disagree across Analytics, Call Reports and Billing
- **Severity:** high · **Confidence:** partially-verified
- **Source findings:** EXPLORE-DATA-17, EXPLORE-DATA-20, UX-AUDIT-09
- **Pages:** /analytics, /call-reports, /billing
- **Evidence:**
  - Average duration is 1m 18s on Analytics and 90s on Call Reports for the same 121 calls. The verifier re-observed both values.
  - Call type is INBOUND/OUTBOUND on Analytics and BROWSER on Call Reports.
  - Each browser test call appears as two rows 1 s apart: one with To "—" and one with the masked number (Analytics §07 shows "— → — INBOUND" plus "OUTBOUND"). Counts are probably inflated.
  - Analytics §06 Phone shows CALLS ON LINE 0, UNIQUE CALLERS 0, 24 empty hour bars and "No callers yet", while §07 lists inbound calls. The scope (DID calls only) is never stated.
  - §08 says "No call recordings yet" despite 121 calls and gives no reason.
  - 158 minutes are used against a ₹0.00 balance and 0 transactions, with no explanation.
  - One duration appears in four formats: 1m 27s, 1:27, 87s, 90s.
- **Screenshots:** va-verify-ux-audit/28_analytics_avg.png, va-verify-ux-audit/15_call_reports.png, va-explore-data/analytics_s2400.png, va-explore-data/analytics_s3200.png, va-explore-data/analytics_s3700.png, va-ux-audit/crop_callreports_paired_rows.png
- **Recommendation:**
  - Use one metrics service with documented definitions (mean or median; completed calls only or all), and give each KPI a definition tooltip.
  - Merge call legs into one call record before counting.
  - Use one enum for channel (Phone / Browser) and one for direction.
  - Label scopes, for example "Calls to your number: none yet (number not allocated)", with a setup CTA.
  - Explain missing recordings, for example "Recording is off for browser tests".
  - Add a usage ledger that reconciles minutes with free credits and wallet debits.
  - Use one shared `formatDuration`.

### F-UX-012 — Settings "Save Changes" is always enabled, covers only two fields, and silently discards unsaved edits
- **Severity:** high · **Confidence:** multi-agent
- **Source findings:** EXPLORE-SETTINGS-06, QA-B-17
- **Pages:** /settings (Profile) and all Settings sub-pages
- **Evidence:**
  - A blue "Save Changes" button (141×37) sits in the page header next to "SETTINGS". Its `disabled` state is always false and it has no dirty styling.
  - It covers only Full Name and Phone. Subdomain (Edit), WhatsApp brochure (Upload) and Google/Microsoft (Connect) each have their own action.
  - It disappears on Meetings Billing and Docs, and the header shifts 9 px when it does.
  - Settings uses 7 save models:
    - autosave (Notifications)
    - "Save preference", disabled until the value changes (Call channel)
    - "Send code"
    - "Send confirmation links"
    - "Create webhook"
    - "Mint key"
    - "Save Changes"
  - Two agents typed into Profile, then clicked the Organization sub-nav. The app navigated immediately with no confirm or `beforeunload`, and the edits were lost.
  - Unsaved edits do survive switching between in-page tabs, but with no dirty indicator.
- **Screenshots:** va-explore-settings/c17_profile_dirty.png, va-explore-settings/c3_meetings_billing.png, va-qa-b/settings-profile-dirty.png, va-qa-b/settings-call-channel.png, va-qa-b/settings-notifications.png
- **Recommendation:**
  - Remove the header Save.
  - Apply one rule everywhere:
    - Forms get a section-scoped sticky bar ("Unsaved changes · Discard · Save") that appears only when the form is dirty.
    - Switches autosave, confirm with a "Saved" toast, and roll back with an error on failure.
  - Add route-change and `beforeunload` guards for dirty forms.
  - Validate phone numbers as E.164 with a +91 default and an inline error.

### F-UX-013 — Paid, real-world call actions show no pre-flight check, and bulk "CALL n" and the single-key "C" shortcut dial real leads
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** UX-AUDIT-04, EXPLORE-DATA-07, QA-B-21
- **Pages:** /leads, /dashboard
- **Evidence:**
  - With the wallet at ₹0.00 and the DID PENDING, every call control is enabled:
    - bulk "CALL 2", or "CALL 24" after `A` selects all 24 leads
    - the lead panel's "Call Now"
    - the per-row phone buttons (titled "Call <name> (c)")
    - the unmodified `C` shortcut
    - Cockpit CONNECT, which has no title
    - Test Call, which enables for "abc"
  - The 766 px bulk bar holds only voice, language, a "Default flow" select and CALL n. It shows no cost, calling window, DND/consent note or retry policy.
  - Calling is the only bulk action: no status change, export, tag or delete.
  - The j/k row focus is visual only (`activeElement` stays BODY).
  - Buttons were not clicked. The verifier confirmed that no check appears before the click. Whether a confirmation or balance check appears after the click is unverified, so the verifier rated this medium.
- **Screenshots:** va-verify-ux-audit/04_leads_bulk.png, va-ux-audit/31_leads_two_selected.png, va-ux-audit/34_lead_panel_actions.png, va-explore-data/r2_leads_kbd_selectall.png, va-qa-b/leads-kbd-a.png
- **Recommendation:**
  - Build a shared `CallPreflight` used by every call control. It checks wallet, calling number, channel and calling hours. When blocked, it shows the reason and a fix link ("Add ₹100 to call", "Verify a calling number").
  - For more than one lead, show a confirmation sheet with count × estimated cost against the balance, the flow name and version, voice, caller-ID, calling window and the DND scrub result.
  - Move the shortcut to Shift+C (or add a confirm popover), and disable it while blocked.
  - Add bulk Set status, Export, Add to campaign and Delete.
  - Use a roving tabindex for j/k.

### F-UX-014 — The Cockpit's flow and voice pickers silently save the account default, and silently revert on failure
- **Severity:** medium · **Confidence:** verified
- **Source findings:** QA-A-04, EXPLORE-CORE-03
- **Pages:** /dashboard (the change also affects /meeting-agent)
- **Evidence:**
  - Every flow-select change and every Vaani/Vikash click sends `PATCH /api/auth/profile` (`{voice_preference}` or `{active_flow_id}`). Clicking the voice that is already selected also sends a PATCH.
  - No toast or inline status appears. The only `role=alert` on the page is the wallet banner.
  - Under simulated failure the UI keeps the new value with no error. After a reload it reverts to Vaani and to the original flow.
  - The same profile value drives Meeting Agent's "Active flow (from profile)".
  - The Cockpit has no "Edit in Flow Builder" link and no voice preview. The voice descriptions ("male / direct", "female / warm") exist only in the lead panel.
  - The default voice is VAANI in the Cockpit and VIKASH in Leads.
  - The verifier notes that saving a preference instantly is a normal pattern. The defects are the missing feedback and the hidden cross-page effect, so it rated this medium.
- **Screenshots:** va-verify-qa-a/dash_vikash_after_click.png, va-verify-qa-a/dash_vikash_after_fail.png, va-qa-a/dash_flow_changed_blocked.png, va-explore-core/cockpit_flow_switched.png, va-explore-core/cockpit_vikash_selected.png
- **Recommendation:**
  - Make the Cockpit selection session-only ("for this test"). Add an explicit "Set as default" that saves and toasts "Default flow updated · used by Cockpit, Meeting Agent, Leads".
  - If the pickers stay global, label them "Default flow" and "Default voice", apply the change optimistically with rollback and an error toast, and don't send a PATCH when nothing changed.
  - Show the voice descriptors, add a voice preview, and link "Open in Flow Builder".

---


### F-UX-015 — Telephony setup is contradictory and split across five pages, and the DID hint points to a Billing page that has no numbers
- **Severity:** medium · **Confidence:** verified
- **Source findings:** UX-AUDIT-07, EXPLORE-DATA-21, UX-AUDIT-27
- **Pages:** /settings/call-channel, /settings/calling-number, /settings (Profile), /analytics §01, /billing, /rep-console, /personal-agents, /settings/personal-agent
- **Evidence:**
  - Call channel's default "Phone (PSTN)" says the "Agent forwards the caller to your phone number". The page shows no number and the Profile phone is empty (placeholder "+91…"). Nothing says whether PSTN uses the Profile phone or the verified calling number.
  - A "Heads up" box says Browser and Auto "fall back to PSTN until the in-browser softphone bridge ships". Yet Rep Console, a browser softphone, is in the main nav and says calls land there when the channel is Browser or Auto. Two of the three options are offered but do not work. "Save preference" is greyed until the value changes, with no hint.
  - Calling number is a caller-ID verification stepper (1 Owned → 2 Compliance → 3 Authorized). "Send code" enables for "abc".
  - Analytics §01 reads "ALLOCATED DID · PENDING · not allocated yet · Allocate a number from billing to start receiving calls." This is plain text, not a link. `/billing` has only wallet, autopay, top-up and history. While loading, the same card first reads "Inbound voice agent — callers reach your Vaani agent here.", so the copy flashes.
  - Personal Agents promises the agent "works persistently on its assigned number". `/settings/personal-agent` says "No number assigned yet. Provisioning is admin-assigned".
  - Calling number and Analytics don't link to each other. "DID", "calling number", "assigned number" and "your phone number" are four names for number concepts.
  - The verifier re-observed every item. It rated the finding medium: real friction, but not a blocker it could demonstrate.
- **Screenshots:** va-verify-ux-audit/25_call_channel.png, va-verify-ux-audit/26_calling_number.png, va-verify-ux-audit/27_analytics_did.png, va-verify-ux-audit/29_personal_agents.png, va-ux-audit/16_settings_call_channel.png, va-ux-audit/52_analytics_did_card.png, va-explore-core/settings_personal_agent.png
- **Recommendation:**
  - Create one "Phone setup" page (e.g. `/settings/phone`) with a status row for each part:
    - Inbound number: DID allocated or pending, with a "Request number" action
    - Caller ID: verified or not, using the existing 3-step stepper
    - Transfer destination: the PSTN number, shown and editable inline, or the browser softphone
    - A "Place a test call" action
  - Until the bridge works, hide Browser and Auto, or disable them with a "Coming soon" tag. If Rep Console already works, remove the "Heads up" copy instead.
  - Link every mention of a number to this page: the Analytics DID card, Personal Agents, Call channel and the setup checklist (F-UX-006). Use one glossary: "Inbound number" and "Caller ID".
  - Show the DID card as a skeleton until the data loads, instead of flashing placeholder copy.

### F-UX-016 — Internal engineering details, developer notes, vendor names and QA data are shown to customers
- **Severity:** medium · **Confidence:** verified
- **Source findings:** UX-AUDIT-10, EXPLORE-CORE-10, VISUAL-AUDIT-12, EXPLORE-DATA-03, EXPLORE-SETTINGS-11, QA-B-19, A11Y-MANUAL-20
- **Pages:** /meeting-agent, /knowledge, /leads (filters, drawer, import), /call-reports, /settings/integrations, /settings/call-channel, /settings (Profile), /settings/delete, /flow-builder, /rep-console, /dashboard, global rail
- **Evidence (strings quoted as displayed):**
  - **Meeting Agent** (verified live):
    - The right column shows a "GPU SERVER STATUS Online" card and a card reading "BACKEND — Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL", which is an environment-variable name.
    - The Presentation mode hint includes the function name "(present_topic)", and Generate PPT names the vendor ("no LiveKit").
    - Past Meetings lists the QA artefacts "ZZ Mobile QA Room 22Sep" and "E2E Test Room 21Sep". This part was reported by one agent.
  - **Leads:**
    - The language and outcome selects are named only by `title` notes: "Reads metadata.extra.language until a schema column lands" and "full-list join is a backend TODO". Screen readers announce these notes as the control names.
    - Chip names read "FFACEBOOK", "IGINSTAGRAM" and "{}API" because the glyphs are not `aria-hidden`.
    - The Import dialog says extra columns are "folded into metadata.extra".
    - Call history in the lead drawer labels calls with the carrier's name, "VOBIZ".
  - **Call Reports:** the row button's title is "Re-run AI analysis from scratch (force=true)".
  - **Knowledge** (verified): "chunked, embedded with Gemini", "Gemini text-embedding-004 (768-dimensional vectors)" and "pgvector".
  - **Settings:**
    - Integrations: "stub row until app-review credentials are ready", "Two-way sync deferred to a follow-up", "Chat surface lives in the agent backend", "during pilot calls", and the raw link text "/admin/organizations".
    - Call channel: "until the in-browser softphone bridge ships".
    - Profile: literal backticks around "`{slug}.vaanilabs.in`", and "You can change it once or twice".
    - Delete: "required for app-store compliance".
  - **Chrome, Cockpit and Flow Builder:** "LAT: 0ms", "SESSION: IDLE", "RGN: Mumbai-1", and "Soul.md" in Flow settings. Rep Console shows a raw LiveKit error (F-UX-019, F-UX-023).
  - The verifier confirmed the strings live and rated them medium: they are cosmetic and block nothing. EXPLORE-CORE-10 and EXPLORE-DATA-03 had rated them high.
  - VISUAL-AUDIT-12 also covers the page's all-mono type and off-system violet, which belong to F-VIS-001 and F-VIS-004.
- **Screenshots:** va-verify-ux-audit/21_meeting_backend_card.png, va-ux-audit/44_meeting_env_var_leak.png, va-explore-core/meeting_agent_2.png, va-visual-audit/meeting-agent_full.png, va-explore-settings/c12_integrations.png, va-ux-audit/48_knowledge.png, va-ux-audit/34_lead_panel_actions.png
- **Recommendation:**
  - Remove the GPU, Backend and port/env-var cards from customer builds. Show infrastructure health to staff on an internal admin route, and to customers only as a status-page link.
  - Archive the QA rooms in production orgs. Add a CI check that fails when production seed or fixture data contains "QA", "E2E" or "Test Room".
  - Give each filter control a real `aria-label` ("Filter by language", "Filter by last call outcome"), and wrap chip glyphs in `aria-hidden` spans.
  - Do a copy pass backed by a banned-terms lint (`metadata.`, TODO, `force=`, pgvector, `NEXT_PUBLIC_`, port, stub, LiveKit, VOBIZ, Soul.md). Replacements:
    - "Extra columns are kept as custom fields"
    - "Re-run analysis"
    - "Personality" instead of Soul.md
    - "Phone call" instead of the carrier's name
    - "Coming soon" or "Beta" for unfinished integrations
    - "Create an organization" as the link text
  - Render inline code in helper text properly, or remove it. State exact limits, e.g. "You can change your subdomain 2 more times".

### F-UX-017 — Navigation names, keyboard behaviour and active state are inconsistent across the rail, mobile bar and page titles
- **Severity:** medium · **Confidence:** verified
- **Source findings:** EXPLORE-CORE-05, UX-AUDIT-11, VISUAL-AUDIT-05, EXPLORE-SETTINGS-07, EXPLORE-SETTINGS-13, DESIGN-SYSTEM-19, DESIGN-RESEARCH-09
- **Pages:** global rail, mobile bottom bar, page headers; /settings/*, /api-keys, /api-keys/embed, /webhooks
- **Evidence:**
  - Names for the same destination:

    | Route | Rail or sub-nav label | Mobile tab | Page H1 | Elsewhere |
    |---|---|---|---|---|
    | /dashboard | Agent View | Agent | AGENT COCKPIT | "Dashboard" (URL, Rep Console back link, onboarding CTA) |
    | /meeting-agent | Meet Agent | — | Meeting Agent — Vikash | |
    | /knowledge | Knowledge | Knowledge | AGENT KNOWLEDGE | |
    | /call-reports | Call Reports | Reports | Call Reports | |
    | /settings/security | Security | — | Two-factor authentication | |
    | /settings/activity | Activity & Audit | — | Account Activity | |

  - "Agent" names five different things: the Cockpit, Meeting Agent, Personal Agents, Agent Knowledge and the Assistant. Sign-out is labelled "Sign Out", "Sign out" and "Exit".
  - The 12 rail links are icon-only in a flat list with no groups, and their names come only from `title`. The verifier notes that `title` still gives each link an accessible name and a delayed native tooltip. The theme toggle has a custom tooltip; the nav links don't.
  - Each nav `<a>` wraps a `<div tabindex="0">`, so Tab stops on A, DIV, A, DIV. That is 2 stops per item, 24+ presses to get past the rail, and a nested interactive element. There is no skip link, and focus shows only the default 0.8 px outline (verified).
  - No rail item is active on `/settings/*`, `/api-keys`, `/api-keys/embed` or `/webhooks` (`activeOnSub = []`), while `/billing`, `/analytics` and `/leads` do show one. No link has `aria-current`.
  - The expanded 240 px rail fixes most of this: it has labels and fits at 900 px. It is not the default, and its labels are `#7A8397` on white (3.80:1).
  - The verifier rated the naming mismatch medium because it blocks nothing. EXPLORE-CORE-05 and EXPLORE-SETTINGS-07 had rated it high.
- **Screenshots:** va-verify-a11y-manual/01-sidebar-innerdiv-focus.png, va-a11y-manual/07-sidebar-innerdiv-focus.png, va-explore-core/focus_state_nav.png, va-ux-audit/14_sidebar_expanded.png, va-explore-settings/c18_sidebar_hover.png, va-explore-settings/c8_api_keys.png, va-design-system/mobile-analytics.png
- **Recommendation:**
  - Drive the rail label, tooltip, mobile label, H1 and `<title>` from one `navConfig` entry per destination. Give each destination one noun, e.g. "Live calls", "Meetings", "Tasks", "Knowledge", "Call log" and "Security". Rename routes and redirect the old ones.
  - Remove the inner `tabindex="0"` so each item is one tab stop. Add a "Skip to content" link and a 2 px `:focus-visible` ring token.
  - Match the active item by route prefix: `/settings`, `/api-keys` and `/webhooks` highlight Settings, or "Developers" once regrouped. Set `aria-current="page"`.
  - At ≥1280 px, default to the labelled rail with 3–4 groups (Engage, Build, Insights, with utilities pinned to the footer). Raise label contrast to at least 4.5:1.
  - The same rail's clipping and scrollbar defects are covered in F-UX-007.

### F-UX-018 — The rail's "SYS: ONLINE · latency · RGN" status is hard-coded and random, and stays green while things are offline
- **Severity:** medium · **Confidence:** verified
- **Source findings:** QA-A-02, EXPLORE-CORE-19, UX-AUDIT-24, QA-B-13, DESIGN-RESEARCH-09
- **Pages:** global rail footer (all authenticated pages)
- **Evidence:**
  - In the `(dashboard)/layout` bundle, the status is `useState("online")` and its setter is never called. Latency is `setInterval(() => T(Math.floor(8 + 15*Math.random())), 3e3)`, a random 8–22 ms every 3 s. "RGN: Mumbai-1" is a string literal.
  - The verifier took its tab offline for 12 s (`navigator.onLine=false`). The dot stayed `rgb(23,138,85)`, the text stayed "SYS: ONLINE", and latency went 12 → 10 → 9 → 18 → 13 ms.
  - The indicator also stayed green while Rep Console showed "Offline / Could not connect", and during failed offline refreshes on Call Reports.
  - Collapsed, it is an unlabelled green dot plus "12ms". Expanded, it reads "SYS:ONLINE 10ms". RGN and the user's email exist only as hidden DOM text.
  - The verifier rated it medium: it is a small footer element that no feature depends on. It is still a fake health signal in a product that sells call reliability.
- **Screenshots:** va-verify-qa-a/offline_status_footer.png, va-qa-a/offline_12s_status.png, va-explore-core/sidebar_expanded_footer.png, va-explore-core/crop_sidebar_footer.png, va-ux-audit/47_rep_console.png
- **Recommendation:**
  - Remove it now, or wire it to real signals: `navigator.onLine` with `online`/`offline` events, a `/api/health` round-trip every 30–60 s, and backend and telephony status.
  - Show three states as text, not colour alone: Online, Degraded, Offline. Link them to `/status`.
  - If a latency figure stays, label what it measures (e.g. "API 120 ms") and show a real measurement, never a random number.
  - Show the rep's availability from Rep Console presence as a separate indicator with its own label.

### F-UX-019 — Failures are silent, raw, contradictory or shown far from the action, and nothing offers Retry
- **Severity:** medium · **Confidence:** verified
- **Source findings:** QA-A-07, UX-AUDIT-14, EXPLORE-DATA-18, QA-B-26, QA-B-13
- **Pages:** /personal-agents, /meeting-agent, /dashboard, /flow-builder, /knowledge, /rep-console, /call-reports, /assistant, client-side navigation
- **Evidence (under simulated failure: the audit guard caused the failures, but the handling is the product's):**
  - **Personal Agents,** with `/tasks` returning 500: the raw server string appears in a pink box, "No tasks yet. Click New task…" still renders below it, and there is no Retry (verified). Offline, the box shows "Failed to fetch".
  - **Meeting Agent,** with `GET /api/meet` returning 500 after Refresh: no message appears, PAST MEETINGS disappears, and the active room link switches from a 12-character short code to a 22-character room-ID URL (verified).
  - **Cockpit:** "Refresh flows" offline spins and then does nothing (verified).
  - **Flow Builder:** shows "Up to date" after failed saves (verified).
  - **Knowledge:** the test search error "Search failed — check network connection" (12 px, `#D0463A`) appears inside the Upload Knowledge card at y≈370. The Search input is about 520 px lower, at y≈888. The verifier found both on screen at 1440×900, so "off-screen" was overstated, but the message is in the wrong card and is not announced.
  - **Rep Console:** "Could not connect — could not establish signal connection: Websocket got closed during a (re)connection attempt:". This is raw SDK text, ending in a colon, with no Retry (verified).
  - **Offline navigation:** clicking a sidebar link logs "Failed to fetch RSC payload" and loads `chrome-error://`, losing the whole app shell. On Call Reports, Refresh offline shows no toast and no inline error. The verifier did not re-test these two.
  - The verifier rated the finding medium because all of this appears only on error paths.
- **Screenshots:** va-verify-qa-a/pa_tasks_500_verify.png, va-verify-qa-a/meeting_api_meet_500_verify.png, va-verify-qa-a/offline_refresh_flows.png, va-verify-ux-audit/23_knowledge_search_fail.png, va-verify-ux-audit/24_rep_console.png, va-qa-a/pa_refresh_offline.png, va-qa-b/offline-nav-knowledge.png, va-qa-b/offline-callreports-refresh.png
- **Recommendation:**
  - Build one `InlineError` component: a plain sentence, a Retry button, and a collapsible "Details" section with the raw message. Place it directly under the control or region that failed, with `role="alert"`. Use one `Toast` pattern for background failures.
  - Never show an empty state when the request failed. Keep the last good data and add a note: "Couldn't refresh · Retry · Updated 16:42".
  - Map known errors to plain copy, e.g. "Can't reach the calling service. Check your connection and retry." Keep IDs and SDK text under Details.
  - Add a global offline banner driven by `online`/`offline` events, and block client navigation while offline ("You're offline. Showing cached data.").
  - When a refresh fails, keep the room's short link unchanged.

### F-UX-020 — Embed Handbook code snippets display corrupted markup (Copy is correct)
- **Severity:** medium · **Confidence:** verified
- **Source findings:** QA-B-08
- **Pages:** /api-keys/embed
- **Evidence:**
  - The `textContent` of all 4 `<pre>` blocks starts `<"vv-attr">class="vv-tag">div "vv-attr">id=…`. Their innerHTML contains nested `<span <span class="&lt;span">`, which means the highlighter re-tokenises its own output (verified).
  - Everything after `https:` in the URL sits in a comment span and renders in grey italic.
  - The verifier stubbed the clipboard and confirmed that COPY writes the clean snippet (`<div id="vaani-voice"></div><script src="…/embed/v1/vaanivoice.js" defer>`). Only the display is broken, but anyone who reads or retypes the snippet gets broken HTML.
  - The live-preview column is 182 px wide and clips its card titles.
  - Explore-settings reported the same defect independently. The verifier downgraded it from high because Copy works.
- **Screenshots:** va-verify-qa-b/embed-snippet.png, va-qa-b/embed-snippet.png, va-explore-settings/c9_embed_snippet.png
- **Recommendation:**
  - Escape the source once and tokenize it in a single pass with Shiki or Prism at build time. Render and copy from the same raw string.
  - Add a test that asserts each `<pre>`'s `textContent` equals its Copy payload.
  - Stack the live preview under the snippet, or give it at least 360 px.

---


### F-UX-021 — Billing: spend is invisible, billing is split three ways, amounts aren't validated, and plan cards contradict themselves
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** UX-AUDIT-08, EXPLORE-DATA-22, EXPLORE-SETTINGS-10, QA-B-28
- **Pages:** /billing, /settings (Meetings Billing tab), global wallet banner
- **Evidence:**
  - **Missing spend data (verified):** /billing shows only a ₹0.00 balance, "Transactions 0", UPI autopay, manual top-up and "No transactions yet". It has no per-minute rate, usage, cost per call, invoices or GST, while Analytics reports 121 calls and 158 minutes.
  - **Contradictory copy (verified):** under Manual top-up it says "For automatic mandate-based recharge, use Pricing." The Auto-debit card sits directly above, "Pricing" is plain text, and there is no in-app Pricing page.
  - **No amount validation (verified):**
    - Pay with UPI stays enabled for 0, −50, 5 and 9,999,999. The input has `min=1` and no max, and no inline error appears.
    - Explore-data saw 0 silently turned into 1 and 999,999,999 accepted.
  - **Competing buttons and controls:**
    - Four filled blue buttons compete in one view: the banner's Top up, Enable UPI Auto-Debit, the selected ₹500 chip and Pay with UPI (verified).
    - The ₹100/₹500/₹1000 chips have no `aria-pressed`, and "Pay with UPI" doesn't state the amount.
    - Both amount inputs are labelled only by placeholder ("Top-up ₹", "Auto top-up ₹").
    - The autopay status appears twice: an INACTIVE pill and "Status: INACTIVE".
  - **Meetings Billing tab:** meeting plans live in a Settings tab that has no URL of its own.
    - Its 4 plan cards are about 132 px wide in a 576 px column. Prices wrap ("₹499/ / mo"), descriptions are truncated, and all plan text is 11–12 px mono.
    - The Pay-as-you-go card reads "Free / Unlimited included / then ₹2.40/min" next to "30 free min / month".
    - The 6-month usage chart draws no bar for SEP (1 min).
  - The banner's CTAs go to `/settings#wallet` (F-UX-002), and the banner also appears on /billing.
  - The verifier could not reproduce "Auto top-up amount ₹0.00 while loading" (see the appendix). EXPLORE-SETTINGS-10 rated the split high; the UX-AUDIT-08 verifier rated the billing issues medium.
- **Screenshots:** va-verify-ux-audit/13_billing.png, va-verify-ux-audit/14_billing_9999999.png, va-ux-audit/crop_billing_ctas.png, va-explore-data/r2_billing_topup_validation.png, va-explore-settings/c3_meetings_billing.png, va-explore-settings/settings_meetings_billing_bottom.png, va-qa-b/billing-topup-invalid.png
- **Recommendation:**
  - Make /billing the only money hub, with four tabs:
    - Wallet: balance ("≈ N min left at ₹x/min"), top-up and autopay
    - Plans: voice minutes and meeting minutes
    - Usage: by day and by product, with cost per call linked to Call Reports
    - Invoices: with GST details
  - Remove Meetings Billing from Settings and redirect its links.
  - Keep one primary action per card. In Top-up, "Pay ₹500 via UPI" is the only filled button; autopay becomes a secondary card with an outlined action.
  - Use labelled ₹ currency inputs with the minimum and maximum shown. Validate on blur with inline errors and never coerce values silently. Give chips a selected state and `aria-pressed`.
  - Delete the "use Pricing" line and fix the Pay-as-you-go copy to "30 free min/month, then ₹2.40/min".
  - Show plans as a full-width comparison, at least 240 px per plan. Give the usage chart axes and value labels.

### F-UX-022 — The Assistant can act on the account without an approval step: one click on a suggestion chip sends "…and activate it"
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** QA-A-05, EXPLORE-CORE-16, UX-AUDIT-29, QA-A-16
- **Pages:** /assistant
- **Evidence:**
  - All 4 chips call the same function as Send (`onClick: () => er(text)`). `er()` immediately POSTs `{message, history}` to `/api/assistant/chat`. The first chip reads "Build a sales call flow and activate it".
    - The bundle contains no approve or confirm code, and the panel says "The plan and each action appear here live as I work."
    - Verified from React props; no chip was clicked.
  - The empty state says it can "build & activate call flows … manage leads, place a call". Nothing shows an approval mode, cost, recipients or which flow would be activated.
  - The "Voice" button connects a voice session to the "vaani" agent on click. There is no microphone explainer and no confirmation.
  - History lives only in `localStorage["vaani_assistant_chat"]`. It is lost on another device or a teammate's machine, and there is no history list. The composer textarea has no label.
  - When a send fails (simulated):
    - The composer is already cleared.
    - The error is 12 px `#7A8397` (≈3.5:1), not `role=alert`, with no Retry, and it is saved into the history.
    - The user's own message bubble is black on `#2F5FE0` (3.83:1).
  - It is unverified whether the server activates a flow without a confirmation turn. The verifier says to raise this to high if it does.
- **Screenshots:** va-explore-core/assistant.png, va-ux-audit/51_assistant.png, va-verify-qa-a/assistant_initial.png, va-qa-a/assistant_send_250ms.png, va-qa-a/assistant_send_failed.png
- **Recommendation:**
  - Make chips insert their text into the composer, so the user can edit it and then press Send. Rename the first chip "Draft a sales call flow".
  - Pause any plan step that activates a flow, places a call, spends money or bulk-edits in "Plan & Actions", with "Approve & run" and "Edit" buttons. Show the flow name, recipients and estimated cost.
  - Add an org setting, "Assistant can: suggest only / act with approval / act". This mirrors the Auto / Confirm / Confirm + 2FA model already in Personal Agent settings.
  - Store chats server-side per user, with a history list.
  - When a send fails, keep the text in the composer or put a Retry on the failed bubble, and don't save the error into history.
  - Label the composer, and use white text on the blue bubble.

### F-UX-023 — Rep Console marks the rep available on page load, shows raw SDK errors with no retry, and exposes internal IDs
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** EXPLORE-CORE-21, UX-AUDIT-24, UX-AUDIT-14
- **Pages:** /rep-console
- **Evidence:**
  - Just opening the page fires `GET /api/rep-softphone/token`, `POST /api/profile/presence` and a LiveKit WebSocket. There is no "Go available" step and no mic check.
  - Under simulated failure:
    - It shows "Could not connect — could not establish signal connection: Websocket got closed during a (re)connection attempt:" with no Retry. The UX-AUDIT-14 verifier confirmed this.
    - The status card reads "Offline" and "Room: rep-<UUID>".
    - Mute and End call are disabled with no reason given.
  - Meanwhile the rail still shows the green "SYS: ONLINE" dot (F-UX-018).
  - The page says calls land here only when Call channel is Browser or Auto, yet it neither shows nor links the current channel. Call channel itself says those modes don't work yet (F-UX-015).
  - The back link reads "← Dashboard", the tab title is the same as on every other page, and the page can't be reached on phones.
- **Screenshots:** va-verify-ux-audit/24_rep_console.png, va-ux-audit/47_rep_console.png, va-explore-core/rep_console.png
- **Recommendation:**
  - Add an explicit Available / Away toggle with a mic test. Send presence only when the rep turns it on, and clear it when the tab closes.
  - Replace the raw error with plain copy and a Retry ("Can't connect to the call service. Retry"). Keep the raw text under Details.
  - Show "Call channel: Phone (PSTN) · Change" with a link, plus a warning when calls can't reach this console.
  - Move room IDs under Details, and explain disabled controls ("Available during a call"). Set the tab title to "Rep console · Available".

### F-UX-024 — Flow Builder writes the whole flow on open and after small edits, while the header says "Up to date"
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-MANUAL-10
- **Pages:** /flow-builder
- **Evidence:**
  - `PUT /api/flows/{id}` fires about 6 s after each load with no interaction. The verifier saw 1 per load across 3 loads, not the 2 reported. The payload is the whole flow, about 48 KB (name, description, flow_config, is_public).
  - Another PUT followed a node nudge plus a click. Another came about 2 s after a palette node was added.
  - The header keeps showing "Up to date" next to a separate Save button, which contradicts it. A keyboard user who can't see node focus can save accidental arrow-key moves into a live call flow.
  - The verifier saw no PUT on unload. It notes this may be designed draft autosave, since an ACTIVATE step exists, and rated the finding medium.
  - The Flow Builder section covers this in depth (F-FLOW-001, F-FLOW-002, F-FLOW-003).
- **Screenshots:** va-a11y-manual/41-flow-loaded.png, va-a11y-manual/43-flow-node-moved.png, va-verify-a11y-manual/40-flow-loaded.png, va-verify-a11y-manual/50-flow-palette-add.png
- **Recommendation:**
  - Never write on load. Normalise the flow in memory and save only after the user changes something.
  - Choose one save model:
    - Explicit save: hold changes locally, show "Unsaved changes", and warn before leaving.
    - Autosave into a draft: remove Save and show "Saving…", "Saved 16:42" or "Couldn't save · Retry" in a polite live region. The live flow changes only through Activate.
  - Version every save and offer one-click restore.

### F-UX-025 — Forms accept invalid input with the primary action enabled, and many fields have no programmatic label
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** UX-AUDIT-15, EXPLORE-SETTINGS-17, RESPONSIVE-B-19
- **Pages:** /dashboard, /settings/calling-number, /billing, /leads (New lead), /meeting-agent, /personal-agents, /webhooks, /settings/change-email, /settings (Profile), /login
- **Evidence:**
  - The primary action stays enabled on invalid input. Only client-side behaviour was checked; nothing was submitted.

    | Form | Input tried | Result |
    |---|---|---|
    | Cockpit Test Call | "abc", "12345" | Enabled (re-observed by the UX-AUDIT-04 verifier) |
    | Calling number | "abc" | "Send code" enabled |
    | Billing top-up | 0, −50, 9,999,999 | "Pay with UPI" enabled (verified) |
    | New lead | phone "abc" | Accepted as valid; email is checked only by the browser's native bubble on submit |
    | New webhook | URL "not-a-url" | `checkValidity()` false, but "Create webhook" enabled with no message |
    | Change email | "not-an-email" | Invalid, but "Send confirmation links" enabled |
    | Profile | phone "abc" | Accepted as valid (`type=tel`, no pattern) |
    | Meeting Agent, Personal Agents | empty title or goal | Create Room and START TASK enabled |

  - **Missing semantics:**
    - The Cockpit inputs, Profile's Full Name and Phone, the New lead fields and the Assistant composer have visible labels that are not linked with `for`/`id`.
    - The New lead and New webhook containers have no `role="dialog"` or `aria-modal`, and the webhook's close × has no accessible name.
    - Pressing Esc discards typed New-lead data without confirmation.
  - **Mobile and autofill:**
    - Every input checked uses 14 px text, and iOS zooms in on focus below 16 px.
    - The login email field has no `autocomplete`, and the password field has `autocomplete="off"`.
    - Phone fields have no `inputmode="tel"`.
- **Screenshots:** va-ux-audit/11_cockpit_tel_12345.png, va-ux-audit/18_calling_number_valid_typed.png, va-ux-audit/36_new_lead_invalid_typed.png, va-explore-settings/c11_webhook_invalid.png, va-explore-settings/c17_profile_dirty.png, va-qa-b/settings-change-email-fake.png, va-verify-ux-audit/14_billing_9999999.png
- **Recommendation:**
  - Build one form kit.
    - A `<Field>` renders a `<label for>`, helper text and an inline error, wired with `aria-describedby` and `aria-invalid`.
    - Validate on blur and on submit, and move focus to the first error.
  - Share validators:
    - Indian mobile/E.164 with a +91 default and the message "Enter a 10-digit mobile, e.g. 98765 43210"
    - `https://` URLs
    - email
    - currency ranges
  - Pick one rule for the whole app: either disable the primary action and show why, or keep it enabled and show errors on click.
  - Use one dialog primitive: focus trap, `aria-modal`, a labelled close button, and a confirmation before discarding a dirty form.
  - Use 16 px input text at ≤767 px. Add `autocomplete="email"`, `"current-password"`, `"name"` and `"tel"`, and `inputmode="tel"` on phone fields.

### F-UX-026 — Test Call accepts any text and looks disabled even when enabled; nothing explains CONNECT vs Test Call; an idle graphic takes centre stage
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** EXPLORE-CORE-13, DESIGN-RESEARCH-07
- **Pages:** /dashboard
- **Evidence:**
  - Test Call is disabled only while the tel field is empty. "abc" and "12345" both enable it, which the UX-AUDIT-04 verifier re-observed. The only hint is the placeholder "+91...".
  - When enabled it is `#0E9488` on a 20% teal tint (2.95:1), hard to tell from its disabled state, whose label is ≈1.6:1.
  - Its label wraps to "Test / Call" in an 87×58 button next to a 38 px input, at every width up to 1920.
  - There are two call buttons and nothing explains the difference:
    - CONNECT: filled blue, black text at 3.83:1, no title.
    - Test Call: teal.
    - Neither says which uses the browser mic and which places a PSTN call, what it costs, or that the wallet is at ₹0.
  - A decorative "STANDBY" ring about 310–320 px across dominates the centre column, while the controls are small. The phone field has no visible label.
- **Screenshots:** va-explore-core/cockpit_phone_filled.png, va-explore-core/crop_cockpit_controls.png, va-ux-audit/11_cockpit_tel_12345.png, va-ux-audit/13_cockpit_connect_hover.png, va-visual-audit/dashboard_connect_zoom.png, scout_dashboard.png
- **Recommendation:**
  - Replace the two buttons with two described options: "Talk in browser (uses your microphone)" and "Call a phone number · ≈₹x/min". Show inline blockers on each from the shared call pre-flight (F-UX-013).
  - Label the phone field. Validate E.164 as the user types and show the error under the field.
  - Give both options one primary style, with `white-space: nowrap` and a min-width. Make enabled and disabled states differ by at least 3:1, and show the reason when disabled.
  - Shrink the orb (e.g. `clamp(120px, 16vw, 240px)`) and give the space to the pre-call panel and the transcript.

---


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

---


### F-UX-033 — Knowledge lists storage keys with no indexing status, gives Embed and Delete equal weight, and repeats Upload as "CSV Data"
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-19, UX-AUDIT-23, QA-B-26, VISUAL-AUDIT-14
- **Pages:** /knowledge, /settings (Profile › WhatsApp brochure)
- **Evidence:**
  - File names are storage keys with 13-digit epoch prefixes ("1788515896795-pasted-text-1788515896518.txt", "1789987752864-…pdf").
  - Every row has an "Embed" button (teal outline) and a "Delete" button (grey) of the same size. Nothing shows whether a file is embedded, how many chunks it has, or whether embedding failed.
  - The "CSV Data" mode shows the same native "Choose file / No file chosen" input and "Upload & Embed" button as "Upload Files", with no CSV guidance.
    - The four mode buttons are not ARIA tabs.
    - The same unstyled native file input appears for the WhatsApp brochure in Settings.
  - Two of the three KPI cards hold static copy ("SUPPORTED DOCS …", "AI INTEGRATION Embeddings → RAG-powered voice agent").
  - Dates here read "21/09/2026, 16:19:12", while other pages use "21 Sept, 22:44". The app uses four date formats in total (see F-VIS-024).
- **Screenshots:** va-explore-data/r2_knowledge_top.png, va-explore-data/r2_knowledge_tab_csv.png, va-ux-audit/48_knowledge.png, va-verify-ux-audit/22_knowledge.png, va-qa-b/knowledge-1.png, va-visual-audit/knowledge.png
- **Recommendation:**
  - Show the original file name, editable, with a type icon.
  - Add a Status column: "Indexed · 42 chunks", "Processing" or "Failed · Retry". Offer "Re-index" only when it is needed, and add "Used by <flow>".
  - Move Delete into a row overflow menu, behind a confirmation.
  - Replace the native input with a styled drop zone that lists the accepted types and the size limit.
  - Merge CSV into Upload, with CSV-specific guidance or a column picker, and make the modes ARIA tabs.
  - Replace the static cards with real stats (files, chunks, last indexed), and format dates with one shared formatter.

### F-UX-034 — "Review proposals" is shown to members, then silently redirects to the live-call Cockpit
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** QA-B-09
- **Pages:** /knowledge → /knowledge/proposals → /dashboard
- **Evidence:**
  - "Review proposals" in the Knowledge header links to `/knowledge/proposals`. Clicking it, or loading the URL directly, lands on `/dashboard` (AGENT COCKPIT, with the live CONNECT and Test Call controls) with no message.
  - `/api/knowledge/proposals` returns 403 "Organization admin access required". The account's role is "member".
  - Explore-data saw the same redirect independently. `/admin` also redirects to /dashboard on the client.
- **Screenshots:** va-qa-b/knowledge-proposals-click.png, va-explore-data/r2_knowledge_proposals_click.png
- **Recommendation:**
  - Hide the entry for non-admins, or show it disabled with "Admins only · Request access".
  - For role-gated routes, render a 403 page inside the app shell that names the required role and the org admin. Don't redirect to a page with live-call controls.
  - For admins, show a count badge, e.g. "3 proposals".

### F-UX-035 — Destructive actions sit beside everyday actions with equal or greater prominence
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** UX-AUDIT-26
- **Pages:** /leads, /knowledge, /meeting-agent, /flow-builder, /settings, global rail
- **Evidence:**
  - Instances found:
    - A full-width DELETE LEAD button directly under Call Now / WA (F-UX-032).
    - Delete next to Embed, at the same size, on every Knowledge row (F-UX-033).
    - An icon-only red square, labelled only by its "Delete room" title, in the same row and at the same size as the Agent / Intel / Record toggles (F-UX-038).
    - "Reset to default" one row below "New flow" in the Flow Builder "…" menu (F-UX-005).
    - Delete Account as a regular item in the Settings list, and in the phone sub-nav strip.
    - An unlabelled sign-out icon directly above the theme toggle (F-UX-029).
  - Explore-core, explore-data and explore-settings each reported some of these.
  - Delete Account is the good counter-example: it requires the email to be typed, keeps its button disabled until it matches, and has a 7-day grace period.
- **Screenshots:** va-ux-audit/34_lead_panel_actions.png, va-ux-audit/24b_flow_more_actions.png, va-ux-audit/crop_meeting_active_room.png, va-ux-audit/48_knowledge.png, va-explore-settings/c13_delete_account.png
- **Recommendation:**
  - Use one `DangerAction` pattern:
    - Destructive actions live in overflow menus or a separate "Danger zone".
    - They always have a text label, such as "Delete room" or "End room".
    - They never sit next to the primary action.
  - Scale confirmation to risk:
    - an undo toast for reversible deletes (a lead, a knowledge file)
    - a confirmation dialog that names the object, for rooms
    - typed confirmation for flows and the account, as the Delete Account page already does
  - In menus, set danger items apart with a divider and red text.

### F-UX-036 — Analytics: the range toggle's scope is unclear, and Intents shows a raw LLM error and a stale cache
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-10, QA-B-11, UX-AUDIT-27
- **Pages:** /analytics §02–§05
- **Evidence:**
  - The 7D / 30D / 90D control sits inside the §03 Sentiment card, but it also changes §05 Intents: 7D shows "21 CALLS ANALYSED" and 30D shows "97". It does not change §04 Flow (38 calls in every range) or §02 Headline. The §02 tagline says "this past week", yet TOTAL CALLS is a lifetime count.
  - With 90D selected, Intents shows "Intent analysis unavailable — Intent clustering temporarily unavailable (LLM call failed)." The API returns `clusters: []` with that warning.
  - With 30D selected, it reads "last computed 21 Sept, 16:31, next 21 Sept, 17:01" on 26 Sept. `next_refresh_at` is 5 days in the past and no stale warning appears. Two agents saw this.
  - While loading, Intents shows "WINDOW 30D · 0 CALLS ANALYSED".
  - The range isn't kept in the URL and resets to 30D on reload.
- **Screenshots:** va-explore-data/analytics_sentiment_7d.png, va-explore-data/analytics_s1600.png, va-qa-b/analytics-s3.png, va-ux-audit/crop_analytics_intents_stale.png
- **Recommendation:**
  - Put one range picker in the page header and keep it in the URL (`?range=30d`). Label each section's scope ("Last 30 days" or "All time"). Alternatively, give each section its own labelled control.
  - Replace the raw error with plain copy and the last good result: "Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. Retry."
  - Fix the scheduler so stale windows are recomputed. When data is older than its refresh interval, show a "Stale · Recompute" chip.
  - Show skeletons instead of 0 while loading.

### F-UX-037 — Meeting Agent form: the pre-filled title creates identical meetings, an empty title is accepted, and Presentation mode mentions attaching a deck but has no way to attach one
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-25, UX-AUDIT-16, QA-A-14
- **Pages:** /meeting-agent (Create Meeting Room)
- **Evidence:**
  - Meeting Title is pre-filled with "Product Demo with Vikash", the same text as its placeholder. 3 of the 5 past meetings have exactly that name, so they can't be told apart.
  - Clearing the title, or leaving only spaces, keeps Create Room enabled. The PPT prompt trims whitespace; the title does not.
  - The Presentation mode hint says the agent can show "an attached one", but that mode has no attach or deck control. Generate PPT is a separate section at the bottom of the page and says it is "independent of meetings".
  - "Encrypted meeting" is the default, but nothing says who receives the private key or how.
  - "Conversation Flow: Active flow (from profile)" doesn't name the flow, and the list repeats duplicate names without suffixes (F-UX-005).
  - The same placeholder-as-value pattern appears elsewhere. Flow Builder's default node title "New Speak Node" already appears twice in the production flow, and the Cockpit pre-fills Customer Intel (F-UX-003).
- **Screenshots:** va-ux-audit/42_meeting_agent.png, va-ux-audit/43_meeting_presentation_mode.png, va-verify-ux-audit/20_meeting_presentation_mode.png, va-explore-core/meeting_agent_presentation_mode.png, va-qa-a/meeting_initial.png
- **Recommendation:**
  - Leave the title empty with a real placeholder, or default to a unique value such as "Meeting · 26 Sep, 16:40". Require a non-blank title and warn on duplicate names.
  - In Presentation mode, show "Attach deck (PPTX/PDF)" and "Generate from a prompt" inline, and move Generate PPT into that mode.
  - After an encrypted room is created, add a "Share the key" step with "Copy key" and "Copy invite text".
  - Name the flow in use: "Uses: <flow> · Change".

### F-UX-038 — Meeting Agent rooms: listed by ID, an 82-hour "live" room not flagged, an icon-only Delete room among the toggles, and no meeting outputs
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** UX-AUDIT-21, VISUAL-AUDIT-12
- **Pages:** /meeting-agent (Active rooms, Agent operations, Past meetings)
- **Evidence:**
  - The active room is listed by its 22-character room ID, not its title. The same room also appears under Past Meetings, by title.
  - AGENT OPERATIONS shows a room "live" for 82h 42m (agents recorded 82h 31m–82h 49m) with "STALE 0". The meeting quota shows only 60 s used this month. "Slots" and "Stale" are not explained.
  - "1 participant" and "2 joinees" appear in the same card.
  - The red square icon button is labelled only by its title, "Delete room". It sits where a stop control would, at the same size as the Agent / Intel / Record toggles, which don't show their on/off state in text.
  - Past meetings show only a URL, Copy URL and a joinee count. There is no summary, recording or action items, although the persona card promises "Meeting intelligence" and "Action item capture".
- **Screenshots:** va-ux-audit/crop_meeting_active_room.png, va-ux-audit/44_meeting_env_var_leak.png, va-explore-core/crop_ma_ops.png, va-explore-core/meeting_agent_joinees.png, va-verify-ux-audit/19_meeting_agent.png, va-visual-audit/meeting-agent_full.png
- **Recommendation:**
  - List rooms by title, creation time, host and minutes used. Move the room ID under "Details".
  - Auto-end rooms that are idle or have no agent after N minutes. Flag long-running rooms ("Live 82 h · 0 agents · End room?") and mark them stale.
  - Keep the Active and Past lists separate, with no room in both.
  - Replace the red square with a labelled "End room" in an overflow menu, behind a confirmation. Make Agent / Intel / Record a toggle group with "On"/"Off" text and `aria-pressed`.
  - Add Summary, Recording and Action items to past meetings, or remove those promises from the persona card.

### F-UX-039 — Personal Agents hides its blocking "no number" prerequisite, starts tasks with an empty goal, and its example cards look like disabled buttons
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-14, UX-AUDIT-25, QA-A-14, RESPONSIVE-A-18
- **Pages:** /personal-agents, /settings/personal-agent
- **Evidence:**
  - **Hidden prerequisites:** the page promises the agent "works persistently on its assigned number". Only `/settings/personal-agent` says "No number assigned yet. Provisioning is admin-assigned — contact your administrator". The ₹0 wallet and the unverified calling number aren't shown on the task page either.
  - **Inline panel:** "+ NEW TASK" opens an inline panel, not a modal.
    - Focus stays on the trigger button.
    - Esc doesn't close the panel, and CANCEL keeps the draft.
    - "No tasks yet…" stays visible under the open form.
  - **Task form:**
    - START TASK is enabled with an empty goal.
    - The GOAL textarea has no programmatic label. Its visual label is 10 px with 2.5 px letter-spacing, at 3.8:1.
    - The form has no fields for contacts, a number, a deadline, a schedule, or a spend or call cap.
  - **Example cards:** the three use-case cards ("Outbound follow-ups", "Multi-step errands", "Standing jobs") are plain DIVs (`cursor:auto`) on grey `#C3C5C8`, with descriptions at 2.20:1. They look like disabled buttons and do nothing when clicked.
  - **Copy:**
    - "hand a goalinstead of a script" is missing a space next to a JSX `<span>`.
    - "Tasks survive restarts — state lives in the task row" is implementation detail.
- **Screenshots:** va-explore-core/personal_agents.png, va-explore-core/personal_agents_new_task.png, va-explore-core/settings_personal_agent.png, va-ux-audit/crop_personal_agents_cards.png, va-qa-a/pa_new_task_open.png
- **Recommendation:**
  - Add a prerequisites strip above the task list: "Number: not assigned · Request from admin", "Contact: WhatsApp ✓", "Wallet: ₹0 · Top up". While any blocker remains, disable START TASK and show the reason.
  - Open New task as a dialog.
    - Move focus to Goal. Esc or Cancel asks "Discard draft?".
    - Label the fields and require a goal.
    - Add optional contacts, a deadline, and spend and call caps.
  - Turn the cards into "Start from template" buttons that pre-fill the goal, and use the standard white card surface.
  - Fix "goal instead" with `{' '}`. Rewrite "state lives in the task row" as "Tasks keep running if the app restarts".

### F-UX-040 — The Personal Agent capability list (Homework Analysis, Stock Research, Stock Trade) blurs the B2B voice positioning
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-15, UX-AUDIT-25
- **Pages:** /personal-agents (New task › Capability hint), /settings/personal-agent (Capability autonomy)
- **Evidence:**
  - The capability hint has 14 options. They mix business items (Appointment / Scheduling, Knowledge Base Lookup, Document Draft, Video Meeting) with consumer ones ("Homework Analysis", "Stock Research").
  - Settings lists "Stock Trade (live) — LOCKED … coming soon. Pinned at Confirm + 2FA".
  - The page's own examples are sales and operations tasks ("chase these five overdue invoices"). The product is positioned as phone voice agents for Indian SMB teams.
  - A strength to keep: the Auto / Confirm / Confirm + 2FA setting per capability is a good guardrail pattern, and F-UX-022 reuses it.
- **Screenshots:** va-explore-core/personal_agents_new_task.png, va-explore-core/settings_personal_agent.png, va-ux-audit/46_personal_agents_new_task.png
- **Recommendation:**
  - Decide who the audience is. For the B2B product, put the consumer and trading capabilities behind a feature flag, and don't advertise "coming soon" trading in a sales tool.
  - Group the remaining capabilities by job (Sales follow-up, Scheduling, Research, Documents, Meetings), each with a one-line description.

---


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

---

## 3B. Findings — Visual design, consistency & design system

**Scope.** This section merges 66 source findings from 13 agent reports into 37 findings: 3 high, 23 medium and 11 low. None of the owned findings was refuted. Where the adversarial verifier changed a severity or corrected a detail, the finding says so, and the appendix lists every correction.

The pages were measured at 1440x900 in the light theme unless stated. Contrast ratios are WCAG 2.x values computed from computed styles, or from pixels where alpha was involved.

**Covered in other sections (cross-referenced here, not repeated):**
- Primary-button text contrast (black on #2F5FE0, 3.83:1): VISUAL-AUDIT-03, DESIGN-SYSTEM-01, A11Y-AUTO-03.
- The muted text token #7A8397: A11Y-AUTO-02, EXPLORE-DATA-14, VISUAL-AUDIT-06.
- The missing focus-ring token: DESIGN-SYSTEM-12.
- Sidebar IA and rail clipping: VISUAL-AUDIT-05, RESPONSIVE-A-06.
- Flow node-title contrast: FLOW-CANVAS-06.
- Public-site brand fragmentation: PUBLIC-SITE-06.

**What to keep.**
- The neutral ramp (#111725 / #3E475A on #F4F6FA / #EEF1F7 / white, with #E1E6EF borders).
- Lucide as the single icon library.
- The 32 light/dark CSS variable pairs.
- The dark theme.
- The existing React `<Button>`, which has variants and a focus-visible ring.
- The calm sans treatment on Call Reports and Assistant, which is the closest thing to a target baseline.

---

### F-VIS-001 — No single visual language: five co-existing dialects across app, login and marketing
- **Severity:** high (the verifier kept VISUAL-AUDIT-01 at high; it rated the overlapping UX-AUDIT-12 medium as "cosmetic") · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-01, UX-AUDIT-12, EXPLORE-CORE-17, EXPLORE-DATA-06, DESIGN-RESEARCH-01
- **Pages:** all authenticated pages; `/`, `/login`
- **Evidence:**
  - **Dominant family by visible characters in `<main>` (verifier re-count):**
    - JetBrains Mono leads on Dashboard (226), Leads (943), Billing (358), Knowledge (1,427) and Meeting Agent (1,560 of 1,628).
    - The system `ui-sans-serif` leads on Assistant (480) and Personal Agents (1,075).
    - Hanken Grotesk leads on Call Reports (14,759), the only app page in the brand sans.
    - Analytics mixes Mono 1,265, Instrument Serif italic 409 and Sora 250.
    - Marketing `/` is `html.dark`, Hanken 6,527, with violet #7C6BF5 CTAs.
    - `/login` is light (#F4F6FA), mostly Mono (176), with a blue Sign In.
  - **The five dialects:**
    1. "Terminal/HUD": mono 9–12px uppercase with 0.2–4px tracking, grid backgrounds and glows.
    2. "Editorial": Analytics, with § numerals, serif-italic kickers and 27px/800 H2s.
    3. "Violet product": Meeting Agent, all mono, hard-coded #8B5CF6.
    4. "Plain SaaS": Assistant and Call Reports.
    5. Dark marketing.
  - **Sibling settings pages differ.** Call channel is JetBrains Mono for both title and body; the adjacent Calling number page is Sora sans with a stepper.
  - **Filled primaries use four hues.** Save and NEW LEAD are blue, ACTIVATE is green, Create Room is rgb(139,92,246), and Import CSV / Test Call use a teal tint.
- **Screenshots:** audit/screenshots/va-visual-audit/assistant.png, audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-visual-audit/analytics.png, audit/screenshots/va-visual-audit/meeting-agent.png, audit/screenshots/va-visual-audit/call-reports.png, audit/screenshots/va-verify-ux-audit/25_call_channel.png, audit/screenshots/va-verify-ux-audit/26_calling_number.png
- **Recommendation:**
  - Adopt one system and migrate page by page, starting from the Call Reports and Assistant treatment.
  - **Type:**
    - Hanken Grotesk for all UI and body text.
    - JetBrains Mono only for tabular numerals (`font-variant-numeric: tabular-nums`), IDs, timers, API keys and code.
    - Sora only as an optional display face on marketing. Remove Instrument Serif from the app.
  - **Colour:** one primary hue in both themes (F-VIS-004).
  - **Headers:** one `PageHeader` (F-VIS-005).
  - **Order of work:**
    1. Tokens (colour, type, radius and elevation).
    2. Primitives (Button, Input, Badge, Card, EmptyState).
    3. Page conversion, in order of traffic: Dashboard, Leads, Analytics, Meeting Agent, Settings.
  - **Guard against regressions:** add a Playwright visual-regression snapshot per page in both themes.

### F-VIS-002 — Typography has no scale: 16 rendered sizes, 30 trackings, 84 text styles, 36% of text under 12px
- **Severity:** high · **Confidence:** partially-verified (the verifier confirmed the loaded families: Sora 600/700, Hanken 500 only, JetBrains Mono 100–800)
- **Source findings:** DESIGN-SYSTEM-05, A11Y-AUTO-17, DESIGN-RESEARCH-05
- **Pages:** all app pages; worst on /analytics, /leads and /dashboard
- **Evidence:**
  - **Families:** 5 rendered (JetBrains Mono, Hanken, Sora, Instrument Serif, system sans) and 12 registered, with 139 `@font-face` rules.
  - **Scale sprawl:**
    - 16 rendered sizes (8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 27.2, 30, 30.4 and 32px).
    - 52 distinct font-size values in the compiled CSS, including 7, 10.5, 12.5 and 13.5px.
    - 32 line-heights and 30 letter-spacings, from −0.8 to +4px.
    - 84 distinct type styles in all.
  - **Tiny text:**
    - 36% of 1,812 text nodes are below 12px, and 7.6% are 8–9px.
    - Analytics: 139 of 242 nodes are under 12px (57 at 9px, 5 at 8px).
    - Leads: 166 of 240 are under 12px (46 at 9px, 24 at 8px).
    - Much of this is uppercase mono tracked 1.8–4px.
  - **Units:** sizes are arbitrary px utilities (`text-[9px]`, `text-[10px]`), so they ignore the user's browser font-size setting (inferred from the class names).
  - **Label overload:**
    - Dashboard has 7 field labels in 9–10px uppercase mono, each in its own bordered box.
    - Leads uses uppercase mono for the title, the KPIs, the shortcut strip and about 15 filter chips.
- **Screenshots:** audit/screenshots/va-a11y-auto/analytics.png, audit/screenshots/va-a11y-auto/leads.png, audit/screenshots/scout_dashboard.png, audit/screenshots/va-visual-audit/crops/analytics_full_0.png
- **Recommendation:**
  - **Define type tokens in the Tailwind v4 `@theme`, in rem:**
    - Sizes 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30, with fixed line-heights 16 / 18 / 20 / 24 / 26 / 28 / 32 / 38.
    - Weights 400, 500 and 600.
    - Tracking: tight −0.01em, normal 0, caps +0.06em.
  - **Floor:** 12px minimum. Allow 11px only for 600-weight all-caps badges.
  - **Labels:** sentence-case 12–13/500 in text-secondary, placed above plain inputs (no per-field box). Use at most one eyebrow per section.
  - **Enforcement:**
    - Apply the existing `.type-floor` class on the app root as a stop-gap (F-VIS-036).
    - Add a lint rule rejecting `text-[Npx]` arbitrary values.
  - **Fonts:**
    - Load Hanken 400–700.
    - Delete unused registrations: Inter as `--font-matter`, Rajdhani, Geist, Geist Mono and DM Sans. Keep Syne only for the wordmark, and the Devanagari faces only where Hindi renders.
  - **Muted colour:** fix it together with this change (see the accessibility section, A11Y-AUTO-02).

### F-VIS-003 — Dark-first styling leaks into the light theme: grey cards at 2.2:1, 1.48:1 node titles, invisible borders, a dark minimap
- **Severity:** high · **Confidence:** partially-verified (the verifier re-measured the node-title ratios; two agents measured the Personal Agents cards)
- **Source findings:** DESIGN-SYSTEM-09, A11Y-AUTO-22, VISUAL-AUDIT-13 (grey-card sub-point)
- **Pages:** /personal-agents, /flow-builder, /analytics (the pattern is global)
- **Evidence:**
  - **Personal Agents example cards:**
    - They use `border-white/[0.06] bg-black/20`, which renders as grey #C3C5C8.
    - #7A8397 11px text on that grey is 2.19–2.20:1, so the cards look disabled.
    - The container border `border-white/10` is invisible in light mode.
  - **Flow Builder node titles on #EEF1F7** (Tailwind-400 hues used as text):
    - Condition #FBBF24: 1.48:1.
    - Knowledge Lookup #FB923C: 2.00:1.
    - Transfer #F472B6: 2.34:1.
    - Confirm Interest teal: 3.31:1.
  - **Other leaks:**
    - The minimap is a dark #1A192B block (×42 backgrounds). Its `rgba(0,0,0,.38)` mask reads as a solid grey slab in light mode.
    - Analytics uses the dark-theme cyan `rgba(56,198,224,.1)` ×24.
    - `#fff @6–10%` borders and `#000 @10–20%` fills appear throughout.
  - **Light vs dark failure rates** (share of measured text failing AA):

    | Page | Light | Dark |
    |---|---|---|
    | Dashboard | 25/35 | 7/36 |
    | Pages overall | 31–78% | 7–19% |
- **Screenshots:** audit/screenshots/va-design-system/personal-agents.png, audit/screenshots/va-design-system/dark-personal.png, audit/screenshots/va-verify-visual-audit/flow-builder_nodes_zoom.png, audit/screenshots/va-design-system/dark-flow-builder.png, audit/screenshots/va-visual-audit/flow-builder_minimap_zoom.png, audit/screenshots/va-a11y-auto/personal-agents.png
- **Recommendation:**
  - Treat light mode as first-class. Every colour comes from a semantic token with both light and dark values.
  - **Lint rule:** ban `white/*`, `black/*` and raw palette utilities (`amber-400`, `bg-[#…]`) in app code.
  - **Fixes:**
    - Personal Agents cards: `bg-surface border border-border` (white, #E1E6EF).
    - Node titles: text-primary ink, with the category hue on the icon tile or a left accent bar (details in FLOW-CANVAS-06).
    - Minimap: mask `rgba(0,0,0,.08)` in light mode, with node colours taken from tokens.
  - **Guard:** add visual-regression snapshots of Flow Builder, Personal Agents and Analytics in both themes.

### F-VIS-004 — The brand primary changes hue by theme and by feature; accent colours sprawl without meaning
- **Severity:** medium (the verifier lowered VISUAL-AUDIT-04 from high; DESIGN-SYSTEM-03 and DESIGN-RESEARCH-02 had rated it high) · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-04, DESIGN-SYSTEM-03, DESIGN-RESEARCH-02
- **Pages:** global; /meeting-agent, /leads, /analytics, /flow-builder, marketing `/`
- **Evidence:**
  - **The primary changes hue.** The CONNECT background is #2F5FE0 in light and #7C6BF5 after the dark toggle (verifier). `--peacock` is teal #0E9488 in light and cyan #38C6E0 in dark. Marketing uses a #7C6BF5 → #38C6E0 gradient.
  - **Meeting Agent hard-codes its own violet.**
    - #8B5CF6 appears in 13 classes (`bg-[#8b5cf6]`, `hover:bg-[#7c3aed]`, `text-[#a78bfa]`, `ring-[#8b5cf6]/20`) for Create Room, the segmented control and Generate PPT.
    - White text on it is 4.23:1.
  - **Component classes hard-code the dark violet** `rgba(124,107,245,…)`: the `.bento-card` hover, the `.link-saffron` underline (a violet underline under blue text in light mode), `.section-numeral` and the dashboard radial gradient.
  - **Accents carry no meaning.**
    - Import CSV is teal #0E9488 next to the blue New Lead.
    - The Analytics KPIs alternate blue/teal/blue/teal (121, 24, 1m 18s, 158).
    - ACTIVATE is green #178A55 with white text and a 12px radius; Save is blue with black text and an 8px radius.
    - The wallet warning banner uses the brand blue, not a warning hue.
- **Screenshots:** audit/screenshots/va-visual-audit/meeting-agent.png, audit/screenshots/va-visual-audit/dark_meeting-agent.png, audit/screenshots/va-design-system/dark-dashboard.png, audit/screenshots/va-design-system/home.png, audit/screenshots/scout_leads.png, audit/screenshots/scout_flow-builder.png
- **Recommendation:**
  - **Pick one brand hue** (open question: blue or violet) and generate a 50–900 ramp.
    - Light mode uses the 600 step with `--primary-foreground: #fff`. Examples: blue #2F5FE0 with white is 5.48:1; violet #6D5AE6 with white is 4.93:1.
    - Dark mode uses the 400–500 step of the same hue.
  - **Semantic tokens:** `--primary`, `--primary-foreground`, `--accent`, `--success` #127A4B, `--warning` #9A6B00, `--danger` #D0463A, and `--info` equal to primary.
  - **Remove per-feature colours:** replace Meeting Agent's #8B5CF6 and the `rgba(124,107,245)` literals with tokens.
  - **Usage rules:**
    - KPI numerals use text-primary; colour goes on deltas only.
    - One filled primary per region: Activate is primary, Save is secondary.
    - The wallet banner uses the warning tone.
  - The verifier notes that the Call Reports green/red KPIs are meaningful (positive/negative); keep that pattern.

### F-VIS-005 — No shared page header or page template: 13+ H1 treatments, 6+ Settings templates, mismatched nav names
- **Severity:** medium (the verifier lowered VISUAL-AUDIT-02 from high because it shares a root cause with F-VIS-001 and blocks no task; EXPLORE-SETTINGS-09 had rated it high) · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-02, DESIGN-SYSTEM-06, EXPLORE-SETTINGS-09, EXPLORE-CORE-26
- **Pages:** all app pages; all /settings/* pages, /api-keys, /api-keys/embed, /webhooks
- **Evidence:**
  - **H1s (verifier-measured):**

    | Page | Size/weight | Family / tracking / case |
    |---|---|---|
    | Analytics | 15/700 | Sora, +2.7px, uppercase |
    | Leads | 20 | +4px, uppercase |
    | Agent Cockpit, Billing, Agent Knowledge, Settings | 18/700 | +0.9px, literal uppercase |
    | Personal Agents | 30/700 | −0.75px |
    | Meeting Agent | 20/600 | JetBrains Mono |
    | Assistant, Call Reports | 20/700 | −0.5px |
    | Rep Console | 24/500 | Mono |
    | Flow Builder | 18/700 | +0.45px, with a mono uppercase subtitle |

  - **Settings sub-pages use at least 6 templates:**

    | Page | H1 | Content column (x / width) |
    |---|---|---|
    | Profile | Sora 18 uppercase | 575 / 576 |
    | Organization | Mono 24 | 500 / 512 |
    | Call channel | Mono 24 | 436 / 640 |
    | Calling number | Sora 20 with icon tile and pill buttons | 420 / 670 |
    | Security | Sora 30 | 391 / 720 |
    | Activity | Sora 36 on grid paper | 207 / 1,088 |
    | API Keys | Sora 24 | 260 / 992 |
    | Embed | Sora 70.4 "magazine" | — |
    | Integrations | system sans 24 | — |

    Buttons alternate between pills and 6–8px rectangles.
  - **Container widths vary:**
    - Full-bleed: Dashboard, Leads, Call Reports, Analytics, Meeting Agent.
    - About 1,150px centred: Billing, Knowledge.
    - 640px: Rep Console.
    - 576px inside a 1,140px pane: Settings Profile.
  - **Nav titles do not match H1s:** "Agent View" leads to "AGENT COCKPIT", "Meet Agent" to "Meeting Agent — Vikash", and "Knowledge" to "AGENT KNOWLEDGE".
  - **/settings/personal-agent** has both "← BACK TO SETTINGS" and "← Settings", and no rail item is active.
- **Screenshots:** audit/screenshots/va-explore-settings/c5_call_channel.png, audit/screenshots/va-explore-settings/c6_calling_number.png, audit/screenshots/va-explore-settings/c7_security.png, audit/screenshots/va-explore-settings/c7_activity.png, audit/screenshots/va-explore-settings/api_keys.png, audit/screenshots/va-explore-settings/c9_embed_snippet.png, audit/screenshots/va-visual-audit/settings_organization.png, audit/screenshots/va-explore-core/settings_personal_agent.png
- **Recommendation:**
  - **`PageHeader` component:**
    - 64px bar.
    - Title in Hanken 24/32, weight 600, sentence case, no tracking.
    - Optional 14px text-secondary description.
    - Right-aligned actions, at most one primary.
    - Optional tab row.
    - Remove literal uppercase strings.
  - **`SettingsPage` template:**
    - A persistent grouped sub-nav plus a content column with a fixed left inset and max-width 720px.
    - At most one breadcrumb.
    - Settings stays active in the rail for /settings/*, /api-keys and /webhooks.
  - **Naming:** one nav config drives the rail label, mobile label, H1 and `<title>`.
  - **Containers:** see F-VIS-034.

### F-VIS-006 — Three parallel button systems and 80 button styles; "Refresh" has 6 designs and 3 behaviours
- **Severity:** medium (DESIGN-SYSTEM-04 rated it high; lowered in line with the verifier's rating of the same Refresh and button evidence in UX-AUDIT-12) · **Confidence:** partially-verified
- **Source findings:** DESIGN-SYSTEM-04, QA-A-15, UX-AUDIT-12 (Refresh sub-point)
- **Pages:** all app pages
- **Evidence:**
  - **Three systems:**
    - The React `<Button>` (CVA-style, with a focus-visible ring) is used on 2 of 103 buttons, on Call Reports only.
    - The `.btn-saffron`, `.btn-outline` and `.btn-danger` classes appear on Billing, Knowledge, Settings and Dashboard.
    - Everything else is bespoke: Leads uses the shared component on 0 of 49 buttons, Knowledge on 0 of 13.
  - **Distinct button signatures per page:** Flow Builder 36, Leads 12, Knowledge 11, Meeting 11, Analytics 9, Dashboard 9, Call Reports 9, Settings 8, Assistant 7, Billing 7, Personal Agents 5, Rep Console 5.
  - **Primary buttons:**
    - Heights: 24, 28, 32, 33, 37, 39, 40, 43 and 44px.
    - Case: "NEW LEAD" is Sora bold uppercase and tracked; "Export CSV" is sentence case; "CONNECT" is literal uppercase in the system font.
  - **"Refresh" has 6 designs** (the verifier confirmed the variants):

    | Page | Design |
    |---|---|
    | Analytics | Sora 10/700 uppercase, 29px |
    | Leads | Mono 10 uppercase, 29px |
    | Call Reports | Hanken 13, 32px |
    | Billing, Knowledge | `.btn-outline` 14px, 38px |
    | Meeting Agent | Mono 12, borderless, 24px |
    | Personal Agents | Mono 11 uppercase with an invisible `white/10` border |

  - **"Refresh" behaves 3 ways:**
    - The Cockpit icon (14x14) spins.
    - Meeting Agent's Refresh neither spins nor disables, and refetches 5 endpoints.
    - Personal Agents' REFRESH doesn't spin.
    - None of them reports success or failure.
- **Screenshots:** audit/screenshots/va-design-system/zoom-primary-buttons-callreports.png, audit/screenshots/va-design-system/billing.png, audit/screenshots/va-design-system/leads.png
- **Recommendation:**
  - **One primitive.** Make the existing React Button the only one.
    - Variants: primary, secondary, ghost, destructive, link.
    - Sizes: sm 32, md 36, lg 40 (44 under `pointer: coarse`).
    - `white-space: nowrap`, sentence case, and padding on the 4px grid (8/16px instead of the current 9/18).
  - **IconButton** at 28/32/36px with a required `aria-label`.
  - **Migration:**
    - A codemod to replace `.btn-*` and the bespoke strings.
    - An ESLint rule rejecting raw `<button className=…>` outside `components/ui/`.
  - **`RefreshButton`:**
    - RefreshCw icon.
    - `aria-busy`, spinning and disabled while busy.
    - An "Updated hh:mm" stamp on success.
    - An inline error with Retry on failure.

### F-VIS-007 — Agent Cockpit at 1024–1279px: CONNECT is drawn over the Transcript Feed and the orb is clipped
- **Severity:** medium (the verifier lowered it from high: CONNECT stays on top and clickable, so it is a visual collision, not a blocker) · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-05 (the same defect is also recorded as F-RWD-002 in the responsive section, via EXPLORE-CORE-22)
- **Pages:** /dashboard
- **Evidence:**
  - **Overlap positions:**

    | Viewport | CONNECT (y) | Transcript panel | Result |
    |---|---|---|---|
    | 1024x768 | 514–553 | "TRANSCRIPT FEED" header row at 514–554 | Drawn over the header. The phone input and Test Call straddle the panel's top border, and the page header cuts off the top of the orb. |
    | 1100x700 | 480–519 | header at 458 | Fully inside the panel; `elementFromPoint` confirms CONNECT is on top. |
    | 1100x800 | 530–569 | card starts at 545 | Still straddles the border. |
    | 1440x900 | — | — | No overlap. |

    At 1100x800 the original report said there was no overlap; the verifier found that wrong.
  - **Cause:** the centre stack (312px orb, STANDBY, toggle, input, CONNECT) has a fixed height, and the transcript takes a fixed share of the column.
- **Screenshots:** audit/screenshots/va-verify-responsive-a/dashboard_1024x768.png, audit/screenshots/va-verify-responsive-a/dashboard_1100x700.png, audit/screenshots/va-verify-responsive-a/dashboard_1100x800.png
- **Recommendation:**
  - Make the centre column a flex column:
    - orb `height: clamp(160px, 30vh, 312px)`;
    - controls in normal flow;
    - transcript `flex: 1; min-height: 0` with its own scroll.
  - Never position controls absolutely over sibling panels.
  - Alternative: from 1024px, put the transcript in a right column and move Customer Intel into a tab.
  - Add viewport tests at 1024x768, 1100x700, 1100x800 and 1280x720.

---


### F-VIS-008 — The base font silently falls back to the OS system font
- **Severity:** medium · **Confidence:** partially-verified (the verifier confirmed that `body` computes to `ui-sans-serif` and that Hanken loads only at weight 500)
- **Source findings:** DESIGN-SYSTEM-07
- **Pages:** all app pages
- **Evidence:**
  - **Mechanism (inferred):**
    - `body` computes to `ui-sans-serif, system-ui, sans-serif, …`.
    - The next/font variables (`--font-hanken` etc.) are declared on `<body>` classes.
    - Tailwind's `--default-font-family` and `--font-sans` reference those variables at `:root`/`html`, where they are undefined.
  - **Affected elements:** everything without an explicit `font-sans` utility, including everything styled by `.btn-saffron`, `.btn-outline` and `.input-vani`. These render in Segoe UI on Windows and SF on macOS. Examples: CONNECT, Pay with UPI, Save Changes, the Settings / Call Reports / Leads search inputs, sidebar controls and the Assistant body copy.
  - **System-font text nodes per page:** Personal Agents 15, Call Reports 12, Assistant 10, Knowledge 7, Flow Builder 6, Billing 6.
  - Assistant and Personal Agents are dominated by the system font (480 and 1,075 characters).
- **Screenshots:** —
- **Recommendation:**
  - Move the next/font `variable` classes from `<body>` to `<html>` in the root `layout.tsx` (`<html className={`${hanken.variable} ${jetbrains.variable}`}>`), or declare the variables on `:root`.
  - Load Hanken 400–700.
  - Add a unit or e2e assertion that `getComputedStyle(document.body).fontFamily` starts with "Hanken Grotesk".

### F-VIS-009 — Leads list: 44% of the viewport is chrome, a ~730px dead column, and the Status badge sits under the Interest header
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-09, EXPLORE-DATA-08, RESPONSIVE-B-09
- **Pages:** /leads
- **Evidence:**
  - **The first data row starts at y≈400 of 900.** The stack above it:

    | Element | Height (px) |
    |---|---|
    | Wallet banner | 42 |
    | Header | 80 |
    | KPI strip | 70 |
    | Shortcuts bar | 36 |
    | Search | 52 |
    | Two chip rows | 70 |
    | Table header | 36 |

    With 65px rows, only about 7.5 rows are visible.
  - **Dead column:** the lead cell ends at x≈430–440 and STATUS starts at x≈1,160, leaving about 730px of empty space.
  - **The INTEREST column is empty for all 24 rows.**
  - **The Status badge is misaligned.** At 1280 the STATUS header spans x 1,006–1,102 and INTEREST x 1,118–1,198, but the NEW badge renders at x 1,163–1,198. The Status column therefore looks empty at every desktop and tablet width.
  - **Row styling:**
    - Rows are transparent, so the graph-paper grid's vertical lines cut through every row.
    - Source chips use letter glyphs as icons ("F FACEBOOK", "IG INSTAGRAM", "G GOOGLE", "{} API").
    - The list is built from divs, with no table or row semantics.
- **Screenshots:** audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-explore-data/r2_leads_top.png, audit/screenshots/va-ux-audit/crop_leads_deadspace.png, audit/screenshots/va-responsive-b/leads_1280.png, audit/screenshots/va-responsive-b/leads_1024_detail.png
- **Recommendation:**
  - **Table structure:**
    - Use a real `<table>`, or a CSS grid with one shared `grid-template-columns` for the header and the rows, so cells can't drift.
    - Columns: Name, Phone, Status, Source, Last call (date and outcome), Interest, Owner, actions.
    - Hide any column that is empty for the whole org.
  - **Rows:**
    - Solid `bg-surface` with a hover tint.
    - 48–52px tall by default, with a 40px compact density option.
  - **Toolbar:**
    - Collapse the filters into one row: search plus Status, Source, Language and Outcome dropdowns.
    - Move the shortcut legend into a "?" popover.
  - **Icons and testing:**
    - Use brand SVGs or plain text for sources.
    - Add a visual-regression test for header-to-cell alignment.

### F-VIS-010 — Analytics decoration inverts the hierarchy: 15px H1 vs 27px/800 H2s, § markers, serif italics, Identity first
- **Severity:** medium · **Confidence:** partially-verified (the verifier measured the 15px/700 H1 and the Instrument Serif usage)
- **Source findings:** VISUAL-AUDIT-07
- **Pages:** /analytics
- **Evidence:**
  - **Inverted hierarchy:** the H1 "ANALYTICS" is 15px/700, tracked +2.7px. The eight section H2s (Identity, Headline, Sentiment, Flow, Intents, Phone, Recent, Recordings) are 27.2px/800.
  - **Decoration on every section:**
    - Each H2 carries a mono tracked "§ 0N" marker, an Instrument Serif italic tagline ("— who is on the line") and a hairline rule.
    - Cards add `.hud-bracket` corner brackets and diagonal hatch over a graph-paper grid.
  - **Identity comes first:** §01 is Identity (operator, plan, role), so the KPIs start below the fold at y≈570. The page is a 3,898px inner scroller.
  - **Empty states:** "not allocated yet" is 30px serif italic grey at 3.42:1. The hour-of-day chart draws 24 empty cyan cells instead of an empty state.
- **Screenshots:** audit/screenshots/va-visual-audit/analytics.png, audit/screenshots/va-visual-audit/analytics_full.png, audit/screenshots/va-visual-audit/crops/analytics_full_0.png, audit/screenshots/va-verify-visual-audit/analytics.png
- **Recommendation:**
  - **Reorder:** KPI row, then Sentiment trend, then Flow funnel, then Intents, then Recent calls.
  - **Move Identity and DID** to Settings › Calling number.
  - **Remove the decoration:** § markers, serif taglines, corner brackets and hatch.
  - **Headings:** the H1 comes from the shared `PageHeader` (24/600); section titles are 16–18/600.
  - **Empty charts:** use the shared `EmptyState` (F-VIS-023).
  - If the editorial look is wanted, keep it for an exported "report" view only.

### F-VIS-011 — Chart and delta colours encode direction instead of meaning
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-26, VISUAL-AUDIT-08
- **Pages:** /analytics (§02 Headline, §03 Sentiment, §07 Recent)
- **Evidence:**
  - **Week-over-week chips are coloured by sign.** "negative +13pp" is green rgb(23,138,85), and "neutral −25pp" is red rgb(208,70,58). A rise in negative sentiment therefore reads as good.
  - **The sentiment stacked area uses mustard #B5820E for neutral.** Neutral is the dominant band, so the whole chart reads as a warning.
  - **Durations in the Recent table are link-blue #2F5FE0** but are not links.
- **Screenshots:** audit/screenshots/va-visual-audit/crops/analytics_full_0.png
- **Recommendation:**
  - **Colour by desirability.** Add a `deltaTone(metric, delta)` helper:
    - negative sentiment up → danger;
    - positive sentiment up → success;
    - neutral → a grey tone.
  - **Don't rely on colour alone (WCAG 1.4.1).** Add a ▲/▼ icon and the explicit sign.
  - **Sentiment palette:** neutral grey for neutral (marks ≥3:1 against the surface), green for positive, red for negative.
  - **Reserve primary colour for interactive text.** Show durations in text-primary with `tabular-nums`.

### F-VIS-012 — The sentiment chart distorts (4.8px labels on phones, 1.46x stretched text on desktop) and is hard to read
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-B-15, EXPLORE-DATA-25
- **Pages:** /analytics §03
- **Evidence:**
  - **Distortion.** The SVG has `viewBox 800×220` at a fixed 240px height:
    - at 390px wide it renders 325×240, with tick labels 4.8px tall;
    - at 1440 it renders 1,166×240, with 13.6px labels stretched 1.46x horizontally.
  - **Readability:**
    - Tick values are uneven (0/3/5/8/10 and 0/12/24/35/47).
    - There are only 3 date labels.
    - There is no legend; the WoW chips double as one.
    - In the 7D view the hover tooltip overlaps the range toggle.
- **Screenshots:** audit/screenshots/va-responsive-b/analytics_390_s1.png, audit/screenshots/va-responsive-b/analytics_768_s1.png, audit/screenshots/va-explore-data/analytics_sentiment_7d_chart.png, audit/screenshots/va-explore-data/analytics_sentiment_hover.png
- **Recommendation:**
  - **Sizing:**
    - Measure the container with a ResizeObserver and draw at 1:1 (viewBox equal to pixel size, no `preserveAspectRatio="none"`).
    - Render axis text in HTML/CSS or outside the scaled group, at 12px or more.
  - **Axes:**
    - Use "nice" ticks (`scale.nice()` / `ticks(5)`).
    - Show 5–7 date ticks on desktop and fewer on narrow widths.
  - **Legend and tooltip:**
    - Add a legend with the total per sentiment.
    - Anchor the tooltip to the data point with collision detection.

### F-VIS-013 — Labels are truncated or clipped with no way to read the full value
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-15, VISUAL-AUDIT-07 (intent-label sub-point), RESPONSIVE-A-16, EXPLORE-SETTINGS-21 (palette overlap: FLOW-CANVAS-23)
- **Pages:** /analytics §05, /flow-builder, /dashboard, /meeting-agent (390px), /api-keys/embed
- **Evidence:**
  - **Analytics intents:**
    - Labels sit in a box of about 115px with ellipsis ("Appointment ...", "Airport Passe...", "Real Estate In..."), but need 182–236px.
    - There is no `title` or tooltip.
    - The bar beside each label gets about 900px.
  - **Flow Builder palette labels are cut at every width.**
    - 64px slots at 1920: "Knowledge Query" (101px) shows as "Knowle…"; CRM Lookup, Book Meeting, WhatsApp, Human Handoff and Verify Customer are also cut.
    - 48px slots at 768.
  - **Dashboard:**
    - The 150px flow `<select>` cuts names mid-word with no ellipsis, from 768 to 1920px.
    - "Test Call" wraps to 2 lines at every width.
  - **Meeting URLs** are ellipsized to 78px at 390px.
  - **Embed live preview:** the column is 182px wide (x=1,104). It clips its card titles ("widget", "voicebot bubble" lose their top line), and body text wraps at about 3 words per line. The floating panel alone is 340×480.
- **Screenshots:** audit/screenshots/va-ux-audit/crop_flow_palette_truncation.png, audit/screenshots/va-responsive-a/flow-builder_1920.png, audit/screenshots/va-explore-settings/c9_embed_snippet.png, audit/screenshots/va-visual-audit/analytics_full.png
- **Recommendation:**
  - **Rule:** any text that truncates must expose its full value (a `title`, or the shared Tooltip from F-VIS-014).
  - **Intents:** a 240px label column (or a 2-line wrap), with the count and percentage outside the bar.
  - **Palette:** a single-column list with icon and full label, or 2 columns with tiles of at least 150px and a 2-line clamp.
  - **Flow select:** `min-width: 220px; text-overflow: ellipsis`, plus a `title`.
  - **Buttons:** `white-space: nowrap`.
  - **Embed preview:** stack it below the snippet under 1280px, or give it a column of at least 360px.

### F-VIS-014 — Tooltips are about 70px wide, wrap one word per line and get clipped by their cards
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** EXPLORE-DATA-12
- **Pages:** /analytics
- **Evidence:**
  - The header REFRESH tooltip wraps to one word per line, about 16 lines tall.
  - The TOTAL CALLS info tooltip is cut off inside its card ("Lifetime count of every call placed to…").
  - The "Hide example calls" tooltip covers the Intents REFRESH button.
- **Screenshots:** audit/screenshots/va-explore-data/analytics_refresh_during.png, audit/screenshots/va-explore-data/analytics_info_tooltip.png
- **Recommendation:** build one `Tooltip` primitive (Floating UI or equivalent) and reuse it for the rail labels (F-VIS-015). It should:
  - render in a portal;
  - be 160–280px wide (`min-width` / `max-width`);
  - flip and shift on collision;
  - open after a 300ms delay on hover and on focus;
  - be wired with `aria-describedby`.

### F-VIS-015 — Sidebar hover labels are clipped by the nav's overflow and cause stray scrollbars in the rail
- **Severity:** medium · **Confidence:** multi-agent (the navigation section records the same defect as RESPONSIVE-A-06 and VISUAL-AUDIT-05)
- **Source findings:** QA-A-09
- **Pages:** global chrome (72px rail), all app pages
- **Evidence:**
  - **Clipped labels.** Each nav item renders its label tooltip to the right (Flow Builder at x=64, Knowledge at x 64–154), but the `<nav>` has `overflow:auto` and a right edge at x=63. The labels are never visible: a hit-test at a label returns `ASIDE`.
  - **Stray scrollbars.** The hidden tooltips widen the nav (`scrollWidth` 175 vs `clientWidth` 44). Windows therefore draws a horizontal scrollbar with ◀ ▶ arrows inside the 72px rail, at y≈640 at 1440x900.
- **Screenshots:** audit/screenshots/va-qa-a/sidebar_hover_flowbuilder.png, audit/screenshots/va-responsive-a/sidebar_hover_tooltip_1440.png
- **Recommendation:**
  - Render rail labels through the portal Tooltip (F-VIS-014), on hover and on focus.
  - Set `overflow-x: hidden` on the nav, and use `scrollbar-width: none` with top and bottom fade masks for vertical overflow.
  - Add `aria-label` to each link and `aria-current="page"` to the active one.

### F-VIS-016 — No radius, elevation, button-size or card scale; nested box-in-box fields on the Dashboard
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-16, DESIGN-SYSTEM-15
- **Pages:** all pages; /dashboard (Customer Intel)
- **Evidence:**
  - **Radii:** 12 values in use:

    | Radius | Count |
    |---|---|
    | 8px | 336 |
    | full | 327 |
    | 6px | 195 |
    | 4px | 74 |
    | 100% | 54 |
    | 12px | 43 |
    | 16px | 36 |
    | 3px | 25 |
    | 9px | 12 |
    | 20px | 4 |
    | 10px | 1 |

    - Card containers use four different radii: Dashboard 8, Knowledge 12, glass-card 16, bento-card 20.
    - Meeting Agent's segmented control uses 0.
  - **Elevation:**
    - The only theme shadow is `drop-shadow-lg`. The rest are ad-hoc glows (`0 0 10px rgba(47,99,224,.34)`, `rgba(34,197,94,.5)`) and two flow-panel shadows.
    - z-index values: 0, 1, 2, 4, 5, 10, 20, 30, 50 and 9999.
  - **Buttons:** 18 distinct heights, from 22 to 58px.
  - **Cards:** at least 5 treatments: white with a hairline, a #EEF1F7 fill, a 50% translucent fill, a dashed border, and hatch with brackets.
  - **Nested boxes:** Customer Intel puts a panel, then a field card, then an input with its own border and background. That is 3 concentric outlines per field, across 6 fields.
- **Screenshots:** audit/screenshots/va-visual-audit/dashboard.png, audit/screenshots/va-visual-audit/dashboard_connect_zoom.png
- **Recommendation:**
  - **Radius tokens:** xs 4, sm 6, md 8 (controls), lg 12 (cards), xl 16 (modals), and full (chips only).
  - **Elevation tokens:**
    - 0: none.
    - 1: `0 1px 2px rgb(17 23 37 / .06)`.
    - 2: `0 8px 24px rgb(17 23 37 / .10)`.
    - 3 (overlay): `0 18px 55px rgb(0 0 0 / .26)`.
    - Remove the glows.
  - **Named z-layers:** base 0, sticky 10, dropdown 20, overlay 30, modal 40, toast 50.
  - **One `Card`:** white, 1px #E1E6EF, 12px radius, 16/24 padding, and a shadow only when the card is clickable.
  - **Form fields:** a label above the input, with no wrapping card.

### F-VIS-017 — 20 badge styles: the same status looks different on every page
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-13
- **Pages:** /analytics, /call-reports, /leads, /billing, /flow-builder, /dashboard
- **Evidence:**
  - **"Completed" in two styles:** Analytics uses mono 9px, +1.8px tracking, uppercase, outline only. Call Reports uses Hanken 11px uppercase with a soft fill and no border, 18px tall.
  - **Other badges:**

    | Badge | Style |
    |---|---|
    | Leads source | mono 8px bold uppercase, 16px tall |
    | Leads status | mono 9px, teal/10 fill with a teal/30 border |
    | Billing "Inactive" | mono 10px outline pill |
    | Flow counters, kbd hints | mono 9px, r4 |

  - **Badge heights:** 16, 18, 20, 21, 24 and 25px.
  - **Sentiment appears three ways:** a coloured word (Dashboard "POSITIVE"), a pill (Call Reports) and a "pp" chip (Analytics).
  - Badge contrast failures are reported in the accessibility section (A11Y-AUTO-04).
- **Screenshots:** audit/screenshots/va-design-system/call-reports.png, audit/screenshots/va-design-system/leads.png, audit/screenshots/va-design-system/analytics.png
- **Recommendation:**
  - **`Badge`:** `tone={neutral|info|success|warning|danger|brand}`, `variant={soft|outline}`, heights 20/24, 12px/600, sentence case. Soft foregrounds use the -700 shades so text reaches 4.5:1 or more.
  - **`StatusBadge`:** one module that maps each domain enum (call status, lead status, sentiment) to a tone, label and icon. Share it across Leads, Call Reports, Analytics and Billing.
  - **`Kbd`:** a separate component for keyboard hints.

---


### F-VIS-018 — 12 input styles (21–43px tall, mono vs sans, 4 radii, 4 fills)
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-14
- **Pages:** /dashboard, /leads, /billing, /knowledge, /settings, /meeting-agent, /assistant, /call-reports
- **Evidence:**

  | Style | Metrics | Where |
  |---|---|---|
  | `.input-vani` | 43px, system font 14px, r8, white/85 | Settings, Call Reports search, Leads search |
  | Mono 12px on #EEF1F7 | 34px, r6 | Billing, Knowledge, Settings |
  | Mono 12px | 30px | Dashboard intel fields |
  | Mono 10px | 21px | Dashboard flow select |
  | Mono 10px uppercase pill selects | 25px | Leads filters |
  | Mono 14px | 42px | Meeting Agent |
  | Hanken 13px | 42px | Assistant composer |

  The `.input-vani:focus` ring is 2px at 14% alpha, so it is barely visible (the focus token is covered in the accessibility section, DESIGN-SYSTEM-12).
- **Screenshots:** audit/screenshots/va-design-system/dashboard.png, audit/screenshots/va-design-system/settings.png, audit/screenshots/va-design-system/meeting-agent.png
- **Recommendation:**
  - Build `Input`, `Select`, `Textarea` and `SearchField` primitives:
    - sizes 32, 36 and 40px;
    - sans text (mono only for code and API-key values);
    - one fill (`--surface`) and one border token;
    - focus, error, disabled and read-only states, with a 2px solid focus ring at 3:1 or better.
  - Give them `leadingIcon` and `trailingIcon` slots that pad the text automatically (this fixes F-VIS-019).
  - Use 16px text at 767px and below.

### F-VIS-019 — The Change Email "@" icon overlaps the input text
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** EXPLORE-SETTINGS-20
- **Pages:** /settings/change-email
- **Evidence:** the "@" icon spans x=565–579, but the input text starts at x=567 (padding-left 14px). The placeholder therefore renders as "@ew-address@company.com".
- **Screenshots:** audit/screenshots/va-explore-settings/c13_change_email.png, audit/screenshots/va-explore-settings/c23_change_email_input.png
- **Recommendation:**
  - Set `padding-left: 36px` when an input has a leading icon (icon at left 12px), or remove the icon, since the label already says "New email".
  - Long term, use the Input `leadingIcon` slot from F-VIS-018.

### F-VIS-020 — Raw colours bypass the token layer: 45 hex literals, 18 Tailwind hue families, 4 different error reds
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-10
- **Pages:** global CSS / all app pages
- **Evidence:**
  - **Hex literals:** 45 distinct values in the compiled utilities, for example `#8b5cf6` ×50, `#a78bfa` ×11, `#0ea5e9`, `#2dd4bf`, `#0078d4`, `#f43f5e`, `#fbbf24`, `#fb923c`.
  - **Raw palettes:** `@theme` emits 18 raw hue families (red through zinc), and they are used directly in markup.
  - **Arbitrary classes:** on Call Reports, 929 of 10,510 class tokens are arbitrary values.
  - **Four error reds:**

    | Red | Where | Contrast |
    |---|---|---|
    | Token #D0463A | — | — |
    | Tailwind red-500 #FB2C36 | Rep Console "Could not connect" | 3.27:1 |
    | `rgba(239,68,68,…)` | `.btn-danger` hover, input error ring | — |
    | #D76A60 | Settings "Delete Account" | 3.25:1 |

  - **Success glow:** `rgba(34,197,94,.5)` instead of the token #178A55.
  - **Rendered totals:** 24 text colours, 62 backgrounds and 42 border colours.
- **Screenshots:** —
- **Recommendation:**
  - Define about 12 semantic background/foreground pairs, and derive tints with `color-mix(in oklab, var(--danger) 10%, transparent)`.
  - In Tailwind v4, reset the raw palette (`@theme { --color-*: initial; … }`) and declare only the semantic colours.
  - Add a lint rule rejecting `bg-[#…]`, `text-[#…]` and `border-[#…]`.
  - Migrate the 45 literals, starting with Meeting Agent's #8B5CF6 and the four reds.

### F-VIS-021 — The `dark:` variant follows the OS setting while the app theme uses a `.dark` class (inferred risk)
- **Severity:** medium · **Confidence:** single-agent (inferred; no affected screen was observed)
- **Source findings:** DESIGN-SYSTEM-11
- **Pages:** global CSS
- **Evidence:**
  - 21 rules are compiled inside `@media (prefers-color-scheme: dark)`, which is Tailwind v4's default. Examples: `dark:bg-slate-900`, `dark:text-red-300`, `dark:border-amber-800`, `dark:hover:bg-slate-800`.
  - The in-app toggle only sets `html.dark` and `localStorage["vv:theme"]`.
  - A user with a dark OS and a light app theme (or the reverse) would get mismatched panels.
  - Not seen rendered on Settings or Leads, so the exact affected screens are unknown.
- **Screenshots:** —
- **Recommendation:**
  - Add `@custom-variant dark (&:where(.dark, .dark *));` to the Tailwind entry CSS.
  - Prefer token swaps over `dark:` utilities.
  - Add an e2e check that emulates OS dark with the app on light, and the reverse.

### F-VIS-022 — Decorative textures (grid, noise, dot grid, hatch, HUD brackets) sit behind data
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** DESIGN-SYSTEM-16
- **Pages:** /leads, /dashboard, /analytics, /settings/activity; the noise overlay is on every app page
- **Evidence:**
  - An SVG noise overlay (`.noise-overlay`, fixed, z-index 9999, opacity .02) covers every app page (also EXPLORE-CORE-27).
  - A 1px 8%-black grid (`--grid-line-color #00000014`) sits behind Dashboard, Leads and Analytics.
  - Analytics adds a dot grid, hatch fills and `.hud-bracket` corners, and Settings › Activity sits on grid paper.
  - The grid shows through the semi-transparent Leads rows (F-VIS-009).
- **Screenshots:** audit/screenshots/va-design-system/leads.png, audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-visual-audit/analytics.png
- **Recommendation:**
  - Put a solid `--surface` behind tables, forms and dense data.
  - Limit textures to marketing, hero and empty-state illustrations.
  - Remove the noise overlay from the app, or scope it to marketing. This also removes the z-index 9999 layer.

### F-VIS-023 — Empty, loading and not-found states have no shared pattern (7 empty-state styles; loaders drop the app shell)
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-17, EXPLORE-SETTINGS-22
- **Pages:** /assistant, /dashboard, /personal-agents, /billing, /analytics, /settings/organization, /api-keys, /leads, /rep-console, any 404
- **Evidence:**
  - **Seven empty-state styles:**

    | Page | Empty state |
    |---|---|
    | Assistant | Icon tile, H2 and suggestion chips |
    | Dashboard transcript | "Awaiting connection..." in mono grey at 2.4:1 |
    | Personal Agents | One sentence and a link |
    | Billing | A bordered mono box: "No transactions yet." |
    | Analytics | Tracked "NO DATA" plus a serif-italic line |
    | Settings › Organization | A dashed box with a shield icon |
    | API Keys | A plain mono line |

  - **Loaders:**
    - A sans spinner with "Loading..." on Leads.
    - A mono "Loading…" on Settings sub-pages.
    - A boxed "Requesting softphone credentials…" on Rep Console.
  - **Shell drops out:**
    - `/settings/organization` first paints a full-screen "Loading…" with no rail.
    - The 404 page has no shell and reads "STATUS: DISCONNECTED".
  - Related performance and routing issues (EXPLORE-CORE-18, QA-A-12, QA-B-23) are covered in other sections.
- **Screenshots:** audit/screenshots/va-explore-settings/c4_organization.png, audit/screenshots/va-explore-settings/c14_docs_embed_404.png, audit/screenshots/va-visual-audit/assistant.png, audit/screenshots/va-visual-audit/billing.png, audit/screenshots/va-visual-audit/settings_organization.png
- **Recommendation:**
  - **`EmptyState`:** a 24px icon, a 16/600 title, a 14px body and at most one primary action, with separate "no data" and "no match" variants.
  - **Loading:** per-region `Skeleton`s plus a `PageLoader` inside the persistent shell. The (app) route-group `layout.tsx` keeps the rail and top bar mounted.
  - **Not found:** an authenticated `not-found.tsx` inside the app layout, with plain copy and a "Go to dashboard" action.

### F-VIS-024 — Date, time and duration formats vary across and within pages
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** QA-B-20, EXPLORE-DATA-06 (formats sub-point)
- **Pages:** /analytics, /call-reports, /leads (list and drawer), /knowledge, /settings/data-export, /meeting-agent
- **Evidence:**
  - **Dates:**

    | Format | Where |
    |---|---|
    | "23 Sept, 06:13" (24h, no year) | Analytics Recent, Call Reports |
    | "28 Aug, 11:45 pm" (12h, lower case) | Lead drawer |
    | "21/09/2026, 16:19:12" | Knowledge, Data Export |
    | "11 Aug 2026" | Identity, lead drawer |
    | "23 Sept 2026" | Meeting Agent |
    | "28d ago" | Leads list |

  - **Durations for the same kind of value:** "1m 18s" / "1m 27s" (Analytics), "0:11" / "1:27" (Call Reports table), "11s" / "87s" (call detail panel), "90s" (Call Reports KPI).
  - The 1m 18s vs 90s average mismatch is a data issue (EXPLORE-DATA-17, other section).
- **Screenshots:** —
- **Recommendation:**
  - Create `lib/format.ts` with:
    - `formatDateTime`: `Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })`;
    - `formatRelative`: relative under 7 days, with the absolute value in a tooltip;
    - `formatDuration`: always "1m 18s", with `tabular-nums`.
  - Add a lint rule banning direct `toLocaleString` / `toLocaleDateString` in components.

### F-VIS-025 — Public site, login and app are three separate visual systems
- **Severity:** medium · **Confidence:** partially-verified (the verifier checked the home and login themes)
- **Source findings:** DESIGN-SYSTEM-21, UX-AUDIT-30, VISUAL-AUDIT-23 (login sub-point); related PUBLIC-SITE-06 (public-site section)
- **Pages:** `/`, `/pricing`, `/docs`, `/login`, the app
- **Evidence:**
  - **Three looks (verifier-checked):**
    - Marketing is `html.dark` with Hanken and violet #7C6BF5 CTAs.
    - `/login` is light (#F4F6FA), mostly JetBrains Mono, with a blue Sign In.
    - The app is light and blue, with mixed dialects (F-VIS-001).
  - **Login card:** four families on one card (Syne wordmark, Sora heading, JetBrains Mono subtitle and labels, system-sans buttons and inputs).
  - **Public pages differ from each other:**
    - Three headers: Home has the full nav; Pricing has a logo and "Email us"; Docs has "Back to Home" with the logo on the right.
    - Home uses 25 font sizes, including half-pixels (11.5–17.5px), and 15 radii.
    - Pricing is mono-heavy (62 of 119 text nodes).
  - **CTAs:** "Start free" is white on #7C6BF5 at 3.98:1, while the Pricing CTA is black on violet.
- **Screenshots:** audit/screenshots/va-design-system/home.png, audit/screenshots/va-design-system/pricing.png, audit/screenshots/va-design-system/docs.png, audit/screenshots/va-verify-visual-audit/login.png, audit/screenshots/va-verify-visual-audit/home.png
- **Recommendation:**
  - **Shared foundations:** one package (tokens, type, Button) consumed by both the marketing and app builds.
  - **Auth pages:** render `/login` and `/signup` in Hanken with the app's tokens and the unified primary, in one family.
  - **Marketing:** may stay dark as an expressive theme, but built from the same tokens and hue (F-VIS-004), with one marketing header and footer.

### F-VIS-026 — The marketing hero reads as a generic AI template and has polish defects
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** DESIGN-RESEARCH-12, VISUAL-AUDIT-23
- **Pages:** `/`
- **Evidence:**
  - **Template tells:** gradient headline text; a glowing orb with animated waves; an eyebrow with a status dot, a middle dot and very wide tracking; about 36 words of subtext; a four-pill trust strip inside the hero; violet CTAs unlike the app's blue.
  - **Strengths:** the H1 (Hanken 72/600, −1.8px), the 16px-radius dark cards and the product mocks are cohesive.
  - **Defects:**
    - 12px white text on #7C6BF5 chips ("English", "E-commerce") is 3.98:1.
    - The "GET STARTED" eyebrow's decorative dash sits about 360px left of its centred label.
    - Scroll-reveal sections stay invisible until intersected, leaving blank bands of about 700px and 1,100px in full-page captures and share previews.
- **Screenshots:** audit/screenshots/scout_home.png, audit/screenshots/va-visual-audit/home.png, audit/screenshots/va-visual-audit/home_full.png, audit/screenshots/va-visual-audit/home_gap1.png, audit/screenshots/va-visual-audit/home_gap2.png
- **Recommendation:**
  - **Hero content:**
    - A 2-line solid-ink headline, with the gradient on at most one word.
    - 20 words of subtext or fewer, and two CTAs.
    - A real product visual (a live transcript or the flow canvas) instead of the orb.
    - Move the trust pills to the next section, and keep eyebrow tracking at 0.1em or less.
  - **Chips:** a #6D5AE6 fill (4.93:1) or dark text.
  - **Eyebrow:** align the rule with its label.
  - **Reveal animations:** make them progressive. Content is visible by default and animates only under `@media (prefers-reduced-motion: no-preference)` once JS has loaded.

### F-VIS-027 — Call Reports: dash-filled flow-field columns and uppercase pill noise
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-24, DESIGN-RESEARCH-10 (related table-width issue: EXPLORE-DATA-04, other section)
- **Pages:** /call-reports
- **Evidence:**
  - Every flow field ("Confirm Interest", "Condition Check", "Condition…") gets its own column, so the table scrolls horizontally. Most cells are "—" at 1.75–1.81:1 (muted at 50% alpha, 381–498 instances).
  - Every row carries three uppercase pills (BROWSER, COMPLETED, NEUTRAL).
  - Summaries truncate at 2 lines in a 190px column.
- **Screenshots:** audit/screenshots/va-visual-audit/call-reports.png, audit/screenshots/va-verify-visual-audit/call-reports_table.png, audit/screenshots/va-explore-data/r2_callreports_hscroll.png
- **Recommendation:**
  - **Flow fields:** collapse them into one "Captured" chips column or an expandable row detail, with a column picker. Hide columns that are empty on the page.
  - **Status:** one Outcome cell (icon plus sentence-case text), with the channel shown as a small muted icon.
  - **Empty cells:** blank or a solid-token "—" (no alpha).
  - **Summary:** a column of at least 320px, with the full text on hover or open.
  - **Layout:** a sticky first column.

---


### F-VIS-028 — Dark theme is the more coherent theme, but the primary turns violet, some elements stay unthemed and a few pairs still fail AA
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** VISUAL-AUDIT-20, A11Y-AUTO-20
- **Pages:** all app pages in dark (`html.dark`); measured on /dashboard, /analytics, /leads, /flow-builder, /call-reports, /meeting-agent
- **Evidence:**
  - **Healthier baseline.** Surfaces are #0C0D12 / #14161D / #1A1D26, and muted #7B8196 is 5.01:1 on the background. Dark /dashboard has 7 failing text groups against 26 in light. Per page, 7–19% of measured text fails in dark against 31–78% in light (F-VIS-003).
  - **Pairs that still fail on dark /dashboard:**

    | Pair | Ratio |
    |---|---|
    | Muted #7B8196 on card #1A1D26 | 4.35:1 |
    | "Top up" #E8EAF2 on #7C6BF5 | 3.31:1 |
    | White on #7C6BF5 (marketing "Get started" / "Start free") | 3.98:1 |
    | "Enable autopay" #7C6BF5 on #1C1B34 | 4.20:1 |
    | "Save Context" #7C6BF5 on #181826 | 4.40:1 |
    | "STANDBY" #6C5ED4 (86%) on #0C0D12 | 3.86:1 |
    | Placeholders #3B404B on #111419 | 1.78:1 |

  - **The hue changes.** `--saffron` goes from blue #2F5FE0 to violet #7C6BF5, and `--peacock` from teal #0E9488 to cyan #38C6E0 (root cause in F-VIS-004).
  - **Unthemed pieces.** The Flow Builder edge label ("Not Interested") stays a white box in dark. The Analytics serif "not allocated yet" is low contrast.
  - **The defaults disagree.** The app defaults to light, while marketing `/` is `html.dark`. The theme toggle's labelling is covered in F-VIS-032.
- **Screenshots:** audit/screenshots/va-visual-audit/dark_dashboard.png, audit/screenshots/va-visual-audit/dark_analytics.png, audit/screenshots/va-visual-audit/dark_flow-builder.png, audit/screenshots/va-visual-audit/dark_meeting-agent.png, audit/screenshots/va-a11y-auto/dashboard-dark.png
- **Recommendation:**
  - Keep dark mode and use its neutral ramp as the reference when retuning light (F-VIS-003).
  - Use one primary hue in both themes (F-VIS-004). Set `--primary-foreground` per theme so every filled button reaches 4.5:1: near-black on the dark 400 step (black on #7C6BF5 is 5.28:1), or white on the 600 step (#6D5AE6, 4.93:1).
  - Raise dark `--text-muted` to about #8A90A5 (about 5.3:1 on #1A1D26, computed). Give placeholders a token of at least 4.5:1.
  - Drive React Flow edge labels, minimap and chart marks from tokens (`--surface`, `--text-primary`), not literals.
  - Add a dark-theme pass to the contrast and visual-regression suite. Offer Light / Dark / System, defaulting to System (see F-VIS-021 for the `dark:` variant).

### F-VIS-029 — Agent Cockpit: a 320px decorative ring dominates while the real controls are small
- **Severity:** low · **Confidence:** single-agent (the EXPLORE-CORE page notes describe the same composition)
- **Source findings:** VISUAL-AUDIT-21
- **Pages:** /dashboard
- **Evidence:**
  - **The ring leads the page.** An animated ring of about 320px (a 312px element with a dashed spinner) holds the centre, labelled "STANDBY" in 14px #8FA9ED on #F3F5FA (2.12:1).
  - **The controls sit small beneath it.** The Vaani/Vikash toggle is 38px tall (Vikash is #7A8397 on #F7F8FB, 3.58:1). Below it are a 38px phone input, an 87x58 Test Call and CONNECT (F-VIS-030).
  - **Customer Intel** is six boxed mono fields pre-filled with sample-style values. Where that data comes from is covered in the UX section.
  - **Transcript panel:** an empty white column with "Awaiting connection..." at 2.4:1.
  - **Telemetry strip:** "LAT: 0ms · SESSION: IDLE" in 10px mono.
  - **Motion:** the ring, STANDBY and "breathe" animations keep running under `prefers-reduced-motion` (A11Y-MANUAL-19, accessibility section).
  - **Side effects:** the fixed-height ring causes the CONNECT collision at 1024–1279px (F-VIS-007). At 1920 the centre column is about 1,150px of empty grid (F-VIS-034).
- **Screenshots:** audit/screenshots/va-visual-audit/dashboard.png, audit/screenshots/va-verify-visual-audit/standby_zoom.png, audit/screenshots/va-explore-core/crop_cockpit_controls.png
- **Recommendation:**
  - Lead with a "Start a test call" card containing:
    - flow and voice pickers;
    - a number field;
    - one primary "Call in browser" and one secondary "Call a phone", each with a one-line explanation and its cost.
  - Shrink the ring to a status indicator of about 120px with a text status (Idle / Connecting / Live 00:42) in text-primary, inside an `aria-live="polite"` region. Animate it only while a call is live, and never under reduced motion.
  - Show Customer Intel as a compact read-only summary with an "Edit" action.
  - Use the shared `EmptyState` for the transcript ("Start a call to see the live transcript here").
  - Move the telemetry into a 12px status popover.

### F-VIS-030 — Test Call and CONNECT: states are hard to tell apart and the labels are low contrast
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** QA-A-20, A11Y-MANUAL-26
- **Pages:** /dashboard
- **Evidence:**
  - **Test Call:**
    - It is JetBrains Mono 14px teal #0E9488 on a 20% teal tint. Enabled, that is 2.95:1. Disabled differs only by `opacity:.5` (1.64:1).
    - The enabled state keeps `cursor: default`.
    - The label wraps to 2 lines in an 87x58 box next to a 38px input.
    - It enables on any text: `disabled = calling || !value.trim()`. Validation is covered in the UX section (QA-A-08, EXPLORE-CORE-13).
  - **CONNECT:**
    - Black 14px system-sans text on #2F5FE0.
    - A11Y-MANUAL-26 estimated about 4.15:1. Computed-colour measurements by three other agents give 3.83:1; white would be 5.48:1.
    - The global primary-foreground fix belongs to the accessibility section (VISUAL-AUDIT-03, DESIGN-SYSTEM-01).
  - **The two call actions share nothing.** They differ in family (mono vs system sans), height and colour, and nothing says which one dials a phone.
- **Screenshots:** audit/screenshots/va-explore-core/cockpit_phone_filled.png, audit/screenshots/va-qa-a/dash_phone_123_testcall_enabled.png, audit/screenshots/va-visual-audit/dashboard_connect_zoom.png, audit/screenshots/va-verify-a11y-auto/connect-btn.png
- **Recommendation:**
  - **Test Call:** `Button variant="secondary" size="md"`: 36px, `white-space: nowrap`, sentence case "Test call", `cursor: pointer`, text-primary on white with a #CBD3E1 border.
  - **Disabled state:** a shared disabled token (a `--surface-light` fill, muted text, `cursor: not-allowed`) plus helper text giving the reason ("Enter a valid phone number"). Stay disabled until the number is valid.
  - **CONNECT:** `--primary-foreground: #fff` (5.48:1), relabelled "Call in browser" with a mic icon.
  - Put both actions in one row at the same height.

### F-VIS-031 — Icons: Lucide is the norm, but letter glyphs, emoji, a solid sort triangle and misleading ↗ icons break it
- **Severity:** low · **Confidence:** multi-agent (DESIGN-SYSTEM measured Lucide coverage; PUBLIC-SITE also noted the emoji)
- **Source findings:** VISUAL-AUDIT-22
- **Pages:** /leads, /call-reports, /settings, /meeting-agent, marketing `/`
- **Evidence:**
  - **Lucide coverage:** Leads 84/84 SVGs, Call Reports 266/266, Analytics 75/78. There are 22 rendered icon sizes (mostly 20, 16, 14, 12, 11, 10, 9 and 8px).
  - **Exceptions:**

    | Where | Exception |
    |---|---|
    | Leads source chips | Letter glyphs: "F FACEBOOK", "IG INSTAGRAM", "G GOOGLE", "{} API", "✎ MANUAL", "◎ DEMO" |
    | Call Reports | A solid blue ▼ sort triangle ("Started ▼") |
    | Settings sub-nav | ↗ external-link icons on 14 of 17 items, all of which open in the same tab |
    | Meeting Agent | An unlabelled red filled square as "stop" |
    | Marketing | Emoji on the industry tabs (🛍 🏦 🩺 🏢 🛡 🎓), flow examples (📦 ↩️ 💸) and security features (🎯 🔐 🌐) |

  - Duplicate icons in the Settings sub-nav are covered in F-VIS-032.
- **Screenshots:** audit/screenshots/va-visual-audit/leads.png, audit/screenshots/va-visual-audit/call-reports.png, audit/screenshots/va-visual-audit/settings.png, audit/screenshots/va-visual-audit/meeting-agent.png, audit/screenshots/va-visual-audit/home_full.png
- **Recommendation:**
  - **Library and sizes:** Lucide only in the app, at 16 / 20 / 24px with a 1.75px stroke (tokens `--icon-sm/md/lg`).
  - **Sort:** `ArrowUp` / `ArrowDown` / `ChevronsUpDown` inside the header button, with `aria-sort` on the `<th>`.
  - **Sources:** brand SVGs (simple-icons) for Facebook, Instagram and Google, and Lucide icons for API, Manual and Demo.
  - **Links:** use `ExternalLink` only for off-site targets.
  - **Stop:** a labelled destructive button ("End room") with a Lucide icon.
  - **Marketing:** replace emoji with duotone Lucide icons in the brand tint.

### F-VIS-032 — Sidebar and Settings sub-nav polish: stray "Collapse [" glyph, a theme toggle whose icon and label disagree, duplicate icons, no grouping
- **Severity:** low · **Confidence:** multi-agent (the same observations appear in EXPLORE-CORE-19, VISUAL-AUDIT-14 and RESPONSIVE-A-15)
- **Source findings:** EXPLORE-SETTINGS-25, VISUAL-AUDIT-20 (toggle sub-point)
- **Pages:** global rail (expanded and collapsed), /settings sub-nav
- **Evidence:**
  - **"Collapse [".** The `[` is a lone grey bracket at 60% alpha, an unexplained shortcut hint.
  - **Theme toggle:**
    - In light, the expanded rail shows a sun icon labelled "DARK": the label names the action while the icon shows the current state.
    - In dark it shows a moon with the tooltip "Light mode".
    - It is the only rail control with a custom tooltip; nav items have only a native `title`.
  - **Duplicate icons.** Calendly and Integrations share the plug icon, and Calling number and Security use near-identical shields.
  - **No grouping.** The rail is a flat list of 12 items and the Settings sub-nav a flat list of 17. Expanded, the rail and sub-nav take 464px before any content.
- **Screenshots:** audit/screenshots/va-explore-settings/c19_sidebar_expanded.png, audit/screenshots/va-explore-core/sidebar_expanded_footer.png, audit/screenshots/va-explore-core/crop_sidebar_footer.png, audit/screenshots/va-visual-audit/sidebar_expanded.png, audit/screenshots/va-visual-audit/dark_dashboard.png
- **Recommendation:**
  - **Shortcut hints:** render them with the shared `Kbd` ("Collapse sidebar [") and only under `(hover: hover) and (pointer: fine)`, or drop them.
  - **Theme control:** a "Theme: Light / Dark / System" menu with radio semantics in an account menu. If it stays a toggle, label the action and show the target icon ("Switch to dark" with a moon), with `aria-pressed`.
  - **Icons:** one distinct icon per destination (for example `CalendarClock` for Calendly, `Plug` for Integrations, `Phone` for Calling number, `ShieldCheck` for Security).
  - **Grouping:** group the rail and the sub-nav. The IA proposal is in the UX/IA section.

### F-VIS-033 — Tablet (768–1023px): the expanded sidebar pushes content to 528px instead of overlaying it
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-A-15
- **Pages:** app shell at 768–1023px (all app pages)
- **Evidence:**
  - At 768, "Expand sidebar" widens the rail to 240px and pushes `main` to 528px (left = 240), with no scrim.
  - Every page then reflows: the wallet banner wraps to 2 lines and the Billing cards compress.
  - Collapsed, the rail has no labels and 36x36 icons.
  - Labels read "Agent View" and "Meet Agent", while the H1s and the mobile bar ("Agent") use other names (F-VIS-005).
- **Screenshots:** audit/screenshots/va-responsive-a/billing_768_sidebar_expanded.png
- **Recommendation:**
  - Below 1024px, open the expanded nav as an overlay drawer: `position: fixed`, 280px wide, with a scrim, a focus trap, and closing on Esc and on route change. The content width stays the same.
  - Keep the collapsed 72px rail with the portal tooltip (F-VIS-015).
  - Drive all labels from one nav config (F-VIS-005).

### F-VIS-034 — No shared content container: widths range from 512px to full-bleed, forms stretch to 1,300px at 1920, and headers don't line up with content
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-A-17, RESPONSIVE-B-21, VISUAL-AUDIT-13 (layout and scrollbar-shift sub-points)
- **Pages:** /meeting-agent, /assistant, /dashboard, /leads, /knowledge, /settings, /personal-agents
- **Evidence:**
  - **Containers at 1440:**
    - Full-bleed: Dashboard, Leads, Call Reports, Flow Builder, Analytics and Meeting Agent.
    - About 1,150px centred: Billing, Knowledge.
    - About 1,120px, left-biased: Personal Agents (x≈191–1,311).
    - 640px: Rep Console.
    - 576px inside a 1,140px pane: Settings Profile.
    - 512px: Organization.
  - **At 1920:**

    | Page | Measurement |
    |---|---|
    | Meeting Agent | The "Meeting Title" input and Session Mode control are 1,125px wide |
    | Assistant | The composer is about 1,278px wide (x 149–1,427) |
    | Dashboard | The centre column is about 1,150px of mostly empty grid around the 312px orb |
    | Leads | Name at x 188, status and call at x≈1,800–1,885 |
    | Knowledge | Header actions at x 1,620–1,895; content ends at 1,566 |
    | Settings | Save Changes at x 1,755–1,895; the form ends at 1,390, with a 520px gap between sub-nav and form |

  - **Personal Agents:**
    - The document scrolls 42px for no reason (942 vs 900).
    - The scrollbar gutter shifts the wallet-banner buttons about 10px left compared with other pages (Top up at x=1,205 vs 1,215).
    - A missing space reads "goalinstead" (JSX whitespace; the copy is tracked as RESPONSIVE-A-18).
- **Screenshots:** audit/screenshots/va-responsive-a/meeting-agent_1920.png, audit/screenshots/va-responsive-a/assistant_1920.png, audit/screenshots/va-responsive-a/dashboard_1920.png, audit/screenshots/va-responsive-b/leads_1920.png, audit/screenshots/va-responsive-b/knowledge_1920.png, audit/screenshots/va-responsive-b/settings_1920.png, audit/screenshots/va-visual-audit/personal-agents.png
- **Recommendation:**
  - **`PageContainer`**, applied to both `PageHeader` and content, with three widths:
    - `data`: max 1,440px (tables, dashboards);
    - `form`: max 720–880px (settings, create forms);
    - `reading`: about 820px (the Assistant thread and composer).
  - Full-bleed only for the Flow Builder canvas and the live console. Left-align with a 32px gutter (24px at ≤1279, 16px at ≤767).
  - Set `html { scrollbar-gutter: stable; }` app-wide, and remove whatever adds Personal Agents' extra 42px.
  - **Settings:** move Save into a sticky footer attached to the form.
  - **Leads at wide widths:** add columns (F-VIS-009) or use a list with a detail pane.
  - **Copy:** add `{' '}` after the inline `<span>`.

### F-VIS-035 — Ad-hoc breakpoints alongside Tailwind's
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** DESIGN-SYSTEM-18
- **Pages:** global CSS
- **Evidence:**
  - The compiled CSS uses Tailwind's 40/48/64/80/96rem breakpoints (151/104/44/12 variant rules reported).
  - It also has raw media queries at 420, 640, 720, 760, 767 (max), 1079 (max) and 1080px.
  - The layout switches seen elsewhere (Dashboard at 1024 and 1280; the bottom bar at ≤767) therefore come from two systems.
- **Screenshots:** —
- **Recommendation:**
  - Define 5 named breakpoints as `@theme` tokens (`--breakpoint-sm` … `--breakpoint-2xl`) and replace raw media queries with Tailwind variants, or with `@media (width >= theme(--breakpoint-md))`.
  - Use container queries (`@container`) for panels whose width depends on their parent: Customer Intel, the Embed preview (F-VIS-013), the Flow inspector.
  - Lint against raw px media queries.

### F-VIS-036 — Dead or misleading design scaffolding: an unapplied `.type-floor`, an unused type scale and fonts, and token names that don't match their colours
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** DESIGN-SYSTEM-22, QA-A-21
- **Pages:** global CSS / tokens; visible on /dashboard (Save Context, Refresh flows)
- **Evidence:**
  - **`.type-floor`** forces `text-[7..12px]` and `text-xs` to 13px `!important`, but no element carries it.
  - **Unused type scale.** Tailwind's `text-xs`…`text-7xl` is defined, but the app uses arbitrary `text-[7px]`–`text-[13px]` (52 compiled sizes, F-VIS-002).
  - **Unused fonts.** 139 `@font-face` rules. Registered but not seen in the app: Inter (as `--font-matter`, 35 faces), Rajdhani, Geist, Geist Mono and DM Sans. Syne is used only for the wordmark, and the Devanagari faces were not seen.
  - **Names that don't match colours:**
    - `--saffron` is blue #2F5FE0 in light and violet #7C6BF5 in dark.
    - `--peacock` is teal in light and cyan in dark.
    - The tenant config declares `accent: "#FF9933"` (saffron), and a second white-label tenant exists.
    - `text-saffron`, `border-saffron` and `hover:text-saffron` render blue, as do `.btn-saffron` and `.link-saffron`.
  - **Inverted names:**
    - `--border-light` #CBD3E1 is darker than `--border-color` #E1E6EF in light.
    - `--saffron-dim` is darker in light (#1E48B8) but lighter in dark (#9A8CFF).
- **Screenshots:** —
- **Recommendation:**
  - **Rename semantically with a codemod,** keeping aliases for one release:
    - `--saffron` → `--primary`;
    - `--saffron-dim` → `--primary-strong` (the higher-contrast variant in each theme);
    - `--peacock` → `--accent`;
    - `--border-color` / `--border-light` → `--border-subtle` / `--border-strong`.
  - **Tenants:** document the tenant-to-token mapping. Tenant config sets `--primary` etc. under a `[data-tenant]` scope.
  - **`.type-floor`:** apply it on the app root as a stop-gap (F-VIS-002), then delete it once no arbitrary sizes remain.
  - **Cleanup:** delete unused next/font registrations, and point the Tailwind type scale at the new tokens.

### F-VIS-037 — Flow pickers list duplicate flow names
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** QA-B-30
- **Pages:** /leads (lead-drawer FLOW select and bulk-call bar), /dashboard (flow selector)
- **Evidence:**
  - The lead drawer's FLOW select and the bulk-call bar list the same names twice (a real-estate "(v2)" flow, the airport support flow and the demo flow each appear twice).
  - "Generated: … (v2)" is truncated.
  - The Dashboard selector tells flows apart only by a 6-character hash suffix, and its 150px width cuts names mid-word (F-VIS-013).
- **Screenshots:** audit/screenshots/va-qa-b/leads-drawer.png, audit/screenshots/va-qa-b/leads-kbd-a.png
- **Recommendation:**
  - Use one shared `FlowSelect` combobox on the Dashboard, the lead drawer and the bulk bar:
    - each option shows name, version, "edited 3d ago" and an Active badge;
    - versions are grouped under their flow;
    - it is searchable, at least 260px wide, and shows the full name on hover.
  - Enforce unique names at creation and duplication (for example "Copy of X (2)").


---


### Appendix 3B-A — Refuted / not reproduced

**Refuted: none.** None of the 66 owned findings was refuted or marked could-not-verify. The verifier re-checked five and confirmed all five; its corrections are applied above:

| Source | Verifier result | Applied in |
|---|---|---|
| VISUAL-AUDIT-01 | Confirmed; stays high. Correction: `/login` is light (#F4F6FA), mostly JetBrains Mono (176 chars), with a blue Sign In. The report had called it dark, Hanken and violet. | F-VIS-001, F-VIS-025 |
| UX-AUDIT-12 | Confirmed; lowered from high to medium ("real but cosmetic"). | F-VIS-001 (stays high on VISUAL-AUDIT-01), F-VIS-006 |
| VISUAL-AUDIT-02 | Confirmed; lowered to medium, since it shares a root cause with VISUAL-AUDIT-01 and blocks no task. | F-VIS-005 |
| VISUAL-AUDIT-04 | Confirmed; lowered to medium. The Call Reports green/red KPIs are meaningful, so "arbitrary" is overstated there. No glow on ACTIVATE at rest. Node titles re-measured on #EEF1F7 at 1.48 / 2.00 / 2.34 / 3.31:1 (the report had 1.67 / 2.26 / 2.65:1). | F-VIS-003, F-VIS-004 |
| RESPONSIVE-A-05 | Confirmed; lowered to medium, because CONNECT stays on top and clickable. The overlap is wider than reported: it also occurs at 1100x800, where the report claimed none. | F-VIS-007 |

**Consolidator corrections:**
- **A11Y-MANUAL-26** estimated CONNECT at about 4.15:1. #000 on #2F5FE0 computes to 3.83:1, which matches VISUAL-AUDIT, DESIGN-SYSTEM and EXPLORE-CORE, so 3.83:1 is used (F-VIS-030).
- **Font counts:** the verifier's re-count (for example Dashboard mono 226, Call Reports Hanken 14,759) replaces VISUAL-AUDIT §2.2 (230, 14,818) in F-VIS-001.
- **Intent-label width:** VISUAL-AUDIT-07 gave about 110px and EXPLORE-DATA-15 measured about 115px; the latter is used (F-VIS-013).

---

## 3C. Findings — Flow Designer

**Scope and test conditions.** Route `/flow-builder` at 1440x900, with spot checks at 1280x720 and 1024x768, dark mode and emulated reduced motion. It also covers the flow selectors on `/dashboard` (Agent Cockpit) and `/meeting-agent` where they affect flow identity. Sources: the two Flow Designer explorers (FLOW-CANVAS, FLOW-CONFIG), the adversarial verifier, and the flow-builder findings from UX-AUDIT, VISUAL-AUDIT and DESIGN-RESEARCH. All live testing ran behind a network guard that blocks writes: no edit was ever persisted. "Autosave" means the app *attempted* `PUT /api/flows/{id}` and the guard aborted it. A UI reaction to a blocked save is labelled "observed under simulated network failure". Nobody clicked Save, ACTIVATE, Private, Delete flow, Reset to default, Import JSON or AI-draft Generate.

**Flow labels used below** (instead of customer business names):
- **Flow A**: the account's active flow and the builder's default. 26 nodes, 27 links, id `f9b04a18…`.
- **Flow B**: an airport passenger support flow. 35 nodes, 47 links.
- **Flow C**: a tele-calling script. 9 nodes, 11 links.

### How the Flow Builder works today

**Purpose.** The Flow Builder is where a customer writes the call script the Vaani voice agent follows. It is a React Flow (xyflow) canvas, and the graph compiles into a natural-language system instruction, which you can see with "Preview AI script". Two other pages also select flows:
- The Agent Cockpit's `FLOW:` select, which also drives Test Call.
- The Meeting Agent's "Conversation flow" select.

**Layout (1440x900).**
- **Global wallet banner** (42 px) above everything.
- **Header row 1:**
  - The title "Flow Builder / VOICE JOURNEY WORKSPACE".
  - The flow switcher, which opens an "ALL FLOWS" modal: 16 flows, search, columns NAME / CATEGORY / LAST EDITED / OPEN, and pagination.
  - A status chip reading "Up to date".
- **Header row 2** (`role=toolbar`):
  - AI draft and Settings.
  - 9 icon-only buttons: Undo, Redo, Copy, Paste, Validate (shield), Preview AI script (eye), Full-screen, Shortcuts, and More actions. More actions contains Export JSON, Import JSON, New flow and Reset to default.
  - A "Save and ship" group: Private, trash (Delete flow), Save (blue) and ACTIVATE (green, with a glow).
- **Left palette** (288 px): "Add steps", a "+ 10" pill, search, START HERE (8 tiles), RECENTLY USED, CONVERSATION (5), ACTIONS (2) and KNOWLEDGE & CRM (3). You add items by clicking; dragging doesn't work.
- **Canvas card:**
  - A hint: "Drag nodes, connect handles, double-click to edit, press ? for shortcuts".
  - Chips for node and link counts.
  - A 1043x651 pane (52% of the viewport) at a default zoom of 0.712.
  - Overlays: a "FLOW VALIDATED" badge (top-left), zoom/fit/lock controls (bottom-left) and a 202x152 minimap (bottom-right).
- **Right inspector** (320 px): opens on a single click or a double-click. It shrinks the canvas to 711 px, which is 36% of the viewport.

**Nodes and config panels.**
- Every card node is 240 px wide with a `#EEF1F7` fill, a 13 px title coloured by type and an 11 px mono body. Type is shown only by title colour and a 12 px icon.
- Every panel contains a read-only ID, a Label field, the type-specific fields, helper text, a read-only Position and a full-width red "Delete Node" button.
- There is no Done or Apply. Changes apply live and autosave.

| Palette name → canvas default | Type-specific panel fields | Outputs |
|---|---|---|
| Start / End (fixed pills) | Label only; cannot be deleted | 1 out / none |
| Speak → "New Speak Node" | Message (hint: `{{lead_name}}`, `{{company_name}}`) | 1 |
| Question → "New Question" | Question text | YES ↓ bottom, NO → right |
| Branch → "Condition Check" | Free-text condition | TRUE ↓, FALSE → |
| Knowledge Query → "Knowledge Lookup" | Knowledge file (optional), search-query hint | 1 |
| CRM Lookup → "Live Lookup" | Connector, lookup-by field | 1 (no found/not-found) |
| Book Meeting → "Schedule" | Prompt, duration, meeting type, free-text slots; email / WhatsApp / Calendar switches | 1 |
| WhatsApp → "Send WhatsApp" | Template, attachment | 1 |
| Human Handoff → "Transfer Call" | Number (E.164) | 1 |
| Verify Customer | Question, source, field, match mode, attempts (1–5) | VERIFIED ↓, FAILED → |
| FAQ | Linked knowledge file, Q&A entries | 1 |

**Lifecycle.**
- **Autosave.** Every edit sends `PUT /api/flows/{id}` about 3–4 s later. Opening a flow sends one too, with no edit. The flow opened by default is the account's `active_flow_id` (per `/api/auth/me`), which is also the Cockpit's selected flow. So edits land on the script live calls use.
- **Save (Ctrl+S)** is always enabled. The UI doesn't explain what it adds on top of autosave.
- **ACTIVATE** ("Activate this flow for all your calls") is enabled even when validation finds errors. It looks the same whether or not the open flow is already active, and it is disabled only on an unsaved new flow.
- **Private** ("only visible to you") renders like a static pill.
- **Versions.** There is no version history. "Versions" are separate flows named "(v2)", "(v3)" or "(v6)". The API does store `version_no` and `parent_flow_id`, but the UI never shows that lineage.
- **Validation** runs only on demand (the shield button) and shows a floating panel with Jump buttons. The canvas badge always reads "FLOW VALIDATED".

**What the canvas communicates.**
- For flows of 9 nodes or fewer, the Start (green pill) → steps → End Call (red pill) path reads well at fit view.
- Real flows of 26–35 nodes become either a narrow, unreadable column or a dense web:
  - Titles render at 9.3 px at default zoom and 3.8 px at fit.
  - Branch edges are the same blue as the main path.
  - 25 of 27 edges animate.
  - Only one edge carries an outcome label.
- The canvas never shows:
  - whether a flow is inbound or outbound (no trigger config);
  - how a call ended (no outcome taxonomy on End);
  - any grouping (no groups or frames);
  - which flow is live.

**Strengths to keep:**
- Every toolbar button has an accessible name that includes its shortcut.
- A polite live region announces actions ("New Speak Node added.", "Connection added.").
- Validate → Jump zooms to the node, selects it and opens its panel.
- Palette search matches synonyms ("transfer" finds Human Handoff) and has a clear empty state.
- Preview AI script shows how the graph compiles into the agent's instructions.
- Undo restores deleted nodes.
- Dragging a connection gives clear target feedback.
- Viewport changes (zoom, pan, fit) don't trigger saves.
- Start and End are protected from deletion.

---

### F-FLOW-001 — Edits autosave directly into the live flow; there is no draft/publish separation, and Backspace deletes connected nodes without confirmation
- **Severity:** critical · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-01, FLOW-CANVAS-01 (per-edit autosave part)
- **Pages:** /flow-builder, /dashboard (Cockpit `FLOW:` select)
- **Evidence:**
  - `/api/auth/me` returns `active_flow_id = f9b04a18…`. The builder auto-opens that flow, and the Cockpit `FLOW:` select shows it as selected ("… · f9b04a"). No draft copy exists anywhere.
  - Every edit sent `PUT /api/flows/f9b04a18…` about 3.0–4.0 s later: adding a node, typing in a field, clearing a label, clearing the flow name, dragging, nudging, and even the Validate panel's Jump, which only selects a node.
  - The PUT body includes `flow_config` with `system_instruction`. So every autosave rewrites the active agent's prompt.
  - Backspace on a selected node with 2 connections took nodes 26→25 and edges 27→25. There was no `confirm()`, no in-app dialog and no toast, and a PUT followed 3.0 s later.
  - The effect on live calls was not tested because writes were blocked. It is inferred, but nothing in the product could prevent it.
- **Screenshots:** `audit/screenshots/va-verify-flow-config/02_after_backspace.png`, `audit/screenshots/va-flow-config/59_backspace_delete.png`, `audit/screenshots/va-flow-config/08_after_autosave.png`, `audit/screenshots/va-flow-config/54_cockpit_flow_selector.png`
- **Recommendation:**
  - Add draft and published revisions. A flow keeps a `published_revision_id`; autosave writes only to a draft revision; the call runtime always reads the published revision.
  - Turn ACTIVATE into "Publish" (or "Go live"). It opens a confirmation sheet showing the validation result and a diff summary (nodes added, removed and changed; prompt changed), then promotes the draft.
  - Show the state in the header: "Live · v7" vs "Draft — 3 unpublished changes", with a "Discard draft" action.
  - When a connected node is deleted, show an undo toast ("Deleted 'X' and 2 connections · Undo", 5–8 s). Never delete silently.
  - On the server, require `If-Match` / `updated_at` on PUT and return 409 on a mismatch, so a stale tab can't overwrite a newer save.

### F-FLOW-002 — Opening or switching to a flow writes to it with no user action
- **Severity:** high (auditors: critical/high; verifier: high on FLOW-CANVAS-01, medium on FLOW-CONFIG-02) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-01, FLOW-CONFIG-02
- **Pages:** /flow-builder, /flow-builder (ALL FLOWS switcher)
- **Evidence:**
  - With zero input, `PUT /api/flows/f9b04a18…` fired on every reload the verifier ran: 4 of 4 in one check, 3.8–4.6 s after `GET /api/flows`, and on all 7 in another, 6.3–7.0 s after navigation. After that, 12 s of idle produced no further requests.
  - Opening another flow from the switcher wrote to that flow too: Flow B about 3.6 s after opening and Flow C about 5.1 s after (`PUT /api/flows/47e3147e…`, `/bf11c0a3…`).
  - The write changes no content. All 26 nodes have equal fields, the 27 edges have the same keys, and only the JSON key order differs. But it bumps `updated_at`: stored 10:39 UTC = 16:09 IST, which is exactly the switcher's "Last edited 26 Sept, 16:09". So "last edited" records visits, not edits.
  - Undo is enabled immediately after load, a phantom history entry (see F-FLOW-005).
  - Inferred: a stale tab that merely opens a flow can overwrite a teammate's newer save, because there is no concurrency check.
- **Screenshots:** `audit/screenshots/va-verify-flow-config/01_load_idle.png`, `audit/screenshots/va-flow-config/21_load_1s.png`, `audit/screenshots/va-flow-config/22_load_8s.png`, `audit/screenshots/va-flow-canvas/02_after_autosave_blocked.png`
- **Recommendation:**
  - Set the dirty flag only on changes the user made. Ignore hydration, React Flow `onNodesChange` events of type `dimensions`, `fitView` and selection changes.
  - Before each save, compare a stable hash (sorted keys) of the serialized flow with the last loaded or saved snapshot, and skip the save if they match.
  - On the server, treat a PUT whose content equals the stored content as a no-op that leaves `updated_at` alone. If the load-time rewrite exists to normalise the schema, run it once as a server-side migration.
  - Clear the undo stack after hydration.

### F-FLOW-003 — Save status is never truthful: "Up to date" is permanent, failures are silent, and a quick exit loses the last edit
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-11, FLOW-CONFIG-03
- **Pages:** /flow-builder
- **Evidence:**
  - After a node drag, the pill was polled every 200 ms for 6 s. All 30 samples read "Up to date". It never showed "Unsaved" or "Saving…".
  - Right after a node was added it read "Up to date". 5.5 s after the autosave PUT was blocked, it still read "Up to date", with no toast (observed under simulated network failure).
  - FLOW-CONFIG saw "Autosave failed" (red icon) once, after several blocked edits. The verifier never saw it, so failure reporting is inconsistent at best.
  - **Quick-exit test:** add a node, then navigate away 0.4 s later, by full page load or by the in-app sidebar link to /dashboard. There was no PUT, no `beforeunload` prompt and no flush, so the edit was silently lost.
  - After "New flow" plus edits (never persisted, no API call at all), the chip still read "Up to date".
  - The idle icon is a dashed circle that reads as a loading spinner.
  - Save is always enabled. Its only explanation is the tooltip "Save (Ctrl+S)", which doesn't say how it differs from autosave.
- **Screenshots:** `audit/screenshots/va-flow-canvas/49_after_edit_status.png`, `audit/screenshots/va-flow-config/30_validate_after_edits.png`, `audit/screenshots/va-verify-flow-config/03_chip_after_add.png`
- **Recommendation:**
  - Drive the chip from a save state machine:
    - "Saved · 12:04" with a static check icon;
    - "Unsaved changes" with an amber dot;
    - "Saving…" with a spinner;
    - "Couldn't save · Retry" in red, persistent until a save succeeds;
    - "Not saved yet" for new flows.
  - Flush any pending debounced save on in-app route change (navigation guard), on `visibilitychange` → hidden and on `pagehide`, using `fetch(…, {keepalive: true})`. Register `beforeunload` only while the state is dirty or saving.
  - Resolve what Save means. With draft/publish in place (F-FLOW-001), either remove Save and rely on the autosave chip, or relabel it "Save version" with an optional note, disabled when clean.
  - Retry failed writes with backoff and raise a toast on the first failure.

### F-FLOW-004 — "FLOW VALIDATED" shows on invalid flows, the validator checks wiring only, and ACTIVATE isn't gated
- **Severity:** high (auditor: critical; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-03, FLOW-CONFIG-04
- **Pages:** /flow-builder
- **Evidence:**
  - **The badge** is a 10 px mono span in `text-positive/70` (#59AA86 on #F4F6FA = 2.58:1) with an `animate-pulse` dot. It shows on every flow, including the default template that flashes during load, and is hidden only while the Validate panel is open in its place.
  - **Validate results while the badge said "validated":**
    - Flow A: 2 errors (an orphan Knowledge Lookup with no input and no output).
    - Flow B: 7 errors (Question nodes missing YES/NO connections).
    - The product's own New-flow template: 1 error (Question "Confirm Location" must have both YES and NO connections).
    - Flow A plus 3 unconnected new nodes: 9 errors, with the badge unchanged.
  - **What the validator misses:** every error it reports is about connectivity or YES/NO wiring. It does not flag:
    - a Speak node with its label and message cleared;
    - Transfer number "abc";
    - WhatsApp with no template;
    - Live Lookup with no connector;
    - Verify attempts set to 999;
    - an unknown `{{variable}}`;
    - a blank flow name;
    - duplicate labels.
  - **ACTIVATE** stays `disabled=false` at opacity 1 with 9 errors. Whether it validates on the server is unknown, because it was not clicked.
  - **Raw ids:** one error named a node by its raw id ("node_1790420966396") after its label was cleared.
- **Screenshots:** `audit/screenshots/va-verify-flow-canvas/01_load.png`, `audit/screenshots/va-verify-flow-canvas/05_airport_badge.png`, `audit/screenshots/va-flow-canvas/46_airport_validate.png`, `audit/screenshots/va-flow-config/14_validate_fresh.png`, `audit/screenshots/va-flow-config/50_validate_default_template.png`, `audit/screenshots/va-verify-flow-config/04_validate_with_added.png`, `audit/screenshots/va-verify-flow-config/05_validate_empty_greet.png`
- **Recommendation:**
  - Replace the static badge with a live chip, recomputed on every graph change (debounced 300–500 ms): "No issues", "2 errors · 3 warnings" or "Checking…". Text at 4.5:1 or better, no pulse. Clicking it opens the Problems list (F-FLOW-010).
  - Add per-type rules.
    - Errors: empty Speak message or Question text; invalid E.164 number; WhatsApp without a template; Live Lookup without a connector; attempts outside 1–5; unknown variables; blank flow name; unreachable nodes; required outputs left unconnected.
    - Warnings: duplicate labels, disconnected integrations, and a missing fallback path.
  - Gate publishing. Disable ACTIVATE/Publish while errors exist and show the reason inline. Allow warnings through "Publish anyway". Run the same validator on the server at activation and return 422 with the list of issues.
  - Always name nodes by label, falling back to "Untitled Transfer step (step 7)". Never show raw ids.

### F-FLOW-005 — Undo doesn't revert node additions and is enabled with nothing to undo
- **Severity:** high (auditor: critical; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-02, FLOW-CONFIG-23 (Undo part)
- **Pages:** /flow-builder
- **Evidence:**
  - On freshly loaded Flow A, Undo is enabled and Redo disabled. Two Undo clicks changed nothing, and Undo stayed enabled.
  - Palette "Speak" took nodes from 26 to 27. Ctrl+Z announced "Undone.", but the node (same id) stayed. After 3 more toolbar Undos there were still 27 nodes.
  - Ctrl+Y announced "Redone." with no change, and Redo stayed disabled. The status chip stayed "Up to date" throughout.
  - Undo *does* restore a node deleted with Backspace, and Ctrl+Y deletes it again. So deletions are recorded but additions are not, and the history is only partial and can't be trusted.
- **Screenshots:** `audit/screenshots/va-flow-canvas/16_undo_after_load.png`, `audit/screenshots/va-flow-canvas/17_after_palette_click.png`, `audit/screenshots/va-flow-canvas/18_after_3_undos.png`, `audit/screenshots/va-flow-config/56_undo_after_load.png`, `audit/screenshots/va-verify-flow-canvas/03_after_undos.png`
- **Recommendation:**
  - Keep one history stack that records every graph change: add, paste, connect, disconnect, delete, move (one entry per drag end), inspector edits (typing coalesced per field focus), AI-draft replace and Reset.
  - Start the stack empty after hydration, and bind Undo/Redo `disabled` to the stack lengths.
  - Announce the specific action ("Undid: add Speak node"), and only when something actually changed.
  - Add a regression test: add, then undo, and assert the node count is restored.

---


### F-FLOW-006 — The canvas works only with a mouse: no visible focus, tab order follows creation order, and there's no keyboard way to connect nodes
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-10
- **Pages:** /flow-builder
- **Evidence:**
  - **Nodes:** each is `role=group tabindex=0` with no `aria-label`, so a screen reader reads out all the inner text, including long messages. (FLOW-CONFIG listed "descriptive node aria-labels" as a strength; the verifier found no aria-label on the focusable node element.)
  - **Focus:** while a node is `:focus-visible` it has `outline: none`, `box-shadow: none` and an unchanged grey border, so there is no visible focus indicator (WCAG 2.4.7).
  - **Tab order** is creation order, not flow order: Start → Greet & Introduce → Confirm Interest → Thank & End → Send WhatsApp → End Call. Focus jumps back and forth across the graph.
  - **Enter** selects the node but doesn't open the inspector (no "Editing …" chip).
  - **Connecting:** none of the 54 handles can take focus, and the shortcuts list has no connect command. So you can't create connections from the keyboard (WCAG 2.1.1).
  - **Shortcuts dialog:** "?" opens it with `aria-modal=true`, but focus stays on `BODY`.
  - **Handles** are small targets too (see F-FLOW-020).
- **Screenshots:** `audit/screenshots/va-flow-canvas/33_focus_ring_check.png`, `audit/screenshots/va-flow-canvas/32_keyboard_focus.png`, `audit/screenshots/va-verify-flow-canvas/15_focus.png`, `audit/screenshots/va-verify-flow-canvas/16_after_enter.png`
- **Recommendation:**
  - Give nodes a visible focus style: `.react-flow__node:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px }`, with at least 3:1 contrast against the canvas.
  - Make keyboard order follow the graph (depth-first from Start). Use a roving tabindex so arrow keys follow edges: ↓ for the default output, → for the alternate output. Alt+Arrow moves the node.
  - Make Enter or F2 open the inspector with focus on Label, and Esc return focus to the node.
  - Add a "Connect…" command (C) on the focused node or output, which opens a searchable listbox of target nodes. Add an "Add next step" command that opens the palette, then inserts and connects the new node.
  - Give nodes a full `aria-label`, for example "Step 3 of 26, Question: Confirm Interest. Outputs: Yes → New Speak Node; No → Thank & End".
  - In every dialog, move focus to the first control on open, trap it, and restore it on close.

### F-FLOW-007 — Node titles, output chips, card edges and the status badge are low contrast
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-06
- **Pages:** /flow-builder
- **Evidence:**
  - Measured from computed styles with alpha blending, on the `#EEF1F7` node fill.
  - **13 px / 700 titles**, which need 4.5:1:

    | Node type | Title colour | Contrast |
    |---|---|---|
    | condition | #FBBF24 | **1.48:1** |
    | knowledge_lookup | #FB923C | **2.00:1** |
    | transfer | #F472B6 | **2.34:1** |
    | question | #0E9488 | **3.31:1** |
    | whatsapp | #178A55 | **3.86:1** |
    | speak | #2F5FE0 | 4.84:1 (passes) |

  - **Output chips:** YES/NO/TRUE/FALSE are 10 px mono at 3.24–3.30:1.
  - **Card edges:** fill vs canvas (#F4F6F9) is 1.05:1 and border (#E1E6EF) vs canvas is 1.16:1, so card edges are practically invisible. WCAG 1.4.11 asks for 3:1.
  - **Badge:** "FLOW VALIDATED" is 2.58:1.
  - **Zoom makes it worse:** at the default 0.712 zoom these render at 9.3 px (titles) and 7.1 px (chips).
- **Screenshots:** `audit/screenshots/va-flow-canvas/05_selected_node_zoom.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`, `audit/screenshots/va-verify-flow-canvas/13_default_zoom.png`
- **Recommendation:**
  - Set all titles in one ink token (≥ 7:1). Carry the type hue in a 4 px left accent bar, the icon tile and a small type badge.
  - If coloured title text stays, use darker shades. Checked on #EEF1F7:
    - orange #C2410C: 4.58:1
    - pink #BE185D: 5.34:1
    - teal #0F766E: 4.84:1
    - amber **#92400E**: 6.27:1. Amber-700 #B45309 reaches only 4.44:1 on #EEF1F7, so it is not enough.
  - Give cards a white surface with a 1 px #CBD5E1 border, a subtle shadow and the type accent bar, so each card's edges are visible against the canvas.
  - Make chips 12 px with white text on solid fills: green #15803D (5.0:1) and red #B91C1C (6.5:1).
  - Replace the badge as described in F-FLOW-004.

### F-FLOW-008 — Node text is illegible at default and fit zoom, and large flows can't be read or navigated
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-05, FLOW-CONFIG-21, VISUAL-AUDIT-10 (node text size)
- **Pages:** /flow-builder
- **Evidence:**
  - **Default zoom:** the scale is 0.711924.
    - A 13 px title renders at about 9.3 px, 11 px body text at 7.8 px, chips and edge labels at 7.1 px, and handles at 8.5 px.
    - In the 1042x651 pane only 9 of Flow A's 26 nodes are fully visible and 12 are partly visible.
    - End Call's top edge is at y=1686, against a pane bottom of 887, and nothing signals that more of the flow is below.
    - At 1280x720 only 12 of 26 nodes are visible.
  - **Fit View:**
    - The scale drops to 0.2938, so titles are about 3.8 px.
    - Flow A becomes a 287 px-wide column in a 1042 px pane.
    - Flow B fits at 0.383.
  - **No navigation aids:**
    - There is no zoom % readout or preset. The only controls are Zoom In, Zoom Out, Fit View and Lock.
    - There is no outline or list view and no find-node.
    - Duplicate labels ("Lead questions" ×5, "Lead - questions" ×3, "Knowledge Lookup" ×3) make it ambiguous which node is which.
- **Screenshots:** `audit/screenshots/va-flow-canvas/30_fit_view.png`, `audit/screenshots/va-flow-canvas/45_airport_fit.png`, `audit/screenshots/va-flow-config/35_fit_view.png`, `audit/screenshots/va-verify-flow-canvas/13_default_zoom.png`, `audit/screenshots/va-verify-flow-canvas/14_fit_view.png`, `audit/screenshots/va-visual-audit/flow-builder_node_zoom.png`
- **Recommendation:**
  - Change node detail with zoom level:
    - Below 0.6, render compact nodes: type icon plus label, counter-scaled so it's at least 12 px on screen, with no body text.
    - Below 0.35, render type-coloured blocks with labels in an unscaled HTML overlay.
  - Open flows with `fitView({ minZoom: 0.6 })` anchored at Start, or restore the viewport saved for that flow.
  - Add a zoom % control with 50 / 100 / Fit presets, plus Ctrl+0 and Ctrl+1.
  - Add an Outline panel: an ordered step list with type icons, issue dots and search. Clicking a step selects the node and centres it.
  - Add Ctrl+F canvas search across labels and messages, with next/previous.
  - Offer a left-to-right layout for wide screens (F-FLOW-021).

### F-FLOW-009 — Palette clicks drop new nodes on top of existing ones, unconnected and unselected, and you can't drag steps from the palette
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-04, FLOW-CONFIG-05, UX-AUDIT-18 (node-placement part), DESIGN-RESEARCH-04 (node-overlap part), VISUAL-AUDIT-10 (node-overlap part)
- **Pages:** /flow-builder
- **Evidence:**
  - **One add:** palette "Speak" placed "New Speak Node" at about (927,486), 171x46 on screen. It overlapped "Confirm Interest" and "Knowledge Lookup", wasn't selected, and wasn't connected (still 27 links).
  - **Three adds:** Speak, Question and CRM Lookup landed within x 868–896 / y 524–539. `elementFromPoint` at each new node's centre returned only the last one added, so the earlier two were hidden underneath.
  - **Under the selection:** FLOW-CONFIG also saw a new node render *beneath* the selected node, where it couldn't be clicked. The verifier did not re-test this.
  - **No drag-and-drop:** palette buttons are `draggable=false` with no `dragstart` handler. Neither a manual mouse drag nor Playwright `dragTo` added a node, although the canvas hint says "Drag nodes…".
  - **In the live Flow A:** an orphan "Knowledge Lookup" is stacked on "Confirm Interest" and hides its question text (reported independently by FLOW-CANVAS, FLOW-CONFIG, UX-AUDIT, VISUAL-AUDIT and DESIGN-RESEARCH). Whether it was created this way can't be verified.
- **Screenshots:** `audit/screenshots/va-flow-canvas/17_after_palette_click.png`, `audit/screenshots/va-flow-config/27_stacked_nodes.png`, `audit/screenshots/va-flow-config/23_after_add_crm.png`, `audit/screenshots/va-verify-flow-config/03_added_nodes.png`, `audit/screenshots/va-verify-flow-config/09_stacked_adds.png`, `audit/screenshots/va-flow-canvas/22_drag_from_palette.png`, `audit/screenshots/va-ux-audit/crop_flow_overlapping_nodes.png`, `audit/screenshots/va-visual-audit/flow-builder_node_zoom.png`
- **Recommendation:**
  - **When a node is selected:** insert the new node below it (node height + 48 px gap) and connect it from the selected node's first free output. Push downstream nodes down if they would collide.
  - **When nothing is selected:** place the node in the free grid cell nearest the viewport centre, checking collisions against every node's box plus a 24 px margin. Offset each successive add.
  - **After any add:** select the node, pan it into view and open the inspector with focus on Label.
  - **Drag from palette:** support HTML5 drag-and-drop mapped through `screenToFlowPosition`, with a drop ghost. Dropping onto an edge inserts the step between its two nodes.
  - **Output "+":** put a "+" on every unconnected output handle that opens a mini palette and inserts an already connected node.

### F-FLOW-010 — Validation issues aren't marked on nodes, and results carry over when you switch flows
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-08
- **Pages:** /flow-builder
- **Evidence:**
  - **Errors appear only in a floating panel:** a 384x289 panel over the canvas's top-left. After Jump, the node has no error ring or badge, and no node carries an error class.
  - **Messages are ambiguous:** they name nodes by duplicate labels ("Knowledge Lookup" appears 3 times in Flow A) or by raw ids.
  - **Stale results survive a flow switch (reproduced twice):**
    - Flow A's 2 errors stayed on screen after switching to Flow B.
    - Flow B's 7 errors stayed after switching to Flow C, a 9-node flow for which Validate reports "FLOW VALIDATED".
  - **Jump works:** it zooms to 1.0, selects the node and opens the inspector. The report that the jumped-to node sits under the panel was overstated: it overlaps the panel by only about 7 px.
- **Screenshots:** `audit/screenshots/va-flow-canvas/15_validate_jump.png`, `audit/screenshots/va-flow-canvas/47_flow_srv_asloaded.png`, `audit/screenshots/va-verify-flow-canvas/10_srv_after_switch.png`, `audit/screenshots/va-verify-flow-canvas/11_jump.png`
- **Recommendation:**
  - Mark issues on nodes:
    - errors: a 2 px red ring plus a "!" count badge;
    - warnings: amber;
    - a dangling-output marker on any unconnected YES/NO handle;
    - a tooltip listing the node's issues.
  - Replace the floating list with a collapsible Problems drawer at the bottom, showing error and warning counts, grouped by node. Clicking an issue selects and centres the node.
  - Key validation state by flow id, and clear or recompute it whenever the open flow changes.
  - Name nodes by step number plus label (for example "Q4 · Confirm Interest").

### F-FLOW-011 — Edge styling carries no meaning, branch outcomes are unlabelled, and the marching-ants animation ignores reduced motion
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-07
- **Pages:** /flow-builder
- **Evidence (Flow A, 27 edges):**
  - **Animation:** 25 edges have the `animated` class (5 px dasharray, `dashdraw 0.5s infinite`). Edges drawn by users come out animated. There is no legend and the dashes mean nothing.
  - **Colour and labels:**
    - 26 edges are stroke rgb(47,95,224) and 1 is red rgb(208,70,58).
    - That red edge carries the only label, "Not Interested": 10 px text on a white box, about 7.1 px on screen.
    - Edges leaving a FALSE handle render blue and dashed, exactly like TRUE edges.
  - **Stroke width:** every stroke is 1 px, about 0.71 px on screen.
  - **Reduced motion:** with `prefers-reduced-motion: reduce` emulated, all 25 edges keep animating (WCAG 2.2.2, 2.3.3).
  - **Accessible names:** 24 of 27 edge aria-labels contain raw ids ("Edge from node_1785140…-copy-…-copy-… to node_…").
  - **Routing in other flows:** Flow B has 12+ edges converging on one node and crossing each other. In Flow C a NO edge loops back behind the cards.
- **Screenshots:** `audit/screenshots/va-flow-canvas/51_edge_selected.png`, `audit/screenshots/va-flow-canvas/50_edge_hover.png`, `audit/screenshots/va-flow-canvas/45_airport_fit.png`
- **Recommendation:**
  - Give every branch edge an outcome label pill (Yes/No, True/False, Verified/Failed, or the condition value) at least 12 px on screen.
  - Colour edges by outcome at 1.5–2 px: positive #15803D, negative #B91C1C, default neutral #64748B.
  - Stop animating saved edges. Animate only the path being traversed during a simulation (F-FLOW-016), and add `@media (prefers-reduced-motion: reduce) { .react-flow__edge-path { animation: none } }`.
  - Reserve dashed lines for fallback and timeout paths, and document colours and dash styles in a legend.
  - Build edge aria-labels from node labels, for example "Confirm Interest — No → Thank & End".
  - Use `smoothstep` edges with rounded corners for flows with many branches.

---


### F-FLOW-012 — Flow identity is ambiguous: duplicate names, hidden versions, no current or live marker, and switching keeps the previous flow's viewport
- **Severity:** high · **Confidence:** partially-verified
- **Source findings:** FLOW-CONFIG-06, FLOW-CANVAS-09
- **Pages:** /flow-builder (ALL FLOWS modal), /dashboard, /meeting-agent
- **Evidence:**
  - **Duplicate names.** The ALL FLOWS modal (896 px) lists 16 flows, including 3 pairs with identical names. Within the builder the pairs differ only by last-edited date.
  - **No flow status in the list.**
    - The row for the open flow isn't highlighted (every row has a transparent background).
    - There is no Live or Active badge.
    - There is no visibility column, although the API's `is_public` differs across flows.
    - OPEN is the only row action.
  - **Confusing sort.** Rows are sorted by `created_at` descending, a column the modal doesn't show. So the visible LAST EDITED column looks random (4 Sept, 21 Sept, 15 Sept, 26 Sept, 28 Aug…), and the headers can't be clicked to sort.
  - **Versions.**
    - Names carry "(v2)", "(v3)" and "(v6)". The API stores `version_no` and `parent_flow_id`, but the UI never shows the lineage.
    - The lineage data is inconsistent: the active "(v2)" flow has `version_no` 3, and its parent is an unrelated demo flow.
    - AI-draft flows are stored as "Generated: <prompt text> ... (v2)", with a literal "...".
  - **Naming differs by page.**
    - The Cockpit tells duplicates apart with hashes ("· f9b04a").
    - The Meeting Agent's 17 options list the duplicates identically.
    - The builder header truncates long names ("…Tele Calling Scri…").
  - **Viewport carry-over.** Switching flows keeps the previous transform exactly. Flow A → Flow B kept `translate(257.588,24.64) scale(0.7119)`, and Flow B → Flow C kept `translate(51,-554.5) scale(1)`. Flow C opened showing fragments, with Start off-screen. One click on Fit View recovers it, so the verifier rated this part medium.
- **Screenshots:** `audit/screenshots/va-flow-config/05_flow_switcher.png`, `audit/screenshots/va-flow-config/52_flow_switcher_bottom.png`, `audit/screenshots/va-flow-config/54_cockpit_flow_selector.png`, `audit/screenshots/va-flow-config/55_meeting_agent_conversation_flow.png`, `audit/screenshots/va-flow-canvas/12_switcher_open.png`, `audit/screenshots/va-flow-canvas/47_flow_srv_asloaded.png`, `audit/screenshots/va-verify-flow-canvas/08_srv_open.png`
- **Recommendation:**
  - Model one flow as one entity with revisions (v1…vN, each with author, timestamp and note; view, compare and restore). Show the existing `version_no` / `parent_flow_id` data, and repair the inconsistent lineage.
  - Enforce unique names per organisation: the server returns 409 on a clash, and duplicating auto-suffixes "(copy 2)".
  - Give the switcher these columns: Name, Status (Live / Unpublished changes / Archived), Visibility, Nodes, Last edited (the default sort, descending) and Owner. Make the headers sortable.
  - Highlight the open flow's row ("Open now") and add a row menu: Rename, Duplicate, Archive, Set live.
  - Use the same display name plus a disambiguator (short id or created date) in the Builder, Cockpit and Meeting Agent. Show the full name in a tooltip, or truncate the middle of the name instead of the end.
  - Save the viewport per flow id. Every time a flow opens, restore its saved viewport or fit to content.

### F-FLOW-013 — There's no real "create flow" journey, and the default template is itself broken
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-08
- **Pages:** /flow-builder (More actions → New flow)
- **Evidence:**
  - **Hidden and next to a destructive action.** "New flow" is the third item in the "…" menu, directly above "Reset to default". There is no separator, and both use the same colour (rgb 62,71,90).
  - **No setup step.** Clicking it instantly swaps in an 8-node, 8-link template. There's no name prompt, no blank-canvas option, no choice of template and no confirmation.
  - **Confusing state afterwards.**
    - The header reads "Choose a flow to edit" and the chip reads "Up to date".
    - ACTIVATE, Private and trash are disabled at opacity 0.4.
    - The reasons appear only in native tooltips ("Save the flow first to activate it").
    - No PUT is sent to the active flow, which is correct.
  - **The template is broken.**
    - It fails Validate with 1 error ("Confirm Location" is missing a connection).
    - Its Preview AI script prints "Duration: undefined minutes".
- **Screenshots:** `audit/screenshots/va-flow-config/45_more_actions_menu.png`, `audit/screenshots/va-flow-config/46_new_flow_click.png`, `audit/screenshots/va-flow-config/48_preview_script_newflow.png`, `audit/screenshots/va-flow-config/50_validate_default_template.png`, `audit/screenshots/va-verify-flow-config/08_new_flow.png`, `audit/screenshots/va-verify-flow-config/09_new_flow_validate.png`
- **Recommendation:**
  - Put a primary "+ New flow" button beside the switcher and inside the ALL FLOWS modal.
  - It opens a create dialog with:
    - Name (required, unique);
    - use case / category;
    - language and agent voice;
    - a starting point: Blank (Start → End), Template gallery (with previews) or AI draft.
  - Persist the new flow straight away as a draft, so ACTIVATE and Private have a real target. Label it "Draft · not live".
  - Fix the template: add Confirm Location's missing branch, and default the Schedule duration to 30 min so the compiled prompt never prints "undefined".
  - Add a CI check that every template passes the validator and compiles with no "undefined" or "null".
  - Move "Reset to default" into a danger section (F-FLOW-019).

### F-FLOW-014 — The builder doesn't show which flow is live, "active" means different things on different pages, and Private looks like a label
- **Severity:** medium (auditor: high; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-07
- **Pages:** /flow-builder, /meeting-agent
- **Evidence:**
  - The open flow is the account's `active_flow_id`, but the builder shows no Live or Active text or badge anywhere.
  - ACTIVATE (title "Activate this flow for all your calls") is enabled and looks identical on a flow that is already active.
  - The active flow is stored on the user record (`/api/auth/me` → `active_flow_id`). This fits the Meeting Agent's "Active flow (from profile)" option but contradicts "all your calls". That option also never names the flow.
  - Private is a `<button>` with `cursor: default`, `aria-pressed=false` and a grey pill style. It reads as a static label, and nothing says what the alternative to Private is.
  - Only the Cockpit's `FLOW:` select reveals the active flow.
- **Screenshots:** `audit/screenshots/va-flow-config/55_meeting_agent_conversation_flow.png`, `audit/screenshots/va-flow-config/54_cockpit_flow_selector.png`, `audit/screenshots/va-ux-audit/crop_flow_toolbar.png`
- **Recommendation:**
  - Show a "LIVE" pill next to the flow name when the open flow is active. On that flow, turn ACTIVATE into a disabled "Live ✓", or "Publish changes" once a draft differs.
  - Wherever "Active flow" appears, name the flow: "Active flow: <name> (short id)".
  - Decide whether the active flow is per user or per organisation, and say so in the ACTIVATE tooltip and in settings copy.
  - Replace Private with a visibility menu button ("Visibility: Only me ▾ / Team") with `aria-haspopup` and a pointer cursor, or with a real switch (`role=switch`, `aria-checked`).

### F-FLOW-015 — Invalid field values are accepted, applied and autosaved (blank flow name, "abc" phone number, 999 attempts)
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** FLOW-CONFIG-09, FLOW-CONFIG-17
- **Pages:** /flow-builder (Flow settings; Transfer, Verify Customer and node labels)
- **Evidence:**
  - **Blank flow name (verified):**
    - The field has `required=false` and `aria-invalid` is null; it reports as valid and shows no message.
    - The switcher becomes an empty pill (aria-label "Current flow: . Click to choose a different flow.").
    - A PUT fired 3.1 s later.
  - **Transfer number "abc":** the field gets a red border, the helper "Must start with country code (e.g. +91)" and `aria-invalid=true`. The value is still applied (the canvas shows "To: abc") and autosaved.
  - **Verify attempts:** 999 and −5 are accepted (min 1, max 5). Only the browser's validity is false; no message is shown.
  - **Node labels** can be cleared. The validator then refers to the node by its raw id.
- **Screenshots:** `audit/screenshots/va-verify-flow-config/11_blank_name.png`, `audit/screenshots/va-verify-flow-config/12_blank_name_header.png`, `audit/screenshots/va-flow-config/43_blank_flow_name_header.png`, `audit/screenshots/va-flow-config/28_transfer_invalid_abc.png`, `audit/screenshots/va-flow-config/32_verify_attempts_invalid.png`, `audit/screenshots/va-flow-config/29_transfer_label_cleared.png`
- **Recommendation:**
  - Define a field schema per node type (for example with zod) and validate on change and on blur. Show the error text inline, linked with `aria-describedby`.
  - Let the input keep the invalid text but commit only valid values to the graph, or commit with an error flag the validator reports.
  - **Flow name:** required, trimmed and unique; if it's empty on blur, revert to the last valid name.
  - **Numeric fields:** clamp them, or show "1–5 attempts".
  - **Node labels:** required, with a fallback of "Untitled <type>".

### F-FLOW-016 — You can't test or simulate a flow inside the builder
- **Severity:** medium (auditor: high; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-10
- **Pages:** /flow-builder
- **Evidence:**
  - No builder control matches test, simulate, try, dry-run or call-me.
  - The only preview is "Preview AI script", a 672x428 modal:
    - Its scroll box is 230 px tall for 1,612 px of raw system prompt.
    - The prompt includes "CRITICAL EXECUTION RULES", the tool names `schedule_meeting` and `send_whatsapp`, and "Duration: undefined minutes".
    - Branches are laid out in a confusing order: Step 7 END appears before the "If NO" branch.
    - Steps don't link back to nodes, there is no copy button, and Close is the only button.
  - Test Call lives in the Cockpit and runs the active flow, the same record the builder autosaves into (F-FLOW-001).
- **Screenshots:** `audit/screenshots/va-verify-flow-config/10_preview_script.png`, `audit/screenshots/va-flow-config/48_preview_script_newflow.png`, `audit/screenshots/va-flow-canvas/38_preview_script.png`
- **Recommendation:**
  - Add a "Test" side panel with a text simulator. It shows agent turns and takes user replies, typed or via Yes/No and True/False quick replies. It highlights the current node and animates only the edge being taken.
  - Let testers fill in sample values for `{{lead_name}}` and other variables.
  - Add "Call me with this draft", which places a test call using the draft revision, never the live one.
  - Keep the prompt preview as an "Advanced" tab: max-height 70vh, a copy button, and each step linked to its node.

### F-FLOW-017 — The editor lacks the professional tooling a live-call workflow needs
- **Severity:** medium (auditor: high; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-24
- **Pages:** /flow-builder
- **Evidence:**
  - **What exists:**
    - Toolbar: AI draft, Settings, Undo, Redo, Copy, Paste, Validate, Preview AI script, Full-screen, Shortcuts, More (Export JSON, Import JSON, New flow, Reset to default), Private, Delete, Save and ACTIVATE.
    - Canvas controls: Zoom In, Zoom Out, Fit View and Toggle Interactivity.
  - **Missing:**
    - canvas search / jump to node;
    - version history, diff and restore;
    - draft vs publish;
    - sticky notes, frames and groups (the palette has no such items);
    - simulation;
    - a variables panel;
    - a legend;
    - auto-layout;
    - a zoom % readout;
    - per-node analytics from Call Reports, such as drop-off or the Yes/No split.
- **Screenshots:** `audit/screenshots/va-flow-canvas/36_more_menu.png`, `audit/screenshots/va-verify-flow-canvas/18_more_menu.png`, `audit/screenshots/va-ux-audit/crop_flow_toolbar.png`
- **Recommendation (priority order):**
  1. Draft/publish and version history (F-FLOW-001, F-FLOW-012).
  2. Issues shown on nodes, plus a Problems drawer (F-FLOW-010).
  3. A simulator (F-FLOW-016).
  4. Ctrl+F canvas search with next/previous (F-FLOW-008).
  5. An optional per-node funnel overlay from Call Reports (reach %, Yes/No split, drop-off).
  6. Sticky notes, and frames for sections (Greeting, Qualification, Booking, Close) that move their child nodes with them.
  7. A variables panel listing lead fields, captured answers and CRM fields.
  8. A legend popover for node types and edge meanings.

### F-FLOW-018 — Toolbar hierarchy: two filled primary buttons with mismatched styling, and an unexplained Save
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** DESIGN-RESEARCH-03, UX-AUDIT-18 (toolbar part), VISUAL-AUDIT-10 (Save/ACTIVATE part)
- **Pages:** /flow-builder
- **Evidence:**
  - **Two filled primaries, styled differently:**

    | | Save | ACTIVATE |
    |---|---|---|
    | Fill | blue rgb(47,95,224) | green rgb(23,138,85), with a glow |
    | Radius | 8 px | 12 px |
    | Case | Title case | UPPERCASE |
    | Text colour | black | white |
    | Size | 83x40 | 105x40 |

  - Save's black-on-blue text also fails contrast (3.83:1); this is tracked with the global primary-button finding.
  - AI draft is tinted as well.
  - **Icon-only buttons:** 9 of them. The shield (Validate) and eye (Preview) can't be identified without their tooltips.
  - **Unclear Save:** Save's purpose next to autosave is unexplained (F-FLOW-003).
  - **Destructive action in the primary group:** the trash "Destructive actions" button sits 8 px from Save, at the same visual weight.
- **Screenshots:** `audit/screenshots/scout_flow-builder.png`, `audit/screenshots/va-ux-audit/crop_flow_toolbar.png`, `audit/screenshots/va-visual-audit/flow-builder.png`
- **Recommendation:**
  - Keep one filled primary per toolbar: "Publish" / "Go live" (today's ACTIVATE), which opens a confirmation sheet with validation results and a diff.
  - Drop Save in favour of the autosave chip, or make it a secondary "Save version".
  - Share one button token set: 36–40 px height, the same radius, sentence case, white text on fills, and no glow.
  - Label Validate and Preview with text ("Check", "Preview") at widths of 1280 px and above. Move Copy, Paste, Full-screen and Shortcuts into the overflow menu.
  - Take destructive actions out of the "Save and ship" group (F-FLOW-019).

### F-FLOW-019 — Destructive actions are under-guarded where it matters and over-emphasised where it doesn't
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-22, FLOW-CONFIG-15, UX-AUDIT-18 (trash placement)
- **Pages:** /flow-builder ("…" and trash menus, node panels)
- **Evidence:**
  - **Under-guarded:**
    - "Reset to default" in the "…" menu is styled exactly like Export JSON: no separator, no red, no confirmation seen. It was not clicked. With autosave it would presumably overwrite the live flow (inferred).
    - The trash menu's "Delete flow" stays open after Escape.
    - Backspace deletes connected nodes without confirmation (F-FLOW-001) and without feedback (F-FLOW-025).
  - **Over-emphasised:**
    - Every inspector panel ends with a full-width, solid red "Delete Node" button (287x37, rgb(208,70,58)), the heaviest element in the panel.
    - Tab reaches it straight after the last field.
    - There is no Done or Apply.
- **Screenshots:** `audit/screenshots/va-flow-canvas/36_more_menu.png`, `audit/screenshots/va-flow-canvas/37_destructive_menu.png`, `audit/screenshots/va-flow-config/45_more_actions_menu.png`, `audit/screenshots/va-flow-config/26_panel_Speak_new.png`
- **Recommendation:**
  - **"…" menu:** add a separator and a red danger section with "Reset to default…". Confirm with a dialog that names the flow and says it replaces the current draft; version history makes this reversible.
  - **Delete flow:** require typing the name when the flow is live.
  - **All menus:** close on Esc and on an outside click (use an accessible menu primitive).
  - **Inspector:** replace the red slab with a trash icon in the panel header (`aria-label="Delete step"`) or a ghost "Delete step" link, backed by an undo toast. Add a "Done" primary that closes the panel.

### F-FLOW-020 — Branch outputs: only two outcomes, tiny handles whose meaning depends on position and is explained only in the inspector, and edges that can't be edited
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CONFIG-11, FLOW-CANVAS-25
- **Pages:** /flow-builder (Question, Branch, Verify Customer, edges)
- **Evidence:**
  - **Only two outcomes:**
    - Question offers YES/NO only.
    - Branch is a free-text condition with TRUE/FALSE only, so Flow A chains 3 Condition Checks to express three property types.
    - There is no "no answer / unclear / other" output and no way to save an answer to a variable.
  - **Outcome depends on position:** bottom = YES/TRUE/VERIFIED and right = NO/FALSE/FAILED. On the canvas the only cues are a green or red dot and a 10 px chip. The text "YES — connects from bottom handle" appears only in the inspector.
  - **Tiny targets:** handles are 12x12 (8.5 px on screen) with no larger hit area. WCAG 2.5.8 asks for 24x24.
  - **Edges can't be edited:** you can select an edge but can't label or delete it from a control, and double-clicking an edge label does nothing. Labels exist only on template edges.
- **Screenshots:** `audit/screenshots/va-flow-config/26_panel_Question.png`, `audit/screenshots/va-flow-config/26_panel_Branch.png`, `audit/screenshots/va-flow-config/58_edge_click.png`, `audit/screenshots/va-flow-canvas/23_connecting_drag.png`
- **Recommendation:**
  - **Question:** let authors define N answer options, each with its own labelled output, plus a mandatory "No response / Didn't understand" fallback and an optional "Save answer to {{var}}".
  - **Branch:** offer a structured condition builder (variable, operator, value) with N cases plus Else. Keep a natural-language option.
  - **Handles:** put all outputs on the bottom edge as labelled port tabs ("Yes", "No", "Else"). Make the visible handle 14–16 px, with a 24–32 px hit area and a hover halo.
  - **Edges:** when an edge is selected, show a popover to label it, change its outcome, delete it or insert a step.

---


### F-FLOW-021 — No snapping, alignment guides or auto-layout, so flows drift into overlaps and crossing edges
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-17, DESIGN-RESEARCH-04 (node-overlap part), VISUAL-AUDIT-10 (auto-layout part)
- **Pages:** /flow-builder
- **Evidence:**
  - **No snapping or guides:** after a drag, the node sits at fractional coordinates, `translate(714.949px, 476.093px)`. No helper lines appear while dragging.
  - **No layout command:** there is no "Tidy" or auto-layout in the toolbar or the "…" menu.
  - **Real flows already show the damage:**
    - Flow A: the "Knowledge Lookup" box overlaps "Confirm Interest" and hides its question text.
    - Flow B: 12+ edges converge on one node and cross each other.
    - Flow C: a NO edge loops back behind the cards.
  - **Edge style:** every edge is a default bezier. There are no orthogonal or step edges and no reroute points.
- **Screenshots:** `audit/screenshots/va-flow-canvas/25_node_dragging.png`, `audit/screenshots/va-flow-canvas/45_airport_fit.png`, `audit/screenshots/va-visual-audit/flow-builder_node_zoom.png`, `audit/screenshots/scout_flow-builder.png`
- **Recommendation:**
  - Turn on `snapToGrid` with a 16 px grid, and show alignment and spacing guides while dragging.
  - Add "Tidy layout" (dagre or elk; top-down or left-right) as a single undoable command.
  - When a loaded flow has overlapping nodes, show an "Overlapping steps · Fix layout" banner. Don't move nodes silently, because autosave would then write the change.
  - Use `smoothstep` edges with rounded corners for flows with many branches. Add reroute points, and a merge node for many-to-one joins.

### F-FLOW-022 — The canvas gets only 36–52% of the screen, squeezed by two header rows, a fixed palette and a docked inspector (down to 294 px wide at 1024)
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-20, FLOW-CONFIG-16, VISUAL-AUDIT-10 (header-height part)
- **Pages:** /flow-builder at 1440, 1280 and 1024 px
- **Evidence:**

  | Viewport | Canvas pane | Share of viewport |
  |---|---|---|
  | 1440x900 | 1043x651 | 52% |
  | 1440x900, inspector open | 711x651 | 36% |
  | 1280x720 | 882x513 | — |
  | 1024x768 | 626x561 | — |
  | 1024x768, inspector open | **294 px wide**, mostly covered by the ~200x150 minimap | — |

  - **Chrome above the canvas:** the 42 px wallet banner plus two header rows (about 128 px), roughly 180 px in total.
  - **Palette:** fixed at 288 px. It can collapse, but the collapsed state isn't remembered.
- **Screenshots:** `audit/screenshots/va-flow-config/62_1024_panel_open.png`, `audit/screenshots/va-flow-canvas/55_1024x768.png`, `audit/screenshots/va-flow-canvas/54_1280x720.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`
- **Recommendation:**
  - Merge the header into one 48–56 px bar: flow-name dropdown, status chip, primary action and an overflow menu.
  - Inside the builder, collapse the wallet banner into a header chip.
  - While the inspector is open, auto-collapse the palette to a 56 px icon rail, and remember the palette state per user.
  - Below 1280 px, make the inspector overlay the canvas (or let users resize it between 280 and 480 px), and pan the selected node into the visible area.
  - Hide the minimap automatically when the canvas is narrower than 600 px.

### F-FLOW-023 — The minimap covers canvas content, can't be hidden, and looks like a grey slab in light mode
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-16, VISUAL-AUDIT-10 (minimap part)
- **Pages:** /flow-builder
- **Evidence:**
  - **Size and placement:** 202x152 in the bottom-right corner.
  - **Covers content:**
    - With the inspector open it covers Condition, Lead-questions and WhatsApp nodes.
    - At 1024x768 it covers about 8.5% of the canvas and sits on top of nodes.
  - **No control:** there's no toggle, and the minimap disappears in full-screen mode.
  - **Grey slab in light mode:** its `rgba(0,0,0,.38)` mask over a white panel reads as a solid grey block.
  - **No legend:** minimap nodes are coloured by type, but nothing says what the colours mean.
- **Screenshots:** `audit/screenshots/va-visual-audit/flow-builder_minimap_zoom.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`, `audit/screenshots/va-flow-canvas/55_1024x768.png`
- **Recommendation:**
  - Add a minimap toggle to the canvas controls, remembered per user.
  - Shrink the default to about 160x100.
  - In light mode, use a `rgba(15,23,42,.08)` mask with the viewport rectangle outlined.
  - Pad `fitView` so content never ends up under the overlays.
  - Keep the minimap in full-screen mode.

### F-FLOW-024 — Documented shortcuts don't work (Shift+click multi-select, double-click inline edit), and the shortcuts dialog is clipped and shows the wrong platform's keys
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-12, FLOW-CANVAS-13, FLOW-CANVAS-18
- **Pages:** /flow-builder, /flow-builder ("?" dialog)
- **Evidence:**
  - **The dialog:**
    - It is 451x823 at y=148, so 71 px falls below the 900 px viewport and the last row is cut off.
    - Redo reads "Cmd Shift Z" on Windows, while the toolbar tooltip says Ctrl+Shift+Z.
    - Missing entries: zoom, fit, pan, the Delete key, connect, add node and search.
    - Focus isn't moved into it (F-FLOW-006).
  - **Multi-select:**
    - Shift+click on a second node selects only that node. Ctrl+click keeps only the first. Meta+click clears the selection.
    - Only Shift+drag box selection works, and it selects only fully enclosed nodes.
    - With 2 nodes selected there's no count and no bulk-action bar.
  - **Inline edit:** double-clicking a title opens the same side inspector as a single click, and the double-click text-selects the "Editing …" chip. The flow-config notes (§3.8) confirm this.
- **Screenshots:** `audit/screenshots/va-flow-canvas/35_shortcuts.png`, `audit/screenshots/va-flow-canvas/26_shift_multiselect.png`, `audit/screenshots/va-flow-canvas/28_box_selected.png`, `audit/screenshots/va-flow-canvas/41b_inline_edit_full.png`, `audit/screenshots/va-flow-config/49_keyboard_shortcuts.png`
- **Recommendation:**
  - **Multi-select:** set React Flow `multiSelectionKeyCode={['Shift','Control','Meta']}` so these keys toggle selection. Show an "N selected" chip and a floating action bar (Delete, Duplicate, Align, Group). Offer partial-overlap box selection with Alt held.
  - **Inline edit:** either build it (an input at least 14 px on screen whatever the zoom; Enter commits, Esc cancels) or change the copy to "Click a step to edit it in the side panel".
  - **Dialog:**
    - Cap it at 80vh with internal scroll, in two columns.
    - Group the rows: Edit / Select / Navigate / View.
    - Detect the platform for modifier-key labels.
    - List only shortcuts that work.

### F-FLOW-025 — Deleting a node leaves a ghost inspector and gives no feedback
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-14
- **Pages:** /flow-builder
- **Evidence:**
  - After Backspace the node disappears, but the inspector still shows "SPEAK NODE · ID node_1790420907202 · Label New Speak Node · Delete Node", and the header chip still reads "Editing New Speak Node".
  - Nothing is announced in the live region, and the status stays "Up to date".
  - The verifier also saw no toast after deleting a connected node (F-FLOW-001).
- **Screenshots:** `audit/screenshots/va-flow-canvas/20_after_delete_key.png`, `audit/screenshots/va-verify-flow-config/02_after_backspace.png`
- **Recommendation:**
  - On delete, close the inspector and clear the "Editing" chip.
  - Show a toast ("Deleted 'New Speak Node' and 2 connections · Undo") and announce "Deleted New Speak Node" in the live region.
  - When the deleted node had both incoming and outgoing edges, offer "Reconnect neighbours", which joins the previous step to the next one.

### F-FLOW-026 — Paste and the palette create identically named, overlapping duplicates
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-15
- **Pages:** /flow-builder
- **Evidence:**
  - **Paste:** Ctrl+C / Ctrl+V on "Greet & Introduce" creates another "Greet & Introduce" at +50,+50, overlapping the original. Edges aren't copied. The announcement is just "Pasted."
  - **Palette:** adding Speak twice creates a second "New Speak Node".
  - **In live Flow A:**
    - 8–9 nodes titled "Lead questions" or "Lead - questions" (FLOW-CONFIG counted 5 + 3, FLOW-CANVAS counted 9), 3 "Condition Check" and 3 "Knowledge Lookup";
    - ids like `node_…-copy-…-copy-…-copy-…`.
  - **Result:** validator messages and Jump targets become ambiguous.
- **Screenshots:** `audit/screenshots/va-flow-canvas/53_copy_paste.png`
- **Recommendation:**
  - Auto-suffix names on paste and add ("Greet & Introduce (copy)", "Speak 2").
  - Paste at the cursor, or in the nearest free space.
  - Add "Duplicate with connections" (Ctrl+D) that keeps edges within the selection.
  - Generate fresh short ids instead of chaining "-copy-" segments.
  - Show step numbers on nodes (S1, Q2…).
  - Raise a validator warning for duplicate labels.

### F-FLOW-027 — Each node type has 3–4 different names across the palette, canvas, panel and toast
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-13
- **Pages:** /flow-builder
- **Evidence:**
  - The name changes from palette to canvas to panel:

    | Palette | Canvas default | Panel title |
    |---|---|---|
    | Knowledge Query | "Knowledge Lookup" | KNOWLEDGE |
    | CRM Lookup | "Live Lookup" | LIVE LOOKUP |
    | Book Meeting | "Schedule" | SCHEDULE NODE |
    | WhatsApp | "Send WhatsApp" | WHATSAPP NODE |
    | Human Handoff | "Transfer Call" | TRANSFER NODE |
    | Branch | "Condition Check" | CONDITION |

  - Canvas nodes carry no type word. In Flow A, a Speak node labelled "Transfer Call" sits next to the real Transfer node and looks like the same kind of step.
- **Screenshots:** `audit/screenshots/va-flow-config/26_panel_HumanHandoff.png`, `audit/screenshots/va-flow-config/26_panel_Branch.png`, `audit/screenshots/va-flow-config/25_panel_crm_lookup.png`
- **Recommendation:**
  - Keep one canonical name per type in a single node-type registry, used by the palette, node badge, panel title, toast, validator and docs. For example: "Transfer to human", "CRM lookup", "Book meeting", "Condition", "Knowledge lookup".
  - Put a small type badge (icon plus type word, at least 11 px on screen) on every node, so a custom label can't disguise its type.

### F-FLOW-028 — Template variables have no picker, and unknown variables are accepted without warning
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-12
- **Pages:** /flow-builder (Speak node)
- **Evidence:**
  - The only guidance is the helper text "Use {{lead_name}} and {{company_name}} for dynamic content".
  - Typing `{{` offers nothing.
  - `{{unknown_var}}` is accepted, shown on the canvas and not flagged by Validate.
- **Screenshots:** `audit/screenshots/va-flow-config/33_speak_variable_typing.png`, `audit/screenshots/va-flow-config/34_speak_unknown_var.png`
- **Recommendation:**
  - Add an "Insert variable" button and `{{` autocomplete listing lead fields, captured answers and CRM fields.
  - Show tokens as chips, and mark an unknown variable with an inline error and a validator error.
  - Under the message, preview the spoken line with sample values filled in.

---


### F-FLOW-029 — Unknown node types render as unstyled default boxes, and validation ignores them
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-19
- **Pages:** /flow-builder (Flow B)
- **Evidence:**
  - In Flow B, a step labelled "Call Ambulance" renders as React Flow's fallback `react-flow__node-default`. It is a plain white box of about 150x40 with 2 handles, and it has no type colour, no icon and no warning.
  - Validate on Flow B reports 7 errors, all about Question YES/NO wiring. None mentions this node.
  - It is unclear which type the step was meant to be (probably an action from AI draft; the auditor's open question 7). How the compiled prompt treats it was not checked.
- **Screenshots:** `audit/screenshots/va-flow-canvas/44_flow_airport.png`, `audit/screenshots/va-flow-canvas/46_airport_validate.png`
- **Recommendation:**
  - Register a fallback in `nodeTypes` that maps any type missing from the node-type registry to an "Unsupported step" component. Give it an amber warning border, the raw type string ("Unknown type: `<type>`"), one line of explanation and a "Convert to…" menu (Speak, Transfer, or another supported type).
  - Make the validator report it as an error: "Step 'X' uses an unsupported type".
  - On the server, check AI-draft output and Import JSON against the node-type schema before saving. Reject unknown types or convert them to a supported type.
  - Flag the step in Preview AI script as well.

### F-FLOW-030 — Integration dependencies aren't shown in node config (Calendar, email, WhatsApp, CRM connector)
- **Severity:** medium · **Confidence:** single-agent (the verifier separately confirmed the validator doesn't flag a Live Lookup with no connector)
- **Source findings:** FLOW-CONFIG-18
- **Pages:** /flow-builder (Schedule, WhatsApp and Live Lookup panels)
- **Evidence:**
  - **Live Lookup** (the palette's "CRM Lookup"):
    - The CONNECTOR select is empty, with the helper "No connectors yet — create one in Integrations → Live Lookup." and a "+ New connector" link, which is good. LOOKUP BY FIELD is disabled ("Pick a connector first").
    - The canvas shows "Pick a connector…", but Validate doesn't flag it.
    - The panel says that on `no_match` the agent says "I don't have that record", yet the node has a single output. There is no Found / Not found branch.
  - **Schedule** (the palette's "Book Meeting"):
    - SEND CONFIRMATION EMAIL and ADD TO GOOGLE CALENDAR default to on. Nothing shows whether Google Calendar is connected or where the caller's email address comes from.
    - AVAILABLE TIME SLOTS is free text ("Mon-Fri 9am-5pm, Sat 10am-2pm") rather than coming from a calendar.
    - The switches are amber, a colour the app doesn't otherwise use for "on".
    - Canvas chips read "30m / Phone / ✓ Confirm / ✓ Calendar".
  - **WhatsApp:** the TEMPLATE select offers Visit Confirmation, No-Answer Follow-up and Custom Message. There is no preview, no variable mapping and no approval or connection status. An empty template isn't flagged.
- **Screenshots:** `audit/screenshots/va-flow-config/25_panel_crm_lookup.png`, `audit/screenshots/va-flow-config/26_panel_BookMeeting_Schedule.png`, `audit/screenshots/va-flow-config/26_panel_WhatsApp.png`, `audit/screenshots/va-flow-config/23_after_add_crm.png`
- **Recommendation:**
  - At the top of each integration panel, add a status row that reads the same integration-status API as Settings: "Google Calendar · Connected" or "Not connected · Connect", with a deep link to the integration.
  - When an integration isn't connected, default its toggles to off and disable them, with the reason shown inline.
  - **Schedule:** show which variable provides the caller's email (for example `{{lead_email}}`) and warn when no such field exists. Replace free-text availability with the connected calendar's working hours, or a structured day and time picker.
  - **WhatsApp:** show a template preview with variable mapping and the approval status (Approved / Pending / Rejected).
  - **Live Lookup:** add Found and Not found outputs to match its no-match behaviour.
  - **Validator:** flag every unmet dependency (error when the node can't run, warning when a notification would silently fail), and run the same checks on the server at activation.
  - Use the standard "on" colour token for switches.

### F-FLOW-031 — AI draft is a single-line prompt, and it replaces the open flow without asking
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-19
- **Pages:** /flow-builder (AI draft drawer)
- **Evidence:**
  - "AI draft" ("Generate a flow with AI") opens a right-hand drawer containing a **single-line** input (maxlength 500). Its placeholder is cut off: "Describe your desired flow (e.g., Dental clinic appointment scheduling with SMS follow-up)...". Generate stays disabled until you type.
  - The drawer's note says generated nodes "replace the canvas as a private draft" and that generation "can take up to 90 seconds". There is no warning or confirmation, although the open flow is the autosaving active flow (F-FLOW-001).
  - About 85% of the drawer is empty: no example prompts and no options for language, agent or length.
  - Generated flows are stored with names like "Generated: <prompt text> ... (v2)", including a literal "..." (F-FLOW-012).
  - Generate wasn't clicked, so whether it overwrites the open flow or creates a new record is inferred from the note.
- **Screenshots:** `audit/screenshots/va-flow-config/44_ai_draft_dialog.png`
- **Recommendation:**
  - Use a multi-line textarea (6–10 rows, with a character counter) plus optional guided fields: goal, audience, language(s), agent voice, must-ask questions, handoff rule and whether to book meetings. Add 3–4 example-prompt chips.
  - Always generate into a **new draft flow**. Pre-fill an editable name from the prompt's summary, with no "...". If replacing is offered at all, make it an explicit choice ("Create new flow (recommended)" / "Replace current draft") and make it undoable.
  - During generation (up to 90 s), show a progress state with Cancel. When it finishes, open the new flow at fit view and run the validator.
  - Check the generated graph against the node-type schema on the server (F-FLOW-029).

### F-FLOW-032 — Flow Settings is missing core per-flow options, has no Done or save feedback, and doesn't explain its voice-verification numbers
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CONFIG-20, UX-AUDIT-18 (settings-drawer part)
- **Pages:** /flow-builder (Flow settings drawer)
- **Evidence:**
  - **Drawer:** 576 px wide, with the page blurred behind it. Sections:
    - *Flow identity:* NAME and DESCRIPTION.
    - *Soul.md · PER-FLOW:* a 6,000-character textarea with a markdown placeholder. Nothing explains what "Soul.md" is.
    - *Consented voice verification · OPTIONAL:* SPEECH WINDOW 8, MEDIUM SCORE 0.7 and HIGH SCORE 0.86, all with no unit or explanation. Also MEDIUM FALLBACK, LOW FALLBACK and FRAUD ACTION selects (the "Light confirmation" value is cut off), and checkboxes for Consent required, Liveness check and Fraud watchlist.
    - SENSITIVE ACTIONS is a raw, comma-separated list of tool names: "lookup_record, send_email, send_whatsapp".
  - **No Save, no Done, no feedback:** edits autosave straight into the active flow (UX-AUDIT-18 saw the same). A blank name is accepted (F-FLOW-015).
  - **Missing:** language, agent voice or persona (this lives in the Cockpit), calling hours, retries, max duration, category (the switcher shows CUSTOM, SCHEDULING and GENERAL, but you can't edit it), visibility and version notes.
- **Screenshots:** `audit/screenshots/va-flow-config/40_settings_dialog.png`, `audit/screenshots/va-flow-config/42_settings_voice_verification.png`, `audit/screenshots/va-ux-audit/28_flow_settings_drawer.png`
- **Recommendation:**
  - Split the drawer into sections:
    - **Identity:** name (required), description, category, visibility.
    - **Agent:** voice, language(s), and persona / Soul.md with a one-line "What is this?" helper.
    - **Call behaviour:** calling hours with a timezone, retries, max duration, voicemail handling.
    - **Security:** voice verification.
    - **Versions:** history and notes (F-FLOW-012).
  - **Thresholds:** state the unit for Speech window (the UI doesn't say whether 8 is seconds or turns). Show the two scores as one 0–1 range with labelled bands (≥ 0.86 verified, 0.70–0.86 light confirmation, below 0.70 the low fallback). Validate that Medium < High.
  - **Sensitive actions:** a checkbox list with plain labels ("Look up a customer record", "Send email", "Send WhatsApp").
  - Add a footer with the save state ("Saved · 12:04") and a Done button. Widen the selects so their values aren't cut off.

### F-FLOW-033 — Node panels show developer internals, and their 9–10 px low-contrast mono labels fail AA
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-14
- **Pages:** /flow-builder (all node panels)
- **Evidence:**
  - **Internal data:** every panel shows a read-only "ID: node_1790420834378" and "Position: x=332, y=330".
  - **Developer jargon in the copy:** "search_knowledge_base" and "materialized" (FAQ); "no embeddings" and `no_match` (Live Lookup); "E.164" (Transfer); "Soul.md"; and the raw tool list "lookup_record, send_email, send_whatsapp".
  - **File names:** knowledge-file options keep their storage timestamp prefix (`1789987752864-<name>.pdf`).
  - **Cut-off placeholders:** Verify Customer shows "e.g., Loan Book (which uploaded doc/t…" and "e.g., loan_account (blank = name + ph…".
  - **Typography:** field labels are 10 px and helper, ID and position text is 9 px, all JetBrains Mono uppercase in #7A8397. That is 3.8:1 on white and 3.58:1 on #F7F8FB, below the 4.5:1 AA minimum for text this small.
- **Screenshots:** `audit/screenshots/va-flow-config/26_panel_FAQ.png`, `audit/screenshots/va-flow-config/26_panel_KnowledgeQuery.png`, `audit/screenshots/va-flow-config/25_panel_crm_lookup.png`, `audit/screenshots/va-flow-config/26_panel_VerifyCustomer.png`, `audit/screenshots/va-flow-config/26_panel_HumanHandoff.png`, `audit/screenshots/va-flow-config/11_node_speak.png`
- **Recommendation:**
  - Take ID and Position out of the default view. Put them in a collapsed "Advanced" section with a copy-ID button.
  - Rewrite helper copy in operator language:
    - Transfer: "Include the country code, e.g. +91 followed by the number".
    - FAQ: "The agent looks these answers up when a caller asks".
    - Live Lookup: "If no record matches, the agent says so and never guesses".
  - Show knowledge files by their original name plus upload date.
  - Use 12–13 px sentence-case sans labels at weight 500 in a colour of at least 4.5:1, for example #475569 (7.58:1 on white, 7.14:1 on #F7F8FB). Use 12 px #5B6478 (5.59:1) for helper text. Keep mono only for ids, variables and code.
  - Keep placeholders short and move examples into helper text so nothing is cut off.

### F-FLOW-034 — Full-screen hides the toolbar and minimap, has no visible exit, and keeps the wallet banner
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-21, FLOW-CONFIG-22
- **Pages:** /flow-builder (full-screen canvas, F)
- **Evidence:**
  - F grows the canvas from 1043x651 to 1342x832.
  - It hides the header, the whole toolbar (Save, status chip, Validate), the palette and the minimap.
  - There is no visible exit control. Only F again or Esc gets you out.
  - The 42 px wallet banner stays.
  - While full-screen, you can't see save state or validation at all, even though every edit autosaves to the live flow (F-FLOW-001).
- **Screenshots:** `audit/screenshots/va-flow-canvas/39_fullscreen_canvas.png`, `audit/screenshots/va-flow-config/60_fullscreen.png`
- **Recommendation:**
  - In full-screen, show a compact floating bar in the top-right with: status chip, issue count / Validate, Undo/Redo, and an "Exit full screen (F / Esc)" button.
  - Keep the minimap and canvas controls.
  - Hide global banners, or call the Fullscreen API on the canvas container.
  - Set `aria-pressed` on the toolbar toggle to reflect the state.

### F-FLOW-035 — Palette: a fake "+ 10" button, repeated groups and truncated labels
- **Severity:** low (DESIGN-RESEARCH-04 and VISUAL-AUDIT-10 rated their combined findings medium; their node-overlap parts are in F-FLOW-009 and F-FLOW-021) · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-23, FLOW-CONFIG-23 ("+ 10" part), FLOW-CONFIG-24, DESIGN-RESEARCH-04 (palette part), VISUAL-AUDIT-10 (palette part), UX-AUDIT-18 (palette part)
- **Pages:** /flow-builder (palette)
- **Evidence:**
  - **"+ 10":** an 85x32 pill with a saffron border and fill and a plus icon. It is actually an inert `<span>` count (`cursor: auto`), not a button.
  - **Repeated groups:** START HERE (8 tiles) repeats types from CONVERSATION, ACTIONS and KNOWLEDGE & CRM, so the same types appear up to 3 times once RECENTLY USED shows up. FAQ and Verify Customer are missing from START HERE. RECENTLY USED appears after the first add and pushes the groups down.
  - **Truncation at 1440 px:**
    - 5–7 of the 13 visible tile labels are cut off: "Knowle…", "CRM Lo…", "Book Me…", "WhatsA…", "Human …", "Human Han…", "Verify Cu…".
    - The text is 10–11 px in about 59–65 px of label width, in a 2-column grid of 112–119 px tiles.
    - FLOW-CANVAS counted 5; FLOW-CONFIG, VISUAL-AUDIT and DESIGN-RESEARCH counted 7. The difference depends on which groups were expanded.
  - **No descriptions:** tiles have no descriptions or tooltips beyond the name.
  - **Working well:** search matches synonyms and has a clear empty state.
- **Screenshots:** `audit/screenshots/va-flow-config/31_palette_expanded.png`, `audit/screenshots/va-ux-audit/crop_flow_palette_truncation.png`, `audit/screenshots/va-flow-canvas/42_palette_search.png`, `audit/screenshots/va-flow-config/61_palette_search_noresult.png`, `audit/screenshots/scout_flow-builder.png`
- **Recommendation:**
  - Use a single-column list in the 288 px panel. Each row has a 20 px icon, the full name at 13–14 px and a one-line 12 px description.
  - List each type exactly once, grouped by purpose (Conversation / Actions / Knowledge & CRM).
  - Show "Recently used" as a fixed-height row of up to 4 icons above the groups, so the list doesn't jump.
  - Replace "+ 10" with muted text ("10 step types"), or make it a real "Browse all steps" button.
  - Make rows draggable onto the canvas (F-FLOW-009).

### F-FLOW-036 — Node colours, edge labels and selection styling change across themes and node types
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-26, VISUAL-AUDIT-10 (unthemed edge-label part)
- **Pages:** /flow-builder (light and dark)
- **Evidence:**
  - **Speak colour:** Speak titles are blue #2F5FE0 in light mode and purple #7C6BF5 in dark mode (4.23:1 on #1A1D26), and Save shifts from blue to purple too. A type's colour isn't stable across themes.
  - **Edge label:** the "Not Interested" label stays a white box with black text in dark mode (both agents saw this).
  - **Theme wiring:** the React Flow root keeps the class `light` in dark mode, so `colorMode` isn't connected.
  - **Borders and selection:**
    - Question and Condition nodes have dashed borders, which nothing explains.
    - Selection shows as a dark 1.6 px border (dashed or solid), so it is weak on the dashed nodes.
  - **"Canvas" header dot:** it is green and looks like a "live" indicator, but it means nothing.
- **Screenshots:** `audit/screenshots/va-flow-canvas/52_dark_mode.png`, `audit/screenshots/va-visual-audit/dark_flow-builder.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`
- **Recommendation:**
  - Define a colour token per node type (`--node-speak`, `--node-question`, …) with a fixed hue and light and dark values that each reach at least 4.5:1 for text.
  - Pass `colorMode={theme}` to `<ReactFlow>`, and theme edge labels through `--edge-label-bg` and `--edge-label-fg`.
  - Give every node a solid border, and reserve dashed borders for disabled or unreachable steps.
  - Show selection as a 2 px accent ring plus shadow on every node type, distinct from the focus ring (F-FLOW-006).
  - Remove the green dot, or give it a meaning (for example "Live" on the active flow, F-FLOW-014).

### F-FLOW-037 — On load, the default template flashes up marked "FLOW VALIDATED" before the saved flow appears
- **Severity:** low · **Confidence:** multi-agent (the verifier also saw it while checking FLOW-CANVAS-03)
- **Source findings:** FLOW-CANVAS-27, FLOW-CONFIG-25
- **Pages:** /flow-builder (initial load)
- **Evidence:**
  - About 3 s after navigation on a first load, the header read "Choose a flow to edit". The canvas meanwhile showed the generic 8-node template ("Hello! This is Vaani Labs calling on behalf of your company…") with "8 nodes / 8 links" and the "FLOW VALIDATED" badge. Flow A then replaced it.
  - On later loads the canvas stayed empty for about 2.6 s (0 nodes, no flow selected), and Flow A's 26 nodes appeared at about 4.7 s.
- **Screenshots:** `audit/screenshots/va-flow-canvas/10_default.png`, `audit/screenshots/va-flow-config/20_fb_load.png`, `audit/screenshots/va-flow-config/21_load_1s.png`, `audit/screenshots/va-verify-flow-canvas/09_load_3s.png`
- **Recommendation:**
  - Until `/api/auth/me` and `/api/flows` resolve and the target flow id is known, show a skeleton for the header and canvas with placeholder node shapes.
  - Show the default template only when the account has no flows at all, and then as an empty state with "Create your first flow".
  - Keep editing and autosave off until hydration finishes (F-FLOW-002).
  - Put the flow id in the URL (`/flow-builder/:id`) so the canvas can fetch the flow without waiting for `/api/auth/me`, which cuts the roughly 4.7 s time-to-canvas.


---

**Section totals:** 37 consolidated findings (1 critical, 12 high, 20 medium, 4 low), merged from 56 owned source findings. The verifier refuted none.

### Refuted / not reproduced

The verifier didn't refute any owned finding. The sub-claims below were corrected, not reproduced or left unproven. The findings above either leave them out or mark them as inferred.

| Source | Claim | Verifier result |
|---|---|---|
| FLOW-CANVAS-01, FLOW-CONFIG-01 | Autosaved edits reach live calls; opening a stale tab overwrites a teammate's edits | Still inferred, because writes were blocked. The load-time PUT was confirmed to carry identical content, so it doesn't corrupt data. Only `updated_at` is bumped. |
| FLOW-CANVAS-03, FLOW-CONFIG-04 | Broken flows can go live through ACTIVATE | Confirmed that ACTIVATE stays enabled while errors exist. Whether it validates on the server is unknown, because it wasn't clicked. |
| FLOW-CANVAS-04, FLOW-CONFIG-05 | The orphan "Knowledge Lookup" in the live flow was created by a palette click | Can't be verified. |
| FLOW-CONFIG-05 | A new node renders underneath the selected node | Not re-tested (the stacking of successive adds was confirmed). |
| FLOW-CANVAS-08 | After Jump, the target node is hidden under the errors panel | Overstated: the node overlaps the panel's edge by only about 7 px. |
| FLOW-CONFIG-06 | "(vN)" flows are unlinked copies | Corrected: the API stores `version_no` and `parent_flow_id`. The UI hides the lineage, and the lineage data is inconsistent. |
| FLOW-CONFIG-06, FLOW-CANVAS-09 | The switcher's sort order is arbitrary | Corrected: it is `created_at` descending, a column the modal doesn't show. |
| FLOW-CANVAS-09 | Recorded viewport values on flow switch (scale 0.423 → 0.383) | The carry-over itself was confirmed, with different values (scale 0.7119, then 1). F-FLOW-012 uses the verifier's values. |
| FLOW-CONFIG-03 | The chip sometimes switches to "Autosave failed" | Not reproduced: the verifier only ever saw "Up to date". |
| FLOW-CONFIG-04 | A validator error names a node by its raw id | Not re-tested by the verifier. It rests on a single-agent observation (`va-flow-config/30_validate_after_edits.png`). |
| FLOW-CONFIG (strengths) | Nodes carry descriptive aria-labels | Contradicted: the verifier found no `aria-label` on the focusable node element (F-FLOW-006). |

---

## 3D. Findings — Responsive behaviour

**Test conditions.** Pages were measured at 1920x1080, 1440x900, 1280x800 and 1024x768 (desktop, mouse), 768x1024 (tablet, touch), and 390x844 and 360x780 (phone, touch). Width sweeps down to 320px pinned exact break widths (RESPONSIVE-A, RESPONSIVE-B). Two extra checks: a 720x450 approximation of 200% zoom on a 1440x900 screen (A11Y-MANUAL), and 390x844 checks of the marketing site (PUBLIC-SITE). Screenshots are 1x. Where a finding says iOS zoom-on-focus, safe-area overlap or touch-pan behaviour, that was inferred and not tested on a real device.

**What already works.**
- No app page overflows at document level at any tested width: `documentElement.scrollWidth == innerWidth` in more than 42 page x width combinations.
- The shell has one clean `md` (768) breakpoint.
- /billing and /login reflow cleanly from 1920 down to 360.
- Flow Builder has a real phone mode.
- The Leads drawer becomes a full-screen panel on phones.

Every overflow we found sits inside an inner `overflow-y-auto` scroller. That is why several controls below are technically "reachable by panning sideways" but are effectively invisible on touch devices, where scrollbars are hidden overlays.

### Page x breakpoint matrix

Key:
- **OK:** no defect recorded.
- **minor:** a cosmetic defect or reduced efficiency; the task still completes normally.
- **broken:** a primary control, data column, panel or destination is cut off, overlapped or removed, or can only be reached by panning sideways inside an inner scroller or by typing a URL.

| Page | 1920 | 1440 | 1280 | 1024 | 768 | 390 | 360 | Findings |
|---|---|---|---|---|---|---|---|---|
| App shell (rail / bottom bar) | minor | minor | **broken**¹ | **broken**¹ | minor | **broken** | **broken** | F-RWD-001, F-RWD-005 |
| Wallet banner (all app pages) | OK | OK | OK | OK | OK | minor | minor | F-RWD-013 |
| /dashboard (Agent Cockpit) | minor | minor | minor | **broken**¹ | **broken** | **broken** | **broken** | F-RWD-002 |
| /assistant | minor | OK | OK | OK | OK | minor | minor | F-RWD-015 |
| /flow-builder | minor | minor | minor | minor | **broken** | minor | minor | F-RWD-003, F-RWD-014 |
| /meeting-agent | minor | OK | OK | OK | minor | **broken** | **broken** | F-RWD-006 |
| /personal-agents | OK | OK | OK | OK | minor | **broken** | **broken** | F-RWD-007 |
| /billing | OK | OK | OK | OK | OK | OK | OK | banner only |
| /analytics | OK | OK | OK | minor | minor | **broken** | **broken** | F-RWD-008 |
| /leads | minor | minor | minor | minor | minor | **broken** | **broken** | F-RWD-011, F-RWD-012 |
| /call-reports | minor | minor | minor | minor | minor | **broken** | **broken** | F-RWD-004, F-RWD-009, F-RWD-010 |
| /knowledge | minor | OK | OK | minor | **broken** | **broken** | **broken** | F-RWD-016 |
| /settings | minor | OK | OK | minor | OK | **broken**² | **broken**² | F-RWD-001 |
| /login (signed out) | OK | OK | OK | OK | OK | minor | minor | F-RWD-018 |
| / (marketing home) | OK | OK | OK | minor | **broken** | minor | minor | F-RWD-017, F-RWD-018 |
| /onboarding | — | minor | — | — | — | — | — | F-RWD-019 |

¹ Depends on viewport height. The 1280 and 1024 columns were tested at 1280x800 and 1024x768. At 768px tall or less, the rail hides Billing, Knowledge and Settings, and the Cockpit's centre stack collides with the Transcript panel. At 1440x900 only Settings is cut, and only by half.
² Settings cannot be reached from the phone navigation at all. Its sub-nav also becomes a 2,300px horizontal strip (RESPONSIVE-B-13, reported in another section).
"—" means not tested. /rep-console was not included in the breakpoint sweeps.

**Recurring causes.** Fixing each cause once fixes several findings.
1. **Flex rows that do not wrap and lack `min-width:0`, inside inner scrollers.** Affects the Meeting Agent column (F-RWD-006), Personal Agents header (F-RWD-007), Analytics header (F-RWD-008), Knowledge header (F-RWD-016) and Flow Builder toolbar (F-RWD-003).
2. **Content hidden at a breakpoint (`hidden md:*` / `hidden lg:*`) with nothing to replace it.** Affects Cockpit Customer Intel, flow and session status (F-RWD-002), Leads Status and Interest (F-RWD-011), and the phone navigation destinations (F-RWD-001).
3. **`h-screen` shells where the title, KPIs and filters never scroll away**, leaving a small inner data window. Affects Call Reports (F-RWD-004), Assistant (F-RWD-015) and the Cockpit on short viewports (F-RWD-002).
4. **Layout decided once at load instead of reacting to resize.** Affects the Flow Builder toolbar mode and React Flow `fitView` (F-RWD-003, F-RWD-014).

---

### F-RWD-001 — Phone and 200%-zoom navigation reaches only 6 of 12 sections, and sign-out ("Exit") takes a primary tab
- **Severity:** high · **Confidence:** verified
- **Source findings:** EXPLORE-CORE-06, EXPLORE-SETTINGS-08, A11Y-MANUAL-12 (navigation part), EXPLORE-DATA-16 (navigation part), A11Y-AUTO-23
- **Pages:** every authenticated route at 767px wide or less (tested at 390, 360 and 320), and at 720x450 (200% zoom of 1440x900)
- **Evidence:**
  - At 767px and below, the 72px rail (`aside.fixed`) is `display:none`. The only navigation left is `nav.fixed.bottom-0` (56px tall, z-50), with 7 items of 51–56x55px and 11px labels:
    - Assistant
    - Agent (/dashboard)
    - Leads
    - Reports (/call-reports)
    - Billing
    - Knowledge
    - Exit (the sign-out submit button)
  - Nothing on the page links to /analytics, /flow-builder, /meeting-agent, /personal-agents, /rep-console or /settings.
  - There is no hamburger or "More" control. A search of aria-label and title for menu, navigation, drawer or expand found nothing.
  - The verifier re-checked at 720x450: the only visible nav links are the same 6 routes plus Exit.
  - Settings (profile, calling number, API keys, security, delete account) can therefore only be reached by typing its URL. /api-keys has no back link on phones.
  - Exit sits 0px from Knowledge and has no aria-label. No confirmation step was observed (the button was not clicked).
  - No tab has `aria-current`. On /analytics or /settings, no tab is highlighted at all.
  - The bar has no `env(safe-area-inset-bottom)` padding.
  - At 720x450, the banner (42px) and the bar (56px) together take 98 of 450px, which is 22% of the height.
  - The same defect is recorded as RESPONSIVE-A-01 and RESPONSIVE-B-01. Both responsive auditors rated it critical. It is reported in the navigation section.
- **Screenshots:** audit/screenshots/va-responsive-a/dashboard_390.png, audit/screenshots/va-responsive-a/billing_390.png, audit/screenshots/va-responsive-b/analytics_390.png, audit/screenshots/va-responsive-b/settings_390.png, audit/screenshots/va-explore-core/dashboard_mobile.png, audit/screenshots/va-explore-settings/c21_mobile_settings.png, audit/screenshots/va-a11y-auto/reflow320-dashboard.png, audit/screenshots/va-a11y-auto/mobile390-leads.png, audit/screenshots/va-verify-a11y-manual/72-zoom200-dashboard.png
- **Recommendation:**
  - Replace the 7-item bar with 4 primary tabs (Agent, Leads, Reports, Assistant) plus a "More" tab.
  - "More" opens a full-height bottom sheet that lists every other destination, grouped as in the desktop rail: Knowledge, Billing, Analytics, Flow Builder, Meeting Agent, Personal Agents, Rep Console and Settings.
  - End the sheet with an account block that holds "Sign out", visually separated and behind a confirm dialog.
  - Set `aria-current="page"` on the active tab, and highlight "More" when the current route lives inside it.
  - Label the landmark (`aria-label="Primary"`) and add `padding-bottom: env(safe-area-inset-bottom)`.
  - Render sheets and drawers above the bar (z-index above 50).
  - If some sections are meant to be desktop-only, still list them in the sheet with a "Best on desktop" note instead of hiding them.

### F-RWD-002 — Agent Cockpit removes Customer Intel, flow and session status at narrower widths, and its fixed-height stack overlaps controls on short viewports with no way to scroll
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-12 (Cockpit part), RESPONSIVE-A-04, EXPLORE-CORE-22, EXPLORE-CORE-06 (Cockpit part)
- **Pages:** /dashboard
- **Evidence:**
  - **Panels removed (verified):**
    - The Customer Intel panel shows at 1024x768 and is gone at 1023. No toggle, tab or drawer brings it back.
    - SESSION status also disappears below 1024.
    - The FLOW label and selector show at 768 and are gone at 767.
    - At 390 the header shows only IDLE and 00:00. The only controls are Vaani, Vikash, the phone input, Test Call and CONNECT, so an operator can place a call without seeing which flow or customer context is loaded.
    - At 720x450 the Intel text is still in the DOM but hidden.
  - **Collisions on short viewports:**
    - At 1024x768, CONNECT (126x39, y≈493–531) straddles the Transcript Feed header (y≈513–515), and the page header clips the top of the orb.
    - At 1100x700, CONNECT (y 480–519) sits entirely inside the transcript panel, whose header is at y=458. At 1100x800 nothing overlaps.
    - At 720x450 (verified): the Transcript Feed overlaps the phone field and Test Call, and CONNECT covers "Awaiting connection…".
    - At 720x450, `main` has scrollHeight = clientHeight = 450 and the document is 450px, so the overlapped controls cannot be scrolled clear. This fails WCAG 1.4.10 (Reflow).
  - **Cause:** the centre stack has a fixed height (312px orb, STANDBY, toggle, input, CONNECT), and the transcript panel takes a fixed share, all inside a non-scrolling `h-screen` shell. The collision is also recorded as RESPONSIVE-A-05 in another section.
  - **Severity basis:** A11Y-MANUAL-12 was verified as high because of the overlap under zoom. The panel-removal part (RESPONSIVE-A-04) was verified but lowered to medium on its own, because calling still works.
- **Screenshots:** audit/screenshots/va-verify-a11y-manual/72-zoom200-dashboard.png, audit/screenshots/va-explore-core/dashboard_1024x768.png, audit/screenshots/va-responsive-a/dashboard_1100x700.png, audit/screenshots/va-verify-responsive-a/dashboard_768.png, audit/screenshots/va-verify-responsive-a/dashboard_767.png, audit/screenshots/va-verify-responsive-a/dashboard_390.png
- **Recommendation:**
  - Rebuild the centre column as a flex column (`display:flex; flex-direction:column`):
    - size the orb with `height: clamp(120px, 30vh, 312px)`;
    - keep the controls in normal flow;
    - give the transcript `flex:1; min-height:0; overflow-y:auto`.
  - Give `main` `overflow-y:auto`, so a short viewport scrolls instead of overlapping.
  - Below 1024, show Call, Customer and Transcript as segmented tabs, or make Customer a collapsible section. Keep the Intel form mounted; never remove it.
  - At every width, show the selected flow as a compact tappable chip next to the title, plus a one-word session state (IDLE or LIVE).
  - Add 720x450, 1024x768 and 320x640 to visual regression tests.

### F-RWD-003 — Flow Builder toolbar clips ACTIVATE off-screen between 768 and 877px, and nothing else reaches it
- **Severity:** high · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-08
- **Pages:** /flow-builder
- **Evidence:**
  - Between 1000 and 768px wide, the toolbar keeps a fixed geometry. At every width in that range, Save sits at x=680–763 and ACTIVATE at x=771–876.
  - The clipping ancestor `div.flex.min-h-0.flex-1.flex-col.overflow-hidden` has `overflow-x:hidden` (scrollWidth 804 vs clientWidth 728 at 800), so the user cannot scroll to the button.
  - ACTIVATE is fully visible at 878px and wider, partly clipped at 860, and fully hidden at 800 and 768 (verified).
  - At 1000px and below, AI draft and Settings shrink to 39x40 icon buttons.
  - The "More actions" menu holds only Export JSON, Import JSON, New flow and Reset to default. It has no Activate.
  - The affected range covers common iPad portrait widths: 768, 810, 820 and 834.
  - Verifier side note: after a live resize to 767, the phone toolbar did not appear, and ACTIVATE (x 699–804) stayed clipped. The phone layout only applies on a fresh load.
- **Screenshots:** audit/screenshots/va-verify-responsive-a/flow-builder_768.png, audit/screenshots/va-verify-responsive-a/flow-builder_860.png, audit/screenshots/va-verify-responsive-a/flow-builder_800_moremenu.png, audit/screenshots/va-responsive-a/flow-builder_768.png
- **Recommendation:**
  - Put Save and ACTIVATE in their own right-aligned group with `flex-shrink:0` (e.g. `ml-auto shrink-0`).
  - Let the left group shrink (`min-width:0; overflow:hidden`), or move copy, paste, validate, preview, full-screen and shortcuts into the "…" menu below 1024. The phone layout already does this.
  - Add Activate and Save to the overflow menu as a fallback.
  - Drive the switch between desktop, tablet and phone toolbars from CSS breakpoints or a `matchMedia` change listener, not a check at load.

### F-RWD-004 — Call Reports leaves a 255–337px strip for data on phones, and call details open inside that strip
- **Severity:** high · **Confidence:** verified
- **Source findings:** RESPONSIVE-B-06
- **Pages:** /call-reports
- **Evidence:**
  - The title, Refresh/Export CSV, the four KPI cards (2x2), the search and the sentiment filters all sit outside the table's scroller and never scroll away. At 360x780 they take about 460px.
  - Table viewport (verified): top at 443px with clientHeight 337 at 390x844, and top at 461px with clientHeight 255 at 360x780.
  - Rows are 63px tall, so about 3 are visible at a time.
  - Tapping a row at 360 opens the `w-full sm:w-96 … overflow-y-auto` details pane in the same slot: top 461, height 255, `position:static`, scrollHeight 1027.
  - That pane holds Call Details, Analysis, Recording and Transcript, so the transcript is read through a 255px window.
  - A sweep at 800px viewport height gives a 491px data window at 768 wide and above, but only 283px at 560 and below.
  - On desktop the same pane is a sensible 384px right-hand column.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/callreports_360.png, audit/screenshots/va-verify-responsive-b/callreports_360_detail.png, audit/screenshots/va-responsive-b/callreports_390.png, audit/screenshots/va-responsive-b/callreports_360_detail_scrolled.png
- **Recommendation:**
  - Below 768, make the page one scroller: the header and KPIs scroll away, and only search and filters stay `position:sticky`.
  - Collapse the KPIs into one summary row that scrolls horizontally.
  - Open call details as a full-screen sheet (`fixed inset-0`, above the tab bar) with its own header, a close button and sticky Recording controls.
  - Reuse the Leads drawer for this; it already goes full-screen at 390.

### F-RWD-005 — Desktop rail hides Billing, Knowledge and Settings at common laptop heights, and draws a stray horizontal scrollbar
- **Severity:** high · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-04
- **Pages:** every authenticated route at 768px wide or more, when the viewport is under about 925px tall
- **Evidence:**
  - The rail `nav` content is 572px tall (12 items at a 48px pitch), and a stacked footer (status dot, latency, Sign Out, theme, Expand) reserves about 250px.
  - Visible nav height (clientHeight) by viewport:

    | Viewport | clientHeight | What is hidden |
    |---|---|---|
    | 1440x900 | 548px | Settings half cut |
    | 1280x800 | 448px | Billing, Knowledge, Settings |
    | 1366x768 and 1024x768 | 416px (156px overflow) | Call Reports partly; Billing, Knowledge, Settings |
    | 1280x720 | ≈368px | 5 of 12 items (only 7 fully visible) |
    | 844x390 (landscape phone) | 38px | everything except Assistant |

  - Expanding the rail to 240px at 1024x768 still leaves Settings below the fold.
  - On /billing at 1024x768, the active item is scrolled out of view.
  - The nav is `overflow:auto` on both axes. Its clipped hover tooltips give it scrollWidth 175 against clientWidth 44, so Windows draws a ◀▶ scrollbar over the lower icons at every desktop width.
  - Three agents measured the same numbers. The issue is also recorded as RESPONSIVE-A-07 and RESPONSIVE-B-02 (height) and as RESPONSIVE-A-06 and RESPONSIVE-B-03 (tooltips and scrollbar), in the navigation section.
- **Screenshots:** audit/screenshots/va-explore-core/live_dashboard.png, audit/screenshots/va-explore-core/dashboard_1366x768.png, audit/screenshots/va-explore-core/dashboard_1024x768.png, audit/screenshots/va-responsive-b/analytics_1280.png, audit/screenshots/va-responsive-b/sidebar_expanded_1024.png, audit/screenshots/va-responsive-b/leads_landscape_844x390.png, audit/screenshots/va-responsive-a/billing_1024.png
- **Recommendation:**
  - Collapse the footer into one avatar/account button whose menu holds status, latency, theme and sign-out. This frees about 200px.
  - Reduce the item pitch to 40px under `(max-height: 800px)`.
  - Set `overflow-x:hidden` on the nav and render tooltips in a portal, so they no longer widen it.
  - After load, call `scrollIntoView({block:'nearest'})` on the active item.
  - Make sure all 12 items fit at 680px of viewport height; test at 1366x768 and 1280x720.
  - Below about 600px of height, use the phone bottom-bar and "More" pattern even when the width is 768 or more.

---


### F-RWD-006 — Meeting Agent content is wider than the screen below 513px, so Create Room, the session-mode switch and the room controls are cut off or overlap
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-02
- **Pages:** /meeting-agent
- **Evidence:**
  - The layout breaks at 512px and below. At 500 the scroller has sw = cw = 500; at 480 it has sw 489 > cw 480.
  - At 390:
    - the `div.lg:col-span-2` column spans l=24 to r=489 (465px wide);
    - the scroller `div.flex-1.overflow-y-auto` has sw 489 vs cw 380;
    - the document itself does not overflow.
  - The overflow is 99px at 390, 105px at 375 and 129px at 360.
  - **Cause:** five past-meeting URL anchors are `white-space:nowrap` at 274px each, and their titles are 202px. None has `min-w-0` or truncation, so together they set the column's minimum width. The active-room URL *is* truncated (78px with an ellipsis).
  - Measured at 390:
    - "Conversation flow" segment: l=257 to r=464;
    - Create Room: r=465;
    - Refresh: r=465;
    - room buttons all on one line: Agent 177–247, Intel 255–324, Record 332–408, Delete room 416–448.
  - What the user sees at 390:
    - Agent is drawn over the "Open" and "1 participant" labels;
    - Record is cut and Delete room is off-screen;
    - the title wraps to 3 lines ("Meeting / Agent — / Vikash") because the "Free minutes" pill shares its row.
  - **Why medium, not high:** the controls can be reached by scrolling sideways, and on a phone the page can only be opened by URL (F-RWD-001).
- **Screenshots:** audit/screenshots/va-verify-responsive-a/meeting-agent_390.png, audit/screenshots/va-verify-responsive-a/meeting-agent_390_rooms.png, audit/screenshots/va-responsive-a/meeting-agent_360.png, audit/screenshots/va-responsive-a/meeting-agent_360_rooms.png, audit/screenshots/va-explore-core/meeting_agent_mobile.png
- **Recommendation:**
  - Add `min-width:0` (`min-w-0`) to the grid column and to the flex items in each row.
  - Truncate every meeting URL (`truncate` plus a Copy button), or let it wrap with `overflow-wrap:anywhere`.
  - Below 640:
    - stack the room metadata above the room actions;
    - lay the actions out as a full-width 2x2 grid of 44px buttons;
    - keep Delete room at least 8px from its neighbours, or move it into an overflow menu with a confirmation step;
    - move the "Free minutes" pill below the title.
  - Add `overflow-x:clip` to the page scroller as a safety net.

### F-RWD-007 — Personal Agents header never wraps, so "New task" (the page's only primary button) is pushed off-screen on phones
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-03
- **Pages:** /personal-agents
- **Evidence:**
  - The header row is `flex-wrap:nowrap`.
  - At 390:
    - NEW TASK spans l=362 to r=438 and is 77x50 (its label wraps to 2 lines);
    - `main.overflow-y-auto` has sw 438 vs cw 380;
    - SETTINGS spans 143–248 and REFRESH spans 256–354;
    - the h1 wraps to "Personal / Agents" (107px wide), and the description runs to about 14 narrow lines;
    - only the blue "+" edge of the button shows at the right edge.
  - The button's right edge passes the viewport below about 440px. From 768 down, its label already wraps to 2 lines.
  - The empty-state text "Click New task" is a plain SPAN with no click handler, so it cannot stand in for the button.
  - **Why medium, not high:** the button can be reached by scrolling `main` sideways, and on phones the page can only be opened by URL.
- **Screenshots:** audit/screenshots/va-verify-responsive-a/personal-agents_390.png, audit/screenshots/va-verify-responsive-a/personal-agents_390_bottom.png, audit/screenshots/va-responsive-a/personal-agents_360.png, audit/screenshots/va-responsive-a/personal-agents_768.png
- **Recommendation:**
  - Make the header `flex-wrap:wrap` (or `flex-col` below `md`), with the actions on their own row.
  - Keep button labels on one line with `white-space:nowrap`, and let the container wrap instead.
  - On phones, show "New task" either as a full-width button or as a FAB positioned at `bottom: calc(56px + 16px + env(safe-area-inset-bottom))`.
  - Make the "New task" link in the empty state a real `<button>` that opens the same dialog.

### F-RWD-008 — Analytics header actions push the whole page sideways below about 543px
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-B-04, EXPLORE-DATA-16 (Analytics part)
- **Pages:** /analytics
- **Evidence:**
  - The header action group ("UPDATED hh:mm · REFRESH · CSV · EXPORT PDF", about 357px) does not wrap and cannot shrink.
  - Its buttons sit at fixed x positions: Refresh 257–360, CSV 368–439, Export PDF 447–543.
  - Because of this, the main scroller (`div.relative.flex.flex-1.min-h-0.flex-col.overflow-y-auto`) has scrollWidth 543 at every width of 560 or less.
  - Measured overflow:

    | Width | Overflow |
    |---|---|
    | 560 and 552 | none |
    | 540 | 3px |
    | 390 | 153px |
    | 360 | 193px (max scrollLeft 193.6) |

  - All page content pans sideways, and CSV and Export PDF start off-screen. The document itself does not overflow.
  - Related, also at 360: the KPI cards clip their content (cw 156 vs sw 160–163). Sentiment-chart tick labels render 4.8px tall at 390 (RESPONSIVE-B-15, reported in another section).
- **Screenshots:** audit/screenshots/va-verify-responsive-b/analytics_390.png, audit/screenshots/va-verify-responsive-b/analytics_360_hscrolled.png, audit/screenshots/va-explore-data/r2_m_analytics.png
- **Recommendation:**
  - Below `sm`, move CSV and Export PDF into a "⋯" menu. Keep Refresh as an icon button with an `aria-label`.
  - Move "Updated hh:mm" under the title.
  - Give the header `flex-wrap:wrap` and `min-width:0`.
  - Add `overflow-x:clip` to the page scroller so one wide child can never pan the whole page again.

### F-RWD-009 — Call Reports search shrinks to 52px on phones, and the sentiment pills run off-screen at 360
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-B-07, EXPLORE-DATA-16 (Call Reports part)
- **Pages:** /call-reports
- **Evidence:**
  - Search input width by viewport:

    | Width | Search input |
    |---|---|
    | 1024 | 600px |
    | 768 | 344px |
    | 560 | 224px |
    | 430 | 94px |
    | 390 | 54px |
    | 360 | 52px |

  - The placeholder ("Search transcripts, summaries…") shows the icon plus one letter at 390, and only the icon at 360.
  - At 360 the Neutral pill spans x 304–372, so it runs 12px past the screen edge and its label is visibly clipped. It fits at 390 (right edge 374).
  - The input can still be tapped and typed into.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/callreports_390.png, audit/screenshots/va-verify-responsive-b/callreports_360.png, audit/screenshots/va-explore-data/r2_m_callreports.png
- **Recommendation:**
  - Below `sm`, put search on its own full-width row (`flex: 1 1 100%; min-width: 12rem`) above the sentiment filter.
  - Make the filter either a segmented control or a horizontally scrolling chip row with an edge fade (`mask-image`) and `scroll-snap-type:x`.
  - Shorten the placeholder to "Search calls".

### F-RWD-010 — Call Reports table has no mobile or tablet layout (18 columns, 2,617px wide)
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** RESPONSIVE-B-05
- **Pages:** /call-reports
- **Evidence:**
  - The page uses a real `<table>` with 18 columns and a width of 2,617px at every width once loaded.
  - Its wrapper (`flex-1 overflow-auto`) is 1838px wide at 1920, 1358 at 1440 and 390 at 390, so the table scrolls sideways at every width, even 1920.
  - At 390 only Type, To and Started are fully visible. Sentiment and Summary, the columns users need, are 6th and 7th.
  - `thead` is sticky, but the first `th` and `td` are `position:static`, so no column stays frozen while scrolling sideways.
  - Type shows "BROWSER" on every row.
  - In the first 30 rows, 287 of the 330 extracted-field cells (87%) are "—".
  - Extracted text is cut at `max-w-[220px]`, with no way to see the full value on touch.
  - Verifier correction: the auditor's "16 columns at 1920" was a load-timing artefact; 1920 also has 18 columns.
  - Lowered to medium because a wide scrolling table is normal for desktop reports.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/callreports_1920.png, audit/screenshots/va-verify-responsive-b/callreports_390.png, audit/screenshots/va-responsive-b/callreports_1024.png, audit/screenshots/va-responsive-b/callreports_768.png
- **Recommendation:**
  - Reorder the columns by priority: Started, Status, Sentiment, Duration, Summary, To. Show Type as an icon.
  - Move the extracted fields into the details pane, or behind a "Fields" column picker that is off by default. Auto-hide any column that is empty in more than 80% of rows.
  - At 768 and wider, freeze the first column (`position:sticky; left:0`, with a background colour and a right border).
  - Below 768, render each call as a card:
    - line 1: time and duration;
    - line 2: a status chip and a sentiment chip;
    - below that: a two-line summary.

### F-RWD-011 — Leads hides Status and Interest on phones and shows only 2–3 leads per screen
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** RESPONSIVE-B-08
- **Pages:** /leads
- **Evidence:**
  - The Interest header is hidden below 768: visible at 800, hidden at 640.
  - The Status header and badges show at 640 and are hidden at 620 and 600. The number of visible "NEW" elements drops from 25 to 1, and the remaining one is the filter chip.
  - Nothing replaces them. Each row shows only the name, the masked phone number and a 32x32 call button.
  - The keyboard-shortcut legend (7 `kbd` keys, 45–70px tall) still shows under touch emulation.
  - With true mobile emulation (verified):
    - at 390x844, the first-row call buttons are at y 567, 632 and 696, and the tab bar starts at 788, so 3 rows are visible;
    - at 360x780, they are at y 585, 650 and 715, and the bar starts at 724, so 2 rows are fully visible.
  - In landscape at 844x390, the first screen shows no lead rows at all.
  - The space above the list goes to: a stacked header, 4 KPI cards (2x2), the legend, search, and 2 chip rows.
  - Verifier correction: the auditor's "1 row at 360" was a Playwright screenshot re-layout artefact (DPR 1, desktop scrollbars). The true figure is 2 rows.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/leads_390.png, audit/screenshots/va-verify-responsive-b/leads_360.png, audit/screenshots/va-responsive-b/leads_landscape_844x390.png
- **Recommendation:**
  - On phones, keep the status chip in the row, under the name next to the phone number, and show Interest as a small meter.
  - Hide the shortcut legend under `(hover:none), (pointer:coarse)`.
  - Collapse the KPIs into one scrolling summary strip.
  - Move Refresh, Export and Import into an overflow menu, so the header fits on one line. Keep "New lead" as a header icon button or a FAB.
  - Keep the row's call button at least 8px from the row's tap area, to prevent accidental outbound calls.

### F-RWD-012 — Leads filter rows overflow from 1024px with no visual cue, and the column headers scroll away
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-B-10, EXPLORE-DATA-16 (Leads part)
- **Pages:** /leads
- **Evidence:**
  - The Source chip row overflows by 27px at 1024, 151 at 900, 283 at 768 and 549 at 390.
  - The Status chip row overflows from 820 down: 21px at 820 and 363 at 390.
  - At 1024 the "ANY OUTCOME" dropdown is clipped and an inner scrollbar appears under the chips.
  - At 390 the "Any language" and "Any outcome" selects sit 540px off-screen to the right.
  - The chip rows scroll with a visible scrollbar but have no fade or arrow to show there is more.
  - Only the search and chip block is sticky (`div.sticky.top-0.z-20`, 136–146px tall). The LEAD / STATUS / INTEREST / CALL header row and the page header (with "New lead") scroll away.
  - At 390 the sticky block and the wallet banner cover about 194 of the 788px above the tab bar.
  - Explore-data saw the same things on a phone: a legend shown on touch, scrollbars on the chip rows, and selects off-screen.
- **Screenshots:** audit/screenshots/va-responsive-b/leads_1024.png, audit/screenshots/va-responsive-b/leads_768.png, audit/screenshots/va-responsive-b/leads_1280_scrolled.png, audit/screenshots/va-responsive-b/leads_390_scrolled.png, audit/screenshots/va-explore-data/r2_m_leads.png
- **Recommendation:**
  - Below 1280, move Source, Language and Outcome into one "Filters" button, with a count of active filters. It opens a popover on desktop and a bottom sheet on phones.
  - Keep Status as a single scrolling segmented row, with an edge fade and `scroll-snap`.
  - On desktop, include the column header row in the sticky block.

---


### F-RWD-013 — Wallet banner grows to 2–4 lines on phones, its buttons wrap, and a 22px Dismiss sits 7px from "Enable autopay"
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-A-12
- **Pages:** every authenticated route (banner), measured on /dashboard and /billing
- **Evidence:**
  - Banner height by width:

    | Width | Height | Lines |
    |---|---|---|
    | 441 and above | 42px | 1 |
    | 390–440 | 58px | 2 |
    | 360–375 | 77px | 3 |
    | 320 | 97px | 4 |

  - At 390 and 360 the button labels break across lines: "Top up" (44x40) becomes "Top / up", and "Enable autopay" (70x42) becomes "Enable / autopay".
  - Dismiss is 22x22 and sits 7px from "Enable autopay" (x=345 vs x=352 at 390). A missed tap on Dismiss can land on the payment control.
  - The banner also shows on /billing, where it repeats what the page already says.
  - It behaves differently by page. It stays pinned above the scrolling region on Dashboard, Assistant, Flow Builder, Meeting Agent and Billing, but scrolls away inside `main` on Personal Agents.
  - At 768 with the sidebar expanded (528px of content), it also wraps to 2 lines.
  - RESPONSIVE-B measured the same heights (42, 58 and 77px) and the same 22x22 Dismiss on its own pages.
  - At 360x780, the banner, the sticky page header and the tab bar together take about 200px, or 26% of the screen (RESPONSIVE-B-18, reported in another section). At 720x450, banner plus bar take 22%.
- **Screenshots:** audit/screenshots/va-responsive-a/dashboard_390.png, audit/screenshots/va-responsive-a/dashboard_360.png, audit/screenshots/va-responsive-a/billing_390.png, audit/screenshots/va-responsive-a/billing_768_sidebar_expanded.png
- **Recommendation:**
  - Below 640, show a one-line pill ("Wallet empty · Top up") with a single CTA, and leave autopay setup to /billing.
  - Give Dismiss a 44x44 hit area at least 8px from the CTA, and remember the dismissal for the session.
  - Do not show the banner on /billing.
  - Use the same pinned-or-scrolling behaviour on every page, and make the banner non-sticky when the viewport is under 600px tall.

### F-RWD-014 — Flow Builder canvas gets under half the screen on tablets and small laptops, does not re-fit after a resize, and touch pan failed in emulation
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-A-09
- **Pages:** /flow-builder
- **Evidence:**
  - Canvas share of the viewport, and how many of the 26 nodes are in view:

    | Viewport | Canvas share | Canvas size | Nodes in view |
    |---|---|---|---|
    | 1920 | 65% | 1522x887 | 12 |
    | 1440 | 52% | — | — |
    | 1280 | 47% | 882x551 | 5 |
    | 1024 | 41% | 626x519 | 3 after resizing from 1920; 12 (scale 0.58) on direct load |
    | 768 | 40% | 402x786 | — |
    | 390 | 53% | 365x478 | — |
    | 360 | 47% | 334x396 | 8 |

  - At 768 the 256px palette starts expanded.
  - React Flow does not call `fitView` when its container resizes. The verifier's side note under F-RWD-003 (the layout mode does not switch on a live resize) points the same way.
  - Phone layout problems:
    - the "FLOW VALIDATED" badge overlaps the Start Call node;
    - the 34x34 zoom controls sit on top of nodes;
    - a synthetic one-finger drag did not pan: the transform stayed at `translate(-20px, 19px) scale(0.55)`. This needs checking on a real device;
    - tapping a node opens an inspector that covers 82% of the width, with a large red Delete Node button;
    - items in the "…" menu are about 34px tall and show ⌘Z/⌘C hints on Android.
- **Screenshots:** audit/screenshots/va-responsive-a/flow-builder_1024.png, audit/screenshots/va-responsive-a/flow-builder_1024_directload.png, audit/screenshots/va-responsive-a/flow-builder_768.png, audit/screenshots/va-responsive-a/flow-builder_390.png, audit/screenshots/va-responsive-a/flow-builder_390_afterpan.png, audit/screenshots/va-responsive-a/flow-builder_390_tapnode.png, audit/screenshots/va-responsive-a/flow-builder_390_moremenu.png
- **Recommendation:**
  - Start the palette collapsed below 1280.
  - Add a debounced ResizeObserver on the canvas container that calls `fitView({padding:0.1})`.
  - Set `panOnDrag` and `zoomOnPinch` explicitly, and test on iOS and Android.
  - Move the validation badge into the canvas header.
  - Hide ⌘ hints under `pointer:coarse`.
  - On phones, open the node inspector as a bottom sheet with Delete in a secondary position.
  - Give canvas controls a 44px hit area on touch.

### F-RWD-015 — Assistant leaves only 241–345px for the conversation on phones, and clips the suggestion chips and composer placeholder
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-A-11
- **Pages:** /assistant
- **Evidence:**
  - The chat scroller (`div.flex-1.space-y-3.overflow-y-auto`) is 345px tall at 390x844 and 241px at 360x780.
  - The rest of the screen, top to bottom, goes to:
    - the wallet banner (58px at 390, 77px at 360);
    - a page header with New chat (102x32) and Voice (80x32), about 130px;
    - the composer;
    - an always-visible Plan & Actions card, about 150px;
    - the 56px tab bar.
  - At 360 the "Build a sales call flow" chip is cut in half.
  - The placeholder ("Ask me to build a flow, summarize calls, add leads, place a call…") wraps to 2–3 lines inside a 42px field and is clipped.
  - The subtitle is cut with an ellipsis (331px of text in 296–326px).
  - An on-screen keyboard would shrink the chat area further (inferred).
- **Screenshots:** audit/screenshots/va-responsive-a/assistant_390.png, audit/screenshots/va-responsive-a/assistant_360.png, audit/screenshots/va-responsive-a/assistant_360_full.png
- **Recommendation:**
  - Below 768:
    - collapse Plan & Actions into a toggle ("Plan · 0 steps") or a sheet;
    - hide the subtitle;
    - make New chat and Voice 44px icon buttons in the header.
  - Shorten the placeholder to "Ask Vaani…".
  - Use an auto-growing textarea (1 row, up to 5).
  - Keep the composer sticky and above the on-screen keyboard, using `dvh` units or `visualViewport`.
  - Put the suggestion chips in one horizontally scrolling row.

### F-RWD-016 — Knowledge file table hides Embed and Delete at 880px and below, and the header is clipped at 360
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-B-12
- **Pages:** /knowledge
- **Evidence:**
  - The file table has a hard minimum width of 691px. It fits at 900 (718/718) and overflows from about 880 down:

    | Width | Visible / table width | Effect |
    |---|---|---|
    | 860 | 678/691 | — |
    | 768 | 586/691 | "Embed" half visible, "Delete" hidden |
    | 390 | 297/691 | only the File column visible; NEXT pagination clipped |

  - At 390, Size, Updated and Actions can only be reached by scrolling sideways.
  - At 360 the page header overflows by 28px (sw 388 vs cw 360), and "Refresh" is cut to "Refres".
  - At 1024, sizes and dates wrap to 2 lines, and file names (raw storage keys) break at hyphens.
  - The file input is the browser's native, unstyled control at every width.
  - The Test Knowledge Search placeholder is cut at 390.
- **Screenshots:** audit/screenshots/va-responsive-b/knowledge_768.png, audit/screenshots/va-responsive-b/knowledge_390.png, audit/screenshots/va-responsive-b/knowledge_390_s1.png, audit/screenshots/va-responsive-b/knowledge_360.png
- **Recommendation:**
  - Below 900, render each file as a card row:
    - line 1: display name, with the timestamp prefix stripped;
    - line 2: size · updated;
    - on the right: a "⋯" actions menu with Embed and Delete, where Delete asks for confirmation.
  - As a stop-gap, make the Actions column `position:sticky; right:0`.
  - Let the header actions wrap, or turn them into icon buttons with `aria-label`s.
  - Replace the native file input with a styled drop zone that says "Choose file" on touch devices.

### F-RWD-017 — Marketing nav overflows at tablet widths (768–840) and wraps at 1060 and below
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** RESPONSIVE-B-14
- **Pages:** / (signed out)
- **Evidence:**
  - The desktop link row (`div.hidden.md:flex`, 731px wide) appears from 768 up, but at 768 it runs out to x=925.
  - As a result, the theme toggle, "Log in" and "Get started" are off-screen at 768, and "Build your own" wraps to 3 lines.
  - Document scrollWidth is 834 at both 768 and 800; the page fits at 900.
  - Under mobile emulation, Chrome widens the layout viewport to 834px (innerWidth 834), so iPad-portrait-class devices render the whole page zoomed out.
  - At 1060 and below, "Build your own", "Log in" and "Get started" wrap to 2 lines, and the nav grows from 69px to 85–91px.
  - The hamburger menu only appears at 767 and below.
- **Screenshots:** audit/screenshots/va-responsive-b/home_768.png, audit/screenshots/va-responsive-b/home_1024.png
- **Recommendation:**
  - Show the hamburger below 1100px, using a custom breakpoint such as `min-[1100px]:flex` for the link row.
  - On tablets, keep "Log in" and "Get started" visible next to the hamburger.
  - Add `whitespace-nowrap` to the nav items.
  - Add an automated check that `documentElement.scrollWidth <= innerWidth` at 768, 834 and 1024.

### F-RWD-018 — Public-site phone polish: 14px inputs, clipped flow demo, menu ignores Esc, very long pages
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** PUBLIC-SITE-24
- **Pages:** /, /login, /pricing at 390px
- **Evidence:**
  - Inputs are 14px on /login and /pricing, which makes iOS Safari zoom in on focus (inferred). RESPONSIVE-B measured the same 14px on login, sign-up, New lead and search fields (RESPONSIVE-B-19, reported in another section).
  - The home flow-builder demo nodes are clipped at the right edge (node right edge 382px vs a 380px viewport), and the "Book callback" branch is off-screen.
  - The mobile menu does not close on Esc: its label stays "Close menu" and `aria-expanded` stays `true`. It is not a `role="dialog"`.
  - There is no theme toggle on mobile; the button renders at 0x0 and is not in the menu.
  - Home is 9,914px tall on mobile (about 11.7 screens).
  - /pricing is 6,792px long and has no navigation or menu at all.
  - The analytics mock leaves one stat card alone on its row.
  - The demo transcript is a nested scroller (262px viewport over 343px of content) inside the page.
- **Screenshots:** audit/screenshots/va-public-site/m_home_top.png, audit/screenshots/va-public-site/m_home_menu.png, audit/screenshots/va-public-site/m_home_full_grid.png, audit/screenshots/va-public-site/m_login.png, audit/screenshots/va-public-site/m_pricing_top.png, audit/screenshots/va-responsive-b/home_390_menu.png, audit/screenshots/va-responsive-b/home_390_s1.png
- **Recommendation:**
  - Set `font-size:16px` (or `max(16px,1em)`) on inputs at 767px and below.
  - Scale the flow demo to its container, or switch it to a vertical layout on phones.
  - Make the menu a `role="dialog"` with `aria-modal`: Esc closes it and returns focus to the hamburger, and it contains the theme toggle.
  - On mobile, collapse long home sections (accordion or 2-column grids), and let the demo transcript expand instead of scrolling inside the page.
  - Give /pricing the standard site navigation.

### F-RWD-019 — Onboarding scrolls sideways at 1440px and cannot be found again after first run
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** EXPLORE-SETTINGS-23
- **Pages:** /onboarding
- **Evidence:**
  - At 1440, `main` has scrollWidth 1486 vs clientWidth 1358. The cause is a decorative `absolute -right-32` blob, which adds a visible horizontal scrollbar.
  - No Settings or Help entry links back to /onboarding.
  - No other widths were tested.
- **Screenshots:** audit/screenshots/va-explore-settings/c14_onboarding.png
- **Recommendation:**
  - Add `overflow-x:clip` to the decorative container, or to `main`.
  - Add a "Setup guide" entry under Help (or Settings › Account) that shows the status of each step.

---

### Refuted / not reproduced

The verifier did not refute any finding in this section. For completeness, these specific claims did not reproduce and have been corrected in the findings above:

- **RESPONSIVE-B-05** (F-RWD-010):
  - Not reproduced: "16 columns at 1920 vs 18 at 1440 and below".
  - Verifier: "After loading, 1920 also has 18 columns; the lower count was a load-timing artefact."
- **RESPONSIVE-B-08** (F-RWD-011):
  - Not reproduced: "1 lead row visible at 360" and the 2-row header wrap.
  - Verifier: at 360x780, 2 rows are fully visible; the 1-row figure "come[s] from Playwright's screenshot re-layout (DPR 1, desktop scrollbars)".
- **RESPONSIVE-A-04** (F-RWD-002):
  - Not reproduced: "LAT hidden below 768".
  - Verifier: "LAT is still visible at 767x1024". The verifier also found that SESSION disappears below 1024, not only at 768.
- **RESPONSIVE-B-04** (F-RWD-008):
  - Not reproduced: breakpoint "≤ 552px".
  - Verifier: there is no overflow at 552 or 560, and 3px at 540; "The breakpoint is about 543 px".
- **A11Y-MANUAL-12** (F-RWD-002):
  - Not reproduced: "Customer Intel removed from the DOM".
  - Verifier: its text "is still in the DOM but hidden, so it is hidden rather than removed".

**Severity lowered by the verifier (all confirmed, all now medium):**
- RESPONSIVE-A-02, A-03 and B-04: the cut-off controls can be reached by scrolling sideways, and on phones the page can only be opened by URL.
- RESPONSIVE-A-04: calling still works.
- RESPONSIVE-B-05: a wide scrolling table is normal for desktop reports.
- RESPONSIVE-B-07: the input can still be typed into.
- RESPONSIVE-B-08: 2–3 rows are visible, not 1.

**Still needs a real-device check:** Flow Builder touch pan and pinch, iOS zoom-on-focus with 14px inputs, the tab bar's safe-area overlap, and on-screen keyboard behaviour in the Assistant composer and the Cockpit phone input.

---

## 3E. Findings — Accessibility (WCAG 2.2)

**Scope and method.** This section consolidates 68 accessibility findings from 12 agents into 30 findings. The main sources were an automated pass (axe-core 4.10.2, plus a custom scanner that composites alpha and ancestor opacity before computing contrast; A11Y-AUTO) and a manual keyboard, focus and semantics pass (A11Y-MANUAL). An adversarial verifier re-checked every high and critical finding in the live product, and its corrected severities are applied here. Some limits apply:
- No screen reader was run, so "announced" statements come from the accessibility tree.
- No call was placed, and the Leads `c` shortcut was never pressed.
- `/rep-console` was not audited, because it registers a live softphone.
- Default viewport was 1440x900, light theme, unless stated otherwise.

### Axe-core violations per page

| Page | axe violations (rule: nodes) | axe `incomplete` | Scanner: text failing AA | Controls without programmatic label |
|---|---|---|---|---|
| /dashboard | color-contrast 11; label-title-only 1 | contrast 26 | 26 / 52 (50%) | 7 / 8 |
| /assistant | color-contrast 5; landmark-unique 1 | contrast 1 | 5 / 33 | 1 / 1 |
| /analytics | color-contrast 2 | contrast 46 | 124 / 242 (51%) | 0 / 0 |
| /leads | **label 24 (critical)**; label-title-only 2; color-contrast 2 | contrast 112 | 131 / 240 (55%) | 1 + 24 row checkboxes |
| /flow-builder | color-contrast 9; aria-allowed-role 1 | contrast 22; aria-prohibited-attr 1 | 20 / 68 | 0 / 1 |
| /meeting-agent | color-contrast 37; **label 1 (critical)**; **select-name 1 (critical)** | contrast 2 | 64 / 111 (58%) | 4 / 4 |
| /personal-agents | color-contrast 8 | — | 8 / 39 | 0 |
| /call-reports | color-contrast 51; empty-table-header 1 | contrast 2 | 730 / 949 (77%) | 1 / 1 |
| /billing | color-contrast 12 | — | 12 / 46 | 2 / 2 |
| /knowledge | color-contrast 31; **label 1 (critical)** | — | 38 / 88 | 2 / 3 |
| /settings | color-contrast 29; **label 1 (critical)**; landmark-unique 1 | — | 32 / 66 | 3 / 3 |
| /login (signed out) | color-contrast 1; region 10 | contrast 14 | 7 / 15 | 2 / 2 |
| / (signed out) | color-contrast 8; heading-order 4; **scrollable-region-focusable 2 (serious)** | contrast 35 | 14 / 243 | 0 |

**Violation types across the 13 pages:**
- color-contrast: 13 pages.
- label / select-name (critical): 4 pages.
- label-title-only: 2.
- landmark-unique: 2.
- region, heading-order, scrollable-region-focusable, empty-table-header and aria-allowed-role: 1 each.

axe undercounts contrast. Most muted text sits on translucent surfaces, which axe files as `incomplete`, so the scanner column is the more reliable failure count.

**Passed on every page:**
- `lang="en"`.
- Zoom not blocked.
- 0 duplicate ids.
- 0 `<img>` without `alt`.
- 0 positive `tabindex`.

**Missing on every page:** a skip link and a unique `<title>`.

### Findings index

| ID | Sev. | Title | WCAG 2.2 |
|---|---|---|---|
| F-A11Y-001 | critical | Flow Builder nodes can't be edited or connected by keyboard | 2.1.1 A |
| F-A11Y-002 | critical | Call Reports details open only with a mouse | 2.1.1 A, 2.4.3 A |
| F-A11Y-003 | high | Form fields have no programmatic labels | 1.3.1 A, 3.3.2 A, 4.1.2 A, 2.5.3 A, 1.3.5 AA |
| F-A11Y-004 | high | Single-key shortcuts can't be turned off; `c` places a call | 2.1.4 A, 4.1.2 A |
| F-A11Y-005 | high | Modals and drawers: no dialog role, trap or focus return | 4.1.2 A, 2.4.3 A, 2.4.11 AA |
| F-A11Y-006 | high | Focus indicator missing or under 3:1 | 2.4.7 AA, 1.4.11 AA |
| F-A11Y-007 | high | Flow nodes show no keyboard focus or selection | 2.4.7 AA, 1.4.11 AA |
| F-A11Y-008 | high | Muted text token and 8–10px mono type fail AA | 1.4.3 AA, 1.4.4 AA |
| F-A11Y-009 | high | Primary buttons use black or ink text on blue (3.27–3.83:1) | 1.4.3 AA |
| F-A11Y-010 | medium | Leads rows unfocusable; drawer never gets focus | 2.4.3 A, 4.1.2 A |
| F-A11Y-011 | medium | Flow toolbar menus impractical by keyboard | 2.1.1 A, 2.4.3 A |
| F-A11Y-012 | medium | No skip link; 2 tab stops per sidebar item | 2.4.1 A, 2.4.3 A |
| F-A11Y-013 | medium | Same `<title>` on every route | 2.4.2 A |
| F-A11Y-014 | medium | Status changes not announced | 4.1.3 AA |
| F-A11Y-015 | medium | Wallet banner is a persistent `role=alert` | 4.1.3 AA, 2.4.3 A |
| F-A11Y-016 | medium | Toggle, selection and expansion state not exposed | 4.1.2 A, 1.3.1 A |
| F-A11Y-017 | medium | Nav: no `aria-current`, unlabelled navs | 1.3.1 A, 4.1.2 A |
| F-A11Y-018 | medium | Leads has no table structure; Call Reports table has thin semantics | 1.3.1 A |
| F-A11Y-019 | medium | Status chips, fillers and node titles under 4.5:1 | 1.4.3 AA |
| F-A11Y-020 | medium | Placeholders at 1.56–1.78:1 | 1.4.3 AA |
| F-A11Y-021 | medium | Marketing light-mode scrolled nav at 1.39:1 | 1.4.3 AA |
| F-A11Y-022 | medium | Reduced-motion preference ignored in app | 2.2.2 A |
| F-A11Y-023 | medium | Targets under 24px; touch targets far under 44px | 2.5.8 AA, 2.5.5 AAA |
| F-A11Y-024 | medium | Icon buttons unnamed on phones, or named by `title` only | 4.1.2 A |
| F-A11Y-025 | medium | Login blocks autofill; show-password toggle has no visible focus | 1.3.5 AA, 3.3.8 AA, 2.4.7 AA |
| F-A11Y-026 | medium | Heading and landmark gaps | 1.3.1 A, 2.4.6 AA |
| F-A11Y-027 | medium | Flow shortcuts dialog and node editor: focus never enters | 2.4.3 A, 2.4.11 AA |
| F-A11Y-028 | medium | Canvas tab order follows creation order; edge names show IDs | 2.4.3 A, 2.4.6 AA, 1.1.1 A |
| F-A11Y-029 | medium | Marketing home: scroll regions not focusable | 2.1.1 A, 1.4.3 AA |
| F-A11Y-030 | low | Label-in-name, heading and tab-order polish | 2.5.3 A, 1.3.1 A, 2.4.3 A |

---

### F-A11Y-001 — Flow Builder: nodes cannot be opened for editing or connected using the keyboard
- **Severity:** critical · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-01, A11Y-AUTO-11
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.1.1 Keyboard (A)**. The handle size also bears on 2.5.8 Target Size (Minimum) (AA).
  - Enter or Space on a node reached with Tab only adds the `selected` class. The node editor never opens. A mouse click opens the "Speak Node" editor. The `?` shortcut sheet documents editing only as "Double-click".
  - All 54 `.react-flow__handle` connection handles are 9x9 CSS px, which renders at about 6.4px at the default fit zoom `scale(0.7119)`. They have no `role` and no `tabindex`, so there is no keyboard path to create an edge.
  - Adding a node from the palette by keyboard ("Add Speak node to canvas" + Enter) creates an unconnected node (the edge count stays at 27) and does not open its editor.
  - Verifier (live flow, 26 nodes and 27 edges) reproduced all of the above. Clicking a source handle and then a target handle does create an edge, so a single-pointer alternative exists and 2.5.7 passes. The keyboard gap remains. Keyboard, switch and voice-control users cannot build or change a call flow, which is the product's core authoring job.
- **Screenshots:** audit/screenshots/va-a11y-manual/46-flow-node-click.png, audit/screenshots/va-a11y-manual/48-flow-node-keyboard-select.png, audit/screenshots/va-verify-a11y-manual/49b-flow-node-enter.png, audit/screenshots/va-verify-a11y-manual/50-flow-palette-add.png, audit/screenshots/va-verify-a11y-auto/flow-click-connect.png, audit/screenshots/va-a11y-auto/flow-builder-loaded.png
- **Recommendation:**
  - Enter on a focused node opens the editor and moves focus to its first field. Space keeps its select behaviour. Esc closes the editor and returns focus to the node.
  - Add a "Connect to…" command on the selected node, as a node-toolbar button plus a shortcut such as `Ctrl+Shift+C`. It opens a listbox of target nodes and output ports and creates the edge. Add a matching "Remove connection" command for existing edges.
  - Make handles focusable `<button>`s with names such as "Output: YES of Confirm Interest". Give each a 24x24 hit area at the default zoom (an `::after` hit-slop keeps the visual size).
  - Document the keyboard equivalents in the `?` sheet. Add a keyboard-only Playwright test that builds a 3-node connected flow.

### F-A11Y-002 — Call Reports: call details and transcript open only with a mouse click
- **Severity:** critical · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-03, A11Y-AUTO-07 (Call Reports part)
- **Pages:** /call-reports
- **Evidence:** WCAG 2.2: **2.1.1 Keyboard (A)**, **2.4.3 Focus Order (A)**, **4.1.2 Name, Role, Value (A)**.
  - The page has 1 `<table>` with 50 `<tbody>` rows per page. Each `tr` has `cursor:pointer` and a click handler, but no `tabindex`, no role, no link and no focusable cell.
  - The only focusable items in a row are "Re-analyze" (title "Re-run AI analysis from scratch") and an icon-only "Download CSV".
  - Tab order from the search box: 4 sentiment chips, then the Re-analyze and Download pairs row by row. `j`, ArrowDown and Enter from `<body>` do nothing.
  - A mouse click on a cell opens the CALL DETAILS panel (dialled number, status, duration, call ID, AI analysis, flow fields and transcript). Every ancestor of the panel up to `main` is a plain `div` with no role, label or `aria-modal`. Focus stays on `<body>`, and the next Tab goes to row 1's Re-analyze.
  - Verifier reproduced every point live. Keyboard and screen-reader users cannot read any call's outcome or transcript.
- **Screenshots:** audit/screenshots/va-a11y-manual/61-call-reports-tab.png, audit/screenshots/va-a11y-manual/62-call-reports-detail.png, audit/screenshots/va-verify-a11y-manual/62-call-reports-detail.png, audit/screenshots/va-verify-a11y-manual/30-call-reports-detail.png
- **Recommendation:**
  - Render the "Started" cell as a `<button>` named "Open call details, <date time>, <duration>, <status>", with Enter and Space opening the panel. Keep the row click for mouse users by delegating it to the same handler.
  - Render the panel as a non-modal side sheet: `role="dialog"` with `aria-labelledby` pointing to its heading, or `<aside aria-label="Call details">`.
  - On open, move focus to the panel heading (`tabindex="-1"`). Esc closes the panel, and focus returns to the row's button.
  - Add a keyboard-only e2e test: Tab to row 3, press Enter, read the transcript, press Esc, and assert that focus is back on row 3.

### F-A11Y-003 — Form fields have no programmatic label: placeholders act as names, and some fields have no name at all
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-AUTO-01, A11Y-MANUAL-06, QA-A-13 (unlabelled-field part), EXPLORE-SETTINGS-16 (label part), PUBLIC-SITE-13 (label part), PUBLIC-SITE-22
- **Pages:** /login (sign-in and sign-up), /dashboard, /meeting-agent, /settings (Profile, Calling number, Change email), /billing, /leads (list, New Lead modal, lead drawer), /knowledge, /call-reports, /assistant, /personal-agents, flow node editor, /pricing, /contact
- **Evidence:** WCAG 2.2: **1.3.1 Info and Relationships (A)**, **3.3.2 Labels or Instructions (A)**, **4.1.2 Name, Role, Value (A)**, **2.5.3 Label in Name (A)**, **1.3.5 Identify Input Purpose (AA)**.
  - axe critical violations:
    - `label`: /leads (24 row checkboxes), /meeting-agent (number input), /knowledge and /settings (file inputs).
    - `select-name`: /meeting-agent.
    - `label-title-only`: the Dashboard flow select and 2 Leads filter selects.
  - Scanner, controls without a label:
    - Dashboard 7/8, Meeting Agent 4/4, Settings Profile 3/3.
    - Billing 2/2, Login 2/2, Knowledge 2/3.
    - Call Reports 1/1, Assistant 1/1.
  - /login:
    - The `<label>`s have no `for`, and the inputs have no `id` or `name`.
    - The accessible names are the placeholders "you@company.com" and "••••••••", so the password field is announced as a string of bullets.
    - Sign-up mode has the same problem.
  - /dashboard Customer Intel: 6 text inputs and the dial `tel` input are named by their placeholders ("Enter customer name", "City, State", …). These don't match the visible labels ("CUSTOMER NAME"), which also fails 2.5.3 for speech-input users.
  - New Lead modal: all 8 inputs have `labels.length === 0`. City, Region/State and the Source and Status selects have no accessible name at all.
  - Leads: 25 checkboxes (24 rows plus select-all) have no name. The header's `title="Select all visible"` is on the `<label>`, not the input.
  - Meeting Agent: the Conversation Flow `<select>` and the slide-count number input have no name at all.
  - Settings: the `<label>`s have no `for` attribute.
  - Also placeholder-only or unlabelled:
    - Personal Agents GOAL textarea and CAPABILITY HINT select.
    - Flow editor LABEL and MESSAGE.
    - The lead-drawer Language select.
    - The Assistant composer.
    - Knowledge and Call Reports search.
    - Settings Calling-number and Change-email.
    - /pricing (14 fields; only its 3 selects have `aria-label`) and /contact (4 fields).
  - Verifier reproduced this on Login, Dashboard, Meeting Agent, Settings, Billing, Leads, Knowledge, Call Reports and Assistant. It downgraded A11Y-AUTO-01 from critical to high because `type=email` and `type=password`, plus nearby visible text, still convey each field's purpose, so no flow is fully blocked.
- **Screenshots:** audit/screenshots/va-verify-a11y-auto/login-signedout.png, audit/screenshots/va-verify-a11y-auto/dashboard.png, audit/screenshots/va-verify-a11y-auto/meeting-agent.png, audit/screenshots/va-a11y-auto/settings.png, audit/screenshots/va-a11y-auto/billing.png, audit/screenshots/va-a11y-manual/20-newlead-modal-open.png, audit/screenshots/va-public-site/pricing_full.png
- **Recommendation:**
  - Build one `<Field>` primitive that always renders:
    - `<label for={id}>`;
    - the hint through `aria-describedby`;
    - errors through `aria-invalid` plus `aria-describedby`;
    - `required` with a visible "(required)";
    - an `autocomplete` prop.
  - Migrate every form listed above to it, starting with Login, New Lead and Customer Intel.
  - Autocomplete tokens:
    - login: `email` and `current-password`;
    - sign-up: `new-password`;
    - profile, intel, New Lead, pricing and contact: `name`, `tel`, `email`, `organization`, `address-level2` and `address-level1`.
  - Checkboxes: put `aria-label="Select <lead name>"` and "Select all visible leads" on the `<input>` itself.
  - Selects: add a label or `aria-label` ("Filter by language", "Conversation flow", "Number of slides"), and stop relying on `title` for names.
  - Use placeholders only as neutral hints ("e.g. 10-digit mobile"), never as the name.
  - Enforce this in CI with `eslint-plugin-jsx-a11y` (`label-has-associated-control`, `control-has-associated-label`) and an axe run.

### F-A11Y-004 — Single-character shortcuts cannot be turned off, `c` places a real call, and the j/k selection is invisible to assistive technology
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-AUTO-06, A11Y-MANUAL-11
- **Pages:** /leads (primary), /flow-builder, global sidebar
- **Evidence:** WCAG 2.2: **2.1.4 Character Key Shortcuts (A)**, **4.1.2 Name, Role, Value (A)**.
  - Shortcuts in use:
    - Leads legend: `/` search, `J`/`K` navigate, `X` select, `A` select all, `C` call, `Esc` clear. Row call buttons are titled "Call <name> (c)".
    - Flow Builder: `F` full screen, `?` shortcut sheet, `Backspace` delete selected node.
    - The sidebar title advertises `[`.
  - One `window` keydown handler runs page-wide. It skips only INPUT, TEXTAREA, SELECT and contentEditable targets and keys pressed with Ctrl, Alt or Meta, and it has no enable flag.
  - Settings has 17 sections, and none mentions shortcuts. Pressing `j` while a filter-chip button had focus still moved the row highlight.
  - When a row has been picked with `j`, or a lead drawer is open, `c` calls `makeVobizCall` immediately, with no confirmation (read from the bundle; never pressed). A stray "c" from speech input or a mis-key starts a billable outbound call.
  - After `j`, focus stays on `<body>`. The row gets only `ring-1 ring-saffron/40`, a faint 1px border. There is no `aria-selected`, no `aria-activedescendant` and no live-region update.
  - Verifier confirmed all of this, and found more: while a row is highlighted, Enter on the focused NEW LEAD button opens that lead's drawer instead of the New Lead modal. The global handler hijacks Enter on buttons.
- **Screenshots:** audit/screenshots/va-a11y-auto/leads.png, audit/screenshots/va-a11y-auto/leads-after-j.png, audit/screenshots/va-a11y-manual/16-leads-jk-nav.png, audit/screenshots/va-verify-a11y-auto/leads-j-enter.png
- **Recommendation:**
  - Add a "Keyboard shortcuts" preference in Settings (on/off, and remap) and check it in the single handler.
  - Scope list shortcuts to the list: listen on the list container (`role="grid"`), not `window`, so they fire only when focus is inside it.
  - Take Call off a bare letter. Require `Shift+C` or `Ctrl+Enter`, followed by a confirm popover ("Call <name> now? Enter to confirm, Esc to cancel").
  - Never intercept Enter or Space when `event.target` is a button, link or form control.
  - Implement j/k as a roving tabindex that moves real focus to the row, or use `aria-activedescendant` on a focused grid with `aria-selected` on the active row.

---


### F-A11Y-005 — Modals and drawers have no dialog semantics, no focus trap and no focus return
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-05, QA-B-16, EXPLORE-DATA-13, EXPLORE-SETTINGS-16 (webhook-modal part), RESPONSIVE-B-20
- **Pages:** /leads (New Lead, Import leads, and the lead drawer on phones), /settings webhooks (New webhook), / (marketing mobile menu)
- **Evidence:** WCAG 2.2: **4.1.2 Name, Role, Value (A)**, **2.4.3 Focus Order (A)**, **2.4.11 Focus Not Obscured (Minimum) (AA)**, **1.3.1 Info and Relationships (A)**.
  - With New Lead open, /leads has no `role="dialog"`, no `role="alertdialog"`, no `<dialog>` and no `aria-modal` (count 0). The title "New lead" is an H3 directly under the page H1. The Import leads modal is the same.
  - Focus moves to Name on open, which is good. But Tab after "Create lead" goes to `<body>`, the logo, the Assistant link, and then "Agent View", which sits behind the blurred overlay, so focus is invisible.
  - The X close button contains only an SVG, with no text, `aria-label` or `title`, so it is announced as just "button". The New-webhook modal's close button is also unnamed.
  - Esc (both straight after opening and after typing) and a backdrop click close New Lead and drop focus to `<body>`. Reopening shows empty fields, so typed input is discarded without confirmation.
  - At 390px:
    - The lead drawer (z-40) sits under the tab bar (z-50), so its last 56px are covered.
    - The New Lead and Import overlays have no `aria-modal`.
    - The marketing mobile menu ignores Escape, and `aria-expanded` stays `true`.
  - Verifier reproduced the missing role, the Tab escape to the page behind the overlay, the unnamed X, and focus landing on `<body>` after Esc.
- **Screenshots:** audit/screenshots/va-a11y-manual/20-newlead-modal-open.png, audit/screenshots/va-verify-a11y-manual/21-newlead-tabbed.png, audit/screenshots/va-qa-b/leads-newlead-open.png, audit/screenshots/va-qa-b/leads-newlead-fake.png, audit/screenshots/va-responsive-b/leads_390_drawer_bottom.png, audit/screenshots/va-responsive-b/home_390_menu.png
- **Recommendation:**
  - Adopt one Dialog primitive for New Lead, Import, New webhook and the flow node editor: Radix Dialog, Headless UI, or native `<dialog>` with `showModal()`. It must provide:
    - `aria-labelledby` pointing to the title and `aria-describedby` pointing to the hint;
    - a focus trap and an `inert` background;
    - Esc to close, with focus returned to the trigger.
  - Close button: `aria-label="Close"`, with a hit area of at least 24x24.
  - If the form is dirty, Esc or a backdrop click asks "Discard this lead?" before closing.
  - Phone sheets: raise them above the tab bar, or hide the bar while a sheet is open. Add `padding-bottom: calc(56px + env(safe-area-inset-bottom))`.
  - Marketing mobile menu: Esc closes it, `aria-expanded` stays in sync, and focus returns to the menu button.

### F-A11Y-006 — Focus indicators are missing on checkboxes and the password toggle, and below 3:1 on inputs and selects
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-AUTO-08, A11Y-MANUAL-07, DESIGN-SYSTEM-12, EXPLORE-DATA-27 (focus part)
- **Pages:** /leads, /dashboard, /login, /knowledge, and form controls on all app pages
- **Evidence:** WCAG 2.2: **2.4.7 Focus Visible (AA)**, **1.4.11 Non-text Contrast (AA)**.
  - Leads row and select-all checkboxes:
    - The focused element is a 1x1 `peer sr-only` input, and its 0.8px outline is invisible.
    - The visible 16px span keeps `outline:none`, `box-shadow:none` and border `#cbd3e1` while `:focus-visible` is true, so there is no visible change.
    - The checkbox is also unnamed (see F-A11Y-003).
  - Selects: the Leads language and outcome selects and the Dashboard flow select have `outline:none`. Focus shows only a 50%-alpha blue border or a faint background tint.
  - Dashboard intel inputs: on focus the 0.8px border turns `#92abed`, which is 2.11:1 against the surrounding surface.
  - `.input-vani:focus` draws `0 0 0 2px #2f63e024`, a 14%-alpha halo at about 1.2:1.
  - The login show-password toggle has `outline:none` and `box-shadow:none`.
  - There is no focus token:
    - 0 of 49 buttons on Leads and 0 of 13 on Knowledge carry a `focus-visible` class.
    - `.btn-saffron` and `.btn-outline` define no `:focus-visible` style.
    - Buttons fall back to the browser `outline:auto`, and its colour varies (`#3e475a`, `#0e9488`, `#7a8397`). It is 0.8px on some buttons ("EXPORT").
  - A good pattern already exists: the Vaani/Vikash toggle has a clear 2.4px dark ring.
  - Verifier reproduced the checkbox, select and input results. It rated A11Y-MANUAL-07 medium: the 1x1 sr-only input is the standard custom-checkbox pattern, and the real defects are the missing name and the missing focus style.
- **Screenshots:** audit/screenshots/va-a11y-auto/leads-focus-checkbox.png, audit/screenshots/va-verify-a11y-auto/leads-focus-checkbox.png, audit/screenshots/va-a11y-auto/dashboard-input-focus.png, audit/screenshots/va-a11y-auto/dashboard-input-nofocus.png, audit/screenshots/va-a11y-manual/05-select-focus.png, audit/screenshots/va-a11y-manual/32-login-showpw-focus.png, audit/screenshots/va-design-system/focus-state-sample.png
- **Recommendation:**
  - Add a base-layer token and rule: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }`, with `--ring: #2f5fe0` in light mode (5.48:1 on white, 5.06:1 on #f4f6fa) and a value of at least 3:1 in dark mode.
  - Remove `outline:none` from `.input-vani`, the selects and the password toggle. Replace the 14% halo with the 2px solid ring.
  - Custom checkbox: add `peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] peer-focus-visible:ring-offset-2` to the visible span.
  - Add visual-regression snapshots of the focused state for Button, Input, Select, Checkbox and the icon buttons.

### F-A11Y-007 — Flow Builder: keyboard-focused and selected nodes look the same as every other node
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-02
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.4.7 Focus Visible (AA)**. The selected state also falls under 1.4.11 Non-text Contrast (AA).
  - A node focused with Tab matches `:focus-visible`, but its computed style is `outline: none 2.4px`, `box-shadow: none` and an inner border of 1.6px `rgb(225,230,239)`, which is identical to an unfocused node.
  - After Enter (selected), the computed style is unchanged. Only a mouse click, which also opens the editor, produces the 1.6px `rgb(17,23,37)` selected border.
  - The canvas has 53 tab stops (26 nodes plus 27 edges). In the screenshot, the 8th tabbed node cannot be told apart from its neighbours.
  - Arrow keys move the selected node and Backspace deletes it, so keyboard users edit a live flow without seeing what they are acting on.
  - Verifier reproduced this. It rated the finding high rather than critical because it is part of the barrier already covered by F-A11Y-001.
- **Screenshots:** audit/screenshots/va-a11y-manual/49-flow-node-focused-only.png, audit/screenshots/va-a11y-manual/49b-flow-node-selected.png, audit/screenshots/va-a11y-manual/44-flow-tab-edges.png, audit/screenshots/va-verify-a11y-manual/49-flow-node-focused.png, audit/screenshots/va-verify-a11y-manual/49b-flow-node-enter.png
- **Recommendation:**
  - Focus: `.react-flow__node:focus-visible { outline: 2px solid var(--ring); outline-offset: 3px }`.
  - Selection: give `.react-flow__node.selected` a 2px brand border plus an 8% brand tint, at least 3:1 against the `#eef1f7` canvas (`#2f5fe0` gives 4.84:1). Use the same style for keyboard and mouse selection.
  - Focused edges: a 3px stroke plus a halo.

### F-A11Y-008 — Muted text token #7A8397 and 8–10px tracked mono type fail AA across the light app
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-AUTO-02, UX-AUDIT-13, VISUAL-AUDIT-06, DESIGN-SYSTEM-02, EXPLORE-CORE-08, EXPLORE-DATA-14, EXPLORE-SETTINGS-16 (helper-text part), RESPONSIVE-B-16
- **Pages:** all authenticated pages and /login. Worst on /call-reports, /meeting-agent, /leads, /analytics, /dashboard, /settings and /personal-agents.
- **Evidence:** WCAG 2.2: **1.4.3 Contrast (Minimum) (AA)**. Fixed 8–10px px type also puts **1.4.4 Resize Text (AA)** and 1.4.12 Text Spacing (AA) at risk.
  - `text-text-muted` `#7a8397` on each surface:
    - 3.80:1 on #fff;
    - 3.60 on #f7f9fb (15 Settings sub-nav links, 12px);
    - 3.55 on #f5f7fb (Dashboard 9px uppercase field labels);
    - 3.52 on #f4f6fa (Leads meta, 51–63 nodes);
    - 3.36 on #eef1f7 (Meeting Agent room meta, the "IDLE" chip);
    - 2.2 on #c3c5c8 (Personal Agents example cards, which look disabled).
  - It is the most common text colour on Analytics (105 nodes) and Leads (101).
  - Failing text per page (scanner):
    - Call Reports 730/949 (77%), mostly em-dash fillers (F-A11Y-019);
    - Meeting Agent 64/111 (58%);
    - Leads 131/240 (55%);
    - Analytics 124/242 (51%);
    - Dashboard 26/52 (50%).
    - The design-system scan totals 969 of 1,473 nodes (66%).
  - Type:
    - Analytics has 63 elements at 9px, 75 at 10px and 5 at 8px. Letter-spacing goes up to 4px, and 101 elements are uppercase (94 of them mono).
    - Leads has 92 elements at 10px, 46 at 9px and 24 at 8px, with 112 uppercase.
    - Sizes are px utilities (`text-[9px]`) and are not enlarged on phones: Analytics still has 120 text nodes under 12px at 390px, and bottom-tab labels are 11px.
    - A `.type-floor` class that lifts 7–12px text to 13px already exists, but no element uses it.
  - Worst samples, computed on the effective background by the verifier:
    - "Awaiting connection…": 3.0:1 (#7a8397 at 0.9 opacity).
    - "STANDBY": #2f5fe0 with an opacity pulse of 0.50–0.89, so 2.1–4.4:1.
    - Personal Agents card descriptions: 2.2:1.
    - "LAT: 0ms": 3.74:1.
    - Meeting Agent hint text #a2a8b6 on white: 2.38:1.
    - Disabled Test Call: 1.64:1. It is exempt, but it looks broken.
  - Dark theme: muted #7b8196 on #1a1d26 is 4.35:1.
- **Screenshots:** audit/screenshots/va-a11y-auto/analytics.png, audit/screenshots/va-a11y-auto/leads.png, audit/screenshots/va-a11y-auto/meeting-agent.png, audit/screenshots/va-a11y-auto/personal-agents.png, audit/screenshots/va-a11y-auto/settings.png, audit/screenshots/va-visual-audit/analytics.png, audit/screenshots/va-verify-visual-audit/standby_zoom.png
- **Recommendation:**
  - Change the token once: `--text-muted: #5b6478`. That gives 5.93 on #fff, 5.62 on #f7f9fb, 5.48 on #f4f6fa and 5.24 on #eef1f7. In dark mode use at least `#8a90a4` (5.29 on #1a1d26).
  - Ban alpha and opacity on text colours (`text-text-muted/50`, `/70`, `opacity-60`) and use solid tokens. Stop the STANDBY opacity pulse, or keep its lowest point at 4.5:1 or more.
  - Personal Agents example cards: `#3e475a` text on the grey card (5.39:1), or switch to a white card.
  - Type floor:
    - 12px minimum for informative text, with 11px allowed only for uppercase badges at weight 600;
    - letter-spacing of 0.06em or less;
    - 13–14px for body and table text.
  - Move px utilities to rem. Apply `.type-floor` globally, then remove the arbitrary `text-[8px]` to `text-[10px]` classes and block them with a lint rule.

### F-A11Y-009 — Primary buttons use black or ink text on brand blue (3.27–3.83:1)
- **Severity:** high · **Confidence:** verified
- **Source findings:** VISUAL-AUDIT-03, A11Y-AUTO-03, DESIGN-SYSTEM-01, EXPLORE-CORE-07, PUBLIC-SITE-16
- **Pages:**
  - Every authenticated page (the wallet banner).
  - Pages with primary buttons: /dashboard, /leads, /personal-agents, /flow-builder, /call-reports, /billing, /knowledge, /settings, /assistant, /onboarding, /login.
  - Meeting Agent's own violet: /meeting-agent.
  - Marketing: /, /build.html, /docs/api.
- **Evidence:** WCAG 2.2: **1.4.3 Contrast (Minimum) (AA)**.
  - `.btn-saffron { color: rgb(0,0,0) }` on `--saffron` `#2f5fe0` is **3.83:1**. It is used for:
    - CONNECT, New Lead, New task, Export CSV;
    - Flow Save;
    - Enable UPI Auto-Debit, the ₹500 chip, Pay with UPI;
    - Upload & Embed, Knowledge Search;
    - Settings Save Changes and Upload;
    - Assistant Send and Login Sign In.
  - Wallet banner (all pages):
    - "Top up" (`bg-saffron text-ink`, #111725, 12px/600) is **3.27:1**.
    - "Enable autopay" (#2f5fe0 on #d7dff6) is 4.12:1.
    - In dark mode "Top up" (#e8eaf2 on #7c6bf5) is 3.31:1.
  - Meeting Agent's hard-coded violet: white on #8b5cf6 is 4.23:1 (CTAs and the segmented control). The H1 accent is 3.91:1 and the URL links 3.68:1.
  - Marketing:
    - White on #7c6bf5 is 3.98:1 ("Get started", "Start free", "Talk to sales", 12–15px).
    - The build.html nav "Get started" is #8b90a6 on a violet gradient, 1.43–1.82:1.
    - docs/api "GET A KEY" is black on blue, 3.83:1.
  - Likely cause: the primary token was re-pointed from saffron (where dark text was correct) to blue, without adding a foreground token.
  - The two verifiers disagreed. VISUAL-AUDIT-03's verifier kept high. A11Y-AUTO-03's verifier confirmed the values but lowered it to medium because all are above 3:1. We keep **high**: 12–14px semibold labels are not "large text", so the 4.5:1 threshold applies, and these are the most-used controls on every page.
- **Screenshots:** audit/screenshots/va-visual-audit/dashboard_connect_zoom.png, audit/screenshots/va-visual-audit/billing.png, audit/screenshots/va-visual-audit/login.png, audit/screenshots/va-design-system/zoom-primary-buttons-callreports.png, audit/screenshots/va-verify-a11y-auto/banner-topup-zoom.png, audit/screenshots/va-verify-a11y-auto/connect-btn.png, audit/screenshots/va-public-site/build_nav_zoom.png
- **Recommendation:**
  - Add a per-theme `--primary-foreground`, using `#ffffff` in light mode (5.48:1 on #2f5fe0). Remove `color:#000` from `.btn-saffron`, and remove `text-black` and `text-ink` from primary buttons and the banner CTA. Rename the `saffron` token to `primary`.
  - Meeting Agent: use the brand primary, or darken the violet to `#7c3aed` (5.70:1 with white).
  - Marketing violet: use `#6a58f0` (4.92:1) or darker. Fix the build.html nav rule that overrides button text colour.
  - Dark-mode "Top up": use white on a primary shade that reaches at least 4.5:1.
  - Add an axe contrast check on the Button stories in both themes to CI.

### F-A11Y-010 — Leads: rows cannot take focus, and the lead drawer opens only via j/k + Enter and never receives focus
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-MANUAL-04, A11Y-AUTO-07 (Leads part), EXPLORE-DATA-27 (list and drawer part)
- **Pages:** /leads
- **Evidence:** WCAG 2.2: **2.4.3 Focus Order (A)**, **4.1.2 Name, Role, Value (A)**, **1.3.1 Info and Relationships (A)**. 2.1.1 is technically met through the visible J/K legend.
  - Rows are `div[data-lead-row][data-index]` with `cursor:pointer`, no role and no tabindex. There are 267–324 pointer elements without roles.
  - Each row gives exactly 2 tab stops (checkbox and call button), so 24 rows give 48 stops.
  - `j` then Enter opens the drawer, an `<aside>` with no role, label or `aria-modal`. Focus stays on `<body>`, and the next Tab goes to a list checkbox, not into the drawer.
  - Inside the drawer:
    - The Language `<select>` is unnamed.
    - The VIKASH/VAANI voice buttons have no `aria-pressed`.
    - The Close button and the Flow select ("Flow for this call") are correctly named.
  - Verifier confirmed the structure and the focus behaviour. Two claims were refuted: Esc does close the drawer, and the J/K legend is visible on screen, so the path isn't hidden from sighted keyboard users.
- **Screenshots:** audit/screenshots/va-a11y-manual/16-leads-jk-nav.png, audit/screenshots/va-a11y-manual/17-leads-after-enter.png, audit/screenshots/va-verify-a11y-manual/12-leads-drawer.png, audit/screenshots/va-verify-a11y-manual/18-leads-after-esc.png
- **Recommendation:**
  - Render the lead name as a `<button>` that opens the drawer, and delegate the row click to it.
  - Drawer on open:
    - make it a non-modal `role="dialog"`, with `aria-labelledby` pointing to the lead-name heading;
    - move focus to that heading;
    - Esc closes it, and focus returns to the row's button.
  - Name the Language select. Give the voice choice a radiogroup (see F-A11Y-016).
  - Implement j/k as roving focus (F-A11Y-004).

---


### F-A11Y-011 — Flow Builder toolbar menus are impractical to use with a keyboard
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** QA-A-06
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.1.1 Keyboard (A)**, **2.4.3 Focus Order (A)**.
  - The "More actions" (⋯, `aria-haspopup="menu"`) and "Destructive actions" triggers open `role="menu"` popovers.
  - The popovers are portaled into the last child of `<body>`. Opening with ArrowDown or Enter leaves focus on the trigger.
  - The first menu item is at tab index 87 against the trigger's 40, so it is about 47 Tab presses away. The count varies with the flow's size.
  - Tab from the trigger goes Private → Destructive actions → Save while the menu stays open.
  - The items (Export JSON, Import JSON, New flow, Reset to default, Delete flow) are plain focusable buttons. They can be reached, but not practically.
  - Verifier refuted the claim that Escape does not close the menus. One Escape sets `aria-expanded=false`, the menus fade out within about 600ms, and focus stays on the trigger.
- **Screenshots:** audit/screenshots/va-qa-a/flow_more_menu.png, audit/screenshots/va-qa-a/flow_destructive_menu.png, audit/screenshots/va-verify-qa-a/flow_more_menu_after_tab.png, audit/screenshots/va-verify-qa-a/fb_more_after_esc_tab.png
- **Recommendation:**
  - Use a standard menu-button primitive (Radix DropdownMenu or Headless UI Menu), the same family as the app's Settings and AI-draft dialogs, which already behave correctly. It should:
    - focus the first item on open;
    - move between items with Arrow, Home and End;
    - close on Esc and return focus to the trigger;
    - close on Tab;
    - keep `aria-expanded` in sync.
  - Keep a confirm step on Reset to default and Delete flow.

### F-A11Y-012 — No skip link, and every sidebar item is two tab stops (33 stops before page content)
- **Severity:** medium · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-08, A11Y-AUTO-14 (skip-link part)
- **Pages:** global app shell (all authenticated pages)
- **Evidence:** WCAG 2.2: **2.4.1 Bypass Blocks (A)**, **2.4.3 Focus Order (A)**, **4.1.2 Name, Role, Value (A)** (a focusable div with no name).
  - There is no `a[href^="#"]` anywhere in the app.
  - Sidebar item markup: `<a title="Leads" href="/leads"><div tabindex="0"><svg/></div><div>Leads</div></a>`. So 12 items produce 24 tab stops, and every second stop is a `div` with no name and no role.
  - Tab order on a fresh /dashboard load:
    - logo;
    - 24 sidebar stops;
    - Sign Out, dark mode, Expand;
    - Top up, Enable autopay, Dismiss;
    - Select flow, Refresh flows.
    - "Enter customer name" is stop 34.
  - The link's own focus ring is clipped to its top and bottom edges by the sidebar's overflow. The inner div's ring is fully visible.
  - Verifier reproduced this. It lowered the finding to medium because `main`, `nav` and an H1 exist, so landmark navigation partly meets 2.4.1.
- **Screenshots:** audit/screenshots/va-a11y-manual/06-sidebar-link-focus.png, audit/screenshots/va-a11y-manual/07-sidebar-innerdiv-focus.png, audit/screenshots/va-verify-a11y-manual/08-sidebar-link-focus.png, audit/screenshots/va-verify-a11y-manual/08b-sidebar-inner-focus.png, audit/screenshots/va-a11y-auto/leads-focus-tab22.png
- **Recommendation:**
  - Remove `tabindex="0"` from the inner icon div, which is decoration.
  - Add a "Skip to main content" link as the first element in the DOM. It should be visible on focus and target `<main id="main" tabindex="-1">`.
  - Move the wallet banner's controls after the page header in DOM order, or wrap them in `role="region" aria-label="Wallet"`.
  - Give rail links `outline-offset: -2px` so their focus ring is not clipped.

### F-A11Y-013 — Every route has the same document title, and route changes are silent
- **Severity:** medium · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-09, A11Y-AUTO-13, EXPLORE-CORE-23, QA-B-22, PUBLIC-SITE-18 (title part)
- **Pages:**
  - App routes: /dashboard, /leads, /call-reports, /settings and its sub-pages, /analytics, /knowledge, /billing, /assistant, /personal-agents, /meeting-agent, /flow-builder.
  - Auth and error: /login, /forgot-password, the 404 page.
  - Public: /, /pricing, /docs, /contact, /changelog, /about, /status.
- **Evidence:** WCAG 2.2: **2.4.2 Page Titled (A)**. Route announcements relate to 4.1.3 (advisory).
  - `document.title` is "Vaani Labs - The Voice AI that speaks India" on all 11 app routes, on login, on the 404 page and on 10 public pages. Browser tabs, history entries and screen-reader page announcements can't tell pages apart.
  - Pressing Enter on a focused sidebar link changes the route, but focus stays on the link and nothing is announced. The only live region is the wallet `role="alert"`.
  - Verifier reproduced this on 11 routes. It rated the finding medium rather than high because each page has a distinct H1.
- **Screenshots:** —
- **Recommendation:**
  - Drive titles from one nav config: "<Page> · Vaani Labs" (for example "Leads · Vaani Labs" and "Page not found · Vaani Labs"). Add context where useful, such as the flow name on Flow Builder or "On call" on the cockpit during a live call.
  - On a client-side route change, either move focus to the H1 (`tabindex="-1"`) or announce "<Page> loaded" in a polite live region.

### F-A11Y-014 — Status changes are not announced (call state, transcript, result and selection counts)
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-MANUAL-14, A11Y-AUTO-09 (status part)
- **Pages:** /dashboard, /leads, /call-reports (and every page that runs async actions)
- **Evidence:** WCAG 2.2: **4.1.3 Status Messages (AA)**.
  - On Dashboard, Leads and Call Reports the only live region is the wallet banner.
  - Dashboard: "SESSION: IDLE", "IDLE", "STANDBY" and "Awaiting connection…" are outside any live region, and the Transcript Feed is not `role="log"`.
  - No toast container exists (no sonner, Toastify or react-hot-toast), so Refresh and other async actions give no audible confirmation.
  - Leads: "0 / 0 SHOWN", "No leads match." and "1 SELECTED" all change silently, and the j/k highlight isn't exposed.
  - Flow Builder is the good reference: it has a `role="status"` "Up to date", an sr-only polite status and React Flow's own live region.
  - Verifier confirmed the structure. What happens during a live call remains inferred, because no call was placed.
- **Screenshots:** audit/screenshots/va-a11y-manual/12-leads-noresults.png, audit/screenshots/va-a11y-manual/15-leads-checkbox-checked.png, audit/screenshots/va-a11y-auto/dashboard.png
- **Recommendation:**
  - Add one polite `role="status"` region to the app shell, fed by an `announce(message)` helper. Use it for result counts, selection counts, refresh and save outcomes.
  - Call state: a `role="status"` element that announces "Connecting", "Connected" and "Call ended".
  - Transcript: `role="log" aria-live="polite" aria-relevant="additions"`.
  - Add a toast region (polite for success, assertive only for failures) for async outcomes.

### F-A11Y-015 — The persistent "Wallet empty" banner is an assertive alert, and dismissing it drops focus
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-MANUAL-15, A11Y-AUTO-09 (banner part), EXPLORE-SETTINGS-16 (banner part), QA-A-18
- **Pages:** global (every authenticated route)
- **Evidence:** WCAG 2.2: **4.1.3 Status Messages (AA)**, **2.4.3 Focus Order (A)**.
  - `<div role="alert">` "Wallet empty — top up now to keep calls flowing." sits inside `main` on every route and is announced assertively on every full page load.
  - Verifier: a MutationObserver saw 0 re-insertions after Leads Refresh and after client-side navigation (the same node was kept). So re-announcement on every refresh or in-app navigation is **not** reproduced. It happens on full page loads only.
  - After "Dismiss" (22x22), `document.activeElement` is `<body>`. The dismissal is stored in `sessionStorage` and so lasts only for that tab.
- **Screenshots:** audit/screenshots/va-a11y-manual/01-dashboard.png, audit/screenshots/va-verify-a11y-auto/banner-topup-zoom.png
- **Recommendation:**
  - For the persistent state, use `role="region" aria-label="Wallet status"` or `role="status"`. Keep `role="alert"` for new, time-sensitive errors, such as a call rejected for insufficient balance.
  - Remember the dismissal per balance state for the session, and afterwards show a compact pill in the header.
  - On dismiss, move focus to the page H1.

### F-A11Y-016 — Toggle, selection and expansion states are visual only
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-AUTO-15, A11Y-MANUAL-13, QA-A-13 (state part)
- **Pages:** /meeting-agent, /leads and its lead drawer, /call-reports, /personal-agents, /flow-builder, sidebar
- **Evidence:** WCAG 2.2: **4.1.2 Name, Role, Value (A)**, **1.3.1 Info and Relationships (A)**.
  - No `aria-pressed`, no `aria-checked` and no radio role on:
    - Meeting Agent Session Mode (Presentation / Conversation flow) and Meeting Privacy (Open / Encrypted);
    - Leads status chips (8) and source chips (7);
    - Call Reports sentiment chips (4);
    - the lead-drawer VIKASH/VAANI choice.
  - The chips are `button type="submit"`, and the selected one is shown only by tint and border.
  - No `aria-expanded` on Personal Agents NEW TASK, the sidebar Expand/Collapse button or the Meeting Agent "joinees" expander. No `aria-pressed` on Toggle Interactivity.
  - The pattern already exists elsewhere: the Dashboard Vaani/Vikash toggle and the Flow Private and Full-screen buttons use `aria-pressed` correctly.
  - The A11Y-MANUAL-04 verifier also confirmed that VIKASH/VAANI in the drawer has no `aria-pressed`.
- **Screenshots:** audit/screenshots/va-a11y-auto/meeting-agent.png, audit/screenshots/va-qa-a/meeting_presentation_mode.png, audit/screenshots/va-a11y-manual/13-leads-tab-chips.png, audit/screenshots/va-a11y-manual/91-personal-agents-newtask.png
- **Recommendation:**
  - Single-select groups (status, sentiment, session mode, privacy, voice): `role="radiogroup"` with `role="radio"` and `aria-checked`, and arrow keys to move between options.
  - Multi-select chips: `aria-pressed`.
  - Make every chip `type="button"`, and add a non-colour selected cue (a check icon or heavier weight).
  - Disclosure buttons: `aria-expanded` plus `aria-controls`.

### F-A11Y-017 — Navigation semantics: no `aria-current`, unlabelled navs, and rail tooltips only via `title`
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-MANUAL-21, A11Y-AUTO-14 (nav part), DESIGN-SYSTEM-20, QA-A-13 (aria-current part), EXPLORE-DATA-27 (aria-current part), EXPLORE-SETTINGS-16 (aria-current part)
- **Pages:** global sidebar rail, mobile bottom bar, /settings sub-nav
- **Evidence:** WCAG 2.2: **1.3.1 Info and Relationships (A)**, **4.1.2 Name, Role, Value (A)**. The clipped rail focus ring also relates to 2.4.7 (AA).
  - None of these has `aria-current="page"`: the desktop rail, the mobile bottom bar, or the 17-item Settings sub-nav. The active item is shown only by a 3px left bar and a tint.
  - Each page has 2–3 unnamed `<nav>` elements (rail, footer or bottom bar, Settings), so a screen reader lists "navigation, navigation, navigation". axe flags `landmark-unique` on /assistant and /settings.
  - The 13 rail links (44x44) get their names from hidden text plus `title`. Hover shows no visible tooltip, and keyboard focus shows none at all. The footer theme button has a custom tooltip, which is inconsistent.
  - The Settings sub-nav mixes `<button>` items (Profile, Meetings Billing, Docs) with `<a>` links.
- **Screenshots:** audit/screenshots/va-a11y-manual/06-sidebar-link-focus.png, audit/screenshots/va-design-system/sidebar-hover-tooltip.png, audit/screenshots/va-a11y-auto/mobile390-leads.png, audit/screenshots/va-a11y-manual/52-settings-subnav-focus.png
- **Recommendation:**
  - Set `aria-current="page"` on the active link in every nav.
  - Label each nav with `aria-label`: "Main", "Account", "Settings sections", "Mobile".
  - Build a Tooltip component that shows on hover and on keyboard focus (300ms delay, 12px text) and use it instead of native `title`.
  - Make every sub-nav destination a link. Drive rail tooltips, mobile labels, H1s and document titles from one nav config.

### F-A11Y-018 — Data lists and tables lack structure: Leads has none, and the Call Reports table lacks a caption, scope and sort state
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-MANUAL-22, A11Y-AUTO-07 (table-semantics part), EXPLORE-DATA-27 (grid part)
- **Pages:** /leads, /call-reports
- **Evidence:** WCAG 2.2: **1.3.1 Info and Relationships (A)**.
  - Leads is built from divs. The column headers LEAD / STATUS / INTEREST / CALL are visual only, and there are no table, grid or row roles.
  - Call Reports `<table>`:
    - 18 `th` elements, none with `scope`;
    - no `<caption>`;
    - 1 empty `th` (axe `empty-table-header`);
    - sort shown only by the "▼" in "Started", with no `aria-sort`, and the header is not a button;
    - duplicate dynamic headers ("Condition Check" ×4).
  - The verifier confirmed the Call Reports details. The Leads structure is single-source.
- **Screenshots:** audit/screenshots/va-a11y-manual/60-call-reports.png, audit/screenshots/va-a11y-auto/call-reports.png, audit/screenshots/va-a11y-manual/10-leads.png
- **Recommendation:**
  - Leads: use a `<table>` with `<caption class="sr-only">Leads</caption>` and `<th scope="col">`. If j/k navigation stays, use `role="grid"` with row and cell roles instead.
  - Call Reports:
    - add a `<caption>`;
    - set `scope="col"` on headers;
    - make sortable headers `<button>`s inside `<th aria-sort="descending|ascending|none">`;
    - name the empty header ("Actions");
    - disambiguate dynamic columns, for example "Condition Check: Residential".

### F-A11Y-019 — Status chips, semantic-colour text, empty-cell fillers and canvas node titles fall below 4.5:1
- **Severity:** medium · **Confidence:** verified
- **Source findings:** A11Y-AUTO-04, A11Y-AUTO-11 (node-text part)
- **Pages:** /call-reports, /leads, /analytics, /knowledge, /settings, /flow-builder
- **Evidence:** WCAG 2.2: **1.4.3 Contrast (Minimum) (AA)**.
  - Call Reports:
    - em-dash fillers (#b7bcc8, which is muted at 50%, on #f4f6fa): **1.75:1** across 498 nodes;
    - BROWSER (#3aa79e on #e9f1f4): 2.56 (46);
    - MIXED: 2.31 (3);
    - NEUTRAL (#b5820e): 2.83 (26);
    - IN PROGRESS: 3.08 (11);
    - COMPLETED: 3.57 (47);
    - NEGATIVE: 3.67 (10);
    - teal "Re-analyze" text buttons, 13px: 3.46 (43).
  - Leads: the 9px NEW badge is 3.08 (25).
  - Analytics: "+200%" is 3.76, "0.0% drop" 3.49, and the section numerals 3.54 (8).
  - Other pages:
    - Knowledge "Embed": 3.54 (5).
    - Settings "Delete Account": 3.25.
    - Flow Builder "FLOW VALIDATED": 2.58. "Private" at 40% alpha: 1.99.
  - Flow canvas node titles are 13px in CSS but render at 9.3px at `scale(0.7119)`:
    - "Schedule Visit" (amber): 3.01;
    - "Confirm Interest" (teal): 3.31;
    - YES/NO badges: 3.24 and 3.30, rendered at 7.1px;
    - Start/End pills: 3.37 and 3.44.
  - Verifier reproduced the values (MIXED and +200% were not re-measured). It rated the finding medium because the worst case is an empty-cell filler and the badges are secondary metadata. The 1.4.1 (use of colour) claim is refuted, because every chip has a text label.
- **Screenshots:** audit/screenshots/va-a11y-auto/call-reports.png, audit/screenshots/va-a11y-auto/leads.png, audit/screenshots/va-a11y-auto/analytics.png, audit/screenshots/va-a11y-auto/flow-builder-loaded.png
- **Recommendation:**
  - Add "-700" semantic text tokens, measured on #f4f6fa:
    - success `#127a4b` (4.96:1);
    - teal `#0b756b` (5.15:1, and 4.58 on the #dcecee chip tint);
    - warning `#7a4b00` (6.85:1);
    - danger `#a8352b` (5.28:1 on the negative tint).
  - Chips: dark text on the tint, with colour only in the background and border.
  - Empty cells: leave them blank with an sr-only "No value", or render "—" in the solid muted token (4.5:1 or more).
  - Remove alpha from status text (FLOW VALIDATED, Delete Account, Private).
  - Canvas: put node titles in text-primary and keep the category colour on the icon only. Clamp the fit-view minimum zoom so node text renders at 12px or more.

---


### F-A11Y-020 — Placeholder text is nearly invisible (1.56–1.78:1) and also serves as the field label
- **Severity:** medium · **Confidence:** verified
- **Source findings:** A11Y-AUTO-05
- **Pages:** /dashboard, /meeting-agent, /flow-builder, /billing, /assistant, /leads, /call-reports, /knowledge, /settings, /login (and dark theme)
- **Evidence:** WCAG 2.2: **1.4.3 Contrast (Minimum) (AA)**. The placeholders are also the accessible names (F-A11Y-003).
  - Dashboard Customer Intel (6 fields, 12px): #c3c8d2 on #f4f6fa = **1.56:1**. The dial input is 3.43.
  - Meeting Agent title and PPT prompt: #b4bac7 on #eef1f7 = **1.72**.
  - Flow Builder "Search nodes...": #b7bcc8 = **1.75**.
  - Billing "Top-up ₹": 3.31. Assistant composer: 3.36.
  - Search and field hints on Leads, Call Reports, Knowledge, Settings and Login: 3.77–3.80.
  - Dark mode placeholders: #3b404b on #111419 = **1.78**.
  - Verifier reproduced these values and lowered the finding to medium. On this account the Dashboard and Billing fields are prefilled, and Dashboard and Meeting Agent have visible labels, so the placeholders act as hints.
- **Screenshots:** audit/screenshots/va-a11y-auto/dashboard.png, audit/screenshots/va-a11y-auto/meeting-agent.png, audit/screenshots/va-a11y-auto/flow-builder-loaded.png, audit/screenshots/va-a11y-auto/dashboard-dark.png
- **Recommendation:**
  - Add a `--placeholder` token. Light mode: `#646d80` (4.80 on #f4f6fa, 4.59 on #eef1f7). Dark mode: `#8a90a4` or lighter (5.81 on #111419).
  - Never use a placeholder as the only label (see F-A11Y-003). Keep placeholder text a neutral example ("e.g. Mumbai, MH").

### F-A11Y-021 — Marketing home in light theme: scrolled nav links drop to 1.39:1
- **Severity:** medium · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-08
- **Pages:** / (light theme)
- **Evidence:** WCAG 2.2: **1.4.3 Contrast (Minimum) (AA)**.
  - After scrolling to y=1800, the nav background computes to `oklab(0 0 0 / 0.8)` with blur over #f4f6fa, about rgb(49,49,50).
  - The links (Product, Enterprise, Pricing, Docs, Integrations, Contact, Log in) are rgb(62,71,90), which is **1.39:1**. The wordmark rgb(17,23,37) is about 1.37:1. Only "Build your own" and "Get started" stay legible.
  - The page loads with `html.dark` even under `prefers-color-scheme: light`. The first toggle click only flips the label; the second switches to light.
  - Verifier reproduced this. It lowered the finding to medium because light mode is opt-in (two clicks) and the nav stays clickable.
- **Screenshots:** audit/screenshots/va-public-site/home_light_mid.png, audit/screenshots/va-verify-public-site/home_light_scrolled.png
- **Recommendation:**
  - Make the scrolled nav surface theme-aware: `rgba(244,246,250,.85)` plus blur in light mode, `rgba(12,13,18,.8)` in dark mode. Alternatively, swap the link colour along with the surface.
  - Add visual-regression shots of both themes at several scroll positions.

### F-A11Y-022 — The app ignores prefers-reduced-motion; infinite decorative animations run with no pause
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-AUTO-10, A11Y-MANUAL-19, DESIGN-SYSTEM-17
- **Pages:** /dashboard, /analytics, sidebar logo (every page)
- **Evidence:** WCAG 2.2: **2.2.2 Pause, Stop, Hide (A)**. 2.3.3 (AAA) is advisory only.
  - The app defines 36 keyframe animations. The only `@media (prefers-reduced-motion: reduce)` block (3 rules) targets the `.vlp-*` landing classes.
  - With reduced motion emulated, /dashboard still runs 4 infinite animations:
    - the 420–449px orb and ring opacity pulse (3s);
    - "Awaiting connection…" `breathe` (3s);
    - the STANDBY blink (2s);
    - the framer-motion logo loop (3.2s).
  - /analytics runs 6: 3 loading spinners, a 6px dot, a ring-pulse and the logo. Neither page offers a pause control.
  - The marketing site does respect the preference: 49 infinite animations drop to 4.
  - Verifier confirmed this and lowered it to medium: these are mostly slow opacity pulses, not movement. 2.3.3 was misapplied because it covers animation triggered by interaction.
- **Screenshots:** audit/screenshots/va-a11y-manual/80-reduced-motion-dashboard-a.png, audit/screenshots/va-a11y-manual/81-reduced-motion-dashboard-b.png, audit/screenshots/va-verify-a11y-auto/dashboard-reduced-a.png, audit/screenshots/va-verify-a11y-auto/dashboard-reduced-b.png
- **Recommendation:**
  - Add a global rule: `@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}`.
  - Wrap the app in framer-motion's `<MotionConfig reducedMotion="user">`. Stop JS and WAAPI loops when `matchMedia('(prefers-reduced-motion: reduce)').matches`.
  - Stop idle pulses after 5s even without the preference, since 2.2.2 applies to loops longer than 5s.
  - Add motion tokens of 120, 200 and 320ms.

### F-A11Y-023 — Pointer targets are under 24x24px, and touch targets are far below 44x44
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-AUTO-16, A11Y-MANUAL-23, RESPONSIVE-A-13, RESPONSIVE-B-17
- **Pages:** /dashboard, /meeting-agent, /login, /leads, /analytics, /assistant, /flow-builder, /billing, /personal-agents, wallet banner
- **Evidence:** WCAG 2.2: **2.5.8 Target Size (Minimum) (AA)**. The 44px touch figures fall under 2.5.5 Target Size (Enhanced) (AAA).
  - Under 24px on desktop:
    - Dashboard "Refresh flows": 14x14, 6px from the select.
    - Meeting Agent "Copy URL": 15x15. "2 joinees ▸": 82x16.
    - Login show-password: 16x16. "Forgot your password?", "Back to home" and the sign-up toggle are 16–17px tall.
    - Wallet Dismiss: 22x22.
  - At 390px (targets under 44px / all interactive elements):
    - Leads 77/84. Of these, 26 are under 24px: chips are 25px tall, icon buttons 37x25, the call button 32x32, the checkbox label 20x20.
    - Meeting Agent 27/40, Assistant 12/19, Flow Builder 20/49, Billing 8/18, Dashboard 6/15, Personal Agents 5/13.
    - The Analytics period toggle is 36x24.
  - Destructive controls sit next to routine ones:
    - Meeting Agent "Delete room" (32x32) is directly beside Record.
    - The Leads per-row Call button sits flush against the row's tap area.
  - A11Y-MANUAL-07's verifier found that the Leads checkbox label is 20x20 and likely passes 2.5.8 through spacing.
- **Screenshots:** audit/screenshots/va-a11y-auto/dashboard.png, audit/screenshots/va-a11y-auto/meeting-agent.png, audit/screenshots/va-a11y-auto/login-signedout.png, audit/screenshots/va-responsive-a/meeting-agent_390_rooms.png, audit/screenshots/va-responsive-b/leads_390.png
- **Recommendation:**
  - Give every target a hit area of at least 24x24, using padding or an `::after` hit-slop so the visual size can stay. Start with Refresh flows, Copy URL, show-password, Dismiss and the inline auth links.
  - Under `@media (pointer: coarse)`, set a 44x44 minimum for chips, checkboxes, icon buttons and tabs.
  - Keep destructive controls (Delete room, Delete node, Reset) and the per-row Call button at least 8px from other targets, or move them into an overflow menu with a confirm step.

### F-A11Y-024 — Icon-only buttons: no name at all below 640px on Leads, and many others named only by `title`
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-B-11, A11Y-AUTO-21
- **Pages:** /leads, /call-reports, /meeting-agent, /assistant, sidebar
- **Evidence:** WCAG 2.2: **4.1.2 Name, Role, Value (A)**.
  - At 390px the Leads Refresh and Export buttons are 37x25, with `aria-label` null and `title` null. Their only text is `<span class="hidden sm:inline">`, which is `display:none`, so they have **no accessible name**.
  - Named by `title` only:
    - 24 Leads per-row call buttons ("Call <name> (c)");
    - 50 Call Reports "Download CSV" buttons;
    - Meeting Agent "Copy URL" and "Delete room";
    - Assistant "Attach a file" and "Send";
    - "Sign Out".
  - `title` isn't exposed on touch devices and is announced inconsistently.
- **Screenshots:** audit/screenshots/va-responsive-b/leads_390.png, audit/screenshots/va-a11y-auto/call-reports.png
- **Recommendation:**
  - Replace `hidden sm:inline` with `sr-only sm:not-sr-only`.
  - Give every icon-only button an `aria-label`, and keep `title` only as a tooltip.
  - Per-row names should say which row they act on, for example "Download CSV for call at <time>".

### F-A11Y-025 — Login: autofill blocked, show-password focus invisible, a 16px toggle, and a placeholder that looks like a saved password
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-MANUAL-16, PUBLIC-SITE-13 (autocomplete and toggle part)
- **Pages:** /login (sign-in and sign-up modes)
- **Evidence:** WCAG 2.2: **1.3.5 Identify Input Purpose (AA)**, **3.3.8 Accessible Authentication (Minimum) (AA)**, **2.4.7 Focus Visible (AA)**, **2.5.8 Target Size (Minimum) (AA)**.
  - The email field has no `autocomplete`, and the password has `autocomplete="off"` in both modes. The A11Y-AUTO-01 verifier re-confirmed both. By contrast, /forgot-password labels its field and sets `autocomplete=email`.
  - The show-password control is a `<button aria-label="Show password">` that correctly flips its label and the input type. But it is 16x16, sits inside the input, and has `outline:none; box-shadow:none`, so focus is not visible.
  - The "••••••••" placeholder looks like a saved password.
  - The sign-up toggle is 12px #7a8397 on white (3.8:1) and is a `type="submit"` button inside the form.
  - Errors appear only as native browser bubbles, with no `aria-invalid` and no inline text.
- **Screenshots:** audit/screenshots/va-a11y-manual/30-login.png, audit/screenshots/va-a11y-manual/32-login-showpw-focus.png, audit/screenshots/va-public-site/login_default.png, audit/screenshots/va-verify-public-site/login_signup_mode.png
- **Recommendation:**
  - Use `autocomplete="email"` (or `username`) with `current-password` for sign-in, and `new-password` for sign-up.
  - Make the show-password toggle 32x32 with a visible focus ring and `aria-pressed`.
  - Remove the dotted placeholder.
  - Make the sign-up toggle `type="button"` with at least 4.5:1 text.
  - Show errors inline, linked through `aria-describedby` and `aria-invalid`.

### F-A11Y-026 — Heading and landmark gaps: login has no H1 or landmarks, data pages have only an H1, public pages lack `main`
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-AUTO-18, PUBLIC-SITE-18 (landmark and heading part), A11Y-MANUAL-16 (H1 and main part), PUBLIC-SITE-13 (H1 part)
- **Pages:** /login, /leads, /call-reports, /personal-agents, /dashboard, /analytics, /flow-builder, /, /pricing, /security, /docs, /docs/integrations, /changelog, /about, /status, /build.html
- **Evidence:** WCAG 2.2: **1.3.1 Info and Relationships (A)**, **2.4.6 Headings and Labels (AA)**.
  - /login: no H1 ("Welcome Back" and "Create Account" are H2s) and no `main`, `header` or `nav`. axe reports `region` ×10.
  - App pages:
    - Leads, Call Reports and Personal Agents have only the H1, with no headings for the KPI strip, filters or table.
    - Dashboard panel titles (CUSTOMER INTEL, TRANSCRIPT FEED) are styled text, not headings.
    - Analytics has a clean H2 per section, but the signed-in user's own name is an H3.
    - Flow Builder's `header` carries a role that axe disallows (`aria-allowed-role`).
  - Public pages:
    - Home skips from H2 to H4 four times (axe `heading-order`).
    - There is no `main` on pricing, security, docs, docs/integrations, changelog, about, status or build.html, and no `nav` on pricing.
- **Screenshots:** audit/screenshots/va-a11y-auto/login-signedout.png, audit/screenshots/va-a11y-auto/home-signedout-full.png
- **Recommendation:**
  - Login: make the card title an H1 inside `<main>`.
  - App: use an H2 for every panel or section title, and render the user's name as text, not a heading. Remove the disallowed role from Flow Builder's `<header>`.
  - Public site: one shared layout with `<header><nav><main><footer>`, and fix the home heading order.

### F-A11Y-027 — Flow shortcuts dialog and node editor: focus never enters, the dialog is clipped, and Esc misbehaves
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** A11Y-MANUAL-17
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.4.3 Focus Order (A)**, **2.4.11 Focus Not Obscured (Minimum) (AA)**.
  - Shortcuts dialog (`?`):
    - It is a proper `role="dialog" aria-modal="true"` labelled "KEYBOARD SHORTCUTS", but `activeElement` stays `<body>`, and Tab moves to canvas edges behind it.
    - It is rendered inside the canvas container, so at 1440x900 its title is clipped by the toolbar and the rows below about 880px are cut off.
    - Esc closes it, but focus stays on `<body>`.
  - Node editor (opened with the mouse):
    - It is a plain `div` with an H3 "SPEAK NODE", and focus stays on the node.
    - The LABEL and MESSAGE fields are unlabelled.
    - Esc does not close it, although the shortcut sheet says "Close panel / dialog — Esc".
- **Screenshots:** audit/screenshots/va-a11y-manual/45-flow-shortcuts.png, audit/screenshots/va-qa-a/flow_shortcuts_dialog.png, audit/screenshots/va-a11y-manual/46-flow-node-click.png
- **Recommendation:**
  - Portal the shortcuts dialog to `<body>` and centre it with `max-height: 90vh; overflow: auto`.
  - On open, focus the dialog heading or close button and trap focus. On close, return focus to the `?` button or the previously focused node.
  - Wire Esc to close the node editor and return focus to its node. Label the editor fields (F-A11Y-003).

### F-A11Y-028 — The flow canvas tab order follows creation order, and edge names expose internal IDs
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** A11Y-MANUAL-18
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.4.3 Focus Order (A)**, **2.4.6 Headings and Labels (AA)**, **1.1.1 Non-text Content (A)** (minimap).
  - The 26 nodes and 27 edges make 53 sequential tab stops in DOM creation order. The node y-positions jump around: 282 → 354 → 460 → 580 → 531 → 791 → 520 → 757 → 653.
  - Some edge names expose IDs, such as "Edge from node_1785140237056 to node_178…". Others are readable ("Edge from start to greet").
  - The minimap is an `svg role="img"` with no name.
  - React Flow's defaults are kept, which is good: nodes are `role=group` with instructions in `aria-describedby`, and keyboard moves are announced.
- **Screenshots:** audit/screenshots/va-a11y-manual/44-flow-tab-edges.png, audit/screenshots/va-a11y-manual/41-flow-loaded.png
- **Recommendation:**
  - Order nodes in the DOM topologically, or top to bottom. Consider making the canvas a single tab stop with arrow keys that follow connections.
  - Give edges `ariaLabel` built from node labels, for example "Greet & Introduce to Confirm Interest (YES)".
  - Name the minimap ("Flow overview"), or hide it with `aria-hidden`.

### F-A11Y-029 — Marketing home: scroll regions can't be reached by keyboard, and CTA and meta text fall below AA
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** A11Y-AUTO-19
- **Pages:** / (signed out, default dark theme)
- **Evidence:** WCAG 2.2: **2.1.1 Keyboard (A)**, **1.4.3 Contrast (Minimum) (AA)**.
  - axe reports `scrollable-region-focusable` ×2 (serious): the `.cd-trans` transcript demo and `.vds-track`.
  - CTA white on #7c6bf5 is 3.98:1 (fix under F-A11Y-009). Mono meta text #7b8196 on #1a1d26 is 4.35:1.
  - The gradient-clipped headline span ("handle every call.") has transparent text, so its contrast needs a manual check against both gradient ends.
  - Working as it should: the rotating language ticker has `aria-live="off"`, and reduced motion is respected.
- **Screenshots:** audit/screenshots/va-a11y-auto/home-signedout.png, audit/screenshots/va-a11y-auto/home-signedout-full.png
- **Recommendation:**
  - Give each scroll container `tabindex="0"`, `role="region"` and an `aria-label` ("Sample call transcript"), or make them non-scrolling.
  - Set meta text to `#8a90a4` or lighter (5.29:1 on #1a1d26).

### F-A11Y-030 — Naming and structure polish: label-in-name, panel headings, misleading ↗ icons, reversed tab order
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** A11Y-MANUAL-24
- **Pages:** /dashboard, /settings, /personal-agents, /leads (New Lead)
- **Evidence:** WCAG 2.2: **2.5.3 Label in Name (A)**, **1.3.1 Info and Relationships (A)**, **2.4.3 Focus Order (A)**, **2.4.6 Headings and Labels (AA)**.
  - The visible "SAVE CONTEXT" button is named "Save customer context — agent will use this data". The visible phrase is not contained in that name, so a speech command such as "click Save context" can fail.
  - The panel titles CUSTOMER INTEL, TRANSCRIPT FEED and IDENTITY are not headings. The New Lead title is an H3 under the H1.
  - The Settings sub-nav shows ↗ external-link icons on links that open in the same tab.
  - Settings tab order:
    - "Save Changes" comes before the sub-nav;
    - "Connect Google Account" (y=862) is focused before "Connect Microsoft Account" (y=830), the reverse of the visual order.
  - The Personal Agents NEW TASK disclosure has no `aria-expanded` (see F-A11Y-016).
- **Screenshots:** audit/screenshots/va-a11y-manual/53-settings-tab28.png, audit/screenshots/va-a11y-manual/91-personal-agents-newtask.png, audit/screenshots/va-ux-audit/crop_settings_nav_external_icons.png
- **Recommendation:**
  - Start each accessible name with the visible text ("Save context: agent will use this data"), or drop the `aria-label`.
  - Use H2 for panel titles, and H2 for dialog titles inside a dialog.
  - Remove ↗ icons from same-tab links.
  - Order the DOM to match the visual order.

---


### Appendix — Refuted / not reproduced

No owned finding was refuted outright. The adversarial verifier did refute, or fail to reproduce, the following sub-claims. They are excluded from the findings above.

| Source | Claim | Verifier note |
|---|---|---|
| A11Y-AUTO-11 | No single-pointer alternative to drag-to-connect (2.5.7) | Clicking a source handle and then a target handle created an edge (React Flow click-connect); the verifier discarded it by reloading. 2.5.7 passes. The keyboard failure stands (F-A11Y-001). |
| A11Y-AUTO-04 | Status chips fail 1.4.1 Use of Color | Every chip carries a text label, so colour is not the only cue. The contrast part stands (F-A11Y-019). |
| A11Y-MANUAL-04 | Esc does not close the Leads drawer; the drawer path is "hidden" | Esc closed the drawer in two tests (from BODY and from a focused checkbox). The J/K legend is visible on screen. |
| A11Y-MANUAL-06 | Prefilled Customer Intel inputs have no accessible name | The placeholder remains the name alongside the value. Also, Settings labels have no `for` attribute at all, rather than `for=""`. |
| QA-A-06 | Toolbar menus don't close on Escape; items unreachable (91 stops) | One Escape sets `aria-expanded=false` and the menu fades within about 600ms with focus on the trigger. The first item is about 47 stops away and can be reached (F-A11Y-011). |
| A11Y-AUTO-09 | The wallet alert is re-inserted after Refresh and on client-side navigation | A MutationObserver saw 0 re-insertions and the same node was kept. The alert is re-rendered only on full page loads (F-A11Y-015). |
| A11Y-AUTO-10 | 12 infinite animations on /analytics under reduce; 2.3.3 failure | 6 found, 3 of them loading spinners. 2.3.3 covers interaction-triggered animation, so it was misapplied. 2.2.2 stands (F-A11Y-022). |
| A11Y-MANUAL-07 | The 1x1px checkbox input is a target-size defect | This is the standard sr-only pattern, and the clickable label is 20x20, which likely passes 2.5.8 through spacing. The name and focus defects stand. |
| A11Y-AUTO-07 (Leads) | Leads rows are not keyboard-reachable | j/k + Enter opens the drawer, so it is operable. It is not focus-based or exposed to assistive tech (F-A11Y-010). |
| VISUAL-AUDIT-06 / UX-AUDIT-13 sample values | STANDBY 2.12:1; "Awaiting connection" 2.4:1 (1.5:1 in UX-AUDIT); disabled Test Call counted as failing | STANDBY pulses between 2.1 and 4.4:1 (2.1 is its lowest point). "Awaiting connection" is 3.0:1. Disabled controls are exempt under 1.4.3. All the remaining text still fails (F-A11Y-008). |

**Severity changes applied from verification:**
- critical → high: A11Y-AUTO-01, A11Y-MANUAL-02.
- high → medium: A11Y-AUTO-04, 05, 09 and 10; A11Y-MANUAL-04, 07, 08 and 09; QA-A-06; PUBLIC-SITE-08.
- A11Y-AUTO-03 was rated medium by its verifier. It is merged into F-A11Y-009 at high, per VISUAL-AUDIT-03's verifier; the reason is given in that finding.

---

## 3F. Findings — Functional bugs, performance, public site & auth

This section consolidates the functional, data-integrity, performance, public-marketing-site and auth findings. It draws on QA agents A and B, the signed-out public-site auditor, and the explorer, UX, visual, design-system, responsive and a11y agents where their findings overlap.

**How to read it**
- Severities are shown after the adversarial verifier's corrections were applied. Where I changed a severity myself, the Evidence line says so.
- "Observed under simulated network failure" means the audit's read-only guard blocked the write. The finding is about how the UI reports that failure, not about the failure itself.
- No live writes were made. Flow names and customer or lead data are replaced with generic references.

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 12 |
| Medium | 22 |
| Low | 5 |
| Refuted | 0 (see the appendix for sub-claims that were not reproduced) |

---

### F-QA-001 — The /about page makes placeholder-looking or unverifiable company claims that contradict /security
- **Severity:** critical · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-01
- **Pages:** /about, /blog (also contradicts /security and /)
- **Evidence:**
  - The /about timeline was re-checked live. It says, word for word:
    - 2024: "First enterprise pilot with" a named real bank
    - 2025: "Series A funding — $12M raised"
    - 2025: "1M+ calls processed milestone"
    - 2026: "SOC 2 Type II Certified"
  - The story claims "some of India's largest enterprises, handling millions of calls".
  - The team section lists six people with initials-only avatars and no photos or links. Their roles are CEO & Co-Founder, CTO & Co-Founder, VP Eng, Head of AI Research, Head of Product and Head of Design.
    - None of the six is either of the two founders shown with 240px photos on /contact.
    - Five of the six names are the bylines on all five /blog posts.
  - /security §13 says the company has "not yet completed an external security audit". §11 says "SOC 2 Type II — readiness work in progress; targeting an observation window starting Q4 2026". The home page says "SOC 2 Type II readiness is in progress".
  - The verifier kept this critical because of legal and compliance exposure: the page claims a certification the company says it does not hold, and it names a real bank. It does not block a user task. The funding and bank claims cannot be verified from the site.
- **Screenshots:** audit/screenshots/va-public-site/about_part0.png, audit/screenshots/va-public-site/about_values_team.png, audit/screenshots/va-public-site/about_part1.png, audit/screenshots/va-verify-public-site/about_top.png
- **Recommendation:**
  1. Unpublish /about today, or cut it to verifiable facts only.
     - Use the real founders, reusing the /contact photos and bios.
     - Give the actual founding date and legal entity, and state the Vaani Labs / StarVox Labs relationship once.
     - List only real milestones.
  2. Remove the named-customer, funding and "SOC 2 Type II Certified" claims unless they are documented. A customer name or logo needs written permission.
  3. Re-attribute /blog posts to real authors, or take the blog down.
  4. Add a publishing gate: any page mentioning a certification, customer or funding must be approved by a named owner, and must link to /security for compliance status.

---

### F-QA-002 — Flow Builder writes to a flow that is only opened, re-saves on non-edits, and shows "Up to date" when saves fail
- **Severity:** high (reported as critical by QA-A and UX-audit; the verifier lowered it) · **Confidence:** verified (confirmed by 3 independent verifier passes, reported by 6 agents)
- **Source findings:** QA-A-01, UX-AUDIT-01, VISUAL-AUDIT-11, RESPONSIVE-A-10, A11Y-AUTO-12, DESIGN-SYSTEM-08
- **Pages:** /flow-builder (and possibly /dashboard, via the theme toggle)
- **Evidence:**
  - **Write on open.** With zero interaction, `PUT /api/flows/f9b04a18…` fired on every load.
    - Timing: about 5.9–7.7 s after navigation, or 3–3.8 s after the nodes render. The a11y agent saw it at about 10 s.
    - Loads observed: 4/4 (QA-A), 2/2 (UX verifier), 3/3 at 768×1024 and 1440×900 (responsive verifier), and zero-interaction loads by the visual verifier.
    - Body: 48,331 bytes, `{name, description, flow_config, is_public}`.
  - **What the write contains.**
    - For the default flow, the 26 nodes and 27 edges match the GET except for key order in 55 objects.
    - For a second flow (`bf11c0a3…`), only React Flow layout fields differed: measured width/height, and a dropped `selected` flag.
    - So the on-open write does not change content today. It still bumps version/`updated_at` and creates a last-write-wins risk.
    - The default flow's `updated_at` was 10:39 UTC (16:09 IST) on the audit day, cause unknown.
    - The auto-written flow is the same one pre-selected in the Cockpit, so it is the flow live calls use.
  - **Other triggers that fire a PUT** (all while blocked):
    - switching flows in "All flows" (3.1 s later);
    - merely selecting an existing node (3.4 s later);
    - adding a Speak node (2.1–4.6 s later; UX-AUDIT-01's "within 700 ms" was not reproduced);
    - dragging a node (about 3 s later);
    - tapping a node on mobile.
    - DESIGN-SYSTEM-08 (unverified) also saw a PUT within 1.5 s of toggling the colour theme on Flow Builder and on Dashboard, with 0 writes in the 6 s idle window before.
  - **False success.** After every blocked PUT, the `role="status"` pill kept saying "Up to date": at 2 s, 4.6 s, more than 7 s and 37 s later. There was no Saving, Unsaved or Failed state, no toast and no retry. A user whose save fails is told their changes are saved.
  - **Not verified:** that half-finished edits go live. This is an inference, because autosave targets the flow that ACTIVATE makes live.
- **Screenshots:** audit/screenshots/va-verify-qa-a/flow_load_13s.png, audit/screenshots/va-verify-qa-a/flow_add_speak_after_put.png, audit/screenshots/va-verify-qa-a/flow_after_add_put_failed.png, audit/screenshots/va-verify-ux-audit/08_flow_after_add_2s.png, audit/screenshots/va-verify-ux-audit/09_flow_after_add_4s.png, audit/screenshots/va-verify-responsive-a/flow-builder_after_drag_failed_save.png, audit/screenshots/va-verify-visual-audit/flow-builder_3s.png, audit/screenshots/va-verify-visual-audit/flow-builder_9s.png, audit/screenshots/va-visual-audit/dark_flow-builder_after_autosave.png, audit/screenshots/va-a11y-auto/flow-builder-loaded.png
- **Recommendation:**
  1. **Never persist on load, flow switch, select, fit-view, resize or theme change.**
     - Keep a `dirty` flag that only user mutations set: add, delete, connect, edit, and a drag that ends in a changed position.
     - Before any PUT, compare a stable hash of the serialised `flow_config` (sorted keys, React Flow runtime fields like `measured`, `selected`, `dragging` stripped) against the last-loaded hash. Skip the PUT when they are equal.
  2. **If normalisation is needed**, do it server-side on read, not as a client write that bumps `updated_at`.
  3. **Bind the save pill to the request lifecycle:**
     - `Saving…` while in flight;
     - `Saved hh:mm` on 2xx;
     - `Couldn't save — Retry` on failure, with a persistent inline banner and a `beforeunload` guard while unsaved;
     - `Offline — changes kept locally` when `navigator.onLine` is false.
  4. **Send conditional writes** (`If-Match`/version field) and return 409 on conflict, to stop silent last-write-wins over a colleague's edits.
  5. **Autosave into a draft revision.** The live flow changes only through ACTIVATE/Publish, which shows a diff.
  6. **Add an e2e test** that loads /flow-builder, waits 15 s, toggles the theme and selects a node, and asserts zero non-GET requests.

---

### F-QA-003 — Undo does not undo node additions, is enabled with nothing to undo, and autosave makes accidental edits stick
- **Severity:** high · **Confidence:** verified
- **Source findings:** QA-A-22
- **Pages:** /flow-builder
- **Evidence:**
  - On a fresh load, Undo is enabled and Redo is disabled.
  - "Add Speak node" took the canvas from 26 to 27 nodes. A PUT fired 3.2 s later, and the pill stayed "Up to date".
  - Two Undo clicks, then two Ctrl+Z presses with the pane focused, all left 27 nodes, and Redo stayed disabled.
  - A history stack does exist: with a node selected, Undo did enable Redo. It just does not record node additions.
  - Combined with F-QA-002, an accidental palette click on the live flow is written to the server and cannot be undone in the UI. The verifier discarded all changes by reloading, so nothing was saved.
- **Screenshots:** audit/screenshots/va-verify-qa-a/fb_undo_at_load.png, audit/screenshots/va-verify-qa-a/fb_after_add.png, audit/screenshots/va-verify-qa-a/fb_after_undo.png, audit/screenshots/va-verify-qa-a/flow_after_ctrlz.png
- **Recommendation:**
  - Route every canvas mutation through one command/history stack: add, delete, move (on drag end), connect, disconnect, edit node config, paste and AI-draft apply. Palette adds are currently bypassing it.
  - Derive `canUndo` from `past.length > 0`, so Undo is disabled on load.
  - Suspend autosave while an undo/redo is being applied, then save the resulting state once.
  - Add unit tests: for each mutation type, apply → undo returns a deep-equal graph, and redo reapplies it.

---

### F-QA-004 — The wallet banner's "Top up" and "Enable autopay" open Settings › Profile, which has no wallet
- **Severity:** high (EXPLORE-SETTINGS-01 rated it critical; the verifier confirmed high) · **Confidence:** verified (5 agents, 2 verifier passes)
- **Source findings:** QA-A-03, QA-B-02, EXPLORE-CORE-01, EXPLORE-DATA-01, EXPLORE-SETTINGS-01 (UX-AUDIT-02 reports the same issue)
- **Pages:** global wallet banner on every authenticated page, including /billing → /settings#wallet, /settings#autopay
- **Evidence:**
  - The anchors are `href="/settings#wallet"` ("Top up") and `href="/settings#autopay"` ("Enable autopay").
  - Both land on "Profile Settings" at scrollY 0. There is no element with id `wallet`, `autopay` or `top*`, and no wallet, top-up, autopay or balance text outside the banner. The Settings sub-nav has no Wallet or Billing item, only "Meetings Billing".
  - Hash routing itself works: a fresh load of `/settings#meetings-billing` opens Meetings Billing. The two targets simply do not exist. A hash change on an already-loaded /settings page is ignored, even for `#meetings-billing`.
  - The banner is on every page while the wallet is ₹0, which blocks calls, and that includes /billing, where the real top-up and autopay controls live.
  - On mobile the bottom bar has no Settings entry, so the banner is also the only route into Settings.
  - Reproduced from /dashboard, /assistant, /billing and others.
- **Screenshots:** audit/screenshots/va-verify-qa-a/settings_hash_wallet.png, audit/screenshots/va-verify-qa-a/settings_hash_autopay.png, audit/screenshots/va-verify-qa-a/settings_hash_meetings_billing.png, audit/screenshots/va-verify-qa-b/settings-hash-wallet.png, audit/screenshots/va-verify-qa-b/settings-hash-autopay.png, audit/screenshots/va-qa-a/banner_topup_landing.png, audit/screenshots/va-qa-a/banner_autopay_landing.png, audit/screenshots/va-explore-core/topup_link_target.png, audit/screenshots/va-explore-data/r2_settings_wallet_anchor.png, audit/screenshots/va-explore-settings/c16_settings_hash_wallet.png, audit/screenshots/va-explore-settings/c20_billing.png
- **Recommendation:**
  1. **Retarget the links.** "Top up" goes to `/billing?action=topup`, which opens the top-up card or sheet with the amount field focused. "Enable autopay" goes to `/billing#autopay`, which scrolls to the UPI Autopay card, highlights it for about 1.5 s and focuses "Enable UPI Auto-Debit". Add the matching `id`s.
  2. **Handle legacy hashes.** On /settings, add client-side handling that forwards `#wallet` and `#autopay` to the new targets, because hashes never reach the server. Also listen for `hashchange`, so in-page hash links work after the first load.
  3. **Hide the banner's CTAs on /billing**, where they duplicate the page's own controls. Name the consequence: "Calls are paused — wallet ₹0".
  4. **Add a regression test** that walks every in-app `href` containing `#` and asserts the target element exists after navigation.

---

### F-QA-005 — Call Reports shows only the latest 50 of 121 calls; there is no pagination, and search, sort and filter cover only those 50
- **Severity:** high (reported as critical; the verifier lowered it) · **Confidence:** verified
- **Source findings:** QA-B-01 (EXPLORE-DATA-04 reports the same 50-of-121 symptom as part of a table-layout finding)
- **Pages:** /call-reports
- **Evidence:**
  - The UI calls `GET /api/calls` with no params. The response is `{total:121, limit:50, offset:0}` with 50 rows, and 50 `tbody tr` render.
  - Scrolling the table's inner scroller (scrollHeight 3093) to the bottom loads nothing more. There is no Next, Load more or page control. The last row is dated 3 Sept.
  - Sorting "Started ▲" puts 3 Sept first, although calls go back to 28 Aug.
  - Typing in search sends no request: it is a client-side filter over the 50 rows (6 of 50 matched).
  - The API already paginates: `?offset=50` and `?limit=200` return the older calls. This is a missing UI feature, not a backend limit.
  - 71 of 121 calls (59%) have no path in the UI, and that share grows with every call. Reproduced on 3 loads, including the `?id=` deep link.
  - The verifier lowered it from critical because nothing is lost or exposed.
- **Screenshots:** audit/screenshots/va-verify-qa-b/callreports-top.png, audit/screenshots/va-verify-qa-b/callreports-bottom.png, audit/screenshots/va-verify-qa-b/callreports-sort-asc.png, audit/screenshots/va-qa-b/callreports-1.png, audit/screenshots/va-qa-b/callreports-scrolled.png
- **Recommendation:**
  - Reuse the Leads pager: page size 25/50/100/200 and a "1–50 of 121" counter. Or use cursor-based "Load more" with virtualised rows.
  - Move search (`q`), sentiment filter, date range and sort to the server (`/api/calls?q=&sentiment=&sort=started_at:desc&offset=&limit=`), so they cover all calls.
  - Keep `page`, `size`, `q`, `sentiment` and `sort` in the URL (see F-QA-016 for the same defect on Leads).
  - Make `?id=` fetch that call directly when it is outside the current page.
  - Add a test with more than 50 fixture calls that asserts the oldest call is reachable.

---


### F-QA-006 — Browser test calls are stored as two call records (inbound and outbound legs), inflating counts
- **Severity:** high · **Confidence:** verified
- **Source findings:** QA-B-04
- **Pages:** /analytics (§07 Recent, §02 Headline), /call-reports
- **Evidence:**
  - Analytics §07 "Recent — the latest ten" shows 5 INBOUND/OUTBOUND pairs.
    - Each pair has the same start minute and durations 1 s apart: 11s/10s, 1m 27s/1m 26s, 11s/10s, 41s/40s, 1m 42s/1m 41s.
    - The inbound row shows no numbers ("— → —").
    - Sentiment sometimes differs within a pair (mixed vs negative).
  - Across all 121 records in `/api/calls?limit=200`:
    - 54 are inbound/browser, 56 are outbound/manual/browser, and 11 are vobiz.
    - 41 are same-minute inbound+outbound pairs (19 of them in the latest 50), with starts 69 ms to 3.3 s apart.
    - Transcript word overlap within a pair is 0.89–0.96 for several long calls, so each pair is one conversation recorded twice.
  - Call Reports labels both legs "BROWSER".
  - About a third of all call records (roughly 41 of 121) are duplicate legs. That inflates "Total calls 121", "This week 24", minutes, averages and sentiment counts.
  - **Not verified:** whether billing is also doubled.
- **Screenshots:** audit/screenshots/va-verify-qa-b/analytics-recent.png, audit/screenshots/va-qa-b/analytics-s4.png, audit/screenshots/va-qa-b/callreports-1.png, audit/screenshots/va-ux-audit/crop_callreports_paired_rows.png
- **Recommendation:**
  1. **Model a call as one conversation with legs.** Add a `conversation_id` (or `parent_call_id`) and write both browser legs under it.
  2. **Count at the conversation level.** Analytics, Call Reports and Leads should count, time, score sentiment for and list conversations. Run sentiment once per conversation.
  3. **Show one row per conversation**, with a "2 legs" disclosure in Call Details.
  4. **Backfill existing records** by pairing inbound/browser with outbound/manual rows whose start is within 5 s and whose transcripts overlap by at least 0.8.
  5. **Confirm billing:** the wallet must be debited per conversation, not per leg.
  6. **Add a contract test:** one browser test call produces exactly one conversation.

---

### F-QA-007 — Hard loads block on a full-screen loader until `/api/auth/me` returns; a slow auth call sends the user to a bare /login; offline navigation dead-ends
- **Severity:** high · **Confidence:** multi-agent (the /login redirect was seen in two agents' first runs and not reproduced in this run)
- **Source findings:** EXPLORE-CORE-18, QA-A-12, VISUAL-AUDIT-18
- **Pages:** all authenticated routes (measured on /dashboard, /meeting-agent, /leads, /settings/organization)
- **Evidence:**
  - **Every hard navigation** shows only a centred "Loading…" spinner, with no sidebar, header or skeleton, until `/api/auth/me` resolves.
    - First H1 appeared at 2.4–5.0 s: 2.6 s on /dashboard and 4.9 s on /meeting-agent, with DOMContentLoaded at 0.8–2.3 s.
    - Under a 600 ms RTT / 200 KB/s throttle, /dashboard showed the blank loader for **10.2 s**.
    - The visual agent captured /dashboard at 1366×768 at 3.5 s with no sidebar, header or Customer Intel. /settings/organization at 2.8 s showed only "BACK TO SETTINGS" and "Loading…".
  - **Every page load** calls `/api/auth/me`, `/api/orgs?include=membership`, `/api/onboarding/state` and `/api/billing/wallet`. The Cockpit fetches the wallet 4 times. The sidebar prefetches 24 RSC payloads (12 routes × 2 hashes).
  - **Sidebar (client-side) navigation** takes 0.8–1.2 s with the old page still shown and no progress indicator.
  - **Auth timeout.** In an earlier run, two `/api/auth/me` calls failed after about 10 s (status 0).
    - The tab went blank, then redirected to a bare `/login`: no `?next=`, no "session expired" message, while the `sb-*` cookies were still present.
    - Several tabs went to /login at once.
    - UX-audit's first run saw the same blank-then-/login redirect.
  - **Offline.** Client-side navigation while offline logs "Failed to fetch RSC payload … Falling back to browser navigation" and lands on Chrome's `chrome-error://chromewebdata/` page. The app shell is lost, and there is no retry.
  - Absolute timings are inflated by a shared lab browser. The pattern (shell rendered after data) is consistent across three agents.
- **Screenshots:** audit/screenshots/va-qa-a/throttle_dashboard_2500ms.png, audit/screenshots/va-qa-a/throttle_dashboard_5000ms.png, audit/screenshots/va-qa-a/throttle_dashboard_h1.png, audit/screenshots/va-explore-core/dashboard_blank_while_auth_me_pending.png, audit/screenshots/va-explore-core/spa_transition_250ms.png, audit/screenshots/va-visual-audit/dashboard_1366x768.png, audit/screenshots/va-visual-audit/leads_1366x768.png, audit/screenshots/va-ux-audit/00_redirected_to_login.png, audit/screenshots/va-qa-a/offline_spa_nav_analytics.png, audit/screenshots/va-qa-a/offline_reload_dashboard.png
- **Recommendation:**
  1. **Render the shell immediately.** Put the sidebar, top bar and banner slot in the `(dashboard)/layout` so they render from the server or the first client paint and never unmount between routes. Gate only page data on `/api/auth/me`, and show per-region skeletons.
  2. **Redirect only on an explicit 401.** On a timeout, network error or 5xx, show an inline "Reconnecting…" bar with Retry. When a redirect is required, use `/login?next=<path>&reason=expired`.
  3. **Single-flight the token refresh** across tabs with `navigator.locks` or `BroadcastChannel`, so one slow refresh does not log out every tab.
  4. **Cache `/auth/me`, orgs, onboarding state and the wallet** in a shared query cache (for example React Query with a `staleTime` of 60 s), and dedupe the four wallet calls.
  5. **Add a top progress bar** for route transitions. Limit `<Link>` prefetch to hover/viewport (`prefetch={false}` on the rail).
  6. **Handle offline.** Listen to `online`/`offline`, show a global "You're offline" banner, and cancel client navigation instead of falling back to a hard navigation.
  7. **Track** time-to-shell and time-to-first-H1 in RUM, with a budget of shell at 1 s or less and H1 at 2.5 s or less on 4G.

---

### F-QA-008 — The Embed page's code snippets display corrupted highlighter markup
- **Severity:** high · **Confidence:** multi-agent (QA-B-08 reports the same issue)
- **Source findings:** EXPLORE-SETTINGS-04
- **Pages:** /api-keys/embed (Settings › Embed)
- **Evidence:**
  - The first rendered line of snippet §01 is `<"vv-attr">class="vv-tag">div "vv-attr">id="vaani-voice"></"vv-attr">class="vv-tag">div>`. The innerHTML contains nested `<span <span="" class="&lt;span">`: the highlighter re-highlights the `<span class="vv-attr">` markup it injected itself.
  - The `//` in `https://…` is styled as a comment, splitting the URL.
  - All 4 snippets are affected.
  - **What COPY puts on the clipboard (the agents disagree):**
    - EXPLORE-SETTINGS intercepted the clipboard and found clean code, so what users read differs from what they paste.
    - QA-B's clipboard read-back was empty, so it could not confirm the payload.
  - The live-preview cards are about 180 px wide, and their text is clipped at the top.
  - This is the page developers use to integrate the widget, so garbled code undermines trust in the whole developer surface.
- **Screenshots:** audit/screenshots/va-explore-settings/c9_embed_snippet.png, audit/screenshots/va-explore-settings/api_keys_embed.png, audit/screenshots/va-qa-b/embed-snippet.png, audit/screenshots/va-verify-qa-b/embed-snippet.png
- **Recommendation:**
  1. **Replace the regex highlighter.** Tokenise the raw snippet once with Shiki or Prism at build time, or with `highlight.js` on an HTML-escaped string, and render its output. Never feed highlighted HTML back into the highlighter.
  2. **Copy the raw source string** (`navigator.clipboard.writeText(snippet.raw)`), not DOM text.
  3. **Add a test** asserting that `pre.textContent === snippet.raw` for every snippet, plus a visual snapshot.
  4. **Widen the preview cards** to at least 280 px and remove the top clipping.

---

### F-QA-009 — Compliance and certification claims contradict each other across the public site
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-02
- **Pages:** /changelog, /docs, /build.html, /about vs /security and /
- **Evidence:** every quote was re-checked live.
  - **What other pages claim:**
    - /changelog v2.0.0: "SOC 2 Type II compliant architecture".
    - /docs card: "Understand our security practices and compliance certifications." with a bullet "SOC 2 compliance overview".
    - /build.html badge: "DPDP + RBI / COMPLIANT BY DEFAULT".
    - /about: "2026 SOC 2 Type II Certified" (F-QA-001).
  - **What /security says:** no external audit yet; SOC 2 is at readiness, with the observation window starting Q4 2026. The home page says "readiness is in progress".
  - **Other contradictions:**
    - /security says "OAuth via Google and Microsoft for workspace SSO". /login offers only "Continue with Google" (`/api/auth/oauth/google`) and "Continue with Meta" (`/api/auth/oauth/facebook`).
    - /security says "TOTP is on the roadmap for Q3 2026". Q3 ended 4 days after the audit date.
    - /security shows "Last updated · April 25, 2026", five months stale.
- **Screenshots:** audit/screenshots/va-public-site/changelog_top.png, audit/screenshots/va-public-site/docs_top.png, audit/screenshots/va-public-site/build_top.png, audit/screenshots/va-public-site/security_part0.png, audit/screenshots/va-public-site/security_part_end.png, audit/screenshots/va-verify-public-site/changelog_top.png
- **Recommendation:**
  1. Make /security the single source of truth for compliance status. Other pages link to it and do not restate it.
  2. Use one approved phrase site-wide, for example "SOC 2 Type II: readiness in progress (observation window from Q4 2026)".
  3. Replace "compliant by default" with specific controls: "Data stored in India (AWS Mumbai)", "Consent captured before outbound calls".
  4. Edit the old changelog entry to "Architecture designed for SOC 2 controls".
  5. Correct the OAuth provider list (Google, Meta), move the TOTP date, and bump "Last updated".
  6. Add the compliance phrases to a CI copy-lint deny-list ("certified", "compliant") that fails outside /security.

---

### F-QA-010 — /signup redirects new users to the sign-in screen, and every "Get started" / "Start free" CTA lands there
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-03
- **Pages:** /signup, /login, /forgot-password, /build.html; all acquisition CTAs on /
- **Evidence:**
  - In a fresh cookie-less context, `GET /signup` redirects to `/login` (chain `/signup → /login`, final status 200). The page renders H2 "Welcome Back / Sign in to access your dashboard", with no H1.
  - **CTAs that point at /signup:**
    - home header "Get started";
    - both "Start free" buttons;
    - "Explore analytics →" and "Open Flow Builder →" (absolute `https://vaanilabs.in/signup`);
    - "Create an account" on /forgot-password.
  - /build.html "Get started" goes straight to `/login`.
  - **The only switch to sign-up** is the BUTTON "Don't have an account? Sign up".
    - Size and type: 216×16 px, 12 px JetBrains Mono.
    - Contrast: `rgb(122,131,151)` on a card of `rgba(255,255,255,.85)`, 3.80:1.
    - Position: y≈738, at the bottom of the card.
  - After clicking the switch, the H2 becomes "Create Account", but the URL stays `/login`, so the mode cannot be linked or tracked.
  - Rated high rather than critical because sign-up is still reachable.
- **Screenshots:** audit/screenshots/va-public-site/signup_route.png, audit/screenshots/va-public-site/login_default.png, audit/screenshots/va-public-site/login_signup_toggle.png, audit/screenshots/va-verify-public-site/signup_route.png, audit/screenshots/va-verify-public-site/signup_toggled.png
- **Recommendation:**
  1. Serve `/signup` as its own route (or `/login?mode=signup`) that opens in "Create account" mode, with an H1.
  2. Replace the footer text link with a segmented control at the top of the card ("Sign in | Create account", at least 40 px tall, 4.5:1 contrast) that updates the URL.
  3. Preserve `next` and UTM parameters across the switch and through OAuth.
  4. Point /build.html "Get started" at /signup.
  5. Add a synthetic check that `/signup` renders the sign-up form, not a redirect.

---

### F-QA-011 — Access and pricing promises contradict each other across the funnel
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-04
- **Pages:** /, /login (sign-up mode), /pricing, /docs, /docs/api/billing, /changelog
- **Evidence:** all quotes were verified live.
  - Home: "Start free and build your first agent in minutes…" and "Free tier · No credit card to start · Cancel anytime".
  - Sign-up mode: "Register for early access (admin approval required)". Changelog v2.0.2 mentions an "approve/reject workflow".
  - /docs Quick Start: "Create an account and get approved".
  - /pricing: "Launch a paid pilot…" and "Public pricing stays sales-led".
  - /docs/api/billing:
    - "Vaani Labs is prepaid… no monthly minimums, no plans";
    - public rates of textvoice 4, voicebot 4, meeting-agent 8 and meeting 1 paise/sec;
    - its H1 is "Per-second billing", yet it says "Voice surfaces round up to whole billable minutes" (`bill_paise = ceil(seconds/60) * sell_rate_per_minute`).
  - The signed-in app uses a prepaid INR wallet.
  - So a visitor is promised free self-serve, then meets approval gating, then a sales-led paid pilot, then a public prepaid price list.
- **Screenshots:** audit/screenshots/va-public-site/home_full_part3.png, audit/screenshots/va-public-site/login_signup_toggle.png, audit/screenshots/va-public-site/pricing_full_part0.png, audit/screenshots/va-public-site/docs_api_billing.png, audit/screenshots/va-verify-public-site/login_signup_mode.png
- **Recommendation:**
  1. Decide the go-to-market model and write one sentence for it that every surface reuses.
  2. **If access is approval-gated:** rename CTAs "Request access", state the review SLA on the CTA and on the post-sign-up screen, and remove "Free tier / No credit card / Cancel anytime".
  3. **If self-serve prepaid exists:** publish the per-minute INR rates, the wallet top-up model and any free credit on /pricing, beside an Enterprise pilot column.
  4. **Fix the billing unit contradiction:** either bill per second, or retitle the page "Per-minute billing, rounded up".

---

### F-QA-012 — /pricing has no prices, no header navigation, and sends enquiries to a third-party email domain
- **Severity:** high · **Confidence:** partially-verified (core claims confirmed; the form-size and "no navigation" sub-claims were corrected)
- **Source findings:** PUBLIC-SITE-05
- **Pages:** /pricing (desktop and 390 px)
- **Evidence:**
  - **Structure:** 0 `<nav>` and 0 `<main>`. The header holds only the logo and "Email us", a `mailto:` on the third-party domain advisio.in; the in-form email link uses the same domain. The booking link goes to an external site. The page does have a full `<footer>` with about 24 site links, so what is missing is header navigation, not all navigation.
  - **No prices:** no currency amount (₹, INR, paise) appears anywhere. The page still says "Every plan includes" with no plans, and "SUCCESS STORY" appears 6 times over generic aspiration copy.
  - **The form** is a 19-control "Start a pilot" intake (the report said 18).
    - 11 text inputs and textareas use their placeholder as the only label.
    - The 3 selects have `aria-label` and the 5 checkboxes have labels.
    - The target rollout date is free text, and there is no `autocomplete`.
  - **Typography:** body copy is JetBrains Mono 14 px, and the step cards are 11 px mono.
  - **Mobile:** at 390 px the page is 6,792 px tall, with only the logo and "Email us" in the top bar and no menu.
- **Screenshots:** audit/screenshots/va-public-site/pricing_full_part0.png, audit/screenshots/va-public-site/pricing_full_part1.png, audit/screenshots/va-public-site/pricing_full_part2.png, audit/screenshots/va-public-site/m_pricing_top.png, audit/screenshots/va-verify-public-site/pricing_top.png, audit/screenshots/va-verify-public-site/m_pricing_top.png
- **Recommendation:**
  1. Rebuild /pricing on the shared marketing layout, with the full header, mobile menu, `<main>` and footer.
  2. Lead with rates in plain language (₹/min per surface, prepaid wallet, autopay, any free credit), plus an "Enterprise pilot — Talk to sales" column, a comparison table and an FAQ.
  3. Move the pilot-scoping form to /enterprise, or to a "Request pilot" modal cut to 5–6 fields (name, work email, company, volume, use case, timeline). Give each field a visible label and `autocomplete`.
  4. Route all enquiries to a single sales address on vaanilabs.in.
  5. Remove the "SUCCESS STORY" labels until real case studies exist.

---

### F-QA-013 — Brand identity is fragmented across public and auth pages: 8+ header variants, 7 type families, two primary colours, two default themes and five names
- **Severity:** high · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-06
- **Pages:** all public pages and auth (/, /pricing, /enterprise, /security, /docs, /docs/integrations, /docs/api, /contact, /build.html, /login, /forgot-password, 404)
- **Evidence:** every sub-claim the verifier spot-checked was accurate.
  - **Headers:** at least 8 variants.
    - Only home has the full marketing nav.
    - /enterprise has its own nav (Pilot, Security, API, "Scope pilot").
    - /docs/api has a white 40 px "BACK TO DOCS" strip (body `#F4F6FA`) above a black page, a "VV API" logotype and a blue "GET A KEY" `rgb(47,95,224)`.
    - /build.html has a separate static nav where "Sign in" and "Get started" both go to /login.
    - /contact shows "VAANI LABS" plus a duplicate "VaaniLabs" wordmark.
  - **Type families (7):** Hanken Grotesk, Sora, Syne, JetBrains Mono (body copy on 7 pages), Instrument Serif italic, Bricolage Grotesque and system ui-sans. Home alone loads 20 font files.
  - **Primary colour and theme:**
    - Violet `#7C6BF5` (`rgb(124,107,245)`) on dark marketing pages.
    - Blue `#2F5FE0` on /login, /forgot-password, 404, /docs/api and light home. The token is named `--saffron`.
    - Marketing defaults to dark; auth, 404 and the app default to light. A visitor changes theme and brand hue at the moment they click "Get started".
  - **Names:** Vaani Labs, VaaniLabs, VaaniVoice (/enterprise lead, `X-VaaniVoice-Signature`), VV API, and StarVox Labs (consent text, founder email domain).
- **Screenshots:** audit/screenshots/va-public-site/enterprise_full_part0.png, audit/screenshots/va-public-site/contact_full.png, audit/screenshots/va-public-site/docs_api_top.png, audit/screenshots/va-public-site/build_top.png, audit/screenshots/va-public-site/login_default.png, audit/screenshots/va-public-site/404.png, audit/screenshots/va-verify-public-site/docs_api_top.png
- **Recommendation:**
  1. **One marketing shell.** Build a single `MarketingLayout` (header with the full nav and mobile menu, 1200 px container, 16/24 px gutters, footer) and use it on every public page. Docs may add a left rail inside the same shell.
  2. **One identity:** one brand name ("Vaani Labs"), one logo lockup, and one default theme for marketing and auth.
  3. **One primary hue** in both themes. If violet, use a darker violet for light-mode primary, not blue. Rename the token to `--color-primary`.
  4. **At most 3 type families:** display, text sans, and mono for code and data only.
  5. **Fold /build.html** into the shell as a Next.js route.
  6. **Name the legal entity once** in the footer.

---


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

---


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

---


### F-QA-036 — The wallet banner renders about 3 s late and pushes the page down
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** QA-B-24
- **Pages:** all authenticated pages (measured on /analytics)
- **Evidence:**
  - The banner appears about 2.9 s after navigation, once `/api/billing/wallet` resolves.
  - It pushes all content down by its height, about 42 px. CLS was 0.028 on /analytics, and the shift is visible between the two captures.
  - The wallet is re-polled every 60 s.
  - The Cockpit fetches the wallet 4 times per load (see F-QA-007).
- **Screenshots:** audit/screenshots/va-qa-b/analytics-1.png, audit/screenshots/va-qa-b/analytics-full.png
- **Recommendation:**
  - Resolve the wallet state server-side in the layout (or from the session), so the banner is in the first paint.
  - Otherwise reserve a fixed-height slot, or render the banner as an overlay or sticky element outside the content flow.
  - Cache the wallet in the shared query cache, so client navigations never re-trigger the shift.

---

### F-QA-037 — Stale queued and in-progress calls, and later calls are not linked to the lead (partly inferred)
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** QA-B-27
- **Pages:** /call-reports, /leads (lead drawer), /analytics (Recent)
- **Evidence:**
  - Among the latest 50 calls, 4 are `queued` and 3 are `in_progress`, all from days earlier.
  - One lead's drawer shows "CALLS 1", with a single "QUEUED 28 Aug, 11:45 pm" entry that is a month old.
  - Analytics Recent shows many later outbound calls to the same masked number.
  - Inferred: Cockpit and browser calls are not attached to the lead record, so the lead stays "New" and Interest stays "—".
- **Screenshots:** audit/screenshots/va-qa-b/leads-drawer.png, audit/screenshots/va-qa-b/callreports-1.png
- **Recommendation:**
  - Add a reaper job that moves calls stuck in `queued` or `in_progress` for more than N minutes to `failed` (reason "No answer / timed out"), and shows that state in the UI.
  - Match calls to leads by normalised E.164 number at call creation, then update the lead timeline, status and interest.

---

### F-QA-038 — A full-screen decorative noise overlay sits at z-index 9999 over the authenticated app
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** EXPLORE-CORE-27
- **Pages:** all authenticated pages
- **Evidence:**
  - `.noise-overlay` has `position: fixed`, `z-index: 9999`, `opacity: 0.02` and `pointer-events: none`, with an SVG noise background covering the whole app.
  - At 2% opacity it is visually negligible, but it:
    - adds a full-viewport compositing layer;
    - sits above every modal, toast and menu in the stacking order;
    - slightly tints every colour-contrast measurement.
- **Screenshots:** —
- **Recommendation:**
  - Remove it from the `(dashboard)` layout and keep it on marketing pages only.
  - If a texture is wanted in the app, put it as a `background-image` on the root surface, not as a top-level fixed layer.

---

### F-QA-039 — Off-theme 404 with gimmicky sci-fi copy, and a meaningless "Enterprise Security Enabled" badge on login
- **Severity:** low · **Confidence:** single-agent (EXPLORE-SETTINGS-03 and QA-B-23 describe the same 404 page seen from inside the app)
- **Source findings:** PUBLIC-SITE-23
- **Pages:** any unknown route (404), /login
- **Evidence:**
  - **The 404 page.**
    - It returns a correct HTTP 404 with `noindex`.
    - It renders light, with a blue `#2F5FE0` primary, while other public pages default to dark.
    - Copy: "SIGNAL LOST / … The neural pathway you're looking for doesn't exist or has been relocated to a different sector." plus "ERR: 0x404 • NODE: MUMBAI-1 • STATUS: DISCONNECTED", which reads like an outage.
    - Its only actions are "Return Home" (always `/`, even for signed-in users) and "Go Back". There is no nav, no search and a generic title.
  - **The login footer** reads "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled", which exposes the build version and claims nothing specific.
- **Screenshots:** audit/screenshots/va-public-site/404.png, audit/screenshots/va-public-site/login_default.png
- **Recommendation:**
  - Use a plain 404 ("Page not found") inside the marketing shell, with links to Home, Docs, Pricing and Contact plus a search box.
  - For signed-in users, render it in the app shell with "Go to Dashboard".
  - Set the title to "Page not found · Vaani Labs".
  - Replace the login footer with "Privacy · Terms · Security" links.

---

### F-QA-040 — Polish inconsistencies on the home page
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-25
- **Pages:** /
- **Evidence:**
  - **Icons.** Emoji icons (🎯🔐🌐, 🛍🏦🩺…) are mixed with line icons in the security section.
  - **Eyebrows.** There are two eyebrow styles: about 1.2 px tracking, and about 4 px tracking with a leading rule ("ENTERPRISE-GRADE SECURITY", "GET STARTED").
  - **Containers.** Widths vary: x≈154–1286 for most sections, x≈180–1260 for security.
  - **Carousel.** The fourth industry card is hard-cropped, with no fade or peek.
  - **Testimonials.** Role text wraps awkwardly ("Founder · NBFC, / Ahmedabad").
  - **Footer.** Headings are lowercase in the DOM and uppercased by CSS.
  - **Light mode.** The hero wave line strikes through the "Speaking …" pill, and only the first proof pill keeps its border.
- **Screenshots:** audit/screenshots/va-public-site/home_full_part0.png, audit/screenshots/va-public-site/home_full_part1.png, audit/screenshots/va-public-site/home_full_part2.png, audit/screenshots/va-public-site/home_light.png
- **Recommendation:**
  - Use one icon set (the line icons already used in the security section).
  - Use one eyebrow token and one container width (1200 px).
  - Give the carousel a fade-mask peek.
  - Reserve a line for role text above the outcome chip.
  - Author the footer headings in their display case.
  - Set a `z-index` or mask so the hero line passes behind the pills.

---

### Appendix 3F — Refuted / not reproduced

**No finding owned by this section was refuted.** The verifier did correct, or fail to reproduce, the sub-claims below. They are excluded from, or qualified in, the findings above.

| Source finding | Sub-claim not reproduced or corrected | Verifier note (summary) |
|---|---|---|
| UX-AUDIT-01 | The autosave PUT fires "within 700 ms" of adding a node | Not reproduced: the PUT came 2.1–4.6 s after the add. "Half-finished edits go live" remains an inference. Lowered from critical to high. |
| QA-A-01 | Opening a flow changes its stored content or "last edited" | The on-open PUT body matched the GET except for key order (55 objects) or React Flow layout fields. A second flow's `updated_at` (4 Sept) did not change after guarded visits. The default flow's same-day `updated_at` has an unknown cause. Lowered from critical to high. |
| DESIGN-SYSTEM-08 | The write is triggered by the theme toggle ("idle 6 s: 0 writes") | Verifiers saw the PUT with zero interaction 5.9–10 s after load, so no toggle is needed. The toggle-specific and Dashboard PUTs were not independently re-checked. |
| EXPLORE-CORE-18 | Slow `/api/auth/me` logs the browser out to a bare /login | Seen only in earlier runs (explore-core and UX-audit). Not reproduced in this run, where sessions stayed valid for 1–1.5 h. |
| QA-B-01 | Critical severity | Lowered to high: nothing is lost or exposed, and the API already paginates. |
| QA-B-03 / QA-B-05 / QA-B-06 / QA-B-07 | High severity | Lowered to medium: same root cause as QA-B-01 (QA-B-03); correct total is visible in the footer (QA-B-05); URL/navigation UX only (QA-B-06); equivalent content exists elsewhere (QA-B-07). |
| QA-B-05 | Zero KPIs under the Contacted/Converted filters are a bug | Arguably correct for the filter. Only the page-2 scoping is a defect. |
| QA-B-04 | Billing is doubled for two-leg calls | Not verified. Only the record and count inflation is confirmed. |
| EXPLORE-SETTINGS-01 | Critical severity | Consolidated at the verifier's high (confirmed via QA-A-03 and QA-B-02). |
| EXPLORE-SETTINGS-04 / QA-B-08 | What COPY puts on the clipboard | Unresolved: one agent intercepted clean code, the other got an empty read-back. |
| PUBLIC-SITE-05 | "18 controls, all placeholder-only"; "no site navigation" | There are 19 controls. The 3 selects have `aria-label` and the 5 checkboxes have labels (11 fields are placeholder-only). A full footer with about 24 links exists; only header nav is missing. |
| PUBLIC-SITE-07 | 40+ vs 12+ languages, sub-200ms vs sub-second, LiveKit/Daily vs Zoom/Meet/Teams, and BYO carriers vs Twilio are contradictions | Compatible pairs, not contradictions. "Hero never mentions India" is weak: Hindi appears in the rotating pill and in later copy. Lowered from high to medium. |

---

## 5. Design-resource guidance digest

**Scope and sources.** This section distils `raw/design-research.md` into rules for redesigning Vaani Labs. The design-resources researcher worked without a browser and studied the four resources the user supplied:
- **Taste Skill** (tasteskill.dev, repo `Leonxlnx/taste-skill`). This covers the main `taste-skill` v2 and its variants `minimalist-skill`, `redesign-skill`, `output-skill`, `soft-skill` and `gpt-tasteskill`.
- **Image-to-Code skill** (`image-to-code-skill`, same repo). It is cited separately for its anti-clutter rules.
- **Vercel Web Interface Guidelines (WIG).** This covers the `web-design-guidelines` agent skill, the `command.md` ruleset it loads, and the longer human-readable README.
- **Awesome Design MD** (`VoltAgent/awesome-design-md`). The repo has about 74 DESIGN.md files. Ten were read closely: Linear, Vercel, Stripe, Raycast, Notion, Supabase, ElevenLabs (voice AI), Intercom (AI agent), Cal.com and Sentry. Resend and Superhuman were skimmed.

Other inputs:
- Vaani observations come from 8 orchestrator scout screenshots at 1440x900 (`audit/screenshots/scout_*.png`). They were not re-checked live. Sections 2 and 3 of this audit hold the measured detail.
- Font-family facts come from `raw/design-system.md`.
- The researcher computed every contrast ratio below with the WCAG 2.x relative-luminance formula.
- The skill files contain agent directives, such as install commands and "generate images first". These were treated as reference data and not acted on.

**Source tags.**

| Tag | Source |
|---|---|
| **[TS]** | Taste Skill family. The variant is named when it matters. |
| **[I2C]** | Image-to-Code skill |
| **[WIG]** | Vercel Web Interface Guidelines |
| **[ADM]** | Consensus across the Awesome Design MD files. A specific system is named when only it supports the rule. |
| **[Inf]** | The researcher's own inference for a voice-AI product. Treat it as a proposal, not a sourced rule. |

Rule IDs (L1, T3, C2 and so on) match section 3 of `raw/design-research.md`, so each rule can be traced back.

**How to use this section.**
- Use 5.3 as the acceptance checklist for every redesigned screen.
- Deliver a Vaani `DESIGN.md` with the redesign, so that screens generated later by agents stay on-system [ADM]. Use the nine-section Awesome Design MD format:
  1. visual theme
  2. colour roles
  3. typography
  4. components
  5. layout
  6. depth and elevation
  7. do's and don'ts
  8. responsive behaviour
  9. an agent prompt guide

### 5.1 What each source contributes, and what to leave behind

| Source | What it is | Adopt for Vaani | Do not adopt |
|---|---|---|---|
| Taste Skill, main v2 [TS] | An anti-template design skill: it infers the brief, sets three dials (layout variance, motion intensity, visual density), lists "AI tells", and has a redesign protocol and pre-flight checks. | The anti-slop vocabulary. The "one system" locks (colour, shape, copy register). The redesign protocol. The mandatory checks for button contrast, CTA wrapping and duplicate CTAs. Marketing-site layout guidance. | Its layout-variance rules inside the app. The skill declares dashboards, data tables and multi-step product UI **out of scope** and points those to enterprise systems (Fluent, Carbon, Atlassian, Polaris) and grid libraries (TanStack Table, AG Grid). |
| `minimalist-skill` [TS] | Utilitarian minimalism in the style of Notion and Linear. It is the most compatible variant for a professional SaaS. | Near-black body text. Hairline borders. Card radius capped at 8-12 px. Flat primary buttons. Muted pastel tags. `<kbd>` keycap styling. | Its purely stylistic bans on Inter, Lucide and pill shapes (see 5.4). Its scroll-reveal entrance, which belongs on marketing only. |
| `redesign-skill` [TS] | An audit-first upgrade checklist. | The priority order of levers: typography, then spacing, then colour, then motion, then recomposing sections, then replacing whole blocks. Also its product-UI audit items: current-page indicator in navigation, no modals for everything, no `window.alert()`, no exclamation marks in success messages, no "Oops", no z-index 9999. | Nothing that conflicts with the above. |
| `soft-skill`, `gpt-tasteskill` [TS] | Agency-style marketing: glass, double bezels, heavy GSAP motion. | Only the drawer easing curve (M2). | Everything else. Not appropriate for an operations app. |
| `output-skill` [TS] | Bans placeholders and half-finished output. | No lorem ipsum, no stand-in "Acme" data, no stub sections in shipped screens. | n/a |
| Image-to-Code [I2C] | An image-first build pipeline. | Its micro-UI clutter list: unnecessary pills, decorative code-like tags, tiny badges everywhere, meaningless metadata rows, pseudo-enterprise control labels, decorative system markers, filler status microcopy. Its anti-nested-box rule. | The pipeline itself. |
| Vercel WIG [WIG] | Concrete, auditable rules for interactions, animation, layout, content, forms, performance, visual design and copy. | Nearly all of it. It is the most directly applicable source for product UI. | Vercel's house copy style where it conflicts with the other sources (Title Case, em-dashes). |
| Awesome Design MD [ADM] | Design systems written as plain-text files. Most describe the companies' **marketing sites**. | The product-grade decisions: scale steps, a weight ceiling of 600, gray ladders, radius and elevation philosophy, single-accent discipline, a 4 px spacing base. Also the file format itself. | Brand identities: Stripe's gradient mesh, Vercel's mesh, Raycast's red stripes, ElevenLabs' orbs, Sentry's mascots. |

**What the ten DESIGN.md systems agree on** [ADM]:
- **One chromatic accent, used rarely.** Several AI-era brands use a near-black primary (Vercel, Cal.com, ElevenLabs, Intercom). Intercom uses its orange only on AI-product CTAs and badges. ElevenLabs has no saturated CTA colour at all.
- **A weight ceiling of 600, or 500 for some.** Display sizes get negative tracking of roughly 3-4% of the font size, falling to 0 at body size. No system uses 700-800 for headings. Vaani's Analytics H2s use Sora 800.
- **Hairlines and a surface ladder instead of heavy shadows.** When shadows appear, they are 2-12% alpha, stacked, sometimes tinted toward a hue (Stripe), and always paired with a 1 px border or ring. Linear and Raycast use essentially no shadows in dark mode.
- **Radius clusters.** Controls use 6-8 px, cards 12 px, and 16 px is the maximum. Pills are either a deliberate brand CTA (Vercel, Stripe, ElevenLabs) or reserved for tabs, status and avatars (Linear, Notion, Supabase, Intercom, Cal.com). The rectangle camp suits a dense operations product.
- **Mono is scoped to technical tokens.** Use it for code, IDs and keycaps. Linear and Intercom keep mono out of chrome. Intercom rejects all-caps tracked eyebrows and sets its eyebrows in sentence case at 14/500.
- **A 4 px spacing base.** The standard steps are 4, 8, 12, 16, 24, 32, 48, 64 and 96.
  - Card padding is about 24 px, or 16 px in dense grids.
  - Controls are 32, 40 or 48 px tall.
- **Transactional surfaces are denser than marketing** (Sentry, Stripe).
- **Semantic colour is reserved for state.** Chart palettes are kept apart from brand chrome, as in Intercom's separate report palette.
- **Marketing shows the real product** rather than illustrations.

### 5.2 Headline guidance (read this first)

1. **One design language on every page.** Today Vaani mixes at least four dialects:
   - HUD-style mono uppercase on Dashboard and Leads
   - editorial serif and "§" numbering on Analytics
   - a purple accent on Meeting Agent
   - plain sans in sentence case on Assistant and Call Reports

   The last dialect is closest to the target and is the baseline. Unifying the dialects will lift perceived quality more than any other single change. [TS one system per project, colour and shape locks; ADM]
2. **Use a product density profile, not a marketing one.** Suggested dial settings:
   - App: variance 2-3, motion 2-3, density 6-7.
   - Marketing: variance 5, motion 4, density 3.

   Take Taste Skill's anti-slop bans into the app, but not its marketing layout moves: asymmetric bento, 96 px+ section padding, scroll reveals. [TS]
3. **Colour is scarce.** Use a neutral gray ladder and **one** accent for the primary CTA, focus, selection, links and the active nav item. Semantic colours appear only for real state (call live, failed, sentiment, wallet low). [TS max one accent, saturation under 80%; ADM Linear allows no second chromatic colour]
4. **Depth comes from hairline borders and a surface ladder.** Shadows are tiny, layered and used in light mode only. Use a card only when elevation communicates real hierarchy. Otherwise group with dividers or space. [ADM Linear, Raycast, Vercel; TS]
5. **One sans at weights 400, 500 and 600.**
   - Put tabular numerals on every number.
   - Keep mono for data tokens only.
   - Use no decorative serif anywhere in the dashboard.

   [ADM; WIG; TS]
6. **Design every state:** empty, sparse, dense, loading, error with a next step, disabled with a reason, and permission denied. [WIG]
7. **Flow builder essentials:**
   - fixed-width nodes that never overlap
   - a neutral grid
   - category colour confined to the icon tile
   - labelled ports with 24 px hit areas
   - a right-hand inspector instead of modals
   - a persistent issues list
   - a keyboard alternative for every drag
   - selection deep-linked in the URL
   - an unsaved-changes guard

   [WIG; ADM; Inf]
8. **Voice product essentials:**
   - one explicit call-state machine, where each state has a label, icon, colour and live-region announcement
   - a speaker-labelled streaming transcript with "Jump to latest"
   - audio visuals that move only on real audio
   - `en-IN` money formatting
   - `type="tel"` phone inputs
   - confirmation before anything that dials real customers

   [Inf; WIG]

### 5.3 Rules checklist

#### 5.3.1 Layout

- [ ] **L1 One app shell.** Every authenticated page uses the same sidebar, the same page header and a content area. The header holds the title, a one-line description, at most one primary action, and secondary actions. Its height, padding and title style are identical everywhere. [TS colour and shape locks; ADM]
- [ ] **L2 Gutters and widths.**
  - Page gutters are 24 px at 1024 px and wider, and 16 px on mobile.
  - Reading pages (Settings, Billing, Knowledge) have a max width of about 1280-1440 px.
  - Canvas and table pages (Flow Builder, Call Reports, Leads) are full-bleed.

  [ADM Vercel; TS]
- [ ] **L3 One 4 px grid.** Inside panels, the vertical rhythm is:
  - 8 px from label to value
  - 16 px between fields
  - 24 px between groups
  - 32-48 px between page sections

  [ADM]
- [ ] **L4 Cards only where elevation means something.**
  - A KPI row is a single bordered strip with 1 px dividers. The Leads KPI strip already does this.
  - No box inside a box inside a box. Dashboard fields currently sit in bordered boxes inside a bordered panel.

  [TS cards rule; I2C anti-nested-box]
- [ ] **L5 No idle centre stage.** Do not give the middle of the viewport to a decoration. Give that space to the primary task: pick contact, pick flow, dial, then the live transcript. [TS motivated design; WIG no dead ends; Inf]
- [ ] **L6 Labelled, grouped sidebar.**
  - Show text labels by default at 1280 px and wider, collapsible to icons.
  - Mark the active item clearly.
  - Group the 12 destinations:

  | Group | Destinations |
  |---|---|
  | Operate | Assistant, Cockpit, Rep Console, Meeting Agent, Personal Agents |
  | Build | Flow Builder, Knowledge |
  | Data | Leads, Call Reports, Analytics |
  | Account | Billing, Settings |

  [TS redesign: current-page indicator; WIG icons have labels]
- [ ] **L7 Sticky chrome never hides focus.** The wallet banner, page header and table header must never cover a focused element. Keep total sticky chrome at 96 px or less on a 900 px tall viewport. [WIG]
- [ ] **L8 Deliberate, optical alignment.**
  - Nudge icons 1-2 px against text where needed.
  - Right-align numeric table columns.
  - Bottom-align buttons across a group of cards.

  [WIG; TS redesign]
- [ ] **L9 No horizontal page scroll.** A wide table scrolls inside its own container, with a sticky first column and a visible edge fade. [WIG]

#### 5.3.2 Typography

- [ ] **T1 Two families only: one UI sans and one mono.**
  - Keep the shipped **Hanken Grotesk**, which is already the `--font-sans` token, or move to Geist.
  - Keep **JetBrains Mono** strictly for phone numbers, IDs, timers, durations, code and API keys.
  - Retire Sora, Instrument Serif, Syne, Rajdhani and every unused `@font-face` registration. Today 12 families are registered and 5 are rendered.
  - Add **Noto Sans Devanagari** (sans, not serif) as the fallback for Hindi transcripts.

  [TS; ADM; Inf]
- [ ] **T2 Fix the root font variable.** The UI must never fall back to the system sans. Preload and subset fonts with `unicode-range`. [WIG; design-system finding]
- [ ] **T3 App type scale** (size/line-height in px, weight, tracking):

  | Role | Spec |
  |---|---|
  | Caption | 12/16, 400 |
  | Small (tables, meta) | 13/18, 400 or 500 |
  | **Body (app default)** | **14/20, 400** |
  | Body large | 16/24, 400 |
  | Title small | 16/24, 600 |
  | Title | 20/28, 600, -0.2 |
  | Page title | 24/32, 600, -0.4 |
  | Display (marketing only) | 32/40 at -0.8; 48/52 at -1.8; 64/68 at -2.6 |

  Use weights 400, 500 and 600 only, with 600 as the ceiling. [ADM Linear, Vercel, Cal.com]
- [ ] **T4 Tracking.**
  - Negative tracking only at 20 px and above.
  - Body text stays at 0 and never gets positive tracking.
  - No letter-spacing wider than +0.02em, except rare 11 px all-caps table headers.

  [ADM]
- [ ] **T5 No mono uppercase wide-tracked labels on fields, cards and sections.**
  - Field labels are sentence case at 13/500 in the secondary colour.
  - Uppercase is allowed only for table column headers or a single badge style.

  [TS eyebrow restraint and redesign's all-caps warning; ADM Intercom; I2C pseudo-enterprise labels]
- [ ] **T6 Tabular numerals** (`font-variant-numeric: tabular-nums`) on every number that updates or is compared: timers, durations, counts, INR amounts, latency, percentages and numeric table columns. [WIG; ADM Stripe]
- [ ] **T7 Line-height.**
  - 1.5 for functional UI text.
  - 1.6 for long text (transcripts, knowledge).
  - About 1.7 for Devanagari, so vowel marks fit.

  [ADM Sentry; Inf]
- [ ] **T8 Measure.** Paragraphs are at most about 65-75 characters wide in Knowledge, Assistant replies and docs. [TS]
- [ ] **T9 Wrapping.** Use `text-wrap: balance` on headings and `pretty` on short paragraphs. No widows in empty-state copy. [WIG]
- [ ] **T10 Typographic details.**
  - Use the real ellipsis character `…` and curly quotes.
  - Put a non-breaking space between a number and its unit (`90 s`, `10 MB`).
  - Let `Intl` handle the rupee sign.

  [WIG]

#### 5.3.3 Colour

- [ ] **C1 One neutral family.** Choose either cool zinc or neutral gray, and never mix warm and cool grays. [TS]
- [ ] **C2 One accent**, likely the Vaani brand blue or indigo. It is used for:
  - the primary CTA
  - the focus ring
  - selection
  - links
  - the active nav item

  To get there:
  - Remove the purple from Meeting Agent.
  - Remove the green from ACTIVATE. It is a primary action, not a success state.
  - Remove the teal from Import CSV.

  [TS colour lock; ADM all]
- [ ] **C3 Semantic colours for state only.**

  | Semantic | Used for |
  |---|---|
  | Success | Connected or live, completed |
  | Warning | Low balance, ringing, pending |
  | Danger | Failed, negative sentiment, destructive |
  | Info | Same as the accent |

  Each state has a soft background, an AA-contrast text colour on that background, and an icon. [WIG redundant status cues; ADM Vercel]
- [ ] **C4 Badge text passes AA on its own soft background.** These starter pairs have been checked:

  | Colour | Text on background | Contrast |
  |---|---|---|
  | Blue | `#1e40af` on `#dbeafe` | 7.15:1 |
  | Green | `#166534` on `#dcfce7` | 6.49:1 |
  | Red | `#991b1b` on `#fee2e2` | 6.80:1 |
  | Amber | `#92400e` on `#fef3c7` | 6.37:1 |

  [WIG; TS form contrast check]
- [ ] **C5 Primary button contrast.**

  | Label on fill | Contrast | Result |
  |---|---|---|
  | White on `#2563eb` | 5.17:1 | Pass |
  | White on `#1d4ed8` | 6.70:1 | Pass |
  | White on green-600 `#16a34a` | 3.30:1 | **Fail** |
  | White on `#15803d` | 5.02:1 | Pass (use this if a green button is kept deliberately) |
  | Black on `#2563eb` | 4.06:1 | Fail |

  The existing `.btn-saffron` black-on-blue measured 3.83:1. [TS button contrast check]
- [ ] **C6 No AI-template chrome.**
  - No pure `#000` or `#fff` canvas in dark mode.
  - No neon glows.
  - No gradient text in the app.
  - No purple-to-blue gradient backgrounds.

  [TS AI tells and its rule against default purple/blue glow; ADM Linear no atmospheric gradients]
- [ ] **C7 Separate chart palette.** It is colour-blind-safe, uses 5-6 hues at most, and stays apart from brand chrome. Sentiment always combines an icon, a label and a colour. [WIG; ADM Intercom report palette]
- [ ] **C8 Hue consistency.** On a tinted surface, such as the wallet banner or a selected row, tint the borders and text toward the same hue. [WIG]
- [ ] **C9 Do not copy reference grays blindly.** Some reference grays are safe only for disabled or decorative text:
  - Vercel's mute gray `#888` on white is 3.54:1.
  - Linear's tertiary gray on its canvas is 3.62:1.

  Use these for readable secondary text instead:

  | Surface | Use | Avoid |
  |---|---|---|
  | White | `#737373` (4.74:1) or darker | `#888` |
  | Dark canvas `#0a0a0b` | `#8b8b93` (5.85:1) | `#71717a` (4.09:1) |

  [WIG contrast; researcher's measurements]

#### 5.3.4 Spacing and density

- [ ] **S1 Spacing scale.** 4 px base with steps 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. [ADM]
- [ ] **S2 Control heights.**

  | Height | Use |
  |---|---|
  | 32 px | Compact: toolbars, table actions |
  | 36 px | Default |
  | 40 px | Primary forms |
  | 44 px minimum | Touch |

  [WIG; ADM Vercel]
- [ ] **S3 Table rows.**
  - Rows are 44 px by default and 36 px in compact mode.
  - Horizontal cell padding is 12-16 px.
  - Leads rows are about 65 px today, which is low density for a CRM.

  [ADM; Inf]
- [ ] **S4 Panel padding.**
  - App cards and panels: 16-20 px, with 24 px as the maximum.
  - Marketing cards: 24-32 px.

  [ADM Raycast, Linear]
- [ ] **S5 Density by surface.** App density is 6-7.
  - Pages where users scan and compare are dense: Leads, Call Reports, Analytics tables.
  - Setup forms are calmer: Settings, Billing.

  [TS dials; ADM Sentry]

---

#### 5.3.5 Components

- [ ] **K1 Buttons.** Allow one filled primary per view region. The other tiers:

  | Tier | Style |
  |---|---|
  | Secondary | Neutral surface with a 1 px border |
  | Tertiary | Ghost |
  | Destructive | Danger text or border. It fills only inside the confirmation dialog. |

  All buttons share:
  - radius 6-8 px
  - label at 14/500
  - padding about 8x14 px
  - a 16 px icon with a 6-8 px gap
  - a label that fits on one line at desktop widths

  [TS CTA wrap ban and no duplicate CTA intent; ADM Stripe one filled button per band]
- [ ] **K2 Disabled buttons say why.** Show the reason as inline helper text, or in a tooltip placed on a wrapper, because a disabled button cannot take focus. Example: "Top up your wallet to place calls." [WIG no dead ends; Inf]
- [ ] **K3 Inputs.**
  - The label sits above at 13/500 and help text sits below at 12-13 px.
  - The error appears below in the danger colour, with an icon.
  - The border is 1 px strong gray.
  - Focus shows a 2 px accent ring with a 2 px offset.
  - The placeholder is an example value ending in `…`.
  - Fields are not boxed into their own cards.

  [TS forms rules; WIG; ADM Linear, Vercel]
- [ ] **K4 Tabs and segmented controls.** Use a track (pill or 6 px) with a raised surface on the selected item. Deep-link the selected tab in the URL. [WIG; ADM Linear]
- [ ] **K5 Badges.**
  - 12/500 text, 2x8 px padding, pill or 4 px radius, semantic soft background.
  - At most one badge style per table cell.
  - No decorative dots. A dot appears only for live state.

  [TS rule against decorative status dots; I2C tiny badges everywhere]
- [ ] **K6 Tables.**
  - Sticky header, either 13/500 secondary sentence case or 11-12 px caps at +0.02em.
  - Right-aligned tabular numerals.
  - Truncated cells show the full text in a tooltip.
  - Row hover.
  - A checkbox column with a hit target of 24 px or more.
  - A column chooser for dynamic flow-field columns.
  - Empty cells are blank or show a muted "Not captured", never a row of dashes.

  [WIG; Inf]
- [ ] **K7 Keyboard hints as `<kbd>` keycaps** (1 px border, 4 px radius, 11-12 px mono). Show them in tooltips, menus and a `?` shortcut sheet, not in a permanent strip. [TS minimalist; ADM Raycast]
- [ ] **K8 Avatars.**
  - 24 or 32 px, one shape.
  - Initials sit on the neutral surface colour, not the accent.

  [ADM ElevenLabs voice rows; TS]
- [ ] **K9 Overlays.**
  - Use side sheets or inspectors to edit records: a lead, a node, a call's detail.
  - Use modals only for confirmations and short creation steps.
  - Every overlay traps focus, closes on Esc, returns focus to its trigger and sets `overscroll-behavior: contain`.

  [TS redesign warning against modals for everything; WIG]
- [ ] **K10 Toasts are for transient success only.** For example, "Lead saved" with Undo. Persistent problems, such as an empty wallet or no allocated number, appear inline where they block the task. [TS; WIG]
- [ ] **K11 Icons.**
  - One family with one stroke width (1.5 at 16-20 px).
  - One size scale: 16 px in controls, 20 px in navigation.
  - Replacing Lucide is optional. Consistency is the requirement.

  [TS]
- [ ] **K12 A named z-index scale.**

  | Layer | z-index |
  |---|---|
  | Base | 0 |
  | Sticky | 10 |
  | Dropdown | 20 |
  | Sticky banner | 30 |
  | Overlay | 40 |
  | Modal | 50 |
  | Toast | 60 |
  | Tooltip | 70 |

  Never use 9999. [TS redesign]

#### 5.3.6 Forms

- [ ] **F1 Every control has a clickable label, a meaningful `name` and `autocomplete`, and the correct `type`/`inputmode`.**

  | Field | Attributes |
  |---|---|
  | Phone | `type="tel" inputmode="tel" autocomplete="tel"` |
  | Email | `type="email"` with `spellcheck="false"` |
  | OTP | `autocomplete="one-time-code"`; pasting a code works |

  Non-auth fields must not trigger password managers. [WIG]
- [ ] **F2 Never block typing or paste.** Validate and explain instead. Trim whitespace. [WIG]
- [ ] **F3 Submit buttons.**
  - Stay enabled until clicked.
  - Then disable, show a spinner and keep the label ("Placing call…", "Saving…").
  - Send an idempotency key for call placement, test calls and top-ups.

  [WIG]
- [ ] **F4 Errors on submit.** Move focus to the first error. Announce errors through a polite `aria-live` region. [WIG]
- [ ] **F5 Warn before leaving with unsaved changes.** Applies to Flow Builder, Settings and the Cockpit's customer-context panel. [WIG]
- [ ] **F6 Style native `<select>` for Windows dark mode.** Set its background and text colour explicitly. [WIG]
- [ ] **F7 Mobile input text is 16 px or larger.** Never disable zoom. [WIG]
- [ ] **F8 Keyboard submission.** This rule has no ID in the raw checklist; it comes from the WIG forms list.
  - Enter submits a single-input form.
  - In a textarea composer, pick one convention (Enter or Cmd/Ctrl+Enter) and show a hint.

  [WIG]

#### 5.3.7 Feedback states

- [ ] **Q1 Every data view ships all states:** empty, sparse, dense, loading, error and permission denied. [WIG; TS]
- [ ] **Q2 Empty state anatomy.**
  - One sentence saying what will appear here.
  - The primary next action.
  - An optional link to docs.
  - No large illustration and no poetic copy.
  - Example: "Transcripts appear here once a call connects" rather than a bare "Awaiting connection".

  [WIG; TS copy audit]
- [ ] **Q3 Skeletons mirror the final layout.**
  - Show them after a 150-300 ms delay.
  - Keep them visible for at least 300-500 ms, so they do not flicker.
  - No generic centred spinner for page loads.

  [WIG; TS]
- [ ] **Q4 Errors say what happened, how to fix it, and offer the action.** Example: "Couldn't place the call. Your wallet balance is ₹0. Top up to continue." [WIG copy]
- [ ] **Q5 Match the safety net to the risk.**

  | Action | Pattern |
  |---|---|
  | Low risk (lead status change) | Optimistic update with rollback |
  | Delete | Undo |
  | Irreversible (activate a flow that dials, delete an agent, export data) | Explicit confirmation |

  [WIG]
- [ ] **Q6 Live regions.**
  - Announce these politely: call status changes, final transcript turns (throttled) and toasts.
  - Never announce every streaming partial.

  [WIG; Inf]

#### 5.3.8 Motion

- [ ] **M1 App motion budget.**

  | Interaction | Duration |
  |---|---|
  | Hover, press | 100-150 ms |
  | Menus, popovers | 150-200 ms |
  | Sheets, drawers | 200-250 ms |

  Nothing in the app runs longer than 300 ms. [Inf from ADM and WIG; TS motion dial 2-3]
- [ ] **M2 Easing.**
  - Enter and exit: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). [TS minimalist]
  - Drawers: `cubic-bezier(0.32, 0.72, 0, 1)`. [TS soft-skill]
  - Never linear for UI motion.
- [ ] **M3 Animate transform and opacity only.** List transitioned properties explicitly and never use `transition: all`. [WIG; TS]
- [ ] **M4 Honour `prefers-reduced-motion`.**
  - Disable idle loops, such as the Cockpit STANDBY radial and the marketing waves and orbs.
  - Keep instant state changes.

  [WIG; TS]
- [ ] **M5 No perpetual motion on idle UI.**
  - A pulse is allowed only on a genuinely live indicator (call connected, recording).
  - Any autoplaying element that runs longer than 5 s next to content needs a pause, stop or hide control.
  - Motion must have a reason: hierarchy, feedback or a state transition. Looking impressive is not a reason.

  [WIG; TS]
- [ ] **M6 Canvas motion.**
  - Pan and zoom with transforms.
  - While dragging, disable text selection and make siblings `inert`.
  - Re-route edges without forcing layout reads.
  - Animations stay interruptible.

  [WIG]

#### 5.3.9 Accessibility

- [ ] **A1 Visible focus on every interactive element.**
  - Use `:focus-visible` with a 2 px accent outline and a 2 px offset, at 3:1 or better against adjacent colours.
  - Never `outline: none` without a replacement. `.btn-saffron` currently has no `:focus-visible` style.

  [WIG]
- [ ] **A2 Icon-only buttons have an `aria-label` and a tooltip.** Decorative icons are `aria-hidden`. [WIG]
- [ ] **A3 Text contrast is AA or better:** 4.5:1 for small text, 3:1 for large text and non-text UI. This includes placeholders, helper text and error text. WIG prefers APCA where available. [TS form contrast check; WIG]
- [ ] **A4 Colour is never the only cue.** Applies to sentiment, call status, flow validation and latency. [WIG]
- [ ] **A5 Page structure.** A heading hierarchy, a skip link, landmarks (`nav`, `main`, `aside`) and an accurate `<title>` on every route. Use semantic HTML before ARIA: links are `<a>`, so Cmd/Ctrl-click works, and there is no `div` with `onClick`. [WIG]
- [ ] **A6 Hit targets are 24 px or more (44 px on touch).** Visual size and hit area match on flow ports, table checkboxes and sidebar items. No dead zones. [WIG]
- [ ] **A7 Accessible media.**
  - Call recordings come with transcripts.
  - The player is keyboard operable: Space to play or pause, arrow keys to seek ±5 s, and speed control.
  - Meetings have captions.

  [WIG]
- [ ] **A8 Canvas accessibility.**
  - Offer an outline or list view of flow steps as an alternative to spatial editing.
  - Nodes are focusable, with arrow-key navigation.

  [WIG gestures need alternatives; Inf]
- [ ] **A9 `translate="no"` on brand names, agent names, flow names and IDs,** so browser auto-translate of a Hindi UI does not mangle them. Set `lang` on transcript turns. [WIG]

#### 5.3.10 Responsive

- [ ] **R1 Breakpoints.**
  - Define them at 640, 768, 1024, 1280 and 1536 px.
  - Verify at 375, 768, 1024, 1280 and 1440 px, and at ultra-wide (browser zoom at 50%).
  - Test with always-visible scrollbars, as on Windows.

  [TS; WIG]
- [ ] **R2 Below 768 px:**
  - The sidebar becomes a bottom bar or a hamburger sheet.
  - The wallet banner collapses to a compact chip.

  [ADM Linear, Vercel; Inf]
- [ ] **R3 Tables below 768 px** either become card lists, or keep a sticky first column and scroll horizontally inside their container. [WIG; ADM]
- [ ] **R4 Flow Builder at smaller widths.**
  - Below 1024 px it is a read-only viewer, with a note to open it on a larger screen to edit.
  - At 1024-1279 px the palette and inspector become sheets.

  [Inf]
- [ ] **R5 Full-height shells use `min-height: 100dvh`, never `100vh`,** because the iOS address bar changes the viewport height. [TS]
- [ ] **R6 Bottom bars respect safe-area insets.** [WIG]

#### 5.3.11 Copy

- [ ] **P1 Plain, specific, active voice, second person.** No filler verbs such as "unleash", "elevate", "seamless" or "next-gen". [TS; WIG]
- [ ] **P2 One copy register per page.**
  - No poetic kickers in product UI. Analytics currently uses lines like "how the calls felt" and "the dispatch from your line".
  - No performative craftsman labels.

  [TS]
- [ ] **P3 Consistent nouns. Pick one term from each set and use it everywhere:**
  - "Flow", "Call flow" or "Voice journey"
  - "Agent" or "Assistant"
  - "Room" or "Meeting"
  - "Top up" or "Recharge"

  [WIG keep nouns consistent]
- [ ] **P4 Specific button labels.** Examples: "Place test call", "Activate flow", "Create meeting room", "Save context". Not "Continue" or "Submit". [WIG]
- [ ] **P5 Sentence case for headings and buttons across the app.** This follows Linear, Notion, Stripe, Intercom and Taste Skill redesign. See 5.4 for the WIG conflict. [TS; ADM]
- [ ] **P6 Numbers and money.**
  - Use numerals for counts and a space before units.
  - Format rupees with `Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR'})`, which gives lakh grouping.
  - Keep decimals consistent per context: 2 for wallet balances, 0 for KPIs.
  - Format dates with `Intl`, never hard-coded.

  [WIG]
- [ ] **P7 No em-dash in UI chrome.** Use a period, colon or parentheses instead. Example: "Wallet empty. Top up to keep calls running." [TS]
- [ ] **P8 No exclamation marks in success messages, and no "Oops".** [TS redesign]
- [ ] **P9 In-progress copy ends with `…`** ("Connecting…", "Transcribing…"). Menu items that open a follow-up step also end with `…` ("Rename…"). [WIG]

### 5.4 Where the sources disagree, and the resolution for Vaani

| Topic | One side | Other side | Resolution |
|---|---|---|---|
| Inter | Taste Skill discourages Inter as an unexamined default. `soft-skill` bans it. | Linear-, Vercel- and Raycast-style systems treat Inter as the nearest free match. Taste Skill allows it for Linear-style and accessibility-first work. | Keep the shipped Hanken Grotesk (or Geist). Do not add Inter. Consistency matters more than the specific face. |
| Button shape | Vercel, Stripe and ElevenLabs use pill CTAs. | Linear, Notion, Supabase, Intercom and Cal.com use 6-8 px rectangles and keep pills for tabs and status. | 6-8 px rectangles in the app. Pills only for filter chips, status and avatar groups. Marketing follows the same radius logic (shape consistency lock). |
| Letter case | WIG (Vercel house style): Title Case for product headings and buttons. | Taste Skill redesign, Linear, Stripe and Intercom: sentence case. | Sentence case everywhere. |
| Em-dash | Taste Skill bans it completely. | Vercel and others use it in copy. | Banned in UI chrome (buttons, labels, banners, empty states). Allowed in long-form docs and the blog. |
| Glass, gradients, orbs | `soft-skill` and `gpt-tasteskill` promote glass, double bezels and mesh. | Main Taste Skill calls glass inappropriate for dashboards. Linear, Supabase and Intercom use no atmospheric gradients. | None in the app. On marketing, at most one restrained atmospheric element in the hero, with real product screenshots doing the rest. |
| Mono labels | Vercel uses small mono eyebrows on marketing. | Intercom and Linear keep mono off chrome. Taste Skill limits eyebrows to one per three sections. | Mono only for data tokens (IDs, phone numbers, timers, code). No mono section labels in the app. |
| Scroll motion | Minimalist and soft variants reveal everything on scroll. | WIG allows animation only when it clarifies cause and effect. Taste Skill's product dial is 2-3. | No scroll reveals in the app. Marketing only, and reduced-motion safe. |
| Heavy density rule | Taste Skill at density 8-10 wants mono for all numbers and no cards. | ADM product systems keep numbers in the sans. | Tabular numerals in the sans are enough. Keep mono for tokens. |

### 5.5 Starter tokens (derived from the references, contrast-checked)

These tokens are not copied from any single brand. Values in parentheses are contrast ratios.

**Light theme**

| Token | Value | Notes |
|---|---|---|
| `--canvas` | `#fafafa` | Page background |
| `--surface` | `#ffffff` | Panels, cards, inputs |
| `--surface-2` | `#f5f5f5` | Inset areas, hovered rows, code |
| `--surface-3` | `#efefef` | Pressed, neutral selected |
| `--border` | `rgba(0,0,0,.08)` | Hairline, about `#ebebeb` on white. Decorative only. |
| `--border-strong` | `#d4d4d4` | Input borders. Pair with the 2 px focus ring to meet 3:1 for non-text UI. |
| `--text` | `#171717` | 17.93:1 on white |
| `--text-secondary` | `#525252` | 7.81:1 on white |
| `--text-muted` | `#737373` | 4.74:1 on white, 4.54:1 on canvas. The floor for readable meta text. |
| `--text-disabled` | `#a3a3a3` | 2.52:1. Disabled text only. |
| `--accent` | `#2563eb` | White label 5.17:1. Hover `#1d4ed8` (6.70:1). |
| `--accent-soft` | `#eff6ff` | Pair with accent text `#1d4ed8` (6.16:1) |

Light-theme semantic colours:

| State | Soft pair (text on background) | Solid |
|---|---|---|
| Success | `#166534` on `#dcfce7` | `#15803d`, white label 5.02:1 |
| Warning | `#92400e` on `#fef3c7` | `#b45309` |
| Danger | `#991b1b` on `#fee2e2` | `#b91c1c`, white label 6.47:1 |

**Dark theme.** Depth comes from a surface ladder with no shadows, following Linear and Raycast.

| Token | Value | Notes |
|---|---|---|
| `--canvas` | `#0a0a0b` | |
| `--surface` | `#111113` | |
| `--surface-2` | `#18181b` | |
| `--surface-3` | `#1f1f23` | |
| `--border` | `#26262b` | |
| `--border-strong` | `#3a3a40` | |
| `--text` | `#f4f4f5` | 18.0:1 |
| `--text-secondary` | `#a1a1aa` | 7.72:1 |
| `--text-muted` | `#8b8b93` | 5.85:1. Not `#71717a`, which is 4.09:1. |
| `--accent` | `#3b82f6` | As text 5.38:1. Links use `#60a5fa` (7.78:1). |
| Success / warning / danger | `#4ade80` / `#fbbf24` / `#f87171` | 11.36:1 / 11.85:1 / 7.15:1 |

**Radius.** Nested radii are concentric: a child's radius equals the parent's radius minus the padding between them. [WIG]

| Token | Size | Used for |
|---|---|---|
| `--r-xs` | 4 px | Keycaps, badges |
| `--r-sm` | 6 px | Buttons, inputs |
| `--r-md` | 8 px | Menus, small cards, nodes |
| `--r-lg` | 12 px | Panels, cards |
| `--r-xl` | 16 px | Modals, large containers |
| `--r-full` | full | Avatars, status pills, filter chips |

**Elevation (light theme only).** Adapted from Vercel's stacked levels. Every level includes a 1 px ring at 6% black. On tinted surfaces, shadows may be tinted toward that hue, as Stripe does.

| Level | Shadow (after the ring) | Used for |
|---|---|---|
| `--e0` | None, just a border | Default |
| `--e1` | `0 1px 2px` at 4% | Nodes, cards on hover |
| `--e2` | `0 1px 1px` at 2%, plus `0 4px 8px -2px` at 6% | Popovers, the selected node |
| `--e3` | `0 1px 1px` at 2%, plus `0 8px 16px -4px` at 8%, plus `0 24px 32px -8px` at 10% | Modals, sheets |

**Sizes.**

| Item | Size |
|---|---|
| Spacing steps | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Controls | 32, 36 or 40 px (44 px on touch) |
| Sidebar | 56 px collapsed, 232-248 px expanded |
| Page header | 56-64 px |
| Table row | 44 px (36 px compact) |
| Mono text for tokens | 12-13 px |

**Motion.**

| Token | Value | Used for |
|---|---|---|
| `--dur-1` | 120 ms | Hover, press |
| `--dur-2` | 180 ms | Menus |
| `--dur-3` | 240 ms | Sheets |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | Enter and exit |
| `--ease-drawer` | `cubic-bezier(0.32,0.72,0,1)` | Drawers |

**Focus.** `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`.

**Theme metadata.** `<meta name="theme-color">` matches the canvas. Set `color-scheme: dark` on `<html>` in dark mode. [WIG]

---

### 5.6 Anti-patterns to avoid

These are drawn from:
- **[TS]** the Taste Skill "AI tells" list, plus `redesign-skill` and `minimalist-skill`
- **[I2C]** the Image-to-Code clutter list
- **[ADM]** the "don'ts" in the Awesome Design MD files

**Seen** means the pattern is visible in the scout screenshots of Vaani. Sections 3B and 3C of this audit measure these in depth.

| # | Anti-pattern | Status in Vaani | What to do instead |
|---|---|---|---|
| 1 | Purple-to-blue gradients and gradient text [TS; ADM Linear] | **Seen**: the marketing hero headline is gradient text over a violet glow orb. | Solid ink headline. Show a real product visual. |
| 2 | Neon glows, orbs, halo shadows [TS] | **Seen**: the hero orb and wave lines, and the green glow around ACTIVATE. | A flat fill. Elevation from the `--e` levels only. |
| 3 | Glassmorphism without a reason, floating blobs [I2C; TS] | Avoid | No glass in the app. |
| 4 | Mono uppercase wide-tracked labels on everything (HUD or "pseudo-enterprise" labels) [TS; I2C; ADM Intercom] | **Seen**: Dashboard field and section labels ("CUSTOMER NAME", "TRANSCRIPT FEED", "SESSION: IDLE"); Leads title, KPIs, filter chips and shortcut strip; Analytics labels. | Sentence case at 13/500 in the secondary colour (T5). |
| 5 | Section-number eyebrows and performative kicker copy [TS] | **Seen**: "§ 01 / § 02 / § 03" and poetic kickers on Analytics, plus HUD corner brackets around the identity card. | Plain section headings: "Overview", "Call volume", "Sentiment". |
| 6 | A decorative serif in a dashboard. Instrument Serif and Fraunces are specifically discouraged as defaults. [TS] | **Seen**: serif-italic "not allocated yet" on Analytics. | A functional sentence with an action: "No number allocated. Allocate one in Billing." |
| 7 | Decorative status dots [TS] | **Seen**: dots before "Canvas", "FLOW VALIDATED", "CUSTOMER INTEL", "TRANSCRIPT FEED" and the marketing "LIVE" eyebrow. | A dot only for real live state: call connected, room live, recording. |
| 8 | Pills and micro-badges everywhere [I2C; TS] | **Seen**: Leads source chips with letter pseudo-icons; three badges per Call Reports row; a four-pill trust strip in the hero. | One outcome cell. A muted channel icon. Trust items move below the hero. |
| 9 | Box-in-box nesting [I2C] | **Seen**: Dashboard fields boxed inside a card inside a panel. | Plain inputs grouped by spacing (L4). |
| 10 | Multiple accents [TS; ADM] | **Seen**: blue primary, green ACTIVATE, purple Meeting Agent, teal Import CSV, violet marketing CTAs, orange and yellow node categories. | One accent (C2). Category colour lives only in node icon tiles. |
| 11 | Idle decorative animation [TS; WIG] | **Seen**: a large STANDBY radial fills the Cockpit centre while idle. Motion was not confirmed from a still image. | A pre-call panel. Motion only on real audio. |
| 12 | Em-dash separators in chrome [TS] | **Seen**: the wallet banner, the Assistant subtitle, the Meeting Agent title, Analytics kickers, the marketing subhead. | A period or colon (P7). |
| 13 | Placeholder used as the label [TS; WIG] | **Seen**: the Cockpit phone field shows only a "+91…" placeholder. | A visible label, `type="tel"` (F1). |
| 14 | Filler status microcopy [I2C] | **Seen**: "LAT: 0ms" while idle, "SYS ONLINE", and a bare "22ms" in the sidebar. | Show latency only during a call, with a qualitative label. |
| 15 | Other tells to keep out [TS; WIG] | Avoid | Fake-precise numbers. "Jane Doe" or Acme data. Rocket and shield clichés. Three equal feature cards. Modals for everything. Spinner-only loading. "Oops!". Exclamation marks in success messages. `transition: all`. z-index 9999. Custom cursors. `user-scalable=no`. Blocked paste. `outline: none` without a replacement. Icon buttons without names. GIFs instead of video. Gesture-only actions. |

### 5.7 Implications for a voice-AI calling product

Source tags in brackets show where each idea comes from. **[Inf]** marks the researcher's own product inference.

1. **One call-state model, shared** by Cockpit, Rep Console, Call Reports and the flow test panel.
   - **States:** Idle, Dialing, Ringing, Connected (live), Wrap-up, then one outcome: Ended, No answer, Busy, Failed or Voicemail.
   - **Colour by state:** neutral for idle, amber for dialing and ringing, green for live, neutral for wrap-up and ended, red for failed.
   - **Every state** also has a label, an icon and a polite `aria-live` announcement.
   - **Pulse:** only the live state pulses, and never under reduced motion.

   [WIG redundant cues and async announcements; TS dots only for real state]
2. **Timers and latency.**
   - Durations are mono or tabular (`01:27`).
   - Latency appears only during a call or on a status page, with a qualitative label ("Good · 180 ms", "Slow · 900 ms").
   - Remove the "0ms" idle readout and the global sidebar "22ms", or give them a meaning.

   [I2C filler status microcopy; WIG]
3. **The transcript is the main live surface.**
   - **Turns:** speaker-labelled (agent, customer), with `mm:ss` timestamps and a per-turn language tag (HI/EN).
   - **Streaming text:** partial text is muted and turns ink-coloured once final.
   - **Scrolling:** auto-scroll pauses when the user scrolls up and offers "Jump to latest".
   - **Tools:** copy and search.
   - **Hindi:** Devanagari sans fallback at about 1.7 line-height, with `lang` set per turn.
   - **Announcements:** only final turns are announced, throttled.
   - **Empty state:** says what will appear.

   [WIG content resilience, live regions, accessible media; Inf]
4. **Audio visuals are functional, not decorative.**
   - Show a level meter or waveform driven by real input or output audio.
   - Keep it static when idle and under reduced motion.
   - It is never the largest element on the page.

   [TS motivated motion; WIG reduced motion and the 5 s autoplay rule]
5. **A pre-call checklist replaces the decorative centre stage.** The Cockpit gets a compact "Ready to call" card:

   | Row | Content |
   |---|---|
   | Contact | The selected contact |
   | Number | A labelled `type="tel"` field with a fixed `+91` prefix, E.164 validation and grouped display formatting |
   | Flow | Name, version and an "Up to date" status |
   | Agent voice | 32 px avatar, name, language or accent, and a ▶ preview (ElevenLabs voice-row pattern) |
   | Wallet | A balance check |

   - Actions: one primary, "Place call", and one secondary, "Test in browser".
   - Any disabled reason is shown inline.

   [K1, K2, F1; ADM ElevenLabs]
6. **Wallet and billing.**
   - The low-balance warning is semantic amber, not brand blue.
   - It shows as a blocking inline message where calling is blocked.
   - Elsewhere it is a small header chip ("₹0 · Top up"). It is not a permanent full-width bar pushing every page down.
   - Money uses `Intl.NumberFormat('en-IN', …)` with consistent decimals.
   - UPI autopay copy states the exact amount and cadence.

   [WIG sticky elements, hue consistency, locale formats]
7. **Sentiment and outcomes.**
   - Sentiment is always icon + label + colour.
   - The score is a tabular number with a small bar.
   - On Call Reports, collapse Type, Status and Sentiment into one "Outcome" cell. Show the channel as a muted icon.

   [WIG; I2C tiny badges]
8. **Recordings.**
   - Player shortcuts: Space to play or pause, ±5 s seek with the arrow keys.
   - Speed options: 1x, 1.25x, 1.5x and 2x.
   - The transcript highlights in sync with playback.
   - Download is an explicit action.
   - Exports respect masking.

   [WIG accessible media]
9. **PII masking.**
   - Use one phone-mask format everywhere (last digits visible). Lists already mask consistently; keep that.
   - "Reveal" is an explicit, logged action tied to the activity and audit trail.

   [Inf]
10. **Compliance cues for Indian outbound calling.** These need the product owner's confirmation.
    - A recording-disclosure indicator during live calls.
    - Calling-hours and DND awareness surfaced when a campaign or flow is activated.

    [Inf]
11. **Multilingual UI.**
    - `lang` attributes on transcript turns.
    - `translate="no"` on agent and brand names.
    - Detect the locale from `Accept-Language`, not from IP address.

    [WIG]
12. **Analytics.**
    - KPIs state the comparison period in words ("+200% vs previous 7 days").
    - Numbers are tabular.
    - Show sparklines only once there are enough data points. Otherwise show "Not enough data yet".
    - Use a colour-blind-safe chart palette, separate from brand chrome.
    - Charts have designed empty and error states.

    [WIG; ADM Intercom report palette; TS fake-precise numbers]
13. **Assistant (plans and acts on data).**
    - Show the plan steps.
    - Ask for explicit confirmation before side-effectful actions: activating a flow, placing a call, bulk-editing leads.
    - Streaming status text ends in `…`.
    - The composer uses one submit convention and shows the hint.
    - Keep suggestions as plain, specific verbs.
    - The current empty states for the composer and the "Plan & Actions" panel are good.

    [WIG forms and destructive-action confirmation]

### 5.8 Implications for the node-based flow designer

1. **Canvas.**
   - A neutral dotted grid on `--canvas`: 1 px dots every 16-24 px at about 6-8% ink.
   - No hatch or noise textures.
   - Snap to 8 or 16 px.

   [ADM; TS]
2. **Node anatomy.** Nodes have a fixed width of 240-280 px.

   | Part | Content |
   |---|---|
   | Header | A 20-24 px category icon tile on a soft tint (the **only** place category colour appears), the node type at 12 px secondary, and the title at 14/500 |
   | Body | A 2-3 line clamped preview of the prompt or script |
   | Footer | Labelled output ports as text chips (Yes/No, True/False, custom branches) |
   | Frame | 1 px border, 8-10 px radius, `--e1` |

   [ADM radius and elevation; TS one accent; WIG `line-clamp` truncation]
3. **Node states.**

   | State | Treatment |
   |---|---|
   | Hover | Strong border |
   | Selected | 2 px accent outline (offset 2) plus `--e2`. No glow. |
   | Error | Danger border, a badge with the issue count, and the message in the inspector |
   | Warning | Amber |
   | Unreachable or disabled | 50% opacity with a "Not connected" note |
   | Running during a test call | Accent left stripe and a "Live" chip, with the path traced along the edges |

   [Inf; WIG]
4. **Ports and edges.**
   - Ports are 10-12 px visible with a 24 px hit area and a hover affordance.
   - Edges are a 1.5 px neutral stroke that turns accent on hover or selection.
   - Condition edges carry labels.
   - Dashes carry exactly one documented meaning (fallback, else or async), explained in a legend.

   [WIG hit targets; TS motivated style]
5. **No overlaps.**
   - A "Tidy up" auto-layout (top-down, dagre- or ELK-style).
   - Collision avoidance on drop.
   - The scout showed the Knowledge Lookup node overlapping Confirm Interest.

   [WIG deliberate alignment; TS]
6. **Palette (left).**
   - A single-column list: icon, full name and a one-line description.
   - Search at the top, focused with `/`.
   - Collapsible groups: Conversation, Logic, Actions, Knowledge & CRM, Hand-off.
   - Click-to-add inserts after the selected node, as the keyboard and touch alternative to dragging.
   - Labels never truncate. The scout showed "Knowle…", "CRM Lo…" and "WhatsA…" at 1440 px. A 2-column grid is acceptable only with tiles at least about 150 px wide and 2-line wrapping.

   [WIG gesture alternatives and content handling]
7. **Inspector (right, 320-400 px).**
   - Node configuration, validation messages and test data all live here. No editing modals.
   - Edits autosave to a draft, with a visible status.

   [TS redesign warning against modals for everything]
8. **Toolbar hierarchy.**

   | Zone | Contents |
   |---|---|
   | Left | Flow name, version picker and save-status text ("Draft · Saved 12:04", "Unsaved changes") |
   | Centre | Undo, redo, tidy and zoom, as named icon buttons with tooltips and shortcut hints |
   | Right | "Test" (secondary), then exactly **one** filled primary, "Activate" or "Publish", which opens a confirmation summarising the version, target number and agent, and impact. Private, Share and rarely used tools move to an overflow menu. |

   Today the toolbar has two adjacent filled primaries (blue Save and green glowing ACTIVATE) plus a tinted AI-draft button. [TS no duplicate CTA; ADM Stripe one filled button per band; WIG confirm]
9. **Validation.**
   - A persistent "Issues (n)" button opens a list. Clicking an issue selects and centres its node.
   - "Flow validated" becomes quiet status text in the toolbar, not a floating pill on the canvas.

   [WIG no dead ends; I2C decorative system markers]
10. **Keyboard.**

    | Key | Action |
    |---|---|
    | Tab | Enter the canvas |
    | Arrows | Move between connected nodes |
    | Enter | Open the inspector |
    | Delete | Remove, with an Undo toast |
    | Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z | Undo, redo |
    | Cmd/Ctrl+D | Duplicate |
    | `?` | Open the shortcut sheet with `<kbd>` keycaps |

    An outline (list) view of the steps serves screen-reader users. [WIG keyboard everywhere, gesture alternatives]
11. **Minimap and zoom.**
    - The minimap shows neutral node rectangles (not saturated category blocks, as today) with an accent viewport frame.
    - It can be toggled and is hidden below 1280 px.
    - Zoom controls show the zoom percentage and a "Fit" action.

    [ADM one accent]
12. **URL state.**
    - `?node=<id>&v=<version>` deep-links the selection and version. The viewport is optional.
    - Back and Forward restore state.

    [WIG deep-link everything]
13. **Saving safety.**
    - `beforeunload` plus a router guard for unsaved changes.
    - Autosaved drafts, with conflict detection if more than one person can edit.

    [WIG]
14. **Performance.**
    - Render only the visible nodes on large graphs.
    - Pan and zoom with transforms.
    - No `getBoundingClientRect` during render.
    - `inert` and `user-select: none` while dragging.
    - Optimistic node moves, with writes under 500 ms.

    [WIG performance]
15. **AI draft.**
    - A secondary action that opens a side sheet: prompt, then a preview diff (added, changed and removed nodes highlighted), then "Apply" or "Discard".
    - The canvas never changes silently.

    [WIG optimistic plus undo; Inf]
16. **Test mode ties the builder to the voice product.**
    - "Test call" runs in a docked bottom panel with the live transcript.
    - The canvas highlights the current node and the edges already traversed.
    - Extracted variables appear in the inspector.

    [Inf]

### 5.9 Marketing site (brief)

- **Hero.** [TS hero discipline]
  - A headline of 2 lines at most, in solid ink.
  - Subtext of 20 words or fewer. Today it is about 36.
  - One primary and one secondary CTA.
  - At most one small supporting element.
  - Move the trust pills to the next section.
- **Real product in the hero.** Replace the orb and waves with a real visual: the flow canvas or a live transcript card. Every ADM system leads with real UI.
- **One brand, one accent.** The marketing CTAs are violet while the app is blue. That reads as two brands. [TS colour lock]
- **Drop the "LIVE · …" eyebrow**, or rewrite it as a plain sentence. It stacks three tells in one line: a decorative dot, a tracked eyebrow and a middle-dot. [TS]
- **Motion stays reduced-motion safe.** Scroll reveals are allowed here only. [WIG; TS]

### 5.10 Strengths to preserve

- **Keyboard-first habits exist.** Leads documents `/`, `J`/`K`, `X`, `A`, `C` and `Esc`, and the canvas hints "press ? for shortcuts". Keep these and present them as `<kbd>` keycaps in a `?` sheet.
- **Call Reports status is not colour-only.** Its badges carry an icon and text, which meets WIG's redundant-cues rule.
- **Call Reports and Assistant set the baseline.** Both use a calm sans, sentence case, and a clean header (title, one-line description, actions on the right). Build the unified header from them.
- **Lists mask phone numbers consistently.**
- **The Assistant empty state works.** It has a clear description, concrete verb-led suggestions and a named side panel with its own empty state.
- **The flow canvas already has the right primitives:** minimap, zoom, node and link counts, undo and redo, validation, version selector and save status. The redesign there is mostly hierarchy and polish, not missing features.
- **The Leads KPI strip** already uses a single bordered row with dividers.

### 5.11 Decisions the redesign owner must make

1. **Brand accent.** Blue (the app) or violet (marketing and the logo gradient)? Only one can win.
2. **Default theme.** Light-first or dark-first? Every reference picks one default and supports the other with parity. Today the app is light and the marketing site is dark.
3. **Letter case.** Sentence case or Title Case? This digest recommends sentence case.
4. **Save in Flow Builder.** Should Save exist at all, or should drafts autosave and Activate/Publish create versions?
5. **Concurrent flow editing.** Who edits flows at the same time? The answer decides whether presence and conflict UI are needed.
6. **Compliance cues.** Which cues must the UI surface (recording disclosure, calling hours, DND/TRAI)?
7. **Sidebar latency.** Is the "22ms" readout meant for customers or for internal operators?
8. **Minimum editing viewport for Flow Builder.** 1024 px is proposed.
