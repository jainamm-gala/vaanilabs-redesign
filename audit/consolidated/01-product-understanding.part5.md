### 1.4 How the pieces connect

**Six shared objects** hold the product together:

1. **Flow**: the Flow Builder record.
2. **Profile defaults**: the "active flow" and the voice, stored on the user profile.
3. **Lead**
4. **Call record**
5. **Knowledge file**
6. **Account resources**: wallet, phone numbers, org and role.

Most connections between surfaces are **implicit**. A value written on one page is read on another with no link, label or confirmation between them. The diagram below shows data and control flow as observed. Dashed notes mark inferred links.

```
                       ┌──────────────────────── KNOWLEDGE (files → embeddings, RAG) ◄─────────────┐
                       │  read by: Knowledge Query / FAQ nodes · Assistant · Meeting agent ·      │
                       │           Personal-agent "Knowledge Base Lookup"                          │
                       ▼                                                                           │
 ASSISTANT ──"build & activate"──► FLOW ◄── Flow Builder (autosave PUT on open + every edit)       │
                                    │   └─ ACTIVATE: "for all your calls"                          │
   Cockpit FLOW select + voice ─────┼── PATCH /api/auth/profile ──► PROFILE (active flow, voice)   │
                                    │                                   │                          │
        ┌───────────────────────────┼───────────────────┬───────────────┼───────────────┐          │
        ▼                           ▼                   ▼               ▼               ▼          │
  Cockpit CONNECT /          Leads Call Now /     Meeting Agent    Inbound number   Personal agent │
  Test Call                  bulk CALL n          "Active flow     (not allocated)  (own number,   │
  (intel ← latest LEAD)      ("Default flow")     (from profile)")                   not assigned) │
        │                           │                   │                                          │
        └──────────────► CALL RECORDS ◄─────────────────┘                                          │
                            ├─► Call Reports (121 calls; captured flow fields as columns)          │
                            │        └─ "Learn from this call" ┄┄► /knowledge/proposals ┄┄┄┄┄┄┄┄┄┄┄┘
                            │                                     (redirects to /dashboard)
                            ├─► Analytics (§02 KPIs · §04 flow step drop-off · §05 intents · §07 recent → "Open report")
                            ├─► Lead drawer call history (carrier status; lead status never advances)
                            └┄► WALLET debit (inferred; 158 min used vs ₹0 and 0 transactions)

 Transfer node ─► Settings › Call channel (PSTN / Browser / Auto) ─► Rep Console open in a tab
 Book Meeting node ─► Google Calendar (connected in Profile) / Calendly (own page)
 WhatsApp node ─► "User's Brochure (auto)" ← Profile brochure upload; WhatsApp connector locked (org admin only)
 CRM Lookup node ─► "Integrations → Live Lookup" connector (no such card on /settings/integrations)
```

**Connection matrix.** For each connection: how it works, whether a user can see it, and what goes wrong.

| # | From → To | Mechanism (observed) | Visible to the user? | Gap | Ref |
|---|---|---|---|---|---|
| 1 | Flow Builder → Cockpit | The Cockpit FLOW select lists all 16 flows, with 6-character hash suffixes. The builder auto-opens the flow whose ID matches the Cockpit's selection. | No | No "Edit in Flow Builder" link. No Active or Draft badge. The select is truncated at 150 px. | EXPLORE-CORE-12 |
| 2 | Cockpit → Profile → Meeting Agent and Leads | Changing the flow or voice fires `PATCH /api/auth/profile`. Meeting Agent reads it as "Active flow (from profile)". The Leads drawer reads it as "Active flow (profile default)". The bulk bar reads it as "Default flow". | No; the write is silent | The flow is never named where it is used. Save failures are not reported. Choosing a flow for a test session changes the default everywhere. | EXPLORE-CORE-03, UX-AUDIT-06 |
| 3 | ACTIVATE ↔ profile active flow | ACTIVATE says "for all your calls". The profile value is per user. | Partly | It is unclear whether the active flow belongs to the org or the user. The already-active flow has no "Live" marker. | FLOW-CONFIG-07 |
| 4 | Flow edits → live calls | Every edit autosaves (`PUT /api/flows/<id>`) into the same record the Cockpit uses | No | There is no draft/published split, so half-finished edits are probably live *(inferred)*. | FLOW-CONFIG-01, UX-AUDIT-01 |
| 5 | Flow Builder → Knowledge | Knowledge Query selects one file or all. FAQ creates a backing file on save. | One-way | File names show raw storage keys. You cannot test a node's search from the node. | FLOW-CONFIG-14 |
| 6 | Flow Builder → Integrations | See the three sub-rows below this table. | No | Dependencies are not checked or surfaced. | FLOW-CONFIG-18, EXPLORE-SETTINGS-02 |
| 7 | Flow → Rep Console | Transfer node → Settings › Call channel (Browser/Auto) → rep keeps `/rep-console` open | No | The chain spans three surfaces. The Call channel copy says the browser route hasn't shipped. PSTN forwards to a Profile phone that is empty. | UX-AUDIT-07 |
| 8 | Flow → Call Reports and Analytics | Captured node answers become dynamic columns in Call Reports (a union across all flows) and "Flow Builder fields" in the detail panel. Analytics §04 shows per-step drop-off. | Yes (data) | No link from a step back to its node. Duplicate labels ("Condition Check" ×3) cannot be told apart. | EXPLORE-DATA-04, EXPLORE-DATA-05 |
| 9 | Leads → Cockpit | Customer Intel auto-fills from `/api/leads?limit=1`, the most recent lead | No picker | A real name is mixed with demo email, company and city. Counts disagree (3 previous calls vs 1). | EXPLORE-CORE-02, UX-AUDIT-05 |
| 10 | Leads → Calls → Leads | Call Now, bulk CALL n and the `C` key use the voice, language and flow chosen. The drawer lists call history. | Partly | Lead status stays NEW after calls. A month-old call still says "QUEUED". There is no campaign object. | EXPLORE-DATA-08, UX-AUDIT-22 |
| 11 | Analytics → Call Reports | §07 row → "Open report ›" | **Yes** | One of the few explicit cross-links. | none |
| 12 | Call Reports → Knowledge | "Learn from this call" probably feeds `/knowledge/proposals` *(inferred)* | No | The proposals page redirects to `/dashboard`. | EXPLORE-DATA-02 |
| 13 | Calls → Billing | Wallet debits *(inferred)* | No | Billing shows 0 transactions against 158 minutes used, with no usage ledger. The banner's Top up goes to the wrong page. | EXPLORE-DATA-17, UX-AUDIT-08 |
| 14 | Meeting Agent → Billing | "Free minutes 29 / 30" → `/settings#meetings-billing`. Meetings Billing → "Open wallet → /billing". Pay-as-you-go minutes debit the wallet. | Partly | Money is split across three places (see 1.6). | EXPLORE-SETTINGS-10 |
| 15 | Meeting Agent ↔ Cockpit ↔ Personal Agents | The "Vikash" persona is both a Cockpit voice and the meeting agent. The Personal-agent capability "Video Meeting" delegates to the meeting agent. | No | There is no shared agent profile. Voice descriptors appear only in the Leads drawer. | EXPLORE-CORE-05 |
| 16 | Personal Agents → Telephony and Notifications | Tasks run on an admin-assigned number, and confirmations go by WhatsApp (the default), Call or Email | Only on `/settings/personal-agent` | No number is assigned. The WhatsApp number field doesn't exist, and Notifications shows WhatsApp as LOCKED. | EXPLORE-CORE-14, EXPLORE-SETTINGS-18 |
| 17 | Analytics → numbers | §01 "Allocate a number from billing" (not a link) | Text only | Billing cannot allocate numbers. There are three unlinked number concepts: allocated inbound number, verified caller ID (Settings), and personal-agent number. | EXPLORE-DATA-21, UX-AUDIT-07 |
| 18 | Assistant → everything | Can build and activate flows, analyse a document into a flow, manage leads, place calls, search knowledge, and summarise calls | Plan panel only | No approval, cost or recipient preview is visible. History is stored only in the browser. | EXPLORE-CORE-16 |
| 19 | Developer surfaces → product | API scopes map to products (Textvoice, Voicebot, Meeting agent, Plain meeting). Webhook events cover calls, meetings, leads and billing. | No | Not linked from the product pages they expose. The pages are orphans reached only via Settings. | EXPLORE-SETTINGS-07 |
| 20 | Onboarding → every page | `/api/onboarding/state` is fetched on every load | Never shown | Step 4 is incomplete but hidden. There is no setup checklist. | UX-AUDIT-19 |
| 21 | Org and role → Integrations and admin pages | The org-admin role gates the Connect buttons, proposals *(inferred)* and `/admin` | No | Org creation is a circular dead end, and gated pages redirect silently. | EXPLORE-SETTINGS-02 |

**Row 6 detail (Flow Builder → Integrations):**

- **CRM Lookup** needs an "Integrations → Live Lookup" connector. No such card exists on `/settings/integrations`.
- **Book Meeting** defaults "Add to Google Calendar" to ON. Google is connected from Profile, not from Integrations.
- **WhatsApp** attaches the Profile brochure. The WhatsApp connector's Connect button is disabled for non-admins.

**Sources of truth that conflict.** These are the root causes behind most of the journey breaks in 1.5.

| Question the user asks | Competing answers |
|---|---|
| Which flow do my calls use? | <ul><li>ACTIVATE ("for all your calls")</li><li>Cockpit FLOW select (the profile)</li><li>Meeting Agent "Active flow (from profile)"</li><li>Leads "Default flow" / "Active flow (profile default)"</li><li>The flow the builder autosaves into</li></ul> |
| Which voice is the default? | VAANI in the Cockpit; VIKASH in the Leads bulk bar and drawer |
| How long are calls? | 1m 18s (Analytics) vs 90s (Call Reports KPI); 1:27 (table) vs 87s (panel) |
| What kind of call was it? | INBOUND/OUTBOUND (Analytics) vs BROWSER (Call Reports). Each test call is logged as two rows. |
| Which phone number? | <ul><li>Profile "Phone"</li><li>Settings › Calling number (verified caller ID)</li><li>Analytics "Allocated DID" (pending)</li><li>The personal agent's "assigned number"</li><li>The Transfer node number</li><li>The Notifications WhatsApp number (no such field exists)</li></ul> |
| What have I spent, and what does it cost? | <ul><li>Billing: ₹0 and 0 transactions</li><li>Analytics: 158 minutes</li><li>Meetings Billing: ₹2.40/min after 30 free</li><li>Public API docs: 4/8/1 paise per second</li><li>`/pricing`: no prices</li></ul> |
| Am I ready to go live? | <ul><li>Onboarding: "You're live."</li><li>The wallet banner: ₹0</li><li>Personal Agents settings: "No number assigned yet"</li><li>Analytics: number PENDING</li></ul> |
