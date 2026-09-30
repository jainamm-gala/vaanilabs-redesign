# 08 · Implementation plan (Sutradhar)

**Status:** recommendation, for the Vaani Labs engineering team · **Date:** 2026-09-27 · **Author:** tech lead (design-to-build hand-off)
**Follows:** every document in `spec/` (the index is [`README.md`](README.md)). **Nothing in this plan has been implemented.** It was written without access to the Vaani source or deploy pipeline; file paths for the product are proposals that match the paths the specs already name.

| Shorthand | Document | Shorthand | Document |
|---|---|---|---|
| D | [`00-design-direction.md`](00-design-direction.md) | SH | [`03-pages/00-app-shell-ia.md`](03-pages/00-app-shell-ia.md) |
| F | [`01-foundations.md`](01-foundations.md) + [`tokens/`](tokens/) | CK | [`03-pages/01-agent-cockpit.md`](03-pages/01-agent-cockpit.md) |
| C | [`02-components-core.md`](02-components-core.md) | AS | [`03-pages/02-assistant.md`](03-pages/02-assistant.md) |
| N | [`02-components-data-nav.md`](02-components-data-nav.md) | L | [`03-pages/03-leads.md`](03-pages/03-leads.md) |
| G | [`02-components-gate.md`](02-components-gate.md) | CR | [`03-pages/04-call-reports-analytics.md`](03-pages/04-call-reports-analytics.md) |
| O | [`02-components-overlay-feedback.md`](02-components-overlay-feedback.md) | KB | [`03-pages/05-knowledge-billing.md`](03-pages/05-knowledge-billing.md) |
| FD1 | [`04-flow-designer/01-canvas-and-nodes.md`](04-flow-designer/01-canvas-and-nodes.md) | ST | [`03-pages/06-settings.md`](03-pages/06-settings.md) |
| FD2 | [`04-flow-designer/02-config-validation-lifecycle.md`](04-flow-designer/02-config-validation-lifecycle.md) | MP | [`03-pages/07-meeting-personal-agents.md`](03-pages/07-meeting-personal-agents.md) |
| R | [`05-responsive.md`](05-responsive.md) | PA | [`03-pages/08-public-auth.md`](03-pages/08-public-auth.md) |
| A11Y | [`06-accessibility.md`](06-accessibility.md) | M | [`07-motion-microinteractions.md`](07-motion-microinteractions.md) |

Finding ids (F-FLOW-001, F-QA-005 …) are the audit's, in `../audit/consolidated/`. Backend ids (FD1–FD12, B1–B12, A1–A12) are the ones the page specs define.

---

## 0. How to read this plan

**Priorities.**

| Phase | Meaning | Exit rule |
|---|---|---|
| **P0** | Safety and critical defects: things that bill, dial, go live, lie or lock people out. Ships first, largely on the old visuals. | All 5 critical findings closed; no single key or click can dial, bill or publish; opening a flow writes nothing; Call reports counts match the server; `/signup` works; `/about` makes no unverifiable claim; no A11Y §21.4 *blocker* on a core job. |
| **P1** | Tokens, components, shell and IA, and the highest-traffic pages (Home, Cockpit, Leads, Call reports, Flows list, Top up). | Token CI green; every route inside the new shell; 12 of 12 destinations reachable at 320 px; the P1 pages built only from `components/ui`; axe 0 on those routes in both themes. |
| **P2** | The remaining pages and the Flow Designer upgrades (new node set, revisions UI, large-flow tooling, test panel). | Every route migrated; no legacy dialect class left; the Tailwind palette reset on; the product can claim WCAG 2.2 AA (A11Y §22) except for P3 items. |
| **P3** | Polish and motion, data-dependent signatures, clean-up. | Legacy alias layer deleted; keyframe allowlist enforced; real-device and screen-reader sign-off; accessibility statement published. |

**Effort.** S ≤ 3 engineer-days · M ≈ 1–2 engineer-weeks · L ≈ 3–6 engineer-weeks (split into tickets before starting). "BE" marks backend work; the rest is front end unless stated.

**Every work item** lists: scope · audit findings resolved · spec reference · dependencies · effort · acceptance criteria. Acceptance criteria restate the specs' own checklists where they exist; the spec's checklist is the full list and wins on detail.

**The rule behind the order (D §8.2).** The truthful UI depends on backend facts. Until a fact exists, its UI is **hidden, not simulated**. So each item names its backend dependency, and the capability flags in §1.8 decide what renders.

---

## 1. Architecture

### 1.1 Folder structure (proposed; names follow the specs)

```
design/                       copied from spec/tokens/, generated files committed
  tokens.json  build-tokens.mjs  check-contrast.mjs
  tokens.css  base.css  legacy-aliases.css (one release)  tailwind.theme.css
app/
  globals.css                 imports: tailwindcss → tokens → base → legacy-aliases → tailwind.theme (F §15.1)
  layout.tsx                  next/font variables on <html>, THEME_BOOT (F §15.3)
  (app)/layout.tsx            AppShell + GateHost + Announcer + ShortcutProvider + TopUp handler (SH §3.3)
  (app)/home | cockpit | rep-console | assistant | meetings | personal-agents
  (app)/flows | flows/[id] | knowledge | leads | call-reports | analytics | billing/[tab] | settings/[page]
  (auth)/login | signup | signup/verify | forgot-password | reset-password | invite/[token]
  (marketing)/…               MarketingLayout (PA §4.1)
components/
  ui/                         Radix/RAC wrappers + core controls (C §1.2), core.css (C §1.3)
  ui/overlay/  ui/feedback/   O §1.9 file list
  data/                       Tag, StatusTag, LiveDot, LanguageMark, DataTable, FilterBar, BulkBar, Pager, ListRow,
                              KeyValueList, StatTile, StatStrip, Timeline, charts/ (N §0.8)
  voice/                      CallStateTag, CallStepper, CallHeader, LineQuality, TurnRow, TranscriptFeed,
                              RecordingPlayer, TalkStrip, VoicePicker, LevelMeter (N §12)
  shell/                      AppShell, Sidebar, Rail, TopBar, NavSheet, BottomBar, MoreSheet, PageHeader,
                              Baseline, BaselineChip, SetupCard, JumpButton (N §1–§2, SH §19)
  gate/                       gate, gate-checklist, gate-check-row, gate-cost, call-gate, publish-gate,
                              add-agent-gate, setup-track (G §7)
  flow/                       FD1 §20.1 registry: FlowCanvas, FlowHeader, StepNode, AnswerRow, ResultRow, Socket,
                              PhaseRuler, StepPalette, FlowOutline/OutlineRow, IssuesChip, ProblemsPanel,
                              inspector/*, TestPanel, CompareBar
  cockpit/ leads/ billing/ meetings/ agents/ …   page compositions (ReadyToCallCard, TopUpSheet, …)
lib/   nav.ts  status.ts  gate.ts  format.ts  metrics.ts  errors.ts  baseline-copy.ts  shortcuts.ts
       url-state.ts  flags.ts  capabilities.ts  flow/registry.ts  flow/rules.ts (shared with the server)
hooks/ use-gate.ts  use-gate-preflight.ts  use-url-state.ts  use-viewport.ts  use-reduced-motion.ts
       use-announce.ts  use-save-state.ts
content/claims.ts             the one source of public claims (PA §3.3)
```

### 1.2 The layers and what each may import

| Layer | Lives in | May import | Never | Spec |
|---|---|---|---|---|
| 1 · Tokens | `design/` (generated CSS), Tailwind `@theme` | nothing | raw hex, arbitrary values, raw palette classes | F §1, §15 |
| 2 · Primitives | `components/ui/*` wrapping Radix, `cmdk`, React Aria Components | tokens | page data, `fetch` | C §1.2, O §1.9, N §0.7 |
| 3 · Composed components | `components/{data,voice,shell,gate,flow}` | layers 1–2, `lib/*` | `@radix-ui/*` or `react-aria-components` directly; colour or icon decisions for status (they come from `lib/status.ts` and `lib/gate.ts`) | N, G, O, FD1 §20 |
| 4 · Page templates | `components/shell` frames: list page (header · views · toolbar · table · pager), record sheet, settings frame, setup page, focus mode (Flow Designer) | layers 1–3 | new visual primitives | D §6, SH §3, R §3.2 |
| 5 · Pages | `app/(app)/…` + `components/<page>/` | everything above | styling beyond layout; a status word, a gate container, a raw `<button className>` | every 03-pages spec |

Enforcement: ESLint `no-restricted-imports` (layers), `jsx-a11y` + house rules (A11Y §21.1 LN-01/02/03), Stylelint token rules (F §15.5). App code imports only `components/ui`, never a primitive library (C §1.2).

### 1.3 Primitives: adopt Radix (recommended), not a styled kit

- **Radix primitives as shadcn/ui source copies**, restyled to our tokens through the bridge in F §15.4. shadcn's `--accent` is a hover fill and ours is Neel: rename it on install or scope the bridge to shadcn files. Replace shadcn's `ring` box-shadow focus with the `base.css` outline.
- `cmdk` for the command palette and list engines (Combobox, FlowSwitcher).
- **React Aria Components only where Radix has nothing** (NumberField, DateField, TimeField, Calendar, multi-select ListBox, DropZone), always inside Radix overlays (C §1.2). *Open decision C-Q1.*
- TanStack Table v8 + TanStack Virtual (DataTable), `d3-scale` + `d3-shape` + Floating UI (charts), `react-hook-form` + `zod` (forms, F-QA-021), `libphonenumber-js` (PhoneInput), ELK (Tidy), React Flow kept for the canvas, `lucide-react` kept.
- Toasts use `@radix-ui/react-toast`, not Sonner (per-toast politeness, O §1.9).

### 1.4 Theming: `data-theme`, `data-motion`, and the other attributes

| Attribute | Where | Values | Set by | Spec |
|---|---|---|---|---|
| `data-theme` | `<html>` (nestable) | `light` · `dark` | `THEME_BOOT` before first paint, from `localStorage['vaani:theme']` (`system` resolves with `matchMedia`); the account menu writes it live | F §1.2, §15.3 |
| `data-motion` | `<html>` | `reduce` or absent | server render when the preference is known, else `THEME_BOOT` from `localStorage['vaani:motion']`; tokens and `base.css` treat it exactly like `prefers-reduced-motion` | F §15.3, A11Y §14.3, M §9.4, §13.2 |
| `data-density` | any data region | `standard` · `compact` (touch is automatic on `pointer: coarse` or < 768) | the user's density setting on data surfaces only (`⇧D`) | D P4, F §14 |
| `data-surface` | toast, tooltip, Baseline | `inverse` | the component | F §1.2 |
| `data-tenant` | `<html>` | tenant id | server; overrides only `--neel-*`, with its own contrast run in CI | F §1.2 |

- **One theme mechanism.** Tailwind's `dark:` becomes `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` as generated in `tokens/tailwind.theme.css`; prefer token swaps, keep `dark:` rare. *Direction §8.2 still prints the older `.dark` class form; the plan follows foundations and the generated file (open item, `critique-log.md`).*
- **Migration bridge (one release, recommendation):** `THEME_BOOT` also toggles the legacy `html.dark` class so un-migrated CSS keyed on `:root.dark` keeps working, and migrates `vv:theme` once. Both go when the last legacy page is gone (M5 in §1.7).
- **A theme or motion change never writes data** (today a theme toggle fires `PUT /api/flows/{id}`, DESIGN-SYSTEM-08). Covered by a network guard in CI (§7.1).
- **Reduced motion has two sources and one rule set.** JS reads `useReducedMotion()` (both sources), never `matchMedia` alone (A11Y §14.3, M §13.3).

### 1.5 `lib/status.ts`, `lib/nav.ts` and the other single sources

| Module | Owns | Rule | Spec |
|---|---|---|---|
| `lib/status.ts` | every domain value → word · icon · tone (lead status, call result, outcome, sentiment, flow lifecycle, validation, indexing, autopay, payment, room, notes, Assistant step, task) | `<StatusTag domain value />` has **no** `tone`, `icon` or `label` prop; the map is exhaustive (`satisfies Record<Domain, Record<Value, StatusDef>>`), so a new state fails the build; lint rejects a `Tag` whose text is a status word; a record state is never Neel | N §5.3 |
| `lib/gate.ts` | the check-kind enum, kind → glyph/tint map, `summarise()`, `sortChecks()`, types | pages never map kinds to colours | G §2.1, §6.1 |
| `lib/nav.ts` | the one nav config: label, href, match, icon, group, phone slot, computed badge, roles | drives sidebar, rail, TopBar title, BottomBar, More, H1, `<title>` and ⌘K | N §0.7, SH §2.6 |
| `lib/baseline-copy.ts` | Baseline segment strings and order | exact copy contract; empty segments are left out | SH §5.2 |
| `lib/format.ts` | counts, money (en-IN), durations, timecodes, dates, latency | lint bans `toLocaleString` in components | N §0.7, F §2.5 |
| `lib/metrics.ts` | metric definitions shared by Leads, Call reports, Analytics, Billing | calls, not legs; test calls excluded by default | CR §1.1 |
| `lib/shortcuts.ts` | the single-key registry and the switch | LN-03 fails the build on a duplicate binding in one context | A11Y §8.2–§8.4 |
| `lib/flow/rules.ts` | the validation rule catalogue | the same ids and levels on client and server (422) | FD2 §12 |

### 1.6 The Gate system

- **One component, specified once** (G). Every billable, dialling or go-live action is a gate (O §3.1 tier 4): CallGate (single and batch), PublishGate, SetupTrack (page variant), AddAgentGate, form gates (Start a meeting, New task), money gates (Top up, Plan change, Autopay) and the ApprovalCard (inline, tiers 1–3).
- **Mounting:** one `GateHost` in `AppShell`, so only one gate is ever open; `useGate().open(variant, payload, options)` from anywhere returns the confirmed result (G §7).
- **Server contract:** preflight on open, on Recheck and on scope change → `{ checks, scope, cost, gateToken, expiresAt, checkedAt }`; the token lives 120 s; one `Idempotency-Key` per opening, reused by Retry; the server re-validates at confirm; `402/403/409/422/5xx` map to gate states (G §4.3, §6.2).
- **Global blockers and the wallet ₹0 rule:** the entry point is `aria-disabled` with its reason and the gate does not open; a blocker that appears while open becomes the top `blocking` row (G §4.4).
- **Keys:** `C` opens, `⌘/Ctrl+Enter` confirms, initial focus on the heading so `C` then `Enter` can never dial (G §4.5).
- **Interim (G §6.3):** until the preflight endpoint exists, the gate shows only the checks the server can compute (flow live, caller ID, wallet, role, connection), the cost reads "Rate ₹0.04/s", and one advisory row says what isn't checked yet. Missing checks are never shown as passing.
- **Build order:** `GateCheckRow` → `GateChecklist` → `GateCost` → `Gate` → `CallGate` → `PublishGate` → `SetupTrack` → the rest (G §7).

### 1.7 Migrating incrementally from the five dialects

Today's app renders five visual dialects (F-VIS-001): Terminal/HUD (mono caps, glows, grids), Editorial (Analytics), Violet product (Meeting Agent), Plain SaaS (Assistant, Call reports) and the dark marketing site. The migration is a strangler, route by route, with the token layer first so every page improves on day one.

| Step | What | Phase | Guard |
|---|---|---|---|
| M0 | Value swap: ship `tokens.css` + `legacy-aliases.css`. `--text-muted` becomes AA, `--saffron` maps to Neel, the primary label becomes white (F §15.6 step 1) | P0 | visual diff of every route, both themes |
| M1 | Fonts on `<html>`, three families, drop 9 registrations; `THEME_BOOT` with `data-theme` + legacy class bridge; `base.css`; remove the 21 OS-media `dark:` utilities | P1 | CT-03, font test (F §15.5) |
| M2 | Primitives and components; codemod `.btn-*`, `.input-vani` and bespoke buttons onto `Button`/`Field` (F-VIS-006) | P1 | lint: no raw `<button className>` outside `components/ui` |
| M3 | New shell around every route (old page bodies render inside it), redirects, nav config | P1 | CI crawl of the 308 table (SH §2.4) |
| M4 | Pages, in traffic order: Cockpit, Leads, Call reports, Flows list, Home (P1); Analytics, Meetings, Settings, Billing, Knowledge, Assistant, Personal agents, Rep console, public/auth (P2) | P1–P2 | per-route "migrated" marker: lint rules escalate from warning to error in migrated folders (a ratchet) |
| M5 | Palette reset (`--color-*: initial`) and the ban on raw palette classes become global; delete HUD, glass, grid, noise, glow classes and the `z-index: 9999` noise overlay (F-QA-038) | end of P2 | codemod counts at zero (45 hex literals, 18 hue families, F-VIS-020) |
| M6 | Delete `legacy-aliases.css`, the legacy `html.dark` bridge and the 36 keyframes; tokens 2.0.0 removes `mono-20` | P3 | lint: no legacy names |

Two traps: resetting the Tailwind palette before M5 deletes utilities that un-migrated pages still use, and the new `dark:` variant changes the meaning of any `dark:` class left in old code. Both are held to the step named above.

### 1.8 Feature flags and capability gating

Flags gate **presentation and rollout, never safety**. P0 safety fixes (no write on open, no single-key dial, every call through a gate, Assistant side effects paused) ship unflagged and cannot be switched off.

| Kind | Examples | Evaluated | Removed when |
|---|---|---|---|
| **Capability** (backend truth, drives "hidden, not simulated") | `cap.flow_revisions` (FD1+FD2) · `cap.flow_server_rules` (FD4) · `cap.call_preflight` (CK B3, L B7) · `cap.rates` (CK B4) · `cap.turn_timing` (CK B5, CR B6) · `cap.conversations` (CR B3–B4) · `cap.leads_stats` (L B2) · `cap.setup_state` (D §8 item 8) · `cap.plan_protocol` (AS §20.1) · `cap.presence` (CK B10) · `cap.soft_delete` (L B9, O §21 Q2) · `cap.status_feed` (PA A12) · `cap.review_state` (CR B5) | server, from one proposed `GET /api/capabilities` read at session start and cached | never removed; each becomes permanently true |
| **Rollout** (UI cohorts) | `ui.shell_v1` · `ui.page.<nav-id>` per page · `flow.designer_v2` · `flow.device_draft` (I1; forced on while `cap.flow_revisions` is false) | server, per workspace, internal → beta → all | at the phase exit, with the old code |
| **Kill switch** (operations) | `ks.batch_calling` (stop new batches without a deploy) | server | kept |

Rules: a flag has an owner and a removal date; tests run both states of every capability flag (the hidden state is a tested state); no flag combination may show a UI state the capability says doesn't exist.
