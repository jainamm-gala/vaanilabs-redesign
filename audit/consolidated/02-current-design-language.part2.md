
#### 2.3.8 Borders, textures, icons, motion

- **Borders:** 1px hairlines are used everywhere. There are also 2px accents, a dashed border (the Settings › Organization empty state), and a 3px left bar marking the active nav item.
- **Background textures:**
  - an SVG noise overlay on every app page
  - a 1px grid at 8% black on Dashboard, Leads and Analytics, which shows through the semi-transparent Leads rows
  - a dot grid, diagonal hatch fills and `.hud-bracket` corners on Analytics
- **Icons:** 22 rendered sizes. Mostly 20 (nav), 16, 14 and 12, with others down to 8px.
- **Transitions:** .15s and .2s with the standard ease are the norm. There is also a .4s spring (`cubic-bezier(.16,1,.3,1)`) on cards and a .7s ease. Decorative infinite animations run on the Dashboard ring, which is 320px across.

### 2.4 Component inventory (current variants)

There is no component library, so each entry below lists the separate implementations that exist today. Unless stated, heights and sizes are for desktop at 1440x900.

#### Buttons: three parallel systems, 80 distinct signatures

| System | Definition | Adoption |
|---|---|---|
| (a) React `<Button>`, CVA-style | `inline-flex items-center justify-center gap-2 rounded-lg font-sans transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-saffron/60 disabled:opacity-50`. Primary: `bg-saffron text-black font-semibold h-8 px-3 text-[13px]`. | Used by 2 of 103 buttons on Call Reports. 0 on Leads and Knowledge. **It is the only button with a focus-visible ring and the only one that renders in Hanken.** |
| (b) CSS classes | `.btn-saffron`, `.btn-outline`, `.btn-danger`: 14px system font, `9px 18px`, radius 8, about 38px tall, 44px min-height on mobile | Billing, Knowledge, Settings, Dashboard |
| (c) Bespoke Tailwind strings | Everything else | Leads (0 of 49 buttons shared), Flow Builder, Analytics, Meeting Agent, Personal Agents and the others |

- **Distinct signatures per page:** Flow Builder 36, Leads 12, Knowledge 11, Meeting Agent 11, Analytics 9, Dashboard 9, Call Reports 9, Settings 8, Assistant 7, Billing 7, Personal Agents 5, Rep Console 5.
- **Heights:** 18 distinct heights: 22, 24, 25, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 44, 48 and 58px. The 58px one is "Test Call" wrapping onto two lines. Primary buttons alone come in 24, 28, 32, 33, 37, 39, 40, 43 and 44px.
- **Primary fill:** the same blue `#2f5fe0` (`--saffron`) with **black text** everywhere, except:
  - Meeting Agent: violet `#8b5cf6` with white text
  - Flow Builder ACTIVATE: green, 12px radius, uppercase, white text, green glow, next to a blue, 8px-radius, title-case Save
  - Wallet banner "Top up": `#111725` text
- **Secondary styles:** a teal outline or tint (IMPORT CSV, Test Call, Re-analyze, Embed); `.btn-outline`; mono-uppercase text buttons (Personal Agents "SETTINGS" and "REFRESH", with a `white/10` border that is invisible in light).
- **Destructive styles:** `.btn-danger` (token red); Settings "Delete Account" in `#d76a60`; Meeting Agent's unlabeled red filled square stop button.
- **Casing:** mixed. "NEW LEAD" and "NEW TASK" are Sora bold uppercase with tracking. "CONNECT" is literal uppercase in the system font. "Export CSV" and "Save Changes" are sentence or title case.
- **Hover:** consistent on primaries: a 20px blue glow and a −1px lift.
- **Disabled:** opacity .5.
- **Focus:** the browser default, or none. Only (a) has a ring.
- **"Refresh" alone has 6 designs:**
  - Analytics: Sora 10/700, +2px, uppercase, 29px, r6
  - Leads: Mono 10/500, uppercase, 29px, r8
  - Call Reports: Hanken 13/500, 32px, r8
  - Billing and Knowledge: `.btn-outline`, 14px, 38px
  - Meeting Agent: Mono 12, 24px, borderless
  - Personal Agents: Mono 11, +1.1px, uppercase, 35px, invisible border
- **Icon buttons (5 sizes):**
  - 36x36 r8 (sidebar footer)
  - 32x32 r6 (the Leads row call button, blue, on every row)
  - 24x24 r6 (Call Reports row actions ×50)
  - 34px tall r0 (React Flow controls; Flow Builder has 9 icon-only toolbar buttons)
  - 22x22 r4 (banner dismiss)

#### Form controls: 12 input styles

| Style | Spec | Where |
|---|---|---|
| `.input-vani` | 43px, 14px system font, r8, white at 85%, visible focus border plus a 14% ring | Settings, Call Reports search, Leads search |
| Mono field | 34px, mono 12px, r6, `#eef1f7` fill | Billing, Knowledge, Settings |
| Mono intel field | 30px, mono 12px, nested inside a field card inside a panel | Dashboard Customer Intel (6 fields) |
| Mono select | 21px, mono 10px | Dashboard flow select |
| Pill filter select | 25px, mono 10px, uppercase, full radius | Leads (Language, Outcome) |
| Mono input | 42px, mono 14px | Meeting Agent |
| Composer | 42px, Hanken 13px | Assistant |
| Native `<input type=file>` | Unstyled browser control reading "Choose file · No file chosen" | Knowledge upload, Settings › WhatsApp brochure |
| Styled dropzone | ".CSV · .XLSX · MAX 5 MB", two-step layout | Leads Import dialog only |
| Textarea | Goal textarea with an example placeholder; Flow settings personality prompt with a 0/6000 counter | Personal Agents "New task", Flow settings |

- Heights run from 21 to 43px, with 4 radii and 4 fills. Text is mono in some styles and sans in others.
- Labels are usually 9–10px mono uppercase above the field.
- The only coded focus and error states are `.input-vani`'s. Native browser validation bubbles are used elsewhere (New Lead email).

#### Badges, pills and chips: 20 styles

- **Leads status ("new"):** mono 9px, +0.225px, uppercase, teal at 10% fill with a teal border at 30%, 20px tall.
- **Leads source:** mono **8px** bold uppercase, 16px tall. Letter glyphs stand in for icons ("F", "IG", "G", "{}", "✎", "◎").
- **Analytics "completed":** mono 9px, +1.8px, uppercase, outline only.
- **Call Reports status and sentiment ("COMPLETED", "NEUTRAL"):** Hanken 11px, +0.275px, uppercase, 10% tint fill, no border, 18px tall.
- **Billing "Inactive":** mono 10px uppercase outline pill.
- **Dashboard "IDLE" status pill and Flow Builder "Up to date" status chip.**
- **Count pills** next to titles (Call Reports), and Flow counters (mono 9px, r4).
- **Sentiment has three renderings:** a coloured word (Dashboard "POSITIVE"), a pill (Call Reports) and a "±pp" chip (Analytics WoW shift).
- **Kbd hints:** mono 9px, r4. The Leads shortcuts bar and the expanded sidebar's "Collapse [" use bare glyphs.
- **Filter chips:**
  - Leads status (8) and source (7): 25px, mono 10px, uppercase pills
  - Call Reports sentiment (4): 28px, Hanken 13px, capitalised pills
- Selection is shown by tint only.
- Heights in use: 16, 18, 20, 21, 24 and 25px.

#### Cards, panels and KPI tiles

- **Cards and panels:**
  - `.glass-card`: r16, translucent
  - `.bento-card`: r20, violet hover
  - Knowledge cards: white, r12, padding 20 or 24
  - Call Reports stat cards: r12 on `surface-light` at 40%
  - Dashboard panels: r8, with box-in-box nesting three outlines deep
  - Flow panels: r16 with a `0 14px 40px` shadow
  - Personal Agents example cards: `bg-black/20` with a `border-white/[0.06]` edge
  - Analytics cards: hatch fill with corner brackets
  - Settings › Organization empty-state box: dashed
- **KPI tiles:**
  - Analytics: mono numerals at 30.4px, alternating blue and teal, with 80x32 sparklines
  - Call Reports: four stat cards in blue, teal, green and red
  - Leads: KPI strip about 70px tall
  - Dashboard: telemetry strip in 10px mono ("LAT", "SESSION")

#### Tables and lists

| Instance | Structure today |
|---|---|
| Leads | A custom div grid with no table or row roles. Avatar with an overlapping badge, 3px-radius checkboxes, a blue call icon button per row. Rows are transparent over the grid texture. The row stack above the first row is about 400px. j/k keyboard navigation. |
| Call Reports | A horizontally scrolling table with one column per extracted flow field (most cells "—"). Hanken 13px header and body, uppercase pills, summaries clamped to 2 lines in a 190px column, a solid ▼ sort glyph. |
| Knowledge files | Mono 12px list with storage-prefixed filenames and a "21/09/2026, 16:19:12" date format |
| Analytics "Recent" | Mono table. Durations in link blue that are not links. |
| Flow "ALL FLOWS" modal | NAME / CATEGORY / LAST EDITED / [OPEN] columns with search and pagination ("Page 1 of 1 · 1-16 of 16") |

- Four date formats are in use: "21/09/2026, 16:19:12", "21 Sept, 22:44", "23 Sept 2026" and "28d ago".
- Phone numbers are consistently masked as `+91••••••XXXX`.

#### Tabs, segmented controls and filters: 6+ unrelated implementations

- Dashboard voice-persona toggle: 38px, mono 14
- Analytics range 7d/30d/90d: 24px, mono 10 uppercase
- Call Reports sentiment filter: 28px Hanken 13 pills
- Leads status and source chips: 25px mono 10 uppercase pills
- Meeting Agent session mode: 32px, **square (r0), violet fill**
- Knowledge source tabs: 30px, mono 12, r8
- Settings sub-nav: a vertical list of 17 items, 14 of which carry an ↗ external-link icon although they navigate in the same tab. Sub-pages drop this nav in favour of a "BACK TO SETTINGS" bar.

No `role=tab` or `aria-pressed` pattern is shared.

#### Overlays: modals, dialogs, drawers, panels, toasts

| Instance | Current form |
|---|---|
| New Lead modal | Blurred page overlay. H3 title directly under the page H1. Cancel and "Create lead" buttons. Autofocuses Name, closes on Esc. No `role=dialog`, no focus trap, unnamed close button. |
| Import leads dialog | Two steps (template, then upload) with a styled dropzone. The CTA is disabled until a file is chosen. |
| New webhook modal | Light translucent veil through which the background text shows. Unnamed "×". No dialog role. |
| Flow "ALL FLOWS" picker | 896px modal with an autofocused search, a table and pagination |
| Flow keyboard shortcuts (`?`) | The only element with a proper `role=dialog aria-modal` and a label. It is 451x823, so it is clipped at the viewport bottom. Focus is not moved into it. |
| Flow "AI SCRIPT PREVIEW" | 672x428 modal with a mono scrolling text area and a full-width "Close Preview" button |
| Leads drawer | Right-hand `<aside>` with no role. Holds voice, language, flow, Call Now, WhatsApp and call history. Esc does not close it, and the bottom is clipped. |
| Call Reports "CALL DETAILS" panel | Side panel, not a dialog or region. Focus stays on `<body>`. |
| Flow node inspector and Flow settings drawer | Plain-div inspector with an uppercase H3 ("SPEAK NODE"). The settings drawer closes on Esc and has no Save or Done button. |
| Personal Agents "New task" | Inline panel below the cards, not an overlay |
| Toasts and feedback | **There is no toast system** (0 sonner). Flow Builder has a `role=status` live message ("New Speak Node added.") and an "Up to date" chip. Everywhere else, success and failure are silent or appear as distant inline text (for example, the Knowledge search error renders in the Upload card, far above the input). |
| Tooltips | Native `title` attributes on nav items. A custom tooltip exists only on the sidebar-footer theme toggle. |

#### Navigation and app shell

- **Desktop rail (default):**
  - 72px, icon-only, with 12–13 items at 44x44 in a flat, ungrouped list
  - native `title` tooltips; the active item is a 3px left bar plus a tint
  - no `aria-current`
  - hidden labels at opacity 0 overflow the rail, which draws a stray horizontal scrollbar
  - Settings is clipped at 900px height; at 1366x768 only 8 of 12 items are visible
  - footer: theme toggle, expand toggle, a status dot and a latency readout
- **Expanded rail:** 240px with labels. Everything fits.
- **Mobile:** a bottom tab bar with 7 labelled items (Assistant, Agent, Leads, Reports, Billing, Knowledge and a sign-out item labelled "Exit").
- **Page header:**
  - a 63px sticky bar with 24px side padding, white at 80% and a bottom border on most pages
  - Personal Agents has no bar; Analytics has an editorial bar
  - a global "Save Changes" sits in the header on Settings
  - nav labels, mobile labels and H1s name the same destination differently ("Agent View" / "Agent" / "AGENT COCKPIT"; "Meet Agent" / "Meeting Agent — {persona}"; "Knowledge" / "AGENT KNOWLEDGE")
- **Global wallet banner:**
  - a 42px lavender bar (about `#dde3f7`) on every authenticated page except Rep Console, including Billing
  - a filled 24px "Top up" (`#111725` on blue) and an outline "Enable autopay"
- **Public headers:** three variants.
  - Home: full nav plus a "Dashboard" CTA
  - Pricing: logo plus "Email us"
  - Docs: "Back to Home", with the logo on the right

#### Empty states and loaders

**Seven empty-state styles:**
- Assistant: icon tile, H2 and suggestion chips
- Dashboard transcript: mono "Awaiting connection..." in grey
- Personal Agents: a centred sentence and a link
- Billing: a bordered mono box, "No transactions yet."
- Analytics: tracked "NO DATA" plus a serif-italic line, and a chart of 24 empty cyan cells instead of an empty state
- Settings › Organization: a dashed box with a shield icon and an outline button
- API Keys: a plain mono line

**Loaders:**
- a full-screen centred spinner with sans "Loading..." (Leads)
- mono "Loading…" (Settings sub-pages)
- a boxed "Requesting softphone credentials…" (Rep Console)
- no skeletons anywhere
- the app shell itself can mount after the data on hard navigation

#### Flow canvas elements

- **Nodes:** 8 types. Category colour is shown as Tailwind-400 *text* (amber, orange, violet, pink). Node body text is 11px mono, which renders at about 9px on screen at the default zoom.
- **Edges and edge labels:** 1px blue edges. Edge labels are 10px text in a white box that stays white in dark mode.
- **Handles:** 12px circles.
- **Minimap:** `#1a192b` with a `rgba(0,0,0,.38)` mask, which reads as a grey slab in light.
- **Palette:**
  - a 2-column grid in a 270px panel, so labels truncate ("Knowle…", "CRM Lo…")
  - the "START HERE" group duplicates items from "CONVERSATION"
- **Header:** two rows, about 180px, with a mono uppercase subtitle.
