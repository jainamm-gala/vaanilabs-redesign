
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
