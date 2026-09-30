<!-- Assembled from 00-app-shell-ia.part1.md, 00-app-shell-ia.part2.md, 00-app-shell-ia.part3.md, 00-app-shell-ia.part4.md, 00-app-shell-ia.part5.md, 00-app-shell-ia.part6.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

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

---

## 3. The shell frame

### 3.1 Anatomy and DOM order

One frame on every signed-in route, including Settings sub-pages, 404, 403 and loading states (data-nav §1.1). DOM order equals focus order:

| # | Region | Element and landmark | Notes |
|---|---|---|---|
| 1 | Skip link | `<a href="#main">Skip to main content</a>` | First element; visible on focus at `--z-skiplink` (F-A11Y-012) |
| 2 | Navigation | `<nav aria-label="Main">`: Sidebar **or** Rail **or** TopBar + NavSheet **or** TopBar + BottomBar + MoreSheet | Only one rendered per breakpoint (CSS `display:none` on the rest), so there is never a duplicate landmark (F-A11Y-017) |
| 3 | Main | `<main id="main" tabindex="-1">` containing ConnectionBar (only when offline), PageHeader, at most one page Notice, then the page | The H1 is inside PageHeader (`tabindex="-1"`) |
| 4 | Baseline | `<div role="region" aria-label="Workspace status">` | Desktop and laptop only; hidden in the Flow Designer; folds to a chip at ≤720 px tall (part 3 §5) |
| 5 | Toasts | Radix Toast viewport, `role="region" aria-label="Notifications"` | F8 focuses the newest toast (overlay §9.4) |
| 6 | Announcer | one visually hidden polite `role="status"` | Fed by `announce()` (data-nav §0.7) |
| 7 | Portals | palette, sheets, dialogs, menus, tooltips | Named z-layers only |

There is no `<header>` landmark per page and no `contentinfo` (data-nav §2.6; direction §1.3).

### 3.2 Shell modes

| Mode | Routes | What differs |
|---|---|---|
| **standard** | every destination and sub-page | as below |
| **focus** | `/flows/<flowId>` (the Flow Designer) | At ≥1024 the navigation is forced to the **Rail** without changing the user's sidebar preference; the **Baseline is hidden**; the 56 px PageHeader is replaced by the Flow header (48 px) that carries the wallet chip and the live facts (Flow Designer spec; F-FLOW-022, F-FLOW-034). Leaving the designer restores the preference. |
| **bare** | `/login`, `/signup`, `/signup/workspace`, `/signup/pending`, `/forgot-password`, the global error page | No navigation. A 400 px (`--size-container-narrow`) centred column with the V mark on top; the same tokens and type (F-VIS-025). |
| **public** | marketing routes and the signed-out 404 | The marketing shell (public-site spec). |

### 3.3 Mounted once by AppShell (`app/(app)/layout.tsx`)

`SkipLink` · the navigation for the breakpoint · `RouteProgress` · `ConnectionBar` · `Baseline` · `<Toaster/>` · `LiveRegion` (announcer) · `CommandPalette` · the `?` shortcut sheet (Dialog lg) · `TopUpSheet` (content owned by the Billing spec; opened by `?topup=1` on any route) · `SessionExpired` · the sign-out ConfirmDialog. The layout stays mounted across routes and during loading, so the shell never disappears (F-UX-030, F-QA-007).

### 3.4 Layout at each breakpoint

Widths are the foundations breakpoints. Each layout is designed, not shrunk (P6). Wireframes use the Leads page as the sample content.

**Desktop ≥1440 · labelled sidebar, docked sheets**

```
┌ Sidebar 232 ──────────┬ content (fluid) ───────────────────────────────────────────────────────┐
│ [S] Sample Realty   ⇕ │ Leads  1,284 leads · synced 11:24 am          Export   Import…   [New lead]│ header 56
│ ⌕ Search or jump to…  │ All 1,284   New 312   Callbacks due 18   Interested 96   + Save view     │ views 40
│                       │ ⌕ Search leads   Filter ▾   Columns   Standard | Compact                 │ toolbar 48
│ Operate               │ ┌ table ──────────────────────────────────┐┌ Lead sheet 440 (docked) ──┐│
│  Cockpit     ● 2 live │ │ ☐  Lead        Phone           Status   ││ Lead 1042             ✕  ││
│  Assistant            │ │ ☐  Lead 1042   +91 •••••• 4821  New      ││ Overview · Calls · Notes  ││
│  Rep console          │ │ …  (about 16 rows at Standard)          ││                           ││
│  Meetings             │ └─────────────────────────────────────────┘└───────────────────────────┘│
│  Personal agents      │ 1–50 of 1,284                                                    ‹   ›   │ pager 40
│ Build                 ├──────────────────────────────────────────────────────────────────────────┤
│  Flows       1 draft  │ Live v7 · Site-visit qualifier │ Inbound +91 80 •••• 2210 · Ready │        │
│  Knowledge            │ Wallet ₹2,340.50 · about 16 h of calls │ 2 calls in progress  Shortcuts Search│ Baseline 28
│ Data  Leads▣ …        │ (one line; shown here on two for width)                                  │
│ Account  Billing ⚠Low │                                                                          │
│ ┌ Finish setup 3 of 5┐│                                                                          │
│ └ Next: add money ───┘│                                                                          │
│ (AR) Anika R.       ⇕ │                                                                          │
└───────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

**Laptop-L 1280–1439 · same sidebar, sheets overlay the right third.** The record sheet is non-modal over the table (`--z-overlay`); the table keeps its columns and scroll position.

**Laptop-S 1024–1279 · 56 px rail, Baseline stays**

```
┌Rail┬ content ─────────────────────────────────────────────────────────────────────┐
│[S] │ Call reports  121 calls · 3 need review                              Export ⋯ │
│ ⌕  │ All · Needs review · Positive · Negative · Mixed · Unscored                    │
│ ── │ table …                                                                       │
│ ⌁• │                                                                              │
│ ⌂  │           ┌─ tooltip (portal, never clipped) ─┐                              │
│ …  │  ▣ ──────►│ Billing · Wallet low                │                              │
│ ── │           └────────────────────────────────────┘                              │
│ ⇥  ├──────────────────────────────────────────────────────────────────────────────┤
│(AR)│ Live v7 │ Inbound · Ready │ ⚠ Wallet ₹42.10 · about 17 min · Top up │ Shortcuts Search│
└────┴──────────────────────────────────────────────────────────────────────────────┘
```

Rail: workspace tile, a search button (opens ⌘K), group separators instead of labels, 8 px badge dots (`--live` or `--warning`) with the words in the tooltip and accessible name, expand button (`panel-left`, `[`) and the avatar at the bottom. `[` or the expand button opens the full Sidebar as an **overlay with a flat scrim**; content never reflows (data-nav §1.4; F-VIS-033). The setup card lives only in the overlay at this width; the rail shows a 8 px `--accent-mark` dot on the expand button while setup is incomplete, named "Expand navigation, setup 3 of 5 done".

**Tablet 768–1023 · top bar and nav sheet**

```
┌ TopBar 52 ───────────────────────────────────────────────────────────────┐
│ ☰  Leads                          [● Live 02:14]  [₹42 · Top up]   ⌕    │
├──────────────────────────────────────────────────────────────────────────┤
│ 1,284 leads · synced 11:24 am                           ⋯   [New lead]   │ header row 48
│ View: All ▾        ⌕ Search leads           Filter ▾                      │
│ list …                                                                   │
└──────────────────────────────────────────────────────────────────────────┘
NavSheet (☰): 320 px (max 85vw) from the left, modal, flat scrim
┌──────────────────────────────┐
│ [S] Sample Realty        ✕   │
│ ⌕ Search or jump to…         │
│ Operate · Build · Data ·     │  all groups, 44 px rows (touch)
│ Account                      │
│ Finish setup · 3 of 5  ▬▬▬▭  │  (while incomplete)
│ Workspace status             │  BaselineList: flow, line, wallet, calls
│ (AR) Anika R.            ⇕   │
└──────────────────────────────┘
```

The NavSheet body (groups, setup card, Workspace status) scrolls as one region; the workspace switcher, search and account row stay pinned. The page H1 moves into the TopBar title (data-nav §1.6). The call chip exists only during a call; the wallet chip is always its own chip, neutral when healthy. When the title would drop below 120 px, chips hide in reverse priority (normal wallet first, then warning wallet, never the call chip). Sheets and dialogs are full height.

**Phone 320–767 · top bar, five tabs, More**

```
┌ TopBar 52 ────────────────────────────┐   More sheet (bottom, max 88dvh)
│ Leads            [₹2,340]         ⌕   │   ┌──────────────────────────────────┐
├───────────────────────────────────────┤   │ More                          ✕  │
│ 1,284 leads · 11:24 am   ⋯ [New lead] │   │ Operate                           │
│ ⌕ Search leads        Filter ▾         │   │  Assistant        Rep console     │
│ Lead 1042                 New          │   │  Meetings         Personal agents │
│ +91 •••••• 4821 · Not reached · 2 h  अ │   │ Build   Knowledge                 │
│ …  (at least 5 list items)             │   │ Data    Analytics                 │
├───────────────────────────────────────┤   │ Account Billing ⚠ Low   Settings  │
│ Cockpit  Leads  Call reports Flows More│   │ Finish setup · 3 of 5  (card)     │
└───────────────────────────────────────┘   │ Workspace status (BaselineList)   │
 56 px + safe area; labels 12 px; 44 px    │ (AR) Anika R. · Admin    Profile ›│
 targets; current = accent + top bar       │ Theme  System | Light | Dark      │
                                           │ Help and docs ›                   │
                                           │ ─────────────────────────────────  │
                                           │ Sign out…                         │
                                           └──────────────────────────────────┘
```

12 of 12 destinations are reachable (F-RWD-001, F-UX-008). "More" carries the current mark when the current route is a More destination, including `/home`. One entry point: the phone TopBar never has a menu button, and More uses the `ellipsis` icon, never `menu`. The BottomBar hides only under full-screen sheets and task flows (§4.3). Sign out is never a tab. Desktop-only keyboard hints are not rendered on phones (F-UX-048).

**Short and zoomed screens**

| Condition | Shell | Evidence |
|---|---|---|
Heights here are **inner viewport** heights, not screen heights: 1366×768 and 1280×720 laptops give about 1366×657 and 1280×609 in maximised Chrome or Edge, a 1920×1080 laptop at 125 % about 1536×730, and a 13″ MacBook about 1440×789 (`05-responsive` §2.1).

| Condition | Shell | Evidence |
|---|---|---|
| ≥1024 wide, ≤800 tall, **fine pointer** (every laptop above: 1440×789, 1536×730, 1366×657, 1280×609) | Sidebar and rail **short mode**: 28 px items, tighter group spacing, setup card as one 32 px row. All 12 items fit in 596 px without scrolling (data-nav §1.2). | F-UX-007, F-RWD-005 |
| ≥1024 wide, ≤800 tall, **coarse pointer** (landscape tablets: 1024×768, 1280×800) | **No short mode.** Touch density keeps sidebar and rail items at 44 px; the nav list scrolls vertically with the current item scrolled into view, so all 12 stay reachable without shrinking a target (06-accessibility §15.1). | F-A11Y-023, F-RWD-005 |
| ≥1024 wide and ≤720 tall (1366×768 and 1280×720 laptops, always) | Baseline folds into the **BaselineChip** in the PageHeader (`--size-baseline` becomes 0). On these laptops the chip is the primary workspace-status surface (part 3 §5.4); the band shows from 1536×730 up | foundations §5 |
| ≥768 wide and <600 tall (landscape phones, 1920×1080 at 200 % ≈ 960×485, 1366×768 at 125 % ≈ 1093×526) | **Tablet shell** (TopBar + NavSheet), whatever the width | F-RWD-005 (844×390 showed no complete nav item) |
| 1440×900 at 200% zoom (720×450 CSS px) | **Phone shell**: bottom bar + More | F-RWD-001 |

### 3.5 Chrome budget

Vertical chrome on a data page (Leads) in Standard density, on **inner viewports** (an earlier version subtracted chrome from the 768 px screen height of a 1366×768 laptop, whose viewport is about 657). Target: at least 10 rows on 1366×768 and 1280×720 laptops (direction §6.1). The full per-breakpoint table, phones included, is `05-responsive` §3.4.

| Inner viewport (screen) | Chrome | Rows visible (40 px) |
|---|---|---|
| 1440×900 (the mocks' reference) | header 56 + views 40 + toolbar 48 + head 32 + pager 40 + Baseline 28 = 244 | 16 |
| 1920×969 (1920×1080) | 244 | 18 |
| 1536×730 (1920×1080 at 125 %) | 244 | 12 |
| 1366×657 (1366×768) | ≤720 tall: Baseline → BaselineChip, views → View select: 56 + 48 + 32 + 40 = 176 | 12 |
| 1280×609 (1280×720) | 176 | 10 |
| 768×950 (iPad portrait, Safari) | TopBar 52 + header row 48 + toolbar 48 + pager 40 = 188 (rows 48 px) | 15 |
| 390×844 (phone, mock size, top of page) | TopBar 52 + header row 48 + toolbar 48 + bottom bar 56 + safe area 34 = 238 | 9 two-line items; 8 at 390×750, iPhone Safari while scrolled (`05` §3.4) |

No global banner is part of any budget: the wallet banner (42 px on every page, 58–77 px on phones) is retired (F-UX-028, F-RWD-013).

### 3.6 What the eye hits first

1. **The page's work** (table, canvas, conversation): the largest region, on `--surface`.
2. **The H1 and its one line of meta** (title-20 + data-13 text-3): where am I, how much is here.
3. **The one primary action** (Neel), top right of the header.
4. **The current nav item** (raised key, accent icon) and any **amber** fact (Baseline segment or nav badge), which only appears when something is actually blocked or low.
5. Everything else in the chrome is `--text-2`/`--text-3` on `--bg` and recedes.

### 3.7 Shell states

| State | Treatment | Copy |
|---|---|---|
| First paint (hard load) | The server layout renders the shell from the session (user, workspace, role, setup summary, wallet summary). No client auth gate, no full-screen "Loading…" (F-QA-007, F-UX-030). Page regions show skeletons after 200 ms. Nav badges render nothing until workspace state resolves. | SR only: "Loading leads…" |
| Client route change | `RouteProgress` after 200 ms; on completion `document.title` updates and focus moves to the H1. | none |
| Workspace state failed | Badges stay hidden; the Baseline shows one neutral segment. | "Couldn't load workspace status · Retry" |
| Offline | `ConnectionBar` at the top of `<main>`; navigation to uncached routes is cancelled with an info toast (overlay §10.3). | "You're offline. Showing data from 11:42 am." / toast "You're offline. Call reports will open when you reconnect." |
| Session expired (explicit 401 only) | `SessionExpired` dialog over the shell; never a silent redirect on a timeout (F-QA-007). | "Your session expired. Sign in again to keep working. Edits on this page stay on this device." |
| Signed out in another tab | `BroadcastChannel('vaani-auth')` sends every tab to `/login?reason=signed-out`. | Login shows "You're signed out." |
| Role cannot use a route | The route renders `Forbidden` inside the shell; the nav item is already hidden (part 6). | "Only organization admins can review proposals." |
| Workspace switch | Guarded if there are unsaved edits; then the landing route of the new workspace, with a toast. | "Switched to Demo Workspace." |

### 3.8 Interactions and keyboard (shell-wide)

| Key | Does | Notes |
|---|---|---|
| ⌘K / Ctrl+K | Search or jump (palette) | Works inside text fields; again closes |
| `?` | Keyboard shortcuts sheet | Single-key; obeys the shortcut switch; ignored in fields |
| `[` | ≥1280: collapse or restore the sidebar (remembered as `vaani:sidebar`). 1024–1279: open or close the rail overlay | Single-key; ignored in fields and on buttons or links. **Suppressed in focus mode** (the Flow Designer), where `[` / `]` step through changes in compare mode; the rail's expand button still opens the overlay |
| F6 | Cycle focus: navigation → main → open sheet or inspector → Baseline | Non-modal regions only |
| F8 | Focus the newest toast | overlay §9.4 |
| Esc | Close the top-most overlay; in the palette, clear the query first | never closes a page |

Every shortcut has a visible control (P5): the Jump button and the Baseline's "Search" for ⌘K, "Shortcuts" for `?`, the expand button for `[`. Keycaps appear only in tooltips, menus, palette rows and the `?` sheet.

### 3.9 Accessibility notes

- One tab stop per nav item, no nested focusable wrappers; today each item is two stops and a nameless `div` (F-A11Y-012). From a fresh load, content is two keystrokes away (Tab to the skip link, Enter); by plain Tab the sidebar costs one stop per control (workspace, search, 12 or 13 items, setup card, account), against 33 stops today.
- `aria-current="page"` on the current item in every nav, matched by route prefix, so `/settings/api-keys` marks Settings (F-A11Y-017, F-UX-017).
- Rail tooltips appear on hover **and keyboard focus**, in a portal; the accessible name includes the badge ("Billing, wallet low").
- Route change: title updates, focus moves to the H1. The polite region announces the page name only when focus cannot move (an open non-modal sheet keeps focus).
- Touch targets: 44×44 on the bottom bar, More rows, TopBar buttons and chips; 24×24 minimum elsewhere (F-A11Y-023).
- Reduced motion: the rail overlay, NavSheet and MoreSheet fade instead of sliding; the live dot is still and the word "live" carries the state.
- Forced colours: the current item and More's current mark use `aria-current` → `Highlight` outline; badge dots carry `data-mark`.

### 3.10 Acceptance criteria: shell

- [ ] At the inner viewports 1440×900, 1536×730, 1366×657, 1366×625, 1280×609 and 1024×768, every one of the 12 destinations (13 with Home) is visible without scrolling the nav, and the nav has no horizontal scrollbar (F-UX-007, F-RWD-005).
- [ ] At 1366×657 and 1280×609 the BaselineChip is in the PageHeader and shows the top fact (amber first); at 1536×730 and above the band is shown instead.
- [ ] At 390×844, 360×780 and 320×640, each destination is reachable in at most two taps (bottom bar or More), and Sign out is inside More, after a separator, behind a confirmation (F-RWD-001).
- [ ] At 844×390 and at 200% zoom of 1440×900, every destination is reachable without typing a URL.
- [ ] Tablet (768–1023): opening the nav never narrows the content; it is a modal sheet over it (F-VIS-033).
- [ ] Only one `<nav aria-label="Main">` exists in the accessibility tree at any width; axe `landmark-unique` passes.
- [ ] The first Tab from a fresh load focuses "Skip to main content"; Enter moves focus to `<main>`.
- [ ] On `/settings/*` and every legacy developer path (after redirect), Settings is the current item with `aria-current="page"`.
- [ ] A hard load shows the navigation and PageHeader within 1 s on a 4G profile and never a full-screen spinner; the H1 is visible within 2.5 s (F-QA-007).
- [ ] Throttled route change: RouteProgress appears after 200 ms and completes; the old page is never shown without feedback for more than 200 ms (F-UX-030).
- [ ] Offline, clicking an uncached nav item keeps the shell and shows the info toast; the browser error page never appears (F-QA-007).
- [ ] In the Flow Designer at 1440, the nav is the rail and the Baseline is absent; leaving it restores the sidebar.
- [ ] Every phone TopBar, BottomBar and MoreSheet is generated from `lib/nav.ts`: at 390 px the bar reads exactly Cockpit · Leads · Call reports · Flows · More, More shows `ellipsis`, no phone TopBar has a `menu` button, and on a More destination (Meetings, Analytics, Settings…) More carries the current mark.
- [ ] No text in the shell renders below 12 px at any breakpoint (bottom-bar labels included), measured with `getComputedStyle` (F-VIS-002).

---

## 4. Page header, top bar and `<title>` conventions

### 4.1 Fixed rules (every page spec follows them)

1. **One `PageHeader` per page, one H1.** The H1 is the destination's `label` from `lib/nav.ts`, or the record's own name on record pages. Today there are 13 H1 treatments, including 15 px tracked caps under 27 px section titles (F-VIS-005, F-VIS-010).
2. **One meta line of computed facts** (`data-13`, `--text-3`): counts first, then freshness, joined by " · ". Counts are pipeline-wide from the server, never the loaded page (F-QA-015). While loading, the meta is a skeleton bar, never "0" (F-UX-030).
3. **At most three visible actions and at most one primary**, which is always last. Destructive actions live in `⋯`, after a separator, in `--danger-text`, ending in "…" (F-UX-035, F-UX-047).
4. **Description row** only on overview, setup and form pages, never on data pages.
5. **Below the header**, in this order and only when they apply: one page `Notice` (the blocking-notice rule; part 3 §6), then view tabs, then the toolbar. Nothing global sits between the header and the work.
6. **Below 1024 px** the H1 moves into the TopBar title, secondary and tertiary actions fold into `⋯`, and the primary keeps its label. Headers wrap and never push the page sideways (F-RWD-007, F-RWD-008).

### 4.2 Per destination

Page specs may change which actions appear, within the rules above. The meta formulas are shell contracts: the Baseline, badges and meta use the same server numbers, so they never disagree (F-UX-011).

| Destination | H1 | Meta (examples; all computed) | Primary | Other visible actions |
|---|---|---|---|---|
| Home | Home | "2 of 5 done" | none in the header: the current setup step holds the page's one primary | Invite teammates… (tertiary, admins) |
| Cockpit | Cockpit | "2 live · 3 up next" / "No calls in progress" | none in the header: the Ready card holds **Place call…** | none |
| Assistant | Assistant | none | New chat | none |
| Rep console | Rep console | "You're available" / "You're not taking transfers" | Go available / Go unavailable | none |
| Meetings | Meetings | "1 live · 12 past" | Start a meeting | none |
| Personal agents | Personal agents | "3 tasks · 1 waiting for you" | New task | none |
| Flows | Flows | "16 flows · 3 live · 1 draft" | New flow | Import JSON… (tertiary) |
| Knowledge | Knowledge | "14 files · 1 indexing" | Upload files | Review proposals (admins; tertiary) |
| Leads | Leads | "1,284 leads · synced 11:24 am" | New lead | Import…, Export |
| Call reports | Call reports | "121 calls · 3 need review" (calls, not legs; tests excluded unless shown) | none | Export |
| Analytics | Analytics | "Last 7 days · updated 11:24 am" | none | Range select (in the toolbar, not the header) |
| Billing | Billing | "Wallet ₹2,340.50 · about 16 h of calls" | Top up | none; tabs below: Wallet · Usage · Plans · Invoices · Autopay |
| Settings › page | page name, e.g. "Phone setup" | none, or the page's status ("Verified", "Step 2 of 3") | none: forms save through the UnsavedChangesBar | none |

**Record and sub-pages** use `PageHeader variant="nested"`: a breadcrumb to the parent, the record name as H1 (`translate="no"`), and one state `Tag` ("Live v7"). Billing tabs are `RouteTabs` under the "Billing" H1; the tab name goes into `<title>`, not the H1. Settings pages show the "Settings" breadcrumb and their own H1; the 200 px Settings sub-nav stays visible on every Settings page (F-UX-027).

### 4.3 Top bar (tablet and phone)

| Slot | Tablet 768–1023 | Phone 320–767 |
|---|---|---|
| Leading | Menu button (`menu`, opens NavSheet) | Back link (`chevron-left` + parent label) on record and sub-pages, else nothing. **Never a menu button** |
| Title | The page H1 (`title-16`, one line, ellipsis, full text in a tooltip) | same |
| Chips | Call chip `● Live 02:14` (only during a call) · Wallet chip: `wallet` icon + `₹2,340`; warn: `triangle-alert` + `₹42.10 · Top up` / `₹0 · Top up` | same, with the priority rule (part 2 §3.4) |
| Trailing | Search (opens ⌘K) | Search (opens the full-screen palette) |

**One source.** TopBar, BottomBar and MoreSheet read only `lib/nav.ts` (§2.6) and the §5.2 copy. The BottomBar is the four `phoneSlot` entries in slot order plus More (`ellipsis`), with full labels ("Call reports", never "Reports"). It shows on every phone destination page, including the Flow Designer outline (Flows current; 05-responsive §4.1, §10.5), and hides only while a full-screen sheet or full-screen task flow is open (record sheet, Call gate, Publish gate, text test, New task, Top up) or the on-screen keyboard is up (05-responsive §7.3). Reference mocks render all three from `spec/components/shell-partials.js`.

### 4.4 `<title>`

Pattern: `[state · ][record · ]Label · Vaani Labs`, joined by " · " (a middle dot with spaces), sentence case. Today every route is "Vaani Labs - The Voice AI that speaks India" (F-A11Y-013).

| Context | `<title>` |
|---|---|
| Destination | `Leads · Vaani Labs` |
| Tab or sub-page | `Usage · Billing · Vaani Labs` · `Phone setup · Settings · Vaani Labs` |
| Record sheet open | `Lead 1042 · Leads · Vaani Labs` · `Call on 21 Sep · Call reports · Vaani Labs` |
| Flow Designer | `Site-visit qualifier · Flows · Vaani Labs` |
| Flow Designer with a failed save | `Couldn't save · Site-visit qualifier · Flows · Vaani Labs` |
| Your own call is live | `On call · Cockpit · Vaani Labs` (no ticking timer in the title) |
| Home | `Home · Vaani Labs` |
| Not found · no access · page error | `Page not found · Vaani Labs` · `No access · Knowledge · Vaani Labs` · `Couldn't load · Call reports · Vaani Labs` |
| Auth (bare) | `Sign in · Vaani Labs` · `Create account · Vaani Labs` · `Create workspace · Vaani Labs` · `Reset password · Vaani Labs` |

Rules: record names are truncated at 60 characters with "…"; overlays (palette, dialogs) never change the title; the title is set from `lib/nav.ts` plus the record name, never typed by a page. Telemetry uses the route template, never `document.title`, because titles can contain lead names (F-UX-045).

### 4.5 Acceptance criteria: headers and titles

- [ ] Every signed-in route has exactly one `h1`, styled `title-20` (≥1024) or `title-16` in the TopBar (<1024); its text equals `NAV[id].label` or the record name.
- [ ] No meta line shows "0" while its query is pending; a failed count reads "Couldn't load counts · Retry".
- [ ] No header shows more than one filled Neel button; no destructive action is outside `⋯`.
- [ ] At 360 px no header scrolls the page sideways (`documentElement.scrollWidth === innerWidth`) and the primary stays visible (F-RWD-007, F-RWD-008).
- [ ] `document.title` is unique per route and matches the table; a crawl of every route in §2.3 finds no duplicate titles.

---

## 5. The Baseline (workspace status band)

**Purpose.** A 28 px ink band under every desktop and laptop screen that states **only computed facts** about the workspace: what is live, whether calls can be placed, the wallet and its runway, and calls in progress. It replaces the 42 px wallet banner and the fake "SYS: ONLINE · 12ms · RGN" footer (F-UX-028, F-UX-018). It is the product's first signature (direction §6.1). **Not specified in the component specs; this section is its spec** (part 6 lists it as a new component).

### 5.1 Anatomy and tokens

| Part | Value |
|---|---|
| Band | height `--size-baseline`; `--bl-bg`; top border `--bw-hairline` `--bl-line` (visible in dark only); padding `0 var(--space-12)`; `meta-12` in `--bl-text`; `white-space: nowrap; overflow: hidden`; `z-chrome`; it spans the content column, not the sidebar |
| Segment | inline-flex, gap `--space-6`; text only, except the warn `triangle-alert` (`--icon-sm`, `currentColor`) and your call's `LiveDot`; values (version, number, amounts, counts) in `--bl-strong` 500; the number and timers in `mono-12`, all else Hanken `meta-12`; separated by a 1×12 px `--bl-sep` rule and `--space-12` |
| Link | each segment is one `<a>`; underline on hover; focus `outline: 2px solid var(--bl-focus); outline-offset: -2px` |
| Warn segment | `--bl-warn` text and a `triangle-alert` icon; the action word ("Top up") is underlined; the only third colour allowed in the band |
| Live mark | `LiveDot` (8 px, `--live`, `data-mark`), pulsing only during your own live call |
| Right cluster | "Shortcuts" (opens the `?` sheet) · "Search" (opens ⌘K), as text buttons in `--bl-text` |

### 5.2 Segments

Fixed order, left to right. A segment appears only when it has something true to say; at most five. **These strings are the copy contract**, exact to the word, case and " · " separator, followed by the words "Shortcuts" then "Search". One copy module (`lib/baseline-copy.ts`) feeds the band, BaselineChip, BaselineList and the TopBar wallet chip; no page composes its own. Zero states are omitted, never printed ("No calls in progress" is Cockpit header meta, §4.2, not a segment).

| # | Segment | Normal | Other states (in priority order) | Link |
|---|---|---|---|---|
| 1 | **Live flow** | `Live v7 · Site-visit qualifier` (the flow that answers the primary inbound number, else the outbound default); `+ 2 more` when more are live | ⚠ `No live flow · Publish one` · during setup, once published: `Published v1 · Site-visit qualifier` (neutral) · interim before revisions ship (Flow Designer part 2 §4.9, I1): `Saved flow · Site-visit qualifier` (no version claimed) | `/flows/<id>`; "+2 more" → `/flows?status=live` |
| 2 | **Phone line** | `Inbound +91 80 •••• 2210 · Ready` (`PhoneText`, tabular digits) | ⚠ `No calling number · calls can't be placed · Finish setup (3 of 5)` · `Verifying number · step 2 of 3` (neutral) · `Inbound +91 80 •••• 2210 · Verified` (neutral; another setup check still blocks calls) · ⚠ `Number not verified · Verify` · ⚠ `Phone line degraded · Status` (a real incident, §7) | `/settings/phone`; "Status" → the public status page (new tab) |
| 3 | **Wallet** | `Wallet ₹2,340.50 · about 16 h of calls` | ⚠ `Wallet ₹42.10 · about 17 min · Top up` · ⚠ `Wallet ₹0 · calls paused · Top up` · ⚠ `Autopay failed · Fix` · `Wallet ₹42.10 · payment pending` (neutral) · runway unknown: `Wallet ₹2,340.50` | `/billing/wallet`; "Top up" → `?topup=1`; "Fix" → `/billing/autopay` |
| 4 | **Activity** | `2 calls in progress` · `Batch · 12 of 40 placed` (the workspace's other calls; yours is segment 5) | omitted when nothing is running | `/cockpit` |
| 5 | **You** | during your own call: ● `On call 02:14 · Lead 1042` (tabular `Timer`) · for reps: `Available for transfers` | hidden otherwise | `/cockpit?call=<id>` · `/rep-console` |

Runway ("about 16 h") is computed from the real per-second rate and median call length; until those endpoints exist the runway is omitted, never estimated (direction §8, interim behaviour).

### 5.3 Width behaviour

Content widths below 1100 px (the rail layout, or a docked sheet) use short forms, applied in this order until the band fits: (1) the flow name drops (`Live v7`); (2) "Shortcuts" and "Search" become icon buttons with labels in their names and tooltips; (3) the number drops its digits (`Inbound · Ready`); (4) the word "Wallet" drops (`₹2,340.50 · 16 h`); (5) the Activity segment drops (the Cockpit badge still carries it). **An amber segment is never shortened below its action word and never dropped.**

### 5.4 Folded: BaselineChip and BaselineList

- **BaselineChip** (≥1024 wide, ≤720 tall): a `--size-chip` chip in the PageHeader, left of the actions. It shows the highest-priority fact: an amber segment if any (`₹0 · calls paused`), else your call (`● On call 02:14`), else the wallet short form (`₹2,340`). Warn styling = `warning-soft`/`warning-text`/`warning-border`, like the TopBar wallet chip. Activating it opens a Popover with the **BaselineList**. **It is not an edge case:** 1366×768 and 1280×720 laptops (inner viewports about 1366×657 and 1280×609, `05-responsive` §2.1) are always ≤720 tall, so on the most common office laptop the chip is the primary workspace-status surface. Its accessible name states the fact in full ("Workspace status: wallet ₹42.10, about 17 minutes of calls. Top up. 4 more"), it announces the same state changes as the band (§5.6), and the chrome budget and visual tests run at those sizes (§3.5, §3.10).
- **BaselineList**: the same segments as 44 px rows (icon · sentence · chevron), used in that Popover, in the tablet NavSheet and in the phone MoreSheet under the label "Workspace status". The tablet and phone TopBar chips still show call and wallet.

### 5.5 States

| State | Treatment |
|---|---|
| Loading | Segment labels render; values are `--bl-sep` bars 8 px tall (no shimmer) |
| Error | One neutral segment `Couldn't load workspace status · Retry`; nothing is shown as healthy |
| Offline | Values stay, and the wallet segment appends `· as of 11:42 am`; the ConnectionBar says the rest |
| Setup incomplete | Segments 1 and 2 state the blocking facts with `Finish setup (3 of 5)`, or `Published v1` / `Verified` once their step is done; nothing says "Live" or "Ready" until all five checks pass (F-UX-006) |

### 5.6 Accessibility

Region "Workspace status"; each link has a full name ("Wallet ₹42.10, about 17 minutes of calls. Top up"). **Only state changes are announced, debounced 2 s**: your call goes Live or Ended; the wallet crosses into Low or Empty; the line becomes degraded or recovers. Timers, wallet decrements and cost-so-far are never announced (direction §8). Forced colours: the band keeps `Canvas`/`CanvasText` with a 1 px `CanvasText` top border; warn segments keep their icon.

### 5.7 Acceptance criteria: Baseline

- [ ] Present on every desktop and laptop route except the Flow Designer; absent below 1024 and folded at ≤720 px tall.
- [ ] Every value traces to a server field; with the network blocked, no segment reads as healthy (no constant "online" state; F-UX-018).
- [ ] At 1024×768 in the rail layout, an amber wallet segment keeps "Top up" visible.
- [ ] A screen reader hears one announcement when the wallet crosses into Low, and none while a call timer runs.
- [ ] **Byte-identical for the same state.** Every route renders the band through the one `Baseline` fed by `useWorkspaceState()`; a snapshot test gives each route the same fixture and compares the band's `outerHTML`, which must match exactly (the reference mocks compare its inner markup, since each mock frame adds its own layout wrapper). For the healthy fixture it reads `Live v7 · Site-visit qualifier` | `Inbound +91 80 •••• 2210 · Ready` | `Wallet ₹2,340.50 · about 16 h of calls` | `Shortcuts` `Search`, with no Activity segment. Every page mock in `spec/03-pages/` passes the same check, because all of them render it from `spec/components/shell-partials.js`.

---

## 6. Wallet balance and low balance

### 6.1 What changes

| Today | After |
|---|---|
| A 42 px blue-tint `role="alert"` bar on every page, Billing included, 58–77 px on phones, rendered about 3 s late, pushing content down (F-UX-028, F-RWD-013, F-QA-036, F-A11Y-015) | A signal ladder that never takes permanent space (overlay §10.2) |
| "Top up" and "Enable autopay" open Settings › Profile, which has no wallet (F-UX-002, F-QA-004) | Every "Top up" opens the Top-up sheet in place; "Turn on autopay" opens `/billing/autopay` |
| "Wallet empty — top up now to keep calls flowing." while CONNECT stays enabled | "Wallet is ₹0. Phone calls are paused. Browser tests and free meeting minutes still work." plus a reason on every Call action |
| Dismissal lasts one tab (`sessionStorage`) | Dismissal lasts 24 h per user and per state, stored server-side; a worse state brings it back |

### 6.2 States (computed server-side)

`healthy` · `low` (runway below the threshold; proposed 60 min, part 6) · `empty` (₹0 or below one minimum call) · `pending` (a UPI payment is awaiting confirmation) · `autopay-failed` · `unknown-runway` (rate endpoints not shipped).

### 6.3 Where each state shows

| Surface | healthy | low | empty | pending | autopay-failed |
|---|---|---|---|---|---|
| Baseline wallet segment (≥1024) | `Wallet ₹2,340.50 · about 16 h of calls` | ⚠ `Wallet ₹42.10 · about 17 min · Top up` | ⚠ `Wallet ₹0 · calls paused · Top up` | `Wallet ₹42.10 · payment pending` | ⚠ `Autopay failed · Fix` |
| TopBar wallet chip (<1024) and Flow header | `₹2,340` neutral | ⚠ `₹42 · 17 min` | ⚠ `₹0 · Top up` | `₹42 · pending` | ⚠ `Autopay failed` |
| Billing nav badge | none | ⚠ Low | ⚠ Empty | none | ⚠ Blocked |
| `WalletNotice` (page scope) on **Cockpit, Leads, Flows (Test call), Rep console, Personal agents** only | none | warning: **Wallet is low.** ₹42.10 left, about 17 min of calls. · Top up · Turn on autopay | warning: **Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. · Top up | info: **Payment pending.** Your wallet updates when UPI confirms. | danger: **Autopay couldn't top up.** Your UPI mandate was declined. Calls pause at ₹0. · Fix autopay |
| Every Call action and the Call gate | enabled | enabled; the gate shows the runway | disabled: "Wallet is ₹0. Top up to place calls." | enabled if the balance covers the call | as low or empty |
| Billing, Settings, Analytics, Knowledge, Call reports | **no notice**; the Billing page states the balance itself | | | | |

On phones the WalletNotice is one line ("Wallet ₹0 · calls paused") with a 44 px Top up and a 44 px Dismiss, 8 px apart (F-RWD-013). The state is resolved in the server layout, so the notice is in the first paint and never shifts content (F-QA-036).

### 6.4 Top-up links

- Any "Top up" control calls `openTopUp({ source })`, which adds `?topup=1` to the **current** URL and opens `TopUpSheet` over the page (Billing spec owns its content: UPI first, ₹100 / ₹500 / ₹1,000, the runway before paying). Closing it removes the param; Back closes it.
- From outside the app (emails, WhatsApp, docs): `/billing/wallet?topup=1` (`/billing?topup=1` also resolves).
- Legacy `/settings#wallet` → the referring page with `?topup=1` (in-app link) or `/billing/wallet?topup=1`; `/settings#autopay` → `/billing/autopay` (as in `05-knowledge-billing` §1).
- After the provider confirms: success toast "₹500 added. Wallet ₹540.10 · about 3 h of calls." Before confirmation: the pending state, never a balance that has not arrived (P1).
- **If the member role cannot pay** (open question): every "Top up" becomes "Ask an admin to top up", which copies a request link; the notice copy stays.

### 6.5 Acceptance criteria: wallet

- [ ] A link check finds no in-app href to `/settings#wallet` or `#autopay`; each Top up entry (Baseline, chip, notice, badge popover, palette, setup step) opens the Top-up sheet over the current page (F-UX-002).
- [ ] At ₹0 no Billing, Settings, Analytics, Knowledge or Call reports page shows a wallet notice, and no page shows more than one.
- [ ] Dismissing the empty notice survives a new tab and a reload for 24 h, and reappears when the state worsens to autopay-failed.
- [ ] The notice never uses `role="alert"`; dismissing it moves focus to the H1 (F-A11Y-015).
- [ ] Layout shift from the notice is 0 (CLS) because it is server-rendered.

---

## 7. System status

### 7.1 Removed

The rail footer's "SYS: ONLINE", the random 8–22 ms latency and "RGN: Mumbai-1" are deleted, along with the Cockpit's idle "LAT: 0ms" and "SESSION: IDLE" (F-UX-018; direction §4.4). Nothing in the idle product claims health.

### 7.2 Real signals and where they show

| Signal | Source | Shows as |
|---|---|---|
| This browser is offline | `offline` event, or two consecutive failed requests | `ConnectionBar` (overlay §10.3); on recovery a toast "Back online." |
| Our API is failing | 5xx or timeouts on a region's request | `SectionError` with the last good data ("Couldn't refresh · Retry · Updated 4:42 pm"); never an empty state |
| An incident affects calling (telephony or payments) | The status service's component state, read server-side every 60 s | Baseline line segment ⚠ `Phone line degraded · Status`, plus a warning `Notice` on the spending pages: **Calls may fail to connect right now.** We're working on it. Updated 11:40 am · Service status. On resolution: toast "Calling is back to normal." |
| Planned maintenance | Status service, 24 h ahead | info `Notice` on spending pages: **Maintenance on 30 Sep, 1 am to 2 am IST.** Calls can't be placed during this window. |
| Line quality on a live call | The call's media stats | `LineQuality` in the Cockpit call card ("Line · Good · 180 ms"); only during a call (data-nav §12.2) |
| Rep availability | Rep console presence | Rep console header meta and the Baseline "You" segment; never set on page load (F-UX-023) |

**Help › Service status** (account menu) opens the public status page in a new tab, with an `external-link` icon; it is the only place a user looks for overall health.

### 7.3 Acceptance criteria: status

- [ ] Grep finds no "SYS", "LAT:", "RGN" or `Math.random` in the shell bundle.
- [ ] With the tab offline for 12 s, the ConnectionBar appears within 2 s and no element anywhere reads "online" (the audit's reproduction, F-UX-018).
- [ ] A simulated calling incident shows the notice on Cockpit and Leads but not on Analytics, and turns the Baseline line segment amber.

---

## 8. Search or jump (⌘K) and global search

**Job:** get to any destination, record or setting in a few keystrokes, start a common action, or find a call by what was said. Today Ctrl+K and `?` open nothing and there is no global search (F-UX-029). The component is `CommandPalette` (overlay §8); this section fixes its **content**.

### 8.1 Entry points

Sidebar `JumpButton` ("Search or jump to…") · rail search button · TopBar search icon (tablet, phone) · the Baseline's "Search" · ⌘K / Ctrl+K anywhere, including inside fields. `/` remains the **page** search on Leads, Call reports and Knowledge and never opens the palette.

### 8.2 Hierarchy

1. The input and the **active row** (surface-2 fill plus a 2 px inset accent-mark bar).
2. Row titles (`data-13`, the matched part at 600, no colour highlight).
3. Group labels and meta (`label-12`, `meta-12`, text-3). Footer hints last.

### 8.3 Content

| Group | Items | Source |
|---|---|---|
| **Recent** (empty query only) | The last 5 records opened, per user and workspace (`vaani:recent:<workspaceId>`, local storage, wrapped in try/catch) | client |
| **Go to** | All destinations from `lib/nav.ts` (Home only during setup), matched on `label` and `keywords` | static |
| **Settings** | Profile · Organization and team · Notifications · Integrations · Phone setup · API keys · Webhooks · Embed · Security · Activity · Export data · Delete account; Billing › Wallet · Usage · Plans · Invoices · Autopay | static |
| **Flows** | name · `Live v7` / `Not live yet` · "Draft, 3 changes" | server |
| **Leads** | display name or "Lead 1042" · masked phone `+91 •••• 4821` · status | server; matches name and digits, always displays masked |
| **Calls** | when · duration · outcome · lead; "Matched in transcript" when the hit was in the transcript | server |
| **Knowledge** | original file name · indexing status | server |
| **Actions** | New lead… · Import leads… · New flow… · Upload files… · Top up… · Start a meeting… · New task… · Invite teammates… (admins) · Theme: System / Light / Dark · Density: Standard / Compact · Turn single-key shortcuts off (or on) · Keyboard shortcuts · Sign out… | static |
| **Help** | Docs ↗ · Setup checklist (→ `/home`) · Service status ↗ · Contact support ↗ · What's new ↗ | static |

**Synonyms** (from `keywords` plus the Settings list): "dashboard", "agent view" → Cockpit; "flow builder", "script" → Flows; "DID", "virtual number", "caller ID", "calling number", "call channel" → Phone setup (F-UX-015); "recharge", "wallet" → Billing and Top up…; "members", "invite", "team" → Organization and team; "2FA", "password", "sessions", "email" → Security; "audit" → Activity.

**Verb rows.** Typing `call <name or digits>` adds action rows "Call Lead 1042…" for the top three matching leads. They open the **Call gate**; the palette never dials, bills or publishes by itself (P3, F-A11Y-004). Destructive actions are never listed; "Delete account" is only a link to its page, which keeps its typed confirmation.

**Context.** On a data page, that page's creation actions rank first (on Leads: New lead…, Import leads…). During setup, the first suggested action is the next setup step ("Continue setup: Add money…").

**Ranking.** Exact label > prefix > synonym > recent > fuzzy. For queries of three characters or fewer, destinations and actions rank above records. Each record group shows up to 5 rows plus "Show all 23 leads matching 'site'", which opens the destination with `?q=`.

### 8.4 Layout

```
Desktop and laptop (Dialog md 560, top 64, flat scrim)      Phone (full screen)
┌───────────────────────────────────────────────────┐     ┌──────────────────────────────┐
│ ⌕ site                                        ✕   │     │ ⌕ site                Cancel │
├───────────────────────────────────────────────────┤     ├──────────────────────────────┤
│ Flows                                             │     │ Flows                         │
│▌⚙ Site-visit qualifier · Live v7 · Draft, 3 chang │     │ Site-visit qualifier          │
│  ⚙ Site-visit reminder · Not live yet             │     │ Live v7 · Draft, 3 changes    │
│ Calls                                             │     │ …                             │
│  ▤ Today 10:42 am · 2:14 · Interested · Matched in│     │ (48 px rows, no footer hints, │
│    transcript                                     │     │  results above the keyboard)  │
│ Knowledge                                         │     │                              │
│  ▢ site-plan-brochure.pdf · Indexed               │     │                              │
│  Show all 7 results in Call reports               │     │                              │
├───────────────────────────────────────────────────┤     └──────────────────────────────┘
│ ↑ ↓ to move · Enter to open · Esc to close        │
└───────────────────────────────────────────────────┘
```

### 8.5 States

| State | Copy |
|---|---|
| Empty query | Recent · Go to · 4 suggested actions |
| Typing | Local groups filter instantly; records query after 300 ms; "Searching records…" with a small Spinner after 200 ms |
| No results | "No matches for 'xyz'." + "Search covers lead names and numbers, call transcripts, flows and files." |
| Record search failed | Local results remain; row "Couldn't search records. Retry" |
| Offline | Local results work; record groups read "Offline. Records can't be searched." |
| Permission | Admin-only items are hidden, except on an exact match, where they show disabled with "Admins only" |

### 8.6 Acceptance criteria: palette

- [ ] ⌘K and Ctrl+K open the palette from every route, including from inside a text field; Esc clears, then closes, and focus returns to where it was.
- [ ] Typing "DID" returns Phone setup first; "dashboard" returns Cockpit; "recharge" returns Top up….
- [ ] "call 4821" returns "Call Lead …" rows; Enter opens the Call gate, and no call request is sent before the gate's confirm (network assertion).
- [ ] No row renders an unmasked phone number; no search query text is sent to telemetry.
- [ ] Every destination label in the palette is identical to the sidebar's.

---

## 9. Workspace switcher, account menu, sign out and theme

Today neither rail state shows who you are or which organization you are in; Sign out is an unlabelled icon, and "Exit" is a primary phone tab (F-UX-029, F-RWD-001).

### 9.1 Workspace switcher (top of the sidebar; rail tile; NavSheet top)

Trigger: `WorkspaceTile` + workspace name (`translate="no"`) + "Workspace · Admin" (data-nav §1.2). Menu (Radix DropdownMenu, `e2`):

```
┌ Sample Realty ───────────────────────┐
│ Admin · Prepaid wallet                │  meta-12 text-3
├───────────────────────────────────────┤
│ Workspace settings                    │  → /settings/organization
│ Invite teammates…                     │  admins; members see "Ask an admin to invite"
│ Billing                               │  → /billing/wallet
├───────────────────────────────────────┤
│ Switch workspace                      │  label, only if you belong to 2 or more
│ ✓ Sample Realty            Admin      │
│   Demo Workspace           Member     │
│ Create workspace…                     │  only where self-serve creation is allowed
└───────────────────────────────────────┘
```

Switching is guarded by unsaved edits (`useUnsavedChangesGuard`), then goes to the new workspace's landing route with the toast "Switched to Demo Workspace." On phones the same choices are an action sheet from the More sheet's account block.

### 9.2 Account menu (bottom of the sidebar; rail avatar; NavSheet; More sheet)

```
┌ Anika R. ─────────────────────────────┐
│ Admin · Sample Realty                  │
├────────────────────────────────────────┤
│ Profile                                │ → /settings/profile
│ Theme                                  │ label
│   ◉ System   ○ Light   ○ Dark          │ radio items (menuitemradio)
│ Motion                                 │ label
│   ◉ Match system   ○ Reduce motion     │ radio items; sets data-motion="reduce"
│ Single-key shortcuts            [on]   │ menuitemcheckbox (F-A11Y-004)
│ Keyboard shortcuts                 ?   │ opens the ? sheet
│ Help and docs                        › │ submenu: Docs ↗ · Setup checklist · Service status ↗ · Contact support ↗ · What's new ↗
│ Back to website                     ↗  │ marketing home, new tab
├────────────────────────────────────────┤
│ Sign out…                              │ last, after a separator
└────────────────────────────────────────┘
```

`external-link` icons appear only on items that really leave the app and open a new tab (F-VIS-031, F-UX-027).

### 9.3 Sign out

`Sign out…` opens a `ConfirmDialog` (sm; a bottom sheet on phones). Focus starts on Cancel.

| Situation | Title | Body | Buttons |
|---|---|---|---|
| Normal | Sign out of Vaani Labs? | You'll be signed out on this device. Scheduled calls and batches keep running. | Cancel · **Sign out** |
| Unsaved or failed edits | same | 2 edits to "Site-visit qualifier" haven't saved yet. They'll be lost if you sign out now. | Cancel · Retry saving · **Sign out anyway** |
| Your browser call is live | same | Your call with Lead 1042 will end. | Cancel · **End call and sign out** |

After signing out: every tab goes to `/login?reason=signed-out` ("You're signed out."). "Sign out of all devices" lives in Settings › Security with the session list (F-UX-044). The phone "Exit" tab is removed.

### 9.4 Theme

- Choices: **System** (default), Light, Dark, as radio items in the account menu, a `SegmentedControl` row in the phone More sheet, and palette actions. The toggle whose icon and label disagreed ("DARK" beside a sun) is retired (F-VIS-032).
- Stored in `localStorage['vaani:theme']` (migrating `vv:theme` once) and optionally as a user preference; applied by the pre-paint script as `data-theme`, with `<meta name="theme-color">` set to `--bg` (foundations §15.3).
- **A theme change never writes a flow or any record** (today toggling fires `PUT /api/flows/{id}`, DESIGN-SYSTEM-08).
- **Motion** sits directly below Theme, with the same pattern: **Match system** (default) · **Reduce motion**, radio items in the account menu, a `SegmentedControl` row in the phone More sheet, and a palette action. It is stored in `localStorage['vaani:motion']` and optionally as a user preference, and the same pre-paint script applies it as `data-motion="reduce"` on `<html>`. The rail overlay, NavSheet and MoreSheet then fade instead of sliding, and the live dot holds still (06-accessibility §14.3, foundations §15.3).

### 9.5 Acceptance criteria: menus

- [ ] The sidebar shows the workspace name and your role at every width ≥1280; the rail tile's name includes both.
- [ ] Sign out is reachable in at most two interactions from any page at every breakpoint, and always asks for confirmation.
- [ ] Changing theme sends no network request (verified with the network log). Changing Motion writes no flow or record.
- [ ] With Motion: Reduce motion on a machine whose OS allows motion, a hard reload paints with `data-motion="reduce"` already on `<html>`, and opening the NavSheet changes no computed `transform`.
- [ ] With single-key shortcuts off, `?`, `[`, J, K, C and the Flow Designer's letters do nothing; ⌘K still works.

---

## 10. Keyboard shortcuts and the `?` sheet

The `?` sheet is a `Dialog` lg (overlay §19), a real dialog with focus management (F-A11Y-027). At the top: the **Single-key shortcuts** switch, with the note "Turn off if you use speech input or a switch device." Sections:

| Section | Keys |
|---|---|
| Everywhere | ⌘K Search or jump · `?` This sheet · `[` Collapse sidebar · F6 Next region · F8 Go to notifications · Esc Close · ⌘Z Undo |
| Lists and tables | `/` Search this page · J / K Next and previous · X Select · Enter Open · **C Call… (opens the Call gate; start with ⌘Enter)** · ⇧D Compact density |
| Records and sheets | J / K with a sheet open moves the sheet · Shift+F10 Row menu |
| Flow Designer | A Add step · C Connect to… · M Move · O Outline · V Variables · ⌘F Find · Alt+. / Alt+, Next and previous issue · Alt+Arrow Move selection · Delete (with Undo). The full canvas map is `06-accessibility` §9.6; the sheet is generated from the registry |
| Forms | ⌘S Save · ⌘Enter Submit from a text area |

Single-key entries carry a "single key" mark so users see what the switch turns off. No shortcut ever dials, bills, publishes or deletes without its gate (P3). Phones do not show keycaps anywhere (F-UX-048); the sheet remains reachable from Help for external keyboards.

---

## 11. Notifications

### 11.1 Routing (v1)

v1 has no bell (D5). Every event has exactly one primary surface, chosen by whether the user must act and whether they are looking.

| Event | Primary surface | Also | Email / WhatsApp (per Settings › Notifications) |
|---|---|---|---|
| Your call changes state | Cockpit call card; Baseline "You" segment; title "On call" | announce | no |
| Batch scheduled, progressing, finished | Cockpit › Up next; Baseline Activity segment | toast when finished if you are elsewhere: "Batch finished · 18 of 20 connected · View" | optional |
| Lead import done or failed | progress toast → success or error toast | Leads meta "Last import: 1,212 · 28 skipped" | no |
| Knowledge file indexed or failed | Knowledge status column | toast if you uploaded it | no |
| Flow published (by you) | publish toast "v8 is live on 1 number and 1 batch · Roll back to v7…" | Flows badge clears | no |
| Flow published by a teammate | Flows list "Published by a teammate · 10:02 am" | (v1.1 inbox) | optional |
| Save failed | SaveState chip, error toast | title prefix | no |
| Wallet low, empty; autopay failed | Baseline or chip; Billing badge; WalletNotice on spending pages | announce once | **yes** (default on for admins) |
| Payment confirmed | success toast | Baseline updates | receipt email |
| Callbacks due | Leads badge "18 due" and the Callbacks due view | none | optional daily digest |
| Number verification changed | Settings badge "Verify"; setup step | toast if you are on Phone setup | yes |
| Proposals to review (admins) | Knowledge badge "3 to review" | none | optional |
| Personal-agent task needs your confirmation | Personal agents badge "1 to confirm" | toast if you are elsewhere | **yes** (these block the task) |
| Assistant plan awaiting approval | inside the Assistant thread only | none | no |
| Calling incident or maintenance | notice on spending pages; Baseline line segment | toast on resolution | admins |
| Offline, session expired | ConnectionBar; SessionExpired dialog | none | no |

**Rules.** No red bubbles and no counts for passive events (new reports, new leads). A toast is only for an effect that is off-screen; nothing important lives only in a toast: each one has a durable home in the table above. The Notifications settings page lists these events with Email and WhatsApp switches and a verified WhatsApp number field; today it points to a field that does not exist (F-UX-041).

### 11.2 v1.1: Activity inbox

When teammates' events and finished jobs need a durable list, add the **ActivityInbox** (specified in part 6): an `inbox` IconButton to the right of the JumpButton (rail: under the search button; tablet and phone: in the TopBar before search), a neutral CountBadge that counts **only items that need you** (confirm a task, review proposals, fix autopay), and a 400 px popover listing the last 30 days. Until it ships, nothing in the shell reserves space for it.

### 11.3 Acceptance criteria: notifications

- [ ] Each row of 11.1 has a test that fires the event and asserts its primary surface; no event is shown only in a toast.
- [ ] No nav badge or count ever renders "0" or a red fill.
- [ ] Error and undo toasts persist until dismissed; informational toasts last 6 s and pause on hover and focus.

---

## 12. First run

### 12.1 From "Get started" to the first customer call

| # | Step | Surface | Owner | What changes (finding) |
|---|---|---|---|---|
| 1 | "Get started" / "Start free" on the site | marketing | public-site spec | Every CTA points at `/signup`, which renders "Create account" with its own H1 (F-QA-010) |
| 2 | Create account | `/signup` (bare) | auth spec | Separate from `/login`; `next` and UTM parameters survive OAuth |
| 3 | **Create your workspace** | `/signup/workspace` (bare) | this spec (§12.2) | The organization and team exist from the first minute, with you as Admin, so invites and integrations never dead-end (F-UX-001) |
| 4 | Pending approval, only if access stays approval-gated | `/signup/pending` (bare) | this spec (§12.2) | A real waiting state instead of an unexplained one (funnel stage 5) |
| 5 | Land on **Home** | `/home` | this spec (§13) | Replaces the `/onboarding` wizard that said "You're live" at ₹0 and was never linked again (F-UX-006, F-RWD-019) |
| 6 | Five checks, in any order | Home, Knowledge, Flows, Phone setup, Top-up sheet, Call gate, Leads | page specs; the track here | Each step deep-links to where it is done; blocked steps say what is missing |
| 7 | First customer call | Leads → Call gate | Leads spec | "Live" appears only now |

**No product tour, no coach marks, no confetti.** The setup track is the orientation, and the grouped, labelled sidebar explains the rest (P7; overlay §17).

### 12.2 Create your workspace (and pending approval)

```
┌──────────────── 400 (bare shell) ────────────────┐
│ [V]                                               │
│ Create your workspace                    title-24 │
│ Teammates, numbers and billing live here.         │
│                                                   │
│ Workspace name                                    │
│ [ Sample Realty                               ]   │
│ Workspace address                                 │
│ [ sample-realty          ].vaanilabs.in           │
│ ✓ Available · you can change it twice later       │
│ What should your agent do first? (optional)       │
│ ( ) Qualify new leads     ( ) Remind customers    │
│ ( ) Answer inbound calls  ( ) Something else      │
│                                                   │
│ [            Create workspace            ]        │
│ You'll be the admin. You can invite teammates     │
│ from Home or Settings.                            │
└───────────────────────────────────────────────────┘
```

- Fields: `Field` + `TextInput` (name, required, 2–60 characters); address with a live availability check after 300 ms ("✓ Available" / "Taken. Try sample-realty-2"), prefilled from the name; the goal as `RadioCard`s, used only to pre-select a template on Home. Primary `Button` size lg.
- Errors: "Enter a workspace name." · "Use letters, numbers and hyphens." · "Couldn't create the workspace. Your details are kept. Retry".
- **Pending approval** (only if the business keeps approval-gated access; part 6 open question): V mark, title-24 "We're reviewing your request", body "We'll email you at the address you signed up with. Most requests are reviewed within one working day." (only if that is the real SLA), links "Talk to us" and "Sign out". No app shell until approved.

### 12.3 Invited teammates

Accepting an invite (auth spec) sets name and password, then goes to the landing route (§2.5): Home while the workspace's setup is incomplete, else Cockpit. Setup is **per workspace**, not per person: teammates see the same track and card, with admin-only steps marked (§13.4).

---

## 13. Home: "Get your first call live"

**Job:** get this workspace from signed-up to its first customer call with no dead ends and no false "live" (F-UX-001, F-UX-006; direction §6.1, §6.6). It is the page variant of the gate (`SetupTrack`, `spec/02-components-gate.md` §5.3): a checklist computed on the server, one action per step. This section configures its steps and copy.

### 13.1 Hierarchy

1. The **current step** row: accent-soft fill, current mark, its one primary button.
2. The display heading "Get your first call live" and the progress "2 of 5 done".
3. Done rows (a check and one line of proof) and later rows (quiet).
4. The aside (workspace, teammates, help) and the optional knowledge row.

### 13.2 Layout

**Desktop ≥1280** (container `--size-container-page`; main column 720, aside 320, gap `--space-40`)

```
┌ Sidebar ─────────┬ Home   2 of 5 done                                        Invite teammates… ┐
│ Operate          ├───────────────────────────────────────────────────────────────────────────────┤
│  ▣ Home          │  Get your first call live                          ┌ Your workspace ───────┐ │
│    Cockpit       │  Callers hear your agent only after every          │ Sample Realty · Admin │ │
│    …             │  required check passes. Do them in any order.      │ Teammates  1          │ │
│ (no setup card   │  ▬▬▬▬▬▬▬▬▬▬▭▭▭▭▭▭▭▭▭▭▭▭  2 of 5 done                 │ Invite teammates…     │ │
│  on this page)   │ ┌───────────────────────────────────────────────┐  │ Help                  │ │
│                  │ │ ✓ Teach your agent  Optional                  │  │ Setup guide ↗         │ │
│                  │ │   Indexed · 2 files · 84 passages      Change │  │ Talk to us ↗          │ │
│                  │ │ ✓ Publish a flow                              │  └───────────────────────┘ │
│                  │ │   Site-visit qualifier v1 is published   Open │                            │
│                  │ │ ✓ Verify your calling number                  │                            │
│                  │ │   +91 80 •••• 2210 · Verified            Open │                            │
│                  │ │▌◉ Add money                    (accent-soft)  │                            │
│                  │ │   Calls are prepaid from your wallet. ₹500    │                            │
│                  │ │   covers about 3 h 28 min at your rate.       │                            │
│                  │ │   [Top up…]                                   │                            │
│                  │ │ ⊘ Call yourself                               │                            │
│                  │ │   Needs money in the wallet.                  │                            │
│                  │ │ ○ Add people to call                          │                            │
│                  │ │   Import leads or connect inbound calls.      │                            │
│                  │ │   [Import leads…]  Connect inbound            │                            │
│                  │ └───────────────────────────────────────────────┘                            │
│ (AR) Anika R.    ├───────────────────────────────────────────────────────────────────────────────┤
└──────────────────┴ Live v1 · Site-visit qualifier │ Inbound · Ready │ ⚠ Wallet ₹0 · calls paused · Top up ┘
```

**Laptop-S 1024–1279:** one 720 column; the aside becomes a row of three KeyValue items under the track. **Tablet:** one column at full width minus 24 px margins; the H1 is in the TopBar; action buttons keep their labels. **Phone:**

```
┌ Home                    [₹0 · Top up] ⌕ ┐
│ Get your first call live      (32/40)   │
│ Do these in any order.                   │
│ ▬▬▬▬▬▭▭▭▭▭  2 of 5 done                  │
│ ✓ Teach your agent · Optional            │
│ ✓ Publish a flow                         │
│ ✓ Verify your calling number             │
│▌◉ Add money                              │
│   Calls are prepaid from your wallet.    │
│   [          Top up…           ] 44 px   │
│ ⊘ Call yourself                          │
│   Needs money in the wallet.             │
│ ○ Add people to call                     │
│   [       Import leads…        ]         │
├──────────────────────────────────────────┤
│ Cockpit  Leads  Call reports  Flows  More│  (More is current)
└──────────────────────────────────────────┘
```

On phones done rows collapse to their title (tap to expand), and every action button is full width at 44 px.

### 13.3 The steps

The count ("n of 5") includes only the five required steps. The **current** step is the first required step, in order, that is neither done nor waiting on someone else; it is the only one with a primary button. Other open steps show secondary buttons.

| # | Row | Why (body) | Action | Done when (server) | Done line |
|---|---|---|---|---|---|
| – | **Teach your agent** · `Tag` "Optional" | Upload a price sheet, brochure or FAQ so the agent can quote it on calls. Skip this if your calls don't need facts. | Upload files (secondary) → `/knowledge?upload=1` | at least one file indexed | Indexed · 2 files · 84 passages |
| 1 | **Publish a flow** | Pick a template and adjust it. Callers hear it only after you publish. | Choose a template… → `/flows/new` (pre-selected from the workspace goal, among templates whose needs this workspace meets; Flow Designer part 2 §15.3) | a flow has a Live revision (interim I1: a publish recorded through the Publish gate) | Site-visit qualifier v1 is published (never "live" before all five pass, §5.5) |
| 2 | **Verify your calling number** | Customers see this number when you call, and inbound calls reach your agent through it. | Verify number… → `/settings/phone` | the number completed Owned → Compliance → Authorized | +91 80 •••• 2210 · Verified |
| 3 | **Add money** | Calls are prepaid from your wallet. ₹500 covers about 3 h 28 min at your rate. | Top up… (Top-up sheet in place) | a confirmed top-up and a balance above one minimum call | ₹500 added · about 3 h 28 min of calls |
| 4 | **Call yourself** | Hear the flow on your own phone before customers do. About 2 minutes, about ₹5. | Call my number… (the **Call gate** aimed at your verified mobile) · link "Talk in browser instead" | a call on the live flow to your own number was answered | Connected · 1 min 52 s · Today 11:02 am · Listen |
| 5 | **Add people to call** | Import a list of leads, or send inbound calls on your number to this flow. | Import leads… · Connect inbound → `/settings/phone#inbound` | at least one lead, or the inbound number routed to a live flow | 24 leads imported / Inbound calls answer with Site-visit qualifier |

The "about" numbers come from the real rate and median call length; until those exist, the body says "Rate ₹0.04/s" instead (direction §8). "Talk in browser instead" carries the note "This doesn't test your phone line, so it doesn't complete this step."

### 13.4 Row states

The track is `SetupTrack` (`spec/02-components-gate.md` §5.3): each step's kind, its 20 px mark, the row treatment, the hidden state word and the "current step" rule are specified there. Home's copy for each state:

| State (G §5.3) | Copy examples |
|---|---|
| To do | as in 13.3 |
| Current | as in 13.3, with its one primary button |
| In progress | "Indexing 1 file… 60%" · "Step 2 of 3 · documents under review" · "Payment pending · updates when UPI confirms" · "Calling +91 98 •••• 1234… · Open in Cockpit" |
| Blocked by another step | "Needs money in the wallet." · "Needs a live flow and a verified number." |
| Needs an admin | "Only admins can verify numbers. Ask an admin (2 in this workspace)." + "Copy request link" |
| Failed | "Didn't connect · No answer · Try again" · "Documents weren't accepted · See why" · "Couldn't index price-sheet.pdf · Retry" |
| Done | as in 13.3 |

A step waiting on someone else (documents under review, payment pending) is not current; the current mark moves to the next actionable step, so the user always has something to do.

### 13.5 Completion

- When the fifth check passes, the progress header is replaced by: title-24 **"Your workspace is live."**, body "Callers on +91 80 •••• 2210 hear Site-visit qualifier v1.", primary **Call your first leads…** (Leads, New view, then the Call gate) and secondary "Go to Cockpit". A success toast says "Setup complete. Your workspace is live." This is the first and only place the product says "live" about the workspace (F-UX-006).
- The server sets `setup.completedAt` only now. On the next route change Home leaves the nav, the setup card disappears and the landing route becomes Cockpit.
- **After completion** `/home` stays reachable from Help › Setup checklist and ⌘K. It shows the five checks with their **current** state; a regression (the number lost verification) shows amber there, while the Baseline and notices carry it everywhere else. Setup never reopens.

### 13.6 Page states

| State | Treatment |
|---|---|
| Loading | Header renders; the track shows six skeleton rows (mark block, a 30% title bar and a 60% body bar); no step is shown as done or current until the server answers |
| Setup state failed | `SectionError`: "Couldn't load your setup. Retry". Nothing is shown as done |
| Offline | Last known states with "as of 11:42 am"; actions `aria-disabled` with "You're offline" |
| Member | Admin-only steps use the "needs an admin" state; everything else works (knowledge, flows, leads, call yourself) |
| Partial | Normal: any mix of the states above |

### 13.7 Microcopy

| Before (today) | After |
|---|---|
| "§ STEP 5 OF 5" · "You're *live.*" · "FIRST RUN COMPLETE" | "2 of 5 done" · "Get your first call live"; "Your workspace is live." only after all five pass |
| PROFILE · SUBDOMAIN · FLOW · TEST CALL · DONE | Teach your agent (optional) · Publish a flow · Verify your calling number · Add money · Call yourself · Add people to call |
| "Below are the three doors you'll open most." | removed; the sidebar is labelled |
| "Go to dashboard" | "Go to Cockpit" |

### 13.8 Accessibility

The track is an `<ol>` with `aria-label="Setup steps, 2 of 5 done"`; each row is an `<li>` whose state is in words ("Done", "Current step", "Blocked: needs money in the wallet"), never only a mark. The progress is a `progressbar` with `aria-valuetext="2 of 5 done"`. When a step completes while the page is open, the polite region announces it once ("Add money: done. 3 of 5.").

### 13.9 Analytics

`setup_viewed {doneCount}` · `setup_step_started {step, source: home | card | palette | baseline}` · `setup_step_completed {step, msSinceSignup}` · `setup_blocked_viewed {step, missing[]}` · `setup_completed {msSinceSignup}` · `first_customer_call {msSinceSetupCompleted}` · `workspace_created {goal}`. No lead data, numbers or names in any payload.

### 13.10 Acceptance criteria: first run and Home

- [ ] A new sign-up reaches an enabled Invite teammates action and an enabled Connect button on Integrations without contacting anyone (F-UX-001).
- [ ] The strings "You're live" and "Your workspace is live" never render unless the server reports all five checks passed; `completedAt` is null until then (F-UX-006).
- [ ] Every step's action lands on a page where that step can be finished; no step links to Profile or to a page that lacks the control.
- [ ] Home has exactly one filled Neel button, on the current step.
- [ ] Reload and a second browser show identical step states (server-computed, not local).
- [ ] The setup card appears in the sidebar (≥1280), the rail overlay (1024–1279), the NavSheet (tablet) and the MoreSheet (phone) while setup is incomplete, and nowhere after it completes.
- [ ] "Call yourself" goes through the Call gate; no call request fires before the gate is confirmed.
- [ ] `/onboarding` redirects to `/home`; no page scrolls sideways at 1440 (F-RWD-019).

---

## 14. SetupCard (sidebar, rail overlay, NavSheet, MoreSheet)

`SetupCard` from data-nav §1.2, configured as follows.

| Situation | Content |
|---|---|
| Normal | "Finish setup" · "2 of 5" · progress bar · "Next: add money" |
| Next step waiting on someone else | "Next: call yourself" (the current step moves on; §13.4) |
| Member with only admin steps left | "Finish setup" · "3 of 5" · "Waiting on an admin" |
| Short viewport (≤800 tall, fine pointer) | one 32 px row: "Finish setup · 2 of 5" + a 40 px bar (44 px on a coarse pointer, data-nav §1.2) |
| On `/home` | hidden (the page is the card) |
| Setup complete | removed everywhere |

The whole card is one link to `/home` with the name "Finish setup, 2 of 5 done. Next: add money". In the 1024–1279 rail, an 8 px `--accent-mark` dot sits on the expand button while setup is incomplete. The card cannot be dismissed: it states a fact, and it disappears when the fact changes.

---

## 15. Not found, no access and error pages

Today an unknown route shows an off-shell page reading "404 SIGNAL LOST … STATUS: DISCONNECTED" whose only exit, "Return Home", goes to the marketing site; a gated route silently redirects to the live-call Cockpit; failures show raw SDK text or nothing (F-QA-017, F-QA-039, F-UX-029, F-QA-018, F-UX-034, F-UX-019). All of these become plain sentences **inside the shell**, built on `NotFound`, `Forbidden`, `PageError`, `SectionError` and `SessionExpired` (overlay §16).

### 15.1 Page matrix

| Case | Component | HTTP | `<title>` | Title (title-16) | Body (body-14, text-2) | Actions |
|---|---|---|---|---|---|---|
| Unknown app route, signed in | `NotFound` in the shell | 404, `noindex` | Page not found · Vaani Labs | This page doesn't exist. | The link may be old, or the page was moved. | **Go to Cockpit** (the landing route: "Go to Home" during setup) · Search (opens ⌘K) |
| Record link to a deleted or unknown record | `NotFound` in the destination (its H1 stays, e.g. "Leads") | 404 | Not found · Leads · Vaani Labs | This lead was deleted, or the link is wrong. | Deleted leads can't be restored after 7 days. (only if true) | **Go to Leads** · Search |
| Unknown route, signed out | marketing-shell 404 (public spec) | 404 | Page not found · Vaani Labs | Page not found | The link may be old. | Home · Docs · Pricing · Contact |
| Role can't use the route | `Forbidden` in the shell; no redirect | 403 | No access · Knowledge · Vaani Labs | Only organization admins can review proposals. | Ask an admin (2 in this workspace) to change your role or review them for you. | **Copy request link** (or Request access when that endpoint exists) · Go back |
| The route's data failed | `PageError` (route `error.tsx`) | 200 shell | Couldn't load · Call reports · Vaani Labs | Call reports couldn't load. | Your calls are safe. This is a problem on our side or with your connection. | **Retry** · Go to Cockpit · Details (error id) |
| One region failed | `SectionError` | – | unchanged | – | "Couldn't refresh · Retry · Updated 4:42 pm" with last good data, or "Couldn't load intents. Retry" | Retry |
| The shell itself can't render | Global error page (bare) | 500 | Vaani Labs couldn't load | Vaani Labs couldn't load. | Your data is safe. Check your connection and try again. | **Try again** · Service status ↗ · error id |
| 401 on a background request | `SessionExpired` dialog | – | unchanged | Your session expired. | Sign in again to keep working. Edits on this page stay on this device. | **Sign in** → `/login?next=<path>&reason=expired` |

Rules: the H1 on an error page inside the shell is the destination's label (or "Page not found" for unknown routes), so the page stays identified; focus moves to the H1 on entry; Details (collapsed) holds the raw message and the error id in `mono-12` with Copy; nothing says "not charged" or "safe" unless the server confirms it (overlay §16.2). Legacy routes never reach these pages: they redirect (§2.4).

### 15.2 Layout

```
Desktop (in the shell)                                              Phone
┌ Sidebar ─┬ Page not found ─────────────────────────────────────┐  ┌ Page not found        ⌕ ┐
│ …        │                                                      │  │                          │
│          │                        ⌕                             │  │          ⌕               │
│          │               This page doesn't exist.               │  │ This page doesn't exist. │
│          │        The link may be old, or the page was moved.   │  │ The link may be old, or  │
│          │            [Go to Cockpit]    Search                 │  │ the page was moved.      │
│          │                                                      │  │ [    Go to Cockpit     ] │
│          ├──────────────────────────────────────────────────────┤  │ [       Search         ] │
│          │ Baseline                                             │  ├──────────────────────────┤
└──────────┴──────────────────────────────────────────────────────┘  │ Cockpit Leads … More     │
                                                                     └──────────────────────────┘
```

EmptyState anatomy (overlay §15.2): a 20 px `search-x` (not found) or `lock` (forbidden) or `circle-alert` in `--danger-text` (page error) icon, no tile, no illustration, centred with 48 px top padding. No sci-fi copy, no build numbers.

### 15.3 Acceptance criteria: errors

- [ ] `/leads/xyz` and `/anything` render inside the shell with a 404 status and the title "Page not found · Vaani Labs"; the primary action goes to the landing route, never to `/` (F-UX-029).
- [ ] A member opening `/knowledge/proposals` sees `Forbidden` at that URL; the URL never changes to the Cockpit (F-QA-018).
- [ ] With `GET /api/call-reports` returning 500, the page shows `PageError` with Retry, the shell stays, and Retry refetches without a reload.
- [ ] No error surface shows raw SDK or LLM strings outside Details (F-UX-019).
- [ ] The Settings › Docs links that 404 today point at real pages or are removed (F-QA-017).

---

## 16. Loading

- **Shell first:** navigation, PageHeader (H1 from `lib/nav.ts`), view tabs, toolbar and Baseline render from the layout; only data regions wait (overlay §13.1). Budgets on 4G: shell ≤ 1 s, H1 ≤ 2.5 s; tracked as RUM `time_to_shell` and `time_to_h1` (F-QA-007).
- **Skeleton per destination** (overlay §13.2): table (Leads, Call reports, Knowledge, Invoices) · list items (phones) · KPI tiles (Analytics, Billing) · transcript (Cockpit, call sheet) · canvas (Flow Designer; editing off until hydrated, F-FLOW-037) · form (Settings) · setup rows (Home). Static fill, after 200 ms, at least 400 ms once shown, never shimmer.
- **Never** a full-screen spinner after the first paint, and never "0" as a loading value (F-UX-030).
- Prefetch: nav links prefetch on hover and focus only; the 24 RSC payloads prefetched on every load today go away (F-QA-007).

---

## 17. Microcopy: before → after (shell-wide)

| Where | Before | After |
|---|---|---|
| Nav, H1, mobile tab | Agent View · AGENT COCKPIT · Agent · Dashboard | Cockpit |
| Nav, H1 | Meet Agent · Meeting Agent — Vikash | Meetings |
| Nav, H1 | Flow Builder | Flows |
| H1 | AGENT KNOWLEDGE · LEADS · BILLING · SETTINGS | Knowledge · Leads · Billing · Settings (sentence case) |
| Mobile tab | Reports | Call reports |
| Sign out | Sign Out (icon, `title` only) · Exit (phone tab) | Sign out… (account menu and More sheet, confirmed) |
| Rail footer | SYS: ONLINE · 12ms · RGN: Mumbai-1 | removed (§7) |
| Rail footer | DARK (beside a sun icon) · Collapse [ | Theme: System · Light · Dark (account menu) · "Collapse sidebar" with `[` in its tooltip |
| Wallet banner | Wallet empty — top up now to keep calls flowing. · Enable autopay | Wallet is ₹0. Phone calls are paused. Browser tests and free meeting minutes still work. · Top up · Turn on autopay |
| Onboarding | You're *live.* · FIRST RUN COMPLETE | Finish setup · 2 of 5 · Next: add money; "Your workspace is live." only when true |
| 404 | 404 SIGNAL LOST · ERR: 0x404 • NODE: MUMBAI-1 • STATUS: DISCONNECTED · Return Home | This page doesn't exist. · Go to Cockpit · Search |
| Login footer | Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled | Privacy · Terms · Security (F-QA-039) |
| `<title>` | Vaani Labs - The Voice AI that speaks India (every route) | Leads · Vaani Labs (per route, §4.4) |
| Loading | Loading… (full screen) | nothing visible but skeletons; SR: "Loading leads…" |
| Brand | Vani Voice · VaaniVoice | Vaani Labs; "Vaani" is the agent (F-UX-043) |
| Separators | em-dashes in chrome | " · " or a full stop (F-UX-043) |

---

## 18. Telemetry hooks

| Event | Properties | Question it answers |
|---|---|---|
| `nav_navigate` | `to` (nav id), `surface` (sidebar, rail, rail-overlay, navsheet, bottombar, more, palette, baseline, card) | Do phones use More? Which destinations are reached through the palette? |
| `palette_open` | `trigger` (keys, jump, baseline, topbar) | Is ⌘K discovered? |
| `palette_select` | `group`, `rank`, `queryLength` (never the query text) | Are results ranked well? |
| `palette_no_results` | `queryLength` | Missing synonyms |
| `topup_open` | `source` (baseline, chip, notice, badge, palette, setup, billing) | Which wallet signal works? |
| `wallet_notice_dismiss` | `state` | Is the notice nagging? |
| `setup_*` | see §13.9 | Where does first run stall? |
| `signout_confirm` / `signout_cancel` | `variant` (normal, unsaved, on-call) | Is the confirm step annoying or saving work? |
| `theme_change`, `shortcuts_toggle`, `sidebar_collapse` | value | Preference adoption |
| `not_found_view`, `forbidden_view`, `page_error_view` | route template, error class | Broken links and permission confusion |
| `session_expired`, `offline_start` / `offline_end` | duration | Reliability as users feel it |
| RUM `time_to_shell`, `time_to_h1` | route template | The F-QA-007 budgets |

**Privacy:** payloads carry route templates (`/leads`), never URLs with ids, `document.title`, query text, names or phone numbers. Session replay and autocapture stay off (or fully masked) on routes that show lead data: Cockpit, Leads, Call reports, Meetings, Rep console (F-UX-045). Analytics loads only after consent (F-QA-033).

---

## 19. New components needed

Not defined in `02-components-*`; this spec defines them. Build them after `AppShell` (data-nav §0.8, step 2).

| Component | Defined in | Built on | Props sketch |
|---|---|---|---|
| **Baseline** (`variant="band"`) | part 3 §5 | tokens only; `LiveDot`, Tooltip | `segments: BaselineSegment[]`; `onSearch()`; `onShortcuts()`; `state: 'ready' \| 'loading' \| 'error'`; `asOf?: Date` |
| **BaselineChip** | part 3 §5.4 | Popover + BaselineList | `segments`; picks the top segment by severity |
| **BaselineList** (`variant="list"`) | part 3 §5.4 | 44 px rows | `segments` |
| **SetupTrack** + **SetupStep** | `spec/02-components-gate.md` §5.3 (component); part 5 §13 (steps and copy) | `StageProgress` marks, Button, Tag, StatusText, ProgressBar | `steps: { id, title, body, optional?, state: 'todo'\|'current'\|'progress'\|'blocked'\|'needs-admin'\|'failed'\|'done', proof?, action?, secondary?, missing?: {label, href}[] }[]`; `doneCount`, `total` |
| **ActivityInbox** (v1.1) | below | IconButton, Popover, CountBadge, Timeline rows | `items`, `needsYouCount`, `onMarkAllRead()` |

`BaselineSegment = { id: 'flow' | 'line' | 'wallet' | 'activity' | 'you'; tone: 'normal' | 'warn' | 'live'; text: string; short?: string; href: string; action?: { label: string; href?: string; onClick?(): void }; srText: string }`.

**ActivityInbox (v1.1).** Trigger: `inbox` IconButton (32; 44 on touch) beside the JumpButton, rail under search, TopBar before search. The neutral CountBadge counts only items that need you; no red, and no count for informational items. Popover 400 wide (`--size-popover-gate`), max-height 70dvh, grouped by day with `TimelineItem` rows (icon, sentence, time, one action). Items: task needs confirmation · proposals to review · autopay failed · batch finished · import finished · export ready · a teammate published a flow. Opening marks informational items read; "needs you" items clear only when the underlying state clears. Keyboard: palette action "Open activity"; Esc closes; focus returns to the trigger. Phone: full-screen sheet.

**Contract extensions (not new components):**
- `NavEntry.visible?(state)` and `NavEntry.keywords?: string[]` in `lib/nav.ts` (part 1 §2.6).
- `useWorkspaceState()`: the one client source for badges, Baseline, chips, WalletNotice, the setup card and Home, backed by `GET /api/workspace/state` (cached 60 s; pushed when a live channel exists). Nothing in the shell fetches the wallet on its own (today the Cockpit fetches it four times, F-QA-007).
- `openTopUp({ source })` and the app-wide `?topup=1` handler that mounts `TopUpSheet` (content in the Billing spec).
- `ServiceNotice` is a preset of `Notice` (warning or info, page scope, spending pages only), not a new component.
- **Icon assignments** to add to foundations §12: `house` (Home) and `inbox` (Activity, v1.1).
- `lib/baseline-copy.ts`: the part 3 §5.2 strings as functions of workspace state, shared by Baseline, BaselineChip, BaselineList and the TopBar wallet chip. Reference-mock equivalent: `spec/components/shell-partials.js` + `.css` (Baseline, BaselineList, TopBar, BottomBar).
- **Tokens:** none new. The aside on Home uses `--size-inspector` (320) as its width; chips use `--size-chip`.

---

## 20. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-UX-001 org setup dead end | critical | §12.1–12.2 workspace created with you as Admin; §13 |
| F-UX-002, F-QA-004 Top up opens Profile | high | §2.4 hash redirects; §6.4 in-place Top-up sheet |
| F-UX-006 "You're live" at ₹0 | high | §13.3–13.5; §5.5 |
| F-UX-007, F-RWD-005, F-VIS-015 rail clipping, stray scrollbar | high | §3.4 short mode, portal tooltips, landscape rule |
| F-UX-008, F-RWD-001 phone nav reaches 6 of 12 | high | §3.4 bottom bar + More; zoom rule |
| F-QA-007, F-UX-030 no shell while loading, false zeros | high / medium | §3.7, §16 |
| F-QA-010 `/signup` lands on sign-in | high | §2.4, §12.1 |
| F-UX-017 names drift | medium | §2.2, §2.6, §4.4, §17 |
| F-UX-018 fake SYS: ONLINE | medium | §7 |
| F-UX-019 silent and raw failures | medium | §15, §7.2 |
| F-UX-027 Settings navigation | medium | §2.3–2.4 flat routes, groups, redirects |
| F-UX-028, F-RWD-013, F-QA-036, F-A11Y-015 wallet banner | medium | §6 |
| F-UX-029 no identity, unguarded sign out, logo to marketing, off-shell 404 | medium | §9, §2.5, §15 |
| F-UX-031, F-QA-016 state not in the URL | medium | §2.3 |
| F-UX-034, F-QA-018 proposals redirect to Cockpit | medium | §15.1 Forbidden |
| F-UX-041 Notifications points at a missing field | medium | §11.1 |
| F-UX-015 DID naming | medium | §8.3 synonyms; `/settings/phone` |
| F-UX-043 brand spellings, em-dashes | medium | §17 |
| F-UX-045 session replay on PII pages | medium | §18 |
| F-UX-048 desktop hints on phones | medium | §3.4, §10 |
| F-A11Y-004 single-key call, no off switch | high | §9.2 switch, §8.3 verb rows open the gate, §10 |
| F-A11Y-012 no skip link, two stops per item | medium | §3.1, §3.9 |
| F-A11Y-013 identical titles, silent route changes | medium | §4.4, §3.7 |
| F-A11Y-017 nav semantics | medium | §3.1, §3.9 |
| F-A11Y-023 small targets | medium | §3.9 |
| F-VIS-005, F-VIS-010 13 H1 treatments | medium | §4 |
| F-VIS-032 theme toggle, "Collapse [" glyph | low | §9.4, §17 |
| F-VIS-033 tablet sidebar pushes content | medium | §3.4 NavSheet |
| F-QA-017, F-QA-039 off-shell 404, sci-fi copy, login footer | medium / low | §15, §17 |
| F-RWD-019 onboarding not findable, sideways scroll | low | §2.4, §13.5 Help › Setup checklist |
| F-FLOW-022, F-FLOW-034 canvas space, banner in builder | medium / low | §3.2 focus mode |

---

## 21. Open questions for the product owner

1. **Roles.** Which roles exist beyond Admin and Member, who sees Rep console, and can members top up the wallet? The spec hides what a role can't use and shows "Ask an admin" where a member can't act.
2. **Approval-gated access.** Is sign-up still approved by hand? If not, `/signup/pending` is dropped. If yes, what is the real review time to quote?
3. **Low-wallet threshold.** Proposed: runway under 60 minutes at the workspace's median rate, editable in Billing › Autopay (overlay §21).
4. **Status source.** Which service publishes incidents for "Calling" and "Payments" (the public `/status` page's backend), and can the app read it server-side?
5. **Verification time.** Can we quote how long number verification takes ("usually 1 working day")? If not, the in-progress copy omits it.
6. **Home after setup.** Is "Home" worth keeping as an overview page later (today's calls, live flows), or should `/home` stay a setup checklist only?
7. **Activity inbox.** Confirm it is v1.1 and that email and WhatsApp alerts cover v1 (wallet, autopay, tasks to confirm).
8. **Marketing for signed-in users.** Keep `/` public with an "Open app" link (this spec's assumption), or redirect signed-in visitors to the landing route?
