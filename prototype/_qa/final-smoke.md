# Final smoke test after the polish pass (27 Sep 2026)

I loaded every `.html` page in `prototype/` at 1440 and 390, plus a dark-mode pass at 1440. That is the 17 product pages, `_template.html`, and the `agents.html?view=personal-agents` view. Each load ran in its own clean browser context with no cookies or storage, from `file://`.

## Result

**Pass.** The polish pass introduced one regression, and I fixed it:

- **The bug:** the component gallery overflowed horizontally at 390.
- **After the fix:** every page shows:
  - 0 console or page errors
  - 0 axe violations
  - 0 px horizontal overflow at 1440 and 390

The Main navigation reaches all 12 destinations at both widths. It also reaches Home while setup is incomplete. Every link was clicked and landed on the right page.

## Regression fixed (the only file edit)

| | |
|---|---|
| Symptom | `components.html` at 390 (phone, touch): document 462 px wide in a 390 px viewport (**72 px horizontal scroll**). Also overflowed at 360 and 320. |
| Cause | Polish-pass visual fix 3 (R2C-16) wrapped each whole `" · "`-separated part of `.gal-ref` / `.gal-meta` in a `white-space: nowrap` `.gal-tok` span. Two parts are long phrases, so they could not wrap: ".kbd — rendered by Vaani.ui.statusTag(domain, value) from the one status map" (421 px) and ".blist — rendered by Vaani.shell from one nav config and one Baseline copy module" (446 px). |
| Fix | `pages/components.js`: each **word** is now its own `.gal-tok`. Lines can break at spaces and at the ` · ` separators, but still never inside a class name or spec file name (`.bl-seg--warn` and `02-components-overlay-feedback` stay whole). |
| Verified | Overflow is 0 at 390, 360 and 320. At 1440 it is unchanged at 0. I read the Tags and Shell section headers visually at 390: they wrap cleanly. axe still reports 0. `check-links` and `check-tokens` both pass. |

The polish notes reported "0 px on all 17 pages" at 390, and that measurement missed this overflow. With phone emulation (`isMobile`), Chromium widens the layout viewport to fit content that overflows. `innerWidth` became 462, so `scrollWidth − innerWidth` read 0. The overflow numbers below use `documentElement.clientWidth` instead. Use the same measure in future checks.

## Per-page results

- **Console errors:** page errors plus `console.error`, collected before axe runs.
  - axe-core preloads CSS over XHR. Under `file://` that preload logs CORS errors, but they come from axe, not from the page, so I left them out.
  - No local file failed to load on any page.
- **axe counts:** axe-core 4.10.2. The counts are violating nodes split by impact: critical / serious / moderate / minor.
- **Overflow:** `scrollWidth − clientWidth`.
- **Nav reach:** whether the visible Main nav reaches all 12 destinations.
  - At 1440 that is the Sidebar, or the Rail on the Flow Designer.
  - At 390 it is the BottomBar plus the More sheet.

| Page | 1440 errors | 1440 axe (c/s/m/mi) | 1440 overflow | 390 errors | 390 axe (c/s/m/mi) | 390 overflow | 1440 dark axe | Nav reach 1440 / 390 | Visual check |
|---|---|---|---|---|---|---|---|---|---|
| index.html (Home) | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 (Home too, with `?setup=incomplete`) | OK. "Your workspace is live." With setup incomplete, Home shows in the Sidebar and in More. |
| cockpit.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. Place call is gated with its reason. |
| assistant.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK |
| rep-console.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. The "Today" `.kv--tight` labels and values read as pairs. |
| agents.html (Meetings) | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK |
| agents.html?view=personal-agents | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | not run | 12/12 · 12/12 | OK |
| flow-designer.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 (Rail) · 12/12 | OK. At 390 it shows Outline with Test and Publish v8… The canvas SVG runs past the viewport inside its clipped pane, which is expected. |
| knowledge.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. The Sources and Proposals tabs both route correctly. |
| leads.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. At 390 the saved-view tabs are a horizontal scroll strip, clipped by design. |
| call-reports.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. Same saved-view scroll strip at 390. |
| analytics.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK |
| billing.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. All 5 section tabs work: Wallet, Usage, Plans, Invoices, Autopay. |
| settings.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. All 14 sections are reachable from the section nav at 1440 and from the overview list at 390, each with a "Settings" back link. |
| components.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | **72 → 0 (fixed)** | 0 | n/a (gallery, no app shell). All 14 TOC anchors scroll to their section. | OK after the fix |
| login.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | n/a (auth). The Create an account and Forgot password links resolve (check-links). | OK. ConsentBar is bottom-left. |
| signup.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | n/a (auth) | OK. See note 2. |
| forgot-password.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | n/a (auth) | OK |
| 404.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. Nothing is marked current, which is correct. |
| _template.html | 0 | 0/0/0/0 | 0 | 0 | 0/0/0/0 | 0 | 0 | 12/12 · 12/12 | OK. The skeleton renders with Leads current. |

### Navigation click-through

Each click started from a fresh load. After it, I checked the URL, the `<title>`, the H1, and `aria-current` in the Main nav. There were no errors.

- **1440 Sidebar**, from `index.html`: all 12 links landed on the right page, with `aria-current` on the matching item.
- **1440 Rail**, from `flow-designer.html`: all 12 links worked.
- **390 BottomBar:** Cockpit, Leads, Call reports and Flows all worked.
- **390 More sheet:**
  - All 8 destinations worked: Assistant, Rep console, Meetings, Personal agents, Knowledge, Analytics, Billing, Settings.
  - Focus moves into the sheet. It lands on the current item, or on Close when the current page is in the BottomBar.
  - Escape closes the sheet.
- **Section navigation:** every section link reaches its section.
  - Settings: all 14 sections, at 1440 and at 390.
  - Billing: all 5 tabs.
  - Knowledge: both route tabs.
  - Component gallery: all 14 TOC entries.

## Tooling

- **`node _tools/check-links.mjs`:** 18 HTML files and 119 scripts scanned, 705 local references checked, 0 broken, 4 runtime-only fragment notes.
  - The 4 notes are `#vl-mark` on components, forgot-password, login and signup.
  - At runtime I confirmed that the shell.js sprite exists on all four pages and that the mark renders.
  - I ran the checker before and after the fix, with the same result.
- **`node _tools/check-tokens.mjs`:** 154 files checked, 0 problems.

## Observations, not regressions (left as they are)

1. **Home after setup.** With setup complete, Home is out of the nav, as spec D11 says. The phone BottomBar then gives **More** `aria-current="page"` on `index.html`, but the More sheet does not list Home. Screen-reader users hear "current page" on a menu that does not contain the page. Consider giving no current item on Home once setup is complete.
2. **ConsentBar on Sign up at 1440×900.** On first visit the bar covers the "By creating an account…" consent line and the footer links until someone scrolls or chooses Allow or Decline. The placement follows §4.4 (bottom-left). A little bottom padding on the auth page, equal to the bar's height, would keep the consent line clear.
3. **Placeholder links.** The auth footer's Privacy, Terms, Security and Status links are `href="#"`. That is expected in a prototype.
4. **Gallery spec lines.** The "Spec:" line and the class lists can start a new line with the `·` separator, because the break can fall before the dot. This is cosmetic and was already there before the polish pass.

## Artifacts

- **Screenshots:** `_shots/smoke/`.
  - For each page: `<page>-1440.png`, `<page>-390.png` (full page, 2x), `<page>-1440-dark.png`, and `<page>-390-more.png` (More sheet open).
  - `components-390-gstatus-head.png` and `components-390-gshell-head.png` show the fixed wrapping.
- **Contact sheets:** `sheet390-*.png` (the first phone screen of each page) and `sheetdark-*.png` (dark mode at 1440).
