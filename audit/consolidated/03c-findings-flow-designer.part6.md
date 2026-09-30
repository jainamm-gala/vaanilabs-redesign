
---

**Section totals:** 37 consolidated findings (1 critical, 12 high, 20 medium, 4 low), merged from 56 owned source findings. The verifier refuted none.

### Refuted / not reproduced

The verifier didn't refute any owned finding. The sub-claims below were corrected, not reproduced or left unproven. The findings above either leave them out or mark them as inferred.

| Source | Claim | Verifier result |
|---|---|---|
| FLOW-CANVAS-01, FLOW-CONFIG-01 | Autosaved edits reach live calls; opening a stale tab overwrites a teammate's edits | Still inferred, because writes were blocked. The load-time PUT was confirmed to carry identical content, so it doesn't corrupt data. Only `updated_at` is bumped. |
| FLOW-CANVAS-03, FLOW-CONFIG-04 | Broken flows can go live through ACTIVATE | Confirmed that ACTIVATE stays enabled while errors exist. Whether it validates on the server is unknown, because it wasn't clicked. |
| FLOW-CANVAS-04, FLOW-CONFIG-05 | The orphan "Knowledge Lookup" in the live flow was created by a palette click | Can't be verified. |
| FLOW-CONFIG-05 | A new node renders underneath the selected node | Not re-tested (the stacking of successive adds was confirmed). |
| FLOW-CANVAS-08 | After Jump, the target node is hidden under the errors panel | Overstated: the node overlaps the panel's edge by only about 7 px. |
| FLOW-CONFIG-06 | "(vN)" flows are unlinked copies | Corrected: the API stores `version_no` and `parent_flow_id`. The UI hides the lineage, and the lineage data is inconsistent. |
| FLOW-CONFIG-06, FLOW-CANVAS-09 | The switcher's sort order is arbitrary | Corrected: it is `created_at` descending, a column the modal doesn't show. |
| FLOW-CANVAS-09 | Recorded viewport values on flow switch (scale 0.423 → 0.383) | The carry-over itself was confirmed, with different values (scale 0.7119, then 1). F-FLOW-012 uses the verifier's values. |
| FLOW-CONFIG-03 | The chip sometimes switches to "Autosave failed" | Not reproduced: the verifier only ever saw "Up to date". |
| FLOW-CONFIG-04 | A validator error names a node by its raw id | Not re-tested by the verifier. It rests on a single-agent observation (`va-flow-config/30_validate_after_edits.png`). |
| FLOW-CONFIG (strengths) | Nodes carry descriptive aria-labels | Contradicted: the verifier found no `aria-label` on the focusable node element (F-FLOW-006). |
