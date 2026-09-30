### 12.9 Knowledge (F-RWD-016)

- **Purpose.** Add sources the agent can quote, see that they are indexed, test a question (`05` §1).
- **Findings → change.** The file table had a 691 px minimum: Embed half visible and Delete hidden at 768; only the File column at 390; the header overflowed 28 px at 360 ("Refres"); raw storage keys as names; the native file input. v1: ListRow below 768 (line 1 display name without the timestamp prefix + indexing StatusText; line 2 size · updated), `⋯` with Embed and "Delete source…" (confirmed); at 768–1023 P1 with pinned key and `⋯`; Refresh folds into `⋯`; Add knowledge is a full-screen dialog on phones with a "Choose a file" button (no drop copy on touch); "Test a question" becomes its own pane below 1024 (`05` §1.16).
- **Acceptance.** [ ] At 768 and 390 every source's actions are reachable without horizontal scrolling. [ ] At 360 the header fits on one row plus an optional meta line.

### 12.10 Leads (F-RWD-011, F-RWD-012)

- **Purpose.** Find, qualify and call people safely (`03`).
- **Findings → change.** Status and Interest vanished below 640–768 with no replacement; 2–3 rows per phone screen; the shortcut legend on touch; 0 rows in landscape; chip rows overflowing from 1024 with no cue; column headers scrolling away. v1: ListRow with the status Tag and "Interest 72" in the row; the legend only on fine pointers; KPIs fold into the view counts and meta; one Filter button with a count and a bottom sheet; ViewTabs as a ScrollRow; the table header sticky with the toolbar on desktop; no per-row call button on phones (calls from the sheet footer or selection mode) (`03` §5.4–§5.6, §11).
- **Acceptance.** [ ] ≥8 rows at 360×780, ≥5 at 320×640, ≥4 at 844×390. [ ] No lead can be called by a single tap on a phone.

### 12.11 Call reports (F-RWD-004, F-RWD-009, F-RWD-010)

- **Purpose.** Review what happened on calls (`04` §2).
- **Findings → change.** A 255–337 px data window under fixed header, KPIs and filters; call details opened inside that strip; the search box 52 px wide at 360; the Neutral pill 12 px off-screen; an 18-column 2,617 px table at every width. v1: one page scroller with a sticky full-width search; views instead of pills; ListRows (time · duration / outcome and sentiment words / two-line summary); the detail sheet full screen with the RecordingPlayer sticky; anchored ≤9 columns with pinned When and Lead at ≥768; captured fields in one Captured column or the sheet.
- **Acceptance.** [ ] At 360×780 ≥8 calls are visible after scrolling the header away; opening a call shows the summary and player at full width. [ ] The search field is ≥ 100% − 32 px wide below 768.

### 12.12 Analytics (F-RWD-008, F-VIS-012, F-UX-048)

- **Purpose.** Understand call volume, outcomes and sentiment over a range (`04` §3).
- **Findings → change.** A 357 px non-wrapping action group panned the whole page by 153–193 px below 543 px; KPI cards clipped; chart ticks 4.8 px on phones and stretched 1.46× on desktop; names cut to 9 characters; Recent calls dropped four columns. v1: meta and `⋯` (CSV, PDF) with a full-width sticky range row; `overflow-x: clip`; compact KPI strip; charts drawn 1:1 from a ResizeObserver with HTML axis text ≥12 px; names wrap to two lines with values on their own line; Recent calls as ListRows (`04` §3.10).
- **Acceptance.** [ ] At 360 the page's scroller has `scrollWidth === clientWidth`; every chart label measures ≥12 px.

### 12.13 Billing (F-RWD-013)

- **Purpose.** See the wallet and runway, top up, manage autopay and invoices (`05` §2).
- **Findings → change.** Billing already reflowed from 1920 to 360; the problems were the banner repeating the page's own message and wrapping its buttons. v1: no banner anywhere; on /billing the WalletNotice never shows; the Top-up sheet is full screen on phones with 44 px presets 3-up and UPI "Open UPI app" first on coarse pointers (`05` §2.16).
- **Acceptance.** [ ] At 320 the Top-up sheet's Pay button is visible above the keyboard while the custom amount field is focused.

### 12.14 Settings (F-RWD-001, RESPONSIVE-B-13)

Owned by `06` (frame §3.5–3.6, per-page summary §11). The responsive contract:

- **Purpose.** Change workspace, calling, developer, security and data settings, and know each change saved.
- **Findings → change.** Settings could not be reached from the phone navigation; on phones its 17 sections became a 2,300 px horizontal strip ending in Delete Account; `/api-keys` had no back link. v1: Settings is in More; **below 1024 the SettingsNav becomes the SettingsIndex** (a grouped list of 56 px rows with status words such as "Verified" or "Two-factor on"), and each page drills in with "‹ Settings" in the TopBar; the column is centred at max 720 on tablets and full width on phones; the UnsavedChangesBar docks above the BottomBar with Discard and Save 1:1; Delete account sits last in the index under Data, never in a scroller.
- **Hierarchy.** (1) the page's form and its save state, (2) the index, (3) destructive actions, visually separated.
- **Per breakpoint.** ≥1024: sidebar or rail + SettingsNav 200 + column. 768–1023 and 320–767: index → page (no sub-nav column), tables as pinned-column tables (tablet) or ListRows (phone).
- **Acceptance.** [ ] Every Settings page is reachable in ≤3 taps from any phone screen (More → Settings → page). [ ] No Settings navigation scrolls sideways at any width. [ ] Delete account is never adjacent to a routine item.

### 12.15 Sign in and sign up (F-RWD-018)

Owned by `08` (AuthLayout §4.2). The responsive contract: a 400 px centred column (`--size-container-narrow`), full width minus 16 px margins on phones; 16 px field text so iOS never zooms on focus (the audit measured 14 px); `autocomplete="email"`, `"current-password"` / `"new-password"`, `"one-time-code"` with `inputmode="numeric"`; the primary is a full-width `lg` button that follows the last field, so the keyboard never covers it; `/signup` and `/login` are separate routes (F-QA-010).
**Acceptance.** [ ] On a real iPhone, focusing any auth field does not zoom the page. [ ] Password managers offer to fill on sign in and to save on sign up.

### 12.16 Marketing home and pricing (F-RWD-017, F-RWD-018)

Owned by `08` (MarketingLayout §4.1). The responsive contract:

- **Findings → change.** The desktop link row appeared from 768 but needed about 925 px, so theme, Log in and Get started were off-screen at 768–840 and items wrapped below 1060; the mobile menu ignored Esc and lacked the theme control; a nested 262 px demo transcript; 14 px inputs; /pricing had no navigation; home was 11.7 screens long on phones. v1 (`08`): five short links (Try it live · Pricing · Enterprise · Security · Docs) in one `nowrap` row from 1024; at 768–1023 the header keeps **Sign in**, **Get started** and a menu button; below 768 **Get started** and the menu button stay (the wordmark hides below 360); the MobileMenu is a modal sheet that closes on Esc, returns focus and holds the theme control; demos scale to their container and the transcript expands in place; every public page has the site navigation.
- **Acceptance.** [ ] `documentElement.scrollWidth <= innerWidth` at 360, 390, 768, 834, 1024 and 1280 (the CI check in `08` §4.1). [ ] At 768 Get started is visible without opening the menu. [ ] The menu closes on Esc and returns focus to its button.

### 12.17 Onboarding (F-RWD-019)

The standalone `/onboarding` page (a decorative `-right-32` blob scrolls it sideways at 1440; it cannot be found again) is replaced by **Home** (§12.1), which is responsive by construction and reachable from the setup card at every width. `/onboarding` redirects to `/home` (`00` §2.4). No decorative element may extend past its container: `overflow-x: clip` on `main`.

### 12.18 Not found, no access and errors

Rendered inside the shell at every width (`00`), one sentence and one action, e.g. "This page doesn't exist. Go to Cockpit." On phones the action is a full-width button; the BottomBar stays so the user can go anywhere.
