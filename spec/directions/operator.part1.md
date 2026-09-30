# Switchboard: the precision operator console

**Direction for the Vaani Labs redesign.** Angle: utility-first and calm, for teams who run call operations all day. Premium through precision and restraint.

**Essence (one line):** A calm operator's console: dense where you scan, quiet where you decide, and never wrong about what is live.

| Item | Where |
|---|---|
| This spec | `spec/directions/operator.md` |
| Visual specimen (light and dark follow the OS) | `spec/directions/operator.html` |
| Renders | `operator-light.png` (1440, full page), `operator-dark.png`, `operator-mobile.png` (390) |
| Evidence | `audit/consolidated/*` (finding ids such as F-FLOW-001 are cited throughout) |

**The name.** A switchboard is where Indian businesses historically ran their phone operations: a panel of labelled keys, one lamp per live line, an operator who can see every connection at once. The metaphor sets the rules. Each control is labelled and has one place. A lamp lights only when a line is really live. The operator always knows what is connected, and a key is never pressed by accident.

**What it keeps from today (audit section 4):** the semantic token layer on Tailwind v4 `@theme`, the cool neutral ramp (`#111725`-family ink), Lucide icons, the 8 px radius convergence, the Call Reports / Assistant page template (sans, sentence case, title + description + actions on the right), phone masking, the Leads keyboard model, the Flow toolbar's labelled buttons and live region, the validator's Jump, and the Settings safety patterns.

**What it changes:** five dialects become one (F-VIS-001). JetBrains Mono stops being the body face. The brand hue stops changing with theme and feature (F-VIS-004). Decoration goes (F-VIS-022, F-VIS-029). Truthful state replaces fixed status pills (F-FLOW-003, F-FLOW-004, F-UX-018). Anything that bills or goes live needs an explicit commit (F-FLOW-001, F-UX-013).

---

## 1. Design principles

Each principle comes with what it means on real Vaani screens. They are ranked: when two conflict, the higher one wins.

### P1. State is truth
Show only what the system can prove, and show it in words.
- Flow Designer header: `Live v7` · `Draft · from v7` · `Saved 11:24` / `Unsaved changes` / `Saving…` / `Couldn't save · Retry`. There is no permanent "validated" pill. The issues chip (`No issues`, `1 warning`, `2 errors`) is recomputed on every change (F-FLOW-003, F-FLOW-004, F-UX-004).
- The status line (signature 1) shows only computed facts: the live flow, whether the calling number is ready, the wallet balance and the calls in progress. The hard-coded "SYS: ONLINE · 22ms" goes (F-UX-018).
- Onboarding never says "You're live" until number, wallet and flow checks pass. Until then the status line reads `Finish setup (2 of 4)` (F-UX-006).
- The Cockpit shows only data from the selected lead and the current call. No demo fields are mixed in (F-UX-003).
- Latency appears only during a call, with a word: `Good · 180 ms`.

### P2. Colour means state, shape means type
Chrome is graphite. One accent (Neel) marks operator intent: the primary action, focus, selection, links and the active item. Green, amber and red appear only for call or record state (live, ringing, failed, low balance, errors).
- Flow node types are told apart by **shape and glyph**, not colour (see 15.3). This removes the Tailwind-400 title colours that measure 1.48 to 2.34:1 (F-FLOW-007, F-FLOW-036).
- ACTIVATE stops being green and Import stops being teal. Meeting Agent loses its violet (F-VIS-004, F-VIS-006).
- Every state carries a label and an icon as well as its colour (WCAG 1.4.1, F-A11Y-019).

### P3. Density is a setting, not an accident
Two densities, chosen per user and stored per device: **Standard** (40 px rows, 32 px controls) and **Compact** (32 px rows, 28 px controls). Touch layouts use 48 px rows and 44 px controls automatically (`pointer: coarse`).
- Data text never drops below 13 px. The only 11 px text is uppercase table headers. Today 36% of text is under 12 px (F-VIS-002, F-A11Y-008).
- Leads fits about 12 rows at 1440x900 in Standard and 16 in Compact. Today it fits 7 (F-VIS-009).

### P4. Every action has an address
Keyboard first, never keyboard only.
- `⌘K` opens a command menu that lists every destination and every page action.
- Every button tooltip shows its shortcut as a keycap. A `?` sheet lists all shortcuts.
- Focus is always visible: a 2 px Neel ring with a 2 px offset.
- Flow nodes, ports and table rows can all take focus (F-A11Y-001, F-A11Y-002, F-A11Y-010).
- Single-key shortcuts can be switched off (WCAG 2.1.4). No single key ever places a call: `C` opens the pre-flight (F-A11Y-004).
- Selections, filters, open records and the open flow live in the URL (F-UX-031, F-QA-016).

### P5. Cost before commit
Anything that dials, bills or goes live shows who, how many, which version and the rupee estimate before it runs.
- **Pre-flight card:** Leads bulk call, row call, Cockpit "Place call" and the flow's "Call me with this draft" (F-UX-013).
- **Publish sheet:** flows publish through a sheet with the validation result and a diff (F-FLOW-001).
- **Assistant:** plan steps are listed, and side-effectful steps wait for approval, reusing the Personal Agent autonomy levels (F-UX-022).

### P6. One frame, many screens
One shell: a grouped sidebar, a 56 px page header (title, one-line meta, at most one primary), a content area and the 28 px status line.
- Canvas and table pages are full-bleed. Reading and setup pages sit in a 720 px column, or 1040 px with a side navigation (Settings).
- One page-title style (20/600, sentence case) replaces 13 H1 treatments (F-VIS-005, F-VIS-034).

### P7. Quiet chrome, loud data
- No noise, grid, hatch, HUD brackets or glows (F-VIS-022, F-QA-038).
- No idle animation (F-A11Y-022). The idle Cockpit ring is replaced by a pre-call checklist (F-VIS-029).
- The largest element on any page is the work itself: the table, the canvas or the transcript.
- Borders do the structural work. There is at most one level of containment: no box inside a box inside a box (F-VIS-016).

---

## 2. Typography

### 2.1 Families (all free on Google Fonts)

| Role | Family | Weights | Loaded via |
|---|---|---|---|
| UI sans | **IBM Plex Sans** | 400, 500, 600 (+ 400 italic for quotes only) | `next/font/google`, `display: swap`, subset `latin` + `latin-ext` |
| Data mono | **IBM Plex Mono** | 400, 500 | `next/font/google` |
| Hindi / Marathi | **IBM Plex Sans Devanagari** | 400, 500, 600 | `next/font/google`, `unicode-range` U+0900–097F so it only downloads when Devanagari renders |

Stacks:
- `--font-sans: "IBM Plex Sans", "IBM Plex Sans Devanagari", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- `--font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`

**Why Plex, and not the shipped Hanken Grotesk.** The audit calls Hanken the face to keep (section 4), and it is a sound default. For this angle, Plex is the stronger fit, for four reasons:
1. **Hindi parity.** It is one superfamily with a **designed Devanagari companion**. Hindi transcripts are core to "the Voice AI that speaks India", and Plex Sans Devanagari shares its x-height and stroke logic with Plex Sans. Mixed HI/EN turns ("Saturday ho sakta hai…" next to "शनिवार सुबह…") therefore sit on one rhythm instead of falling back to Nirmala UI or Mangal, as Hanken does today.
2. **Data alignment.** Plex Mono is its metric sibling, so phone numbers and timecodes set in mono sit on the same baseline and optical size as the surrounding sans.
3. **Tabular figures by default.** Verified in the render: `1111111` and `0000000` measure the same width. Rupee columns, timers and counts align without extra CSS (the `tnum` feature is still set on numeric cells for safety).
4. **Character.** Its engineered, slightly squared curves read as "instrument" rather than "marketing".

Trade-off: the marketing site must move off Hanken too, because one brand should use one face (see section 16, Risks). Retire Sora, Instrument Serif, Syne, Rajdhani, JetBrains Mono, Geist, DM Sans and Inter registrations (F-VIS-036). Fix the root variable so nothing falls back to the system sans (F-VIS-008): define `--font-sans` on `html`, not on a `body` class.

### 2.2 Type scale

Sizes are in px, as size/line-height. Tracking is in em. The weight ceiling is 600.

| Token | Size / LH | Weight | Tracking | Use |
|---|---|---|---|---|
| `caps-11` | 11/16 | 600 | +0.04 | UPPERCASE. Table column headers and canvas phase labels only |
| `meta-12` | 12/16 | 400 / 500 | 0 | Help text, timestamps, tags, status line, tooltips |
| `sm-13` | 13/20 (Compact 13/18) | 400 / 500 | 0 | Table cells, sidebar items, buttons, field labels (500) |
| `body-14` | 14/20 | 400 | 0 | Default UI text, inputs, dialog body |
| `read-15` | 15/24 | 400 | 0 | Transcripts, Assistant replies, Knowledge previews (max 68ch) |
| `deva-15` | 15/26 | 400 | 0 | Devanagari runs (`lang="hi"`); line-height 1.7 so matras clear |
| `title-16` | 16/24 | 600 | 0 | Panel, card, sheet and dialog titles |
| `title-20` | 20/28 | 600 | −0.01 | **Page title** (the single H1 on every app page) |
| `title-24` | 24/32 | 600 | −0.015 | Setup step headings, empty-state headings |
| `num-28` | 28/32 | 500 | −0.02 | KPI and balance numerals (tabular) |
| `display-40` | 40/48 | 600 | −0.025 | Marketing and docs only. Marketing may go to 56/60 at −0.03 |
| `mono-12` | 12/16 | 400 | 0 | Timecodes, step and record ids, keycaps (500) |
| `mono-13` | 13/20 | 400 | 0 | Phone numbers, `{{variables}}`, code, API keys |

Mobile inputs use 16 px text so iOS does not zoom on focus (F-RWD-018). Headings use `text-wrap: balance` and short paragraphs use `pretty`.

### 2.3 Rules for mono and uppercase

**Mono is allowed only for:** masked phone numbers (`+91 •••••• 4821`), timecodes and durations (`00:31`, `02:14`), step, call and flow ids (`Q1`, `call_7c21e0`), template variables, code and API keys, and keycap labels.
Mono is **never** used for labels, headings, body text, buttons, money or counts. Money and counts use Plex Sans, which is tabular by default. This retires the HUD dialect (F-VIS-001, digest 5.4).

**Uppercase is allowed only for:**
- `caps-11` table headers and canvas phase labels ("TRIGGER", "LOGIC")
- language codes (`HI`, `EN`, `TA`)
- keycap glyphs (`Esc`, `⌘`)

Buttons, nav, page titles, tags, field labels and section headings are **sentence case** ("New lead", "Publish v8…", "Callback due"). Literal capitals in strings ("AGENT COCKPIT", "CONNECT") are removed from copy, not hidden with CSS.

**Numbers:** `Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR'})` gives lakh grouping (`₹2,340.50`, `₹85 L`). Wallet amounts have 2 decimals and KPIs have 0. Put a non-breaking space between a number and its unit (`6 s`, `180 ms`). Use one date grammar: `Today 10:42`, `Yesterday`, `3 days ago`, then `21 Sep 2026`, with `Intl.DateTimeFormat('en-IN')` (F-VIS-024).

---

## 3. Colour

### 3.1 Neutral ramp: graphite (cool, hue about 220°)

This continues today's `#111725` ink family, so the product still feels like Vaani.

| Step | Light | Role (light) | Dark | Role (dark) |
|---|---|---|---|---|
| 0 | `#FFFFFF` | surface | `#0D0F13` | bg |
| 50 | `#F6F7F9` | bg, canvas | `#14171C` | surface |
| 100 | `#F1F3F6` | surface-2 (inset, hover, sidebar hover) | `#1A1E24` | surface-2 |
| 150 | `#E8EBF0` | surface-3 (pressed, neutral selected) | `#222730` | surface-3 |
| 200 | `#E3E6EC` | border (hairline, decorative) | `#262B33` | border |
| 300 | `#C9CED8` | border-strong (secondary buttons, frames) | `#333A45` | border-strong |
| 400 | `#A3AAB7` | text-disabled | `#5C6370` | text-disabled |
| 500 | `#858D9C` | control (input, checkbox, edge) | `#666E7D` | control |
| 600 | `#5F6878` | text-3 (muted, placeholders) | `#8C94A2` | text-3 |
| 700 | `#434B5B` | text-2 (secondary) | `#B3BAC6` | text-2 |
| 800 | `#2A303C` | – | `#D3D8E0` | – |
| 900 | `#121722` | text (ink), status-line bg | `#E9ECF1` | text |

### 3.2 Role tokens, with measured WCAG 2.x contrast

| Token | Light | Dark | Measured contrast (light · dark) |
|---|---|---|---|
| `--bg` | `#F6F7F9` | `#0D0F13` | text on it 16.72 · 16.20 |
| `--surface` | `#FFFFFF` | `#14171C` | text 17.93 · 15.17 |
| `--surface-2` | `#F1F3F6` | `#1A1E24` | text-3 5.05 · 5.48 |
| `--surface-3` | `#E8EBF0` | `#222730` | text-3 4.70 · 4.91 |
| `--border` | `#E3E6EC` | `#262B33` | 1.25 · 1.26 (decorative dividers only) |
| `--border-strong` | `#C9CED8` | `#333A45` | frames and secondary buttons (their labels identify them) |
| `--control` | `#858D9C` | `#666E7D` | **3.34 · 3.50 on surface** (≥ 3:1 for input, checkbox and port boundaries, WCAG 1.4.11) |
| `--text` | `#121722` | `#E9ECF1` | 17.93 · 15.17 |
| `--text-2` | `#434B5B` | `#B3BAC6` | 8.76 · 9.20 |
| `--text-3` | `#5F6878` | `#8C94A2` | 5.62 · 5.88 on surface; 5.24 · 6.28 on bg |
| `--text-disabled` | `#A3AAB7` | `#5C6370` | 2.34 · 2.97, allowed for disabled controls only, and always paired with a reason |
| `--accent` (fill) | `#2C4BD1` | `#3F5CE8` | white label 6.92 · 5.37 |
| `--accent-hover` / `-press` | `#2440B8` / `#1F37A0` | `#4A66F0` / `#3551D6` | white label: light hover 8.40, dark hover 4.72 |
| `--accent-text` (links) | `#2C4BD1` | `#8FA3FF` | 6.92 · 7.57 |
| `--focus` | `#2C4BD1` | `#8FA3FF` | 6.46 · 8.08 against bg |
| `--accent-soft` + text | `#2440B8` on `#EEF1FD` | `#A9B8FF` on `#1B2340` | 7.45 · 8.07 (selected rows, variable chips, info) |
| `--success` soft pair | `#11703F` on `#E7F5EC` | `#6FD39A` on `#16271E` | 5.47 · 8.53; solid `#15803D` with white label 5.02 |
| `--warning` soft pair | `#8A4B00` on `#FDF3E1` | `#F5B544` on `#2C2312` | 6.18 · 8.53 |
| `--danger` soft pair | `#B42318` on `#FDECEA` | `#F28B82` on `#2E1A1A` | 5.75 · 6.87; solid `#C0271C` with white label 5.92 |
| `--live` (dot only) | `#16A34A` | `#4CC47F` | non-text, next to a "Live" label |
| `--sl-bg` / `--sl-text` | `#121722` / `#C9CED8` | `#1A1E24` / `#B3BAC6` | 11.36 · 8.57 |
| `--canvas` / `--canvas-dot` | `#F6F7F9` / ink at 13% | `#101318` / white at 10% | decorative |

Every text pair above was computed with the WCAG relative-luminance formula. The two failing pairs the audit flagged are fixed. Muted `#7A8397` (3.5 to 3.8:1) becomes `#5F6878` (5.62:1). Black on blue (3.83:1) becomes white on `#2C4BD1` (6.92:1) (F-A11Y-008, F-A11Y-009).

### 3.3 The accent: Neel `#2C4BD1`

- **Why blue, and why this blue.** The accent's job in an operations console is *operator intent*. It must never be confused with call state: green is live, amber is ringing or warning, red is failed. Blue is the one hue that collides with none of them, which is why control rooms and avionics use it for "selected" or "commanded".
- **How it differs.** `#2C4BD1` (hue about 229°) is deeper and inkier than generic SaaS blue-600 and less violet than Stripe's. It sits close to the app's shipped `#2F5FE0`, so the change reads as continuity.
- **The name.** Neel (नील) is Hindi for indigo, and "indigo" itself comes from the Greek for "from India". It is a colour India historically exported to the world. The story is a naming device, not decoration.
- **One hue in both themes.** It never turns violet in dark mode (F-VIS-004). Dark uses `#3F5CE8` for fills and `#8FA3FF` for text and focus.
- **Where it may appear:**
  - the one primary button per region
  - the focus ring
  - selected rows, tabs and nodes
  - links
  - the active nav icon
  - variable chips
  - flow step chips in transcripts
  - the test-run trace on the canvas
- **Where it may not appear:** decorative fills, gradients, glows, icons at rest, charts' default series (unless highlighted) and the marketing hero's text.

### 3.4 Semantic use (state only)

| State | Colour | Examples |
|---|---|---|
| Live / success / completed | green | Live call, `Live v7`, Interested, Visit booked, DND clear |
| Pending / ringing / low balance / warning | amber | Dialling…, Ringing…, Callback due, Wallet ₹42.10, 1 warning |
| Failed / destructive / error | red | Failed, Couldn't save, 2 errors, Delete flow… |
| Info | accent-soft | Converted, tips, variable chips |
| Neutral outcomes | graphite tag | New, Contacted, Ended, No answer, Not interested |

A tag never uses colour alone. It carries a text label, and an icon when it sits outside a labelled column (F-A11Y-019). A dot appears only for real live state (digest anti-pattern 7).

### 3.5 Chart palette (separate from chrome)

| Series | Light | Dark | Contrast on surface (light) |
|---|---|---|---|
| 1 | Neel `#2C4BD1` | `#8FA3FF` | 6.92 |
| 2 | Teal `#13867A` | `#3FB8A8` | 4.45 |
| 3 | Ochre `#B7791F` | `#E0A94A` | 3.64 |
| 4 | Rose `#C23F6E` | `#F07BA3` | 4.96 |
| 5 | Slate `#5F6878` | `#8C94A2` | 5.62 |

Every series is at least 3:1 on its surface in both themes. The series stay colour-blind distinguishable because each also gets a direct label or a pattern. Sentiment always uses the semantic set plus an icon plus a word, never the series palette (F-VIS-011).

### 3.6 Mapping from today's tokens (for the migration PR)

| Today | Becomes |
|---|---|
| `--saffron` (`#2f5fe0` light / `#7c6bf5` dark) | `--accent` (`#2C4BD1` / `#3F5CE8`) |
| `--peacock*` (teal / cyan) | retired; teal survives only as chart series 2 |
| `--text-muted` `#7a8397` | `--text-3` `#5F6878` |
| `--border-color` / `--border-light` (the "light" one was darker) | `--border` / `--border-strong` |
| `--sentiment-*` | `--success` / `--warning` / `--danger` |
| `--glass-*`, `--grid-line-color`, `--dot-grid-color`, `--noise-opacity`, `*-glow*` | deleted |
| (not present) | add `--control`, `--focus`, `--on-accent`, `--surface-3`, `--live`, `--sl-*`, `--e1..e3`, `--z-*` |
