<div align="center">

<img src="docs/images/design/mark.png" width="64" alt="Vaani Labs mark, the cord">

<h1>Vaani Labs · the Sutradhar redesign</h1>

**A read-only audit of [vaanilabs.in](https://vaanilabs.in/), the redesign spec it led to, generated design tokens and a clickable reference prototype of a calm, exact console for running voice agents.**

211 findings audited · 460 contrast pairs, 0 failures · 17 prototype pages · 0 axe violations · 12 of 12 destinations at every size

</div>

<img src="docs/images/ui/hero.png" width="100%" alt="Flow Designer on a laptop with the phone Cockpit showing a live call">
<p align="center"><sub>The Flow Designer on a laptop, with the phone Cockpit on a live call. Every new-UI screenshot is the static prototype with fictional data.</sub></p>

## What is this

Vaani Labs sells AI voice agents that place and answer phone calls for Indian businesses. This repository holds four pieces of work, each built on the one before:

| Step | What it is | Where |
|---|---|---|
| 1. **Audit** | The live product, read-only, 26 Sep 2026: 16 specialist agents, 11 verifiers, 211 findings | [`audit/`](audit/consolidated/00-summary.md) |
| 2. **Spec** | **Sutradhar**: direction, foundations, components, 9 page specs, Flow Designer, responsive, accessibility, motion, a phased plan | [`spec/`](spec/README.md) |
| 3. **Tokens** | `tokens.json` v1.1.0 generated into CSS, a Tailwind v4 theme and a v3 preset | [`spec/tokens/`](spec/tokens/) |
| 4. **Prototype** | A static, clickable build of the spec: 17 pages of plain HTML, CSS and JS | [`prototype/`](prototype/README.md) |

> [!IMPORTANT]
> **Nothing in the live vaanilabs.in product was changed.** There was no access to its source code or deploy pipeline, and every audit browser blocked all writes (saves, calls, payments).

## Quick links

| I want to… | Open |
|---|---|
| Read the whole story | [`FINAL_REPORT.md`](FINAL_REPORT.md) |
| See what is wrong today | [`audit/consolidated/00-summary.md`](audit/consolidated/00-summary.md) · full: [`AUDIT_FINDINGS.md`](audit/AUDIT_FINDINGS.md) |
| Understand the direction | [`spec/00-design-direction.md`](spec/00-design-direction.md) |
| Browse the spec | [`spec/README.md`](spec/README.md) |
| Plan the build | [`spec/08-implementation-plan.md`](spec/08-implementation-plan.md) |
| Click through it | `prototype/index.html` · guide: [`prototype/README.md`](prototype/README.md) |
| Check the tests | [`prototype/_qa/`](prototype/_qa/) · [`final-smoke.md`](prototype/_qa/final-smoke.md) |

---

## The new UI

The prototype runs one made-up workspace, "Sample Realty" in Pune: invented names, masked numbers, and "now" fixed at 27 Sep 2026, 11:24 am IST. The Neel-ink band at the bottom is the **Baseline**, which states only computed facts: the live flow, the number, the wallet with its runway, calls in progress.

<table>
<tr>
<td width="50%"><img src="docs/images/ui/home.png" width="100%" alt="Home overview"><br><sub><b>Home</b>: next steps, today's stats, latest calls, the wallet</sub></td>
<td width="50%"><img src="docs/images/ui/cockpit.png" width="100%" alt="Cockpit with a live call"><br><sub><b>Cockpit</b>: a live call with its state stepper, "Now in the flow", captured fields and a Hindi, English and Hinglish transcript</sub></td>
</tr>
<tr>
<td><img src="docs/images/ui/leads.png" width="100%" alt="Leads table"><br><sub><b>Leads</b>: saved views with counts, status, interest, language, flow</sub></td>
<td><img src="docs/images/ui/leads-call-gate.png" width="100%" alt="Batch Call gate for 12 leads"><br><sub><b>Call gate</b>: 12 leads checked before anything dials; DND, Do not call and recent calls skipped</sub></td>
</tr>
<tr>
<td><img src="docs/images/ui/call-reports.png" width="100%" alt="Call reports with call detail sheet"><br><sub><b>Call reports</b>: calls, not legs; a detail sheet with summary, recording and transcript</sub></td>
<td><img src="docs/images/ui/analytics.png" width="100%" alt="Analytics charts"><br><sub><b>Analytics</b>: one KPI strip, calls and sentiment per day, drop-off by step, intents</sub></td>
</tr>
</table>

<details>
<summary><b>Eight more screens</b>: Assistant, Knowledge, Billing, Top-up, Settings, Meetings, Sign in, Components</summary>
<br>
<table>
<tr>
<td width="50%"><img src="docs/images/ui/assistant.png" width="100%" alt="Assistant with a plan waiting for approval"><br><sub><b>Assistant</b>: a plan waiting for approval at its Call step, with a cost range</sub></td>
<td width="50%"><img src="docs/images/ui/knowledge.png" width="100%" alt="Knowledge sources and Test a question"><br><sub><b>Knowledge</b>: a status sentence per source, "Test a question", unanswered questions</sub></td>
</tr>
<tr>
<td><img src="docs/images/ui/billing.png" width="100%" alt="Billing wallet tab"><br><sub><b>Billing</b>: prepaid wallet with runway, Autopay, the ledger</sub></td>
<td><img src="docs/images/ui/billing-topup.png" width="100%" alt="Top-up sheet"><br><sub><b>Top-up sheet</b>: validated amount, GST, new runway, UPI</sub></td>
</tr>
<tr>
<td><img src="docs/images/ui/settings.png" width="100%" alt="Settings overview"><br><sub><b>Settings</b>: grouped sub-nav, "2 things need attention"</sub></td>
<td><img src="docs/images/ui/meetings.png" width="100%" alt="Meetings rooms and past meetings"><br><sub><b>Meetings</b>: live rooms, a stale room flagged, notes status</sub></td>
</tr>
<tr>
<td><img src="docs/images/ui/login.png" width="100%" alt="Sign in page"><br><sub><b>Sign in</b>: its own route, password or email link</sub></td>
<td><img src="docs/images/ui/components.png" width="100%" alt="Component gallery, Gate section"><br><sub><b>Component gallery</b>: Call gates in every state, light and dark</sub></td>
</tr>
</table>
</details>

### Dark mode

<table>
<tr>
<td width="50%"><img src="docs/images/ui/cockpit-dark.png" width="100%" alt="Cockpit in dark mode"><br><sub><b>Cockpit</b></sub></td>
<td width="50%"><img src="docs/images/ui/leads-dark.png" width="100%" alt="Leads in dark mode"><br><sub><b>Leads</b></sub></td>
</tr>
<tr>
<td><img src="docs/images/ui/flow-designer-dark.png" width="100%" alt="Flow Designer in dark mode"><br><sub><b>Flow Designer</b></sub></td>
<td>

- Background `#0D0F13`, surface `#14171C`, text `#E8EBF0`
- Neel `#2F62C0` (white label 5.75:1)
- A surface ladder plus a ring, no blur
- The Baseline stays Neel-ink `#0F203D`
- axe: 0 violations in dark

</td>
</tr>
</table>

### On phones

A bottom bar (Cockpit · Leads · Call reports · Flows · More), and **More** lists every other destination, workspace status, the account, theme and motion.

<img src="docs/images/mobile/phones.png" width="100%" alt="Home, Cockpit, Leads and Flow Designer Outline on phones">

<table>
<tr>
<td width="25%"><img src="docs/images/mobile/call-reports.png" width="100%" alt="Call reports on a phone"><br><sub><b>Call reports</b>: two-line rows with outcome and sentiment</sub></td>
<td width="25%"><img src="docs/images/mobile/analytics.png" width="100%" alt="Analytics on a phone"><br><sub><b>Analytics</b>: the KPI strip as a 2×2 grid</sub></td>
<td width="25%"><img src="docs/images/mobile/billing.png" width="100%" alt="Billing on a phone"><br><sub><b>Billing</b>: wallet runway, Top up in the header</sub></td>
<td width="25%"><img src="docs/images/mobile/more-sheet.png" width="100%" alt="More sheet on a phone"><br><sub><b>More</b> sheet: every other destination, status, theme</sub></td>
</tr>
</table>

---

## Before → after

Three live screens from 26 Sep 2026 next to the prototype. The live captures were redacted first (a client name and a payment provider's name are blurred).

<img src="docs/images/before-after/flow-builder.png" width="100%" alt="Live Flow Builder next to the prototype Flow Designer">
<p align="center"><sub><b>Flow builder.</b> Before: edits autosave into the live flow, and "FLOW VALIDATED" can show on invalid flows. After: a Draft, a computed warning, a Publish gate.</sub></p>

<details>
<summary><b>Billing and Assistant</b></summary>
<br>
<img src="docs/images/before-after/billing.png" width="100%" alt="Live empty-wallet Billing next to the prototype Billing">
<p align="center"><sub><b>Billing</b> at ₹0. After: the balance says what is paused and what still works, with Top up next to it.</sub></p>
<img src="docs/images/before-after/assistant.png" width="100%" alt="Live empty Assistant next to the prototype Assistant with a plan">
<p align="center"><sub><b>Assistant.</b> After: side-effect steps wait for approval; Call steps open the real Call gate.</sub></p>
</details>

> [!NOTE]
> The other **1,093 live screenshots** (`audit/screenshots/`) stay out of git because they show real customer data. The reports still cite them by path, and client names in flow titles read Client A–D.

---

## What the audit found

**211 findings: 5 critical, 50 high, 130 medium, 26 low**, after the verifiers' corrections; none refuted. The pattern: the live product is often **wrong about what is live, what a call costs, or what happened**.

| Section | Crit | High | Med | Low | Total |
|---|---:|---:|---:|---:|---:|
| 3A Global, IA, journeys, copy, trust (F-UX) | 1 | 11 | 33 | 3 | 48 |
| 3B Visual and design system (F-VIS) | 0 | 3 | 23 | 11 | 37 |
| 3C Flow Designer (F-FLOW) | 1 | 12 | 20 | 4 | 37 |
| 3D Responsive (F-RWD) | 0 | 5 | 12 | 2 | 19 |
| 3E Accessibility, WCAG 2.2 (F-A11Y) | 2 | 7 | 20 | 1 | 30 |
| 3F Functional, public site, auth (F-QA) | 1 | 12 | 22 | 5 | 40 |

<details open>
<summary><b>Top 15 issues</b></summary>

| # | ID | Sev | Issue |
|---|---|---|---|
| 1 | F-FLOW-001 | critical | Edits autosave straight into the live flow; no draft or publish |
| 2 | F-UX-001 | critical | Org setup is a circular dead end; all 5 integrations stay disabled |
| 3 | F-QA-001 | critical | `/about` claims a bank pilot, a $12M Series A and SOC 2 Type II; `/security` contradicts them |
| 4 | F-A11Y-001 | critical | Flow nodes can't be opened or connected by keyboard |
| 5 | F-A11Y-002 | critical | Call Reports details open only on a mouse click |
| 6 | F-QA-002 | high | Opening a flow writes to it; "Up to date" shows when a save fails |
| 7 | F-FLOW-004 | high | "FLOW VALIDATED" on invalid flows; ACTIVATE works with errors |
| 8 | F-A11Y-004 | high | `c` on Leads places a billable call with no confirmation |
| 9 | F-QA-005 | high | Call Reports reaches only the latest 50 of 121 calls |
| 10 | F-QA-006 | high | Each browser test call is stored twice (about 41 of 121) |
| 11 | F-UX-002 | high | The wallet banner's Top up opens Profile, which has no wallet |
| 12 | F-UX-006 | high | "You're live" on an account that can't place calls |
| 13 | F-QA-010 | high | `/signup` lands every "Get started" on sign-in |
| 14 | F-RWD-001 | high | Phones and 200 % zoom reach only 6 of 12 sections |
| 15 | F-A11Y-008, -009 | high | Muted text and black on primary blue fail AA; 50–77 % of data-page text fails |

</details>

**Worth keeping:** a semantic token layer (32 variables, full light and dark pairs) on Next.js and Tailwind v4, Lucide icons, React Flow with a labelled toolbar, consistent phone masking, UPI top-up, strong Settings guardrails, the Personal Agent autonomy levels and a candid `/security` page. The work is consolidation and truthful state, not a rebuild.

---

## Design direction: Sutradhar

In Indian theatre the *sutradhar* (सूत्रधार) is "the one who holds the threads". Here the operator holds the threads (the flow, the call, the transcript, the wallet) while the agent speaks on stage.

> **Essence:** a calm, exact console for running voice agents. It is never wrong about what is live, what a call will cost, or what was said and in which language.

It won a contest of three directions and three judges: it keeps **Switchboard's** system (mean score 8.17), grafts **Bolchaal's** identity and **Clear Path's** guidance, and survived three critics (68 issues, every blocker resolved). See [`spec/critique-log.md`](spec/critique-log.md).

| # | Principle (ranked) |
|---|---|
| P1 | **Say only what is proven.** Status is computed; missing data is hidden, never simulated |
| P2 | **Colour is state; shape is type.** Graphite chrome, one Neel accent for intent |
| P3 | **Nothing dials, bills or goes live without a gate.** No skip, even for admins |
| P4 | **Dense where you scan, calm where you decide.** 40 px rows and 32 px controls, 720 px forms |
| P5 | **Every action has an address.** Keyboard, pointer, touch, screen reader |
| P6 | **One frame, every breakpoint designed.** 12 of 12 destinations everywhere |
| P7 | **Quiet chrome; the work and the voice are loudest.** No gradients, glass or glows |

<table>
<tr>
<td width="50%" valign="top"><img src="docs/images/design/palette.png" width="100%" alt="Colour ramps with hex values"><br><sub><b>Colour.</b> Graphite chrome; Neel <code>#1F4A94</code>, keyed to indigo dye (white label 8.52:1); state colours only for state</sub></td>
<td width="50%" valign="top"><img src="docs/images/design/type.png" width="100%" alt="Type scale and language marks"><br><sub><b>Type.</b> Hanken Grotesk, JetBrains Mono for machine tokens, Noto Sans Devanagari for Hindi. 23 roles, 12 px floor</sub></td>
</tr>
</table>

**The mark** is "the cord": two strands, the agent's voice and the caller's, twisted into one thread ([`spec/brand/mark.svg`](spec/brand/mark.svg)). It is a working mark until a commissioned one replaces it.

---

## Design system

| Layer | What's in it | Spec |
|---|---|---|
| **Tokens** | Type, colour, 4 px space, breakpoints 480 · 768 · 1024 · 1280 · 1440, radius 4/6/8/12, motion 90/140/200 ms, density. **460 contrast pairs, 0 failures** | [`01-foundations`](spec/01-foundations.md) · [`tokens/`](spec/tokens/) |
| **Core** | One Button (5 variants), IconButton, Field, Indian phone and INR inputs, pickers, dates | [`core`](spec/02-components-core.md) |
| **Data and nav** | Sidebar, Rail, BottomBar, Baseline, DataTable, StatusTag, charts, voice components (TurnRow, TalkStrip, LanguageMark) | [`data-nav`](spec/02-components-data-nav.md) |
| **Gate** | One component for anything that dials, bills or goes live | [`gate`](spec/02-components-gate.md) |
| **Overlay and feedback** | Dialog, Sheet, Menu, palette, toasts, loading, empty, error and save states | [`overlay-feedback`](spec/02-components-overlay-feedback.md) |
| **Canonical CSS** | The one component layer, with light and dark renders | [`components.css`](spec/components/components.css) · [`canonical/`](spec/components/canonical/) |

**The Gate:** blocking and advisory checks, a cost range ("2 calls · about 1 to 2 min each · ₹5 to ₹10") and one confirming action. Variants: CallGate (single and batch), PublishGate, SetupTrack, form and money gates, and the ApprovalCard. `C` opens the Call gate and never dials; `⌘/Ctrl+Enter` confirms. Server side: a preflight, a 120 s `gateToken` and an `Idempotency-Key`.

**One status map:** every StatusTag comes from one exhaustive map (`lib/status.ts` in the plan, `Vaani.STATUS` in the prototype), and every status reads `[badge] + one sentence + quiet meta + at most one action`.

<details>
<summary><b>Component collage</b></summary>
<br>
<img src="docs/images/design/components.png" width="100%" alt="Buttons, tags, DataTable and Call gate specimens">
</details>

---

## Flow Designer

The riskiest surface today (37 findings, 1 critical, 12 high), redesigned as a lifecycle, not just a canvas.

<img src="docs/images/ui/flow-designer.png" width="100%" alt="Flow Designer with step 3 selected">
<p align="center"><sub>"Site-visit qualifier": Live v7, Draft v8 with 3 changes, the phase ruler and the inspector with bilingual answer examples</sub></p>

<table>
<tr>
<td width="50%"><img src="docs/images/ui/flow-designer-publish.png" width="100%" alt="Publish v8 gate"><br><sub><b>Publish gate</b>: checks, where v8 goes live, the diff, a note</sub></td>
<td width="50%"><img src="docs/images/ui/flow-designer-test.png" width="100%" alt="Test panel"><br><sub><b>Test panel</b>: a text test, path traced on the canvas</sub></td>
</tr>
</table>

- **Draft and Live.** Opening a flow writes nothing. Callers hear only what passed the Publish gate. Roll back publishes the old content as a new version.
- **A save chip that can fail:** Saved · Unsaved changes · Saving… · Couldn't save · Retry · Not saved yet.
- **Computed validation.** One rule catalogue for the issues chip, node marks, Problems bar and server. Errors block Publish; a warning needs a tick.
- **Keyboard.** `Tab` follows the graph, arrows follow edges, `C` opens **Connect to…**, `A` adds a step, `Delete` has Undo. Every answer has a **Go to [step]** select, and the **Outline** is a complete non-spatial editor.
- **Test panel:** text, browser voice, or "Call my phone" through the Call gate.
- **Large flows:** Tidy, frames, notes, Find (title or `#9`), and text never below 12 px at any zoom.

<img src="docs/images/design/flow-grammar.png" width="100%" alt="Trigger, Logic, Action, Outcome step specimen">
<p align="center"><sub><b>Shape grammar</b>: Trigger → Logic → Action → Outcome, told apart by silhouette, never colour. The fallback is the only dashed line in the product.</sub></p>

Editing needs 1024 px or wider; 768–1023 is Review mode (Outline beside a read-only canvas, Test and Publish work); phones get a read-only Outline with a sticky Test · Publish bar. The prototype has **29 reviewer states** (`flow-designer.html?state=…`). Specs: [`spec/04-flow-designer/`](spec/04-flow-designer/).

---

## Responsive and accessibility

| Width | Shell |
|---|---|
| ≥ 1280 | Grouped 232 px sidebar (Operate · Build · Data · Account) and the Baseline |
| 1024–1279 | 56 px rail |
| 768–1023 | 52 px top bar and a nav sheet |
| < 768 | Bottom bar with **More**; tables become two-line rows |

200 % zoom on 1440×900 gets the phone shell. Budgets use the real inner viewports of Indian office laptops: **12 Leads rows at 1366×657, 10 at 1280×609**, 16 at 1440×900, as the prototype measured.

**Target: WCAG 2.2 A and AA**, plus four AAA criteria that fix real audit problems (2.5.5, 2.3.3, 2.4.13, 2.2.5). Focus is a 2 px outline, never drawn like selection; targets are 24 px, 44 px on touch; reduced motion is honoured. See [`05-responsive.md`](spec/05-responsive.md) · [`06-accessibility.md`](spec/06-accessibility.md).

---

## Quality and testing

**Live audit.** 16 specialist agents drove Chromium through Playwright, one lens each; **11 adversarial verifiers** re-ran every high and critical claim. Tools: axe-core 4.10.2, a contrast scanner that composites translucent surfaces, keyboard walks, viewports from 1920 to 320 px, both themes, reduced motion, throttled and offline network. A **read-only guard** aborted every POST, PUT, PATCH and DELETE, WebSockets, analytics, OAuth, presence and payment calls, popups and downloads.

**Prototype.** Three QA rounds of four QA agents, a polish pass and a final smoke test:

| Pass | Blocker | Major | Minor |
|---|---:|---:|---:|
| Round 1 | 2 | 27 | 71 |
| Round 2 | 0 | 8 | 48 |
| Round 3 (incl. 81 axe runs on admin pages) | 0 | 7 | 79 |

**Final smoke**, every page at 1440 light and dark and 390 touch: 0 console errors, **0 axe violations**, 0 px overflow, 12 of 12 destinations reached. `check-links`: 705 references, 0 broken; `check-tokens`: 154 files, 0 problems. No text under 12 px anywhere.

---

## Implementation plan

Indicative, for about 4 front-end, 2 back-end and 1 QA engineer; to be re-planned after P0 sizing.

| Phase | Length | What ships |
|---|---|---|
| **P0** Safety and critical | 6–8 wk | Opening a flow writes nothing, draft plus Publish gate, truthful status, computed validation, revisions backend, the Call gate (no single key dials), Assistant approval, keyboard paths, contrast hotfix, correct call counts, working sign-up, honest `/about` |
| **P1** Tokens, components, shell | 10–12 wk | Token pipeline, component layer, shell and IA, Baseline, Home, Cockpit, Leads, Call reports, Flows list, Top-up |
| **P2** Remaining pages, Flow Designer | 12–16 wk | Every other page; new node set, revisions UI, large flows, test panel; old dialects removed |
| **P3** Polish and motion | 4–6 wk | Motion, signatures, clean-up, final mark, real-device and screen-reader sign-off |

Details, dependencies and acceptance criteria: [`spec/08-implementation-plan.md`](spec/08-implementation-plan.md).

---

## Repository structure

```text
.
├── FINAL_REPORT.md            executive summary, 10 sections, implementation status
├── audit/                     read-only audit of the live product
│   ├── AUDIT_FINDINGS.md      consolidated report in one file
│   ├── consolidated/          00-summary plus sections 01–05, in parts
│   ├── raw/                   16 specialist reports
│   └── screenshots/           1,093 live captures, NOT in git (customer data)
├── spec/                      the Sutradhar specification
│   ├── README.md              index and reading order
│   ├── 00- … 08-*.md          direction, foundations, components, responsive,
│   │                          accessibility, motion, implementation plan
│   ├── 03-pages/              9 page specs with mocks and renders
│   ├── 04-flow-designer/      canvas and nodes; validation and lifecycle
│   ├── tokens/                tokens.json → CSS, Tailwind, contrast check
│   ├── components/            components.css, canonical renders, check-mocks
│   ├── brand/ · directions/   the mark; the 3 archived directions
│   └── critique-log.md        judges, critics, 68 issues
├── prototype/                 17 pages + _template.html, open index.html
│   ├── assets/ · pages/       tokens, components, shell.js, data.js; per-page code
│   ├── _qa/ · _shots/         QA reports; screenshots (final/ has 51 renders)
│   └── _tools/                check-tokens.mjs, check-links.mjs
└── docs/images/               the images in this README
```

Combined spec docs are assembled from their `NAME.partN.md` parts, which are canonical (`python spec/_tools/reassemble.py`). HTML files in `spec/` are reference mocks, not product code.

---

## Run it locally

No install, no build: double-click **`prototype/index.html`**. Internet is needed only for fonts. If your browser blocks `file://`:

```bash
cd prototype && python -m http.server   # then open http://localhost:8000/
```

Try `Ctrl/⌘+K`, `?` for shortcuts, `C` on Leads (opens the gate, never dials), the Flow Designer by keyboard, and each page's **Prototype states** button. Or: `index.html?setup=incomplete`, `leads.html?wallet=empty`, `flow-designer.html?state=large`, `billing.html?topup=1`.

Checks (all pass today):

```bash
node spec/tokens/check-contrast.mjs        # 460 colour pairs, both themes
node spec/components/check-mocks.mjs       # 23 mocks use the canonical CSS
python spec/_tools/reassemble.py --check   # combined docs match their parts
node prototype/_tools/check-tokens.mjs     # tokens only, no raw values
node prototype/_tools/check-links.mjs      # no broken local links
```

---

## Status and limitations

- **Analysis** is what was observed (live, 26 Sep 2026) or measured (prototype). **Recommendation** is what the spec proposes, not built in the product. **Implemented** means files in this repository only.
- **No real devices and no screen reader** were used on either the live product or the prototype. Only Chromium was tested.
- **Server-side outcomes are inferred.** Nothing was saved, called or paid, so whether autosaves reach live calls or two-leg calls are billed twice is unknown.
- **The prototype is reference code**: everything is simulated, and one `shell.js` stands in for React primitives. Leftovers are listed in [`prototype/README.md`](prototype/README.md) §9.
- **Open questions** (about 100, plan §8.4) include the compliance rules the Call gate enforces (DND, TRAI calling windows, recording disclosure), billing rates and GST, and which public claims can be verified.

## How this was made

A multi-agent workflow, coordinated by an orchestrator. Specialist agents audited the live product through Playwright behind the read-only guard, and verifiers re-checked their claims. Three directions were drafted, judged and critiqued before Sutradhar became the spec. The prototype was built page by page on the generated tokens and one component layer, then tested by Playwright QA agents over three rounds, a polish pass and a smoke test. Every number here comes from the linked reports.
