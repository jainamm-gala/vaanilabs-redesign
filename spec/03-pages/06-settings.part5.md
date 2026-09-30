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
