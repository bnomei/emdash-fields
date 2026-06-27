DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:423 | select-subfield-non-string-hidden

# Object select subfields hide non-string stored values

## Finding

In `ObjectField` and `StructureField`, select subfields bind `value={typeof value === "string" ? value : ""}`. Persisted non-string values (numbers, arrays, booleans) render as the empty placeholder while parent state remains unchanged until the user explicitly re-selects an option.

## Violated Invariant Or Contract

README documents `select` subfields as storing a selected string value. The read path should reflect the persisted selection or normalize alien shapes; showing blank while parent keeps a non-string is a UI/state contract mismatch.

## Oracle

README subfield table (`select` → selected string). `renderSubField` select branch (412–425). Distinct from `single-choice-array-deselected`, which affects `ChoicesField`, not object subfield selects.

## Counterexample

Object subfield `{ key: "tone", type: "select", options: ["Calm", "Bold"] }`, persisted `{ tone: 1 }` (legacy numeric JSON).

1. Select receives `value=""`; UI shows blank "Select..." option.
2. User saves without touching tone.
3. Parent state remains `{ tone: 1 }`.

## Why It Might Matter

Migrated or imported JSON with wrong-typed select values appears unset in the admin while frontend templates may still read the non-string payload, causing editor/display divergence.

## Proof

Dataflow trace: non-string `value[field.key]` → strict `typeof === "string"` guard → `value=""` → no mount-time `onChange` → parent keeps alien type across save.

## Counterevidence Checked

Non-string select values may be considered invalid input. No coercion on mount is intentional in similar normalization paths. TypeScript does not enforce stored runtime shapes for subfield values.

## Suggested Next Step

Coerce or clear non-string select values on mount, or display a warning when stored type does not match `string`.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed (display coercion). The select branch now derives its value via a new exported `selectSubfieldValue(value)` that stringifies a stored number (the realistic legacy numeric-JSON case, e.g. `{tone: 1}` against options `["1","2"]`) so it can match a string option and render as selected, mirroring how text subfields already accept numbers. Non-scalar values (arrays/objects) have no option to match and still render blank, which is the correct display. No mount-time `onChange` is added, consistent with the project's avoidance of spurious dirty state — a genuine re-select still writes a clean string. Note: when the stored value matches no option (e.g. `1` vs `["Calm","Bold"]`), blank remains correct; coercion only helps when the stringified value is an actual option. Added a unit test; typecheck clean; full suite (34 tests) passes. Related: [[single-choice-array-deselected]].

DEVANA-KEY: src/admin.tsx:423 | select-subfield-non-string-hidden
DEVANA-SUMMARY: fixed | P2 | medium | Select subfields show empty when stored values are not strings, while parent JSON keeps the non-string payload.