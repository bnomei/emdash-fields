DEVANA-FINDING: v1
DEVANA-STATE: wontfix | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:526 | structure-stale-closure-clobber

# Structure handlers can clobber pending edits from stale render snapshot

## Finding

`StructureField` handlers close over the `items` array from the render that created them. `updateItems(updateStructureItem(items, index, nextItem))`, `removeStructureItem(items, index)`, and similar calls read that snapshot at event time, not the latest parent `value` prop. A second structure action before the parent prop refreshes can recompose from the old array and drop a pending row edit.

## Violated Invariant Or Contract

Each `onChange` from a controlled widget should compose from the current parent-owned value. Writes must not derive payloads from an outdated snapshot after a prior `onChange` already advanced parent state.

## Oracle

`updateStructureItem` tests in `tests/transformations.test.mjs` cover pure helpers in isolation, not widget handler composition across back-to-back events. Distinct from `structure-reorder-wrong-row`, which is an index-key/focus issue.

## Counterexample

Persisted `value: [{ label: "A" }, { label: "B" }]`.

1. Render closes handlers over `items = [{ label: "A" }, { label: "B" }]`.
2. User edits row 0 label to `"A2"` → first `onChange` emits `[{ label: "A2" }, { label: "B" }]`.
3. Before parent `value` prop refreshes, user removes row 1 → `removeStructureItem(items, 1)` uses stale snapshot → emits `[{ label: "A" }]`.
4. Parent last-write-wins keeps `[{ label: "A" }]`; the `"A2"` edit is lost.

## Why It Might Matter

Fast cross-row edit-and-delete sequences, or parents that debounce or batch updates, can silently lose in-flight edits in persisted JSON.

## Proof

Dataflow trace: parent holds updated array after first `onChange` → child handler still reads render-closure `items` → second `onChange` overwrites first with stale-based result.

Locations: `items` at 504; `updateItems` / row handlers at 525–538, 549, 558, 573; `renderObjectFields` uses render-scoped `item` at 452.

## Counterevidence Checked

Synchronous React parents usually re-render before the next discrete event, so many single-step flows stay fresh. `structure-reorder-wrong-row` covers a different mechanism (index keys). No functional updater or `value` re-read at event time exists in source.

## Suggested Next Step

Use functional updates that read the latest `value` prop at event time, or latch pending mutations until props catch up.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: wontfix. The mechanism is real but only under a non-standard parent. `onChange` here is value-based (`(value) => void`, no functional updater), and EmDash drives field widgets as synchronous controlled inputs, so React re-renders between discrete user events and the handler closures always recompose from current state. The clobber requires a parent that defers/batches the `value` prop across two distinct user actions — an integration this widget cannot reliably detect. A correct fix would have to route ALL composition through a mutable value ref updated on every emit: not just the add/remove/move button handlers but every per-row subfield edit flowing through `renderObjectFields` (whose `onChange` merges onto the render-captured row object). A buttons-only ref would fix the report's exact counterexample (edit row 0, then remove row 1) but still drop sequential same-row subfield edits under a deferring parent, giving false confidence. The full refactor carries regression risk disproportionate to a theoretical, parent-dependent edge, so behavior is left as-is. Recommended pattern if revisited: hold `const itemsRef = useRef(items)` synced to the prop each render, update it inside a single `updateItems`, and compose every mutation (including row edits, basing each row merge on `itemsRef.current[index]`) from the ref. Related but distinct: [[structure-reorder-wrong-row]] (invalid; index-key/focus, not stale composition).

DEVANA-KEY: src/admin.tsx:526 | structure-stale-closure-clobber
DEVANA-SUMMARY: wontfix | P2 | medium | Structure row handlers compose `onChange` from a render snapshot and can drop a pending edit if a second action runs before props refresh.