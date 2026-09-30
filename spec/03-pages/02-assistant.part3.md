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
