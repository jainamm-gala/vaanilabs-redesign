
### F-UX-015 — Telephony setup is contradictory and split across five pages, and the DID hint points to a Billing page that has no numbers
- **Severity:** medium · **Confidence:** verified
- **Source findings:** UX-AUDIT-07, EXPLORE-DATA-21, UX-AUDIT-27
- **Pages:** /settings/call-channel, /settings/calling-number, /settings (Profile), /analytics §01, /billing, /rep-console, /personal-agents, /settings/personal-agent
- **Evidence:**
  - Call channel's default "Phone (PSTN)" says the "Agent forwards the caller to your phone number". The page shows no number and the Profile phone is empty (placeholder "+91…"). Nothing says whether PSTN uses the Profile phone or the verified calling number.
  - A "Heads up" box says Browser and Auto "fall back to PSTN until the in-browser softphone bridge ships". Yet Rep Console, a browser softphone, is in the main nav and says calls land there when the channel is Browser or Auto. Two of the three options are offered but do not work. "Save preference" is greyed until the value changes, with no hint.
  - Calling number is a caller-ID verification stepper (1 Owned → 2 Compliance → 3 Authorized). "Send code" enables for "abc".
  - Analytics §01 reads "ALLOCATED DID · PENDING · not allocated yet · Allocate a number from billing to start receiving calls." This is plain text, not a link. `/billing` has only wallet, autopay, top-up and history. While loading, the same card first reads "Inbound voice agent — callers reach your Vaani agent here.", so the copy flashes.
  - Personal Agents promises the agent "works persistently on its assigned number". `/settings/personal-agent` says "No number assigned yet. Provisioning is admin-assigned".
  - Calling number and Analytics don't link to each other. "DID", "calling number", "assigned number" and "your phone number" are four names for number concepts.
  - The verifier re-observed every item. It rated the finding medium: real friction, but not a blocker it could demonstrate.
- **Screenshots:** va-verify-ux-audit/25_call_channel.png, va-verify-ux-audit/26_calling_number.png, va-verify-ux-audit/27_analytics_did.png, va-verify-ux-audit/29_personal_agents.png, va-ux-audit/16_settings_call_channel.png, va-ux-audit/52_analytics_did_card.png, va-explore-core/settings_personal_agent.png
- **Recommendation:**
  - Create one "Phone setup" page (e.g. `/settings/phone`) with a status row for each part:
    - Inbound number: DID allocated or pending, with a "Request number" action
    - Caller ID: verified or not, using the existing 3-step stepper
    - Transfer destination: the PSTN number, shown and editable inline, or the browser softphone
    - A "Place a test call" action
  - Until the bridge works, hide Browser and Auto, or disable them with a "Coming soon" tag. If Rep Console already works, remove the "Heads up" copy instead.
  - Link every mention of a number to this page: the Analytics DID card, Personal Agents, Call channel and the setup checklist (F-UX-006). Use one glossary: "Inbound number" and "Caller ID".
  - Show the DID card as a skeleton until the data loads, instead of flashing placeholder copy.

### F-UX-016 — Internal engineering details, developer notes, vendor names and QA data are shown to customers
- **Severity:** medium · **Confidence:** verified
- **Source findings:** UX-AUDIT-10, EXPLORE-CORE-10, VISUAL-AUDIT-12, EXPLORE-DATA-03, EXPLORE-SETTINGS-11, QA-B-19, A11Y-MANUAL-20
- **Pages:** /meeting-agent, /knowledge, /leads (filters, drawer, import), /call-reports, /settings/integrations, /settings/call-channel, /settings (Profile), /settings/delete, /flow-builder, /rep-console, /dashboard, global rail
- **Evidence (strings quoted as displayed):**
  - **Meeting Agent** (verified live):
    - The right column shows a "GPU SERVER STATUS Online" card and a card reading "BACKEND — Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL", which is an environment-variable name.
    - The Presentation mode hint includes the function name "(present_topic)", and Generate PPT names the vendor ("no LiveKit").
    - Past Meetings lists the QA artefacts "ZZ Mobile QA Room 22Sep" and "E2E Test Room 21Sep". This part was reported by one agent.
  - **Leads:**
    - The language and outcome selects are named only by `title` notes: "Reads metadata.extra.language until a schema column lands" and "full-list join is a backend TODO". Screen readers announce these notes as the control names.
    - Chip names read "FFACEBOOK", "IGINSTAGRAM" and "{}API" because the glyphs are not `aria-hidden`.
    - The Import dialog says extra columns are "folded into metadata.extra".
    - Call history in the lead drawer labels calls with the carrier's name, "VOBIZ".
  - **Call Reports:** the row button's title is "Re-run AI analysis from scratch (force=true)".
  - **Knowledge** (verified): "chunked, embedded with Gemini", "Gemini text-embedding-004 (768-dimensional vectors)" and "pgvector".
  - **Settings:**
    - Integrations: "stub row until app-review credentials are ready", "Two-way sync deferred to a follow-up", "Chat surface lives in the agent backend", "during pilot calls", and the raw link text "/admin/organizations".
    - Call channel: "until the in-browser softphone bridge ships".
    - Profile: literal backticks around "`{slug}.vaanilabs.in`", and "You can change it once or twice".
    - Delete: "required for app-store compliance".
  - **Chrome, Cockpit and Flow Builder:** "LAT: 0ms", "SESSION: IDLE", "RGN: Mumbai-1", and "Soul.md" in Flow settings. Rep Console shows a raw LiveKit error (F-UX-019, F-UX-023).
  - The verifier confirmed the strings live and rated them medium: they are cosmetic and block nothing. EXPLORE-CORE-10 and EXPLORE-DATA-03 had rated them high.
  - VISUAL-AUDIT-12 also covers the page's all-mono type and off-system violet, which belong to F-VIS-001 and F-VIS-004.
- **Screenshots:** va-verify-ux-audit/21_meeting_backend_card.png, va-ux-audit/44_meeting_env_var_leak.png, va-explore-core/meeting_agent_2.png, va-visual-audit/meeting-agent_full.png, va-explore-settings/c12_integrations.png, va-ux-audit/48_knowledge.png, va-ux-audit/34_lead_panel_actions.png
- **Recommendation:**
  - Remove the GPU, Backend and port/env-var cards from customer builds. Show infrastructure health to staff on an internal admin route, and to customers only as a status-page link.
  - Archive the QA rooms in production orgs. Add a CI check that fails when production seed or fixture data contains "QA", "E2E" or "Test Room".
  - Give each filter control a real `aria-label` ("Filter by language", "Filter by last call outcome"), and wrap chip glyphs in `aria-hidden` spans.
  - Do a copy pass backed by a banned-terms lint (`metadata.`, TODO, `force=`, pgvector, `NEXT_PUBLIC_`, port, stub, LiveKit, VOBIZ, Soul.md). Replacements:
    - "Extra columns are kept as custom fields"
    - "Re-run analysis"
    - "Personality" instead of Soul.md
    - "Phone call" instead of the carrier's name
    - "Coming soon" or "Beta" for unfinished integrations
    - "Create an organization" as the link text
  - Render inline code in helper text properly, or remove it. State exact limits, e.g. "You can change your subdomain 2 more times".

### F-UX-017 — Navigation names, keyboard behaviour and active state are inconsistent across the rail, mobile bar and page titles
- **Severity:** medium · **Confidence:** verified
- **Source findings:** EXPLORE-CORE-05, UX-AUDIT-11, VISUAL-AUDIT-05, EXPLORE-SETTINGS-07, EXPLORE-SETTINGS-13, DESIGN-SYSTEM-19, DESIGN-RESEARCH-09
- **Pages:** global rail, mobile bottom bar, page headers; /settings/*, /api-keys, /api-keys/embed, /webhooks
- **Evidence:**
  - Names for the same destination:

    | Route | Rail or sub-nav label | Mobile tab | Page H1 | Elsewhere |
    |---|---|---|---|---|
    | /dashboard | Agent View | Agent | AGENT COCKPIT | "Dashboard" (URL, Rep Console back link, onboarding CTA) |
    | /meeting-agent | Meet Agent | — | Meeting Agent — Vikash | |
    | /knowledge | Knowledge | Knowledge | AGENT KNOWLEDGE | |
    | /call-reports | Call Reports | Reports | Call Reports | |
    | /settings/security | Security | — | Two-factor authentication | |
    | /settings/activity | Activity & Audit | — | Account Activity | |

  - "Agent" names five different things: the Cockpit, Meeting Agent, Personal Agents, Agent Knowledge and the Assistant. Sign-out is labelled "Sign Out", "Sign out" and "Exit".
  - The 12 rail links are icon-only in a flat list with no groups, and their names come only from `title`. The verifier notes that `title` still gives each link an accessible name and a delayed native tooltip. The theme toggle has a custom tooltip; the nav links don't.
  - Each nav `<a>` wraps a `<div tabindex="0">`, so Tab stops on A, DIV, A, DIV. That is 2 stops per item, 24+ presses to get past the rail, and a nested interactive element. There is no skip link, and focus shows only the default 0.8 px outline (verified).
  - No rail item is active on `/settings/*`, `/api-keys`, `/api-keys/embed` or `/webhooks` (`activeOnSub = []`), while `/billing`, `/analytics` and `/leads` do show one. No link has `aria-current`.
  - The expanded 240 px rail fixes most of this: it has labels and fits at 900 px. It is not the default, and its labels are `#7A8397` on white (3.80:1).
  - The verifier rated the naming mismatch medium because it blocks nothing. EXPLORE-CORE-05 and EXPLORE-SETTINGS-07 had rated it high.
- **Screenshots:** va-verify-a11y-manual/01-sidebar-innerdiv-focus.png, va-a11y-manual/07-sidebar-innerdiv-focus.png, va-explore-core/focus_state_nav.png, va-ux-audit/14_sidebar_expanded.png, va-explore-settings/c18_sidebar_hover.png, va-explore-settings/c8_api_keys.png, va-design-system/mobile-analytics.png
- **Recommendation:**
  - Drive the rail label, tooltip, mobile label, H1 and `<title>` from one `navConfig` entry per destination. Give each destination one noun, e.g. "Live calls", "Meetings", "Tasks", "Knowledge", "Call log" and "Security". Rename routes and redirect the old ones.
  - Remove the inner `tabindex="0"` so each item is one tab stop. Add a "Skip to content" link and a 2 px `:focus-visible` ring token.
  - Match the active item by route prefix: `/settings`, `/api-keys` and `/webhooks` highlight Settings, or "Developers" once regrouped. Set `aria-current="page"`.
  - At ≥1280 px, default to the labelled rail with 3–4 groups (Engage, Build, Insights, with utilities pinned to the footer). Raise label contrast to at least 4.5:1.
  - The same rail's clipping and scrollbar defects are covered in F-UX-007.

### F-UX-018 — The rail's "SYS: ONLINE · latency · RGN" status is hard-coded and random, and stays green while things are offline
- **Severity:** medium · **Confidence:** verified
- **Source findings:** QA-A-02, EXPLORE-CORE-19, UX-AUDIT-24, QA-B-13, DESIGN-RESEARCH-09
- **Pages:** global rail footer (all authenticated pages)
- **Evidence:**
  - In the `(dashboard)/layout` bundle, the status is `useState("online")` and its setter is never called. Latency is `setInterval(() => T(Math.floor(8 + 15*Math.random())), 3e3)`, a random 8–22 ms every 3 s. "RGN: Mumbai-1" is a string literal.
  - The verifier took its tab offline for 12 s (`navigator.onLine=false`). The dot stayed `rgb(23,138,85)`, the text stayed "SYS: ONLINE", and latency went 12 → 10 → 9 → 18 → 13 ms.
  - The indicator also stayed green while Rep Console showed "Offline / Could not connect", and during failed offline refreshes on Call Reports.
  - Collapsed, it is an unlabelled green dot plus "12ms". Expanded, it reads "SYS:ONLINE 10ms". RGN and the user's email exist only as hidden DOM text.
  - The verifier rated it medium: it is a small footer element that no feature depends on. It is still a fake health signal in a product that sells call reliability.
- **Screenshots:** va-verify-qa-a/offline_status_footer.png, va-qa-a/offline_12s_status.png, va-explore-core/sidebar_expanded_footer.png, va-explore-core/crop_sidebar_footer.png, va-ux-audit/47_rep_console.png
- **Recommendation:**
  - Remove it now, or wire it to real signals: `navigator.onLine` with `online`/`offline` events, a `/api/health` round-trip every 30–60 s, and backend and telephony status.
  - Show three states as text, not colour alone: Online, Degraded, Offline. Link them to `/status`.
  - If a latency figure stays, label what it measures (e.g. "API 120 ms") and show a real measurement, never a random number.
  - Show the rep's availability from Rep Console presence as a separate indicator with its own label.

### F-UX-019 — Failures are silent, raw, contradictory or shown far from the action, and nothing offers Retry
- **Severity:** medium · **Confidence:** verified
- **Source findings:** QA-A-07, UX-AUDIT-14, EXPLORE-DATA-18, QA-B-26, QA-B-13
- **Pages:** /personal-agents, /meeting-agent, /dashboard, /flow-builder, /knowledge, /rep-console, /call-reports, /assistant, client-side navigation
- **Evidence (under simulated failure: the audit guard caused the failures, but the handling is the product's):**
  - **Personal Agents,** with `/tasks` returning 500: the raw server string appears in a pink box, "No tasks yet. Click New task…" still renders below it, and there is no Retry (verified). Offline, the box shows "Failed to fetch".
  - **Meeting Agent,** with `GET /api/meet` returning 500 after Refresh: no message appears, PAST MEETINGS disappears, and the active room link switches from a 12-character short code to a 22-character room-ID URL (verified).
  - **Cockpit:** "Refresh flows" offline spins and then does nothing (verified).
  - **Flow Builder:** shows "Up to date" after failed saves (verified).
  - **Knowledge:** the test search error "Search failed — check network connection" (12 px, `#D0463A`) appears inside the Upload Knowledge card at y≈370. The Search input is about 520 px lower, at y≈888. The verifier found both on screen at 1440×900, so "off-screen" was overstated, but the message is in the wrong card and is not announced.
  - **Rep Console:** "Could not connect — could not establish signal connection: Websocket got closed during a (re)connection attempt:". This is raw SDK text, ending in a colon, with no Retry (verified).
  - **Offline navigation:** clicking a sidebar link logs "Failed to fetch RSC payload" and loads `chrome-error://`, losing the whole app shell. On Call Reports, Refresh offline shows no toast and no inline error. The verifier did not re-test these two.
  - The verifier rated the finding medium because all of this appears only on error paths.
- **Screenshots:** va-verify-qa-a/pa_tasks_500_verify.png, va-verify-qa-a/meeting_api_meet_500_verify.png, va-verify-qa-a/offline_refresh_flows.png, va-verify-ux-audit/23_knowledge_search_fail.png, va-verify-ux-audit/24_rep_console.png, va-qa-a/pa_refresh_offline.png, va-qa-b/offline-nav-knowledge.png, va-qa-b/offline-callreports-refresh.png
- **Recommendation:**
  - Build one `InlineError` component: a plain sentence, a Retry button, and a collapsible "Details" section with the raw message. Place it directly under the control or region that failed, with `role="alert"`. Use one `Toast` pattern for background failures.
  - Never show an empty state when the request failed. Keep the last good data and add a note: "Couldn't refresh · Retry · Updated 16:42".
  - Map known errors to plain copy, e.g. "Can't reach the calling service. Check your connection and retry." Keep IDs and SDK text under Details.
  - Add a global offline banner driven by `online`/`offline` events, and block client navigation while offline ("You're offline. Showing cached data.").
  - When a refresh fails, keep the room's short link unchanged.

### F-UX-020 — Embed Handbook code snippets display corrupted markup (Copy is correct)
- **Severity:** medium · **Confidence:** verified
- **Source findings:** QA-B-08
- **Pages:** /api-keys/embed
- **Evidence:**
  - The `textContent` of all 4 `<pre>` blocks starts `<"vv-attr">class="vv-tag">div "vv-attr">id=…`. Their innerHTML contains nested `<span <span class="&lt;span">`, which means the highlighter re-tokenises its own output (verified).
  - Everything after `https:` in the URL sits in a comment span and renders in grey italic.
  - The verifier stubbed the clipboard and confirmed that COPY writes the clean snippet (`<div id="vaani-voice"></div><script src="…/embed/v1/vaanivoice.js" defer>`). Only the display is broken, but anyone who reads or retypes the snippet gets broken HTML.
  - The live-preview column is 182 px wide and clips its card titles.
  - Explore-settings reported the same defect independently. The verifier downgraded it from high because Copy works.
- **Screenshots:** va-verify-qa-b/embed-snippet.png, va-qa-b/embed-snippet.png, va-explore-settings/c9_embed_snippet.png
- **Recommendation:**
  - Escape the source once and tokenize it in a single pass with Shiki or Prism at build time. Render and copy from the same raw string.
  - Add a test that asserts each `<pre>`'s `textContent` equals its Copy payload.
  - Stack the live preview under the snippet, or give it at least 360 px.
