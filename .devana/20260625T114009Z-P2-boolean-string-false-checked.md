DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:404 | boolean-string-false-checked

# Boolean subfield treats string "false" as checked

## Finding

Object and structure boolean subfields render `checked={Boolean(value)}` without coercing stored JSON to a real boolean. The string `"false"` is truthy in JavaScript, so the checkbox appears checked while the persisted value remains the string `"false"`.

## Violated Invariant Or Contract

README documents boolean subfields as storing a `Boolean`. The UI should reflect boolean semantics for persisted values, not generic truthiness.

## Oracle

README stored-value table (`boolean` → `Boolean`). `renderSubField` boolean branch in `src/admin.tsx`.

## Counterexample

1. Object subfield `enabled` has persisted value `"false"`.
2. `Boolean("false")` evaluates to `true`.
3. Checkbox renders checked.
4. User saves another subfield without toggling `enabled`.
5. Stored JSON still contains `"false"`, and the UI remains checked.

## Why It Might Matter

Imported or hand-edited JSON with string booleans shows the opposite state from what consumers expect. Frontend code comparing against `false` will disagree with the admin UI.

## Proof

Counterexample value:

`{ enabled: "false" }` → `renderSubField` boolean branch → `checked={Boolean("false")}` → checked UI with string payload unchanged.

## Counterevidence Checked

No boolean normalization exists in `normalizeObjectValue` or mutators. The field only writes a real boolean after the user toggles the checkbox. Numeric truthy values such as `1` have the same display bug.

## Suggested Next Step

Normalize boolean subfield values with strict boolean parsing (`value === true || value === "true"`) before rendering and optionally on load.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed. The boolean subfield branch now uses a new exported `isBooleanChecked(value)` helper instead of `Boolean(value)`. Strings are interpreted strictly (`"true"`/`"1"` → checked; `"false"`/`"0"`/`""` → unchecked, case/whitespace-insensitive); non-string values keep `Boolean()` semantics. Added a regression test covering string/number/boolean/null inputs. Full suite (24 tests) passes.

DEVANA-KEY: src/admin.tsx:404 | boolean-string-false-checked
DEVANA-SUMMARY: fixed | P2 | medium | String "false" in boolean subfields renders as checked because the widget uses Boolean(value).