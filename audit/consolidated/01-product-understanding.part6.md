### 1.5 Primary user journeys (as-is)

**How to read this.** Each journey is written as the steps a user takes today.

- **BREAKS** means the user is blocked, misled, or put at risk.
- **UNCLEAR** means the user has to guess.
- Ratings (1–5) come from `ux-audit` where it scored the journey.
- Steps that were not executed because of the read-only rules (Save, ACTIVATE, CONNECT, any call, Create Room, Start task, Pay) are described up to the click.

#### J1. First run and orientation (rating 2/5)

1. The visitor clicks "Start free" or "Get started" and lands on `/signup`, which redirects to `/login` in sign-in mode. **BREAKS**: a new user sees "Welcome Back" (PUBLIC-SITE-03).
2. They find the 12 px grey "Sign up" toggle and submit name, email, phone and password, or use Google or Meta OAuth. **UNCLEAR**: the form says "early access (admin approval required)", which contradicts "Free tier" (PUBLIC-SITE-04).
3. An admin approves the account. The changelog mentions an "approve/reject workflow", and Profile shows STATUS APPROVED. **UNCLEAR**: there is no stated turnaround or confirmation message *(not observable)*.
4. `/onboarding` runs Profile → Subdomain → Flow → Test call → Done, then shows "You're *live.*". **BREAKS**: Test call is ticked although the API never recorded it. The account has ₹0 and no number (EXPLORE-CORE-09).
5. "Go to dashboard" opens the Agent Cockpit: dense, idle, with no welcome and no next step. **BREAKS**: there is no setup checklist anywhere (UX-AUDIT-19).
6. The user tries to orient using 12 unlabelled rail icons, 3 of which are "agent" concepts. **UNCLEAR**: EXPLORE-CORE-05, UX-AUDIT-11.
7. They see the wallet banner and click Top up, which lands on Profile Settings. **BREAKS**: UX-AUDIT-02.

The prerequisites for going live (wallet, calling number, call channel, transfer phone) are spread across 4 or more pages that are never linked together (UX-AUDIT-07).

#### J2. Build or edit a call flow and put it live (rating 2/5)

1. Rail → Flow Builder. The builder auto-loads the profile's flow and writes to it on open. **BREAKS**: FLOW-CONFIG-02, UX-AUDIT-01.
2. The user picks a flow in "All flows". **UNCLEAR**: duplicate names, fake "(vN)" versions and no Live column (FLOW-CONFIG-06).
3. To create a flow instead, they use … → New flow, which instantly swaps in the default template, or AI draft, which replaces the canvas. **BREAKS**: no name prompt, template picker or confirmation, and the template itself is invalid (FLOW-CONFIG-08, FLOW-CONFIG-19).
4. They add nodes from the palette. **BREAKS**: new nodes stack on top of existing ones, unconnected (FLOW-CONFIG-05).
5. They configure each node in the side panel. **UNCLEAR**: no variable picker; invalid values are applied anyway (FLOW-CONFIG-12, FLOW-CONFIG-17).
6. They wire outcomes by handle position (YES at the bottom, NO on the right). **UNCLEAR**: FLOW-CONFIG-11.
7. Every edit autosaves into the same record. **BREAKS**: changes are probably live mid-edit, the chip says "Up to date" even when saves fail, and quick navigation loses the last edit (FLOW-CONFIG-01, FLOW-CONFIG-03).
8. They click Validate. **BREAKS**: the "FLOW VALIDATED" badge stays green over real errors, and validation checks connectivity only (UX-AUDIT-03, FLOW-CONFIG-04).
9. Preview AI script is the only form of test. **BREAKS**: there is no simulator or "call me with this draft" (FLOW-CONFIG-10).
10. Save and/or ACTIVATE. **UNCLEAR**: Save's purpose is unexplained when autosave already runs. ACTIVATE stays enabled with errors and looks the same on the already-active flow (FLOW-CONFIG-07).
11. To hear the flow, the user must switch to the Cockpit (J4). Nothing links the builder to the Cockpit.

#### J3. Teach the agent (Knowledge)

1. Rail → Knowledge.
2. Pick a mode (file, text, URL or CSV) and choose Upload/Save/Fetch & Embed. **UNCLEAR**: the CSV mode is identical to file upload and gives no guidance (EXPLORE-DATA-19).
3. The file appears under a storage-key name with Embed and Delete buttons. **UNCLEAR**: nothing shows whether it has been indexed.
4. Test Knowledge Search. **BREAKS**: under failure, the error renders off-screen (EXPLORE-DATA-18).
5. In Flow Builder, reference the file from a Knowledge Query or FAQ node. **UNCLEAR**: raw file names appear in the select (FLOW-CONFIG-14).
6. Later, from Call Reports, "Learn from this call" leads to Review proposals. **BREAKS**: that page silently redirects to `/dashboard` (EXPLORE-DATA-02).

#### J4. Run a test call from the Cockpit (rating 2/5)

1. `/dashboard` is the default route.
2. Pick a FLOW. **BREAKS**: this silently rewrites the profile default that Meetings and Leads use (EXPLORE-CORE-03).
3. Pick a voice (Vaani or Vikash). **UNCLEAR**: there is no preview or description, and this also saves to the profile.
4. Check Customer Intel. **BREAKS**: the latest real lead's name is shown alongside demo email, company and city, plus a pre-call sentiment (EXPLORE-CORE-02, UX-AUDIT-05).
5. Choose **CONNECT** (browser mic) or enter a number and press **Test Call** (phone). **UNCLEAR**: neither the difference nor the cost is explained. **BREAKS**: "abc" enables Test Call, and there is no check for ₹0 or an unverified number (EXPLORE-CORE-13, UX-AUDIT-04).
6. Watch the Transcript Feed. The connecting, in-call and ended states were not observed.
7. Save Context. **UNCLEAR**: it could mean "use for this call" or "save to lead".
8. Find the call afterwards in Call Reports. **UNCLEAR**: there is no link, and the call appears as two BROWSER rows (EXPLORE-DATA-20).

#### J5. Load leads and call them (the campaign substitute; rating 3/5)

1. Leads → Import CSV (template, CSV/XLSX up to 5 MB, phone required) or New lead. **BREAKS**: the phone field accepts "abc", and there are no dialog semantics (EXPLORE-DATA-13).
2. Narrow the list with search, chips and the keyboard (`/`, J/K). **UNCLEAR**: filters are not in the URL, and the counts mislead (EXPLORE-DATA-11).
3. Select rows (X, or A for all) to open the bulk bar: voice, language, "Default flow". **UNCLEAR**: the flow is not named, and duplicate flows cannot be told apart (UX-AUDIT-06).
4. Place calls with CALL n, Call Now or `C`. **BREAKS**: no pre-flight check, cost, balance, calling hours or consent/DND step, and a single key can mass-dial (UX-AUDIT-04, EXPLORE-DATA-07).
5. Follow up in the lead drawer's call history. **BREAKS**: a month-old call still reads "QUEUED", and lead status never advances from NEW (UX-AUDIT-22, EXPLORE-DATA-08).
6. Review results in Call Reports and Analytics (J6).

There is no campaign object for schedules, pacing, retries or a per-campaign flow *(inferred; `/campaigns` returns 404)*.

#### J6. Find a past call and understand performance (rating 3/5)

1. Call Reports → search transcripts or filter by sentiment.
2. Scan the 17-column table. **BREAKS**: only 50 of 121 calls can be reached, and no column stays pinned when scrolling sideways (EXPLORE-DATA-04).
3. Click a row to open the detail panel. **UNCLEAR**: the transcript comes last, recordings are promised but absent, and rows cannot be opened by keyboard (UX-AUDIT-09).
4. Re-analyze, Learn from this call, or Export.
5. Analytics for trends. **UNCLEAR**: the range toggle's scope (EXPLORE-DATA-10). **BREAKS**: the flow drop-off bars are empty (EXPLORE-DATA-05), and metrics disagree with Call Reports (EXPLORE-DATA-17).
6. Analytics §07 → "Open report" → Call Reports. This step works.

#### J7. Understand spend and top up (rating 2/5)

1. Click the banner's Top up. **BREAKS**: it lands on Profile (UX-AUDIT-02).
2. Find `/billing` through the rail card icon. **BREAKS**: at ≤900 px height the icon is clipped (EXPLORE-CORE-04).
3. Choose a preset or type an amount, then Pay with UPI. The alternative is Enable UPI Auto-Debit. **UNCLEAR**: amounts are not validated (0, −50 and 9,999,999 are accepted).
4. Look for rates, usage or invoices. **BREAKS**: none exist. Meeting plans live in Settings › Meetings Billing, and API rates exist only in the public docs (UX-AUDIT-08, EXPLORE-SETTINGS-10).

#### J8. Deploy the meeting agent (rating 3/5)

1. Rail → Meet Agent.
2. Title. **UNCLEAR**: it is pre-filled with a value that repeats across meetings, and an empty title is still allowed (UX-AUDIT-16).
3. Mode. **BREAKS**: Presentation mode promises an attached deck but has no attach control (EXPLORE-CORE-25).
4. Privacy: Encrypted is the default. **UNCLEAR**: how the key reaches guests is never explained.
5. Flow: "Active flow (from profile)". **UNCLEAR**: the flow is not named.
6. Create Room, copy the `meet.vaanilabs.in` URL, and share it.
7. Use Agent (adds the AI), Intel and Record.
8. To end, use the icon-only red "Delete room" placed among the toggles. **BREAKS**: rooms never auto-end (one has been live for 82 h with STALE 0), and delete is easy to mis-click (EXPLORE-CORE-11).
9. Look in Past meetings for outcomes. **BREAKS**: there are no summaries, recordings or action items there.
10. PPT generation is a separate section at the bottom of the page.

#### J9. Delegate a goal to a personal agent (rating 3/5)

1. Rail → Personal Agents and read the explainer (a strength).
2. New task, then enter a goal and an optional capability hint. **UNCLEAR**: Start task is enabled with an empty goal, and the example cards look clickable but aren't.
3. Start task. **BREAKS**: no number is assigned, numbers are admin-provisioned, and this is stated only on `/settings/personal-agent` (EXPLORE-CORE-14).
4. The agent asks for confirmation according to the autonomy settings, by WhatsApp (the default), Call or Email. **BREAKS**: no WhatsApp number can be entered anywhere (EXPLORE-SETTINGS-18).
5. Track progress in the task list with Refresh. There is no budget, schedule or spend cap (UX-AUDIT-25).

#### J10. Telephony setup and human hand-off (rating 2/5)

1. Settings → Calling number: verify ownership, then Compliance, then Authorized. **UNCLEAR**: "Send code" enables for "abc".
2. Analytics says "Allocate a number from billing". **BREAKS**: Billing has no numbers (EXPLORE-DATA-21).
3. Settings → Call channel: PSTN (forwards to "your phone number"), Browser or Auto. **BREAKS**: the Profile phone is empty, and the copy says Browser/Auto "fall back to PSTN" (UX-AUDIT-07).
4. Flow Builder: add a Human Handoff (Transfer) node with a number or "use context". **UNCLEAR**: there is no failed or no-answer path.
5. The rep opens `/rep-console` and becomes present on load. **BREAKS**: there is no explicit availability control, errors show raw SDK text, and the page is unavailable on mobile (UX-AUDIT-24, EXPLORE-CORE-21).

#### J11. "Just ask" the Assistant

1. `/assistant`: pick a chip or type a request, and optionally attach a file.
2. The Plan & Actions panel shows the plan, and the Assistant acts (build or activate a flow, add leads, place a call). **BREAKS**: no visible approval, cost or recipient step (EXPLORE-CORE-16). This was not exercised.
3. History stays in this browser only. It does not reach another device or a teammate.

#### J12. Developer integration

1. Settings → API Keys leaves Settings for `/api-keys`, which has no back link and no active rail item. **UNCLEAR**: EXPLORE-SETTINGS-07.
2. Name the key, choose scopes and a rate limit, then Mint key. The key is shown once, and the page says so clearly.
3. Embed: copy the snippet. **BREAKS**: the displayed code is corrupted, though Copy copies clean code (EXPLORE-SETTINGS-04).
4. Webhooks → New webhook: URL and events. **UNCLEAR**: an invalid URL is still submittable (EXPLORE-SETTINGS-17).
5. Settings › Docs. **BREAKS**: 3 of the 5 guides return 404 (EXPLORE-SETTINGS-03).

#### J13. Org, team and integrations

1. Settings → Organization says "create your own org below", but nothing is below. "Browse organizations" leads to `/admin/organizations`, which says "Create one", with no create control. **BREAKS**: a circular dead end (EXPLORE-SETTINGS-02).
2. Settings → Integrations: all 5 Connect buttons are disabled. The reason is below the fold and quotes a raw path.
3. There is no way to invite teammates: `/team` and `/settings/members` return 404.

**Journey scorecard.** Ratings are from `ux-audit`; "n/r" means the journey was not rated.

| Journey | Rating | Dominant break |
|---|---|---|
| J1 First run | 2 | "You're live." with ₹0 and no number; no checklist |
| J2 Flow → live | 2 | Autosave into the live flow; false validation badge |
| J3 Knowledge | n/r | Proposals redirect; no indexing status |
| J4 Test call | 2 | Mixed real and demo intel; silent profile write |
| J5 Leads → calls | 3 | No pre-flight or cost before mass calling |
| J6 Past calls | 3 | Metrics disagree; 71 of 121 calls unreachable *(inferred)* |
| J7 Spend | 2 | Top up dead-ends; no usage or rates |
| J8 Meetings | 3 | Rooms never end; no meeting outputs |
| J9 Personal agent | 3 | Hidden number prerequisite |
| J10 Telephony | 2 | Three unlinked number concepts; channel copy contradicts Rep Console |
| J11 Assistant | n/r | No guardrails; history only in the browser |
| J12 Developer | n/r | Orphan pages; corrupted snippets; doc 404s |
| J13 Org and team | n/r | Org creation dead end |
