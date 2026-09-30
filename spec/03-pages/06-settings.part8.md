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
