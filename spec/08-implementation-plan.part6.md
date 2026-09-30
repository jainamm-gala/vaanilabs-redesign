### 8.4 Open questions for the product owner (every one in the spec)

Each question keeps its spec id (for example CK-Q1 is question 1 in CK §8). "→" names the first work item it blocks; questions without an arrow can be answered during the phase that owns their page. Questions the specs mark as closed are not repeated (C-Q2, C-Q3, C-Q8, N-Q1, N-Q12, O-Q3, M-Q5).

**Headline decisions**
- **R-Q1 Tablet editing in the Flow Designer.** v1 ships read-only Review mode at 768–1023 (D §6.5, R §10.2, §10.6). Is a dedicated tablet editor (full-width canvas, step sheet, Navigate / Arrange) worth a v1.1 layout? Decide from `review_edit_attempt` and `large_screen_notice_seen` telemetry. → after P2-18 GA.
- **R-Q2 Phone quick fixes.** Phones are read-only in v1. Should v1.1 allow editing the wording of existing steps and re-pointing answers from the read-only sheet? → after P2-18 GA.
- **Coarse-pointer rail at 1024 × 690 (landscape iPad).** The 12 rail items at 44 px need about 725 px of height, so the list scrolls between the pinned workspace tile and the bottom buttons (N §1.4, A11Y §15.2). A coarse-only tightening (group separators at `margin-block: space-2`, no gap between the 44 px hit areas, tile margin `space-12`) would fit them in about 687 px; it has not been applied. The same table lists device sizes in its coarse row and inner viewports in its fine row, so its units are inconsistent. → P1-08.
- **Compliance cues** (D §8.2 decisions; CK-Q7; FD1-Q3; ST-Q4): the recording disclosure, TRAI calling windows, DND scope and which rules the Call gate enforces regardless of workspace settings. → P1-06 GA.
- **The final mark** (D §3.1, §10): commission it to the brief; only the symbol file changes. → P3-07.

**Foundations (F §17)**
- F-Q1 Self-hosting path and caching for the one-glyph rupee subset. → P1-01
- F-Q2 Tenant theming: which primitives a white-label tenant may override (proposed: Neel only), and whether tenants get their own contrast report.
- F-Q3 Hindi chrome (v2): use `read-15-deva` line heights in dense tables (+2 px per row)?
- F-Q4 Confirm that no separate display face returns for campaigns.

**Core controls (C §11)**
- C-Q1 Accept `react-aria-components` + `@internationalized/date` for number, date, time, multi-select and drop-zone fields, or accept weaker hand-built ones. → P1-03
- C-Q4 Add radio circles to the full-radius list.
- C-Q5 Mark optional fields and leave required ones unmarked (the inverse of the audit's suggestion)? → P1-03
- C-Q6 Is IST fixed for every workspace, or can enterprise workspaces choose a zone for calling hours? → P1-06
- C-Q7 Password policy: minimum length and a breach check. → P0-16

**Data and navigation (N §15)**
- N-Q2 Line-quality thresholds (Good / Fair / Poor) and which leg is measured. → P1-07
- N-Q3 Single-key shortcuts on or off by default for new users (now safe because `C` only opens the gate). → P0-07
- N-Q4 Saved views: personal only, or shared with the workspace, and who may edit a shared view.
- N-Q5 KPI desirability per metric (average duration and spend proposed neutral).
- N-Q6 Remove the per-row Call button on phones (calls from the sheet or the bulk bar)? Confirm with sales operations. → P1-12
- N-Q7 Per-turn timestamps and language; server-computed peaks for the Waveform variant. → P3-04
- N-Q8 Transcript read-aloud on by default (proposed) or opt-in.
- N-Q9 Recording downloads: which roles, and masked or not.
- N-Q10 Hindi bottom-bar labels need a re-measure (English "Call reports" fits 320 px by under 1 px).
- N-Q11 At ≥ 1280, keep the remembered collapse to the rail, or always show the labelled sidebar. → P1-08

**Gates (G §11)**
- G-Q1 May a DND-registered lead be included when consent is recorded, and who may include them? → P1-06
- G-Q2 Are browser tests billed? If so they get the CallGate with a rate line. → P0-08
- G-Q3 A maximum batch size or pacing the gate should state; must very large batches be scheduled? → P1-06
- G-Q4 Is a 120 s gate token right for busy operators, or should the gate re-check silently while open? → P0-08
- G-Q5 Plan changes charged from the wallet or by UPI (decides the PlanChangeSheet primary). → P2-03

**Overlay and feedback (O §21)**
- O-Q1 Wallet "low" threshold (proposed: runway under 60 min at the median rate, editable in Autopay). → P1-09
- O-Q2 Soft-delete windows for leads, steps, notes and rooms; without them those actions move to tier 2. → P0-03, P0-10
- O-Q4 "Request access" needs an endpoint that notifies admins; otherwise "Copy request link".
- O-Q5 Re-authenticate in place (keeps the page) or send to `/login?next=` (depends on the auth provider).
- O-Q6 A notification inbox is out of scope for v1; confirm.
- O-Q7 Offline flow edits need a local draft queue in IndexedDB (shared with I1). → P0-02

**App shell and IA (SH §21)**
- SH-Q1 Roles beyond Admin and Member; who sees the Rep console; can members top up? → P1-08
- SH-Q2 Is sign-up still approved by hand? If not, `/signup/pending` is dropped; if yes, the real review time. → P0-16
- SH-Q3 Low-wallet threshold (same as O-Q1).
- SH-Q4 Which service publishes calling and payments incidents, and can the app read it server-side? → P1-09
- SH-Q5 Can we quote how long number verification takes? → P1-10
- SH-Q6 Keep Home as an overview page after setup, or a setup checklist only?
- SH-Q7 Confirm the activity inbox is v1.1 and that email and WhatsApp alerts cover v1.
- SH-Q8 Keep `/` public with "Open app" for signed-in visitors, or redirect them to the landing route?

**Cockpit and Rep console (CK §8)**
- CK-Q1 Route: keep `/dashboard` with a `/cockpit` alias, or move to `/cockpit` with a permanent redirect (see §8.3 S1). → P1-08
- CK-Q2 Are browser tests billed (proposed free; same as G-Q2)? → P0-08
- CK-Q3 Who sees "Live now"; is there a supervisor role? → P1-11
- CK-Q4 End-call shortcut: none in v1; revisit with operators.
- CK-Q5 Which of Take over, Transfer, Hold and Keypad exist today (hidden until confirmed)? → P1-11
- CK-Q6 Calling hours for test calls to your own number (proposed: not applied). → P0-08
- CK-Q7 Compliance copy: DND scope, TRAI windows, the recording disclosure sentence. → P1-06
- CK-Q8 "Tested today" = a test on this revision that reached Live and lasted ≥ 10 s, today in IST? → P1-06
- CK-Q9 The browser transfer bridge: if it hasn't shipped, hide the Rep console from the nav or show it blocked? → P2-07
- CK-Q10 Presence timing (heartbeat 20 s, server timeout 45 s, ring timeout 20 s). → P2-07
- CK-Q11 Auto-offline after 2 missed transfers, per workspace setting? → P2-07
- CK-Q12 May a draft call a teammate's verified number, or only your own? → P2-16
- CK-Q13 Where the Cockpit default flow is set: the Publish gate, Flows, or Settings. → P1-14

**Assistant (AS §22)**
- AS-Q1 Does `/api/assistant/chat` execute side effects without a confirmation turn today? Assume yes until answered. → P0-09
- AS-Q2 Autonomy mode 2 as the default, the 50-record ceiling for mode 3, and an admin switch to turn the Assistant off. → P2-05
- AS-Q3 Attachment types and limits (10 MB per file, 5 per message, the 8,000-character paste hint).
- AS-Q4 Which speech-to-text service handles English, Hindi and Hinglish; is audio retained? → P2-05
- AS-Q5 Keep voice conversation as Beta or retire it?
- AS-Q6 Chats private to the author? May admins read members' chats? Read-only sharing? (DPDP review)
- AS-Q7 Retention of chats and attachments (90 days proposed); export?
- AS-Q8 Which roles may place calls, publish flows and delete leads? → P0-09
- AS-Q9 May a Call step schedule calls for the next calling window through the gate?
- AS-Q10 Per-user or per-workspace quotas?
- AS-Q11 Reply in Devanagari to Devanagari input and in Hinglish (Latin) to Hinglish input?

**Leads (L §15)**
- L-Q1 Status set migration (Scheduled → Callback due or Interested; Lost → Not interested). → P1-12
- L-Q2 Does the Outcome "Callback" write `callback_at`; may operators set it by hand? → P1-12
- L-Q3 DND with recorded consent; a consent attestation on Import; calling hours per workspace or per flow. → P1-06
- L-Q4 Repeat-call window (24 h proposed), per workspace or fixed. → P1-06
- L-Q5 Batch size and concurrency the gate should state (same as G-Q3).
- L-Q6 The member and admin matrix (Reveal, full-number export, delete, shared views). → P1-12
- L-Q7 Export threshold for a background job (5,000 proposed); email large exports?
- L-Q8 Single-key default (same as N-Q3).
- L-Q9 Per-row calling on phones (same as N-Q6).
- L-Q10 "WhatsApp…" in the sheet footer depends on the WhatsApp template picker.

**Call reports and Analytics (CR §6)**
- CR-Q1 Mean talk time of answered calls, or also a median? → P2-01
- CR-Q2 Does voicemail count as answered (proposed yes for outbound)? → P0-14
- CR-Q3 Bulk actions on Call reports (none in v1; candidates for v2).
- CR-Q4 Should members see Call reports and Analytics; are Recompute and Reveal number admin-only? → P1-13
- CR-Q5 Recording downloads (same as N-Q9).
- CR-Q6 Keep the previous analysis for 30 days after Re-analyse?
- CR-Q7 The definition of Needs review; is Reviewed per workspace or per reviewer? → P1-13
- CR-Q8 Intent clustering windows, frequency and who may Recompute. → P2-01
- CR-Q9 Browser test billing (follows CK-Q2).
- CR-Q10 PDF report: one page per section, or a short executive summary?
- CR-Q11 Is 60 s polling for new calls acceptable, or subscribe to a server event stream? → P1-13

**Knowledge and Billing (KB §5)**
- KB-Q1 Billing unit and rates: per second or per minute rounded up; the Meetings rate (₹2.40/min or 1 paisa/s); one rates endpoint for the app, `/pricing` and the docs. → P1-15
- KB-Q2 GST on top-ups: added on top or included; invoice at top-up or monthly? → P1-15
- KB-Q3 UPI on iOS (app-specific links or QR first); are collect requests still supported? → P1-15
- KB-Q4 Autopay rules under RBI e-mandates (pre-debit notice, limits, validity, threshold debits). → P2-03
- KB-Q5 Plan changes: wallet or UPI, prorated, downgrades at period end (same as G-Q5). → P2-03
- KB-Q6 Roles for knowledge and billing (members add and test knowledge and can top up?). → P1-15
- KB-Q7 A monthly charge for the inbound number? → P2-03
- KB-Q8 Should a flow version pin its knowledge sources? (The spec assumes not.) → P2-02
- KB-Q9 Knowledge limits: file size, files per upload, text length, CSV rows, crawl depth. → P2-02
- KB-Q10 Low-balance threshold (same as O-Q1).
- KB-Q11 Refunds for failed or dropped calls; is unused balance refundable? → P2-03
- KB-Q12 May receipts and invoices name the payment processor? → P2-03

**Settings (ST §16)**
- ST-Q1 Admin and Member only in v1, or a Developer role for keys and webhooks? → P2-04
- ST-Q2 Should members see API keys and webhooks at all? → P2-04
- ST-Q3 Workspace time zone (same as C-Q6).
- ST-Q4 Default calling hours and the regulatory limits the gate enforces regardless of settings. → P1-06
- ST-Q5 The `X-Vaani-Signature` rename with the old header in parallel until a date; keep the `vv_live_` key prefix? → P2-04
- ST-Q6 Rep console transfer fallback at 20 s; configurable? → P2-07
- ST-Q7 Export scope for members and admins. → P2-04
- ST-Q8 What happens to the wallet balance when a workspace is deleted? → P2-04
- ST-Q9 May admins require two-factor for everyone (only if the backend exists)?
- ST-Q10 Self-serve inbound number requests, or allocation by support; the real turnaround. → P1-10

**Meetings and Personal agents (MP §5)**
- MP-Q1 What "29 / 30" free minutes means, what they cover, and the conflicting rates (see KB-Q1). → P2-06
- MP-Q2 What the "Meeting intelligence" toggle produces today and where outputs are stored (hidden until MT3). → P2-06
- MP-Q3 The idle-room reaper rule (stale after 30 min empty, ended 15 min later; does agent-only count as empty?). → P2-06
- MP-Q4 Agent, notes and recording in key-only rooms; can the key be shown again?
- MP-Q5 Offer "No agent, just a room" in the Start sheet?
- MP-Q6 Archive the QA and E2E rooms in production, and add the CI check against test fixtures in production data. → P0-06
- MP-Q7 Roles for meetings and personal agents (start, end others' rooms, see all, lock autonomy). → P2-06
- MP-Q8 Personal-agent numbers: one per user or a pool; do numbers and WhatsApp messages cost money? → P2-06
- MP-Q9 Accounts with Calls on Auto before limits exist: keep Auto or move to Confirm? → P0-09
- MP-Q10 Retention of recordings, transcripts and summaries.
- MP-Q11 Remove Homework analysis, Stock research and Stock trade from the product? → P2-06
- MP-Q12 Is the meeting agent's voice and role editable per workspace, and where?

**Public site and auth (PA §19)**
- PA-Q1 Self-serve prepaid or approval-gated access, and the real review time. → P0-16, P0-17
- PA-Q2 Any free credit for phone calls; sign-up without a card? → P0-17
- PA-Q3 Supported Indian languages, the latency figure and its method, meeting platforms, bring-your-own numbers, data-residency wording. → P0-17
- PA-Q4 Keep Facebook login for a B2B product; is Microsoft planned? → P2-08
- PA-Q5 Meeting PlanCards shown publicly, chosen only after sign-up? → P2-08
- PA-Q6 The Vaani Labs and StarVox Labs relationship for the footer; one sales address and booking link. → P0-17
- PA-Q7 Were the hero recordings made with consenting test customers? → P2-08
- PA-Q8 Does the auth provider support "Trust this browser for 30 days"? → P2-08
- PA-Q9 Password policy (same as C-Q7).
- PA-Q10 Can the `/try` demo agent be imported as a draft flow after sign-up?
- PA-Q11 Expiries: confirmation 30 min, email link 15 min, reset 60 min, invite 7 days. → P0-16
- PA-Q12 Is a Hindi home planned, and who translates the claims?
- PA-Q13 Does marketing move into the same Next.js app or stay a separate build importing `tokens.css`? → P2-08
- PA-Q14 A DPDP review of the ConsentBar wording and of first-touch attribution in `sessionStorage`. → P0-18

**Flow Designer, canvas (FD1 §21.2)**
- FD1-Q1 Mouse wheel pans (proposed) or zooms (today). → P2-11
- FD1-Q2 What migrated End steps record (proposed: nothing until chosen, with a warning rule). → P2-13
- FD1-Q3 Recording-disclosure wording and when it is mandatory (legal review). → P2-13
- FD1-Q4 Subflows ("Go to flow") in v2?
- FD1-Q5 Manual bend points on connectors (not in v1).
- FD1-Q6 Threaded canvas comments with mentions (v2).
- FD1-Q7 Notes visible to everyone with view access (proposed) or editors only? → P2-12
- FD1-Q8 Frames in the Outline (no in v1).
- FD1-Q9 A hard step limit (none; budget 150, warn at 200). → P2-12
- FD1-Q10 Hinglish synonyms in step search ("sawaal" → Question). → P2-11

**Flow Designer, configuration and lifecycle (FD2 §26)**
- FD2-Q1 Is the text simulation billed, and does it run the live model? → P2-16
- FD2-Q2 Who can publish: every editor, or admins with "Request publish"? → P0-02
- FD2-Q3 Voice verification "Speech window 8": seconds or turns? → P2-13
- FD2-Q4 Fixed prompts spoken verbatim, or restated in the caller's language? → P2-13
- FD2-Q5 An "Only me" flow can't be live anywhere; what happens when its owner leaves? → P1-14
- FD2-Q6 Can the runtime report Book meeting "Not booked"; may Question have one named answer? → P2-13
- FD2-Q7 Retention of versions, draft snapshots (24 h) and test runs (30 days). → P0-05
- FD2-Q8 Cockpit default per workspace (proposed) or per user (today)? → P0-02
- FD2-Q9 An "Update lead / CRM update" step in v1?
- FD2-Q10 Several triggers of one kind in a flow, or separate flows? → P2-13
- FD2-Q11 Outbound retries on the batch trigger (proposed) or on the batch in Leads? → P2-13
- FD2-Q12 The largest supported flow (proposed 200 steps; rules in a Worker above 60). → P2-12

**Responsive (R §21), besides R-Q1 and R-Q2 above**
- R-Q3 Publishing from a phone: the same permission as elsewhere (proposed) or admins only. → P2-18
- R-Q4 Web push for live calls or failed publishes (not in v1).
- R-Q5 An installable app (PWA) in v1.1 after the real-device sign-off.
- R-Q6 The landscape-phone Cockpit side-by-side layout, confirmed with operators. → P1-11

**Accessibility (A11Y §25)**
- A11Y-Q1 Confirm the 3-cycle live-dot bound (the alternative is a pause control on every live dot). → P1-07
- A11Y-Q2 Does Meetings render live audio or video in the browser? If so, live captions (1.2.4). → P2-06
- A11Y-Q3 A non-cognitive bot-protection provider for sign-up (3.3.8). → P0-16
- A11Y-Q4 Session lifetime; under 20 hours needs a warning 2 minutes before expiry. → P1-04
- A11Y-Q5 Shortcut remapping (not in v1).
- A11Y-Q6 Publish `/accessibility` with the conformance status once A11Y §22 passes. → P3-08
- A11Y-Q7 Hindi chrome (v2): `lang="hi"` with English terms tagged.
- A11Y-Q8 A JAWS licence and one Android and one iOS test device for QA. → P1 start

**Motion (M §19)**
- M-Q1 Accept three pulse cycles per entry into Live (same as A11Y-Q1).
- M-Q2 Store the Motion preference server-side (needs an endpoint) or per browser. → P1-01
- M-Q3 Tidy: a 200 ms interpolation or an instant re-layout with an Undo toast. → P2-12
- M-Q4 Swipe to dismiss phone sheets in v1, or later.
- M-Q6 Remove `framer-motion` entirely (today it only drives the logo loop). → P3-01
- M-Q7 Spinner and indeterminate-bar loops as sanctioned, request-bound loops (the spec assumes yes).
- M-Q8 When may the Rep console ask for notification permission (never on page load)? → P2-07
- M-Q9 Check the meter thresholds (−45 to −15 dBFS) against real telephony and microphones. → P1-07
