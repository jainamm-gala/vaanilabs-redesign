## 3F. Findings — Functional bugs, performance, public site & auth

This section consolidates the functional, data-integrity, performance, public-marketing-site and auth findings. It draws on QA agents A and B, the signed-out public-site auditor, and the explorer, UX, visual, design-system, responsive and a11y agents where their findings overlap.

**How to read it**
- Severities are shown after the adversarial verifier's corrections were applied. Where I changed a severity myself, the Evidence line says so.
- "Observed under simulated network failure" means the audit's read-only guard blocked the write. The finding is about how the UI reports that failure, not about the failure itself.
- No live writes were made. Flow names and customer or lead data are replaced with generic references.

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 12 |
| Medium | 22 |
| Low | 5 |
| Refuted | 0 (see the appendix for sub-claims that were not reproduced) |

---

### F-QA-001 — The /about page makes placeholder-looking or unverifiable company claims that contradict /security
- **Severity:** critical · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-01
- **Pages:** /about, /blog (also contradicts /security and /)
- **Evidence:**
  - The /about timeline was re-checked live. It says, word for word:
    - 2024: "First enterprise pilot with" a named real bank
    - 2025: "Series A funding — $12M raised"
    - 2025: "1M+ calls processed milestone"
    - 2026: "SOC 2 Type II Certified"
  - The story claims "some of India's largest enterprises, handling millions of calls".
  - The team section lists six people with initials-only avatars and no photos or links. Their roles are CEO & Co-Founder, CTO & Co-Founder, VP Eng, Head of AI Research, Head of Product and Head of Design.
    - None of the six is either of the two founders shown with 240px photos on /contact.
    - Five of the six names are the bylines on all five /blog posts.
  - /security §13 says the company has "not yet completed an external security audit". §11 says "SOC 2 Type II — readiness work in progress; targeting an observation window starting Q4 2026". The home page says "SOC 2 Type II readiness is in progress".
  - The verifier kept this critical because of legal and compliance exposure: the page claims a certification the company says it does not hold, and it names a real bank. It does not block a user task. The funding and bank claims cannot be verified from the site.
- **Screenshots:** audit/screenshots/va-public-site/about_part0.png, audit/screenshots/va-public-site/about_values_team.png, audit/screenshots/va-public-site/about_part1.png, audit/screenshots/va-verify-public-site/about_top.png
- **Recommendation:**
  1. Unpublish /about today, or cut it to verifiable facts only.
     - Use the real founders, reusing the /contact photos and bios.
     - Give the actual founding date and legal entity, and state the Vaani Labs / StarVox Labs relationship once.
     - List only real milestones.
  2. Remove the named-customer, funding and "SOC 2 Type II Certified" claims unless they are documented. A customer name or logo needs written permission.
  3. Re-attribute /blog posts to real authors, or take the blog down.
  4. Add a publishing gate: any page mentioning a certification, customer or funding must be approved by a named owner, and must link to /security for compliance status.

---

### F-QA-002 — Flow Builder writes to a flow that is only opened, re-saves on non-edits, and shows "Up to date" when saves fail
- **Severity:** high (reported as critical by QA-A and UX-audit; the verifier lowered it) · **Confidence:** verified (confirmed by 3 independent verifier passes, reported by 6 agents)
- **Source findings:** QA-A-01, UX-AUDIT-01, VISUAL-AUDIT-11, RESPONSIVE-A-10, A11Y-AUTO-12, DESIGN-SYSTEM-08
- **Pages:** /flow-builder (and possibly /dashboard, via the theme toggle)
- **Evidence:**
  - **Write on open.** With zero interaction, `PUT /api/flows/f9b04a18…` fired on every load.
    - Timing: about 5.9–7.7 s after navigation, or 3–3.8 s after the nodes render. The a11y agent saw it at about 10 s.
    - Loads observed: 4/4 (QA-A), 2/2 (UX verifier), 3/3 at 768×1024 and 1440×900 (responsive verifier), and zero-interaction loads by the visual verifier.
    - Body: 48,331 bytes, `{name, description, flow_config, is_public}`.
  - **What the write contains.**
    - For the default flow, the 26 nodes and 27 edges match the GET except for key order in 55 objects.
    - For a second flow (`bf11c0a3…`), only React Flow layout fields differed: measured width/height, and a dropped `selected` flag.
    - So the on-open write does not change content today. It still bumps version/`updated_at` and creates a last-write-wins risk.
    - The default flow's `updated_at` was 10:39 UTC (16:09 IST) on the audit day, cause unknown.
    - The auto-written flow is the same one pre-selected in the Cockpit, so it is the flow live calls use.
  - **Other triggers that fire a PUT** (all while blocked):
    - switching flows in "All flows" (3.1 s later);
    - merely selecting an existing node (3.4 s later);
    - adding a Speak node (2.1–4.6 s later; UX-AUDIT-01's "within 700 ms" was not reproduced);
    - dragging a node (about 3 s later);
    - tapping a node on mobile.
    - DESIGN-SYSTEM-08 (unverified) also saw a PUT within 1.5 s of toggling the colour theme on Flow Builder and on Dashboard, with 0 writes in the 6 s idle window before.
  - **False success.** After every blocked PUT, the `role="status"` pill kept saying "Up to date": at 2 s, 4.6 s, more than 7 s and 37 s later. There was no Saving, Unsaved or Failed state, no toast and no retry. A user whose save fails is told their changes are saved.
  - **Not verified:** that half-finished edits go live. This is an inference, because autosave targets the flow that ACTIVATE makes live.
- **Screenshots:** audit/screenshots/va-verify-qa-a/flow_load_13s.png, audit/screenshots/va-verify-qa-a/flow_add_speak_after_put.png, audit/screenshots/va-verify-qa-a/flow_after_add_put_failed.png, audit/screenshots/va-verify-ux-audit/08_flow_after_add_2s.png, audit/screenshots/va-verify-ux-audit/09_flow_after_add_4s.png, audit/screenshots/va-verify-responsive-a/flow-builder_after_drag_failed_save.png, audit/screenshots/va-verify-visual-audit/flow-builder_3s.png, audit/screenshots/va-verify-visual-audit/flow-builder_9s.png, audit/screenshots/va-visual-audit/dark_flow-builder_after_autosave.png, audit/screenshots/va-a11y-auto/flow-builder-loaded.png
- **Recommendation:**
  1. **Never persist on load, flow switch, select, fit-view, resize or theme change.**
     - Keep a `dirty` flag that only user mutations set: add, delete, connect, edit, and a drag that ends in a changed position.
     - Before any PUT, compare a stable hash of the serialised `flow_config` (sorted keys, React Flow runtime fields like `measured`, `selected`, `dragging` stripped) against the last-loaded hash. Skip the PUT when they are equal.
  2. **If normalisation is needed**, do it server-side on read, not as a client write that bumps `updated_at`.
  3. **Bind the save pill to the request lifecycle:**
     - `Saving…` while in flight;
     - `Saved hh:mm` on 2xx;
     - `Couldn't save — Retry` on failure, with a persistent inline banner and a `beforeunload` guard while unsaved;
     - `Offline — changes kept locally` when `navigator.onLine` is false.
  4. **Send conditional writes** (`If-Match`/version field) and return 409 on conflict, to stop silent last-write-wins over a colleague's edits.
  5. **Autosave into a draft revision.** The live flow changes only through ACTIVATE/Publish, which shows a diff.
  6. **Add an e2e test** that loads /flow-builder, waits 15 s, toggles the theme and selects a node, and asserts zero non-GET requests.

---

### F-QA-003 — Undo does not undo node additions, is enabled with nothing to undo, and autosave makes accidental edits stick
- **Severity:** high · **Confidence:** verified
- **Source findings:** QA-A-22
- **Pages:** /flow-builder
- **Evidence:**
  - On a fresh load, Undo is enabled and Redo is disabled.
  - "Add Speak node" took the canvas from 26 to 27 nodes. A PUT fired 3.2 s later, and the pill stayed "Up to date".
  - Two Undo clicks, then two Ctrl+Z presses with the pane focused, all left 27 nodes, and Redo stayed disabled.
  - A history stack does exist: with a node selected, Undo did enable Redo. It just does not record node additions.
  - Combined with F-QA-002, an accidental palette click on the live flow is written to the server and cannot be undone in the UI. The verifier discarded all changes by reloading, so nothing was saved.
- **Screenshots:** audit/screenshots/va-verify-qa-a/fb_undo_at_load.png, audit/screenshots/va-verify-qa-a/fb_after_add.png, audit/screenshots/va-verify-qa-a/fb_after_undo.png, audit/screenshots/va-verify-qa-a/flow_after_ctrlz.png
- **Recommendation:**
  - Route every canvas mutation through one command/history stack: add, delete, move (on drag end), connect, disconnect, edit node config, paste and AI-draft apply. Palette adds are currently bypassing it.
  - Derive `canUndo` from `past.length > 0`, so Undo is disabled on load.
  - Suspend autosave while an undo/redo is being applied, then save the resulting state once.
  - Add unit tests: for each mutation type, apply → undo returns a deep-equal graph, and redo reapplies it.

---

### F-QA-004 — The wallet banner's "Top up" and "Enable autopay" open Settings › Profile, which has no wallet
- **Severity:** high (EXPLORE-SETTINGS-01 rated it critical; the verifier confirmed high) · **Confidence:** verified (5 agents, 2 verifier passes)
- **Source findings:** QA-A-03, QA-B-02, EXPLORE-CORE-01, EXPLORE-DATA-01, EXPLORE-SETTINGS-01 (UX-AUDIT-02 reports the same issue)
- **Pages:** global wallet banner on every authenticated page, including /billing → /settings#wallet, /settings#autopay
- **Evidence:**
  - The anchors are `href="/settings#wallet"` ("Top up") and `href="/settings#autopay"` ("Enable autopay").
  - Both land on "Profile Settings" at scrollY 0. There is no element with id `wallet`, `autopay` or `top*`, and no wallet, top-up, autopay or balance text outside the banner. The Settings sub-nav has no Wallet or Billing item, only "Meetings Billing".
  - Hash routing itself works: a fresh load of `/settings#meetings-billing` opens Meetings Billing. The two targets simply do not exist. A hash change on an already-loaded /settings page is ignored, even for `#meetings-billing`.
  - The banner is on every page while the wallet is ₹0, which blocks calls, and that includes /billing, where the real top-up and autopay controls live.
  - On mobile the bottom bar has no Settings entry, so the banner is also the only route into Settings.
  - Reproduced from /dashboard, /assistant, /billing and others.
- **Screenshots:** audit/screenshots/va-verify-qa-a/settings_hash_wallet.png, audit/screenshots/va-verify-qa-a/settings_hash_autopay.png, audit/screenshots/va-verify-qa-a/settings_hash_meetings_billing.png, audit/screenshots/va-verify-qa-b/settings-hash-wallet.png, audit/screenshots/va-verify-qa-b/settings-hash-autopay.png, audit/screenshots/va-qa-a/banner_topup_landing.png, audit/screenshots/va-qa-a/banner_autopay_landing.png, audit/screenshots/va-explore-core/topup_link_target.png, audit/screenshots/va-explore-data/r2_settings_wallet_anchor.png, audit/screenshots/va-explore-settings/c16_settings_hash_wallet.png, audit/screenshots/va-explore-settings/c20_billing.png
- **Recommendation:**
  1. **Retarget the links.** "Top up" goes to `/billing?action=topup`, which opens the top-up card or sheet with the amount field focused. "Enable autopay" goes to `/billing#autopay`, which scrolls to the UPI Autopay card, highlights it for about 1.5 s and focuses "Enable UPI Auto-Debit". Add the matching `id`s.
  2. **Handle legacy hashes.** On /settings, add client-side handling that forwards `#wallet` and `#autopay` to the new targets, because hashes never reach the server. Also listen for `hashchange`, so in-page hash links work after the first load.
  3. **Hide the banner's CTAs on /billing**, where they duplicate the page's own controls. Name the consequence: "Calls are paused — wallet ₹0".
  4. **Add a regression test** that walks every in-app `href` containing `#` and asserts the target element exists after navigation.

---

### F-QA-005 — Call Reports shows only the latest 50 of 121 calls; there is no pagination, and search, sort and filter cover only those 50
- **Severity:** high (reported as critical; the verifier lowered it) · **Confidence:** verified
- **Source findings:** QA-B-01 (EXPLORE-DATA-04 reports the same 50-of-121 symptom as part of a table-layout finding)
- **Pages:** /call-reports
- **Evidence:**
  - The UI calls `GET /api/calls` with no params. The response is `{total:121, limit:50, offset:0}` with 50 rows, and 50 `tbody tr` render.
  - Scrolling the table's inner scroller (scrollHeight 3093) to the bottom loads nothing more. There is no Next, Load more or page control. The last row is dated 3 Sept.
  - Sorting "Started ▲" puts 3 Sept first, although calls go back to 28 Aug.
  - Typing in search sends no request: it is a client-side filter over the 50 rows (6 of 50 matched).
  - The API already paginates: `?offset=50` and `?limit=200` return the older calls. This is a missing UI feature, not a backend limit.
  - 71 of 121 calls (59%) have no path in the UI, and that share grows with every call. Reproduced on 3 loads, including the `?id=` deep link.
  - The verifier lowered it from critical because nothing is lost or exposed.
- **Screenshots:** audit/screenshots/va-verify-qa-b/callreports-top.png, audit/screenshots/va-verify-qa-b/callreports-bottom.png, audit/screenshots/va-verify-qa-b/callreports-sort-asc.png, audit/screenshots/va-qa-b/callreports-1.png, audit/screenshots/va-qa-b/callreports-scrolled.png
- **Recommendation:**
  - Reuse the Leads pager: page size 25/50/100/200 and a "1–50 of 121" counter. Or use cursor-based "Load more" with virtualised rows.
  - Move search (`q`), sentiment filter, date range and sort to the server (`/api/calls?q=&sentiment=&sort=started_at:desc&offset=&limit=`), so they cover all calls.
  - Keep `page`, `size`, `q`, `sentiment` and `sort` in the URL (see F-QA-016 for the same defect on Leads).
  - Make `?id=` fetch that call directly when it is outside the current page.
  - Add a test with more than 50 fixture calls that asserts the oldest call is reachable.
