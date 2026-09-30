<!-- Assembled from 06-settings.part1.md, 06-settings.part2.md, 06-settings.part3.md, 06-settings.part4.md, 06-settings.part5.md, 06-settings.part6.md, 06-settings.part7.md, 06-settings.part8.md, 06-settings.part9.md, 06-settings.part10.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 03-pages · 06 · Settings

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** settings (`/settings` and every `/settings/<page>`)
**Follows:** `spec/00-design-direction.md` (Sutradhar, cited *D §n*, especially §6.6 Settings, P1, P3, P5), `spec/01-foundations.md` + `spec/tokens/tokens.css` (*F §n*), and the component specs `02-components-core.md` (*C §n*), `02-components-data-nav.md` (*N §n*), `02-components-overlay-feedback.md` (*O §n*). The shell, routes and redirects come from `03-pages/00-app-shell-ia.md` (*Shell §n*). Components are named exactly as those specs name them; anything they do not define is in §14 "New components needed".
**Evidence:** finding ids (F-UX-…, F-VIS-…, F-RWD-…, F-A11Y-…, F-QA-…) refer to `audit/consolidated/`; raw ids (EXPLORE-SETTINGS-…, QA-B-…) to `audit/raw/`. Screens of today's Settings: `audit/screenshots/scout_settings.png` and `audit/screenshots/va-explore-settings/c*.png`.
**Privacy:** every person, workspace, number, email and key in this spec and its mock is fictional ("Sample Realty", "Anika R.", `+91 80 •••• 2210`). No customer or lead data from the audit appears.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/06-settings.md`, from `06-settings.part1.md` … `part10.md` (edit the parts, then re-assemble) |
| Reference mock (desktop Phone setup, Integrations with disabled and empty states, Organization with the Danger zone in dark, tablet and phone frames) | `spec/03-pages/06-settings.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `06-settings-desktop.png` (1440, light), `-integrations.png` (1440, light), `-danger-dark.png` (1440, dark), `-small.png` (tablet 768 and phone 390 frames) |

**Contents.** Part 1: §0 decisions, strengths kept, backend dependencies, routes, deep links, redirects; §1 purpose and findings for the whole area. Part 2: §2 the new grouping; §3 the Settings frame at every breakpoint. Part 3: §4 the per-section save model; §5 danger zones and "Confirm it's you"; §6 the shared state matrix. Part 4: §7.0 Overview, §7.1 Profile, §7.2 Organization and team. Part 5: §7.3 Notifications, §7.4 Integrations, §7.5 Assistant. Part 6: §7.6 Phone setup, §7.7 Security. Part 7: §7.8 API keys, §7.9 Webhooks, §7.10 Embed. Part 8: §7.11 Activity, §7.12 Export data, §7.13 Delete account, §7.14 retired items. Part 9: §8 keyboard, §9 microcopy, §10 accessibility, §11 responsive summary, §12 telemetry, §13 acceptance. Part 10: §14 new components, §15 reconciliations, §16 open questions, §17 traceability.

---

## 0. Decisions

Settings is where a workspace becomes able to call people: caller ID, inbound number, teammates, apps, keys. Today it fails that job four ways. Org setup is a circular dead end, so integrations and invites stay locked (F-UX-001, critical). One always-on "Save Changes" saves two fields over six other save models, and edits vanish on navigation (F-UX-012). Seventeen flat items mix URL-less tabs with pages that leave the shell, behind false ↗ icons and up to four back links (F-UX-027). And status dead-ends: an empty audit ledger, a 2FA-only Security page, a WhatsApp field that does not exist (F-UX-042, F-UX-044, F-UX-041).

| # | Decision | Why |
|---|---|---|
| S1 | **One frame, every item a URL.** A persistent grouped **SettingsNav** (200 px) beside the page at ≥1024; an index-and-drill model below 1024. Every page is `/settings/<page>` and every section has a stable `#anchor`. No URL-less tabs, no pages outside the frame, no back bars. | F-UX-027, F-A11Y-017, F-VIS-005; D §6.6; Shell D3 |
| S2 | **Grouped by who the setting belongs to.** *Your account* (Profile, Notifications, Security) · *Workspace* (Organization and team, Integrations, Assistant) · *Calling* (Phone setup) · *Developer* (API keys, Webhooks, Embed) · *Data* (Activity, Export data, Delete account). Plus an **Overview** at `/settings`. Seventeen items become 13 pages; nothing is lost (§2.3). | The group answers "can I change this?": your account is always yours; the other groups are admin-edited (S6). Refines Shell §2.3 (§15) |
| S3 | **No page-level Save. Each section declares one save model:** *Instant* (a switch or a view preference, saved on change), *Section form* (its own Save, shown only while that section is dirty), *Action* (a button that opens a dialog or flow which commits by itself), or *Guarded* (a tier 2–3 confirmation or "Confirm it's you"). One section, one commit, one result message (§4). | F-UX-012 (seven save models under one misleading Save); C §8.1; O §18.3 |
| S4 | **Danger is last and separate.** Destructive actions live in a **Danger zone** section at the end of the page they belong to, or in a row's `⋯` menu, with the guard tier of O §3.1. Delete account is the last sub-nav item, in `--danger-text`. | F-UX-035, F-UX-027; O §3.5 |
| S5 | **Only proven state.** Every status is computed: "Verified 21 Sep 2026", "Connected as sales@…", "Failing · last 5 deliveries", "Recording since 20 Sep 2026". Features that are not available are hidden or say "Coming soon"; there are no disabled stubs with engineering notes. | P1; F-UX-016, F-UX-042, F-UX-015 |
| S6 | **Roles are explicit, never a dead end.** Admins edit Workspace, Calling and Developer pages; members see them read-only with the admins named ("Ask an admin: Anika R. or Dev S."). A workspace always has an admin; accounts without one get a real fix (§7.2). | F-UX-001 (critical), F-UX-034 |
| S7 | **No money in Settings.** Meetings Billing moves to Billing › Plans; `#wallet` and `#autopay` redirect to the Top-up sheet and Billing › Autopay. | F-UX-002, F-UX-021; knowledge-billing spec B1–B2 |
| S8 | **One home per phone number.** Your mobile and WhatsApp number live in Profile. The workspace's **Inbound number**, **Caller ID** and **Transfer number** live in Phone setup. Four old names (DID, calling number, assigned number, your phone number) retire. | F-UX-015, F-UX-041; D §4.3 glossary |
| S9 | **Sensitive changes ask "Confirm it's you"** (password or authenticator code, valid for 10 minutes): change email or password, turn off two-factor, create an API key, rotate a signing secret, release the inbound number, delete the workspace or account. | Security hub gaps (F-UX-044); O §3.1 tiers 2–3 |
| S10 | **One developer namespace.** Brand "Vaani Labs", SDK and header prefix "Vaani". `X-VaaniVoice-Signature` and `VaaniVoice.*` stay as documented aliases; the `vv_live_` key prefix is unchanged (open question 5). | F-UX-043 |

### 0.1 Strengths kept (00-summary §4, explore-settings §6)

| Keep | Where it lands |
|---|---|
| Delete account: what is deleted and kept, typed-email confirmation, 7-day grace | §7.13, same pattern, plus how to undo and the sole-admin rule |
| Change email: dual confirmation, "your login stays on the current address until both confirm" | Security › Email address (§7.7), same copy, no overlapping icon |
| Data export: contents and exclusions listed, last export status, size and times, link expiry | §7.12, with one primary and an honest rate limit |
| API keys: scope cards in plain words, rate-limit slider with a recommended value, "shown once, we store only the hash" | §7.8, the scopes become a CheckboxGroup, the secret a OneTimeSecret dialog |
| Webhooks: signature verification on the page, clear event list | §7.9, with a CodeBlock that shows what Copy copies |
| Notifications: "Changes save automatically" | §7.3; the Instant model wherever switches appear |
| Activity: category filters, date range, retention and immutability stated | §7.11, filters as FilterMenu tokens, the applied range always visible |
| Caller-ID stepper Owned → Compliance → Authorized | §7.6, the model for every setup flow |
| Calendly explains the OAuth round-trip before leaving | Integrations › Connect (§7.4) for every OAuth app |
| 14 of 17 items already have URLs | the restructure is layout and redirects (§0.3) |

### 0.2 Backend dependencies (hidden, not simulated: D §8)

| Id | Capability | Needed for | UI until it ships |
|---|---|---|---|
| ST1 | Every workspace has at least one admin; accounts with no workspace can create one | Organization, Integrations, invites (F-UX-001) | Repair migration first (oldest active member becomes admin, logged). Until then the "No admin" state (§7.2) |
| ST2 | Members and invites: list, invite, resend, revoke, change role, remove | Organization › Members | Members table read-only (you only); Invite hidden |
| ST3 | Section endpoints (`PATCH /api/settings/<section>`) with `ETag` / `If-Match` and 409 | Every section form (§4.4) | Today's endpoints, last write wins; the conflict message is hidden |
| ST4 | WhatsApp number with OTP verification | Profile, Notifications | WhatsApp column and field hidden (never "locked" pointing nowhere) |
| ST5 | Notification preferences per event × channel | Notifications | Today's four email switches, mapped to their events; other rows hidden |
| ST6 | Integration status: connected account, since, scopes, needs attention, flows that use it | Integrations | Connected / Not connected only; "Used by" hidden |
| ST7 | Phone setup state: inbound allocation, caller-ID stage, transfer route, calling hours | Phone setup | Caller-ID stepper as today; inbound shows only what `/api/workspace/state` proves |
| ST8 | Sessions list and revoke, set or change password, 2FA recovery codes | Security | Sessions section hidden; password section shows "Reset by email" only |
| ST9 | Recent-auth token (`POST /api/auth/confirm`, 10 min) | Guarded actions (S9) | Guarded actions keep today's checks; no dialog |
| ST10 | Audit events for every category, actor type (person, API key, Assistant) and first-event date | Activity | "Recording since" computed from the oldest row; if none, the not-yet state (§7.11) |
| ST11 | Webhook deliveries across webhooks, redeliver, test event, secret rotation, failing status | Webhooks | Deliveries per webhook only; status column hidden |
| ST12 | API key usage: last used, requests this month | API keys | Those columns hidden |
| ST13 | Delete workspace with grace; sole-admin rule for account deletion | Organization › Danger zone, Delete account | Delete workspace hidden; Delete account as today |
| ST14 | Assistant autonomy settings (assistant spec dependency 4) | Assistant | Page hidden; Assistant stays at mode 2 |
| ST15 | Embed allowed websites | Embed | Section hidden |

### 0.3 Routes, deep links and redirects

Flat slugs, as Shell D3 fixed them, plus one addition (`assistant`, §15). Query state goes through `useUrlState` (N §0.7) so reload, Back and a pasted link restore the view.

| Page | Route | Section anchors | Query state |
|---|---|---|---|
| Overview | `/settings` | none | none |
| Profile | `/settings/profile` | `#details` `#whatsapp` `#preferences` | none |
| Notifications | `/settings/notifications` | `#deliver-to` `#calls` `#money` `#tasks` `#workspace` `#security` `#news` | `channel=email\|whatsapp` (phone) |
| Security | `/settings/security` | `#email` `#password` `#two-factor` `#sessions` | `change=email\|password`, `setup=2fa` |
| Organization and team | `/settings/organization` | `#workspace` `#members` `#assets` `#danger` | `invite=1`, `role=admin\|member`, `q` (members) |
| Integrations | `/settings/integrations` | `#yours` `#workspace-apps` + one per app (`#google` `#microsoft` `#calendly` `#whatsapp` `#instagram` `#facebook` `#hubspot` `#salesforce`) | `manage=<app>`, OAuth return `connected=<app>` or `connect_error=<code>&app=<app>` |
| Assistant | `/settings/assistant` | `#workspace-mode` `#your-mode` | none |
| Phone setup | `/settings/phone` | `#inbound` `#caller-id` `#transfer` `#hours` `#test` `#danger` | `verify=caller-id` |
| API keys | `/settings/api-keys` | none | `create=1`, `key=<id>`, `sort`, `page` |
| Webhooks | `/settings/webhooks` | `#signatures` | `create=1`, `webhook=<id>` |
| Webhook deliveries | `/settings/webhooks/deliveries` | none | `webhook=<id>`, `status=failed\|ok`, `event`, `range`, `page`, `delivery=<id>` |
| Embed | `/settings/embed` | `#key` `#snippet` `#options` `#preview` | `key=<id>` |
| Activity | `/settings/activity` | none | `category`, `actor=me\|<userId>\|<keyId>`, `range`, `q`, `page`, `event=<id>` |
| Export data | `/settings/export` | none | none |
| Delete account | `/settings/delete` | none | none |

**Anchor behaviour.** On load (or `hashchange`) with an anchor, the page scrolls the section heading into view below the sticky page header (`scroll-margin-top: var(--size-header)`), moves focus to that heading (`tabindex="-1"`, no ring after a pointer navigation), and marks the section as the target with a static 2 px `--accent-mark` bar on its left edge (`:target`), which clears on the next navigation. No scroll animation under reduced motion. Every section heading carries a **Copy link** IconButton (`link`, shown on hover and focus, "Copy link to Calling hours") so support can send anyone straight to a setting.

**Redirects** (server `308`, query kept; hash handlers run client-side on `/settings` and `/settings/profile`, because hashes never reach the server). This extends Shell §2.4; every hit logs `legacy_redirect_hit`.

| Old | New |
|---|---|
| `/settings#wallet` · `#autopay` · `#meetings-billing` | current page `?topup=1` (if reached from an in-app link, else `/billing/wallet?topup=1`) · `/billing/autopay` · `/billing/plans` (knowledge-billing §0.3) |
| `/settings#docs` · `#profile` | the Help and docs submenu opens (Shell §9.2) · `/settings/profile` |
| `/settings/calling-number` · `/settings/call-channel` | `/settings/phone#caller-id` · `/settings/phone#transfer` (a `Location` header may carry the fragment) |
| `/settings/calendly` · `/settings/change-email` · `/settings/data-export` | `/settings/integrations#calendly` · `/settings/security#email` · `/settings/export` |
| `/api-keys` · `/api-keys/embed` · `/webhooks` · `/webhooks/deliveries` | `/settings/api-keys` · `/settings/embed` · `/settings/webhooks` · `/settings/webhooks/deliveries` |
| `/admin` · `/admin/organizations` | `/settings/organization` |
| `/settings/personal-agent` | `/personal-agents/settings` (stays with Personal agents) |

`/settings` is no longer a redirect: it renders the Overview (§7.0), the index phones and tablets drill from (§15 R1).

---

## 1. Settings as a whole

### 1.1 Purpose and job to be done

**Primary job:** *When my workspace can't do something yet (call from our own number, invite a teammate, send leads to HubSpot, receive events), I want to find the one place that fixes it, see whether it is really fixed, and change it without breaking live calls.* The main user is the workspace admin during setup, then rarely; members visit for their own profile, notifications and security.

**Secondary jobs:** manage teammates and roles; connect and repair apps; issue and revoke developer credentials; see who did what (Activity); take data out or leave.

**Not Settings' job:** money (Billing), per-flow options (Flow settings), Personal agents' preferences (`/personal-agents/settings`), Help and docs (account menu), choosing what goes live (the Publish gate; Phone setup only re-points the inbound number).

### 1.2 Findings addressed

| Finding | Today | Change |
|---|---|---|
| F-UX-001 (critical) | "Create your own org below" with nothing below; `/admin/organizations` has no create control; all 5 Connects disabled with the reason below the fold | Workspace created at sign-up with you as admin (Shell §12.2); ST1 repair; "No admin" and "No workspace" states with a real action (§7.2); Integrations says who can connect, per group (§7.4) |
| F-UX-012 (high) | Always-on header Save covering 2 fields; 7 save models; no dirty guard | Per-section save model (§4), dirty guard on sub-nav, route change and tab close |
| F-UX-027 (medium) | 17 flat items; 3 URL-less tabs; 14 same-tab ↗ links leaving the shell; up to 4 back links | Grouped SettingsNav in a persistent frame; every item and section a URL; no back bars; ↗ only for real external links in a new tab (§2, §3) |
| F-UX-015 (medium) | Telephony split across 5 pages, 4 names, Analytics pointing to Billing for a number | One Phone setup page with Inbound number, Caller ID, Transfers, Calling hours and Test call (§7.6) |
| F-UX-041 (medium) | Profile mixes personal, org, agent content and integrations; Notifications points to a missing WhatsApp field | Profile is personal only; subdomain → Organization; brochure → Organization › Shared assets; Google and Microsoft → Integrations; WhatsApp number added and deep-linked (§7.1, §7.3) |
| F-UX-044 (medium) | Security = 2FA only; H1 "Two-factor authentication" | Security hub: Email address, Password, Two-factor, Where you're signed in, sign-in history link (§7.7) |
| F-UX-042, F-QA-023 (medium) | Empty "append-only" ledger; "Suspicious activity?" → Profile | "Recording since" stated; applied range always shown; "Something looks wrong?" → Security › sessions (§7.11) |
| F-UX-047 (low) | Two equal primaries on Export; contradictory rate-limit copy | Download is the one primary; Request is secondary with "Available again in 3 h" (§7.12) |
| F-UX-020, F-QA-008 (medium) | Embed snippets display corrupted markup; 182 px preview | CodeBlock renders and copies one raw string; preview full column width (§7.10) |
| F-QA-017 (medium) | 3 of 5 Docs links 404 to an off-shell page | Docs tab retired to the Help menu with real targets; in-shell 404 (Shell §15) |
| F-QA-021, F-UX-025 (medium) | "abc" phone, "not-a-url" webhook, "not-an-email" accepted with the primary enabled | Shared validators and the one timing rule (C §8.2) on every Settings form |
| F-UX-016, EXPLORE-SETTINGS-11 (medium) | "stub row until app-review credentials are ready", "over Twilio", raw paths as link text, literal backticks | Plain words; "Coming soon"; human link text; exact limits (§9) |
| F-UX-043 (medium) | "Vani Voice", "VaaniVoice", em-dash separators | One brand and namespace (S10); full stops and middle dots (§9) |
| F-VIS-005, EXPLORE-SETTINGS-09 (medium) | 6+ templates: mono 24 px H1s, 70 px magazine header, grid paper, 36 px editorial titles | One PageHeader (`nested`, title-20), one 720 column, one section anatomy (§3) |
| F-VIS-019 (medium) | "@" icon over the Change-email input text | TextInput adornment padding rule (C §3.2) |
| F-VIS-032 (low) | Duplicate plug and shield icons, no grouping | One icon per Settings page (§2.2), grouped nav |
| F-VIS-034 (medium) | Content 576 px centred in 1,140; Save 520 px from the form at 1920 | `--size-container-form` 720, aligned with the header; no header Save |
| F-A11Y-003 (high) | Profile labels with no `for`; placeholder names; unlabelled file input | Every control inside a `Field`; FileField labelled (C §3.1, §7.2) |
| F-A11Y-005 (high) | New-webhook modal without dialog role, unnamed close | Dialog primitive (O §2) for every Settings dialog |
| F-A11Y-008 (high) | 10 px mono `#7A8397` helper text and 12 px sub-nav at 3.52:1 | 12 px floor, `--text-3` ≥ 4.70:1, no mono labels |
| F-A11Y-017 (medium) | No `aria-current`; unlabelled navs; `<button>` and `<a>` mixed in the sub-nav | `<nav aria-label="Settings">` of links with `aria-current="page"` (§3.3) |
| F-A11Y-030 (low) | ↗ on same-tab links; Save before the sub-nav in tab order; Connect Google after Microsoft | DOM order equals visual order; ↗ only on new-tab links |
| F-A11Y-004 (high) | No way to turn single-key shortcuts off from Settings | Profile › Preferences "Single-key shortcuts" switch (also in the account menu) |
| F-RWD-001 (high), EXPLORE-SETTINGS-08 | Settings unreachable on phones; 2,300 px sub-nav strip | More sheet → Settings index; drill-in pages with one back link (§3.5) |
| F-UX-002, F-QA-004 (high), F-UX-021 | Wallet hashes land on Profile; meeting plans in Settings | Redirects (§0.3); nothing money-related in Settings (S7) |
| F-UX-045 (medium) | Session replay on pages with personal data | Replay off on Profile, Organization, Security, Activity (§12) |

---

## 2. The new grouping

### 2.1 Sub-nav groups and pages

Five groups, ordered from "mine" to "irreversible". The group tells you whether you can change it: **Your account** is always yours; **Workspace**, **Calling** and **Developer** are edited by admins; **Data** ends with the one irreversible action. Group labels are sentence case, `label-12` `--text-3` (N §1.2 NavGroup), never collapsible.

| Group | Page (label = H1 = `<title>` part) | Index icon | Description (Overview and phone index) | Sub-nav badge (computed only; N §1.5) |
|---|---|---|---|---|
| (top) | **Overview** | `layout-list` | Everything in Settings, and what needs attention | none |
| Your account | **Profile** | `user-round` | Your name, mobile and WhatsApp number, and preferences | none |
| | **Notifications** | `bell` | What we email or WhatsApp you about | none |
| | **Security** | `shield` | Email address, password, two-factor and where you're signed in | none |
| Workspace | **Organization and team** | `building-2` | Workspace name and address, teammates and roles, shared files | `warning` "No admin" (ST1) |
| | **Integrations** | `plug` | Calendars, CRMs and WhatsApp Business | `warning` "Reconnect" (a connection needs attention) |
| | **Assistant** | `bot` | What the Assistant may do without asking | none |
| Calling | **Phone setup** | `phone` | Inbound number, caller ID, transfers and calling hours | `warning` "Verify" (caller ID not verified) or "Set up" (no inbound number); the same fact as the main nav badge (Shell §2.2) |
| Developer | **API keys** | `key-round` | Keys for calling the Vaani Labs API | none |
| | **Webhooks** | `webhook` | Send call and lead events to your systems | `warning` "Failing" (a webhook's last 5 deliveries failed) |
| | **Embed** | `code-xml` | Put a Vaani voice widget on your website | none |
| Data | **Activity** | `history` | Who did what, and when | none |
| | **Export data** | `download` | Download a copy of your data | none |
| | **Delete account** | `trash-2` | Close your account | none; label always `--danger-text` |

On desktop the SettingsNav is **text only** (the main sidebar carries the icons; two icon columns side by side read as one noisy list, F-VIS-032). Icons appear in the Overview and the phone and tablet index, where they help scanning. One icon per page; no icon repeats (today Calendly and Integrations shared a plug, Calling number and Security a shield).

### 2.2 Where the 17 old items went

| Old item (today's route) | New home |
|---|---|
| Profile (in-page tab) | Profile; subdomain → Organization › Workspace; WhatsApp brochure → Organization › Shared assets; Google and Microsoft → Integrations › Your connections; the "Identity · Status Approved" card is dropped (it describes sign-up, not settings) |
| Organization | Organization and team |
| Notifications | Notifications (Instant model kept) |
| Call channel | Phone setup › Transfers |
| Calling number | Phone setup › Caller ID |
| Calendly | Integrations › Your connections |
| Security | Security (becomes a hub) |
| Activity & Audit | Activity |
| API Keys (`/api-keys`) | API keys |
| Embed (`/api-keys/embed`) | Embed |
| Webhooks (`/webhooks`) | Webhooks (+ Webhook deliveries) |
| Integrations | Integrations › Workspace connections |
| Meetings Billing (in-page tab) | Billing › Plans (out of Settings, S7) |
| Data Export | Export data |
| Change Email | Security › Email address |
| Docs (in-page tab) | Account menu › Help and docs (out of Settings) |
| Delete Account | Delete account (last, danger text) |

### 2.3 Role visibility (v1 roles: Admin, Member; open question 1)

| Page | Admin | Member |
|---|---|---|
| Overview, Profile, Notifications, Security | edit | edit (their own) |
| Organization and team | edit | read; can leave the workspace |
| Integrations | edit both groups | edit *Your connections*; read *Workspace connections* |
| Assistant | edit the workspace mode and their own | read the workspace mode; choose an equal or stricter mode for themselves |
| Phone setup | edit | read (numbers masked; "Only admins can change phone setup") |
| API keys, Webhooks, Embed | edit | read; create and revoke are admin actions with the reason shown (open question 2) |
| Activity | everyone's events | their own events |
| Export data | workspace export | their own data |
| Delete account | edit | edit |

Read-only pages render their fields in the read-only state (C §1.5: `--surface-2`, copyable) under one page-scope neutral **Notice**: "Only admins can change workspace settings. Ask an admin: Anika R. or Dev S." (names computed, up to 2, then "and 1 more"). A read-only page never shows Save, footers or disabled buttons row by row.

---

## 3. The Settings frame

### 3.1 Hierarchy (what the eye hits first)

1. **The page H1 and its status meta** ("Phone setup · Caller ID verified · Inbound number ready"), so you know whether this area works before reading anything.
2. **The one thing that needs you**, if anything: a section-scope Notice at the top of the affected section ("Caller ID isn't verified. Customers see an unknown number."), or the dirty section's Save.
3. **Section headings** in page order, each with one line of description.
4. The **SettingsNav current item** (raised key), for orientation only. The nav never shouts; badges appear only for a computed problem.

### 3.2 Layout

**SettingsLayout** (new, §14) is the shell's content area split into the SettingsNav and the page. It keeps the page header aligned with its column (F-VIS-034) and scrolls the page, not the whole frame.

| Part | Values |
|---|---|
| SettingsNav | width `--size-settings-nav` (200); plane `--surface` with a 1 px `--border` right hairline (inside the page, distinct from the `--bg` sidebar); padding `space-12 space-8`; sticky, own vertical scroll; items as N §1.2 NavItem without icons: height `--control-h`, `label-13` `--text-2`, radius-6; current = the raised key (`--nav-active-bg`, 1 px `--nav-active-border`, `e1`, `--text`) plus `aria-current="page"`; group gap `space-12` |
| Page column | starts `--page-margin` (24) after the nav. `width="form"` (default): `max-width: var(--size-container-form)` (720). `width="data"` (API keys, Webhooks, Deliveries, Activity): fluid, `max-width: var(--size-container-page)` (1280). Left-aligned at ≥1024 so the header, sections and nav line up |
| PageHeader | `variant="nested"` (N §2.3): breadcrumb "Settings" (→ `/settings`), H1 `title-20` = the page label, meta = the page's computed status, actions per page (at most one primary, usually none: sections own their actions). Sticky at `z-sticky`, aligned with the column |
| Section | **SettingsSection** (new, §14): `<section aria-labelledby>`; heading `title-16` (`h2`) + Copy-link IconButton; description `body-14` `--text-2`, one sentence, max `--size-measure`; status slot at the heading's end (StatusText sm: "Saved 11:24 am"); content; footer (form model only). Sections are separated by `--space-section-gap` (40) with a 1 px `--border` hairline, never boxed (C §8.1, D P7) |
| Danger zone | the one boxed section: 1 px `--border`, `--radius-8`, rows divided by hairlines (§5.1) |
| Fields | C §8.1: labels above, 16 between fields, 24 between groups, widths by content (`--field-w-short` 180, `--field-w-medium` 320, else full column) |
| Setting rows | **SettingRow** (new, §14) for switches and read-only values with an action: label `body-14` + description `meta-12` `--text-3` left, control or value right; min-height 40 (48 touch); hairline between rows (C §6.3 Layout) |
| Toasts, save bar | the UnsavedChangesBar and toasts sit `calc(var(--size-baseline) + var(--space-16))` above the bottom, inside the page column (O §9.3, §18.3) |

### 3.3 SettingsNav behaviour and semantics

- `<nav aria-label="Settings">` holding one `<ul>` per group, each labelled by its group label (`role="group"` + `aria-labelledby`). Items are links (`<a href>`), one tab stop each, so Cmd/Ctrl-click opens a page in a new tab. The current item has `aria-current="page"`, matched by prefix (`/settings/webhooks/deliveries` marks Webhooks).
- No arrow-key roving (links behave like links); `F6` moves between the shell, the SettingsNav and the page (Shell §3.9).
- A sub-nav click with a dirty section runs the navigation guard (§4.5) before it navigates.
- Badges follow N §1.5: `alert-triangle` 12 + one word in `--warning-text`, included in the link name ("Phone setup, caller ID not verified").
- Pages a role cannot open are omitted (not disabled). A direct visit renders Forbidden in the frame (O §16.1).
- Loading: the nav renders from config instantly; badges render nothing until `useWorkspaceState()` resolves.

### 3.4 Wireframes: desktop and laptop

**Desktop ≥1440** (1440 × 900 shown; Phone setup with a dirty Transfers section):

```
┌─ Sidebar 232 ───┬─ SettingsNav 200 ─┬─ page column (24 margin, max 720) ───────────────────────┬─ free ~264 ─┐
│ [S] Sample Rea… │ Overview          │ Settings ›                                                │             │
│ [search] Sear…  │                   │ Phone setup   Inbound ready · Caller ID verifying 2 of 3  │             │
│ Operate         │ Your account      │───────────────────────────────────────────────────────────│             │
│  …              │  Profile          │ Inbound number                                    [link]  │             │
│ Account         │  Notifications    │ Callers who ring this number reach your agent.            │             │
│  Billing        │  Security         │ +91 80 •••• 2210 ✓ Ready  Answers with Site-visit qual…   │             │
│ ▣ Settings ⚠Ver │ Workspace         │                                  Change flow…  ⋯          │             │
│                 │  Organization an… │───────────────────────────────────────────────────────────│             │
│                 │  Integrations     │ Caller ID                                                 │             │
│                 │  Assistant        │ ◉ Owned ✓   ◉ Compliance…   ○ Authorized                  │             │
│                 │ Calling           │ Checking the number is registered to your business.       │             │
│                 │ ▣ Phone setup ⚠   │───────────────────────────────────────────────────────────│             │
│                 │ Developer         │ Transfers                                                 │             │
│                 │  API keys         │ (•) A phone number  [+91 98765 43210        ]             │             │
│                 │  Webhooks         │ ( ) Rep console, then a phone number                      │             │
│                 │  Embed            │ Unsaved changes · 1 field           [Discard] [Save]      │             │
│                 │ Data              │───────────────────────────────────────────────────────────│             │
│                 │  Activity         │ Calling hours · IST  …                                    │             │
│ (AR) Anika R.   │  Export data      │                                                           │             │
│                 │  Delete account   │                                                           │             │
├─────────────────┴───────────────────┴─ Baseline 28 ───────────────────────────────────────────────────────────┤
```

- The sidebar's Settings item is current and carries the same "Verify" badge as the SettingsNav's Phone setup item (one fact, two places, one source).
- A dirty section shows its **SectionFooter** in place (§4.2). If that footer scrolls out of view, the **UnsavedChangesBar** docks at the bottom of the column (above the Baseline) naming the section.

**Laptop 1280–1439:** identical; the free right gutter shrinks to about 104 px at 1280. `width="data"` pages fill to the right margin.

**Laptop 1024–1279:** the sidebar becomes the 56 px rail (Shell §3.4); the SettingsNav stays at 200. At 1024 the column is exactly 720 (1024 − 56 − 200 − 2 × 24). At viewport heights ≤ 800 the SettingsNav uses `--control-h-sm` items and `space-4` group gaps, so all 14 items fit in 520 px without scrolling (budget: 14 × 28 + 5 labels × 24 = 512).

```
┌R56┬─ SettingsNav 200 ─┬─ column 720 ───────────────────────────────────┐
│ ▣ │ Overview          │ Settings ›                                      │
│   │ Your account      │ Profile                                         │
│   │ ▣ Profile         │─────────────────────────────────────────────────│
│   │  …                │ Personal details …                              │
└───┴───────────────────┴─ Baseline ──────────────────────────────────────┘
```

### 3.5 Wireframes: tablet and phone (index and drill)

Below 1024 the shell is single-pane (D §6.1), so the SettingsNav becomes the **SettingsIndex** (new, §14): the Overview page lists every page as a 56 px row, and each page drills in with one back link. There is no horizontal strip (today 2,300 px wide, F-UX-027).

**Tablet 768–1023** (768 × 1024 shown). TopBar 52: back link "‹ Settings", then the page title (the H1 is portaled into the TopBar title slot, N §2.7), then the wallet chip and search. The column is `min(720px, 100% − 48px)`, **centred**.

```
┌ TopBar: [menu] Settings        ₹2,340  [search] ┐   ┌ TopBar: ‹ Settings  Phone setup   [search] ┐
│ Sample Realty · You're an admin                 │   │ Inbound ready · Caller ID verifying       │
│ ⚠ 2 things need attention                       │   │───────────────────────────────────────────│
│   Caller ID isn't verified. Verify              │   │ Inbound number                    [link]  │
│   Google needs you to sign in again. Reconnect  │   │ +91 80 •••• 2210  ✓ Ready                 │
│─────────────────────────────────────────────────│   │ Answers with Site-visit qualifier v7      │
│ Your account                                    │   │ Change flow…                         ⋯    │
│ [user]   Profile            Anika R.         >  │   │───────────────────────────────────────────│
│ [bell]   Notifications      Email on         >  │   │ Caller ID …                               │
│ [shield] Security           Two-factor on    >  │   │ Transfers …                               │
│ Workspace                                       │   │                                           │
│ [bldg]   Organization and team  4 people     >  │   │ ┌ Unsaved changes in Transfers ─────────┐ │
│ …                                               │   │ │               [Discard] [Save]        │ │
│ Data                                            │   │ └───────────────────────────────────────┘ │
│ [trash]  Delete account                      >  │   │                                           │
└─────────────────────────────────────────────────┘   └───────────────────────────────────────────┘
      /settings (index)                                    /settings/phone
```

**Phone 320–767** (390 × 844 shown). Reached from the More sheet's "Settings" row. Index rows are 56 px with a 20 px icon, the label (`label-13`), the status (`meta-12` `--text-3`) and a chevron; the whole row is the link (44 px minimum hit area). Pages use full-width fields, 44 px controls and 16 px field text (C §1.4). The UnsavedChangesBar docks full width directly above the BottomBar with Discard and Save sharing the width 1:1 (O §18.3); SectionFooters are hidden on phones so there is one save control at a time.

```
┌ ‹ Settings   Profile   [search] ┐      ┌ Settings           [search] ┐
│ Personal details         [link] │      │ ⚠ Caller ID isn't verified. │
│ Full name                       │      │   Verify · and 1 more       │
│ [ Anika R.                   ]  │      │ Your account                │
│ Mobile number (optional)        │      │ [user]   Profile          > │
│ [+91│ 98765 4321             ]  │      │          Anika R.           │
│ This number has 9 digits.       │      │ [bell]   Notifications    > │
│ Mobile numbers have 10.         │      │          Email on           │
│─────────────────────────────────│      │ [shield] Security         > │
│ WhatsApp number                 │      │          Two-factor on      │
│ Not added       [Add number…]   │      │ Workspace                   │
│─────────────────────────────────│      │ [bldg]   Organization     > │
│ Preferences                     │      │ …                           │
│ Theme  (System | Light | Dark)  │      │ [trash]  Delete account   > │
├─────────────────────────────────┤      ├─────────────────────────────┤
│ Unsaved changes · Personal det… │      │ BottomBar · More current    │
│ [  Discard  ]  [    Save     ]  │      │                             │
├─────────────────────────────────┤      └─────────────────────────────┘
│ BottomBar · More current        │
└─────────────────────────────────┘
```

### 3.6 Responsive summary for the frame

| Width | Navigation between pages | Column | Section footer and save bar | Tables (`width="data"`) |
|---|---|---|---|---|
| ≥1440 | Sidebar 232 + SettingsNav 200 | left-aligned, 720 or fluid to 1280 | footer in place; bar docks when the footer is off-screen | DataTable, all priority columns |
| 1280–1439 | same | same | same | same |
| 1024–1279 | Rail 56 + SettingsNav 200 | 720 at 1024 | same | DataTable; lowest-priority columns move into Columns (N §7.5) |
| 768–1023 | Overview index → page; "‹ Settings" in the TopBar | centred, max 720 | same | DataTable with pinned key and actions columns (N §7.13) |
| 320–767 | More sheet → index → page | full width, 16 px margins | footer hidden; bar docks above the BottomBar | ListRow two-line items (N §7.13) |

- No page scrolls sideways at 320 (`overflow-x: clip` on the page scroller, N §2.7). Code, URLs and keys wrap (`overflow-wrap: anywhere`) or scroll inside their CodeBlock, never the page.
- Short screens (≤720 tall): the Baseline folds into a header chip (Shell D10); the save bar's bottom offset drops to `--space-16`.
- The frame never reloads between Settings pages: the nav and header stay mounted and only the column swaps (App Router nested layout), so moving around Settings never flashes a full-screen loader (F-QA-007, EXPLORE-SETTINGS-22).

---

## 4. The per-section save model

Today one blue "Save Changes" sits in the page header, is always enabled, saves two fields, disappears on two tabs, and loses edits on navigation, while six other save models run underneath it (F-UX-012). The replacement: **every section declares exactly one model, and its commit covers exactly that section.**

### 4.1 The four models

| Model | Use for | What the user sees | Success | Failure |
|---|---|---|---|---|
| **Instant** | Personal, reversible preferences and on/off choices: notification switches, theme, single-key shortcuts, default density, an integration's options, pausing a webhook | The control changes at once (optimistic). No Save anywhere in the section | StatusText sm "Saved" beside the control for `--timing-toast` (C §6.3); no toast | The control returns to its previous value; "Couldn't save. **Retry**" in `--danger-text`, `role="status"` beside it |
| **Section form** | Values that are typed, validated together, or affect others: personal details, workspace name and address, transfers, calling hours, the Assistant's mode, allowed websites | Fields; a **SectionFooter** ("Unsaved changes · 2 fields · Discard · Save changes") appears at the section's end only while it is dirty | Footer leaves; the heading's status slot shows "Saved 11:24 am" for `--timing-toast`; focus moves to the section heading | Field errors in place (C §8.2 V3, V4, V7); anything else an InlineError above the footer actions with Retry and Details; the footer stays |
| **Action** | Things you do rather than values you set: invite, connect an app, create a key, verify a number, request an export, upload a file | A button (usually secondary) that opens a Dialog, Sheet, OAuth window or stepper, which commits on its own | The object's new state in place ("Connected as …", "Verified 21 Sep 2026"); a toast only when the effect is off-screen ("Invites sent to 3 people") | Inside the dialog (O §2.3 Submit failed) or an InlineError under the row |
| **Guarded** | Destructive, security-sensitive or live-affecting changes | The action's button ends in "…" and opens a ConfirmDialog of the right tier (O §3.1), "Confirm it's you" first where S9 says so (§5.3) | As Action, plus Undo where the backend allows (tier 1) | The dialog stays open with a danger Notice; nothing changed |

Rules that follow from the models:
- **Never mix models in one section.** A switch inside a Section form would save on its own while its neighbours wait for Save, so a section with switches is Instant, and a choice that must be saved with other fields uses a Checkbox or RadioCard (C §6.1, §6.3).
- **A section form never autosaves**, and an Instant section never shows a Save button (C §8.1).
- **The page header holds no Save.** Page-level actions (Create key…, Invite…) are Actions, not saves.
- **Saves are proven (P1):** a Section form shows "Saved" only after a 2xx; the button reads "Saving…" meanwhile (C §2.1 Loading).

### 4.2 SectionFooter (inline save row)

| Part | Values |
|---|---|
| Container | the last row of a form section; `margin-top: var(--space-24)`; `display:flex; align-items:center; justify-content:space-between; gap: var(--space-12)`; no fill, no border (it belongs to the section, not a floating bar) |
| Status | StatusText md neutral: "Unsaved changes · 2 fields" (count of changed fields, not of touched ones) |
| Actions | **Discard** (tertiary, `md`) then **Save changes** (primary, `md`, the section's one primary; loading label "Saving…") |
| Why-text | only when Save is aria-disabled for an outside reason: "You're offline." · "Only admins can change this." (C §1.6). Field errors never disable it (C §8.2 V6) |
| Appears | when the section becomes dirty (a value differs from the saved one; typing back to the original value makes it clean again) |
| Leaves | after a successful save or Discard; focus moves to the section heading, whose status reads "Saved 11:24 am" (announced politely once) |

**Discard** restores the saved values instantly, without a confirmation (the user asked, and the loss is only what they typed), and shows StatusText "Changes discarded" for `--timing-toast` with **Undo** (restores the typed values).

### 4.3 The UnsavedChangesBar in Settings (contract extension, §14)

O §18.3's bar is reused as the **off-screen reminder** of dirty sections, not as a second save:

| Situation | Bar |
|---|---|
| No dirty section, or every dirty section's footer is visible | hidden |
| One dirty section whose footer is out of view (IntersectionObserver, 0 threshold) | "Unsaved changes in Transfers · **Discard** · **Save**" (acts on that section) |
| Two or more dirty sections, any footer out of view | "Unsaved changes in 2 sections · **Review**". Review scrolls to the first dirty section and focuses its Save. There is no "Save all": each section validates and commits on its own, and a partial failure across sections would be ambiguous |
| Phone (< 768) | always shown while anything is dirty, full width above the BottomBar, 44 px buttons sharing the width 1:1; SectionFooters are hidden so there is one save control at a time |

Position, surface and motion are O §18.3's (sticky in the column, `bottom: calc(var(--size-baseline) + var(--space-16))`, `--surface-overlay`, `--border-overlay`, `--e3`, rise `--shift-toast` over `--dur-slow`). `role="region"` `aria-label="Unsaved changes"`; its appearance is announced once.

### 4.4 Section endpoints and conflicts

- Each Section form reads and writes one resource: `GET/PATCH /api/settings/<section>` with an `ETag`; the PATCH sends `If-Match` and only the changed fields (ST3).
- **409 (changed elsewhere):** the section keeps the user's values and shows a warning InlineError above the footer: "Dev S. changed Calling hours at 11:24 am. Your edits are kept." The footer's buttons relabel to **Discard mine** (tertiary; loads their version) and **Replace their version** (primary). Nothing is merged silently.
- **422:** server messages map onto the fields (C §8.2 V7).
- **Other failures:** "Couldn't save Calling hours. Your edits are kept. **Retry** · Details" (`role="alert"`), the footer stays.
- A Section form that changes something live or shared confirms after validation and before the PATCH: a changed workspace address (§7.2) and a changed transfer route (§7.6) open a tier-2 ConfirmDialog naming the effect.

### 4.5 Navigation guard

`useUnsavedChangesGuard` (O §18.4) runs while any section is dirty, on: a SettingsNav or sidebar click, any in-app route change, a workspace switch, Sign out, and tab close (`beforeunload`, registered only while dirty).

| Dirty | ConfirmDialog (tier 2, O §3.1) |
|---|---|
| One section | "Discard changes to Transfers?" · "You changed 1 field and haven't saved it." · **Keep editing** (focused) · **Discard** (destructive outline) |
| Several | "Discard changes on Phone setup?" · "Transfers and Calling hours have unsaved changes." · same buttons |

In-page anchor jumps never trigger the guard. Dirty values are also kept in `sessionStorage` per section for the tab's life, so an accidental reload restores them with the StatusText "Restored your unsaved edits · Discard".

### 4.6 Save model for every section

| Page | Section | Model |
|---|---|---|
| Profile | Personal details | Section form |
| | WhatsApp number | Action (Add or Change… with a code; Remove… tier 2 when alerts use it) |
| | Preferences | Instant (theme, single-key shortcuts, table density) |
| Notifications | Deliver to | read-only rows with links |
| | Every event group | Instant (one switch per event × channel); Reset to defaults = Action with Undo (tier 1) |
| Security | Email address | Guarded Action (Confirm it's you → Change email dialog) |
| | Password | Guarded Action |
| | Two-factor | Guarded Action (Turn on…, Turn off… tier 2, New recovery codes…) |
| | Where you're signed in | Action (Sign out per session, instant with a toast); Sign out of all other sessions… tier 2 |
| Organization and team | Workspace | Section form (an address change confirms, tier 2) |
| | Members | Action (Invite…, role change tier 2, Remove… tier 2, Revoke invite tier 1) |
| | Shared assets | Action (upload or replace at once; Remove… tier 2 when a flow uses it) |
| | Danger zone | Guarded (Leave… tier 2; Delete workspace… tier 3 + Confirm it's you) |
| Integrations | Each app | Action (Connect…, Manage, Reconnect); options inside Manage are Instant; Disconnect… tier 2 |
| Assistant | Workspace mode · Your mode | Section form each |
| Phone setup | Inbound number | Action (Request a number…, Change flow… tier 2) |
| | Caller ID | Action (the verification steps; Replace number…) |
| | Transfers · Calling hours | Section form each (a route change confirms, tier 2) |
| | Test call | Action → Call gate (tier 4) |
| | Danger zone | Guarded (Release inbound number… tier 3; Remove caller ID… tier 2) |
| API keys | Keys | Guarded Action (Create key…); Rename… Action; Revoke key… tier 2 |
| Webhooks | Webhooks | Action (New webhook…, Edit…, Send test event); Pause is Instant; Rotate signing secret… tier 2 + Confirm it's you; Delete webhook… tier 2 |
| Embed | Key, snippet, options, preview | view state only (nothing is saved; options change the generated snippet) |
| | Allowed websites | Section form (ST15) |
| Activity, Webhook deliveries | Filters | view state in the URL; Redeliver is an Action |
| Export data | Latest export · Request | Action |
| Delete account | Whole page | Guarded (typed confirmation + Confirm it's you) |

---

## 5. Danger zones and "Confirm it's you"

### 5.1 DangerZone anatomy (new, §14)

```
┌ Danger zone ─────────────────────────────────────────────────────────────┐
│ Leave Sample Realty                                   [ Leave workspace… ]│
│ You lose access to its flows, leads and call reports. An admin can        │
│ invite you again.                                                          │
│───────────────────────────────────────────────────────────────────────────│
│ Delete workspace                                     [ Delete workspace… ]│
│ Deletes 16 flows, 1,284 leads and 121 call reports after 7 days,          │
│ releases +91 80 •••• 2210 and cancels 2 scheduled batches.                │
└────────────────────────────────────────────────────────────────────────────┘
```

| Part | Values |
|---|---|
| Section | always the **last** section of its page, anchor `#danger`; the one boxed section in Settings: 1 px `--border`, `--radius-8`, no fill, no red tint |
| Heading | "Danger zone", `title-16` `--text` (`h2`); no icon; red is not used for the heading (the actions carry the weight, O §3.3) |
| Row | padding `space-16`; hairline between rows; grid `minmax(0,1fr) auto` with gap `space-16`; title `title-14` `--text`; consequence `body-14` `--text-2`, computed from the server (counts, the number, batches) |
| Button | Button `destructive` (outline) `md`, label = verb + object + "…" |
| Unavailable | the button is aria-disabled with the reason inline under the consequence: "You're the only admin. Make someone else an admin first." (C §1.6) |
| Phone | the button goes full width under the text; rows keep 16 px padding; ≥ 8 px from any other control (F §14) |

At most three rows. Nothing destructive appears anywhere else on the page except row `⋯` menus, where it is the last item after a separator, in `--danger-text` (O §3.5).

### 5.2 Every destructive action in Settings

| Page | Action | Tier (O §3.1) | Guard | Consequence copy (computed parts in braces) | After |
|---|---|---|---|---|---|
| Organization | Leave workspace… | 2 | ConfirmDialog | "Leave {Sample Realty}? You lose access to its flows, leads and call reports. An admin can invite you again." | Signed in to your next workspace, or the "No workspace" state |
| Organization | Delete workspace… | 3 | Confirm it's you → typed workspace name | "Delete {Sample Realty}? After 7 days we delete {16 flows}, {1,284 leads}, {121 call reports} and recordings, release {+91 80 •••• 2210} and cancel {2 scheduled batches}. Calls stop now. Any wallet balance is handled under the refund policy." Link: refund policy ↗ | Every member is signed out of it; admins get an email with Restore within 7 days |
| Organization › Members | Remove {Dev S.}… | 2 | ConfirmDialog | "Remove Dev S. from Sample Realty? They lose access now. Their call history stays." | Toast "Removed Dev S." |
| Organization › Members | Make {Dev S.} a member… / an admin… | 2 | ConfirmDialog | "Make Dev S. a member? They'll no longer change phone setup, integrations or keys." | Row updates; Activity entry |
| Organization › Members | Revoke invite | 1 | Undo toast | "Invite to r•••@sample.in revoked · Undo" | |
| Organization › Shared assets | Remove brochure… | 2 if a flow uses it, else 1 | ConfirmDialog | "Remove brochure.pdf? The Send WhatsApp step in {2 live flows} will send the message without it." | |
| Integrations | Disconnect {HubSpot}… | 2 | ConfirmDialog | "Disconnect HubSpot? Call outcomes stop syncing now. {The CRM lookup step in 1 live flow} will take its Not found path." | Row returns to Not connected |
| Phone setup | Release inbound number… | 3 | Confirm it's you → type the last 4 digits | "Release +91 80 •••• 2210? Callers get a 'number not in service' message, and {Site-visit qualifier} stops answering. You may not get this number back." | Section returns to "No inbound number" |
| Phone setup | Remove caller ID… | 2 | ConfirmDialog | "Remove +91 98765 ••••? Phone calls can't be placed until you verify another caller ID. Scheduled batches pause." | Caller ID back to step 1; Home and Baseline show the block |
| Security | Turn off two-factor… | 2 | Confirm it's you → ConfirmDialog | "Turn off two-factor? Signing in will need only your password." | |
| Security | Sign out of all other sessions… | 2 | ConfirmDialog | "Sign out of {3} other sessions? You stay signed in here." | Toast "Signed out of 3 sessions" |
| API keys | Revoke {CRM sync}… | 2 | ConfirmDialog | "Revoke 'CRM sync'? Apps using it stop working now. This can't be undone." | Row shows Revoked for 7 days, then leaves |
| Webhooks | Delete {CRM hook}… | 2 | ConfirmDialog | "Delete 'CRM hook'? Events stop now. Its delivery history is deleted too." | |
| Webhooks | Rotate signing secret… | 2 | Confirm it's you → ConfirmDialog → OneTimeSecret | "Rotate the secret for 'CRM hook'? The old secret keeps working for 24 hours so you can update your server." | |
| Delete account | Delete account | 3 | the page's typed email + Confirm it's you | §7.13 | Signed out; email with Restore |

No setting, admin or otherwise, skips tier 3 or 4 (O §3.1).

### 5.3 "Confirm it's you" (ReauthDialog: a Dialog `sm` preset, §14)

| Account | Body | Field | Primary |
|---|---|---|---|
| Password, no 2FA | "Enter your password to {release the inbound number}." | PasswordInput (current-password) | Confirm |
| 2FA on | "Enter the 6-digit code from your authenticator app to {…}." | TextInput `inputmode="numeric"` `autocomplete="one-time-code"`, 180 wide, hint "Or use a recovery code" (link swaps the field) | Confirm |
| Google or Microsoft sign-in only | "Sign in with Google again to {…}." | none | Continue with Google (opens the provider; the dialog waits with "Waiting for Google…") |

Title "Confirm it's you". A success is remembered for 10 minutes (ST9), so a sequence of sensitive steps asks once. Errors: "That password isn't right. Try again or **reset it**." · "That code has expired. Enter the new one." · 429: "Too many attempts. Try again in 30 s." Focus starts in the field; Esc cancels the whole action.

---

## 6. Shared states for every Settings page

| State | Frame (nav, header) | In the page | Copy pattern |
|---|---|---|---|
| **Loading** | Nav, breadcrumb and H1 render at once from config; the meta is a skeleton bar (N §2.4) | Each section shows FormSkeleton (O §13.2) after 200 ms, at least 400 ms once shown; tables use TableSkeleton | hidden polite line "Loading phone setup…" |
| **First use** | normal | the section's own empty state (O §15, first-use variant), one action | "Create a key to call the Vaani API from your systems. · Create key…" |
| **Partial** (set up halfway) | meta says how far ("Caller ID verifying · 2 of 3") | StageProgress or the section's own progress; the next action is the section's primary | "Compliance check in progress. Usually done within 1 working day." (only with a real SLA; Shell open question 5) |
| **Needs attention** | nav badge (computed) | section-scope warning Notice at the top of that section, one action | "Google needs you to sign in again. Calendar events can't be created until you do. **Reconnect**" |
| **Section failed to load** | normal | SectionError in that section only (with last good data if any: "Couldn't refresh · Retry · Updated 4:42 pm"); other sections keep working | "Couldn't load members. **Retry**" |
| **Page failed** | normal | PageError in the column (O §16.1) | "Settings couldn't load. Your settings are safe. This is a problem on our side or with your connection. **Retry**" |
| **Save failed** | normal | InlineError above the SectionFooter (§4.4) | "Couldn't save Transfers. Your edits are kept. **Retry** · Details" |
| **Offline** | ConnectionBar (O §10.3) | Save buttons and Actions aria-disabled with "You're offline"; switches disabled with the same reason; dirty values kept | "You're offline. Your edits stay on this device until you reconnect." |
| **Read-only (member)** | normal | page Notice + read-only fields (§2.3) | "Only admins can change phone setup. Ask an admin: Anika R. or Dev S." |
| **No access** | normal; the page is absent from the nav | Forbidden in the column (O §16.1) | "Only admins can manage webhooks. Ask an admin: Anika R." · Go back |
| **Session expired** | SessionExpired dialog (O §16.1) | dirty values kept in `sessionStorage` | "Your session expired. Sign in again to keep working. Edits on this page stay on this device." |
| **Success** | meta updates when the page status changes | Section: "Saved 11:24 am". Action: the object's new state. Toast only for off-screen or async results | "Invites sent to 3 people" · "Export ready · Download" |

---

## 7. The pages

Every page uses the frame (§3), the save models (§4), the danger rules (§5) and the state matrix (§6). Each page below adds only what is specific to it: job, findings, hierarchy, column layout, sections with components, states and copy, interactions, microcopy, accessibility, telemetry and acceptance. Wireframes show the page column; the frame around it is §3.4–3.5.

### 7.0 Overview (`/settings`)

**Job.** *When something isn't working (we can't call, an app dropped off), show me what needs attention and take me straight there; otherwise, let me find any setting.* It is also the phone and tablet index (§3.5) and the landing page of the nav badge.

**Findings:** F-UX-027, F-RWD-001, EXPLORE-SETTINGS-08 (no phone entry, 2,300 px strip), F-UX-015 (the "Verify" badge needs an explanation).

**Hierarchy.** 1) The attention Notice, if anything needs you. 2) The grouped list. 3) Each row's status.

```
Settings ›                                  (breadcrumb hidden on the Overview itself)
Settings      Sample Realty · You're an admin
──────────────────────────────────────────────────────────────────────
⚠ 2 things need attention
  Caller ID isn't verified. Customers see an unknown number.   Verify
  Google needs you to sign in again.                        Reconnect
──────────────────────────────────────────────────────────────────────
Your account
 [user] Profile          Your name, mobile and WhatsApp number…     Anika R.        ›
 [bell] Notifications    What we email or WhatsApp you about        Email on · WhatsApp off
 [shield] Security         Email address, password, two-factor…      Two-factor off   ›
Workspace
 [bldg] Organization and team  …                                   4 people · 1 invite pending
 [plug] Integrations     …                                         3 connected · 1 needs you
 …
Data
 [trash] Delete account   Close your account                                         ›
```

| Part | Component and configuration |
|---|---|
| Header | PageHeader `page` variant (no breadcrumb), H1 "Settings", meta = workspace name · your role |
| Attention | Notice `warning`, scope `section`, title "{n} things need attention", body = up to 3 rows (sentence + action link), sorted by severity: no workspace admin → no inbound number or caller ID unverified → integration needs reconnect → webhook failing → two-factor off (advisory, dismissible for you). Absent when nothing is wrong. Never "All good" |
| List | **SettingsIndex** `variant="overview"` (§14): one `<ul>` per group under a `label-12` group label; rows 56 px: icon 16 `--text-3`, label `label-13` `--text`, description `meta-12` `--text-3` (hidden below 480 px), status `meta-12` `--text-2` right-aligned (a warning status gets `alert-triangle` 12 in `--warning-text` plus the word), chevron. The row is one link |

**States.** Loading: rows render from config at once; statuses are 40 % skeleton bars, never "0". Status load failed: statuses hidden and the meta reads "Couldn't load status · Retry". Member: rows for pages they can only read show "View only" as the status.

**Interactions.** ↑/↓ are not bound (rows are links; Tab moves). ⌘K "Settings: Phone setup" lands on the page, not here. Action links in the Notice deep-link to the section (`/settings/phone#caller-id`).

**Acceptance.**
- [ ] `/settings` renders the Overview at every width and is the target of the More sheet's Settings row and the TopBar's "‹ Settings".
- [ ] Every attention row is computed from `useWorkspaceState()`; with nothing wrong, no Notice renders.
- [ ] Each row's link lands on the page, and each attention link on the right section with focus on its heading.

### 7.1 Profile (`/settings/profile`)

**Job.** *Keep my name and numbers right, and make the app behave the way I work.* Personal only: no workspace settings, no integrations (F-UX-041).

**Findings:** F-UX-041, F-UX-012, F-QA-021, F-A11Y-003 (labels without `for`), F-A11Y-004 (shortcut off switch), F-A11Y-030 (tab order), F-VIS-032 (theme toggle), EXPLORE-SETTINGS-11 (backticks, "once or twice").

**Hierarchy.** 1) Personal details (the fields). 2) WhatsApp number and its verification state. 3) Preferences.

```
Settings ›
Profile      Anika R. · Admin in Sample Realty
─────────────────────────────────────────────────────────────
Personal details                                     [link]
Full name
[ Anika R.                                          ]
Email
anika@sample.in                      Change in Security
Mobile number (optional)
[+91│ 98765 43210        ]
Teammates and Vaani Labs support can reach you here. It isn't a caller ID.
Unsaved changes · 1 field                 [Discard] [Save changes]
─────────────────────────────────────────────────────────────
WhatsApp number                                      [link]
Get alerts on WhatsApp. We send a code to check the number.
+91 98765 •••• 43   ✓ Verified 21 Sep 2026        Change…  ⋯
─────────────────────────────────────────────────────────────
Preferences                                          [link]
Theme                                   (System | Light | Dark)
Single-key shortcuts                                     [on]
Turn off if you use speech input or a switch device.
Table density                             (Standard | Compact)
Time zone            India Standard Time (IST) · set by the workspace
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Personal details (`#details`) | Section form | Field + TextInput "Full name" (required, 2–60, `autocomplete="name"`); KeyValueList `rows` "Email" = the sign-in email with link "Change in Security" → `/settings/security#email` (read-only here, so there is one place to change it); Field + PhoneInput `kind="mobile"` "Mobile number" (optional, hint above) |
| WhatsApp number (`#whatsapp`) | Action | SettingRow with the state: *none* "Not added" + secondary sm **Add WhatsApp number…**; *code sent* "Code sent to +91 98765 43210 at 10:42 am" + **Enter code…**; *verified* PhoneText masked + StatusText success "Verified 21 Sep 2026" + link **Change…** + `⋯` (Remove…). Dialog `sm` "Add WhatsApp number": Checkbox "Same as my mobile number" (shown when a mobile exists, default on), else PhoneInput `kind="mobile"`; **Send code**; step 2: TextInput code (`inputmode="numeric"`, `autocomplete="one-time-code"`, width 180), "Resend code" (enabled after 30 s, the countdown in the hint), **Verify** |
| Preferences (`#preferences`) | Instant | SettingRow + SegmentedControl "Theme" (System · Light · Dark; writes `localStorage` and the user preference only, never a record; DESIGN-SYSTEM-08); SettingRow + Switch "Single-key shortcuts" (same state as the account menu item, Shell §9.2); SettingRow + SegmentedControl "Table density" (Standard · Compact; the default for data tables, Shift+D still switches per table); SettingRow read-only "Time zone" |

**States and copy.**

| State | Copy |
|---|---|
| Name empty on save | "Enter your name." |
| Mobile invalid (on blur) | "Enter a 10-digit mobile number, like 98765 43210." (C §4.1) |
| WhatsApp code wrong / expired | "That code isn't right. Check the latest WhatsApp message." · "That code has expired. **Resend code**" |
| WhatsApp number can't receive messages | "We couldn't send a WhatsApp message to this number. Check it has WhatsApp, then try again." |
| Remove WhatsApp when alerts use it (tier 2) | "Remove your WhatsApp number? 4 alerts will stop coming on WhatsApp. Email alerts are not affected." |
| ST4 not shipped | the WhatsApp section is hidden, and Notifications shows email only |

**Interactions.** ⌘/Ctrl+S saves Personal details from any of its fields. Tab order follows the visual order (F-A11Y-030). The theme and density controls apply instantly to the page you are on.

**Microcopy.** "Profile Settings / Update your personal information" → H1 "Profile" · "FULL NAME", "PHONE" (placeholder "+91…") → "Full name", "Mobile number (optional)" with the hint · "§ IDENTITY · STATUS APPROVED" → removed · header "Save Changes" → the section's "Save changes", shown only when dirty · "DARK" beside a sun → Theme: System · Light · Dark.

**Accessibility.** Every field in a Field (`<label for>`); the email is a `<dl>` row, not a disabled input. The theme SegmentedControl is a radio group (C §6.4). The shortcuts switch's description is linked by `aria-describedby`.

**Acceptance.**
- [ ] Profile contains no workspace, integration or billing setting; the subdomain, brochure, Google and Microsoft appear on their new pages (§2.2).
- [ ] Typing "abc" in Mobile number and tabbing away shows the mobile error; Save stays enabled and reports it on click (C §8.2).
- [ ] Changing theme or density sends no request other than the user-preference write (network log).
- [ ] Turning off single-key shortcuts here turns them off in the account menu and vice versa.

### 7.2 Organization and team (`/settings/organization`)

**Job.** *Make this workspace ours: its name and address, who is in it, what they can do, and the files our agent sends.* This is the page that must never dead-end (F-UX-001, critical).

**Findings:** F-UX-001, EXPLORE-SETTINGS-02 (circular create), F-UX-041 (subdomain and brochure moved here), F-UX-029 (identity), F-UX-035 (danger placement), F-A11Y-003 (brochure file input), EXPLORE-SETTINGS-11 ("once or twice", backticks).

**Hierarchy.** 1) Members and the Invite button (the most frequent job after setup). 2) Workspace name and address. 3) Shared assets. 4) Danger zone.

Section order puts Workspace first because it is short and defines what the page is about; the header's primary is **Invite…**, so the frequent job is one click from the top.

```
Settings ›
Organization and team    Sample Realty · 4 people · 1 invite pending        [Invite…]
──────────────────────────────────────────────────────────────────────────────
Workspace
Workspace name   [ Sample Realty                        ]
Workspace address
[ sample-realty                  ].vaanilabs.in   ✓ Available
Used in links you share. You can change it 2 more times. Old links keep working.
──────────────────────────────────────────────────────────────────────────────
Members
Person                              Role          Last active
(AR) Anika R.  You                  Admin ▾       Today 10:42 am        ⋯
(DS) Dev S.                         Admin ▾       Yesterday             ⋯
(MK) Meera K.                       Member ▾      3 days ago            ⋯
     r•••@sample.in                 Member        Invited · expires in 6 days  ⋯
▸ What each role can do
──────────────────────────────────────────────────────────────────────────────
Shared assets
WhatsApp brochure (optional)
[Choose file]  brochure.pdf · 1.2 MB · uploaded 21 Sep 2026 · Replace · Remove
Your agent sends it on WhatsApp when a caller asks for details. PDF, JPG or PNG, up to 10 MB.
──────────────────────────────────────────────────────────────────────────────
┌ Danger zone ──────────────────────────────────────────────────────────────┐
│ Leave Sample Realty …                                  [Leave workspace…]  │
│ Delete workspace …                                    [Delete workspace…]  │
└────────────────────────────────────────────────────────────────────────────┘
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Workspace (`#workspace`) | Section form | Field + TextInput "Workspace name" (required, 2–60); Field + TextInput "Workspace address" with trailing `.vaanilabs.in` and the async availability check (C §3.2: "Checking availability…" → "Available" or "Taken. Try sample-realty-2"), `spellcheck="false"`; the remaining change count from the server. On Save with a new address: ConfirmDialog tier 2 "Change your workspace address to sample-homes.vaanilabs.in?" · "Links with the old address keep working. Bookmarks may need updating. You can change it 1 more time after this." · Cancel · **Change address**. With 0 changes left the field is read-only: "You've used both address changes. Contact support to change it again." |
| Members (`#members`) | Action | DataTable (form width, Standard density): Person (Avatar 28 + name `label-13`, email `meta-12` `--text-3`, Tag outline "You"), Role (admins: Select `sm` Admin · Member, each change a tier-2 confirm; members: text), Last active (`formatWhen`) or Tag outline "Invited" + "expires in 6 days", `⋯` (Resend invite · Revoke invite · separator · Remove from workspace…). SearchInput "Search people" only above 10 members. Collapsible "What each role can do" with KeyValueList `rows`. Invite… opens Dialog `md` "Invite teammates": Field + Textarea "Email addresses" (hint "Separate with commas or new lines. Up to 20."), RadioGroup `card` "Role" (Member, default: "Flows, leads, calls and reports." · Admin: "Everything, including phone setup, integrations, keys and teammates."), primary "Send {3} invites" |
| Shared assets (`#assets`) | Action | FileField `single` "WhatsApp brochure" (C §7.2): uploads on choose with a ProgressBar; "Used by: Send WhatsApp in 2 flows" (links) when ST6 knows; Remove per §5.2 |
| Danger zone (`#danger`) | Guarded | DangerZone: Leave workspace… (tier 2), Delete workspace… (admins; tier 3 + Confirm it's you; ST13) |

**States and copy.**

| State | Treatment and copy |
|---|---|
| **No workspace** (an account outside any workspace, today's dead end) | EmptyState first-use in the column: title "You're not in a workspace yet", body "Create one for your team, or ask a teammate to invite you. Invites, phone setup and integrations live in a workspace.", primary **Create workspace…** (Dialog `md` with Shell §12.2's name and address fields), link "How invites work". Integrations and Phone setup show the compact variant with the same action |
| **No admin** (ST1 not yet run) | page Notice `warning`: "This workspace has no admin, so nobody can invite teammates or connect apps. **Contact support** to assign one." Once the repair ships this state cannot occur; it is logged if it does |
| Member view | Workspace read-only; Role as text; no `⋯` except on your own row (Leave…); Invite hidden; page Notice "Only admins can invite teammates or change the workspace. Ask an admin: Anika R. or Dev S." |
| Only member | the table shows you, then a compact EmptyState row: "Invite teammates to share flows, leads and call reports." + Invite… |
| Invite errors | in the dialog: "2 addresses aren't valid: r@ and sales@@x.in." · "meera@sample.in is already in the workspace." (the other invites still go) |
| Invites sent | toast "Invites sent to 3 people"; rows appear as Invited |
| Sole admin | your Role Select aria-disabled "You're the only admin"; Leave aria-disabled "You're the only admin. Make someone else an admin first, or delete the workspace." |
| Address taken on save (race) | field error "Someone just took sample-homes. Try sample-homes-in." |

**Interactions.** The workspace switcher's "Invite teammates…" opens `/settings/organization?invite=1` (the dialog over this page). Role changes never apply on selection alone: the Select opens the confirmation, and Cancel restores the old value.

**Microcopy.** "You aren't an admin of any organization yet… or create your own org below." → the No-workspace or No-admin states above · "Browse organizations →" → removed · "{slug}.vaanilabs.in" with backticks and "change it once or twice" → the rendered address and "You can change it 2 more times." · "Organization" (mono 24 px H1) → "Organization and team".

**Accessibility.** The Role Select's name includes the person ("Role for Dev S."); `⋯` is "More actions for Dev S."; the invited row reads "r•••@sample.in, invited, expires in 6 days". The FileField's hidden input is labelled "WhatsApp brochure".

**Acceptance.**
- [ ] An account with no workspace can create one from this page and reach an enabled Connect button on Integrations in one flow (the E2E test F-UX-001 asks for).
- [ ] No text on the page says "create below" without a create control below; `/admin/organizations` redirects here.
- [ ] A member sees no enabled control except Leave; every read-only area names the admins.
- [ ] Changing a role, removing a person and deleting the workspace each require their tier (§5.2) and write an Activity entry.

---

### 7.3 Notifications (`/settings/notifications`)

**Job.** *Choose which events reach me outside the app, by email or WhatsApp, and trust that the important ones can't be missed.* Events and defaults come from the shell's routing table (Shell §11.1); this page is where each person tunes them.

**Findings:** F-UX-041 (WhatsApp card points to a field that doesn't exist), F-UX-027 (four back links), F-VIS-005 (two-tone 28 px editorial heading), F-A11Y-008 (mono helper text). Kept: "Changes save automatically" and switches with `role="switch"`.

**Hierarchy.** 1) Where alerts go (email, WhatsApp) and whether WhatsApp works. 2) The event groups. 3) Reset to defaults (quiet).

```
Settings ›
Notifications     Changes save automatically                      [Reset to defaults]
─────────────────────────────────────────────────────────────────────────────────
Deliver to
Email        anika@sample.in                                   Change in Security
WhatsApp     Not added. Add a number in Profile to get alerts there.    Add number
─────────────────────────────────────────────────────────────────────────────────
Calls and leads                                              Email      WhatsApp
Call summaries                                                [on]      [off]⁽ⁱ⁾
After each call: the outcome and a short summary.
Batch finished                                                [on]      [off]
Callbacks due today                                           [off]     [off]
A digest at 9:00 am IST.
─────────────────────────────────────────────────────────────────────────────────
Money
Wallet low or empty                                           [on]      [off]
When about an hour of calls is left, and when it reaches ₹0.
Autopay couldn't top up                                       [on]      [off]
Payment receipts                                              [on]        –
… Tasks and approvals · Workspace · Security · News
```
⁽ⁱ⁾ WhatsApp switches are disabled with the column's reason while no verified number exists.

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Deliver to (`#deliver-to`) | read-only | KeyValueList `rows`: Email (the sign-in email, link "Change in Security"); WhatsApp (verified number masked + StatusText success "Verified", or "Not added" + link **Add number** → `/settings/profile#whatsapp`, which focuses that section) |
| Event groups (`#calls` `#money` `#tasks` `#workspace` `#security` `#news`) | Instant | **NotificationMatrix** (a SettingRow list with two switch columns, §14): each row = label `body-14` + description `meta-12` `--text-3`; column headers "Email" and "WhatsApp" repeat per group (`label-12` `--text-3`) so a group reads on its own; each cell a Switch whose name is "{Channel} for {event}" |
| Reset to defaults | Action | tertiary Button in the page header; resets at once and shows the toast "Notification settings reset · Undo" (tier 1) |

**Events and defaults** (from Shell §11.1; role-only rows are hidden for members):

| Group | Event | Email | WhatsApp | Notes |
|---|---|---|---|---|
| Calls and leads | Call summaries | on | off | per call; today's "Call summaries" switch |
| | Batch finished | on | off | |
| | Callbacks due today | off | off | 9:00 am IST digest |
| Money | Wallet low or empty | on (admins) | off | threshold per Shell open question 3 |
| | Autopay couldn't top up | on (admins) | off | |
| | Payment receipts | on | not offered ("–") | receipts are documents |
| Tasks and approvals | A task needs your confirmation | on | on | Personal agents; these block the task |
| | Knowledge proposals to review | off | off | admins |
| Workspace | Number or caller ID status changed | on (admins) | off | |
| | Calling incident or maintenance | on (admins) | off | |
| | A teammate published a flow | off | off | |
| Security | New sign-ins, password or email changes | **always on** | off | the email switch is on and aria-disabled: "Security alerts can't be turned off." |
| News | Product updates | off | not offered | |

**States and copy.** Loading: rows render with switch skeletons (20 × 32 blocks). A switch that fails to save reverts and shows "Couldn't save. **Retry**" in its row (C §6.3). WhatsApp not verified: every WhatsApp switch is aria-disabled with the column reason "Add a WhatsApp number in Profile to get these on WhatsApp." (one sentence at the column header, linked by `aria-describedby` from each switch). ST5 not shipped: only the four events that exist today render, mapped to their rows. ST4 not shipped: the WhatsApp column and row are hidden, not locked.

**Phone.** One channel at a time: a full-width SegmentedControl "Email · WhatsApp" under the header (`?channel=`), then one switch per event row; the group headers stay.

**Microcopy.** "[bell] NOTIFICATIONS" + "Choose how Vaani Labs / reaches you." (two-tone) → H1 "Notifications", meta "Changes save automatically" · "LOCKED · No number on file · Add a WhatsApp number first → back to settings" → "Not added. Add a number in Profile to get alerts there. **Add number**" · "Low balance · Heads-up when minutes or call credits drop below your safety floor" → "Wallet low or empty · When about an hour of calls is left, and when it reaches ₹0." · "RESET TO DEFAULTS" (disabled) → "Reset to defaults" (tertiary, works, with Undo).

**Accessibility.** Each group is a `<section>` with an `h2`; the switch grid is not a table (each row is a `role="group"` labelled by the event) so screen readers hear "Call summaries, Email, switch, on". State changes are not announced beyond the switch's own state; failures are (`role="status"`).

**Acceptance.**
- [ ] No link on the page leads to a field that doesn't exist; "Add number" lands on Profile › WhatsApp number with focus on its heading.
- [ ] Every switch saves on change with "Saved", and reverts with Retry on failure.
- [ ] Security email alerts cannot be turned off, and say why.

### 7.4 Integrations (`/settings/integrations`)

**Job.** *Connect the tools my agent and team already use, see that each connection really works, and fix or remove it without breaking live calls.*

**Findings:** F-UX-001 (all five Connects disabled, reason below the fold, raw `/admin/organizations` link), F-UX-041 (integrations split four ways), F-UX-016 and EXPLORE-SETTINGS-11 ("stub row until app-review credentials are ready", "two-way sync deferred", "during pilot calls"), F-VIS-031 (a lightning bolt for HubSpot, a cloud for Salesforce), F-FLOW-030 (integration dependencies not shown in flows).

**Hierarchy.** 1) Anything that needs you (a section Notice: "Google needs you to sign in again"). 2) *Your connections* (you can always act on these). 3) *Workspace connections* (admins act; members see status).

```
Settings ›
Integrations     3 connected · 1 needs you
──────────────────────────────────────────────────────────────────────────────
Your connections
Your own accounts. Only you can use them, for example to book on your calendar.
▣ Google         Send email from Gmail and add meetings    ⚠ Reconnect needed  [Reconnect…]
                 to your Google Calendar.
▣ Microsoft      Send email from Outlook and add meetings    Not connected      [Connect…]
                 to your Outlook calendar.
▣ Calendly       Let your agent book on your event types.  ✓ Connected as anika@…  [Manage]
──────────────────────────────────────────────────────────────────────────────
Workspace connections
Shared by everyone in Sample Realty. Only admins can connect or remove them.
▣ WhatsApp Business   Send and receive messages as your business…   ✓ Connected   [Manage]
▣ HubSpot             Send call outcomes and new leads to HubSpot…    Not connected [Connect…]
▣ Salesforce          Let your agent look up contacts during calls.   Not connected [Connect…]
▣ Instagram           Capture leads from Instagram lead ads.          Coming soon
▣ Facebook            Capture leads from Facebook lead forms.         Coming soon
```

(▣ is a **ServiceMark**: the vendor's single-colour mark in `--text` on a neutral 28 px tile. Never a letter, never a brand-coloured square.)

**IntegrationRow** (new, §14): grid `28px minmax(0,1fr) auto auto`, gap `space-12`, min-height 64, hairline between rows. A **ServiceMark** `md` (new, §14): a 28 px tile (`--surface-2` fill, 1 px `--border`, radius 6) holding the vendor's official **single-colour** mark at 16 px (`--icon-md`) in `--text` (`currentColor`, so dark mode needs nothing extra). Then the name `title-14`, the purpose `body-14` `--text-2` (one sentence, no vendor internals), the status and one action. Rows in a group sort: needs attention → connected → available → coming soon.

**Service marks: the rule.** A letter in a coloured square ("G", "W", "IG") is a pseudo-icon and is banned (direction anti-pattern 10, F-VIS-031); so are brand-coloured fills, which also bring back the magenta and violet the direction removed (anti-pattern 3). Each integration shows:
1. **The vendor's official single-colour mark**, from its brand or press kit and used as its guidelines allow (most allow a one-colour version of the glyph; the wordmark is never used). Simple Icons (CC0 SVG paths) is a convenient source where the brand is listed; check the vendor's current guidelines at build time and record the choice in `components/brand/service-marks.ts`, so every surface draws the same mark.
2. **Otherwise, a Lucide category glyph** in the same tile, colour and size, when a vendor's guidelines forbid a recoloured mark, the mark isn't legible at 16 px, or it isn't available yet. The glyph names the job, not the company.

| App | Mark | Fallback glyph (Lucide) |
|---|---|---|
| Google | Google "G" glyph, single colour | `mail` |
| Microsoft | Microsoft four-square glyph, single colour | `mail` |
| Calendly | Calendly glyph, single colour | `calendar-clock` |
| WhatsApp Business | WhatsApp glyph, single colour | `message-circle` |
| HubSpot | HubSpot sprocket, single colour | `database` |
| Salesforce | Salesforce cloud glyph, single colour | `database` |
| Instagram | Instagram glyph (camera outline), single colour | `megaphone` |
| Facebook | Facebook "f" glyph, single colour | `megaphone` |

The one exception in the product is the sign-in button ("Continue with Google", `08-public-auth` §18): identity providers' button guidelines require their full-colour mark there, so `OAuthButton` keeps it. Everywhere else (this page, the Manage sheet header, the Flow Designer's IntegrationStatusRow, Personal agents' contact choices, Leads' Source cell) the mark is single-colour.

| Status | Status slot | Action slot |
|---|---|---|
| Not connected | "Not connected" `meta-12` `--text-3` | secondary sm **Connect…** |
| Connecting (back from OAuth, finishing) | StatusText progress "Finishing connection…" | none |
| Connected | Tag success "Connected" + `meta-12` "as anika@sample.in · since 21 Sep 2026" | tertiary sm **Manage** |
| Needs attention (token expired, permission removed) | Tag warning "Reconnect needed"; section Notice names the effect | secondary sm **Reconnect…** |
| Coming soon (not available for anyone yet) | Tag outline "Coming soon" | none; no disabled button, no stub copy |
| Admins only (member looking at a workspace app) | status as above (Connected or Not connected) | Tag outline with `lock` 12 "Admins only"; the group description already names the admins |

**Connect… (Action).** Opens a Dialog `sm` before leaving the app (the Calendly strength, applied to every OAuth app): title "Connect HubSpot"; body "You'll sign in to HubSpot in a new window and allow Vaani Labs to:" + a list of the scopes in plain words ("Create and update contacts", "Log calls on contacts"); footer Cancel · **Continue to HubSpot** (`external-link`, new window). The page shows "Finishing connection…" on return (`?connected=hubspot`), then the Connected row and the toast "HubSpot connected". On `?connect_error=`: an InlineError under that row: "HubSpot didn't connect. You closed the sign-in window. **Try again**" · "HubSpot said no: your account can't grant contact access. Ask your HubSpot admin. **Details**". Query params are removed with `replaceState` after reading.

**Manage (Sheet `detail`, 440; `?manage=hubspot`).** PageHeader `sheet` with the app's ServiceMark `md`, its name and its status Tag; KeyValueList `inline`: Connected as · Connected by · Since · Permissions · **Used by** (links to flow steps, "CRM lookup · Site-visit qualifier v7", ST6); app options as Instant SettingRows with Switches ("Create HubSpot contacts for new leads", "Log each call on the contact"); a note in plain words where behaviour is limited ("Sync goes one way: changes in HubSpot don't come back."); a DangerZone with one row, **Disconnect HubSpot…** (§5.2).

**Empty and disabled states (the core of this page's redesign).**

| Situation | What renders | Copy |
|---|---|---|
| Nothing connected yet | the list itself; meta "None connected"; no extra empty state | |
| Member | Workspace group description + a neutral Notice (inline): "Only admins can connect workspace apps. Ask an admin: Anika R. or Dev S."; rows show status and "Admins only" | never five disabled buttons with the reason below the fold |
| No workspace (§7.2) | the Workspace group becomes EmptyState compact | "Create a workspace to connect apps for your team. **Create workspace…**" |
| Provider outage | the row's status "Can't reach HubSpot right now" (warning StatusText) + Retry; Connect stays available | |
| App not yet available (e.g. Meta app review pending) | "Coming soon" | not "stub row until app-review credentials are ready" |
| Integration used by a live flow is disconnected | Notice `warning` at the top of the group, plus the Flow Designer validator warning "a disconnected integration" (D §6.5) | "2 live flows use Google Calendar. Meetings can't be booked until you reconnect. **Reconnect**" |

**Keyboard.** Each row has one tab stop for its action; Manage opens the sheet with focus on its title and returns focus to the row's Manage on close (O §4.4). Anchors `#calendly` etc. focus the row.

**Microcopy.** "Pipe leads in from social platforms; push call activity out to your CRM. … Meta surfaces still create a stub row until app-review credentials are ready." → group descriptions above · "Same Meta App; separate webhook surface" → "Capture leads from Facebook lead forms and Messenger." · "Two-way sync deferred to a follow-up." → "Sync goes one way: changes in HubSpot don't come back." · "Connect Salesforce OAuth so lookup connectors can read Contacts during pilot calls." → "Let your agent look up Salesforce contacts during calls." · "…create your own org from /admin/organizations" → "Ask an admin: Anika R." (or Create workspace…) · "+ Connect Instagram" (disabled) → "Coming soon".

**Accessibility.** ServiceMarks are `aria-hidden`; the row's name is the app name. The tile's glyph is ≥ 3:1 on `--surface-2` in both themes (`--text` on `--surface-2`: 16.13:1 light, 14.00:1 dark), and in forced colours the glyph renders as `CanvasText` and the tile border as `CanvasText`. Status words always accompany the Tag colour. The OAuth window opens only from the dialog's button (never on page load), and the dialog says a new window will open.

**Acceptance.**
- [ ] For an admin in a fresh workspace, every available app has an enabled Connect….
- [ ] A member sees one sentence naming the admins, and no disabled Connect buttons.
- [ ] No row contains an engineering note, vendor internal or raw path (banned-strings lint).
- [ ] No integration shows a letter tile or a brand-coloured fill: every mark is the single-colour ServiceMark (or its Lucide fallback) in `--text` on the `--surface-2` tile, in light and dark (F-VIS-031, direction anti-patterns 3 and 10).
- [ ] Disconnecting an app used by a live flow names the flows in the confirmation.

### 7.5 Assistant (`/settings/assistant`)

**Job.** *Decide how much the Assistant may do on its own in this workspace, and pick a stricter mode for myself if I want.* Content and rules belong to the Assistant spec (`03-pages/02-assistant` §10.2); this page hosts its **AssistantPermissions** section (assistant spec §19).

**Findings:** F-UX-022 (the Assistant could act without approval; its permissions need a home). Reconciliation R3 (§15): the Assistant spec's "Settings › Workspace › Assistant" resolves to this page.

| Section (anchor) | Model | Components |
|---|---|---|
| Workspace mode (`#workspace-mode`) | Section form (admins; read-only for members) | RadioGroup `card` with the three modes and their sentences: "Suggests steps. You make every change." · "Asks before changing anything." (default) · "Makes undoable changes, asks for the rest." |
| Your mode (`#your-mode`) | Section form | the same RadioGroup, where options looser than the workspace mode are aria-disabled with "Your workspace allows up to 'Asks before changing anything'." |
| Always, in every mode | read-only | KeyValueList `rows` titled "Always, in every mode": calls go through the Call gate · publishing goes through the Publish gate · deleting always asks · it acts with your role's permissions · it can't top up, change billing or change settings |

Saving either mode writes an Activity entry. ST14 not shipped: the page is hidden from the SettingsNav and the Assistant stays at mode 2 (assistant spec dependency 4).

**Acceptance.**
- [ ] A member cannot choose a mode looser than the workspace's; the disabled options say why.
- [ ] The "Always" list matches the Assistant spec word for word (one string source).

---

### 7.6 Phone setup (`/settings/phone`)

**Job.** *Get our numbers right so customers can reach the agent and recognise us when it calls: an inbound number that answers with the right flow, a verified caller ID, a place for transfers to ring, and hours when calls may start. Then prove it with a call to myself.* It is setup step 2 of Home (Shell §13.3) and the target of the "Verify" badge.

**Findings:** F-UX-015 (telephony split across five pages, four names, "Allocate a number from billing"), EXPLORE-SETTINGS (Call channel "Heads up… until the softphone bridge ships" while Rep console exists; "Save preference" greyed without a reason; "Send code" enabled for "abc"; pill buttons), F-QA-021, F-UX-013 (calling hours where calls start), F-UX-006 (no premature "live"). Kept: the Owned → Compliance → Authorized stepper.

**Hierarchy.** 1) The header status: can this workspace take and place calls? 2) The first section that is not done (its section Notice and primary). 3) The done sections, each one line of proof. 4) Test call. 5) Danger zone.

```
Settings ›
Phone setup    Inbound ready · Caller ID verifying (2 of 3)
─────────────────────────────────────────────────────────────────────────────
Inbound number                                                         [link]
Callers who ring this number reach your agent.
Number        +91 80 •••• 2210  [copy]              ✓ Ready
Answers with  Site-visit qualifier · ● Live v7                Change flow…
Since         12 Sep 2026
─────────────────────────────────────────────────────────────────────────────
Caller ID                                                              [link]
The number customers see when your agent calls them.
⚠ Phone calls can't be placed until this is verified.
 ✓ Owned          +91 98765 43210 · code confirmed 21 Sep
 ◌ Compliance     Checking the number is registered to your business.
 ○ Authorized     The carrier approves it as your caller ID.
─────────────────────────────────────────────────────────────────────────────
Transfers                                                              [link]
When a caller asks for a person, the agent transfers the call to:
 (•) A phone number                   ( ) Rep console, then a phone number
     Transfer number [+91│ 98765 43210        ]   Use my mobile number
 Unsaved changes · 1 field                          [Discard] [Save changes]
─────────────────────────────────────────────────────────────────────────────
Calling hours · IST                                                    [link]
Outbound calls and batches start only inside these hours.
 Mon [on]  10:00 am IST  to  7:00 pm IST          Copy to weekdays
 …
─────────────────────────────────────────────────────────────────────────────
Test call
Hear what callers hear. We call your mobile with the live flow.  [Call yourself…]
Last test: Today 10:42 am · Connected · 1m 12s · Open report
─────────────────────────────────────────────────────────────────────────────
┌ Danger zone: Release inbound number… · Remove caller ID… ─────────────────┐
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Inbound number (`#inbound`) | Action | *None:* EmptyState compact "No inbound number yet. Callers can't reach your agent." + secondary **Request a number…** (Dialog `sm`: Field TextInput "Preferred area code (optional)" 180 wide, hint "Like 80 for Bengaluru. We'll offer the nearest available."; primary "Send request"). Until ST7 ships the action is a "Contact us for a number" link. *Requested:* StatusText progress "Requested 21 Sep 2026" (+ "usually 1 working day" only with a real SLA). *Active:* KeyValueList `rows`: Number (PhoneText masked, `mono-13`, Copy copies the full number for admins), status StatusText ("Ready" success, or warning "Not answering: no live flow. **Publish a flow**"), Answers with (the flow name + Tag "Live v7", link **Change flow…**: FlowSwitcher purpose `inbound`, live flows only (C §5.4), then a tier-2 confirm "Answer +91 80 •••• 2210 with EMI reminder v3? New calls hear it from now on. Calls in progress stay on Site-visit qualifier."), Since |
| Caller ID (`#caller-id`) | Action | StageProgress (O §14.3) with three stages, the current one expanded in place. *Owned:* Field + PhoneInput `kind="any"` "Number to verify" (hint "A mobile, or a landline with its STD code"), SegmentedControl "Send the code by" (Text · Call; landlines force Call), primary **Send code**; then the code TextInput (`one-time-code`, 180) + **Verify** + "Resend code" after 30 s + "Change number". *Compliance / Authorized:* StatusText progress with what is happening; if the server asks for a document, a FileField with the named document (ST7). *Verified:* KeyValueList: Caller ID (masked) · StatusText success "Verified 21 Sep 2026" · "Used for every outbound call and batch" · link **Replace number…** (starts a new verification; "Your current caller ID stays in use until the new one is verified."). *Failed:* danger StatusText "Compliance check failed: the number isn't registered to Sample Realty. **Details** · **Start again**" |
| Transfers (`#transfer`) | Section form | RadioGroup `card` (C §6.2): "A phone number" · "Rep console, then a phone number" ("Reps online in Rep console get the call in their browser. If no one picks up in 20 s, it rings the transfer number."). Field + PhoneInput `kind="any"` `allowInternational` "Transfer number" (required for both), link "Use my mobile number" (fills from Profile). A changed route confirms (tier 2): "Send transfers to Rep console first? From now on, transfers ring reps who are online, then +91 98765 43210. Calls in progress aren't affected." The Rep console option is **hidden** while the browser bridge is not live (P1), never offered with a "Heads up" |
| Calling hours (`#hours`) | Section form | **CallingHours** recipe (C §7.1): 7 rows (day, Switch "Open", TimeField from and to, "IST"); link "Copy Monday to weekdays"; hint "Outbound calls and batches start only inside these hours. The Call gate blocks a start outside them." The page meta and the Call gate's blocking check read this value ("Outside calling hours. Opens 10 am IST.") |
| Test call (`#test`) | Action | secondary **Call yourself…** → the Call gate aimed at your verified mobile (D §6.6, tier 4); aria-disabled with the first missing reason: "Verify a caller ID first." · "Publish a flow first." · "Wallet is ₹0. **Top up** to place calls." · "Add your mobile number in Profile." Last test: StatusText + link to its call report |
| Danger zone (`#danger`) | Guarded | Release inbound number… (tier 3, type the last 4 digits, Confirm it's you); Remove caller ID… (tier 2). Hidden rows when there is nothing to release |

**States and copy.**

| State | Copy |
|---|---|
| Header meta (computed) | "Inbound ready · Caller ID verified" · "No inbound number · Caller ID not verified" · "Inbound ready · Caller ID verifying (2 of 3)" |
| Caller ID not verified (section Notice, warning) | "Phone calls can't be placed until this is verified." |
| Invalid number on Send code | "Enter a phone number with its STD code, like 80 4567 2210." (the code is never sent for an invalid number, F-QA-021) |
| Code wrong / too many tries | "That code isn't right. Check the latest message." · "Too many tries. Request a new code in 10 min." |
| Transfer number missing | "Enter the number transfers should ring." |
| Hours invalid | "End after the start time." |
| Member | page Notice "Only admins can change phone setup. Ask an admin: Anika R. or Dev S."; numbers masked, no Copy; Test call stays available |
| Loading | FormSkeleton per section; the header meta skeleton; never a flash of "Inbound voice agent — callers reach your Vaani agent here." (F-UX-015) |

**Phone and tablet.** Same order; StageProgress stays vertical; the RadioGroup cards stack; CallingHours rows become two lines (day + switch / from–to); Change flow… opens the FlowSwitcher as a bottom sheet.

**Microcopy.** "Call channel" → "Transfers" · "Phone (PSTN) · Agent forwards the caller to your phone number" → "A phone number" with the number shown and editable · "Browser softphone" / "Auto (browser if online, else phone)" → "Rep console, then a phone number" · "Heads up: Browser/Auto channels currently fall back to PSTN until the in-browser softphone bridge ships" → removed (the option is hidden until it works) · "Your calling number" → "Caller ID" · "Step 1 — verify ownership" → "Owned" stage · "ALLOCATED DID · PENDING · Allocate a number from billing" (Analytics) → "No inbound number yet" here, linked from Analytics (call-reports spec) · "Save preference" (grey, no reason) → the Transfers SectionFooter, shown only when dirty.

**Accessibility.** StageProgress is an `<ol>` with each stage's state in words ("Owned, done", "Compliance, in progress"). The code field has `autocomplete="one-time-code"`. The Change-flow confirmation names both flows. CallingHours rows are `fieldset`s labelled by the day.

**Telemetry.** `phone_setup_view` {inboundState, callerIdStage}; `caller_id_verify_step` {stage, result}; `inbound_flow_change` {result}; `transfer_route_save` {route}; `test_call_open` {blockedReason?}.

**Acceptance.**
- [ ] Inbound number, caller ID, transfers, calling hours and the test call are all on this page, and the old routes redirect to their anchors.
- [ ] "Send code" never sends to an invalid number; the error appears under the field.
- [ ] No option is offered that does not work; no "Heads up" copy remains.
- [ ] The nav "Verify" badge, the Baseline line segment, Home step 2 and this page's meta all read the same state.

### 7.7 Security (`/settings/security`)

**Job.** *Keep my account mine: change how I sign in, add a second step, see where I'm signed in, and cut off anything I don't recognise.* Today the page is one 2FA card under an H1 that doesn't match the nav (F-UX-044).

**Findings:** F-UX-044, F-VIS-019 (icon over the Change-email text), F-QA-021 (invalid email accepted), F-A11Y-020 (placeholder labels), F-UX-042 ("Suspicious activity?" needs a real target: this page), F-UX-029 ("sign out everywhere" lives here, Shell §9.3).

**Hierarchy.** 1) Header meta: "Two-factor on · 3 sessions". 2) Two-factor (the biggest protection). 3) Where you're signed in. 4) Email and password.

Section order follows how people arrive: from a security alert email they look for sessions; from setup they turn on two-factor; the email and password rows are short and sit first so the page opens with who you are.

```
Settings ›
Security       Two-factor off · 3 sessions
───────────────────────────────────────────────────────────────────────────
Email address                                                       [link]
anika@sample.in · used to sign in and for alerts            Change email…
───────────────────────────────────────────────────────────────────────────
Password                                                            [link]
Last changed 3 months ago                                 Change password…
───────────────────────────────────────────────────────────────────────────
Two-factor                                                          [link]
Off. Ask for a code from an authenticator app when you sign in.  [Turn on…]
Authenticator apps only for now. Security keys and SMS aren't supported yet.
───────────────────────────────────────────────────────────────────────────
Where you're signed in              [Sign out of all other sessions…]
Chrome on Windows · Bengaluru (approx.)   Active now      This device
Safari on iPhone · Pune (approx.)         2 hours ago               Sign out
Chrome on macOS · Mumbai (approx.)        12 Sep 2026               Sign out
See sign-in history in Activity
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Email address (`#email`) | Guarded Action | SettingRow (value + **Change email…**). Confirm it's you → Dialog `md` "Change email": KeyValue "Current email"; Field + TextInput `type="email"` "New email" (no leading icon, F-VIS-019); body "We'll send a link to both addresses. You keep signing in with anika@sample.in until both are confirmed." (the kept strength); primary **Send confirmation links**. *Pending:* section Notice `info` "Email change pending. Confirm from both inboxes. Sent at 10:42 am. **Resend** · **Cancel change**" |
| Password (`#password`) | Guarded Action | SettingRow "Last changed 3 months ago" + **Change password…** → Dialog `sm`: PasswordInput `purpose="sign-in"` "Current password", PasswordInput `purpose="new"` "New password" with the rules list (C §3.3), Checkbox "Sign out of other sessions" (default on), primary **Change password**. Google- or Microsoft-only accounts: "You sign in with Google. Set a password to also sign in with email." + **Set password…** (Confirm it's you with Google first) |
| Two-factor (`#two-factor`) | Guarded Action | *Off:* SettingRow + secondary **Turn on…** → Dialog `md` with StageProgress "Scan · Enter code · Save recovery codes": a QR code with "Can't scan? Enter this key" (TextInput read-only, `mono-13`, Copy); the code field; recovery codes in a CodeBlock (§14) with Copy and Download, and Checkbox "I've saved these codes" before **Finish**. *On:* KeyValueList: "On · Authenticator app · since 21 Sep 2026", "Recovery codes · 8 left" + **Show new codes…** (Confirm it's you; the old codes stop working), and **Turn off…** (§5.2) |
| Where you're signed in (`#sessions`) | Action | DataTable at form width (N §7): Device (browser and OS, `data-13`), Location ("Bengaluru (approx.)", from IP), Last active (`formatWhen`; "Active now"), action (**Sign out**, tertiary sm, instant with toast "Signed out of Safari on iPhone"; the current row shows Tag outline "This device" instead). Header action **Sign out of all other sessions…** (tier 2). Link "See sign-in history in Activity" → `/settings/activity?category=sign-in&actor=me` |

**States and copy.** Email invalid: "Enter an email address, like name@company.com." · Same as current: "That's already your email address." · Already used by another account: "That email belongs to another Vaani Labs account. Use a different one." Current password wrong: "That password isn't right." Code wrong: "That code isn't right. Codes change every 30 seconds." ST8 not shipped: Sessions hidden; Password shows "Want to change it? **Email me a reset link**" (the existing reset flow).

**Microcopy.** H1 "Two-factor authentication" → "Security" · "DISABLED · Add a second factor · Enable" → "Off. Ask for a code from an authenticator app when you sign in. **Turn on…**" · Change Email's "CHANGE EMAIL" + "Move your login / to a new address." → the Email address section and "Change email" dialog · "@ew-address@company.com" (icon over text) → no icon; the label says "New email".

**Accessibility.** The QR code has a text alternative (the setup key). Recovery codes are selectable text with Copy. "This device" is part of the row name. Sign-out buttons are named "Sign out Safari on iPhone".

**Telemetry.** `twofa_setup` {step, result}; `session_signout` {scope: one|others}; `email_change_start` / `email_change_confirmed`; `password_change` {result}. Never emails or IPs in payloads.

**Acceptance.**
- [ ] The H1 is "Security"; the page holds email, password, two-factor and sessions, and links to sign-in history.
- [ ] Change email, change or set password, turning two-factor off and new recovery codes each pass "Confirm it's you" once within 10 minutes.
- [ ] "Something looks wrong?" on Activity and security alert emails land on `#sessions`.

---

### 7.8 API keys (`/settings/api-keys`)

**Job.** *Give my systems a key with only the access they need, see which keys are in use, and kill one the moment it leaks.* Today the page lives at `/api-keys`, outside Settings, with no way back and no active nav item (EXPLORE-SETTINGS-07).

**Findings:** F-UX-027 (orphan route), F-UX-016 ("over Twilio", "Vikash on a LiveKit meeting room"), F-VIS-005 (mono eyebrow "PUBLIC API"), F-UX-043 (namespace). Kept: scopes in plain words, the rate-limit slider with "Recommended 60", "shown exactly once".

**Hierarchy.** 1) The keys table (what exists, what is used). 2) Create key…. 3) How to use a key (one line and a docs link).

```
Settings ›
API keys    2 keys · requests are billed to your wallet          API reference ↗   [Create key…]
Send a key as a Bearer token: Authorization: Bearer vv_live_…
──────────────────────────────────────────────────────────────────────────────────────────────
Name        Key                Scopes              Rate limit   Last used        Created
CRM sync    vv_live_•••• 3fa2  Phone agent  +1     60 / min     Today 10:42 am   21 Sep 2026 · Anika R.  ⋯
Website     vv_live_•••• 91c0  Web voice agent     120 / min    Never            12 Sep 2026 · Dev S.    ⋯
```

| Part | Components and configuration |
|---|---|
| Header | PageHeader `nested`, `width="data"`; tertiary link "API reference" (`external-link`, new tab, `/docs/api`); primary **Create key…** (admins; members: aria-disabled "Only admins can create keys. Ask an admin: Anika R.") |
| Description | one `body-14` line with the header name in `mono-13` |
| Table | DataTable (Standard): Name (`label-13`, `translate="no"`) · Key (`mono-13` prefix + masked middle + last 4) · Scopes (Tag neutral for the first, "+n" CountBadge, full list in the tooltip) · Rate limit (right-aligned, tabular) · Last used (`formatWhen`, "Never"; ST12) · Created (date · person) · `⋯` (Open · Rename… · separator · Revoke key…). Row click or Enter opens the key Sheet (`?key=`) |
| Create key… | Confirm it's you → Dialog `md` "Create API key": Field TextInput "Name" (hint "Like CRM sync. Only your team sees it."), CheckboxGroup "Scopes" with RadioCard-like descriptions and the scope id in `mono-12` `--text-3` (Web voice agent `textvoice` · Phone agent `voicebot` · Meeting agent `meeting_agent` · Meeting rooms `meeting`), **none preselected** (least access; "Choose at least one scope." on submit), Slider "Rate limit" 1–600 with the mark "Recommended 60" and a paired NumberInput (C §6.5, hint "Requests above this get HTTP 429."), primary **Create key** |
| Result | **OneTimeSecret** dialog (§14): title "Copy your key now"; body "This is the only time we show it. We keep only a hash, so we can't show it again."; TextInput read-only `mono-13` with Copy; Notice `info` "Keep it on your server. Never put it in a web page or app."; **Done**. Closing before Copy was pressed swaps the footer to the inline discard state (O §2.5): "Close without copying? You won't see this key again." · Keep open · Close |
| Key Sheet | Sheet `detail` 440: KeyValueList (Key, Scopes, Rate limit, Created by and when, Last used with masked IP, Requests this month); Rename…; DangerZone "Revoke key…" |

**States.** First use: EmptyState "Create a key to call the Vaani API from your systems." + Create key… (O §15.3). Revoked keys stay listed for 7 days with Tag neutral "Revoked 21 Sep" and no actions, so a failing integration can be traced. Loading: TableSkeleton. Member: table read-only, `⋯` shows Open only.

**Microcopy.** "PUBLIC API / API Keys" → H1 "API keys" · "Mint key" → "Create key" · "Textvoice · Text-mode voice agent (browser stream)" → "Web voice agent · Voice conversations in a browser or app" · "Voicebot · Outbound / inbound phone agent over Twilio" → "Phone agent · Outbound and inbound phone calls" · "Meeting agent · Vikash on a LiveKit meeting room" → "Meeting agent · The agent joins a meeting room" · "Plain meeting · LiveKit meeting room without an AI agent" → "Meeting rooms · Rooms without an agent" · "The plaintext is shown exactly once. Copy it now — we only store the hash." → the OneTimeSecret body above · "No keys yet. Mint one above." → the EmptyState.

**Acceptance.**
- [ ] `/api-keys` redirects here; the sidebar marks Settings and the SettingsNav marks API keys.
- [ ] A key's full value appears only in the OneTimeSecret dialog, once; the table never shows more than the prefix and last 4.
- [ ] Revoking needs the tier-2 confirmation and writes an Activity entry with the key name.

### 7.9 Webhooks (`/settings/webhooks`) and deliveries (`/settings/webhooks/deliveries`)

**Job.** *Send call and lead events to our systems, prove the endpoint receives them, and see why a delivery failed.*

**Findings:** F-A11Y-005 (New-webhook modal without dialog semantics, unnamed close), F-QA-021 ("not-a-url" accepted with Create enabled), F-UX-043 (`X-VaaniVoice-Signature`, `example.com/vaanivoice/webhook`), EXPLORE-SETTINGS ("Webhook not found." on deliveries without an id). Kept: HMAC-SHA256 verification documented on the page; the event list.

```
Settings ›
Webhooks    2 webhooks · 1 failing                              View deliveries   [New webhook…]
──────────────────────────────────────────────────────────────────────────────────────────────
Name        Endpoint                              Events   Status                 Last delivery
CRM hook    https://crm.sample.in/hooks/vaani     3        ✗ Failing · 5 in a row  Today 10:40 am · 500   ⋯
Analytics   https://etl.sample.in/in              1        ✓ Active                Today 10:41 am · 200   ⋯
──────────────────────────────────────────────────────────────────────────────────────────────
Verifying signatures
Every request carries X-Vaani-Signature: sha256=<hex>, an HMAC of the raw body with your signing secret.
[ Node.js | Python ]
┌ code ──────────────────────────────────────────────────────────── Copy ┐
```

| Part | Components and configuration |
|---|---|
| Table | DataTable `width="data"`: Name · Endpoint (`mono-13`, middle-truncated with a tooltip) · Events (count, list in the tooltip) · Status (StatusTag: Active success · Paused outline · Failing danger with "{n} in a row", ST11) · Last delivery (`formatWhen` + response code) · `⋯` (Send test event · View deliveries · Edit… · Pause / Resume (Instant, toast) · Rotate signing secret… · separator · Delete webhook…) |
| New webhook… | Dialog `md` (Radix Dialog: `role="dialog"`, named close, focus trap): Field TextInput "Name" (hint "Like CRM hook"); Field TextInput `type="url"` "Endpoint URL" (validated `httpsUrl` on blur and submit: "Enter a full URL starting with https://."; no placeholder domain from the old namespace); CheckboxGroup "Events", each with a plain description and the id in `mono-12`: `call.completed` A call ended with an outcome · `call.failed` A call couldn't connect or dropped · `meeting.ended` A meeting finished · `lead.created` A lead was added · `usage.charged` Your wallet was charged · `low_balance.warned` Your wallet is low; primary **Create webhook** → OneTimeSecret "Copy your signing secret" |
| Send test event | sends a `test.ping`; the row's StatusText reads "Test sent · 200 OK in 180 ms" or "Test failed · 500 · **View delivery**" |
| Verifying signatures (`#signatures`) | one paragraph + PanelTabs "Node.js · Python" over a **CodeBlock** each (constant-time comparison); the legacy header note: "Integrations built before {date} can keep reading X-VaaniVoice-Signature; we send both." (open question 5) |
| Deliveries page | PageHeader `nested` (breadcrumb Settings › Webhooks), H1 "Webhook deliveries", meta "Last 30 days · 1,204 deliveries · 3 failed". FilterBar: Select "Webhook" (All by default, so the page works without an id), ViewTabs "All · Failed", FilterMenu "Event", DateRangePicker. DataTable: When · Event (`mono-13`) · Webhook · Response (StatusTag "200 OK" success, "500" danger, "Timed out" warning) · Duration · Attempts · `⋯` (Redeliver · Copy delivery id). Row → Sheet `detail` (`?delivery=`): request headers and body, response code and first 2 KB of the body, each in a CodeBlock |

**States.** First use: EmptyState "Send call and lead events to your systems as they happen." + New webhook…. Deliveries empty: "Deliveries appear here after an event is sent to one of your webhooks." Filtered empty: "No failed deliveries in the last 7 days. **Clear filters**". Redeliver result: row StatusText "Redelivered · 200 OK".

**Acceptance.**
- [ ] "not-a-url" shows the URL error on blur; Create webhook reports it on click and sends nothing.
- [ ] `/settings/webhooks/deliveries` without an id lists deliveries across all webhooks, never "Webhook not found."
- [ ] Every displayed snippet's `textContent` equals its Copy payload (the CodeBlock test, §14).

### 7.10 Embed (`/settings/embed`)

**Job.** *Put a voice widget on our website: pick a key, copy a snippet that works, see roughly how it will look.*

**Findings:** F-UX-020 and F-QA-008 (displayed code corrupted, Copy clean), F-VIS-013 (182 px preview clipping its titles), F-VIS-005 and EXPLORE-SETTINGS-09 ("VOL. I — ISSUE 04 / EMBED HANDBOOK", 70 px gradient title, § numbering), F-UX-043 ("Vani Voice").

```
Settings ›
Embed    Add a Vaani voice widget to your website
────────────────────────────────────────────────────────────────
API key
[ Website · vv_live_•••• 91c0            ▾]   Create key…
────────────────────────────────────────────────────────────────
Snippet
Paste it before </body> on every page that should show the widget.
┌ HTML ──────────────────────────────────────────────── Copy ┐
│ <div id="vaani-voice" data-style="floating"></div>          │
│ <script src="https://…/embed/v1/vaanivoice.js" defer></script>│
└──────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────
Options          Style (Floating button | Inline panel)   Position (Bottom right ▾)
                 Button text [ Talk to us            ]
────────────────────────────────────────────────────────────────
Preview (720 × 480 frame of a sample page with the widget)
```

| Section (anchor) | Model | Components |
|---|---|---|
| API key (`#key`) | view state (`?key=`) | Select of keys with the Web voice agent scope (label "API key"); link "Create key…" (§7.8). No key: EmptyState compact "Create a key with the Web voice agent scope to use the widget. **Create key…**" |
| Snippet (`#snippet`) | view | **CodeBlock** `language="html"`, rendered and copied from one raw string (Shiki at build time or once on the server; never re-tokenised in the browser), wrapping long lines (`overflow-wrap: anywhere`), Copy with "Copied" |
| Options (`#options`) | view (changes the snippet only) | SegmentedControl "Style"; Select "Position"; TextInput "Button text". The CodeBlock updates as they change; nothing is saved |
| Preview (`#preview`) | view | a framed sample page, full column width × 480 (container query: never narrower than 360; below 400 px the frame scales down as a whole). Visual only; a note says so |
| Allowed websites (`#allowed`) | Section form (ST15) | Field + Textarea "Allowed websites", one origin per line, validated as `https://` origins: "Only these websites can load the widget with this key." Hidden until ST15 |

**Microcopy.** "Paste once. Speak everywhere." → H1 "Embed", meta "Add a Vaani voice widget to your website" · "§ 00 API keys on this account · CREATE YOUR FIRST KEY" → the API key section · "Add a Vani Voice widget" → "Add a Vaani voice widget" · "LIVE PREVIEW" (182 px) → "Preview", full width.

**Acceptance.**
- [ ] No gradient, italic display title, § numeral or magazine header remains; H1 is "Embed" at `title-20`.
- [ ] The snippet shown equals the snippet copied, byte for byte.
- [ ] The preview is never narrower than 360 px or clipped.

---

### 7.11 Activity (`/settings/activity`)

**Job.** *Find out who changed something, or confirm that nobody did. When something looks wrong, get to the controls that stop it.* The ledger is the record behind every "Changed by Dev S. at 11:24 am" message in this spec.

**Findings:** F-UX-042 and F-QA-023 (an "append-only ledger" with zero rows for an active account; "Suspicious activity?" → Profile), F-VIS-022 (grid-paper background), F-VIS-005 (36 px H1, "APPEND-ONLY LEDGER · 365D RETENTION" eyebrow), F-VIS-024 (dates), F-UX-017 ("Activity & Audit" vs "Account Activity").

**Hierarchy.** 1) The scope: whose events, which range, since when we record. 2) The table. 3) "Something looks wrong?".

```
Settings ›
Activity    Everyone · Last 30 days · recording since 20 Sep 2026   Something looks wrong?  Export CSV
─────────────────────────────────────────────────────────────────────────────────────────────────────
[Search events…]  [Category: Any ▾] [Person: Everyone ▾] [Last 30 days ▾]
When              Event                                   Person                 Target                IP             Device
Today 10:42 am    Published a flow                        Anika R.               Site-visit qualifier  103.21.•••.•••  Chrome on Windows
Today 9:15 am     Created an API key                      Dev S.                 CRM sync              49.36.•••.•••   Safari on macOS
Yesterday         Changed calling hours                   Anika R. via Assistant Phone setup           –               –
21 Sep 2026       Requested a data export                 Anika R.               Export                103.21.•••.•••  Chrome on Windows
─────────────────────────────────────────────────────────────────────────────────────────────────────
1–50 of 214 · Entries can't be edited or deleted. IP addresses are partly hidden. Kept for 365 days.
```

| Part | Components and configuration |
|---|---|
| Header | PageHeader `nested`, `width="data"`; meta = scope ("Everyone" for admins, "Your activity" for members) · the applied range · "recording since {first event date}" (ST10); tertiary **Something looks wrong?** → `/settings/security#sessions`; tertiary **Export CSV** (the current filter) |
| Filters | FilterBar (N §6): SearchInput "Search events…" (`?q=`), FilterMenu "Category" (Sign-in · Account · Flows · Leads · Knowledge · Phone setup · Integrations · API keys and webhooks · Billing · Workspace · Assistant), FilterMenu "Person" (admins: Everyone · You · a teammate · an API key), DateRangePicker (presets; the applied range is always written in the meta, F-UX-042). The 13 chips become tokens (N §6, F-RWD-012) |
| Table | DataTable, server-paginated (N §7.11): When (`formatWhen`, absolute date and time in the tooltip and `<time>`) · Event (a past-tense sentence from `lib/audit.ts`) · Person (Avatar 20 + name; "{name} via Assistant"; "API key 'CRM sync'"; "Vaani Labs support") · Target (a link to the object when it still exists) · IP (masked, `mono-12`) · Device (browser and OS, the old "AGENT" column). Row → Sheet `detail` (`?event=`) with a KeyValueList of the event's fields and, for changes, before → after values |
| Footer note | `meta-12` `--text-3`: "Entries can't be edited or deleted. IP addresses are partly hidden. Kept for 365 days." |

**States.**

| State | Copy |
|---|---|
| Nothing recorded yet (not-yet, O §15) | "Recording since 20 Sep 2026. Nothing recorded in this range." + "Show all time" (never an unexplained "Nothing in this slice yet.") |
| Filtered empty | "No sign-in events in the last 7 days. **Clear filters**" |
| Loading | TableSkeleton with the real column names; the pager reads "Loading…" |
| Failed | SectionError "Couldn't load activity. **Retry**" |
| Member | only their own events; "Person" filter hidden; meta "Your activity" |

**Microcopy.** "Account Activity" (36 px) + "APPEND-ONLY LEDGER · 365D RETENTION" → H1 "Activity" + the meta · "Nothing in this slice yet." → the not-yet copy · "Suspicious activity?" (red outline → Profile) → "Something looks wrong?" (tertiary → Security › Where you're signed in) · "ROWS IMMUTABLE · IPS MASKED · RETAINED 365 DAYS" → the footer note · "AGENT" column → "Device".

**Acceptance.**
- [ ] Every save, publish, key, webhook, invite, role, integration and sign-in event in this spec writes a row (a server test per event type, F-QA-023).
- [ ] The applied range and "recording since" are always visible; no empty state omits them.
- [ ] No grid-paper or other texture behind the table.

### 7.12 Export data (`/settings/export`)

**Job.** *Take a copy of our data out, and know exactly what it contains.*

**Findings:** F-UX-047 (two equal primaries; "one per 24 hours" vs "re-request anytime"), F-VIS-024 ("21/09/2026 15:39:11"), EXPLORE-SETTINGS-15 (two back links). Kept: contents and exclusions, last export status, size, times and link expiry.

```
Settings ›
Export data    Last export ready · 132.7 KB
──────────────────────────────────────────────────────────────────
Latest export
Requested    21 Sep 2026, 3:39 pm
Ready        21 Sep 2026, 3:39 pm · 132.7 KB
Link         Expires in 52 min                         [Download .zip]
──────────────────────────────────────────────────────────────────
Request a new export                      [Request new export]
You can request one export every 24 hours. Available again in 3 h.
──────────────────────────────────────────────────────────────────
What's in an export
Included   Profile, flows and their versions, leads, call reports and transcripts,
           knowledge files, settings
Not included   Call recordings (download them from Call reports), API key values
```

| Section | Model | Components |
|---|---|---|
| Latest export | Action | KeyValueList `rows`; **Download .zip** is the page's one primary. An expired link shows "Link expired" and the primary becomes **Get a new link** (re-signs the same archive; the old "Re-request anytime" copy) |
| Request a new export | Action | secondary **Request new export**; while rate-limited it is aria-disabled with the reason inline: "You can request one export every 24 hours. Available again in 3 h." (C §1.6). Running: StageProgress "Preparing archive · Ready" (O §14.3); leaving the page keeps it running with a progress toast; done: toast "Export ready · **Download**" |
| What's in an export | read-only | KeyValueList `rows` "Included" / "Not included" |

Scope: admins export the workspace; members export their own data (the meta says which; open question 7).

**Acceptance.**
- [ ] Exactly one filled button on the page; the rate limit is stated once, with the time it lifts.
- [ ] Dates follow `formatWhen` (no "21/09/2026 15:39:11").

### 7.13 Delete account (`/settings/delete`)

**Job.** *Close my account, knowing what disappears, what stays, and how to change my mind.* Today this is the best-built page in Settings; it keeps its pattern and fixes three gaps: how to undo, the workspace question, and the copy.

**Findings:** F-UX-035 (danger placement: it stays last and alone), EXPLORE-SETTINGS ("reversible for 7 days" without saying how; "required for app-store compliance"; blue eyebrows on a destructive page), F-A11Y-019 (the 3.25:1 red label).

```
Settings ›
Delete account
──────────────────────────────────────────────────────────────────
Your account closes now and is deleted after 7 days.
To undo, sign in within 7 days and choose Restore account.

Deleted after 7 days          Kept
Your profile and sign-in      A minimal audit entry, without your name
Your API keys and sessions    Tax records the law requires us to keep
Your notification settings
──────────────────────────────────────────────────────────────────
⚠ You're the only admin of Sample Realty, which has 3 other members.
  Make someone else an admin, or delete the workspace first.
──────────────────────────────────────────────────────────────────
Why are you leaving? (optional)
[                                                         ]
Type anika@sample.in to confirm
[                                                         ]
                                       [Cancel]  [Delete account]
```

| Part | Components and configuration |
|---|---|
| Consequence | `body-14` `--text` lead sentence + how to undo; two KeyValueList-style columns "Deleted after 7 days" / "Kept" (stacked below 560), computed for this person |
| Workspace rule (ST13) | Notice `warning`, section scope, when you are the only admin of a workspace with other members: blocks the action (the button is aria-disabled with that reason) and links to Organization › Members and Delete workspace. When you are the **only member**, the lists add the workspace's data ("Sample Realty: 16 flows, 1,284 leads, 121 call reports"), the inbound number release and scheduled batches cancelled, as in §5.2 |
| Reason | Field + Textarea (optional), `maxLength` soft 1,000 |
| Typed confirmation | Field + TextInput "Type {email} to confirm", `autocomplete="off"`, paste allowed; match trimmed, case-insensitive (O §3.2) |
| Actions | **Cancel** (tertiary → `/settings`) then **Delete account** (Button `destructive`, outline; aria-disabled with "Type your email to confirm" until matched). Then Confirm it's you (§5.3). Working: "Deleting…"; done: signed out to `/login?reason=account-closed` ("Your account is closed. Sign in within 7 days to restore it.") |

**Microcopy.** "This is reversible for 7 days, after which your data is permanently removed." → "Your account closes now and is deleted after 7 days. To undo, sign in within 7 days and choose Restore account." · "…required for app-store compliance and dispute resolution" → "A minimal audit entry, without your name" · "WHAT GETS DELETED / WHAT WE KEEP" (blue mono eyebrows) → "Deleted after 7 days" / "Kept" (`label-12` `--text-3`) · "DELETE MY ACCOUNT" → "Delete account".

**Acceptance.**
- [ ] The page says how to undo, and the restore path exists on sign-in during the grace period.
- [ ] A sole admin of a workspace with other members cannot delete their account until they hand over or delete the workspace.
- [ ] The final button is an outline destructive button (no filled red), enabled only after the typed match.

### 7.14 Retired items and where they went

| Retired | Now | How users are moved |
|---|---|---|
| Meetings Billing (in-page tab) | Billing › Plans (knowledge-billing §2.10) | `#meetings-billing` redirect; Meetings' "Free minutes" link points to `/billing/plans` |
| Docs (in-page tab, 3 of 5 links 404) | Account menu › Help and docs (Shell §9.2); Embed guide = `/settings/embed`, webhook events = `/docs/api#webhooks` | `#docs` opens the Help submenu; CI link check on doc links (F-QA-017) |
| Calendly (own page) | Integrations › Your connections | 308 to `/settings/integrations#calendly` |
| Change Email (own page) | Security › Email address | 308 to `/settings/security#email` |
| Call channel, Calling number | Phone setup › Transfers, › Caller ID | 308 with anchors |
| Personal agent (orphan) | `/personal-agents/settings` | 308 |
| `/admin`, `/admin/organizations` | Organization and team | 308 |
| The header "Save Changes" | per-section saves (§4) | none needed |
| "BACK TO SETTINGS" bars and extra back links | the frame (desktop) or one "‹ Settings" (tablet and phone) | none needed |

---

## 8. Interactions and keyboard

| Key or gesture | Where | Does |
|---|---|---|
| `Tab` / `Shift+Tab` | everywhere | DOM order = visual order: shell → SettingsNav → page header → sections top to bottom → save bar (F-A11Y-030) |
| `F6` | everywhere | cycles shell, SettingsNav, page, save bar and toasts (Shell §3.9) |
| `⌘/Ctrl+S` | a Section form | saves the section that holds focus; with focus elsewhere and exactly one dirty section, saves that one; with several, moves focus to the bar's Review. Never saves an Instant section (it is already saved) |
| `Enter` | a single-line field | submits that section's form (native submit), only when the section is dirty |
| `Esc` | dialogs and sheets | Cancel; a dirty dialog switches to its inline discard footer first (O §2.5). No effect on page forms |
| `⌘K` | everywhere | "Settings" results jump to a page or a section ("calling hours" → `/settings/phone#hours`), using the synonyms in Shell §8 ("DID", "caller ID", "2FA", "invite", "webhook") |
| `/` | table pages (API keys, Webhooks, Deliveries, Activity, Members above 10) | focuses the page search, when single-key shortcuts are on |
| `J` / `K`, `Enter`, `Shift+F10` | the same tables | the DataTable model (N §7.9): move, open the row's sheet, open the row menu |
| `?` | everywhere | shortcut sheet; its Forms section lists `⌘S Save` (Shell §10) |
| Copy link (section heading) | hover or focus | copies `…/settings/<page>#<anchor>`; toast "Link copied" |
| Swipe | phone | none on Settings pages (only toasts swipe to dismiss) |

No single key saves, deletes, dials or connects anything. Links in the SettingsNav and Overview are real `<a>` elements, so middle-click and Cmd/Ctrl-click open pages in new tabs.

## 9. Microcopy: before → after (Settings-wide)

| Before (today) | After |
|---|---|
| "SETTINGS" (18 px tracked caps) + "Save Changes" | H1 = the page name ("Profile", "Phone setup"); no header Save |
| 17 items in title and sentence case ("Activity & Audit", "Change Email", "Call channel") | sentence-case labels from one config (§2.1) |
| ↗ on 14 same-tab links | no icon; `external-link` only on new-tab links (API reference, refund policy, OAuth) |
| "BACK TO SETTINGS", "← Settings", "§ SETTINGS / NOTIFICATIONS" | none on desktop; "‹ Settings" once on tablet and phone |
| "§ IDENTITY", "PUBLIC API", "RIGHT TO DATA PORTABILITY", "VOL. I — ISSUE 04" eyebrows | none (F-VIS-010); section headings are `title-16` sentence case |
| "Choose how Vaani Labs / reaches you." (two-tone) | "Notifications" + "Changes save automatically" |
| "DID", "calling number", "assigned number", "your phone number" | "Inbound number", "Caller ID", "Transfer number", "Mobile number", "WhatsApp number" (D §4.3) |
| "Vani Voice", "VaaniVoice" | "Vaani Labs"; developer prefix "Vaani" (S10) |
| "stub row until app-review credentials are ready", "over Twilio", "LiveKit", "pgvector", "Soul.md" | "Coming soon" and plain descriptions (§7.4, §7.8; banned-strings lint, D §8) |
| "/admin/organizations" as link text | "Ask an admin: Anika R." or "Create workspace…" |
| "You can change it once or twice" | "You can change it 2 more times." (the real count) |
| "Mint key" · "Save preference" · "Send confirmation links →" | "Create key" · "Save changes" (only when dirty) · "Send confirmation links" |
| "Nothing in this slice yet." | "Recording since 20 Sep 2026. Nothing recorded in this range." |
| "Suspicious activity?" | "Something looks wrong?" |
| "Wallet empty — top up now…" (em dash, banner on Settings) | no wallet notice on Settings (O §10.2); em dashes replaced by full stops and middle dots everywhere |
| "21/09/2026, 15:39:11" | "21 Sep 2026, 3:39 pm" / "Today 10:42 am" (`formatWhen`) |
| "DELETE MY ACCOUNT", "RESET TO DEFAULTS" | "Delete account", "Reset to defaults" |

Rules restated for this area: success copy has no exclamation marks ("Saved 11:24 am"); disabled controls always carry their reason (C §1.6); placeholders are examples ending in "…" and never labels; buttons are verb + object, with "…" when a dialog or another step follows.

## 10. Accessibility

- **Landmarks and headings.** One `main`; the SettingsNav is `<nav aria-label="Settings">` (distinct from "Main"); the page H1 is the page name; each section is `<section aria-labelledby>` with an `h2`; subsections (Manage sheet parts, event groups) use `h3`. Route changes set `<title>` ("Phone setup · Settings · Vaani Labs") and move focus to the H1 (Shell §4.4, F-A11Y-013).
- **Current location.** `aria-current="page"` on the SettingsNav item and on the sidebar's Settings item (F-A11Y-017). Anchor jumps move focus to the section heading.
- **Forms.** Every control sits in a `Field` with `<label for>`; hints and errors are wired through `aria-describedby`; `aria-invalid` while invalid; `autocomplete` set (`name`, `email`, `tel-national`, `one-time-code`, `current-password`, `new-password`) (F-A11Y-003, F-A11Y-020). Validation timing is C §8.2 on every Settings form.
- **Save feedback.** The SectionFooter's appearance is not announced (it is in place); the UnsavedChangesBar's appearance is announced once, politely; "Saved 11:24 am" is announced once; save failures are `role="alert"`; Instant failures `role="status"`.
- **Switch rows.** A switch's name is its label; the description is `aria-describedby`; no "ON/OFF" text. Aria-disabled switches keep focus and read their reason (C §1.6).
- **Dialogs.** Radix Dialog / AlertDialog for every dialog: focus trap, Esc, return focus, named close (F-A11Y-005). ConfirmDialogs focus Cancel; typed ones focus the input.
- **Tables.** Real `<table>` with `scope`, `aria-sort` on sortable headers, row names that start with the key column (N §7.14). Per-row buttons include the row's name ("Revoke CRM sync…").
- **Contrast and size.** Only tokens: `--text-3` ≥ 4.70:1 everywhere, nothing below 12 px, no alpha on text (F-A11Y-008). Delete account's label uses `--danger-text` (≥ 5.75:1), replacing the 3.25:1 red (F-A11Y-019).
- **Targets.** 24 px minimum on desktop, 44 px on touch; destructive controls ≥ 8 px from routine ones and never in a SectionFooter (F-A11Y-023, F §14).
- **Forced colours.** Selected nav item, radio cards, switches, tags and the Danger zone border stay visible (F §13); the `:target` section bar uses `Highlight`.
- **Reduced motion.** Only the save bar's rise and dialogs move; under reduced motion they fade only. Anchor scrolling is instant.
- **Privacy for assistive tech.** Masked numbers are read as "ending 2210", not as bullets ("+91 80, ending 2210").

## 11. Responsive summary per page

| Page | ≥1024 (frame with SettingsNav) | 768–1023 (drill-in, centred 720) | 320–767 (drill-in, full width) |
|---|---|---|---|
| Overview | list with descriptions and status | same | rows without descriptions below 480; status kept |
| Profile | form width | same | SectionFooter hidden; UnsavedChangesBar above the BottomBar |
| Notifications | two switch columns | two columns | channel SegmentedControl, one switch per row |
| Security | sessions as a table | table | sessions as ListRows (device / place · last active), Sign out 44 px |
| Organization and team | members table | table (Person + Role + `⋯`) | ListRows (name + role / last active), role changes from `⋯` |
| Integrations | rows with status and action on one line | same | two-line rows (name + status / purpose), action under the text at full width |
| Assistant | RadioCards in a column | same | same |
| Phone setup | as the wireframe | same | CallingHours rows on two lines; FlowSwitcher as a bottom sheet |
| API keys, Webhooks, Deliveries, Activity | DataTable (`width="data"`) | pinned key and actions columns | ListRows; sheets full screen |
| Embed | column; preview 720 × 480 | same | CodeBlock wraps; preview scales as a whole, never clipped |
| Export data, Delete account | column | same | actions in a sticky bottom bar (C §8.1) |

Verified widths: 320, 375, 390, 768, 1024, 1280, 1366 × 768, 1440 × 900, 1920 (F §5).

## 12. Telemetry hooks (optional)

| Event | Properties | Question it answers |
|---|---|---|
| `settings_view` | `page`, `role`, `entry` (nav, overview, badge, palette, deep-link, redirect) | Which pages are used, and how people get there |
| `settings_section_save` | `page`, `section`, `result` (ok, invalid, conflict, error), `fieldsChanged` (count) | Where saves fail or conflict |
| `settings_discard` / `settings_nav_guard` | `page`, `section`, `choice` (keep, discard) | Is the guard saving work or annoying people? |
| `settings_instant_change` | `page`, `setting` (id, never the value for personal data), `result` | Preference adoption; rollback rate |
| `settings_attention_click` | `item` (caller-id, inbound, reconnect, webhook-failing, twofa) | Does the Overview drive fixes? |
| `invite_send` | `count`, `role`, `result` | Team adoption (the F-UX-001 fix) |
| `integration_connect` | `app`, `step` (dialog, oauth, return), `result`, `errorCode` | OAuth drop-off |
| `api_key_create` / `api_key_revoke` · `webhook_create` / `webhook_test` / `webhook_delete` | `result`, `scopesCount` / `eventsCount` | Developer onboarding |
| `reauth_prompt` | `action`, `method` (password, totp, oauth), `result` | Friction of "Confirm it's you" |
| `export_request` · `account_delete_confirm` · `workspace_delete_confirm` | `result`, `blockedReason?` | Exits (never the free-text reason) |
| `legacy_redirect_hit` | `from` (route or hash) | When redirects can be removed |
| `deep_link_section` | `page`, `anchor`, `source` (copy-link, overview, notice, email) | Are section links used? |

**Privacy:** route templates only; never emails, phone numbers, key or secret values, URLs of webhooks, IPs or names. Session replay stays off on Profile, Organization and team, Security and Activity, which show personal data (F-UX-045, Shell §18).

## 13. Acceptance criteria (area-wide)

**Frame and navigation**
- [ ] Every Settings item from §2.1 has its own URL; no Settings content changes without a URL change; every legacy route and hash in §0.3 redirects (CI crawl).
- [ ] At ≥1024 the SettingsNav is visible on every Settings page with `aria-current="page"`; the sidebar marks Settings for all of them, including the old developer routes after redirect.
- [ ] Below 1024, `/settings` is an index reachable from the NavSheet or More sheet, and every page has exactly one back link ("‹ Settings"); no horizontal scrolling strip exists at any width.
- [ ] No Settings page renders outside the shell, including loading and 404; the nav and header never flash away between Settings pages.
- [ ] One PageHeader style: `title-20` H1 = the nav label; no eyebrow, § numeral, gradient, serif, mono heading or texture on any Settings page.
- [ ] Forms are ≤ 720 px wide and aligned with their header at 1440 and 1920.

**Save model**
- [ ] No page has a header Save; every section is exactly one of Instant, Section form, Action or Guarded (§4.6).
- [ ] A SectionFooter appears only while its section differs from the saved values, and disappears if the values are typed back.
- [ ] Leaving with a dirty section (sub-nav, sidebar, back, workspace switch, sign out, tab close) asks first, naming the section.
- [ ] A 409 keeps the user's values and offers "Replace their version" / "Discard mine"; nothing merges silently.
- [ ] "Saved" appears only after a 2xx; Instant switches roll back with Retry on failure.

**Danger and trust**
- [ ] Every destructive action in §5.2 has its tier; tier 3 requires typing; no destructive button sits in a SectionFooter or beside a routine control.
- [ ] Guarded actions in S9 ask "Confirm it's you" at most once per 10 minutes.
- [ ] Every status on every page is computed; features that don't work are hidden or "Coming soon"; no engineering note, vendor internal or raw path appears (banned-strings lint).
- [ ] Members never meet a dead end: every read-only area names the admins, and every blocked action says why.

**Accessibility and responsive**
- [ ] axe: 0 violations on every Settings page in both themes; every control has a programmatic label.
- [ ] Keyboard only: every page, section, dialog, OAuth start, verification and deletion can be completed without a pointer.
- [ ] 320 px: no sideways scroll; touch targets 44 px; field text 16 px.

---

## 14. New components needed

Not defined in `02-components-*`; this spec defines them. Build them after `AppShell` and `PageHeader` (N §0.8 steps 2–3) and before any Settings page.

| Component | Defined in | Built on | Props sketch |
|---|---|---|---|
| **SettingsLayout** | §3.2 | App Router nested layout, `AppShell` content slot, container queries | `children`; `width?: 'form' \| 'data'` (per page); renders SettingsNav at ≥1024, nothing extra below |
| **SettingsNav** | §3.2–3.3 | NavItem styles without icons (N §1.2), `lib/settings-nav.ts` | `groups: { id, label, items: { id, label, href, match: string[], badge?(s): NavBadge \| null, roles?: Role[], visible?(s): boolean }[] }[]`, `currentPath`, `density?: 'standard' \| 'short'` |
| **SettingsIndex** | §3.5, §7.0 | the same config; 56 px link rows, Notice | `variant: 'overview' \| 'index'`; `status(itemId, state) => { text, tone }`; `attention: { id, text, href, severity, dismissible? }[]` |
| **SettingsSection** | §3.2, §4 | `<section>`, heading `h2`, IconButton (Copy link), StatusText | `id` (the anchor), `title`, `description?`, `model: 'instant' \| 'form' \| 'action' \| 'guarded'`, `status?`, `onSave?(values)`, `schema?` (zod), `readOnlyReason?` |
| **SectionFooter** | §4.2 | StatusText, Button, InlineError | `dirtyCount`, `saving`, `error?`, `conflict?: { by, at }`, `onSave()`, `onDiscard()`, `disabledReason?` |
| **SettingRow** | §3.2 | grid label/description + control or value | `label`, `description?`, `control` (Switch, SegmentedControl, value + action), `status?` (the Instant "Saved" / "Couldn't save · Retry") |
| **DangerZone** + **DangerAction** | §5.1 | Button `destructive`, ConfirmDialog (`useConfirm`) | `actions: { id, title, consequence: ReactNode, label, tier: 1 \| 2 \| 3, typedConfirm?, reauth?: boolean, disabledReason?, onConfirm() }[]` |
| **IntegrationRow** | §7.4 | ServiceMark `md`, Tag, StatusText, Button, Dialog (connect explainer), Sheet (Manage) | `app`, `purpose`, `state: 'not-connected' \| 'connecting' \| 'connected' \| 'attention' \| 'coming-soon'`, `account?`, `since?`, `canManage`, `onConnect()`, `onManage()` |
| **ServiceMark** | §7.4 (the rule and the mark table) | a 28 px (`md`) or 20 px (`sm`) tile: `md` = `--surface-2` fill, 1 px `--border`, radius 6, 16 px mark; `sm` = `--surface-3` fill, no border (a bordered 20 px square reads as a checkbox), radius 4, 12 px mark in `--text-2`; `inline` = the bare 14 px mark in `--text-2`, no tile (table cells such as Leads › Source). The mark is the vendor's single-colour glyph in `currentColor` (`--text`), or the Lucide fallback; never a letter, never a brand fill | `service: 'google' \| 'microsoft' \| 'calendly' \| 'whatsapp' \| 'hubspot' \| 'salesforce' \| 'instagram' \| 'facebook' \| …`, `size: 'md' \| 'sm' \| 'inline'`; marks and fallbacks live in `components/brand/service-marks.ts`; always `aria-hidden` (the name sits beside it). Consumers: Settings › Integrations and its Manage sheet (`md`), Flow Designer IntegrationStatusRow (`sm`, `04-flow-designer/02` §24), Personal agents' contact choices (`md`, `07` §2.11), Leads › Source (`inline`). The only full-colour marks in the product are `OAuthButton`'s (`08-public-auth` §18) |
| **NotificationMatrix** | §7.3 | SettingRow + Switch, SegmentedControl (phone) | `groups: { id, title, events: { id, label, description?, email?: ChannelCell, whatsapp?: ChannelCell }[] }[]`; `ChannelCell = { value, locked?: string, unavailable?: true }` |
| **CodeBlock** | §7.9, §7.10, §7.7 | Shiki output rendered from one raw string; IconButton Copy; `mono-12`/`mono-13` on `--surface-2` | `code: string`, `language`, `wrap?: boolean`, `label` (e.g. "HTML snippet"); test: `textContent === code` and the clipboard payload `=== code` (F-UX-020) |
| **OneTimeSecret** (Dialog `sm` preset) | §7.8, §7.9 | Dialog, read-only TextInput `mono-13` + Copy, Notice, O §2.5 discard footer | `title`, `secret`, `body`, `onDone()`; tracks whether Copy was pressed |
| **ReauthDialog** "Confirm it's you" (Dialog `sm` preset) | §5.3 | Dialog, PasswordInput or code TextInput, OAuth button | `action` (the phrase), `methods`, `onConfirmed()`; wraps any Guarded action through `useReauth(action)` (10-minute window from ST9) |

**Contract extensions (not new components):**
- **UnsavedChangesBar** (O §18.3) gains `sections: { id, label, footerVisible }[]`: it renders only when a dirty section's footer is off-screen (always on phones), names one section, or shows "Unsaved changes in {n} sections · Review" for several (§4.3).
- **useUnsavedChangesGuard** accepts a list of dirty section labels for the dialog title (§4.5).
- **PageHeader** `nested` on Settings pages: the breadcrumb is "Settings" (→ `/settings`); on the Overview the `page` variant is used.
- **CommandPalette** "Settings" group indexes sections as well as pages (`/settings/phone#hours`), with the synonyms in Shell §8.
- **Icon assignments** for foundations §12 (Settings pages only, used in the Overview and index): `layout-list`, `user-round`, `bell`, `shield`, `building-2`, `plug`, `bot`, `phone`, `key-round`, `webhook`, `code-xml`, `history`, `download`, `trash-2`.
- **Tokens:** none new. Widths use `--size-settings-nav` (200), `--size-container-form` (720), `--size-container-page` (1280), `--size-sheet-detail` (440).

## 15. Reconciliations with other specs

| # | Other spec says | This spec | Resolution |
|---|---|---|---|
| R1 | Shell §2.4: `/settings` 308s to `/settings/profile`; `lib/nav.ts` Settings `href: '/settings/profile'` | `/settings` renders the Overview (the index on phones and tablets, the badge's landing page) | Drop that one redirect; set the Settings nav `href` to `/settings`; the account menu's "Profile" still goes to `/settings/profile`. Hash handlers on `/settings` stay |
| R2 | Shell §2.3 groups: Workspace (Profile, Organization and team, Notifications, Integrations) · Calling · Developer · Security · Data | Your account (Profile, Notifications, Security) · Workspace (Organization and team, Integrations, Assistant) · Calling · Developer · Data | Groups live only in the sub-nav (Shell D3), so no URL changes. The new split tells users whether they can edit (§2.1) |
| R3 | Assistant spec §10.2: "Settings › Workspace › Assistant" | `/settings/assistant` in the Workspace group | Adds one slug to Shell §2.3's list |
| R4 | Knowledge spec §1.1: the WhatsApp brochure moves to "Settings › Workspace › Assets" | Organization and team › Shared assets (`/settings/organization#assets`) | One section, not a page; the Knowledge spec's pointer resolves to this anchor |
| R5 | Shell §2.4: `/settings/calling-number` → `/settings/phone`, `/settings/call-channel` → `/settings/phone#transfer` | adds `#caller-id` to the first | Same target page; the anchor lands on the right section |
| R6 | Cockpit spec (part 5): "Settings → Call channel is set to Browser or Auto" | Phone setup › Transfers: "A phone number" or "Rep console, then a phone number" | Cockpit and Rep console readiness rows read "Transfers ring here · Rep console first" or "Transfers ring the phone, not this page. **Change in Phone setup**" |
| R7 | Overlay §15.3: Settings › API keys empty copy "Create a key to call the Vaani API from your systems." | used verbatim | none |
| R8 | Direction §6.6: "Save is enabled only when the page has unsaved changes, and it covers every field on the page" | Save is per section and appears only when that section is dirty | The per-section model is stricter: a Save never covers fields in other sections, which is what F-UX-012 asked for; the page-wide guard (§4.5) still covers every field |
| R9 | Foundations §12 replaces letter pseudo-icons with "brand SVGs" without saying in which colours; the first Settings mock drew letters on brand-coloured squares (including a magenta Instagram tile); `03-leads` shows sources as "brand SVG + word" | Integrations show a single-colour ServiceMark (§7.4, §14) | One rule for every surface: the vendor's single-colour mark in `currentColor`, or a Lucide category glyph, on a neutral tile (or bare in table cells). Full-colour marks only in `OAuthButton` (`08-public-auth` §18), where the identity providers' button guidelines require them. Foundations §12 and `03-leads` should cite ServiceMark |

## 16. Open questions for the product owner

1. **Roles.** Are Admin and Member the only roles in v1? Is there a "Developer" role that may create keys and webhooks without being an admin? (§2.3 assumes admin-only creation; members read.)
2. **Member access to developer pages.** Should members see API keys and webhooks at all, or should the Developer group be hidden for them? Today a member account can open `/api-keys`.
3. **Workspace time zone.** Is IST fixed for every workspace (the spec's assumption), or may enterprise workspaces pick another zone for calling hours? (C open question 6.)
4. **Calling-hours defaults and rules.** What default hours ship, and which regulatory limits (promotional versus service calls, DND) must the Call gate enforce regardless of what a workspace sets? (D §8 compliance cues.)
5. **Developer namespace.** Confirm the signature header rename to `X-Vaani-Signature` with `X-VaaniVoice-Signature` sent in parallel until a date, and whether new keys keep the `vv_live_` prefix.
6. **Transfer fallback timing.** Is 20 s the right time before a Rep console transfer falls back to the phone number, and should it be configurable?
7. **Export scope.** Does a member's export contain only their own data, and an admin's the whole workspace? What exactly is included today?
8. **Workspace deletion and money.** What happens to a remaining wallet balance when a workspace is deleted (refund, forfeit, hold for 7 days)? The copy links to the refund policy until this is decided.
9. **Two-factor for everyone.** Should admins be able to require two-factor for all members (an Organization › Security policy section)? Not in v1 unless the backend exists.
10. **Inbound number requests.** Is there a self-serve request, or does support allocate numbers? What is the real turnaround to quote?

## 17. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-UX-001 org and team dead end | critical | §7.2 No-workspace and No-admin states, ST1; §7.4 member and no-workspace states; Shell §12.2 |
| F-UX-002, F-QA-004 wallet hashes land on Profile | high | §0.3 redirects; S7 |
| F-UX-012 always-on Save, 7 save models, no guard | high | §4 (models, SectionFooter, bar, guard, conflicts) |
| F-A11Y-003 labels | high | §10; every page's Field usage |
| F-A11Y-004 shortcuts can't be turned off | high | §7.1 Preferences |
| F-A11Y-005 webhook modal semantics | high | §7.9, §10 |
| F-A11Y-008 muted text, 10 px mono | high | §10; tokens only |
| F-RWD-001 Settings unreachable on phones | high | §3.5, §7.0 |
| F-UX-015 telephony split and naming | medium | §7.6; S8 |
| F-UX-016 internal details | medium | §7.4, §7.8, §9 |
| F-UX-020, F-QA-008 corrupted snippets | medium | §7.10, CodeBlock §14 |
| F-UX-021 meeting plans in Settings | medium | S7, §7.14 |
| F-UX-027 Settings navigation | medium | §2, §3, §0.3 |
| F-UX-035 destructive placement | medium | §5 |
| F-UX-041 Profile scope, missing WhatsApp field | medium | §7.1, §7.2, §7.3 |
| F-UX-042, F-QA-023 empty ledger, "Suspicious activity?" | medium | §7.11 |
| F-UX-043 brand spellings, em dashes | medium | S10, §9 |
| F-UX-044 Security is 2FA only | medium | §7.7 |
| F-UX-045 session replay on personal data | medium | §12 |
| F-QA-017 dead Docs links, off-shell 404 | medium | §7.14; Shell §15 |
| F-QA-021, F-UX-025 validation | medium | every form; C §8.2 |
| F-VIS-005 six Settings templates | medium | §3.2, §13 |
| F-VIS-013 Embed preview clipping | medium | §7.10 |
| F-VIS-019 icon over text | medium | §7.7 |
| F-VIS-022 grid paper on Activity | medium | §7.11 |
| F-VIS-024 date formats | medium | §7.11, §7.12 |
| F-VIS-034 form widths | medium | §3.2 |
| F-A11Y-017 nav semantics | medium | §3.3, §10 |
| F-A11Y-019 Delete Account red at 3.25:1 | medium | §10 |
| F-A11Y-023 targets | medium | §10 |
| F-UX-047 Export primaries and copy | low | §7.12 |
| F-VIS-032 duplicate icons, theme toggle | low | §2.1, §7.1 |
| F-A11Y-030 ↗ icons, tab order | low | §9, §10 |
| EXPLORE-SETTINGS-22 loading drops the shell | low | §3.6, §6 |
