### 1.8 Room sheet (an open room: `Sheet variant="record"`, 440, `?room=<id>&tab=room|notes`)

Non-modal from 1024 (docked in place of the aside at ≥ 1440, overlaying the right third at 1024–1439), modal full height on tablets, full screen on phones (O §1.7). It replaces the "2 joinees ▸" expander and the unlabelled toggles.

**Header** (O §4.2): title = the room title (`translate="no"`); meta row = `StatusTag` "Live" + "18 min · started 4:23 pm"; actions: Copy link IconButton, ⋯ (Copy invite, Copy key, separator, **End room…**), Close ("Close room details"). **PanelTabs** (N §3): **Room** · **Live notes** (the second tab only while notes are on and MT3 ships).

**Room tab**, four sections, each an `h3` (`title-14`):

1. **Join.** `JoinDetails` (new, §3): the join link field with Copy, the key state ("Key shown when the room was created" or the key with Copy while MT9 allows), **Copy invite** (secondary) and **Open room** (secondary, `external-link`).
2. **Agent, notes and recording.** Three `RoomControlRow`s in `full` mode, `--row-h` 48, divided by `--border` hairlines: label (`label-13`), the state sentence (`StatusText sm`), one action on the right.

| Row | States (sentence) | Action | Guard |
|---|---|---|---|
| Agent | VoiceTile 28 + "Vikash · in the room since 4:24 pm · presenting Q3 pricing" · "Joins when the first guest arrives" · "Not in the room" · "Joining…" · "Couldn't join. The seat was released and you were not charged." · "Left at 5:02 pm · the wallet reached ₹0" | **Add agent…** / **Remove agent** / **Retry** | Add: `AddAgentGate` (below, tier 4). Remove: tier 0, immediate (like End call, O §3.1), toast "Vikash left Weekly demo" |
| Notes | "On · 42 turns so far" · "Off" · "Paused while nobody speaks" (only if MT3 reports it) | **Turn off** / **Turn on** | Tier 0; the room shows "Notes on" to everyone (MT3), and the row says so in its tooltip |
| Recording | Tag outline `disc` "Recording" + "since 4:30 pm" · "Off" · "Not available in key-only rooms" (disabled reason) | **Start recording…** / **Stop recording** | Start: `ConfirmDialog` tier 2 with a primary (non-destructive) confirm; Stop: immediate |

3. **In the room · 3.** A `ul` of 40 px rows: Avatar 28 with initials (guests) or VoiceTile 28 (the agent) · name (`data-13`, `translate="no"`; guest names are what guests typed) · meta "joined 4:26 pm" · `Tag outline` "Host" on the creator. People who left collapse behind "2 people left · Show" (a `button` with `aria-expanded`). The count is one number for everyone including the agent (F-UX-038 "1 participant" vs "2 joinees").
4. **Details.** `KeyValueList` (N §8): What the agent does ("Presents slides · Q3 pricing.pdf, 14 slides" or "Runs Product demo · Live v3", the flow name linking to `/flows/<id>`) · Voice (VoiceTile 20 + "Vikash · अ Hindi, A English") · Who can join · Notes · Recording · Created by · Created ("Today 4:21 pm") · Room code (`mono-12` + Copy).

**Live notes tab.** `TranscriptFeed mode="live"` (N §12.4) with the meeting's turns: speaker = participant name or "Guest 2" when unnamed, "Vikash" for the agent; `LanguageMark` per turn only with per-turn language (else once in the feed header); follow mode and "Jump to latest"; announcements of final turns follow the feed's default (on, switchable in its ⋯). Idle copy: "Notes appear here when someone speaks."

**AddAgentGate** is specified in `spec/02-components-gate.md` §5.4 (popover gate, 400, anchored to **Add agent…**; a bottom sheet below 768 and at 768–1023 when it doesn't fit; checks `agent_seat` and `wallet`; the `rate` cost line; "Add agent" with `⌘/Ctrl+Enter` and an idempotency key; result and failure copy). Meetings configuration:

| Setting | Value |
|---|---|
| Title and scope | "Add Vikash to Weekly demo" · Does "Presents slides · Q3 pricing.pdf" · Voice "Vikash · Hindi, English" |
| Global blockers | At ₹0 the **Add agent…** button is `aria-disabled` with "Wallet is ₹0. Top up so the agent can join." (G §4.4); the gate opens only if the agent can be paid for |
| "Show open rooms" | Closes the gate and scrolls Live now into view, focusing its heading |
| Done | The Agent row reads "Joining…", then "In the room"; focus moves to the Agent row; announce "Vikash joined Weekly demo" |

**End room…** (`ConfirmDialog` tier 2, danger): title "End 'Weekly demo · Sample Realty'?"; body "Everyone is removed, the agent leaves and the link stops working. Notes and the recording are kept in Past meetings."; confirm **End room** (destructive outline); focus starts on Cancel. After the server confirms: toast "Ended Weekly demo · writing notes"; the card leaves Live now and the meeting appears first in Past meetings with Notes "Writing notes…"; focus moves to the next room card's title, else the Live now heading. There is no Undo (a room can't be reopened).

**Start recording…** (`ConfirmDialog` tier 2, primary confirm): "Start recording Weekly demo?" · "Everyone in the room is told that recording has started. The recording is kept with this meeting's notes." · Cancel · **Start recording**.

### 1.9 A past meeting (`Sheet variant="detail"`, 560, `?meeting=<id>`; full page `/meetings/<meetingId>`)

Rows open the sheet (keeping the list in view); **Open full page** in the sheet header and every shared link go to `/meetings/<meetingId>`, which renders the same content under `PageHeader variant="nested"` (breadcrumb "Meetings", H1 = the title, `translate="no"`), with the tabs as `PanelTabs` in the page. This reconciles the shell's route (Shell §2.3) with the overlay spec's "meeting outputs" detail sheet (O §4.1).

**Header:** title; meta "23 Sep 2026 · 4:23 to 5:05 pm IST · 42 min · 4 people"; actions Previous / Next meeting (`J` / `K` in their tooltips), Copy link, Open full page (sheet only), ⋯ (Copy summary, Download transcript (.txt), separator, **Delete meeting…**), Close.

**PanelTabs:** **Summary** (default) · **Transcript** · **Action items** · **Details**. With notes off (or before MT3) only **Details** exists and no tab row renders.

| Tab | Content |
|---|---|
| Summary | `StatusText` success "Summary ready · written 5:07 pm". The summary in `read-15` (`lang` set from the meeting language; Devanagari paragraphs use `read-15-deva`), max `--size-measure`. Optional `h3` sections "Decisions" and "Open questions" as plain lists when the notes service returns them. Then `KeyValueList`: Agent "Vikash presented Q3 pricing.pdf" or "Ran Product demo v3 · reached 6 of 8 steps" · Agent time "18 min · ₹86.40" (source note "from Billing") · Room time "42 min · free minutes" · Languages (`LanguageMark`s "अ Hindi · A English") · Recording "42 min · **Play**" (switches to Transcript) or "Not recorded" |
| Transcript | `RecordingPlayer` (N §12.5) when a recording exists; its scrubber is a TalkStrip only with per-turn timing, with the lanes **Agent** and **Guests** (all human speakers in one lane), else a waveform or plain track. Then `TranscriptFeed mode="review"`: turns seek the player; search in the feed header; speakers by name |
| Action items | "Copy all" (secondary sm) at the top. An `ol` of items: the text (`data-13` `--text`), then `meta-12` `--text-3` "Owner · Anika R." or "Owner · Not captured", "Due · Mon 29 Sep" or "Due · Not captured", and a timecode link "at 23:41" that opens Transcript there. Each item has a tertiary sm action **Hand to a personal agent…**, which opens `/personal-agents?new=1&from=meeting:<id>:item:<n>` (§2.9). Empty: "No action items were found in this meeting." |
| Details | `KeyValueList variant="rows"`: Room code (`mono-12`, Copy) · Created by · Started · Ended ("5:05 pm · ended by Anika R." or "5:40 pm · ended automatically after 30 min with nobody in the room") · Who could join · What the agent did · Voice · Notes (On / Off) · Recording · People (name · joined to left, one row each) |

**States.** *Writing notes* (MT3 processing): `StageProgress` (O §14.3) "Transcribing · Summarising · Finding action items", meta "Usually under 2 minutes"; tabs render, their panels show the stage. *Notes off*: a neutral `Notice` at the top of Details: "Notes were off for this meeting. Turn on **Take notes** when you start a meeting to get a summary." *Couldn't write notes*: `InlineError` "Couldn't write the notes for this meeting. **Retry**" (Details holds the error id). *No recording*: the player's Unavailable state, "No recording. Recording was off for this meeting." *Deleted or no access*: the sheet's "Record gone" state (O §4.3).

**Delete meeting…** (`ConfirmDialog` tier 2, danger): "Delete 'Weekly demo'?" · "Its notes, transcript and recording are deleted. Billing records are kept. This can't be undone." · **Delete meeting**. If the backend soft-deletes for the toast's lifetime, it becomes tier 1 with "Deleted Weekly demo · Undo" (O §3.1).

### 1.10 Generate a deck (`Dialog size="md"`, `?generate=1`)

Replaces the "Generate PPT" section that sat at the bottom of the page. Opened from the header ⋯ and from the Start sheet's "Generate a deck" link. One dialog; its body changes by step (no stacked modals, O §1.6).

| Step | Content | Footer |
|---|---|---|
| 1 · Describe | `Field` "Describe the deck" + `Textarea` (rows 4, `data-autofocus`), placeholder "Quarterly pricing update for channel partners, with the new payment plans…", required and trimmed: "Describe the deck in a sentence or two." `Field` "Slides" + `NumberInput` 3 to 7 with stepper, default 5, hint "3 to 7 slides"; out-of-range values stay as typed with "Enter a number from 3 to 7." (today 999 silently becomes 7, QA-A) | Cancel · **Generate 3 options** (primary) |
| 2 · Generating | `StageProgress`: "Planning the slides · Writing · Designing", meta "About a minute"; the dialog can be closed and the job continues with a progress toast | Cancel generation (tertiary) |
| 3 · Choose | `RadioGroup variant="card"`, 3 options: the deck title (`title-14`), "5 slides · first slide: New payment plans", and a **Preview** link (opens a PDF preview in a new tab) | Start over (tertiary) · **Download PPTX** (secondary) · **Use in a meeting** (primary; closes the dialog and opens the Start sheet with Present slides → Show my deck and this deck attached). Until MT7 the primary is **Download PPTX** and "Use in a meeting" is absent |

Failure: `InlineError` "Couldn't make the deck. Try again, or shorten the description. **Retry**" with Details. Copy retires "independent of meetings", "no LiveKit" and "no in-meeting agent" (F-UX-016).

### 1.11 How meetings work (`Popover variant="info"`, 280)

"Start a meeting to get a link. The meeting agent joins your video room to present slides or talk through a published flow. With notes on, you get a transcript, summary and action items afterwards. Room time uses your free minutes first; agent time is charged from the wallet." Link: **Plans and rates** (`/billing/plans`). It opens on click or Enter (never hover), holds focus on its content and closes on Esc.
