# Explorer C: Settings, information architecture and navigation model

**Product:** Vaani Labs (https://vaanilabs.in), live production app, signed in as the customer account (org "starvox labs")
**Agent:** va-explore-settings
**Date of run:** 2026-09-26
**Browser status:** OK. The session stayed signed in for the whole run and no credentials were entered.
**Screenshots:** `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-explore-settings/` (the `c*_*.png` files are from this run; `settings_*.png` and `api_keys*.png` are partial captures from the interrupted earlier run and were re-checked)

---

## 0. Method and safety

- All work ran in a private browser window (`va-explore-settings`) at 1440x900, with a guard that aborts every non-GET request, WebSockets, popups and downloads. I visited every Settings destination and screenshotted it. I also pulled the accessibility and DOM structure and measured computed styles (fonts, sizes, colours, x/width, contrast ratios).
- I tested these interactions: the in-page sub-nav buttons (Profile, Meetings Billing, Docs), typing obviously fake values ("abc", "test", "not-a-url", "not-an-email") to check client-side validation, opening and closing the New-webhook modal, the Embed "Copy" button (clipboard intercepted in-page), expanding and collapsing the sidebar, and a 390x844 viewport. **I never clicked** Save / Save Changes, Upload, Connect *, Enable (2FA), Mint key, Create webhook, Send code, Send confirmation links, Request a new export, Download, Upgrade, Top up, Enable autopay, Delete my account or Sign out.
- The guard did not block any write during this run, so no autosave fired on field edits or tab switches. The only blocked requests were PostHog analytics.
- For the route inventory I used `fetch()` GETs with `redirect: 'manual'` from inside the app origin, then checked the status and whether the Next.js not-found page was served. I then opened the interesting routes in the tab.
- I did not record real personal data. The account email appears on several pages; this report calls it "the account email".

---

## 1. What Settings is and how it is built

Settings is where a Vaani Labs customer manages their identity, the org, telephony (calling number and transfer channel), third-party connections (Google, Microsoft, Calendly, Meta, HubSpot, Salesforce), developer surfaces (API keys, embed, webhooks), meeting-minute plans, audit, data export and account deletion. It is reached from the 12th icon in the left rail (`/settings`).

### 1.1 The /settings shell (only for 3 of 17 items)

`c1_settings_profile.png`

- The header bar has a gear icon and an H1 "SETTINGS" (Sora 18px/700, letter-spacing 0.9px, `rgb(17,23,37)`). On the right is a blue **"Save Changes"** button (`#2F5FE0`, 141x37 px at x=1275, class `btn-saffron`; its markup also carries a short "Save" label, which is what shows on mobile).
- A vertical sub-nav (191 px wide, x=88) has **17 items** at 12 px, each 36 px tall with a 44 px pitch. The inactive colour is `#7A8397` on `#F4F6FA`, a **3.52:1** contrast ratio. The active item is blue text on a 10%-blue tint. There is no `aria-current`.
- The content column is centred: x=575, max width 576 px. At 1440 px roughly 575 px of empty space sits left of the column (after the rail and sub-nav) and about 290 px sits to its right.
- The sub-nav items come in **three different kinds**, but nothing in their styling tells them apart except a small trailing icon:

| # | Item | Element | Target | Behaviour | Trailing icon |
|---|------|---------|--------|-----------|---------------|
| 1 | Profile | `<button>` | in-page | swaps panel; URL stays `/settings` | none |
| 2 | Organization | `<a>` | `/settings/organization` | full navigation; leaves the shell | "external-link" (10 px, `#7A8397`, aria-hidden) |
| 3 | Notifications | `<a>` | `/settings/notifications` | leaves shell | ext icon |
| 4 | Call channel | `<a>` | `/settings/call-channel` | leaves shell | ext icon |
| 5 | Calling number | `<a>` | `/settings/calling-number` | leaves shell | ext icon |
| 6 | Calendly | `<a>` | `/settings/calendly` | leaves shell | ext icon |
| 7 | Security | `<a>` | `/settings/security` | leaves shell | ext icon |
| 8 | Activity & Audit | `<a>` | `/settings/activity` | leaves shell | ext icon |
| 9 | API Keys | `<a>` | **`/api-keys`** (outside /settings) | leaves shell, and no back link | ext icon |
| 10 | Embed | `<a>` | **`/api-keys/embed`** | leaves shell, and no back link | ext icon |
| 11 | Webhooks | `<a>` | **`/webhooks`** | leaves shell, and no back link | ext icon |
| 12 | Integrations | `<a>` | `/settings/integrations` | leaves shell | ext icon |
| 13 | Meetings Billing | `<button>` | in-page | swaps panel; URL stays `/settings` | none |
| 14 | Data Export | `<a>` | `/settings/data-export` | leaves shell | ext icon |
| 15 | Change Email | `<a>` | `/settings/change-email` | leaves shell | ext icon |
| 16 | Docs | `<button>` | in-page | swaps panel; URL stays `/settings` | none |
| 17 | Delete Account | `<a>` | `/settings/delete` | leaves shell (red text) | ext icon |

- **Nothing opens a new tab.** No link has `target`, and `S.popups` stayed empty all session. The "external-link" glyph on 14 items is therefore misleading: it marks "this leaves the Settings shell", not "opens elsewhere".
- The three in-page tabs cannot be deep-linked. Meetings Billing and Docs both leave the URL at `/settings`, so a refresh or shared link always lands on Profile.
- Hash deep links `/settings#wallet` and `/settings#autopay` (used by the global wallet banner) do nothing. There is no element with `id="wallet"` or `id="autopay"`, and the page shows **Profile Settings** (`c16_settings_hash_wallet.png`). See finding 01.

### 1.2 The single global "Save Changes" button

- It is **always enabled.** Its `disabled` state was false before and after editing, and it has no dirty styling.
- It **only covers the Profile panel's Full Name and Phone fields** (inferred: they are the only plain inputs without their own action). It sits in the page-level header next to "SETTINGS", so it reads as saving all of Settings.
- The rest of the Profile panel uses its own actions: Subdomain has its own **Edit**, WhatsApp brochure has **Choose File + Upload**, and Google and Microsoft each have **Connect**.
- It **disappears** on the Meetings Billing and Docs panels, and the header shrinks. The H1 moves from y≈71 to y≈67 and the first sub-nav item from y=137 to y=128, a 9 px jump on each switch (`c3_meetings_billing.png` vs `c1_settings_profile.png`).
- The other Settings pages use **six more save models**:
  - Notifications: "Changes save automatically."
  - Call channel: "Save preference", disabled until changed.
  - Calling number: "Send code".
  - Change Email: "Send confirmation links".
  - Webhooks: modal "Create webhook".
  - API Keys: "Mint key".
- **There is no unsaved-changes guard.** I typed "abc" in Phone and clicked the Organization sub-nav link. The app navigated at once, with no confirm or beforeunload dialog, and the edit was silently discarded.
- **There is no validation.** Phone accepted "abc" (`type=tel`, no `pattern`, `maxLength` 16, `checkValidity()` true, no `aria-invalid`).
- Unsaved edits do survive a switch between in-page tabs. I typed "test" in Full Name, went to Docs, came back to Profile, and "test" was still there. With no dirty indicator, that makes stale unsaved edits easy to forget.

---

## 2. Section-by-section observations

### 2.1 Profile (in-page, default) – `c1_settings_profile.png`, `c2_profile_scroll2.png`
- There is an H2 "Profile Settings" (Sora 18px/700) and a mono subtitle "Update your personal information" (12px, 3.52:1).
- **Identity card:** an eyebrow reading "§ IDENTITY" (10px mono, letter-spaced), plus EMAIL (the account email) and STATUS (APPROVED, green). Labels are 10px at 3.52:1.
- **Full Name:** text input, 576x43. The label is a `<label>` with no `for` that doesn't wrap the input, so **the input has no programmatic label** and its accessible name falls back to the placeholder "Your name". The same applies to Phone.
- **Phone:** `type=tel`, placeholder "+91...", empty. No format help or validation.
- **Subdomain:** the helper text (10px mono) literally shows backticks: "The leftmost label of your team URL — \`{slug}.vaanilabs.in\`. You can change it once or twice; downstream links keep working but bookmarks won't auto-update." That means raw Markdown is rendered as text, and the quota is vague ("once or twice"). Below it are a LIVE pill, the current subdomain and a small "Edit" button with its own save flow (not exercised).
- **WhatsApp Brochure:** a native file input ("Choose file / No file chosen", in browser-default styling) and an Upload button, disabled until a file is chosen.
- **Google Account** and **Microsoft Account:** each shows a NOT CONNECTED dot label and a full-width "Connect … Account" button.
- **Scope problem:** this "personal information" page mixes personal fields (name, phone), an org-level setting (the team subdomain), agent content (the WhatsApp brochure) and integrations (Google, Microsoft). Calendly, Meta, HubSpot and Salesforce integrations live under other items.
- The inner scroll container is `div.flex-1.overflow-y-auto` (scrollHeight 1002 vs clientHeight 796). The page itself does not scroll, so a `fullPage` screenshot equals the viewport.

### 2.2 Organization – `/settings/organization` – `c5_organization.png`, `c4_organization.png` (loading)
- While loading, the page shows a full-screen "Loading…" **without the app rail**. The shell flashes away (`c4_organization.png`).
- Once loaded, it shows a thin "← BACK TO SETTINGS" bar, then an H1 "Organization" in **JetBrains Mono 24px** (every other page uses Sora), a mono subtitle, and a dashed empty-state box: "You aren't an admin of any organization yet… Ask your org admin to grant you the admin role, **or create your own org below.**" **Nothing is below** except "Browse organizations →", which goes to `/admin/organizations`.
- `/admin/organizations` (`c15_admin_orgs.png`) has an H1 "Organizations" (mono) and "No organizations yet. **Create one to get started.**" There is **no create control** on the page (the only button in `main` is an unlabeled icon button). This is a dead end. See finding 02.
- `/admin` redirects this user to `/dashboard`.

### 2.3 Notifications – `/settings/notifications` – `c4_notifications.png`
- It has **three ways back to Settings**: the "BACK TO SETTINGS" bar, "← Settings" on the right of the header, and a "§ SETTINGS / NOTIFICATIONS" breadcrumb. The WhatsApp card adds a fourth, "back to settings".
- The header reads "🔔 NOTIFICATIONS" (Sora 18px, uppercase letter-spaced). Below it is an **editorial two-tone H2** at Sora 28px: "Choose how Vaani Labs / reaches you." with the second line in blue.
- "Changes save automatically. Critical security alerts will still be delivered…" states the save model clearly (good).
- **Email card:** the account email, then 4 switches (`role=switch`, labelled): Call summaries (on), Low balance (on), Security alerts (on), Product updates (off).
- **WhatsApp card:** a LOCKED badge, "No number on file", and "Add a WhatsApp number first → back to settings". The two switches are disabled. **Profile has no WhatsApp-number field**, only a generic Phone, so the instruction has no destination (dead end).
- The "RESET TO DEFAULTS" button is disabled.

### 2.4 Call channel – `/settings/call-channel` – `c5_call_channel.png`
- There are two back links (the bar plus "← Settings"). The H1 "Call channel" is JetBrains Mono 24px, and the page is entirely mono.
- It offers three radio cards (radios wrapped in labels, name `channel`): Phone (PSTN), the default and selected; Browser softphone; and Auto (browser if online, else phone).
- "Save preference" is grey and disabled until the selection changes (per-page save model #3).
- An orange "Heads up" box says: "Browser/Auto channels currently fall back to PSTN until the in-browser softphone bridge ships…" But the product already has a **Rep Console** browser softphone in the main nav, and the copy contradicts it.

### 2.5 Calling number – `/settings/calling-number` – `c6_calling_number.png`
- A different template again. The "← Settings" link sits 10 px under the "BACK TO SETTINGS" bar. There is an icon tile with the H1 "Your calling number" (Sora 20px), a 3-step stepper ("1 · OWNED — 2 · COMPLIANCE — 3 · AUTHORIZED"), and the card "Step 1 — verify ownership". It has a phone input with no visible label (placeholder "+91 98XXXXXXXX") and a **pill-shaped** "Send code" button, disabled when empty.
- Buttons here are `rounded-full` pills. Elsewhere in Settings they are 6–8 px radius rectangles.

### 2.6 Calendly – `/settings/calendly` – `c6_calendly.png`
- Same template as Calling number: an icon tile, the H1 "Calendly" (Sora 20px), a card "Connect your Calendly account" explaining the OAuth redirect, and a pill "Connect Calendly" button.
- IA: Calendly is a calendar integration but sits apart from "Integrations", while the Google and Microsoft calendar connections sit in Profile. Calendly and Integrations also **share the same plug icon** in the sub-nav.

### 2.7 Security – `/settings/security` – `c7_security.png`
- Three back links again (bar, "← SETTINGS" and the "SETTINGS / SECURITY" breadcrumb). The H1 **"Two-factor authentication"** (Sora 30px) is not "Security".
- The whole page is one card: "DISABLED — Add a second factor", an **Enable** button, and a note that TOTP is supported but WebAuthn and SMS are not.
- **Missing** for a "Security" section: password change, active sessions and devices, "sign out of other sessions", recent sign-ins (Activity is a separate item) and SSO status.
- On this page the document scrolls (a page-level scrollbar appears at x≈1431 and the banner buttons shift left by 10 px) even though the content is short (inferred: a min-height of 100vh plus the banner).

### 2.8 Activity & Audit – `/settings/activity` – `c7_activity.png`
- A fifth template: a grid-paper background, the eyebrow "APPEND-ONLY LEDGER · 365D RETENTION", the H1 "Account Activity" at **Sora 36px**, and a content width of 1088 px (x=207, much wider than the others).
- It has a Refresh button and **"Suspicious activity?" (red outline), which links to `/settings`**. That lands on Profile, a dead end.
- There are 13 filter chips (All, Auth, Account, Flows, API, Billing, Admin, Security, Integrations, Orgs, Knowledge Base, Agents) and a Date range dropdown. The table columns are TIME, EVENT, TARGET, IP, AGENT.
- On **All** it shows "Nothing in this slice yet." Yet this account has placed calls, owns many flows and requested a data export on 21/09/2026 (see 2.12). An "every security-relevant event" ledger with zero rows is either not logging or scoped wrongly (inferred). No explanation is given.
- The footer reads "ROWS IMMUTABLE · IPS MASKED · RETAINED 365 DAYS".

### 2.9 API Keys – `/api-keys` – `c8_api_keys.png`
- The page is **outside `/settings`** and has **no back link and no active rail item** (verified: no sidebar link carries the active `rgb(47,95,224)` indicator). It is an orphan page.
- It has an eyebrow "PUBLIC API", an H1 "API Keys" (Sora 24px), and instructions: "paste it as Authorization: Bearer vv_live_…". Refresh sits on the right.
- **Create a new key** card:
  - A NAME input with placeholder "e.g. production webapp".
  - A SCOPES group of 4 checkbox cards, all checked: Textvoice, Voicebot ("…over Twilio"), Meeting agent ("Vikash on a LiveKit meeting room"), Plain meeting.
  - A RATE LIMIT slider (1–600, recommended 60, shows "60 / min").
  - "+ Mint key".
- The "Your keys" section reads "No keys yet. Mint one above."
- Good: the "shown exactly once — we only store the hash" warning.

### 2.10 Embed – `/api-keys/embed` – `c8_embed.png`, `c9_embed_snippet.png`
- A sixth template, a **magazine layout**: the eyebrow "VOL. I — ISSUE 04 / EMBED HANDBOOK" and an H1 "Paste once. Speak everywhere." at **Sora 70.4px** with a gradient italic second line. Sections are numbered § 00–§ 04.
- § 00 "API keys on this account" shows "You don't have any keys yet." and a "CREATE YOUR FIRST KEY" button.
- **The code snippets are visibly corrupted.** The syntax highlighter re-processes its own output. The rendered `<pre>` text starts:
  `<"vv-attr">class="vv-tag">div "vv-attr">id="vaani-voice"></"vv-attr">class="vv-tag">div>`
  and the innerHTML contains nested broken `<span <span="" class="&lt;span">` tags. The `//` inside `https://…` is also styled as a comment (grey italic). All 4 snippets are affected.
- **"Copy" copies clean code.** I intercepted `navigator.clipboard.writeText` and got the correct `<div id="vaani-voice"></div><script src=".../embed/v1/vaanivoice.js" defer>…`, and the button changes to "Copied". So the bug is display-only, but anyone reading or hand-typing the snippet gets broken HTML.
- The right-hand "LIVE PREVIEW" column is only **182 px wide**. Its card titles are clipped (only "widget" and "voicebot bubble" are visible) and the body wraps at about 3 words per line.

### 2.11 Webhooks – `/webhooks` – `c10_webhooks.png`, `c11_webhook_new.png`, `c11_webhook_invalid.png`
- Also outside `/settings`, with no back link. H1 "Webhooks". Refresh and a "+ New webhook" button. The empty state reads "No webhooks yet". A "Verifying signatures" card mentions the `X-VaaniVoice-Signature: sha256=<hex>` header.
- **New webhook** modal:
  - Fields: NAME ("My CRM hook") and HTTPS URL (`type=url`, placeholder `https://example.com/vaanivoice/webhook`).
  - EVENTS chips: call.completed, call.failed, meeting.ended, lead.created, usage.charged, low_balance.warned. The default selection state is not visually clear.
  - Buttons: Cancel and Create webhook.
  - The container is **not `role="dialog"`** and the close "×" button **has no accessible name**.
  - When I typed "not-a-url", `checkValidity()` was false but **"Create webhook" stayed enabled** and no inline error appeared.
  - The backdrop is a light translucent veil, and background text ("No webhooks yet…") shows through behind the modal title.
- `/webhooks/deliveries` exists (200) but shows "Webhook not found." when opened without an id. The unlabeled back link reads "← Webhooks".

### 2.12 Integrations – `/settings/integrations` – `c12_integrations.png`
- **Two identical back links**: the "BACK TO SETTINGS" bar and a second "← Back to Settings". The H1 "Integrations" uses **system sans 24px** (not Sora).
- The intro copy exposes engineering status: "Meta surfaces still create a **stub row until app-review credentials are ready**."
- There are 5 cards: Instagram, Facebook, WhatsApp, HubSpot and Salesforce. **All 5 Connect buttons are disabled.** The reason appears only at the bottom, below the fold: "You aren't an admin of any organization yet — … create your own org from **/admin/organizations**" (a raw path used as link text). That leads to the dead end in 2.2.
- Card copy is written for developers: "Same Meta App; separate webhook surface", "Chat surface lives in the agent backend", "Two-way sync deferred to a follow-up", "so lookup connectors can read Contacts during pilot calls".
- HubSpot uses a lightning-bolt icon and Salesforce a generic cloud. No brand marks are used.

### 2.13 Meetings Billing (in-page) – `c3_meetings_billing.png`, `settings_meetings_billing_bottom.png`
- H2 "Meetings Billing". A usage card shows "29 / 30 min", "29 free • then ₹2.40/min", CURRENT PLAN "Pay as you go" and a progress bar ("1 of 30 minutes used").
- **Choose a plan** has 4 cards squeezed into the 576 px column, about 132 px each:
  - Prices wrap onto two lines ("₹499/ / mo", "₹1,999 / /mo").
  - Descriptions are truncated ("Solo founders running…", "No commitment…").
  - "Pay as you go" wraps.
  - All plan text is 11–12 px mono.
- The PAYG card says "**Free** / **Unlimited included** / then ₹2.40/min", which contradicts "30 free min / month" in the same card.
- The "Upgrade" buttons were not clicked.
- The "Usage — last 6 months" chart has no visible bars (SEP = 1 min renders as nothing).
- The footer says "PAYG charges debit your existing wallet. Top up or enable UPI Autopay from the main billing page. [Open wallet → /billing]".
- IA: meeting plans live in Settings, the wallet lives at `/billing`, and the global banner points to `/settings#wallet`. See finding 10.

### 2.14 Data Export – `/settings/data-export` – `c12_data_export.png`
- Two back links ("BACK TO SETTINGS" bar plus the "← SETTINGS / DATA EXPORT" breadcrumb header). Refresh sits on the right.
- The card "RIGHT TO DATA PORTABILITY — Download your Vaani Labs data" clearly lists the archive contents, notes that audio is not bundled, and says "One export per 24 hours per account."
- "MOST RECENT EXPORT" shows Requested 21/09/2026 15:39:11, Completed 15:39:12, Size 132.7 KB, Status READY.
- **Two equal-weight primary blue buttons**: a full-width "Download (.zip)" (a signed storage URL that expires in 1 h) and "Request a new export". The copy says both "One export per 24 hours" and "Re-request anytime" (it means re-signing the link, but reads as contradictory).

### 2.15 Change Email – `/settings/change-email` – `c13_change_email.png`, `c23_change_email_input.png`
- It has three back links (bar, "← Settings", "§ SETTINGS / EMAIL"), **two H1s** ("CHANGE EMAIL" and "Move your login / to a new address.", Sora 36px two-tone), and a centred card 478 px wide.
- It shows the current email (read-only), a NEW EMAIL input and "Send confirmation links →", plus a green note: "Both addresses must confirm. Until both links are clicked, your login stays on [current]." The flow is well explained.
- **Icon overlap:** the "@" icon spans x 565–579 while the input text starts at x=567 (padding-left 14 px), so the placeholder renders as "@ew-address@company.com".
- With "not-an-email" typed, `checkValidity()` is false but **"Send confirmation links" becomes enabled** and no inline error appears.

### 2.16 Docs (in-page) – `c3_docs.png`
- H2 "Documentation", subtitle "Guides and API references for **Vani Voice**" (a third spelling of the brand).
- There are 5 rows, each with an external-link icon, all opening in the same tab:

| Row | Link | Status |
|-----|------|--------|
| API Reference | `/docs/api` | **200** |
| Embed Guide | `/docs/embed` | **404** |
| Webhook Events | `/docs/webhooks` | **404** |
| Integrations Guide | `/docs/integrations` | **200** |
| Flow Builder Guide | `/docs/flows` | **404** |

- The three 404s also appear as console errors every time `/settings` loads (Next.js prefetch).
- The public `/docs` index only links `/docs/samples`, `/docs/api` and `/docs/integrations`.
- The 404 page (`c14_docs_embed_404.png`) sits **outside the app shell**. It says "404 / SIGNAL LOST / Page Not Found / The neural pathway you're looking for doesn't exist or has been relocated to a different sector. / ERR: 0x404 • NODE: MUMBAI-1 • STATUS: DISCONNECTED". A signed-in user who clicks a Settings link is shown "STATUS: DISCONNECTED".

### 2.17 Delete Account – `/settings/delete` – `c13_delete_account.png`
- The breadcrumb header "← SETTINGS / DELETE ACCOUNT" is in red. A red-tinted card reads "Delete your Vaani Labs account — This is reversible for 7 days, after which your data is permanently removed." It does not say how to reverse.
- WHAT GETS DELETED lists 6 items and WHAT WE KEEP lists 2 ("required for **app-store** compliance…" – odd for a web product).
- An optional reason textarea, then a type-your-email confirmation. "DELETE MY ACCOUNT" is disabled until the email matches. There is a Cancel link to /settings.
- This is the best-built page in Settings. Section eyebrows are blue on a destructive page, which is a minor mismatch.

### 2.18 Onboarding – `/onboarding` – `c14_onboarding.png`
- It is still reachable after completion: "VAANI LABS — first run", a CLOSE link, and 5 steps (Profile, Subdomain, Flow, Test Call, Done), all checked. It reads "You're *live*." and offers 3 doors (Flow Builder, Call Reports, Analytics) plus "Go to dashboard".
- It is not linked from Settings or Help.
- **Horizontal overflow at 1440 px:** `main` scrollWidth is 1486 vs clientWidth 1358, caused by a decorative blob (`absolute -right-32`). A horizontal scrollbar is visible at the bottom.

### 2.19 The wallet banner (every page)
- "⚠ Wallet empty — top up now to keep calls flowing. [Top up] [Enable autopay] [×]".
- The container has `role="alert"`, so screen readers announce it again on every navigation.
- **Top up → `/settings#wallet`** and **Enable autopay → `/settings#autopay`**. Both land on Profile Settings, and they do so **even on the `/billing` page itself**, where the real Top-up and Autopay controls are (`c20_billing.png`).

---

## 3. Global navigation model

### 3.1 Left rail (desktop)
- The rail is 72 px wide, icon-only, with 12 links (44x44 hit area, 48 px pitch starting at y=92). Labels come only from the native `title` attribute; there is no custom tooltip and none appeared on hover (`c18_sidebar_hover.png`). No link has `aria-current`.
- Order: Assistant, Agent View (/dashboard), Analytics, Leads, Flow Builder, Meet Agent (/meeting-agent), Personal Agents, Rep Console, Call Reports, Billing, Knowledge, Settings. The list is **flat, with no groups or separators**.
- **Overflow at 1440x900:** the nav's clientHeight is 548 and scrollHeight 572. Settings, the 12th item (y 620–664), is **clipped by 24 px** at the bottom of the scroll area, and scroll arrows show. The nav also scrolls sideways (scrollWidth 175 vs clientWidth 44, because hidden labels overflow), so a horizontal scrollbar with ◂ ▸ arrows appears under the Settings icon in every screenshot.
- **Active state is missing** on every `/settings/*` sub-page, `/api-keys`, `/api-keys/embed` and `/webhooks`. I checked for the blue indicator: `activeOnSub = []`. By contrast, `/billing`, `/analytics` and `/leads` do show it.
- The footer has a status dot and "12ms" (latency), Sign Out, a theme toggle (sun icon labelled "DARK" when expanded) and Expand.
- **Expanded** (240 px, `c19_sidebar_expanded.png`): the labels match the titles above. Status reads "SYS:ONLINE 20ms", then "Sign out", "DARK", and "Collapse [" (a stray "[" glyph, probably a shortcut hint). Expanded rail plus Settings sub-nav takes 464 px of horizontal space before any content.

### 3.2 Mobile (390x844) – `c21_mobile_settings.png`, `c21_mobile_notifications.png`
- The rail is `display:none`. A **bottom tab bar** (56 px) has 7 items at 11 px: **Assistant, Agent, Leads, Reports, Billing, Knowledge, Exit**. "Exit" is a `<button>` that signs the user out.
- **Missing on mobile:** Settings, Analytics, Flow Builder, Meet Agent, Personal Agents and Rep Console. The only visible route into Settings on mobile is the wallet banner's "Top up" link, which itself is broken (it lands on Profile).
- The Settings sub-nav becomes a horizontal scroller **2300 px wide** showing about 2.5 of 17 items, with no scroll affordance beyond a thin scrollbar.
- The header shows a "Save" button (83x44).

### 3.3 Names: sidebar vs page title vs other surfaces

| Route | Rail label (desktop) | Mobile tab | Page H1 / title | Other references |
|---|---|---|---|---|
| /dashboard | Agent View | Agent | **AGENT COCKPIT** | Onboarding "Go to dashboard"; Rep Console "← Dashboard" (per explore-core) |
| /meeting-agent | Meet Agent | — | "Meeting Agent — Vikash" (per explore-core) | API scope "Meeting agent" |
| /knowledge | Knowledge | Knowledge | **AGENT KNOWLEDGE** | Delete page "knowledge embeddings" |
| /call-reports | Call Reports | **Reports** | Call Reports | Onboarding "Call Reports" |
| /analytics | Analytics | — | "Analytics" (Sora **15px**) + editorial H2s 27px | — |
| /flow-builder | Flow Builder | — | (per scout) "Flow Builder — Voice journey workspace" | Docs "Flow Builder Guide" (404); Onboarding step "FLOW"; Delete page "Flow templates"; `/flow-designer` 404 |
| /settings/security | Security | — | **Two-factor authentication** | — |
| /settings/activity | Activity & Audit | — | **Account Activity** | eyebrow "APPEND-ONLY LEDGER" |
| /settings/calling-number | Calling number | — | Your calling number | — |
| /settings/change-email | Change Email | — | CHANGE EMAIL + "Move your login to a new address." | — |
| /api-keys/embed | Embed | — | "Paste once. Speak everywhere." | Docs "Embed Guide" (404) |
| brand | VAANI LABS (logo) | — | "Vaani Labs" | "Vani Voice" (Docs, embed), "VaaniVoice" (signature header, JS global), `vv_live_` keys |

- The word "agent" covers 5 different things: Agent View/Cockpit (the phone voice agent), Meet Agent (Vikash in meetings), Personal Agents (autonomous tasks), Agent Knowledge (RAG) and Assistant (the in-app copilot, which is also an agent).
- Casing drifts between pages: "Call channel" and "Calling number" are sentence case, while "Activity & Audit", "Change Email" and "Delete Account" are title case in the same list.

### 3.4 Route inventory (status from same-origin GET; "rendered" means opened in my tab)

**Authenticated app routes that exist**

| Route | Status | Notes |
|---|---|---|
| /assistant, /dashboard, /analytics, /leads (?page=1&size=50), /flow-builder, /meeting-agent, /personal-agents, /rep-console, /call-reports, /billing, /knowledge (?page=1&size=20), /settings | 200 | the 12 rail destinations |
| /settings (in-page: Profile, Meetings Billing, Docs) | 200 | the in-page panels have no URL |
| /settings/organization, /notifications, /call-channel, /calling-number, /calendly, /security, /activity, /integrations, /data-export, /change-email, /delete | 200, rendered | leave the Settings shell |
| /api-keys, /api-keys/embed, /webhooks | 200, rendered | outside /settings; no back link, no active nav |
| /webhooks/deliveries | 200, rendered | "Webhook not found." without an id (inferred: expects `?id=`) |
| /onboarding | 200, rendered | first-run wizard, still reachable; not linked anywhere I saw |
| /admin/organizations | 200, rendered | org list; no create control (dead end) |
| /admin | 200 → client redirect to /dashboard | admin area, gated |

**Probed and not found (404)**
- Settings-related: /profile, /team, /integrations, /help, /wallet, /settings/wallet, /settings/profile, /settings/billing, /settings/api-keys, /settings/webhooks, /settings/team, /settings/members, /notifications.
- Feature guesses: /reports, /campaigns, /agents, /home, /contacts, /app, /inbox, /meetings, /flow-designer, /flow-builder/new, /knowledge-base, /usage, /api-keys/usage.
- /flows and /calls return a different 22-byte 404 body; the inferred cause is a route handler or middleware rather than the Next not-found page.
- The Settings Docs targets /docs/embed, /docs/webhooks and /docs/flows are also 404.

**Public docs**
- /docs, /docs/api and /docs/integrations return 200. /docs/samples is linked from /docs (not fetched).

### 3.5 Duplicated or split destinations
- **Billing is split three ways:**
  - `/billing` (wallet, UPI autopay, recharge, history; sidebar)
  - Settings › Meetings Billing (meeting-minute plans with Upgrade; not linkable)
  - the banner, which targets `/settings#wallet` and `/settings#autopay` (neither exists)
  - `/billing` copy also says "for automatic mandate-based recharge, use **Pricing**", and no in-app "Pricing" exists.
- **Integrations are split four ways:** Profile (Google, Microsoft), Settings › Calendly, Settings › Integrations (Meta ×3, HubSpot, Salesforce), and the developer surfaces (API Keys, Embed, Webhooks) at top-level routes.
- **Phone numbers live in three places:** Profile "Phone", Settings › Calling number (verified caller-ID) and Notifications' WhatsApp number (no field anywhere). The Call channel PSTN option "forwards the caller to your phone number" without saying which one.
- **Security and identity are split:** Security (2FA only), Change Email (separate), Activity & Audit (separate), Delete Account (separate). There is no password or session management.
- **Docs appear three ways:** Settings › Docs (3 of 5 links broken), public /docs, and the in-app Embed handbook (the actual embed guide, not linked from Docs).
- **Org and team:** Settings › Organization and /admin/organizations each send you to the other, and neither can create an org.
- **"Call Reports" vs "Analytics":** Onboarding describes Call Reports as "transcripts, sentiment, outcome" and Analytics as "Volume, conversion, intent clusters". Both surfaces show sentiment (per scouting), so the boundary is fuzzy (inferred).

---

## 4. Findings

Severity: critical = blocks a core task or a serious barrier; high = major friction or unprofessional; medium = noticeable; low = polish.

### EXPLORE-SETTINGS-01 — The wallet banner's "Top up" and "Enable autopay" lead to Profile Settings, even from /billing (critical, functional-bug / ia-navigation)
**Evidence:**
- The banner links are `href="/settings#wallet"` and `href="/settings#autopay"` on every page, including `/billing`.
- Neither id exists on /settings; the page renders "Profile Settings" at scrollTop 0 (`c16_settings_hash_wallet.png`, `c20_billing.png`).
- The banner is the only recovery CTA for the "Wallet empty" state that blocks calls. On mobile, whose bottom bar has no Settings, it is also the only route into Settings.

**Recommendation:**
- Point both CTAs at `/billing#top-up` and `/billing#autopay`, add those anchors (or open a top-up drawer in place), and hide the banner's Top up on /billing itself.
- Add a server-side redirect from `/settings#wallet` for old links. Since hashes don't reach the server, handle this with client-side hash handling on /settings that forwards to /billing.

### EXPLORE-SETTINGS-02 — Organization and team setup is a circular dead end, so all integrations are locked (critical, ux / ia-navigation)
**Evidence:**
- `/settings/organization`: "…or create your own org below." Nothing is below except "Browse organizations" (`c5_organization.png`).
- `/admin/organizations`: "No organizations yet. Create one to get started." There is no create button (`c15_admin_orgs.png`).
- `/settings/integrations`: all 5 Connect buttons are disabled because "You aren't an admin of any organization yet … create your own org from /admin/organizations" (`c12_integrations.png`).
- The user cannot invite teammates or connect Instagram, Facebook, WhatsApp, HubSpot or Salesforce.

**Recommendation:**
- Add a "Create organization" primary action (name + subdomain) to the Organization page and to the /admin/organizations empty state. For a solo account, consider auto-creating a personal org on signup.
- On Integrations, show the lock reason next to each disabled button, with a direct "Create organization" CTA.

### EXPLORE-SETTINGS-03 — Three of five Settings › Docs links are 404s and land on an off-shell "SIGNAL LOST / STATUS: DISCONNECTED" page (high, functional-bug)
**Evidence:**
- `/docs/embed`, `/docs/webhooks` and `/docs/flows` return 404; `/docs/api` and `/docs/integrations` return 200.
- The 404s also appear as 3 console errors on every /settings load, from prefetch.
- The 404 page has no app rail and uses sci-fi copy (`c14_docs_embed_404.png`).

**Recommendation:**
- Point "Embed Guide" to `/api-keys/embed`, "Webhook Events" to a real `/docs/api#webhooks` section, and "Flow Builder Guide" to a real page (or remove it).
- Render authenticated 404s inside the app shell with plain copy and links to Settings and Docs.
- Add a link check to CI for in-app doc links.

### EXPLORE-SETTINGS-04 — Embed snippets render corrupted HTML (the highlighter double-processes its own markup) (high, functional-bug / trust-safety)
**Evidence:**
- The rendered first line is `<"vv-attr">class="vv-tag">div "vv-attr">id="vaani-voice">…`, and the innerHTML has nested `<span <span="" class="&lt;span">`.
- The `//` in `https://` is styled as a comment. All 4 snippets are affected (`c9_embed_snippet.png`).
- Copy yields clean code (verified via an intercepted clipboard), so what users read differs from what they paste.

**Recommendation:**
- Escape first and tokenize once, or use a proven highlighter (Shiki or Prism) at build time.
- Add a visual regression test that snapshots the snippet's `textContent` against the copy payload.

### EXPLORE-SETTINGS-05 — The Settings sub-nav mixes 3 in-page tabs with 14 links that leave the shell, and a misleading "external" icon marks the difference (high, ia-navigation)
**Evidence:**
- Profile, Meetings Billing and Docs are `<button>` panels with no URL change.
- The other 14 items are `<a>` full navigations to 14 separately designed pages without the sub-nav, 3 of them outside `/settings` (`/api-keys`, `/api-keys/embed`, `/webhooks`).
- Those 14 carry a 10 px external-link glyph (aria-hidden) but open in the same tab (`S.popups` stayed empty).
- Sub-pages replace the sub-nav with 1–3 back links.

**Recommendation:**
- Make every item a real nested route under a persistent Settings layout (`/settings/<group>/<page>`) that keeps the sub-nav visible and highlights the current item with `aria-current="page"`.
- Remove the external-link glyph, and use it only for true external destinations (public docs, which then open in a new tab).

### EXPLORE-SETTINGS-06 — The global "Save Changes" is always enabled, applies only to two Profile fields, disappears on other tabs, and nothing guards unsaved edits (high, ux)
**Evidence:**
- The button sits in the page header ("SETTINGS … Save Changes") and `disabled` is always false.
- The Profile panel's Subdomain, Brochure, Google and Microsoft each have their own action.
- The button is hidden on Meetings Billing and Docs, and the header shifts 9 px.
- Across Settings there are 7 different save models (autosave, "Save preference", Send code, Send confirmation links, Create webhook, Mint key, Save Changes).
- I typed "abc" into Phone and navigated away: no prompt, and the edit was lost. Phone accepts "abc" as valid.

**Recommendation:**
- Adopt one rule: forms save through a section-scoped sticky save bar ("You have unsaved changes · Discard · Save") that appears only when dirty, and toggles autosave with a toast.
- Add route-change and beforeunload guards for dirty forms.
- Validate phone as E.164 with the +91 default and an inline error.

### EXPLORE-SETTINGS-07 — Wayfinding breaks outside /settings: no active rail item, orphan developer pages, and the Settings icon clipped in the rail (high, ia-navigation)
**Evidence:**
- None of the 12 rail links is active on `/settings/*`, `/api-keys`, `/api-keys/embed` or `/webhooks` (DOM check).
- API Keys, Embed and Webhooks have no back link.
- At 1440x900 the rail nav's clientHeight is 548 vs scrollHeight 572, so the 12th item (Settings) is clipped by 24 px. The rail also scrolls sideways (scrollWidth 175 vs clientWidth 44), showing ◂ ▸ scrollbar arrows under the Settings icon (`c1_settings_profile.png`, `c18_sidebar_hover.png`).
- The rail has no `aria-current` and no visible labels; names come only from native `title`.

**Recommendation:**
- Match the active item by route prefix (e.g. `/settings`, `/api-keys` and `/webhooks` all highlight Settings, or Developers once regrouped), and set `aria-current`.
- Set `overflow-x: hidden` on the collapsed rail.
- Move Settings and Billing into the pinned footer group so they are never clipped, or reduce the pitch to 44 px.
- Add hover and focus tooltips that render in-app.

### EXPLORE-SETTINGS-08 — On mobile, 6 of 12 destinations including Settings have no entry point, and "Exit" (sign out) takes a primary tab slot (high, responsive)
**Evidence:**
- At 390x844 the rail is `display:none`. The bottom bar holds Assistant, Agent, Leads, Reports, Billing, Knowledge and Exit (a sign-out button).
- Settings, Analytics, Flow Builder, Meet Agent, Personal Agents and Rep Console are unreachable except by URL.
- The Settings sub-nav becomes a 2300 px horizontal strip showing about 2.5 of 17 items (`c21_mobile_settings.png`).

**Recommendation:**
- Use 4–5 primary tabs plus a "More" sheet listing every destination grouped as in section 5, and move Sign out into an account menu.
- On mobile, render Settings as a list page (the index) that drills into sections, not a horizontal chip strip.

### EXPLORE-SETTINGS-09 — Settings uses at least 6 visual templates, with page title size, font and position varying widely (high, consistency)
**Evidence (measured H1s and content columns):**

| Page | H1 | Content column (x / width) |
|---|---|---|
| Profile | "SETTINGS", Sora 18px uppercase letter-spaced | 575 / 576 |
| Organization | JetBrains Mono 24px | 500 / 512 |
| Call channel | Mono 24px | 436 / 640 |
| Calling number, Calendly | Sora 20px + icon tile + pill buttons | 420 / 670 and 487 / 538 |
| Notifications, Change Email | Sora 18px uppercase header + editorial two-tone H2/H1 at 28–36px | 471 / 560 and 517 / 478 |
| Security | Sora 30px | 391 / 720 |
| Activity | Sora 36px on grid paper | 207 / 1088 |
| API Keys | Sora 24px | 260 / 992 |
| Embed | Sora 70.4px magazine | — |
| Integrations | system sans 24px | — |
| Data Export, Delete | Sora 18px uppercase breadcrumb header | — |

- Buttons alternate between pills and 6–8 px radius rectangles.

**Recommendation:** use a single `SettingsPage` template: a persistent sub-nav plus a content column of fixed left inset and max width (e.g. 720 px) with a 24 px Sora semibold sentence-case H1, a 14 px description, right-aligned actions, one button radius and one card style. Use editorial or magazine treatments on marketing pages only.

### EXPLORE-SETTINGS-10 — Billing is split between /billing, Settings › Meetings Billing and a broken banner, and the plan cards are cramped and contradictory (high, ia-navigation / content-copy)
**Evidence:**
- Meeting plans (Upgrade) exist only in an unlinkable Settings tab. The wallet and autopay live at /billing, which never mentions meeting plans.
- /billing says "use Pricing", which doesn't exist in-app.
- The 4 plan cards are about 132 px wide in a 576 px column: prices wrap ("₹499/ / mo"), descriptions are truncated ("Solo founders running…") and everything is 11–12 px mono.
- The PAYG card reads "Free / Unlimited included / then ₹2.40/min" next to "30 free min / month".
- The 6-month usage chart shows no bars even for SEP (1 min) (`c3_meetings_billing.png`, `settings_meetings_billing_bottom.png`).

**Recommendation:**
- Make /billing the single billing hub with sub-tabs Wallet & top-up · Autopay · Plans (voice minutes, meeting minutes) · Usage · Invoices, and remove Meetings Billing from Settings.
- Lay plans out full-width (4 × about 260 px) or as a comparison table.
- Fix the PAYG copy to "30 free min/month, then ₹2.40/min".
- Give the chart a y-axis and value labels.

### EXPLORE-SETTINGS-11 — Settings copy leaks internal engineering notes, raw Markdown and raw paths (medium, content-copy)
**Evidence:**
- Integrations: "stub row until app-review credentials are ready", "Two-way sync deferred to a follow-up", "Chat surface lives in the agent backend", "lookup connectors … during pilot calls", and the link text "/admin/organizations".
- Call channel: "until the in-browser softphone bridge ships", while Rep Console already exists.
- Profile: literal backticks "\`{slug}.vaanilabs.in\`" and "You can change it once or twice".
- Delete: "required for app-store compliance".

**Recommendation:** do a copy pass. State user-facing status ("Coming soon", "Beta: leads sync one way to HubSpot"), render inline code properly, state exact limits ("You can change your subdomain 2 times"), and use human link text ("Create an organization").

### EXPLORE-SETTINGS-12 — The brand is spelled 4+ ways inside Settings (medium, content-copy)
**Evidence:** "Vaani Labs" (most pages), "Vani Voice" (Docs subtitle "Guides and API references for Vani Voice", Embed guide row "Add a Vani Voice widget"), "VaaniVoice" (the `X-VaaniVoice-Signature` header, the `VaaniVoice.textvoice()` global, the placeholder `example.com/vaanivoice/webhook`), and "VAANI / LABS" (logo).

**Recommendation:** pick a product name and developer namespace (e.g. brand "Vaani Labs", SDK "Vaani"), update the UI copy, and document any legacy header or global name as an alias.

### EXPLORE-SETTINGS-13 — Rail labels, page titles and mobile tab labels disagree for the same destinations (medium, ia-navigation)
**Evidence:**
- "Agent View" → "AGENT COCKPIT" (mobile "Agent"; onboarding "Go to dashboard"; route /dashboard).
- "Meet Agent" → "Meeting Agent — Vikash".
- "Knowledge" → "AGENT KNOWLEDGE".
- "Call Reports" → mobile "Reports".
- "Security" → "Two-factor authentication".
- "Activity & Audit" → "Account Activity".
- "Calling number" → "Your calling number".
- "Change Email" → "Move your login to a new address."
- Five different concepts are all called "agent".

**Recommendation:**
- Use one noun per destination, used identically in the rail, mobile bar, H1, `<title>` and route.
- Suggested names: "Live calls" (/calls), "Meetings" (/meetings), "Tasks" (Personal Agents), "Knowledge", "Call log" (/calls/history) or "Reports", "Security".
- Rename routes with redirects.

### EXPLORE-SETTINGS-14 — "Security" offers only 2FA: no password change, sessions or devices, and no "sign out everywhere" (medium, ux)
**Evidence:** `/settings/security` has a single card, "Add a second factor — Enable" (`c7_security.png`). Change Email, Activity and Delete are separate items, and no password or session controls exist anywhere in Settings.

**Recommendation:** make Security a hub with Password (change or set, including for OAuth users), Two-factor, Active sessions and devices (with revoke and "sign out of all other sessions"), Recent sign-ins (linking to a filtered Activity) and Email & login (absorbing Change Email).

### EXPLORE-SETTINGS-15 — Up to four redundant "back to Settings" controls per page (medium, ia-navigation)
**Evidence:**
- Notifications has the "BACK TO SETTINGS" bar, the "← Settings" header link, the "§ SETTINGS / NOTIFICATIONS" breadcrumb, and "back to settings" inside the WhatsApp card.
- Change Email and Security have 3; Integrations has 2 identical "Back to Settings"; Calling number, Calendly and Call channel have 2.
- The bar alone costs 42 px of height.

**Recommendation:** with a persistent Settings layout (finding 05) none are needed. Otherwise keep exactly one breadcrumb ("Settings / Notifications") in the page header.

### EXPLORE-SETTINGS-16 — Accessibility gaps in Settings forms and chrome (medium, accessibility)
**Evidence:**
- Profile "FULL NAME" and "PHONE" `<label>`s have no `for` and don't wrap the inputs, so the inputs are named only by placeholder.
- The New-webhook modal lacks `role="dialog"` and `aria-modal`, and its close button has no name.
- Helper and eyebrow text is 10 px JetBrains Mono `#7A8397` on `#F4F6FA` (3.52:1, fails AA), used for Identity labels, subdomain help and connection status. The sub-nav inactive text is 12 px at 3.52:1.
- The wallet banner is `role="alert"`, so it is re-announced on every route.
- No `aria-current` exists in the rail or the sub-nav.
- Calling-number and Change-email inputs rely on placeholders.

**Recommendation:**
- Associate labels, and use a dialog primitive with focus trap and a labelled close.
- Minimum 12 px for helper text, and a secondary-text token of at least 4.5:1 (e.g. `#5B6475` on `#F4F6FA`).
- Change the banner to `role="status"` (polite), shown once per session.
- Add `aria-current="page"`.

### EXPLORE-SETTINGS-17 — Client-side validation is missing or lets invalid input through (medium, ux)
**Evidence (client-side only; nothing was submitted):**
- Webhook URL "not-a-url": `checkValidity()` false, yet "Create webhook" is enabled with no inline message.
- Change Email "not-an-email": invalid, yet "Send confirmation links" is enabled.
- Profile Phone "abc": treated as valid.

**Recommendation:** validate on blur and submit with inline, specific errors ("Enter an https:// URL"). Disable the primary action until required fields are valid, or keep it enabled and show errors on click, but be consistent.

### EXPLORE-SETTINGS-18 — The Profile page mixes personal, org, agent-content and integration settings, and Notifications points to a WhatsApp field that doesn't exist (medium, ia-navigation)
**Evidence:**
- "Profile Settings — Update your personal information" contains the team subdomain (org-level), the WhatsApp brochure (agent content) and Google and Microsoft connections (integrations).
- Notifications says "Add a WhatsApp number first → back to settings", but no WhatsApp-number field exists; Profile has only "Phone" (`c4_notifications.png`).

**Recommendation:**
- Move Subdomain to Organization › General, the brochure to Knowledge (or Agent › Assets), and Google and Microsoft to Integrations.
- Add an explicit "WhatsApp number" (or a "use my phone for WhatsApp" toggle) on Profile, and deep-link the Notifications prompt to it.

### EXPLORE-SETTINGS-19 — Activity & Audit shows zero events for an active account, and "Suspicious activity?" links back to Profile (medium, functional-bug)
**Evidence:**
- On the All filter: "Nothing in this slice yet." The same account has a data export requested 21/09/2026 plus flows and calls (visible elsewhere).
- "Suspicious activity?" → `/settings` (Profile) (`c7_activity.png`).
- That logging is missing is inferred; the UI gives no explanation.

**Recommendation:** verify that auth, export, API and flow events are written to the ledger. Show the date range currently applied. Point "Suspicious activity?" to Security (sessions, sign out everywhere, reset password) or a support form.

### EXPLORE-SETTINGS-20 — The Change Email input icon overlaps the text (medium, visual)
**Evidence:** the "@" icon spans x=565–579 while the input text starts at x=567 (padding-left 14 px), so the placeholder renders as "@ew-address@company.com" (`c13_change_email.png`, `c23_change_email_input.png`).

**Recommendation:** set padding-left to 36 px when there is a leading icon, or remove the icon (the label already says "New email").

### EXPLORE-SETTINGS-21 — The Embed "Live preview" column is 182 px wide and clips its titles (medium, visual)
**Evidence:** the preview cards at x=1104, w=182 clip their titles ("widget", "voicebot bubble" with the top line cut), and the body text wraps about 3 words per line (`c9_embed_snippet.png`).

**Recommendation:** stack the preview below the snippet, or give it at least 360 px (the floating panel alone is 340x480).

### EXPLORE-SETTINGS-22 — Authenticated 404 and loading states drop the app shell (low, visual)
**Evidence:** `/settings/organization` first paints a full-screen "Loading…" with no rail (`c4_organization.png`). The 404 page is shell-less and says "STATUS: DISCONNECTED" (`c14_docs_embed_404.png`).

**Recommendation:** keep the layout mounted and show skeletons in the content region, and render not-found inside the shell with plain copy.

### EXPLORE-SETTINGS-23 — Onboarding overflows horizontally at 1440 px and is not discoverable after first run (low, responsive)
**Evidence:** `/onboarding` `main` scrollWidth is 1486 vs clientWidth 1358 because of a decorative `absolute -right-32` blob, which shows a horizontal scrollbar (`c14_onboarding.png`). No Settings or help entry links to it.

**Recommendation:** add `overflow-x: clip` on the decorative container, and expose "Setup guide" under Help (or Settings › Account) with per-step status.

### EXPLORE-SETTINGS-24 — Data Export has two equal primary buttons and ambiguous rate-limit copy (low, content-copy)
**Evidence:** a full-width blue "Download (.zip)" sits next to a blue "Request a new export", and the copy says both "One export per 24 hours per account" and "Re-request anytime — the same archive will be re-signed" (`c12_data_export.png`).

**Recommendation:** keep Download as the primary action and make "Request new export" secondary, showing "Available again in 3 h" when rate-limited. Reword the second line to "Link expired? Refresh to get a new link."

### EXPLORE-SETTINGS-25 — Sidebar polish issues (low, visual)
**Evidence:**
- The expanded rail shows "Collapse [" with a stray bracket.
- The theme toggle shows a sun icon with the label "DARK".
- The Calendly and Integrations sub-nav items share the plug icon; Calling number and Security use near-identical shield icons.
- There is no grouping in a 12-item rail or a 17-item sub-nav.

**Recommendation:** render the shortcut as a `<kbd>` chip ("[") or drop it. Label the toggle with the action ("Switch to dark"). Give each item a distinct icon, and group the items (section 5).

---

## 5. Proposed information architecture

### 5.1 Principles
1. One noun per destination, shared by the route, rail label, mobile label, H1 and `<title>`.
2. Rail groups follow the user's jobs: **Engage** (run calls and meetings), **Build** (teach the agent), **Insights** (review), then utility (Billing, Settings, Help) pinned to the footer.
3. Settings is a **persistent two-level layout**: a grouped sub-nav that is always visible, every item a URL, one page template, one save pattern.
4. Everything money-related lives in Billing. Everything developer-related lives in Settings › Developers.

### 5.2 Rail (desktop) / "More" sheet (mobile)
```
[Logo]
ENGAGE
  Assistant            /assistant
  Live calls           /calls/live        (was Agent View / Agent Cockpit, /dashboard)
  Leads                /leads
  Meetings             /meetings          (was Meet Agent / Meeting Agent)
  Tasks                /tasks             (was Personal Agents)
  Softphone            /softphone         (was Rep Console; show "online" badge in rail)
BUILD
  Flows                /flows             (was Flow Builder; keep editor at /flows/:id)
  Knowledge            /knowledge         (was Agent Knowledge)
INSIGHTS
  Analytics            /analytics
  Call log             /calls             (was Call Reports)
——— pinned footer ———
  Billing              /billing           (wallet balance chip, e.g. "₹0")
  Settings             /settings
  Help & docs          /help              (docs, setup guide, status, contact)
  [Avatar ▾]           Profile · Theme · Sign out
```
- Mobile bottom bar: Assistant · Live calls · Leads · Call log · **More** (the sheet lists every group above). Sign out moves into the avatar menu.

### 5.3 Settings (persistent left sub-nav, grouped)
```
ACCOUNT
  Profile                 /settings/profile        name, phone, WhatsApp number, avatar, language
  Email & sign-in         /settings/login          change email, password, connected Google/Microsoft sign-in
  Security                /settings/security       2FA, active sessions (revoke), sign out everywhere
  Notifications           /settings/notifications  (autosave, as today)
ORGANIZATION
  General                 /settings/org            org name, subdomain, logo  [Create organization empty state]
  Members & roles         /settings/org/members    invite, roles, departments, zones
TELEPHONY
  Calling numbers         /settings/numbers        verified caller-IDs (3-step flow)
  Call routing            /settings/routing        transfer channel (PSTN / softphone / auto)
INTEGRATIONS
  All integrations        /settings/integrations   Google, Microsoft, Calendly, Meta (IG/FB/WA), HubSpot, Salesforce
DEVELOPERS
  API keys                /settings/developers/keys
  Webhooks                /settings/developers/webhooks  (+ /:id/deliveries)
  Embed                   /settings/developers/embed
  API reference ↗         /docs/api (opens new tab; only true external items get ↗)
DATA & PRIVACY
  Activity log            /settings/activity
  Export data             /settings/export
  Delete account          /settings/delete (danger styling, last)
```
- Billing is its own top-level area: `/billing` with tabs **Wallet** (balance, top-up, autopay) · **Plans** (voice and meeting minutes) · **Usage** · **Invoices**. The global banner deep-links to `/billing/wallet#top-up`.
- Save pattern: forms show a sticky bottom bar "Unsaved changes · Discard · Save" only when dirty, and switches autosave with a toast. The header never carries a global Save.
- Redirects: `/api-keys` → `/settings/developers/keys`, `/api-keys/embed` → `/settings/developers/embed`, `/webhooks` → `/settings/developers/webhooks`, `/settings#wallet` and `#autopay` → `/billing/wallet`, `/dashboard` → `/calls/live`, `/meeting-agent` → `/meetings`, `/personal-agents` → `/tasks`, `/rep-console` → `/softphone`, `/call-reports` → `/calls`, `/flow-builder` → `/flows`.

---

## 6. Strengths to keep
- **Delete Account** has a clear list of what is deleted and what is kept, a typed-email confirmation, a destructive button disabled until confirmed, a 7-day grace period and an obvious Cancel.
- **Change Email** explains the dual confirmation and reassures that the login stays on the current address until both confirm.
- **Data Export** says exactly what the archive contains, what it excludes and why, and shows the last export's status, size and timestamps. The link expiry is stated.
- **API Keys** gives scope cards with plain descriptions, a rate-limit slider with a recommended value, and an explicit "shown exactly once — we store only the hash".
- **Webhooks** documents signature verification (HMAC-SHA256, constant-time compare) right on the page, with a clear event list.
- **Notifications** states "Changes save automatically" and explains the WhatsApp LOCKED state and its prerequisite.
- **Activity & Audit** has category filter chips, a date range, and an explicit retention and immutability statement.
- **Calling number** uses a 3-step verification stepper (Owned → Compliance → Authorized) that sets expectations.
- **Calendly** explains the OAuth round-trip before redirecting.
- The **Embed Copy** button copies clean code and confirms with "Copied".
- **Almost every Settings item has its own URL** (14 of 17), which makes the restructure in section 5 mostly a layout and redirect job.

---

## 7. Open questions
1. What does "Save Changes" persist exactly: only Full Name and Phone, or also a pending subdomain edit? Not tested, because saving was not allowed.
2. Does the product intend each user to have a personal org? The account shows the org "starvox labs" elsewhere, but Settings says "You aren't an admin of any organization yet".
3. Does the Activity ledger actually receive events? It showed zero rows despite a recorded export on 21/09/2026.
4. Are `/flows` and `/calls` (22-byte 404s from a different handler) reserved for future routes or API endpoints?
5. Which phone number does the PSTN "forward the caller to your phone number" use: the Profile Phone or the verified Calling number?
6. What is the intended relationship between Rep Console (live browser softphone) and the Call channel copy that says the browser softphone bridge hasn't shipped?
7. The "Suspicious activity?" button: what should it do?

---

## 8. Screenshot index (this run)
| File | Content |
|---|---|
| c1_settings_profile.png | /settings Profile (default), header Save Changes, sub-nav, clipped rail |
| c2_profile_scroll1.png / c2_profile_scroll2.png | Profile scrolled: subdomain, brochure, Google/Microsoft |
| c3_meetings_billing.png | Meetings Billing tab (Save Changes hidden, header shift, cramped plans) |
| c3_docs.png | Docs tab (5 links, 3 broken) |
| c4_organization.png | Organization loading state without app shell |
| c4_notifications.png | Notifications (3 back links, editorial header) |
| c5_organization.png | Organization empty state ("create your own org below") |
| c5_call_channel.png | Call channel radios, Save preference, Heads up |
| c6_calling_number.png / c6_calendly.png | Calling number stepper; Calendly connect |
| c7_security.png / c7_activity.png | 2FA-only Security; empty Activity ledger |
| c8_api_keys.png / c8_embed.png | API Keys; Embed magazine header |
| c9_embed_snippet.png | Corrupted snippet + clipped live preview |
| c10_webhooks.png / c11_webhook_new.png / c11_webhook_invalid.png | Webhooks empty state and modal validation |
| c12_integrations.png / c12_data_export.png | Integrations (disabled connects, internal copy); Data export |
| c13_change_email.png / c13_delete_account.png | Change email; Delete account |
| c14_docs_embed_404.png / c14_onboarding.png | Off-shell 404; onboarding with horizontal overflow |
| c15_admin_orgs.png / c15_webhook_deliveries.png | Org list dead end; deliveries without id |
| c16_settings_hash_wallet.png | /settings#wallet lands on Profile |
| c17_profile_dirty.png | Phone "abc" accepted, Save unchanged |
| c18_sidebar_hover.png / c19_sidebar_expanded.png | Collapsed rail hover (no tooltip); expanded rail |
| c20_billing.png | /billing (banner still points to /settings#wallet) |
| c21_mobile_settings.png / c21_mobile_notifications.png | 390px: bottom bar w/o Settings, sub-nav strip |
| c22_admin.png | /admin redirects to dashboard |
| c23_change_email_input.png | "@" icon overlapping input text |
