DEVANA-FINDING: v1
DEVANA-STATE: fixed | P1 | high | security=no
DEVANA-KEY: src/admin.tsx:248 | multiple-choice-scalar-lost

# Multiple-choice widget drops scalar stored value on first toggle

## Finding

When `ChoicesField` runs with `multiple: true` but the persisted value is a scalar string (for example `"alpha"`), the first checkbox toggle rebuilds selection from an empty set and emits a new array that omits the previously stored choice.

## Violated Invariant Or Contract

Multiple-choice mode should preserve existing string selections when the user adds or removes another choice. A stored scalar in multiple mode is a realistic legacy shape after toggling `multiple` or importing older JSON.

## Oracle

`updateChoiceSelection` tests in `tests/transformations.test.mjs` cover array inputs only. `normalizeChoiceSelection` is the seed for every toggle path in `ChoicesField`.

## Counterexample

1. Widget options: `{ multiple: true, choices: ["alpha", "beta", "gamma"] }`.
2. Persisted `value: "alpha"`.
3. `normalizeChoiceSelection("alpha", true)` returns `[]` because the value is not an array.
4. User checks `"beta"`.
5. `updateChoiceSelection("alpha", "beta", true, true)` returns `["beta"]`.
6. `"alpha"` is lost from stored JSON without an explicit user action to remove it.

## Why It Might Matter

Editors can unknowingly drop an existing selection the first time they interact with a migrated or misconfigured field. Downstream templates that still expect `"alpha"` will read the wrong value after a single click.

## Proof

Control-flow trace:

`ChoicesField` (`multiple=true`) → `normalizeChoiceSelection(value, true)` → `[]` for scalar input → `updateChoiceSelection` seeds `Set([])` → first `onChange` emits only newly checked values.

## Counterevidence Checked

Multiple-mode filtering of non-string array entries is intentional and tested. No test covers scalar pre-state in multiple mode. The UI never coerces scalar values to arrays on mount.

## Suggested Next Step

Coerce scalar strings to one-element arrays in `normalizeChoiceSelection` when `multiple` is true, or normalize `value` once when `ChoicesField` mounts.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed. Confirmed `normalizeChoiceSelection(scalar, true)` returned `[]`, dropping the stored value on first toggle. `normalizeChoiceSelection` now coerces a scalar string to a one-element array in multiple mode, so `updateChoiceSelection` seeds from the existing selection. Added regression test in tests/transformations.test.mjs; full suite (23 tests) passes.

DEVANA-KEY: src/admin.tsx:248 | multiple-choice-scalar-lost
DEVANA-SUMMARY: fixed | P1 | high | Scalar choice values in multiple mode are discarded on the first checkbox toggle.