DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:537 | structure-min-gt-max-deadlock

# Structure min greater than max deadlocks the editor

## Finding

When `options.min` exceeds `options.max`, the structure widget can reach a row count where both Add and Remove are disabled simultaneously. The editor cannot move toward satisfying `min` without violating `max`, and no source path warns about or rejects the misconfiguration.

## Violated Invariant Or Contract

When both `min` and `max` are set, the widget should allow some reachable item count within both bounds, or reject invalid configuration. Independent `<= min` / `>= max` checks with no reconciliation create an impossible interactive state.

## Oracle

`StructureOptions` exposes both as optional `number` with no `min <= max` validation. Remove guard: `items.length <= options.min` (537). Add guard: `items.length >= options.max` (572).

## Counterexample

`options: { min: 5, max: 2, fields: [...] }`, `value: []`.

1. User adds rows until add disables at length 2 (`2 >= 2`).
2. At length 2, remove is disabled (`2 <= 5`).
3. Editor is stuck at 2 items while `min` requires 5.

## Why It Might Matter

A single schema typo (`min: 5, max: 2`) makes the structure field uneditable for cardinality changes, blocking content authors without a clear error message.

## Proof

State-transition trace: length 2 with `min: 5, max: 2` → add disabled by max → remove disabled by min → no transition increases or decreases row count.

## Counterevidence Checked

Misconfigured bounds may be treated as author error outside widget scope. Source actively disables both actions rather than ignoring bad config, producing a reachable deadlock in the admin UI.

## Suggested Next Step

Validate `min <= max` when both are set and show a configuration error, or derive effective bounds with `Math.min`/`Math.max`.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed via the report's "derive effective bounds" remedy rather than a config-error message (a hard error would block all editing, and a new i18n key carries locale/test surface). Added a pure exported `effectiveStructureBounds(min, max)` that, when `min > max`, clamps the floor to the ceiling (`{min: max, max: max}`) so the editor settles at exactly `max` instead of locking with both Add and Remove disabled below an unreachable floor. `StructureField` now drives both button `disabled` guards from these reconciled bounds. Valid configs (`min <= max`, or only one set) are unchanged. Added a unit test; typecheck clean; full suite (32 tests) passes. Related: [[structure-min-max-bypass]].

DEVANA-KEY: src/admin.tsx:537 | structure-min-gt-max-deadlock
DEVANA-SUMMARY: fixed | P2 | medium | When `min > max`, structure add and remove can both disable and leave the editor stuck below `min`.