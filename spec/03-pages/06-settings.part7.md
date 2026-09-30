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
