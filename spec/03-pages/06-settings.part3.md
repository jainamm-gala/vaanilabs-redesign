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
