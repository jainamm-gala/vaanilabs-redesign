## 8. Search or jump (⌘K) and global search

**Job:** get to any destination, record or setting in a few keystrokes, start a common action, or find a call by what was said. Today Ctrl+K and `?` open nothing and there is no global search (F-UX-029). The component is `CommandPalette` (overlay §8); this section fixes its **content**.

### 8.1 Entry points

Sidebar `JumpButton` ("Search or jump to…") · rail search button · TopBar search icon (tablet, phone) · the Baseline's "Search" · ⌘K / Ctrl+K anywhere, including inside fields. `/` remains the **page** search on Leads, Call reports and Knowledge and never opens the palette.

### 8.2 Hierarchy

1. The input and the **active row** (surface-2 fill plus a 2 px inset accent-mark bar).
2. Row titles (`data-13`, the matched part at 600, no colour highlight).
3. Group labels and meta (`label-12`, `meta-12`, text-3). Footer hints last.

### 8.3 Content

| Group | Items | Source |
|---|---|---|
| **Recent** (empty query only) | The last 5 records opened, per user and workspace (`vaani:recent:<workspaceId>`, local storage, wrapped in try/catch) | client |
| **Go to** | All destinations from `lib/nav.ts` (Home only during setup), matched on `label` and `keywords` | static |
| **Settings** | Profile · Organization and team · Notifications · Integrations · Phone setup · API keys · Webhooks · Embed · Security · Activity · Export data · Delete account; Billing › Wallet · Usage · Plans · Invoices · Autopay | static |
| **Flows** | name · `Live v7` / `Not live yet` · "Draft, 3 changes" | server |
| **Leads** | display name or "Lead 1042" · masked phone `+91 •••• 4821` · status | server; matches name and digits, always displays masked |
| **Calls** | when · duration · outcome · lead; "Matched in transcript" when the hit was in the transcript | server |
| **Knowledge** | original file name · indexing status | server |
| **Actions** | New lead… · Import leads… · New flow… · Upload files… · Top up… · Start a meeting… · New task… · Invite teammates… (admins) · Theme: System / Light / Dark · Density: Standard / Compact · Turn single-key shortcuts off (or on) · Keyboard shortcuts · Sign out… | static |
| **Help** | Docs ↗ · Setup checklist (→ `/home`) · Service status ↗ · Contact support ↗ · What's new ↗ | static |

**Synonyms** (from `keywords` plus the Settings list): "dashboard", "agent view" → Cockpit; "flow builder", "script" → Flows; "DID", "virtual number", "caller ID", "calling number", "call channel" → Phone setup (F-UX-015); "recharge", "wallet" → Billing and Top up…; "members", "invite", "team" → Organization and team; "2FA", "password", "sessions", "email" → Security; "audit" → Activity.

**Verb rows.** Typing `call <name or digits>` adds action rows "Call Lead 1042…" for the top three matching leads. They open the **Call gate**; the palette never dials, bills or publishes by itself (P3, F-A11Y-004). Destructive actions are never listed; "Delete account" is only a link to its page, which keeps its typed confirmation.

**Context.** On a data page, that page's creation actions rank first (on Leads: New lead…, Import leads…). During setup, the first suggested action is the next setup step ("Continue setup: Add money…").

**Ranking.** Exact label > prefix > synonym > recent > fuzzy. For queries of three characters or fewer, destinations and actions rank above records. Each record group shows up to 5 rows plus "Show all 23 leads matching 'site'", which opens the destination with `?q=`.

### 8.4 Layout

```
Desktop and laptop (Dialog md 560, top 64, flat scrim)      Phone (full screen)
┌───────────────────────────────────────────────────┐     ┌──────────────────────────────┐
│ ⌕ site                                        ✕   │     │ ⌕ site                Cancel │
├───────────────────────────────────────────────────┤     ├──────────────────────────────┤
│ Flows                                             │     │ Flows                         │
│▌⚙ Site-visit qualifier · Live v7 · Draft, 3 chang │     │ Site-visit qualifier          │
│  ⚙ Site-visit reminder · Not live yet             │     │ Live v7 · Draft, 3 changes    │
│ Calls                                             │     │ …                             │
│  ▤ Today 10:42 am · 2:14 · Interested · Matched in│     │ (48 px rows, no footer hints, │
│    transcript                                     │     │  results above the keyboard)  │
│ Knowledge                                         │     │                              │
│  ▢ site-plan-brochure.pdf · Indexed               │     │                              │
│  Show all 7 results in Call reports               │     │                              │
├───────────────────────────────────────────────────┤     └──────────────────────────────┘
│ ↑ ↓ to move · Enter to open · Esc to close        │
└───────────────────────────────────────────────────┘
```

### 8.5 States

| State | Copy |
|---|---|
| Empty query | Recent · Go to · 4 suggested actions |
| Typing | Local groups filter instantly; records query after 300 ms; "Searching records…" with a small Spinner after 200 ms |
| No results | "No matches for 'xyz'." + "Search covers lead names and numbers, call transcripts, flows and files." |
| Record search failed | Local results remain; row "Couldn't search records. Retry" |
| Offline | Local results work; record groups read "Offline. Records can't be searched." |
| Permission | Admin-only items are hidden, except on an exact match, where they show disabled with "Admins only" |

### 8.6 Acceptance criteria: palette

- [ ] ⌘K and Ctrl+K open the palette from every route, including from inside a text field; Esc clears, then closes, and focus returns to where it was.
- [ ] Typing "DID" returns Phone setup first; "dashboard" returns Cockpit; "recharge" returns Top up….
- [ ] "call 4821" returns "Call Lead …" rows; Enter opens the Call gate, and no call request is sent before the gate's confirm (network assertion).
- [ ] No row renders an unmasked phone number; no search query text is sent to telemetry.
- [ ] Every destination label in the palette is identical to the sidebar's.

---

## 9. Workspace switcher, account menu, sign out and theme

Today neither rail state shows who you are or which organization you are in; Sign out is an unlabelled icon, and "Exit" is a primary phone tab (F-UX-029, F-RWD-001).

### 9.1 Workspace switcher (top of the sidebar; rail tile; NavSheet top)

Trigger: `WorkspaceTile` + workspace name (`translate="no"`) + "Workspace · Admin" (data-nav §1.2). Menu (Radix DropdownMenu, `e2`):

```
┌ Sample Realty ───────────────────────┐
│ Admin · Prepaid wallet                │  meta-12 text-3
├───────────────────────────────────────┤
│ Workspace settings                    │  → /settings/organization
│ Invite teammates…                     │  admins; members see "Ask an admin to invite"
│ Billing                               │  → /billing/wallet
├───────────────────────────────────────┤
│ Switch workspace                      │  label, only if you belong to 2 or more
│ ✓ Sample Realty            Admin      │
│   Demo Workspace           Member     │
│ Create workspace…                     │  only where self-serve creation is allowed
└───────────────────────────────────────┘
```

Switching is guarded by unsaved edits (`useUnsavedChangesGuard`), then goes to the new workspace's landing route with the toast "Switched to Demo Workspace." On phones the same choices are an action sheet from the More sheet's account block.

### 9.2 Account menu (bottom of the sidebar; rail avatar; NavSheet; More sheet)

```
┌ Anika R. ─────────────────────────────┐
│ Admin · Sample Realty                  │
├────────────────────────────────────────┤
│ Profile                                │ → /settings/profile
│ Theme                                  │ label
│   ◉ System   ○ Light   ○ Dark          │ radio items (menuitemradio)
│ Motion                                 │ label
│   ◉ Match system   ○ Reduce motion     │ radio items; sets data-motion="reduce"
│ Single-key shortcuts            [on]   │ menuitemcheckbox (F-A11Y-004)
│ Keyboard shortcuts                 ?   │ opens the ? sheet
│ Help and docs                        › │ submenu: Docs ↗ · Setup checklist · Service status ↗ · Contact support ↗ · What's new ↗
│ Back to website                     ↗  │ marketing home, new tab
├────────────────────────────────────────┤
│ Sign out…                              │ last, after a separator
└────────────────────────────────────────┘
```

`external-link` icons appear only on items that really leave the app and open a new tab (F-VIS-031, F-UX-027).

### 9.3 Sign out

`Sign out…` opens a `ConfirmDialog` (sm; a bottom sheet on phones). Focus starts on Cancel.

| Situation | Title | Body | Buttons |
|---|---|---|---|
| Normal | Sign out of Vaani Labs? | You'll be signed out on this device. Scheduled calls and batches keep running. | Cancel · **Sign out** |
| Unsaved or failed edits | same | 2 edits to "Site-visit qualifier" haven't saved yet. They'll be lost if you sign out now. | Cancel · Retry saving · **Sign out anyway** |
| Your browser call is live | same | Your call with Lead 1042 will end. | Cancel · **End call and sign out** |

After signing out: every tab goes to `/login?reason=signed-out` ("You're signed out."). "Sign out of all devices" lives in Settings › Security with the session list (F-UX-044). The phone "Exit" tab is removed.

### 9.4 Theme

- Choices: **System** (default), Light, Dark, as radio items in the account menu, a `SegmentedControl` row in the phone More sheet, and palette actions. The toggle whose icon and label disagreed ("DARK" beside a sun) is retired (F-VIS-032).
- Stored in `localStorage['vaani:theme']` (migrating `vv:theme` once) and optionally as a user preference; applied by the pre-paint script as `data-theme`, with `<meta name="theme-color">` set to `--bg` (foundations §15.3).
- **A theme change never writes a flow or any record** (today toggling fires `PUT /api/flows/{id}`, DESIGN-SYSTEM-08).
- **Motion** sits directly below Theme, with the same pattern: **Match system** (default) · **Reduce motion**, radio items in the account menu, a `SegmentedControl` row in the phone More sheet, and a palette action. It is stored in `localStorage['vaani:motion']` and optionally as a user preference, and the same pre-paint script applies it as `data-motion="reduce"` on `<html>`. The rail overlay, NavSheet and MoreSheet then fade instead of sliding, and the live dot holds still (06-accessibility §14.3, foundations §15.3).

### 9.5 Acceptance criteria: menus

- [ ] The sidebar shows the workspace name and your role at every width ≥1280; the rail tile's name includes both.
- [ ] Sign out is reachable in at most two interactions from any page at every breakpoint, and always asks for confirmation.
- [ ] Changing theme sends no network request (verified with the network log). Changing Motion writes no flow or record.
- [ ] With Motion: Reduce motion on a machine whose OS allows motion, a hard reload paints with `data-motion="reduce"` already on `<html>`, and opening the NavSheet changes no computed `transform`.
- [ ] With single-key shortcuts off, `?`, `[`, J, K, C and the Flow Designer's letters do nothing; ⌘K still works.

---

## 10. Keyboard shortcuts and the `?` sheet

The `?` sheet is a `Dialog` lg (overlay §19), a real dialog with focus management (F-A11Y-027). At the top: the **Single-key shortcuts** switch, with the note "Turn off if you use speech input or a switch device." Sections:

| Section | Keys |
|---|---|
| Everywhere | ⌘K Search or jump · `?` This sheet · `[` Collapse sidebar · F6 Next region · F8 Go to notifications · Esc Close · ⌘Z Undo |
| Lists and tables | `/` Search this page · J / K Next and previous · X Select · Enter Open · **C Call… (opens the Call gate; start with ⌘Enter)** · ⇧D Compact density |
| Records and sheets | J / K with a sheet open moves the sheet · Shift+F10 Row menu |
| Flow Designer | A Add step · C Connect to… · M Move · O Outline · V Variables · ⌘F Find · Alt+. / Alt+, Next and previous issue · Alt+Arrow Move selection · Delete (with Undo). The full canvas map is `06-accessibility` §9.6; the sheet is generated from the registry |
| Forms | ⌘S Save · ⌘Enter Submit from a text area |

Single-key entries carry a "single key" mark so users see what the switch turns off. No shortcut ever dials, bills, publishes or deletes without its gate (P3). Phones do not show keycaps anywhere (F-UX-048); the sheet remains reachable from Help for external keyboards.

---

## 11. Notifications

### 11.1 Routing (v1)

v1 has no bell (D5). Every event has exactly one primary surface, chosen by whether the user must act and whether they are looking.

| Event | Primary surface | Also | Email / WhatsApp (per Settings › Notifications) |
|---|---|---|---|
| Your call changes state | Cockpit call card; Baseline "You" segment; title "On call" | announce | no |
| Batch scheduled, progressing, finished | Cockpit › Up next; Baseline Activity segment | toast when finished if you are elsewhere: "Batch finished · 18 of 20 connected · View" | optional |
| Lead import done or failed | progress toast → success or error toast | Leads meta "Last import: 1,212 · 28 skipped" | no |
| Knowledge file indexed or failed | Knowledge status column | toast if you uploaded it | no |
| Flow published (by you) | publish toast "v8 is live on 1 number and 1 batch · Roll back to v7…" | Flows badge clears | no |
| Flow published by a teammate | Flows list "Published by a teammate · 10:02 am" | (v1.1 inbox) | optional |
| Save failed | SaveState chip, error toast | title prefix | no |
| Wallet low, empty; autopay failed | Baseline or chip; Billing badge; WalletNotice on spending pages | announce once | **yes** (default on for admins) |
| Payment confirmed | success toast | Baseline updates | receipt email |
| Callbacks due | Leads badge "18 due" and the Callbacks due view | none | optional daily digest |
| Number verification changed | Settings badge "Verify"; setup step | toast if you are on Phone setup | yes |
| Proposals to review (admins) | Knowledge badge "3 to review" | none | optional |
| Personal-agent task needs your confirmation | Personal agents badge "1 to confirm" | toast if you are elsewhere | **yes** (these block the task) |
| Assistant plan awaiting approval | inside the Assistant thread only | none | no |
| Calling incident or maintenance | notice on spending pages; Baseline line segment | toast on resolution | admins |
| Offline, session expired | ConnectionBar; SessionExpired dialog | none | no |

**Rules.** No red bubbles and no counts for passive events (new reports, new leads). A toast is only for an effect that is off-screen; nothing important lives only in a toast: each one has a durable home in the table above. The Notifications settings page lists these events with Email and WhatsApp switches and a verified WhatsApp number field; today it points to a field that does not exist (F-UX-041).

### 11.2 v1.1: Activity inbox

When teammates' events and finished jobs need a durable list, add the **ActivityInbox** (specified in part 6): an `inbox` IconButton to the right of the JumpButton (rail: under the search button; tablet and phone: in the TopBar before search), a neutral CountBadge that counts **only items that need you** (confirm a task, review proposals, fix autopay), and a 400 px popover listing the last 30 days. Until it ships, nothing in the shell reserves space for it.

### 11.3 Acceptance criteria: notifications

- [ ] Each row of 11.1 has a test that fires the event and asserts its primary surface; no event is shown only in a toast.
- [ ] No nav badge or count ever renders "0" or a red fill.
- [ ] Error and undo toasts persist until dismissed; informational toasts last 6 s and pause on hover and focus.
