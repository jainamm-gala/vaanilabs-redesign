### 5.6 Anti-patterns to avoid

These are drawn from:
- **[TS]** the Taste Skill "AI tells" list, plus `redesign-skill` and `minimalist-skill`
- **[I2C]** the Image-to-Code clutter list
- **[ADM]** the "don'ts" in the Awesome Design MD files

**Seen** means the pattern is visible in the scout screenshots of Vaani. Sections 3B and 3C of this audit measure these in depth.

| # | Anti-pattern | Status in Vaani | What to do instead |
|---|---|---|---|
| 1 | Purple-to-blue gradients and gradient text [TS; ADM Linear] | **Seen**: the marketing hero headline is gradient text over a violet glow orb. | Solid ink headline. Show a real product visual. |
| 2 | Neon glows, orbs, halo shadows [TS] | **Seen**: the hero orb and wave lines, and the green glow around ACTIVATE. | A flat fill. Elevation from the `--e` levels only. |
| 3 | Glassmorphism without a reason, floating blobs [I2C; TS] | Avoid | No glass in the app. |
| 4 | Mono uppercase wide-tracked labels on everything (HUD or "pseudo-enterprise" labels) [TS; I2C; ADM Intercom] | **Seen**: Dashboard field and section labels ("CUSTOMER NAME", "TRANSCRIPT FEED", "SESSION: IDLE"); Leads title, KPIs, filter chips and shortcut strip; Analytics labels. | Sentence case at 13/500 in the secondary colour (T5). |
| 5 | Section-number eyebrows and performative kicker copy [TS] | **Seen**: "§ 01 / § 02 / § 03" and poetic kickers on Analytics, plus HUD corner brackets around the identity card. | Plain section headings: "Overview", "Call volume", "Sentiment". |
| 6 | A decorative serif in a dashboard. Instrument Serif and Fraunces are specifically discouraged as defaults. [TS] | **Seen**: serif-italic "not allocated yet" on Analytics. | A functional sentence with an action: "No number allocated. Allocate one in Billing." |
| 7 | Decorative status dots [TS] | **Seen**: dots before "Canvas", "FLOW VALIDATED", "CUSTOMER INTEL", "TRANSCRIPT FEED" and the marketing "LIVE" eyebrow. | A dot only for real live state: call connected, room live, recording. |
| 8 | Pills and micro-badges everywhere [I2C; TS] | **Seen**: Leads source chips with letter pseudo-icons; three badges per Call Reports row; a four-pill trust strip in the hero. | One outcome cell. A muted channel icon. Trust items move below the hero. |
| 9 | Box-in-box nesting [I2C] | **Seen**: Dashboard fields boxed inside a card inside a panel. | Plain inputs grouped by spacing (L4). |
| 10 | Multiple accents [TS; ADM] | **Seen**: blue primary, green ACTIVATE, purple Meeting Agent, teal Import CSV, violet marketing CTAs, orange and yellow node categories. | One accent (C2). Category colour lives only in node icon tiles. |
| 11 | Idle decorative animation [TS; WIG] | **Seen**: a large STANDBY radial fills the Cockpit centre while idle. Motion was not confirmed from a still image. | A pre-call panel. Motion only on real audio. |
| 12 | Em-dash separators in chrome [TS] | **Seen**: the wallet banner, the Assistant subtitle, the Meeting Agent title, Analytics kickers, the marketing subhead. | A period or colon (P7). |
| 13 | Placeholder used as the label [TS; WIG] | **Seen**: the Cockpit phone field shows only a "+91…" placeholder. | A visible label, `type="tel"` (F1). |
| 14 | Filler status microcopy [I2C] | **Seen**: "LAT: 0ms" while idle, "SYS ONLINE", and a bare "22ms" in the sidebar. | Show latency only during a call, with a qualitative label. |
| 15 | Other tells to keep out [TS; WIG] | Avoid | Fake-precise numbers. "Jane Doe" or Acme data. Rocket and shield clichés. Three equal feature cards. Modals for everything. Spinner-only loading. "Oops!". Exclamation marks in success messages. `transition: all`. z-index 9999. Custom cursors. `user-scalable=no`. Blocked paste. `outline: none` without a replacement. Icon buttons without names. GIFs instead of video. Gesture-only actions. |

### 5.7 Implications for a voice-AI calling product

Source tags in brackets show where each idea comes from. **[Inf]** marks the researcher's own product inference.

1. **One call-state model, shared** by Cockpit, Rep Console, Call Reports and the flow test panel.
   - **States:** Idle, Dialing, Ringing, Connected (live), Wrap-up, then one outcome: Ended, No answer, Busy, Failed or Voicemail.
   - **Colour by state:** neutral for idle, amber for dialing and ringing, green for live, neutral for wrap-up and ended, red for failed.
   - **Every state** also has a label, an icon and a polite `aria-live` announcement.
   - **Pulse:** only the live state pulses, and never under reduced motion.

   [WIG redundant cues and async announcements; TS dots only for real state]
2. **Timers and latency.**
   - Durations are mono or tabular (`01:27`).
   - Latency appears only during a call or on a status page, with a qualitative label ("Good · 180 ms", "Slow · 900 ms").
   - Remove the "0ms" idle readout and the global sidebar "22ms", or give them a meaning.

   [I2C filler status microcopy; WIG]
3. **The transcript is the main live surface.**
   - **Turns:** speaker-labelled (agent, customer), with `mm:ss` timestamps and a per-turn language tag (HI/EN).
   - **Streaming text:** partial text is muted and turns ink-coloured once final.
   - **Scrolling:** auto-scroll pauses when the user scrolls up and offers "Jump to latest".
   - **Tools:** copy and search.
   - **Hindi:** Devanagari sans fallback at about 1.7 line-height, with `lang` set per turn.
   - **Announcements:** only final turns are announced, throttled.
   - **Empty state:** says what will appear.

   [WIG content resilience, live regions, accessible media; Inf]
4. **Audio visuals are functional, not decorative.**
   - Show a level meter or waveform driven by real input or output audio.
   - Keep it static when idle and under reduced motion.
   - It is never the largest element on the page.

   [TS motivated motion; WIG reduced motion and the 5 s autoplay rule]
5. **A pre-call checklist replaces the decorative centre stage.** The Cockpit gets a compact "Ready to call" card:

   | Row | Content |
   |---|---|
   | Contact | The selected contact |
   | Number | A labelled `type="tel"` field with a fixed `+91` prefix, E.164 validation and grouped display formatting |
   | Flow | Name, version and an "Up to date" status |
   | Agent voice | 32 px avatar, name, language or accent, and a ▶ preview (ElevenLabs voice-row pattern) |
   | Wallet | A balance check |

   - Actions: one primary, "Place call", and one secondary, "Test in browser".
   - Any disabled reason is shown inline.

   [K1, K2, F1; ADM ElevenLabs]
6. **Wallet and billing.**
   - The low-balance warning is semantic amber, not brand blue.
   - It shows as a blocking inline message where calling is blocked.
   - Elsewhere it is a small header chip ("₹0 · Top up"). It is not a permanent full-width bar pushing every page down.
   - Money uses `Intl.NumberFormat('en-IN', …)` with consistent decimals.
   - UPI autopay copy states the exact amount and cadence.

   [WIG sticky elements, hue consistency, locale formats]
7. **Sentiment and outcomes.**
   - Sentiment is always icon + label + colour.
   - The score is a tabular number with a small bar.
   - On Call Reports, collapse Type, Status and Sentiment into one "Outcome" cell. Show the channel as a muted icon.

   [WIG; I2C tiny badges]
8. **Recordings.**
   - Player shortcuts: Space to play or pause, ±5 s seek with the arrow keys.
   - Speed options: 1x, 1.25x, 1.5x and 2x.
   - The transcript highlights in sync with playback.
   - Download is an explicit action.
   - Exports respect masking.

   [WIG accessible media]
9. **PII masking.**
   - Use one phone-mask format everywhere (last digits visible). Lists already mask consistently; keep that.
   - "Reveal" is an explicit, logged action tied to the activity and audit trail.

   [Inf]
10. **Compliance cues for Indian outbound calling.** These need the product owner's confirmation.
    - A recording-disclosure indicator during live calls.
    - Calling-hours and DND awareness surfaced when a campaign or flow is activated.

    [Inf]
11. **Multilingual UI.**
    - `lang` attributes on transcript turns.
    - `translate="no"` on agent and brand names.
    - Detect the locale from `Accept-Language`, not from IP address.

    [WIG]
12. **Analytics.**
    - KPIs state the comparison period in words ("+200% vs previous 7 days").
    - Numbers are tabular.
    - Show sparklines only once there are enough data points. Otherwise show "Not enough data yet".
    - Use a colour-blind-safe chart palette, separate from brand chrome.
    - Charts have designed empty and error states.

    [WIG; ADM Intercom report palette; TS fake-precise numbers]
13. **Assistant (plans and acts on data).**
    - Show the plan steps.
    - Ask for explicit confirmation before side-effectful actions: activating a flow, placing a call, bulk-editing leads.
    - Streaming status text ends in `…`.
    - The composer uses one submit convention and shows the hint.
    - Keep suggestions as plain, specific verbs.
    - The current empty states for the composer and the "Plan & Actions" panel are good.

    [WIG forms and destructive-action confirmation]

### 5.8 Implications for the node-based flow designer

1. **Canvas.**
   - A neutral dotted grid on `--canvas`: 1 px dots every 16-24 px at about 6-8% ink.
   - No hatch or noise textures.
   - Snap to 8 or 16 px.

   [ADM; TS]
2. **Node anatomy.** Nodes have a fixed width of 240-280 px.

   | Part | Content |
   |---|---|
   | Header | A 20-24 px category icon tile on a soft tint (the **only** place category colour appears), the node type at 12 px secondary, and the title at 14/500 |
   | Body | A 2-3 line clamped preview of the prompt or script |
   | Footer | Labelled output ports as text chips (Yes/No, True/False, custom branches) |
   | Frame | 1 px border, 8-10 px radius, `--e1` |

   [ADM radius and elevation; TS one accent; WIG `line-clamp` truncation]
3. **Node states.**

   | State | Treatment |
   |---|---|
   | Hover | Strong border |
   | Selected | 2 px accent outline (offset 2) plus `--e2`. No glow. |
   | Error | Danger border, a badge with the issue count, and the message in the inspector |
   | Warning | Amber |
   | Unreachable or disabled | 50% opacity with a "Not connected" note |
   | Running during a test call | Accent left stripe and a "Live" chip, with the path traced along the edges |

   [Inf; WIG]
4. **Ports and edges.**
   - Ports are 10-12 px visible with a 24 px hit area and a hover affordance.
   - Edges are a 1.5 px neutral stroke that turns accent on hover or selection.
   - Condition edges carry labels.
   - Dashes carry exactly one documented meaning (fallback, else or async), explained in a legend.

   [WIG hit targets; TS motivated style]
5. **No overlaps.**
   - A "Tidy up" auto-layout (top-down, dagre- or ELK-style).
   - Collision avoidance on drop.
   - The scout showed the Knowledge Lookup node overlapping Confirm Interest.

   [WIG deliberate alignment; TS]
6. **Palette (left).**
   - A single-column list: icon, full name and a one-line description.
   - Search at the top, focused with `/`.
   - Collapsible groups: Conversation, Logic, Actions, Knowledge & CRM, Hand-off.
   - Click-to-add inserts after the selected node, as the keyboard and touch alternative to dragging.
   - Labels never truncate. The scout showed "Knowle…", "CRM Lo…" and "WhatsA…" at 1440 px. A 2-column grid is acceptable only with tiles at least about 150 px wide and 2-line wrapping.

   [WIG gesture alternatives and content handling]
7. **Inspector (right, 320-400 px).**
   - Node configuration, validation messages and test data all live here. No editing modals.
   - Edits autosave to a draft, with a visible status.

   [TS redesign warning against modals for everything]
8. **Toolbar hierarchy.**

   | Zone | Contents |
   |---|---|
   | Left | Flow name, version picker and save-status text ("Draft · Saved 12:04", "Unsaved changes") |
   | Centre | Undo, redo, tidy and zoom, as named icon buttons with tooltips and shortcut hints |
   | Right | "Test" (secondary), then exactly **one** filled primary, "Activate" or "Publish", which opens a confirmation summarising the version, target number and agent, and impact. Private, Share and rarely used tools move to an overflow menu. |

   Today the toolbar has two adjacent filled primaries (blue Save and green glowing ACTIVATE) plus a tinted AI-draft button. [TS no duplicate CTA; ADM Stripe one filled button per band; WIG confirm]
9. **Validation.**
   - A persistent "Issues (n)" button opens a list. Clicking an issue selects and centres its node.
   - "Flow validated" becomes quiet status text in the toolbar, not a floating pill on the canvas.

   [WIG no dead ends; I2C decorative system markers]
10. **Keyboard.**

    | Key | Action |
    |---|---|
    | Tab | Enter the canvas |
    | Arrows | Move between connected nodes |
    | Enter | Open the inspector |
    | Delete | Remove, with an Undo toast |
    | Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z | Undo, redo |
    | Cmd/Ctrl+D | Duplicate |
    | `?` | Open the shortcut sheet with `<kbd>` keycaps |

    An outline (list) view of the steps serves screen-reader users. [WIG keyboard everywhere, gesture alternatives]
11. **Minimap and zoom.**
    - The minimap shows neutral node rectangles (not saturated category blocks, as today) with an accent viewport frame.
    - It can be toggled and is hidden below 1280 px.
    - Zoom controls show the zoom percentage and a "Fit" action.

    [ADM one accent]
12. **URL state.**
    - `?node=<id>&v=<version>` deep-links the selection and version. The viewport is optional.
    - Back and Forward restore state.

    [WIG deep-link everything]
13. **Saving safety.**
    - `beforeunload` plus a router guard for unsaved changes.
    - Autosaved drafts, with conflict detection if more than one person can edit.

    [WIG]
14. **Performance.**
    - Render only the visible nodes on large graphs.
    - Pan and zoom with transforms.
    - No `getBoundingClientRect` during render.
    - `inert` and `user-select: none` while dragging.
    - Optimistic node moves, with writes under 500 ms.

    [WIG performance]
15. **AI draft.**
    - A secondary action that opens a side sheet: prompt, then a preview diff (added, changed and removed nodes highlighted), then "Apply" or "Discard".
    - The canvas never changes silently.

    [WIG optimistic plus undo; Inf]
16. **Test mode ties the builder to the voice product.**
    - "Test call" runs in a docked bottom panel with the live transcript.
    - The canvas highlights the current node and the edges already traversed.
    - Extracted variables appear in the inspector.

    [Inf]

### 5.9 Marketing site (brief)

- **Hero.** [TS hero discipline]
  - A headline of 2 lines at most, in solid ink.
  - Subtext of 20 words or fewer. Today it is about 36.
  - One primary and one secondary CTA.
  - At most one small supporting element.
  - Move the trust pills to the next section.
- **Real product in the hero.** Replace the orb and waves with a real visual: the flow canvas or a live transcript card. Every ADM system leads with real UI.
- **One brand, one accent.** The marketing CTAs are violet while the app is blue. That reads as two brands. [TS colour lock]
- **Drop the "LIVE · …" eyebrow**, or rewrite it as a plain sentence. It stacks three tells in one line: a decorative dot, a tracked eyebrow and a middle-dot. [TS]
- **Motion stays reduced-motion safe.** Scroll reveals are allowed here only. [WIG; TS]

### 5.10 Strengths to preserve

- **Keyboard-first habits exist.** Leads documents `/`, `J`/`K`, `X`, `A`, `C` and `Esc`, and the canvas hints "press ? for shortcuts". Keep these and present them as `<kbd>` keycaps in a `?` sheet.
- **Call Reports status is not colour-only.** Its badges carry an icon and text, which meets WIG's redundant-cues rule.
- **Call Reports and Assistant set the baseline.** Both use a calm sans, sentence case, and a clean header (title, one-line description, actions on the right). Build the unified header from them.
- **Lists mask phone numbers consistently.**
- **The Assistant empty state works.** It has a clear description, concrete verb-led suggestions and a named side panel with its own empty state.
- **The flow canvas already has the right primitives:** minimap, zoom, node and link counts, undo and redo, validation, version selector and save status. The redesign there is mostly hierarchy and polish, not missing features.
- **The Leads KPI strip** already uses a single bordered row with dividers.

### 5.11 Decisions the redesign owner must make

1. **Brand accent.** Blue (the app) or violet (marketing and the logo gradient)? Only one can win.
2. **Default theme.** Light-first or dark-first? Every reference picks one default and supports the other with parity. Today the app is light and the marketing site is dark.
3. **Letter case.** Sentence case or Title Case? This digest recommends sentence case.
4. **Save in Flow Builder.** Should Save exist at all, or should drafts autosave and Activate/Publish create versions?
5. **Concurrent flow editing.** Who edits flows at the same time? The answer decides whether presence and conflict UI are needed.
6. **Compliance cues.** Which cues must the UI surface (recording disclosure, calling hours, DND/TRAI)?
7. **Sidebar latency.** Is the "22ms" readout meant for customers or for internal operators?
8. **Minimum editing viewport for Flow Builder.** 1024 px is proposed.
