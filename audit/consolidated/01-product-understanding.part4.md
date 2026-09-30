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
