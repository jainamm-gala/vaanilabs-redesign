
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
