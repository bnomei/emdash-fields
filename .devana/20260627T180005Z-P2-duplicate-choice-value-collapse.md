DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:688 | duplicate-choice-value-collapse

# Duplicate choice values collapse selection and React keys

## Finding

`ChoicesField` keys each choice row with `key={choice.value}` and tracks selection with `selected.has(choice.value)`. When two configured choices share the same `value`, React key collisions occur and both rows share one selection token — checking or unchecking one row affects all rows with that value.

## Violated Invariant Or Contract

Each rendered choice should be an independent selectable option. Distinct labels with the same `value` must not mirror checked state or collapse into one logical token.

## Oracle

`FieldsChoice.value: string` has no uniqueness constraint, but `ChoicesField` uses `value` as both React list key and selection set member. `test/semantics.test.mjs` dedupes DOM ids via index in `choiceInputId`, not selection identity.

## Counterexample

```json
{
  "multiple": true,
  "choices": [
    { "value": "plan-a", "label": "Plan A" },
    { "value": "plan-a", "label": "Plan B" }
  ]
}
```

Stored `value: []`. User checks "Plan B" → `onChange(["plan-a"])`. Both cards render checked. User unchecks "Plan A" → `onChange([])`; both unchecked. User cannot independently select Plan A vs Plan B.

## Why It Might Matter

Misconfigured or generated schemas with duplicate `value`s produce a broken editor where distinct options cannot be controlled separately, and saved arrays cannot represent per-label selection.

## Proof

State trace: duplicate `value` → `key="plan-a"` collision → `Set(["plan-a"])` → `selected.has("plan-a")` true for both rows → single `updateChoiceSelection` token drives all matching rows.

Locations: horizontal layout (688, 683), vertical multiple (740, 744), `normalizeChoiceSelection` Set dedup (248–252).

## Counterevidence Checked

`normalizeChoices` does not enforce unique values. README examples use distinct values but does not forbid duplicates. `choiceInputId` uses index for DOM ids, so id collision is avoided — the bug is selection/key semantics, not id attributes.

## Suggested Next Step

Key rows by index (or generated stable ids) and track selection per row, or reject duplicate `value`s at `normalizeChoices` with a visible configuration error.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed via dedup (the report's second suggested remedy). Independent per-row selection is impossible to fix the other way: the persisted value is an array of value strings, so two choices sharing a value are one logical token and `["plan-a"]` cannot encode "Plan A selected but not Plan B". Keying rows by index would still collapse selection at the storage layer. `normalizeChoices` now drops later duplicate values (first occurrence wins), eliminating the React key collision and the mirrored checked state, and matching how `normalizeChoiceSelection` already dedupes the selection set. The missing-value repair from the choice-missing-value-crash fix is preserved. Added a regression test; typecheck clean; full suite (31 tests) passes. See [[choice-missing-value-crash]].

DEVANA-KEY: src/admin.tsx:688 | duplicate-choice-value-collapse
DEVANA-SUMMARY: fixed | P2 | medium | Duplicate choice `value`s share React keys and one selection token, so distinct labels cannot be toggled independently.