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
