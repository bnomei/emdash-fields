DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
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

- 2026-06-27: fixed (display/interpretation; intentionally no mount-time write). Numeric subfields now route their committed value through a new exported `interpretNumericValue(value, type)`: quoted numeric strings (common in YAML/JSON, e.g. `{count: "42"}`) are coerced so they display as numbers and any edit emits a real `Number`, while off-type shapes (a non-integer for an `integer` field, non-finite numbers, non-scalars) clear to `undefined` (blank) per the report's suggested remedy. This also fixes a regression introduced by the numeric-keystroke-intermediate-loss refactor, where `NumericSubField` treated only `typeof value === "number"` as committed and so blanked a stored numeric string; a stored "42" now correctly renders "42" again. No mount `onChange` is added — consistent with the project's avoidance of spurious dirty state — so an untouched off-type value is shown per the interpretation but the raw stored value is only rewritten when the user edits the field. Added unit tests for `interpretNumericValue` and an SSR test asserting `{count:"42"}` renders `value="42"`; typecheck clean; full suite (36 tests) passes. See [[numeric-keystroke-intermediate-loss]].
- 2026-06-27: reopened. The current code interprets numeric strings for display and future edits, but the original untouched-save counterexample is still reachable. `NumericSubField` computes `committed = interpretNumericValue(value, type)` and keeps a local draft, but it only calls `onChange` from input changes. Loading `{ count: "42" }` and saving without editing the field can still leave the parent value as the string `"42"`; an invalid integer value such as `3.14` is blanked for display but likewise is not cleared from parent state without an edit. Evidence checked: `interpretNumericValue`, `NumericSubField` draft setup, `onChange` handler, and blur resync.
- 2026-06-27: fixed. Number and integer subfields now participate in load-time object/structure normalization through `normalizeSubfieldStoredValue`. Quoted numeric strings such as `{ count: "42" }` emit `{ count: 42 }` without requiring an edit, and invalid integer values such as `{ priority: 3.14 }` emit `{ priority: undefined }` through the same path. Structure normalization preserves invalid non-object rows while normalizing valid row objects. Added helper regression tests covering object and structure numeric normalization.

DEVANA-KEY: src/admin.tsx:383 | number-subfield-string-persists
DEVANA-SUMMARY: fixed | P2 | medium | Number and integer subfields display string or non-integer stored values and persist them until the user edits the field.
