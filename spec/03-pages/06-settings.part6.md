### 7.6 Phone setup (`/settings/phone`)

**Job.** *Get our numbers right so customers can reach the agent and recognise us when it calls: an inbound number that answers with the right flow, a verified caller ID, a place for transfers to ring, and hours when calls may start. Then prove it with a call to myself.* It is setup step 2 of Home (Shell §13.3) and the target of the "Verify" badge.

**Findings:** F-UX-015 (telephony split across five pages, four names, "Allocate a number from billing"), EXPLORE-SETTINGS (Call channel "Heads up… until the softphone bridge ships" while Rep console exists; "Save preference" greyed without a reason; "Send code" enabled for "abc"; pill buttons), F-QA-021, F-UX-013 (calling hours where calls start), F-UX-006 (no premature "live"). Kept: the Owned → Compliance → Authorized stepper.

**Hierarchy.** 1) The header status: can this workspace take and place calls? 2) The first section that is not done (its section Notice and primary). 3) The done sections, each one line of proof. 4) Test call. 5) Danger zone.

```
Settings ›
Phone setup    Inbound ready · Caller ID verifying (2 of 3)
─────────────────────────────────────────────────────────────────────────────
Inbound number                                                         [link]
Callers who ring this number reach your agent.
Number        +91 80 •••• 2210  [copy]              ✓ Ready
Answers with  Site-visit qualifier · ● Live v7                Change flow…
Since         12 Sep 2026
─────────────────────────────────────────────────────────────────────────────
Caller ID                                                              [link]
The number customers see when your agent calls them.
⚠ Phone calls can't be placed until this is verified.
 ✓ Owned          +91 98765 43210 · code confirmed 21 Sep
 ◌ Compliance     Checking the number is registered to your business.
 ○ Authorized     The carrier approves it as your caller ID.
─────────────────────────────────────────────────────────────────────────────
Transfers                                                              [link]
When a caller asks for a person, the agent transfers the call to:
 (•) A phone number                   ( ) Rep console, then a phone number
     Transfer number [+91│ 98765 43210        ]   Use my mobile number
 Unsaved changes · 1 field                          [Discard] [Save changes]
─────────────────────────────────────────────────────────────────────────────
Calling hours · IST                                                    [link]
Outbound calls and batches start only inside these hours.
 Mon [on]  10:00 am IST  to  7:00 pm IST          Copy to weekdays
 …
─────────────────────────────────────────────────────────────────────────────
Test call
Hear what callers hear. We call your mobile with the live flow.  [Call yourself…]
Last test: Today 10:42 am · Connected · 1m 12s · Open report
─────────────────────────────────────────────────────────────────────────────
┌ Danger zone: Release inbound number… · Remove caller ID… ─────────────────┐
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Inbound number (`#inbound`) | Action | *None:* EmptyState compact "No inbound number yet. Callers can't reach your agent." + secondary **Request a number…** (Dialog `sm`: Field TextInput "Preferred area code (optional)" 180 wide, hint "Like 80 for Bengaluru. We'll offer the nearest available."; primary "Send request"). Until ST7 ships the action is a "Contact us for a number" link. *Requested:* StatusText progress "Requested 21 Sep 2026" (+ "usually 1 working day" only with a real SLA). *Active:* KeyValueList `rows`: Number (PhoneText masked, `mono-13`, Copy copies the full number for admins), status StatusText ("Ready" success, or warning "Not answering: no live flow. **Publish a flow**"), Answers with (the flow name + Tag "Live v7", link **Change flow…**: FlowSwitcher purpose `inbound`, live flows only (C §5.4), then a tier-2 confirm "Answer +91 80 •••• 2210 with EMI reminder v3? New calls hear it from now on. Calls in progress stay on Site-visit qualifier."), Since |
| Caller ID (`#caller-id`) | Action | StageProgress (O §14.3) with three stages, the current one expanded in place. *Owned:* Field + PhoneInput `kind="any"` "Number to verify" (hint "A mobile, or a landline with its STD code"), SegmentedControl "Send the code by" (Text · Call; landlines force Call), primary **Send code**; then the code TextInput (`one-time-code`, 180) + **Verify** + "Resend code" after 30 s + "Change number". *Compliance / Authorized:* StatusText progress with what is happening; if the server asks for a document, a FileField with the named document (ST7). *Verified:* KeyValueList: Caller ID (masked) · StatusText success "Verified 21 Sep 2026" · "Used for every outbound call and batch" · link **Replace number…** (starts a new verification; "Your current caller ID stays in use until the new one is verified."). *Failed:* danger StatusText "Compliance check failed: the number isn't registered to Sample Realty. **Details** · **Start again**" |
| Transfers (`#transfer`) | Section form | RadioGroup `card` (C §6.2): "A phone number" · "Rep console, then a phone number" ("Reps online in Rep console get the call in their browser. If no one picks up in 20 s, it rings the transfer number."). Field + PhoneInput `kind="any"` `allowInternational` "Transfer number" (required for both), link "Use my mobile number" (fills from Profile). A changed route confirms (tier 2): "Send transfers to Rep console first? From now on, transfers ring reps who are online, then +91 98765 43210. Calls in progress aren't affected." The Rep console option is **hidden** while the browser bridge is not live (P1), never offered with a "Heads up" |
| Calling hours (`#hours`) | Section form | **CallingHours** recipe (C §7.1): 7 rows (day, Switch "Open", TimeField from and to, "IST"); link "Copy Monday to weekdays"; hint "Outbound calls and batches start only inside these hours. The Call gate blocks a start outside them." The page meta and the Call gate's blocking check read this value ("Outside calling hours. Opens 10 am IST.") |
| Test call (`#test`) | Action | secondary **Call yourself…** → the Call gate aimed at your verified mobile (D §6.6, tier 4); aria-disabled with the first missing reason: "Verify a caller ID first." · "Publish a flow first." · "Wallet is ₹0. **Top up** to place calls." · "Add your mobile number in Profile." Last test: StatusText + link to its call report |
| Danger zone (`#danger`) | Guarded | Release inbound number… (tier 3, type the last 4 digits, Confirm it's you); Remove caller ID… (tier 2). Hidden rows when there is nothing to release |

**States and copy.**

| State | Copy |
|---|---|
| Header meta (computed) | "Inbound ready · Caller ID verified" · "No inbound number · Caller ID not verified" · "Inbound ready · Caller ID verifying (2 of 3)" |
| Caller ID not verified (section Notice, warning) | "Phone calls can't be placed until this is verified." |
| Invalid number on Send code | "Enter a phone number with its STD code, like 80 4567 2210." (the code is never sent for an invalid number, F-QA-021) |
| Code wrong / too many tries | "That code isn't right. Check the latest message." · "Too many tries. Request a new code in 10 min." |
| Transfer number missing | "Enter the number transfers should ring." |
| Hours invalid | "End after the start time." |
| Member | page Notice "Only admins can change phone setup. Ask an admin: Anika R. or Dev S."; numbers masked, no Copy; Test call stays available |
| Loading | FormSkeleton per section; the header meta skeleton; never a flash of "Inbound voice agent — callers reach your Vaani agent here." (F-UX-015) |

**Phone and tablet.** Same order; StageProgress stays vertical; the RadioGroup cards stack; CallingHours rows become two lines (day + switch / from–to); Change flow… opens the FlowSwitcher as a bottom sheet.

**Microcopy.** "Call channel" → "Transfers" · "Phone (PSTN) · Agent forwards the caller to your phone number" → "A phone number" with the number shown and editable · "Browser softphone" / "Auto (browser if online, else phone)" → "Rep console, then a phone number" · "Heads up: Browser/Auto channels currently fall back to PSTN until the in-browser softphone bridge ships" → removed (the option is hidden until it works) · "Your calling number" → "Caller ID" · "Step 1 — verify ownership" → "Owned" stage · "ALLOCATED DID · PENDING · Allocate a number from billing" (Analytics) → "No inbound number yet" here, linked from Analytics (call-reports spec) · "Save preference" (grey, no reason) → the Transfers SectionFooter, shown only when dirty.

**Accessibility.** StageProgress is an `<ol>` with each stage's state in words ("Owned, done", "Compliance, in progress"). The code field has `autocomplete="one-time-code"`. The Change-flow confirmation names both flows. CallingHours rows are `fieldset`s labelled by the day.

**Telemetry.** `phone_setup_view` {inboundState, callerIdStage}; `caller_id_verify_step` {stage, result}; `inbound_flow_change` {result}; `transfer_route_save` {route}; `test_call_open` {blockedReason?}.

**Acceptance.**
- [ ] Inbound number, caller ID, transfers, calling hours and the test call are all on this page, and the old routes redirect to their anchors.
- [ ] "Send code" never sends to an invalid number; the error appears under the field.
- [ ] No option is offered that does not work; no "Heads up" copy remains.
- [ ] The nav "Verify" badge, the Baseline line segment, Home step 2 and this page's meta all read the same state.

### 7.7 Security (`/settings/security`)

**Job.** *Keep my account mine: change how I sign in, add a second step, see where I'm signed in, and cut off anything I don't recognise.* Today the page is one 2FA card under an H1 that doesn't match the nav (F-UX-044).

**Findings:** F-UX-044, F-VIS-019 (icon over the Change-email text), F-QA-021 (invalid email accepted), F-A11Y-020 (placeholder labels), F-UX-042 ("Suspicious activity?" needs a real target: this page), F-UX-029 ("sign out everywhere" lives here, Shell §9.3).

**Hierarchy.** 1) Header meta: "Two-factor on · 3 sessions". 2) Two-factor (the biggest protection). 3) Where you're signed in. 4) Email and password.

Section order follows how people arrive: from a security alert email they look for sessions; from setup they turn on two-factor; the email and password rows are short and sit first so the page opens with who you are.

```
Settings ›
Security       Two-factor off · 3 sessions
───────────────────────────────────────────────────────────────────────────
Email address                                                       [link]
anika@sample.in · used to sign in and for alerts            Change email…
───────────────────────────────────────────────────────────────────────────
Password                                                            [link]
Last changed 3 months ago                                 Change password…
───────────────────────────────────────────────────────────────────────────
Two-factor                                                          [link]
Off. Ask for a code from an authenticator app when you sign in.  [Turn on…]
Authenticator apps only for now. Security keys and SMS aren't supported yet.
───────────────────────────────────────────────────────────────────────────
Where you're signed in              [Sign out of all other sessions…]
Chrome on Windows · Bengaluru (approx.)   Active now      This device
Safari on iPhone · Pune (approx.)         2 hours ago               Sign out
Chrome on macOS · Mumbai (approx.)        12 Sep 2026               Sign out
See sign-in history in Activity
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Email address (`#email`) | Guarded Action | SettingRow (value + **Change email…**). Confirm it's you → Dialog `md` "Change email": KeyValue "Current email"; Field + TextInput `type="email"` "New email" (no leading icon, F-VIS-019); body "We'll send a link to both addresses. You keep signing in with anika@sample.in until both are confirmed." (the kept strength); primary **Send confirmation links**. *Pending:* section Notice `info` "Email change pending. Confirm from both inboxes. Sent at 10:42 am. **Resend** · **Cancel change**" |
| Password (`#password`) | Guarded Action | SettingRow "Last changed 3 months ago" + **Change password…** → Dialog `sm`: PasswordInput `purpose="sign-in"` "Current password", PasswordInput `purpose="new"` "New password" with the rules list (C §3.3), Checkbox "Sign out of other sessions" (default on), primary **Change password**. Google- or Microsoft-only accounts: "You sign in with Google. Set a password to also sign in with email." + **Set password…** (Confirm it's you with Google first) |
| Two-factor (`#two-factor`) | Guarded Action | *Off:* SettingRow + secondary **Turn on…** → Dialog `md` with StageProgress "Scan · Enter code · Save recovery codes": a QR code with "Can't scan? Enter this key" (TextInput read-only, `mono-13`, Copy); the code field; recovery codes in a CodeBlock (§14) with Copy and Download, and Checkbox "I've saved these codes" before **Finish**. *On:* KeyValueList: "On · Authenticator app · since 21 Sep 2026", "Recovery codes · 8 left" + **Show new codes…** (Confirm it's you; the old codes stop working), and **Turn off…** (§5.2) |
| Where you're signed in (`#sessions`) | Action | DataTable at form width (N §7): Device (browser and OS, `data-13`), Location ("Bengaluru (approx.)", from IP), Last active (`formatWhen`; "Active now"), action (**Sign out**, tertiary sm, instant with toast "Signed out of Safari on iPhone"; the current row shows Tag outline "This device" instead). Header action **Sign out of all other sessions…** (tier 2). Link "See sign-in history in Activity" → `/settings/activity?category=sign-in&actor=me` |

**States and copy.** Email invalid: "Enter an email address, like name@company.com." · Same as current: "That's already your email address." · Already used by another account: "That email belongs to another Vaani Labs account. Use a different one." Current password wrong: "That password isn't right." Code wrong: "That code isn't right. Codes change every 30 seconds." ST8 not shipped: Sessions hidden; Password shows "Want to change it? **Email me a reset link**" (the existing reset flow).

**Microcopy.** H1 "Two-factor authentication" → "Security" · "DISABLED · Add a second factor · Enable" → "Off. Ask for a code from an authenticator app when you sign in. **Turn on…**" · Change Email's "CHANGE EMAIL" + "Move your login / to a new address." → the Email address section and "Change email" dialog · "@ew-address@company.com" (icon over text) → no icon; the label says "New email".

**Accessibility.** The QR code has a text alternative (the setup key). Recovery codes are selectable text with Copy. "This device" is part of the row name. Sign-out buttons are named "Sign out Safari on iPhone".

**Telemetry.** `twofa_setup` {step, result}; `session_signout` {scope: one|others}; `email_change_start` / `email_change_confirmed`; `password_change` {result}. Never emails or IPs in payloads.

**Acceptance.**
- [ ] The H1 is "Security"; the page holds email, password, two-factor and sessions, and links to sign-in history.
- [ ] Change email, change or set password, turning two-factor off and new recovery codes each pass "Confirm it's you" once within 10 minutes.
- [ ] "Something looks wrong?" on Activity and security alert emails land on `#sessions`.
