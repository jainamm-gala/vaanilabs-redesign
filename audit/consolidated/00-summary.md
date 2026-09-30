# Vaani Labs — Live Product UI/UX Audit

**Product:** https://vaanilabs.in/ (production), signed-in web app and signed-out public site
**Date:** 2026-09-26

## Scope and method

- **Who looked.** 16 specialist agents, one lens each: exploration (explore-core, -data, -settings), Flow Designer (flow-canvas, flow-config), UX (ux-audit), visual (visual-audit, design-system), responsive (responsive-a, -b), accessibility (a11y-auto with axe-core 4.10.2, a11y-manual), functional QA (qa-a, qa-b), the signed-out public site (public-site) and design research (no browser).
- **Who checked them.** 11 adversarial verifiers re-ran the high and critical claims in the live product and corrected severities and details. Every severity in this report is after those corrections.
- **Consolidation.** Raw findings (such as EXPLORE-CORE-06) were merged into F-UX, F-VIS, F-FLOW, F-RWD, F-A11Y and F-QA findings. Each lists its source IDs, a confidence level (verified, partially-verified, multi-agent, single-agent), screenshots under `audit/screenshots/` (1,093 files) and a recommendation. Raw reports are in `audit/raw/`.
- **Read-only network guard.** Every browser aborted all POST, PUT, PATCH and DELETE requests, WebSockets, analytics, OAuth, presence and payment calls, popups and downloads. When the app tried to write (such as the Flow Builder autosave PUT), the finding says "observed under simulated network failure".
- **Touched:** navigation of every reachable route; opening dialogs, drawers and menus; typing without submitting; keyboard, axe and contrast passes; viewports from 320 to 1920 px, both themes, reduced motion, and throttled and offline network.
- **Not touched:** Save, ACTIVATE, Private, Delete and Import on flows; every call control (CONNECT, Test Call, Call Now, bulk CALL, the Leads `c` key); top-up, Pay and autopay; sign-up, OTP, OAuth and sign-out; account deletion, invites and AI-draft Generate; the Rep Console softphone.
- **Data handling.** No customer or lead names, phone numbers or emails appear; customer flows get generic labels.

## Executive summary

Vaani Labs has a capable core (a React Flow call-flow builder, a leads CRM with calling, call reports with AI summaries, analytics and a prepaid INR wallet), but the live product does not yet behave like a tool you can trust to place real, billable calls to customers. The largest risk is Flow Builder data integrity: edits autosave straight into the flow used for live calls with no draft or publish step, opening a flow writes to it, the save chip says "Up to date" when saves fail, Undo does not reverse added nodes, and a green "FLOW VALIDATED" pill shows on invalid flows while ACTIVATE stays enabled. Status surfaces claim things that are not true: onboarding says "You're live" on an account with an empty wallet and no calling number, the rail's "SYS: ONLINE" is hard-coded, and Cockpit Customer Intel pairs a real lead with demo data. Setup dead-ends in several places: org creation loops back on itself so all five integrations stay disabled, the wallet banner's Top up opens Profile, and /signup lands new users on sign-in. Reporting is unreliable in both directions, because Call Reports shows only 50 of 121 calls and each browser test call is stored as two legs, which inflates every metric. Paid actions lack guardrails: a single `c` keypress on Leads places a billable call, and bulk calling shows no pre-flight check or cost preview before the click. For accessibility, the two core jobs (editing a flow and opening a call) are mouse-only, many fields are unlabelled, and low-contrast tokens leave 50–77% of text on data pages below AA. Visually there are five competing dialects, 16 font sizes, 80 button styles and a brand hue that changes with theme and feature, and on phones or at 200% zoom the navigation reaches only half the app. On the public site, /about claims a named bank pilot, a $12M Series A and SOC 2 Type II certification, all of which /security contradicts. The foundations are sound (a semantic token layer with complete light/dark pairs, a well-labelled flow toolbar, consistent phone masking and strong Settings safety patterns), so the work is consolidation and truthful state, not a rebuild.

## Severity counts

| Section | Critical | High | Medium | Low | Findings | Refuted |
|---|---:|---:|---:|---:|---:|---:|
| 1. Product understanding | – | – | – | – | descriptive | – |
| 2. Current design language | – | – | – | – | descriptive | – |
| 3A. Global, IA & navigation, UX & journeys, copy, trust | 1 | 11 | 33 | 3 | 48 | 0 |
| 3B. Visual design, consistency & design system | 0 | 3 | 23 | 11 | 37 | 0 |
| 3C. Flow Designer | 1 | 12 | 20 | 4 | 37 | 0 |
| 3D. Responsive behaviour | 0 | 5 | 12 | 2 | 19 | 0 |
| 3E. Accessibility (WCAG 2.2) | 2 | 7 | 20 | 1 | 30 | 10* |
| 3F. Functional bugs, performance, public site & auth | 1 | 12 | 22 | 5 | 40 | 0 |
| 5. Design-resource guidance digest | – | – | – | – | guidance | – |
| **Total** | **5** | **50** | **130** | **26** | **211** | **10*** |

\* No consolidated finding was refuted in any section. 3E's 10 are sub-claims the verifier refuted, could not reproduce or corrected; the other sections list such sub-claims in their appendices without counting them.

Totals count findings per section, not unique defects: some defects are reported under more than one lens and cross-referenced (for example F-FLOW-002 / F-UX-024 / F-QA-002, F-UX-002 / F-QA-004, F-UX-008 / F-RWD-001).

## Top 15 issues

| # | ID (related) | Severity | Issue |
|---|---|---|---|
| 1 | F-FLOW-001 | critical | Edits autosave straight into the live flow with no draft or publish step, and Backspace deletes connected nodes with no confirmation or undo toast. |
| 2 | F-UX-001 | critical | Org and team setup is a circular dead end, so all 5 integrations stay disabled and teammates cannot be invited. |
| 3 | F-QA-001 | critical | /about claims a named bank pilot, a $12M Series A and "SOC 2 Type II Certified", with a team that doesn't match the founders; /security contradicts these claims. |
| 4 | F-A11Y-001 (F-FLOW-006) | critical | Flow Builder nodes cannot be opened or connected by keyboard; the 54 handles are 9x9px and can't take focus (2.1.1 A). |
| 5 | F-A11Y-002 (F-UX-009) | critical | Call Reports details and transcript open only on a mouse click; rows have no tabindex, and the panel never gets focus. |
| 6 | F-QA-002 (F-FLOW-002, F-FLOW-003, F-UX-024) | high | Flow Builder writes to a flow that was only opened, and still shows "Up to date" when a save fails. |
| 7 | F-FLOW-004 (F-UX-004) | high | "FLOW VALIDATED" shows on invalid flows, the validator checks wiring only, and ACTIVATE works with errors present. |
| 8 | F-A11Y-004 (F-UX-013) | high | Single-letter shortcuts can't be turned off; `c` on Leads places a real, billable call with no confirmation. |
| 9 | F-QA-005 (F-UX-009) | high | Call Reports shows only the latest 50 of 121 calls, with no pagination; search, sort and filter cover only those 50. |
| 10 | F-QA-006 | high | Each browser test call is stored as two records (about 41 of 121), inflating call counts, minutes and sentiment. |
| 11 | F-UX-002 (F-QA-004) | high | The wallet banner's Top up and Enable autopay open Settings › Profile, which has no wallet. |
| 12 | F-UX-006 | high | Onboarding says "You're live" on an account that can't place calls, and nothing tracks setup afterwards. |
| 13 | F-QA-010 | high | /signup redirects to sign-in, so every "Get started" / "Start free" CTA lands new users on "Welcome Back". |
| 14 | F-RWD-001 (F-UX-008) | high | Phone and 200%-zoom navigation reaches only 6 of 12 sections, and sign-out ("Exit") takes a primary tab. |
| 15 | F-A11Y-008, F-A11Y-009 (F-VIS-003) | high | Muted token #7A8397 and black text on primary blue (3.27–3.83:1) fail AA; 50–77% of text on data pages fails. |

## Contents

1. **Summary** (this part), including sections 4 and 6 so they sit next to the totals
2. **1. Product understanding**: positioning, users, product map, connections, 13 journeys, IA, funnel (1.1–1.7)
3. **2. Current design language (as-is)**: tokens, components, competing styles, dark mode (2.1–2.8)
4. **3A. Findings — Global, IA & navigation, UX & journeys, content/copy, trust**: F-UX-001 to 048
5. **3B. Findings — Visual design, consistency & design system**: F-VIS-001 to 037
6. **3C. Findings — Flow Designer**: how the builder works today, F-FLOW-001 to 037
7. **3D. Findings — Responsive behaviour**: page x breakpoint matrix, F-RWD-001 to 019
8. **3E. Findings — Accessibility (WCAG 2.2)**: axe results per page, F-A11Y-001 to 030
9. **3F. Findings — Functional bugs, performance, public site & auth**: F-QA-001 to 040
10. **4. Strengths worth preserving** (below)
11. **5. Design-resource guidance digest**: rules checklist, starter tokens, anti-patterns, open decisions (5.1–5.11)
12. **6. Coverage & limitations** (below)

Each findings section ends with its own "Refuted / not reproduced" appendix.

## 4. Strengths worth preserving

Deduplicated from all 16 auditors; claims the verifier contradicted (descriptive node aria-labels, the "Autosave failed" chip) are left out.

**Design-system foundations**
- A real semantic token layer (32 CSS variables, complete light/dark pairs) on Next.js and Tailwind v4 `@theme`, so tokens can be formalised without a rewrite.
- A consistent neutral ramp (#111725 / #3E475A on #F4F6FA / #EEF1F7 / white, #E1E6EF hairlines); common values already converge (8px radius, 4/8/12/16 padding). One icon library (Lucide).
- A React Button with variants and a focus-visible ring that can become the only button; `.input-vani` has focus and error states.
- Call Reports and Assistant (calm sans, sentence case, title + description + right-aligned actions) are the page template to copy. The marketing site's Hanken Grotesk type system is the one to adopt.
- Dark mode is the more coherent theme: 7–19% of text fails contrast in dark versus 31–78% in light.

**Flow Builder**
- React Flow base with minimap, zoom/fit/lock, box select, arrow-key nudge and protected Start/End nodes; deleting a node can be undone.
- A fully labelled toolbar (shortcut in every aria-label), palette buttons that add nodes without dragging, synonym-aware palette search and a polite live region.
- The validator's per-error Jump button, which should become the source of truth for the status pill; "Preview AI script" and helpful inspector hints.
- Flow Settings, AI draft and Preview dialogs are built correctly (dialog role, focus trap, Esc, focus return): the template for every other modal.

**Daily work and data**
- Phone numbers are masked the same way (+91••••••NNNN) across Leads, Cockpit, Call Reports and Analytics.
- The Leads keyboard model (/, J/K, X, A, Esc) has an on-screen legend. The bulk-selection bar is the right base for campaigns.
- Call Reports search covers transcripts; the detail panel has an AI summary, satisfaction, topics and a timestamped transcript; badges pair icon and text.
- Analytics explains itself (metric tooltips, computed times, expandable rows). The New lead and Import dialogs state limits, autofocus and close on Esc; empty states give a next step.
- UPI-native top-up with ₹100/500/1000 presets. The Cockpit's context | stage | transcript layout needs hierarchy work, not a rethink.

**Guardrails and trust patterns**
- Delete Account (lists what is deleted and kept, typed-email confirmation, 7-day grace), dual-confirm Change Email, and a transparent Data Export.
- API Keys scope cards with a shown-once/hash-only warning; Webhooks documents HMAC-SHA256.
- The 3-step Calling number stepper (Owned → Compliance → Authorized): the model for every setup page.
- Personal Agent autonomy levels (Auto / Confirm / Confirm + 2FA): reuse them for the Assistant and the Cockpit.
- The Assistant's empty state and the Personal Agents explainer are the most approachable pages. 14 of 17 Settings items already have URLs, so a restructure is mostly layout and redirects.

**Accessibility, engineering and responsive**
- Basics: `lang`, zoom allowed, alt on every image, one h1 and one `main` per app page; toggles expose `aria-pressed`; shortcuts are ignored while typing.
- No uncaught JS errors or 4xx/5xx on app pages in normal use; unknown routes return a real 404.
- No page scrolls sideways at document level at any tested width; a labelled mobile bottom bar; Flow Builder has a real phone mode; Billing and /login reflow cleanly from 1920 to 360.

**Public site**
- The "Hear it work" industry × scenario × English/Hindi demo and the India-specific use-case cards (EMI, DPD, COD, RBI data residency).
- A candid /security page ("no external audit yet"), the /build.html personal demo-agent concept, and well-structured /docs/api.

## 6. Coverage & limitations

- **Read-only by design.** Saves, submits, calls, payments, sign-up and sign-out were never exercised, so server-side outcomes are marked inferred: whether autosaved edits reach live calls, whether ACTIVATE validates on the server, whether two-leg calls are billed twice, whether Pay validates amounts, whether Exit confirms.
- **WebSockets blocked.** Live call audio, LiveKit meeting rooms, the Rep Console softphone and the real-time transcript were not observed working. /rep-console was left out of the accessibility pass because it registers a live softphone.
- **Browser reset.** One browser reset after a hung tool call interrupted an earlier run; its signed-out events came from the reset, not token expiry, and the work was re-run. EXPLORE-CORE-18 (slow auth dropping to a bare /login) was seen only in that run. Sections 3A–3C were resumed after a stalled writing pass and re-checked against the raw reports.
- **Failed sections: none.** All 16 auditors reported and all 9 sections were written.
- **Mobile.** Phones and tablets were tested with viewport resizing and CDP touch emulation, not real devices. iOS zoom-on-focus, safe-area overlap, the on-screen keyboard and touch pan/pinch on the canvas still need a real-device check.
- **Assistive technology.** No screen reader was run. Statements about what is announced come from the accessibility tree.
- **Account state.** One member-role account (16 flows, 24 leads, 121 calls, ₹0 wallet); admin views were not seen as an admin, and some findings depend on this state (the wallet banner shows only while the wallet is empty).
- **Not tested:** file downloads (CSV/PDF export), OAuth and OTP flows, and the /build.html live demo.
- **Open discrepancies:** 3A records the verifier confirming Embed Copy writes a clean snippet, while 3F calls it unresolved; 3D says Settings is reachable on phones only by URL, while 3A notes the wallet banner links also open it while the wallet is empty.
- **Point in time.** This is a snapshot of production on 2026-09-26.
