
### 12.2 The rule catalogue

Messages name the step by its stable number and label (part 1 D7). Each rule attaches to the flow, a step, a field or an output, which decides where "Go to" lands.

| Id | Level | Rule | Message example | Attaches to |
|---|---|---|---|---|
| E01 | error | No trigger | "Add a trigger so calls can start this flow." | flow |
| E02 | error | A step can't be reached from any trigger | "#9 Polite close can't be reached from any trigger." | step |
| E03 | error | An output isn't connected (answer, case, Found, Not found, Not booked, Didn't connect, or the single output of a non-Outcome step) | "#5 Ask about budget: answer 'Later' isn't connected." | output |
| E04 | error | A loop with no way to an Outcome | "#4, #5 and #6 loop with no way to an outcome." | steps |
| E05 | error | Empty prompt (says, asks, say before transferring) | "#7 Speak has nothing to say." | field |
| E06 | error | The fallback (No reply, Else) isn't connected | "#5 Ask about budget: 'No reply' isn't connected." | output |
| E07 | error | A Question with no named answer, or a Branch with no case | "#6 Branch has no cases." | step |
| E08 | error | Two answers or cases share a name in one step | "Two answers in 'Ask about budget' are called 'Yes'." | field |
| E09 | error | A number outside its range | "Attempts must be 1 to 5. It's 999." | field |
| E10 | error | An invalid phone number | "Transfer number needs the country code, like +91 98765 43210." | field |
| E11 | error | Unknown variable | "{{lead_nmae}} isn't a variable. Did you mean {{lead_name}}?" | field |
| E12 | error | WhatsApp template missing, rejected or not filled | "Choose a template for #8 Send brochure." | field |
| E13 | error | A lookup has nothing to use: no connector, no indexed source, a deleted source, empty Q&A | "Choose a connector for #4 Find loan." | field |
| E14 | error | Unsupported step type | "#11 Call ambulance uses an unsupported type." | step |
| E15 | error | Incomplete or mismatched condition | "#6 Budget check, case 2 needs a value." | field |
| E16 | error | The voice can't speak one of the flow's languages | "Vikash doesn't speak Tamil. Change the voice or remove Tamil." | flow |
| E17 | error | Any other required field empty or invalid under the step's schema (address for in-person meetings, a link that isn't https) | "#7 Book visit needs an address for in-person meetings." | field |
| E18 | error | An API input clashes with a lead field name | "API input {{lead_name}} clashes with the lead field. Rename it." | field |
| W01 | warning | Template pending approval | "'visit_confirm' is pending approval. Calls continue; the message waits." | field |
| W02 | warning | An integration the step needs isn't connected | "Google Calendar isn't connected. 'Book visit' can't check free time." | step |
| W03 | warning | A variable is used before it's captured on some path | "{{meeting_time}} is used in 'Polite close' before 'Book meeting' captures it on the 'No' path." | field |
| W04 | warning | An answer has fewer than 2 examples | "Answer 'Later' has no examples. Add 2 or more so the agent recognises it." | field |
| W05 | warning | Two steps share a label | "2 steps are called 'Lead questions' (#4 and #9)." | step |
| W06 | warning | A chosen knowledge source is indexing or failed | "'price-sheet.pdf' is still indexing." | field |
| W07 | warning | A lead field used without a fallback is empty for many leads (FD10) | "{{lead_email}} is empty for 40% of leads. Add a fallback." | field |
| W08 | warning | An Inbound call trigger answers no number | "'Inbound call' doesn't answer any number yet." | step |
| W09 | warning | A line longer than about 30 s spoken | "#3 Pitch runs about 42 s. Split it." | field |
| W10 | warning | A Callback outcome without a time | "Callbacks need a time. Save one on an earlier question." | field |
| W11 | warning | Email confirmation where leads may lack an email | "Some leads have no email. They won't get the confirmation." | field |
| W12 | warning | A case that can never match | "Case 3 can't match. Case 1 already covers it." | field |

Templates in the New flow gallery pass every rule with zero errors and zero warnings **in isolation**, checked in CI together with "the compiled instruction contains no 'undefined' or 'null'" (F-FLOW-013). Several rules depend on the workspace (W08 number, E13 knowledge, E12 and W01 WhatsApp, W02 calendar), so creation adapts each template to the workspace (§15.3) and CI also instantiates every template in an empty fixture workspace: 0 errors, at most W08.

### 12.3 Where issues show

| Surface | Shows | Behaviour |
|---|---|---|
| Inspector field | The field error (C §3.1), replacing the hint | V1–V4 timing; the new-step grace of §7.1 |
| Inspector Issues tab | This step's issues | Show field / Go to step |
| Step on the canvas | Error: `danger-border` + count badge; warning: `warning-border` + badge; an unconnected answer row turns amber "Not connected" (part 1 draws) | The badge is `aria-hidden`; the step's accessible name ends "2 errors" |
| IssuesChip (header) | `2 errors · 1 warning` | Opens the ProblemsPanel |
| Problems bar (32 px) | The first issue in graph order + counts + ‹ › + Go to step | Always visible in the designer at ≥ 1024; there is no full-screen mode (part 1 §3.1, X7; F-FLOW-034) |
| ProblemsPanel | Every issue, grouped by step | §12.4 |
| Outline | A badge per step row and "Not connected" answer rows | §16 |
| Publish gate | Errors block, warnings need a tick | §5.2 |
| Flows list and FlowSwitcher | "2 errors" for drafts with errors | §15 |
| Server | 422 with the same ids | §12.6 |

### 12.4 Problems bar and ProblemsPanel

```
Problems bar (32 px, bottom of the designer)
│ ⊗ 2 errors  ⚠ 1 warning │ #5 Ask about budget: "No reply" isn't connected.  Go to step  ‹ 1 of 3 › │ Outline  Test │

ProblemsPanel (expands upward from the bar; max 40 % of the canvas, part 1 §3.4)
┌ Problems · 2 errors · 1 warning         [All] [Errors] [Warnings]           Collapse ┐
│ Ask about budget · step 5 · Logic · Question                                         │
│   ⊗ "No reply" isn't connected.                                   Go to step         │
│   ⊗ Answer "Later" isn't connected.                               Go to step         │
│ Send brochure · step 8 · Action · Send WhatsApp                                      │
│   ⚠ Template "visit_confirm" is pending approval.                 Go to step         │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Bar | `surface`, top hairline, `data-13`. Counts as StatusTag validation `sm`; the current issue sentence in `text-2`, one line with Tooltip; Go to step (link-style button); ‹ › IconButtons "Previous issue" / "Next issue" (`F8` is taken by toasts and Alt+Arrow means move, so these use **Alt+,** / **Alt+.** while focus is in the designer and not in a text field, matched by `KeyboardEvent.code`; the keys appear in both tooltips, "Next issue (Alt+.)", and in the `?` sheet; key map 06 §9.6); toggles for Outline and Test panel (ghost `sm`, `aria-pressed`). With no issues: "No issues · 14 steps checked just now" (success StatusText) |
| Panel | `role="region"` `aria-label="Problems"`; heading `title-14` with counts; SegmentedControl filter (All · Errors · Warnings); groups per step (`label-13` step name + `meta-12` "step 5 · Logic · Question"), then IssueRows |
| IssueRow | Grid `16px minmax(0,1fr) auto`: `circle-x` (`danger-text`) or `triangle-alert` (`warning-text`) 16 + sentence `data-13` + "Go to step" or "Show field". Min height `--control-h`; the whole row is a button |
| Go to step | Selects the step, pans it into view with padding so no panel covers it, opens the inspector on **Configure** and focuses the field (or the output row) the issue attaches to; the list stays open. Part 1 §3.4 says "Issues tab"; this spec prefers the field, where the fix happens (§25 R14) |
| Empty | Compact EmptyState "No issues. 14 steps checked just now." |
| Announce | When counts change, politely, after 1.5 s without edits and at most every 2 s: "2 errors, 1 warning". Never per keystroke |

At 1024–1279 the panel overlays the canvas bottom (non-modal). In Review mode (768–1023) it is a tab beside the Outline; on phones the Outline's header shows the counts and each row its badges.

### 12.5 Step marks: meaning

Errors outrank warnings on a step (one border colour, the badge counts both: "3" with the worst icon). A step with an E02 (unreachable) also takes the unreachable treatment (part 1 §5.4: `--surface-2` fill, text at full contrast, glyph tile and sockets dimmed, badge "Not connected"). Marks update with the 300 ms recompute; they never animate.

### 12.6 Server parity

The Publish request carries the rules package version and the draft etag; the server re-runs the same rules and returns `422 { issues: [{ ruleId, level, stepId, field, output, message }] }` when anything blocks. Issues only the server can see (a template rejected minutes ago, a number unverified since) appear in the Problems list with the meta "Found when publishing" and stay until the next check clears them. A mismatch between client and server results is logged (§22). Until FD4, the gate says "Checked on this device" (P1).

---

## 13. Test and simulate

**Purpose.** Hear and walk the Draft before customers do, see which path it takes, and leave a record that it was tested (F-FLOW-016). Opened with **Test** in the header (secondary), `T`, or `?panel=test`.

### 13.1 Layout (≥1024: docked at the bottom, 280 px, resizable 200 px to 50%)

```
├ Test  [Text | Browser voice | Call my phone…]  Revision [Draft ▾]  Start at [Inbound call ▾]  Sample [Lead 1042 ▾]  Restart  ✕ ┤ 40
├──────────────────────────────────────────────────────────────────────────┬──────────────────────────────┤
│ 00:00  Vaani  अA  Step · Greeting                                         │ Captured                     │
│        Namaste Anika ji, main Vaani, Sample Realty se bol rahi hoon.      │  visit_intent   Later        │
│ 00:04  You, as the caller                                                 │  meeting_time   not yet      │
│        haan boliye                                                        │ Path                         │
│ 00:05  Vaani  Step · Ask about a site visit                               │  ✓ Inbound call              │
│        Would you like to visit the site this week?                        │  ✓ Greeting                  │
│    ⌸ Knowledge lookup · price-sheet.pdf · 2 passages                      │  ● Ask about a site visit    │
│ Reply as the caller  [Yes · haan] [Later · baad mein] [No · nahi] [No reply]                              │
│ [Type what the caller says…                                                               ] [Send]       │
└──────────────────────────────────────────────────────────────────────────┴──────────────────────────────┘
```

| Part | Spec |
|---|---|
| Header (40) | Mode SegmentedControl · Revision Select (Draft, Live v7, any version) · Start at Select (the flow's triggers) · Sample Select (a lead via Combobox, or "Sample values" from Test data) · Language Select (Auto or a flow language) · Restart (ghost) · Close. The kind line under it, `meta-12`: "Text test on the draft · nothing is sent or dialled" |
| Transcript | TranscriptFeed + TurnRow (N §12.4) in `live` mode: timecode gutter, speaker ("Vaani", "You, as the caller"), LanguageMark, the step link in plain words; system rows for lookups and simulated actions |
| Quick replies | Secondary `sm` buttons from the current Logic step: each answer's label and first example ("Later · baad mein"), then "No reply (6 s)". A Branch shows the decision instead: "Branch decided from {{budget}} = 95,00,000 → Case 2 · Change value" |
| Composer | Textarea composer mode (C §3.6): "Type what the caller says…", Enter sends; Hindi, Hinglish and Devanagari accepted |
| Side column (280) | **Captured**: a KeyValueList of variables as they fill ("not yet" in `text-3`). **Path**: the steps reached in order with `check`, the current one with a filled dot and "Now" |
