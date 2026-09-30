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
