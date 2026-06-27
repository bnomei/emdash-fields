DEVANA-FINDING: v1
DEVANA-STATE: open | P1 | high | security=no
DEVANA-KEY: src/admin.tsx:596 | link-invalid-root-lost

# Link field first edit drops invalid scalar root

## Finding

When a link field's persisted value is a non-object root (for example a bare URL string), the widget normalizes it to `{}` for display but merges edits against that empty object instead of the original root. The first subfield edit replaces the stored value with a partial object and silently discards the original payload.

## Violated Invariant Or Contract

`updateLinkValue` is exported as a deterministic link transformer (`CHANGELOG.md`, `tests/transformations.test.mjs`). A user edit should extend the current stored value, not replace an invalid root with a smaller object on the first keystroke.

## Oracle

`tests/transformations.test.mjs` covers `normalizeLinkValue("bad")` → `{}` and valid merges, but not the widget save path. `LinkField` reads via `normalizeLinkValue(value)` and writes via `updateLinkValue(data, nextValue)` where `data` is the normalized render snapshot.

## Counterexample

1. Persisted link field value: `"https://example.com"` (scalar string root).
2. `LinkField` renders with `data = {}`; value/text inputs appear empty.
3. User types link text `"Home"` without touching the value input.
4. `onChange` emits `{ text: "Home" }`.
5. Original `"https://example.com"` is gone after one edit.

## Why It Might Matter

Imported or legacy JSON with scalar link roots can lose URLs or other metadata the editor never surfaced, causing silent data loss on the first save after opening the entry.

## Proof

Control-flow trace: invalid root `value` → `normalizeLinkValue` → `{}` at render → `update({ text })` calls `updateLinkValue(data, { text })` with normalized `data`, not raw `value` → parent receives `{ text: "Home" }` instead of merged link object.

Locations: `normalizeLinkValue` (234–236), `updateLinkValue` (238–240), `LinkField` closure `data` and `update` (596–601).

## Counterevidence Checked

`normalizeLinkValue("bad")` → `{}` is intentional helper behavior. No mount-time write-back occurs, so data survives until first edit — same class as `object-invalid-root-lost`, but this is a separate `LinkField` code path not covered by that report.

## Suggested Next Step

Align `LinkField.update` with `updateLinkValue(value, nextValue)` using the raw prop, or seed an initial normalized object via `onChange` on mount when the root is invalid.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.

DEVANA-KEY: src/admin.tsx:596 | link-invalid-root-lost
DEVANA-SUMMARY: open | P1 | high | First link subfield edit replaces an invalid scalar root with a partial object and drops the original value.