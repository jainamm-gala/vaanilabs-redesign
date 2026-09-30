## 2. Phases at a glance

Five tracks run in parallel: **Platform** (tokens, primitives, shell), **Product FE** (pages), **Flow Designer**, **Backend** and **QA**. Indicative durations assume about 4 front-end, 2 back-end and 1 QA engineer; they are estimates to be re-planned after P0 sizing, not commitments.

| Phase | Indicative length | Platform | Product FE | Flow Designer | Backend |
|---|---|---|---|---|---|
| P0 | 6–8 weeks | P0-00 slice, P0-13 value swap | P0-06, P0-08–P0-11, P0-14–P0-18 | P0-01–P0-04, P0-12 | P0-05 revisions, P0-14 calls, P0-16 sign-up, gate idempotency, P0-09 plan protocol |
| P1 | 10–12 weeks | P1-01–P1-07, P1-16 | P1-08–P1-15 | FD work waits on the node set; I1 stays in service | preflight (B3/B7), rates (B4), setup state, leads stats, conversations |
| P2 | 12–16 weeks | P2-19 dialect removal | P2-01–P2-08 | P2-09–P2-18 | test runs (FD6), text simulation (FD7), integrations (FD8), review state, presence |
| P3 | 4–6 weeks | P3-06 clean-up | P3-04 signatures | P3-03 canvas motion | per-turn timing (B5) if not earlier |

**The spine of dependencies.** P0-00 (primitives slice) → P0-07 (shortcut registry) → P0-08 (CallGate) → P1-06 (all gates). P0-01 → P0-03 → P0-02 (device draft) → P0-05 (revisions, BE) → P2-15 (revision UI). P1-01 (tokens) → P1-03/P1-04/P1-05 (components) → P1-08 (shell) → every page. P2-09 (node set) → P2-10 to P2-18.

---

## 3. P0: safety and critical

### P0-00 · Minimal platform slice for P0 · M · Depends: none
- *Scope:* install Radix Dialog, AlertDialog, Popover and Toast behind `components/ui` wrappers (final APIs, minimal styling); the `ShortcutProvider` skeleton with the registry format; the shell `Announcer` (one polite region); `useUrlState`; `lib/flags.ts` and `lib/capabilities.ts`. P0 items build on these instead of throwaway UI.
- *Resolves:* prerequisites; F-A11Y-005 for every P0 surface (gates, sheets, dialogs).
- *Spec:* O §1.3–§1.9, A11Y §8.4, §12.1, N §0.7.
- *Acceptance:* KB-03 passes on the P0 containers (Tab cycles inside, background inert, Esc closes, focus returns to the trigger, never `<body>`); LR-01 dedupe and throttle hold.

### P0-01 · Opening a flow writes nothing · S · Depends: none
- *Scope:* client-only fix that ships first: no PUT on open or flow switch; the dirty flag ignores hydration, `fitView`, dimension, selection and viewport events; a theme toggle never writes (DESIGN-SYSTEM-08); no flash of the default template before the saved flow loads.
- *Resolves:* F-FLOW-002, F-QA-002 (write-on-open part), F-UX-024, F-FLOW-037.
- *Spec:* FD2 §0.4 (FD3 interim), §4.3; FD1 D9; F §1.2 ("Theme changes never write data").
- *Acceptance:* opening each of the 16 flows, switching between them and toggling the theme twice sends 0 PUT/PATCH/POST (network log); `updated_at` is unchanged.

### P0-02 · Draft and live separated before the backend exists (interim I1) · L · Depends: P0-00, P0-01, P0-03, P0-04
- *Scope:* edits autosave to IndexedDB keyed by flow id plus a base (`updated_at` + content hash); chips `Saved on this device 11:24 am`, `Draft on this device · 3 changes ▾`, live chip `Saved flow`; zero network writes until Publish; **Publish…** opens an interim PublishGate that re-fetches the server copy, blocks with "published from another browser" when the base moved (Re-apply my changes on top · Discard my draft), then writes with today's PUT; storage failure shows `Not saved · this tab only` (danger) and registers `beforeunload`; ACTIVATE becomes the Flows list item "Make my Cockpit default" and never publishes; `/flows` tags "Unpublished edits on this device"; the Baseline shows "Saved flow · {name}".
- *Resolves:* F-FLOW-001 (the live-flow part, critical), F-FLOW-004 (ungated ACTIVATE), F-FLOW-014, F-UX-005, F-UX-024.
- *Spec:* FD2 §4.9 (the only interim), §5, §15.2; FD1 §3.3, §4.4, §19; O §18.1–§18.4 (`device`, `volatile`); G §5.2; D §8.2 "Interim behaviour"; SH §5.2.
- *Acceptance:* FD1 §19 interim criterion (20 edits of every kind send zero writes until Publish in the gate); FD2 §4.9 two-browser case (A's publish can't silently overwrite B's); with IndexedDB blocked the chip never says "Saved on this device".

### P0-03 · A save chip that can fail, and deletes that can be undone · M · Depends: P0-00
- *Scope:* the SaveState machine (saved · dirty · saving · error · new · offline · conflict · device · volatile) with `Couldn't save · Retry` persistent in red; pending saves flush on `pagehide`; Delete and Backspace act only on the canvas and raise an Undo toast (tier 1); one history stack in which adding a step is undoable and Undo is disabled with nothing to undo; no ghost inspector after a delete.
- *Resolves:* F-FLOW-003, F-QA-002 ("Up to date" while failing), F-FLOW-005, F-QA-003, F-FLOW-025, F-FLOW-001 (Backspace part).
- *Spec:* O §18.1, §9; FD2 §4.3, §14.1–§14.4; FD1 §10; D §6.5 Lifecycle.
- *Acceptance:* with the save endpoint failing, the chip reads `Couldn't save · Retry` within one save cycle and never "Saved"; Backspace on a connected step deletes with an Undo toast and ⌘/Ctrl+Z restores the step and its connections; M §7.1 timeline holds.

### P0-04 · Validation status is computed, never permanent · M · Depends: P0-00
- *Scope:* replace "FLOW VALIDATED" with the computed IssuesChip (`No issues` · `1 warning` · `2 errors`), recomputed 300 ms after each change and keyed by flow id; rules from `lib/flow/rules.ts` (the FD2 catalogue that can be computed client-side first: no Trigger, unreachable step, unconnected required answer, empty prompt, invalid number, unknown `{{variable}}`, path with no Outcome, unsupported step); step marks with Go to step; Publish disabled with the reason while errors exist.
- *Resolves:* F-FLOW-004, F-UX-004, F-FLOW-010, F-FLOW-029, F-FLOW-037.
- *Spec:* FD2 §12.1–§12.5; D §6.5 Validation; N §5.3 (Validation domain).
- *Acceptance:* the audit's invalid flows show errors, not a green pill; switching flows clears the previous flow's results; Publish is `aria-disabled` with "Fix 2 errors to publish".

### P0-05 · Revisions backend (BE) · L · Depends: none (starts day one)
- *Scope:* FD1 draft and live revisions with immutable versions (author, note, time); FD2 `If-Match` on draft PUT with 409; FD3 no-op PUT detection; FD4 server validation returning `{ruleId, level, stepId, field, message}` with the client's rule ids (422); FD5 per-trigger resolution (inbound number, batch, Cockpit default) for "Where it goes live"; publish and roll back as new versions. When it ships, `cap.flow_revisions` flips and the UI moves from I1 to Draft/Live (P2-15).
- *Resolves:* F-FLOW-001 (permanent fix), F-QA-002, F-FLOW-012, F-FLOW-014.
- *Spec:* FD2 §0.4, §4.1–§4.8, §5, §6, §12.6; D §8.2 items 1–2; G §6.2 (PublishGate endpoints).
- *Acceptance:* publish creates vN and never changes Live in place; roll back publishes v(N-1)'s content as a new version; a stale `If-Match` returns 409; a shared fixture set gives identical rule results on client and server.

### P0-06 · Status surfaces tell the truth · M · Depends: P0-00
- *Scope:* delete "SYS: ONLINE", the random latency and "RGN", and the Cockpit's idle "LAT"/"SESSION"; add the ConnectionBar for real offline; remove "You're live" from onboarding (show "Finish setup (n of 5)" until P1-10 ships the track); remove the Cockpit's demo Customer Intel and pre-call sentiment ("Not captured"); "Context Saved" only after a successful save; remove the login "Enterprise Security Enabled" badge; the Rep console never marks a rep available on page load (explicit **Go available**; blocked with a sentence if presence isn't available); the wallet banner becomes `role="status"`, not an assertive alert.
- *Resolves:* F-UX-018, F-UX-006, F-UX-003, F-QA-020 (Save Context), F-QA-039, F-UX-023 (presence), F-A11Y-015.
- *Spec:* SH §7, §5.5; D §4.4, P1; CK §2.2, §5.3, §6 (B10); O §10.3.
- *Acceptance:* SH §7.3 (no "SYS", "LAT:", "RGN" or `Math.random` in the shell bundle; offline 12 s shows the ConnectionBar within 2 s and nothing reads "online"); nothing says "live" for the workspace until the five setup checks pass; opening `/rep-console` registers no presence.

### P0-07 · No single key places a call · S–M · Depends: P0-00
- *Scope:* `c` on Leads opens the Call gate (P0-08) and never sends a call request; all single-character shortcuts go through the registry with the **Single-key shortcuts** switch (account menu, `?` dialog, palette); bare `A` select-all becomes `Ctrl/⌘+A` inside the table; the window-level Enter handler that hijacked buttons is removed; shortcuts never fire in fields.
- *Resolves:* F-A11Y-004, F-UX-013 (single-key part).
- *Spec:* A11Y §8.1–§8.5; L §8.1; D P3, P5.
- *Acceptance:* KB-05 (C opens the gate and **no call request is sent**), KB-11, KB-12; with the switch off every registry key is inert and its keycaps disappear.

### P0-08 · Every call goes through the Call gate · L · Depends: P0-00, P0-07; BE: `Idempotency-Key` + `gate_token` on call create and batch create (G §6.2)
- *Scope:* CallGate single and batch from every entry point: Leads row `Call…`, `C`, BulkBar **Call n leads…**, the Cockpit's CONNECT/Test Call (renamed **Place call…** and **Call my phone…**), Home "Call yourself"; Assistant call steps only *open* the gate (P0-09). Interim preflight per G §6.3 (flow live, caller ID, wallet, role, connection; "Rate ₹0.04/s"; one advisory row naming the unchecked items). Wallet ₹0 rule, blocking row if the wallet drops while open, 120 s token, one idempotency key per opening, `⌘/Ctrl+Enter` confirms, focus on the heading, the number validated before the gate (not after the click).
- *Resolves:* F-UX-013, F-A11Y-004, F-UX-026, F-QA-020 (Test Call validation).
- *Spec:* G §1–§6, §5.1, §8; CK §1.1–§1.3, §3.4; L §6.10, §7.4; D P3.
- *Acceptance:* G §8 checks; `C` then Enter never dials; Retry after a timeout returns the same call or batch id; at ₹0 the entry point is `aria-disabled` with "Wallet is ₹0. Top up to place calls." and the gate does not open; a network guard fails any call-create request without `gate_token`.

### P0-09 · The Assistant never acts without approval · M (BE + FE) · Depends: P0-08
- *Scope:* until the plan protocol exists, the Assistant runs Look up and Draft steps only; a suggestion chip never activates anything; Call and Publish steps become "Open Leads with these 12 leads selected" / "Open the draft in Flows"; then ship the server plan protocol (plan first, pause on approval steps, execute only with an approval token, preview hash and idempotency key).
- *Resolves:* F-UX-022.
- *Spec:* AS §10.1–§10.7, §20 items 1 and 5; D §6.6 Assistant.
- *Acceptance:* the AS §10.7 "never does" list is tested; a chip click sends no mutating request; no side effect runs without an approval token.

### P0-10 · Destructive and irreversible actions are guarded · M · Depends: P0-00
- *Scope:* apply O §3.1 tiers where today's guards are wrong: `Delete lead…` moves from under Call into `⋯` in danger text; deleting a live or attached flow needs the typed name (tier 3); Delete room becomes a labelled tier 2 action, not an icon among toggles; the flow toolbar's destructive items move into `⋯`; bulk delete over 50 leads is typed; sign-out has one name, "Sign out…", and warns about unsaved edits (Retry saving as the primary).
- *Resolves:* F-UX-035, F-UX-032, F-FLOW-019, F-UX-038 (delete part), F-UX-029 (sign-out part).
- *Spec:* O §3.1–§3.6; FD2 §14.1; SH §9.3; L §6.9.
- *Acceptance:* no destructive control sits within 8 px of a routine one or at equal weight (F §14); every tier 2–3 dialog names the object and the consequence.

### P0-11 · Records open by keyboard · M · Depends: P0-00, P0-14 (Call reports rows)
- *Scope:* Call reports rows are focusable `<tr>`s with a row link; Enter opens the detail sheet, focus moves to its heading, Esc returns it to the row; the sheet is deep-linked `?call=`; Leads rows are focusable and the lead drawer opens with Enter and receives focus.
- *Resolves:* F-A11Y-002 (critical), F-A11Y-010, F-UX-009 (mouse-only part), F-A11Y-018 (partial).
- *Spec:* CR §2.6, §2.8; L §8; N §7.9; A11Y §9.3.
- *Acceptance:* KB-05 and KB-06 pass with a guard that fails on any pointer event.

### P0-12 · A keyboard path through flow editing · L · Depends: P0-00, P0-03
- *Scope:* on the current builder: steps take focus (roving tab stop, order follows the graph), a 2 px focus outline distinct from the selection treatment, Enter opens the inspector; every answer gets a **Go to [step ▾]** select; `C` opens **Connect to…** (searchable listbox); the **Outline** nested by branch ships as a complete keyboard editor (add, rename, re-point, delete with Undo); the shortcuts sheet becomes a real dialog; edge names use step titles, not ids. The full canvas key map arrives with the new node set (P2-10).
- *Resolves:* F-A11Y-001 (critical), F-FLOW-006, F-A11Y-007, F-A11Y-027, F-A11Y-028, F-A11Y-011.
- *Spec:* FD2 §7.7, §16.1–§16.4; A11Y §9.6–§9.8; FD1 §11; D P5.
- *Acceptance:* KB-07 (a keyboard-only build of Trigger → Question with 2 answers → Speak → Outcome, every answer connected with `C` and with Go to), KB-09; SR-04 Outline part on NVDA.

### P0-13 · Contrast and focus hotfix by value swap (M0) · S · Depends: none
- *Scope:* ship `tokens.css` and `legacy-aliases.css` (F §15.6 step 1): `--text-muted` takes the new `--text-3` (#5F6878), `--saffron` maps to Neel; change `.btn-saffron`'s literal black label to `var(--on-accent)`; add `base.css`'s focus-visible outline rule only (its type rules wait for P1-01); placeholders on `--text-3`.
- *Resolves:* F-A11Y-008, F-A11Y-009, F-A11Y-006, F-A11Y-020 (contrast part), F-VIS-003 and F-VIS-004 (partly).
- *Spec:* F §3.4, §13, §15.6; D §5 Accent and Neutrals.
- *Acceptance:* `check-contrast.mjs` 460 pairs, 0 failures; CT-02 on Cockpit, Leads, Call reports and Flows finds no token-driven text under 4.5:1 (arbitrary-value text is logged for P1–P2); the visual diff of every route is reviewed in both themes.

### P0-14 · Call reports counts every call, once · L (BE M + FE M) · Depends: P0-00; BE: CR B1–B4
- *Scope:* server pagination, search, sort and filter (`offset`/`limit` already accepted); legs grouped into one conversation with a backfill of old pairs; a `kind` enum (Real call · Test call · Browser test) with test calls hidden by default and a "Show test calls" switch; KPIs from `/api/calls/stats` or not rendered; "1–50 of 121 calls · test calls hidden".
- *Resolves:* F-QA-005, F-QA-006, F-QA-014, F-UX-011 (partly), F-UX-009 (50-of-121 part).
- *Spec:* CR §1.1, §1.5, §2.5, §2.13; D §6.4; N §7.11.
- *Acceptance:* the pager reaches call 121; search finds a call outside the newest 50; a browser test counts once; Call reports and Analytics agree for the same range and filters.

### P0-15 · Deep links, dead ends and wrong destinations · M · Depends: P0-00
- *Scope:* Top up and Enable autopay open the wallet top-up (today's Billing presets) instead of Settings › Profile, with the SH §2.4 hash redirects; the three dead Docs links go to real pages; the logo, workspace tile and 404 resolve through the landing function; a member opening Review proposals gets the Forbidden page, not a silent redirect; Leads and Call reports read and write filters, page and the open record in the URL; the 404 renders inside the app shell with a plain sentence.
- *Resolves:* F-UX-002, F-QA-004, F-QA-017, F-UX-029, F-UX-034, F-QA-018, F-UX-031, F-QA-016, F-QA-039 (404 copy).
- *Spec:* SH §2.3–§2.5, §6.4, §15; L §3.1; CR §1.4; N §0.7.
- *Acceptance:* the SH §2.4 CI crawl (every legacy path answers 308 to its target; every in-app hash resolves to an element); a pasted filtered, paged Leads URL restores the same rows and open lead after reload and Back.

### P0-16 · Sign-up works and setup never dead-ends · M–L · Depends: BE PA A1 (create-account API with `mode` and attribution), organization creation
- *Scope:* `/signup` is its own route in Create account mode (Request access in approval mode), never a redirect to `/login`; email verification; `/signup/workspace` creates the organization and workspace with the user as admin, so integrations enable and invites work; `/admin/organizations` redirects to Settings › Organization & team; every "Get started" CTA goes to `/signup`; onboarding no longer scrolls sideways.
- *Resolves:* F-QA-010, F-UX-001 (critical), F-QA-030 (partly), F-RWD-019.
- *Spec:* PA §3.4 (A1), §9, §12; SH §12.1–§12.3; ST §7.2.
- *Acceptance:* PA §9.11; a new account reaches `/home` with a workspace and organization; inviting a teammate succeeds; no integration is disabled for lack of an organization.

### P0-17 · Public claims are verifiable · S (content) + M (claims sheet) · Depends: owner answers PA-Q1–Q3, Q6
- *Scope:* `/about` is unpublished or cut to verifiable facts with an owner; `content/claims.ts` feeds every public page, auth page and email; the copy lint (fails on "certified", "compliant", "SOC 2 compliant", "guarantee", "every Indian language" and the rest of PA §3.3) runs in CI; `/security` is the only page that states compliance status; language counts, OAuth providers and social proof come from the sheet or are removed.
- *Resolves:* F-QA-001 (critical), F-QA-009, F-QA-025, F-QA-034, F-QA-011 (promises part).
- *Spec:* PA §3.3, §6, §19.
- *Acceptance:* copy lint green; every claim has `owner` and `verifiedOn` within 90 days; `/about` names no customer, funding round or certification without documentation.

### P0-18 · Personal data stays out of telemetry (added by the tech lead) · S · Depends: none
- *Scope:* session replay and autocapture off on Cockpit, Rep console, Leads and Call reports; events carry ids and enums only; no analytics cookie before consent.
- *Resolves:* F-UX-045, F-QA-033.
- *Spec:* CK §4.7, §5.11; CR §2.12; PA §4.4.
- *Acceptance:* no replay script loads on those routes; a fresh visit sets no non-essential cookie before the ConsentBar choice.
