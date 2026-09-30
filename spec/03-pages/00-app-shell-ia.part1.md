# 03 · Pages: App shell and information architecture

**Spec area:** shell-ia · **Status:** v1 for build · **Date:** 2026-09-27
**Follows:** `spec/00-design-direction.md` (Sutradhar), `spec/01-foundations.md` + `spec/tokens/tokens.css`, and the component specs `02-components-core.md`, `02-components-data-nav.md`, `02-components-overlay-feedback.md`. Components are named exactly as those specs name them. Anything they do not define is listed in part 6, "New components needed".
**Evidence:** finding ids (F-UX-…, F-RWD-…, F-A11Y-…, F-QA-…, F-VIS-…, F-FLOW-…) refer to `audit/consolidated/`. Screens of today's product: `audit/screenshots/scout_dashboard.png`, `va-responsive-a/dashboard_390.png`, `va-explore-core/onboarding.png`, `va-public-site/404.png`.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/00-app-shell-ia.md`, from `00-app-shell-ia.part1.md` … `part6.md` (edit the parts, then re-assemble) |
| Reference mock (every shell layout, the palette, menus, setup track, Baseline states, 404) | `spec/03-pages/00-app-shell-ia.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `00-app-shell-ia-desktop.png`, `-palette.png`, `-menus.png`, `-laptop.png`, `-small.png` (tablet and phones), `-errors.png`, `-dark.png` |

**Contents**
- Part 1: scope, decisions, the IA (destinations, groups, labels, icons, routes, redirects, landing logic, nav config)
- Part 2: the shell frame at every breakpoint (wireframes, chrome budget, states, keyboard, accessibility)
- Part 3: page header and `<title>` conventions, the Baseline, wallet and low balance, system status
- Part 4: Search or jump (⌘K) and global search, workspace and account menus, sign out, theme, shortcuts, notifications
- Part 5: first run, the Home setup track and the setup card
- Part 6: 404, 403 and error pages, loading, microcopy, telemetry, new components, traceability, open questions

---

## 0. Scope

**This spec owns:** the navigation model and labels; routes, renames and redirects; the shell layout at each breakpoint; page-header and `<title>` conventions; the Baseline; where wallet, call and system state appear; the palette's content; the workspace and account menus; sign out; theme; global shortcuts; how notifications are routed; first run and Home; 404, 403, error and loading pages.

**Owned elsewhere and only referenced:** component internals (02-*); page bodies (Cockpit Ready card, Leads table, Flow Designer, Billing's Top-up sheet contents, each Settings page, the Call gate and Publish gate contents); auth forms (`/login`, `/signup`); the marketing site.

**Job of the shell (one sentence):** reach any of the 12 destinations in one step at any width, always know which workspace, page and state you are in, and never be told something the system has not proven.

---

## 1. Decisions this spec settles

| # | Question | Decision | Why |
|---|---|---|---|
| D1 | Setup order: the brief says knowledge → flow → number → leads → first call; the direction counts five steps (flow, number, money, call yourself, leads or inbound) | **Knowledge is an optional first row** (not counted). **Money sits before "Call yourself"** because every phone call needs it. The **first customer call is the finale** once all five pass, not a sixth step. The count stays "n of 5" everywhere. | Keeps the brief's relative order and the direction's five counted checks (direction §6.1; F-UX-006). |
| D2 | Which routes change | Only routes whose path disagrees with the one name: `/dashboard` → `/cockpit` (this settles `01-agent-cockpit` §8 Q1, which proposed keeping `/dashboard` with a `/cockpit` alias; until the 308 ships, both resolve), `/flow-builder` → `/flows`, `/meeting-agent` → `/meetings`, `/onboarding` → `/home`; developer pages move under `/settings`. Labels are the direction's; "Live calls", "Call history" and "Rep desk" stay rejected. | One name per destination in URL, nav, H1, `<title>` and ⌘K (F-UX-017, F-A11Y-013). |
| D3 | Settings URL shape | Flat `/settings/<page>`. Groups exist only in the sub-nav, so regrouping never breaks a link. | F-UX-027; fewer redirect generations. |
| D4 | Records in the URL | Record sheets use query params (`/leads?lead=…`, `/call-reports?call=…`), matching the overlay spec. Flows use a path segment (`/flows/:flowId`) because the designer is a full page. | F-UX-031, F-QA-016; overlay §1.4. |
| D5 | Notifications | **v1 has no bell or inbox.** Each event goes to one of: toast, nav badge, Baseline, page notice, or email/WhatsApp (part 4 §11). The Activity inbox is specified for v1.1. | Overlay spec open question 6; P7 quiet chrome. |
| D6 | System status | **No idle health indicator anywhere.** Only computed facts: offline (ConnectionBar), a real incident affecting calling (a notice plus the Baseline line segment), and line quality during a call. | P1; F-UX-018 (SYS: ONLINE was a constant plus a random number). |
| D7 | Product logo in the app | None in the app chrome. The workspace tile is the top-left identity; "Back to website" lives in the account menu. The V mark appears on auth, error and bare pages. | F-UX-029 (the in-app logo left the app for marketing). |
| D8 | "G then X" go-to shortcuts | Not in v1. ⌘K covers jumping, and fewer single-key shortcuts means less accidental input. | F-A11Y-004; direction §1.5 ("⌘K showmanship stays out"). |
| D9 | Where "Top up" opens | The Top-up sheet opens **in place** over the current page (`?topup=1` added to the current URL). `/billing/wallet?topup=1` is the canonical link from outside the app (emails, WhatsApp, docs); `/billing?topup=1` also works through the `/billing` redirect. Aligned with `05-knowledge-billing` §1. | F-UX-002, F-QA-004; overlay §10.2; direction §6.6. |
| D10 | Short and landscape screens | At ≥768 px wide and <600 px tall the tablet shell is used; at ≤720 px tall the Baseline folds into a header chip. | F-RWD-005; foundations §5. |
| D11 | Home's name | Nav label and H1 are **"Home"**; the page's display heading is "Get your first call live". Home is in the nav only while setup is incomplete, then stays reachable from Help and ⌘K. | data-nav §0.7 (`home` id); direction §6.1. |
| D12 | Wallet badge wording | Billing badge words are "Low", "Empty" (₹0) and "Blocked" (autopay failed or account on hold). "Blocked" alone at ₹0 read as an account suspension. | Refines data-nav §1.5. |

---

## 2. Information architecture

### 2.1 Model

Four groups, ordered by how often an operator reaches for them. Each group answers one question.

| Group | Question it answers | Destinations |
|---|---|---|
| **Operate** | What is happening on calls and conversations right now? | (Home, while setup is incomplete) · Cockpit · Assistant · Rep console · Meetings · Personal agents |
| **Build** | What does the agent say and know? | Flows · Knowledge |
| **Data** | Who do we call, and what happened? | Leads · Call reports · Analytics |
| **Account** | What does it cost, and how is it configured? | Billing · Settings |

Today's rail is a flat, unlabelled list whose order ignores these layers: Build sits at positions 5 and 11 and Review at 3 and 9 (audit 1.6). The groups fix the order; the labels fix the names (F-UX-017).

**"Agent" means the voice persona only.** "Vaani" is the agent. No destination is named after "agent" except "Personal agents", a product name. Retired: "Agent View", "Agent" (phone tab), "AGENT COCKPIT", "Meet Agent", "Meeting Agent — Vikash", "AGENT KNOWLEDGE" (F-UX-017, EXPLORE-SETTINGS-13).

### 2.2 Destinations

Icons are Lucide, one per destination (foundations §12). The Home icon (`house`) is a new assignment (part 6).

| Group | Label (nav, H1, `<title>`, ⌘K) | Icon | Canonical route | Job, in one line | Badge (computed; hidden at zero; never `0`) | Phone |
|---|---|---|---|---|---|---|
| Operate | **Home** | `house` | `/home` | Get this workspace ready for its first live call | none (the setup card carries progress) | via More |
| Operate | **Cockpit** | `activity` | `/cockpit` | Place, watch and wrap up calls | `live`: "2 live" | slot 1 |
| Operate | **Assistant** | `bot` | `/assistant` | Ask about the account and delegate tasks, with approval | none | More |
| Operate | **Rep console** | `headphones` | `/rep-console` | Take transferred calls as a human rep | none (availability shows in the Baseline) | More |
| Operate | **Meetings** | `video` | `/meetings` | Run the meeting agent and read notes | none | More |
| Operate | **Personal agents** | `list-checks` | `/personal-agents` | Delegate goals to an agent that calls for you | `count`: "1 to confirm" (tasks waiting on Confirm autonomy) | More |
| Build | **Flows** | `workflow` | `/flows` | Script, test and publish what the agent says | `count`: "1 draft" (flows with unpublished changes) | slot 4 |
| Build | **Knowledge** | `book-open` | `/knowledge` | Documents the agent can quote on calls | `count`: "3 to review" (admins only: pending proposals) | More |
| Data | **Leads** | `users` | `/leads` | Find, qualify and call people | `count`: "18 due" (callbacks due today) | slot 2 |
| Data | **Call reports** | `file-text` | `/call-reports` | Review what happened on each call | none | slot 3 |
| Data | **Analytics** | `chart-column` | `/analytics` | Volume, outcomes and sentiment over time | none | More |
| Account | **Billing** | `wallet` | `/billing/wallet` (`/billing` redirects there) | Wallet, usage, plans, invoices, autopay | `warning`: "Low" · "Empty" · "Blocked" | More |
| Account | **Settings** | `sliders-horizontal` | `/settings` | Workspace, calling, developer, security, data | `warning`: "Verify" (calling number not verified) | More |

**Badge rules** (data-nav §1.5): at most one per item; words and numbers from `lib/format.ts` ("99+" above 99); computed server-side in one `GET /api/workspace/state` (cached 60 s and pushed when a live channel exists); rendered only after it resolves. The `live` badge's dot pulses only while a call is live, and never under reduced motion. No red bubbles, and no counts for passive things (new call reports, new leads).

**Role visibility.** Items a role cannot use are **hidden, not disabled** (data-nav §1.3). v1 assumptions, pending the role model (part 6 open questions): every destination is visible to Admin and Member; the Knowledge "to review" badge shows only to admins; Personal agents' consumer capabilities are hidden in B2B workspaces, but the destination stays (F-UX-040).

### 2.3 Canonical routes and URL state

| Destination | Routes | State in the URL |
|---|---|---|
| Home | `/home` | none |
| Cockpit | `/cockpit` | `?call=<id>` (a live or recent call in focus) |
| Assistant | `/assistant` | `?chat=<id>` once chats are stored server-side |
| Rep console | `/rep-console` | none |
| Meetings | `/meetings`, `/meetings/<meetingId>` (notes and summary) | tab |
| Personal agents | `/personal-agents`, `/personal-agents/settings` | `?task=<id>` |
| Flows | `/flows` (list), `/flows/new` (template gallery), `/flows/<flowId>` (designer) | designer: `?node=<id>&v=<version>` (digest 5.8) |
| Knowledge | `/knowledge`, `/knowledge/proposals` (admins) | `?file=<id>`, `?q=` |
| Leads | `/leads` | `?view= &q= &status= &lang= &sort= &page= &lead=<id>` |
| Call reports | `/call-reports` | `?view= &q= &sentiment= &sort= &page= &call=<id> &tests=1` |
| Analytics | `/analytics` | `?range=7d` |
| Billing | `/billing` (a `replace` redirect to `/billing/wallet`), `/billing/wallet`, `/billing/usage`, `/billing/plans`, `/billing/invoices`, `/billing/autopay` (owned by `05-knowledge-billing`) | `?topup=1`, `?txn=<id>` |
| Settings | `/settings/<page>`: `profile` · `organization` · `notifications` · `integrations` · `phone` · `api-keys` · `webhooks` · `webhooks/deliveries` · `embed` · `security` · `activity` · `export` · `delete` | section anchors (`#email`) |

`?topup=1` is honoured on **every** app route (D9), and `?q=` on every list page (the palette's "Show all" links use it).

**Settings sub-nav groups** (direction §6.6, with Integrations added to Workspace): **Workspace** (Profile, Organization and team, Notifications, Integrations) · **Calling** (Phone setup) · **Developer** (API keys, Webhooks, Embed) · **Security** (Security) · **Data** (Activity, Export data, Delete account, last and in danger text). Page layout belongs to the Settings spec; the slugs above are fixed here so redirects can ship first.

### 2.4 Redirects (nothing old ever 404s)

Server redirects are `308` and keep the query string. Hash redirects run client-side on `/settings` because the server never sees the hash.

| Old | New | Kind | Finding |
|---|---|---|---|
| `/dashboard` | `/cockpit` | 308 | F-UX-017 |
| `/flow-builder` | `/flows` (list) | 308 | F-UX-005, F-UX-031 |
| `/flow-builder?flow=<id>` (or the id param in use today) | `/flows/<id>` | 308 | F-UX-031 |
| `/meeting-agent`, `/meeting-agent/*` | `/meetings`, `/meetings/*` | 308 | F-UX-017 |
| `/onboarding` | `/home` | 308 | F-UX-006, F-RWD-019 |
| `/api-keys` · `/api-keys/embed` · `/webhooks` · `/webhooks/deliveries` | `/settings/api-keys` · `/settings/embed` · `/settings/webhooks` · `/settings/webhooks/deliveries` | 308 | F-UX-027 |
| `/admin`, `/admin/organizations` | `/settings/organization` | 308 | F-UX-001 |
| `/settings` | `/settings/profile` | 308 | F-UX-027 |
| `/settings#wallet` | the referring page with `?topup=1` when reached from an in-app link, else `/billing/wallet?topup=1` | client | F-UX-002, F-QA-004 |
| `/settings#autopay` | `/billing/autopay` | client | F-UX-002 |
| `/settings#meetings-billing` (the in-page "Meetings Billing" tab) | `/billing/plans` | client | F-UX-021 |
| `/settings#docs` (the in-page "Docs" tab) | Help menu; the three dead doc links go to their real pages | client | F-QA-017 |
| `/settings/calling-number`, `/settings/call-channel` | `/settings/phone`, `/settings/phone#transfer` | 308 | F-UX-015 |
| `/settings/calendly` | `/settings/integrations#calendly` | 308 | audit 1.6 |
| `/settings/change-email` | `/settings/security#email` | 308 | F-UX-044 |
| `/settings/data-export` | `/settings/export` | 308 | |
| `/settings/personal-agent` (orphan) | `/personal-agents/settings` | 308 | audit 1.6 |
| `/call-reports?id=<id>` | `/call-reports?call=<id>` | 308 | F-UX-031 |
| `/signup` | stays `/signup`: its own route in "Create account" mode, never a redirect to `/login` | fix | F-QA-010 |

A CI crawl asserts that every legacy path above answers 308 to its target, and that every in-app `href` with a hash resolves to an element (F-UX-002).

### 2.5 Landing logic

```
after sign-in or on "/" inside the app shell:
  if ?next is a same-origin app path the user can open → next
  else if workspace.setup.completedAt is null           → /home
  else                                                  → /cockpit
```

- The workspace tile, "Go to Cockpit" on error pages and the palette's "Home" all resolve through this function, so no in-app control sends a signed-in user to the marketing site (F-UX-029).
- The marketing site stays public; for signed-in visitors its header shows "Open app" pointing at the landing route (public-site spec).
- A `?next` pointing to a route the role cannot open lands on the Forbidden page for that route, not on the Cockpit (F-QA-018).

### 2.6 The one nav config

Extends `lib/nav.ts` from data-nav §0.7. One new optional field, `visible`, handles Home; everything else is as specified there.

```ts
// lib/nav.ts (additions in bold comments)
export const NAV: NavEntry[] = [
  { id: 'home', label: 'Home', href: '/home', match: ['/home'], icon: House, group: 'operate',
    visible: (s) => s.setup.completedAt === null },                     // NEW field: shown only during setup
  { id: 'cockpit', label: 'Cockpit', href: '/cockpit', match: ['/cockpit'], icon: Activity, group: 'operate', phoneSlot: 1,
    keywords: ['dashboard', 'agent view', 'live calls', 'test call'],
    badge: (s) => s.liveCalls > 0 ? { kind: 'live', text: `${s.liveCalls} live`, srText: `${s.liveCalls} live calls` } : null },
  { id: 'assistant', label: 'Assistant', href: '/assistant', match: ['/assistant'], icon: Bot, group: 'operate', keywords: ['chat', 'copilot', 'ask'] },
  { id: 'rep-console', label: 'Rep console', href: '/rep-console', match: ['/rep-console'], icon: Headphones, group: 'operate', keywords: ['softphone', 'transfer', 'human'] },
  { id: 'meetings', label: 'Meetings', href: '/meetings', match: ['/meetings'], icon: Video, group: 'operate', keywords: ['meeting agent', 'meet', 'rooms', 'notes'] },
  { id: 'personal-agents', label: 'Personal agents', href: '/personal-agents', match: ['/personal-agents'], icon: ListChecks, group: 'operate',
    keywords: ['tasks', 'delegate'], badge: (s) => countBadge(s.tasksToConfirm, 'to confirm', 'tasks waiting for you to confirm') },
  { id: 'flows', label: 'Flows', href: '/flows', match: ['/flows'], icon: Workflow, group: 'build', phoneSlot: 4,
    keywords: ['flow builder', 'script', 'call flow'], badge: (s) => countBadge(s.flowsWithDrafts, 'draft', 'flows with unpublished changes') },
  { id: 'knowledge', label: 'Knowledge', href: '/knowledge', match: ['/knowledge'], icon: BookOpen, group: 'build',
    keywords: ['documents', 'files', 'faq', 'price sheet'], badge: (s) => s.role === 'admin' ? countBadge(s.proposals, 'to review', 'proposals to review') : null },
  { id: 'leads', label: 'Leads', href: '/leads', match: ['/leads'], icon: Users, group: 'data', phoneSlot: 2,
    keywords: ['contacts', 'crm', 'customers'], badge: (s) => countBadge(s.callbacksDueToday, 'due', 'callbacks due today') },
  { id: 'call-reports', label: 'Call reports', href: '/call-reports', match: ['/call-reports'], icon: FileText, group: 'data', phoneSlot: 3,
    keywords: ['reports', 'call log', 'history', 'transcripts', 'recordings'] },
  { id: 'analytics', label: 'Analytics', href: '/analytics', match: ['/analytics'], icon: ChartColumn, group: 'data', keywords: ['insights', 'sentiment', 'intents'] },
  { id: 'billing', label: 'Billing', href: '/billing/wallet', match: ['/billing'], icon: Wallet, group: 'account',
    keywords: ['wallet', 'recharge', 'top up', 'invoices', 'usage', 'plans', 'autopay'], badge: walletBadge },   // Low | Empty | Blocked
  { id: 'settings', label: 'Settings', href: '/settings/profile', match: ['/settings'], icon: SlidersHorizontal, group: 'account',
    keywords: ['preferences', 'profile', 'phone setup', 'DID', 'api keys'], badge: (s) => s.number.status === 'unverified' ? warn('Verify', 'calling number not verified') : null },
];
```

`keywords` feed the palette's synonym search (overlay §8.9). `<title>`, H1, rail tooltips, the bottom bar, the More sheet and ⌘K all read `label` from here; a lint rule rejects destination names typed anywhere else. **More** is not a `NAV` entry: the BottomBar appends it with the Lucide `ellipsis` icon ("•••"); `menu` (the hamburger) is only the tablet NavSheet trigger.
