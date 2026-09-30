---

## 2. The new grouping

### 2.1 Sub-nav groups and pages

Five groups, ordered from "mine" to "irreversible". The group tells you whether you can change it: **Your account** is always yours; **Workspace**, **Calling** and **Developer** are edited by admins; **Data** ends with the one irreversible action. Group labels are sentence case, `label-12` `--text-3` (N §1.2 NavGroup), never collapsible.

| Group | Page (label = H1 = `<title>` part) | Index icon | Description (Overview and phone index) | Sub-nav badge (computed only; N §1.5) |
|---|---|---|---|---|
| (top) | **Overview** | `layout-list` | Everything in Settings, and what needs attention | none |
| Your account | **Profile** | `user-round` | Your name, mobile and WhatsApp number, and preferences | none |
| | **Notifications** | `bell` | What we email or WhatsApp you about | none |
| | **Security** | `shield` | Email address, password, two-factor and where you're signed in | none |
| Workspace | **Organization and team** | `building-2` | Workspace name and address, teammates and roles, shared files | `warning` "No admin" (ST1) |
| | **Integrations** | `plug` | Calendars, CRMs and WhatsApp Business | `warning` "Reconnect" (a connection needs attention) |
| | **Assistant** | `bot` | What the Assistant may do without asking | none |
| Calling | **Phone setup** | `phone` | Inbound number, caller ID, transfers and calling hours | `warning` "Verify" (caller ID not verified) or "Set up" (no inbound number); the same fact as the main nav badge (Shell §2.2) |
| Developer | **API keys** | `key-round` | Keys for calling the Vaani Labs API | none |
| | **Webhooks** | `webhook` | Send call and lead events to your systems | `warning` "Failing" (a webhook's last 5 deliveries failed) |
| | **Embed** | `code-xml` | Put a Vaani voice widget on your website | none |
| Data | **Activity** | `history` | Who did what, and when | none |
| | **Export data** | `download` | Download a copy of your data | none |
| | **Delete account** | `trash-2` | Close your account | none; label always `--danger-text` |

On desktop the SettingsNav is **text only** (the main sidebar carries the icons; two icon columns side by side read as one noisy list, F-VIS-032). Icons appear in the Overview and the phone and tablet index, where they help scanning. One icon per page; no icon repeats (today Calendly and Integrations shared a plug, Calling number and Security a shield).

### 2.2 Where the 17 old items went

| Old item (today's route) | New home |
|---|---|
| Profile (in-page tab) | Profile; subdomain → Organization › Workspace; WhatsApp brochure → Organization › Shared assets; Google and Microsoft → Integrations › Your connections; the "Identity · Status Approved" card is dropped (it describes sign-up, not settings) |
| Organization | Organization and team |
| Notifications | Notifications (Instant model kept) |
| Call channel | Phone setup › Transfers |
| Calling number | Phone setup › Caller ID |
| Calendly | Integrations › Your connections |
| Security | Security (becomes a hub) |
| Activity & Audit | Activity |
| API Keys (`/api-keys`) | API keys |
| Embed (`/api-keys/embed`) | Embed |
| Webhooks (`/webhooks`) | Webhooks (+ Webhook deliveries) |
| Integrations | Integrations › Workspace connections |
| Meetings Billing (in-page tab) | Billing › Plans (out of Settings, S7) |
| Data Export | Export data |
| Change Email | Security › Email address |
| Docs (in-page tab) | Account menu › Help and docs (out of Settings) |
| Delete Account | Delete account (last, danger text) |

### 2.3 Role visibility (v1 roles: Admin, Member; open question 1)

| Page | Admin | Member |
|---|---|---|
| Overview, Profile, Notifications, Security | edit | edit (their own) |
| Organization and team | edit | read; can leave the workspace |
| Integrations | edit both groups | edit *Your connections*; read *Workspace connections* |
| Assistant | edit the workspace mode and their own | read the workspace mode; choose an equal or stricter mode for themselves |
| Phone setup | edit | read (numbers masked; "Only admins can change phone setup") |
| API keys, Webhooks, Embed | edit | read; create and revoke are admin actions with the reason shown (open question 2) |
| Activity | everyone's events | their own events |
| Export data | workspace export | their own data |
| Delete account | edit | edit |

Read-only pages render their fields in the read-only state (C §1.5: `--surface-2`, copyable) under one page-scope neutral **Notice**: "Only admins can change workspace settings. Ask an admin: Anika R. or Dev S." (names computed, up to 2, then "and 1 more"). A read-only page never shows Save, footers or disabled buttons row by row.

---

## 3. The Settings frame

### 3.1 Hierarchy (what the eye hits first)

1. **The page H1 and its status meta** ("Phone setup · Caller ID verified · Inbound number ready"), so you know whether this area works before reading anything.
2. **The one thing that needs you**, if anything: a section-scope Notice at the top of the affected section ("Caller ID isn't verified. Customers see an unknown number."), or the dirty section's Save.
3. **Section headings** in page order, each with one line of description.
4. The **SettingsNav current item** (raised key), for orientation only. The nav never shouts; badges appear only for a computed problem.

### 3.2 Layout

**SettingsLayout** (new, §14) is the shell's content area split into the SettingsNav and the page. It keeps the page header aligned with its column (F-VIS-034) and scrolls the page, not the whole frame.

| Part | Values |
|---|---|
| SettingsNav | width `--size-settings-nav` (200); plane `--surface` with a 1 px `--border` right hairline (inside the page, distinct from the `--bg` sidebar); padding `space-12 space-8`; sticky, own vertical scroll; items as N §1.2 NavItem without icons: height `--control-h`, `label-13` `--text-2`, radius-6; current = the raised key (`--nav-active-bg`, 1 px `--nav-active-border`, `e1`, `--text`) plus `aria-current="page"`; group gap `space-12` |
| Page column | starts `--page-margin` (24) after the nav. `width="form"` (default): `max-width: var(--size-container-form)` (720). `width="data"` (API keys, Webhooks, Deliveries, Activity): fluid, `max-width: var(--size-container-page)` (1280). Left-aligned at ≥1024 so the header, sections and nav line up |
| PageHeader | `variant="nested"` (N §2.3): breadcrumb "Settings" (→ `/settings`), H1 `title-20` = the page label, meta = the page's computed status, actions per page (at most one primary, usually none: sections own their actions). Sticky at `z-sticky`, aligned with the column |
| Section | **SettingsSection** (new, §14): `<section aria-labelledby>`; heading `title-16` (`h2`) + Copy-link IconButton; description `body-14` `--text-2`, one sentence, max `--size-measure`; status slot at the heading's end (StatusText sm: "Saved 11:24 am"); content; footer (form model only). Sections are separated by `--space-section-gap` (40) with a 1 px `--border` hairline, never boxed (C §8.1, D P7) |
| Danger zone | the one boxed section: 1 px `--border`, `--radius-8`, rows divided by hairlines (§5.1) |
| Fields | C §8.1: labels above, 16 between fields, 24 between groups, widths by content (`--field-w-short` 180, `--field-w-medium` 320, else full column) |
| Setting rows | **SettingRow** (new, §14) for switches and read-only values with an action: label `body-14` + description `meta-12` `--text-3` left, control or value right; min-height 40 (48 touch); hairline between rows (C §6.3 Layout) |
| Toasts, save bar | the UnsavedChangesBar and toasts sit `calc(var(--size-baseline) + var(--space-16))` above the bottom, inside the page column (O §9.3, §18.3) |

### 3.3 SettingsNav behaviour and semantics

- `<nav aria-label="Settings">` holding one `<ul>` per group, each labelled by its group label (`role="group"` + `aria-labelledby`). Items are links (`<a href>`), one tab stop each, so Cmd/Ctrl-click opens a page in a new tab. The current item has `aria-current="page"`, matched by prefix (`/settings/webhooks/deliveries` marks Webhooks).
- No arrow-key roving (links behave like links); `F6` moves between the shell, the SettingsNav and the page (Shell §3.9).
- A sub-nav click with a dirty section runs the navigation guard (§4.5) before it navigates.
- Badges follow N §1.5: `alert-triangle` 12 + one word in `--warning-text`, included in the link name ("Phone setup, caller ID not verified").
- Pages a role cannot open are omitted (not disabled). A direct visit renders Forbidden in the frame (O §16.1).
- Loading: the nav renders from config instantly; badges render nothing until `useWorkspaceState()` resolves.

### 3.4 Wireframes: desktop and laptop

**Desktop ≥1440** (1440 × 900 shown; Phone setup with a dirty Transfers section):

```
┌─ Sidebar 232 ───┬─ SettingsNav 200 ─┬─ page column (24 margin, max 720) ───────────────────────┬─ free ~264 ─┐
│ [S] Sample Rea… │ Overview          │ Settings ›                                                │             │
│ [search] Sear…  │                   │ Phone setup   Inbound ready · Caller ID verifying 2 of 3  │             │
│ Operate         │ Your account      │───────────────────────────────────────────────────────────│             │
│  …              │  Profile          │ Inbound number                                    [link]  │             │
│ Account         │  Notifications    │ Callers who ring this number reach your agent.            │             │
│  Billing        │  Security         │ +91 80 •••• 2210 ✓ Ready  Answers with Site-visit qual…   │             │
│ ▣ Settings ⚠Ver │ Workspace         │                                  Change flow…  ⋯          │             │
│                 │  Organization an… │───────────────────────────────────────────────────────────│             │
│                 │  Integrations     │ Caller ID                                                 │             │
│                 │  Assistant        │ ◉ Owned ✓   ◉ Compliance…   ○ Authorized                  │             │
│                 │ Calling           │ Checking the number is registered to your business.       │             │
│                 │ ▣ Phone setup ⚠   │───────────────────────────────────────────────────────────│             │
│                 │ Developer         │ Transfers                                                 │             │
│                 │  API keys         │ (•) A phone number  [+91 98765 43210        ]             │             │
│                 │  Webhooks         │ ( ) Rep console, then a phone number                      │             │
│                 │  Embed            │ Unsaved changes · 1 field           [Discard] [Save]      │             │
│                 │ Data              │───────────────────────────────────────────────────────────│             │
│                 │  Activity         │ Calling hours · IST  …                                    │             │
│ (AR) Anika R.   │  Export data      │                                                           │             │
│                 │  Delete account   │                                                           │             │
├─────────────────┴───────────────────┴─ Baseline 28 ───────────────────────────────────────────────────────────┤
```

- The sidebar's Settings item is current and carries the same "Verify" badge as the SettingsNav's Phone setup item (one fact, two places, one source).
- A dirty section shows its **SectionFooter** in place (§4.2). If that footer scrolls out of view, the **UnsavedChangesBar** docks at the bottom of the column (above the Baseline) naming the section.

**Laptop 1280–1439:** identical; the free right gutter shrinks to about 104 px at 1280. `width="data"` pages fill to the right margin.

**Laptop 1024–1279:** the sidebar becomes the 56 px rail (Shell §3.4); the SettingsNav stays at 200. At 1024 the column is exactly 720 (1024 − 56 − 200 − 2 × 24). At viewport heights ≤ 800 the SettingsNav uses `--control-h-sm` items and `space-4` group gaps, so all 14 items fit in 520 px without scrolling (budget: 14 × 28 + 5 labels × 24 = 512).

```
┌R56┬─ SettingsNav 200 ─┬─ column 720 ───────────────────────────────────┐
│ ▣ │ Overview          │ Settings ›                                      │
│   │ Your account      │ Profile                                         │
│   │ ▣ Profile         │─────────────────────────────────────────────────│
│   │  …                │ Personal details …                              │
└───┴───────────────────┴─ Baseline ──────────────────────────────────────┘
```

### 3.5 Wireframes: tablet and phone (index and drill)

Below 1024 the shell is single-pane (D §6.1), so the SettingsNav becomes the **SettingsIndex** (new, §14): the Overview page lists every page as a 56 px row, and each page drills in with one back link. There is no horizontal strip (today 2,300 px wide, F-UX-027).

**Tablet 768–1023** (768 × 1024 shown). TopBar 52: back link "‹ Settings", then the page title (the H1 is portaled into the TopBar title slot, N §2.7), then the wallet chip and search. The column is `min(720px, 100% − 48px)`, **centred**.

```
┌ TopBar: [menu] Settings        ₹2,340  [search] ┐   ┌ TopBar: ‹ Settings  Phone setup   [search] ┐
│ Sample Realty · You're an admin                 │   │ Inbound ready · Caller ID verifying       │
│ ⚠ 2 things need attention                       │   │───────────────────────────────────────────│
│   Caller ID isn't verified. Verify              │   │ Inbound number                    [link]  │
│   Google needs you to sign in again. Reconnect  │   │ +91 80 •••• 2210  ✓ Ready                 │
│─────────────────────────────────────────────────│   │ Answers with Site-visit qualifier v7      │
│ Your account                                    │   │ Change flow…                         ⋯    │
│ [user]   Profile            Anika R.         >  │   │───────────────────────────────────────────│
│ [bell]   Notifications      Email on         >  │   │ Caller ID …                               │
│ [shield] Security           Two-factor on    >  │   │ Transfers …                               │
│ Workspace                                       │   │                                           │
│ [bldg]   Organization and team  4 people     >  │   │ ┌ Unsaved changes in Transfers ─────────┐ │
│ …                                               │   │ │               [Discard] [Save]        │ │
│ Data                                            │   │ └───────────────────────────────────────┘ │
│ [trash]  Delete account                      >  │   │                                           │
└─────────────────────────────────────────────────┘   └───────────────────────────────────────────┘
      /settings (index)                                    /settings/phone
```

**Phone 320–767** (390 × 844 shown). Reached from the More sheet's "Settings" row. Index rows are 56 px with a 20 px icon, the label (`label-13`), the status (`meta-12` `--text-3`) and a chevron; the whole row is the link (44 px minimum hit area). Pages use full-width fields, 44 px controls and 16 px field text (C §1.4). The UnsavedChangesBar docks full width directly above the BottomBar with Discard and Save sharing the width 1:1 (O §18.3); SectionFooters are hidden on phones so there is one save control at a time.

```
┌ ‹ Settings   Profile   [search] ┐      ┌ Settings           [search] ┐
│ Personal details         [link] │      │ ⚠ Caller ID isn't verified. │
│ Full name                       │      │   Verify · and 1 more       │
│ [ Anika R.                   ]  │      │ Your account                │
│ Mobile number (optional)        │      │ [user]   Profile          > │
│ [+91│ 98765 4321             ]  │      │          Anika R.           │
│ This number has 9 digits.       │      │ [bell]   Notifications    > │
│ Mobile numbers have 10.         │      │          Email on           │
│─────────────────────────────────│      │ [shield] Security         > │
│ WhatsApp number                 │      │          Two-factor on      │
│ Not added       [Add number…]   │      │ Workspace                   │
│─────────────────────────────────│      │ [bldg]   Organization     > │
│ Preferences                     │      │ …                           │
│ Theme  (System | Light | Dark)  │      │ [trash]  Delete account   > │
├─────────────────────────────────┤      ├─────────────────────────────┤
│ Unsaved changes · Personal det… │      │ BottomBar · More current    │
│ [  Discard  ]  [    Save     ]  │      │                             │
├─────────────────────────────────┤      └─────────────────────────────┘
│ BottomBar · More current        │
└─────────────────────────────────┘
```

### 3.6 Responsive summary for the frame

| Width | Navigation between pages | Column | Section footer and save bar | Tables (`width="data"`) |
|---|---|---|---|---|
| ≥1440 | Sidebar 232 + SettingsNav 200 | left-aligned, 720 or fluid to 1280 | footer in place; bar docks when the footer is off-screen | DataTable, all priority columns |
| 1280–1439 | same | same | same | same |
| 1024–1279 | Rail 56 + SettingsNav 200 | 720 at 1024 | same | DataTable; lowest-priority columns move into Columns (N §7.5) |
| 768–1023 | Overview index → page; "‹ Settings" in the TopBar | centred, max 720 | same | DataTable with pinned key and actions columns (N §7.13) |
| 320–767 | More sheet → index → page | full width, 16 px margins | footer hidden; bar docks above the BottomBar | ListRow two-line items (N §7.13) |

- No page scrolls sideways at 320 (`overflow-x: clip` on the page scroller, N §2.7). Code, URLs and keys wrap (`overflow-wrap: anywhere`) or scroll inside their CodeBlock, never the page.
- Short screens (≤720 tall): the Baseline folds into a header chip (Shell D10); the save bar's bottom offset drops to `--space-16`.
- The frame never reloads between Settings pages: the nav and header stay mounted and only the column swaps (App Router nested layout), so moving around Settings never flashes a full-screen loader (F-QA-007, EXPLORE-SETTINGS-22).
