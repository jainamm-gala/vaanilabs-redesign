# 03-pages · 02 · Assistant

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** assistant (`/assistant`, `/assistant/c/{chatId}`)
**Follows:** `spec/00-design-direction.md` (Sutradhar, especially P1, P3, §4 and the Assistant row of §6.6), `spec/01-foundations.md` + `spec/tokens/tokens.css`, and the component specs `spec/02-components-core.md` (*core*), `spec/02-components-data-nav.md` (*data-nav*) and `spec/02-components-overlay-feedback.md` (*overlay*). Components are named as those specs name them. Anything they do not cover is listed in §19 "New components needed".
**Evidence:** finding ids (F-UX-…, F-A11Y-…, F-RWD-…, F-VIS-…, F-QA-…, F-FLOW-…) refer to `audit/consolidated/`. Raw ids (EXPLORE-CORE-16, QA-A-05, QA-A-16, RESPONSIVE-A-11, UX-AUDIT-29) refer to `audit/raw/`.
**Privacy:** every name, number, flow and workspace in this spec and its mock is fictional ("Lead 1042 · Pune", "EMI reminder"). No customer or lead data from the audit appears here.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/02-assistant.md`, assembled from `02-assistant.part1.md` to `.part7.md` (edit the parts, then re-assemble) |
| Reference mock (one responsive page; states switched by URL hash: `#plan`, `#empty`, `#dictating`) | `spec/03-pages/02-assistant.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `02-assistant-desktop.png` (1440, light, plan waiting) · `-desktop-dark.png` · `-empty.png` (1440, first use) · `-laptop.png` (1024) · `-tablet.png` (768) · `-mobile.png` (390, plan waiting) · `-mobile-dictating.png` (390) |

**Contents.** Part 1: §0 what changes, §1 purpose, §2 findings, §3 page principles, §4 hierarchy. Part 2: §5 layout and wireframes per breakpoint. Part 3: §6 components, §7 the conversation, §8 the composer. Part 4: §9 plans, §10 confirming consequential actions. Part 5: §11 voice input, §12 history, §13 states with copy. Part 6: §14 keyboard and interactions, §15 microcopy, §16 accessibility, §17 responsive summary, §18 telemetry. Part 7: §19 new components, §20 backend dependencies, §21 acceptance criteria, §22 open questions.

---

## 0. What changes, in one screen

Today `/assistant` is the calmest page in the app and the audit says to keep its template (00-summary §4). It is also the one place where a single click can ask the system to build **and activate** a live call flow, with no approval, cost or recipient step (F-UX-022, QA-A-05). The redesign keeps the calm and adds the guardrails.

| Today | Redesign |
|---|---|
| A suggestion chip sends "Build a sales call flow and activate it" on one click | Suggestions **insert** text into the composer; nothing is sent, run or dialled from a suggestion (§7.6) |
| "Plan & Actions" narrates work as it happens, with no pause | **Plan first.** Steps are listed before they run; steps that change records wait on an **ApprovalCard**; calls go through the **Call gate** and publishing through the **Publish gate**, exactly as everywhere else (§9, §10) |
| No autonomy setting | Three workspace modes, **Suggest only / Ask before changes (default) / Undoable changes on its own**, in the Auto / Confirm vocabulary of Personal agents (§10.2). No mode can skip a gate |
| History lives in one browser's `localStorage` | Server-side chats per user, a **History** list with search, deep links `/assistant/c/{id}`, and a one-time "Save to account" for old local chats (§12) |
| Failed send clears the text, shows grey 3.5:1 text, no Retry (QA-A-16) | The message stays in the thread as **Not sent** with **Retry** and **Edit**, announced (§13) |
| Blue user bubble with black text at 3.83:1 (F-A11Y-009) | No bubbles. Turns are blocks: yours on `--surface-2`, the Assistant's on `--surface`, each with a speaker line (§7.1) |
| "Voice" connects a live session on click, no explainer | **Dictate** in the composer: speech becomes editable text; nothing is sent until you press Send. First use explains the microphone (§11) |
| Phones leave 241–345 px for the conversation (F-RWD-015) | The wallet banner and the always-open plan card are gone; a 44 px **PlanBar** opens the plan; the thread gets about 520–580 px at 360–390 wide (§5.6) |
| Sparkles icon, em-dash subtitle, system font (F-VIS-008, F-UX-043) | Hanken Grotesk everywhere, no sparkles or glows, sentence-case copy with no em-dash separators |

---

## 1. Purpose and job to be done

**Primary job.** "When I need something done across my Vaani workspace (understand what happened on calls, prepare a list of leads, draft a call flow, set up a round of calls), I want to say it in my own words, typed or spoken, in English, Hindi or Hinglish, and **see exactly what will happen before anything changes**, so I get it done faster without a wrong call being dialled, a wrong flow going live or a wrong bulk edit."

**Secondary jobs.**
1. Ask a question about my data and get an answer I can check: every number links to the calls, leads or passages it came from.
2. Turn a document (a product sheet, an SOP, a script) into a **draft** flow I can open in Flows.
3. Come back to an earlier chat, see what it changed, and undo what can be undone.

**Not this page's job.** Placing or watching calls (Cockpit), editing a flow on the canvas (Flows), bulk editing a table by hand (Leads). The Assistant hands off to those pages with the object already selected. It is never a second, weaker path to the same actions: it uses the same gates, drafts and permissions (principle A2).

**Who.** Sales, support and ops operators and team leads in Indian SMB and enterprise workspaces, on office laptops (1366×768 is common, F-UX-007) and phones between calls. Mixed Hindi and English is normal.

**Signals that the redesign works** (see §18): approvals are decided in under a minute; gate abandonment after "Review and call…" is low and explained by a blocking check, not confusion; Undo rate on Assistant changes stays under 5 %; zero calls or publishes happen without a gate event.

---

## 2. Findings addressed

| Finding | Sev. | Today on this page | What changes here |
|---|---|---|---|
| F-UX-022 (QA-A-05, EXPLORE-CORE-16, UX-AUDIT-29) | medium, raise to high if the server acts without a confirmation turn | Chips send on click; "…and activate it"; no approval, cost or recipients; history in one browser; unlabelled composer; failures lose text | §7.6 insert-only suggestions · §9–§10 plan, ApprovalCard, gates, autonomy modes · §12 server history · §8 labelled composer · §13 failure states |
| F-UX-013, F-A11Y-004 | high | "Place a call" is an advertised capability with no pre-flight | Call steps open the **Call gate**; no mode, key or voice command skips it (§10.4) |
| F-FLOW-001, F-FLOW-031, F-FLOW-004, F-FLOW-014 | critical / high | "Build & activate" writes a flow and makes it live | The Assistant writes only to **drafts**; edits to an existing flow arrive as a diff with Apply to draft · Discard; going live is **Publish** through the Publish gate with validation and "where it goes live" (§10.5) |
| F-RWD-015 (RESPONSIVE-A-11) | medium | 241–345 px chat area on phones; chips and placeholder clipped; subtitle truncated | Phone layout in §5.6: no wallet banner, header row scrolls away, PlanBar instead of the card, placeholder is a short example |
| F-A11Y-009 | high | User bubble black on `#2F5FE0` (3.83:1) | No coloured bubbles; text tokens only (§7.1) |
| F-A11Y-008 | high | Intro and error text in `#7A8397` (3.36–3.52:1) | `--text-2` / `--text-3` (≥ 4.70:1 on every plane) |
| F-A11Y-003, F-A11Y-020 | high | Textarea named only by its placeholder; file input unlabelled | Composer label "Message the Assistant" (visually hidden, `<label for>`); Attach is a named IconButton over a labelled file input (§8) |
| F-A11Y-024, F-A11Y-017 | medium | Attach and Send named by `title` only; Voice has no `aria-pressed` | IconButtons with `aria-label` + Tooltip; Dictate is a toggle with `aria-pressed` (§8, §11) |
| F-A11Y-014, F-A11Y-013 | medium | Replies and errors are silent; document title never changes | `role="feed"` thread, completion-only announcements, `<title>` per chat (§16) |
| F-A11Y-026 (axe `landmark-unique`) | medium | Duplicate unnamed `nav` landmarks | One rendered `nav` from the shell; the plan is a labelled `aside`, the composer a labelled `form` (§16) |
| F-A11Y-023 | medium | 32 px header buttons and 34 px chips on touch | 44 px on touch for every control (§17) |
| F-A11Y-022 | medium | Idle animation elsewhere in the app | Only request-bound spinners and a real audio meter move; both stop under reduced motion (§11, §13) |
| F-UX-019 | medium | Send failure is grey text with no Retry, stored in history | InlineError with Retry and Details, never stored as an Assistant reply (§13.4) |
| F-UX-028, F-UX-002, F-RWD-013, F-A11Y-015 | high / medium | 42–77 px wallet banner, links to Profile, assertive alert | Assistant is not a spending page: no WalletNotice. Wallet appears in the Baseline and, when it blocks a call step, inline on that step with **Top up** → `/billing?topup=1` (§10.4) |
| F-UX-030, F-QA-007 | medium / high | Full-screen "Loading…" without the shell | Shell renders at once; thread and plan skeletons after 200 ms (§13.2) |
| F-UX-031 | medium | The conversation is not addressable | `/assistant/c/{chatId}` and `?step=` deep links (§5.1) |
| F-UX-017, F-UX-043, F-UX-016 | medium | "Agent" means five things; em dashes; vendor names can leak into answers | One name, "Assistant"; sentence case, no em-dash separators; banned vendor terms enforced on Assistant output (§15, §16) |
| F-VIS-001, F-VIS-002, F-VIS-008, F-VIS-034 | high / medium | System font dominates (480 chars); composer 1,278 px wide at 1920 | Hanken via next/font on `<html>`; thread and composer capped at `--size-container-form` 720 (§5) |
| F-UX-045 | medium | Session replay loads on pages with lead data | Replay off on `/assistant`; telemetry carries no message text (§18) |

Strengths kept (00-summary §4): the empty state's plain capability statement and verb-led suggestions, the named plan panel with its own empty state, sentence case, calm sans type, and the Personal Agent autonomy vocabulary.

---

## 3. Page principles (from the direction, applied)

- **A1. Plan before act (P3).** A request that would change anything produces a visible plan first. Read-only questions are answered directly, with a line saying what was looked at.
- **A2. No second door (P3, P5).** The Assistant has exactly the user's permissions and uses the product's own guards: drafts for flows, the Call gate for calls, the Publish gate for going live, the tier model of overlay §3.1 for everything else. It cannot do what the UI cannot do, and no autonomy mode relaxes a gate.
- **A3. Every claim has a source (P1).** Numbers come from the same aggregates as Analytics (`lib/metrics.ts`) with their scope ("Last 7 days · calls, not legs · test calls excluded"). Lists link to their records. If the Assistant cannot see something, it says so.
- **A4. Suggestions never act.** Clicking a suggestion writes into the composer. Only Send sends.
- **A5. Quiet streaming (P7).** Status words ending in "…", no typing effect, no sparkles or glows, no idle motion. Screen readers hear a reply once it is complete.
- **A6. Your words stay yours.** Typed or dictated text is never lost to a failure, a reload or an expired session.

---

## 4. Information hierarchy

| State | 1st: the eye lands on | 2nd | 3rd |
|---|---|---|---|
| First use (new chat) | The composer with its example, and the four suggestions right above it | The one-paragraph capability statement ("I show the plan first…") | The plan panel's three-line explainer of what runs on its own and what waits; Recent chats |
| Answer to a question | The newest Assistant turn: its first sentence and any table or number | The sources line under it (what it looked at) | Follow-up suggestions; turn actions (Copy, Retry) |
| Plan waiting for you | The ApprovalCard: what changes, for whom, what it costs, and its one Neel button | The step list around it (what already ran, what comes next) | The thread's pointer line and the composer |
| Plan running | The running step's status sentence ("Adding 24 leads…") | Done steps with their results | Stop plan |
| Failure | The InlineError on the failed turn or step, with Retry | The preserved message or partial answer | Details (error id) |

One primary Neel button per region, and usually one on screen: Send (composer region) is filled only when there is text; the ApprovalCard's button (plan region) exists only while a step waits. The page header has no primary.

---

