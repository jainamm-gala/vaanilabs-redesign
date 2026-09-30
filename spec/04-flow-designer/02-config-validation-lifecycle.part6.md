
---

## 9. The condition builder (Branch)

Today a Branch is one free-text condition with TRUE and FALSE, so real flows chain three Branches to express three property types (F-FLOW-020). The builder gives a Branch **named cases evaluated in order, plus Else**.

```
Cases · first match wins                                    
┌ 1  Name [Budget over ₹1 Cr                ]          ⋯ ┐
│    [{{budget}}    ▾] [is more than    ▾] [1,00,00,000 ] │
│    + Add condition                                     │
│    Go to [Premium site visit                     ▾]    │
└────────────────────────────────────────────────────────┘
┌ 2  Name [Budget ₹80 L to ₹1 Cr            ]          ⋯ ┐
│    [{{budget}}    ▾] [is between      ▾] [80,00,000] and [1,00,00,000] │
│    Go to [Standard site visit                    ▾]    │
└────────────────────────────────────────────────────────┘
  Else · anything else, or an empty value   Go to [Ask about budget again ▾]
[+ Add case]                         Try values: {{budget}} [95,00,000] → Case 2
```

| Part | Spec |
|---|---|
| Case | A group (`role="group"`, labelled "Case 2, Budget ₹80 L to ₹1 Cr"), 1 px `border`, radius 8, padding `space-12`, gap `space-8`. Number + editable Name (defaults to a sentence built from the rule; the name labels the canvas answer row and the edge) + `⋯` (Move up, Move down, Duplicate case, Delete case with Undo) |
| Condition row | Variable (Combobox of variables with their type; C §5.3) · Operator (Select, by type below) · Value (control by type). Min widths 120 / 140 / 120; wraps below 400 px of inspector width to one control per line |
| Several conditions | "+ Add condition" adds a row; with 2 or more, a SegmentedControl above them: **Match all** · **Match any**. No nested groups in v1 (use another case or Branch) |
| Else | Fixed last row on `surface-2`: "Else · anything else, or an empty value" + Go to. Required (E06) |
| Try values | A sample-value field per variable used (from Test data) and a live result "→ Case 2 · Budget ₹80 L to ₹1 Cr" (or "→ Else"), recomputed as you type. It is how an author proves the order is right |

**Operators and values by variable type**

| Type | Operators | Value control |
|---|---|---|
| Text | is · is not · contains · starts with · is empty · is not empty · is one of | TextInput; "is one of" uses the token input |
| Number | = · ≠ · more than · at least · less than · at most · between | NumberInput (en-IN grouping, ₹ prefix when the variable is money) |
| Option (from a Question's answers) | is · is not · is one of | Select or MultiSelect of that Question's answer labels |
| Yes/No | is yes · is no | none |
| Date | before · after · within the next · more than … ago | DatePicker (C §7.1) or NumberInput + "days" |

**Rules.** Empty values never match and take Else (stated in the Else row). E15: an incomplete condition ("Case 2 needs a value.") or a type mismatch ("Enter a number, like 80,00,000."). E11: an unknown variable. W12: a case that can never match because an earlier case covers it ("Case 3 can't match. Case 1 already covers budgets over ₹80 L."; checked for single-variable numeric ranges and option sets only). **Description** mode (§7.5) stores the text and is judged by the agent at call time; it shows the hint "The agent judges descriptions and can be wrong."

**Keyboard.** Tab order: case name → variable → operator → value → Add condition → Go to, case by case. `Alt+↑/↓` on a focused case moves it; the move is announced ("Case 2 moved to position 1").

---

## 10. Voice and language

### 10.1 Flow level (Flow settings › Agent)

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Voice | VoicePicker `cards` (N §12.3); previews play in each of the flow's languages | Workspace default voice | Picking changes this flow's Draft only; "Make default" belongs to Settings, never here (F-UX-014) |
| Languages | MultiSelect with LanguageMarks (अ Hindi · A English · अA Hinglish · म Marathi · த Tamil …); the first is the primary; reorder with the token's menu | Hindi, English | At least one. A voice that can't speak one of them makes that option show "Vikash doesn't speak Tamil" and raises E16 |
| Switching | RadioGroup: Follow the caller's language · Stay in the primary language | Follow the caller | Follow: "The agent answers in the language the caller uses, from this list." |
| Mixed Hindi and English | Switch "Speak Hinglish when the caller mixes Hindi and English" | On when Hindi and English are both listed | |
| Pace | SegmentedControl: Slower · Normal · Faster | Normal | Previews use it |
| Wait for a reply | NumberInput 3–15, "s" | 6 s | Default "No reply after" for new Questions; existing steps keep their own |

### 10.2 What the canvas and inspector show

- The flow's languages appear once in the header meta of the Test panel and in the Publish gate ("Speaks Hindi and English · Vaani").
- A step with a language override shows its LanguageMark on the canvas meta line; steps on Auto show nothing (no decorative marks).
- Answer examples are bilingual by design (D §3.1): the answer editor accepts Latin, Devanagari and other scripts in the same row.

### 10.3 Step-level language override

A Select at the end of Configure: "Language: Auto · Hindi + English" (the flow's list) · each flow language · never a language outside the flow's list (add it in Flow settings first, link "Add a language"). Prompt fields show **language versions** as small tabs above the textarea when the flow has more than one language: `अ Hindi` · `A English` · "+ Add version". Hint under the field: "Without a Hindi version, the agent says this in Hindi in its own words. Add one to control the exact wording." (the runtime behaviour is to be confirmed, §26). Devanagari text renders at `read-15-deva` line height inside the field.

---

## 11. Flow settings

A Sheet `detail` (560), modal, opened from the tool rail (Flow settings), ⋯ › Flow settings, or `?panel=settings`. It replaces the blurred 576 px drawer (F-FLOW-032, F-VIS-022). Header: "Flow settings" + meta "Site-visit qualifier"; footer: SaveState compact on the left, **Done** (secondary) on the right. Five sections, each with a `title-16` heading, a one-line description and an outline Tag stating when changes apply.

| Section | Applies | Fields |
|---|---|---|
| **Identity** | "Applies now" | Name (required, unique; async check "Checking…"; clearing it and leaving the field restores the last name with "A flow needs a name. Kept 'Site-visit qualifier'." (F-FLOW-015)) · Description (optional, soft 280) · Category (Select: Sales · Support · Collections · Scheduling · Other) · Visibility (Select: Workspace · Only me; "Only me" is disabled with "Live on +91 80 •••• 2210. Teammates who run calls must see it." while the flow is live anywhere; replaces the "Private" pill, F-FLOW-014) |
| **Agent** | "Saved to the draft" | §10.1 fields · **Agent instructions** (Textarea, soft 6,000, count; description "The agent's personality and limits for this flow: tone, what it must never promise, how to address callers."; placeholder "Warm and brief. Never promise a discount. Address callers as ji…"; replaces "Soul.md", F-UX-016) |
| **Call behaviour** | "Saved to the draft" | Longest call (NumberInput 1–30 min, default 10; "At the limit the agent closes politely and ends the call.") · Recording notice (read-only, from workspace, with a Settings link) · Calling hours: a link "Set on the Outbound batch trigger" (they belong to the trigger, §7.3) |
| **Security** | "Saved to the draft" | Voice verification Switch "Check the caller's voice, with consent" (consent is always required, shown as a locked Checkbox) · Listen for (NumberInput, 4–20, unit per §26 Q3) · Confidence bands: a two-thumb Slider (C §6.5) 0 to 1 with labelled bands under it: "Verified 0.86 and above · Confirm 0.70 to 0.86 · Fallback below 0.70"; thumbs can't cross ("The lower band must be below the upper one.") · When confidence is in the middle band (Select: Ask a confirmation question · One-time code) · When it's low (Select: One-time code · Transfer to a person · End the call) · If fraud is suspected (Select: Restrict and alert · End the call) · Checkboxes: Liveness check · Check the fraud watchlist · **Only after verification** (Checkbox list in plain words: Look up a customer record · Send email · Send WhatsApp · Book meetings · Transfer calls; replaces "lookup_record, send_email, send_whatsapp") |
| **Advanced** | "Read only" | What the agent is told (the compiled instruction, `mono-12`, max-height 50vh, Copy; each "Step n" heading links to its step; replaces "Preview AI script" with its 230 px box and "Duration: undefined minutes", F-FLOW-016) · Export JSON (secondary `sm`) · Flow id `flow_7c21` with Copy |

Selects are at least 180 px wide so values never truncate ("Light confirmatio…", F-FLOW-032). Esc or Done closes; focus returns to the tool rail button.

---

## 12. Validation

### 12.1 Principles

1. **One rule set** (`@vaani/flow-rules`, TypeScript, run in the browser and on the server) with stable ids, levels and message templates. The chip, marks, Problems bar and panel, inspector fields and Issues tab, Outline badges, Publish gate and the server's 422 all read it (L6).
2. **Computed, never assumed.** Recompute 300 ms after each change (`--timing-validate-debounce`) in a Web Worker for flows over 60 steps; results are keyed by `flowId + draftEtag` (or version) and cleared on flow switch (F-FLOW-010). There is no "validated" state that outlives a change.
3. **Steps are named by their stable number and label** (part 1 D7), never by a raw id: "#5 Ask about budget". Untitled steps keep their default title, "#7 Speak 2" (F-FLOW-004).
4. **Errors block Publish. Warnings need a tick. Hints never block.** Nothing else is gated by validation: an invalid draft still saves and still runs in the text test up to the broken step.
