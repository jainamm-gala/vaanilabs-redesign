
---

## 12. Spinner

**Purpose.** Say "this specific thing is working right now" for waits under about 5 s: a button that submitted, a save chip, a Retry, a row that is refreshing.
**Never** for page or region loads (Skeleton), never full-screen (F-QA-007, F-UX-030), never on its own for more than 1 s without a word, never decorative. Today's Cockpit "STANDBY" ring and dashed idle icons are not spinners and are removed (F-VIS-029, F-FLOW-003).

### 12.1 Values

| Size | Token | Where |
|---|---|---|
| `sm` | `--icon-sm` 14 | Save chip, StatusText sm, palette rows, menus |
| `md` | `--icon-md` 16 | Buttons (replaces the leading icon), toasts, list rows |
| `lg` | `--icon-lg` 20 | A region's inline "Loading…" when a skeleton cannot mirror the layout (rare) |

- Glyph: Lucide `loader-circle` (a 3/4 arc), stroke `--icon-stroke`, `currentColor` (inherits the text colour of its context, so it is `--on-accent` inside a primary button).
- Rotation: linear, one turn per `--dur-spin` (800 ms). A spinner exists only while a user-started request is in flight (foundations §11).
- **The one sanctioned loop besides the live dot and audio meters:** a spinner is bound to a real in-flight request and unmounts the moment it settles, so it is never idle motion. Under reduced motion it is a static arc (base.css caps iterations) and the adjacent word carries the state.
- Delay: inside a clicked button it appears at once (it confirms the click); everywhere else only after `--timing-skeleton-delay`.
- ARIA: the SVG is `aria-hidden`; the text ("Saving…") or `aria-busy="true"` on the region carries meaning. A button that is working keeps its accessible name and adds `aria-busy="true"`.

```tsx
<Spinner size="sm" | "md" | "lg" />   // decorative only; pair it with text
```

**Resolves:** F-QA-007, F-UX-030 (no full-screen spinner), F-A11Y-022 (loops stop under reduced motion), F-FLOW-003 (the dashed idle icon).

---

## 13. Skeleton

**Purpose.** Hold the shape of content that is loading so the page does not jump, and never show `0` or placeholder copy as if it were data (F-UX-030, F-FLOW-037, F-UX-015).

### 13.1 Rules

- **The shell never loads.** Sidebar or rail, page header (H1 and static meta), view tabs, toolbar and Baseline render immediately from the layout. Only data regions skeletonise (F-QA-007).
- **Static fill** `--skeleton` (`--surface-3`), radius `--radius-2` for text bars, the real element's radius for blocks. **No shimmer, no pulse** (anti-pattern 4).
- Appears after `--timing-skeleton-delay` (200 ms); once shown, stays at least `--timing-skeleton-min` (400 ms) so it does not flicker.
- Text bars sit centred in the line box of the text they stand for:

| Stands for | Line box | Bar height |
|---|---|---|
| `meta-12`, `label-12` | 16 | `--space-8` |
| `data-13`, `label-13`, `body-14` | 20 | `--space-10` |
| `title-16`, `body-16` | 24 | `--space-12` |
| `title-20` | 28 | `--space-16` |
| `num-28` | 32 | `--space-20` |

- Bar widths vary deterministically per row (72%, 48%, 64%, 56%, …) so the block reads as text, not stripes.
- **Never fake data:** chart skeletons show empty axes and gridlines, not invented bars or curves; a KPI keeps its label and skeletons only its number (P1).
- ARIA: the region gets `aria-busy="true"` and one visually hidden polite line ("Loading leads…"). Skeleton shapes are `aria-hidden`.

### 13.2 Layouts

| Layout | Shape |
|---|---|
| **Table** (Leads, Call reports, Knowledge, Invoices) | Real sticky header with real column names; rows at `--row-h` filling the viewport; checkbox column a 16 px (`--icon-md`) block at `--radius-4`; key column bar at ~60%; numeric columns right-aligned short bars; tag columns a `--size-tag` tall block at `--radius-4`; pager text "Loading…" (no fake "0 of 0") |
| **List item** (phone Leads and Call reports) | `--row-h` 48 rows: line 1 bar 55% + tag block right; line 2 bar 70% `--space-8` tall |
| **KPI tile** | Real label; number block `--space-20` × 40%; delta hidden |
| **Sheet** | Header title bar + meta bar; real tabs; three field rows (label bar 30% over a value bar 60%) and one paragraph of 3 bars |
| **Transcript** (turn rows) | Mono gutter block `--space-40` wide; speaker bar `--space-10` × 20%; two `read-15` bars; caller turns on `--surface-2` like real turns |
| **Flow canvas** (F-FLOW-037) | Real header with the flow name if known; SaveState and VersionChip hidden; canvas dot grid; four static silhouettes in `--skeleton`: a Trigger capsule, a Logic rectangle with two answer-row bands, an Action rectangle, an Outcome capsule; no edges, no text; editing and autosave stay off until the flow has hydrated (F-FLOW-002) |
| **Form** (Settings) | Label bar `--space-10` × 20% over a `--control-h` block at `--radius-6`, repeated at `--space-field-gap` |
| **Chart** | Axis line and 4 gridlines in `--chart-grid`; no bars |
| **Cockpit Ready card** | Form layout inside the card; the Place call button renders disabled with "Checking readiness…" |

### 13.3 React

```tsx
<Skeleton.Line role="data-13" width="64%" />     // role picks the bar height from the table above
<Skeleton.Block width="var(--icon-md)" height="var(--icon-md)" radius="var(--radius-4)" />
<TableSkeleton columns={columns} rows="fill" />  // columns carry align + kind (text | number | tag | check)
<ListSkeleton />  <KpiSkeleton label="Calls" />  <SheetSkeleton />  <TranscriptSkeleton />
<CanvasSkeleton />  <FormSkeleton fields={5} />  <ChartSkeleton />
const show = useDelayedFlag(isLoading, { delay: 200, minVisible: 400 });   // numbers from tokens.json
```

In the App Router each data region is a Suspense boundary with its skeleton as the fallback; `app/(app)/layout.tsx` keeps the shell mounted across routes.

**Resolves:** F-UX-030, F-QA-007, F-VIS-023, F-FLOW-037, F-UX-036 (loading "0 calls analysed"), F-UX-015 (DID card flash).

---

## 14. Progress

### 14.1 RouteProgress

A 2 px (`--space-2`) bar across the top of the main column, fill `--accent-mark`, no track. It appears only if a client navigation takes longer than `--timing-skeleton-delay`, advances in steps toward 90% (never loops), completes to 100% and fades over `--dur-fast`. `aria-hidden`: the route change itself is announced by updating `<title>` and the polite region ("Leads") (F-A11Y-013). Reduced motion: it appears without advancing and disappears on completion. Fixes the 0.8–1.2 s of silence after a sidebar click (F-UX-030, F-QA-007).

### 14.2 ProgressBar

| Part | Value |
|---|---|
| Label row | label `--type-label-13` `--text` left; value `--type-meta-12` `--text-3` right, tabular ("42% · 3.1 of 7.4 MB") |
| Track | height `--space-4`, `--radius-2`, `--surface-3` |
| Fill | `--accent-mark` (01-foundations §3.2: non-text Neel indicators); animated by `transform: scaleX()` over `--dur-base` |
| Error | fill `--danger`, value text "Failed" in `--danger-text`, then InlineError below |
| Complete | the bar is replaced by success StatusText ("Indexed · 42 passages") |

**Determinate** whenever a measure exists (bytes, rows, stages). **Indeterminate** only when none exists and the wait is expected under about 10 s: a 30% segment travels the track once per `--dur-pulse` while the request is in flight; under reduced motion the segment is static and the label says "Working…". Anything longer uses **StageProgress**.

ARIA: `role="progressbar"`, `aria-label` (or `aria-labelledby` the label), `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow` (omitted when indeterminate), `aria-valuetext` ("42%, 3.1 of 7.4 MB"). Announce start, completion and failure only; intermediate values at most at 25/50/75% and never more often than `--timing-announce-throttle`.

### 14.3 StageProgress

For long jobs with named phases. It reuses the setup-track checklist visuals (`02-components-gate.md` §5.3): a 20 px status mark per stage (done: `check` on `--success-soft`; current: Spinner sm with a 2 px `--accent-mark` ring; to do: 1.5 px `--control` ring; failed: `x` on `--danger-soft`), the stage name in `--type-data-13`, and a meta line. Overall text: "Step 2 of 3". Cancel is always available while running.

| Job | Stages |
|---|---|
| AI draft ("Describe it", up to 90 s; F-FLOW-031) | Reading your description · Drafting steps · Checking the flow. Ends on the diff (Apply to draft · Discard); never replaces the canvas silently |
| Knowledge file (F-UX-033) | Uploading (bytes, determinate) · Reading · Indexing (passages). Ends "Indexed · 42 passages" or "Couldn't index · Retry" |
| Import leads (F-QA-022) | Checking file · Mapping columns (a real step with the preview) · Importing (rows, determinate). Ends "1,212 imported · 28 skipped · Download skipped rows" |
| Data export | Preparing archive · Ready (link expires in 1 h) |

### 14.4 Upload and embed rows (Knowledge)

A list row per file: type icon, **original file name** (not the storage key), size, a StatusText md, a ProgressBar while uploading, and one action: Cancel (while uploading), Retry (failed), or ⋯ (done; Delete lives there). Multiple files show an aggregate line above the list: "3 of 5 uploaded · 2 indexing". Leaving the page keeps uploads running with a progress toast.

```tsx
<ProgressBar label="price-sheet.pdf" value={42} valueText="42% · 3.1 of 7.4 MB" tone="default" | "danger" />
<ProgressBar label="Checking file" indeterminate />
<StageProgress stages={[{ id, label, meta?, state: 'done' | 'current' | 'todo' | 'failed' }]} onCancel={…} />
<RouteProgress />   // once in the AppShell; listens to router events
```

**Resolves:** F-UX-030, F-QA-007, F-A11Y-013, F-UX-033, F-QA-022, F-FLOW-031, F-UX-047 (export states).

---

## 15. Empty states

**Purpose.** Say what will appear here and offer the one next step. Today there are seven styles, from "Awaiting connection…" in 2.4:1 mono to a dashed shield box (F-VIS-023).

### 15.1 Variants

| Variant | When | Content | Action |
|---|---|---|---|
| **First use** | Nothing exists yet | What will appear and why it matters, in one sentence | One primary (Import leads…, New flow) + optional docs link |
| **No results** | A search matched nothing | Echo the query: "No calls match 'site visit'." + what search covers | Clear search |
| **Filtered empty** | Filters exclude everything | The filters in words: "No calls match Negative sentiment in the last 7 days." + "121 calls are hidden by filters." | Clear filters |
| **All done** | A queue is empty because work is finished | "No callbacks due today." | Optional "View upcoming" |
| **Not yet available** | Data exists but is not computed | "Sentiment appears after a call is analysed." / "Recording since 20 Sep 2026. Nothing recorded in this range." (F-UX-042) | none, or the step that unlocks it |
| **Compact** | Inside a sheet tab, popover, inspector, menu or small card | One `--type-data-13` `--text-3` line, left-aligned, no icon | Inline link at most |

Search and filtered copy never uses first-use copy (Call reports said "Calls appear here once your agents start dialing" to an account with 121 calls, F-UX-046).

### 15.2 Anatomy and values (region variants)

- **Icon** (optional): one Lucide glyph at `--icon-lg` 20 in `--text-3`, no tile, no colour. First use: the destination's nav icon; no results: `search-x`; filtered: `filter`; all done: `check`.
- **Title**: `--type-title-16` `--text` (`--type-title-14` in cards under 320 px tall), `text-wrap: balance`.
- **Body**: `--type-body-14` `--text-2`, max `--size-container-narrow` (400), `text-wrap: pretty`.
- **Actions**: one primary or one secondary Button, plus one link; `--space-inline-md` apart.
- **Layout**: centred block, `padding-top: var(--space-48)`, gap `--space-8` (title → body) and `--space-16` (body → actions). In tables it sits inside `<tbody><tr><td colspan>` so the header stays and the table semantics survive.
- **Illustration policy: none.** No illustrations, mascots, emoji, 3D, tinted icon tiles, dashed boxes or decorative Devanagari in the product (direction §3.2, anti-patterns 11 and 12). The largest graphic is a 20 px icon. Marketing may use real product surfaces, never art.

### 15.3 Copy by surface

| Surface | First use | Action |
|---|---|---|
| Leads | Leads you add or import appear here. | Import leads… · New lead |
| Call reports | Calls appear here after your agent places or answers one. | Place a test call… |
| Cockpit transcript | The transcript appears here once a call connects. | none |
| Flows | Start from a template or describe the call you want. | New flow (template gallery) |
| Knowledge | Add documents your agent can quote on calls. | Upload files |
| Meetings | Meetings you start appear here with notes and a summary. | Start a meeting |
| Billing › Invoices | Invoices appear here after your first top-up. | Top up |
| Settings › API keys | Create a key to call the Vaani API from your systems. | Create key… |

### 15.4 ARIA and behaviour

Result counts update the polite region ("No results"). The empty state is not a live region itself. The action takes focus only if the user's own action (clearing a list) produced the empty state.

```tsx
interface EmptyStateProps {
  variant: 'first-use' | 'no-results' | 'filtered' | 'done' | 'not-yet' | 'compact';
  icon?: LucideIcon; title?: string; children?: React.ReactNode;   // body
  query?: string; filtersSummary?: string; hiddenCount?: number;
  action?: { label: string; onClick?(): void; href?: string; variant?: 'primary' | 'secondary' };
  link?: { label: string; href: string };
}
```

**Resolves:** F-VIS-023, F-UX-046, F-UX-042, F-UX-030 (no false zeros), F-A11Y-019 (the 1.77:1 "Awaiting connection…").
