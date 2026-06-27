DEVANA-FINDING: v1
DEVANA-STATE: wontfix | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:504 | structure-min-max-bypass

# Structure min and max not enforced on loaded values

## Finding

`StructureField` applies `options.min` and `options.max` only to Add/Remove button `disabled` state. Persisted or parent-supplied `value` arrays outside those bounds are rendered and saved as-is. Subfield edits call `onChange` with the full unclamped array.

## Violated Invariant Or Contract

`StructureOptions.min` and `max` imply a cardinality floor and ceiling. Remove disabled when `items.length <= min` (537) and add disabled when `items.length >= max` (572) suggest counts should stay within bounds once configured.

## Oracle

`StructureOptions.min?: number` and `max?: number` in `src/types.ts`. Button guards reference both limits. `normalizeStructureValue` and structure helpers have no min/max awareness.

## Counterexample

**Above max:** `options.max = 2`, `value = [{}, {}, {}]`. UI shows three rows; add is disabled but remove is allowed. User edits a subfield in row 1 and saves → `onChange` emits three rows.

**Below min:** `options.min = 3`, `value = []`. UI shows zero rows; remove/add guards do not seed rows. User saves without clicking Add → parent remains `[]`.

## Why It Might Matter

Imported content or API updates can leave structure fields outside configured limits. The editor presents and persists out-of-bound row counts without normalization or warning.

## Proof

Control-flow trace: `items = normalizeStructureValue(value)` (504) with no clamp → handlers call `onChange(nextItems)` directly (513–515) → persisted length unchanged vs `min`/`max`.

## Counterevidence Checked

README does not document `min`/`max` semantics explicitly. Limits may be intended as interactive hints only. Widget still disables both add and remove in conflicting configs (see separate `structure-min-gt-max-deadlock` report) rather than ignoring limits entirely.

## Suggested Next Step

Clamp or validate `items.length` against `min`/`max` on mount and before each `onChange`, or document that limits apply only to button actions.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: wontfix (code) + documented. The suggested auto-clamp is harmful: trimming an above-`max` array silently deletes loaded rows (the same silent data loss the P1 root-coercion findings flag), and padding a below-`min` array seeds empty rows that mark the entry dirty on open with no user action. The current design is the safe one — `min`/`max` gate the interactive controls (Add disabled at `max`, Remove disabled at `min`) while still letting the editor reach compliance (Remove stays enabled above `max`, Add stays enabled below `min`), and externally supplied out-of-bounds arrays are shown rather than mutated. Took the report's second remedy: documented these semantics in README.md (min/max constrain the controls, are not enforced on supplied values). Build/typecheck unaffected (docs only).

DEVANA-KEY: src/admin.tsx:504 | structure-min-max-bypass
DEVANA-SUMMARY: wontfix | P2 | medium | Structure `min`/`max` gate buttons only; loaded or edited arrays outside bounds persist unchanged.