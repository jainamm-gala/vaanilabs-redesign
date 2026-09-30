---

## 6. The rest of the public site (brand consistency, high level)

Each page moves onto MarketingLayout, Hanken body copy, tokens and the claims sheet. Content rewrites belong to the content owner; the design rules below are required.

| Page | Keep | Change |
|---|---|---|
| `/try` (from `/build.html`, PA14) | The three-step "Your scenario → We build it → Talk to it" idea; the 22-language choice; the explicit, unticked consent box | MarketingLayout; the language choice becomes a Combobox with LanguageMarks, at least 320 wide (no "Hindi + English (Hinglish" truncation); mobile and code use PhoneInput `kind="mobile"` and OneTimeCodeInput (§18); "DPDP + RBI compliant by default" becomes the claims sheet's specific controls; the gradient nav CTA at 1.43:1 goes; "Get started" goes to `/signup` |
| `/security` | The candid content, the table of contents, "shipped versus planned" | Hanken prose (no mono paragraphs); internal identifiers removed (table names, "anon key"); typos fixed; OAuth list and TOTP status from the claims sheet; "Last updated" from the CMS; a `main` landmark. **The only page that states compliance status** (F-QA-009). |
| `/enterprise` | The pilot offer: a setup week, a 2–4 week managed pilot, a closeout report | Rewritten for buyers (outcomes, process, deliverables, security posture linked to `/security`); raw paths become descriptive links; icon-only links get names; "VaaniVoice" becomes Vaani Labs; the orange-teal mandala badge goes; the primary is **Request a pilot…** (the §7.6 dialog) |
| `/docs`, `/docs/*` | The API structure, per-surface pricing, 402 semantics, MCP / OpenAPI / SDKs | The same shell with a left rail; `/docs/api`'s own look (Instrument Serif, the "VV API" logotype, the white strip) is retired; every card is a link or visibly "Coming soon" with no hover; "4paise / sec" is rendered from the rates endpoint; one billing-unit sentence shared with Billing › Plans (F-QA-011) |
| `/about` | Real founders (reuse `/contact`'s photos and bios) | Unpublished, or cut to verifiable facts with an owner in the claims sheet. No named customer, funding or certification without documentation (F-QA-001). |
| `/contact` | Founder cards, hours, booking | One sales address and one booking link; the note form uses Field with labels and `autocomplete`; one wordmark |
| `/changelog` | Dated releases | Customer-facing wording (no RLS or table names); versions as H2s; kept current |
| `/status` | — | Fed by monitoring or removed; vendor names removed ("Telephony", "Sign-in") |
| `/blog`, `/careers` | — | Hidden from navigation until real; blog posts link to real pages |
| Legal pages | Content | Hanken body, `main`, a real "Last updated" date |

---

## 7. Pricing (`/pricing`)

### 7.1 Purpose and jobs to be done

**Primary job.** *When I am deciding whether Vaani fits my budget, I want to see what a call costs and estimate my month, so I can start on my own or ask for a pilot.*

| # | Visitor | Job | Where |
|---|---|---|---|
| P1 | SMB owner | See the phone-call rate, estimate the month, start | Rates, Estimate, Get started |
| P2 | Enterprise buyer | Ask for a scoped pilot without filling in 19 fields | Enterprise pilot → Request a pilot… |
| P3 | Finance | Understand the billing unit, GST, refunds and what happens at ₹0 | Rates notes, Questions |

### 7.2 Findings addressed

- **F-QA-012:** no prices, no header navigation, 19 controls with placeholder labels, mono body copy, a third-party email address.
- **F-QA-011:** "per-second" alongside "rounded up to minutes"; free tier vs pilot vs prepaid.
- **F-QA-035:** two sales paths and three email domains.
- **F-A11Y-020 and F-A11Y-003:** placeholder-only labels.
- **F-A11Y-026:** no `main` and no `nav`.
- **F-RWD-018:** 6,792 px on a phone, with 14 px inputs.
- **F-QA-013:** a mono page with a Sora H1.

### 7.3 Information hierarchy

1. **The phone-call rate** (the first row of Rates, `num-20`).
2. **The estimate** for the visitor's own numbers.
3. **The two paths:** the access CTA (primary, in the site header and at the foot of the estimator) and **Talk to sales** (secondary, under the lead). The page head adds no second Neel button, so the screen never reads blue.
4. Then, in order: meeting-minute plans, the enterprise pilot, questions.

### 7.4 Layout and wireframes

```
Desktop ≥1280 (1440): container 1280; Rates 7 cols + Estimate 5 cols, gap 40
┌ MarketingHeader (Pricing is current: text + 2 px accent-mark underline) ──────────────────────────┐
├───────────────────────────────────────────────────────────────────────────────────────────────────┤ 80
│ Pricing                                                        (H1 display-40)                    │
│ Top up a wallet in rupees with UPI. Calls are charged per second of talk time.   (lead-16)       │
│ [ Talk to sales ]   (secondary; the header carries Get started, the estimator its own)            │
│                                                                                                   │
│ Rates (H2 title-24)                                      ┌ Estimate your month (H2 title-16) ─────┐│
│ ┌ table: surface · border · radius-8 ─────────────────┐  │ Product      [ Phone calls         ▾] ││
│ │ Product              Rate      Per minute  Billing   │  │ Calls a month [ 1,000              ] ││
│ │ Phone calls          ₹0.04/s   ₹2.40       Per second│  │ Average call length [ 2    ] min     ││
│ │ Browser and API voice₹0.04/s   ₹2.40       Per second│  │ ─────────────────────────────────── ││
│ │ Meeting agent        ₹0.08/s   ₹4.80       Per second│  │ About ₹4,800 a month      (num-28)   ││
│ │ Meeting rooms        ₹0.01/s   ₹0.60       after 30  │  │ 2,000 min of phone calls at ₹0.04/s. ││
│ │                                            free min  │  │ Real cost depends on call length.    ││
│ └──────────────────────────────────────────────────────┘  │ [ Get started ]                       ││
│ Prices exclude GST. Rates as of 1 Sep 2026.               └───────────────────────────────────────┘│
│ Top-ups from ₹100 to ₹1,00,000 with any UPI app.                                                   │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Meeting minutes (H2)  For the meeting agent. Phone calls are always pay as you go.                │
│ [PlanCard Pay as you go] [PlanCard Starter ₹499/month] [PlanCard …] [PlanCard …]                  │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Enterprise pilot (H2)                                                                             │
│ 1  Setup week: demo account, your flow, scripts and integrations       [ Request a pilot… ]        │
│ 2  Two to four weeks of managed calls with a weekly review             Book a call (external)     │
│ 3  Closeout report: transcripts, recordings, results, a recommendation                            │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Questions (H2), a 720 column of disclosures                                                        │
└ MarketingFooter ──────────────────────────────────────────────────────────────────────────────────┘

Laptop 1024–1279: the same two columns (7 / 5), plans 4 across at ≥1280 and 2 × 2 below it.
Tablet 768–1023: Rates at full width, then Estimate as a Card below it; plans 2 × 2; the pilot steps
above its buttons.
Phone (390): each rate is a two-line list row ("Phone calls" · "₹0.04/s · ₹2.40 a minute · per second").
Estimate fields stack at full width with 16 px text; plans stack; the pilot buttons are full width, 44 px.
Target ≤ 4 screens at 390 × 844 (6,792 px today).
```

### 7.5 Components and configuration

**RatesTable** is a `DataTable` (N §7) with `density="standard"`, no pager, no selection and no row actions. It is `<table>` with `<caption>` "Rates" and these columns:
- **Product** (`data-13`, 500);
- **Rate** (`num-20` in the first row only, `data-13` in the others, right-aligned, tabular);
- **Per minute** (right-aligned);
- **Billing unit** (`data-13` `--text-2`).

Data comes from the public rates endpoint (A10), **the same source as Billing › Plans** (05-knowledge-billing §2.10). The billing-unit sentence is shared word for word by the lead line, the FAQ, the docs and Billing (F-QA-011). The values shown here (₹0.04/s and so on) are the public API docs' figures, used as examples until the endpoint answers. Under the table, in `meta-12` `--text-3`: "Prices exclude GST." (only if true), "Rates as of {date}", and the top-up bounds from BL3 ("₹100 to ₹1,00,000").

**Estimator** is a `Card plain`, sticky at `top: calc(var(--size-header) + var(--space-24))` from 1024 up:
- **Fields:**
  - `Select` "Product" (default: phone calls);
  - `NumberInput` "Calls a month": 1 to 10,00,000, en-IN grouping, hint "Up to 10,00,000";
  - `NumberInput` "Average call length": 0.5 to 30, step 0.5, unit "min".

  Both NumberInputs keep invalid input as typed and show the error on blur ("Enter a number from 1 to 10,00,000."). Nothing is clamped (C §3.4, V8).
- **Result** (`role="status"`, polite, announced only after typing settles, throttled by `--timing-announce-throttle`):
  - "About ₹4,800 a month" in `num-28`;
  - the working in `body-14` `--text-2`: "2,000 min of phone calls at ₹0.04/s.";
  - "Real cost depends on how long calls last."
  - If the unit is per minute, rounded up: "Each call is rounded up to the next minute", and the maths uses `ceil(length)`.
  - The number is rounded to the nearest ₹100 **for display only**, with the exact value in the tooltip.
- **Action:** the access CTA (primary). No email is asked for to see a number.

**PlanCards** use the recipe of Billing §2.10 (name, who it is for, price as `num-20` + "/ month", included minutes, up to 3 points). On `/pricing` the cards have no buttons. One line follows them: "Choose a plan in Billing after you sign up." (§19 Q5). The Pay as you go card reads "₹0 / month · 30 free minutes each month, then ₹2.40/min" (the same string as the app).

**Enterprise pilot** is an ordered list of three steps (20 px number marks as in StageProgress "to do", `title-14` plus `body-14`), then **Request a pilot…** (secondary Button lg) and **Book a call** (link; `external-link` because it leaves the site). The CTAs in the header stay the only primary.

### 7.6 Request a pilot (Dialog md; full screen on phones)

Six fields in place of nineteen (F-QA-012). Each is a `Field` with a visible label and `autocomplete`:

| Field | Control | Rule and copy |
|---|---|---|
| Full name | TextInput `autocomplete="name"` | "Enter your name." |
| Work email | TextInput `type="email"` `autocomplete="email"` | "Enter a work email, like name@company.com." |
| Company | TextInput `autocomplete="organization"` | "Enter your company's name." |
| Calls a month | Select: Under 1,000 · 1,000 to 10,000 · 10,000 to 1,00,000 · Over 1,00,000 | "Choose a range." |
| What should the agent do first? | Select: Qualify leads · Reminders and collections · Answer inbound calls · Book appointments · Something else | "Choose one." |
| When do you want to start? (optional) | Select: This month · In the next 3 months · Just exploring | — |

- **Footer:** Cancel (tertiary) and **Send request** (primary). Under the fields, in `meta-12` `--text-3`: "We use these details only to reply to you. **Privacy policy**" and "We reply by email {reviewTime}." (only if the SLA is real).
- **Validation:** C §8.2. On submit, the first invalid field is focused; the form has more than three fields, so an error summary shows at the top.
- **Success:** the dialog body is replaced (O §2): a `check` in `--success-text`, the title "Request sent", "We'll reply to a•••@company.com. You can close this window." and Close. There is also a success toast when the dialog closes.
- **Failure:** an InlineError above the actions: "Couldn't send your request. Try again, or email sales@vaanilabs.in." with Retry. The typed values are kept.
- **Routing:** the request goes to the one sales address (A11). Nothing links to another domain (F-QA-035).

### 7.7 Questions (a disclosure list)

Radix `Collapsible` items in a 720 column. Each question is a button with `aria-expanded` (`title-16`), and the answer is in `body-14`. **A question whose answer the claims sheet cannot back is omitted, never guessed.**

| Question | Answer source |
|---|---|
| How am I charged? | The billing-unit sentence (A10) |
| What happens when my wallet reaches ₹0? | "Phone calls pause. Browser tests and free meeting minutes still work. Top up with UPI to continue." (the WalletNotice Empty copy, O §10.2) |
| Can I top up automatically? | Autopay by UPI mandate, "top up ₹X when the balance falls below ₹Y" (Billing §2.8) |
| Do I get GST invoices? | Billing › Invoices, per financial year (Billing §2.11) |
| Do Hindi and English calls cost the same? | The rates endpoint (only if rates do not vary by language) |
| Do I need my own phone number? | The claims sheet (Q3) |
| Can I get a refund? | Link to the refund policy |

### 7.8 States

| State | Treatment |
|---|---|
| Rates loading (client refresh only; the page is server-rendered) | The table keeps its header; the rows are static skeletons after 200 ms; the estimator result shows "–" (never ₹0) |
| Rates failed and no cached copy | SectionError "Couldn't load current rates. Retry". The estimator is hidden, and so is every CTA that quotes a price |
| Rates from the cache | "Rates as of 1 Sep 2026" stays visible, with no warning if the cache is under 24 h old |
| Estimator input invalid | A field error on blur; the result keeps the last valid estimate with "Fix the highlighted field to update" |
| `approval` mode | CTAs read **Request access**; the lead sentence adds "Accounts are reviewed before first use." |
| Signed in | The header CTA is **Open app**; the estimator CTA is **See your rates in Billing** (`/billing/plans`) |
| No JavaScript | Rates, plans, pilot steps and questions render (questions open by default); the estimator is replaced by "The estimate needs JavaScript. Rates are above."; **Request a pilot…** becomes a link to `/enterprise#pilot` with the same form as a page |

### 7.9 Microcopy (pricing)

| Before | After |
|---|---|
| "ENTERPRISE PILOT / Launch a paid pilot with the full Vaani Labs platform" | "Pricing" · "Top up a wallet in rupees with UPI. Calls are charged per second of talk time." |
| "Public pricing stays sales-led so the pilot scope matches your use case…" | removed |
| "Every plan includes" (there were no plans) | removed |
| "SUCCESS STORY" (×6) over generic copy | removed until real case studies exist |
| "Email us" / "Email krishal@advisio.in" | **Talk to sales** (sales@vaanilabs.in) · Book a call |
| "Start a pilot" with 19 placeholder-labelled controls | "Request a pilot…" with 6 labelled fields |
| "Target rollout date" (a free-text box) | "When do you want to start?" (a Select) |
| "Voice agents (textvoice + voicebot)", "Meeting agents (Vikash)" | "Phone calls", "Browser and API voice", "Meeting agent", "Meeting rooms" |
| "4paise / sec" | "₹0.04/s" from `lib/format.ts` |

### 7.10 Accessibility

- `main` and `nav` are present; the H1 is "Pricing"; the H2s are Rates, Estimate your month, Meeting minutes, Enterprise pilot and Questions.
- The rates are a real `<table>` with a caption and `scope="col"` headers; numbers are right-aligned and tabular.
- The estimator result is a polite `status`. The dialog follows O §1.3 (focus to the first field, trapped, returned to **Request a pilot…**).
- Touch inputs are 16 px (F-RWD-018).

### 7.11 Telemetry

`pricing_estimate` {`product`, `callsBand`, `lengthBand`}: bands only, never raw numbers typed by the visitor · `pilot_request_open` {`location`} · `pilot_request_submitted` {`volumeBand`, `useCase`, `timeline`} · `pilot_request_failed` {`code`} · `faq_open` {`id`} · `cta_click` (§5.12). Nothing here is sent before Allow.

### 7.12 Acceptance criteria (pricing)

- [ ] Every rate on `/pricing` equals Billing › Plans for a new workspace (the same endpoint; a contract test).
- [ ] The billing-unit sentence is byte-identical on `/pricing`, `/docs/api/billing` and Billing › Plans.
- [ ] The estimator equals `calls × length × 60 × rate` (or the per-minute formula) in unit tests; the display rounds, the tooltip shows the exact value, and input is never clamped.
- [ ] The pilot request has 6 fields, all with visible labels and `autocomplete`; an empty submit focuses the error summary; a 500 keeps the values and shows Retry; success replaces the dialog body.
- [ ] No link or `mailto:` on the page points to a domain other than `vaanilabs.in`, except the one booking link.
- [ ] The page has header navigation, `main` and a footer; at 390 × 844 it is ≤ 3,400 px tall; inputs are 16 px on touch.
- [ ] None of "SUCCESS STORY", "Every plan includes", mono body copy or 11 px text is present.
