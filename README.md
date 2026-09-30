# Vaani Labs — UI/UX audit, redesign spec and reference prototype

This repository has a read-only audit of the live product [vaanilabs.in](https://vaanilabs.in/), the **Sutradhar** redesign specification that came out of it, generated design tokens, and a static, clickable reference prototype of the redesign.

> **Nothing here changes the live product.** There was no access to the Vaani Labs source code or deployment. Every audit browser blocked all writes (saves, calls, payments). The prototype is plain HTML, CSS and JS with fictional data.

## Start here

| | |
|---|---|
| Final report (executive summary, the 10 sections, implementation status) | [`FINAL_REPORT.md`](FINAL_REPORT.md) |
| Audit summary: 211 findings, top 15 issues, strengths | [`audit/consolidated/00-summary.md`](audit/consolidated/00-summary.md) |
| Redesign specification index | [`spec/README.md`](spec/README.md) |
| Implementation plan (P0 to P3) | [`spec/08-implementation-plan.md`](spec/08-implementation-plan.md) |
| Reference prototype: open `prototype/index.html` in a browser | [`prototype/README.md`](prototype/README.md) |

## Layout

```
audit/        live-product audit: 16 raw specialist reports, consolidated findings (AUDIT_FINDINGS.md)
spec/         design direction, foundations + tokens, components, page specs, Flow Designer,
              responsive, accessibility, motion, implementation plan, critique log, reference mocks
prototype/    static reference implementation (17 pages), QA reports, screenshots
```

## Not in this repository

The 1,093 screenshots of the live product under `audit/screenshots/` are excluded on purpose (see `.gitignore`), because they show real customer data from the audited account. The audit reports still mention their paths. Client business names in flow titles are also replaced with neutral labels (Client A–D) in the reports.

## Checks

```bash
node spec/tokens/check-contrast.mjs        # 460 colour pairs, WCAG AA
node spec/components/check-mocks.mjs       # every spec mock uses the canonical component layer
python spec/_tools/reassemble.py --check   # combined spec docs match their part files
node prototype/_tools/check-tokens.mjs     # prototype uses tokens only
node prototype/_tools/check-links.mjs      # no broken local links
```
