# Clear Path: a guided-clarity direction for Vaani Labs

**Angle.** Journey-first, for Indian SMB teams who are new to voice AI. We measure success by how quickly someone gets to their first successful call. The product should feel premium because it is effortless and calm, not because it has effects.

**Essence (one line).** Every Vaani screen answers three questions in plain language: *where am I, what is true right now, and what is the one next step?*

**Companion files**
- `clarity.html`: a self-contained visual specimen covering type, both palettes with contrast ratios, components in every state, and three realistic mini-screens (the shell with Leads, the Flow Designer, and a live call in the Cockpit). It follows the system light/dark theme and was designed separately for 390 px, 768–1023 px and 1440 px.
- `clarity-light.png`, `clarity-dark.png` (1440 px) and `clarity-mobile.png` (390 px) are renders of the specimen.
- This document is `clarity.md`. It was written as `clarity.part1.md` to `clarity.part5.md` and then concatenated.

**Evidence base.** Finding IDs such as F-UX-006 refer to `audit/consolidated/*`. Rules such as K1 refer to section 5 of the audit (the design-guidance digest). All names, numbers and orgs in the examples are invented.

---

## 0. The direction at a glance

| Decision | Clear Path answer |
|---|---|
| Name | **Clear Path** |
| Default theme | Light by default for new accounts. Dark has full parity and follows the OS unless the user picks a theme (Light / Dark / System). |
| Accent | **Peacock** `#0A6A84` in light, `#5BC3D6` in dark. It is the only chromatic accent. It replaces today's blue `--saffron` and violet dark primary (F-VIS-004). |
| Neutrals | A cool "mineral" ramp with a faint blue-green tint (hue ≈ 195–200). Canvas `#F6F8F8`, text `#14191C`. |
| Type | **Hanken Grotesk** 400/500/600 for the UI. **JetBrains Mono** for tokens only. **Noto Sans Devanagari** for Hindi. |
| Shape | Controls 8 px, cards 12 px, sheets and modals 16 px. Pills are used only for status, filter chips and avatars. |
| Depth | Hairlines and a surface ladder. Three soft shadow levels in light mode. No shadows in dark mode. |
| Motion | "Settle, don't perform": 120/180/240 ms with ease-out. The only loop is the Live dot. |
| Signatures (3) | ① **Readiness path** ② **Status line** ③ **When → Check → Do → End** flow grammar |
| Density | Comfortable by default (52 px rows, 36 px controls), with a Compact mode (40 px rows, 32 px controls) for operators |
| Copy | Sentence case, verbs on buttons, second person, no HUD labels, no em-dash in chrome |

---

## 1. Design principles

Each principle includes what it means concretely on Vaani screens.

### 1. One next step
Each region has **at most one filled button**, and that button is the next step in the user's journey.
- **Leads:** "New lead" in the header. When rows are selected, the bulk bar's "Call 3 leads…" becomes the primary for that region.
- **Flow Designer:** "Publish…" is the only filled button. Test call is secondary. Save disappears, because drafts autosave (fixes F-FLOW-018).
- **Home:** the first unfinished step of the setup path carries the only primary, for example "Place test call…".
- A trailing "…" on a label always means another step follows before anything happens. So "Call 3 leads…" opens a check and never dials.

### 2. Say what is true
Status is computed from data and never used as decoration. If the product does not know something, it says so.
- The flow validator runs continuously. The header shows "1 issue" or "No issues · checked 11:42", never a static "FLOW VALIDATED" (F-FLOW-004, F-UX-004).
- The save status is honest: "Saved to draft 11:42", "Saving…" or "Not saved · Retry". A failed save is kept on the device and never reported as "Up to date" (F-FLOW-003, F-QA-002).
- Onboarding finishes on "Almost there: 2 steps left" until a real test call has connected. It never says "You're live" at ₹0 (F-UX-006).
- Remove the hard-coded "SYS: ONLINE · 22ms". Latency appears only during a call, as "Line: Good · 180 ms" (F-UX-018).
- The Cockpit never shows demo values next to real ones (F-UX-003).

### 3. Plain words first
Use the words a sales manager in Pune would use, not an engineer's.
- One name per destination, used everywhere: in the nav, the H1, the mobile tab and in cross-links (§10).
- Replace HUD labels such as "CUSTOMER INTEL" and "TRANSCRIPT FEED" with sentence case, for example "Lead" and "Transcript" (F-VIS-001, digest anti-pattern 4).
- Internals such as ports, env vars, node IDs and storage keys go behind a "Details" disclosure or into developer settings (F-UX-016, F-FLOW-033).

### 4. Reveal as you go
Show the defaults. Fold away anything advanced. Guide newcomers without slowing experts down.
- Palette items carry a one-line description ("Ask a question: Branch on the answer"). Experts can turn descriptions off, which gives 32 px rows.
- The inspector shows only the fields a step needs. Retries, timeouts and language hints sit under "Advanced".
- Settings is grouped into 5 sections instead of 17 flat items (F-UX-027). Developer pages live under "Developers".
- Keyboard shortcuts appear as `<kbd>` hints in tooltips and in a `?` sheet, not in a permanent strip (K7).

### 5. Safe by default
Anything that reaches customers or spends money follows **preview → confirm → undo**.
- Flows are always edited as a **draft**, and the live version keeps answering calls until you Publish (F-FLOW-001).
- Calling one lead or many opens the **Readiness path** first: flow, number, calling hours, recent calls and cost. Single keys never dial (F-UX-013, F-A11Y-004).
- A delete produces an Undo toast. Irreversible actions get a named confirmation, and the destructive button is filled only inside that dialog (K1, Q5).
- The Assistant shows its plan and asks before any action with side effects (F-UX-022).

### 6. Calm hierarchy
The product is premium through restraint.
- One family and three weights. One accent. Colour appears only where it signals state.
- Depth comes from a surface ladder and hairlines. There are no textures, glows, gradients or glass (F-VIS-022, F-QA-038).
- A page has one H1 style, one header template, one container width rule and one button system (F-VIS-005, F-VIS-006).

### 7. The same product everywhere
- Every breakpoint gets a **designed** layout (§4.3). Phones reach all 12 destinations through "More" (F-RWD-001).
- Every drag has a keyboard path, and every icon has a name (F-A11Y-001, F-A11Y-024).
- Every data view ships empty, sparse, loading, error and no-permission states (Q1).

---

## 2. Typography

### 2.1 Families

| Role | Family (free) | Weights | Why |
|---|---|---|---|
| UI sans | **Hanken Grotesk** (Google Fonts) | 400, 500, 600 | It is already Vaani's marketing face and is the `--font-sans` token, so the public site, login and app become one voice (F-VIS-025). It is warmer and rounder than Inter or Geist, which suits a friendly, guided product, and it keeps its shape at 13–14 px. |
| Tokens | **JetBrains Mono** | 400, 500 | It is already loaded. Its digits are clear (0/O, 1/l), which matters for phone numbers and timers. |
| Hindi | **Noto Sans Devanagari** | 400, 500 | A sans that matches Hanken's x-height. It replaces the serif Devanagari faces that are registered but unused. |
| Fallback | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto` | | |

Retire Sora, Instrument Serif, Syne, Rajdhani, DM Sans, Geist, Geist Mono, Inter and Tiro Devanagari. That cuts 12 registered families down to 3 (F-VIS-002, F-VIS-036). Set the font variables on `<html>`, not on `body`, so the UI can never fall back to the system sans (F-VIS-008). Load Devanagari with `unicode-range` so it downloads only when Hindi text appears.

### 2.2 Type scale

Sizes and line-heights are in px. Tracking is in em.

| Token | Size / LH | Weight | Tracking | Use |
|---|---|---|---|---|
| `display` | 40 / 48 | 600 | −0.025 | Home welcome and first-run only (marketing may go to 56/60 at −0.03) |
| `title-1` | 24 / 32 | 600 | −0.015 | Page H1. Exactly one per route and identical on every page |
| `title-2` | 18 / 26 | 600 | −0.01 | Section, sheet and dialog titles |
| `title-3` | 15 / 22 | 600 | −0.005 | Card, panel and inspector group titles |
| `node-title` | 14 / 20 | 600 | 0 | Flow node titles, table primary cells (500) |
| `body-lg` | 16 / 26 | 400 | 0 | Empty states, onboarding, mobile body, transcript on mobile |
| `body` | 14 / 22 | 400 / 500 | 0 | App default |
| `label` | 13 / 18 | 500 | 0 | Field labels, table headers, tabs, nav group labels |
| `small` | 13 / 20 | 400 | 0 | Helper text, meta, secondary cells |
| `caption` | 12 / 16 | 500 | 0 | Badges, timestamps, legends. **This is the floor: nothing renders below 12 px.** |
| `numeral` | 28 / 34 | 600 | −0.02 | KPIs and balances, tabular |
| `mono` | 13 / 20 | 400 | 0 | Tokens (see 2.3) |
| `mono-sm` | 12 / 16 | 500 | 0 | Keycaps, language codes |
| `deva` | 15 / 26 | 400 | 0 | Hindi transcript turns (a line height of about 1.7) |

**Rules**
- The only weights are 400, 500 and 600, with 600 as the ceiling. There is no 700 or 800 (today Analytics uses 800).
- Negative tracking is allowed only at 18 px and above. Body text never gets positive tracking.
- `font-variant-numeric: tabular-nums` applies to every number that updates or is compared: timers, counts, INR, percentages and table numerals (T6).
- Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs. Keep reading width at 65–75 characters or fewer (Knowledge, Assistant replies).
- On touch screens, input text is 16 px so iOS does not zoom (F7).
- Money is formatted with `Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'})`, which gives lakh grouping (₹2,40,000). Balances use 2 decimals and KPIs use 0.

### 2.3 When mono and uppercase are allowed

| Mono **only** for | Never mono |
|---|---|
| Phone numbers, always masked as `+91 ••••• 4821` | Labels, headings, buttons, nav, body copy |
| Timers and durations (`02:14`) | Section eyebrows |
| IDs, API keys, webhook secrets, code, JSON | Table headers |
| Template variables (`{{lead_name}}`), shown as a Peacock-tinted chip | Status badges |
| Keycaps (`Ctrl K`) and two-letter language codes (`HI`, `EN`) | |

**Uppercase** is allowed only for two-letter language codes and key names inside keycaps. There are no tracked eyebrows, no uppercase buttons, no uppercase table headers and no uppercase H1s. This removes the 84 uppercase elements on Analytics and the 111 on Leads (T5, F-VIS-002).

---

## 3. Colour

### 3.1 Why Peacock

- **It is already Vaani's.** Teal is the first half of the logo gradient and the existing `--peacock` token. We are promoting an asset the product already has rather than inventing one.
- **It avoids the generic AI look.** It is neither the purple-to-blue "AI glow" nor the default SaaS blue, and it is clearly distinct from Stripe's indigo, Linear's violet and Vercel's black.
- **It carries quiet cultural resonance.** The peacock is India's national bird and "mor pankhi" is a familiar colour name. That resonance comes from a flat colour, not from motifs or kitsch.
- **It feels calm and sure.** A deep blue-green reads as "go ahead, this is safe", which suits a guided product. It also keeps white-text contrast high (6.16:1).
- **It stays clear of the semantic colours.** Peacock sits at hue 193°, green at 145°, amber at 30° and red at 4°. Success is never shown by colour alone, so the 48° gap to green is backed up by icons and words.

### 3.2 Neutrals, lines and text

Contrast is WCAG 2.x against `surface` unless another surface is named.

| Token | Light | Dark | Role, contrast |
|---|---|---|---|
| `canvas` | `#F6F8F8` | `#0E1213` | Page background |
| `surface` | `#FFFFFF` | `#151B1D` | Cards, panels, inputs, table |
| `surface-2` | `#EFF2F2` | `#1C2426` | Hover, inset, secondary strip |
| `surface-3` | `#E5E9EA` | `#243033` | Pressed, neutral badge, toggle off |
| `border` | `#E1E6E7` | `#263033` | Decorative hairline (1.26 / 1.29) |
| `border-2` | `#CDD4D6` | `#34403F` | Button, chip and node rims (decorative: 1.50 / 1.62) |
| `border-strong` | `#848F94` | `#5E6B6F` | **Inputs, checkboxes, flow edges and ports: 3.31 / 3.16** (meets 1.4.11) |
| `text` | `#14191C` | `#E7EDEE` | 17.71 / 14.71 |
| `text-2` | `#48545A` | `#A9B4B7` | 7.80 / 8.21 |
| `text-3` | `#5F6B71` | `#8A979B` | 5.49 (5.15 on canvas, 4.87 on surface-2) / 5.79 (6.26 on canvas). **Never on surface-3** (4.49). |
| `text-disabled` | `#A1ABAF` | `#566367` | Disabled only (2.34 / 2.80), always with a reason nearby |

The muted text colour fixes F-A11Y-008: `#7A8397`, which measures 3.52 on the canvas, becomes `#5F6B71`, which measures 5.15.

### 3.3 Accent

| Token | Light | Dark | Contrast |
|---|---|---|---|
| `accent` (fill, link, focus) | `#0A6A84` | `#5BC3D6` | White on the light fill 6.16. Ink `#062229` on the dark fill 8.06. As text, 6.16 / 8.47 |
| `accent-hover` | `#085A71` | `#78D0E0` | 7.75 / 9.38 |
| `accent-pressed` | `#07495C` | `#9ADDE9` | 9.92 / 10.95 |
| `accent-soft` + `accent-text` | `#E3F1F4` + `#07556A` | `#12292E` + `#7FD3E2` | 7.21 / 8.91 (selected nav, chips, variables) |
| `accent-tint` | `#F1F8F9` | `#122024` | Selected table rows (text-3 on it: 5.10 / 5.55) |
| `focus` | = accent | = accent | 2 px ring with a 2 px offset: 6.16 against surface / 8.47 |

In dark mode the hue stays the same and only the lightness lifts, so the brand no longer turns violet (F-VIS-028). The accent is used **only** for the primary button, focus, selection, links, the active nav item, the readiness-path progress, and highlighted edges on the selected node. Teal secondary buttons, the green ACTIVATE button and violet Meeting Agent are all retired (C2).

### 3.4 Semantic colours (state only)

| State | Light text / soft bg | Light solid (white label) | Dark text / soft bg | Used for |
|---|---|---|---|---|
| Success | `#17643A` / `#E4F4E9` (6.31) | `#1B7A3F` (5.38) | `#5CCB8A` / `#1A2B22` (7.34) | Live call, live flow, interested, goal-reached outcome |
| Warning | `#8A4A06` / `#FDF1DD` (6.14) | `#B45309` (5.02) | `#F0B14A` / `#2D2415` (8.07) | Draft, dialling or ringing, low balance, follow up, flow issue (non-blocking) |
| Danger | `#A0281F` / `#FCE9E7` (6.37) | `#B42A21` (6.38) | `#F37D73` / `#331D1C` (5.99). Ink on fill 7.38 | Failed, blocking error, destructive confirm, do not call |
| Info | = accent-soft pair (7.21) | n/a | (8.91) | Tips, neutral notices |

Every state carries **an icon and a word**, so colour is never the only cue (A4). One red replaces today's four (F-VIS-020).

### 3.5 Flow stage colours (signature 3, icon tiles only)

| Stage | Light fg / tile | Dark fg / tile | Contrast |
|---|---|---|---|
| **When** (trigger) | `#3E4BC0` / `#EDEFFC` | `#9AA6FF` / `#1D2140` | 6.17 / 6.90 |
| **Check** (logic) | `#7F3E9C` / `#F5ECF8` | `#D59BEA` / `#2A1D31` | 5.94 / 7.36 |
| **Do** (action) | `#39434A` / `#ECEFF0` | `#B7C2C6` / `#232C2F` | 8.75 / 7.84 |
| **End** (outcome) | The semantic colour of the outcome: goal reached is success, follow-up is warning, closed is neutral, failed is danger | | |

Stage hues appear **only** in 20–28 px icon tiles, the stage word and the canvas legend, and only in flow contexts (the palette, nodes, the outline, the Cockpit's "Now in the flow" and outcomes in Call history). Node frames stay neutral. The accent stays reserved for selection, so a selected node is always the only Peacock thing on the canvas.

### 3.6 Chart palette (separate from chrome)

| # | Light (vs white) | Dark (vs surface) |
|---|---|---|
| 1 | Peacock `#0A6A84` (6.16) | `#5BC3D6` (8.47) |
| 2 | Ochre `#B7791F` (3.64) | `#E0A94A` (8.24) |
| 3 | Indigo `#4F5BD5` (5.54) | `#9AA6FF` (7.69) |
| 4 | Rose `#C0417A` (4.91) | `#F07FAF` (6.93) |
| 5 | Slate `#6B7A80` (4.45) | `#9AA7AB` (7.04) |

Every mark is 3:1 or better against its surface. Use at most 5 series. The ordering keeps the two blue-ish hues apart, and series are always labelled directly. Sentiment always uses the semantic trio with an icon and a word (C7, F-VIS-011).

### 3.7 Mapping from today's tokens

| Today | Clear Path |
|---|---|
| `--saffron` (blue `#2f5fe0` / violet `#7c6bf5`) | `--accent` (Peacock) |
| `--peacock` (teal / cyan) | Merged into `--accent`. The second accent is retired. |
| `--sentiment-positive / -neutral / -negative` | `--success`, `--warning` (neutral sentiment uses `text-2`), `--danger`, each with a `-soft` and `-text` |
| `--text-muted #7a8397` | `--text-3 #5F6B71` |
| `--border-color` / `--border-light` (names inverted) | `--border` / `--border-2` / `--border-strong` |
| `--glass-*`, `--*-glow*`, `--noise-opacity`, `--grid-line-color` | Deleted |
| (missing) | `--on-accent`, `--focus`, `--warning`, `--info`, `--e1..e3`, `--z-*`, `--dur-*` |
