DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:669 | choices-multiple-string-false

# Choices widget treats string "false" as multiple mode

## Finding

`ChoicesField` derives multi-select mode with `Boolean(options?.multiple)`. In serialized JSON, `"multiple": "false"` is a non-empty string and is therefore truthy in JavaScript. The widget enters checkbox/multi mode and emits array payloads even when the schema author intended single-select.

## Violated Invariant Or Contract

`ChoicesOptions.multiple` is a boolean flag (`src/types.ts`). `multiple: false` must select radio/single mode and scalar `onChange` strings.

## Oracle

`ChoicesOptions.multiple?: boolean` in `src/types.ts`. `Boolean("false") === true` is standard JavaScript semantics. Distinct from `boolean-string-false-checked`, which affects boolean subfields via `Boolean(value)` at render time.

## Counterexample

Schema options: `{ "multiple": "false", "choices": ["alpha", "beta"] }` (string, not boolean).

1. `ChoicesField` sets `multiple = true`.
2. Widget renders checkboxes instead of radios.
3. User selects `"alpha"`.
4. `onChange(["alpha"])` instead of `onChange("alpha")`.

## Why It Might Matter

Hand-edited YAML/JSON configs often quote booleans as strings. Frontend templates expecting a scalar choice string receive an array, breaking conditionals and display logic after a seemingly correct schema fix.

## Proof

Contract mismatch: caller supplies `multiple: "false"` (string) → `Boolean(options?.multiple)` → `true` → `updateChoiceSelection(..., true)` → array payloads for the session.

Location: `ChoicesField` line 669.

## Counterevidence Checked

TypeScript types `multiple` as `boolean` only; no runtime coercion in this package. Tests (`test/semantics.test.mjs`) use boolean `multiple: true`. EmDash may coerce options before props reach the widget — not visible in this repo.

## Suggested Next Step

Normalize with strict boolean parsing (`options?.multiple === true`) or reject non-boolean `multiple` at the widget boundary.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed. `ChoicesField` now derives `multiple` via a shared `coerceBoolean(options?.multiple)` instead of `Boolean(...)`, so quoted booleans from serialized config are parsed correctly: `"false"`/`"0"`/`""` → single mode, `"true"`/`"1"`/`true` → multi mode. Note the report's suggested strict `=== true` was not used because it would also break the (equally common) quoted `"true"` case by forcing single mode. The coercion logic is shared with the boolean-subfield checkbox fix: `coerceBoolean` is the implementation and `isBooleanChecked` delegates to it. Added a regression test; typecheck clean; full suite (28 tests) passes. See [[boolean-string-false-checked]].

DEVANA-KEY: src/admin.tsx:669 | choices-multiple-string-false
DEVANA-SUMMARY: fixed | P2 | medium | String `"false"` for `options.multiple` enables multi-select mode and array payloads because `Boolean("false")` is true.