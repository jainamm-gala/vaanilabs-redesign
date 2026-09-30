# Vaani Labs redesign: static reference prototype

**What it is:** a clickable, static reference implementation of the Sutradhar redesign specification (`../spec/`).
**What it is not:** it is **not the live Vaani Labs product** and not production code. Nothing here was deployed to vaanilabs.in, and nothing in the live product was changed. There was no access to the Vaani source code or deploy pipeline.
**Built:** 27 Sep 2026. Plain HTML, CSS and vanilla JavaScript. No build step, no server, no backend.

| | |
|---|---|
| Direction and rules | [`../spec/00-design-direction.md`](../spec/00-design-direction.md) (Sutradhar) |
| Spec index | [`../spec/README.md`](../spec/README.md) |
| Build plan for the real product | [`../spec/08-implementation-plan.md`](../spec/08-implementation-plan.md) |
| Audit of the live product | [`../audit/consolidated/00-summary.md`](../audit/consolidated/00-summary.md) |
| Engagement report | [`../FINAL_REPORT.md`](../FINAL_REPORT.md) |

---

## 1. What this is (and is not)

- **A working picture of the spec.** Every page follows the page specs in `../spec/03-pages/` and `../spec/04-flow-designer/`, uses the generated design tokens, and draws every component from one shared component layer. Where the specs disagree, the prototype follows the rule order in `../spec/README.md` ("Which source wins").
- **Everything is simulated.** Calls, payments, sign-in, publishing, saving and "server" checks are timers and fixed data in the browser. No call is placed, no money moves and no request is sent. The only network requests are font downloads from Google Fonts.
- **All data is fictional.** One made-up workspace ("Sample Realty", Pune). Names are invented, phone numbers exist only in masked form (`+91 •••••• 4821`), email domains end in `.example`, and "now" is fixed at **Sun 27 Sep 2026, 11:24 am IST** so relative times stay stable. No real customer data from the audit is used.
- **For design review and developer reference.** Use it to see how a screen behaves in each state, at each breakpoint, in light and dark, by keyboard and by touch. Do not ship its JavaScript: `assets/shell.js` stands in for the primitives the plan chooses (Radix, `cmdk`, React Aria; plan §1.3).

---

## 2. How to open it

1. **Double-click `index.html`.** It opens from `file://` in your browser. No install, build or server is needed.
2. Move between pages with the sidebar (desktop), the rail (1024–1279 px wide), the menu button (tablet) or the bottom bar and **More** (phone), exactly as in the designed product. `Ctrl+K` (`⌘K` on a Mac) opens the command palette, which also lists the reviewer-only pages (Component gallery, Sign in, Create account, Reset password, Page not found).
3. **Internet is needed for the fonts** (Hanken Grotesk, JetBrains Mono, Noto Sans Devanagari, and a Noto Sans subset for the ₹ glyph). Offline, metric-matched fallbacks keep the layout stable, but the type will not look as designed.
4. **Browser.** It was tested in Chromium (Chrome and Edge rendering) through Playwright. Firefox and Safari were not tested.
5. **To reset** the remembered theme, motion, sidebar and setup choices, clear the site data for the `file://` origin, or use `?setup=done` (see §4). Preferences are kept in `localStorage` only.

Optional: if your browser restricts `file://` pages, serve the folder with any static server (for example `python -m http.server` inside `prototype/`, then open `http://localhost:8000/`). Every test run used `file://`.

---

## 3. Pages

The 12 destinations of the redesigned navigation, plus Home, auth, error and reference pages. Titles follow `[Record · ]Label · Vaani Labs`.

| File | Destination | What it shows | Spec |
|---|---|---|---|
| `index.html` | **Home** | The default workspace has finished setup, so Home is an overview ("Your workspace is live."). With `?setup=incomplete` it becomes the **setup track**, "Get your first call live" (publish a flow, verify the number, add money, call yourself, import leads), with the "Call yourself" Call gate, the Top-up sheet and the Invite dialog in place. | `03-pages/00-app-shell-ia.md` |
| `cockpit.html` | **Cockpit** | The Ready-to-call card (contact, flow and version, voice, language, readiness), the **Call gate**, a live call card with the call-state stepper, turn rows with language marks, "Now in the flow", captured fields, Take over, Transfer, End call, and wrap-up with Save and next. `cockpit.html?view=rep-console` redirects to the Rep console. | `03-pages/01-agent-cockpit.md` |
| `rep-console.html` | **Rep console** | Explicit availability (**Go available**, never on page load), an incoming transfer, on-call with the shared call card and transcript, wrap-up, audio device checks and error sentences with Retry. | `03-pages/01-agent-cockpit.md` §5 |
| `assistant.html` | **Assistant** | Chats, plans listed as steps, approval cards with autonomy modes, Call and Publish steps that open the real gates, attachments and import, history, and send failures. | `03-pages/02-assistant.md` |
| `agents.html` | **Meetings** (default, `?view=meetings`) and **Personal agents** (`?view=personal-agents`) | Meetings: rooms by title with state sentences and stale flags, Start a meeting (a form gate), room and past-meeting sheets with notes as turn rows, Generate a deck. Personal agents: the blocking prerequisite first, tasks, New task, Waiting for you, agent settings and autonomy. | `03-pages/07-meeting-personal-agents.md` |
| `flow-designer.html` | **Flows** | The Flow Designer on the flow "Site-visit qualifier" (Live v7 with a v8 draft): the 48 px header with Draft chip, save state and **Publish v8…**, the phase ruler and live note, the Trigger → Logic → Action → Outcome shape grammar, answer rows with bilingual examples, the inspector with **Go to [step]**, the Outline editor, Problems panel, Find, frames and notes, Tidy, the **Publish gate**, version history, Compare, Roll back and the **Test panel**. Review mode at 768–1023 px and the read-only Outline on phones. | `04-flow-designer/01-canvas-and-nodes.md`, `02-config-validation-lifecycle.md` |
| `knowledge.html` | **Knowledge** | Sources with an indexing status sentence per file, Add knowledge (file, text, URL, CSV), the source sheet, Test a question, and **Proposals** (`?view=proposals`). | `03-pages/05-knowledge-billing.md` §1 |
| `leads.html` | **Leads** | Views with pipeline counts, search, filter tokens, the toolbar count and its breakdown popover, the lead table (Standard and Compact density), the lead sheet, the bulk bar, the batch **Call gate** (skips, DND, calling hours, cost range) and Import with a mapping preview. | `03-pages/03-leads.md` |
| `call-reports.html` | **Call reports** | Calls counted as calls (not legs), "1–50 of n" pagination, anchored columns, keyboard-openable rows, the call detail sheet (`?call=<id>`) with summary, captured fields, transcript turn rows and recording scrubber, review state and Call back through the gate. | `03-pages/04-call-reports-analytics.md` |
| `analytics.html` | **Analytics** | The StatStrip, single-series charts with a chart palette (Neel only on the highlighted datum), the hour chart, flow drop-off with step links, intents, a range control, table views of each chart, and drill-down into Call reports. | `03-pages/04-call-reports-analytics.md` §3 |
| `billing.html` | **Billing** | Five tabs (`#wallet`, `#usage`, `#plans`, `#invoices`, `#autopay`): balance with runway, the **Top-up sheet** (UPI first, presets, validated amount, runway before paying; opens with `?topup=1`), usage, plan-change and autopay money gates, invoices. | `03-pages/05-knowledge-billing.md` §2 |
| `settings.html` | **Settings** | A grouped sub-nav and 720 px column with 14 sections (for example `#profile`, `#organization`, `#phone`, `#security`, `#api-keys`, `#webhooks`, `#embed`, `#export`, `#delete`), the per-section save model, the unsaved-changes guard, invites, re-authentication and the typed delete. | `03-pages/06-settings.md` |
| `login.html` · `signup.html` · `forgot-password.html` | Auth (no app shell) | Sign in (password or email link), Create account (with verification and workspace steps) and Reset password, with the consent bar. Separate routes with their own H1, as the spec requires. | `03-pages/08-public-auth.md` |
| `404.html` | Error pages | The in-shell error pages: not found, error, forbidden and session expired (switch with its Prototype states card). | `03-pages/00-app-shell-ia.md` §15 |
| `components.html` | Component gallery | Every shared component in every state, light and dark, with its spec reference. Also answers `Ctrl+K` and `?`. | `02-components-*.md` |
| `_template.html` | Page skeleton | The canonical page to copy when adding a page (renders with Leads as the current item). | `_foundation-notes.md` §2 |

---

## 4. Prototype-only controls ("Prototype states")

These controls exist only so reviewers can see every state a spec defines. **They are not part of the design and must not be built into the product.**

- **The "Prototype states" button.** On every app page it is the same muted, dashed button with a sliders icon (class `.proto-btn`), usually in the page header. On narrow screens it folds to its icon or into the page's `⋯` menu ("Prototype states…"). Home and the 404 page show the same switcher as a card, and the auth pages have a small "Prototype states" control too.
- **What it does.** It opens a menu, popover or dialog marked "Prototype only". Each entry reloads the page in one of the states the page spec lists: first use, empty, loading, error, offline, no permission, gate outcomes, save failures, conflicts, and so on. The current state is marked.
- **URL parameters behind it** (you can also type them):

| Parameter | Where | Effect |
|---|---|---|
| `?setup=incomplete` / `?setup=done` | every app page | Shows the setup track, sidebar setup card and setup-driven Baseline, or restores the default finished workspace. Remembered for the session. |
| `?wallet=low` · `empty` · `pending` · `autopay-failed` | every app page | Wallet state for the Baseline, TopBar chip, BaselineChip and every call action (₹0 blocks calling with its reason). |
| `?state=…` | `flow-designer.html` | 29 scenarios in five groups, for example `default`, `loading`, `blank`, `large` (26 steps with frames), `errors`, `save-failed`, `offline`, `conflict`, `interim` (the device draft), `version`, `gate-422`, `gate-409`, `test`, `mic-blocked`. |
| `?demo=…` or `?state=…` | `?demo=` on Home, Cockpit, Rep console, Leads, Knowledge, Assistant, Settings, 404 and the auth pages; `?state=` on Call reports, Analytics, Knowledge, Billing and Agents | Page-specific demo states, for example `after-hours`, `gate-fail`, `wrapup`, `takeover`, `page-error` (Cockpit); `ringing`, `oncall`, `missed`, `net-drop` (Rep console); `not-found`, `forbidden`, `session` (404). The page's Prototype states menu lists every value it accepts. |
| `?view=…` | `agents.html`, `knowledge.html`, `cockpit.html` | Chooses the destination or tab served by a shared file. |
| `?call=` · `?lead=` · `?node=` · `?q=` · `?topup=1` · `?test=` · `?new=1` | various | Deep links: open a call, a lead (add `&gate=call` for its Call gate), a flow step, a prefilled search, the Top-up sheet, a test call or the Test panel, or a new record. |

Other prototype-only behaviour: Sign out, workspace switch and external links (docs, "Back to website") show a confirmation or a toast instead of leaving; the auth footer links (Privacy, Terms, Security, Status) are placeholders.

---

## 5. Things worth trying

- **Keyboard:** Tab from the top (a skip link comes first), `Ctrl/⌘+K` for the palette, `?` for the shortcut sheet, `[` to collapse the sidebar, `/` to focus a page search, `J`/`K`/`X`/`Enter` in Leads and Call reports, `C` to open (never place) a call, `Ctrl/⌘+Enter` to confirm a gate. Single-key shortcuts can be switched off in the account menu.
- **Flow Designer by keyboard:** arrows follow connections, `A` adds a connected step, `C` opens "Connect to…", `Delete` deletes with Undo, `Ctrl/⌘+F` finds steps (including `#9`), `Alt+.` walks the issues. Or edit entirely from the **Outline**.
- **Theme and motion:** the account menu (bottom of the sidebar) or the phone More sheet switch System, Light and Dark, and Reduce motion.
- **Breakpoints:** resize from 1440 to 320 px, or use your browser's device emulation with touch. The shell changes at 1280 (sidebar), 1024 (rail), 768 (top bar and nav sheet) and below 768 (bottom bar and More). Short windows (≤ 720 px tall) fold the Baseline into a header chip.

---

## 6. How the folder is organised

| Path | Contents |
|---|---|
| `*.html` | The 17 pages and `_template.html` |
| `assets/tokens.css` | The design tokens: a byte-identical copy of `../spec/tokens/tokens.css` (generated from `tokens.json` v1.1.0) |
| `assets/base.css` | Global rules from `../spec/tokens/base.css`, extended for `file://`: reset, font fallbacks, type roles (`.type-*`), layout primitives (`.l-*`), utilities (`.u-*`) |
| `assets/components.css` | The one component layer: sections 0–18 copied from `../spec/components/components.css` (class names unchanged), plus sections 19–40 for the remaining components the component specs define. Every class in it is reserved. |
| `assets/icons.js` | About 120 Lucide-style icons inline (`<i data-icon="…">`), no CDN |
| `assets/shell.js` | `window.Vaani`: the shell (sidebar, rail, top bar, bottom bar, More, Baseline), overlays, focus management, toasts, save state, shortcuts, command palette, widgets, formatters and the one status map |
| `assets/data.js` | `window.VAANI_DATA`: the fictional workspace, the only data source |
| `assets/topup.js` | The shared top-up helper |
| `pages/<page>.css` / `pages/<page>*.js` | Page layout (layout-only CSS) and page behaviour |
| `_foundation-notes.md` | The contract every page is built on: files, URL parameters, body attributes, shell modes, component index, JS API, data shapes |
| `_integration-notes.md` | What changed when the page builds were merged, and the shared requests left undone |
| `_qa/` | Three QA rounds (core, data, flow, admin), the polish notes and the final smoke test |
| `_shots/` | Screenshots: `final/` (51 showcase renders: every page at 1440 light, 1440 dark and 390), `smoke/`, `qa-r*/` and working captures |
| `_tools/check-tokens.mjs` · `_tools/check-links.mjs` | The token and hygiene guard, and the link checker (Node, no dependencies) |

Run the guards from the project root: `node prototype/_tools/check-tokens.mjs` and `node prototype/_tools/check-links.mjs`. Both exit 1 on any problem.

---

## 7. The design system files, and how to port them to Next.js + Tailwind v4

The live product runs on Next.js with Tailwind CSS v4 (`@theme`), 32 semantic CSS variables, `lucide-react` and React Flow, with no primitive library (`../spec/01-foundations.md` §15). The port follows `../spec/01-foundations.md` §15 and `../spec/08-implementation-plan.md` §1. In short:

1. **Take the tokens from the spec, not from this folder.** Copy `../spec/tokens/` into the product as `design/`: `tokens.json` (the source of truth), `build-tokens.mjs`, `check-contrast.mjs`, and the generated `tokens.css`, `base.css`, `legacy-aliases.css`, `tailwind.theme.css` and `tailwind.preset.js`. Regenerate with `node design/build-tokens.mjs` and never hand-edit the generated files. (`assets/tokens.css` here is the same generated file.)
2. **Wire them in `app/globals.css`, in this order:**
   ```css
   @import "tailwindcss";
   @import "../design/tokens.css";          /* primitives, light and dark, aliases, density, motion */
   @import "../design/base.css";            /* root size, focus outline, forced colours, reduced motion */
   @import "../design/legacy-aliases.css";  /* old variable names, for one release only */
   @import "../design/tailwind.theme.css";  /* @theme, @theme inline, @custom-variant dark */
   ```
   `tailwind.theme.css` resets the raw Tailwind palette, sets a 4 px spacing grid, and maps `dark:` to `[data-theme="dark"]`. On Tailwind v3, or v4 through `@config`, use `presets: [require('./design/tailwind.preset.js')]` instead.
3. **Use the token vocabulary in utilities:** `bg-page`, `bg-surface`, `text-fg`, `text-fg-3`, `border-line`, `bg-accent text-on-accent`, `text-title-20`, `text-data-13`, `h-row`, `shadow-e2`, `rounded-control` (foundations §15.2). No hex, no arbitrary values, no opacity modifiers on colours.
4. **Fonts and theme:** load Hanken Grotesk, JetBrains Mono and Noto Sans Devanagari with `next/font` and put their variables on `<html>`; inline the `THEME_BOOT` script from foundations §15.3 so `data-theme` and `data-motion` are set before first paint. The prototype's Google Fonts links and "Noto Sans" rupee subset are `file://` stand-ins; the product self-hosts a one-glyph "Vaani Rupee" face.
5. **Rebuild components in React, and use this folder as the visual reference.** Build `components/ui` on Radix (as shadcn/ui source copies, restyled to the tokens), `cmdk` for the palette, and React Aria Components only for number, date, time and drop-zone fields (plan §1.3). Port the rules for each block in `assets/components.css` (for example `.btn`, `.gate`, `.sheet`, `.dt`) into its component, keeping states on ARIA attributes. Compare against `components.html` here and the canonical crops in `../spec/components/canonical/`.
6. **Map the shared behaviour to the planned single sources** (a suggested mapping; plan §1.5): the nav config `Vaani.NAV` → `lib/nav.ts`; the status map `Vaani.STATUS` → `lib/status.ts`; `Vaani.fmt` → `lib/format.ts`; the shortcut registry → `lib/shortcuts.ts`; the announcer → the shell `Announcer`; gates → `components/gate` with `lib/gate.ts`; Baseline copy → `lib/baseline-copy.ts`.
7. **Keep the guards.** Run `check-contrast.mjs` in CI (460 required pairs, 0 failures today), and turn the rules of `_tools/check-tokens.mjs` (no raw colours or lengths, pages never restyle a component) into the Stylelint and ESLint rules of plan item P1-02.
8. **Migrate in steps.** Ship `tokens.css` with `legacy-aliases.css` first as a value swap (plan M0, P0-13), then fonts and theme (M1), components (M2), the shell (M3) and pages in traffic order (M4) before removing the old palette and aliases (M5–M6).

---

## 8. Test results

Automated checks used Playwright with Chromium in isolated, cookie-less contexts from `file://`, axe-core 4.10.2, keyboard walkthroughs, hit-area and text-size probes, reduced motion and forced themes. Details are in `_qa/`.

| Pass | Result |
|---|---|
| **QA round 1** | 2 blockers, 27 major, 71 minor. The blockers: the command palette could not open any result (`shell.js`), and ending a call in its first 20 seconds crashed the Cockpit wrap-up. axe was already 0 on every page in both themes, with no page-level horizontal scroll. |
| **QA round 2** | 0 blockers, 8 major, 48 minor. Both blockers fixed (0 console errors across 34 Cockpit states). Majors included a timer inside a status region, the ₹0 wallet not blocking the Call gate on Call reports, a Columns menu that keyboards could not use, filters hidden by a docked sheet, popover focus loss, tables scrolling sideways in Settings, and tablet touch targets. |
| **QA round 3** | 0 blockers, 7 major, 79 minor (the widest pass: for example 81 axe runs on the admin pages alone). axe 0 nearly everywhere; one serious `aria-prohibited-attr` on the shortcut keycap (R3C-02). |
| **Polish pass** | Fixed the remaining focus loss after a re-rendered select (R3D-01), filters under the lead sheet (R3D-02), note placement and insert spacing in the Flow Designer, one shared Prototype states style, and brought the token guard back to 0. 51 final screenshots in `_shots/final/`. |
| **Final smoke** | All 18 pages plus `agents.html?view=personal-agents`, at 1440 (light and dark) and 390 (touch): **0 console or page errors, 0 axe violations, 0 px horizontal overflow** (one regression at 390 on the gallery was found and fixed). Navigation reaches **12 of 12 destinations** at both widths; every section link works. `check-links`: 705 references, 0 broken. `check-tokens`: 154 files, 0 problems. |

Measured across the rounds: no text under 12 px on any page at any width; phone inputs are 16 px text and 44 px tall; Leads and Call reports show 16 rows at 1440×900, 12 at 1366×657 and 10 at 1280×609 (the spec's laptop budget); the Assistant thread keeps 594 px at 360×780; the Flow Designer canvas gets 1016×780 at 1440 with the inspector docked; no animation runs under reduced motion.

Overflow note: under phone emulation, `scrollWidth − innerWidth` can read 0 while the page overflows, because Chromium widens the layout viewport. Measure `scrollWidth − documentElement.clientWidth`.

---

## 9. Known limitations and open issues

**By design**
- Static and simulated: no backend, no real telephony, payments, auth, storage or server validation. Server responses (gate preflight, 409 conflicts, 422 validation, payment results) are scripted.
- Reference code only: vanilla JS and one large `shell.js`, not the React architecture the plan specifies.
- Tested only in Chromium with emulated devices. **No real-device test and no screen-reader test** (NVDA, JAWS, VoiceOver, TalkBack) has been run on the prototype.
- Needs internet for the fonts.
- Every "Top up" without a page handler opens `billing.html?topup=1`; the spec wants one shell-mounted Top-up sheet in place (`_integration-notes.md` §5).

**Shared-layer work left undone** (`_integration-notes.md` §5): page-built components not yet promoted into `components.css` (Flow Designer header, rail and panels; Settings nav, IntegrationRow, CodeBlock, DangerZone; Meter, UpiPayment, PlanCard; RoomCard, AutonomyRow; AuthLayout, OAuthButton, OneTimeCodeInput; the chart renderer), table widget upgrades that three pages implement locally, and several smaller variants. The product plan closes these first (P1-16).

**Open bugs** (from `_qa/round3-*.md`, `polish-notes.md` and `final-smoke.md`)
- **R3A-01 (major): fixed and re-tested.** `pages/agents-boot.js` now listens for `vaani:open` and `vaani:close` in the capture phase, because `shell.js` dispatches them without `bubbles`. The Meetings "Filter" popover now renders its 5 options.
- **R2A-08 (major): fixed and re-tested.** In `assets/components.css`, `.kv` stacks label above value in containers under 400 px. In `pages/settings.css` and `settings-org.js`, member emails are single-line with an ellipsis and a full-address tooltip, and invited rows wrap inside their own column. At 320 and 360 there are 0 overlaps, 0 overflow and axe 0.
- **ConsentBar (R3A-02, partly fixed):** the auth pages now reserve the bar's height, but on first visit at 1440×900 the bar still covers the sign-up consent line and footer links until you scroll or choose.
- **Home after setup (phone):** More gets `aria-current="page"` on Home although the More sheet does not list Home.
- **Round-3 admin and auth minors** (R3A-03 to R3A-10, R2A-04 to R2A-07, R2A-09 to R2A-13, the rest of R1A-05) and data minors R2D-14, R2D-15, R2D-17 and R2D-18 are not recorded as fixed. Files changed after round 3, but these were not re-verified one by one; re-test before relying on them.
- Cosmetic: gallery "Spec:" lines can wrap before a `·` separator.
- Several round-3 fixes (core, Flow Designer, data) were confirmed by reading the code rather than re-running each case (`polish-notes.md`).

---

## 10. Related documents

- `_foundation-notes.md`: the page contract and JS API
- `_integration-notes.md`: the shared layer and what was left undone
- `_qa/round1-*.md` to `_qa/round3-*.md`, `_qa/polish-notes.md`, `_qa/final-smoke.md`: the test record
- `../spec/README.md`: the specification index; `../spec/08-implementation-plan.md`: the phased build plan
- `../FINAL_REPORT.md`: the engagement's final report
