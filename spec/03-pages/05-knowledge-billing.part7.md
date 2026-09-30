## 3. New components needed

Everything else on these pages is an existing component used by its spec name. Every size below is an existing token or a `calc()` of one. **One token (registered in 01-foundations §18, in `tokens.json` 1.1.0):** `--qr-fg` (= `--ink`) and `--qr-bg` (= `--graphite-0`), fixed in both themes, because a scannable code needs dark modules on a light quiet zone and must not invert in dark mode (found while rendering the mock).

| Component | Kind | Anatomy and rules | Props sketch |
|---|---|---|---|
| **TopUpSheet** | Composition (`components/billing/top-up-sheet.tsx`), mounted once in `AppShell` | `Sheet variant="gate"` + CurrencyInput + summary KeyValueList (rows) + UpiPayment. Steps: Amount → Pay → Result (§2.7). Opens from `?topup=1` (and `amount`), removes the params on close with `replaceState`, remembers its entry point for telemetry and for returning focus. One idempotency key per open sheet | `useTopUp().open({ entry, amount?, returnFocusTo? })`; `<TopUpSheet />` reads `useWalletState()`, `useTopUpQuote(amount)`, `usePaymentStatus(orderId)` |
| **UpiPayment** | Component (`components/billing/upi-payment.tsx`), `mode="payment" \| "mandate"` | Header line "Pay ₹590.00 with any UPI app" (or "Approve autopay with your UPI PIN"); **QrCode** (SVG from the server's UPI intent payload; modules in `--qr-fg` on `--qr-bg` in both themes, 4-module quiet zone, `calc(var(--space-40) * 5)` = 200 px, `role="img"`, forced colours `CanvasText` on `Canvas`); numbered steps; **Countdown** (`meta-12` tabular, "04:32 left", announced once at 1 min and at expiry); "Open UPI app" (intent link, primary on coarse pointers); "Pay using UPI ID" (TextInput + Send request, only when the provider supports collect); result states from §2.7. Status arrives by server-sent events, else polling every 3 s with backoff until expiry, then "No answer yet" | `{ mode, amountPaise, payeeName, qrPayload, intentUrl, supportsCollect, expiresAt, status, onSendCollect(vpa), onCancel(), onRetry(), onCheckStatus() }` |
| **RetrievalResult** | Component (`components/knowledge/retrieval-result.tsx`) | `<li>` grid `auto minmax(0,1fr)`: rank (`label-12` `--text-3`) · line 1: source name link (`data-13` 500) + location (`meta-12` `--text-3`) + Meter + match word (`meta-12` `--text-2`) · line 2: passage (`read-15`, `lang` set, clamped to 4 lines, "Show all"). Below-threshold results use `--text-2` for the passage and live under a Collapsible. Skeleton: three rows (O §13.2 transcript-like bars) | `{ rank, source: { id, name, href }, location?, score?, threshold?, strength: 'strong' \| 'good' \| 'weak' \| 'below', text, lang? }` |
| **Meter** | Primitive (`components/ui/meter.tsx`); promotes the DataTable meter cell (N §7.3) to a standalone mark | Four segments of `--space-8` × `--space-4`, gap `--space-2`, radius `--radius-2`; filled `--text-2`, empty `--surface-3` (a neutral magnitude, never Neel or a state colour); `role="img"` with an `aria-label` that states the word and value; `data-mark` for forced colours | `{ value: 0..4, label: string }` |
| **TablePreview** | Component (`components/ui/table-preview.tsx`), shared with Leads Import (the "Import mapping preview" C §7.2 references but no spec defines) | Dialog lg body: file line ("Unit inventory.csv · 200 rows · 6 columns"), column list with sample values and a role per column (Knowledge: include / name rows by; Leads: map to field, phone required), a 5-row preview (Knowledge: rendered as passages; Leads: as mapped records), per-row problems in `--danger-text` with the row number | `{ file, columns: { name, sample, role }[], rows, errors: { row, message }[], mode: 'knowledge' \| 'leads', onChange }` |
| **PlanCard** | Recipe on `Card` (N §4), not a new primitive | §2.10 table. Grid `repeat(auto-fit, minmax(calc(var(--space-40) * 6), 1fr))` | `{ plan, current: boolean, onSwitch() }` |
| **PageDropTarget** | Component + `useFileDrop` hook | An overlay over the content column while files are dragged over it: `--accent-soft` fill, 1 px `--accent-mark` inset border (solid, never dashed), `title-16` "Drop files to add them to Knowledge"; ignores drags that start inside the page; announces once; drop hands files to the Add dialog | `{ accept, onFiles, label }` |

**Library additions** (not components):

- `lib/format.ts` · `formatRunway(seconds)`: under 60 min → "about N min" (floored; under 1 min → "under a minute"); 1–10 h → "about H h M min", floored to 5 min, "0 min" dropped; 10–99 h → "about H h"; 100 h and more → floored to 10 h ("about 690 h"). It always pairs with the rate it used ("at ₹0.04/s"). Rounding down keeps the promise conservative (P1). The Baseline, WalletNotice, balance card and Top-up sheet all call it.
- `lib/format.ts` · `maskUpiId('anika.r@okaxis')` → "a•••••@okaxis" (first character, five bullets, handle). Never logged, never in a URL.
- `lib/status.ts` domain additions: `knowledge` + Uploading… · Reading… · Couldn't upload; `payment` (Completed · `check` · success; Pending · `clock` · info; Failed · `circle-x` · danger; Refunded · `undo-2` · neutral; Expired · `timer-off` · neutral (N §5.3 rule 4: Pending already uses `clock`)); `invoice` (Paid · `check` · success; Refunded · `undo-2` · neutral; Credit note · `file-minus` · outline); `proposal` (Pending · `clock` · info; Added · `check` · success; Dismissed · `x` · neutral); `autopay` + Waiting for approval · `clock` · info.
- `lib/knowledge.ts`: source type → Lucide icon and word; failure reason code → sentence and fix (§1.6).
- `lib/nav.ts`: Billing keywords for ⌘K ("wallet", "recharge", "UPI", "balance", "invoice", "GST").

## 4. Reconciliations with the component specs

| # | Where the specs differ | This spec's choice |
|---|---|---|
| R1 | N §1.6 says the low wallet chip links to `/billing?topup=1`; O §10.2 says Top up opens the sheet in place | In place: `?topup=1` on the current route (the user's task is on that page). `/billing?topup=1` still works by redirecting to `/billing/wallet?topup=1`. Proposed edit to N §1.6 |
| R2 | N §7.3: a status cell holds one StatusTag; D §6.6 and O §11.1 ask for a status sentence in the Knowledge column | The Knowledge Status column uses `StatusText` md (sentence with passage count); phones and sheets use `StatusTag` |
| R3 | F-UX-034 allowed a disabled "Admins only · Request access" entry | Hidden for members (N §0.7: roles hide, never disable) plus Forbidden for direct visits |
| R4 | F-UX-021 proposed four tabs with autopay inside Wallet; D §6.6 lists five | Five tabs (D wins); Wallet carries an autopay summary card that links to the Autopay tab |
| R5 | O §3.3 says there is no filled red anywhere; C §2.1 allows a solid destructive button only inside ConfirmDialog | This spec uses `ConfirmDialog tone="danger"` and inherits whichever treatment the component owners settle |
| R6 | O §3.1 lists "Top up" under tier 4 (Gate) without a Gate spec | **Resolved** by `spec/02-components-gate.md` §5.6: Top up, Plan change and Autopay are money gates (the quote is the consequence line, the primary names the amount charged, `⌘/Ctrl+Enter` confirms where an in-app primary exists) |

## 5. Open questions for the product owner

1. **Billing unit and rates.** Per second, or per minute rounded up (F-QA-011)? Meetings: ₹2.40/min (Meetings Billing) or 1 paisa/s (public docs)? One rates endpoint must feed the app, `/pricing` and the docs.
2. **GST on top-ups.** Added on top (₹500 credit, ₹590 charged) or included (₹590 paid, ₹500 credit)? Is the invoice issued at top-up or monthly on usage?
3. **UPI on iOS and collect requests.** iOS shows no app chooser for generic UPI links; use app-specific links or lead with the QR? Does the provider still support "Pay using UPI ID" collect requests for merchant payments?
4. **Autopay rules.** The pre-debit notice timing, the largest debit allowed without the payer re-authenticating, the mandate validity period, and whether threshold-triggered debits are supported, as the provider implements RBI's e-mandate rules. The Autopay copy (§2.8) depends on these.
5. **Plan changes.** Charged from the wallet or by UPI? Prorated? Downgrades at period end?
6. **Roles.** Proposed: members add and test knowledge and can top up; admins delete sources a flow uses, review proposals, manage autopay and see invoices. Confirm.
7. **Inbound number rental.** Is there a monthly charge? If so it belongs in Your rates and the ledger.
8. **Knowledge and flow versions.** Sources are live as soon as they are indexed (K4). Should a flow version pin its sources, so Publish covers knowledge changes? This spec assumes not, and says so in the UI.
9. **Limits.** File size, files per upload, text length, CSV rows, and whether web sources can crawl beyond one page.
10. **Low-balance threshold.** Runway under 60 min at the median rate (O §21 Q1)? Editable in Autopay?
11. **Refunds.** Are failed or dropped calls refunded (ledger "Refund" rows)? Is unused balance refundable?
12. **Payment processor name.** May receipts and invoices name the processor (a trust signal), as the one exception to the vendor-name rule (F-UX-016)? Proposed: invoices and the payment receipt only, never the sheet body.

## 6. Traceability

| Finding (severity) | Resolved in |
|---|---|
| F-UX-002, F-QA-004 (high) | §0 B2, §0.3 redirects, §2.4 entry points, §2.18 |
| F-UX-011 (high), F-QA-006 | §0 B5, §2.9 Usage and the reconciliation rule |
| F-QA-011 (high) | §2.10 Your rates billing unit, open question 1 |
| F-A11Y-003 (high) | §1.7 Dropzone and Fields, §1.15, §2.15 |
| F-A11Y-008, F-A11Y-009 (high) | Tokens only (§1.15, §2.15); Button primary label on Neel |
| F-UX-021 (medium) | §2.2, §2.6, §2.7, §2.10 |
| F-UX-033 (medium) | §0 K1–K3, §1.6, §1.7, §1.8 |
| F-UX-034, F-QA-018 (medium) | §0 K5, §1.10 |
| F-UX-016 (medium) | §1.11, §1.14, banned-terms lint |
| F-UX-019 (medium), EXPLORE-DATA-18, QA-B-26 | §1.9 errors under the field |
| F-UX-028, F-A11Y-015, F-RWD-013, F-QA-036 (medium / low) | §0 B6, §2.6 balance card states, no WalletNotice on Billing |
| F-RWD-016 (medium) | §1.4 tablet and phone, §1.6 pinned actions |
| F-QA-021, F-UX-025 (medium) | §2.7 CurrencyInput validation, §2.8 Autopay fields, §2.11 GSTIN and PIN |
| F-A11Y-016, F-A11Y-020 (medium) | Source type SegmentedControl, preset radiogroup, labelled fields |
| F-UX-030 (medium) | §1.12 and §2.12 loading rows |
| F-VIS-001, F-VIS-005, F-VIS-006, F-VIS-024, F-VIS-034 | PageHeader, Button, `formatWhen`, containers (§1.2, §2.2) |
| F-UX-035 (medium) | Delete in ⋯ with Undo or confirmation (§1.6) |
| F-UX-017, F-RWD-005 | One nav name; ⌘K keywords; Baseline entry (§2.4) |
| F-UX-015, EXPLORE-DATA-21 | Numbers are not Billing's job (§2.1, §2.14) |
| F-UX-043 | No em dashes in any string above |

## 7. What the reference mock verified

`05-knowledge-billing.html` was rendered at 1440 × 900 (light and dark) and at a 375 × 812 touch viewport. Findings that changed this spec:

- **Knowledge table width.** With the Test panel docked at 1440, the table gets exactly 768 px. An inline "Replace file…" on a failed row overflowed it, so failed rows carry their fix as the first ⋯ item and in the sheet's Notice (§1.6). "Used by" shows a flow count, not "All-source lookups", to keep the column short.
- **QR code in dark mode.** A code drawn in `--text` on `--surface` inverts in dark and stops being reliably scannable, hence the fixed `--qr-fg` / `--qr-bg` request (§3).
- **Notice actions.** The Autopay Paused and renewal actions are small secondary buttons inside their Notices (O §10.1), so the Billing header's "Top up" stays the only filled button (§2.8).
- **Phones.** Touch density applies (48 px rows, 44 px controls, 16 px field text); nothing scrolls sideways at 375 or 320; presets fit as three equal 44 px columns; the Knowledge ListRow keeps the status tag and the failure reason visible.
- **Root font size.** The mock carries the `html { font-size: 100% }` workaround for the foundations defect (N §0.6); without it every size in this spec renders at 87.5 %.
