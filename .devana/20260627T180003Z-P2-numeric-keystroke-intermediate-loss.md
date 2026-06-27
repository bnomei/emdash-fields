DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:358 | numeric-keystroke-intermediate-loss

# Number and integer subfields reject in-progress numeric input

## Finding

Object and structure subfields of type `number` or `integer` parse the full input string on every `change` event via `parseNumericInput` and immediately write the parsed result back as the controlled `value`. Valid intermediate typing states are converted or rejected, blocking decimal entry digit-by-digit and wiping integer fields on partial decimals. A lone minus sign for negative integers is also rejected.

## Violated Invariant Or Contract

README documents `number` and `integer` subfields as storing a `Number`, or `undefined` when empty. Editors must allow users to reach valid negative and decimal numbers through normal keyboard entry, not only paste.

## Oracle

`tests/numeric-input.test.mjs` validates `parseNumericInput` on finished strings (including `"-9007199254740991"`) but not per-keystroke widget flow. `readInputValue` always calls `parseNumericInput` for `type="number"` inputs (350–361). Controlled `value` at line 383 re-renders from parent state after each parse.

## Counterexample

**Decimal on `number` subfield:** User types `3` then `.` to enter `3.14`. `parseNumericInput("3.", "number")` returns `3`; controlled input shows `3`; the decimal separator cannot be entered.

**Integer wipe:** Stored `count: 12`, user edits toward `13` but transiently produces `"12.3"`. `parseNumericInput("12.3", "integer")` returns `undefined`; `onChange(undefined)` clears the field.

**Negative integer:** Empty integer field, user types `-` first. `parseNumericInput("-", "integer")` → `Number("-")` is `NaN` → `undefined`; minus is dropped before trailing digits.

## Why It Might Matter

Editors cannot reliably enter decimals or negative integers by typing. Existing integer values can be erased by a single mistyped decimal keystroke, causing silent data loss before save.

## Proof

Dataflow trace: keystroke → `readInputValue` → `parseNumericInput` → `onChange(parsed)` → controlled `value` re-render removes in-progress string state.

Locations: `parseNumericInput` (333–347), `readInputValue` (358–359), `renderSubField` `commonProps.value` (383–385).

## Counterevidence Checked

Pasting a complete value like `3.14` or `-5` in one event succeeds. `tests/numeric-input.test.mjs` covers finished strings only. Some browsers may not surface invalid partials to `onChange`, but the widget layer always parses on change with no draft-state buffer.

## Suggested Next Step

Keep a local string draft for numeric inputs and commit parsed numbers on blur or when `parseNumericInput` matches the full input without truncation.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed. Number/integer subfields now render via a new `NumericSubField` component that holds a local string draft (the report's suggested fix). The input is `type="text"` with `inputMode` set ("numeric"/"decimal") so the browser cannot sanitize an in-progress draft away — a controlled `type=number` literally cannot display "3." or "-". The pure, exported `numericChangeCommit(raw, type)` decides the action: `clear` on empty, `set` on a complete valid number, and `hold` (no onChange) for in-progress invalid drafts ("-" , and "12.3" on an integer field) so existing values are never wiped. The draft preserves the visible string while the committed value tracks the parsed number, so decimals/negatives can be typed digit-by-digit; on blur the draft re-syncs to the committed value to clean up dangling separators. A `useEffect` reconciles external value changes into the draft without clobbering active typing. Tradeoff: native number spinners are gone (text input), but `parseNumericInput` still enforces integer/number validity. Added unit tests for `numericChangeCommit`; the SSR semantics test (number subfield) still renders with zero Kumo warnings; typecheck clean; full suite (29 tests) passes.

DEVANA-KEY: src/admin.tsx:358 | numeric-keystroke-intermediate-loss
DEVANA-SUMMARY: fixed | P2 | medium | Per-keystroke numeric parsing blocks decimal and negative entry and can wipe integer values on partial decimals.