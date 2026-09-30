
### Appendix — Refuted / not reproduced

No owned finding was refuted outright. The adversarial verifier did refute, or fail to reproduce, the following sub-claims. They are excluded from the findings above.

| Source | Claim | Verifier note |
|---|---|---|
| A11Y-AUTO-11 | No single-pointer alternative to drag-to-connect (2.5.7) | Clicking a source handle and then a target handle created an edge (React Flow click-connect); the verifier discarded it by reloading. 2.5.7 passes. The keyboard failure stands (F-A11Y-001). |
| A11Y-AUTO-04 | Status chips fail 1.4.1 Use of Color | Every chip carries a text label, so colour is not the only cue. The contrast part stands (F-A11Y-019). |
| A11Y-MANUAL-04 | Esc does not close the Leads drawer; the drawer path is "hidden" | Esc closed the drawer in two tests (from BODY and from a focused checkbox). The J/K legend is visible on screen. |
| A11Y-MANUAL-06 | Prefilled Customer Intel inputs have no accessible name | The placeholder remains the name alongside the value. Also, Settings labels have no `for` attribute at all, rather than `for=""`. |
| QA-A-06 | Toolbar menus don't close on Escape; items unreachable (91 stops) | One Escape sets `aria-expanded=false` and the menu fades within about 600ms with focus on the trigger. The first item is about 47 stops away and can be reached (F-A11Y-011). |
| A11Y-AUTO-09 | The wallet alert is re-inserted after Refresh and on client-side navigation | A MutationObserver saw 0 re-insertions and the same node was kept. The alert is re-rendered only on full page loads (F-A11Y-015). |
| A11Y-AUTO-10 | 12 infinite animations on /analytics under reduce; 2.3.3 failure | 6 found, 3 of them loading spinners. 2.3.3 covers interaction-triggered animation, so it was misapplied. 2.2.2 stands (F-A11Y-022). |
| A11Y-MANUAL-07 | The 1x1px checkbox input is a target-size defect | This is the standard sr-only pattern, and the clickable label is 20x20, which likely passes 2.5.8 through spacing. The name and focus defects stand. |
| A11Y-AUTO-07 (Leads) | Leads rows are not keyboard-reachable | j/k + Enter opens the drawer, so it is operable. It is not focus-based or exposed to assistive tech (F-A11Y-010). |
| VISUAL-AUDIT-06 / UX-AUDIT-13 sample values | STANDBY 2.12:1; "Awaiting connection" 2.4:1 (1.5:1 in UX-AUDIT); disabled Test Call counted as failing | STANDBY pulses between 2.1 and 4.4:1 (2.1 is its lowest point). "Awaiting connection" is 3.0:1. Disabled controls are exempt under 1.4.3. All the remaining text still fails (F-A11Y-008). |

**Severity changes applied from verification:**
- critical → high: A11Y-AUTO-01, A11Y-MANUAL-02.
- high → medium: A11Y-AUTO-04, 05, 09 and 10; A11Y-MANUAL-04, 07, 08 and 09; QA-A-06; PUBLIC-SITE-08.
- A11Y-AUTO-03 was rated medium by its verifier. It is merged into F-A11Y-009 at high, per VISUAL-AUDIT-03's verifier; the reason is given in that finding.
