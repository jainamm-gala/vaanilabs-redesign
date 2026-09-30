# Bolchaal: part 2 of 4

Part of `voice.md`. This part covers spacing, shape, icons, charts, motion, signature elements, components and the audit-fix map.

## 4. Spacing and density

**Scale.** 4 px base. Tokens: `space-1` 4, `2` 8, `3` 12, `4` 16, `5` 20, `6` 24, `8` 32, `10` 40, `12` 48, `16` 64. Off-grid values (9, 18, 10, 14) are removed (S1).

| Context | Rule |
|---|---|
| Page gutter | 24 px from 1024 px up; 16 px below 768 px (L2) |
| Page header | 16 px top, 14 px bottom, title block then actions. It is 64 px tall and the same on every page (L1). |
| Panel / card padding | 16 px dense (inspector, Cockpit side), 20 px default, 24 px maximum (S4) |
| Field rhythm | 6 px label to control, 6 px control to help, 16 px between fields, 24 px between groups, 32–48 px between page sections (L3) |
| Control heights | 32 compact (toolbars, table actions, filters), 36 default, 40 form primary, 44 minimum on touch (S2) |
| Table rows | 52 px default (two-line lead cell), 44 px compact, 36 px dense. Cell padding 12 px, first cell 24 px (S3). |
| Transcript turns | 10 px vertical padding, 44 px timestamp column, 12 px gap |
| Flow canvas | 20 px dot grid; snap 8 px; 48 px vertical gap between ranks, 28 px horizontal |
| Reading width | Settings, Billing and Knowledge cap at 1280 px. Tables, canvas and Cockpit are full-bleed (F-VIS-034). |

**Density by surface** (S5):
- Dense, for scanning and comparing: Leads, Call Reports, Analytics tables, flow palette.
- Default: Cockpit, Flow inspector, Assistant.
- Calm, for setup: Settings, Billing, onboarding, which use 40 px controls and 24 px group gaps.

A per-user "Compact rows" toggle in table view options switches 52 to 44 px.

## 5. Radius, elevation, borders

**Philosophy.** Hairlines and a surface ladder do the work; shadows are rare and small. Shape follows meaning. Rectangles hold work and data. **Capsules mark boundaries and state**: status pills, filter chips, flow triggers and outcomes, the call-state pill. This one rule gives the Flow Designer its grammar (see part 4).

| Token | px | Used for |
|---|---|---|
| `r-xs` | 4 | Keycaps, script-chip glyph box, checkbox |
| `r-sm` | 6 | Buttons, inputs, nav items, script chips, segmented items |
| `r-md` | 8 | Flow nodes (work), menus, popovers, KPI strip, segmented track |
| `r-lg` | 12 | Cards, panels, dialogs, main content panel (10 when inset in the shell) |
| `r-xl` | 16 | Sheets, large marketing cards (maximum) |
| `r-full` | 9999 | Status badges, filter chips, call-state pill, flow trigger and outcome capsules, avatars |

- Nested radii are concentric: child radius = parent radius minus the padding between them.
- The 12 radii in use today become 6 (F-VIS-016).

**Elevation.** Light theme only. In dark, depth comes from the surface ladder alone.

| Level | Value (light) | Used for |
|---|---|---|
| `e0` | none, 1 px `border` | Default for cards and panels |
| `e1` | `0 1px 2px rgba(44,40,35,.06)` | Flow nodes, secondary buttons, active nav item, segmented "on" |
| `e2` | `0 1px 1px rgba(44,40,35,.03), 0 4px 10px -2px rgba(44,40,35,.08)` | Selected node, popovers, menus, toasts |
| `e3` | `0 1px 1px …03, 0 8px 16px -4px …09, 0 24px 40px -8px …12` | Dialogs, sheets, bulk bar |

- Shadows are warm-tinted (the ink hue), never pure black, and never glows.
- In dark, only `e3` exists: `0 16px 40px -8px rgba(0,0,0,.5)`, for overlays.

**Borders.** Always 1 px. There is no 2 px border except the focus ring and the selected-node outline, both in `accent`. Borders use three steps (`border`, `border-strong`, `border-control`); all 42 border colours in use today map onto these (F-VIS-020). Dashed borders mean exactly two things: an unconnected required port, and a fallback or timeout edge.

**Named z-index** (K12): base 0, sticky 10, dropdown 20, banner 30, overlay 40, modal 50, toast 60, tooltip 70. Nothing uses 9999.

## 6. Iconography

- **Lucide only**, outline, 1.5 px stroke, round caps. Sizes: 16 in controls and tables, 20 in navigation and the bottom bar, 14 in dense meta and badges (12 inside 22 px badges). The 22 sizes in use today become 4 (F-VIS-031, K11).
- Icons inherit `currentColor`. Only three places colour an icon: the active nav item (accent), flow category tiles, and semantic badges.
- **Source badges** use real icons (WhatsApp, Facebook, Google, Upload, API) with a text label, replacing the letter glyphs "F", "IG" and "{}". No emoji anywhere (F-VIS-031).
- The `↗` icon appears only on links that leave the product (F-UX-027, F-A11Y-030).
- **Custom glyphs** (3): the voice meter (three 2 px bars at heights 6/12/8), the logo mark (the voice meter on an ink tile) and the script glyphs, which are typography, not icons.
- **Flow category icons:**
  - Trigger: `phone-incoming`, `phone-outgoing`, `code`, `calendar-clock`
  - Logic: `message-circle-question`, `git-fork`, `shield-check`
  - Action: `message-square-text` (Say), `book-open`, `database`, `calendar`, `message-circle` (WhatsApp), `headset` (transfer)
  - Outcome: `flag`, `clock`, `x`, `phone-missed`
- **Every icon-only button** has an `aria-label` and a tooltip showing the shortcut as `<kbd>` (A2).

## 7. Data visualisation

- **Palette:** the separate chart palette from part 1, 3.6. Brand chrome colours never double as series.
- **Marks:** 2 px lines; bars with 2 px top radius; 1 px `border` gridlines, horizontal only. Axis labels in `caption` `text-3` with tabular figures. No hatch fills, dot grids or HUD brackets (F-VIS-022).
- **KPIs:** one bordered strip. Label in `caption-m` `text-3`, numeral in Anek `kpi`, delta stated in words ("+12 vs previous 7 days") in success or danger text by meaning. Sparklines only with 7 or more points; otherwise "Not enough data yet" (digest 5.7 #12).
- **Sentiment:** always icon, label and colour, with the score as a tabular number plus a 4 px bar. Stacked-area sentiment becomes a 100% stacked bar per day with direct labels (F-VIS-012).
- **Conversation analytics use the signature S1.** Talk ratio, interruptions and silence render as conversation lines in Call Reports rows and in an Analytics "Call shape" panel showing a median call per flow.
- **Funnel per flow:** in the Flow Designer's optional "Performance" overlay, each node shows reach % and branch split as a thin bar under the ports (F-FLOW-017 #5).
- **Empty and error states** have one sentence and an action, never a chart of 24 empty cells.

## 8. Motion

**Character:** still until something speaks. Motion confirms cause and effect and never performs.

| Token | Value | Use |
|---|---|---|
| `dur-1` | 120 ms | Hover, press, colour changes, partial-to-final transcript text |
| `dur-2` | 180 ms | Menus, popovers, tooltips, row insert |
| `dur-3` | 240 ms | Sheets, inspector, dialogs, toasts |
| `ease-out` | `cubic-bezier(.16,1,.3,1)` | Enter and exit |
| `ease-drawer` | `cubic-bezier(.32,.72,0,1)` | Sheets and inspector |

- Animate `transform` and `opacity` only. Never `transition: all` (M3). No hover lift and no glow on primary buttons.
- **Voice meter.** Bar heights map to smoothed audio RMS, sampled at about 15 Hz, with a 120 ms attack and 250 ms release. It is animated only in the `live` state and when a recording is playing.
- **Conversation line.** New turn segments grow from their start at `dur-2`. The now-marker moves continuously only while live.
- **Flow canvas.** No edge animation at rest. During a test call the traversed edge draws once in accent (`dur-3`) and the current node shows a static "Running" chip containing the voice meter. Pan and zoom use transforms (M6).
- **Reduced motion.** All of the above become instant; the meter shows static bars. There are no infinite loops anywhere (F-A11Y-022).
- **Page loads:** no entrance animation. Skeletons appear after 200 ms and stay at least 400 ms (Q3).

## 9. Signature elements (three)

Each one carries data, replaces something the audit found noisy, and has a strict "never" rule.

### S1. The conversation line
- **What.** A 20 px bar with two 6 px lanes inside a `surface-2` track: the agent (Vaani, `lane-agent` peacock) on top, the caller (`lane-human`) below. Segments are diarised turns positioned by time. Overlaps (barge-in) show as segments in both lanes at the same x. A caller partial turn is drawn at 45% opacity. A 2 px `text` now-marker shows while live.
- **Mini variant.** 96 × 12 px with 3 px lanes, for table cells.
- **Data.** Turn start and end times per speaker from the call record; talk-ratio and interruption count are derived.
- **Accessibility.** `role="img"` with a summary label ("Conversation so far: Vaani 58 percent, caller 42 percent, 9 turns, 1 interruption"). In the recording player it becomes a slider (`role="slider"`) that seeks with the arrow keys (±5 s) (A7).
- **Where it appears.** Cockpit live card (with time ticks and legend); Call Reports rows (mini) and the recording scrubber in call detail; the Leads "Last call" column (mini); the Flow Designer test panel; the Analytics "Call shape" panel.
- **Never:** as decoration, on marketing hero backgrounds, animated when idle, or with fake data.

### S2. The voice meter
- **What.** Three 2 px rounded bars (heights 6/12/8 at rest) in `currentColor`. It is also the logo mark (static, on an ink tile), so the brand mark and the live indicator are the same shape.
- **States.** Static (rest), live (moves with audio), muted (bars at 2 px plus a "Muted" label).
- **Where it appears.** Inside the `Live` call-state pill (Cockpit, Rep Console, Meeting room); the sidebar Cockpit item ("2 live") and the phone bottom-bar badge; a node's "Running" chip during a test call; the Assistant voice mode "Listening" state; the logo.
- **Replaces** every decorative status dot: "Canvas", "FLOW VALIDATED", "CUSTOMER INTEL", "TRANSCRIPT FEED", "SYS: ONLINE" and the marketing "LIVE" eyebrow (anti-pattern #7, F-UX-018).
- **Never:** animated without real audio, used as a loading spinner, or larger than 16 px in the product UI.

### S3. Script chips
- **What.** A 24 px chip: an 18 px glyph box (`surface-3`, `r-xs`, Anek 600 12 px) holding the script's first letter, followed by the language name in `caption-m`.
  - Glyphs: अ Hindi, म Marathi, த Tamil, తె Telugu, ব Bengali, ગ Gujarati, ಕ Kannada, മ Malayalam, ਪ Punjabi, A English.
  - Code-switching shows as two glyphs, for example **अA** Hinglish.
  - The "bare" variant (glyph box only, with `aria-label`) is for dense places such as transcript turns and node headers.
  - Selected: `accent-soft` fill, `accent-border` outline.
- **Where it appears.** Leads language column and filter; the lead drawer and call dialog (agent voice and language); transcript turns (per turn, from language ID, with `lang` set on the text); flow settings, step language and node headers; Call Reports and Analytics language breakdowns; Knowledge document language.
- **Replaces** "HINDI / EN" mono uppercase fields, the 6-option text-only language select, and "AUTO-DETECT" chips.
- **Never:** as a flag, as decoration, or for UI-locale switching (that uses the language name in its own script, in a menu).

## 10. Components (implementation summary)

A primitives library is added: Radix UI primitives styled with these tokens (shadcn-style source components), because none exists today (audit 2.1). Every overlay gets focus trap, Esc, focus return and `overscroll-behavior: contain` (K9, F-A11Y-005).

| Component | Spec |
|---|---|
| **Button** | One CVA component with variants `primary`, `secondary`, `ghost`, `danger` (outline), `danger-solid` (only inside confirmations) and sizes 32/36/40 (44 on touch), `r-sm`, label 14/500 (13/500 at 32). Hover changes background only. Focus: 2 px accent, offset 2. Disabled: `surface-2` fill and `text-disabled`, with the reason shown next to it (K2). Loading: spinner plus a verb ending in "…" ("Placing call…"). Replaces 3 systems and 80 styles (F-VIS-006). |
| **Input** | 36 px (40 in forms), 1 px `border-control` (3:1), `r-sm`, 14 px (16 px on touch). Label above in 13/500 `text-2`; help or error below in 12 px, errors with an icon. Focus: accent border plus 2 px ring. `tel` fields have a mono `+91` prefix segment. Replaces 12 styles (F-VIS-018). |
| **Select / Combobox** | Same frame as Input; Radix Select or cmdk. Flow pickers show "Name · v6 · live" (F-UX-005). |
| **Badge** | 22 px pill, 12/500, soft semantic fill, 12 px icon when it is a state. At most one per cell. Variants: neutral, outline, accent, success, warning, danger. Replaces 20 styles (F-VIS-017). |
| **Call-state pill** | 28 px capsule with an icon or voice meter, label and mono timer. Six states (see part 3). `role="status"`. |
| **Tabs** | Underline, 14/500, 2 px accent indicator, URL-synced. |
| **Segmented** | `surface-2` track, raised `surface` item with `e1`; counts in `text-3` tabular figures. |
| **Checkbox / toggle** | 16 px box with a 24 px hit area; the toggle is 32 × 20. Both use `border-control` when off and accent when on, with `aria-checked`. |
| **Keycap** | 20 px, 11 px mono, 1 px `border-strong` with a 2 px bottom border. Shown in tooltips, menus and the `?` sheet, never as a permanent strip (K7). |
| **Table** | Semantic `<table>`, sticky 36 px header (12/500 sentence case), right-aligned numerics, row hover `surface-2`, selected rows accent-soft at 70%, keyboard row focus as a 2 px inset accent bar. Rows are links or buttons (F-A11Y-010, F-A11Y-018). |
| **Toast** | Ink tile, 14 px, with an Undo action. Used only for transient success or undo (K10), and announced politely. |
| **Dialog** | `r-lg`, `e3`, 480 px (640 for review dialogs). The paid-action confirmation is a pattern of its own: dl rows (who, flow, agent, calling hours, estimated cost versus balance), a ghost Cancel and a primary verb with a count ("Call 2 leads"). |
| **Sheet / inspector** | Right side, 328–400 px, `ease-drawer`; the editing surface for leads, nodes and call detail (K9). |
| **Empty state** | One sentence, one action, an optional doc link, and no illustration. The Cockpit empty transcript reads "Transcript appears here when the call connects" (Q2). |

## 11. How Bolchaal fixes the audit's top issues

| # | Finding | Fix in this direction |
|---|---|---|
| 1 | F-FLOW-001 autosave into the live flow; silent Backspace delete | Draft/published revisions. Header shows `Live v6` + `Draft · 3 changes`; **Publish…** opens a diff-and-validation sheet. Delete gives an Undo toast naming the step and its connections. |
| 2 | F-UX-001 org setup dead end | Setup checklist page modelled on the Calling-number stepper. Integration cards say which step unlocks them and link to it (part 3, 12.4). |
| 3 | F-QA-001 contradictory /about claims | Marketing follows principle 4: claims render from one source-of-truth block shared with /security. This is a content fix; the design supplies the trust-block component. |
| 4 | F-A11Y-001 / F-FLOW-006 keyboard-inaccessible canvas, 9 px handles | Nodes are focusable in graph order, arrow keys follow edges, Enter opens the inspector, `C` opens Connect…. Ports are 24 px labelled tabs. A list outline view is always available (part 4). |
| 5 | F-A11Y-002 Call Reports mouse-only | Rows are real links; detail opens as a focused sheet with the transcript first and the conversation line as a keyboard slider. |
| 6 | F-QA-002 writes on open; "Up to date" on failure | Dirty flag only on user edits. Save chip state machine: Saved · 12:04, Unsaved, Saving…, Couldn't save · Retry. |
| 7 | F-FLOW-004 "FLOW VALIDATED" on invalid flows | No validated badge. A live "1 warning / 2 errors" button, issue badges on nodes, dashed amber open ports. Publish is disabled while errors exist, with the reason inline. |
| 8 | F-A11Y-004 `c` places a billable call | `C` opens the paid-action confirmation. Single-key shortcuts can be turned off in the `?` sheet. |
| 9 | F-QA-005 only 50 of 121 calls | Server pagination and a count in the header description ("121 calls"). Filters in the URL (F-UX-031). |
| 10 | F-QA-006 double-counted test legs | The Call Reports row model groups legs as one call with a "Test" badge. Metrics count calls, not legs. |
| 11 | F-UX-002 wallet Top up opens Profile | Wallet lives in the sidebar footer (phone: header chip); "Top up in Billing" deep-links to `/billing#top-up`. The low-balance amber banner appears only where calling is blocked. |
| 12 | F-UX-006 "You're live" falsely | Onboarding ends with a readiness card (number, wallet, flow published, test call passed) and says "Ready to call" only when all pass. |
| 13 | F-QA-010 /signup lands on sign-in | Auth uses the same shell and type. "Get started" goes to a real Create-account step or states "Request access". Copy is truthful (principle 4). |
| 14 | F-RWD-001 phone nav reaches 6 of 12 | Bottom bar: Cockpit, Leads, Reports, Assistant, More. More opens a sheet with all 12 destinations grouped, plus account and sign-out. Sign-out never takes a tab. |
| 15 | F-A11Y-008 / F-A11Y-009 contrast | Every token is contrast-checked (part 1): muted text 5.4:1, white on peacock 6.0:1, dark ink on dark-mode peacock 8.3:1. Nothing below 12 px. |

Also fixed:
- F-VIS-001: one dialect.
- F-VIS-005: one page header.
- F-VIS-029, F-UX-026: no idle orb, and a single Place call primary.
- F-UX-017: one name per destination, used in the sidebar, the page title and the bottom bar.
- F-UX-018: truthful status.
- F-A11Y-022: reduced motion.

Continue in `voice.part3.md`.
