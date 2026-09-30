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
