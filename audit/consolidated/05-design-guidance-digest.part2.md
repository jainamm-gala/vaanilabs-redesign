#### 5.3.5 Components

- [ ] **K1 Buttons.** Allow one filled primary per view region. The other tiers:

  | Tier | Style |
  |---|---|
  | Secondary | Neutral surface with a 1 px border |
  | Tertiary | Ghost |
  | Destructive | Danger text or border. It fills only inside the confirmation dialog. |

  All buttons share:
  - radius 6-8 px
  - label at 14/500
  - padding about 8x14 px
  - a 16 px icon with a 6-8 px gap
  - a label that fits on one line at desktop widths

  [TS CTA wrap ban and no duplicate CTA intent; ADM Stripe one filled button per band]
- [ ] **K2 Disabled buttons say why.** Show the reason as inline helper text, or in a tooltip placed on a wrapper, because a disabled button cannot take focus. Example: "Top up your wallet to place calls." [WIG no dead ends; Inf]
- [ ] **K3 Inputs.**
  - The label sits above at 13/500 and help text sits below at 12-13 px.
  - The error appears below in the danger colour, with an icon.
  - The border is 1 px strong gray.
  - Focus shows a 2 px accent ring with a 2 px offset.
  - The placeholder is an example value ending in `…`.
  - Fields are not boxed into their own cards.

  [TS forms rules; WIG; ADM Linear, Vercel]
- [ ] **K4 Tabs and segmented controls.** Use a track (pill or 6 px) with a raised surface on the selected item. Deep-link the selected tab in the URL. [WIG; ADM Linear]
- [ ] **K5 Badges.**
  - 12/500 text, 2x8 px padding, pill or 4 px radius, semantic soft background.
  - At most one badge style per table cell.
  - No decorative dots. A dot appears only for live state.

  [TS rule against decorative status dots; I2C tiny badges everywhere]
- [ ] **K6 Tables.**
  - Sticky header, either 13/500 secondary sentence case or 11-12 px caps at +0.02em.
  - Right-aligned tabular numerals.
  - Truncated cells show the full text in a tooltip.
  - Row hover.
  - A checkbox column with a hit target of 24 px or more.
  - A column chooser for dynamic flow-field columns.
  - Empty cells are blank or show a muted "Not captured", never a row of dashes.

  [WIG; Inf]
- [ ] **K7 Keyboard hints as `<kbd>` keycaps** (1 px border, 4 px radius, 11-12 px mono). Show them in tooltips, menus and a `?` shortcut sheet, not in a permanent strip. [TS minimalist; ADM Raycast]
- [ ] **K8 Avatars.**
  - 24 or 32 px, one shape.
  - Initials sit on the neutral surface colour, not the accent.

  [ADM ElevenLabs voice rows; TS]
- [ ] **K9 Overlays.**
  - Use side sheets or inspectors to edit records: a lead, a node, a call's detail.
  - Use modals only for confirmations and short creation steps.
  - Every overlay traps focus, closes on Esc, returns focus to its trigger and sets `overscroll-behavior: contain`.

  [TS redesign warning against modals for everything; WIG]
- [ ] **K10 Toasts are for transient success only.** For example, "Lead saved" with Undo. Persistent problems, such as an empty wallet or no allocated number, appear inline where they block the task. [TS; WIG]
- [ ] **K11 Icons.**
  - One family with one stroke width (1.5 at 16-20 px).
  - One size scale: 16 px in controls, 20 px in navigation.
  - Replacing Lucide is optional. Consistency is the requirement.

  [TS]
- [ ] **K12 A named z-index scale.**

  | Layer | z-index |
  |---|---|
  | Base | 0 |
  | Sticky | 10 |
  | Dropdown | 20 |
  | Sticky banner | 30 |
  | Overlay | 40 |
  | Modal | 50 |
  | Toast | 60 |
  | Tooltip | 70 |

  Never use 9999. [TS redesign]

#### 5.3.6 Forms

- [ ] **F1 Every control has a clickable label, a meaningful `name` and `autocomplete`, and the correct `type`/`inputmode`.**

  | Field | Attributes |
  |---|---|
  | Phone | `type="tel" inputmode="tel" autocomplete="tel"` |
  | Email | `type="email"` with `spellcheck="false"` |
  | OTP | `autocomplete="one-time-code"`; pasting a code works |

  Non-auth fields must not trigger password managers. [WIG]
- [ ] **F2 Never block typing or paste.** Validate and explain instead. Trim whitespace. [WIG]
- [ ] **F3 Submit buttons.**
  - Stay enabled until clicked.
  - Then disable, show a spinner and keep the label ("Placing call…", "Saving…").
  - Send an idempotency key for call placement, test calls and top-ups.

  [WIG]
- [ ] **F4 Errors on submit.** Move focus to the first error. Announce errors through a polite `aria-live` region. [WIG]
- [ ] **F5 Warn before leaving with unsaved changes.** Applies to Flow Builder, Settings and the Cockpit's customer-context panel. [WIG]
- [ ] **F6 Style native `<select>` for Windows dark mode.** Set its background and text colour explicitly. [WIG]
- [ ] **F7 Mobile input text is 16 px or larger.** Never disable zoom. [WIG]
- [ ] **F8 Keyboard submission.** This rule has no ID in the raw checklist; it comes from the WIG forms list.
  - Enter submits a single-input form.
  - In a textarea composer, pick one convention (Enter or Cmd/Ctrl+Enter) and show a hint.

  [WIG]

#### 5.3.7 Feedback states

- [ ] **Q1 Every data view ships all states:** empty, sparse, dense, loading, error and permission denied. [WIG; TS]
- [ ] **Q2 Empty state anatomy.**
  - One sentence saying what will appear here.
  - The primary next action.
  - An optional link to docs.
  - No large illustration and no poetic copy.
  - Example: "Transcripts appear here once a call connects" rather than a bare "Awaiting connection".

  [WIG; TS copy audit]
- [ ] **Q3 Skeletons mirror the final layout.**
  - Show them after a 150-300 ms delay.
  - Keep them visible for at least 300-500 ms, so they do not flicker.
  - No generic centred spinner for page loads.

  [WIG; TS]
- [ ] **Q4 Errors say what happened, how to fix it, and offer the action.** Example: "Couldn't place the call. Your wallet balance is ₹0. Top up to continue." [WIG copy]
- [ ] **Q5 Match the safety net to the risk.**

  | Action | Pattern |
  |---|---|
  | Low risk (lead status change) | Optimistic update with rollback |
  | Delete | Undo |
  | Irreversible (activate a flow that dials, delete an agent, export data) | Explicit confirmation |

  [WIG]
- [ ] **Q6 Live regions.**
  - Announce these politely: call status changes, final transcript turns (throttled) and toasts.
  - Never announce every streaming partial.

  [WIG; Inf]

#### 5.3.8 Motion

- [ ] **M1 App motion budget.**

  | Interaction | Duration |
  |---|---|
  | Hover, press | 100-150 ms |
  | Menus, popovers | 150-200 ms |
  | Sheets, drawers | 200-250 ms |

  Nothing in the app runs longer than 300 ms. [Inf from ADM and WIG; TS motion dial 2-3]
- [ ] **M2 Easing.**
  - Enter and exit: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). [TS minimalist]
  - Drawers: `cubic-bezier(0.32, 0.72, 0, 1)`. [TS soft-skill]
  - Never linear for UI motion.
- [ ] **M3 Animate transform and opacity only.** List transitioned properties explicitly and never use `transition: all`. [WIG; TS]
- [ ] **M4 Honour `prefers-reduced-motion`.**
  - Disable idle loops, such as the Cockpit STANDBY radial and the marketing waves and orbs.
  - Keep instant state changes.

  [WIG; TS]
- [ ] **M5 No perpetual motion on idle UI.**
  - A pulse is allowed only on a genuinely live indicator (call connected, recording).
  - Any autoplaying element that runs longer than 5 s next to content needs a pause, stop or hide control.
  - Motion must have a reason: hierarchy, feedback or a state transition. Looking impressive is not a reason.

  [WIG; TS]
- [ ] **M6 Canvas motion.**
  - Pan and zoom with transforms.
  - While dragging, disable text selection and make siblings `inert`.
  - Re-route edges without forcing layout reads.
  - Animations stay interruptible.

  [WIG]

#### 5.3.9 Accessibility

- [ ] **A1 Visible focus on every interactive element.**
  - Use `:focus-visible` with a 2 px accent outline and a 2 px offset, at 3:1 or better against adjacent colours.
  - Never `outline: none` without a replacement. `.btn-saffron` currently has no `:focus-visible` style.

  [WIG]
- [ ] **A2 Icon-only buttons have an `aria-label` and a tooltip.** Decorative icons are `aria-hidden`. [WIG]
- [ ] **A3 Text contrast is AA or better:** 4.5:1 for small text, 3:1 for large text and non-text UI. This includes placeholders, helper text and error text. WIG prefers APCA where available. [TS form contrast check; WIG]
- [ ] **A4 Colour is never the only cue.** Applies to sentiment, call status, flow validation and latency. [WIG]
- [ ] **A5 Page structure.** A heading hierarchy, a skip link, landmarks (`nav`, `main`, `aside`) and an accurate `<title>` on every route. Use semantic HTML before ARIA: links are `<a>`, so Cmd/Ctrl-click works, and there is no `div` with `onClick`. [WIG]
- [ ] **A6 Hit targets are 24 px or more (44 px on touch).** Visual size and hit area match on flow ports, table checkboxes and sidebar items. No dead zones. [WIG]
- [ ] **A7 Accessible media.**
  - Call recordings come with transcripts.
  - The player is keyboard operable: Space to play or pause, arrow keys to seek ±5 s, and speed control.
  - Meetings have captions.

  [WIG]
- [ ] **A8 Canvas accessibility.**
  - Offer an outline or list view of flow steps as an alternative to spatial editing.
  - Nodes are focusable, with arrow-key navigation.

  [WIG gestures need alternatives; Inf]
- [ ] **A9 `translate="no"` on brand names, agent names, flow names and IDs,** so browser auto-translate of a Hindi UI does not mangle them. Set `lang` on transcript turns. [WIG]

#### 5.3.10 Responsive

- [ ] **R1 Breakpoints.**
  - Define them at 640, 768, 1024, 1280 and 1536 px.
  - Verify at 375, 768, 1024, 1280 and 1440 px, and at ultra-wide (browser zoom at 50%).
  - Test with always-visible scrollbars, as on Windows.

  [TS; WIG]
- [ ] **R2 Below 768 px:**
  - The sidebar becomes a bottom bar or a hamburger sheet.
  - The wallet banner collapses to a compact chip.

  [ADM Linear, Vercel; Inf]
- [ ] **R3 Tables below 768 px** either become card lists, or keep a sticky first column and scroll horizontally inside their container. [WIG; ADM]
- [ ] **R4 Flow Builder at smaller widths.**
  - Below 1024 px it is a read-only viewer, with a note to open it on a larger screen to edit.
  - At 1024-1279 px the palette and inspector become sheets.

  [Inf]
- [ ] **R5 Full-height shells use `min-height: 100dvh`, never `100vh`,** because the iOS address bar changes the viewport height. [TS]
- [ ] **R6 Bottom bars respect safe-area insets.** [WIG]

#### 5.3.11 Copy

- [ ] **P1 Plain, specific, active voice, second person.** No filler verbs such as "unleash", "elevate", "seamless" or "next-gen". [TS; WIG]
- [ ] **P2 One copy register per page.**
  - No poetic kickers in product UI. Analytics currently uses lines like "how the calls felt" and "the dispatch from your line".
  - No performative craftsman labels.

  [TS]
- [ ] **P3 Consistent nouns. Pick one term from each set and use it everywhere:**
  - "Flow", "Call flow" or "Voice journey"
  - "Agent" or "Assistant"
  - "Room" or "Meeting"
  - "Top up" or "Recharge"

  [WIG keep nouns consistent]
- [ ] **P4 Specific button labels.** Examples: "Place test call", "Activate flow", "Create meeting room", "Save context". Not "Continue" or "Submit". [WIG]
- [ ] **P5 Sentence case for headings and buttons across the app.** This follows Linear, Notion, Stripe, Intercom and Taste Skill redesign. See 5.4 for the WIG conflict. [TS; ADM]
- [ ] **P6 Numbers and money.**
  - Use numerals for counts and a space before units.
  - Format rupees with `Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR'})`, which gives lakh grouping.
  - Keep decimals consistent per context: 2 for wallet balances, 0 for KPIs.
  - Format dates with `Intl`, never hard-coded.

  [WIG]
- [ ] **P7 No em-dash in UI chrome.** Use a period, colon or parentheses instead. Example: "Wallet empty. Top up to keep calls running." [TS]
- [ ] **P8 No exclamation marks in success messages, and no "Oops".** [TS redesign]
- [ ] **P9 In-progress copy ends with `…`** ("Connecting…", "Transcribing…"). Menu items that open a follow-up step also end with `…` ("Rename…"). [WIG]

### 5.4 Where the sources disagree, and the resolution for Vaani

| Topic | One side | Other side | Resolution |
|---|---|---|---|
| Inter | Taste Skill discourages Inter as an unexamined default. `soft-skill` bans it. | Linear-, Vercel- and Raycast-style systems treat Inter as the nearest free match. Taste Skill allows it for Linear-style and accessibility-first work. | Keep the shipped Hanken Grotesk (or Geist). Do not add Inter. Consistency matters more than the specific face. |
| Button shape | Vercel, Stripe and ElevenLabs use pill CTAs. | Linear, Notion, Supabase, Intercom and Cal.com use 6-8 px rectangles and keep pills for tabs and status. | 6-8 px rectangles in the app. Pills only for filter chips, status and avatar groups. Marketing follows the same radius logic (shape consistency lock). |
| Letter case | WIG (Vercel house style): Title Case for product headings and buttons. | Taste Skill redesign, Linear, Stripe and Intercom: sentence case. | Sentence case everywhere. |
| Em-dash | Taste Skill bans it completely. | Vercel and others use it in copy. | Banned in UI chrome (buttons, labels, banners, empty states). Allowed in long-form docs and the blog. |
| Glass, gradients, orbs | `soft-skill` and `gpt-tasteskill` promote glass, double bezels and mesh. | Main Taste Skill calls glass inappropriate for dashboards. Linear, Supabase and Intercom use no atmospheric gradients. | None in the app. On marketing, at most one restrained atmospheric element in the hero, with real product screenshots doing the rest. |
| Mono labels | Vercel uses small mono eyebrows on marketing. | Intercom and Linear keep mono off chrome. Taste Skill limits eyebrows to one per three sections. | Mono only for data tokens (IDs, phone numbers, timers, code). No mono section labels in the app. |
| Scroll motion | Minimalist and soft variants reveal everything on scroll. | WIG allows animation only when it clarifies cause and effect. Taste Skill's product dial is 2-3. | No scroll reveals in the app. Marketing only, and reduced-motion safe. |
| Heavy density rule | Taste Skill at density 8-10 wants mono for all numbers and no cards. | ADM product systems keep numbers in the sans. | Tabular numerals in the sans are enough. Keep mono for tokens. |

### 5.5 Starter tokens (derived from the references, contrast-checked)

These tokens are not copied from any single brand. Values in parentheses are contrast ratios.

**Light theme**

| Token | Value | Notes |
|---|---|---|
| `--canvas` | `#fafafa` | Page background |
| `--surface` | `#ffffff` | Panels, cards, inputs |
| `--surface-2` | `#f5f5f5` | Inset areas, hovered rows, code |
| `--surface-3` | `#efefef` | Pressed, neutral selected |
| `--border` | `rgba(0,0,0,.08)` | Hairline, about `#ebebeb` on white. Decorative only. |
| `--border-strong` | `#d4d4d4` | Input borders. Pair with the 2 px focus ring to meet 3:1 for non-text UI. |
| `--text` | `#171717` | 17.93:1 on white |
| `--text-secondary` | `#525252` | 7.81:1 on white |
| `--text-muted` | `#737373` | 4.74:1 on white, 4.54:1 on canvas. The floor for readable meta text. |
| `--text-disabled` | `#a3a3a3` | 2.52:1. Disabled text only. |
| `--accent` | `#2563eb` | White label 5.17:1. Hover `#1d4ed8` (6.70:1). |
| `--accent-soft` | `#eff6ff` | Pair with accent text `#1d4ed8` (6.16:1) |

Light-theme semantic colours:

| State | Soft pair (text on background) | Solid |
|---|---|---|
| Success | `#166534` on `#dcfce7` | `#15803d`, white label 5.02:1 |
| Warning | `#92400e` on `#fef3c7` | `#b45309` |
| Danger | `#991b1b` on `#fee2e2` | `#b91c1c`, white label 6.47:1 |

**Dark theme.** Depth comes from a surface ladder with no shadows, following Linear and Raycast.

| Token | Value | Notes |
|---|---|---|
| `--canvas` | `#0a0a0b` | |
| `--surface` | `#111113` | |
| `--surface-2` | `#18181b` | |
| `--surface-3` | `#1f1f23` | |
| `--border` | `#26262b` | |
| `--border-strong` | `#3a3a40` | |
| `--text` | `#f4f4f5` | 18.0:1 |
| `--text-secondary` | `#a1a1aa` | 7.72:1 |
| `--text-muted` | `#8b8b93` | 5.85:1. Not `#71717a`, which is 4.09:1. |
| `--accent` | `#3b82f6` | As text 5.38:1. Links use `#60a5fa` (7.78:1). |
| Success / warning / danger | `#4ade80` / `#fbbf24` / `#f87171` | 11.36:1 / 11.85:1 / 7.15:1 |

**Radius.** Nested radii are concentric: a child's radius equals the parent's radius minus the padding between them. [WIG]

| Token | Size | Used for |
|---|---|---|
| `--r-xs` | 4 px | Keycaps, badges |
| `--r-sm` | 6 px | Buttons, inputs |
| `--r-md` | 8 px | Menus, small cards, nodes |
| `--r-lg` | 12 px | Panels, cards |
| `--r-xl` | 16 px | Modals, large containers |
| `--r-full` | full | Avatars, status pills, filter chips |

**Elevation (light theme only).** Adapted from Vercel's stacked levels. Every level includes a 1 px ring at 6% black. On tinted surfaces, shadows may be tinted toward that hue, as Stripe does.

| Level | Shadow (after the ring) | Used for |
|---|---|---|
| `--e0` | None, just a border | Default |
| `--e1` | `0 1px 2px` at 4% | Nodes, cards on hover |
| `--e2` | `0 1px 1px` at 2%, plus `0 4px 8px -2px` at 6% | Popovers, the selected node |
| `--e3` | `0 1px 1px` at 2%, plus `0 8px 16px -4px` at 8%, plus `0 24px 32px -8px` at 10% | Modals, sheets |

**Sizes.**

| Item | Size |
|---|---|
| Spacing steps | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Controls | 32, 36 or 40 px (44 px on touch) |
| Sidebar | 56 px collapsed, 232-248 px expanded |
| Page header | 56-64 px |
| Table row | 44 px (36 px compact) |
| Mono text for tokens | 12-13 px |

**Motion.**

| Token | Value | Used for |
|---|---|---|
| `--dur-1` | 120 ms | Hover, press |
| `--dur-2` | 180 ms | Menus |
| `--dur-3` | 240 ms | Sheets |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | Enter and exit |
| `--ease-drawer` | `cubic-bezier(0.32,0.72,0,1)` | Drawers |

**Focus.** `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`.

**Theme metadata.** `<meta name="theme-color">` matches the canvas. Set `color-scheme: dark` on `<html>` in dark mode. [WIG]
