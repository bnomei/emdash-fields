DEVANA-FINDING: v1
DEVANA-STATE: fixed | P3 | medium | security=no
DEVANA-KEY: src/admin.tsx:242 | choice-missing-value-crash

# Choice object without `value` crashes the whole choices widget

## Finding

`normalizeChoices` normalizes *string* choices into `{ value, label }`, but passes
*object* choices through unchanged:

```ts
export function normalizeChoices(value?: FieldsChoice[] | string[]): FieldsChoice[] {
  return (value ?? []).map((choice) =>
    typeof choice === "string" ? { value: choice, label: choice } : choice,
  );
}
```

So a choice object that omits `value` (e.g. `{ label: "X" }`) survives with
`choice.value === undefined`. Downstream, `ChoicesField` renders it through
`choiceInputId(id, choice.value, index)` at `src/admin.tsx:684` (horizontal) and
`src/admin.tsx:737` (vertical multiple), and `choiceInputId` does:

```ts
function choiceInputId(id: string, value: string, index: number) {
  const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, "-") || "choice";
  ...
}
```

`undefined.replace(...)` throws `TypeError: Cannot read properties of undefined`,
which propagates out of render and crashes the entire field widget (and any
parent that does not catch it), not just the malformed row. In the single
(non-multiple, non-horizontal) `Radio.Group` branch it does not throw but renders
a `Radio.Item` with `value={undefined}`, producing a non-selectable, broken option.

## Violated Invariant Or Contract

`normalizeChoices` is named and used as the normalization boundary for choices:
its return type is `FieldsChoice[]`, and every consumer assumes each element has a
string `value` (used as React `key`, DOM `id` seed, and selection key). The
function enforces this for string inputs but not for object inputs, so the
post-normalization invariant "every choice has a string `value`" does not hold.

## Oracle

- Neighboring implementation: the string branch of `normalizeChoices` itself
  synthesizes `value`, showing the intended contract is "produce a usable
  `value`". The object branch silently breaks that.
- `choiceInputId` (`src/admin.tsx:292`) types its second parameter as `string`
  and calls `.replace` on it with no guard — it trusts the normalization step.
- `FieldsChoice` (`src/types.ts:13`) declares `value: string` as required, so all
  downstream code assumes it is present.

## Counterexample

Schema config authored as serialized JSON/YAML (where TypeScript's required
`value` is not enforced):

```json
{
  "widget": "fields:choices",
  "options": { "choices": [{ "label": "Workers AI", "icon": "AI" }] }
}
```

Rendering this widget in the default (multiple) or horizontal layout throws
`TypeError` at `choiceInputId` and the admin field crashes on first paint.

## Why It Might Matter

A single mistyped choice (missing `value`) takes down the whole admin field
widget rather than degrading that one option. The README documents authoring
choices in serialized JSON schema, where the TypeScript `value: string`
requirement provides no protection, so this is reachable from ordinary
content-model authoring. Availability/correctness impact on the admin UI.

## Proof

Dataflow trace: `options.choices` (object missing `value`) ->
`normalizeChoices` object branch returns it unmodified (`src/admin.tsx:244`) ->
`ChoicesField` maps choices and calls `choiceInputId(id, choice.value, index)`
(`src/admin.tsx:684` / `:737`) -> `value.replace(...)` on `undefined`
(`src/admin.tsx:293`) -> `TypeError` escapes render.

## Counterevidence Checked

- `FieldsChoice.value` is typed required, so well-typed TS callers cannot hit
  this. Counter: EmDash schema config is commonly serialized JSON/YAML (README
  "Examples" / "Choice Icons" sections show JSON choices), where the type guard
  does not apply; the string branch's own value-synthesis shows loose input was
  anticipated.
- Single (`Radio.Group`) branch does not call `choiceInputId`, so it does not
  crash — but it still renders a broken, non-selectable item, so the invariant
  violation is real across all three layouts.
- Strongest reason this might be false: it is arguably "garbage-in" config error
  rather than a logic defect. It is kept P3 for that reason, but the asymmetry
  with the string branch and the hard crash (vs. graceful skip) make it
  actionable.

## Suggested Next Step

In `normalizeChoices`, drop or repair object choices lacking a string `value`
(e.g. filter them out, or default `value` from `label`), or guard
`choiceInputId` against a non-string `value`. Smallest fix: coerce/guard in
`normalizeChoices` so the post-normalization invariant holds for all branches.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed. Confirmed `normalizeChoices` passed object choices through untouched, so `{label:"X"}` reached `choiceInputId(id, undefined, index)` → `undefined.replace(...)` → TypeError crashing the widget in the horizontal/multiple layouts (and a broken non-selectable item in single mode). `normalizeChoices` now enforces the post-normalization invariant "every choice has a string `value`": object choices with a string value pass through; those missing it synthesize a value from a string `label` (mirroring the string branch); otherwise the malformed choice is dropped via `flatMap` so one bad option degrades gracefully instead of crashing. Added regression tests; typecheck clean; full suite (26 tests) passes.

DEVANA-KEY: src/admin.tsx:242 | choice-missing-value-crash
DEVANA-SUMMARY: fixed | P3 | medium | A choice object missing `value` survives normalizeChoices and crashes the choices widget at choiceInputId in two of three layouts.
