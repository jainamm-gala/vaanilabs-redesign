
### F-UX-033 — Knowledge lists storage keys with no indexing status, gives Embed and Delete equal weight, and repeats Upload as "CSV Data"
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-19, UX-AUDIT-23, QA-B-26, VISUAL-AUDIT-14
- **Pages:** /knowledge, /settings (Profile › WhatsApp brochure)
- **Evidence:**
  - File names are storage keys with 13-digit epoch prefixes ("1788515896795-pasted-text-1788515896518.txt", "1789987752864-…pdf").
  - Every row has an "Embed" button (teal outline) and a "Delete" button (grey) of the same size. Nothing shows whether a file is embedded, how many chunks it has, or whether embedding failed.
  - The "CSV Data" mode shows the same native "Choose file / No file chosen" input and "Upload & Embed" button as "Upload Files", with no CSV guidance.
    - The four mode buttons are not ARIA tabs.
    - The same unstyled native file input appears for the WhatsApp brochure in Settings.
  - Two of the three KPI cards hold static copy ("SUPPORTED DOCS …", "AI INTEGRATION Embeddings → RAG-powered voice agent").
  - Dates here read "21/09/2026, 16:19:12", while other pages use "21 Sept, 22:44". The app uses four date formats in total (see F-VIS-024).
- **Screenshots:** va-explore-data/r2_knowledge_top.png, va-explore-data/r2_knowledge_tab_csv.png, va-ux-audit/48_knowledge.png, va-verify-ux-audit/22_knowledge.png, va-qa-b/knowledge-1.png, va-visual-audit/knowledge.png
- **Recommendation:**
  - Show the original file name, editable, with a type icon.
  - Add a Status column: "Indexed · 42 chunks", "Processing" or "Failed · Retry". Offer "Re-index" only when it is needed, and add "Used by <flow>".
  - Move Delete into a row overflow menu, behind a confirmation.
  - Replace the native input with a styled drop zone that lists the accepted types and the size limit.
  - Merge CSV into Upload, with CSV-specific guidance or a column picker, and make the modes ARIA tabs.
  - Replace the static cards with real stats (files, chunks, last indexed), and format dates with one shared formatter.

### F-UX-034 — "Review proposals" is shown to members, then silently redirects to the live-call Cockpit
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** QA-B-09
- **Pages:** /knowledge → /knowledge/proposals → /dashboard
- **Evidence:**
  - "Review proposals" in the Knowledge header links to `/knowledge/proposals`. Clicking it, or loading the URL directly, lands on `/dashboard` (AGENT COCKPIT, with the live CONNECT and Test Call controls) with no message.
  - `/api/knowledge/proposals` returns 403 "Organization admin access required". The account's role is "member".
  - Explore-data saw the same redirect independently. `/admin` also redirects to /dashboard on the client.
- **Screenshots:** va-qa-b/knowledge-proposals-click.png, va-explore-data/r2_knowledge_proposals_click.png
- **Recommendation:**
  - Hide the entry for non-admins, or show it disabled with "Admins only · Request access".
  - For role-gated routes, render a 403 page inside the app shell that names the required role and the org admin. Don't redirect to a page with live-call controls.
  - For admins, show a count badge, e.g. "3 proposals".

### F-UX-035 — Destructive actions sit beside everyday actions with equal or greater prominence
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** UX-AUDIT-26
- **Pages:** /leads, /knowledge, /meeting-agent, /flow-builder, /settings, global rail
- **Evidence:**
  - Instances found:
    - A full-width DELETE LEAD button directly under Call Now / WA (F-UX-032).
    - Delete next to Embed, at the same size, on every Knowledge row (F-UX-033).
    - An icon-only red square, labelled only by its "Delete room" title, in the same row and at the same size as the Agent / Intel / Record toggles (F-UX-038).
    - "Reset to default" one row below "New flow" in the Flow Builder "…" menu (F-UX-005).
    - Delete Account as a regular item in the Settings list, and in the phone sub-nav strip.
    - An unlabelled sign-out icon directly above the theme toggle (F-UX-029).
  - Explore-core, explore-data and explore-settings each reported some of these.
  - Delete Account is the good counter-example: it requires the email to be typed, keeps its button disabled until it matches, and has a 7-day grace period.
- **Screenshots:** va-ux-audit/34_lead_panel_actions.png, va-ux-audit/24b_flow_more_actions.png, va-ux-audit/crop_meeting_active_room.png, va-ux-audit/48_knowledge.png, va-explore-settings/c13_delete_account.png
- **Recommendation:**
  - Use one `DangerAction` pattern:
    - Destructive actions live in overflow menus or a separate "Danger zone".
    - They always have a text label, such as "Delete room" or "End room".
    - They never sit next to the primary action.
  - Scale confirmation to risk:
    - an undo toast for reversible deletes (a lead, a knowledge file)
    - a confirmation dialog that names the object, for rooms
    - typed confirmation for flows and the account, as the Delete Account page already does
  - In menus, set danger items apart with a divider and red text.

### F-UX-036 — Analytics: the range toggle's scope is unclear, and Intents shows a raw LLM error and a stale cache
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-DATA-10, QA-B-11, UX-AUDIT-27
- **Pages:** /analytics §02–§05
- **Evidence:**
  - The 7D / 30D / 90D control sits inside the §03 Sentiment card, but it also changes §05 Intents: 7D shows "21 CALLS ANALYSED" and 30D shows "97". It does not change §04 Flow (38 calls in every range) or §02 Headline. The §02 tagline says "this past week", yet TOTAL CALLS is a lifetime count.
  - With 90D selected, Intents shows "Intent analysis unavailable — Intent clustering temporarily unavailable (LLM call failed)." The API returns `clusters: []` with that warning.
  - With 30D selected, it reads "last computed 21 Sept, 16:31, next 21 Sept, 17:01" on 26 Sept. `next_refresh_at` is 5 days in the past and no stale warning appears. Two agents saw this.
  - While loading, Intents shows "WINDOW 30D · 0 CALLS ANALYSED".
  - The range isn't kept in the URL and resets to 30D on reload.
- **Screenshots:** va-explore-data/analytics_sentiment_7d.png, va-explore-data/analytics_s1600.png, va-qa-b/analytics-s3.png, va-ux-audit/crop_analytics_intents_stale.png
- **Recommendation:**
  - Put one range picker in the page header and keep it in the URL (`?range=30d`). Label each section's scope ("Last 30 days" or "All time"). Alternatively, give each section its own labelled control.
  - Replace the raw error with plain copy and the last good result: "Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. Retry."
  - Fix the scheduler so stale windows are recomputed. When data is older than its refresh interval, show a "Stale · Recompute" chip.
  - Show skeletons instead of 0 while loading.

### F-UX-037 — Meeting Agent form: the pre-filled title creates identical meetings, an empty title is accepted, and Presentation mode mentions attaching a deck but has no way to attach one
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-25, UX-AUDIT-16, QA-A-14
- **Pages:** /meeting-agent (Create Meeting Room)
- **Evidence:**
  - Meeting Title is pre-filled with "Product Demo with Vikash", the same text as its placeholder. 3 of the 5 past meetings have exactly that name, so they can't be told apart.
  - Clearing the title, or leaving only spaces, keeps Create Room enabled. The PPT prompt trims whitespace; the title does not.
  - The Presentation mode hint says the agent can show "an attached one", but that mode has no attach or deck control. Generate PPT is a separate section at the bottom of the page and says it is "independent of meetings".
  - "Encrypted meeting" is the default, but nothing says who receives the private key or how.
  - "Conversation Flow: Active flow (from profile)" doesn't name the flow, and the list repeats duplicate names without suffixes (F-UX-005).
  - The same placeholder-as-value pattern appears elsewhere. Flow Builder's default node title "New Speak Node" already appears twice in the production flow, and the Cockpit pre-fills Customer Intel (F-UX-003).
- **Screenshots:** va-ux-audit/42_meeting_agent.png, va-ux-audit/43_meeting_presentation_mode.png, va-verify-ux-audit/20_meeting_presentation_mode.png, va-explore-core/meeting_agent_presentation_mode.png, va-qa-a/meeting_initial.png
- **Recommendation:**
  - Leave the title empty with a real placeholder, or default to a unique value such as "Meeting · 26 Sep, 16:40". Require a non-blank title and warn on duplicate names.
  - In Presentation mode, show "Attach deck (PPTX/PDF)" and "Generate from a prompt" inline, and move Generate PPT into that mode.
  - After an encrypted room is created, add a "Share the key" step with "Copy key" and "Copy invite text".
  - Name the flow in use: "Uses: <flow> · Change".

### F-UX-038 — Meeting Agent rooms: listed by ID, an 82-hour "live" room not flagged, an icon-only Delete room among the toggles, and no meeting outputs
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** UX-AUDIT-21, VISUAL-AUDIT-12
- **Pages:** /meeting-agent (Active rooms, Agent operations, Past meetings)
- **Evidence:**
  - The active room is listed by its 22-character room ID, not its title. The same room also appears under Past Meetings, by title.
  - AGENT OPERATIONS shows a room "live" for 82h 42m (agents recorded 82h 31m–82h 49m) with "STALE 0". The meeting quota shows only 60 s used this month. "Slots" and "Stale" are not explained.
  - "1 participant" and "2 joinees" appear in the same card.
  - The red square icon button is labelled only by its title, "Delete room". It sits where a stop control would, at the same size as the Agent / Intel / Record toggles, which don't show their on/off state in text.
  - Past meetings show only a URL, Copy URL and a joinee count. There is no summary, recording or action items, although the persona card promises "Meeting intelligence" and "Action item capture".
- **Screenshots:** va-ux-audit/crop_meeting_active_room.png, va-ux-audit/44_meeting_env_var_leak.png, va-explore-core/crop_ma_ops.png, va-explore-core/meeting_agent_joinees.png, va-verify-ux-audit/19_meeting_agent.png, va-visual-audit/meeting-agent_full.png
- **Recommendation:**
  - List rooms by title, creation time, host and minutes used. Move the room ID under "Details".
  - Auto-end rooms that are idle or have no agent after N minutes. Flag long-running rooms ("Live 82 h · 0 agents · End room?") and mark them stale.
  - Keep the Active and Past lists separate, with no room in both.
  - Replace the red square with a labelled "End room" in an overflow menu, behind a confirmation. Make Agent / Intel / Record a toggle group with "On"/"Off" text and `aria-pressed`.
  - Add Summary, Recording and Action items to past meetings, or remove those promises from the persona card.

### F-UX-039 — Personal Agents hides its blocking "no number" prerequisite, starts tasks with an empty goal, and its example cards look like disabled buttons
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-14, UX-AUDIT-25, QA-A-14, RESPONSIVE-A-18
- **Pages:** /personal-agents, /settings/personal-agent
- **Evidence:**
  - **Hidden prerequisites:** the page promises the agent "works persistently on its assigned number". Only `/settings/personal-agent` says "No number assigned yet. Provisioning is admin-assigned — contact your administrator". The ₹0 wallet and the unverified calling number aren't shown on the task page either.
  - **Inline panel:** "+ NEW TASK" opens an inline panel, not a modal.
    - Focus stays on the trigger button.
    - Esc doesn't close the panel, and CANCEL keeps the draft.
    - "No tasks yet…" stays visible under the open form.
  - **Task form:**
    - START TASK is enabled with an empty goal.
    - The GOAL textarea has no programmatic label. Its visual label is 10 px with 2.5 px letter-spacing, at 3.8:1.
    - The form has no fields for contacts, a number, a deadline, a schedule, or a spend or call cap.
  - **Example cards:** the three use-case cards ("Outbound follow-ups", "Multi-step errands", "Standing jobs") are plain DIVs (`cursor:auto`) on grey `#C3C5C8`, with descriptions at 2.20:1. They look like disabled buttons and do nothing when clicked.
  - **Copy:**
    - "hand a goalinstead of a script" is missing a space next to a JSX `<span>`.
    - "Tasks survive restarts — state lives in the task row" is implementation detail.
- **Screenshots:** va-explore-core/personal_agents.png, va-explore-core/personal_agents_new_task.png, va-explore-core/settings_personal_agent.png, va-ux-audit/crop_personal_agents_cards.png, va-qa-a/pa_new_task_open.png
- **Recommendation:**
  - Add a prerequisites strip above the task list: "Number: not assigned · Request from admin", "Contact: WhatsApp ✓", "Wallet: ₹0 · Top up". While any blocker remains, disable START TASK and show the reason.
  - Open New task as a dialog.
    - Move focus to Goal. Esc or Cancel asks "Discard draft?".
    - Label the fields and require a goal.
    - Add optional contacts, a deadline, and spend and call caps.
  - Turn the cards into "Start from template" buttons that pre-fill the goal, and use the standard white card surface.
  - Fix "goal instead" with `{' '}`. Rewrite "state lives in the task row" as "Tasks keep running if the app restarts".

### F-UX-040 — The Personal Agent capability list (Homework Analysis, Stock Research, Stock Trade) blurs the B2B voice positioning
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** EXPLORE-CORE-15, UX-AUDIT-25
- **Pages:** /personal-agents (New task › Capability hint), /settings/personal-agent (Capability autonomy)
- **Evidence:**
  - The capability hint has 14 options. They mix business items (Appointment / Scheduling, Knowledge Base Lookup, Document Draft, Video Meeting) with consumer ones ("Homework Analysis", "Stock Research").
  - Settings lists "Stock Trade (live) — LOCKED … coming soon. Pinned at Confirm + 2FA".
  - The page's own examples are sales and operations tasks ("chase these five overdue invoices"). The product is positioned as phone voice agents for Indian SMB teams.
  - A strength to keep: the Auto / Confirm / Confirm + 2FA setting per capability is a good guardrail pattern, and F-UX-022 reuses it.
- **Screenshots:** va-explore-core/personal_agents_new_task.png, va-explore-core/settings_personal_agent.png, va-ux-audit/46_personal_agents_new_task.png
- **Recommendation:**
  - Decide who the audience is. For the B2B product, put the consumer and trading capabilities behind a feature flag, and don't advertise "coming soon" trading in a sales tool.
  - Group the remaining capabilities by job (Sales follow-up, Scheduling, Research, Documents, Meetings), each with a one-line description.
