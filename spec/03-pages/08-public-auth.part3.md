### 4.3 Theme on public and auth pages

- The same `THEME_BOOT` inline script as the app (foundations §15.3) runs before paint on every public and auth page. It reads `vaani:theme` and sets `data-theme` plus `data-theme-choice` (system | light | dark) on `<html>`. It is the only theme mechanism, and `suppressHydrationWarning` sits on `<html>` only.
- **ThemeMenu** is an IconButton tertiary md, labelled "Theme: System" (the current choice is in the name). It opens a `Menu` with radio items **System · Light · Dark**.
  - All three icons (`monitor`, `sun`, `moon`) are in the markup, and CSS shows the one matching `html[data-theme-choice]`. The server and client markup are therefore identical, which removes the #418 mismatch and the dead first click (F-QA-026).
- Phones get the SegmentedControl in the MobileMenu. Auth pages have no theme control; they follow the stored choice.
- `<meta name="theme-color">` follows `--bg`. Changing theme sends no network request.

### 4.4 Consent (ConsentBar)

A non-modal panel, shown on the first visit to any public or auth page, that never blocks the page (F-QA-033, F-UX-045).

| Part | Spec |
|---|---|
| Container | `--surface-raised`, 1 px `--border-overlay`, `--e3`, `--radius-8`, padding `--space-16`; bottom-left at `--page-margin`, max width `--size-toast` (400) at ≥768; full width above `env(safe-area-inset-bottom)` on phones; `--z-toast` |
| Copy | `label-13` "Allow analytics?" then `body-14` `--text-2`: "We use one analytics tool to see which pages help. It stays off unless you allow it." plus a link to the **Cookie policy** |
| Actions | **Allow** and **Decline**: two secondary Buttons of equal size and weight (no dark pattern), `--space-8` apart |
| ARIA | `role="region"` `aria-label="Analytics choice"`; it does not take focus; it sits after `main` in the DOM; `scroll-padding-bottom` equals its height so it never covers a focused element |

Rules:
- Before a choice: only cookieless, anonymous page counts (`persistence: 'memory'`, no autocapture, no replay).
- Do Not Track or Global Privacy Control means Decline, and the bar is not shown.
- The choice is kept for 12 months in the strictly necessary first-party cookie `vaani_consent`. The footer's "Cookie settings" reopens the bar.
- Session replay never loads on public or auth routes, whatever the choice.
- In-app analytics is governed by workspace settings (outside this spec).

---

## 5. Marketing home (`/`)

### 5.1 Purpose and jobs to be done

**Primary job.** *When I run calls for an Indian business, I want to see within a minute that Vaani can hold a real call in my customers' language and that I control what it says, so I can decide to try it.*

| # | Visitor | Job | Where |
|---|---|---|---|
| H1 | SMB founder or ops lead (the main buyer) | Hear a real call, understand the model, start | Hero player → Get started or Try it live |
| H2 | Enterprise buyer | Check control, security and a pilot path | "Nothing goes live by accident", Security, Pricing › Enterprise pilot |
| H3 | Developer | Find the API and docs | Header Docs, footer |
| H4 | Returning customer | Get into the app | Sign in, or Open app when signed in |

**Not this page's job:** long-form security (that is `/security`), price negotiation (that is `/pricing`) or a live conversation (that is `/try`, which needs consent and a phone number).

**Success signals** (§5.12): the share of visits that press Play; CTA click-through by location; `/try` starts; sign-ups per 100 visits; LCP and CLS at the 75th percentile.

### 5.2 Findings addressed

- **F-VIS-026:** the template-like hero is replaced.
- **F-QA-034:** "Talk to the agent" over-promised; unverifiable testimonials are removed.
- **F-QA-025:** the hero never mentioned India, and the language counts disagreed.
- **F-QA-027:** dead anchors.
- **F-QA-032:** a slow LCP and a heavy font payload.
- **F-QA-040:** emoji icons, two eyebrow styles, a cropped carousel.
- **F-A11Y-029:** unfocusable scroll regions and a CTA at 3.98:1.
- **F-A11Y-021:** the scrolled light nav at 1.39:1.
- **F-A11Y-026:** H2 to H4 jumps.
- **F-RWD-018:** a clipped flow demo and a home 11.7 screens long.

Strengths kept (audit §4, PUBLIC-SITE §9):
- the "Hear it work" industry × scenario × English/हिंदी demo;
- the India-specific use-case cards (EMI, DPD, COD, admissions);
- the candid security section;
- the final CTA triad.

### 5.3 Information hierarchy

1. **The H1 and its one-line promise.** A solid ink H1 on its own row, two lines at most from 768 up (a 28ch measure). The tagline's idea ("speaks India") is carried by the words and the transcript, not by a gradient.
2. **The proof: a real recorded call.** A Devanagari turn beside an English one, each line tied to the flow step that produced it, and the outcome it wrote ("Visit booked"). This is the product's own TurnRow, not an illustration.
3. **The two actions:** **Get started** (or Request access) and **Try it live**.
4. Then, in order: key facts, how flows are built, control and safety, industries, channels, security, pricing, the final CTA.

### 5.4 Section plan

Every section has an `id`, and every nav, footer or legacy anchor resolves to one (F-QA-027). Legacy hashes map client-side: `#capabilities` → `#flows`, `#features` → `#control`, `#demo` → `#top`, `#how` → `#flows`.

| # | `id` | Heading (H2 unless noted) | Content | Components |
|---|---|---|---|---|
| 1 | `top` | H1 "Phone agents that speak your customers' language." | Sub: "Vaani calls leads, answers inbound calls and books visits in Hindi, English, Hinglish and more. You design every step." (19 words). CTAs. A reassurance line from the claims sheet. The **DemoPlayer**. | Button lg (primary, secondary), DemoPlayer (§18) |
| 2 | `facts` | none: a `<ul aria-label="Key facts">` | Four facts from `claims.ts`, each a 16 px Lucide icon + `label-13` + `meta-12`: "Hindi, English, Hinglish and {n} more" (`languages`) · "{residency}" (`map-pin`) · "Prepaid in rupees, per-second rates" (`wallet`) · "Nothing goes live until you publish" (`workflow`). At ≥1024 they sit as a vertical list under the CTAs in the hero's copy column, filling the space beside the player; below 1024 they follow the hero (2 × 2 on tablets, a list on phones). Hairlines between items; no pills. | — |
| 3 | `flows` | "Design every step of the call." | Left: the **TemplateStrip** "Site visit" (Trigger · Inbound call → Logic · Ask about a site visit, with answer rows "Yes · haan, zaroor" / "Later · baad mein" / "No reply · after 6 s" → Action · Book site visit → Outcome · Visit booked). Right: three points (Trigger, Logic, Action, Outcome; answers in Hinglish; test on your own phone before customers hear it) and the link "Try a flow live". | TemplateStrip (§18), static, 12 px floor |
| 4 | `control` | "Nothing goes live by accident." | Three `Card plain`s, each with one real UI fragment: **Publish on purpose** (VersionChip "Draft · 3 changes" next to StatusTag "Live v7"; "Callers hear v7 until you publish."); **Checked before every call** (the Call gate cost line "2 calls · about 1 to 2 min each · ₹5 to ₹10" with calling hours in IST and DND); **Every call on the record** (StatusTag "Visit booked", the AI summary's first line, LanguageMarks). | Card, VersionChip, StatusTag, LanguageMark |
| 5 | `industries` | "Built for the calls Indian businesses make." | Six `Card plain`s in a **grid** (no carousel): Lending and collections (EMI and DPD reminders), Real estate (site visits), E-commerce (COD confirmation, order status), Healthcare (appointments after hours), Education (admissions season), Insurance (renewals). Each has a `Tag` with the industry, a `title-16` problem, "With Vaani:" in `body-14` `--text-2`, and a result line with a `check` icon in `--text-3`. The result line is not green: it is a claim, not a state (P2). | Card, Tag |
| 6 | `channels` | "One agent wherever customers reach you." | Three columns from `claims.channels`: Phone (`phone`), WhatsApp (`message-circle`), Browser and meetings (`monitor`). Meeting platforms are named only from the claims sheet (F-QA-025). | — |
| 7 | `security` | "Security you can check." | Two columns: a lead sentence plus the link "Read the security overview" (to `/security`); four facts from the claims sheet, including the exact SOC 2 phrase. Nothing here says "certified". | — |
| 8 | `pricing` | "Prepaid. Pay for call time." | A compact RatesTable (3 rows) from the public rates endpoint, "Rates as of {date}" and the link "See pricing". | RatesTable (§7.5) |
| 9 | `start` | "Put your first call flow live." (`display-40`) | Access CTA (primary) · **Talk to sales** (secondary) · "See pricing" (link) · the reassurance line | Button |

**Testimonials and logos.** The testimonials section is omitted until there are quotes with written permission: a name, role, company and photo. When they exist, add one row of two or three quotes after section 5, plus one case study with numbers. Initials-only avatars are not allowed, and neither are customer logos without written permission (F-QA-034, F-QA-001).

### 5.5 Layout and wireframes

```
Desktop ≥1280 (1440×900): the H1 has its own row (max 28ch, so two lines at 56 px); below it the grid is
5fr / 7fr, gap 64. Above the fold: H1, sub, CTAs, key facts and the whole player (rendered: 08-public-auth-marketing.png)
┌ MarketingHeader 56 ──────────────────────────────────────────────────────────────────────────────┐
├──────────────────────────────────────────────────────────────────────────────────────────────────┤ 64
│  Phone agents that speak                                                   (display-56, ink,      │
│  your customers' language.                                                  2 lines, max 28ch)    │
│                                                                                              32   │
│  Vaani calls leads, answers inbound  ┌ DemoPlayer (surface · border · radius-8) ───────────────────┐ │
│  calls and books visits in Hindi,    │ Recorded call · Real estate · Site visit   ✓ Visit booked   │ │
│  English, Hinglish and more. You     │ अ Hindi · A English      Recorded with a test customer…     │ │
│  design every step.  (lead-16)       │ [▶ Play]  00:14 ━━━━━━○────────────────── 01:52              │ │
│                                      ├──────────────────────────────────────────────────────────────┤ │
│  [ Get started ] [ Try it live ]     │ 00:00 │ Vaani  A   Step · Greet                              │ │
│  Prepaid in rupees · no card to      │       │ Hello, this is Vaani from Sample Realty…             │ │
│  sign up (meta-12, text-3)           │ 00:06 │ Caller  अ                          (surface-2)       │ │
│                                      │       │ हाँ, बोलिए।                     (read-15-deva)        │ │
│  ─────────────────────────────────   │ 00:11 │ Vaani  अA  Step · Ask about a site visit  (active)   │ │
│  ⌘ Hindi, English, Hinglish          │       │ Is weekend site visit ke liye free hain?             │ │
│    and more Indian languages         │ 00:19 │ Caller  अA                                           │ │
│  ⌖ Data stored in India · AWS Mumbai │       ↳ Moved to step · Book site visit     (system row)   │ │
│  ▭ Prepaid in rupees · per-second    │ [ Show full transcript ]                                     │ │
│  ⧉ Nothing goes live by accident     ├──────────────────────────────────────────────────────────────┤ │
│    (key facts, a vertical list)      │ Industry [Real estate ▾]   Call [Site visit ▾]   [अ Hindi|A English] │
│                                      └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (sections 3 to 9 in the 1280 container; industries 3 × 2; channels 3 columns; security 2 columns)   │
└ MarketingFooter: ink Baseline band, 4 columns ────────────────────────────────────────────────────┘

Laptop 1024–1279: the same arrangement at 1fr / 1fr, gap 40; H1 48/52 (still two lines in 976 px); the player
shows three turns before "Show full transcript"; key facts stay in the copy column; industries 3 × 2.

Tablet 768–1023                                      Phone 320–767 (390 shown)
┌ [V] Vaani Labs         Sign in [Get started] ≡ ┐    ┌ [V] Vaani Labs  [Get started] ≡ ┐
│ Phone agents that speak your customers'         │    │ Phone agents that speak your     │
│ language.                         (48/52)       │    │ customers' language.   (40/44)   │
│ Vaani calls leads, answers inbound calls…       │    │ Vaani calls leads, answers…      │
│ [Get started] [Try it live]                     │    │ [        Get started        ] 44 │
│ ┌ DemoPlayer, full width ────────────────────┐  │    │ [        Try it live        ] 44 │
│ │ header · controls · 3 turns · selectors    │  │    │ ┌ DemoPlayer ───────────────────┐│
│ └────────────────────────────────────────────┘  │    │ │ Real estate · Site visit      ││
│ facts 2 × 2 · industries 2 × 3 · channels 3     │    │ │ [▶ Play] 00:14 ━━○──── 01:52 ││
└─────────────────────────────────────────────────┘    │ │ 3 turns                       ││
                                                       │ │ [ Show full transcript ]      ││
                                                       │ │ Industry [▾]  Call [▾]        ││
                                                       │ └───────────────────────────────┘│
                                                       │ facts as a list; industries: 3   │
                                                       │ cards + "Show 3 more industries" │
                                                       └──────────────────────────────────┘
```

**Phone budget:** at 390 × 844 the home is at most six screens (about 5,000 px), against 9,914 px today (F-RWD-018). This is reached with a disclosure on the transcript and the industries, the flow strip turned vertical (Trigger at the top, answer rows stacked, nothing clipped at 320), and channels and security as short lists. **No nested scroll regions:** the transcript expands in the page (F-A11Y-029).

### 5.6 Components and configuration

- **Buttons:** hero CTAs are `size="lg"` (40; 44 on touch). Primary is the access CTA, secondary is **Try it live**. One filled Neel button per region (direction §3.1).
- **DemoPlayer** (new composite, §18) is built from:
  - `RecordingPlayer` (N §12.5) with `preload="none"` and no autoplay;
  - `TranscriptFeed mode="review"` with `TurnRow`s whose timecodes are seek buttons;
  - `LanguageMark` in the header;
  - `StatusTag` for the outcome;
  - `Select` for industry and scenario;
  - `SegmentedControl` for the recording's language when both exist.

  The active turn follows the audio with TurnRow's `active` treatment. The recordings are real calls recorded with a test customer and shared with permission; the header says so in `meta-12` (§19 Q7). Nothing is synthesised to look live.
- **TemplateStrip** reuses the Flow Designer template gallery's mini strip (direction §6.5). Shapes carry the phase: capsule Trigger, rectangle Logic with answer rows, rectangle Action, capsule Outcome in the soft colour of the state it writes. Text is never below 12 px.
- **Card** `plain` (N §4.3) for control, industries and channels. There is no hover lift, and cards that are not links look static.
- **RatesTable** compact (§7.5).

### 5.7 States

| State | What shows |
|---|---|
| First paint, no JS | The H1, text, CTAs and a server-rendered transcript (TurnRows) with a native `<audio controls>` fallback. Nothing is hidden waiting for script. |
| Audio loading | Play shows the Button loading state ("Loading…", Spinner after 200 ms); the transcript stays readable |
| Audio failed | InlineError inside the player: "Couldn't load the recording. The transcript is below." · Retry |
| A language not recorded for a scenario | That segment is disabled with the reason "Hindi recording not available for this call" (C §1.6) |
| Playing | Only the progress and the active turn change. When the user scrolls away, the active turn does not force-scroll the page. |
| Reduced motion | No smooth scrolling; the active-turn highlight still changes, because it is state |
| Signed in | Header and hero CTAs read **Open app** |
| `approval` mode | CTAs read **Request access**; the reassurance reads "We review requests {reviewTime}" or is omitted |
| Claims not yet confirmed | That fact or line is not rendered (P1). Nothing shows a placeholder number. |

### 5.8 Interactions and keyboard

- **Play:** Enter or Space. **Seek:** the RecordingPlayer slider (← and → move ±5 s; Home and End).
- A TurnRow's timecode is a button labelled "Play from 00:06".
- **Show full transcript** is a disclosure button with `aria-expanded`, and focus stays on it.
- Selects follow C §5.2. Changing the industry or scenario stops playback and announces "Real estate, site visit call loaded".
- There is no hover-only content.

### 5.9 Performance budget (F-QA-032)

| Metric | Budget (75th percentile, 4G, mid-range Android) | How |
|---|---|---|
| LCP | ≤ 2.5 s | The H1 is the LCP element and is visible at first paint: no entrance animation, no opacity-from-0 |
| CLS | ≤ 0.1 | The player reserves its height; fonts use the size-matched fallback; no late banners (ConsentBar overlays and does not push) |
| INP | ≤ 200 ms | The player hydrates on idle or on first interaction |
| Font files | ≤ 4 (20 today) | Hanken variable Latin (preloaded), the Vaani Rupee glyph, Noto Sans Devanagari by `unicode-range` (requested only when the Devanagari turn renders), JetBrains Mono not preloaded |
| JS on `/` | ≤ 150 KB gzip | No animation library; no carousel |

The `og:image` is a real render of the player; the canonical host is chosen once (F-QA-025 noted `www` vs apex).

### 5.10 Microcopy (home)

| Before | After |
|---|---|
| "● LIVE · AGENTS ANSWERING IN 40+ LANGUAGES" | removed (a decorative dot, tracked caps and an unverified count) |
| "Voice AI agents that / handle every call." (gradient line 2) | "Phone agents that speak your customers' language." (solid ink) |
| ~36-word sub with "40+ languages — natural, sub-second, and enterprise-grade" | "Vaani calls leads, answers inbound calls and books visits in Hindi, English, Hinglish and more. You design every step." |
| "Start free →" · "▷ Talk to the agent" | "Get started" (or "Request access") · "Try it live" |
| "Free tier · No credit card to start · Cancel anytime" | Rendered from the claims sheet, only if true |
| "Speaking Spanish Español" rotating pill | removed; the languages are in the facts row |
| "Talk to it live right here" | "Try it live" (a link to `/try`) |
| Emoji icons 🎯 🔐 🌐 | Lucide icons at 1.5 px |
| "Explore analytics →" · "Open Flow Builder →" (to `/signup`) | "See call reports in the product" is removed; "Try a flow live" goes to `/try` |
| "SOC 2 Type II readiness is in progress." | the claims phrase: "SOC 2 Type II: readiness in progress (observation window from Q4 2026)" |
| Footer "● All Systems Operational" | removed unless fed by monitoring |

### 5.11 Accessibility

- **Landmarks and headings:** header, nav, main and footer; one H1; section H2s; card H3s; no skipped levels (F-A11Y-026).
- **The player** is a `region` named "Recorded call: Real estate, site visit". The transcript is an `<ol>`, and each TurnRow sets `lang` (`hi`, `hi-Latn`, `en-IN`). The Devanagari turn uses `read-15-deva`. The recording has no autoplay, and the transcript is its text alternative.
- **Focus:** every control is reachable; no scroll region needs focus (F-A11Y-029); focus rings use `--focus` at a 2 px offset.
- **Contrast:** all token pairs pass (foundations §3.8), including the footer band.
- **Zoom:** at 320 CSS px and at 200%, nothing scrolls sideways and the header keeps the menu and the CTA.

### 5.12 Telemetry

Events are sent only after Allow; otherwise only anonymous page counts (§4.4).

| Event | Properties |
|---|---|
| `cta_click` | `cta` (get_started, request_access, try_live, talk_to_sales, see_pricing, open_app, sign_in), `location` (header, menu, hero, final, pricing_teaser), `accessMode` |
| `demo_play` | `industry`, `scenario`, `language` |
| `demo_progress` | `quartile` (25, 50, 75, 100) |
| `demo_transcript_expand` · `demo_seek` | `industry`, `scenario` |
| `web_vitals` | `lcp`, `cls`, `inp`, `route` |

### 5.13 Acceptance criteria (home)

- [ ] The H1 renders at first paint with no animation and takes at most two lines at 768, 1024, 1280 and 1440; lab LCP ≤ 2.5 s and CLS ≤ 0.1 on the mobile profile.
- [ ] At most 4 font files load on `/`; `getComputedStyle(document.body).fontFamily` starts with Hanken Grotesk.
- [ ] No gradient, glow, orb, blur, noise, emoji, eyebrow, pill tag or scroll-reveal exists on the page (visual snapshot plus CSS lint).
- [ ] The hero and the final CTA each have exactly one filled Neel button; the header has one.
- [ ] Every anchor in the nav, the footer and the legacy map resolves to an element (CI crawl).
- [ ] The demo plays only on a user action; its transcript is readable with JavaScript off.
- [ ] At 390 × 844 the page is ≤ 5,100 px tall; at 320 nothing scrolls sideways; no element has its own scroll region.
- [ ] Every number, language count, provider and compliance phrase comes from `claims.ts`; the copy lint passes.
- [ ] Playwright: no `pageerror` (including React #418) on any public route; the first ThemeMenu choice changes the theme.
- [ ] axe: zero serious or critical issues in light and dark.
