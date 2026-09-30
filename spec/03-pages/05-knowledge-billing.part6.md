### 2.13 Interactions and keyboard (Billing)

| Key | Where | Does |
|---|---|---|
| `⌘/Ctrl+K`, then "Top up…" (keywords: wallet, recharge, UPI, balance) | Anywhere | Opens the Top-up sheet in place |
| `Tab` / `Enter` | Route tabs | They are links: Tab moves, Enter follows |
| `←` `→` | Amount presets (radiogroup) | Move and select |
| `Enter` | Amount field | Pay → Step 2. Nothing is charged until the user approves in their UPI app with their PIN, so this is not a one-key charge |
| `Esc` | Top-up sheet | Closes. In Waiting, the order stays open on the server and the app shows Payment pending; **Cancel payment** is the explicit way to cancel it |
| `↑` `↓`, `J` `K`, `Enter` | Ledger and invoice tables | Move rows, open the record sheet (N §7.9) |
| `⌘/Ctrl+Enter` | Top-up sheet (Amount step), Plan change sheet, Autopay gate sheet | The gate chord (G §4.5, G6): activates the enabled primary. **Pay ₹590 via UPI** moves to the UPI step (nothing is charged before the PIN); **Pay ₹499 and switch** debits the wallet, which is why only the two-key chord, never a single key, does it. In the Autopay gate sheet and in the Top-up Waiting step there is no in-app primary (the approval is the UPI PIN), so the chord does nothing there |

Billing has no single-key shortcuts at all (P3: nothing that bills on a key). **Motion:** sheets slide over `--dur-slow` (fade only under reduced motion); balances and runways change in place without counting up (N §4.8); the QR countdown is a text change, not an animated ring.

### 2.14 Microcopy (before → after)

| Before (live today) | After |
|---|---|
| BILLING | Billing |
| WALLET BALANCE ₹0.00 · TRANSACTIONS 0 "All transaction history is shown below" | Wallet balance ₹0.00, with "Phone calls are paused…"; the count moves to the Transactions meta |
| UPI AUTOPAY · Auto-debit wallet top-up · "Enable once, and Razorpay UPI mandate automatically recharges your wallet." | Autopay · "Top up automatically when your balance runs low, so calls never pause. You approve a UPI Autopay mandate once, in your UPI app." |
| Enable UPI Auto-Debit (filled blue) | Set up autopay… (secondary) → Review and approve… |
| INACTIVE pill + "Status: INACTIVE" | One StatusTag: Off |
| Auto top-up ₹ (placeholder as the label) | Amount to add (label), ₹ prefix, hint with the runway it buys |
| MANUAL TOP-UP · Recharge wallet with UPI · "…For automatic mandate-based recharge, use Pricing." | Top up wallet (sheet) · "Pay with any UPI app. Money is added when your UPI app confirms." |
| ₹100 ₹500 ₹1000 (chips without state) | ₹100 · ₹500 · ₹1,000 (radiogroup, en-IN grouping) |
| Top-up ₹ (placeholder) | Top-up amount |
| Pay with UPI | Pay ₹590 via UPI |
| Billing history · "No transactions yet." | Transactions · "Top-ups and charges appear here with the balance after each one." |
| "Wallet empty — top up now to keep calls flowing." (every page, including Billing) | On Billing, the balance card: "Wallet is ₹0. Phone calls are paused. Browser tests and free meeting minutes still work." Elsewhere, the WalletNotice ladder (O §10.2) |
| Meetings Billing (Settings) · "Free · Unlimited included · then ₹2.40/min" | Billing › Plans · "₹0 / month · 30 free minutes each month, then ₹2.40/min" |
| "₹499/ / mo" (wrapped) | "₹499 / month" (one line) |
| Reserved LiveKit capacity | Reserved capacity |
| Recharge | Top up |
| Allocate a number from billing (Analytics) | Not in Billing: "Set up your inbound number in Phone setup" (owned by Analytics and Settings specs) |

### 2.15 Accessibility (Billing)

- **Top-up sheet:** `role="dialog"` `aria-modal`, labelled by its title; focus starts in the amount field (`data-autofocus`); Step 2 moves focus to its heading "Pay ₹590.00 with any UPI app" (`tabindex="-1"`); a result moves focus to the result heading; closing returns focus to the trigger, which may be a call control that is now enabled (O §1.3).
- **Amount:** presets are a `radiogroup` "Choose an amount"; the input's name includes the currency ("Top-up amount, in rupees"); the runway line is polite and throttled; errors are linked by `aria-describedby`.
- **UPI step:** the QR has a text alternative naming amount and payee; "Pay using UPI ID" and "Open UPI app" are full keyboard and screen-reader paths, so nobody depends on scanning; the countdown is not live except one announcement at 1 minute left and one at expiry.
- **Results:** Declined and No answer yet use `role="alert"` inside the sheet (a failure of the user's action); Success is polite.
- **Money in tables:** the Amount cell carries a hidden word ("Credit ₹500.00", "Debit ₹172.80"), so the minus sign is never the only signal; en-IN grouping is text, not CSS.
- **Balance:** the card's accessible name joins value and runway ("Wallet balance ₹2,340.50, about 16 hours of phone calls").
- **Autopay:** each state has a word and an icon; the page Notice for Paused uses `role="status"` (persistent condition, not an alert, F-A11Y-015).
- **Tabs, tables, sheets:** as N §3.5, N §7.14, O §4.5. Contrast from tokens only (F-A11Y-009 black-on-blue retired).
- **Touch:** presets 44 px, full-width equal columns on phones; sticky footer above `env(safe-area-inset-bottom)`; Dismiss and action targets at least `--space-8` apart (F-RWD-013).

### 2.16 Responsive summary (Billing)

| | ≥1440 | 1280–1439 | 1024–1279 | 768–1023 | 320–767 |
|---|---|---|---|---|---|
| Header | H1 · meta · Top up | same | same (rail) | TopBar title + wallet chip; row: meta · Top up | same; meta shortens to "Last top-up 21 Sep" |
| Route tabs | row | row | row | scrolls, edge fade | scrolls, edge fade, selected tab kept in view |
| Wallet cards | 7 + 5 columns | 7 + 5 | 6 + 6 | stacked | stacked |
| Ledger / invoices | P1–P3 | P1–P3 | P1–P2 | P1, key pinned | ListRow (amount trailing on line 1) |
| Record sheets | docked 440 | overlay | overlay | modal, full height | full screen, Back link |
| Top-up sheet | gate 640, right | same | same | full height, 100% width up to 640 | full screen, sticky footer, presets 3-up |
| UPI step | QR first | QR first | QR first | QR first on fine pointers; intent first on coarse | "Open UPI app" first |
| Usage | 4 tiles, chart 240 | 4 tiles, chart 240 | 4 tiles, chart 200 | 2 × 2 tiles, chart 200 | tiles scroll-snap (compact), chart 160 |
| Plans | 4 PlanCards across | 2 × 2 | 2 × 2 | 2 × 2 | stacked |
| Autopay form | 720 column | same | same | same | full width, sticky action bar |

### 2.17 Telemetry (optional)

UPI IDs, UTRs, GSTINs and names never enter analytics; amounts are bucketed.

| Event | Properties | Answers |
|---|---|---|
| `topup_sheet_opened` | entry (baseline · chip · notice · call_reason · palette · billing_header · autopay_card), wallet state (ok · low · empty) | Which entry points work (F-UX-002 regression watch) |
| `topup_amount_chosen` | preset or custom, amount bucket | Whether presets fit |
| `topup_validation_error` | code | Where people struggle |
| `upi_step_shown` | mode (qr · intent · collect · hosted) | Payment path mix |
| `payment_result` | state (captured · declined · expired · unknown), seconds to final | Payment reliability |
| `payment_pending_closed` | – | People leaving mid-payment |
| `autopay_setup` | step (started · approval_shown · approved · declined · expired) | Mandate funnel |
| `autopay_retry` / `autopay_failed_viewed` | – | Recovery |
| `invoice_downloaded` | bulk (bool) | Invoice use |
| `plan_switch` | from, to, result | Plan movement |
| `legacy_redirect_hit` | from (settings_wallet · settings_autopay · meetings_billing) | When the redirects can be removed |

**North-star measure for this area:** median time from a call blocked by the wallet to a confirmed top-up (target under 90 s), and the share of workspaces whose calls paused at ₹0 while autopay was off.

### 2.18 Acceptance criteria (Billing)

- [ ] No in-app link points at `/settings#wallet`, `/settings#autopay` or `/settings#meetings-billing`; each of those URLs redirects as §0.3 says; the CI hash-link check passes.
- [ ] From Cockpit, Leads, Flows, the Baseline, the low wallet chip and ⌘K, "Top up" opens the Top-up sheet over the current page (Playwright), and closing it returns focus to the trigger.
- [ ] `/billing` redirects to `/billing/wallet`; the five tabs are links with `aria-current` and survive reload and Back.
- [ ] At 1440×900 the Wallet tab shows exactly one filled Neel button (Top up) in every wallet state.
- [ ] The balance is never rendered as "₹0.00" while loading; a skeleton shows instead.
- [ ] Runway text follows `formatRunway` (§3) and names the rate it uses.
- [ ] Top-up amounts 0, −50, 5, 99, 1,00,001 and "abc" each show the right error on blur or submit and are never rewritten; "Rs 1,000" is read as 1000; typing 500 selects the ₹500 preset and typing 750 clears it.
- [ ] The Pay button names the amount charged; a tax row appears only when the quote has tax.
- [ ] Double-activating Pay creates one payment order (idempotency key, verified server-side).
- [ ] The balance changes only after the server confirms; closing the sheet mid-payment shows Payment pending on Billing and a toast on confirmation.
- [ ] "You were not charged" appears only when the payment status says so.
- [ ] Autopay shows one status (no duplicate "Status:" line); Off, Waiting for approval, On, Paused and Needs renewal each render with the copy in §2.8; Turn off asks for confirmation.
- [ ] Usage counts calls, not legs; test calls have their own row; the By product total equals the Spend tile and the sum of ledger charges for the same range.
- [ ] Plans: no price wraps between the number and its unit at 1024 or 375; the PAYG card reads "30 free minutes each month, then ₹2.40/min"; Settings no longer lists Meetings Billing.
- [ ] Invoices paginate and each row has a Download button whose name includes the invoice number; GSTIN and PIN code validate on blur; a member without access sees the no-permission state naming an admin.
- [ ] No WalletNotice renders on any Billing route (F-UX-028).
- [ ] At 375 the Top-up sheet is full screen with a sticky footer, presets are three equal 44 px columns, "Open UPI app" is the first action, and nothing scrolls sideways at 320.
- [ ] axe is clean on every tab and every sheet state, in both themes; `check-contrast.mjs` passes.
