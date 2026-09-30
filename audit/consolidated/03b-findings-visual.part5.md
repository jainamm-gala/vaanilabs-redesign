
### Appendix 3B-A — Refuted / not reproduced

**Refuted: none.** None of the 66 owned findings was refuted or marked could-not-verify. The verifier re-checked five and confirmed all five; its corrections are applied above:

| Source | Verifier result | Applied in |
|---|---|---|
| VISUAL-AUDIT-01 | Confirmed; stays high. Correction: `/login` is light (#F4F6FA), mostly JetBrains Mono (176 chars), with a blue Sign In. The report had called it dark, Hanken and violet. | F-VIS-001, F-VIS-025 |
| UX-AUDIT-12 | Confirmed; lowered from high to medium ("real but cosmetic"). | F-VIS-001 (stays high on VISUAL-AUDIT-01), F-VIS-006 |
| VISUAL-AUDIT-02 | Confirmed; lowered to medium, since it shares a root cause with VISUAL-AUDIT-01 and blocks no task. | F-VIS-005 |
| VISUAL-AUDIT-04 | Confirmed; lowered to medium. The Call Reports green/red KPIs are meaningful, so "arbitrary" is overstated there. No glow on ACTIVATE at rest. Node titles re-measured on #EEF1F7 at 1.48 / 2.00 / 2.34 / 3.31:1 (the report had 1.67 / 2.26 / 2.65:1). | F-VIS-003, F-VIS-004 |
| RESPONSIVE-A-05 | Confirmed; lowered to medium, because CONNECT stays on top and clickable. The overlap is wider than reported: it also occurs at 1100x800, where the report claimed none. | F-VIS-007 |

**Consolidator corrections:**
- **A11Y-MANUAL-26** estimated CONNECT at about 4.15:1. #000 on #2F5FE0 computes to 3.83:1, which matches VISUAL-AUDIT, DESIGN-SYSTEM and EXPLORE-CORE, so 3.83:1 is used (F-VIS-030).
- **Font counts:** the verifier's re-count (for example Dashboard mono 226, Call Reports Hanken 14,759) replaces VISUAL-AUDIT §2.2 (230, 14,818) in F-VIS-001.
- **Intent-label width:** VISUAL-AUDIT-07 gave about 110px and EXPLORE-DATA-15 measured about 115px; the latter is used (F-VIS-013).
