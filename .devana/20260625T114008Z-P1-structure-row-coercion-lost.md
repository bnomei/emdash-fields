DEVANA-FINDING: v1
DEVANA-STATE: open | P1 | high | security=no
DEVANA-KEY: src/admin.tsx:187 | structure-row-coercion-lost

# Structure field drops invalid row payloads on first mutation

## Finding

`StructureField` coerces non-object rows to `{}` during render, but the parent array keeps the original row values until any structure mutation runs. The first add, remove, move, or row edit emits the normalized array and permanently discards invalid row payloads such as nested arrays.

## Violated Invariant Or Contract

Read-side normalization should not cause silent data loss on the first write unless the user explicitly deletes the row.

## Oracle

`tests/transformations.test.mjs` asserts invalid rows normalize to `{}` for display. No test covers parent-state divergence before the first `onChange`.

## Counterexample

1. Persisted `value: [{ label: "A" }, ["secret"]]`.
2. `normalizeStructureValue(value)` renders `[{ label: "A" }, {}]`; row 2 looks empty.
3. User clicks Add item.
4. `addStructureItem(items)` uses the normalized in-memory array and `onChange` emits `[{ label: "A" }, {}, {}]`.
5. `["secret"]` is removed from stored JSON without an explicit delete of that payload.

## Why It Might Matter

Malformed imported rows can vanish after an unrelated structure action. The editor never saw the hidden payload and cannot restore it from the widget.

## Proof

Control-flow trace:

invalid row in parent `value` → `normalizeStructureValue` → `{}` at render → first `updateItems(...)` / `onChange` emits normalized array only → original non-object row never written back.

## Counterevidence Checked

Coercion to `{}` is tested and intentional for rendering. The widget does not auto-normalize parent state on mount, so invalid payloads survive until the first mutation.

## Suggested Next Step

Normalize and write back structure values on mount when row shapes are invalid, or preserve raw row data until the user edits that specific row.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.

DEVANA-KEY: src/admin.tsx:187 | structure-row-coercion-lost
DEVANA-SUMMARY: open | P1 | high | First structure mutation persists normalized rows and drops invalid row payloads that were still in parent state.