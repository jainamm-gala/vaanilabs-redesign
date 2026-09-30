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

## 4. Spacing, density and layout

### 4.1 Scale
Everything sits on a 4 px base: **2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64**. Values of 9, 10, 14 and 18 px disappear (today's `.btn` uses `9px 18px`).

| Rhythm | Value |
|---|---|
| Label to field | 6 px |
| Field to helper text | 6 px |
| Between fields | 16–18 px |
| Between groups inside a panel | 24 px |
| Between page sections | 32–48 px |
| Panel padding | 16–20 px (max 24) |
| Card padding (marketing) | 24–32 px |
| Page gutter | 32 px (≥1440), 28 px (1024–1439), 20 px (768–1023), 16 px (<768) |

### 4.2 Density modes

| | Comfortable (default) | Compact (user setting, remembered per user) |
|---|---|---|
| Control height | 36 px (forms 40) | 32 px |
| Table row | 52 px (a name and meta line) | 40 px (single line; meta moves into a tooltip) |
| Palette item | 44 px with a description | 32 px, name only |
| Nav item | 32 px | 30 px |
| Touch (any mode, coarse pointer) | 44 px minimum targets | 44 px |

**Why comfortable is the default.** Newcomers scan fewer, richer rows. Operators who work through lists switch to Compact once, and the setting persists. Leads rows today are about 65 px and carry about 400 px of chrome above them (F-VIS-009). Clear Path cuts the chrome to about 180 px, so Comfortable still shows about 50% more rows per screen.

### 4.3 Breakpoints (each one is designed)

| Range | Shell | Content | Notes |
|---|---|---|---|
| **Desktop ≥1440** | Labelled sidebar, 248 px | Reading pages (Settings, Billing, Knowledge, Home) max 1200 px wide and centred. Data pages (Leads, Call history, Analytics) and the canvas are full-bleed. | The Flow Designer auto-collapses the app sidebar to a 56 px rail to give the canvas room. |
| **Laptop 1024–1439** | Labelled sidebar, 232 px, collapsible to a 56 px rail with `[` | As above. Tables gain a column chooser and scroll inside their own container, with a sticky Name column and an edge fade. | Flow: the palette becomes a 48 px strip with an "Add step" popover, and the inspector becomes an overlay sheet (360 px). |
| **Tablet 768–1023** | 64 px icon rail. Tooltips appear on hover **and focus**. The "Menu" button opens the full labelled sidebar as an **overlay** sheet, never a push (F-VIS-033). | A single column. Side panels become sheets. | Flow: read-only canvas plus Outline, wording edits and Test call. Structural editing needs 1024 px or more (R4). |
| **Mobile 320–767** | Top app bar (title, search, one action) plus a **bottom bar of 5**: Home, Calls, Leads, History, More. More opens a sheet with every destination, Settings, Help and the account menu. Sign out lives only in the account menu (F-RWD-001). | Tables become card lists (name, status, masked phone, last call). Bulk actions dock above the bottom bar. | Safe-area insets, `100dvh`, 16 px inputs, no hover-only affordances. |

Breakpoint tokens: 640, 768, 1024, 1280, 1440, 1536. The ad-hoc 420/720/760/1079 breakpoints are removed (F-VIS-035).

---

## 5. Radius, elevation and borders

**Philosophy.** Structure comes from space first, then hairlines, then surface steps, and only then from shadow. Cards appear only where elevation means something: a movable node, a popover or a dialog. KPI rows are one bordered strip with dividers. There is **no box inside a box inside a box** (L4, F-VIS-016).

| Radius token | Value | Used for |
|---|---|---|
| `r-xs` | 5 px | Keycaps, language codes, variable chips |
| `r-sm` | 8 px | Buttons, inputs, menu items, nav items, segmented items (7 inside the 9 px track) |
| `r-md` | 12 px | Cards, panels, table wrapper, flow nodes, popovers |
| `r-lg` | 16 px | Sheets, dialogs, the specimen frames |
| `r-full` | 999 px | Status badges, filter chips, avatars, toggles |

Nested radii are concentric: the child's radius equals the parent's radius minus the padding.

| Elevation (light) | Value | Used for |
|---|---|---|
| `e0` | Border only | Default cards and panels |
| `e1` | `0 1px 2px rgba(20,25,28,.06)` | Flow nodes, secondary buttons, the selected segment |
| `e2` | `0 1px 2px /.05, 0 6px 16px -4px /.12` | Popovers, menus, the selected node, the frame |
| `e3` | `0 2px 4px /.04, 0 12px 24px -6px /.12, 0 32px 56px -16px /.20` | Dialogs, sheets, the bulk bar, the readiness popover, toasts |

**Dark mode** has no drop shadows. Depth is one surface step up plus `border`. Overlays get a 1 px black ring and a single deep shadow so they separate from the canvas. The overlay veil is `rgba(14,18,19,.40)` with **no blur**, so glassmorphism is gone.

**Borders.** 1 px everywhere. A 2 px width appears only for focus rings, the selected-node outline and the active-tab underline. Dashed borders carry exactly one meaning: an "add" affordance (the "+ Filter" chip, an empty drop zone).

**z-index scale** (K12): base 0 · sticky 10 · dropdown 20 · sticky banner 30 · overlay 40 · modal 50 · toast 60 · tooltip 70. Nothing uses 9999. The decorative noise overlay is deleted (F-QA-038).

---

## 6. Iconography

- **Lucide only**, stroke 1.75 in the 24 px grid. That renders at about 1.2 px at 16 px and about 1.5 px at 20 px. Line caps and joins are round.
- **Three sizes:** 16 px in controls and tables, 18 px in the sidebar, 20 px in the mobile bottom bar and empty states. Badges use 12 px with a 2.2 stroke. Flow tiles use 14 px icons in 24 px tiles.
- An icon is always paired with a label, except in dense toolbars (Undo, Redo, Zoom, Close). Those get an `aria-label`, a tooltip on hover **and** focus, and a keycap hint in the tooltip (A2).
- Letter glyphs used as icons ("F", "IG", "{}"), emoji on marketing tabs, the solid ▼ sort glyph and misleading ↗ on in-app links are replaced (F-VIS-031).
- **Fixed icon vocabulary** (so one icon never means two things):

| Meaning | Icon |
|---|---|
| Call / place a call | phone |
| Outbound | phone-outgoing |
| Inbound | phone-incoming |
| End call | phone-off |
| Ask | message-circle-question |
| Branch | git-fork |
| Verify | shield-check |
| Say | volume-2 |
| WhatsApp | message-circle |
| Book | calendar |
| Transfer | user + arrow |
| Outcome | flag |
| Knowledge | book |
| Wallet | wallet |
| Draft | file-pen |
| Issue | triangle-alert |
| Info | info |
| Recording | circle-dot |

- **No sparkles.** The Assistant uses a plain chat icon. AI is shown by what it does, not by glitter.

---

## 7. Data visualisation

- Charts are **quiet instruments.**
  - 1 px `border` gridlines, horizontal only.
  - Axis labels in `caption` / `text-3`, with tabular numerals.
  - No chart borders, gradients, shadows or 3D.
  - Bars have a 3 px top radius. Lines are 2 px with no markers except the hovered point.
- **Direct labels beat legends.** When a legend is needed, it sits top-left in `caption` and names each series with a 10 px square.
- **Comparison in words:** "+18% vs previous 7 days". The delta is coloured only when a direction is genuinely good or bad, and it always includes an arrow icon (F-VIS-011).
- **Designed empty states:**
  - With fewer than 5 data points, show "Not enough calls yet to show a trend. You have 3 this week." instead of a chart.
  - With no data, show an empty-state sentence and the next action (Q2).
  - An error shows what happened, plus Retry.
- **Sentiment** always combines an icon, a word and a colour. Scores are tabular numbers with a thin 4 px meter, the same meter used for "Interest" on Leads.
- **Flow drop-off** is a horizontal bar per step, labelled with the step title and its stage tile. It opens the step in the Flow Designer (F-QA-019).
- **Analytics layout** keeps the same shell and header. The editorial § numerals, serif kickers and hatch fills are removed (F-VIS-010).

---

## 8. Motion character: "settle, don't perform"

| Token | Value | Used for |
|---|---|---|
| `dur-1` | 120 ms | Hover, press, colour changes |
| `dur-2` | 180 ms | Menus, popovers, tooltips, tab underline, toggle knob, new transcript turn |
| `dur-3` | 240 ms | Sheets, drawers, the inspector, the test-call dock |
| `ease` | `cubic-bezier(.16,1,.3,1)` | Enter and exit |
| `ease-drawer` | `cubic-bezier(.32,.72,0,1)` | Sheets |

**Allowed motions**, and nothing runs longer than 300 ms:
1. **Readiness step completes.** The marker fills with Peacock and the check draws in 180 ms. The connector below it fills top-down in 240 ms. This is the one "moment of delight", and it is earned by real progress.
2. **Status line changes.** The old state cross-fades to the new one in 180 ms, with no slide.
3. **A new transcript turn** fades in and rises 4 px. The partial turn turns from grey to ink as it becomes final.
4. **Popover and sheet enter:** opacity plus 4–8 px of translate. Exit is 30% faster.
5. **Live dot:** a 1.8 s ring pulse. It is the **only** infinite animation, and it runs only while a call or room is actually live.
6. **Audio level bars** move only on real audio frames. They are static when the audio is silent or muted.

**Forbidden:** idle orbs, spinning mandalas, marching-ants edges, shimmer on static content, hover lifts, glows, scroll-reveal inside the app, and `transition: all` (M3, M5, F-A11Y-022, F-FLOW-011). Under `prefers-reduced-motion`, every animation and transition becomes instant, and the Live dot becomes a static dot plus the word "Live".

---

## 9. Signature elements (exactly three)

### ① Readiness path
A vertical list of steps. A 2 px connector runs down the left side, and each step has a 24 px marker in one of four states:

| State | Marker |
|---|---|
| To do | Numbered ring in `border-strong` |
| Current | Peacock ring with a 4 px soft halo |
| Done | Peacock fill with a white check |
| Needs attention | Amber soft fill with a triangle |

Each step has a title (14/500), one sentence (13/20 `text-2`) and at most one action or status on the right. Completed segments of the connector turn Peacock. The compact variant uses 20 px markers.

**Where it appears** (one component, with `variant="page|popover|inline|horizontal"`):
- **Home, "Get your first call live":** Choose a flow → Add calling number → Add money → Call yourself → Import leads or connect inbound. This replaces the false "You're live" (F-UX-006) and gives the persistent setup tracker the audit found missing (J1).
- **Sidebar footer:** "Finish setup · 4 of 5" with a thin progress bar and a "Continue" link. It disappears once setup is complete.
- **Pre-call checks:** the Leads bulk call, the row "Call…" and the Cockpit "Ready to call" card. The checks are flow (live version, tested), number verified, calling hours, recently called, do-not-call, and wallet with a cost estimate (F-UX-013).
- **Publish dialog in the Flow Designer:** no blocking issues, test call on this draft, number, wallet, what changed.
- **Horizontal variant:** the call-state stepper (Dialling → Ringing → Live → Wrap-up) and the telephony setup (Owned → Compliance → Authorized), keeping the audit's best existing pattern.

### ② Status line
The grammar is `[state badge] + one plain sentence + quiet meta + at most one action`. The state is always computed. This is how Clear Path "says what is true", and it replaces every decorative status (the "IDLE" pill, "SYS: ONLINE", "FLOW VALIDATED", "Up to date" and the wallet banner).

**Where it appears:**
- Flow header (Draft · 4 changes · Saved 11:42) and the live strip (Live v7 answers calls on +91 ••••• 2210 since 12 Sep)
- Live call card (Live · 02:14)
- Wallet ("Low balance · ₹48.00 covers about 20 minutes · Top up…") **only on pages where calling is possible**, never as a global 42 px bar (F-UX-028)
- Knowledge files (Indexed · 212 chunks · 2 min ago / Indexing… / Failed · Retry) (F-UX-033)
- Meeting rooms (Live · 3 people · ends in 28 min / Ended · summary ready) (F-UX-038)
- Rep desk ("You're available for transfers · Go offline") (F-UX-023)
- Save failures ("Not saved · kept on this device · Retry") (F-UX-019)

### ③ When → Check → Do → End
A four-word grammar that turns a call flow into a sentence anyone can read:

| Stage | Meaning | Node types |
|---|---|---|
| **When** | What starts a call | Outbound call from a list, inbound call on a number, scheduled callback, API or webhook trigger |
| **Check** | Listen and decide | Ask a question, branch on a rule, verify the caller |
| **Do** | Act for the caller | Say something, look up knowledge, look up the CRM, send WhatsApp, book a meeting, transfer to a person |
| **End** | Finish with a named outcome | Goal reached, follow up, closed, failed |

**Where it appears:**
- Palette groups
- Node header (tile plus the stage word)
- Canvas legend
- Outline view
- The Cockpit's "Now in the flow" mini-path
- Call history ("Ended at: End · Visit booked")
- Analytics drop-off bars
- The template gallery

It is the bridge between building a flow and watching a call, which is what the audit found missing (J2 step 11, F-FLOW-016).

---

## 10. Copy and naming

**Voice.** Plain, specific, second person, calm. Buttons are verbs, and every message says what happened and what to do next (Q4). The UI chrome uses no exclamation marks, no "Oops", no em-dash and no filler words such as "seamless" or "unleash" (P1–P9).

| Destination | Today (rail / H1 / mobile) | Clear Path (nav = H1 = mobile) | Group |
|---|---|---|---|
| New overview | none (the default route is the Cockpit) | **Home** | none |
| Assistant | Assistant | **Assistant** | none |
| Flow Builder | Flow Builder / "VOICE JOURNEY WORKSPACE" | **Call flows** (list) → flow editor titled with the flow name | Build |
| Knowledge | Knowledge / AGENT KNOWLEDGE | **Knowledge** | Build |
| Cockpit | Agent View / AGENT COCKPIT / Agent | **Live calls** (tabs: Live now, Scheduled, Test calls) | Run |
| Leads | Leads / LEADS | **Leads** | Run |
| Rep Console | Rep Console / Rep console | **Rep desk** | Run |
| Call Reports | Call Reports / Reports | **Call history** | Review |
| Analytics | Analytics / ANALYTICS | **Analytics** | Review |
| Meeting Agent | Meet Agent / Meeting Agent — Vikash | **Meeting agent** | More agents |
| Personal Agents | Personal Agents | **Personal agent** | More agents |
| Billing | Billing / BILLING | **Billing** (reached from the sidebar Wallet row) | Footer |
| Settings | Settings / SETTINGS | **Settings** (5 groups: Account, Workspace and team, Calling, Integrations, Developers) | Footer |

**Rules**
- Renamed routes redirect permanently.
- Old names appear as "formerly Agent Cockpit" in `⌘K`/`Ctrl K` search for 90 days.
- One term per concept:

| Concept | Term used everywhere |
|---|---|
| The script the agent follows | Call flow |
| Funding calls | Top up |
| The phone voice | Agent voice |
| The AI persona | Named by its voice ("Vaani", "Vikash"), never "Agent View" |

## 11. App shell and information architecture

### 11.1 Model
- **One shell on every authenticated route** (L1). It has three parts:
  - **Sidebar:** workspace switcher, `Ctrl K` jump, nav groups, and a footer for setup, wallet, Settings and account.
  - **Page header:** H1, one-line description, and actions on the right (at most one primary).
  - **Content.**
- Header height is 64 px on desktop and 52 px on mobile. Sticky chrome never exceeds 96 px (L7).
- **Home** becomes the default route. For a new workspace it shows the readiness path. Once setup is done it shows "Today": live and scheduled calls, calls that need follow-up, balance runway, and flows with issues.
- **The wallet moves out of the banner** and into the sidebar footer as "Wallet ₹240.00", which opens Billing.
  - When the balance is low, the row gets an amber badge.
  - When calling is blocked, a status line appears inline wherever calling is attempted. It says what is blocked and how to fix it, and "Top up…" opens the Billing top-up sheet directly (F-UX-002, F-UX-028, F-QA-004).
- **Identity is visible.** The account row shows avatar, name, role and org. It opens a menu with Profile, Theme (Light / Dark / System), Keyboard shortcuts, Help and Sign out. Sign out asks for confirmation only while a call is live (F-UX-029).
- **`Ctrl K` / `⌘K`** is a jump-to palette covering destinations, flows, leads by name or last four digits, and actions such as "Place test call…". The keys shown match the platform (F-FLOW-024).
- **Every route has its own `<title>`**, for example "Leads · Vaani". Filters, views, open records and the open flow are kept in the URL (F-UX-031, F-A11Y-013).
- The skip link lands on `main`. The sidebar is a single `nav` landmark with `aria-current="page"`, and each item is one tab stop (F-A11Y-012, F-A11Y-017).

### 11.2 Desktop ≥1440 (laptop is identical at 232 px)

```
┌────────────────────────┬───────────────────────────────────────────────────────────────┐
│ [V] Orchid Realty    ▾ │ Leads  248                               [Import leads…] [+ New lead]
│ ⌕ Search or jump… CtrlK│ People your agent can call. Import a list or add someone by hand.   │
│                        │ ─────────────────────────────────────────────────────────────────── │
│ ⌂ Home                 │  All 248 │ New 96 │ Follow up 31 │ Interested 42 │ Not interested 79 │
│ ◌ Assistant            │ ─────────────────────────────────────────────────────────────────── │
│ Build                  │ [⌕ Search name or phone…  /] (Status Any▾) (Language Hindi ✕) (+Filter)│
│  ⊏ Call flows       6  │                                                 ▥ Columns [Comf|Comp]│
│  ▯ Knowledge           │ ┌───────────────────────────────────────────────────────────────┐ │
│ Run                    │ │☐ Name            Phone           Status      Last call    Lang  Interest │ │
│  ☏ Live calls          │ │☑ MI Meera Iyer   +91 ••••• 4821  ✓Interested Asked for pr… HI EN ▬▬▬ 82 ☏│ │
│ ▌☺ Leads          248  │ │☐ VR Vikram R.    +91 ••••• 7712  Contacted   No answer 2h  HI   ▬   30 ☏│ │
│  ◠ Rep desk            │ └───────────────────────────────────────────────────────────────┘ │
│ Review                 │ 1–8 of 248                                          [Prev] [Next] │
│  ↺ Call history        │                                                                    │
│  ▥ Analytics           │                                                                    │
│ More agents            │                                                                    │
│  ▭ Meeting agent       │                                                                    │
│  ◘ Personal agent      │                                                                    │
│ ┌────────────────────┐ │                                                                    │
│ │Finish setup  4 of 5│ │                                                                    │
│ │▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░  │ │                                                                    │
│ │Next: invite team → │ │                                                                    │
│ └────────────────────┘ │                                                                    │
│ ▣ Wallet      ₹240.00  │                                                                    │
│ ≡ Settings             │                                                                    │
│ (NV) Neel Varma      ▾ │                                                                    │
│      Admin · Orchid    │                                                                    │
└────────────────────────┴───────────────────────────────────────────────────────────────┘
```

### 11.3 Tablet 768–1023 and mobile 320–767

```
TABLET                                   MOBILE (390)
┌────┬──────────────────────────────┐    ┌──────────────────────────────┐
│[V] │ Leads 248   [Import…][+ New] │    │ Leads (248)            ⌕  +  │  ← app bar
│ ⌂  │ All │ New │ Follow up │ …    │    │ All 248  New 96  Follow up 31│
│ ◌  │ [⌕ Search…] (Status▾)(+Filter)│    │ [⌕ Search name or…] (Hindi ✕)│
│ ── │ ┌──────────────────────────┐ │    │ ┌──────────────────────────┐ │
│ ⊏  │ │☑ Meera Iyer  4821 ✓Inter…│→│    │ │☑ Meera Iyer   ✓Interested│ │
│ ▯  │ │  (table scrolls inside,  │ │    │ │  +91 ••••• 4821 · Bengal…│ │
│ ☏  │ │   Name column sticky)    │ │    │ │☐ Vikram Rathore Contacted│ │
│▌☺  │ └──────────────────────────┘ │    │ └──────────────────────────┘ │
│ …  │                              │    │ [☑ 3 selected  Clear  Call 3…]│ ← docked bulk bar
│ ▣  │  ☰ "Menu" opens the full     │    ├──────────────────────────────┤
│(NV)│  labelled sidebar as overlay │    │ Home  Calls  Leads History More│ ← 5 tabs, 60 px
└────┴──────────────────────────────┘    └──────────────────────────────┘
```

More opens a sheet listing every group and destination (Build, Run, Review, More agents), then Billing, Settings, Help and the account row with Sign out. **All 12 destinations are reachable on a phone** (fixes F-RWD-001 and F-UX-008).

### 11.4 Page header template (every page)
- **Left side:** H1 `title-1` with an optional count in `text-3`, and a description in `body`/`text-2` of 90 characters or fewer.
- **Right side:** secondary actions, then at most one primary.
- **Directly below:** view tabs (underline, in the URL) or nothing.
- Settings sub-pages keep the Settings sub-nav visible, so there are no "BACK TO SETTINGS" bars (F-UX-027). This follows the Call Reports and Assistant pattern the audit says to keep.

---

## 12. Agent Cockpit ("Live calls")

**Intent.** The centre of the screen is always the task: before a call, a readiness card; during a call, the call itself; after a call, the outcome. The 320 px idle ring is removed (F-VIS-029, L5).

### 12.1 States
| State | Centre card content | Primary action |
|---|---|---|
| **Ready** (idle) | Readiness path (inline variant). The steps are: **Contact**: pick a lead (search) or type a number, with a fixed `+91` prefix, `type="tel"` and E.164 validation as you type. **Flow**: the name plus "Live v7 · tested today". Choosing it here does **not** change the workspace default (F-UX-014). **Agent voice**: Vaani / Vikash, each with a one-line description and a ▶ 5-second preview. **Wallet**: ₹ runway. **Number**: verified. | "Call this number" (primary). "Talk in browser" (secondary). A disabled primary shows its reason inline (K2). |
| **Dialling… / Ringing…** | Horizontal call-state stepper, timer, Cancel | none (a Cancel ghost button) |
| **Live** | Status line (Live dot, timer, recording disclosure). Lead name. Stepper. "Now in the flow" (stage tile, step name, step n of N, mini-path). Audio level for agent and lead. "Line: Good · 180 ms". Actions: Listen in, Take over call, End call… (danger outline, with confirmation) | none (no filled button during a live call; the AI is in control) |
| **Wrap-up** | Outcome, suggested automatically from the End node ("Visit booked"). Captured fields with edit. Summary. "Save to lead" (primary), "Open in Call history" | Save to lead |
| **Failed** | Status line (Failed) with the reason in plain words ("The number didn't answer after 30 s.") | Try again |

### 12.2 Wireframe: desktop, live call

```
┌ Live calls ──────────────────────────────────────────────────────────── [☏ Place test call…] ┐
│ Watch calls as they happen, or place a test call to hear a flow yourself.                   │
│ Live now 1 │ Scheduled 12 │ Test calls                                                      │
├──────────────────────┬───────────────────────────────────────┬───────────────────────────────┤
│ (MI) Meera Iyer      │ (● Live) 02:14      ◎ Recording · 00:04│ Transcript    [◉ Auto-scroll] ⌕│
│ +91 ••••• 4821  Open │ Meera Iyer                            │ Vaani agent 00:04          EN  │
│──────────────────────│ +91 ••••• 4821 · Outbound · try 1 of 2 │ Namaste Meera ji, this is…    │
│ Status   ✓Interested │ (✓)──(✓)──(3)──(4)                    │ Meera lead 00:11           HI  │
│ Language HI EN       │ Dial  Ring  Live Wrap-up              │ हाँ जी, बोलिए।                   │
│ Source   Website     │ ┌ Now in the flow ─────── Open in flow┐│ Vaani agent 00:15          HI  │
│ City     Bengaluru   │ │ [Check] Ask: still looking?         ││ आपने पिछले हफ़्ते 2 BHK…        │
│ Earlier  2 · 3d ago  │ │ Site visit booking · v7 · step 3/8  ││ …                             │
│ Notes    after 11 am │ │ [W]━[D]━[C]──[D]──[E]               ││ Meera lead 02:12 listening… HI│
│──────────────────────│ └─────────────────────────────────────┘│ Saturday को हो सकता है, लेकिन… │
│ Captured on this call│ Agent ▫▫▫▫▫▫▫▫   Lead ▮▮▮▯▮▮▮▯        │ (grey = still transcribing)   │
│ Budget   ₹60 lakh ✓  │ Line  Good · 180 ms                   │                               │
│ Home     2 BHK ✓     │ [🎧 Listen in] [✋ Take over]  [End call…]│ ⓘ Scroll up to pause.         │
│ Visit    Listening…  │                                       │           [Jump to latest ↓]  │
└──────────────────────┴───────────────────────────────────────┴───────────────────────────────┘
```

- **Laptop:** the lead panel moves below the call and transcript, which stay side by side.
- **Tablet:** call, then transcript, stacked.
- **Mobile:** status line and timer stay sticky at the top. Then the "Now in the flow" card, then the transcript at full width. Lead details sit in an accordion. The actions become a bottom action bar (Listen, Take over, End…).
- Nothing is hidden without a replacement (F-RWD-002).

### 12.3 Transcript rules
- Turns carry the speaker name (agent turns in `accent-text`), role, `mm:ss` in mono, and a language tag. Each turn also has `lang="hi"` or `lang="en"` set.
- Hindi uses `deva` at 15/26.
- A partial turn shows in `text-3` with "listening…". Only final turns go to the `aria-live="polite"` region, throttled to at most one per 2 s (Q6, F-A11Y-014).
- Auto-scroll pauses when the user scrolls up, and a "Jump to latest" pill appears.
- Search and Copy live in the header.
- The empty state reads "Transcripts appear here once the call connects." It replaces "Awaiting connection…" at 1.77:1.

---

## 13. Leads

### 13.1 Structure
- **Header:** "Leads 248", the description, [Import leads…] secondary and [+ New lead] primary. The first-run empty state swaps these for the empty-state actions.
- **View tabs** (in the URL, `?view=follow-up`): All, New, Follow up, Interested, Not interested. Counts cover the **whole pipeline**, not the current page (F-QA-015). The KPI strip leaves the default view. Pipeline numbers now live in the tab counts and in Analytics.
- **Toolbar:** search (focus with `/`), filter chips (Status, Language, Source, Owner, Last call; all kept in the URL), "+ Filter", then Columns (chooser) and the density toggle on the right. Everything fits in one row at 1024 px or wider. Below that, chips wrap to a second row rather than scrolling hidden (F-RWD-012).
- **Table** (a real `<table>` with caption, `scope` and `aria-sort`) (F-A11Y-018):

| Column | Content | Notes |
|---|---|---|
| ☐ | Checkbox 16 px in a 24 px hit area | The header checkbox has a mixed state |
| Name | 28 px neutral avatar (initials on `surface-3`), name 14/500, city 12.5 `text-3` | Sticky when scrolling sideways |
| Phone | `+91 ••••• 4821` in mono | Reveal is an explicit, logged action |
| Status | One badge (icon + word) | Editable from the row menu with an optimistic update |
| Last call | Outcome in words plus relative time; the tooltip shows the absolute time | "Not called yet" in `text-3` |
| Language | `HI` / `EN` codes | |
| Interest | 44 px meter plus a tabular number, right-aligned | "–" when unknown, not a dash row |
| Actions | Quiet phone icon button, named "Call Meera Iyer…". It becomes a labelled "Call…" button on hover or focus. | It opens the readiness popover. It never dials. |

- Clicking a row or pressing Enter opens the **lead sheet** (440 px, right side). The sheet has focus trap, Esc, focus return and deep link `?lead=<id>`. Inside it: details, call history (outcome words, never a month-old "QUEUED"), notes, and **Call…**. Delete sits in the ⋯ menu and asks for confirmation (F-UX-032, F-A11Y-010).
- **Keyboard:**

| Key | Action |
|---|---|
| `J` / `K` | Move a visible row focus ring |
| `X` | Select |
| `Enter` | Open |
| `C` | Open the readiness popover for the focused lead (never dials) |
| `/` | Search |
| `Esc` | Clear |

  Single-key shortcuts can be switched off in account settings, which meets WCAG 2.1.4 (F-A11Y-004).

### 13.2 Bulk calling with a readiness check
Selecting rows shows a floating **bulk bar**: "☑ 3 selected · Change status · Add to list · Clear · [Call 3 leads…]". The primary opens the **readiness popover** (a bottom sheet on mobile).

```
┌ Ready to call 3 leads? ───────────────────────────────┐
│ We checked everything that could stop or surprise a call.│
│ (✓) Flow: Site visit booking      Live v7 · tested today │
│  │                                                      │
│ (✓) Calling number verified       +91 ••••• 2210        │
│  │                                                      │
│ (✓) Inside calling hours          11:42 IST · 9:00–21:00│
│  │                                                      │
│ (!) Aditya Menon was called 22 h ago · we'll skip him [Include]│
│ ─────────────────────────────────────────────────────── │
│ 2 calls · about 2 to 4 min each              ₹10 to ₹20 │
│ ─────────────────────────────────────────────────────── │
│                                  [Cancel] [☏ Call 2 leads]│
└─────────────────────────────────────────────────────────┘
```

**Rules**
- **Blocking checks disable the primary and say why:**
  - no live flow
  - unverified number
  - wallet cannot cover the minimum
  - outside calling hours
- **Advisory checks (amber) adjust the batch and can be overridden:**
  - recently called
  - do-not-call
  - language mismatch
- **The estimate is a range, never a false-precise number.** It comes from the per-second rate and the flow's median call length.
- **After confirming,** the batch appears under Live calls › Scheduled with Pause and Cancel. A toast reads "Calling 2 leads. Track them in Live calls".
- **Every call request sends an idempotency key** (F3).

### 13.3 States
| State | Design |
|---|---|
| Empty | "No leads yet" plus one sentence. [Import leads…] (primary), [Add a lead], "Download template". |
| Filtered to nothing | "No leads match Hindi + Follow up", with [Clear filters] |
| Loading | A skeleton of 8 rows that mirrors the columns, after a 200 ms delay. The shell is always present (F-UX-030). |
| Error | Status line: "Couldn't load leads. Check your connection" with [Retry]. Rows already loaded stay visible. |
| No permission | "Only admins can import leads. Ask Neel Varma (Admin)." |
| Import | A two-step sheet (template, then upload). It accepts CSV and XLSX. A **preview of the first 5 rows** with column mapping and a phone-validation count comes before "Import 212 leads" (F-QA-022). |

## 14. Flow Designer (When → Check → Do → End)

**Intent.** A call flow should read like a sentence and behave like a professional publishing tool. You draft, check, test and publish, and the live version is never touched by accident.

### 14.1 Lifecycle: draft, test, publish (fixes F-FLOW-001/002/003/005/014)
| Concept | Behaviour |
|---|---|
| **Draft** | Opening a flow **never writes to it** (F-QA-002). The first edit creates a draft from the live version. Every edit autosaves to the draft (debounced 800 ms). The header shows the result truthfully: "Saving…", "Saved to draft 11:42", or "Not saved · kept on this device · Retry". `beforeunload` and a router guard protect any unsaved local changes. |
| **Live version** | A strip under the header always says what callers hear: "Live v7 is answering calls on +91 ••••• 2210 since 12 Sep. Callers keep hearing v7 until you publish this draft." It links to "Compare with live". A flow with no live version reads "Not live yet. Publish to start taking calls". |
| **Publish…** | The only primary button. It opens a dialog with the **readiness path** (below), a "What changed" summary (+2 steps, 1 edited, 0 removed, shown as a diff on the canvas), an optional note, and a [Publish v8] button. Publishing creates an immutable version. The API already stores `version_no` and `parent_flow_id`. |
| **Undo publish** | For 10 minutes a toast offers "v8 is live. Undo". After that, Version history lets you "Restore v7 as draft". |
| **Test call** | Tests **the draft** (see 14.6). It never touches live. |
| **Delete step** | Delete or Backspace removes the step and its edges, and an Undo toast appears (Ctrl Z works too). Deleting a step with more than 3 connections asks for confirmation first (F-FLOW-019). |
| **Undo/Redo** | Covers every canvas mutation (add, connect, move, delete, edit). It is disabled when there is nothing to undo (F-FLOW-005). |
| Removed | The Save button, the "Private" pill (it moves to the ⋯ menu as a visibility setting), and the green glowing ACTIVATE button (F-FLOW-018) |

**Publish readiness path**
- **Blocking checks:**
  - ✓ No blocking issues. Warnings are listed and can be acknowledged.
  - ✓ Calling number assigned (outbound) or number connected (inbound)
- **Advisory checks:**
  - ✓ Test call placed on this draft ("Tested 11:40 · connected 1:52"). This can be skipped, with the reason recorded.
  - ✓ Wallet covers the next day's volume at the current rate
  - ✓ Calling hours set for outbound flows

### 14.2 Layout (desktop ≥1440)

```
┌─ ← │ Site visit booking ▾ │ (Draft · 4 changes) Saved 11:42 │  ↶ ↷ │ ⊞ Tidy up ⋯ │ (⚠ 1 issue) [☏ Test call] [Publish…] ┐
├─ (● Live v7) v7 is answering calls on +91 ••••• 2210 since 12 Sep. Callers keep hearing v7 until you publish.  Compare ┤
├──────────────────┬────────────────────────────────────────────────┬──────────────────────────────┤
│[Add step|Outline]│ [W]When → [C]Check → [D]Do → [E]End   (legend)  │ [C] Check · Ask a question ⋯ ✕│
│[⌕ Find a step… /]│                ┌──────────────────┐            │ Ask: still looking?          │
│ When start call  │                │[W] When·Outbound │            │──────────────────────────────│
│  [W] Outbound    │                │Call the Site list│            │ What the agent asks          │
│  [W] Inbound     │                └────────●─────────┘            │ ┌──────────────────────────┐ │
│ Check listen…    │                         ▼                      │ │Are you still looking for │ │
│  [C] Ask         │                ┌──────────────────┐            │ │a 2 or 3 BHK near {{city}}│ │
│  [C] Branch    + │                │[D] Do·Say        │            │ └──────────────────────────┘ │
│  [C] Verify      │                │Greet & introduce │            │ Type {{ to add lead details. │
│ Do act…          │                └────────●─────────┘            │ Answers to listen for        │
│  [D] Say         │                         ▼                      │ (Yes)  › [Book a site visit▾]│
│  [D] Knowledge   │              ╔══════════════════╗ ← selected    │ (No)   › [Send the brochure▾]│
│  [D] WhatsApp    │              ║[C] Check·Ask     ║   2 px Peacock│ (No reply·6 s)›[Call back… ▾]│
│  [D] Book        │              ║Ask: still looking?║             │ [+ Add an answer]            │
│  [D] Transfer    │              ║ (Yes) (No) (No reply)║           │ › Advanced: retries, timeout │
│ End finish…      │              ╚══●════●══════●═══╝             │                              │
│  [E] End call    │          ┌──────┘    ▼       └──────┐          │                              │
│                  │   ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │                              │
│                  │   │[D] Book visit│ │[D] WhatsApp ⚠1│ │[E] Call │ │                              │
│                  │   └──────●───────┘ └──────●───────┘ │back 2d  │ │                              │
│                  │          ▼                ▼         └─────────┘ │                              │
│                  │   ┌──────────────┐ ┌──────────────┐             │                              │
│                  │   │[E]✓ Visit    │ │[E] Not       │             │                              │
│                  │   │   booked     │ │ interested   │             │                              │
│                  │   └──────────────┘ └──────────────┘             │                              │
│                  │ [− 86% + │ ⤢]                        [▦ Map]    │ ✓ Saved to draft 11:42 Preview│
└──────────────────┴────────────────────────────────────────────────┴──────────────────────────────┘
```

At 1440 px the app sidebar collapses to a 56 px rail inside the designer. The canvas gets 55–60% of the viewport, up from 36–52% (F-FLOW-022). There is one header row of 56 px plus the 37 px live strip, down from a 180 px two-row header.

### 14.3 Canvas and node anatomy
- **Canvas.**
  - `canvas` background with a 20 px dot grid at 13% ink (9% in dark).
  - Snap to 8 px. Top-down layout.
  - **Tidy up** runs ELK layered auto-layout in about 250 ms.
  - New steps are inserted **after the selected step, auto-connected, with collisions avoided**. They are never stacked on top of existing steps (F-FLOW-009, F-FLOW-021).
- **Node.**

| Property | Spec |
|---|---|
| Width | 224–264 px fixed (240 default), sized by the stage |
| Surface | `surface`, 1 px `border-2`, 12 px radius, `e1` |
| Header | 24 px stage tile, the stage word in the stage colour ("Check"), and the type in `text-3` ("· Ask a question") |
| Title | 14/600 |
| Body | 13/19 `text-2`, clamped to 2 lines. Variables show as chips. |
| Footer (branching steps) | Named output chips ("Yes", "No", "No reply", "Found / Not found", "Verified / Failed"), with an 11 px port under each and a **24 px hit area** |

  Input ports appear only on hover, focus or while connecting. The arrowheads on edges show direction (F-FLOW-020, F-A11Y-001).
- **Node states.**

| State | Treatment |
|---|---|
| Hover | `border-strong` |
| Selected | 2 px Peacock outline (offset 3) + `e2`. Its outgoing edges and ports turn Peacock. |
| Keyboard focus | The same outline as selected, plus a "Focused" hint in the status bar. Focus is never invisible (F-A11Y-007). |
| Warning | Amber border + a "⚠ n" badge in the header. The body line states the problem. |
| Error (blocking) | Danger border + a badge. Publish stays blocked with the reason. |
| Unreachable | 55% opacity + "Not connected to the start" |
| Running (test call) | Peacock left stripe + a "Now" chip. Edges already traversed turn Peacock (14.6). |

- **Edges.** A 1.5 px `border-strong` stroke (3:1 against the canvas) with a small arrowhead, routed as smooth steps. They turn Peacock on hover or selection. Dashed edges mean exactly one thing, "fallback / no reply", and the legend says so. There are no marching ants and no always-animated edges (F-FLOW-011).
- **End nodes** name an **outcome**: goal reached, follow up, closed or failed. They are colour-coded by that outcome, and the outcome flows into Call history, Leads status and Analytics. This closes the "no outcome taxonomy" gap in the canvas.
- **Trigger nodes** state where calls come from and when: "Calls the Site visits list · 9:00 to 21:00 IST · up to 2 tries". That removes the ambiguity between inbound and outbound.
- **Minimap** is off by default and toggled with "Map". It uses neutral node rectangles with a Peacock viewport frame and is hidden below 1280 px (F-FLOW-023). Zoom shows as a % and has Fit.

### 14.4 Palette, inspector and validation
- **Palette** (256 px): a segmented control [Add step | Outline], search (`/`, synonym-aware), and four stage groups, each item with a full name and a one-line description. There is no truncation, no "START HERE" duplicate group and no fake "+10" button (F-FLOW-035). Click or Enter adds after the selected step. Dragging also works. A step has **one name** in the palette, node, inspector and toasts (F-FLOW-027).
- **Inspector** (328–360 px, right side):
  - It shows only the fields the step needs, with plain labels, helper text and a variable picker triggered by `{{` that warns on unknown variables (F-FLOW-028).
  - The **"Answers to listen for" / "Paths" list wires steps with a "Go to" select**, which is the keyboard and screen-reader alternative to dragging (A8).
  - Advanced fields are folded.
  - Integration dependencies are stated inline, for example "Needs Google Calendar · Connect…" (F-FLOW-030).
  - Read-only IDs and positions move into ⋯ › Details (F-FLOW-033).
  - Invalid values are rejected with a reason and never autosaved (F-FLOW-015).
- **Validation** is continuous (debounced 500 ms) and checks semantics as well as wiring: missing template, unreachable step, a branch without "no reply", an unknown variable, or a transfer number that isn't E.164.
  - The header button shows "⚠ n issues", which opens a list. Clicking an issue selects and centres its node.
  - Node badges match the list.
  - When clean, the header shows "No issues · checked 11:42" in `text-3`.
  - Results are recomputed when you switch flows (F-FLOW-010).

### 14.5 Creating a flow (fixes F-FLOW-013, F-FLOW-031)
"New call flow" opens a sheet:
1. **Name** (required, with a duplicate-name warning; F-VIS-037).
2. **Start from:** a gallery of 6 templates, each drawn as a mini When → Check → Do → End strip. The templates are Lead qualification, Site visit booking, EMI reminder, COD confirmation, Appointment booking and Support FAQ. Or start from Blank, or **Describe it**.
3. **Describe it** is the AI draft. It uses a multi-line prompt with examples in English and Hindi. The result shows as a preview on a new draft canvas, with added steps outlined. The user picks [Use this draft] or [Try again]. It never replaces an open flow.

Every template passes validation out of the box.

### 14.6 Test mode (fixes F-FLOW-016)
**Test call** opens a 280 px dock at the bottom with two options:
- [Call my phone], using the verified profile number
- [Talk in browser]

While the test runs:
- The dock shows the status line, timer, transcript and captured variables.
- On the canvas, the current node gets the "Now" chip and traversed edges turn Peacock.
- When the test ends, the dock shows the outcome and "Tested 11:40". That result feeds the Publish readiness check.

The test always runs against the draft, and the dock says "Testing draft (not live)".

### 14.7 Keyboard and screen readers (fixes F-A11Y-001, F-A11Y-028, F-FLOW-006, F-FLOW-024)
| Key | Action |
|---|---|
| Tab / Shift+Tab | Enter or leave the canvas. Focus lands on the trigger. Tab order follows the flow order, not creation order. |
| ↓ / ↑ | Next / previous step along the default path |
| ← / → | Move between sibling branches |
| Enter | Open the inspector with focus on its first field. Esc returns to the node. |
| A | "Add step after…" (palette search, focused) |
| L | "Connect to…" (a list of steps to link from the focused output) |
| Delete | Remove the step, with an Undo toast |
| Ctrl/⌘ Z, Ctrl/⌘ Shift Z, Ctrl/⌘ D | Undo, redo, duplicate |
| ? | Shortcut sheet: a proper dialog that fits the viewport and shows keys for the user's platform |

- The **Outline** view is a full, editable alternative: a tree of steps with the stage, title and paths. It supports reordering and reconnecting through menus.
- Nodes expose names such as "Step 3 of 8, Check, Ask a question: still looking? 3 answers, selected".
- Canvas changes are announced through the existing polite live region.
- The selection is deep-linked with `?step=<id>&v=draft`.

### 14.8 Breakpoints
| Range | Behaviour |
|---|---|
| ≥1440 | Palette + canvas + inspector, with the app sidebar as a 56 px rail |
| 1024–1439 | Palette becomes a 48 px strip with an "Add step" popover. The inspector is an overlay sheet (360 px) that opens on select. The toolbar keeps every action; lower-priority ones fold into ⋯ and never clip Publish (F-RWD-003). |
| 768–1023 | Read-only canvas (pan and zoom work by touch) plus the Outline. Wording edits happen in the inspector sheet. Test call works. A note reads: "Structural editing needs a screen 1024 px or wider." |
| <768 | Outline view only, as shown in the specimen. Review, fix wording, check issues, Test call and Publish (the readiness path still runs) |

---


## 15. How Clear Path fixes the audit's top 15

| # | Finding | Clear Path answer |
|---|---|---|
| 1 | F-FLOW-001: autosave into the live flow, silent Backspace delete | Draft/Live split, Publish with a readiness path, Undo toast on delete, version history (§14.1) |
| 2 | F-UX-001: org/team setup dead end | Settings › Workspace and team gets a single "Create workspace" flow. Readiness path step 6 is "Invite your team", with a disabled reason if the user's role can't do it. Integrations explain the blocker inline. |
| 3 | F-QA-001: contradictory /about claims | Out of the visual scope, but the Status-line principle ("say what is true") applies to marketing copy. A single source of truth for claims is shared by /security and /about. |
| 4 | F-A11Y-001: canvas is mouse-only, 9 px handles | Keyboard model, Outline view, the "Go to" path list, and 11 px ports with 24 px hit areas (§14.7) |
| 5 | F-A11Y-002: Call Reports is mouse-only | Call history rows are links or buttons. The detail opens in a focus-managed sheet with a deep link, and the transcript comes first. |
| 6 | F-QA-002: writes on open, "Up to date" when saves fail | Opening never writes. The save status line is truthful and offers Retry. |
| 7 | F-FLOW-004: "FLOW VALIDATED" on invalid flows | Continuous validation, "n issues" in the header, node badges, Publish blocked by errors |
| 8 | F-A11Y-004: the `c` key dials | `C` opens the readiness popover. Single-key shortcuts can be switched off. |
| 9 | F-QA-005: only 50 of 121 calls | The Call history table uses server pagination and URL filters. Counts state their scope ("121 calls · showing 1–50"). |
| 10 | F-QA-006: two legs per test call | One call record per conversation. Legs appear inside the detail. Test calls are tagged "Test" and excluded from KPIs by default. |
| 11 | F-UX-002: wallet banner → Profile | Wallet in the sidebar opens Billing. "Top up…" opens the top-up sheet directly. The global banner is gone. |
| 12 | F-UX-006: "You're live" on an account that can't call | The readiness path on Home and in onboarding ends only after a connected test call |
| 13 | F-QA-010: /signup lands on sign-in | Sign-up is its own screen in the same Clear Path shell: "Create your workspace". Access approval uses a status line: "Pending approval · usually within 1 working day". |
| 14 | F-RWD-001: phones reach 6 of 12 sections | Bottom bar of 5 plus a More sheet with every destination. Sign out lives in the account menu. |
| 15 | F-A11Y-008/009, F-VIS-003: muted text and black-on-blue fail AA | `text-3` at 5.49:1, white on Peacock at 6.16:1, a 12 px floor, and every pair in §3 listed with its ratio |

It also addresses the "five dialects" (F-VIS-001): one shell, one type family, one accent, one button, input and badge system, and one header.

---

## 16. Risks and trade-offs

1. **A new accent is a brand decision.** Peacock replaces both the app blue and the marketing violet, so marketing, the logo lock-up and the login screen must move with it, or the funnel breaks again (F-QA-013). **Mitigation:** Peacock comes from the existing logo gradient. Ship the marketing update alongside the app.
2. **Teal sits near success green.** At a glance, "Live" (green) and the primary (Peacock) could be confused. **Mitigation:**
   - The hues are 48° apart.
   - Success always carries a dot or check plus a word.
   - The primary is always a filled button, never a badge.
   - Charts use Peacock as series 1 only.
3. **Guidance can feel slow to power users.** Descriptions, 52 px rows and readiness checks add friction. **Mitigation:**
   - Compact density
   - Hiding palette descriptions
   - `Ctrl K`
   - The readiness popover remembers "tested today"
   - Advisory checks never block
   - Blocking checks exist only where real money or real customers are at stake
4. **Inputs at 3:1 look heavier** than the 1.5:1 borders of the reference products. This is deliberate for newcomers and for WCAG 1.4.11. If research shows it reads as heavy, it can drop to about 2.6:1 only if the input fill also changes. That is a documented trade-off, not a silent one.
5. **Two extra hues (indigo, plum) for flow stages** stretch the one-accent rule. They are confined to 20–28 px tiles in flow contexts. Node frames stay neutral, and selection stays Peacock.
6. **Backend dependencies:**
   - Draft/publish versions (partly present: `version_no`, `parent_flow_id`)
   - Continuous server-side validation
   - Cost estimates, which need per-second rates and median call length
   - Deduplicating two-leg calls
   - Calling-hours and do-not-call data

   The UI can phase these in with truthful fallbacks, for example "Estimate unavailable. Rates: ₹0.04 per second", but it must never fake them.
7. **Renaming destinations** (Live calls, Call history, Rep desk) breaks muscle memory and docs. **Mitigation:** redirects, "formerly" entries in search for 90 days, and a one-time "What's new" sheet.
8. **Compliance cues** (recording disclosure, calling hours, DND) need the product owner's confirmation (digest 5.11 #6). The readiness path is designed so checks can be added or removed without layout change.
9. **Devanagari font weight.** Noto Sans Devanagari adds about 100–150 KB. It is loaded only on demand with `unicode-range`.
10. **Light as the default** differs from today's dark-first marketing. Dark keeps full parity, and marketing may stay dark-leaning provided it uses the same tokens.

---

## 17. Implementation notes (for the frontend developer)

- **Tokens:** define the CSS variables in §3 on `:root` and override them under `.dark` **and** `@media (prefers-color-scheme: dark)` for "System". Map them into Tailwind v4 `@theme`:

```css
@theme {
  --color-canvas: var(--canvas); --color-surface: var(--surface); --color-surface-2: var(--surface-2);
  --color-border: var(--border); --color-border-strong: var(--border-strong);
  --color-fg: var(--text); --color-fg-2: var(--text-2); --color-fg-3: var(--text-3);
  --color-accent: var(--accent); --color-accent-soft: var(--accent-soft); --color-on-accent: var(--on-accent);
  --color-success: var(--success); --color-warning: var(--warning); --color-danger: var(--danger);
  --font-sans: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --radius-xs: 5px; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
  --shadow-e1: var(--e1); --shadow-e2: var(--e2); --shadow-e3: var(--e3);
}
```

  Add a lint rule that bans arbitrary values (`text-[9px]`, `bg-[#…]`, `rounded-[9px]`) and raw palette classes in app code (F-VIS-020).
- **Primitives:** adopt one accessible primitives layer (Radix UI or React Aria) for Dialog, Sheet, Popover, Menu, Tabs, Tooltip, Toggle and Checkbox. That gives focus traps, Esc and focus return for free (F-A11Y-005). Add a single toast system with Undo support.
- **Components to build first**, in this order: `Button` (4 variants × 3 sizes), `Input`/`Field`, `Badge`, `StatusLine`, `ReadinessPath`, `PageHeader`, `AppShell`/`Sidebar`/`BottomBar`, `DataTable` (TanStack Table), `Sheet`, then the Flow node set (`StageTile`, `Node`, `Port`, `Edge`).
- **The specimen is the reference.** `clarity.html` contains working CSS for every component above. Class names are illustrative; the values are normative.
- **Answers to the audit's open decisions (5.11)** for this direction:

| Decision | Answer |
|---|---|
| Accent | Peacock |
| Default theme | Light default, with dark parity and System |
| Case | Sentence case |
| Save | Removed; autosave to draft plus Publish versions |
| Concurrent editing | Show presence ("Neel is editing") and lock Publish to one person at a time |
| Compliance | Recording disclosure, calling hours, recently called and do-not-call in the readiness path |
| Sidebar latency | Removed; the call line quality shows only during calls |
| Minimum editing viewport | 1024 px |
