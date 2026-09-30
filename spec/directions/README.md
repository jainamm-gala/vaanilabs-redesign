# Design directions: what was explored and what was decided

Three competing directions were written for the Vaani Labs redesign. Each one came with a spec, a self-contained HTML specimen and renders in light, dark and mobile. Three judges scored them, each through a different lens:
- **Taste:** identity, craft and premium feel
- **Product:** workflows, the audit's journeys and operator reality
- **Build:** tokens, contrast, migration cost and implementability

**Decision:** the final direction is **Sutradhar**. It is built on Switchboard's system and grafts the strongest ideas from Bolchaal and Clear Path. It is specified in [`../00-design-direction.md`](../00-design-direction.md), with its specimen at [`../00-direction-specimen.html`](../00-direction-specimen.html).

The files in this folder are kept as the record of the exploration. **They are not specs to implement.** Where they disagree with `00-design-direction.md`, the latter wins.

## Scores

| Direction | Files | Taste | Product | Build | Mean | Lens wins |
|---|---|---:|---:|---:|---:|---:|
| **Switchboard**: the precision operator console | `operator.md` (+ `.part1–4`), `operator.html`, `operator-*.png` | 7.5 | **8.5** | **8.5** | **8.17** | 2 |
| **Bolchaal** (बोलचाल): voice-native identity | `voice.md` (+ `.part2–4`), `voice.html`, `voice-*.png` | **8.5** | 7.0 | 6.5 | 7.33 | 1 |
| **Clear Path**: guided clarity | `clarity.md` (+ `.part1–5`), `clarity.html`, `clarity-*.png` | 6.0 | 8.0 | 7.5 | 7.17 | 0 |

## The three directions in brief

### Switchboard (operator)
*A calm operator's console: dense where you scan, quiet where you decide, and never wrong about what is live.*

**The system:**
- Graphite chrome with one Neel blue accent. State colours are used only for call and record state.
- IBM Plex Sans, Mono and Devanagari.
- Density as a setting (Standard 40 / Compact 32 / Touch 48).

**Signatures:**
- a 28 px ink **status line**
- the **timecode gutter** transcript row
- **port tabs** on Logic nodes

**Flow Designer:** left to right, with a phase spine, shape-coded nodes, a Publish sheet and a Problems bar.

**Judges:**
- **Strongest on:** truthful lifecycle, large-flow tooling, token rigour and contrast (every pair passes in both themes).
- **Weakest on:** distinctiveness (the developer-console genre, and Plex's IBM association), 11 px caps headers, too many small mono chips, and too-subtle node shapes.

### Bolchaal (voice)
*Conversation is the interface: ink on khadi paper, with a single peacock accent reserved for the voice.*

**The system:**
- Warm neutrals and a peacock accent.
- Anek Latin for display, Hanken for the UI, JetBrains Mono for tokens.

**Signatures:**
- the **conversation line** (two-lane talk ratio)
- the **voice meter** (which is also the logo)
- **script chips** (अ Hindi, த Tamil)

**Judges:**
- **Strongest on:** ownable identity and Indian specificity, and the best-looking product surfaces.
- **Weakest on:**
  - migration cost (a new neutral ramp, four families, a brand-colour change)
  - signatures that depend on data that may not exist
  - a pale-cyan dark primary
  - an amber Draft chip
  - plum Logic tiles near the purple-AI trope
  - pill overuse

### Clear Path (clarity)
*Every screen answers: where am I, what is true right now, and what is the one next step.*

**The system:**
- Hanken Grotesk, mineral neutrals and a peacock accent.
- When → Check → Do → End flow stages.

**Signatures:**
- the **Readiness path** (one component for setup, pre-call checks and Publish)
- a status sentence grammar
- a **live strip** under the flow header

**Judges:**
- **Strongest on:** onboarding, the pre-call check (blocking versus advisory, the repeat-call guard, cost ranges), and plain language.
- **Weakest on:**
  - it is the least distinctive of the three
  - indigo and plum stage tiles
  - the brief's Trigger → Logic → Action → Outcome vocabulary is renamed
  - weak large-flow tooling (no level of detail, no frames)
  - soft geometry
  - renaming destinations breaks muscle memory

## How the winner was chosen

Switchboard won two of the three lenses (product and build) and has the highest mean score, so it is the base. The taste lens preferred Bolchaal. That preference is honoured by grafting Bolchaal's identity layer onto the base:
- language marks in native script
- the talk strip, used only where real data exists
- the branch-nested Outline
- wallet runway

The base's weakest point, genericness, is removed in these ways:
- It keeps the brand's own Hanken Grotesk.
- It deepens Neel to `#2B45C2`.
- It removes the HUD-like mono chips and keycaps from buttons.
- It strengthens the node silhouettes into full capsules with distinct neutral glyph tiles.

Clear Path contributes the guidance layer:
- the setup track
- the call-gate logic
- the live note
- `Go to [step]` wiring
- templates
- the state matrix
- the Tailwind `@theme inline` wiring

All 36 must-fix items raised by the judges are resolved. The ledger is in section 9 of `00-design-direction.md`.

## What was deliberately not carried forward

| Rejected | From | Why |
|---|---|---|
| IBM Plex type family | Switchboard | A two-brand migration and a Carbon association; Hanken is the audit's keeper face |
| 11 px uppercase table headers | Switchboard | Breaks the 12 px floor (F-VIS-002) |
| Admin setting to skip the pre-flight | Switchboard | Reopens F-UX-013 |
| Warm khadi neutrals, Anek display, peacock accent | Bolchaal | Migration cost, a fourth family, and a colour-vision risk next to success green |
| Plum, jamun and indigo flow tiles | Bolchaal, Clear Path | Too close to the purple-AI palette the brief bans |
| Conversation lines in the Leads table | Bolchaal | Noise in a scanning surface, and they depend on data that may not exist |
| When / Check / Do / End | Clear Path | The brief requires Trigger → Logic → Action → Outcome |
| Renaming to Live calls, Call history, Rep desk | Clear Path | Breaks muscle memory and docs for little gain |
| 52 px default rows | Clear Path | Too sparse for operators; density is a setting instead |
| "Undo publish" | Clear Path | Calls already placed on the new version cannot be undone; the product offers "Roll back to v7…" instead |
