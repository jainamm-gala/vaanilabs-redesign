# QA round 1: admin and auth pages

Pages: billing.html, settings.html (all 14 sub-pages), assistant.html, agents.html (Meetings, Personal agents, Agent settings), login.html, signup.html, forgot-password.html.
Method: Playwright in isolated cookie-less contexts. Widths 1440, 1280, 1024 (fine pointer), 768 (touch), 390 and 360 (mobile emulation), plus 320 for the no-sideways-scroll checks. axe-core 4.10.2 ran in light and dark. Keyboard walkthroughs, dialog, sheet and menu focus checks, reduced motion. I reproduced every bug below at least twice.
Screenshots: `_shots/qa-r1-admin/` (99 files).

## Summary

The pages are in good shape. axe found 0 violations on every page, tab and sheet state I ran, in both themes. There were 0 console errors and 0 `pageerror`s. No page scrolls sideways at 320 to 1440. The core flows work and match the spec:
- Top-up validation (0, −50, 5, 99, 1,00,001, "abc", "Rs 1,000", preset sync).
- Pending, declined and success states.
- Assistant suggestions insert text without sending, and every call goes through the Call gate.
- Settings save model and navigation guard.
- New task gate, including the discard footer and one task on a double press.
- Login errors and link mode with Back restore.
- Forgot-password flow.

The problems are focus handling in a few places, focused elements covered by sticky bars, and one shared behaviour. From every page except Billing, "Top up" leaves the page instead of opening the sheet where you are.

| Severity | Count |
|---|---|
| Blocker | 0 |
| Major | 4 |
| Minor | 15 |

## Metrics

| Page | axe (light / dark) | Console errors | Page overflow (1440 → 320) | Notes |
|---|---|---|---|---|
| billing (5 tabs, top-up step 1 and 2, sheets) | 0 / 0 | 0 | 0 at every width | The ledger table scrolls inside its frame at 1440 in the autopay-failed state (+69 px) |
| settings (14 pages) | 0 / 0 | 0 | 0 | The Members table scrolls inside its frame with a coarse pointer at 768 to 1024 (+37 px) |
| assistant (new, chat_1, chat_2, delete) | 0 / 0 | 0 | 0 | Visible thread height: 629 px at 390×844, 585 px at 360×780 (pass) |
| agents (3 views) | 0 / 0 | 0 | 0 | New task stays in the header row at 320, 360 and 390 |
| login / signup / forgot-password | 0 / 0 | 0 | 0 | Inputs are 16 px on phones |

Reduced motion: sheet animation 0.001 s, spinner static, longest transition 0.09 s. The dark theme looks right, and the QR code stays dark-on-light in dark mode.

## Bugs

### Major

**R1A-01 · shared · Top up leaves the page on every page except Billing** (`assets/shell.js`, `V.openTopUp`)
- Repro: open `assistant.html?chat=chat_1&wallet=empty` and press "Top up" in the blocked Call step. Or open `settings.html?topup=1`. The first goes to `billing.html?topup=1` and the chat is gone. The second opens nothing.
- Expected (05 §2.4, §2.7, §2.18): the Top-up sheet opens over the current page from any route. On success, focus returns to the trigger (the now-enabled call control).
- Fix: move the TopUpSheet markup and `billing-topup.js` logic into a shared asset, for example `assets/topup.js`, which the shell injects into the portal. Register it in `V.topUp` on every page. Keep `billing.html?topup=1` only as a deep link.

**R1A-02 · billing · Focus lands on `<body>` after the autopay mandate is approved**
- Repro: Billing → Autopay → "Review and approve…" → prototype "Approve". `document.activeElement` is BODY (checked 8 times over 4 s).
- Expected: focus never lands on body (G §3, "After Cancel or Esc … never `<body>`"; Assistant acceptance criteria).
- Fix: `pages/billing-autopay.js` `approved()` runs `B.render()` after `V.drawer.close(...)`, so the restored trigger is destroyed. After render, focus `#bill-ap-h` (`tabindex=-1`), as the Turn-off path already does.

**R1A-03 · assistant · On phones, the waiting step's primary action is hidden under the sticky plan bar and composer**
- Repro: 390×844 mobile, open `assistant.html?chat=chat_1`. The page auto-scrolls to the ApprovalCard. "Review and call…" sits at y 675–719 and the dock starts at 666, so `elementFromPoint` hits `.as-planbar-t`. Tab from "Edit…" to it: the focused button is completely hidden and only its tooltip shows. See `assistant-390-focus-obscured.png`.
- Expected: WCAG 2.4.11 (focus not obscured). Assistant acceptance criteria: a waiting ApprovalCard renders and is usable at every breakpoint.
- Fix: on phones, set `scroll-padding-bottom` on `html` to the dock height plus the BottomBar (for example `--as-dock-h`, measured with a ResizeObserver in `assistant-ui.js`). Scroll the waiting step with that offset so its actions end above the dock.

**R1A-04 · auth · The ConsentBar covers focused links and the Create account button**
- Repro: signup or login at 1024×768, or at 390×844 mobile, on first visit. Tab to the footer links: Privacy, Terms, Security and Status are completely covered by `.auth-consent` while the page is already at its maximum scroll. On signup, "Create account" and the Terms sentence start under the bar at 1024 and 390. See `signup-1024-focus-terms-hidden.png` and `signup-390.png`.
- Expected (08 §4.4): "it never blocks the page … never covers a focused element". Also WCAG 2.4.11, and signup acceptance: "The Terms sentence is visible before any account is created".
- Fix: `scroll-padding-bottom` cannot help when the page cannot scroll further. While the bar is visible, add bottom padding equal to its height to the auth layout, for example a `body.has-consent` rule in `auth.css` using `--consent-h` set by `A.consent()`. Then the last content and the footer can scroll above it.

### Minor

**R1A-05 · shared · Small icon buttons, link buttons, tabs and small selects miss the 44 px touch target** (`assets/components.css`)
- Repro: 768 with touch, or 390 mobile.
  - `.stat-label .ibtn` (the wallet "i" button) has a 20×20 hit area.
  - `.ibtn--sm` ("Copy link to Workspace", "More actions…", "Copy answer") is 36×36.
  - `.btn--link`, including the tablet "‹ Settings" back link, "and 9 more · View all", "Show the message" and "See usage", is about 20 px tall.
  - `.vtab` is 39 px, `.select--sm` is 36 px, `.th-sort` is 16 px.
- Cause: `.ibtn::after` and `.btn::after` compute their inset from `--btn-h-md`. On coarse pointers `--btn-h-md` equals `--hit` (44), so the inset is 0 and elements smaller than `--btn-h-md` get no expansion. At fine pointers the 20 px info button is also below 24×24 (it passes only through the spacing exception).
- Expected (05 §line 418): at least 44×44 hit area on coarse pointers, using an `::after` inset.
- Fix:
  - `.ibtn--sm::after{inset:min(0px,calc((var(--btn-h-sm) - var(--hit))/2))}`
  - `.stat-label .ibtn::after{inset:calc((var(--space-20) - var(--hit))/2)}`
  - `.btn--link::after{inset:calc(-1*max(0px,(var(--hit) - 1lh)/2)) 0}`
  - For `.vtab`, `.select--sm` and `.th-sort`, add a `::before` hit area under `@media (pointer:coarse)`. `.vtab::after` is taken by the selected underline.

**R1A-06 · billing · Choosing a date range moves focus to the page H1**
- Repro: focus "Last 30 days", press Enter, then ArrowUp and Enter. Focus ends on `H1#page-title`, because the ledger re-renders and removes the trigger.
- Expected: focus returns to the range trigger (O §4 popover and listbox return).
- Fix: after re-render, refocus `#bill-panel button.select`.

**R1A-07 · billing · The Filter popover opens with focus on "Clear" instead of the first checkbox**
- Repro: open Filter with the keyboard. `activeElement` is `#bill-kind-clear`.
- Cause: the body is filled after `V.popover.open` picks its first focusable.
- Fix: render `#bill-kind-body` before opening, or add `data-autofocus` to the first checkbox.

**R1A-08 · billing · The Declined result moves focus to "Try again", not the result**
- Repro: Top up, press Ctrl+Enter, then choose "Decline". Focus goes to the "Try again" button.
- Expected (05 §2.15): "a result moves focus to the result heading". Success does this correctly (`H3#bill-res-h`).
- Fix: give the Declined, Expired and No answer states a heading or notice with `tabindex=-1` and focus it. Keep `role=alert`.

**R1A-09 · billing · The ledger Status column is empty for Completed rows**
- Repro: Wallet tab at 1440 or 1024. Every Completed row shows only an `sr-only` word, so the column is visually blank. Invoices shows "✓ Paid", and the phone ListRow shows "Completed".
- Expected: 05 §2.5 wireframe "✓ Completed", and the status map (Payment: Completed · `check` · success).
- Fix: render `V.ui.statusTag('payment','completed')` in `billing-wallet.js` `statusCell()`, or drop the column and state that choice in the spec notes.

**R1A-10 · billing · The ledger shows the P4 Method column at 1440 and overflows its frame**
- Repro: Prototype states → "Autopay failed" at 1440. The table's `scrollWidth` is 1212 against a `clientWidth` of 1143, and "UPI Autopay · a•••••@okaxis" is cut off at the edge (`billing-autopay-failed.png`). The cause is the long description "…includes batch 'Weekend follow-ups'".
- Expected (05 §2.16): P1–P3 at ≥1440.
- Fix: hide `.bill-c-method` below ~1600 px, or treat Method as P4. Truncate Description with an ellipsis and the full text in a `title` attribute or the record sheet.

**R1A-11 · billing · The member state tooltip reads "Ask Anika R.." and asks the signed-in user**
- Repro: Prototype states → "Member without billing access", then hover Top up: "Only admins can add money. Ask Anika R..". The same double full stop appears in autopay, plans and wallet copy. The sidebar still shows Anika R. as Admin.
- Fix: in `billing.js`, set `B.adminName = 'Anika R'` or strip a trailing "." before appending. In member mode, switch the shell user to a member (for example "Kiran Pillai · Member").

**R1A-12 · billing · Plans contradicts itself on the meetings rate**
- Repro: Plans tab. "Your rates" says Meetings ₹0.01/s = ₹0.60/min after 30 free minutes. The Pay as you go card says "30 free minutes each month, then ₹2.40/min".
- Cause: both strings come from the spec (§2.9 vs §2.10), so the spec itself conflicts.
- Fix: raise with the spec owner and use one rate in both places. This page exists to be honest about billing (F-QA-011).

**R1A-13 · billing · The autopay On state after a new mandate shows impossible history**
- Repro: approve a new mandate. The On state reads "₹0 used in September" and also "Last automatic top-up 21 Sep 2026 · ₹500 · Completed", for a mandate created today.
- Fix: for a new mandate, show "Last automatic top-up: None yet".

**R1A-14 · settings · The Members table scrolls sideways and clips the row ⋯ with a coarse pointer at 768 to 1024**
- Repro: `settings.html#organization`, 768×1024 or 1024×768 with touch. The table scrolls inside its frame (740 in 703 px) and the ⋯ buttons are cut off at the right edge (`settings-organization-768.png`, `settings-organization-1024.png`). With a fine pointer at 1024 it fits.
- Cause: the 180 px role selects and 16 px cell padding at touch density.
- Fix: below 1024 or on coarse pointers, drop "Last active" to line 2 of Person (P2), or let the role select size to its content.

**R1A-15 · agents · The Agent settings form is not aligned with its header**
- Repro: `agents.html?view=agent-settings` at 1440. The H1 starts at x 256 and the form column at x 468, because it is centred.
- Expected: 07 §2.11 "720 px column under PageHeader". Settings acceptance "aligned with their header at 1440", as Billing › Autopay and all Settings pages do.
- Fix: left-align the 720 column with the page margin.

**R1A-16 · agents · Saving Agent settings uses a toast and moves focus to the H1**
- Repro: change "How your agent reaches you" to Call, then press Ctrl+S. The toast says "Agent settings saved" and focus moves from the radio to `H1#page-title`, scrolling to the top.
- Expected (O §18.3): after saving, the bar leaves and the section heading shows the StatusText "Saved 11:24 am". Focus stays in the form after Ctrl+S, or moves to the section heading after the bar's Save button.

**R1A-17 · agents · A new task appears second in Active, not first**
- Repro: New task → type a goal → Start task. The new "Queued" row is second, after the waiting task.
- Expected (07 §2.18): "the new task appears first in Active".
- Fix: pin the just-created task to the top until the next reload, or record the sort choice in the spec.

**R1A-18 · agents · Header and ApprovalCard meta wrap badly on phones**
- At 360 and 320, the Meetings header wraps: the meta sits on line 1, then ⋯ and "Start" on a separate row, which costs about 60 px (`agents-mt-360.png`).
- At 390, the Personal agents ApprovalCard meta wraps so that a line starts with "· asked 4 min ago" (`agents-pa-390.png`).
- Fix: put the header actions on the meta row, as Personal agents already does. For the meta, use `display:flex; flex-wrap:wrap` with the separators as pseudo-elements, so no line starts with "·".

**R1A-19 · billing, agents, settings · The "Prototype states" floating button covers product content**
- Repro, all at 1440 unless noted:
  - Billing: it covers ledger rows.
  - Personal agents: it covers the pager text "1–3 of 3 tasks".
  - Meetings: it covers table rows at 1440 and the "End room…" button at 360.
  - Settings at 768: it covers content in the bottom-right corner.
- It is prototype-only UI, but reviewers take screenshots.
- Fix: dock it inside the Baseline or PageHeader (Assistant already puts it in the header), or give pages matching bottom padding.

## Checked and working (no action)

- **Billing**
  - The Wallet tab has exactly one filled button.
  - The five tabs are links with `aria-current` and survive Back.
  - Top-up opens from the header, `?topup=1` and `?amount=1000`, with focus in the amount field.
  - Presets are a radiogroup with roving tabindex. The amount is labelled "Top-up amount, in rupees".
  - Every validation string is correct. The Pay label names the amount charged.
  - Ctrl+Enter moves to the UPI step and focuses the step heading. The QR has alt text.
  - The countdown ticks, the sheet traps focus, and Esc leaves the payment pending with a notice and a Pending row.
  - Success focuses the result heading. Done restores focus and updates the balance, Baseline and ledger, with a polite announcement.
  - At 375 the sheet is full screen with 3×44 presets and "Open UPI app" first.
  - Plan and autopay gates, Turn off confirm, billing details validation (GSTIN, PIN) with the discard footer, Download buttons named per invoice, and the loading skeleton (no ₹0.00).
- **Settings**
  - 14 routes, `aria-current` in the sub-nav, header Save only where the spec allows.
  - The SectionFooter appears when the section is dirty and hides when values are typed back.
  - The guard dialog names the section. "Confirm it's you" before delete and before creating an API key. Typed email confirm.
  - Exactly one back link below 1024.
- **Assistant**
  - Composer names are correct and Dictate has `aria-pressed`.
  - Suggestions insert text without sending, adding a new line when text is already there. One polite announcement per reply.
  - Call gate: trap, Esc (a first Esc hides the tooltip on the focused primary, as WCAG 1.4.13 requires), busy state, and server-count results.
  - The typed "64" delete works. A failed send shows "Not sent" with Retry and Edit and one alert. The draft survives a reload.
- **Agents**
  - New task: focus in Goal, the empty or whitespace error, the Esc discard footer, one task on a double press, and the task sheet opens.
  - The ⋯ menu has arrow keys and Esc returns focus. The End room confirm focuses Cancel.
  - Payments is locked at Confirm + 2FA. Ctrl+S saves.
- **Auth**
  - One H1 inside `main`, `noValidate`, and empty-submit errors focus the email field.
  - The toggle has `aria-pressed`. Wrong credentials show one error for both cases.
  - `?method=link` works, Back restores password mode, and the email is carried over.
  - Forgot password has no leading icon. The sent state changes the H1 and moves focus to it. Signup rules update live and an unmet rule is named on submit.
