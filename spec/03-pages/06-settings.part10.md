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
