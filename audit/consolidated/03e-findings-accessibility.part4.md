
### F-A11Y-020 — Placeholder text is nearly invisible (1.56–1.78:1) and also serves as the field label
- **Severity:** medium · **Confidence:** verified
- **Source findings:** A11Y-AUTO-05
- **Pages:** /dashboard, /meeting-agent, /flow-builder, /billing, /assistant, /leads, /call-reports, /knowledge, /settings, /login (and dark theme)
- **Evidence:** WCAG 2.2: **1.4.3 Contrast (Minimum) (AA)**. The placeholders are also the accessible names (F-A11Y-003).
  - Dashboard Customer Intel (6 fields, 12px): #c3c8d2 on #f4f6fa = **1.56:1**. The dial input is 3.43.
  - Meeting Agent title and PPT prompt: #b4bac7 on #eef1f7 = **1.72**.
  - Flow Builder "Search nodes...": #b7bcc8 = **1.75**.
  - Billing "Top-up ₹": 3.31. Assistant composer: 3.36.
  - Search and field hints on Leads, Call Reports, Knowledge, Settings and Login: 3.77–3.80.
  - Dark mode placeholders: #3b404b on #111419 = **1.78**.
  - Verifier reproduced these values and lowered the finding to medium. On this account the Dashboard and Billing fields are prefilled, and Dashboard and Meeting Agent have visible labels, so the placeholders act as hints.
- **Screenshots:** audit/screenshots/va-a11y-auto/dashboard.png, audit/screenshots/va-a11y-auto/meeting-agent.png, audit/screenshots/va-a11y-auto/flow-builder-loaded.png, audit/screenshots/va-a11y-auto/dashboard-dark.png
- **Recommendation:**
  - Add a `--placeholder` token. Light mode: `#646d80` (4.80 on #f4f6fa, 4.59 on #eef1f7). Dark mode: `#8a90a4` or lighter (5.81 on #111419).
  - Never use a placeholder as the only label (see F-A11Y-003). Keep placeholder text a neutral example ("e.g. Mumbai, MH").

### F-A11Y-021 — Marketing home in light theme: scrolled nav links drop to 1.39:1
- **Severity:** medium · **Confidence:** verified
- **Source findings:** PUBLIC-SITE-08
- **Pages:** / (light theme)
- **Evidence:** WCAG 2.2: **1.4.3 Contrast (Minimum) (AA)**.
  - After scrolling to y=1800, the nav background computes to `oklab(0 0 0 / 0.8)` with blur over #f4f6fa, about rgb(49,49,50).
  - The links (Product, Enterprise, Pricing, Docs, Integrations, Contact, Log in) are rgb(62,71,90), which is **1.39:1**. The wordmark rgb(17,23,37) is about 1.37:1. Only "Build your own" and "Get started" stay legible.
  - The page loads with `html.dark` even under `prefers-color-scheme: light`. The first toggle click only flips the label; the second switches to light.
  - Verifier reproduced this. It lowered the finding to medium because light mode is opt-in (two clicks) and the nav stays clickable.
- **Screenshots:** audit/screenshots/va-public-site/home_light_mid.png, audit/screenshots/va-verify-public-site/home_light_scrolled.png
- **Recommendation:**
  - Make the scrolled nav surface theme-aware: `rgba(244,246,250,.85)` plus blur in light mode, `rgba(12,13,18,.8)` in dark mode. Alternatively, swap the link colour along with the surface.
  - Add visual-regression shots of both themes at several scroll positions.

### F-A11Y-022 — The app ignores prefers-reduced-motion; infinite decorative animations run with no pause
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** A11Y-AUTO-10, A11Y-MANUAL-19, DESIGN-SYSTEM-17
- **Pages:** /dashboard, /analytics, sidebar logo (every page)
- **Evidence:** WCAG 2.2: **2.2.2 Pause, Stop, Hide (A)**. 2.3.3 (AAA) is advisory only.
  - The app defines 36 keyframe animations. The only `@media (prefers-reduced-motion: reduce)` block (3 rules) targets the `.vlp-*` landing classes.
  - With reduced motion emulated, /dashboard still runs 4 infinite animations:
    - the 420–449px orb and ring opacity pulse (3s);
    - "Awaiting connection…" `breathe` (3s);
    - the STANDBY blink (2s);
    - the framer-motion logo loop (3.2s).
  - /analytics runs 6: 3 loading spinners, a 6px dot, a ring-pulse and the logo. Neither page offers a pause control.
  - The marketing site does respect the preference: 49 infinite animations drop to 4.
  - Verifier confirmed this and lowered it to medium: these are mostly slow opacity pulses, not movement. 2.3.3 was misapplied because it covers animation triggered by interaction.
- **Screenshots:** audit/screenshots/va-a11y-manual/80-reduced-motion-dashboard-a.png, audit/screenshots/va-a11y-manual/81-reduced-motion-dashboard-b.png, audit/screenshots/va-verify-a11y-auto/dashboard-reduced-a.png, audit/screenshots/va-verify-a11y-auto/dashboard-reduced-b.png
- **Recommendation:**
  - Add a global rule: `@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}`.
  - Wrap the app in framer-motion's `<MotionConfig reducedMotion="user">`. Stop JS and WAAPI loops when `matchMedia('(prefers-reduced-motion: reduce)').matches`.
  - Stop idle pulses after 5s even without the preference, since 2.2.2 applies to loops longer than 5s.
  - Add motion tokens of 120, 200 and 320ms.

### F-A11Y-023 — Pointer targets are under 24x24px, and touch targets are far below 44x44
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-AUTO-16, A11Y-MANUAL-23, RESPONSIVE-A-13, RESPONSIVE-B-17
- **Pages:** /dashboard, /meeting-agent, /login, /leads, /analytics, /assistant, /flow-builder, /billing, /personal-agents, wallet banner
- **Evidence:** WCAG 2.2: **2.5.8 Target Size (Minimum) (AA)**. The 44px touch figures fall under 2.5.5 Target Size (Enhanced) (AAA).
  - Under 24px on desktop:
    - Dashboard "Refresh flows": 14x14, 6px from the select.
    - Meeting Agent "Copy URL": 15x15. "2 joinees ▸": 82x16.
    - Login show-password: 16x16. "Forgot your password?", "Back to home" and the sign-up toggle are 16–17px tall.
    - Wallet Dismiss: 22x22.
  - At 390px (targets under 44px / all interactive elements):
    - Leads 77/84. Of these, 26 are under 24px: chips are 25px tall, icon buttons 37x25, the call button 32x32, the checkbox label 20x20.
    - Meeting Agent 27/40, Assistant 12/19, Flow Builder 20/49, Billing 8/18, Dashboard 6/15, Personal Agents 5/13.
    - The Analytics period toggle is 36x24.
  - Destructive controls sit next to routine ones:
    - Meeting Agent "Delete room" (32x32) is directly beside Record.
    - The Leads per-row Call button sits flush against the row's tap area.
  - A11Y-MANUAL-07's verifier found that the Leads checkbox label is 20x20 and likely passes 2.5.8 through spacing.
- **Screenshots:** audit/screenshots/va-a11y-auto/dashboard.png, audit/screenshots/va-a11y-auto/meeting-agent.png, audit/screenshots/va-a11y-auto/login-signedout.png, audit/screenshots/va-responsive-a/meeting-agent_390_rooms.png, audit/screenshots/va-responsive-b/leads_390.png
- **Recommendation:**
  - Give every target a hit area of at least 24x24, using padding or an `::after` hit-slop so the visual size can stay. Start with Refresh flows, Copy URL, show-password, Dismiss and the inline auth links.
  - Under `@media (pointer: coarse)`, set a 44x44 minimum for chips, checkboxes, icon buttons and tabs.
  - Keep destructive controls (Delete room, Delete node, Reset) and the per-row Call button at least 8px from other targets, or move them into an overflow menu with a confirm step.

### F-A11Y-024 — Icon-only buttons: no name at all below 640px on Leads, and many others named only by `title`
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-B-11, A11Y-AUTO-21
- **Pages:** /leads, /call-reports, /meeting-agent, /assistant, sidebar
- **Evidence:** WCAG 2.2: **4.1.2 Name, Role, Value (A)**.
  - At 390px the Leads Refresh and Export buttons are 37x25, with `aria-label` null and `title` null. Their only text is `<span class="hidden sm:inline">`, which is `display:none`, so they have **no accessible name**.
  - Named by `title` only:
    - 24 Leads per-row call buttons ("Call <name> (c)");
    - 50 Call Reports "Download CSV" buttons;
    - Meeting Agent "Copy URL" and "Delete room";
    - Assistant "Attach a file" and "Send";
    - "Sign Out".
  - `title` isn't exposed on touch devices and is announced inconsistently.
- **Screenshots:** audit/screenshots/va-responsive-b/leads_390.png, audit/screenshots/va-a11y-auto/call-reports.png
- **Recommendation:**
  - Replace `hidden sm:inline` with `sr-only sm:not-sr-only`.
  - Give every icon-only button an `aria-label`, and keep `title` only as a tooltip.
  - Per-row names should say which row they act on, for example "Download CSV for call at <time>".

### F-A11Y-025 — Login: autofill blocked, show-password focus invisible, a 16px toggle, and a placeholder that looks like a saved password
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-MANUAL-16, PUBLIC-SITE-13 (autocomplete and toggle part)
- **Pages:** /login (sign-in and sign-up modes)
- **Evidence:** WCAG 2.2: **1.3.5 Identify Input Purpose (AA)**, **3.3.8 Accessible Authentication (Minimum) (AA)**, **2.4.7 Focus Visible (AA)**, **2.5.8 Target Size (Minimum) (AA)**.
  - The email field has no `autocomplete`, and the password has `autocomplete="off"` in both modes. The A11Y-AUTO-01 verifier re-confirmed both. By contrast, /forgot-password labels its field and sets `autocomplete=email`.
  - The show-password control is a `<button aria-label="Show password">` that correctly flips its label and the input type. But it is 16x16, sits inside the input, and has `outline:none; box-shadow:none`, so focus is not visible.
  - The "••••••••" placeholder looks like a saved password.
  - The sign-up toggle is 12px #7a8397 on white (3.8:1) and is a `type="submit"` button inside the form.
  - Errors appear only as native browser bubbles, with no `aria-invalid` and no inline text.
- **Screenshots:** audit/screenshots/va-a11y-manual/30-login.png, audit/screenshots/va-a11y-manual/32-login-showpw-focus.png, audit/screenshots/va-public-site/login_default.png, audit/screenshots/va-verify-public-site/login_signup_mode.png
- **Recommendation:**
  - Use `autocomplete="email"` (or `username`) with `current-password` for sign-in, and `new-password` for sign-up.
  - Make the show-password toggle 32x32 with a visible focus ring and `aria-pressed`.
  - Remove the dotted placeholder.
  - Make the sign-up toggle `type="button"` with at least 4.5:1 text.
  - Show errors inline, linked through `aria-describedby` and `aria-invalid`.

### F-A11Y-026 — Heading and landmark gaps: login has no H1 or landmarks, data pages have only an H1, public pages lack `main`
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** A11Y-AUTO-18, PUBLIC-SITE-18 (landmark and heading part), A11Y-MANUAL-16 (H1 and main part), PUBLIC-SITE-13 (H1 part)
- **Pages:** /login, /leads, /call-reports, /personal-agents, /dashboard, /analytics, /flow-builder, /, /pricing, /security, /docs, /docs/integrations, /changelog, /about, /status, /build.html
- **Evidence:** WCAG 2.2: **1.3.1 Info and Relationships (A)**, **2.4.6 Headings and Labels (AA)**.
  - /login: no H1 ("Welcome Back" and "Create Account" are H2s) and no `main`, `header` or `nav`. axe reports `region` ×10.
  - App pages:
    - Leads, Call Reports and Personal Agents have only the H1, with no headings for the KPI strip, filters or table.
    - Dashboard panel titles (CUSTOMER INTEL, TRANSCRIPT FEED) are styled text, not headings.
    - Analytics has a clean H2 per section, but the signed-in user's own name is an H3.
    - Flow Builder's `header` carries a role that axe disallows (`aria-allowed-role`).
  - Public pages:
    - Home skips from H2 to H4 four times (axe `heading-order`).
    - There is no `main` on pricing, security, docs, docs/integrations, changelog, about, status or build.html, and no `nav` on pricing.
- **Screenshots:** audit/screenshots/va-a11y-auto/login-signedout.png, audit/screenshots/va-a11y-auto/home-signedout-full.png
- **Recommendation:**
  - Login: make the card title an H1 inside `<main>`.
  - App: use an H2 for every panel or section title, and render the user's name as text, not a heading. Remove the disallowed role from Flow Builder's `<header>`.
  - Public site: one shared layout with `<header><nav><main><footer>`, and fix the home heading order.

### F-A11Y-027 — Flow shortcuts dialog and node editor: focus never enters, the dialog is clipped, and Esc misbehaves
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** A11Y-MANUAL-17
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.4.3 Focus Order (A)**, **2.4.11 Focus Not Obscured (Minimum) (AA)**.
  - Shortcuts dialog (`?`):
    - It is a proper `role="dialog" aria-modal="true"` labelled "KEYBOARD SHORTCUTS", but `activeElement` stays `<body>`, and Tab moves to canvas edges behind it.
    - It is rendered inside the canvas container, so at 1440x900 its title is clipped by the toolbar and the rows below about 880px are cut off.
    - Esc closes it, but focus stays on `<body>`.
  - Node editor (opened with the mouse):
    - It is a plain `div` with an H3 "SPEAK NODE", and focus stays on the node.
    - The LABEL and MESSAGE fields are unlabelled.
    - Esc does not close it, although the shortcut sheet says "Close panel / dialog — Esc".
- **Screenshots:** audit/screenshots/va-a11y-manual/45-flow-shortcuts.png, audit/screenshots/va-qa-a/flow_shortcuts_dialog.png, audit/screenshots/va-a11y-manual/46-flow-node-click.png
- **Recommendation:**
  - Portal the shortcuts dialog to `<body>` and centre it with `max-height: 90vh; overflow: auto`.
  - On open, focus the dialog heading or close button and trap focus. On close, return focus to the `?` button or the previously focused node.
  - Wire Esc to close the node editor and return focus to its node. Label the editor fields (F-A11Y-003).

### F-A11Y-028 — The flow canvas tab order follows creation order, and edge names expose internal IDs
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** A11Y-MANUAL-18
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.4.3 Focus Order (A)**, **2.4.6 Headings and Labels (AA)**, **1.1.1 Non-text Content (A)** (minimap).
  - The 26 nodes and 27 edges make 53 sequential tab stops in DOM creation order. The node y-positions jump around: 282 → 354 → 460 → 580 → 531 → 791 → 520 → 757 → 653.
  - Some edge names expose IDs, such as "Edge from node_1785140237056 to node_178…". Others are readable ("Edge from start to greet").
  - The minimap is an `svg role="img"` with no name.
  - React Flow's defaults are kept, which is good: nodes are `role=group` with instructions in `aria-describedby`, and keyboard moves are announced.
- **Screenshots:** audit/screenshots/va-a11y-manual/44-flow-tab-edges.png, audit/screenshots/va-a11y-manual/41-flow-loaded.png
- **Recommendation:**
  - Order nodes in the DOM topologically, or top to bottom. Consider making the canvas a single tab stop with arrow keys that follow connections.
  - Give edges `ariaLabel` built from node labels, for example "Greet & Introduce to Confirm Interest (YES)".
  - Name the minimap ("Flow overview"), or hide it with `aria-hidden`.

### F-A11Y-029 — Marketing home: scroll regions can't be reached by keyboard, and CTA and meta text fall below AA
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** A11Y-AUTO-19
- **Pages:** / (signed out, default dark theme)
- **Evidence:** WCAG 2.2: **2.1.1 Keyboard (A)**, **1.4.3 Contrast (Minimum) (AA)**.
  - axe reports `scrollable-region-focusable` ×2 (serious): the `.cd-trans` transcript demo and `.vds-track`.
  - CTA white on #7c6bf5 is 3.98:1 (fix under F-A11Y-009). Mono meta text #7b8196 on #1a1d26 is 4.35:1.
  - The gradient-clipped headline span ("handle every call.") has transparent text, so its contrast needs a manual check against both gradient ends.
  - Working as it should: the rotating language ticker has `aria-live="off"`, and reduced motion is respected.
- **Screenshots:** audit/screenshots/va-a11y-auto/home-signedout.png, audit/screenshots/va-a11y-auto/home-signedout-full.png
- **Recommendation:**
  - Give each scroll container `tabindex="0"`, `role="region"` and an `aria-label` ("Sample call transcript"), or make them non-scrolling.
  - Set meta text to `#8a90a4` or lighter (5.29:1 on #1a1d26).

### F-A11Y-030 — Naming and structure polish: label-in-name, panel headings, misleading ↗ icons, reversed tab order
- **Severity:** low · **Confidence:** single-agent
- **Source findings:** A11Y-MANUAL-24
- **Pages:** /dashboard, /settings, /personal-agents, /leads (New Lead)
- **Evidence:** WCAG 2.2: **2.5.3 Label in Name (A)**, **1.3.1 Info and Relationships (A)**, **2.4.3 Focus Order (A)**, **2.4.6 Headings and Labels (AA)**.
  - The visible "SAVE CONTEXT" button is named "Save customer context — agent will use this data". The visible phrase is not contained in that name, so a speech command such as "click Save context" can fail.
  - The panel titles CUSTOMER INTEL, TRANSCRIPT FEED and IDENTITY are not headings. The New Lead title is an H3 under the H1.
  - The Settings sub-nav shows ↗ external-link icons on links that open in the same tab.
  - Settings tab order:
    - "Save Changes" comes before the sub-nav;
    - "Connect Google Account" (y=862) is focused before "Connect Microsoft Account" (y=830), the reverse of the visual order.
  - The Personal Agents NEW TASK disclosure has no `aria-expanded` (see F-A11Y-016).
- **Screenshots:** audit/screenshots/va-a11y-manual/53-settings-tab28.png, audit/screenshots/va-a11y-manual/91-personal-agents-newtask.png, audit/screenshots/va-ux-audit/crop_settings_nav_external_icons.png
- **Recommendation:**
  - Start each accessible name with the visible text ("Save context: agent will use this data"), or drop the `aria-label`.
  - Use H2 for panel titles, and H2 for dialog titles inside a dialog.
  - Remove ↗ icons from same-tab links.
  - Order the DOM to match the visual order.

---
