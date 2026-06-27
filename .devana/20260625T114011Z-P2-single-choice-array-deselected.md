DEVANA-FINDING: v1
DEVANA-STATE: open | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:255 | single-choice-array-deselected

# Single-choice widget ignores array stored values

## Finding

When `ChoicesField` runs with `multiple: false`, a persisted array value such as `["alpha"]` is treated as unselected. The UI shows no checked choice, but the parent state keeps the array until the user picks a new option.

## Violated Invariant Or Contract

Single-choice mode should either coerce a one-element array to its string value or surface the stored selection. Showing an empty selection while the parent still holds an array breaks the widget's read/write contract.

## Oracle

`normalizeChoiceSelection` and `ChoicesField` radio rendering (`value={typeof value === "string" ? value : ""}`). Tests cover scalar single-mode values only.

## Counterexample

1. Widget options: `{ choices: ["alpha", "beta"], multiple: false }`.
2. Persisted `value: ["alpha"]`.
3. `normalizeChoiceSelection(["alpha"], false)` returns `[]`.
4. `Radio.Group` receives `value=""`; nothing appears selected.
5. User saves without choosing again; parent state can remain `["alpha"]`.

## Why It Might Matter

Legacy multiple-choice data or config changes from `multiple: true` to `false` leave the field looking blank while stored JSON still contains an array. Frontend consumers and the admin UI disagree about the current value.

## Proof

Contract mismatch:

stored `string[]` in single mode → `normalizeChoiceSelection` accepts only `string` → empty selection in UI → no mount-time write-back → array persists unchanged.

## Counterevidence Checked

Multiple-mode non-string filtering is intentional and tested. The UI never normalizes legacy shapes on mount. Horizontal and vertical choice renderers share the same selection normalization.

## Suggested Next Step

When `multiple` is false, coerce a one-element string array to its sole element for display and initial `onChange` normalization.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.

DEVANA-KEY: src/admin.tsx:255 | single-choice-array-deselected
DEVANA-SUMMARY: open | P2 | medium | Single-choice fields show no selection for array stored values while the array remains in parent state.