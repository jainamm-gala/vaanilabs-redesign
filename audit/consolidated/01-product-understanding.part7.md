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
