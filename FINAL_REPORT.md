# Vaani Labs UI/UX redesign: final report

**Date:** 27 Sep 2026 · **Product:** Vaani Labs (https://vaanilabs.in), voice agents that place and answer phone calls for Indian businesses · **Engagement:** audit of the live product, redesign specification, design tokens and a static reference prototype

**How to read the labels.** Every section says which kind of statement it makes:

| Label | Meaning |
|---|---|
| **[Analysis]** | What was observed on the live product on 26 Sep 2026 (read-only), or measured on the prototype. |
| **[Recommendation]** | What the specification proposes. Not built in the live product. |
| **[Implemented]** | Files that exist in this folder: audit documents, the spec, the tokens and the static prototype. **Nothing was implemented in the live vaanilabs.in product.** |

No customer names, phone numbers or emails appear in this report. The prototype uses a fictional workspace.

---

## Executive summary

**[Analysis]** Vaani Labs has a capable core: a React Flow call-flow builder, a leads CRM with calling, call reports with AI summaries, analytics and a prepaid INR wallet with UPI. But the live product does not yet behave like a tool you can trust to place real, billable calls. Sixteen specialist agents audited it read-only and eleven verifiers re-checked every high and critical claim. They recorded **211 findings: 5 critical, 50 high, 130 medium and 26 low.** The pattern is consistent: the product is often **wrong about what is live, what a call costs, or what happened**.
- **Flow edits autosave straight into the live flow.** There is no draft or publish step, and opening a flow writes to it (F-FLOW-001, F-QA-002).
- **Status surfaces say untrue things.** "Up to date" shows while saves fail, "FLOW VALIDATED" shows on invalid flows, and "You're live" shows on an account with ₹0 and no number (F-FLOW-003, F-FLOW-004, F-UX-006).
- **Paid actions lack guardrails.** A single `c` key on Leads places a billable call, and bulk calling shows no pre-flight check or cost (F-A11Y-004, F-UX-013).
- **Counts are unreliable.** Call reports reach only 50 of 121 calls, and each browser test call is stored twice (F-QA-005, F-QA-006).
- **Setup dead-ends.** Organization creation loops, `/signup` lands on sign-in, and the wallet banner's Top up opens Profile (F-UX-001, F-QA-010, F-UX-002).
- **The two core jobs are mouse-only.** Nobody can edit a flow or open a call by keyboard (F-A11Y-001, F-A11Y-002). 50–77 % of text on data pages fails contrast.
- **The visual language is split.** There are five competing dialects, and phones reach only 6 of 12 sections.
- **Public claims don't hold.** `/about` makes claims that `/security` contradicts (F-QA-001).

**[Recommendation]** One design direction, **Sutradhar** ("the one who holds the threads"): a calm, exact console for running voice agents.
- Graphite chrome, with one indigo-dye accent (Neel `#1F4A94`) that means operator intent.
- Hanken Grotesk for all text, with nothing below 12 px.
- A Neel-ink **Baseline** that states only computed facts.
- **Gates** for everything that dials, bills or goes live: the Call gate, the Publish gate and the setup track.
- A **Flow Designer** with Draft and Live revisions, computed validation, a full keyboard path (Outline, Go to, Connect to…), a Trigger → Logic → Action → Outcome shape grammar, large-flow tools and a test panel.
- One shell that reaches 12 of 12 destinations at every size.
- A WCAG 2.2 AA target.

The work is phased P0 (safety and critical, about 6–8 weeks) to P3 (polish), in [`spec/08-implementation-plan.md`](spec/08-implementation-plan.md).

**[Implemented]** In this folder only:
- The audit: 16 raw reports, 9 consolidated sections and 1,093 screenshots.
- The complete specification: direction, foundations, components, 9 page specs, 2 Flow Designer specs, responsive, accessibility, motion, the plan and a critique log, plus 23 reference mocks.
- Generated design tokens: 460 contrast pairs checked, 0 failures.
- A static, clickable **reference prototype** of 17 pages. After three QA rounds, a polish pass and a final smoke test it shows **0 console errors, 0 axe violations, 0 px overflow at 1440 and 390, and 12 of 12 destinations reachable.**

**Nothing was changed in the live vaanilabs.in product.** There was no access to its source code or deployment pipeline, and every audit browser blocked all writes.

**Next steps for the Vaani team:**
1. Start P0: no write on open, the Call gate, draft and publish, true status, keyboard paths, Call reports counts, sign-up, and honest `/about`.
2. Answer the headline open questions (§10).
3. Run real-device and screen-reader tests.
4. Rotate the audited account's password as a precaution (see §10.3 item 8). The audit browser no longer holds a session.

---

## Where to find everything

| What | Path |
|---|---|
| This report | [`FINAL_REPORT.md`](FINAL_REPORT.md) |
| Audit summary (counts, top 15, strengths, coverage) | [`audit/consolidated/00-summary.md`](audit/consolidated/00-summary.md) |
| Audit, full consolidated report (one file) | [`audit/AUDIT_FINDINGS.md`](audit/AUDIT_FINDINGS.md) |
| Audit sections: product, design language, findings 3A–3F, guidance digest | [`audit/consolidated/`](audit/consolidated/) (`01-…` to `05-…`, in numbered parts) |
| Raw agent reports (16) | [`audit/raw/`](audit/raw/) |
| Audit screenshots (1,093, one folder per agent and verifier) | [`audit/screenshots/`](audit/screenshots/) |
| Specification index (start here) | [`spec/README.md`](spec/README.md) |
| Design direction (Sutradhar) | [`spec/00-design-direction.md`](spec/00-design-direction.md) and [`spec/00-direction-specimen.html`](spec/00-direction-specimen.html) |
| Foundations and token register | [`spec/01-foundations.md`](spec/01-foundations.md) |
| Tokens (source, generated CSS, Tailwind theme and preset, contrast check) | [`spec/tokens/`](spec/tokens/) |
| Components (core, data and navigation, gate, overlay and feedback) | [`spec/02-components-*.md`](spec/), [`spec/components/components.css`](spec/components/components.css), [`spec/components/canonical.html`](spec/components/canonical.html) |
| Page specs (shell and IA, Cockpit, Assistant, Leads, Call reports and Analytics, Knowledge and Billing, Settings, Meetings and Personal agents, public and auth) | [`spec/03-pages/`](spec/03-pages/) |
| Flow Designer specs | [`spec/04-flow-designer/`](spec/04-flow-designer/) |
| Responsive, accessibility, motion | [`spec/05-responsive.md`](spec/05-responsive.md), [`spec/06-accessibility.md`](spec/06-accessibility.md), [`spec/07-motion-microinteractions.md`](spec/07-motion-microinteractions.md) |
| Implementation plan (P0–P3, QA plan, risks, open questions) | [`spec/08-implementation-plan.md`](spec/08-implementation-plan.md) |
| Critique record (3 directions, 3 judges, 3 critics, 68 issues) | [`spec/critique-log.md`](spec/critique-log.md) |
| Static reference prototype (open `index.html`) | [`prototype/`](prototype/), guide in [`prototype/README.md`](prototype/README.md) |
| Prototype QA reports (3 rounds), polish notes, final smoke | [`prototype/_qa/`](prototype/_qa/) |
| Prototype showcase screenshots (every page, 1440 light and dark, 390) | [`prototype/_shots/final/`](prototype/_shots/final/) |

---

## 1. Product Understanding

**[Analysis]** Sources: [`audit/consolidated/01-product-understanding.part1–7.md`](audit/consolidated/). The audit account was one member-role account with 16 flows, 24 leads, 121 calls, 5 knowledge files, a ₹0 wallet and 29 of 30 free meeting minutes.

### 1.1 What Vaani Labs does

Vaani Labs is a SaaS for Indian businesses that runs **AI voice agents on phone calls**. Each call follows a node-based **call flow** that the customer builds visually. Around that core sit a meeting agent, autonomous personal agents, an in-app Assistant, a light leads CRM, call reporting, analytics, a knowledge base (RAG), a browser softphone for hand-off to a human (the Rep console), and a developer platform: API keys, an embeddable widget and webhooks. Usage is paid from a **prepaid INR wallet** with UPI autopay.

| Layer | Job | Surfaces today |
|---|---|---|
| Build | Define what the agent says and knows | Flow Builder, Knowledge, the Assistant (which can build and activate flows) |
| Run / engage | Hold conversations | Agent Cockpit (`/dashboard`), Leads (per-row and bulk calling), Meeting Agent, Personal Agents, Rep Console, the embed widget and API |
| Review | Understand outcomes | Call Reports, Analytics |
| Configure / account | Telephony, integrations, developer access, money | Settings (17 items), Billing, API keys, Embed, Webhooks |

Five different AI actors are all called "agent" or carry a persona name: the phone voice agent ("Vaani" or "Vikash"), the meeting agent, personal agents, the Assistant and the Assistant's voice mode. "Vaani" is also the brand.

**Positioning.** The intended position is India-first B2B voice automation for small and mid-market teams, with an enterprise-pilot path on top. The product describes itself inconsistently:
- **Languages:** "40+" versus "12+ Indian" versus "all 22 scheduled".
- **Latency:** "sub-second" versus "sub-200 ms".
- **Commercial model**, told four ways: a free tier, approval-gated early access, a sales-led pilot and prepaid pay-as-you-go.
- **Compliance:** SOC 2 "in progress" on `/security`, "Certified" on `/about`.
- **Name:** five spellings of the brand.

### 1.2 Users and jobs

| Persona | Job to be done | How well it is served today |
|---|---|---|
| Buyer (founder or ops lead, Indian SMB or mid-market) | Get an agent calling this week, know the cost, see ROI | No price or usage anywhere in the app; onboarding says "You're live" on an account that cannot call |
| Enterprise evaluator | Scope a pilot, pass a security review | `/security` is candid and strong; other pages contradict it |
| Flow builder / operator | Script, teach, validate and put a flow live safely | Edits autosave into the live flow; no in-builder test; no visible live state |
| Sales, tele-calling or support operator | Load a list and call it in the right language with the right flow | A bulk bar exists, but no pre-flight check or cost; no campaign object |
| QA analyst or manager | Find a call, read the transcript, understand drop-off | Search works, but metrics disagree between pages and the transcript is buried |
| Human rep (hand-off target) | Take transferred calls in the browser | Goes "online" just by opening the page; not reachable on phones |
| Meeting host, individual delegator, developer, org admin | Meetings, delegated tasks, API and embed, team setup | Rooms never close; a hidden number prerequisite; corrupted snippets and 404 docs; org creation is a circular dead end |

The role model is invisible: the chrome shows no name, organization or role, and role-gated pages redirect without saying why.

### 1.3 Primary journeys discovered

Ratings (1–5) are from the UX audit. The prerequisites for going live (wallet, calling number, call channel, transfer phone) are spread across four or more unlinked pages.

| Journey | Rating | Dominant break |
|---|---|---|
| J1 First run and orientation | 2 | `/signup` lands on "Welcome Back"; "You're live" with ₹0 and no number; no setup checklist; Top up opens Profile |
| J2 Build or edit a flow and put it live | 2 | Opening writes; every edit autosaves into the live record; false "FLOW VALIDATED"; ACTIVATE works with errors; no test |
| J3 Teach the agent (Knowledge) | n/r | No indexing status; "Review proposals" silently redirects |
| J4 Test call from the Cockpit | 2 | Picking a flow silently rewrites the profile default; demo data next to a real lead; "abc" enables Test Call |
| J5 Load leads and call them | 3 | No pre-flight, cost, calling hours or DND step; one key can dial |
| J6 Find a past call, understand performance | 3 | Only 50 of 121 calls reachable; metrics disagree; rows mouse-only |
| J7 Understand spend and top up | 2 | Top up dead-ends; no rates, usage or invoices; amounts not validated |
| J8 Deploy the meeting agent | 3 | Rooms never end (one live for 82 h); no meeting outputs |
| J9 Delegate to a personal agent | 3 | A number prerequisite mentioned only in a settings sub-page |
| J10 Telephony and human hand-off | 2 | Three unlinked number concepts; channel copy contradicts the Rep console |
| J11 "Just ask" the Assistant | n/r | Acts on the account with no visible approval step |
| J12 Developer integration | n/r | Orphan pages; snippets display corrupted; 3 of 5 doc links 404 |
| J13 Organization, team, integrations | n/r | Org creation dead end; all 5 integrations disabled; no invites |

---

## 2. Current UI/UX Audit

**[Analysis]** Sources: [`audit/consolidated/00-summary.md`](audit/consolidated/00-summary.md) and sections 3A–3F. Every severity is after the verifiers' corrections. How the testing was done is in §9(a).

### 2.1 Counts

| Section | Critical | High | Medium | Low | Findings |
|---|---:|---:|---:|---:|---:|
| 3A Global, IA and navigation, journeys, copy, trust (F-UX) | 1 | 11 | 33 | 3 | 48 |
| 3B Visual design and design system (F-VIS) | 0 | 3 | 23 | 11 | 37 |
| 3C Flow Designer (F-FLOW) | 1 | 12 | 20 | 4 | 37 |
| 3D Responsive (F-RWD) | 0 | 5 | 12 | 2 | 19 |
| 3E Accessibility, WCAG 2.2 (F-A11Y) | 2 | 7 | 20 | 1 | 30 |
| 3F Functional, performance, public site and auth (F-QA) | 1 | 12 | 22 | 5 | 40 |
| **Total** | **5** | **50** | **130** | **26** | **211** |

No consolidated finding was refuted. In 3E, 10 sub-claims were refuted, not reproduced or corrected by the verifier. Totals count findings per lens: some defects appear under more than one lens and are cross-referenced (for example F-FLOW-002 / F-UX-024 / F-QA-002).

### 2.2 Top 15 issues

| # | ID (related) | Severity | Issue |
|---|---|---|---|
| 1 | F-FLOW-001 | critical | Edits autosave straight into the live flow with no draft or publish step; Backspace deletes connected nodes with no confirmation or undo toast |
| 2 | F-UX-001 | critical | Org and team setup is a circular dead end, so all 5 integrations stay disabled and teammates cannot be invited |
| 3 | F-QA-001 | critical | `/about` claims a named bank pilot, a $12M Series A and "SOC 2 Type II Certified"; `/security` contradicts them |
| 4 | F-A11Y-001 (F-FLOW-006) | critical | Flow nodes cannot be opened or connected by keyboard; the 54 handles are 9×9 px and cannot take focus (2.1.1 A) |
| 5 | F-A11Y-002 (F-UX-009) | critical | Call Reports details and transcript open only on a mouse click; rows have no tabindex, and the panel never gets focus |
| 6 | F-QA-002 (F-FLOW-002, F-FLOW-003, F-UX-024) | high | The builder writes to a flow that was only opened, and still shows "Up to date" when a save fails |
| 7 | F-FLOW-004 (F-UX-004) | high | "FLOW VALIDATED" shows on invalid flows, the validator checks wiring only, and ACTIVATE works with errors |
| 8 | F-A11Y-004 (F-UX-013) | high | Single-letter shortcuts can't be turned off; `c` on Leads places a real, billable call with no confirmation |
| 9 | F-QA-005 (F-UX-009) | high | Call Reports shows only the latest 50 of 121 calls; search, sort and filter cover only those 50 |
| 10 | F-QA-006 | high | Each browser test call is stored as two records (about 41 of 121), inflating counts, minutes and sentiment |
| 11 | F-UX-002 (F-QA-004) | high | The wallet banner's Top up and Enable autopay open Settings › Profile, which has no wallet |
| 12 | F-UX-006 | high | Onboarding says "You're live" on an account that can't place calls, and nothing tracks setup afterwards |
| 13 | F-QA-010 | high | `/signup` redirects to sign-in, so every "Get started" and "Start free" lands on "Welcome Back" |
| 14 | F-RWD-001 (F-UX-008) | high | Phone and 200 %-zoom navigation reaches only 6 of 12 sections, and sign-out ("Exit") takes a primary tab |
| 15 | F-A11Y-008, F-A11Y-009 (F-VIS-003) | high | Muted token `#7A8397` and black text on primary blue (3.27–3.83:1) fail AA; 50–77 % of text on data pages fails |

### 2.3 Major problems by theme

- **Truth and safety.** Draft and live are not separated (F-FLOW-001). Opening a flow writes to it (F-FLOW-002). The save chip is never truthful (F-FLOW-003), and validation is false (F-FLOW-004). Undo does not reverse added nodes (F-FLOW-005). "SYS: ONLINE" is hard-coded and random (F-UX-018). Cockpit Customer Intel pairs a real lead with demo data (F-UX-003). The Assistant can act with no approval step (F-UX-022).
- **Dead ends and wrong destinations:** org setup (F-UX-001), `/signup` (F-QA-010), Top up (F-UX-002), "Review proposals", doc links that 404, and a bare `/login` after slow auth (F-QA-007).
- **Unreliable data:** 50 of 121 calls (F-QA-005), two-leg test calls (F-QA-006), KPIs aggregated over 50 rows (F-QA-014) and metrics that disagree across pages (F-UX-011).
- **Missing guardrails on paid actions.** One key or one click dials (F-UX-013). Invalid phone numbers ("abc") enable Test Call (F-QA-020). Top-up amounts are not validated.
- **Accessibility.** The canvas and call rows are mouse-only. Fields are unlabelled, modals have no dialog semantics, and focus is invisible (F-A11Y-003, -005, -006). The app ignores reduced motion (F-A11Y-022).
- **Visual.** Five dialects: Terminal/HUD, Editorial, Violet, Plain SaaS and the dark marketing site (F-VIS-001). 16 rendered text sizes, with 36 % of text under 12 px (F-VIS-002). Dark styling leaks into the light theme (F-VIS-003). There are 80 button styles.
- **Responsive.** Phone navigation reaches 6 of 12 sections (F-RWD-001). ACTIVATE is clipped at 768–877 px (F-RWD-003). The Call Reports table is 2,617 px wide on phones (F-RWD-010). The Cockpit loses context below 1024 px (F-RWD-002).
- **Public site.** Claims contradict each other (F-QA-001, F-QA-009, F-QA-011). `/pricing` has no prices (F-QA-012). The brand is fragmented, with five names (F-QA-013).
- **Privacy.** Session replay loads on pages that show lead personal data (F-UX-045), and a 365-day analytics cookie is set before consent (F-QA-033).

### 2.4 Strengths worth keeping

- **Design-system foundations.** A semantic token layer of 32 variables with complete light and dark pairs on Next.js and Tailwind v4, a consistent graphite neutral ramp and one icon library (Lucide). Call Reports and the Assistant are the page template to copy, and the marketing site's Hanken Grotesk is the face to adopt.
- **Flow Builder.** React Flow with minimap, zoom, box select and protected Start and End nodes; a fully labelled toolbar; synonym-aware palette search; the validator's per-error Jump button. The Flow settings, AI draft and Preview dialogs are built correctly.
- **Daily work.** Phone numbers are masked the same way everywhere. Leads has a keyboard model with a legend, transcript-wide search, an AI summary with a timestamped transcript, and UPI-native top-up with presets.
- **Guardrails.** Delete Account (typed confirmation, 7-day grace), dual-confirm Change Email, API keys shown once, HMAC-signed webhooks, the 3-step calling-number stepper, and the Personal Agent autonomy levels (Auto / Confirm / Confirm + 2FA).
- **Engineering.** `lang` is set and zoom allowed. No uncaught JavaScript errors on app pages. Unknown routes return a real 404. No page scrolls sideways at document level.
- **Public site.** The "Hear it work" industry × scenario × English/Hindi demo, India-specific use cases, and a candid `/security` page.

---

## 3. Recommended Design Direction

**[Recommendation]** Source: [`spec/00-design-direction.md`](spec/00-design-direction.md). The name is internal vocabulary; users never see "Sutradhar".

### 3.1 Sutradhar

In Indian theatre the **sutradhar** is "the one who holds the threads". The sutradhar sets the scene, directs the players and tells the audience what is happening. In Vaani Labs the operator holds the threads (the flow, the call, the transcript, the wallet) while the agent speaks on stage. So the interface has two jobs:
- keep every thread visible and traceable to its source;
- keep the conversation in front of everything else.

**Essence:** a calm, exact console for running voice agents. It is never wrong about what is live, what a call will cost, or what was said and in which language.

### 3.2 Why this direction

- **The core problem is truth, not looks.** Five of the audit's top eight issues are truth or safety failures:
  - autosave into live (F-FLOW-001);
  - "Up to date" while saves fail (F-QA-002);
  - "FLOW VALIDATED" on invalid flows (F-FLOW-004);
  - the `c` key dialling (F-A11Y-004);
  - "You're live" at ₹0 (F-UX-006).

  Two of the five criticals are keyboard lockouts. The direction therefore puts computed status, gates and keyboard paths first.
- **It won a structured contest.** Three directions were designed and scored by three judges ([`spec/critique-log.md`](spec/critique-log.md)):

  | Direction | Taste | Product | Build | Mean |
  |---|---:|---:|---:|---:|
  | Switchboard (precision operator console) | 7.5 | **8.5** | **8.5** | **8.17** |
  | Bolchaal (voice-native identity) | **8.5** | 7.0 | 6.5 | 7.33 |
  | Clear Path (guided clarity) | 6.0 | 8.0 | 7.5 | 7.17 |

  Sutradhar keeps Switchboard's system: its tokens and contrast, density model, Flow Designer lifecycle and keyboard model. It grafts on:
  - **Bolchaal's identity:** language marks in native script, the talk strip, wallet runway and the branch-nested phone Outline.
  - **Clear Path's guidance:** the setup track, blocking versus advisory gate checks, cost as a range, the live note and "Go to [step]".

  It resolved all 36 must-fix items raised by the judges.
- **It survived critique.** Three critics (usability, system, taste) raised 68 issues. 41 are resolved (6 of them with a deviation), 13 are partly resolved and 14 remain open. Every blocker is resolved, and 28 of 29 majors are. The taste critique ("reads as Linear") led to:
  - an indigo-dye Neel re-keyed away from SaaS blue;
  - the Neel-ink Baseline;
  - a sidebar that marks the current page "on the thread";
  - a real mark (the cord) instead of a letter tile.
- **It builds on what exists.** Today's 32 variables map one-to-one onto the new tokens, and Hanken Grotesk is already the marketing face. React Flow stays. The work is consolidation and truthful state, not a rebuild.

### 3.3 Principles (ranked; the higher one wins a conflict)

| # | Principle | In practice |
|---|---|---|
| P1 | **Say only what is proven** | Every status comes from a state machine or a computation, in words. Data that doesn't exist is hidden, never simulated. One fact, one place per viewport. |
| P2 | **Colour is state; shape is type** | Graphite chrome. Neel means operator intent (one primary per region, focus, selection, links). Green, amber and red only for real state, always with a word and an icon. Flow steps are told apart by silhouette and glyph, never hue. |
| P3 | **Nothing dials, bills or goes live without a gate** | One gate component: blocking and advisory checks, a cost range, one confirming action. `C` opens the Call gate, `⌘/Ctrl+Enter` confirms. There is no skip, even for admins. |
| P4 | **Dense where you scan, calm where you decide** | Standard 40 px rows and 32 px controls; Compact 32/28; Touch 48/44 automatically. Forms sit in a 720 px column. |
| P5 | **Every action has an address** | Keyboard, pointer, touch and screen reader alike. Every drag has a list or select alternative. Focus is never drawn like selection. State lives in the URL. |
| P6 | **One frame, every breakpoint designed** | Grouped sidebar, rail, tablet top bar, phone bottom bar with More; 12 of 12 destinations everywhere. |
| P7 | **Quiet chrome; the work and the voice are loudest** | No gradients, glass or glows. Motion only for real live state and audio, bounded and off under reduced motion. |

### 3.4 The ten biggest changes

| # | Change | Fixes |
|---|---|---|
| 1 | Edits go to a Draft; callers hear only what passed the **Publish gate**; opening a flow writes nothing | F-FLOW-001, F-FLOW-002, F-QA-002 |
| 2 | Every billable call goes through the **Call gate**; `c` opens it and never dials; single-key shortcuts can be turned off | F-A11Y-004, F-UX-013 |
| 3 | **Truthful status:** computed validation, a save chip that can fail, no "SYS: ONLINE", no "You're live" before setup passes | F-FLOW-004, F-FLOW-003, F-UX-018, F-UX-006 |
| 4 | **Sign-up and setup work:** a real `/signup`, the organization created with the workspace, a "Get your first call live" track | F-QA-010, F-UX-001 |
| 5 | **Call reports count calls, not legs**, paginate on the server and open by keyboard | F-QA-005, F-QA-006, F-A11Y-002 |
| 6 | **The Flow Designer works by keyboard and screen reader:** the Outline editor, Go to [step], Connect to…, one key map | F-A11Y-001, F-FLOW-006 |
| 7 | **One visual language:** every text pair at AA in both themes, one type system, one Button | F-VIS-001, F-A11Y-008, F-A11Y-009 |
| 8 | **One shell and IA**, with one nav config and redirects | F-RWD-001, F-UX-017, F-UX-008 |
| 9 | **Large flows are first-class:** shape grammar, level of detail never below 12 px, frames, Find, Tidy, a test panel | F-FLOW-008, F-FLOW-017, F-FLOW-016 |
| 10 | **An honest public site:** unverifiable claims removed, one claims sheet with owners and a copy lint, one brand | F-QA-001, F-QA-009, F-QA-013 |

---

## 4. Design System

**[Recommendation]**, with the tokens and reference CSS **[Implemented]** as files. Sources:
- foundations: [`spec/01-foundations.md`](spec/01-foundations.md);
- tokens: [`spec/tokens/`](spec/tokens/);
- component specs: [`spec/02-components-core.md`](spec/02-components-core.md), [`-data-nav`](spec/02-components-data-nav.md), [`-gate`](spec/02-components-gate.md) and [`-overlay-feedback`](spec/02-components-overlay-feedback.md);
- canonical CSS: [`spec/components/components.css`](spec/components/components.css);
- motion: [`spec/07-motion-microinteractions.md`](spec/07-motion-microinteractions.md).

### 4.1 Typography
- **Three families.** **Hanken Grotesk** 400/500/600 for all UI and marketing. **JetBrains Mono** 400/500 only for machine tokens: ids, `{{variables}}`, API keys, keycaps. It is never used for phone numbers, timers, money or labels. **Noto Sans Devanagari**, size-adjusted and loaded by `unicode-range`, for Hindi. Other Indic scripts load lazily. Sora, Instrument Serif, Syne, Rajdhani, Inter, DM Sans, Geist and IBM Plex are retired.
- **Scale:** 12 meta · 13 data, nav, buttons, labels · 14 body · 15/24 transcripts · 15/26 Devanagari · 16/24 panel titles · **20/28 page H1** · 24/32 setup · 28/32 KPI numerals · 40/48 first-run display · 56/60 marketing only. 600 is the heaviest weight.
- **Nothing below 12 px anywhere**, including table headers, keycaps, bottom-bar labels and canvas text at any zoom. Sentence case everywhere, and `tabular-nums` on changing numbers.

### 4.2 Colour
- **Neel, the one accent,** keyed to indigo dye (HSL ≈218°). It never turns violet or periwinkle.

  | Theme | Fill | Hover | Soft | Text |
  |---|---|---|---|---|
  | Light | `#1F4A94` (white label 8.52:1) | `#183C7A` | `#EDF3FC` | |
  | Dark | `#2F62C0` (white 5.75:1) | | | `#8DB2EE` |

  **Neel-ink** `#0F203D` colours the Baseline and the mark tile in both themes.
- **Graphite neutrals.**

  | Theme | Background | Surface | Text | Text-3 | Control border |
  |---|---|---|---|---|---|
  | Light | `#F6F7F9` | `#FFFFFF` | `#121722` | `#5F6878` (replaces the failing `#7A8397`) | `#7E8695` (≥ 3:1) |
  | Dark | `#0D0F13` | `#14171C` | `#E8EBF0` | `#8C94A2` | |

- **State:** success, warning and danger, each as a soft pair (≥ 5.4:1) plus a solid. The live dot is `#13923F` light and `#4CC47F` dark. Amber is never standalone text on white.
- **Charts** use their own palette (Ink, Teal, Ochre, Rose, Slate) and a teal heat ramp. They never use state colours for series, and use Neel only on the selected datum.
- **Proof:** `node spec/tokens/check-contrast.mjs` checks **460 required pairs in both themes, with 0 failures** ([`spec/tokens/contrast-report.md`](spec/tokens/contrast-report.md)).

### 4.3 Space, layout, shape, elevation
- **Space:** a 4 px base (2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96) with role tokens:
  - label gap 6;
  - field gap 16;
  - group gap 24;
  - section gap 40;
  - panel padding 16 and 20;
  - cell padding 12.
- **Breakpoints:** 480 · 768 · 1024 · 1280 · 1440. Containers: page 1280, form 720, auth 400, measure 68ch.
- **Chrome sizes:** header 56 · view tabs 40 · toolbar 48 · table head 32 · pager 40 · Baseline 28 · Flow header 48 · record sheet 440 · call-detail sheet 560 · Publish gate 640 · Call gate 400.
- **Shape, "machined, not soft":** radius 4 (tags) · 6 (buttons, inputs) · 8 (panels, nodes) · 12 (dialogs, sheets). Fully round only for avatars, the live dot, switches and Trigger and Outcome capsule ends. No pill buttons or chips.
- **Lines and elevation:** 1 px hairlines do the structure, and 2 px lines appear only for focus, selection and the active tab. A dashed line means only a canvas fallback path. Light theme uses three shadow levels (e1–e3); dark uses a surface ladder plus a ring, with no blur.

### 4.4 Components
- **Core controls:** Button (one component with variants), IconButton (a required label), Field (label, hint and error wired together), Indian phone and INR money inputs, pickers, choice controls, dates, upload, keycaps.
- **Data and navigation:** Sidebar, Rail, TopBar, BottomBar, MoreSheet, PageHeader, Baseline and BaselineChip, tabs, StatStrip, Tag and StatusTag (driven by one exhaustive `lib/status.ts`), FilterBar, DataTable, Pager, ListRow, Timeline and charts.
- **Voice components:** CallStateTag, CallHeader, LineQuality, TurnRow, TranscriptFeed, RecordingPlayer, TalkStrip, VoicePicker, LevelMeter and LanguageMark.
- **One gate system:** a frame, check rows (blocking, advisory, passed), a cost line, keys and a server contract (preflight, a 120 s `gateToken`, an `Idempotency-Key`). Variants: CallGate (single and batch), PublishGate, SetupTrack, AddAgentGate, form gates, money gates and the inline ApprovalCard.
- **Overlay and feedback:** Dialog, confirmation tiers, Sheet, Popover, Menu, the command palette, toasts, notices, loading, empty, error and save states.
- **Signature components**, rendered once each in light and dark as regression baselines ([`spec/components/canonical/`](spec/components/canonical/)): button, tag, language mark, sidebar, rail, phone, table, gate, step and turn.

### 4.5 Interaction patterns
- **Status grammar:** `[state badge] + one sentence + quiet meta + at most one action`, for example "Couldn't save. Your last 2 edits are on this device only. · 11:42 am · Retry". A disabled control always carries its reason.
- **Gates** for anything that dials, bills or goes live. The cost is shown as a range ("2 calls · about 1 to 2 min each · ₹5 to ₹10"). Initial focus goes on the heading, so `C` then `Enter` can never dial.
- **Save states:** Saved · Unsaved changes · Saving… · Couldn't save · Retry · Not saved yet. Delete comes with an Undo toast instead of a dialog where possible.
- **Focus is not selection.** Focus is a 2 px outline with a 2 px offset. Selection is an accent-soft fill plus a 1 px accent border. Both show together.
- **Keyboard:**
  - one shortcut registry, with single-key shortcuts that can be switched off;
  - `⌘/Ctrl+K` palette, `?` sheet, `/` search, `J`/`K`/`X`/`Enter` in tables;
  - keycaps shown only in tooltips, menus and the `?` sheet.
- **One state matrix on every data view:** empty (with one action) · filtered to nothing · loading (a skeleton after 200 ms) · error (a sentence and Retry) · no permission (names the admin).
- **Voice and copy:**
  - plain and calm;
  - buttons are verbs with objects ("Publish v8…", "Call 2 leads…");
  - en-IN numbers (₹2,34,050.00), 12-hour time with IST;
  - one glossary: Flow and steps; Trigger, Logic, Action, Outcome; Answer; Publish, Draft, Live; Inbound number and Caller ID; Wallet and Top up.
- **Bilingual:** chrome is English in v1, with every string in i18n keys. Content stays in the language spoken, with `lang` on each transcript turn and language marks shown as a script glyph plus the name.
- **Motion,** "a relay clicking": 90, 140 and 200 ms with one easing, animating only `transform` and `opacity`. Loops are bounded (the live dot pulses 3 times). Nothing loops on an idle screen, and everything stops under reduced motion.

---

## 5. Page-by-Page Changes

**[Recommendation]** Each row names the main change; the spec holds the full design, states and acceptance criteria. All specs are in [`spec/03-pages/`](spec/03-pages/) unless noted. The prototype page that shows it is in brackets.

| Page | Main changes | Spec |
|---|---|---|
| **Shell and IA** (every page) | **Sidebar:** a grouped, labelled 232 px sidebar (Operate · Build · Data · Account) with a workspace switcher and the current page "on the thread". **Baseline:** a Neel-ink band stating the live flow, the number, wallet with runway, and calls in progress; it replaces the 42 px wallet banner and "SYS: ONLINE". **Other sizes:** a rail at 1024–1279, a top bar with nav sheet at tablet, and a bottom bar with More on phones. **Plumbing:** one nav config, a skip link, `aria-current`, per-route titles, and 308 redirects from old routes. **Sign out** moves to the account menu. | [`00-app-shell-ia.md`](spec/03-pages/00-app-shell-ia.md) |
| **Home and setup** | "Get your first call live": 5 server-computed steps (publish a flow, verify the number, add money, call yourself, import leads or connect inbound). "Live" appears only when all pass. The sidebar card shows the progress. The organization is created with the workspace. (`index.html`) | [`00-app-shell-ia.md`](spec/03-pages/00-app-shell-ia.md) §13 |
| **Cockpit** | A **Ready to call** card replaces the STANDBY ring. **Place call…** goes through the Call gate, and **Talk in browser** replaces CONNECT and Test Call. Pickers never silently rewrite defaults. The live call card has a state stepper, "Now in the flow", captured fields and Take over, Transfer and End call. Turn rows carry language marks. Wrap-up ends with Save and next. No demo data beside real leads. (`cockpit.html`) | [`01-agent-cockpit.md`](spec/03-pages/01-agent-cockpit.md) |
| **Rep console** | Explicit **Go available**, with a heartbeat and auto-offline; never "present" on page load. It shares the call card and turn rows. Errors are sentences with Retry, with no raw SDK text. (`rep-console.html`) | [`01-agent-cockpit.md`](spec/03-pages/01-agent-cockpit.md) §5 |
| **Assistant** | Plans shown as steps. Side-effect steps wait for approval under the autonomy modes (Auto / Confirm / Confirm + 2FA). Call and Publish steps open the real gates. A suggestion chip never activates anything. Chats are saved per user on the server, with search and deep links. (`assistant.html`) | [`02-assistant.md`](spec/03-pages/02-assistant.md) |
| **Leads** | Views with pipeline-wide counts, filter tokens in the URL, the toolbar count with a breakdown popover, and a real `<table>` with focusable rows. **Bulk:** the lead sheet (Delete moves to the overflow menu), a bulk bar, and a **batch Call gate** (caller ID, calling hours, DND, recently called with Include, language, cost range against runway) that lands the batch as Scheduled. **Import:** a mapping preview with row errors. **Phones:** two-line rows, at least 8 per screen at 360×780. (`leads.html`) | [`03-leads.md`](spec/03-pages/03-leads.md) |
| **Call reports** | Server pagination ("1–50 of 121") with server-side search, sort and filter. KPIs count calls, not legs, with test calls excluded by default. At most 9 anchored columns. Focusable rows open a 560 px detail sheet (deep-linked `?call=`) with summary, captured fields, the transcript in turn rows and a keyboard recording scrubber. (`call-reports.html`) | [`04-call-reports-analytics.md`](spec/03-pages/04-call-reports-analytics.md) |
| **Analytics** | One StatStrip. Graphite single-series charts in report sections, with no cards. Metrics are shared with Call reports (`lib/metrics.ts`), so totals match. Every chart drills into Call reports with the same filters. The flow drop-off links to its steps. Nothing below 12 px on phones. (`analytics.html`) | [`04-call-reports-analytics.md`](spec/03-pages/04-call-reports-analytics.md) §3 |
| **Flows list** | Flow identity: a unique name, the version, and Live or Draft state, with "where it is live" per trigger. **New flow** opens a template gallery. (`flow-designer.html`) | [`04-flow-designer/02-config-validation-lifecycle.md`](spec/04-flow-designer/02-config-validation-lifecycle.md) |
| **Flow Designer** | See §6. | [`spec/04-flow-designer/`](spec/04-flow-designer/) |
| **Knowledge** | An indexing status sentence per file ("Indexed · 42 passages · 2 min ago", "Couldn't index · Retry"). Also Add knowledge, a source sheet, Test a question, and Proposals for admins, with no silent redirect. Vendor names are removed. (`knowledge.html`) | [`05-knowledge-billing.md`](spec/03-pages/05-knowledge-billing.md) §1 |
| **Billing** | Wallet · Usage · Plans · Invoices · Autopay. The balance shows its runway. The **Top-up sheet** opens in place from every "Top up": UPI first, validated amounts, and the runway shown before paying. Usage counts calls, not legs. Autopay has four explicit states. (`billing.html`) | [`05-knowledge-billing.md`](spec/03-pages/05-knowledge-billing.md) §2 |
| **Settings** | A 200 px grouped sub-nav and a 720 px column: Profile, **Organization & team** (with invites), Notifications, Integrations, **Phone setup** (inbound number, caller ID, transfer, test call), Security, API keys, Webhooks, Embed (snippet fixed), Activity, Export, Delete. Save covers the whole section, is enabled only when something changed, and guards against losing unsaved edits. (`settings.html`) | [`06-settings.md`](spec/03-pages/06-settings.md) |
| **Meetings** | Rooms listed by title with state sentences ("Live · 12 min · 3 people"). Stale rooms are flagged and ended by an idle rule (to confirm, MP-Q3). **Start a meeting** is a form gate. Past meetings carry their notes and summary. End room is guarded. The violet dialect is retired. (`agents.html`) | [`07-meeting-personal-agents.md`](spec/03-pages/07-meeting-personal-agents.md) |
| **Personal agents** | The blocking prerequisite comes first ("No number assigned. Ask an admin."). Tasks need a goal. Autonomy is set per capability. Consumer capabilities (stock trading, homework) are hidden. (`agents.html?view=personal-agents`) | [`07-meeting-personal-agents.md`](spec/03-pages/07-meeting-personal-agents.md) |
| **Public site and auth** | Unverifiable `/about` claims are removed, with one claims sheet (owner, `verifiedOn`) and a copy lint. `/pricing` is drawn from the real rates. The hero is a real call transcript. **Auth:** separate `/signup` and `/login` with their own H1s, password-manager-friendly fields, magic link, verification, reset and invites. **Also:** consent before analytics, and one brand name. (`login.html`, `signup.html`, `forgot-password.html`) | [`08-public-auth.md`](spec/03-pages/08-public-auth.md) |
| **Error pages** | The 404, error, forbidden and session-expired pages sit inside the app shell with a plain sentence and a way on. "SIGNAL LOST" is retired. (`404.html`) | [`00-app-shell-ia.md`](spec/03-pages/00-app-shell-ia.md) §15 |

---

## 6. Flow Designer

Sources:
- canvas and nodes: [`spec/04-flow-designer/01-canvas-and-nodes.md`](spec/04-flow-designer/01-canvas-and-nodes.md) (FD1);
- configuration, validation and lifecycle: [`spec/04-flow-designer/02-config-validation-lifecycle.md`](spec/04-flow-designer/02-config-validation-lifecycle.md) (FD2);
- the direction: [`spec/00-design-direction.md`](spec/00-design-direction.md) §6.5.

### 6.1 Today

**[Analysis]** The Flow Builder is the product's riskiest surface: 37 findings, 1 critical and 12 high.
- **Lifecycle.** Edits autosave into the one flow record that live calls use. Opening or switching to a flow writes to it. The save chip says "Up to date" permanently. Undo doesn't reverse added nodes. ACTIVATE is ungated, and "active" means different things on different pages (F-FLOW-001, -002, -003, -005, -014).
- **Validation.** "FLOW VALIDATED" stays green over errors. The validator checks wiring only, issues aren't marked on nodes, and results carry over between flows (F-FLOW-004, -010).
- **Operability.** The canvas is mouse-only: 9×9 px handles, tab order in creation order, and edge names that expose internal ids (F-FLOW-006, F-A11Y-001, -007, -028). Focused and selected nodes look like every other node.
- **Grammar and legibility.**
  - Node titles are low contrast (1.48–2.34:1) and illegible at fit zoom (F-FLOW-007, -008).
  - Branch meaning depends on handle position, and edges carry no meaning (F-FLOW-011, -020).
  - Each node type has 3–4 names (F-FLOW-027).
- **Authoring.** Palette clicks stack new nodes on top of each other, unconnected (F-FLOW-009). There is no create-flow journey, and the default template is itself invalid (F-FLOW-013). Invalid values are accepted and autosaved (F-FLOW-015). AI draft replaces the canvas without asking (F-FLOW-031).
- **Testing.** Nothing can be tested inside the builder; "Preview AI script" is the only preview (F-FLOW-016).
- **Space.** The canvas gets 36–52 % of the screen (F-FLOW-022). The minimap covers content (F-FLOW-023).

### 6.2 The improvements

**[Recommendation]**

**Draft and Live.**
- Every flow has two revisions, Draft and Live. Opening a flow writes nothing, and theme or viewport changes never write.
- **The save chip** has five states: `Saved 11:24 am` · `Unsaved changes` · `Saving…` · `Couldn't save · Retry` (persistent) · `Not saved yet`. Writes use `If-Match`; a 409 opens a conflict sheet, and pending saves flush on `pagehide`.
- **Publish v8…** opens the **Publish gate**, in five parts:
  1. checks (errors block, with the reason; a warning needs a tick and relabels the button "Publish with 1 warning");
  2. a diff that links to each changed step;
  3. where it goes live (numbers, batches, the Cockpit default);
  4. an optional note;
  5. the Publish button.
- **After publishing,** the toast says where v8 is live and offers **Roll back to v7…**. A rollback publishes v7's content as v9, and says that calls already placed on v8 stay on v8. History offers **Restore as draft** and never overwrites Live.
- **AI draft** arrives as a diff on the draft (Apply or Discard).
- **Interim I1.** Until the revisions backend exists, edits stay on the device as a "device draft" and reach callers only through the Publish gate (plan P0-02).

**Validation.**
- **One rule catalogue** (`lib/flow/rules.ts`), shared by the issues chip, the node marks, the Problems bar and the server (422).
- **Errors** block Publish: no Trigger, an unreachable step, an unconnected required answer, an empty prompt, an invalid number, WhatsApp with no template, a lookup with no connector, an unknown `{{variable}}`, a path with no Outcome.
- **Warnings:** a template pending approval, a disconnected integration, a Logic step with no examples.
- It recomputes 300 ms after each change. **Go to step** and `Alt+.` / `Alt+,` walk the issues.

**Keyboard and assistive technology.**
- **The canvas key map:**
  - `Tab` enters at the first Trigger, and the order follows the graph; `→`/`←` follow edges, `↑`/`↓` move between siblings and answer rows.
  - `Enter` opens the inspector; `C` opens **Connect to…**, a searchable list; `A` adds a connected step.
  - `Delete` deletes with Undo; `Ctrl/⌘+F` is Find; `?` is a real dialog.
- **Every step has a full `aria-label` and a stable `#n`** that survives edits, Tidy and publishing, so references stay true.
- **Every answer has a Go to [step] select,** so a flow can be wired without dragging.
- **The Outline** (nested by branch) is a complete non-spatial editor.
- **Sockets** are focusable buttons with 24 px hit areas, and 44 px on touch.

**Shape grammar: Trigger → Logic → Action → Outcome.**
- **Four phases,** told apart by silhouette and a neutral glyph tile, never by colour:

  | Phase | Silhouette | Glyph tile |
  |---|---|---|
  | Trigger | Capsule start | Solid ink tile |
  | Logic | Rectangle with answer rows | Outlined diamond tile |
  | Action | Rectangle | Tinted tool tile |
  | Outcome | Capsule end | Tile in the soft colour of the state it writes ("Lead → Interested") |

- **Answer rows** carry bilingual examples ("haan, zaroor · हाँ"). Actions that can fail use **result rows** (Found / Not found). The fallback ("No reply · after 6 s") is the **only dashed line in the product**. An unconnected required row reads amber "Not connected".
- **Level of detail:** full above 0.75 zoom, compact at 0.5–0.75, block below 0.5. Text is counter-scaled so it is **never below 12 px**, and the glyph tile and phase word stay at every level.
- **Unreachable steps** dim their tile, sockets and connectors, never the text.
- **Focus and selection** are drawn differently, and both show together.

**Testing inside the designer.**
- A docked **Test panel** with three modes: a text test, browser voice, and "Call my phone" through the Call gate.
- Side effects are simulated and said. The path is traced once on the canvas, then static; the trace is skipped under reduced motion.
- A run record. "Test call placed on this draft" feeds the Publish gate as an advisory row.

**Large flows and layout.**
- **Tools:** Tidy (ELK layered, left to right, one undo step), collapsible frames and notes, Find, multi-select with a bulk bar, and a saved viewport per flow.
- **Minimap** from 1280 px, and it never covers nodes.
- **Performance budget:** 150 steps at ≥ 50 fps under 4× CPU throttle.
- **Layout at 1440:**
  - a single 48 px header (Draft chip, save state, Live chip, undo and redo, Tidy, issues, Test, **Publish v8…**, the rest in `⋯`);
  - a phase ruler with counts and the live note ("Callers hear v7 until you publish · Compare with live");
  - a tool rail, a 320 px inspector and a 32 px Problems bar.

  The sidebar collapses to the rail and the Baseline hides, so the canvas gets about 70 % of the screen.

**New flows and migration.**
- **New flow** opens a template gallery: Lead qualification, Site visit, EMI reminder, COD confirmation, Appointment, Support FAQ. Every template passes validation.
- New flows lay out left to right. The 16 existing top-down flows get an opt-in "Re-layout as draft", never an automatic one.

**Responsive modes.**

| Width | Mode |
|---|---|
| ≥ 1280 | The full editor |
| 1024–1279 | The inspector overlays the canvas |
| 768–1023 | **Review mode:** the Outline beside a read-only canvas. Test, Compare, History, Roll back and Publish work; no step edits. |
| < 768 | The branch Outline, read-only, with Test · Publish in a sticky bar |

### 6.3 What exists and what is planned

- **[Implemented, prototype only]** `prototype/flow-designer.html` demonstrates all of the above on a fictional flow, with 29 reviewer states (`?state=`). Round 3 QA confirmed:
  - the canvas key map, Connect to… and Delete with Undo;
  - Find by title or `#9`;
  - the Publish gate matching FD2 §5, with publish then roll back;
  - the text test tracing the path;
  - Review mode at 768, and the Outline with sticky Test and Publish at 390 and 360;
  - 0 axe violations, and no text under 12 px.
- **[Recommendation, not built in the product]** Plan items:
  - P0-01 (opening writes nothing), P0-02 (device draft), P0-03 (truthful save chip, undoable deletes), P0-04 (computed validation);
  - P0-05 (revisions backend) and P0-12 (keyboard path);
  - P2-09 to P2-18 (node set, canvas assistive technology, chrome, large flows, inspectors, validation parity, revision UI, test and simulate, templates, responsive modes).

---

## 7. Responsive Design

Source: [`spec/05-responsive.md`](spec/05-responsive.md), with shell and Flow Designer renders ([`05-responsive-shell.html`](spec/05-responsive-shell.html), [`05-responsive-flow.html`](spec/05-responsive-flow.html)).

**[Analysis] Today.**
- Phones and 200 % zoom reach only 6 of 12 sections (F-RWD-001).
- At common laptop heights the desktop rail hides Billing, Knowledge and Settings (F-RWD-005).
- ACTIVATE is clipped at 768–877 px (F-RWD-003).
- On phones, Call reports leaves a 255–337 px strip for data and its table is 2,617 px wide (F-RWD-004, -010).
- The Cockpit drops context and overlaps controls on short viewports (F-RWD-002).
- Meeting Agent, Personal Agents and Analytics push content off-screen below about 540 px (F-RWD-006, -007, -008).
- Leads shows 2–3 leads per phone screen (F-RWD-011).
- The wallet banner grows to 2–4 lines on phones (F-RWD-013).

**[Recommendation] The responsive contract.**
1. **Every page is designed four times, not shrunk once.** Layout is chosen by width and height; interaction details by pointer.
2. **Nothing is removed without a replacement.** A hidden column becomes a line in a list row, a panel becomes a tab or sheet, and an action moves into `⋯`.
3. **12 of 12 destinations at every size,** including 320×640, 844×390 and 200 % zoom.
4. **Nothing scrolls sideways** except content that is wide by nature, such as a table with pinned columns.
5. **One scroller per page on phones.**
6. **The primary action is never clipped.** It is the last thing to fold.
7. **Layout reacts live** to resize, rotation and zoom, and state survives every change.
8. **Touch is an input, not a width.** Hit areas are 44×44 whenever `pointer: coarse`, and 24×24 elsewhere.
9. **Safe areas, `dvh` and the on-screen keyboard** are part of the layout.
10. **Gates keep their full form at every size.** A phone gets a full-screen gate, never a shortcut around it.

| Width | Shell | Records and panels |
|---|---|---|
| ≥ 1440 desktop | Labelled 232 px sidebar, Baseline | Records dock as a 440 px sheet beside the list; inspectors dock at 320; the Cockpit gets its Calls column |
| 1280–1439 laptop | Same sidebar | Sheets overlay the right third |
| 1024–1279 laptop | 56 px rail with tooltips; `[` expands it as an overlay | Non-modal overlay sheets; the Cockpit Calls column becomes a header switcher |
| 768–1023 tablet | 52 px top bar (menu, title, call chip, wallet chip, search) and a left nav sheet with the setup card | Single pane; modal full-height sheets; tables show priority columns with the key and actions pinned |
| 320–767 phone | Top bar plus a bottom bar (Cockpit · Leads · Call reports · Flows · More); **More lists every other destination**, the setup card, the account and Sign out | Full-screen sheets with Back; tables become two-line list rows; no per-row call button |

- **Height and zoom are layout inputs:**
  - under 600 px tall at ≥ 768 wide, the tablet shell;
  - at or under 720 px tall, the Baseline folds into a header chip;
  - 200 % zoom on 1440×900 is 720×450 CSS px, so it gets the phone shell;
  - no orientation lock.
- **Chrome budget on Indian office laptops.** Budgets use the inner viewport: maximised Chrome or Edge gives about 1366×657 and 1280×609. The fixed chrome is 244 px, which yields **12 Leads rows at 1366×657 and 10 at 1280×609** in Standard density. The prototype measured exactly that, plus 16 at 1440×900.
- **Phones on Indian networks.**
  - **Shell:** it never waits for data; skeletons appear after 200 ms; page size defaults to 25.
  - **Offline and slow actions:** offline disables billable actions with the reason, and slow actions show their own pending label.
  - **Billable requests** are never retried automatically.
  - **Fonts:** Devanagari loads only when Hindi appears.
- **The Cockpit on phones** keeps the flow, contact, call kind and state visible, puts Take over and End call in a sticky bar, requests a wake lock during a call, and says that a phone call continues if the page is left.
- **The Flow Designer** uses the capability matrix in §6.2. Editing needs 1024 px or wider. Landscape tablets get the full editor with 44 px sockets and a Navigate / Arrange switch.
- **Real devices** are part of "done": touch pan and pinch on the canvas, iOS focus zoom, safe-area overlap and the on-screen keyboard.

---

## 8. Accessibility

Source: [`spec/06-accessibility.md`](spec/06-accessibility.md). **Target: WCAG 2.2 Level A and AA**, plus four AAA criteria adopted where they fix a real audit problem:
- 2.5.5 Target Size: 44×44 on touch;
- 2.3.3 Animation from Interactions;
- 2.4.13 Focus Appearance;
- 2.2.5 Re-authenticating without losing work.

### 8.1 Issues found on the live product

**[Analysis]**
- **Automated checks** ran axe-core 4.10.2 plus a custom contrast scanner that composites translucent surfaces, on 11 signed-in pages plus `/login` and `/`.
  - **axe:** Leads has 24 unlabelled row checkboxes (critical). Meeting Agent, Knowledge and Settings have unlabelled file inputs and selects (critical). There are 51 contrast violations on Call Reports, 37 on Meeting Agent, and unreachable scroll regions on the home page.
  - **The scanner** found far more than axe, because axe files translucent text under "incomplete". Text failing contrast: **77 % on Call Reports, 58 % on Meeting Agent, 55 % on Leads, 51 % on Analytics, 50 % on the Cockpit.** 139–166 text elements under 12 px on Analytics and Leads.
- **Manual keyboard and semantics** found the two critical lockouts and 7 highs. No screen reader was run.

| ID | Sev | Problem | Required fix |
|---|---|---|---|
| F-A11Y-001 | critical | Flow nodes can't be opened or connected by keyboard | Roving tabindex in graph order, Enter opens the inspector, focusable sockets, Connect to…, Go to selects, the Outline editor |
| F-A11Y-002 | critical | Call details open only on a mouse click | Focusable rows with a real link; Enter opens the sheet with focus on its heading; Esc returns; `?call=` deep link |
| F-A11Y-003 | high | Fields have no programmatic label | One `Field` (label, hint and error via `aria-describedby`, `aria-invalid`, `autocomplete`); placeholders are examples only |
| F-A11Y-004 | high | Single-key shortcuts can't be turned off; `c` dials | A scoped registry with an off switch; `C` opens the Call gate; never intercept Enter or Space on buttons |
| F-A11Y-005 | high | Modals have no dialog semantics, trap or focus return | One Radix Dialog and Sheet: labelled, trapped, inert background, Esc, focus return |
| F-A11Y-006 | high | Focus invisible, or under 3:1 | A global 2 px `:focus-visible` outline with a 2 px offset, ≥ 6.15:1 on every plane |
| F-A11Y-007 | high | Focused and selected nodes look like other nodes | Focus is an outline; selection is an accent-soft fill plus a border; both show together |
| F-A11Y-008 | high | Muted text `#7A8397` and 8–10 px mono fail AA | `--text-3` becomes `#5F6878` / `#8C94A2` (≥ 4.70:1); no alpha on text; 12 px floor |
| F-A11Y-009 | high | Black text on primary blue (3.27–3.83:1) | White on Neel `#1F4A94` (8.52:1); violet retired |
| F-A11Y-010 to -018 | medium | Leads rows not focusable; menus hard to use by keyboard; no skip link (33 tab stops before content); identical titles; silent status changes; an assertive wallet alert; visual-only toggle states; no `aria-current`; tables without caption, scope or sort | A real table with J/K moving focus; Radix menus; a skip link with one stop per item; per-route titles with focus to the H1; one announcer; the WalletNotice as `role=status`; radio, pressed and expanded semantics; `aria-current`; captions, `scope` and `aria-sort` |
| F-A11Y-019 to -026 | medium | State chips and node titles under 4.5:1; placeholders at 1.56–1.78:1; marketing nav at 1.39:1; reduced motion ignored; targets under 24 px (44 on touch); icon buttons with no name; login autofill blocked; heading and landmark gaps | Tokens with state text ≥ 5.47:1; no idle animation and both reduced-motion sources honoured; 24 px hit areas (44 on touch); IconButton requires a label; correct `autocomplete` and paste; an H1 and landmarks everywhere |
| F-A11Y-027 to -030 | medium, low | The shortcuts dialog and node editor don't take focus; canvas order follows creation order; unreachable marketing scrollers; label-in-name gaps | The `?` sheet as a dialog; graph order with named connections; no nested scrollers; names that start with the visible text |

**Related findings from other lenses** also break WCAG criteria:
- autosave into the live flow and the one-key dial (3.3.4 Error Prevention);
- outcome meaning carried by handle position and colour (1.3.3, 1.4.1);
- phone and 200 % zoom navigation (1.4.10 Reflow);
- 36 % of text under 12 px (1.4.4);
- the late wallet banner that shifts content (F-QA-036).

On touch, 77 of 84 Leads targets at 390 px were under 44 px (F-A11Y-023). The Rep console was left out of the accessibility pass because it registers a live softphone.

### 8.2 Required fixes and how they are proven

**[Recommendation]**
- **Structure:** one H1 and correct landmarks per page, a unique `<title>`, a skip link, and focus to the H1 on route change.
- **Focus:** always visible and never lost to `<body>`. It returns to the trigger when an overlay closes.
- **Keyboard maps** for every complex widget: tables, the canvas, menus, the palette and gates.
- **One announcer,** following a catalogue of what may be announced: call state, final transcript turns, counts, saves and failures. Timers and wallet decrements are never announced.
- **Contrast** proved by `check-contrast.mjs` (460 pairs) and a rendered-contrast test.
- **Targets:** 24 px everywhere and 44 px on touch.
- **Reduced motion** from both the OS and the in-app setting.
- **`lang`** on Hindi turns, and Devanagari at 15/26.
- **Forms:** errors inline and linked, and re-authentication that keeps page state.
- **Testing** runs in CI: AX-01 to AX-03 on every route at 1440, 1024, 768 and 390 in both themes; CT-01 to CT-03; KB-01 to KB-14, with a guard that fails on any pointer event; live-region, target-size and visual tests.
- **Manual testing:** SR-01 to SR-07 on NVDA, JAWS, VoiceOver and TalkBack (with Hindi voices), plus speech input, Windows contrast themes and switch access.
- **Definition of done:** the product may claim WCAG 2.2 AA only when every route is done, no blocker or high is open, and the screen-reader scripts pass. Then an Accessibility Conformance Report (VPAT) is written.

**[Analysis of the prototype]**
- axe-core found **0 violations on every page in both themes** in the final smoke, and 0 in 81 state-by-state runs on the admin pages in round 3.
- No text is under 12 px; reduced motion stops every animation; focus is managed through gates and sheets; 12 of 12 destinations are reachable by keyboard and on phones.
- **No screen reader was run on the prototype either.** A few touch-target and focus items remain (§9(b)).

---

## 9. Playwright Testing

### 9(a) The live product (vaanilabs.in)

**[Analysis]** Sources: the method sections of each report in [`audit/raw/`](audit/raw/), and [`audit/consolidated/00-summary.md`](audit/consolidated/00-summary.md) §6.

**Who tested.** 16 specialist agents, one lens each, on 26 Sep 2026. Fifteen drove a browser; the design researcher did not.

| Lens | Agents |
|---|---|
| Exploration | explore-core (calling surfaces), explore-data (data pages), explore-settings (Settings, IA) |
| Flow Designer | flow-canvas (canvas and interaction), flow-config (configuration, validation, lifecycle) |
| UX | ux-audit (journeys, CTAs, feedback, states) |
| Visual | visual-audit, design-system |
| Responsive | responsive-a (Cockpit, Assistant, Flow Builder, Meetings, Personal Agents, Billing), responsive-b (data pages, Settings, login, marketing home) |
| Accessibility | a11y-auto (axe-core 4.10.2 and a contrast scanner), a11y-manual (keyboard, focus, semantics) |
| Functional QA | qa-a (Cockpit, Assistant, Flow Builder, Meetings, Personal Agents, global chrome), qa-b (Analytics, Leads, Call Reports, Knowledge, Billing, all 17 Settings sections, deep links, reload, empty states) |
| Public site | public-site (signed out) |
| Research | design-research (no browser) |

**11 adversarial verifiers** then re-ran every high and critical claim in the live product: a11y-auto, a11y-manual, flow-canvas, flow-config, public-site, qa-a, qa-b, responsive-a, responsive-b, ux-audit and visual-audit. They corrected severities and details. Every finding carries a confidence level (verified, partially verified, multi-agent, single-agent). No consolidated finding was refuted; 10 accessibility sub-claims were refuted or corrected.

**How.**
- **Browser:** Chromium driven by Playwright, one private window per agent. Signed-out pages ran in isolated, cookie-less contexts, so the signed-in session was never touched.
- **Accessibility tooling:** axe-core 4.10.2 injected through CDP, plus an in-page scanner that composites translucent backgrounds to compute real contrast.
- **Keyboard walks** sampled `document.activeElement` after every key.
- **Device emulation:** CDP device metrics with touch for tablets and phones, network throttling and offline emulation, and reduced-motion emulation.

**The read-only guard.**
- **Blocked in every browser:** all POST, PUT, PATCH and DELETE requests, WebSockets, analytics (PostHog), OAuth, presence and payment calls (Razorpay), popups and downloads.
- **Writes the app attempted** were logged, and their visible effects are labelled "observed under simulated network failure". The Flow Builder's autosave `PUT` on merely opening a flow is one example.
- **Clipboard** writes were intercepted in the page.
- **Not touched:**
  - Save, ACTIVATE, Private, Delete and Import on flows;
  - every call control (CONNECT, Test Call, Call Now, bulk CALL, the Leads `c` key);
  - top-up, Pay and autopay;
  - sign-up, OTP, OAuth and sign-out;
  - account deletion, invites and AI-draft Generate;
  - the Rep Console softphone.
- **Credentials:** no agent typed any. No customer or lead personal data appears in the reports.

**Coverage.**
- **Routes:** every reachable route of the signed-in app, and the public site. Public pages covered: home, pricing, enterprise, security, docs and API docs, contact, build, changelog, about, status, careers and blog, plus the login, sign-up and forgot-password pages.
- **Interactions:** every dialog, drawer and menu opened; typing without submitting.
- **Accessibility:** axe on 11 signed-in pages plus `/login` and `/`.
- **Viewports:** from 1920 to 320, including 1366×768, 1280×800, 1024×768, 768 tablet, 390, 360 and 844×390 landscape.
- **Conditions:** both themes, reduced motion, throttled and offline network.
- **Evidence:** 1,093 screenshots.

**Limitations.**
- **Server-side outcomes are inferred, not observed.** Nothing was saved, submitted, called or paid, so it is unknown:
  - whether autosaved edits reach live calls;
  - whether ACTIVATE validates on the server;
  - whether two-leg calls are billed twice;
  - whether Pay validates amounts;
  - whether Exit confirms.
- **Not observed working:** live call audio, LiveKit meeting rooms, the Rep Console softphone and the real-time transcript (WebSockets were blocked).
- **One member-role account** (₹0 wallet). Admin views were not seen as an admin, and some findings depend on this state.
- **Emulation, not real devices,** and **no screen reader.**
- **Not tested:** file downloads (CSV and PDF exports), OAuth and OTP flows, and the `/build.html` live demo.
- **One browser reset** interrupted an earlier run; that work was re-run.
- **Two open discrepancies** between sections (the Embed Copy snippet; how Settings is reached on phones).
- **A snapshot of production on 26 Sep 2026.**

**What it found.** 211 findings (5 critical, 50 high, 130 medium, 26 low); the counts and top issues are in §2. The testing itself surfaced:
- write attempts on merely opening a flow;
- "Up to date" shown while writes failed;
- only 50 of 121 calls reachable;
- about 41 two-leg duplicate records;
- 33 tab stops before page content;
- two core jobs impossible by keyboard;
- 50–77 % of text failing contrast on data pages;
- 6 of 12 sections reachable on phones and at 200 % zoom;
- ACTIVATE clipped at 768–877 px;
- a 2,617 px table on phones;
- invalid values ("abc", 0, −50, 9,999,999) accepted by phone and amount fields.

### 9(b) The static prototype

**[Analysis of the prototype]** Sources: [`prototype/_qa/`](prototype/_qa/) (`round1-*` to `round3-*`, `polish-notes.md`, `final-smoke.md`).

**Method.** Each round ran four QA agents (core pages, data pages, Flow Designer, admin and auth pages) with Playwright, isolated cookie-less contexts and `file://`.
- **Widths:** from 1920 to 320, with touch and mobile emulation.
- **Checks:**
  - axe-core 4.10.2 in light and dark, with overlays open;
  - console and page errors;
  - document overflow;
  - a text-size scan;
  - a hit-area probe that includes `::before` and `::after` expansions;
  - keyboard walkthroughs sampling `activeElement` every 120–200 ms;
  - reduced motion.
- Bugs were reproduced before filing (at least twice, per the round reports).
- Fixes were applied between rounds.

| Round | Blocker | Major | Minor | Key metrics and what changed |
|---|---:|---:|---:|---|
| 1 | 2 | 27 | 71 | axe 0 / 0 (light / dark) on every page and overlay, with no document overflow from 1440 to 320. **Blockers:** the command palette threw on Enter (`shell.js`), and ending a call in its first 20 s crashed the Cockpit wrap-up. **Also:** touch targets of 16–39 px, the Flow Designer +541 px tall at 1280×580 with the inspector open, Analytics StatStrip overflow at 360 and 320, and Leads at 7 rows at 360×780 (spec ≥ 8). |
| 2 | 0 | 8 | 48 | Both blockers fixed (0 errors across 34 Cockpit states, including End call at 8 s). Flow Designer vertical scroll 0; Leads and Call reports at 8 rows at 360×780; no touch-target misses on Home, 404, Cockpit or the Flow Designer at phone and tablet widths. **New majors:** a ticking timer inside a status region, the ₹0 wallet not blocking the Call gate on Call reports, a Columns menu unusable by keyboard, filters hidden by a docked sheet, popovers losing focus on Tab, Settings tables scrolling sideways, a hidden Assistant action at laptop sizes, and 40 px rail items on coarse-pointer tablets. |
| 3 | 0 | 7 | 79 | The widest pass, with more states, widths and 81 axe runs on the admin pages alone. **Round-2 majors** were fixed. **New majors:** calls that never connected showed a charge (R3C-01); the Enter keycap used `aria-label` on `<kbd>`, one serious axe hit (R3C-02); focus was lost after a re-rendered select (R3D-01); Roll back published a made-up version (FD-R3-01); an empty Meetings filter (R3A-01); the ConsentBar covered sign-up controls (R3A-02); and phone emails overlapped (R2A-08). |
| Polish | – | – | – | Fixed R3D-01, R3D-02, R3D-12, R2C-16, FD-R2-04 and FD-R1-26. Re-verified R3C-01, -03, -05, -09 and -11, R2C-08, FD-R3-01, R3D-13 and R2C-13 in the browser, and confirmed the other core, Flow Designer and data fixes by reading the code. One shared Prototype states style; token guard back to 0. 51 showcase renders. |
| Final smoke | – | – | – | Every page (17 plus the template and the personal-agents view) at 1440 light and dark and 390 touch: **0 errors, 0 axe violations, 0 px overflow**, after one regression (a 72 px gallery overflow at 390) was found and fixed. **Navigation:** 12 of 12 destinations reached from the Sidebar, the Rail, the BottomBar and More; all Settings (14), Billing (5), Knowledge (2) and gallery (14) sections. **Tools:** `check-links` 705 references, 0 broken; `check-tokens` 154 files, 0 problems. |

**Measured along the way:**
- **Text:** no text under 12 px anywhere; phone inputs are 16 px and 44 px tall.
- **Rows:** Leads and Call reports show 16 rows at 1440×900, 12 at 1366×657, 10 at 1280×609 and 8 or 9 on phones.
- **Assistant:** the thread keeps 594–658 px on phones.
- **Flow Designer:** the canvas is 1016×780 at 1440 with the inspector docked. Gates trap focus and return it (Publish gate timelines sampled to 1,600 ms).
- **Motion:** nothing animates under reduced motion.
- **Network:** fonts only, with no writes.

**Fixed across the rounds** (examples):
- **Crashes:** the palette and wrap-up crashes.
- **Focus loss to `<body>`:** in gates, sheets, selects and popovers.
- **Wallet and cost truth:** the ₹0 wallet now blocks the call entry points with its reason, and there is no charge for unanswered calls.
- **Keyboard and live regions:** keyboard access to the column menu, and timers removed from live regions.
- **Data consistency:** consistent demo data across pages (for example, call counts match Call reports).
- **Flow Designer:** roll back restores the old content; notes and inserts no longer collide.
- **Layout:** tables no longer scroll sideways in Settings; most touch targets now meet 44 px on phones and landscape tablets.

**What remains in the prototype** (details in [`prototype/README.md`](prototype/README.md) §9):
- **Fixed and re-tested after the report was drafted (orchestrator, 27 Sep):**
  - **R3A-01 (major):** the Meetings Filter popover was empty. `agents-boot.js` now listens for `vaani:open` and `vaani:close` in the capture phase, so the non-bubbling events reach it. The popover now opens with its 5 options and no errors (`_shots/retest-R3A-01-meetings-filter.png`).
  - **R2A-08 (major):** Settings emails overlapped on 320–360 px phones. The shared `.kv` component now stacks label above value when the list is narrower than 400 px. Member emails stay on one line with an ellipsis and the full address in a tooltip, and an invited member's masked email wraps inside its own column.
    - Re-test: 0 overlaps at 320 and 360, the Profile email is stacked on one line, desktop key-value rows are unchanged, axe 0, overflow 0, and `check-tokens` and `check-links` both clean (`_shots/retest-R2A-08-*.png`).
- **ConsentBar, partly fixed:** it still covers the sign-up consent line at 1440×900 on first view.
- **Phone More:** it is marked current on Home after setup although it doesn't list Home.
- **Not re-verified one by one** after the last fix round: the round-3 admin and auth minors (R3A-03 to R3A-10, R2A-04 to R2A-07, R2A-09 to R2A-13, the rest of R1A-05) and data minors R2D-14, -15, -17 and -18.
- **Shared components** are still page-local (`prototype/_integration-notes.md` §5).
- **Scope:** tested only in Chromium, with no real devices and no screen reader.

---

## 10. Implementation Status

### 10.1 CHANGES ACTUALLY IMPLEMENTED

**[Implemented]** Only these, all as files in this folder:
1. **Audit documents** (`audit/`):
   - the consolidated live-product audit (211 findings with evidence, confidence and recommendations), in 9 sections and as one file (`AUDIT_FINDINGS.md`);
   - 16 raw agent reports;
   - 1,093 screenshots.
2. **The redesign specification** (`spec/`):
   - direction and specimen;
   - foundations;
   - four component specs and the canonical component CSS;
   - nine page specs and two Flow Designer specs;
   - responsive, accessibility and motion specs;
   - the implementation plan and critique log;
   - 23 reference mocks with renders.

   Guards pass: `reassemble.py --check`, `check-mocks.mjs` (23 mocks, 0 problems).
3. **Design tokens** (`spec/tokens/`):
   - `tokens.json` v1.1.0 and the generator;
   - generated `tokens.css`, `base.css`, `legacy-aliases.css`, the Tailwind v4 theme and the v3 preset;
   - the contrast check: 460 pairs, 0 failures.
4. **The static reference prototype** (`prototype/`): 17 pages plus a template, the shared layer, three QA rounds, polish and smoke reports, screenshots, two guard scripts, and a README.
5. **This report.**

> **NOTHING was changed in the live vaanilabs.in product.** There was no access to the Vaani Labs source code, repository or deployment pipeline. Every audit browser ran behind a read-only guard that blocked all writes, so no flow, lead, setting, payment or call was created, changed or placed. Every product file path in the spec is a proposal.

### 10.2 CHANGES THAT COULD NOT BE IMPLEMENTED

**[Recommendation, not built]** Everything in the live product. The full, sequenced list, with findings resolved, dependencies, effort and acceptance criteria, is [`spec/08-implementation-plan.md`](spec/08-implementation-plan.md) §3–§6. Indicative team: about 4 front-end, 2 back-end and 1 QA engineer.

- **P0 · Safety and critical, about 6–8 weeks, ships first and unflagged:**
  - **Flow lifecycle and editing:**
    - P0-00 platform slice (Radix dialogs, shortcut registry, announcer, URL state, flags);
    - P0-01 opening a flow writes nothing;
    - P0-02 an interim device draft with the Publish gate;
    - P0-03 a save chip that can fail, and undoable deletes;
    - P0-04 computed validation;
    - P0-05 the revisions backend;
    - P0-12 a keyboard path through flow editing.
  - **Calls and actions:**
    - P0-07 no single key places a call;
    - P0-08 every call through the Call gate (with `Idempotency-Key` and `gate_token`);
    - P0-09 the Assistant never acts without approval;
    - P0-10 destructive actions guarded.
  - **Status, access and data:**
    - P0-06 true status surfaces;
    - P0-11 records open by keyboard;
    - P0-13 the contrast and focus hotfix by value swap;
    - P0-14 Call reports counting every call once;
    - P0-15 deep links and wrong destinations.
  - **Sign-up, public claims and privacy:**
    - P0-16 working sign-up and setup;
    - P0-17 verifiable public claims (needs owner answers);
    - P0-18 personal data kept out of telemetry.
- **P1 · Tokens, components, shell and IA, top pages, about 10–12 weeks:**
  - **Foundations:** P1-01 tokens and theming; P1-02 lint guards.
  - **Components:** P1-03 to P1-07 core controls, overlays, data, gate and voice components; P1-16 closing the component gaps.
  - **Shell and pages:** P1-08 the shell and IA; P1-09 the Baseline and wallet signals; P1-10 Home and the setup track; P1-11 Cockpit; P1-12 Leads; P1-13 Call reports; P1-14 the Flows list; P1-15 the Top-up sheet.
- **P2 · Remaining pages and the Flow Designer upgrades, about 12–16 weeks:**
  - **Pages:** P2-01 to P2-08 (Analytics, Knowledge, Billing, Settings, Assistant, Meetings and Personal agents, Rep console, public site and auth).
  - **Flow Designer:** P2-09 to P2-18 (§6).
  - **Clean-up:** P2-19 removing the five dialects.
- **P3 · Polish and motion, about 4–6 weeks:**
  - **Motion and signatures:** the motion system, micro-interactions, canvas motion, and the data-dependent signatures (talk strip, scrubber, per-turn language).
  - **Clean-up and brand:** density options, deleting the legacy aliases, the commissioned mark.
  - **Sign-offs:** real devices, screen readers and the ACR.
- **Public-site content** (`/about` claims, pricing, brand names) needs the owner's answers before it can change (PA-Q1 to PA-Q3, PA-Q6).

### 10.3 REMAINING WORK

1. **Build and ship** P0 to P3 in the product, with the CI pipeline and the Playwright journeys J1–J12 in plan §7. **Network guards** must fail the build if opening a flow writes, if `C` sends a call request, or if a call has no `gate_token`.
2. **Real-device testing** (R §17.4) on an iPhone, a mid-range Android phone, an iPad in both orientations and a Windows touch laptop. Check touch pan and pinch on the canvas, iOS focus zoom, safe areas and the on-screen keyboard. Neither the live product nor the prototype was tested on real devices.
3. **Screen-reader testing** (SR-01 to SR-07) on NVDA with Chrome and Firefox, JAWS, VoiceOver on macOS and iOS, and TalkBack on Android, including Hindi voices. Add speech input, Windows contrast themes and switch access. No screen reader has been run on anything yet.
4. **Server-side checks the read-only audit could not do**, on a staging or sandbox account:
   - Do autosaved edits reach live calls today?
   - Does ACTIVATE validate on the server?
   - Are two-leg browser test calls billed twice?
   - Does Pay validate amounts?
   - Does Exit confirm?
   - Does the Assistant's chat endpoint execute side effects without a confirmation turn (AS-Q1)?

   Also: live call audio, LiveKit rooms, the Rep Console softphone and the real-time transcript; CSV and PDF exports; OAuth and OTP; the `/build.html` demo; admin-only views seen as an admin; and the two open audit discrepancies.
5. **Settle the spec inconsistencies** S1–S16 (plan §8.3) before the owning items start. **Close the open critique items** (critique log §6): 14 open and 13 partly done, including 39 component-layer requests.
   - The consolidated list after the final mock-conversion pass is [`spec/_critique/open-items.md`](spec/_critique/open-items.md):
     - 49 numbered component-layer requests;
     - two spec value conflicts (socket focus ring 24 vs 18 px; FilterToken icon 12 vs 14 px);
     - the places where spec text still lags the "one fact, one place" rule (Leads and Call reports ViewSummary, Home's H1, the Assistant's PlanBar, and the Flow Designer live note and inspector footer);
     - a few repeats that need a product decision.
   - All 23 spec mocks pass `check-mocks.mjs`. The retired `flow-grammar.css` and `shell-partials.css` are pointer stubs, and the last full copy is in `spec/_critique/retired/`.
6. **Fix the prototype's remaining items** (§9(b)) if it will keep serving as the reference.
7. **Open questions for the Vaani team.** The full list, about 100 with ids, is in plan §8.4. The headline ones:
   - **Tablet editing and phone quick fixes** in the Flow Designer, for v1.1 (R-Q1, R-Q2).
   - **Compliance rules** the Call gate enforces regardless of settings: DND scope, TRAI calling windows, the recording disclosure (CK-Q7, ST-Q4, G-Q1, L-Q3). Legal review before the gate ships (P1-06).
   - **Billing:** the unit and rates (per second or per minute, the Meetings rate) and one rates endpoint (KB-Q1). GST on top-ups (KB-Q2). Whether browser test calls are billed (G-Q2, CK-Q2). The low-wallet threshold (O-Q1).
   - **Access and sign-up:** self-serve or approval-gated access, with the real review time (PA-Q1, SH-Q2). Roles beyond Admin and Member (SH-Q1, AS-Q8).
   - **Public claims:** supported languages, the latency figure and its method, and data residency (PA-Q3). The relationship between the company names used in the footer and the consent text (PA-Q6).
   - **Defaults and definitions:** whether single-key shortcuts are on by default (N-Q3), and whether voicemail counts as answered (CR-Q2).
   - **Data and product scope:** archiving QA and E2E rooms in production (MP-Q6); removing the consumer personal-agent capabilities (MP-Q11).
   - **Brand and build:** commissioning the final mark (D §3.1); accepting React Aria for number and date fields (C-Q1).
8. **Account-security note.**
   - During the audit, the audit browser's session cookies were persisted for up to 12 hours so the session would survive browser restarts.
   - **Checked at the end (27 Sep):** the Playwright browser holds no Vaani Labs session cookies any more; the session had already ended. Nothing needs clearing.
   - No agent entered credentials, and no write reached the product.
   - One password was accidentally echoed in a tool result early in the session, while the login form was being inspected. It was never reused or sent anywhere, but rotating that account's password is a sensible precaution.
