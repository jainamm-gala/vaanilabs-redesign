<!-- Assembled from 02-assistant.part1.md, 02-assistant.part2.md, 02-assistant.part3.md, 02-assistant.part4.md, 02-assistant.part5.md, 02-assistant.part6.md, 02-assistant.part7.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 03-pages · 02 · Assistant

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** assistant (`/assistant`, `/assistant/c/{chatId}`)
**Follows:** `spec/00-design-direction.md` (Sutradhar, especially P1, P3, §4 and the Assistant row of §6.6), `spec/01-foundations.md` + `spec/tokens/tokens.css`, and the component specs `spec/02-components-core.md` (*core*), `spec/02-components-data-nav.md` (*data-nav*) and `spec/02-components-overlay-feedback.md` (*overlay*). Components are named as those specs name them. Anything they do not cover is listed in §19 "New components needed".
**Evidence:** finding ids (F-UX-…, F-A11Y-…, F-RWD-…, F-VIS-…, F-QA-…, F-FLOW-…) refer to `audit/consolidated/`. Raw ids (EXPLORE-CORE-16, QA-A-05, QA-A-16, RESPONSIVE-A-11, UX-AUDIT-29) refer to `audit/raw/`.
**Privacy:** every name, number, flow and workspace in this spec and its mock is fictional ("Lead 1042 · Pune", "EMI reminder"). No customer or lead data from the audit appears here.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/02-assistant.md`, assembled from `02-assistant.part1.md` to `.part7.md` (edit the parts, then re-assemble) |
| Reference mock (one responsive page; states switched by URL hash: `#plan`, `#empty`, `#dictating`) | `spec/03-pages/02-assistant.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `02-assistant-desktop.png` (1440, light, plan waiting) · `-desktop-dark.png` · `-empty.png` (1440, first use) · `-laptop.png` (1024) · `-tablet.png` (768) · `-mobile.png` (390, plan waiting) · `-mobile-dictating.png` (390) |

**Contents.** Part 1: §0 what changes, §1 purpose, §2 findings, §3 page principles, §4 hierarchy. Part 2: §5 layout and wireframes per breakpoint. Part 3: §6 components, §7 the conversation, §8 the composer. Part 4: §9 plans, §10 confirming consequential actions. Part 5: §11 voice input, §12 history, §13 states with copy. Part 6: §14 keyboard and interactions, §15 microcopy, §16 accessibility, §17 responsive summary, §18 telemetry. Part 7: §19 new components, §20 backend dependencies, §21 acceptance criteria, §22 open questions.

---

## 0. What changes, in one screen

Today `/assistant` is the calmest page in the app and the audit says to keep its template (00-summary §4). It is also the one place where a single click can ask the system to build **and activate** a live call flow, with no approval, cost or recipient step (F-UX-022, QA-A-05). The redesign keeps the calm and adds the guardrails.

| Today | Redesign |
|---|---|
| A suggestion chip sends "Build a sales call flow and activate it" on one click | Suggestions **insert** text into the composer; nothing is sent, run or dialled from a suggestion (§7.6) |
| "Plan & Actions" narrates work as it happens, with no pause | **Plan first.** Steps are listed before they run; steps that change records wait on an **ApprovalCard**; calls go through the **Call gate** and publishing through the **Publish gate**, exactly as everywhere else (§9, §10) |
| No autonomy setting | Three workspace modes, **Suggest only / Ask before changes (default) / Undoable changes on its own**, in the Auto / Confirm vocabulary of Personal agents (§10.2). No mode can skip a gate |
| History lives in one browser's `localStorage` | Server-side chats per user, a **History** list with search, deep links `/assistant/c/{id}`, and a one-time "Save to account" for old local chats (§12) |
| Failed send clears the text, shows grey 3.5:1 text, no Retry (QA-A-16) | The message stays in the thread as **Not sent** with **Retry** and **Edit**, announced (§13) |
| Blue user bubble with black text at 3.83:1 (F-A11Y-009) | No bubbles. Turns are blocks: yours on `--surface-2`, the Assistant's on `--surface`, each with a speaker line (§7.1) |
| "Voice" connects a live session on click, no explainer | **Dictate** in the composer: speech becomes editable text; nothing is sent until you press Send. First use explains the microphone (§11) |
| Phones leave 241–345 px for the conversation (F-RWD-015) | The wallet banner and the always-open plan card are gone; a 44 px **PlanBar** opens the plan; the thread gets about 520–580 px at 360–390 wide (§5.6) |
| Sparkles icon, em-dash subtitle, system font (F-VIS-008, F-UX-043) | Hanken Grotesk everywhere, no sparkles or glows, sentence-case copy with no em-dash separators |

---

## 1. Purpose and job to be done

**Primary job.** "When I need something done across my Vaani workspace (understand what happened on calls, prepare a list of leads, draft a call flow, set up a round of calls), I want to say it in my own words, typed or spoken, in English, Hindi or Hinglish, and **see exactly what will happen before anything changes**, so I get it done faster without a wrong call being dialled, a wrong flow going live or a wrong bulk edit."

**Secondary jobs.**
1. Ask a question about my data and get an answer I can check: every number links to the calls, leads or passages it came from.
2. Turn a document (a product sheet, an SOP, a script) into a **draft** flow I can open in Flows.
3. Come back to an earlier chat, see what it changed, and undo what can be undone.

**Not this page's job.** Placing or watching calls (Cockpit), editing a flow on the canvas (Flows), bulk editing a table by hand (Leads). The Assistant hands off to those pages with the object already selected. It is never a second, weaker path to the same actions: it uses the same gates, drafts and permissions (principle A2).

**Who.** Sales, support and ops operators and team leads in Indian SMB and enterprise workspaces, on office laptops (1366×768 is common, F-UX-007) and phones between calls. Mixed Hindi and English is normal.

**Signals that the redesign works** (see §18): approvals are decided in under a minute; gate abandonment after "Review and call…" is low and explained by a blocking check, not confusion; Undo rate on Assistant changes stays under 5 %; zero calls or publishes happen without a gate event.

---

## 2. Findings addressed

| Finding | Sev. | Today on this page | What changes here |
|---|---|---|---|
| F-UX-022 (QA-A-05, EXPLORE-CORE-16, UX-AUDIT-29) | medium, raise to high if the server acts without a confirmation turn | Chips send on click; "…and activate it"; no approval, cost or recipients; history in one browser; unlabelled composer; failures lose text | §7.6 insert-only suggestions · §9–§10 plan, ApprovalCard, gates, autonomy modes · §12 server history · §8 labelled composer · §13 failure states |
| F-UX-013, F-A11Y-004 | high | "Place a call" is an advertised capability with no pre-flight | Call steps open the **Call gate**; no mode, key or voice command skips it (§10.4) |
| F-FLOW-001, F-FLOW-031, F-FLOW-004, F-FLOW-014 | critical / high | "Build & activate" writes a flow and makes it live | The Assistant writes only to **drafts**; edits to an existing flow arrive as a diff with Apply to draft · Discard; going live is **Publish** through the Publish gate with validation and "where it goes live" (§10.5) |
| F-RWD-015 (RESPONSIVE-A-11) | medium | 241–345 px chat area on phones; chips and placeholder clipped; subtitle truncated | Phone layout in §5.6: no wallet banner, header row scrolls away, PlanBar instead of the card, placeholder is a short example |
| F-A11Y-009 | high | User bubble black on `#2F5FE0` (3.83:1) | No coloured bubbles; text tokens only (§7.1) |
| F-A11Y-008 | high | Intro and error text in `#7A8397` (3.36–3.52:1) | `--text-2` / `--text-3` (≥ 4.70:1 on every plane) |
| F-A11Y-003, F-A11Y-020 | high | Textarea named only by its placeholder; file input unlabelled | Composer label "Message the Assistant" (visually hidden, `<label for>`); Attach is a named IconButton over a labelled file input (§8) |
| F-A11Y-024, F-A11Y-017 | medium | Attach and Send named by `title` only; Voice has no `aria-pressed` | IconButtons with `aria-label` + Tooltip; Dictate is a toggle with `aria-pressed` (§8, §11) |
| F-A11Y-014, F-A11Y-013 | medium | Replies and errors are silent; document title never changes | `role="feed"` thread, completion-only announcements, `<title>` per chat (§16) |
| F-A11Y-026 (axe `landmark-unique`) | medium | Duplicate unnamed `nav` landmarks | One rendered `nav` from the shell; the plan is a labelled `aside`, the composer a labelled `form` (§16) |
| F-A11Y-023 | medium | 32 px header buttons and 34 px chips on touch | 44 px on touch for every control (§17) |
| F-A11Y-022 | medium | Idle animation elsewhere in the app | Only request-bound spinners and a real audio meter move; both stop under reduced motion (§11, §13) |
| F-UX-019 | medium | Send failure is grey text with no Retry, stored in history | InlineError with Retry and Details, never stored as an Assistant reply (§13.4) |
| F-UX-028, F-UX-002, F-RWD-013, F-A11Y-015 | high / medium | 42–77 px wallet banner, links to Profile, assertive alert | Assistant is not a spending page: no WalletNotice. Wallet appears in the Baseline and, when it blocks a call step, inline on that step with **Top up** → `/billing?topup=1` (§10.4) |
| F-UX-030, F-QA-007 | medium / high | Full-screen "Loading…" without the shell | Shell renders at once; thread and plan skeletons after 200 ms (§13.2) |
| F-UX-031 | medium | The conversation is not addressable | `/assistant/c/{chatId}` and `?step=` deep links (§5.1) |
| F-UX-017, F-UX-043, F-UX-016 | medium | "Agent" means five things; em dashes; vendor names can leak into answers | One name, "Assistant"; sentence case, no em-dash separators; banned vendor terms enforced on Assistant output (§15, §16) |
| F-VIS-001, F-VIS-002, F-VIS-008, F-VIS-034 | high / medium | System font dominates (480 chars); composer 1,278 px wide at 1920 | Hanken via next/font on `<html>`; thread and composer capped at `--size-container-form` 720 (§5) |
| F-UX-045 | medium | Session replay loads on pages with lead data | Replay off on `/assistant`; telemetry carries no message text (§18) |

Strengths kept (00-summary §4): the empty state's plain capability statement and verb-led suggestions, the named plan panel with its own empty state, sentence case, calm sans type, and the Personal Agent autonomy vocabulary.

---

## 3. Page principles (from the direction, applied)

- **A1. Plan before act (P3).** A request that would change anything produces a visible plan first. Read-only questions are answered directly, with a line saying what was looked at.
- **A2. No second door (P3, P5).** The Assistant has exactly the user's permissions and uses the product's own guards: drafts for flows, the Call gate for calls, the Publish gate for going live, the tier model of overlay §3.1 for everything else. It cannot do what the UI cannot do, and no autonomy mode relaxes a gate.
- **A3. Every claim has a source (P1).** Numbers come from the same aggregates as Analytics (`lib/metrics.ts`) with their scope ("Last 7 days · calls, not legs · test calls excluded"). Lists link to their records. If the Assistant cannot see something, it says so.
- **A4. Suggestions never act.** Clicking a suggestion writes into the composer. Only Send sends.
- **A5. Quiet streaming (P7).** Status words ending in "…", no typing effect, no sparkles or glows, no idle motion. Screen readers hear a reply once it is complete.
- **A6. Your words stay yours.** Typed or dictated text is never lost to a failure, a reload or an expired session.

---

## 4. Information hierarchy

| State | 1st: the eye lands on | 2nd | 3rd |
|---|---|---|---|
| First use (new chat) | The composer with its example, and the four suggestions right above it | The one-paragraph capability statement ("I show the plan first…") | The plan panel's three-line explainer of what runs on its own and what waits; Recent chats |
| Answer to a question | The newest Assistant turn: its first sentence and any table or number | The sources line under it (what it looked at) | Follow-up suggestions; turn actions (Copy, Retry) |
| Plan waiting for you | The ApprovalCard: what changes, for whom, what it costs, and its one Neel button | The step list around it (what already ran, what comes next) | The thread's pointer line and the composer |
| Plan running | The running step's status sentence ("Adding 24 leads…") | Done steps with their results | Stop plan |
| Failure | The InlineError on the failed turn or step, with Retry | The preserved message or partial answer | Details (error id) |

One primary Neel button per region, and usually one on screen: Send (composer region) is filled only when there is text; the ApprovalCard's button (plan region) exists only while a step waits. The page header has no primary.

---

## 5. Layout

### 5.1 Routes and URL state

| URL | Shows |
|---|---|
| `/assistant` | A new, empty chat. Nothing is created on the server until the first Send |
| `/assistant/c/{chatId}` | A saved chat. `<title>`: "{chat title} · Assistant · Vaani Labs" |
| `…?step={stepId}` | Scrolls the plan to that step, expands it and moves focus to it (deep links from toasts, History and the nav badge) |
| `…?tab=changes` | Opens the plan panel on the Changes tab |

The open chat, step and tab live in the URL (`pushState` for chat changes, `replaceState` for step focus). History popover state and composer text do not.

### 5.2 Regions and sizes per breakpoint

| Region | Desktop ≥ 1440 | Laptop-L 1280–1439 | Laptop-S 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|---|
| Shell nav | Sidebar `--size-sidebar` 232 | Sidebar 232 | Rail `--size-rail` 56 | TopBar 52 + NavSheet | TopBar 52 + BottomBar 56 (Assistant lives in **More**) |
| Page header | PageHeader 56 (`page` on a new chat, `nested` on a saved chat) | same | same | H1 in TopBar; header row with meta + icon actions | same as tablet, row scrolls away with the thread |
| Conversation | fluid; content column centred, max `--size-container-form` 720, padding `--space-24` | same (column 560–720) | same (column 600–720) | single pane, column max 720, padding `--space-24` | full width, padding `--page-margin` 16 |
| Plan panel | docked right, `--size-sheet-record` 440, collapsible | docked 440 | docked `--size-inspector` 320 | **PlanBar** 44 above the composer → modal Sheet `min(--size-sheet-detail, 100%)` | PlanBar 44 → full-screen Sheet |
| ApprovalCard location | in the plan panel | in the panel | in the panel | **inline**, at the end of the thread | inline |
| Composer | pinned under the conversation column, max 720 | same | same | same | pinned above the BottomBar; the BottomBar hides while the keyboard is open |
| Baseline | 28 | 28 | 28 | TopBar wallet chip | TopBar wallet chip |

Rule: the ApprovalCard renders in **exactly one place**: the plan panel when it is visible, otherwise inline at the end of the thread. Hiding the panel at ≥ 1024 moves a waiting card into the thread.

### 5.3 Desktop ≥ 1440 (1440×900): a plan waiting for approval

```
+----------+-----------------------------------------------------------------------------------------+
| Sidebar  | Assistant > Plan calls for today's callbacks        [History] [New chat] [...] [Hide plan]| 56
| 232      +-----------------------------------------------------+-----------------------------------+
|          | CONVERSATION (column max 720, centred)              | PLAN (440)                        |
| Operate  |                                                     | Plan   [Waiting for you] 3 of 4   |
|  Cockpit | +-------------------------------------------------+ | [Plan] [Changes]      [Stop plan] |
| >Assist. | | You · 10:42 am                                   | | (v) 1 Look up                    |
| 1 waiting| | Plan calls for the 18 callbacks due today. Skip  | |     Find callbacks due today      |
|  Rep c.  | | anyone we called in the last day.                | |     Done · 18 leads · View        |
|  ...     | +-------------------------------------------------+ | (v) 2 Look up                    |
| Build    |   Assistant · 10:42 am                              |     Leave out recent calls        |
|  Flows   |   (search) Looked up 18 callbacks · Leads · 0.8 s   |     Done · 6 left out · 12 remain |
| Data     |   (search) Checked calls since yesterday · 0.4 s    | (||) 3 Call                      |
|  ...     |   18 callbacks are due today. 6 were called in the  | +-------------------------------+ |
| Account  |   last 24 h, so I left them out. 12 remain:         | | Call 12 leads                 | |
|  Billing |   +-----------------------------------------------+ | | EMI reminder v4 . Live        | |
|  Settings|   | Lead      | Due      | Last call  | Language | | | Vaani . Hindi + English       | |
|          |   | Lead 1042 | 11:00 am | 3 days ago | Hindi    | | | Now, until 7 pm IST           | |
|          |   | ... 4 more rows ...                           | | | Lead 1042 +91 ..... 4821      | |
|          |   | and 7 more . Open in Leads                    | | | ... and 9 more . View all 12  | |
|          |   +-----------------------------------------------+ | | 12 calls . ~1-2 min . Rs29-58 | |
|          |   [list] Plan . 4 steps . Step 3 waits for you [Review]| | Checks run again before dial. | |
|          |   Sources: 18 leads . 31 calls                      | | [Skip] [Edit...] [Review and  | |
|          |   [Copy] [Retry]                                    | |                   call...]    | |
|          |                                                     | +-------------------------------+ |
|          |  +-----------------------------------------------+  | ( ) 4 Change                     |
|          |  | Plan today's calls...                         |  |     Mark answered leads Contacted |
|          |  | [Attach]                      [Dictate] [Send]|  |                                   |
|          |  +-----------------------------------------------+  | Asks before changing anything .   |
|          |  Enter to send . Shift+Enter for a new line         | Assistant permissions             |
+----------+-----------------------------------------------------+-----------------------------------+
| Baseline: Live v7 . Site-visit qualifier | Inbound +91 80 .... 2210 . Ready | Wallet Rs2,340.50 . about 16 h of calls | Shortcuts  Search |  28 (shell part 3 §5.2 strings; no Activity segment while nothing runs)
+----------------------------------------------------------------------------------------------------+
```

Heights at 1440×900: header 56 + Baseline 28 leaves 816 px; the composer takes about 96 (one row, attachments hidden, hint line), so the thread scroller gets about 720 px. The plan panel scrolls on its own; its footer (autonomy line) is sticky.

### 5.4 Laptop-S 1024–1279 (1024×768)

```
+----+-------------------------------------------------------------------------------+
|rail| Assistant > Plan calls for today's...       [History] [New chat] [...] [Plan] |
| 56 +--------------------------------------------------+----------------------------+
|    | CONVERSATION (column 600-720)                    | PLAN (320)                 |
|    |  You · 10:42 am ...                              | Plan [Waiting] 3 of 4      |
|    |  Assistant · 10:42 am ...                        | (v) 1 Look up ...          |
|    |  table collapses to 3 columns (Lead, Due, Last)  | (||) 3 Call                |
|    |                                                  | [ApprovalCard, recipients  |
|    |  [composer]                                      |  list 2 rows + "and 10"]   |
+----+--------------------------------------------------+----------------------------+
| Baseline (28)                                                                     |
+-----------------------------------------------------------------------------------+
```

At 1280–1439 the layout is the desktop one with a 560–720 px column. At 1024–1279 the panel is 320: a container query (card narrower than 330 px) switches the ApprovalCard KeyValueList to the `stacked` variant, collapses the recipient rows into one KeyValue row ("Recipients · 12 leads · View all"), and puts `Review and call…` full width on its own row under `Skip step` and `Edit…`. The panel header drops "Step 3 of 4" (the tag carries the state), and the panel scrolls to the waiting card. When the card is taller than the panel, its footer (Skip step · Edit… · Review and call…) sticks to the bottom of the panel's scroll area with a top hairline, so the decision is always on screen. At viewport heights ≤ 720 the Baseline folds into a header chip (shell rule) and the composer hint line is hidden.

### 5.5 Tablet 768–1023 (768×1024)

```
+----------------------------------------------------------------------+
| [menu]  Plan calls for today's callbacks      [Rs2,340]   [search]   | TopBar 52
+----------------------------------------------------------------------+
| Started 10:42 am · 0 changes              [History] [New chat] [...] | header row 48
+----------------------------------------------------------------------+
|   You · 10:42 am  ...                                                |
|   Assistant · 10:42 am  ...                                          |
|   +--------------------------------------------------------------+   |
|   | (||) Step 3 of 4 · Call                  [Waiting for you]   |   |
|   | Call 12 leads · EMI reminder v4 · Live                       |   |
|   | recipients (3 rows) · cost line                              |   |
|   | [Skip] [Edit...]                      [Review and call...]   |   |
|   +--------------------------------------------------------------+   |
+----------------------------------------------------------------------+
| [list] Plan · Step 3 of 4 · Waiting for you                [Open]    | PlanBar 44
| [composer]                                                           |
+----------------------------------------------------------------------+
```

"Open" on the PlanBar opens the plan as a modal Sheet from the right, width `min(560, 100%)`, full height (overlay §1.7 detail sheet at tablet). The Call gate opened from the inline card is an anchored popover if it fits, else a bottom sheet.

### 5.6 Phone 320–767 (390×844)

```
+-------------------------------------+
| < Assistant  Plan calls fo...  [Rs2,340] [search] | TopBar 52 (Back link + H1 = chat title; no menu button on phones)
+-------------------------------------+
| Started 10:42 am   [hist][new][...] | header row 48 (scrolls away)
|                                     |
| You · 10:42 am                      |
| Plan calls for the 18 callbacks...  |
|                                     |
| Assistant · 10:42 am                |
| (search) Looked up 18 callbacks     |
| 18 callbacks are due today. 6 were  |
| called in the last 24 h...          |
|  Lead 1042 · Pune      Due 11:00 am |  two-line list items,
|  +91 ..... 4821 · 3 days ago        |  not a table
|  and 9 more · Open in Leads         |
| +---------------------------------+ |
| | (||) Step 3 of 4 · Call          | |  ApprovalCard inline
| | Call 12 leads · EMI reminder v4  | |
| | 12 calls · Rs29 to Rs58          | |
| | [Skip]  [Edit...]                | |
| | [      Review and call...      ] | |  44 px, full width
| +---------------------------------+ |
+-------------------------------------+
| [list] Plan · 3 of 4 · Waiting  (^) | PlanBar 44
| [clip] Plan today's calls...    [mic] | composer: one 44 px row; Send appears once there is text
+-------------------------------------+
| Cockpit  Leads  Call reports  Flows  ••• More | BottomBar 56 (More is current)
+-------------------------------------+
```

Budget at 390×844: TopBar 52 + header row 48 + PlanBar 44 (+8 gap) + one-row composer 60 (+8 padding) + BottomBar 56 = 276 px of chrome, so the thread gets about 560 px while the header row shows (562 px measured in the mock) and about 610 px once it scrolls away (today: 345). At 360×780: about 500 px (today: 241). With the on-screen keyboard open, the BottomBar and PlanBar hide (`visualViewport`), the composer sits on the keyboard, and the PlanBar returns when the keyboard closes; a waiting step is still visible inline in the thread.

---

## 6. Components used

Every component below is specified elsewhere; this table fixes its configuration on this page. New pieces are in §19.

| Component (spec) | Where | Configuration on this page |
|---|---|---|
| AppShell: Sidebar, Rail, TopBar, BottomBar, MoreSheet (data-nav §1) | Shell | Nav entry `assistant` (icon `bot`, group Operate, no `phoneSlot`, so it lives in More on phones). New computed badge: kind `count`, text "1 waiting" when any of the user's plans has a step waiting for approval (§12.5) |
| Baseline (direction §6.1) | ≥ 1024 | Unchanged. The Assistant adds no segment |
| PageHeader (data-nav §2) | Top of main | New chat: variant `page`, H1 "Assistant", meta = the autonomy sentence (§10.2). Saved chat: variant `nested`, breadcrumb "Assistant", H1 = chat title (`translate="no"`), meta "Started {formatWhen} · {n} changes". Actions: `History` (tertiary, `history`), `New chat` (secondary, `square-pen`), `⋯` (Rename chat…, Assistant permissions, Voice conversation, separator, Delete chat…), and at ≥ 1024 the plan toggle IconButton (`panel-right`, "Hide plan" / "Show plan", `aria-pressed`). **No primary** in the header |
| Button (core §2.1) | Composer, suggestions, ApprovalCard | Send `primary md` (≥ 768); Stop `secondary md`; suggestions `secondary md` with a leading icon; ApprovalCard footer (§10.3) |
| IconButton (core §2.2) | Composer, turns, attachments | Attach (`paperclip`), Dictate (`mic`, toggle, §11), phone Send (see §19 change request), Copy answer (`copy`), Retry answer (`refresh-cw`), Remove attachment (`x`) |
| Textarea, composer mode (core §3.6) + Field (core §3.1) | Composer | Label "Message the Assistant" (visually hidden, real `<label for>`), placeholder "Plan today's calls…" (must fit one line at 320 px), 1 row growing to 5, `enterkeyhint="send"` |
| Dropzone / FileUpload rows (core §7.2) | Composer | Attachments: PDF, DOCX, TXT, CSV, XLSX, JSON (today's accept list), up to 10 MB each, up to 5 per message (limits: open question 3); paste and drop supported |
| Kbd (core §7.3) | Tooltips, `?` sheet | "Send · Enter", "Stop · Esc" |
| Tooltip, Popover, Menu (overlay §5–§7) | Icon buttons, Dictate explainer, History, `⋯` | History is a Popover at ≥ 768 (§12) |
| Sheet (overlay §4) | Plan on tablet and phone; Publish gate | Plan: `detail` variant, modal below 1024. Publish gate: `gate` variant (640) |
| Dialog, ConfirmDialog (overlay §2–§3) | Rename, Delete chat, large deletes | Rename: Dialog `sm` with one TextInput. Delete chat: tier 1 Undo toast, tier 2 ConfirmDialog if the backend cannot soft-delete. Typed confirmation for deleting more than 50 records (§10.1) |
| Toast (overlay §9) | Off-screen outcomes | Undo for changes the Assistant made on its own; "Plan finished" when the user has left the page; "Chat deleted · Undo" |
| Notice, ConnectionBar (overlay §10) | Thread top, ApprovalCard | Local-history migration (info), degraded service (warning), blocked step reasons (warning, inline scope) |
| StatusText, InlineError (overlay §11) | Turns, steps | Step results and failures; send failures |
| Spinner, Skeleton (overlay §12–§13) | Streaming, loading | Two new skeleton layouts: thread and plan (§19) |
| StageProgress marks (overlay §14.3) | Plan steps | Reused marks plus three new mark states (§9.2) |
| EmptyState (overlay §15) | New chat, panel tabs | `first-use` with page-specific content (§13.1); `compact` inside the Changes tab |
| PageError, SectionError, Forbidden, SessionExpired (overlay §16) | Failures | Copy in §13 |
| CommandPalette (overlay §8) | ⌘K | Group "Assistant chats" (search titles); actions "New Assistant chat" and "Ask the Assistant: {query}" (opens a new chat with the query **in the composer**, not sent) |
| PanelTabs (data-nav §3) | Plan panel | "Plan" · "Changes {n}" (CountBadge); tab in the URL (`?tab=changes`) |
| Tag, StatusTag, LiveDot, LanguageMark (data-nav §5) | Steps, cards, dictation | "Waiting for you" (warning), "Live v4" (success, static dot), "Not published" (outline), "Test call" (outline); LanguageMark for dictation and Hindi turns |
| DataTable, ListRow (data-nav §7) | Answers | Read-only mini table: Standard density, no selection, no pager, at most 10 rows and 5 columns, with a caption link to the full view; ListRow on phones (§7.3) |
| StatTile compact, KeyValueList, Card (data-nav §4, §8) | Answers, ApprovalCard | Analytics answers use StatTile `compact` with a mandatory scope line; ApprovalCard facts are a KeyValueList `inline`; a created draft flow is an `interactive` Card |
| Timeline (data-nav §10) | Changes tab | One item per change the Assistant made, with Undo and View (§9.5) |
| VoiceTile, VoicePicker compact, FlowSwitcher `call` mode (data-nav §9, §12.3; core §5.4) | Call step card and its Edit form | Shows and changes the voice and flow for this batch only; never writes the account default (F-UX-014) |
| TurnRow system row and excerpt (data-nav §12.4) | Activity rows, transcript quotes | Activity rows reuse the system-row layout; quoted turns reuse TurnRow `review` with "Play from 00:41" |
| Call gate, Publish gate (`spec/02-components-gate.md` §5.1 and §5.2) | Call and Publish steps | Opened, never re-implemented (§10.4, §10.5) |

---

## 7. The conversation

### 7.1 Turn anatomy

No chat bubbles, no avatars and no alignment tricks: a turn is a block with a speaker line, like a transcript turn row. This removes the 3.83:1 blue bubble (F-A11Y-009) and keeps the page in the product's one visual language (F-VIS-001).

| Part | Your turn | Assistant turn |
|---|---|---|
| Element | `<article aria-labelledby>` inside the feed (§16) | same |
| Fill | `--surface-2`, `--radius-8`, padding `--space-12 --space-16` | none (`--surface`), same padding so text columns align |
| Speaker line | "You" `title-14` `--text` · time `meta-12` `--text-3` (`<time>`, `formatWhen`) | "Assistant" `title-14` · time · optional `Tag outline` "Voice" when the turn came from a voice conversation |
| Activity rows | none | §7.2, above the body |
| Body | `read-15`, `--text`, `white-space: pre-wrap`, `lang` from detection (Devanagari switches to `read-15-deva`) | `read-15`, paragraphs and lists capped at `--size-measure` (68ch), `text-wrap: pretty`; content blocks per §7.3 |
| Attachments | Compact file rows under the body: `file-text` 16 · name (middle-truncated, `translate="no"`) · size `meta-12` | Produced objects (a draft flow card, an export) as Cards |
| Footer | Send state (§8.4) | Plan pointer (§7.4) · Sources (§7.5) · follow-up suggestions (§7.6) · turn actions (§7.7) |

Spacing: `--space-16` between exchanges, `--space-12` between a turn and its reply. The conversation column is centred with max width `--size-container-form` (720 px), so lines never run to 1,278 px (F-VIS-034).

### 7.2 Activity rows (what the Assistant looked at)

Each tool call becomes one row in the TurnRow system-row layout: icon `--icon-sm` + `meta-12` `--text-3` sentence, the object as a link, and the time taken.

| While running | When done |
|---|---|
| Spinner sm + "Looking up callbacks…" | `search` "Looked up 18 callbacks · **Leads** · 0.8 s" |
| Spinner sm + "Reading expo-visitors.csv…" | `file-text` "Read expo-visitors.csv · 212 rows" |
| Spinner sm + "Searching knowledge…" | `book-open` "Found 2 passages in **price-sheet.pdf**" |
| Spinner sm + "Checking the draft…" | `workflow` "Checked **Sales qualifier** draft · No issues" |

More than three rows collapse to "Looked at 4 sources · Show" (Radix Collapsible, `aria-expanded`). Rows name things in plain words; vendor, model or index names never appear (F-UX-016).

### 7.3 Answer content blocks

| Block | Built from | Rules |
|---|---|---|
| Text | Paragraphs, lists, bold, links | `read-15`; no headings above `title-14`; links `--accent-text` underlined; no emoji or decorative symbols in output (sanitised server-side) |
| Table | DataTable, read-only | At most 10 rows and 5 columns at ≥ 1024, 3 columns at 768–1023, **ListRow** two-line items on phones. Caption row: "12 leads · **Open in Leads**", linking to the same filter as a URL. Masked phones in `mono-13`; names `translate="no"` |
| Numbers | StatTile `compact` in a StatGrid row (≤ 4) | Every number comes from `lib/metrics.ts` aggregates with the StatTile scope line ("Last 7 days · calls, not legs · test calls excluded"). A number that appears in prose must also appear in a linked block or source (A3) |
| Facts about one record | KeyValueList `inline` | "Not captured" for missing values; never invented |
| Created object | Card `interactive` | Draft flow: name · `Tag outline` "Not published" · "6 steps · Trigger 1 · Logic 2 · Action 1 · Outcome 2" · link "Open in Flows" |
| Quoted call | TurnRow `review` excerpt | LanguageMark, speaker, text, "Play from 00:41" linking to the call in Call reports |
| Knowledge passage | `--surface-2` block, `--radius-6`, padding `--space-8 --space-12` | Source under it: "price-sheet.pdf · page 3" |
| Code or JSON (webhook payloads) | `mono-13` on `--surface-2` with a Copy IconButton | Only when asked for |

### 7.4 Plan pointer

When a reply creates or changes a plan, its footer carries one row: `list-checks` 16 · "Plan · 4 steps" · the plan's StatusTag ("Waiting for you", "Running", "Done") · link button **Review**. At ≥ 1024 with the panel visible, Review moves focus to the waiting (or running) step in the panel; otherwise it scrolls to the inline ApprovalCard. When the plan ends: "Plan · Done · 2 changes · **View changes**" (opens the Changes tab).

### 7.5 Sources line

`meta-12` `--text-3` "Sources" followed by links separated by " · ": "18 leads · 31 calls · price-sheet.pdf". Each is an `<a href>` to the exact view (Leads with the filter in the URL, Call reports with the date range, the knowledge file), so Cmd/Ctrl-click opens a new tab. A reply that used no workspace data says so: "Sources: none. This answer is general advice."

### 7.6 Suggestions

| Set | When | Content |
|---|---|---|
| Starters (4, fixed) | New chat, above the composer | "Draft a sales call flow" (`workflow`) · "Summarise my last 10 calls" (`file-text`) · "Show this week's call analytics" (`chart-column`) · "Turn a document into a flow…" (`file-up`) |
| From your workspace (≤ 2, computed) | New chat, only when the fact is true now | "18 callbacks are due today. Plan the calls" · "2 calls failed yesterday. Find out why". Counts from the server; hidden when zero or unknown (P1) |
| Follow-ups (≤ 3) | Under the newest reply, hidden while a step waits | Short requests in the user's voice: "Show only Hindi speakers", "Draft a callback script for these leads" |

**Look:** `Button secondary md` with a 16 px leading icon in `--text-2`, radius 6 (never a pill), `white-space: nowrap`; the list wraps with `--space-8` gaps. Phones: a full-width vertical stack of 44 px buttons, text left-aligned.

**Behaviour (the F-UX-022 fix):**
1. Click or Enter **inserts** the text into the composer and focuses it with the caret at the end. It never sends.
2. If the composer already has text, the suggestion is added on a new line after it; typed text is never replaced (A6).
3. Template suggestions end where the user continues: "Draft a sales call flow for " leaves the caret after "for".
4. "Turn a document into a flow…" opens the file picker; after a file is chosen it is attached and "Turn this document into a draft flow." is inserted. Cancelling the picker changes nothing.
5. The polite region announces "Added to your message. Edit it, then press Send."
6. The group is `role="group"` `aria-label="Suggestions"`; each item is a `<button type="button">` (today's chips are implicit submits, F-A11Y-016).

### 7.7 Turn actions

| Turn | Actions | Rules |
|---|---|---|
| Assistant | Copy (`copy`, "Copy answer"), Retry (`refresh-cw`, "Answer again"), `⋯` (Helpful, Not helpful…, Report a problem…) | IconButton `sm`; shown on hover and `:focus-within` for fine pointers, always on touch. Copy copies Markdown with source links. **Retry is `aria-disabled`** once any step from that reply has run: "Steps from this answer already ran. Ask again instead." |
| Yours | Copy; **Edit** on your latest message only while no step of its plan has run | Edit moves the text back into the composer and discards the reply after an inline "Replace the answer?" confirm (inline in the turn, not a modal) |

### 7.8 Language

The Assistant answers in the language of the request: English in, English out; Hindi in Devanagari in, Devanagari out; Hinglish in, Hinglish (`hi-Latn`, Latin script) out. The server returns `lang` per turn; the turn element carries it, so Devanagari uses `read-15-deva` and `base.css` removes tracking. Chrome stays English in v1 (direction §4.5). Lead, flow and brand names carry `translate="no"`. Numbers, money and times always use `lib/format.ts` (₹2,34,050.00, 10:42 am, IST for calling hours).

### 7.9 Scrolling

The thread follows the TranscriptFeed follow-mode rules (data-nav §12.4): it follows a streaming reply while pinned (within `--space-48` of the bottom); any scroll up, or a text selection, unpins it; while unpinned a secondary `sm` Button "Jump to latest" (`arrow-down`) floats centred above the composer (`--e2`, `--z-float`). End re-pins. Opening a saved chat lands on the newest turn, or on the plan pointer if a step waits.

---

## 8. The composer

### 8.1 Anatomy

```
+----------------------------------------------------------------------+
| [file-text] expo-visitors.csv  38 KB  Ready  [x]                     |  attachment rows (only when present)
| Plan today's calls...                                                 |  textarea, 1 to 5 rows
| [paperclip]                                        [mic]  [^ Send]   |  tool row
+----------------------------------------------------------------------+
  Enter to send · Shift+Enter for a new line                              hint (first 3 sends, fine pointers)
```

| Part | Spec |
|---|---|
| Region | `<form aria-label="Message the Assistant">`, centred, max 720, padding `0 --space-24 --space-16` (phone: `0 --page-margin --space-8`); sits under the thread, never overlapping it |
| Box | `--surface`, 1 px `--control`, `--radius-8`, padding `--space-8`; focus: the 2 px `--focus` outline with 2 px offset on the box via `:has(textarea:focus-visible)` (core §3.2) |
| Textarea | Composer mode: `body-14` (16 on touch), 1 row growing to 5 then scrolling inside; no border of its own; `aria-describedby` → hint and any error |
| Attachment rows | Compact FileUpload rows (height `--control-h-sm`, `--surface-2`, 1 px `--border`, `--radius-6`), wrapping; status per core §7.2 ("Uploading… 60%" with a 2 px `--accent-mark` bar, "Ready", "Couldn't upload · Retry", rejection reason in `--danger-text`) |
| Attach | IconButton `paperclip`, "Attach files"; tooltip "Attach files · PDF, DOCX, TXT, CSV, XLSX or JSON · up to 10 MB"; opens a labelled hidden file input (`multiple`) |
| Dictate | IconButton toggle `mic` ↔ `square`, "Dictate" / "Stop dictation", `aria-pressed` (§11) |
| Send | ≥ 768: `Button primary md`, leading `arrow-up`, label "Send", tooltip "Send · Enter". < 768: 44 px Neel IconButton `arrow-up` "Send" (§19 change request) that appears only once there is text; while the composer is empty the row is Attach · text · Dictate, so the placeholder keeps its full width. While a reply streams it is replaced in place by `Button secondary md` "Stop" (`square`), tooltip "Stop answering · Esc" |
| Hint | `meta-12` `--text-3` under the box: "Enter to send · Shift+Enter for a new line"; shown for a user's first three sends on fine pointers (a UI preference), never on touch |

### 8.2 Sending rules

| Situation | Behaviour |
|---|---|
| Enter (fine pointer) | Sends, unless an IME composition is active (`event.isComposing`), so Hindi and other Indic keyboards can confirm a word with Enter without sending |
| Shift+Enter | New line |
| ⌘/Ctrl+Enter | Sends on every pointer type (the textarea rule of the Web Interface Guidelines) |
| Touch | Enter adds a line; the Send button sends |
| Empty or whitespace only | ≥ 768: Send is `aria-disabled` with the tooltip reason "Type a message to send". < 768: Send is not shown. Enter does nothing and nothing is requested |
| Attachments still uploading | Send `aria-disabled`: "Wait for 1 file to finish uploading." |
| Reply streaming | Typing continues; Send becomes Stop; Esc in the textarea stops. Messages are not queued |
| A plan step is waiting | Sending is allowed ("Also skip leads in Nashik"). If the reply changes the plan, the waiting card shows "Plan changed · Review again" and any earlier preview is discarded |
| Dictating | Send is `aria-disabled` on ≥ 768 ("Stop dictation to send") and hidden on phones, because interim words are not final |
| Offline | Send `aria-disabled`: "You're offline. Your message stays here." |

### 8.3 Keeping the user's words (A6, QA-A-16)

- **Unsent text** is saved per chat in `localStorage` (wrapped in try/catch, a per-viewer convenience) and restored after a reload, a crash or SessionExpired. It clears after a successful send.
- **Send is optimistic but honest:** your turn appears at once with meta "Sending…"; it becomes the time only when the server acknowledges it. On failure the turn stays with "Not sent" and **Retry · Edit** (§13.4). Nothing about a failure is stored as an Assistant reply (QA-A-16).
- **Long pastes:** more than 8,000 characters shows an inline hint under the box, "Long text works better as a file. **Attach as a file**", which converts the pasted text into a `.txt` attachment. The limit is a soft count; typing is never blocked (core V9).

### 8.4 Attachments

- Attach button, paste of files, or dropping anywhere on the conversation region. While dragging over it the region shows a drop target: `--accent-soft` fill, 1 px `--accent-mark` inset border, "Drop to attach · PDF, DOCX, TXT, CSV, XLSX or JSON · up to 10 MB each". The region is not a tab stop; the Attach button is the keyboard address (core §7.2).
- Types and sizes are checked on selection and on drop; each rejected file keeps a row with its reason and fix ("Not a supported file. Attach PDF, DOCX, TXT, CSV, XLSX or JSON.", "Larger than 10 MB. Compress it or split it.").
- Uploads start on add. Removing an attachment before sending deletes it.
- A leads CSV or XLSX never imports from the composer: the Assistant proposes an **Import** step whose ApprovalCard carries the Leads import mapping preview (row count, phone column, per-row problems) (§10.3, core §7.2).
- A scanned PDF with no text is reported in the reply: "I couldn't read text in 'brochure.pdf'. It may be a scanned image. Attach a text PDF or DOCX."
- Retention: attachments are kept with the chat and deleted with it (the History footer says so, §12.3).

### 8.5 References with `@` (v1.1, optional)

Typing `@` opens a Combobox (core §5.3) of flows, lead views, knowledge files and teammates, anchored at the caret, so a request can name its object exactly ("Call the leads in @Expo visitors with @EMI reminder"). The reference renders as a token (`--accent-soft` fill, `--accent-soft-text`, `--radius-4`) and is sent as an id. Unknown text after `@` stays plain text. It reduces wrong-object plans; it is not required for v1.

---

## 9. Plans

A **plan** is the ordered list of steps the Assistant will take for one request. It is shown before anything runs and stays attached to the chat as the record of what happened (principles A1, A2).

### 9.1 Step kinds

| Kind (word on the step) | Examples | Changes the workspace? | Default guard (mode "Ask before changes") |
|---|---|---|---|
| **Look up** | Find callbacks due today; summarise the last 10 calls; this week's analytics; search knowledge; read an attachment | No | Runs on its own |
| **Draft** | Create a new flow as a draft (not published); write a script; save a lead view | Creates something new that is not live | Runs on its own; result is a Card |
| **Edit draft** | Change the draft of an existing flow | Changes a shared draft (never Live) | ApprovalCard with a diff: Apply to draft · Discard (F-FLOW-031) |
| **Change** | Add or import leads; set status; assign a flow; schedule a callback; add a note; add a knowledge file | Yes, reversibly | ApprovalCard |
| **Delete** | Delete leads or a knowledge file | Yes | ApprovalCard; typed count above 50 records |
| **Call** | Call n leads now or at a time; call yourself to test | Dials people and costs money | **Call gate** |
| **Publish** | Publish a flow draft as a new live version | Goes live | **Publish gate** |
| **Open** | "Open Leads with this filter" | No | A link (used in Suggest only mode) |

**Out of reach in v1** (the Assistant says so and links to the page): top up, billing and autopay; settings, roles, invites, API keys and webhooks; deleting flows or the workspace; sending WhatsApp or SMS; taking over or ending a live call; exporting data outside the workspace. It always acts with the signed-in user's role and never sees data that role cannot see.

### 9.2 Step statuses

Marks reuse the StageProgress visuals (overlay §14.3, 20 px) and add three (§19).

| Status | Mark | Result line (StatusText `sm`) | Announced (polite unless noted) |
|---|---|---|---|
| Queued | 1.5 px `--control` ring | "After step 3" (`--text-3`) | no |
| Running | Spinner sm in a 2 px `--accent-mark` ring | "Adding 24 leads…" | no |
| Waiting for you | **new:** `pause` 12 on `--warning-soft`, `--warning-text` | Tag `warning` "Waiting for you" + the ApprovalCard | "Step 3 needs your approval" |
| Done | `check` on `--success-soft` | "Done · 24 added · **View in Leads** · **Undo**" | "Step 2 done" (debounced; several finishing together read "Steps 1 and 2 done") |
| Blocked | **new:** `lock` 12 on `--warning-soft` | The reason and the fix: "Only admins can publish flows. Ask an admin." | yes |
| Failed | `x` on `--danger-soft` | InlineError: "Couldn't add 3 of 24 leads. **Retry step** · Details" | **assertive**, once |
| Skipped · Cancelled · Expired | **new:** `minus` (or `timer-off` for Expired, the one Expired icon in N §5.3) 12 on `--surface-3`, `--text-2` | "Skipped by you" · "Not run: plan stopped" · "Approval expired after 24 h · **Ask again**" | no |

### 9.3 Plan lifecycle

1. **Planning…** The panel header shows Spinner sm + "Planning…"; then every step appears as Queued. A plan never appears one step at a time as if improvised.
2. **Running.** Steps run in order. Look up and Draft steps run on their own (in modes 2 and 3). The plan pauses at the first step that needs the user.
3. **Waiting.** The plan stays paused. The nav badge shows "1 waiting" and the chat's History row says "Waiting for you" (§12). After 24 h the step **expires** and "Ask again" re-plans with fresh data.
4. **Re-check.** When a waiting card comes into view and its preview is older than 10 minutes, it recomputes and says "Checked just now". Gates always run their own checks when opened. Execution is bound to what the user saw: the server receives a preview hash, and if the data changed (a lead was deleted, a teammate edited the draft) the step returns "Changed since you approved. **Review again**" instead of acting on different data.
5. **Stop plan.** A tertiary `sm` Button in the panel header while Running or Waiting. It never interrupts a write in flight: "Stopping after step 2…", then the remaining steps are Cancelled. Tier 0: no confirmation.
6. **Ends** as Done ("Done · 4 of 4"), Stopped ("Stopped at step 3") or Failed ("Failed at step 2 · **Retry step**"). The Assistant then posts a short closing turn that states only confirmed results: "Added 24 leads. Scheduled 10 calls for 11:00 am IST; 2 were skipped by the call checks."
7. **One active plan per chat.** A new request that needs a new plan cancels the waiting step of the old one ("Replaced by a new plan") and the reply says so.
8. **Leaving the page.** Running steps continue on the server; waiting steps wait. If the plan finishes while the user is elsewhere in the app, a success toast offers "Plan finished · 4 of 4 steps · **Open chat**".

### 9.4 Plan panel anatomy (≥ 1024; the same content in the Plan sheet below 1024)

| Part | Spec |
|---|---|
| Region | `<aside aria-labelledby="plan-title">`, `--surface`, left hairline `--border`, width per §5.2; its own scroll container with `overscroll-behavior: contain` |
| Header (sticky, `--size-header` 56) | `h2#plan-title` "Plan" (`title-16`) · plan StatusTag ("Waiting for you" warning, "Running" info, "Done" success, "Stopped" neutral, "Failed" danger) · meta "Step 3 of 4" (`meta-12`, tabular; hidden when the panel is 320 wide) · right: Stop plan |
| Tabs (`--size-view-tabs` 40) | PanelTabs "Plan" · "Changes {n}" |
| Step list | `<ol aria-label="Plan steps">`; each item a grid `var(--space-20) minmax(0,1fr)`, gap `--space-12`, padding-block `--space-12`; a 1 px `--border` connector joins the marks (Timeline style). Content: kind line `label-12` `--text-3` ("3 · Call"), title `data-13` weight 500 `--text` ("Call 12 leads with EMI reminder v4"), result line, and a "Details" disclosure listing the inputs used ("Status is Callback due · Due today · Not called in the last 24 h") |
| Waiting step | Expands to hold the ApprovalCard (§10.3) under its title; the step gets `aria-current="step"` |
| Footer (sticky) | `meta-12` `--text-3`: the autonomy sentence + link "Assistant permissions" (Settings › Workspace › Assistant) |
| Empty (no plan yet) | EmptyState `compact`, mode-aware (§13.1) |
| Hidden | The header's plan toggle hides the panel (remembered per user); a waiting ApprovalCard then renders inline in the thread (§5.2 rule) |

### 9.5 Changes tab

A Timeline (data-nav §10) of every change the Assistant made in this chat, newest first, grouped by day.

| Item | Actions |
|---|---|
| "Added 24 leads" | View (Leads, filtered to those 24) · **Undo** while the backend keeps the soft-delete window (tooltip: "Undo available until tomorrow 10:44 am"); after undo the item reads "Undone 10:52 am" |
| "Created draft flow **Sales qualifier**" | Open in Flows · Undo (deletes the draft only while nobody has edited it; otherwise "Delete draft…" in Flows) |
| "Applied 3 changes to the **EMI reminder** draft" | Open diff · Undo (restores the previous draft revision) |
| "Scheduled 10 calls for today 11:00 am" | Open in Cockpit. No Undo: calls are paused or cancelled in Cockpit (Cancel a batch is tier 2 there) |
| "Published **Sales qualifier** v1" | Open in Flows · "Roll back…" opens the version menu. Never "Undo publish" (direction §7 item 14) |

Every change also lands in Settings › Activity & Audit with the actor "{user} via Assistant", so the audit ledger is complete (F-UX-042).

---

## 10. Confirming consequential actions

### 10.1 Risk tiers for Assistant steps

The overlay spec's guard ladder (overlay §3.1) applies unchanged. The Assistant adds no weaker path.

| Tier | Assistant steps | Guard | Can an autonomy mode lower it? |
|---|---|---|---|
| 0 · None | Look up; Open | none | n/a |
| 0 · None (Undo = delete draft) | Draft a new flow, script or view | none; listed in Changes | n/a |
| 1 · Undo | Change up to 50 records, reversible | ApprovalCard; in mode 3 runs on its own with an Undo toast | Only to "on its own with Undo" |
| 2 · Confirm | Change more than 50 records; Edit draft (diff); Delete up to 50 records; Cancel a scheduled batch | ApprovalCard | No |
| 3 · Typed | Delete more than 50 records | ApprovalCard with typed count ("Type 64 to confirm") | No |
| 4 · Gate | Call; Publish | Call gate · Publish gate | **Never**, for any role, including admins (direction P3) |

### 10.2 Autonomy modes

Set by an admin in **Settings › Workspace › Assistant** ("Assistant permissions") as a RadioCard group (core §6.2). Each user may choose an equal or stricter mode for themselves. The same words as Personal agents are used per capability (Auto, Confirm), so the two features read as one system (00-summary §4).

| Capability | 1. Suggest only | 2. Ask before changes (default) | 3. Undoable changes on its own |
|---|---|---|---|
| Look up | Auto | Auto | Auto |
| Draft something new | Preview in chat, "Create draft in Flows" button for you | Auto | Auto |
| Change ≤ 50 records (reversible) | "Open" link: you do it | Confirm | Auto, with an Undo toast |
| Change > 50 · Edit draft · Delete ≤ 50 | "Open" link | Confirm | Confirm |
| Delete > 50 | "Open" link | Confirm + typed | Confirm + typed |
| Call | "Open" link to Leads with the selection | Call gate | Call gate |
| Publish | "Open" link to the draft in Flows | Publish gate | Publish gate |

"Confirm + 2FA" is not used in v1. It is reserved for any future capability that moves money, matching Personal agents' default for financial actions.

**Mode sentences** (page header meta on a new chat, plan panel footer, Settings): mode 1 "Suggests steps. You make every change." · mode 2 "Asks before changing anything." · mode 3 "Makes undoable changes, asks for the rest."

**Settings content under the modes** (a KeyValueList titled "Always, in every mode"): Calls go through the Call gate · Publishing goes through the Publish gate · Deleting always asks · It acts with your role's permissions · It can't top up, change billing or change settings. Mode changes are recorded in Activity & Audit.

### 10.3 ApprovalCard (tiers 1 to 3)

An inline card built from the gate's parts (direction P3; `spec/02-components-gate.md` §5.7: `GateChecklist`, the `GateCost` impact or cost line, the header grammar, one confirming action, `⌘/Ctrl+Enter`, an idempotency key per decision), rendered inside the waiting step or inline in the thread (§5.2). It is not a modal: the user can read the thread, scroll the plan and even type while it waits.

| Part | Spec |
|---|---|
| Container | `--surface`, 1 px `--border-strong`, `--radius-8`, `--e1` (dark: border only), padding `--space-panel-pad` 16; `role="group"` `aria-labelledby` its title; Standard density |
| Header | Title `title-14`, verb + object + count: "Add 24 leads", "Mark 12 leads Contacted", "Apply 3 changes to the EMI reminder draft", "Delete 64 leads". Meta `meta-12` `--text-3`: "Checked just now" / "Checked 12 min ago · **Recheck**" |
| What changes | One of: a read-only table (first 5 rows + "and 19 more · **View all 24**", which opens the full list in the Plan sheet or a `lg` Dialog); a KeyValueList of field changes ("Status · Callback due → Contacted"); a diff summary ("3 steps added · 1 changed · **Open diff**", opening the flow in Flows on its diff view) |
| Checks (optional) | Gate check rows (`blocking`, `adjusted` or `advisory`, G §2.1), e.g. "3 phone numbers are already in Leads · skipped · **Include**" (`adjusted`: it changes the count) or "No phone column found" (blocking) |
| Impact line | `data-13`: "Affects 24 leads · Undo available for 24 h" or "Deleted leads can't be restored after 7 days" (wording from the backend's real window); then `meta-12` `--text-3` "Runs as you · Operator" |
| Typed confirm (tier 3) | Field "Type **64** to confirm" inside the card, per ConfirmDialog typed rules (overlay §3.2: paste allowed, trimmed match) |
| Blocked reason | An inline warning Notice above the footer with the fix; the primary becomes `aria-disabled` with that reason (core §1.6) |
| Footer | Right-aligned: **Skip step** (tertiary) · **Edit…** (secondary) · the primary, which repeats the verb and count ("Add 24 leads", "Apply to draft"); deletes use the `destructive` outline variant ("Delete 64 leads"). At 320–400 px wide the primary takes its own full-width row. When the card is taller than its scroll area (the 320 px panel at 1024×768), the footer is sticky at the bottom of that area |
| Keyboard | ⌘/Ctrl+Enter anywhere inside the card activates the primary (the gate convention); Esc does nothing (the card is not an overlay) |
| Busy | Primary shows "Adding…" (Button loading), card inputs lock, `aria-busy="true"` |
| Done | The card collapses into the step's result line; focus moves to that line (`tabindex="-1"`), which is announced |
| Plan changed | Info Notice at the top of the card: "The plan changed. Review again." The primary stays disabled until the new preview loads |

**Edit…** opens an inline form in the card (Standard density): the step's parameters as real fields (a Select for the status, a FlowSwitcher, a date and time for callbacks, checkboxes to exclude recipients). "Save changes" recomputes the preview; "Cancel" restores it. A link "Ask for a different plan" inserts "Change step 3: " into the composer instead.

**Skip step** marks it Skipped. Later steps that depend on it are skipped with the reason "Needs step 3".

### 10.4 Call steps: always through the Call gate

The Call step's card uses the same anatomy with call facts, and its primary opens the product's **Call gate**. The Assistant never starts calls itself (F-UX-013, F-A11Y-004).

| Part | Content |
|---|---|
| Title | "Call 12 leads" (or "Call yourself to test EMI reminder v5 (draft)") |
| Facts (KeyValueList) | Flow: "EMI reminder v4" + StatusTag "Live v4" (static dot); a draft can be used only for a test call to your own verified number ("Draft · test calls only", core §5.4) · Voice: VoiceTile 28 + "Vaani · Hindi + English" · When: "Now · calling hours until 7 pm IST" or "Tomorrow 10:00 am IST" · Caller ID: `mono-13` "+91 80 •••• 2210" |
| Recipients | First 3 rows: "Lead 1042 · Pune" · `PhoneText` "+91 ••••• 4821" · "Due 11:00 am"; then "and 9 more · **View all 12**" |
| Cost line (gate cost row) | "12 calls · about 1 to 2 min each · **₹29 to ₹58**" · right: "Wallet ₹2,340.50 · about 16 h". Until median durations exist: "Rate ₹0.04/s" (direction §8 interim) |
| Note | `meta-12` `--text-3`: "Calling hours, DND and recent calls are checked again before anything dials." |
| Footer | Skip step · Edit… (flow, voice, time, recipients) · primary **Review and call…** (`phone-outgoing`) |

- **Review and call…** opens the Call gate (G §5.1) pre-filled with this batch and the step's idempotency key; its container follows G §1.3 (anchored popover 400 when it fits, bottom sheet on phones). The gate runs its blocking and advisory checks and shows its own count ("Start 10 calls" after skips). Only the gate's Start, or ⌘/Ctrl+Enter inside the gate, places calls.
- **Cancel in the gate** leaves the step Waiting and returns focus to Review and call….
- **After Start:** the step is Done: "Scheduled · 10 calls · 2 skipped by the checks · **Open in Cockpit**". The batch sits in Cockpit › Up next as Scheduled, with Pause and Cancel. Each step carries an idempotency key, so a retry or a double click can never create two batches.
- **Blocked** (inline reason; primary `aria-disabled`):
  - Wallet: "Wallet is ₹0. **Top up** to place calls." (→ `/billing?topup=1`; rung 4 of the wallet ladder, overlay §10.2).
  - Setup: "No verified caller ID yet. **Finish setup (3 of 5)**" (→ `/home`).
  - No live version: "EMI reminder has no live version. Publish it first, or **call yourself to test**."
  - Role: "Your role can't place calls. Ask an admin."
- Outside calling hours is **not** a block on the card; it says "Outside calling hours now. The Call gate will offer to schedule." and the gate does the rest.

### 10.5 Publish steps: always through the Publish gate

| Part | Content |
|---|---|
| Title | "Publish Sales qualifier as v1" |
| Validation | StatusTag from the shared validator: "No issues" · "1 warning" · "2 errors" (computed, never permanent; F-FLOW-004) |
| Where it goes live | From the draft's triggers: "Outbound batches only · no inbound number" or "Answers +91 80 •••• 2210 · replaces v4" (F-FLOW-014) |
| Changes | "New flow · 6 steps" or "3 steps added · 1 changed · **Open diff**" |
| Footer | Skip step · **Open in Flows** (secondary) · primary **Review and publish…** |

- The primary opens the **Publish gate** sheet (640, modal) over the Assistant page with its checks, diff, "where it goes live", note and **Publish v1** (or "Publish with 1 warning"). With errors the card's primary is `aria-disabled`: "Fix 2 errors to publish · **Open in Flows**".
- **After publishing:** Done: "v1 is live on outbound batches · **Roll back…**" (version menu). There is no Undo for a publish.
- **Role:** if publishing is admin-only, the step is Blocked: "Only admins can publish flows. Ask an admin to publish the draft from Flows. **Copy link to the draft**".
- The word "activate" is retired. A request to "activate" a flow produces a Publish step.

### 10.6 Drafts

- A **new draft flow** is created as "Not published" in Flows with a unique name (a clash is resolved by asking: "A flow called Sales qualifier exists. Name this one…"). It passes through the shared validator, and the Card shows its issue count.
- **Edit draft** writes to the draft revision only, with `If-Match`. A 409 fails the step: "This draft changed while I was working. **Review the latest**, then ask again." The card repeats the live note: "Callers hear v4 until you publish." Live is never touched (F-FLOW-001).
- From a document: the Draft step reads the attachment; the reply summarises what it drafted and where the text came from ("6 steps from brochure.pdf, pages 1–3").

### 10.7 What the Assistant never does (tested in §21)

1. Dial, publish, delete or change records without the step's guard, in any mode, for any role.
2. Act on a suggestion click, a spoken phrase or a keyboard shortcut outside a card or gate.
3. Touch billing, autopay, settings, roles, API keys, webhooks or sign-in methods.
4. Report a result the server did not confirm ("Called 12 leads" when 10 were scheduled).
5. Replace Live, or replace a draft without a diff the user applied.

---

## 11. Voice input

### 11.1 Dictate (v1)

Speech becomes editable text in the composer. It is an input method, not a conversation, and it never sends (A4, A6). It replaces today's header "Voice" button, which connected a live session on click with no explainer (F-UX-022, EXPLORE-CORE-16).

**First use.** Pressing Dictate the first time opens a Popover (overlay §5, width `--size-inspector` 320) anchored to the button, before the browser asks for anything:
- Title `title-14`: "Dictate your request"
- Body `body-14` `--text-2`: "Speak in English, Hindi or Hinglish. Your words appear in the message box so you can check them. Nothing is sent until you press Send."
- Privacy line `meta-12` `--text-3`, shown only if the backend guarantees it: "Audio is used only to write the text. It isn't kept." (open question 4)
- Select "Write Hindi as": Auto · Devanagari (हिंदी) · Latin (Hinglish). Remembered per user.
- Footer: **Not now** (tertiary) · **Allow microphone** (primary), which triggers the browser's permission prompt.

**States.**

| State | In the composer | Dictate button | Announced |
|---|---|---|---|
| Idle | Normal | `mic`, "Dictate", `aria-pressed="false"` | no |
| Asking | Hint row: "Allow the microphone in your browser's prompt." | busy | no |
| Listening | A dictation strip above the tool row: a 4-bar level meter (`--space-2` bars in `--accent-mark`, driven by a real `AnalyserNode`, static under reduced motion) · "Listening…" · `Timer` "00:07" (`meta-12` tabular) · LanguageMark of the detected language ("अA Hinglish"). Interim words appear at the caret in `--text-3` ending in "…" | `square`, "Stop dictation", `aria-pressed="true"`, tooltip "Stop dictation · Esc" | "Listening", once |
| Finishing | "Finishing…" with Spinner sm | busy | no |
| Done | Final text replaces the interim text at the caret, in `--text`; focus stays in the textarea | back to `mic` | "Dictation added. Review it, then press Send." |

**Rules.** Dictation stops on Stop, Esc, any keystroke in the textarea (the text so far is kept), 5 s of silence, 2 min of speech ("Stopped after 2 min. Press Dictate to go on."), or leaving the page. Interim text is never sent, copied or announced. Saying "send" does not send. Words are inserted at the caret, so dictation can add to typed text. While listening, Send is `aria-disabled` ("Stop dictation to send") on ≥ 768 and hidden on phones.

**Errors** (InlineError under the composer; `role="alert"` because the user started it):

| Cause | Copy | Action |
|---|---|---|
| Permission denied | "The microphone is blocked for this site. Allow it in your browser's site settings, then try again." | How to allow (help article) |
| No input device | "No microphone found. Connect one, then try again." | Try again |
| Microphone in use by a browser call | Dictate is `aria-disabled`: "Your microphone is in use by a call in Cockpit." | none |
| Transcription failed | "Couldn't turn your speech into text. Try again, or type instead." | Try again |
| Offline | Dictate is `aria-disabled`: "You're offline." | none |
| Unsupported browser or insecure context | Dictate is `aria-disabled`: "Dictation isn't available in this browser." | none |

### 11.2 Voice conversation (optional, labelled Beta)

A hands-free conversation with the Assistant, reachable only from the header `⋯` ("Voice conversation"). Recommendation: ship Dictate first and decide on this with usage data (open question 5).
- **Nothing connects on click.** The mic explainer opens first, with **Start voice conversation** as its primary.
- **While active** the composer region becomes a voice bar: state words from the call-state vocabulary ("Connecting…", "Listening", "Speaking", "Reconnecting…"), LineQuality with one row, "Your connection · Good · 120 ms" (data-nav §12.2), a Mute toggle (`aria-pressed`) and **End voice** (secondary). Turns appear in the thread as normal turns with a `Tag outline` "Voice".
- **Voice never approves.** Plans, ApprovalCards and gates still need an on-screen action; "yes, call them" gets the reply "Review the calls on screen before they start."
- The microphone-in-use rule of §11.1 applies both ways: a voice conversation blocks Talk in browser in Cockpit, and the reverse.

---

## 12. History

### 12.1 Model

Chats are stored on the server per user and are private to their author in v1 (sharing: open question 6). A chat keeps its turns, attachments, plans and changes. Its title is generated from the first request (at most 60 characters, sentence case) and can be renamed. This replaces `localStorage["vaani_assistant_chat"]` (F-UX-022).

### 12.2 Entry points

- Header **History** button: a Popover at ≥ 768; a full-screen Sheet below 768 (overlay §1.7).
- ⌘K: the "Assistant chats" group searches titles.
- The new-chat empty state lists up to 3 **Recent chats**.
- The nav badge and toasts deep-link to a chat at its waiting step (`?step=`).

### 12.3 History list

| Part | Spec |
|---|---|
| Container | Popover, width `--size-dialog-sm` 400, max height `min(560px, available − --space-16)`, `--e2`, `--border-overlay`; Standard density |
| Search | SearchInput "Search chats…" (hidden label "Search chats"), server-side over titles and message text, debounced 300 ms; result count announced ("4 chats match") |
| Groups | Day headings in `label-12` `--text-3`: Today · Yesterday · This week · then "21 Sep 2026" |
| Row | 44 px; title `data-13` weight 500, one line with ellipsis and a tooltip for the full title; meta `meta-12` `--text-3` "10:42 am · 2 changes"; a chat with a waiting step shows Tag `warning` "Waiting for you" instead of the meta. The current chat uses the selection treatment (`--accent-soft` + `aria-current="page"`). Hover and focus reveal `⋯` (Rename…, Delete chat…) |
| More | "Show older chats" (tertiary `sm`), 20 per page; focus moves to the first new row |
| Footer | **New chat** (secondary `sm`) · `meta-12` `--text-3` "Chats and their files are kept for 90 days." (the real retention, open question 7) |
| Keyboard | The list uses the Combobox engine (cmdk): typing searches, ↑/↓ move, Enter opens, Esc closes and returns focus to History |
| Empty | "Your chats appear here. Each one keeps its plan and what it changed." |
| No results | "No chats match 'EMI'." · Clear search |
| Loading | 6 skeleton rows after 200 ms |
| Error | InlineError "Couldn't load your chats. Retry" inside the popover |

### 12.4 Rename and delete

- **Rename…** A Dialog `sm` "Rename chat" with one TextInput "Chat name" (required, trimmed) and **Save**. The H1 and `<title>` update.
- **Delete chat…** Tier 1 when the backend soft-deletes: the chat is removed at once with the toast "Deleted 'Plan calls for today's callbacks' · Undo". Otherwise tier 2: ConfirmDialog "Delete 'Plan calls for today's callbacks'?" · body "The chat and its attachments are removed. Changes it made to leads and flows stay, and its waiting step is cancelled." · Cancel · **Delete chat**. After deleting the open chat, the page goes to a new chat and focus moves to the composer.
- Changes made by a deleted chat stay in Activity & Audit.

### 12.5 The waiting badge

While any of the user's chats has a step waiting for approval, the Assistant nav item shows the `count` badge "1 waiting" (accessible name "Assistant, 1 plan waiting for your approval"). Choosing the item opens the most recent waiting chat at its step. The badge is computed on the server and disappears the moment nothing waits; it is never shown as a red bubble (data-nav §1.5).

### 12.6 Moving chats saved in this browser

On the first load after release, if `localStorage["vaani_assistant_chat"]` holds messages, an `info` Notice (section scope) appears on the new-chat empty state and at the top of History: "**1 chat is saved only in this browser.** Save it to your account to see it on other devices." Actions: **Save to account** · Discard…. Saving uploads it as one chat, drops old error lines that were stored as messages (QA-A-16), then clears the key. Discard is tier 2 ("Discard the chat saved in this browser? It can't be recovered."). Nothing is uploaded without the click.

---

## 13. States and copy

### 13.1 First use and empty

**New chat, desktop and laptop.** The conversation column holds two blocks: **Recent chats** at the top, and the heading, body and suggestions anchored at the bottom, directly above the composer, so the eye goes from the suggestions to the composer. Phones hide Recent chats (History is one tap away in the header row) and keep the anchored block:

| Part | Spec and copy |
|---|---|
| Icon | `bot` at `--icon-lg` 20 in `--text-3` (the nav icon; no tile, no sparkles, no glow) |
| Heading | `h2` `title-16`: "What can I do for you?" (kept from today) |
| Body | `body-14` `--text-2`, max `--size-container-narrow` 400: "I can summarise calls, answer questions about your leads and analytics, draft call flows and prepare calls. I show you the plan first and ask before changing anything." (the second sentence follows the mode, §10.2) |
| Meta | `meta-12` `--text-3`: "Answers use only this workspace's data and link to their sources." |
| Recent chats | Top of the column: up to 3 History rows (`--control-h` tall, title + time or a "Waiting for you" tag) under a `label-12` heading "Recent chats", plus "All chats" (opens History). Hidden when there are none, and on phones |
| Suggestions | Starters and workspace suggestions (§7.6), the last element before the composer |
| Notice | The migration Notice (§12.6), when it applies |

**New workspace with no calls yet:** "Summarise my last 10 calls" and "Show this week's call analytics" are replaced by "Help me set up my first call" and "What can a call flow do?"; a data question gets "There are no calls in this workspace yet. **Place a test call…**" (to Cockpit). Suggestions never promise data that does not exist (P1).

**Plan panel, no plan yet** (EmptyState `compact` plus three quiet rows, each a 16 px icon in `--text-3` and `data-13` `--text-2`):

| Mode | Copy |
|---|---|
| 2 · Ask before changes | "The steps for each request appear here before they run." · `search` "Look-ups and new drafts run on their own" · `pause` "Changes to records and flows wait for your approval" · `shield-check` "Calls and publishing go through their checks" |
| 1 · Suggest only | "I suggest the steps. You make every change, from the page I link to." |
| 3 · Undoable changes | "Undoable changes run on their own and are listed under Changes. Everything else waits for your approval." |

**Changes tab, nothing yet:** "Nothing has changed in this chat."

### 13.2 Loading

| What | Treatment |
|---|---|
| Hard load or route change | The shell, page header (H1 from `lib/nav.ts`; the chat title from the History cache, else a skeleton bar) and the composer render at once. After 200 ms the thread shows its skeleton (three exchanges: a `--surface-2` block with two bars, then three `read-15` bars) and the plan panel shows three step rows (a 20 px circle and two bars). No full-screen loader (F-QA-007, F-UX-030). The feed has `aria-busy="true"` and one visually hidden "Loading chat…" |
| Composer while the chat loads | Typing works; Send is `aria-disabled`: "Loading this chat…" |
| Switching chats | The URL changes at once; the thread shows its skeleton after 200 ms |

### 13.3 Sending, streaming and stopping

| Phase | Your turn | Assistant turn | Composer |
|---|---|---|---|
| Sending | Appears at once; meta "Sending…" | none yet | Cleared (text kept locally until the server acknowledges) |
| Acknowledged | Meta shows the time | Speaker line + Spinner sm + the first status from the server: "Planning…", "Looking up callbacks…", "Reading brochure.pdf…" (generic fallback "Working on it…") | Send becomes **Stop** |
| Using tools | | Activity rows appear and complete (§7.2) | Stop |
| Writing | | Text appears as it arrives, in `--text`: no cursor, no per-word fade, no typing sound; the article has `aria-busy="true"` | Stop |
| Complete | | Sources, plan pointer, follow-ups and turn actions appear; the polite region reads "Assistant replied: {first sentence, up to 140 characters}" or "Assistant replied with a plan of 4 steps. Step 3 needs your approval." | Send returns |
| Slow (no new content for 15 s) | | StatusText under the turn: "Still working. This is taking longer than usual." with **Stop** | Stop |
| Stopped by you | | Footer `meta-12` `--text-3`: "Stopped. The partial answer is kept. **Answer again**". Steps that already ran stay listed with their results | Send |
| Timed out (90 s) | | InlineError: "The answer took too long and stopped. **Retry** · Details" | Send |

### 13.4 Errors

| Situation | Where | Copy | Actions | ARIA |
|---|---|---|---|---|
| Send failed: network | Your turn | "Not sent. Can't reach Vaani Labs. Check your connection." | Retry · Edit | `role="alert"` |
| Send failed: server | Your turn | "Not sent. Something went wrong on our side. Your message is safe." | Retry · Edit | alert |
| Reply failed mid-way | Under the partial reply | "The answer stopped before it finished." | Retry · Details (error id) | alert |
| Assistant unavailable | SectionError `degraded`, top of the thread | "The Assistant is unavailable right now. Your chats and plans are safe. Try again in a few minutes." | Retry | status |
| No matching data | A normal reply | "I couldn't find calls from last week. This workspace has calls from 12 Sep to 20 Sep 2026." + a follow-up "Summarise the last 10 calls" | | |
| Data it can't see | A normal reply | "I can't see invoices. Open **Billing › Invoices**." | link | |
| Action out of reach | A normal reply | "I can't change autopay. You can in **Billing › Autopay**." | link | |
| Step failed | The step | "Couldn't add 3 of 24 leads. Their numbers aren't valid mobile numbers. **Retry step** · **View the 3**" | | assertive, once |
| Draft conflict (409) | The step | "This draft changed while I was working. **Review the latest**, then ask again." | | |
| Data changed after approval | The step | "Changed since you approved. **Review again**" | | |
| Rate limited (429) | InlineError under the composer | "Too many requests in a short time. Try again in 30 s." (countdown updates silently) | | |
| Daily limit, if one exists | Notice above the composer | "You've reached today's Assistant limit. It resets at 12:00 am IST." | | status |
| Chat not found | NotFound, inside the shell | "This chat doesn't exist. It may have been deleted." | New chat · History | |
| Someone else's chat | Forbidden | "This chat is private to the person who started it." | Go to Assistant | |
| Assistant turned off for the workspace (if that setting exists) | Forbidden | "The Assistant is turned off for this workspace. Ask an admin (2 in this workspace)." | Copy request link | |
| Session expired | SessionExpired dialog | "Your session expired. Sign in again to keep working. Your unsent message stays on this device." | Sign in | |
| Offline | ConnectionBar + controls | "You're offline." Send, Dictate and every card primary are `aria-disabled` with that reason; the composer keeps the text | | status |

Raw server, SDK or model text appears only under Details (overlay §11.2), never in a reply (F-UX-019, F-UX-016). Failures are never stored as Assistant replies.

### 13.5 Permission and blocked

- **Role limits** show on the step, not as an error page: "Your role can't place calls. Ask an admin." · "Only admins can publish flows. Ask an admin to publish the draft from Flows. **Copy link to the draft**".
- **Suggest only mode:** side-effect steps become Open steps with a deep link that pre-selects the objects ("Open Leads with these 12 leads selected"), where the user can press `C` for the Call gate.
- **Setup incomplete:** questions work; Call steps are Blocked with "**Finish setup (3 of 5)**".
- **Wallet ₹0:** Call steps are Blocked with "Wallet is ₹0. **Top up** to place calls." No WalletNotice appears on this page (overlay §10.2: not a spending page).

### 13.6 Success

- An answer needs no success chrome; its sources are the proof.
- A step reports its confirmed result in its StatusText ("Done · 24 added · View in Leads · Undo") and is announced politely.
- A finished plan gets a closing turn with confirmed counts; a toast appears only when the user is on another page.
- In mode 3, an Undo toast follows each change the Assistant made on its own: "Added 24 leads · Undo" (persistent until dismissed, overlay §9.2).
- Never green banners, confetti, exclamation marks or "Success!".

---

## 14. Interactions and keyboard

### 14.1 Keys

There are **no single-key shortcuts** on this page: focus is in the composer most of the time, and single keys would fight typing (F-A11Y-004).

| Key | Where | Does |
|---|---|---|
| Enter | Composer, fine pointer, no IME composition active | Send |
| Shift+Enter | Composer | New line |
| ⌘/Ctrl+Enter | Composer, any pointer | Send |
| ⌘/Ctrl+Enter | Focus inside an ApprovalCard | Its primary. For Call and Publish steps that opens the gate, which needs its own ⌘/Ctrl+Enter to start or publish |
| Esc | Composer while a reply streams | Stop answering |
| Esc | While dictating | Stop dictation and keep the text |
| Esc | History, Dictate explainer, Plan sheet, gates | Close; focus returns to the control that opened it |
| F6 | Page | Cycle focus: conversation → plan panel → composer (extends the overlay F6 rule) |
| Page Down / Page Up | Focus on a turn | Next / previous turn (ARIA feed pattern) |
| End / Home | Focus in the conversation | Newest turn (re-pins follow mode) / first turn |
| ↑ / ↓, Enter | History list | Move, open |
| ⌘/Ctrl+K | Anywhere | Palette: "New Assistant chat", "Search Assistant chats", "Ask the Assistant: {query}" (inserts, never sends) |
| ⌘/Ctrl+Z | Outside text fields | The newest Undo toast (overlay §9.4), for changes made on their own in mode 3 |
| ? | Outside text fields | Shortcut sheet, which gains an "Assistant" section with the rows above |

### 14.2 Focus management

| Moment | Focus goes to |
|---|---|
| Route entry, new chat, fine pointer | The composer (exception to the shell rule "focus the H1", because typing is the page's only task); the route is still announced ("Assistant") through the polite region and `<title>` |
| Route entry, new chat, touch | Nowhere new (no keyboard pops up); the H1 per the shell rule |
| Opening a saved chat | The H1 (the chat title) |
| After Send | Stays in the composer |
| A step starts waiting | Not moved; announced; the thread's plan pointer offers **Review** |
| After approving a card | The step's result line (`tabindex="-1"`) |
| Gate closed with Cancel | Back to Review and call… / Review and publish… |
| Gate completed | The step's result line |
| Current chat deleted | The composer of the new chat |
| Plan sheet closed (tablet, phone) | The PlanBar's Open button |

### 14.3 Pointer and touch

- Turn actions appear on hover and `:focus-within` on fine pointers and are always visible on touch; a long press on a turn opens the same actions as an action sheet.
- Files can be dragged onto the conversation region; the Attach button is the equivalent path.
- The PlanBar is one 44 px button; the Plan sheet closes with its Close button, Esc, the scrim (tablet) or Back (phone).

### 14.4 Purposeful micro-interactions (motion tokens only)

| Moment | Motion | Why |
|---|---|---|
| Your turn appears | None; it is simply there | Instant feedback that the message left the box |
| Streaming text | None: text is appended as it arrives | Honest, calm (anti-pattern: typing effects) |
| Step mark changes | Crossfade of the mark over `--dur-fast` | Draws the eye to a state change without movement |
| ApprovalCard appears | Opacity over `--dur-base`; content height changes in one frame (no height animation) | Signals "your turn" without sliding the list around |
| Plan panel shown or hidden | None (docked regions change in one frame, overlay §4.7) | The thread must not animate its width |
| Plan sheet (tablet, phone) | Slide from its edge over `--dur-slow`, exit `--dur-fast` | Standard sheet motion |
| Jump to latest | Fade `--dur-base` | |
| Dictation meter | Moves only with real audio | The only live motion on the page; static under reduced motion |
| Spinners | Only while a request is in flight; static under reduced motion | Bound loops (overlay §12) |

---

## 15. Microcopy: before and after

| Where | Before | After |
|---|---|---|
| Header icon | Sparkles tile | None in the header; `bot` is the nav icon (no sparkles anywhere, direction §7) |
| Header subtitle | "Describe what you need — I plan, then act on your data." | Removed. Meta line: the mode sentence, e.g. "Asks before changing anything." |
| New chat button | "+ New chat" | "New chat" (`square-pen` icon; no typed "+") |
| Voice button | "Voice" (title "Talk to the assistant"), connects on click | Composer **Dictate**; "Voice conversation" (Beta) in `⋯`, explainer first |
| Empty body | "I can build & activate call flows, analyze a document into a flow, manage leads, place a call, search your knowledge base, and summarize your calls — all on your own data." | "I can summarise calls, answer questions about your leads and analytics, draft call flows and prepare calls. I show you the plan first and ask before changing anything." |
| Chip 1 | "Build a sales call flow and activate it" | "Draft a sales call flow" (inserts "Draft a sales call flow for ") |
| Chip 2 | "Summarize my last 10 calls" | "Summarise my last 10 calls" (en-IN spelling) |
| Chip 3 | "Show my call analytics summary" | "Show this week's call analytics" |
| Chip 4 | "Analyze this PDF → build a flow from it" | "Turn a document into a flow…" (no arrow glyph: fonts drop U+2192, foundations §2.1) |
| Composer label | none (placeholder only) | "Message the Assistant" (visually hidden label) |
| Placeholder | "Ask me to build a flow, summarize calls, add leads, place a call…" (clipped on phones) | "Plan today's calls…" (an example that fits one line in the 320 px phone composer) |
| Attach | title "Attach a file (pdf, txt, csv, xlsx, docx, json) — or drag it here" | Tooltip "Attach files · PDF, DOCX, TXT, CSV, XLSX or JSON · up to 10 MB" |
| Send | title "Send" | Visible "Send" (≥ 768), tooltip "Send · Enter"; "Stop" while answering |
| Panel title | "Plan & Actions" | "Plan", with tabs "Plan · Changes" |
| Panel empty | "The plan and each action appear here live as I work." | "The steps for each request appear here before they run." + the three rules (§13.1) |
| Send failure | "Could not reach the assistant. Check your connection and try again." (grey, no action) | "Not sent. Can't reach Vaani Labs. Check your connection." · Retry · Edit |
| Activate | "activate" | "Publish", through "Review and publish…" |
| Place a call | (implied direct) | "Review and call…" → the Call gate's "Start 10 calls" |
| Streaming | (none) | "Planning…", "Looking up callbacks…", "Working on it…" |
| Stopped | (none) | "Stopped. The partial answer is kept. Answer again" |
| Wallet banner | "Wallet empty — top up now to keep calls flowing." | Not on this page; on a blocked Call step: "Wallet is ₹0. Top up to place calls." |

Glossary on this page: **Assistant** (never "agent", "copilot" or "AI"), **plan**, **step**, **Look up · Draft · Edit draft · Change · Delete · Call · Publish · Open**, **Waiting for you**, **Changes**, **Dictate**. The phone agent's persona name "Vaani" is used only for the call voice (VoiceTile "Vaani · Hindi + English"), never for the Assistant, so the two are not confused (F-UX-017).

---

## 16. Accessibility

**Structure and landmarks.**
- A skip link targets `<main id="main">`. The shell renders one `nav` ("Main"), fixing axe `landmark-unique` on this route (F-A11Y-026).
- One `h1`: "Assistant" or the chat title. The conversation is a `section` with a visually hidden `h2` "Conversation"; the plan is an `aside` with a visible `h2` "Plan"; the composer is a `form` named "Message the Assistant".
- The thread is `role="feed"` (`aria-busy` while loading or streaming). Each turn is an `article` with `aria-labelledby` pointing at its speaker line ("You, 10:42 am" / "Assistant, 10:42 am") and `aria-posinset` / `aria-setsize`. Page Down and Page Up move between turns.
- Answer tables are real `<table>`s with a caption; the ApprovalCard is a labelled `group`; plan steps are an `<ol>` with `aria-current="step"` on the waiting step.

**Names and states.**
- Every IconButton has an `aria-label` equal to its Tooltip (never `title` only, F-A11Y-024, F-A11Y-017). Toggles use `aria-pressed`: Dictate, the plan toggle, Mute.
- Disabled controls use `aria-disabled` with a visible or tooltip reason (core §1.6): Send, Dictate, card primaries, Retry on a reply whose steps ran.
- Suggestions are `type="button"` in a labelled group (F-A11Y-016).

**Announcements** (one polite region, `announce()`; assertive only for failures the user must act on):

| Announced | Politeness |
|---|---|
| "Assistant replied: {first sentence}" or "…with a plan of 4 steps. Step 3 needs your approval." (once, on completion) | polite |
| "Step 3 needs your approval" · "Step 2 done" (grouped, debounced 500 ms) | polite |
| "Added to your message. Edit it, then press Send." (suggestion inserted) | polite |
| "Listening" · "Dictation added. Review it, then press Send." | polite |
| Send failed · step failed · reply failed | assertive (`role="alert"`) |
| Result counts in History search ("4 chats match") | polite, throttled 2 s |
| **Never:** streamed text, activity rows while running, timers, interim dictation, cost or wallet values | none |

**Reading and language.** `lang` on every turn from server detection; Devanagari turns use `read-15-deva`; `translate="no"` on names of leads, flows and brands. Text measure capped at 68ch.

**Contrast and focus.** Tokens only: `--text-3` is ≥ 4.70:1 on every plane (replaces `#7A8397`, F-A11Y-008); no text on Neel except `--on-accent` (F-A11Y-009); warning tag text ≥ 6.18:1 on its tint. Focus is the global 2 px outline with offset; rows in scroll containers (History, plan steps) use the inset offset so they are never clipped.

**Targets and reflow.** At least 24×24 on fine pointers and 44×44 on touch, including suggestions, turn actions and attachment Remove (F-A11Y-023). At 200 % zoom (720×450 CSS px) the phone layout applies and every destination is reachable through More; nothing scrolls sideways at 320 px; the composer's height is capped at 40 % of the viewport so it never covers the thread on short screens.

**Motion.** Only request-bound spinners and the real dictation meter move; both are static under `prefers-reduced-motion`, and smooth scrolling becomes instant.

**Forced colours.** Step marks and the meter carry `data-mark`; the current History row and the waiting step carry `aria-current`; the ApprovalCard keeps a visible border (`CanvasText`); focus uses `Highlight`.

**Time.** Approvals expire after 24 h and "Ask again" recovers with fresh data. Error and Undo toasts stay until dismissed (overlay §9.2).

---

## 17. Responsive behaviour (summary)

| Aspect | Desktop ≥ 1440 | Laptop-L 1280–1439 | Laptop-S 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|---|
| Plan | Docked 440, collapsible | Docked 440 | Docked 320 | PlanBar → modal Sheet `min(560, 100%)` | PlanBar → full-screen Sheet |
| ApprovalCard | In the panel | In the panel | In the panel; footer stacks (primary full width) | Inline, end of thread | Inline; primary full width, 44 px |
| Call gate | Anchored popover (400) | same | same | Popover if it fits, else bottom sheet | Bottom sheet, Start sticky above the safe area |
| Publish gate | Modal sheet 640 | same | same | Modal, full height | Full screen |
| Answer tables | ≤ 5 columns | ≤ 5 | ≤ 4 | ≤ 3 | ListRow two-line items |
| Header actions | History · New chat · `⋯` · plan toggle | same | same | Icon buttons History and New chat + `⋯` in the header row (§19 change request) | same; the header row scrolls away |
| Suggestions | Wrapping row | same | same | Wrapping row | Full-width stack, 44 px |
| Composer | Max 720, hint line | same | same; hint hidden at heights ≤ 720 | Max 720 | One 44 px row (Attach · text · Dictate), icon Send only once there is text; sits on the keyboard |
| History | Popover 400 | same | same | Popover | Full-screen Sheet |
| Baseline / wallet | Baseline | Baseline | Baseline (folds into a header chip at heights ≤ 720) | TopBar wallet chip | TopBar wallet chip |

---

## 18. Telemetry (optional hooks)

**Privacy first (F-UX-045).** Session replay is off on `/assistant` (the thread holds lead data); the thread, composer and History carry `ph-no-capture` as a second guard. Events carry **no message text, no attachment names and no lead data**: only ids, counts, kinds, durations and error classes. Analytics cookies follow the consent rules of the public site.

| Event | Properties |
|---|---|
| `assistant_message_sent` | chat id, source (`typed` · `suggestion` · `dictation`), edited after insert (bool), has attachment, length bucket |
| `assistant_suggestion_inserted` | suggestion id, set (`starter` · `workspace` · `follow_up`) |
| `assistant_reply_completed` | ms to first status, ms to first text, total ms, tool count, has plan |
| `assistant_reply_stopped` / `_failed` | elapsed ms / error class |
| `assistant_plan_created` | step count, kinds |
| `assistant_step_shown_for_approval` | kind, tier, records affected bucket |
| `assistant_step_decided` | kind, decision (`approved` · `skipped` · `edited` · `expired`), ms to decide |
| `assistant_gate_opened` / `_outcome` | gate (`call` · `publish`); outcome (`started` · `published` · `cancelled` · `blocked`), blocking check id |
| `assistant_change_undone` | kind, minutes since change |
| `assistant_dictation` | outcome (`added` · `cancelled` · `error`), language, duration bucket, error class |
| `assistant_history_opened` / `_chat_reopened` | source (`header` · `palette` · `empty_state` · `badge`) |
| `assistant_feedback` | `helpful` · `not_helpful`, reason code |

**Health signals to watch:** suggestion-to-send rate and how often suggestions are edited (proves insert-only works); approval time; gate abandonment by blocking check (setup or wallet problems, not confusion); Undo rate on Assistant changes (a proxy for wrong actions); stop and failure rates; dictation error classes (permission problems vs recognition).

---

## 19. New components needed

Built from existing tokens and primitives; none adds a colour, a size outside the scales, or a new motion.

| Component | What it is | Built on | Key props / contract |
|---|---|---|---|
| **AssistantThread** | The conversation feed | `role="feed"` list; follow-mode logic shared with TranscriptFeed (data-nav §12.4) | `turns`, `status: 'loading' \| 'ready' \| 'error'`, `onLoadOlder`; pins and unpins like TranscriptFeed; renders Jump to latest |
| **AssistantTurn** | One turn (§7.1) | `article`; StatusText, InlineError, IconButton, Tag | `role: 'user' \| 'assistant'`; `state: 'sending' \| 'sent' \| 'failed' \| 'streaming' \| 'complete' \| 'stopped' \| 'error'`; `lang`; `activity[]`; `blocks[]` (text, table, stats, keyValues, card, quote, passage, code); `sources[]`; `plan?`; `onRetry`, `onEdit`, `onCopy` |
| **ActivityRow** | "Looked up 18 callbacks · Leads · 0.8 s" | TurnRow system row + a `running` state (Spinner sm + "…") | `state: 'running' \| 'done' \| 'failed'`, `icon`, `text`, `href`, `ms` |
| **Composer** | Named in core §3.6; fully specified in §8 | Field + Textarea (composer mode) + Dropzone rows + IconButton + Button | `onSend(text, attachments)`, `onStop`, `streaming`, `disabledReason`, `draftKey` (local draft), IME-safe Enter, `maxRows` 5 |
| **SuggestionList** | Insert-only suggestions (§7.6) | Button `secondary md` in a `role="group"` | `items: { id, label, icon, insert: string, caretAt?: number, action?: 'attach' }[]`, `onInsert`; **no `onSend` prop exists**, by design |
| **PlanPanel** · **PlanStep** · **PlanBar** | Plan region, step item, and the tablet and phone summary bar (§9.4, §5.5) | Sheet (`detail`) below 1024, PanelTabs, StageProgress marks, StatusText, Collapsible | `plan: { id, state, steps[] }`; `step: { id, index, kind, title, status, result?, details?, approval? }`; PlanBar: `summary`, `onOpen` |
| **Step marks** (addition to StageProgress, overlay §14.3) | `waiting`, `blocked`, `skipped` / `cancelled`, `expired` | 20 px marks on `--warning-soft` / `--surface-3` with 12 px glyphs (`pause`, `lock`, `minus`, `timer-off`) | Every mark has a word next to it; `data-mark` for forced colours |
| **ApprovalCard** | The inline Gate variant for tiers 1–3, and the launcher for Call and Publish steps (§10.3–§10.5) | The gate's parts (G §5.7: GateChecklist, GateCost, header grammar), KeyValueList, DataTable, Notice, Button, typed-confirm Field | `variant: 'change' \| 'delete' \| 'edit-draft' \| 'call' \| 'publish'`; `preview`; `checks[]`; `impact`; `typedConfirm?`; `blockedReason?`; `checkedAt`; `onApprove(previewHash, idempotencyKey)`; `onOpenGate()`; `onSkip`; `onEdit` |
| **ChatHistory** · **ChatRow** | History list (§12.3) | Popover (≥ 768) / Sheet (< 768) + the cmdk list engine | `query`, `groups`, `current`, `onOpen`, `onRename`, `onDelete`, `hasOlder` |
| **DictationControl** | Dictate button, first-use explainer, listening strip, language select (§11.1) | IconButton toggle, Popover, Select, the VoicePicker meter (real `AnalyserNode`) | `state: 'idle' \| 'asking' \| 'listening' \| 'finishing' \| 'error'`; `onText(final)`; `language`; `disabledReason` |
| **ThreadSkeleton** · **PlanSkeleton** | Loading layouts (§13.2) | Skeleton.Line / Skeleton.Block | Static, after 200 ms, at least 400 ms once shown |
| **VoiceBar** (Beta, optional) | Voice conversation controls (§11.2) | Call-state words, LineQuality, IconButton, Button | `state`, `muted`, `onEnd` |
| **ReferencePicker** (v1.1) | `@` references in the composer (§8.5) | Combobox (core §5.3) anchored at the caret | `sources: ('flows' \| 'leadViews' \| 'knowledge' \| 'people')[]` |
| **AssistantPermissions** (Settings section) | The three modes and the "Always" list (§10.2) | RadioCard group, KeyValueList | `workspaceMode`, `personalMode`, `canEdit` |

**Changes requested to existing specs**

| Spec | Change | Why |
|---|---|---|
| core §2.2 IconButton | Allow `variant="primary"` for exactly one use: the phone composer Send (44 px, `--accent` fill, `--on-accent` icon, `aria-label="Send"`) | The page's one committing action must stay Neel when there is no room for a label |
| core §3.6 Composer | Placeholder "Ask Vaani…" → an example ("Plan today's calls…"); add the IME rule (no send while `isComposing`) | Placeholders are examples (direction §4.2 rule 9); "Vaani" names the call voice, not the Assistant; Indic keyboards confirm words with Enter |
| data-nav §2.7 PageHeader | `iconOnlyBelow="lg"` for up to two actions, rendered as 44 px named IconButtons instead of folding into `⋯` | History and New chat are this page's navigation; hiding them in `⋯` on tablets and phones would bury them |
| data-nav §1.5 Nav badges | Add Assistant `count` badge "1 waiting" | Waiting approvals must be findable from anywhere |
| data-nav §1.9 Shell focus | Exception: a new Assistant chat focuses the composer on fine pointers | Typing is the only task on that screen |
| overlay §8 CommandPalette | Group "Assistant chats"; action "Ask the Assistant: {query}" that inserts, never sends | Palette actions never act by themselves (overlay §8.3) |
| overlay §14.3 StageProgress | The four extra marks above | Plans need waiting, blocked, skipped and expired |
| Gate (`spec/02-components-gate.md`) | **Adopted** (G14): `useGate().open(variant, payload, { idempotencyKey, returnFocusTo })` opens any gate from any page with a pre-filled payload and returns the confirmed result (batch id and counts, or the published version), G §7 | The Assistant launches gates and reports their confirmed result |
| base.css (foundations §5) | `scrollbar-gutter: stable` on `html` should apply only to documents that scroll; app-shell routes whose shell is `100dvh` (the document never scrolls) set `auto` | Rendering the mock showed a permanent 15 px empty strip on the right of every shell screen with Windows scrollbars |
| Tokens | Declined in the register (01-foundations §18): use `--size-sheet-record` (440) / `--size-inspector` (320) for the plan and `--size-container-form` (720) for the column | One name per value |

---

## 20. Backend dependencies and interim behaviour

As the direction requires (§8), each UI state below is **hidden, not simulated**, until its backend ships.

| # | Needed | Until it ships |
|---|---|---|
| 1 | **Plan protocol:** the server returns a plan (steps with kind, tier and preview) before executing anything, pauses on steps that need approval, and executes a step only with an approval token, a preview hash and an idempotency key | The Assistant runs Look up and Draft steps only; any request that would change records, call or publish gets an **Open** step with a deep link (effectively mode 1). This must ship before any side effect is re-enabled (open question 1) |
| 2 | Server-side chats: create, list, search, rename, soft delete, retention | History lists the chats in this browser, with the Notice "Chats are saved in this browser only." |
| 3 | Streaming events: status phase, tool call start and end, text delta, completion, `lang` per turn | Non-streamed replies with "Working on it…" and the same completion announcement |
| 4 | Autonomy settings API (workspace mode, personal preference, audit) | Fixed at mode 2; the footer link is hidden |
| 5 | Gates openable from other pages (G §7 `useGate`) and draft/live flow revisions (direction §8 item 1) | Call and Publish steps are Open steps: "Open Leads with these 12 leads selected" · "Open the draft in Flows" |
| 6 | Soft-delete windows and "via Assistant" audit events | Changes are tier 2 (ApprovalCard only) with no Undo offered |
| 7 | The shared metrics aggregates (`lib/metrics.ts`) | Analytics questions get a link to Analytics with the range, not numbers |
| 8 | Speech to text for English, Hindi and Hinglish, with a no-retention option | Dictate is hidden |
| 9 | Waiting-step count per user | No nav badge |
| 10 | Server validation shared with the Flow Designer (direction §8 item 2) | Publish steps show "Open in Flows" only |

---

## 21. Acceptance criteria

**Safety and consent**
- [ ] Clicking or pressing Enter on any suggestion inserts its text into the composer and sends no request (network log: no chat POST).
- [ ] With text already in the composer, a suggestion is added on a new line and the typed text is unchanged.
- [ ] A contract test proves the step-execution endpoint rejects any Change, Delete, Edit draft, Call or Publish step without an approval token, except tier-1 changes of 50 records or fewer in mode 3.
- [ ] In every mode and every role, a Call step's primary opens the Call gate; no Assistant path dials without the gate's Start.
- [ ] A Publish step opens the Publish gate; with validation errors the card's primary is `aria-disabled` with "Fix N errors to publish".
- [ ] Editing an existing flow never changes its Live revision; changes reach the draft only through Apply to draft.
- [ ] Double-clicking an approval or retrying a step never creates two batches or two imports (idempotency).
- [ ] Approving a preview whose data has changed returns "Changed since you approved" and changes nothing.
- [ ] A waiting step expires after 24 h and offers Ask again.
- [ ] Deleting more than 50 records requires typing the count.
- [ ] Dictation and voice never send or approve; saying "send" or "yes, call them" changes nothing.

**Honesty (P1)**
- [ ] Every number in an analytics answer sits in a StatTile with its scope line and equals Analytics for the same range and filters.
- [ ] Every answer that used workspace data has a Sources line whose links open the exact filtered views.
- [ ] Step results show server-confirmed counts ("Scheduled · 10 calls · 2 skipped by the checks").
- [ ] An e2e check runs the banned-terms list of F-UX-016 (vendor, model and internal names) against Assistant replies and finds none.

**The user's words**
- [ ] With the network blocked, Send leaves the turn as "Not sent" with Retry and Edit, announced once assertively; nothing is saved as an Assistant reply (QA-A-16).
- [ ] Unsent composer text survives a reload and a SessionExpired sign-in.
- [ ] Enter during an IME composition (Hindi keyboard) does not send.
- [ ] Stop ends streaming within 1 s and keeps the partial answer.

**History**
- [ ] The same chat opens on a second browser for the same user; `/assistant/c/{id}` opens it; `?step=` scrolls to and focuses that step.
- [ ] Browser-only chats are uploaded only after "Save to account".
- [ ] Deleting a chat offers Undo (or a ConfirmDialog) and its changes remain in Activity & Audit.

**Layout**
- [ ] At 1440×900 the conversation column is at most 720 px and the plan panel 440 px; at 1920 the composer is at most 720 px wide (F-VIS-034).
- [ ] At 390×844 the thread has at least 560 px of height and there is no wallet banner; at 360×780 at least 500 px (F-RWD-015).
- [ ] At 320 px nothing scrolls sideways and no suggestion, placeholder or button label is clipped.
- [ ] A waiting ApprovalCard renders in exactly one place at every breakpoint and when the panel is hidden.
- [ ] From 768 to 1023 px every header action is visible or in `⋯`; nothing is clipped (F-RWD-003 pattern).

**Accessibility**
- [ ] axe reports no violations in light and dark, including `landmark-unique`, `label` and `button-name`.
- [ ] The composer's accessible name is "Message the Assistant"; Attach, Dictate, Send and Stop are named; Dictate exposes `aria-pressed`.
- [ ] A screen reader hears exactly one announcement per completed reply and none for streamed text or timers.
- [ ] Every action is reachable by keyboard; F6 cycles conversation, plan and composer; Page Down and Page Up move between turns.
- [ ] Focus never lands on `<body>` after a gate, dialog, sheet, popover or delete.
- [ ] Targets are at least 44×44 on touch and 24×24 on fine pointers.
- [ ] `check-contrast.mjs` passes; no text sits on Neel except `--on-accent`.
- [ ] Under reduced motion the spinners and the dictation meter are static and scrolling is instant.
- [ ] `getComputedStyle(body).fontFamily` starts with Hanken Grotesk (F-VIS-008).

**Telemetry**
- [ ] Session replay does not load on `/assistant`; no event payload contains message text, file names or lead data.

---

## 22. Open questions for the product owner

1. **Server behaviour today.** Does `/api/assistant/chat` already execute side effects (create or activate flows, add leads, place calls) without a confirmation turn? The verifier asked to raise F-UX-022 to high if so. Until answered, assume yes and ship the plan protocol (§20 item 1) before re-enabling any side effect.
2. **Autonomy.** Confirm mode 2 as the default, the 50-record ceiling for mode 3, and whether admins may turn the Assistant off for a workspace (copy for that state exists in §13.4).
3. **Attachments.** Keep today's types (PDF, TXT, CSV, XLSX, DOCX, JSON)? Confirm 10 MB per file, 5 per message and the 8,000-character paste hint.
4. **Speech.** Which speech-to-text service handles English, Hindi and Hinglish; is audio retained? The privacy line appears only if it is not.
5. **Voice conversation.** Keep it as Beta or retire it? Today it connects to the call agent "vaani", which mixes the call persona with the in-app Assistant.
6. **Privacy of chats.** Private to the author (proposed). Can admins read members' chats? Should read-only sharing exist? Both need a DPDP review.
7. **Retention.** 90 days proposed for chats and their attachments; is export needed?
8. **Roles.** Which roles may place calls, publish flows and delete leads? Step copy names the role that can.
9. **Scheduling.** May a Call step schedule calls for the next calling window through the gate's Schedule, or only suggest a time?
10. **Limits.** Is there a per-user or per-workspace quota? The limit Notice is shown only if one exists.
11. **Reply language.** Confirm Devanagari replies to Devanagari input and Hinglish (Latin) replies to Hinglish input.
