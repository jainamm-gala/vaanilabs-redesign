
## 15. How Clear Path fixes the audit's top 15

| # | Finding | Clear Path answer |
|---|---|---|
| 1 | F-FLOW-001: autosave into the live flow, silent Backspace delete | Draft/Live split, Publish with a readiness path, Undo toast on delete, version history (§14.1) |
| 2 | F-UX-001: org/team setup dead end | Settings › Workspace and team gets a single "Create workspace" flow. Readiness path step 6 is "Invite your team", with a disabled reason if the user's role can't do it. Integrations explain the blocker inline. |
| 3 | F-QA-001: contradictory /about claims | Out of the visual scope, but the Status-line principle ("say what is true") applies to marketing copy. A single source of truth for claims is shared by /security and /about. |
| 4 | F-A11Y-001: canvas is mouse-only, 9 px handles | Keyboard model, Outline view, the "Go to" path list, and 11 px ports with 24 px hit areas (§14.7) |
| 5 | F-A11Y-002: Call Reports is mouse-only | Call history rows are links or buttons. The detail opens in a focus-managed sheet with a deep link, and the transcript comes first. |
| 6 | F-QA-002: writes on open, "Up to date" when saves fail | Opening never writes. The save status line is truthful and offers Retry. |
| 7 | F-FLOW-004: "FLOW VALIDATED" on invalid flows | Continuous validation, "n issues" in the header, node badges, Publish blocked by errors |
| 8 | F-A11Y-004: the `c` key dials | `C` opens the readiness popover. Single-key shortcuts can be switched off. |
| 9 | F-QA-005: only 50 of 121 calls | The Call history table uses server pagination and URL filters. Counts state their scope ("121 calls · showing 1–50"). |
| 10 | F-QA-006: two legs per test call | One call record per conversation. Legs appear inside the detail. Test calls are tagged "Test" and excluded from KPIs by default. |
| 11 | F-UX-002: wallet banner → Profile | Wallet in the sidebar opens Billing. "Top up…" opens the top-up sheet directly. The global banner is gone. |
| 12 | F-UX-006: "You're live" on an account that can't call | The readiness path on Home and in onboarding ends only after a connected test call |
| 13 | F-QA-010: /signup lands on sign-in | Sign-up is its own screen in the same Clear Path shell: "Create your workspace". Access approval uses a status line: "Pending approval · usually within 1 working day". |
| 14 | F-RWD-001: phones reach 6 of 12 sections | Bottom bar of 5 plus a More sheet with every destination. Sign out lives in the account menu. |
| 15 | F-A11Y-008/009, F-VIS-003: muted text and black-on-blue fail AA | `text-3` at 5.49:1, white on Peacock at 6.16:1, a 12 px floor, and every pair in §3 listed with its ratio |

It also addresses the "five dialects" (F-VIS-001): one shell, one type family, one accent, one button, input and badge system, and one header.

---

## 16. Risks and trade-offs

1. **A new accent is a brand decision.** Peacock replaces both the app blue and the marketing violet, so marketing, the logo lock-up and the login screen must move with it, or the funnel breaks again (F-QA-013). **Mitigation:** Peacock comes from the existing logo gradient. Ship the marketing update alongside the app.
2. **Teal sits near success green.** At a glance, "Live" (green) and the primary (Peacock) could be confused. **Mitigation:**
   - The hues are 48° apart.
   - Success always carries a dot or check plus a word.
   - The primary is always a filled button, never a badge.
   - Charts use Peacock as series 1 only.
3. **Guidance can feel slow to power users.** Descriptions, 52 px rows and readiness checks add friction. **Mitigation:**
   - Compact density
   - Hiding palette descriptions
   - `Ctrl K`
   - The readiness popover remembers "tested today"
   - Advisory checks never block
   - Blocking checks exist only where real money or real customers are at stake
4. **Inputs at 3:1 look heavier** than the 1.5:1 borders of the reference products. This is deliberate for newcomers and for WCAG 1.4.11. If research shows it reads as heavy, it can drop to about 2.6:1 only if the input fill also changes. That is a documented trade-off, not a silent one.
5. **Two extra hues (indigo, plum) for flow stages** stretch the one-accent rule. They are confined to 20–28 px tiles in flow contexts. Node frames stay neutral, and selection stays Peacock.
6. **Backend dependencies:**
   - Draft/publish versions (partly present: `version_no`, `parent_flow_id`)
   - Continuous server-side validation
   - Cost estimates, which need per-second rates and median call length
   - Deduplicating two-leg calls
   - Calling-hours and do-not-call data

   The UI can phase these in with truthful fallbacks, for example "Estimate unavailable. Rates: ₹0.04 per second", but it must never fake them.
7. **Renaming destinations** (Live calls, Call history, Rep desk) breaks muscle memory and docs. **Mitigation:** redirects, "formerly" entries in search for 90 days, and a one-time "What's new" sheet.
8. **Compliance cues** (recording disclosure, calling hours, DND) need the product owner's confirmation (digest 5.11 #6). The readiness path is designed so checks can be added or removed without layout change.
9. **Devanagari font weight.** Noto Sans Devanagari adds about 100–150 KB. It is loaded only on demand with `unicode-range`.
10. **Light as the default** differs from today's dark-first marketing. Dark keeps full parity, and marketing may stay dark-leaning provided it uses the same tokens.

---

## 17. Implementation notes (for the frontend developer)

- **Tokens:** define the CSS variables in §3 on `:root` and override them under `.dark` **and** `@media (prefers-color-scheme: dark)` for "System". Map them into Tailwind v4 `@theme`:

```css
@theme {
  --color-canvas: var(--canvas); --color-surface: var(--surface); --color-surface-2: var(--surface-2);
  --color-border: var(--border); --color-border-strong: var(--border-strong);
  --color-fg: var(--text); --color-fg-2: var(--text-2); --color-fg-3: var(--text-3);
  --color-accent: var(--accent); --color-accent-soft: var(--accent-soft); --color-on-accent: var(--on-accent);
  --color-success: var(--success); --color-warning: var(--warning); --color-danger: var(--danger);
  --font-sans: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --radius-xs: 5px; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
  --shadow-e1: var(--e1); --shadow-e2: var(--e2); --shadow-e3: var(--e3);
}
```

  Add a lint rule that bans arbitrary values (`text-[9px]`, `bg-[#…]`, `rounded-[9px]`) and raw palette classes in app code (F-VIS-020).
- **Primitives:** adopt one accessible primitives layer (Radix UI or React Aria) for Dialog, Sheet, Popover, Menu, Tabs, Tooltip, Toggle and Checkbox. That gives focus traps, Esc and focus return for free (F-A11Y-005). Add a single toast system with Undo support.
- **Components to build first**, in this order: `Button` (4 variants × 3 sizes), `Input`/`Field`, `Badge`, `StatusLine`, `ReadinessPath`, `PageHeader`, `AppShell`/`Sidebar`/`BottomBar`, `DataTable` (TanStack Table), `Sheet`, then the Flow node set (`StageTile`, `Node`, `Port`, `Edge`).
- **The specimen is the reference.** `clarity.html` contains working CSS for every component above. Class names are illustrative; the values are normative.
- **Answers to the audit's open decisions (5.11)** for this direction:

| Decision | Answer |
|---|---|
| Accent | Peacock |
| Default theme | Light default, with dark parity and System |
| Case | Sentence case |
| Save | Removed; autosave to draft plus Publish versions |
| Concurrent editing | Show presence ("Neel is editing") and lock Publish to one person at a time |
| Compliance | Recording disclosure, calling hours, recently called and do-not-call in the readiness path |
| Sidebar latency | Removed; the call line quality shows only during calls |
| Minimum editing viewport | 1024 px |
