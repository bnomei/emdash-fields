DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:667 | choices-empty-blocks-options

# Empty choices array blocks options alias fallback

## Finding

`ChoicesField` resolves the choice list with `normalizeChoices(options?.choices ?? options?.options)`. Nullish coalescing only falls through when `choices` is `null` or `undefined`, not when it is an empty array. An empty `choices: []` prevents reading `options.options` entirely and renders the misconfiguration message.

## Violated Invariant Or Contract

`ChoicesOptions` documents both `choices` and `options` as alternate sources for the choice list (`src/types.ts`). Consumers expect both keys to be interchangeable when one is absent or empty.

## Oracle

`ChoicesOptions.choices?: FieldsChoice[] | string[]` and `options?: FieldsChoice[] | string[]` in `src/types.ts`. Line 667 uses `??`, not `||` or length check.

## Counterexample

`options = { choices: [], options: ["alpha", "beta"] }`, `value: null`.

1. `choicesList = normalizeChoices([])` → `[]`.
2. Early return at `!choicesList.length` (673–675) shows `choicesRequiresChoices`.
3. `options.options` is never read; user cannot select a value.

## Why It Might Matter

Schema generators that default `choices` to `[]` while populating `options` produce a broken widget with no choices rendered, even though the alternate key carries valid data.

## Proof

Dataflow trace: `choices: []` is not nullish → `??` does not evaluate `options` → empty list → early return before rendering controls.

## Counterevidence Checked

`choices: []` may mean intentional empty configuration. Types list both keys as peers without explicit fallback semantics; `??` behavior makes `[]` win over `options` by design of the operator.

## Suggested Next Step

Fall back when `choices` is nullish or empty: `normalizeChoices(options?.choices?.length ? options.choices : options?.options)`.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed. `ChoicesField` resolved the list with `options?.choices ?? options?.options`, so a non-nullish empty `choices: []` shadowed the `options` alias and forced the misconfiguration message. Changed to `options?.choices?.length ? options.choices : options?.options` (the report's suggested fix), so the alias supplies items whenever `choices` is absent or empty. Behavior is unchanged when `choices` has items or both are absent. Added an SSR regression test asserting the fallback renders the options and not the "misconfigured" message; full suite (33 tests) passes.

DEVANA-KEY: src/admin.tsx:667 | choices-empty-blocks-options
DEVANA-SUMMARY: fixed | P2 | medium | `choices: []` prevents the `options` alias from supplying choice items because `??` does not treat empty arrays as absent.