# Vaani Labs Redesign Specification

**Date:** 2026-09-27 · **Product:** the Vaani Labs web app (voice agents that place and answer phone calls for Indian businesses) and its public site · **Evidence:** the read-only audit of production in [`../audit/`](../audit/consolidated/00-summary.md)

## Purpose

This folder is the complete redesign specification for Vaani Labs. It turns the audit's 211 findings (5 critical, 50 high) into one design direction, **Sutradhar**, and specifies what is needed to build it: tokens with contrast proofs, components, every page, the Flow Designer, responsive behaviour, accessibility, motion and a phased plan. The aim: a product never wrong about what is live, what a call costs, or what was said and in which language.

## Status: analysis, recommendation, implemented

| Layer | State | Where |
|---|---|---|
| **Analysis** | Done. Production was audited on 2026-09-26 by 16 specialist agents and 11 verifiers, read-only (no saves, calls, payments or sign-ups). | [`../audit/consolidated/`](../audit/consolidated/00-summary.md) |
| **Recommendation** | Done and final for v1: the direction, foundations and generated tokens, component, page, Flow Designer, responsive, accessibility and motion specs, the critique record and the implementation plan. | this folder |
| **Reference material** | The HTML files are **reference mocks**, not product code. The 23 current mocks link `tokens.css` → `base.css` → `components.css` and pass `components/check-mocks.mjs` (checked 2026-09-27); the three in `directions/` are archived. PNGs are their renders. A static reference prototype built on the same CSS is in [`../prototype/`](../prototype/). | `components/`, `03-pages/`, `04-flow-designer/`, `../prototype/` |
| **Implemented** | **Nothing in the live product.** There was no access to the Vaani source or deploy pipeline; every product file path in these specs is a proposal. | [`08-implementation-plan.md`](08-implementation-plan.md) |

## How to read it

- **Everyone:** this page, then [`00-design-direction.md`](00-design-direction.md) §0–§2 and §9, then [`08-implementation-plan.md`](08-implementation-plan.md) §0–§3.
- **Engineers building a surface:** [`01-foundations.md`](01-foundations.md) and [`tokens/`](tokens/) → [`components/components.css`](components/components.css) and [`components/canonical.html`](components/canonical.html) → the `02-components-*` spec you need → the page or Flow Designer spec for your area → the cross-cutting rules in `05`, `06` and `07` → the spec's own acceptance criteria.
- **Which source wins:** foundations over the direction on values; `components.css` and the canonical crops over any other render (D §8.1); [`02-components-gate.md`](02-components-gate.md) over any page's gate table; `05-responsive` §10.6 is the only Flow Designer capability matrix; `06-accessibility` §9.6 is the only canvas key map; foundations §18 is the only token register.
- **Combined documents** (every `.md` with numbered parts) are assembled from their `NAME.partN.md` files, which are canonical. Edit a part, then run `python spec/_tools/reassemble.py`; `--check` reports drift.
- **Citations** use shorthands (D, F, C, N, G, O, SH, CK …) defined in the plan's first table; F-FLOW-001 and similar ids are audit findings.

## The design direction in 10 lines

1. **Sutradhar**, "the one who holds the threads": a calm, exact console for running voice agents; the operator holds the threads, the conversation stays on stage.
2. It keeps **Switchboard's** system (winner of the product and build lenses) and grafts **Bolchaal's** identity and **Clear Path's** guidance.
3. **Graphite chrome, one Neel accent** (indigo dye, `#1F4A94`) for intent; green, amber and red only for real call and record state.
4. **Hanken Grotesk** for everything, JetBrains Mono only for machine tokens, Noto Sans Devanagari for Hindi; nothing below 12 px.
5. A **Neel-ink Baseline** under every desktop screen states only computed facts: the live flow, the number, the wallet with runway, calls in progress.
6. **Nothing dials, bills or goes live without a gate**: blocking and advisory checks, the cost as a range, one keystroke to confirm, no skip.
7. The **Flow Designer** reads Trigger → Logic → Action → Outcome through shape; answer rows carry bilingual examples; edits go to a Draft and reach callers only through Publish.
8. **Dense where you scan** (40 / 32 px rows), **calm where you decide** (a 720 px form column).
9. **Every action has an address** for keyboard, touch and screen reader; focus is never drawn like selection.
10. **Say only what is proven:** a fact the system can't compute is hidden, never simulated, and stated once per viewport.

## The top 10 changes

| # | Change | Fixes |
|---|---|---|
| 1 | Edits go to a Draft; callers hear only what passed the **Publish gate** (validation, diff, where it goes live); opening a flow writes nothing | F-FLOW-001, F-FLOW-002, F-QA-002 |
| 2 | Every billable call goes through the **Call gate**; `c` opens it and never dials; single-key shortcuts can be turned off | F-A11Y-004, F-UX-013 |
| 3 | **Truthful status:** computed validation, a save chip that can fail, no "SYS: ONLINE", no "You're live" before setup passes | F-FLOW-004, F-FLOW-003, F-UX-018, F-UX-006 |
| 4 | **Sign-up and setup work:** `/signup` is real, the organization is created with the workspace, Home tracks "Get your first call live" | F-QA-010, F-UX-001 |
| 5 | **Call reports count calls, not legs**, paginate on the server and open by keyboard | F-QA-005, F-QA-006, F-A11Y-002 |
| 6 | **The Flow Designer is keyboard- and screen-reader-operable:** the Outline editor, Go to [step], Connect to…, one key map | F-A11Y-001, F-FLOW-006 |
| 7 | **One visual language:** a token system with every text pair at AA in both themes, one type system, one Button; the five dialects retire | F-VIS-001, F-A11Y-008, F-A11Y-009 |
| 8 | **One shell and IA:** grouped sidebar, rail, tablet and phone bars, 12 of 12 destinations on phones, one nav config, redirects | F-RWD-001, F-UX-017, F-UX-008 |
| 9 | **Large flows are first-class:** shape grammar, level of detail that never drops below 12 px, frames, Find, Tidy, a test panel | F-FLOW-008, F-FLOW-017, F-FLOW-016 |
| 10 | **An honest public site:** unverifiable `/about` claims removed, one claims sheet with owners and a copy lint, one brand | F-QA-001, F-QA-009, F-QA-013 |

## Table of contents

Renders are linked next to the file they were taken from.

### Start here

| File | What it is |
|---|---|
| [`README.md`](README.md) | This index |
| [`08-implementation-plan.md`](08-implementation-plan.md) | Architecture, phased work items P0–P3 with findings, specs, dependencies, effort and acceptance, the QA plan, risks and every open question |
| [`critique-log.md`](critique-log.md) | The three directions, the judges' scores, the three critics' 68 issues and how each was resolved, the coordination incident |

### Direction and brand

| File | What it is |
|---|---|
| [`00-design-direction.md`](00-design-direction.md) | Sutradhar: principles, brand rules, voice, visual summary, how it applies per surface, anti-patterns, guardrails, must-fix ledger, risks |
| [`00-direction-specimen.html`](00-direction-specimen.html) | The direction's specimen; renders [light](00-direction-specimen-light.png) · [dark](00-direction-specimen-dark.png) · [mobile](00-direction-specimen-mobile.png) |
| [`directions/README.md`](directions/README.md) | The three competing directions, their scores and why Sutradhar was chosen |
| [`directions/operator.md`](directions/operator.md) · [`.html`](directions/operator.html) | Switchboard (superseded); renders [light](directions/operator-light.png) · [dark](directions/operator-dark.png) · [mobile](directions/operator-mobile.png) |
| [`directions/voice.md`](directions/voice.md) · [`.html`](directions/voice.html) | Bolchaal (superseded); renders [light](directions/voice-light.png) · [dark](directions/voice-dark.png) · [mobile](directions/voice-mobile.png) |
| [`directions/clarity.md`](directions/clarity.md) · [`.html`](directions/clarity.html) | Clear Path (superseded); renders [light](directions/clarity-light.png) · [dark](directions/clarity-dark.png) · [mobile](directions/clarity-mobile.png) |
| [`brand/mark.svg`](brand/mark.svg) | The working mark ("the cord"), to be replaced by the commissioned mark |
| [`brand/mark-symbol.html`](brand/mark-symbol.html) · [`brand/mark.html`](brand/mark.html) | The inline symbol every mock uses, and the mark sheet; render [mark.png](brand/mark.png) |

### Foundations and tokens

| File | What it is |
|---|---|
| [`01-foundations.md`](01-foundations.md) | Every token value (type, colour, space, layout, shape, elevation, motion, icons, focus, density), the Next.js/Tailwind wiring, migration, the token register |
| [`tokens/tokens.json`](tokens/tokens.json) | The source of truth (v1.1.0) |
| [`tokens/build-tokens.mjs`](tokens/build-tokens.mjs) | Generates the CSS, the Tailwind theme and preset |
| [`tokens/tokens.css`](tokens/tokens.css) | Generated primitives, themes, aliases, density and motion |
| [`tokens/base.css`](tokens/base.css) | Global rules: root size, focus outline, forced colours, reduced motion |
| [`tokens/legacy-aliases.css`](tokens/legacy-aliases.css) | Old variable names mapped to the new tokens, for one release |
| [`tokens/tailwind.theme.css`](tokens/tailwind.theme.css) · [`tokens/tailwind.preset.js`](tokens/tailwind.preset.js) | Tailwind v4 `@theme` and the v3 preset |
| [`tokens/check-contrast.mjs`](tokens/check-contrast.mjs) · [`tokens/contrast-report.md`](tokens/contrast-report.md) | The contrast check for every intended pair in both themes, and its report |
| [`tokens/foundations.html`](tokens/foundations.html) | Every token rendered; renders [light](tokens/foundations-light.png) · [dark](tokens/foundations-dark.png) · [mobile](tokens/foundations-mobile.png) |

### Components

| File | What it is |
|---|---|
| [`02-components-core.md`](02-components-core.md) | Buttons, fields, Indian phone and money inputs, pickers, choice controls, dates, upload, keycaps, form rules |
| [`02-components-data-nav.md`](02-components-data-nav.md) | Shell navigation, page header, tabs, KPIs, tags and `lib/status.ts`, filter bar, data table, timeline, charts, voice components |
| [`02-components-gate.md`](02-components-gate.md) | The one confirmation-gate system: frame, checks, cost line, behaviour, every variant, server contract |
| [`02-components-overlay-feedback.md`](02-components-overlay-feedback.md) | Dialogs, confirmations, sheets, popovers, menus, the palette, toasts, notices, loading, empty, error and save states |
| [`components/components.css`](components/components.css) | The canonical component CSS every mock and the product's `components/ui` copy from |
| [`components/canonical.html`](components/canonical.html) | Each signature component once, light and dark; [full render](components/canonical-full.png) and crops: [button](components/canonical/button.png) · [tag](components/canonical/tag.png) · [langmark](components/canonical/langmark.png) · [sidebar](components/canonical/sidebar.png) · [rail](components/canonical/rail.png) · [phone](components/canonical/phone.png) · [table](components/canonical/table.png) · [gate](components/canonical/gate.png) · [step](components/canonical/step.png) · [turn](components/canonical/turn.png) |
| [`components/check-mocks.mjs`](components/check-mocks.mjs) | Guard: mocks link the canonical CSS, don't restyle it, use only token colours |
| [`components/core.html`](components/core.html) | Core controls gallery; renders [light and dark](components/core-light-dark.png) · [mobile](components/core-mobile.png) |
| [`components/data-nav.html`](components/data-nav.html) | Data and navigation gallery; renders [shell](components/data-nav-shell.png) · [table](components/data-nav-table.png) · [charts](components/data-nav-charts.png) · [voice](components/data-nav-voice.png) · [mobile](components/data-nav-mobile.png) |
| [`components/gate.html`](components/gate.html) | Gate gallery; renders [light](components/gate-light.png) · [dark](components/gate-dark.png) · [mobile](components/gate-mobile.png) |
| [`components/overlay.html`](components/overlay.html) | Overlay and feedback gallery; renders [light](components/overlay-light.png) · [dark](components/overlay-dark.png) · [mobile](components/overlay-mobile.png) |
| [`components/shell-partials.js`](components/shell-partials.js) · [`.css`](components/shell-partials.css) | The Baseline, TopBar and BottomBar partial script; the stylesheet is a retired pointer (the CSS is in `components.css`) |

### Pages

| File | What it is |
|---|---|
| [`03-pages/00-app-shell-ia.md`](03-pages/00-app-shell-ia.md) · [mock](03-pages/00-app-shell-ia.html) | Shell, IA, routes and redirects, the Baseline, wallet, status, search, menus, first run, Home and the setup track, error pages; renders [desktop](03-pages/00-app-shell-ia-desktop.png) · [dark](03-pages/00-app-shell-ia-dark.png) · [laptop](03-pages/00-app-shell-ia-laptop.png) · [small](03-pages/00-app-shell-ia-small.png) · [menus](03-pages/00-app-shell-ia-menus.png) · [palette](03-pages/00-app-shell-ia-palette.png) · [errors](03-pages/00-app-shell-ia-errors.png) |
| [`03-pages/01-agent-cockpit.md`](03-pages/01-agent-cockpit.md) · [mock](03-pages/01-agent-cockpit.html) | Cockpit and Rep console, the shared call model; renders [light](03-pages/01-agent-cockpit-light.png) · [dark](03-pages/01-agent-cockpit-dark.png) |
| [`03-pages/02-assistant.md`](03-pages/02-assistant.md) · [mock](03-pages/02-assistant.html) | Assistant: plans, approvals, autonomy; renders [desktop](03-pages/02-assistant-desktop.png) · [dark](03-pages/02-assistant-desktop-dark.png) · [empty](03-pages/02-assistant-empty.png) · [laptop](03-pages/02-assistant-laptop.png) · [tablet](03-pages/02-assistant-tablet.png) · [mobile](03-pages/02-assistant-mobile.png) · [dictating](03-pages/02-assistant-mobile-dictating.png) |
| [`03-pages/03-leads.md`](03-pages/03-leads.md) · [mock](03-pages/03-leads.html) | Leads: views, table, bulk calling through the gate, lead sheet, import; renders [desktop](03-pages/03-leads-desktop.png) · [dark](03-pages/03-leads-dark.png) · [mobile](03-pages/03-leads-mobile.png) |
| [`03-pages/04-call-reports-analytics.md`](03-pages/04-call-reports-analytics.md) · [mock](03-pages/04-call-reports-analytics.html) | Call reports and Analytics; renders [desktop](03-pages/04-call-reports-analytics-desktop.png) · [dark](03-pages/04-call-reports-analytics-dark.png) · [mobile](03-pages/04-call-reports-analytics-mobile.png) |
| [`03-pages/05-knowledge-billing.md`](03-pages/05-knowledge-billing.md) · [mock](03-pages/05-knowledge-billing.html) | Knowledge, Billing and the Top-up sheet; renders [light](03-pages/05-knowledge-billing-light.png) · [dark](03-pages/05-knowledge-billing-dark.png) · [mobile](03-pages/05-knowledge-billing-mobile.png) |
| [`03-pages/06-settings.md`](03-pages/06-settings.md) · [mock](03-pages/06-settings.html) | Settings: grouping, save model, danger zones, every page; renders [desktop](03-pages/06-settings-desktop.png) · [integrations](03-pages/06-settings-integrations.png) · [small](03-pages/06-settings-small.png) · [danger, dark](03-pages/06-settings-danger-dark.png) |
| [`03-pages/07-meeting-personal-agents.md`](03-pages/07-meeting-personal-agents.md) · [mock](03-pages/07-meeting-personal-agents.html) | Meetings and Personal agents; renders [desktop](03-pages/07-meeting-personal-agents-desktop.png) · [dark](03-pages/07-meeting-personal-agents-dark.png) · [mobile](03-pages/07-meeting-personal-agents-mobile.png) |
| [`03-pages/08-public-auth.md`](03-pages/08-public-auth.md) · [mock](03-pages/08-public-auth.html) | Public site, pricing, sign-in, sign-up, recovery, invites, the claims sheet; renders [marketing](03-pages/08-public-auth-marketing.png) · [auth](03-pages/08-public-auth-auth.png) · [dark](03-pages/08-public-auth-dark.png) · [mobile](03-pages/08-public-auth-mobile.png) |

### Flow Designer

| File | What it is |
|---|---|
| [`04-flow-designer/01-canvas-and-nodes.md`](04-flow-designer/01-canvas-and-nodes.md) · [mock](04-flow-designer/01-canvas-and-nodes.html) | Canvas, layout, shape grammar, steps, sockets, connectors, keyboard, large flows, the component registry; renders [desktop](04-flow-designer/01-canvas-and-nodes-desktop.png) · [dark](04-flow-designer/01-canvas-and-nodes-dark.png) · [full](04-flow-designer/01-canvas-and-nodes-full.png) |
| [`04-flow-designer/02-config-validation-lifecycle.md`](04-flow-designer/02-config-validation-lifecycle.md) · [mock](04-flow-designer/02-config-validation-lifecycle.html) | Revisions, the interim device draft, the Publish gate, history, inspectors, validation, testing, the Flows list, the Outline; renders [light](04-flow-designer/02-config-validation-lifecycle-light.png) · [dark](04-flow-designer/02-config-validation-lifecycle-dark.png) · [mobile](04-flow-designer/02-config-validation-lifecycle-mobile.png) |
| [`04-flow-designer/flow-grammar.css`](04-flow-designer/flow-grammar.css) | Retired pointer to `components.css` §17; the last full copy is [`_critique/retired/flow-grammar.css`](_critique/retired/flow-grammar.css) |

### Cross-cutting: responsive, accessibility, motion

| File | What it is |
|---|---|
| [`05-responsive.md`](05-responsive.md) | Breakpoints and inner viewports, chrome budgets, shell and component adaptation, touch, the Flow Designer capability matrix, page by page, testing |
| [`05-responsive-shell.html`](05-responsive-shell.html) | The shell per breakpoint; renders [1440](05-responsive-shell-1440.png) · [1024](05-responsive-shell-1024.png) · [768](05-responsive-shell-768.png) · [390](05-responsive-shell-390.png) · [390 More](05-responsive-shell-390-more.png) · [390 sheet](05-responsive-shell-390-sheet.png) · [390 scrolled](05-responsive-shell-390-scrolled.png) |
| [`05-responsive-flow.html`](05-responsive-flow.html) | The Flow Designer per breakpoint; renders [1440](05-responsive-flow-1440.png) · [1440 dark](05-responsive-flow-1440-dark.png) · [1024](05-responsive-flow-1024.png) · [768](05-responsive-flow-768.png) · [768 step](05-responsive-flow-768-step.png) · [390](05-responsive-flow-390.png) · [390 step](05-responsive-flow-390-step.png) |
| [`06-accessibility.md`](06-accessibility.md) · [mock](06-accessibility.html) | WCAG 2.2 AA: finding ledger, focus, keyboard model and key maps, names, forms, live regions, contrast, targets, testing, definition of done; renders [desktop](06-accessibility-desktop.png) · [dark](06-accessibility-dark.png) · [mobile](06-accessibility-mobile.png) |
| [`07-motion-microinteractions.md`](07-motion-microinteractions.md) · [mock](07-motion-microinteractions.html) | Motion tokens and budget, controls, overlays, loading, save states, the shell, canvas, test trace, live calls, reduced motion, bans; renders [desktop](07-motion-microinteractions-desktop.png) · [dark](07-motion-microinteractions-dark.png) · [mobile](07-motion-microinteractions-mobile.png) |

### Process records and tools

| File | What it is |
|---|---|
| [`_critique/workflow-results.json`](_critique/workflow-results.json) | Raw records: directions, judges, critics and revisions |
| [`_critique/handback-revisions.md`](_critique/handback-revisions.md) | Revisions reported outside the workflow, and the coordination incident |
| [`_critique/open-items.md`](_critique/open-items.md) | Component-layer requests and spec text left open after the mocks were converted |
| [`_tools/reassemble.py`](_tools/reassemble.py) | Rebuilds every combined document from its canonical part files (`--check` reports drift) |
| [`_tools/mark_superseded.py`](_tools/mark_superseded.py) | Marks any mock that fails `check-mocks.mjs` with a visible notice |

Outside this folder: the audit summary [`../audit/consolidated/00-summary.md`](../audit/consolidated/00-summary.md) and the static reference prototype [`../prototype/`](../prototype/).
