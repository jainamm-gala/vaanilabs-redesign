
### F-UX-021 — Billing: spend is invisible, billing is split three ways, amounts aren't validated, and plan cards contradict themselves
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** UX-AUDIT-08, EXPLORE-DATA-22, EXPLORE-SETTINGS-10, QA-B-28
- **Pages:** /billing, /settings (Meetings Billing tab), global wallet banner
- **Evidence:**
  - **Missing spend data (verified):** /billing shows only a ₹0.00 balance, "Transactions 0", UPI autopay, manual top-up and "No transactions yet". It has no per-minute rate, usage, cost per call, invoices or GST, while Analytics reports 121 calls and 158 minutes.
  - **Contradictory copy (verified):** under Manual top-up it says "For automatic mandate-based recharge, use Pricing." The Auto-debit card sits directly above, "Pricing" is plain text, and there is no in-app Pricing page.
  - **No amount validation (verified):**
    - Pay with UPI stays enabled for 0, −50, 5 and 9,999,999. The input has `min=1` and no max, and no inline error appears.
    - Explore-data saw 0 silently turned into 1 and 999,999,999 accepted.
  - **Competing buttons and controls:**
    - Four filled blue buttons compete in one view: the banner's Top up, Enable UPI Auto-Debit, the selected ₹500 chip and Pay with UPI (verified).
    - The ₹100/₹500/₹1000 chips have no `aria-pressed`, and "Pay with UPI" doesn't state the amount.
    - Both amount inputs are labelled only by placeholder ("Top-up ₹", "Auto top-up ₹").
    - The autopay status appears twice: an INACTIVE pill and "Status: INACTIVE".
  - **Meetings Billing tab:** meeting plans live in a Settings tab that has no URL of its own.
    - Its 4 plan cards are about 132 px wide in a 576 px column. Prices wrap ("₹499/ / mo"), descriptions are truncated, and all plan text is 11–12 px mono.
    - The Pay-as-you-go card reads "Free / Unlimited included / then ₹2.40/min" next to "30 free min / month".
    - The 6-month usage chart draws no bar for SEP (1 min).
  - The banner's CTAs go to `/settings#wallet` (F-UX-002), and the banner also appears on /billing.
  - The verifier could not reproduce "Auto top-up amount ₹0.00 while loading" (see the appendix). EXPLORE-SETTINGS-10 rated the split high; the UX-AUDIT-08 verifier rated the billing issues medium.
- **Screenshots:** va-verify-ux-audit/13_billing.png, va-verify-ux-audit/14_billing_9999999.png, va-ux-audit/crop_billing_ctas.png, va-explore-data/r2_billing_topup_validation.png, va-explore-settings/c3_meetings_billing.png, va-explore-settings/settings_meetings_billing_bottom.png, va-qa-b/billing-topup-invalid.png
- **Recommendation:**
  - Make /billing the only money hub, with four tabs:
    - Wallet: balance ("≈ N min left at ₹x/min"), top-up and autopay
    - Plans: voice minutes and meeting minutes
    - Usage: by day and by product, with cost per call linked to Call Reports
    - Invoices: with GST details
  - Remove Meetings Billing from Settings and redirect its links.
  - Keep one primary action per card. In Top-up, "Pay ₹500 via UPI" is the only filled button; autopay becomes a secondary card with an outlined action.
  - Use labelled ₹ currency inputs with the minimum and maximum shown. Validate on blur with inline errors and never coerce values silently. Give chips a selected state and `aria-pressed`.
  - Delete the "use Pricing" line and fix the Pay-as-you-go copy to "30 free min/month, then ₹2.40/min".
  - Show plans as a full-width comparison, at least 240 px per plan. Give the usage chart axes and value labels.

### F-UX-022 — The Assistant can act on the account without an approval step: one click on a suggestion chip sends "…and activate it"
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** QA-A-05, EXPLORE-CORE-16, UX-AUDIT-29, QA-A-16
- **Pages:** /assistant
- **Evidence:**
  - All 4 chips call the same function as Send (`onClick: () => er(text)`). `er()` immediately POSTs `{message, history}` to `/api/assistant/chat`. The first chip reads "Build a sales call flow and activate it".
    - The bundle contains no approve or confirm code, and the panel says "The plan and each action appear here live as I work."
    - Verified from React props; no chip was clicked.
  - The empty state says it can "build & activate call flows … manage leads, place a call". Nothing shows an approval mode, cost, recipients or which flow would be activated.
  - The "Voice" button connects a voice session to the "vaani" agent on click. There is no microphone explainer and no confirmation.
  - History lives only in `localStorage["vaani_assistant_chat"]`. It is lost on another device or a teammate's machine, and there is no history list. The composer textarea has no label.
  - When a send fails (simulated):
    - The composer is already cleared.
    - The error is 12 px `#7A8397` (≈3.5:1), not `role=alert`, with no Retry, and it is saved into the history.
    - The user's own message bubble is black on `#2F5FE0` (3.83:1).
  - It is unverified whether the server activates a flow without a confirmation turn. The verifier says to raise this to high if it does.
- **Screenshots:** va-explore-core/assistant.png, va-ux-audit/51_assistant.png, va-verify-qa-a/assistant_initial.png, va-qa-a/assistant_send_250ms.png, va-qa-a/assistant_send_failed.png
- **Recommendation:**
  - Make chips insert their text into the composer, so the user can edit it and then press Send. Rename the first chip "Draft a sales call flow".
  - Pause any plan step that activates a flow, places a call, spends money or bulk-edits in "Plan & Actions", with "Approve & run" and "Edit" buttons. Show the flow name, recipients and estimated cost.
  - Add an org setting, "Assistant can: suggest only / act with approval / act". This mirrors the Auto / Confirm / Confirm + 2FA model already in Personal Agent settings.
  - Store chats server-side per user, with a history list.
  - When a send fails, keep the text in the composer or put a Retry on the failed bubble, and don't save the error into history.
  - Label the composer, and use white text on the blue bubble.

### F-UX-023 — Rep Console marks the rep available on page load, shows raw SDK errors with no retry, and exposes internal IDs
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** EXPLORE-CORE-21, UX-AUDIT-24, UX-AUDIT-14
- **Pages:** /rep-console
- **Evidence:**
  - Just opening the page fires `GET /api/rep-softphone/token`, `POST /api/profile/presence` and a LiveKit WebSocket. There is no "Go available" step and no mic check.
  - Under simulated failure:
    - It shows "Could not connect — could not establish signal connection: Websocket got closed during a (re)connection attempt:" with no Retry. The UX-AUDIT-14 verifier confirmed this.
    - The status card reads "Offline" and "Room: rep-<UUID>".
    - Mute and End call are disabled with no reason given.
  - Meanwhile the rail still shows the green "SYS: ONLINE" dot (F-UX-018).
  - The page says calls land here only when Call channel is Browser or Auto, yet it neither shows nor links the current channel. Call channel itself says those modes don't work yet (F-UX-015).
  - The back link reads "← Dashboard", the tab title is the same as on every other page, and the page can't be reached on phones.
- **Screenshots:** va-verify-ux-audit/24_rep_console.png, va-ux-audit/47_rep_console.png, va-explore-core/rep_console.png
- **Recommendation:**
  - Add an explicit Available / Away toggle with a mic test. Send presence only when the rep turns it on, and clear it when the tab closes.
  - Replace the raw error with plain copy and a Retry ("Can't connect to the call service. Retry"). Keep the raw text under Details.
  - Show "Call channel: Phone (PSTN) · Change" with a link, plus a warning when calls can't reach this console.
  - Move room IDs under Details, and explain disabled controls ("Available during a call"). Set the tab title to "Rep console · Available".

### F-UX-024 — Flow Builder writes the whole flow on open and after small edits, while the header says "Up to date"
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-MANUAL-10
- **Pages:** /flow-builder
- **Evidence:**
  - `PUT /api/flows/{id}` fires about 6 s after each load with no interaction. The verifier saw 1 per load across 3 loads, not the 2 reported. The payload is the whole flow, about 48 KB (name, description, flow_config, is_public).
  - Another PUT followed a node nudge plus a click. Another came about 2 s after a palette node was added.
  - The header keeps showing "Up to date" next to a separate Save button, which contradicts it. A keyboard user who can't see node focus can save accidental arrow-key moves into a live call flow.
  - The verifier saw no PUT on unload. It notes this may be designed draft autosave, since an ACTIVATE step exists, and rated the finding medium.
  - The Flow Builder section covers this in depth (F-FLOW-001, F-FLOW-002, F-FLOW-003).
- **Screenshots:** va-a11y-manual/41-flow-loaded.png, va-a11y-manual/43-flow-node-moved.png, va-verify-a11y-manual/40-flow-loaded.png, va-verify-a11y-manual/50-flow-palette-add.png
- **Recommendation:**
  - Never write on load. Normalise the flow in memory and save only after the user changes something.
  - Choose one save model:
    - Explicit save: hold changes locally, show "Unsaved changes", and warn before leaving.
    - Autosave into a draft: remove Save and show "Saving…", "Saved 16:42" or "Couldn't save · Retry" in a polite live region. The live flow changes only through Activate.
  - Version every save and offer one-click restore.

### F-UX-025 — Forms accept invalid input with the primary action enabled, and many fields have no programmatic label
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** UX-AUDIT-15, EXPLORE-SETTINGS-17, RESPONSIVE-B-19
- **Pages:** /dashboard, /settings/calling-number, /billing, /leads (New lead), /meeting-agent, /personal-agents, /webhooks, /settings/change-email, /settings (Profile), /login
- **Evidence:**
  - The primary action stays enabled on invalid input. Only client-side behaviour was checked; nothing was submitted.

    | Form | Input tried | Result |
    |---|---|---|
    | Cockpit Test Call | "abc", "12345" | Enabled (re-observed by the UX-AUDIT-04 verifier) |
    | Calling number | "abc" | "Send code" enabled |
    | Billing top-up | 0, −50, 9,999,999 | "Pay with UPI" enabled (verified) |
    | New lead | phone "abc" | Accepted as valid; email is checked only by the browser's native bubble on submit |
    | New webhook | URL "not-a-url" | `checkValidity()` false, but "Create webhook" enabled with no message |
    | Change email | "not-an-email" | Invalid, but "Send confirmation links" enabled |
    | Profile | phone "abc" | Accepted as valid (`type=tel`, no pattern) |
    | Meeting Agent, Personal Agents | empty title or goal | Create Room and START TASK enabled |

  - **Missing semantics:**
    - The Cockpit inputs, Profile's Full Name and Phone, the New lead fields and the Assistant composer have visible labels that are not linked with `for`/`id`.
    - The New lead and New webhook containers have no `role="dialog"` or `aria-modal`, and the webhook's close × has no accessible name.
    - Pressing Esc discards typed New-lead data without confirmation.
  - **Mobile and autofill:**
    - Every input checked uses 14 px text, and iOS zooms in on focus below 16 px.
    - The login email field has no `autocomplete`, and the password field has `autocomplete="off"`.
    - Phone fields have no `inputmode="tel"`.
- **Screenshots:** va-ux-audit/11_cockpit_tel_12345.png, va-ux-audit/18_calling_number_valid_typed.png, va-ux-audit/36_new_lead_invalid_typed.png, va-explore-settings/c11_webhook_invalid.png, va-explore-settings/c17_profile_dirty.png, va-qa-b/settings-change-email-fake.png, va-verify-ux-audit/14_billing_9999999.png
- **Recommendation:**
  - Build one form kit.
    - A `<Field>` renders a `<label for>`, helper text and an inline error, wired with `aria-describedby` and `aria-invalid`.
    - Validate on blur and on submit, and move focus to the first error.
  - Share validators:
    - Indian mobile/E.164 with a +91 default and the message "Enter a 10-digit mobile, e.g. 98765 43210"
    - `https://` URLs
    - email
    - currency ranges
  - Pick one rule for the whole app: either disable the primary action and show why, or keep it enabled and show errors on click.
  - Use one dialog primitive: focus trap, `aria-modal`, a labelled close button, and a confirmation before discarding a dirty form.
  - Use 16 px input text at ≤767 px. Add `autocomplete="email"`, `"current-password"`, `"name"` and `"tel"`, and `inputmode="tel"` on phone fields.

### F-UX-026 — Test Call accepts any text and looks disabled even when enabled; nothing explains CONNECT vs Test Call; an idle graphic takes centre stage
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** EXPLORE-CORE-13, DESIGN-RESEARCH-07
- **Pages:** /dashboard
- **Evidence:**
  - Test Call is disabled only while the tel field is empty. "abc" and "12345" both enable it, which the UX-AUDIT-04 verifier re-observed. The only hint is the placeholder "+91...".
  - When enabled it is `#0E9488` on a 20% teal tint (2.95:1), hard to tell from its disabled state, whose label is ≈1.6:1.
  - Its label wraps to "Test / Call" in an 87×58 button next to a 38 px input, at every width up to 1920.
  - There are two call buttons and nothing explains the difference:
    - CONNECT: filled blue, black text at 3.83:1, no title.
    - Test Call: teal.
    - Neither says which uses the browser mic and which places a PSTN call, what it costs, or that the wallet is at ₹0.
  - A decorative "STANDBY" ring about 310–320 px across dominates the centre column, while the controls are small. The phone field has no visible label.
- **Screenshots:** va-explore-core/cockpit_phone_filled.png, va-explore-core/crop_cockpit_controls.png, va-ux-audit/11_cockpit_tel_12345.png, va-ux-audit/13_cockpit_connect_hover.png, va-visual-audit/dashboard_connect_zoom.png, scout_dashboard.png
- **Recommendation:**
  - Replace the two buttons with two described options: "Talk in browser (uses your microphone)" and "Call a phone number · ≈₹x/min". Show inline blockers on each from the shared call pre-flight (F-UX-013).
  - Label the phone field. Validate E.164 as the user types and show the error under the field.
  - Give both options one primary style, with `white-space: nowrap` and a min-width. Make enabled and disabled states differ by at least 3:1, and show the reason when disabled.
  - Shrink the orb (e.g. `clamp(120px, 16vw, 240px)`) and give the space to the pre-call panel and the transcript.
