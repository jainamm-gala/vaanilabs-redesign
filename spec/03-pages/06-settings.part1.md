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
