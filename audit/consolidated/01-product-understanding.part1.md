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
