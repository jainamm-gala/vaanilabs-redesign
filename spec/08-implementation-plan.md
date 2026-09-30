<!-- Assembled from 08-implementation-plan.part1.md, 08-implementation-plan.part2.md, 08-implementation-plan.part3.md, 08-implementation-plan.part4.md, 08-implementation-plan.part5.md, 08-implementation-plan.part6.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

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

---

## 2. Phases at a glance

Five tracks run in parallel: **Platform** (tokens, primitives, shell), **Product FE** (pages), **Flow Designer**, **Backend** and **QA**. Indicative durations assume about 4 front-end, 2 back-end and 1 QA engineer; they are estimates to be re-planned after P0 sizing, not commitments.

| Phase | Indicative length | Platform | Product FE | Flow Designer | Backend |
|---|---|---|---|---|---|
| P0 | 6–8 weeks | P0-00 slice, P0-13 value swap | P0-06, P0-08–P0-11, P0-14–P0-18 | P0-01–P0-04, P0-12 | P0-05 revisions, P0-14 calls, P0-16 sign-up, gate idempotency, P0-09 plan protocol |
| P1 | 10–12 weeks | P1-01–P1-07, P1-16 | P1-08–P1-15 | FD work waits on the node set; I1 stays in service | preflight (B3/B7), rates (B4), setup state, leads stats, conversations |
| P2 | 12–16 weeks | P2-19 dialect removal | P2-01–P2-08 | P2-09–P2-18 | test runs (FD6), text simulation (FD7), integrations (FD8), review state, presence |
| P3 | 4–6 weeks | P3-06 clean-up | P3-04 signatures | P3-03 canvas motion | per-turn timing (B5) if not earlier |

**The spine of dependencies.** P0-00 (primitives slice) → P0-07 (shortcut registry) → P0-08 (CallGate) → P1-06 (all gates). P0-01 → P0-03 → P0-02 (device draft) → P0-05 (revisions, BE) → P2-15 (revision UI). P1-01 (tokens) → P1-03/P1-04/P1-05 (components) → P1-08 (shell) → every page. P2-09 (node set) → P2-10 to P2-18.

---

## 3. P0: safety and critical

### P0-00 · Minimal platform slice for P0 · M · Depends: none
- *Scope:* install Radix Dialog, AlertDialog, Popover and Toast behind `components/ui` wrappers (final APIs, minimal styling); the `ShortcutProvider` skeleton with the registry format; the shell `Announcer` (one polite region); `useUrlState`; `lib/flags.ts` and `lib/capabilities.ts`. P0 items build on these instead of throwaway UI.
- *Resolves:* prerequisites; F-A11Y-005 for every P0 surface (gates, sheets, dialogs).
- *Spec:* O §1.3–§1.9, A11Y §8.4, §12.1, N §0.7.
- *Acceptance:* KB-03 passes on the P0 containers (Tab cycles inside, background inert, Esc closes, focus returns to the trigger, never `<body>`); LR-01 dedupe and throttle hold.

### P0-01 · Opening a flow writes nothing · S · Depends: none
- *Scope:* client-only fix that ships first: no PUT on open or flow switch; the dirty flag ignores hydration, `fitView`, dimension, selection and viewport events; a theme toggle never writes (DESIGN-SYSTEM-08); no flash of the default template before the saved flow loads.
- *Resolves:* F-FLOW-002, F-QA-002 (write-on-open part), F-UX-024, F-FLOW-037.
- *Spec:* FD2 §0.4 (FD3 interim), §4.3; FD1 D9; F §1.2 ("Theme changes never write data").
- *Acceptance:* opening each of the 16 flows, switching between them and toggling the theme twice sends 0 PUT/PATCH/POST (network log); `updated_at` is unchanged.

### P0-02 · Draft and live separated before the backend exists (interim I1) · L · Depends: P0-00, P0-01, P0-03, P0-04
- *Scope:* edits autosave to IndexedDB keyed by flow id plus a base (`updated_at` + content hash); chips `Saved on this device 11:24 am`, `Draft on this device · 3 changes ▾`, live chip `Saved flow`; zero network writes until Publish; **Publish…** opens an interim PublishGate that re-fetches the server copy, blocks with "published from another browser" when the base moved (Re-apply my changes on top · Discard my draft), then writes with today's PUT; storage failure shows `Not saved · this tab only` (danger) and registers `beforeunload`; ACTIVATE becomes the Flows list item "Make my Cockpit default" and never publishes; `/flows` tags "Unpublished edits on this device"; the Baseline shows "Saved flow · {name}".
- *Resolves:* F-FLOW-001 (the live-flow part, critical), F-FLOW-004 (ungated ACTIVATE), F-FLOW-014, F-UX-005, F-UX-024.
- *Spec:* FD2 §4.9 (the only interim), §5, §15.2; FD1 §3.3, §4.4, §19; O §18.1–§18.4 (`device`, `volatile`); G §5.2; D §8.2 "Interim behaviour"; SH §5.2.
- *Acceptance:* FD1 §19 interim criterion (20 edits of every kind send zero writes until Publish in the gate); FD2 §4.9 two-browser case (A's publish can't silently overwrite B's); with IndexedDB blocked the chip never says "Saved on this device".

### P0-03 · A save chip that can fail, and deletes that can be undone · M · Depends: P0-00
- *Scope:* the SaveState machine (saved · dirty · saving · error · new · offline · conflict · device · volatile) with `Couldn't save · Retry` persistent in red; pending saves flush on `pagehide`; Delete and Backspace act only on the canvas and raise an Undo toast (tier 1); one history stack in which adding a step is undoable and Undo is disabled with nothing to undo; no ghost inspector after a delete.
- *Resolves:* F-FLOW-003, F-QA-002 ("Up to date" while failing), F-FLOW-005, F-QA-003, F-FLOW-025, F-FLOW-001 (Backspace part).
- *Spec:* O §18.1, §9; FD2 §4.3, §14.1–§14.4; FD1 §10; D §6.5 Lifecycle.
- *Acceptance:* with the save endpoint failing, the chip reads `Couldn't save · Retry` within one save cycle and never "Saved"; Backspace on a connected step deletes with an Undo toast and ⌘/Ctrl+Z restores the step and its connections; M §7.1 timeline holds.

### P0-04 · Validation status is computed, never permanent · M · Depends: P0-00
- *Scope:* replace "FLOW VALIDATED" with the computed IssuesChip (`No issues` · `1 warning` · `2 errors`), recomputed 300 ms after each change and keyed by flow id; rules from `lib/flow/rules.ts` (the FD2 catalogue that can be computed client-side first: no Trigger, unreachable step, unconnected required answer, empty prompt, invalid number, unknown `{{variable}}`, path with no Outcome, unsupported step); step marks with Go to step; Publish disabled with the reason while errors exist.
- *Resolves:* F-FLOW-004, F-UX-004, F-FLOW-010, F-FLOW-029, F-FLOW-037.
- *Spec:* FD2 §12.1–§12.5; D §6.5 Validation; N §5.3 (Validation domain).
- *Acceptance:* the audit's invalid flows show errors, not a green pill; switching flows clears the previous flow's results; Publish is `aria-disabled` with "Fix 2 errors to publish".

### P0-05 · Revisions backend (BE) · L · Depends: none (starts day one)
- *Scope:* FD1 draft and live revisions with immutable versions (author, note, time); FD2 `If-Match` on draft PUT with 409; FD3 no-op PUT detection; FD4 server validation returning `{ruleId, level, stepId, field, message}` with the client's rule ids (422); FD5 per-trigger resolution (inbound number, batch, Cockpit default) for "Where it goes live"; publish and roll back as new versions. When it ships, `cap.flow_revisions` flips and the UI moves from I1 to Draft/Live (P2-15).
- *Resolves:* F-FLOW-001 (permanent fix), F-QA-002, F-FLOW-012, F-FLOW-014.
- *Spec:* FD2 §0.4, §4.1–§4.8, §5, §6, §12.6; D §8.2 items 1–2; G §6.2 (PublishGate endpoints).
- *Acceptance:* publish creates vN and never changes Live in place; roll back publishes v(N-1)'s content as a new version; a stale `If-Match` returns 409; a shared fixture set gives identical rule results on client and server.

### P0-06 · Status surfaces tell the truth · M · Depends: P0-00
- *Scope:* delete "SYS: ONLINE", the random latency and "RGN", and the Cockpit's idle "LAT"/"SESSION"; add the ConnectionBar for real offline; remove "You're live" from onboarding (show "Finish setup (n of 5)" until P1-10 ships the track); remove the Cockpit's demo Customer Intel and pre-call sentiment ("Not captured"); "Context Saved" only after a successful save; remove the login "Enterprise Security Enabled" badge; the Rep console never marks a rep available on page load (explicit **Go available**; blocked with a sentence if presence isn't available); the wallet banner becomes `role="status"`, not an assertive alert.
- *Resolves:* F-UX-018, F-UX-006, F-UX-003, F-QA-020 (Save Context), F-QA-039, F-UX-023 (presence), F-A11Y-015.
- *Spec:* SH §7, §5.5; D §4.4, P1; CK §2.2, §5.3, §6 (B10); O §10.3.
- *Acceptance:* SH §7.3 (no "SYS", "LAT:", "RGN" or `Math.random` in the shell bundle; offline 12 s shows the ConnectionBar within 2 s and nothing reads "online"); nothing says "live" for the workspace until the five setup checks pass; opening `/rep-console` registers no presence.

### P0-07 · No single key places a call · S–M · Depends: P0-00
- *Scope:* `c` on Leads opens the Call gate (P0-08) and never sends a call request; all single-character shortcuts go through the registry with the **Single-key shortcuts** switch (account menu, `?` dialog, palette); bare `A` select-all becomes `Ctrl/⌘+A` inside the table; the window-level Enter handler that hijacked buttons is removed; shortcuts never fire in fields.
- *Resolves:* F-A11Y-004, F-UX-013 (single-key part).
- *Spec:* A11Y §8.1–§8.5; L §8.1; D P3, P5.
- *Acceptance:* KB-05 (C opens the gate and **no call request is sent**), KB-11, KB-12; with the switch off every registry key is inert and its keycaps disappear.

### P0-08 · Every call goes through the Call gate · L · Depends: P0-00, P0-07; BE: `Idempotency-Key` + `gate_token` on call create and batch create (G §6.2)
- *Scope:* CallGate single and batch from every entry point: Leads row `Call…`, `C`, BulkBar **Call n leads…**, the Cockpit's CONNECT/Test Call (renamed **Place call…** and **Call my phone…**), Home "Call yourself"; Assistant call steps only *open* the gate (P0-09). Interim preflight per G §6.3 (flow live, caller ID, wallet, role, connection; "Rate ₹0.04/s"; one advisory row naming the unchecked items). Wallet ₹0 rule, blocking row if the wallet drops while open, 120 s token, one idempotency key per opening, `⌘/Ctrl+Enter` confirms, focus on the heading, the number validated before the gate (not after the click).
- *Resolves:* F-UX-013, F-A11Y-004, F-UX-026, F-QA-020 (Test Call validation).
- *Spec:* G §1–§6, §5.1, §8; CK §1.1–§1.3, §3.4; L §6.10, §7.4; D P3.
- *Acceptance:* G §8 checks; `C` then Enter never dials; Retry after a timeout returns the same call or batch id; at ₹0 the entry point is `aria-disabled` with "Wallet is ₹0. Top up to place calls." and the gate does not open; a network guard fails any call-create request without `gate_token`.

### P0-09 · The Assistant never acts without approval · M (BE + FE) · Depends: P0-08
- *Scope:* until the plan protocol exists, the Assistant runs Look up and Draft steps only; a suggestion chip never activates anything; Call and Publish steps become "Open Leads with these 12 leads selected" / "Open the draft in Flows"; then ship the server plan protocol (plan first, pause on approval steps, execute only with an approval token, preview hash and idempotency key).
- *Resolves:* F-UX-022.
- *Spec:* AS §10.1–§10.7, §20 items 1 and 5; D §6.6 Assistant.
- *Acceptance:* the AS §10.7 "never does" list is tested; a chip click sends no mutating request; no side effect runs without an approval token.

### P0-10 · Destructive and irreversible actions are guarded · M · Depends: P0-00
- *Scope:* apply O §3.1 tiers where today's guards are wrong: `Delete lead…` moves from under Call into `⋯` in danger text; deleting a live or attached flow needs the typed name (tier 3); Delete room becomes a labelled tier 2 action, not an icon among toggles; the flow toolbar's destructive items move into `⋯`; bulk delete over 50 leads is typed; sign-out has one name, "Sign out…", and warns about unsaved edits (Retry saving as the primary).
- *Resolves:* F-UX-035, F-UX-032, F-FLOW-019, F-UX-038 (delete part), F-UX-029 (sign-out part).
- *Spec:* O §3.1–§3.6; FD2 §14.1; SH §9.3; L §6.9.
- *Acceptance:* no destructive control sits within 8 px of a routine one or at equal weight (F §14); every tier 2–3 dialog names the object and the consequence.

### P0-11 · Records open by keyboard · M · Depends: P0-00, P0-14 (Call reports rows)
- *Scope:* Call reports rows are focusable `<tr>`s with a row link; Enter opens the detail sheet, focus moves to its heading, Esc returns it to the row; the sheet is deep-linked `?call=`; Leads rows are focusable and the lead drawer opens with Enter and receives focus.
- *Resolves:* F-A11Y-002 (critical), F-A11Y-010, F-UX-009 (mouse-only part), F-A11Y-018 (partial).
- *Spec:* CR §2.6, §2.8; L §8; N §7.9; A11Y §9.3.
- *Acceptance:* KB-05 and KB-06 pass with a guard that fails on any pointer event.

### P0-12 · A keyboard path through flow editing · L · Depends: P0-00, P0-03
- *Scope:* on the current builder: steps take focus (roving tab stop, order follows the graph), a 2 px focus outline distinct from the selection treatment, Enter opens the inspector; every answer gets a **Go to [step ▾]** select; `C` opens **Connect to…** (searchable listbox); the **Outline** nested by branch ships as a complete keyboard editor (add, rename, re-point, delete with Undo); the shortcuts sheet becomes a real dialog; edge names use step titles, not ids. The full canvas key map arrives with the new node set (P2-10).
- *Resolves:* F-A11Y-001 (critical), F-FLOW-006, F-A11Y-007, F-A11Y-027, F-A11Y-028, F-A11Y-011.
- *Spec:* FD2 §7.7, §16.1–§16.4; A11Y §9.6–§9.8; FD1 §11; D P5.
- *Acceptance:* KB-07 (a keyboard-only build of Trigger → Question with 2 answers → Speak → Outcome, every answer connected with `C` and with Go to), KB-09; SR-04 Outline part on NVDA.

### P0-13 · Contrast and focus hotfix by value swap (M0) · S · Depends: none
- *Scope:* ship `tokens.css` and `legacy-aliases.css` (F §15.6 step 1): `--text-muted` takes the new `--text-3` (#5F6878), `--saffron` maps to Neel; change `.btn-saffron`'s literal black label to `var(--on-accent)`; add `base.css`'s focus-visible outline rule only (its type rules wait for P1-01); placeholders on `--text-3`.
- *Resolves:* F-A11Y-008, F-A11Y-009, F-A11Y-006, F-A11Y-020 (contrast part), F-VIS-003 and F-VIS-004 (partly).
- *Spec:* F §3.4, §13, §15.6; D §5 Accent and Neutrals.
- *Acceptance:* `check-contrast.mjs` 460 pairs, 0 failures; CT-02 on Cockpit, Leads, Call reports and Flows finds no token-driven text under 4.5:1 (arbitrary-value text is logged for P1–P2); the visual diff of every route is reviewed in both themes.

### P0-14 · Call reports counts every call, once · L (BE M + FE M) · Depends: P0-00; BE: CR B1–B4
- *Scope:* server pagination, search, sort and filter (`offset`/`limit` already accepted); legs grouped into one conversation with a backfill of old pairs; a `kind` enum (Real call · Test call · Browser test) with test calls hidden by default and a "Show test calls" switch; KPIs from `/api/calls/stats` or not rendered; "1–50 of 121 calls · test calls hidden".
- *Resolves:* F-QA-005, F-QA-006, F-QA-014, F-UX-011 (partly), F-UX-009 (50-of-121 part).
- *Spec:* CR §1.1, §1.5, §2.5, §2.13; D §6.4; N §7.11.
- *Acceptance:* the pager reaches call 121; search finds a call outside the newest 50; a browser test counts once; Call reports and Analytics agree for the same range and filters.

### P0-15 · Deep links, dead ends and wrong destinations · M · Depends: P0-00
- *Scope:* Top up and Enable autopay open the wallet top-up (today's Billing presets) instead of Settings › Profile, with the SH §2.4 hash redirects; the three dead Docs links go to real pages; the logo, workspace tile and 404 resolve through the landing function; a member opening Review proposals gets the Forbidden page, not a silent redirect; Leads and Call reports read and write filters, page and the open record in the URL; the 404 renders inside the app shell with a plain sentence.
- *Resolves:* F-UX-002, F-QA-004, F-QA-017, F-UX-029, F-UX-034, F-QA-018, F-UX-031, F-QA-016, F-QA-039 (404 copy).
- *Spec:* SH §2.3–§2.5, §6.4, §15; L §3.1; CR §1.4; N §0.7.
- *Acceptance:* the SH §2.4 CI crawl (every legacy path answers 308 to its target; every in-app hash resolves to an element); a pasted filtered, paged Leads URL restores the same rows and open lead after reload and Back.

### P0-16 · Sign-up works and setup never dead-ends · M–L · Depends: BE PA A1 (create-account API with `mode` and attribution), organization creation
- *Scope:* `/signup` is its own route in Create account mode (Request access in approval mode), never a redirect to `/login`; email verification; `/signup/workspace` creates the organization and workspace with the user as admin, so integrations enable and invites work; `/admin/organizations` redirects to Settings › Organization & team; every "Get started" CTA goes to `/signup`; onboarding no longer scrolls sideways.
- *Resolves:* F-QA-010, F-UX-001 (critical), F-QA-030 (partly), F-RWD-019.
- *Spec:* PA §3.4 (A1), §9, §12; SH §12.1–§12.3; ST §7.2.
- *Acceptance:* PA §9.11; a new account reaches `/home` with a workspace and organization; inviting a teammate succeeds; no integration is disabled for lack of an organization.

### P0-17 · Public claims are verifiable · S (content) + M (claims sheet) · Depends: owner answers PA-Q1–Q3, Q6
- *Scope:* `/about` is unpublished or cut to verifiable facts with an owner; `content/claims.ts` feeds every public page, auth page and email; the copy lint (fails on "certified", "compliant", "SOC 2 compliant", "guarantee", "every Indian language" and the rest of PA §3.3) runs in CI; `/security` is the only page that states compliance status; language counts, OAuth providers and social proof come from the sheet or are removed.
- *Resolves:* F-QA-001 (critical), F-QA-009, F-QA-025, F-QA-034, F-QA-011 (promises part).
- *Spec:* PA §3.3, §6, §19.
- *Acceptance:* copy lint green; every claim has `owner` and `verifiedOn` within 90 days; `/about` names no customer, funding round or certification without documentation.

### P0-18 · Personal data stays out of telemetry (added by the tech lead) · S · Depends: none
- *Scope:* session replay and autocapture off on Cockpit, Rep console, Leads and Call reports; events carry ids and enums only; no analytics cookie before consent.
- *Resolves:* F-UX-045, F-QA-033.
- *Spec:* CK §4.7, §5.11; CR §2.12; PA §4.4.
- *Acceptance:* no replay script loads on those routes; a fresh visit sets no non-essential cookie before the ConsentBar choice.

---

## 4. P1: tokens, components, shell and IA, highest-traffic pages

### P1-01 · Token pipeline and theming in the product (M1) · M · Depends: P0-13
- *Scope:* copy `spec/tokens/` into `design/` and wire `app/globals.css` in the F §15.1 order; `@theme` literals plus `@theme inline` colours, `--spacing: 4px` (the palette reset waits for M5); next/font Hanken Grotesk, JetBrains Mono (no preload), Noto Sans Devanagari by `unicode-range`, and the one-glyph rupee subset, all as variables on `<html>`; delete the 9 unused registrations; `THEME_BOOT` with `data-theme`, `data-motion` and the one-release legacy `html.dark` bridge; `base.css` in full (`html` at 100 %, `font` on `body`); remove the 21 OS-media `dark:` utilities; account menu Theme (System · Light · Dark) and Motion (Match system · Reduce motion).
- *Resolves:* F-VIS-008, F-VIS-036, F-VIS-021, F-VIS-004, F-VIS-002 (the floor's infrastructure), F-A11Y-022 (the reduced-motion infrastructure), DESIGN-SYSTEM-08, DESIGN-SYSTEM-11.
- *Spec:* F §1, §2.2, §15.1–§15.7, §18; D §5, §8.2; A11Y §14.3; M §9.4, §13.2.
- *Acceptance:* CI runs `node design/build-tokens.mjs && git diff --exit-code` then `check-contrast.mjs` (exit 0); CT-03 (`html` computes to 16 px, `meta-12` to 12 px); a unit test that the body font resolves to Hanken; VR-03 (media-query and attribute runs identical); a theme or motion change sends no network write.

### P1-02 · Lint and guard rails, with a ratchet · S–M · Depends: P1-01
- *Scope:* F §15.5 Stylelint/ESLint rules (no hex or colour functions outside `design/`, no arbitrary values, no raw palette classes, no `white/*`, no opacity on text, no `transition-all`, no `outline-none` without a replacement, `font-mono` only in the five token components, no deprecated `mono-20`, no new legacy names, every `var(--…)` names a registered token); A11Y LN-01 (`jsx-a11y`), LN-02 (house rules), LN-03 (duplicate key bindings); no raw `<button className>`/`<input>`/`<select>` outside `components/ui`; `toLocaleString` banned; R §17.3 breakpoint and `hidden` lints; the D §4.4 banned-strings lint. Rules are warnings globally and errors inside migrated folders.
- *Resolves:* F-VIS-020, F-VIS-006, F-VIS-035, F-UX-043, F-UX-016 (lint part).
- *Spec:* F §1.3, §15.5; A11Y §21.1; R §17.3; D §8.2.
- *Acceptance:* every rule has a failing fixture in CI; the migrated-folder list is the ratchet and never shrinks.

### P1-03 · Core controls · L · Depends: P1-01, P0-00
- *Scope:* in C §10 build order: Button and IconButton (codemod `.btn-*` and bespoke buttons), Field and TextInput, Checkbox, Radio, RadioCard, Switch, SegmentedControl, Select with the listbox popover, Kbd, PhoneInput (+91), CurrencyInput (INR, lakh grouping), NumberInput, SearchInput, PasswordInput, Textarea, Combobox, MultiSelect, FlowSwitcher, date and time pickers, Dropzone, SplitButton, ButtonGroup, RefreshButton; form layout and the one validation-timing rule on `react-hook-form` + `zod`.
- *Resolves:* F-VIS-006, F-VIS-018, F-VIS-019, F-A11Y-003, F-A11Y-006, F-A11Y-016, F-A11Y-024, F-UX-025, F-QA-021.
- *Spec:* C §1–§10.
- *Acceptance:* C §10 definition of done for each control (states in the gallery in both themes, snapshots including focus, axe, keyboard walkthrough, touch check at 390 × 844, forced colours, lint clean).

### P1-04 · Overlay and feedback · L · Depends: P0-00, P1-01
- *Scope:* finish the P0 slice and add the rest: Dialog, ConfirmDialog (tiers 2–3), Sheet (record, detail, gate, inspector), Popover, Tooltip, Menu and ContextMenu, CommandPalette, Toast, Notice, WalletNotice, ConnectionBar, StatusText, InlineError, Spinner, Skeleton, ProgressBar, StageProgress, EmptyState, ErrorState with `lib/errors.ts`, SaveState, VersionChip, UnsavedChangesBar.
- *Resolves:* F-A11Y-005, F-A11Y-011, F-A11Y-015, F-VIS-014, F-VIS-016 (elevation), F-VIS-023, F-UX-019, F-UX-030.
- *Spec:* O §1–§18.
- *Acceptance:* AX-02 (axe with each overlay open), KB-03, KB-04; toast timings per O §9; every error state offers Retry where the action can be retried.

### P1-05 · Data components and `lib/status.ts` · L · Depends: P1-03, P1-04
- *Scope:* Tag, StatusTag with `lib/status.ts`, LiveDot, LanguageMark (`name` · `full` · `compact`), CountBadge, PhoneText, Timer and Timecode (Hanken with tabular figures), FilterBar, DataTable on TanStack (density, one tab stop for the body, selection, sticky header, `aria-sort`), BulkBar, Pager, ListRow, TableState, KeyValueList, Avatar, Timeline, StatTile, StatStrip, the chart set (graphite marks, Neel only on the highlighted datum), `lib/format.ts`, `useUrlState`.
- *Resolves:* F-VIS-017, F-VIS-024, F-VIS-013, F-VIS-011, F-VIS-009 (row density), F-A11Y-018, F-A11Y-019, F-UX-031.
- *Spec:* N §0–§11; F §3.6, §14; CR §4.6.
- *Acceptance:* the `lib/status.ts` exhaustiveness check fails the build on an unmapped value; the Tag-with-status-word lint has a failing fixture; A11Y §20.C passes on the gallery table; Leads at 1440 × 900 shows about 16 rows in Standard.

### P1-06 · The gate system, complete · M · Depends: P0-08, P1-04; BE: CK B3 / L B7 (preflight), CK B4 (rates)
- *Scope:* `GateHost`, `useGate`, `useGatePreflight`; the full preflight when `cap.call_preflight` is true (calling hours in IST, DND n of n clear, recently called auto-skipped with Include, language match, cost as a range from the per-second rate and median duration, runway); batches land in Cockpit › Up next as Scheduled with Pause and Cancel; the PublishGate's full layout (checks, changes, where it goes live, note) wired to revisions when `cap.flow_revisions` is true; SetupTrack. AddAgentGate and the form gates ship with their pages (P2-06).
- *Resolves:* F-UX-013 (full pre-flight), F-A11Y-004 (completion).
- *Spec:* G §1–§8; D P3; L §6.10; CK §3.4; FD2 §5.
- *Acceptance:* G §8; SR-05 (hear readiness, cancel; repeat with shortcuts off); MN-06 (no single switch-scan step can dial or publish).

### P1-07 · Voice components · M · Depends: P1-05
- *Scope:* CallStateTag, CallStepper, CallHeader (the bounded 3-cycle pulse on the focal call only), LineQuality, TurnRow (`lang` on every turn, Devanagari at 15/26, the step link in plain words), TranscriptFeed (final turns announced, at most one every 2 s; Jump to latest), RecordingPlayer (plain track; the talk-strip variant is P3-04), VoicePicker, LevelMeter (moves only on real audio).
- *Resolves:* F-A11Y-014, F-VIS-029, F-UX-010 (transcript placement), F-A11Y-022 (live indicators).
- *Spec:* N §12; D §6.2; M §12; A11Y §12.
- *Acceptance:* LR-01 (a 3-minute scripted call yields one message per state change and at most one turn per 2 s); SR-02 on NVDA and VoiceOver.

### P1-08 · Shell and information architecture · L · Depends: P1-03, P1-04, P1-05
- *Scope:* `lib/nav.ts`; `AppShell` with the skip link and landmarks; the Sidebar with the thread (≥ 1280, 232 px); the Rail (1024–1279, expands as an overlay with a scrim; 44 px items that scroll on coarse pointers); TopBar and NavSheet (tablet); BottomBar (Cockpit · Leads · Call reports · Flows · More) and the MoreSheet reaching all 12 destinations (phone); PageHeader (56 px, one H1, at most one primary); `<title>` and route announcements; the workspace switcher; the account menu (profile, theme, motion, shortcuts, `Sign out…`); ⌘K Search or jump; the 308 redirect table and the landing function; 404, 403 and error pages inside the shell; loading inside the shell (skeleton after 200 ms); removal of the full-screen noise overlay.
- *Resolves:* F-RWD-001, F-UX-008, F-UX-007, F-UX-017, F-UX-027 (navigation part), F-UX-029, F-UX-030, F-VIS-005, F-VIS-015, F-VIS-032, F-VIS-033, F-VIS-034, F-RWD-005, F-A11Y-012, F-A11Y-013, F-A11Y-017, F-QA-007, F-QA-038, F-UX-048.
- *Spec:* SH §2–§4, §8–§10, §15–§16; N §1–§2; R §2, §4; D §6.1.
- *Acceptance:* SH §3.10, §4.5, §8.6, §9.5, §15.3; R §17.2 check 2 (every destination in ≤ 2 activations at 320, 390, 720 × 450, 844 × 390 and 1024 × 768); KB-01, KB-02; at 1366 × 657 and 1280 × 609 with a fine pointer every nav item is visible without scrolling.

### P1-09 · Baseline, BaselineChip and the wallet signals · M · Depends: P1-08, P1-15
- *Scope:* the 28 px Neel-ink Baseline from `lib/baseline-copy.ts` (live flow and version, inbound number, wallet with runway, calls in progress, your call timer; Shortcuts and Search); the fold to the BaselineChip at a viewport height of 720 px or less; TopBar chips below 1024 (call state and wallet as two chips); wallet states computed server-side; WalletNotice only where there is no Baseline; the 42 px banner deleted; `openTopUp({ source })` everywhere.
- *Resolves:* F-UX-028, F-UX-002, F-QA-036, F-A11Y-015, F-RWD-013, F-UX-018 (its replacement).
- *Spec:* SH §5–§7; O §10.2; D §6.1; R §4.3.
- *Acceptance:* SH §5.7 (the Baseline is byte-identical for the same state on every page), §6.5; R §17.5 BaselineChip checks at 1366 × 657, 1366 × 625 and 1280 × 609; nothing in the Baseline is announced except state changes.

### P1-10 · Home and the setup track · M · Depends: P1-06, P1-08; BE: setup-state endpoint (D §8 item 8)
- *Scope:* `/home` is the landing route while setup is incomplete; the SetupTrack's five steps computed by `GET /api/setup` (publish a flow, verify the calling number, add money, call yourself, import leads or connect inbound); the SetupCard in the sidebar, NavSheet and More, hidden while Home is open; one heading (the 40 px first-run display); "Live" only after all five pass; step 1 links the template gallery when P2-17 ships and today's template until then.
- *Resolves:* F-UX-006, F-UX-001 (tracking part), F-RWD-019.
- *Spec:* SH §12–§14; G §5.3; D §6.1, §6.6.
- *Acceptance:* SH §13.10; the track's counts come from the server and survive a reload on another device.

### P1-11 · Cockpit · L · Depends: P1-06, P1-07, P1-09; BE: CK B1, **B7 before the card**, B8, B12
- *Scope:* the Ready to call card (Contact, Flow with version, Voice, Language, inline readiness) with **Place call…** and **Talk in browser**; session-only overrides, so the pickers never write the account default ("Make default" is a separate link); the call card (stepper, cost so far, line quality; Now in the flow and Captured so far hidden until CK B5/B6); the transcript in turn rows; wrap-up with **Save and next**; the ≥ 1440 Calls column and the switcher below it; tablet tabs and the phone stack with a sticky 44 px bar; End call without confirmation, as a danger outline.
- *Resolves:* F-UX-003, F-UX-014, F-UX-026, F-VIS-007, F-VIS-029, F-VIS-030, F-RWD-002, F-A11Y-014, F-QA-037.
- *Spec:* CK §0–§4, §6, §7; R §11; D §6.2.
- *Acceptance:* CK §4.8; R §11.8; with Contact empty the primary names what is missing.

### P1-12 · Leads · L · Depends: P1-05, P1-06; BE: L B1, B2, B4–B6, B8
- *Scope:* the header (Export, Import…, New lead); views with pipeline-wide counts; the toolbar count with its breakdown popover; FilterBar with 6 px tokens; the DataTable (at least 10 Standard rows at 1366 × 657; the Language column hidden until L B3); row actions; BulkBar with **Call n leads…**; the 440 px lead sheet, deep-linked, with Delete in the overflow; the Call gate configuration; New lead; Import with a mapping preview and row-level errors; Export; phone ListRows (at least 8 at 360 × 780).
- *Resolves:* F-VIS-009, F-QA-015, F-QA-016, F-QA-022, F-UX-032, F-A11Y-010, F-A11Y-018, F-A11Y-024, F-RWD-011, F-RWD-012, F-VIS-017.
- *Spec:* L §0–§13; D §6.3; R §12.10.
- *Acceptance:* L §13; KB-05; SR-05. *Decision taken here:* the direction's toolbar count and popover (D §6.1, §6.3) replaces the 32 px "In this view" ViewSummary band that L §6.3 and CR §4.1 still describe; the ViewSummary facts move into the popover (§8, open item).

### P1-13 · Call reports, complete · M · Depends: P0-14, P1-05, P1-07; BE: CR B5 (review state), B7
- *Scope:* anchored columns (at most 9 by default; Sentiment as icon and word, untinted); the views (All · Needs review · Positive · Negative · Mixed · Unscored); the 560 px call detail sheet (header with "2 legs" disclosed when relevant, AI summary, captured fields, topics, transcript in turn rows with timecode seek, the plain recording track); the review run (**Mark reviewed and next**, snapshot navigation, "All 9 calls reviewed"); Re-analyse and Download in the overflow; the tablet and phone list with a full-height sheet.
- *Resolves:* F-UX-009, F-UX-010, F-VIS-027, F-UX-046, F-RWD-004, F-RWD-009, F-RWD-010.
- *Spec:* CR §2; D §6.4; R §12.11.
- *Acceptance:* CR §2.13 including the review-run checks; KB-06; SR-03.

### P1-14 · Flows list · M · Depends: P1-05, P0-02; BE: FD5, FD9
- *Scope:* the list with Status (`Live v7`, `Draft · 3 changes`, `Unpublished edits on this device`), Used by (from FD5, else "Your Cockpit default"), unique names (FD9; until then a `flow_7c21` suffix on duplicates), New flow, Make my Cockpit default, Duplicate, Rename and visibility with a clear meaning of Private.
- *Resolves:* F-VIS-037, F-FLOW-012, F-FLOW-014, F-UX-005.
- *Spec:* FD2 §15.1–§15.5.
- *Acceptance:* FD2 §23 list items; no two rows read the same.

### P1-15 · Top-up sheet (money gate) and the Wallet tab · M · Depends: P1-04, P1-06; BE: KB BL1 (rates), BL3 (quote)
- *Scope:* the TopUpSheet (UPI first, ₹100 / ₹500 / ₹1,000, a custom amount validated against the provider minimum, the resulting runway before paying, the pending and failed states); the Wallet tab (balance in `num-28` with runway); the app-wide `?topup=1` handler, which returns focus to the control that is now enabled.
- *Resolves:* F-UX-002, F-QA-004, F-UX-021 (wallet part), F-QA-021 (amount validation).
- *Spec:* KB §2.3–§2.7; G §5.6; SH §6.4.
- *Acceptance:* KB §2.18 wallet and top-up items; SR-06; topping up from inside a Call gate keeps the gate's payload and offers to reopen it (G §4.4 rule 6).

### P1-16 · Close the reference component gaps before copying the layer · M · Depends: none (design-system owners; runs alongside P1-03 to P1-07)
- *Scope:* resolve the 39 requests the mock-conversion helpers left in [`_critique/open-items.md`](_critique/open-items.md): merge into `components.css` (or decline with a note) the DataTable open-row state, ListRow selection, the Gate header close slot, scope and choice rows and phone bottom-sheet variant, a `[data-density="touch"]` hook, a responsive PageHeader, a compact phone TurnRow, the start-aligned empty state, a busy button that keeps its variant colour (M MD5), `.spin` on `--dur-spin` with the clashing keyframe names fixed, the CallStepper current step while dialling, canvas drag and connect-target states, and canonical versions of LevelMeter, Switch, the tab indicator, Tooltip, Toast, Connect to…, the Outline row, the skip link, StageProgress and the text field; stop `shell-partials.js` pulsing the Baseline and TopBar live dots (M: static); settle the two dimension conflicts in §8.3 (S12, S13).
- *Resolves:* no audit finding directly; it prevents each product team re-inventing these pieces (F-VIS-001, F-VIS-006 drift).
- *Spec:* D §8.1; `components/components.css`; `_critique/open-items.md`; M §3.2, §12.2.
- *Acceptance:* every request is merged or declined; `check-mocks.mjs` stays at 0 problems; no mock keeps a page-local component class; the canonical crops are re-rendered.

---

## 5. P2: the remaining pages and the Flow Designer upgrades

### Remaining pages

**P2-01 · Analytics** · L · Depends: P1-05; BE: CR B2, B8
- *Scope:* the StatStrip (one hairline-divided band, trend on hover or focus only), ReportSections in a ReportGrid (no cards, no box-in-box), graphite single-series charts with Neel only on the highlighted datum, the 24-bar hour chart, drill-down into Call reports with the same filters, `lib/metrics.ts` shared with Call reports, the range control, stale and degraded Intents states, the flow drop-off with step links; phone: compact strip, chart text ≥ 12 px, no sideways pan.
- *Resolves:* F-VIS-010, F-VIS-011, F-VIS-012, F-UX-011, F-UX-036, F-QA-019, F-RWD-008, F-UX-048.
- *Spec:* CR §3, §4.2–§4.7; N §11; R §12.12. *Acceptance:* CR §3.12; totals equal Call reports for the same scope.

**P2-02 · Knowledge** · M · Depends: P1-05
- *Scope:* the sources table with an indexing status sentence per file, Add knowledge, the source sheet, Test a question, Proposals for admins only, vendor names removed, Delete in the overflow (tier 2 when a flow uses the file).
- *Resolves:* F-UX-033, F-UX-016 (vendor names), F-UX-034, F-RWD-016. *Spec:* KB §1. *Acceptance:* KB §1.18.

**P2-03 · Billing, remaining tabs** · M · Depends: P1-15; BE: one rates endpoint for the app, `/pricing` and the docs; the payment provider's mandate API
- *Scope:* Usage (calls, not legs; test calls separate), Plans (one billing-unit sentence), Invoices (paginated, download), Autopay (Off · On · Paused with Retry · Needs mandate renewal), the Plan change and Autopay money gates.
- *Resolves:* F-UX-021, F-QA-011 (rates), F-QA-006 (usage). *Spec:* KB §2.8–§2.18; G §5.6. *Acceptance:* KB §2.18.

**P2-04 · Settings** · L · Depends: P1-03, P1-04, P1-08
- *Scope:* the 200 px grouped sub-nav and 720 px column; the per-section save model (SectionFooter, UnsavedChangesBar, navigation guard); Overview, Profile, Organization & team, Notifications, Integrations (ServiceMark, no letter tiles), Assistant, Phone setup (inbound number, caller ID, transfer, test call), Security (password, two-factor, sessions), API keys, Webhooks, Embed (the corrupted snippet fixed), Activity, Export, Delete (typed, 7-day grace); ReauthDialog.
- *Resolves:* F-UX-012, F-UX-015, F-UX-020, F-QA-008, F-UX-027, F-UX-041, F-UX-042, F-QA-023, F-UX-044, F-UX-047, F-VIS-031, F-VIS-034. *Spec:* ST §0–§17. *Acceptance:* ST §13.

**P2-05 · Assistant** · L · Depends: P0-09, P1-06; BE: AS §20 items 2–10
- *Scope:* conversation turns, activity rows, answer blocks, the composer (keeps the user's words, attachments), plans and the plan panel, the ApprovalCard with the autonomy modes, Call and Publish steps that launch gates through `useGate`, Dictate (only with an approved speech service), history, every state.
- *Resolves:* F-UX-022 (the UI), F-RWD-015. *Spec:* AS §0–§21. *Acceptance:* AS §21.

**P2-06 · Meetings and Personal agents** · L · Depends: P1-06, P1-07
- *Scope:* rooms by title with state sentences and stale flags, Start a meeting (form gate), the room sheet, past meetings with notes as turn rows, Generate a deck, AddAgentGate; Personal agents with the blocking prerequisite first, templates, Waiting for you, task states, New task (form gate), agent settings and autonomy; consumer capabilities hidden; the Meeting Agent violet removed.
- *Resolves:* F-UX-037, F-UX-038, F-UX-039, F-UX-040, F-QA-024, F-RWD-006, F-RWD-007, F-VIS-004 (violet). *Spec:* MP §1–§4; G §5.4–§5.5. *Acceptance:* MP §1.18, §2.18.

**P2-07 · Rep console** · M · Depends: P1-07, P1-11; BE: CK B10 (presence)
- *Scope:* the availability model (explicit Go available, heartbeat, server timeout, auto-offline after missed transfers), the incoming call card, the shared call card and turn rows, errors as sentences with Retry, no internal ids.
- *Resolves:* F-UX-023, F-UX-016 (ids). *Spec:* CK §5. *Acceptance:* CK §5.12.

**P2-08 · Public site and auth** · L · Depends: P0-16, P0-17, P1-01; BE: PA A2–A12
- *Scope:* MarketingLayout on the tokens and Hanken; the hero as a real recorded call in TurnRows; `/pricing` from the public rates endpoint with one primary; `/login` (password manager friendly, magic link, two-factor); verify by link and code; OAuth confirm; forgot and reset; accept an invite; the signed-out 404; the ConsentBar; the other public pages (PA §6); theme in sync on first click; the performance budget.
- *Resolves:* F-VIS-025, F-VIS-026, F-QA-012, F-QA-013, F-QA-026, F-QA-027, F-QA-028, F-QA-029, F-QA-030, F-QA-031, F-QA-032, F-QA-035, F-QA-040, F-A11Y-021, F-A11Y-025, F-A11Y-026, F-A11Y-029, F-RWD-017, F-RWD-018. *Spec:* PA §0–§18; R §12.15–§12.16. *Acceptance:* PA §5.13, §7.12, §8.12, §9.11, §10.4, §17; SR-07.

### Flow Designer upgrades (behind `flow.designer_v2`)

**P2-09 · The new node set and shape grammar** · L · Depends: P1-01, P1-05
- *Scope:* StepNode for Trigger and Outcome (capsule ends) and Logic and Action (8 px rectangles) with four neutral glyph tiles; AnswerRow (label, bilingual examples, 10 px socket with a 24 px hit area, 44 px rows on coarse pointers); ResultRow for Actions that can fail; the mandatory fallback row as the only dashed edge; amber "Not connected"; the Outcome line "Lead → Interested" as plain text; connectors with labels only on long edges, hover or selection; the PhaseRuler (one connected bar, counts, emphasis, the live note on its right); level of detail with 12 px counter-scaled text (`--zoom` written on `onMoveEnd`, quantised to 0.05); focus distinct from selection; unreachable and dimmed steps with no opacity on text; the stable `#n`; forced-colours rules.
- *Resolves:* F-FLOW-007, F-FLOW-008, F-FLOW-011, F-FLOW-020, F-FLOW-027, F-FLOW-033, F-FLOW-036, F-A11Y-007, F-A11Y-019 (canvas titles).
- *Spec:* FD1 §4–§7, §20.1; D §6.5; the flow section of `components/components.css`. *Acceptance:* FD1 §19 grammar and level-of-detail items; CT-02 with the unreachable and dimmed fixture; CT-03 at zoom 0.25, 0.5, 0.75 and 1; VR-02; matches `components/canonical/step.png`.

**P2-10 · Canvas keyboard and assistive technology, complete** · M · Depends: P2-09, P0-12
- *Scope:* A11Y §9.6 as the only canvas key map (Tab enters at the first Trigger; arrows follow edges and siblings; Enter; `C`; `A`; Delete with Undo; Alt+Arrow moves; Alt+. / Alt+, for issues; Space selects, Shift+Space toggles; `M` Move mode; `+` `−` `Shift+1/2/0`); the canvas as a `<section>` with a hidden `h2` (no `role="application"`), steps as `role="group"` with `aria-roledescription="step"`, sockets as buttons; the shell `[` off in focus mode.
- *Resolves:* F-A11Y-001 (completion), F-A11Y-028, F-FLOW-006, F-FLOW-024. *Spec:* A11Y §6.1, §9.6; FD1 §11, §16; FD2 §16.5. *Acceptance:* KB-08; SR-04 on the canvas; LN-03.

**P2-11 · Designer layout and chrome** · M · Depends: P2-09, P1-08
- *Scope:* focus mode (sidebar collapses to the rail, the Baseline hides); the 48 px FlowHeader (breadcrumb, Draft chip, SaveState, Live chip, undo, redo, Tidy · IssuesChip, Test, **Publish v8…**; Share, Export, Import, Duplicate and Delete in `⋯`); the tool rail and 280 px left panel (StepPalette with phase descriptions, Outline, Variables, History); the inspector docked at 320 (≥ 1440) or overlaid (1024–1279); the 32 px Problems bar; no full-screen mode.
- *Resolves:* F-FLOW-022, F-FLOW-018, F-FLOW-034, F-FLOW-035, F-FLOW-009, F-RWD-014 (laptop part). *Spec:* FD1 §3, §8, §9; D §6.5. *Acceptance:* FD1 §19 layout items; the canvas keeps about 942 × 537 at 1366 × 657 and 856 × 489 at 1280 × 609 (FD1 §17).

**P2-12 · Large flows** · L · Depends: P2-09; BE: FD1 C1 (frames and notes in the flow JSON)
- *Scope:* Tidy (ELK layered, left to right, respects frames, one undo step), collapsible frames with tints, notes, Find (`⌘/Ctrl+F`, matches `#9` and titles), multi-select with a count and a bulk bar, the neutral minimap from 1280, the saved viewport per flow, the Outline docked for flows over 20 steps, the 150-step performance budget.
- *Resolves:* F-FLOW-017, F-FLOW-021, F-FLOW-023, F-FLOW-026, F-FLOW-008 (large flows). *Spec:* FD1 §9–§12; D §6.5. *Acceptance:* FD1 §19: at Fit on Flow B every visible label shows ≥ 20 characters or the full title and no two are identical; a 1.0 → 0.25 pinch on 150 steps at 4× CPU throttle holds ≥ 50 fps with no long task over 50 ms.

**P2-13 · Inspector, step registry, variables, conditions and voice** · L · Depends: P2-09; BE: FD8, FD10
- *Scope:* the step-type registry (one name everywhere); inspectors for every type (Trigger, Question, Branch with the condition builder, Verify caller, the answer editor with Go to, Speak, Knowledge lookup, CRM lookup, Book meeting, Send WhatsApp, Transfer, End with outcome, Unsupported); PromptField with the variable picker; the Variables panel; Flow settings; voice and language with a step override; integration status rows.
- *Resolves:* F-FLOW-015, F-FLOW-020, F-FLOW-027, F-FLOW-028, F-FLOW-029, F-FLOW-030, F-FLOW-032. *Spec:* FD2 §7–§11. *Acceptance:* FD2 §23 inspector items.

**P2-14 · Validation parity and the Problems surfaces** · M · Depends: P0-04, P0-05 (FD4)
- *Scope:* the full rule catalogue, including integration and template rules; server 422 parity; the ProblemsPanel and Problems bar with Go to step; the gate row "The server runs the same rules".
- *Resolves:* F-FLOW-004 (completion), F-FLOW-010. *Spec:* FD2 §12. *Acceptance:* FD2 §12.6; one shared fixture set, identical results on client and server.

**P2-15 · The revision UI** · L · Depends: P0-05, P2-09
- *Scope:* Draft and Live on real revisions; the version menu; History; Compare with live (with `[` `]` in compare mode); Restore as draft; Roll back (publishes v7's content as v9, toast for 6 s, then the version menu); the 409 conflict sheet; AI draft as a diff (Apply to draft · Discard); leaving, offline and recovery; device drafts from I1 offered as server drafts when `cap.flow_revisions` flips.
- *Resolves:* F-FLOW-012, F-FLOW-031, F-FLOW-019 (reset), F-FLOW-001 (final state). *Spec:* FD2 §4–§6; D §6.5 Lifecycle. *Acceptance:* FD2 §23 lifecycle items; KB-07 publish and roll back; the roll-back text says calls already placed on v8 stay on v8.

**P2-16 · Test and simulate** · L · Depends: P1-06, P2-09; BE: FD6, FD7
- *Scope:* the Test panel (docked, 280 px): text test, browser voice, Call my phone through the CallGate; side effects simulated and said; the test trace on the canvas; the run record; "Test call placed on this draft" feeding the Publish gate's advisory row.
- *Resolves:* F-FLOW-016, F-UX-026. *Spec:* FD2 §13; M §11. *Acceptance:* FD2 §23 test items; M §11.10.

**P2-17 · New flow, templates and re-layout** · M · Depends: P2-09, P2-13
- *Scope:* `/flows/new` with the template gallery (Lead qualification, Site visit, EMI reminder, COD confirmation, Appointment, Support FAQ) drawn as mini strips; instantiation adapted to the workspace with a "Needs:" line; Describe it (AI draft onto a new draft); the blank-flow first view (connected Trigger → Outcome, "No issues"); left to right by default; the opt-in **Re-layout as draft** for the 16 existing flows.
- *Resolves:* F-FLOW-013, F-FLOW-031, F-FLOW-009. *Spec:* FD2 §15.3; FD1 §13; D §6.5 Migration. *Acceptance:* CI in an empty fixture workspace: every template yields 0 errors and at most W08; no live flow is re-laid out on open.

**P2-18 · Designer responsive modes** · M · Depends: P2-11
- *Scope:* Compact (1024–1279); Review (768–1023: Outline or Problems beside a read-only canvas, one Notice string); the phone Outline (read-only, a sticky Test · Publish bar above the BottomBar); coarse pointers at ≥ 1024 with 44 px rows and Navigate / Arrange; Publish never clipped; everything per the R §10.6 capability matrix.
- *Resolves:* F-RWD-003, F-RWD-014. *Spec:* R §10; FD1 §3.2, §17; FD2 §21. *Acceptance:* R §10.13 (after publishing, focus is on Publish and never on `<body>`).

**P2-19 · Dialect removal and the palette reset (M5)** · M · Depends: every P2 page
- *Scope:* codemod counts to zero; the Tailwind palette reset and the raw-palette ban go global; HUD, glass, grid, noise and glow classes deleted; one icon per destination; letter pseudo-icons removed.
- *Resolves:* F-VIS-001, F-VIS-002, F-VIS-020, F-VIS-022, F-VIS-031, F-VIS-035, F-VIS-036. *Spec:* F §15.6 steps 4–6; D §7; M §14.3. *Acceptance:* lint and grep at zero; CT-02 and CT-03 green on every route.

---

## 6. P3: polish and motion

| Id | Item | Effort | Resolves | Spec | Acceptance |
|---|---|---|---|---|---|
| P3-01 | Motion system: 90 / 140 / 200 ms and one easing everywhere; the keyframe allowlist replaces the 36; the overlay motion table; RouteProgress; no hover lift; decide on removing `framer-motion` (M-Q6) | M | F-A11Y-022, F-VIS-022, F-FLOW-011 (marching ants), F-QA-032 (hero entrance) | M §2, §4–§6, §9, §14–§15 | M §14.4, §15.6, §17 |
| P3-02 | Micro-interactions: button busy states, autosaving switches, the save-state timeline, success and error feedback, toast motion, optimistic edits | M | F-UX-019 (feedback polish) | M §3, §5, §7, §8 | M §3.10, §5.4, §8.1 |
| P3-03 | Canvas motion and the test-run trace (once, then static; skipped under reduced motion) | M | F-FLOW-011 | M §10–§11 | M §10.17, §11.10 |
| P3-04 | Data-dependent signatures: the talk strip in the Cockpit card, the recording scrubber as a keyboard slider (±5 s), per-turn language marks, Now in the flow, Captured so far; each behind its capability | S–M each | F-UX-010, F-VIS-029 (completion) | D §6.2, §6.4; N §12.5; CK §3.5; BE CK B5–B6, CR B6 | KB-13; with the capability off each element is absent, never faked |
| P3-05 | Density and view options: Compact density (`⇧D`), the Phase columns view, frame tints, "Scroll to zoom" | S–M | F-VIS-009 (operator density) | D P4; FD1 §4.4, §12 | 20 Compact rows at 1440 × 900 |
| P3-06 | Clean-up (M6): delete `legacy-aliases.css`, the `html.dark` bridge and the 36 keyframes; tokens 2.0.0 drops `mono-20`; remove shipped flags | S | F-VIS-036 | F §15.6 step 6, §15.7 | lint: no legacy names; no flag older than its removal date |
| P3-07 | Brand completion: the commissioned mark replaces the working cord (only the symbol changes), favicon cuts, wordmark; marketing on the same tokens (PA-Q13) | M | F-VIS-025, F-QA-013 | D §3.1, §10 | the mark reads at 16 px; no letter tile anywhere |
| P3-08 | Sign-offs: real devices (R §17.4), SR-01 to SR-07 on NVDA, VoiceOver and TalkBack, JAWS runs, MN-01 to MN-06, the ACR, the `/accessibility` statement | M | the WCAG 2.2 AA claim | A11Y §21–§22; R §17.4 | A11Y §22 "may claim" rule met |

---

## 7. QA plan

### 7.1 Principles

- **Tests pin the truth, not only the pixels.** The P0 fixes are guarded by network assertions that fail the build: opening a flow sends no write; with I1 on, edits send nothing until Publish; `C` sends no call request; a call or batch request without `gate_token` fails; a theme or motion change sends nothing; no side-effecting Assistant request without an approval token.
- **Both themes, both motion settings, inner viewports** (R §2.1), and **both states of every capability flag**: the hidden state is a tested state (§1.8).
- **Nothing real in CI.** Telephony and payments run against sandboxes; no real call, SMS or debit is ever placed. Fixtures use the "Lead 1042 · Pune" convention and never personal names or real numbers.
- **The spec's checklists are the test cases.** Every page spec ends with acceptance criteria; each becomes a tagged test or a manual check with an owner.

### 7.2 The CI pipeline (fail fast, in this order)

| # | Stage | What runs | Blocks merge when |
|---|---|---|---|
| 1 | Tokens | `node design/build-tokens.mjs && git diff --exit-code`; `node design/check-contrast.mjs` (CT-01; **460 required pairs, 0 failures** on the spec copy today; tenant palettes too) | generated files are stale or any required pair fails |
| 2 | Lint | Stylelint and ESLint (F §15.5), `jsx-a11y` LN-01, house rules LN-02, duplicate bindings LN-03, R §17.3 breakpoints and `hidden` rules, the D §4.4 banned-strings lint, the PA §3.3 claims copy lint | any error (the ratchet makes migrated folders strict) |
| 3 | Unit | `lib/status.ts` exhaustiveness; `lib/gate.ts` `summarise` and `sortChecks`; `lib/flow/rules.ts` against the shared fixture set (the same file the server runs); `lib/format.ts`; the shortcut registry; `THEME_BOOT` (storage blocked → System); `useReducedMotion` (both sources) | any failure |
| 4 | Components | every gallery state in light and dark, forced colours and reduced motion; axe per story; visual snapshot per story; the signature components compared with the canonical crops | axe violation or unreviewed diff |
| 5 | Journeys | Playwright journeys §7.4 with the network guards | any failure |
| 6 | Accessibility | AX-01 to AX-03 (every route, 1440, 1024, 768 and 390, both themes), CT-02 (rendered contrast, including an unreachable and dimmed Flow Designer fixture), CT-03 (type floor, canvas at four zooms), KB-01 to KB-14 (with a guard that fails on any pointer event), LR-01, LR-02, TS-01 (also under touch emulation at 390 × 844 and 1024 × 690), VR-01 to VR-05 | any violation (A11Y §21.1) |
| 7 | Responsive matrix | R §17.2 checks 1–9 for every route at every R §17.1 viewport (§7.5) | any failure |
| 8 | Links | the SH §2.4 redirect crawl (every legacy path answers 308 to its target; every in-app hash resolves); an internal link check (no 404 from any in-app `href`) | any failure |
| 9 | Performance | the FD1 §19 canvas budget (150 steps, 4× CPU throttle, ≥ 50 fps, no long task > 50 ms); the PA §5.9 home budget; the font budget (three families, only the regular UI face preloaded) | a regression beyond the budget |

### 7.3 Visual regression

- **Baselines:** every route's default state, one sheet open, one gate open, the empty and error states, in both themes, at 1440 × 900 plus the R §17.1 viewports; the keyboard state (emulated) on phones.
- **Components:** a product gallery page equivalent to `spec/components/canonical.html` renders each signature component once, light and dark side by side, with no overrides; its crops are the component baselines (D §8.1).
- **Determinism:** a fixed clock in IST, seeded data, live regions and timers frozen, fonts loaded before capture, animations off except in VR-03.
- **Review rule:** any diff needs sign-off by the owner of the area; a diff on a signature component also needs the design owner.

### 7.4 Playwright journeys

| Id | Journey | Key assertions |
|---|---|---|
| J1 | Get started → `/signup` → verify → create workspace → Home | `/signup` never redirects to `/login`; the organization exists; inviting a teammate succeeds (P0-16) |
| J2 | Home: publish a template → verify the number (sandbox) → top up (sandbox) → call yourself → import leads | nothing says "live" before all five checks pass; the track's counts come from the server (P1-10) |
| J3 | Leads: filter → select 12 → `C` → Call gate → `⌘/Ctrl+Enter` → the batch appears as Scheduled | no request before confirm; skips shown with Include; the retried request returns the same batch id (P0-08, P1-06) |
| J4 | Wallet at ₹0: every call entry point | `aria-disabled` with the reason; the gate never opens; Top up opens the sheet in place and focus returns to the enabled control (G §4.4, P1-15) |
| J5 | Flow, interim I1: open → 20 edits → Publish gate → publish | zero writes until Publish; the two-browser conflict row blocks a silent overwrite (P0-02) |
| J6 | Flow, revisions: publish v8 → roll back → restore v6 as draft | Live never changes in place; 409 opens the conflict sheet (P2-15) |
| J7 | Flow by keyboard only (KB-07) | build, connect with `C` and with Go to, test in text, publish, roll back (P0-12, P2-10) |
| J8 | Call reports: page 3 → open a call by keyboard → seek from a timecode → Mark reviewed and next → Esc | counts are calls, not legs; focus returns to the row (P0-11, P0-14, P1-13) |
| J9 | Assistant: a request with side effects | a plan appears; nothing runs before approval; a Call step opens the Call gate (P0-09, P2-05) |
| J10 | Deep links: paste a filtered, paged Leads URL with an open lead; reload; Back | the same rows, lead and scroll target return (P0-15) |
| J11 | Phone (390 × 844): reach all 12 destinations from each tab | ≤ 2 activations each; Sign out lives in More, not on a tab (P1-08) |
| J12 | Theme and motion toggles on the Flow Designer | no network write; VR-03 identical for the two reduced-motion sources (P0-01, P1-01) |

### 7.5 Responsive matrix (inner viewports, R §17.1)

| Group | Viewports | What they prove |
|---|---|---|
| Desktop | 1920 × 969, 1440 × 900, 1536 × 730, 1440 × 789 | containers, docked sheets, the Baseline band from 1536 × 730 |
| Office laptops | **1366 × 657**, 1366 × 625, **1280 × 609** | the BaselineChip is the status surface; ≥ 10 Leads rows in Standard (12 at 1366 × 657, 10 at 1280 × 609); every nav item visible with a fine pointer |
| Laptop-S and iPad landscape | 1024 × 768, **1024 × 690** (touch) | Cockpit collisions; coarse-pointer editing with 44 px rows and sockets; the rail scrolls (see §8.4, the coarse-pointer rail decision) |
| Zoomed and tablet | 960 × 485, 834 × 1112, 820 × 1106, 768 × 950, 720 × 450 | Review mode; 200 % zoom maps to the tablet or phone shell (R §2.6) |
| Phones | 390 × 844, 390 × 750, 390 × 664, 360 × 780, 375 × 667, 844 × 340, 320 × 640 | 12 of 12 destinations; ≥ 8 ListRows at 360 × 780; no sideways scroll; sticky bars clear the keyboard and safe areas |

Scrollbars always visible (Windows) and touch emulation for the coarse rules. Real devices are signed off by hand (R §17.4, P3-08).

### 7.6 Design-reference guards (kept in the spec repository)

- `node spec/tokens/check-contrast.mjs`: every intended token pair in both themes; today 460 pairs, 0 failures.
- `node spec/components/check-mocks.mjs`: every reference mock must link `tokens.css` → `base.css` → `components.css`, must not restyle a class `components.css` defines, and must not contain a colour that is not a token. On 2026-09-27 all 23 mocks pass with 0 problems. The product's equivalent is the P1-02 lint (no component re-implemented in a page, no raw colour); the gaps the mocks still work around are P1-16.
- `python spec/_tools/reassemble.py --check`: every combined spec document matches its canonical part files.

### 7.7 Manual checks and cadence

| Check | When |
|---|---|
| SR-01 to SR-07 (NVDA + Chrome, VoiceOver + Safari, TalkBack + Chrome) | changed areas every release; full pass quarterly; JAWS SR-01, SR-03, SR-05 before an ACR |
| MN-01 to MN-06 (speech input, Windows contrast themes, zoom and text size, real devices, Hindi voices, switch access) | each phase exit |
| Real-device sign-off (R §17.4: iPhone, mid-range Android, iPad in both orientations, Windows touch laptop) | before P1 GA of the shell and before P2 GA of the Flow Designer |
| Content review of `content/claims.ts` (owner, `verifiedOn`) | every 90 days, enforced by CI |

### 7.8 Release gating

A11Y §21.4 applies: a **blocker** (a core job impossible by keyboard or screen reader, a stray input that can dial, bill, publish or delete, focus lost to `<body>` in a core flow) or a **high** (an A/AA failure on a core route) blocks a release. The P0 network guards (§7.1) are blockers too.

---

## 8. Risks and open decisions

### 8.1 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Backend items slip (revisions, preflight, conversations, setup state) | the UI they unlock stays hidden; the product looks unfinished while being truthful | capability flags keep hidden states tested; I1 and the interim gate carry P0 safety without the backend; the BE track starts on day one (P0-05) |
| I1 device drafts: local work lost or invisible to teammates | an author loses edits, or a teammate thinks a fix is live | the `volatile` state with `beforeunload`, the "Unpublished edits on this device" tag and Notice, the base check in the gate; keep I1 as short-lived as possible |
| The M0 value swap changes the primary colour app-wide (blue #2F5FE0 to Neel #1F4A94; the dark violet goes) before marketing moves | a brief mismatch between app and marketing | accepted by the direction (D §10, one brand); P2-08 brings marketing onto the tokens |
| The Tailwind palette reset or the new `dark:` variant land too early | un-migrated pages lose utilities or change in dark mode | both held to M5 (§1.7) behind codemod counts at zero |
| shadcn's `--accent` clashes with ours | hover fills turn Neel | rename on install; a lint on `--accent` inside `components/ui/shadcn` |
| Canvas performance with counter-scaled text | janky zoom on 1366 × 768 integrated graphics | quantised `--zoom` on `onMoveEnd`; the perf budget in CI (§7.2 stage 9) |
| The Call gate adds a step for operators | slower calling; pressure to add a skip | one keystroke (`C`, then `⌘/Ctrl+Enter`) and a remembered "tested today"; no setting skips it (D P3) |
| Compliance copy (DND, TRAI calling windows, recording disclosure) unconfirmed | the gate states rules the business hasn't signed off | the gate shows only computed checks; legal review before P1-06 GA (CK-Q7, FD1-Q3) |
| Re-laying out the 16 top-down flows | an author publishes an unwanted layout | opt-in "Re-layout as draft" only, published like any change (P2-17) |
| Spec drift: some page texts disagree (§8.3) and 39 component requests are still page-local in the mocks | a developer builds from the wrong picture, or each team invents its own missing piece | the canonical CSS and crops win (D §8.1); P1-16 closes the component gaps first; settle §8.3 before the owning item starts; `critique-log.md` §6 lists every open item |
| Font payload and Indic scripts | layout shift or slow first paint | three families, `unicode-range`, only the regular UI face preloaded, size-adjusted fallbacks (D §8.2) |

### 8.2 Decisions this plan takes where the specs leave room

1. **Radix (as shadcn source) is adopted** as the primitive layer, plus `cmdk`; React Aria Components only for number, date, time and drop-zone fields, pending C-Q1.
2. **Theme variant:** `@custom-variant dark` on `[data-theme="dark"]`, as generated in `tokens/tailwind.theme.css` and specified in F §1.2. D §8.2's `.dark` line is treated as stale.
3. **Order of safety:** client-only fixes (P0-01, P0-03) and the device draft (P0-02) ship before the revisions backend; the keyboard path through flows ships first as the Outline and Go to selects (P0-12), before the new canvas (P2-10).
4. **Top up opens in place** through `openTopUp({ source })` (SH §6.4, G §4.4); the page specs' `/billing?topup=1` targets are read as the out-of-app fallback only.
5. **The toolbar count and its popover replace the ViewSummary band** (D §6.1, §6.3); the ViewSummary facts move into the popover.
6. **Privacy fixes are P0** (P0-18), although the brief's P0 list does not name them: they are cheap and the exposure is real.

### 8.3 Spec inconsistencies to settle before the owning item starts

| # | Inconsistency | Where | Blocks |
|---|---|---|---|
| S1 | Cockpit route: CK §1.4 and §8 Q1 keep `/dashboard` with a `/cockpit` alias; SH §2.4 redirects `/dashboard` to `/cockpit` with a 308 | CK, SH | P1-08, P1-11 |
| S2 | "In this view" ViewSummary band (L §6.3, CR §4.1) versus the toolbar count (D §6.1, §6.3; L §5.0 budget) | L, CR, D | P1-12, P1-13 |
| S3 | Phone rows per screen: D §6.3 "at least 5 leads" versus R §17.5 and L "≥ 8 at 360 × 780" | D, R, L | P1-12 |
| S4 | Theme variant `.dark` in D §8.2 versus `data-theme` in F §1.2 and the generated CSS | D, F | P1-01 |
| S5 | Top-up target `/billing?topup=1` in CK §2.2, §4.8 and L §2, §6.1, §13 versus in-place `openTopUp` (SH §6.4) | CK, L, SH | P1-09, P1-15 |
| S6 | The flow header's wallet chip shows at ≥ 1280 (FD1 §3.3 row 8); the critics asked for it only when low, blocked or testing | FD1 | P2-11 |
| S7 | Editing during a test run: FD1 §14 allows it; FD2 §14.2 makes Delete inert while a test runs | FD1, FD2 | P2-16 |
| S8 | The setup track shows an optional "Teach your agent" row first with a success tick (SH §13.3) while D §6.1 defines five steps | SH, D | P1-10 |
| S9 | The call chip and CallHeader both carry `role="status"` (N §12.1) while A11Y §12.2 allows only CallHeader's; N §0.5 says aliases are "declared per theme" | N, A11Y | P1-07 |
| S10 | F §16 traceability still describes forced-colours selection as a SelectedItem fill; `base.css`, F §13 and VR-02 use the inline-start bar | F | P1-01 |
| S11 | A11Y CT-01 cites 396 contrast pairs; `check-contrast.mjs` now checks 460 | A11Y | none (documentation) |
| S12 | The socket focus ring is 24 px in A11Y §7.1 but 18 px in `components.css` and FD1 §16.2 | A11Y, FD1 | P1-16, P2-09 |
| S13 | The FilterToken remove icon is 12 px in A11Y §15.2 but 14 px in N and the canonical page | A11Y, N | P1-05 |
| S14 | Home's H1 is "Home" with "2 of 5 done" in its meta (SH D11, §4.2, §13.2); D §6.1 makes the 40 px "Get your first call live" the only heading, with progress stated once | SH, D | P1-10 |
| S15 | The phone PlanBar repeats "Waiting for you" (AS §5.5–§5.6); D P1 says once, on the waiting step | AS, D | P2-05 |
| S16 | Reference code: a busy button turns disabled grey (M MD5 keeps the variant colour); `shell-partials.js` pulses the Baseline and TopBar live dots (M: static) | `components/` | P1-16 |

The full list of critique items still open, including the minor visual ones, is in [`critique-log.md`](critique-log.md) §6.

---

### 8.4 Open questions for the product owner (every one in the spec)

Each question keeps its spec id (for example CK-Q1 is question 1 in CK §8). "→" names the first work item it blocks; questions without an arrow can be answered during the phase that owns their page. Questions the specs mark as closed are not repeated (C-Q2, C-Q3, C-Q8, N-Q1, N-Q12, O-Q3, M-Q5).

**Headline decisions**
- **R-Q1 Tablet editing in the Flow Designer.** v1 ships read-only Review mode at 768–1023 (D §6.5, R §10.2, §10.6). Is a dedicated tablet editor (full-width canvas, step sheet, Navigate / Arrange) worth a v1.1 layout? Decide from `review_edit_attempt` and `large_screen_notice_seen` telemetry. → after P2-18 GA.
- **R-Q2 Phone quick fixes.** Phones are read-only in v1. Should v1.1 allow editing the wording of existing steps and re-pointing answers from the read-only sheet? → after P2-18 GA.
- **Coarse-pointer rail at 1024 × 690 (landscape iPad).** The 12 rail items at 44 px need about 725 px of height, so the list scrolls between the pinned workspace tile and the bottom buttons (N §1.4, A11Y §15.2). A coarse-only tightening (group separators at `margin-block: space-2`, no gap between the 44 px hit areas, tile margin `space-12`) would fit them in about 687 px; it has not been applied. The same table lists device sizes in its coarse row and inner viewports in its fine row, so its units are inconsistent. → P1-08.
- **Compliance cues** (D §8.2 decisions; CK-Q7; FD1-Q3; ST-Q4): the recording disclosure, TRAI calling windows, DND scope and which rules the Call gate enforces regardless of workspace settings. → P1-06 GA.
- **The final mark** (D §3.1, §10): commission it to the brief; only the symbol file changes. → P3-07.

**Foundations (F §17)**
- F-Q1 Self-hosting path and caching for the one-glyph rupee subset. → P1-01
- F-Q2 Tenant theming: which primitives a white-label tenant may override (proposed: Neel only), and whether tenants get their own contrast report.
- F-Q3 Hindi chrome (v2): use `read-15-deva` line heights in dense tables (+2 px per row)?
- F-Q4 Confirm that no separate display face returns for campaigns.

**Core controls (C §11)**
- C-Q1 Accept `react-aria-components` + `@internationalized/date` for number, date, time, multi-select and drop-zone fields, or accept weaker hand-built ones. → P1-03
- C-Q4 Add radio circles to the full-radius list.
- C-Q5 Mark optional fields and leave required ones unmarked (the inverse of the audit's suggestion)? → P1-03
- C-Q6 Is IST fixed for every workspace, or can enterprise workspaces choose a zone for calling hours? → P1-06
- C-Q7 Password policy: minimum length and a breach check. → P0-16

**Data and navigation (N §15)**
- N-Q2 Line-quality thresholds (Good / Fair / Poor) and which leg is measured. → P1-07
- N-Q3 Single-key shortcuts on or off by default for new users (now safe because `C` only opens the gate). → P0-07
- N-Q4 Saved views: personal only, or shared with the workspace, and who may edit a shared view.
- N-Q5 KPI desirability per metric (average duration and spend proposed neutral).
- N-Q6 Remove the per-row Call button on phones (calls from the sheet or the bulk bar)? Confirm with sales operations. → P1-12
- N-Q7 Per-turn timestamps and language; server-computed peaks for the Waveform variant. → P3-04
- N-Q8 Transcript read-aloud on by default (proposed) or opt-in.
- N-Q9 Recording downloads: which roles, and masked or not.
- N-Q10 Hindi bottom-bar labels need a re-measure (English "Call reports" fits 320 px by under 1 px).
- N-Q11 At ≥ 1280, keep the remembered collapse to the rail, or always show the labelled sidebar. → P1-08

**Gates (G §11)**
- G-Q1 May a DND-registered lead be included when consent is recorded, and who may include them? → P1-06
- G-Q2 Are browser tests billed? If so they get the CallGate with a rate line. → P0-08
- G-Q3 A maximum batch size or pacing the gate should state; must very large batches be scheduled? → P1-06
- G-Q4 Is a 120 s gate token right for busy operators, or should the gate re-check silently while open? → P0-08
- G-Q5 Plan changes charged from the wallet or by UPI (decides the PlanChangeSheet primary). → P2-03

**Overlay and feedback (O §21)**
- O-Q1 Wallet "low" threshold (proposed: runway under 60 min at the median rate, editable in Autopay). → P1-09
- O-Q2 Soft-delete windows for leads, steps, notes and rooms; without them those actions move to tier 2. → P0-03, P0-10
- O-Q4 "Request access" needs an endpoint that notifies admins; otherwise "Copy request link".
- O-Q5 Re-authenticate in place (keeps the page) or send to `/login?next=` (depends on the auth provider).
- O-Q6 A notification inbox is out of scope for v1; confirm.
- O-Q7 Offline flow edits need a local draft queue in IndexedDB (shared with I1). → P0-02

**App shell and IA (SH §21)**
- SH-Q1 Roles beyond Admin and Member; who sees the Rep console; can members top up? → P1-08
- SH-Q2 Is sign-up still approved by hand? If not, `/signup/pending` is dropped; if yes, the real review time. → P0-16
- SH-Q3 Low-wallet threshold (same as O-Q1).
- SH-Q4 Which service publishes calling and payments incidents, and can the app read it server-side? → P1-09
- SH-Q5 Can we quote how long number verification takes? → P1-10
- SH-Q6 Keep Home as an overview page after setup, or a setup checklist only?
- SH-Q7 Confirm the activity inbox is v1.1 and that email and WhatsApp alerts cover v1.
- SH-Q8 Keep `/` public with "Open app" for signed-in visitors, or redirect them to the landing route?

**Cockpit and Rep console (CK §8)**
- CK-Q1 Route: keep `/dashboard` with a `/cockpit` alias, or move to `/cockpit` with a permanent redirect (see §8.3 S1). → P1-08
- CK-Q2 Are browser tests billed (proposed free; same as G-Q2)? → P0-08
- CK-Q3 Who sees "Live now"; is there a supervisor role? → P1-11
- CK-Q4 End-call shortcut: none in v1; revisit with operators.
- CK-Q5 Which of Take over, Transfer, Hold and Keypad exist today (hidden until confirmed)? → P1-11
- CK-Q6 Calling hours for test calls to your own number (proposed: not applied). → P0-08
- CK-Q7 Compliance copy: DND scope, TRAI windows, the recording disclosure sentence. → P1-06
- CK-Q8 "Tested today" = a test on this revision that reached Live and lasted ≥ 10 s, today in IST? → P1-06
- CK-Q9 The browser transfer bridge: if it hasn't shipped, hide the Rep console from the nav or show it blocked? → P2-07
- CK-Q10 Presence timing (heartbeat 20 s, server timeout 45 s, ring timeout 20 s). → P2-07
- CK-Q11 Auto-offline after 2 missed transfers, per workspace setting? → P2-07
- CK-Q12 May a draft call a teammate's verified number, or only your own? → P2-16
- CK-Q13 Where the Cockpit default flow is set: the Publish gate, Flows, or Settings. → P1-14

**Assistant (AS §22)**
- AS-Q1 Does `/api/assistant/chat` execute side effects without a confirmation turn today? Assume yes until answered. → P0-09
- AS-Q2 Autonomy mode 2 as the default, the 50-record ceiling for mode 3, and an admin switch to turn the Assistant off. → P2-05
- AS-Q3 Attachment types and limits (10 MB per file, 5 per message, the 8,000-character paste hint).
- AS-Q4 Which speech-to-text service handles English, Hindi and Hinglish; is audio retained? → P2-05
- AS-Q5 Keep voice conversation as Beta or retire it?
- AS-Q6 Chats private to the author? May admins read members' chats? Read-only sharing? (DPDP review)
- AS-Q7 Retention of chats and attachments (90 days proposed); export?
- AS-Q8 Which roles may place calls, publish flows and delete leads? → P0-09
- AS-Q9 May a Call step schedule calls for the next calling window through the gate?
- AS-Q10 Per-user or per-workspace quotas?
- AS-Q11 Reply in Devanagari to Devanagari input and in Hinglish (Latin) to Hinglish input?

**Leads (L §15)**
- L-Q1 Status set migration (Scheduled → Callback due or Interested; Lost → Not interested). → P1-12
- L-Q2 Does the Outcome "Callback" write `callback_at`; may operators set it by hand? → P1-12
- L-Q3 DND with recorded consent; a consent attestation on Import; calling hours per workspace or per flow. → P1-06
- L-Q4 Repeat-call window (24 h proposed), per workspace or fixed. → P1-06
- L-Q5 Batch size and concurrency the gate should state (same as G-Q3).
- L-Q6 The member and admin matrix (Reveal, full-number export, delete, shared views). → P1-12
- L-Q7 Export threshold for a background job (5,000 proposed); email large exports?
- L-Q8 Single-key default (same as N-Q3).
- L-Q9 Per-row calling on phones (same as N-Q6).
- L-Q10 "WhatsApp…" in the sheet footer depends on the WhatsApp template picker.

**Call reports and Analytics (CR §6)**
- CR-Q1 Mean talk time of answered calls, or also a median? → P2-01
- CR-Q2 Does voicemail count as answered (proposed yes for outbound)? → P0-14
- CR-Q3 Bulk actions on Call reports (none in v1; candidates for v2).
- CR-Q4 Should members see Call reports and Analytics; are Recompute and Reveal number admin-only? → P1-13
- CR-Q5 Recording downloads (same as N-Q9).
- CR-Q6 Keep the previous analysis for 30 days after Re-analyse?
- CR-Q7 The definition of Needs review; is Reviewed per workspace or per reviewer? → P1-13
- CR-Q8 Intent clustering windows, frequency and who may Recompute. → P2-01
- CR-Q9 Browser test billing (follows CK-Q2).
- CR-Q10 PDF report: one page per section, or a short executive summary?
- CR-Q11 Is 60 s polling for new calls acceptable, or subscribe to a server event stream? → P1-13

**Knowledge and Billing (KB §5)**
- KB-Q1 Billing unit and rates: per second or per minute rounded up; the Meetings rate (₹2.40/min or 1 paisa/s); one rates endpoint for the app, `/pricing` and the docs. → P1-15
- KB-Q2 GST on top-ups: added on top or included; invoice at top-up or monthly? → P1-15
- KB-Q3 UPI on iOS (app-specific links or QR first); are collect requests still supported? → P1-15
- KB-Q4 Autopay rules under RBI e-mandates (pre-debit notice, limits, validity, threshold debits). → P2-03
- KB-Q5 Plan changes: wallet or UPI, prorated, downgrades at period end (same as G-Q5). → P2-03
- KB-Q6 Roles for knowledge and billing (members add and test knowledge and can top up?). → P1-15
- KB-Q7 A monthly charge for the inbound number? → P2-03
- KB-Q8 Should a flow version pin its knowledge sources? (The spec assumes not.) → P2-02
- KB-Q9 Knowledge limits: file size, files per upload, text length, CSV rows, crawl depth. → P2-02
- KB-Q10 Low-balance threshold (same as O-Q1).
- KB-Q11 Refunds for failed or dropped calls; is unused balance refundable? → P2-03
- KB-Q12 May receipts and invoices name the payment processor? → P2-03

**Settings (ST §16)**
- ST-Q1 Admin and Member only in v1, or a Developer role for keys and webhooks? → P2-04
- ST-Q2 Should members see API keys and webhooks at all? → P2-04
- ST-Q3 Workspace time zone (same as C-Q6).
- ST-Q4 Default calling hours and the regulatory limits the gate enforces regardless of settings. → P1-06
- ST-Q5 The `X-Vaani-Signature` rename with the old header in parallel until a date; keep the `vv_live_` key prefix? → P2-04
- ST-Q6 Rep console transfer fallback at 20 s; configurable? → P2-07
- ST-Q7 Export scope for members and admins. → P2-04
- ST-Q8 What happens to the wallet balance when a workspace is deleted? → P2-04
- ST-Q9 May admins require two-factor for everyone (only if the backend exists)?
- ST-Q10 Self-serve inbound number requests, or allocation by support; the real turnaround. → P1-10

**Meetings and Personal agents (MP §5)**
- MP-Q1 What "29 / 30" free minutes means, what they cover, and the conflicting rates (see KB-Q1). → P2-06
- MP-Q2 What the "Meeting intelligence" toggle produces today and where outputs are stored (hidden until MT3). → P2-06
- MP-Q3 The idle-room reaper rule (stale after 30 min empty, ended 15 min later; does agent-only count as empty?). → P2-06
- MP-Q4 Agent, notes and recording in key-only rooms; can the key be shown again?
- MP-Q5 Offer "No agent, just a room" in the Start sheet?
- MP-Q6 Archive the QA and E2E rooms in production, and add the CI check against test fixtures in production data. → P0-06
- MP-Q7 Roles for meetings and personal agents (start, end others' rooms, see all, lock autonomy). → P2-06
- MP-Q8 Personal-agent numbers: one per user or a pool; do numbers and WhatsApp messages cost money? → P2-06
- MP-Q9 Accounts with Calls on Auto before limits exist: keep Auto or move to Confirm? → P0-09
- MP-Q10 Retention of recordings, transcripts and summaries.
- MP-Q11 Remove Homework analysis, Stock research and Stock trade from the product? → P2-06
- MP-Q12 Is the meeting agent's voice and role editable per workspace, and where?

**Public site and auth (PA §19)**
- PA-Q1 Self-serve prepaid or approval-gated access, and the real review time. → P0-16, P0-17
- PA-Q2 Any free credit for phone calls; sign-up without a card? → P0-17
- PA-Q3 Supported Indian languages, the latency figure and its method, meeting platforms, bring-your-own numbers, data-residency wording. → P0-17
- PA-Q4 Keep Facebook login for a B2B product; is Microsoft planned? → P2-08
- PA-Q5 Meeting PlanCards shown publicly, chosen only after sign-up? → P2-08
- PA-Q6 The Vaani Labs and StarVox Labs relationship for the footer; one sales address and booking link. → P0-17
- PA-Q7 Were the hero recordings made with consenting test customers? → P2-08
- PA-Q8 Does the auth provider support "Trust this browser for 30 days"? → P2-08
- PA-Q9 Password policy (same as C-Q7).
- PA-Q10 Can the `/try` demo agent be imported as a draft flow after sign-up?
- PA-Q11 Expiries: confirmation 30 min, email link 15 min, reset 60 min, invite 7 days. → P0-16
- PA-Q12 Is a Hindi home planned, and who translates the claims?
- PA-Q13 Does marketing move into the same Next.js app or stay a separate build importing `tokens.css`? → P2-08
- PA-Q14 A DPDP review of the ConsentBar wording and of first-touch attribution in `sessionStorage`. → P0-18

**Flow Designer, canvas (FD1 §21.2)**
- FD1-Q1 Mouse wheel pans (proposed) or zooms (today). → P2-11
- FD1-Q2 What migrated End steps record (proposed: nothing until chosen, with a warning rule). → P2-13
- FD1-Q3 Recording-disclosure wording and when it is mandatory (legal review). → P2-13
- FD1-Q4 Subflows ("Go to flow") in v2?
- FD1-Q5 Manual bend points on connectors (not in v1).
- FD1-Q6 Threaded canvas comments with mentions (v2).
- FD1-Q7 Notes visible to everyone with view access (proposed) or editors only? → P2-12
- FD1-Q8 Frames in the Outline (no in v1).
- FD1-Q9 A hard step limit (none; budget 150, warn at 200). → P2-12
- FD1-Q10 Hinglish synonyms in step search ("sawaal" → Question). → P2-11

**Flow Designer, configuration and lifecycle (FD2 §26)**
- FD2-Q1 Is the text simulation billed, and does it run the live model? → P2-16
- FD2-Q2 Who can publish: every editor, or admins with "Request publish"? → P0-02
- FD2-Q3 Voice verification "Speech window 8": seconds or turns? → P2-13
- FD2-Q4 Fixed prompts spoken verbatim, or restated in the caller's language? → P2-13
- FD2-Q5 An "Only me" flow can't be live anywhere; what happens when its owner leaves? → P1-14
- FD2-Q6 Can the runtime report Book meeting "Not booked"; may Question have one named answer? → P2-13
- FD2-Q7 Retention of versions, draft snapshots (24 h) and test runs (30 days). → P0-05
- FD2-Q8 Cockpit default per workspace (proposed) or per user (today)? → P0-02
- FD2-Q9 An "Update lead / CRM update" step in v1?
- FD2-Q10 Several triggers of one kind in a flow, or separate flows? → P2-13
- FD2-Q11 Outbound retries on the batch trigger (proposed) or on the batch in Leads? → P2-13
- FD2-Q12 The largest supported flow (proposed 200 steps; rules in a Worker above 60). → P2-12

**Responsive (R §21), besides R-Q1 and R-Q2 above**
- R-Q3 Publishing from a phone: the same permission as elsewhere (proposed) or admins only. → P2-18
- R-Q4 Web push for live calls or failed publishes (not in v1).
- R-Q5 An installable app (PWA) in v1.1 after the real-device sign-off.
- R-Q6 The landscape-phone Cockpit side-by-side layout, confirmed with operators. → P1-11

**Accessibility (A11Y §25)**
- A11Y-Q1 Confirm the 3-cycle live-dot bound (the alternative is a pause control on every live dot). → P1-07
- A11Y-Q2 Does Meetings render live audio or video in the browser? If so, live captions (1.2.4). → P2-06
- A11Y-Q3 A non-cognitive bot-protection provider for sign-up (3.3.8). → P0-16
- A11Y-Q4 Session lifetime; under 20 hours needs a warning 2 minutes before expiry. → P1-04
- A11Y-Q5 Shortcut remapping (not in v1).
- A11Y-Q6 Publish `/accessibility` with the conformance status once A11Y §22 passes. → P3-08
- A11Y-Q7 Hindi chrome (v2): `lang="hi"` with English terms tagged.
- A11Y-Q8 A JAWS licence and one Android and one iOS test device for QA. → P1 start

**Motion (M §19)**
- M-Q1 Accept three pulse cycles per entry into Live (same as A11Y-Q1).
- M-Q2 Store the Motion preference server-side (needs an endpoint) or per browser. → P1-01
- M-Q3 Tidy: a 200 ms interpolation or an instant re-layout with an Undo toast. → P2-12
- M-Q4 Swipe to dismiss phone sheets in v1, or later.
- M-Q6 Remove `framer-motion` entirely (today it only drives the logo loop). → P3-01
- M-Q7 Spinner and indeterminate-bar loops as sanctioned, request-bound loops (the spec assumes yes).
- M-Q8 When may the Rep console ask for notification permission (never on page load)? → P2-07
- M-Q9 Check the meter thresholds (−45 to −15 dBFS) against real telephony and microphones. → P1-07
