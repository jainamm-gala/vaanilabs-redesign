# Final visual polish pass (27 Sep 2026)

Design lead pass over the whole prototype, checked against `spec/00-design-direction.md` (Sutradhar) and the direction specimen renders. I rendered every page at 1440 light, 1440 dark and 390 (touch), compared them side by side on contact sheets, fixed what I found, re-rendered, and closed the open QA list.

## Verdict

The prototype reads as one product with its own identity. It is not a Linear, Vercel or Stripe clone:
- graphite chrome with a single indigo-dye Neel accent
- the Neel-ink Baseline under every desktop screen (hidden in the Flow Designer, as specified)
- capsule-ended Trigger and Outcome nodes, and Devanagari set where Hindi is spoken
- green, amber and red used only for real call and record state

Every page has one obvious primary action where it needs one:

| Page | Primary action |
|---|---|
| Leads | New lead |
| Knowledge | Add knowledge |
| Meetings | Start a meeting |
| Billing | Top up |
| Rep console | Go available |
| Flow Designer | Publish v8… |
| Cockpit | Place call… (gated until a contact is chosen) |
| Auth pages | Sign in, Create account, Send reset link |

Home and Call reports have no primary action by design. Home is an overview whose next steps are row actions. Call reports is a record list.

Type, radii, spacing and icon stroke are consistent across the pages. There is no decoration left to remove: no gradients, glass or glow. Motion stays within the 07 tokens.

## Visual fixes made in this pass

1. **"Prototype states" control, one treatment everywhere.**
   - **Problem:** five pages drew it as a dashed outlined button, five as a plain tertiary button. Cockpit and Rep console wrapped it in a dashed box, which made a double frame. Two pages used a flag icon, the rest used sliders.
   - **Fix:** one shared `.proto-btn` class in `assets/components.css`: a dashed hairline in `--border-strong`, `--text-3` label, and a `sliders-horizontal` icon on every page. It marks reviewer tooling without competing with the primary. The fold-to-icon rules moved into the same class (`.proto-btn--fold` below 1280, `.proto-btn--fold-wide` at 1024–1439). The auth pages lost their dashed separator line, because the button now carries the marker.
   - **Files:** 10 page HTML files, `pages/auth.js`, `pages/auth.css`, and the page CSS of Analytics, Call reports, Cockpit, Rep console, Knowledge, Agents, Billing and Settings.
2. **Rep console "Today".**
   - **Problem:** labels and values sat about 320 px apart in the wide context column, so they read as two separate lists.
   - **Fix:** new `.kv--tight` KeyValueList variant with a label column of `calc(var(--space-40) * 4)`, used by Rep console.
3. **Component gallery header and spec references (R2C-16).**
   - Each label and its segmented control now wrap as one group (`.gal-ctl`).
   - Class names and spec file names no longer break at hyphens (`.gal-tok` spans added by `pages/components.js`). Before, the text split as "--" / "link" and "02-" / "components-overlay-feedback".
4. **404 Prototype states copy.** The reference "(03‑pages/00 §15.1)" now uses a non-breaking hyphen, so it doesn't split across lines at 390.
5. **Flow Designer notes (FD-R2-04).**
   - New notes are placed by a free-spot search (`VF.noteSpot`) that treats these as obstacles:
     - steps
     - connector segments
     - label pills
     - other notes
     - any expanded frame edge

     A note sits wholly inside or wholly outside each frame.
   - The seeded demo note in `?state=large` is placed the same way after the first layout, so it no longer crosses the Opening frame.
   - In the header, the author name truncates before the time. Today's notes show only the time ("11:24 am").
6. **Flow Designer insert spacing (FD-R1-26).** Inserting between two steps with less than the step width plus two rank gaps between them now moves the downstream steps right, in the same undo step. It no longer squeezes the new step in or drops it below. The announcement says "The steps after it moved right to make room."
7. **Token guard back to zero.** `node _tools/check-tokens.mjs` had 23 problems before this pass. They were page CSS restyling shared components: `.an-cell .delta`, `.cr-li .status--md`, `.fd-fblock.node--warning` and similar, plus the ringing TopBar chip duplicated in Cockpit and Rep console. Those rules moved into a "Page-context refinements" block at the end of `assets/components.css`, with the page class wrapped in `:is()` so it is not read as a component base. The ringing chip rule now exists once. The guard now reports 154 files and 0 problems.

## QA list: status

Fixed or completed in this pass:

| Id | What was wrong | Fix |
|---|---|---|
| R3D-01 | Rows per page on Call reports and Knowledge still sent focus to `<body>`. The earlier fix called `resolveDetached()` from a different IIFE scope, so every choice threw a `ReferenceError`. | `assets/shell.js` `choose()` now calls `V.util.resolveDetached`. Call reports re-renders about 260 ms later, so `P.set()` also restores focus to the replaced control (`keepFocus`). Verified: focus lands on the new Rows per page button on Call reports, Knowledge and Analytics (flow switcher). |
| R3D-02 | With the overlay lead sheet open at 1024 and 1280, the filter tokens, Clear and the count were under the sheet. | `pages/leads-filters.js` pads the toolbar by the width the sheet covers, so tokens fold into "+n filters". The Filter count shows whenever a sheet is open, and the row refits when the sheet opens or closes. Verified at 1024×768 and 1280×800: nothing covered. |
| R3D-12 | With the Knowledge review sheet docked, the table was 771 px wide in a 768 px column. | `pages/knowledge.css`: a narrower container step for the two text columns. Verified: no horizontal scroll. |
| R2C-16 | Gallery labels and spec names broke badly at 360 and 390. | See visual fix 3. |
| FD-R2-04 | Notes landed on connectors and crossed frame edges. | See visual fix 5. |
| FD-R1-26 | Inserted steps were squeezed in or dropped below. | See visual fix 6. |

Re-verified in the browser in this pass (already fixed in the previous round):

| Area | Ids |
|---|---|
| Cockpit | R3C-01 (Failed shows "₹0 · not billed"; a ringing call shows "₹0 · billing starts when the call is answered"), R3C-03 (a stale call has no ticking timers), R3C-11 (the kind line is hidden with the primary) |
| Rep console | R3C-05 (Baseline shows "On call 03:41 · Aarav Mehta"), R3C-09 (focus stays on Go offline when the transfer rings, and Go offline stays visible) |
| Home | R2C-08 (the gate has a Close button) |
| Flow Designer | FD-R3-01 (rollback gate lists 3 changes; the draft is clean afterwards; the toast has the Undo sentence) |
| Knowledge | R3D-13 (count reads "14 sources") |
| Copy | R2C-13 (no straight apostrophes in rendered text on any page) |

Fixed in the previous round and confirmed by reading the code in this pass. These carry fix comments, or were reported in round 3 and the code now implements the requested fix:
- Core: R3C-02, R3C-04, R3C-06, R3C-07, R3C-08, R3C-10, R2C-02, R2C-03, R2C-04, R2C-05, R2C-06, R2C-07, R2C-09, R2C-10, R2C-11, R2C-12, R2C-14, R2C-15
- Flow Designer: FD-R2-02, FD-R2-03, FD-R2-05, FD-R2-06, FD-R1-15, FD-R3-02, FD-R3-03, FD-R3-04
- Data pages: R3D-03, R3D-04, R3D-05, R3D-06, R3D-07, R3D-08, R3D-09, R3D-10, R3D-11, R2D-04, R2D-05, R2D-06, R2D-07, R2D-08, R2D-09, R2D-10, R2D-11, R2D-12, R2D-13

## Checks run after the changes

- **axe-core 4.10.2:** 0 violations on all 16 app and auth pages. Home, Rep console, Leads, Knowledge, Agents, Assistant, Flow Designer, Sign-up, Forgot password and 404 were checked in light. Cockpit, Call reports, Analytics, Billing, Settings and Sign-in were checked in dark.
- **Horizontal overflow at 390 (touch):** 0 px on all 17 pages.
- **Errors:** no page or console errors at load on any page.
- **Tooling:** token guard 0 problems. `node _tools/check-links.mjs`: 705 references, 0 broken.

## Showcase screenshots

`_shots/final/<page>-1440-light.png`, `-1440-dark.png` and `-390.png` exist for all 17 pages: index, cockpit, rep-console, leads, call-reports, analytics, knowledge, flow-designer, agents, assistant, billing, settings, components, login, signup, forgot-password and 404.
- **1440 captures:** 1440×900 viewport. The app pages scroll inside the shell. The component gallery is captured full page, cut at 3600 px.
- **Dark captures:** `prefers-color-scheme: dark`, with no stored theme.
- **390 captures:** a 390×844 phone viewport at 2x with touch emulation.
- **Auth pages:** the ConsentBar (first visit) is part of these captures, bottom-left as §4.4 specifies.

## Notes and deliberate choices

- **Knowledge on phones:** it shows both the route tabs "Sources · Proposals" and a "Sources · Test" pane switch. This follows the page spec. I left it alone, but the repeated word "Sources" could be reconsidered in a later spec revision.
- **Home:** the only page with display-size type ("Your workspace is live."), per the Home spec. Every other page uses the 56 px PageHeader.
