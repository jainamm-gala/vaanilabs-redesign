### 1.5 Components used (by spec name) and configuration

| Region | Component | Configuration |
|---|---|---|
| Header | `PageHeader` (N §2) `variant="page"` | `navId="knowledge"`; meta `{sources} sources · {passages} passages · {n} indexing` (the last part only when > 0; skeleton while loading, never "0"); actions: tertiary "How knowledge works" (`info`), secondary "Test a question" (hidden at ≥1440 while the dock is open), primary "Add knowledge" (`plus`) |
| Sub-routes | `RouteTabs` (N §3) | "Sources" `/knowledge` · "Proposals" `/knowledge/proposals` with `CountBadge` of pending proposals; rendered **only for admins** (a member sees no tab row, saving 40 px) |
| Pane switch (<1024) | `SegmentedControl` (N §3.6) | "Sources" / "Test", `?pane=`, full width below 768 |
| Attention | `Notice` (O §10) `tone="warning" scope="section"` | Shown when ≥ 1 source failed; action "Show it" / "Show them" applies `f.status=failed`; not dismissible (it is a real, fixable condition) |
| Toolbar | `FilterBar` (N §6) | Search "Search sources…" (`label="Search sources"`); fields: Type (File, Text, Web page, Table), Status (Indexed, Indexing, Queued, Couldn't index), Used by (flow names, "Not used"); Columns; density switch |
| Table | `DataTable` (N §7) `id="knowledge-sources"`, `frame="flush"` | Columns and row actions in §1.6; `getRowHref` → `?source=<id>`; server pagination 25 · 50 · 100 (default 50) |
| Phone list | `ListRow` (N §7.13) | title = source name, titleTrailing = compact `StatusTag` (domain `knowledge`), meta = type · passages or reason · updated |
| Status | `StatusText` md (O §11.1) in the Status cell; `StatusTag` (N §5.3, domain `knowledge`) on phones and in the sheet header | Tones: success Indexed, progress Indexing… n%, neutral Queued, danger Couldn't index |
| Add | `Dialog` md (O §2), `SegmentedControl`, `Dropzone` (C §7.2), `TextInput`, `Textarea`, `Field` | §1.7 |
| Record | `Sheet` `variant="record"` (O §4) | Docked at ≥1440, overlay 1024–1439, modal below; §1.8 |
| Test | `Sheet`-shaped docked panel (`record` width), `Select`, `TextInput`, `Button`, **RetrievalResult** (new, §3) | §1.9 |
| Explainer | `Popover` (O §5) info variant | §1.11 |
| Feedback | `Toast` (O §9), `ConfirmDialog` (O §3), `EmptyState` (O §15), `TableState` (N §7.12), `InlineError` (O §11.2), `ConnectionBar` (O §10.3) | Per state, §1.12 |
| Shell | `AppShell`, `Baseline` (D §6.1) | Standard; Knowledge is not a money-spending page, so no WalletNotice (O §10.2) |

### 1.6 Sources table

**Columns** (`DataTable` meta, N §7.5). Default sort: Updated, newest first. At most 7 columns visible by default.

| Column | Priority | Cell | Notes |
|---|---|---|---|
| Select | – | Checkbox "Select Price sheet (Sep)" | Bulk: Re-index (only when a selected source failed), Delete n sources… in the BulkBar ⋯ |
| Source (key) | P1 | Type icon 16 in `--text-3` (`file-text` PDF, DOCX, TXT · `sheet` table · `globe` web page · `text` pasted text · `message-square` answers from calls) + name in `data-13` 500, `translate="no"`, truncated at 40ch with a tooltip | Sort A–Z. The icon has a visually hidden type word ("PDF") |
| Status | P1 | `StatusText` md (table below) | Sort by severity: Couldn't index, then in progress, then Indexed |
| Used by | P2 | "3 flows" as a link to the sheet's Used by tab (flows that reach the source directly or through an all-sources lookup) · "Not used" in `--text-3` | KB3. The tooltip splits direct and all-source flows and gives each one's Live or Draft state |
| Updated | P2 | `formatWhen` in `<time>` | Sort |
| Type · size | P3 | "PDF · 273.6 KB" · "Table · 200 rows" · "Web page · fetched 21 Sep" | |
| Added by | P4 | 20 px Avatar + name | Off by default |
| Actions | pinned right | ⋯ IconButton "More actions for Price sheet (Sep)" only. No inline button: a failed row's fix is the first item of its ⋯ menu and the action of the source sheet's Notice | Always reserved width (fixes F-RWD-016). Verified in the mock: with the dock open the table is 768 px and an inline "Replace file…" did not fit |

**Status sentences** (domain `knowledge` in `lib/status.ts`; the sentence carries the state, never the colour alone):

| State | Sentence (Status cell) | Tone · icon | Phone / sheet tag |
|---|---|---|---|
| Uploading | Uploading… 42% + 2 px ProgressBar | progress · Spinner | Uploading… |
| Queued | Queued | neutral · `clock` | Queued |
| Reading | Reading… (extracting text or fetching the page) | progress · Spinner | Reading… |
| Indexing | Indexing… 60% | progress · Spinner | Indexing… 60% |
| Indexed | Indexed · 42 passages (tables: "Indexed · 200 rows") | success · `check` | Indexed |
| Couldn't index | Couldn't index · No text found (the short reason, table below) | danger · `circle-x` | Couldn't index |
| Couldn't upload | Couldn't upload · Connection lost | danger · `circle-x` | Couldn't upload |

**Failure reasons** (reason code → a short reason for the Status cell and the phone meta line, and one sentence with the fix for the Status tooltip and the source sheet Notice; the Add dialog's file rows, which have room, use "Couldn't index · Retry" or the fix link, O §11.1):

| Code | Sentence | Fix action |
|---|---|---|
| `no_text` | No text found. It may be a scanned PDF. | Replace file… · Paste the text instead |
| `encrypted` | The file is password-protected. | Replace file… |
| `too_large` | Larger than 10 MB. Split it into smaller files. | Replace file… |
| `fetch_blocked` / `fetch_login` | The website didn't let us read this page. / The page needs a sign-in. | Paste the text instead |
| `fetch_not_found` | The page wasn't found. Check the address. | Edit address… |
| `empty` | This source has no text. | Replace file… · Delete source… |
| `internal` | Something went wrong on our side. | Retry · Details (error id in `mono-12`, O §11.2) |

**Row ⋯ menu** (Menu, O §7): on a failed row, the fix first (Retry · Replace file… · Edit address… · Paste the text instead…), then a separator; then Test with this source · Rename… · Replace file… (files) / Re-fetch page (web) / Edit text… (text) · Re-index (only when failed) · Download original · Copy source id · separator · **Delete source…** (`--danger-text`).

**Delete** follows O §3.1: a source no flow uses is deleted at once with an Undo toast, "Deleted 'Price sheet (Sep)' · Undo" (tier 1; tier 2 if the backend cannot soft-delete). A source a flow uses, directly or through an all-sources lookup, gets a ConfirmDialog (tier 2):
> **Delete 'Price sheet (Sep)'?** Live calls stop finding its 42 passages as soon as you delete it. Site-visit qualifier (Live v7) looks it up in step 5, and 2 flows look up all sources. Call reports that quoted it are kept. · Cancel · **Delete source**

After a delete, a flow whose step pointed at that source shows a validation error on its draft ("Knowledge lookup points to a deleted source"), so the next Publish is blocked until it is fixed (D §6.5 validation).

**Page drop target** (enhancement; the "Add knowledge" button remains the address, P5): dragging files over the content area shows an overlay, `--accent-soft` fill with a 1 px `--accent-mark` inset border (never dashed, F §7), "Drop files to add them to Knowledge". Dropping opens Add knowledge on Files with the files already uploading.

### 1.7 Add knowledge (`Dialog` md 560; lg 720 for the table step)

- **Header:** title "Add knowledge", description "Your agent can quote these on calls once they're indexed."
- **Source type:** `SegmentedControl` labelled "Source type": Files · Text · Web page (`?add=`). Radio semantics, arrow keys (fixes F-A11Y-016).
- **Footer:** why-text "Sources reach live calls as soon as they're indexed." (K4) · Cancel or Done (tertiary) · the type's primary. Closing the dialog never cancels uploads; progress continues in the table and, off the page, in a progress toast "Adding 3 sources… 1 indexed · View" (O §9.2).

**Files.** `Dropzone` (C §7.2) labelled "Knowledge files"; contract line "PDF, DOCX, TXT or CSV · up to 10 MB each · up to 20 files" (limits from the server). Uploads start on add; each file row walks the status sentences above live, so the user sees "Indexed · 42 passages" without leaving the dialog. The title defaults to the file name without its extension. No primary button in this mode: the footer shows **Done** (secondary). A duplicate (same content hash) gets a row warning: "Already in Knowledge as 'Price sheet (Sep)'. **Replace it** · **Add anyway**".

**Table step** (a CSV was added; the file row shows "Table · 200 rows · **Choose how to read it**"; the dialog body is replaced, size lg, one modal at a time, O §1.6):
- Title "How should the agent read 'Unit inventory.csv'?"
- `RadioGroup variant="card"` (C §6.2): **Row by row** (default; "Best for price lists, inventories and directories. Each row becomes one passage.") · **As plain text** ("The whole file is read as one document.").
- Row by row: **Columns to include** (Checkbox group listing each header with a sample value, all on), **Name each row by** (Select, first text column by default).
- **Preview** (TablePreview, new §3): the first 5 rows exactly as passages, e.g. "Tower B 2BHK: Size 1,150 sq ft · Price ₹85 L · Floor 7".
- Errors: "The first row should hold column names, like Tower, Type and Price." · "This table has 25,000 rows. Split it into files of 5,000 rows or fewer." (limit from the server).
- Footer: Back (tertiary) · **Add 200 rows** (primary).

**Text.** Field "Title" (TextInput, required, max 100, hint "Shown in the sources list and in call reports when the agent quotes it") · Field "Text" (Textarea, rows 8, maxRows 16, soft count "1,240 of 50,000", placeholder "Paste product details, FAQs, policies or scripts…"). Primary **Add text**. A dirty dialog uses the inline discard state (O §2.5).

**Web page.** Field "Page address" (TextInput `type="url"`, `httpsUrl` validation on blur: "Enter a full address starting with https://."; placeholder "https://yourcompany.in/pricing…"; hint "We read this one page, not the whole site. Re-fetch it from the source's menu when the page changes.") · Field "Title (optional)" (defaults to the page title). Primary **Add page**. The row then shows Reading… while the page is fetched.

### 1.8 Source sheet (`Sheet variant="record"`, 440)

- **Header** (O §4.2): title = source name (`translate="no"`); meta "PDF · 12 pages · added 21 Sep 2026 by Anika R."; Previous / Next source (J / K in tooltips), Copy link, ⋯ (the row menu), Close.
- **State line** under the header: `StatusTag` lg + the status sentence. When failed, an inline danger `Notice`: lead sentence = the reason; action = the fix ("Replace file…", "Paste the text instead", "Retry").
- **PanelTabs** (`?tab=`): **Overview** · **Passages** (KB7) · **Used by** (KB3).
  - *Overview:* `KeyValueList` inline: Status · Passages 42 · Type PDF, 12 pages · Source (original file name, the page address as an `external-link`, or "Pasted text") · Fetched (web pages) · Added · Last indexed · Languages (LanguageMark per detected language; row hidden when detection is unavailable). Actions: secondary **Test with this source** (sets the Test scope and focuses the question) and, only when failed, tertiary **Retry**.
  - *Passages:* numbered passages, each "Passage 4 · page 2" (`meta-12` `--text-3`) over the text in `read-15` (`lang` set; Devanagari in `read-15-deva`), clamped to 6 lines with "Show more"; a `SearchInput` "Find in passages…"; a small Pager. For "Answers from calls", each answer has Edit… and Remove (Undo).
  - *Used by:* flows that reference the source, each "Site-visit qualifier · Live v7 · step 5, Knowledge lookup · **Open in flow**", then "2 flows look up all sources" with their names; then "Quoted on 18 calls in the last 7 days · **Open in Call reports**" (`/call-reports?f.source=<id>&range=7d`), from TurnRow source notes (N §12.4), hidden until that data exists.
- No footer: the sheet has no everyday action beyond Test, and Delete lives in ⋯ (O §4.2).

### 1.9 Test a question

Docked at ≥1440 (440, `<aside aria-labelledby>`), a non-modal overlay sheet at 1024–1439, the "Test" pane below 1024. Everything in it is Standard density.

| Part | Spec |
|---|---|
| Header | `title-16` "Test a question"; Close IconButton (at ≥1440 closing collapses the dock and brings back the header's "Test a question" button; the choice is remembered per user) |
| Scope | `Select` labelled "Search in": **All sources** (default) or one source (a `Combobox` above 10 sources). Mirrors the Knowledge lookup step's own setting |
| Question | `TextInput` labelled "Question", placeholder "Ask the way a caller would…", hint "Hindi, English or Hinglish. Uses the same search as live calls." `enterkeyhint="search"`; Enter submits. `Button` secondary **Search** (the panel has no primary: the page's one Neel button stays "Add knowledge") |
| Verdict | `StatusText` md, computed against the live lookup threshold (KB4): success "Would answer from 3 passages" · warning "Only weak matches. The agent may say it doesn't know." · neutral "Nothing matched well enough. A Knowledge lookup step would take its Not found path." with **Add an answer…** (opens Add knowledge › Text, title prefilled with the question) |
| Results | Up to 5 `RetrievalResult` rows (new, §3): rank · source name as a link (opens the source sheet) · location ("page 2", "row 14", "passage 3") · a 4-step `Meter` + word (Strong / Good / Weak match; score and threshold in the tooltip, "Score 0.82 · calls use 0.70 and above") · the passage in `read-15`, 4 lines then "Show all" |
| Below threshold | After a divider, collapsed: "2 more below the match threshold (not used on calls)" (Radix Collapsible, `aria-expanded`) |
| Caveat | While any source in scope is indexing: neutral StatusText "1 source is still indexing. Results can change when it finishes." |
| Unanswered on calls (KB5) | Section `title-14` "Unanswered on calls · last 7 days": up to 5 questions with the language name (LanguageMark `name`), the question text and "asked 4 times", each with **Try it** (fills and runs) and **Add an answer…**; link "See these calls in Call reports" |
| Errors | `InlineError` directly under the question field, `role="alert"`: "Couldn't search. Check your connection and try again. **Retry**" (fixes F-UX-019, EXPLORE-DATA-18) |

The last question and scope live in the URL (`?test=&scope=`), so a teammate can open the same test from a shared link.

### 1.10 Proposals (`/knowledge/proposals`, admins only)

Answers suggested from calls ("Learn from this call" in Call reports, inferred today; 01-product-understanding part 5 row 12). Every answer the agent will speak is read by a person first, so there is no bulk add.

- **Header:** the same PageHeader (H1 "Knowledge"), RouteTabs on "Proposals"; meta "3 pending · from calls in the last 30 days".
- **ViewTabs:** Pending 3 · Added · Dismissed.
- **Table** (`DataTable`, flush): Question (key, 48ch) · Proposed answer (`--text-2`, 48ch) · From call ("Today 10:42 am · 2m 14s", a link to the call) · Language (the name, LanguageMark `name`) · Suggested by ("Vaani" or a teammate) · actions **Review** (the row's verb) and ⋯ (Dismiss). BulkBar: count · **Dismiss n** · Clear.
- **Review sheet** (`record`, docked at ≥1440), title "Proposal", meta "From a call today at 10:42 am · suggested by Anika R.":
  - Field "Question" (TextInput) and Field "Answer" (Textarea; hint "Your agent may read this out on calls. Keep it short and factual.").
  - "Where it came from": 2–4 `TurnRow`s around the moment (N §12.4); timecodes open the call at that point (`/call-reports?call=<id>&t=01:12`).
  - "Already in knowledge": the top 2 RetrievalResults for the question, with the verdict ("Probably covered by 'Site visit FAQ' · Strong match"), so duplicates are caught before they are added.
  - Field "Add to" (Select): **Answers from calls** (a managed Text source, created on first use) or any Text source.
  - Footer: **Dismiss** (tertiary) · **Add to knowledge** (primary, ⌘/Ctrl+Enter). After adding: toast "Added to 'Answers from calls' · Undo", the next pending proposal opens, and "Added. 2 proposals left." is announced.
- **Empty (Pending):** EmptyState `done`: "No proposals waiting. Answers suggested from calls appear here for you to review."
- **Members:** no tab. A direct visit renders `Forbidden` inside the shell (O §16.1): "Only organization admins can review proposals." · "Ask an admin (2 in this workspace) to review them for you." · Copy request link · Go back. Never a redirect to the Cockpit.
