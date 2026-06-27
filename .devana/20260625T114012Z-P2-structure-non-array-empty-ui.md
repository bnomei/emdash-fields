DEVANA-FINDING: v1
DEVANA-STATE: open | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:187 | structure-non-array-empty-ui

# Structure field hides non-array persisted values

## Finding

When a structure field's persisted value is not an array, `normalizeStructureValue` returns `[]` for rendering and the widget shows zero rows. The parent state keeps the original object or scalar until the user performs a structure action, so valid data can be hidden from editors without any warning.

## Violated Invariant Or Contract

Structure widgets should either surface malformed persisted data for correction or normalize it back to the parent on load. Rendering an empty list while storage still holds a non-array value breaks the editor's view of stored content.

## Oracle

`normalizeStructureValue` behavior tested in `tests/transformations.test.mjs` for invalid inputs, without a widget save-path test.

## Counterexample

1. Persisted structure value `{ "0": { label: "A" }, "1": { label: "B" } }` (object map instead of array).
2. `normalizeStructureValue(value)` returns `[]`.
3. `StructureField` renders no rows and no error beyond an empty list.
4. User saves the entry without adding a row.
5. Parent state can remain the original object map, invisible in admin UI.

## Why It Might Matter

Imported JSON with the wrong top-level shape looks like an empty field, so editors may add new rows on top of hidden data or publish content believing the structure is blank.

## Proof

Dataflow trace:

non-array persisted `value` → `normalizeStructureValue` → `[]` at render → no mount-time `onChange` → original non-array value remains in parent state while UI shows emptiness.

## Counterevidence Checked

Normalization to `[]` for non-array input is intentional for helper semantics. Add/remove controls operate only on the normalized in-memory array. The bug is the parent/UI divergence, not the helper alone.

## Suggested Next Step

Detect non-array structure values on mount and either migrate them into an array shape with an explicit `onChange`, or render a recovery warning with the raw value.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.

DEVANA-KEY: src/admin.tsx:187 | structure-non-array-empty-ui
DEVANA-SUMMARY: open | P2 | medium | Non-array structure values render as an empty list while the original persisted value remains hidden in parent state.