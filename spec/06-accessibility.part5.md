
---

## 10. Names and labels

### 10.1 Where a name comes from (in this order)

1. **Visible text** inside the control or a `<label for>` / `aria-labelledby` pointing at visible text.
2. **`aria-label`** only on icon-only controls, and it equals the tooltip text (C §2.2).
3. **Never** `title` (not exposed on touch, read inconsistently; F-A11Y-024) and never a placeholder (F-A11Y-003, F-A11Y-020).

Text hidden at small widths keeps its name: `sr-only sm:not-sr-only`, never `hidden sm:inline` (the Leads Refresh and Export buttons had **no** name at 390 px, F-A11Y-024). `IconButton` makes `label` a required prop, so an unnamed icon button does not compile.

### 10.2 Label in name (2.5.3): before → after

The accessible name **starts with** the visible words, so "Click Save context" works in Voice Control, Voice Access and Dragon (MN-01).

| Control | Before (visible / accessible name) | After (visible / accessible name) |
|---|---|---|
| Cockpit intel save | "SAVE CONTEXT" / "Save customer context — agent will use this data" | Retired with the intel panel; the wrap-up form's button is "Save and next" / "Save and next" |
| Call reports row action | "Re-analyze" / title "Re-run AI analysis from scratch" | In `⋯`: "Re-analyse call" / "Re-analyse call" (the consequence moves to the menu item's description) |
| Leads row call | icon / title "Call <name> (c)" | "Call…" / "Call… Lead 1042" (visible word first, then the record) |
| Call reports download | icon / title "Download CSV" ×50 | In `⋯`: "Download transcript" / "Download transcript, call from 10:42 am" |
| Wallet banner CTA | "Top up" / "Top up" at 3.27:1 | Notice link "Top up" / "Top up" (≥ 6.18:1) |
| Sign out | "Exit" tab / title "Sign Out" | "Sign out…" menu item / "Sign out…" |
| Dialog close | X icon / "button" (no name) | X icon / "Close" (sheets: "Close call details") |
| Flow Save and ACTIVATE | "Save" and "ACTIVATE" / same | "Publish v8…" / "Publish v8…" (no Save; autosave to draft) |
| Theme toggle | sun icon / "DARK" | Account menu › Theme › "System", "Light", "Dark" radio items |

### 10.3 Names that carry the record (per-row and per-step controls)

Repeated controls include which item they act on: "Select Lead 1042", "Select all leads on this page", "More actions for Lead 1042", "Call… Lead 1042", "Open call details, Today 10:42 am, 2 minutes 31 seconds, Interested", "Download transcript, call from 10:42 am", "Delete step Polite close…", "Play from 00:41", "Open step: Ask about a site visit", "Answer Yes, goes to Book site visit". Names never contain internal ids (`node_1785…`, F-A11Y-028) or full phone numbers.

### 10.4 How values are spoken

Abbreviations that look fine can be read wrongly ("2m" as "2 metres", "L" as a letter). `lib/format.ts` returns a display form and a spoken form; components render the display text `aria-hidden` and the spoken text `sr-only` in the same cell, so tables keep one cell per value.

| Value | Display | Spoken |
|---|---|---|
| Duration | `2m 31s` · `41s` | "2 minutes 31 seconds" · "41 seconds" |
| Latency, units | `180 ms` · `6 s` · `10 MB` | "180 milliseconds" · "6 seconds" · "10 megabytes" |
| Money, dense | `₹85 L` · `₹1.2 Cr` | "₹85 lakh" · "₹1.2 crore" (full `₹2,34,050.00` is read correctly under `lang="en-IN"`) |
| Masked phone | `+91 •••••• 4821` | "Phone ending 4821" (bullets `aria-hidden`) |
| Version | `Live v7` · `Draft · 3 changes` | "Live, version 7" · "Draft, 3 unpublished changes" |
| Outcome status line | `Lead → Interested`: plain `meta-12` text, not a tag (arrow is a Lucide icon); the same sentence on the canvas, in the Outline and in the direction | "Sets lead to Interested" |
| Timecode | `00:41` | "0:41" inside the button name "Play from 0:41" |
| Relative date | `Today 10:42 am` | same; the absolute date is in `<time datetime>` and the tooltip |
| Delta | `▲ 12%` (glyph is an icon) | "Up 12 percent, better" (the desirability word, N §4.7) |
| Keycaps | `⌘` `K` | "Command K" / "Control K" (C §7.3) |

**Separators.** The middle dot in meta rows is generated with CSS alternative text (`content: "·" / ""`) or wrapped in `aria-hidden`, so screen readers at high punctuation levels do not read "dot" between every fact.

**Decorative marks.** LiveDot, phase glyph tiles, tag icons and the language-mark glyph (when the language name is visible) are `aria-hidden`; the adjacent word carries the meaning. In transcript turn rows, where only the glyph shows, it carries `aria-label="Hindi"` and `lang` (§17).

---

## 11. Forms, errors and authentication

### 11.1 The Field contract (C §3.1), as test assertions

- Every control has a `<label for>` (or `fieldset`/`legend` for groups); a bare `<Input>` outside `Field` is a lint error.
- The hint and then the count are in `aria-describedby`; while invalid, the error replaces the hint in that list and `aria-invalid="true"` is set.
- Required fields carry `required`; optional fields say "(optional)" in the label (C §3.1 rule; §24 explains why not "(required)").
- Placeholders are examples ending in "…", never the only label, never a fake value ("••••••••" is removed from the password field).
- Field text is 16 px on touch (no iOS zoom-on-focus), 14 px on desktop.
- Nothing blocks typing or paste; nothing rewrites input silently (C §8.2 V8, V9).

### 11.2 Errors: identification, suggestion, announcement

| Moment | What the user perceives | Mechanism |
|---|---|---|
| Blur on a changed field with a format error | Red border, `circle-alert` + message under the field ("Enter a 10-digit mobile number, like 98765 43210.") | The message is referenced by `aria-describedby`; screen readers read it when focus returns. No live announcement on blur (it would interrupt the next field) |
| Typing in a field that shows an error | The error disappears as soon as it is fixed (300 ms debounce) | No announcement on fix; the field is simply valid when read |
| Submit with 1–3 fields invalid | Focus on the first invalid field | Its label, value and error are read on focus |
| Submit with more fields invalid | An error summary at the top of the form: "Fix 2 fields to continue", with a link per field | The summary receives focus (`tabindex="-1"`, a `danger` Notice, **not** `role="alert"`, so it is not read twice); each link focuses its field |
| Async check finishes while focus is still in the field | "A flow called 'Site visit' already exists. Choose another name." | Polite announcement once, plus `aria-describedby` |
| Server rejects (422) | Same field messages | As for submit |
| Server or network fails | One form-level InlineError above the actions with Retry and Details | `role="alert"` (the user's action failed) |
| Flow validation | Issues chip, step marks, Problems bar and panel with "Go to step" | Count changes announced politely, debounced 1 s after editing settles ("2 errors, 1 warning"); never per keystroke |

### 11.3 Input purpose (1.3.5)

1.3.5 applies to information **about the user**. Fields about a lead, a customer or a teammate describe someone else, so they must not receive the user's own autofill.

| Field | Attributes |
|---|---|
| Sign in: email | `type="email"` `autocomplete="username"` `inputmode="email"` `autocapitalize="none"` `spellcheck="false"` |
| Sign in: password | `type="password"` `autocomplete="current-password"`; show/hide toggle `aria-pressed`, 26 px visual with a 24 px+ hit area (PA §8) |
| Sign up: name · work email · company · phone | `name` · `email` · `organization` · `tel` with `type="tel"` `inputmode="tel"` |
| Sign up and reset: new password | `autocomplete="new-password"`; the rules list is visible and updates as you type (C §8.2 V1 exception) |
| One-time code (email link, 2FA) | one field, `autocomplete="one-time-code"` `inputmode="numeric"`; pasting a 6-digit code works; never six split boxes |
| Profile (the user) | `name`, `email`, `tel`, `organization-title` |
| Organization address | `organization`, `address-level2` (city), `address-level1` (state), `postal-code` |
| Top-up amount | `inputmode="numeric"` `autocomplete="transaction-amount"` |
| New lead, Cockpit contact, lead sheet fields | `autocomplete="off"` with a namespaced `name` (`lead_name`, `lead_phone`): **not** the user's tokens (§24) |
| Search fields | `type="search"` `autocomplete="off"` with a label (visible or `aria-label` equal to the placeholder's words without "…") |

### 11.4 Accessible authentication (3.3.8)

- Paste works in every auth field; password managers work (real `autocomplete`, stable `name`, no field renamed per render).
- Every sign-in offers a path that needs no memory test: the password manager, **Email me a link**, or a one-time code.
- No CAPTCHA puzzles, image selection, or "type the characters". If bot protection is needed, it is invisible or non-cognitive, with rate limiting as the first defence (§25).
- 2FA codes from an authenticator app accept paste; the code field says how long the code lasts ("Codes change every 30 s") and never times out the page.
- Errors are inline and specific ("That email and password don't match. Try again or email me a link."), never native browser bubbles (`noValidate`, PA §8).

### 11.5 Redundant entry (3.3.7)

| Where | What is carried so the user never re-types it |
|---|---|
| Auth pages | The email moves between sign in, sign up, link mode and reset (PA §8) |
| Call gate | The lead, flow, voice and language from the row or the Ready card |
| Wrap-up | Outcome fields pre-filled from the flow's Outcome step and captured answers |
| Import leads | The column mapping is remembered per workspace and offered next time |
| Failed submit, session expiry, offline | Form values are kept; flow edits stay on the device until they save |
| Settings | One save covers every field on the page (F-UX-012), so nothing is typed twice after a partial save |
| Top-up | The chosen amount survives a failed UPI attempt ("Try again" keeps ₹500) |

### 11.6 Error prevention for legal, financial and data actions (3.3.4)

| Action | Prevention |
|---|---|
| Place one or many calls | Call gate: checks, cost range, count after skips; confirm with ⌘/Ctrl+Enter or the labelled Start |
| Top up, set up autopay | Top-up sheet shows the amount and the resulting runway before paying; the UPI app confirms; autopay shows the mandate terms before approval |
| Put a flow live | Publish gate: validation, diff, where it goes live; roll back offered afterwards |
| Delete a step, lead, note or room | Undo toast (reversible) or ConfirmDialog naming the object and consequence (O §3) |
| Delete the account, revoke an API key | ConfirmDialog with typed confirmation; account deletion keeps its 7-day grace |
| Import leads | Mapping preview with row-level errors before anything is written |
| Bulk status change | Undo toast |
