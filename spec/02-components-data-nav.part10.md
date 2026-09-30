### 12.4 `TranscriptFeed` and `TurnRow`

**Purpose.** What was said, by whom, in which language, and where in the flow, live or after the call. One row design is used in Cockpit, Call reports, Rep console, Meetings notes and the flow Test panel (direction §6.2). **Don't** use chat bubbles, typing animations, per-word fades, or fake per-turn data.

**TurnRow anatomy.**

```
00:21 │ Vaani  [A]  Step · Ask about a site visit   ⌸ Knowledge · price-sheet.pdf
      │ You had asked about a 2 BHK near the metro. Would you like to visit the site this week?
```

| Part | Tokens |
|---|---|
| Row | grid `var(--space-56) minmax(0,1fr)` (the gutter is `--size-turn-gutter`, foundations §18), row gap `space-4`; padding `space-12 space-16 space-12 0`; bottom hairline `border`; `lang` on the row (`hi`, `hi-Latn`, `ta`, …) |
| Agent / operator turn | `surface` |
| Caller turn | `surface-2` |
| Timecode | `Timecode` (§5.8): `meta-12` tabular `text-3` in the gutter, padding-left `space-16`, from call start (`mm:ss`, `h:mm:ss` after an hour). In review mode it is a button that seeks ("Play from 00:41"; hover `accent-text` + underline) |
| Header line | flex, wrap, gap `space-4 space-8`, `meta-12` `text-3`: speaker `title-14` `text` ("Vaani" with `translate="no"`, "Caller", or "You" after a take-over) · LanguageMark `compact` · the flow step in plain words, "Step · Ask about a site visit", `text-2` with a `border-strong` underline, opening the flow at that step · an optional source ("Knowledge · price-sheet.pdf" with `book-open` 12) |
| Utterance | `read-15` `text`; rows with `lang` hi, mr or ne switch to `read-15-deva` (15/26) so matras never collide; Hinglish (`hi-Latn`) stays Latin at `read-15` |
| System row | one line, no speaker: icon 14 + `meta-12` `text-3`, indented to the text column ("Knowledge lookup · price-sheet.pdf · 2 passages", "Transferred to a person", "Moved to step 4 · Book site visit") |

**TurnRow states.**

| State | Treatment |
|---|---|
| Partial (interim) | utterance in `text-3`, always ending in "…"; header "speaking…"; replaced in place by the final text (colour change over `--dur-fast`, no other motion); never announced, never copied |
| Final | `text` |
| Active (playing, review mode) | `accent-soft` fill + `--bw-strong` inset `accent-mark` bar (the selection treatment), header "Playing", `aria-current="true"` |
| Search match | `<mark>` in `accent-soft` with `accent-soft-text`; the header shows "2 of 7" with previous and next |
| Redacted | sensitive digits spoken on the call read "•••• (redacted)" in `text-3` |
| No per-turn language | turn language marks are hidden; the feed header shows the call's languages once (P1) |

**Feed anatomy and behaviour.**

| Part | Tokens and rules |
|---|---|
| Header | height `space-48`; padding `0 space-8 0 space-16`; bottom hairline; "Transcript" `title-14` (`h2` or `h3`); a Tag for the feed state (Streaming · info, Reconnecting… · warning, Ended · neutral); tools: Search (opens a field in the header; ⌘F inside the panel), Copy transcript (final turns with speakers and timecodes), `⋯` (Download .txt, "Read new turns aloud" switch) |
| Body | the scroll region; an `<ol>` of turns; `overscroll-behavior: contain` |
| Follow mode | the feed follows the newest turn while it is pinned (scrolled within `space-48` of the bottom). Any user scroll up (wheel, touch, keys, scrollbar) unpins it, and so does an active text selection inside the feed |
| Jump to latest | while unpinned, a small secondary Button "Jump to latest · 2 new" (`arrow-down` 16) floats centred at `bottom: space-12`, `e2`, `z-float`; the count is final turns received since unpinning; click or End scrolls to the bottom (`behavior: smooth`, or `auto` under reduced motion) and re-pins |
| Announcements | final turns only, at most one per `--timing-announce-throttle` (2 s); when several arrive, the latest is read with "and 1 more" ("Caller: Saturday ho sakta hai, but morning mein."); switchable in `⋯`, on by default. The feed is **not** `role="log"` (its implicit live region would read every interim update) |
| Long calls | virtualised above 500 turns (TanStack Virtual), with `aria-setsize` and `aria-posinset` on items |

**Feed states.**

| State | Copy and treatment |
|---|---|
| Idle (Cockpit, no call) | "The transcript appears here when a call starts." `body-14` `text-2`, centred; nothing animates (replaces "Awaiting connection…", F-VIS-023) |
| Connecting | "Waiting for the first words…" |
| Streaming | turns append; Tag "Streaming" |
| Reconnecting | a warning Notice at the top: "Transcript paused while the line reconnects. Missing turns will fill in." Existing turns stay |
| Error | a danger Notice: "Transcript stopped updating. The full transcript will be ready after the call." + Retry |
| Ended | a footer row: "Call ended · 02:31 · Summary ready" linking to the call report; timecodes become seek buttons if a recording exists |
| Review (Call reports) | full transcript, synced with RecordingPlayer (§12.5); the transcript is the default tab of the call detail sheet (F-UX-010) |

**Keyboard and ARIA.** `<section aria-labelledby="{header id}">`; turns are `<li lang>` inside `<ol aria-label="Transcript">`; step links are named "Open step: Ask about a site visit"; timecode buttons "Play from 00:41". End jumps to the latest turn and re-pins; Home goes to the first. The Search field traps nothing; Esc closes it and returns focus to the Search button.

**Responsive.** At a container width of 480 px or more, the 56 px gutter layout. Below it (phones, narrow panels) the gutter disappears and the timecode leads the header line; padding `space-12 space-16`. In the phone Cockpit the call card stacks above the feed and Take over / End call sit in a sticky 44 px bar (Cockpit page spec).

**Motion.** Only scrolling in follow mode, and the partial-to-final colour change. No typing effect, no per-word fade, no bouncing Jump button.

**Content.** Speakers: the agent's name, "Caller", "You". Steps in plain words, never node ids. Sources name the document. Transcripts are content in the language spoken and are never machine-translated in place (`lang` set per row, `translate="no"` on names).

| Do | Don't |
|---|---|
| Rows with a timecode gutter, speaker, language and step | Chat bubbles, or "TRANSCRIPT FEED" caps over an empty white column (F-VIS-029) |
| Pause following when the operator scrolls up, and offer Jump to latest | Yanking the operator back to the bottom on every turn |
| Announce final turns, throttled | Silent transcripts (F-A11Y-014) or a live region that reads every interim word |

**Resolves:** F-A11Y-014, F-UX-010, F-VIS-023, F-VIS-029, F-UX-003 (only what was said), digest §5.7 item 3, direction §6.2 and §6.4.

```tsx
type Turn = { id: string; speaker: 'agent' | 'caller' | 'operator' | 'system'; name?: string;
  startMs: number; endMs?: number; text: string; lang?: string; final: boolean;
  step?: { id: string; label: string; href: string }; source?: { kind: 'knowledge' | 'crm'; label: string; href?: string } };
<TranscriptFeed mode="live" turns={turns} callLanguages={['hi', 'en']} perTurnLanguage={hasTurnLang}
  state={feedState} onRetry={retry} announce={prefs.readTurnsAloud} />
<TurnRow turn={turn} mode="review" active={turn.id === activeId} onSeek={(ms) => player.seek(ms)} />
```

### 12.5 `RecordingPlayer` and `TalkStrip`

**Purpose.** Replay a call and move through it by who was speaking, with the transcript following. **Use** at the top of the call detail sheet's Transcript tab and in Meetings notes. **Don't** draw a waveform or talk strip that is not computed from the recording or from per-turn timing (P1); when neither exists, a plain track is honest.

**Anatomy.**

```
[❚❚] [↺5] [↻5]  00:41 / 02:31                       1× ▾  [⋯]
▬▬▬  ▬▬▬▬  ▬▬▬|▬      ▬▬▬▬▬       ▬▬▬▬      ▬▬▬      agent lane
    ▬          ▬▬▬         ▬▬▬         ▬▬      ▬▬▬   caller lane
Agent 58% · Caller 42% · 9 turns · 1 interruption          Recording disclosed at 00:01
```

| Part | Tokens |
|---|---|
| Player | `surface`; 1 px `border`; radius-8; padding `space-12 space-16`; grid gap `space-10` |
| Controls row | flex, gap `space-8`, wraps; Play/Pause IconButton `line` 32 (44 on touch); Back 5 s and Forward 5 s IconButtons (`rotate-ccw`, `rotate-cw`); time "00:41 / 02:31" `meta-12` `text-2`, tabular (`Timecode`); speed ghost small Button "1×" with a Menu (1×, 1.25×, 1.5×, 2×; remembered per user); `⋯` with "Download recording…" (explicit, masked, logged) and "Copy link at 00:41" |
| TalkStrip scrubber | two lanes, each `space-6` tall, gap `space-4`, padding-block `space-6`; lane track `surface-2`, radius-2; one segment per turn in `--talk-agent` (agent lane, top) or `--talk-caller` (caller lane, below), radius-2, min width 1 px; overlaps show in both lanes (that is an interruption) |
| Playhead | a `--bw-strong` line in `text` across both lanes with a `space-10` square handle, radius-2 (only avatars, the live dot, switches and capsule ends are fully round), ringed by `--bw-strong` of `surface` |
| Waveform variant | bars from the recording's real peaks (server-computed buckets): gap 1 px, radius-2, height `space-32`, unplayed `--chart-other`, played `accent-mark` |
| Track variant | a `space-4` track in `surface-3`, played fill `accent-mark`, radius-2, same handle |
| Legend | `meta-12` `text-3`, tabular: swatches (`data-mark`) "Agent 58%", "Caller 42%", "9 turns", "1 interruption", then "Recording disclosed at 00:01" on the right |

**Scrubber choice:** TalkStrip when per-turn timing exists, else Waveform when peaks exist, else Track. In the live Cockpit card the same TalkStrip grows in real time, with the still-speaking segment at `--opacity-partial` and the playhead as the now-marker (direction §6.2).

**States.**

| State | Treatment |
|---|---|
| Loading | Play `aria-disabled` with "Loading recording…" beside the time |
| Ready / paused | Play icon; "00:00 / 02:31" |
| Playing | Pause icon; playhead moves with real playback time |
| Buffering | "Buffering…" after the time (no spinner) |
| Ended | Play becomes Replay (`rotate-ccw`) |
| Error | a danger Notice "Couldn't load the recording." + Retry; the transcript stays usable |
| Unavailable | an info Notice with the reason: "No recording for this call. Recording is off for browser tests. The transcript is still available." (F-UX-011); the header no longer promises recordings that don't exist (F-UX-010) |

**Keyboard.** The player is `role="group"` with `aria-label="Recording"`. The scrubber is `role="slider"` with `aria-valuemin="0"`, `aria-valuemax` = duration in seconds, `aria-valuenow`, and `aria-valuetext="00:41 of 02:31, Vaani speaking"`; ←/→ move 5 s, Shift+←/→ 15 s, PageUp/PageDown 30 s, Home/End to the ends. Space or K plays and pauses while focus is inside the player but not on a button (buttons keep native Space). Enter on a turn's timecode seeks there and plays. Media keys work through the Media Session API. Nothing is global: the player never grabs Space from the page.

**Transcript sync.** The turn containing the current time is `active` (§12.4) and is scrolled into view while "Follow playback" is on; a user scroll pauses following and shows a "Follow playback" button, the same pinning rule as the live feed. Seeking from a turn keeps following on.

**ARIA.** Play/Pause changes its name ("Play" ↔ "Pause"); the time display is not live; nothing is announced during playback.

**Responsive.** Desktop and tablet: inside the 560 px call detail sheet, above the transcript. Phone: sticky at the top of the full-screen sheet, controls at 44 px; below a 360 px container, Back and Forward 5 s move into `⋯`; the legend wraps.

**Motion.** Only the playhead, driven by real playback. Seeking jumps without easing. Reduced motion changes nothing here (it is state, not decoration).

**Content.** "1×", "1.25×"; "Download recording…" ends in "…" because it confirms masking and logs the download; the disclosure time is always shown when a recording exists.

| Do | Don't |
|---|---|
| A talk strip from per-turn timing, or real peaks, or a plain track | A plausible-looking fake waveform (direction P1) |
| Transcript first, player on top of it | Recording and transcript at the bottom of a 373 px panel with nested scrolling (F-UX-010) |
| Explain why there is no recording | "No call recordings yet" with no reason beside 121 calls (F-UX-011) |

**Resolves:** F-UX-010, F-UX-011, F-A11Y-002 (keyboard reach inside the call), digest §5.7 item 8, direction §6.4.

```tsx
<RecordingPlayer src={call.recordingUrl} durationMs={call.durationMs}
  turns={turns /* per-turn timing → TalkStrip */} peaks={call.peaks /* → Waveform */}
  disclosedAtMs={call.recordingDisclosedAtMs} unavailableReason={call.recordingOffReason}
  onTimeUpdate={setCurrentMs} speed={prefs.playbackSpeed} onSpeedChange={setSpeed} />
```
Built on a native `<audio>` element (no custom decoder); the scrubber on Radix `Slider` with a custom track that renders the lanes; the talk-strip geometry is computed once per call from turn start and end times.
