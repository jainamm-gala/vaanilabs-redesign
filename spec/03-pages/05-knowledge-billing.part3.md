### 1.11 How knowledge works (`Popover`, info variant, 400)

Opened from the header's tertiary "How knowledge works" (icon-only with tooltip below 1280). It replaces the green 11 px mono card with seven steps and three vendor names (F-UX-016, F-A11Y-008). The same numbered list appears under the first-use EmptyState.

1. Add sources: files, pasted text or a web page.
2. Each source is split into short passages (a paragraph, or one table row) and indexed. Most are ready in under a minute.
3. On a call, a **Knowledge lookup** step searches your passages for the caller's question. The agent answers from the best matches, and the call report shows which source it used.
4. If nothing matches well enough, the step takes its **Not found** path.
5. Only this workspace's sources are searched. Changes reach live calls as soon as indexing finishes.

Footer link: "Knowledge lookup in Flows" (docs, same tab).

### 1.12 States

| State | Sources region | Test a question | Copy and behaviour |
|---|---|---|---|
| **First use** (0 sources) | `EmptyState` first-use in the table region; FilterBar hidden; meta "No sources yet" | EmptyState compact | Title "Teach your agent what it can say" · body "Add documents your agent can quote on calls." (O §15.3) · secondary **Upload files** · link "Paste text or add a web page" · the 5-step list from §1.11 below |
| **Loading** | H1 at once; meta skeleton; `TableSkeleton` with the real header; pager "Loading…" | Renders at once (it needs no list) | Skeleton after 200 ms, never "0 sources" (F-UX-030) |
| **Partial** (some indexing or failed) | Rows show their own sentence; section Notice when ≥ 1 failed; meta "· 1 indexing" | Caveat line while any source in scope is indexing | Notice: "**1 source couldn't be indexed.** Callers get no answers from it. **Show it**" |
| **No results** | EmptyState no-results | – | "No sources match 'brochure'." · "Search looks at source names. To search inside sources, use Test a question." · Clear search |
| **Filtered to nothing** | EmptyState filtered | – | "No sources match Status: Couldn't index." · "14 sources are hidden by filters." · Clear filters |
| **Error, first load** | danger Notice in the table body, `role="alert"` | Works (independent) | "Couldn't load sources. Check your connection and try again." · Retry |
| **Error, refresh** | warning Notice above the table; rows stay | – | "Showing sources from 11:24 am. Couldn't refresh." · Retry |
| **Offline** | `ConnectionBar`; rows stay | Search `aria-disabled`, reason "You're offline" | Add knowledge `aria-disabled` with "You're offline"; uploads in progress show "Waiting for connection" and resume if the upload is resumable, else "Couldn't upload · Retry" |
| **Permission** | Proposals: `Forbidden` (§1.10). If a role cannot add or delete sources (open question 6): Add knowledge `aria-disabled` with "Only admins can add knowledge. Ask Anika R."; Delete hidden from ⋯ | – | Never hidden silently when it is the page's main action; the reason is visible |
| **Success** | The row's sentence changes to "Indexed · 42 passages"; for sources added in this session, announce politely "Price sheet (Sep) indexed, 42 passages." | Verdict line | Off the page: the progress toast turns into "3 sources added · View" (O §9.2) |
| **Record gone** | Source sheet: EmptyState compact "This source was deleted, or you no longer have access." + Close (O §4.3) | – | |

**Test a question, own states:** idle (field, recent questions list on focus, stored per user with try/catch) · searching (Search shows "Searching…", results `aria-busy`, three RetrievalResult skeletons after 200 ms) · results · weak only · nothing matched · error (InlineError under the field) · offline · no sources (compact empty).

### 1.13 Interactions and keyboard

| Key | Where | Does |
|---|---|---|
| `/` | Page (single-key switch on) | Focus "Search sources" |
| `↑` `↓`, `J` `K` | Table | Previous / next row; with a sheet open, the sheet follows |
| `Enter` | Row | Open the source sheet (docks at ≥1440) |
| `Space` or `X` | Row | Toggle selection |
| `Esc` | Sheet / search / dock | Close the sheet and return focus to the row · clear the search · (dock stays) |
| `F6` | Page with a dock or sheet | Move focus between the table and the docked panel or sheet (O §1.3) |
| `Enter` | Question field | Run the test |
| `⌘/Ctrl+Enter` | Proposal sheet | Add to knowledge |
| `Shift+D` | Table | Standard / Compact |
| `?` | Page | Shortcut sheet |

No single key adds, deletes or re-indexes anything. The command palette (O §8) lists "Add knowledge…" and "Test a question", and finds sources under its Knowledge group with the status sentence as row meta. Dragging files is an enhancement; "Choose files" is always the address (P5).

**Motion:** status sentences change in place (no animation); ProgressBars move with `transform: scaleX()` over `--dur-base`; the dock appears in one frame (docked sheets do not slide, O §4.7); overlay sheets slide over `--dur-slow`, fade only under reduced motion. No shimmer, no pulsing "processing" dots.

### 1.14 Microcopy (before → after)

| Before (live today) | After |
|---|---|
| AGENT KNOWLEDGE | Knowledge |
| KNOWLEDGE FILES 5 · SUPPORTED DOCS PDF, CSV… · AI INTEGRATION Embeddings → RAG-powered voice agent | Header meta "14 sources · 612 passages · 1 indexing"; types move to the Dropzone contract line |
| Upload Knowledge. "Content is chunked, embedded with Gemini, and indexed for real-time AI retrieval." | Add knowledge. "Your agent can quote these on calls once they're indexed." |
| Upload Files · Paste Text · Website URL · CSV Data | Files · Text · Web page (a CSV is read inside Files) |
| Choose file / No file chosen | Drag files here or **Choose files** |
| Upload & Embed · Save & Embed · Fetch & Embed | (files start on add) · Add text · Add page |
| Document title (optional) | Title |
| Embed (on every row, teal) | Nothing on healthy rows; on a failed row, its fix (Retry, Replace file…) first in ⋯ |
| 1789987752864-….pdf | The original name, e.g. "Price sheet (Sep)" |
| 21/09/2026, 16:19:12 | Today 4:19 pm · 21 Sep 2026 |
| Test Knowledge Search. "Uses the same vector search as live calls." | Test a question. "Uses the same search as live calls." |
| Ask a question to test knowledge retrieval… | Ask the way a caller would… |
| Search failed — check network connection | Couldn't search. Check your connection and try again. Retry |
| How Knowledge Integration Works (7 steps: Gemini text-embedding-004, 768-dimensional vectors, pgvector) | How knowledge works (5 plain steps, §1.11) |
| Review proposals (shown to members, then redirect) | Proposals 3 (admins) · Forbidden page for members |
| Page 1 of 1 · 1–5 of 5 files · PER PAGE 20 | 1–5 of 5 sources · Rows per page 50 |

### 1.15 Accessibility

- **Structure:** one H1; the table is labelled by it with a hidden caption ("Sources, sorted by updated, newest first"); the dock is `<aside aria-labelledby="test-title">`; source sheets are non-modal dialogs at ≥1024 and modal below (O §4.5).
- **Names:** row checkbox "Select Price sheet (Sep)"; ⋯ "More actions for Price sheet (Sep)"; the menu's fix item names the source ("Retry indexing Possession timeline"); type icons carry a hidden type word (F-A11Y-024).
- **Upload:** the Dropzone's Choose files button is the tab stop; the hidden input is labelled "Knowledge files" (fixes the axe `label` critical, F-A11Y-003); per-file uploads and indexing are announced at start, completion and failure only; rejections are announced once as a summary (C §7.2, O §14.2).
- **Status:** always a word plus an icon (F-A11Y-019); progress values are not announced between 25/50/75%.
- **Test:** the verdict is a polite live region announced once per search; results are an `<ol aria-label="Matching passages">`; each Meter is `role="img"` with "Strong match, score 0.82"; passages carry `lang` (Devanagari at 15/26).
- **Focus:** header actions → RouteTabs → SegmentedControl → Notice action → FilterBar → table (one tab stop, N §7.9) → pager; F6 reaches the dock. Forbidden and PageError move focus to the H1.
- **Contrast and size:** tokens only, so the 38 of 88 failing text nodes (F-A11Y-008) disappear with the 12 px floor and `--text-3` (≥ 4.70:1 on every plane).
- **Touch:** Touch density on coarse pointers; ⋯ always visible; Dropzone shows only "Choose files".

### 1.16 Responsive summary

| | ≥1440 | 1280–1439 | 1024–1279 | 768–1023 | 320–767 |
|---|---|---|---|---|---|
| Header actions | ⓘ label · Add | ⓘ label · Test · Add | ⓘ icon · Test · Add | meta · ⋯ · Add | meta · ⋯ · Add |
| Test a question | docked 440 | overlay 440 | overlay 440 | "Test" pane | "Test" pane |
| Table | P1–P2 (+P3 at 1920) | P1–P3 | P1–P2 | P1, pinned key and ⋯ | ListRow |
| Source sheet | docked (swaps with Test) | overlay | overlay | modal, full height | full screen, Back link |
| Add knowledge | Dialog md / lg | same | same | Dialog md centred | full-screen dialog, sticky footer |
| Proposals review | table + docked sheet | overlay sheet | overlay sheet | modal sheet | ListRow + full-screen sheet |

### 1.17 Telemetry (optional)

No file names, source text or question text leave the client in analytics; questions are logged by length and detected language only.

| Event | Properties | Answers |
|---|---|---|
| `knowledge_add_opened` | entry: header · empty · drop · palette · test_answer · proposal | Which paths people use to add |
| `knowledge_source_added` | type, size bucket, table rows bucket | Mix of sources |
| `knowledge_source_state` | state (indexed · failed), reason code, ms to indexed | Indexing health; which failures to fix first |
| `knowledge_test_run` | scope (all · one), results above threshold, verdict, ms | Whether knowledge answers real questions |
| `knowledge_answer_added_from_test` | – | The test → fix loop working |
| `knowledge_proposal_decided` | decision (added · dismissed), edited (bool) | Quality of proposals |
| `knowledge_source_deleted` | used-by count, tier | Risky deletes |
| `forbidden_view` | route | Hidden entries still reached by URL |

### 1.18 Acceptance criteria (Knowledge)

- [ ] H1 is "Knowledge" and `<title>` is "Knowledge · Vaani Labs"; no uppercase, tracked or mono labels on the page.
- [ ] No source name starts with a 13-digit prefix; names come from the server title or the original file name.
- [ ] Every row has exactly one status sentence with a word and an icon; there is no routine "Embed" or "Retry" button; a failed row's fix is the first item of its ⋯ menu and the action of the sheet's Notice.
- [ ] A failed source shows its reason and a fix in the tooltip, the phone meta line and the sheet; the section Notice appears when ≥ 1 source failed and "Show it" sets `f.status=failed` in the URL.
- [ ] Delete exists only in ⋯ after a separator; an unused source deletes with an Undo toast; a used source opens a ConfirmDialog naming each flow and its Live version.
- [ ] axe reports no `label` violation on `/knowledge`; "Choose files" is reachable by Tab and opens the file picker with Enter.
- [ ] Adding a `.csv` opens the table step with a 5-row passage preview; nothing is indexed before "Add n rows".
- [ ] A search error renders directly under the question field with Retry; the verdict names the Found / Not found outcome in words; Scope lists All sources and each source.
- [ ] At 1440×900 the table (≥ 768 px wide) and the Test panel show together; at 1024 the panel is an overlay; at 768 and 375 a Sources / Test switch appears.
- [ ] At 768 and 390 the ⋯ column is visible without horizontal page scroll; at 360 the header does not overflow (F-RWD-016).
- [ ] A member never sees Proposals; visiting `/knowledge/proposals` as a member shows Forbidden inside the shell, focus on the H1, and no redirect.
- [ ] As an admin, adding a proposal shows an Undo toast and opens the next proposal; there is no bulk add.
- [ ] The banned-terms lint finds no Gemini, pgvector, embedding, vector, chunk or RAG in the page's strings.
- [ ] Reload, Back and a pasted link restore search, filters, sort, page, the open source and its tab, and the test question and scope.
- [ ] Light and dark pass `check-contrast.mjs`; no text renders below 12 px at any width.
