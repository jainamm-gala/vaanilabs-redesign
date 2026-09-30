# Direction: Bolchaal (voice-native identity)

**Name:** Bolchaal (बोलचाल, Hindi for everyday spoken language)
**Essence:** Conversation is the interface: a calm ink-on-khadi workspace where colour and motion belong only to the voice.
**Visual specimen:** `spec/directions/voice.html` (renders: `voice-light.png`, `voice-dark.png`, `voice-mobile.png`)

This direction builds an ownable identity from what Vaani Labs actually is (voice, conversation, India, many languages) and applies it with restraint. The product chrome stays quiet and neutral. The identity lives in one accent with a fixed meaning, one typographic voice for titles and numerals, and three small signature devices that each carry real data. Nothing in it is decorative.

**Document parts** (each file is part of this one spec):

| Part | File | Contents |
|---|---|---|
| 1 | `voice.md` (this file) | At a glance, principles, typography, colour |
| 2 | `voice.part2.md` | Spacing and density, radius, elevation, borders, iconography, data-viz, motion, signature elements, components, how the audit's top issues are fixed |
| 3 | `voice.part3.md` | App shell and IA across four breakpoints, Agent Cockpit, Leads table (with ASCII wireframes) |
| 4 | `voice.part4.md` | Flow Designer (Trigger → Logic → Action → Outcome), risks and trade-offs, open decisions, token appendix |

Finding IDs (F-UX, F-VIS, F-FLOW, F-RWD, F-A11Y, F-QA) refer to `audit/consolidated/03*`. Rule IDs (T3, C2, K9…) refer to `audit/consolidated/05-design-guidance-digest`.

---

## 0. At a glance

**Keeps** (audit section 4 strengths): the semantic token layer on Tailwind v4 `@theme`; Hanken Grotesk (already `--font-sans` and the marketing face); Lucide; the 4 px grid and 8 px radius habit; the phone mask `+91 ••••• •NNNN`; the Call Reports / Assistant page template (title, one-line description, actions right); the Flow Builder's labelled toolbar, polite live region, Validate → Jump and Preview AI script; the Leads keyboard model (minus the single-key call); the Calling-number stepper; Personal Agent autonomy levels; Delete Account safeguards.

**Changes:**
- One accent, **peacock** (`#006c85` light, `#65bcd3` dark), with the same hue in both themes. It replaces the blue/violet swap, teal secondaries, violet Meeting Agent and green ACTIVATE (F-VIS-004, C2).
- A barely warm **khadi** neutral ramp replaces the cool slate ramp; every text token passes AA, including muted text (F-A11Y-008).
- Three families with strict roles: **Anek** (display, and all Indian scripts), **Hanken Grotesk** (interface), **JetBrains Mono** (tokens only). Sora, Instrument Serif, Syne, Rajdhani, Inter, DM Sans and Geist are retired (F-VIS-002, F-VIS-008, T1).
- Three signature elements: the **conversation line**, the **voice meter** and **script chips**.
- A **shape grammar** for the Flow Designer: capsules enter and exit, rectangles do work, category colour only in the icon tile.
- Truthful state everywhere: draft and live flow versions, a save state machine, live validation, one call-state machine, and a real wallet state.

**Decisions this direction takes** (from digest 5.11):

| Open decision | Bolchaal's answer |
|---|---|
| Brand accent: blue or violet? | Neither. Peacock, which is ownable, is not the generic AI blue/violet, and continues the codebase's own `--peacock` token name. |
| Default theme | Light by default, with full dark parity and a third "Match system" option. Marketing moves to the same light-first system, with dark sections allowed. |
| Letter case | Sentence case everywhere. |
| Save in Flow Builder | No Save button. Edits autosave to a draft; **Publish…** creates a numbered live version. |
| Minimum editing viewport for flows | 1024 px. Below that the flow is a read-only outline with Test call. |
| Sidebar latency readout | Removed. Latency appears only during a call, with a qualitative label. |

---

## 1. Design principles

### 1. Only the voice moves
Live colour and motion appear only while audio is flowing (a live call, a playing recording, a test run). Idle screens are completely still.
- Remove the 320 px STANDBY ring and every idle loop: 36 `@keyframes` today, marching-ants edges, and the pulsing FLOW VALIDATED dot (F-VIS-029, F-FLOW-011, F-A11Y-022, M5).
- The voice meter is driven by audio RMS. The conversation line grows only when a diarised turn arrives.
- Under `prefers-reduced-motion`, bars are static and the word "Live" plus the timer carry the state.
- The only non-audio motion allowed is state transitions of 120–240 ms (menus, sheets, row insert, toast).

### 2. Peacock means Vaani
The accent has one meaning: the agent and the actions you take with it. It is used for:
- the one filled primary per region, the focus ring, selection, links, the active nav icon;
- the agent's lane in the conversation line and the agent's speaker label in transcripts;
- Action tiles in the Flow Designer.

It is **never** used for gradients, decorative fills, marketing text effects, status (status uses semantic colours) or chart series (charts have their own `--chart-1`, which is deliberately a different, lighter peacock).

### 3. Speak India natively
Indian languages, formats and calling norms are designed in, not translated in.
- Languages appear as script chips (अ Hindi, த Tamil, తె Telugu, ব Bengali, A English, अA Hinglish).
- Every transcript turn carries `lang`. Devanagari is set in Anek Devanagari at line-height 1.7 (T7, A9).
- Money uses `Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'})`: ₹85,00,000, with an optional "85 lakh" helper (P6).
- Phone fields have a fixed `+91` prefix, `type="tel"`, and E.164 validation (F1, F-UX-025).
- Schedules show IST explicitly. Campaigns and flow triggers show calling hours and DND status (digest 5.7 #10).
- Agent, flow and brand names get `translate="no"`.

### 4. Say only what is true
Every status comes from a real state machine, or it is not shown.
- The flow header shows `Live v6` and `Draft · 3 changes` separately. The save chip moves between Saved, Unsaved, Saving… and Couldn't save · Retry (F-FLOW-001, F-FLOW-003).
- The validation count is recomputed on every graph change. There is no permanent "validated" badge (F-FLOW-004).
- Remove "SYS: ONLINE", idle "LAT 0ms" and the sidebar "22ms" (F-UX-018). Onboarding never says "You're live" until a call can actually be placed (F-UX-006).
- Cockpit context never mixes demo data with a real lead (F-UX-003). Call counts de-duplicate browser test legs before any metric is shown (F-QA-006).

### 5. Every call has a cost
Anything that dials a real person first shows who and how many, which flow and version, which voice and language, whether it is inside calling hours, and the estimated cost against the balance. Then it asks.
- The single-key `C` on Leads no longer dials. `C` opens the call confirmation (F-A11Y-004, F-UX-013).
- Bulk calling always goes through **Review and call…** (F-UX-013).
- Test calls run the **draft** and are labelled "Test"; live calls run the published version (F-FLOW-016).
- The Assistant asks before any side effect, using the Personal Agent autonomy model (F-UX-022).

### 6. Calm chrome, dense data
The chrome is quiet so the data can be dense.
- Sentence case. No mono uppercase tracked labels, no § numerals, no serif kickers, no textures behind data (F-VIS-001, F-VIS-010, F-VIS-022).
- Anek appears only in page titles and KPI numerals. Everything else is Hanken.
- Tables use 52 px rows (44 compact, 36 dense), and KPI rows are one bordered strip (L4, S3).
- No box-in-box nesting (F-VIS-016).

### 7. Every hand reaches everything
Keyboard, screen reader, touch and 200% zoom reach every task, including the two that are mouse-only today: building a flow and reading a call (F-A11Y-001, F-A11Y-002).
- Visible 2 px peacock focus everywhere, with at least 3:1 contrast.
- Targets are 24 px minimum on desktop and 44 px on touch.
- The flow has a list outline view. The phone bottom bar reaches all 12 destinations through More (F-RWD-001).

---

## 2. Typography

### 2.1 Families and roles

| Role | Family (Google Fonts, free) | Weights / axes | Used for | Never used for |
|---|---|---|---|---|
| **Display: the voice** | **Anek Latin** (Ek Type, Mumbai) | 600; `wdth` 112 | Page titles (h1), KPI numerals, wallet balance, marketing display, empty-state titles on first-run pages | Body, labels, buttons, tables, anything under 18 px |
| **Interface** | **Hanken Grotesk** | 400, 500, 600 | Everything at 18 px and below: body, labels, buttons, nav, tables, forms, transcripts | Display above 24 px |
| **Indian scripts** | **Anek Devanagari**, Anek Tamil, Anek Telugu, Anek Bangla (plus Gujarati, Kannada, Malayalam, Gurmukhi and Odia when a script appears) | 400, 500, 600 | Any Indic text at any size, through the font stack's `unicode-range` fallback | n/a |
| **Tokens** | **JetBrains Mono** | 400, 500; tabular | Masked phone numbers, IDs, timers and durations in live UI, `{{variables}}`, API keys, code, keycaps | Labels, headings, buttons, badges, body copy |

**Why Anek?** It is one superfamily drawn across Latin and ten Indian scripts with shared proportions. A Hindi turn and an English turn therefore sound like the same voice, which is literally the product's promise ("the voice AI that speaks India"). At `wdth` 112 and weight 600 its squarish, confident Latin gives the brand a recognisable typographic voice without resorting to decoration. Using it only at 18 px and above avoids its quirks at small UI sizes.

**Why keep Hanken?** It is already the shipped `--font-sans` and the marketing face (audit strength). It is crisp at 13–14 px, has tabular figures, and is neutral enough for dense tables.

**Why only three families?** The Indic fallback family is needed anyway: the digest asks for a Devanagari sans (T1). Choosing Anek for that job, and reusing its Latin for display, adds no extra family.

### 2.2 Stacks and loading

```css
--font-ui: "Hanken Grotesk","Anek Devanagari","Anek Tamil","Anek Telugu","Anek Bangla",system-ui,sans-serif;
--font-display: "Anek Latin","Anek Devanagari","Hanken Grotesk",system-ui,sans-serif;
--font-mono: "JetBrains Mono",ui-monospace,"Cascadia Mono",monospace;
```

- Load with `next/font/google`: Anek Latin (variable, `wdth` axis, `latin` subset), Anek Devanagari (`devanagari` subset), Hanken Grotesk 400/500/600, and JetBrains Mono 400/500 (`latin`). Other Anek scripts load with `preload:false`; `unicode-range` fetches them only when that script appears.
- **Fix F-VIS-008.** Put the `next/font` variable classes on `<html>`, not `<body>`, so `--font-sans` resolves at `:root` and nothing falls back to `ui-sans-serif` (T2).
- Set `font-stretch: 112%` on display roles. Never synthesise bold: load real 600 faces.

### 2.3 Type scale

All sizes are px (line-height in px). Tracking is in em. Weights are 400, 500 and 600 only (600 is the ceiling).

| Token | Family | Size / LH | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display-xl` | Anek, wdth 112 | 56 / 60 (mobile 40 / 44) | 600 | -0.025 | Marketing hero only |
| `display` | Anek, wdth 112 | 40 / 44 (mobile 32 / 36) | 600 | -0.02 | Marketing sections, onboarding step titles |
| `title-1` (h1) | Anek, wdth 112 | 24 / 32 (mobile 22 / 28) | 600 | -0.012 | Page title, once per page, identical on every page |
| `kpi` | Anek, wdth 112 | 28 / 32 | 600 | -0.01 | KPI strip numerals (lining figures) |
| `kpi-s` | Anek, wdth 112 | 18 / 24 | 600 | -0.005 | Sidebar wallet balance, stat cells in panels |
| `title-2` (h2) | Hanken | 18 / 26 | 600 | -0.01 | Section titles inside a page |
| `title-3` (h3) | Hanken | 16 / 24 | 600 | -0.005 | Panel, dialog and inspector titles |
| `body-l` | Hanken | 15 / 24 | 400 | 0 | Transcripts, Knowledge reading, Assistant replies |
| `body` | Hanken | 14 / 20 | 400 | 0 | App default |
| `label` | Hanken | 14 / 20 | 500 | 0 | Buttons, nav items, tabs, lead names |
| `small` | Hanken | 13 / 18 | 400 or 500 | 0 | Table cells, field labels (500), meta |
| `caption` | Hanken | 12 / 16 | 400 or 500 | 0 | Helper text, timestamps, table headers (500), badges (500) |
| `mono` | JetBrains Mono | 12 / 16 (13 / 20 inside inputs) | 400 or 500 | 0 | Tokens (see 2.4) |
| `deva-l` | Anek Devanagari | 15 / 26 | 400 | 0 | Hindi transcript turns |
| `deva` | Anek Devanagari | 14 / 24 | 400 | 0 | Hindi body text |

This is 11 Latin roles, replacing 16 rendered sizes, 30 trackings and 84 text styles (F-VIS-002). **Nothing renders below 12 px.** On the flow canvas, node text is counter-scaled so it never drops below 12 px on screen (F-FLOW-008).

### 2.4 Rules

- **Mono is allowed only for:** masked phone numbers, E.164 inputs, call and flow IDs, live timers (`01:27`), durations in live UI, `{{variables}}`, API keys, webhook secrets, code, and keycaps. Never for labels, headings, buttons, badges or explanatory text (T5, and the "terminal/HUD" dialect in F-VIS-001).
- **Uppercase is allowed only for** acronyms as written (UPI, CRM, DND, API, IST) and keycap glyphs. Table headers are sentence case at 12/500. No `text-transform: uppercase` anywhere in the app.
- **Tracking.** Negative tracking only at 20 px and above. Never positive. Never any tracking on Indic scripts, because it breaks conjuncts.
- **Figures.** `font-variant-numeric: tabular-nums` on every number that changes or is compared: timers, amounts, counts, scores, percentages, table numerics (T6). KPI numerals use Anek's lining figures.
- **Numbers and formats.** Rupees via `Intl` with `en-IN` grouping: 2 decimals for wallet, 0 for KPIs. Dates via `Intl` in one format per context: "Today 11:42", "22 Sep", "22 Sep 2026, 11:42 IST" (fixes F-VIS-024). Non-breaking space before units (`90 s`).
- **Wrapping.** `text-wrap: balance` on titles and `pretty` on short paragraphs. Truncate with an ellipsis and a tooltip for the full value (F-VIS-013). Middle-truncate flow names that end in a version.
- **Measure.** Reading text is capped at 72 ch (Knowledge, Assistant, docs).
- **Copy register.** Sentence case, second person, no em-dashes in chrome, no exclamation marks, "…" for in-progress states and for actions that open a further step (P1–P9).

---

## 3. Colour

### 3.1 Rationale

- **Neutrals: khadi.** The ramp sits at OKLCH hue 75 with chroma under 0.01, which reads as paper and ink, not beige. It sets Vaani apart from the cool slate greys of most SaaS products (and from Vercel and Linear), and it gives the cool accent a complementary ground. One ramp is used in both themes. Warm and cool greys are never mixed (C1).
- **Accent: peacock** (OKLCH 0.49 / 0.095 / 219 in light).
  - The peacock is India's national bird, so the colour is Indian without being political. Saffron, which the legacy `--saffron` token name hints at, carries political and religious associations in India.
  - It is clearly not the generic AI palette: hue 219, against 265 for today's blue and about 285 for violet.
  - White on it reaches 6.0:1.
  - It keeps one hue across light and dark. Only the lightness changes, which fixes F-VIS-004.
  - The team already named a token `--peacock`, so the name continues.
- **Semantics** are reserved for real state (C3). Success is a leaf green at hue 152, clearly separated from peacock's 219. Amber is for waiting and low balance. Red is for failed, negative and destructive.

### 3.2 Neutral ramp, surfaces and borders

| Token | Light | Dark | Role | Contrast (light / dark) |
|---|---|---|---|---|
| `canvas` | `#fbf9f6` | `#0f0e0c` | Page background, canvas, sidebar | n/a |
| `surface` | `#ffffff` | `#171614` | Main panel, cards, inputs, nodes | n/a |
| `surface-2` | `#f4f2ef` | `#201e1b` | Hover rows, insets, segmented track, conversation-line track | n/a |
| `surface-3` | `#ece9e5` | `#2a2724` | Pressed, neutral badge fill, avatar | n/a |
| `border` | `#e5e1dd` | `#2c2a26` | Hairlines and dividers (decorative) | 1.3:1 on white |
| `border-strong` | `#c1bdb8` | `#403d39` | Secondary buttons, node frames, chips | 1.9:1 |
| `border-control` | `#928e89` | `#6c6863` | Input borders, checkboxes, flow edges | **3.25:1 / 3.3:1** (meets 1.4.11) |
| `text` | `#1c1915` | `#f2f0ed` | Primary text | 17.5 / 17.0 |
| `text-2` | `#504c48` | `#c1bdb8` | Secondary text, field labels | 8.5 / 10.3 |
| `text-3` | `#6d6a65` | `#9f9b95` | Muted text, helper, table headers | **5.4 (4.8 on surface-2) / 7.0 (6.5 on surface)** |
| `text-disabled` | `#a7a4a0` | `#605d5a` | Disabled only, never for information | 2.5 / 3.0 |

Muted text now passes AA on every surface. Today `#7A8397` fails at 3.36–3.8:1 (F-A11Y-008).

### 3.3 Accent

| Token | Light | Dark | Contrast |
|---|---|---|---|
| `accent` | `#006c85` | `#65bcd3` | Light: white on it 6.0:1, as text 6.0:1 on white. Dark: 8.9:1 on canvas. |
| `accent-hover` | `#005b71` | `#7bd3e9` | White on it 7.7:1 |
| `on-accent` | `#ffffff` | `#04191f` | Dark: 8.3:1 on accent. Fixes black on blue at 3.27–3.83:1 (F-A11Y-009). |
| `accent-soft` | `#e0f4f9` | `#0e2d36` | Selected rows, info badges, ports on the selected path |
| `accent-text` | `#006077` | `#74cde2` | 6.3:1 on accent-soft light, 8.0:1 dark. Links and agent speaker labels. |
| `accent-border` | `#a0cdd9` | `#205563` | Selected chip and port borders |
| `focus` | = `accent` | = `accent` | 2 px ring with 2 px offset. 5.7:1 on canvas light, 8.3:1 on surface dark. |

### 3.4 Semantic colours

| State | Solid (light / dark) | Label on solid | Soft background | Text on soft |
|---|---|---|---|---|
| Success (live, connected, converted) | `#1a763f` / `#63ca84` | white 5.7:1 / ink 8.9:1 | `#e0f7e5` / `#172c1d` | `#0a562b` 7.8:1 / `#86db9d` 8.9:1 |
| Warning (ringing, low balance, draft, callback due) | `#e4a339` / `#ebb353` | ink `#231a06` 7.9:1 / 9.1:1 | `#fff1d1` / `#342611` | `#7d460b` 6.8:1 / `#f4c677` 9.2:1 |
| Danger (failed, negative, destructive) | `#b6322d` / `#ed756e` | white 6.0:1 / ink `#1a0a08` 6.8:1 | `#ffeae8` / `#3e1e1c` | `#9e2320` 6.7:1 / `#fb9890` 7.1:1 |
| Info | = accent | | = accent-soft | = accent-text |

There is one red, replacing today's four (F-VIS-020). Status is never shown by colour alone: every state has an icon and a label (A4).

### 3.5 Role colours (identity, not state)

| Token | Light | Dark | Where |
|---|---|---|---|
| `ink-tile` / `on-ink` | `#2c2823` / `#fbf9f6` | `#403c37` / `#f2f0ed` | Trigger tiles, logo mark, bulk bar, toasts (13.9:1 / 9.6:1) |
| `jamun` / `jamun-soft` | `#79466f` / `#f9ebf6` | `#cf95c1` / `#32232f` | Logic tiles only (6.3:1 / 6.2:1). A muted plum, not violet. |
| `lane-agent` | = accent | = accent | Agent lane of the conversation line (5.4:1 on the track) |
| `lane-human` | `#8a8580` | `#847f7a` | Caller lane (3.3:1 / 4.2:1 on the track, meets 1.4.11) |
| `edge` | `#928e89` | `#6c6863` | Flow edges, 1.5 px (3.1:1 / 3.5:1 on canvas) |
| `dot` | `#d6d2cd` | `#2f2c29` | Canvas dot grid (decorative, 20 px pitch) |

### 3.6 Chart palette (separate from chrome, C7)

| | 1 Peacock | 2 Marigold | 3 Jamun | 4 Leaf | 5 Clay | 6 Indigo |
|---|---|---|---|---|---|---|
| Light | `#0084a4` | `#c48225` | `#a2568a` | `#548436` | `#ae593a` | `#596fbb` |
| Dark | `#49bbda` | `#d79e59` | `#d98fc1` | `#8cbb73` | `#e69275` | `#90a7f1` |

- All six are at least 3:1 on the surface (light 3.2–4.96, dark 7.45–8.16). The order maximises hue distance for colour-blind safety.
- **Sequential:** `#b1f4ff` `#8bd0e5` `#62aac0` `#37869b` `#006378` `#00475c`.
- Sentiment charts use the semantic trio with icons and labels. Up/down deltas are text-coloured by meaning, not direction (F-VIS-011).

Continue in `voice.part2.md`.
