# Sutradhar: the final design direction for Vaani Labs

**Status:** final. This supersedes the three competing directions in `spec/directions/` (Switchboard, Bolchaal, Clear Path).
**Date:** 2026-09-26.
**Scope:** the signed-in web app first, then auth and marketing on the same tokens.
**Next documents:** `01-foundations` fixes every token value. The page and component specs build on this file.

| Item | Where |
|---|---|
| This direction | `spec/00-design-direction.md` |
| Final specimen (light and dark follow the OS; there is a theme switch in the header). It links `tokens/tokens.css`, `tokens/base.css` and `components/components.css` and defines no component of its own | `spec/00-direction-specimen.html` |
| Renders | `spec/00-direction-specimen-light.png` (1440 viewport, full page), `-dark.png` (same, dark scheme), `-mobile.png` (390 viewport, 375 px content, stitched from three captures) |
| **Canonical component CSS** (the one file every mock and the product's `components/ui` copy from) | `spec/components/components.css`; guard `node spec/components/check-mocks.mjs` (§8.1) |
| **Canonical render** (one PNG per signature component, light and dark side by side) | `spec/components/canonical.html` → `spec/components/canonical/*.png` (§8.1) |
| The mark (working version, see §3.1) | `spec/brand/mark.svg`, inline symbol `spec/brand/mark-symbol.html`, sheet `spec/brand/mark.html` |
| The three competing directions, scores and the decision | `spec/directions/README.md` |
| Evidence | `audit/consolidated/*`. Finding ids (F-FLOW-001 and so on) are cited throughout. |

---

## 0. Name and essence

**Sutradhar (सूत्रधार).** In Indian theatre the sutradhar is the one who holds the threads. They set the scene, direct the players and tell the audience what is happening. In Vaani Labs the operator holds the threads (the flow, the call, the transcript, the wallet) while the agent speaks on stage. So the interface has two jobs. It keeps every thread visible and traceable to its source, and it keeps the stage (the conversation) in front of everything else.

**Essence:** a calm, exact console for running voice agents. It is never wrong about what is live, what a call will cost, or what was said and in which language.

**In one picture:**
- Graphite chrome with one Neel accent (नील, indigo) for the operator's intent.
- Green, amber and red only for real call and record state.
- Dense tables where you scan, calm forms where you decide.
- A Flow Designer that reads Trigger → Logic → Action → Outcome through node shape.
- A Neel-ink **Baseline** under every desktop screen, stating only facts the system has computed: the one place the brand colour appears at scale.
- Hindi set in Devanagari wherever Hindi was spoken.

The name is internal vocabulary for the design team. Users never see "Sutradhar".

---

## 1. Why this direction

### 1.1 The decision

| Direction | Taste | Product | Build | Mean | Lens wins |
|---|---:|---:|---:|---:|---:|
| **Switchboard** (precision operator console) | 7.5 | **8.5** | **8.5** | **8.17** | **2 of 3** |
| Bolchaal (voice-native identity) | **8.5** | 7.0 | 6.5 | 7.33 | 1 of 3 |
| Clear Path (guided clarity) | 6.0 | 8.0 | 7.5 | 7.17 | 0 of 3 |

Switchboard wins on a clear majority (the product and build lenses) and has the highest mean. **Sutradhar keeps Switchboard's system:**
- tokens and contrast
- the density model
- the Flow Designer and its lifecycle
- the keyboard model

**It then fixes Switchboard's weak spots with the best ideas from the other two directions.** It resolves all 36 must-fix items raised by the three judges (section 9).

### 1.2 Why the operator base is right for this product

The audit's core problem is not how Vaani looks. It is that **the product does not tell the truth about live, billable state.** Five of the top eight issues are truth or safety failures:
- edits autosave into the live flow (F-FLOW-001)
- "Up to date" shows while saves fail (F-QA-002)
- "FLOW VALIDATED" shows on invalid flows (F-FLOW-004)
- a single `c` key dials a real, billable call (F-A11Y-004)
- "You're live" shows on an account that cannot call (F-UX-006)

Two of the five critical issues are keyboard lockouts (F-A11Y-001, F-A11Y-002). The product judge scored Switchboard highest because its lifecycle is the most complete: draft and live revisions, a save-state machine that ignores hydration, If-Match, and a Publish sheet with a diff and impact. It also handles large flows best: left-to-right phases, level of detail, frames, find and Tidy. The build judge scored it highest because its tokens are exact, every text pair passes in both themes, and the migration from today's 32 variables is one-to-one.

### 1.3 What Sutradhar changes from Switchboard, and why

| Switchboard did | Sutradhar does | Why (judge / finding) |
|---|---|---|
| IBM Plex Sans, Mono and Devanagari | **Hanken Grotesk + JetBrains Mono + Noto Sans Devanagari** (3 families, all already shipped or free) | Hanken is the audit's "keep" face (section 4) and the marketing face. Plex carried an IBM/Carbon association and a two-brand migration (product and build must-fix; taste weakness). |
| Neel `#2C4BD1`, read as generic SaaS blue | **Indigo-dye Neel `#1F4A94`** (white label 8.5:1), used with less frequency. Re-keyed on 2026-09-27 from the first Sutradhar value `#2B45C2`, which sat at HSL ≈230°, about 5° from Linear's `#5E6AD2`, and whose dark text `#8FA3FF` read periwinkle | Taste: "reads as standard SaaS blue", then "too close to Linear". Hue moved to ≈218° (OKLCH ≈260°) with a third less chroma: the colour of the dye, not of a screen. |
| 11 px uppercase caps headers and phase labels | **12 px floor everywhere**, sentence-case 12/500 headers | Product and build must-fix; F-VIS-002. |
| HI/EN mono boxes, Q1/KB chips, keycaps inside buttons | **Language marks in native script**, step links in plain words, keycaps only in tooltips, menus and the `?` sheet | Taste: "a softened version of the HUD dialect". |
| Half-round entry edge, 3 px terminal bar (too subtle) | **Full capsule ends** on Trigger and Outcome, and **four distinct neutral glyph tiles** kept at every zoom level | Taste: "every node is the same white card"; product: Logic and Action look alike at low zoom. |
| 56 px rail across all of 1024–1439 | **Labelled 232 px sidebar from 1280**, rail only at 1024–1279 | Build graft from Bolchaal; 1366×768 is a common Indian office laptop (F-UX-007). |
| Status line in every screen, including the Flow Designer | **Baseline hidden in the Flow Designer**; its live and wallet facts merge into the 48 px header | Product must-fix: it stacked with the Problems bar. |
| Admin could skip the pre-flight for small batches | **No skip, ever.** A remembered "tested today" and one-keystroke confirm | Product must-fix; F-UX-013. |
| Setup only as a status-line fact | **A setup track** (Home route plus a sidebar card), visible at every breakpoint | Product must-fix; F-UX-001, F-UX-006. |
| Focus and selection both a 2 px accent outline | **Focus = outline with offset. Selection = accent-soft fill + 1 px accent border.** Both show together. | Build must-fix; F-A11Y-007. |
| Outline grouped by phase | **Outline nested by branch** ("If Yes → Book site visit → Visit booked") | Product graft from Bolchaal. |
| `role=contentinfo` status line with polite changes | A labelled region, with **only state changes announced** (debounced) | Build must-fix. |

### 1.4 What is grafted from the other two directions

**From Bolchaal** (the identity layer the taste judge rewarded):
- **Language marks.** A script glyph plus the language name (अ Hindi, த Tamil, A English, अA Hinglish), with `lang` set on every transcript turn.
- **The talk strip.** A two-lane conversation line, used only in the Cockpit live card and the Call reports scrubber, and only when per-turn data exists.
- The branch-nested phone Outline.
- The Cockpit ≥1440 Calls column.
- The labelled "Publish with 1 warning" button, and an amber "Not connected" answer row.
- The blocking-notice rule.
- Wallet runway ("about 16 h of calls", computed from the real per-second rate).
- `@custom-variant dark` with one theme mechanism.

**From Clear Path** (the guidance layer the product judge rewarded):
- **The setup track.** "Get your first call live", on Home and in the sidebar card.
- **Call gate logic.** Blocking versus advisory checks, a repeat-call guard, cost as a range, and the batch landing in Scheduled.
- **The live note.** "Callers hear v7 until you publish."
- A **Go to [step]** select on every answer.
- A template gallery and "Describe it".
- A test-call advisory on Publish.
- One-line phase descriptions in the palette.
- The per-view state matrix.
- A status-sentence grammar.
- `@theme inline` token mapping, lint rules and the component build order.

**Rejected, with reasons:**
- **Plex:** migration cost and genericness.
- **Anek as a fourth family:** the three-family budget.
- **The warm khadi ramp:** it changes every neutral and can drift beige on low-end screens.
- **Peacock as the accent:** a brand change, and a colour-vision risk next to success green (luminance only 1.15 apart).
- **Jamun, plum and indigo tiles:** purple-AI adjacency.
- **When / Check / Do / End:** the brief's vocabulary is Trigger → Logic → Action → Outcome.
- **Renaming destinations** to Live calls, Call history and Rep desk: muscle memory.
- **52 px default rows:** operators live in these tables.
- **Conversation lines in the Leads table:** noise, and they depend on data that may not exist.
- **Pill chips.**
- **"Undo publish":** calls already placed on v8 cannot be undone.

### 1.5 How Sutradhar earns its own identity

**What is borrowed, said plainly.** The shell is made of conventions every serious work tool shares: a grouped sidebar with a workspace switcher, view tabs with counts, a floating selection bar, a command palette. Sutradhar claims none of them. The first renders went further than sharing: they assembled Linear's sidebar almost element for element (a switcher with up/down chevrons, a search field under it, grey right-aligned counts, a raised white key for the current page on a grey sidebar, the account at the bottom), keyed the accent about 5° from Linear's indigo, and set the Baseline as a black band that read as an IDE status bar. The taste critique of 2026-09-27 was right, and these changed:
- **Neel is re-keyed to indigo dye** (`#1F4A94`, HSL ≈218°, a third less chroma; §5). Indigo is the colour India exported to the world, and "indigo" means "from India"; the value now looks like the dye, not like a screen blue.
- **The Baseline is Neel-ink** (`#0F203D`) in both themes, so the brand colour appears once, at scale, on every desktop screen.
- **The sidebar sheds the Linear tells.** No bordered search field under the switcher: Search is a plain row like the nav items (the JumpButton keeps its place and tab stop; ⌘K is in its tooltip); a single `chevron-down` on the switcher; the current page sits **on the thread**, a 1 px line down each nav group marked by a 2 px Neel segment, instead of a raised key. The thread is the sutradhar's, drawn at the size of a hairline.
- **A real mark replaces the letter V** (§3.1): the cord, two strands (the agent's voice and the caller's) twisted into one thread.

**The signatures are not new inventions.** A status band, labelled output ports and a timecoded transcript all exist elsewhere. What is Vaani's is what they carry: computed facts about a prepaid INR wallet and a live Indian phone line (the Baseline); Hinglish and Devanagari examples on every decision (answer rows); the language of each turn in its own script (turn rows).

**Where the identity shows, destination by destination** (≥1024; below that the Baseline's facts move to the TopBar chips and More › Workspace status, and the mark to the NavSheet and More account block):

| Destination | Mark | Neel-ink Baseline | Neel intent (one primary, focus, selection, the thread) | en-IN numerals, ₹, IST | Voice in its own script | Signature component |
|---|---|---|---|---|---|---|
| Cockpit | ✓ | ✓ | ✓ | ✓ | turn rows, language marks | Call gate, turn rows, talk strip |
| Assistant | ✓ | ✓ | ✓ | ✓ | replies tagged with their language | plan steps behind the autonomy gate |
| Rep console | ✓ | ✓ | ✓ | ✓ | turn rows | call card, turn rows |
| Meetings | ✓ | ✓ | ✓ | ✓ | notes as turn rows | turn rows |
| Personal agents | ✓ | ✓ | ✓ | ✓ | voice and language picker | autonomy gate |
| Flows | ✓ | list page ✓; the designer folds it into its header | ✓ | ✓ | bilingual answer examples | answer rows, phase shapes, Publish gate |
| Knowledge | ✓ | ✓ | ✓ | ✓ | (neutral by rule, §3.2) | status sentences |
| Leads | ✓ | ✓ | ✓ | ✓ | Language column | Call gate |
| Call reports | ✓ | ✓ | ✓ | ✓ | transcripts | turn rows, recording scrubber |
| Analytics | ✓ | ✓ | ✓ | ✓ | language names in breakdowns | (neutral charts, §3.2) |
| Billing | ✓ | ✓ | ✓ | ✓ (₹ grouping, UPI) | (neutral by rule) | Top-up sheet with runway |
| Settings | ✓ | ✓ | ✓ | ✓ | default voice and language | (neutral by rule) |

Four carriers are on all twelve: the mark, the Neel-ink Baseline, Neel as intent (with the thread) and Indian numerals with IST. Hanken Grotesk, already the marketing face, is the typographic constant but not a differentiator on its own. Billing, Settings and Knowledge stay deliberately neutral (§3.2).

What stays out: ⌘K showmanship, keycap strips, mono uppercase labels, and any "AI" glow.

---

## 2. Principles

There are seven principles, ranked. When two conflict, the higher one wins. Each comes with do / don't pairs taken from real Vaani screens.

### P1. Say only what is proven
Every status comes from a state machine or a computation, and is written in words. If the data does not exist, the element is hidden. It is never simulated.

| Do | Don't |
|---|---|
| Flow header: `Live v7` · `Draft · 3 changes` · `Saved 11:24 am` · `1 warning` (recomputed on every change) | A permanent green "FLOW VALIDATED", or "Up to date" while a save failed (F-FLOW-003, F-FLOW-004) |
| Baseline: `No calling number · calls can't be placed · Finish setup (3 of 5)` | "SYS: ONLINE · 22ms" from a random timer, or "You're live" at ₹0 (F-UX-018, F-UX-006) |
| Cockpit shows only the selected lead and the current call; missing fields read "Not captured" | Demo intel next to a real lead, or sentiment before a call (F-UX-003) |
| Hide the talk strip when there are no per-turn timestamps; show one language mark per call when there is no per-turn language | A plausible-looking fake waveform or fake per-turn tags |
| Call reports: "1–50 of 121", with KPIs counted over calls, not legs | KPIs aggregated over the 50 loaded rows, and two-leg test calls counted twice (F-QA-005, F-QA-006, F-QA-014) |

**One fact, one place per viewport.** A proven fact is stated once on screen. It may appear a second time only where the repeat adds an action the first place does not offer (the Baseline's "Top up", a gate row's "Include"); a repeat that only restates is removed. Check it per breakpoint, because the owner of a fact moves (the Baseline at ≥1024, the TopBar chips below).

| Do | Don't |
|---|---|
| Flow Designer: `● Live v7` once in the header (opens versions) and the live note once in the phase-ruler row ("Callers hear v7 until you publish · Compare with live"); the inspector says nothing about Live | "Live v7" three times and "Callers hear v7 until you publish" twice in one viewport |
| Leads at ≥1024 with a low wallet: the amber Baseline segment (with Top up), and the Call gate row when the gate is open. No page WalletNotice and no Billing nav badge | The same low balance four times: page notice, Baseline, sidebar "Low", gate row |
| Home: the setup track states "2 of 5 done" once, in its own heading; the page has one heading (the 40 px first-run display is the H1) and the sidebar setup card hides while Home is open | "Home" as an H1, a 40 px heading under it, and "2 of 5 done" in the header meta and again in the track |
| Leads and Call reports: the toolbar's right-hand count `212 of 1,284` is the one place the view's size is stated; its breakdown (talk time, negatives) opens as a popover | An "In this view · 212 leads…" band that repeats the count and costs a 28 px row the chrome budget never counted |
| Phone: `Filter (2)`; the two filter tokens are listed inside the filter sheet | `Filter 2` followed by the same two tokens, clipped off-screen |
| Assistant on a phone: the waiting step says "Waiting for you" once, on the step itself; the plan bar shows the count ("1 step needs you") | "Waiting for you" in the plan bar, the step and the composer hint |

### P2. Colour is state; shape is type
Chrome is graphite. **Neel** means operator intent: the one primary action per region, focus, selection, links and the active nav icon. **Green, amber and red** mean live or success, pending or warning, and failed. Flow step types are told apart by **silhouette and glyph**, never by hue.

| Do | Don't |
|---|---|
| `Publish v8…` in Neel. `Draft · 3 changes` as a neutral chip. Amber only for the one warning. | Green ACTIVATE, teal Import, a violet Meeting Agent, orange and yellow node categories (F-VIS-004, F-FLOW-007) |
| Trigger and Outcome as capsules, Logic and Action as rectangles, each with its own neutral glyph tile | Coloured node titles at 1.48–2.34:1 (F-FLOW-007), or plum, jamun or indigo "category" tiles |
| Outcome steps carry the semantic colour of the state they write (`Lead → Interested` in green) | Colour as decoration on icons, charts or backgrounds |
| Every state has a word and an icon as well as its colour | A coloured dot as the only signal (F-A11Y-019) |

### P3. Nothing dials, bills or goes live without a gate
A **gate** is one component: a checklist of blocking and advisory checks, a cost line and one confirming action. Every billable call goes through the **Call gate**. Every flow goes live through the **Publish gate**. The **Setup track** is the same component on a page. Specified once in `spec/02-components-gate.md` (anatomy, check kinds, cost line, keys and every variant).

| Do | Don't |
|---|---|
| `C` on a lead opens the Call gate. Start with `⌘/Ctrl+Enter`. | A single key or one click placing a real call (F-A11Y-004, F-UX-013) |
| Blocking checks disable Start and give the reason: "Outside calling hours. Opens 10 am IST." | A disabled button with no reason |
| Advisory checks adjust the batch: "Called 22 h ago · skipped · Include" | Silently calling someone twice in a day |
| The cost is a range from the real rate: "2 calls · about 1 to 2 min each · ₹5 to ₹10" | "≈ ₹11" (false precision), or no cost at all |
| `Publish v8…` shows validation, the diff and where it goes live. After publishing, the toast offers `Roll back to v7…`. | Autosaving into the live flow (F-FLOW-001), or an "Undo publish" that pretends calls on v8 never happened |
| At most a remembered "Tested today", plus one keystroke to confirm | Any setting, admin ones included, that skips the gate for billable calls |

### P4. Dense where you scan, calm where you decide
Density is a per-user setting on data surfaces only:
- **Standard:** 40 px rows, 32 px controls
- **Compact:** 32 px rows, 28 px controls
- **Touch** (automatic): 48 px rows, 44 px controls

Forms, dialogs and the inspector always use Standard spacing.

| Do | Don't |
|---|---|
| Leads at 1440×900 shows about 16 rows in Standard and 20 in Compact (chrome is 244 px) | 7 rows under 400 px of chrome (F-VIS-009) |
| Data text is 13 px and nothing is below 12 px; table headers are 12/500 sentence case | 8–10 px tracked mono and 11 px caps headers (F-VIS-002, F-A11Y-008) |
| Settings and forms sit in a 720 px reading column | Forms stretched to 1,300 px at 1920 (F-VIS-034) |

### P5. Every action has an address
This covers keyboard, pointer, touch and screen reader alike. Every shortcut also has a visible button. Every drag also has a list or select.

| Do | Don't |
|---|---|
| Rows, flow steps and answer sockets take focus. `C` opens "Connect to…". Every answer has a `Go to [step ▾]` select. The Outline is a full editor. | 9×9 px mouse-only handles (F-A11Y-001) |
| Focus is a 2 px outline with a 2 px offset. Selection is an accent-soft fill plus a 1 px accent border. When both apply, both show. | One accent outline for both focus and selection (F-A11Y-007) |
| Keycaps appear in tooltips, menus and the `?` sheet. Single-key shortcuts can be turned off. | `New lead N` or `Start 3 calls ⌘↵` printed inside button labels, or a permanent shortcut strip |
| Selections, filters, the open record and the open flow live in the URL | State lost on reload or Back (F-QA-016, F-UX-031) |

### P6. One frame, every breakpoint designed
One shell: a grouped sidebar, a 56 px page header with one H1, the content, and the 28 px Baseline. Each breakpoint gets its own layout rather than a shrunken copy.

| Do | Don't |
|---|---|
| ≥1280: labelled 232 px sidebar. 1024–1279: 56 px rail that expands as an overlay. 768–1023: top bar plus nav sheet. <768: bottom bar plus More, reaching all 12 sections. | Phones reaching 6 of 12 sections (F-RWD-001), or the tablet sidebar pushing content down to 528 px (F-VIS-033) |
| Flow Designer: edit from 1024; review, Test and Publish from 768; outline, test and status below 768 | Publish clipped off-screen at 768–877 (F-RWD-003) |
| Chrome budget: on 1366×768 and 1280×720 laptops (inner viewports about 1366×657 and 1280×609), at least 10 Leads rows show in Standard | A 42 px banner on every page (F-UX-028), or a budget computed from the screen height instead of the viewport |

### P7. Quiet chrome; the work and the voice are loudest
The largest element on a page is the work: the table, the canvas or the conversation. Motion belongs to real live state and real audio only. Chrome that restates a fact already on screen is the first thing to cut (P1, one fact, one place per viewport).

| Do | Don't |
|---|---|
| One level of containment, with borders doing the structural work | Box-in-box fields (F-VIS-016) |
| The Cockpit opens on a "Ready to call" card. The live dot pulses 3 times when a call goes live, on the focal call only, then holds still. Meters move only on real audio. | A 320 px STANDBY ring, orbs or marching-ants edges (F-VIS-029, F-FLOW-011, F-A11Y-022) |
| Solid fills and hairlines | Gradients, glass, glows, noise, grid or hatch textures (F-VIS-022, F-QA-038) |

---

## 3. Brand expression rules

### 3.1 Where the identity shows up (and only here)

| Carrier | Rule |
|---|---|
| **Neel accent** | One hue in both themes, keyed to indigo dye (HSL ≈218°; it never turns violet or periwinkle). On any screen, count the filled Neel elements: at most one primary button per region, plus the selection. If a screen looks "blue", something is misusing it. |
| **The Baseline** | The 28 px band at the bottom of every desktop and laptop screen, in **Neel-ink** (`--bl-bg`, `#0F203D`) in both themes, with a hairline in dark. It is the only dark band in the light theme and the one place the brand colour appears at scale. Never add a third colour to it except amber, for a blocked or low state. |
| **Native script** | Hindi turns in Devanagari (15/26, `lang="hi"`). Language marks show a script glyph plus the name. Hinglish is its own language and is set in Latin. |
| **Indian numerics** | en-IN grouping (₹2,34,050.00; ₹85 L in dense cells, ₹85,00,000 in detail), explicit IST, calling hours, DND. |
| **Answer rows** | Bilingual examples on every Logic output ("haan, zaroor · हाँ"). The builder should look like it was made for Indian conversations. |
| **The mark** | **The cord** replaces the V monogram (a letter in a tile is the letter pseudo-icon anti-pattern 10 bans). One thread splits into two strands, the agent's voice and the caller's, which twist over and under each other and join again: the sutradhar's thread, and a conversation. White strands on a Neel-ink tile (`--mark-bg` / `--mark-fg`) in both themes; no gradient, no glow, no letter. Working version: `spec/brand/mark.svg` (32 grid, 2.25 stroke, 1.3 gap at each crossing, tile radius 7), used by every mock through one inline symbol (`brand/mark-symbol.html`). **Commission brief** for the final mark: keep the concept (one thread, two voices, over-under); it must read at 16 px as a favicon, work as a single-colour stroke without its tile, survive a monochrome print, avoid letters and Devanagari used as ornament, and avoid waveform bars and sparkles (the generic voice-AI marks). Deliverables: tile and tile-less versions, 16/20/28/48 px optical cuts, and a wordmark lockup in Hanken Grotesk 600. |
| **Marketing** | The same tokens and faces. The hero is a real product surface (a live call card with its transcript), not an orb. Solid ink headlines, display up to 56/60. |

### 3.2 Where the identity must stay out of the way
- **Tables, forms, Settings, dialogs, empty and error states:** neutral. No accent except the primary and focus.
- **The canvas:** nodes are neutral surfaces. Frames may carry a user-chosen low-saturation tint (the pressure valve for "we want colour back").
- **Charts:** a separate chart palette (Ink, Teal, Ochre, Rose, Slate) and a teal heat ramp, never the state colours for series. Neel appears in a chart only on the hovered or selected datum, because Neel means "selected" (amended 2026-09-27, 01-foundations §3.6).
- **No decorative India:** no rangoli, paisley, tricolour, saffron or diya motifs, and no Devanagari used as ornament. Devanagari appears only where the content is Hindi or where it names a language.
- **No illustrations, mascots or emoji in the product.** Empty states are a sentence and an action.
- **The agent persona ("Vaani")** is a name and a voice, not a face. At most there is a 32 px avatar tile in the Cockpit voice picker.

---

## 4. Voice, tone and microcopy

### 4.1 Tone
A capable colleague on the operations floor: **plain, specific, calm, never cute.** They say what happened, what it means and what to do next, in that order. They are just as calm when something failed.

### 4.2 Rules
1. **Sentence case everywhere.** Uppercase only for acronyms as written (UPI, DND, CRM, IST, API) and keycap glyphs. Remove literal capitals from strings; do not hide them with CSS.
2. **Buttons are verbs, with the object:** "Publish v8…", "Call 2 leads…", "Top up", "Place call". A trailing "…" means a confirmation or another step follows.
3. **Status grammar:** `[state badge] + one sentence + quiet meta + at most one action`. For example: "`Couldn't save` Your last 2 edits are on this device only. · 11:42 am · Retry".
4. **Blocked means say why and how:** "Wallet is ₹0. Top up to place calls." with the link on "Top up". Disabled controls always carry their reason.
5. **Numbers first, then words:** "2 calls · about 1 to 2 min each · ₹5 to ₹10". A non-breaking space goes between a number and its unit (6 s, 180 ms).
6. **One date grammar:** `Today 10:42 am`, `Yesterday`, `3 days ago`, then `21 Sep 2026`. 12-hour time with lowercase am/pm (the en-IN default). Calling hours carry "IST". Timecodes are `mm:ss`.
7. **No em-dash separators in chrome.** Use a full stop, a colon or a middle dot (F-UX-043). No exclamation marks in success messages, and no "Oops".
8. **Confirmations name the object and the consequence:** "Delete 'Polite close' and its 2 connections?" Offer Undo where possible instead of a dialog.
9. **Placeholders are examples ending in "…",** never labels.
10. **One brand spelling:** "Vaani Labs", with "Vaani" as the default agent and the developer namespace. The aliases "Vani Voice" and "VaaniVoice" are retired (F-UX-043).

### 4.3 Glossary (one name per concept)

| Concept | Use | Retire |
|---|---|---|
| A call script | **Flow**; its parts are **steps** | "Voice journey workspace", "node" (in UI copy) |
| Step phases | **Trigger · Logic · Action · Outcome** (with one-line descriptions in the palette) | When/Check/Do/End, "Start Call" pill |
| A Logic output | **Answer** (fallback: **No reply** or **Else**) | "TRUE ↓ / FALSE →", handle positions |
| Going live | **Publish** creates **Live v8**; edits live in the **Draft** | ACTIVATE, Save (in flows), "Up to date" |
| Numbers | **Inbound number** and **Caller ID** (F-UX-015) | DID, "assigned number", "your phone number" |
| Money | **Wallet**, **Top up**, **Autopay**, **Usage** | "Recharge", "Wallet empty — top up now" |
| Calling | **Place call** (phone), **Talk in browser** (mic), **Test call** (on a draft) | CONNECT, "Test Call" with no explanation |
| Places | Cockpit · Assistant · Rep console · Meetings · Personal agents · Flows · Knowledge · Leads · Call reports · Analytics · Billing · Settings | "Agent View", "AGENT COCKPIT", "Meet Agent", "Meeting Agent — Vikash" |

### 4.4 Jargon to retire (and what replaces it)

| Today | Replace with |
|---|---|
| "SYS: ONLINE · 22ms", "RGN: Mumbai-1" (F-UX-018) | Nothing idle. During a call: "Line · Good · 180 ms". |
| "LAT: 0ms", "SESSION: IDLE", "STANDBY", "Awaiting connection…" | The Ready-to-call card; the call state (Idle, Dialling…, Live) in words |
| "CUSTOMER INTEL", "TRANSCRIPT FEED", "PICK A TOOL, THEN CONNECT IT" | "Lead", "Transcript", "Add step" (as real headings) |
| "FLOW VALIDATED" | "No issues" / "1 warning" / "2 errors" (computed) |
| "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled" (F-QA-039) | Nothing. Security claims live on /security, with evidence. |
| "SIGNAL LOST / STATUS: DISCONNECTED" (404, F-QA-017) | "This page doesn't exist. Go to Cockpit." inside the app shell |
| "§ 01" and serif-italic kickers (F-VIS-010) | "Overview", "Call volume", "Sentiment" |
| "Exit" (sign-out on a primary tab) | "Sign out…" in the account menu |
| Vendor and internal names: VOBIZ, Gemini, pgvector, LiveKit, `NEXT_PUBLIC_…`, `force=true`, `metadata.extra`, `Soul.md` (F-UX-016) | Plain words: "Phone line", "Indexed", "Re-analyse call", "Extra columns", "Agent instructions" |
| "You're live" before checks pass (F-UX-006) | "Finish setup (3 of 5)"; "Live" only after number, wallet, a published flow and a connected test call check out |

### 4.5 Bilingual rules
- **Chrome is English in v1,** with every string in i18n keys so a Hindi UI can follow. Content is in the language spoken: prompts, examples, transcripts and summaries.
- **Per turn:** `lang` is set on each transcript turn. Devanagari uses 15/26 so the matras clear. Hinglish (romanised Hindi) stays in Latin and is tagged `hi-Latn`, with the mark "अA Hinglish".
- **Language marks** are the language name, with an 18 px glyph tile (a `surface-3` fill with no stroke, so it never looks like a keycap) in front of it only in voice and language pickers and the call-header legend. The name always carries the meaning, because a Tamil reader will not recognise a Telugu glyph. Tables and lists show the name alone; the bare tile (with `aria-label`) appears only in turn rows, where space is tight.
- **Names** of leads, places and brands get `translate="no"` and are never machine-translated.
- **Voice agent copy** in the builder shows the language it will be spoken in ("Auto · Hindi + English"). "Hear it" previews use the chosen voice.

---

## 5. Visual summary

These are character and anchor values. `01-foundations` fixes the full ramps, the tokens and their contrast proofs.

| Area | Direction |
|---|---|
| **Type families** | **Hanken Grotesk** 400/500/600: all UI, titles and marketing display. **JetBrains Mono** 400/500: tokens only. **Noto Sans Devanagari** 400/500/600: loaded by `unicode-range` and size-adjusted to Hanken's x-height. Noto Sans Tamil, Telugu, Bengali and so on load lazily for transcripts and language marks. That is three families in the budget (the per-script Noto files are one family design). Sora, Instrument Serif, Syne, Rajdhani, Inter, DM Sans, Geist and IBM Plex are retired (F-VIS-036). The `next/font` variables go on `<html>`, so nothing falls back to system-ui (F-VIS-008). |
| **Type scale** | 12 meta · 13 data, nav, buttons and labels · 14 body · 15/24 reading (transcripts) · 15/26 Devanagari · 16/24 panel titles · **20/28 page H1 (the only H1 style)** · 24/32 setup headings · 28/32 KPI numerals · 40/48 first-run display · 56/60 marketing only. Weights 400/500/600, with 600 as the ceiling. Negative tracking only at 20 px and above (−0.01 to −0.03 em). **Nothing below 12 px**, including table headers, keycaps, bottom-bar labels and canvas text at any zoom. `font-variant-numeric: tabular-nums` on every number that changes or is compared (Hanken's figures are already fixed-width, *measured* in 01-foundations §0; the rule protects fallbacks). |
| **Mono** | Only for machine tokens a person copies or types: ids (`call_7c21e0`), `{{variables}}`, code and API keys, and keycaps. **Never** for phone numbers, timers, timecodes or durations (these are Hanken with `tabular-nums`: `+91 •••••• 4821`, `02:14`; Hanken's figures are already fixed-width, so mono would only add width and weight mid-sentence), and never for labels, headings, buttons, money, counts or language codes (amended 2026-09-27, 01-foundations §0). |
| **Accent** | **Neel, keyed to indigo dye** (re-keyed 2026-09-27; the values below are the tokens, not anchors). Light: fill, text, focus and marks `#1F4A94` (white label 8.52:1), hover `#183C7A`, press `#143368`, soft `#EDF3FC`. Dark: fill `#2F62C0` (white 5.75:1), hover `#356AC4` (white 5.24:1), text, focus and marks `#8DB2EE` (8.33:1 on `#14171C`). **Neel-ink** `#0F203D` is the Baseline band and the mark tile. One hue (HSL ≈218°, OKLCH ≈260°) in both themes, lower in chroma than a screen blue, and clear of the ≈230–245° SaaS indigo (Linear `#5E6AD2` is 234°, Stripe `#635BFF` 243°). |
| **Neutrals** | Cool **graphite** continuing today's `#111725` ink. Light: bg `#F6F7F9`, surface `#FFFFFF`, text `#121722`, text-2 `#434B5B`, text-3 `#5F6878` (replaces the failing `#7A8397`), control borders `#7E8695` (≥3.06:1 on every plane). Dark: bg `#0D0F13`, surface `#14171C`, text `#E8EBF0`, text-3 `#8C94A2`, control borders `#6A7281`. (The first anchors `#858D9C`, `#666E7D` and `#16A34A` failed 1.4.11 on some planes and were corrected in `01-foundations` §0; no render or mock may use them, and `check-mocks.mjs` rejects any colour that is not a token.) |
| **Baseline** | **Neel-ink `#0F203D` in both themes**, so the brand colour appears once, at scale, on every desktop screen and the band stops reading as an IDE status bar. Text `#C9CED8` light / `#B3BAC6` dark (10.28 / 8.31:1), values `#FFFFFF` / `#E8EBF0`, separators `#183C7A`; in dark a `#3A4250` top hairline keeps it a band on `#0D0F13`. Amber `#F5B544` (8.94:1) marks a blocked or low segment in both themes. |
| **State** | Success green, warning amber and danger red, each as a soft pair (text on tint, ≥5.4:1) plus a solid. The live dot is `#13923F` / `#4CC47F`. Amber is never used as standalone text on white. |
| **Density** | Standard 40/32 (the default) · Compact 32/28 (`⇧D`) · Touch 48/44 (automatic on `pointer: coarse` or below 768 px). Data surfaces only. |
| **Shape** | "Machined, not soft." Radius 4 (tags, keycaps, checkboxes) · 6 (buttons, inputs, menus, filter tokens, answer rows) · 8 (panels, cards, nodes, table frames) · 12 (dialogs, sheets). **Fully round only for** avatars, the live dot, switches and the capsule ends of Trigger and Outcome steps. No pill buttons, tags or chips. |
| **Lines** | 1 px hairlines do the structural work. 1 px `--control` (≥3:1) on anything you type into or tick. 2 px only for focus, selection and the active tab. **A dashed line means one thing: a fallback path on the canvas.** |
| **Elevation** | Light: e1 (nodes, secondary buttons), e2 (popovers, the selected node), e3 (dialogs, sheets, the bulk bar, gates). Dark: a surface ladder plus a 1 px ring, no shadows. No blur, and only a flat scrim behind modals. |
| **Motion** | "A relay clicking": 90 / 140 / 200 ms with one easing, `cubic-bezier(.2,0,0,1)`. Only `transform` and `opacity` animate. **Loops are bounded:** the live dot pulses 3 cycles each time a call enters Live, on the focal CallHeader only; a spinner or indeterminate bar loops only while a user-started request is in flight; meters move only on real audio. Nothing loops on an idle screen, and all of it stops under reduced motion (or the in-app Motion preference), as do test-run edge traces (amended 2026-09-27; 01-foundations §11, 07-motion MD3). |
| **Icons** | Lucide at 1.5 px stroke (16 px in UI, 20 px on the phone bar). One icon per destination. Four custom phase glyphs drawn to Lucide metrics (see 6.5). |

---

## 6. How the direction applies

### 6.1 The shell

**Navigation.** One name per destination, everywhere: nav, H1, `<title>`, phone bar and ⌘K all come from one nav config. The sidebar is grouped and labelled:

| Group | Destinations |
|---|---|
| Operate | Cockpit · Assistant · Rep console · Meetings · Personal agents |
| Build | Flows · Knowledge |
| Data | Leads · Call reports · Analytics |
| Account | Billing · Settings |

- **Workspace switcher** at the top: the mark, the org name and your role, and one `chevron-down` (F-UX-029).
- **Search or jump** (⌘K) under the switcher, drawn as a plain row like the nav items (`.jump`: icon + "Search", no border, no placeholder look); ⌘K appears in its tooltip. At 1024–1279 it is the rail's search icon, below 1024 the TopBar search button. The Baseline keeps its "Search" text button at the right end as the second, keyboard-adjacent entry.
- **Account menu** at the bottom: profile, theme (System, Light, Dark), motion (Match system, Reduce motion; `data-motion="reduce"`, 07-motion MD4), shortcuts on/off, and `Sign out…`.
- The current page sits **on the thread**: each nav group has a 1 px `--border` line down its left edge, and the current item marks it with a 2 px `--accent-mark` segment, an accent icon, 600 text and `aria-current`. No raised key, no fill; hover is `--nav-hover-bg`. The rail marks its current icon the same way on its left edge.
- Nav badges carry computed facts that are not already on screen (`2 live`, `1 draft`, `18 due`). Wallet state is never a nav badge: the Baseline owns it at ≥1024 and the TopBar wallet chip below.
- One tab stop per item, plus a skip link (F-A11Y-012).
- Every shell part is drawn from `components/components.css` (Sidebar, Rail, TopBar, BottomBar, MoreSheet, PageHeader, Baseline); see §8.1.

**Setup track.** While setup is incomplete, the sidebar shows a card above the account menu: `Finish setup · 3 of 5 · Next: add money`. The workspace also lands on **Home** (`/home`): "Get your first call live". The five steps are:
1. Publish a flow (template gallery)
2. Verify your calling number
3. Add money
4. Call yourself
5. Import leads or connect inbound

"Live" appears only after all of them pass. Organization and team are created with the workspace at sign-up, so invites never dead-end (F-UX-001, F-UX-006). The card also appears in the tablet nav sheet and the phone More sheet, and hides while Home itself is open (the page is the track, so the card would repeat it). Home has no separate page-header row: its one heading is the 40 px first-run display ("Get your first call live", the H1), and the track states its progress ("2 of 5 done") once, in its own heading. Once setup is complete, Home drops out of the nav and Cockpit becomes the landing page.

**Page header** (56 px): the title-20 H1, one line of meta in text-3, and up to three actions on the right (at most one primary).

**The Baseline** (28 px, the first signature):
- **Colour:** Neel-ink `#0F203D` in both themes (`--bl-bg`), the one place the brand colour appears at scale.
- **Position:** under every desktop and laptop screen except the Flow Designer.
- **Contents, left to right, each a link:**
  1. the live flow and version
  2. the inbound number and its readiness
  3. the wallet with runway (`Wallet ₹2,340.50 · about 16 h of calls` → Billing › Wallet)
  4. calls in progress (→ Cockpit)
  5. during a call, the call timer
- **Right side:** `Shortcuts` and `Search`.
- **States:** a low or blocked state turns that segment amber with an action ("Wallet ₹42.10 · about 17 min · Top up").
- **Replaces:** the 42 px wallet banner (F-UX-028) and "SYS: ONLINE".
- **Accessibility:** a labelled region, "Workspace status". Only state changes are announced (Live, Ended, Low balance, Couldn't save), debounced. Timers, wallet decrements and cost-so-far are never announced.
- **Blocking notice rule:** a blocking problem appears where it blocks, never as a global bar. At ≥1024 that is the amber Baseline segment (with its action) plus the reason on the blocked control and its gate row; the page-scope WalletNotice is **not** shown there, because it would be the third statement of one fact (P1). The WalletNotice appears only on pages without a Baseline: tablet and phone widths (where the TopBar wallet chip has no room for a sentence) and the Flow Designer's Test panel.

**Breakpoints:**

| Width | Shell |
|---|---|
| ≥1440 desktop | Labelled 232 px sidebar. Records open as a 440 px side sheet beside the content, and inspectors dock at 320 px. |
| 1280–1439 laptop | The same sidebar. Sheets overlay the right third. |
| 1024–1279 laptop | 56 px icon rail with label tooltips (never clipped). `[` or the logo expands it as an **overlay with a scrim**. The Baseline stays. |
| 768–1023 tablet | 52 px top bar: menu, page title, **two separate chips** (call state appears only during a call; wallet is its own chip), search. The menu opens the grouped nav as a left sheet with the setup card. Pages are single-pane, and sheets take 100% height. |
| 320–767 phone | Top bar (title, the same chips) and a bottom bar with 5 items (Cockpit, Leads, Call reports, Flows, More) at 12 px labels. **More** is a sheet listing all remaining destinations, the setup card, the account and Sign out, so 12 of 12 are reachable (F-RWD-001). Tables become two-line list items. A blocked wallet also shows inline on every Call action. |

**Chrome budget.** On 1366×768 and 1280×720 laptops, Leads must show at least 10 rows in Standard. Budgets are computed on the **inner viewport**, not the screen: in maximised Chrome or Edge on Windows those laptops give about **1366×657** and **1280×609** (`05-responsive` §2.1 lists the reference sizes; tests run at them). The chrome is header 56 + views 40 + toolbar 48 + table head 32 + pager 40 + Baseline 28 = 244 px, and nothing else: there is no "In this view" band (the toolbar count carries the view's size and opens its breakdown as a popover). At a viewport height of 720 px or less, the Baseline folds into a header chip (the BaselineChip) and the view tabs fold into a View select in the toolbar, which leaves 176 px of chrome. So on the reference office laptop the Baseline is **always** the BaselineChip: that chip is the primary workspace-status surface there and is tested there, and the full band shows from 1536×864 laptops (about 1536×730) up. Result: 12 rows at 1366×657, 10 at 1280×609, 12 at 1536×730, 18 at 1920×969.

### 6.2 Cockpit (place, watch and wrap up calls)

- **Idle:** a **Ready to call** card replaces the STANDBY ring (F-VIS-029). It holds:
  - Contact: a search, or a `+91` tel field with a visible label
  - Flow: name, version, `Live` tag (a draft can be picked for test calls only)
  - Voice: a 32 px tile, "Vaani · Hindi + English", and a ▶ preview
  - Language: Auto or fixed
  - Readiness, shown as an inline gate

  Actions are **Place call…** (primary, through the Call gate) and **Talk in browser** (secondary). These replace the unexplained CONNECT and Test Call (F-UX-026). A disabled Place call states its reason. The pickers never write the account default silently; "Make default" is a separate link (F-UX-014).
- **Live** (desktop ≥1440): three columns.
  1. **Calls column** (240): Live now · Up next · Recent. Supervisors switch calls here.
  2. **Call card** (400):
     - the call-state stepper `Dialling 00:00 → Ringing 00:03 → Live 00:09 → Wrap-up`
     - the **talk strip** (two lanes, agent above and caller below, with a now-marker and "Agent 58% · Caller 42% · 1 interruption"), shown only when per-turn timing exists
     - **Now in the flow**: "Ask about a site visit · step 3 of 8 · Open in flow"
     - flow, voice, line quality ("Good · 180 ms"), cost so far
     - **Captured so far** (for example "2 of 3", with pending fields reading "Waiting for an answer…")
     - Take over · Transfer… · End call
  3. **Transcript** (the rest), made of turn rows.
- **Turn rows** (the third signature):
  - a 56 px `mm:ss` gutter (`meta-12`, tabular)
  - speaker (13/600) · language mark · a step link in plain words ("Ask about a site visit", which opens the node) · an optional source note ("Knowledge · price-sheet.pdf")
  - the utterance at 15/24 (Devanagari 15/26)
  - Caller turns sit on surface-2. A partial turn is text-3 ending in "…".
  - "Jump to latest" appears when the operator scrolls up.
  - Only final turns are announced, at most one every 2 s.

  The same row is used in Call reports, Rep console, Meetings notes and the flow Test panel.
- **One call-state machine** is shared with Rep console, Call reports and Test: Idle → Dialling… → Ringing… → Live → Wrap-up → Ended | No answer | Busy | Voicemail | Failed. Amber for dialling and ringing, green for live, red for failed, neutral otherwise. Each state has a word and an icon, and state changes are announced.
- **End call** has no confirmation (ending is urgent and expected). It uses a danger outline.
- **Wrap-up:** an outcome form pre-filled from the Outcome step, then **Save and next**.
- **At laptop sizes** the Calls column becomes a header switcher. **Tablet:** Call and Transcript become tabs. **Phone:** the card stacks over the transcript, with Take over and End call in a sticky 44 px bar (F-RWD-002, F-VIS-007).

### 6.3 Leads (find, qualify and call people safely)

- **Header:** "Leads", with the meta "1,284 leads · synced 11:24 am". Actions: Export, Import…, and **New lead** (the primary).
- **Views** as tabs, with counts over the whole pipeline (F-QA-015): All · New · Callbacks due · Interested · Not reached · Save view.
- **Toolbar:**
  - search (`/`)
  - a **Filter** menu that adds 6 px filter tokens (`Language  Hindi, English  ×`)
  - on the right, **the view count** (`212 of 1,284`): the one place the view's size is stated. It is a button; its popover gives the breakdown (callbacks due, interested, average interest) and the "counted over the whole pipeline" note. There is no "In this view" band.
  - Columns
  - a Standard/Compact switch
  - all of it in the URL
- **Table:** a real `<table>` with a sticky 12/500 header and `aria-sort`. Columns: checkbox · Lead (500) · Phone (masked, tabular figures) · Status (one tag) · Last call (outcome · time) · Interest (right-aligned number + 40 px bar) · **Language (language mark)** · Flow · row actions on hover or focus (`Call…`, `⋯`).
- **Row states:** hover is surface-2. Selected is accent-soft with a 2 px inset accent bar. Keyboard focus is a 2 px outline with offset (J/K move, X select, Enter opens).
- **Lead sheet** (440 px, deep-linked): Overview · Calls (turn-row history) · Notes. `Delete lead…` lives in the overflow menu, never under Call (F-UX-032, F-UX-035).
- **Bulk bar** (e3, floating above the pager): count · **Call n leads…** · Set status · Assign flow · Export · Clear.
- **Call gate** (popover from any call action):
  - flow + version + tested state
  - Caller ID verified
  - calling hours
  - **DND** (n of n clear)
  - **recently called** (auto-skipped, with Include)
  - language match
  - the cost range against the wallet runway

  Start is `Start n calls` (Neel), with the count updated after skips. After confirming, the batch appears in Cockpit › Up next as **Scheduled**, with Pause and Cancel. Every request carries an idempotency key.
- **Import…** (CSV or XLSX) gets a mapping preview with row-level errors (F-QA-022).
- **Phone:** two-line list items (name + tag / masked phone · last outcome · time) with the language mark on the right, and at least 5 leads per screen (F-RWD-011). Selection uses a Select button. The toolbar shows `Filter (2)` and the count; the active filter tokens are listed inside the filter sheet, never as a clipped row.
- **Wallet low or empty at ≥1024:** the amber Baseline segment and the reason on every Call action (and its gate row) carry it; no WalletNotice on the page (§6.1, P1).

### 6.4 Call reports (review what happened)

- The header, the views (All · Needs review · Positive · Negative · Mixed · Unscored) and the toolbar follow the same Leads template, including the toolbar count (`38 of 212`) whose popover holds the view totals (calls, talk time, average length, negatives). No "In this view" band.
- **Server pagination** ("1–50 of 121") with server-side search, sort and filter (F-QA-005). KPIs count calls, not legs, and exclude **test calls** by default, with a "Show test calls" toggle (F-QA-006, F-QA-014).
- **Anchored columns** (≤9 by default, the rest in Columns): When · Lead · Phone · Direction · Duration (tabular) · Outcome (one tag) · Sentiment (icon + word) · Flow + version · Language. No dash-filled columns (F-VIS-027, F-UX-009).
- **Rows** are focusable `<tr>`s with a row link. Enter opens the **call detail sheet** (560 px). Focus moves in, Esc returns it, and the sheet is deep-linked `?call=…` (F-A11Y-002). It holds:
  - a header (lead, when, duration, outcome, flow version, `2 legs` disclosed if relevant)
  - the **recording scrubber**: the talk strip as a keyboard slider (`role=slider`, ±5 s), shown only when per-turn times exist
  - the AI summary, captured fields and topics
  - the **transcript** in turn rows, with the timecode seeking the recording
  - actions: Re-analyse call, Download (overflow)
- **Tablet and phone:** a list with outcome and time, and the detail as a full-height sheet (F-RWD-004, F-RWD-010).

### 6.5 Flow Designer: Trigger → Logic → Action → Outcome

**Job:** script what the agent does on a call, prove it works, and put it live on purpose. The designer should feel like a precise circuit editor that happens to speak Hinglish. The React Flow base stays; everything below is additive to it.

**The four phases.** The palette, phase ruler, glyphs, Outline, validator and aria-labels all use the same four words. Each palette group has a one-line description.

| Phase | Palette description | Step types | Outputs |
|---|---|---|---|
| **Trigger** | When a call starts | Inbound call · Outbound batch · API or webhook · Browser test | 1 |
| **Logic** | Listen and decide | Question · Branch (variable · operator · value) · Verify caller | Named answers plus a mandatory **No reply** or **Else** |
| **Action** | Do something for the caller | Speak · Knowledge lookup · CRM lookup · Book meeting · Send WhatsApp · Transfer to a person | 1 (lookups, Book meeting and Transfer show **result rows**: Found / Not found, Booked / Not booked, Connected / Didn't connect) |
| **Outcome** | How the call ended | End with outcome: Interested · Callback · Not interested · No answer · Transferred · Do not call · Failed | 0. It writes the lead status and the call-report outcome. |

**Layout at 1440:**
- **Header** (one 48 px row): breadcrumb and flow name · `Draft · 3 changes ▾` (a **neutral** chip that opens the version menu) · the save state · `● Live v7` · undo, redo, Tidy. Right side: the issues chip, **Test**, and one primary, **Publish v8…**. Everything else (Share, Export or Import JSON, Duplicate, Delete) goes into `⋯` (F-FLOW-018, F-FLOW-019).
- **Phase ruler** (40 px): one connected bar of four glyph-tile-and-count segments joined by `arrow-right` icons, `Trigger 2 → Logic 1 → Action 3 → Outcome 4` (never chevrons, which are the breadcrumb's separator). Clicking one emphasises that phase: other steps take the surface-2 fill and their tiles, sockets and connectors dim to 40% (text never dims). An optional **Phase columns** view, off by default, tints Tidy's layers in alternating bands with the phases they hold; nothing moves. **The live note sits on the right of the same row:** "Live v7 answers +91 80 •••• 2210 since 12 Sep. Callers hear v7 until you publish. Compare with live". It collapses to the Live chip when the draft is clean. This merge keeps the canvas at full height.
- **Tool rail** (48 px): Add step (`A`), Outline (`O`), Variables (`V`), Find (`⌘F`), Version history, Flow settings.
- **Canvas.** Its dot grid is the only texture in the product (1 px dots every 16 px, ink at 12%).
- **Inspector** (320 px, resizable to 480): Configure · Test data · Issues. It never restates the live state: `● Live v7` in the header and the live note in the phase-ruler row are the only two places that name the live version, and each adds its own action (versions menu, Compare with live) (P1, one fact, one place).
- **Problems bar** (32 px): the current issue with **Go to step**, plus the Outline and Test panel toggles. The app sidebar collapses to its rail while a flow is open, and **the Baseline is hidden**, so the canvas gets about 70% of 1440×900 (F-FLOW-022).

**Shape grammar** (colour means state, shape means type):

| Phase | Silhouette | Glyph tile (24 px, neutral) |
|---|---|---|
| Trigger | **Capsule start**: the left end fully round, the right end 8 px | **Solid ink** tile with a white glyph (phone-incoming, list, webhook) |
| Logic | Rectangle (8 px) with **answer rows** under the body | **Outlined** tile with a diamond glyph |
| Action | Rectangle (8 px), with the tool icon in the tile | **Tinted** (surface-3) tile with the tool glyph |
| Outcome | **Capsule end**: the right end fully round | A tile in the **semantic soft colour of the state it writes**, with a flag glyph, plus the status line **Lead → Interested** (plain meta-12 text with an arrow icon, not a chip: the tile carries the tone) |

- Every node shares one surface, a 1 px border-strong edge, e1, a 14/600 ink title, and a 12/600 **sentence-case** phase word in text-3 ("Logic · Question").
- **Node states:**

| State | Treatment |
|---|---|
| Selected | accent-soft fill on the header, 1 px accent border plus a 1 px inner accent ring, e2 |
| Keyboard focus | 2 px `--focus` outline with a 2 px offset |
| Focused and selected | both treatments at once |
| Error | red border and a "2" error badge |
| Warning | amber border and a badge |
| Unreachable | surface-2 fill with every word at full contrast; only the glyph tile, sockets and connectors at 50%; plus the badge "Not connected" (opacity never touches text) |
| Running in a test | accent trace once, then static |

**Answer rows** (the second signature):
- Every Logic output is a 28 px row: **label** (13/500), **bilingual examples** directly after it (12, text-3, left-aligned, e.g. "haan, zaroor · हाँ"), and a 10 px socket on the right edge with a 24 px hit area. On `pointer: coarse` the row grows to 44 px, so the socket's target is the full-height end of its row: 44 × 44 at 100 % zoom (`04-flow-designer/01` §6.1).
- Actions that can fail use **result rows** instead, so "decides" and "did" never look alike: a 12 px check or x glyph in text-3, a 13/400 label in text-2, no examples, and a lighter inset rule.
- The fallback row ("No reply · after 6 s") sits on surface-2 with a hollow socket. **Its edge is the only dashed line in the product.** An unconnected required row is amber, "Not connected", with a fix hint in the inspector.
- Edge labels travel with the edge on long branch connectors (skipping a layer or running back) and on hover or selection; short connectors rely on the row beside the socket. Meaning never depends on handle position or colour (F-FLOW-020, F-FLOW-011).
- In the inspector each answer also has a **Go to [step ▾]** select. You can wire a flow without dragging.

**Level of detail.** No text is ever below 12 px on screen (F-FLOW-008):

| Zoom | Nodes show |
|---|---|
| ≥ 0.75 | the full node |
| 0.5–0.75 | compact: glyph tile + phase word + title + answer labels |
| < 0.5 | block: the silhouette, the glyph tile and the title, as an HTML overlay counter-scaled to 12 px |

The **glyph tile and phase word stay at every level**, so Logic and Action never collapse into identical rectangles.

**Large flows** (validated against the real 26- and 35-node flows):
- Tidy (ELK layered, respecting frames, one undo step)
- **Frames** that collapse ("Greeting", "Qualification", "Booking")
- **Find** (`⌘F`), which is separate from add-step search
- multi-select with a count and a bulk bar (move, frame, delete with Undo)
- the saved viewport restored per flow
- a minimap from 1280 up that never covers nodes (F-FLOW-017, F-FLOW-021, F-FLOW-023)

**Lifecycle** (the backend comes first; see section 8):
- **Two revisions per flow,** Draft and Live. Opening a flow writes nothing.
- **The save chip** has five states: `Saved 11:24 am` · `Unsaved changes` · `Saving…` · `Couldn't save · Retry` (red, persistent) · `Not saved yet`. The dirty flag ignores hydration, fitView, dimension and selection events, and theme or viewport changes never write the flow.
- **Saving:** writes use `If-Match`, and a 409 opens a conflict sheet. Pending saves flush on `pagehide`.
- **Deleting** a step raises an Undo toast.
- **Publish v8…** opens the **Publish gate** (640 px sheet):
  1. **Checks.** Errors block, and Publish is disabled with the reason ("Fix 2 errors to publish"). A warning needs a tick and relabels the button **Publish with 1 warning**. **"Test call placed on this draft"** is advisory and can be skipped with a recorded reason.
  2. **Changes.** A diff where each item links to its step.
  3. **Where it goes live.** Inbound numbers, outbound batches and the Cockpit default. "Active flow" is resolved per trigger (F-FLOW-014).
  4. An optional note.
  5. The Publish button.
- **After publishing,** the toast reads `v8 is live on 1 number and 1 batch · Roll back to v7…`. Rollback publishes v7's content as v9 and says that calls already placed on v8 stay on v8. Version history offers **Restore as draft** and never overwrites Live directly.
- **AI draft** ("Describe it") produces a diff on the draft, with Apply to draft or Discard. It never replaces the canvas silently (F-FLOW-031).
- **New flow** opens a template gallery: Lead qualification, Site visit, EMI reminder, COD confirmation, Appointment, Support FAQ. Each template is shown as a mini Trigger → Logic → Action → Outcome strip, and every one passes validation (F-FLOW-013).

**Validation** has one rule set, shared by the chip, the node marks, the Problems bar and the server (422):

| Level | Rules |
|---|---|
| Errors (block Publish) | no Trigger · an unreachable step · a required answer not connected · an empty prompt · an invalid number · WhatsApp with no template · a lookup with no connector · an unknown `{{variable}}` · a path with no Outcome |
| Warnings | a template pending approval · a disconnected integration · a Logic step with no examples |

Validation recomputes 300 ms after each change, keyed by flow id (F-FLOW-010).

**Keyboard and assistive tech:**

| Key | Action |
|---|---|
| `Tab` | Enter at the first Trigger; order follows the graph |
| `→` / `←` | Follow or go back along edges |
| `↑` / `↓` | Move between siblings or answer rows |
| `Enter` | Open the inspector |
| `C` | Connect to… (searchable listbox) |
| `A` | Add a step after, already connected |
| `Delete` | Delete, with Undo |
| `?` | Shortcut sheet (a real dialog) |

- Each step has a full `aria-label` ("#9 Ask about a site visit, step 3 of 14 in call order, Logic, Question. Answers: Yes → Book site visit; …"). `#9` is the step's **stable number**: assigned at creation, never reused, unchanged by edits, Tidy or publishing, so references in Call reports, History and chat stay true; call order is said separately. The **Outline** is a complete non-spatial editor (F-A11Y-001, F-A11Y-027, F-A11Y-028). The one canvas key map is `06-accessibility` §9.6.
- **Touch** (`pointer: coarse` at ≥1024, e.g. landscape tablets): answer and result rows grow to 44 px, so each socket's target is the 44 × 44 end of its row at 100 % zoom; tapping it opens Connect to…. Below 100 % the target shrinks with the canvas, and Connect to… in the step menu, the `Go to` selects and the Outline are the equivalent 44 px paths (WCAG 2.5.8; `06-accessibility` §15.1).

**Responsive:**

| Width | Mode |
|---|---|
| ≥1280 | Full editor; the minimap is on |
| 1024–1279 | The inspector overlays the canvas from the right and pans the selection into view |
| 768–1023 | **Review mode.** The branch Outline and a read-only canvas side by side; Test and Publish work; editing asks for ≥1024. Publish is never clipped (F-RWD-003). |
| < 768 | **Outline nested by branch** ("If Yes → Book site visit → Visit booked", with issue badges), read-only, with Live/Draft versions, a text and browser-voice test, Publish and Roll back; the shell's BottomBar stays and Test · Publish sit in a sticky bar above it (F-RWD-014) |

**This is the one responsive decision for the designer, and every spec and render follows it:** tablets (768–1023) review, test and publish but do not edit steps; phones read the Outline. The per-width list of what works is one table, the capability matrix in `05-responsive` §10.6; FD1 §3.2 and FD2 §21 draw the layouts and point to it. Editing needs the graph in view and a pointer precise enough for it; the Outline, Go to selects and Connect to… make ≥ 1024 fully keyboard- and touch-operable (coarse pointers there get 44 px sockets and a Navigate / Arrange switch). Tablet editing is a v1.1 candidate, decided with the `review_edit_attempt` telemetry, not a v1 mode.

**Migration.**
- New flows default to left-to-right.
- The 16 existing top-down flows get an opt-in **Re-layout as draft**, which must be published like any other change. A live flow is never re-laid out silently or on open.
- Old step names map one-to-one to the new names (F-FLOW-027).

### 6.6 The other surfaces (the same patterns, applied)

| Surface | How Sutradhar applies |
|---|---|
| **Home / setup** | The setup track (the page variant of the gate) with the five steps, each with one action and a done state computed from the server. One heading (the 40 px first-run display is the H1; no "Home" title row), progress stated once in the track's heading, and the sidebar setup card hidden while Home is open (P1). A template gallery for the first flow. "Call yourself" is a Call gate aimed at your own verified number. |
| **Billing** | Tabs: **Wallet · Usage · Plans · Invoices · Autopay**. **Wallet** shows the balance (num-28) plus the runway computed from the real per-second rate, and a **Top up** sheet: UPI first, presets ₹100 / ₹500 / ₹1,000, a custom amount validated against the provider minimum, and the resulting runway shown before paying. **Usage** counts calls, not legs, with test calls separated. **Invoices** is a paginated table with download. **Autopay** has four states: Off, On (top up ₹X when below ₹Y), Paused (payment failed, with Retry), and Needs mandate renewal. Every "Top up" anywhere opens this sheet directly (`/billing?topup=1`) (F-UX-002, F-QA-004, F-UX-021). |
| **Knowledge** | A file table with an **indexing status sentence** per file ("Indexed · 42 passages · 2 min ago" / "Indexing… 60%" / "Couldn't index · Retry"). Vendor names are removed. Delete is in overflow (F-UX-033). |
| **Assistant** | Plans are listed as steps. Side-effect steps wait for approval using the **Personal Agent autonomy levels** (Auto / Confirm / Confirm + 2FA). A suggestion chip never activates anything (F-UX-022). |
| **Meetings** | Rooms are listed by title with a state sentence ("Live · 12 min · 3 people"). Stale rooms are flagged. Outputs (notes as turn rows, summary) sit on each past meeting (F-UX-038, F-QA-024). |
| **Personal agents** | The blocking prerequisite is shown first ("No number assigned. Ask an admin."). Tasks need a goal. Consumer capabilities are hidden for B2B workspaces (F-UX-039, F-UX-040). |
| **Rep console** | Availability is explicit (**Go available**, never on page load). Errors are sentences with Retry. Calls use the same call card and turn rows (F-UX-023). |
| **Settings** | A 200 px grouped sub-nav inside the shell: Workspace (Profile, **Organization & team**, Notifications) · Calling (**Phone setup**: inbound number, caller ID, transfer, test call) · Developer · Security (password, 2FA, sessions) · Data. Forms use a 720 px column. Save is enabled only when the page has unsaved changes, and it covers every field on the page (F-UX-012, F-UX-027, F-UX-044). |
| **Every data view** | One state matrix: empty (what will appear, plus one action) · filtered to nothing ("Clear filters") · loading (a skeleton after 200 ms, inside the shell) · error (a sentence plus Retry) · no permission (names the admin) (F-VIS-023, F-UX-030). |
| **Auth and 404** | The same tokens and shell. `/signup` and `/login` are separate routes with their own H1s (F-QA-010). The 404 appears inside the shell with a plain sentence. |

---

## 7. Anti-patterns (not allowed in Sutradhar)

**Visual**
1. Gradients of any kind: purple-to-blue, gradient text, gradient logo tiles, gradient buttons. The only texture allowed is the canvas dot grid.
2. Glass, blur, glows, halos, orbs, neon, and noise, grid, hatch or scanline overlays (F-VIS-022, F-QA-038).
3. Violet, purple, plum or jamun anywhere in chrome, flow tiles or the default chart series.
4. Idle or unbounded animation: rings, breathe, flicker, marching-ants edges, hover lifts, scroll reveals in the app, skeleton shimmer loops, a live dot that pulses for the whole call or on every live indicator at once, and spinners with no request behind them. The only loops are the 3-cycle pulse on the focal call, a spinner or indeterminate bar while a user-started request runs, and meters on real audio.
5. Colour as the only carrier of meaning. Coloured step types. A second accent. Green used for an action (ACTIVATE).
6. Pill buttons, pill tags, pill filter chips, and micro-badges stacked three per row.
7. Box-in-box-in-box. Cards used for layout. A panel title followed by a card that has its own title.
8. Mono uppercase tracked labels (HUD), § numerals, serif kickers, decorative status dots (F-VIS-001, F-VIS-010).
9. Text below 12 px, alpha or opacity on text colours, and placeholder text as the only label (F-A11Y-020).
10. Icon-only navigation with clipped labels. Icons reused for two destinations. Letter pseudo-icons such as "F", "IG" or "{}" (F-VIS-031), including a letter in a tile as the logo.
11. Decorative India: rangoli, paisley, tricolour or saffron flourishes, and Devanagari used as ornament.
12. Illustrations, mascots or emoji in the product, and 3D anywhere.

**Interaction and content**

13. Anything that dials or bills on a single key or a single click. Any bypass of the gate.
14. Autosave into a live revision. "Undo publish". A save chip that cannot fail.
15. Status that is not computed: "SYS: ONLINE", idle latency, "You're live" before the checks pass, a permanent "validated".
16. Keycaps inside button labels, and permanent shortcut strips.
17. Modals for everything. Confirming End call. Destructive actions next to everyday ones with equal weight (F-UX-035).
18. Global alert banners. A blocking problem is shown where it blocks.
19. Em-dash separators, exclamation marks in success messages, "Oops", poetic copy, vendor or internal names, and fake-precise numbers ("≈ ₹11").
20. Faked data: demo intel beside real leads, a talk strip drawn without per-turn data, a live meter without real audio.
21. `transition: all`, `z-index: 9999`, `outline: none` without a replacement, `user-scalable=no`, blocked paste.
22. The same fact twice in one viewport when the repeat adds no action (P1): a page notice under an amber Baseline segment, an "In this view" band under the toolbar count, a status restated in an inspector footer.
23. A component re-implemented inside a page or mock instead of drawn from `components.css`, and any colour that is not a token (§8.1).

---

## 8. Engineering guardrails that ship with the direction

### 8.1 Canonical render: one CSS, one PNG per component

Every reference HTML (the specimen, the 18 page, flow, responsive, accessibility, motion and gallery mocks) links `tokens/tokens.css` → `tokens/base.css` → `components/components.css` and keeps only page layout in its own `<style>`. `components.css` is the single definition of the signature components; the product's `components/ui` layer is built from it. Its markup has one source too: `spec/components/shell-partials.js` renders the TopBar, BottomBar, Baseline and BaselineList from one nav config and one copy of every Baseline sentence (`<div data-vl="baseline" data-vl-state="low">`), emitting `components.css` classes. The earlier shared sheets `components/shell-partials.css` and `04-flow-designer/flow-grammar.css` are merged into `components.css` (§9, §10, §15 and §17) and retired to one-line pointers. Two guards run in CI next to `check-contrast.mjs`:
- `node spec/components/check-mocks.mjs` fails when a mock:
  - does not link the three files in order, or still links a retired sheet;
  - re-implements a component, meaning a `<style>` rule whose subject uses a `components.css` base class (read from the file, so the list cannot drift) and sets anything but layout placement (margins, flex item, grid placement, width, position, `display: none`);
  - redraws a signature under another class name (any use of the Baseline's `--bl-*`, the mark's `--mark-*`, the call-state `--call-*` or the socket tokens outside `components.css`);
  - contains a hex or `rgb()` colour that is not a value in `tokens.css`.
- Visual snapshots are taken from `spec/components/canonical.html`, which renders each component once, light and dark side by side, from `components.css` with no overrides.

When a screenshot and this document disagree, the canonical crop wins; when the crop is wrong, fix `components.css` and re-render every mock. Colour-pick from the canonical crops only (the superseded directions in `spec/directions/` are archived and never canonical).

| Signature component | Class root in `components.css` | Canonical crop |
|---|---|---|
| Button, IconButton | `.btn`, `.ibtn` | `spec/components/canonical/button.png` |
| Tag, StatusTag, CallStateTag, Chip | `.tag`, `.cs`, `.chip` | `spec/components/canonical/tag.png` |
| LanguageMark, PhoneText | `.lm`, `.phone-text` | `spec/components/canonical/langmark.png` |
| Sidebar (with the mark and the thread), PageHeader, ViewTabs, Baseline | `.sb`, `.ph`, `.vtabs`, `.bl` | `spec/components/canonical/sidebar.png` |
| Rail, blocked Baseline segment | `.rail`, `.bl-seg--warn` | `spec/components/canonical/rail.png` |
| TopBar, BottomBar, MoreSheet, phone ListRow | `.topbar`, `.bbar`, `.bsheet`, `.li` | `spec/components/canonical/phone.png` |
| DataTable, toolbar count, FilterToken, BulkBar, Pager | `.dt`, `.tb-count`, `.ftoken`, `.bulk`, `.pager` | `spec/components/canonical/table.png` |
| Gate (Call gate, ready and blocked; the Publish gate and Setup track use the same parts) | `.gate` | `spec/components/canonical/gate.png` |
| StepNode, GlyphTile, AnswerRow, Socket, connectors | `.node`, `.gt`, `.ans`, `.sock`, `.fe` | `spec/components/canonical/step.png` |
| TurnRow, TranscriptFeed | `.turn`, `.tr` | `spec/components/canonical/turn.png` |
| CallStepper (Dialling → Ringing → Live → Wrap-up) | `.stepper`, `.stepper-dot`, `.stepper-t` | `spec/components/data-nav-voice.png` |
| The mark | `.mark` + `#vl-mark` | `spec/brand/mark.png` |

### 8.2 Tokens, accessibility, performance and backend

**Tokens and theming**
- Light and dark values live in plain CSS variables. Tailwind v4 maps them with `@theme inline` (for example `--color-fg: var(--text)`, `--color-fg-3: var(--text-3)`, `--shadow-e1: var(--e1)`), so utilities read `text-fg-3`, not `text-text-3`.
- `@custom-variant dark (&:where(.dark, .dark *));`. A pre-hydration script sets `html.dark` from System / Light / Dark. There is one theme mechanism and no duplicated media-query token blocks (F-VIS-021).
- An **alias layer** covers old tokens for one release (`--saffron` → `--accent`, `--text-muted` → `--text-3`). It is then deleted, along with the 36 keyframes and the glass, grid, noise and glow tokens.
- **Lint:** no arbitrary values (`text-[9px]`, `bg-[#…]`, `rounded-[9px]`), no raw Tailwind palette classes in app code, no banned strings (section 4.4), and no `font-mono` outside the token components (ids, `{{variables}}`, code, API keys, keycaps; never phones or timers).
- **Component build order:** Button · Field · Tag · LanguageMark · Gate · PageHeader · AppShell (Sidebar, Rail, TopBar, BottomBar, More sheet) · Baseline · DataTable (on TanStack Table) · Sheet and Dialog (on Radix or React Aria) · Toast · TurnRow · the flow node set (Trigger, Logic with AnswerRows, Action, Outcome) · the Gate variants. A codemod moves `.btn-*` and the bespoke buttons to the one Button (F-VIS-006).

**Accessibility**
- **Focus versus selection:** focus is always `outline: 2px solid var(--focus); outline-offset: 2px`, never a box-shadow. Selection is an accent-soft fill plus a 1 px accent border (or an inset bar on rows).
- **Forced colours:** `@media (forced-colors: active)` rules keep the focus ring, selected rows and nodes, sockets, tags, the live dot, the Baseline and dashed fallback edges visible, using `Highlight`, `CanvasText` and `ButtonBorder`.
- **Contrast in CI:** an automated test checks every foreground and background token pair in both themes, and visual-regression snapshots cover both themes. Traps locked out: text-3 on surface-3 (must stay ≥4.5), amber as standalone text, and dark accent hover with a white label (must stay ≥5:1).
- **Quiet live regions:** only state changes are announced, debounced. Transcript turns are announced when final, at most one every 2 s. Timers, wallet decrements and cost-so-far are never announced. Every route change updates `<title>` and announces the page (F-A11Y-013, F-A11Y-014).

**Performance**
- **Font budget:** three families, variable where available, Latin subset, and axes limited to the weights used. Only the regular UI face is preloaded. Devanagari and the other Indic scripts load through `unicode-range`. `display: swap` with size-adjusted fallback metrics prevents layout shift.

**Backend sequencing** (the truthful UI depends on these; until each ships, its UI state is **hidden, not simulated**):
1. Draft and live revisions with `If-Match` and 409 (F-FLOW-001, F-QA-002)
2. Server-side validation returning the same rule set (422) (F-FLOW-004)
3. Server pagination and pipeline-wide counts (F-QA-005, F-QA-015)
4. Two-leg de-duplication and test-call tagging (F-QA-006)
5. Calling-hours, DND and recently-called data for the Call gate
6. Per-second rates and median durations for cost ranges and runway
7. Per-turn timestamps and language for turn rows and the talk strip
8. Setup-state endpoints for the setup track (F-UX-001, F-UX-006)

**Interim behaviour:**
- **Flow edits: the device draft (Flow Designer part 2 §4.9, "I1"), the only interim.** Until revisions exist, edits autosave to this browser (`Saved on this device 11:24 am`, `Draft on this device · 3 changes ▾`), nothing is written to the flow calls use, and **Publish…** writes the device draft to the flow through the Publish gate, after checking that nobody published from another browser in the meantime. Today's ACTIVATE becomes "Make my Cockpit default" and never publishes. If the browser can't store the draft, the chip says `Not saved · this tab only`.
- The cost line shows "Rate ₹0.04/s" until median durations exist.

**Decisions made here** (answering the digest's open questions, 5.11):
- **Accent:** Neel, one hue in both themes, including marketing and the logo, where the violet is retired.
- **Default theme:** follow the system, with light as the fallback and full dark parity.
- **Letter case:** sentence case.
- **Save in Flow Builder:** no Save button. Autosave goes to the Draft (on this device until revisions ship), and Publish creates versions.
- **Concurrent editing:** single-editor with `If-Match` conflict handling. Presence can come later.
- **Minimum editing width:** 1024 px (CSS width, so zoom counts). Below it the designer is read-only Review (768–1023) or the read-only Outline (< 768); Test, Compare, Roll back and Publish work at every width (`05-responsive` §10.6).
- **Sidebar latency readout:** removed. Latency appears only during a call.
- **Compliance cues:** the recording disclosure, calling hours (IST) and DND appear in the Call gate and on the live card. The exact rules need the product owner's confirmation.

---

## 9. Must-fix ledger

Every must-fix item raised by the three judges, and where Sutradhar resolves it.

| Judge | Must-fix | Resolved in |
|---|---|---|
| Taste | Dark primary must keep its authority (no pale-cyan fill) | Neel dark fill `#2F62C0` with a white label at 5.75; light Neel `#8DB2EE` only for text, focus and marks (§5) |
| Taste | Draft must not be amber | Neutral `Draft · 3 changes` chip; amber is reserved for warning, ringing and low balance (P2, §6.5) |
| Taste | No purple adjacency | No plum, jamun or indigo; the chart set is Ink, Teal, Ochre, Rose, Slate, with Neel only on the highlighted datum (§3.2, §7) |
| Taste | Reduce pills | Full-round only for avatars, the live dot, switches and capsule ends; answer rows and filters are 6 px (§5) |
| Taste | Lock the display face | There is no second display face: Hanken is used throughout, and ticking numbers use tabular figures (§5) |
| Taste | No conversation line in the Leads table | Talk strip only in the Cockpit card and the Call reports scrubber, only with real data (§6.2, §6.4) |
| Taste | Flow lifecycle rendered: Publish sheet, Couldn't save, blocked Publish, focus on a node and a port | §6.5 and the specimen's Flow Designer section |
| Taste | Render the breakpoints; nothing clips at 320–375 | §6.1 table and the specimen's Breakpoints section (laptop, tablet, four phone screens) |
| Taste | Mono only for tokens; no keycaps in buttons; no caps HUD labels | §5 Mono, P5, §7 items 8 and 16 |
| Taste | Verify every pair in both themes | §8 contrast in CI; anchor values in §5 |
| Product | Onboarding at every breakpoint; no premature "live" | Setup track: Home, sidebar card, nav sheet, More sheet (§6.1) |
| Product | Billing as a real page | §6.6 Billing |
| Product | Large-flow tooling | Level of detail, frames, Find, multi-select, Tidy, viewport (§6.5) |
| Product | Phase recognition at low zoom | Glyph tile and phase word kept at every level of detail; four distinct neutral tiles (§6.5) |
| Product | Phone and tablet Outline shows branches, issues, versions and Test; Publish never clipped | §6.5 Responsive |
| Product | Chrome stacking in the Flow Designer | Baseline hidden there; the live note merges into the phase ruler row (§6.5) |
| Product | 12 px floor, including headers | §5, P4 |
| Product | No pre-flight skip | P3 |
| Product | Explicit Publish semantics; Restore instead of undo | "Where it goes live" and "Roll back to v7…" (§6.5) |
| Product | Backend before visuals | §8 sequencing and interim behaviour |
| Product | Opt-in re-layout for existing flows | §6.5 Migration |
| Product | The phone chip separates call state from wallet | Two separate chips; blocked wallet shown inline on call actions (§6.1) |
| Product | Templates for the remaining pages | §6.4 and §6.6 |
| Product | Settle the typeface | Hanken Grotesk + JetBrains Mono + Noto Sans Devanagari (§5) |
| Build | Focus distinct from selection | P5, §8 |
| Build | Forced-colours support | §8 |
| Build | Font resolution and budget | §5, §8 |
| Build | Contrast in CI plus visual snapshots | §8 |
| Build | A real 12 px floor | §5 |
| Build | Quiet live regions; no `contentinfo` overload | §6.1 Baseline, §8 |
| Build | Chrome budget at 1366×768 and 1280×720, computed on their inner viewports (1366×657, 1280×609) | §6.1 |
| Build | Touch as its own input on the canvas | 44 px answer rows with 44 × 44 socket targets on coarse pointers; Go-to selects (§6.5) |
| Build | Backend sequencing | §8 |
| Build | One nav config; minimal renames; alias layer | §6.1, §4.3, §8 |
| Build | Protect state colours for colour-vision deficiency | Neel (HSL ≈218°) is far from success green; every state has a word and an icon (P2) |
| Build | Per-flow orientation; never persist theme or viewport | §6.5 Lifecycle and Migration |

---

## 10. Risks we accept

- **Neel is a brand decision.** Marketing and the logo lose their violet. That is intended: one brand across the funnel (F-QA-013, F-VIS-025).
- **The Neel-ink Baseline is the heaviest band in light mode.** It is deliberately the one place the brand colour appears at scale, which is why it is Neel-ink rather than black (black read as an IDE status bar). It stays at 28 px with at most five facts. If research shows it is ignored, it becomes a header chip on every breakpoint.
- **On the most common office laptop the Baseline is a chip.** A 1366×768 screen leaves about 657 px of viewport, under the 720 px fold, so there the BaselineChip carries the workspace status (amber facts first) and the band is seen from 1536×864 laptops and desktops up. We keep the fold at 720 because the rows are the work: the chip gives the reference laptop 12 Leads rows instead of 11, and a band that folded only below 600 px would never fold at all, since the tablet shell takes over there.
- **The mark is a working version.** The cord is drawn to the §3.1 brief so no mock carries a letter tile; the commissioned mark replaces `spec/brand/mark.svg` and the inline symbol, and nothing else changes.
- **Monochrome nodes** depend on silhouette and glyph. The phase ruler, the palette groups and the legend in the `?` sheet teach them. User-tinted frames are the valve if teams want colour.
- **The Call gate adds a step.** It is one keystroke (`C`, then `⌘/Ctrl+Enter`), and it remembers "tested today". The cost line never disappears.
- **Data-dependent signatures** (the talk strip, per-turn language marks) may be hidden for some calls. That is correct behaviour, not a failure.
