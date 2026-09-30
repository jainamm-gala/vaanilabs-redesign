
### F-QA-036 — The wallet banner renders about 3 s late and pushes the page down
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** QA-B-24
- **Pages:** all authenticated pages (measured on /analytics)
- **Evidence:**
  - The banner appears about 2.9 s after navigation, once `/api/billing/wallet` resolves.
  - It pushes all content down by its height, about 42 px. CLS was 0.028 on /analytics, and the shift is visible between the two captures.
  - The wallet is re-polled every 60 s.
  - The Cockpit fetches the wallet 4 times per load (see F-QA-007).
- **Screenshots:** audit/screenshots/va-qa-b/analytics-1.png, audit/screenshots/va-qa-b/analytics-full.png
- **Recommendation:**
  - Resolve the wallet state server-side in the layout (or from the session), so the banner is in the first paint.
  - Otherwise reserve a fixed-height slot, or render the banner as an overlay or sticky element outside the content flow.
  - Cache the wallet in the shared query cache, so client navigations never re-trigger the shift.

---

### F-QA-037 — Stale queued and in-progress calls, and later calls are not linked to the lead (partly inferred)
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** QA-B-27
- **Pages:** /call-reports, /leads (lead drawer), /analytics (Recent)
- **Evidence:**
  - Among the latest 50 calls, 4 are `queued` and 3 are `in_progress`, all from days earlier.
  - One lead's drawer shows "CALLS 1", with a single "QUEUED 28 Aug, 11:45 pm" entry that is a month old.
  - Analytics Recent shows many later outbound calls to the same masked number.
  - Inferred: Cockpit and browser calls are not attached to the lead record, so the lead stays "New" and Interest stays "—".
- **Screenshots:** audit/screenshots/va-qa-b/leads-drawer.png, audit/screenshots/va-qa-b/callreports-1.png
- **Recommendation:**
  - Add a reaper job that moves calls stuck in `queued` or `in_progress` for more than N minutes to `failed` (reason "No answer / timed out"), and shows that state in the UI.
  - Match calls to leads by normalised E.164 number at call creation, then update the lead timeline, status and interest.

---

### F-QA-038 — A full-screen decorative noise overlay sits at z-index 9999 over the authenticated app
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** EXPLORE-CORE-27
- **Pages:** all authenticated pages
- **Evidence:**
  - `.noise-overlay` has `position: fixed`, `z-index: 9999`, `opacity: 0.02` and `pointer-events: none`, with an SVG noise background covering the whole app.
  - At 2% opacity it is visually negligible, but it:
    - adds a full-viewport compositing layer;
    - sits above every modal, toast and menu in the stacking order;
    - slightly tints every colour-contrast measurement.
- **Screenshots:** —
- **Recommendation:**
  - Remove it from the `(dashboard)` layout and keep it on marketing pages only.
  - If a texture is wanted in the app, put it as a `background-image` on the root surface, not as a top-level fixed layer.

---

### F-QA-039 — Off-theme 404 with gimmicky sci-fi copy, and a meaningless "Enterprise Security Enabled" badge on login
- **Severity:** low · **Confidence:** single-agent (EXPLORE-SETTINGS-03 and QA-B-23 describe the same 404 page seen from inside the app)
- **Source findings:** PUBLIC-SITE-23
- **Pages:** any unknown route (404), /login
- **Evidence:**
  - **The 404 page.**
    - It returns a correct HTTP 404 with `noindex`.
    - It renders light, with a blue `#2F5FE0` primary, while other public pages default to dark.
    - Copy: "SIGNAL LOST / … The neural pathway you're looking for doesn't exist or has been relocated to a different sector." plus "ERR: 0x404 • NODE: MUMBAI-1 • STATUS: DISCONNECTED", which reads like an outage.
    - Its only actions are "Return Home" (always `/`, even for signed-in users) and "Go Back". There is no nav, no search and a generic title.
  - **The login footer** reads "Vaani Labs Neural Platform v2.0.4 — Enterprise Security Enabled", which exposes the build version and claims nothing specific.
- **Screenshots:** audit/screenshots/va-public-site/404.png, audit/screenshots/va-public-site/login_default.png
- **Recommendation:**
  - Use a plain 404 ("Page not found") inside the marketing shell, with links to Home, Docs, Pricing and Contact plus a search box.
  - For signed-in users, render it in the app shell with "Go to Dashboard".
  - Set the title to "Page not found · Vaani Labs".
  - Replace the login footer with "Privacy · Terms · Security" links.

---

### F-QA-040 — Polish inconsistencies on the home page
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** PUBLIC-SITE-25
- **Pages:** /
- **Evidence:**
  - **Icons.** Emoji icons (🎯🔐🌐, 🛍🏦🩺…) are mixed with line icons in the security section.
  - **Eyebrows.** There are two eyebrow styles: about 1.2 px tracking, and about 4 px tracking with a leading rule ("ENTERPRISE-GRADE SECURITY", "GET STARTED").
  - **Containers.** Widths vary: x≈154–1286 for most sections, x≈180–1260 for security.
  - **Carousel.** The fourth industry card is hard-cropped, with no fade or peek.
  - **Testimonials.** Role text wraps awkwardly ("Founder · NBFC, / Ahmedabad").
  - **Footer.** Headings are lowercase in the DOM and uppercased by CSS.
  - **Light mode.** The hero wave line strikes through the "Speaking …" pill, and only the first proof pill keeps its border.
- **Screenshots:** audit/screenshots/va-public-site/home_full_part0.png, audit/screenshots/va-public-site/home_full_part1.png, audit/screenshots/va-public-site/home_full_part2.png, audit/screenshots/va-public-site/home_light.png
- **Recommendation:**
  - Use one icon set (the line icons already used in the security section).
  - Use one eyebrow token and one container width (1200 px).
  - Give the carousel a fade-mask peek.
  - Reserve a line for role text above the outcome chip.
  - Author the footer headings in their display case.
  - Set a `z-index` or mask so the hero line passes behind the pills.

---

### Appendix 3F — Refuted / not reproduced

**No finding owned by this section was refuted.** The verifier did correct, or fail to reproduce, the sub-claims below. They are excluded from, or qualified in, the findings above.

| Source finding | Sub-claim not reproduced or corrected | Verifier note (summary) |
|---|---|---|
| UX-AUDIT-01 | The autosave PUT fires "within 700 ms" of adding a node | Not reproduced: the PUT came 2.1–4.6 s after the add. "Half-finished edits go live" remains an inference. Lowered from critical to high. |
| QA-A-01 | Opening a flow changes its stored content or "last edited" | The on-open PUT body matched the GET except for key order (55 objects) or React Flow layout fields. A second flow's `updated_at` (4 Sept) did not change after guarded visits. The default flow's same-day `updated_at` has an unknown cause. Lowered from critical to high. |
| DESIGN-SYSTEM-08 | The write is triggered by the theme toggle ("idle 6 s: 0 writes") | Verifiers saw the PUT with zero interaction 5.9–10 s after load, so no toggle is needed. The toggle-specific and Dashboard PUTs were not independently re-checked. |
| EXPLORE-CORE-18 | Slow `/api/auth/me` logs the browser out to a bare /login | Seen only in earlier runs (explore-core and UX-audit). Not reproduced in this run, where sessions stayed valid for 1–1.5 h. |
| QA-B-01 | Critical severity | Lowered to high: nothing is lost or exposed, and the API already paginates. |
| QA-B-03 / QA-B-05 / QA-B-06 / QA-B-07 | High severity | Lowered to medium: same root cause as QA-B-01 (QA-B-03); correct total is visible in the footer (QA-B-05); URL/navigation UX only (QA-B-06); equivalent content exists elsewhere (QA-B-07). |
| QA-B-05 | Zero KPIs under the Contacted/Converted filters are a bug | Arguably correct for the filter. Only the page-2 scoping is a defect. |
| QA-B-04 | Billing is doubled for two-leg calls | Not verified. Only the record and count inflation is confirmed. |
| EXPLORE-SETTINGS-01 | Critical severity | Consolidated at the verifier's high (confirmed via QA-A-03 and QA-B-02). |
| EXPLORE-SETTINGS-04 / QA-B-08 | What COPY puts on the clipboard | Unresolved: one agent intercepted clean code, the other got an empty read-back. |
| PUBLIC-SITE-05 | "18 controls, all placeholder-only"; "no site navigation" | There are 19 controls. The 3 selects have `aria-label` and the 5 checkboxes have labels (11 fields are placeholder-only). A full footer with about 24 links exists; only header nav is missing. |
| PUBLIC-SITE-07 | 40+ vs 12+ languages, sub-200ms vs sub-second, LiveKit/Daily vs Zoom/Meet/Teams, and BYO carriers vs Twilio are contradictions | Compatible pairs, not contradictions. "Hero never mentions India" is weak: Hindi appears in the rotating pill and in later copy. Lowered from high to medium. |
