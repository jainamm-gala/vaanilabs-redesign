### 6.9 Lead sheet

`Sheet` variant `record` (overlay §4), 440 px, `mode="auto"`: docked at ≥1440, non-modal overlay at 1024–1439, modal full height at 768–1023, full screen below 768. Deep-linked `?lead={id}&tab={tab}`; a direct load opens it even when the lead is outside the current page or view (with the "Not in the current results · Clear filters" Notice, overlay §4.3). It replaces today's clipped `<aside>` (F-UX-032, F-A11Y-010).

| Part | Configuration |
|---|---|
| Header (sticky, 56) | Title: the lead's name, `title-16`, `translate="no"` ("Unnamed lead · •••• 0142" when there is no name). Meta line: `StatusTag` + "Added 21 Sep 2026 · Import · leads-sept.csv" (`meta-12`). Actions: Previous lead / Next lead (`chevron-up` / `chevron-down`, tooltips with `Kbd` K and J), Copy link, `⋯` (Edit details… · Export lead · Copy full number (admins, logged) · separator · **Delete lead…**), Close ("Close lead"). Phone: "‹ Back to Leads" replaces Close |
| Tabs | `PanelTabs` (data-nav §3): Overview · Calls {n} · Notes {n}; automatic activation; `?tab=` |
| Footer (sticky) | **Call…** (primary, `phone` 16) → Call gate anchored upward. **WhatsApp…** (secondary) only when a WhatsApp integration is connected; it opens that integration's template picker (outside this spec). Never a destructive action |

**Overview tab** (sections are `h3` in `title-14`, content as `KeyValueList` `inline`, data-nav §8):

| Section | Rows |
|---|---|
| Next step (only when there is one) | StatusText `warning`: "Callback due today 4:00 pm IST" + link "Reschedule"; or, from B6: "Last call timed out · no update since 28 Aug, 11:45 pm · Check status" |
| Contact | Phone: `PhoneText` masked + **Reveal** (permitted roles; logged in Activity & audit; then Copy) · Email · City · State · Language: the name (`LanguageMark` `name`) + source note ("from import", "heard on the call on 26 Sep") · Source |
| Pipeline | Status: `Select` that saves on change, then StatusText "Saved" for `--timing-toast`; on failure it reverts with "Couldn't save. Retry" · Interest: "82" + meter + source note "from the call on 26 Sep", or "Not scored" · Callback: DateTime field (IST) "Set a callback…" · Owner: `Select` · Flow: `FlowSwitcher` `assign`, trigger reads "Workspace default · Site-visit qualifier v7" until overridden |
| Captured on the last call | Count on the right ("2 of 3"); rows from that call's captured fields; "Nothing captured" compact; link "Open call report" (`/call-reports?call={id}`) |
| Custom fields | "Extra columns from import" as key-value rows; the section is omitted when empty |

**Edit details…** turns Contact into Fields (Name, Phone as `PhoneInput` for admins only, Email, City, State, Language, Source). While dirty, the footer swaps to the `UnsavedChangesBar` ("Unsaved changes · 2 fields · Discard · Save changes", overlay §18.3); closing or switching leads while dirty uses the inline discard state (overlay §2.5).

**Calls tab:** `Timeline` (data-nav §10) with calls, status changes, callbacks, flow assignments and the import that created the lead. A call item reads "Vaani called · Visit booked · 2m 31s" with the tone of its result, an optional detail (the caller's key turn as a compact `TurnRow` excerpt with its `LanguageMark`) and the action "Open call report". Test calls carry an outline Tag "Test call". Calls are conversations, not legs, from the same source the Cockpit uses, so the count agrees everywhere (F-UX-032). Stale calls show the Timeline stale state (F-QA-037). "Show older activity" loads 20 more.

**Notes tab:** a `Textarea` labelled "Add a note" (placeholder "Asked for the brochure in Hindi…"), **Add note** (secondary `sm`, ⌘/Ctrl+Enter), then notes newest first as Timeline items with the author's Avatar. Own notes have `⋯` Edit · Delete note (Undo toast). Empty: compact "No notes yet."

### 6.10 Call gate (Leads configuration)

The Call gate is `CallGate` from `spec/02-components-gate.md` (G §5.1). Its frame, check kinds and marks, cost-line formula, states, keys, gate token (120 s), idempotency key, the wallet ₹0 rule and its containers per breakpoint are specified there, not here. This section only configures it for Leads; the sketch in §5.2 shows the result.

| Setting | Leads value |
|---|---|
| Entry points and mode | Row "Call…", sheet footer "Call…", ⌘K "Call Lead 1042…": `mode="single"` for that lead · `C` in the table: the selection (`batch`) if there is one, else the focused row (`single`) · BulkBar "Call {n} leads…": `batch` with the selection or the server-side "all matching" selection |
| Anchor | Upward from the BulkBar primary, from the row's "Call…", or from the sheet footer's "Call…" (popover gate, G §1.3) |
| Scope | `settings="editable"`: Flow · Voice · Language · Caller ID, collapsed to one line with **Change**. Flow is `FlowSwitcher purpose="assign"` (live flows only; "Uses each lead's flow" with the breakdown "Site-visit qualifier v7 (8) · Home-loan follow-up v3 (1)" when assignments differ); Language is "Auto: each lead's language, else Hindi and English" or a fixed language |
| Choice | `choice="always"` in both modes: Place now · Schedule… |
| Checks | The G §5.1 catalogue for Real calls to leads. Leads adds none |
| Global blockers (entry point `aria-disabled`, reason in its tooltip; `C` announces it and shows an info toast with the fix) | "Wallet is ₹0. Top up to place calls. · Top up" · "No verified caller ID. · Verify a number" · "No live flow. Publish a flow to call leads. · Open Flows" · "You're offline" (G §4.4) |
| Primary | Single: "Place call" / "Schedule call". Batch: "Start {n} calls" / "Schedule {n} calls" |
| Top up from the gate | G §4.4 rule 6: the selection is kept; the top-up success toast offers "Call 12 leads…" |
| Done (batch) | The selection clears ("9 calls scheduled. Selection cleared."); focus returns to the trigger or, if it is gone, the table's active row; progress toast "Starting 9 calls · View in Cockpit"; rows' Last call cells show live `CallStateTag`s; the Baseline shows "9 calls in progress"; the batch is in Cockpit › Up next as Scheduled with Pause and Cancel. When it finishes: toast "9 calls finished · 3 interested · View results" (Call reports filtered to the batch) |
| Done (single) | Toast "Calling Lead 1042 · Open in Cockpit"; focus returns to the trigger |
| Remembered | Only the proof "Test call on this version today, 11:02 am". No setting, admin or otherwise, skips the gate (P3) |

### 6.11 New lead

`Dialog` `md` (overlay §2), title "New lead", description "Add one person. To add many, use Import…" (a link that swaps to the Import dialog after the inline discard check). It replaces today's modal without dialog semantics that throws away typing on Esc (F-A11Y-005, F-UX-025).

| Field | Component | Rules |
|---|---|---|
| Name | `TextInput`, `data-autofocus` | Required: "Enter the lead's name." No placeholder |
| Phone | `PhoneInput` `kind="any"` (core §4.1) | Required; E.164; format checked on blur; duplicate check on blur: hint "This number is already a lead. **Open lead**" |
| Language | `Select` with `LanguageMark` options | Optional ("Not set") |
| Email | `TextInput` `type="email"` | Optional; `email` schema on blur |
| City | `TextInput` | Optional |
| More details (`Collapsible`, closed) | State · Source (default Manual) · Status (default New) · Owner (default you) · Flow (`FlowSwitcher` `assign`, default "Workspace default") · Note (`Textarea`) | Keeps the visible form at 5 fields (overlay §2: dialogs hold ≤ 6) |

Footer: **Cancel** (tertiary) · **Create and add another** (secondary: saves, clears the form, keeps Language, Source and Flow, focuses Name, announces "Lead added") · **Create lead** (primary). Validation follows core §8.2 (V1–V12): nothing turns red while typing, errors on blur for changed fields, all on submit, focus to the first invalid field. Submitting: "Creating lead…"; failure: a danger Notice at the top of the body, e.g. "Couldn't create the lead. This number is already in Leads. Open existing lead". Success: the dialog closes, focus returns to New lead, toast "Lead added · Open" (or "Lead added. It's hidden by your current filters · Show" when it doesn't match the view).

### 6.12 Import leads

Three steps in one `Dialog` (`md` for step 1, growing to `lg` 720 for steps 2 and 3, overlay §2.2), with `StageProgress` in the header: Checking file · Mapping columns · Importing (overlay §14.3). Importing never places calls.

**Step 1 · Choose a file** (`md`). Description: "CSV or XLSX, up to 5 MB. A phone column is required." `Dropzone` (core §7.2) with `maxFiles={1}`, `accept={['.csv','text/csv','.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}`, the contract line "CSV or XLSX · up to 5 MB · one file", and a link "Download the template (CSV)". Type, MIME and size are checked on selection and on drop; a rejected file stays listed with its reason ("Not a CSV or XLSX file. Choose another file.") (F-QA-022). The first 20 rows are parsed in the browser (Papa Parse for CSV, SheetJS for XLSX) while the server counts the rest. Footer: Cancel · **Next: map columns** (enabled when a file is accepted).

**Step 2 · Map columns** (`lg`):

| Region | Content |
|---|---|
| File line | "leads-sept.csv · 1,240 rows · 6 columns" + Change file |
| Mapping | A framed `DataTable` without selection: **Column in file** · **Sample values** (first 3, `text-3`, phone samples masked) · **Import as** (`Select`: Name · Phone · Email · City · State · Language · Source · Status · Owner · Callback · Custom field · Don't import) · **Check** (`StatusText`: "Matched", "Custom field", "Not imported", or an error). Columns are auto-matched by header synonyms (phone, mobile, contact number, फ़ोन; name, full name…) and each auto-match says so ("Matched from 'Mobile No.'") |
| Row checks | A checklist in the Gate's visual language: ✓ "1,212 rows are ready" · ◷ "18 rows have no phone number · skipped" · ◷ "6 phone numbers aren't valid · skipped" · ◷ "4 numbers repeat inside the file · first kept" · ◷ "12 numbers are already leads" with a `RadioGroup` Skip (default) · Update empty fields · Overwrite. Each row has "Show rows" (up to 20 row numbers and reasons) |
| Options | Source for these leads: "Import · leads-sept.csv" (editable) · Flow: `FlowSwitcher` `assign` (default Workspace default) · Language for rows without one: `Select` (default Not set) |
| Consent (pending the owner's decision, §15) | Checkbox "These people agreed to be contacted by {workspace}" |

Blocking errors: "Choose the column that holds phone numbers." (Phone unmapped); "No rows have a valid phone number." Footer: Back · Cancel · **Import 1,212 leads** (primary; the count follows the checks and the duplicate choice).

**Step 3 · Importing** (`lg`): a determinate `ProgressBar` "Importing… 820 of 1,212" and the line "You can close this. The import continues, and a notification appears when it's done." **Close** hands over to a progress toast ("Importing 1,212 leads… 820 done · View"). **Done:** "1,212 imported · 28 skipped" with **Download skipped rows (CSV)** and **View imported leads** (primary: closes and applies the filter Imported from: leads-sept.csv). **Failed part-way:** "Import stopped at row 820. 819 leads were imported." + Retry the rest · Download skipped rows. Every result comes from the server (B8).

Helper copy uses plain words: "Extra columns are saved as custom fields." (never "metadata.extra", F-UX-016).

### 6.13 Export

**Export** opens a `Popover` (overlay §5): title "Export leads"; **Which leads** `RadioGroup`: This view (38) · Selected (12, when there is a selection) · All leads (1,284); **Format** `SegmentedControl`: CSV · XLSX; **Columns**: Visible columns · All fields; **Phone numbers**: Masked (default) · Full numbers (admins only, with "Logged in Activity & audit"). Footer: Cancel · **Export 38 leads**. Up to 5,000 rows download directly with the toast "Exported 38 leads"; larger exports run in the background with a progress toast and a link when ready (threshold to confirm, §15). Exports respect masking (digest §5.7).
