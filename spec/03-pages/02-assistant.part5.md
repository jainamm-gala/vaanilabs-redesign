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
