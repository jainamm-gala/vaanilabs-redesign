**Columns** (`meta.priority`, `meta.mobile`; all sortable except Captured and Language):

| Column | P | Cell | Empty value | Mobile slot |
|---|---|---|---|---|
| When | 1 | `formatWhen` in `<time>`, absolute date + IST in tooltip; pinned left ≥ 768 | never empty | meta (first) |
| Lead | 1 | key cell link: lead name (`translate="no"`), or the masked number when no lead exists; pinned left ≥ 768 | "Unknown caller" `text-3` (inbound without caller ID) | title |
| Outcome | 1 | one `StatusTag`: the Outcome step's label if one was written (domain `outcome`), else the Result (domain `call result`) | "No outcome" `text-3` | titleTrailing |
| Sentiment | 2 | `StatusTag` domain `sentiment`, `appearance="plain"` (§4.5): icon 14 in `text-3` + word in `text-2`, **no tint and no outline**, so Outcome stays the row's only tint (direction §6.4) | "Unscored" with `circle-dashed`, word in `text-3` | metaTrailing |
| Duration | 2 | right-aligned `formatDuration` of talk time | "–" + visually hidden "No talk time" | meta |
| Phone | 3 | `PhoneText` masked `+91 •••••• 4821` (tabular) | "Withheld" `text-3` | hidden |
| Direction | 3 | icon (`phone-outgoing` / `phone-incoming`) + word; plus an outline Tag "Test call" (`flask-conical`) or "Browser test" (`monitor`) when test calls are shown | – | meta (word only) |
| Flow | 3 | "Site-visit qualifier v7" (name `text`, version `text-3`), link to the flow at that version | "No flow" `text-3` (manual calls) | hidden |
| Language | 3 | `LanguageMark` `name` (plain text, no glyph tile, data-nav §5.6); mixed calls read "Hindi +1" with both in the tooltip | "–" | hidden |
| Captured | 4 | "Budget ₹85 L to ₹1 Cr · Day Saturday · +1", `32ch`, tooltip with all; on by default in Needs review | "Nothing captured" `text-3` | hidden |
| Summary | 4 | one line, `48ch`, full text in tooltip and sheet | "Not analysed yet" `text-3` | hidden |
| Result | 4 | StatusTag domain `call result` (shown separately only when the user adds it) | – | hidden |
| Cost | 4 | `formatMoney` (₹1.84), right-aligned; phone calls only | "Not billed" `text-3` when the server says so | hidden |
| Call id | 4 | `mono-12` + Copy IconButton on hover | – | hidden |
| Per-field captured columns | 4 | only when one flow version is filtered; header "Field · step n" when labels repeat; ColumnsMenu group "Captured by Site-visit qualifier v7"; "Empty in these results" group for all-empty fields | "Not captured" `text-3` | hidden |

At most 9 visible by default (direction §6.4). Column choices persist per user and per table id (data-nav §7.17).

### 2.6 The call detail sheet

`Sheet` variant `detail` (overlay §4): 560 px, docked at ≥ 1440 (a grid column from under the FilterBar to the Baseline; ViewSummary, table and pager stay in the left column), non-modal overlay at 1024–1439, modal full height at 768–1023, full screen below 768. `role="dialog"` without `aria-modal` when non-modal, labelled by its title. The body is the **only** scroll container (F-UX-010).

#### 2.6.1 Header (fixed, never scrolls)

| Row | Content and tokens |
|---|---|
| Title row (56) | Title `title-16` as `h2`: "{Lead name} · {When}" ("Meera S. · Today 10:42 am"; masked number when there is no lead), `translate="no"` on the name, truncated with a tooltip. IconButtons 32, right-aligned: **Previous call** (`chevron-up`, tooltip keycap K), **Next call** (`chevron-down`, J), **Copy link** (`link`), **⋯** (§2.6.4), **Close** ("Close call details", last). Below 768 the title row becomes "‹ Back to Call reports" + ⋯ and the title moves to the next row |
| Glance rows | Row 1: one `StatusTag` for the outcome, then sentiment as a plain StatusTag (icon + word, `text-2`, as in the table), then the call's LanguageMarks (one per language, P1). Row 2, `meta-12` `text-3`: "Outbound · 2m 31s · Site-visit qualifier v7 · recording disclosed at 00:01". Qualifier Tags `outline` when they apply: "Test call" or "Browser test" (the kind, `01-agent-cockpit` §1.1), "2 legs" on backfilled records (tooltip "Recorded as two legs. Counted once."), "Reviewed" |
| Summary line | The AI summary's first sentence, `body-14` `text-2`, clamped to 2 lines, with "Full summary" (link button, opens the Summary tab). "Not analysed yet" in `text-3` while analysis is pending |
| Tabs (40) | `PanelTabs` (automatic activation): **Transcript** · **Summary** · **Captured {n}** (count of captured fields), in `?tab=` |

#### 2.6.2 Transcript tab (default)

1. **RecordingPlayer** (data-nav §12.5), `position: sticky; top: 0` inside the body so it stays reachable while reading. Scrubber choice: TalkStrip when per-turn timing exists (B6), else Waveform from server peaks, else Track. The legend shows "Agent 58% · Caller 42% · 9 turns · 1 interruption" and "Recording disclosed at 00:01". `?t=` seeks on open. Speed menu 1×, 1.25×, 1.5×, 2× (remembered per user).
   - **Unavailable:** info Notice (inline), reason from B7: "No recording for this call. Recording is off for browser tests. The transcript is still available." / "…Recording was turned off for this flow." / "…The call didn't connect." The header and page never promise recordings that don't exist (F-UX-010).
2. **TranscriptFeed** mode `review` (data-nav §12.4): header "Transcript" `title-14` + "18 turns" `meta-12`; tools: Search (⌘/Ctrl+F while focus is in the sheet; "2 of 7" with previous and next), Copy transcript, `⋯` (Download .txt). Turn rows with the 56 px timecode gutter; timecodes are seek buttons ("Play from 00:41"); step links open the flow at that step and version; system rows for step moves, knowledge lookups and transfers; the playing turn uses the active treatment and "Follow playback" pinning.
3. **End row:** "Call ended · 02:31 · Outcome written: Visit booked" (`meta-12` `text-3`, `phone-off` 14).

#### 2.6.3 Summary and Captured tabs

**Summary** (`KeyValueList`, sections with `h3`):

| Section | Rows |
|---|---|
| Analysis | Sentiment (plain StatusTag) · Caller satisfaction (Low / Medium / High, word only) · Summary (stacked, full text, `body-14`) · Topics (up to 6 neutral Tags, then "+2") · Suggestions (a list of plain sentences, heading "Suggestions for this flow") · footer StatusText "Analysed 26 Sep, 10:45 am · Re-analyse call" |
| Call | Result · Outcome · Direction · Kind (Real call, Test call, Browser test) · Phone (masked `PhoneText`, **Reveal** link for permitted roles, logged in Activity & Audit) · Caller ID used · Flow (link, with version) · Voice (VoiceTile 28 + name) · Languages · Started ("26 Sep 2026, 10:42:07 am IST") · Talk time · Ring time · Cost ("₹6.04" + source note "₹0.04/s", or the rule the server returns, such as "Not billed · browser test") · Legs ("2 legs · counted once", tests only) · Call id (`mono-12` + Copy) · Recording ("Disclosed at 00:01" / "Off for browser tests") |

**Captured** (`KeyValueList` variant `rows`, title "Captured · 3 of 4"): one row per field the flow version defines, in step order. Key: field label, then `meta-12` "step 3" when labels repeat. Value: the captured value, then the source note "at 00:52 · Ask about budget" as a seek link (`?t=52`, switches to the Transcript tab and plays from there). Missing fields read "Not captured". Captured values and "Not captured" come from **one source** (the flow run log), so they can never contradict each other (F-UX-010). A final row states side effects: "Lead status set to Interested by the Outcome step"; on test kinds it reads "Test calls don't change the lead." (`01-agent-cockpit` §1.1 rule 5).

#### 2.6.4 Footer and menus

- **Footer** (sticky, 56, `surface`, top hairline): `Call back…` (secondary, `phone` icon) opens the **Call gate** popover for this call's lead and never dials (P3); disabled reasons come from the gate's blocking checks ("Wallet is ₹0. Top up to place calls.", "On the DND list", "Outside calling hours. Opens 10 am IST."). Then the **review action** (secondary, `check`; its tooltip shows the shortcut ⌘/Ctrl+Enter, the label never does), which depends on the view (B5; hidden until B5 ships):
  - **In Needs review: `Mark reviewed and next`.** It marks this call reviewed, opens the next unreviewed call of the review run (below) and moves focus to that call's title (`h2`, `tabindex="-1"`). The polite region says "Marked reviewed. Call 2 of 9, Pranav I. 8 left to review."
  - **In every other view: `Mark reviewed`.** It marks the call and stays on it; the button becomes the StatusText "Reviewed by you · 11:42 am · Undo".
  - **On a call that is already reviewed** (by you earlier in the run, or by a colleague): the StatusText "Reviewed by Dev S. · 11:40 am" (plus "Undo" when it is your own review, or you are an admin), and in Needs review a secondary **`Next unreviewed call`** in the button's place.

  `Open lead` (tertiary link, `/leads?lead={id}`), hidden for unknown callers. No primary and no destructive action in the footer: the review action is reversible, and a filled Neel button in a sheet beside the table would compete with the table (P7).
- **The review run** (how Needs review is worked through; the same rules hold in any view where someone steps through calls in the sheet):
  1. **Snapshot.** Opening the sheet takes a snapshot of the current results: the ordered call ids for the view, search, filters and sort at that moment. The client keeps the query plus an `as_of` timestamp and sends `as_of` with every page it fetches, so the server returns the same order and membership. Previous and Next (the header chevrons, `K`/`J`) and "and next" walk this snapshot, across page boundaries. Reviewing a call never removes it from the snapshot, and calls that arrive later never enter it, so "Call 4 of 9" keeps its meaning.
  2. **The reviewed row stays where it is.** In the table, a call reviewed during this visit keeps its position and height. Its actions cell shows the outline Tag "Reviewed" (`check`, domain `review`, §4.5) followed by a link button **Undo** (accessible name "Undo review of the call with Meera S. at 10:42 am"). Nothing reflows, nothing fades and no row is dimmed. The row leaves Needs review only when the view is refreshed or re-entered: Refresh, a view, filter, sort or page change, "Show" on new calls, or a reload.
  3. **Counts move at once.** The Needs review tab count, the header meta ("8 need review") and the ViewSummary decrement optimistically when the request is sent, and are reconciled with the server's response. Undo increments them again. The ViewSummary adds the fact "· 1 reviewed just now" while the snapshot holds, so the rows on screen (9) and the count (8) visibly reconcile. The result count ("9 of 212") and the pager keep describing the snapshot until the view is refreshed.
  4. **"Next" is the next unreviewed call after this one in the snapshot**, skipping calls that were reviewed meanwhile (by you or by a colleague; the server reports review state each time a call opens). Past the last call it continues from the first call you skipped.
  5. **End of the run.** When no unreviewed call is left in the snapshot, the sheet header title reads "Needs review" (Previous, Next and Close stay) and the body shows a compact all-done state in place of a call: `check` 24 in `text-3`, title "All 9 calls reviewed", body "They leave Needs review when you refresh the view.", and a secondary **Back to Call reports**, which closes the sheet and returns focus to the last reviewed row. The footer is hidden. If you reached the end by skipping calls, the title is "End of the list", the body "1 call still needs review.", the action **Open it** (secondary) and **Back to Call reports** (tertiary).
  6. **Undo** lives in two places: the row's Undo, and the footer StatusText when you step back to the call (`K` or the up chevron). There is no Undo toast, so working through nine calls never stacks nine toasts.
  7. **Failure.** If marking fails, the counts revert, the sheet does not advance, and an InlineError above the footer says "Couldn't mark this call as reviewed. Retry"; focus stays on the review action.
  8. **Cost per call:** one action (⌘/Ctrl+Enter or one click), instead of three (mark, find the next row, open it), and the list never moves under the pointer.
- **⋯ menu** (Menu, overlay §7): Copy call id · Copy link at 00:41 (current player time) · Re-analyse call · Download transcript (.txt) · Download recording… (roles per open question Q5; confirms that numbers stay masked and that the download is logged) · Export call (CSV) · separator · Suggest knowledge from this call… (opens a small Dialog: the passage to propose, pre-selected from the transcript, and "Admins review suggestions in Knowledge › Proposals"). There is no delete.
- **Re-analyse call** runs in place without a dialog (it replaces the analysis; the previous one is kept server-side for 30 days, open question Q6). The Summary tab shows StatusText "Re-analysing… · about 20 s", the button is busy, and the result arrives as a toast only if the user has left the tab: "Analysis updated · sentiment changed from Neutral to Negative".

#### 2.6.5 Export popover (page header `Export…`)

A Popover (overlay §5), 400 wide, titled "Export 38 calls" (the current result count): Format SegmentedControl **CSV | XLSX**; Columns RadioGroup **Visible columns** / **All columns, including captured fields**; Checkbox **Include transcripts** (helper "Adds one text column. Large files take longer."); the note "Phone numbers stay masked. Exports are logged." (`meta-12` `text-3`); primary `Export 38 calls`. Up to 5,000 rows download directly; above that a progress toast "Preparing export… 12,480 calls" becomes "Export ready · Download" (link valid 1 h). Disabled with reason when the view is empty: "Nothing to export in this view."

### 2.7 States (with copy)

| State | Trigger | Treatment and copy |
|---|---|---|
| **First use** | The workspace has no calls at all | FilterBar, ViewSummary and pager hidden; views show counts of "0" only because the server says 0. EmptyState first-use in the table body: icon `file-text`, title "No calls yet", body "Calls appear here after your agent places or answers one, with the transcript, summary and what was captured.", action `Place a test call…` (secondary, opens the Cockpit Ready-to-call card with Talk in browser selected), link "How call reports work" |
| **Loading (first)** | Route entry | Shell, header H1, views (count skeletons), FilterBar and real table header render at once; after 200 ms `TableSkeleton` rows fill the height; ViewSummary shows skeleton bars; pager "Loading…"; `aria-busy` and "Loading calls…" in the polite region. Never "0 calls" (F-UX-030) |
| **Refreshing** | Sort, filter, page or view change | Rows stay; result count, ViewSummary and pager read "Updating…"; no dimming or spinner |
| **New calls arrived** | Background poll every 60 s while the tab is visible | Rows do not jump. The header meta gains "· 3 new calls · Show" (link button); Show reloads page 1. Announced once, politely: "3 new calls" |
| **No results (search)** | `q` set, nothing matches | EmptyState no-results: "No calls match “site visit”." / "Search covers lead names, the last digits of numbers, summaries and transcripts." / `Clear search` |
| **Filtered empty** | Filters or view exclude everything | "No calls match Negative in the last 7 days." / "212 calls are hidden by filters." / `Clear filters` (keeps the view) |
| **View done** | Needs review is empty | EmptyState all-done: `check`, "Nothing needs review.", "Calls with negative or mixed sentiment, a failed result or no outcome appear here." |
| **Partial: stats failed** | B2 errors, rows load | ViewSummary: "Couldn't load totals · Retry" (`text-3`, link button); view counts show "–"; the table works |
| **Partial: analysis pending** | Call ended < ~1 min ago | Sentiment cell "Unscored" (plain, `text-3`) with tooltip "Analysis in progress"; sheet summary line "Analysing this call…"; row updates in place when done |
| **Partial: no per-turn data** | B6 missing for a call | Player uses Waveform or Track; turn LanguageMarks hidden; header shows the call's languages once |
| **Error (first load)** | `/api/calls` fails | Danger Notice in the body (`role="alert"`): "Couldn't load calls. Check your connection and try again." + `Retry`; Details disclosure with the error id |
| **Error (refresh)** | A later request fails | Warning Notice above the table (`role="status"`): "Showing results from 11:24 am. Couldn't refresh." + `Retry`; rows stay |
| **Sheet: loading** | `?call=` resolving | Sheet header shows the title from the row if known; `SheetSkeleton`; tabs real |
| **Sheet: section failed** | Transcript or analysis request fails | SectionError in that tab: "Couldn't load the transcript. Retry"; other tabs work |
| **Sheet: call gone** | Deep link to a deleted call or one outside the user's access | Compact EmptyState in the sheet: "This call was deleted, or you no longer have access." + Close |
| **Sheet: not in results** | Filters change while a call is open | Sheet stays; neutral Notice at the top of its body: "Not in the current results. Clear filters" (overlay §4.3). The review-run snapshot is retaken from the new results, so Previous and Next walk what the table now shows |
| **Review run: call reviewed** | Mark reviewed (and next) during this visit | The row stays in place with the outline Tag "Reviewed" and **Undo** in its actions cell; Needs review count, header meta and ViewSummary drop by one at once; the row leaves the view on refresh or re-entry (§2.6.4) |
| **Review run: already reviewed** | The opened call was reviewed by a colleague since the snapshot | Footer StatusText "Reviewed by Dev S. · 11:40 am"; in Needs review the action reads **Next unreviewed call**; "and next" skips such calls |
| **Review run: end** | No unreviewed call left in the snapshot | Sheet body: `check`, "All 9 calls reviewed", "They leave Needs review when you refresh the view.", **Back to Call reports** (focus returns to the last reviewed row). With skipped calls: "End of the list" · "1 call still needs review." · **Open it** · Back to Call reports |
| **Review run: couldn't save** | The review request fails | Counts revert; the sheet stays on the call; InlineError above the footer "Couldn't mark this call as reviewed. Retry"; the row shows no Reviewed tag |
| **Offline** | ConnectionBar offline | Data shows "Showing data from 11:42 am"; search, filters, paging and Re-analyse are `aria-disabled` with "You're offline"; the player shows "Recording needs a connection." unless already buffered; open transcripts stay readable |
| **Permission: page** | Role without call access (open question Q4) | `Forbidden` inside the shell: "Only admins and team leads can see call reports. Ask Anika R. for access." |
| **Permission: action** | Member on Download recording or Reveal | The menu item is shown `aria-disabled` with "Admins only" (so people know it exists); Reveal is hidden |
| **Success** | Mark reviewed · Re-analyse · Export · Suggest knowledge | In place: "Reviewed by you · 11:42 am · Undo" (in Needs review the sheet moves to the next call and the row carries "Reviewed · Undo"); "Analysed 26 Sep, 10:45 am"; toast "Export ready · Download"; toast "Suggestion sent. An admin reviews it in Knowledge." No green banners, no exclamation marks |
| **Stale call** | A call stuck in queued or in progress past the reaper window | Result "Timed out" (warning tag, `clock`), sheet notice "No update since 28 Aug, 11:45 pm. The call probably didn't connect." (F-QA-037) |
| **Long call** | > 500 turns | Transcript virtualises (data-nav §12.4); search still covers every turn (server) |
