---

## 7. The pages

Every page uses the frame (§3), the save models (§4), the danger rules (§5) and the state matrix (§6). Each page below adds only what is specific to it: job, findings, hierarchy, column layout, sections with components, states and copy, interactions, microcopy, accessibility, telemetry and acceptance. Wireframes show the page column; the frame around it is §3.4–3.5.

### 7.0 Overview (`/settings`)

**Job.** *When something isn't working (we can't call, an app dropped off), show me what needs attention and take me straight there; otherwise, let me find any setting.* It is also the phone and tablet index (§3.5) and the landing page of the nav badge.

**Findings:** F-UX-027, F-RWD-001, EXPLORE-SETTINGS-08 (no phone entry, 2,300 px strip), F-UX-015 (the "Verify" badge needs an explanation).

**Hierarchy.** 1) The attention Notice, if anything needs you. 2) The grouped list. 3) Each row's status.

```
Settings ›                                  (breadcrumb hidden on the Overview itself)
Settings      Sample Realty · You're an admin
──────────────────────────────────────────────────────────────────────
⚠ 2 things need attention
  Caller ID isn't verified. Customers see an unknown number.   Verify
  Google needs you to sign in again.                        Reconnect
──────────────────────────────────────────────────────────────────────
Your account
 [user] Profile          Your name, mobile and WhatsApp number…     Anika R.        ›
 [bell] Notifications    What we email or WhatsApp you about        Email on · WhatsApp off
 [shield] Security         Email address, password, two-factor…      Two-factor off   ›
Workspace
 [bldg] Organization and team  …                                   4 people · 1 invite pending
 [plug] Integrations     …                                         3 connected · 1 needs you
 …
Data
 [trash] Delete account   Close your account                                         ›
```

| Part | Component and configuration |
|---|---|
| Header | PageHeader `page` variant (no breadcrumb), H1 "Settings", meta = workspace name · your role |
| Attention | Notice `warning`, scope `section`, title "{n} things need attention", body = up to 3 rows (sentence + action link), sorted by severity: no workspace admin → no inbound number or caller ID unverified → integration needs reconnect → webhook failing → two-factor off (advisory, dismissible for you). Absent when nothing is wrong. Never "All good" |
| List | **SettingsIndex** `variant="overview"` (§14): one `<ul>` per group under a `label-12` group label; rows 56 px: icon 16 `--text-3`, label `label-13` `--text`, description `meta-12` `--text-3` (hidden below 480 px), status `meta-12` `--text-2` right-aligned (a warning status gets `alert-triangle` 12 in `--warning-text` plus the word), chevron. The row is one link |

**States.** Loading: rows render from config at once; statuses are 40 % skeleton bars, never "0". Status load failed: statuses hidden and the meta reads "Couldn't load status · Retry". Member: rows for pages they can only read show "View only" as the status.

**Interactions.** ↑/↓ are not bound (rows are links; Tab moves). ⌘K "Settings: Phone setup" lands on the page, not here. Action links in the Notice deep-link to the section (`/settings/phone#caller-id`).

**Acceptance.**
- [ ] `/settings` renders the Overview at every width and is the target of the More sheet's Settings row and the TopBar's "‹ Settings".
- [ ] Every attention row is computed from `useWorkspaceState()`; with nothing wrong, no Notice renders.
- [ ] Each row's link lands on the page, and each attention link on the right section with focus on its heading.

### 7.1 Profile (`/settings/profile`)

**Job.** *Keep my name and numbers right, and make the app behave the way I work.* Personal only: no workspace settings, no integrations (F-UX-041).

**Findings:** F-UX-041, F-UX-012, F-QA-021, F-A11Y-003 (labels without `for`), F-A11Y-004 (shortcut off switch), F-A11Y-030 (tab order), F-VIS-032 (theme toggle), EXPLORE-SETTINGS-11 (backticks, "once or twice").

**Hierarchy.** 1) Personal details (the fields). 2) WhatsApp number and its verification state. 3) Preferences.

```
Settings ›
Profile      Anika R. · Admin in Sample Realty
─────────────────────────────────────────────────────────────
Personal details                                     [link]
Full name
[ Anika R.                                          ]
Email
anika@sample.in                      Change in Security
Mobile number (optional)
[+91│ 98765 43210        ]
Teammates and Vaani Labs support can reach you here. It isn't a caller ID.
Unsaved changes · 1 field                 [Discard] [Save changes]
─────────────────────────────────────────────────────────────
WhatsApp number                                      [link]
Get alerts on WhatsApp. We send a code to check the number.
+91 98765 •••• 43   ✓ Verified 21 Sep 2026        Change…  ⋯
─────────────────────────────────────────────────────────────
Preferences                                          [link]
Theme                                   (System | Light | Dark)
Single-key shortcuts                                     [on]
Turn off if you use speech input or a switch device.
Table density                             (Standard | Compact)
Time zone            India Standard Time (IST) · set by the workspace
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Personal details (`#details`) | Section form | Field + TextInput "Full name" (required, 2–60, `autocomplete="name"`); KeyValueList `rows` "Email" = the sign-in email with link "Change in Security" → `/settings/security#email` (read-only here, so there is one place to change it); Field + PhoneInput `kind="mobile"` "Mobile number" (optional, hint above) |
| WhatsApp number (`#whatsapp`) | Action | SettingRow with the state: *none* "Not added" + secondary sm **Add WhatsApp number…**; *code sent* "Code sent to +91 98765 43210 at 10:42 am" + **Enter code…**; *verified* PhoneText masked + StatusText success "Verified 21 Sep 2026" + link **Change…** + `⋯` (Remove…). Dialog `sm` "Add WhatsApp number": Checkbox "Same as my mobile number" (shown when a mobile exists, default on), else PhoneInput `kind="mobile"`; **Send code**; step 2: TextInput code (`inputmode="numeric"`, `autocomplete="one-time-code"`, width 180), "Resend code" (enabled after 30 s, the countdown in the hint), **Verify** |
| Preferences (`#preferences`) | Instant | SettingRow + SegmentedControl "Theme" (System · Light · Dark; writes `localStorage` and the user preference only, never a record; DESIGN-SYSTEM-08); SettingRow + Switch "Single-key shortcuts" (same state as the account menu item, Shell §9.2); SettingRow + SegmentedControl "Table density" (Standard · Compact; the default for data tables, Shift+D still switches per table); SettingRow read-only "Time zone" |

**States and copy.**

| State | Copy |
|---|---|
| Name empty on save | "Enter your name." |
| Mobile invalid (on blur) | "Enter a 10-digit mobile number, like 98765 43210." (C §4.1) |
| WhatsApp code wrong / expired | "That code isn't right. Check the latest WhatsApp message." · "That code has expired. **Resend code**" |
| WhatsApp number can't receive messages | "We couldn't send a WhatsApp message to this number. Check it has WhatsApp, then try again." |
| Remove WhatsApp when alerts use it (tier 2) | "Remove your WhatsApp number? 4 alerts will stop coming on WhatsApp. Email alerts are not affected." |
| ST4 not shipped | the WhatsApp section is hidden, and Notifications shows email only |

**Interactions.** ⌘/Ctrl+S saves Personal details from any of its fields. Tab order follows the visual order (F-A11Y-030). The theme and density controls apply instantly to the page you are on.

**Microcopy.** "Profile Settings / Update your personal information" → H1 "Profile" · "FULL NAME", "PHONE" (placeholder "+91…") → "Full name", "Mobile number (optional)" with the hint · "§ IDENTITY · STATUS APPROVED" → removed · header "Save Changes" → the section's "Save changes", shown only when dirty · "DARK" beside a sun → Theme: System · Light · Dark.

**Accessibility.** Every field in a Field (`<label for>`); the email is a `<dl>` row, not a disabled input. The theme SegmentedControl is a radio group (C §6.4). The shortcuts switch's description is linked by `aria-describedby`.

**Acceptance.**
- [ ] Profile contains no workspace, integration or billing setting; the subdomain, brochure, Google and Microsoft appear on their new pages (§2.2).
- [ ] Typing "abc" in Mobile number and tabbing away shows the mobile error; Save stays enabled and reports it on click (C §8.2).
- [ ] Changing theme or density sends no request other than the user-preference write (network log).
- [ ] Turning off single-key shortcuts here turns them off in the account menu and vice versa.

### 7.2 Organization and team (`/settings/organization`)

**Job.** *Make this workspace ours: its name and address, who is in it, what they can do, and the files our agent sends.* This is the page that must never dead-end (F-UX-001, critical).

**Findings:** F-UX-001, EXPLORE-SETTINGS-02 (circular create), F-UX-041 (subdomain and brochure moved here), F-UX-029 (identity), F-UX-035 (danger placement), F-A11Y-003 (brochure file input), EXPLORE-SETTINGS-11 ("once or twice", backticks).

**Hierarchy.** 1) Members and the Invite button (the most frequent job after setup). 2) Workspace name and address. 3) Shared assets. 4) Danger zone.

Section order puts Workspace first because it is short and defines what the page is about; the header's primary is **Invite…**, so the frequent job is one click from the top.

```
Settings ›
Organization and team    Sample Realty · 4 people · 1 invite pending        [Invite…]
──────────────────────────────────────────────────────────────────────────────
Workspace
Workspace name   [ Sample Realty                        ]
Workspace address
[ sample-realty                  ].vaanilabs.in   ✓ Available
Used in links you share. You can change it 2 more times. Old links keep working.
──────────────────────────────────────────────────────────────────────────────
Members
Person                              Role          Last active
(AR) Anika R.  You                  Admin ▾       Today 10:42 am        ⋯
(DS) Dev S.                         Admin ▾       Yesterday             ⋯
(MK) Meera K.                       Member ▾      3 days ago            ⋯
     r•••@sample.in                 Member        Invited · expires in 6 days  ⋯
▸ What each role can do
──────────────────────────────────────────────────────────────────────────────
Shared assets
WhatsApp brochure (optional)
[Choose file]  brochure.pdf · 1.2 MB · uploaded 21 Sep 2026 · Replace · Remove
Your agent sends it on WhatsApp when a caller asks for details. PDF, JPG or PNG, up to 10 MB.
──────────────────────────────────────────────────────────────────────────────
┌ Danger zone ──────────────────────────────────────────────────────────────┐
│ Leave Sample Realty …                                  [Leave workspace…]  │
│ Delete workspace …                                    [Delete workspace…]  │
└────────────────────────────────────────────────────────────────────────────┘
```

| Section (anchor) | Model | Components and configuration |
|---|---|---|
| Workspace (`#workspace`) | Section form | Field + TextInput "Workspace name" (required, 2–60); Field + TextInput "Workspace address" with trailing `.vaanilabs.in` and the async availability check (C §3.2: "Checking availability…" → "Available" or "Taken. Try sample-realty-2"), `spellcheck="false"`; the remaining change count from the server. On Save with a new address: ConfirmDialog tier 2 "Change your workspace address to sample-homes.vaanilabs.in?" · "Links with the old address keep working. Bookmarks may need updating. You can change it 1 more time after this." · Cancel · **Change address**. With 0 changes left the field is read-only: "You've used both address changes. Contact support to change it again." |
| Members (`#members`) | Action | DataTable (form width, Standard density): Person (Avatar 28 + name `label-13`, email `meta-12` `--text-3`, Tag outline "You"), Role (admins: Select `sm` Admin · Member, each change a tier-2 confirm; members: text), Last active (`formatWhen`) or Tag outline "Invited" + "expires in 6 days", `⋯` (Resend invite · Revoke invite · separator · Remove from workspace…). SearchInput "Search people" only above 10 members. Collapsible "What each role can do" with KeyValueList `rows`. Invite… opens Dialog `md` "Invite teammates": Field + Textarea "Email addresses" (hint "Separate with commas or new lines. Up to 20."), RadioGroup `card` "Role" (Member, default: "Flows, leads, calls and reports." · Admin: "Everything, including phone setup, integrations, keys and teammates."), primary "Send {3} invites" |
| Shared assets (`#assets`) | Action | FileField `single` "WhatsApp brochure" (C §7.2): uploads on choose with a ProgressBar; "Used by: Send WhatsApp in 2 flows" (links) when ST6 knows; Remove per §5.2 |
| Danger zone (`#danger`) | Guarded | DangerZone: Leave workspace… (tier 2), Delete workspace… (admins; tier 3 + Confirm it's you; ST13) |

**States and copy.**

| State | Treatment and copy |
|---|---|
| **No workspace** (an account outside any workspace, today's dead end) | EmptyState first-use in the column: title "You're not in a workspace yet", body "Create one for your team, or ask a teammate to invite you. Invites, phone setup and integrations live in a workspace.", primary **Create workspace…** (Dialog `md` with Shell §12.2's name and address fields), link "How invites work". Integrations and Phone setup show the compact variant with the same action |
| **No admin** (ST1 not yet run) | page Notice `warning`: "This workspace has no admin, so nobody can invite teammates or connect apps. **Contact support** to assign one." Once the repair ships this state cannot occur; it is logged if it does |
| Member view | Workspace read-only; Role as text; no `⋯` except on your own row (Leave…); Invite hidden; page Notice "Only admins can invite teammates or change the workspace. Ask an admin: Anika R. or Dev S." |
| Only member | the table shows you, then a compact EmptyState row: "Invite teammates to share flows, leads and call reports." + Invite… |
| Invite errors | in the dialog: "2 addresses aren't valid: r@ and sales@@x.in." · "meera@sample.in is already in the workspace." (the other invites still go) |
| Invites sent | toast "Invites sent to 3 people"; rows appear as Invited |
| Sole admin | your Role Select aria-disabled "You're the only admin"; Leave aria-disabled "You're the only admin. Make someone else an admin first, or delete the workspace." |
| Address taken on save (race) | field error "Someone just took sample-homes. Try sample-homes-in." |

**Interactions.** The workspace switcher's "Invite teammates…" opens `/settings/organization?invite=1` (the dialog over this page). Role changes never apply on selection alone: the Select opens the confirmation, and Cancel restores the old value.

**Microcopy.** "You aren't an admin of any organization yet… or create your own org below." → the No-workspace or No-admin states above · "Browse organizations →" → removed · "{slug}.vaanilabs.in" with backticks and "change it once or twice" → the rendered address and "You can change it 2 more times." · "Organization" (mono 24 px H1) → "Organization and team".

**Accessibility.** The Role Select's name includes the person ("Role for Dev S."); `⋯` is "More actions for Dev S."; the invited row reads "r•••@sample.in, invited, expires in 6 days". The FileField's hidden input is labelled "WhatsApp brochure".

**Acceptance.**
- [ ] An account with no workspace can create one from this page and reach an enabled Connect button on Integrations in one flow (the E2E test F-UX-001 asks for).
- [ ] No text on the page says "create below" without a create control below; `/admin/organizations` redirects here.
- [ ] A member sees no enabled control except Leave; every read-only area names the admins.
- [ ] Changing a role, removing a person and deleting the workspace each require their tier (§5.2) and write an Activity entry.
