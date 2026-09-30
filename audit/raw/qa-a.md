# QA Agent A: interactive functional testing (Vaani Labs, https://vaanilabs.in)

**Scope:** /dashboard ("Agent Cockpit"), /assistant, /flow-builder, /meeting-agent, /personal-agents, and the global chrome: the sidebar, expand/collapse, the `[` shortcut, the theme toggle, the logo, the status footer, and the wallet banner with its links and Dismiss.

**Session:** 26 Sept 2026, about 17:25–18:20 IST. The desktop viewport was 1440x900. I stayed signed in the whole time and was never logged out.

**Screenshots:** `audit/screenshots/va-qa-a/`. I viewed every one I cite.

**Earlier draft:** none existed, so this report is complete, not a merge.

---

## 0. Method, guard, and how to read this report

- **One private browser window.** I used a single Playwright window (`va-qa-a`) with the read-only network guard. The guard aborts every POST, PUT, PATCH and DELETE, all WebSockets, PostHog, OAuth and presence calls, and localStorage is sandboxed in memory.
  - Any "failed save" below is caused by the guard. I only describe how the UI communicates the failure, and I label it **"observed under simulated network failure"**.
  - A **write request blocked after a harmless action** is reported as a finding, because the product fired it without being asked.
- **Things I never clicked:** CONNECT, Test Call, Save Context, Save, ACTIVATE, Private, Delete flow, the trash icon, Create Room, Agent/Intel/Record/Delete room, Generate PPT, Start Task, AI-draft Generate, Voice, Sign out, and any payment control.
- **The one Assistant message.** I sent exactly one message, "What can you do?". The guard blocked it, as intended.
- **Failure injection, in my tab only:**
  - CDP `Network.emulateNetworkConditions`: offline, and a throttle of 600 ms latency with 200 KB/s down.
  - Playwright `route.fulfill` returning 500 for two read endpoints (`/api/personal-agents/tasks`, `/api/meet`).
  - Everything was reset afterwards.
- **Reading the live JS bundle.** I read three handlers from the live JS served to the browser: the status widget, the chip/send handler, and the Test Call / Save Context handlers. This is the only way to see logic behind controls I am not allowed to click. These items are marked **[BUNDLE]**. Everything else is **[LIVE]**. Inferences are marked **[INFERRED]**.
- **Reproduction.** Every bug in section 5 was reproduced twice unless the finding says otherwise.
- **Privacy.** No personal data from the account is quoted in this report. The Cockpit's "Customer Intel" card shows a real lead's name. I refer to it only as "the customer-name field".

---

## 1. What this area of the product does (functional view)

| Surface | Job | Key controls tested |
|---|---|---|
| Global chrome | Navigate 12 areas, show system state, theme, sign out | 12 nav links, logo, `[` shortcut, Expand/Collapse, theme toggle, status footer, wallet banner (Top up / Enable autopay / Dismiss) |
| /dashboard, "Agent Cockpit" | Pick a flow and voice, then talk to the agent in the browser (CONNECT) or have it dial a number (Test Call). The live transcript sits beside customer context. | Flow `<select>`, Refresh flows, Vaani/Vikash, phone input, Test Call (disabled logic), 6 Customer Intel inputs, Save Context (not clicked) |
| /assistant | A chat copilot that "plans, then acts on your data", with a Plan & Actions panel | 4 suggestion chips, composer (Enter / Shift+Enter), Attach, Send, New chat, Voice (not clicked) |
| /flow-builder | A node-canvas editor for the call flows the voice agent runs live | Flow switcher modal, AI draft modal, Settings modal, Undo/Redo, Copy/Paste, Validate, Preview AI script, Full-screen, Keyboard-shortcuts dialog, More actions menu, Destructive actions menu, palette filter and add-node, zoom/fit/interactivity controls |
| /meeting-agent | Create a video room the AI persona joins; list active and past rooms; generate a deck | Title, Session Mode segmented control, Privacy cards, flow select, Refresh, Copy URL, joinees expander, Refresh agent ops, PPT prompt and slide count, "Free minutes" link |
| /personal-agents | Give an autonomous agent a goal-based task | Settings link, REFRESH, NEW TASK inline panel (goal, capability select, Start Task, Cancel) |

**How the pieces connect, from what I observed:**

- The Cockpit's flow and voice pickers write to the user profile (`PATCH /api/auth/profile`). The Meeting Agent's "Active flow (from profile)" reads the same value.
- The Flow Builder writes the flow being viewed (`PUT /api/flows/{id}`) on its own.
- The wallet banner, the status footer and the sidebar are shared across all five pages.

---

## 2. Control-by-control results

✅ = works as labelled with adequate feedback; ⚠️ = works but with a feedback, labelling or state problem; ❌ = does not do what the label says, or fails silently.

### 2.1 Global chrome

| Control | Result | Evidence |
|---|---|---|
| Nav links (12) | ✅ navigate (client-side, 0.8–1.2 s) | Names come only from the `title` attribute. There is no `aria-current` on the active item (`/dashboard` link: `aria-current=null`). |
| Nav hover labels | ❌ | The custom tooltip is rendered but **clipped by the nav's `overflow:auto`**. On `/knowledge` the tooltip spans x 64–154, the nav's right edge is at 63, and `elementFromPoint` at the tooltip returns `ASIDE`. Reproduced on Flow Builder and Knowledge (`sidebar_hover_flowbuilder.png`). See QA-A-09. |
| `[` shortcut | ✅ toggles 72 ↔ 240 px. It is correctly ignored while typing in the Assistant textarea (the `[` was typed and the rail stayed at 72). | |
| Expand / Collapse button | ⚠️ works, but it has no `aria-expanded`. The label "Collapse [" shows the bracket as text. | `sidebar_expanded.png` |
| Theme toggle | ✅ `<html class="dark">`. The aria-label flips ("Switch to dark mode" → "Switch to light mode"). The custom tooltip "Dark mode" is visible. **No cookie changed** (`document.cookie` names and context cookies were identical before and after). | `dashboard_dark.png` |
| Logo (top of rail) | ❌ `href="/"` sends the signed-in user to the **marketing homepage** ("Voice AI agents that handle every call."), with no app shell. Reproduced from `/dashboard` and `/flow-builder`. | `logo_click_landing.png`, QA-A-10 |
| Status footer (green dot, "12ms", hidden "SYS: ONLINE / RGN: Mumbai-1") | ❌ the status is fabricated. It stayed "SYS: ONLINE" with a green dot, and the latency kept changing (10, 13, 12, 13 ms) through 12 s of forced offline. | `offline_12s_status.png`, QA-A-02 |
| Sign out | not clicked. Its accessible name comes from `title` only ("Sign Out"); the expanded rail shows the text "Sign out". | |
| Wallet banner: "Top up" | ❌ goes to `/settings#wallet`, which renders **Profile Settings**. There is no element with id `wallet`. | `banner_topup_landing.png` |
| Wallet banner: "Enable autopay" | ❌ goes to `/settings#autopay`, which also renders Profile Settings. Tested from `/assistant`, so this is the second reproduction on a second page. | `banner_autopay_landing.png` |
| Wallet banner: Dismiss | ⚠️ hides the banner and sets `sessionStorage["vv:walletAlert:dismiss:zero"]=1`. It stays hidden across client-side navigation in the same tab. **Focus drops to `<body>`** after dismissing. | QA-A-18 |

### 2.2 /dashboard (Agent Cockpit)

| Control | Result | Evidence |
|---|---|---|
| Flow `<select title="Select flow">` (16 options) | ❌ Selecting fires `PATCH /api/auth/profile` straight away. There is no toast or "saved" state. Observed under simulated network failure, the select keeps the new value with no error, and a reload reverts it to the server value (it showed a different flow before the reload and "Client A Realty (v2) · f9b04a" after). | `dash_flow_changed_blocked.png`, QA-A-04 |
| Refresh flows (↻, 14x14 px) | ⚠️ Online: the icon spins (`animate-spin`) and `GET /api/flows` returns 200. There is no `aria-busy` and no result feedback. **Offline:** it spins, then nothing. There is no error, and the list silently stays stale. | `offline_dashboard_refreshflows.png` |
| Vaani / Vikash | ⚠️ The visual state and `aria-pressed` switch correctly (Vikash turns violet `rgb(139,92,246)`). Each click fires `PATCH /api/auth/profile` with no feedback. Observed under simulated network failure, a reload reverts to Vaani. Reproduced twice. | `dash_vikash_selected.png`, QA-A-04 |
| Phone input (`type=tel`, maxLength 20, no pattern, no label) | ❌ "123", "abc", "not-a-number" and "+91 00000" all enable Test Call. `validity.valid=true`, there is no `aria-invalid` and no inline message. [BUNDLE] The 8–15 digit check runs **only after Test Call is clicked**, and its error is written into the **Transcript Feed** on the far right: "Enter a valid phone number (8-15 digits) before placing a test call." | `dash_phone_123_testcall_enabled.png`, QA-A-08 |
| Test Call (disabled logic) | ⚠️ `disabled = calling \|\| !value.trim()`. The disabled state is shown only by `opacity:.5`. The enabled state uses `cursor:default` rather than a pointer. The label wraps to 2 lines in an 87x58 button. | |
| Customer Intel inputs (6) | ✅ Typing, blurring and Tab fire no autosave. ⚠️ The phone field is a plain text input pre-filled with a **masked** value (`+91••••••NNNN`). If a user edits it, the bullets become part of the value **[INFERRED risk]**. None of the six fields has a programmatic label (placeholders only). | |
| Save Context (not clicked) | [BUNDLE] `onClick: () => { save?.(); setSaved(true); setTimeout(() => setSaved(false), 2000) }`. It shows **"Context Saved"** with a check icon for 2 s **whether or not the save succeeded**, because the call is not awaited. | QA-A-08 |
| CONNECT | not clicked. [BUNDLE, context] it opens a voice session. | |

**Network on load [LIVE]:**

- All 200: `/api/auth/me`, `/api/orgs?include=membership`, `/api/onboarding/state`, `/api/flows/{id}`, `/api/leads?limit=1`, `/api/billing/wallet`, `/api/flows`.
- The sidebar also prefetches **24 RSC payloads**: all 12 routes, twice, with two different `_rsc` hashes.
- The wallet is re-polled every 60 s ([BUNDLE] `setInterval(x, 6e4)`).

**Timing:** cold load, DOMContentLoaded at 1.5 s and H1 at 4.96 s. Throttled (600 ms RTT, 200 KB/s), a **full-screen "Loading…" with no app shell for 10.2 s** (`throttle_dashboard_2500ms.png`, `throttle_dashboard_5000ms.png`, `throttle_dashboard_h1.png`).

### 2.3 /assistant

| Control | Result | Evidence |
|---|---|---|
| Suggestion chips (4) | ❌ not clicked by design. [BUNDLE / React props] every chip's `onClick` is `() => er(chipText)`, the **same function as Send**. `er()` immediately POSTs to `/api/assistant/chat`. So one click sends "Build a sales call flow and activate it" with no preview or edit step. | QA-A-05 |
| Composer textarea | ✅ Enter sends, Shift+Enter inserts a newline (`"line1\nline2"`), and Enter on an empty box does nothing (no request). ⚠️ There is no label or aria-label. It does not grow with two lines: it stays 41.75 px tall and the content scrolls. | |
| Send | ✅ disabled while empty, enabled once there is text | |
| "What can you do?" (the one allowed message) | Observed under simulated network failure: 250 ms after sending, the user bubble shows and the composer is **already cleared**. The error "Could not reach the assistant. Check your connection and try again." appears as 12 px `#7A8397` text (≈3.5:1 on `#F4F6FA`). It has **no role or aria-live**, **no Retry**, and the text must be retyped. Both the user message and the "system" error were persisted to `localStorage["vaani_assistant_chat"]`. The user bubble is black text on `#2F5FE0` = **3.83:1**. | `assistant_send_250ms.png`, `assistant_send_failed.png`, QA-A-16 |
| Attach | ✅ opens the native picker, single file, `accept` = .pdf, .txt, .csv, .xlsx, .docx, .json, which matches its title | |
| New chat | ✅ aborts any in-flight request ([BUNDLE] `Z.current?.abort()`), clears messages, restores the chips, and resets storage to `[]` | |
| Voice | not clicked. It has a `title` only, no `aria-pressed`, and no pre-flight explanation. | |

**Network on load:** 4 calls, all 200. No console or page errors.

### 2.4 /flow-builder

| Control | Result | Evidence |
|---|---|---|
| (no action) page open | ❌ **`PUT /api/flows/f9b04a18…`** fires on its own about 6.3 s after navigation (≈3.8 s after the nodes render). Seen on 4 separate loads. The status pill stays "Up to date" even though the PUT failed under simulated network failure. | QA-A-01 |
| Flow switcher: "Current flow: … Click to choose a different flow." | ✅ opens the "ALL FLOWS" modal (`role=dialog`, `aria-modal`). Search is focused, with a clear (×) button and the empty state "No flows match your search". It has columns (Category, Last edited), Open buttons, and paging with 20 per page. Escape and outside-click both close it. ⚠️ Focus goes to `<body>` after Escape. While loading, the footer says **"Page 1 of 1 · No flows"** at the same time as "Loading…". The modal height jumps from about 280 to 690 px. There is no "current flow" marker. | `flow_switcher_open.png`, `flow_switcher_loaded.png`, `flow_switcher_nomatch.png` |
| Opening another flow | ❌ **`PUT /api/flows/{that id}`** fires again on its own. I saw this for Client C Media (`bf11c0a3…`) and Client D Demo (v2) (`037fb6c4…`). The URL stays `/flow-builder`, and **a reload returns to "Client A Realty (v2)"** (reproduced twice). | QA-A-01, QA-A-11 |
| "Client A Realty (v2)" row in the picker | shows "Last edited 26 Sept, 16:09" (today). [INFERRED] This is consistent with a view-only visit writing to it earlier today. | `flow_switcher_loaded.png` |
| AI draft | ✅ a good modal: `role=dialog`, `aria-modal`, `aria-label="AI flow draft"`, focus on the prompt, "Generate" disabled while empty, Escape closes, focus returns to the trigger. (Generate was not clicked.) | `flow_ai_draft_open.png` |
| Settings | ✅ a good modal: `aria-label="Flow settings"`, focus on "Flow name", **focus trapped (25 Tabs, 0 escapes)**, Escape closes, focus returns to "Open flow settings" | `flow_settings_open.png` |
| `?` shortcut dialog | ✅ opens with `?`. It lists Undo/Redo/Copy/Paste/Select all/Save/F/Shift-click/Arrows/Backspace…, and Escape closes it. | `flow_shortcuts_dialog.png` |
| More actions (⋯) (`aria-haspopup="menu"`, `role="menu"`) | ❌ **Escape does not close it** (reproduced twice). ArrowDown does not move into the items. The menu is portaled to the end of `<body>`: the first item sits at tab index 140 against the trigger's 49, so **91 Tab stops away**. Tab from the trigger goes to "Private", then "Destructive actions", Save, ACTIVATE… It closes only on an outside mousedown. Items: Export JSON, Import JSON, New flow, Reset to default. | `flow_more_menu.png`, QA-A-06 |
| Destructive actions (trash) | ❌ the same menu behaviour, reproduced twice. Its single item is "Delete flow" (not clicked). | `flow_destructive_menu.png` |
| Validate | ✅ shows "2 FLOW VALIDATION ERRORS" with Jump links (a node "is not connected to any previous step" / "has no outgoing connection"). ❌ The canvas badge still says **"FLOW VALIDATED"** (visible in full-screen right after). | `flow_validate_clicked.png`, `flow_fullscreen.png` |
| Preview AI script | ✅ a dialog with the generated system-instruction text. Escape closes it. | `flow_preview_script.png` |
| Full-screen canvas | ⚠️ hides the whole toolbar and the palette, but **the app sidebar and wallet banner stay** (so it is not real full-screen), and **there is no visible exit control**. Escape exits (twice). `F` also toggles. | `flow_fullscreen.png` |
| Palette filter | ✅ typing "f" does not trigger full-screen, and Backspace edits the text rather than deleting the selected node (26 nodes before and after). Shortcuts are correctly scoped to non-input focus. | |
| Add Speak node (palette) | ✅ 26 → 27 nodes, with the `role=status` toast "New Speak Node added.". ❌ Observed under simulated network failure, an **autosave `PUT` fired and failed**, yet the status stayed "Up to date". | QA-A-01 |
| Undo / Ctrl+Z | ❌ Undo is enabled at load with nothing to undo. After adding a node, both the Undo button and Ctrl+Z leave **27 nodes**, and Redo stays disabled. | QA-A-22 |
| Zoom In / Out / Fit View | ✅ scale 0.712 → 0.854 → 0.593 → fit 0.294 | `flow_fitview.png` |
| Toggle Interactivity | ✅ locks node dragging. ⚠️ It has no `aria-pressed`. | |
| Reload flash | on reload the canvas briefly showed **8 nodes** (a default template) before the real flow's 26 | |

**Network:** 5 GET calls on load, all 200, plus the auto-PUT (blocked). No page errors.

### 2.5 /meeting-agent

| Control | Result | Evidence |
|---|---|---|
| Meeting Title | ⚠️ no label or aria-label. An **empty or whitespace title leaves "Create Room" enabled**. There is no `<form>`, so Enter does not submit (safe, but there is no Enter-to-create either). | QA-A-14 |
| Session Mode (Presentation / Conversation flow) | ✅ switches visually (active is violet `rgb(139,92,246)`), swaps the hint, and hides the flow select in Presentation mode. ❌ It has **no `aria-pressed`, `aria-checked` or tab role**, so assistive tech cannot know which is selected. Presentation mode offers no deck or attachment control even though the hint mentions "an attached one". | `meeting_presentation_mode.png`, QA-A-13 |
| Privacy cards (Open / Encrypted) | ✅ the visual selection moves (green-tinted border and background). ❌ The same missing `aria-pressed`/`aria-checked` problem. | |
| Refresh (Active Rooms) | ⚠️ refetches 5 endpoints (`/api/meet`, `/api/meeting-agent`, `/api/flows`, `/api/meeting-agent/livekit`, `/api/meeting-agent/agents`). It shows **no spinner**, is not disabled, and gives no toast. | QA-A-15 |
| Copy URL (15x15 px icon) | ✅ the icon swaps to a green check. ⚠️ The target is tiny, and the confirmation is visual only (not announced). | |
| "2 joinees ▸" | ✅ expands to a list of rows. ⚠️ It has no `aria-expanded` and relies on the ▸/▾ glyphs. | |
| Refresh agent operations | ✅ `GET /api/meeting-agent/agents` 200 | |
| Generate PPT textarea and slide count | ✅ the button is disabled for empty or whitespace text. The count is clamped to 3–7 (0→5, −3→3, 999→7, 2.5→3). ⚠️ Neither field has a label. | `meeting_generate_ppt_999.png` |
| "Free minutes: 29 / 30" link | ✅ `/settings#meetings-billing` opens the **Meetings Billing** section, which exists. This shows the Settings page does support hash routing; the wallet banner simply points at anchors that don't exist. | `meeting_freeminutes_landing.png` |
| `/api/meet` → 500 (simulated) | ❌ No error is shown. **PAST MEETINGS disappears entirely.** The active room's link changes from the short code `meet.vaanilabs.in/xxx-xxxx-xxx` to `meet.vaanilabs.in/<22-char room id>`. [INFERRED] That fallback URL may not be a valid join link. | `meeting_api_meet_500.png`, QA-A-07 |

**Network on load:** 17 calls, all 200, including **6 separate `/api/meet/{code}/participants` requests**, one per room (an N+1 pattern). H1 appeared at 2.4 s.

### 2.6 /personal-agents

| Control | Result | Evidence |
|---|---|---|
| REFRESH | ⚠️ `GET /api/personal-agents/tasks` 200. The icon is static (no spinner), the button is not disabled, and there is no feedback. | |
| REFRESH offline / 500 (simulated) | ❌ shows the **raw error string** in a pink banner: offline gives "Failed to fetch", and a 500 gives whatever the server's `error` field says (here "simulated"). The page **still renders "No tasks yet. Click New task…" underneath**. There is no Retry in the banner. Reproduced twice (offline, then 500). | `pa_refresh_offline.png`, `pa_tasks_500.png`, QA-A-07 |
| NEW TASK | ⚠️ opens an inline panel. There is **no `aria-expanded`**, focus stays on the NEW TASK button, and Escape does nothing. | `pa_new_task_open.png` |
| Goal textarea / Capability select (14 options) | ⚠️ neither has a programmatic label | |
| START TASK (not clicked) | ❌ **enabled while the goal is empty**. It is also still enabled after typing (expected). | QA-A-14 |
| CANCEL | ✅ closes the panel. ⚠️ The draft ("test") is **kept** and reappears on reopen, which is at odds with the "Cancel" label. | |

---

## 3. Console and network summary per page (normal loads)

| Page | Console `error` / `pageerror` (excluding guard) | 4xx/5xx | Notes |
|---|---|---|---|
| /dashboard | none | none | 7 API calls, 24 RSC prefetches, wallet polled every 60 s |
| /assistant | none | none | 4 API calls |
| /flow-builder | none | none | 5 GETs plus the automatic `PUT /api/flows/{id}` (blocked) |
| /meeting-agent | none | none | 17 API calls, 6 of them per-room participant calls |
| /personal-agents | none | none | 5 API calls |

The only console errors were side effects of my own tests: `ERR_BLOCKED_BY_CLIENT` from the guard, `ERR_INTERNET_DISCONNECTED` while offline, and the simulated 500s. Next.js logged "Failed to fetch RSC payload for /analytics. Falling back to browser navigation" when I navigated while offline.

---

## 4. Loading, offline and error states (cross-cutting)

1. **Hard navigation.** A full-screen centred spinner with "Loading…" and no sidebar or skeleton shows until `/api/auth/me` resolves.
   - Throttled: **10.2 s** of the blank loader on `/dashboard`.
   - Unthrottled: H1 at 2.4–5.0 s.
2. **Client-side navigation while offline.** The app falls back to a full browser navigation and lands on **Chrome's "No internet" page (`chrome-error://chromewebdata/`)**. There is no in-app offline banner, no cached shell and no retry (`offline_spa_nav_analytics.png`, `offline_reload_dashboard.png`).
3. **Status footer while offline.** It keeps claiming "SYS: ONLINE" with a live-looking latency (QA-A-02).
4. **The error treatment differs on every page:**
   - Cockpit: silent.
   - Assistant: grey inline system line.
   - Personal Agents: raw string in a pink box.
   - Meeting Agent: silent, with a section disappearing.
   - Flow Builder: "Up to date" while saves fail.
   - **None of them offers Retry.**

---

## 5. Findings (most severe first)

Each finding lists what I observed, why it matters, the fix I recommend, and the related screenshots.

### QA-A-01 · critical · functional-bug: Flow Builder writes to every flow you merely open, and says "Up to date" when the write fails

**What I observed [LIVE]:**

- With no edit at all, the builder issues `PUT /api/flows/{id}`:
  - about 6.3 s after the page opens (seen on 4 loads for `f9b04a18…`);
  - again whenever another flow is opened from "All flows" (seen for `bf11c0a3…`, Client C Media, and `037fb6c4…`, Client D Demo v2).
- Adding a node from the palette also triggers an autosave PUT.
- In my tab every one of these PUTs failed (simulated), yet the header pill kept showing **"Up to date"**.
- In the picker, "Client A Realty (v2)" shows "Last edited 26 Sept, 16:09", which is today. [INFERRED] This fits a view-only visit writing to it.

**Why it matters:**

- These flows drive live phone calls.
- Opening a flow to *look* at it changes its stored version and its "last edited" date. It may also normalise its data **[INFERRED]**.
- Undo is broken (QA-A-22) and autosave is immediate, so an accidental palette click permanently adds a node to a live flow.
- A save failure is never shown.

**This corroborates** FLOW-CANVAS-01 and FLOW-CONFIG-02 with extra flow IDs, the timing, and the switcher path.

**Recommendation:**

1. Never write on load or on switch.
2. Autosave only after a real user change, and diff against the loaded version first.
3. Show a truthful save state: "Saving… / Saved hh:mm / Couldn't save — Retry", with an unsaved-changes guard.
4. Only update "last edited" when the content changes.
5. Keep a draft copy separate from the live copy: edits go to the draft, and ACTIVATE publishes it.

**Screenshots:** `flow_initial.png`, `flow_switcher_loaded.png`, `flow_validate_clicked.png`.

### QA-A-02 · high · trust-safety: The "SYS: ONLINE / LAT / RGN" status widget is fabricated

**What I observed:**

- [BUNDLE] In the `(dashboard)/layout` chunk:
  - the status is `const [U] = useState("online")`, and no setter is ever called;
  - the latency is `setInterval(() => T(Math.floor(8 + 15*Math.random())), 3000)`, a random 8–22 ms every 3 s;
  - "RGN: Mumbai-1" is a hard-coded string.
- [LIVE] I forced my tab offline for 12 s (`navigator.onLine=false`). The dot stayed green `rgb(23,138,85)`, the text stayed "SYS: ONLINE", and the latency kept changing: 10 → 13 → 12 → 13 ms. No requests were made. Reproduced twice.

**Why it matters:** this is a monitoring-style indicator in a product that sells call reliability. It shows "healthy" during outages, which teaches users to distrust every status in the app. It also sits next to Rep Console, which really can go offline.

**Recommendation:** remove it, or wire it to real signals: `navigator.onLine`, a periodic `/api/health` round-trip time, and the backend or telephony status. Give it three honest states (Online / Degraded / Offline) with a text label, and link it to /status.

**Screenshot:** `offline_12s_status.png`.

### QA-A-03 · high · functional-bug: The wallet banner's money CTAs open the wrong page

**What I observed:**

- "Top up" → `/settings#wallet`, and "Enable autopay" → `/settings#autopay`. Both render **Settings › Profile Settings**; there is no `#wallet` or `#autopay` element. Tested from /dashboard and from /assistant.
- By contrast, the Meeting Agent's `/settings#meetings-billing` **does** open "Meetings Billing". So hash routing works; these two anchors simply don't exist.
- The wallet itself lives on `/billing`.

**Why it matters:** this is the account's only revenue call to action, the wallet is at Rs 0, and the banner shows on every page.

**Recommendation:**

- Point "Top up" at `/billing?action=topup`, opening the top-up sheet with the amount focused.
- Point "Enable autopay" at `/billing#autopay`.
- Add a test that every in-app hash link resolves to a real section.
- Corroborates EXPLORE-CORE-01.

**Screenshots:** `banner_topup_landing.png`, `banner_autopay_landing.png`, `meeting_freeminutes_landing.png`.

### QA-A-04 · high · ux: The Cockpit's flow and voice pickers silently save to the profile and silently revert

**What I observed [LIVE]:**

- Each change of the flow `<select>`, and each Vaani/Vikash click, fires `PATCH /api/auth/profile`.
- There is no "saved" indicator, toast or inline status.
- When the PATCH failed (simulated), the UI kept the new choice with no error. After a reload it silently reverted, from "Vikash" back to "Vaani" and from the chosen flow back to "Client A Realty (v2) · f9b04a".
- Voice reproduced twice; flow select once, matching the explorer's earlier observation.

**Why it matters:** a user can believe a test call will use Vikash or flow X when the server still has Vaani or flow Y. The same profile value also drives the Meeting Agent's "Active flow (from profile)". A change made in one place silently affects another.

**Recommendation:**

- Make the pickers session-local for the Cockpit.
- Or, if they are meant to be a global default, label them "Default flow/voice", confirm with "Saved", roll back with an error toast on failure, and show "Used by: Cockpit, Meeting Agent".

**Screenshots:** `dash_flow_changed_blocked.png`, `dash_vikash_selected.png`.

### QA-A-05 · high · trust-safety: One click on an Assistant suggestion chip sends a command that builds and activates a live flow

**What I observed:** [BUNDLE / React props] all four chips call the same send function as the Send button (`onClick: () => er(text)`). `er()` immediately POSTs `{message, history}` to `/api/assistant/chat`. The first chip reads "Build a sales call flow **and activate it**". There is no step to review or edit it, and no confirmation. I did not click a chip.

**Why it matters:** activating a flow changes what live callers hear. Chips look like harmless examples, but they act as commands with no preview. The page also shows no approval or guardrail state (see EXPLORE-CORE-16).

**Recommendation:**

- Make chips fill the composer so the user can edit and then press Send.
- For any plan that activates, calls or bulk-edits, show the plan in "Plan & Actions" and require an explicit "Approve & run".
- Rephrase the chip to "Draft a sales call flow".

### QA-A-06 · high · accessibility: Flow Builder toolbar menus can't be used from the keyboard

**What I observed [LIVE]:** "More actions" (⋯, `aria-haspopup="menu"`) and "Destructive actions" both open `role="menu"` popovers that:

- **do not close on Escape** (reproduced twice each);
- do not respond to ArrowDown;
- are portaled to the end of `<body>`, 91 Tab stops after the trigger (trigger index 49, first item 140), so Tab from the trigger moves on to Private, Save, ACTIVATE…;
- close only on an outside mouse click.

**Why it matters:** keyboard and screen-reader users cannot reach Export JSON, Import JSON, New flow, Reset to default or Delete flow. The menu also stays open while focus moves on to ACTIVATE.

**Recommendation:** use a proper menu-button pattern (Radix or Headless UI):

- focus the first item on open;
- Arrow, Home and End keys move between items;
- Escape closes and returns focus to the trigger;
- Tab closes the menu;
- keep `aria-expanded` in sync.

The app's own Settings and AI-draft dialogs already do this correctly, so reuse that primitive.

**Screenshots:** `flow_more_menu.png`, `flow_destructive_menu.png`.

### QA-A-07 · high · ux: Failures are silent, raw or contradictory, and nothing offers Retry

**What I observed** (under simulated network failure):

| Page and failure | What the UI did |
|---|---|
| Cockpit, Refresh flows offline | Spins, then nothing. The list is silently stale. |
| Personal Agents, offline | Pink box reading "Failed to fetch" (a raw JS `TypeError` message). |
| Personal Agents, 500 | Pink box showing the server's raw `error` text. |
| Personal Agents, both cases | The **"No tasks yet. Click New task…"** empty state still renders underneath. |
| Meeting Agent, `/api/meet` 500 | No message at all. PAST MEETINGS vanishes. The active room's link switches to a 22-character-ID URL. |
| Flow Builder, failed autosave | "Up to date". |
| Assistant, failed send | Grey 12 px text with no Retry (QA-A-16). |
| Any client-side navigation offline | Chrome's dinosaur page. |

Every row was reproduced at least twice across its variants.

**Why it matters:**

- Users can't tell "you have no tasks" from "we couldn't load your tasks".
- They are shown engineering strings.
- A changed meeting link may be copied and shared **[INFERRED: possibly invalid]**.

**Recommendation:** add one shared error pattern:

- an inline banner with human wording, plus a **Retry** button and a "Details" disclosure for the raw error;
- never render empty states on error;
- keep the last good data with a "stale" note;
- a global offline banner driven by `navigator.onLine`;
- `role="alert"` for errors;
- map server errors to user-facing messages.

**Screenshots:** `pa_refresh_offline.png`, `pa_tasks_500.png`, `meeting_api_meet_500.png`, `offline_spa_nav_analytics.png`, `offline_dashboard_refreshflows.png`.

### QA-A-22 · high · functional-bug: Undo doesn't undo, and combined with autosave accidental edits stick

**What I observed [LIVE]:**

- Undo is enabled on load with nothing to undo.
- After I added a Speak node (26 → 27), both the Undo button and Ctrl+Z left 27 nodes, and Redo stayed disabled.
- An autosave PUT fired for the added node (see QA-A-01).
- Reproduced with the button and with the key (two methods, one session).

**Recommendation:** put every canvas mutation through one history stack: add, delete, move, connect and edit. Disable Undo when the stack is empty. Pause autosave while an undo or redo is in progress. Corroborates FLOW-CANVAS-02.

### QA-A-08 · medium · functional-bug: Test Call validation comes late and lands in the wrong place; Save Context always says "Context Saved"

**What I observed:**

- [LIVE] Test Call becomes enabled for "abc", "123", "not-a-number" and "+91 00000". The input has no pattern, no `aria-invalid` and no inline message.
- [BUNDLE] The handler checks for 8–15 digits only on click, and posts the error into the Transcript Feed, about 450 px to the right of the field.
- [BUNDLE] Numbers starting "+91" use `makeVobizCall`; all others use `makeCall`.
- [BUNDLE] The client does no wallet or prerequisite check, even though the wallet is Rs 0.
- [BUNDLE] Save Context shows "Context Saved" for 2 s without awaiting the save.

**Recommendation:**

- Validate inline as the user types (E.164, with the +91 default made clear).
- Keep Test Call disabled until the number is valid.
- Put errors under the field.
- Before dialling, check wallet balance and caller-ID and explain what is blocking.
- Make Save Context async: pending → saved / failed.

**Screenshot:** `dash_phone_123_testcall_enabled.png`.

### QA-A-09 · medium · visual: The sidebar's hover labels are clipped by the nav, and they cause the rail's stray scrollbars

**What I observed [LIVE]:** each nav item renders a label tooltip positioned to its right (Flow Builder at x=64, Knowledge at x 64–154). The `<nav>` has `overflow:auto` and a right edge at x=63, so:

1. the labels are clipped and never visible (a hit-test at the label returns `ASIDE`);
2. they widen the nav's scroll area to `scrollWidth 175` against `clientWidth 44`. [INFERRED from the numbers] This is the root cause of the horizontal scrollbar with ◀ ▶ arrows drawn inside the 72 px rail (EXPLORE-CORE-04).

Reproduced on two items.

**Recommendation:** render nav tooltips in a portal or popover layer (with `aria-describedby`, shown on hover and focus). Set the nav to `overflow-x: hidden`. Give each link an `aria-label`, and give the active item `aria-current="page"`.

**Screenshot:** `sidebar_hover_flowbuilder.png`.

### QA-A-10 · medium · ia-navigation: The logo inside the app goes to the marketing site

**What I observed [LIVE]:** the logo link (`href="/"`, image alt "VAANI logo") takes the signed-in user out of the app to the marketing homepage, which has no sidebar. Reproduced from /dashboard and /flow-builder.

**Recommendation:** inside the app, link the logo to the app home (/dashboard, or a real overview page) and give it `aria-label="Vaani Labs — home"`. Put a "Back to website" link in an account menu if one is needed.

**Screenshot:** `logo_click_landing.png`.

### QA-A-11 · medium · ia-navigation: Flow Builder has no URL state, so reload and back lose your place

**What I observed [LIVE]:** switching to Client C Media or Client D Demo (v2) leaves the URL at `/flow-builder`. A reload always reopens "Client A Realty (v2)", which is then auto-written too (QA-A-01). Reproduced twice.

**Recommendation:** use `/flow-builder/{flowId}` or `?flow=`. Restore the last-opened flow per user. Make browser back move between flows. Show a breadcrumb: Flows › {name} › Draft/Live.

### QA-A-12 · medium · performance: Hard loads block the whole screen, and offline gives a dead end

**What I observed [LIVE]:**

- On a throttled connection (600 ms, 200 KB/s), /dashboard showed only a centred "Loading…" for **10.2 s**, with no sidebar or skeleton.
- Unthrottled, the H1 appeared at 2.4–5.0 s.
- Offline client-side navigation dumps the user on Chrome's error page.
- Every page load also prefetches 24 RSC payloads.

**Recommendation:**

- Render the app shell (sidebar and header) immediately, with page-level skeletons.
- Gate only the data on `/api/auth/me`.
- Add an offline banner and keep the current page when a navigation fails.
- Limit prefetching to hover or viewport.

**Screenshots:** `throttle_dashboard_2500ms.png`, `throttle_dashboard_5000ms.png`, `throttle_dashboard_h1.png`.

### QA-A-13 · medium · accessibility: Selection and expansion states are visual only

**What I observed [LIVE]:**

- **No state exposed** on:
  - the Meeting Session Mode and Privacy controls (no `aria-pressed`, `aria-checked` or radio/tab roles);
  - the "joinees" expander (no `aria-expanded`);
  - Personal Agents NEW TASK (no `aria-expanded`);
  - sidebar Expand/Collapse (no `aria-expanded`);
  - Toggle Interactivity (no `aria-pressed`);
  - the active nav link (no `aria-current`).
- **Unlabelled fields:**
  - the Assistant composer;
  - the Cockpit phone input and all 6 Customer Intel inputs;
  - the Meeting title;
  - the PPT prompt and slide count;
  - the Personal Agents goal and capability select.
- For contrast, the Vaani/Vikash toggle does use `aria-pressed` correctly.

**Recommendation:** use radio groups for Session Mode and Privacy, disclosure buttons with `aria-expanded`, `aria-current` on nav, and `<label for>` on every field (a visible label, or an `aria-label` for icon-only fields).

### QA-A-14 · medium · ux: Forms don't validate, and panel behaviour is inconsistent

**What I observed [LIVE]:**

- Meeting Agent: an empty or whitespace title leaves "Create Room" enabled.
- Personal Agents:
  - START TASK is enabled with an empty goal;
  - the NEW TASK panel leaves focus on the trigger;
  - Escape doesn't close the panel;
  - CANCEL keeps the draft.
- Meeting and PPT fields are handled inconsistently: PPT trims whitespace, the meeting title doesn't.

**Recommendation:**

- Disable primary actions until required fields are valid, and say why in a hint.
- Move focus to the first field when an inline panel opens.
- Escape or Cancel should close the panel and discard the draft, or say "Draft kept".

### QA-A-15 · medium · consistency: Refresh controls behave three different ways

**What I observed [LIVE]:**

- Cockpit "Refresh flows" is a 14x14 icon that spins while loading.
- Meeting Agent "Refresh" (text + icon) doesn't spin, isn't disabled, and refetches 5 endpoints, including `/api/flows`.
- Personal Agents "REFRESH" (uppercase mono) doesn't spin either.
- None of them announces the result ("Updated just now") or failure.
- The Meeting Agent also makes 6 separate participant requests per load.

**Recommendation:** one Refresh component: ≥ 24x24 target, `aria-busy`, a spinning icon, the button disabled while busy, a "Updated hh:mm" timestamp, and an error with Retry. Batch the participant data into `/api/meet`.

### QA-A-16 · medium · ux: The Assistant's failure path loses the user's text and isn't announced

**What I observed** (under simulated network failure):

- The composer is cleared at send time.
- The error line is not `role=alert`, and it is 12 px `#7A8397` on `#F4F6FA` (≈3.5:1).
- There is no Retry and no "edit and resend".
- Both the user message and the "system" error are persisted to `localStorage["vaani_assistant_chat"]`.
- The user's own message bubble is black text on `#2F5FE0` = **3.83:1**, which fails AA at 13 px.

**Recommendation:**

- Keep the text in the composer until the server acknowledges it, or put a "Retry" / "Edit" action on the failed bubble.
- Announce errors.
- Use white text on primary blue (≈5.2:1).
- Don't store transient errors in the conversation history.

**Screenshots:** `assistant_send_250ms.png`, `assistant_send_failed.png`.

### QA-A-17 · low · ux: The "All flows" picker shows a contradictory loading state and jumps in height

**What I observed [LIVE]:**

- While loading, the footer says "Page 1 of 1 · No flows" next to "Loading…".
- The modal grows from about 280 to 690 px when the data arrives.
- There is no marker for the flow currently open, and two identical "Client A Realty (v2)" rows are told apart only by date.
- Focus goes to `<body>` after Escape.

**Recommendation:** use skeleton rows with a fixed min-height, hide the pager while loading, mark the current flow with a check or "Open now" pill, show the flow ID or version, and return focus to the trigger.

**Screenshots:** `flow_switcher_open.png`, `flow_switcher_loaded.png`.

### QA-A-18 · low · accessibility: Dismissing the wallet banner drops focus to the page body

**What I observed [LIVE]:** after "Dismiss", `document.activeElement` is `<body>`. The dismissal lasts only for the tab (`sessionStorage`).

**Recommendation:** move focus to the main heading. Remember the dismissal per balance state for the session, then show it as a smaller persistent pill.

### QA-A-19 · low · ux: Full-screen canvas has no exit control and isn't really full-screen

**What I observed [LIVE]:**

- Full-screen hides the toolbar and palette, but the app sidebar and wallet banner remain.
- No exit button is visible; only Escape or `F` works.
- The "FLOW VALIDATED" badge is still shown after Validate reported 2 errors.

**Recommendation:** add a floating "Exit full screen (Esc)" button, hide the app chrome too, and derive the badge from the latest validation result.

**Screenshot:** `flow_fullscreen.png`.

### QA-A-20 · low · visual: Test Call's states are hard to read

**What I observed [LIVE]:**

- The disabled state differs from enabled only by `opacity:.5`.
- The enabled state keeps `cursor:default`.
- "Test Call" wraps onto two lines in an 87x58 box.
- The enabled contrast is ≈2.95:1 (EXPLORE-CORE measurement).

**Recommendation:** use the standard secondary-button style (≥ 4.5:1), a single-line label, `cursor:pointer`, and a disabled-reason tooltip.

### QA-A-21 · low · design-system: Colour token names don't match what renders

**What I observed [BUNDLE / LIVE]:**

- The tenant config declares `accent: "#FF9933"` (saffron), and a second white-label tenant "frntel" exists.
- Components use classes like `text-saffron`, `border-saffron` and `hover:text-saffron` (Save Context, Refresh flows), which render **blue `#2F5FE0`**.

**Recommendation:** rename the tokens semantically (`--color-primary`, `--color-accent`) and document the per-tenant mapping, so designers and engineers mean the same colour.

---

## 6. Strengths worth preserving

- **Flow Settings, AI draft and Preview dialogs are properly built:**
  - `role="dialog"`, `aria-modal` and an aria-label;
  - focus moves to the first field;
  - focus is trapped (25 Tabs, 0 escapes);
  - Escape closes;
  - focus returns to the trigger.

  Use this as the template for the toolbar menus and inline panels.
- **Keyboard shortcuts are scoped to non-input focus:**
  - `[` is ignored in the Assistant textarea;
  - `F` and Backspace are ignored in the palette filter;
  - `?` opens a shortcuts dialog, and Escape closes it.
- **The "All flows" picker:**
  - search, focused on open;
  - a clear (×) button;
  - a good no-match state;
  - category and last-edited columns;
  - pagination.
- **The Assistant:**
  - Enter / Shift+Enter conventions;
  - Enter on empty doesn't send;
  - the Attach `accept` list matches the tooltip;
  - New chat aborts in-flight requests;
  - a plain-language error message.
- **Feedback that already works:**
  - the palette add shows a `role=status` toast ("New Speak Node added.");
  - Copy URL confirms with a check icon;
  - Vaani/Vikash expose `aria-pressed`.
- **PPT generator input hygiene:** it clamps slides to 3–7 and trims whitespace.
- **The theme toggle** updates its aria-label and touches no cookies.
- **No JavaScript page errors** and **no 4xx/5xx responses** on any of the five pages during normal use.

---

## 7. Open questions for the team

1. Is the automatic `PUT /api/flows/{id}` on open intentional (for example, schema migration or normalisation)? If so, it should run server-side on read, not as a client write that bumps "last edited".
2. Are the Cockpit's flow and voice pickers meant to set an account-wide default? The Meeting Agent's "Active flow (from profile)" suggests yes.
3. What is the intended recovery path for Test Call when the wallet is Rs 0 and no calling number is assigned? The client does not check either.
4. When `/api/meet` fails, is `meet.vaanilabs.in/<room id>` a valid join URL, or only the short `xxx-xxxx-xxx` code?
5. Should suggestion chips ever execute directly? What approval model does the Assistant use for "activate", "place a call" and "add leads"?

---

## 8. Note on the user's question about sessions expiring mid-run

The relayed request asks whether to hand over something that lets the agents sign in again each time.

- **Please don't share a password, OTP or magic link.** Typing credentials is outside what these agents are allowed to do, even when offered. A stored credential in an automation script is also a real security risk for a production account holding customer data.
- **In this run I stayed signed in the whole time** (about 1 hour). The harness preamble already extends the `sb-access/refresh-token` session cookies to 12 h at each call.
- **What the logouts look like instead [INFERRED].** The earlier mid-run logouts and "tab closed itself" behaviour match what the task notes describe: a hung browser call that hits the 60 s tool limit resets the *shared* browser. That kind of reset loses the session regardless of credentials.
- **The safe pattern:**
  1. You sign in once, by hand.
  2. Agents keep calls short and never touch sign-out, OAuth or auth endpoints.
  3. If a logout still happens, agents stop and report instead of trying to log in.
- **Product-side, the lasting fixes are:**
  - longer refresh-token lifetimes and silent refresh;
  - not redirecting to /login when a single `/api/auth/me` call times out (EXPLORE-CORE-18);
  - optionally, a dedicated read-only QA account or a scoped API token for audits.

---

## 9. Artefacts (`audit/screenshots/va-qa-a/`)

**Dashboard:**

- `dashboard_initial.png`
- `dash_flow_changed_blocked.png`
- `dash_vikash_selected.png`
- `dash_phone_123_testcall_enabled.png`
- `dashboard_dark.png`
- `throttle_dashboard_2500ms.png`, `throttle_dashboard_5000ms.png`, `throttle_dashboard_h1.png`
- `offline_dashboard_refreshflows.png`
- `offline_12s_status.png`
- `offline_spa_nav_analytics.png`
- `offline_reload_dashboard.png`

**Chrome:**

- `sidebar_expanded.png`
- `sidebar_hover_flowbuilder.png`
- `assistant_sidebar_expanded.png`
- `banner_topup_landing.png`
- `banner_autopay_landing.png`
- `logo_click_landing.png`

**Assistant:**

- `assistant_initial.png`
- `assistant_send_250ms.png`
- `assistant_send_failed.png`

**Flow Builder:**

- `flow_initial.png`
- `flow_switcher_open.png`, `flow_switcher_loaded.png`, `flow_switcher_nomatch.png`
- `flow_more_menu.png`
- `flow_destructive_menu.png`
- `flow_settings_open.png`
- `flow_ai_draft_open.png`
- `flow_shortcuts_dialog.png`
- `flow_validate_clicked.png`
- `flow_preview_script.png`
- `flow_fitview.png`
- `flow_fullscreen.png`
- `flow_after_f.png`
- `flow_after_reload_fs.png`

**Meeting Agent:**

- `meeting_initial.png`
- `meeting_presentation_mode.png`
- `meeting_generate_ppt_999.png`
- `meeting_freeminutes_landing.png`
- `meeting_api_meet_500.png`

**Personal Agents:**

- `pa_initial.png`
- `pa_new_task_open.png`
- `pa_refresh_offline.png`
- `pa_tasks_500.png`
