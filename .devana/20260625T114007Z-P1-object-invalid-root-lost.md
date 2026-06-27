DEVANA-FINDING: v1
DEVANA-STATE: open | P1 | high | security=no
DEVANA-KEY: src/admin.tsx:179 | object-invalid-root-lost

# Object field replaces invalid root value on first edit

## Finding

`ObjectField` renders invalid non-object root values as `{}`, but the parent state keeps the original value until the user edits a subfield. The first edit calls `updateObjectValue` against a normalized empty object, so the original array or scalar root is replaced by a partial object.

## Violated Invariant Or Contract

Invalid persisted values are normalized for display, but the first mutation should not silently delete the previous root shape without an explicit reset path.

## Oracle

`tests/transformations.test.mjs` documents that `normalizeObjectValue(["title"])` becomes `{}`, but does not trace the widget save path.

## Counterexample

1. Persisted object-field `value: ["title", "Old"]`.
2. `normalizeObjectValue(value)` returns `{}`; all subfields render empty.
3. User types `"New"` into `title`.
4. `updateObjectValue(["title", "Old"], "title", "New")` normalizes to `{}` and returns `{ title: "New" }`.
5. The original array is gone after one keystroke.

## Why It Might Matter

A single subfield edit can destroy recoverable malformed JSON that was still present in storage. Editors may not realize data was dropped because the UI already looked empty.

## Proof

Dataflow trace:

invalid root `value` → `normalizeObjectValue` → `{}` for render → first `onChange` via `updateObjectValue` uses normalized `{}` as base → parent receives new object, original root shape lost.

## Counterevidence Checked

Normalization to `{}` for non-objects is intentional for display. Widget does not write back normalized values on mount, so the loss only happens on first edit, not on load alone.

## Suggested Next Step

Emit a normalized canonical object on mount when the root shape is invalid, or base updates on the raw parent value after explicit migration.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.

DEVANA-KEY: src/admin.tsx:179 | object-invalid-root-lost
DEVANA-SUMMARY: open | P1 | high | First subfield edit replaces an invalid object root with a partial object and drops the original value.