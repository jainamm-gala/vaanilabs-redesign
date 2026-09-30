## 4. Indian inputs: phone and money

### 4.1 PhoneInput (+91)

**Purpose.** Enter a number that the product will call, verify, message or store: a lead's phone, "Call yourself", the Cockpit's Ready-to-call contact, a transfer target, the caller ID being verified, a profile phone. Today every one of these accepts "abc", validates only after the click, or reports the error 450 px away (F-QA-020, F-QA-021, F-UX-025, F-FLOW-015).

**Use when** the value is a phone number. **Don't use** for displaying a stored number (use the display group's `PhoneText`, masked `+91 •••••• 4821` in Hanken with tabular figures, data-nav §5.8), or for an inbound number the workspace owns (that is chosen from a Select of provisioned numbers).

**Anatomy.**

| Part | Spec |
|---|---|
| `prefix` | A segment inside the box: "+91" in `data-13` `--text-2`, padded `--field-px`, separated from the number by a 1 px `--border` divider. Static (not focusable) by default. With `allowInternational`, it becomes a compact trigger ("IN +91 ▾", no flags or emoji) that opens a searchable country list (Combobox, part 5) with India pinned first |
| `input` | The national number. Sans `body-14` (16 on touch) with `tabular-nums`; never mono (mono is for masked display only, F §2.3) |
| `trailing` | Optional: a clear button on the Cockpit contact field; an async status word ("Already a lead · Open") |
| `hint` | "10-digit mobile, like 98765 43210" (the example lives here, not in a placeholder) |

Box, height, border and states are TextInput's (part 3). Width `--field-w-medium` (320).

**Behaviour.**

| Situation | What happens |
|---|---|
| Typing | Digits, spaces, hyphens, dots and brackets are accepted as typed; nothing is inserted under the caret. Letters are kept (never block typing) and flagged on blur |
| Paste | Any common format is accepted and normalised: `+91 98765 43210`, `+919876543210`, `09876543210`, `91-98765-43210`, `(098765) 43210`. A leading `+91`, `91` (12 digits) or `0` (11 digits) moves into the prefix, so the field never shows "+91 +91" |
| Blur | Parse with `libphonenumber-js` (region `IN`). Valid: display grouped as `98765 43210` (mobiles 5-5; landlines by STD code, `80 4567 2210`). Invalid: keep the text as typed and show the error |
| Value | The form value is E.164 (`+919876543210`), never the display string. Empty stays empty (not "+91") |
| Type rules | `kind="mobile"` (OTP, WhatsApp, "Call yourself"): 10 digits starting 6–9. `kind="any"` (lead phone, transfer target): any valid Indian number. `allowInternational` only where a foreign number is legitimate (transfer to an overseas office) |
| Async checks | Lead forms check duplicates on blur: hint "This number is already a lead. **Open lead**" (link), without revealing the other lead's name to users who cannot see it. Verify flows send the code only after the number is valid |

**Error copy.** "Enter a 10-digit mobile number, like 98765 43210." · "Enter a phone number with its STD code, like 80 4567 2210." · "This number has 9 digits. Mobile numbers have 10." (a specific count beats a generic message) · for international: "Enter the number with its country code, like +971 50 123 4567."

**Masking and permissions.** Users who may not see full numbers never get an editable phone field: they see `PhoneText` masked (`+91 •••••• 4821`) in a read-only field with the hint "Only admins can see full numbers." Editing an existing number shows it unmasked only to users with that permission.

**States.** TextInput's, plus: *verifying* (hint "Sending code…" then the OTP field appears below; the phone field becomes read-only with a "Change number" link); *verified* (read-only, hint "Verified 21 Sep 2026" with a `check` icon in `--success-text`; green is allowed because verification is a real, computed state, P2).

**ARIA.** `type="tel" inputmode="tel"`, `autocomplete="tel-national"` when the prefix is static (the browser fills the national part) or `"tel"` with the international picker; `aria-describedby` → hint or error. The static prefix is part of the visible label context; the label reads "Phone number" and the input's description includes "Indian number, +91" (visually hidden) so screen-reader users know not to type the code.

**Responsive.** ≥ 768: 320 wide. < 768: full width, 44 tall, 16 px text; the prefix stays inside the box. The phone keypad opens (`inputmode="tel"`).

**Cockpit Ready-to-call** (D §6.2): the contact field is a Combobox that searches leads by name or number; typing digits switches it to a PhoneInput value. `Place call…` (primary) opens the Call gate; an invalid number shows the field error on click and focuses the field; it never dials.

**Resolves:** F-UX-025, F-QA-020, F-QA-021 (phone), F-FLOW-015 (transfer "abc"), F-UX-012 (profile phone, E.164 with +91 default), F-UX-026 (unlabelled tel field).

**React.**

```tsx
type PhoneInputProps = {
  value: string | null;            // E.164 or null
  onChange: (e164: string | null, meta: { valid: boolean; display: string }) => void;
  kind?: 'mobile' | 'any';         // default 'any'
  allowInternational?: boolean;    // default false (static +91)
  defaultRegion?: 'IN';
  onDuplicateCheck?: (e164: string) => Promise<{ exists: boolean; href?: string }>;
} & Omit<TextInputProps, 'value' | 'onChange' | 'type'>;
// zod: phoneIN = z.string().refine(v => isValidPhoneNumber(v, 'IN'), 'Enter a 10-digit mobile number, like 98765 43210.')
```

### 4.2 CurrencyInput (INR)

**Purpose.** Enter rupees: wallet top-up, autopay amount and threshold, a spend or call cap, a price in a flow variable. Today the top-up takes 0, −50 and 9,99,99,999, rewrites 0 to 1, and is labelled only by the placeholder "Top-up ₹" (F-UX-021, F-QA-021, F-A11Y-020).

**Anatomy.**

| Part | Spec |
|---|---|
| `label` | A noun: "Top-up amount", "Top up when the balance falls below" |
| `prefix` | "₹" inside the box in `data-13` `--text-2`, `aria-hidden`; the rupee renders from the "Vaani Rupee" face through `--font-sans` (F §2.1) |
| `input` | Sans `body-14` (16 on touch), `tabular-nums`, right-aligned only inside tables; left-aligned in forms |
| `hint` | The bounds, always: "Minimum ₹100 · maximum ₹1,00,000" (F-QA-021). For top-ups, a second line computed from the real rate: "Adds about 3 h 20 min of calls" (D §6.6) |
| `presets` (optional) | A SegmentedControl (single choice, part 6) above the input: `₹100` `₹500` `₹1,000`, labelled "Choose an amount" |

Box and states are TextInput's; width `--field-w-medium` (320); `lg` height inside the Top-up sheet.

**Behaviour.**
- **Integers by default** (top-ups and caps): `inputmode="numeric"`. `allowDecimals` (prices, rates) switches to `inputmode="decimal"` with 2 places.
- **Parsing** strips `₹`, `Rs`, `INR`, spaces and commas, so "Rs 1,000" and "1000" are the same value. Formatting to en-IN grouping (`1,00,000`) happens **on blur**, never under the caret.
- **Validation on blur and on submit:** "Enter an amount from ₹100 to ₹1,00,000." for out-of-range, "Enter the amount in whole rupees." for decimals where not allowed, "Enter an amount, like 500." for non-numbers. Values are **never clamped or rewritten** (F-QA-021).
- **Presets and the input stay in sync:** choosing `₹500` fills 500; typing 500 selects the `₹500` preset; typing 750 clears the preset selection.
- **The action names the amount:** "Pay ₹500 via UPI" updates as the value changes; while the value is empty or invalid it reads "Pay via UPI" and clicking it shows the field error and focuses the field (F-QA-021, F-UX-021). Only this button is filled in the Top-up sheet; Autopay is a separate secondary card (F-UX-021).
- **Money is shown, not guessed:** no "≈ ₹11" false precision (D §7 item 19); cost lines use ranges from the real rate.

**Display rules** (for the value echoes around the field): balances with 2 decimals (`₹2,340.50`), amounts entered with 0 (`₹500`), en-IN grouping, the full figure in forms, never `₹85 L` short forms in an input (F §2.5).

**ARIA.** The label includes the currency for screen readers through a visually hidden suffix ("Top-up amount, in rupees"); presets are a `radiogroup`; the computed runway line is `aria-live="polite"`, updated at most every `--timing-announce-throttle` (2 s).

**Responsive.** ≥ 768: presets and input on one row when the container is ≥ 560 px, else presets above. < 768: presets as a full-width 3-up segmented row (44 px), the input full width below, the Pay button in the sticky sheet footer, full width.

**Resolves:** F-UX-021, F-QA-021 (amounts), F-A11Y-020 (placeholder-only label), F-A11Y-016 (preset chips without `aria-pressed`).

**React.**

```tsx
type CurrencyInputProps = {
  value: number | null;               // rupees; paise only with allowDecimals
  onChange: (v: number | null) => void;
  minValue?: number; maxValue?: number;
  allowDecimals?: boolean;            // default false
  presets?: number[];                 // [100, 500, 1000]
  runway?: (amount: number) => string | null; // "Adds about 3 h 20 min of calls"
} & FieldProps;
// Built on RAC NumberField, locale 'en-IN', formatOptions { style: 'decimal', maximumFractionDigits: allowDecimals ? 2 : 0 }.
// The ₹ is the separate aria-hidden prefix, so the input never shows it twice.
```
