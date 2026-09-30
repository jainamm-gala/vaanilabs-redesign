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

---

## 4. Spacing, density and layout

### 4.1 Grid and steps
- Base unit 4 px. Steps: **4, 8, 12, 16, 20, 24, 32, 40, 48, 64**. Nothing off-grid (the 9 and 18 px `.btn-*` paddings go).
- Vertical rhythm inside panels:
  - label to control: 6 px
  - control to help text: 6 px
  - field to field: 16 px
  - group to group: 24 px
  - page section to page section: 32 to 48 px
- Page gutters: 24 px from 1024 px up, 20 px on tablet, 16 px on phones.
- Panel padding: 16 px (dense lists), 20 px (inspector, dialogs), 24 px maximum.

### 4.2 Density tokens (P3)

| Token | Standard (default ≥ 1024 px) | Compact (opt-in) | Touch (auto: `pointer: coarse` or < 768 px) |
|---|---|---|---|
| `--row` table row | 40 | 32 | 48 (list item, two lines up to 64) |
| `--ctl` control height | 32 | 28 | 44 |
| `--cell-x` cell padding | 12 | 10 | 16 |
| table text | 13/20 | 13/18 | 15/20 name + 12/16 meta |
| icon in controls | 16 | 16 | 20 |

- **Where density applies:** it is a per-user preference (stored in `localStorage` as a convenience and synced to the profile), toggled from the table toolbar or with `⇧D`.
- **Where it does not apply:** only to data surfaces (Leads, Call reports, Knowledge files, Analytics tables, flow list, Billing transactions). Forms, dialogs and the inspector keep Standard spacing, because setup should feel calm (digest S5).

### 4.3 Fixed dimensions

| Element | Size |
|---|---|
| Sidebar | 232 px expanded, 56 px rail. Hover labels are tooltips, never an overflowing hidden label (F-UX-007) |
| Page header | 56 px: title-20, meta-12 in text-3, actions right |
| Tabs row / table toolbar | 40 px / 52 px |
| Status line | 28 px, desktop and laptop only |
| Inspector / side sheet | 320 px (resizable 280–480); record sheets 440 px |
| Reading column | 720 px; Settings 1040 px including its 200 px sub-nav |
| Dialog | 480 px (confirm), 640 px (create/import) |
| Sticky chrome above content | ≤ 96 px at 900 px tall (header 56 + tabs 40); the 42 px wallet banner is removed (L7, F-UX-028) |

### 4.4 Z-index scale (named, no 9999)
`--z-base 0 · --z-sticky 10 · --z-dropdown 20 · --z-statusline 30 · --z-overlay 40 · --z-modal 50 · --z-toast 60 · --z-tooltip 70` (fixes F-QA-038).

---

## 5. Radius, elevation and borders

**Philosophy: machined, not soft.** Small radii, crisp 1 px lines and a three-step surface ladder. There is no glass or blur (only a flat scrim behind modals), and there are no glows.

| Radius | Use |
|---|---|
| 4 px | Tags, keycaps, checkboxes, variable and step chips, minimap nodes |
| 6 px | Buttons, inputs, selects, segmented controls, menus, filter tokens, tooltips |
| 8 px | Panels, cards, popovers, flow nodes, table frames |
| 12 px | Dialogs, sheets, the app frame on marketing screenshots |
| full | Avatars, the live dot, switches. **No pill buttons, pill tags or pill filter chips** |

- **Nested radii are concentric:** child radius = parent radius − the padding between them.
- **Trigger and Outcome flow nodes** use a 28 px half-round on their entry or exit edge. This is shape grammar, not decoration (15.3).
- **Borders:**
  - 1 px `--border` for dividers and panel edges.
  - 1 px `--border-strong` for frames, secondary buttons and nodes.
  - 1 px `--control` for anything you type into or tick. Controls have a boundary of at least 3:1 (WCAG 1.4.11), and the audit found none that do today.
  - 2 px appears only for focus, selection and the active tab underline.
  - Dashes mean exactly one thing: a fallback path on the canvas.

**Elevation (light theme only; dark uses the surface ladder plus a 1 px ring, no shadow):**

| Level | Value | Use |
|---|---|---|
| e0 | border only | Default for everything |
| e1 | `0 1px 2px rgba(18,23,34,.06)` | Secondary buttons, flow nodes, the raised active nav item |
| e2 | e1 + `0 6px 16px -4px rgba(18,23,34,.12)` | Popovers, menus, the selected node, tooltips, "Jump to latest" |
| e3 | `0 2px 4px …06` + `0 20px 40px -12px rgba(18,23,34,.24)` | Dialogs, sheets, the bulk-action bar, the pre-flight card |

---

## 6. Iconography

- **Lucide only** (already shipped), 1.5 px stroke, round caps.
- **Sizes:**
  - 16 px in controls, tables, the sidebar and the inspector
  - 14 px inside 28 px controls and tags (12 px)
  - 20 px only on the phone bottom bar and empty states
- **Icon-only buttons** get an `aria-label` that includes the shortcut and a tooltip with a keycap (F-A11Y-024). Decorative icons are `aria-hidden`.
- **Replacements:**
  - Letter pseudo-icons ("F", "IG", "{}") become Lucide glyphs or plain text (F-VIS-031).
  - The ↗ glyph appears only on links that really open a new tab.
  - The solid ▼ sort glyph becomes a Lucide chevron with `aria-sort`.
- **Four phase glyphs** (custom, drawn to Lucide metrics): Trigger (filled half-round tab), Logic (diamond), Action (square), Outcome (half-round with terminal bar). They are the only custom icons, and they mirror the node shapes.
- **Nav icons:** Cockpit `activity`, Assistant `bot`, Rep console `headphones`, Meetings `video`, Personal agents `list-checks`, Flows `workflow`, Knowledge `book-open`, Leads `users`, Call reports `file-text`, Analytics `bar-chart`, Billing `wallet`, Settings `sliders-horizontal`. One icon per destination, never reused (F-VIS-032).
- **No emoji in the product UI** (the marketing industry tabs included).

---

## 7. Data visualisation

**Style: instrument panel, not infographic.**
- **Default marks** are ink (`--text-2`) on hairline gridlines (`--border`), with tick labels at meta-12 in text-3, tabular. The one series the user is inspecting is highlighted in Neel. Comparisons ("previous 7 days") are dashed graphite.
- **KPI strip:** a single bordered strip with 1 px dividers (Leads already does this). Each cell holds a caps-11 label, a num-28 value and a meta-12 delta "▲ 12% vs previous 7 days". The arrow and the colour follow **meaning**, not direction: fewer failed calls is green (F-VIS-011).
- **Sparklines** (80×24, 1.5 px ink stroke, last point dot) appear only with ≥ 7 data points. Otherwise the cell reads "Not enough data yet".
- **Sentiment** uses the semantic trio, always icon + label + value. The Analytics stacked area becomes a 100% bar per day with direct labels (F-VIS-012).
- **Flow drop-off** is a horizontal bar per step, ordered by flow order and named `Q1 · Interested in a site visit?`. The same numbers can overlay the canvas as a per-node chip ("62% reached · 41% Yes") (F-FLOW-017, F-QA-019).
- **Hour-of-day heatmap:** a single-hue Neel ramp (5 steps) with a legend. Empty hours are blank, not cyan.
- **No 3D, no gradients, no donut** except a single-value progress ring for the wallet or free-minutes quota.
- **Empty charts** state the reason and the next action: "No calls in this range. Try 30 days."
- **Accessibility:** every chart has a caption and a "View as table" toggle. Hover tooltips are also reachable by keyboard (arrow keys step through points).
- **Implementation:** keep hand-built SVG or adopt a small library (visx or Recharts). Either way, colours come from the chart tokens only.

---

## 8. Motion

**Character: mechanical and immediate, like a relay clicking.** Motion confirms cause and effect. It never entertains.

| Token | Value | Use |
|---|---|---|
| `--dur-1` | 90 ms | Press, toggle, checkbox |
| `--dur-2` | 140 ms | Hover, tab underline, menu open |
| `--dur-3` | 200 ms | Sheets, inspector, dialogs, toasts |
| `--ease` | `cubic-bezier(.2,0,0,1)` | Everything (no spring, no bounce) |

- Animate only `transform` and `opacity`. List transitioned properties explicitly and never use `transition: all`.
- Nothing runs longer than 200 ms, except edge tracing during a flow test (each edge 240 ms, once, then static).
- **The only perpetual motion in the product:**
  - the **live dot**, a 1.6 s ring pulse, and only while a call or recording is really live
  - **audio level meters**, driven by real input and output levels, and flat when silent
- Both stop under `prefers-reduced-motion: reduce`. So do all edge animations; saved edges never "march" (F-FLOW-011, F-A11Y-022).
- **Removed:** the Cockpit STANDBY ring, orb and scanline, breathe, flicker and mandala keyframes, hover lifts and glows, and scroll reveals in the app.
- **Loading:** skeletons mirror the final layout and appear after 200 ms. Once shown, they stay at least 400 ms. The app shell always renders first; only the content area loads (F-UX-030, F-VIS-023).

---

## 9. Signature elements (three, no more)

### 9.1 The status line (shell)
A 28 px ink bar along the bottom of every desktop and laptop screen: the one dark stripe in the light theme and a raised stripe in dark. It is the switchboard's lamp row.
- **Contents, left to right, each a link:**
  1. live flow and version (`● Live flow Site-visit qualifier v7` → opens the flow)
  2. calling number and readiness (`+91 80 •••• 2210 ready` → Settings › Telephony)
  3. wallet (`Wallet ₹2,340.50` → **Billing › Wallet**, fixing F-UX-002 and F-QA-004)
  4. calls in progress (→ Cockpit)
  5. during a call, the call timer
  6. right side: `? Shortcuts` and `⌘K`
- **States:**
  - Low wallet turns its segment amber: "Wallet ₹42.10 · about 10 calls left · Top up in Billing".
  - Setup gaps show "No calling number · calls can't be placed · Finish setup (2 of 4)".
  - Nothing is ever shown that the client didn't compute. There is no fake "SYS: ONLINE" (F-UX-018).
- **What it replaces:** the 42 px wallet banner, which dominated every page and was an assertive alert (F-UX-028, F-A11Y-015, F-RWD-013, F-QA-036).
- **A blocking problem** (for example, an empty wallet on the Place call button) still appears **inline where it blocks**, as a disabled reason. The status line is ambient; the inline message is actionable.
- **Accessibility:** `role="contentinfo"`, `aria-label="Workspace status"`, with changes announced politely.
- **Phones:** it collapses into a status chip in the top bar (`● ₹2,340`) that opens a sheet with the same rows.

### 9.2 The timecode gutter (voice)
Every conversational record uses one row anatomy:
- a fixed 64 px left gutter with an `mm:ss` timecode (mono-12, text-3, right-aligned, tabular)
- then speaker (13/600) · language tag (`HI`, `EN`, mono 11 in a 1 px box) · a flow step chip (`Q1`, accent-soft, links to the node) · an optional tool note ("Knowledge: price-sheet.pdf")
- then the utterance at read-15 (Devanagari 15/26 with `lang="hi"`)
- customer turns on `--surface-2`
- partial speech in text-3 ending with "…", turning to ink when final

The same row appears in the Cockpit transcript, the Call reports detail, the Rep console, the Meeting Agent notes and the flow Test panel. Clicking a timecode seeks the recording, and when playback runs the active row gets an accent 2 px left bar. Auto-scroll pauses when the operator scrolls up, and "Jump to latest" appears. Only final turns are announced (`aria-live="polite"`, throttled).

### 9.3 Port tabs (flows)
Every Logic node lists its outputs as **named rows**, each with its own socket on the node's right edge: `Yes · haan, zaroor ●`, `Later · baad mein ●`, `No ●`, `No reply · after 6 s ○`.
- The label travels with the edge, so a branch's meaning never depends on handle position (bottom = yes, right = no) or on colour (F-FLOW-020, F-FLOW-011).
- Sockets are 10 px visible with a 24 px hit area (F-A11Y-023). Each is focusable, and `C` on a focused socket opens "Connect to…".
- An unconnected socket shows `+` on hover or focus, which inserts an already-connected step.
- The fallback row ("No reply", "Else", "Didn't understand") is mandatory on every Logic node. Its edge is the only dashed line in the product.

---

## 10. Core components (implementation notes)

Build these as one primitives layer. Radix or React Aria are recommended for dialogs, menus, tabs, tooltips and listboxes, because there is no primitives library today (section 2.1 of the audit). Style them with the tokens above.

| Component | Spec |
|---|---|
| **Button** | Variants `primary`, `secondary`, `ghost`, `danger` (outline) and `danger-solid` (inside confirm dialogs only). Sizes: sm 28, md 32, lg 40, touch 44. Label 13/500 (14/500 at lg). 16 px icon, 6 px gap. **One primary per region.** Hover changes the fill only (no lift, no glow). Focus-visible: 2 px `--focus` ring, 2 px offset. Disabled: `--surface-2` fill and `--text-disabled` (never opacity), plus a visible reason below or a tooltip on a wrapper ("Fix 1 error to publish"). Busy keeps the label and ends it with "…" plus a 14 px spinner. Optional trailing keycap. Replaces 80 styles and 3 systems (F-VIS-006). |
| **Input / select / textarea** | 32 px (44 touch). 1 px `--control` border, 6 px radius, 14 px text (16 on phones). Label above at 13/500. Help text below at 12 in text-3. Error below in danger with an icon, linked via `aria-describedby`. Focus: accent border plus a 2 px ring. Placeholders are examples ending in "…", never labels (F-A11Y-003, F-A11Y-020). Phone fields: fixed `+91` prefix segment, `type="tel" inputmode="tel" autocomplete="tel"`, validated on blur (F-QA-021). |
| **Tag** | 20 px, 4 px radius, 12/500, sentence case. Neutral (graphite + border) or soft semantic. Optional 12 px icon. One tag per cell. Replaces 20 badge styles (F-VIS-017). |
| **Tabs** | 36 px, 13/500, 2 px accent underline on the selected tab, counts in text-3. `role=tablist`, arrow keys move between tabs, and the selected tab lives in the URL. |
| **Segmented control** | 28 px track on `--surface-2`; the selected segment is raised (surface + e1). Used for density, date range and Standard/Compact. `aria-pressed`. |
| **Filter token** | 24 px, 6 px radius: `Language  Hindi, English  ×`. Added from a "Filter" menu. The URL holds the filter state. Replaces two rows of pill chips (F-VIS-009). |
| **Checkbox / switch** | 16 px box with a 24 px hit area. Switch 28×16 with `role=switch`. Visible focus (F-A11Y-006). |
| **Keycap** | 18 px, 4 px radius, 1 px border with a 2 px bottom, mono 11/500. Shown in tooltips, menus, the `?` sheet and the pager hint. Never a permanent shortcut strip (F-VIS-009). |
| **Table** | Real `<table>` with a sticky caps-11 header, `aria-sort`, right-aligned tabular numbers, and a checkbox column. Row hover `--surface-2`. Selected row: accent-soft plus a 2 px inset accent bar. Keyboard row: 2 px focus outline. Row actions appear on hover or focus. Truncated cells get a tooltip. Empty cells are blank or "Not captured", never "—" rows (F-VIS-027). Column chooser. Server pagination with "1–50 of 1,284" (F-QA-005). Horizontal scroll inside the container with a sticky first column below 1024 px. |
| **Side sheet** | 440 px (records) or 320 px (inspector), with a header (title-16, id in mono, actions, close), tabs, body and a sticky footer. Focus moves in and returns to the trigger. `Esc` closes it. Deep-linked (`?lead=…`) (F-A11Y-005, F-UX-032). |
| **Dialog** | For confirmations and short creation steps only. 480 or 640 px, e3, 12 px radius, flat 40% scrim, focus trap, and the dialog role. The destructive confirm names the object and its consequence. |
| **Toast** | Bottom-right above the status line. Transient success only, with Undo where possible ("Deleted 'Polite close' and 2 connections · Undo", 8 s). Persistent problems stay inline (K10). |
| **Tooltip** | Ink fill (inverted), 12/16, 6 px radius, e2, and a keycap when a shortcut exists. Appears after 400 ms on hover and immediately on focus. Uses a portal, so it is never clipped by its card (F-VIS-014). |
| **Empty state** | Left-aligned in the content area: title-16 plus one sentence and one primary action. No illustration and no poetry. Example: "No leads match these filters. Clear filters." (F-VIS-023) |
| **Command menu** | `⌘K` / `Ctrl K`. 640 px, search input, grouped results (Go to, Actions, Leads, Flows, Calls), each with a keycap. The menu is how the rail stays usable at small heights. |

---

## 11. How the direction fixes the audit's top issues

| # | Finding | How Switchboard resolves it |
|---|---|---|
| 1 | F-FLOW-001: autosave writes to the live flow | Draft/published revisions are built into the UI model. The header always shows `Live v7` next to `Draft · from v7`. Only **Publish v8…** (a sheet with validation, a diff and the impact) promotes. Deleting a connected node raises an Undo toast. (15.8) |
| 2 | F-UX-001: org setup dead end | Setup becomes a tracked checklist (`Finish setup (2 of 4)` in the status line and on the Cockpit). Settings › Organization reuses the 3-step Calling number stepper pattern. A disabled integration says why and links to the step. |
| 3 | F-QA-001: /about claims | Content fix, outside the visual scope. P1 applies to marketing too: no claim without evidence. The marketing site adopts the same type and colour, which reduces "two brands" (F-VIS-025). |
| 4 | F-A11Y-001: flow canvas mouse-only | Nodes and port-tab sockets are focusable. Tab order follows the graph from the Trigger. `Enter` opens the inspector, `C` opens "Connect to…" and `A` adds a step after. The Outline view is a full alternative. (15.10) |
| 5 | F-A11Y-002: Call Reports rows mouse-only | Rows are real `<tr>` elements with a row link. `Enter` opens a 440 px side sheet with focus moved in, and the transcript uses the timecode gutter. `Esc` returns focus. |
| 6 | F-QA-002: opening a flow writes it | The save-state machine ignores hydration and layout events. `Saved hh:mm` shows only after a real save (15.8). |
| 7 | F-FLOW-004: "FLOW VALIDATED" on invalid flows | The badge is removed. A live issues chip, node-level error and warning marks and a Problems bar replace it. Publish is disabled while errors exist, with the reason shown. |
| 8 | F-A11Y-004: `c` places a billable call | `C` opens the pre-flight card and never dials. Single-key shortcuts can be switched off in Settings › Accessibility. |
| 9 | F-QA-005: 50 of 121 calls | The table spec requires server pagination and a visible "1–50 of 121" range. Search, sort and filter run server-side. |
| 10 | F-QA-006: test calls stored as two legs | A data fix. The UI shows one row per call with "2 legs" disclosed in the detail sheet, and KPIs count calls, not legs. |
| 11 | F-UX-002: Top up opens Profile | The wallet lives in the status line and Billing › Wallet, and every wallet link goes to `/billing#wallet`. |
| 12 | F-UX-006: "You're live" when you're not | P1. "Live" appears only when number, wallet and a published flow all check out. Otherwise the setup checklist shows. |
| 13 | F-QA-010: /signup lands on sign-in | Auth screens use the same shell tokens. "Create account" and "Sign in" become separate routes with separate H1s (routing fix). |
| 14 | F-RWD-001: phone nav reaches 6 of 12 | The bottom bar holds Cockpit, Leads, Reports, Flows and More. **More** is a sheet listing every remaining section. Sign-out moves to the account menu. |
| 15 | F-A11Y-008 / 009 / F-VIS-003: contrast | Every text token is ≥ 4.5:1 (lowest: text-3 on surface-3, 4.70). White on the accent is 6.92:1. Control borders are ≥ 3:1. |

Also resolved by the system itself:
- F-VIS-001, 002, 005, 006, 016, 017, 018: one type scale, one button, one input, one tag, one header
- F-VIS-004: one hue in both themes
- F-VIS-022 / F-QA-038: no textures
- F-VIS-029 / F-UX-026: no idle ring; "Place call" vs "Talk in browser" become distinct, labelled actions
- F-UX-018: no fake status
- F-UX-028 / F-A11Y-015: wallet banner removed
- F-A11Y-022: reduced motion
- F-A11Y-023: 24 px targets
- F-VIS-024: one date grammar

---

## 12. App shell and information architecture

### 12.1 Navigation model
The labelled sidebar has four groups; group labels are 12/500 in text-3, sentence case (digest L6):

| Group | Destinations (nav label = page title) |
|---|---|
| Operate | Cockpit · Assistant · Rep console · Meetings · Personal agents |
| Build | Flows · Knowledge |
| Data | Leads · Call reports · Analytics |
| Account | Billing · Settings |

- **One name per destination** everywhere: nav, H1, `<title>` ("Leads · Vaani Labs"), phone bar and ⌘K. "Agent View / AGENT COCKPIT / Agent" becomes **Cockpit** and "Meet Agent / Meeting Agent — Vikash" becomes **Meetings** (F-UX-017, F-A11Y-013).
- **Active item:** a raised white key (surface + 1 px border + e1) with an accent icon and `aria-current="page"`. Settings sub-pages keep Settings active.
- **Workspace switcher** at the top: org name and role ("Workspace · Admin"). Identity is visible at last (F-UX-029).
- **Account menu** at the bottom (avatar): profile, theme (System / Light / Dark), keyboard shortcuts on/off, and `Sign out…` with a confirm.
- **Settings** gets a grouped 200 px sub-nav inside the shell, with no ↗ icons and no "BACK TO SETTINGS" bars (F-UX-027):
  - Workspace (Profile, Organization & team, Notifications)
  - Calling (Numbers & telephony, Call channel, Voices & languages)
  - Developer (API keys, Webhooks, Embed)
  - Security (Two-factor, Sessions, Activity log)
  - Data (Export, Delete account)
- **Billing** has tabs: Wallet · Usage · Plans · Invoices · Autopay.
- **Skip link** to `main`. Each nav item is one tab stop (F-A11Y-012).

### 12.2 Desktop (≥ 1440): full shell
```
┌──────────────────────┬──────────────────────────────────────────────────────────────────────────┐
│ [V] Sahyadri Homes ▾ │ Leads  1,284 leads · synced 11:24         Export  [Import…] [+ New lead N]│ 56
│ [⌕ Search or jump ⌘K]├──────────────────────────────────────────────────────────────────────────┤
│ Operate              │ All 1,284 │ New 312 │ Callbacks due 18 │ Interested 96 │ + Save view      │ 40
│  ∿ Cockpit  ● 2 live │ [⌕ Search name, phone… /] [Filter] [Language: Hindi ×]   Columns [Std|Cmp]│ 52
│  ▢ Assistant         ├──────────────────────────────────────────────────────────────────────────┤
│  ◠ Rep console       │ ☐ LEAD           PHONE            STATUS         LAST CALL          ...   │ 32
│  ▭ Meetings          │ ☑ Kavya Raman    +91 •••••• 4821  Interested     Visit booked · 10:42 ... │ 40
│  ☰ Personal agents   │ ☑ Siddharth Nair +91 •••••• 3307  Callback due   Call later · 09:15   ... │
│ Build                │ ☐ Farhan Qureshi +91 •••••• 9158  New            Not called yet       ... │
│  ⧉ Flows             │ ...                                                                      │
│  ▯ Knowledge         │                                                                          │
│ Data                 │          ┌ 3 selected │ Call 3 leads… │ Set status ▾ │ Export │ Clear Esc ┐ │
│ ▐Leads▌ (raised key) │          └──────────────────────────────────────────────────────────────┘ │
│  ▤ Call reports      │ 1–50 of 1,284                          J K move · X select · ? all    ‹ › │ 40
│  ▥ Analytics         │                                                                          │
│ Account              │                                                                          │
│  ▦ Billing  ▧ Settings                                                                          │
│ (RK) Ritika K. Admin │                                                                          │
├──────────────────────┴──────────────────────────────────────────────────────────────────────────┤
│ ● Live flow Site-visit qualifier v7 │ ☎ +91 80 •••• 2210 ready │ Wallet ₹2,340.50 │ 2 calls │ ? ⌘K│ 28
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 12.3 Laptop (1024–1439): rail
- The sidebar becomes a 56 px icon rail with tooltips that show label and shortcut.
- `[` or the logo expands it as an **overlay** (it never pushes content).
- The rail is scrollable and never clips Settings (F-RWD-005). ⌘K is the fast path.
- Inspectors overlay content below 1280 px.
- The status line stays.
```
┌────┬───────────────────────────────────────────────────────────────┐
│ V  │ Cockpit  1 live call · 1 in wrap-up     [Kavya · 02:14|Test]  │
│ ⌕  ├──────────────────────┬────────────────────────────────────────┤
│[∿] │ LIVE CALL CARD       │ TRANSCRIPT (timecode gutter)           │
│ ▢  │ 392 px               │                                        │
│ ⧉  │                      │                                        │
│ ▣  │                      │                                        │
│ ▦  │ [Take over][Transfer…]        [End call]                      │
├────┴──────────────────────┴────────────────────────────────────────┤
│ ● On call 02:14 │ Live flow Site-visit qualifier v7 │ Wallet ₹2,335│
└────────────────────────────────────────────────────────────────────┘
```

### 12.4 Tablet (768–1023): top bar and sheets
- A 52 px top bar: menu button, page title, the status chip and ⌘K.
- The menu opens the full grouped nav as a left **sheet** over content. Today it pushes content down to 528 px (F-VIS-033).
- Pages are single-pane. Records and inspectors open as right sheets at 100% height.
- Tables keep a sticky first column and scroll inside their frame.
- The status line becomes the chip.
```
┌──────────────────────────────────────────────┐
│ ☰  Leads               (● ₹2,340)   ⌕   ⌘K   │ 52
├──────────────────────────────────────────────┤
│ All │ New │ Callbacks │ Interested  →        │
│ [⌕ Search…]                       [Filter]   │
│ ┌────────────┬──────────────────────────────▶│ table scrolls inside,
│ │ Kavya Raman│ +91 •••••• 4821  Interested … │ lead column sticky
│ └────────────┴───────────────────────────────│
└──────────────────────────────────────────────┘
```

### 12.5 Mobile (320–767): bottom tabs and More
- **Top bar:** title, status chip (`● ₹2,340`), search and filter.
- **Bottom bar:** 5 items (Cockpit, Leads, Reports, Flows, More), 60 px plus the safe-area inset.
- **More** opens a sheet with every other destination, the account menu and Sign out.
- Tables become two-line list items (name + tag / masked phone + last outcome · time), and multi-select is entered with a long press or a Select button.
```
┌──────────────────────────────┐
│ Leads        (● ₹2,340) ⌕ ⚲ │
│ All 1,284  New 312  Callbacks│
├──────────────────────────────┤
│ Kavya Raman       Interested │
│ +91 •••••• 4821 · Visit 10:42│
├──────────────────────────────┤
│ Siddharth Nair  Callback due │
│ +91 •••••• 3307 · Later 09:15│
├──────────────────────────────┤
│ ...                          │
├──────────────────────────────┤
│ ∿      ▣      ▤      ⧉     ⋯ │
│Cockpit Leads Reports Flows More│
└──────────────────────────────┘
```

---

## 13. Agent Cockpit

**Job:** place, watch and wrap up one call at a time (test or live), with nothing on screen that isn't about that call. The idle ring, the mono intel boxes and the demo data go (F-VIS-029, F-UX-003, F-VIS-016).

**One call-state machine**, shared with the Rep console, Call reports and flow Test:

`Idle → Dialling… → Ringing… → Live → Wrap-up → Ended | No answer | Busy | Voicemail | Failed`

| State | Colour | Icon | Label |
|---|---|---|---|
| Idle | graphite | phone | Idle |
| Dialling, Ringing | amber | phone | Dialling…, Ringing… |
| Live | green | pulsing dot (the only pulse in the product) | Live |
| Wrap-up, Ended, No answer | graphite | clock, check, × | as named |
| Failed | red | alert | Failed |

Every state change is announced politely.

**Layout, desktop and laptop:**
- **left**, the 392 px call card
- **right**, the transcript (timecode gutter)
- an optional 320 px **Lead context** sheet with history and previous calls, toggled with `L`
- a header segmented control that switches between concurrent sessions (the live call and a test in wrap-up)

**Pre-call ("Ready to call") card:** it replaces the idle centre stage and holds five rows.
1. **Contact:** search leads, or type a number (`+91` prefix field, E.164 validation).
2. **Flow:** name, version and `Live` tag; the draft can be picked for test calls only.
3. **Voice:** 32 px avatar, "Vaani · Hindi + English · warm", and a ▶ preview.
4. **Language:** Auto or fixed.
5. **Readiness:** calling number ready, wallet balance.

Actions:
- **Place call** (primary, with a pre-flight showing cost and hours) and **Talk in browser** (secondary, mic). These replace the unexplained CONNECT and Test Call (F-UX-026, F-VIS-030).
- A disabled Place call says why inline: "Wallet is ₹0. Top up in Billing."
- The flow and voice pickers **never** write the account default silently (F-UX-014). "Make default" is a separate, explicit link.

```
┌──────────────────────────────────────┬─────────────────────────────────────────────────┐
│ ● Live   Outbound             02:14  │ Transcript · streaming                   ⌕  ⧉   │
│ (KR) Kavya Raman  +91 •••••• 4821    ├─────────────────────────────────────────────────┤
│      Pune                [◎ Recording]│ 00:03 │ Agent [HI] [T1]                          │
├──────────────────────────────────────┤       │ नमस्ते कव्या जी, मैं वाणी बोल रही हूँ…     │
│ Flow          Site-visit qualifier v7│ 00:11 │ Kavya [HI]                  (surface-2)  │
│ Current step  [Q1] Interested in a…  │       │ हाँ जी, बोलिए।                            │
│ Voice         Vaani · Hindi + English│ 00:14 │ Agent [EN] [Q1]                          │
│ Line          ✓ Good · 180 ms        │       │ You had enquired about a 2 BHK…          │
│ Cost so far   ₹5.36 · ₹0.04/s        │ 00:31 │ Agent [EN] [KB] Knowledge: price-sheet   │
├──────────────────────────────────────┤       │ 2 BHK units start at ₹85 lakh…           │
│ Agent ▮▮▮▮▮▮▯▯▯▯  Customer ▮▯▯▯▯▯▯▯▯ │ 02:12 │ Kavya · listening…      (muted, partial) │
├──────────────────────────────────────┤       │ Haan, eleven works…                      │
│ Captured by the flow                 │                                                 │
│ {{preferred_day}}   Saturday, morning│                                                 │
│ {{budget}}          ₹85 L – ₹1 Cr    │               [⌄ Jump to latest]                │
├──────────────────────────────────────┤                                                 │
│ [Take over] [Transfer…]   [End call] │                                                 │
└──────────────────────────────────────┴─────────────────────────────────────────────────┘
```

- **Live controls:** Take over (routes to Rep console, `⌘T`), Transfer… (number picker), End call (danger outline, `⌘⇧E`, no confirm, because ending is expected).
- **Compliance cue:** a "Recording" tag with a tooltip giving the disclosure time. Calling hours and the DND check appear in the pre-flight (for the product owner to confirm, digest 5.11).
- **Wrap-up:** the card becomes an outcome form, pre-filled from the flow's Outcome node (Visit booked → Interested), with editable notes and the AI summary. The primary is **Save and next** (`N`), so an operator can run a list without touching the mouse.
- **Tablet:** Call and Transcript become tabs. **Phone:** the card stacks over the transcript, and Take over and End call sit in a sticky 44 px bar (see the specimen). This fixes the hidden intel and the overlapping controls (F-RWD-002, F-VIS-007).

---

## 14. Leads

**Job:** find, qualify and call people in bulk, safely. Chrome above the first row drops from about 400 px to 148 px (header 56, views 40, toolbar 52), so about 12 rows are visible at 1440×900 in Standard (F-VIS-009).

- **Saved views as tabs,** with counts computed over the whole pipeline, not the page (F-QA-015): All · New · Callbacks due · Interested · Not reached · + Save view.
- **Toolbar:**
  - search (`/`)
  - a `Filter` menu that adds tokens (status, source, language, outcome, flow, owner, date)
  - Columns chooser and a Standard | Compact switch on the right
  - everything is kept in the URL (F-QA-016)
- **Table columns:** checkbox · Lead (500) · Phone (mono-13, masked) · Status (tag) · Last call (outcome + time in text-3) · Interest (right-aligned score + 40 px bar) · Lang (codes) · Flow · row actions.
  - The ~730 px dead column and the Status-under-Interest misalignment disappear (F-VIS-009).
  - Source becomes a filter and an optional column with a muted icon. The letter glyphs go.
- **Row interaction:**
  - Click or `Enter` opens the 440 px lead sheet, with its header sticky and no clipping. Tabs: Overview (details, outbound config), Calls (timecode-gutter history), Notes. `Delete lead…` sits in the sheet's overflow menu, not under Call (F-UX-032, F-UX-035).
  - Hover or focus reveals `Call… C` and `⋯`.
- **Keyboard:** `J`/`K` move, `X` select, `⇧A` select all, `C` call (pre-flight), `N` new lead, `Esc` clear, `⇧D` density. Rows are focusable, with a visible 2 px outline (F-A11Y-010).
- **Bulk bar:** floats above the pager (e3). It holds the selection count, **Call n leads…** (primary), Set status, Assign flow, Export and Clear. Calling is no longer the only bulk action (EXPLORE-DATA-07).
- **Pre-flight card**, opened by any call action:
  - flow + version + Live tag
  - voice
  - calling hours ("Open until 19:00 IST")
  - DND registry ("3 of 3 clear")
  - estimated cost ("≈ ₹11 (3 × ~90 s at ₹0.04/s)")
  - wallet
  - Cancel / **Start 3 calls ⌘↵**
  - If anything fails, the start button is disabled with the reason, for example "2 leads are on DND. Remove them or continue with 1." (F-UX-013)
- **Import:** keep the two-step dialog, but relabel it "Import…" (CSV or XLSX) and add a column-mapping preview with row-level errors (F-QA-022).

```
┌ Leads  1,284 leads · synced 11:24 ─────────────────── Export  [Import…]  [+ New lead N] ┐
│ All 1,284 │ New 312 │ Callbacks due 18 │ Interested 96 │ Not reached 204 │ + Save view  │
│ [⌕ Search name, phone or city… /] [≡ Filter] [Language Hindi, English ×] [Source Web ×]│
│                                                         ▥ Columns  [Standard|Compact] │
├───┬────────────────┬─────────────────┬──────────────┬─────────────────────┬──────┬────┤
│ ▣ │ LEAD           │ PHONE           │ STATUS       │ LAST CALL           │INTRST│LANG│
├───┼────────────────┼─────────────────┼──────────────┼─────────────────────┼──────┼────┤
│▌☑ │ Kavya Raman    │ +91 •••••• 4821 │ Interested   │ Visit booked · 10:42│ 82 ▬ │HI EN│ selected
│▌☑ │ Siddharth Nair │ +91 •••••• 3307 │ ◷Callback due│ Call later · 09:15  │ 64 ▬ │ EN │ selected
│ ☐ │ Farhan Qureshi │ +91 •••••• 9158 │ New          │ Not called yet      │    – │ HI │
│[☐ │ Ishita Bose    │ +91 •••••• 6612 │ Contacted    │ No answer · Yest.   │ 41 ▬ │ BN]│ keyboard focus
│ ☐ │ Tanvi Joshi    │ +91 •••••• 1189 │ New          │ Not called yet      │ [Call… C] ⋯ │ hover
├───┴────────────────┴─────────────────┴──────────────┴─────────────────────┴──────┴────┤
│        ┌ 3 selected │ [Call 3 leads…] │ Set status ▾ │ Assign flow ▾ │ Export │ Clear Esc ┐│
│ 1–50 of 1,284                                  J K move · X select · ? all shortcuts ‹ ›│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Flow Designer: Trigger → Logic → Action → Outcome

**Job:** script what the agent does on a call, prove it works, and put it live on purpose. The tool should feel like a serious engineering instrument, closer to a circuit editor than a whiteboard. Everything here is additive to the React Flow base, which stays.

### 15.1 The four-phase model
Every step belongs to exactly one phase. The palette, the spine, the outline and the validator all use the same four words.

| Phase | Meaning | Vaani step types (today's names → new name) | Outputs |
|---|---|---|---|
| **Trigger** | How a call enters this flow | Start (today a fixed pill with no config) → **Inbound call** (number, hours), **Outbound batch** (from Leads or a campaign, concurrency), **API / webhook**, **Browser test** | 1 |
| **Logic** | Decide where the conversation goes | Question → **Question** (N answers + No reply), Branch/Condition Check → **Branch** (variable · operator · value cases + Else), Verify Customer → **Verify** (Verified / Failed / No reply) | N named port tabs + mandatory fallback |
| **Action** | Say or do something | Speak, Knowledge Lookup, FAQ, CRM/Live Lookup, Book Meeting, Send WhatsApp, Transfer Call → **Speak · Knowledge lookup · FAQ · CRM lookup · Book meeting · Send WhatsApp · Transfer to human** | 1 (lookups add Found / Not found) |
| **Outcome** | How the call ended, and what it writes | End Call → **End with outcome**: Interested, Callback, Not interested, No answer, Transferred, Do not call, Failed | 0; sets lead status + call-report outcome |

- Each step type has **one name** everywhere: palette, canvas, inspector, toast and validator (F-FLOW-027).
- **Frames** ("Greeting", "Qualification", "Booking") and **Notes** are annotations, not phases.
- The phase gives a flow the "Trigger → Logic → Action → Outcome" reading that the canvas lacks today. It had no trigger configuration and no outcome taxonomy (03C "What the canvas communicates").

### 15.2 Layout of the tool
```
┌ Flows › Site-visit qualifier [Draft · from v7 ▾] ✓ Saved 11:24 (● Live v7) ↶ ↷ ⧉ ─── ⚠ 1 warning [▷ Test] [Publish v8…] ⋯ ┐ 48
├───┬────────────────────────────────────────────────────────────────────────────┬──────────────────────────┤
│ + │ ◖Trigger 2 → ◇Logic 2 → □Action 5 → ◗Outcome 5          ── Path  ┄┄ Fallback│ ◇ Question  Q1    ⋯  ×  │ 40
│ ☰ ├────────────────────────────────────────────────────────────────────────────┤ Configure│Test data│Issues│
│ ⛁ │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·│ Label                    │
│ ⟲ │  ╭─────────────╮      ┌─────────────────────┐     ┌────────────┐  ┌────────╮│ [Interested in a site…]  │
│───│  │▮ TRIGGER    │      │◇ LOGIC · QUESTION Q1│  ┌─▶│□ ACTION  ⚠1│─▶│◗OUTCOME││ Agent asks               │
│ ⚙ │  │Inbound call │──⊕──▶│Interested in a site │  │  │Book site   │  │Visit   ││ [{{lead_name}} ji, would │
│   │  │+91 80••••2210│     │visit?               │  │  │visit       │  │booked  ││  you like to visit…]     │
│   │  ╰─────────────╯   ┌─▶│{{lead_name}} ji, …  │  │  └────────────┘  │→Intrstd││ Answers · each is a port │
│   │  ╭─────────────╮   │  ├─────────────────────┤  │  ┌────────────┐  ╰────────╯│ ⋮ Yes    haan, zaroor    │
│   │  │▮ TRIGGER    │───┘  │Yes     haan, zaroor ●┼──┘┌▶│□ Schedule  │─▶ Callback │ ⋮ Later  next week       │
│   │  │Outbound batch│     │Later   baad mein    ●┼───┘ │  callback  │    set     │ ⋮ No     nahi            │
│   │  ╰─────────────╯      │No      nahi         ●┼───▶ □ Polite close ─▶ Not int.│   No reply  after 6 s    │
│   │                       │No reply  after 6 s  ○┼┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄▶ No answer│ + Add answer             │
│   │                       └─────────────────────┘                              │ Save to [{{visit_intent}}]│
│   │ [− 100% + | ⛶ Fit]                                            [minimap]    │ ✓ Autosaves to draft. Live│
├───┴────────────────────────────────────────────────────────────────────────────┤   v7 unaffected. Esc     │
│ ⚠ 1 warning  Book site visit: WhatsApp template pending approval  Go to step   ☰ Outline  ▷ Test panel T │ 32
└────────────────────────────────────────────────────────────────────────────────┴──────────────────────────┘
```
- **One 48 px header** replaces today's two rows (about 128 px) and the 42 px banner. The app sidebar auto-collapses to its 56 px rail while a flow is open. At 1440×900 the canvas grows from 52% to about 75% of the viewport with the inspector closed (F-FLOW-022).
- **Header, left zone:** breadcrumb, flow name, version menu, save state, the Live chip, and undo / redo / tidy.
- **Header, right zone:** the issues chip, **Test** (secondary) and exactly **one** primary, **Publish v8…**. Private, Share, Export and Import JSON, Reset and Delete go into `⋯` (F-FLOW-018, F-FLOW-019).
- **Phase spine** (40 px): phase counts with their glyphs. Clicking a phase highlights its steps and dims the rest to 40%. The phase of the selected step is marked. It also holds the edge legend.
- **Left rail** (48 px):
  - **Add step** (`A`) opens the palette popover: single column, search first, grouped by phase, full names and one-line descriptions, no truncation (F-FLOW-035).
  - **Outline** (`O`), **Variables** (`V`), **Version history**, **Flow settings**.
- **Palette placement:** at ≥ 1600 px it can be pinned open as a 240 px panel. It auto-collapses while the inspector is open (F-FLOW-022).
- **Inspector** (320 px, resizable to 480): tabs are Configure · Test data · Issues. There is no editing modal and no "Delete Node" slab; delete lives in `⋯`.
- **Problems bar** (32 px): the current issues, with Go to step, plus toggles for Outline and the Test panel.

### 15.3 Shape grammar (colour means state, shape means type)

| Phase | Node shape | Glyph | Why |
|---|---|---|---|
| Trigger | Left edge fully rounded (28 px), right edge 8 px | filled half-round tab | an entry: nothing connects into it |
| Logic | Rectangle, 8 px, with port-tab rows below the body | diamond | the flowchart convention for a decision |
| Action | Rectangle, 8 px, with its tool icon top-right (calendar, database, message…) | square outline | a process step |
| Outcome | Right edge fully rounded, with a 3 px terminal bar in text-2 | half-round with bar | an exit: nothing leaves it |

- All nodes share one surface (`--surface`), a 1 px `--border-strong` edge, e1, a 14/500 ink title and a caps-11 phase label in text-3. Every title is 17.9:1, compared with 1.48 to 4.84:1 today (F-FLOW-007).
- Category colour is gone. Hue appears only for **state:**

| State | Treatment |
|---|---|
| Selected | 2 px accent outline with 2 px offset, e2, accent sockets |
| Keyboard focus | 2 px `--focus` outline (the same ring as everywhere else) |
| Error | 1 px danger border and a red count badge ("⚠ 2") on the top edge |
| Warning | amber border and amber badge |
| Unreachable | 50% opacity and a "Not connected" meta line |
| Running in a test | accent-soft fill, and the traversed edges draw in accent once |
| Live analytics overlay (optional) | a meta chip "62% reached · 41% Yes" (F-FLOW-017) |

### 15.4 Node anatomy
- **Width:** fixed per phase (Trigger 208, Logic 224, Action 184, Outcome 168). There is no free resizing, and nodes never overlap (F-FLOW-009, F-FLOW-021).
- **Content rows:** phase label row (16) · title (20, one line with ellipsis and a tooltip) · body (13/18, two lines clamped: the prompt, number, template or condition) · meta (12/16 in text-3: tool, variable written, wait time).
- **Logic port rows:** 26 px each: **label** (13/500 ink), **examples or rule** (12 text-3), and the **socket** on the right edge. The fallback row sits on `--surface-2` with a hollow socket.
- **Grid:** nodes snap to an 8 px grid. The canvas shows 1 px dots every 16 px at ink 13% (a neutral grid, no hatch and no noise).

### 15.5 Ports and edges
- **Sockets:** 10 px visible, 24 px hit area, 1.5 px `--control` ring. Filled when connected, hollow when free. A free socket shows `+` on hover or focus, which opens the mini palette and inserts an already-connected step.
- **Input:** one socket on the left edge of every non-Trigger node. Several edges may merge into it.
- **Edges:** orthogonal "smoothstep" with 8 px corner radii, 1.5 px `--edge` (graphite).
  - Hovered and selected edges turn accent at 2 px.
  - A **dashed** edge means fallback, and nothing else.
  - An edge's accessible name comes from labels: "Q1 Interested in a site visit? · No reply → No answer" (F-A11Y-028).
- **Edge actions:** a selected edge shows a small toolbar (Insert step, Change output, Delete). Hovering a path shows an insert `⊕` at the midpoint.
- **No marching ants:** edges animate only while a test run traverses them, once (F-FLOW-011).

### 15.6 Canvas navigation
- **Direction:** the default layout is **left to right**, so reading order is phase order. A top-to-bottom option exists for narrow screens.
- **Tidy up** (`⇧T`): layered auto-layout (ELK "layered", rank spacing 48, node spacing 24) that respects frames. The result can be undone as one step.
- **Level of detail by zoom** (F-FLOW-008):

| Zoom | Nodes show | Labels |
|---|---|---|
| ≥ 0.75 | full node | normal |
| 0.5 – 0.75 | compact: glyph + title + port labels | normal |
| < 0.5 | phase-shaped blocks | HTML overlay counter-scaled to 12 px on screen |

- **Zoom control:** `− 100% +` and `Fit`. `⌘0` fits, `⌘1` goes to 100%, and the menu offers 50 / 100 / 200 presets. Flows open at `fit({ minZoom: 0.75 })` anchored on the first Trigger, or at the saved viewport.
- **Minimap:** neutral node rectangles with an accent viewport frame. It is toggleable, hides below 1280 px or when the canvas is under 600 px wide, and never covers nodes (F-FLOW-023).
- **Find:** `⌘F` searches labels, prompts and variables, with next and previous. **Outline** (`O`) lists steps grouped by phase with issue marks; clicking a step selects and centres it.

### 15.7 Inspector, Variables and Test
- **Configure:** Label (required, unique). Type fields validated per schema on change and on blur, with inline errors via `aria-describedby`. Only valid values reach the graph (F-FLOW-015).
- **Variables:** `{{` opens a picker of lead fields, captured answers and CRM fields. Unknown variables are errors (F-FLOW-028). Integration dependencies show inline: "Needs Google Calendar · Connect" (F-FLOW-030).
- **Test data tab:** sample values for this step's variables.
- **Test panel** (`T`, docked bottom, 280 px, resizable): a **text simulator** that is free and the default. Agent turns and quick-reply buttons (Yes / Later / No / No reply) use the timecode gutter. The canvas highlights the current step and traces the path in accent. Captured variables fill in live. **Call me with this draft** is a billable test call on the **draft** revision, never the live one, behind a pre-flight (F-FLOW-016).

### 15.8 Lifecycle: draft, save, publish, history
- **Two revisions per flow:** `published` (what calls use) and `draft` (what you edit). Opening a flow creates no write. The dirty flag ignores hydration, fitView, `dimensions` and selection events, and a content hash skips no-op saves (F-QA-002, F-FLOW-002).
- **Save-state chip:**

| State | Chip |
|---|---|
| saved | `✓ Saved 11:24` (static icon) |
| dirty | `● Unsaved changes` (amber dot) |
| saving | `Saving…` |
| failed | `⚠ Couldn't save · Retry` (red, stays until a save succeeds, plus a toast on the first failure) |
| new flow | `Not saved yet` |

- Pending saves flush on route change, `visibilitychange` and `pagehide` with `keepalive`. `beforeunload` is registered only while dirty. The server requires `If-Match` and returns 409 on a conflict (F-FLOW-003).
- **Undo history:** one stack for every graph change, empty after load (F-FLOW-005). Deleting a node gives the toast "Deleted 'Polite close' and 2 connections · Undo".
- **Publish v8…** opens a 640 px sheet containing:
  1. Validation: errors block, warnings need a tick.
  2. A diff: "3 steps changed · 1 added · prompt changed", each item linked to its node.
  3. Where it goes live: the inbound numbers, the outbound batches using it, and "Default for Cockpit".
  4. An optional note.
  5. The **Publish v8** button.
- After publishing, the header shows `Live v8` and the draft is clean.
- **Version history** lists who, when, the note and the diff. **Restore as draft** never overwrites Live directly (F-FLOW-001, F-FLOW-012, F-FLOW-014).
- **AI draft** (secondary, in the `⋯` menu and ⌘K) opens a side sheet: a multi-line prompt, then a preview diff on the canvas (added steps in accent-soft, removed ones struck), then **Apply to draft** or **Discard**. The canvas never changes silently (F-FLOW-031).

### 15.9 Validation rules (the one source for the chip, marks, Problems bar and server)
- **Errors (block Publish):**
  - no Trigger
  - an unreachable step
  - a required socket left unconnected (the fallback included)
  - an empty Speak message or Question text
  - an invalid E.164 number
  - WhatsApp with no template
  - a lookup with no connector
  - attempts outside 1–5
  - an unknown variable
  - a blank or duplicate flow name
  - a path that ends without an Outcome
- **Warnings:** a duplicate step label, a disconnected integration, a template pending approval, a Logic node without examples.
- **Behaviour:** results are recomputed 300 ms after each change and keyed by flow id, so they never carry over (F-FLOW-010). Steps are named by id and label ("Q1 · Interested in a site visit?"), never by a raw node id. The server runs the same rules and returns 422 with the list (F-FLOW-004).

### 15.10 Keyboard and accessibility
| Key | Action |
|---|---|
| `Tab` | Enter the canvas at the first Trigger; tab order follows the graph depth-first, not creation order |
| `→` / `←` | Follow the default output / go back along the input |
| `↑` / `↓` | Move between sibling steps in the same rank, or between port rows on a Logic step |
| `Enter` / `F2` | Open the inspector with focus on Label; `Esc` returns focus to the step |
| `C` | On a step or socket: "Connect to…" listbox of targets (searchable) |
| `A` | Add a step after the focused step (palette popover, inserted and connected) |
| `Alt+Arrows` | Nudge 8 px (`⇧` 32 px) |
| `Delete` | Remove, with an Undo toast |
| `⌘D` · `⌘F` · `⇧T` · `⌘0` / `⌘1` | Duplicate · Find · Tidy · Fit / 100% |
| `O` · `V` · `T` · `?` | Outline · Variables · Test panel · Shortcut sheet (a real dialog, focus moved in, fits 900 px) |

- Each step has an `aria-label` such as "Step 3 of 14, Logic, Question: Interested in a site visit? Outputs: Yes → Book site visit; Later → Schedule callback; No → Polite close; No reply → No answer".
- The Outline view is a complete non-spatial editor: reorder, connect and edit all work from the list (F-A11Y-001, F-FLOW-006, F-A11Y-027).

### 15.11 Responsive behaviour
| Width | Behaviour |
|---|---|
| ≥ 1440 | Rail + canvas + docked 320 px inspector; palette can be pinned at ≥ 1600 |
| 1280–1439 | Same, with the minimap on and the inspector resizable |
| 1024–1279 | The inspector overlays the canvas from the right and pans the selected step into view; minimap hidden |
| 768–1023 | Review mode: the Outline and a read-only canvas side by side; Test and Publish work; editing asks for ≥ 1024 px. The Publish action is never clipped off-screen (F-RWD-003) |
| < 768 | Outline only (grouped by phase), "Run text test", version and status. Touch pan and pinch on the read-only canvas (F-RWD-014) |

---

## 16. Risks and trade-offs

1. **Changing the typeface.** Moving from Hanken Grotesk (which the audit recommends keeping) to IBM Plex costs one migration and a marketing re-set. It also brings an IBM/Carbon association. The mitigation is that Vaani's identity lives in Neel, the status line, port tabs and the timecode gutter, not in the face. If the owner prefers continuity, the system still works with Hanken + JetBrains Mono + Noto Sans Devanagari with no other token change. Plex is recommended mainly for Devanagari parity.
2. **Density can feel "enterprise".** A 13 px data size and 32 px Compact rows can read as cold to SMB first-timers. The mitigation is that Standard is the default, forms stay calm, empty states are plain-spoken, and the Assistant keeps its friendly tone.
3. **The ink status line is a strong horizontal element.** In light mode it is the only dark band, and some will see it as heavy. It must stay 28 px, carry only four or five facts, and never become a toolbar. If research shows it's ignored, the fallback is a top-bar status chip on every breakpoint.
4. **Monochrome nodes.** Removing category colour makes a first glance slightly less "colourful" and relies on users learning four shapes. The phase spine, glyphs, labels and legend teach them, and colour-blind users gain the most. Some teams may ask for colour back; resist it for types and allow user-defined **frame** tints (low-saturation surface tints) as the pressure valve.
5. **Draft/publish is a backend change.** The UI assumes `published_revision_id`, `If-Match` and server validation. Shipping the visuals without it would repeat the audit's core problem of looking truthful while not being truthful. Sequence the backend first (F-FLOW-001).
6. **The pre-flight adds a step to calling.** Power users who call hundreds of leads could feel friction. Keep it one keystroke (`C` then `⌘↵`), remember "don't show for batches under n leads within calling hours" per workspace (admin-controlled), and never skip the cost line.
7. **Left-to-right layout on existing flows.** The 16 existing top-down flows need a one-time Tidy migration. Offer it as a draft ("Re-layout left to right") rather than rewriting live flows.
8. **Keyboard-first can hide features from mouse users.** Every shortcut therefore has a visible button, and keycaps appear only in tooltips, menus and the `?` sheet.

---

## 17. Open decisions and the token block

**Decisions for the owner** (digest 5.11), with this direction's recommendations:
- Accent: **Neel blue** (not violet), including marketing.
- Default theme: **follow the system**, with light as the fallback. Parity in both.
- Case: **sentence case**.
- Flow Save: **no Save button**. Autosave to draft, and Publish creates versions.
- Minimum editing width: **1024 px**.
- The sidebar latency readout: **remove it**. Latency shows only in a live call.
- Compliance cues (recording disclosure, DND and TRAI hours): **in the pre-flight and the live card** (to be confirmed).

**Tailwind v4 `@theme` excerpt** (light values; dark overrides live in `:root.dark`, and in `@media (prefers-color-scheme: dark)` when the theme is System):
```css
@theme {
  --font-sans: "IBM Plex Sans", "IBM Plex Sans Devanagari", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --color-bg: #F6F7F9;      --color-surface: #FFFFFF;   --color-surface-2: #F1F3F6; --color-surface-3: #E8EBF0;
  --color-border: #E3E6EC;  --color-border-strong: #C9CED8; --color-control: #858D9C;
  --color-text: #121722;    --color-text-2: #434B5B;    --color-text-3: #5F6878;    --color-text-disabled: #A3AAB7;
  --color-accent: #2C4BD1;  --color-accent-hover: #2440B8; --color-accent-soft: #EEF1FD; --color-focus: #2C4BD1;
  --color-success: #15803D; --color-success-text: #11703F; --color-success-soft: #E7F5EC;
  --color-warning: #B45309; --color-warning-text: #8A4B00; --color-warning-soft: #FDF3E1;
  --color-danger: #C0271C;  --color-danger-text: #B42318;  --color-danger-soft: #FDECEA;
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px;
  --text-caps: 11px; --text-meta: 12px; --text-sm: 13px; --text-base: 14px; --text-read: 15px;
  --text-title-sm: 16px; --text-title: 20px; --text-title-lg: 24px; --text-num: 28px;
  --ease-out: cubic-bezier(.2,0,0,1);
}
```
The specimen (`operator.html`) is the reference implementation of every value above, in both themes.
