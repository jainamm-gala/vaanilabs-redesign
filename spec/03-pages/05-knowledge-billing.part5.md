### 2.9 Usage tab (`/billing/usage`)

**Job:** see what the money bought and whether spend matches the calls. It shares the metrics layer with Call reports and Analytics (`lib/metrics.ts`, `03-pages/04` §1.1), so a call count here equals the count there for the same range.

- **Range:** one `DateRangePicker` under the tabs (`?range=`; presets This month (default) · Last month · Last 30 days · This financial year · Custom). A scope line in `meta-12` `--text-3` states the counting rule: "1–27 Sep 2026 · calls, not legs · test calls shown separately".
- **StatGrid** (N §4.8), four `StatTile`s, each with a definition tooltip and a delta against the same days of the previous period (`deltaTone`, N §4.7):

| Tile | Example | Scope line | Delta tone |
|---|---|---|---|
| Spend | ₹1,284.60 | "Wallet charges · this month" | neutral (spend is neither good nor bad) |
| Calls | 412 | "Calls, not legs · test calls excluded" | up is good |
| Phone call time | 7h 30m | "Billed talk time" | neutral |
| Average cost per call | ₹2.62 | "Median ₹2.40" | neutral |

- **Chart:** `ChartFrame` "Spend per day", meta "This month · wallet charges by product", `StackedBarChart` in the categorical palette in fixed order: Phone calls `--chart-1` · Meeting agent `--chart-2` · Meetings `--chart-3` · API text voice `--chart-4` (N §11.5); legend with totals; "View as table". Never state colours for series.
- **By product** (`DataTable frame="framed"`, no pager, a total row):

| Product | Rate | Used | Free allowance | Charged |
|---|---|---|---|---|
| Phone calls (voice agent) | ₹0.04/s | 412 calls · 7h 30m | – | ₹1,080.00 |
| Meeting agent | ₹0.08/s | 3 meetings · 25m | – | ₹120.00 |
| Meetings | ₹0.01/s after free minutes | 1 meeting · 29m | 29 of 30 free min used | ₹0.00 |
| API text voice | ₹0.04/s | 35m 15s | – | ₹84.60 |
| Browser test calls `Tag outline "Test calls"` | as billed (BL7) | 41 tests · 38m (2 legs counted once) | – | from the server |
| **Total** | | | | **₹1,284.60** |

  Rates in this spec are examples taken from the public API docs (4 / 8 / 1 paise per second); the rates endpoint is the only source in the product (BL1). Footnote: "Browser test calls are stored as two legs and counted once here." Link: "See cost per call in Call reports" (`/call-reports?range=<same>&columns=+cost&sort=cost:desc`).
- **Reconciliation rule** (fixes F-UX-011): for any range, Spend = the sum of charge rows in the Wallet ledger = the By product total. A CI data test asserts it on seeded accounts.

### 2.10 Plans tab (`/billing/plans`)

Absorbs Settings › Meetings Billing (F-UX-021); `/settings#meetings-billing` redirects here.

**Your rates** (`title-16`; meta "Prepaid · charged from your wallet"): a framed `DataTable` without pager: Product · Rate · Per minute · Billing unit. The Billing unit column states exactly what the backend does, "Per second" or "Per minute, rounded up" (F-QA-011); the same sentence is reused by `/pricing` and `/docs/api/billing` (open question 1). A row for inbound number rental appears only if a rental exists (open question 7).

**Meeting minutes plan** (`title-16`):
- Current plan `Card`: "Pay as you go" `title-14` + `Tag outline "Current plan"`; `ProgressBar` labelled "Free minutes this month", value "1 of 30 used"; meta "Resets 1 Oct 2026".
- Plan comparison: four **PlanCards** (a `Card` recipe, §3) in a grid `repeat(auto-fit, minmax(calc(var(--space-40) * 6), 1fr))`, gap `--space-group-gap`; 4 across at ≥1280, 2 × 2 at 768–1279, stacked below 768 (fixes 132 px cards with wrapped prices).

| PlanCard part | Spec |
|---|---|
| Name | `title-16` ("Starter") |
| For whom | `body-14` `--text-2`, one full sentence, never truncated ("For solo founders running a few demos a week.") |
| Price | `num-20` "₹499" + `body-14` `--text-3` "/ month", one line, `white-space: nowrap` (never "₹499/ / mo") |
| Included | `data-13`: "10 h of meetings included, then ₹2.40/min" |
| Points | up to 3 lines, `data-13` with `check` 12; no vendor names ("Reserved capacity", not "Reserved LiveKit capacity") |
| Action | Current plan: `Tag outline "Current plan"`, no button. Others: secondary **Switch to Starter…** (one per card; no Neel here, the page keeps "Top up" as its only primary) |
| Pay as you go | "₹0 / month" · "30 free minutes each month, then ₹2.40/min" (replaces "Free / Unlimited included / then ₹2.40/min") |

**Plan change sheet** (`Sheet variant="gate"`, a money gate, G §5.6): title "Switch to Starter"; KeyValueList: New plan · Price "₹499 / month" (+ tax row if the quote has one) · Starts "Today, 27 Sep" · Charged "₹499 from your wallet today" (charge source and proration: open question 5) · Included "10 h of meetings each month, then ₹2.40/min". If the wallet cannot cover it, the primary is `aria-disabled` with "Wallet is ₹42.10. Top up at least ₹457 to switch." and a **Top up** link. Primary label names the money: **Pay ₹499 and switch**. A downgrade says when it takes effect: "Starter stays active until 26 Oct. Pay as you go starts then." · **Switch at the end of the period**.

**Enterprise:** one line after the plans: "Need higher volumes or a custom rate? **Talk to sales**" (same tab).

### 2.11 Invoices tab (`/billing/invoices`)

- **Billed to** (`Card` plain, compact `KeyValueList`): Legal name "Sample Realty Pvt Ltd" · GSTIN · State (place of supply) · Address; secondary sm **Edit billing details…** → `Dialog` md: Legal name (required) · GSTIN (optional; "Enter a 15-character GSTIN, like 27ABCDE1234F1Z5.") · Address · City · State (Select) · PIN code (6 digits: "Enter a 6-digit PIN code.") · Email for invoices (optional). Hint on the dialog: "Changes apply to invoices issued from now on." With no GSTIN: inline info Notice "Add your GSTIN to claim input tax credit on your invoices. **Add GSTIN**".
- **Toolbar:** `Select` "Financial year" (FY 2026–27 default, April to March, IST) · tertiary **Download all (ZIP)** with the sentence "12 PDF invoices for FY 2026–27" (states contents, like Data Export does).
- **Table** (`DataTable frame="framed"`, pager 25): Invoice (key, id in `mono-12`, "INV-2026-0142") · Date · For ("Top-up", "Autopay top-up", "Starter plan · Oct 2026") · Taxable value · GST · Total (numeric columns right-aligned, tabular) · Status (`StatusTag` domain `invoice`: Paid · Refunded · Credit note) · actions: inline tertiary sm **Download** (`download` icon; name "Download invoice INV-2026-0142") and ⋯ (Copy invoice number · Email to accounts…).
- **Invoice sheet** (`record`): the same facts as a KeyValueList, the related transaction link, and **Download PDF** (secondary) in the footer.
- **Empty:** "Invoices appear here after your first top-up." · **Top up** (O §15.3).
- **No permission:** "Only admins can see invoices. Ask Anika R. for access." (N §7.12).

### 2.12 Billing states (all tabs)

| State | Wallet | Top-up sheet | Usage · Plans · Invoices | Autopay |
|---|---|---|---|---|
| **First use** (₹0, never topped up) | Balance ₹0.00 with the empty Notice; Transactions EmptyState first-use "Top-ups and charges appear here with the balance after each one." (no action: the header has Top up); autopay card Off | Normal; balance line "Balance ₹0.00" | Usage: not-yet EmptyState "Usage appears here after your first call." · Invoices: first-use | Off form |
| **Loading** | `num-28` skeleton for the balance and a bar for the runway; never "₹0.00" before it is known (F-UX-030); TableSkeleton | Balance line skeleton; the Pay button shows "Pay via UPI" until the quote returns | KpiSkeleton, ChartSkeleton, TableSkeleton | FormSkeleton |
| **Partial** | No rates: runway hidden, "Rate ₹0.04/s" shown (D §8 interim) · no balance-after: column hidden | No tax in the quote: tax row hidden | No usage aggregates: Usage shows rates only with the not-yet state | Only Inactive/Active known: Off/On only |
| **Error** | SectionError in the card ("Couldn't load your balance · Retry", value "–"); table error Notice | InlineError under the amount "Couldn't get a price for this amount. **Retry**"; Pay `aria-disabled` with that reason | SectionError per card; table Notice | PageError with Retry |
| **Offline** | ConnectionBar; balance meta "as of 11:42 am"; **Top up** `aria-disabled`, reason "You're offline" | A waiting payment keeps its countdown and says "You're offline. We'll check the payment when you reconnect." | Stale data kept with "Showing data from 11:42 am" | Buttons `aria-disabled` "You're offline" |
| **Permission** (BL9) | Top up `aria-disabled`, "Only admins can add money. Ask Anika R." | Not reachable | Invoices: no-permission state | "Only admins can change autopay. Ask Anika R."; the state is still visible read-only |
| **Payment pending** | Page Notice info: "**Payment pending.** ₹590.00 started at 10:42 am. Your wallet updates when UPI confirms. **Check status**"; a Pending ledger row | Waiting / No answer yet (§2.7) | – | Waiting for approval (mandate) |
| **Low** | Card StatusText warning; Baseline segment amber; nav badge "Low" | Balance line in `--warning-text` with its word ("Low") | – | Suggests turning on autopay (Off state only) |
| **Empty (₹0)** | Card Notice warning; Baseline "Blocked"; call actions elsewhere carry the reason | – | – | – |
| **Autopay failed** | Page Notice danger "**Autopay couldn't top up on 24 Sep.** … **Fix autopay**" + card Paused | – | – | Paused state (§2.8) |
| **Success** | New ledger row at the top, balance and runway update in place; polite announcement "₹500 added. Wallet ₹542.10." | Success state (§2.7), else the toast after confirmation | Invoice row appears | On state + toast |
