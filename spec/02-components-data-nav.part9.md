---

## 12. Voice components

The conversation is the stage (direction §0): these components show real call state, real line quality and real speech, and they hide themselves when the data does not exist. Motion here is only ever driven by a live call or real audio.

### 12.1 Call state: `CallStateTag`, `CallStepper`, `CallHeader`

**Purpose.** One call-state machine, shown the same way in Cockpit, Rep console, Call reports, the flow Test panel, the Cockpit Calls column and the tablet and phone call chip. **Don't** show a call state when there is no call (no STANDBY ring, no "SESSION: IDLE", F-VIS-029, F-UX-018).

**States** (foundations §3.5; tokens `--call-{state}-fg / -bg / -mark`):

| State | Word | Icon | Tone | Announced |
|---|---|---|---|---|
| Idle | Idle | `phone` | neutral | no |
| Dialling | Dialling… | `phone-outgoing` | pending (warning tokens) | "Dialling" |
| Ringing | Ringing… | `phone-call` | pending | "Ringing" |
| Live | Live | LiveDot, pulsing | live (success tokens, `--live` mark) | "Call live" |
| On hold | On hold | `pause` | pending | "On hold" |
| Wrap-up | Wrap-up | `clipboard-check` | neutral | "Call ended. Wrap-up" |
| Ended · No answer · Busy · Voicemail | as written | `phone-off` · `phone-missed` · `phone-off` · `voicemail` | neutral | the word, plus the duration for Ended |
| Failed | Failed | `circle-x` | failed (danger tokens) | "Call failed" + reason when known |

Transitions: Idle → Dialling → Ringing → Live ⇄ On hold → Wrap-up → Ended. Dialling or Ringing → No answer | Busy | Voicemail | Failed. Live → Failed ("Call dropped"). Inbound calls start at Ringing.

| Variant | Anatomy and tokens |
|---|---|
| `CallStateTag` | Tag metrics (§5.2): height `--tag-h`, radius-4, padding-inline `space-6`, gap `space-6`, `label-12`; icon 12 or LiveDot; word; optional `Timer` (§5.8, `label-12` tabular) of time in this state ("Ringing… 00:07", "Live 02:14"). As the tablet or phone TopBar chip it is `lg` (`--size-chip`) with radius-6 and links to the call |
| `CallStepper` | `<ol>` of 4 steps: Dialling, Ringing, Live, Wrap-up; node 12 px (`space-12`) circle with a `--bw-strong` border; done nodes filled `text-2`; the current node filled with the state's mark (`--live` when live) and `data-mark`; upcoming nodes `surface` + `border-strong`; connector `--bw-strong` in `border-strong`, done segments `text-2`; label `label-12` `text-2` (current in the state's `fg`), time `Timecode` (`meta-12` tabular `text-3`, "00:03", "next"). A terminal outcome (No answer, Busy, Voicemail, Failed) replaces the remaining steps with its CallStateTag |
| `CallHeader` | row 1: CallStateTag · direction and flow ("Outbound · Site-visit qualifier v7") in `data-13` `text-2` · `Timer` in `num-20`, tabular, right-aligned, `role="timer"`; row 2: 32 px Person avatar, lead name `title-14` (`translate="no"`), masked number `PhoneText`, a `Tag outline` "Recording · disclosed 00:01"; row 3: CallStepper; then LineQuality |

**States beyond the machine:** loading (the header shows the lead and flow; the tag reads "Connecting…" as Dialling only once the server confirms the attempt), stale (a call stuck in Dialling or Ringing past 60 s shows "No update for 60 s · Check" in `warning-text`, never a frozen timer).

**Behaviour and ARIA.** The state word sits inside a polite `role="status"` wrapper in CallHeader and the chip; changes are debounced by 500 ms so a Dialling → Ringing flip under a second announces once. The timer is `role="timer"` (implicitly not live) and is never announced. In tables the CallStateTag has no live region. Colour never carries the state alone: word and icon are always present.

**Responsive.** Desktop: CallHeader in the Cockpit call card (400 px column). Laptop-S: the Calls column becomes a header switcher, CallHeader unchanged. Tablet: CallHeader on the Call tab. Phone: CallHeader stacks above the transcript; the TopBar chip keeps state visible when the card scrolls away (F-RWD-002).

**Motion.** Only the CallHeader's LiveDot pulses: 3 cycles (`--live-pulse-cycles` × `--dur-pulse`) each time the call enters Live, then solid; the CallStateTag's dot in lists and chips is static; Ringing has no animation. Tone changes over `--dur-fast`. Under reduced motion nothing moves.

**Content.** State words exactly as in the table; timers `mm:ss` (h:mm:ss after an hour); "Recording · disclosed 00:01" wherever a recording runs (compliance cue, direction §8).

| Do | Don't |
|---|---|
| "Live 02:14" with a pulsing dot while live | A 320 px STANDBY ring that breathes forever (F-VIS-029, F-A11Y-022) |
| The same state machine on every surface | "IDLE" in the header, "Awaiting connection…" in the feed and "SESSION: IDLE" in a strip |

**Resolves:** F-VIS-029, F-VIS-030, F-UX-018, F-UX-026, F-A11Y-014, F-A11Y-022, F-RWD-002, F-QA-037 (stuck states surface).

```tsx
<CallStateTag state="ringing" since={ringingAt} size="default" />   // size: 'default' | 'chip'
<CallStepper state={call.state} times={{ dialling: 0, ringing: 3000, live: 9000 }} />
<CallHeader call={call} lead={lead} flow={flow} recording={{ disclosedAtMs: 1000 }} />
```

### 12.2 `LineQuality`

**Purpose.** Tell the operator, in words, whether callers can hear the agent well right now. **Only during a call** (Cockpit call card, Rep console, Talk in browser, the call header); never idle, never in the sidebar, never a random number (F-UX-018).

**Anatomy.** Optional key "Line" (`text-3`) · signal bars · level word · latency · optional consequence.

| Part | Tokens |
|---|---|
| Signal bars | 3 bars, `space-2` wide, heights `space-4`, `space-8`, `space-12`, gap `space-2`, radius-2, bottom-aligned in a 14 px box; filled bars in the level's solid (`--success`, `--warning`, `--danger`); unfilled bars `border-strong`; `data-mark` |
| Word | `data-13` in the level's text token (`success-text`, `warning-text`, `danger-text`) |
| Latency | `meta-12` `text-3`, tabular, `formatLatency` ("180 ms", non-breaking space) |
| Consequence (Poor only) | `meta-12` `text-3`: "callers may talk over the agent" |

**Levels** (computed from WebRTC `getStats()` on the agent's media leg every 2 s; a level changes only after two consecutive samples agree, so it never flickers). Thresholds are a proposal for the product owner to confirm:

| Level | Condition | Bars | Word |
|---|---|---|---|
| Good | round trip < 300 ms, loss < 1 %, jitter < 30 ms | 3 filled, `--success` | Good |
| Fair | round trip 300–600 ms, or loss 1–3 %, or jitter 30–60 ms | 2 filled, `--warning` | Fair |
| Poor | round trip > 600 ms, or loss > 3 %, or jitter > 60 ms | 1 filled, `--danger` | Poor |
| Reconnecting | no media for more than 2 s | `refresh-cw` 14 (static) in `warning-text` | Reconnecting… + seconds ("4 s") |
| Lost | reconnection fails after 15 s | — | the call moves to Failed ("Call dropped") |

**Details popover.** LineQuality is a button (`aria-haspopup="dialog"`); its Popover (`e2`, `border-overlay`, max `--size-tooltip-max`) says what it means in a sentence ("Callers hear the agent about 0.2 s after they finish speaking.") and lists Round trip, Jitter, Packet loss and "Measured every 2 s" as a KeyValueList. Region appears only when it is real. With **Talk in browser**, two rows show: "Your connection" (the browser leg) and "Phone line".

**ARIA.** Button name "Line quality: Good, 180 milliseconds". Announced only on transitions into Poor or Reconnecting and on recovery ("Line recovered"), politely; Lost is announced by the call state. Numbers are never announced.

**Responsive.** Same component everywhere; on phones the key "Line" is dropped and the consequence moves into the popover. **Motion:** none (bars do not animate; the reconnect icon does not spin). **Content:** words first, then the number: "Line · Good · 180 ms".

| Do | Don't |
|---|---|
| "Line · Good · 180 ms" during a call, from real measurements | "LAT: 0ms" idle, or "SYS: ONLINE · 22ms" from a random timer (F-UX-018) |
| Hysteresis so the level is stable | A level that flips every sample |

**Resolves:** F-UX-018, F-UX-026 (explains what the operator is watching), digest §5.7 item 2.

```tsx
<LineQuality sample={stats /* { rttMs, jitterMs, lossPct, stalledMs } */} showKey legs={['phone']} />  // legs: ['browser','phone'] for Talk in browser
```

### 12.3 `VoicePicker` and `VoiceOption`

**Purpose.** Choose the voice for this call, flow or agent, and hear it in the language it will speak. **Use** in the Cockpit Ready-to-call card (compact), the Call gate, Flow settings and Personal agents. **Don't** save the account default as a side effect of picking (F-UX-014), and don't give the voice a face.

**Anatomy (option card).**

```
[Va]  Vaani  [Workspace default]                 ✓  [▶]
      अ Hindi  A English  Warm, measured pace
```

| Part | Tokens |
|---|---|
| Option | grid `minmax(0,1fr) auto`, gap `space-4 space-12`; padding `space-12`; 1 px `border`; radius-8; `surface` |
| Radio part | the tile and text, as one `role="radio"` element: grid `auto minmax(0,1fr)`; VoiceTile 32; name `title-14` (`translate="no"`); qualifier Tag `outline` ("Workspace default"); meta line `meta-12` `text-3` with LanguageMarks (16 px glyph box) and a plain style description |
| Selected cue | `circle-check` 16 in `accent-text` beside the preview button (the non-colour cue, F-A11Y-016) |
| Preview | IconButton `line` 32 (44 on touch): `play` ↔ `square`; while playing, a 4-bar level meter (`space-2` wide bars in `accent-mark`, radius-2) driven by a real `AnalyserNode` |
| Compact trigger (`VoiceSelect`) | a field-like row: height `space-48`, 1 px `control` border, radius-6, padding `0 space-4 0 space-8`; VoiceTile 28 + "Vaani · Hindi + English" in `data-13` + preview IconButton + `chevron-down` IconButton opening a Popover listbox of options; helper under it in `meta-12` `text-3`: "Used for this call only. Make default" |

| State | Treatment |
|---|---|
| Hover | `surface-2` + `border-strong` over `--dur-fast` |
| Focus-visible | focus ring on the radio part, offset `space-4` |
| Selected | `accent-soft` fill + `accent-mark` border + check icon; `aria-checked="true"` |
| Previewing | preview button `aria-pressed="true"`, label "Stop preview of Vikash", meter moving with the audio |
| Preview failed | "Couldn't play the preview. Retry" in `meta-12` `danger-text` inside the option |
| Unavailable | `surface-2`; name `text-dis`; the reason in the meta line ("Not available: this flow speaks Hindi and English"); `aria-disabled="true"`; preview still works so people can hear it |
| Loading | three skeleton options |

**Behaviour.** Selecting changes this call or this flow only; "Make default" is a separate link and confirms with a toast that offers Undo (F-UX-014). One preview plays at a time; starting another stops the first; previews stop at their end (a sample of about 8 s), on selection change and on unmount. The sample is real audio in the selected language, recorded or synthesised once, never a fake waveform.

**Keyboard and ARIA.** `role="radiogroup"` with `aria-label="Voice for this call"`; ↑/↓ (and ←/→) move and select; Tab moves to the preview button of the focused option, then out. Space on the preview toggles play; Esc stops it. Each radio has `aria-describedby` pointing at its meta line. The preview button is a sibling of the radio, never nested inside it.

**Responsive.** A single column of options; in Flow settings at ≥1024 with more than four voices, two columns. On phones options are 56 px or taller and the compact trigger opens a bottom sheet instead of a popover.

**Motion.** The meter moves only with real audio and is static under reduced motion; hover fills over `--dur-fast`.

| Do | Don't |
|---|---|
| Radio options with a check, a language and a real preview | VIKASH / VAANI buttons without `aria-pressed` (F-A11Y-010, F-A11Y-016) |
| "Make default" as its own action | Pickers that silently save the account default and silently revert (F-UX-014) |
| A square 32 px tile | An orb or a face for the agent |

**Resolves:** F-UX-014, F-A11Y-010, F-A11Y-016, F-VIS-029 (controls, not decoration, lead the Cockpit), direction §6.2.

```tsx
<VoicePicker value={voiceId} onValueChange={setVoiceId} label="Voice for this call"
  voices={voices /* { id, name, languages: LangCode[], style, available, unavailableReason? } */}
  previewLanguage={flow.language} defaultId={workspace.defaultVoiceId} onMakeDefault={makeDefault}
  variant="cards" />   // 'cards' | 'compact'
```
Built on Radix `RadioGroup` (cards) and Radix `Popover` + a listbox (compact); audio through one shared `useAudioPreview()` that guarantees a single playing element.
