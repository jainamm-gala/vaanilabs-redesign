## 12. First run

### 12.1 From "Get started" to the first customer call

| # | Step | Surface | Owner | What changes (finding) |
|---|---|---|---|---|
| 1 | "Get started" / "Start free" on the site | marketing | public-site spec | Every CTA points at `/signup`, which renders "Create account" with its own H1 (F-QA-010) |
| 2 | Create account | `/signup` (bare) | auth spec | Separate from `/login`; `next` and UTM parameters survive OAuth |
| 3 | **Create your workspace** | `/signup/workspace` (bare) | this spec (§12.2) | The organization and team exist from the first minute, with you as Admin, so invites and integrations never dead-end (F-UX-001) |
| 4 | Pending approval, only if access stays approval-gated | `/signup/pending` (bare) | this spec (§12.2) | A real waiting state instead of an unexplained one (funnel stage 5) |
| 5 | Land on **Home** | `/home` | this spec (§13) | Replaces the `/onboarding` wizard that said "You're live" at ₹0 and was never linked again (F-UX-006, F-RWD-019) |
| 6 | Five checks, in any order | Home, Knowledge, Flows, Phone setup, Top-up sheet, Call gate, Leads | page specs; the track here | Each step deep-links to where it is done; blocked steps say what is missing |
| 7 | First customer call | Leads → Call gate | Leads spec | "Live" appears only now |

**No product tour, no coach marks, no confetti.** The setup track is the orientation, and the grouped, labelled sidebar explains the rest (P7; overlay §17).

### 12.2 Create your workspace (and pending approval)

```
┌──────────────── 400 (bare shell) ────────────────┐
│ [V]                                               │
│ Create your workspace                    title-24 │
│ Teammates, numbers and billing live here.         │
│                                                   │
│ Workspace name                                    │
│ [ Sample Realty                               ]   │
│ Workspace address                                 │
│ [ sample-realty          ].vaanilabs.in           │
│ ✓ Available · you can change it twice later       │
│ What should your agent do first? (optional)       │
│ ( ) Qualify new leads     ( ) Remind customers    │
│ ( ) Answer inbound calls  ( ) Something else      │
│                                                   │
│ [            Create workspace            ]        │
│ You'll be the admin. You can invite teammates     │
│ from Home or Settings.                            │
└───────────────────────────────────────────────────┘
```

- Fields: `Field` + `TextInput` (name, required, 2–60 characters); address with a live availability check after 300 ms ("✓ Available" / "Taken. Try sample-realty-2"), prefilled from the name; the goal as `RadioCard`s, used only to pre-select a template on Home. Primary `Button` size lg.
- Errors: "Enter a workspace name." · "Use letters, numbers and hyphens." · "Couldn't create the workspace. Your details are kept. Retry".
- **Pending approval** (only if the business keeps approval-gated access; part 6 open question): V mark, title-24 "We're reviewing your request", body "We'll email you at the address you signed up with. Most requests are reviewed within one working day." (only if that is the real SLA), links "Talk to us" and "Sign out". No app shell until approved.

### 12.3 Invited teammates

Accepting an invite (auth spec) sets name and password, then goes to the landing route (§2.5): Home while the workspace's setup is incomplete, else Cockpit. Setup is **per workspace**, not per person: teammates see the same track and card, with admin-only steps marked (§13.4).

---

## 13. Home: "Get your first call live"

**Job:** get this workspace from signed-up to its first customer call with no dead ends and no false "live" (F-UX-001, F-UX-006; direction §6.1, §6.6). It is the page variant of the gate (`SetupTrack`, `spec/02-components-gate.md` §5.3): a checklist computed on the server, one action per step. This section configures its steps and copy.

### 13.1 Hierarchy

1. The **current step** row: accent-soft fill, current mark, its one primary button.
2. The display heading "Get your first call live" and the progress "2 of 5 done".
3. Done rows (a check and one line of proof) and later rows (quiet).
4. The aside (workspace, teammates, help) and the optional knowledge row.

### 13.2 Layout

**Desktop ≥1280** (container `--size-container-page`; main column 720, aside 320, gap `--space-40`)

```
┌ Sidebar ─────────┬ Home   2 of 5 done                                        Invite teammates… ┐
│ Operate          ├───────────────────────────────────────────────────────────────────────────────┤
│  ▣ Home          │  Get your first call live                          ┌ Your workspace ───────┐ │
│    Cockpit       │  Callers hear your agent only after every          │ Sample Realty · Admin │ │
│    …             │  required check passes. Do them in any order.      │ Teammates  1          │ │
│ (no setup card   │  ▬▬▬▬▬▬▬▬▬▬▭▭▭▭▭▭▭▭▭▭▭▭  2 of 5 done                 │ Invite teammates…     │ │
│  on this page)   │ ┌───────────────────────────────────────────────┐  │ Help                  │ │
│                  │ │ ✓ Teach your agent  Optional                  │  │ Setup guide ↗         │ │
│                  │ │   Indexed · 2 files · 84 passages      Change │  │ Talk to us ↗          │ │
│                  │ │ ✓ Publish a flow                              │  └───────────────────────┘ │
│                  │ │   Site-visit qualifier v1 is published   Open │                            │
│                  │ │ ✓ Verify your calling number                  │                            │
│                  │ │   +91 80 •••• 2210 · Verified            Open │                            │
│                  │ │▌◉ Add money                    (accent-soft)  │                            │
│                  │ │   Calls are prepaid from your wallet. ₹500    │                            │
│                  │ │   covers about 3 h 28 min at your rate.       │                            │
│                  │ │   [Top up…]                                   │                            │
│                  │ │ ⊘ Call yourself                               │                            │
│                  │ │   Needs money in the wallet.                  │                            │
│                  │ │ ○ Add people to call                          │                            │
│                  │ │   Import leads or connect inbound calls.      │                            │
│                  │ │   [Import leads…]  Connect inbound            │                            │
│                  │ └───────────────────────────────────────────────┘                            │
│ (AR) Anika R.    ├───────────────────────────────────────────────────────────────────────────────┤
└──────────────────┴ Live v1 · Site-visit qualifier │ Inbound · Ready │ ⚠ Wallet ₹0 · calls paused · Top up ┘
```

**Laptop-S 1024–1279:** one 720 column; the aside becomes a row of three KeyValue items under the track. **Tablet:** one column at full width minus 24 px margins; the H1 is in the TopBar; action buttons keep their labels. **Phone:**

```
┌ Home                    [₹0 · Top up] ⌕ ┐
│ Get your first call live      (32/40)   │
│ Do these in any order.                   │
│ ▬▬▬▬▬▭▭▭▭▭  2 of 5 done                  │
│ ✓ Teach your agent · Optional            │
│ ✓ Publish a flow                         │
│ ✓ Verify your calling number             │
│▌◉ Add money                              │
│   Calls are prepaid from your wallet.    │
│   [          Top up…           ] 44 px   │
│ ⊘ Call yourself                          │
│   Needs money in the wallet.             │
│ ○ Add people to call                     │
│   [       Import leads…        ]         │
├──────────────────────────────────────────┤
│ Cockpit  Leads  Call reports  Flows  More│  (More is current)
└──────────────────────────────────────────┘
```

On phones done rows collapse to their title (tap to expand), and every action button is full width at 44 px.

### 13.3 The steps

The count ("n of 5") includes only the five required steps. The **current** step is the first required step, in order, that is neither done nor waiting on someone else; it is the only one with a primary button. Other open steps show secondary buttons.

| # | Row | Why (body) | Action | Done when (server) | Done line |
|---|---|---|---|---|---|
| – | **Teach your agent** · `Tag` "Optional" | Upload a price sheet, brochure or FAQ so the agent can quote it on calls. Skip this if your calls don't need facts. | Upload files (secondary) → `/knowledge?upload=1` | at least one file indexed | Indexed · 2 files · 84 passages |
| 1 | **Publish a flow** | Pick a template and adjust it. Callers hear it only after you publish. | Choose a template… → `/flows/new` (pre-selected from the workspace goal, among templates whose needs this workspace meets; Flow Designer part 2 §15.3) | a flow has a Live revision (interim I1: a publish recorded through the Publish gate) | Site-visit qualifier v1 is published (never "live" before all five pass, §5.5) |
| 2 | **Verify your calling number** | Customers see this number when you call, and inbound calls reach your agent through it. | Verify number… → `/settings/phone` | the number completed Owned → Compliance → Authorized | +91 80 •••• 2210 · Verified |
| 3 | **Add money** | Calls are prepaid from your wallet. ₹500 covers about 3 h 28 min at your rate. | Top up… (Top-up sheet in place) | a confirmed top-up and a balance above one minimum call | ₹500 added · about 3 h 28 min of calls |
| 4 | **Call yourself** | Hear the flow on your own phone before customers do. About 2 minutes, about ₹5. | Call my number… (the **Call gate** aimed at your verified mobile) · link "Talk in browser instead" | a call on the live flow to your own number was answered | Connected · 1 min 52 s · Today 11:02 am · Listen |
| 5 | **Add people to call** | Import a list of leads, or send inbound calls on your number to this flow. | Import leads… · Connect inbound → `/settings/phone#inbound` | at least one lead, or the inbound number routed to a live flow | 24 leads imported / Inbound calls answer with Site-visit qualifier |

The "about" numbers come from the real rate and median call length; until those exist, the body says "Rate ₹0.04/s" instead (direction §8). "Talk in browser instead" carries the note "This doesn't test your phone line, so it doesn't complete this step."

### 13.4 Row states

The track is `SetupTrack` (`spec/02-components-gate.md` §5.3): each step's kind, its 20 px mark, the row treatment, the hidden state word and the "current step" rule are specified there. Home's copy for each state:

| State (G §5.3) | Copy examples |
|---|---|
| To do | as in 13.3 |
| Current | as in 13.3, with its one primary button |
| In progress | "Indexing 1 file… 60%" · "Step 2 of 3 · documents under review" · "Payment pending · updates when UPI confirms" · "Calling +91 98 •••• 1234… · Open in Cockpit" |
| Blocked by another step | "Needs money in the wallet." · "Needs a live flow and a verified number." |
| Needs an admin | "Only admins can verify numbers. Ask an admin (2 in this workspace)." + "Copy request link" |
| Failed | "Didn't connect · No answer · Try again" · "Documents weren't accepted · See why" · "Couldn't index price-sheet.pdf · Retry" |
| Done | as in 13.3 |

A step waiting on someone else (documents under review, payment pending) is not current; the current mark moves to the next actionable step, so the user always has something to do.

### 13.5 Completion

- When the fifth check passes, the progress header is replaced by: title-24 **"Your workspace is live."**, body "Callers on +91 80 •••• 2210 hear Site-visit qualifier v1.", primary **Call your first leads…** (Leads, New view, then the Call gate) and secondary "Go to Cockpit". A success toast says "Setup complete. Your workspace is live." This is the first and only place the product says "live" about the workspace (F-UX-006).
- The server sets `setup.completedAt` only now. On the next route change Home leaves the nav, the setup card disappears and the landing route becomes Cockpit.
- **After completion** `/home` stays reachable from Help › Setup checklist and ⌘K. It shows the five checks with their **current** state; a regression (the number lost verification) shows amber there, while the Baseline and notices carry it everywhere else. Setup never reopens.

### 13.6 Page states

| State | Treatment |
|---|---|
| Loading | Header renders; the track shows six skeleton rows (mark block, a 30% title bar and a 60% body bar); no step is shown as done or current until the server answers |
| Setup state failed | `SectionError`: "Couldn't load your setup. Retry". Nothing is shown as done |
| Offline | Last known states with "as of 11:42 am"; actions `aria-disabled` with "You're offline" |
| Member | Admin-only steps use the "needs an admin" state; everything else works (knowledge, flows, leads, call yourself) |
| Partial | Normal: any mix of the states above |

### 13.7 Microcopy

| Before (today) | After |
|---|---|
| "§ STEP 5 OF 5" · "You're *live.*" · "FIRST RUN COMPLETE" | "2 of 5 done" · "Get your first call live"; "Your workspace is live." only after all five pass |
| PROFILE · SUBDOMAIN · FLOW · TEST CALL · DONE | Teach your agent (optional) · Publish a flow · Verify your calling number · Add money · Call yourself · Add people to call |
| "Below are the three doors you'll open most." | removed; the sidebar is labelled |
| "Go to dashboard" | "Go to Cockpit" |

### 13.8 Accessibility

The track is an `<ol>` with `aria-label="Setup steps, 2 of 5 done"`; each row is an `<li>` whose state is in words ("Done", "Current step", "Blocked: needs money in the wallet"), never only a mark. The progress is a `progressbar` with `aria-valuetext="2 of 5 done"`. When a step completes while the page is open, the polite region announces it once ("Add money: done. 3 of 5.").

### 13.9 Analytics

`setup_viewed {doneCount}` · `setup_step_started {step, source: home | card | palette | baseline}` · `setup_step_completed {step, msSinceSignup}` · `setup_blocked_viewed {step, missing[]}` · `setup_completed {msSinceSignup}` · `first_customer_call {msSinceSetupCompleted}` · `workspace_created {goal}`. No lead data, numbers or names in any payload.

### 13.10 Acceptance criteria: first run and Home

- [ ] A new sign-up reaches an enabled Invite teammates action and an enabled Connect button on Integrations without contacting anyone (F-UX-001).
- [ ] The strings "You're live" and "Your workspace is live" never render unless the server reports all five checks passed; `completedAt` is null until then (F-UX-006).
- [ ] Every step's action lands on a page where that step can be finished; no step links to Profile or to a page that lacks the control.
- [ ] Home has exactly one filled Neel button, on the current step.
- [ ] Reload and a second browser show identical step states (server-computed, not local).
- [ ] The setup card appears in the sidebar (≥1280), the rail overlay (1024–1279), the NavSheet (tablet) and the MoreSheet (phone) while setup is incomplete, and nowhere after it completes.
- [ ] "Call yourself" goes through the Call gate; no call request fires before the gate is confirmed.
- [ ] `/onboarding` redirects to `/home`; no page scrolls sideways at 1440 (F-RWD-019).

---

## 14. SetupCard (sidebar, rail overlay, NavSheet, MoreSheet)

`SetupCard` from data-nav §1.2, configured as follows.

| Situation | Content |
|---|---|
| Normal | "Finish setup" · "2 of 5" · progress bar · "Next: add money" |
| Next step waiting on someone else | "Next: call yourself" (the current step moves on; §13.4) |
| Member with only admin steps left | "Finish setup" · "3 of 5" · "Waiting on an admin" |
| Short viewport (≤800 tall, fine pointer) | one 32 px row: "Finish setup · 2 of 5" + a 40 px bar (44 px on a coarse pointer, data-nav §1.2) |
| On `/home` | hidden (the page is the card) |
| Setup complete | removed everywhere |

The whole card is one link to `/home` with the name "Finish setup, 2 of 5 done. Next: add money". In the 1024–1279 rail, an 8 px `--accent-mark` dot sits on the expand button while setup is incomplete. The card cannot be dismissed: it states a fact, and it disappears when the fact changes.
