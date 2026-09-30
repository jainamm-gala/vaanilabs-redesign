
---

## 3. Information hierarchy

**Designer with a step selected (≥1024).** The eye should hit, in order:
1. **The step being edited**: the inspector title and its first field (the work).
2. **What is live versus what is changed**: `Live v7` and `Draft · 3 changes` in the header, and the live note ("Callers hear v7 until you publish").
3. **Whether it can go live**: the issues chip (`1 warning`) and the one Neel button, `Publish v8…`.
4. Then: the Problems bar's current issue, the save chip, Test.

**Publish gate.** 1: the title with the version and the blocking count if any ("Publish v8", "2 errors block publishing"). 2: the checks. 3: where it goes live. 4: the changes. 5: the button, whose label states the consequence ("Publish with 1 warning").

**Flows list.** 1: flow names. 2: status (`Live v7`, `Draft · 3 changes`, `Not published`). 3: where each is used. 4: issues and last edit.

The largest element is always the work (P7): the canvas and inspector in the designer, the table on `/flows`, the conversation in the Test panel.

---

## 4. The revision model and saving

### 4.1 What is versioned

| Belongs to | Fields | Changes take effect |
|---|---|---|
| **Flow metadata** (not versioned) | Name, description, category, visibility, archived, owner | At once, for everyone; logged in Version history as "Renamed by Anika R." |
| **Revision content** (Draft, then versions) | Steps and their fields, connections, answers, conditions, frames and notes, flow-level agent settings (voice, languages, agent instructions, silence timeout, max call length, calling hours on outbound triggers, voice verification, sensitive actions) | Draft: at once, for the designer and tests only. Live: only through Publish |
| **Bindings** (owned by other pages) | Inbound number → flow (Phone setup), batch → flow (Leads Call gate), workspace default flow, Meetings flow | By their own pages, always pointing at the flow (calls read its Live version at call time). An Inbound call trigger may *request* a number; the move happens at Publish (§7.3) |

```ts
type Flow = {
  id: string; shortId: string /* flow_7c21 */; name: string; description?: string;
  category: 'sales' | 'support' | 'collections' | 'scheduling' | 'other';
  visibility: 'workspace' | 'only-me'; ownerId: string; archived: boolean;
  live?: { version: number; publishedAt: string; publishedBy: string; usedBy: UsedBy[] };
  draft: { baseVersion: number | null; etag: string; editedAt: string; editedBy: string; changes: ChangeSummary };
};
type UsedBy = { kind: 'inbound' | 'batch' | 'workspace-default' | 'meetings' | 'personal-agent' | 'api';
  label: string /* "+91 80 •••• 2210" */; detail?: string /* "Mon to Sat, 10 am to 7 pm IST" */; href: string };
type ChangeSummary = { added: number; changed: number; removed: number; settings: number; total: number };
```

The Draft change count is the number of **steps and settings that differ from Live** (added + changed + removed + settings groups), not the number of edits: typing ten letters into one prompt is "1 change". A draft whose content equals Live is **clean** and mirrors Live automatically after every publish or roll back.

### 4.2 Names and version labels everywhere

| Surface | Today | v1 |
|---|---|---|
| Designer header | Switcher "Sample Realty (v2)"; chip "Up to date"; no live marker | FlowSwitcher `switch` "Sample Realty follow-up" · `Draft · 3 changes ▾` · `Saved 11:24 am` · `Live v7` |
| FlowSwitcher (Cockpit, Leads, Meetings, Phone setup) | "Sample Realty (v2) · 9115a2" / identical duplicates | Line 1 name + `Live v7`; line 2 "Edited 3 days ago · 14 steps · Inbound +91 80 •••• 2210"; legacy duplicates start line 2 with `flow_7c21` (C §5.4) |
| Call reports row, Leads "Flow" column | name only, or a hash | "Site-visit qualifier v7": the version the call actually ran |
| Baseline (Shell part 3) | "SYS: ONLINE" | `Live v7 · Site-visit qualifier` |
| `<title>` | one title for every route | `Site-visit qualifier · Flows · Vaani Labs`; `Couldn't save · Site-visit qualifier · Flows · Vaani Labs` while a save is failing (Shell) |
| AI-draft flows | "Generated: Sample developers ... (v2)" | An editable name suggested from the description, no "...", tagged `AI draft` until first publish |
| Draft of a flow never published | "Choose a flow to edit" | Header: `Not live yet` (VersionChip, O §18.2); lists and pickers: `Not published` (StatusTag, N §5.3); Publish reads `Publish v1…` |

### 4.3 Saving: the machine and what the header says

The chip is `SaveState` and the version chip is `VersionChip` (O §18). This section fixes the designer-specific rules.

**Timing.** Graph edits (add, connect, disconnect, delete, move end, paste, Tidy) save 300 ms after the change (`--timing-validate-debounce`). Typing coalesces per field and saves 800 ms after the last keystroke or on blur, whichever comes first. One request in flight; edits during a save queue behind it; retries 3 times with backoff, then `error`. A content hash (sorted keys) skips a PUT whose content equals the last saved snapshot (F-FLOW-002).

**Never marks dirty:** hydration, schema normalisation on load (runs in memory), `fitView`, `dimensions` and selection events, viewport, theme, panel resizing, opening the inspector, validation results, test runs, compare mode, viewing an old version.

**Header states** (the version area, save chip, live chip and Publish button always agree):

| Situation | Version area | Save chip | Live | Publish button (the one Neel button) |
|---|---|---|---|---|
| Loading | hidden | hidden | hidden | hidden (O §13.2 canvas skeleton) |
| Never published | `Not live yet` (neutral, O §18.2) | `Not saved yet` → `Saved 11:24 am` | none | `Publish v1…` |
| Live, draft clean | hidden | `Saved 11:24 am` | `Live v7` | `Publish…`, `aria-disabled`, reason "Nothing to publish. Your draft matches Live v7." |
| Live, draft changed | `Draft · 3 changes ▾` | `Saved 11:24 am` | `Live v7` | `Publish v8…` |
| Saving | unchanged | `Saving…` (only after 200 ms) | unchanged | enabled; opening the gate flushes first ("Saving your last edit…") |
| Save failed | unchanged | `Couldn't save · Retry` (danger, persistent) | unchanged | `aria-disabled`: "Your last 2 edits haven't saved. Retry, then publish." |
| Offline | unchanged | `Offline · 3 edits on this device` | unchanged | `aria-disabled`: "You're offline." |
| Conflict (409) | unchanged | `Changed elsewhere · Review` | unchanged | `aria-disabled`: "Review the other changes first." |
| Publishing | `Publishing v8…` (info tag) | unchanged | `Live v7` | busy, `aria-busy="true"` |
| Viewing an old version (`?v=5`) | `Viewing v5 · read-only` + "Back to draft" link | hidden | `Live v7` | secondary `Restore as draft…` and primary `Roll back to v5…` |
| View-only role | `View only` (outline tag) | hidden | `Live v7` | hidden; secondary `Duplicate to edit` |
| Interim I1 (§4.9) | `Draft on this device · 3 changes ▾` (VersionChip `device`) | `Saved on this device 11:24 am` (SaveState `device`) | `Saved flow` (neutral) | `Publish…` |
| Interim I1, browser storage unavailable (private window, blocked site data) | `Draft on this device · 3 changes ▾` | `Not saved · this tab only` (SaveState `volatile`, danger tone, persistent; tooltip "This browser won't keep your edits. Publish them, or they are lost when this tab closes.") | `Saved flow` | `Publish…` stays available (publishing is the only way to keep the edits); `beforeunload` is registered while any edit exists |

**Issues chip** (right zone, before Test): a button built on StatusTag `validation` (N §5.3) at `lg` size: `No issues` (success, `check`) · `1 warning` (warning) · `2 errors · 1 warning` (danger tone, the worst level leads) · `Checking…` (neutral, only before the first result after load). It opens the ProblemsPanel (§12.4). Its component name is **IssuesChip** (part 1 §20.1 registry). Accessible name: "2 errors and 1 warning. Open problems".

**Live note** (the right end of the phase ruler row; part 1 places it):

| State | Copy |
|---|---|
| Live, draft clean | Hidden: the `Live v7` chip says enough |
| Live, draft changed | "**Live v7** answers +91 80 •••• 2210 since 12 Sep. Callers hear v7 until you publish. · Compare with live" |
| Live on several targets | "**Live v7** answers 2 numbers and runs 1 batch since 12 Sep. Callers hear v7 until you publish. · Compare with live" |
| Live, used by nothing | "**Live v7** isn't used by a number or batch yet. · Where to use it" (link opens a popover listing Phone setup, Leads and "Make workspace default…") |
| Not published | "Not live. Nothing calls this flow until you publish." |
| Interim I1 | "Edits stay on this device until you publish. Callers hear the saved flow." |

The phone number is `PhoneText` (masked, tabular figures; data-nav §5.8). The note is plain text with one link; it is not a live region (it changes only after publish, which the toast announces).

### 4.4 The version menu (from the Draft chip)

`Draft · 3 changes ▾` is the interactive Tag (N §5.3) with `aria-haspopup="menu"`. Menu items (Radix DropdownMenu, O §7):

| Item | Does | Guard |
|---|---|---|
| Compare with Live v7 | Enters compare mode (§4.5) | none |
| Version history | Opens the History panel (§6) | none |
| What changed (3) | A submenu listing the changes; each item selects its step | none |
| separator | | |
| Discard draft changes… | Resets the Draft to Live v7 | Tier 2 ConfirmDialog: "Discard draft changes? Your draft goes back to Live v7. The 3 changes since then are removed, including 1 by Anika R." · Cancel · **Discard changes** (danger outline). Then toast "Draft reset to Live v7 · Undo" (Undo needs FD11) |

Never here: "Reset to default" (retired), Delete flow (Flows list and ⋯ only).

### 4.5 Compare with live

Compare mode lets the author review the Draft against Live (or against any version, `?compare=5`) on the canvas itself.

```
┌ Flows / Site-visit qualifier  [Draft · 3 changes ▾] ✓ Saved 11:24 am  ● Live v7 ─────── ⚠ 1 warning [Test] [Publish v8…] ⋯ ┐
│ Comparing draft with Live v7 · 1 added · 2 changed · 1 removed        ‹ Previous change   Next change ›   Exit compare (Esc) │ 40
├──────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────┤
│   ╭──────────╮   ┌─────────────────────┐ Changed   ┌──────────────┐ Added                │ Ask about a site visit       │
│   │ Inbound  │──▶│ Ask about a site     │──────────▶│ Book site    │                      │ Changed in draft             │
│   ╰──────────╯   │ visit               │           │ visit        │                      │ Agent asks                   │
│                  │ Yes · Later · No    │           └──────────────┘                      │  Before (v7)                 │
│                  └─────────────────────┘   ┌ ─ ─ ─ ─ ─ ─ ┐ ← no: removed steps are ghosts │  …would you like to visit?   │
│                                            │ Send brochure│   at 40%, solid edge, tag    │  After (draft)               │
│                                            └──────────────┘   "Removed"                  │  …visit the site this week?  │
└──────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────┘
```

| Element | Treatment |
|---|---|
| Compare bar (replaces the Problems bar's row, 40 px) | `data-13`: "Comparing draft with Live v7 · 1 added · 2 changed · 1 removed" · Previous / Next change (ghost `sm`) · "Exit compare" (ghost `sm`, `Esc`) |
| Added step | `--diff-added-bg` header fill (success-soft) + Tag `success` "Added" above the step. Never `accent-soft`: while comparing, a selected step still looks selected and an added step never does (foundations §3.9) |
| Changed step | `--diff-changed-bg` header fill (surface-3) + a 2 px `--diff-changed-bar` (ink) inline-start bar + Tag `neutral` "Changed"; never `accent-mark`, which means selection; the inspector shows **Before (v7)** and **After (draft)** per changed field, with deleted words struck through on `danger-soft` and inserted words underlined on `success-soft` (text decoration is the non-colour cue) |
| Removed step | Drawn as a ghost placed where it was in Live: `--surface-2` fill, a **solid** 1 px `--border-strong` border, text at full contrast (only its glyph tile and sockets at `--opacity-unreachable`; opacity never touches text, F §10) and Tag "Removed"; never dashed (dashes mean fallback only, D §5 Lines) |
| Changed connection | Edge drawn in `--edge-active`; its label pill gets "Changed" |
| Settings changes | Listed in the compare bar's overflow "Settings: voice changed" linking to Flow settings with the same Before/After view |

Compare mode is read-only (editing a field exits compare and selects the step). Keyboard: `]` / `[` next and previous change (single keys in the 06 §8.2 registry; the shell's `[` sidebar key is suppressed while the designer is open, Shell §3.8), `Esc` exits; each change announced "Change 2 of 4: Ask about a site visit, changed". Available at every width (it is how tablets review, §21).

### 4.6 Conflicts (409)

A save whose `If-Match` no longer matches means someone else saved the Draft (another tab or a teammate). The chip turns `Changed elsewhere · Review` (assertive once) and the **conflict sheet** opens (Sheet `gate`, 640, modal; O §4.1):

```
┌ This flow changed while you were editing ───────────────────────── ✕ ┐
│ Anika R. saved the draft at 11:31 am. Your last 2 edits haven't      │
│ been saved yet.                                                      │
│ Their changes (2)                     Your unsaved edits (2)         │
│  Changed · Ask about budget            Changed · Polite close        │
│  Added · Send brochure                 Changed · Flow settings: voice │
│ ──────────────────────────────────────────────────────────────────── │
│ ( ) Use their version. Your 2 edits are discarded.                   │
│ ( ) Keep both: save my version as a new flow "Site-visit (my copy)". │
│ ( ) Replace with mine. Anika R.'s 2 changes are removed.             │
│                                         [Cancel]   [Continue]        │
└──────────────────────────────────────────────────────────────────────┘
```

- RadioCard options (C §6.2); no default selected; Continue is enabled once a choice is made. "Replace with mine" shows its consequence inline and needs FD11 (the replaced draft is kept 24 h, restorable from History as "Draft snapshot 11:31 am"); it is hidden without FD11.
- Cancel keeps the sheet's state available from the chip; editing stays paused (the canvas is `inert` behind a neutral Notice "Editing is paused until you choose which changes to keep").
- Same tab, second window: the other window shows a neutral Notice "This flow is open in another tab. Edits there may conflict." (BroadcastChannel), no lock.
- Presence ("Anika R. is editing") is v1.1 (D §8 decision: single editor with conflict handling).

### 4.7 Leaving, offline and recovery

| Moment | Behaviour |
|---|---|
| In-app navigation, flow switch, `visibilitychange` → hidden, `pagehide` | Flush pending saves with `fetch(…, { keepalive: true })` (O §18.1). Switching flows through the FlowSwitcher waits for the flush (≤ 1 s) before routing |
| Leaving while `error`, `offline` or `conflict` | Router guard ConfirmDialog: "Leave with 2 unsaved edits? They stay on this device and come back when you reopen this flow." · Keep editing · Leave. `beforeunload` is registered only in these states and while `dirty`/`saving` |
| Offline | ConnectionBar (O §10.3) + chip `Offline · 3 edits on this device`. Edits queue in IndexedDB keyed by flow id and base etag. Publish, Text test, Call my phone and integration checks are `aria-disabled` "You're offline". Validation keeps running locally |
| Reconnect | Queue flushes with `If-Match`; success toast "Back online. 3 edits saved."; a 409 opens the conflict sheet |
| Reopen after a crash or closed tab | If the local queue holds edits newer than the server draft, a section Notice (info) in the inspector slot: "2 edits from Today 11:42 am weren't saved. **Restore them** · Discard". Never applied silently |

### 4.8 Migrating today's flows

1. **No write on open ships first** (client only; FD3 follows on the server).
2. When FD1 ships, each existing flow gets **v1 = its current content**, published (so nothing that calls it today breaks), with the note "Migrated · published before checks existed". Its Draft starts clean. The validator runs on v1; if it has errors, the flow shows them and its next Publish is blocked until fixed. Nothing is re-laid out (D §6.5 Migration).
3. Legacy lineage (`version_no`, `parent_flow_id`) is shown read-only in History as "Copied from 'Appointment scheduling' on 20 Sep" when the parent exists, and hidden when inconsistent (F-FLOW-012).
4. **Names:** a one-time Notice on `/flows` when duplicates exist: "3 pairs of flows share a name. Rename them so everyone picks the right one. **Review names**" opens a list of pairs with Rename… per row. Names ending in "(v2)" get a suggested rename without the suffix. Nothing is renamed automatically.
5. Old step names map one to one to the registry (§7.2); FAQ steps become Knowledge lookup steps with "This step's Q&A" as the source (§7.9).

### 4.9 Interim I1: a device draft before revisions exist

Until FD1 ships, the builder still must not write into what calls use on every keystroke. The client holds edits in IndexedDB and writes the flow only on Publish. **This is the only interim** in the product: the direction (§8), overlay §18, part 1 (§3.3, §4.4, §14) and the shell (§5.2, §13.3) describe it the same way.

| Element | Interim behaviour |
|---|---|
| Starting a device draft | On the first edit, the client stores the edits keyed by flow id **plus a base**: the server copy's `updated_at` and a content hash (sorted keys, the same hash as FD3) of the flow it was opened from |
| Editing | Autosaves to this browser. Chip `Saved on this device 11:24 am` (SaveState `device`). Version chip `Draft on this device · 3 changes ▾` (VersionChip `device`, neutral). Live chip `Saved flow` (no version is claimed). Zero network writes until Publish |
| Storage unavailable | If IndexedDB throws or is blocked (private window, cleared or blocked site data), edits live only in memory: the chip reads **`Not saved · this tab only`** (SaveState `volatile`, danger tone, persistent), `beforeunload` is registered while any edit exists, and Publish stays available. "Saved on this device" is never shown when it isn't true (P1) |
| Publish gate | Opening it **re-fetches the server copy**. If its `updated_at` or hash differs from the draft's base, a blocking check row leads the gate: "This flow was published from another browser at 11:31 am. Your draft is based on an older copy. **Review changes**", with two choices: **Re-apply my changes on top** (a three-way merge per step between the base, the new server copy and the draft; steps changed on both sides are listed as conflicts and each needs a choice, mine or theirs, before Publish enables) or **Discard my draft** (tier 2 confirm). The Changes list is always computed against the **fresh** server copy, never the stale base, so the other author's work can't appear as rows the author didn't make. Otherwise: checks (client rules, "Checked on this device"), the change list from the local diff, "Where it goes live" limited to what is known ("Your Cockpit default" when `active_flow_id` matches), note hidden. Publish = today's PUT. Button `Publish…` |
| After Publish | The device draft is cleared and its base becomes the just-written copy; toast "Published. Callers hear this version from the next call." |
| Set as default | Today's ACTIVATE becomes the Flows list item "Make my Cockpit default" (it writes `active_flow_id`; its menu text says "for you", not "for all your calls", F-FLOW-014). It never publishes |
| `/flows` | A flow with a device draft in this browser shows a neutral Tag **"Unpublished edits on this device"** in its Status cell (read from IndexedDB; §15.2), so an author sees which flows hold local work |
| History, Roll back, Compare with a version | Hidden. Compare with live compares with the freshly fetched server copy |
| Other devices | A neutral Notice when a device draft exists: "You have unpublished edits on this device only. Teammates and other browsers see the published flow." A teammate told "I fixed the flow" sees nothing until it is published; the Notice and the `/flows` tag say so |

**Acceptance (interim):** browser A opens the flow and edits for a day without publishing; browser B edits and publishes; when A opens the Publish gate it shows the blocking "published from another browser" row, the Changes list contains only A's edits, and A's Publish can't run until A re-applies (conflicts resolved) or discards. B's published content is never overwritten silently.
