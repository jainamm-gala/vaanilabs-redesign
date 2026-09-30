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
