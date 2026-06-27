DEVANA-FINDING: v1
DEVANA-STATE: invalid | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:520 | structure-reorder-wrong-row

# Structure reorder can edit the wrong row after move or delete

## Finding

`StructureField` uses `key={index}` for each row and binds row edits to the row index from the render that created the handler. After reordering or deleting another row, focus can remain on the same DOM position while the item at that index changes, so subsequent typing updates a different row than the one the editor was working on.

## Violated Invariant Or Contract

Row identity should follow item content through reorder and removal. Index-keyed rows plus index-scoped `updateStructureItem(items, index, ...)` break that invariant when the list order changes between render and edit.

## Oracle

Standard React list-key guidance and controlled-field behavior for sortable editors.

## Counterexample

1. Structure value `[{ title: "A" }, { title: "B" }, { title: "C" }]`.
2. Editor focuses the `title` input in row B at index `1`.
3. Editor clicks Up on row B; `moveStructureItem(items, 1, 0)` yields `[B, A, C]`.
4. React reuses the component at `key={1}`, which now displays item A.
5. Focus remains in index `1`'s input; further typing calls `updateStructureItem(items, 1, ...)` against the stale render snapshot and writes into item A instead of B.

## Why It Might Matter

Sortable structure lists can silently corrupt row data during a common reorder workflow. The visible values may look plausible because controlled props match the row currently at that index, but the editor's intent was applied to the wrong item.

## Proof

State transition mismatch:

focus on row index `1` → reorder changes item at index `1` → same index key and handler target index `1` → subsequent `onChange` updates the wrong item.

## Counterevidence Checked

Sequential edits without reorder keep indices stable and behave correctly. Pure helpers such as `moveStructureItem` are immutable and correct in isolation. The bug requires reorder/remove between focus and the next edit event.

## Suggested Next Step

Use stable row keys derived from item identity or an internal row id, and resolve the target row by id instead of render-time index.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-25: open by Devana. Initial report written from static source inspection.
- 2026-06-27: invalid. The data-corruption mechanism (a "stale render snapshot" handler writing to the wrong item) does not occur here. `StructureField` keeps no per-row local state: `items` is recomputed from props on every render, the kumo `Input`/`Textarea` are fully controlled via `value`, and `renderSubField`/`renderObjectFields` are pure. After `moveStructureItem` re-renders the component, `.map` re-runs and every input receives a fresh `onChange` closure bound to the current `items` and `index`, so the input at a given slot always displays AND edits the item currently at that slot — consistent, not corrupting. Counterexample step 5 ("writes into A instead of B") is therefore false: there is no persisted stale closure across renders. Separately, reorder is triggered by clicking the Up/Down `Button`, which moves focus to the button, so the premise "focus remains in the input" cannot arise through the provided UI. Index keys are non-ideal style but harmless with controlled inputs; a stable-id refactor would add a parallel-state-sync surface with no correctness benefit here.

DEVANA-KEY: src/admin.tsx:520 | structure-reorder-wrong-row
DEVANA-SUMMARY: invalid | P2 | medium | Index-keyed structure rows can apply edits to the wrong item after reorder or delete while focus stays on the same slot.