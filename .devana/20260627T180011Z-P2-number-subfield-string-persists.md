DEVANA-FINDING: v1
DEVANA-STATE: open | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:383 | number-subfield-string-persists

# Number subfields round-trip non-number stored values unchanged

## Finding

`renderSubField` displays number and integer subfields with `value: typeof value === "string" || typeof value === "number" ? value : ""` but only coerces input through `parseNumericInput` on user `change` events. Pre-existing string or non-integer number values are shown and persisted without normalization until the user edits the field.

## Violated Invariant Or Contract

README documents `number` and `integer` subfields as storing a `Number`, or `undefined` when empty. Loaded values should be numbers (integers for `integer`), not strings or off-type numbers.

## Oracle

README subfield stored-value table (lines 97–98). `parseNumericInput` and `readInputValue` run only on change (350–361), not on mount.

## Counterexample

Object subfield `{ key: "count", type: "number" }`, persisted `{ count: "42" }` (string).

1. Input displays `"42"` because `typeof value === "string"`.
2. User saves without editing count.
3. Parent keeps `count: "42"` (string), not `42` (number).

For `integer` subfield with `{ priority: 3.14 }`, non-integer number displays and persists until edited.

## Why It Might Matter

Imported YAML/JSON often quotes numbers as strings. Frontend templates expecting numeric types receive strings, breaking comparisons and formatting.

## Proof

Dataflow trace: alien typed `value[field.key]` → display accepts string → no mount normalization → save without edit preserves wrong type.

Location: `commonProps.value` (383), `readInputValue`/`parseNumericInput` (350–361).

## Counterevidence Checked

README may mean "editor emits Number on edit" rather than "normalize on load". EmDash may validate at another layer — not visible here. `tests/numeric-input.test.mjs` covers `parseNumericInput` only, not load paths.

## Suggested Next Step

Normalize number/integer subfield values on mount or when rendering, coercing valid numeric strings and clearing invalid shapes to `undefined`.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.

DEVANA-KEY: src/admin.tsx:383 | number-subfield-string-persists
DEVANA-SUMMARY: open | P2 | medium | Number and integer subfields display string or non-integer stored values and persist them until the user edits the field.