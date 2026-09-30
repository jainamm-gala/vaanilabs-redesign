---

## 8. Key-value panels

### 8.1 Purpose
Read-only facts about one record: a call's details, a lead's overview, an invoice, an API key, a flow version, what was captured on a call. **Use** in record sheets, cards and Settings summaries. **Don't** use it for editing (Fields and forms), for comparing records (DataTable), or to show values that don't exist (missing values say so, P1).

### 8.2 Anatomy and tokens

```
Section label        Captured so far · 2 of 3
dt  Preferred day    dd  Saturday, morning
dt  Site visit       dd  Waiting for an answer…
dt  City             dd  Pune   from Leads
dt  Call id          dd  call_7c21e0  [copy]
```

| Part | Tokens |
|---|---|
| Section label (optional) | `label-12` `text-3`, padding `space-12 0 space-4`; a count on the right ("2 of 3") |
| Row | grid `minmax(0,2fr) minmax(0,3fr)`, gap `space-16`, padding-block `space-6`; `data-13` |
| Key (`dt`) | `text-3`, sentence case, no colon |
| Value (`dd`) | `text`; `display: flex; flex-wrap: wrap; gap: space-6`; `overflow-wrap: anywhere` for ids and URLs; may hold a StatusTag, a link, a LineQuality, a language name (LanguageMark `name`, §5.6) |
| Mono value | `mono-12` ids only (`IdText`), with a Copy IconButton (small, 24 hit minimum, `aria-label="Copy call id"`). A phone value is `PhoneText` (§5.8), in the row's text role with tabular figures |
| Source note | `meta-12` `text-3` after the value ("from Leads", "from the call", "₹0.04/s") (F-UX-003) |

| Variant | Use |
|---|---|
| `inline` (default) | sheets and cards |
| `rows` | Settings summaries and "Captured so far": each row padding-block `space-10` with a bottom hairline `border` |
| `stacked` | key above value (gap `space-2`); applied automatically by a container query below `calc(var(--space-80) * 4)` (320 px) and for long text (Summary) |

### 8.3 Value states

| State | Treatment |
|---|---|
| Present | `text` |
| Missing (optional field never captured) | "Not captured" in `text-3` |
| Pending (live call, the question not yet answered) | "Waiting for an answer…" in `text-3` (direction §6.2) |
| Loading | a `space-8` skeleton bar at 60 % width |
| Error | the section shows "Couldn't load details · Retry" once, not per row |
| Masked | masked phone with an explicit Reveal button for permitted roles; revealing is logged in Activity & Audit (digest §5.7) |
| Copied | the Copy icon swaps to `check` for the toast's life; the toast says "Copied call id" |

**Behaviour:** values are plain text (selectable); Copy copies the raw value; an Edit link, when present, opens the form for that section, never an inline editor. **ARIA:** `<dl>` with `<div>` wrappers around each `dt`/`dd` pair; a heading (`h3`) above each section; copy results are announced by the toast. **Responsive:** container queries only (the same list works in a 440 px sheet, a 560 px sheet and a phone). **Motion:** none. **Content:** keys are nouns; values come from `lib/format.ts` (one duration format: "2m 31s", never "87s" and "1:27" for the same call, F-VIS-024); captured fields and "not collected" come from the same source so they can't contradict each other (F-UX-010); "2 legs · browser test, counted once" is disclosed when relevant (F-QA-006).

| Do | Don't |
|---|---|
| "Not captured" and the source of every value | Demo email, company and sentiment beside a real lead (F-UX-003) |
| One formatter for every duration | "87s" in the panel and "1:27" in the table (F-UX-010) |
| Copy button on ids | A truncated call id with no way to copy it (F-UX-010) |

**Resolves:** F-UX-003, F-UX-010, F-UX-032, F-VIS-024, F-A11Y-019, F-QA-006 (legs disclosed).

```tsx
<KeyValueList variant="inline" title="Call" items={[
  { key: 'Outcome', value: <StatusTag domain="outcome" value={call.outcome} /> },
  { key: 'Duration', value: formatDuration(call.talkMs) },
  { key: 'Call id', value: call.id, mono: true, copy: call.id },
  { key: 'City', value: lead.city, source: 'from Leads' },
  { key: 'Site visit', state: 'pending' },
]} />
```

---

## 9. Avatars

### 9.1 Purpose
Recognise a person, the AI voice or the workspace at a glance, always next to the name except in dense stacks. **Don't** use avatars for leads in tables (names suffice), as decoration, or to give the agent a face (direction §3.2).

### 9.2 Variants and tokens

| Variant | Shape and colour | Sizes | Content |
|---|---|---|---|
| Person | round (`--radius-full`); `surface-3` background; `text-2` | 20 (`space-20`) in feeds, 28 (`--size-avatar`) default, 32 (`--size-avatar-voice`) in record and call headers | initials: one letter at 20 (`label-12`), two at 28 (`label-12`) and 32 (`label-13`); a teammate's photo when they uploaded one (`object-fit: cover`), initials as the fallback; never a lead photo |
| VoiceTile | square tile, radius-6; `surface-3`; `text` | 28 in lists and the compact picker, 32 in the voice picker and call header | two letters of the voice name ("Va", "Vi"). Square so an AI voice never looks like a person; no face, orb or waveform art |
| WorkspaceTile | square tile, radius-6; `ink-tile` / `ink-tile-fg` | 28 | the workspace's first letter |
| AvatarStack | Person avatars overlapping by `space-4`, each with a `--bw-strong` ring in `surface` | 28 | at most 3, then "+n" in the same shape |

**States:** default; loading (an empty `surface-3` circle or tile); image error (initials). Avatars are not interactive; the button or link that contains one owns hover and focus. **ARIA:** `aria-hidden` when the name is adjacent; alone, `role="img"` with `aria-label` ("Anika R."); stacks name everyone ("3 participants: Anika R., Dev M. and 1 more"). **Responsive:** sizes never scale with the viewport. **Motion:** none. **Content:** initials from the first letters of the first two words; `translate="no"` on names.

| Do | Don't |
|---|---|
| Neutral initials; square tiles for voices and the workspace | Colour-coded rainbow backgrounds, or Neel initials (K8) |
| Account identity at the bottom of the sidebar | No identity anywhere in the chrome (F-UX-029) |

**Resolves:** F-UX-029, F-VIS-016, direction §3.2 (agent persona).

```tsx
<Avatar name="Anika R." size={28} src={user.photoUrl} />
<VoiceTile voice={{ name: 'Vaani' }} size={32} />
<WorkspaceTile name="Sample Realty" />
<AvatarStack people={participants} max={3} />
```
Built on Radix `Avatar` (image with fallback).

---

## 10. Timeline and activity feed

### 10.1 Purpose
What happened to one record, in order: a lead's calls, status changes, notes, imports and assignments; the workspace's Activity & Audit ledger uses the same component with filters. **Don't** use it for the live transcript (TranscriptFeed), notifications or chat.

### 10.2 Anatomy and tokens

```
Today                                                   day heading (sticky in its scroller)
[☎] Vaani called · Visit booked · 2m 31s        10:42 am
 │   ┌ अA Caller  “Saturday ho sakta hai…” ┐    detail (optional)
[◎] Status changed from New to Interested by the Outcome step   10:44 am
(A) Anika R. added a note                        11:02 am
```

| Part | Tokens |
|---|---|
| Day heading | `label-12` `text-3`, padding `space-12 0 space-8`; "Today", "Yesterday", then "28 Aug 2026"; `position: sticky; top: 0` inside the scroller with a `surface` background |
| Item | grid `var(--size-glyph-tile) minmax(0,1fr) auto`, gap `space-4 space-12`, padding-bottom `space-16` |
| Node | 24 (`--size-glyph-tile`) tile, radius-6, `surface-2`, 1 px `border`, icon 14 `text-2`; events that carry a state use its soft tone (`success-soft` / `success-text` for a connected call, `warning-soft` for a stale queued call, `danger-soft` for a failed one); human actions use a 20 px Person avatar instead |
| Connector | 1 px `border` line from under the node to the next node; none after the last item |
| Text | `data-13` `text-2`; actor and object in `--fw-medium` `text`; links in `accent-text` |
| Time | `meta-12` `text-3`, `<time datetime>` with the absolute date and IST in its tooltip |
| Detail (optional) | spans columns 2–3; `surface-2`, radius-6, padding `space-8 space-12`, `data-13` `text-2`: a transcript excerpt with its LanguageMark, a note, or a change ("New → Interested") |
| Actions (optional) | ghost small Buttons under the text ("Check status", "Open call") |
| Load older | ghost small Button "Show older activity" after the last group |

### 10.3 Event catalogue (icon · tone)
Call placed or received (`phone-outgoing` / `phone-incoming`, tone from the call result) · Status changed (`circle-dot`, neutral) · Note added (author avatar) · Imported (`list`, neutral) · Flow assigned (`workflow`) · Callback scheduled (`clock`, info) · Call still queued past the reaper window (`clock`, warning: "no update since 28 Aug, 11:45 pm") · Exported (`download`) · Audit only: signed in (`log-in`), API key created (`key-round`), settings changed (`sliders-horizontal`).

### 10.4 States

| State | Treatment |
|---|---|
| Loading | three skeleton items (node tile, two bars) after `--timing-skeleton-delay` |
| Empty | "No activity yet. Calls, status changes and notes will appear here." |
| Empty audit ledger | states the retention window and since when events are recorded ("Recording since 20 Sep 2026 · kept for 365 days"), so an empty ledger is not mistaken for no activity (F-UX-042, F-QA-023) |
| Stale | a queued or in-progress call older than the reaper window shows the warning tone and "Check status" (F-QA-037) |
| Grouped repeats | consecutive same-kind system events collapse: "3 status changes by the Outcome step · Show" (Radix Collapsible, `aria-expanded`) |
| Load older | 20 items per load; focus moves to the first new item; "20 older events loaded" is announced |
| Error | a Notice with Retry at the top of the list; existing items stay |

**Keyboard:** Tab through links and buttons only; no roving focus. **ARIA:** each day is a heading (level from context) followed by an `<ol aria-labelledby>`; items are `<li>`; live additions are announced only when they carry a state change (call ended, status changed). **Responsive:** below a 360 px container the time moves under the text (grid becomes two columns). **Motion:** none; new items appear without animation. **Content:** one past-tense sentence, actor first ("Vaani called", "Anika R. added a note", "Import added 212 leads"); system actors are named in words ("the Outcome step"), never ids.

| Do | Don't |
|---|---|
| Flag a month-old "Queued" call as stale | Leave "QUEUED 28 Aug" looking current (F-QA-037) |
| Explain an empty audit ledger | "Nothing in this slice yet" on an active account (F-UX-042) |
| "Show older activity" as a button | Endless auto-loading with no end or position |

**Resolves:** F-QA-037, F-UX-042, F-QA-023, F-UX-032, F-VIS-024.

```tsx
<Timeline status={status} hasOlder={hasOlder} onLoadOlder={loadOlder}
  groups={[{ day: '2026-09-26', items: [
    { id, kind: 'call', tone: 'success', actor: 'Vaani', text: <>called · <a href={callHref}>Visit booked</a> · 2m 31s</>, at, detail: <TurnExcerpt turn={t} /> },
    { id, kind: 'note', actor: { name: 'Anika R.' }, text: 'added a note', at, detail: note.body },
  ] }]} />
```
